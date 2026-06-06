import { NextRequest, NextResponse } from 'next/server'
import { getFilingService } from '@/lib/services/filing-service'
import {
  DocumentMetadata,
  FilingMetadata,
  DocumentType,
} from '@/lib/filing-adapters/BaseFilingAdapter'

export const dynamic = 'force-dynamic'

/**
 * Filing Submission API
 * ====================
 * Submit prospectus and documents to SEDAR or SEC EDGAR.
 *
 * POST /api/filings/submit
 * Body:
 * {
 *   "filingSystem": "sedar" | "sec",
 *   "documents": [...],
 *   "metadata": {...},
 *   "options": {
 *     "webhookUrl": "https://...",
 *     "registerWebhook": true,
 *     "dryRun": false
 *   }
 * }
 */

/**
 * Validate request body structure
 */
function validateSubmissionRequest(body: any): {
  valid: boolean
  error?: string
  data?: any
} {
  if (!body.filingSystem) {
    return { valid: false, error: 'filingSystem is required (sedar | sec)' }
  }

  if (!['sedar', 'sec'].includes(body.filingSystem)) {
    return { valid: false, error: 'filingSystem must be sedar or sec' }
  }

  if (!Array.isArray(body.documents) || body.documents.length === 0) {
    return { valid: false, error: 'documents array is required and must not be empty' }
  }

  if (!body.metadata) {
    return { valid: false, error: 'metadata is required' }
  }

  if (!body.metadata.companyName) {
    return { valid: false, error: 'metadata.companyName is required' }
  }

  if (!body.metadata.submittedBy) {
    return { valid: false, error: 'metadata.submittedBy is required' }
  }

  // Validate documents
  for (const doc of body.documents) {
    if (!doc.id || !doc.type || !doc.fileName) {
      return {
        valid: false,
        error: 'Each document must have id, type, and fileName',
      }
    }

    if (!doc.content) {
      return {
        valid: false,
        error: `Document ${doc.fileName} has no content`,
      }
    }
  }

  return { valid: true, data: body }
}

/**
 * Convert request documents to DocumentMetadata
 */
function buildDocumentMetadata(documents: any[]): DocumentMetadata[] {
  return documents.map(doc => ({
    id: doc.id || `doc-${Date.now()}`,
    type: (doc.type || 'prospectus') as DocumentType,
    format: (doc.format || 'pdf') as any,
    fileName: doc.fileName,
    mimeType: doc.mimeType || 'application/pdf',
    size: typeof doc.content === 'string'
      ? Buffer.byteLength(doc.content, 'utf8')
      : Buffer.byteLength(JSON.stringify(doc.content), 'utf8'),
    checksum: doc.checksum || `${doc.id}-${Date.now()}`,
    version: doc.version || '1.0.0',
    createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : new Date(),
    content: doc.content,
    language: doc.language || 'en',
    validated: doc.validated || false,
  }))
}

/**
 * Build filing metadata from request
 */
function buildFilingMetadata(metadata: any): FilingMetadata {
  return {
    companyId: metadata.companyId || `company-${Date.now()}`,
    companyName: metadata.companyName,
    filingType: metadata.filingType || 'prospectus',
    currencyCode: metadata.currencyCode || 'CAD',
    country: metadata.country || 'CA',
    fiscalYearEnd: metadata.fiscalYearEnd ? new Date(metadata.fiscalYearEnd) : undefined,
    auditFirmName: metadata.auditFirmName,
    auditFirmId: metadata.auditFirmId,
    underwriterNames: metadata.underwriterNames,
    prospectusFileId: metadata.prospectusFileId,
    submittedBy: metadata.submittedBy,
    submittedAt: metadata.submittedAt ? new Date(metadata.submittedAt) : new Date(),
    customMetadata: metadata.customMetadata || {},
  }
}

/**
 * Handle filing submission
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Validate request method and content type
    if (request.method !== 'POST') {
      return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
      )
    }

    const contentType = request.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      )
    }

    // Parse request body
    let body: any
    try {
      body = await request.json()
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      )
    }

    // Validate request
    const validation = validateSubmissionRequest(body)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Build submission request
    const documents = buildDocumentMetadata(body.documents)
    const metadata = buildFilingMetadata(body.metadata)

    console.info('Filing submission request', {
      system: body.filingSystem,
      companyName: metadata.companyName,
      documentCount: documents.length,
      dryRun: body.options?.dryRun,
    })

    // Get filing service and submit
    const filingService = getFilingService()
    const result = await filingService.submitFiling({
      filingSystem: body.filingSystem,
      documents,
      metadata,
      options: body.options,
    })

    // Return response
    const statusCode = result.success ? 200 : 400
    return NextResponse.json(
      {
        success: result.success,
        filing: {
          id: result.filingId,
          referenceNumber: result.referenceNumber,
          status: result.status,
          system: result.system,
          submittedAt: result.submittedAt.toISOString(),
          webhookRegistered: result.webhookRegistered,
        },
        message: result.message,
        warnings: result.warnings,
        error: result.error,
      },
      { status: statusCode }
    )
  } catch (error) {
    console.error('Filing submission error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Filing submission failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * Handle OPTIONS for CORS
 */
export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json(
    {
      methods: ['POST'],
      description: 'Submit filing to SEDAR or SEC EDGAR',
      requiredFields: ['filingSystem', 'documents', 'metadata'],
    },
    { status: 200 }
  )
}
