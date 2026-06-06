/**
 * Rate Limiter Utility
 *
 * Prevents API abuse, brute force attacks, and DDoS
 * Uses in-memory store with configurable limits per endpoint
 *
 * Production: Can upgrade to Redis-based for distributed systems
 */

interface RateLimitConfig {
  windowMs: number    // Time window in milliseconds
  maxRequests: number // Max requests per window
  keyGenerator: (req: any) => string // Function to generate unique key (IP, user ID, etc.)
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

const store = new Map<string, RateLimitEntry>()

// Cleanup expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetTime) {
      store.delete(key)
    }
  }
}, 5 * 60 * 1000)

export function createRateLimiter(config: RateLimitConfig) {
  return (req: any) => {
    const key = config.keyGenerator(req)
    const now = Date.now()

    let entry = store.get(key)

    if (!entry || now > entry.resetTime) {
      // New window or expired entry
      entry = {
        count: 1,
        resetTime: now + config.windowMs,
      }
      store.set(key, entry)
      return { allowed: true, remaining: config.maxRequests - 1, retryAfter: null }
    }

    if (entry.count < config.maxRequests) {
      entry.count++
      return { allowed: true, remaining: config.maxRequests - entry.count, retryAfter: null }
    }

    // Rate limit exceeded
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000)
    return { allowed: false, remaining: 0, retryAfter }
  }
}

// Standard rate limits
export const RATE_LIMITS = {
  // Auth endpoints - very restrictive
  login: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    keyGenerator: (req) => `login:${req.ip}`,
  }),
  register: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    keyGenerator: (req) => `register:${req.ip}`,
  }),

  // API endpoints - moderate limits
  api: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
    keyGenerator: (req) => `api:${req.userId || req.ip}`,
  }),

  // File upload - strict limit
  upload: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 50,
    keyGenerator: (req) => `upload:${req.userId || req.ip}`,
  }),

  // Email/notification endpoints
  email: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 100,
    keyGenerator: (req) => `email:${req.userId}`,
  }),
}

/**
 * Format IP from request (handles X-Forwarded-For)
 */
export function getClientIp(req: any): string {
  const forwarded = req.headers['x-forwarded-for']
  return (forwarded ? forwarded.split(', ')[0] : req.socket?.remoteAddress) || 'unknown'
}
