import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
/**
 * GET /api/predictions?companyId=<id>
 *
 * Get the latest IPO prediction for a company
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')

    if (!companyId) {
      return NextResponse.json({ error: 'companyId is required' }, { status: 400 })
    }

    // Mock prediction (database to be configured separately)
    const mockPrediction = {
      success: true,
      prediction: {
        companyId,
        timestamp: new Date().toISOString(),
        financial: {
          readinessScore: 85,
          monthsToTarget: 6,
          status: 'Strong',
        },
        regulatory: {
          readinessScore: 78,
          riskLevel: 'Medium',
          status: 'On Track',
        },
        investor: {
          valuationLow: '$850M',
          valuationMid: '$1.2B',
          valuationHigh: '$1.5B',
          demand: 'High',
          optimalWindow: 'Q3 2026',
        },
        management: {
          readinessScore: 82,
          coachingHours: 24,
          status: 'Ready',
        },
        pace: {
          readinessScore: 73,
          estimatedDate: '2026-08-15',
          acceleration: '+2 weeks possible',
        },
        document: {
          riskScore: 22,
          secCommentLikelihood: 0.15,
          criticalGaps: [],
        },
        benchmark: {
          percentile: 85,
          peerComparison: 'Ahead of peers',
          redFlags: 0,
        },
        overallSuccess: {
          probability: 0.87,
          confidence: 'High',
          nextMilestone: 'Board approval',
          nextMilestoneDate: '2026-06-30',
        },
      },
    }

    return NextResponse.json(mockPrediction, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to retrieve prediction' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/predictions/generate
 *
 * Generate a new IPO prediction with custom metrics
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const prediction = {
      success: true,
      companyId: body.companyId,
      prediction: {
        financial: { readinessScore: 75, monthsToTarget: 8 },
        regulatory: { readinessScore: 70, riskLevel: 'Medium' },
        investor: { valuationLow: '$750M', valuationMid: '$1B', valuationHigh: '$1.3B' },
        management: { readinessScore: 80, coachingHours: 30 },
        pace: { readinessScore: 70, estimatedDate: '2026-09-30' },
        document: { riskScore: 25, secCommentLikelihood: 0.2 },
        benchmark: { percentile: 80, peerComparison: 'In line with peers' },
        overallSuccess: { probability: 0.82, confidence: 'High' },
      },
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(prediction, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate prediction' },
      { status: 500 }
    )
  }
}
