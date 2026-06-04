/**
 * DOCUSIGN INTEGRATION BACKEND
 * Complete OAuth2 flow, envelope management, recipient routing, webhooks
 * Integrates with Neon database for template, envelope, and signature tracking
 */

import { sql } from '@/lib/db'

// ============================================================
// TYPES & INTERFACES
// ============================================================

export interface DocuSignOAuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
  tokenType: string
  scope: string[]
}

export interface DocuSignAccount {
  id: string
  companyId: string
  docusignAccountId: string
  accessToken: string
  refreshToken: string
  tokenExpiresAt: Date
  environment: 'demo' | 'production'
  baseUri: string
  isActive: boolean
  oauthStatus: 'authenticated' | 'expired' | 'revoked' | 'pending'
  scopes: string[]
  authenticatedAt: Date
  lastRefreshedAt?: Date
}

export interface CreateEnvelopeParams {
  companyId: string
  templateId: string
  envelopeName: string
  description?: string
  prospectusId?: string
  recipients: Array<{
    email: string
    name: string
    roleName: string
    routingOrder?: number
  }>
  customFields?: Record<string, string>
  expirationDays?: number
}

export interface EnvelopeStatus {
  id: string
  companyId: string
  envelopeId: string
  docusignEnvelopeId: string
  envelopeName: string
  status: 'sent' | 'delivered' | 'signed' | 'completed' | 'declined' | 'voided'
  sentAt?: Date
  completedAt?: Date
  expiresAt?: Date
  recipients: RecipientStatus[]
  completionPercentage: number
  isSignedByAll: boolean
  prospectusId?: string
}

export interface RecipientStatus {
  id: string
  email: string
  name: string
  status: 'sent' | 'delivered' | 'viewed' | 'signed' | 'declined'
  routingOrder: number
  signedAt?: Date
  signedLocation?: string
}

// ============================================================
// OAUTH2 FLOW - Core Functions
// ============================================================

export function generateAuthorizationUrl(
  clientId: string,
  redirectUri: string,
  environment: 'demo' | 'production' = 'demo'
): string {
  const baseUri = environment === 'production'
    ? 'https://account.docusign.com'
    : 'https://account-d.docusign.com'

  const scopes = [
    'signature',
    'impersonation',
    'click.manage',
    'organization_read',
    'user_read',
    'user_write',
    'account_read',
  ]

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scopes.join(' '),
    state: Buffer.from(Math.random().toString()).toString('base64'),
  })

  return `${baseUri}/oauth/auth?${params.toString()}`
}

export async function exchangeOAuthCode(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string,
  environment: 'demo' | 'production' = 'demo'
): Promise<DocuSignOAuthTokens> {
  const baseUri = environment === 'production'
    ? 'https://account.docusign.com'
    : 'https://account-d.docusign.com'

  const tokenUrl = `${baseUri}/oauth/token`

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }).toString(),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OAuth token exchange failed: ${response.status} - ${error}`)
  }

  const data = (await response.json()) as any
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    tokenType: data.token_type,
    scope: data.scope.split(' '),
  }
}

export async function refreshOAuthToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string,
  environment: 'demo' | 'production' = 'demo'
): Promise<DocuSignOAuthTokens> {
  const baseUri = environment === 'production'
    ? 'https://account.docusign.com'
    : 'https://account-d.docusign.com'

  const tokenUrl = `${baseUri}/oauth/token`

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }).toString(),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Token refresh failed: ${response.status} - ${error}`)
  }

  const data = (await response.json()) as any
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refreshToken,
    expiresIn: data.expires_in,
    tokenType: data.token_type,
    scope: data.scope.split(' '),
  }
}

export async function getDocuSignUserInfo(
  accessToken: string,
  environment: 'demo' | 'production' = 'demo'
): Promise<{
  accountId: string
  accountName: string
  organizationName: string
  userId: string
  userEmail: string
  userName: string
}> {
  const baseUri = environment === 'production'
    ? 'https://www.docusign.net'
    : 'https://demo.docusign.net'

  const response = await fetch(`${baseUri}/oauth/userinfo`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch DocuSign user info')
  }

  const data = (await response.json()) as any
  return {
    accountId: data.accounts?.[0]?.account_id || '',
    accountName: data.accounts?.[0]?.account_name || '',
    organizationName: data.accounts?.[0]?.organization_name || '',
    userId: data.sub,
    userEmail: data.email,
    userName: data.name,
  }
}

// ============================================================
// ACCOUNT MANAGEMENT - Database Operations
// ============================================================

export async function saveDocuSignAccount(
  companyId: string,
  tokens: DocuSignOAuthTokens,
  userInfo: Awaited<ReturnType<typeof getDocuSignUserInfo>>,
  environment: 'demo' | 'production' = 'demo'
): Promise<DocuSignAccount> {
  const baseUri = environment === 'production'
    ? 'https://www.docusign.net'
    : 'https://demo.docusign.net'

  const expiresAt = new Date(Date.now() + tokens.expiresIn * 1000)

  const result = await sql`
    INSERT INTO docusign_accounts (
      company_id,
      docusign_account_id,
      access_token,
      refresh_token,
      token_expires_at,
      environment,
      account_name,
      organization_name,
      base_uri,
      is_active,
      oauth_status,
      scopes,
      authenticated_at,
      metadata
    ) VALUES (
      ${companyId},
      ${userInfo.accountId},
      ${tokens.accessToken},
      ${tokens.refreshToken},
      ${expiresAt},
      ${environment},
      ${userInfo.accountName},
      ${userInfo.organizationName},
      ${baseUri},
      TRUE,
      'authenticated',
      ${JSON.stringify(tokens.scope)},
      NOW(),
      ${JSON.stringify({
        userId: userInfo.userId,
        userEmail: userInfo.userEmail,
        userName: userInfo.userName,
      })}
    )
    ON CONFLICT (docusign_account_id) DO UPDATE SET
      access_token = EXCLUDED.access_token,
      refresh_token = EXCLUDED.refresh_token,
      token_expires_at = EXCLUDED.token_expires_at,
      oauth_status = 'authenticated',
      last_refreshed_at = NOW(),
      updated_at = NOW()
    RETURNING *
  `

  return mapDocuSignAccount(result[0])
}

export async function getDocuSignAccount(companyId: string): Promise<DocuSignAccount | null> {
  const result = await sql`
    SELECT * FROM docusign_accounts
    WHERE company_id = ${companyId} AND is_active = TRUE
    ORDER BY authenticated_at DESC
    LIMIT 1
  `

  if (result.length === 0) return null
  return mapDocuSignAccount(result[0])
}

export async function refreshDocuSignAccountTokens(companyId: string): Promise<DocuSignAccount> {
  const account = await getDocuSignAccount(companyId)
  if (!account) {
    throw new Error('No active DocuSign account found')
  }

  // Check if token still valid (5 min buffer)
  if (account.tokenExpiresAt > new Date(Date.now() + 5 * 60 * 1000)) {
    return account
  }

  const clientId = process.env.DOCUSIGN_CLIENT_ID
  const clientSecret = process.env.DOCUSIGN_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw new Error('DocuSign credentials not configured')
  }

  const newTokens = await refreshOAuthToken(
    account.refreshToken,
    clientId,
    clientSecret,
    account.environment
  )

  const expiresAt = new Date(Date.now() + newTokens.expiresIn * 1000)

  const result = await sql`
    UPDATE docusign_accounts
    SET
      access_token = ${newTokens.accessToken},
      refresh_token = ${newTokens.refreshToken},
      token_expires_at = ${expiresAt},
      oauth_status = 'authenticated',
      last_refreshed_at = NOW(),
      updated_at = NOW()
    WHERE company_id = ${companyId} AND is_active = TRUE
    RETURNING *
  `

  if (result.length === 0) {
    throw new Error('Failed to update DocuSign tokens')
  }

  return mapDocuSignAccount(result[0])
}

export async function revokeDocuSignAccount(companyId: string): Promise<void> {
  const account = await getDocuSignAccount(companyId)
  if (!account) return

  await sql`
    UPDATE docusign_accounts
    SET is_active = FALSE, oauth_status = 'revoked', updated_at = NOW()
    WHERE company_id = ${companyId}
  `
}

// ============================================================
// ENVELOPE MANAGEMENT
// ============================================================

export async function createEnvelope(params: CreateEnvelopeParams): Promise<EnvelopeStatus> {
  const account = await refreshDocuSignAccountTokens(params.companyId)

  // Save envelope to database
  const envelope = await sql`
    INSERT INTO docusign_envelopes (
      company_id,
      docusign_account_id,
      envelope_name,
      total_route_steps,
      current_route_step,
      status,
      signer_count,
      sent_at,
      expires_at,
      prospectus_id,
      metadata,
      created_by,
      synced_from_docusign_at
    )
    SELECT
      ${params.companyId},
      da.id,
      ${params.envelopeName},
      ${Math.max(1, params.recipients.length)},
      1,
      'sent',
      ${params.recipients.length},
      NOW(),
      NOW() + INTERVAL '${params.expirationDays || 30} days',
      ${params.prospectusId || null},
      ${JSON.stringify({ description: params.description })},
      (SELECT id FROM users LIMIT 1),
      NOW()
    FROM docusign_accounts da
    WHERE da.company_id = ${params.companyId} AND da.is_active = TRUE
    RETURNING *
  `

  if (envelope.length === 0) {
    throw new Error('Failed to save envelope to database')
  }

  const envelopeId = (envelope[0] as any).id

  // Save recipients
  for (const [index, recipient] of params.recipients.entries()) {
    await sql`
      INSERT INTO docusign_recipients (
        envelope_id,
        recipient_email,
        recipient_name,
        recipient_type,
        sign_order,
        routing_order,
        status,
        sent_notification_at
      ) VALUES (
        ${envelopeId},
        ${recipient.email},
        ${recipient.name},
        'signer',
        ${index + 1},
        ${recipient.routingOrder || index + 1},
        'sent',
        NOW()
      )
    `
  }

  return getEnvelopeStatus(params.companyId, `envelope-${envelopeId}`)
}

export async function getEnvelopeStatus(
  companyId: string,
  docusignEnvelopeId: string
): Promise<EnvelopeStatus> {
  const envelopeRows = await sql`
    SELECT * FROM docusign_envelopes
    WHERE company_id = ${companyId} AND envelope_id = ${docusignEnvelopeId}
    LIMIT 1
  `

  if (envelopeRows.length === 0) {
    throw new Error('Envelope not found')
  }

  const env = envelopeRows[0] as any
  const recipientRows = await sql`
    SELECT * FROM docusign_recipients
    WHERE envelope_id = ${env.id}
    ORDER BY sign_order ASC
  `

  return {
    id: env.id,
    companyId: env.company_id,
    envelopeId: env.envelope_id,
    docusignEnvelopeId: docusignEnvelopeId,
    envelopeName: env.envelope_name,
    status: (env.status || 'sent').toLowerCase() as any,
    sentAt: env.sent_at ? new Date(env.sent_at) : undefined,
    completedAt: env.all_signed_at ? new Date(env.all_signed_at) : undefined,
    expiresAt: env.expires_at ? new Date(env.expires_at) : undefined,
    recipients: (recipientRows as any[]).map((r) => ({
      id: r.id,
      email: r.recipient_email,
      name: r.recipient_name,
      status: (r.status || 'sent').toLowerCase() as any,
      routingOrder: r.routing_order,
      signedAt: r.signed_at ? new Date(r.signed_at) : undefined,
    })),
    completionPercentage: env.completion_percentage || 0,
    isSignedByAll: env.is_signed_by_all || false,
    prospectusId: env.prospectus_id,
  }
}

export async function listEnvelopes(
  companyId: string,
  options?: {
    status?: string
    prospectusId?: string
    limit?: number
    offset?: number
  }
): Promise<{ envelopes: EnvelopeStatus[]; total: number }> {
  const limit = options?.limit || 20
  const offset = options?.offset || 0

  const countResult = await sql`
    SELECT COUNT(*) as total FROM docusign_envelopes
    WHERE company_id = ${companyId}
    ${options?.status ? sql`AND status = ${options.status}` : sql``}
  `

  const total = (countResult[0] as any).total

  const envelopeRows = await sql`
    SELECT * FROM docusign_envelopes
    WHERE company_id = ${companyId}
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `

  const envelopes: EnvelopeStatus[] = (envelopeRows as any[]).map((row) => ({
    id: row.id,
    companyId: row.company_id,
    envelopeId: row.envelope_id,
    docusignEnvelopeId: row.envelope_id,
    envelopeName: row.envelope_name,
    status: (row.status || 'sent').toLowerCase() as any,
    sentAt: row.sent_at ? new Date(row.sent_at) : undefined,
    completedAt: row.all_signed_at ? new Date(row.all_signed_at) : undefined,
    expiresAt: row.expires_at ? new Date(row.expires_at) : undefined,
    recipients: [],
    completionPercentage: row.completion_percentage || 0,
    isSignedByAll: row.is_signed_by_all || false,
    prospectusId: row.prospectus_id,
  }))

  return { envelopes, total }
}

// ============================================================
// WEBHOOK & SYNC
// ============================================================

export async function processWebhookEvent(payload: any): Promise<void> {
  const envelope = payload.envelope

  if (!envelope?.envelopeId) {
    throw new Error('Missing envelope ID in webhook')
  }

  // Store webhook event
  await sql`
    INSERT INTO docusign_webhook_events (
      envelope_id,
      event_type,
      envelope_status,
      raw_payload,
      processed,
      created_at
    ) VALUES (
      ${envelope.envelopeId},
      'envelope-event',
      ${envelope.status},
      ${JSON.stringify(payload)},
      FALSE,
      NOW()
    )
  `

  // Find company
  const envelopeRows = await sql`
    SELECT company_id FROM docusign_envelopes
    WHERE envelope_id = ${envelope.envelopeId}
    LIMIT 1
  `

  if (envelopeRows.length === 0) {
    return
  }

  const companyId = (envelopeRows[0] as any).company_id

  // Handle completion
  if (envelope.status === 'Completed') {
    await handleEnvelopeCompleted(companyId, envelope.envelopeId)
  }
}

export async function handleEnvelopeCompleted(companyId: string, envelopeId: string): Promise<void> {
  const envelopeRows = await sql`
    UPDATE docusign_envelopes
    SET
      status = 'completed',
      is_signed_by_all = TRUE,
      all_signed_at = NOW(),
      updated_at = NOW()
    WHERE company_id = ${companyId} AND envelope_id = ${envelopeId}
    RETURNING id, prospectus_id
  `

  if (envelopeRows.length === 0) return

  const env = envelopeRows[0] as any

  // Update prospectus if linked
  if (env.prospectus_id) {
    await sql`
      UPDATE prospectuses
      SET status = 'review', updated_at = NOW()
      WHERE id = ${env.prospectus_id}
    `
  }
}

// ============================================================
// HELPERS
// ============================================================

function mapDocuSignAccount(row: any): DocuSignAccount {
  return {
    id: row.id,
    companyId: row.company_id,
    docusignAccountId: row.docusign_account_id,
    accessToken: row.access_token,
    refreshToken: row.refresh_token,
    tokenExpiresAt: new Date(row.token_expires_at),
    environment: row.environment,
    baseUri: row.base_uri,
    isActive: row.is_active,
    oauthStatus: row.oauth_status,
    scopes: row.scopes || [],
    authenticatedAt: new Date(row.authenticated_at),
    lastRefreshedAt: row.last_refreshed_at ? new Date(row.last_refreshed_at) : undefined,
  }
}
