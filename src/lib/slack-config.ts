/**
 * Slack App Configuration
 * Centralizes all Slack credentials and configuration
 */

export interface SlackConfig {
  botToken: string | null
  signingSecret: string | null
  appId: string | null
  workspaceId: string | null
  isConfigured: boolean
}

/**
 * Get Slack configuration from environment variables
 */
export function getSlackConfig(): SlackConfig {
  const botToken = process.env.SLACK_BOT_TOKEN || null
  const signingSecret = process.env.SLACK_SIGNING_SECRET || null
  const appId = process.env.SLACK_APP_ID || null
  const workspaceId = process.env.SLACK_WORKSPACE_ID || null

  const isConfigured =
    !!botToken &&
    !!signingSecret &&
    !!appId &&
    !botToken.startsWith('xoxb_your') &&
    !signingSecret.startsWith('your_signing')

  return {
    botToken,
    signingSecret,
    appId,
    workspaceId,
    isConfigured,
  }
}

/**
 * Validate Slack configuration
 */
export function validateSlackConfig(config: SlackConfig): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!config.botToken) {
    errors.push('SLACK_BOT_TOKEN is not set')
  } else if (!config.botToken.startsWith('xoxb-')) {
    errors.push('SLACK_BOT_TOKEN format is invalid (should start with xoxb-)')
  }

  if (!config.signingSecret) {
    errors.push('SLACK_SIGNING_SECRET is not set')
  }

  if (!config.appId) {
    errors.push('SLACK_APP_ID is not set')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Get configuration status for monitoring
 */
export function getSlackConfigStatus(): {
  configured: boolean
  hasBotToken: boolean
  hasSigningSecret: boolean
  hasAppId: boolean
  hasWorkspaceId: boolean
} {
  const config = getSlackConfig()

  return {
    configured: config.isConfigured,
    hasBotToken: !!config.botToken,
    hasSigningSecret: !!config.signingSecret,
    hasAppId: !!config.appId,
    hasWorkspaceId: !!config.workspaceId,
  }
}
