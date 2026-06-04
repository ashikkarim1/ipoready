/**
 * GET /api/integrations/docusign/callback
 * OAuth2 callback handler - exchanges authorization code for access token
 *
 * Query params: { code: string; state: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import {
  exchangeOAuthCode,
  getDocuSignUserInfo,
  saveDocuSignAccount,
} from '@/lib/integrations/docusign'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  if (!code || !state) {
    return NextResponse.json(
      { error: 'Missing code or state parameter' },
      { status: 400 }
    )
  }

  const clientId = process.env.DOCUSIGN_CLIENT_ID
  const clientSecret = process.env.DOCUSIGN_CLIENT_SECRET
  const redirectUri = process.env.DOCUSIGN_REDIRECT_URI

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json(
      { error: 'DocuSign not configured' },
      { status: 500 }
    )
  }

  try {
    // Verify state and get company info
    const stateRows = await sql`
      SELECT company_id, user_id, environment FROM docusign_oauth_states
      WHERE state = ${state} AND expires_at > NOW()
      LIMIT 1
    ` as any[]

    if (stateRows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired state' },
        { status: 400 }
      )
    }

    const stateData = stateRows[0]
    const companyId = stateData.company_id
    const environment = stateData.environment

    // Exchange code for tokens
    const tokens = await exchangeOAuthCode(
      code,
      clientId,
      clientSecret,
      redirectUri,
      environment
    )

    // Get user info
    const userInfo = await getDocuSignUserInfo(tokens.accessToken, environment)

    // Save account
    await saveDocuSignAccount(companyId, tokens, userInfo, environment)

    // Mark state as used
    await sql`
      UPDATE docusign_oauth_states
      SET used = TRUE, used_at = NOW()
      WHERE state = ${state}
    `

    // Create success response with redirect
    const redirectUrl = new URL('/dashboard/integrations/docusign?status=success', req.nextUrl.origin)
    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('DocuSign OAuth callback error:', msg)

    const errorUrl = new URL(
      `/dashboard/integrations/docusign?error=${encodeURIComponent(msg)}`,
      req.nextUrl.origin
    )
    return NextResponse.redirect(errorUrl)
  }
}
