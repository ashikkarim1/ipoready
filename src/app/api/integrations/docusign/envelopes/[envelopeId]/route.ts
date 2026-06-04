/**
 * GET /api/integrations/docusign/envelopes/[envelopeId]
 * Get status of specific envelope
 *
 * PUT /api/integrations/docusign/envelopes/[envelopeId]
 * Update envelope (resend)
 * Body: { action: 'resend' | 'void'; reason?: string }
 *
 * DELETE /api/integrations/docusign/envelopes/[envelopeId]
 * Void envelope
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getEnvelopeStatus,
  resendEnvelope,
  voidEnvelope,
  getDocuSignErrorMessage,
} from '@/lib/integrations/docusign'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: { envelopeId: string } }
) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.id || !user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const envelopeId = params.envelopeId

  try {
    const envelope = await getEnvelopeStatus(user.companyId, envelopeId)

    return NextResponse.json({
      id: envelope.id,
      envelopeId: envelope.envelopeId,
      docusignEnvelopeId: envelope.docusignEnvelopeId,
      envelopeName: envelope.envelopeName,
      status: envelope.status,
      sentAt: envelope.sentAt?.toISOString(),
      completedAt: envelope.completedAt?.toISOString(),
      expiresAt: envelope.expiresAt?.toISOString(),
      recipients: envelope.recipients.map((r: any) => ({
        id: r.id,
        email: r.email,
        name: r.name,
        status: r.status,
        routingOrder: r.routingOrder,
        signedAt: r.signedAt?.toISOString(),
        deliveredAt: r.deliveredAt?.toISOString(),
      })),
      completionPercentage: envelope.completionPercentage,
      isSignedByAll: envelope.isSignedByAll,
      prospectusId: envelope.prospectusId,
      metadata: envelope.metadata,
    })
  } catch (error) {
    const msg = getDocuSignErrorMessage(error)
    console.error('Failed to get envelope status:', msg)
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { envelopeId: string } }
) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.id || !user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const envelopeId = params.envelopeId

  let body: { action?: string; reason?: string }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.action) {
    return NextResponse.json(
      { error: 'Missing action parameter' },
      { status: 400 }
    )
  }

  try {
    if (body.action === 'resend') {
      await resendEnvelope(user.companyId, envelopeId)
      return NextResponse.json({ success: true, message: 'Envelope resent' })
    } else if (body.action === 'void') {
      await voidEnvelope(user.companyId, envelopeId, body.reason)
      return NextResponse.json({ success: true, message: 'Envelope voided' })
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }
  } catch (error) {
    const msg = getDocuSignErrorMessage(error)
    console.error('Failed to update envelope:', msg)
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { envelopeId: string } }
) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.id || !user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const envelopeId = params.envelopeId

  try {
    await voidEnvelope(user.companyId, envelopeId, 'Deleted by user')
    return NextResponse.json({ success: true, message: 'Envelope voided' })
  } catch (error) {
    const msg = getDocuSignErrorMessage(error)
    console.error('Failed to delete envelope:', msg)
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    )
  }
}
