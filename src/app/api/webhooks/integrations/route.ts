import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { handleCartaWebhook } from '@/lib/integrations/carta-client'
import { handlePulleyWebhook } from '@/lib/integrations/pulley-client'
import { handleDocuSignWebhook } from '@/lib/integrations/docusign-client'

export const dynamic = 'force-dynamic'

/**
 * POST /api/webhooks/integrations
 * Handle webhooks from Carta, Pulley, and DocuSign
 * 
 * Each provider sends webhooks with signatures for verification
 */
export async function POST(request: NextRequest) {
  try {
    // Determine provider from header or body
    const provider = request.headers.get('x-webhook-provider')?.toLowerCase() ||
                     request.headers.get('x-carta-event') ? 'carta' :
                     request.headers.get('x-pulley-event') ? 'pulley' :
                     request.headers.get('x-docusign-event') ? 'docusign' : null

    if (!provider) {
      return NextResponse.json(
        { error: 'Could not identify webhook provider' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const signature = request.headers.get('x-webhook-signature') || ''

    // Get the webhook secret for this provider
    const secretKey = getWebhookSecret(provider)
    if (!secretKey) {
      console.warn(`No webhook secret configured for provider: ${provider}`)
      // Still process the webhook but log a warning
    }

    // Log the webhook
    await sql`
      INSERT INTO webhook_logs (
        provider, event_type, status, payload, signature_valid, created_at
      )
      VALUES (
        ${provider},
        ${body.event || body.eventType || 'unknown'},
        'pending',
        ${JSON.stringify(body)},
        ${secretKey ? 'pending' : 'skipped'},
        NOW()
      )
    `

    // Route to appropriate handler
    let result
    switch (provider) {
      case 'carta':
        result = await handleCartaWebhook(body, signature, secretKey || '')
        break
      case 'pulley':
        result = await handlePulleyWebhook(body, signature, secretKey || '')
        break
      case 'docusign':
        result = await handleDocuSignWebhook(body)
        break
      default:
        return NextResponse.json(
          { error: 'Unknown webhook provider' },
          { status: 400 }
        )
    }

    // Update webhook log
    if (result.success) {
      await sql`
        UPDATE webhook_logs
        SET status = 'processed'
        WHERE provider = ${provider} AND created_at = NOW()
      `
    }

    return NextResponse.json(
      { success: result.success, message: result.message },
      { status: result.success ? 200 : 400 }
    )
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Webhook processing failed:', msg)

    return NextResponse.json(
      { error: `Webhook processing failed: ${msg}` },
      { status: 500 }
    )
  }
}

function getWebhookSecret(provider: string): string | null {
  switch (provider) {
    case 'carta':
      return process.env.CARTA_WEBHOOK_SECRET || null
    case 'pulley':
      return process.env.PULLEY_WEBHOOK_SECRET || null
    case 'docusign':
      return process.env.DOCUSIGN_WEBHOOK_SECRET || null
    default:
      return null
  }
}
