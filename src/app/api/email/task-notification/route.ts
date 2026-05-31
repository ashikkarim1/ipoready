import { NextRequest, NextResponse } from 'next/server'
import { notifyUserOfTask, notifyTeamOfAlert, sendTaskReminders } from '@/lib/email-notifications'

/**
 * POST /api/email/task-notification
 *
 * Notify a user about a task
 *
 * Body:
 * {
 *   "userId": "uuid",
 *   "taskId": "uuid",
 *   "notificationType": "assigned" | "due_soon" | "overdue"
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const { userId, taskId, notificationType = 'due_soon' } = body

    if (!userId || !taskId) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, taskId' },
        { status: 400 }
      )
    }

    const result = await notifyUserOfTask(userId, taskId, notificationType)

    if (result.success) {
      return NextResponse.json(
        {
          success: true,
          message: 'Task notification sent',
        },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      )
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error('[api/email/task-notification]', errorMessage)

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/email/task-notification
 *
 * Trigger sending all pending task reminders (cron job compatible)
 *
 * Query params:
 * ?action=send-reminders
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const action = searchParams.get('action')

    if (action === 'send-reminders') {
      // This endpoint can be called by a cron service
      // In production, add API key validation here
      const result = await sendTaskReminders()

      return NextResponse.json(
        {
          success: true,
          sent: result.sent,
          failed: result.failed,
        },
        { status: 200 }
      )
    }

    return NextResponse.json(
      {
        error: 'Unknown action',
        availableActions: ['send-reminders'],
      },
      { status: 400 }
    )
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error('[api/email/task-notification] GET', errorMessage)

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    )
  }
}
