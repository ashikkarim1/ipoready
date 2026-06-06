import { NextRequest, NextResponse } from 'next/server'
import { sendWeeklySummary } from '@/lib/email-notifications'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'
/**
 * POST /api/email/weekly-summary
 *
 * Send weekly summary to a specific user
 *
 * Body:
 * {
 *   "userId": "uuid"
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required field: userId' },
        { status: 400 }
      )
    }

    const result = await sendWeeklySummary(userId)

    if (result.success) {
      return NextResponse.json(
        {
          success: true,
          message: 'Weekly summary sent',
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
    console.error('[api/email/weekly-summary]', errorMessage)

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
 * GET /api/email/weekly-summary
 *
 * Send weekly summaries to all users with 'weekly' notification frequency
 *
 * Query params:
 * ?action=send-all
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const action = searchParams.get('action')

    if (action === 'send-all') {
      // This endpoint can be called by a cron service
      // In production, add API key validation here

      // Get all users with 'weekly' notification frequency
      const usersRows = await sql`
        SELECT u.id FROM users u
        WHERE u.notification_frequency = 'weekly'
          AND u.is_approved = TRUE
        LIMIT 1000
      `

      let sent = 0
      let failed = 0

      for (const user of usersRows) {
        const result = await sendWeeklySummary((user as any).id)
        if (result.success) {
          sent++
        } else {
          failed++
        }
      }

      console.log(`[api/email/weekly-summary] Sent: ${sent}, Failed: ${failed}`)

      return NextResponse.json(
        {
          success: true,
          sent,
          failed,
          message: `Weekly summaries sent to ${sent} users`,
        },
        { status: 200 }
      )
    }

    return NextResponse.json(
      {
        error: 'Unknown action',
        availableActions: ['send-all'],
      },
      { status: 400 }
    )
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error('[api/email/weekly-summary] GET', errorMessage)

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    )
  }
}
