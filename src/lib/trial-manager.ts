'use strict'

/**
 * Trial Period Manager
 * Handles the complete trial lifecycle: creation, expiry checks, and auto-upgrade flow
 */

import { sql } from '@/lib/db'
import { getStripe, PRICE_IDS, PLAN_NAMES } from '@/lib/stripe'
import {
  sendTrialExpiringEmail,
  sendTrialUpgradedEmail,
} from '@/lib/billing-notifications'

interface CompanyTrialData {
  id: string
  email: string
  name: string
  trial_start_date: string | null
  trial_end_date: string | null
  trial_status: 'not_started' | 'active' | 'expired' | 'upgraded'
  trial_plan: string
  trial_converted_at: string | null
  trial_conversion_plan: string | null
  stripe_customer_id: string | null
  subscription_id: string | null
  subscription_status: string | null
  current_period_end: string | null
}

interface TrialStatusResponse {
  trial_status: string
  trial_plan: string
  days_remaining: number
  trial_end_date: string | null
}

interface TrialExpiryCheckResult {
  checked_count: number
  email_sent_count: number
}

interface TrialUpgradeResult {
  upgraded: boolean
  message: string
  subscription_id?: string
}

interface TrialCountdownData {
  daysRemaining: number
  percentage: number
  trialPlan: string
  isLastDay: boolean
}

// ─── Helper: Calculate days remaining ──────────────────────────────────────
export function calculateTrialDaysRemaining(
  trialEndDate: string | Date | null
): number {
  if (!trialEndDate) return 0

  const endDate =
    typeof trialEndDate === 'string' ? new Date(trialEndDate) : trialEndDate

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  endDate.setHours(0, 0, 0, 0)

  const msPerDay = 24 * 60 * 60 * 1000
  const daysRemaining = Math.ceil(
    (endDate.getTime() - today.getTime()) / msPerDay
  )

  return Math.max(0, daysRemaining)
}

// ─── Function 1: Initialize Trial ──────────────────────────────────────────
export async function initializeTrial(
  companyId: string,
  planAfterTrial: string = 'growth'
): Promise<{
  trial_start_date: string
  trial_end_date: string
  trial_days_remaining: number
}> {
  try {
    // Verify company exists
    const companies = await sql`
      SELECT id FROM companies WHERE id = ${companyId}
    `

    if (companies.length === 0) {
      throw new Error(`Company not found: ${companyId}`)
    }

    // Calculate trial dates
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const trialStartDate = today.toISOString().split('T')[0]

    const endDate = new Date(today)
    endDate.setDate(endDate.getDate() + 14)
    const trialEndDate = endDate.toISOString().split('T')[0]

    // Update company with trial information
    await sql`
      UPDATE companies
      SET
        trial_start_date = ${trialStartDate}::date,
        trial_end_date = ${trialEndDate}::date,
        trial_status = 'active',
        trial_plan = ${planAfterTrial.toLowerCase()},
        subscription_status = 'trialing',
        updated_at = NOW()
      WHERE id = ${companyId}
    `

    const daysRemaining = calculateTrialDaysRemaining(trialEndDate)

    console.log(
      `[trial-manager] Initialized trial for ${companyId}: ${trialStartDate} to ${trialEndDate}`
    )

    return {
      trial_start_date: trialStartDate,
      trial_end_date: trialEndDate,
      trial_days_remaining: daysRemaining,
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[trial-manager] Failed to initialize trial:`, errorMsg)
    throw err
  }
}

// ─── Function 2: Get Trial Status ──────────────────────────────────────────
export async function getTrialStatus(
  companyId: string
): Promise<TrialStatusResponse> {
  try {
    const companies = await sql`
      SELECT
        trial_status,
        trial_plan,
        trial_end_date
      FROM companies
      WHERE id = ${companyId}
    `

    if (companies.length === 0) {
      throw new Error(`Company not found: ${companyId}`)
    }

    const company = companies[0] as CompanyTrialData
    const daysRemaining = calculateTrialDaysRemaining(company.trial_end_date)

    return {
      trial_status: company.trial_status || 'not_started',
      trial_plan: company.trial_plan || 'growth',
      days_remaining: daysRemaining,
      trial_end_date: company.trial_end_date,
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[trial-manager] Failed to get trial status:`, errorMsg)
    throw err
  }
}

// ─── Get Trial Countdown Data (for UI components) ─────────────────────────
export async function getTrialCountdownData(
  companyId: string
): Promise<TrialCountdownData> {
  try {
    const companies = await sql`
      SELECT
        trial_status,
        trial_plan,
        trial_start_date,
        trial_end_date
      FROM companies
      WHERE id = ${companyId}
    `

    if (companies.length === 0) {
      throw new Error(`Company not found: ${companyId}`)
    }

    const company = companies[0] as CompanyTrialData
    const daysRemaining = calculateTrialDaysRemaining(company.trial_end_date)

    // Calculate percentage of trial used (0-100)
    if (!company.trial_start_date || !company.trial_end_date) {
      return {
        daysRemaining: 0,
        percentage: 0,
        trialPlan: company.trial_plan || 'growth',
        isLastDay: false,
      }
    }

    const startDate = new Date(company.trial_start_date)
    const endDate = new Date(company.trial_end_date)
    startDate.setHours(0, 0, 0, 0)
    endDate.setHours(0, 0, 0, 0)

    const msPerDay = 24 * 60 * 60 * 1000
    const totalDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / msPerDay
    )
    const daysElapsed = Math.max(
      0,
      totalDays - daysRemaining
    )
    const percentage = Math.min(
      100,
      Math.round((daysElapsed / totalDays) * 100)
    )

    return {
      daysRemaining,
      percentage,
      trialPlan: company.trial_plan || 'growth',
      isLastDay: daysRemaining === 1,
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error(
      `[trial-manager] Failed to get trial countdown data:`,
      errorMsg
    )
    throw err
  }
}

// ─── Function 3: Check Trial Expiry (for nightly cron) ─────────────────────
export async function checkTrialExpiry(): Promise<TrialExpiryCheckResult> {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Query companies with active trials expiring in 2 days
    const expiringDate = new Date(today)
    expiringDate.setDate(expiringDate.getDate() + 2)
    const expiringDateString = expiringDate.toISOString().split('T')[0]

    const companies = await sql`
      SELECT id, email, name, trial_end_date
      FROM companies
      WHERE trial_status = 'active'
        AND trial_end_date = ${expiringDateString}::date
      ORDER BY created_at DESC
    `

    let emailSentCount = 0

    for (const company of companies as CompanyTrialData[]) {
      try {
        const daysRemaining = calculateTrialDaysRemaining(company.trial_end_date)
        const formattedEndDate = company.trial_end_date
          ? new Date(company.trial_end_date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          : 'N/A'
        await sendTrialExpiringEmail(company.email, company.name, formattedEndDate)
        emailSentCount++
      } catch (emailErr) {
        console.error(
          `[trial-manager] Failed to send expiry email for ${company.id}:`,
          emailErr instanceof Error ? emailErr.message : 'Unknown error'
        )
        // Continue with next company even if this one fails
      }
    }

    console.log(
      `[trial-manager] Trial expiry check: checked ${companies.length} companies, sent ${emailSentCount} emails`
    )

    return {
      checked_count: companies.length,
      email_sent_count: emailSentCount,
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[trial-manager] Failed to check trial expiry:`, errorMsg)
    throw err
  }
}

// ─── Function 4: Handle Trial Expiry (auto-upgrade flow) ────────────────────
export async function handleTrialExpiry(
  companyId: string
): Promise<TrialUpgradeResult> {
  try {
    // Fetch company data
    const companies = await sql`
      SELECT
        id,
        email,
        name,
        trial_status,
        trial_end_date,
        trial_plan,
        stripe_customer_id,
        subscription_id,
        current_period_end
      FROM companies
      WHERE id = ${companyId}
    `

    if (companies.length === 0) {
      throw new Error(`Company not found: ${companyId}`)
    }

    const company = companies[0] as CompanyTrialData

    // Verify trial is active and expired
    if (company.trial_status !== 'active') {
      return {
        upgraded: false,
        message: `Trial status is ${company.trial_status}, not active`,
      }
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (!company.trial_end_date) {
      return {
        upgraded: false,
        message: 'Trial end date not set',
      }
    }

    const trialEndDate = new Date(company.trial_end_date)
    trialEndDate.setHours(0, 0, 0, 0)

    if (trialEndDate > today) {
      return {
        upgraded: false,
        message: 'Trial has not yet expired',
      }
    }

    const planName = company.trial_plan?.toLowerCase() || 'growth'

    // Check if stripe_customer_id exists and has payment method
    if (!company.stripe_customer_id) {
      // No Stripe customer, cannot auto-upgrade
      // Update trial status to expired
      await sql`
        UPDATE companies
        SET
          trial_status = 'expired',
          updated_at = NOW()
        WHERE id = ${companyId}
      `

      console.log(
        `[trial-manager] Trial expired for ${companyId} (no Stripe customer)`
      )
      return {
        upgraded: false,
        message: 'Trial expired. No payment method on file.',
      }
    }

    try {
      // Attempt to create Stripe subscription
      const stripe = getStripe()

      // Get the price ID for the plan
      const priceId = PRICE_IDS[planName]?.monthly
      if (!priceId) {
        throw new Error(`No price ID configured for plan: ${planName}`)
      }

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: company.stripe_customer_id,
        items: [
          {
            price: priceId,
          },
        ],
        metadata: {
          isTrialConversion: 'true',
          trialPlan: planName,
          companyId,
        },
      })

      // Update company with subscription
      const periodEndTimestamp = (subscription as any).current_period_end
      const periodEndDate = periodEndTimestamp
        ? new Date(periodEndTimestamp * 1000).toISOString()
        : null

      await sql`
        UPDATE companies
        SET
          subscription_id = ${subscription.id},
          subscription_status = 'active',
          trial_status = 'upgraded',
          trial_converted_at = NOW(),
          trial_conversion_plan = ${planName},
          current_period_end = ${periodEndDate ? periodEndDate : null},
          updated_at = NOW()
        WHERE id = ${companyId}
      `

      // Send success email
      const nextBillingDate = periodEndTimestamp
        ? new Date(periodEndTimestamp * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : 'N/A'

      const planPricing: Record<string, number> = {
        starter: 29900,
        growth: 79900,
        enterprise: 249900,
      }
      const amount = (planPricing[planName] || 79900) / 100

      await sendTrialUpgradedEmail(
        company.email,
        company.name,
        PLAN_NAMES[planName] || planName,
        new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        amount,
        'month',
        nextBillingDate
      )

      console.log(
        `[trial-manager] Trial auto-upgraded to subscription for ${companyId}: ${subscription.id}`
      )

      return {
        upgraded: true,
        message: `Trial expired. Auto-upgraded to ${PLAN_NAMES[planName]} subscription.`,
        subscription_id: subscription.id,
      }
    } catch (stripeErr) {
      // Stripe error - mark trial as expired but not upgraded
      const errorMsg =
        stripeErr instanceof Error ? stripeErr.message : 'Unknown error'

      console.error(
        `[trial-manager] Stripe error during trial upgrade for ${companyId}:`,
        errorMsg
      )

      await sql`
        UPDATE companies
        SET
          trial_status = 'expired',
          updated_at = NOW()
        WHERE id = ${companyId}
      `

      return {
        upgraded: false,
        message: `Trial expired. Auto-upgrade failed: ${errorMsg}. Manual upgrade required.`,
      }
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[trial-manager] Failed to handle trial expiry:`, errorMsg)
    throw err
  }
}

// ─── Function 5: Extend Trial (admin only) ─────────────────────────────────
export async function extendTrial(
  companyId: string,
  extendByDays: number = 7
): Promise<string> {
  try {
    // Fetch company
    const companies = await sql`
      SELECT id, trial_status, trial_end_date
      FROM companies
      WHERE id = ${companyId}
    `

    if (companies.length === 0) {
      throw new Error(`Company not found: ${companyId}`)
    }

    const company = companies[0] as CompanyTrialData

    // Verify trial status is active or expired
    if (!['active', 'expired'].includes(company.trial_status)) {
      throw new Error(`Cannot extend trial with status: ${company.trial_status}`)
    }

    if (!company.trial_end_date) {
      throw new Error('Trial end date not set')
    }

    // Calculate new end date
    const currentEndDate = new Date(company.trial_end_date)
    currentEndDate.setDate(currentEndDate.getDate() + extendByDays)
    const newEndDate = currentEndDate.toISOString().split('T')[0]

    // Update trial end date and revert to active if expired
    await sql`
      UPDATE companies
      SET
        trial_end_date = ${newEndDate}::date,
        trial_status = CASE
          WHEN trial_status = 'expired' THEN 'active'
          ELSE trial_status
        END,
        updated_at = NOW()
      WHERE id = ${companyId}
    `

    console.log(
      `[trial-manager] Extended trial for ${companyId} by ${extendByDays} days to ${newEndDate}`
    )

    return newEndDate
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[trial-manager] Failed to extend trial:`, errorMsg)
    throw err
  }
}
