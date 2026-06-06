import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const companyId = request.nextUrl.searchParams.get('companyId')

    if (!companyId) {
      return NextResponse.json({
        error: 'companyId required',
      }, { status: 400 })
    }

    // Get company overview
    const company = await sql`SELECT * FROM capital_companies WHERE id = ${companyId}`

    if (company.length === 0) {
      return NextResponse.json({
        error: 'Company not found',
      }, { status: 404 })
    }

    const companyData = company[0]

    // Get latest financials
    const financials = await sql`
      SELECT * FROM company_financials
      WHERE company_id = ${companyId} AND fiscal_quarter = 0
      ORDER BY fiscal_year DESC LIMIT 3
    `

    // Get IPO data if applicable
    const ipos = await sql`
      SELECT * FROM ipos WHERE company_id = ${companyId} ORDER BY listing_date DESC LIMIT 1
    `

    // Get peer benchmarks
    const benchmarks = await sql`
      SELECT * FROM peer_benchmarks
      WHERE company_id = ${companyId}
      ORDER BY benchmark_date DESC LIMIT 1
    `

    // Get valuation multiples
    const multiples = await sql`
      SELECT * FROM valuation_multiples
      WHERE company_id = ${companyId}
      ORDER BY valuation_date DESC LIMIT 1
    `

    // Calculate key metrics
    const latestFinancials = financials[0]
    const previousFinancials = financials[1]

    const revenueGrowth = previousFinancials
      ? ((latestFinancials.revenue - previousFinancials.revenue) / previousFinancials.revenue * 100).toFixed(1)
      : null

    const dashboard = {
      company: {
        id: companyData.id,
        name: companyData.name,
        ticker: companyData.ticker,
        sector: companyData.sector,
        industry: companyData.industry,
        market_cap: companyData.market_cap,
      },
      financials: {
        latest: latestFinancials ? {
          fiscal_year: latestFinancials.fiscal_year,
          revenue: latestFinancials.revenue,
          net_income: latestFinancials.net_income,
          operating_cash_flow: latestFinancials.operating_cash_flow,
          net_margin: latestFinancials.net_margin,
          roe: latestFinancials.roe,
          current_ratio: latestFinancials.current_ratio,
        } : null,
        revenueGrowth: revenueGrowth ? parseFloat(revenueGrowth) : null,
      },
      ipo: ipos[0] ? {
        listing_date: ipos[0].listing_date,
        first_day_return: ipos[0].first_day_return,
        return_365d: ipos[0].return_365d,
      } : null,
      benchmarks: benchmarks[0] ? {
        percentile_vs_peers: benchmarks[0].percentile_vs_peers,
        percentile_vs_sector: benchmarks[0].percentile_vs_sector,
      } : null,
      valuation: multiples[0] ? {
        pe_ratio: multiples[0].pe_ratio,
        ev_revenue: multiples[0].ev_revenue,
        ev_ebitda: multiples[0].ev_ebitda,
      } : null,
    }

    return NextResponse.json(dashboard, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error('Capital Markets API error:', error)
    return NextResponse.json({
      error: 'Internal server error',
    }, { status: 500 })
  }
}
