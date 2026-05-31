/**
 * Slack Message Queue
 * Manages queuing, deduplication, and rate-limited delivery of Slack messages
 */

import { SlackTemplateId } from './slack-templates'
import { sql } from './db'
import { sendSlackMessage } from './slack-service'

const RATE_LIMIT_PER_MINUTE = 30
const DEDUP_WINDOW_MS = 5 * 60 * 1000 // 5 minutes
const PROCESS_INTERVAL_MS = 5000 // 5 seconds
const BATCH_SIZE = 5

export type SlackMessagePriority = 'urgent' | 'regular'

export interface QueuedSlackMessage {
  id?: string
  userId: string
  templateId: SlackTemplateId
  variables: Record<string, any>
  priority: SlackMessagePriority
  idempotencyKey?: string
  status?: 'pending' | 'processed' | 'failed'
  retryCount?: number
}

interface MessageInQueue {
  id: string
  user_id: string
  template_id: string
  variables: Record<string, any>
  priority: SlackMessagePriority
  status: string
  idempotency_key?: string
  retry_count: number
  created_at: string
}

/**
 * In-memory queue for local processing
 */
let messageQueue: QueuedSlackMessage[] = []
let lastRateLimitReset = Date.now()
let messagesThisMinute = 0
let isProcessing = false

/**
 * Enqueue a Slack message
 */
export async function enqueueSlackMessage(
  message: QueuedSlackMessage
): Promise<string> {
  try {
    // Check for duplicates in the last 5 minutes
    if (message.idempotencyKey) {
      const existing = await sql`
        SELECT id FROM slack_queue
        WHERE idempotency_key = ${message.idempotencyKey}
        AND created_at > NOW() - INTERVAL '5 minutes'
        AND status = 'pending'
        LIMIT 1
      `

      if (existing.length > 0) {
        console.log('[slack-queue] Duplicate message detected, skipping')
        return existing[0].id
      }
    }

    // Insert into database
    const result = await sql`
      INSERT INTO slack_queue (
        user_id,
        template_id,
        variables,
        priority,
        idempotency_key,
        status
      ) VALUES (
        ${message.userId},
        ${message.templateId},
        ${JSON.stringify(message.variables)},
        ${message.priority || 'regular'},
        ${message.idempotencyKey || null},
        'pending'
      )
      RETURNING id
    `

    const messageId = result[0]?.id || 'unknown'

    // Also add to in-memory queue
    messageQueue.push({
      ...message,
      id: messageId,
      status: 'pending',
      retryCount: 0,
    })

    console.log(`[slack-queue] Message ${messageId} enqueued`)
    return messageId
  } catch (err) {
    console.error('[slack-queue] Failed to enqueue message:', err)
    // Fall back to in-memory only
    const id = `local-${Date.now()}-${Math.random()}`
    messageQueue.push({
      ...message,
      id,
      status: 'pending',
      retryCount: 0,
    })
    return id
  }
}

/**
 * Process pending messages from database
 */
async function processPendingMessages(): Promise<void> {
  if (isProcessing) {
    return
  }

  isProcessing = true

  try {
    // Get pending messages from DB, prioritize urgent ones
    const pending = await sql`
      SELECT * FROM slack_queue
      WHERE status = 'pending'
      ORDER BY priority = 'urgent' DESC, created_at ASC
      LIMIT ${BATCH_SIZE}
    `

    for (const msg of pending as MessageInQueue[]) {
      // Check rate limiting
      if (!checkRateLimit()) {
        console.log('[slack-queue] Rate limit reached, pausing processing')
        break
      }

      try {
        // Send message
        const result = await sendSlackMessage({
          userId: msg.user_id,
          templateId: msg.template_id as SlackTemplateId,
          variables: msg.variables,
        })

        if (result.success) {
          // Mark as processed
          await sql`
            UPDATE slack_queue
            SET status = 'processed'
            WHERE id = ${msg.id}
          `
          console.log(`[slack-queue] Message ${msg.id} sent successfully`)
        } else {
          // Increment retry count
          const newRetryCount = (msg.retry_count || 0) + 1
          if (newRetryCount >= 3) {
            // Give up after 3 retries
            await sql`
              UPDATE slack_queue
              SET status = 'failed', retry_count = ${newRetryCount}
              WHERE id = ${msg.id}
            `
            console.log(`[slack-queue] Message ${msg.id} failed after ${newRetryCount} retries`)
          } else {
            // Schedule next retry
            const nextRetry = new Date(Date.now() + 30000) // 30s from now
            await sql`
              UPDATE slack_queue
              SET status = 'pending', retry_count = ${newRetryCount}, next_retry_at = ${nextRetry.toISOString()}
              WHERE id = ${msg.id}
            `
          }
        }
      } catch (err) {
        console.error(`[slack-queue] Error processing message ${msg.id}:`, err)
      }
    }
  } catch (err) {
    console.error('[slack-queue] Error processing queue:', err)
  } finally {
    isProcessing = false
  }
}

/**
 * Check and update rate limiting
 */
function checkRateLimit(): boolean {
  const now = Date.now()
  const timeSinceReset = now - lastRateLimitReset

  // Reset counter every minute
  if (timeSinceReset > 60000) {
    lastRateLimitReset = now
    messagesThisMinute = 0
  }

  // Check if we can send
  if (messagesThisMinute >= RATE_LIMIT_PER_MINUTE) {
    return false
  }

  messagesThisMinute++
  return true
}

/**
 * Get queue size
 */
export function getQueueSize(): number {
  return messageQueue.length
}

/**
 * Get pending messages from memory queue
 */
export function getPendingMessages(): QueuedSlackMessage[] {
  return messageQueue.filter((m) => m.status === 'pending')
}

/**
 * Get queue status
 */
export async function getQueueStatus(): Promise<{
  pendingCount: number
  failedCount: number
  processedCount: number
  totalInMemory: number
  isProcessing: boolean
  messagesThisMinute: number
}> {
  try {
    const pending = await sql`SELECT COUNT(*) as count FROM slack_queue WHERE status = 'pending'`
    const failed = await sql`SELECT COUNT(*) as count FROM slack_queue WHERE status = 'failed'`
    const processed = await sql`SELECT COUNT(*) as count FROM slack_queue WHERE status = 'processed'`

    return {
      pendingCount: parseInt(pending[0]?.count || '0'),
      failedCount: parseInt(failed[0]?.count || '0'),
      processedCount: parseInt(processed[0]?.count || '0'),
      totalInMemory: messageQueue.length,
      isProcessing,
      messagesThisMinute,
    }
  } catch (err) {
    console.error('[slack-queue] Failed to get queue status:', err)
    return {
      pendingCount: 0,
      failedCount: 0,
      processedCount: 0,
      totalInMemory: messageQueue.length,
      isProcessing,
      messagesThisMinute,
    }
  }
}

/**
 * Clear failed messages older than X days
 */
export async function clearOldFailedMessages(daysOld: number = 7): Promise<number> {
  try {
    const cutoff = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000)
    const result = await sql`
      DELETE FROM slack_queue
      WHERE status = 'failed'
      AND created_at < ${cutoff.toISOString()}
    `
    const count = (result as any)?.count ?? (result as any)?.rowCount ?? (Array.isArray(result) ? result.length : 0)
    return count ?? 0
  } catch (err) {
    console.error('[slack-queue] Failed to clear old messages:', err)
    return 0
  }
}

/**
 * Start the queue processor
 * Run this on server startup
 */
export function startQueueProcessor(): void {
  console.log('[slack-queue] Starting queue processor')

  const intervalId = setInterval(async () => {
    try {
      await processPendingMessages()
    } catch (err) {
      console.error('[slack-queue] Error in queue processor:', err)
    }
  }, PROCESS_INTERVAL_MS)

  // Allow graceful shutdown
  process.on('SIGTERM', () => {
    clearInterval(intervalId)
    console.log('[slack-queue] Queue processor stopped')
  })
}

/**
 * Manually trigger queue processing (for testing)
 */
export async function processQueueManually(): Promise<void> {
  await processPendingMessages()
}
