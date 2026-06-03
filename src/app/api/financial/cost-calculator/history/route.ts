import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * GET /api/financial/cost-calculator/history
 * Retrieve calculation history for a company
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const companyId = user.companyId
  if (!companyId) {
    return NextResponse.json({ error: 'Missing companyId' }, { status: 400 })
  }

  try {
    const limit = 50
    const offset = 0

    const calculations = await sql`
      SELECT 
        id,
        company_revenue,
        selected_exchange,
        complexity_level,
        timeline_months,
        total_cost,
        cost_breakdown,
        notes,
        created_at,
        updated_at
      FROM cost_calculations
      WHERE company_id = ${companyId}
      ORDER BY created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    ` as any[]

    const total = await sql`
      SELECT COUNT(*) as count
      FROM cost_calculations
      WHERE company_id = ${companyId}
    ` as any[]

    return NextResponse.json({
      success: true,
      companyId,
      calculations: calculations.map(calc => ({
        id: calc.id,
        companyRevenue: calc.company_revenue / 100,
        selectedExchange: calc.selected_exchange,
        complexityLevel: calc.complexity_level,
        timelineMonths: calc.timeline_months,
        totalCost: calc.total_cost / 100,
        costBreakdown: calc.cost_breakdown,
        notes: calc.notes,
        createdAt: calc.created_at,
        updatedAt: calc.updated_at,
      })),
      pagination: {
        limit,
        offset,
        total: total[0].count,
      },
    })
  } catch (error) {
    console.error('[GET /api/financial/cost-calculator/history] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
