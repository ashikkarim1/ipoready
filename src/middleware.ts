/**
 * IPOReady Edge Middleware
 *
 * Runs at the CDN edge — ZERO origin server cost, ZERO database calls.
 * Replaces individual getServerSession() calls in layout files
 * (each was a full NextAuth DB/JWT round-trip to the origin server).
 *
 * With JWT strategy configured in authOptions, the session token is a
 * signed cookie. next-auth/middleware verifies it with NEXTAUTH_SECRET
 * entirely at the edge — no network hop to origin or Neon DB.
 *
 * Lead Capture Enforcement:
 *  Unauthenticated user visits /dashboard, /cap-table, /trial → redirect to /leads/capture
 *
 * Trial Setup Enforcement:
 *  Authenticated user without trial company yet → redirect to /trial/cap-table-setup
 *
 * Role enforcement:
 *  /admin/* — restricted to users with role === 'system_admin'
 *  All other protected routes — any authenticated user
 */
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const { pathname } = req.nextUrl

  // ── Not authenticated — enforce lead capture gate ──────────────────────────
  if (!token) {
    // Allow unauthenticated access to lead capture flow
    if (pathname.startsWith('/leads/capture') || pathname.startsWith('/auth/')) {
      return NextResponse.next()
    }

    // Redirect all other protected routes to lead capture
    if (
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/cap-table') ||
      pathname.startsWith('/trial') ||
      pathname.startsWith('/checklist') ||
      pathname.startsWith('/raising-capital') ||
      pathname.startsWith('/documents') ||
      pathname.startsWith('/team') ||
      pathname.startsWith('/templates') ||
      pathname.startsWith('/marketplace') ||
      pathname.startsWith('/referrals') ||
      pathname.startsWith('/account') ||
      pathname.startsWith('/admin') ||
      pathname.startsWith('/wizard') ||
      pathname.startsWith('/pace') ||
      pathname.startsWith('/vendor') ||
      pathname.startsWith('/integrations') ||
      pathname.startsWith('/notifications') ||
      pathname.startsWith('/checklist-guide') ||
      pathname.startsWith('/post-listing')
    ) {
      const captureUrl = new URL('/leads/capture', req.url)
      captureUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(captureUrl)
    }

    // Default to login for other routes
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', req.url)
    return NextResponse.redirect(loginUrl)
  }

  // ── Admin routes — require system_admin role ───────────────────────────────
  if (pathname.startsWith('/admin')) {
    if ((token as { role?: string }).role !== 'system_admin') {
      // Authenticated but not an admin — silently redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/checklist/:path*',
    '/cap-table/:path*',
    '/raising-capital/:path*',
    '/documents/:path*',
    '/team/:path*',
    '/templates/:path*',
    '/marketplace/:path*',
    '/referrals/:path*',
    '/account/:path*',
    '/admin/:path*',
    '/wizard/:path*',
    '/pace/:path*',
    '/vendor/:path*',
    '/integrations/:path*',
    '/notifications/:path*',
    '/checklist-guide/:path*',
    '/post-listing/:path*',
  ],
}
