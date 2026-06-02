import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { sql } from '@/lib/db'

const applySchema = z.object({
  sections: z.array(
    z.object({
      prospectusSection: z.string(),
      sourceContent: z.string(),
      confidence: z.number().min(0).max(1),
      documentId: z.string(),
    })
  ),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const prospectusId = params.id
    const body = await request.json()

    // Validate input
    const validation = applySchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      )
    }

    // Verify prospectus ownership
    const prospectusCheck = await sql`
      SELECT id, company_id FROM prospectuses WHERE id = ${prospectusId}
    ` as any[]

    if (!prospectusCheck.length) {
      return NextResponse.json(
        { error: 'Prospectus not found' },
        { status: 404 }
      )
    }

    const companyCheck = await sql`
      SELECT id FROM companies WHERE id = ${prospectusCheck[0].company_id} AND user_id = ${session.user.id}
    ` as any[]

    if (!companyCheck.length) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    const { sections } = validation.data

    // Get the mapping of prospectus section names to IDs
    const sectionsQuery = await sql`
      SELECT id, section_name FROM prospectus_sections 
      WHERE prospectus_id = ${prospectusId}
      ORDER BY section_order ASC
    ` as any[]

    const sectionMap = new Map(
      sectionsQuery.map((s) => [s.section_name, s.id])
    )

    // Apply extractions to matching sections
    const updatedSections = []
    for (const extraction of sections) {
      const sectionId = sectionMap.get(extraction.prospectusSection)

      if (sectionId) {
        // Update section with extracted content
        const updateResult = await sql`
          UPDATE prospectus_sections 
          SET content = ${extraction.sourceContent},
              is_auto_filled = true,
              auto_fill_confidence = ${extraction.confidence},
              source_document_id = ${extraction.documentId},
              status = 'draft',
              last_updated_at = NOW(),
              last_updated_by = ${session.user.id}
          WHERE id = ${sectionId}
          RETURNING id, section_name, status, is_auto_filled, auto_fill_confidence
        ` as any[]

        if (updateResult.length > 0) {
          updatedSections.push(updateResult[0])

          // Log extraction application event
          await sql`
            INSERT INTO prospectus_events (
              prospectus_id,
              event_type,
              event_data,
              triggered_by,
              created_at
            ) VALUES (
              ${prospectusId},
              'section_auto_filled',
              ${JSON.stringify({
                sectionId,
                sectionName: extraction.prospectusSection,
                confidence: extraction.confidence,
                contentLength: extraction.sourceContent.length,
              })},
              ${session.user.id},
              NOW()
            )
          `
        }
      }
    }

    // Calculate updated completion percentage
    const completionQuery = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'final')::float / COUNT(*)::float * 100 as completion_pct
      FROM prospectus_sections 
      WHERE prospectus_id = ${prospectusId}
    ` as any[]

    const completionPct =
      completionQuery[0]?.completion_pct || 0

    return NextResponse.json({
      success: true,
      appliedCount: updatedSections.length,
      updatedSections,
      newCompletionPct: Math.round(completionPct),
      message: `Successfully applied ${updatedSections.length} extractions. Sections are now in draft status and ready for review.`,
    })
  } catch (error) {
    console.error('Apply extractions error:', error)
    return NextResponse.json(
      {
        error: 'Failed to apply extractions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
