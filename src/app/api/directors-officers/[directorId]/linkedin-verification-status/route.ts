/**
 * LinkedIn Verification Status API
 * GET /api/directors-officers/[directorId]/linkedin-verification-status
 *
 * Retrieve the current LinkedIn verification status and extracted data
 * for a specific director
 *
 * Response:
 * {
 *   verified: boolean
 *   extractedAt?: ISO string
 *   confidence?: number (0.0-1.0)
 *   data?: {
 *     profileHeadline: string
 *     currentCompany: string
 *     currentRole: string
 *     education: Array<{ school, degree, field, year }>
 *     experience: Array<{ title, company, startDate, endDate, description }>
 *     certifications: Array<{ name, issuer, issuedDate }>
 *     skills: string[]
 *   }
 *   verificationId?: string
 *   verificationStatus?: 'pending' | 'verified' | 'failed' | 'expired'
 *   linkedinUrl?: string
 *   verificationMethod?: string
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(
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

    // Verify that the director exists
    const directorCheck = await sql`
      SELECT id, name, linkedin_verified FROM professionals WHERE id = ${directorId}
    ` as Array<{ id: string; name: string; linkedin_verified: boolean }>

    if (directorCheck.length === 0) {
      return NextResponse.json({ error: 'Director not found' }, { status: 404 })
    }

    // Get LinkedIn verification record
    const verifications = await sql`
      SELECT
        id,
        linkedin_url,
        verification_status,
        verification_method,
        verified_at,
        extracted_education,
        extracted_experience,
        extracted_certifications,
        extracted_skills,
        confidence_score,
        profile_headline,
        profile_summary
      FROM director_linkedin_verification
      WHERE professional_id = ${directorId}
      ORDER BY verified_at DESC
      LIMIT 1
    ` as Array<{
      id: string
      linkedin_url: string
      verification_status: string
      verification_method: string
      verified_at: string | null
      extracted_education: any
      extracted_experience: any
      extracted_certifications: any
      extracted_skills: string[]
      confidence_score: number
      profile_headline: string
      profile_summary: string
    }>

    // If no verification exists, return unverified status
    if (verifications.length === 0) {
      return NextResponse.json({
        verified: false,
        verificationStatus: 'pending',
        data: null,
      })
    }

    const verification = verifications[0]

    // Build response with extracted data
    const isVerified = verification.verification_status === 'verified'

    // Parse education array
    let education: Array<{ school: string; degree: string; field: string; year?: number }> = []
    try {
      const edu = Array.isArray(verification.extracted_education)
        ? verification.extracted_education
        : JSON.parse(verification.extracted_education || '[]')
      education = edu.map((e: any) => ({
        school: e.school || '',
        degree: e.degree || '',
        field: e.field || e.field_of_study || '',
        year: e.year || e.end_date ? parseInt(e.end_date.split('-')[0]) : undefined,
      }))
    } catch {
      education = []
    }

    // Parse experience array
    let experience: Array<{ title: string; company: string; startDate?: string; endDate?: string; description?: string }> = []
    try {
      const exp = Array.isArray(verification.extracted_experience)
        ? verification.extracted_experience
        : JSON.parse(verification.extracted_experience || '[]')
      experience = exp.map((e: any) => ({
        title: e.title || '',
        company: e.company || '',
        startDate: e.startDate || e.start_date,
        endDate: e.endDate || e.end_date,
        description: e.description || '',
      }))
    } catch {
      experience = []
    }

    // Parse certifications array
    let certifications: Array<{ name: string; issuer?: string; issuedDate?: string }> = []
    try {
      const certs = Array.isArray(verification.extracted_certifications)
        ? verification.extracted_certifications
        : JSON.parse(verification.extracted_certifications || '[]')
      certifications = certs.map((c: any) => ({
        name: c.name || '',
        issuer: c.issuer || '',
        issuedDate: c.issuedDate || c.issued_date,
      }))
    } catch {
      certifications = []
    }

    // Parse skills array
    let skills: string[] = []
    try {
      skills = Array.isArray(verification.extracted_skills)
        ? verification.extracted_skills
        : JSON.parse(verification.extracted_skills || '[]')
    } catch {
      skills = []
    }

    // Build extracted data object
    const extractedData = isVerified
      ? {
          profileHeadline: verification.profile_headline || '',
          currentCompany: experience[0]?.company || '',
          currentRole: experience[0]?.title || '',
          education,
          experience,
          certifications,
          skills,
        }
      : null

    return NextResponse.json({
      verified: isVerified,
      verificationStatus: verification.verification_status,
      extractedAt: verification.verified_at,
      confidence: verification.confidence_score,
      data: extractedData,
      verificationId: verification.id,
      linkedinUrl: verification.linkedin_url,
      verificationMethod: verification.verification_method,
    })
  } catch (error) {
    console.error('Error retrieving LinkedIn verification status:', error)
    return NextResponse.json(
      {
        error: 'Failed to retrieve verification status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
