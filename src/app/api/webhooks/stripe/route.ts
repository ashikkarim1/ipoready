/**
 * Stripe Webhook Handler - SECURE IMPLEMENTATION
 * Endpoint: POST /api/webhooks/stripe
 * 
 * CRITICAL SECURITY: Signature verification happens FIRST (line 1 of processing)
 * Uses state machine for subscription lifecycle validation
 * Implements rate limiting and idempotency checks
 */

import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import {
  verifyWebhookSignatureSecure,
  checkWebhookIdempotency,
  checkWebhookRateLimit,
  logWebhookEventSecure,
  processWebhookSecurely,
} from '@/lib/stripe-webhook-secure'
import {
  validateStateTransition,
  updateSubscriptionStateSecure,
  SubscriptionState,
} from '@/lib/subscription-state-machine'
import { sendBillingNotificationEmail } from '@/lib/email-notifications'
import { recordWebhookMetrics } from '@/lib/monitoring/webhook-metrics'

// Stripe event type definitions
interface StripeEvent {
  id: string
  type: string
  created: number
  data: {
    object: Record<string, any>
    previous_attributes?: Record<string, any>
  }
}

/**
 * Helper: Get company from Stripe customer ID
 */
async function getCompanyByStripeCustomerId(customerId: string) {
  const result = await sql`
    SELECT id, name, email FROM companies
    WHERE stripe_customer_id = ${customerId}
    LIMIT 1
  `
  return result.length > 0 ? (result[0] as any) : null
}

/**
 * Helper: Map Stripe plan ID to plan tier
 */
function getPlanTierFromStripePrice(priceId: string): string {
  // Map Stripe price ID to plan tier (starter, growth, enterprise)
  // This matches the PRICE_IDS config in stripe.ts
  const priceMap: Record<string, string> = {
    [process.env.STRIPE_PRICE_STARTER_MONTHLY ?? '']: 'starter',
    [process.env.STRIPE_PRICE_STARTER_SIXMONTH ?? '']: 'starter',
    [process.env.STRIPE_PRICE_STARTER_ANNUAL ?? '']: 'starter',
    [process.env.STRIPE_PRICE_GROWTH_MONTHLY ?? '']: 'growth',
    [process.env.STRIPE_PRICE_GROWTH_SIXMONTH ?? '']: 'growth',
    [process.env.STRIPE_PRICE_GROWTH_ANNUAL ?? '']: 'growth',
    [process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY ?? '']: 'enterprise',
    [process.env.STRIPE_PRICE_ENTERPRISE_SIXMONTH ?? '']: 'enterprise',
    [process.env.STRIPE_PRICE_ENTERPRISE_ANNUAL ?? '']: 'enterprise',
  }
  return priceMap[priceId] ?? 'growth' // default to growth
}

/**
 * Helper: Map billing interval to subscription interval
 */
function getSubscriptionInterval(
  interval: string,
  intervalCount: number
): string {
  if (interval === 'month') {
    if (intervalCount === 1) return 'monthly'
    if (intervalCount === 6) return 'sixmonth'
    if (intervalCount === 12) return 'annual'
  }
  return 'monthly'
}

/**
 * Handle customer.subscription.created
 */
async function handleSubscriptionCreated(event: StripeEvent) {
  const obj = event.data.object
  const customerId = obj.customer as string
  const subscriptionId = obj.id as string

  // Find company
  const company = await getCompanyByStripeCustomerId(customerId)
  if (!company) {
    console.warn(`Company not found for customer: ${customerId}`)
    return
  }

  try {
    // Extract subscription details
    const item = obj.items?.data?.[0]
    const priceId = item?.price?.id
    const planTier = getPlanTierFromStripePrice(priceId)
    const interval = getSubscriptionInterval(obj.billing_cycle_anchor_config?.interval, obj.items?.data?.[0]?.billing_thresholds?.usage_gte ?? 1)
    const currentPeriodStart = new Date(obj.current_period_start * 1000)
    const currentPeriodEnd = new Date(obj.current_period_end * 1000)
    const nextBillingDate = currentPeriodEnd

    // Update company subscription status
    await sql`
      UPDATE companies
      SET
        stripe_customer_id = ${customerId},
        subscription_id = ${subscriptionId},
        subscription_status = 'active',
        subscription_plan = ${planTier},
        subscription_interval = ${interval},
        current_period_start = ${currentPeriodStart},
        current_period_end = ${currentPeriodEnd},
        next_billing_date = ${nextBillingDate},
        trial_status = CASE WHEN ${obj.trial_end} THEN 'active' ELSE 'expired' END,
        trial_end_date = CASE WHEN ${obj.trial_end} THEN ${new Date(obj.trial_end * 1000)} ELSE trial_end_date END
      WHERE id = ${company.id}
    `

    // Log invoice event (billing_invoices table)
    if (obj.latest_invoice) {
      await sql`
        INSERT INTO billing_invoices (company_id, stripe_customer_id, stripe_invoice_id, amount_cents, currency, status, period_start, period_end, description)
        VALUES (${company.id}, ${customerId}, ${obj.latest_invoice}, 0, 'USD', 'draft', ${currentPeriodStart}, ${currentPeriodEnd}, 'Subscription created')
        ON CONFLICT DO NOTHING
      `
    }

    console.log(
      `[Stripe] Subscription created: ${subscriptionId} for ${company.name} (${planTier}/${interval})`
    )
  } catch (error) {
    console.error(
      `[Stripe] Error processing subscription.created for ${customerId}:`,
      error
    )
    throw error
  }
}

/**
 * Handle customer.subscription.updated
 */
async function handleSubscriptionUpdated(event: StripeEvent) {
  const obj = event.data.object
  const customerId = obj.customer as string
  const subscriptionId = obj.id as string

  const company = await getCompanyByStripeCustomerId(customerId)
  if (!company) {
    console.warn(`Company not found for customer: ${customerId}`)
    return
  }

  try {
    // Extract updated subscription details
    const item = obj.items?.data?.[0]
    const priceId = item?.price?.id
    const planTier = getPlanTierFromStripePrice(priceId)
    const interval = getSubscriptionInterval(obj.billing_cycle_anchor_config?.interval, 1)
    const currentPeriodStart = new Date(obj.current_period_start * 1000)
    const currentPeriodEnd = new Date(obj.current_period_end * 1000)
    const nextBillingDate = currentPeriodEnd

    // Update company
    await sql`
      UPDATE companies
      SET
        subscription_status = ${obj.status},
        subscription_plan = ${planTier},
        subscription_interval = ${interval},
        current_period_start = ${currentPeriodStart},
        current_period_end = ${currentPeriodEnd},
        next_billing_date = ${nextBillingDate},
        trial_status = CASE WHEN ${obj.trial_end} THEN 'active' ELSE 'expired' END,
        trial_end_date = CASE WHEN ${obj.trial_end} THEN ${new Date(obj.trial_end * 1000)} ELSE trial_end_date END
      WHERE id = ${company.id}
    `

    console.log(
      `[Stripe] Subscription updated: ${subscriptionId} (${planTier}/${interval})`
    )
  } catch (error) {
    console.error(
      `[Stripe] Error processing subscription.updated for ${customerId}:`,
      error
    )
    throw error
  }
}

/**
 * Handle customer.subscription.deleted
 */
async function handleSubscriptionDeleted(event: StripeEvent) {
  const obj = event.data.object
  const customerId = obj.customer as string

  const company = await getCompanyByStripeCustomerId(customerId)
  if (!company) {
    console.warn(`Company not found for customer: ${customerId}`)
    return
  }

  try {
    const canceledAt = new Date(obj.canceled_at * 1000)

    // Update company status to cancelled
    await sql`
      UPDATE companies
      SET
        subscription_status = 'cancelled',
        cancelled_at = ${canceledAt},
        next_billing_date = NULL
      WHERE id = ${company.id}
    `

    // Send notification email
    await sendBillingNotificationEmail(
      company.email,
      company.name,
      'subscription_cancelled',
      {
        companyName: company.name,
        cancellationDate: canceledAt.toLocaleDateString('en-US'),
        reactivationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billing/reactivate`,
      }
    )

    console.log(`[Stripe] Subscription cancelled for ${company.name}`)
  } catch (error) {
    console.error(
      `[Stripe] Error processing subscription.deleted for ${customerId}:`,
      error
    )
    throw error
  }
}

/**
 * Handle invoice.payment_succeeded
 */
async function handlePaymentSucceeded(event: StripeEvent) {
  const obj = event.data.object
  const customerId = obj.customer as string
  const invoiceId = obj.id as string

  const company = await getCompanyByStripeCustomerId(customerId)
  if (!company) {
    console.warn(`Company not found for customer: ${customerId}`)
    return
  }

  try {
    const paidAt = obj.paid_at ? new Date(obj.paid_at * 1000) : new Date()
    const periodStart = obj.period_start ? new Date(obj.period_start * 1000) : new Date()
    const periodEnd = obj.period_end ? new Date(obj.period_end * 1000) : new Date()

    // Record invoice
    await sql`
      INSERT INTO billing_invoices (
        company_id,
        stripe_customer_id,
        stripe_invoice_id,
        amount_cents,
        currency,
        status,
        period_start,
        period_end,
        paid_at,
        description
      )
      VALUES (
        ${company.id},
        ${customerId},
        ${invoiceId},
        ${obj.amount_paid},
        ${obj.currency.toUpperCase()},
        'paid',
        ${periodStart},
        ${periodEnd},
        ${paidAt},
        ${obj.description || 'Invoice payment succeeded'}
      )
      ON CONFLICT (stripe_invoice_id) DO UPDATE
      SET status = 'paid', paid_at = ${paidAt}
    `

    // Record payment
    if (obj.charge) {
      await sql`
        INSERT INTO payment_history (
          company_id,
          stripe_charge_id,
          stripe_invoice_id,
          amount_cents,
          currency,
          payment_method,
          status,
          receipt_url
        )
        VALUES (
          ${company.id},
          ${obj.charge},
          ${invoiceId},
          ${obj.amount_paid},
          ${obj.currency.toUpperCase()},
          'card',
          'succeeded',
          ${obj.invoice_pdf || null}
        )
        ON CONFLICT (stripe_charge_id) DO NOTHING
      `
    }

    // Reset payment failure count
    await sql`
      UPDATE companies
      SET
        payment_failure_count = 0,
        last_payment_at = ${paidAt}
      WHERE id = ${company.id}
    `

    // Send payment success email
    await sendBillingNotificationEmail(
      company.email,
      company.name,
      'payment_succeeded',
      {
        companyName: company.name,
        invoiceId: invoiceId,
        amount: (obj.amount_paid / 100).toFixed(2),
        currency: obj.currency.toUpperCase(),
        paidAt: paidAt.toLocaleDateString('en-US'),
        invoiceUrl: obj.invoice_pdf || `${process.env.NEXT_PUBLIC_APP_URL}/billing/invoices/${invoiceId}`,
      }
    )

    console.log(
      `[Stripe] Payment succeeded: ${invoiceId} for ${company.name} ($${(obj.amount_paid / 100).toFixed(2)})`
    )
  } catch (error) {
    console.error(
      `[Stripe] Error processing invoice.payment_succeeded for ${customerId}:`,
      error
    )
    throw error
  }
}

/**
 * Handle invoice.payment_failed
 * CRITICAL: Uses state machine to transition to past_due only from active state
 */
async function handlePaymentFailed(event: StripeEvent) {
  const obj = event.data.object
  const customerId = obj.customer as string
  const invoiceId = obj.id as string
  const subscriptionId = obj.subscription as string | null

  const company = await getCompanyByStripeCustomerId(customerId)
  if (!company) {
    console.warn(`Company not found for customer: ${customerId}`)
    return
  }

  try {
    const periodStart = obj.period_start ? new Date(obj.period_start * 1000) : new Date()
    const periodEnd = obj.period_end ? new Date(obj.period_end * 1000) : new Date()
    const nextRetryAt = obj.next_payment_attempt
      ? new Date(obj.next_payment_attempt * 1000)
      : null

    // Record invoice
    await sql`
      INSERT INTO billing_invoices (
        company_id,
        stripe_customer_id,
        stripe_invoice_id,
        amount_cents,
        currency,
        status,
        period_start,
        period_end,
        description
      )
      VALUES (
        ${company.id},
        ${customerId},
        ${invoiceId},
        ${obj.amount_due},
        ${obj.currency.toUpperCase()},
        'open',
        ${periodStart},
        ${periodEnd},
        'Payment failed: ' || ${obj.failure_message || 'Unknown error'}
      )
      ON CONFLICT (stripe_invoice_id) DO UPDATE
      SET status = 'open'
    `

    // Get current subscription status
    const currentCompany = await sql`
      SELECT subscription_status, payment_failure_count FROM companies WHERE id = ${company.id}
    `
    const currentStatus = ((currentCompany[0] as any)?.subscription_status || 'active') as SubscriptionState
    const failureCount = ((currentCompany[0] as any)?.payment_failure_count ?? 0) + 1

    // Increment payment failure count
    await sql`
      UPDATE companies
      SET payment_failure_count = ${failureCount}
      WHERE id = ${company.id}
    `

    // Use state machine: only transition active -> past_due (not past_due -> past_due)
    if (failureCount >= 3 && currentStatus === 'active') {
      const stateUpdateResult = await updateSubscriptionStateSecure(
        company.id,
        subscriptionId || '',
        'past_due',
        'invoice.payment_failed (3+ failures)',
        ['active'] // Only transition from active
      )

      if (!stateUpdateResult.success) {
        console.warn(
          `[Stripe] State transition failed for ${company.id}: ${stateUpdateResult.error}`
        )
      }
    }

    // Send payment failed notification email
    await sendBillingNotificationEmail(
      company.email,
      company.name,
      'payment_failed',
      {
        companyName: company.name,
        invoiceId: invoiceId,
        amount: (obj.amount_due / 100).toFixed(2),
        currency: obj.currency.toUpperCase(),
        failureReason: obj.failure_message || 'Payment processing failed',
        failureCode: obj.failure_code || 'unknown',
        retryDate: nextRetryAt?.toLocaleDateString('en-US') || 'soon',
        updatePaymentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billing/payment-method`,
      }
    )

    console.log(
      `[Stripe] Payment failed: ${invoiceId} for ${company.name} (attempt ${failureCount})`
    )
  } catch (error) {
    console.error(
      `[Stripe] Error processing invoice.payment_failed for ${customerId}:`,
      error
    )
    throw error
  }
}

/**
 * Main webhook handler - SECURE IMPLEMENTATION
 * 
 * CRITICAL SECURITY ORDER:
 * 1. Signature verification (FIRST, before any processing)
 * 2. Idempotency check
 * 3. Rate limiting
 * 4. Event processing
 * 5. Status logging
 */
export async function POST(request: NextRequest) {
  try {
    // STEP 1: Get raw request body (needed for signature verification)
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')
    const secret = process.env.STRIPE_WEBHOOK_SECRET

    if (!secret) {
      console.error('[Stripe-Webhook] CRITICAL: STRIPE_WEBHOOK_SECRET not configured')
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    if (!signature) {
      console.error('[Stripe-Webhook] SECURITY: Missing stripe-signature header')
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }

    // STEP 2: Verify signature FIRST before any other processing
    const signatureCheckStart = Date.now()
    const signatureCheck = verifyWebhookSignatureSecure(body, signature, secret)
    if (!signatureCheck.valid) {
      console.error(
        `[Stripe-Webhook] SECURITY: Signature verification failed - ${signatureCheck.error}`
      )
      // Record metric for signature failure
      await recordWebhookMetrics({
        eventId: 'unknown',
        eventType: 'signature_failure',
        processingLatencyMs: Date.now() - signatureCheckStart,
        status: 'failed',
        signatureVerified: false,
      })
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // STEP 3: Parse event (safe to do now that signature is verified)
    let event: StripeEvent
    try {
      event = JSON.parse(body)
    } catch (error) {
      console.error('[Stripe-Webhook] JSON parse error:', error)
      return NextResponse.json(
        { error: 'Invalid JSON' },
        { status: 400 }
      )
    }

    const { id: eventId, type: eventType } = event
    const customerId = event.data.object.customer || null
    const subscriptionId = event.data.object.subscription || event.data.object.id || null

    // STEP 4: Check idempotency
    const idempotencyCheck = await checkWebhookIdempotency(eventId)
    if (idempotencyCheck.processed) {
      console.log(`[Stripe-Webhook] Duplicate event: ${eventId} (previous status: ${idempotencyCheck.previousStatus})`)
      await logWebhookEventSecure(
        eventId,
        eventType,
        customerId,
        subscriptionId,
        event.data.object,
        'duplicate'
      )
      return NextResponse.json({ received: true })
    }

    // STEP 5: Check rate limit
    const rateLimitCheck = checkWebhookRateLimit(customerId || '')
    if (!rateLimitCheck.allowed) {
      console.error(
        `[Stripe-Webhook] SECURITY: Rate limit exceeded for customer ${customerId}`
      )
      await logWebhookEventSecure(
        eventId,
        eventType,
        customerId,
        subscriptionId,
        event.data.object,
        'rejected',
        undefined,
        rateLimitCheck.reason
      )
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    // STEP 6: Log as pending
    await logWebhookEventSecure(
      eventId,
      eventType,
      customerId,
      subscriptionId,
      event.data.object,
      'pending'
    )

    // STEP 7: Process based on event type
    const processingStart = Date.now()
    try {
      switch (eventType) {
        case 'customer.subscription.created':
          await handleSubscriptionCreated(event)
          break

        case 'customer.subscription.updated':
          await handleSubscriptionUpdated(event)
          break

        case 'customer.subscription.deleted':
          await handleSubscriptionDeleted(event)
          break

        case 'invoice.payment_succeeded':
          await handlePaymentSucceeded(event)
          break

        case 'invoice.payment_failed':
          await handlePaymentFailed(event)
          break

        default:
          console.log(`[Stripe-Webhook] Unhandled event type: ${eventType}`)
      }

      // Mark as processed
      await logWebhookEventSecure(
        eventId,
        eventType,
        customerId,
        subscriptionId,
        event.data.object,
        'processed'
      )

      // Record success metric
      const processingLatencyMs = Date.now() - processingStart
      await recordWebhookMetrics({
        eventId,
        eventType,
        processingLatencyMs,
        status: 'processed',
        signatureVerified: true,
      })

      return NextResponse.json({ received: true })
    } catch (error) {
      // Processing error - log and return 500
      const errorMsg = error instanceof Error ? error.message : String(error)
      await logWebhookEventSecure(
        eventId,
        eventType,
        customerId,
        subscriptionId,
        event.data.object,
        'failed',
        errorMsg
      )

      // Record failure metric
      const processingLatencyMs = Date.now() - processingStart
      await recordWebhookMetrics({
        eventId,
        eventType,
        processingLatencyMs,
        status: 'failed',
        signatureVerified: true,
      })

      console.error(`[Stripe-Webhook] Processing error for ${eventId}:`, error)

      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('[Stripe-Webhook] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}