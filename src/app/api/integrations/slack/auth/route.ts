/**
 * Slack OAuth Callback Handler
 * Handles OAuth redirect from Slack app installation
 * GET /api/integrations/slack/auth?code=...&state=...
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getSlackOAuthConfig,
  exchangeOAuthCode,
  storeSlackConnection,
} from '@/lib/integrations/slack'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    // Validate OAuth code
    if (!code) {
      return NextResponse.json(
        { error: 'Missing authorization code' },
        { status: 400 }
      )
    }

    // Verify session
    const session = await getServerSession(authOptions)
    const user = session?.user as { id?: string; companyId?: string } | undefined

    if (!session || !user?.companyId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const companyId = user.companyId

    // Exchange code for bot token
    const config = getSlackOAuthConfig()
    const exchangeResult = await exchangeOAuthCode(code, config)

    if (!exchangeResult.success || !exchangeResult.botToken) {
      console.error('[slack auth] Exchange failed:', exchangeResult.error)
      return NextResponse.json(
        { error: exchangeResult.error || 'OAuth exchange failed' },
        { status: 400 }
      )
    }

    // Store connection
    const storeResult = await storeSlackConnection(companyId, {
      botToken: exchangeResult.botToken,
      workspaceId: exchangeResult.workspaceId || '',
      workspaceName: exchangeResult.workspaceName || '',
      botUserId: exchangeResult.botUserId || '',
      teamId: exchangeResult.teamId || '',
      appId: exchangeResult.appId || '',
      scopes: exchangeResult.scopes || [],
    })

    if (!storeResult.success) {
      console.error('[slack auth] Store failed:', storeResult.error)
      return NextResponse.json(
        { error: storeResult.error || 'Failed to store connection' },
        { status: 500 }
      )
    }

    // Redirect to settings page with success message
    const redirectUrl = new URL('/dashboard/settings/integrations', request.url)
    redirectUrl.searchParams.set('slack', 'connected')
    redirectUrl.searchParams.set('workspace', exchangeResult.workspaceName || '')

    return NextResponse.redirect(redirectUrl)
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[slack auth] Error:', errorMsg)

    const redirectUrl = new URL('/dashboard/settings/integrations', request.url)
    redirectUrl.searchParams.set('slack', 'error')
    redirectUrl.searchParams.set('message', errorMsg)

    return NextResponse.redirect(redirectUrl)
  }
}
