import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const SaveSchema = z.object({
  calculationData: z.record(z.any()),
  companyRevenue: z.number(),
  selectedExchange: z.string(),
  complexityLevel: z.string(),
  timelineMonths: z.number(),
  totalCost: z.number(),
  costBreakdown: z.record(z.number()),
  benchmarks: z.record(z.any()),
  notes: z.string().optional(),
})

/**
 * POST /api/financial/cost-calculator/save
 * Save a cost calculation to the database
 */
export async function POST(req: NextRequest) {
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
    const body = await req.json()
    const validated = SaveSchema.parse(body)

    // Save calculation to database
    const result = await sql`
      INSERT INTO cost_calculations (
        company_id,
        calculation_data,
        company_revenue,
        selected_exchange,
        complexity_level,
        timeline_months,
        total_cost,
        cost_breakdown,
        benchmarks,
        notes
      )
      VALUES (
        ${companyId},
        ${JSON.stringify(validated.calculationData)},
        ${Math.round(validated.companyRevenue * 100)},
        ${validated.selectedExchange},
        ${validated.complexityLevel},
        ${validated.timelineMonths},
        ${Math.round(validated.totalCost * 100)},
        ${JSON.stringify(validated.costBreakdown)},
        ${JSON.stringify(validated.benchmarks)},
        ${validated.notes || null}
      )
      RETURNING id, created_at
    ` as any[]

    if (result.length === 0) {
      throw new Error('Failed to save calculation')
    }

    return NextResponse.json({
      success: true,
      id: result[0].id,
      createdAt: result[0].created_at,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('[POST /api/financial/cost-calculator/save] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
