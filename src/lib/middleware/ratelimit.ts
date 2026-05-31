/**
 * Rate Limiting Middleware
 * Prevents API abuse and DDoS attacks
 *
 * Required for production deployment and GDPR/PIPEDA compliance
 */

import { NextRequest, NextResponse } from 'next/server'

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Max requests per window
  keyGenerator?: (req: NextRequest) => string // Function to generate rate limit key
  skipSuccessfulRequests?: boolean // Don't count successful requests
  skipFailedRequests?: boolean // Don't count failed requests
}

interface RequestRecord {
  count: number
  resetTime: number
}

// In-memory store for rate limit data (use Redis in production)
// Map<key, { count: number, resetTime: number }>
const rateLimitStore = new Map<string, RequestRecord>()

/**
 * Default rate limit configurations
 */
export const RATE_LIMITS = {
  API_DEFAULT: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
  },
  API_STRICT: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 requests per minute
  },
  AUTH_LOGIN: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 login attempts per 15 minutes
  },
  AUTH_SIGNUP: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3, // 3 signups per hour
  },
  DATA_EXPORT: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5, // 5 data exports per hour
  },
  ACCOUNT_DELETE: {
    windowMs: 60 * 60 * 24 * 1000, // 24 hours
    maxRequests: 1, // 1 deletion request per day
  },
}

/**
 * Generate default key from request (IP address)
 */
function defaultKeyGenerator(req: NextRequest): string {
  // Get real IP (consider proxies)
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : req.ip || 'unknown'
  return `${ip}:${req.nextUrl.pathname}`
}

/**
 * Check rate limit for a request
 */
export function checkRateLimit(
  req: NextRequest,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number; retryAfter?: number } {
  const key = config.keyGenerator ? config.keyGenerator(req) : defaultKeyGenerator(req)
  const now = Date.now()

  let record = rateLimitStore.get(key)

  // Check if window has expired
  if (!record || now > record.resetTime) {
    // Create new window
    record = {
      count: 1,
      resetTime: now + config.windowMs,
    }
    rateLimitStore.set(key, record)

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: record.resetTime,
    }
  }

  // Increment counter
  record.count++

  if (record.count > config.maxRequests) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000)
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
      retryAfter,
    }
  }

  return {
    allowed: true,
    remaining: config.maxRequests - record.count,
    resetTime: record.resetTime,
  }
}

/**
 * Rate limit middleware for API routes
 */
export async function rateLimitMiddleware(
  req: NextRequest,
  config: RateLimitConfig
): Promise<NextResponse | null> {
  const result = checkRateLimit(req, config)

  const response = new NextResponse(null)

  // Add rate limit headers
  response.headers.set('X-RateLimit-Limit', config.maxRequests.toString())
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
  response.headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString())

  if (!result.allowed) {
    if (result.retryAfter) {
      response.headers.set('Retry-After', result.retryAfter.toString())
    }

    return NextResponse.json(
      {
        error: 'Too many requests',
        message: `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`,
        retryAfter: result.retryAfter,
      },
      { status: 429, headers: response.headers }
    )
  }

  return null // Allowed, continue processing
}

/**
 * Clean up old records from store
 */
export function cleanupExpiredRecords() {
  const now = Date.now()
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

/**
 * Get rate limit statistics (for monitoring/debugging)
 */
export function getRateLimitStats() {
  // Clean up first
  cleanupExpiredRecords()

  return {
    activeKeys: rateLimitStore.size,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Reset rate limit for a specific key (admin only)
 */
export function resetRateLimit(key: string): boolean {
  return rateLimitStore.delete(key)
}

/**
 * Clear all rate limits (emergency only)
 */
export function clearAllRateLimits(): void {
  rateLimitStore.clear()
}
