import { sql } from '@/lib/db'

// ====================================================================
// DOCUSIGN INTEGRATION CLIENT
// Handles OAuth flow, embedded signing, and cap table certification
// ====================================================================

export interface DocuSignOAuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  accountId: string
  baseUrl: string // https://demo.docusign.net or https://app.docusign.com
}

export interface DocuSignAccessToken {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
}

export interface DocuSignTemplate {
  templateId: string
  name: string
  created: string
  uri: string
}

export interface DocuSignEnvelope {
  envelopeId: string
  status: string // 'sent', 'delivered', 'signed', 'declined', 'voided'
  statusDateTime: string
  recipients?: DocuSignRecipient[]
}

export interface DocuSignRecipient {
  email: string
  name: string
  status: string
  signedDateTime?: string
}

export interface DocuSignSigningUrl {
  url: string
  envelopeId: string
  expiresAt: string
}

export interface SignatureAuditEntry {
  envelopeId: string
  signerEmail: string
  signerName: string
  signedAt: string
  signatureHash: string
  ipAddress?: string
}

// ====================================================================
// OAUTH FLOW
// ====================================================================

export function getDocuSignAuthUrl(config: DocuSignOAuthConfig, state: string): string {
  const params = new URLSearchParams({
    response_type: 'code',
    scope: 'signature impersonation',
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    state: state,
  })
  return `${config.baseUrl}/oauth/authorize?${params.toString()}`
}

export async function exchangeDocuSignCode(
  code: string,
  config: DocuSignOAuthConfig
): Promise<DocuSignAccessToken> {
  const response = await fetch(`${config.baseUrl}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      code,
      grant_type: 'authorization_code',
    }).toString(),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`DocuSign OAuth failed: ${response.status} - ${error}`)
  }

  return response.json()
}

export async function refreshDocuSignToken(
  refreshToken: string,
  config: DocuSignOAuthConfig
): Promise<DocuSignAccessToken> {
  const response = await fetch(`${config.baseUrl}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }).toString(),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`DocuSign token refresh failed: ${response.status} - ${error}`)
  }

  return response.json()
}

// ====================================================================
// CAP TABLE CERTIFICATION SIGNING
// ====================================================================

export async function embedSigningFlow(
  config: DocuSignOAuthConfig,
  accessToken: string,
  templateName: string,
  signerEmail: string,
  signerName: string,
  companyName: string,
  returnUrl: string
): Promise<DocuSignSigningUrl> {
  try {
    // 1. Get template ID by name
    const templatesRes = await fetch(
      `${config.baseUrl}/v2.1/accounts/${config.accountId}/templates`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    )
    if (!templatesRes.ok) throw new Error(`Failed to fetch DocuSign templates: ${templatesRes.status}`)

    const templates = await templatesRes.json()
    const template = templates.envelopeTemplates?.find((t: any) => t.name === templateName)

    if (!template) {
      throw new Error(
        `Template "${templateName}" not found. Available: ${templates.envelopeTemplates?.map((t: any) => t.name).join(', ') || 'none'}`
      )
    }

    // 2. Create envelope from template with custom fields
    const envelopeRes = await fetch(
      `${config.baseUrl}/v2.1/accounts/${config.accountId}/envelopes`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId: template.templateId,
          templateRoles: [
            {
              email: signerEmail,
              name: signerName,
              roleName: 'signer',
              clientUserId: `${signerEmail}-${Date.now()}`,
            },
          ],
          customFields: {
            textCustomFields: [
              { name: 'Company Name', value: companyName },
              { name: 'Certification Date', value: new Date().toISOString().split('T')[0] },
            ],
          },
          status: 'sent',
        }),
      }
    )

    if (!envelopeRes.ok) {
      const error = await envelopeRes.text()
      throw new Error(`Failed to create DocuSign envelope: ${envelopeRes.status} - ${error}`)
    }

    const envelope = await envelopeRes.json()

    // 3. Get embedded signing URL
    const viewRes = await fetch(
      `${config.baseUrl}/v2.1/accounts/${config.accountId}/envelopes/${envelope.envelopeId}/views/recipient`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl: returnUrl,
          email: signerEmail,
          userName: signerName,
          clientUserId: `${signerEmail}-${Date.now()}`,
          authenticationType: 'none',
          showToolbar: true,
        }),
      }
    )

    if (!viewRes.ok) {
      const error = await viewRes.text()
      throw new Error(`Failed to get signing URL: ${viewRes.status} - ${error}`)
    }

    const view = await viewRes.json()

    // Add 24 hours to now for expiry
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    return {
      url: view.url,
      envelopeId: envelope.envelopeId,
      expiresAt,
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    throw new Error(`embedSigningFlow failed: ${msg}`)
  }
}

// ====================================================================
// RETRIEVE SIGNED DOCUMENT
// ====================================================================

export async function getSignedDocument(
  config: DocuSignOAuthConfig,
  accessToken: string,
  envelopeId: string
): Promise<{
  status: string
  recipients: DocuSignRecipient[]
  document?: Buffer
}> {
  try {
    // 1. Get envelope status
    const statusRes = await fetch(
      `${config.baseUrl}/v2.1/accounts/${config.accountId}/envelopes/${envelopeId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    )

    if (!statusRes.ok) {
      throw new Error(`Failed to fetch envelope status: ${statusRes.status}`)
    }

    const envelope = await statusRes.json()

    // 2. If signed, get the signed document
    let document: Buffer | undefined
    if (envelope.status === 'completed') {
      const docRes = await fetch(
        `${config.baseUrl}/v2.1/accounts/${config.accountId}/envelopes/${envelopeId}/documents/1`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      )

      if (docRes.ok) {
        const arrayBuffer = await docRes.arrayBuffer()
        document = Buffer.from(arrayBuffer)
      }
    }

    return {
      status: envelope.status,
      recipients: envelope.recipients?.signers || [],
      document,
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    throw new Error(`getSignedDocument failed: ${msg}`)
  }
}

// ====================================================================
// AUDIT TRAIL LOGGING
// ====================================================================

export async function logSignatureCompletion(
  companyId: string,
  envelopeId: string,
  signerEmail: string,
  signerName: string,
  signedAt: string,
  signatureHash: string,
  ipAddress?: string
): Promise<{ success: boolean; auditEntryId: string }> {
  try {
    const result = await sql`
      INSERT INTO cap_table_signature_audit (
        company_id, envelope_id, signer_email, signer_name,
        signed_at, signature_hash, ip_address, created_at
      )
      VALUES (
        ${companyId}, ${envelopeId}, ${signerEmail}, ${signerName},
        ${signedAt}, ${signatureHash}, ${ipAddress ?? null}, NOW()
      )
      RETURNING id
    `

    return {
      success: true,
      auditEntryId: (result[0] as any).id,
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to log signature completion: ${msg}`)
  }
}

export async function updateCapTableCertifiedAt(
  companyId: string,
  certifiedAt: string
): Promise<void> {
  try {
    await sql`
      UPDATE companies
      SET cap_table_certified_at = ${certifiedAt},
          updated_at = NOW()
      WHERE id = ${companyId}
    `
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to update cap table certified timestamp: ${msg}`)
  }
}

// ====================================================================
// WEBHOOK HANDLER (Signature Completion)
// ====================================================================

export interface DocuSignWebhookPayload {
  data: {
    envelopeStatus: {
      envelopeId: string
      status: string
      signerStatuses?: Array<{
        email: string
        userName: string
        signedDateTime?: string
      }>
    }
  }
}

export async function handleDocuSignWebhook(
  payload: DocuSignWebhookPayload
): Promise<{ success: boolean; message: string }> {
  try {
    const { envelopeId, status, signerStatuses } = payload.data.envelopeStatus

    if (status === 'Completed' && signerStatuses) {
      // Log each signature for audit trail
      for (const signer of signerStatuses) {
        if (signer.signedDateTime) {
          const signatureHash = Buffer.from(
            `${envelopeId}-${signer.email}-${signer.signedDateTime}`
          )
            .toString('hex')
            .substring(0, 64)

          console.log(`Signature completed: ${signer.userName} (${signer.email})`)
          // TODO: Match envelope back to company and call logSignatureCompletion
        }
      }
    }

    return { success: true, message: 'Webhook processed' }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return { success: false, message: `Webhook processing failed: ${msg}` }
  }
}

// ====================================================================
// ERROR HANDLING & UTILITIES
// ====================================================================

export async function isDocuSignTokenValid(
  config: DocuSignOAuthConfig,
  accessToken: string
): Promise<boolean> {
  try {
    const response = await fetch(`${config.baseUrl}/v2.1/accounts/${config.accountId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    return response.ok
  } catch {
    return false
  }
}

export function getDocuSignErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('401')) return 'DocuSign token expired or invalid'
    if (error.message.includes('403')) return 'Permission denied by DocuSign'
    if (error.message.includes('404')) return 'Template or envelope not found'
    if (error.message.includes('429')) return 'Rate limit exceeded'
    if (error.message.includes('timeout'))
      return 'Connection timeout (DocuSign API may be slow)'
    return `DocuSign integration error: ${error.message}`
  }
  return 'Unknown DocuSign integration error'
}
