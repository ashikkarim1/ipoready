/**
 * CSRF Token Endpoint
 * Issues fresh CSRF tokens to authenticated users
 *
 * GET /api/csrf → Returns { csrf_token: string }
 * Sets HTTP-only cookie with token seed
 *
 * Used by client-side CSRF manager to fetch tokens before state-changing requests
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateCsrfToken, addCsrfTokenToResponse } from '@/lib/middleware/csrf'

export const dynamic = 'force-dynamic'

/**
 * GET /api/csrf
 * Issues a new CSRF token
 *
 * Response:
 *   { csrf_token: string }
 *
 * Also sets HTTP-only __csrf cookie with base64-encoded token
 */
export async function GET(req: NextRequest) {
  try {
    // Verify user is authenticated
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - authentication required' },
        { status: 401 }
      )
    }

    // Generate CSRF token
    const { token, cookieValue } = generateCsrfToken(req)

    // Create response with token in body
    const response = NextResponse.json(
      { csrf_token: token },
      { status: 200 }
    )

    // Add token cookie
    addCsrfTokenToResponse(response, token, cookieValue)

    // Add cache headers to prevent token from being served from cache
    response.headers.set('Cache-Control', 'private, no-store, no-cache, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')

    return response
  } catch (error) {
    console.error('[CSRF] Error in GET /api/csrf:', error)
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS(req: NextRequest) {
  return NextResponse.json(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  })
}
