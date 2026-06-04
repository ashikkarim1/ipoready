/**
 * Slack Events Subscription Handler
 * Processes events from Slack (messages, mentions, etc)
 * Implements retry_type handling and deduplication
 * POST /api/integrations/slack/events
 */

import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import {
  verifySlackRequest,
  handleSlackEvent,
  SlackEventPayload,
  getSlackOAuthConfig,
  getSlackConnection,
} from '@/lib/integrations/slack'

export const runtime = 'nodejs'

/**
 * Store processed event to prevent duplicates
 */
async function storeProcessedEvent(
  eventId: string,
  teamId: string,
  eventType: string,
  eventData: any
): Promise<boolean> {
  try {
    // Check if already processed
    const existing = await sql`
      SELECT id FROM slack_events_processed
      WHERE event_id = ${eventId}
      LIMIT 1
    `

    if (existing.length > 0) {
      return false // Already processed
    }

    // Store processed event
    await sql`
      INSERT INTO slack_events_processed (
        event_id,
        team_id,
        event_type,
        event_data,
        processed_at
      ) VALUES (
        ${eventId},
        ${teamId},
        ${eventType},
        ${JSON.stringify(eventData)},
        NOW()
      )
    `

    return true // Successfully stored
  } catch (err) {
    console.error('[slack events] Error storing processed event:', err)
    return false
  }
}

export async function POST(request: NextRequest) {
  let payload: SlackEventPayload | null = null

  try {
    // Get signature verification headers
    const timestamp = request.headers.get('x-slack-request-timestamp')
    const signature = request.headers.get('x-slack-signature')

    if (!timestamp || !signature) {
      console.warn('[slack events] Missing signature headers')
      return NextResponse.json(
        { error: 'Missing signature headers' },
        { status: 401 }
      )
    }

    // Get request body
    const body = await request.text()

    if (!body) {
      console.warn('[slack events] Empty request body')
      return NextResponse.json(
        { error: 'Empty request body' },
        { status: 400 }
      )
    }

    // Verify Slack signature
    const config = getSlackOAuthConfig()

    if (!config.signingSecret) {
      console.error('[slack events] Signing secret not configured')
      return NextResponse.json(
        { error: 'Slack signing secret not configured' },
        { status: 500 }
      )
    }

    const isValid = verifySlackRequest(config.signingSecret, body, timestamp, signature)

    if (!isValid) {
      console.warn('[slack events] Invalid signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    // Parse payload
    try {
      payload = JSON.parse(body)
    } catch (err) {
      console.error('[slack events] Failed to parse JSON:', err)
      return NextResponse.json(
        { error: 'Invalid JSON' },
        { status: 400 }
      )
    }

    if (!payload) {
      console.warn('[slack events] Empty payload')
      return NextResponse.json({ ok: true }, { status: 200 })
    }

    // Handle URL verification challenge
    if (payload.type === 'url_verification') {
      console.log('[slack events] Handling URL verification challenge')
      return NextResponse.json(
        { challenge: (payload as any).challenge },
        { status: 200 }
      )
    }

    // Handle event callback
    if (payload.type !== 'event_callback') {
      console.log('[slack events] Ignoring non-event payload type:', payload.type)
      return NextResponse.json({ ok: true }, { status: 200 })
    }

    // Check if retry (Slack retries after 3 seconds if no 200 response)
    const retryNum = request.headers.get('x-slack-retry-num')
    const retryReason = request.headers.get('x-slack-retry-reason')

    if (retryNum) {
      console.log(`[slack events] Retry attempt ${retryNum}, reason: ${retryReason}`)
    }

    // Skip bot messages
    if (payload.event?.bot_id) {
      console.log('[slack events] Skipping bot message')
      return NextResponse.json({ ok: true }, { status: 200 })
    }

    if (!payload.team_id || !payload.event_id) {
      console.warn('[slack events] Missing team_id or event_id')
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check for duplicate processing
    const isNewEvent = await storeProcessedEvent(
      payload.event_id,
      payload.team_id,
      payload.event.type || 'unknown',
      payload.event
    )

    if (!isNewEvent) {
      console.log('[slack events] Event already processed:', payload.event_id)
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
      `[slack events] Processing event ${payload.event_id}: ${payload.event.type} in workspace ${payload.team_id}`
    )

    // Handle event asynchronously (don't block response)
    setImmediate(async () => {
      try {
        const result = await handleSlackEvent(payload!, companyId)

        if (!result.success) {
          console.error('[slack events] Failed to handle event:', result.error)
        } else {
          console.log(`[slack events] Event ${payload!.event_id} processed successfully`)
        }
      } catch (err) {
        console.error('[slack events] Async error handling event:', err)
      }
    })

    // Return 200 immediately to acknowledge receipt
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[slack events] Unexpected error:', errorMsg, 'payload:', payload)

    // Return 200 anyway so Slack doesn't retry
    return NextResponse.json({ ok: true }, { status: 200 })
  }
}
