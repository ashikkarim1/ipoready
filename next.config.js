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
    return [
      {
        // Static assets are content-hashed by Next.js — safe to cache forever.
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Authenticated app pages — never cache at CDN (private per-user data).
        source: '/(dashboard|checklist|cap-table|team|documents|account|wizard|pace|vendor|integrations|notifications|referrals|marketplace|raising-capital|templates)/:path*',
        headers: [
          { key: 'Cache-Control', value: 'private, no-store' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
      {
        // Public/semi-public pages — CDN caches for 5 min, serves stale for 1 hr.
        // Repeat visitors pay zero server compute during the stale window.
        source: '/(pricing|post-listing|partners|checklist-guide|resources)/:path*',
        headers: [
          { key: 'Cache-Control', value: 's-maxage=300, stale-while-revalidate=3600' },
        ],
      },
      {
        // Security headers on every response.
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options',       value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy',        value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',     value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
