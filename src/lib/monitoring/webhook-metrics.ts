/**
 * Webhook-Specific Metrics
 * Tracks all webhook processing metrics for monitoring and alerting
 */

import { recordHistogram, incrementCounter, recordGauge } from './metrics'
import { sql } from '@/lib/db'

export interface WebhookMetrics {
  eventId: string
  eventType: string
  processingLatencyMs: number
  status: 'processed' | 'failed' | 'duplicate' | 'rate_limited'
  signatureVerified: boolean
  companyId?: string
}

/**
 * Record webhook processing metrics
 */
export function recordWebhookMetrics(metrics: WebhookMetrics): void {
  const { eventType, processingLatencyMs, status, signatureVerified } = metrics

  // Counter: webhook_events_processed (by event_type)
  incrementCounter('webhook_events_processed', 1, {
    event_type: eventType,
    status,
  })

  // Counter: webhook_signature_failures
  if (!signatureVerified) {
    incrementCounter('webhook_signature_failures', 1, {
      event_type: eventType,
    })
  }

  // Histogram: webhook_processing_latency_ms
  recordHistogram('webhook_processing_latency_ms', processingLatencyMs, 'ms', {
    event_type: eventType,
    status,
  })

  // Counter: webhook_rate_limit_events
  if (status === 'rate_limited') {
    incrementCounter('webhook_rate_limit_events', 1, {
      event_type: eventType,
    })
  }

  // Counter: webhook_idempotency_duplicates
  if (status === 'duplicate') {
    incrementCounter('webhook_idempotency_duplicates', 1, {
      event_type: eventType,
    })
  }
}

/**
 * Get webhook metrics for the last 24 hours
 */
export async function getWebhookMetrics24h() {
  try {
    // Events processed by type
    const eventsByType = await sql`
      SELECT 
        event_type,
        status,
        COUNT(*) as count
      FROM webhook_logs
      WHERE created_at > NOW() - INTERVAL '24 hours'
      GROUP BY event_type, status
    `

    // Calculate success rate
    const totalEvents = await sql`
      SELECT COUNT(*) as total FROM webhook_logs
      WHERE created_at > NOW() - INTERVAL '24 hours'
    `

    const processedCount = await sql`
      SELECT COUNT(*) as count FROM webhook_logs
      WHERE created_at > NOW() - INTERVAL '24 hours'
        AND status = 'processed'
    `

    const failedCount = await sql`
      SELECT COUNT(*) as count FROM webhook_logs
      WHERE created_at > NOW() - INTERVAL '24 hours'
        AND status = 'failed'
    `

    const signatureFailures = await sql`
      SELECT COUNT(*) as count FROM webhook_logs
      WHERE created_at > NOW() - INTERVAL '24 hours'
        AND payload ->> 'signature_verified' = 'false'
    `

    const rateLimitEvents = await sql`
      SELECT COUNT(*) as count FROM webhook_logs
      WHERE created_at > NOW() - INTERVAL '1 hour'
        AND status = 'rate_limited'
    `

    // Processing latency stats
    const latencyStats = await sql`
      SELECT 
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY (payload ->> 'latency_ms')::numeric) as p50,
        PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY (payload ->> 'latency_ms')::numeric) as p95,
        PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY (payload ->> 'latency_ms')::numeric) as p99
      FROM webhook_logs
      WHERE created_at > NOW() - INTERVAL '24 hours'
        AND payload ->> 'latency_ms' IS NOT NULL
    `

    return {
      total: (totalEvents[0] as any)?.total || 0,
      processed: (processedCount[0] as any)?.count || 0,
      failed: (failedCount[0] as any)?.count || 0,
      successRate: totalEvents[0] ? (((processedCount[0] as any)?.count || 0) / (totalEvents[0] as any).total * 100).toFixed(2) : 0,
      signatureFailures: (signatureFailures[0] as any)?.count || 0,
      rateLimitEventsLastHour: (rateLimitEvents[0] as any)?.count || 0,
      latency: {
        p50: (latencyStats[0] as any)?.p50 || 0,
        p95: (latencyStats[0] as any)?.p95 || 0,
        p99: (latencyStats[0] as any)?.p99 || 0,
      },
      eventsByType: (eventsByType as any[]) || [],
    }
  } catch (error) {
    console.error('[Webhook-Metrics] Error getting metrics:', error)
    return {
      total: 0,
      processed: 0,
      failed: 0,
      successRate: 0,
      signatureFailures: 0,
      rateLimitEventsLastHour: 0,
      latency: { p50: 0, p95: 0, p99: 0 },
      eventsByType: [],
    }
  }
}

/**
 * Get recent failed webhooks for analysis
 */
export async function getFailedWebhooks(limit: number = 20) {
  try {
    return await sql`
      SELECT
        event_id,
        event_type,
        error_message,
        created_at,
        payload
      FROM webhook_logs
      WHERE status = 'failed'
        AND created_at > NOW() - INTERVAL '24 hours'
      ORDER BY created_at DESC
      LIMIT ${limit}
    `
  } catch (error) {
    console.error('[Webhook-Metrics] Error getting failed webhooks:', error)
    return []
  }
}
