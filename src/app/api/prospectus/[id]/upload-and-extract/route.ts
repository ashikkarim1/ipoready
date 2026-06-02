import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { sql } from '@/lib/db'
import { extractProspectusContent } from '@/lib/prospectus-extractor'
import { userCanAccessFeature } from '@/lib/feature-gates'
import { uploadProspectusFile } from '@/lib/prospectus-storage'

// Strict whitelist of supported document types
const SUPPORTED_DOCUMENT_TYPES = ['pdf', 'docx', 'csv', 'text'] as const
const SUPPORTED_FILE_EXTENSIONS = {
  pdf: ['pdf'],
  docx: ['docx', 'doc'],
  csv: ['csv'],
  text: ['txt', 'text'],
} as const

const uploadSchema = z.object({
  documentName: z.string().min(1).max(255),
  documentType: z.enum(['pdf', 'docx', 'csv', 'text']),
  fileSize: z.number().positive().max(50 * 1024 * 1024), // 50MB max
})

// Helper to detect file type from extension
function getDocumentTypeFromFilename(filename: string): string | null {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (!ext) return null
  
  // Direct mapping for simplicity
  const extensionMap: Record<string, string> = {
    'pdf': 'pdf',
    'docx': 'docx',
    'doc': 'docx',
    'csv': 'csv',
    'txt': 'text',
    'text': 'text',
  }
  
  return extensionMap[ext] || null
}

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

    // Verify prospectus ownership
    const prospectusCheck = await sql`
      SELECT id, company_id FROM prospectuses WHERE id = ${prospectusId}
    ` as any[]

    if (prospectusCheck.length === 0) {
      return NextResponse.json(
        { error: 'Prospectus not found' },
        { status: 404 }
      )
    }

    const companyCheck = await sql`
      SELECT id FROM companies WHERE id = ${prospectusCheck[0].company_id} AND user_id = ${session.user?.id}
    ` as any[]

    if (companyCheck.length === 0) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Check feature access
    const hasAccess = await userCanAccessFeature(
      session.user.id,
      'prospectus_builder'
    )
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Feature not available in your plan. Upgrade to access Prospectus Builder.' },
        { status: 403 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const documentNameInput = formData.get('documentName') as string
    const documentTypeInput = formData.get('documentType') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file size first (fast check before parsing)
    if (file.size === 0) {
      return NextResponse.json(
        { error: 'Uploaded file is empty' },
        { status: 400 }
      )
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 50MB limit' },
        { status: 413 }
      )
    }

    // Validate input
    const validation = uploadSchema.safeParse({
      documentName: documentNameInput,
      documentType: documentTypeInput,
      fileSize: file.size,
    })

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { documentName, documentType } = validation.data

    // Strict document type validation - verify against whitelist
    if (!SUPPORTED_DOCUMENT_TYPES.includes(documentType as any)) {
      return NextResponse.json(
        { error: `Unsupported document type: ${documentType}. Supported types: ${SUPPORTED_DOCUMENT_TYPES.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate file extension matches document type
    const detectedType = getDocumentTypeFromFilename(file.name)
    if (detectedType && detectedType !== documentType) {
      console.warn(
        `[Document Upload] File extension (${detectedType}) doesn't match declared type (${documentType}) for ${file.name}`
      )
      // Don't block, but log for debugging - user may have renamed the file
    }

    if (!detectedType && documentType === 'text') {
      // Allow 'text' type for any unrecognized extension as fallback
      console.info(`[Document Upload] Unknown extension, treating as text: ${file.name}`)
    }

    // Convert file to buffer
    let buffer: Buffer
    try {
      buffer = Buffer.from(await file.arrayBuffer())
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to read file', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 400 }
      )
    }

    // Extract prospectus content using the extractor module
    let extractionResult
    try {
      extractionResult = await extractProspectusContent(
        buffer,
        documentType as 'pdf' | 'docx' | 'csv' | 'text'
      )

      // Validate extraction results
      if (!extractionResult.extractedSections || extractionResult.extractedSections.length === 0) {
        console.warn(`[Extraction] No sections extracted from ${file.name}`)
        // Continue anyway - user might approve empty sections
      }

      if (!extractionResult.rawText || extractionResult.rawText.trim().length === 0) {
        return NextResponse.json(
          {
            error: 'Document appears to be empty or unreadable',
            details: `Unable to extract text from ${documentType} file`,
          },
          { status: 400 }
        )
      }
    } catch (extractionError) {
      console.error('[Extraction Error]', {
        file: file.name,
        documentType,
        error: extractionError instanceof Error ? extractionError.message : String(extractionError),
      })
      return NextResponse.json(
        {
          error: 'Failed to extract document content',
          details: extractionError instanceof Error ? extractionError.message : 'Unknown extraction error',
        },
        { status: 422 } // 422 Unprocessable Entity
      )
    }

    // Upload file to S3 and get storage info
    let s3_key: string | null = null
    let s3_url: string | null = null
    let s3_url_expires_at: string | null = null

    try {
      const storageResult = await uploadProspectusFile(
        prospectusId,
        buffer,
        file.name
      )
      s3_key = storageResult.s3_key
      s3_url = storageResult.url
      s3_url_expires_at = storageResult.expiresAt
    } catch (storageError) {
      console.warn('[S3 Upload] Failed, continuing without S3 storage:', {
        prospectusId,
        fileName: file.name,
        error: storageError instanceof Error ? storageError.message : String(storageError),
      })
      // Don't fail the entire request if S3 upload fails
      // Documents are still extracted and stored in DB
    }

    // Store document record with S3 info
    let documentId: string
    try {
      const docInsert = await sql`
        INSERT INTO prospectus_documents (
          prospectus_id, 
          document_name, 
          document_type, 
          file_size_bytes,
          extracted_sections,
          extraction_method,
          last_extracted_at,
          uploaded_by,
          s3_key,
          s3_url,
          s3_url_expires_at,
          created_at,
          updated_at
        ) VALUES (${prospectusId}, ${documentName}, ${documentType}, ${buffer.length}, ${JSON.stringify(extractionResult.extractedSections)}, ${extractionResult.extractionMethod}, NOW(), ${session.user.id}, ${s3_key}, ${s3_url}, ${s3_url_expires_at}, NOW(), NOW())
        RETURNING id, extracted_sections, extraction_method
      ` as any[]

      if (!docInsert || docInsert.length === 0) {
        throw new Error('Database insert returned no results')
      }

      documentId = docInsert[0].id
    } catch (dbError) {
      // If database insert fails and we have S3 key, clean up the S3 file
      if (s3_key) {
        try {
          const { deleteProspectusFile } = await import('@/lib/prospectus-storage')
          await deleteProspectusFile(s3_key)
          console.warn('[Cleanup] Deleted orphaned S3 file after DB insert failure:', s3_key)
        } catch (cleanupError) {
          console.error('[Cleanup Failed] Could not delete S3 file:', {
            s3_key,
            error: cleanupError instanceof Error ? cleanupError.message : String(cleanupError),
          })
        }
      }

      console.error('[Database Error] Failed to insert document:', {
        prospectusId,
        fileName: file.name,
        error: dbError instanceof Error ? dbError.message : String(dbError),
      })

      return NextResponse.json(
        {
          error: 'Failed to save document record',
          details: dbError instanceof Error ? dbError.message : 'Database error',
        },
        { status: 500 }
      )
    }

    // Log extraction event
    await sql`
      INSERT INTO prospectus_events (
        prospectus_id,
        event_type,
        event_data,
        triggered_by,
        created_at
      ) VALUES (${prospectusId}, ${'document_extracted'}, ${JSON.stringify({
        documentId,
        documentName,
        sectionsExtracted: extractionResult.extractedSections.length,
        confidence: extractionResult.extractedSections.map((s) => ({
          name: s.sectionName,
          confidence: s.confidence,
        })),
      })}, ${session.user.id}, NOW())
    `

    // Prepare section mappings for review
    const sectionMappings = extractionResult.extractedSections.map(
      (extracted) => ({
        prospectusSection: extracted.sectionName,
        sourceContent: extracted.content.substring(0, 500), // Preview
        confidence: extracted.confidence,
        startIndex: extracted.startIndex,
        endIndex: extracted.endIndex,
      })
    )

    return NextResponse.json({
      success: true,
      documentId,
      documentName,
      extractedSections: sectionMappings,
      totalExtracted: extractionResult.extractedSections.length,
      message: `Successfully extracted ${extractionResult.extractedSections.length} sections. Review mappings and click "Apply Extractions" to populate sections.`,
    })
  } catch (error) {
    console.error('Upload/extraction error:', error)
    return NextResponse.json(
      {
        error: 'Failed to process document',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
