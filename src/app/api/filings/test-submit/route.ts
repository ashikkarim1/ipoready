/**
 * Filing Test Submission API
 * ==========================
 * Test endpoint for filing system development and integration testing.
 *
 * POST /api/filings/test-submit
 * Body:
 * {
 *   "companyName": "Test Corp",
 *   "countryCode": "CA" | "US",
 *   "includeErrors": false,
 *   "useSandbox": true,
 *   "mockMode": false
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "testMode": true,
 *   "submissionResult": {
 *     "filingId": "...",
 *     "status": "submitted",
 *     "documentReceiptIds": ["..."],
 *     "system": "sedar" | "sec"
 *   },
 *   "generatedDocuments": [{...}],
 *   "debugInfo": {...}
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getFilingService } from '@/lib/services/filing-service'
import {
  DocumentMetadata,
  FilingMetadata,
  DocumentType,
} from '@/lib/filing-adapters/BaseFilingAdapter'
import {
export const dynamic = 'force-dynamic'
  generateSampleProspectus,
  generateRequiredDocuments,
  generateEdgeCaseDocuments,
} from '@/lib/filing-adapters/utils/test-document-generator'

/**
 * Validate test submission request
 */
function validateTestSubmissionRequest(body: any): {
  valid: boolean
  error?: string
  data?: any
} {
  if (!body.companyName || typeof body.companyName !== 'string') {
    return { valid: false, error: 'companyName is required and must be a string' }
  }

  const countryCode = body.countryCode?.toUpperCase()
  if (!['CA', 'US'].includes(countryCode)) {
    return { valid: false, error: 'countryCode must be CA or US' }
  }

  if (body.includeErrors !== undefined && typeof body.includeErrors !== 'boolean') {
    return { valid: false, error: 'includeErrors must be a boolean' }
  }

  return {
    valid: true,
    data: {
      companyName: body.companyName.trim(),
      countryCode,
      includeErrors: body.includeErrors || false,
      useSandbox: body.useSandbox !== false,
      mockMode: body.mockMode || false,
    },
  }
}

/**
 * Generate test filing documents
 */
function generateTestDocuments(
  countryCode: 'CA' | 'US',
  companyName: string,
  includeErrors: boolean
): DocumentMetadata[] {
  const generatedDocs = includeErrors
    ? generateEdgeCaseDocuments()
    : generateRequiredDocuments(countryCode, companyName)

  return generatedDocs.map((doc, index) => ({
    id: `doc-test-${Date.now()}-${index}`,
    type: doc.documentType as DocumentType,
    format: doc.mimeType.includes('xml')
      ? 'xml'
      : doc.mimeType.includes('pdf')
        ? 'pdf'
        : 'text',
    fileName: doc.filename,
    mimeType: doc.mimeType,
    size: doc.size,
    checksum: Buffer.from(doc.content).toString('hex').slice(0, 64),
    version: doc.metadata.version,
    createdAt: new Date(),
    updatedAt: new Date(),
    content: doc.content,
    language: 'en',
    validated: !includeErrors,
  }))
}

/**
 * Generate test filing metadata
 */
function generateTestMetadata(
  companyName: string,
  countryCode: 'CA' | 'US',
  userId: string = 'test-user'
): FilingMetadata {
  return {
    companyId: `company-test-${Date.now()}`,
    companyName,
    filingType: 'prospectus',
    currencyCode: countryCode === 'CA' ? 'CAD' : 'USD',
    country: countryCode,
    fiscalYearEnd: new Date('2023-12-31'),
    auditFirmName: 'Big 4 Audit Firm',
    auditFirmId: `audit-${Date.now()}`,
    underwriterNames: ['Underwriter 1', 'Underwriter 2'],
    prospectusFileId: `prospectus-${Date.now()}`,
    submittedBy: userId,
    submittedAt: new Date(),
    customMetadata: {
      testMode: true,
      testTimestamp: new Date().toISOString(),
      integrationTest: true,
    },
  }
}

/**
 * Mock response for testing without real API calls
 */
function generateMockResponse(
  countryCode: 'CA' | 'US',
  companyName: string,
  documentCount: number
): {
  filingId: string
  referenceNumber: string
  status: string
  submittedAt: Date
  system: 'sedar' | 'sec'
  webhookRegistered: boolean
  documentReceiptIds: string[]
} {
  const system = countryCode === 'CA' ? 'sedar' : 'sec'
  const now = new Date()
  const filingId = `filing-test-${system}-${Date.now()}`
  const referenceNumber =
    system === 'sedar'
      ? `TR-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
      : `0000000000-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 8)}`

  return {
    filingId,
    referenceNumber,
    status: 'submitted',
    submittedAt: now,
    system,
    webhookRegistered: true,
    documentReceiptIds: Array.from({ length: documentCount }, (_, i) =>
      `receipt-${filingId}-doc${i + 1}`
    ),
  }
}

/**
 * Handle test filing submission
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Validate request method and content type
    if (request.method !== 'POST') {
      return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
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
    const validation = validateTestSubmissionRequest(body)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const { companyName, countryCode, includeErrors, useSandbox, mockMode } =
      validation.data

    console.info('Test filing submission started', {
      companyName,
      countryCode,
      includeErrors,
      useSandbox,
      mockMode,
      timestamp: new Date().toISOString(),
    })

    // Generate test documents
    const testDocuments = generateTestDocuments(countryCode, companyName, includeErrors)
    const testMetadata = generateTestMetadata(companyName, countryCode)

    // Handle mock mode (no real API call)
    if (mockMode) {
      const mockResult = generateMockResponse(countryCode, companyName, testDocuments.length)

      return NextResponse.json(
        {
          success: true,
          testMode: true,
          mockMode: true,
          submissionResult: {
            filingId: mockResult.filingId,
            referenceNumber: mockResult.referenceNumber,
            status: mockResult.status,
            documentReceiptIds: mockResult.documentReceiptIds,
            system: mockResult.system,
            submittedAt: mockResult.submittedAt.toISOString(),
            webhookRegistered: mockResult.webhookRegistered,
          },
          generatedDocuments: testDocuments.map(doc => ({
            id: doc.id,
            type: doc.type,
            fileName: doc.fileName,
            size: doc.size,
            validated: doc.validated,
          })),
          debugInfo: {
            testMode: true,
            mockMode: true,
            countryCode,
            companyName,
            documentCount: testDocuments.length,
            includeErrors,
            timestamp: new Date().toISOString(),
          },
        },
        { status: 200 }
      )
    }

    // Real API submission (sandbox mode)
    const filingService = getFilingService()
    const system = countryCode === 'CA' ? 'sedar' : 'sec'

    try {
      const result = await filingService.submitFiling({
        filingSystem: system,
        documents: testDocuments,
        metadata: testMetadata,
        options: {
          webhookUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/webhooks/filing-status`,
          registerWebhook: true,
          dryRun: false,
        },
      })

      console.info('Test filing submission successful', {
        filingId: result.filingId,
        system,
        status: result.status,
      })

      return NextResponse.json(
        {
          success: result.success,
          testMode: true,
          mockMode: false,
          submissionResult: {
            filingId: result.filingId,
            referenceNumber: result.referenceNumber,
            status: result.status,
            documentReceiptIds: Array.from({ length: testDocuments.length }, (_, i) =>
              `${result.filingId}-doc${i + 1}`
            ),
            system: result.system,
            submittedAt: result.submittedAt.toISOString(),
            webhookRegistered: result.webhookRegistered,
          },
          generatedDocuments: testDocuments.map(doc => ({
            id: doc.id,
            type: doc.type,
            fileName: doc.fileName,
            size: doc.size,
            validated: doc.validated,
          })),
          debugInfo: {
            testMode: true,
            mockMode: false,
            countryCode,
            companyName,
            documentCount: testDocuments.length,
            includeErrors,
            useSandbox,
            system,
            timestamp: new Date().toISOString(),
            warnings: result.warnings,
          },
        },
        { status: result.success ? 200 : 400 }
      )
    } catch (apiError) {
      console.error('Test filing submission API error', {
        error: apiError instanceof Error ? apiError.message : 'Unknown error',
        system,
      })

      // Fall back to mock response on real API failure
      const mockResult = generateMockResponse(countryCode, companyName, testDocuments.length)

      return NextResponse.json(
        {
          success: false,
          testMode: true,
          mockMode: true,
          fallbackMode: true,
          error: 'Real API submission failed, returning mock response',
          apiError: apiError instanceof Error ? apiError.message : 'Unknown error',
          submissionResult: {
            filingId: mockResult.filingId,
            referenceNumber: mockResult.referenceNumber,
            status: 'mock_pending',
            documentReceiptIds: mockResult.documentReceiptIds,
            system: mockResult.system,
            submittedAt: mockResult.submittedAt.toISOString(),
            webhookRegistered: false,
          },
          generatedDocuments: testDocuments.map(doc => ({
            id: doc.id,
            type: doc.type,
            fileName: doc.fileName,
            size: doc.size,
            validated: doc.validated,
          })),
          debugInfo: {
            testMode: true,
            fallbackMode: true,
            countryCode,
            companyName,
            documentCount: testDocuments.length,
            includeErrors,
            system,
            timestamp: new Date().toISOString(),
          },
        },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error('Test filing submission error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })

    return NextResponse.json(
      {
        success: false,
        testMode: true,
        error: 'Test filing submission failed',
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
      description: 'Test filing submission endpoint for development and integration testing',
      requiredFields: ['companyName', 'countryCode'],
      optionalFields: ['includeErrors', 'useSandbox', 'mockMode'],
      examples: {
        request: {
          companyName: 'Test IPO Corp',
          countryCode: 'CA',
          includeErrors: false,
          useSandbox: true,
          mockMode: false,
        },
        response: {
          success: true,
          testMode: true,
          mockMode: false,
          submissionResult: {
            filingId: 'filing-test-sedar-1234567890',
            referenceNumber: 'TR-ABCD1234',
            status: 'submitted',
            system: 'sedar',
            submittedAt: '2024-01-01T00:00:00.000Z',
            documentReceiptIds: ['receipt-1', 'receipt-2'],
            webhookRegistered: true,
          },
        },
      },
    },
    { status: 200 }
  )
}
