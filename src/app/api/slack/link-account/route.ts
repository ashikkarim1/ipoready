/**
 * Link User to Slack Account
 * POST /api/slack/link-account
 */

import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const runtime = 'nodejs'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { slackUserId } = body

    if (!slackUserId) {
      return NextResponse.json(
        { error: 'Missing slackUserId' },
        { status: 400 }
      )
    }

    // Validate Slack user ID format (usually starts with U or W)
    if (!slackUserId.match(/^[UW][A-Z0-9]{8,}/)) {
      return NextResponse.json(
        { error: 'Invalid Slack user ID format' },
        { status: 400 }
      )
    }

    // Get user from database
    const users = await sql`
      SELECT id FROM users WHERE email = ${session.user.email}
    `

    if (!users.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userId = (users[0] as any).id

    // Link Slack account
    await sql`
      UPDATE users
      SET slack_user_id = ${slackUserId}, slack_linked_at = NOW()
      WHERE id = ${userId}
    `

    return NextResponse.json({
      success: true,
      message: 'Slack account linked successfully',
      slackUserId,
    })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[slack/link-account] Error:', errorMsg)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Get current Slack link status
 * GET /api/slack/link-account
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const users = await sql`
      SELECT slack_user_id, slack_linked_at
      FROM users
      WHERE email = ${session.user.email}
    `

    if (!users.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const row = users[0] as any

    return NextResponse.json({
      linked: !!row.slack_user_id,
      slackUserId: row.slack_user_id || null,
      linkedAt: row.slack_linked_at || null,
    })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[slack/link-account] GET error:', errorMsg)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
