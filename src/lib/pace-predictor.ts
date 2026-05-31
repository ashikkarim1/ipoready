/**
 * PACE Predictive Scoring Model
 * Incorporates cash runway, team readiness, market conditions, and investor sophistication
 * into the base PACE score for more accurate IPO timeline predictions
 */

import { sql } from '@/lib/db'

interface CompanyFactors {
  id: string
  pace_score: number
  cash_runway_months?: number | null
  team_size?: number | null
  board_size?: number | null
  cfo_hired_at?: string | null
  auditor_selected?: boolean | null
  investor_sophistication_score?: number | null
  target_exchange: string
}

interface PredictiveScore {
  adjustedPaceScore: number // 0-100
  baseScore: number // Original PACE score
  adjustment: number // Net adjustment applied
  confidenceLevel: 'low' | 'medium' | 'high' // Based on data completeness
  riskFactors: string[]
  scoreBreakdown: {
    baseWeight: number
    cashRunwayWeight: number
    teamReadinessWeight: number
    marketConditionWeight: number
    investorSophisticationWeight: number
  }
  estimatedDaysToIpoAdjusted: number
}

/**
 * Calculate predictive PACE score based on multiple factors
 */
export async function calculatePredictiveScore(companyId: string): Promise<PredictiveScore> {
  // Fetch company factors
  const company = (await sql`
    SELECT
      id, pace_score, cash_runway_months, team_size, board_size, cfo_hired_at,
      auditor_selected, investor_sophistication_score, target_exchange, estimated_days_to_ipo
    FROM companies
    WHERE id = ${companyId}
    LIMIT 1
  `)[0] as (CompanyFactors & { estimated_days_to_ipo: number }) | undefined

  if (!company) {
    throw new Error(`Company not found: ${companyId}`)
  }

  const baseScore = company.pace_score ?? 0
  let adjustmentPoints = 0
  const riskFactors: string[] = []
  let dataCompleteCount = 1 // Base score always available

  // ============================================================
  // 1. CASH RUNWAY (20% weight)
  // ============================================================
  let cashRunwayScore = 50 // Default neutral (0-100)
  if (company.cash_runway_months !== null && company.cash_runway_months !== undefined) {
    dataCompleteCount++
    const months = company.cash_runway_months

    if (months >= 18) {
      cashRunwayScore = 100 // Plenty of time
    } else if (months >= 12) {
      cashRunwayScore = 90 // Comfortable
    } else if (months >= 9) {
      cashRunwayScore = 75 // Moderate urgency
    } else if (months >= 6) {
      cashRunwayScore = 60 // High urgency
    } else if (months >= 3) {
      cashRunwayScore = 40 // Critical urgency
      riskFactors.push('Low cash runway (< 3 months) - IPO timing critical')
    } else {
      cashRunwayScore = 20 // Crisis mode
      riskFactors.push('Critically low cash runway - must IPO soon')
    }
  } else {
    riskFactors.push('Cash runway not provided - using default estimate')
  }

  const cashRunwayAdjustment = (cashRunwayScore - 50) * 0.2

  // ============================================================
  // 2. TEAM READINESS (20% weight)
  // ============================================================
  let teamReadinessScore = 50 // Default neutral
  const teamFactors: string[] = []

  if (company.cfo_hired_at !== null && company.cfo_hired_at !== undefined) {
    dataCompleteCount++
    teamFactors.push('CFO hired')
    teamReadinessScore += 20
  }

  if (company.board_size !== null && company.board_size !== undefined) {
    dataCompleteCount++
    if (company.board_size >= 5) {
      teamFactors.push('Full board assembled')
      teamReadinessScore += 15
    } else if (company.board_size >= 3) {
      teamFactors.push('Partial board')
      teamReadinessScore += 8
    } else {
      riskFactors.push('Board not yet assembled')
    }
  }

  if (company.auditor_selected !== null && company.auditor_selected !== undefined) {
    dataCompleteCount++
    if (company.auditor_selected) {
      teamFactors.push('Auditor selected')
      teamReadinessScore += 15
    } else {
      riskFactors.push('Auditor not yet selected')
    }
  }

  if (company.team_size !== null && company.team_size !== undefined) {
    dataCompleteCount++
    if (company.team_size >= 30) {
      teamFactors.push('Adequate team size')
      teamReadinessScore += 10
    } else if (company.team_size < 10) {
      riskFactors.push('Small team size may slow IPO execution')
      teamReadinessScore -= 10
    }
  }

  teamReadinessScore = Math.min(100, Math.max(0, teamReadinessScore))
  const teamReadinessAdjustment = (teamReadinessScore - 50) * 0.2

  // ============================================================
  // 3. MARKET CONDITIONS (10% weight)
  // Currently hardcoded; in production, would call external API (Macroeconomic data)
  // ============================================================
  let marketConditionScore = 50 // Neutral baseline
  // In a real implementation, you'd:
  // - Call a market data API (e.g., for VIX, market sentiment)
  // - Adjust based on recent IPO activity, market volatility
  // For now, we'll assume neutral market conditions
  const marketConditionAdjustment = (marketConditionScore - 50) * 0.1

  // ============================================================
  // 4. INVESTOR SOPHISTICATION (10% weight)
  // ============================================================
  let investorSophisticationScore = 50 // Default neutral
  if (company.investor_sophistication_score !== null && company.investor_sophistication_score !== undefined) {
    dataCompleteCount++
    // Score is 1-10, normalize to 0-100
    investorSophisticationScore = (company.investor_sophistication_score / 10) * 100
  }
  const investorSophisticationAdjustment = (investorSophisticationScore - 50) * 0.1

  // ============================================================
  // Calculate final adjusted score
  // ============================================================
  const totalAdjustment = cashRunwayAdjustment + teamReadinessAdjustment + marketConditionAdjustment + investorSophisticationAdjustment
  const adjustedPaceScore = Math.round(Math.max(0, Math.min(100, baseScore + totalAdjustment)))

  // Determine confidence level based on data completeness
  const dataCompletenessRatio = dataCompleteCount / 6 // 6 potential data points
  let confidenceLevel: 'low' | 'medium' | 'high'
  if (dataCompletenessRatio >= 0.67) {
    confidenceLevel = 'high'
  } else if (dataCompletenessRatio >= 0.5) {
    confidenceLevel = 'medium'
  } else {
    confidenceLevel = 'low'
  }

  // Adjust estimated days based on confidence and adjustment
  const adjustedDaysToIpo = Math.max(
    90,
    Math.round(company.estimated_days_to_ipo * (1 + (totalAdjustment / 100) * 0.5))
  )

  return {
    adjustedPaceScore,
    baseScore,
    adjustment: totalAdjustment,
    confidenceLevel,
    riskFactors,
    scoreBreakdown: {
      baseWeight: 0.4,
      cashRunwayWeight: 0.2,
      teamReadinessWeight: 0.2,
      marketConditionWeight: 0.1,
      investorSophisticationWeight: 0.1,
    },
    estimatedDaysToIpoAdjusted: adjustedDaysToIpo,
  }
}

/**
 * Update company's predictive factors (admin API)
 */
export async function updateCompanyFactors(
  companyId: string,
  factors: {
    cash_runway_months?: number
    team_size?: number
    board_size?: number
    cfo_hired_at?: string
    auditor_selected?: boolean
    investor_sophistication_score?: number
  }
) {
  if (factors.cash_runway_months !== undefined) {
    await sql`
      UPDATE companies
      SET cash_runway_months = ${factors.cash_runway_months}
      WHERE id = ${companyId}
    `
  }
  if (factors.team_size !== undefined) {
    await sql`
      UPDATE companies
      SET team_size = ${factors.team_size}
      WHERE id = ${companyId}
    `
  }
  if (factors.board_size !== undefined) {
    await sql`
      UPDATE companies
      SET board_size = ${factors.board_size}
      WHERE id = ${companyId}
    `
  }
  if (factors.cfo_hired_at !== undefined) {
    await sql`
      UPDATE companies
      SET cfo_hired_at = ${factors.cfo_hired_at}
      WHERE id = ${companyId}
    `
  }
  if (factors.auditor_selected !== undefined) {
    await sql`
      UPDATE companies
      SET auditor_selected = ${factors.auditor_selected}
      WHERE id = ${companyId}
    `
  }
  if (factors.investor_sophistication_score !== undefined) {
    await sql`
      UPDATE companies
      SET investor_sophistication_score = ${factors.investor_sophistication_score}
      WHERE id = ${companyId}
    `
  }
}

/**
 * Get readiness factors summary for UI display
 */
export async function getReadinessFactors(companyId: string) {
  const company = (await sql`
    SELECT
      cash_runway_months, team_size, board_size, cfo_hired_at,
      auditor_selected, investor_sophistication_score
    FROM companies
    WHERE id = ${companyId}
    LIMIT 1
  `)[0] as {
    cash_runway_months?: number | null
    team_size?: number | null
    board_size?: number | null
    cfo_hired_at?: string | null
    auditor_selected?: boolean | null
    investor_sophistication_score?: number | null
  } | undefined

  if (!company) return null

  const factors = {
    cashRunway: company.cash_runway_months
      ? {
          months: company.cash_runway_months,
          status: company.cash_runway_months >= 12 ? 'healthy' : company.cash_runway_months >= 6 ? 'warning' : 'critical',
        }
      : null,
    team: {
      size: company.team_size ?? 0,
      cfoHired: !!company.cfo_hired_at,
      boardSize: company.board_size ?? 0,
      auditorSelected: !!company.auditor_selected,
    },
    investorSophistication: company.investor_sophistication_score ? company.investor_sophistication_score + '/10' : null,
  }

  return factors
}
