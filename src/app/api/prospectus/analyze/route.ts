import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import {
  analyzeProspectus,
  computeOverallScore,
  toDashboardSections,
  type AnalyzedSection,
} from '@/lib/prospectus-validator/analyzer'

export const dynamic = 'force-dynamic'

/**
 * POST /api/prospectus/analyze
 * ----------------------------
 * Analyze actual prospectus content against the configuration-driven
 * validation rules and return dynamically generated issues/gaps/scores.
 *
 * Request body:
 *   {
 *     prospectusId?: string,                       // optional — used for DB load + persistence
 *     companyId?: string,                          // optional — used for persistence
 *     sections?: { [sectionIdOrName: string]: string } // section content
 *   }
 *
 * If `sections` is omitted (or empty) and a `prospectusId` is supplied, the
 * route attempts to load section content from the database.
 *
 * Response:
 *   {
 *     success: true,
 *     prospectusId,
 *     overallScore,            // 0-100
 *     totalIssues, totalGaps,
 *     sections: ProspectusSection[],   // same interface as the mock data
 *     analyzedAt,
 *     source: 'body' | 'database',
 *     persisted: boolean
 *   }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as { id?: string; companyId?: string } | undefined
    if (!session || !user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: {
      prospectusId?: string
      companyId?: string
      sections?: Record<string, string>
    }
    try {
      body = await req.json()
    } catch {
      body = {}
    }

    const { prospectusId } = body
    const companyId = body.companyId || user.companyId
    let sectionContents: Record<string, string> = body.sections || {}
    let source: 'body' | 'database' = 'body'

    // ------------------------------------------------------------------
    // Fall back to loading content from the DB when none supplied in body.
    // ------------------------------------------------------------------
    if (Object.keys(sectionContents).length === 0 && prospectusId) {
      try {
        // Verify access first (owner by creator, or by company membership).
        const owned = await sql`
          SELECT id FROM prospectuses
          WHERE id = ${prospectusId}
            AND (created_by = ${user.id} OR company_id = ${companyId ?? null})
        ` as Array<{ id: string }>

        if (!owned.length) {
          return NextResponse.json({ error: 'Prospectus not found' }, { status: 404 })
        }

        const rows = await sql`
          SELECT section_name, COALESCE(content, '') AS content
          FROM prospectus_sections
          WHERE prospectus_id = ${prospectusId}
          ORDER BY section_order ASC
        ` as Array<{ section_name: string; content: string }>

        sectionContents = {}
        for (const r of rows) {
          if (r.section_name) sectionContents[r.section_name] = r.content || ''
        }
        source = 'database'
      } catch (dbErr) {
        // DB shape may differ across environments; surface a clear signal so
        // the client can fall back to mock data instead of hard-failing.
        console.error('[POST /api/prospectus/analyze] DB load failed:', dbErr)
        return NextResponse.json(
          {
            success: false,
            error: 'Could not load prospectus content from database',
            hasContent: false,
          },
          { status: 200 }
        )
      }
    }

    // No content to analyze at all -> tell the client to use the fallback.
    const hasAnyContent = Object.values(sectionContents).some((c) => (c || '').trim().length > 0)
    if (!hasAnyContent) {
      return NextResponse.json(
        {
          success: false,
          hasContent: false,
          message: 'No prospectus content available to analyze',
        },
        { status: 200 }
      )
    }

    // ------------------------------------------------------------------
    // Run the analyzer.
    // ------------------------------------------------------------------
    const analyzed: AnalyzedSection[] = analyzeProspectus(sectionContents)
    const sections = toDashboardSections(analyzed)
    const overallScore = computeOverallScore(analyzed)
    const totalIssues = analyzed.reduce((s, a) => s + a.issueCount, 0)
    const totalGaps = analyzed.reduce((s, a) => s + a.gapCount, 0)
    const analyzedAt = new Date().toISOString()

    // ------------------------------------------------------------------
    // Persist a validation snapshot (best-effort — never block the response).
    // ------------------------------------------------------------------
    let persisted = false
    try {
      const sectionScores = analyzed.map((a) => ({
        id: a.id,
        name: a.name,
        score: a.completeness,
        strength: a.strength,
        status: a.status,
        issueCount: a.issueCount,
        gapCount: a.gapCount,
      }))

      await sql`
        INSERT INTO prospectus_validations (
          prospectus_id, company_id, overall_score, total_issues, total_gaps,
          section_scores, issues, ruleset_version, created_by
        ) VALUES (
          ${prospectusId ?? null},
          ${companyId ?? null},
          ${overallScore},
          ${totalIssues},
          ${totalGaps},
          ${JSON.stringify(sectionScores)}::jsonb,
          ${JSON.stringify(sections)}::jsonb,
          'v1',
          ${user.id}
        )
      `
      persisted = true
    } catch (persistErr) {
      // Table may not exist yet in this environment; analysis still returns.
      console.error('[POST /api/prospectus/analyze] Persist skipped:', persistErr)
    }

    return NextResponse.json({
      success: true,
      hasContent: true,
      prospectusId: prospectusId ?? null,
      overallScore,
      totalIssues,
      totalGaps,
      sections,
      analyzedAt,
      source,
      persisted,
    })
  } catch (error) {
    console.error('[POST /api/prospectus/analyze] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    )
  }
}
