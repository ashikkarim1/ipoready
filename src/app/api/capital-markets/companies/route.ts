import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const sector = request.nextUrl.searchParams.get('sector')
    const search = request.nextUrl.searchParams.get('q')
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50')
    const offset = parseInt(request.nextUrl.searchParams.get('offset') || '0')

    const searchPattern = search ? `%${search}%` : null

    // Get total count with filters
    let countResult: any[]

    if (sector && searchPattern) {
      countResult = await sql`
        SELECT COUNT(*) as count FROM capital_companies
        WHERE sector = ${sector}
        AND (name ILIKE ${searchPattern} OR ticker ILIKE ${searchPattern})
      `
    } else if (sector) {
      countResult = await sql`
        SELECT COUNT(*) as count FROM capital_companies
        WHERE sector = ${sector}
      `
    } else if (searchPattern) {
      countResult = await sql`
        SELECT COUNT(*) as count FROM capital_companies
        WHERE name ILIKE ${searchPattern} OR ticker ILIKE ${searchPattern}
      `
    } else {
      countResult = await sql`
        SELECT COUNT(*) as count FROM capital_companies
      `
    }

    const total = parseInt(countResult[0].count)

    // Get paginated results
    let result: any[]

    if (sector && searchPattern) {
      result = await sql`
        SELECT * FROM capital_companies
        WHERE sector = ${sector}
        AND (name ILIKE ${searchPattern} OR ticker ILIKE ${searchPattern})
        ORDER BY market_cap DESC NULLS LAST
        LIMIT ${limit} OFFSET ${offset}
      `
    } else if (sector) {
      result = await sql`
        SELECT * FROM capital_companies
        WHERE sector = ${sector}
        ORDER BY market_cap DESC NULLS LAST
        LIMIT ${limit} OFFSET ${offset}
      `
    } else if (searchPattern) {
      result = await sql`
        SELECT * FROM capital_companies
        WHERE name ILIKE ${searchPattern} OR ticker ILIKE ${searchPattern}
        ORDER BY market_cap DESC NULLS LAST
        LIMIT ${limit} OFFSET ${offset}
      `
    } else {
      result = await sql`
        SELECT * FROM capital_companies
        ORDER BY market_cap DESC NULLS LAST
        LIMIT ${limit} OFFSET ${offset}
      `
    }

    return NextResponse.json({
      companies: result,
      pagination: {
        total,
        limit,
        offset,
        pages: Math.ceil(total / limit),
      },
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1800',
      },
    })
  } catch (error) {
    console.error('Companies API error:', error)
    return NextResponse.json({
      error: 'Internal server error',
    }, { status: 500 })
  }
}
