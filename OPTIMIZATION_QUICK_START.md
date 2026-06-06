# CDN & Static Asset Optimization - Quick Start Guide

**Fast-track implementation for Phase 1 Sprint (June 7-20, 2026)**

---

## Day 1: Foundation (2-3 hours)

### Step 1: Install Bundle Analyzer
```bash
cd /Users/test/Documents/Claude/Projects/IPOReady
npm install --save-dev @next/bundle-analyzer
```

### Step 2: Update next.config.js
1. Open `next.config.js`
2. Add at top:
```javascript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
```
3. Wrap final export:
```javascript
module.exports = withBundleAnalyzer(nextConfig)
```
4. Add to `images` config:
```javascript
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
  formats: ['image/avif', 'image/webp', 'image/jpeg'],
  minimumCacheTTL: 31536000,
}
```
5. Expand `optimizePackageImports`:
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

### Step 3: Add Cache Headers
In `next.config.js` `headers()` function, replace the last return statement with this enhanced version:

```javascript
return [
  {
    source: '/_next/static/:path*',
    headers: [
      { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
      { key: 'CDN-Cache-Control', value: 'max-age=31536000' },
      ...securityHeaders,
    ],
  },
  {
    source: '/api/:path*',
    headers: [
      { key: 'Cache-Control', value: 'private, no-cache, no-store, must-revalidate' },
      ...corsHeaders,
      ...securityHeaders,
    ],
  },
  {
    source: '/(dashboard|checklist|cap-table|team|documents|account|wizard|pace|vendor|integrations|notifications|referrals|marketplace|raising-capital|templates)/:path*',
    headers: [
      { key: 'Cache-Control', value: 'private, no-store, must-revalidate' },
      ...securityHeaders,
    ],
  },
  {
    source: '/(pricing|post-listing|partners|checklist-guide|resources)/:path*',
    headers: [
      { key: 'Cache-Control', value: 's-maxage=300, stale-while-revalidate=3600' },
      { key: 'CDN-Cache-Control', value: 'max-age=300' },
      ...securityHeaders,
    ],
  },
  {
    source: '/:path*',
    headers: securityHeaders,
  },
]
```

### Step 4: Test Build
```bash
npm run build
```

**Check output:**
```bash
ls -lh .next/static/chunks/ | grep -E "^-" | head -10
```

Target: Main chunk <100KB gzip

---

## Day 2: Bundle Analysis (1-2 hours)

### Step 1: Run Analyzer
```bash
ANALYZE=true npm run build
```

### Step 2: Review Results
```bash
# Open in browser (macOS)
open .next/analyze/client.html

# or Linux
firefox .next/analyze/client.html
```

### Step 3: Identify Heavy Deps
Look for:
- recharts (charting) — can be lazy-loaded
- pdfkit + pdf-parse (PDF) — server-only
- framer-motion (animations) — already optimized
- Any unexpected large packages

### Step 4: Document Findings
Create `BUNDLE_ANALYSIS_REPORT.md`:
```markdown
# Bundle Analysis Report (Date: June 7, 2026)

## Total Bundle Size
- Main: 85KB gzip
- Chunks: 12KB-45KB each

## Heavy Dependencies
- recharts: 45KB (consider dynamic import)
- framer-motion: 28KB (already optimized)
- googleapis: (verify server-only)

## Recommendations
- [ ] Dynamic import recharts on /dashboard
- [ ] Verify googleapis is server-only
- [ ] Expand optimizePackageImports
```

---

## Day 3: Health Endpoint & Cache Invalidation (2-3 hours)

### Step 1: Create API Health Route
Create file: `src/app/api/health/route.ts`

```typescript
export const runtime = 'edge'

export async function GET() {
  const version = process.env.GIT_COMMIT_SHA || 
                  process.env.VERCEL_GIT_COMMIT_SHA || 
                  'unknown'
  
  return Response.json({
    status: 'healthy',
    version,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  })
}
```

### Step 2: Create Cache Invalidation Library
Create file: `src/lib/cache-invalidation.ts`

Copy from `OPTIMIZATION_IMPLEMENTATION_CODE.md` section 3.

### Step 3: Integrate into Layout
Edit `src/app/layout.tsx`:

At the top, add:
```tsx
'use client'

import { useEffect } from 'react'
```

Create a new component:
```tsx
function ClientSetup() {
  useEffect(() => {
    import('@/lib/cache-invalidation').then(module => {
      module.setupCacheInvalidation()
    })
  }, [])
  return null
}
```

Add to layout render (after `<Providers>`):
```tsx
<ClientSetup />
```

### Step 4: Test
```bash
npm run build
npm run start
```

Open DevTools → Application → check `/api/health` response.

---

## Day 4: Image Optimization (2-3 hours)

### Step 1: Audit Images
```bash
grep -r "img\|Image\|background" src/ --include="*.tsx" | grep -v node_modules
```

### Step 2: Convert to next/image
Find all:
```tsx
<img src="..." />
```

Replace with:
```tsx
import Image from 'next/image'

<Image
  src="..."
  alt="..."
  width={1200}
  height={630}
  quality={75}
  priority={true} // Only for above-the-fold
/>
```

### Step 3: Priority Images
Mark these as `priority={true}`:
- Hero image on landing page
- Dashboard header image
- Product showcase images

Mark these as `priority={false}`:
- Thumbnails
- Below-the-fold content
- Document previews

### Step 4: Responsive Sizes
For images that change size based on viewport:

```tsx
<Image
  src="..."
  alt="..."
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 100vw"
  width={1200}
  height={630}
  quality={75}
/>
```

---

## Day 5: Verification & Testing (2-3 hours)

### Step 1: Build for Production
```bash
npm run build
rm -rf .next
npm run build
```

### Step 2: Test Locally
```bash
npm run start
# Open http://localhost:3000
```

### Step 3: Run Lighthouse
**Option A: Chrome DevTools**
```
F12 → Lighthouse → Generate report
```

**Option B: CLI**
```bash
npm install -g lighthouse
lighthouse http://localhost:3000 --preset=mobile
```

**Option C: PageSpeed Insights**
```
https://pagespeed.web.dev/
```

### Step 4: Check Core Web Vitals
Target scores:
- **Performance: >90**
- **LCP: <2.5s**
- **FID: <100ms**
- **CLS: <0.1**

### Step 5: Verify Headers
```bash
curl -I http://localhost:3000/_next/static/chunks/main*.js | grep -E "Cache-Control|CDN-Cache"
```

Should show:
```
Cache-Control: public, max-age=31536000, immutable
CDN-Cache-Control: max-age=31536000
```

---

## Day 6: Code Splitting (1-2 hours)

### Step 1: Identify Heavy Components
From bundle analysis, find components that:
- Use recharts, PDF libraries, large charting libraries
- Are only used on specific pages
- Have size >30KB

### Step 2: Implement Dynamic Imports
Example for `/dashboard`:

```tsx
import dynamic from 'next/dynamic'

const PerformanceChart = dynamic(
  () => import('@/components/charts/performance'),
  { loading: () => <div>Loading chart...</div> }
)

export default function DashboardPage() {
  return <PerformanceChart />
}
```

### Step 3: Verify Code Split
```bash
ANALYZE=true npm run build
# Check that heavy component is in separate chunk
```

---

## Day 7: Environment Variables & Deploy (1 hour)

### Step 1: Vercel Environment Setup
In Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add:
   - `GIT_COMMIT_SHA` = (auto-filled by Vercel)
   - `NODE_ENV` = production

### Step 2: Local Development
Create `.env.local`:
```bash
GIT_COMMIT_SHA=$(git rev-parse --short HEAD)
NODE_ENV=development
```

### Step 3: Deploy
```bash
git add .
git commit -m "feat: CDN & static asset optimization

- Vercel edge caching for static assets
- Image optimization with next/image
- Bundle analysis and tree-shaking
- Cache headers for all routes
- Client-side cache invalidation
- Git commit hash versioning"

git push origin main
```

### Step 4: Verify Deployment
1. Go to Vercel Dashboard
2. Wait for deployment to complete
3. Run Lighthouse on deployed URL
4. Check `/api/health` endpoint

---

## Measurement Dashboard

Create file: `METRICS_TRACKING.md`

```markdown
# Performance Metrics Tracking

## Baseline (Before Optimization)
- Date: June 7, 2026
- Lighthouse Score: TBD
- LCP: TBD
- FID: TBD
- CLS: TBD
- Main Bundle: TBD KB gzip

## Target (After Optimization)
- Date: June 20, 2026
- Lighthouse Score: >90
- LCP: <2.5s
- FID: <100ms
- CLS: <0.1
- Main Bundle: <100KB gzip

## Progress
| Date | Score | LCP | FID | CLS | Notes |
|------|-------|-----|-----|-----|-------|
| Jun 7 | | | | | Baseline |
| Jun 10 | | | | | After optimization |
| Jun 15 | | | | | Final tuning |
| Jun 20 | | | | | Launch ready |

## Action Items
- [ ] Core Web Vitals > 90
- [ ] No large unused dependencies
- [ ] All images optimized with next/image
- [ ] Cache headers correctly configured
- [ ] Git commit hash versioning deployed
```

---

## Verification Checklist

Before marking as complete:

- [ ] Bundle analyzer installed and working
- [ ] next.config.js updated with cache headers
- [ ] Cache headers verified with `curl -I`
- [ ] `/api/health` endpoint created and responsive
- [ ] Cache invalidation library working
- [ ] Images converted to `<Image>` component
- [ ] Responsive image sizes configured
- [ ] Production build successful
- [ ] Lighthouse score >90 on main routes
- [ ] Core Web Vitals >90
- [ ] No console errors in production
- [ ] Deploy to Vercel and verify metrics
- [ ] Monitor Vercel Analytics dashboard

---

## Common Issues & Fixes

### Issue: Build fails with bundle analyzer
```bash
# Solution: Clear .next and rebuild
rm -rf .next
npm run build
```

### Issue: Images showing as broken
```bash
# Solution: Verify image domain is in next.config.js
# images: { domains: [...] }
```

### Issue: Lighthouse still <90
```bash
# Solutions:
# 1. Check for render-blocking resources
# 2. Verify images have proper sizes
# 3. Check for jank in animations (Framer Motion)
# 4. Lazy load non-critical components
```

### Issue: Cache not clearing after deploy
```bash
# Solution: Ensure /api/health endpoint is working
# Manual clear in DevTools:
window.__clearCache?.()
```

---

## Timeline Summary

| Day | Task | Hours | Status |
|-----|------|-------|--------|
| 1 | Setup, bundle analyzer, next.config.js | 2-3h | |
| 2 | Bundle analysis, findings, docs | 1-2h | |
| 3 | Health endpoint, cache invalidation | 2-3h | |
| 4 | Image optimization, next/image | 2-3h | |
| 5 | Testing, Lighthouse, verification | 2-3h | |
| 6 | Code splitting, dynamic imports | 1-2h | |
| 7 | Deploy, final metrics | 1h | |
| **Total** | | **12-17 hours** | |

**Parallel workstreams possible:**
- Days 2-3 can run in parallel (bundle analysis + health endpoint)
- Days 4-6 can start after Day 1
- Launch target: June 13-15 (buffer before June 20)

---

## Success Metrics (Hard Targets)

🎯 **Core Web Vitals Score: >90**

✅ Achieved when:
- All pages pass Lighthouse with >90
- LCP <2.5s
- FID/INP <100ms
- CLS <0.1
- Bundle <100KB gzip (main)

📊 **Monitor with:**
- PageSpeed Insights (weekly)
- Vercel Analytics (dashboard)
- Lighthouse CI (on each deploy)

---

**Questions? Check:**
1. `CDN_STATIC_ASSET_OPTIMIZATION_PLAN.md` — Full strategy
2. `OPTIMIZATION_IMPLEMENTATION_CODE.md` — Code snippets
3. Browser console: `window.__clearCache()` — Manual cache clear
4. `/api/health` — Version check endpoint

**Ready to start? Begin with Day 1!**
