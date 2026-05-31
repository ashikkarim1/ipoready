/**
 * Unlink User from Slack Account
 * POST /api/slack/unlink-account
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

    // Get user from database
    const users = await sql`
      SELECT id, slack_user_id FROM users WHERE email = ${session.user.email}
    `

    if (!users.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user = users[0] as any

    if (!user.slack_user_id) {
      return NextResponse.json(
        { error: 'No Slack account linked' },
        { status: 400 }
      )
    }

    // Unlink Slack account
    await sql`
      UPDATE users
      SET slack_user_id = NULL, slack_linked_at = NULL
      WHERE id = ${user.id}
    `

    return NextResponse.json({
      success: true,
      message: 'Slack account unlinked successfully',
    })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[slack/unlink-account] Error:', errorMsg)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
