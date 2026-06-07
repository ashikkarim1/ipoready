/**
 * Liquidity Calculator
 * Estimates bid-ask spread, daily volume, and turnover ratio
 */

import { CompanyParameters, HistoricalIPO } from '@/types/ipo-simulator'

export interface LiquidityMetrics {
  bidAskSpread: number // percentage
  dailyVolume: number // shares
  turnoverRatio: number // annualized %
  percentile: number // vs peers
}

/**
 * Calculate liquidity metrics based on company parameters and peer data
 */
export function calculateLiquidity(
  params: CompanyParameters,
  peerIpos: HistoricalIPO[]
): LiquidityMetrics {
  if (!peerIpos || peerIpos.length === 0) {
    return getDefaultLiquidityMetrics()
  }

  // Filter peers by similar float size
  const similarPeers = peerIpos.filter(
    (ipo) =>
      Math.abs(ipo.float - params.float) < 10
  )

  if (similarPeers.length === 0) {
    return getDefaultLiquidityMetrics()
  }

  // Calculate base spread from peer median
  const peerSpreads = similarPeers
    .map((p) => p.bidAskSpread)
    .filter((s) => s !== null)
    .sort((a, b) => a - b)

  const medianSpread = peerSpreads[Math.floor(peerSpreads.length / 2)] || 0.5

  // Adjust spread based on governance (better governance = tighter spread)
  const governanceBonus = (params.boardIndependence - 60) * 0.01 // 60% = baseline
  const adjustedSpread = Math.max(0.1, medianSpread * (1 - governanceBonus))

  // Calculate daily volume
  const peerVolumes = similarPeers
    .map((p) => p.dailyVolume)
    .filter((v) => v > 0)
    .sort((a, b) => a - b)

  const medianVolume = peerVolumes[Math.floor(peerVolumes.length / 2)] || 1000000

  // Growth premium: faster growing companies have higher volume
  const growthPremium = Math.min(params.growthRate / 50, 1.5) // Cap at 1.5x
  const adjustedVolume = medianVolume * growthPremium

  // Turnover = (annual volume / float)
  const floatShares = (params.raiseAmount * 1000000) / 20 // Estimate based on raise
  const annualVolume = adjustedVolume * 250 // Trading days per year
  const turnover = (annualVolume / floatShares) * 100

  // Calculate percentile vs peers
  const percentile = calculatePercentile(medianSpread, peerSpreads)

  return {
    bidAskSpread: Math.round(adjustedSpread * 100) / 100,
    dailyVolume: Math.round(adjustedVolume),
    turnoverRatio: Math.round(turnover * 100) / 100,
    percentile,
  }
}

function getDefaultLiquidityMetrics(): LiquidityMetrics {
  return {
    bidAskSpread: 0.5,
    dailyVolume: 1000000,
    turnoverRatio: 12,
    percentile: 50,
  }
}

function calculatePercentile(value: number, sortedArray: number[]): number {
  if (sortedArray.length === 0) return 50

  // For spreads: lower is better (tighter spread = better liquidity)
  // So we invert the percentile calculation
  const rank = sortedArray.filter((v) => v > value).length
  return Math.round((rank / sortedArray.length) * 100)
}
