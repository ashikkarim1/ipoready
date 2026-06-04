/**
 * GET /api/integrations/docusign/envelopes
 * List envelopes for the company
 *
 * Query params: { status?: string; prospectusId?: string; limit?: number; offset?: number }
 *
 * POST /api/integrations/docusign/envelopes
 * Create new envelope for signing
 *
 * Body: {
 *   templateId?: string
 *   envelopeName: string
 *   description?: string
 *   prospectusId?: string
 *   recipients: Array<{ email: string; name: string; roleName: string; routingOrder?: number }>
 *   customFields?: Record<string, string>
 *   expirationDays?: number
 *   documentBase64?: string
 *   documentName?: string
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  listEnvelopes,
  createEnvelope,
  getDocuSignErrorMessage,
} from '@/lib/integrations/docusign'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.id || !user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = req.nextUrl.searchParams
  const status = searchParams.get('status') || undefined
  const prospectusId = searchParams.get('prospectusId') || undefined
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = parseInt(searchParams.get('offset') || '0')

  try {
    const result = await listEnvelopes(user.companyId, {
      status,
      prospectusId,
      limit,
      offset,
    })

    return NextResponse.json({
      envelopes: result.envelopes.map((env: any) => ({
        id: env.id,
        envelopeId: env.envelopeId,
        docusignEnvelopeId: env.docusignEnvelopeId,
        envelopeName: env.envelopeName,
        status: env.status,
        sentAt: env.sentAt?.toISOString(),
        completedAt: env.completedAt?.toISOString(),
        expiresAt: env.expiresAt?.toISOString(),
        recipients: env.recipients.map((r: any) => ({
          id: r.id,
          email: r.email,
          name: r.name,
          status: r.status,
          routingOrder: r.routingOrder,
          signedAt: r.signedAt?.toISOString(),
          deliveredAt: r.deliveredAt?.toISOString(),
        })),
        completionPercentage: env.completionPercentage,
        isSignedByAll: env.isSignedByAll,
        prospectusId: env.prospectusId,
      })),
      total: result.total,
    })
  } catch (error) {
    const msg = getDocuSignErrorMessage(error)
    console.error('Failed to list envelopes:', msg)
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.id || !user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: {
    templateId?: string
    envelopeName?: string
    description?: string
    prospectusId?: string
    recipients?: Array<{ email: string; name: string; roleName: string; routingOrder?: number }>
    customFields?: Record<string, string>
    expirationDays?: number
    documentBase64?: string
    documentName?: string
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.envelopeName || !body.recipients || body.recipients.length === 0) {
    return NextResponse.json(
      { error: 'Missing envelopeName or recipients' },
      { status: 400 }
    )
  }

  if (!body.templateId && !body.documentBase64) {
    return NextResponse.json(
      { error: 'Either templateId or documentBase64 is required' },
      { status: 400 }
    )
  }

  try {
    const envelope = await createEnvelope({
      companyId: user.companyId,
      templateId: body.templateId,
      envelopeName: body.envelopeName,
      description: body.description,
      prospectusId: body.prospectusId,
      recipients: body.recipients,
      customFields: body.customFields,
      expirationDays: body.expirationDays,
      documentBase64: body.documentBase64,
      documentName: body.documentName,
    })

    return NextResponse.json({
      success: true,
      envelope: {
        id: envelope.id,
        envelopeId: envelope.envelopeId,
        docusignEnvelopeId: envelope.docusignEnvelopeId,
        envelopeName: envelope.envelopeName,
        status: envelope.status,
        sentAt: envelope.sentAt?.toISOString(),
        expiresAt: envelope.expiresAt?.toISOString(),
        recipients: envelope.recipients.map((r: any) => ({
          id: r.id,
          email: r.email,
          name: r.name,
          status: r.status,
          routingOrder: r.routingOrder,
        })),
        completionPercentage: envelope.completionPercentage,
        isSignedByAll: envelope.isSignedByAll,
      },
    })
  } catch (error) {
    const msg = getDocuSignErrorMessage(error)
    console.error('Failed to create envelope:', msg)
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    )
  }
}
