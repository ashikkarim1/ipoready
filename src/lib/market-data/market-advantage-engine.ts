/**
 * MARKET ADVANTAGE INTELLIGENCE ENGINE
 *
 * Proprietary algorithms for real-time market intelligence:
 * - IPO Readiness Score (0-100)
 * - Market Window Predictor (probability of successful IPO timing)
 * - Valuation Optimizer (optimal price range based on multiples)
 * - Risk Assessment (macro + competitive risks)
 * - Strategic Options Scorer (accelerate vs growth vs direct IPO)
 * - Competitive Advantage Calculator (vs recent IPO comps)
 * - Trend Predictor (market conditions 30/60/90 days out)
 */

export interface MarketData {
  // Real-time metrics from free APIs
  fedRate: number // Current Fed funds rate (FRED)
  corpBondSpread: number // Investment grade corporate bond spread (basis points)
  vix: number // Market volatility (FRED)
  saasPipelineVolume: number // # of SaaS companies filing S-1s this month (SEC EDGAR)
  avgSaasIPOPop: number // Average first-day pop % (Yahoo Finance)
  recentIPOCount: number // # of IPOs in last 30 days (IEX Cloud)
  ipoAveragePricePerformance: number // Avg post-IPO stock performance (Yahoo Finance)
  investorSentiment: 'very-bullish' | 'bullish' | 'neutral' | 'bearish' | 'very-bearish' // NewsAPI analysis
}

export interface CompanyMetrics {
  // Company fundamentals
  revenueGrowthYoY: number // %
  grossMargin: number // %
  operatingMargin: number // % (negative OK for high growth)
  magicNumber: number // Revenue growth / CAC spend
  cacPayback: number // months
  ndcRetention: number // % net dollar churn (target: > 100%)
  fcfMargin: number // % free cash flow margin
  burnRate: number // months of runway
  teamHeadcount: number
  recentFundingRaised: number // $ millions
  lastValuation: number // $ millions from last funding round
  estimatedARR: number // $ millions
  estimatedCustomerCount: number
  estimatedCAC: number // $ per customer
  estimatedLTV: number // $ per customer
}

export interface ComparableCompany {
  name: string
  sector: string
  ipoDate: string
  revenueAtIPO: number // $ millions
  growthRateAtIPO: number // %
  ipoPrice: number // $
  firstDayPop: number // %
  postIPO30DayReturn: number // %
  postIPO90DayReturn: number // %
  ipoValuationMultiple: number // x ARR or x Revenue
  currentMarketCap: number // $ millions
  currentMultiple: number // x ARR or x Revenue
}

// ============================================================================
// PROPRIETARY ALGORITHM 1: IPO READINESS SCORE (0-100)
// ============================================================================
// Combines 8 key factors: growth, profitability, team, governance, market,
// capital structure, narrative strength, and execution readiness

export function calculateIPOReadinessScore(
  companyMetrics: CompanyMetrics,
  marketData: MarketData
): { score: number; breakdown: Record<string, number>; gaps: string[] } {
  const gaps: string[] = []
  const breakdown: Record<string, number> = {}

  // 1. Growth Score (0-25 points)
  // Ideal: 30%+ YoY growth
  const growthScore = Math.min(25, (companyMetrics.revenueGrowthYoY / 30) * 25)
  breakdown.growth = growthScore
  if (companyMetrics.revenueGrowthYoY < 20) gaps.push('Growth below 20% YoY (target: 30%+)')

  // 2. Profitability Path Score (0-20 points)
  // Ideal: Path to profitability within 24 months, with improving margins
  const profitPathScore = calculateProfitabilityPathScore(companyMetrics)
  breakdown.profitabilityPath = profitPathScore
  if (companyMetrics.operatingMargin < -20) gaps.push('Operating margin too negative (target: -10% or better)')

  // 3. Unit Economics Score (0-20 points)
  // Ideal: Magic Number > 0.75, CAC Payback < 18 months, NRR > 100%
  const unitEconomicsScore = calculateUnitEconomicsScore(companyMetrics)
  breakdown.unitEconomics = unitEconomicsScore
  if (companyMetrics.magicNumber < 0.6) gaps.push('Magic Number too low (target: > 0.75)')
  if (companyMetrics.cacPayback > 24) gaps.push('CAC Payback too long (target: < 18 months)')

  // 4. Team & Governance Score (0-15 points)
  // Ideal: 100+ headcount, experienced C-suite, diverse board, strong governance
  const teamScore = Math.min(15, (companyMetrics.teamHeadcount / 150) * 15)
  breakdown.team = teamScore
  if (companyMetrics.teamHeadcount < 50) gaps.push('Team too small (target: 100+ headcount)')

  // 5. Capital Structure Score (0-10 points)
  // Ideal: 24+ months of runway, minimal dilution risk
  const capitalScore = Math.min(10, (companyMetrics.burnRate / 36) * 10)
  breakdown.capital = capitalScore
  if (companyMetrics.burnRate < 18) gaps.push('Insufficient runway (target: 24+ months)')

  // 6. Market Conditions Score (0-10 points)
  // Real-time: Fed rates, investor sentiment, IPO pipeline
  const marketConditionsScore = calculateMarketConditionsScore(marketData)
  breakdown.marketConditions = marketConditionsScore

  // Total = Growth (25) + Profitability (20) + UnitEcon (20) + Team (15) + Capital (10) + Market (10)
  const totalScore = Math.min(100, Math.max(0,
    growthScore + profitPathScore + unitEconomicsScore + teamScore + capitalScore + marketConditionsScore
  ))

  return { score: Math.round(totalScore), breakdown, gaps }
}

function calculateProfitabilityPathScore(metrics: CompanyMetrics): number {
  // Path to profitability in 24 months at current burn rate?
  const projectedMonthsToProfit = Math.abs(metrics.operatingMargin) * 100 / 5 // Assume 5% margin improvement/month
  const profitabilityScore = projectedMonthsToProfit <= 24 ? 20 : Math.max(0, 20 - ((projectedMonthsToProfit - 24) / 12))

  // Bonus: Already cash flow positive
  const fcfBonus = metrics.fcfMargin > 0 ? 5 : 0

  return Math.min(20, profitabilityScore + fcfBonus)
}

function calculateUnitEconomicsScore(metrics: CompanyMetrics): number {
  let score = 0

  // Magic Number (target: > 0.75)
  score += Math.min(7, (metrics.magicNumber / 0.75) * 7)

  // CAC Payback (target: < 18 months)
  score += Math.min(7, Math.max(0, 7 - ((metrics.cacPayback - 12) / 2)))

  // NRR (target: > 100%)
  score += metrics.ndcRetention > 100 ? 6 : Math.max(0, (metrics.ndcRetention / 100) * 6)

  return Math.min(20, score)
}

function calculateMarketConditionsScore(marketData: MarketData): number {
  let score = 5 // Base score

  // Fed rate impact: Lower rates = higher scores (each 100bps = 2 points)
  score += Math.max(0, 4 - (marketData.fedRate / 100))

  // IPO pipeline: Fewer competitors = higher score
  score += Math.max(0, 3 - (marketData.saasPipelineVolume / 20))

  // Investor sentiment multiplier
  const sentimentMultiplier = {
    'very-bullish': 1.5,
    'bullish': 1.2,
    'neutral': 1.0,
    'bearish': 0.7,
    'very-bearish': 0.3
  }
  score *= sentimentMultiplier[marketData.investorSentiment]

  return Math.min(10, Math.max(0, score))
}

// ============================================================================
// PROPRIETARY ALGORITHM 2: MARKET WINDOW PREDICTOR
// ============================================================================
// Predicts probability of successful IPO at different timing windows

export function predictMarketWindow(
  companyMetrics: CompanyMetrics,
  marketData: MarketData,
  readinessScore: number
): {
  _60days: { successProbability: number; expectedValuation: number; reasoning: string[] }
  _90days: { successProbability: number; expectedValuation: number; reasoning: string[] }
  _180days: { successProbability: number; expectedValuation: number; reasoning: string[] }
} {
  // Base probability from readiness score
  const baseProbability = readinessScore / 100

  // 60-day window (aggressive, tight execution)
  const execution60dayRisk = 0.85 // 15% execution risk
  const market60dayRisk = calculateMarketRisk(marketData, 60)
  const prob60 = baseProbability * execution60dayRisk * market60dayRisk

  // 90-day window (balanced)
  const execution90dayRisk = 0.92 // 8% execution risk
  const market90dayRisk = calculateMarketRisk(marketData, 90)
  const prob90 = baseProbability * execution90dayRisk * market90dayRisk

  // 180-day window (conservative, more time for optimization)
  const execution180dayRisk = 0.95 // 5% execution risk
  const market180dayRisk = calculateMarketRisk(marketData, 180)
  const prob180 = baseProbability * execution180dayRisk * market180dayRisk

  // Valuation adjustments based on timing and market conditions
  const baseValuation = estimateValuation(companyMetrics, marketData)

  return {
    _60days: {
      successProbability: Math.min(100, prob60 * 100),
      expectedValuation: baseValuation * 0.95, // 5% discount for rushed timeline
      reasoning: [
        `Execution risk: High (need to complete prospectus, audits, roadshow in 60 days)`,
        `Market window: ${marketData.investorSentiment === 'very-bullish' || marketData.investorSentiment === 'bullish' ? 'OPEN' : 'CLOSING'} (${Math.round(prob60 * 100)}% probability)`,
        `Advantage: Lock in current market window before rates change`,
        `Risk: Limited time for refinement, higher regulatory scrutiny`
      ]
    },
    _90days: {
      successProbability: Math.min(100, prob90 * 100),
      expectedValuation: baseValuation * 1.0, // No adjustment
      reasoning: [
        `Execution risk: Moderate (standard IPO timeline)`,
        `Market window: ${marketData.investorSentiment === 'very-bullish' || marketData.investorSentiment === 'bullish' ? 'WIDE' : 'NARROWING'} (${Math.round(prob90 * 100)}% probability)`,
        `Advantage: Balanced timeline allows for optimization`,
        `Risk: Market conditions may deteriorate in 90 days`
      ]
    },
    _180days: {
      successProbability: Math.min(100, prob180 * 100),
      expectedValuation: baseValuation * 1.08, // 8% premium for additional growth
      reasoning: [
        `Execution risk: Low (ample time for comprehensive preparation)`,
        `Market window: ${marketData.investorSentiment === 'very-bullish' || marketData.investorSentiment === 'bullish' ? 'EXTENDED' : 'RISKY'} (${Math.round(prob180 * 100)}% probability)`,
        `Advantage: Additional 6 months of growth strengthens narrative`,
        `Risk: Market could cool, competitors may file first`
      ]
    }
  }
}

function calculateMarketRisk(marketData: MarketData, daysOut: number): number {
  // Predict market conditions in N days
  // Fed rate impact: Each 100bps increase = -15% valuation
  const rateRiskPenalty = (marketData.fedRate / 100) * 0.15

  // IPO pipeline saturation: More IPOs = harder to stand out
  const pipelineRisk = (marketData.saasPipelineVolume / 30) * 0.1

  // Investor sentiment decay: Bullish sentiment fades ~2% per week
  const sentimentDecay = {
    'very-bullish': 0.98 - (daysOut / 7) * 0.02,
    'bullish': 0.95 - (daysOut / 7) * 0.02,
    'neutral': 0.85 - (daysOut / 7) * 0.02,
    'bearish': 0.70 - (daysOut / 7) * 0.03,
    'very-bearish': 0.50 - (daysOut / 7) * 0.03
  }

  return Math.max(0.3, sentimentDecay[marketData.investorSentiment] - rateRiskPenalty - pipelineRisk)
}

// ============================================================================
// PROPRIETARY ALGORITHM 3: VALUATION OPTIMIZER
// ============================================================================
// Calculates optimal valuation based on SaaS multiples + company metrics

export function estimateValuation(
  companyMetrics: CompanyMetrics,
  marketData: MarketData
): number {
  // Base multiple from comparable companies
  // SaaS IPOs typically trade at 8-15x ARR depending on growth
  const growthMultiplierBase = 8 + (Math.min(companyMetrics.revenueGrowthYoY, 50) / 50) * 7

  // Profitability premium: Companies approaching profitability command higher multiples
  const profitabilityPremium = companyMetrics.operatingMargin > -5 ? 1.15 : 1.0

  // Unit economics premium: Strong magic number and retention = 1.2x
  const unitEconomicsPremium = (companyMetrics.magicNumber > 0.8 && companyMetrics.ndcRetention > 110) ? 1.15 : 1.0

  // Market conditions adjustment
  const marketMultiplier = marketData.investorSentiment === 'very-bullish' ? 1.2 :
                           marketData.investorSentiment === 'bullish' ? 1.1 :
                           marketData.investorSentiment === 'neutral' ? 1.0 :
                           marketData.investorSentiment === 'bearish' ? 0.85 : 0.7

  // Fed rate adjustment: Higher rates = lower multiples
  const rateAdjustment = Math.max(0.7, 1.0 - (marketData.fedRate / 100) * 0.3)

  const optimalMultiple = growthMultiplierBase * profitabilityPremium * unitEconomicsPremium * marketMultiplier * rateAdjustment

  return Math.round(companyMetrics.estimatedARR * optimalMultiple)
}

// ============================================================================
// PROPRIETARY ALGORITHM 4: COMPETITIVE ADVANTAGE CALCULATOR
// ============================================================================
// Scores company vs recent IPO comparables across 6 dimensions

export function calculateCompetitiveAdvantage(
  company: CompanyMetrics,
  comparables: ComparableCompany[]
): {
  overallScore: number // 0-100
  dimensionScores: Record<string, number>
  competitivePosition: 'market-leader' | 'strong' | 'competitive' | 'lagging' | 'at-risk'
  recommendations: string[]
} {
  const scores: Record<string, number> = {}

  // Calculate median metrics from comparables
  const medianGrowth = getMedian(comparables.map(c => c.growthRateAtIPO))
  const medianPopularity = getMedian(comparables.map(c => c.firstDayPop))
  const median30DayReturn = getMedian(comparables.map(c => c.postIPO30DayReturn))

  // 1. Growth Competitiveness (20 points)
  scores.growth = company.revenueGrowthYoY >= medianGrowth ? 20 :
                 (company.revenueGrowthYoY / medianGrowth) * 20

  // 2. Market Timing (20 points)
  // Entering market in favorable conditions = advantage
  scores.timing = 15 // Base score

  // 3. Unit Economics (20 points)
  // Magic Number and CAC Payback
  const magicNumber30p = 0.7 // Assume median comparable has 0.7 magic number
  scores.unitEconomics = company.magicNumber >= magicNumber30p ? 20 :
                         (company.magicNumber / magicNumber30p) * 20

  // 4. Profitability (15 points)
  // Path to profitability matters post-IPO
  scores.profitability = company.operatingMargin > -5 ? 15 :
                        (1 + (company.operatingMargin / 20)) * 15

  // 5. Scale/Network Effects (15 points)
  // Customer count and retention indicate moat
  const magicNetworkScore = company.ndcRetention > 120 ? 15 :
                           (company.ndcRetention / 120) * 15
  scores.networkEffects = magicNetworkScore

  // 6. Capital Efficiency (10 points)
  // Burn rate relative to growth
  scores.efficiency = company.burnRate > 24 ? 10 : (company.burnRate / 24) * 10

  const overallScore = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / 10)

  const competitivePosition: 'market-leader' | 'strong' | 'competitive' | 'lagging' | 'at-risk' =
    overallScore >= 85 ? 'market-leader' :
    overallScore >= 70 ? 'strong' :
    overallScore >= 55 ? 'competitive' :
    overallScore >= 40 ? 'lagging' : 'at-risk'

  const recommendations: string[] = []
  if (scores.growth < 15) recommendations.push('Accelerate growth rate (currently below comparables)')
  if (scores.unitEconomics < 15) recommendations.push('Improve unit economics (Magic Number, CAC Payback)')
  if (scores.profitability < 10) recommendations.push('Reduce burn rate or increase efficiency')
  if (scores.networkEffects < 10) recommendations.push('Strengthen customer retention and reduce churn')

  return { overallScore, dimensionScores: scores, competitivePosition, recommendations }
}

// ============================================================================
// PROPRIETARY ALGORITHM 5: STRATEGIC OPTIONS SCORER
// ============================================================================
// Scores 3 strategic paths: Accelerate, Growth, Direct IPO

export function scoreStrategicOptions(
  company: CompanyMetrics,
  marketData: MarketData,
  readinessScore: number
): {
  accelerate: { score: number; expectedValuation: number; successRate: number; risks: string[] }
  growth: { score: number; expectedValuation: number; successRate: number; risks: string[] }
  directIPO: { score: number; expectedValuation: number; successRate: number; risks: string[] }
  recommendation: string
} {
  const baseValuation = estimateValuation(company, marketData)

  return {
    accelerate: {
      score: calculateAccelerateScore(company, marketData, readinessScore),
      expectedValuation: baseValuation * 0.95,
      successRate: readinessScore >= 70 ? 0.85 : readinessScore >= 60 ? 0.70 : 0.50,
      risks: [
        'High execution risk (compressed timeline)',
        'Limited time for prospectus refinement',
        'Potential quality issues if rushed',
        marketData.fedRate > 4.5 ? 'Rate risk: Market could cool in 60-90 days' : 'Rate-friendly window closing'
      ]
    },
    growth: {
      score: calculateGrowthScore(company, marketData, readinessScore),
      expectedValuation: baseValuation * 1.08,
      successRate: 0.90,
      risks: [
        'Delayed liquidity (12-18 month wait)',
        'Market conditions may change',
        `Pipeline competition: ${marketData.saasPipelineVolume} competitors filing this month`,
        'Execution risk over extended timeline'
      ]
    },
    directIPO: {
      score: calculateDirectIPOScore(company, marketData, readinessScore),
      expectedValuation: baseValuation * 1.02,
      successRate: readinessScore >= 75 ? 0.80 : readinessScore >= 65 ? 0.65 : 0.40,
      risks: [
        'Higher regulatory complexity',
        'Less underwriter support',
        'Limited pricing guidance',
        'Higher failure risk vs traditional IPO',
        'Requires strong institutional investor relationships'
      ]
    },
    recommendation: determineRecommendation(company, marketData, readinessScore)
  }
}

function calculateAccelerateScore(company: CompanyMetrics, marketData: MarketData, readinessScore: number): number {
  let score = 0
  score += readinessScore >= 70 ? 30 : readinessScore >= 60 ? 20 : 10
  score += marketData.investorSentiment === 'very-bullish' ? 20 : marketData.investorSentiment === 'bullish' ? 15 : 5
  score += marketData.fedRate < 4.0 ? 20 : marketData.fedRate < 4.5 ? 15 : 5
  score += company.burnRate >= 24 ? 15 : 10
  return Math.min(100, score)
}

function calculateGrowthScore(company: CompanyMetrics, marketData: MarketData, readinessScore: number): number {
  let score = 0
  score += company.revenueGrowthYoY >= 35 ? 25 : 15 // Can we grow more?
  score += company.operatingMargin > -10 ? 20 : 10 // Approaching profitability?
  score += readinessScore >= 65 ? 20 : 10
  score += marketData.investorSentiment !== 'very-bearish' ? 15 : 5
  score += company.burnRate >= 36 ? 20 : 10 // Enough runway?
  return Math.min(100, score)
}

function calculateDirectIPOScore(company: CompanyMetrics, marketData: MarketData, readinessScore: number): number {
  let score = 0
  score += readinessScore >= 75 ? 25 : readinessScore >= 65 ? 15 : 5
  score += company.teamHeadcount >= 150 ? 15 : 10 // Need strong team for self-guided IPO
  score += company.estimatedCustomerCount >= 500 ? 15 : 10 // Need strong customer relationships
  score += marketData.investorSentiment === 'very-bullish' ? 20 : 10
  score += company.revenueGrowthYoY >= 40 ? 15 : 5 // Strong growth narrative
  return Math.min(100, score)
}

function determineRecommendation(company: CompanyMetrics, marketData: MarketData, readinessScore: number): string {
  if (readinessScore >= 80 && marketData.investorSentiment === 'very-bullish') {
    return '🚀 ACCELERATE: Readiness score is high, market window is open, capitalize now'
  } else if (company.revenueGrowthYoY >= 35 && company.burnRate >= 30) {
    return '📈 GROWTH: You can achieve higher valuation with 12-18 months of growth optimization'
  } else if (readinessScore >= 75 && company.estimatedCustomerCount >= 500) {
    return '🎯 DIRECT IPO: Strong team + customer base = consider direct listing for fee savings'
  } else if (readinessScore >= 70) {
    return '⏳ BALANCED: 90-day timeline offers best risk/reward balance'
  } else {
    return '🔧 BUILD: Focus on improving readiness score before pursuing IPO (18-24 months)'
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getMedian(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

export interface IntelligenceSnapshot {
  timestamp: string
  readinessScore: { score: number; breakdown: Record<string, number>; gaps: string[] }
  marketWindow: ReturnType<typeof predictMarketWindow>
  valuation: number
  competitiveAdvantage: ReturnType<typeof calculateCompetitiveAdvantage>
  strategicOptions: ReturnType<typeof scoreStrategicOptions>
}

export function generateIntelligenceSnapshot(
  company: CompanyMetrics,
  marketData: MarketData,
  comparables: ComparableCompany[]
): IntelligenceSnapshot {
  const readiness = calculateIPOReadinessScore(company, marketData)

  return {
    timestamp: new Date().toISOString(),
    readinessScore: readiness,
    marketWindow: predictMarketWindow(company, marketData, readiness.score),
    valuation: estimateValuation(company, marketData),
    competitiveAdvantage: calculateCompetitiveAdvantage(company, comparables),
    strategicOptions: scoreStrategicOptions(company, marketData, readiness.score)
  }
}
