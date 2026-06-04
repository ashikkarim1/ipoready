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
  bio: string | null
  certifications: string[]
}

/**
 * GET /api/professionals/recommendations
 * Smart matching algorithm for board members based on company needs
 *
 * Query params:
 * - company_id: Company UUID (required)
 * - role: Role seeking (e.g., "director", "audit committee", "compensation committee")
 * - industry: Company industry for matching
 * - region: Preferred region (optional)
 * - limit: Number of recommendations (default: 3, max: 10)
 *
 * Returns: Top matches with match scores (0-100)
 * Algorithm considers:
 * - Industry expertise match
 * - Years of public company experience
 * - Geographic proximity
 * - Specific certifications
 * - Board position experience
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const companyId = searchParams.get('company_id')
    const roleQuery = searchParams.get('role')
    const industryQuery = searchParams.get('industry')
    const regionQuery = searchParams.get('region')
    const limitParam = searchParams.get('limit')

    // Validate required parameters
    if (!companyId) {
      return NextResponse.json(
        { error: 'Missing required parameter: company_id' },
        { status: 400 }
      )
    }

    const limit = Math.min(parseInt(limitParam || '3', 10), 10)

    // Verify company exists
    const companyRows = await sql`
      SELECT id, name FROM companies WHERE id = ${companyId} LIMIT 1
    ` as { id: string; name: string }[]

    if (companyRows.length === 0) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    const company = companyRows[0]

    // Get all verified professionals
    const professionalsRows = await sql`
      SELECT
        id, name, professional_title, industries, regions,
        years_public_experience, rate_expectations_annual,
        bio, certifications, past_board_positions
      FROM professionals
      WHERE verification_status = 'verified'
      ORDER BY years_public_experience DESC
    ` as (Professional & { past_board_positions: any })[]

    // Score each professional
    const scoredProfessionals = professionalsRows.map((prof) => {
      let score = 0

      // Experience score (0-30 points)
      const expScore = Math.min(30, Math.max(0, prof.years_public_experience * 2.5))
      score += expScore

      // Industry match score (0-25 points)
      if (industryQuery) {
        const industryMatches = prof.industries?.filter(
          (ind) => ind.toLowerCase().includes(industryQuery.toLowerCase()) ||
                   industryQuery.toLowerCase().includes(ind.toLowerCase())
        ).length || 0
        score += industryMatches > 0 ? 25 : 0
      }

      // Role/certification match score (0-20 points)
      if (roleQuery) {
        const certMatches = prof.certifications?.filter(
          (cert) => cert.toLowerCase().includes(roleQuery.toLowerCase()) ||
                    roleQuery.toLowerCase().includes(cert.toLowerCase())
        ).length || 0
        const boardMatches = prof.past_board_positions?.filter(
          (pos: any) => pos.title?.toLowerCase().includes(roleQuery.toLowerCase()) ||
                        pos.description?.toLowerCase().includes(roleQuery.toLowerCase())
        ).length || 0

        score += Math.min(20, (certMatches + boardMatches) * 10)
      }

      // Region match score (0-15 points)
      if (regionQuery) {
        const regionMatch = prof.regions?.includes(regionQuery)
        score += regionMatch ? 15 : 0
      }

      // Board experience score (0-10 points)
      const boardCount = prof.past_board_positions?.length || 0
      score += Math.min(10, boardCount * 5)

      return {
        professional: prof,
        score: Math.min(100, score),
      }
    })

    // Sort by score and get top N
    const topRecommendations = scoredProfessionals
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => ({
        id: item.professional.id,
        name: item.professional.name,
        professionalTitle: item.professional.professional_title,
        industries: item.professional.industries || [],
        regions: item.professional.regions || [],
        yearsPublicExperience: item.professional.years_public_experience,
        rateExpectationsAnnual: item.professional.rate_expectations_annual,
        bio: item.professional.bio,
        certifications: item.professional.certifications || [],
        matchScore: Math.round(item.score),
      }))

    return NextResponse.json({
      company: {
        id: company.id,
        name: company.name,
      },
      recommendations: topRecommendations,
      metadata: {
        totalMatched: professionalsRows.length,
        criteria: {
          role: roleQuery,
          industry: industryQuery,
          region: regionQuery,
        },
      },
    })
  } catch (error) {
    console.error('Error generating recommendations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
