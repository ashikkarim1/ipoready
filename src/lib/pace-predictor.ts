/**
 * PACE Predictive Scoring Model (Enhanced)
 * 
 * Incorporates cash runway, team readiness, market conditions, and investor sophistication
 * into the base PACE score for more accurate IPO timeline predictions.
 * 
 * Scoring Formula:
 * Adjusted PACE = (basePace × 0.40) + (cashScore × 0.20) + (teamScore × 0.20) 
 *                  + (marketScore × 0.10) + (investorScore × 0.10)
 */

import { sql } from '@/lib/db'

export interface PredictiveScore {
  adjustedPaceScore: number // 0-100, adjusted from base PACE
  baseScore: number // Original PACE score
  adjustment: number // Net adjustment applied (-/+ points)
  confidenceLevel: 'low' | 'medium' | 'high'
  riskFactors: string[]
  opportunityFactors: string[]
  breakdown: {
    basePace: number // 40% weight — existing task completion
    cashRunwayScore: number // 20% weight
    teamReadinessScore: number // 20% weight
    marketConditionScore: number // 10% weight
    investorSophisticationScore: number // 10% weight
  }
  estimatedDaysToIpoAdjusted: number
}

interface CompanyFactors {
  id: string
  pace_score: number
  estimated_days_to_ipo: number
  cash_runway_months?: number | null
  team_size?: number | null
  board_size?: number | null
  cfo_hired_at?: string | null
  auditor_selected?: boolean | null
  investor_sophistication_score?: number | null
  target_exchange: string
}

/**
 * Calculate predictive PACE score based on multiple factors
 * 
 * @param companyId - The company's unique identifier
 * @returns PredictiveScore with adjusted score, breakdown, and risk factors
 */
export async function calculatePredictiveScore(companyId: string): Promise<PredictiveScore> {
  // Fetch company factors
  const company = (await sql`
    SELECT
      id, pace_score, cash_runway_months, team_size, board_size, cfo_hired_at,
      auditor_selected, investor_sophistication_score, target_exchange, 
      estimated_days_to_ipo
    FROM companies
    WHERE id = ${companyId}
    LIMIT 1
  `)[0] as (CompanyFactors | undefined)

  if (!company) {
    throw new Error(`Company not found: ${companyId}`)
  }

  const baseScore = company.pace_score ?? 0
  const riskFactors: string[] = []
  const opportunityFactors: string[] = []
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
      opportunityFactors.push('Healthy cash runway (18+ months) provides timeline flexibility')
    } else if (months >= 12) {
      cashRunwayScore = 90 // Comfortable
      opportunityFactors.push('Good cash runway (12-18 months) supports IPO timeline')
    } else if (months >= 9) {
      cashRunwayScore = 75 // Moderate urgency
    } else if (months >= 6) {
      cashRunwayScore = 60 // High urgency
      riskFactors.push('Cash runway 6-9 months — IPO execution must stay on schedule')
    } else if (months >= 3) {
      cashRunwayScore = 40 // Critical urgency
      riskFactors.push('Low cash runway (3-6 months) — accelerated execution required')
    } else {
      cashRunwayScore = 20 // Crisis mode
      riskFactors.push('Critically low cash runway (< 3 months) — must IPO immediately or seek bridge financing')
    }
  } else {
    riskFactors.push('Cash runway not provided — confidence in score reduced')
  }

  // ============================================================
  // 2. TEAM READINESS (20% weight)
  // ============================================================
  let teamReadinessScore = 50 // Default neutral
  const teamFactors: string[] = []

  if (company.cfo_hired_at !== null && company.cfo_hired_at !== undefined) {
    dataCompleteCount++
    teamFactors.push('CFO hired')
    teamReadinessScore += 20
    opportunityFactors.push('CFO in place to lead financial reporting and investor relations')
  } else {
    riskFactors.push('No CFO hired yet — essential for financial credibility')
  }

  if (company.board_size !== null && company.board_size !== undefined) {
    dataCompleteCount++
    if (company.board_size >= 5) {
      teamFactors.push('Full board assembled (5+ seats)')
      teamReadinessScore += 15
      opportunityFactors.push('Mature board composition supports governance requirements')
    } else if (company.board_size >= 3) {
      teamFactors.push(`Partial board (${company.board_size} seats)`)
      teamReadinessScore += 8
      riskFactors.push(`Board incomplete (${company.board_size} seats) — auditors/regulators may require expansion`)
    } else {
      riskFactors.push('Board not yet assembled — priority task for pre-IPO governance')
    }
  }

  if (company.auditor_selected !== null && company.auditor_selected !== undefined) {
    dataCompleteCount++
    if (company.auditor_selected) {
      teamFactors.push('Auditor selected')
      teamReadinessScore += 15
      opportunityFactors.push('PCAOB/CPAB-registered auditor enables financial audit process')
    } else {
      riskFactors.push('Auditor not yet selected — must engage before Financial Audit phase')
    }
  }

  if (company.team_size !== null && company.team_size !== undefined) {
    dataCompleteCount++
    if (company.team_size >= 50) {
      teamReadinessScore += 10
      opportunityFactors.push('Large team (50+) can support parallel IPO workstreams')
    } else if (company.team_size >= 30) {
      teamReadinessScore += 8
    } else if (company.team_size >= 10) {
      teamReadinessScore += 3
    } else if (company.team_size < 5) {
      riskFactors.push('Very small team (<5) will struggle with IPO parallel processing — consider hiring')
      teamReadinessScore -= 10
    } else {
      riskFactors.push('Small team (5-9) may need external resources to accelerate IPO execution')
      teamReadinessScore -= 5
    }
  }

  teamReadinessScore = Math.min(100, Math.max(0, teamReadinessScore))

  // ============================================================
  // 3. MARKET CONDITIONS (10% weight)
  // ============================================================
  // In production, integrate real market data (VIX, IPO sentiment, sector performance)
  let marketConditionScore = 50 // Neutral baseline
  
  // Placeholder: assumes neutral market conditions
  // In a real implementation, you would:
  // - Call market data API (e.g., Alpha Vantage for VIX, PitchBook for IPO sentiment)
  // - Adjust based on sector-specific trends (e.g., biotech, fintech IPO appetite)
  // - Consider broader macro factors (rate environment, Fed sentiment)
  
  // Example adjustments (commented out until live integration):
  // if (vix > 25) marketConditionScore -= 10  // High volatility
  // if (ipoVolume > historicalAvg) marketConditionScore += 5  // Hot market
  
  // For now, remain neutral unless external data is available

  // ============================================================
  // 4. INVESTOR SOPHISTICATION (10% weight)
  // ============================================================
  let investorSophisticationScore = 50 // Default neutral
  
  if (company.investor_sophistication_score !== null && company.investor_sophistication_score !== undefined) {
    dataCompleteCount++
    // Score is 1-10 scale, normalize to 0-100
    investorSophisticationScore = (company.investor_sophistication_score / 10) * 100
    
    if (company.investor_sophistication_score >= 8) {
      opportunityFactors.push('Sophisticated investor base familiar with public market requirements')
    } else if (company.investor_sophistication_score <= 3) {
      riskFactors.push('Early-stage investor base may require extensive public market education')
    }
  }

  // ============================================================
  // Calculate weighted score components
  // ============================================================
  const basePaceComponent = baseScore * 0.4
  const cashRunwayComponent = cashRunwayScore * 0.2
  const teamReadinessComponent = teamReadinessScore * 0.2
  const marketConditionComponent = marketConditionScore * 0.1
  const investorSophisticationComponent = investorSophisticationScore * 0.1

  // Direct weighted sum calculation (not delta-based)
  const adjustedPaceScore = Math.floor(Math.max(0, Math.min(100, 
    basePaceComponent + 
    cashRunwayComponent + 
    teamReadinessComponent + 
    marketConditionComponent + 
    investorSophisticationComponent
  )))

  const totalAdjustment = adjustedPaceScore - baseScore

  // Determine confidence level based on data completeness
  // Need: base + cash + team (size/cfo/board/auditor) + investor = 6 data points
  const dataCompletenessRatio = dataCompleteCount / 6
  let confidenceLevel: 'low' | 'medium' | 'high'
  
  if (dataCompletenessRatio >= 0.67) {
    confidenceLevel = 'high'
  } else if (dataCompletenessRatio >= 0.5) {
    confidenceLevel = 'medium'
  } else {
    confidenceLevel = 'low'
  }

  // Adjust estimated days to IPO based on confidence and adjustment
  // Higher confidence + positive adjustment = more aggressive timeline
  const confidenceMultiplier = confidenceLevel === 'high' ? 0.95 : confidenceLevel === 'medium' ? 1.0 : 1.1
  const adjustmentImpact = (totalAdjustment / 100) * 30 // Up to ±30 days adjustment
  
  const adjustedDaysToIpo = Math.max(
    90, // Minimum 3 months, even with perfect score
    Math.round(company.estimated_days_to_ipo * confidenceMultiplier - adjustmentImpact)
  )

  return {
    adjustedPaceScore,
    baseScore,
    adjustment: Math.round(totalAdjustment),
    confidenceLevel,
    riskFactors: [...new Set(riskFactors)], // Remove duplicates
    opportunityFactors: [...new Set(opportunityFactors)],
    breakdown: {
      basePace: Math.round(baseScore),
      cashRunwayScore: Math.round(cashRunwayScore),
      teamReadinessScore: Math.round(teamReadinessScore),
      marketConditionScore: Math.round(marketConditionScore),
      investorSophisticationScore: Math.round(investorSophisticationScore),
    },
    estimatedDaysToIpoAdjusted: adjustedDaysToIpo,
  }
}

/**
 * Update company's predictive factors
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
  // Update cash runway
  if (factors.cash_runway_months !== undefined) {
    await sql`
      UPDATE companies
      SET cash_runway_months = ${factors.cash_runway_months}
      WHERE id = ${companyId}
    `
  }

  // Update team size
  if (factors.team_size !== undefined) {
    await sql`
      UPDATE companies
      SET team_size = ${factors.team_size}
      WHERE id = ${companyId}
    `
  }

  // Update board size
  if (factors.board_size !== undefined) {
    await sql`
      UPDATE companies
      SET board_size = ${factors.board_size}
      WHERE id = ${companyId}
    `
  }

  // Update CFO hire date
  if (factors.cfo_hired_at !== undefined) {
    await sql`
      UPDATE companies
      SET cfo_hired_at = ${factors.cfo_hired_at}
      WHERE id = ${companyId}
    `
  }

  // Update auditor selected
  if (factors.auditor_selected !== undefined) {
    await sql`
      UPDATE companies
      SET auditor_selected = ${factors.auditor_selected}
      WHERE id = ${companyId}
    `
  }

  // Update investor sophistication
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

  return {
    cashRunway: company.cash_runway_months
      ? {
          months: company.cash_runway_months,
          status:
            company.cash_runway_months >= 12
              ? 'healthy'
              : company.cash_runway_months >= 6
                ? 'warning'
                : 'critical',
        }
      : null,
    team: {
      size: company.team_size ?? 0,
      cfoHired: !!company.cfo_hired_at,
      boardSize: company.board_size ?? 0,
      auditorSelected: !!company.auditor_selected,
    },
    investorSophistication: company.investor_sophistication_score 
      ? `${company.investor_sophistication_score}/10` 
      : null,
  }
}
