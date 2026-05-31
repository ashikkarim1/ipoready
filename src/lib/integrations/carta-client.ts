import { sql } from '@/lib/db'

// ====================================================================
// CARTA INTEGRATION CLIENT
// Handles OAuth flow, cap table syncing, and webhook processing
// ====================================================================

export interface CartaOAuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
}

export interface CartaAccessToken {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
}

export interface CartaShareholder {
  id: string
  name: string
  email?: string
  shareholderType: 'individual' | 'institution' | 'employee'
}

export interface CartaSecurityClass {
  id: string
  name: string
  classType: 'common' | 'preferred' | 'warrant' | 'option'
}

export interface CartaHolding {
  id: string
  shareholderId: string
  securityClassId: string
  quantity: number
  exercisePrice?: number
  vestingSchedule?: {
    vestingStartDate: string
    cliffMonths: number
    vestingPeriodMonths: number
  }
  grantDate: string
  type: 'stock' | 'option' | 'warrant'
}

export interface CartaCapTable {
  shareholders: CartaShareholder[]
  securityClasses: CartaSecurityClass[]
  holdings: CartaHolding[]
  updatedAt: string
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

export function getCartaAuthUrl(config: CartaOAuthConfig, state: string): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: 'cap_table:read cap_table:write webhooks:write',
    state: state,
  })
  return `https://app.carta.com/api/v2/oauth/authorize?${params.toString()}`
}

export async function exchangeCartaCode(
  code: string,
  config: CartaOAuthConfig
): Promise<CartaAccessToken> {
  const response = await fetch('https://app.carta.com/api/v2/oauth/token', {
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
    throw new Error(`Carta OAuth failed: ${response.status} - ${error}`)
  }

  return response.json()
}

export async function refreshCartaToken(
  refreshToken: string,
  config: CartaOAuthConfig
): Promise<CartaAccessToken> {
  const response = await fetch('https://app.carta.com/api/v2/oauth/token', {
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
    throw new Error(`Carta token refresh failed: ${response.status} - ${error}`)
  }

  return response.json()
}

// ====================================================================
// CAP TABLE FETCH
// ====================================================================

export async function getCapTableFromCarta(
  companyId: string,
  accessToken: string,
  cartaCompanyId: string
): Promise<CartaCapTable> {
  try {
    // Fetch shareholders
    const shareholdersRes = await fetch(
      `https://app.carta.com/api/v2/companies/${cartaCompanyId}/shareholders`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    )
    if (!shareholdersRes.ok)
      throw new Error(
        `Failed to fetch Carta shareholders: ${shareholdersRes.status}`
      )

    // Fetch security classes
    const classesRes = await fetch(
      `https://app.carta.com/api/v2/companies/${cartaCompanyId}/securities`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    )
    if (!classesRes.ok)
      throw new Error(`Failed to fetch Carta security classes: ${classesRes.status}`)

    // Fetch holdings
    const holdingsRes = await fetch(
      `https://app.carta.com/api/v2/companies/${cartaCompanyId}/holdings`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    )
    if (!holdingsRes.ok)
      throw new Error(`Failed to fetch Carta holdings: ${holdingsRes.status}`)

    const [shareholders, securityClasses, holdings] = await Promise.all([
      shareholdersRes.json(),
      classesRes.json(),
      holdingsRes.json(),
    ])

    return {
      shareholders,
      securityClasses,
      holdings,
      updatedAt: new Date().toISOString(),
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    throw new Error(`getCapTableFromCarta failed: ${msg}`)
  }
}

// ====================================================================
// CAP TABLE SYNC (One-Way: Carta → IPOReady)
// ====================================================================

export async function syncCapTableWithCarta(
  companyId: string,
  accessToken: string,
  cartaCompanyId: string,
  normalizer: (data: CartaCapTable) => NormalizedCapTableEntry[]
): Promise<{ success: boolean; rowsImported: number; errors: string[] }> {
  const errors: string[] = []

  try {
    // 1. Fetch cap table from Carta
    const cartaData = await getCapTableFromCarta(companyId, accessToken, cartaCompanyId)

    // 2. Normalize data
    const normalized = normalizer(cartaData)

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
          // Update only if not manually edited (for now, always update from Carta)
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
          // Insert new entry
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

export interface CartaWebhookPayload {
  event: string
  companyId: string
  timestamp: string
  data: Record<string, any>
}

export async function handleCartaWebhook(
  payload: CartaWebhookPayload,
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
      payload.event === 'cap_table:updated' ||
      payload.event === 'shareholder:added' ||
      payload.event === 'holding:modified'
    ) {
      console.log(`Queueing cap table re-sync for Carta company: ${payload.companyId}`)
      // TODO: Implement job queue integration (Bull, BullMQ, etc.)
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

export async function isCartaTokenValid(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch('https://app.carta.com/api/v2/companies', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    return response.ok
  } catch {
    return false
  }
}

export function getCartaErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('401')) return 'Carta token expired or invalid'
    if (error.message.includes('403')) return 'Permission denied by Carta'
    if (error.message.includes('404')) return 'Company not found in Carta'
    if (error.message.includes('429')) return 'Rate limit exceeded'
    if (error.message.includes('timeout'))
      return 'Connection timeout (Carta API may be slow)'
    return `Carta integration error: ${error.message}`
  }
  return 'Unknown Carta integration error'
}
