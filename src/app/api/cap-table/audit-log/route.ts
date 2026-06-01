import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const QuerySchema = z.object({
  documentId: z.string().uuid(),
  companyId: z.string().uuid(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  offset: z.coerce.number().int().nonnegative().optional(),
})

/**
 * GET /api/cap-table/audit-log?documentId=X&companyId=Y&limit=50&offset=0
 * Fetch audit trail for cap table document
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const searchParams = req.nextUrl.searchParams
    const documentId = searchParams.get('documentId')
    const companyId = searchParams.get('companyId')
    const limit = searchParams.has('limit') ? parseInt(searchParams.get('limit')!) : 50
    const offset = searchParams.has('offset') ? parseInt(searchParams.get('offset')!) : 0

    if (!documentId || !companyId) {
      return NextResponse.json(
        { error: 'Missing documentId or companyId' },
        { status: 400 }
      )
    }

    QuerySchema.parse({ documentId, companyId, limit, offset })

    if (user.companyId && user.companyId !== companyId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Verify document exists
    const docRows = await sql`
      SELECT id FROM cap_table_documents
      WHERE id = ${documentId} AND company_id = ${companyId}
      LIMIT 1
    ` as any[]

    if (docRows.length === 0) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Fetch audit log with user info
    const auditRows = await sql`
      SELECT
        id,
        document_id,
        action,
        change_data,
        performed_by,
        created_at
      FROM cap_table_audit_log
      WHERE document_id = ${documentId}
      ORDER BY created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    ` as any[]

    // Get total count
    const countRows = await sql`
      SELECT COUNT(*) as total
      FROM cap_table_audit_log
      WHERE document_id = ${documentId}
    ` as any[]

    const total = countRows[0]?.total || 0

    // Format audit entries
    const entries = auditRows.map((row: any) => ({
      id: row.id,
      action: row.action,
      description: describeAction(row.action, row.change_data),
      timestamp: row.created_at,
      performedBy: row.performed_by,
      details: row.change_data || {},
    }))

    return NextResponse.json({
      documentId,
      totalEntries: total,
      entries,
      pagination: {
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  } catch (error) {
    console.error('[GET /api/cap-table/audit-log] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function describeAction(action: string, changeData: any): string {
  const descriptions: Record<string, string> = {
    'document_uploaded': 'Cap table document uploaded',
    'validation_run': 'Validation performed',
    'validation_passed': 'Validation passed all checks',
    'validation_failed': 'Validation found errors',
    'holding_added': 'New shareholding added',
    'holding_updated': 'Shareholding updated',
    'holding_deleted': 'Shareholding removed',
    'vesting_schedule_created': 'Vesting schedule created',
    'scenario_generated': 'Scenario generated',
    'waterfall_calculated': 'Waterfall calculation performed',
    'export_requested': 'Data exported',
  }

  return descriptions[action] || `${action.replace(/_/g, ' ').charAt(0).toUpperCase() + action.replace(/_/g, ' ').slice(1)}`
}
