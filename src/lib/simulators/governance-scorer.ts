/**
 * Governance Scorer
 * Calculates governance score based on board composition and ownership structure
 */

import { CompanyParameters } from '@/types/ipo-simulator'

export interface GovernanceScore {
  score: number // 0-100
  boardIndependence: number // 0-100
  committeeIndependence: number // 0-100
  insiderOwnership: number // 0-100
  lockupEffect: number // 0-100
  composite: number // 0-100
  percentile: number // vs peers
}

/**
 * Calculate governance score based on company parameters
 */
export function calculateGovernanceScore(params: CompanyParameters): GovernanceScore {
  const boardIndependence = scoreComponent(params.boardIndependence, 60, 100)
  const committeeIndependence = scoreComponent(params.boardIndependence, 50, 100, 1.2)
  const insiderOwnership = scoreComponent(100 - params.insiderOwnership, 40, 60)
  const lockupEffect = scoreComponent(params.lockupPeriod / 2, 10, 24, 0.8) // 12m = baseline

  const composite = Math.round(
    (boardIndependence * 0.3 +
      committeeIndependence * 0.25 +
      insiderOwnership * 0.25 +
      lockupEffect * 0.2) /
      100
  )

  return {
    score: composite,
    boardIndependence,
    committeeIndependence,
    insiderOwnership,
    lockupEffect,
    composite,
    percentile: 50, // Would be calculated vs peer distribution
  }
}

/**
 * Score a component on 0-100 scale
 * @param value The actual value
 * @param baseline The baseline value (100 points)
 * @param max The maximum value to consider
 * @param weight Optional weight multiplier
 */
function scoreComponent(
  value: number,
  baseline: number,
  max: number,
  weight: number = 1
): number {
  if (value >= max) return 100 * weight
  if (value <= 0) return 0

  const percent = (value / baseline) * 100
  const capped = Math.min(percent, 100)
  return capped * weight
}
