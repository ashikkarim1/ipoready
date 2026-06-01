/**
 * Health Check Endpoint: Stripe Webhooks
 * Endpoint: GET /api/health/webhooks
 * 
 * Returns health status of webhook processing system
 * Monitoring systems should check this every 60 seconds
 */

import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Get last webhook processed timestamp
    const lastWebhook = await sql`
      SELECT created_at FROM webhook_logs
      WHERE status IN ('processed', 'duplicate')
      ORDER BY created_at DESC
      LIMIT 1
    `

    const lastProcessedTime = lastWebhook.length > 0 ? (lastWebhook[0] as any).created_at : null

    // Calculate 24-hour success rate
    const stats24h = await sql`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'processed' THEN 1 ELSE 0 END) as succeeded,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
      FROM webhook_logs
      WHERE created_at > NOW() - INTERVAL '24 hours'
    `

    const stats = (stats24h[0] as any) || { total: 0, succeeded: 0, failed: 0 }
    const successRate = stats.total > 0 ? (stats.succeeded / stats.total * 100) : 0

    // Get signature verification failures in last hour
    const signatureFailures = await sql`
      SELECT COUNT(*) as count FROM webhook_logs
      WHERE created_at > NOW() - INTERVAL '1 hour'
        AND payload ->> 'signature_verified' = 'false'
    `

    // Get current queue depth (pending webhooks)
    const queueDepth = await sql`
      SELECT COUNT(*) as count FROM webhook_logs
      WHERE status = 'pending'
    `

    // Get rate limit events in last hour
    const rateLimitEvents = await sql`
      SELECT COUNT(*) as count FROM webhook_logs
      WHERE created_at > NOW() - INTERVAL '1 hour'
        AND status = 'rate_limited'
    `

    // Determine health status
    let status = 'healthy'
    const issues: string[] = []

    if (successRate < 95) {
      status = 'degraded'
      issues.push(`Success rate ${successRate.toFixed(2)}% below 95% threshold`)
    }

    if ((signatureFailures[0] as any)?.count > 10) {
      status = 'degraded'
      issues.push(`${(signatureFailures[0] as any).count} signature failures in last hour`)
    }

    if ((queueDepth[0] as any)?.count > 100) {
      status = 'degraded'
      issues.push(`Queue depth ${(queueDepth[0] as any).count} items`)
    }

    if ((rateLimitEvents[0] as any)?.count > 5) {
      status = 'warning'
      issues.push(`${(rateLimitEvents[0] as any).count} rate limit events in last hour`)
    }

    return NextResponse.json({
      status,
      lastWebhookProcessed: lastProcessedTime,
      webhookSuccessRate24h: successRate.toFixed(2),
      statistics: {
        totalEvents24h: stats.total,
        succeededEvents24h: stats.succeeded,
        failedEvents24h: stats.failed,
      },
      queueDepth: (queueDepth[0] as any)?.count || 0,
      signatureVerificationFailures1h: (signatureFailures[0] as any)?.count || 0,
      rateLimitEvents1h: (rateLimitEvents[0] as any)?.count || 0,
      issues,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Health-Check] Webhook health check error:', error)
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    )
  }
}
