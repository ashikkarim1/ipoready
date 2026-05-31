import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getDocuSignAuthUrl,
  exchangeDocuSignCode,
  embedSigningFlow,
  DocuSignOAuthConfig,
} from '@/lib/integrations/docusign-client'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

const DOCUSIGN_CONFIG: DocuSignOAuthConfig = {
  clientId: process.env.DOCUSIGN_CLIENT_ID || '',
  clientSecret: process.env.DOCUSIGN_CLIENT_SECRET || '',
  redirectUri: `${process.env.NEXTAUTH_URL}/api/integrations/docusign/callback`,
  accountId: process.env.DOCUSIGN_ACCOUNT_ID || '',
  baseUrl: process.env.DOCUSIGN_BASE_URL || 'https://demo.docusign.net',
}

/**
 * GET /api/integrations/docusign
 * Initiate DocuSign OAuth flow
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const companyId = (session?.user as any)?.companyId

    if (!session || !companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate config
    if (!DOCUSIGN_CONFIG.clientId || !DOCUSIGN_CONFIG.clientSecret) {
      return NextResponse.json(
        { error: 'DocuSign integration not configured' },
        { status: 500 }
      )
    }

    // Generate state for CSRF protection
    const state = generateRandomString(32)

    const authUrl = getDocuSignAuthUrl(DOCUSIGN_CONFIG, state)

    return NextResponse.json({ authUrl, state }, {
      headers: { 'Cache-Control': 'private, no-store' },
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: `Failed to initiate DocuSign OAuth: ${msg}` },
      { status: 500 }
    )
  }
}

/**
 * POST /api/integrations/docusign/callback
 * Handle DocuSign OAuth callback
 * 
 * Request: { code: string, state: string }
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
        { error: 'Missing code' },
        { status: 400 }
      )
    }

    // Exchange code for access token
    const token = await exchangeDocuSignCode(code, DOCUSIGN_CONFIG)

    // Store integration credentials
    await sql`
      INSERT INTO company_integrations (company_id, integration_id, status, metadata, connected_at)
      VALUES (
        ${companyId},
        'docusign',
        'connected',
        ${{ accessToken: token.access_token, refreshToken: token.refresh_token }},
        NOW()
      )
      ON CONFLICT (company_id, integration_id) DO UPDATE SET
        status = 'connected',
        metadata = EXCLUDED.metadata,
        connected_at = NOW()
    `

    return NextResponse.json({
      success: true,
      message: 'DocuSign integration connected',
    }, {
      headers: { 'Cache-Control': 'private, no-store' },
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: `Failed to complete DocuSign OAuth: ${msg}` },
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

/**
 * POST /api/integrations/docusign/signing
 * Create an embedded cap table certification signing flow
 * 
 * Request: {
 *   signerEmail: string,
 *   signerName: string,
 *   templateName?: string (default: "Cap Table Certification")
 * }
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const companyId = (session?.user as any)?.companyId

    if (!session || !companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      signerEmail,
      signerName,
      templateName = 'Cap Table Certification',
    } = body

    if (!signerEmail || !signerName) {
      return NextResponse.json(
        { error: 'Missing signerEmail or signerName' },
        { status: 400 }
      )
    }

    // Get stored DocuSign token
    const integration = await sql`
      SELECT metadata FROM company_integrations
      WHERE company_id = ${companyId} AND integration_id = 'docusign'
      LIMIT 1
    ` as Array<{ metadata: Record<string, any> }>

    if (integration.length === 0) {
      return NextResponse.json(
        { error: 'DocuSign integration not connected' },
        { status: 400 }
      )
    }

    const metadata = integration[0].metadata
    const accessToken = metadata.accessToken

    // Get company name
    const company = await sql`
      SELECT name FROM companies WHERE id = ${companyId} LIMIT 1
    ` as Array<{ name: string }>

    const companyName = company[0]?.name || 'Unknown Company'

    // Create embedded signing URL
    const returnUrl = `${process.env.NEXTAUTH_URL}/cap-table/certify/complete`
    const signingUrl = await embedSigningFlow(
      DOCUSIGN_CONFIG,
      accessToken,
      templateName,
      signerEmail,
      signerName,
      companyName,
      returnUrl
    )

    return NextResponse.json(signingUrl, {
      headers: { 'Cache-Control': 'private, no-store' },
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: `Failed to create signing flow: ${msg}` },
      { status: 500 }
    )
  }
}
