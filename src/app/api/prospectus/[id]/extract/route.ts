import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { extractProspectusContent } from '@/lib/prospectus-extractor'
import { mapExtractedSectionsToProspectus } from '@/lib/prospectus-mapper'
import { sql } from '@/lib/db'

// Supported MIME types and their corresponding document types
const SUPPORTED_MIME_TYPES: Record<string, 'pdf' | 'docx' | 'csv' | 'text'> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'text/plain': 'text',
  'text/csv': 'csv',
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify user is authenticated
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get form data
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!SUPPORTED_MIME_TYPES[file.type]) {
      return NextResponse.json(
        {
          error: `Unsupported file type: ${file.type}. Supported types: PDF, DOCX, CSV, TXT`,
        },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Determine document type
    const documentType = SUPPORTED_MIME_TYPES[file.type]

    // Extract content from document
    const extractionResult = await extractProspectusContent(buffer, documentType)

    // Map extracted sections to prospectus structure
    const mappingResult = mapExtractedSectionsToProspectus(extractionResult)

    // Store results in prospectus_documents table
    const prospectusId = params.id
    const documentInsertResult = (await sql`
      INSERT INTO prospectus_documents (
        prospectus_id,
        document_name,
        document_type,
        file_size_bytes,
        extracted_sections,
        extraction_method,
        last_extracted_at,
        uploaded_by,
        created_at,
        updated_at
      ) VALUES (
        ${prospectusId},
        ${extractionResult.documentName},
        ${documentType},
        ${buffer.length},
        ${JSON.stringify(extractionResult.extractedSections)},
        ${extractionResult.extractionMethod},
        NOW(),
        ${session.user.id},
        NOW(),
        NOW()
      )
      RETURNING id
    `) as any[]

    const documentId = documentInsertResult[0]?.id

    // Log extraction event for audit trail
    await sql`
      INSERT INTO prospectus_events (
        prospectus_id,
        event_type,
        event_data,
        triggered_by,
        created_at
      ) VALUES (
        ${prospectusId},
        'document_extracted',
        ${JSON.stringify({
          documentId,
          documentName: extractionResult.documentName,
          documentType,
          sectionsExtracted: mappingResult.mappedSections,
        })},
        ${session.user.id},
        NOW()
      )
    `

    return NextResponse.json(
      {
        success: true,
        documentId,
        extraction: {
          documentName: extractionResult.documentName,
          documentType: extractionResult.documentType,
          totalPages: extractionResult.totalPages,
          extractedSections: extractionResult.extractedSections,
        },
        mapping: {
          totalSections: mappingResult.totalSections,
          mappedSections: mappingResult.mappedSections,
          partialMappings: mappingResult.partialMappings,
          missingMappings: mappingResult.missingMappings,
          overallCompletionEstimate: mappingResult.overallCompletionEstimate,
          automationPotential: mappingResult.automationPotential,
          mappings: mappingResult.mappings.map((m) => ({
            prospectusSection: m.prospectusSection.name,
            prospectusOrder: m.prospectusOrder,
            extractedSectionName: m.extractedSection?.sectionName,
            confidence: m.confidence,
            automationSuggestion: m.automationSuggestion,
            status: m.status,
            alternativeMatches: m.alternativeMatches.map((alt) => ({
              sectionName: alt.extractedSection.sectionName,
              confidence: alt.confidence,
            })),
          })),
          remediationSuggestions: mappingResult.remediationSuggestions,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Extraction error:', error)
    return NextResponse.json(
      {
        error: 'Failed to extract and map document content',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
