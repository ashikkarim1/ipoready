/**
 * Slack Integration Status & Health Check
 * GET /api/integrations/slack/status
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import {
  getSlackConnection,
  testSlackBotConnection,
} from '@/lib/integrations/slack'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as { id?: string; companyId?: string } | undefined

    if (!session || !user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const companyId = user.companyId

    // Get connection
    const connection = await getSlackConnection(companyId)

    if (!connection) {
      return NextResponse.json({
        status: 'not_connected',
        connected: false,
        message: 'No Slack integration configured',
      })
    }

    // Test connection
    const testResult = await testSlackBotConnection(connection.bot_token)

    // Get recent notification stats
    const statsResult = await sql`
      SELECT
        COUNT(*) as total_notifications,
        SUM(CASE WHEN success = true THEN 1 ELSE 0 END) as successful,
        SUM(CASE WHEN success = false THEN 1 ELSE 0 END) as failed,
        MAX(sent_at) as last_notification_at
      FROM slack_notifications_sent
      WHERE company_id = ${companyId}
      AND sent_at > NOW() - INTERVAL '30 days'
    `

    const stats = statsResult[0] as any

    // Get linked users count
    const linkedUsersResult = await sql`
      SELECT COUNT(*) as count
      FROM slack_user_connections suc
      JOIN slack_connections sc ON sc.workspace_id = suc.slack_workspace_id
      WHERE sc.company_id = ${companyId}
      AND suc.is_active = true
    `

    const linkedUsers = linkedUsersResult[0]
      ? (linkedUsersResult[0] as any).count
      : 0

    return NextResponse.json({
      status: testResult.success ? 'connected' : 'connection_error',
      connected: connection.is_active && testResult.success,
      workspace: {
        id: connection.workspace_id,
        name: connection.workspace_name,
        botUserId: testResult.botName,
      },
      configuration: {
        scopes: connection.scopes,
        monitoredChannels: connection.channel_ids?.length || 0,
        linkedUsers,
      },
      notifications: {
        lastSent: stats.last_notification_at,
        total30Days: parseInt(stats.total_notifications || '0'),
        successful: parseInt(stats.successful || '0'),
        failed: parseInt(stats.failed || '0'),
        successRate: stats.total_notifications
          ? (
            (parseInt(stats.successful || '0') /
              parseInt(stats.total_notifications)) *
            100
          ).toFixed(2)
          : 'N/A',
      },
      health: {
        verified: testResult.success,
        installedAt: connection.installed_at,
        lastVerifiedAt: connection.last_verified_at,
        isActive: connection.is_active,
      },
      error: testResult.success ? null : testResult.error,
    })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[slack status] Error:', errorMsg)
    return NextResponse.json(
      { error: 'Failed to get status' },
      { status: 500 }
    )
  }
}
