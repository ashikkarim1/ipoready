/**
 * IPO Simulator - Simulate API Endpoint
 * POST /api/ipo-simulator/simulate
 *
 * Takes company parameters and returns full simulation results
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import { CompanyParameters, SimulationResults } from '@/types/ipo-simulator'
import { calculateLiquidity } from '@/lib/simulators/liquidity-calculator'
import { predictAnalystCoverage } from '@/lib/simulators/analyst-predictor'
import { modelInstitutionalDemand } from '@/lib/simulators/institutional-demand'
import { simulateStockTrajectory } from '@/lib/simulators/stock-trajectory'
import { calculateGovernanceScore } from '@/lib/simulators/governance-scorer'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const params: CompanyParameters = body.parameters

    // Validate parameters
    if (!params || !params.exchange) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Fetch historical IPO data from database
    const historicalIpos = await sql`
      SELECT
        id, company_name, sector, listing_date, exchange,
        float_percentage, raise_amount_millions, pre_money_valuation_billions,
        board_size, board_independence_percentage, board_diversity_percentage,
        insider_ownership_percentage, vc_ownership_percentage,
        lockup_period_months, underwriter_name, underwriter_tier,
        annual_revenue_millions, revenue_growth_rate,
        first_day_pop_percentage, day_30_performance_percentage,
        day_90_performance_percentage, day_180_performance_percentage,
        day_365_performance_percentage,
        bid_ask_spread_percentage, daily_volume_shares, annualized_turnover_percentage,
        analyst_count, buy_ratings, hold_ratings, sell_ratings,
        target_price_low, target_price_high,
        institutional_allocation_percentage, oversubscription_ratio,
        governance_score,
        nasdaq_eligible, nyse_eligible, tsx_eligible, tsxv_eligible
      FROM historical_ipos
      WHERE data_quality_score >= 0.7
      ORDER BY listing_date DESC
      LIMIT 500
    `

    // Run simulations
    const liquidity = calculateLiquidity(params, historicalIpos as any)
    const analystCoverage = predictAnalystCoverage(params, historicalIpos as any)
    const institutionalDemand = modelInstitutionalDemand(params, historicalIpos as any)
    const governance = calculateGovernanceScore(params)
    const stockTrajectory = simulateStockTrajectory(params, historicalIpos as any)

    // Compile results
    const results: Partial<SimulationResults> = {
      companyId: body.companyId || 'temp',
      scenarioId: body.scenarioId || `scenario-${Date.now()}`,
      timestamp: new Date().toISOString(),
      liquidity: {
        bidAskSpread: liquidity.bidAskSpread,
        dailyVolume: liquidity.dailyVolume,
        turnoverRatio: liquidity.turnoverRatio,
        percentile: liquidity.percentile,
      },
      analystCoverage: {
        predictedCount: analystCoverage.predictedCount,
        buyRatings: analystCoverage.buyRatings,
        holdRatings: analystCoverage.holdRatings,
        sellRatings: analystCoverage.sellRatings,
        targetPriceMin: analystCoverage.targetPriceMin,
        targetPriceMax: analystCoverage.targetPriceMax,
        percentile: analystCoverage.percentile,
      },
      institutionalDemand: {
        floatAllocation: institutionalDemand.floatAllocation,
        oversubscriptionRatio: institutionalDemand.oversubscriptionRatio,
        growthFunds: institutionalDemand.growthFunds,
        valueFunds: institutionalDemand.valueFunds,
        momentumFunds: institutionalDemand.momentumFunds,
        demandLevel: institutionalDemand.demandLevel,
        percentile: institutionalDemand.percentile,
      },
      governanceScore: {
        score: governance.score,
        boardIndependence: governance.boardIndependence,
        committeeIndependence: governance.committeeIndependence,
        insiderOwnership: governance.insiderOwnership,
        lockupEffect: governance.lockupEffect,
        percentile: 50,
      },
      stockTrajectory: {
        ipoPrice: stockTrajectory.ipoPrice,
        scenarios: {
          conservative: stockTrajectory.conservative,
          baseCase: stockTrajectory.baseCase,
          bullCase: stockTrajectory.bullCase,
        },
      },
      peerPercentiles: {
        liquidity: liquidity.percentile,
        analystCoverage: analystCoverage.percentile,
        institutionalDemand: institutionalDemand.percentile,
        governance: governance.percentile,
      },
    }

    // Save to database if scenario ID provided
    if (body.companyId && body.scenarioId) {
      await sql`
        INSERT INTO ipo_scenarios (
          company_id, user_id, name, scenario_type,
          float_percentage, raise_amount_millions, valuation_billions,
          board_size, board_independence_percentage,
          insider_ownership_percentage, vc_ownership_percentage,
          lockup_period_months, market_maker_tier, exchange,
          results_json
        ) VALUES (
          ${body.companyId}, ${session.user.id}, ${body.scenarioName || 'Untitled'},
          ${body.scenarioType || 'custom'},
          ${params.float}, ${params.raiseAmount}, ${params.valuation},
          ${params.boardSize}, ${params.boardIndependence},
          ${params.insiderOwnership}, ${params.vcOwnership},
          ${params.lockupPeriod}, ${params.marketMakerTier}, ${params.exchange},
          ${JSON.stringify(results)}::jsonb
        )
        ON CONFLICT (scenario_id) DO UPDATE SET
          results_json = EXCLUDED.results_json,
          updated_at = CURRENT_TIMESTAMP
      `
    }

    return NextResponse.json(results, { status: 200 })
  } catch (error) {
    console.error('Simulation error:', error)
    return NextResponse.json(
      {
        error: 'Simulation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return NextResponse.json({ methods: ['POST'] })
}
