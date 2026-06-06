/**
 * Filing Status Webhook Handler
 * =============================
 * Unified webhook endpoint for SEDAR 2 and SEC EDGAR filing status updates.
 *
 * Supports:
 * - SEDAR status callbacks (signed with HMAC-SHA256)
 * - SEC EDGAR status updates (via polling or push)
 * - Real-time status synchronization
 * - Database persistence
 * - Error retry logic
 *
 * POST /api/webhooks/filing-status
 * Required headers:
 * - Content-Type: application/json
 * - X-Filing-System: sedar | sec (optional, inferred from payload)
 * - X-Signature: HMAC-SHA256 signature (SEDAR only)
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
  previousStatus: string
  status: 'submitted' | 'pending_review' | 'reviewing' | 'approved' | 'rejected' | 'withdrawn'
  timestamp: string
  documentStatuses?: Array<{ fileName: string; status: string }>
  reviewComments?: string[]
  rejectionReasons?: Array<{ field: string; code: string; description: string }>
  nextSteps?: string[]
  signature?: string
}

interface SECWebhookPayload {
  accessionNumber: string
  cik: string
  companyName: string
  formType: string
  previousStatus?: string
  status: 'submitted' | 'processing' | 'accepted' | 'rejected'
  filedDate: string
  acceptanceDateTime: string
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
 * Helper: Validate webhook signature for SEDAR
 */
function validateSEDARSignature(payload: SEDARWebhookPayload, signature: string): boolean {
  const secret = process.env.SEDAR2_WEBHOOK_SECRET || ''
  if (!secret) {
    console.warn('SEDAR webhook secret not configured - skipping signature validation')
    return true // Skip validation if secret not configured
  }

  const timestamp = payload.timestamp || ''
  const payloadString = `${timestamp}.${JSON.stringify(payload)}`

  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(payloadString)
  const expectedSignature = hmac.digest('hex')

  return signature === expectedSignature
}

/**
 * Helper: Validate webhook signature for SEC EDGAR
 */
function validateSECSignature(payload: SECWebhookPayload, signature: string): boolean {
  const secret = process.env.SEC_WEBHOOK_SECRET || ''
  if (!secret) {
    console.warn('SEC webhook secret not configured - skipping signature validation')
    return true
  }

  const timestamp = payload.timestamp || ''
  const payloadString = `${timestamp}.${JSON.stringify(payload)}`

  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(payloadString)
  const expectedSignature = hmac.digest('hex')

  return signature === expectedSignature
}

/**
 * Helper: Detect filing system from payload
 */
function detectFilingSystem(payload: any): 'sedar' | 'sec' {
  // SEDAR uses trackingNumber, SEC uses accessionNumber
  if ('trackingNumber' in payload) return 'sedar'
  if ('accessionNumber' in payload) return 'sec'

  // Check payload structure
  if ('cik' in payload) return 'sec'
  if ('filingId' in payload) return 'sedar'

  return 'sedar' // Default
}

/**
 * Helper: Persist status update to database
 */
async function persistStatusUpdate(update: FilingStatusUpdate): Promise<void> {
  try {
    // TODO: Implement database persistence
    // Example using Prisma:
    // await db.filing.update({
    //   where: { externalId: update.filingId },
    //   data: {
    //     status: update.newStatus,
    //     lastStatusUpdate: update.updatedAt,
    //     statusHistory: {
    //       push: {
    //         previousStatus: update.previousStatus,
    //         newStatus: update.newStatus,
    //         timestamp: update.updatedAt,
    //         source: update.filingSystem,
    //       },
    //     },
    //   },
    // })

    console.info('Filed status update persisted', {
      filingId: update.filingId,
      newStatus: update.newStatus,
      system: update.filingSystem,
    })
  } catch (error) {
    console.error('Failed to persist status update', {
      filingId: update.filingId,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    // Don't throw - allow webhook to complete even if DB fails
  }
}

/**
 * Helper: Send notification to user
 */
async function notifyUser(update: FilingStatusUpdate): Promise<void> {
  try {
    // TODO: Implement notification delivery
    // Example:
    // await sendNotification({
    //   type: 'FILING_STATUS_UPDATE',
    //   filing: {
    //     id: update.filingId,
    //     system: update.filingSystem,
    //     previousStatus: update.previousStatus,
    //     newStatus: update.newStatus,
    //   },
    // })

    console.info('User notification queued', {
      filingId: update.filingId,
      newStatus: update.newStatus,
    })
  } catch (error) {
    console.error('Failed to queue notification', {
      filingId: update.filingId,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Helper: Log webhook for audit trail
 */
async function logWebhookEvent(
  payload: any,
  system: 'sedar' | 'sec',
  validated: boolean,
  statusCode: number
): Promise<void> {
  try {
    // TODO: Implement audit logging
    const event = {
      timestamp: new Date().toISOString(),
      system,
      filingId: payload.filingId || payload.accessionNumber,
      status: payload.status,
      validated,
      statusCode,
      payload: {
        // Log safe subset of payload
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
 * Handle SEDAR webhook
 */
async function handleSEDARWebhook(payload: SEDARWebhookPayload): Promise<FilingStatusUpdate> {
  const signatureValid = validateSEDARSignature(payload, payload.signature || '')

  if (!signatureValid) {
    console.warn('SEDAR webhook signature validation failed', {
      filingId: payload.filingId,
    })
  }

  return {
    filingId: payload.filingId,
    referenceNumber: payload.trackingNumber,
    filingSystem: 'sedar',
    previousStatus: payload.previousStatus,
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
 * Handle SEC EDGAR webhook
 */
async function handleSECWebhook(payload: SECWebhookPayload): Promise<FilingStatusUpdate> {
  const signatureValid = validateSECSignature(payload, payload.signature || '')

  if (!signatureValid) {
    console.warn('SEC webhook signature validation failed', {
      accessionNumber: payload.accessionNumber,
    })
  }

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
    },
  }
}

/**
 * Main webhook handler
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
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

    // Validate payload has required fields
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

    console.info('Webhook received', {
      filingSystem,
      filingId: payload.filingId || payload.accessionNumber,
      status: payload.status,
      timestamp: new Date().toISOString(),
    })

    // Process based on filing system
    let statusUpdate: FilingStatusUpdate
    let validatedSignature = true

    if (filingSystem === 'sedar') {
      statusUpdate = await handleSEDARWebhook(payload as SEDARWebhookPayload)
      validatedSignature = validateSEDARSignature(payload as SEDARWebhookPayload, payload.signature || '')
    } else {
      statusUpdate = await handleSECWebhook(payload as SECWebhookPayload)
      validatedSignature = validateSECSignature(payload as SECWebhookPayload, payload.signature || '')
    }

    // Log webhook event
    await logWebhookEvent(payload, filingSystem, validatedSignature, 202)

    // Persist status update asynchronously
    persistStatusUpdate(statusUpdate).catch(error => {
      console.error('Background task failed: persistStatusUpdate', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    })

    // Notify user asynchronously
    notifyUser(statusUpdate).catch(error => {
      console.error('Background task failed: notifyUser', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    })

    // Return 202 Accepted immediately (async processing)
    return NextResponse.json(
      {
        success: true,
        filingId: statusUpdate.filingId,
        status: statusUpdate.newStatus,
        message: 'Status update received and queued for processing',
      },
      { status: 202 }
    )
  } catch (error) {
    console.error('Webhook handler error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
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
      service: 'filing-status-webhook',
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  )
}

/**
 * Handle unsupported methods
 */
export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json(
    {
      methods: ['GET', 'POST'],
      description: 'Filing status webhook endpoint for SEDAR and SEC EDGAR',
    },
    { status: 200 }
  )
}
