/**
 * Slack Send Message Endpoint
 * Internal API for sending messages via templates
 */

import { NextRequest, NextResponse } from 'next/server'
import { sendSlackMessage } from '@/lib/slack-service'
import { sql } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const runtime = 'nodejs'

/**
 * Send a Slack message
 * POST /api/slack/send
 * Body: { userId: string, templateId: string, variables: Record<string, any> }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { userId, templateId, variables, channel } = body

    // Validate input
    if (!userId || !templateId) {
      return NextResponse.json(
        { error: 'Missing userId or templateId' },
        { status: 400 }
      )
    }

    // Send message via Slack service
    const result = await sendSlackMessage({
      userId,
      templateId,
      variables: variables || {},
      channel,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send message' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      slackTs: result.slackTs,
      message: 'Message sent successfully',
    })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[slack/send] Error:', errorMsg)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Get send statistics
 * GET /api/slack/send
 */
export async function GET(): Promise<NextResponse> {
  try {
    // Get recent send stats
    const stats = await sql`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending
      FROM slack_logs
      WHERE sent_at > NOW() - INTERVAL '24 hours'
    `

    const row = (stats[0] as any) || {}

    return NextResponse.json({
      period: '24h',
      total: parseInt(row.total || '0'),
      sent: parseInt(row.sent || '0'),
      failed: parseInt(row.failed || '0'),
      pending: parseInt(row.pending || '0'),
    })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[slack/send] Stats error:', errorMsg)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
