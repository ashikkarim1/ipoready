import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { sendTrialExpiredEmail } from '@/lib/billing-notifications'
import { handleTrialExpiry, processPendingRetries } from '@/lib/trial-auto-upgrade'

/**
 * Trial Expiry Webhook Handler
 * 
 * No billing collection during trial period — runs nightly (via cron job) to:
 * 1. Find all companies where trial_end_date <= TODAY and trial_status = 'active'
 * 2. For each expired trial:
 *    - Set trial_status = 'expired'
 *    - Send email: "Your trial has expired. Upgrade now: [checkout link]"
 *    - User completes payment at checkout for the first time
 * 3. Log all actions with count summary
 * 
 * Verify cron secret via Authorization header to prevent unauthorized invocations.
 * 
 * Usage:
 *   curl -X POST http://localhost:3000/api/webhooks/trial \
 *     -H "Authorization: Bearer your-cron-secret" \
 *     -H "Content-Type: application/json" \
 *     -d '{"action":"check_expiry"}'
 */

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret from Authorization header
    const authHeader = request.headers.get('authorization');
    const expectedSecret = `Bearer ${process.env.CRON_SECRET}`;
    
    if (!authHeader || authHeader !== expectedSecret) {
      console.error('❌ Unauthorized trial webhook access attempt');
      return NextResponse.json(
        { error: 'Unauthorized: Invalid cron secret' },
        { status: 401 }
      );
    }

    const stats = {
      checkedCount: 0,
      expiredCount: 0,
      errorCount: 0,
    };

    // Query all expired trials that are still marked as active
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const expiredTrials = await sql`
      SELECT
        id,
        company_name,
        email,
        stripe_customer_id,
        trial_plan,
        trial_end_date
      FROM companies
      WHERE trial_status = 'active'
        AND trial_end_date <= ${today}::DATE
      ORDER BY trial_end_date ASC
    `;

    stats.checkedCount = expiredTrials.length;
    console.log(`🔍 Found ${stats.checkedCount} expired trials to process`);

    // Process each expired trial using auto-upgrade system
    for (const trial of expiredTrials) {
      try {
        const companyId = trial.id;
        const companyEmail = trial.email;

        console.log(`⏭️  Processing trial expiry for ${trial.company_name} (${companyId})`);

        // Use auto-upgrade system which handles:
        // 1. If payment method exists: create Stripe subscription
        // 2. If payment fails: queue for retry with exponential backoff
        // 3. If no payment method: mark as expired and send email
        const result = await handleTrialExpiry(companyId);

        if (result.success) {
          console.log(`✅ Trial upgraded to subscription: ${result.subscriptionId}`);
          stats.expiredCount++;
        } else if (result.retryQueued) {
          console.log(
            `⏳ Trial upgrade queued for retry: ${result.error}`
          );
          stats.expiredCount++; // Count as processed (will retry)
        } else {
          // Trial expired without payment method
          console.log(`✅ Trial expired (no payment method): ${companyId}`);
          stats.expiredCount++;
        }
      } catch (error) {
        console.error(`❌ Error processing trial ${trial.id}:`, error);
        stats.errorCount++;
      }
    }

    console.log(
      `📊 Trial expiry cron completed: ${stats.expiredCount} trials expired, ` +
      `${stats.errorCount} errors`
    );

    return NextResponse.json(
      {
        status: 'success',
        message: 'Trial expiry check completed',
        stats: {
          checkedCount: stats.checkedCount,
          expiredCount: stats.expiredCount,
          errorCount: stats.errorCount,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Fatal error in trial webhook handler:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * GET handler for manual testing or monitoring
 * Returns current active trials and upcoming expirations
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const expectedSecret = `Bearer ${process.env.CRON_SECRET}`;
    
    if (!authHeader || authHeader !== expectedSecret) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid cron secret' },
        { status: 401 }
      );
    }

    // Get all active trials with days remaining
    const activeTrials = await sql`
      SELECT
        id,
        company_name,
        trial_start_date,
        trial_end_date,
        trial_status,
        EXTRACT(DAY FROM trial_end_date - CURRENT_DATE)::INT as days_remaining,
        CASE
          WHEN EXTRACT(DAY FROM trial_end_date - CURRENT_DATE)::INT <= 0 THEN 'EXPIRED'
          WHEN EXTRACT(DAY FROM trial_end_date - CURRENT_DATE)::INT <= 3 THEN 'EXPIRING_SOON'
          WHEN EXTRACT(DAY FROM trial_end_date - CURRENT_DATE)::INT <= 7 THEN 'EXPIRING_WEEK'
          ELSE 'ACTIVE'
        END as urgency,
        stripe_customer_id is not null as has_stripe_customer
      FROM companies
      WHERE trial_status IN ('active', 'expired')
      ORDER BY trial_end_date ASC
    `;

    return NextResponse.json(
      {
        total_trials: activeTrials.length,
        trials: activeTrials,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error fetching trial status:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
