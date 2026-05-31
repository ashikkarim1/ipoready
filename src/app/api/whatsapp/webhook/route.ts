import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { sendWhatsApp, fetchTwilioMedia, transcribeAudio } from '@/lib/whatsapp'
import { loadContext, processMessage } from '@/lib/ai-companion'
import { updateMessageStatus } from '@/lib/whatsapp-service'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

// ── Twilio signature validation ───────────────────────────────────────────────
// https://www.twilio.com/docs/usage/webhooks/webhooks-security
function validateTwilioSignature(
  authToken: string,
  twilioSignature: string,
  url: string,
  params: URLSearchParams,
): boolean {
  // Build the sorted param string Twilio signs
  const sortedParams = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}${v}`)
    .join('')

  const hmac = crypto
    .createHmac('sha1', authToken)
    .update(url + sortedParams)
    .digest('base64')

  // Constant-time comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(twilioSignature))
  } catch {
    return false
  }
}

// ── Empty TwiML response helper ───────────────────────────────────────────────
const EMPTY_TWIML = new NextResponse('<?xml version="1.0"?><Response></Response>', {
  headers: { 'Content-Type': 'text/xml' },
})

// Twilio sends form-encoded POST bodies
export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const params = new URLSearchParams(body)

    // ── Validate Twilio signature (skip in dev when auth token not set) ───────
    const authToken = process.env.TWILIO_AUTH_TOKEN
    if (authToken) {
      const twilioSig = req.headers.get('x-twilio-signature') ?? ''
      const appUrl    = process.env.NEXTAUTH_URL ?? process.env.APP_URL ?? ''
      const fullUrl   = `${appUrl}/api/whatsapp/webhook`

      if (!twilioSig || !validateTwilioSignature(authToken, twilioSig, fullUrl, params)) {
        console.warn('[whatsapp/webhook] invalid Twilio signature — request rejected')
        return new NextResponse('Forbidden', { status: 403 })
      }
    }

    // ── Handle message status receipts (delivery confirmations) ───────────────
    const messageStatus = params.get('MessageStatus')
    const messageId = params.get('MessageSid')

    if (messageStatus && messageId) {
      // Twilio is sending a delivery receipt
      // MessageStatus: 'delivered', 'failed', 'sent', 'read', 'undelivered'
      const status = messageStatus === 'delivered' ? 'delivered'
        : messageStatus === 'failed' || messageStatus === 'undelivered' ? 'failed'
        : 'sent'

      try {
        await updateMessageStatus(messageId, status)
        console.log(`[whatsapp/webhook] Updated message ${messageId} status to ${status}`)
      } catch (err) {
        console.error(`[whatsapp/webhook] Failed to update message status:`, err)
      }

      // Always return empty TwiML for status callbacks
      return EMPTY_TWIML
    }

    const from      = params.get('From') ?? ''       // e.g. "whatsapp:+16135551234"
    const msgBody   = params.get('Body') ?? ''
    const mediaUrl  = params.get('MediaUrl0') ?? ''
    const mediaType = params.get('MediaContentType0') ?? ''
    const numMedia  = parseInt(params.get('NumMedia') ?? '0', 10)

    // Normalise phone number → "+16135551234"
    const phone = from.replace('whatsapp:', '').trim()
    if (!phone) return EMPTY_TWIML

    // Look up user by phone number — must be opted in AND on Growth/Enterprise
    const userRows = await sql`
      SELECT u.id, u.company_id
      FROM users u
      LEFT JOIN companies c ON c.id = u.company_id
      WHERE u.phone_number = ${phone}
        AND u.whatsapp_opted_in = TRUE
        AND COALESCE(c.subscription_plan, 'starter') IN ('growth', 'enterprise')
      LIMIT 1
    `

    if (!userRows.length) {
      // Unknown number — send onboarding prompt
      await sendWhatsApp(phone,
        `Hi! I don't recognise this number. To connect your WhatsApp to IPOReady, add it in your account settings at ipoready.com/account 🚀`
      )
      return EMPTY_TWIML
    }

    const { id: userId } = userRows[0] as { id: string; company_id: string }

    // Load AI context
    const ctx = await loadContext(userId)
    if (!ctx) {
      await sendWhatsApp(phone, 'Your account isn\'t fully set up yet. Visit ipoready.com to complete onboarding.')
      return EMPTY_TWIML
    }

    // Determine the user's message — text or voice transcription
    let userMessage = msgBody.trim()
    let transcription: string | null = null

    if (numMedia > 0 && mediaUrl && mediaType.startsWith('audio/')) {
      try {
        const audioBuffer = await fetchTwilioMedia(mediaUrl)
        transcription = await transcribeAudio(audioBuffer, mediaType)
        userMessage = transcription
      } catch (err) {
        console.error('[whatsapp/webhook] transcription failed:', err)
        userMessage = msgBody || '(voice note — transcription failed)'
      }
    }

    if (!userMessage) return EMPTY_TWIML

    // Log inbound message
    await sql`
      INSERT INTO ai_messages (user_id, direction, channel, body, media_url, transcription)
      VALUES (${userId}, 'inbound', 'whatsapp', ${userMessage}, ${mediaUrl || null}, ${transcription})
    `

    // Process with AI companion
    const { reply, actionsLog } = await processMessage(ctx, userMessage)

    // Log outbound message
    await sql`
      INSERT INTO ai_messages (user_id, direction, channel, body, actions_taken)
      VALUES (${userId}, 'outbound', 'whatsapp', ${reply}, ${JSON.stringify(actionsLog)})
    `

    // Send reply
    await sendWhatsApp(phone, reply)

    // Respond with empty TwiML (we already sent the reply via REST API)
    return EMPTY_TWIML
  } catch (err) {
    console.error('[whatsapp/webhook]', err)
    // Return empty TwiML — never return 500 to Twilio (it retries)
    return EMPTY_TWIML
  }
}
