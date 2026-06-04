/**
 * POST /api/integrations/docusign/envelopes/[envelopeId]/signing-url
 * Get embedded signing URL for a recipient
 *
 * Body: {
 *   signerEmail: string
 *   signerName: string
 *   returnUrl: string
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getEmbeddedSigningUrl,
  getDocuSignErrorMessage,
} from '@/lib/integrations/docusign'

export const dynamic = 'force-dynamic'

export async function POST(
  req: NextRequest,
  { params }: { params: { envelopeId: string } }
) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.id || !user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const envelopeId = params.envelopeId

  let body: {
    signerEmail?: string
    signerName?: string
    returnUrl?: string
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.signerEmail || !body.signerName || !body.returnUrl) {
    return NextResponse.json(
      { error: 'Missing signerEmail, signerName, or returnUrl' },
      { status: 400 }
    )
  }

  try {
    const signingUrl = await getEmbeddedSigningUrl(
      user.companyId,
      envelopeId,
      body.signerEmail,
      body.signerName,
      body.returnUrl
    )

    return NextResponse.json({
      success: true,
      signingUrl,
      expiresIn: 3600, // 1 hour
    })
  } catch (error) {
    const msg = getDocuSignErrorMessage(error)
    console.error('Failed to get signing URL:', msg)
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    )
  }
}
