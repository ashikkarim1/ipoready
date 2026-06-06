/**
 * ============================================================================
 * Cache Header Utilities
 * ============================================================================
 *
 * Provides standardized cache control headers for API responses.
 * Implements proper caching strategies based on data volatility.
 *
 * Usage:
 * const headers = setCacheHeaders(CACHE_TTL.NORMAL)
 * return NextResponse.json(data, { headers })
 *
 * ============================================================================
 */

/**
 * Cache TTL constants for different data types
 */
export const CACHE_TTL = {
  // Highly stable data (regulatory rules, exchange requirements)
  STABLE: 86400, // 24 hours

  // Frequently changing (dashboard stats, user data)
  NORMAL: 3600, // 1 hour

  // Real-time data (current status, live metrics)
  SHORT: 300, // 5 minutes

  // Dynamic data (no caching)
  NONE: 0,

  // Search results, filtered lists
  SEARCH: 600, // 10 minutes

  // Financial data (usually updated daily)
  FINANCIAL: 3600, // 1 hour

  // User preferences (changed frequently)
  USER: 300, // 5 minutes

  // Capital markets data
  MARKETS: 600, // 10 minutes
}

/**
 * Set standard cache control headers
 *
 * @param ttl Time to live in seconds
 * @param isPrivate Whether response is private (user-specific)
 * @returns Headers object with cache-control directives
 *
 * @example
 * const headers = setCacheHeaders(CACHE_TTL.NORMAL)
 * return NextResponse.json(data, { headers })
 */
export function setCacheHeaders(ttl: number = 3600, isPrivate: boolean = true) {
  const headers = new Headers()

  // Primary cache control header
  const cacheControl = isPrivate
    ? `private, max-age=${ttl}, must-revalidate`
    : `public, max-age=${ttl}, must-revalidate`

  headers.set('Cache-Control', cacheControl)

  // For CDN (Vercel, Cloudflare, etc.)
  if (!isPrivate) {
    headers.set('CDN-Cache-Control', `max-age=${ttl}`)
  }

  // Ensure revalidation after TTL
  headers.set('Pragma', 'cache')

  // Standard expiry header
  const expiryDate = new Date(Date.now() + ttl * 1000)
  headers.set('Expires', expiryDate.toUTCString())

  return headers
}

/**
 * Set conditional cache headers (ETag-based)
 * Use when response content is deterministic
 *
 * @param content Content to generate ETag from
 * @param ttl Time to live in seconds
 * @returns Headers object with ETag and cache-control
 */
export function setConditionalCacheHeaders(content: string, ttl: number = 3600) {
  const headers = setCacheHeaders(ttl, false)

  // Generate simple ETag
  const hash = generateSimpleHash(content)
  headers.set('ETag', `"${hash}"`)

  return headers
}

/**
 * Generate simple hash for ETag
 * @param content Content to hash
 * @returns Hash string
 */
function generateSimpleHash(content: string): string {
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash.toString(16)
}

/**
 * Set stale-while-revalidate headers for background updates
 * Allows serving stale data while updating in background
 *
 * @param ttl Time to live
 * @param staleTime How long stale content is acceptable
 * @returns Headers with stale-while-revalidate directive
 *
 * @example
 * // Serve for 1 hour, use stale content for 1 more day while revalidating
 * const headers = setStaleWhileRevalidateHeaders(3600, 86400)
 */
export function setStaleWhileRevalidateHeaders(ttl: number = 3600, staleTime: number = 86400) {
  const headers = new Headers()

  headers.set(
    'Cache-Control',
    `public, max-age=${ttl}, stale-while-revalidate=${staleTime}, must-revalidate`
  )

  return headers
}

/**
 * No-cache directive (must revalidate but can serve from cache)
 * Use for user-specific or frequently-changing data
 *
 * @returns Headers with no-cache directive
 */
export function setNoCache() {
  const headers = new Headers()
  headers.set('Cache-Control', 'private, no-cache, must-revalidate')
  headers.set('Pragma', 'no-cache')
  headers.set('Expires', '0')
  return headers
}

/**
 * No-store directive (never cache)
 * Use for sensitive or highly dynamic data
 *
 * @returns Headers with no-store directive
 */
export function setNoStore() {
  const headers = new Headers()
  headers.set('Cache-Control', 'private, no-store, no-cache, must-revalidate')
  headers.set('Pragma', 'no-cache')
  headers.set('Expires', '0')
  return headers
}

/**
 * Immutable content headers (for versioned assets)
 * Use for content that never changes (e.g., /api/v1/...)
 *
 * @param ttl Long TTL (default 1 year)
 * @returns Headers marking content as immutable
 */
export function setImmutableHeaders(ttl: number = 31536000) {
  const headers = new Headers()
  headers.set('Cache-Control', `public, max-age=${ttl}, immutable`)
  return headers
}

/**
 * Cache headers for API list endpoints with pagination
 *
 * @param page Page number
 * @param total Total items
 * @returns Headers with appropriate cache time based on size
 */
export function setListCacheHeaders(page: number = 1, total: number = 0) {
  // First page (most accessed) - shorter cache
  const ttl = page === 1 ? 600 : 1800

  const headers = setCacheHeaders(ttl, false)

  // Add pagination metadata
  headers.set('X-Page', page.toString())
  headers.set('X-Total', total.toString())

  return headers
}

/**
 * Cache headers for search results
 *
 * @param query Search query
 * @param resultCount Number of results
 * @returns Headers with search-specific caching
 */
export function setSearchCacheHeaders(query: string, resultCount: number = 0) {
  // Empty results cache longer (likely refined query)
  // Large results cache shorter (might change frequently)
  const ttl = resultCount === 0 ? 3600 : 600

  const headers = setCacheHeaders(ttl, false)
  headers.set('X-Search-Query', query)
  headers.set('X-Result-Count', resultCount.toString())

  return headers
}

/**
 * Add CORS headers to cached response
 *
 * @param headers Existing headers
 * @param origin Allowed origin
 * @returns Headers with CORS directives
 */
export function addCorsHeaders(headers: Headers, origin: string = '*'): Headers {
  headers.set('Access-Control-Allow-Origin', origin)
  headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  headers.set('Access-Control-Max-Age', '86400') // Cache CORS preflight for 24h
  return headers
}

/**
 * Pre-configured cache strategies for common endpoints
 */
export const CACHE_STRATEGIES = {
  // Regulatory and compliance data
  regulatory: () => setCacheHeaders(CACHE_TTL.STABLE, false),

  // Dashboard and user data
  dashboard: () => setCacheHeaders(CACHE_TTL.SHORT, true),

  // Financial data
  financials: () => setCacheHeaders(CACHE_TTL.FINANCIAL, false),

  // Company information
  company: () => setCacheHeaders(CACHE_TTL.NORMAL, false),

  // Search results
  search: (resultCount: number) => setSearchCacheHeaders('', resultCount),

  // List endpoints
  list: (page: number, total: number) => setListCacheHeaders(page, total),

  // Real-time data
  realtime: () => setNoCache(),

  // Sensitive user data
  sensitive: () => setNoStore(),
}

/**
 * Verify cache headers are correct
 * @param headers Headers to verify
 * @returns Validation result
 */
export function validateCacheHeaders(headers: Headers): {
  valid: boolean
  ttl: number | null
  message: string
} {
  const cacheControl = headers.get('Cache-Control')

  if (!cacheControl) {
    return {
      valid: false,
      ttl: null,
      message: 'No Cache-Control header set'
    }
  }

  const match = cacheControl.match(/max-age=(\d+)/)
  const ttl = match ? parseInt(match[1], 10) : null

  return {
    valid: true,
    ttl,
    message: `Cache-Control: ${cacheControl}`
  }
}
