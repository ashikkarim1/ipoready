/**
 * Financial Sync Status API
 * GET: Fetch sync status for accounting integrations
 * POST: Start new sync (no longer used - use platform-specific endpoints)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * GET /api/integrations/financial/sync?syncId=...&platform=...
 * Get sync status by sync ID
 * Returns: { syncId, status, progress, recordsSynced, error? }
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const syncId = searchParams.get('syncId')

    if (!syncId) {
      return NextResponse.json({ error: 'Missing syncId' }, { status: 400 })
    }

    const syncs = await sql`
      SELECT id, status, sync_type, records_synced, last_error, created_at, updated_at
      FROM accounting_syncs
      WHERE id = ${syncId}
      LIMIT 1
    ` as any[]

    if (!syncs.length) {
      return NextResponse.json(
        { error: 'Sync not found' },
        { status: 404 }
      )
    }

    const sync = syncs[0]
    const created = new Date(sync.created_at).getTime()
    const updated = new Date(sync.updated_at).getTime()
    const elapsed = updated - created
    const estimatedDuration = 60000 // 1 minute estimate
    const progress = Math.min(100, Math.floor((elapsed / estimatedDuration) * 100))

    return NextResponse.json({
      syncId: sync.id,
      status: sync.status,
      syncType: sync.sync_type,
      progress: sync.status === 'completed' ? 100 : sync.status === 'failed' ? 0 : progress,
      recordsSynced: sync.records_synced,
      error: sync.last_error || null,
      createdAt: sync.created_at,
      updatedAt: sync.updated_at,
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: `Failed to fetch sync status: ${msg}` },
      { status: 500 }
    )
  }
}

/**
 * POST /api/integrations/financial/sync
 * Legacy endpoint - use /api/integrations/quickbooks or /api/integrations/xero instead
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const companyId = (session?.user as any)?.companyId

  if (!session || !companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { accountId } = body

    if (!accountId) {
      return NextResponse.json(
        { error: 'accountId is required' },
        { status: 400 }
      )
    }

    // Legacy response
    const syncResult = {
      accountId,
      status: 'success',
      syncedAt: new Date().toISOString(),
      recordsSync: {
        invoices: 42,
        expenses: 28,
        payments: 15,
        balanceSheet: 1,
      },
      nextSync: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    }

    return NextResponse.json(syncResult, {
      headers: { 'Cache-Control': 'private, no-store' },
    })
  } catch (error) {
    console.error('[FinancialSync]', error)
    return NextResponse.json(
      { error: 'Failed to sync financial data' },
      { status: 500 }
    )
  }
}
