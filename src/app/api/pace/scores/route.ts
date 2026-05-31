import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import { computeAndUpdateCompanyStats } from '@/lib/company-stats'

export const dynamic = 'force-dynamic'

// Weights as integers (sum = 100) — must match company-stats.ts
const PHASE_WEIGHTS: Record<string, number> = {
  pre_planning: 5,
  corporate_restructuring: 20,
  financial_audit: 18,
  legal_documentation: 18,
  regulatory_filing: 15,
  marketing_roadshow: 10,
  listing_application: 10,
  post_listing: 4,
}

const PHASE_LABELS: Record<string, string> = {
  pre_planning: 'Pre-Planning',
  corporate_restructuring: 'Corporate Restructuring',
  financial_audit: 'Financial Audit',
  legal_documentation: 'Legal Documentation',
  regulatory_filing: 'Regulatory Filing',
  marketing_roadshow: 'Marketing & Roadshow',
  listing_application: 'Listing Application',
  post_listing: 'Post-Listing Readiness',
}

const PHASE_ORDER = [
  'pre_planning',
  'corporate_restructuring',
  'financial_audit',
  'legal_documentation',
  'regulatory_filing',
  'marketing_roadshow',
  'listing_application',
  'post_listing',
]

interface PhaseTaskRow {
  phase: string
  total: string
  completed: string
  in_progress: string
}

interface HistoryRow {
  week: string
  score: string
}

interface SnapshotCountRow {
  count: string
}

export async function GET() {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const companyId = user.companyId

  // 1. Compute fresh stats and write to companies table
  const { paceScore, estimatedDaysToIpo, progressPercentage, currentPhase } =
    await computeAndUpdateCompanyStats(companyId)

  // 2. Record today's snapshot if none exists yet
  const todayCount = await sql`
    SELECT COUNT(*) AS count
    FROM pace_score_history
    WHERE company_id = ${companyId}
      AND DATE_TRUNC('day', recorded_at) = DATE_TRUNC('day', NOW())
  ` as SnapshotCountRow[]

  if (parseInt(todayCount[0]?.count ?? '0', 10) === 0) {
    await sql`
      INSERT INTO pace_score_history (company_id, pace_score, progress_percentage, recorded_at)
      VALUES (${companyId}, ${paceScore}, ${progressPercentage}, NOW())
    `
  }

  // 3. Fetch last 8 weekly snapshots (most recent per week)
  const historyRows = await sql`
    SELECT
      TO_CHAR(DATE_TRUNC('week', recorded_at), 'YYYY-WW') AS week,
      MAX(pace_score) AS score
    FROM pace_score_history
    WHERE company_id = ${companyId}
    GROUP BY DATE_TRUNC('week', recorded_at)
    ORDER BY DATE_TRUNC('week', recorded_at) ASC
    LIMIT 8
  ` as HistoryRow[]

  // Re-label weeks as W1…W8
  const trend = historyRows.map((row, i) => ({
    week: `W${i + 1}`,
    score: parseInt(row.score, 10),
  }))

  // 4. paceDelta — current vs previous week snapshot
  let paceDelta = 0
  if (trend.length >= 2) {
    paceDelta = trend[trend.length - 1].score - trend[trend.length - 2].score
  }

  // 5. Per-phase task stats
  const phaseRows = await sql`
    SELECT
      phase,
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE status = 'completed') AS completed,
      COUNT(*) FILTER (WHERE status = 'in_progress') AS in_progress
    FROM tasks
    WHERE company_id = ${companyId}
    GROUP BY phase
  ` as PhaseTaskRow[]

  // Build a map for easy lookup
  const phaseMap: Record<string, { total: number; completed: number; inProgress: number }> = {}
  for (const row of phaseRows) {
    phaseMap[row.phase] = {
      total: parseInt(row.total, 10),
      completed: parseInt(row.completed, 10),
      inProgress: parseInt(row.in_progress, 10),
    }
  }

  // Max weight for bar normalisation (corporate_restructuring = 20)
  const maxWeight = 20

  const phases = PHASE_ORDER.map(id => {
    const data = phaseMap[id] ?? { total: 0, completed: 0, inProgress: 0 }
    const weight = PHASE_WEIGHTS[id] ?? 0
    // contribution = how many PACE points this phase contributes
    const contribution = data.total > 0
      ? Math.round(weight * (data.completed / data.total))
      : 0

    let status: 'complete' | 'in_progress' | 'not_started'
    if (data.total > 0 && data.completed === data.total) {
      status = 'complete'
    } else if (data.inProgress > 0 || data.completed > 0) {
      status = 'in_progress'
    } else {
      status = 'not_started'
    }

    return {
      id,
      label: PHASE_LABELS[id] ?? id,
      total: data.total,
      completed: data.completed,
      inProgress: data.inProgress,
      // weight as fraction for UI bar scaling (normalised to maxWeight=20)
      weight: weight / 100,
      // max weight fraction used for bar scale denominator
      maxWeightFraction: maxWeight / 100,
      contribution,
      status,
    }
  })

  // 6. Peer percentile (placeholder formula until real peer data)
  const peerPercentile = Math.min(95, Math.round(paceScore * 0.95))

  return NextResponse.json({
    paceScore,
    paceDelta,
    daysToIpo: estimatedDaysToIpo,
    progressPercentage,
    currentPhase,
    peerPercentile,
    trend,
    phases,
  })
}
