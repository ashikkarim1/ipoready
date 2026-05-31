/**
 * Stripe Webhook Verification and Processing
 * Handles HMAC signature verification and webhook deduplication
 */

import crypto from 'crypto'
import { sql } from '@/lib/db'

export interface StripeWebhookEvent {
  id: string
  type: string
  data: {
    object: Record<string, any>
    previous_attributes?: Record<string, any>
  }
  created: number
}

/**
 * Verify Stripe webhook signature
 * Uses HMAC-SHA256 to ensure the webhook came from Stripe
 */
export function verifyWebhookSignature(body: string, signature: string, secret: string): boolean {
  if (!signature || !secret) {
    console.error('Missing signature or webhook secret')
    return false
  }

  try {
    // Extract timestamp and signed content
    const [t, v1] = signature.split(',').map((item) => item.split('=')[1])

    if (!t || !v1) {
      console.error('Invalid signature format')
      return false
    }

    // Create signed content (timestamp + body)
    const signedContent = `${t}.${body}`

    // Calculate expected signature
    const expectedSig = crypto.createHmac('sha256', secret).update(signedContent).digest('hex')

    // Constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(Buffer.from(v1), Buffer.from(expectedSig))
  } catch (error) {
    console.error('Webhook signature verification error:', error)
    return false
  }
}

/**
 * Check if a webhook event has already been processed (idempotency)
 */
export async function hasWebhookBeenProcessed(eventId: string): Promise<boolean> {
  const result = await sql`
    SELECT 1 FROM webhook_logs WHERE event_id = ${eventId} LIMIT 1
  `

  return !!result && result.length > 0
}

/**
 * Log a webhook event to the database
 */
export async function logWebhookEvent(
  eventId: string,
  eventType: string,
  stripeCustomerId: string | null,
  stripeSubscriptionId: string | null,
  payload: Record<string, any>,
  status: 'processed' | 'failed' | 'pending' | 'duplicate' = 'pending',
  errorMessage?: string
) {
  try {
    await sql`
      INSERT INTO webhook_logs (event_id, event_type, stripe_customer_id, stripe_subscription_id, payload, status, error_message)
      VALUES (${eventId}, ${eventType}, ${stripeCustomerId}, ${stripeSubscriptionId}, ${JSON.stringify(payload)}, ${status}, ${errorMessage || null})
      ON CONFLICT (event_id) DO NOTHING
    `
  } catch (error) {
    console.error('Error logging webhook event:', error)
  }
}

/**
 * Update webhook event status
 */
export async function updateWebhookStatus(
  eventId: string,
  status: 'processed' | 'failed' | 'pending' | 'duplicate',
  errorMessage?: string
) {
  try {
    await sql`
      UPDATE webhook_logs
      SET status = ${status}, error_message = ${errorMessage || null}, processed_at = NOW()
      WHERE event_id = ${eventId}
    `
  } catch (error) {
    console.error('Error updating webhook status:', error)
  }
}

/**
 * Get webhook event history for a customer
 */
export async function getWebhookHistory(stripeCustomerId: string, limit = 50) {
  const events = await sql`
    SELECT
      event_id,
      event_type,
      status,
      error_message,
      created_at,
      processed_at
    FROM webhook_logs
    WHERE stripe_customer_id = ${stripeCustomerId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `

  return events
}

/**
 * Extract key data from Stripe webhook payloads
 */
export function extractWebhookData(event: StripeWebhookEvent) {
  const { type, data } = event
  const obj = data.object

  const extractedData = {
    eventId: event.id,
    eventType: type,
    stripeCustomerId: obj.customer || null,
    stripeSubscriptionId: obj.subscription || null,
    timestamp: event.created,
  }

  // Extract specific fields based on event type
  switch (type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      return {
        ...extractedData,
        plan: obj.items?.data?.[0]?.plan?.id || null,
        status: obj.status,
        currentPeriodStart: obj.current_period_start,
        currentPeriodEnd: obj.current_period_end,
        cancelAtPeriodEnd: obj.cancel_at_period_end,
        collectionMethod: obj.collection_method,
      }

    case 'customer.subscription.deleted':
      return {
        ...extractedData,
        status: 'cancelled',
        canceledAt: obj.canceled_at,
      }

    case 'invoice.payment_succeeded':
      return {
        ...extractedData,
        invoiceId: obj.id,
        amount: obj.amount_paid,
        currency: obj.currency,
        paidAt: obj.paid_at,
        status: obj.status,
      }

    case 'invoice.payment_failed':
      return {
        ...extractedData,
        invoiceId: obj.id,
        amount: obj.amount_due,
        currency: obj.currency,
        failureCode: obj.failure_code,
        failureMessage: obj.failure_message,
        nextRetryAt: obj.next_payment_attempt,
        status: 'payment_failed',
      }

    case 'customer.created':
      return {
        ...extractedData,
        email: obj.email,
        description: obj.description,
      }

    default:
      return extractedData
  }
}

/**
 * Retry failed webhook processing
 */
export async function getFailedWebhooksForRetry() {
  const failedEvents = await sql`
    SELECT
      event_id,
      event_type,
      payload,
      error_message,
      created_at
    FROM webhook_logs
    WHERE status = 'failed'
      AND created_at > NOW() - INTERVAL '24 hours'
    ORDER BY created_at ASC
    LIMIT 20
  `

  return failedEvents
}
