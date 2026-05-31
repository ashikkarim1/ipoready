/**
 * Slack Service
 * Core service for sending Slack messages
 */

import { getSlackConfig } from './slack-config'
import { buildSlackMessage, SlackTemplateId } from './slack-templates'
import { sql } from './db'

const MAX_RETRIES = 3
const RETRY_DELAYS = [1000, 5000, 30000] // 1s, 5s, 30s
const SLACK_API_BASE = 'https://slack.com/api'

export interface SendSlackMessageOptions {
  userId: string
  templateId: SlackTemplateId
  variables: Record<string, any>
  channel?: string // Optional: send to specific channel instead of user
}

interface SlackLog {
  id: string
  user_id: string
  slack_user_id?: string
  channel?: string
  template_id: string
  message_body: string
  status: 'sent' | 'failed' | 'pending'
  slack_ts?: string
  error_message?: string
  sent_at?: string
  created_at: string
}

/**
 * Log Slack message to database
 */
async function logSlackMessageToDB(options: {
  userId: string
  slackUserId?: string
  channel?: string
  templateId: string
  messageBody: string
  status: 'sent' | 'failed' | 'pending'
  slackTs?: string
  errorMessage?: string
}): Promise<void> {
  try {
    await sql`
      INSERT INTO slack_logs (user_id, slack_user_id, channel, template_id, message_body, status, slack_ts, error_message)
      VALUES (
        ${options.userId},
        ${options.slackUserId || null},
        ${options.channel || null},
        ${options.templateId},
        ${options.messageBody},
        ${options.status},
        ${options.slackTs || null},
        ${options.errorMessage || null}
      )
    `
  } catch (err) {
    console.error('[slack-service] Failed to log message to DB:', err)
  }
}

/**
 * Get Slack user ID from database
 */
async function getSlackUserIdForUser(userId: string): Promise<string | null> {
  try {
    const result = await sql`
      SELECT slack_user_id FROM users WHERE id = ${userId} LIMIT 1
    `
    return result.length > 0 ? result[0].slack_user_id : null
  } catch (err) {
    console.error('[slack-service] Failed to get Slack user ID:', err)
    return null
  }
}

/**
 * Send message via Slack API with retry logic
 */
async function sendViaSlackAPI(
  slackUserId: string,
  message: any,
  retryCount = 0
): Promise<{ success: boolean; ts?: string; error?: string }> {
  const config = getSlackConfig()

  if (!config.isConfigured || !config.botToken) {
    console.log('[slack-service] Slack not configured, skipping send')
    return { success: false, error: 'Slack not configured' }
  }

  try {
    const response = await fetch(`${SLACK_API_BASE}/chat.postMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.botToken}`,
      },
      body: JSON.stringify({
        channel: slackUserId,
        blocks: message.blocks,
        text: `Notification from IPOReady: ${message.name}`, // Fallback text
      }),
    })

    const data = await response.json()

    if (!response.ok || !data.ok) {
      const errorMsg = data.error || 'Unknown error'

      // Retry on rate limiting or transient errors
      if ((data.error === 'rate_limited' || data.error === 'internal_error') && retryCount < MAX_RETRIES) {
        const delay = RETRY_DELAYS[retryCount]
        console.log(`[slack-service] Retrying in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`)
        await new Promise((resolve) => setTimeout(resolve, delay))
        return sendViaSlackAPI(slackUserId, message, retryCount + 1)
      }

      console.error('[slack-service] Slack API error:', errorMsg)
      return { success: false, error: errorMsg }
    }

    return {
      success: true,
      ts: data.ts,
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'

    // Retry on network errors
    if (retryCount < MAX_RETRIES) {
      const delay = RETRY_DELAYS[retryCount]
      console.log(`[slack-service] Retrying network error in ${delay}ms`)
      await new Promise((resolve) => setTimeout(resolve, delay))
      return sendViaSlackAPI(slackUserId, message, retryCount + 1)
    }

    console.error('[slack-service] Failed to send Slack message:', errorMsg)
    return { success: false, error: errorMsg }
  }
}

/**
 * Send Slack message to a user via template
 */
export async function sendSlackMessage(
  options: SendSlackMessageOptions
): Promise<{
  success: boolean
  slackTs?: string
  error?: string
}> {
  const { userId, templateId, variables, channel } = options

  try {
    // Build message from template
    const message = buildSlackMessage(templateId, variables)
    if (!message) {
      console.error('[slack-service] Invalid template ID:', templateId)
      return { success: false, error: 'Invalid template ID' }
    }

    // Log message size (Slack limit is ~3000 chars)
    const messageSize = JSON.stringify(message.blocks).length
    if (messageSize > 3000) {
      console.warn(`[slack-service] Message size (${messageSize}) exceeds Slack limit`)
    }

    // Determine target
    let slackUserId: string | undefined = channel
    if (!slackUserId) {
      const userId_slack = await getSlackUserIdForUser(userId)
      slackUserId = userId_slack ?? undefined
      if (!slackUserId) {
        console.log('[slack-service] User has no Slack ID linked, skipping send')
        await logSlackMessageToDB({
          userId,
          templateId,
          messageBody: JSON.stringify(message.blocks),
          status: 'pending',
          errorMessage: 'No Slack ID linked for user',
        })
        return { success: false, error: 'User has no Slack account linked' }
      }
    }

    // Send via API
    const result = await sendViaSlackAPI(slackUserId, message)

    // Log to database
    await logSlackMessageToDB({
      userId,
      slackUserId,
      channel: channel ? slackUserId : undefined,
      templateId,
      messageBody: JSON.stringify(message.blocks),
      status: result.success ? 'sent' : 'failed',
      slackTs: result.ts,
      errorMessage: result.error,
    })

    if (!result.success) {
      return { success: false, error: result.error }
    }

    return {
      success: true,
      slackTs: result.ts,
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[slack-service] Unexpected error:', errorMsg)

    await logSlackMessageToDB({
      userId,
      templateId,
      messageBody: '',
      status: 'failed',
      errorMessage: errorMsg,
    })

    return { success: false, error: errorMsg }
  }
}

/**
 * Send message to multiple users
 */
export async function sendSlackMessageBatch(
  userIds: string[],
  templateId: SlackTemplateId,
  variables: Record<string, any>
): Promise<{
  sent: number
  failed: number
  errors: string[]
}> {
  const results = {
    sent: 0,
    failed: 0,
    errors: [] as string[],
  }

  for (const userId of userIds) {
    const result = await sendSlackMessage({
      userId,
      templateId,
      variables,
    })

    if (result.success) {
      results.sent++
    } else {
      results.failed++
      if (result.error) {
        results.errors.push(`${userId}: ${result.error}`)
      }
    }
  }

  return results
}

/**
 * Send message to a Slack channel directly
 */
export async function sendSlackChannelMessage(
  channelId: string,
  templateId: SlackTemplateId,
  variables: Record<string, any>
): Promise<{
  success: boolean
  slackTs?: string
  error?: string
}> {
  const config = getSlackConfig()

  if (!config.isConfigured || !config.botToken) {
    console.log('[slack-service] Slack not configured')
    return { success: false, error: 'Slack not configured' }
  }

  try {
    const message = buildSlackMessage(templateId, variables)
    if (!message) {
      return { success: false, error: 'Invalid template ID' }
    }

    const response = await fetch(`${SLACK_API_BASE}/chat.postMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.botToken}`,
      },
      body: JSON.stringify({
        channel: channelId,
        blocks: message.blocks,
        text: `Notification from IPOReady: ${message.name}`,
      }),
    })

    const data = await response.json()

    if (!response.ok || !data.ok) {
      return { success: false, error: data.error }
    }

    return {
      success: true,
      slackTs: data.ts,
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[slack-service] Failed to send channel message:', errorMsg)
    return { success: false, error: errorMsg }
  }
}

/**
 * Get Slack service status
 */
export async function getSlackServiceStatus(): Promise<{
  configured: boolean
  healthy: boolean
  info?: string
}> {
  const config = getSlackConfig()

  if (!config.isConfigured) {
    return {
      configured: false,
      healthy: false,
      info: 'Slack not configured',
    }
  }

  try {
    // Test API connectivity
    const response = await fetch(`${SLACK_API_BASE}/auth.test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.botToken}`,
      },
    })

    const data = await response.json()

    return {
      configured: true,
      healthy: data.ok === true,
      info: data.ok ? 'Connected' : data.error || 'Unknown error',
    }
  } catch (err) {
    return {
      configured: true,
      healthy: false,
      info: 'Failed to connect to Slack API',
    }
  }
}
