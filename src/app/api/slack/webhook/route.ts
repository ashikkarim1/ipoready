/**
 * Slack Webhook Handler
 * Validates signatures and processes Slack events and commands
 */

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getSlackConfig } from '@/lib/slack-config'
import { sql } from '@/lib/db'

/**
 * Verify Slack webhook signature using HMAC-SHA256
 * https://api.slack.com/authentication/verifying-requests-from-slack
 */
function verifySlackSignature(
  signingSecret: string,
  timestamp: string,
  body: string,
  signature: string
): boolean {
  // Check timestamp is within 5 minutes (prevent replay attacks)
  const now = Math.floor(Date.now() / 1000)
  const requestTime = parseInt(timestamp, 10)
  if (Math.abs(now - requestTime) > 300) {
    console.warn('[slack-webhook] Request timestamp too old, possible replay attack')
    return false
  }

  // Build the signed content
  const signingBaseString = `v0:${timestamp}:${body}`

  // Compute HMAC-SHA256
  const computedSignature =
    'v0=' + crypto.createHmac('sha256', signingSecret).update(signingBaseString).digest('hex')

  // Compare signatures (constant-time to prevent timing attacks)
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(computedSignature))
}

/**
 * Handle Slack URL verification handshake
 */
function handleUrlVerification(body: any): NextResponse {
  if (body.type === 'url_verification') {
    console.log('[slack-webhook] Handling URL verification')
    return NextResponse.json({ challenge: body.challenge })
  }
  return NextResponse.json({ error: 'Not a verification request' }, { status: 400 })
}

/**
 * Log Slack event to database
 */
async function logSlackEvent(
  eventType: string,
  eventData: Record<string, any>,
  processed: boolean = false,
  error?: string
): Promise<void> {
  try {
    await sql`
      INSERT INTO slack_events (event_type, event_data, processed, error, received_at)
      VALUES (
        ${eventType},
        ${JSON.stringify(eventData)},
        ${processed},
        ${error || null},
        NOW()
      )
    `
  } catch (err) {
    console.error('[slack-webhook] Failed to log event:', err)
  }
}

/**
 * Handle Slack events
 */
async function handleSlackEvent(body: any): Promise<NextResponse> {
  const { type, event, team_id } = body

  if (type === 'event_callback') {
    const eventType = event.type

    try {
      // Log the event
      await logSlackEvent(eventType, event, false)

      // Handle specific event types
      switch (eventType) {
        case 'app_mention':
          console.log('[slack-webhook] App mention:', event.text)
          // TODO: Handle mentions (e.g., status queries)
          break

        case 'message':
          console.log('[slack-webhook] Message received:', event.text)
          // TODO: Handle incoming messages
          break

        case 'user_joined_team':
          console.log('[slack-webhook] User joined:', event.user_id)
          // TODO: Send welcome message
          break

        default:
          console.log('[slack-webhook] Unhandled event type:', eventType)
      }

      // Mark as processed
      await logSlackEvent(eventType, event, true)
      return NextResponse.json({ ok: true })
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      console.error('[slack-webhook] Error processing event:', errorMsg)
      await logSlackEvent(eventType, event, false, errorMsg)
      return NextResponse.json({ ok: true }) // Return 200 to prevent retries
    }
  }

  return NextResponse.json({ error: 'Unknown event type' }, { status: 400 })
}

/**
 * Handle slash commands
 */
async function handleSlashCommand(body: any): Promise<NextResponse> {
  const { command, user_id, team_id, text, response_url } = body

  console.log(`[slack-webhook] Slash command: ${command} from ${user_id}`)

  try {
    switch (command) {
      case '/ipo-status':
        // TODO: Fetch user's IPO status and send response
        return NextResponse.json({
          response_type: 'ephemeral',
          text: '📊 Your IPO Status\n\n(Not yet implemented)',
        })

      case '/ipo-help':
        return NextResponse.json({
          response_type: 'ephemeral',
          text: '📖 IPOReady Help\n\n*Available Commands:*\n• `/ipo-status` - View your current IPO progress\n• `/ipo-help` - Show this help message',
        })

      default:
        return NextResponse.json(
          { error: `Unknown command: ${command}` },
          { status: 400 }
        )
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[slack-webhook] Error handling slash command:', errorMsg)
    return NextResponse.json(
      { error: 'Failed to process command' },
      { status: 500 }
    )
  }
}

/**
 * Main webhook handler
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const config = getSlackConfig()

  // Check if Slack is configured
  if (!config.isConfigured || !config.signingSecret) {
    console.warn('[slack-webhook] Slack not configured, rejecting webhook')
    return NextResponse.json(
      { error: 'Slack not configured' },
      { status: 503 }
    )
  }

  try {
    // Get request body as text for signature verification
    const bodyText = await request.text()
    const body = JSON.parse(bodyText)

    // Verify signature
    const signature = request.headers.get('x-slack-signature') || ''
    const timestamp = request.headers.get('x-slack-request-timestamp') || ''

    if (!verifySlackSignature(config.signingSecret, timestamp, bodyText, signature)) {
      console.error('[slack-webhook] Invalid signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    // Handle different request types
    if (body.type === 'url_verification') {
      return handleUrlVerification(body)
    }

    if (body.type === 'event_callback') {
      return await handleSlackEvent(body)
    }

    if (body.command) {
      return await handleSlashCommand(body)
    }

    console.warn('[slack-webhook] Unknown request type:', body.type)
    return NextResponse.json(
      { error: 'Unknown request type' },
      { status: 400 }
    )
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[slack-webhook] Webhook error:', errorMsg)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Health check
 */
export async function GET(): Promise<NextResponse> {
  const config = getSlackConfig()

  return NextResponse.json({
    status: config.isConfigured ? 'configured' : 'not-configured',
    configured: config.isConfigured,
    hasBotToken: !!config.botToken,
    hasSigningSecret: !!config.signingSecret,
    hasAppId: !!config.appId,
  })
}
