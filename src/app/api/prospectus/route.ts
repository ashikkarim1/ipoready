import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const QuerySchema = z.object({
  companyId: z.string().uuid().optional(),
})

/**
 * GET /api/prospectus
 * Retrieve list of prospectuses for a company
 * Query params: companyId
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = req.nextUrl.searchParams
  const companyId = searchParams.get('companyId') || user?.companyId

  // Validate query params
  try {
    QuerySchema.parse({ companyId })
  } catch (err) {
    return NextResponse.json(
      { error: 'Invalid query parameters' },
      { status: 400 }
    )
  }

  if (!companyId) {
    return NextResponse.json({ error: 'Missing companyId' }, { status: 400 })
  }

  try {
    // Fetch prospectuses for company
    const prospectuses = await sql`
      SELECT
        id,
        company_id,
        exchange,
        form_type,
        status,
        completion_pct,
        sections_total,
        sections_complete,
        sections_approved,
        estimated_completion_date,
        target_ipo_date,
        created_at,
        updated_at,
        finalized_at,
        exported_at
      FROM prospectuses
      WHERE company_id = ${companyId}
      ORDER BY created_at DESC
    ` as any[]

    const formattedProspectuses = prospectuses.map((p: any) => ({
      id: p.id,
      companyId: p.company_id,
      exchange: p.exchange,
      formType: p.form_type,
      status: p.status,
      completionPct: p.completion_pct,
      sections: {
        total: p.sections_total,
        complete: p.sections_complete,
        approved: p.sections_approved,
      },
      dates: {
        estimatedCompletion: p.estimated_completion_date,
        targetIpo: p.target_ipo_date,
        created: p.created_at,
        updated: p.updated_at,
        finalized: p.finalized_at,
        exported: p.exported_at,
      },
    }))

    return NextResponse.json({
      companyId,
      prospectuses: formattedProspectuses,
      count: formattedProspectuses.length,
    })
  } catch (error) {
    console.error('[GET /api/prospectus] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
