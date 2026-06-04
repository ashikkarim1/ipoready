/**
 * GET /api/integrations/docusign/envelopes/[envelopeId]/documents/[documentId]/download
 * Download a signed document
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  downloadSignedDocument,
  getDocuSignErrorMessage,
} from '@/lib/integrations/docusign'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: { envelopeId: string; documentId: string } }
) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.id || !user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const envelopeId = params.envelopeId
  const documentId = params.documentId

  try {
    const buffer = await downloadSignedDocument(
      user.companyId,
      envelopeId,
      documentId
    )

    const uint8Array = new Uint8Array(buffer)
    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="document-${documentId}.pdf"`,
        'Content-Length': buffer.length.toString(),
      },
    })
  } catch (error) {
    const msg = getDocuSignErrorMessage(error)
    console.error('Failed to download document:', msg)
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    )
  }
}
