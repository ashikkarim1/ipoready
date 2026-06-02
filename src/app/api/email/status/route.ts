export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getEmailQueue, getPendingEmails, getQueueSize } from '@/lib/email-queue'
import { getEmailLogs } from '@/lib/email-service'

/**
 * GET /api/email/status
 *
 * Get email service status and queue information
 *
 * Query params:
 * ?email=user@example.com (get logs for specific email)
 */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')

    // Get queue status
    const queueSize = getQueueSize()
    const pending = getPendingEmails()

    if (email) {
      // Get logs for specific email
      const logs = await getEmailLogs(email, 20)

      return NextResponse.json(
        {
          status: 'ok',
          email,
          logs: logs.map(log => ({
            id: log.id,
            templateId: log.template_id,
            subject: log.subject,
            status: log.status,
            sentAt: log.sent_at,
            createdAt: log.created_at,
            errorMessage: log.error_message,
          })),
        },
        { status: 200 }
      )
    }

    return NextResponse.json(
      {
        status: 'ok',
        service: 'Email notification service',
        queue: {
          size: queueSize,
          pending: pending.length,
          oldestEmail: pending.length > 0
            ? new Date(pending[0].enqueuedAt).toISOString()
            : null,
        },
        message: 'Email service is operational',
      },
      { status: 200 }
    )
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error('[api/email/status]', errorMessage)

    return NextResponse.json(
      {
        status: 'error',
        error: errorMessage,
      },
      { status: 500 }
    )
  }
}
