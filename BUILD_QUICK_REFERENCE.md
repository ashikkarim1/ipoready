# IPOReady Build Quick Reference Card

One-page reference for the most common build & verification tasks.

---

## TL;DR - Complete Build in 5 Minutes

```bash
# 1. Setup (one time only)
npm install
cp .env.example .env.local
# Edit .env.local with your values

# 2. Verify
node scripts/verify-build.js

# 3. Dev
npm run dev

# 4. Test
# Visit http://localhost:3000 in browser
# Check console (F12) for errors
```

---

## Common Commands

| Task | Command |
|------|---------|
| **Start dev** | `npm run dev` |
| **Build for production** | `npm run build` |
| **Run verification** | `node scripts/verify-build.js` |
| **Type check** | `npx tsc --noEmit` |
| **Lint code** | `npm run lint` |
| **Fix lint issues** | `npm run lint -- --fix` |
| **Run tests** | `npm run test` |
| **Migrate database** | `npm run db:migrate` |
| **Start production server** | `npm run start` |

---

## File Structure - Key Locations

```
IPOReady/
├── src/
│   ├── app/              ← All page routes and layouts
│   ├── components/       ← Reusable React components
│   ├── lib/             ← Utilities and helpers
│   ├── db/              ← Database logic
│   └── styles/          ← Global styles
├── scripts/
│   ├── verify-build.js  ← Build verification tool
│   ├── verify-build.sh  ← Build verification (bash)
│   └── route-test-urls.txt ← All testable URLs
├── .next/               ← Build output (generated)
├── next.config.js       ← Next.js configuration
├── tsconfig.json        ← TypeScript configuration
├── package.json         ← Dependencies & scripts
├── .env.local          ← Environment variables
├── BUILD_VERIFICATION.md ← Detailed checklist
└── VERIFICATION_TOOLS_README.md ← How to use tools
```

---

## Environment Setup

### Required Variables in .env.local

```
# Database
DATABASE_URL=postgresql://user:password@host/dbname

# Authentication
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Third-party services
NEXT_PUBLIC_STRIPE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Optional (if you have these integrations)
TWILIO_ACCOUNT_SID=...
SENDGRID_API_KEY=...
```

### Get These From

- **Database**: Neon dashboard
- **Auth**: Generate with `openssl rand -base64 32`
- **Stripe**: Stripe dashboard
- **Google**: Google Cloud Console
- **Others**: Check `.env.example`

---

## Quick Test Routes

### Must-Test Public Routes
- `http://localhost:3000/` (home)
- `http://localhost:3000/login` (login form)
- `http://localhost:3000/pricing` (pricing page)

### Must-Test Authenticated Routes
- `http://localhost:3000/dashboard` (main dash)
- `http://localhost:3000/dashboard/documents` (docs)
- `http://localhost:3000/dashboard/compliance` (compliance)
- `http://localhost:3000/dashboard/cap-table` (cap table)

### See All Routes
```bash
cat scripts/route-test-urls.txt
```

---

## Browser Validation Checklist

When testing in browser:

```
Console (F12):
☐ No red errors
☐ No "hydration mismatch" warnings
☐ No CORS errors
☐ No 404 for resources

Network tab:
☐ All requests 200 status
☐ API calls complete
☐ No timeouts

Application tab:
☐ Cookies present (if logged in)
☐ No sensitive data visible
☐ localStorage clean
```

---

## Verification Results

| Item | Status | Notes |
|------|--------|-------|
| Node.js (18+) | ✅/❌ | |
| Dependencies | ✅/❌ | |
| .env.local | ✅/❌ | |
| TypeScript | ✅/❌ | No errors |
| Build | ✅/❌ | < 120 seconds |
| Pages loaded | ✅/❌ | All critical pages |
| No console errors | ✅/❌ | |
| DB connection | ✅/❌ | |
| Auth works | ✅/❌ | |

Copy this and fill in after running verification.

---

## Build Artifact Info

After `npm run build`:

```
.next/static/
├── chunks/           ← JavaScript code (split by route)
├── css/              ← CSS files
└── [hash].js/css     ← Hashed static files

Key Stats:
- Main bundle size: Check with: du -sh .next/static/
- Build time: Should be < 120 seconds
- Files: All routes should have chunks generated
```

---

## Troubleshooting - Quick Fixes

| Problem | Solution |
|---------|----------|
| **Port 3000 in use** | `npm run dev -- -p 3001` |
| **TypeScript errors** | `npx tsc --noEmit` to see all errors |
| **Dependencies broken** | `rm -rf node_modules && npm install` |
| **.env missing** | `cp .env.example .env.local` |
| **Build fails** | Check /tmp/build.log (if running verification script) |
| **Out of memory** | `NODE_OPTIONS=--max-old-space-size=4096 npm run build` |
| **Database error** | Check DATABASE_URL in .env.local |
| **Auth not working** | Verify NEXTAUTH_SECRET is set |

---

## Performance Targets

These are good targets to aim for:

```
Build Performance:
✅ Build time: < 120 seconds
✅ Main bundle: < 250 KB (gzipped)
✅ Total build: < 500 MB on disk
✅ TypeScript errors: 0
✅ ESLint errors: 0

Runtime Performance:
✅ Initial page load: < 2 seconds
✅ API response: < 500 ms
✅ Lighthouse score: > 75
✅ No console errors: Always

Availability:
✅ Uptime: 99.9%
✅ Database: Connected
✅ All routes: Working
```

---

## Pre-Deployment Checklist

Before pushing to production:

```
Code Quality:
☐ No console.log() statements
☐ No TODO/FIXME comments (unfixed)
☐ No hardcoded secrets/keys
☐ Types all correct (tsc --noEmit passes)
☐ Linting passes (npm run lint)

Security:
☐ Environment variables secure
☐ No sensitive data in frontend
☐ HTTPS enabled (for production)
☐ CORS configured correctly
☐ SQL injection prevention active

Testing:
☐ All pages load without error
☐ No broken links
☐ Forms submit correctly
☐ Authentication works
☐ Database queries complete

Performance:
☐ Bundle size acceptable
☐ No large files
☐ Images optimized
☐ No memory leaks
☐ Build completes in time
```

---

## Documentation Links

| Document | Purpose |
|----------|---------|
| `BUILD_VERIFICATION.md` | Complete 200-point verification checklist |
| `VERIFICATION_TOOLS_README.md` | How to use all verification tools |
| `scripts/route-test-urls.txt` | All testable routes with checklist |
| `next.config.js` | Next.js configuration (security headers, CORS, etc.) |
| `tsconfig.json` | TypeScript settings |
| `.env.example` | Environment variable template |

---

## Get Help

### When Build Fails

1. Read error message carefully
2. Check full log: `/tmp/build.log`
3. Try: `npm run clean && npm run build`
4. Check environment: `cat .env.local | head`
5. Review: `BUILD_VERIFICATION.md` troubleshooting section

### When Tests Fail

1. Run single test: `npm run test -- test-name`
2. Run in watch mode: `npm run test:watch`
3. Check error message for specific issue
4. Run type check: `npx tsc --noEmit`

### When Pages Don't Load

1. Check console (F12) for errors
2. Check Network tab for 404s
3. Verify authentication if protected page
4. Check .env.local for missing variables
5. Restart dev server: `npm run dev`

### When Database Fails

1. Verify connection string: `echo $DATABASE_URL`
2. Test connection manually if possible
3. Check Neon dashboard for status
4. Run migrations: `npm run db:migrate`
5. Check database tables exist

---

## Version Info

```
Next.js: 14.2.35
TypeScript: 6.0.3
Node.js required: 18+
npm required: 8+

Check current versions:
$ node --version
$ npm --version
$ npx next --version
```

---

## Key Metrics Dashboard

Run this command to see build stats:

```bash
# Show current build size
du -sh .next

# Show per-chunk sizes
ls -lh .next/static/chunks/ | sort -k5 -h

# Show full directory tree
tree -L 2 .next/
```

---

## One-Page Testing Flow

```
1. npm install              ← Setup
2. cp .env.example .env.local ← Configure
3. npm run build            ← Build (2 min)
4. npm run dev              ← Start (1 min)
5. Visit http://localhost:3000 ← Test (5 min)
6. F12 → Console → Check errors ← Verify (1 min)
7. Click routes in route-test-urls.txt ← Test (10 min)

Total Time: ~20 minutes for full verification
```

---

## Emergency Quick Build

If you need to rebuild fast:

```bash
# Fastest path - assumes dependencies OK
rm -rf .next
npm run build

# Check build output
du -sh .next
ls .next/build-manifest.json
```

---

**Last Updated**: 2026-06-07  
**For**: IPOReady MVP Phase 1  
**Questions?** See `VERIFICATION_TOOLS_README.md`
