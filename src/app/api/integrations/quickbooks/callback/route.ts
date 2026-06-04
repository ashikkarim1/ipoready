/**
 * QuickBooks OAuth Callback
 * POST /api/integrations/quickbooks/callback
 * Handles OAuth redirect and stores access tokens
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { QuickBooksIntegrationService } from '@/lib/integrations/quickbooks'

export const dynamic = 'force-dynamic'

const QB_CONFIG = {
  clientId: process.env.QUICKBOOKS_CLIENT_ID || '',
  clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET || '',
  redirectUri: `${process.env.NEXTAUTH_URL}/api/integrations/quickbooks/callback`,
}

/**
 * POST /api/integrations/quickbooks/callback
 * Handle OAuth callback with authorization code and realm ID
 * Request: { code: string, realmId: string, state?: string }
 * Returns: { success: boolean, message: string }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const companyId = (session?.user as any)?.companyId

    if (!session || !companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { code, realmId } = body

    if (!code || !realmId) {
      return NextResponse.json(
        { error: 'Missing code or realmId' },
        { status: 400 }
      )
    }

    // Exchange code for tokens and store integration
    const service = new QuickBooksIntegrationService(QB_CONFIG)
    const integration = await service.handleOAuthCallback(
      code,
      realmId,
      companyId
    )

    return NextResponse.json({
      success: true,
      message: 'QuickBooks integration connected',
      integrationId: integration.id,
    }, {
      headers: { 'Cache-Control': 'private, no-store' },
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('QuickBooks callback error:', msg)

    return NextResponse.json(
      { error: `Failed to complete QuickBooks OAuth: ${msg}` },
      { status: 500 }
    )
  }
}
