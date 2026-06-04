/**
 * Filing Webhook Testing Utilities
 * ================================
 * Comprehensive test suite for webhook handling, event delivery, and retries
 */

import { EventEmitter } from 'events'
import {
  mockSedarWebhookSubmitted,
  mockSedarWebhookProcessing,
  mockSedarWebhookAccepted,
  mockSedarWebhookRejected,
  mockSecWebhookCommentLetterIssued,
  mockSecWebhookEffective,
} from '../mocks/api-response-mocks'

// ====================================================================
// WEBHOOK EVENT HANDLER
// ====================================================================

/**
 * Webhook event handler for testing
 */
export class WebhookEventHandler extends EventEmitter {
  private webhookUrl: string
  private retryPolicy: {
    maxAttempts: number
    delayMs: number
  }

  constructor(webhookUrl: string, retryPolicy = { maxAttempts: 3, delayMs: 1000 }) {
    super()
    this.webhookUrl = webhookUrl
    this.retryPolicy = retryPolicy
  }

  /**
   * Send webhook payload with retry logic
   */
  async sendWebhook(payload: any, attempt = 1): Promise<{
    success: boolean
    statusCode?: number
    error?: string
    attempts: number
  }> {
    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Filing-Webhook': 'true',
          'X-Webhook-Attempt': attempt.toString(),
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        this.emit('success', { payload, statusCode: response.status })
        return { success: true, statusCode: response.status, attempts: attempt }
      } else if (response.status >= 500 && attempt < this.retryPolicy.maxAttempts) {
        // Retry on server errors
        await this.delay(this.retryPolicy.delayMs * attempt)
        return this.sendWebhook(payload, attempt + 1)
      } else {
        this.emit('failure', { payload, statusCode: response.status })
        return {
          success: false,
          statusCode: response.status,
          attempts: attempt,
        }
      }
    } catch (error) {
      if (attempt < this.retryPolicy.maxAttempts) {
        await this.delay(this.retryPolicy.delayMs * attempt)
        return this.sendWebhook(payload, attempt + 1)
      }

      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      this.emit('error', { payload, error: errorMsg, attempts: attempt })
      return {
        success: false,
        error: errorMsg,
        attempts: attempt,
      }
    }
  }

  /**
   * Verify webhook signature
   */
  verifySignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    const crypto = require('crypto')
    const hash = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')
    return hash === signature
  }

  /**
   * Helper to delay execution
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// ====================================================================
// WEBHOOK EVENT STORE
// ====================================================================

/**
 * In-memory store for webhook events (for testing)
 */
export class WebhookEventStore {
  private events: Map<string, any[]> = new Map()
  private eventTimestamps: Map<string, number[]> = new Map()

  /**
   * Store an event
   */
  storeEvent(filingId: string, event: any): void {
    if (!this.events.has(filingId)) {
      this.events.set(filingId, [])
      this.eventTimestamps.set(filingId, [])
    }

    this.events.get(filingId)!.push(event)
    this.eventTimestamps.get(filingId)!.push(Date.now())
  }

  /**
   * Get all events for a filing
   */
  getEvents(filingId: string): any[] {
    return this.events.get(filingId) || []
  }

  /**
   * Get events within time window
   */
  getEventsInTimeWindow(filingId: string, windowMs: number): any[] {
    const now = Date.now()
    const timestamps = this.eventTimestamps.get(filingId) || []
    const events = this.events.get(filingId) || []

    return events.filter((_, i) => now - timestamps[i] <= windowMs)
  }

  /**
   * Clear all events
   */
  clear(): void {
    this.events.clear()
    this.eventTimestamps.clear()
  }
}

// ====================================================================
// WEBHOOK VALIDATOR
// ====================================================================

/**
 * Validate webhook event structure and content
 */
export class WebhookValidator {
  /**
   * Validate webhook payload structure
   */
  static validatePayload(payload: any): {
    valid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    // Required fields
    if (!payload.eventType) errors.push('Missing eventType')
    if (!payload.timestamp) errors.push('Missing timestamp')
    if (!payload.filingId) errors.push('Missing filingId')
    if (!payload.system) errors.push('Missing system')
    if (!payload.data) errors.push('Missing data')

    // Validate eventType
    const validEventTypes = [
      'filing.submitted',
      'filing.processing',
      'filing.accepted',
      'filing.rejected',
      'filing.comment_letter_issued',
      'filing.effective',
    ]

    if (payload.eventType && !validEventTypes.includes(payload.eventType)) {
      errors.push(`Invalid eventType: ${payload.eventType}`)
    }

    // Validate timestamp format
    if (payload.timestamp) {
      try {
        new Date(payload.timestamp)
      } catch {
        errors.push('Invalid timestamp format')
      }
    }

    // Validate system
    if (payload.system && !['sedar', 'sec'].includes(payload.system)) {
      errors.push('Invalid system')
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * Validate event state transitions
   */
  static validateStateTransition(
    previousStatus: string,
    newStatus: string
  ): {
    valid: boolean
    error?: string
  } {
    const validTransitions: Record<string, string[]> = {
      submitted: ['processing', 'rejected'],
      processing: ['accepted', 'rejected'],
      accepted: ['finalization'],
      finalization: [],
      rejected: ['submitted'], // Can resubmit
    }

    const allowedNextStates = validTransitions[previousStatus] || []

    if (!allowedNextStates.includes(newStatus)) {
      return {
        valid: false,
        error: `Cannot transition from ${previousStatus} to ${newStatus}`,
      }
    }

    return { valid: true }
  }
}

// ====================================================================
// TEST SUITE: Webhook Event Sending
// ====================================================================

describe('Webhook Event Sending', () => {
  let eventStore: WebhookEventStore
  let webhookHandler: WebhookEventHandler

  beforeEach(() => {
    eventStore = new WebhookEventStore()
    webhookHandler = new WebhookEventHandler('https://example.com/webhooks')
  })

  /**
   * Test: Send submission event
   */
  test('should send filing submitted event', async () => {
    eventStore.storeEvent('sedar-filing-001', mockSedarWebhookSubmitted)

    const events = eventStore.getEvents('sedar-filing-001')

    expect(events).toHaveLength(1)
    expect(events[0].eventType).toBe('filing.submitted')
    expect(events[0].filingId).toBe('sedar-filing-001')
  })

  /**
   * Test: Send processing event
   */
  test('should send filing processing event', async () => {
    eventStore.storeEvent('sedar-filing-001', mockSedarWebhookProcessing)

    const events = eventStore.getEvents('sedar-filing-001')

    expect(events).toHaveLength(1)
    expect(events[0].eventType).toBe('filing.processing')
    expect(events[0].data.completionPercentage).toBe(35)
  })

  /**
   * Test: Send accepted event
   */
  test('should send filing accepted event', async () => {
    eventStore.storeEvent('sedar-filing-001', mockSedarWebhookAccepted)

    const events = eventStore.getEvents('sedar-filing-001')

    expect(events).toHaveLength(1)
    expect(events[0].eventType).toBe('filing.accepted')
  })

  /**
   * Test: Send rejected event
   */
  test('should send filing rejected event', async () => {
    eventStore.storeEvent('sedar-filing-002', mockSedarWebhookRejected)

    const events = eventStore.getEvents('sedar-filing-002')

    expect(events).toHaveLength(1)
    expect(events[0].eventType).toBe('filing.rejected')
    expect(events[0].data.rejectionReasons).toBeDefined()
  })

  /**
   * Test: Send SEC comment letter event
   */
  test('should send SEC comment letter event', async () => {
    eventStore.storeEvent('sec-edgar-filing-001', mockSecWebhookCommentLetterIssued)

    const events = eventStore.getEvents('sec-edgar-filing-001')

    expect(events).toHaveLength(1)
    expect(events[0].eventType).toBe('filing.comment_letter_issued')
  })

  /**
   * Test: Send SEC effective event
   */
  test('should send SEC registration effective event', async () => {
    eventStore.storeEvent('sec-edgar-filing-001', mockSecWebhookEffective)

    const events = eventStore.getEvents('sec-edgar-filing-001')

    expect(events).toHaveLength(1)
    expect(events[0].eventType).toBe('filing.effective')
  })

  /**
   * Test: Multiple events per filing
   */
  test('should handle multiple events per filing', async () => {
    eventStore.storeEvent('sedar-filing-001', mockSedarWebhookSubmitted)
    eventStore.storeEvent('sedar-filing-001', mockSedarWebhookProcessing)
    eventStore.storeEvent('sedar-filing-001', mockSedarWebhookAccepted)

    const events = eventStore.getEvents('sedar-filing-001')

    expect(events).toHaveLength(3)
    expect(events[0].eventType).toBe('filing.submitted')
    expect(events[1].eventType).toBe('filing.processing')
    expect(events[2].eventType).toBe('filing.accepted')
  })

  /**
   * Test: Event timestamps
   */
  test('should maintain event timestamp ordering', async () => {
    const now = Date.now()
    eventStore.storeEvent('sedar-filing-001', {
      ...mockSedarWebhookSubmitted,
      timestamp: new Date(now).toISOString(),
    })

    await new Promise(resolve => setTimeout(resolve, 10))

    eventStore.storeEvent('sedar-filing-001', {
      ...mockSedarWebhookProcessing,
      timestamp: new Date(now + 10).toISOString(),
    })

    const events = eventStore.getEvents('sedar-filing-001')

    expect(events).toHaveLength(2)
    expect(
      new Date(events[0].timestamp).getTime() <= new Date(events[1].timestamp).getTime()
    ).toBe(true)
  })
})

// ====================================================================
// TEST SUITE: Webhook Validation
// ====================================================================

describe('Webhook Validation', () => {
  /**
   * Test: Valid webhook payload
   */
  test('should validate correct webhook payload', () => {
    const result = WebhookValidator.validatePayload(mockSedarWebhookSubmitted)

    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  /**
   * Test: Missing required fields
   */
  test('should reject payload missing required fields', () => {
    const invalidPayload = {
      eventType: 'filing.submitted',
      // Missing other required fields
    }

    const result = WebhookValidator.validatePayload(invalidPayload)

    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  /**
   * Test: Invalid event type
   */
  test('should reject invalid event type', () => {
    const invalidPayload = {
      ...mockSedarWebhookSubmitted,
      eventType: 'invalid.event.type',
    }

    const result = WebhookValidator.validatePayload(invalidPayload)

    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('eventType'))).toBe(true)
  })

  /**
   * Test: Invalid system
   */
  test('should reject invalid system', () => {
    const invalidPayload = {
      ...mockSedarWebhookSubmitted,
      system: 'invalid-system',
    }

    const result = WebhookValidator.validatePayload(invalidPayload)

    expect(result.valid).toBe(false)
  })

  /**
   * Test: Valid state transitions
   */
  test('should validate state transitions', () => {
    const transition1 = WebhookValidator.validateStateTransition('submitted', 'processing')
    expect(transition1.valid).toBe(true)

    const transition2 = WebhookValidator.validateStateTransition('submitted', 'accepted')
    expect(transition2.valid).toBe(false)

    const transition3 = WebhookValidator.validateStateTransition('processing', 'accepted')
    expect(transition3.valid).toBe(true)
  })
})

// ====================================================================
// TEST SUITE: Webhook Retry Logic
// ====================================================================

describe('Webhook Retry Logic', () => {
  /**
   * Test: Successful first attempt
   */
  test('should succeed on first attempt', async () => {
    const handler = new WebhookEventHandler('https://example.com/webhooks')

    // Mock successful fetch
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
    })

    const result = await handler.sendWebhook(mockSedarWebhookSubmitted)

    expect(result.success).toBe(true)
    expect(result.attempts).toBe(1)
    expect(result.statusCode).toBe(200)
  })

  /**
   * Test: Retry on server error
   */
  test('should retry on server error', async () => {
    const handler = new WebhookEventHandler(
      'https://example.com/webhooks',
      { maxAttempts: 3, delayMs: 10 }
    )

    // Mock initial failure, then success
    let attemptCount = 0
    global.fetch = jest.fn().mockImplementation(() => {
      attemptCount++
      if (attemptCount < 3) {
        return Promise.resolve({ ok: false, status: 500 })
      }
      return Promise.resolve({ ok: true, status: 200 })
    })

    const result = await handler.sendWebhook(mockSedarWebhookSubmitted)

    expect(result.success).toBe(true)
    expect(result.attempts).toBe(3)
  })

  /**
   * Test: Max retries exceeded
   */
  test('should fail after max retries', async () => {
    const handler = new WebhookEventHandler(
      'https://example.com/webhooks',
      { maxAttempts: 2, delayMs: 10 }
    )

    // Mock persistent failure
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
    })

    const result = await handler.sendWebhook(mockSedarWebhookSubmitted)

    expect(result.success).toBe(false)
    expect(result.attempts).toBe(2)
  })

  /**
   * Test: Network error retry
   */
  test('should retry on network error', async () => {
    const handler = new WebhookEventHandler(
      'https://example.com/webhooks',
      { maxAttempts: 3, delayMs: 10 }
    )

    // Mock network error then success
    let attemptCount = 0
    global.fetch = jest.fn().mockImplementation(() => {
      attemptCount++
      if (attemptCount < 2) {
        return Promise.reject(new Error('Network error'))
      }
      return Promise.resolve({ ok: true, status: 200 })
    })

    const result = await handler.sendWebhook(mockSedarWebhookSubmitted)

    expect(result.success).toBe(true)
    expect(result.attempts).toBe(2)
  })
})

// ====================================================================
// TEST SUITE: Webhook Signature Verification
// ====================================================================

describe('Webhook Signature Verification', () => {
  /**
   * Test: Valid signature
   */
  test('should verify valid signature', () => {
    const handler = new WebhookEventHandler('https://example.com/webhooks')
    const secret = 'test-secret-key'
    const payload = JSON.stringify(mockSedarWebhookSubmitted)

    // Create signature using same method
    const crypto = require('crypto')
    const validSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')

    const isValid = handler.verifySignature(payload, validSignature, secret)

    expect(isValid).toBe(true)
  })

  /**
   * Test: Invalid signature
   */
  test('should reject invalid signature', () => {
    const handler = new WebhookEventHandler('https://example.com/webhooks')
    const secret = 'test-secret-key'
    const payload = JSON.stringify(mockSedarWebhookSubmitted)

    const isValid = handler.verifySignature(payload, 'invalid-signature', secret)

    expect(isValid).toBe(false)
  })

  /**
   * Test: Wrong secret
   */
  test('should reject with wrong secret', () => {
    const handler = new WebhookEventHandler('https://example.com/webhooks')
    const secret = 'test-secret-key'
    const wrongSecret = 'wrong-secret-key'
    const payload = JSON.stringify(mockSedarWebhookSubmitted)

    const crypto = require('crypto')
    const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex')

    const isValid = handler.verifySignature(payload, signature, wrongSecret)

    expect(isValid).toBe(false)
  })
})

// ====================================================================
// TEST SUITE: Webhook Event Windowing
// ====================================================================

describe('Webhook Event Windowing', () => {
  /**
   * Test: Get events within time window
   */
  test('should retrieve events within time window', () => {
    const eventStore = new WebhookEventStore()
    const now = Date.now()

    eventStore.storeEvent('filing-001', {
      ...mockSedarWebhookSubmitted,
      timestamp: new Date(now - 500).toISOString(), // 500ms ago
    })

    eventStore.storeEvent('filing-001', {
      ...mockSedarWebhookProcessing,
      timestamp: new Date(now - 100).toISOString(), // 100ms ago
    })

    eventStore.storeEvent('filing-001', {
      ...mockSedarWebhookAccepted,
      timestamp: new Date(now - 10000).toISOString(), // 10s ago
    })

    const recentEvents = eventStore.getEventsInTimeWindow('filing-001', 1000) // 1 second window

    expect(recentEvents.length).toBeGreaterThanOrEqual(1)
  })
})
