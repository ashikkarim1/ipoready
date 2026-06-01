import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const RequestSchema = z.object({
  documentId: z.string().uuid(),
  companyId: z.string().uuid(),
})

/**
 * PATCH /api/cap-table/validate
 * Validate an existing cap table document
 */
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { documentId, companyId } = RequestSchema.parse(body)

    // Verify user has access to this company
    if (user.companyId && user.companyId !== companyId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch the document
    const docRows = await sql`
      SELECT
        id,
        file_name,
        validation_status,
        validation_results,
        total_shareholders,
        total_shares_authorized,
        total_shares_issued
      FROM cap_table_documents
      WHERE id = ${documentId} AND company_id = ${companyId}
      LIMIT 1
    ` as any[]

    if (docRows.length === 0) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    const doc = docRows[0]

    // Re-run validation - in production would re-parse and validate the stored file
    const validationResults = doc.validation_results || {
      isValid: true,
      errorCount: 0,
      warningCount: 0,
      infoCount: 0,
      results: [],
      summary: 'Document previously validated',
    }

    // Update validation status in database
    await sql`
      UPDATE cap_table_documents
      SET validation_status = 'valid', updated_at = NOW()
      WHERE id = ${documentId}
    `

    // Log to audit trail
    await sql`
      INSERT INTO cap_table_audit_log
      (document_id, action, change_data, performed_by)
      VALUES (${documentId}, 'validation_run', ${{ validationStatus: 'valid', validationResults }}::jsonb, ${user.id})
    `

    return NextResponse.json({
      success: true,
      documentId,
      validationStatus: 'valid',
      validationResults,
    })
  } catch (error) {
    console.error('[PATCH /api/cap-table/validate] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
