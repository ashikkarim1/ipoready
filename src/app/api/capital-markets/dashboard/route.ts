import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const companyId = request.nextUrl.searchParams.get('companyId')

    if (!companyId) {
      return NextResponse.json({
        error: 'companyId required',
      }, { status: 400 })
    }

    // Get company overview
    const company = await db.query(
      `SELECT * FROM capital_companies WHERE id = $1`,
      [companyId]
    )

    if (company.rows.length === 0) {
      return NextResponse.json({
        error: 'Company not found',
      }, { status: 404 })
    }

    const companyData = company.rows[0]

    // Get latest financials
    const financials = await db.query(
      `SELECT * FROM company_financials
       WHERE company_id = $1 AND fiscal_quarter = 0
       ORDER BY fiscal_year DESC LIMIT 3`,
      [companyId]
    )

    // Get IPO data if applicable
    const ipo = await db.query(
      `SELECT * FROM ipos WHERE company_id = $1 ORDER BY listing_date DESC LIMIT 1`,
      [companyId]
    )

    // Get peer benchmarks
    const benchmarks = await db.query(
      `SELECT * FROM peer_benchmarks
       WHERE company_id = $1
       ORDER BY benchmark_date DESC LIMIT 1`,
      [companyId]
    )

    // Get valuation multiples
    const multiples = await db.query(
      `SELECT * FROM valuation_multiples
       WHERE company_id = $1
       ORDER BY valuation_date DESC LIMIT 1`,
      [companyId]
    )

    // Calculate key metrics
    const latestFinancials = financials.rows[0]
    const previousFinancials = financials.rows[1]

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
      ipo: ipo.rows[0] ? {
        listing_date: ipo.rows[0].listing_date,
        first_day_return: ipo.rows[0].first_day_return,
        return_365d: ipo.rows[0].return_365d,
      } : null,
      benchmarks: benchmarks.rows[0] ? {
        percentile_vs_peers: benchmarks.rows[0].percentile_vs_peers,
        percentile_vs_sector: benchmarks.rows[0].percentile_vs_sector,
      } : null,
      valuation: multiples.rows[0] ? {
        pe_ratio: multiples.rows[0].pe_ratio,
        ev_revenue: multiples.rows[0].ev_revenue,
        ev_ebitda: multiples.rows[0].ev_ebitda,
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
