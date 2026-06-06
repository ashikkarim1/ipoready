/**
 * Authentication Middleware
 * Verifies user session on protected API routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    email: string
    companyId?: string
    role?: string
  }
}

/**
 * Verify user is authenticated
 * Usage:
 *   const auth = await withAuth(req)
 *   if (!auth.valid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 */
export async function withAuth(req: NextRequest): Promise<{
  valid: boolean
  session?: any
  error?: string
}> {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return {
        valid: false,
        error: 'Authentication required',
      }
    }

    return {
      valid: true,
      session,
    }
  } catch (error) {
    console.error('[Auth Middleware] Error:', error)
    return {
      valid: false,
      error: 'Authentication check failed',
    }
  }
}

/**
 * Verify user has specific role
 */
export async function requireRole(req: NextRequest, requiredRole: string): Promise<{
  valid: boolean
  session?: any
  error?: string
}> {
  const authResult = await withAuth(req)

  if (!authResult.valid) {
    return authResult
  }

  const userRole = (authResult.session?.user as { role?: string })?.role
  if (userRole !== requiredRole) {
    return {
      valid: false,
      error: `Role '${requiredRole}' required`,
    }
  }

  return authResult
}

/**
 * Verify user has company access
 */
export async function requireCompany(req: NextRequest): Promise<{
  valid: boolean
  session?: any
  companyId?: string
  error?: string
}> {
  const authResult = await withAuth(req)

  if (!authResult.valid) {
    return authResult
  }

  const companyId = (authResult.session?.user as { companyId?: string })?.companyId
  if (!companyId) {
    return {
      valid: false,
      error: 'Company access required',
    }
  }

  return {
    valid: true,
    session: authResult.session,
    companyId,
  }
}
