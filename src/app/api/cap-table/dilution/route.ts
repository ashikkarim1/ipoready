import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const DilutionSchema = z.object({
  warrant_exercise_shares: z.coerce.number().int().nonnegative(),
  new_financing_shares: z.coerce.number().int().nonnegative(),
  employee_vesting_shares: z.coerce.number().int().nonnegative(),
  scenario_type: z.enum(['base-case', 'conservative', 'aggressive']).optional(),
})

type DilutionRequest = z.infer<typeof DilutionSchema>

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const validatedData = DilutionSchema.parse(body)

    // Get cap table
    const capTables = await sql`
      SELECT id FROM cap_tables WHERE company_id = ${user.companyId}
      ORDER BY created_at DESC LIMIT 1
    ` as any[]

    if (capTables.length === 0) {
      return NextResponse.json({ error: 'No cap table found' }, { status: 404 })
    }

    const capTableId = capTables[0].id

    // Get current shares
    const currentShares = await sql`
      SELECT COALESCE(SUM(CAST(quantity AS BIGINT)), 0) as total
      FROM holdings WHERE cap_table_id = ${capTableId}
    ` as any[]

    const currentTotal = currentShares[0].total

    // Calculate scenarios
    const totalNewShares = validatedData.warrant_exercise_shares + 
                         validatedData.new_financing_shares + 
                         validatedData.employee_vesting_shares

    const postIPOTotal = currentTotal + totalNewShares

    // Get shareholders for ownership impact
    const shareholders = await sql`
      SELECT DISTINCT s.id, s.shareholder_name,
             SUM(CAST(h.quantity AS BIGINT)) as shares
      FROM shareholders s
      LEFT JOIN holdings h ON s.id = h.shareholder_id AND h.cap_table_id = ${capTableId}
      WHERE s.cap_table_id = ${capTableId}
      GROUP BY s.id, s.shareholder_name
    ` as any[]

    const ownershipImpact: Record<string, any> = {}
    shareholders.forEach(sh => {
      const preIPOPct = currentTotal > 0 ? (sh.shares / currentTotal) * 100 : 0
      const postIPOPct = postIPOTotal > 0 ? (sh.shares / postIPOTotal) * 100 : 0
      ownershipImpact[sh.id] = {
        shareholder_name: sh.shareholder_name,
        pre_ipo_shares: sh.shares,
        pre_ipo_pct: parseFloat(preIPOPct.toFixed(2)),
        post_ipo_shares: sh.shares,
        post_ipo_pct: parseFloat(postIPOPct.toFixed(2)),
        change_pct: parseFloat((postIPOPct - preIPOPct).toFixed(2)),
      }
    })

    // Save scenario
    const scenario = await sql`
      INSERT INTO dilution_scenarios (
        cap_table_id, scenario_name, scenario_type,
        warrant_shares, new_financing_shares, option_vesting_shares,
        post_ipo_total_shares, ownership_impact
      ) VALUES (
        ${capTableId},
        ${validatedData.scenario_type || 'custom'},
        ${validatedData.scenario_type || 'base-case'},
        ${validatedData.warrant_exercise_shares},
        ${validatedData.new_financing_shares},
        ${validatedData.employee_vesting_shares},
        ${postIPOTotal},
        ${JSON.stringify(ownershipImpact)}::jsonb
      )
      RETURNING id
    ` as any[]

    return NextResponse.json({
      success: true,
      scenario: {
        id: scenario[0].id,
        currentTotalShares: currentTotal,
        newShares: {
          warrant_exercise: validatedData.warrant_exercise_shares,
          new_financing: validatedData.new_financing_shares,
          employee_vesting: validatedData.employee_vesting_shares,
          total: totalNewShares,
        },
        postIPOTotalShares: postIPOTotal,
        dilutionPercentage: parseFloat(((totalNewShares / postIPOTotal) * 100).toFixed(2)),
        ownershipImpact,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.issues },
        { status: 400 }
      )
    }
    console.error('[POST /api/cap-table/dilution] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const capTables = await sql`
      SELECT id FROM cap_tables WHERE company_id = ${user.companyId}
      ORDER BY created_at DESC LIMIT 1
    ` as any[]

    if (capTables.length === 0) {
      return NextResponse.json({ success: true, scenarios: [] })
    }

    const capTableId = capTables[0].id

    const scenarios = await sql`
      SELECT id, scenario_name, scenario_type, warrant_shares,
             new_financing_shares, option_vesting_shares,
             post_ipo_total_shares, ownership_impact, created_at
      FROM dilution_scenarios
      WHERE cap_table_id = ${capTableId}
      ORDER BY created_at DESC
    ` as any[]

    return NextResponse.json({
      success: true,
      scenarios: scenarios.map(s => ({
        id: s.id,
        scenario_name: s.scenario_name,
        scenario_type: s.scenario_type,
        warrant_shares: s.warrant_shares,
        new_financing_shares: s.new_financing_shares,
        employee_vesting_shares: s.option_vesting_shares,
        post_ipo_total_shares: s.post_ipo_total_shares,
        ownershipImpact: s.ownership_impact,
        createdAt: s.created_at,
      })),
    })
  } catch (error) {
    console.error('[GET /api/cap-table/dilution] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
