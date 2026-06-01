/**
 * Health Check Endpoint: Trial Auto-Upgrade System
 * Endpoint: GET /api/health/trial-auto-upgrade
 * 
 * Returns health status of trial auto-upgrade processing
 * Monitoring systems should check this every 60 seconds
 */

import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Get queue status
    const queueStats = await sql`
      SELECT
        status,
        COUNT(*) as count,
        MIN(next_retry_at) as next_retry_at
      FROM trial_auto_upgrade_queue
      WHERE status IN ('pending', 'retrying', 'failed')
      GROUP BY status
    `

    const pending = queueStats.find((q: any) => q.status === 'pending')?.count || 0
    const retrying = queueStats.find((q: any) => q.status === 'retrying')?.count || 0
    const failed = queueStats.find((q: any) => q.status === 'failed')?.count || 0
    const nextRetryAt = queueStats[0]?.next_retry_at

    // Get 24-hour success rate
    const stats24h = await sql`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'succeeded' THEN 1 ELSE 0 END) as succeeded
      FROM trial_auto_upgrade_queue
      WHERE updated_at > NOW() - INTERVAL '24 hours'
    `

    const totalAttempts = (stats24h[0] as any)?.total || 0
    const successCount = (stats24h[0] as any)?.succeeded || 0
    const successRate = totalAttempts > 0 ? (successCount / totalAttempts * 100) : 0

    // Get escalations today
    const escalationsToday = await sql`
      SELECT COUNT(*) as count FROM trial_auto_upgrade_queue
      WHERE status = 'failed'
        AND retry_count > 3
        AND updated_at > NOW() - INTERVAL '24 hours'
    `

    // Get top failure reasons
    const topErrors = await sql`
      SELECT 
        error_message,
        COUNT(*) as count
      FROM trial_auto_upgrade_queue
      WHERE status IN ('failed', 'retrying')
        AND created_at > NOW() - INTERVAL '24 hours'
        AND error_message IS NOT NULL
      GROUP BY error_message
      ORDER BY count DESC
      LIMIT 3
    `

    // Determine health status
    let status = 'healthy'
    const issues: string[] = []

    if (successRate < 90) {
      status = 'degraded'
      issues.push(`Success rate ${successRate.toFixed(2)}% below 90% threshold`)
    }

    if ((escalationsToday[0] as any)?.count > 2) {
      status = 'warning'
      issues.push(`${(escalationsToday[0] as any).count} escalations today`)
    }

    if (pending + retrying > 50) {
      status = 'warning'
      issues.push(`Queue has ${pending + retrying} pending/retrying items`)
    }

    if (failed > 10) {
      status = 'degraded'
      issues.push(`${failed} permanently failed items waiting for manual review`)
    }

    return NextResponse.json({
      status,
      queueDepth: pending + retrying,
      successRate24h: successRate.toFixed(2),
      statistics: {
        pending,
        retrying,
        failed,
        succeededLast24h: successCount,
        totalAttempts24h: totalAttempts,
      },
      escalationsToday: (escalationsToday[0] as any)?.count || 0,
      nextRetryAt: nextRetryAt || null,
      topFailureReasons: (topErrors as any[]) || [],
      issues,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Health-Check] Trial auto-upgrade health check error:', error)
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
