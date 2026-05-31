import { NextRequest, NextResponse } from 'next/server'
import { sendBoardReport, notifyTeamOfAlert } from '@/lib/email-notifications'

/**
 * POST /api/email/board-report
 *
 * Send board report to a user or team
 *
 * Body:
 * {
 *   "userId": "uuid", // optional if companyId + teamEmail is provided
 *   "companyId": "uuid", // optional if userId is provided
 *   "reportTitle": "string",
 *   "reportHighlights": ["string", ...],
 *   "sendToTeam": boolean // optional, default: false
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      userId,
      companyId,
      reportTitle,
      reportHighlights = [],
      sendToTeam = false,
    } = body

    if (!reportTitle || !reportHighlights || reportHighlights.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: reportTitle, reportHighlights (array)' },
        { status: 400 }
      )
    }

    if (!userId && !companyId) {
      return NextResponse.json(
        { error: 'Must provide either userId or companyId' },
        { status: 400 }
      )
    }

    // Send to individual user
    if (userId && !sendToTeam) {
      const result = await sendBoardReport(userId, reportTitle, reportHighlights)

      if (result.success) {
        return NextResponse.json(
          {
            success: true,
            message: 'Board report sent to user',
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
    }

    // Send to entire team
    if (companyId) {
      const result = await notifyTeamOfAlert(
        companyId,
        reportTitle,
        `Board Report: ${reportTitle}\n\nKey highlights:\n${reportHighlights.map((h: string) => `• ${h}`).join('\n')}`,
        undefined,
        'View full report'
      )

      return NextResponse.json(
        {
          success: true,
          sent: result.success,
          failed: result.failed,
          message: `Board report sent to ${result.success} team members`,
        },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error('[api/email/board-report]', errorMessage)

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    )
  }
}
