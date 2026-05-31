import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface DismissRequest {
  notificationId?: string
  type?: 'notification' | 'achievement' | 'document'
}

/**
 * POST /api/badges/dismiss
 * Marks a notification as read or dismisses an achievement
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as { id?: string } | undefined

    if (!session || !user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id

    let body: DismissRequest
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    // ── Mark notification as read ───────────────────────────────────────
    if (body.notificationId) {
      try {
        await sql`
          UPDATE notifications
          SET read = true
          WHERE id = ${body.notificationId} AND user_id = ${userId}
        `

        return NextResponse.json({
          ok: true,
          message: 'Notification marked as read',
        })
      } catch (error) {
        console.error('Error marking notification as read:', error)
        return NextResponse.json(
          { error: 'Failed to dismiss notification' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      { error: 'No valid dismiss action provided' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error in dismiss endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
