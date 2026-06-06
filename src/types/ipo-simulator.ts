/**
 * IPO Simulator Type Definitions
 * Core types for Capital Markets Digital Twin™
 */

// INPUT: Company Parameters
export interface CompanyParameters {
  // Capital Structure
  float: number // 15-40 (percentage)
  raiseAmount: number // in millions
  valuation: number // in billions (pre-money)

  // Board Composition
  boardSize: number // 5-11
  boardIndependence: number // 30-100 (percentage)
  boardDiversity: number // 0-100 (percentage)

  // Ownership
  insiderOwnership: number // 0-70 (percentage)
  vcOwnership: number // 0-50 (percentage)
  employeeOwnership: number // 0-30 (percentage)
  lockupPeriod: number // 6, 9, 12, 18, 24 (months)

  // Execution
  marketMakerTier: 1 | 2 | 3 // 1=Goldman, 2=Regional, 3=Small
  exchange: 'TSX' | 'TSXV' | 'NYSE' | 'NASDAQ' | 'CSE' | 'ASX' | 'LSE'

  // Company Context
  sector: string // Tech, Healthcare, Energy, etc.
  revenue: number // annual revenue in millions
  growthRate: number // 5-100 (percentage YoY)
  country: string // CA, US, UK, etc.
}

// SIMULATION: Historical Peer IPO Data
export interface HistoricalIPO {
  id: string
  companyName: string
  sector: string
  listingDate: string
  exchange: string

  // IPO Parameters
  float: number // percentage
  raiseAmount: number // millions
  valuation: number // billions

  // Board
  boardSize: number
  boardIndependence: number

  // Ownership
  insiderOwnership: number
  lockupPeriod: number // months

  // Market Maker
  underwriter: string // Goldman, etc.

  // OUTCOMES (what we predict)
  firstDayPop: number // % change
  day30Performance: number // % change
  day90Performance: number // % change
  day180Performance: number // % change
  day365Performance: number // % change

  // Liquidity
  bidAskSpread: number // percentage
  dailyVolume: number // shares
  turnover: number // annualized %

  // Analyst Coverage
  analystCount: number
  buyRatings: number
  holdRatings: number
  sellRatings: number

  // Institutional
  institutionalAllocation: number // percentage of float
  oversubscriptionRatio: number // demand multiple

  // Governance
  governanceScore: number // 0-100

  // Exchange Eligibility
  nasdaqEligible: boolean
  nyseEligible: boolean
  tsxEligible: boolean
  tsxvEligible: boolean
}

// OUTPUT: Simulation Results
export interface SimulationResults {
  companyId: string
  scenarioId: string
  timestamp: string

  // Liquidity Metrics
  liquidity: {
    bidAskSpread: number // percentage
    dailyVolume: number // shares
    turnoverRatio: number // annualized %
    percentile: number // vs peers
  }

  // Analyst Coverage
  analystCoverage: {
    predictedCount: number
    buyRatings: number
    holdRatings: number
    sellRatings: number
    targetPriceMin: number
    targetPriceMax: number
    percentile: number
  }

  // Institutional Demand
  institutionalDemand: {
    floatAllocation: number // percentage
    oversubscriptionRatio: number
    growthFunds: number // percentage allocation
    valueFunds: number
    momentumFunds: number
    demandLevel: 'VERY_HIGH' | 'HIGH' | 'MODERATE' | 'LOW'
    percentile: number
  }

  // Governance
  governanceScore: {
    score: number // 0-100
    boardIndependence: number
    committeeIndependence: number
    insiderOwnership: number
    lockupEffect: number
    percentile: number
  }

  // Exchange Eligibility
  exchangeEligibility: {
    nasdaq: { eligible: boolean; gaps: string[] }
    nyse: { eligible: boolean; gaps: string[] }
    tsx: { eligible: boolean; gaps: string[] }
    tsxv: { eligible: boolean; gaps: string[] }
  }

  // Stock Price Trajectory
  stockTrajectory: {
    ipoPrice: number
    scenarios: {
      conservative: StockPriceProjection
      baseCase: StockPriceProjection
      bullCase: StockPriceProjection
    }
  }

  // Peer Percentiles
  peerPercentiles: {
    liquidity: number
    analystCoverage: number
    institutionalDemand: number
    governance: number
  }
}

export interface StockPriceProjection {
  day1: number // price
  day1Pop: number // % change
  day30: number
  day30Change: number // %
  day90: number
  day90Change: number // %
  day180: number
  day180Change: number // %
  day365: number
  day365Change: number // %
}

// SCENARIO: What-if Analysis
export interface IPOScenario {
  id: string
  companyId: string
  name: string // "Conservative", "Base Case", "Bull Case"
  parameters: CompanyParameters
  results?: SimulationResults
  createdAt: string
  updatedAt: string
}

// OPTIMIZATION: Best Configuration
export interface OptimizationResult {
  currentConfig: CompanyParameters
  recommendedConfig: CompanyParameters
  expectedImprovement: {
    liquidityImprovement: number // %
    analystCoverageImprovement: number // %
    institutionalDemandImprovement: number // %
    predictedStockPerformance: number // %
  }
  confidence: number // 0-1 (how confident in recommendation)
}

// DATABASE: Historical IPO Statistics
export interface IPOStatistics {
  id: string
  companyId: string
  metric: string // 'bid_ask_spread', 'analyst_coverage', etc.
  value: number
  percentile: number // percentile vs peers
  sector: string
  exchange: string
  listingDate: string
}
