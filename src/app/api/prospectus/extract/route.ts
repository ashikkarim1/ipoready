import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db/client'
import { extractProspectusContent, type DocumentExtractionResult } from '@/lib/prospectus-extractor'

export const dynamic = 'force-dynamic'
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const prospectusId = formData.get('prospectusId') as string
    const documentType = (formData.get('documentType') as any) || 'pdf'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!prospectusId) {
      return NextResponse.json({ error: 'No prospectusId provided' }, { status: 400 })
    }

    // Verify user has access to this prospectus
    const prospectus = await sql`
      SELECT id FROM prospectuses 
      WHERE id = ${prospectusId} AND created_by = ${session.user.id}
    `
    if (!prospectus.length) {
      return NextResponse.json({ error: 'Prospectus not found' }, { status: 404 })
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Extract content using prospectus extractor
    const extractionResult = await extractProspectusContent(buffer, documentType)

    // Store document record in database
    const documentRecord = await sql`
      INSERT INTO prospectus_documents (
        prospectus_id,
        document_name,
        document_type,
        file_size_bytes,
        extracted_sections,
        extraction_method,
        uploaded_by,
        last_extracted_at
      ) VALUES (
        ${prospectusId},
        ${file.name},
        ${documentType},
        ${file.size},
        ${JSON.stringify(extractionResult.extractedSections)}::jsonb,
        ${extractionResult.extractionMethod},
        ${session.user.id},
        NOW()
      )
      RETURNING id, document_name, extracted_sections
    `

    if (!documentRecord.length) {
      return NextResponse.json(
        { error: 'Failed to store document' },
        { status: 500 }
      )
    }

    const documentId = documentRecord[0].id

    // Auto-map extracted sections to prospectus sections
    const extractedSections = extractionResult.extractedSections
    const mappingResults = []

    for (const extractedSection of extractedSections) {
      // Find matching prospectus section
      const prospectusSection = await sql`
        SELECT id FROM prospectus_sections
        WHERE prospectus_id = ${prospectusId}
        AND section_name = ${extractedSection.sectionName}
        LIMIT 1
      `

      if (prospectusSection.length > 0) {
        const sectionId = prospectusSection[0].id

        // Update prospectus section with auto-filled content
        await sql`
          UPDATE prospectus_sections
          SET 
            content = ${extractedSection.content},
            source_document_id = ${documentId},
            is_auto_filled = true,
            auto_fill_confidence = ${extractedSection.confidence},
            last_updated_by = ${session.user.id},
            last_updated_at = NOW()
          WHERE id = ${sectionId}
        `

        // Create mapping record
        const mapping = await sql`
          INSERT INTO document_section_mappings (
            prospectus_id,
            prospectus_section_id,
            source_document_id,
            source_section_index,
            source_section_name,
            confidence_score,
            extraction_method
          ) VALUES (
            ${prospectusId},
            ${sectionId},
            ${documentId},
            ${extractedSections.indexOf(extractedSection)},
            ${extractedSection.sectionName},
            ${extractedSection.confidence},
            ${extractionResult.extractionMethod}
          )
          RETURNING id, confidence_score
        `

        mappingResults.push({
          sectionName: extractedSection.sectionName,
          confidence: mapping[0].confidence_score,
          mapped: true,
        })
      } else {
        // Section not found, record as unmapped
        mappingResults.push({
          sectionName: extractedSection.sectionName,
          confidence: extractedSection.confidence,
          mapped: false,
        })
      }
    }

    return NextResponse.json({
      success: true,
      documentId,
      documentName: file.name,
      totalSectionsExtracted: extractedSections.length,
      mappingResults,
      extractionMethod: extractionResult.extractionMethod,
    })
  } catch (error) {
    console.error('Document extraction error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to extract document' },
      { status: 500 }
    )
  }
}
