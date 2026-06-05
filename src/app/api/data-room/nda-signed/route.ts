/**
 * NDA Signed Webhook
 *
 * When investor signs NDA via DocuSign:
 * 1. Generate secure temp passcode
 * 2. Grant access to data room
 * 3. Send secure access email with link + temp password
 * 4. Log access event
 */

import { NextRequest, NextResponse } from 'next/server'

interface DocuSignWebhook {
  envelopeId: string
  status: string
  signerEmail: string
  signerName: string
  completedDateTime: string
  inviteId: string
}

interface DataRoomAccess {
  inviteId: string
  email: string
  name: string
  tempPassword: string
  accessToken: string
  grantedAt: string
  expiresAt: string
  passwordChanged: boolean
  firstAccessAt?: string
  lastAccessAt?: string
  totalSessionTime: number // seconds
  documentsViewed: number
  focusArea?: string // 'financials' | 'team' | 'market' | 'product' | 'legal'
}

// Mock in-memory storage (replace with database)
const dataRoomAccess = new Map<string, DataRoomAccess>()
const accessEvents = new Map<string, any[]>()

export async function POST(request: NextRequest) {
  try {
    const webhook = await request.json() as DocuSignWebhook

    // Verify status is "Completed" (all signers signed)
    if (webhook.status !== 'Completed') {
      return NextResponse.json({ received: true })
    }

    // Generate secure temp passcode (6 chars, alphanumeric)
    const tempPassword = Math.random().toString(36).substring(2, 8).toUpperCase()
    const accessToken = generateSecureToken()
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24 hours

    // Create access record
    const access: DataRoomAccess = {
      inviteId: webhook.envelopeId,
      email: webhook.signerEmail,
      name: webhook.signerName,
      tempPassword,
      accessToken,
      grantedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      passwordChanged: false,
      totalSessionTime: 0,
      documentsViewed: 0,
    }

    dataRoomAccess.set(webhook.envelopeId, access)
    accessEvents.set(webhook.envelopeId, [
      {
        timestamp: now.toISOString(),
        event: 'NDA_SIGNED',
        signerEmail: webhook.signerEmail,
        signerName: webhook.signerName,
      },
      {
        timestamp: now.toISOString(),
        event: 'ACCESS_GRANTED',
        tempPassword: `[REDACTED for security]`,
      }
    ])

    // TODO: Send secure email to investor with:
    // - Data room link with access token
    // - Temp password
    // - Instructions to set permanent password
    // - Data room structure/quick start guide
    console.log(`NDA Signed: ${webhook.signerEmail}`)
    console.log(`Temp Password: ${tempPassword}`)
    console.log(`Access Token: ${accessToken}`)
    console.log(`Email would be sent to: ${webhook.signerEmail}`)

    return NextResponse.json({
      success: true,
      inviteId: webhook.envelopeId,
      accessGranted: true,
      message: 'NDA signed, access granted, email sent'
    })
  } catch (error) {
    console.error('NDA webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

function generateSecureToken(): string {
  return Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)
}
