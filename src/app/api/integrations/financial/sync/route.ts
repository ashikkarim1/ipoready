import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
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

    // Mock sync operation - in production, this would call QB/Xero APIs
    // and update the database with latest financial data
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
