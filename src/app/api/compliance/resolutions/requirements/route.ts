/**
 * GET /api/compliance/resolutions/requirements?exchange=tsx|nasdaq|nyse|etc
 * Get required resolutions for a specific exchange
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const exchange = request.nextUrl.searchParams.get('exchange')
    if (!exchange) {
      return NextResponse.json(
        { error: 'exchange parameter is required' },
        { status: 400 }
      )
    }

    // Get required resolutions for exchange
    const result = await sql`
      SELECT 
        resolution_type,
        is_required,
        required_by_date,
        notes
      FROM exchange_resolution_requirements
      WHERE exchange = ${exchange}
      ORDER BY is_required DESC, resolution_type ASC
    `

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Exchange not found' },
        { status: 404 }
      )
    }

    const required = result.filter(r => r.is_required)
    const optional = result.filter(r => !r.is_required)

    return NextResponse.json({
      success: true,
      exchange,
      required: required.map(r => ({
        type: r.resolution_type,
        requiredByDate: r.required_by_date,
        notes: r.notes,
      })),
      optional: optional.map(r => ({
        type: r.resolution_type,
        requiredByDate: r.required_by_date,
        notes: r.notes,
      })),
      total: result.length,
    })
  } catch (error) {
    console.error('Error fetching requirements:', error)
    return NextResponse.json(
      { error: 'Failed to fetch requirements' },
      { status: 500 }
    )
  }
}
