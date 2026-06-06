/**
 * API Middleware Utilities
 * Central export point for all middleware helpers
 * Simplifies integration across API routes
 */

export { validateCsrfMiddleware, generateCsrfToken, getCsrfTokenStats } from './csrf'
export { withAuth } from './auth'
export { withCors } from './cors'
export { createRateLimitMiddleware, rateLimitMiddleware, RATE_LIMIT_CONFIG } from './rate-limit'

/**
 * Compose multiple middleware functions
 * Usage:
 *   const handler = compose(
 *     withAuth,
 *     withCors,
 *     validateCsrfMiddleware
 *   )(async (req) => {...})
 */
export function compose(
  ...middlewares: ((handler: any) => (req: any) => Promise<any>)[]
) {
  return (handler: any) => {
    let composed = handler
    for (const middleware of middlewares.reverse()) {
      composed = middleware(composed)
    }
    return composed
  }
}
