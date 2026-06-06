import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const status = request.nextUrl.searchParams.get('status')
    const sector = request.nextUrl.searchParams.get('sector')
    const days = parseInt(request.nextUrl.searchParams.get('days') || '90')

    let result: any[]

    // Build query with conditional filters
    if (status && sector && days > 0) {
      result = await sql`
        SELECT
          i.*,
          c.name as company_name,
          c.ticker,
          c.sector
        FROM ipos i
        LEFT JOIN capital_companies c ON i.company_id = c.id
        WHERE i.status = ${status}
        AND (c.sector = ${sector} OR i.sector = ${sector})
        AND i.listing_date >= CURRENT_DATE - INTERVAL '${days} days'
        ORDER BY i.listing_date DESC
        LIMIT 100
      `
    } else if (status && sector) {
      result = await sql`
        SELECT
          i.*,
          c.name as company_name,
          c.ticker,
          c.sector
        FROM ipos i
        LEFT JOIN capital_companies c ON i.company_id = c.id
        WHERE i.status = ${status}
        AND (c.sector = ${sector} OR i.sector = ${sector})
        ORDER BY i.listing_date DESC
        LIMIT 100
      `
    } else if (status && days > 0) {
      result = await sql`
        SELECT
          i.*,
          c.name as company_name,
          c.ticker,
          c.sector
        FROM ipos i
        LEFT JOIN capital_companies c ON i.company_id = c.id
        WHERE i.status = ${status}
        AND i.listing_date >= CURRENT_DATE - INTERVAL '${days} days'
        ORDER BY i.listing_date DESC
        LIMIT 100
      `
    } else if (sector && days > 0) {
      result = await sql`
        SELECT
          i.*,
          c.name as company_name,
          c.ticker,
          c.sector
        FROM ipos i
        LEFT JOIN capital_companies c ON i.company_id = c.id
        WHERE (c.sector = ${sector} OR i.sector = ${sector})
        AND i.listing_date >= CURRENT_DATE - INTERVAL '${days} days'
        ORDER BY i.listing_date DESC
        LIMIT 100
      `
    } else if (status) {
      result = await sql`
        SELECT
          i.*,
          c.name as company_name,
          c.ticker,
          c.sector
        FROM ipos i
        LEFT JOIN capital_companies c ON i.company_id = c.id
        WHERE i.status = ${status}
        ORDER BY i.listing_date DESC
        LIMIT 100
      `
    } else if (sector) {
      result = await sql`
        SELECT
          i.*,
          c.name as company_name,
          c.ticker,
          c.sector
        FROM ipos i
        LEFT JOIN capital_companies c ON i.company_id = c.id
        WHERE c.sector = ${sector} OR i.sector = ${sector}
        ORDER BY i.listing_date DESC
        LIMIT 100
      `
    } else if (days > 0) {
      result = await sql`
        SELECT
          i.*,
          c.name as company_name,
          c.ticker,
          c.sector
        FROM ipos i
        LEFT JOIN capital_companies c ON i.company_id = c.id
        WHERE i.listing_date >= CURRENT_DATE - INTERVAL '${days} days'
        ORDER BY i.listing_date DESC
        LIMIT 100
      `
    } else {
      result = await sql`
        SELECT
          i.*,
          c.name as company_name,
          c.ticker,
          c.sector
        FROM ipos i
        LEFT JOIN capital_companies c ON i.company_id = c.id
        ORDER BY i.listing_date DESC
        LIMIT 100
      `
    }

    // Calculate performance metrics
    const ipos = result.map((ipo: any) => ({
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
