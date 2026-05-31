/**
 * CSRF (Cross-Site Request Forgery) Protection Middleware
 * Validates CSRF tokens on all state-changing requests (POST, PUT, DELETE, PATCH)
 *
 * Required for GDPR/PIPEDA compliance and security best practices
 */

import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

const CSRF_TOKEN_KEY = 'csrf_token'
const CSRF_TOKEN_HEADER = 'x-csrf-token'
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours

// In-memory store for CSRF tokens (use Redis in production)
// Map<token, { issuedAt: number, sessionId: string }>
const csrfTokenStore = new Map<string, { issuedAt: number; sessionId: string }>()

/**
 * Generate a new CSRF token
 */
export function generateCsrfToken(): string {
  const token = randomBytes(32).toString('hex')
  csrfTokenStore.set(token, {
    issuedAt: Date.now(),
    sessionId: randomBytes(16).toString('hex'),
  })

  // Clean up old tokens
  cleanupExpiredTokens()

  return token
}

/**
 * Validate a CSRF token
 */
export function validateCsrfToken(token: string): boolean {
  const tokenData = csrfTokenStore.get(token)

  if (!tokenData) {
    console.warn(`CSRF validation failed: token not found`)
    return false
  }

  // Check if token has expired
  if (Date.now() - tokenData.issuedAt > TOKEN_EXPIRY) {
    console.warn(`CSRF validation failed: token expired`)
    csrfTokenStore.delete(token)
    return false
  }

  // Token is valid; remove it (one-time use)
  csrfTokenStore.delete(token)
  return true
}

/**
 * Clean up expired tokens from store
 */
function cleanupExpiredTokens() {
  const now = Date.now()
  for (const [token, data] of csrfTokenStore.entries()) {
    if (now - data.issuedAt > TOKEN_EXPIRY) {
      csrfTokenStore.delete(token)
    }
  }
}

/**
 * CSRF Protection Middleware
 * Add to API routes that modify data
 */
export async function validateCsrfMiddleware(req: NextRequest): Promise<NextResponse | null> {
  // Only validate on state-changing requests
  const method = req.method.toUpperCase()
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    return null // No validation needed for GET, HEAD, OPTIONS
  }

  // Whitelist endpoints that don't need CSRF protection
  const path = req.nextUrl.pathname
  const whitelistPaths = [
    '/api/auth', // NextAuth endpoints
    '/api/webhooks', // Stripe webhooks (use signature verification instead)
    '/api/health', // Health check
  ]

  if (whitelistPaths.some((p) => path.startsWith(p))) {
    return null // Skip CSRF validation for whitelisted paths
  }

  // Get CSRF token from request headers
  const token = req.headers.get(CSRF_TOKEN_HEADER)

  if (!token) {
    console.warn(`CSRF token missing for ${method} ${path}`)
    return NextResponse.json(
      { error: 'CSRF token missing' },
      { status: 403 }
    )
  }

  // Validate token
  if (!validateCsrfToken(token)) {
    console.warn(`CSRF token validation failed for ${method} ${path}`)
    return NextResponse.json(
      { error: 'Invalid or expired CSRF token' },
      { status: 403 }
    )
  }

  // Token is valid, proceed
  return null
}

/**
 * Add CSRF token to response headers
 * Call this on GET requests that return forms
 */
export function addCsrfTokenToResponse(response: NextResponse): NextResponse {
  const token = generateCsrfToken()
  response.headers.set(CSRF_TOKEN_HEADER, token)
  return response
}

/**
 * Get CSRF token status (for debugging)
 */
export function getCsrfTokenStats() {
  return {
    activeTokens: csrfTokenStore.size,
    timestamp: new Date().toISOString(),
  }
}
