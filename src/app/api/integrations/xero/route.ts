/**
 * Xero Integration API Routes
 * GET: Initiate OAuth flow
 * POST: Sync financial data
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { XeroIntegrationService } from '@/lib/integrations/xero'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

const XERO_CONFIG = {
  clientId: process.env.XERO_CLIENT_ID || '',
  clientSecret: process.env.XERO_CLIENT_SECRET || '',
  redirectUri: `${process.env.NEXTAUTH_URL}/api/integrations/xero/callback`,
}

/**
 * GET /api/integrations/xero
 * Initiate Xero OAuth flow
 * Returns: { authUrl: string, state: string }
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const companyId = (session?.user as any)?.companyId

    if (!session || !companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate config
    if (!XERO_CONFIG.clientId || !XERO_CONFIG.clientSecret) {
      return NextResponse.json(
        { error: 'Xero integration not configured' },
        { status: 500 }
      )
    }

    // Generate state for CSRF protection
    const state = generateRandomString(32)

    const service = new XeroIntegrationService(XERO_CONFIG)
    const authUrl = service.generateAuthUrl(state)

    return NextResponse.json({ authUrl, state }, {
      headers: { 'Cache-Control': 'private, no-store' },
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: `Failed to initiate Xero OAuth: ${msg}` },
      { status: 500 }
    )
  }
}

/**
 * POST /api/integrations/xero
 * Sync financial data from Xero
 * Request: { syncType?: 'full' | 'incremental' | 'balance_sheet_only' | 'invoices_only' }
 * Returns: { syncId: string, status: string }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const companyId = (session?.user as any)?.companyId

    if (!session || !companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { syncType = 'incremental' } = body

    // Get integration
    const integrations = await sql`
      SELECT * FROM accounting_integrations
      WHERE company_id = ${companyId} AND platform = 'xero'
      LIMIT 1
    ` as any[]

    if (!integrations.length) {
      return NextResponse.json(
        { error: 'Xero not connected' },
        { status: 400 }
      )
    }

    const integration = integrations[0]

    // Start sync
    const service = new XeroIntegrationService(XERO_CONFIG)
    const syncRecord = await service.startSync(integration.id, syncType)

    // Fetch financial data in background
    if (process.env.NODE_ENV === 'production') {
      // In production, trigger background job here
      console.log(`Started sync ${syncRecord.id} for Xero`)
    } else {
      // In development, fetch data synchronously
      try {
        const tenantId = integration.realm_id || (integration.metadata as any)?.tenant_id
        const data = await service.fetchFinancialData(
          integration.id,
          integration.access_token_encrypted,
          tenantId,
          syncType
        )

        // Update sync record with data
        await sql`
          UPDATE accounting_syncs
          SET status = 'completed', records_synced = ${Object.values(data).flat().length}
          WHERE id = ${syncRecord.id}
        `
      } catch (error) {
        console.error('Sync failed:', error)
        const msg = error instanceof Error ? error.message : String(error)
        await sql`
          UPDATE accounting_syncs
          SET status = 'failed', last_error = ${msg}
          WHERE id = ${syncRecord.id}
        `
      }
    }

    return NextResponse.json({
      syncId: syncRecord.id,
      status: 'in_progress',
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: `Failed to start sync: ${msg}` },
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
