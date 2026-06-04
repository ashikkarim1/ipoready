import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

const SLACK_CLIENT_ID = process.env.SLACK_CLIENT_ID || ''
const SLACK_CLIENT_SECRET = process.env.SLACK_CLIENT_SECRET || ''
const SLACK_REDIRECT_URI = `${process.env.NEXTAUTH_URL}/api/integrations/slack/callback`

interface SlackTokenResponse {
  ok: boolean
  access_token?: string
  team?: {
    id: string
    name: string
  }
  authed_user?: {
    id: string
  }
  error?: string
}

interface SlackWorkspaceInfo {
  team_id: string
  team_name: string
  user_id: string
  incoming_webhook?: {
    channel: string
    channel_id: string
    url: string
  }
}

/**
 * GET /api/integrations/slack
 * Initiate Slack OAuth flow - returns the OAuth authorization URL
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const companyId = (session?.user as any)?.companyId

    if (!session || !companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate Slack config
    if (!SLACK_CLIENT_ID || !SLACK_CLIENT_SECRET) {
      return NextResponse.json(
        { error: 'Slack integration not configured' },
        { status: 500 }
      )
    }

    // Generate state for CSRF protection
    const state = generateRandomString(32)

    // Slack OAuth scopes for notification capabilities
    const scopes = [
      'chat:write',           // Post messages
      'chat:write.public',    // Post to public channels
      'channels:read',        // List channels
      'users:read',           // Read user info
      'team:read',            // Read workspace info
      'incoming-webhook',     // For webhook-based notifications
    ]

    const authUrl = new URL('https://slack.com/oauth/v2/authorize')
    authUrl.searchParams.set('client_id', SLACK_CLIENT_ID)
    authUrl.searchParams.set('scope', scopes.join(','))
    authUrl.searchParams.set('redirect_uri', SLACK_REDIRECT_URI)
    authUrl.searchParams.set('state', state)

    return NextResponse.json(
      { authUrl: authUrl.toString(), state },
      { headers: { 'Cache-Control': 'private, no-store' } }
    )
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: `Failed to initiate Slack OAuth: ${msg}` },
      { status: 500 }
    )
  }
}

/**
 * POST /api/integrations/slack/callback
 * Handle Slack OAuth callback - exchanges code for access token
 * Request: { code: string, state: string }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const companyId = (session?.user as any)?.companyId

    if (!session || !companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { code } = body

    if (!code) {
      return NextResponse.json(
        { error: 'Missing authorization code' },
        { status: 400 }
      )
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: SLACK_CLIENT_ID,
        client_secret: SLACK_CLIENT_SECRET,
        code,
        redirect_uri: SLACK_REDIRECT_URI,
      }).toString(),
    })

    const tokenData = (await tokenResponse.json()) as SlackTokenResponse

    if (!tokenData.ok) {
      return NextResponse.json(
        { error: `Slack OAuth failed: ${tokenData.error}` },
        { status: 400 }
      )
    }

    const accessToken = tokenData.access_token
    const teamId = tokenData.team?.id
    const teamName = tokenData.team?.name
    const userId = tokenData.authed_user?.id

    if (!accessToken || !teamId || !teamName) {
      return NextResponse.json(
        { error: 'Missing required Slack OAuth data' },
        { status: 400 }
      )
    }

    // Store integration credentials in database
    const metadata: SlackWorkspaceInfo = {
      team_id: teamId,
      team_name: teamName,
      user_id: userId || '',
    }

    await sql`
      INSERT INTO company_integrations (company_id, integration_id, status, metadata, connected_at)
      VALUES (
        ${companyId},
        'slack',
        'connected',
        ${metadata},
        NOW()
      )
      ON CONFLICT (company_id, integration_id) DO UPDATE SET
        status = 'connected',
        metadata = EXCLUDED.metadata,
        connected_at = NOW()
    `

    return NextResponse.json(
      {
        success: true,
        message: 'Slack integration connected',
        workspace: {
          id: teamId,
          name: teamName,
        },
      },
      { headers: { 'Cache-Control': 'private, no-store' } }
    )
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: `Failed to complete Slack OAuth: ${msg}` },
      { status: 500 }
    )
  }
}

/**
 * GET /api/integrations/slack/channels
 * Fetch list of available Slack channels for the connected workspace
 */
export async function GET_channels(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const companyId = (session?.user as any)?.companyId

    if (!session || !companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get stored Slack token
    const integration = await sql`
      SELECT metadata FROM company_integrations
      WHERE company_id = ${companyId} AND integration_id = 'slack'
      LIMIT 1
    ` as Array<{ metadata: SlackWorkspaceInfo }>

    if (integration.length === 0) {
      return NextResponse.json(
        { error: 'Slack integration not connected' },
        { status: 400 }
      )
    }

    // This endpoint would fetch channels from Slack API
    // For now, return placeholder
    return NextResponse.json(
      {
        channels: [
          { id: 'C12345', name: 'general', is_member: true },
          { id: 'C23456', name: 'ipo-readiness', is_member: true },
        ],
      },
      { headers: { 'Cache-Control': 'private, max-age=300' } }
    )
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: `Failed to fetch Slack channels: ${msg}` },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/integrations/slack/preferences
 * Update Slack notification preferences
 * Request: {
 *   channel_id: string,
 *   notification_types: { filings: boolean, milestones: boolean, tasks: boolean, comments: boolean },
 *   mention_preference: 'channel' | 'direct' | 'none',
 *   quiet_hours?: { start: string, end: string } (24-hour format)
 * }
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const companyId = (session?.user as any)?.companyId

    if (!session || !companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      channel_id,
      notification_types = {},
      mention_preference = 'channel',
      quiet_hours = null,
    } = body

    if (!channel_id) {
      return NextResponse.json(
        { error: 'Missing channel_id' },
        { status: 400 }
      )
    }

    // Get existing integration and update with new preferences
    const integration = await sql`
      SELECT metadata FROM company_integrations
      WHERE company_id = ${companyId} AND integration_id = 'slack'
      LIMIT 1
    ` as Array<{ metadata: Record<string, any> }>

    if (integration.length === 0) {
      return NextResponse.json(
        { error: 'Slack integration not connected' },
        { status: 400 }
      )
    }

    const metadata = integration[0].metadata
    const updatedMetadata = {
      ...metadata,
      preferences: {
        channel_id,
        notification_types: {
          filings: notification_types.filings ?? true,
          milestones: notification_types.milestones ?? true,
          tasks: notification_types.tasks ?? true,
          comments: notification_types.comments ?? true,
        },
        mention_preference,
        quiet_hours,
      },
    }

    await sql`
      UPDATE company_integrations
      SET metadata = ${updatedMetadata}, updated_at = NOW()
      WHERE company_id = ${companyId} AND integration_id = 'slack'
    `

    return NextResponse.json(
      {
        success: true,
        message: 'Slack preferences updated',
        preferences: updatedMetadata.preferences,
      },
      { headers: { 'Cache-Control': 'private, no-store' } }
    )
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: `Failed to update Slack preferences: ${msg}` },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/integrations/slack
 * Disconnect Slack integration
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const companyId = (session?.user as any)?.companyId

    if (!session || !companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await sql`
      DELETE FROM company_integrations
      WHERE company_id = ${companyId} AND integration_id = 'slack'
    `

    return NextResponse.json(
      { success: true, message: 'Slack integration disconnected' },
      { headers: { 'Cache-Control': 'private, no-store' } }
    )
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: `Failed to disconnect Slack: ${msg}` },
      { status: 500 }
    )
  }
}

function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
