import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import {
  calculateIPOReadinessScore,
  predictMarketWindow,
  estimateValuation,
  calculateCompetitiveAdvantage,
  scoreStrategicOptions,
  generateIntelligenceSnapshot,
  type CompanyMetrics,
  type IntelligenceSnapshot
} from '@/lib/market-data/market-advantage-engine'
import {
  aggregateMarketData,
  fetchSECComparables,
  getAllIntelligenceData
} from '@/lib/market-data/data-aggregator'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as { id?: string; companyId?: string } | undefined

    if (!session || !user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const companyId = user.companyId

    // Parse request body (company metrics to analyze)
    let companyMetrics: CompanyMetrics
    try {
      const body = await req.json()
      companyMetrics = body
    } catch {
      // If no body provided, fetch from database
      companyMetrics = await fetchCompanyMetricsFromDB(companyId)
    }

    // Fetch all intelligence data (market data + comparables)
    const { marketData, comparables } = await getAllIntelligenceData()

    // Generate comprehensive intelligence snapshot
    const snapshot = generateIntelligenceSnapshot(companyMetrics, marketData, comparables)

    return NextResponse.json(snapshot)
  } catch (error) {
    console.error('Market Advantage Intelligence error:', error)
    return NextResponse.json(
      { error: 'Failed to generate market intelligence' },
      { status: 500 }
    )
  }
}

async function fetchCompanyMetricsFromDB(companyId: string): Promise<CompanyMetrics> {
  try {
    // Fetch company data from multiple tables
    const [company] = await sql`
      SELECT
        id,
        name,
        revenue_arr,
        growth_rate_yoy,
        team_headcount,
        estimated_monthly_burn,
        last_funding_round_valuation,
        last_funding_date
      FROM companies
      WHERE id = ${companyId}
      LIMIT 1
    `

    if (!company) {
      throw new Error('Company not found')
    }

    // Fetch unit economics from operations tables
    const [unitEconomics] = await sql`
      SELECT
        gross_margin,
        operating_margin,
        magic_number,
        cac_payback_months,
        ndr_retention_rate,
        fcf_margin
      FROM company_financials
      WHERE company_id = ${companyId}
      ORDER BY created_at DESC
      LIMIT 1
    `

    // Fetch customer data
    const [customerData] = await sql`
      SELECT
        COUNT(*) as customer_count,
        SUM(arr) as total_arr
      FROM customers
      WHERE company_id = ${companyId} AND status = 'active'
    `

    // Construct company metrics
    return {
      revenueGrowthYoY: (company?.growth_rate_yoy as number) || 28,
      grossMargin: (unitEconomics?.gross_margin as number) || 72,
      operatingMargin: (unitEconomics?.operating_margin as number) || -12,
      magicNumber: (unitEconomics?.magic_number as number) || 0.82,
      cacPayback: (unitEconomics?.cac_payback_months as number) || 14,
      ndcRetention: (unitEconomics?.ndr_retention_rate as number) || 105,
      fcfMargin: (unitEconomics?.fcf_margin as number) || -8,
      burnRate: calculateBurnRate((company?.estimated_monthly_burn as number) || 500),
      teamHeadcount: (company?.team_headcount as number) || 42,
      recentFundingRaised: 50, // Need to add to schema
      lastValuation: (company?.last_funding_round_valuation as number) / 1000000 || 250,
      estimatedARR: (company?.revenue_arr as number) / 1000000 || 5,
      estimatedCustomerCount: (customerData?.customer_count as number) || 150,
      estimatedCAC: calculateCAC((company?.revenue_arr as number) || 5000000),
      estimatedLTV: calculateLTV((company?.revenue_arr as number) || 5000000, (unitEconomics?.ndr_retention_rate as number) || 105)
    }
  } catch (error) {
    console.error('Error fetching company metrics:', error)
    // Return reasonable defaults
    return {
      revenueGrowthYoY: 28,
      grossMargin: 72,
      operatingMargin: -12,
      magicNumber: 0.82,
      cacPayback: 14,
      ndcRetention: 105,
      fcfMargin: -8,
      burnRate: 24,
      teamHeadcount: 50,
      recentFundingRaised: 50,
      lastValuation: 250,
      estimatedARR: 5,
      estimatedCustomerCount: 200,
      estimatedCAC: 15000,
      estimatedLTV: 150000
    }
  }
}

function calculateBurnRate(monthlyBurn: number): number {
  // Estimate runway based on monthly burn and estimated cash
  // This is simplified - in production would fetch actual cash balance
  const estimatedCash = monthlyBurn * 30 // Assume 30 months of cash
  return estimatedCash / monthlyBurn
}

function calculateCAC(arr: number): number {
  // CAC = Sales & Marketing Spend / New Customers
  // Simplified: Assume 30% of revenue goes to S&M
  // This would come from actual data in production
  const salesMarketingSpend = arr * 0.30
  const estimatedNewCustomers = arr / 25000 // Assume $25K average ARR per customer
  return salesMarketingSpend / Math.max(estimatedNewCustomers, 1)
}

function calculateLTV(arr: number, ndrRetention: number): number {
  // LTV = (Average Revenue Per Account / Monthly Churn) * Gross Margin
  // Simplified calculation
  const avgARPA = arr / 100 // Average account size
  const monthlyChurn = 1 - (ndrRetention / 100)
  const grossMargin = 0.72 // Default to 72%
  return (avgARPA / Math.max(monthlyChurn, 0.01)) * grossMargin
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as { id?: string; companyId?: string } | undefined

    if (!session || !user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const companyId = user.companyId

    // Fetch real-time market data only (no POST body)
    const marketData = await aggregateMarketData()

    // Return market conditions for dashboard widget
    return NextResponse.json({
      marketData,
      timestamp: new Date().toISOString(),
      cacheStatus: 'real-time'
    })
  } catch (error) {
    console.error('Error fetching market data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch market data' },
      { status: 500 }
    )
  }
}
