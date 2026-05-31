/**
 * Digest Time API Endpoint
 * POST: Set digest time and timezone for user
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { updateNotificationSettings } from '@/lib/preferences'
import { isValidTimezone } from '@/lib/time-utils'

export const dynamic = 'force-dynamic'

interface SetDigestTimeRequest {
  digestTime: string // HH:mm format
  digestTimezone: string // IANA timezone
}

/**
 * POST /api/notifications/digest-time
 * Update user's digest time and timezone
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string } | undefined

  if (!session || !user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: SetDigestTimeRequest
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Validate digestTime format (HH:mm)
  if (!body.digestTime || !/^\d{2}:\d{2}$/.test(body.digestTime)) {
    return NextResponse.json(
      { error: 'Invalid digestTime format. Use HH:mm' },
      { status: 400 }
    )
  }

  // Validate timezone
  if (!body.digestTimezone || !isValidTimezone(body.digestTimezone)) {
    return NextResponse.json(
      { error: 'Invalid timezone' },
      { status: 400 }
    )
  }

  try {
    const updatedSettings = await updateNotificationSettings(user.id, {
      digestTime: body.digestTime,
      digestTimezone: body.digestTimezone,
    })

    return NextResponse.json({
      ok: true,
      settings: updatedSettings,
    })
  } catch (error) {
    console.error('Error updating digest time:', error)
    return NextResponse.json(
      { error: 'Failed to update digest time' },
      { status: 500 }
    )
  }
}
