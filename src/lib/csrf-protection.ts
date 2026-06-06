/**
 * CSRF (Cross-Site Request Forgery) Protection
 *
 * Generates and validates CSRF tokens for all state-changing requests (POST, PUT, DELETE)
 * Uses double-submit cookie pattern for stateless operation
 */

import crypto from 'crypto'

const CSRF_TOKEN_LENGTH = 32
const CSRF_COOKIE_NAME = 'csrf-token'
const CSRF_HEADER_NAME = 'x-csrf-token'

/**
 * Generate a CSRF token (random 32-byte hex string)
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex')
}

/**
 * Validate CSRF token
 * For double-submit pattern: compares token from cookie with token from header/body
 */
export function validateCsrfToken(cookieToken: string | undefined, headerToken: string | undefined): boolean {
  if (!cookieToken || !headerToken) {
    return false
  }

  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(Buffer.from(cookieToken), Buffer.from(headerToken))
}

/**
 * Middleware to add CSRF token to response (sets cookie for client)
 */
export function setCsrfCookie(res: any): string {
  const token = generateCsrfToken()

  // Set httpOnly=false so JavaScript can read it and include in headers
  // (CSRF tokens are meant to be known to the client, just not to cross-origin scripts)
  res.setHeader('Set-Cookie', [
    `${CSRF_COOKIE_NAME}=${token}; Path=/; SameSite=Strict; Secure; Max-Age=${7 * 24 * 60 * 60}`,
  ])

  return token
}

/**
 * Check if request method requires CSRF protection
 */
export function requiresCsrfProtection(method: string): boolean {
  return ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase())
}

/**
 * Extract CSRF token from request (checks header first, then body)
 */
export function extractCsrfToken(req: any): string | undefined {
  // Check header first
  const headerToken = req.headers[CSRF_HEADER_NAME] || req.headers['x-csrf-token']
  if (headerToken) {
    return headerToken
  }

  // Check body if it's form data or JSON
  if (req.body?.csrfToken) {
    return req.body.csrfToken
  }

  // Check form data
  if (req.body?.get?.('csrf_token')) {
    return req.body.get('csrf_token')
  }

  return undefined
}

/**
 * Extract CSRF token from cookies
 */
export function extractCsrfCookie(req: any): string | undefined {
  const cookies = req.headers.cookie?.split('; ') || []
  for (const cookie of cookies) {
    const [name, value] = cookie.split('=')
    if (name === CSRF_COOKIE_NAME) {
      return decodeURIComponent(value)
    }
  }
  return undefined
}
