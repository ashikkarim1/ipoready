import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const prospectusId = searchParams.get('prospectusId')

    if (!prospectusId) {
      return NextResponse.json({ error: 'prospectusId required' }, { status: 400 })
    }

    // Verify user has access to this prospectus
    const prospectus = await sql`
      SELECT id FROM prospectuses 
      WHERE id = ${prospectusId} AND created_by = ${session.user.id}
    `
    if (!prospectus.length) {
      return NextResponse.json({ error: 'Prospectus not found' }, { status: 404 })
    }

    // Get all sections with their current content
    const sections = await sql`
      SELECT 
        id,
        section_name,
        section_order,
        required,
        content,
        content_formatted,
        source_document_id,
        is_auto_filled,
        auto_fill_confidence,
        last_updated_at,
        last_updated_by
      FROM prospectus_sections
      WHERE prospectus_id = ${prospectusId}
      ORDER BY section_order ASC
    `

    return NextResponse.json({
      success: true,
      prospectusId,
      totalSections: sections.length,
      sections: sections.map(s => ({
        id: s.id,
        name: s.section_name,
        order: s.section_order,
        required: s.required,
        content: s.content || '',
        formatted: s.content_formatted,
        sourceDocumentId: s.source_document_id,
        isAutoFilled: s.is_auto_filled,
        confidence: s.auto_fill_confidence,
        lastUpdated: s.last_updated_at,
        lastUpdatedBy: s.last_updated_by,
      })),
    })
  } catch (error) {
    console.error('Error fetching prospectus sections:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch sections' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { prospectusId, sectionId, content, contentFormatted } = body

    if (!prospectusId || !sectionId) {
      return NextResponse.json({ error: 'prospectusId and sectionId required' }, { status: 400 })
    }

    // Verify user has access to this prospectus
    const prospectus = await sql`
      SELECT id FROM prospectuses 
      WHERE id = ${prospectusId} AND created_by = ${session.user.id}
    `
    if (!prospectus.length) {
      return NextResponse.json({ error: 'Prospectus not found' }, { status: 404 })
    }

    // Update section content
    const updated = await sql`
      UPDATE prospectus_sections
      SET 
        content = ${content},
        content_formatted = ${contentFormatted ? JSON.stringify(contentFormatted) : null}::jsonb,
        is_auto_filled = false,
        auto_fill_confidence = NULL,
        last_updated_by = ${session.user.id},
        last_updated_at = NOW()
      WHERE 
        id = ${sectionId} AND 
        prospectus_id = ${prospectusId}
      RETURNING 
        id, section_name, content, is_auto_filled, last_updated_at
    `

    if (!updated.length) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      sectionId,
      updated: updated[0],
    })
  } catch (error) {
    console.error('Error updating prospectus section:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update section' },
      { status: 500 }
    )
  }
}
