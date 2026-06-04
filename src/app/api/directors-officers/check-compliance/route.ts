/**
 * GET /api/directors-officers/check-compliance
 *
 * Check compliance status and data completeness for directors
 * Identifies missing required fields and readiness for prospectus filing
 *
 * Query Params:
 * - directorIds?: string (comma-separated IDs, or leave empty for all directors)
 *
 * Response:
 * {
 *   totalDirectors: number
 *   compliant: {
 *     count: number
 *     directors: string[] (IDs)
 *   }
 *   partiallyCompliant: {
 *     count: number
 *     directors: string[] (IDs)
 *     issues: Array<{directorId, field, reason, severity}>
 *   }
 *   nonCompliant: {
 *     count: number
 *     directors: string[] (IDs)
 *     criticalIssues: Array<{directorId, field, reason}>
 *   }
 *   complianceScore: number (0-100)
 *   overallStatus: "fully_compliant" | "mostly_compliant" | "needs_attention"
 *   recommendations: string[]
 *   detailedReport: Array<{
 *     directorId: string
 *     name: string
 *     completeness: number
 *     issues: Array<{field, reason, severity}>
 *   }>
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
}

interface ComplianceIssue {
  field: string
  reason: string
  severity: 'error' | 'warning'
}

function calculateDirectorCompleteness(director: DirectorRow): number {
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
    const value = (director as any)[field]
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

function validateDirector(director: DirectorRow): ComplianceIssue[] {
  const issues: ComplianceIssue[] = []

  if (!director.name || director.name.trim() === '') {
    issues.push({
      field: 'name',
      reason: 'Missing director name',
      severity: 'error',
    })
  }

  if (!director.professional_title || director.professional_title.trim() === '') {
    issues.push({
      field: 'professional_title',
      reason: 'Missing professional title',
      severity: 'error',
    })
  }

  if (director.years_of_experience === null || director.years_of_experience === undefined) {
    issues.push({
      field: 'years_of_experience',
      reason: 'Missing years of experience',
      severity: 'warning',
    })
  }

  if (!director.bio || director.bio.trim() === '') {
    issues.push({
      field: 'bio',
      reason: 'Missing principal occupation/bio',
      severity: 'warning',
    })
  }

  if (!director.certifications || director.certifications.length === 0) {
    issues.push({
      field: 'certifications',
      reason: 'No professional certifications listed',
      severity: 'warning',
    })
  }

  if (!director.past_board_positions || Object.keys(director.past_board_positions).length === 0) {
    issues.push({
      field: 'board_experience',
      reason: 'No board experience recorded',
      severity: 'warning',
    })
  }

  if (!director.linkedin_verified || director.verification_status !== 'verified') {
    issues.push({
      field: 'verification',
      reason: 'Not verified via LinkedIn',
      severity: 'warning',
    })
  }

  return issues
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = req.nextUrl.searchParams
  const directorIdsParam = searchParams.get('directorIds')
  const directorIds = directorIdsParam ? directorIdsParam.split(',').filter(id => id.trim()) : null

  try {
    let query = sql`
      SELECT
        id as professional_id,
        name,
        professional_title,
        bio,
        past_board_positions,
        certifications,
        years_of_experience,
        linkedin_verified,
        verification_status
      FROM professionals
    `

    if (directorIds && directorIds.length > 0) {
      query = sql`
        SELECT
          id as professional_id,
          name,
          professional_title,
          bio,
          past_board_positions,
          certifications,
          years_of_experience,
          linkedin_verified,
          verification_status
        FROM professionals
        WHERE id = ANY(${directorIds})
      `
    }

    const directors = await query as DirectorRow[]

    if (directors.length === 0) {
      return NextResponse.json({
        totalDirectors: 0,
        compliant: { count: 0, directors: [] },
        partiallyCompliant: { count: 0, directors: [], issues: [] },
        nonCompliant: { count: 0, directors: [], criticalIssues: [] },
        complianceScore: 0,
        overallStatus: 'needs_attention',
        recommendations: ['No directors to check. Add directors first.'],
        detailedReport: [],
      })
    }

    const compliantIds: string[] = []
    const partiallyCompliantIds: string[] = []
    const nonCompliantIds: string[] = []

    const detailedReport: Array<{
      directorId: string
      name: string
      completeness: number
      issues: ComplianceIssue[]
    }> = []

    const allPartialIssues: Array<{ directorId: string; field: string; reason: string; severity: 'error' | 'warning' }> = []
    const allCriticalIssues: Array<{ directorId: string; field: string; reason: string }> = []

    for (const director of directors) {
      const completeness = calculateDirectorCompleteness(director)
      const issues = validateDirector(director)

      const criticalIssues = issues.filter(i => i.severity === 'error')
      const warningIssues = issues.filter(i => i.severity === 'warning')

      // Classify director compliance
      if (criticalIssues.length === 0 && warningIssues.length === 0) {
        compliantIds.push(director.professional_id)
      } else if (criticalIssues.length === 0) {
        partiallyCompliantIds.push(director.professional_id)
        for (const issue of warningIssues) {
          allPartialIssues.push({
            directorId: director.professional_id,
            field: issue.field,
            reason: issue.reason,
            severity: 'warning',
          })
        }
      } else {
        nonCompliantIds.push(director.professional_id)
        for (const issue of criticalIssues) {
          allCriticalIssues.push({
            directorId: director.professional_id,
            field: issue.field,
            reason: issue.reason,
          })
        }
      }

      detailedReport.push({
        directorId: director.professional_id,
        name: director.name,
        completeness,
        issues,
      })
    }

    // Calculate overall compliance score
    const complianceScore = Math.round(
      ((compliantIds.length + partiallyCompliantIds.length * 0.5) / directors.length) * 100
    )

    // Determine overall status
    let overallStatus: 'fully_compliant' | 'mostly_compliant' | 'needs_attention' = 'needs_attention'
    if (nonCompliantIds.length === 0 && partiallyCompliantIds.length === 0) {
      overallStatus = 'fully_compliant'
    } else if (compliantIds.length + partiallyCompliantIds.length >= directors.length * 0.8) {
      overallStatus = 'mostly_compliant'
    }

    // Generate recommendations
    const recommendations: string[] = []

    if (nonCompliantIds.length > 0) {
      recommendations.push(
        `${nonCompliantIds.length} director(s) missing required fields: ${nonCompliantIds.join(', ')}`
      )
    }

    if (partiallyCompliantIds.length > 0) {
      recommendations.push(
        `${partiallyCompliantIds.length} director(s) need additional information to be fully compliant`
      )
    }

    const unverifiedCount = directors.filter(d => !d.linkedin_verified).length
    if (unverifiedCount > 0) {
      recommendations.push(`Verify ${unverifiedCount} director(s) via LinkedIn for independence status`)
    }

    const noBioCount = directors.filter(d => !d.bio).length
    if (noBioCount > 0) {
      recommendations.push(`Add principal occupation/bio for ${noBioCount} director(s)`)
    }

    const noCertCount = directors.filter(d => !d.certifications || d.certifications.length === 0).length
    if (noCertCount > 0) {
      recommendations.push(`Add certifications for ${noCertCount} director(s)`)
    }

    return NextResponse.json({
      totalDirectors: directors.length,
      compliant: {
        count: compliantIds.length,
        directors: compliantIds,
      },
      partiallyCompliant: {
        count: partiallyCompliantIds.length,
        directors: partiallyCompliantIds,
        issues: allPartialIssues,
      },
      nonCompliant: {
        count: nonCompliantIds.length,
        directors: nonCompliantIds,
        criticalIssues: allCriticalIssues,
      },
      complianceScore,
      overallStatus,
      recommendations,
      detailedReport,
    })
  } catch (error) {
    console.error('Error checking director compliance:', error)
    return NextResponse.json(
      { error: 'Failed to check compliance' },
      { status: 500 }
    )
  }
}
