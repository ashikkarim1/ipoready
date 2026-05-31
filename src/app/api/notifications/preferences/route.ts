/**
 * Notification Preferences API - GET and POST endpoints
 * GET: Fetch all user's notification preferences
 * POST: Bulk update preferences
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getUserPreferences,
  getUserNotificationSettings,
  updatePreferences,
  updateNotificationSettings,
} from '@/lib/preferences'
import {
  NotificationType,
  NotificationFrequency,
  PreferenceConfig,
  NotificationSettings,
} from '@/lib/notification-types'

export const dynamic = 'force-dynamic'

interface GetPreferencesResponse {
  preferences: Record<string, PreferenceConfig>
  settings: NotificationSettings
}

interface UpdatePreferencesRequest {
  preferences?: Array<{
    notificationType: NotificationType
    emailEnabled: boolean
    smsEnabled: boolean
    pushEnabled: boolean
    whatsappEnabled: boolean
    frequency: NotificationFrequency
    quietHoursStart?: string
    quietHoursEnd?: string
    quietHoursTimezone?: string
  }>
  settings?: {
    digestTime?: string
    digestTimezone?: string
    doNotDisturbStart?: string
    doNotDisturbEnd?: string
    doNotDisturbTimezone?: string
  }
}

/**
 * GET /api/notifications/preferences
 * Fetch all user's notification preferences and settings
 */
export async function GET(_req: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string } | undefined

  if (!session || !user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const preferences = await getUserPreferences(user.id)
    const settings = await getUserNotificationSettings(user.id)

    // Convert Map to object for JSON serialization
    const preferencesObj: Record<string, PreferenceConfig> = {}
    for (const [key, value] of preferences.entries()) {
      preferencesObj[key] = value
    }

    const response: GetPreferencesResponse = {
      preferences: preferencesObj,
      settings,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching preferences:', error)
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/notifications/preferences
 * Bulk update preferences and/or settings
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string } | undefined

  if (!session || !user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: UpdatePreferencesRequest
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  try {
    // Update preferences if provided
    if (body.preferences && Array.isArray(body.preferences) && body.preferences.length > 0) {
      const configs: Array<[NotificationType, Omit<PreferenceConfig, 'notificationType' | 'updatedAt'>]> = body.preferences.map(p => [
        p.notificationType,
        {
          emailEnabled: p.emailEnabled,
          smsEnabled: p.smsEnabled,
          pushEnabled: p.pushEnabled,
          whatsappEnabled: p.whatsappEnabled,
          frequency: p.frequency,
          quietHoursStart: p.quietHoursStart,
          quietHoursEnd: p.quietHoursEnd,
          quietHoursTimezone: p.quietHoursTimezone,
        },
      ])
      await updatePreferences(user.id, configs)
    }

    // Update settings if provided
    let updatedSettings = await getUserNotificationSettings(user.id)
    if (body.settings) {
      updatedSettings = await updateNotificationSettings(user.id, body.settings)
    }

    return NextResponse.json({
      ok: true,
      settings: updatedSettings,
    })
  } catch (error) {
    console.error('Error updating preferences:', error)
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    )
  }
}
