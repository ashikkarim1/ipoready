/** @type {import('next').NextConfig} */
const nextConfig = {
  // Instrumentation hook (instrumentation.ts) is auto-enabled when the file exists.
  // No config option needed in Next.js 14.2.x — it runs automatically at server startup.

  experimental: {
    serverComponentsExternalPackages: ['@neondatabase/serverless'],

    // Tree-shake lucide-react, date-fns — import only what's
    // used rather than the full bundle. Saves ~400 KB across all routes.
    // Removed framer-motion from optimizePackageImports due to RSC bundling conflicts
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
    ],
  },

  images: {
    domains: ['avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
  },

  // Compress all responses — reduces transfer size 60-80% for JS/CSS/HTML.
  compress: true,

  // No source maps in production — keeps JS payloads small and prevents
  // business logic from being exposed to the client browser.
  productionBrowserSourceMaps: false,

  // Consistent URL canonicalisation — prevents duplicate CDN cache entries.
  trailingSlash: false,

  async headers() {
    // Determine CORS allowed origins based on environment
    const allowedOrigins = process.env.NODE_ENV === 'production'
      ? ['https://ipoready.ai', 'https://www.ipoready.ai']
      : ['http://localhost:3000', 'http://localhost:3001']

    // CORS headers for API routes
    const corsHeaders = [
      { key: 'Access-Control-Allow-Origin', value: allowedOrigins[0] },
      { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, PATCH, OPTIONS' },
      { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, X-CSRF-Token, X-Requested-With' },
      { key: 'Access-Control-Allow-Credentials', value: 'true' },
      { key: 'Access-Control-Max-Age', value: '86400' }, // 24 hours
    ]

    // Common security headers applied to all responses
    const securityHeaders = [
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      {
        key: 'X-Frame-Options',
        value: 'DENY',
      },
      {
        key: 'X-XSS-Protection',
        value: '1; mode=block',
      },
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains; preload',
      },
      {
        key: 'Content-Security-Policy',
        value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://vitals.vercel-analytics.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
      },
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
      },
      {
        key: 'Permissions-Policy',
        value: 'geolocation=(), microphone=(), camera=()',
      },
    ];

    return [
      {
        // Static assets are content-hashed by Next.js — safe to cache forever.
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
          ...securityHeaders,
        ],
      },
      {
        // API routes — apply CORS headers and security headers
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'private, no-cache, no-store, must-revalidate' },
          ...corsHeaders,
          ...securityHeaders,
        ],
      },
      {
        // Authenticated app pages — never cache at CDN (private per-user data).
        source: '/(dashboard|checklist|cap-table|team|documents|account|wizard|pace|vendor|integrations|notifications|referrals|marketplace|raising-capital|templates)/:path*',
        headers: [
          { key: 'Cache-Control', value: 'private, no-store' },
          ...securityHeaders,
        ],
      },
      {
        // Public/semi-public pages — CDN caches for 5 min, serves stale for 1 hr.
        // Repeat visitors pay zero server compute during the stale window.
        source: '/(pricing|post-listing|partners|checklist-guide|resources)/:path*',
        headers: [
          { key: 'Cache-Control', value: 's-maxage=300, stale-while-revalidate=3600' },
          ...securityHeaders,
        ],
      },
      {
        // Catch-all security headers for remaining routes
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

module.exports = nextConfig
