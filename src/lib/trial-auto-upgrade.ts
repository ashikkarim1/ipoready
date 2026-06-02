/**
 * Trial Auto-Upgrade System
 * Handles automatic subscription creation when trials expire with payment method
 * Implements retry logic for failed auto-upgrades with exponential backoff
 */

import { sql } from '@/lib/db'
import Stripe from 'stripe'
import { sendTrialExpiredEmail, sendPaymentFailedEmail } from '@/lib/billing-notifications'
import { recordTrialUpgradeMetrics } from '@/lib/monitoring/trial-metrics'

let stripeInstance: Stripe | null = null

function getStripe(): Stripe {
  if (!stripeInstance) {
    const apiKey = process.env.STRIPE_SECRET_KEY
    if (!apiKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured')
    }
    stripeInstance = new Stripe(apiKey)
  }
  return stripeInstance
}

export interface TrialAutoUpgradeQueueItem {
  id: string
  company_id: string
  stripe_customer_id: string
  trial_end_date: string
  retry_count: number
  next_retry_at: string
  last_error: string | null
  status: 'pending' | 'retrying' | 'failed' | 'succeeded'
  created_at: string
}

export interface TrialAutoUpgradeResult {
  success: boolean
  subscriptionId?: string
  error?: string
  retryQueued?: boolean
}

/**
 * Attempt to create a Stripe subscription for trial expiry
 * Handles payment failures and queues retries with exponential backoff
 */
export async function handleTrialExpiry(
  companyId: string
): Promise<TrialAutoUpgradeResult> {
  const startTime = Date.now()
  try {
    // Fetch company trial and subscription info
    const companies = await sql`
      SELECT
        id,
        email,
        name,
        stripe_customer_id,
        trial_plan,
        trial_status,
        trial_end_date,
        subscription_status,
        subscription_id
      FROM companies
      WHERE id = ${companyId}
      LIMIT 1
    `

    if (companies.length === 0) {
      console.error(`[trial-upgrade] Company not found: ${companyId}`)
      return {
        success: false,
        error: 'Company not found',
      }
    }

    const company = companies[0] as any

    // Check if trial is actually expired
    const trialEndDate = new Date(company.trial_end_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (trialEndDate.getTime() > today.getTime()) {
      console.warn(`[trial-upgrade] Trial not yet expired for ${companyId}`)
      return {
        success: false,
        error: 'Trial has not expired yet',
      }
    }

    // If no Stripe customer, mark as expired and send email
    if (!company.stripe_customer_id) {
      console.log(`[trial-upgrade] No payment method for ${companyId}, marking as expired`)

      await sql`
        UPDATE companies
        SET
          trial_status = 'expired',
          subscription_status = 'expired'
        WHERE id = ${companyId}
      `

      // Send expired trial email (not payment failure, just upgrade needed)
      try {
        await sendTrialExpiredEmail(companyId)
      } catch (emailError) {
        console.error(`[trial-upgrade] Failed to send trial expired email to ${company.email}:`, emailError)
      }

      return {
        success: false,
        error: 'No payment method on file',
      }
    }

    // Attempt to create Stripe subscription
    console.log(`[trial-upgrade] Attempting to create subscription for ${companyId}`)

    try {
      const priceId = getPriceIdForPlan(company.trial_plan)
      if (!priceId) {
        throw new Error(`Invalid trial plan: ${company.trial_plan}`)
      }

      // Create subscription with trial_from_meterable: false (trial is over)
      const subscription = await getStripe().subscriptions.create({
        customer: company.stripe_customer_id,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        metadata: {
          companyId: companyId,
          trialEndDate: company.trial_end_date,
          autoUpgrade: 'true',
        },
      })

      // Update company with subscription info
      const periodStart = (subscription as any).current_period_start || Math.floor(Date.now() / 1000)
      const periodEnd = (subscription as any).current_period_end || Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60
      
      await sql`
        UPDATE companies
        SET
          subscription_id = ${subscription.id},
          subscription_status = 'active',
          subscription_plan = ${company.trial_plan},
          trial_status = 'upgraded',
          trial_converted_at = NOW(),
          trial_conversion_plan = ${company.trial_plan},
          current_period_start = ${new Date(periodStart * 1000)},
          current_period_end = ${new Date(periodEnd * 1000)},
          next_billing_date = ${new Date(periodEnd * 1000)}
        WHERE id = ${companyId}
      `

      // Remove from retry queue if it was there
      await sql`
        DELETE FROM trial_auto_upgrade_queue
        WHERE company_id = ${companyId}
      `

      console.log(`[trial-upgrade] Successfully created subscription ${subscription.id} for ${companyId}`)

      // Record success metric
      const latencyMs = Date.now() - startTime
      await recordTrialUpgradeMetrics({
        companyId,
        status: 'success',
        attempt: 1,
        latencyMs,
      })

      // Send success notification (optional - included in billing notifications)
      return {
        success: true,
        subscriptionId: subscription.id,
      }
    } catch (error) {
      console.error(`[trial-upgrade] Failed to create subscription for ${companyId}:`, error)

      // Record failure metric
      const latencyMs = Date.now() - startTime
      await recordTrialUpgradeMetrics({
        companyId,
        status: 'failed',
        attempt: 1,
        latencyMs,
      })

      // Queue for retry with exponential backoff
      const queueResult = await queueForRetry(
        companyId,
        company.stripe_customer_id,
        company.trial_end_date,
        error instanceof Error ? error.message : String(error)
      )

      // Send email about retry
      try {
        await sendTrialAutoUpgradeEmail(
          company.email,
          company.name,
          false, // upgrade failed
          error instanceof Error ? error.message : 'Payment processing error'
        )
      } catch (emailError) {
        console.error(`[trial-upgrade] Failed to send upgrade notification email:`, emailError)
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create subscription',
        retryQueued: queueResult.queued,
      }
    }
  } catch (error) {
    console.error(`[trial-upgrade] Unexpected error in handleTrialExpiry:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unexpected error',
    }
  }
}

/**
 * Queue a failed auto-upgrade for retry with exponential backoff
 * Retry schedule: 1 min, 5 min, 1 hour, 1 day
 */
export async function queueForRetry(
  companyId: string,
  stripeCustomerId: string,
  trialEndDate: string,
  lastError: string
): Promise<{ queued: boolean; nextRetryAt?: Date }> {
  try {
    // Check if already in queue
    const existing = await sql`
      SELECT id, retry_count FROM trial_auto_upgrade_queue
      WHERE company_id = ${companyId}
      LIMIT 1
    `

    let retryCount = 0
    let nextRetryAt = new Date()

    if (existing.length > 0) {
      retryCount = (existing[0] as any).retry_count
    }

    retryCount += 1

    // Calculate next retry time with exponential backoff
    const backoffMs = getRetryBackoffMs(retryCount)
    nextRetryAt.setTime(nextRetryAt.getTime() + backoffMs)

    if (retryCount > 3) {
      // Max retries exceeded - escalate to support
      console.error(
        `[trial-upgrade] Max retries exceeded for ${companyId}. Escalating to support.`
      )

      await sql`
        UPDATE trial_auto_upgrade_queue
        SET
          status = 'failed',
          retry_count = ${retryCount},
          last_error = ${lastError}
        WHERE company_id = ${companyId}
      `

      // Record escalation metric
      await recordTrialUpgradeMetrics({
        companyId,
        status: 'escalated',
        attempt: retryCount,
        latencyMs: 0,
        retryNumber: retryCount,
      })

      // Escalate support ticket (implementation below)
      await escalateToSupport(companyId, lastError)

      return { queued: false }
    }

    // Insert or update queue entry
    await sql`
      INSERT INTO trial_auto_upgrade_queue (
        id,
        company_id,
        stripe_customer_id,
        trial_end_date,
        retry_count,
        next_retry_at,
        last_error,
        status
      )
      VALUES (
        gen_random_uuid(),
        ${companyId},
        ${stripeCustomerId},
        ${trialEndDate},
        ${retryCount},
        ${nextRetryAt},
        ${lastError},
        'retrying'
      )
      ON CONFLICT (company_id) DO UPDATE
      SET
        retry_count = ${retryCount},
        next_retry_at = ${nextRetryAt},
        last_error = ${lastError},
        status = 'retrying',
        updated_at = NOW()
    `

    console.log(
      `[trial-upgrade] Queued retry #${retryCount} for ${companyId}. Next retry at: ${nextRetryAt.toISOString()}`
    )

    // Record retry metric
    await recordTrialUpgradeMetrics({
      companyId,
      status: 'retrying',
      attempt: retryCount,
      latencyMs: 0,
      retryNumber: retryCount,
    })

    return { queued: true, nextRetryAt }
  } catch (error) {
    console.error('[trial-upgrade] Failed to queue retry:', error)
    return { queued: false }
  }
}

/**
 * Process pending retries from queue
 * Called every 5 minutes by cron job
 */
export async function processPendingRetries(): Promise<{
  processed: number
  succeeded: number
  failed: number
}> {
  const stats = {
    processed: 0,
    succeeded: 0,
    failed: 0,
  }

  try {
    // Get all pending retries that are due
    const pendingRetries = await sql`
      SELECT
        id,
        company_id,
        stripe_customer_id,
        trial_end_date,
        retry_count,
        last_error
      FROM trial_auto_upgrade_queue
      WHERE status IN ('pending', 'retrying')
        AND next_retry_at <= NOW()
      ORDER BY next_retry_at ASC
      LIMIT 50
    `

    console.log(`[trial-upgrade-cron] Processing ${pendingRetries.length} pending retries`)

    for (const item of pendingRetries) {
      const queueItem = item as any
      stats.processed += 1

      try {
        const result = await handleTrialExpiry(queueItem.company_id)

        if (result.success) {
          stats.succeeded += 1
          console.log(
            `[trial-upgrade-cron] Retry successful for ${queueItem.company_id}: ${result.subscriptionId}`
          )
        } else {
          stats.failed += 1
          console.warn(
            `[trial-upgrade-cron] Retry still failing for ${queueItem.company_id}: ${result.error}`
          )
        }
      } catch (error) {
        stats.failed += 1
        console.error(
          `[trial-upgrade-cron] Error processing retry for ${queueItem.company_id}:`,
          error
        )
      }
    }
  } catch (error) {
    console.error('[trial-upgrade-cron] Failed to process pending retries:', error)
  }

  return stats
}

/**
 * Get backoff time in milliseconds based on retry count
 * Retry schedule: 1min, 5min, 1hour, then give up
 */
export function getRetryBackoffMs(retryCount: number): number {
  const schedule = [
    60 * 1000,        // 1 minute
    5 * 60 * 1000,    // 5 minutes
    60 * 60 * 1000,   // 1 hour
    24 * 60 * 60 * 1000, // 1 day
  ]

  return schedule[Math.min(retryCount, schedule.length - 1)]
}

/**
 * Get Stripe price ID for trial plan
 */
function getPriceIdForPlan(planName: string): string | null {
  const priceMap: Record<string, string> = {
    starter: process.env.STRIPE_PRICE_STARTER_MONTHLY || '',
    growth: process.env.STRIPE_PRICE_GROWTH_MONTHLY || '',
    enterprise: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || '',
  }

  return priceMap[planName] || null
}

/**
 * Escalate failed auto-upgrade to support
 */
async function escalateToSupport(
  companyId: string,
  lastError: string
): Promise<void> {
  try {
    // Fetch company info
    const companies = await sql`
      SELECT id, name, email FROM companies
      WHERE id = ${companyId}
      LIMIT 1
    `

    if (companies.length === 0) return

    const company = companies[0] as any

    // Create support ticket (implementation depends on support system)
    console.error(`[trial-upgrade-escalation] Support ticket needed for ${company.name}:`)
    console.error(`  Company ID: ${companyId}`)
    console.error(`  Email: ${company.email}`)
    console.error(`  Issue: Trial auto-upgrade failed after 3 retries`)
    console.error(`  Last Error: ${lastError}`)

    // In production, this would create a support ticket in your support system
    // For now, we just log it prominently
  } catch (error) {
    console.error('[trial-upgrade] Failed to escalate to support:', error)
  }
}

/**
 * Send trial auto-upgrade email (success or failure)
 */
async function sendTrialAutoUpgradeEmail(
  email: string,
  companyName: string,
  success: boolean,
  errorMessage?: string
): Promise<void> {
  try {
    if (success) {
      // Trial was successfully upgraded - send welcome to paid email
      console.log(`[trial-upgrade] Would send upgrade success email to ${email}`)
      // Implement with your email service
    } else {
      // Trial upgrade failed - send action required email
      console.log(
        `[trial-upgrade] Would send upgrade failure notification to ${email}: ${errorMessage}`
      )
      // Implement with your email service
    }
  } catch (error) {
    console.error('[trial-upgrade] Failed to send auto-upgrade email:', error)
  }
}

/**
 * Get queue status for monitoring
 */
export async function getQueueStatus(): Promise<{
  pending: number
  retrying: number
  failed: number
  nextRetryAt?: Date
}> {
  try {
    const status = await sql`
      SELECT
        status,
        COUNT(*) as count,
        MIN(next_retry_at) as next_retry_at
      FROM trial_auto_upgrade_queue
      WHERE status IN ('pending', 'retrying', 'failed')
      GROUP BY status
    `

    const result = {
      pending: 0,
      retrying: 0,
      failed: 0,
      nextRetryAt: undefined as Date | undefined,
    }

    for (const row of status) {
      const r = row as any
      if (r.status === 'pending') result.pending = r.count
      if (r.status === 'retrying') result.retrying = r.count
      if (r.status === 'failed') result.failed = r.count
      if (r.next_retry_at) result.nextRetryAt = new Date(r.next_retry_at)
    }

    return result
  } catch (error) {
    console.error('[trial-upgrade] Failed to get queue status:', error)
    return { pending: 0, retrying: 0, failed: 0 }
  }
}
