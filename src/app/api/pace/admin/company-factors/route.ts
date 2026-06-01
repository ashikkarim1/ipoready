import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const BodySchema = z.object({
  companyId: z.string().uuid(),
  cash_runway_months: z.number().int().min(0).optional(),
  team_size: z.number().int().min(0).optional(),
  cfo_hired_at: z.string().datetime().optional(),
  board_size: z.number().int().min(0).optional(),
  auditor_selected: z.boolean().optional(),
  investor_sophistication_score: z.number().min(0).max(100).optional(),
})

/**
 * POST /api/pace/admin/company-factors
 * Admin-only endpoint to update company PACE factors and recalculate PACE score
 * Body: { companyId, cash_runway_months, team_size, cfo_hired_at, board_size, auditor_selected, investor_sophistication_score }
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; role?: string } | undefined

  // Check authorization
  if (!session || !user?.id || !['admin', 'system_admin'].includes(user?.role || '')) {
    return NextResponse.json(
      { error: 'Forbidden — admin access required' },
      { status: 403 }
    )
  }

  let body: z.infer<typeof BodySchema>

  try {
    const json = await req.json()
    body = BodySchema.parse(json)
  } catch (err) {
    return NextResponse.json(
      { error: 'Invalid request body', details: (err as any).message },
      { status: 400 }
    )
  }

  const { companyId, ...updateData } = body

  try {
    // Fetch current company to preserve existing values
    const currentRows = await sql`
      SELECT id, cash_runway_months, team_size, cfo_hired_at, board_size,
             auditor_selected, investor_sophistication_score
      FROM companies
      WHERE id = ${companyId}
      LIMIT 1
    ` as any[]

    if (currentRows.length === 0) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    const current = currentRows[0]
    const merged = { ...current, ...updateData }

    // Update company factors
    const updatedRows = await sql`
      UPDATE companies
      SET 
        cash_runway_months = ${merged.cash_runway_months},
        team_size = ${merged.team_size},
        cfo_hired_at = ${merged.cfo_hired_at},
        board_size = ${merged.board_size},
        auditor_selected = ${merged.auditor_selected},
        investor_sophistication_score = ${merged.investor_sophistication_score},
        updated_at = NOW()
      WHERE id = ${companyId}
      RETURNING 
        id, name, pace_score, cash_runway_months, team_size,
        cfo_hired_at, board_size, auditor_selected, investor_sophistication_score
    ` as any[]

    const company = updatedRows[0]

    // Recalculate PACE score based on new factors
    const newPaceScore = recalculatePaceScore(company)

    // Update PACE score
    const finalRows = await sql`
      UPDATE companies
      SET pace_score = ${newPaceScore}
      WHERE id = ${companyId}
      RETURNING 
        id, name, pace_score, cash_runway_months, team_size,
        cfo_hired_at, board_size, auditor_selected, investor_sophistication_score
    ` as any[]

    const updated = finalRows[0]

    return NextResponse.json({
      success: true,
      company: {
        id: updated.id,
        name: updated.name,
        paceScore: updated.pace_score,
        cashRunwayMonths: updated.cash_runway_months,
        teamSize: updated.team_size,
        cfoHiredAt: updated.cfo_hired_at,
        boardSize: updated.board_size,
        auditorSelected: updated.auditor_selected,
        investorSophisticationScore: updated.investor_sophistication_score,
      },
    })
  } catch (error) {
    console.error('[POST /api/pace/admin/company-factors] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Recalculate PACE score based on company factors
 * Uses weighted formula combining readiness indicators
 */
function recalculatePaceScore(company: any): number {
  const baseScore = 50 // Start at 50

  let adjustments = 0

  // Cash runway (max +15)
  if (company.cash_runway_months) {
    adjustments += Math.min((company.cash_runway_months / 24) * 15, 15)
  }

  // Team size (max +15)
  if (company.team_size) {
    adjustments += Math.min((company.team_size / 150) * 15, 15)
  }

  // CFO hired (max +10)
  if (company.cfo_hired_at) {
    adjustments += 10
  }

  // Board size (max +10)
  if (company.board_size) {
    adjustments += Math.min((company.board_size / 5) * 10, 10)
  }

  // Auditor selected (max +10)
  if (company.auditor_selected) {
    adjustments += 10
  }

  // Investor sophistication (max +20)
  if (company.investor_sophistication_score) {
    adjustments += (company.investor_sophistication_score / 100) * 20
  }

  const finalScore = Math.min(Math.max(baseScore + adjustments, 0), 100)
  return Math.round(finalScore)
}
