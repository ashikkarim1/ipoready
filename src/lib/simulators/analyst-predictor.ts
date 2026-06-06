/**
 * Analyst Coverage Predictor
 * Estimates analyst count and rating distribution
 */

import { CompanyParameters, HistoricalIPO } from '@/types/ipo-simulator'

export interface AnalystMetrics {
  predictedCount: number
  buyRatings: number
  holdRatings: number
  sellRatings: number
  targetPriceMin: number
  targetPriceMax: number
  percentile: number
}

/**
 * Predict analyst coverage based on company metrics and peer data
 */
export function predictAnalystCoverage(
  params: CompanyParameters,
  peerIpos: HistoricalIPO[]
): AnalystMetrics {
  if (!peerIpos || peerIpos.length === 0) {
    return getDefaultAnalystMetrics()
  }

  // Filter peers by similar sector and valuation
  const similarPeers = peerIpos.filter(
    (ipo) =>
      ipo.sector === params.sector &&
      Math.abs(ipo.pre_money_valuation_billions - params.valuation) < params.valuation * 0.5
  )

  if (similarPeers.length === 0) {
    return getDefaultAnalystMetrics()
  }

  // Base analyst count from peers
  const peerCounts = similarPeers.map((p) => p.analyst_count).filter((c) => c > 0)
  const medianCount = peerCounts[Math.floor(peerCounts.length / 2)] || 12

  // Growth premium: faster growing companies attract more analysts
  const growthMultiplier = 1 + Math.min((params.growthRate - 15) / 100, 0.5) // 15% = baseline

  // Governance premium: better governance attracts analysts
  const governanceMultiplier = 1 + (params.boardIndependence - 60) * 0.005 // 60% = baseline

  const predictedCount = Math.round(medianCount * growthMultiplier * governanceMultiplier)

  // Rating distribution based on growth and governance
  // High growth + good governance = more bullish ratings
  const bullishFraction = 0.5 + (growthMultiplier - 1) * 0.2 + (governanceMultiplier - 1) * 0.1
  const bearishFraction = 0.15 - (growthMultiplier - 1) * 0.05
  const holdFraction = 1 - bullishFraction - bearishFraction

  const buyRatings = Math.round(predictedCount * bullishFraction)
  const sellRatings = Math.round(predictedCount * bearishFraction)
  const holdRatings = predictedCount - buyRatings - sellRatings

  // Target price based on valuation
  const ipoPrice = params.valuation / (params.float / 100)
  const targetLow = ipoPrice * 0.9
  const targetHigh = ipoPrice * 1.4

  // Calculate percentile
  const percentile = calculatePercentile(medianCount, peerCounts)

  return {
    predictedCount,
    buyRatings,
    holdRatings,
    sellRatings,
    targetPriceMin: Math.round(targetLow * 100) / 100,
    targetPriceMax: Math.round(targetHigh * 100) / 100,
    percentile,
  }
}

function getDefaultAnalystMetrics(): AnalystMetrics {
  return {
    predictedCount: 12,
    buyRatings: 7,
    holdRatings: 4,
    sellRatings: 1,
    targetPriceMin: 18,
    targetPriceMax: 25,
    percentile: 50,
  }
}

function calculatePercentile(value: number, sortedArray: number[]): number {
  if (sortedArray.length === 0) return 50

  // For analyst count: higher is better
  const rank = sortedArray.filter((v) => v < value).length
  return Math.round((rank / sortedArray.length) * 100)
}
