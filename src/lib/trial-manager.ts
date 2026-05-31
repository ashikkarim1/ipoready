import { neon } from "@neondatabase/serverless";
import { sendTrialExpiryReminder } from "./billing-notifications";

const sql = neon(process.env.DATABASE_URL!);

/**
 * Initialize trial for a company after lead capture
 * Called when user completes /trial/cap-table-setup
 */
export async function initializeTrial(
  leadCaptureId: string,
  fundingStage: "seed" | "series_a" | "series_b" | "series_c" | "growth" | "pre_ipo",
  companyId: string,
  planAfterTrial: string = "growth"
) {
  const today = new Date();
  const trialEndDate = new Date(today);
  trialEndDate.setDate(trialEndDate.getDate() + 14);

  // Update company with trial data
  const result = await sql`
    UPDATE companies
    SET
      trial_start_date = ${today.toISOString().split("T")[0]},
      trial_end_date = ${trialEndDate.toISOString().split("T")[0]},
      trial_plan = ${planAfterTrial},
      trial_status = 'active',
      subscription_status = 'trialing'
    WHERE id = ${companyId}
    RETURNING trial_start_date, trial_end_date, trial_status, email
  `;

  if (result.length === 0) {
    throw new Error(`Company ${companyId} not found`);
  }

  // Link lead capture to trial company
  await sql`
    UPDATE lead_captures
    SET
      trial_company_id = ${companyId},
      user_id = NULL,
      status = 'converted_to_trial'
    WHERE id = ${leadCaptureId}
  `;

  return {
    companyId,
    trialStartDate: result[0].trial_start_date,
    trialEndDate: result[0].trial_end_date,
    trialStatus: result[0].trial_status,
    daysRemaining: 14,
  };
}

/**
 * Legacy initialization (still used by webhooks)
 */
export async function initializeTrialLegacy(
  companyId: string,
  planAfterTrial: string = "growth"
) {
  const today = new Date();
  const trialEndDate = new Date(today);
  trialEndDate.setDate(trialEndDate.getDate() + 14);

  const result = await sql`
    UPDATE companies
    SET
      trial_start_date = ${today.toISOString().split("T")[0]},
      trial_end_date = ${trialEndDate.toISOString().split("T")[0]},
      trial_plan = ${planAfterTrial},
      trial_status = 'active',
      subscription_status = 'trialing'
    WHERE id = ${companyId}
    RETURNING trial_start_date, trial_end_date, trial_status
  `;

  return {
    trialStartDate: result[0].trial_start_date,
    trialEndDate: result[0].trial_end_date,
    trialStatus: result[0].trial_status,
    daysRemaining: 14,
  };
}

export async function getTrialStatus(companyId: string) {
  const result = await sql`
    SELECT
      trial_start_date,
      trial_end_date,
      trial_status,
      trial_plan,
      subscription_status
    FROM companies
    WHERE id = ${companyId}
  `;

  if (!result[0]) return null;

  const company = result[0];
  if (!company.trial_end_date) return null;

  const today = new Date();
  const endDate = new Date(company.trial_end_date);
  const daysRemaining = Math.ceil(
    (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    trialStartDate: company.trial_start_date,
    trialEndDate: company.trial_end_date,
    trialStatus: company.trial_status,
    trialPlan: company.trial_plan,
    subscriptionStatus: company.subscription_status,
    daysRemaining: Math.max(0, daysRemaining),
    isExpired: daysRemaining < 0,
  };
}

/**
 * Check if trial is expired and handle accordingly
 * Used by the /api/webhooks/trial cron job
 */
export async function checkAndHandleTrialExpiry(companyId: string) {
  const status = await getTrialStatus(companyId);

  if (!status || !status.isExpired) return null;

  if (status.trialStatus === "upgraded") {
    return { action: "already_upgraded" };
  }

  // Check if company has stripe customer and can auto-upgrade
  const company = await sql`
    SELECT stripe_customer_id, email, name FROM companies WHERE id = ${companyId}
  `;

  if (!company.length) {
    return { action: "company_not_found" };
  }

  const { stripe_customer_id, email, name } = company[0] as any;

  if (stripe_customer_id) {
    // Auto-upgrade: create subscription for the trial plan
    // Stripe webhook will handle the actual subscription creation
    return {
      action: "auto_upgrade_available",
      stripeCustomerId: stripe_customer_id,
      planAfterTrial: status.trialPlan,
    };
  } else {
    // No payment method: deactivate subscription and send email
    await sql`
      UPDATE companies
      SET
        trial_status = 'expired',
        subscription_status = 'expired'
      WHERE id = ${companyId}
    `;

    // Send trial expired email with upgrade prompt
    try {
      const { sendTrialExpiredEmail } = await import("./billing-notifications");
      await sendTrialExpiredEmail(email, name);
    } catch (error) {
      console.error(`Failed to send trial expired email for ${companyId}:`, error);
    }

    return {
      action: "expired_no_payment_method",
      requiresManualFollowUp: true,
    };
  }
}

/**
 * Check if trial is expiring tomorrow (1 day remaining) and send reminder
 */
export async function checkForTrialExpiryReminder(): Promise<
  { checked: number; reminded: number; errors: number }
> {
  const stats = {
    checked: 0,
    reminded: 0,
    errors: 0,
  };

  // Find all trials expiring tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const expiringTrials = await sql`
    SELECT id, email, name FROM companies
    WHERE trial_status = 'active'
      AND trial_end_date = ${tomorrowStr}::DATE
  `;

  stats.checked = expiringTrials.length;

  for (const trial of expiringTrials) {
    try {
      const { email, name } = trial as any;
      await sendTrialExpiryReminder(email, name, 1);
      stats.reminded++;
    } catch (error) {
      console.error(`Failed to send reminder for trial ${(trial as any).id}:`, error);
      stats.errors++;
    }
  }

  return stats;
}

export async function handleTrialUpgrade(
  companyId: string,
  stripePriceId: string
) {
  // Mark trial as upgraded
  const result = await sql`
    UPDATE companies
    SET
      trial_status = 'upgraded',
      trial_converted_at = NOW(),
      subscription_status = 'active'
    WHERE id = ${companyId}
    RETURNING trial_conversion_plan
  `;

  return {
    upgraded: true,
    stripePriceId,
    companyId,
  };
}

export async function getTrialCountdownData(companyId: string) {
  const status = await getTrialStatus(companyId);

  if (!status || status.trialStatus !== "active") {
    return null;
  }

  const percentage = Math.max(
    0,
    Math.round((status.daysRemaining / 14) * 100)
  );

  return {
    daysRemaining: status.daysRemaining,
    percentage,
    trialPlan: status.trialPlan,
    isLastDay: status.daysRemaining <= 1,
  };
}
