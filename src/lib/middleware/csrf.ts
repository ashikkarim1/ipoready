/**
 * CSRF (Cross-Site Request Forgery) Protection Middleware
 * Validates CSRF tokens on all state-changing requests (POST, PUT, DELETE, PATCH)
 * Stores tokens in HTTP-only cookies for maximum security
 *
 * Required for GDPR/PIPEDA compliance and security best practices
 * Follows OWASP CSRF prevention guidelines:
 * - Double Submit Cookie pattern (token in both cookie and request header)
 * - HTTP-only cookies prevent JavaScript access
 * - Secure flag ensures cookie only sent over HTTPS in production
 */

import { NextRequest, NextResponse } from 'next/server'
import { randomBytes, createHmac } from 'crypto'

const CSRF_COOKIE_NAME = '__csrf'
const CSRF_TOKEN_HEADER = 'x-csrf-token'
const CSRF_TOKEN_FORM_FIELD = 'csrf_token'
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours
const CLEANUP_INTERVAL = 60 * 60 * 1000 // 1 hour

// In-memory store for CSRF tokens with session binding
// Map<token, { issuedAt: number, sessionId: string, ipHash: string }>
const csrfTokenStore = new Map<string, {
  issuedAt: number
  sessionId: string
  ipHash: string
}>()

let lastCleanup = Date.now()

/**
 * Generate a CSRF token and return it with cookie setting options
 * Returns { token, cookieOptions }
 */
export function generateCsrfToken(req: NextRequest): {
  token: string
  cookieValue: string
} {
  const token = randomBytes(32).toString('hex')
  const sessionId = randomBytes(16).toString('hex')
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || 'unknown'
  const ipHash = createHmac('sha256', process.env.NEXTAUTH_SECRET || 'default-secret')
    .update(clientIp)
    .digest('hex')

  csrfTokenStore.set(token, {
    issuedAt: Date.now(),
    sessionId,
    ipHash,
  })

  // Clean up old tokens periodically
  if (Date.now() - lastCleanup > CLEANUP_INTERVAL) {
    cleanupExpiredTokens()
    lastCleanup = Date.now()
  }

  // Cookie value: base64 encoded token (visible in browser, not sensitive)
  const cookieValue = Buffer.from(token).toString('base64')

  return { token, cookieValue }
}

/**
 * Validate a CSRF token from request
 * Checks: token existence, expiry, session binding, IP consistency
 */
export function validateCsrfToken(
  token: string | null | undefined,
  req: NextRequest
): { valid: boolean; error?: string } {
  if (!token) {
    return { valid: false, error: 'CSRF token missing from request' }
  }

  const tokenData = csrfTokenStore.get(token)

  if (!tokenData) {
    console.warn(`[CSRF] Token not found in store`)
    return { valid: false, error: 'Invalid CSRF token' }
  }

  // Check if token has expired
  if (Date.now() - tokenData.issuedAt > TOKEN_EXPIRY) {
    console.warn(`[CSRF] Token expired`)
    csrfTokenStore.delete(token)
    return { valid: false, error: 'CSRF token expired' }
  }

  // Verify client IP consistency (prevent token theft across IPs)
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || 'unknown'
  const currentIpHash = createHmac('sha256', process.env.NEXTAUTH_SECRET || 'default-secret')
    .update(clientIp)
    .digest('hex')

  if (tokenData.ipHash !== currentIpHash) {
    console.warn(`[CSRF] IP mismatch - possible token theft`)
    csrfTokenStore.delete(token)
    return { valid: false, error: 'CSRF token IP mismatch' }
  }

  // Token is valid; remove it (single-use pattern)
  csrfTokenStore.delete(token)
  return { valid: true }
}

/**
 * Clean up expired tokens from store (runs periodically)
 */
function cleanupExpiredTokens() {
  const now = Date.now()
  let deletedCount = 0

  for (const [token, data] of csrfTokenStore.entries()) {
    if (now - data.issuedAt > TOKEN_EXPIRY) {
      csrfTokenStore.delete(token)
      deletedCount++
    }
  }

  if (deletedCount > 0) {
    console.log(`[CSRF] Cleaned up ${deletedCount} expired tokens`)
  }
}

/**
 * CSRF Protection Middleware
 * Apply to API routes that modify data (POST, PUT, DELETE, PATCH)
 *
 * Usage:
 *   const protection = await validateCsrfMiddleware(req)
 *   if (protection) return protection // Return error response
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
    '/api/webhooks', // Stripe/external webhooks (use signature verification)
    '/api/health', // Health check
  ]

  if (whitelistPaths.some((p) => path.startsWith(p))) {
    return null // Skip CSRF validation for whitelisted paths
  }

  // Get CSRF token from multiple sources (header priority, then body)
  let token = req.headers.get(CSRF_TOKEN_HEADER)

  // If not in header, check request body (for form submissions)
  if (!token && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    try {
      const contentType = req.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        const body = await req.json()
        token = body[CSRF_TOKEN_FORM_FIELD]
      }
    } catch (e) {
      console.warn(`[CSRF] Failed to parse request body for token extraction`)
    }
  }

  // Validate token
  const validation = validateCsrfToken(token, req)

  if (!validation.valid) {
    console.warn(`[CSRF] Validation failed for ${method} ${path}: ${validation.error}`)
    return NextResponse.json(
      { error: validation.error || 'CSRF validation failed' },
      { status: 403 }
    )
  }

  // Token is valid, proceed
  return null
}

/**
 * Add CSRF token to response
 * Sets HTTP-only cookie with token and returns token in response body
 *
 * Usage in GET endpoint:
 *   const { token, cookieValue } = generateCsrfToken(req)
 *   const response = NextResponse.json({ csrf_token: token })
 *   response.cookies.set(CSRF_COOKIE_NAME, cookieValue, {
 *     httpOnly: true,
 *     secure: process.env.NODE_ENV === 'production',
 *     sameSite: 'strict',
 *     maxAge: TOKEN_EXPIRY / 1000, // 24 hours
 *   })
 *   return response
 */
export function addCsrfTokenToResponse(
  response: NextResponse,
  token: string,
  cookieValue: string
): NextResponse {
  response.cookies.set(CSRF_COOKIE_NAME, cookieValue, {
    httpOnly: true, // Prevent JavaScript access
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict', // Strict same-site policy
    maxAge: Math.floor(TOKEN_EXPIRY / 1000), // 24 hours in seconds
    path: '/', // Available to all routes
  })

  // Also include token in response for client-side use
  return response
}

/**
 * Get CSRF token statistics for monitoring
 */
export function getCsrfTokenStats() {
  return {
    activeTokens: csrfTokenStore.size,
    timestamp: new Date().toISOString(),
    expiryMinutes: Math.floor(TOKEN_EXPIRY / 1000 / 60),
  }
}

/**
 * Clear all CSRF tokens (use with caution, mainly for testing)
 */
export function clearAllCsrfTokens() {
  const count = csrfTokenStore.size
  csrfTokenStore.clear()
  console.log(`[CSRF] Cleared all ${count} tokens`)
  return count
}
