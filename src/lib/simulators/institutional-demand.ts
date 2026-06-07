/**
 * Institutional Demand Modeler
 * Estimates institutional allocation and fund category breakdown
 */

import { CompanyParameters, HistoricalIPO } from '@/types/ipo-simulator'

export interface InstitutionalMetrics {
  floatAllocation: number // percentage
  oversubscriptionRatio: number
  growthFunds: number // % of institutional allocation
  valueFunds: number
  momentumFunds: number
  demandLevel: 'VERY_HIGH' | 'HIGH' | 'MODERATE' | 'LOW'
  percentile: number
}

/**
 * Model institutional demand based on company characteristics
 */
export function modelInstitutionalDemand(
  params: CompanyParameters,
  peerIpos: HistoricalIPO[]
): InstitutionalMetrics {
  if (!peerIpos || peerIpos.length === 0) {
    return getDefaultInstitutionalMetrics()
  }

  // Filter peers by similar characteristics
  const similarPeers = peerIpos.filter(
    (ipo) =>
      ipo.sector === params.sector &&
      Math.abs(ipo.float - params.float) < 10 &&
      ipo.valuation > params.valuation * 0.5 &&
      ipo.valuation < params.valuation * 2
  )

  if (similarPeers.length === 0) {
    return getDefaultInstitutionalMetrics()
  }

  // Base allocation from peers
  const peerAllocations = similarPeers
    .map((p) => p.institutionalAllocation)
    .filter((a) => a > 0)
  const medianAllocation = peerAllocations[Math.floor(peerAllocations.length / 2)] || 0.4

  // Adjust based on governance
  const governanceFactor = 1 + (params.boardIndependence - 60) * 0.01
  const adjustedAllocation = Math.min(medianAllocation * governanceFactor, 0.9)

  // Adjust based on growth
  const growthFactor = Math.min(1 + (params.growthRate - 15) / 100, 1.5)

  // Demand level calculation
  const demandLevel = calculateDemandLevel(
    adjustedAllocation,
    governanceFactor,
    growthFactor
  )

  // Oversubscription ratio
  const baseOversubscription = similarPeers
    .map((p) => p.oversubscriptionRatio)
    .filter((r) => r > 0)
    .reduce((a, b) => a + b, 0) / similarPeers.length || 2.0

  const oversubscriptionRatio = baseOversubscription * growthFactor

  // Fund category breakdown
  const growthPercentage = calculateFundBreakdown(params.growthRate, 'growth')
  const valuePercentage = calculateFundBreakdown(params.growthRate, 'value')
  const momentumPercentage = 100 - growthPercentage - valuePercentage

  // Percentile
  const percentile = calculatePercentile(medianAllocation, peerAllocations)

  return {
    floatAllocation: Math.round(adjustedAllocation * 100 * 100) / 100, // Convert to %
    oversubscriptionRatio: Math.round(oversubscriptionRatio * 100) / 100,
    growthFunds: Math.round(growthPercentage),
    valueFunds: Math.round(valuePercentage),
    momentumFunds: Math.round(momentumPercentage),
    demandLevel,
    percentile,
  }
}

function calculateDemandLevel(
  allocation: number,
  governanceFactor: number,
  growthFactor: number
): 'VERY_HIGH' | 'HIGH' | 'MODERATE' | 'LOW' {
  const score = allocation * governanceFactor * growthFactor

  if (score > 0.65) return 'VERY_HIGH'
  if (score > 0.50) return 'HIGH'
  if (score > 0.35) return 'MODERATE'
  return 'LOW'
}

function calculateFundBreakdown(growthRate: number, fundType: string): number {
  // Growth-focused companies attract more growth funds
  if (fundType === 'growth') {
    return Math.min(25 + (growthRate - 15), 60)
  }
  if (fundType === 'value') {
    return Math.max(15, 35 - (growthRate - 15) / 2)
  }
  return 50
}

function getDefaultInstitutionalMetrics(): InstitutionalMetrics {
  return {
    floatAllocation: 65,
    oversubscriptionRatio: 3.2,
    growthFunds: 40,
    valueFunds: 25,
    momentumFunds: 35,
    demandLevel: 'HIGH',
    percentile: 50,
  }
}

function calculatePercentile(value: number, sortedArray: number[]): number {
  if (sortedArray.length === 0) return 50

  // Higher allocation is better
  const rank = sortedArray.filter((v) => v < value).length
  return Math.round((rank / sortedArray.length) * 100)
}
