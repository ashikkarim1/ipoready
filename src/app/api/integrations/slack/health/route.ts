/**
 * Slack Integration Health Check
 * Verify bot connection and configuration status
 * GET /api/integrations/slack/health
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import {
  getSlackConnection,
  testSlackBotConnection,
  getSlackOAuthConfig,
} from '@/lib/integrations/slack'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions)
    const user = session?.user as { id?: string; companyId?: string } | undefined

    // Allow unauthenticated health checks for monitoring, but limit data returned
    const companyId = user?.companyId || null

    // Check environment configuration
    const config = getSlackOAuthConfig()

    const configStatus = {
      hasClientId: !!config.clientId,
      hasClientSecret: !!config.clientSecret,
      hasSigningSecret: !!config.signingSecret,
      hasRedirectUri: !!config.redirectUri,
      configured: !!(config.clientId && config.clientSecret && config.signingSecret),
    }

    // If no company, return general health
    if (!companyId) {
      return NextResponse.json({
        status: 'healthy',
        environment: configStatus,
        timestamp: new Date().toISOString(),
      })
    }

    // Get company Slack connection
    const connection = await getSlackConnection(companyId)

    if (!connection) {
      return NextResponse.json({
        status: 'healthy',
        integration: {
          connected: false,
          message: 'No Slack integration configured',
        },
        environment: configStatus,
        timestamp: new Date().toISOString(),
      })
    }

    // Test bot connection
    const testResult = await testSlackBotConnection(connection.bot_token)

    // Get notification statistics
    const statsResult = await sql`
      SELECT
        COUNT(*) as total_sent,
        SUM(CASE WHEN success = true THEN 1 ELSE 0 END) as successful,
        SUM(CASE WHEN success = false THEN 1 ELSE 0 END) as failed,
        MAX(sent_at) as last_sent_at,
        COUNT(DISTINCT event_type) as event_types
      FROM slack_notifications_sent
      WHERE company_id = ${companyId}
      AND sent_at > NOW() - INTERVAL '7 days'
    `

    const stats = statsResult[0] as any

    // Get command stats
    const cmdResult = await sql`
      SELECT
        COUNT(*) as total_commands,
        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful_commands,
        SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as failed_commands
      FROM slack_command_logs
      WHERE team_id = ${connection.team_id}
      AND logged_at > NOW() - INTERVAL '7 days'
    `

    const cmdStats = cmdResult[0] as any

    // Get linked users count
    const usersResult = await sql`
      SELECT COUNT(*) as count
      FROM slack_user_connections suc
      WHERE suc.slack_workspace_id = ${connection.workspace_id}
      AND suc.is_active = true
    `

    const linkedUsers = usersResult[0]
      ? parseInt((usersResult[0] as any).count || '0', 10)
      : 0

    const successRate =
      parseInt(stats.total_sent || '0', 10) > 0
        ? (
          (parseInt(stats.successful || '0', 10) /
            parseInt(stats.total_sent || '1', 10)) *
          100
        ).toFixed(1)
        : 'N/A'

    return NextResponse.json({
      status: testResult.success ? 'healthy' : 'degraded',
      integration: {
        connected: connection.is_active && testResult.success,
        workspace: connection.workspace_name,
        workspaceId: connection.workspace_id,
        teamId: connection.team_id,
        botUserId: testResult.botName,
        installedAt: connection.installed_at,
        lastVerified: connection.last_verified_at,
        channelsMonitored: (connection.channel_ids || []).length,
        scopes: connection.scopes,
      },
      notifications: {
        '7day': {
          total: parseInt(stats.total_sent || '0', 10),
          successful: parseInt(stats.successful || '0', 10),
          failed: parseInt(stats.failed || '0', 10),
          successRate,
          lastSent: stats.last_sent_at,
          eventTypes: parseInt(stats.event_types || '0', 10),
        },
      },
      commands: {
        '7day': {
          total: parseInt(cmdStats.total_commands || '0', 10),
          successful: parseInt(cmdStats.successful_commands || '0', 10),
          failed: parseInt(cmdStats.failed_commands || '0', 10),
        },
      },
      users: {
        linked: linkedUsers,
      },
      environment: configStatus,
      diagnostics: {
        botConnectionHealthy: testResult.success,
        botConnectionError: testResult.error || null,
        databaseAccessible: true,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[slack health] Error:', errorMsg)

    return NextResponse.json(
      {
        status: 'unhealthy',
        error: errorMsg,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
