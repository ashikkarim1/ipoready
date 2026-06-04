/**
 * Accounting Integration Status API
 * GET /api/integrations/financial/accounts
 * List all connected accounting integrations (QB, Xero)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import { IntegrationStatusResponse } from '@/lib/types/accounting-integration'

export const dynamic = 'force-dynamic'

/**
 * GET /api/integrations/financial/accounts
 * Fetch all connected accounting integrations and their sync status
 * Returns: { accounts: IntegrationStatusResponse[] }
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const companyId = (session?.user as any)?.companyId

    if (!session || !companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all integrations for this company
    const integrations = await sql`
      SELECT
        id,
        platform,
        organization_name,
        is_active,
        sync_frequency,
        token_expires_at,
        created_at,
        updated_at
      FROM accounting_integrations
      WHERE company_id = ${companyId}
      ORDER BY created_at DESC
    ` as any[]

    // Get sync status for each integration
    const accounts: IntegrationStatusResponse[] = await Promise.all(
      integrations.map(async (integration: any) => {
        const syncs = await sql`
          SELECT id, status, created_at, updated_at
          FROM accounting_syncs
          WHERE integration_id = ${integration.id}
          ORDER BY created_at DESC
          LIMIT 1
        ` as any[]

        const lastSync = syncs.length ? syncs[0] : null
        const nextSync = lastSync
          ? new Date(new Date(lastSync.created_at).getTime() + 24 * 60 * 60 * 1000).toISOString()
          : null

        // Check token expiry
        const expiryTime = new Date(integration.token_expires_at).getTime()
        const now = Date.now()
        let error: string | undefined

        if (expiryTime < now) {
          error = 'Token expired - please reconnect'
        } else if (lastSync?.status === 'failed') {
          error = 'Last sync failed'
        }

        return {
          platform: integration.platform as 'quickbooks' | 'xero',
          connected: integration.is_active,
          organization: integration.organization_name,
          lastSync: lastSync?.updated_at || null,
          nextSync: nextSync || null,
          syncFrequency: integration.sync_frequency,
          error: error || null,
        } as IntegrationStatusResponse
      })
    )

    return NextResponse.json(
      { accounts },
      { headers: { 'Cache-Control': 'private, max-age=300' } }
    )
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Failed to fetch accounts:', msg)

    return NextResponse.json(
      { error: `Failed to fetch accounts: ${msg}` },
      { status: 500 }
    )
  }
}

