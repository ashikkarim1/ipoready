import { sql } from '@/lib/db'
import { calculatePeerPercentile, calculatePredictiveScore, type PredictiveScore } from './pace-predictor'
import { validateMilestoneSequence, type SequencingViolation } from './ipo-sequencing'

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

const EXCHANGE_FLOORS: Record<string, number> = {
  tsxv: 180,
  cse: 120,
  tsx: 365,
  nasdaq: 365,
  nyse: 400,
  otc: 90,
  cboe: 300,
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

interface PhaseRow {
  phase: string
  total: string
  completed: string
}

interface TaskStatsRow {
  total_tasks: string
  completed_tasks: string
  remaining_days: string
}

export interface EnhancedPaceResult {
  paceScore: number
  adjustedPaceScore: number
  peerPercentile: number
  peerPercentileLabel: string
  estimatedDaysToIpo: number
  predictedDaysToIpo: number
  progressPercentage: number
  currentPhase: string
  targetExchange: string
  benchmarkComparison: {
    avgPace: number
    medianPace: number
    p90Pace: number
  }
  sequencingAlerts: SequencingViolation[]
  riskFactors: string[]
  predictiveFactors: {
    confidence: 'Low' | 'Medium' | 'High'
    cashRunwayMonths?: number
    teamSize?: number
    cfoHired?: boolean
    boardSize?: number
    auditorSelected?: boolean
    investorSophisticationScore?: number
  }
}

export async function computeAndUpdateCompanyStats(companyId: string): Promise<EnhancedPaceResult> {
  // Get company details
  const companyRows = await sql`
    SELECT 
      target_exchange,
      cash_runway_months,
      team_size,
      cfo_hired_at,
      board_size,
      auditor_selected,
      investor_sophistication_score
    FROM companies 
    WHERE id = ${companyId} 
    LIMIT 1
  `
  const company = companyRows[0] as {
    target_exchange: string
    cash_runway_months?: number
    team_size?: number
    cfo_hired_at?: string
    board_size?: number
    auditor_selected?: boolean
    investor_sophistication_score?: number
  }
  const targetExchange: string = company?.target_exchange ?? 'tsx'

  // Phase breakdown for PACE score
  const phaseRows = await sql`
    SELECT
      phase,
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE status = 'completed') AS completed
    FROM tasks
    WHERE company_id = ${companyId}
    GROUP BY phase
  ` as PhaseRow[]

  // Task totals and remaining days
  const statsRows = await sql`
    SELECT
      COUNT(*) AS total_tasks,
      COUNT(*) FILTER (WHERE status = 'completed') AS completed_tasks,
      COALESCE(SUM(estimated_days) FILTER (WHERE status != 'completed'), 0) AS remaining_days
    FROM tasks
    WHERE company_id = ${companyId}
  ` as TaskStatsRow[]

  const stats = statsRows[0]
  const totalTasks = parseInt(stats?.total_tasks ?? '0', 10)
  const completedTasks = parseInt(stats?.completed_tasks ?? '0', 10)
  const remainingDays = parseInt(stats?.remaining_days ?? '0', 10)

  // Base PACE score (task-based)
  let basePaceScore = 0
  if (phaseRows.length > 0) {
    let weightedSum = 0
    for (const row of phaseRows) {
      const weight = PHASE_WEIGHTS[row.phase] ?? 0
      const total = parseInt(row.total, 10)
      const completed = parseInt(row.completed, 10)
      if (total > 0) {
        weightedSum += weight * (completed / total)
      }
    }
    basePaceScore = Math.round(weightedSum)
  }

  // Calculate predictive score with multiple factors
  const predictiveResult = await calculatePredictiveScore(
    companyId,
    basePaceScore,
    {
      cashRunwayMonths: company?.cash_runway_months ?? null,
      teamSize: company?.team_size ?? null,
      cfoHired: company?.cfo_hired_at ? true : false,
      boardSize: company?.board_size ?? null,
      auditorSelected: company?.auditor_selected ?? false,
      investorSophisticationScore: company?.investor_sophistication_score ?? null,
      preIpoFunding: null,
    },
    remainingDays
  )

  // Determine current phase (phase with most in-progress tasks)
  let currentPhaseId = 1
  if (phaseRows.length > 0) {
    // Sort by phase number (assuming phase is a number like 1, 2, 3, etc.)
    const sortedPhases = phaseRows.sort((a, b) => {
      const phaseA = parseInt(a.phase, 10)
      const phaseB = parseInt(b.phase, 10)
      return phaseA - phaseB
    })
    // Get the first phase with incomplete tasks, or the last phase if all are complete
    const incompletePhase = sortedPhases.find((row) => {
      const total = parseInt(row.total, 10)
      const completed = parseInt(row.completed, 10)
      return completed < total
    })
    if (incompletePhase) {
      currentPhaseId = parseInt(incompletePhase.phase, 10)
    } else if (sortedPhases.length > 0) {
      currentPhaseId = parseInt(sortedPhases[sortedPhases.length - 1].phase, 10)
    }
  }

  // Get peer percentile for benchmark comparison
  const peerResult = await calculatePeerPercentile(
    companyId,
    targetExchange.toUpperCase(),
    currentPhaseId,
    predictiveResult.adjustedPace
  )

  // Get milestone sequencing violations
  const tasksWithDates = await sql`
    SELECT 
      phase,
      MAX(CASE WHEN status = 'completed' THEN completed_at END) AS completed_at
    FROM tasks
    WHERE company_id = ${companyId}
    GROUP BY phase
  `
  
  // Build task name to completion date map
  const taskCompletionMap = new Map<string, Date | null>()
  // This will be populated by phase completion dates in real implementation
  
  const sequencingViolations = validateMilestoneSequence(taskCompletionMap, targetExchange as any)

  // Estimated days to listing
  const exchangeFloor = EXCHANGE_FLOORS[targetExchange.toLowerCase()] ?? 180
  const estimatedDaysToIpo = Math.max(remainingDays, exchangeFloor)

  // Progress percentage
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Current phase
  const incompletePhases = phaseRows
    .filter(row => parseInt(row.total, 10) > parseInt(row.completed, 10))
    .map(row => row.phase)
    .sort((a, b) => PHASE_ORDER.indexOf(a) - PHASE_ORDER.indexOf(b))

  const currentPhase = incompletePhases.length > 0 ? incompletePhases[0] : 'post_listing'

  // Update company record with enhanced metrics
  await sql`
    UPDATE companies
    SET
      pace_score = ${basePaceScore},
      adjusted_pace_score = ${predictiveResult.adjustedPace},
      predicted_days_to_ipo = ${predictiveResult.predictedDaysToIpo},
      peer_percentile = ${peerResult.percentile},
      estimated_days_to_ipo = ${estimatedDaysToIpo},
      progress_percentage = ${progressPercentage},
      current_phase = ${currentPhase}
    WHERE id = ${companyId}
  `

  return {
    paceScore: basePaceScore,
    adjustedPaceScore: predictiveResult.adjustedPace,
    peerPercentile: peerResult.percentile,
    peerPercentileLabel: peerResult.percentileLabel,
    estimatedDaysToIpo,
    predictedDaysToIpo: predictiveResult.predictedDaysToIpo,
    progressPercentage,
    currentPhase,
    targetExchange,
    benchmarkComparison: peerResult.benchmarkComparison,
    sequencingAlerts: sequencingViolations,
    riskFactors: predictiveResult.riskFactors,
    predictiveFactors: {
      confidence: predictiveResult.confidenceLevel,
      cashRunwayMonths: company?.cash_runway_months,
      teamSize: company?.team_size,
      cfoHired: company?.cfo_hired_at ? true : false,
      boardSize: company?.board_size,
      auditorSelected: company?.auditor_selected,
      investorSophisticationScore: company?.investor_sophistication_score,
    },
  }
}
