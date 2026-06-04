/**
 * Financial Data & PACE Mapping API
 * GET /api/integrations/financial/data?platform=quickbooks&paceMapping=true
 * Fetch financial data from QB/Xero and optionally map to PACE™ inputs
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
 * GET /api/integrations/financial/data
 * Fetch latest financial data from QuickBooks or Xero
 * Query params:
 *   - platform: 'quickbooks' | 'xero' (required)
 *   - paceMapping: 'true' | 'false' (optional, default: true)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const companyId = (session?.user as any)?.companyId

    if (!session || !companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform') as 'quickbooks' | 'xero'
    const paceMapping = searchParams.get('paceMapping') !== 'false'

    if (!platform || !['quickbooks', 'xero'].includes(platform)) {
      return NextResponse.json(
        { error: 'Invalid or missing platform parameter' },
        { status: 400 }
      )
    }

    // Get integration
    const integrations = await sql`
      SELECT * FROM accounting_integrations
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

    // Check token expiry and refresh if needed
    const tokenExpiryTime = new Date(integration.token_expires_at).getTime()
    const now = Date.now()
    let accessToken = integration.access_token_encrypted

    if (now > tokenExpiryTime) {
      // Token expired, try to refresh
      if (platform === 'quickbooks') {
        const qbService = new QuickBooksIntegrationService(QB_CONFIG)
        const newTokens = await qbService.refreshAccessToken(integration.refresh_token_encrypted)
        accessToken = newTokens.accessToken

        // Update integration
        const newExpiry = new Date(Date.now() + newTokens.expiresIn * 1000)
        await sql`
          UPDATE accounting_integrations
          SET access_token_encrypted = ${newTokens.accessToken},
              refresh_token_encrypted = ${newTokens.refreshToken},
              token_expires_at = ${newExpiry.toISOString()}
          WHERE id = ${integration.id}
        `
      } else if (platform === 'xero') {
        const xeroService = new XeroIntegrationService(XERO_CONFIG)
        const newTokens = await xeroService.refreshAccessToken(integration.refresh_token_encrypted)
        accessToken = newTokens.accessToken

        // Update integration
        const newExpiry = new Date(Date.now() + newTokens.expiresIn * 1000)
        await sql`
          UPDATE accounting_integrations
          SET access_token_encrypted = ${newTokens.accessToken},
              refresh_token_encrypted = ${newTokens.refreshToken},
              token_expires_at = ${newExpiry.toISOString()}
          WHERE id = ${integration.id}
        `
      }
    }

    let financialData: any
    let paceInputs: any = null

    if (platform === 'quickbooks') {
      const qbService = new QuickBooksIntegrationService(QB_CONFIG)
      financialData = await qbService.fetchFinancialData(
        integration.id,
        accessToken,
        integration.realm_id,
        'full'
      )

      if (paceMapping) {
        paceInputs = qbService.mapToPACEInputs(financialData)
      }
    } else if (platform === 'xero') {
      const xeroService = new XeroIntegrationService(XERO_CONFIG)
      const tenantId = integration.realm_id || (integration.metadata as any)?.tenant_id
      financialData = await xeroService.fetchFinancialData(
        integration.id,
        accessToken,
        tenantId,
        'full'
      )

      if (paceMapping) {
        paceInputs = xeroService.mapToPACEInputs(financialData)
      }
    }

    return NextResponse.json({
      platform,
      integrationId: integration.id,
      financialData,
      paceInputs,
      lastFetched: new Date().toISOString(),
    }, {
      headers: { 'Cache-Control': 'private, max-age=300' },
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Financial data fetch error:', msg)

    return NextResponse.json(
      { error: `Failed to fetch financial data: ${msg}` },
      { status: 500 }
    )
  }
}

