import { NextRequest, NextResponse } from 'next/server'
import { sendEmailWithRetry } from '@/lib/email-service'
import { enqueueEmail } from '@/lib/email-queue'
import { EmailTemplateId } from '@/lib/email-templates'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'
interface SendEmailRequest {
  to: string
  templateId: EmailTemplateId
  variables: Record<string, any>
  userId?: string
  companyId?: string
  useQueue?: boolean
  tags?: string[]
}

/**
 * POST /api/email/send
 *
 * Send an email immediately or queue it for processing.
 *
 * Body:
 * {
 *   "to": "user@example.com",
 *   "templateId": "welcome",
 *   "variables": { "name": "John", ... },
 *   "userId": "uuid", // optional
 *   "companyId": "uuid", // optional
 *   "useQueue": false, // optional, default: false (send immediately)
 *   "tags": ["welcome", "onboarding"] // optional
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body: SendEmailRequest = await req.json()

    // Validate required fields
    if (!body.to || !body.templateId || !body.variables) {
      return NextResponse.json(
        { error: 'Missing required fields: to, templateId, variables' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.to)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Validate template ID
    const validTemplates = ['welcome', 'password-reset', 'task-reminder', 'notification-alert', 'board-report', 'weekly-summary', 'plan-upgrade']
    if (!validTemplates.includes(body.templateId)) {
      return NextResponse.json(
        { error: `Invalid templateId. Must be one of: ${validTemplates.join(', ')}` },
        { status: 400 }
      )
    }

    // Optional: Verify user exists if userId provided
    if (body.userId) {
      try {
        const users = await sql`SELECT id FROM users WHERE id = ${body.userId} LIMIT 1`
        if (users.length === 0) {
          return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
          )
        }
      } catch (err) {
        console.error('[email/send] Failed to verify user:', err)
        // Don't fail the request if verification fails
      }
    }

    // Send or queue
    if (body.useQueue) {
      // Add to queue for batch processing
      const queueId = enqueueEmail({
        to: body.to,
        templateId: body.templateId,
        variables: body.variables,
        userId: body.userId,
        companyId: body.companyId,
        tags: body.tags,
      })

      return NextResponse.json(
        {
          success: true,
          queued: true,
          queueId,
          message: 'Email queued for processing',
        },
        { status: 202 }
      )
    } else {
      // Send immediately
      const result = await sendEmailWithRetry({
        to: body.to,
        templateId: body.templateId,
        variables: body.variables,
        userId: body.userId,
        companyId: body.companyId,
        tags: body.tags,
      })

      if (result.success) {
        return NextResponse.json(
          {
            success: true,
            messageId: result.messageId,
            message: 'Email sent successfully',
          },
          { status: 200 }
        )
      } else {
        return NextResponse.json(
          {
            success: false,
            error: result.error,
            message: 'Failed to send email',
          },
          { status: 500 }
        )
      }
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error('[api/email/send]', errorMessage)

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        message: 'Failed to process email request',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/email/send
 *
 * Health check and queue status
 */
export async function GET(req: NextRequest) {
  try {
    const { getQueueSize, getPendingEmails } = await import('@/lib/email-queue')

    const queueSize = getQueueSize()
    const pending = getPendingEmails()

    return NextResponse.json(
      {
        status: 'ok',
        queueSize,
        pendingCount: pending.length,
        message: 'Email service is running',
      },
      { status: 200 }
    )
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error('[api/email/send] GET', errorMessage)

    return NextResponse.json(
      {
        status: 'error',
        error: errorMessage,
      },
      { status: 500 }
    )
  }
}
