/**
 * GET /api/pace/scores
 * 
 * Returns comprehensive PACE scoring including:
 * - Base PACE score (task completion weighted by phase)
 * - Adjusted PACE score (with predictive factors)
 * - Peer percentile (benchmark comparison)
 * - Sequencing violations (out-of-order tasks)
 * - Risk factors
 * - Predicted days to IPO
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { computeAndUpdateCompanyStats } from '@/lib/company-stats'
import { sql } from '@/lib/db/client'

export async function GET(request: NextRequest) {
  try {
    // Get company ID from query params
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')

    if (!companyId) {
      return NextResponse.json(
        { error: 'Missing companyId parameter' },
        { status: 400 }
      )
    }

    // Get user session for auth
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify company ownership
    const companyRows = await sql`
      SELECT id, user_id FROM companies WHERE id = ${companyId} LIMIT 1
    `

    if (!companyRows.length) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    const company = companyRows[0] as { id: string; user_id: string }
    if (company.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Compute enhanced PACE metrics
    const paceMetrics = await computeAndUpdateCompanyStats(companyId)

    // Return comprehensive response
    return NextResponse.json({
      success: true,
      data: {
        // Core PACE Score
        paceScore: {
          base: paceMetrics.paceScore,
          adjusted: paceMetrics.adjustedPaceScore,
          confidence: paceMetrics.predictiveFactors.confidence,
        },

        // Peer Benchmarking
        peerBenchmarking: {
          percentile: paceMetrics.peerPercentile,
          label: paceMetrics.peerPercentileLabel,
          benchmarkComparison: paceMetrics.benchmarkComparison,
          interpretation: interpretPeerPercentile(
            paceMetrics.peerPercentile,
            paceMetrics.targetExchange
          ),
        },

        // Timeline Prediction
        timeline: {
          estimatedDaysToIpo: paceMetrics.estimatedDaysToIpo,
          predictedDaysToIpo: paceMetrics.predictedDaysToIpo,
          estimatedCompletionDate: addDaysToNow(paceMetrics.predictedDaysToIpo),
        },

        // Readiness Factors
        readinessFactors: {
          cashRunway: paceMetrics.predictiveFactors.cashRunwayMonths
            ? `${paceMetrics.predictiveFactors.cashRunwayMonths.toFixed(1)} months`
            : 'Not specified',
          teamSize: paceMetrics.predictiveFactors.teamSize ?? 'Not specified',
          cfoHired: paceMetrics.predictiveFactors.cfoHired ? 'Yes' : 'No',
          boardSize: paceMetrics.predictiveFactors.boardSize ?? 0,
          auditorSelected: paceMetrics.predictiveFactors.auditorSelected ? 'Yes' : 'No',
          investorSophistication: scoreInvestorSophistication(
            paceMetrics.predictiveFactors.investorSophisticationScore ?? 5
          ),
        },

        // Risk Assessment
        riskAssessment: {
          riskFactors: paceMetrics.riskFactors,
          overallRiskLevel: calculateRiskLevel(paceMetrics.riskFactors),
          mitigationActions: generateMitigationActions(paceMetrics.riskFactors),
        },

        // Sequencing Alerts
        sequencingAlerts: {
          total: paceMetrics.sequencingAlerts.length,
          errors: paceMetrics.sequencingAlerts.filter((a) => a.severity === 'error'),
          warnings: paceMetrics.sequencingAlerts.filter((a) => a.severity === 'warning'),
        },

        // Progress Overview
        progress: {
          percentage: paceMetrics.progressPercentage,
          currentPhase: paceMetrics.currentPhase,
          targetExchange: paceMetrics.targetExchange,
        },

        // Last Updated
        lastUpdated: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Error computing PACE scores:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Helper: Interpret peer percentile with narrative
 */
function interpretPeerPercentile(
  percentile: number,
  exchange: string
): string {
  if (percentile >= 90) {
    return `Your PACE score ranks in the top 10% of ${exchange} companies - exceptional progress`
  } else if (percentile >= 75) {
    return `Your PACE score ranks in the top 25% of ${exchange} companies - strong progress`
  } else if (percentile >= 50) {
    return `Your PACE score is above median for ${exchange} companies - on track`
  } else {
    return `Your PACE score is below median for ${exchange} companies - acceleration recommended`
  }
}

/**
 * Helper: Calculate days from now
 */
function addDaysToNow(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}

/**
 * Helper: Interpret investor sophistication score
 */
function scoreInvestorSophistication(score: number): string {
  const mappings: Record<number, string> = {
    1: 'Seed-stage only',
    2: 'Angel investors',
    3: 'Early VC stage',
    4: 'Series A/B',
    5: 'Mid-stage VCs',
    6: 'Late-stage (Series C+)',
    7: 'Multi-stage institutional',
    8: 'Top-tier institutional',
    9: 'Strategic/Corporate VCs',
    10: 'Diverse institutional base',
  }
  return mappings[score] || 'Unknown'
}

/**
 * Helper: Calculate overall risk level
 */
function calculateRiskLevel(riskFactors: string[]): 'low' | 'medium' | 'high' {
  const criticalFactors = riskFactors.filter(
    (f) =>
      f.includes('cash') ||
      f.includes('CFO') ||
      f.includes('auditor') ||
      f.includes('governance')
  )

  if (criticalFactors.length >= 3) return 'high'
  if (criticalFactors.length >= 1) return 'medium'
  return 'low'
}

/**
 * Helper: Generate mitigation actions based on risk factors
 */
function generateMitigationActions(riskFactors: string[]): string[] {
  const actions: string[] = []

  const riskMap: Record<string, string> = {
    cash: 'Accelerate fundraising or reduce burn rate to extend runway',
    'team-readiness': 'Hire experienced CFO and complete board formation',
    CFO: 'Prioritize CFO hiring - investor requirement for roadshow',
    'auditor': 'Select Big 4 auditor and complete preliminary assessment',
    'market-volatility': 'Monitor VIX; consider timing adjustments if volatility persists',
    'investor-concentration': 'Diversify investor base to reduce single-investor dependency',
    'governance': 'Establish independent board and committee structure',
    'regulatory': 'Engage securities counsel to ensure full compliance',
  }

  for (const factor of riskFactors) {
    for (const [key, action] of Object.entries(riskMap)) {
      if (factor.toLowerCase().includes(key)) {
        actions.push(action)
        break
      }
    }
  }

  return [...new Set(actions)] // Remove duplicates
}
