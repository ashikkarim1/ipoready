# CDN & Static Asset Optimization Plan
**IPOReady MVP - Performance Excellence Initiative**

**Target:** Core Web Vitals > 90 score  
**Deployment:** Vercel Edge Network (automatic with Next.js 14.2.35)  
**Owner:** DevOps / Performance Engineering  
**Timeline:** Implement in Phase 1 Sprint (June 7-20, 2026)

---

## Executive Summary

This plan optimizes IPOReady's static assets and edge caching to achieve Core Web Vitals > 90. The strategy leverages Vercel's built-in edge CDN, image optimization, bundle analysis, and cache busting via git commit hashes. All mechanisms integrate seamlessly with the existing Next.js 14 configuration.

---

## 1. Vercel Edge Caching Strategy

### Current State
- ✅ Next.js 14.2.35 deployed on Vercel (auto-enabled)
- ✅ Cache headers already configured in `next.config.js`
- ✅ Static assets cached for 1 year (immutable)
- ✅ API routes marked `no-cache, no-store`
- ⚠️ Authenticated pages set to `private, no-store` (correct, but could optimize)

### Enhancement 1.1: Static Assets Optimization
**File:** `next.config.js` (lines 82-87)

**Current:**
```javascript
{
  source: '/_next/static/:path*',
  headers: [
    { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
    ...securityHeaders,
  ],
}
```

**Optimized:** Add Vercel-specific edge directives
```javascript
{
  source: '/_next/static/:path*',
  headers: [
    { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
    { key: 'CDN-Cache-Control', value: 'max-age=31536000' }, // Vercel edge
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    ...securityHeaders,
  ],
}
```

**Impact:**
- Vercel Edge Network caches static files globally
- 99%+ cache hit rate (immutable hashes)
- Zero origin requests for repeat assets
- ~200ms → ~10-30ms latency reduction (global edge distribution)

### Enhancement 1.2: Public Pages Cache Strategy
**File:** `next.config.js` (lines 108-113)

**Current:**
```javascript
{
  source: '/(pricing|post-listing|partners|checklist-guide|resources)/:path*',
  headers: [
    { key: 'Cache-Control', value: 's-maxage=300, stale-while-revalidate=3600' },
    ...securityHeaders,
  ],
}
```

**Optimized:** Add versioning headers for cache busting
```javascript
{
  source: '/(pricing|post-listing|partners|checklist-guide|resources)/:path*',
  headers: [
    { key: 'Cache-Control', value: 's-maxage=300, stale-while-revalidate=3600' },
    { key: 'CDN-Cache-Control', value: 'max-age=300' },
    { key: 'X-Content-Version', value: process.env.GIT_COMMIT_SHA || 'unknown' },
    ...securityHeaders,
  ],
}
```

**Impact:**
- Vercel edge caches for 5 minutes
- Serves stale-while-revalidate for 1 hour
- Browser sees `private` but edge serves publicly
- Zero origin requests for 1+ hours after first visitor

### Enhancement 1.3: Authenticated Pages Optimization
**File:** `next.config.js` (lines 99-104)

**Current:** Already correct (`private, no-store`)

**Add intelligent validation:**
```javascript
{
  source: '/(dashboard|checklist|cap-table|team|documents|account|wizard|pace|vendor|integrations|notifications|referrals|marketplace|raising-capital|templates)/:path*',
  headers: [
    { key: 'Cache-Control', value: 'private, no-store, must-revalidate' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    ...securityHeaders,
  ],
}
```

**Note:** Authenticated pages must never be cached at edge (user-specific data). This is already correct.

### Enhancement 1.4: API Routes Optimization
**File:** `next.config.js` (lines 89-96)

**Current:** Correctly set to `no-cache, no-store`

**Add detailed directives:**
```javascript
{
  source: '/api/:path*',
  headers: [
    { key: 'Cache-Control', value: 'private, no-cache, no-store, must-revalidate' },
    { key: 'Pragma', value: 'no-cache' }, // HTTP/1.0 compat
    { key: 'Expires', value: '0' }, // HTTP/1.0 compat
    ...corsHeaders,
    ...securityHeaders,
  ],
}
```

**Impact:**
- API responses never cached
- Fresh data on every request
- Proxy servers must revalidate

---

## 2. Image Optimization (Next.js Image Component)

### Current State
- ✅ Using `next/image` in `src/app/page.tsx`
- ✅ Image domains configured: GitHub avatars, Google User Photos
- ⚠️ Only one image found in current codebase
- ⚠️ No responsive image strategy documented

### Enhancement 2.1: Expand Image Domains
**File:** `next.config.js` (lines 18-20)

**Current:**
```javascript
images: {
  domains: ['avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
}
```

**Optimized:** Add production image CDN + future integrations
```javascript
images: {
  domains: [
    'avatars.githubusercontent.com',
    'lh3.googleusercontent.com',
    'ipoready.ai',
    'www.ipoready.ai',
    'cdn.ipoready.ai',
    'storage.googleapis.com', // For potential Drive integration
    'graph.microsoft.com', // For OneDrive integration
    'api.dropboxapi.com', // For Dropbox integration
  ],
  // Optimized formats & sizes
  formats: ['image/avif', 'image/webp', 'image/jpeg'],
  // Responsive image optimization
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  // Cache optimized images for 1 year (immutable after hashing)
  minimumCacheTTL: 31536000,
}
```

### Enhancement 2.2: Image Optimization in Components

**Audit all image usage:**
```bash
grep -r "img\|<img\|background-image" src/ --include="*.tsx" --include="*.jsx"
```

**Apply pattern for all images:**

**Before:**
```tsx
<img src="https://example.com/image.png" alt="Dashboard" />
```

**After:**
```tsx
import Image from 'next/image'

<Image
  src="https://example.com/image.png"
  alt="Dashboard"
  width={1200}
  height={630}
  priority={true} // Critical images only
  quality={75}    // 75% quality = imperceptible, 30% smaller
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 100vw"
/>
```

**Key attributes:**
- `quality={75}` (default 75) — balances visual quality & size
- `priority={true}` — preload above-the-fold images (LCP improvement)
- `sizes` — responsive image serving based on viewport
- `placeholder="blur"` — shows LQIP while loading (CLS prevention)

### Enhancement 2.3: OG Image & Social Meta Images
**File:** `src/app/layout.tsx` (line 62-69)

**Current:** Using external URL `https://www.ipoready.ai/og-image.png`

**Optimized:** Generate OG images dynamically
```tsx
import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function generateOGImage(pathname: string) {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #1E3A8A 0%, #0F172A 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Plus Jakarta Sans',
        }}
      >
        <h1 style={{ color: 'white', fontSize: '72px' }}>
          IPOReady — Mission Control for Your IPO
        </h1>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
```

**Benefits:**
- OG images generated on-the-fly (no manual updates)
- ~10KB per image (vs 150KB+ for pre-rendered PNG)
- Dynamic content per route (page title auto-included)
- Cached by edge network

### Enhancement 2.4: Image Placeholder Strategy (LQIP)
Apply to all images >100KB:

```tsx
<Image
  src={largeImage}
  alt="..."
  placeholder="blur"
  blurDataURL="data:image/svg+xml,%3Csvg..."
  width={1200}
  height={630}
/>
```

**Impact:**
- Eliminates Cumulative Layout Shift (CLS)
- Users see blurred preview while high-res loads
- +5-10 CLS score improvement

---

## 3. Bundle Analysis & Dependency Optimization

### Current State
- ✅ `optimizePackageImports` enabled for `lucide-react`, `date-fns`
- ✅ Tree-shaking configured (saves ~400KB per documentation)
- ⚠️ No bundle analyzer installed
- ⚠️ Large dependencies not audited
- 983MB node_modules (typical, but some deps may be unused)

### Enhancement 3.1: Install Bundle Analyzer
**File:** `package.json`

```bash
npm install --save-dev @next/bundle-analyzer
```

**Update `next.config.js`:**
```javascript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(nextConfig)
```

**Usage:**
```bash
ANALYZE=true npm run build
```

**What it shows:**
- Client-side bundle breakdown by route
- Tree-shaking opportunities
- Duplicate dependencies
- Large dependencies to replace/remove

### Enhancement 3.2: Audit Large Dependencies

**Key candidates to audit:**
1. `@anthropic-ai/sdk` (0.98.0) — check if API calls are on server only
2. `googleapis` (173.0.0) — should be server-only (`server-only` import)
3. `stripe` (22.1.1) — should be server-only
4. `xlsx` (0.18.5) — large spreadsheet lib, only use on server
5. `pdfkit` (0.18.0) + `pdf-parse` (2.4.5) — ~1-2MB combined
6. `recharts` (3.8.1) — large charting library, consider lazy loading
7. `framer-motion` (12.40.0) — heavy animation lib (but already optimized)

**Verification (ensure server-only):**
```bash
# Check for unexpected imports in client components
grep -r "from '@anthropic-ai/sdk'" src/components/ src/app --include="*.tsx"
grep -r "from 'googleapis'" src/components/ src/app --include="*.tsx"
grep -r "from 'stripe'" src/components/ src/app --include="*.tsx"
```

**Expected result:** No matches (or only in `use server` files)

### Enhancement 3.3: Code Splitting & Dynamic Imports

**For large, route-specific features:**

**Before:**
```tsx
import { ChartComponent } from '@/components/charts'
import { PDFExporter } from '@/lib/pdf-export'

export default function DashboardPage() {
  return <ChartComponent /> // Loaded on every page
}
```

**After:**
```tsx
import dynamic from 'next/dynamic'

const ChartComponent = dynamic(() => import('@/components/charts'), {
  loading: () => <div>Loading chart...</div>,
  ssr: false, // Only on client if needed
})

const PDFExporter = dynamic(() => import('@/lib/pdf-export'), {
  loading: () => <div>Loading exporter...</div>,
})

export default function DashboardPage() {
  return <ChartComponent /> // Only loaded when this page renders
}
```

**Apply to:**
- `/dashboard` → heavy chart rendering
- `/documents` → PDF utilities
- `/cap-table` → spreadsheet views

### Enhancement 3.4: Package Import Optimization
**File:** `next.config.js` (lines 12-15)

**Current:**
```javascript
optimizePackageImports: [
  'lucide-react',
  'date-fns',
]
```

**Optimized:** Expand to other heavy libraries
```javascript
optimizePackageImports: [
  'lucide-react',
  'date-fns',
  '@radix-ui/react-dropdown-menu',
  '@radix-ui/react-label',
  '@radix-ui/react-select',
  '@radix-ui/react-slot',
]
```

**Result:**
- Only imported icons/functions are bundled
- Unused exports removed automatically
- ~50-100KB additional savings per route

### Enhancement 3.5: Remove Unused Dependencies

**Before build, run:**
```bash
npm ls --depth=0
npm outdated
npm audit
```

**Candidates for removal:**
- `twilio` (6.0.2) — if SMS not used in MVP (server-only in Phase 2)
- `@react-email/components` — only used for email templates (server-only)
- `office-text-extractor` — if document parsing only on server

**Strategy:** Move non-essential packages to `optionalDependencies` or Phase 2

---

## 4. CSS & JavaScript Minification

### Current State
- ✅ **Built-in:** Next.js 14 automatically minifies in production
- ✅ **Compression:** `compress: true` already enabled in `next.config.js` (line 23)
- ✅ **Source maps disabled:** `productionBrowserSourceMaps: false` (line 27)

### Enhancement 4.1: Verify Minification
**Build and inspect:**
```bash
npm run build
```

**Check output sizes:**
```
.next/static/chunks/
  app-<hash>.js — Should be <50KB
  main-<hash>.js — Should be <100KB
```

**If larger:** Bundle analyzer will identify issues

### Enhancement 4.2: CSS Optimization
**File:** `src/app/globals.css`

**Verify Tailwind purging:**
```javascript
// tailwind.config.js
export default {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
}
```

**Result:**
- Only used Tailwind utilities included
- Typical CSS output: 30-50KB (before compression)
- Gzip compression: ~8-12KB

### Enhancement 4.3: Production Build Verification
**Post-build checklist:**
```bash
# 1. Verify minified output
ls -lh .next/static/chunks/*.js | head -10

# 2. Check Gzip compression
gzip .next/static/chunks/main-*.js -c | wc -c

# 3. Analyze bundle sizes
npm run build 2>&1 | grep -E "page size|chunks"
```

**Target metrics:**
- Main bundle: <100KB gzip
- Per-page chunks: <50KB gzip
- Total `_next` payload: <500KB (all routes combined)

---

## 5. Cache Busting Strategy (Git Commit Hash)

### Current State
- ✅ Static assets use content hashing (automatic)
- ❌ No explicit commit-based versioning in headers
- ❌ No cache invalidation trigger on deploy

### Enhancement 5.1: Implement Git Commit Hash Versioning
**File:** `src/app/layout.tsx`

**Add build-time commit info:**
```tsx
// At top of layout.tsx
import { execSync } from 'child_process'

let GIT_COMMIT_HASH = 'unknown'
let BUILD_TIMESTAMP = new Date().toISOString()

try {
  GIT_COMMIT_HASH = execSync('git rev-parse --short HEAD').toString().trim()
  // or fetch from env if available in CI
  GIT_COMMIT_HASH = process.env.GIT_COMMIT_SHA || GIT_COMMIT_HASH
} catch {
  // Graceful fallback in environments without git
}

export const metadata: Metadata = {
  // ... existing metadata ...
  icons: {
    icon: `/favicon.svg?v=${GIT_COMMIT_HASH}`,
  },
}
```

### Enhancement 5.2: Add Version Headers to API Routes
**File:** Create `src/app/api/health/route.ts`

```typescript
export async function GET() {
  return Response.json({
    status: 'healthy',
    version: process.env.GIT_COMMIT_SHA || 'unknown',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  })
}
```

**Usage:**
- Clients can poll `/api/health` to detect deployments
- If version changed, clear local cache
- Enables zero-downtime cache invalidation

### Enhancement 5.3: Vercel Environment Variables
**Create:** `.env.local` (local development only)

**Or add to Vercel Dashboard:**
```
GIT_COMMIT_SHA = (auto-populated by Vercel)
BUILD_TIMESTAMP = (auto-populated during build)
```

**Vercel's automatic commit tracking:**
- Every Vercel deployment captures `VERCEL_GIT_COMMIT_SHA`
- Inject into headers automatically

### Enhancement 5.4: Client-Side Cache Invalidation
**File:** `src/lib/cache-invalidation.ts`

```typescript
/**
 * Monitor deployed version and invalidate caches on updates
 */
export async function setupCacheInvalidation() {
  let lastVersion: string | null = null

  setInterval(async () => {
    try {
      const response = await fetch('/api/health', {
        cache: 'no-store',
      })
      const { version } = await response.json()

      if (lastVersion && version !== lastVersion) {
        console.log(`Deployment detected. New version: ${version}`)
        
        // Clear all caches
        if ('caches' in window) {
          const cacheNames = await caches.keys()
          await Promise.all(
            cacheNames.map(name => caches.delete(name))
          )
        }

        // Soft reload (show notification to user)
        window.location.reload()
      }

      lastVersion = version
    } catch (error) {
      console.error('Failed to check deployment', error)
    }
  }, 5 * 60 * 1000) // Check every 5 minutes
}
```

**Usage in layout:**
```tsx
'use client'
import { setupCacheInvalidation } from '@/lib/cache-invalidation'

export function RootClientProviders() {
  useEffect(() => {
    setupCacheInvalidation()
  }, [])
  // ...
}
```

---

## 6. Core Web Vitals Optimization Roadmap

### Target: >90 Score (Lighthouse)

| Metric | Current* | Target | Impact |
|--------|----------|--------|--------|
| **Largest Contentful Paint (LCP)** | ~2.8s | <2.5s | Image optimization, async fonts |
| **First Input Delay (FID)** | ~80ms | <100ms | Code splitting, lazy loading |
| **Cumulative Layout Shift (CLS)** | ~0.1 | <0.1 | Image dimensions, placeholder |
| **First Contentful Paint (FCP)** | ~1.2s | <1.2s | Critical CSS, fonts preload |
| **Time to First Byte (TTFB)** | ~200ms | <600ms | Vercel edge, revalidation |

*Estimated before optimizations

### 6.1: LCP Optimization (<2.5s target)

**Largest Contentful Paint is typically:**
- Hero image
- Main dashboard chart
- Document list table

**Actions:**
1. ✅ Mark hero images with `priority={true}`
2. ✅ Preload Google Fonts
3. ✅ Optimize image sizes (75% quality)
4. ✅ Use AVIF format where supported

**Code example:**
```tsx
// src/app/page.tsx
<Image
  src={dashboardImage}
  alt="Dashboard"
  priority={true} // Critical for LCP
  quality={75}    // 30% smaller, imperceptible
  sizes="(max-width: 768px) 100vw, 90vw"
/>
```

### 6.2: FID/INP Optimization (<100ms)

**First Input Delay / Interaction to Next Paint**

**Actions:**
1. ✅ Code split heavy components (recharts, PDFs)
2. ✅ Use `use server` for non-interactive routes
3. ✅ Debounce form inputs
4. ✅ Remove jank from Framer Motion animations

**Example:**
```tsx
// Already optimal: Force-dynamic for interactivity
export const dynamic = 'force-dynamic'

// Debounce search input
const [search, setSearch] = useState('')
const debouncedSearch = useMemo(
  () => debounce((value: string) => searchDocuments(value), 300),
  []
)
```

### 6.3: CLS Optimization (<0.1 target)

**Cumulative Layout Shift — prevent jank**

**Actions:**
1. ✅ All images have `width` & `height` props
2. ✅ Placeholders for dynamic content
3. ✅ Skeletons for loading states
4. ✅ Font `display: 'swap'` to prevent FOUT

**Current code (good):**
```tsx
const hanken = Hanken_Grotesk({
  display: 'swap', // ✅ Prevents flash of unstyled text
})
```

### 6.4: TTFB Optimization (<600ms)

**Time to First Byte**

**Actions:**
1. ✅ Vercel edge caching (automatic)
2. ✅ ISR for static pages
3. ✅ Preload critical resources

**ISR example (pricing page):**
```tsx
// src/app/pricing/page.tsx
export const revalidate = 3600 // Revalidate every hour
export const dynamicParams = false

export default function PricingPage() {
  // ...
}
```

---

## 7. Implementation Checklist

### Phase 1: Immediate (By June 13)

- [ ] **1.1** Add `CDN-Cache-Control` headers to `next.config.js`
- [ ] **1.4** Verify API routes have `no-cache, no-store`
- [ ] **2.1** Expand `images.domains` in `next.config.js`
- [ ] **2.2** Audit all `<img>` tags, convert to `<Image>`
- [ ] **2.3** Generate dynamic OG images (optional Phase 1.5)
- [ ] **3.1** Install `@next/bundle-analyzer`
- [ ] **3.2** Run `ANALYZE=true npm run build` and review results
- [ ] **3.3** Identify route-specific features for lazy loading
- [ ] **3.4** Expand `optimizePackageImports` list
- [ ] **4.1** Verify minification with `npm run build`
- [ ] **5.1** Add `GIT_COMMIT_SHA` to environment
- [ ] **5.2** Create `/api/health` endpoint
- [ ] **6.x** Run Lighthouse audit on all main routes

### Phase 2: Short-term (By June 20)

- [ ] **2.2** Convert all images to `<Image>` with responsive sizes
- [ ] **2.4** Add blur placeholders to large images
- [ ] **3.3** Implement dynamic imports for recharts, PDF
- [ ] **5.4** Implement client-side cache invalidation
- [ ] **6.x** Measure Core Web Vitals, iterate

### Phase 3: Ongoing

- [ ] Monitor Core Web Vitals in production (via Vercel Analytics)
- [ ] Re-run bundle analysis after each major dependency update
- [ ] Audit performance metrics weekly
- [ ] Update cache headers based on real-world usage patterns

---

## 8. Measurement & Monitoring

### 8.1: Local Testing
**Before deployment:**
```bash
npm run build
npm run start
# Open http://localhost:3000
# Press F12 → Lighthouse → Generate report
```

**Target:**
- Performance: >90
- Accessibility: >90
- Best Practices: >90
- SEO: >90

### 8.2: Vercel Analytics
**Enable in Vercel Dashboard:**
- Web Vitals monitoring (automatic with Next.js)
- Real user metrics (RUM)
- Deployment analytics

**Dashboard URL:** `vercel.com/projects/ipoready/analytics`

### 8.3: Third-Party Tools
**Recommended:**
1. **Google PageSpeed Insights** — Free, official CWV source
2. **WebPageTest** — Deep waterfall analysis
3. **GTmetrix** — Performance trends over time
4. **Sentry** — Error tracking + performance monitoring

**Setup Sentry (optional):**
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

---

## 9. Configuration Files Summary

### Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `next.config.js` | Modify | Add CDN headers, image domains, bundle analyzer |
| `src/app/layout.tsx` | Modify | Add git commit hash to metadata |
| `src/app/api/health/route.ts` | Create | Version endpoint for cache invalidation |
| `src/lib/cache-invalidation.ts` | Create | Client-side cache monitor |
| `package.json` | Modify | Add `@next/bundle-analyzer` dev dependency |

### No Changes Required
- ✅ `src/app/globals.css` — Tailwind already optimized
- ✅ Compression settings — Already enabled
- ✅ Source maps — Already disabled
- ✅ Font loading — Already optimized with `display: 'swap'`

---

## 10. Expected Outcomes

### Before Optimization
- Core Web Vitals: ~70-75
- LCP: ~2.8s
- FID: ~90ms
- CLS: ~0.15
- Bundle size: ~150KB gzip (main)

### After Optimization
- **Core Web Vitals: >90** ✅
- **LCP: <2.5s** ✅ (via image optimization + priority)
- **FID: <100ms** ✅ (via code splitting)
- **CLS: <0.1** ✅ (via image dimensions + placeholders)
- **Bundle size: <100KB gzip** ✅ (via tree-shaking + minification)

### Performance Gains
- **Vercel Edge:** 5-10x faster for repeat global users
- **Image optimization:** 40-50% smaller images
- **Bundle analysis:** 20-30% smaller main JS
- **Cache busting:** Zero-downtime deployments

---

## 11. Appendix: Useful Commands

```bash
# Bundle analysis
ANALYZE=true npm run build

# Production build
npm run build

# Local production server
npm run start

# Check bundle sizes
du -sh .next/static/chunks/*.js

# Lighthouse audit
npm install -g lighthouse
lighthouse https://localhost:3000 --preset=mobile

# Check git commit hash
git rev-parse --short HEAD

# Monitor Vercel deployments
vercel list

# View logs
vercel logs
```

---

## 12. Success Criteria

✅ **Achieved when:**

1. Lighthouse Core Web Vitals score: **>90**
2. LCP <2.5s on all main routes
3. FID/INP <100ms
4. CLS <0.1
5. Bundle analysis identifies no large unused dependencies
6. Cache headers correctly configured for all route types
7. Images optimized with `<Image>` component
8. Git commit hash versioning deployed
9. `/api/health` endpoint operational
10. Vercel analytics dashboard shows consistent >90 scores

---

**Document Version:** 1.0  
**Created:** June 7, 2026  
**Owner:** DevOps / Performance Engineering  
**Review Cycle:** After Phase 1 launch (June 20)
