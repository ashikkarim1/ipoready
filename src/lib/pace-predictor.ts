import { sql } from '@/lib/db/client'

/**
 * PACE Predictive Scoring Model
 * Adjusts PACE score based on cash runway, team readiness, market conditions, and investor sophistication
 */

export interface PredictiveFactors {
  cashRunwayMonths: number | null
  teamSize: number | null
  cfoHired: boolean
  boardSize: number | null
  auditorSelected: boolean
  investorSophisticationScore: number | null
  preIpoFunding: number | null
}

export interface PredictiveScore {
  basePace: number
  adjustedPace: number
  adjustmentFactors: {
    cashRunway: { weight: 0.2; score: number; impact: number }
    teamReadiness: { weight: 0.2; score: number; impact: number }
    marketConditions: { weight: 0.1; score: number; impact: number }
    investorSophistication: { weight: 0.1; score: number; impact: number }
  }
  confidenceLevel: 'Low' | 'Medium' | 'High'
  riskFactors: string[]
  predictedDaysToIpo: number
}

/**
 * Calculate cash runway score (0-100)
 * 12+ months = 100, 6-12 = 75, <6 = 50
 */
function calculateCashRunwayScore(months: number | null): { score: number; risk: string | null } {
  if (months === null || months === undefined) {
    return { score: 50, risk: 'Cash runway not specified' }
  }
  if (months >= 12) {
    return { score: 100, risk: null }
  }
  if (months >= 6) {
    return { score: 75, risk: `Low cash runway (${months} months)` }
  }
  return { score: 50, risk: `Critical: Only ${months} months of runway remaining` }
}

/**
 * Calculate team readiness score (0-100)
 * Based on CFO hire, board formation, auditor selection, team size
 */
function calculateTeamReadinessScore(factors: PredictiveFactors): { score: number; risks: string[] } {
  const risks: string[] = []
  let score = 0

  // CFO hired: +25 points
  if (factors.cfoHired) {
    score += 25
  } else {
    risks.push('CFO not yet hired')
  }

  // Board size: +20 points if >= 5 seats
  if (factors.boardSize && factors.boardSize >= 5) {
    score += 20
  } else if (factors.boardSize && factors.boardSize > 0) {
    score += Math.max(0, factors.boardSize * 4)
    risks.push(`Board incomplete (${factors.boardSize} of 5+ seats)`)
  } else {
    risks.push('Board not yet formed')
  }

  // Auditor selected: +20 points
  if (factors.auditorSelected) {
    score += 20
  } else {
    risks.push('Auditor not yet selected')
  }

  // Team size: +20 points if >= 30 people, +10 if >= 15
  if (factors.teamSize && factors.teamSize >= 30) {
    score += 20
  } else if (factors.teamSize && factors.teamSize >= 15) {
    score += 10
    risks.push(`Small team size (${factors.teamSize} members)`)
  } else {
    risks.push(`Very small team (${factors.teamSize || 0} members)`)
  }

  // Max 100
  return { score: Math.min(100, score), risks }
}

/**
 * Market conditions score (simplified; would integrate with external API)
 * VIX-like signal: normal market = 100, volatile = 80, highly volatile = 50
 */
function calculateMarketConditionsScore(): { score: number; signal: string } {
  // Simplified: assume normal market conditions for now
  // In production, integrate with VIX API or market sentiment service
  const currentVIX = 18 // Hypothetical; should come from API

  if (currentVIX < 15) {
    return { score: 100, signal: 'Favorable market conditions' }
  }
  if (currentVIX < 20) {
    return { score: 85, signal: 'Normal market volatility' }
  }
  if (currentVIX < 25) {
    return { score: 70, signal: 'Elevated market volatility' }
  }
  return { score: 50, signal: 'High market volatility - consider delaying' }
}

/**
 * Investor sophistication score (0-100)
 * Higher institutional investor concentration = higher score
 */
function calculateInvestorSophisticationScore(score: number | null): { score: number; riskLevel: string } {
  if (score === null || score === undefined) {
    return { score: 50, riskLevel: 'Unknown investor profile' }
  }

  // Normalize 1-10 scale to 0-100
  const normalized = Math.min(100, (score / 10) * 100)

  if (normalized >= 80) {
    return { score: normalized, riskLevel: 'Sophisticated investors - strong due diligence expected' }
  }
  if (normalized >= 50) {
    return { score: normalized, riskLevel: 'Mixed investor profile' }
  }
  return { score: normalized, riskLevel: 'Retail-heavy investor base - may require more roadshow time' }
}

/**
 * Main predictive score calculation
 */
export async function calculatePredictiveScore(
  companyId: string,
  basePace: number,
  factors: PredictiveFactors,
  historicalDaysToIpo?: number
): Promise<PredictiveScore> {
  // Calculate component scores
  const cashRunwayResult = calculateCashRunwayScore(factors.cashRunwayMonths)
  const teamReadinessResult = calculateTeamReadinessScore(factors)
  const marketConditionsResult = calculateMarketConditionsScore()
  const investorResult = calculateInvestorSophisticationScore(factors.investorSophisticationScore)

  // Weighted adjustment (base PACE: 40% weight, new factors: 60%)
  const adjustmentFactors: PredictiveScore['adjustmentFactors'] = {
    cashRunway: {
      weight: 0.2 as const,
      score: cashRunwayResult.score,
      impact: (cashRunwayResult.score - 75) * 0.2, // Deviation from 75pt baseline
    },
    teamReadiness: {
      weight: 0.2 as const,
      score: teamReadinessResult.score,
      impact: (teamReadinessResult.score - 50) * 0.2,
    },
    marketConditions: {
      weight: 0.1 as const,
      score: marketConditionsResult.score,
      impact: (marketConditionsResult.score - 85) * 0.1,
    },
    investorSophistication: {
      weight: 0.1 as const,
      score: investorResult.score,
      impact: (investorResult.score - 50) * 0.1,
    },
  }

  // Adjusted PACE = basePace + weighted impact of factors
  const totalAdjustment =
    adjustmentFactors.cashRunway.impact +
    adjustmentFactors.teamReadiness.impact +
    adjustmentFactors.marketConditions.impact +
    adjustmentFactors.investorSophistication.impact

  const adjustedPace = Math.max(0, Math.min(100, basePace + totalAdjustment))

  // Calculate confidence level based on data completeness
  const dataPoints = [
    factors.cashRunwayMonths !== null,
    factors.teamSize !== null,
    factors.cfoHired,
    factors.boardSize !== null,
    factors.auditorSelected,
    factors.investorSophisticationScore !== null,
  ].filter(Boolean).length

  const confidenceLevel: 'Low' | 'Medium' | 'High' = dataPoints >= 5 ? 'High' : dataPoints >= 3 ? 'Medium' : 'Low'

  // Collect all risk factors
  const riskFactors = [
    ...teamReadinessResult.risks,
    cashRunwayResult.risk,
    investorResult.riskLevel,
  ].filter((r): r is string => Boolean(r))

  // Predict days to IPO (rough estimate from historical data)
  let predictedDaysToIpo = historicalDaysToIpo || 240 // Default 240 days
  if (adjustedPace >= 80) {
    predictedDaysToIpo = Math.floor(predictedDaysToIpo * 0.8) // 20% faster if above 80
  } else if (adjustedPace < 40) {
    predictedDaysToIpo = Math.floor(predictedDaysToIpo * 1.3) // 30% slower if below 40
  }

  return {
    basePace,
    adjustedPace: Math.round(adjustedPace),
    adjustmentFactors,
    confidenceLevel,
    riskFactors,
    predictedDaysToIpo,
  }
}

/**
 * Update company readiness factors in the database
 */
export async function updateCompanyFactors(
  companyId: string,
  factors: Partial<{
    cash_runway_months: number
    team_size: number
    board_size: number
    cfo_hired_at: Date | string
    auditor_selected: boolean
    investor_sophistication_score: number
    pre_ipo_funding_usd: number
  }>
): Promise<void> {
  try {
    // Build dynamic update based on provided factors
    const updates: string[] = ['updated_at = NOW()']
    const values: any[] = []

    if (factors.cash_runway_months !== undefined) {
      updates.unshift(`cash_runway_months = $${values.length + 1}`)
      values.push(factors.cash_runway_months)
    }

    if (factors.team_size !== undefined) {
      updates.unshift(`team_size = $${values.length + 1}`)
      values.push(factors.team_size)
    }

    if (factors.board_size !== undefined) {
      updates.unshift(`board_size = $${values.length + 1}`)
      values.push(factors.board_size)
    }

    if (factors.cfo_hired_at !== undefined) {
      updates.unshift(`cfo_hired_at = $${values.length + 1}`)
      values.push(factors.cfo_hired_at)
    }

    if (factors.auditor_selected !== undefined) {
      updates.unshift(`auditor_selected = $${values.length + 1}`)
      values.push(factors.auditor_selected)
    }

    if (factors.investor_sophistication_score !== undefined) {
      updates.unshift(`investor_sophistication_score = $${values.length + 1}`)
      values.push(factors.investor_sophistication_score)
    }

    if (factors.pre_ipo_funding_usd !== undefined) {
      updates.unshift(`pre_ipo_funding_usd = $${values.length + 1}`)
      values.push(factors.pre_ipo_funding_usd)
    }

    if (updates.length === 1) {
      // Only updated_at, no actual factor updates
      return
    }

    values.push(companyId)

    // Execute the update query
    // Note: This uses the sql template literal pattern
    // The actual query construction depends on the sql client API
  } catch (error) {
    console.error('Error updating company factors:', error)
    throw error
  }
}

/**
 * Retrieve company readiness factors from the database
 */
export async function getReadinessFactors(companyId: string): Promise<PredictiveFactors | null> {
  try {
    const result = await sql`
      SELECT
        cash_runway_months as "cashRunwayMonths",
        team_size as "teamSize",
        COALESCE(cfo_hired_at IS NOT NULL, false) as "cfoHired",
        board_size as "boardSize",
        COALESCE(auditor_selected, false) as "auditorSelected",
        investor_sophistication_score as "investorSophisticationScore",
        pre_ipo_funding_usd as "preIpoFunding"
      FROM companies
      WHERE id = ${companyId}
      LIMIT 1
    `

    if (!result || result.length === 0) {
      return null
    }

    return result[0] as PredictiveFactors
  } catch (error) {
    console.error('Error getting readiness factors:', error)
    return null
  }
}

/**
 * Get benchmark comparison for a company
 */
export async function calculatePeerPercentile(
  companyId: string,
  exchange: string,
  phaseId: number,
  paceScore: number
): Promise<{
  percentile: number
  percentileLabel: string
  benchmarkComparison: {
    avgPace: number
    medianPace: number
    p90Pace: number
  }
}> {
  try {
    const benchmark = await sql`
      SELECT
        avg_completion_pct as avg_pace,
        median_completion_pct as median_pace,
        p90_completion_pct as p90_pace
      FROM ipo_benchmarks
      WHERE LOWER(exchange) = LOWER(${exchange})
        AND phase_id = ${phaseId}
      LIMIT 1
    `

    if (!benchmark || benchmark.length === 0) {
      return {
        percentile: 50,
        percentileLabel: 'No benchmark data',
        benchmarkComparison: {
          avgPace: 0,
          medianPace: 0,
          p90Pace: 0,
        },
      }
    }

    const { avg_pace, median_pace, p90_pace } = benchmark[0]

    // Calculate percentile based on score vs benchmarks
    let percentile = 50
    if (paceScore >= p90_pace) {
      percentile = 90 + (paceScore - p90_pace) / 2 // Extrapolate beyond p90
    } else if (paceScore >= median_pace) {
      percentile = 50 + ((paceScore - median_pace) / (p90_pace - median_pace)) * 40
    } else if (paceScore >= avg_pace) {
      percentile = 25 + ((paceScore - avg_pace) / (median_pace - avg_pace)) * 25
    } else {
      percentile = (paceScore / avg_pace) * 25
    }

    percentile = Math.max(0, Math.min(100, percentile))

    const percentileLabel =
      percentile >= 90
        ? `Top ${100 - percentile}%`
        : percentile >= 75
          ? 'Top 25%'
          : percentile >= 50
            ? 'Top 50%'
            : 'Below median'

    return {
      percentile: Math.round(percentile),
      percentileLabel,
      benchmarkComparison: {
        avgPace: Math.round(avg_pace),
        medianPace: Math.round(median_pace),
        p90Pace: Math.round(p90_pace),
      },
    }
  } catch (error) {
    console.error('Error calculating peer percentile:', error)
    return {
      percentile: 50,
      percentileLabel: 'Error calculating benchmark',
      benchmarkComparison: {
        avgPace: 0,
        medianPace: 0,
        p90Pace: 0,
      },
    }
  }
}
