import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getPulleyAuthUrl, exchangePulleyCode, syncCapTableWithPulley } from '@/lib/integrations/pulley-client'
import { normalizePulleyData } from '@/lib/integrations/data-normalizer'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

const PULLEY_CONFIG = {
  clientId: process.env.PULLEY_CLIENT_ID || '',
  clientSecret: process.env.PULLEY_CLIENT_SECRET || '',
  redirectUri: `${process.env.NEXTAUTH_URL}/api/integrations/pulley/callback`,
}

/**
 * GET /api/integrations/pulley
 * Initiate Pulley OAuth flow
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const companyId = (session?.user as any)?.companyId

    if (!session || !companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate config
    if (!PULLEY_CONFIG.clientId || !PULLEY_CONFIG.clientSecret) {
      return NextResponse.json(
        { error: 'Pulley integration not configured' },
        { status: 500 }
      )
    }

    // Generate state for CSRF protection
    const state = generateRandomString(32)

    const authUrl = getPulleyAuthUrl(PULLEY_CONFIG, state)

    return NextResponse.json({ authUrl, state }, {
      headers: { 'Cache-Control': 'private, no-store' },
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: `Failed to initiate Pulley OAuth: ${msg}` },
      { status: 500 }
    )
  }
}

/**
 * POST /api/integrations/pulley/callback
 * Handle Pulley OAuth callback
 * 
 * Request: { code: string, state: string, pulleyCompanyId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const companyId = (session?.user as any)?.companyId

    if (!session || !companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { code, pulleyCompanyId } = body

    if (!code || !pulleyCompanyId) {
      return NextResponse.json(
        { error: 'Missing code or pulleyCompanyId' },
        { status: 400 }
      )
    }

    // Exchange code for access token
    const token = await exchangePulleyCode(code, PULLEY_CONFIG)

    // Store integration credentials
    await sql`
      INSERT INTO company_integrations (company_id, integration_id, status, metadata, connected_at)
      VALUES (
        ${companyId},
        'pulley',
        'connected',
        ${{ pulleyCompanyId, accessToken: token.access_token, refreshToken: token.refresh_token }},
        NOW()
      )
      ON CONFLICT (company_id, integration_id) DO UPDATE SET
        status = 'connected',
        metadata = EXCLUDED.metadata,
        connected_at = NOW()
    `

    // Trigger initial cap table sync
    const result = await syncCapTableWithPulley(
      companyId,
      token.access_token,
      pulleyCompanyId,
      normalizePulleyData
    )

    return NextResponse.json({
      success: true,
      message: 'Pulley integration connected',
      rowsImported: result.rowsImported,
      errors: result.errors,
    }, {
      headers: { 'Cache-Control': 'private, no-store' },
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: `Failed to complete Pulley OAuth: ${msg}` },
      { status: 500 }
    )
  }
}

function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
