import { NextResponse, NextRequest } from 'next/server'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface ProfessionalRow {
  id: string
  name: string
  email: string
  phone: string | null
  linkedin_url: string | null
  linkedin_verified: boolean
  professional_title: string
  years_public_experience: number
  industries: string[]
  regions: string[]
  rate_expectations_annual: number | null
  rate_expectations_hourly: number | null
  bio: string | null
  past_board_positions: any
  certifications: string[]
  years_of_experience: number
  verification_status: string
  verification_notes: string | null
  verified_at: string | null
  created_at: string
  updated_at: string
}

/**
 * GET /api/professionals/[id]
 * Get full professional profile by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ error: 'Invalid professional ID format' }, { status: 400 })
    }

    const rows = await sql`
      SELECT
        id, name, email, phone, linkedin_url, linkedin_verified,
        professional_title, years_public_experience, industries, regions,
        rate_expectations_annual, rate_expectations_hourly, bio,
        past_board_positions, certifications, years_of_experience,
        verification_status, verification_notes, verified_at, created_at, updated_at
      FROM professionals
      WHERE id = ${id}
      LIMIT 1
    ` as ProfessionalRow[]

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Professional not found' }, { status: 404 })
    }

    const p = rows[0]

    return NextResponse.json({
      professional: {
        id: p.id,
        name: p.name,
        email: p.email,
        phone: p.phone,
        linkedinUrl: p.linkedin_url,
        linkedinVerified: p.linkedin_verified,
        professionalTitle: p.professional_title,
        yearsPublicExperience: p.years_public_experience,
        industries: p.industries || [],
        regions: p.regions || [],
        rateExpectationsAnnual: p.rate_expectations_annual,
        rateExpectationsHourly: p.rate_expectations_hourly,
        bio: p.bio,
        pastBoardPositions: p.past_board_positions || [],
        certifications: p.certifications || [],
        yearsOfExperience: p.years_of_experience,
        verificationStatus: p.verification_status,
        verificationNotes: p.verification_notes,
        verifiedAt: p.verified_at,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      },
    })
  } catch (error) {
    console.error('Error fetching professional:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
