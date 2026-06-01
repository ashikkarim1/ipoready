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
 * Verify Stripe webhook signature using HMAC-SHA256
 * Implements Stripe's verification protocol: timestamp.signed_content
 */
export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  if (!signature || !secret) {
    console.error('Missing signature or webhook secret')
    return false
  }

  try {
    // Stripe signature format: t=timestamp,v1=signature
    const signatureParts = signature.split(',').reduce<Record<string, string>>(
      (acc, part) => {
        const [key, value] = part.split('=')
        acc[key] = value
        return acc
      },
      {}
    )

    const timestamp = signatureParts.t
    const v1 = signatureParts.v1

    if (!timestamp || !v1) {
      console.error('Invalid signature format: missing timestamp or v1')
      return false
    }

    // Stripe expects: timestamp + '.' + body
    const signedContent = `${timestamp}.${body}`

    // Calculate expected signature using secret
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(signedContent)
      .digest('hex')

    // Constant-time comparison to prevent timing attacks
    const expectedBuffer = Buffer.from(expectedSignature)
    const signatureBuffer = Buffer.from(v1)

    if (expectedBuffer.length !== signatureBuffer.length) {
      console.error('Signature length mismatch')
      return false
    }

    return crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
  } catch (error) {
    console.error('Webhook signature verification error:', error)
    return false
  }
}

/**
 * Check if a webhook event has already been processed (idempotency)
 * Prevents duplicate processing of the same event
 */
export async function hasWebhookBeenProcessed(eventId: string): Promise<boolean> {
  try {
    const result = await sql`
      SELECT id FROM webhook_logs WHERE event_id = ${eventId} LIMIT 1
    `
    return result.length > 0
  } catch (error) {
    console.error('Error checking webhook idempotency:', error)
    throw error
  }
}

/**
 * Check if a specific webhook event has been processed successfully
 */
export async function hasProcessedEvent(eventId: string): Promise<boolean> {
  try {
    const result = await sql`
      SELECT id FROM webhook_logs
      WHERE event_id = ${eventId} AND status = 'processed'
      LIMIT 1
    `
    return result.length > 0
  } catch (error) {
    console.error('Error checking processed event:', error)
    throw error
  }
}

/**
 * Store processed event in webhook_logs table for idempotency and audit trail
 */
export async function markEventProcessed(
  eventId: string,
  eventType: string,
  payload: Record<string, any>
): Promise<void> {
  try {
    await sql`
      INSERT INTO webhook_logs (
        event_id,
        event_type,
        payload,
        status,
        processed_at
      )
      VALUES (
        ${eventId},
        ${eventType},
        ${JSON.stringify(payload)},
        'processed',
        NOW()
      )
      ON CONFLICT (event_id) DO UPDATE
      SET status = 'processed', processed_at = NOW()
    `
  } catch (error) {
    console.error('Error marking event as processed:', error)
    throw error
  }
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
): Promise<void> {
  try {
    await sql`
      INSERT INTO webhook_logs (
        event_id,
        event_type,
        stripe_customer_id,
        stripe_subscription_id,
        payload,
        status,
        error_message,
        created_at
      )
      VALUES (
        ${eventId},
        ${eventType},
        ${stripeCustomerId},
        ${stripeSubscriptionId},
        ${JSON.stringify(payload)},
        ${status},
        ${errorMessage || null},
        NOW()
      )
      ON CONFLICT (event_id) DO NOTHING
    `
  } catch (error) {
    console.error('Error logging webhook event:', error)
  }
}

/**
 * Update webhook event status after processing
 */
export async function updateWebhookStatus(
  eventId: string,
  status: 'processed' | 'failed' | 'pending' | 'duplicate',
  errorMessage?: string
): Promise<void> {
  try {
    await sql`
      UPDATE webhook_logs
      SET
        status = ${status},
        error_message = ${errorMessage || null},
        processed_at = NOW()
      WHERE event_id = ${eventId}
    `
  } catch (error) {
    console.error('Error updating webhook status:', error)
  }
}

/**
 * Get webhook event history for a customer
 */
export async function getWebhookHistory(
  stripeCustomerId: string,
  limit = 50
): Promise<Array<Record<string, any>>> {
  try {
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
    return events as Array<Record<string, any>>
  } catch (error) {
    console.error('Error fetching webhook history:', error)
    throw error
  }
}

/**
 * Extract key data from Stripe webhook payloads
 */
export function extractWebhookData(event: StripeWebhookEvent): Record<string, any> {
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
        trialEnd: obj.trial_end,
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
 * Get failed webhooks for retry processing
 */
export async function getFailedWebhooksForRetry(): Promise<Array<Record<string, any>>> {
  try {
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
    return failedEvents as Array<Record<string, any>>
  } catch (error) {
    console.error('Error fetching failed webhooks:', error)
    throw error
  }
}

/**
 * Delete old webhook logs (older than 90 days) for cleanup
 */
export async function cleanupOldWebhookLogs(daysOld = 90): Promise<number> {
  try {
    const result = await sql`
      DELETE FROM webhook_logs
      WHERE created_at < NOW() - INTERVAL '${daysOld} days'
    `
    return result.length ?? 0
  } catch (error) {
    console.error('Error cleaning up old webhook logs:', error)
    throw error
  }
}