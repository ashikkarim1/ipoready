/**
 * Google Drive OAuth Callback Handler
 * Handles OAuth redirect from Google authorization
 * GET /api/integrations/google-drive/auth?code=...&state=...
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getGoogleDriveOAuthConfig,
  exchangeAuthCodeForTokens,
  getUserInfo,
  storeGoogleDriveConnection,
  cacheGoogleToken,
} from '@/lib/integrations/google-drive'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Check for OAuth errors from Google
    if (error) {
      const errorDescription = searchParams.get('error_description') || error
      const redirectUrl = new URL(
        '/dashboard/settings/integrations',
        request.url
      )
      redirectUrl.searchParams.set('google_drive', 'error')
      redirectUrl.searchParams.set('message', errorDescription)
      return NextResponse.redirect(redirectUrl)
    }

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

    if (!session || !user?.companyId || !user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const companyId = user.companyId
    const userId = user.id

    // Get OAuth config
    const config = getGoogleDriveOAuthConfig()
    if (!config.clientId || !config.clientSecret) {
      return NextResponse.json(
        { error: 'Google Drive OAuth not configured' },
        { status: 500 }
      )
    }

    // Exchange code for tokens
    const tokenResult = await exchangeAuthCodeForTokens(code, config)
    if (!tokenResult.success || !tokenResult.tokens) {
      console.error('[google-drive auth] Token exchange failed:', tokenResult.error)
      const redirectUrl = new URL(
        '/dashboard/settings/integrations',
        request.url
      )
      redirectUrl.searchParams.set('google_drive', 'error')
      redirectUrl.searchParams.set(
        'message',
        tokenResult.error || 'Token exchange failed'
      )
      return NextResponse.redirect(redirectUrl)
    }

    const tokens = tokenResult.tokens

    // Get user info
    const userInfoResult = await getUserInfo(tokens.access_token)
    if (!userInfoResult.success || !userInfoResult.userInfo) {
      console.error('[google-drive auth] User info fetch failed:', userInfoResult.error)
      const redirectUrl = new URL(
        '/dashboard/settings/integrations',
        request.url
      )
      redirectUrl.searchParams.set('google_drive', 'error')
      redirectUrl.searchParams.set(
        'message',
        userInfoResult.error || 'Failed to fetch user information'
      )
      return NextResponse.redirect(redirectUrl)
    }

    const userInfo = userInfoResult.userInfo

    // Store connection
    const expiresAt = new Date(Date.now() + (tokens.expires_in || 3600) * 1000)
    const connectionResult = await storeGoogleDriveConnection(
      companyId,
      userId,
      {
        googleUserId: userInfo.id,
        email: userInfo.email,
        displayName: userInfo.name,
        profilePictureUrl: userInfo.picture,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: expiresAt.toISOString(),
        scopes: tokens.scope.split(' '),
      }
    )

    if (!connectionResult.success) {
      console.error('[google-drive auth] Store connection failed:', connectionResult.error)
      const redirectUrl = new URL(
        '/dashboard/settings/integrations',
        request.url
      )
      redirectUrl.searchParams.set('google_drive', 'error')
      redirectUrl.searchParams.set(
        'message',
        connectionResult.error || 'Failed to store connection'
      )
      return NextResponse.redirect(redirectUrl)
    }

    // Cache token separately
    const cacheResult = await cacheGoogleToken(
      companyId,
      userId,
      tokens,
      userInfo.id
    )

    if (!cacheResult.success) {
      console.warn('[google-drive auth] Token cache failed:', cacheResult.error)
      // Non-critical, continue
    }

    // Redirect to settings page with success message
    const redirectUrl = new URL(
      '/dashboard/settings/integrations',
      request.url
    )
    redirectUrl.searchParams.set('google_drive', 'connected')
    redirectUrl.searchParams.set('account', userInfo.email)

    return NextResponse.redirect(redirectUrl)
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[google-drive auth] Error:', errorMsg)

    const redirectUrl = new URL(
      '/dashboard/settings/integrations',
      request.url
    )
    redirectUrl.searchParams.set('google_drive', 'error')
    redirectUrl.searchParams.set('message', errorMsg)

    return NextResponse.redirect(redirectUrl)
  }
}
