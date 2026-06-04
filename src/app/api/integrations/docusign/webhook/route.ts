/**
 * POST /api/integrations/docusign/webhook
 * Webhook handler for DocuSign events
 * Signature verification required
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  processWebhookEvent,
  validateWebhookSignature,
} from '@/lib/integrations/docusign'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  // Get the raw body for signature verification
  const body = await req.text()
  const signature = req.headers.get('X-DocuSign-Signature') || ''

  // Verify signature if secret is configured
  const webhookSecret = process.env.DOCUSIGN_WEBHOOK_SECRET
  if (webhookSecret) {
    if (!validateWebhookSignature(body, signature, webhookSecret)) {
      console.error('Invalid DocuSign webhook signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }
  }

  try {
    let payload: any

    try {
      payload = JSON.parse(body)
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON' },
        { status: 400 }
      )
    }

    // Process the webhook event
    await processWebhookEvent(payload)

    return NextResponse.json({ success: true })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Failed to process DocuSign webhook:', msg)

    // Return 200 to prevent DocuSign from retrying
    return NextResponse.json({ success: false, message: msg }, { status: 200 })
  }
}
