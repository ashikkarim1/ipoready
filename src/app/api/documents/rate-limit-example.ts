/**
 * Example: Rate-limited Documents API Routes
 *
 * Document endpoints have specific rate limits:
 * - GET /api/documents: 1000/minute per authenticated user (AUTHENTICATED_ENDPOINTS)
 * - POST /api/documents (upload): 20 per hour per user (DOCUMENT_UPLOAD)
 * - GET /api/documents/export: 5 per hour per user (DATA_EXPORT)
 *
 * Usage:
 * export const GET = withAuthenticatedRateLimit(handler)
 * export const POST = withDocumentUploadRateLimit(handler)
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  withAuthenticatedRateLimit,
  withDocumentUploadRateLimit,
  withDataExportRateLimit,
} from '@/lib/middleware/apply-rate-limit'

/**
 * GET documents list endpoint
 * Path: /api/documents
 * Rate limit: 1000 requests/minute per authenticated user
 */
async function handleGetDocuments(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url)
    const limit = searchParams.get('limit') || '20'
    const offset = searchParams.get('offset') || '0'

    // Your handler logic:
    // - Get user from session
    // - Query documents from database
    // - Apply filters, pagination
    // - Return results

    return NextResponse.json(
      {
        status: 'success',
        documents: [],
        total: 0,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}

/**
 * POST document upload endpoint
 * Path: /api/documents
 * Rate limit: 20 uploads per hour per authenticated user
 */
async function handleUploadDocument(req: NextRequest): Promise<NextResponse> {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Your handler logic:
    // - Validate file type and size
    // - Get user from session
    // - Upload to cloud storage (S3, Google Drive, etc.)
    // - Create document record in database
    // - Index for search if needed
    // - Return document metadata

    return NextResponse.json(
      {
        status: 'success',
        document: {
          id: 'doc_123',
          name: file.name,
          size: file.size,
          uploadedAt: new Date().toISOString(),
        },
      },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}

/**
 * GET document export endpoint
 * Path: /api/documents/export
 * Rate limit: 5 exports per hour per authenticated user
 */
async function handleExportDocuments(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url)
    const format = searchParams.get('format') || 'zip' // zip, csv, pdf

    // Your handler logic:
    // - Get user from session
    // - Query user's documents
    // - Generate export file
    // - Return as downloadable file or generate link

    return NextResponse.json(
      {
        status: 'success',
        downloadUrl: 'https://example.com/exports/doc_export_123.zip',
        format: format,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Export failed' },
      { status: 500 }
    )
  }
}

/**
 * DELETE document endpoint
 * Path: /api/documents/[id]
 * Rate limit: 1000 requests/minute per authenticated user
 */
async function handleDeleteDocument(req: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(req.url)
    const id = url.pathname.split('/').pop()

    if (!id) {
      return NextResponse.json(
        { error: 'Document ID required' },
        { status: 400 }
      )
    }

    // Your handler logic:
    // - Get user from session
    // - Verify ownership of document
    // - Delete from cloud storage
    // - Delete database record
    // - Return success

    return NextResponse.json(
      {
        status: 'success',
        message: 'Document deleted',
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Deletion failed' },
      { status: 500 }
    )
  }
}

// Export wrapped handlers
export const GET = withAuthenticatedRateLimit(handleGetDocuments)
export const POST = withDocumentUploadRateLimit(handleUploadDocument)

/**
 * Implementation checklist:
 *
 * 1. Update /api/documents/route.ts:
 *    - Replace your GET handler: export const GET = withAuthenticatedRateLimit(handleGetDocuments)
 *    - Replace your POST handler: export const POST = withDocumentUploadRateLimit(handleUploadDocument)
 *
 * 2. Create /api/documents/export/route.ts:
 *    export const GET = withDataExportRateLimit(handleExportDocuments)
 *
 * 3. Update /api/documents/[id]/route.ts:
 *    export const DELETE = withAuthenticatedRateLimit(handleDeleteDocument)
 *    export const GET = withAuthenticatedRateLimit(handleGetDocument)
 *    export const PATCH = withAuthenticatedRateLimit(handleUpdateDocument)
 *
 * 4. Test rate limits:
 *    - Upload 21 documents in sequence
 *    - Verify 21st upload returns 429
 *    - Verify remaining quota in X-RateLimit-Remaining header
 *    - Verify Retry-After header shows time until reset
 *
 * 5. Monitor:
 *    - Check rate limit statistics via getRateLimitStats()
 *    - Monitor Redis memory usage if using Redis backend
 *    - Set up alerts for high rate limit hit rates
 */
