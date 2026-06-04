/**
 * Slack Notification Preferences API
 * Manage notification preferences for Slack integration
 * GET /api/integrations/slack/preferences - Get preferences
 * POST /api/integrations/slack/preferences - Update preferences
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getSlackPreferences,
  updateSlackPreferences,
  getSlackConnection,
  listSlackChannels,
} from '@/lib/integrations/slack'

export const runtime = 'nodejs'

/**
 * GET - Retrieve notification preferences
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as { id?: string; companyId?: string } | undefined

    if (!session || !user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const companyId = user.companyId

    // Get preferences
    const preferencesResult = await getSlackPreferences(companyId)

    if (!preferencesResult.success) {
      return NextResponse.json(
        { error: preferencesResult.error || 'Failed to retrieve preferences' },
        { status: 400 }
      )
    }

    // Get available channels
    const connection = await getSlackConnection(companyId)
    let availableChannels: Array<{ id: string; name: string; is_member: boolean }> = []

    if (connection && connection.is_active) {
      const channelsResult = await listSlackChannels(connection.bot_token)
      if (channelsResult.success && channelsResult.channels) {
        availableChannels = channelsResult.channels
      }
    }

    return NextResponse.json({
      preferences: preferencesResult.preferences,
      connection: {
        connected: connection?.is_active || false,
        workspace: connection?.workspace_name || null,
        channelIds: connection?.channel_ids || [],
      },
      availableChannels,
    })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[slack preferences] GET error:', errorMsg)
    return NextResponse.json(
      { error: 'Failed to get preferences' },
      { status: 500 }
    )
  }
}

/**
 * POST - Update notification preferences
 * Body: {
 *   notifyOnFilingSubmitted?: boolean,
 *   notifyOnPaceMilestone?: boolean,
 *   notifyOnTaskAssigned?: boolean,
 *   notifyOnDocumentUpload?: boolean,
 *   notifyOnComplianceDeadline?: boolean,
 *   notificationChannel?: string,
 *   quietHoursStart?: string (HH:MM format),
 *   quietHoursEnd?: string (HH:MM format)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as { id?: string; companyId?: string } | undefined

    if (!session || !user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const companyId = user.companyId
    const body = await request.json()

    // Validate quiet hours format if provided
    if (body.quietHoursStart || body.quietHoursEnd) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/

      if (body.quietHoursStart && !timeRegex.test(body.quietHoursStart)) {
        return NextResponse.json(
          { error: 'Invalid quietHoursStart format (use HH:MM)' },
          { status: 400 }
        )
      }

      if (body.quietHoursEnd && !timeRegex.test(body.quietHoursEnd)) {
        return NextResponse.json(
          { error: 'Invalid quietHoursEnd format (use HH:MM)' },
          { status: 400 }
        )
      }
    }

    // Validate notification types are booleans
    const booleanFields = [
      'notifyOnFilingSubmitted',
      'notifyOnPaceMilestone',
      'notifyOnTaskAssigned',
      'notifyOnDocumentUpload',
      'notifyOnComplianceDeadline',
    ]

    for (const field of booleanFields) {
      if (body[field] !== undefined && typeof body[field] !== 'boolean') {
        return NextResponse.json(
          { error: `${field} must be a boolean` },
          { status: 400 }
        )
      }
    }

    // Update preferences
    const result = await updateSlackPreferences(companyId, body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to update preferences' },
        { status: 400 }
      )
    }

    // Retrieve updated preferences
    const preferencesResult = await getSlackPreferences(companyId)

    return NextResponse.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: preferencesResult.preferences,
    })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[slack preferences] POST error:', errorMsg)
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    )
  }
}
