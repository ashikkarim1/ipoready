/**
 * Slack Events Subscription Handler
 * Processes events from Slack (messages, mentions, etc)
 * POST /api/integrations/slack/events
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import {
  verifySlackRequest,
  handleSlackEvent,
  SlackEventPayload,
  getSlackOAuthConfig,
  getSlackConnection,
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
      console.warn('[slack events] Invalid signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    // Parse payload
    const payload: SlackEventPayload = JSON.parse(body)

    // Handle URL verification challenge
    if (payload.type === 'url_verification') {
      return NextResponse.json(
        { challenge: payload.challenge },
        { status: 200 }
      )
    }

    // Skip bot messages
    if (payload.event.bot_id) {
      return NextResponse.json({ ok: true }, { status: 200 })
    }

    // Get company by workspace
    const companyResult = await sql`
      SELECT company_id FROM slack_connections
      WHERE team_id = ${payload.team_id}
      AND is_active = true
      LIMIT 1
    `

    if (companyResult.length === 0) {
      console.warn('[slack events] No company found for workspace:', payload.team_id)
      return NextResponse.json({ ok: true }, { status: 200 })
    }

    const companyId = (companyResult[0] as any).company_id

    // Log event
    console.log(
      `[slack events] Event: ${payload.event.type} in workspace ${payload.team_id}`
    )

    // Handle event
    const result = await handleSlackEvent(payload, companyId)

    if (!result.success) {
      console.error('[slack events] Failed to handle event:', result.error)
    }

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[slack events] Error:', errorMsg)

    return NextResponse.json({ ok: false, error: errorMsg }, { status: 500 })
  }
}
