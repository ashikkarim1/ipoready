import { NextResponse, NextRequest } from 'next/server'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface RegisterRequest {
  name: string
  email: string
  phone?: string
  linkedinUrl?: string
  professionalTitle: string
  yearsPublicExperience: number
  industries?: string[]
  regions?: string[]
  rateExpectationsAnnual?: number
  rateExpectationsHourly?: number
  bio?: string
  certifications?: string[]
  yearsOfExperience?: number
}

/**
 * POST /api/professionals/register
 * Register a new professional (board member or executive talent)
 *
 * Validation:
 * - Email must be unique
 * - Phone and LinkedIn verification optional
 * - Professional title is required
 * - Status starts as 'unverified'
 */
export async function POST(req: NextRequest) {
  try {
    const body: RegisterRequest = await req.json()

    // Validate required fields
    if (!body.name || !body.email || !body.professionalTitle || body.yearsPublicExperience === undefined) {
      return NextResponse.json(
        {
          error: 'Missing required fields: name, email, professionalTitle, yearsPublicExperience',
        },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Check if email already exists
    const existingRows = await sql`
      SELECT id FROM professionals WHERE email = ${body.email}
    ` as { id: string }[]

    if (existingRows.length > 0) {
      return NextResponse.json(
        { error: 'Professional with this email already exists' },
        { status: 409 }
      )
    }

    // Validate years of experience
    if (body.yearsPublicExperience < 0 || body.yearsPublicExperience > 70) {
      return NextResponse.json(
        { error: 'Years of experience must be between 0 and 70' },
        { status: 400 }
      )
    }

    // Validate compensation expectations (optional, if provided)
    if (body.rateExpectationsAnnual && body.rateExpectationsAnnual < 0) {
      return NextResponse.json({ error: 'Annual rate cannot be negative' }, { status: 400 })
    }
    if (body.rateExpectationsHourly && body.rateExpectationsHourly < 0) {
      return NextResponse.json({ error: 'Hourly rate cannot be negative' }, { status: 400 })
    }

    // Insert new professional
    const insertedRows = await sql`
      INSERT INTO professionals (
        name,
        email,
        phone,
        linkedin_url,
        professional_title,
        years_public_experience,
        industries,
        regions,
        rate_expectations_annual,
        rate_expectations_hourly,
        bio,
        certifications,
        years_of_experience,
        verification_status
      )
      VALUES (
        ${body.name},
        ${body.email},
        ${body.phone || null},
        ${body.linkedinUrl || null},
        ${body.professionalTitle},
        ${body.yearsPublicExperience},
        ${body.industries ? JSON.stringify(body.industries) : null},
        ${body.regions ? JSON.stringify(body.regions) : null},
        ${body.rateExpectationsAnnual || null},
        ${body.rateExpectationsHourly || null},
        ${body.bio || null},
        ${body.certifications ? JSON.stringify(body.certifications) : null},
        ${body.yearsOfExperience || body.yearsPublicExperience},
        'unverified'
      )
      RETURNING id, name, email, professional_title, verification_status, created_at
    ` as {
      id: string
      name: string
      email: string
      professional_title: string
      verification_status: string
      created_at: string
    }[]

    if (insertedRows.length === 0) {
      return NextResponse.json({ error: 'Failed to create professional' }, { status: 500 })
    }

    const professional = insertedRows[0]

    return NextResponse.json(
      {
        message: 'Professional registered successfully',
        professional: {
          id: professional.id,
          name: professional.name,
          email: professional.email,
          professionalTitle: professional.professional_title,
          verificationStatus: professional.verification_status,
          createdAt: professional.created_at,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error registering professional:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
