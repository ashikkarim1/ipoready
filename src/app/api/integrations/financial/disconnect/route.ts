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

    // Mock disconnect operation - in production, this would:
    // 1. Revoke OAuth tokens
    // 2. Remove account from database
    // 3. Clean up stored financial data
    const disconnectResult = {
      accountId,
      status: 'disconnected',
      disconnectedAt: new Date().toISOString(),
      message: 'Account successfully disconnected',
    }

    return NextResponse.json(disconnectResult, {
      headers: { 'Cache-Control': 'private, no-store' },
    })
  } catch (error) {
    console.error('[FinancialDisconnect]', error)
    return NextResponse.json(
      { error: 'Failed to disconnect account' },
      { status: 500 }
    )
  }
}
