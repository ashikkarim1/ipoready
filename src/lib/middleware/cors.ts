/**
 * CORS (Cross-Origin Resource Sharing) Middleware
 * Configures allowed origins, methods, and credentials
 *
 * Implements origin whitelisting and method/header restrictions per OWASP guidelines
 */

import { NextRequest, NextResponse } from 'next/server'

// Define allowed origins by environment
const ALLOWED_ORIGINS = {
  production: ['https://ipoready.ai', 'https://www.ipoready.ai'],
  staging: ['https://staging.ipoready.ai'],
  development: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'],
}

const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']

const ALLOWED_HEADERS = [
  'Content-Type',
  'Authorization',
  'X-CSRF-Token',
  'X-Requested-With',
  'Accept',
  'Accept-Language',
]

/**
 * Get allowed origins for current environment
 */
function getAllowedOrigins(): string[] {
  const env = (process.env.NODE_ENV || 'development') as string

  if (env === 'production') {
    return ALLOWED_ORIGINS.production
  }

  if (env === 'staging') {
    return ALLOWED_ORIGINS.staging
  }

  return ALLOWED_ORIGINS.development
}

/**
 * Check if origin is allowed
 */
function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false

  const allowed = getAllowedOrigins()
  return allowed.includes(origin)
}

/**
 * CORS middleware handler
 * Apply to all API routes for consistent CORS handling
 *
 * Usage:
 *   export async function POST(req: NextRequest) {
 *     const corsCheck = await withCors(req)
 *     if (corsCheck) return corsCheck
 *     // ... rest of handler
 *   }
 */
export async function withCors(req: NextRequest): Promise<NextResponse | null> {
  const origin = req.headers.get('origin')

  // Handle preflight requests (OPTIONS)
  if (req.method === 'OPTIONS') {
    // Check if origin is allowed
    if (!origin || !isOriginAllowed(origin)) {
      console.warn(`[CORS] Preflight denied for origin: ${origin}`)
      return new NextResponse(null, { status: 403 })
    }

    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': ALLOWED_METHODS.join(', '),
        'Access-Control-Allow-Headers': ALLOWED_HEADERS.join(', '),
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400', // 24 hours
      },
    })
  }

  // For non-OPTIONS requests, headers will be applied via next.config.js
  // But we still validate origin here for logging
  if (origin && !isOriginAllowed(origin)) {
    console.warn(`[CORS] Request denied for origin: ${origin}`)
    return NextResponse.json(
      { error: 'CORS policy violation' },
      { status: 403 }
    )
  }

  return null
}

/**
 * Add CORS headers to response
 * Useful when you need to override default headers from next.config.js
 */
export function addCorsHeaders(response: NextResponse, origin: string): NextResponse {
  const allowed = getAllowedOrigins()

  if (allowed.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Methods', ALLOWED_METHODS.join(', '))
    response.headers.set('Access-Control-Allow-Headers', ALLOWED_HEADERS.join(', '))
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Max-Age', '86400')
  }

  return response
}

/**
 * Get CORS configuration for manual implementation
 */
export function getCorsConfig() {
  return {
    allowedOrigins: getAllowedOrigins(),
    allowedMethods: ALLOWED_METHODS,
    allowedHeaders: ALLOWED_HEADERS,
    credentials: true,
    maxAge: 86400,
  }
}
