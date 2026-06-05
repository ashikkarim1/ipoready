import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import type { IntegrationStatusResponse, IntegrationStatusItem } from '@/types/integrations'

export const dynamic = 'force-dynamic'

/**
 * Get status of all integrations for the current company
 * Returns which integrations are connected and last sync times
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as { id?: string; companyId?: string } | undefined

    if (!session || !user?.companyId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all connected integrations for this company
    const credentials = await sql`
      SELECT
        integration_type as "integrationType",
        provider_account_id as "providerAccountId",
        connected_at as "connectedAt",
        last_synced_at as "lastSyncedAt",
        is_active as "isActive"
      FROM integration_credentials
      WHERE company_id = ${user.companyId}
      ORDER BY connected_at DESC
    `

    // Map to response format
    const integrations: IntegrationStatusItem[] = credentials.map((cred: any) => ({
      integrationType: cred.integrationType,
      isConnected: cred.isActive,
      providerAccountId: cred.providerAccountId,
      connectedAt: cred.connectedAt,
      lastSyncedAt: cred.lastSyncedAt,
      status: cred.isActive ? 'connected' : 'disconnected',
    }))

    const response: IntegrationStatusResponse = {
      integrations,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Get integration status error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch integration status' },
      { status: 500 }
    )
  }
}
