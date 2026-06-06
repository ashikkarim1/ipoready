import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const sector = request.nextUrl.searchParams.get('sector')
    const search = request.nextUrl.searchParams.get('q')
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50')
    const offset = parseInt(request.nextUrl.searchParams.get('offset') || '0')

    let query = 'SELECT * FROM capital_companies WHERE 1=1'
    const params: any[] = []
    let paramCount = 1

    if (sector) {
      query += ` AND sector = $${paramCount}`
      params.push(sector)
      paramCount++
    }

    if (search) {
      query += ` AND (name ILIKE $${paramCount} OR ticker ILIKE $${paramCount})`
      params.push(`%${search}%`)
      paramCount++
    }

    // Get total count
    const countResult = await db.query(
      query.replace('SELECT *', 'SELECT COUNT(*) as count'),
      params
    )

    const total = parseInt(countResult.rows[0].count)

    // Get paginated results
    query += ` ORDER BY market_cap DESC NULLS LAST LIMIT $${paramCount} OFFSET $${paramCount + 1}`
    params.push(limit, offset)

    const result = await db.query(query, params)

    return NextResponse.json({
      companies: result.rows,
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
