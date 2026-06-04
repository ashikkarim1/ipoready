/**
 * Slack Connection Status & Management
 * Get connection info, verify connection, unlink integration
 * GET /api/integrations/slack/connect - Get connection status
 * POST /api/integrations/slack/connect - Link user to Slack
 * DELETE /api/integrations/slack/connect - Unlink integration
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getSlackConnection,
  testSlackBotConnection,
  linkSlackUser,
  unlinkSlackIntegration,
} from '@/lib/integrations/slack'

export const runtime = 'nodejs'

/**
 * GET - Get Slack connection status for company
 */
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
        connected: false,
        message: 'No Slack integration connected',
      })
    }

    // Test connection
    const testResult = await testSlackBotConnection(connection.bot_token)

    return NextResponse.json({
      connected: connection.is_active && testResult.success,
      workspace: connection.workspace_name,
      workspaceId: connection.workspace_id,
      botName: testResult.botName,
      scopes: connection.scopes,
      installedAt: connection.installed_at,
      lastVerified: connection.last_verified_at,
      channelIds: connection.channel_ids,
    })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[slack connect] GET error:', errorMsg)
    return NextResponse.json(
      { error: 'Failed to get connection status' },
      { status: 500 }
    )
  }
}

/**
 * POST - Link current user to Slack
 * Body: { slackUserId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as { id?: string; companyId?: string } | undefined

    if (!session || !user?.id || !user?.companyId) {
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

    // Get workspace ID from company connection
    const connection = await getSlackConnection(user.companyId)

    if (!connection) {
      return NextResponse.json(
        { error: 'No Slack integration configured for your company' },
        { status: 400 }
      )
    }

    // Link user
    const result = await linkSlackUser(user.id, slackUserId, connection.workspace_id)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to link Slack user' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Slack user linked successfully',
      slackUserId,
    })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[slack connect] POST error:', errorMsg)
    return NextResponse.json(
      { error: 'Failed to link user' },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Unlink Slack integration for company
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as { id?: string; companyId?: string } | undefined

    if (!session || !user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const companyId = user.companyId

    // Unlink integration
    const result = await unlinkSlackIntegration(companyId)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to unlink' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Slack integration disconnected',
    })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[slack connect] DELETE error:', errorMsg)
    return NextResponse.json(
      { error: 'Failed to unlink integration' },
      { status: 500 }
    )
  }
}
