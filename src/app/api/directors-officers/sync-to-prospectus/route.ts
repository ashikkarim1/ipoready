/**
 * POST /api/directors-officers/sync-to-prospectus
 *
 * Sync director/officer information to prospectus document
 * Generates formatted director bios with complete professional background
 *
 * Request Body:
 * {
 *   directorIds: string[]              // Array of professional IDs (directors/officers)
 *   prospectusDocumentId?: string      // Target prospectus document ID (optional)
 * }
 *
 * Response:
 * {
 *   synced: boolean
 *   syncedCount: number
 *   directors: {
 *     id: string
 *     name: string
 *     title: string
 *     independence: string
 *     principalOccupation: string
 *     yearsExperience: number
 *     education: Array<{degree, school, field}>
 *     certifications: string[]
 *     boardExperience: Array<{title, company, years}>
 *     stockOwnership: {percentage: number, status: string}
 *     relatedPartyTransactions: string[]
 *     linkedInVerified: boolean
 *     verificationStatus: string
 *   }[]
 *   prospectusSection: "management-directors"
 *   complianceStatus: {
 *     allRequiredFieldsPresent: boolean
 *     missingFields: string[]
 *     warnings: string[]
 *   }
 *   syncStatus: Array<{
 *     directorId: string
 *     syncId: string
 *     status: 'synced' | 'partial' | 'error'
 *     syncedAt: string
 *     lastError?: string
 *   }>
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface DirectorData {
  professional_id: string
  name: string
  professional_title: string
  bio: string | null
  past_board_positions: any
  certifications: string[] | null
  years_of_experience: number | null
  linkedin_verified: boolean
  verification_status: string
  industries: string[] | null
  regions: string[] | null
}

interface EducationData {
  professional_id: string
  extracted_education: any
}

interface LinkedInData {
  professional_id: string
  verification_status: string
  confidence_score: number
  extracted_certifications: any
  extracted_skills: string[]
}

interface ComplianceIssue {
  directorId: string
  field: string
  reason: string
  severity: 'error' | 'warning'
}

interface SyncRecord {
  directorId: string
  syncId: string
  status: 'synced' | 'partial' | 'error'
  syncedAt: string
  lastError?: string
}

interface FormattedDirector {
  id: string
  name: string
  title: string
  independence: string
  principalOccupation: string
  yearsExperience: number
  education: Array<{
    degree: string
    school: string
    field: string
  }>
  certifications: string[]
  boardExperience: Array<{
    title: string
    company: string
    years: number
  }>
  stockOwnership: {
    percentage: number
    status: string
  }
  relatedPartyTransactions: string[]
  linkedInVerified: boolean
  verificationStatus: string
}

async function buildDirectorBio(
  professional: DirectorData,
  linkedInData?: LinkedInData,
  educationData?: EducationData
): Promise<{ bio: FormattedDirector; issues: ComplianceIssue[] }> {
  const issues: ComplianceIssue[] = []

  // Determine independence status
  let independence = 'Dependent'
  if (professional.verification_status === 'verified') {
    independence = 'Independent'
  }

  // Extract education
  const education: Array<{ degree: string; school: string; field: string }> = []
  if (educationData?.extracted_education) {
    try {
      const eduArray = Array.isArray(educationData.extracted_education)
        ? educationData.extracted_education
        : [educationData.extracted_education]

      for (const edu of eduArray) {
        if (edu.school && edu.degree) {
          education.push({
            degree: edu.degree || 'Degree',
            school: edu.school || '',
            field: edu.field_of_study || edu.field || '',
          })
        }
      }
    } catch {
      issues.push({
        directorId: professional.professional_id,
        field: 'education',
        reason: 'Failed to parse education data',
        severity: 'warning',
      })
    }
  }

  if (education.length === 0) {
    issues.push({
      directorId: professional.professional_id,
      field: 'education',
      reason: 'No education information available',
      severity: 'warning',
    })
  }

  // Extract certifications
  const certifications = new Set<string>()

  if (linkedInData?.extracted_certifications) {
    try {
      const certs = Array.isArray(linkedInData.extracted_certifications)
        ? linkedInData.extracted_certifications
        : [linkedInData.extracted_certifications]

      for (const cert of certs) {
        if (cert.name) {
          certifications.add(cert.name)
        }
      }
    } catch {
      issues.push({
        directorId: professional.professional_id,
        field: 'certifications',
        reason: 'Failed to parse LinkedIn certifications',
        severity: 'warning',
      })
    }
  }

  if (professional.certifications && Array.isArray(professional.certifications)) {
    for (const cert of professional.certifications) {
      if (cert) {
        certifications.add(cert)
      }
    }
  }

  // Extract board experience
  const boardExperience: Array<{ title: string; company: string; years: number }> = []
  if (professional.past_board_positions) {
    try {
      const positions = Array.isArray(professional.past_board_positions)
        ? professional.past_board_positions
        : [professional.past_board_positions]

      for (const pos of positions) {
        if (pos.title && pos.company) {
          boardExperience.push({
            title: pos.title,
            company: pos.company,
            years: pos.years || 1,
          })
        }
      }
    } catch {
      issues.push({
        directorId: professional.professional_id,
        field: 'board_experience',
        reason: 'Failed to parse board positions',
        severity: 'warning',
      })
    }
  }

  // Compliance checks
  if (!professional.name) {
    issues.push({
      directorId: professional.professional_id,
      field: 'name',
      reason: 'Missing director name',
      severity: 'error',
    })
  }

  if (!professional.professional_title) {
    issues.push({
      directorId: professional.professional_id,
      field: 'professional_title',
      reason: 'Missing professional title',
      severity: 'error',
    })
  }

  if (!professional.years_of_experience) {
    issues.push({
      directorId: professional.professional_id,
      field: 'years_of_experience',
      reason: 'Missing years of experience',
      severity: 'warning',
    })
  }

  const formatted: FormattedDirector = {
    id: professional.professional_id,
    name: professional.name || 'Unknown',
    title: professional.professional_title || 'Unknown',
    independence,
    principalOccupation: professional.bio || professional.professional_title || '',
    yearsExperience: professional.years_of_experience || 0,
    education,
    certifications: Array.from(certifications),
    boardExperience,
    stockOwnership: {
      percentage: 0,
      status: 'not_specified',
    },
    relatedPartyTransactions: [],
    linkedInVerified: professional.linkedin_verified || false,
    verificationStatus: professional.verification_status || 'unverified',
  }

  return { bio: formatted, issues }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { directorIds: string[]; prospectusDocumentId?: string }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  const { directorIds, prospectusDocumentId } = body

  if (!Array.isArray(directorIds) || directorIds.length === 0) {
    return NextResponse.json(
      { error: 'directorIds must be a non-empty array' },
      { status: 400 }
    )
  }

  try {
    // Fetch all director data
    const directorRows = await sql`
      SELECT
        id as professional_id,
        name,
        professional_title,
        bio,
        past_board_positions,
        certifications,
        years_of_experience,
        linkedin_verified,
        verification_status,
        industries,
        regions
      FROM professionals
      WHERE id = ANY(${directorIds})
    ` as DirectorData[]

    if (directorRows.length === 0) {
      return NextResponse.json(
        { error: 'No directors found with provided IDs' },
        { status: 404 }
      )
    }

    // Fetch LinkedIn verification data for all directors
    const linkedInDataMap = new Map<string, LinkedInData>()
    const linkedInRows = await sql`
      SELECT
        professional_id,
        verification_status,
        confidence_score,
        extracted_certifications,
        extracted_skills
      FROM director_linkedin_verification
      WHERE professional_id = ANY(${directorIds})
        AND verification_status = 'verified'
      ORDER BY verified_at DESC
    ` as LinkedInData[]

    for (const row of linkedInRows) {
      if (!linkedInDataMap.has(row.professional_id)) {
        linkedInDataMap.set(row.professional_id, row)
      }
    }

    // Fetch education data for all directors
    const educationDataMap = new Map<string, EducationData>()
    const educationRows = await sql`
      SELECT
        professional_id,
        extracted_education
      FROM director_linkedin_verification
      WHERE professional_id = ANY(${directorIds})
        AND extracted_education IS NOT NULL
      ORDER BY verified_at DESC
    ` as EducationData[]

    for (const row of educationRows) {
      if (!educationDataMap.has(row.professional_id)) {
        educationDataMap.set(row.professional_id, row)
      }
    }

    // Build formatted director bios
    const formattedDirectors: FormattedDirector[] = []
    const allComplianceIssues: ComplianceIssue[] = []

    for (const director of directorRows) {
      const linkedInData = linkedInDataMap.get(director.professional_id)
      const educationData = educationDataMap.get(director.professional_id)

      const { bio, issues } = await buildDirectorBio(director, linkedInData, educationData)

      formattedDirectors.push(bio)
      allComplianceIssues.push(...issues)
    }

    // Determine overall compliance status
    const errorIssues = allComplianceIssues.filter(i => i.severity === 'error')
    const warningIssues = allComplianceIssues.filter(i => i.severity === 'warning')
    const allRequiredFieldsPresent = errorIssues.length === 0

    // Record sync status in database
    const syncRecords: SyncRecord[] = []
    const now = new Date().toISOString()

    for (const director of formattedDirectors) {
      const syncKey = `board_member_${director.id.substring(0, 8)}`
      const directorErrors = errorIssues.filter(i => i.directorId === director.id)
      const syncStatus = directorErrors.length === 0 ? 'synced' : 'partial'

      // Create or update sync record
      const syncId = await sql`
        INSERT INTO director_prospectus_sync (
          professional_id,
          prospectus_document_id,
          sync_key,
          section_type,
          sync_status,
          sync_confidence,
          last_synced_at,
          synced_fields,
          created_by_user_id
        )
        VALUES (
          ${director.id},
          ${prospectusDocumentId || null},
          ${syncKey},
          'board_of_directors',
          ${syncStatus},
          ${allRequiredFieldsPresent ? 1.0 : 0.8},
          ${now},
          ${JSON.stringify({
            name: 'name',
            title: 'professional_title',
            bio: 'bio',
            education: 'extracted_education',
            certifications: 'certifications',
            board_experience: 'past_board_positions',
          })},
          ${user.id}
        )
        ON CONFLICT (professional_id, prospectus_document_id, section_type)
        DO UPDATE SET
          sync_status = EXCLUDED.sync_status,
          last_synced_at = EXCLUDED.last_synced_at,
          sync_confidence = EXCLUDED.sync_confidence,
          updated_by_user_id = ${user.id}
        RETURNING id
      ` as Array<{ id: string }>

      syncRecords.push({
        directorId: director.id,
        syncId: syncId[0]?.id || 'unknown',
        status: syncStatus,
        syncedAt: now,
      })
    }

    return NextResponse.json({
      synced: true,
      syncedCount: formattedDirectors.length,
      directors: formattedDirectors,
      prospectusSection: 'management-directors',
      complianceStatus: {
        allRequiredFieldsPresent,
        missingFields: errorIssues.map(i => `${i.directorId}: ${i.field}`),
        warnings: warningIssues.map(i => `${i.directorId}: ${i.field} - ${i.reason}`),
      },
      syncStatus: syncRecords,
    })
  } catch (error) {
    console.error('Error syncing directors to prospectus:', error)
    return NextResponse.json(
      { error: 'Failed to sync directors to prospectus' },
      { status: 500 }
    )
  }
}
