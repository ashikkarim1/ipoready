import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

interface FinancialAccount {
  id: string
  provider: 'quickbooks' | 'xero'
  accountName: string
  status: 'connected' | 'disconnected' | 'syncing' | 'error'
  connectedAt: string | null
  lastSyncAt: string | null
  nextSyncAt: string | null
  syncError?: string
  lastSyncStatus: 'success' | 'failed' | 'partial'
  dataFreshness: 'realtime' | 'recent' | 'stale' | 'unknown'
}

export async function GET() {
  const session = await getServerSession(authOptions)
  const companyId = (session?.user as any)?.companyId

  if (!session || !companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Mock data - in production, this would query the database
  const accounts: FinancialAccount[] = [
    {
      id: 'qb-001',
      provider: 'quickbooks',
      accountName: 'TechCorp Inc. - Main Account',
      status: 'connected',
      connectedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      lastSyncAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      nextSyncAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      lastSyncStatus: 'success',
      dataFreshness: 'realtime',
    },
  ]

  return NextResponse.json(
    { accounts },
    { headers: { 'Cache-Control': 'private, no-store' } }
  )
}
