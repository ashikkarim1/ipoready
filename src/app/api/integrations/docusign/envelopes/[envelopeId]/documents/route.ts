/**
 * GET /api/integrations/docusign/envelopes/[envelopeId]/documents
 * List signed documents for an envelope
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getSignedDocuments,
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
    const documents = await getSignedDocuments(user.companyId, envelopeId)

    return NextResponse.json({
      documents: documents.map((doc) => ({
        documentId: doc.documentId,
        name: doc.name,
        uri: doc.uri,
      })),
    })
  } catch (error) {
    const msg = getDocuSignErrorMessage(error)
    console.error('Failed to get documents:', msg)
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    )
  }
}
