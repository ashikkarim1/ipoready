/**
 * Slack Slash Commands Handler
 * Processes slash commands from Slack with comprehensive error handling
 * POST /api/integrations/slack/commands
 */

import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import {
  verifySlackRequest,
  slackCommandHandlers,
  SlackSlashCommandPayload,
  getSlackOAuthConfig,
} from '@/lib/integrations/slack'

export const runtime = 'nodejs'

/**
 * Log slash command to database
 */
async function logSlackCommand(
  teamId: string,
  userId: string,
  command: string,
  text: string,
  status: 'success' | 'error',
  responseText?: string
): Promise<void> {
  try {
    await sql`
      INSERT INTO slack_command_logs (
        team_id,
        user_id,
        command,
        text,
        status,
        response_text,
        logged_at
      ) VALUES (
        ${teamId},
        ${userId},
        ${command},
        ${text},
        ${status},
        ${responseText || null},
        NOW()
      )
    `
  } catch (err) {
    console.error('[slack commands] Failed to log command:', err)
  }
}

export async function POST(request: NextRequest) {
  let payload: SlackSlashCommandPayload | null = null

  try {
    // Get signature verification headers
    const timestamp = request.headers.get('x-slack-request-timestamp')
    const signature = request.headers.get('x-slack-signature')

    if (!timestamp || !signature) {
      console.warn('[slack commands] Missing signature headers')
      return NextResponse.json(
        { error: 'Missing signature headers' },
        { status: 401 }
      )
    }

    // Get request body
    const body = await request.text()

    if (!body) {
      console.warn('[slack commands] Empty request body')
      return NextResponse.json(
        { error: 'Empty request body' },
        { status: 400 }
      )
    }

    // Verify Slack signature
    const config = getSlackOAuthConfig()

    if (!config.signingSecret) {
      console.error('[slack commands] Signing secret not configured')
      return NextResponse.json(
        { error: 'Slack signing secret not configured' },
        { status: 500 }
      )
    }

    const isValid = verifySlackRequest(config.signingSecret, body, timestamp, signature)

    if (!isValid) {
      console.warn('[slack commands] Invalid signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    // Parse payload
    payload = Object.fromEntries(
      new URLSearchParams(body)
    ) as unknown as SlackSlashCommandPayload

    if (!payload || !payload.command || !payload.team_id || !payload.user_id) {
      console.warn('[slack commands] Invalid payload structure:', payload)
      return NextResponse.json(
        { error: 'Invalid payload structure' },
        { status: 400 }
      )
    }

    // Log command
    console.log(`[slack commands] Command: ${payload.command} from ${payload.user_id} in team ${payload.team_id}`)

    // Get handler for command
    const handler = slackCommandHandlers[payload.command]

    if (!handler) {
      console.log(`[slack commands] Unknown command: ${payload.command}`)

      const response = {
        response_type: 'ephemeral',
        text: `Command ${payload.command} is not recognized. Available commands: /ipo-status, /filing-status`,
      }

      // Log failed command
      await logSlackCommand(payload.team_id, payload.user_id, payload.command, payload.text, 'error', response.text)

      return NextResponse.json(response, { status: 200 })
    }

    // Execute handler with timeout
    const timeoutPromise = new Promise((resolve) =>
      setTimeout(() => resolve({ timeout: true }), 5000)
    )

    const handlerPromise = handler(payload)

    const result = await Promise.race([handlerPromise, timeoutPromise]) as any

    if (result.timeout) {
      console.error('[slack commands] Handler timeout for command:', payload.command)

      const response = {
        response_type: 'ephemeral',
        text: 'Command execution timed out. Please try again.',
      }

      await logSlackCommand(payload.team_id, payload.user_id, payload.command, payload.text, 'error', response.text)

      return NextResponse.json(response, { status: 200 })
    }

    // Log successful command
    const responseText = result.text || JSON.stringify(result.blocks).substring(0, 100)
    await logSlackCommand(payload.team_id, payload.user_id, payload.command, payload.text, 'success', responseText)

    // Return response
    return NextResponse.json(result, { status: 200 })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[slack commands] Error:', errorMsg)

    // Log error
    if (payload) {
      await logSlackCommand(payload.team_id, payload.user_id, payload.command, payload.text, 'error', errorMsg)
    }

    return NextResponse.json(
      {
        response_type: 'ephemeral',
        text: `Error processing command: ${errorMsg}`,
      },
      { status: 200 }
    )
  }
}
