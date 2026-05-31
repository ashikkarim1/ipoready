/**
 * Slack Service Status
 * GET /api/slack/status
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSlackConfigStatus } from '@/lib/slack-config'
import { sql } from '@/lib/db'
import { getQueueStatus } from '@/lib/slack-queue'

export const runtime = 'nodejs'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const configStatus = getSlackConfigStatus()
    const queueStats = await getQueueStatus()

    // Get recent message stats
    const recentStats = await sql`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
        AVG(EXTRACT(EPOCH FROM (slack_ts::timestamp - created_at))) as avg_latency_seconds
      FROM slack_logs
      WHERE created_at > NOW() - INTERVAL '24 hours'
    `

    const stats = (recentStats[0] as any) || {}

    // Get user linkage stats
    const linkedUsers = await sql`
      SELECT COUNT(*) as count FROM users WHERE slack_user_id IS NOT NULL
    `

    const linkedCount = ((linkedUsers[0] as any)?.count || 0)

    return NextResponse.json({
      service: {
        name: 'Slack Integration',
        status: configStatus.configured ? 'operational' : 'unconfigured',
        configured: configStatus.configured,
      },
      configuration: {
        hasBotToken: configStatus.hasBotToken,
        hasSigningSecret: configStatus.hasSigningSecret,
        hasAppId: configStatus.hasAppId,
        hasWorkspaceId: configStatus.hasWorkspaceId,
      },
      queue: {
        pending: queueStats.pendingCount,
        processed: queueStats.processedCount,
        failed: queueStats.failedCount,
        totalInMemory: queueStats.totalInMemory,
        isProcessing: queueStats.isProcessing,
        messagesThisMinute: queueStats.messagesThisMinute,
      },
      statistics: {
        period: '24h',
        totalMessages: parseInt(stats.total || '0'),
        sentMessages: parseInt(stats.sent || '0'),
        failedMessages: parseInt(stats.failed || '0'),
        averageLatencySeconds: parseFloat(stats.avg_latency_seconds || '0'),
        linkedUsers: linkedCount,
      },
      lastUpdated: new Date().toISOString(),
    })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[slack/status] Error:', errorMsg)

    // Return partial status if database is unavailable
    const configStatus = getSlackConfigStatus()

    return NextResponse.json(
      {
        service: {
          name: 'Slack Integration',
          status: 'degraded',
          error: 'Database unavailable',
        },
        configuration: {
          hasBotToken: configStatus.hasBotToken,
          hasSigningSecret: configStatus.hasSigningSecret,
          hasAppId: configStatus.hasAppId,
        },
      },
      { status: 503 }
    )
  }
}
