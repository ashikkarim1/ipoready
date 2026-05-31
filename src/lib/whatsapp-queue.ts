/**
 * WhatsApp Message Queue
 * Queues messages with priority, enforces rate limits, prevents duplicates
 * Process queue every 5 seconds via cron job
 */

import { sql } from '@/lib/db'
import { sendWhatsAppMessage, SendMessageOptions } from '@/lib/whatsapp-service'

export type MessagePriority = 'urgent' | 'regular'

export interface QueuedMessage {
  phoneNumber: string
  templateId: string
  variables: Record<string, any>
  priority: MessagePriority
  userId?: string
  companyId?: string
  idempotencyKey?: string
}

/**
 * Add a message to the queue
 * Returns queue entry ID
 */
export async function enqueueMessage(message: QueuedMessage): Promise<string> {
  const { phoneNumber, templateId, variables, priority, userId, companyId, idempotencyKey } = message

  // Check for duplicate in last 5 minutes (idempotency)
  if (idempotencyKey) {
    const recent = await sql`
      SELECT id FROM whatsapp_queue
      WHERE idempotency_key = ${idempotencyKey}
        AND created_at > NOW() - INTERVAL '5 minutes'
      LIMIT 1
    `

    if (recent.length > 0) {
      // Duplicate found, return existing ID
      return (recent[0] as { id: string }).id
    }
  }

  // Insert into queue
  const result = await sql`
    INSERT INTO whatsapp_queue (
      phone_number,
      template_id,
      variables,
      priority,
      user_id,
      company_id,
      idempotency_key,
      created_at
    )
    VALUES (
      ${phoneNumber},
      ${templateId},
      ${JSON.stringify(variables)},
      ${priority},
      ${userId || null},
      ${companyId || null},
      ${idempotencyKey || null},
      NOW()
    )
    RETURNING id
  `

  if (!result.length) {
    throw new Error('Failed to enqueue message')
  }

  return (result[0] as { id: string }).id
}

/**
 * Process the message queue
 * Rate limit: max 20 messages per minute
 * Process: fetch queued messages, send, update status
 */
export async function processQueue(): Promise<{
  processed: number
  failed: number
  rateLimited: number
}> {
  const RATE_LIMIT = 20 // messages per minute
  const BATCH_SIZE = 5

  const stats = { processed: 0, failed: 0, rateLimited: 0 }

  try {
    // Check if we've hit rate limit in the last minute
    const recentSent = await sql`
      SELECT COUNT(*) as count
      FROM whatsapp_logs
      WHERE sent_at > NOW() - INTERVAL '1 minute'
        AND status IN ('sent', 'delivered')
    `

    const sentCount = Number((recentSent[0] as any).count)
    if (sentCount >= RATE_LIMIT) {
      console.log(`[whatsapp-queue] Rate limit reached: ${sentCount}/${RATE_LIMIT} messages sent this minute`)
      stats.rateLimited = 0
      return stats
    }

    // Fetch urgent messages first, then regular
    const messagesToProcess = await sql`
      SELECT id, phone_number, template_id, variables, user_id, company_id, priority
      FROM whatsapp_queue
      WHERE status = 'pending'
      ORDER BY
        CASE WHEN priority = 'urgent' THEN 0 ELSE 1 END,
        created_at ASC
      LIMIT ${BATCH_SIZE}
    `

    for (const msg of messagesToProcess as any[]) {
      try {
        // Don't exceed rate limit
        if (stats.processed + sentCount >= RATE_LIMIT) {
          stats.rateLimited++
          continue
        }

        const options: SendMessageOptions = {
          phoneNumber: msg.phone_number,
          templateId: msg.template_id,
          variables: JSON.parse(msg.variables),
          userId: msg.user_id,
          companyId: msg.company_id,
        }

        await sendWhatsAppMessage(options)

        // Mark as processed
        await sql`
          UPDATE whatsapp_queue
          SET status = 'processed', processed_at = NOW()
          WHERE id = ${msg.id}
        `

        stats.processed++
      } catch (err) {
        console.error(`[whatsapp-queue] Failed to process message ${msg.id}:`, err)

        // Increment retry count
        const retryCount = (msg.retry_count || 0) + 1
        const MAX_RETRIES = 5

        if (retryCount >= MAX_RETRIES) {
          // Give up after max retries
          await sql`
            UPDATE whatsapp_queue
            SET
              status = 'failed',
              retry_count = ${retryCount},
              failed_at = NOW()
            WHERE id = ${msg.id}
          `
        } else {
          // Exponential backoff: retry_count * 5 seconds
          const delaySeconds = Math.min(retryCount * 5 * 60, 1800) // max 30 min
          await sql`
            UPDATE whatsapp_queue
            SET
              status = 'pending',
              retry_count = ${retryCount},
              next_retry_at = NOW() + INTERVAL '${delaySeconds} seconds'
            WHERE id = ${msg.id}
          `
        }

        stats.failed++
      }
    }

    return stats
  } catch (err) {
    console.error('[whatsapp-queue] Process queue error:', err)
    throw err
  }
}

/**
 * Check for duplicate messages to same phone in last 5 minutes
 */
export async function checkDuplicate(phoneNumber: string): Promise<boolean> {
  const rows = await sql`
    SELECT id FROM whatsapp_logs
    WHERE phone_number = ${phoneNumber}
      AND sent_at > NOW() - INTERVAL '5 minutes'
    LIMIT 1
  `

  return rows.length > 0
}

/**
 * Get queue stats
 */
export async function getQueueStats(): Promise<{
  pending: number
  processed: number
  failed: number
  totalQueued: number
}> {
  const rows = await sql`
    SELECT
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
      COUNT(CASE WHEN status = 'processed' THEN 1 END) as processed,
      COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
      COUNT(*) as total
    FROM whatsapp_queue
  `

  if (!rows.length) {
    return { pending: 0, processed: 0, failed: 0, totalQueued: 0 }
  }

  const row = rows[0] as any
  return {
    pending: Number(row.pending),
    processed: Number(row.processed),
    failed: Number(row.failed),
    totalQueued: Number(row.total),
  }
}

/**
 * Clear old queue entries (older than 30 days)
 */
export async function cleanupOldEntries(): Promise<number> {
  const result = await sql`
    DELETE FROM whatsapp_queue
    WHERE created_at < NOW() - INTERVAL '30 days'
  `

  const count = (result as any)?.count ?? (result as any)?.rowCount ?? (Array.isArray(result) ? result.length : 0)
  return count ?? 0
}
