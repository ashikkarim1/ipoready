/**
 * Slack Direct Message Send API
 * Send Slack notifications programmatically
 * POST /api/integrations/slack/send
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import {
  getSlackConnection,
  getSlackUserForUser,
  sendSlackUserMessage,
  sendSlackChannelMessage,
  logSlackNotificationSent,
  isWithinQuietHours,
} from '@/lib/integrations/slack'
import { buildSlackMessage, SlackTemplateId } from '@/lib/slack-templates'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as { id?: string; companyId?: string } | undefined

    if (!session || !user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const companyId = user.companyId
    const body = await request.json()

    // Validate required fields
    const {
      templateId,
      variables,
      recipientType, // 'user' | 'channel'
      recipientUserId, // If recipientType is 'user'
      channelId, // If recipientType is 'channel'
      eventType = 'manual_send', // For logging
      skipQuietHours = false,
    } = body

    if (!templateId || !variables || !recipientType) {
      return NextResponse.json(
        {
          error: 'Missing required fields: templateId, variables, recipientType',
        },
        { status: 400 }
      )
    }

    if (recipientType === 'user' && !recipientUserId) {
      return NextResponse.json(
        { error: 'recipientUserId required for user messages' },
        { status: 400 }
      )
    }

    if (recipientType === 'channel' && !channelId) {
      return NextResponse.json(
        { error: 'channelId required for channel messages' },
        { status: 400 }
      )
    }

    // Get Slack connection
    const connection = await getSlackConnection(companyId)

    if (!connection || !connection.is_active) {
      return NextResponse.json(
        { error: 'No active Slack integration' },
        { status: 400 }
      )
    }

    // Check quiet hours
    if (!skipQuietHours && connection.preferences) {
      const prefs = connection.preferences as any
      if (isWithinQuietHours(prefs.quietHoursStart, prefs.quietHoursEnd)) {
        console.log('[slack send] Message suppressed due to quiet hours')
        return NextResponse.json({
          success: true,
          message: 'Message deferred due to quiet hours',
          suppressed: true,
        })
      }
    }

    // Build message from template
    const message = buildSlackMessage(templateId as SlackTemplateId, variables)

    if (!message) {
      return NextResponse.json(
        { error: `Invalid template ID: ${templateId}` },
        { status: 400 }
      )
    }

    // Send message
    let sendResult
    let actualRecipientId = ''

    if (recipientType === 'user') {
      // Get Slack user ID
      const slackUser = await getSlackUserForUser(recipientUserId, connection.workspace_id)

      if (!slackUser) {
        // Log failed send
        await logSlackNotificationSent(companyId, {
          eventType,
          recipientType: 'user',
          recipientId: recipientUserId,
          templateId: templateId as SlackTemplateId,
          success: false,
          error: 'User not linked to Slack',
        })

        return NextResponse.json(
          { error: 'User not linked to Slack account' },
          { status: 400 }
        )
      }

      actualRecipientId = slackUser.slack_user_id

      sendResult = await sendSlackUserMessage(
        connection.bot_token,
        slackUser.slack_user_id,
        {
          text: message.name,
          blocks: message.blocks,
        }
      )
    } else {
      // Send to channel
      actualRecipientId = channelId

      sendResult = await sendSlackChannelMessage(
        connection.bot_token,
        channelId,
        {
          text: message.name,
          blocks: message.blocks,
        }
      )
    }

    // Log notification
    await logSlackNotificationSent(companyId, {
      eventType,
      recipientType: recipientType as 'user' | 'channel',
      recipientId: actualRecipientId,
      templateId: templateId as SlackTemplateId,
      success: sendResult.success,
      slackTs: sendResult.ts,
      error: sendResult.error,
    })

    if (!sendResult.success) {
      return NextResponse.json(
        { error: `Failed to send message: ${sendResult.error}` },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Message sent to ${recipientType}`,
      ts: sendResult.ts,
      recipientId: actualRecipientId,
    })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[slack send] Error:', errorMsg)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
