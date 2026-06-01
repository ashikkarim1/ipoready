import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const QuerySchema = z.object({
  companyId: z.string().uuid().optional(),
  exchangeId: z.string().optional(),
})

/**
 * GET /api/pace/scores
 * Retrieve PACE score with benchmarks, predictive analysis, sequencing alerts, and document completeness
 * Query params: companyId, exchangeId
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string; role?: string } | undefined

  if (!session || !user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = req.nextUrl.searchParams
  const companyId = searchParams.get('companyId') || (user?.companyId ?? null)
  const exchangeId = searchParams.get('exchangeId') || null

  // Validate query params
  try {
    QuerySchema.parse({ companyId, exchangeId })
  } catch (err) {
    return NextResponse.json(
      { error: 'Invalid query parameters', details: (err as any).message },
      { status: 400 }
    )
  }

  if (!companyId) {
    return NextResponse.json({ error: 'Missing companyId' }, { status: 400 })
  }

  try {
    // Fetch company and PACE data
    const companyRows = await sql`
      SELECT 
        c.id,
        c.pace_score,
        c.target_exchange,
        c.cash_runway_months,
        c.team_size,
        c.cfo_hired_at,
        c.board_size,
        c.auditor_selected,
        c.investor_sophistication_score,
        c.estimated_days_to_ipo,
        c.progress_percentage,
        c.current_phase
      FROM companies c
      WHERE c.id = ${companyId}
      LIMIT 1
    ` as any[]

    if (companyRows.length === 0) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    const company = companyRows[0]
    const exchange = exchangeId || company.target_exchange

    // Fetch benchmark data
    const benchmarkRows = await sql`
      SELECT 
        COALESCE(AVG(pace_score), 0)::float as avg_pace,
        COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY pace_score), 0)::float as median_pace,
        COALESCE(PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY pace_score), 0)::float as p90_pace
      FROM companies
      WHERE target_exchange = ${exchange}
    ` as any[]

    const benchmarks = benchmarkRows[0] || {
      avg_pace: 0,
      median_pace: 0,
      p90_pace: 0,
    }

    // Calculate peer percentile
    const percentileRows = await sql`
      SELECT COUNT(*) as total_peers
      FROM companies
      WHERE target_exchange = ${exchange} AND pace_score <= ${company.pace_score}
    ` as any[]

    const totalPeers = percentileRows[0]?.total_peers || 1
    const allPeersRows = await sql`
      SELECT COUNT(*) as total_count
      FROM companies
      WHERE target_exchange = ${exchange}
    ` as any[]
    const totalCount = allPeersRows[0]?.total_count || 1
    const peerPercentile = Math.round((totalPeers / totalCount) * 100)

    // Calculate predictive score
    const predictiveScore = calculatePredictiveScore(company)

    // Fetch sequencing alerts
    const alertRows = await sql`
      SELECT 
        rule,
        severity,
        remediation
      FROM pace_sequencing_alerts
      WHERE company_id = ${companyId}
      ORDER BY CASE severity 
        WHEN 'critical' THEN 1 
        WHEN 'high' THEN 2 
        WHEN 'medium' THEN 3 
        ELSE 4 
      END
    ` as any[]

    // Fetch cap table status
    const capTableRows = await sql`
      SELECT
        id,
        validation_status,
        total_shareholders,
        total_shares_authorized,
        total_shares_issued,
        created_at,
        updated_at
      FROM cap_table_documents
      WHERE company_id = ${companyId}
      ORDER BY created_at DESC
      LIMIT 1
    ` as any[]

    const capTableStatus = capTableRows.length > 0 ? {
      hasCapTable: true,
      documentId: capTableRows[0].id,
      validationStatus: capTableRows[0].validation_status || 'pending',
      totalShareholders: capTableRows[0].total_shareholders || 0,
      totalSharesAuthorized: capTableRows[0].total_shares_authorized || 0,
      totalSharesIssued: capTableRows[0].total_shares_issued || 0,
      lastUpdated: capTableRows[0].updated_at || capTableRows[0].created_at,
    } : {
      hasCapTable: false,
      documentId: null,
      validationStatus: 'missing',
      totalShareholders: 0,
      totalSharesAuthorized: 0,
      totalSharesIssued: 0,
      lastUpdated: null,
    }

    // Fetch document completeness by phase
    const docCompRows = await sql`
      SELECT
        phase_id,
        AVG(completion_pct)::float as document_completeness_score
      FROM document_scorecards
      WHERE company_id = ${companyId}
      GROUP BY phase_id
      ORDER BY phase_id
    ` as any[]

    // Fetch PACE trend data (last 8 weeks)
    const trendRows = await sql`
      SELECT 
        pace_score,
        recorded_at
      FROM pace_score_history
      WHERE company_id = ${companyId}
      ORDER BY recorded_at DESC
      LIMIT 8
    ` as any[]

    const trend = trendRows.reverse().map((row: any) => ({
      score: Math.round(row.pace_score),
      date: new Date(row.recorded_at).toISOString().split('T')[0],
    }))

    // Calculate paceDelta (change from previous week)
    let paceDelta = 0
    if (trendRows.length >= 2) {
      const current = trendRows[trendRows.length - 1]?.pace_score || company.pace_score
      const previous = trendRows[trendRows.length - 2]?.pace_score || company.pace_score
      paceDelta = Math.round((current - previous) * 100) / 100
    }

    // Fetch phase-by-phase breakdown
    const phaseRows = await sql`
      SELECT 
        phase_id,
        AVG(completion_pct)::float as completion,
        0.125 as weight
      FROM document_scorecards
      WHERE company_id = ${companyId}
      GROUP BY phase_id
      ORDER BY phase_id
    ` as any[]

    const phases = phaseRows.map((row: any, idx: number) => ({
      phaseId: row.phase_id,
      phaseName: ['Pre-Planning', 'Corporate Restructuring', 'Board Selection', 'Financial Audit', 'Legal Review', 'SEC Preparation', 'Marketing & Road Show', 'Listing'][idx] || `Phase ${idx + 1}`,
      completion: Math.round(row.completion),
      weight: row.weight,
      contribution: Math.round((row.completion * row.weight) / 100),
    }))

    return NextResponse.json({
      paceScore: company.pace_score,
      paceDelta,
      daysToIpo: company.estimated_days_to_ipo || 180,
      progressPercentage: company.progress_percentage || 0,
      currentPhase: company.current_phase || 'pre_planning',
      peerPercentile,
      // Company factors for UI components
      cashRunwayMonths: company.cash_runway_months || null,
      teamSize: company.team_size || null,
      cfoHired: !!company.cfo_hired_at,
      boardSize: company.board_size || null,
      auditorSelected: company.auditor_selected || false,
      benchmarkComparison: {
        avgPace: Math.round(benchmarks.avg_pace),
        medianPace: Math.round(benchmarks.median_pace),
        p90Pace: Math.round(benchmarks.p90_pace),
      },
      predictiveScore,
      sequencingAlerts: alertRows.map((alert: any) => ({
        severity: alert.severity || 'warning',
        title: alert.rule || 'Unknown Alert',
        description: alert.remediation || 'No details available',
        daysBlocking: 0,
        remediationSteps: [alert.remediation || 'Review and take action'],
      })),
      documentReadinessScore: docCompRows.length > 0
        ? Math.round(docCompRows.reduce((sum: number, row: any) => sum + row.document_completeness_score, 0) / docCompRows.length)
        : 0,
      capTableStatus,
      trend,
      phases,
    })
  } catch (error) {
    console.error('[GET /api/pace/scores] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Calculate predictive PACE score based on company factors
 */
function calculatePredictiveScore(company: any) {
  const factors = {
    cashRunway: Math.min(company.cash_runway_months / 24, 1) * 100, // 24 months = perfect
    teamSize: Math.min(company.team_size / 150, 1) * 100, // 150+ team = perfect
    cfoHired: company.cfo_hired_at ? 100 : 0,
    boardSize: Math.min(company.board_size / 5, 1) * 100, // 5+ = perfect
    auditorSelected: company.auditor_selected ? 100 : 0,
    investorSophistication: company.investor_sophistication_score || 0,
  }

  const weights = {
    cashRunway: 0.2,
    teamSize: 0.15,
    cfoHired: 0.15,
    boardSize: 0.15,
    auditorSelected: 0.15,
    investorSophistication: 0.2,
  }

  const adjustedPaceScore = Math.round(
    Object.keys(factors).reduce((sum, key) => {
      return sum + (factors[key as keyof typeof factors] * weights[key as keyof typeof weights])
    }, 0)
  )

  const riskFactors: string[] = []
  if (company.cash_runway_months < 12) riskFactors.push('Low cash runway')
  if (company.team_size < 50) riskFactors.push('Small team size')
  if (!company.cfo_hired_at) riskFactors.push('CFO not yet hired')
  if (company.board_size < 3) riskFactors.push('Insufficient board size')
  if (!company.auditor_selected) riskFactors.push('Auditor not yet selected')

  return {
    adjustedPaceScore,
    confidenceLevel: adjustedPaceScore > 75 ? 'high' : adjustedPaceScore > 50 ? 'medium' : 'low',
    riskFactors,
    breakdown: {
      cashRunway: Math.round(factors.cashRunway),
      teamSize: Math.round(factors.teamSize),
      cfoHired: factors.cfoHired,
      boardSize: Math.round(factors.boardSize),
      auditorSelected: factors.auditorSelected,
      investorSophistication: Math.round(factors.investorSophistication),
    },
  }
}
