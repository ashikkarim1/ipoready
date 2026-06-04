/**
 * Xero OAuth Callback
 * POST /api/integrations/xero/callback
 * Handles OAuth redirect and stores access tokens
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { XeroIntegrationService } from '@/lib/integrations/xero'

export const dynamic = 'force-dynamic'

const XERO_CONFIG = {
  clientId: process.env.XERO_CLIENT_ID || '',
  clientSecret: process.env.XERO_CLIENT_SECRET || '',
  redirectUri: `${process.env.NEXTAUTH_URL}/api/integrations/xero/callback`,
}

/**
 * POST /api/integrations/xero/callback
 * Handle OAuth callback with authorization code
 * Request: { code: string, state?: string }
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
    const { code } = body

    if (!code) {
      return NextResponse.json(
        { error: 'Missing authorization code' },
        { status: 400 }
      )
    }

    // Exchange code for tokens and store integration
    const service = new XeroIntegrationService(XERO_CONFIG)
    const integration = await service.handleOAuthCallback(code, companyId)

    return NextResponse.json({
      success: true,
      message: 'Xero integration connected',
      integrationId: integration.id,
    }, {
      headers: { 'Cache-Control': 'private, no-store' },
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Xero callback error:', msg)

    return NextResponse.json(
      { error: `Failed to complete Xero OAuth: ${msg}` },
      { status: 500 }
    )
  }
}
