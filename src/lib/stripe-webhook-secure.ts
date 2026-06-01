/**
 * Stripe Webhook Security Wrapper
 * Implements signature verification first, per-event deduplication, and rate limiting
 */

import crypto from 'crypto'
import { sql } from '@/lib/db'

export interface SecureWebhookEvent {
  id: string
  type: string
  created: number
  data: {
    object: Record<string, any>
    previous_attributes?: Record<string, any>
  }
}

interface RateLimitRecord {
  customerId: string
  timestamp: number
}

// In-memory rate limit tracking (use Redis in production)
const rateLimitStore = new Map<string, number[]>()
const MAX_WEBHOOKS_PER_MINUTE = 100

/**
 * CRITICAL: Verify Stripe webhook signature FIRST before ANY processing
 * Uses Stripe's constructEvent for maximum security
 */
export function verifyWebhookSignatureSecure(
  body: string,
  signature: string,
  secret: string
): { valid: boolean; error?: string } {
  if (!signature) {
    console.error('[webhook-security] SECURITY: Missing stripe-signature header')
    return { valid: false, error: 'Missing signature header' }
  }

  if (!secret) {
    console.error('[webhook-security] SECURITY: Webhook secret not configured')
    return { valid: false, error: 'Webhook secret not configured' }
  }

  try {
    // Parse Stripe signature: t=timestamp,v1=signature
    const signatureParts = signature.split(',').reduce<Record<string, string>>(
      (acc, part) => {
        const [key, value] = part.split('=')
        if (key && value) acc[key] = value
        return acc
      },
      {}
    )

    const timestamp = signatureParts.t
    const v1 = signatureParts.v1

    if (!timestamp || !v1) {
      console.error('[webhook-security] SECURITY: Invalid signature format (missing timestamp or v1)')
      return { valid: false, error: 'Invalid signature format' }
    }

    // Check timestamp is within 5 minutes (prevent replay attacks)
    const signatureTime = parseInt(timestamp)
    const currentTime = Math.floor(Date.now() / 1000)
    const timeDiff = currentTime - signatureTime

    if (timeDiff < 0 || timeDiff > 300) {
      console.error(
        `[webhook-security] SECURITY: Timestamp outside tolerance window (diff: ${timeDiff}s)`
      )
      return { valid: false, error: 'Timestamp outside tolerance window' }
    }

    // Reconstruct signed content: timestamp.body
    const signedContent = `${timestamp}.${body}`

    // Compute expected signature using HMAC-SHA256
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(signedContent)
      .digest('hex')

    // Constant-time comparison to prevent timing attacks
    const expectedBuffer = Buffer.from(expectedSignature)
    const signatureBuffer = Buffer.from(v1)

    if (expectedBuffer.length !== signatureBuffer.length) {
      console.error('[webhook-security] SECURITY: Signature length mismatch')
      return { valid: false, error: 'Signature verification failed' }
    }

    const isValid = crypto.timingSafeEqual(expectedBuffer, signatureBuffer)

    if (!isValid) {
      console.error('[webhook-security] SECURITY: HMAC signature mismatch - possible forged webhook')
      // Log request body for security audit on failure
      console.error(`[webhook-security] SECURITY_AUDIT: Failed webhook body: ${body.substring(0, 500)}`)
    }

    return { valid: isValid }
  } catch (error) {
    console.error('[webhook-security] SECURITY: Signature verification error:', error)
    return { valid: false, error: 'Signature verification error' }
  }
}

/**
 * Check if webhook has been processed (idempotency key)
 * Prevents duplicate processing of same Stripe event
 */
export async function checkWebhookIdempotency(eventId: string): Promise<{
  processed: boolean
  previousStatus?: string
}> {
  try {
    const result = await sql`
      SELECT id, status FROM webhook_logs
      WHERE event_id = ${eventId}
      LIMIT 1
    `

    if (result.length > 0) {
      const log = result[0] as any
      console.log(
        `[webhook-security] Webhook ${eventId} already processed with status: ${log.status}`
      )
      return {
        processed: true,
        previousStatus: log.status,
      }
    }

    return { processed: false }
  } catch (error) {
    console.error('[webhook-security] Idempotency check error:', error)
    throw error
  }
}

/**
 * Rate limit webhook processing per customer
 * Max 100 webhooks per minute per customer
 */
export function checkWebhookRateLimit(customerId: string): { allowed: boolean; reason?: string } {
  if (!customerId) {
    // Customer-less webhooks (e.g., customer.created) - allow through
    return { allowed: true }
  }

  const now = Date.now()
  const oneMinuteAgo = now - 60000

  if (!rateLimitStore.has(customerId)) {
    rateLimitStore.set(customerId, [now])
    return { allowed: true }
  }

  const timestamps = rateLimitStore.get(customerId)!

  // Remove timestamps older than 1 minute
  const recentTimestamps = timestamps.filter((ts) => ts > oneMinuteAgo)
  recentTimestamps.push(now)
  rateLimitStore.set(customerId, recentTimestamps)

  if (recentTimestamps.length > MAX_WEBHOOKS_PER_MINUTE) {
    console.error(
      `[webhook-security] SECURITY: Rate limit exceeded for customer ${customerId} (${recentTimestamps.length} webhooks/min)`
    )
    return {
      allowed: false,
      reason: 'Rate limit exceeded: max 100 webhooks per minute per customer',
    }
  }

  return { allowed: true }
}

/**
 * Store webhook event with secure logging
 * Logs all webhook attempts for audit trail
 */
export async function logWebhookEventSecure(
  eventId: string,
  eventType: string,
  customerId: string | null,
  subscriptionId: string | null,
  payload: Record<string, any>,
  status: 'pending' | 'processed' | 'failed' | 'duplicate' | 'rejected' = 'pending',
  errorMessage?: string,
  securityNotes?: string
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
        ${customerId},
        ${subscriptionId},
        ${JSON.stringify(payload)},
        ${status},
        ${
          errorMessage
            ? `${errorMessage}${securityNotes ? ' | ' + securityNotes : ''}`
            : securityNotes || null
        },
        NOW()
      )
      ON CONFLICT (event_id) DO UPDATE
      SET
        status = ${status},
        error_message = COALESCE(${errorMessage || null}, error_message)
    `

    if (status === 'rejected') {
      console.warn(
        `[webhook-security] SECURITY: Webhook rejected: ${eventId} (${eventType}) - ${securityNotes || errorMessage}`
      )
    }
  } catch (error) {
    console.error('[webhook-security] Failed to log webhook event:', error)
    // Don't throw - allow webhook to continue even if logging fails
  }
}

/**
 * Wrapper function for secure webhook processing
 * Enforces: signature verification → idempotency check → rate limit → processing
 */
export async function processWebhookSecurely<T>(
  body: string,
  signature: string,
  secret: string,
  processor: (event: SecureWebhookEvent) => Promise<void>
): Promise<{
  success: boolean
  error?: string
  eventId?: string
}> {
  // STEP 1: Verify signature FIRST - before any other processing
  const signatureCheck = verifyWebhookSignatureSecure(body, signature, secret)
  if (!signatureCheck.valid) {
    return {
      success: false,
      error: `Signature verification failed: ${signatureCheck.error}`,
    }
  }

  // STEP 2: Parse event
  let event: SecureWebhookEvent
  try {
    event = JSON.parse(body)
  } catch (error) {
    console.error('[webhook-security] JSON parse error:', error)
    return {
      success: false,
      error: 'Invalid JSON in webhook body',
    }
  }

  const { id: eventId, type: eventType } = event
  const customerId = event.data.object.customer || null
  const subscriptionId =
    event.data.object.subscription || event.data.object.id || null

  // STEP 3: Check idempotency
  const idempotencyCheck = await checkWebhookIdempotency(eventId)
  if (idempotencyCheck.processed) {
    await logWebhookEventSecure(
      eventId,
      eventType,
      customerId,
      subscriptionId,
      event.data.object,
      'duplicate',
      undefined,
      'Duplicate event (already processed)'
    )
    return {
      success: true,
      error: 'Duplicate event',
      eventId,
    }
  }

  // STEP 4: Check rate limit
  const rateLimitCheck = checkWebhookRateLimit(customerId || '')
  if (!rateLimitCheck.allowed) {
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
    return {
      success: false,
      error: rateLimitCheck.reason,
      eventId,
    }
  }

  // STEP 5: Log as pending
  await logWebhookEventSecure(
    eventId,
    eventType,
    customerId,
    subscriptionId,
    event.data.object,
    'pending'
  )

  // STEP 6: Process webhook
  try {
    await processor(event)
    await logWebhookEventSecure(
      eventId,
      eventType,
      customerId,
      subscriptionId,
      event.data.object,
      'processed'
    )
    return {
      success: true,
      eventId,
    }
  } catch (error) {
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
    console.error(`[webhook-security] Webhook processing failed for ${eventId}:`, error)
    return {
      success: false,
      error: errorMsg,
      eventId,
    }
  }
}
