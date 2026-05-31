/**
 * Notification Preferences API - Single Type Endpoint
 * GET: Fetch preference for specific notification type
 * PUT: Update preference for specific notification type
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserPreferences, updatePreference } from '@/lib/preferences'
import {
  NotificationType,
  NotificationFrequency,
  PreferenceConfig,
} from '@/lib/notification-types'

export const dynamic = 'force-dynamic'

interface UpdateSinglePreferenceRequest {
  emailEnabled?: boolean
  smsEnabled?: boolean
  pushEnabled?: boolean
  whatsappEnabled?: boolean
  frequency?: NotificationFrequency
  quietHoursStart?: string
  quietHoursEnd?: string
  quietHoursTimezone?: string
}

/**
 * GET /api/notifications/preferences/[type]
 * Fetch preference for a specific notification type
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { type: string } }
): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string } | undefined

  if (!session || !user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Validate notification type
  if (!Object.values(NotificationType).includes(params.type as NotificationType)) {
    return NextResponse.json(
      { error: 'Invalid notification type' },
      { status: 400 }
    )
  }

  try {
    const preferences = await getUserPreferences(user.id)
    const preference = preferences.get(params.type as NotificationType)

    if (!preference) {
      return NextResponse.json(
        { error: 'Preference not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(preference)
  } catch (error) {
    console.error('Error fetching preference:', error)
    return NextResponse.json(
      { error: 'Failed to fetch preference' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/notifications/preferences/[type]
 * Update preference for a specific notification type
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { type: string } }
): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string } | undefined

  if (!session || !user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Validate notification type
  if (!Object.values(NotificationType).includes(params.type as NotificationType)) {
    return NextResponse.json(
      { error: 'Invalid notification type' },
      { status: 400 }
    )
  }

  let body: UpdateSinglePreferenceRequest
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  try {
    // Get current preference
    const preferences = await getUserPreferences(user.id)
    const current = preferences.get(params.type as NotificationType)

    if (!current) {
      return NextResponse.json(
        { error: 'Preference not found' },
        { status: 404 }
      )
    }

    // Merge with updates
    const updated = {
      emailEnabled: body.emailEnabled ?? current.emailEnabled,
      smsEnabled: body.smsEnabled ?? current.smsEnabled,
      pushEnabled: body.pushEnabled ?? current.pushEnabled,
      whatsappEnabled: body.whatsappEnabled ?? current.whatsappEnabled,
      frequency: body.frequency ?? current.frequency,
      quietHoursStart: body.quietHoursStart ?? current.quietHoursStart,
      quietHoursEnd: body.quietHoursEnd ?? current.quietHoursEnd,
      quietHoursTimezone: body.quietHoursTimezone ?? current.quietHoursTimezone,
    }

    // Update in database
    await updatePreference(user.id, params.type as NotificationType, updated)

    // Return updated preference
    const response: PreferenceConfig = {
      notificationType: params.type as NotificationType,
      ...updated,
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating preference:', error)
    return NextResponse.json(
      { error: 'Failed to update preference' },
      { status: 500 }
    )
  }
}
