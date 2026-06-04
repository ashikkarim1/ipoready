/**
 * Filing Export Utilities
 *
 * Shared functions for formatting director data for regulatory filings
 * Supports SEDAR 2, SEC Edgar, and PDF export formats
 */

import { sql } from '@/lib/db'

export interface DirectorExportData {
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

export interface ExportMetadata {
  companyId: string
  companyName: string
  ipoDate: string | null
  headquarters: string | null
  directorCount: number
  directorIds: string[]
  format: 'sedar2' | 'sec-edgar' | 'pdf'
  generatedAt: string
}

/**
 * Format director for SEDAR2 biographical narrative
 * Returns 3-5 sentence narrative suitable for SEDAR filing
 */
export function formatDirectorBioSedar2(director: DirectorExportData): string {
  const name = director.name || 'Unknown'
  const title = director.professional_title || 'Director'
  const years = director.years_of_experience || 0
  const bio = director.bio || `${name} serves as ${title}.`
  const isIndependent = director.verification_status === 'verified' ? 'Yes' : 'No'

  // Build certifications line
  let certificationsText = ''
  if (director.certifications && director.certifications.length > 0) {
    certificationsText = ` ${name} holds the following professional designations: ${director.certifications.join(', ')}.`
  }

  // Build board experience
  let boardExperienceText = ''
  if (director.past_board_positions && Array.isArray(director.past_board_positions)) {
    const positions = director.past_board_positions
      .filter((p: any) => p && p.title && p.company)
      .map((p: any) => `${p.title} at ${p.company}`)
      .join('; ')

    if (positions) {
      boardExperienceText = ` ${name} has served in various board capacities, including: ${positions}.`
    }
  }

  // Combine into narrative (3-5 sentences)
  let narrative = bio
  if (certificationsText) narrative += certificationsText
  if (boardExperienceText) narrative += boardExperienceText

  // Add experience summary
  if (years > 0) {
    narrative += ` With ${years} years of experience in the industry, ${name} brings substantial expertise to the board.`
  }

  return narrative.trim()
}

/**
 * Format director for SEC Edgar biographical narrative
 * Returns 200+ word narrative suitable for SEC filing
 */
export function formatDirectorBioSecEdgar(director: DirectorExportData): string {
  const name = director.name || 'Unknown'
  const title = director.professional_title || 'Director'
  const yearsExp = director.years_of_experience || 0
  const age = calculateEstimatedAge(yearsExp)

  // Main biography paragraph
  let biography = `${name}, age ${age}, has served as our ${title.toLowerCase()} since [DATE]. `

  // Experience and expertise
  if (director.bio) {
    biography += director.bio + ' '
  } else {
    biography += `With ${yearsExp} years of experience in the industry, ${name} brings substantial expertise and strategic insights to our board. `
  }

  // Industry focus
  if (director.industries && director.industries.length > 0) {
    biography += `${name}'s expertise spans ${director.industries.join(', ')}. `
  }

  // Professional credentials
  if (director.certifications && director.certifications.length > 0) {
    biography += `${name} is a ${director.certifications[0]}`
    if (director.certifications.length > 1) {
      biography += ` and holds additional certifications including ${director.certifications.slice(1).join(', ')}`
    }
    biography += '. '
  }

  // Board experience and governance expertise
  if (director.past_board_positions && Array.isArray(director.past_board_positions)) {
    const significantPositions = director.past_board_positions
      .filter((p: any) => {
        if (!p || !p.title || !p.company) return false
        const lowerTitle = p.title.toLowerCase()
        return (
          lowerTitle.includes('audit') ||
          lowerTitle.includes('committee') ||
          lowerTitle.includes('chair') ||
          lowerTitle.includes('compensation') ||
          lowerTitle.includes('governance')
        )
      })
      .slice(0, 3)

    if (significantPositions.length > 0) {
      biography += `${name} has demonstrated expertise in corporate governance and board service, having served as `
      biography += significantPositions.map((p: any) => `${p.title} at ${p.company}`).join(', ')
      biography += '. '
    }
  }

  // Independence and tenure
  const independence = director.verification_status === 'verified' ? 'independent' : 'non-independent'
  biography += `${name} qualifies as ${independence} under applicable standards. `

  // Conclude with contribution summary
  biography += `We believe ${name} is well-qualified to serve on our board based on ${name}'s extensive experience, industry knowledge, and track record of board service and corporate governance expertise.`

  return biography
}

/**
 * Calculate estimated age based on years of experience
 * Conservative assumption: career start at age 25
 */
export function calculateEstimatedAge(yearsExperience: number): number {
  const estimatedAge = Math.min(25 + (yearsExperience || 0), 75)
  return estimatedAge
}

/**
 * Format director for SEDAR2 table row
 * Returns properly aligned table cell content
 */
export function formatTableCellSedar2(
  content: string,
  width: number,
  alignment: 'left' | 'right' | 'center' = 'left'
): string {
  const truncated = content.substring(0, width - 1)
  if (alignment === 'left') {
    return truncated.padEnd(width)
  } else if (alignment === 'right') {
    return truncated.padStart(width)
  } else {
    const padding = Math.floor((width - truncated.length) / 2)
    return truncated.padStart(truncated.length + padding).padEnd(width)
  }
}

/**
 * Validate director data for export
 * Ensures all required fields are present
 */
export function validateDirectorForExport(director: DirectorExportData): {
  valid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  // Required fields
  if (!director.name || director.name.trim() === '') {
    errors.push('Director name is required')
  }

  if (!director.professional_title || director.professional_title.trim() === '') {
    errors.push('Professional title is required')
  }

  if (director.professional_id === null || director.professional_id === undefined) {
    errors.push('Director ID is required')
  }

  // Warning fields
  if (!director.bio || director.bio.trim() === '') {
    warnings.push('Principal occupation/bio is missing')
  }

  if (!director.certifications || director.certifications.length === 0) {
    warnings.push('No professional certifications listed')
  }

  if (director.years_of_experience === null || director.years_of_experience === undefined) {
    warnings.push('Years of experience is missing')
  }

  if (!director.past_board_positions || director.past_board_positions.length === 0) {
    warnings.push('No board experience listed')
  }

  if (!director.linkedin_verified) {
    warnings.push('Director has not been verified via LinkedIn')
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Track export download for audit trail
 */
export async function trackExportDownload(
  companyId: string,
  format: 'sedar2' | 'sec-edgar' | 'pdf',
  directorIds: string[],
  fileSize: number,
  userId?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<string> {
  try {
    const downloadKey = `dir-export-${companyId.substring(0, 8)}-${Date.now()}-${Math.random().toString(36).substring(7)}`

    await sql`
      INSERT INTO director_export_downloads (
        download_key,
        company_id,
        format,
        director_count,
        director_ids,
        file_size,
        user_id,
        ip_address,
        user_agent
      )
      VALUES (
        ${downloadKey},
        ${companyId},
        ${format},
        ${directorIds.length},
        ${directorIds},
        ${fileSize},
        ${userId || null},
        ${ipAddress || null},
        ${userAgent || null}
      )
    `

    return downloadKey
  } catch (error) {
    console.warn('Failed to track export download:', error)
    return `dir-export-fallback-${Date.now()}`
  }
}

/**
 * Mark export as downloaded
 */
export async function markExportAsDownloaded(downloadKey: string): Promise<void> {
  try {
    await sql`
      UPDATE director_export_downloads
      SET
        status = 'downloaded',
        downloaded_count = downloaded_count + 1,
        downloaded_at = NOW()
      WHERE download_key = ${downloadKey}
    `
  } catch (error) {
    console.warn('Failed to mark export as downloaded:', error)
  }
}

/**
 * Clean up expired exports
 * Should be run periodically (e.g., daily)
 */
export async function cleanupExpiredExports(): Promise<number> {
  try {
    const result = await sql`
      UPDATE director_export_downloads
      SET status = 'expired'
      WHERE status != 'expired'
        AND expires_at < NOW()
    ` as any
    return (result && result[0]?.count) || 0
  } catch (error) {
    console.error('Failed to cleanup expired exports:', error)
    return 0
  }
}

/**
 * Get export statistics for a company
 */
export async function getExportStatistics(companyId: string): Promise<{
  totalExports: number
  byFormat: Record<string, number>
  totalDirectorsExported: number
  lastExportDate: string | null
}> {
  try {
    const rows = await sql`
      SELECT
        COUNT(*) as total_exports,
        SUM(director_count) as total_directors,
        format,
        MAX(created_at) as last_export_date
      FROM director_export_downloads
      WHERE company_id = ${companyId}
        AND status IN ('generated', 'downloaded')
      GROUP BY format
      ORDER BY format
    ` as Array<{
      total_exports: number
      total_directors: number
      format: string
      last_export_date: string
    }>

    const byFormat: Record<string, number> = {}
    let totalExports = 0
    let totalDirectors = 0
    let lastExportDate: string | null = null

    for (const row of rows) {
      byFormat[row.format] = row.total_exports
      totalExports += row.total_exports
      totalDirectors += row.total_directors || 0
      if (!lastExportDate || row.last_export_date > lastExportDate) {
        lastExportDate = row.last_export_date
      }
    }

    return {
      totalExports,
      byFormat,
      totalDirectorsExported: totalDirectors,
      lastExportDate,
    }
  } catch (error) {
    console.warn('Failed to get export statistics:', error)
    return {
      totalExports: 0,
      byFormat: {},
      totalDirectorsExported: 0,
      lastExportDate: null,
    }
  }
}

/**
 * Format export metadata for response headers
 */
export function generateMetadataHeaders(
  metadata: ExportMetadata,
  fileSize: number
): Record<string, string> {
  return {
    'X-Export-Format': metadata.format,
    'X-Company-Name': metadata.companyName,
    'X-Director-Count': metadata.directorCount.toString(),
    'X-Generated-At': metadata.generatedAt,
    'X-File-Size': fileSize.toString(),
    'Content-Disposition': `attachment; filename="directors-${metadata.format}-${new Date().toISOString().split('T')[0]}"`,
  }
}
