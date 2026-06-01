import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { extractProspectusContent } from '@/lib/prospectus-extractor'
import { mapExtractedSectionsToProspectus } from '@/lib/prospectus-mapper'

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

    // TODO: Store results in prospectus_documents table
    // TODO: Store section mappings in document_section_mappings table
    // For now, return the mapping result directly

    return NextResponse.json(
      {
        success: true,
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
