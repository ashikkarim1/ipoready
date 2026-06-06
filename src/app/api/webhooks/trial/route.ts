import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { sendTrialExpiringEmail } from '@/lib/billing-notifications'
import { handleTrialExpiry } from '@/lib/trial-manager'

export const dynamic = 'force-dynamic'
/**
 * Trial Expiry Batch Webhook Handler
 *
 * Processes trial expiry in batch via cron job service (cron-job.org, GitHub Actions, etc).
 * Runs nightly to:
 * 1. Check trials expiring in exactly 2 days and send warning emails
 * 2. Handle trials that expired yesterday or today (auto-upgrade or send upgrade email)
 *
 * Verify cron secret via Authorization header to prevent unauthorized invocations.
 *
 * Usage:
 *   curl -X POST http://localhost:3000/api/webhooks/trial \
 *     -H "Authorization: Bearer your-trial-cron-secret" \
 *     -H "Content-Type: application/json" \
 *     -d '{"action":"check_expiry"}' or '{"action":"handle_expiry"}' or '{"action":"both"}'
 */

type TrialAction = 'check_expiry' | 'handle_expiry' | 'both'

interface TrialWebhookRequest {
  action?: TrialAction
}

interface BatchStats {
  timestamp: string
  duration_ms: number
  checked_count: number
  email_sent_count: number
  processed_count: number
  upgraded_count: number
  emailed_count: number
  failed_count: number
  failed_trials?: Array<{ company_id: string; error: string }>
  errors?: string[]
  success: boolean
}

// ─── Helper: Verify Authorization ─────────────────────────────────────────
function verifyAuthHeader(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const trialCronSecret = process.env.TRIAL_CRON_SECRET || process.env.CRON_SECRET

  if (!authHeader || !trialCronSecret) {
    console.error('[trial-cron] Missing authorization header or secret')
    return false
  }

  const expectedSecret = `Bearer ${trialCronSecret}`
  return authHeader === expectedSecret
}

// ─── Function 1: Check Trial Expiry in 2 days ─────────────────────────────
async function checkTrialExpiryBatch(): Promise<{
  checked_count: number
  email_sent_count: number
}> {
  const stats = {
    checked_count: 0,
    email_sent_count: 0,
  }

  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Find trials expiring in exactly 2 days
    const expiringDate = new Date(today)
    expiringDate.setDate(expiringDate.getDate() + 2)
    const expiringDateStr = expiringDate.toISOString().split('T')[0]

    const expiringTrials = await sql`
      SELECT
        id,
        email,
        name,
        trial_end_date,
        trial_plan
      FROM companies
      WHERE trial_status = 'active'
        AND trial_end_date = ${expiringDateStr}::date
      ORDER BY created_at DESC
    ` as any[]

    stats.checked_count = expiringTrials.length
    console.log(`[trial-cron] Found ${stats.checked_count} trials expiring in 2 days`)

    for (const company of expiringTrials) {
      try {
        const formattedEndDate = new Date(company.trial_end_date).toLocaleDateString(
          'en-US',
          {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }
        )

        await sendTrialExpiringEmail(company.email, company.name, formattedEndDate)
        stats.email_sent_count++

        console.log(
          `[trial-cron] Sent expiry warning email to ${company.email} (${company.id})`
        )
      } catch (emailErr) {
        console.error(
          `[trial-cron] Failed to send email for ${company.id}:`,
          emailErr instanceof Error ? emailErr.message : String(emailErr)
        )
        // Continue with next company
      }
    }

    console.log(
      `[trial-cron] Trial expiry check: ${stats.checked_count} checked, ` +
      `${stats.email_sent_count} emails sent`
    )

    return stats
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error('[trial-cron] Failed to check trial expiry:', errorMsg)
    throw err
  }
}

// ─── Function 2: Handle Expired Trials ───────────────────────────────────
async function handleExpiredTrialsBatch(): Promise<{
  processed_count: number
  upgraded_count: number
  emailed_count: number
  failed_count: number
  failed_trials: Array<{ company_id: string; error: string }>
}> {
  const stats = {
    processed_count: 0,
    upgraded_count: 0,
    emailed_count: 0,
    failed_count: 0,
    failed_trials: [] as Array<{ company_id: string; error: string }>,
  }

  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Find all trials that expired yesterday or today
    const expiredTrials = await sql`
      SELECT
        id,
        email,
        name,
        trial_end_date,
        trial_plan,
        stripe_customer_id
      FROM companies
      WHERE trial_status = 'active'
        AND trial_end_date <= ${today.toISOString().split('T')[0]}::date
      ORDER BY trial_end_date ASC
    ` as any[]

    stats.processed_count = expiredTrials.length
    console.log(`[trial-cron] Found ${stats.processed_count} expired trials to process`)

    for (const company of expiredTrials) {
      try {
        console.log(
          `[trial-cron] Processing expired trial for ${company.name} (${company.id})`
        )

        // Call handleTrialExpiry from trial-manager
        // This handles:
        // 1. Auto-upgrade if Stripe customer exists with payment method
        // 2. Send upgrade email if no payment method
        // 3. Update trial_status and timestamps
        const result = await handleTrialExpiry(company.id)

        if (result.upgraded) {
          stats.upgraded_count++
          console.log(
            `[trial-cron] Trial auto-upgraded: ${company.id} -> ${result.subscription_id}`
          )
        } else if (result.message.includes('No payment method')) {
          // Trial expired without payment method - email sent by handleTrialExpiry
          stats.emailed_count++
          console.log(
            `[trial-cron] Trial expired (no payment method): ${company.id}`
          )
        } else {
          // Other reason (Stripe error, already upgraded, etc)
          console.log(`[trial-cron] Trial processed: ${company.id} - ${result.message}`)
        }
      } catch (err) {
        stats.failed_count++
        const errorMsg = err instanceof Error ? err.message : String(err)
        stats.failed_trials.push({ company_id: company.id, error: errorMsg })
        console.error(
          `[trial-cron] Error processing trial ${company.id}:`,
          errorMsg
        )
        // Continue with next trial
      }
    }

    console.log(
      `[trial-cron] Trial expiry handling: ${stats.processed_count} processed, ` +
      `${stats.upgraded_count} upgraded, ${stats.emailed_count} emailed, ` +
      `${stats.failed_count} failed`
    )

    return stats
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error('[trial-cron] Failed to handle expired trials:', errorMsg)
    throw err
  }
}

// ─── POST Handler ──────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const batchStats: BatchStats = {
    timestamp: new Date().toISOString(),
    duration_ms: 0,
    checked_count: 0,
    email_sent_count: 0,
    processed_count: 0,
    upgraded_count: 0,
    emailed_count: 0,
    failed_count: 0,
    success: false,
  }

  try {
    // Verify authorization
    if (!verifyAuthHeader(request)) {
      console.error('[trial-cron] Unauthorized access attempt')
      return NextResponse.json(
        { error: 'Unauthorized: Invalid TRIAL_CRON_SECRET' },
        { status: 401 }
      )
    }

    // Parse request body
    let action: TrialAction = 'both'
    try {
      const body = (await request.json()) as TrialWebhookRequest
      if (body.action && ['check_expiry', 'handle_expiry', 'both'].includes(body.action)) {
        action = body.action
      }
    } catch {
      // No body or invalid JSON - use default 'both'
    }

    console.log(`[trial-cron] Starting batch operation: ${action}`)

    // Execute requested actions
    if (action === 'check_expiry' || action === 'both') {
      try {
        const checkStats = await checkTrialExpiryBatch()
        batchStats.checked_count = checkStats.checked_count
        batchStats.email_sent_count = checkStats.email_sent_count
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        batchStats.errors = batchStats.errors || []
        batchStats.errors.push(`check_expiry failed: ${errorMsg}`)
        console.error('[trial-cron] check_expiry operation failed:', errorMsg)
      }
    }

    if (action === 'handle_expiry' || action === 'both') {
      try {
        const handleStats = await handleExpiredTrialsBatch()
        batchStats.processed_count = handleStats.processed_count
        batchStats.upgraded_count = handleStats.upgraded_count
        batchStats.emailed_count = handleStats.emailed_count
        batchStats.failed_count = handleStats.failed_count
        batchStats.failed_trials = handleStats.failed_trials
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        batchStats.errors = batchStats.errors || []
        batchStats.errors.push(`handle_expiry failed: ${errorMsg}`)
        console.error('[trial-cron] handle_expiry operation failed:', errorMsg)
      }
    }

    batchStats.success = !batchStats.errors || batchStats.errors.length === 0
    batchStats.duration_ms = Date.now() - startTime

    console.log(
      `[trial-cron] Batch completed in ${batchStats.duration_ms}ms - ` +
      `${batchStats.checked_count} checked, ${batchStats.email_sent_count} emails, ` +
      `${batchStats.processed_count} processed, ${batchStats.upgraded_count} upgraded`
    )

    return NextResponse.json(batchStats, { status: 200 })
  } catch (error) {
    batchStats.success = false
    batchStats.duration_ms = Date.now() - startTime
    batchStats.errors = [
      error instanceof Error ? error.message : String(error),
    ]

    console.error('[trial-cron] Fatal error in trial webhook handler:', error)

    return NextResponse.json(batchStats, { status: 200 })
  }
}

// ─── GET Handler (for monitoring/testing) ──────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    // Verify authorization
    if (!verifyAuthHeader(request)) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid TRIAL_CRON_SECRET' },
        { status: 401 }
      )
    }

    // Get all active trials with days remaining
    const activeTrials = await sql`
      SELECT
        id,
        name as company_name,
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
    ` as any[]

    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        total_trials: activeTrials.length,
        trials: activeTrials,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[trial-cron] Error fetching trial status:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
