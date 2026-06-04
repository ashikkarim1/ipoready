/**
 * Slack Notification Preferences & History
 * GET /api/integrations/slack/notifications - Get preferences and history
 * POST /api/integrations/slack/notifications - Update notification preferences
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export const runtime = 'nodejs'

interface NotificationPreferences {
  filing_submitted: boolean
  pace_milestone: boolean
  task_assigned: boolean
  compliance_deadline: boolean
  document_shared: boolean
  board_report: boolean
  notifyChannels: boolean
  monitoredChannels: string[]
}

/**
 * GET - Retrieve notification preferences and recent history
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as { id?: string; companyId?: string } | undefined

    if (!session || !user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const companyId = user.companyId

    // Get notification preferences from company config
    const companyResult = await sql`
      SELECT slack_notification_preferences FROM companies
      WHERE id = ${companyId}
      LIMIT 1
    `

    const preferences: NotificationPreferences = companyResult.length > 0
      ? JSON.parse((companyResult[0] as any).slack_notification_preferences || '{}')
      : {
        filing_submitted: true,
        pace_milestone: true,
        task_assigned: true,
        compliance_deadline: true,
        document_shared: false,
        board_report: false,
        notifyChannels: true,
        monitoredChannels: [],
      }

    // Get recent notification history
    const historyResult = await sql`
      SELECT
        id,
        event_type,
        user_id,
        success,
        sent_at,
        error_message
      FROM slack_notifications_sent
      WHERE company_id = ${companyId}
      ORDER BY sent_at DESC
      LIMIT 50
    `

    const history = historyResult.map((row: any) => ({
      id: row.id,
      eventType: row.event_type,
      userId: row.user_id,
      success: row.success,
      sentAt: row.sent_at,
      error: row.error_message,
    }))

    // Get delivery stats
    const statsResult = await sql`
      SELECT
        event_type,
        COUNT(*) as total,
        SUM(CASE WHEN success = true THEN 1 ELSE 0 END) as successful,
        SUM(CASE WHEN success = false THEN 1 ELSE 0 END) as failed
      FROM slack_notifications_sent
      WHERE company_id = ${companyId}
      AND sent_at > NOW() - INTERVAL '30 days'
      GROUP BY event_type
      ORDER BY total DESC
    `

    const stats = statsResult.map((row: any) => ({
      eventType: row.event_type,
      total: parseInt(row.total),
      successful: parseInt(row.successful),
      failed: parseInt(row.failed),
      successRate: (
        (parseInt(row.successful) / parseInt(row.total)) *
        100
      ).toFixed(2),
    }))

    return NextResponse.json({
      preferences,
      history,
      stats,
      period: '30 days',
    })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[slack notifications] GET error:', errorMsg)
    return NextResponse.json(
      { error: 'Failed to get preferences' },
      { status: 500 }
    )
  }
}

/**
 * POST - Update notification preferences
 * Body: { preferences: NotificationPreferences }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as { id?: string; companyId?: string } | undefined

    if (!session || !user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { preferences } = body

    if (!preferences) {
      return NextResponse.json(
        { error: 'Missing preferences' },
        { status: 400 }
      )
    }

    const companyId = user.companyId

    // Validate preferences structure
    const validKeys = [
      'filing_submitted',
      'pace_milestone',
      'task_assigned',
      'compliance_deadline',
      'document_shared',
      'board_report',
      'notifyChannels',
      'monitoredChannels',
    ]

    for (const key of Object.keys(preferences)) {
      if (!validKeys.includes(key)) {
        return NextResponse.json(
          { error: `Invalid preference key: ${key}` },
          { status: 400 }
        )
      }
    }

    // Update preferences
    await sql`
      UPDATE companies
      SET slack_notification_preferences = ${JSON.stringify(preferences)},
          updated_at = NOW()
      WHERE id = ${companyId}
    `

    return NextResponse.json({
      success: true,
      message: 'Preferences updated',
      preferences,
    })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[slack notifications] POST error:', errorMsg)
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    )
  }
}
