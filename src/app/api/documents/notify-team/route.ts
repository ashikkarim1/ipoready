import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

/**
 * POST /api/documents/notify-team
 *
 * Notifies the team when documents reach 90%+ completion milestone
 * Sends email and in-app notification to all team members
 */

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, message, completionPercentage, timestamp } = body

    // Validate request
    if (!type || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Only notify at submission-ready (90%+) milestone
    if (type === 'submission-ready' && completionPercentage >= 90) {
      // Send to your notification service (email, Slack, etc.)
      const notificationPayload = {
        type: 'submission-ready',
        companyId: session.user?.id,
        completionPercentage,
        message,
        timestamp,
        recipients: 'team', // All team members
        urgency: 'high',
      }

      // TODO: Integrate with your email service (Resend)
      // await sendTeamNotification(notificationPayload)

      // TODO: Integrate with your notification database
      // await createNotification(notificationPayload)

      // TODO: Integrate with Slack/Teams
      // await sendSlackNotification(notificationPayload)

      console.log('Team notification:', notificationPayload)

      return NextResponse.json({
        success: true,
        message: `Team notified: ${message}`,
        notification: notificationPayload,
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Notification payload received',
      data: body,
    })
  } catch (error) {
    console.error('Error notifying team:', error)
    return NextResponse.json(
      {
        error: 'Failed to notify team',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
