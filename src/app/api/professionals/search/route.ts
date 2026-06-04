import { NextResponse, NextRequest } from 'next/server'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface Professional {
  id: string
  name: string
  professional_title: string
  industries: string[]
  regions: string[]
  years_public_experience: number
  rate_expectations_annual: number | null
  rate_expectations_hourly: number | null
  bio: string | null
  verification_status: string
  linkedin_verified: boolean
}

/**
 * GET /api/professionals/search
 * Search professionals with flexible filters
 *
 * Query params:
 * - role: Professional title or keywords (partial match)
 * - industry: Industry name (array or comma-separated)
 * - region: Region name (array or comma-separated)
 * - experience: Minimum years of public experience
 * - verified: true/false - only verified professionals
 * - limit: Number of results (default: 20, max: 100)
 * - offset: Pagination offset (default: 0)
 *
 * Returns: Array of professionals with match relevance
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    // Parse filters
    const roleQuery = searchParams.get('role')
    const industryParam = searchParams.get('industry')
    const regionParam = searchParams.get('region')
    const experienceParam = searchParams.get('experience')
    const verifiedParam = searchParams.get('verified')
    const limitParam = searchParams.get('limit')
    const offsetParam = searchParams.get('offset')

    // Convert comma-separated strings to arrays
    const industries = industryParam ? industryParam.split(',').map((s) => s.trim()) : []
    const regions = regionParam ? regionParam.split(',').map((s) => s.trim()) : []

    const minExperience = experienceParam ? parseInt(experienceParam, 10) : 0
    const onlyVerified = verifiedParam === 'true'
    const limit = Math.min(parseInt(limitParam || '20', 10), 100)
    const offset = parseInt(offsetParam || '0', 10)

    // Build dynamic WHERE clause
    let whereClause = 'WHERE p.verification_status IN (\'verified\', \'unverified\')'

    if (onlyVerified) {
      whereClause += ' AND p.verification_status = \'verified\''
    }

    if (minExperience > 0) {
      whereClause += ` AND p.years_public_experience >= ${minExperience}`
    }

    // Build industry and region filters
    // Using PostgreSQL array operators
    if (industries.length > 0) {
      const industryFilter = industries.map((ind) => `p.industries && ARRAY['${ind.replace(/'/g, "''")}'::TEXT]`).join(' OR ')
      whereClause += ` AND (${industryFilter})`
    }

    if (regions.length > 0) {
      const regionFilter = regions.map((reg) => `p.regions && ARRAY['${reg.replace(/'/g, "''")}'::TEXT]`).join(' OR ')
      whereClause += ` AND (${regionFilter})`
    }

    if (roleQuery) {
      const roleEscaped = roleQuery.replace(/'/g, "''")
      whereClause += ` AND (p.professional_title ILIKE '%${roleEscaped}%' OR p.bio ILIKE '%${roleEscaped}%')`
    }

    // Execute search query
    const searchQuery = `
      SELECT
        p.id,
        p.name,
        p.professional_title,
        p.industries,
        p.regions,
        p.years_public_experience,
        p.rate_expectations_annual,
        p.rate_expectations_hourly,
        p.bio,
        p.verification_status,
        p.linkedin_verified,
        p.created_at
      FROM professionals p
      ${whereClause}
      ORDER BY p.years_public_experience DESC, p.created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `

    const professionals = (await sql.query(searchQuery)) as Professional[]

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as count
      FROM professionals p
      ${whereClause}
    `

    const countResult = (await sql.query(countQuery)) as { count: number }[]
    const totalCount = countResult[0]?.count || 0

    return NextResponse.json({
      professionals: professionals.map((p) => ({
        id: p.id,
        name: p.name,
        professionalTitle: p.professional_title,
        industries: p.industries || [],
        regions: p.regions || [],
        yearsPublicExperience: p.years_public_experience,
        rateExpectationsAnnual: p.rate_expectations_annual,
        rateExpectationsHourly: p.rate_expectations_hourly,
        bio: p.bio,
        verificationStatus: p.verification_status,
        linkedinVerified: p.linkedin_verified,
      })),
      pagination: {
        limit,
        offset,
        total: totalCount,
        hasMore: offset + limit < totalCount,
      },
    })
  } catch (error) {
    console.error('Error searching professionals:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
