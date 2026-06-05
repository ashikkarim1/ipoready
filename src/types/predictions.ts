/**
 * Predictive IPO Engine Types
 * 7-layer prediction system for IPO success, timing, and valuation
 */

/**
 * Layer 1: Financial Health Predictor
 */
export interface FinancialHealthPrediction {
  readinessScore: number // 0-100
  monthsToTarget: number // Months until 85+ score
  predictedRevenue: number
  revenueGrowth: number // %
  grossMargin: number // %
  cashRunwayStatus: 'Sufficient' | 'Borderline' | 'Critical'
  riskAssessment: string
  anomalies: string[]
}

/**
 * Layer 2: Regulatory Risk Predictor
 */
export interface RegulatoryRiskPrediction {
  readinessScore: number // 0-100
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical'
  predictedSecCommentsCount: number
  predictedSecReviewDays: number
  blockers: string[]
  remediationWeeks: number
  boardIndependencePercent: number
  insiderTradingRisk: string
  complianceScore: number
}

/**
 * Layer 3: Investor Appetite Predictor
 */
export interface InvestorAppetitePrediction {
  valuationLow: number
  valuationMid: number
  valuationHigh: number
  confidencePercent: number
  demand: 'High' | 'Medium' | 'Low'
  optimalWindowStart: Date
  optimalWindowEnd: Date
  marketTimingSignal: 'Launch now' | 'Wait' | 'Urgent'
  comparableCMultiples: number // EV/Revenue
}

/**
 * Layer 4: Management Readiness Predictor
 */
export interface ManagementReadinessPrediction {
  overallScore: number // 0-100
  ceoScore: number
  cfoScore: number
  cooScore: number
  boardExperienceAssessment: string
  mediaTrainingRequired: boolean
  coachingHoursNeeded: number
  compensationAssessment: string
}

/**
 * Layer 5: PACE™ Predictive Timeline
 */
export interface PacePredictivePrediction {
  currentScore: number
  targetScore: number
  completionPercent: number
  velocityPerMonth: number // items completed per month
  predictedTargetDate: Date // When will hit 85+
  criticalPath: string[]
  accelerationWeeks: number // How much faster if focused
  bottleneck: string
}

/**
 * Layer 6: Document Risk Intelligence
 */
export interface DocumentRiskPrediction {
  overallRisk: number // 0-100 (100 = no risk)
  financialStatementRisk: number
  mdARisk: number // Management's Discussion & Analysis
  riskFactorCompleteness: number // %
  compensationDisclosureRisk: number
  relatedPartyRisk: number
  secCommentLikelihood: number // %
  predictedIssues: string[]
  remediationWeeks: number
}

/**
 * Layer 7: Benchmarking & Anomalies
 */
export interface BenchmarkingPrediction {
  revenuePercentile: number // 1-100 vs cohort
  marginPercentile: number
  growthPercentile: number
  customerConcentrationAnomaly: boolean
  unitEconomicsAnomaly: boolean
  cacEfficiencyAnomaly: boolean
  churnAnomaly: boolean
  anomaliesFound: string[]
  anomalyValuationImpactPercent: number
}

/**
 * Complete Prediction (all 7 layers synthesized)
 */
export interface CompletePrediction {
  companyId: string
  predictionTimestamp: Date

  // 7 Layers
  financial: FinancialHealthPrediction
  regulatory: RegulatoryRiskPrediction
  investor: InvestorAppetitePrediction
  management: ManagementReadinessPrediction
  pace: PacePredictivePrediction
  documents: DocumentRiskPrediction
  benchmarking: BenchmarkingPrediction

  // Overall synthesis
  ipOSuccessProbabilityPercent: number
  recommendedIpoDate: Date
  recommendation: 'GO' | 'CAUTION' | 'NOT_READY'
  confidenceLevel: number // 0-100
  reasonForPrediction: string[]
  nextActions: NextAction[]
}

export interface NextAction {
  action: string
  priority: 'Immediate' | 'This week' | 'This month'
  estimatedHours: number
  responsibility: 'CEO' | 'CFO' | 'General Counsel' | 'Board'
  impactIfNotDone: string
}

/**
 * Prediction trigger (autonomous action system)
 */
export interface PredictionTrigger {
  triggerId: string
  companyId: string
  triggerType: 'red_flag_detected' | 'milestone_achieved' | 'market_opportunity' | 'urgent_action'
  metric: string
  threshold: number
  currentValue: number
  exceededThreshold: boolean
  recommendedActions: string[]
  boardMeetingRequired: boolean
  investorCommunicationRequired: boolean
  underwriterNotificationRequired: boolean
}

/**
 * Historical IPO data (for training model)
 */
export interface HistoricalIPO {
  companyName: string
  ipoDate: Date
  ipoValuation: number
  finalValuation: number
  sector: string
  revenueAtIpo: number
  revenueGrowthRate: number
  grossMargin: number
  cashRunwayMonths: number
  customerConcentration: number
  ipoSuccess: boolean
  ipoPop: number // % increase on first day
  oneYearPerformance: number // % change in first year
  founderExitPercent: number
  numBoardSeats: number
  numIndependentDirectors: number
  executiveTeamVettingStage: number
  regulatoryApprovalDays: number
  secCommentCount: number
}

/**
 * Cohort metrics (for benchmarking)
 */
export interface CohortMetrics {
  sector: string
  metricName: string
  minValue: number
  p10: number
  p25: number
  p50: number
  p75: number
  p90: number
  maxValue: number
  sampleCount: number
}

/**
 * Real-time data feed
 */
export interface PredictionDataFeed {
  companyId: string
  dataType: 'financial' | 'market' | 'regulatory' | 'investor' | 'competitor'
  metricName: string
  metricValue: string | number | Date
  dataSource: string
  timestamp: Date
  priority: number // 1-10, affects prediction frequency
}

/**
 * Prediction history (track changes over time)
 */
export interface PredictionHistory {
  companyId: string
  predictionDate: Date
  ipOSuccessProbability: number
  valuationMid: number
  recommendedIpoDate: Date
  recommendation: string
  changePercent: number
  reasonForChange: string
}

/**
 * KPI snapshot (for correlation with outcomes)
 */
export interface KpiSnapshot {
  companyId: string
  snapshotDate: Date

  // Financial
  monthlyRevenue: number
  arr: number
  grossMarginPercent: number
  operatingExpensePercent: number
  cashBalance: number
  cashRunwayMonths: number

  // Growth
  revenueGrowthRate: number
  customerGrowthRate: number
  employeeCount: number
  revenuePerEmployee: number

  // Health
  customerChurnPercent: number
  cacPaybackMonths: number
  netRetentionRate: number

  // Market
  marketCapEstimate: number
  valuationEstimate: number
  comparableMultiples: number
}

/**
 * Prediction input (what we need to make a prediction)
 */
export interface PredictionInput {
  companyId: string
  companyName: string
  sector: string

  // Financial data
  currentRevenue: number
  revenueGrowthRate: number
  grossMargin: number
  operatingExpensePercent: number
  cashBalance: number
  customerChurn: number
  cac: number
  cacPayback: number

  // Team data
  ceoExperience: number // 1-10 scale
  cfoExperience: number
  boardIndependence: number // %
  hasAuditCommittee: boolean

  // Market data
  vixLevel: number // Market volatility
  interestRateEnvironment: 'Rising' | 'Stable' | 'Falling'
  competitorFundingActivity: 'High' | 'Medium' | 'Low'
  yourCompetitivePosition: 'Leader' | 'Strong' | 'Competitive'

  // Regulatory data
  hasDataPrivacyCompliance: boolean
  hasAuditHistory: boolean
  relatedPartyTransactions: boolean

  // Customer data
  customerConcentration: number // % from largest customer
  numLargeCustomers: number
  netRetentionRate: number
}

/**
 * Alert/action system
 */
export interface PredictionAlert {
  alertId: string
  companyId: string
  severity: 'Critical' | 'High' | 'Medium' | 'Low'
  alertType: string
  message: string
  recommendation: string
  affectedMetrics: string[]
  timeToAction: number // days
  timestamp: Date
  resolved: boolean
}
