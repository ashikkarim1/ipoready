import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const companyId = user.companyId

  const rows = await sql`
    SELECT
      d.id,
      d.name,
      d.type,
      d.status,
      d.phase,
      d.required,
      d.for_filing,
      d.next_step,
      d.notes,
      d.uploaded_at,
      d.created_at,
      d.updated_at,
      dv.version_number  AS latest_version_number,
      dv.file_name       AS latest_file_name,
      dv.file_size_bytes AS latest_file_size_bytes,
      dv.storage_url     AS latest_storage_url,
      dv.created_at      AS latest_uploaded_at
    FROM documents d
    LEFT JOIN document_versions dv
      ON dv.document_id = d.id AND dv.is_latest = TRUE
    WHERE d.company_id = ${companyId}
    ORDER BY d.phase, d.created_at
  `

  return NextResponse.json({ documents: rows })
}
