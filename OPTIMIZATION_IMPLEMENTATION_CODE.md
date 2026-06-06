# CDN & Static Asset Optimization - Implementation Code

Ready-to-use code snippets for all enhancements in the optimization plan.

---

## 1. Enhanced `next.config.js`

Complete replacement for cache header optimization:

```javascript
/** @type {import('next').NextConfig} */

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@neondatabase/serverless'],
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-label',
      '@radix-ui/react-select',
      '@radix-ui/react-slot',
    ],
  },

  images: {
    domains: [
      'avatars.githubusercontent.com',
      'lh3.googleusercontent.com',
      'ipoready.ai',
      'www.ipoready.ai',
      'cdn.ipoready.ai',
      'storage.googleapis.com',
      'graph.microsoft.com',
      'api.dropboxapi.com',
    ],
    // Optimized formats & sizes
    formats: ['image/avif', 'image/webp', 'image/jpeg'],
    // Responsive image optimization
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Cache optimized images for 1 year (immutable after hashing)
    minimumCacheTTL: 31536000,
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
      { key: 'Access-Control-Max-Age', value: '86400' },
    ]

    // Common security headers applied to all responses
    const securityHeaders = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-XSS-Protection', value: '1; mode=block' },
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains; preload',
      },
      {
        key: 'Content-Security-Policy',
        value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://vitals.vercel-analytics.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
      },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
    ]

    // Get git commit hash (for cache busting)
    const gitCommitSha = process.env.GIT_COMMIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA || 'unknown'

    return [
      {
        // Static assets are content-hashed by Next.js — safe to cache forever.
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
          { key: 'CDN-Cache-Control', value: 'max-age=31536000' }, // Vercel edge
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Version', value: gitCommitSha },
          ...securityHeaders,
        ],
      },
      {
        // API routes — apply CORS headers and security headers
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'private, no-cache, no-store, must-revalidate' },
          { key: 'Pragma', value: 'no-cache' }, // HTTP/1.0 compat
          { key: 'Expires', value: '0' }, // HTTP/1.0 compat
          { key: 'X-Version', value: gitCommitSha },
          ...corsHeaders,
          ...securityHeaders,
        ],
      },
      {
        // Authenticated app pages — never cache at CDN (private per-user data).
        source: '/(dashboard|checklist|cap-table|team|documents|account|wizard|pace|vendor|integrations|notifications|referrals|marketplace|raising-capital|templates)/:path*',
        headers: [
          { key: 'Cache-Control', value: 'private, no-store, must-revalidate' },
          { key: 'X-Version', value: gitCommitSha },
          ...securityHeaders,
        ],
      },
      {
        // Public/semi-public pages — CDN caches for 5 min, serves stale for 1 hr.
        // Repeat visitors pay zero server compute during the stale window.
        source: '/(pricing|post-listing|partners|checklist-guide|resources)/:path*',
        headers: [
          { key: 'Cache-Control', value: 's-maxage=300, stale-while-revalidate=3600' },
          { key: 'CDN-Cache-Control', value: 'max-age=300' },
          { key: 'X-Content-Version', value: gitCommitSha },
          ...securityHeaders,
        ],
      },
      {
        // Catch-all security headers for remaining routes
        source: '/:path*',
        headers: [
          { key: 'X-Version', value: gitCommitSha },
          ...securityHeaders,
        ],
      },
    ]
  },
}

module.exports = withBundleAnalyzer(nextConfig)
```

---

## 2. API Health Endpoint

**File:** `src/app/api/health/route.ts`

```typescript
/**
 * Health check endpoint for deployment monitoring
 * Used by client-side cache invalidation to detect deployments
 */

export const runtime = 'edge' // Ultra-fast edge response

export async function GET() {
  const gitCommitSha = process.env.GIT_COMMIT_SHA || 
                       process.env.VERCEL_GIT_COMMIT_SHA || 
                       'unknown'

  return Response.json({
    status: 'healthy',
    version: gitCommitSha,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    uptime: process.uptime?.() || 0,
  }, {
    headers: {
      'Cache-Control': 'public, max-age=60', // Cache for 1 minute
      'X-Version': gitCommitSha,
    },
  })
}

export async function HEAD() {
  return new Response(null, { status: 200 })
}
```

---

## 3. Client-Side Cache Invalidation

**File:** `src/lib/cache-invalidation.ts`

```typescript
/**
 * Monitor deployed version and invalidate caches on updates
 * This runs in the browser and detects when a new version is deployed
 */

let lastVersion: string | null = null
let isCheckingVersion = false

async function fetchCurrentVersion(): Promise<string | null> {
  try {
    const response = await fetch('/api/health', {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000), // 5 second timeout
    })

    if (!response.ok) {
      console.warn(`Health check returned ${response.status}`)
      return null
    }

    const data = await response.json()
    return data.version || null
  } catch (error) {
    console.warn('Failed to fetch deployment version:', error)
    return null
  }
}

async function clearAllCaches(): Promise<void> {
  try {
    // Clear Service Worker caches
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames.map(name => {
          console.log(`Clearing cache: ${name}`)
          return caches.delete(name)
        })
      )
    }

    // Clear localStorage cache (if any)
    const localStorageKeysToRemove = Object.keys(localStorage).filter(
      key => key.startsWith('cache_') || key.startsWith('app_cache_')
    )
    localStorageKeysToRemove.forEach(key => localStorage.removeItem(key))

    // Clear sessionStorage
    sessionStorage.clear()

    console.log('All caches cleared')
  } catch (error) {
    console.error('Error clearing caches:', error)
  }
}

/**
 * Check for new deployments and reload if needed
 */
async function checkForDeployment(): Promise<void> {
  if (isCheckingVersion) return

  isCheckingVersion = true

  try {
    const currentVersion = await fetchCurrentVersion()

    if (!currentVersion) {
      isCheckingVersion = false
      return
    }

    // First check: store the initial version
    if (!lastVersion) {
      lastVersion = currentVersion
      console.log(`[Cache Monitor] Current version: ${currentVersion}`)
      isCheckingVersion = false
      return
    }

    // Subsequent checks: compare with stored version
    if (currentVersion !== lastVersion) {
      console.log(
        `[Cache Monitor] New deployment detected! ${lastVersion} → ${currentVersion}`
      )

      // Clear all caches
      await clearAllCaches()

      // Show notification to user (optional)
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('IPOReady Updated', {
          body: 'The app has been updated. Reloading...',
          tag: 'app-update',
          requireInteraction: false,
        })
      }

      // Wait a bit for caches to clear, then reload
      setTimeout(() => {
        window.location.reload()
      }, 1000)

      return
    }

    console.log(`[Cache Monitor] Version check: ${currentVersion} (no changes)`)
  } finally {
    isCheckingVersion = false
  }
}

/**
 * Initialize cache invalidation monitoring
 * Call this once in the root layout
 */
export function setupCacheInvalidation(): void {
  if (typeof window === 'undefined') return

  // Initial check
  checkForDeployment()

  // Check every 5 minutes (can be adjusted based on deployment frequency)
  const intervalId = setInterval(() => {
    checkForDeployment()
  }, 5 * 60 * 1000)

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    clearInterval(intervalId)
  })
}

/**
 * Manual trigger for cache clearing
 * Can be called from DevTools or testing
 */
export async function manualCacheClear(): Promise<void> {
  console.log('[Cache Monitor] Manual cache clear triggered')
  await clearAllCaches()
  console.log('[Cache Monitor] Manual cache clear completed')
}

// Make available to window for debugging
if (typeof window !== 'undefined') {
  ;(window as any).__clearCache = manualCacheClear
  ;(window as any).__checkVersion = checkForDeployment
}
```

---

## 4. Updated Root Layout with Cache Invalidation

**File:** `src/app/layout.tsx` (key changes)

Add this import and hook at the top:

```tsx
'use client'

import { useEffect } from 'react'

export function RootClientProviders() {
  useEffect(() => {
    // Only run in browser
    if (typeof window !== 'undefined') {
      import('@/lib/cache-invalidation').then(module => {
        module.setupCacheInvalidation()
      })
    }
  }, [])

  return (
    // ... existing providers ...
  )
}
```

Then use it in the layout:

```tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>
        <Providers>
          <RootClientProviders />
          {children}
        </Providers>
      </body>
    </html>
  )
}
```

---

## 5. Image Optimization Examples

### Pattern 1: Homepage Hero Image

**File:** `src/app/page.tsx`

```tsx
import Image from 'next/image'
import dashboardImage from '../../public/images/mainmenu.png'

export default function HomePage() {
  return (
    <section className="hero">
      <Image
        src={dashboardImage}
        alt="IPOReady Dashboard Overview"
        priority={true} // Critical for LCP (load before other images)
        quality={75}    // Imperceptible quality loss, 30% smaller
        sizes="(max-width: 640px) 100vw,
               (max-width: 1024px) 90vw,
               1200px"
        placeholder="blur" // Show blurred version while loading
        className="rounded-lg shadow-lg"
      />
    </section>
  )
}
```

### Pattern 2: User Avatar (External)

```tsx
import Image from 'next/image'

export function UserAvatar({ photoUrl, name }: { photoUrl: string; name: string }) {
  return (
    <Image
      src={photoUrl}
      alt={`${name}'s avatar`}
      width={48}
      height={48}
      quality={75}
      className="rounded-full"
      // Don't use priority for avatars (not critical)
      // Don't use placeholder (small images load fast)
    />
  )
}
```

### Pattern 3: Dynamic Image with Placeholder

```tsx
'use client'

import Image from 'next/image'
import { useState } from 'react'

export function DocumentThumbnail({ docUrl }: { docUrl: string }) {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className="relative w-full aspect-square bg-gray-100">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <Image
        src={docUrl}
        alt="Document preview"
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        quality={75}
        onLoadingComplete={() => setIsLoading(false)}
        className={`object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
      />
    </div>
  )
}
```

### Pattern 4: Responsive Srcset (Multiple Sizes)

```tsx
import Image from 'next/image'

export function ResponsiveChartImage() {
  return (
    <Image
      src="/charts/performance-overview.png"
      alt="Performance metrics chart"
      width={1200}
      height={600}
      quality={85} // Higher quality for charts
      sizes="(max-width: 768px) 100vw,
             (max-width: 1024px) 80vw,
             (max-width: 1280px) 70vw,
             1000px"
      priority={false} // Load after critical images
    />
  )
}
```

---

## 6. Dynamic Imports for Code Splitting

**File:** `src/app/dashboard/page.tsx`

```tsx
import dynamic from 'next/dynamic'

// Lazy-load heavy components
const PerformanceChart = dynamic(
  () => import('@/components/charts/performance'),
  {
    loading: () => <ChartSkeleton />,
    ssr: true, // SSR for SEO, but code-split on client
  }
)

const DocumentExporter = dynamic(
  () => import('@/components/exporters/document-exporter'),
  {
    loading: () => <div>Loading exporter...</div>,
    ssr: false, // Client-only feature
  }
)

export default function DashboardPage() {
  return (
    <main>
      <h1>Dashboard</h1>
      <PerformanceChart /> {/* Only loads when this page renders */}
      <DocumentExporter /> {/* Only on client, only when visible */}
    </main>
  )
}
```

---

## 7. OG Image Generation (Optional)

**File:** `src/app/opengraph-image.tsx`

```tsx
import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'IPOReady - Mission Control for Your IPO'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #1E3A8A 0%, #0F172A 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          color: 'white',
          padding: '40px',
        }}
      >
        <h1
          style={{
            fontSize: '72px',
            fontWeight: 'bold',
            margin: '0 0 20px 0',
            textAlign: 'center',
          }}
        >
          IPOReady
        </h1>
        <p
          style={{
            fontSize: '32px',
            margin: '0',
            textAlign: 'center',
            opacity: 0.9,
          }}
        >
          Mission Control for Your IPO
        </p>
      </div>
    ),
    {
      ...size,
    }
  )
}
```

**Then reference in layout metadata:**

```tsx
export const metadata: Metadata = {
  openGraph: {
    images: [
      {
        url: '/opengraph-image.png', // Auto-generated
        width: 1200,
        height: 630,
      },
    ],
  },
}
```

---

## 8. Bundle Analysis Script

**File:** `scripts/analyze-bundle.sh`

```bash
#!/bin/bash

echo "Building with bundle analysis enabled..."
ANALYZE=true npm run build

echo ""
echo "Bundle analysis complete!"
echo "Open .next/analyze/client.html in a browser to view interactive chart"
echo ""
echo "Common issues to look for:"
echo "  - Large dependencies (recharts, framer-motion, etc.)"
echo "  - Duplicate packages"
echo "  - Unused exports"
echo ""
echo "Recommendations:"
echo "  1. Use dynamic imports for heavy components"
echo "  2. Ensure server-only packages aren't in client bundle"
echo "  3. Check if dependencies are tree-shakeable"
```

Usage:
```bash
chmod +x scripts/analyze-bundle.sh
./scripts/analyze-bundle.sh
```

---

## 9. package.json Updates

Add to `package.json`:

```json
{
  "devDependencies": {
    "@next/bundle-analyzer": "^14.2.35"
  },
  "scripts": {
    "analyze": "ANALYZE=true next build",
    "analyze:view": "open .next/analyze/client.html"
  }
}
```

Install:
```bash
npm install --save-dev @next/bundle-analyzer
```

---

## 10. Environment Variables

**Create `.env.local` (development):**

```bash
# Cache busting
GIT_COMMIT_SHA=$(git rev-parse --short HEAD)
```

**Vercel Dashboard:** Set these in Project Settings → Environment Variables

```
GIT_COMMIT_SHA = (auto-populated by Vercel)
VERCEL_GIT_COMMIT_SHA = (auto-populated by Vercel)
```

Vercel automatically provides:
- `VERCEL_GIT_COMMIT_SHA`
- `VERCEL_DEPLOYMENT_ID`
- `VERCEL_URL`

---

## 11. Debugging Console Commands

Add to browser DevTools console:

```javascript
// Check current version
fetch('/api/health').then(r => r.json()).then(d => console.log('Current version:', d.version))

// Manually clear all caches
window.__clearCache?.()

// Force version check
window.__checkVersion?.()

// Check Service Worker status
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Service Workers:', regs)
  regs.forEach(reg => reg.unregister())
})

// Check IndexedDB
Object.keys(indexedDB).forEach(key => {
  const req = indexedDB.deleteDatabase(key)
  req.onsuccess = () => console.log(`Deleted database: ${key}`)
})
```

---

## 12. Performance Measurement

**File:** `src/lib/performance-monitor.ts`

```typescript
/**
 * Monitor Core Web Vitals and send to analytics
 */

export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return

  // Web Vitals
  const reportWebVitals = async (metric: any) => {
    // Example: Send to your analytics service
    console.log(`[Vitals] ${metric.name}: ${metric.value.toFixed(0)}ms`)

    // Send to Vercel Analytics (automatic if using Next.js)
    // or your own analytics service
    if ('navigator' in window && 'sendBeacon' in navigator) {
      const data = JSON.stringify({
        name: metric.name,
        value: metric.value,
        id: metric.id,
        timestamp: new Date().toISOString(),
      })

      navigator.sendBeacon('/api/analytics/vitals', data)
    }
  }

  // Import dynamic to avoid bundling in non-browser contexts
  import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    getCLS(reportWebVitals)
    getFID(reportWebVitals)
    getFCP(reportWebVitals)
    getLCP(reportWebVitals)
    getTTFB(reportWebVitals)
  })
}
```

---

## Implementation Order

1. **First:** Update `next.config.js` with new headers and bundle analyzer
2. **Second:** Create `/api/health/route.ts` endpoint
3. **Third:** Create `src/lib/cache-invalidation.ts` and integrate into layout
4. **Fourth:** Install `@next/bundle-analyzer` and run analysis
5. **Fifth:** Convert images to `<Image>` component
6. **Sixth:** Deploy and monitor Core Web Vitals

---

**Ready to implement! Use these code snippets directly in your project.**
