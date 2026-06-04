/**
 * Slack Channels Management API
 * List and manage monitored Slack channels
 * GET /api/integrations/slack/channels - List available channels
 * POST /api/integrations/slack/channels - Update monitored channels
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getSlackConnection,
  listSlackChannels,
  updateMonitoredChannels,
} from '@/lib/integrations/slack'

export const runtime = 'nodejs'

/**
 * GET - List available Slack channels
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as { id?: string; companyId?: string } | undefined

    if (!session || !user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const companyId = user.companyId

    // Get Slack connection
    const connection = await getSlackConnection(companyId)

    if (!connection || !connection.is_active) {
      return NextResponse.json(
        { error: 'No active Slack integration' },
        { status: 400 }
      )
    }

    // List available channels
    const channelsResult = await listSlackChannels(connection.bot_token)

    if (!channelsResult.success) {
      return NextResponse.json(
        { error: channelsResult.error || 'Failed to list channels' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      channels: channelsResult.channels,
      monitoredChannels: connection.channel_ids || [],
      workspace: {
        id: connection.workspace_id,
        name: connection.workspace_name,
      },
    })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[slack channels] GET error:', errorMsg)
    return NextResponse.json(
      { error: 'Failed to list channels' },
      { status: 500 }
    )
  }
}

/**
 * POST - Update monitored channels
 * Body: {
 *   channelIds: string[] (array of channel IDs to monitor)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as { id?: string; companyId?: string } | undefined

    if (!session || !user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const companyId = user.companyId
    const body = await request.json()

    // Validate input
    if (!Array.isArray(body.channelIds)) {
      return NextResponse.json(
        { error: 'channelIds must be an array' },
        { status: 400 }
      )
    }

    // Validate each channel ID is a string
    for (const channelId of body.channelIds) {
      if (typeof channelId !== 'string' || channelId.trim() === '') {
        return NextResponse.json(
          { error: 'Each channel ID must be a non-empty string' },
          { status: 400 }
        )
      }
    }

    // Get Slack connection
    const connection = await getSlackConnection(companyId)

    if (!connection || !connection.is_active) {
      return NextResponse.json(
        { error: 'No active Slack integration' },
        { status: 400 }
      )
    }

    // Verify channels exist and bot is member
    const channelsResult = await listSlackChannels(connection.bot_token)

    if (!channelsResult.success || !channelsResult.channels) {
      return NextResponse.json(
        { error: 'Failed to verify channels' },
        { status: 400 }
      )
    }

    const availableChannelIds = channelsResult.channels
      .filter((ch) => ch.is_member)
      .map((ch) => ch.id)

    for (const channelId of body.channelIds) {
      if (!availableChannelIds.includes(channelId)) {
        return NextResponse.json(
          { error: `Bot is not a member of channel ${channelId}` },
          { status: 400 }
        )
      }
    }

    // Update monitored channels
    const result = await updateMonitoredChannels(companyId, body.channelIds)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to update channels' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Successfully monitoring ${body.channelIds.length} channel(s)`,
      monitoredChannels: body.channelIds,
    })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[slack channels] POST error:', errorMsg)
    return NextResponse.json(
      { error: 'Failed to update channels' },
      { status: 500 }
    )
  }
}
