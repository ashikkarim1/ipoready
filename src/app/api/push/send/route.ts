import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import { sendPushToUser } from '@/lib/push-sender'

export const dynamic = 'force-dynamic'

interface SendPushRequest {
  userId: string
  title: string
  body: string
  url?: string
  action?: string
}

/**
 * Send a push notification to a specific user
 * This is an internal/admin endpoint
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; role?: string } | undefined

  if (!session || !user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Only system admins can send push notifications
  if (user.role !== 'system_admin') {
    return NextResponse.json(
      { error: 'Forbidden - admin access required' },
      { status: 403 }
    )
  }

  try {
    const body = (await req.json()) as SendPushRequest

    if (!body.userId || !body.title || !body.body) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, title, body' },
        { status: 400 }
      )
    }

    // Send the push notification
    const result = await sendPushToUser(body.userId, {
      title: body.title,
      body: body.body,
      url: body.url,
      action: body.action,
    })

    return NextResponse.json({
      success: true,
      message: `Push notification sent to ${result.sentCount} subscription(s)`,
      sentCount: result.sentCount,
      failedCount: result.failedCount,
    })
  } catch (error) {
    console.error('Error sending push notification:', error)
    return NextResponse.json(
      { error: 'Failed to send push notification' },
      { status: 500 }
    )
  }
}
