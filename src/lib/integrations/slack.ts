/**
 * Slack Integration - OAuth2 & Bot Authentication
 * Complete backend implementation for Slack integration
 * Handles OAuth flow, command handlers, event subscriptions
 */

import crypto from 'crypto'
import { sql } from '@/lib/db'

const SLACK_API_BASE = 'https://slack.com/api'

/**
 * Slack OAuth Configuration
 */
export interface SlackOAuthConfig {
  clientId: string
  clientSecret: string
  signingSecret: string
  redirectUri: string
}

/**
 * Get Slack OAuth configuration from environment
 */
export function getSlackOAuthConfig(): SlackOAuthConfig {
  const clientId = process.env.SLACK_CLIENT_ID || ''
  const clientSecret = process.env.SLACK_CLIENT_SECRET || ''
  const signingSecret = process.env.SLACK_SIGNING_SECRET || ''
  const redirectUri = process.env.SLACK_REDIRECT_URI || ''

  return {
    clientId,
    clientSecret,
    signingSecret,
    redirectUri,
  }
}

/**
 * Slack connection stored in database
 */
export interface SlackConnection {
  id: string
  company_id: string
  workspace_id: string
  workspace_name: string
  bot_token: string
  bot_user_id: string
  team_id: string
  app_id: string
  scopes: string[]
  channel_ids: string[] // Array of monitored channel IDs
  webhook_url?: string
  installed_at: string
  expires_at?: string
  last_verified_at: string
  is_active: boolean
}

/**
 * Slack User Connection (links IPOReady user to Slack user)
 */
export interface SlackUserConnection {
  id: string
  user_id: string
  slack_user_id: string
  slack_workspace_id: string
  linked_at: string
  is_active: boolean
}

/**
 * Slack Command Handler
 */
export interface SlackCommandHandler {
  (payload: SlackSlashCommandPayload): Promise<{
    response_type?: 'in_channel' | 'ephemeral'
    text?: string
    blocks?: any[]
    error?: string
  }>
}

/**
 * Slack slash command payload
 */
export interface SlackSlashCommandPayload {
  token: string
  team_id: string
  team_domain: string
  channel_id: string
  channel_name: string
  user_id: string
  command: string
  text: string
  api_app_id: string
  response_url: string
  trigger_id: string
}

/**
 * Slack event payload
 */
export interface SlackEventPayload {
  token: string
  team_id: string
  api_app_id: string
  event: {
    type: string
    user?: string
    channel?: string
    text?: string
    ts?: string
    [key: string]: any
  }
  type: string
  event_id: string
  event_time: number
}

/**
 * Verify Slack request authenticity using signing secret
 */
export function verifySlackRequest(
  signingSecret: string,
  body: string | Buffer,
  timestamp: string,
  signature: string
): boolean {
  // Check timestamp to prevent replay attacks (max 5 minutes old)
  const currentTime = Math.floor(Date.now() / 1000)
  const timestampInt = parseInt(timestamp, 10)

  if (currentTime - timestampInt > 300) {
    console.warn('[slack.ts] Request timestamp too old')
    return false
  }

  // Verify signature
  const baseString = `v0:${timestamp}:${body}`
  const hmac = crypto
    .createHmac('sha256', signingSecret)
    .update(baseString)
    .digest('hex')
  const expectedSignature = `v0=${hmac}`

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

/**
 * Exchange OAuth code for bot token
 */
export async function exchangeOAuthCode(
  code: string,
  config: SlackOAuthConfig
): Promise<{
  success: boolean
  botToken?: string
  workspaceId?: string
  workspaceName?: string
  botUserId?: string
  teamId?: string
  appId?: string
  scopes?: string[]
  error?: string
}> {
  try {
    const response = await fetch(`${SLACK_API_BASE}/oauth.v2.access`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: config.redirectUri,
      }).toString(),
    })

    const data = await response.json()

    if (!data.ok) {
      console.error('[slack.ts] OAuth error:', data.error)
      return {
        success: false,
        error: data.error || 'OAuth exchange failed',
      }
    }

    return {
      success: true,
      botToken: data.bot_access_token,
      workspaceId: data.workspace_id,
      workspaceName: data.workspace_name,
      botUserId: data.bot_user_id,
      teamId: data.team_id,
      appId: data.app_id,
      scopes: data.scope ? data.scope.split(',') : [],
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[slack.ts] OAuth exchange error:', errorMsg)
    return {
      success: false,
      error: errorMsg,
    }
  }
}

/**
 * Store Slack connection in database
 */
export async function storeSlackConnection(
  companyId: string,
  oauthData: {
    botToken: string
    workspaceId: string
    workspaceName: string
    botUserId: string
    teamId: string
    appId: string
    scopes: string[]
  }
): Promise<{
  success: boolean
  connectionId?: string
  error?: string
}> {
  try {
    const result = await sql`
      INSERT INTO slack_connections (
        company_id,
        workspace_id,
        workspace_name,
        bot_token,
        bot_user_id,
        team_id,
        app_id,
        scopes,
        installed_at,
        last_verified_at,
        is_active
      ) VALUES (
        ${companyId},
        ${oauthData.workspaceId},
        ${oauthData.workspaceName},
        ${oauthData.botToken},
        ${oauthData.botUserId},
        ${oauthData.teamId},
        ${oauthData.appId},
        ${JSON.stringify(oauthData.scopes)},
        NOW(),
        NOW(),
        true
      )
      ON CONFLICT (company_id, team_id) DO UPDATE SET
        bot_token = ${oauthData.botToken},
        bot_user_id = ${oauthData.botUserId},
        scopes = ${JSON.stringify(oauthData.scopes)},
        last_verified_at = NOW(),
        is_active = true
      RETURNING id
    `

    const connectionId = result[0].id as string

    return {
      success: true,
      connectionId,
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[slack.ts] Failed to store connection:', errorMsg)
    return {
      success: false,
      error: errorMsg,
    }
  }
}

/**
 * Get Slack connection for a company
 */
export async function getSlackConnection(
  companyId: string
): Promise<SlackConnection | null> {
  try {
    const result = await sql`
      SELECT * FROM slack_connections
      WHERE company_id = ${companyId}
      AND is_active = true
      ORDER BY installed_at DESC
      LIMIT 1
    `

    if (result.length === 0) {
      return null
    }

    const row = result[0] as any
    return {
      id: row.id,
      company_id: row.company_id,
      workspace_id: row.workspace_id,
      workspace_name: row.workspace_name,
      bot_token: row.bot_token,
      bot_user_id: row.bot_user_id,
      team_id: row.team_id,
      app_id: row.app_id,
      scopes: JSON.parse(row.scopes || '[]'),
      channel_ids: JSON.parse(row.channel_ids || '[]'),
      webhook_url: row.webhook_url,
      installed_at: row.installed_at,
      expires_at: row.expires_at,
      last_verified_at: row.last_verified_at,
      is_active: row.is_active,
    }
  } catch (err) {
    console.error('[slack.ts] Failed to get connection:', err)
    return null
  }
}

/**
 * Link IPOReady user to Slack user
 */
export async function linkSlackUser(
  userId: string,
  slackUserId: string,
  workspaceId: string
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    await sql`
      INSERT INTO slack_user_connections (
        user_id,
        slack_user_id,
        slack_workspace_id,
        linked_at,
        is_active
      ) VALUES (
        ${userId},
        ${slackUserId},
        ${workspaceId},
        NOW(),
        true
      )
      ON CONFLICT (user_id, slack_workspace_id) DO UPDATE SET
        slack_user_id = ${slackUserId},
        linked_at = NOW(),
        is_active = true
    `

    return { success: true }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[slack.ts] Failed to link user:', errorMsg)
    return {
      success: false,
      error: errorMsg,
    }
  }
}

/**
 * Get Slack user for an IPOReady user
 */
export async function getSlackUserForUser(
  userId: string,
  workspaceId?: string
): Promise<SlackUserConnection | null> {
  try {
    const query = workspaceId
      ? `SELECT * FROM slack_user_connections WHERE user_id = ${userId} AND slack_workspace_id = ${workspaceId} AND is_active = true LIMIT 1`
      : `SELECT * FROM slack_user_connections WHERE user_id = ${userId} AND is_active = true LIMIT 1`

    const result = await sql(query)

    if (result.length === 0) {
      return null
    }

    const row = result[0] as any
    return {
      id: row.id,
      user_id: row.user_id,
      slack_user_id: row.slack_user_id,
      slack_workspace_id: row.slack_workspace_id,
      linked_at: row.linked_at,
      is_active: row.is_active,
    }
  } catch (err) {
    console.error('[slack.ts] Failed to get Slack user:', err)
    return null
  }
}

/**
 * Send message to Slack user via bot token
 */
export async function sendSlackUserMessage(
  botToken: string,
  slackUserId: string,
  message: {
    blocks?: any[]
    text: string
  }
): Promise<{
  success: boolean
  ts?: string
  error?: string
}> {
  try {
    const response = await fetch(`${SLACK_API_BASE}/chat.postMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${botToken}`,
      },
      body: JSON.stringify({
        channel: slackUserId,
        text: message.text,
        blocks: message.blocks,
      }),
    })

    const data = await response.json()

    if (!data.ok) {
      console.error('[slack.ts] Failed to send message:', data.error)
      return {
        success: false,
        error: data.error || 'Failed to send message',
      }
    }

    return {
      success: true,
      ts: data.ts,
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[slack.ts] Error sending message:', errorMsg)
    return {
      success: false,
      error: errorMsg,
    }
  }
}

/**
 * Send message to Slack channel via bot token
 */
export async function sendSlackChannelMessage(
  botToken: string,
  channelId: string,
  message: {
    blocks?: any[]
    text: string
    thread_ts?: string
  }
): Promise<{
  success: boolean
  ts?: string
  error?: string
}> {
  try {
    const response = await fetch(`${SLACK_API_BASE}/chat.postMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${botToken}`,
      },
      body: JSON.stringify({
        channel: channelId,
        text: message.text,
        blocks: message.blocks,
        thread_ts: message.thread_ts,
      }),
    })

    const data = await response.json()

    if (!data.ok) {
      console.error('[slack.ts] Failed to send channel message:', data.error)
      return {
        success: false,
        error: data.error || 'Failed to send message',
      }
    }

    return {
      success: true,
      ts: data.ts,
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[slack.ts] Error sending channel message:', errorMsg)
    return {
      success: false,
      error: errorMsg,
    }
  }
}

/**
 * Get user info from Slack
 */
export async function getSlackUserInfo(
  botToken: string,
  userId: string
): Promise<{
  success: boolean
  user?: {
    id: string
    name: string
    real_name: string
    email?: string
  }
  error?: string
}> {
  try {
    const response = await fetch(`${SLACK_API_BASE}/users.info?user=${userId}`, {
      headers: {
        Authorization: `Bearer ${botToken}`,
      },
    })

    const data = await response.json()

    if (!data.ok) {
      return {
        success: false,
        error: data.error || 'Failed to get user info',
      }
    }

    return {
      success: true,
      user: {
        id: data.user.id,
        name: data.user.name,
        real_name: data.user.real_name,
        email: data.user.profile?.email,
      },
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[slack.ts] Error getting user info:', errorMsg)
    return {
      success: false,
      error: errorMsg,
    }
  }
}

/**
 * Test bot connection
 */
export async function testSlackBotConnection(
  botToken: string
): Promise<{
  success: boolean
  botName?: string
  workspaceId?: string
  error?: string
}> {
  try {
    const response = await fetch(`${SLACK_API_BASE}/auth.test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${botToken}`,
      },
    })

    const data = await response.json()

    if (!data.ok) {
      return {
        success: false,
        error: data.error || 'Connection test failed',
      }
    }

    return {
      success: true,
      botName: data.user_id,
      workspaceId: data.team_id,
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    return {
      success: false,
      error: errorMsg,
    }
  }
}

/**
 * List available Slack channels for workspace
 */
export async function listSlackChannels(
  botToken: string
): Promise<{
  success: boolean
  channels?: Array<{
    id: string
    name: string
    is_member: boolean
  }>
  error?: string
}> {
  try {
    const response = await fetch(`${SLACK_API_BASE}/conversations.list?exclude_archived=true&limit=100`, {
      headers: {
        Authorization: `Bearer ${botToken}`,
      },
    })

    const data = await response.json()

    if (!data.ok) {
      return {
        success: false,
        error: data.error || 'Failed to list channels',
      }
    }

    return {
      success: true,
      channels: (data.channels || []).map((channel: any) => ({
        id: channel.id,
        name: channel.name,
        is_member: channel.is_member,
      })),
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[slack.ts] Error listing channels:', errorMsg)
    return {
      success: false,
      error: errorMsg,
    }
  }
}

/**
 * Update monitored channels for a company
 */
export async function updateMonitoredChannels(
  companyId: string,
  channelIds: string[]
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    await sql`
      UPDATE slack_connections
      SET channel_ids = ${JSON.stringify(channelIds)},
          updated_at = NOW()
      WHERE company_id = ${companyId}
    `

    return { success: true }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[slack.ts] Failed to update channels:', errorMsg)
    return {
      success: false,
      error: errorMsg,
    }
  }
}

/**
 * Log Slack notification sent
 */
export async function logSlackNotificationSent(
  companyId: string,
  data: {
    eventType: string
    recipientType: 'user' | 'channel'
    recipientId: string
    templateId: string
    success: boolean
    slackTs?: string
    error?: string
  }
): Promise<void> {
  try {
    await sql`
      INSERT INTO slack_notifications_sent (
        company_id,
        event_type,
        recipient_type,
        recipient_id,
        template_id,
        success,
        slack_ts,
        error_message,
        sent_at
      ) VALUES (
        ${companyId},
        ${data.eventType},
        ${data.recipientType},
        ${data.recipientId},
        ${data.templateId},
        ${data.success},
        ${data.slackTs || null},
        ${data.error || null},
        NOW()
      )
    `
  } catch (err) {
    console.error('[slack.ts] Failed to log notification:', err)
  }
}

/**
 * Get notification preferences for a company
 */
export async function getSlackPreferences(
  companyId: string
): Promise<{
  success: boolean
  preferences?: {
    notifyOnFilingSubmitted: boolean
    notifyOnPaceMilestone: boolean
    notifyOnTaskAssigned: boolean
    notifyOnDocumentUpload: boolean
    notifyOnComplianceDeadline: boolean
    notificationChannel?: string
    quietHoursStart?: string
    quietHoursEnd?: string
  }
  error?: string
}> {
  try {
    const result = await sql`
      SELECT preferences FROM slack_connections
      WHERE company_id = ${companyId}
      AND is_active = true
      LIMIT 1
    `

    if (result.length === 0) {
      return {
        success: false,
        error: 'No Slack connection found',
      }
    }

    const preferences = (result[0] as any).preferences || {}

    return {
      success: true,
      preferences: {
        notifyOnFilingSubmitted: preferences.notifyOnFilingSubmitted ?? true,
        notifyOnPaceMilestone: preferences.notifyOnPaceMilestone ?? true,
        notifyOnTaskAssigned: preferences.notifyOnTaskAssigned ?? true,
        notifyOnDocumentUpload: preferences.notifyOnDocumentUpload ?? true,
        notifyOnComplianceDeadline: preferences.notifyOnComplianceDeadline ?? true,
        notificationChannel: preferences.notificationChannel,
        quietHoursStart: preferences.quietHoursStart,
        quietHoursEnd: preferences.quietHoursEnd,
      },
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[slack.ts] Failed to get preferences:', errorMsg)
    return {
      success: false,
      error: errorMsg,
    }
  }
}

/**
 * Update Slack notification preferences
 */
export async function updateSlackPreferences(
  companyId: string,
  preferences: {
    notifyOnFilingSubmitted?: boolean
    notifyOnPaceMilestone?: boolean
    notifyOnTaskAssigned?: boolean
    notifyOnDocumentUpload?: boolean
    notifyOnComplianceDeadline?: boolean
    notificationChannel?: string
    quietHoursStart?: string
    quietHoursEnd?: string
  }
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const result = await sql`
      SELECT preferences FROM slack_connections
      WHERE company_id = ${companyId}
      AND is_active = true
      LIMIT 1
    `

    if (result.length === 0) {
      return {
        success: false,
        error: 'No Slack connection found',
      }
    }

    const existingPrefs = (result[0] as any).preferences || {}
    const updatedPreferences = {
      ...existingPrefs,
      ...preferences,
    }

    await sql`
      UPDATE slack_connections
      SET preferences = ${updatedPreferences},
          updated_at = NOW()
      WHERE company_id = ${companyId}
    `

    return { success: true }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[slack.ts] Failed to update preferences:', errorMsg)
    return {
      success: false,
      error: errorMsg,
    }
  }
}

/**
 * Check if notification should be sent based on quiet hours
 */
export function isWithinQuietHours(
  quietHoursStart?: string,
  quietHoursEnd?: string
): boolean {
  if (!quietHoursStart || !quietHoursEnd) {
    return false
  }

  const now = new Date()
  const currentHour = now.getHours()
  const [startHour] = quietHoursStart.split(':').map(Number)
  const [endHour] = quietHoursEnd.split(':').map(Number)

  if (startHour < endHour) {
    return currentHour >= startHour && currentHour < endHour
  } else {
    // Overnight quiet hours
    return currentHour >= startHour || currentHour < endHour
  }
}

/**
 * Handle Slack slash commands
 */
export const slackCommandHandlers: Record<string, SlackCommandHandler> = {
  '/ipo-status': async (payload) => {
    try {
      // Get company from user workspace
      const result = await sql`
        SELECT sc.company_id FROM slack_connections sc
        WHERE sc.team_id = ${payload.team_id}
        AND sc.is_active = true
        LIMIT 1
      `

      if (result.length === 0) {
        return {
          response_type: 'ephemeral',
          text: 'Company not found for this workspace',
        }
      }

      const companyId = (result[0] as any).company_id

      // Get company PACE data
      const companyResult = await sql`
        SELECT
          c.name,
          c.ipo_status,
          p.pace_score,
          p.filing_readiness_pct,
          p.financial_readiness_pct,
          p.governance_readiness_pct,
          p.legal_readiness_pct
        FROM companies c
        LEFT JOIN pace_scores p ON c.id = p.company_id
        WHERE c.id = ${companyId}
        LIMIT 1
      `

      if (companyResult.length === 0) {
        return {
          response_type: 'ephemeral',
          text: 'Company data not found',
        }
      }

      const company = companyResult[0] as any

      return {
        response_type: 'ephemeral',
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: `IPO Status: ${company.name}`,
              emoji: true,
            },
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Status*\n${company.ipo_status || 'Not Set'}`,
              },
              {
                type: 'mrkdwn',
                text: `*PACE Score*\n${company.pace_score || 'N/A'}`,
              },
              {
                type: 'mrkdwn',
                text: `*Filing Ready*\n${company.filing_readiness_pct || 0}%`,
              },
              {
                type: 'mrkdwn',
                text: `*Financial Ready*\n${company.financial_readiness_pct || 0}%`,
              },
              {
                type: 'mrkdwn',
                text: `*Governance Ready*\n${company.governance_readiness_pct || 0}%`,
              },
              {
                type: 'mrkdwn',
                text: `*Legal Ready*\n${company.legal_readiness_pct || 0}%`,
              },
            ],
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'View Dashboard',
                  emoji: true,
                },
                url: 'https://app.ipoready.com/dashboard',
                style: 'primary',
              },
            ],
          },
        ],
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      console.error('[slack.ts] /ipo-status error:', errorMsg)
      return {
        response_type: 'ephemeral',
        text: `Error: ${errorMsg}`,
      }
    }
  },

  '/filing-status': async (payload) => {
    try {
      const result = await sql`
        SELECT sc.company_id FROM slack_connections sc
        WHERE sc.team_id = ${payload.team_id}
        AND sc.is_active = true
        LIMIT 1
      `

      if (result.length === 0) {
        return {
          response_type: 'ephemeral',
          text: 'Company not found',
        }
      }

      const companyId = (result[0] as any).company_id

      // Get recent filings
      const filingResult = await sql`
        SELECT
          id,
          filing_type,
          filing_system,
          status,
          submitted_at,
          document_count
        FROM filings
        WHERE company_id = ${companyId}
        ORDER BY submitted_at DESC
        LIMIT 5
      `

      const filings = filingResult as any[]

      if (filings.length === 0) {
        return {
          response_type: 'ephemeral',
          text: 'No recent filings found',
        }
      }

      const filingBlocks = filings.map((filing) => ({
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*${filing.filing_type}*\n${filing.filing_system.toUpperCase()}`,
          },
          {
            type: 'mrkdwn',
            text: `*Status*\n${filing.status}`,
          },
          {
            type: 'mrkdwn',
            text: `*Submitted*\n${new Date(filing.submitted_at).toLocaleDateString()}`,
          },
          {
            type: 'mrkdwn',
            text: `*Documents*\n${filing.document_count || 0}`,
          },
        ],
      }))

      return {
        response_type: 'ephemeral',
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: 'Recent Filings',
              emoji: true,
            },
          },
          ...filingBlocks,
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'View All Filings',
                  emoji: true,
                },
                url: 'https://app.ipoready.com/dashboard/filings',
                style: 'primary',
              },
            ],
          },
        ],
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      console.error('[slack.ts] /filing-status error:', errorMsg)
      return {
        response_type: 'ephemeral',
        text: `Error: ${errorMsg}`,
      }
    }
  },
}

/**
 * Handle Slack events
 */
export async function handleSlackEvent(
  event: SlackEventPayload,
  companyId: string
): Promise<{
  success: boolean
  processed: boolean
  error?: string
}> {
  try {
    // Store event in database for processing
    await sql`
      INSERT INTO slack_events (
        company_id,
        event_type,
        event_data,
        received_at
      ) VALUES (
        ${companyId},
        ${event.event.type},
        ${JSON.stringify(event)},
        NOW()
      )
    `

    // Handle specific event types
    switch (event.event.type) {
      case 'app_mention':
        // Handle bot mentions
        return { success: true, processed: true }

      case 'message':
        // Handle messages
        return { success: true, processed: true }

      default:
        return { success: true, processed: false }
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[slack.ts] Error handling event:', errorMsg)
    return {
      success: false,
      processed: false,
      error: errorMsg,
    }
  }
}

/**
 * Unlink Slack integration for a company
 */
export async function unlinkSlackIntegration(
  companyId: string
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    await sql`
      UPDATE slack_connections
      SET is_active = false, updated_at = NOW()
      WHERE company_id = ${companyId}
    `

    return { success: true }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[slack.ts] Failed to unlink integration:', errorMsg)
    return {
      success: false,
      error: errorMsg,
    }
  }
}

/**
 * Post message to Slack channel (for prospectus notifications)
 */
export async function postMessage(
  botToken: string,
  options: {
    channel: string
    text: string
    blocks?: any[]
  }
): Promise<{
  success: boolean
  messageTs?: string
  error?: string
}> {
  try {
    const response = await fetch(`${SLACK_API_BASE}/chat.postMessage`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel: options.channel,
        text: options.text,
        blocks: options.blocks,
      }),
    })

    const data = (await response.json()) as any

    if (!data.ok) {
      return {
        success: false,
        error: data.error || 'Failed to post message',
      }
    }

    return {
      success: true,
      messageTs: data.ts,
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[slack.ts] Failed to post message:', errorMsg)
    return {
      success: false,
      error: errorMsg,
    }
  }
}

/**
 * Update Slack message
 */
export async function updateMessage(
  botToken: string,
  options: {
    channel: string
    ts: string
    text: string
    blocks?: any[]
  }
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const response = await fetch(`${SLACK_API_BASE}/chat.update`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel: options.channel,
        ts: options.ts,
        text: options.text,
        blocks: options.blocks,
      }),
    })

    const data = (await response.json()) as any

    if (!data.ok) {
      return {
        success: false,
        error: data.error || 'Failed to update message',
      }
    }

    return { success: true }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[slack.ts] Failed to update message:', errorMsg)
    return {
      success: false,
      error: errorMsg,
    }
  }
}
