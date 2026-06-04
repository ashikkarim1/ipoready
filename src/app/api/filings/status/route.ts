/**
 * Filing Status API
 * =================
 * Get real-time filing status from SEDAR or SEC EDGAR.
 *
 * GET /api/filings/status?filingId=XXX&system=sedar|sec
 *
 * Response:
 * {
 *   "filing": {
 *     "id": "...",
 *     "referenceNumber": "...",
 *     "status": "submitted|processing|accepted|rejected|withdrawn",
 *     "phase": "validation|submission|confirmation|finalization",
 *     "lastUpdatedAt": "2024-01-01T00:00:00Z",
 *     "reviewComments": ["..."],
 *     "rejectionReasons": ["..."],
 *     "nextRequiredAction": "..."
 *   }
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getFilingService } from '@/lib/services/filing-service'
import { FilingError } from '@/lib/filing-adapters/BaseFilingAdapter'

/**
 * Validate query parameters
 */
function validateStatusRequest(params: URLSearchParams): {
  valid: boolean
  error?: string
  filingId?: string
  system?: 'sedar' | 'sec'
} {
  const filingId = params.get('filingId')
  const system = params.get('system')

  if (!filingId) {
    return { valid: false, error: 'filingId query parameter is required' }
  }

  if (!system) {
    return { valid: false, error: 'system query parameter is required (sedar or sec)' }
  }

  if (!['sedar', 'sec'].includes(system)) {
    return { valid: false, error: 'system must be sedar or sec' }
  }

  if (filingId.trim().length === 0) {
    return { valid: false, error: 'filingId cannot be empty' }
  }

  return {
    valid: true,
    filingId: filingId.trim(),
    system: system as 'sedar' | 'sec',
  }
}

/**
 * Format status response
 */
function formatStatusResponse(status: any) {
  return {
    filing: {
      id: status.filingId,
      referenceNumber: status.referenceNumber,
      status: status.status,
      phase: status.phase,
      lastUpdatedAt: status.lastUpdatedAt?.toISOString(),
      estimatedCompletionDate: status.estimatedCompletionDate?.toISOString(),
      reviewComments: status.reviewComments,
      rejectionReasons: status.rejectionReasons,
      nextRequiredAction: status.nextRequiredAction,
    },
    timestamp: new Date().toISOString(),
  }
}

/**
 * Handle status query
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Extract query parameters
    const params = request.nextUrl.searchParams
    const validation = validateStatusRequest(params)

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const { filingId: id, system } = validation

    console.info('Filing status query', {
      filingId: id,
      system,
      timestamp: new Date().toISOString(),
    })

    // Get filing status
    const filingService = getFilingService()
    const status = await filingService.getFilingStatus(id!, system!)

    // Return formatted response
    return NextResponse.json(
      {
        success: true,
        ...formatStatusResponse(status),
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
 * Handle POST (alternative to GET with body)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()

    if (!body.filingId || !body.system) {
      return NextResponse.json(
        { error: 'filingId and system are required' },
        { status: 400 }
      )
    }

    if (!['sedar', 'sec'].includes(body.system)) {
      return NextResponse.json(
        { error: 'system must be sedar or sec' },
        { status: 400 }
      )
    }

    console.info('Filing status query (POST)', {
      filingId: body.filingId,
      system: body.system,
    })

    const filingService = getFilingService()
    const status = await filingService.getFilingStatus(body.filingId, body.system)

    return NextResponse.json(
      {
        success: true,
        ...formatStatusResponse(status),
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
 * Handle OPTIONS for CORS
 */
export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json(
    {
      methods: ['GET', 'POST'],
      description: 'Get real-time filing status from SEDAR or SEC EDGAR',
      parameters: {
        get: ['filingId', 'system'],
        post: ['filingId', 'system'],
      },
    },
    { status: 200 }
  )
}
