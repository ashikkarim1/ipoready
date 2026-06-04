/**
 * Auto-Populate Director Profile from LinkedIn Data
 * POST /api/directors-officers/[directorId]/auto-populate-from-linkedin
 *
 * Takes verified LinkedIn extraction data and updates the director record
 * with professional background information
 *
 * Request body (optional - if not provided, uses most recent verification):
 * {
 *   verificationId?: string (defaults to most recent)
 * }
 *
 * Updates these director fields:
 * - principalOccupation (from currentRole + company)
 * - education (from education array)
 * - certifications (from certifications array)
 * - boardExperience (from experience array, filtered for board roles)
 * - yearsExperience (calculated from earliest experience date)
 *
 * Response:
 * {
 *   success: boolean
 *   director: {
 *     id: string
 *     name: string
 *     principalOccupation: string
 *     yearsExperience: number
 *     education: Array<{ degree, school, field }>
 *     certifications: string[]
 *     boardExperience: Array<{ title, company, years }>
 *     bio: string (auto-generated summary)
 *     linkedinVerified: boolean
 *     verificationStatus: string
 *   }
 *   fieldsUpdated: string[]
 *   populationConfidence: number
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * Calculate years of experience from experience array
 */
function calculateYearsExperience(
  experience: Array<{ startDate?: string; endDate?: string }>
): number {
  if (!experience || experience.length === 0) return 0

  // Find earliest start date
  let earliestYear = new Date().getFullYear()
  for (const exp of experience) {
    if (exp.startDate) {
      const year = parseInt(exp.startDate.split('-')[0])
      if (!isNaN(year) && year < earliestYear) {
        earliestYear = year
      }
    }
  }

  const currentYear = new Date().getFullYear()
  const yearsExp = currentYear - earliestYear

  return Math.max(0, yearsExp)
}

/**
 * Generate auto bio from LinkedIn data
 */
function generateAutoBio(
  currentRole: string,
  currentCompany: string,
  yearsExperience: number,
  education: Array<{ degree: string; school: string }>,
  skills: string[]
): string {
  const lines: string[] = []

  if (currentRole && currentCompany) {
    lines.push(`${currentRole} at ${currentCompany}.`)
  }

  if (yearsExperience > 0) {
    lines.push(
      `${yearsExperience}+ years of professional experience in finance, operations, and corporate governance.`
    )
  }

  if (education.length > 0) {
    const topEduc = education[0]
    lines.push(`${topEduc.degree} from ${topEduc.school}.`)
  }

  if (skills.length > 0) {
    const topSkills = skills.slice(0, 3).join(', ')
    lines.push(`Expertise in ${topSkills}, and strategic leadership.`)
  }

  lines.push('Committed to effective board governance and shareholder value creation.')

  return lines.join(' ')
}

/**
 * Filter and transform experience into board experience
 */
function extractBoardExperience(
  experience: Array<{
    title: string
    company: string
    startDate?: string
    endDate?: string
  }>
): Array<{ title: string; company: string; years: number }> {
  const boardKeywords = [
    'board',
    'director',
    'chair',
    'chairman',
    'ceo',
    'cfo',
    'coo',
    'president',
    'vp',
    'vice',
    'executive',
  ]

  return experience
    .filter(exp => {
      const titleLower = (exp.title || '').toLowerCase()
      return boardKeywords.some(keyword => titleLower.includes(keyword))
    })
    .map(exp => {
      // Calculate duration
      let years = 1
      if (exp.startDate && exp.endDate) {
        const startYear = parseInt(exp.startDate.split('-')[0])
        const endYear = parseInt(exp.endDate.split('-')[0])
        years = Math.max(1, endYear - startYear)
      } else if (exp.startDate) {
        const startYear = parseInt(exp.startDate.split('-')[0])
        const currentYear = new Date().getFullYear()
        years = Math.max(1, currentYear - startYear)
      }

      return {
        title: exp.title,
        company: exp.company,
        years: Math.max(1, years),
      }
    })
}

export async function POST(
  request: NextRequest,
  { params }: { params: { directorId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { directorId } = params

    if (!directorId) {
      return NextResponse.json({ error: 'Missing director ID' }, { status: 400 })
    }

    // Get request body (optional)
    let body = {}
    try {
      body = await request.json()
    } catch {
      // Empty body is OK
    }

    const { verificationId } = body as { verificationId?: string }

    // Get director record
    const directors = await sql`
      SELECT
        id,
        name,
        professional_title,
        bio,
        years_of_experience,
        certifications,
        past_board_positions,
        linkedin_verified
      FROM professionals
      WHERE id = ${directorId}
    ` as Array<{
      id: string
      name: string
      professional_title: string
      bio: string | null
      years_of_experience: number | null
      certifications: string[] | null
      past_board_positions: any
      linkedin_verified: boolean
    }>

    if (directors.length === 0) {
      return NextResponse.json({ error: 'Director not found' }, { status: 404 })
    }

    const director = directors[0]

    // Get LinkedIn verification record
    let query = sql`
      SELECT
        id,
        extracted_education,
        extracted_experience,
        extracted_certifications,
        extracted_skills,
        profile_headline,
        confidence_score
      FROM director_linkedin_verification
      WHERE professional_id = ${directorId}
    `

    if (verificationId) {
      query = sql`
        SELECT
          id,
          extracted_education,
          extracted_experience,
          extracted_certifications,
          extracted_skills,
          profile_headline,
          confidence_score
        FROM director_linkedin_verification
        WHERE id = ${verificationId}
          AND professional_id = ${directorId}
      `
    } else {
      query = sql`
        SELECT
          id,
          extracted_education,
          extracted_experience,
          extracted_certifications,
          extracted_skills,
          profile_headline,
          confidence_score
        FROM director_linkedin_verification
        WHERE professional_id = ${directorId}
        ORDER BY verified_at DESC
        LIMIT 1
      `
    }

    const verifications = (await query) as Array<{
      id: string
      extracted_education: any
      extracted_experience: any
      extracted_certifications: any
      extracted_skills: string[]
      profile_headline: string
      confidence_score: number
    }>

    if (verifications.length === 0) {
      return NextResponse.json(
        { error: 'No LinkedIn verification found for this director' },
        { status: 404 }
      )
    }

    const verification = verifications[0]

    // Parse extracted data
    let education: Array<{ degree: string; school: string; field: string }> = []
    try {
      const edu = Array.isArray(verification.extracted_education)
        ? verification.extracted_education
        : JSON.parse(verification.extracted_education || '[]')
      education = edu.map((e: any) => ({
        degree: e.degree || '',
        school: e.school || '',
        field: e.field || e.field_of_study || '',
      }))
    } catch {
      education = []
    }

    let experience: Array<{ title: string; company: string; startDate?: string; endDate?: string }> = []
    try {
      const exp = Array.isArray(verification.extracted_experience)
        ? verification.extracted_experience
        : JSON.parse(verification.extracted_experience || '[]')
      experience = exp.map((e: any) => ({
        title: e.title || '',
        company: e.company || '',
        startDate: e.startDate || e.start_date,
        endDate: e.endDate || e.end_date,
      }))
    } catch {
      experience = []
    }

    let certifications: Array<{ name: string }> = []
    try {
      const certs = Array.isArray(verification.extracted_certifications)
        ? verification.extracted_certifications
        : JSON.parse(verification.extracted_certifications || '[]')
      certifications = certs.map((c: any) => ({ name: c.name || '' }))
    } catch {
      certifications = []
    }

    let skills: string[] = []
    try {
      skills = Array.isArray(verification.extracted_skills)
        ? verification.extracted_skills
        : JSON.parse(verification.extracted_skills || '[]')
    } catch {
      skills = []
    }

    // Calculate derived values
    const yearsExperience = calculateYearsExperience(experience)
    const currentRole = experience[0]?.title || director.professional_title || 'Director'
    const currentCompany = experience[0]?.company || 'Not specified'
    const principalOccupation = `${currentRole} at ${currentCompany}`
    const boardExperience = extractBoardExperience(experience)
    const certStrings = certifications.map(c => c.name).filter(name => name)
    const autoBio = generateAutoBio(currentRole, currentCompany, yearsExperience, education, skills)

    // Track which fields are being updated
    const fieldsUpdated: string[] = []
    if (principalOccupation !== director.bio) {
      fieldsUpdated.push('principalOccupation')
    }
    if (yearsExperience !== director.years_of_experience) {
      fieldsUpdated.push('yearsExperience')
    }
    if (education.length > 0) {
      fieldsUpdated.push('education')
    }
    if (certStrings.length > 0) {
      fieldsUpdated.push('certifications')
    }
    if (boardExperience.length > 0) {
      fieldsUpdated.push('boardExperience')
    }
    if (!director.bio) {
      fieldsUpdated.push('bio')
    }

    // Update professional record with extracted data
    const updateResult = await sql`
      UPDATE professionals
      SET
        bio = COALESCE(${autoBio}, bio),
        years_of_experience = ${yearsExperience},
        extracted_education = ${JSON.stringify(education)},
        extracted_certifications = ${JSON.stringify(certStrings)},
        past_board_positions = ${JSON.stringify(boardExperience)},
        linkedin_verified = true,
        verification_status = 'verified',
        updated_at = NOW()
      WHERE id = ${directorId}
      RETURNING
        id,
        name,
        professional_title,
        bio,
        years_of_experience,
        certifications,
        past_board_positions,
        linkedin_verified,
        verification_status
    ` as Array<{
      id: string
      name: string
      professional_title: string
      bio: string | null
      years_of_experience: number
      certifications: string[] | null
      past_board_positions: any
      linkedin_verified: boolean
      verification_status: string
    }>

    if (updateResult.length === 0) {
      return NextResponse.json({ error: 'Failed to update director' }, { status: 500 })
    }

    const updatedDirector = updateResult[0]

    return NextResponse.json({
      success: true,
      director: {
        id: updatedDirector.id,
        name: updatedDirector.name,
        principalOccupation: updatedDirector.bio,
        yearsExperience: updatedDirector.years_of_experience,
        education,
        certifications: certStrings,
        boardExperience,
        bio: updatedDirector.bio,
        linkedinVerified: updatedDirector.linkedin_verified,
        verificationStatus: updatedDirector.verification_status,
      },
      fieldsUpdated,
      populationConfidence: verification.confidence_score,
    })
  } catch (error) {
    console.error('Error auto-populating from LinkedIn:', error)
    return NextResponse.json(
      {
        error: 'Failed to auto-populate from LinkedIn',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
