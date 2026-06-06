import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const status = request.nextUrl.searchParams.get('status')
    const sector = request.nextUrl.searchParams.get('sector')
    const days = parseInt(request.nextUrl.searchParams.get('days') || '90')

    let query = `
      SELECT
        i.*,
        c.name as company_name,
        c.ticker,
        c.sector
      FROM ipos i
      LEFT JOIN capital_companies c ON i.company_id = c.id
      WHERE 1=1
    `
    const params: any[] = []
    let paramCount = 1

    if (status) {
      query += ` AND i.status = $${paramCount}`
      params.push(status)
      paramCount++
    }

    if (sector) {
      query += ` AND (c.sector = $${paramCount} OR i.sector = $${paramCount})`
      params.push(sector)
      paramCount++
    }

    if (days > 0) {
      query += ` AND i.listing_date >= CURRENT_DATE - INTERVAL '${days} days'`
    }

    query += ' ORDER BY i.listing_date DESC LIMIT 100'

    const result = await sql(query, params)

    // Calculate performance metrics
    const ipos = result.rows.map((ipo: any) => ({
      ...ipo,
      performance: {
        first_day_return: ipo.first_day_return,
        return_30d: ipo.return_30d,
        return_90d: ipo.return_90d,
        return_365d: ipo.return_365d,
        vs_market_30d: ipo.return_vs_sp500_30d,
        vs_market_90d: ipo.return_vs_sp500_90d,
      },
    }))

    return NextResponse.json({
      ipos,
      count: ipos.length,
      filters: {
        status,
        sector,
        days,
      },
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error('IPOs API error:', error)
    return NextResponse.json({
      error: 'Internal server error',
    }, { status: 500 })
  }
}
