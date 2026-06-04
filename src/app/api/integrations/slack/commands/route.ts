/**
 * Slack Slash Commands Handler
 * Processes slash commands from Slack
 * POST /api/integrations/slack/commands
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  verifySlackRequest,
  slackCommandHandlers,
  SlackSlashCommandPayload,
  getSlackOAuthConfig,
} from '@/lib/integrations/slack'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // Get signature verification headers
    const timestamp = request.headers.get('x-slack-request-timestamp') || ''
    const signature = request.headers.get('x-slack-signature') || ''

    if (!timestamp || !signature) {
      return NextResponse.json(
        { error: 'Missing signature headers' },
        { status: 401 }
      )
    }

    // Get request body
    const body = await request.text()

    // Verify Slack signature
    const config = getSlackOAuthConfig()
    const isValid = verifySlackRequest(config.signingSecret, body, timestamp, signature)

    if (!isValid) {
      console.warn('[slack commands] Invalid signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    // Parse payload
    const payload: SlackSlashCommandPayload = Object.fromEntries(
      new URLSearchParams(body)
    ) as any

    // Log command
    console.log(`[slack commands] Command: ${payload.command} from user ${payload.user_id}`)

    // Get handler for command
    const handler = slackCommandHandlers[payload.command]

    if (!handler) {
      return NextResponse.json(
        {
          response_type: 'ephemeral',
          text: `Command ${payload.command} is not recognized`,
        },
        { status: 200 }
      )
    }

    // Execute handler
    const result = await handler(payload)

    // Return response
    return NextResponse.json(result, { status: 200 })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[slack commands] Error:', errorMsg)

    return NextResponse.json(
      {
        response_type: 'ephemeral',
        text: `Error processing command: ${errorMsg}`,
      },
      { status: 200 }
    )
  }
}
