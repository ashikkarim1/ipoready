/**
 * Directors/Officers Prospectus Sync Utilities
 *
 * Shared functions for formatting director data, validating compliance,
 * and managing prospectus synchronization
 */

import { sql } from '@/lib/db'

export interface DirectorFormattedBio {
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

export interface ComplianceCheckResult {
  directorId: string
  field: string
  reason: string
  severity: 'error' | 'warning'
}

export interface SyncStatusUpdate {
  directorId: string
  syncId: string
  status: 'synced' | 'partial' | 'error'
  syncedAt: string
  lastError?: string
}

/**
 * Validate that all required fields are present for a director
 * Required fields: name, title, years_of_experience
 * Recommended fields: bio, education, certifications, board positions
 */
export function validateDirectorCompliance(
  director: any
): ComplianceCheckResult[] {
  const issues: ComplianceCheckResult[] = []

  if (!director.professional_id) {
    issues.push({
      directorId: director.professional_id || 'unknown',
      field: 'professional_id',
      reason: 'Missing director ID',
      severity: 'error',
    })
  }

  if (!director.name || director.name.trim() === '') {
    issues.push({
      directorId: director.professional_id,
      field: 'name',
      reason: 'Missing or empty director name',
      severity: 'error',
    })
  }

  if (!director.professional_title || director.professional_title.trim() === '') {
    issues.push({
      directorId: director.professional_id,
      field: 'professional_title',
      reason: 'Missing or empty professional title',
      severity: 'error',
    })
  }

  if (director.years_of_experience === null || director.years_of_experience === undefined) {
    issues.push({
      directorId: director.professional_id,
      field: 'years_of_experience',
      reason: 'Missing years of experience',
      severity: 'warning',
    })
  }

  if (!director.bio || director.bio.trim() === '') {
    issues.push({
      directorId: director.professional_id,
      field: 'bio',
      reason: 'Missing principal occupation/bio',
      severity: 'warning',
    })
  }

  if (!director.certification || (Array.isArray(director.certifications) && director.certifications.length === 0)) {
    issues.push({
      directorId: director.professional_id,
      field: 'certifications',
      reason: 'No certifications listed',
      severity: 'warning',
    })
  }

  return issues
}

/**
 * Flatten and normalize education array from LinkedIn extraction
 */
export function extractEducation(educationData: any): Array<{ degree: string; school: string; field: string }> {
  if (!educationData) return []

  try {
    const eduArray = Array.isArray(educationData) ? educationData : [educationData]
    return eduArray
      .filter(edu => edu && edu.school && edu.degree)
      .map(edu => ({
        degree: edu.degree || '',
        school: edu.school || '',
        field: edu.field_of_study || edu.field || '',
      }))
  } catch {
    return []
  }
}

/**
 * Flatten and normalize certifications from multiple sources
 */
export function extractCertifications(
  linkedInCerts: any,
  directCerts: string[] | null
): string[] {
  const certSet = new Set<string>()

  // From LinkedIn verification
  if (linkedInCerts) {
    try {
      const certs = Array.isArray(linkedInCerts) ? linkedInCerts : [linkedInCerts]
      for (const cert of certs) {
        if (cert && cert.name) {
          certSet.add(cert.name)
        }
      }
    } catch {
      // Silently skip parse errors
    }
  }

  // From direct input
  if (directCerts && Array.isArray(directCerts)) {
    for (const cert of directCerts) {
      if (cert && typeof cert === 'string') {
        certSet.add(cert)
      }
    }
  }

  return Array.from(certSet).sort()
}

/**
 * Flatten and normalize board positions/experience
 */
export function extractBoardExperience(
  boardPositions: any
): Array<{ title: string; company: string; years: number }> {
  if (!boardPositions) return []

  try {
    const positions = Array.isArray(boardPositions) ? boardPositions : [boardPositions]
    return positions
      .filter(pos => pos && pos.title && pos.company)
      .map(pos => ({
        title: pos.title || '',
        company: pos.company || '',
        years: parseInt(pos.years, 10) || 1,
      }))
  } catch {
    return []
  }
}

/**
 * Check if director has been verified via LinkedIn
 */
export async function checkDirectorLinkInVerification(
  directorId: string
): Promise<{
  verified: boolean
  confidence: number
  verifiedAt?: string
}> {
  try {
    const rows = await sql`
      SELECT
        verification_status,
        confidence_score,
        verified_at
      FROM director_linkedin_verification
      WHERE professional_id = ${directorId}
        AND verification_status = 'verified'
      ORDER BY verified_at DESC
      LIMIT 1
    ` as Array<any>

    if (rows.length === 0) {
      return { verified: false, confidence: 0 }
    }

    const row = rows[0]
    return {
      verified: true,
      confidence: parseFloat(row.confidence_score) || 0.8,
      verifiedAt: row.verified_at,
    }
  } catch {
    return { verified: false, confidence: 0 }
  }
}

/**
 * Check stock ownership percentage for a director
 * TODO: Integrate with cap_tables when available
 */
export async function getDirectorStockOwnership(
  directorId: string,
  companyId: string
): Promise<{ percentage: number; status: string }> {
  try {
    // Placeholder for future cap table integration
    // Currently returns 'not_specified' status
    return {
      percentage: 0,
      status: 'not_specified',
    }
  } catch {
    return {
      percentage: 0,
      status: 'error',
    }
  }
}

/**
 * Check for related party transactions involving a director
 * TODO: Integrate with related_party_transactions table when available
 */
export async function getDirectorRelatedPartyTransactions(
  directorId: string,
  companyId: string
): Promise<string[]> {
  try {
    // Placeholder for future related party transactions integration
    return []
  } catch {
    return []
  }
}

/**
 * Calculate overall data completeness percentage for director profile
 */
export function calculateDataCompleteness(director: any): number {
  const fields = [
    'name',
    'professional_title',
    'bio',
    'years_of_experience',
    'certifications',
    'past_board_positions',
  ]

  let filledCount = 0

  for (const field of fields) {
    const value = director[field]
    if (
      value !== null &&
      value !== undefined &&
      value !== '' &&
      (typeof value !== 'object' || Object.keys(value).length > 0)
    ) {
      filledCount++
    }
  }

  return Math.round((filledCount / fields.length) * 100)
}

/**
 * Format a director record into prospectus-ready bio with all details
 */
export async function formatDirectorForProspectus(director: any): Promise<DirectorFormattedBio> {
  const education = extractEducation(director.extracted_education)
  const certifications = extractCertifications(director.extracted_certifications, director.certifications)
  const boardExperience = extractBoardExperience(director.past_board_positions)

  const linkedInVerification = await checkDirectorLinkInVerification(director.professional_id)
  const independence = linkedInVerification.verified ? 'Independent' : 'Dependent'

  return {
    id: director.professional_id,
    name: director.name || 'Unknown',
    title: director.professional_title || 'Director',
    independence,
    principalOccupation: director.bio || director.professional_title || 'Not specified',
    yearsExperience: director.years_of_experience || 0,
    education,
    certifications,
    boardExperience,
    stockOwnership: {
      percentage: 0,
      status: 'not_specified',
    },
    relatedPartyTransactions: [],
    linkedInVerified: director.linkedin_verified || false,
    verificationStatus: director.verification_status || 'unverified',
  }
}

/**
 * Mark sync record as stale if source data has changed
 */
export async function markSyncStale(
  directorId: string,
  prospectusDocumentId: string | null
): Promise<void> {
  try {
    await sql`
      UPDATE director_prospectus_sync
      SET
        is_stale = TRUE,
        stale_since = NOW()
      WHERE professional_id = ${directorId}
        ${prospectusDocumentId ? sql`AND prospectus_document_id = ${prospectusDocumentId}` : sql`AND prospectus_document_id IS NULL`}
    `
  } catch {
    // Silently fail if marking stale
  }
}

/**
 * Create or update sync record for a director
 */
export async function upsertSyncRecord(
  directorId: string,
  prospectusDocumentId: string | null,
  sectionType: string,
  userId: string,
  syncStatus: 'synced' | 'partial' | 'error' = 'synced',
  confidence: number = 0.9
): Promise<string> {
  try {
    const rows = await sql`
      INSERT INTO director_prospectus_sync (
        professional_id,
        prospectus_document_id,
        sync_key,
        section_type,
        sync_status,
        sync_confidence,
        last_synced_at,
        created_by_user_id,
        updated_by_user_id
      )
      VALUES (
        ${directorId},
        ${prospectusDocumentId},
        ${'director_' + directorId.substring(0, 8)},
        ${sectionType},
        ${syncStatus},
        ${confidence},
        NOW(),
        ${userId},
        ${userId}
      )
      ON CONFLICT (professional_id, prospectus_document_id, section_type)
      DO UPDATE SET
        sync_status = EXCLUDED.sync_status,
        sync_confidence = EXCLUDED.sync_confidence,
        last_synced_at = NOW(),
        updated_by_user_id = ${userId}
      RETURNING id
    ` as Array<{ id: string }>

    return rows[0]?.id || 'unknown'
  } catch (error) {
    console.error('Error upserting sync record:', error)
    return 'unknown'
  }
}
