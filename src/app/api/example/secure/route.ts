/**
 * Example Secure API Route
 * Demonstrates proper use of CORS, Auth, and CSRF protection
 *
 * This is a reference implementation — copy the pattern to other state-changing endpoints
 */

import { NextRequest, NextResponse } from 'next/server'
import { validateCsrfMiddleware } from '@/lib/middleware/csrf'
import { requireCompany } from '@/lib/middleware/auth'
import { withCors } from '@/lib/middleware/cors'

export const dynamic = 'force-dynamic'

/**
 * POST /api/example/secure
 * Example state-changing endpoint with full protection
 *
 * Required headers:
 *   - Authorization: Bearer <token> (from NextAuth session)
 *   - X-CSRF-Token: <token> (from /api/csrf)
 *   - Content-Type: application/json
 *
 * Required body:
 *   {
 *     "data": "example",
 *     "csrf_token": "<token>" (alternative to header)
 *   }
 */
export async function POST(req: NextRequest) {
  // 1. Check CORS policy
  const corsError = await withCors(req)
  if (corsError) return corsError

  // 2. Verify authentication and company access
  const authCheck = await requireCompany(req)
  if (!authCheck.valid) {
    return NextResponse.json(
      { error: authCheck.error || 'Unauthorized' },
      { status: 401 }
    )
  }

  // 3. Validate CSRF token
  const csrfError = await validateCsrfMiddleware(req)
  if (csrfError) return csrfError

  try {
    const companyId = authCheck.companyId!
    const body = await req.json()

    // 4. Process request with company context
    console.log(`[API] Processing request for company: ${companyId}`)

    // Validate input
    if (!body.data || typeof body.data !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input: data must be a non-empty string' },
        { status: 400 }
      )
    }

    // TODO: Process data, update database, etc.

    return NextResponse.json(
      {
        success: true,
        message: 'Request processed successfully',
        companyId,
        data: body.data,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[API] Error in POST /api/example/secure:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS /api/example/secure
 * Handle CORS preflight requests
 */
export async function OPTIONS(req: NextRequest): Promise<Response | void> {
  const corsResponse = await withCors(req)
  if (corsResponse) {
    return corsResponse
  }
}

/**
 * GET /api/example/secure
 * Example read-only endpoint (no CSRF needed)
 *
 * Still requires authentication but no CSRF token
 */
export async function GET(req: NextRequest) {
  // 1. Check CORS policy
  const corsError = await withCors(req)
  if (corsError) return corsError

  // 2. Verify authentication
  const authCheck = await requireCompany(req)
  if (!authCheck.valid) {
    return NextResponse.json(
      { error: authCheck.error || 'Unauthorized' },
      { status: 401 }
    )
  }

  // No CSRF needed for GET
  try {
    const companyId = authCheck.companyId!

    return NextResponse.json(
      {
        success: true,
        message: 'Data retrieved successfully',
        companyId,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[API] Error in GET /api/example/secure:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
