import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{  id: string  }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const params = await context.params
  const { id: documentId } = params

  const versions = await sql`
    SELECT
      dv.id,
      dv.version_number,
      dv.file_name,
      dv.file_size_bytes,
      dv.file_mime_type,
      dv.storage_url,
      dv.checksum,
      dv.uploaded_by,
      u.name AS uploaded_by_name,
      dv.created_at AS uploaded_at,
      dv.is_latest,
      dv.notes
    FROM document_versions dv
    LEFT JOIN users u ON u.id = dv.uploaded_by
    WHERE dv.document_id = ${documentId}
    ORDER BY dv.version_number DESC
  `

  return NextResponse.json({ versions }, {
    headers: {
      // Cache document versions for 60s at the CDN edge, serve stale for up
      // to 10 minutes while revalidating in the background. Version lists
      // change infrequently — this cuts DB hits dramatically on repeated views.
      'Cache-Control': 's-maxage=60, stale-while-revalidate=600',
    },
  })
}
