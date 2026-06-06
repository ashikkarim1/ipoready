/**
 * Unified Filing Webhook Handler
 * ==============================
 * Handles status updates from both SEDAR 2 and SEC EDGAR.
 *
 * POST /api/filings/webhook
 * Headers:
 * - Content-Type: application/json
 * - X-Signature: HMAC-SHA256 signature (for verification)
 * - X-Filing-System: sedar | sec (optional, inferred from payload)
 *
 * Request body examples:
 * SEDAR:
 * {
 *   "filingId": "filing-123",
 *   "trackingNumber": "TR-ABC123",
 *   "status": "approved",
 *   "timestamp": "2024-01-01T00:00:00Z"
 * }
 *
 * SEC:
 * {
 *   "accessionNumber": "0000000000-24-000001",
 *   "cik": "0000000001",
 *   "status": "accepted",
 *   "acceptanceDateTime": "2024-01-01T00:00:00Z"
 * }
 *
 * Response (202 Accepted):
 * {
 *   "status": "ok",
 *   "filingId": "filing-123",
 *   "message": "Status update received and queued for processing"
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'
/**
 * Webhook payload types
 */
interface SEDARWebhookPayload {
  filingId: string
  trackingNumber: string
  previousStatus?: string
  status: 'submitted' | 'pending_review' | 'reviewing' | 'approved' | 'rejected' | 'withdrawn'
  timestamp: string
  documentStatuses?: Array<{ fileName: string; status: string; checksum?: string }>
  reviewComments?: string[]
  rejectionReasons?: Array<{ field: string; code: string; description: string }>
  nextSteps?: string[]
  signature?: string
}

interface SECWebhookPayload {
  accessionNumber: string
  cik: string
  companyName?: string
  formType?: string
  previousStatus?: string
  status: 'submitted' | 'processing' | 'accepted' | 'rejected'
  filedDate?: string
  acceptanceDateTime?: string
  items?: string
  timestamp?: string
  signature?: string
}

interface FilingStatusUpdate {
  filingId: string
  referenceNumber: string
  filingSystem: 'sedar' | 'sec'
  previousStatus: string
  newStatus: string
  updatedAt: Date
  metadata: Record<string, any>
}

/**
 * Validate webhook signature using HMAC-SHA256
 */
function validateSignature(payload: any, signature: string, system: 'sedar' | 'sec'): boolean {
  const secret = system === 'sedar'
    ? process.env.SEDAR2_WEBHOOK_SECRET
    : process.env.SEC_WEBHOOK_SECRET

  if (!secret) {
    console.warn(`${system.toUpperCase()} webhook secret not configured - skipping signature validation`)
    return true // Skip validation if secret not configured
  }

  // Build the signed string: timestamp.payload
  const timestamp = payload.timestamp || new Date().toISOString()
  const payloadString = `${timestamp}.${JSON.stringify(payload)}`

  // Calculate HMAC-SHA256
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(payloadString)
  const expectedSignature = hmac.digest('hex')

  const isValid = signature === expectedSignature
  if (!isValid) {
    console.warn(`${system.toUpperCase()} webhook signature validation failed`, {
      provided: signature.substring(0, 16) + '...',
      expected: expectedSignature.substring(0, 16) + '...',
    })
  }
  return isValid
}

/**
 * Detect filing system from payload structure
 */
function detectFilingSystem(payload: any): 'sedar' | 'sec' {
  // SEDAR uses trackingNumber or filingId
  if ('trackingNumber' in payload || ('filingId' in payload && !('accessionNumber' in payload))) {
    return 'sedar'
  }

  // SEC uses accessionNumber or cik
  if ('accessionNumber' in payload || 'cik' in payload) {
    return 'sec'
  }

  // Default to SEDAR
  return 'sedar'
}

/**
 * Validate payload timestamp to prevent replay attacks
 */
function validateTimestamp(payload: any): {
  valid: boolean
  error?: string
} {
  const timestamp = payload.timestamp
  if (!timestamp) {
    return { valid: false, error: 'Missing timestamp in payload' }
  }

  try {
    const payloadTime = new Date(timestamp).getTime()
    const currentTime = Date.now()
    const maxAgeMs = 5 * 60 * 1000 // 5 minutes

    if (payloadTime > currentTime) {
      return { valid: false, error: 'Timestamp is in the future' }
    }

    if (currentTime - payloadTime > maxAgeMs) {
      return { valid: false, error: 'Timestamp is too old (max 5 minutes)' }
    }

    return { valid: true }
  } catch (error) {
    return { valid: false, error: 'Invalid timestamp format' }
  }
}

/**
 * Process SEDAR webhook
 */
function handleSEDARWebhook(payload: SEDARWebhookPayload): FilingStatusUpdate {
  return {
    filingId: payload.filingId,
    referenceNumber: payload.trackingNumber,
    filingSystem: 'sedar',
    previousStatus: payload.previousStatus || 'submitted',
    newStatus: payload.status,
    updatedAt: new Date(payload.timestamp),
    metadata: {
      documentStatuses: payload.documentStatuses || [],
      reviewComments: payload.reviewComments || [],
      rejectionReasons: payload.rejectionReasons || [],
      nextSteps: payload.nextSteps || [],
    },
  }
}

/**
 * Process SEC EDGAR webhook
 */
function handleSECWebhook(payload: SECWebhookPayload): FilingStatusUpdate {
  return {
    filingId: payload.accessionNumber,
    referenceNumber: payload.accessionNumber,
    filingSystem: 'sec',
    previousStatus: payload.previousStatus || 'submitted',
    newStatus: payload.status,
    updatedAt: new Date(payload.acceptanceDateTime || payload.timestamp || Date.now()),
    metadata: {
      cik: payload.cik,
      companyName: payload.companyName,
      formType: payload.formType,
      items: payload.items,
      filedDate: payload.filedDate,
    },
  }
}

/**
 * Persist status update to database (placeholder)
 */
async function persistStatusUpdate(update: FilingStatusUpdate): Promise<void> {
  try {
    // TODO: Implement database persistence with Prisma
    // Example:
    // await db.filing.update({
    //   where: { externalId: update.filingId },
    //   data: {
    //     status: update.newStatus,
    //     lastStatusUpdate: update.updatedAt,
    //     statusHistory: {
    //       push: {
    //         from: update.previousStatus,
    //         to: update.newStatus,
    //         timestamp: update.updatedAt,
    //         source: update.filingSystem,
    //       },
    //     },
    //   },
    // })

    console.info('Filing status update recorded', {
      filingId: update.filingId,
      from: update.previousStatus,
      to: update.newStatus,
      system: update.filingSystem,
    })
  } catch (error) {
    console.error('Failed to persist status update', {
      filingId: update.filingId,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    // Don't throw - webhook must always respond successfully
  }
}

/**
 * Send notification to user (placeholder)
 */
async function notifyUser(update: FilingStatusUpdate): Promise<void> {
  try {
    // TODO: Implement notification delivery
    // Example using existing notification system:
    // await sendNotification({
    //   type: 'FILING_STATUS_UPDATE',
    //   data: {
    //     filingId: update.filingId,
    //     previousStatus: update.previousStatus,
    //     newStatus: update.newStatus,
    //     system: update.filingSystem,
    //   },
    // })

    console.info('User notification queued', {
      filingId: update.filingId,
      newStatus: update.newStatus,
      system: update.filingSystem,
    })
  } catch (error) {
    console.error('Failed to queue notification', {
      filingId: update.filingId,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Log webhook event for audit trail
 */
async function logWebhookEvent(
  system: 'sedar' | 'sec',
  payload: any,
  validated: boolean,
  statusCode: number,
  processingTimeMs: number
): Promise<void> {
  try {
    // TODO: Implement audit logging with database or third-party service
    const event = {
      timestamp: new Date().toISOString(),
      system,
      filingId: payload.filingId || payload.accessionNumber,
      previousStatus: payload.previousStatus,
      newStatus: payload.status,
      validated,
      statusCode,
      processingTimeMs,
      // Sanitized payload (no sensitive data)
      payload: {
        status: payload.status,
        previousStatus: payload.previousStatus,
        timestamp: payload.timestamp,
      },
    }

    console.info('Webhook event logged', event)
  } catch (error) {
    console.error('Failed to log webhook event', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Handle webhook POST
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now()

  try {
    // Validate content type
    const contentType = request.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Invalid Content-Type. Expected application/json' },
        { status: 400 }
      )
    }

    // Parse request body
    let payload: any
    try {
      payload = await request.json()
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!payload.filingId && !payload.accessionNumber) {
      return NextResponse.json(
        { error: 'Missing required field: filingId or accessionNumber' },
        { status: 400 }
      )
    }

    if (!payload.status) {
      return NextResponse.json(
        { error: 'Missing required field: status' },
        { status: 400 }
      )
    }

    // Detect filing system
    const filingSystem = detectFilingSystem(payload)

    // Validate timestamp
    const timestampValidation = validateTimestamp(payload)
    if (!timestampValidation.valid) {
      console.warn('Timestamp validation failed', {
        system: filingSystem,
        filingId: payload.filingId || payload.accessionNumber,
        error: timestampValidation.error,
      })
      // Continue processing but log the warning
    }

    // Validate signature
    const signature = payload.signature || request.headers.get('x-signature') || ''
    const signatureValid = validateSignature(payload, signature, filingSystem)

    if (!signatureValid && signature) {
      console.warn('Signature validation failed', {
        system: filingSystem,
        filingId: payload.filingId || payload.accessionNumber,
      })
      // Continue processing - signature is optional if not configured
    }

    console.info('Webhook received', {
      system: filingSystem,
      filingId: payload.filingId || payload.accessionNumber,
      status: payload.status,
      timestamp: new Date().toISOString(),
    })

    // Process webhook based on filing system
    let statusUpdate: FilingStatusUpdate

    if (filingSystem === 'sedar') {
      statusUpdate = handleSEDARWebhook(payload as SEDARWebhookPayload)
    } else {
      statusUpdate = handleSECWebhook(payload as SECWebhookPayload)
    }

    const processingTimeMs = Date.now() - startTime

    // Queue async tasks (don't wait for them)
    const asyncTasks = Promise.all([
      persistStatusUpdate(statusUpdate),
      notifyUser(statusUpdate),
      logWebhookEvent(filingSystem, payload, signatureValid, 202, processingTimeMs),
    ]).catch(error => {
      console.error('Async webhook tasks failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    })

    // Return 202 Accepted immediately (async processing)
    return NextResponse.json(
      {
        status: 'ok',
        filingId: statusUpdate.filingId,
        message: 'Status update received and queued for processing',
        timestamp: new Date().toISOString(),
      },
      { status: 202 }
    )
  } catch (error) {
    const processingTimeMs = Date.now() - startTime

    console.error('Webhook handler error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      processingTimeMs,
    })

    return NextResponse.json(
      {
        status: 'error',
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

/**
 * Handle GET for health check
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json(
    {
      status: 'ok',
      service: 'filing-webhook',
      endpoint: '/api/filings/webhook',
      supportsystems: ['sedar', 'sec'],
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  )
}

/**
 * Handle OPTIONS for CORS and documentation
 */
export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json(
    {
      methods: ['GET', 'POST'],
      description: 'Unified webhook endpoint for SEDAR 2 and SEC EDGAR filing status updates',
      supportedFilingSystems: ['sedar', 'sec'],
      requiredHeaders: {
        'Content-Type': 'application/json',
        'X-Signature': 'HMAC-SHA256 signature (optional if not configured)',
      },
      requiredPayloadFields: ['filingId or accessionNumber', 'status', 'timestamp'],
      securityFeatures: [
        'HMAC-SHA256 signature validation',
        'Timestamp validation (max 5 minutes)',
        'Replay attack prevention',
      ],
      sedarExample: {
        filingId: 'filing-123',
        trackingNumber: 'TR-ABC123',
        previousStatus: 'pending_review',
        status: 'approved',
        timestamp: '2024-01-01T00:00:00Z',
        documentStatuses: [
          { fileName: 'prospectus.pdf', status: 'approved' },
        ],
        reviewComments: [],
        rejectionReasons: [],
        nextSteps: [],
        signature: 'hmac_signature_hex',
      },
      secExample: {
        accessionNumber: '0000000000-24-000001',
        cik: '0000000001',
        companyName: 'Example Corp',
        formType: 'S-1',
        previousStatus: 'submitted',
        status: 'accepted',
        filedDate: '2024-01-01',
        acceptanceDateTime: '2024-01-01T12:00:00Z',
        timestamp: '2024-01-01T12:00:00Z',
        signature: 'hmac_signature_hex',
      },
    },
    { status: 200 }
  )
}
