import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getCartaAuthUrl, exchangeCartaCode, syncCapTableWithCarta } from '@/lib/integrations/carta-client'
import { normalizeCartaData } from '@/lib/integrations/data-normalizer'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

const CARTA_CONFIG = {
  clientId: process.env.CARTA_CLIENT_ID || '',
  clientSecret: process.env.CARTA_CLIENT_SECRET || '',
  redirectUri: `${process.env.NEXTAUTH_URL}/api/integrations/carta/callback`,
}

/**
 * GET /api/integrations/carta
 * Initiate Carta OAuth flow
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const companyId = (session?.user as any)?.companyId

    if (!session || !companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate config
    if (!CARTA_CONFIG.clientId || !CARTA_CONFIG.clientSecret) {
      return NextResponse.json(
        { error: 'Carta integration not configured' },
        { status: 500 }
      )
    }

    // Generate state for CSRF protection
    const state = generateRandomString(32)

    // Store state in session (in production, use secure session storage)
    // For now, we'll return the auth URL

    const authUrl = getCartaAuthUrl(CARTA_CONFIG, state)

    return NextResponse.json({ authUrl, state }, {
      headers: { 'Cache-Control': 'private, no-store' },
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: `Failed to initiate Carta OAuth: ${msg}` },
      { status: 500 }
    )
  }
}

/**
 * POST /api/integrations/carta/callback
 * Handle Carta OAuth callback
 * 
 * Request: { code: string, state: string, cartaCompanyId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const companyId = (session?.user as any)?.companyId

    if (!session || !companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { code, cartaCompanyId } = body

    if (!code || !cartaCompanyId) {
      return NextResponse.json(
        { error: 'Missing code or cartaCompanyId' },
        { status: 400 }
      )
    }

    // Exchange code for access token
    const token = await exchangeCartaCode(code, CARTA_CONFIG)

    // Store integration credentials
    await sql`
      INSERT INTO company_integrations (company_id, integration_id, status, metadata, connected_at)
      VALUES (
        ${companyId},
        'carta',
        'connected',
        ${{ cartaCompanyId, accessToken: token.access_token, refreshToken: token.refresh_token }},
        NOW()
      )
      ON CONFLICT (company_id, integration_id) DO UPDATE SET
        status = 'connected',
        metadata = EXCLUDED.metadata,
        connected_at = NOW()
    `

    // Trigger initial cap table sync
    const result = await syncCapTableWithCarta(
      companyId,
      token.access_token,
      cartaCompanyId,
      normalizeCartaData
    )

    return NextResponse.json({
      success: true,
      message: 'Carta integration connected',
      rowsImported: result.rowsImported,
      errors: result.errors,
    }, {
      headers: { 'Cache-Control': 'private, no-store' },
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: `Failed to complete Carta OAuth: ${msg}` },
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
