/**
 * Financial utilities for IPO cost tracking and analysis
 */

export interface FinancialMetrics {
  costVariancePercent: number
  budgetUtilizationPercent: number
  runwayDays: number
  costPerDay: number
  monthsUntilIPO: number
  daysUntilIPO: number
  projectedTotalCost: number
  costAtCompletion: number
  costVariance: number
  scheduleVariance: number
  costPerformanceIndex: number
  schedulePerformanceIndex: number
}

export interface RiskProfile {
  level: 'low' | 'medium' | 'high' | 'critical'
  score: number
  factors: string[]
  recommendedActions: string[]
}

/**
 * Calculate comprehensive financial metrics
 */
export function calculateFinancialMetrics(
  estimatedCost: number,
  actualSpent: number,
  budget: number,
  costPerDay: number,
  ipoDate: Date,
  totalDaysPlanned: number
): FinancialMetrics {
  const today = new Date()
  const daysUntilIPO = Math.max(0, Math.ceil((ipoDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
  const monthsUntilIPO = Math.ceil(daysUntilIPO / 30)

  const costVariance = actualSpent - estimatedCost
  const costVariancePercent = estimatedCost > 0 ? (costVariance / estimatedCost) * 100 : 0

  const budgetUtilizationPercent = budget > 0 ? (actualSpent / budget) * 100 : 0

  const budgetRemaining = Math.max(0, budget - actualSpent)
  const runwayDays = costPerDay > 0 ? budgetRemaining / costPerDay : daysUntilIPO

  // Earn Value Management metrics
  const daysElapsed = Math.max(1, totalDaysPlanned - daysUntilIPO)
  const scheduledValue = (daysElapsed / totalDaysPlanned) * estimatedCost
  const earnedValue = estimatedCost - (actualSpent - scheduledValue)
  const scheduleVariance = earnedValue - scheduledValue

  // Cost and Schedule Performance Indexes
  const costPerformanceIndex = earnedValue > 0 ? earnedValue / actualSpent : 1
  const schedulePerformanceIndex = scheduledValue > 0 ? earnedValue / scheduledValue : 1

  // Project cost at completion
  const projectedTotalCost = costPerformanceIndex > 0 ? estimatedCost / costPerformanceIndex : estimatedCost
  const costAtCompletion = actualSpent + (projectedTotalCost - actualSpent) * (1 - costPerformanceIndex)

  return {
    costVariancePercent,
    budgetUtilizationPercent,
    runwayDays: Math.max(0, runwayDays),
    costPerDay,
    monthsUntilIPO,
    daysUntilIPO,
    projectedTotalCost,
    costAtCompletion,
    costVariance,
    scheduleVariance,
    costPerformanceIndex,
    schedulePerformanceIndex,
  }
}

/**
 * Assess financial risk profile
 */
export function assessRiskProfile(
  metrics: FinancialMetrics,
  delayRiskPerDay: number,
  estimatedDaysDelay: number
): RiskProfile {
  const factors: string[] = []
  let riskScore = 0

  // Cost variance risk
  if (metrics.costVariancePercent > 25) {
    factors.push('Critical cost overrun (>25%)')
    riskScore += 40
  } else if (metrics.costVariancePercent > 15) {
    factors.push('Significant cost overrun (>15%)')
    riskScore += 25
  } else if (metrics.costVariancePercent > 5) {
    factors.push('Moderate cost variance (>5%)')
    riskScore += 10
  }

  // Runway risk
  if (metrics.runwayDays < metrics.daysUntilIPO + 30) {
    factors.push('Inadequate runway buffer')
    riskScore += 30
  } else if (metrics.runwayDays < metrics.daysUntilIPO + 60) {
    factors.push('Tight runway margin')
    riskScore += 15
  }

  // Budget utilization risk
  if (metrics.budgetUtilizationPercent > 90) {
    factors.push('High budget utilization (>90%)')
    riskScore += 20
  } else if (metrics.budgetUtilizationPercent > 75) {
    factors.push('Elevated budget usage (>75%)')
    riskScore += 10
  }

  // Cost performance index
  if (metrics.costPerformanceIndex < 0.8) {
    factors.push('Poor cost performance')
    riskScore += 25
  } else if (metrics.costPerformanceIndex < 0.9) {
    factors.push('Declining cost performance')
    riskScore += 10
  }

  // Schedule performance
  if (metrics.schedulePerformanceIndex < 0.8) {
    factors.push('Schedule slippage risk')
    riskScore += 20
  } else if (metrics.schedulePerformanceIndex < 0.9) {
    factors.push('Schedule variance increasing')
    riskScore += 10
  }

  // Delay risk
  if (estimatedDaysDelay > 30) {
    factors.push('High schedule delay exposure')
    riskScore += 25
  } else if (estimatedDaysDelay > 15) {
    factors.push('Moderate delay exposure')
    riskScore += 15
  }

  // Determine risk level
  let level: 'low' | 'medium' | 'high' | 'critical' = 'low'
  if (riskScore >= 80) {
    level = 'critical'
  } else if (riskScore >= 60) {
    level = 'high'
  } else if (riskScore >= 30) {
    level = 'medium'
  }

  const recommendedActions: string[] = []

  if (level === 'critical' || level === 'high') {
    recommendedActions.push('Conduct immediate cost review with finance team')
    recommendedActions.push('Escalate to executive leadership and board')
  }

  if (metrics.costVariancePercent > 15) {
    recommendedActions.push('Implement cost control measures across all categories')
    recommendedActions.push('Review vendor contracts for optimization opportunities')
  }

  if (metrics.runwayDays < metrics.daysUntilIPO + 60) {
    recommendedActions.push('Accelerate milestone completion to reduce timeline')
    recommendedActions.push('Explore cost savings or budget contingency options')
  }

  if (metrics.costPerformanceIndex < 0.9) {
    recommendedActions.push('Increase cost monitoring frequency to weekly')
    recommendedActions.push('Implement earned value management tracking')
  }

  if (estimatedDaysDelay > 15) {
    recommendedActions.push('Prioritize critical path activities')
    recommendedActions.push('Allocate additional resources to at-risk workstreams')
  }

  return {
    level,
    score: Math.min(100, riskScore),
    factors,
    recommendedActions,
  }
}

/**
 * Format currency with proper localization
 */
export function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Calculate running burn rate trend
 */
export interface MonthlyTrend {
  month: string
  spendingRate: number
  trend: 'increasing' | 'decreasing' | 'stable'
  trendPercent: number
}

export function calculateBurnRateTrend(
  monthlyData: Array<{ month: string; actual: number }>
): MonthlyTrend[] {
  if (monthlyData.length < 2) {
    return monthlyData.map(d => ({
      month: d.month,
      spendingRate: d.actual / 30,
      trend: 'stable',
      trendPercent: 0,
    }))
  }

  const trends: MonthlyTrend[] = []

  for (let i = 0; i < monthlyData.length; i++) {
    const currentRate = monthlyData[i].actual / 30

    if (i === 0) {
      trends.push({
        month: monthlyData[i].month,
        spendingRate: currentRate,
        trend: 'stable',
        trendPercent: 0,
      })
    } else {
      const previousRate = monthlyData[i - 1].actual / 30
      const trendPercent = previousRate > 0 ? ((currentRate - previousRate) / previousRate) * 100 : 0

      let trend: 'increasing' | 'decreasing' | 'stable' = 'stable'
      if (trendPercent > 5) trend = 'increasing'
      else if (trendPercent < -5) trend = 'decreasing'

      trends.push({
        month: monthlyData[i].month,
        spendingRate: currentRate,
        trend,
        trendPercent,
      })
    }
  }

  return trends
}

/**
 * Project costs at IPO completion
 */
export function projectCostAtCompletion(
  actualSpent: number,
  estimatedCost: number,
  daysElapsed: number,
  daysRemaining: number
): number {
  const dailyRate = daysElapsed > 0 ? actualSpent / daysElapsed : estimatedCost / (daysElapsed + daysRemaining)
  return actualSpent + dailyRate * daysRemaining
}

/**
 * Calculate cost variance tolerance thresholds
 */
export interface VarianceThresholds {
  warning: number
  critical: number
}

export function getVarianceThresholds(estimatedCost: number): VarianceThresholds {
  return {
    warning: estimatedCost * 0.05, // 5% variance
    critical: estimatedCost * 0.15, // 15% variance
  }
}

/**
 * Generate financial health score (0-100)
 */
export function calculateFinancialHealthScore(metrics: FinancialMetrics, risk: RiskProfile): number {
  let score = 100

  // Cost variance impact (max -30 points)
  const costVarianceImpact = Math.abs(metrics.costVariancePercent)
  if (costVarianceImpact > 20) score -= 30
  else if (costVarianceImpact > 10) score -= 20
  else if (costVarianceImpact > 5) score -= 10

  // Runway impact (max -20 points)
  const runwayMonths = metrics.runwayDays / 30
  if (runwayMonths < metrics.monthsUntilIPO) score -= 20
  else if (runwayMonths < metrics.monthsUntilIPO + 1) score -= 10

  // Performance index impact (max -25 points)
  const avgPerformance = (metrics.costPerformanceIndex + metrics.schedulePerformanceIndex) / 2
  if (avgPerformance < 0.8) score -= 25
  else if (avgPerformance < 0.9) score -= 15
  else if (avgPerformance < 0.95) score -= 5

  // Budget utilization impact (max -15 points)
  if (metrics.budgetUtilizationPercent > 90) score -= 15
  else if (metrics.budgetUtilizationPercent > 80) score -= 10
  else if (metrics.budgetUtilizationPercent > 70) score -= 5

  // Risk level penalty (max -10 points)
  const riskPenalty = (100 - risk.score) * 0.1
  score -= riskPenalty

  return Math.max(0, Math.round(score))
}
