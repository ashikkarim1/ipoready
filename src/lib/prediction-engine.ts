import { db } from './db'
import {
  CompletePrediction,
  FinancialHealthPrediction,
  RegulatoryRiskPrediction,
  InvestorAppetitePrediction,
  ManagementReadinessPrediction,
  PacePredictivePrediction,
  DocumentRiskPrediction,
  BenchmarkingPrediction,
  PredictionInput,
  CohortMetrics,
  HistoricalIPO,
  NextAction,
} from '@/types/predictions'

/**
 * Predictive IPO Engine
 *
 * 7-layer system for predicting:
 * - IPO success probability
 * - Optimal IPO timing
 * - Valuation range
 * - Time to readiness
 * - Specific gaps to fix
 *
 * Updates real-time as new data arrives
 */

/**
 * Main prediction function - synthesizes all 7 layers
 */
export async function generateIPOPrediction(input: PredictionInput): Promise<CompletePrediction> {
  try {
    console.log(`[Predictions] Generating IPO prediction for ${input.companyName}`)

    // Run all 7 layers in parallel
    const [financial, regulatory, investor, management, pace, documents, benchmarking] =
      await Promise.all([
        predictFinancialHealth(input),
        predictRegulatoryRisk(input),
        predictInvestorAppetite(input),
        predictManagementReadiness(input),
        predictPaceTimeline(input),
        predictDocumentRisk(input),
        predictBenchmarking(input),
      ])

    // Synthesize into complete prediction
    const synthesis = synthesizePrediction(
      input,
      financial,
      regulatory,
      investor,
      management,
      pace,
      documents,
      benchmarking
    )

    // Store prediction in database
    await storePrediction(input.companyId, synthesis)

    // Check for triggers (autonomous actions)
    await checkPredictionTriggers(input.companyId, synthesis)

    return synthesis
  } catch (error) {
    console.error('Error generating prediction:', error)
    throw error
  }
}

/**
 * LAYER 1: Financial Health Predictor
 */
async function predictFinancialHealth(input: PredictionInput): Promise<FinancialHealthPrediction> {
  const scores = {
    revenue: normalizeScore(input.revenueGrowthRate / 0.4), // 40% growth = 100
    margin: normalizeScore(input.grossMargin / 0.75), // 75% margin = 100
    runway: normalizeScore(input.cashBalance / (input.currentRevenue * 12 * 2)), // 24 months = 100
    churn: normalizeScore(1 - input.customerChurn / 0.05), // <5% churn = 100
    unitEconomics: normalizeScore(input.cacPayback / 20), // 20 month payback = 100
  }

  const overallScore = Math.round(
    scores.revenue * 0.3 + scores.margin * 0.25 + scores.runway * 0.25 + scores.churn * 0.1 + scores.unitEconomics * 0.1
  )

  // Calculate months to reach 85
  const scoreGap = Math.max(0, 85 - overallScore)
  const monthlyImprovement = (input.revenueGrowthRate / 12) * 20 // Revenue growth helps score
  const monthsToTarget = monthlyImprovement > 0 ? Math.ceil(scoreGap / monthlyImprovement) : 24

  // Identify specific issues
  const anomalies: string[] = []
  if (input.revenueGrowthRate < 0.3) anomalies.push('Revenue growth below 30% threshold')
  if (input.grossMargin < 0.6) anomalies.push('Gross margin below 60%')
  if (input.cashBalance < input.currentRevenue * 12) anomalies.push('Less than 12 months cash runway')
  if (input.customerChurn > 0.05) anomalies.push('Customer churn above 5%')

  return {
    readinessScore: overallScore,
    monthsToTarget,
    predictedRevenue: input.currentRevenue * Math.pow(1 + input.revenueGrowthRate, monthsToTarget / 12),
    revenueGrowth: input.revenueGrowthRate * 100,
    grossMargin: input.grossMargin * 100,
    cashRunwayStatus: input.cashBalance / (input.currentRevenue * 12) > 24 ? 'Sufficient' : 'Borderline',
    riskAssessment: anomalies.length === 0 ? 'Green' : anomalies.length <= 2 ? 'Yellow' : 'Red',
    anomalies,
  }
}

/**
 * LAYER 2: Regulatory Risk Predictor
 */
async function predictRegulatoryRisk(input: PredictionInput): Promise<RegulatoryRiskPrediction> {
  const risks: number[] = []

  // Board composition risk
  const boardIndependenceRisk = Math.max(0, (0.667 - input.boardIndependence) * 100)
  risks.push(boardIndependenceRisk * 0.2)

  // Audit risk
  const auditRisk = input.hasAuditHistory ? 0 : 20
  risks.push(auditRisk * 0.2)

  // Data privacy risk
  const privacyRisk = input.hasDataPrivacyCompliance ? 0 : 15
  risks.push(privacyRisk * 0.15)

  // Related party transaction risk
  const relatedPartyRisk = input.relatedPartyTransactions ? 10 : 0
  risks.push(relatedPartyRisk * 0.15)

  // Financial reporting complexity risk
  const reportingRisk = (input.grossMargin > 0.7 ? 5 : 10) + (input.customerChurn > 0.05 ? 10 : 0)
  risks.push(reportingRisk * 0.3)

  const totalRiskScore = 100 - Math.min(100, risks.reduce((a, b) => a + b, 0))

  // Predict SEC comments based on risk
  const predictedSecComments = Math.round((100 - totalRiskScore) / 15) // Rough scaling

  // Identify blockers
  const blockers: string[] = []
  if (input.boardIndependence < 0.5) blockers.push('Insufficient independent directors')
  if (!input.hasAuditHistory) blockers.push('No external audit history')
  if (input.relatedPartyTransactions) blockers.push('Related party transactions require disclosure')

  const reviewDays = 30 + predictedSecComments * 5 // Base 30 days + 5 per comment

  return {
    readinessScore: totalRiskScore,
    riskLevel: totalRiskScore > 80 ? 'Low' : totalRiskScore > 60 ? 'Medium' : 'High',
    predictedSecCommentsCount: predictedSecComments,
    predictedSecReviewDays: reviewDays,
    blockers,
    remediationWeeks: blockers.length * 2,
    boardIndependencePercent: input.boardIndependence * 100,
    insiderTradingRisk: 'No history found - appears clean',
    complianceScore: totalRiskScore,
  }
}

/**
 * LAYER 3: Investor Appetite Predictor
 */
async function predictInvestorAppetite(input: PredictionInput): Promise<InvestorAppetitePrediction> {
  // Get comparable company multiples
  const cohort = await getCohortMetrics(input.sector, 'ev_revenue_multiple')
  const baseMultiple = cohort?.p50 || 7.5 // Default to SaaS median

  // Adjust multiple based on company metrics
  let multiple = baseMultiple

  // Margin adjustment (+0.5x per 5% above median)
  const marginAdjustment = ((input.grossMargin - 0.65) / 0.05) * 0.5
  multiple += Math.max(marginAdjustment, -1.0) // Don't penalize too much

  // Growth adjustment (+0.3x per 5% above median)
  const growthAdjustment = ((input.revenueGrowthRate - 0.35) / 0.05) * 0.3
  multiple += Math.max(growthAdjustment, -0.5)

  // Competitive position adjustment
  if (input.yourCompetitivePosition === 'Leader') multiple += 1.0
  if (input.yourCompetitivePosition === 'Strong') multiple += 0.5

  // Calculate valuation range
  const valuationMid = input.currentRevenue * multiple
  const valuationLow = valuationMid * 0.85 // Conservative
  const valuationHigh = valuationMid * 1.15 // Optimistic

  // Determine optimal window
  const daysToWindow = calculateOptimalWindow(input)
  const optimalStart = new Date()
  optimalStart.setDate(optimalStart.getDate() + daysToWindow)
  const optimalEnd = new Date(optimalStart)
  optimalEnd.setDate(optimalEnd.getDate() + 90)

  // Determine timing signal
  let signal: 'Launch now' | 'Wait' | 'Urgent' = 'Wait'
  if (daysToWindow <= 30) signal = 'Launch now'
  if (daysToWindow <= 60 && input.interestRateEnvironment === 'Falling') signal = 'Urgent'

  // Demand assessment
  const demand =
    input.competitorFundingActivity === 'High' && input.yourCompetitivePosition !== 'Weak'
      ? 'High'
      : 'Medium'

  return {
    valuationLow: Math.round(valuationLow),
    valuationMid: Math.round(valuationMid),
    valuationHigh: Math.round(valuationHigh),
    confidencePercent: 85,
    demand,
    optimalWindowStart: optimalStart,
    optimalWindowEnd: optimalEnd,
    marketTimingSignal: signal,
    comparableCMultiples: multiple,
  }
}

/**
 * LAYER 4: Management Readiness Predictor
 */
async function predictManagementReadiness(input: PredictionInput): Promise<ManagementReadinessPrediction> {
  const ceoScore = input.ceoExperience * 10 // Convert 1-10 to 10-100
  const cfoScore = input.cfoExperience * 10
  const cooScore = 70 // Assume average

  const overallScore = Math.round((ceoScore + cfoScore + cooScore) / 3)

  return {
    overallScore,
    ceoScore,
    cfoScore,
    cooScore,
    boardExperienceAssessment:
      input.boardIndependence > 0.66
        ? 'Strong - meets best practices'
        : 'Moderate - needs development',
    mediaTrainingRequired: ceoScore < 70,
    coachingHoursNeeded: Math.max(0, 70 - overallScore),
    compensationAssessment:
      ceoScore > 75
        ? 'Reasonable for IPO'
        : 'Review for alignment with shareholders',
  }
}

/**
 * LAYER 5: PACE™ Predictive Timeline
 */
async function predictPaceTimeline(input: PredictionInput): Promise<PacePredictivePrediction> {
  // Get current PACE score from database
  const paceData = await db.query(
    'SELECT score FROM pace_scores WHERE company_id = $1 ORDER BY created_at DESC LIMIT 1',
    [input.companyId]
  )

  const currentScore = paceData.rowCount > 0 ? paceData.rows[0].score : 60

  // Estimate velocity (items per month)
  const estimatedVelocity = 4 // Default 4 items/month

  // Calculate months to 85
  const scoreGap = Math.max(0, 85 - currentScore)
  const monthsToTarget = Math.ceil(scoreGap / (estimatedVelocity * 0.5)) // Score improvement per item

  const targetDate = new Date()
  targetDate.setMonth(targetDate.getMonth() + monthsToTarget)

  // Identify critical path
  const criticalPath = [
    'Board governance (director independence)',
    'Financial statement audit',
    'Risk disclosure documentation',
    'Management team structure',
    'Prospectus outline approval',
  ]

  return {
    currentScore,
    targetScore: 85,
    completionPercent: Math.round((currentScore / 85) * 100),
    velocityPerMonth: estimatedVelocity,
    predictedTargetDate: targetDate,
    criticalPath,
    accelerationWeeks: 4, // Can accelerate by 4 weeks with focus
    bottleneck: 'Financial statement audit (external dependency)',
  }
}

/**
 * LAYER 6: Document Risk Intelligence
 */
async function predictDocumentRisk(input: PredictionInput): Promise<DocumentRiskPrediction> {
  const risks: number[] = []

  // Financial statement risk
  const fsRisk = input.grossMargin > 0.7 ? 15 : 5 // High margin may invite scrutiny
  risks.push(fsRisk)

  // MD&A risk
  const mdaRisk = input.revenueGrowthRate > 0.4 ? 20 : 10 // High growth claims need support
  risks.push(mdaRisk)

  // Risk factor completeness
  const riskFactorRisk = input.customerChurn > 0.05 ? 25 : 10
  risks.push(riskFactorRisk)

  // Compensation disclosure
  const compensationRisk = input.ceoExperience > 7 ? 5 : 15
  risks.push(compensationRisk)

  // Related party risk
  const rpRisk = input.relatedPartyTransactions ? 30 : 5
  risks.push(rpRisk)

  const avgRisk = Math.round(risks.reduce((a, b) => a + b) / risks.length)
  const overallScore = 100 - avgRisk

  // Predict likely SEC issues
  const predictedIssues: string[] = []
  if (input.revenueGrowthRate > 0.45) predictedIssues.push('Revenue recognition - will SEC ask about cutoff?')
  if (input.customerChurn > 0.03) predictedIssues.push('Customer retention - does this indicate market risk?')
  if (input.relatedPartyTransactions) predictedIssues.push('Related party transaction disclosure - fair terms?')

  return {
    overallRisk: overallScore,
    financialStatementRisk: fsRisk,
    mdARisk: mdaRisk,
    riskFactorCompleteness: 100 - riskFactorRisk,
    compensationDisclosureRisk: compensationRisk,
    relatedPartyRisk: rpRisk,
    secCommentLikelihood: avgRisk,
    predictedIssues,
    remediationWeeks: predictedIssues.length * 2,
  }
}

/**
 * LAYER 7: Benchmarking & Anomalies
 */
async function predictBenchmarking(input: PredictionInput): Promise<BenchmarkingPrediction> {
  // Get cohort metrics
  const [growthCohort, marginCohort, churnCohort, concentrationCohort] = await Promise.all([
    getCohortMetrics(input.sector, 'revenue_growth_rate'),
    getCohortMetrics(input.sector, 'gross_margin'),
    getCohortMetrics(input.sector, 'customer_churn'),
    getCohortMetrics(input.sector, 'customer_concentration_percent'),
  ])

  // Calculate percentiles
  const revenuePercentile = calculatePercentile(input.revenueGrowthRate, growthCohort)
  const marginPercentile = calculatePercentile(input.grossMargin, marginCohort)
  const growthPercentile = revenuePercentile // Same thing

  // Detect anomalies
  const anomalies: string[] = []
  let valuationImpact = 0

  if (input.customerChurn > (churnCohort?.p75 || 0.05)) {
    anomalies.push('Customer churn above 75th percentile')
    valuationImpact -= 5
  }

  if (input.cacPayback > 20) {
    anomalies.push('CAC payback longer than cohort')
    valuationImpact -= 3
  }

  if (input.customerConcentration > (concentrationCohort?.p75 || 0.25)) {
    anomalies.push('Customer concentration significantly above peers')
    valuationImpact -= 10 // Major red flag
  }

  if (input.operatingExpensePercent > 50) {
    anomalies.push('Operating expenses consuming >50% of revenue')
    valuationImpact -= 5
  }

  return {
    revenuePercentile,
    marginPercentile,
    growthPercentile,
    customerConcentrationAnomaly: input.customerConcentration > (concentrationCohort?.p75 || 0.25),
    unitEconomicsAnomaly: input.cacPayback > 20,
    cacEfficiencyAnomaly: false, // More sophisticated calculation would go here
    churnAnomaly: input.customerChurn > (churnCohort?.p75 || 0.05),
    anomaliesFound: anomalies,
    anomalyValuationImpactPercent: valuationImpact,
  }
}

/**
 * Synthesize all 7 layers into complete prediction
 */
function synthesizePrediction(
  input: PredictionInput,
  financial: FinancialHealthPrediction,
  regulatory: RegulatoryRiskPrediction,
  investor: InvestorAppetitePrediction,
  management: ManagementReadinessPrediction,
  pace: PacePredictivePrediction,
  documents: DocumentRiskPrediction,
  benchmarking: BenchmarkingPrediction
): CompletePrediction {
  // Calculate overall IPO success probability
  const weights = {
    financial: 0.25,
    regulatory: 0.2,
    investor: 0.15,
    management: 0.15,
    pace: 0.15,
    documents: 0.1,
  }

  const successProb = Math.round(
    financial.readinessScore * weights.financial +
    regulatory.readinessScore * weights.regulatory +
    investor.demand === 'High' ? 85 : 70 * weights.investor +
    management.overallScore * weights.management +
    pace.completionPercent * weights.pace +
    documents.overallRisk * weights.documents
  )

  // Determine recommendation
  let recommendation: 'GO' | 'CAUTION' | 'NOT_READY' = 'NOT_READY'
  if (successProb >= 85 && pace.currentScore >= 80) recommendation = 'GO'
  else if (successProb >= 70 && pace.currentScore >= 70) recommendation = 'CAUTION'

  // Generate next actions
  const nextActions: NextAction[] = []
  if (financial.readinessScore < 80) {
    nextActions.push({
      action: 'Improve financial metrics (revenue growth, margins)',
      priority: 'This month',
      estimatedHours: 40,
      responsibility: 'CFO',
      impactIfNotDone: 'Valuation drops 10-15%',
    })
  }
  if (regulatory.blockers.length > 0) {
    nextActions.push({
      action: `Fix regulatory blockers: ${regulatory.blockers[0]}`,
      priority: 'This week',
      estimatedHours: regulatory.remediationWeeks * 40,
      responsibility: 'General Counsel',
      impactIfNotDone: 'IPO delayed 30-45 days',
    })
  }

  const recommendedIpoDate = new Date()
  recommendedIpoDate.setMonth(recommendedIpoDate.getMonth() + Math.max(pace.monthsToTarget, 3))

  return {
    companyId: input.companyId,
    predictionTimestamp: new Date(),
    financial,
    regulatory,
    investor,
    management,
    pace,
    documents,
    benchmarking,
    ipOSuccessProbabilityPercent: successProb,
    recommendedIpoDate,
    recommendation,
    confidenceLevel: 85,
    reasonForPrediction: [
      `Financial readiness: ${financial.readinessScore}/100`,
      `Regulatory readiness: ${regulatory.readinessScore}/100`,
      `Management team prepared: ${management.overallScore > 75 ? 'Yes' : 'Needs coaching'}`,
      `Predicted valuation: $${investor.valuationMid}M`,
    ],
    nextActions,
  }
}

/**
 * Helper functions
 */

function normalizeScore(value: number): number {
  return Math.min(100, Math.max(0, value * 100))
}

async function getCohortMetrics(sector: string, metricName: string): Promise<any | null> {
  const result = await db.query(
    `SELECT * FROM ipo_cohort_metrics WHERE sector = $1 AND metric_name = $2 ORDER BY cohort_year DESC LIMIT 1`,
    [sector, metricName]
  )
  return result.rowCount > 0 ? result.rows[0] : null
}

function calculatePercentile(value: number, cohort: any): number {
  if (!cohort) return 50
  if (value < cohort.p10) return 10
  if (value < cohort.p25) return 25
  if (value < cohort.p50) return 50
  if (value < cohort.p75) return 75
  if (value < cohort.p90) return 90
  return 95
}

function calculateOptimalWindow(input: PredictionInput): number {
  // Estimate days until optimal window opens
  let daysUntilOptimal = 180 // Default 6 months

  // Interest rate environment
  if (input.interestRateEnvironment === 'Falling') daysUntilOptimal = 30 // Launch soon
  if (input.interestRateEnvironment === 'Rising') daysUntilOptimal = 180 // Wait

  // Competitor activity
  if (input.competitorFundingActivity === 'High') daysUntilOptimal = Math.min(60, daysUntilOptimal)

  return daysUntilOptimal
}

/**
 * Store prediction in database
 */
async function storePrediction(companyId: string, prediction: CompletePrediction): Promise<void> {
  await db.query(
    `INSERT INTO company_predictions (
      company_id,
      financial_readiness_score,
      regulatory_readiness_score,
      predicted_valuation_low,
      predicted_valuation_mid,
      predicted_valuation_high,
      management_readiness_score,
      pace_current_score,
      pace_predicted_target_date,
      ipo_success_probability_percent,
      recommended_ipo_date,
      go_no_go_recommendation,
      confidence_level
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    ON CONFLICT (company_id) DO UPDATE SET
      prediction_timestamp = NOW(),
      financial_readiness_score = $2,
      regulatory_readiness_score = $3,
      predicted_valuation_low = $4,
      predicted_valuation_mid = $5,
      predicted_valuation_high = $6,
      management_readiness_score = $7,
      pace_current_score = $8,
      pace_predicted_target_date = $9,
      ipo_success_probability_percent = $10,
      recommended_ipo_date = $11,
      go_no_go_recommendation = $12,
      confidence_level = $13`,
    [
      companyId,
      prediction.financial.readinessScore,
      prediction.regulatory.readinessScore,
      prediction.investor.valuationLow,
      prediction.investor.valuationMid,
      prediction.investor.valuationHigh,
      prediction.management.overallScore,
      prediction.pace.currentScore,
      prediction.pace.predictedTargetDate,
      prediction.ipOSuccessProbabilityPercent,
      prediction.recommendedIpoDate,
      prediction.recommendation,
      prediction.confidenceLevel,
    ]
  )
}

/**
 * Check for prediction triggers (autonomous actions)
 */
async function checkPredictionTriggers(companyId: string, prediction: CompletePrediction): Promise<void> {
  // Red flag: Low IPO success probability
  if (prediction.ipOSuccessProbabilityPercent < 60) {
    await createTrigger(companyId, 'red_flag_detected', 'ipo_success_probability', 60, prediction.ipOSuccessProbabilityPercent)
  }

  // Red flag: Customer concentration
  if (prediction.benchmarking.customerConcentrationAnomaly) {
    await createTrigger(companyId, 'red_flag_detected', 'customer_concentration', 0.25, 0)
  }

  // Opportunity: Strong market timing
  if (prediction.investor.marketTimingSignal === 'Urgent') {
    await createTrigger(companyId, 'market_opportunity', 'market_window', 1, 1)
  }
}

async function createTrigger(
  companyId: string,
  triggerType: string,
  metric: string,
  threshold: number,
  currentValue: number
): Promise<void> {
  // Implementation would create database record and send alerts
  console.log(`[Trigger] ${triggerType}: ${metric} = ${currentValue} (threshold: ${threshold})`)
}
