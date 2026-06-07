/**
 * Stock Trajectory Simulator
 * Projects stock price performance from IPO through 12 months
 */

import { CompanyParameters, HistoricalIPO, StockPriceProjection } from '@/types/ipo-simulator'

/**
 * Simulate stock price trajectory for conservative, base, and bull cases
 */
export function simulateStockTrajectory(
  params: CompanyParameters,
  peerIpos: HistoricalIPO[]
): {
  ipoPrice: number
  conservative: StockPriceProjection
  baseCase: StockPriceProjection
  bullCase: StockPriceProjection
} {
  // Calculate IPO price
  const ipoPrice = calculateIPOPrice(params)

  // Get peer performance data
  const peerPerformance = extractPeerPerformance(peerIpos, params)

  // Generate scenarios
  return {
    ipoPrice,
    conservative: generateScenario(ipoPrice, peerPerformance, 'conservative'),
    baseCase: generateScenario(ipoPrice, peerPerformance, 'base'),
    bullCase: generateScenario(ipoPrice, peerPerformance, 'bull'),
  }
}

function calculateIPOPrice(params: CompanyParameters): number {
  // Price = Valuation / Total shares outstanding
  // Simplified: assume total shares based on raise and valuation
  const totalCapital = params.valuation * 1_000_000_000 // Convert billions to dollars
  const totalShares = totalCapital / 20 // Assume $20 per share baseline
  const price = totalCapital / totalShares

  return Math.round(price * 100) / 100
}

function extractPeerPerformance(
  peerIpos: HistoricalIPO[],
  params: CompanyParameters
): {
  firstDayPop: number[]
  day30: number[]
  day90: number[]
  day180: number[]
  day365: number[]
} {
  const filtered = peerIpos.filter(
    (p) =>
      p.sector === params.sector &&
      p.valuation > params.valuation * 0.5 &&
      p.valuation < params.valuation * 2
  )

  return {
    firstDayPop: filtered.map((p) => p.first_day_pop_percentage || 0),
    day30: filtered.map((p) => p.day_30_performance_percentage || 0),
    day90: filtered.map((p) => p.day_90_performance_percentage || 0),
    day180: filtered.map((p) => p.day_180_performance_percentage || 0),
    day365: filtered.map((p) => p.day_365_performance_percentage || 0),
  }
}

function generateScenario(
  ipoPrice: number,
  peerPerformance: any,
  scenario: 'conservative' | 'base' | 'bull'
): StockPriceProjection {
  const multiplier = getScenarioMultiplier(scenario)

  const firstDayPop = getMedian(peerPerformance.firstDayPop) * multiplier
  const day30 = getMedian(peerPerformance.day30) * multiplier
  const day90 = getMedian(peerPerformance.day90) * multiplier
  const day180 = getMedian(peerPerformance.day180) * multiplier
  const day365 = getMedian(peerPerformance.day365) * multiplier

  return {
    day1: Math.round(ipoPrice * (1 + firstDayPop / 100) * 100) / 100,
    day1Pop: Math.round(firstDayPop * 100) / 100,
    day30: Math.round(ipoPrice * (1 + day30 / 100) * 100) / 100,
    day30Change: Math.round(day30 * 100) / 100,
    day90: Math.round(ipoPrice * (1 + day90 / 100) * 100) / 100,
    day90Change: Math.round(day90 * 100) / 100,
    day180: Math.round(ipoPrice * (1 + day180 / 100) * 100) / 100,
    day180Change: Math.round(day180 * 100) / 100,
    day365: Math.round(ipoPrice * (1 + day365 / 100) * 100) / 100,
    day365Change: Math.round(day365 * 100) / 100,
  }
}

function getScenarioMultiplier(scenario: string): number {
  switch (scenario) {
    case 'conservative':
      return 0.5 // Half the peer performance
    case 'base':
      return 1.0 // Match peer performance
    case 'bull':
      return 1.4 // 40% better than peers
    default:
      return 1.0
  }
}

function getMedian(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}
