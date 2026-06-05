import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import type { IntegrationType } from '@/types/integrations'
import { INTEGRATION_TYPES } from '@/types/integrations'

export const dynamic = 'force-dynamic'

interface CallbackParams {
  provider: string
}

/**
 * OAuth callback handler for third-party integrations
 * Called by provider after user authorizes the app
 *
 * TODO(OAuth): Implement OAuth flow for each provider
 * - Validate state parameter (CSRF protection)
 * - Exchange authorization code for access token
 * - Store encrypted token in integration_credentials table
 * - Log successful connection in audit log
 * - Handle errors and rejections
 */
export async function POST(
  request: NextRequest,
  { params }: { params: CallbackParams }
) {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as { id?: string; companyId?: string } | undefined

    if (!session || !user?.companyId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const provider = params.provider.toLowerCase()

    // Validate provider
    if (!INTEGRATION_TYPES.includes(provider as IntegrationType)) {
      return NextResponse.json(
        { error: 'Invalid integration provider' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { code, state, error, error_description } = body

    // Handle provider errors
    if (error) {
      return NextResponse.json(
        { error: error_description || error },
        { status: 400 }
      )
    }

    if (!code || !state) {
      return NextResponse.json(
        { error: 'Missing authorization code or state parameter' },
        { status: 400 }
      )
    }

    // TODO(OAuth): Validate state parameter against session/cache
    // const storedState = getStoredState(user.companyId, provider)
    // if (state !== storedState) {
    //   return NextResponse.json({ error: 'Invalid state parameter' }, { status: 400 })
    // }

    // TODO(OAuth): Exchange code for access token based on provider
    // Example structure:
    // const accessToken = await exchangeCodeForToken(provider, code, {
    //   redirectUri: process.env.OAUTH_REDIRECT_URI,
    //   clientId: process.env[`${provider.toUpperCase()}_CLIENT_ID`],
    //   clientSecret: process.env[`${provider.toUpperCase()}_CLIENT_SECRET`],
    // })

    // TODO(OAuth): Encrypt and store token
    // const encryptedToken = encryptToken(accessToken.access_token)
    // await sql`
    //   INSERT INTO integration_credentials (
    //     company_id, integration_type, provider_account_id, access_token,
    //     refresh_token, token_expires_at, is_active
    //   ) VALUES (${user.companyId}, ${provider}, ${accessToken.account_id}, ${encryptedToken},
    //             ${accessToken.refresh_token}, ${accessToken.expires_at}, true)
    //   ON CONFLICT (company_id, integration_type) DO UPDATE SET
    //     provider_account_id = ${accessToken.account_id},
    //     access_token = ${encryptedToken},
    //     refresh_token = ${accessToken.refresh_token},
    //     token_expires_at = ${accessToken.expires_at},
    //     is_active = true,
    //     updated_at = NOW()
    // `

    // TODO(OAuth): Log successful connection in audit log
    // await sql`
    //   INSERT INTO integration_audit_log (
    //     credential_id, action, status
    //   ) SELECT id, 'connected'::integration_action, 'success'::integration_audit_status
    //   FROM integration_credentials
    //   WHERE company_id = ${user.companyId} AND integration_type = ${provider}
    // `

    return NextResponse.json({
      success: true,
      message: `${provider} integration connected successfully`,
    })
  } catch (error) {
    console.error(`Integration callback error for ${params.provider}:`, error)
    return NextResponse.json(
      { error: 'Failed to complete integration' },
      { status: 500 }
    )
  }
}
