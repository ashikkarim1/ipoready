/**
 * Apply rate limiting to API route handlers
 * Provides convenient wrappers for different endpoint types
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  rateLimitMiddleware,
  RATE_LIMIT_CONFIG,
  RateLimitResult,
  checkRateLimit,
  getClientIp,
  extractUserId,
} from './rate-limit'

/**
 * Wrap a route handler with rate limiting
 */
export async function withRateLimit<T extends (req: NextRequest) => Promise<NextResponse>>(
  handler: T,
  config: (typeof RATE_LIMIT_CONFIG)[keyof typeof RATE_LIMIT_CONFIG]
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    // Check rate limit
    const limitResponse = await rateLimitMiddleware(req, config)
    if (limitResponse) {
      return limitResponse
    }

    // Call the actual handler
    try {
      const response = await handler(req)

      // Add rate limit headers to successful response
      const userId = await extractUserId(req)
      const key = userId || getClientIp(req)
      const result = await checkRateLimit(key, config)

      response.headers.set('X-RateLimit-Limit', result.limit.toString())
      response.headers.set('X-RateLimit-Remaining', Math.max(0, result.remaining).toString())
      response.headers.set('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000).toString())

      return response
    } catch (error) {
      console.error('Handler error:', error)
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      )
    }
  }
}

/**
 * Apply public endpoint rate limiting (100/min per IP)
 */
export function withPublicRateLimit<T extends (req: NextRequest) => Promise<NextResponse>>(
  handler: T
) {
  return withRateLimit(handler, RATE_LIMIT_CONFIG.PUBLIC_ENDPOINTS)
}

/**
 * Apply authenticated endpoint rate limiting (1000/min per user)
 */
export function withAuthenticatedRateLimit<T extends (req: NextRequest) => Promise<NextResponse>>(
  handler: T
) {
  return withRateLimit(handler, RATE_LIMIT_CONFIG.AUTHENTICATED_ENDPOINTS)
}

/**
 * Apply auth endpoint rate limiting (10/min per IP)
 */
export function withAuthEndpointRateLimit<T extends (req: NextRequest) => Promise<NextResponse>>(
  handler: T
) {
  return withRateLimit(handler, RATE_LIMIT_CONFIG.AUTH_ENDPOINTS)
}

/**
 * Apply login endpoint rate limiting (5/15min per IP)
 */
export function withLoginRateLimit<T extends (req: NextRequest) => Promise<NextResponse>>(
  handler: T
) {
  return withRateLimit(handler, RATE_LIMIT_CONFIG.LOGIN_ENDPOINT)
}

/**
 * Apply registration rate limiting (3/hour per IP)
 */
export function withRegisterRateLimit<T extends (req: NextRequest) => Promise<NextResponse>>(
  handler: T
) {
  return withRateLimit(handler, RATE_LIMIT_CONFIG.REGISTER_ENDPOINT)
}

/**
 * Apply password reset rate limiting (5/hour per IP)
 */
export function withPasswordResetRateLimit<T extends (req: NextRequest) => Promise<NextResponse>>(
  handler: T
) {
  return withRateLimit(handler, RATE_LIMIT_CONFIG.PASSWORD_RESET_ENDPOINT)
}

/**
 * Apply document upload rate limiting (20/hour per user)
 */
export function withDocumentUploadRateLimit<T extends (req: NextRequest) => Promise<NextResponse>>(
  handler: T
) {
  return withRateLimit(handler, RATE_LIMIT_CONFIG.DOCUMENT_UPLOAD)
}

/**
 * Apply data export rate limiting (5/hour per user)
 */
export function withDataExportRateLimit<T extends (req: NextRequest) => Promise<NextResponse>>(
  handler: T
) {
  return withRateLimit(handler, RATE_LIMIT_CONFIG.DATA_EXPORT)
}

/**
 * Standalone rate limit checker (for custom logic)
 */
export async function checkApiRateLimit(
  req: NextRequest,
  config: (typeof RATE_LIMIT_CONFIG)[keyof typeof RATE_LIMIT_CONFIG]
): Promise<RateLimitResult | null> {
  const userId = await extractUserId(req)
  const key = userId || getClientIp(req)
  return checkRateLimit(key, config)
}

/**
 * Get rate limit status headers
 */
export function getRateLimitHeaders(
  result: RateLimitResult
): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': Math.max(0, result.remaining).toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
    ...(result.retryAfter ? { 'Retry-After': result.retryAfter.toString() } : {}),
  }
}
