import { sql } from '@/lib/db'

// ====================================================================
// PULLEY INTEGRATION CLIENT
// Similar OAuth + API structure as Carta with Pulley-specific field mapping
// ====================================================================

export interface PulleyOAuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
}

export interface PulleyAccessToken {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
}

export interface PulleyPerson {
  id: string
  name: string
  email?: string
  type: 'founder' | 'advisor' | 'employee' | 'investor'
}

export interface PulleySecurityType {
  id: string
  name: string
  type: 'common_stock' | 'preferred_stock' | 'warrant' | 'option'
}

export interface PulleyGrant {
  id: string
  personId: string
  securityTypeId: string
  quantity: number
  strike?: number
  vestingStart?: string
  cliffMonths?: number
  vestingMonths?: number
  vestedQuantity?: number
  grantDate: string
  grantType: 'stock' | 'option' | 'warrant'
}

export interface PulleyCapTable {
  people: PulleyPerson[]
  securityTypes: PulleySecurityType[]
  grants: PulleyGrant[]
  lastUpdated: string
}

export interface NormalizedCapTableEntry {
  shareholder_name: string
  share_class_name: string
  quantity: number
  vesting_start_date?: string
  vesting_cliff_months?: number
  vesting_period_months?: number
  vested_quantity: number
  strike_price?: number
  grant_date: string
  grant_type: 'stock' | 'option' | 'warrant' | 'convertible'
  notes?: string
}

// ====================================================================
// OAUTH FLOW
// ====================================================================

export function getPulleyAuthUrl(config: PulleyOAuthConfig, state: string): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: 'cap_table.read cap_table.write',
    state: state,
  })
  return `https://app.pulley.com/api/v1/oauth/authorize?${params.toString()}`
}

export async function exchangePulleyCode(
  code: string,
  config: PulleyOAuthConfig
): Promise<PulleyAccessToken> {
  const response = await fetch('https://api.pulley.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      grant_type: 'authorization_code',
    }).toString(),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Pulley OAuth failed: ${response.status} - ${error}`)
  }

  return response.json()
}

export async function refreshPulleyToken(
  refreshToken: string,
  config: PulleyOAuthConfig
): Promise<PulleyAccessToken> {
  const response = await fetch('https://api.pulley.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: 'refresh_token',
    }).toString(),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Pulley token refresh failed: ${response.status} - ${error}`)
  }

  return response.json()
}

// ====================================================================
// CAP TABLE FETCH
// ====================================================================

export async function getCapTableFromPulley(
  companyId: string,
  accessToken: string,
  pulleyCompanyId: string
): Promise<PulleyCapTable> {
  try {
    // Fetch people (shareholders/employees)
    const peopleRes = await fetch(
      `https://api.pulley.com/v1/companies/${pulleyCompanyId}/people`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    )
    if (!peopleRes.ok)
      throw new Error(`Failed to fetch Pulley people: ${peopleRes.status}`)

    // Fetch security types
    const secRes = await fetch(
      `https://api.pulley.com/v1/companies/${pulleyCompanyId}/security-types`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    )
    if (!secRes.ok)
      throw new Error(`Failed to fetch Pulley security types: ${secRes.status}`)

    // Fetch grants
    const grantsRes = await fetch(
      `https://api.pulley.com/v1/companies/${pulleyCompanyId}/grants`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    )
    if (!grantsRes.ok)
      throw new Error(`Failed to fetch Pulley grants: ${grantsRes.status}`)

    const [people, securityTypes, grants] = await Promise.all([
      peopleRes.json(),
      secRes.json(),
      grantsRes.json(),
    ])

    return {
      people,
      securityTypes,
      grants,
      lastUpdated: new Date().toISOString(),
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    throw new Error(`getCapTableFromPulley failed: ${msg}`)
  }
}

// ====================================================================
// CAP TABLE SYNC (One-Way: Pulley → IPOReady)
// ====================================================================

export async function syncCapTableWithPulley(
  companyId: string,
  accessToken: string,
  pulleyCompanyId: string,
  normalizer: (data: PulleyCapTable) => NormalizedCapTableEntry[]
): Promise<{ success: boolean; rowsImported: number; errors: string[] }> {
  const errors: string[] = []

  try {
    // 1. Fetch cap table from Pulley
    const pulleyData = await getCapTableFromPulley(companyId, accessToken, pulleyCompanyId)

    // 2. Normalize data
    const normalized = normalizer(pulleyData)

    // 3. Begin transaction: upsert all entries
    let rowsImported = 0

    // For each normalized entry, create or update
    for (const entry of normalized) {
      try {
        // Find or create share class
        const shareClassResult = await sql`
          SELECT id FROM share_classes
          WHERE company_id = ${companyId}
          AND class_name = ${entry.share_class_name}
          LIMIT 1
        `

        let shareClassId: string
        if (shareClassResult.length > 0) {
          shareClassId = (shareClassResult[0] as any).id
        } else {
          const inserted = await sql`
            INSERT INTO share_classes (company_id, class_name, preference_order)
            VALUES (${companyId}, ${entry.share_class_name}, 0)
            RETURNING id
          `
          shareClassId = (inserted[0] as any).id
        }

        // Upsert cap table entry (matching by shareholder + share class)
        const existing = await sql`
          SELECT id FROM cap_table_entries
          WHERE company_id = ${companyId}
          AND shareholder_name = ${entry.shareholder_name}
          AND share_class_id = ${shareClassId}
          LIMIT 1
        `

        if (existing.length > 0) {
          await sql`
            UPDATE cap_table_entries
            SET quantity = ${entry.quantity},
                vesting_start_date = ${entry.vesting_start_date ?? null},
                vesting_cliff_months = ${entry.vesting_cliff_months ?? null},
                vesting_period_months = ${entry.vesting_period_months ?? null},
                vested_quantity = ${entry.vested_quantity},
                strike_price = ${entry.strike_price ?? null},
                grant_date = ${entry.grant_date},
                grant_type = ${entry.grant_type},
                notes = ${entry.notes ?? null},
                updated_at = NOW()
            WHERE id = ${(existing[0] as any).id}
          `
        } else {
          await sql`
            INSERT INTO cap_table_entries (
              company_id, shareholder_name, share_class_id, quantity,
              vesting_start_date, vesting_cliff_months, vesting_period_months,
              vested_quantity, strike_price, grant_date, grant_type, notes,
              created_at, updated_at
            )
            VALUES (
              ${companyId}, ${entry.shareholder_name}, ${shareClassId},
              ${entry.quantity}, ${entry.vesting_start_date ?? null},
              ${entry.vesting_cliff_months ?? null},
              ${entry.vesting_period_months ?? null}, ${entry.vested_quantity},
              ${entry.strike_price ?? null}, ${entry.grant_date},
              ${entry.grant_type}, ${entry.notes ?? null},
              NOW(), NOW()
            )
          `
        }

        rowsImported++
      } catch (rowError) {
        const msg = rowError instanceof Error ? rowError.message : String(rowError)
        errors.push(`Row for ${entry.shareholder_name}: ${msg}`)
      }
    }

    return { success: errors.length === 0, rowsImported, errors }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return {
      success: false,
      rowsImported: 0,
      errors: [`Sync failed: ${msg}`],
    }
  }
}

// ====================================================================
// WEBHOOK HANDLER
// ====================================================================

export interface PulleyWebhookPayload {
  event: string
  companyId: string
  timestamp: string
  data: Record<string, any>
}

export async function handlePulleyWebhook(
  payload: PulleyWebhookPayload,
  signature: string,
  secret: string
): Promise<{ success: boolean; message: string }> {
  try {
    // 1. Verify signature
    const crypto = require('crypto')
    const hash = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex')

    if (hash !== signature) {
      return { success: false, message: 'Invalid signature' }
    }

    // 2. Queue re-sync if cap table changed
    if (
      payload.event === 'grant:created' ||
      payload.event === 'grant:updated' ||
      payload.event === 'person:created'
    ) {
      console.log(`Queueing cap table re-sync for Pulley company: ${payload.companyId}`)
      // TODO: Implement job queue integration
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

export async function isPulleyTokenValid(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.pulley.com/v1/companies', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    return response.ok
  } catch {
    return false
  }
}

export function getPulleyErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('401')) return 'Pulley token expired or invalid'
    if (error.message.includes('403')) return 'Permission denied by Pulley'
    if (error.message.includes('404')) return 'Company not found in Pulley'
    if (error.message.includes('429')) return 'Rate limit exceeded'
    if (error.message.includes('timeout'))
      return 'Connection timeout (Pulley API may be slow)'
    return `Pulley integration error: ${error.message}`
  }
  return 'Unknown Pulley integration error'
}
