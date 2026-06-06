/**
 * Admin API for Rate Limit Management
 * Requires authentication and system_admin role
 *
 * Endpoints:
 * GET  /api/admin/rate-limit/stats - Get rate limit statistics
 * POST /api/admin/rate-limit/reset - Reset rate limit for a key
 * POST /api/admin/rate-limit/clear - Clear all rate limits (emergency)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import {
  getRateLimitStats,
  resetRateLimit,
  clearAllRateLimits,
} from '@/lib/middleware/rate-limit'

/**
 * Verify admin access
 */
async function verifyAdmin(req: NextRequest): Promise<boolean> {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

    if (!token) {
      return false
    }

    const userRole = (token as { role?: string }).role
    return userRole === 'system_admin'
  } catch (error) {
    console.error('Admin verification failed:', error)
    return false
  }
}

/**
 * GET /api/admin/rate-limit/stats
 * Get current rate limit statistics
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  // Verify admin access
  const isAdmin = await verifyAdmin(req)
  if (!isAdmin) {
    return NextResponse.json(
      { error: 'Unauthorized. Admin access required.' },
      { status: 403 }
    )
  }

  try {
    const stats = await getRateLimitStats()

    return NextResponse.json(
      {
        status: 'success',
        data: stats,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error getting rate limit stats:', error)
    return NextResponse.json(
      { error: 'Failed to get rate limit statistics' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/rate-limit/reset
 * Reset rate limit for a specific key
 *
 * Request body:
 * {
 *   "key": "192.168.1.1",
 *   "prefix": "rl:pub"
 * }
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  // Verify admin access
  const isAdmin = await verifyAdmin(req)
  if (!isAdmin) {
    return NextResponse.json(
      { error: 'Unauthorized. Admin access required.' },
      { status: 403 }
    )
  }

  try {
    const { action, key, prefix } = await req.json()

    // Handle different actions
    if (action === 'reset') {
      if (!key || !prefix) {
        return NextResponse.json(
          { error: 'Missing required fields: key, prefix' },
          { status: 400 }
        )
      }

      const success = await resetRateLimit(key, prefix)

      if (!success) {
        return NextResponse.json(
          { error: 'Rate limit key not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(
        {
          status: 'success',
          message: `Rate limit reset for key: ${key}`,
          key,
          prefix,
        },
        { status: 200 }
      )
    }

    if (action === 'clear-all') {
      // Require explicit confirmation
      if (req.headers.get('x-confirm') !== 'true') {
        return NextResponse.json(
          {
            error: 'Confirmation required',
            message: 'Send header X-Confirm: true to confirm clearing all rate limits',
          },
          { status: 400 }
        )
      }

      await clearAllRateLimits()

      return NextResponse.json(
        {
          status: 'success',
          message: 'All rate limits cleared',
        },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { error: 'Invalid action. Valid actions: reset, clear-all' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error managing rate limits:', error)
    return NextResponse.json(
      { error: 'Failed to manage rate limits' },
      { status: 500 }
    )
  }
}

/**
 * Example usage:
 *
 * 1. Get rate limit statistics:
 *    curl -H "Authorization: Bearer <token>" https://example.com/api/admin/rate-limit/stats
 *
 * 2. Reset rate limit for an IP:
 *    curl -X POST \
 *      -H "Content-Type: application/json" \
 *      -H "Authorization: Bearer <token>" \
 *      -d '{"action":"reset","key":"192.168.1.1","prefix":"rl:pub"}' \
 *      https://example.com/api/admin/rate-limit
 *
 * 3. Clear all rate limits (emergency):
 *    curl -X POST \
 *      -H "Content-Type: application/json" \
 *      -H "Authorization: Bearer <token>" \
 *      -H "X-Confirm: true" \
 *      -d '{"action":"clear-all"}' \
 *      https://example.com/api/admin/rate-limit
 */
