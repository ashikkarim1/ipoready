/**
 * DOCUSIGN INTEGRATION BACKEND
 * Complete OAuth2 flow, envelope management, recipient routing, webhooks
 * Integrates with Neon database for template, envelope, and signature tracking
 */

import { sql } from '@/lib/db'
import crypto from 'crypto'

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
  accountName: string
  organizationName: string
  isActive: boolean
  oauthStatus: 'authenticated' | 'expired' | 'revoked' | 'pending'
  scopes: string[]
  authenticatedAt: Date
  lastRefreshedAt?: Date
}

export interface CreateEnvelopeParams {
  companyId: string
  templateId?: string
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
  documentBase64?: string
  documentName?: string
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
  metadata?: Record<string, any>
}

export interface RecipientStatus {
  id: string
  email: string
  name: string
  status: 'sent' | 'delivered' | 'viewed' | 'signed' | 'declined'
  routingOrder: number
  signedAt?: Date
  signedLocation?: string
  deliveredAt?: Date
}

export interface WebhookEventPayload {
  event: string
  data: {
    envelope: {
      envelopeId: string
      status: string
      statusDateTime: string
      recipients?: Array<{
        email: string
        name: string
        status: string
        signedDateTime?: string
        deliveredDateTime?: string
      }>
    }
  }
}

// ============================================================
// OAUTH2 FLOW - Core Functions
// ============================================================

export function generateAuthorizationUrl(
  clientId: string,
  redirectUri: string,
  environment: 'demo' | 'production' = 'demo',
  state?: string
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

  const stateParam = state || crypto.randomBytes(16).toString('hex')

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scopes.join(' '),
    state: stateParam,
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
    scope: data.scope ? data.scope.split(' ') : [],
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
    scope: data.scope ? data.scope.split(' ') : [],
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
  baseUri: string
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
    baseUri,
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
  const expiresAt = new Date(Date.now() + tokens.expiresIn * 1000)

  const rows = await sql`
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
      created_at,
      updated_at
    ) VALUES (
      ${companyId},
      ${userInfo.accountId},
      ${tokens.accessToken},
      ${tokens.refreshToken},
      ${expiresAt.toISOString()},
      ${environment},
      ${userInfo.accountName},
      ${userInfo.organizationName},
      ${userInfo.baseUri},
      TRUE,
      'authenticated',
      ${JSON.stringify(tokens.scope)},
      NOW(),
      NOW(),
      NOW()
    )
    ON CONFLICT (company_id) DO UPDATE SET
      docusign_account_id = EXCLUDED.docusign_account_id,
      access_token = EXCLUDED.access_token,
      refresh_token = EXCLUDED.refresh_token,
      token_expires_at = EXCLUDED.token_expires_at,
      oauth_status = 'authenticated',
      last_refreshed_at = NOW(),
      updated_at = NOW()
    RETURNING *
  ` as any[]

  if (rows.length === 0) {
    throw new Error('Failed to save DocuSign account')
  }

  return mapDocuSignAccount(rows[0])
}

export async function getDocuSignAccount(
  companyId: string
): Promise<{ success: boolean; account?: DocuSignAccount; error?: string }> {
  try {
    const rows = await sql`
      SELECT * FROM docusign_accounts
      WHERE company_id = ${companyId} AND is_active = TRUE
      ORDER BY authenticated_at DESC
      LIMIT 1
    ` as any[]

    if (rows.length === 0) {
      return { success: false, error: 'No active DocuSign account found' }
    }
    return { success: true, account: mapDocuSignAccount(rows[0]) }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to retrieve account',
    }
  }
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

  const rows = await sql`
    UPDATE docusign_accounts
    SET
      access_token = ${newTokens.accessToken},
      refresh_token = ${newTokens.refreshToken},
      token_expires_at = ${expiresAt.toISOString()},
      oauth_status = 'authenticated',
      last_refreshed_at = NOW(),
      updated_at = NOW()
    WHERE company_id = ${companyId} AND is_active = TRUE
    RETURNING *
  ` as any[]

  if (rows.length === 0) {
    throw new Error('Failed to update DocuSign tokens')
  }

  return mapDocuSignAccount(rows[0])
}

export async function revokeDocuSignAccount(companyId: string): Promise<void> {
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

  // Create envelope in DocuSign API
  const docusignEnvelopeId = await createDocuSignEnvelope(
    account,
    params
  )

  // Save envelope to database
  const envelopeRows = await sql`
    INSERT INTO docusign_envelopes (
      company_id,
      docusign_account_id,
      docusign_envelope_id,
      envelope_name,
      envelope_status,
      total_recipients,
      signed_recipients_count,
      status,
      sent_at,
      expires_at,
      prospectus_id,
      metadata,
      created_at,
      updated_at
    ) VALUES (
      ${params.companyId},
      ${account.id},
      ${docusignEnvelopeId},
      ${params.envelopeName},
      'sent',
      ${params.recipients.length},
      0,
      'sent',
      NOW(),
      NOW() + INTERVAL '${params.expirationDays || 30} days',
      ${params.prospectusId || null},
      ${JSON.stringify({
        description: params.description,
        customFields: params.customFields,
      })},
      NOW(),
      NOW()
    )
    RETURNING *
  ` as any[]

  if (envelopeRows.length === 0) {
    throw new Error('Failed to save envelope to database')
  }

  const envelope = envelopeRows[0]
  const envelopeDbId = envelope.id

  // Save recipients
  for (const [index, recipient] of params.recipients.entries()) {
    await sql`
      INSERT INTO docusign_recipients (
        envelope_id,
        recipient_email,
        recipient_name,
        recipient_type,
        routing_order,
        status,
        sent_notification_at,
        created_at,
        updated_at
      ) VALUES (
        ${envelopeDbId},
        ${recipient.email},
        ${recipient.name},
        'signer',
        ${recipient.routingOrder || index + 1},
        'sent',
        NOW(),
        NOW(),
        NOW()
      )
    `
  }

  return getEnvelopeStatus(params.companyId, docusignEnvelopeId)
}

async function createDocuSignEnvelope(
  account: DocuSignAccount,
  params: CreateEnvelopeParams
): Promise<string> {
  const payload: Record<string, any> = {
    emailSubject: params.envelopeName,
    emailBlurb: params.description || '',
    status: 'sent',
    templateRoles: params.recipients.map((r, idx) => ({
      email: r.email,
      name: r.name,
      roleName: r.roleName,
      clientUserId: `${r.email}-${Date.now()}`,
      routingOrder: r.routingOrder || idx + 1,
    })),
  }

  if (params.templateId) {
    payload.templateId = params.templateId
  } else if (params.documentBase64 && params.documentName) {
    payload.documents = [
      {
        documentBase64: params.documentBase64,
        name: params.documentName,
        fileExtension: 'pdf',
        documentId: '1',
      },
    ]
    payload.recipients = {
      signers: params.recipients.map((r, idx) => ({
        email: r.email,
        name: r.name,
        clientUserId: `${r.email}-${Date.now()}`,
        recipientId: String(idx + 1),
        routingOrder: String(r.routingOrder || idx + 1),
        tabs: {
          signHereTabs: [
            {
              documentId: '1',
              pageNumber: '1',
              xPosition: '100',
              yPosition: '100',
            },
          ],
        },
      })),
    }
  }

  if (params.customFields) {
    payload.customFields = {
      textCustomFields: Object.entries(params.customFields).map(([name, value]) => ({
        name,
        value,
        required: 'false',
        show: 'false',
      })),
    }
  }

  const response = await fetch(
    `${account.baseUri}/v2.1/accounts/${account.docusignAccountId}/envelopes`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${account.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to create DocuSign envelope: ${response.status} - ${error}`)
  }

  const data = (await response.json()) as any
  return data.envelopeId
}

export async function getEnvelopeStatus(
  companyId: string,
  docusignEnvelopeId: string
): Promise<EnvelopeStatus> {
  const envelopeRows = await sql`
    SELECT * FROM docusign_envelopes
    WHERE company_id = ${companyId} AND docusign_envelope_id = ${docusignEnvelopeId}
    LIMIT 1
  ` as any[]

  if (envelopeRows.length === 0) {
    throw new Error('Envelope not found')
  }

  const envelope = envelopeRows[0]
  const recipientRows = await sql`
    SELECT * FROM docusign_recipients
    WHERE envelope_id = ${envelope.id}
    ORDER BY routing_order ASC
  ` as any[]

  const completedCount = recipientRows.filter((r: any) => r.status === 'signed').length
  const completionPercentage = recipientRows.length > 0
    ? Math.round((completedCount / recipientRows.length) * 100)
    : 0

  return {
    id: envelope.id,
    companyId: envelope.company_id,
    envelopeId: envelope.id,
    docusignEnvelopeId: envelope.docusign_envelope_id || docusignEnvelopeId,
    envelopeName: envelope.envelope_name,
    status: (envelope.status || 'sent').toLowerCase() as any,
    sentAt: envelope.sent_at ? new Date(envelope.sent_at) : undefined,
    completedAt: envelope.all_signed_at ? new Date(envelope.all_signed_at) : undefined,
    expiresAt: envelope.expires_at ? new Date(envelope.expires_at) : undefined,
    recipients: (recipientRows).map((r: any) => ({
      id: r.id,
      email: r.recipient_email,
      name: r.recipient_name,
      status: (r.status || 'sent').toLowerCase() as any,
      routingOrder: r.routing_order,
      signedAt: r.signed_at ? new Date(r.signed_at) : undefined,
      deliveredAt: r.delivered_at ? new Date(r.delivered_at) : undefined,
    })),
    completionPercentage,
    isSignedByAll: completedCount === recipientRows.length && recipientRows.length > 0,
    prospectusId: envelope.prospectus_id,
    metadata: envelope.metadata,
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

  const countRows = await sql`
    SELECT COUNT(*) as total FROM docusign_envelopes
    WHERE company_id = ${companyId}
    ${options?.status ? sql`AND status = ${options.status}` : sql``}
  ` as any[]

  const total = countRows.length > 0 ? countRows[0].total : 0

  const envelopeRows = await sql`
    SELECT * FROM docusign_envelopes
    WHERE company_id = ${companyId}
    ${options?.status ? sql`AND status = ${options.status}` : sql``}
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  ` as any[]

  const envelopes: EnvelopeStatus[] = []

  for (const row of envelopeRows) {
    const recipientRows = await sql`
      SELECT * FROM docusign_recipients
      WHERE envelope_id = ${row.id}
      ORDER BY routing_order ASC
    ` as any[]

    const completedCount = recipientRows.filter((r: any) => r.status === 'signed').length
    const completionPercentage = recipientRows.length > 0
      ? Math.round((completedCount / recipientRows.length) * 100)
      : 0

    envelopes.push({
      id: row.id,
      companyId: row.company_id,
      envelopeId: row.id,
      docusignEnvelopeId: row.docusign_envelope_id,
      envelopeName: row.envelope_name,
      status: (row.status || 'sent').toLowerCase() as any,
      sentAt: row.sent_at ? new Date(row.sent_at) : undefined,
      completedAt: row.all_signed_at ? new Date(row.all_signed_at) : undefined,
      expiresAt: row.expires_at ? new Date(row.expires_at) : undefined,
      recipients: recipientRows.map((r: any) => ({
        id: r.id,
        email: r.recipient_email,
        name: r.recipient_name,
        status: (r.status || 'sent').toLowerCase() as any,
        routingOrder: r.routing_order,
        signedAt: r.signed_at ? new Date(r.signed_at) : undefined,
        deliveredAt: r.delivered_at ? new Date(r.delivered_at) : undefined,
      })),
      completionPercentage,
      isSignedByAll: completedCount === recipientRows.length && recipientRows.length > 0,
      prospectusId: row.prospectus_id,
      metadata: row.metadata,
    })
  }

  return { envelopes, total }
}

export async function resendEnvelope(
  companyId: string,
  docusignEnvelopeId: string
): Promise<void> {
  const account = await refreshDocuSignAccountTokens(companyId)

  const response = await fetch(
    `${account.baseUri}/v2.1/accounts/${account.docusignAccountId}/envelopes/${docusignEnvelopeId}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${account.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'sent' }),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to resend envelope: ${response.status} - ${error}`)
  }

  // Update sent timestamp in DB
  await sql`
    UPDATE docusign_envelopes
    SET sent_at = NOW(), updated_at = NOW()
    WHERE company_id = ${companyId} AND docusign_envelope_id = ${docusignEnvelopeId}
  `
}

export async function voidEnvelope(
  companyId: string,
  docusignEnvelopeId: string,
  reason?: string
): Promise<void> {
  const account = await refreshDocuSignAccountTokens(companyId)

  const response = await fetch(
    `${account.baseUri}/v2.1/accounts/${account.docusignAccountId}/envelopes/${docusignEnvelopeId}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${account.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'voided',
        voidedReason: reason || 'No longer needed',
      }),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to void envelope: ${response.status} - ${error}`)
  }

  // Update DB
  await sql`
    UPDATE docusign_envelopes
    SET status = 'voided', updated_at = NOW()
    WHERE company_id = ${companyId} AND docusign_envelope_id = ${docusignEnvelopeId}
  `
}

// ============================================================
// WEBHOOK & SYNC
// ============================================================

export async function processWebhookEvent(payload: WebhookEventPayload): Promise<void> {
  const envelope = payload.data.envelope

  if (!envelope?.envelopeId) {
    throw new Error('Missing envelope ID in webhook')
  }

  // Store webhook event
  await sql`
    INSERT INTO docusign_webhook_events (
      docusign_envelope_id,
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
    WHERE docusign_envelope_id = ${envelope.envelopeId}
    LIMIT 1
  ` as any[]

  if (envelopeRows.length === 0) {
    return
  }

  const companyId = envelopeRows[0].company_id

  // Update envelope status
  const statusMap: Record<string, string> = {
    'sent': 'sent',
    'delivered': 'delivered',
    'signed': 'signed',
    'completed': 'completed',
    'declined': 'declined',
    'voided': 'voided',
  }

  const dbStatus = statusMap[envelope.status.toLowerCase()] || envelope.status.toLowerCase()

  await sql`
    UPDATE docusign_envelopes
    SET
      envelope_status = ${envelope.status},
      status = ${dbStatus},
      updated_at = NOW()
    WHERE docusign_envelope_id = ${envelope.envelopeId}
  `

  // Update recipients
  if (envelope.recipients && Array.isArray(envelope.recipients)) {
    for (const recipientData of envelope.recipients) {
      const recipientRows = await sql`
        SELECT id FROM docusign_recipients
        WHERE envelope_id IN (
          SELECT id FROM docusign_envelopes
          WHERE docusign_envelope_id = ${envelope.envelopeId}
        ) AND recipient_email = ${recipientData.email}
        LIMIT 1
      ` as any[]

      if (recipientRows.length > 0) {
        const recipientId = recipientRows[0].id
        const recipientStatus = recipientData.status?.toLowerCase() || 'sent'

        await sql`
          UPDATE docusign_recipients
          SET
            status = ${recipientStatus},
            ${recipientData.signedDateTime ? sql`signed_at = ${new Date(recipientData.signedDateTime).toISOString()}` : sql``},
            ${recipientData.deliveredDateTime ? sql`delivered_at = ${new Date(recipientData.deliveredDateTime).toISOString()}` : sql``},
            updated_at = NOW()
          WHERE id = ${recipientId}
        `
      }
    }
  }

  // Handle completion
  if (envelope.status === 'Completed') {
    await handleEnvelopeCompleted(companyId, envelope.envelopeId)
  }
}

export async function handleEnvelopeCompleted(companyId: string, docusignEnvelopeId: string): Promise<void> {
  const envelopeRows = await sql`
    UPDATE docusign_envelopes
    SET
      status = 'completed',
      envelope_status = 'completed',
      all_signed_at = NOW(),
      updated_at = NOW()
    WHERE company_id = ${companyId} AND docusign_envelope_id = ${docusignEnvelopeId}
    RETURNING id, prospectus_id
  ` as any[]

  if (envelopeRows.length === 0) return

  const envelope = envelopeRows[0]

  // Update prospectus if linked
  if (envelope.prospectus_id) {
    await sql`
      UPDATE prospectuses
      SET status = 'review', updated_at = NOW()
      WHERE id = ${envelope.prospectus_id}
    `
  }
}

export async function markWebhookProcessed(eventId: string): Promise<void> {
  await sql`
    UPDATE docusign_webhook_events
    SET processed = TRUE, processed_at = NOW()
    WHERE id = ${eventId}
  `
}

// ============================================================
// HELPER FUNCTIONS
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
    accountName: row.account_name,
    organizationName: row.organization_name,
    isActive: row.is_active,
    oauthStatus: row.oauth_status,
    scopes: row.scopes || [],
    authenticatedAt: new Date(row.authenticated_at),
    lastRefreshedAt: row.last_refreshed_at ? new Date(row.last_refreshed_at) : undefined,
  }
}

export function validateWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
  return signature === expectedSignature
}

export function getDocuSignErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('401')) return 'DocuSign token expired or invalid'
    if (error.message.includes('403')) return 'Permission denied by DocuSign'
    if (error.message.includes('404')) return 'Template or envelope not found'
    if (error.message.includes('429')) return 'Rate limit exceeded'
    if (error.message.includes('timeout')) return 'Connection timeout'
    return `DocuSign error: ${error.message}`
  }
  return 'Unknown DocuSign error'
}

export async function getEmbeddedSigningUrl(
  companyId: string,
  docusignEnvelopeId: string,
  signerEmail: string,
  signerName: string,
  returnUrl: string
): Promise<string> {
  const account = await refreshDocuSignAccountTokens(companyId)

  const response = await fetch(
    `${account.baseUri}/v2.1/accounts/${account.docusignAccountId}/envelopes/${docusignEnvelopeId}/views/recipient`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${account.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        returnUrl,
        email: signerEmail,
        userName: signerName,
        clientUserId: `${signerEmail}-${Date.now()}`,
        authenticationType: 'none',
        showToolbar: true,
      }),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to get signing URL: ${response.status} - ${error}`)
  }

  const data = (await response.json()) as any
  return data.url
}

export async function getSignedDocuments(
  companyId: string,
  docusignEnvelopeId: string
): Promise<Array<{ documentId: string; name: string; uri: string }>> {
  const account = await refreshDocuSignAccountTokens(companyId)

  const response = await fetch(
    `${account.baseUri}/v2.1/accounts/${account.docusignAccountId}/envelopes/${docusignEnvelopeId}/documents`,
    {
      headers: {
        'Authorization': `Bearer ${account.accessToken}`,
      },
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to get documents: ${response.status} - ${error}`)
  }

  const data = (await response.json()) as any
  return (data.envelopeDocuments || []).map((doc: any) => ({
    documentId: doc.documentId,
    name: doc.name,
    uri: doc.uri,
  }))
}

export async function downloadSignedDocument(
  companyId: string,
  docusignEnvelopeId: string,
  documentId: string
): Promise<Buffer> {
  const account = await refreshDocuSignAccountTokens(companyId)

  const response = await fetch(
    `${account.baseUri}/v2.1/accounts/${account.docusignAccountId}/envelopes/${docusignEnvelopeId}/documents/${documentId}`,
    {
      headers: {
        'Authorization': `Bearer ${account.accessToken}`,
      },
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to download document: ${response.status} - ${error}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

/**
 * Create DocuSign envelope from document (for prospectus submission)
 * Convenience wrapper for integration orchestration
 */
export async function createEnvelopeFromDocument(
  account: DocuSignAccount | Awaited<ReturnType<typeof getDocuSignAccount>>['account'],
  params: CreateEnvelopeParams
): Promise<{
  success: boolean
  envelopeId?: string
  error?: string
}> {
  try {
    // Ensure account is properly typed
    let docuSignAccount: DocuSignAccount
    if (params.companyId) {
      const result = await refreshDocuSignAccountTokens(params.companyId)
      docuSignAccount = result
    } else {
      docuSignAccount = account as DocuSignAccount
    }

    const envelopeId = await createDocuSignEnvelope(docuSignAccount, params)

    // Save envelope to database
    const envelopeRows = await sql`
      INSERT INTO docusign_envelopes (
        company_id,
        docusign_account_id,
        docusign_envelope_id,
        envelope_name,
        envelope_status,
        total_recipients,
        signed_recipients_count,
        status,
        sent_at,
        expires_at,
        prospectus_id,
        metadata,
        created_at,
        updated_at
      ) VALUES (
        ${params.companyId},
        ${docuSignAccount.id},
        ${envelopeId},
        ${params.envelopeName},
        'sent',
        ${params.recipients.length},
        0,
        'sent',
        NOW(),
        NOW() + INTERVAL '${params.expirationDays || 30} days',
        ${params.prospectusId || null},
        ${JSON.stringify({
          description: params.description,
          customFields: params.customFields,
        })},
        NOW(),
        NOW()
      )
      RETURNING id
    ` as any[]

    if (envelopeRows.length === 0) {
      return { success: false, error: 'Failed to save envelope to database' }
    }

    const envelopeDbId = envelopeRows[0].id

    // Save recipients
    for (const [index, recipient] of params.recipients.entries()) {
      await sql`
        INSERT INTO docusign_recipients (
          envelope_id,
          recipient_email,
          recipient_name,
          recipient_type,
          routing_order,
          status,
          sent_notification_at,
          created_at,
          updated_at
        ) VALUES (
          ${envelopeDbId},
          ${recipient.email},
          ${recipient.name},
          'signer',
          ${recipient.routingOrder || index + 1},
          'sent',
          NOW(),
          NOW(),
          NOW()
        )
      `
    }

    return { success: true, envelopeId }
  } catch (err) {
    console.error('Error creating DocuSign envelope:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create envelope',
    }
  }
}
}
