/**
 * Disconnect Accounting Integration
 * POST /api/integrations/financial/disconnect
 * Disconnect QuickBooks or Xero integration
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { QuickBooksIntegrationService } from '@/lib/integrations/quickbooks'
import { XeroIntegrationService } from '@/lib/integrations/xero'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

const QB_CONFIG = {
  clientId: process.env.QUICKBOOKS_CLIENT_ID || '',
  clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET || '',
  redirectUri: `${process.env.NEXTAUTH_URL}/api/integrations/quickbooks/callback`,
}

const XERO_CONFIG = {
  clientId: process.env.XERO_CLIENT_ID || '',
  clientSecret: process.env.XERO_CLIENT_SECRET || '',
  redirectUri: `${process.env.NEXTAUTH_URL}/api/integrations/xero/callback`,
}

/**
 * POST /api/integrations/financial/disconnect
 * Disconnect an accounting integration
 * Request: { platform: 'quickbooks' | 'xero' }
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
    const { platform } = body

    if (!platform || !['quickbooks', 'xero'].includes(platform)) {
      return NextResponse.json(
        { error: 'Invalid or missing platform' },
        { status: 400 }
      )
    }

    // Get integration
    const integrations = await sql`
      SELECT id, platform
      FROM accounting_integrations
      WHERE company_id = ${companyId} AND platform = ${platform}
      LIMIT 1
    ` as any[]

    if (!integrations.length) {
      return NextResponse.json(
        { error: `${platform} not connected` },
        { status: 400 }
      )
    }

    const integration = integrations[0]

    // Disconnect using platform-specific service
    if (platform === 'quickbooks') {
      const qbService = new QuickBooksIntegrationService(QB_CONFIG)
      await qbService.disconnect(integration.id)
    } else if (platform === 'xero') {
      const xeroService = new XeroIntegrationService(XERO_CONFIG)
      await xeroService.disconnect(integration.id)
    }

    return NextResponse.json({
      success: true,
      message: `${platform} integration disconnected`,
      platform,
    }, {
      headers: { 'Cache-Control': 'private, no-store' },
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Disconnect error:', msg)

    return NextResponse.json(
      { error: `Failed to disconnect: ${msg}` },
      { status: 500 }
    )
  }
}

