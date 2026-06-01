/**
 * Trial Auto-Upgrade Metrics
 * Tracks trial upgrade attempts, retries, escalations, and email delivery
 */

import { recordHistogram, incrementCounter, recordGauge } from './metrics'
import { sql } from '@/lib/db'

export interface TrialAutoUpgradeMetrics {
  companyId: string
  attempt: number
  status: 'success' | 'failed' | 'retrying' | 'escalated'
  latencyMs: number
  retryNumber?: number
  emailSent?: boolean
  emailType?: 'success' | 'action_required' | 'escalation'
}

/**
 * Record trial auto-upgrade metrics
 */
export function recordTrialUpgradeMetrics(metrics: TrialAutoUpgradeMetrics): void {
  const { status, attempt, latencyMs, retryNumber, emailSent, emailType } = metrics

  // Counter: trial_auto_upgrade_attempts (by status)
  incrementCounter('trial_auto_upgrade_attempts', 1, {
    status,
  })

  // Counter: trial_auto_upgrade_retries (by retry_number)
  if (retryNumber && retryNumber > 0) {
    incrementCounter('trial_auto_upgrade_retries', 1, {
      retry_number: String(retryNumber),
    })
  }

  // Counter: trial_auto_upgrade_escalations
  if (status === 'escalated') {
    incrementCounter('trial_auto_upgrade_escalations', 1)
  }

  // Counter: trial_auto_upgrade_email_sent (by type)
  if (emailSent && emailType) {
    incrementCounter('trial_auto_upgrade_email_sent', 1, {
      email_type: emailType,
    })
  }

  // Histogram: trial_auto_upgrade_latency_ms
  recordHistogram('trial_auto_upgrade_latency_ms', latencyMs, 'ms', {
    status,
  })
}

/**
 * Get trial auto-upgrade metrics for the last 24 hours
 */
export async function getTrialUpgradeMetrics24h() {
  try {
    // Attempts by status
    const attemptsByStatus = await sql`
      SELECT 
        status,
        COUNT(*) as count
      FROM trial_auto_upgrade_queue
      WHERE created_at > NOW() - INTERVAL '24 hours'
      GROUP BY status
    `

    // Escalations today
    const escalationsToday = await sql`
      SELECT COUNT(*) as count FROM trial_auto_upgrade_queue
      WHERE status = 'failed'
        AND retry_count > 3
        AND updated_at > NOW() - INTERVAL '24 hours'
    `

    // Success rate (last 24h)
    const successCount = await sql`
      SELECT COUNT(*) as count FROM trial_auto_upgrade_queue
      WHERE status = 'succeeded'
        AND updated_at > NOW() - INTERVAL '24 hours'
    `

    const totalCount = await sql`
      SELECT COUNT(*) as count FROM trial_auto_upgrade_queue
      WHERE created_at > NOW() - INTERVAL '24 hours'
    `

    // Retry distribution
    const retryDistribution = await sql`
      SELECT 
        retry_count,
        COUNT(*) as count
      FROM trial_auto_upgrade_queue
      WHERE created_at > NOW() - INTERVAL '24 hours'
        AND status IN ('retrying', 'failed')
      GROUP BY retry_count
      ORDER BY retry_count ASC
    `

    // Latency stats
    const latencyStats = await sql`
      SELECT
        AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) * 1000) as avg_latency_ms,
        MAX(EXTRACT(EPOCH FROM (updated_at - created_at)) * 1000) as max_latency_ms,
        MIN(EXTRACT(EPOCH FROM (updated_at - created_at)) * 1000) as min_latency_ms
      FROM trial_auto_upgrade_queue
      WHERE created_at > NOW() - INTERVAL '24 hours'
    `

    // Queue status
    const queueStatus = await sql`
      SELECT
        status,
        COUNT(*) as count,
        MIN(next_retry_at) as next_retry_at
      FROM trial_auto_upgrade_queue
      WHERE status IN ('pending', 'retrying')
      GROUP BY status
    `

    const totalAttempts = (totalCount[0] as any)?.count || 0
    const successAttempts = (successCount[0] as any)?.count || 0

    return {
      successRate: totalAttempts > 0 ? (successAttempts / totalAttempts * 100).toFixed(2) : 0,
      successCount: successAttempts,
      failedCount: (attemptsByStatus.find((a: any) => a.status === 'failed') as any)?.count || 0,
      retiringCount: (attemptsByStatus.find((a: any) => a.status === 'retrying') as any)?.count || 0,
      escalationsToday: (escalationsToday[0] as any)?.count || 0,
      retryDistribution: (retryDistribution as any[]) || [],
      latency: {
        avg: (latencyStats[0] as any)?.avg_latency_ms || 0,
        max: (latencyStats[0] as any)?.max_latency_ms || 0,
        min: (latencyStats[0] as any)?.min_latency_ms || 0,
      },
      queueStatus: {
        pending: (queueStatus.find((q: any) => q.status === 'pending') as any)?.count || 0,
        retrying: (queueStatus.find((q: any) => q.status === 'retrying') as any)?.count || 0,
        nextRetryAt: (queueStatus[0] as any)?.next_retry_at || null,
      },
    }
  } catch (error) {
    console.error('[Trial-Metrics] Error getting metrics:', error)
    return {
      successRate: 0,
      successCount: 0,
      failedCount: 0,
      retiringCount: 0,
      escalationsToday: 0,
      retryDistribution: [],
      latency: { avg: 0, max: 0, min: 0 },
      queueStatus: { pending: 0, retrying: 0, nextRetryAt: null },
    }
  }
}

/**
 * Get this week's escalations
 */
export async function getWeekEscalations() {
  try {
    const result = await sql`
      SELECT COUNT(*) as count FROM trial_auto_upgrade_queue
      WHERE status = 'failed'
        AND retry_count > 3
        AND updated_at > NOW() - INTERVAL '7 days'
    `
    return (result[0] as any)?.count || 0
  } catch (error) {
    console.error('[Trial-Metrics] Error getting week escalations:', error)
    return 0
  }
}

/**
 * Get top failure reasons
 */
export async function getTopFailureReasons(limit: number = 5) {
  try {
    return await sql`
      SELECT 
        last_error as reason,
        COUNT(*) as count
      FROM trial_auto_upgrade_queue
      WHERE status IN ('failed', 'retrying')
        AND created_at > NOW() - INTERVAL '24 hours'
        AND last_error IS NOT NULL
      GROUP BY last_error
      ORDER BY count DESC
      LIMIT ${limit}
    `
  } catch (error) {
    console.error('[Trial-Metrics] Error getting failure reasons:', error)
    return []
  }
}
