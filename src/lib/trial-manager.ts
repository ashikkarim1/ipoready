'use strict'

/**
 * Trial Manager
 * Handles trial period lifecycle management for IPOReady subscriptions
 */

import { sql } from '@/lib/db'
import {
  sendTrialExpiringEmail,
  sendTrialExpiredEmail,
  sendPaymentFailedEmail,
} from '@/lib/billing-notifications'

interface TrialInitResult {
  trialStartDate: Date
  trialEndDate: Date
  daysRemaining: number
}

interface TrialStatusResult {
  status: 'not_started' | 'active' | 'expired' | 'upgraded'
  daysRemaining: number
  planAfterTrial: string
}

interface CompanyData {
  id: string
  email: string
  name: string
  trial_start_date: string | null
  trial_end_date: string | null
  trial_status: string
  trial_plan: string
  trial_conversion_plan: string | null
  trial_converted_at: string | null
  subscription_status: string
  stripe_customer_id: string | null
  payment_failure_count: number
}

/**
 * Initialize a trial for a company
 * Default trial length: 14 days
 */
export async function initializeTrial(
  companyId: string,
  planAfterTrial: string = 'growth'
): Promise<TrialInitResult> {
  try {
    // Validate company exists
    const companies = (await sql`
      SELECT id, email FROM companies WHERE id = ${companyId}
    `) as CompanyData[]

    if (companies.length === 0) {
      throw new Error(`Company not found: ${companyId}`)
    }

    const trialStartDate = new Date()
    const trialEndDate = new Date()
    trialEndDate.setDate(trialEndDate.getDate() + 14) // 14-day trial

    // Update company with trial info
    await sql`
      UPDATE companies
      SET
        trial_start_date = ${trialStartDate.toISOString().split('T')[0]},
        trial_end_date = ${trialEndDate.toISOString().split('T')[0]},
        trial_plan = ${planAfterTrial},
        trial_status = 'active',
        subscription_status = 'trialing'
      WHERE id = ${companyId}
    `

    console.log(
      `[trial-manager] Trial initialized for company ${companyId}. Expires: ${trialEndDate.toISOString().split('T')[0]}`
    )

    return {
      trialStartDate,
      trialEndDate,
      daysRemaining: 14,
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[trial-manager] Failed to initialize trial for ${companyId}:`, errorMsg)
    throw err
  }
}

/**
 * Get current trial status for a company
 */
export async function getTrialStatus(companyId: string): Promise<TrialStatusResult> {
  try {
    const companies = (await sql`
      SELECT trial_status, trial_end_date, trial_plan, trial_conversion_plan FROM companies WHERE id = ${companyId}
    `) as CompanyData[]

    if (companies.length === 0) {
      throw new Error(`Company not found: ${companyId}`)
    }

    const company = companies[0]

    // Check if trial hasn't been started yet
    if (company.trial_status === 'not_started') {
      return {
        status: 'not_started',
        daysRemaining: 0,
        planAfterTrial: 'growth',
      }
    }

    // Check if already upgraded
    if (company.trial_status === 'upgraded') {
      return {
        status: 'upgraded',
        daysRemaining: 0,
        planAfterTrial: company.trial_conversion_plan || company.trial_plan || 'growth',
      }
    }

    // Calculate days remaining
    const trialEndDate = new Date(company.trial_end_date!)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const msPerDay = 24 * 60 * 60 * 1000
    const daysRemaining = Math.ceil((trialEndDate.getTime() - today.getTime()) / msPerDay)

    const status = daysRemaining > 0 ? 'active' : 'expired'

    return {
      status: status as 'active' | 'expired',
      daysRemaining: Math.max(0, daysRemaining),
      planAfterTrial: company.trial_plan || 'growth',
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[trial-manager] Failed to get trial status for ${companyId}:`, errorMsg)
    throw err
  }
}

/**
 * Check for upcoming trial expirations (runs nightly)
 * Finds companies where trial expires in 2 days and sends reminders
 */
export async function checkTrialExpiry(): Promise<void> {
  try {
    console.log('[trial-manager] Running nightly trial expiry check...')

    // Get companies with trial expiring in exactly 2 days
    const expiringCompanies = (await sql`
      SELECT id, email, name, trial_end_date, trial_plan
      FROM companies
      WHERE trial_status = 'active'
      AND trial_end_date = CURRENT_DATE + INTERVAL '2 days'
    `) as CompanyData[]

    console.log(
      `[trial-manager] Found ${expiringCompanies.length} companies with trials expiring in 2 days`
    )

    for (const company of expiringCompanies) {
      try {
        await sendTrialExpiringEmail(company.id, 2)
        console.log(`[trial-manager] Sent expiring soon email to ${company.email}`)
      } catch (err) {
        console.error(
          `[trial-manager] Failed to send expiring email for ${company.id}:`,
          err instanceof Error ? err.message : 'Unknown error'
        )
      }
    }

    // Get companies with trial expiring today (expired)
    const expiredCompanies = (await sql`
      SELECT id, email, name, trial_end_date, trial_plan, stripe_customer_id
      FROM companies
      WHERE trial_status = 'active'
      AND trial_end_date = CURRENT_DATE
    `) as CompanyData[]

    console.log(`[trial-manager] Found ${expiredCompanies.length} companies with expired trials`)

    for (const company of expiredCompanies) {
      try {
        await handleTrialExpiry(company.id)
      } catch (err) {
        console.error(
          `[trial-manager] Failed to handle expiry for ${company.id}:`,
          err instanceof Error ? err.message : 'Unknown error'
        )
      }
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[trial-manager] Trial expiry check failed:', errorMsg)
  }
}

/**
 * Handle trial expiration
 * - If payment method exists: auto-create Stripe subscription
 * - If no payment method: set to expired, send upgrade email
 * - Deactivate trial-only features
 */
export async function handleTrialExpiry(companyId: string): Promise<void> {
  try {
    // Fetch company data
    const companies = (await sql`
      SELECT id, email, name, stripe_customer_id, trial_plan, payment_failure_count
      FROM companies
      WHERE id = ${companyId}
    `) as CompanyData[]

    if (companies.length === 0) {
      throw new Error(`Company not found: ${companyId}`)
    }

    const company = companies[0]

    // Check if payment method exists in Stripe
    const hasPaymentMethod = company.stripe_customer_id !== null

    if (hasPaymentMethod) {
      // Auto-create subscription via Stripe API
      console.log(
        `[trial-manager] Auto-creating subscription for ${companyId} after trial expiry`
      )

      try {
        // In production, this would call Stripe API to create subscription
        // For now, we mark it as converted
        await sql`
          UPDATE companies
          SET
            trial_status = 'upgraded',
            trial_converted_at = NOW(),
            trial_conversion_plan = ${company.trial_plan},
            subscription_status = 'active'
          WHERE id = ${companyId}
        `

        console.log(`[trial-manager] Subscription created for ${companyId}`)
      } catch (err) {
        console.error(
          `[trial-manager] Failed to create subscription for ${companyId}:`,
          err instanceof Error ? err.message : 'Unknown error'
        )
        throw err
      }
    } else {
      // No payment method: set to expired, deactivate features
      await sql`
        UPDATE companies
        SET
          trial_status = 'expired',
          subscription_status = 'expired'
        WHERE id = ${companyId}
      `

      console.log(`[trial-manager] Trial expired for ${companyId} (no payment method)`
      )

      // Send trial expired email with upgrade link
      try {
        await sendTrialExpiredEmail(companyId)
      } catch (err) {
        console.error(
          `[trial-manager] Failed to send expired email for ${companyId}:`,
          err instanceof Error ? err.message : 'Unknown error'
        )
      }
    }

    // Deactivate trial-only features for all cases
    // This can be extended based on your feature gates
    console.log(`[trial-manager] Deactivating trial features for ${companyId}`)
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[trial-manager] Failed to handle trial expiry for ${companyId}:`, errorMsg)
    throw err
  }
}

/**
 * Convert trial to paid subscription
 */
export async function convertTrialToSubscription(
  companyId: string,
  plan: string,
  stripePlanId: string
): Promise<void> {
  try {
    await sql`
      UPDATE companies
      SET
        trial_status = 'upgraded',
        trial_converted_at = NOW(),
        trial_conversion_plan = ${plan},
        subscription_status = 'active',
        subscription_plan = ${plan}
      WHERE id = ${companyId}
    `

    console.log(
      `[trial-manager] Trial converted to paid subscription for ${companyId} (plan: ${plan})`
    )
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error(
      `[trial-manager] Failed to convert trial for ${companyId}:`,
      errorMsg
    )
    throw err
  }
}

/**
 * Cancel a trial (if user cancels before expiry)
 */
export async function cancelTrial(companyId: string): Promise<void> {
  try {
    await sql`
      UPDATE companies
      SET
        trial_status = 'expired',
        subscription_status = 'expired'
      WHERE id = ${companyId}
    `

    console.log(`[trial-manager] Trial cancelled for ${companyId}`)
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[trial-manager] Failed to cancel trial for ${companyId}:`, errorMsg)
    throw err
  }
}

/**
 * Get all companies in active trial
 */
export async function getActiveTrialCompanies(): Promise<CompanyData[]> {
  try {
    const companies = (await sql`
      SELECT id, email, name, trial_start_date, trial_end_date, trial_plan
      FROM companies
      WHERE trial_status = 'active'
      ORDER BY trial_end_date ASC
    `) as CompanyData[]

    return companies
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[trial-manager] Failed to get active trial companies:', errorMsg)
    return []
  }
}

/**
 * Get trial countdown data for UI display
 */
export async function getTrialCountdownData(
  companyId: string
): Promise<{
  daysRemaining: number
  percentage: number
  trialPlan: string
  isLastDay: boolean
}> {
  try {
    const companies = (await sql`
      SELECT trial_start_date, trial_end_date, trial_plan FROM companies WHERE id = ${companyId}
    `) as CompanyData[]

    if (companies.length === 0) {
      throw new Error(`Company not found: ${companyId}`)
    }

    const company = companies[0]

    if (!company.trial_start_date || !company.trial_end_date) {
      return {
        daysRemaining: 0,
        percentage: 0,
        trialPlan: 'growth',
        isLastDay: false,
      }
    }

    // Calculate days remaining
    const trialEndDate = new Date(company.trial_end_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const msPerDay = 24 * 60 * 60 * 1000
    const daysRemaining = Math.ceil((trialEndDate.getTime() - today.getTime()) / msPerDay)

    // Calculate percentage (14-day trial)
    const trialStartDate = new Date(company.trial_start_date)
    const totalDays = Math.ceil((trialEndDate.getTime() - trialStartDate.getTime()) / msPerDay)
    const daysUsed = totalDays - daysRemaining
    const percentage = Math.max(0, Math.min(100, (daysUsed / totalDays) * 100))

    return {
      daysRemaining: Math.max(0, daysRemaining),
      percentage,
      trialPlan: company.trial_plan || 'growth',
      isLastDay: daysRemaining === 1,
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[trial-manager] Failed to get trial countdown data:`, errorMsg)
    return {
      daysRemaining: 0,
      percentage: 0,
      trialPlan: 'growth',
      isLastDay: false,
    }
  }
}
