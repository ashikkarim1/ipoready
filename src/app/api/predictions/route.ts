import { NextRequest, NextResponse } from 'next/server'
import { generateIPOPrediction } from '@/lib/prediction-engine'
import { db } from '@/lib/db'
import { PredictionInput } from '@/types/predictions'

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

    // Get latest prediction from database
    const result = await db.query(
      `SELECT * FROM company_predictions
       WHERE company_id = $1
       ORDER BY prediction_timestamp DESC
       LIMIT 1`,
      [companyId]
    )

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'No prediction found' }, { status: 404 })
    }

    const prediction = result.rows[0]

    return NextResponse.json({
      success: true,
      prediction: {
        companyId: prediction.company_id,
        timestamp: prediction.prediction_timestamp,
        financial: {
          readinessScore: prediction.financial_readiness_score,
          monthsToTarget: prediction.financial_readiness_months_to_target,
        },
        regulatory: {
          readinessScore: prediction.regulatory_readiness_score,
          riskLevel: prediction.regulatory_risk_level,
        },
        investor: {
          valuationLow: prediction.predicted_valuation_low,
          valuationMid: prediction.predicted_valuation_mid,
          valuationHigh: prediction.predicted_valuation_high,
        },
        management: {
          readinessScore: prediction.management_readiness_score,
        },
        pace: {
          currentScore: prediction.pace_current_score,
          targetScore: prediction.pace_target_score,
          predictedTargetDate: prediction.pace_predicted_target_date,
        },
        ipOSuccessProbability: prediction.ipo_success_probability_percent,
        recommendedIpoDate: prediction.recommended_ipo_date,
        recommendation: prediction.go_no_go_recommendation,
        confidenceLevel: prediction.confidence_level,
      },
    })
  } catch (error) {
    console.error('Get prediction error:', error)
    return NextResponse.json({ error: 'Failed to fetch prediction' }, { status: 500 })
  }
}

/**
 * POST /api/predictions/generate
 *
 * Generate a new prediction for a company
 */
export async function POST(request: NextRequest) {
  try {
    const {
      companyId,
      companyName,
      sector,
      currentRevenue,
      revenueGrowthRate,
      grossMargin,
      operatingExpensePercent,
      cashBalance,
      customerChurn,
      cac,
      cacPayback,
      ceoExperience,
      cfoExperience,
      boardIndependence,
      hasAuditCommittee,
      vixLevel,
      interestRateEnvironment,
      competitorFundingActivity,
      yourCompetitivePosition,
      hasDataPrivacyCompliance,
      hasAuditHistory,
      relatedPartyTransactions,
      customerConcentration,
      numLargeCustomers,
      netRetentionRate,
    } = await request.json()

    if (!companyId || !companyName) {
      return NextResponse.json(
        { error: 'companyId and companyName are required' },
        { status: 400 }
      )
    }

    // Prepare input for prediction engine
    const input: PredictionInput = {
      companyId,
      companyName,
      sector: sector || 'SaaS',
      currentRevenue: currentRevenue || 1000000,
      revenueGrowthRate: revenueGrowthRate || 0.35,
      grossMargin: grossMargin || 0.70,
      operatingExpensePercent: operatingExpensePercent || 0.40,
      cashBalance: cashBalance || currentRevenue * 12,
      customerChurn: customerChurn || 0.03,
      cac: cac || 2500,
      cacPayback: cacPayback || 15,
      ceoExperience: ceoExperience || 7,
      cfoExperience: cfoExperience || 6,
      boardIndependence: boardIndependence || 0.5,
      hasAuditCommittee: hasAuditCommittee || true,
      vixLevel: vixLevel || 20,
      interestRateEnvironment: interestRateEnvironment || 'Stable',
      competitorFundingActivity: competitorFundingActivity || 'Medium',
      yourCompetitivePosition: yourCompetitivePosition || 'Strong',
      hasDataPrivacyCompliance: hasDataPrivacyCompliance || true,
      hasAuditHistory: hasAuditHistory || true,
      relatedPartyTransactions: relatedPartyTransactions || false,
      customerConcentration: customerConcentration || 0.15,
      numLargeCustomers: numLargeCustomers || 8,
      netRetentionRate: netRetentionRate || 1.15,
    }

    // Generate prediction (7-layer synthesis)
    const prediction = await generateIPOPrediction(input)

    return NextResponse.json({
      success: true,
      prediction,
      message: `IPO prediction generated: ${prediction.recommendation}`,
    })
  } catch (error) {
    console.error('Generate prediction error:', error)
    return NextResponse.json({ error: 'Failed to generate prediction' }, { status: 500 })
  }
}
