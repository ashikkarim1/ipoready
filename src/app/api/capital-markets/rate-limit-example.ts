/**
 * Example: Rate-limited Capital Markets API Route
 *
 * Usage: Apply withAuthenticatedRateLimit to your route handlers
 *
 * For authenticated endpoints:
 * export const GET = withAuthenticatedRateLimit(async (req) => {
 *   // Your handler logic
 * })
 *
 * The wrapper will:
 * 1. Check rate limit (1000 requests/minute per authenticated user)
 * 2. Return 429 with Retry-After if limit exceeded
 * 3. Add X-RateLimit-* headers to response
 * 4. Pass request through if allowed
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAuthenticatedRateLimit } from '@/lib/middleware/apply-rate-limit'

/**
 * Example GET handler for capital markets data
 */
async function handleGet(req: NextRequest): Promise<NextResponse> {
  try {
    // Your actual handler logic here
    return NextResponse.json({
      status: 'success',
      message: 'Capital markets data endpoint',
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Example POST handler for capital markets operations
 */
async function handlePost(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json()

    // Your actual handler logic here
    return NextResponse.json({
      status: 'success',
      message: 'Capital markets operation completed',
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Export wrapped handlers - automatically rate limited
export const GET = withAuthenticatedRateLimit(handleGet)
export const POST = withAuthenticatedRateLimit(handlePost)

/**
 * Dynamic route example with rate limiting
 * File: /api/capital-markets/[id]/route.ts
 *
 * import { withAuthenticatedRateLimit } from '@/lib/middleware/apply-rate-limit'
 *
 * async function handleGet(req: NextRequest): Promise<NextResponse> {
 *   const { searchParams } = new URL(req.url)
 *   const id = searchParams.get('id')
 *
 *   // Handler logic
 *   return NextResponse.json({ id })
 * }
 *
 * export const GET = withAuthenticatedRateLimit(handleGet)
 */
