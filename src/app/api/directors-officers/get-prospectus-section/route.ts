/**
 * GET /api/directors-officers/get-prospectus-section
 *
 * Retrieve all directors/officers formatted for prospectus filing
 * Returns organized by role/committee with complete professional information
 *
 * Query Params:
 * - prospectusDocumentId?: string  (optional, filters to specific prospectus)
 * - sectionType?: string            (optional, 'board_of_directors', 'management_team', 'audit_committee', etc)
 * - includePhotos?: boolean         (optional, whether to include photo URLs)
 *
 * Response:
 * {
 *   prospectusSection: "management-directors"
 *   totalDirectors: number
 *   boardOfDirectors: {
 *     count: number
 *     role: "Board Member"
 *     members: [FormattedDirector][]
 *   }
 *   auditCommittee: {
 *     count: number
 *     role: "Audit Committee Member"
 *     members: [FormattedDirector][]
 *   }
 *   compensationCommittee: {
 *     count: number
 *     role: "Compensation Committee Member"
 *     members: [FormattedDirector][]
 *   }
 *   executiveManagement: {
 *     count: number
 *     role: "Executive Officer"
 *     members: [FormattedDirector][]
 *   }
 *   complianceStatus: {
 *     dataCompleteness: number (0-100)
 *     allVerified: boolean
 *     lastSyncedAt: string
 *     outOfSyncCount: number
 *   }
 *   filingSummary: {
 *     readyForFiling: boolean
 *     missingRequiredFields: string[]
 *     recommendations: string[]
 *   }
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface DirectorRow {
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
}

interface SyncRow {
  professional_id: string
  section_type: string
  sync_status: string
  is_stale: boolean
  last_synced_at: string
}

interface LinkedInRow {
  professional_id: string
  extracted_education: any
  extracted_certifications: any
  confidence_score: number
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
  lastSynced?: string
  syncStatus?: string
}

function formatDirectorFromRow(
  director: DirectorRow,
  linkedInData?: LinkedInRow
): FormattedDirector {
  // Extract education
  const education: Array<{ degree: string; school: string; field: string }> = []
  if (linkedInData?.extracted_education) {
    try {
      const eduArray = Array.isArray(linkedInData.extracted_education)
        ? linkedInData.extracted_education
        : [linkedInData.extracted_education]

      for (const edu of eduArray) {
        if (edu.school && edu.degree) {
          education.push({
            degree: edu.degree,
            school: edu.school,
            field: edu.field_of_study || edu.field || '',
          })
        }
      }
    } catch {
      // Silently skip on parse error
    }
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
      // Silently skip on parse error
    }
  }

  if (director.certifications && Array.isArray(director.certifications)) {
    for (const cert of director.certifications) {
      if (cert) {
        certifications.add(cert)
      }
    }
  }

  // Extract board experience
  const boardExperience: Array<{ title: string; company: string; years: number }> = []
  if (director.past_board_positions) {
    try {
      const positions = Array.isArray(director.past_board_positions)
        ? director.past_board_positions
        : [director.past_board_positions]

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
      // Silently skip on parse error
    }
  }

  // Determine independence
  const independence = director.verification_status === 'verified' ? 'Independent' : 'Dependent'

  return {
    id: director.professional_id,
    name: director.name,
    title: director.professional_title,
    independence,
    principalOccupation: director.bio || director.professional_title,
    yearsExperience: director.years_of_experience || 0,
    education,
    certifications: Array.from(certifications),
    boardExperience,
    stockOwnership: {
      percentage: 0,
      status: 'not_specified',
    },
    relatedPartyTransactions: [],
    linkedInVerified: director.linkedin_verified,
    verificationStatus: director.verification_status,
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = req.nextUrl.searchParams
  const prospectusDocumentId = searchParams.get('prospectusDocumentId') || null
  const sectionType = searchParams.get('sectionType') || null

  try {
    // Fetch all synced directors for this company's prospectus
    let syncQuery = sql`
      SELECT
        dps.professional_id,
        dps.section_type,
        dps.sync_status,
        dps.is_stale,
        dps.last_synced_at
      FROM director_prospectus_sync dps
      WHERE dps.prospectus_document_id IS NOT NULL
    `

    if (prospectusDocumentId) {
      syncQuery = sql`
        SELECT
          dps.professional_id,
          dps.section_type,
          dps.sync_status,
          dps.is_stale,
          dps.last_synced_at
        FROM director_prospectus_sync dps
        JOIN prospectus_documents pd ON dps.prospectus_document_id = pd.id
        WHERE pd.company_id = ${user.companyId}
          AND dps.prospectus_document_id = ${prospectusDocumentId}
      `
    } else {
      syncQuery = sql`
        SELECT
          dps.professional_id,
          dps.section_type,
          dps.sync_status,
          dps.is_stale,
          dps.last_synced_at
        FROM director_prospectus_sync dps
        JOIN prospectus_documents pd ON dps.prospectus_document_id = pd.id
        WHERE pd.company_id = ${user.companyId}
      `
    }

    if (sectionType) {
      syncQuery = sql`
        SELECT
          dps.professional_id,
          dps.section_type,
          dps.sync_status,
          dps.is_stale,
          dps.last_synced_at
        FROM director_prospectus_sync dps
        JOIN prospectus_documents pd ON dps.prospectus_document_id = pd.id
        WHERE pd.company_id = ${user.companyId}
          AND dps.section_type = ${sectionType}
          ${prospectusDocumentId ? sql`AND dps.prospectus_document_id = ${prospectusDocumentId}` : sql``}
      `
    }

    const syncRows = await syncQuery as SyncRow[]

    if (syncRows.length === 0) {
      return NextResponse.json({
        prospectusSection: 'management-directors',
        totalDirectors: 0,
        boardOfDirectors: { count: 0, role: 'Board Member', members: [] },
        auditCommittee: { count: 0, role: 'Audit Committee Member', members: [] },
        compensationCommittee: { count: 0, role: 'Compensation Committee Member', members: [] },
        executiveManagement: { count: 0, role: 'Executive Officer', members: [] },
        complianceStatus: {
          dataCompleteness: 0,
          allVerified: false,
          lastSyncedAt: null,
          outOfSyncCount: 0,
        },
        filingSummary: {
          readyForFiling: false,
          missingRequiredFields: ['No directors synced yet'],
          recommendations: ['Sync directors to prospectus document'],
        },
      })
    }

    const directorIds = syncRows.map(r => r.professional_id)

    // Fetch director data
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
        industries
      FROM professionals
      WHERE id = ANY(${directorIds})
    ` as DirectorRow[]

    // Fetch LinkedIn data for all directors
    const linkedInDataMap = new Map<string, LinkedInRow>()
    const linkedInRows = await sql`
      SELECT
        professional_id,
        extracted_education,
        extracted_certifications,
        confidence_score
      FROM director_linkedin_verification
      WHERE professional_id = ANY(${directorIds})
        AND verification_status = 'verified'
      ORDER BY verified_at DESC
    ` as LinkedInRow[]

    for (const row of linkedInRows) {
      if (!linkedInDataMap.has(row.professional_id)) {
        linkedInDataMap.set(row.professional_id, row)
      }
    }

    // Format directors and organize by section
    const directorsBySection: Record<string, (FormattedDirector & { syncInfo: SyncRow })[]> = {
      board_of_directors: [],
      management_team: [],
      audit_committee: [],
      compensation_committee: [],
      other: [],
    }

    const allFormattedDirectors: FormattedDirector[] = []

    for (const director of directorRows) {
      const linkedInData = linkedInDataMap.get(director.professional_id)
      const formatted = formatDirectorFromRow(director, linkedInData)

      // Find sync info for this director
      const syncInfo = syncRows.find(s => s.professional_id === director.professional_id)

      if (syncInfo) {
        const directorWithSync = {
          ...formatted,
          syncInfo,
          lastSynced: syncInfo.last_synced_at,
          syncStatus: syncInfo.sync_status,
        }

        const sectionKey = syncInfo.section_type as keyof typeof directorsBySection
        if (directorsBySection[sectionKey]) {
          directorsBySection[sectionKey].push(directorWithSync)
        } else {
          directorsBySection.other.push(directorWithSync)
        }
      }

      allFormattedDirectors.push(formatted)
    }

    // Calculate compliance metrics
    const outOfSyncCount = syncRows.filter(s => s.is_stale).length
    const verifiedCount = directorRows.filter(d => d.verification_status === 'verified').length
    const allVerified = verifiedCount === directorRows.length

    // Calculate data completeness
    let totalFields = 0
    let filledFields = 0

    for (const director of directorRows) {
      totalFields += 6 // name, title, bio, education, certifications, board_experience
      if (director.name) filledFields++
      if (director.professional_title) filledFields++
      if (director.bio) filledFields++
      if (director.certifications && director.certifications.length > 0) filledFields++
      if (director.past_board_positions) filledFields++
      if (director.years_of_experience) filledFields++
    }

    const dataCompleteness = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0
    const lastSyncedAt = syncRows.length > 0
      ? new Date(Math.max(...syncRows.map(r => new Date(r.last_synced_at).getTime()))).toISOString()
      : null

    // Determine if ready for filing
    const readyForFiling = allVerified && dataCompleteness >= 80 && outOfSyncCount === 0
    const missingFields: string[] = []
    const recommendations: string[] = []

    if (!allVerified) {
      const unverifiedCount = directorRows.length - verifiedCount
      missingFields.push(`${unverifiedCount} director(s) not verified`)
      recommendations.push(`Verify ${unverifiedCount} director(s) via LinkedIn`)
    }

    if (dataCompleteness < 80) {
      missingFields.push(`Data completeness at ${dataCompleteness}%`)
      recommendations.push('Complete director profiles with education, certifications, and board experience')
    }

    if (outOfSyncCount > 0) {
      missingFields.push(`${outOfSyncCount} director(s) out of sync`)
      recommendations.push('Re-sync directors with prospectus to update changes')
    }

    return NextResponse.json({
      prospectusSection: 'management-directors',
      totalDirectors: allFormattedDirectors.length,
      boardOfDirectors: {
        count: directorsBySection.board_of_directors.length,
        role: 'Board Member',
        members: directorsBySection.board_of_directors.map(d => ({
          ...d,
          lastSynced: d.syncInfo?.last_synced_at,
          syncStatus: d.syncInfo?.sync_status,
        })),
      },
      auditCommittee: {
        count: directorsBySection.audit_committee.length,
        role: 'Audit Committee Member',
        members: directorsBySection.audit_committee.map(d => ({
          ...d,
          lastSynced: d.syncInfo?.last_synced_at,
          syncStatus: d.syncInfo?.sync_status,
        })),
      },
      compensationCommittee: {
        count: directorsBySection.compensation_committee.length,
        role: 'Compensation Committee Member',
        members: directorsBySection.compensation_committee.map(d => ({
          ...d,
          lastSynced: d.syncInfo?.last_synced_at,
          syncStatus: d.syncInfo?.sync_status,
        })),
      },
      executiveManagement: {
        count: directorsBySection.management_team.length,
        role: 'Executive Officer',
        members: directorsBySection.management_team.map(d => ({
          ...d,
          lastSynced: d.syncInfo?.last_synced_at,
          syncStatus: d.syncInfo?.sync_status,
        })),
      },
      complianceStatus: {
        dataCompleteness,
        allVerified,
        lastSyncedAt,
        outOfSyncCount,
      },
      filingSummary: {
        readyForFiling,
        missingRequiredFields: missingFields,
        recommendations,
      },
    })
  } catch (error) {
    console.error('Error retrieving prospectus section:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve prospectus section' },
      { status: 500 }
    )
  }
}
