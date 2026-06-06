import { NextRequest, NextResponse } from 'next/server'
import { getAuthorizationUrl } from '@/lib/cloud-storage/google-drive-adapter'

export const runtime = 'nodejs'

/**
 * GET /api/auth/google-drive
 * Redirects user to Google OAuth2 consent screen
 */
export async function GET(request: NextRequest) {
  try {
    const redirectUrl = getAuthorizationUrl()
    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error('Google Drive auth error:', error)
    return NextResponse.json({
      error: 'Failed to initialize Google Drive authentication',
    }, { status: 500 })
  }
}
