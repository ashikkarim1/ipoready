/**
 * Example: Rate-limited Auth API Routes
 *
 * Auth endpoints use stricter rate limits:
 * - /api/auth/login: 5 attempts per 15 minutes
 * - /api/auth/register: 3 attempts per hour
 * - /api/auth/password-reset: 5 attempts per hour
 *
 * Usage:
 * export const POST = withLoginRateLimit(async (req) => { ... })
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  withLoginRateLimit,
  withRegisterRateLimit,
  withPasswordResetRateLimit,
} from '@/lib/middleware/apply-rate-limit'

/**
 * Login endpoint example
 * Path: /api/auth/login
 * Rate limit: 5 attempts per 15 minutes per IP
 */
export const POST_LOGIN = withLoginRateLimit(async (req: NextRequest): Promise<NextResponse> => {
  try {
    const body = await req.json()

    // Your login logic here
    // - Validate credentials
    // - Create session/token
    // - Return auth token

    return NextResponse.json(
      {
        status: 'success',
        message: 'Login successful',
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    )
  }
})

/**
 * Register endpoint example
 * Path: /api/auth/register
 * Rate limit: 3 attempts per hour per IP
 */
export const POST_REGISTER = withRegisterRateLimit(
  async (req: NextRequest): Promise<NextResponse> => {
    try {
      const body = await req.json()

      // Your registration logic here
      // - Validate input
      // - Check email uniqueness
      // - Create user account
      // - Send confirmation email

      return NextResponse.json(
        {
          status: 'success',
          message: 'Registration successful',
        },
        { status: 201 }
      )
    } catch (error) {
      return NextResponse.json(
        { error: 'Registration failed' },
        { status: 400 }
      )
    }
  }
)

/**
 * Password reset endpoint example
 * Path: /api/auth/password-reset
 * Rate limit: 5 attempts per hour per IP
 */
export const POST_PASSWORD_RESET = withPasswordResetRateLimit(
  async (req: NextRequest): Promise<NextResponse> => {
    try {
      const body = await req.json()

      // Your password reset logic here
      // - Validate email
      // - Generate reset token
      // - Send reset email

      return NextResponse.json(
        {
          status: 'success',
          message: 'Password reset email sent',
        },
        { status: 200 }
      )
    } catch (error) {
      return NextResponse.json(
        { error: 'Password reset failed' },
        { status: 400 }
      )
    }
  }
)

/**
 * Implementation checklist for your actual auth routes:
 *
 * 1. Create /api/auth/login/route.ts:
 *    export const POST = POST_LOGIN
 *
 * 2. Create /api/auth/register/route.ts:
 *    export const POST = POST_REGISTER
 *
 * 3. Create /api/auth/password-reset/route.ts:
 *    export const POST = POST_PASSWORD_RESET
 *
 * 4. For other auth endpoints (logout, verify, etc.):
 *    Use withAuthEndpointRateLimit(handler) for 10/min per IP
 *
 * 5. Test rate limits:
 *    - Send 6 requests to /login in 1 minute
 *    - Verify 6th request returns 429 status
 *    - Verify Retry-After header is set
 *    - Verify X-RateLimit-* headers are present
 */
