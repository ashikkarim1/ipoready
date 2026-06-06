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
 *  Unauthenticated user visits /dashboard, /trial → redirect to /leads/capture
 *  Public feature showcase pages (/cap-table, /checklist, /documents, /marketplace) are accessible without login
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

/**
 * Security Headers
 * Protects against: XSS, clickjacking, MIME sniffing, etc.
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent XSS attacks
  response.headers.set('X-Content-Type-Options', 'nosniff')

  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY')

  // Enable browser XSS filter
  response.headers.set('X-XSS-Protection', '1; mode=block')

  // Referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Content Security Policy (restrictive)
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://js.stripe.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https:",
      "font-src 'self' https://fonts.gstatic.com data:",
      "connect-src 'self' https://api.stripe.com https://js.stripe.com",
      "frame-src https://js.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  )

  // HTTP Strict Transport Security (HSTS)
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')

  // Permissions Policy (formerly Feature Policy)
  response.headers.set(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=(self "https://js.stripe.com")'
  )

  return response
}

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const { pathname } = req.nextUrl

  let response: NextResponse

  // ── Not authenticated — enforce lead capture gate ──────────────────────────
  if (!token) {
    // Allow unauthenticated access to lead capture flow
    if (pathname.startsWith('/leads/capture') || pathname.startsWith('/auth/')) {
      response = NextResponse.next()
    } else if (
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/trial') ||
      pathname.startsWith('/raising-capital') ||
      pathname.startsWith('/team') ||
      pathname.startsWith('/templates') ||
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
      // Redirect all other protected routes to lead capture
      const captureUrl = new URL('/leads/capture', req.url)
      captureUrl.searchParams.set('from', pathname)
      response = NextResponse.redirect(captureUrl)
    } else {
      // Default to login for other routes
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', req.url)
      response = NextResponse.redirect(loginUrl)
    }
  } else if (pathname.startsWith('/admin')) {
    // ── Admin routes — require system_admin role ───────────────────────────────
    if ((token as { role?: string }).role !== 'system_admin') {
      // Authenticated but not an admin — silently redirect to dashboard
      response = NextResponse.redirect(new URL('/dashboard', req.url))
    } else {
      response = NextResponse.next()
    }
  } else {
    response = NextResponse.next()
  }

  // Add security headers to all responses
  return addSecurityHeaders(response)
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/raising-capital/:path*',
    '/team/:path*',
    '/templates/:path*',
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
