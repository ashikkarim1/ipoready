/**
 * Filing Status API (Detailed)
 * ============================
 * Get comprehensive filing status with phase information and document receipts.
 *
 * GET /api/filings/status/[filingId]?system=sedar|sec
 * POST /api/filings/status/[filingId]
 *
 * Response:
 * {
 *   "success": true,
 *   "filing": {
 *     "id": "...",
 *     "referenceNumber": "...",
 *     "system": "sedar" | "sec",
 *     "status": "submitted|processing|accepted|rejected",
 *     "phase": "validation|submission|confirmation|finalization",
 *     "submittedAt": "2024-01-01T00:00:00Z",
 *     "lastUpdatedAt": "2024-01-01T12:00:00Z",
 *     "estimatedCompletionDate": "2024-01-15T00:00:00Z",
 *     "documentReceiptIds": ["..."],
 *     "reviewComments": ["..."],
 *     "rejectionReasons": [{...}],
 *     "nextRequiredAction": "..."
 *   }
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getFilingService } from '@/lib/services/filing-service'
import { FilingError } from '@/lib/filing-adapters/BaseFilingAdapter'

interface FilingStatusParams {
  params: {
    filingId: string
  }
}

/**
 * Validate query parameters
 */
function validateStatusRequest(
  filingId: string,
  system?: string
): {
  valid: boolean
  error?: string
  filingId?: string
  system?: 'sedar' | 'sec'
} {
  if (!filingId || filingId.trim().length === 0) {
    return { valid: false, error: 'filingId is required and cannot be empty' }
  }

  // System is optional - will be inferred from filing database
  if (system && !['sedar', 'sec'].includes(system)) {
    return { valid: false, error: 'system must be sedar or sec' }
  }

  return {
    valid: true,
    filingId: filingId.trim(),
    system: (system as 'sedar' | 'sec') || undefined,
  }
}

/**
 * Map filing status to phase
 */
function statusToPhase(
  status: string
): 'validation' | 'submission' | 'confirmation' | 'finalization' {
  switch (status?.toLowerCase()) {
    case 'validating':
    case 'validation':
      return 'validation'
    case 'submitted':
    case 'submitting':
    case 'pending_review':
    case 'reviewing':
      return 'submission'
    case 'approved':
    case 'accepted':
    case 'processing':
      return 'confirmation'
    case 'rejected':
    case 'withdrawn':
    case 'finalized':
      return 'finalization'
    default:
      return 'submission'
  }
}

/**
 * Estimate completion date based on status
 */
function estimateCompletionDate(status: string, submittedAt?: Date): Date {
  const baseDate = submittedAt || new Date()
  const daysToAdd =
    {
      submitted: 10,
      pending_review: 7,
      reviewing: 5,
      approved: 0,
      accepted: 0,
      rejected: 0,
      withdrawn: 0,
      processing: 3,
    }[status?.toLowerCase()] || 10

  const estimated = new Date(baseDate)
  estimated.setDate(estimated.getDate() + daysToAdd)
  return estimated
}

/**
 * Format filing status response
 */
function formatStatusResponse(status: any, filingId: string, system?: 'sedar' | 'sec') {
  const submittedAt = status.submittedAt || new Date()
  const lastUpdatedAt = status.lastUpdatedAt || submittedAt

  return {
    filing: {
      id: status.filingId || filingId,
      referenceNumber: status.referenceNumber || filingId,
      system: system || status.system || 'unknown',
      status: status.status || 'unknown',
      phase: statusToPhase(status.status),
      submittedAt: submittedAt instanceof Date ? submittedAt.toISOString() : submittedAt,
      lastUpdatedAt:
        lastUpdatedAt instanceof Date ? lastUpdatedAt.toISOString() : lastUpdatedAt,
      estimatedCompletionDate: estimateCompletionDate(
        status.status,
        submittedAt instanceof Date ? submittedAt : new Date(submittedAt)
      ).toISOString(),
      documentReceiptIds: status.documentReceiptIds || [],
      reviewComments: status.reviewComments || [],
      rejectionReasons: status.rejectionReasons || [],
      nextRequiredAction:
        statusToPhase(status.status) === 'finalization'
          ? 'Filing complete - monitor for post-filing obligations'
          : status.nextRequiredAction ||
            `Awaiting ${statusToPhase(status.status)} completion`,
    },
    timestamp: new Date().toISOString(),
  }
}

/**
 * Handle GET request
 */
export async function GET(
  request: NextRequest,
  { params }: FilingStatusParams
): Promise<NextResponse> {
  try {
    const filingId = params.filingId
    const system = request.nextUrl.searchParams.get('system') || undefined

    // Validate parameters
    const validation = validateStatusRequest(filingId, system)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    console.info('Filing status query (GET)', {
      filingId: validation.filingId,
      system: validation.system,
      timestamp: new Date().toISOString(),
    })

    // Get filing status
    const filingService = getFilingService()
    // Default to SEDAR if system not specified
    const systemToUse = validation.system || 'sedar'
    const status = await filingService.getFilingStatus(
      validation.filingId!,
      systemToUse
    )

    // Return formatted response
    return NextResponse.json(
      {
        success: true,
        ...formatStatusResponse(status, filingId, systemToUse),
      },
      { status: 200 }
    )
  } catch (error) {
    // Handle specific error types
    if (error instanceof FilingError) {
      console.warn('Filing error', {
        code: error.code,
        message: error.message,
        retryable: error.retryable,
      })

      let statusCode = 500
      if (error.code === 'FILING_NOT_FOUND') {
        statusCode = 404
      } else if (!error.retryable) {
        statusCode = 400
      }

      return NextResponse.json(
        {
          success: false,
          error: error.code,
          message: error.message,
        },
        { status: statusCode }
      )
    }

    // Handle generic errors
    console.error('Filing status error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get filing status',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * Handle POST request (alternative to GET with system in body)
 */
export async function POST(
  request: NextRequest,
  { params }: FilingStatusParams
): Promise<NextResponse> {
  try {
    const filingId = params.filingId
    let body: any = {}

    // Try to parse body if provided
    try {
      const contentType = request.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        body = await request.json()
      }
    } catch (error) {
      // Body is optional for POST
    }

    const system = body.system || request.headers.get('x-filing-system') || undefined

    // Validate parameters
    const validation = validateStatusRequest(filingId, system)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    console.info('Filing status query (POST)', {
      filingId: validation.filingId,
      system: validation.system,
      timestamp: new Date().toISOString(),
    })

    // Get filing status
    const filingService = getFilingService()
    // Default to SEDAR if system not specified
    const systemToUse = validation.system || 'sedar'
    const status = await filingService.getFilingStatus(
      validation.filingId!,
      systemToUse
    )

    return NextResponse.json(
      {
        success: true,
        ...formatStatusResponse(status, filingId, systemToUse),
      },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof FilingError) {
      let statusCode = 500
      if (error.code === 'FILING_NOT_FOUND') statusCode = 404
      else if (!error.retryable) statusCode = 400

      return NextResponse.json(
        {
          success: false,
          error: error.code,
          message: error.message,
        },
        { status: statusCode }
      )
    }

    console.error('Filing status error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get filing status',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * Handle OPTIONS for CORS and documentation
 */
export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json(
    {
      methods: ['GET', 'POST'],
      description: 'Get detailed filing status with phase information',
      parameters: {
        path: {
          filingId: 'Required. The filing ID to query',
        },
        query: {
          system: 'Optional. Filing system (sedar or sec). If not provided, will be inferred.',
        },
      },
      responses: {
        200: {
          success: true,
          filing: {
            id: 'filing-123',
            referenceNumber: 'TR-ABC123',
            system: 'sedar',
            status: 'approved',
            phase: 'confirmation',
            submittedAt: '2024-01-01T00:00:00Z',
            lastUpdatedAt: '2024-01-05T12:00:00Z',
            estimatedCompletionDate: '2024-01-15T00:00:00Z',
            documentReceiptIds: ['receipt-1', 'receipt-2'],
            reviewComments: [],
            rejectionReasons: [],
            nextRequiredAction: 'Await final approval',
          },
        },
        404: {
          success: false,
          error: 'FILING_NOT_FOUND',
          message: 'Filing ID not found',
        },
      },
      phases: {
        validation: 'Initial document validation',
        submission: 'Filing submitted for review',
        confirmation: 'Filing accepted and processing',
        finalization: 'Filing complete or rejected',
      },
      statusMapping: {
        'sedar': [
          'submitted',
          'pending_review',
          'reviewing',
          'approved',
          'rejected',
          'withdrawn',
        ],
        'sec': ['submitted', 'processing', 'accepted', 'rejected'],
      },
    },
    { status: 200 }
  )
}
