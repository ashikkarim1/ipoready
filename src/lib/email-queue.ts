import { sendEmail, SendEmailOptions, logEmailToDB } from '@/lib/email-service'

interface QueuedEmail {
  id: string
  to: string
  templateId: string
  variables: Record<string, any>
  userId?: string
  companyId?: string
  tags?: string[]
  enqueuedAt: number
  attempts: number
}

class EmailQueue {
  private queue: Map<string, QueuedEmail> = new Map()
  private processing: boolean = false
  private processInterval: number = 10000 // 10 seconds
  private intervalId: NodeJS.Timeout | null = null
  private recentSends: Map<string, string> = new Map() // Track recent sends to prevent duplicates (maps dedupeKey to emailId)

  constructor() {
    this.startProcessing()
  }

  /**
   * Generate a unique key for deduplication
   */
  private getDeduplicationKey(to: string, templateId: string, withinSeconds: number = 300): string {
    return `${to}:${templateId}:${Math.floor(Date.now() / (withinSeconds * 1000))}`
  }

  /**
   * Enqueue an email for sending
   */
  public enqueue(options: SendEmailOptions): string {
    const to = options.to.toLowerCase().trim()

    // Check for recent sends to prevent duplicates
    const dedupeKey = this.getDeduplicationKey(to, options.templateId)
    if (this.recentSends.has(dedupeKey)) {
      console.log(`[email-queue] Skipped duplicate email: ${options.templateId} to ${to}`)
      return this.recentSends.get(dedupeKey) || ''
    }

    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const queuedEmail: QueuedEmail = {
      id,
      to,
      templateId: options.templateId,
      variables: options.variables,
      userId: options.userId,
      companyId: options.companyId,
      tags: options.tags,
      enqueuedAt: Date.now(),
      attempts: 0,
    }

    this.queue.set(id, queuedEmail)
    this.recentSends.set(dedupeKey, id)

    console.log(`[email-queue] Enqueued email: ${options.templateId} to ${to} (ID: ${id}, Queue size: ${this.queue.size})`)

    return id
  }

  /**
   * Get queue size
   */
  public getQueueSize(): number {
    return this.queue.size
  }

  /**
   * Start processing queue
   */
  private startProcessing(): void {
    if (this.intervalId !== null) {
      return
    }

    this.intervalId = setInterval(() => {
      this.process().catch(err => console.error('[email-queue] Processing error:', err))
    }, this.processInterval)

    console.log('[email-queue] Processing started (interval: 10s)')
  }

  /**
   * Stop processing queue
   */
  public stopProcessing(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId)
      this.intervalId = null
      console.log('[email-queue] Processing stopped')
    }
  }

  /**
   * Process queue - send all pending emails
   */
  private async process(): Promise<void> {
    if (this.processing || this.queue.size === 0) {
      return
    }

    this.processing = true

    try {
      const entries = Array.from(this.queue.entries())
      const BATCH_SIZE = 10 // Send up to 10 emails per batch

      for (let i = 0; i < entries.length; i += BATCH_SIZE) {
        const batch = entries.slice(i, i + BATCH_SIZE)

        // Send batch in parallel
        await Promise.all(
          batch.map(async ([id, email]) => {
            try {
              const result = await sendEmail({
                to: email.to,
                templateId: email.templateId as any,
                variables: email.variables,
                userId: email.userId,
                companyId: email.companyId,
                tags: email.tags,
              })

              if (result.success) {
                // Remove from queue
                this.queue.delete(id)
                console.log(`[email-queue] Sent: ${email.templateId} to ${email.to}`)
              } else {
                // Increment attempts
                email.attempts += 1

                if (email.attempts >= 3) {
                  // Give up after 3 attempts
                  console.error(`[email-queue] Giving up on ${email.templateId} to ${email.to} after ${email.attempts} attempts`)
                  this.queue.delete(id)
                } else {
                  console.log(`[email-queue] Failed (attempt ${email.attempts}/3): ${email.templateId} to ${email.to}`)
                }
              }
            } catch (err) {
              console.error(`[email-queue] Error processing ${id}:`, err)
              email.attempts += 1

              if (email.attempts >= 3) {
                this.queue.delete(id)
              }
            }
          })
        )

        // Small delay between batches
        if (i + BATCH_SIZE < entries.length) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }

      if (this.queue.size > 0) {
        console.log(`[email-queue] Processed batch. ${this.queue.size} emails remaining in queue.`)
      }
    } finally {
      this.processing = false
    }
  }

  /**
   * Force process queue immediately
   */
  public async processNow(): Promise<void> {
    await this.process()
  }

  /**
   * Get pending emails (for debugging)
   */
  public getPending(): QueuedEmail[] {
    return Array.from(this.queue.values())
  }

  /**
   * Clear queue (use with caution)
   */
  public clear(): void {
    const size = this.queue.size
    this.queue.clear()
    this.recentSends.clear()
    console.log(`[email-queue] Cleared ${size} emails from queue`)
  }
}

// Global singleton instance
let globalQueue: EmailQueue | null = null

/**
 * Get the global email queue instance
 */
export function getEmailQueue(): EmailQueue {
  if (!globalQueue) {
    globalQueue = new EmailQueue()
  }
  return globalQueue
}

/**
 * Enqueue an email
 */
export function enqueueEmail(options: SendEmailOptions): string {
  return getEmailQueue().enqueue(options)
}

/**
 * Get queue size
 */
export function getQueueSize(): number {
  return getEmailQueue().getQueueSize()
}

/**
 * Process queue immediately
 */
export async function processQueue(): Promise<void> {
  await getEmailQueue().processNow()
}

/**
 * Get pending emails (for debugging)
 */
export function getPendingEmails(): QueuedEmail[] {
  return getEmailQueue().getPending()
}

/**
 * Clear queue (use with caution)
 */
export function clearQueue(): void {
  getEmailQueue().clear()
}

/**
 * Stop queue processing (useful for cleanup)
 */
export function stopQueue(): void {
  getEmailQueue().stopProcessing()
}
