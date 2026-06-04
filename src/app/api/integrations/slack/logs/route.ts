/**
 * Slack Activity Logs API
 * View notification history and command logs
 * GET /api/integrations/slack/logs
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as { id?: string; companyId?: string } | undefined

    if (!session || !user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const companyId = user.companyId

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const logType = searchParams.get('type') || 'notifications' // 'notifications' | 'commands' | 'events'
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 500)
    const offset = parseInt(searchParams.get('offset') || '0', 10)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let query: any
    let countQuery: any

    if (logType === 'commands') {
      // Get Slack connection to filter by team_id
      const connResult = await sql`
        SELECT team_id FROM slack_connections
        WHERE company_id = ${companyId}
        AND is_active = true
        LIMIT 1
      `

      if (connResult.length === 0) {
        return NextResponse.json({
          logs: [],
          total: 0,
          limit,
          offset,
        })
      }

      const teamId = (connResult[0] as any).team_id

      let whereClause = `WHERE team_id = ${teamId}`

      if (startDate || endDate) {
        if (startDate) {
          whereClause += ` AND logged_at >= '${startDate}'`
        }
        if (endDate) {
          whereClause += ` AND logged_at <= '${endDate}'`
        }
      }

      query = sql`
        SELECT
          id,
          command,
          text,
          status,
          response_text,
          logged_at,
          user_id
        FROM slack_command_logs
        ${whereClause}
        ORDER BY logged_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `

      countQuery = sql`
        SELECT COUNT(*) as count FROM slack_command_logs ${whereClause}
      `
    } else if (logType === 'events') {
      let whereClause = `WHERE company_id = ${companyId}`

      if (startDate || endDate) {
        if (startDate) {
          whereClause += ` AND processed_at >= '${startDate}'`
        }
        if (endDate) {
          whereClause += ` AND processed_at <= '${endDate}'`
        }
      }

      query = sql`
        SELECT
          id,
          event_type,
          event_data,
          processed_at
        FROM slack_events_processed
        ${whereClause}
        ORDER BY processed_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `

      countQuery = sql`
        SELECT COUNT(*) as count FROM slack_events_processed ${whereClause}
      `
    } else {
      // Default: notifications
      let whereClause = `WHERE company_id = ${companyId}`

      if (startDate || endDate) {
        if (startDate) {
          whereClause += ` AND sent_at >= '${startDate}'`
        }
        if (endDate) {
          whereClause += ` AND sent_at <= '${endDate}'`
        }
      }

      query = sql`
        SELECT
          id,
          event_type,
          recipient_type,
          recipient_id,
          template_id,
          success,
          slack_ts,
          error_message,
          sent_at
        FROM slack_notifications_sent
        ${whereClause}
        ORDER BY sent_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `

      countQuery = sql`
        SELECT COUNT(*) as count FROM slack_notifications_sent ${whereClause}
      `
    }

    // Execute queries
    const logs = await query
    const countResult = await countQuery
    const total = parseInt((countResult[0] as any).count || '0', 10)

    return NextResponse.json({
      logs: logs.map((log: any) => ({
        ...log,
        eventData:
          log.event_data && typeof log.event_data === 'string'
            ? JSON.parse(log.event_data)
            : log.event_data,
      })),
      total,
      limit,
      offset,
      logType,
    })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[slack logs] Error:', errorMsg)
    return NextResponse.json(
      { error: 'Failed to retrieve logs' },
      { status: 500 }
    )
  }
}
