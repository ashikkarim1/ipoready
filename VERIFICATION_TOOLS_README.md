# IPOReady Build Verification Tools

Complete guide to building, verifying, and testing the IPOReady application.

## Quick Start

```bash
# 1. Install dependencies (if not already done)
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local with your settings

# 3. Run automated build verification
node scripts/verify-build.js
# OR (on macOS/Linux):
chmod +x scripts/verify-build.sh
./scripts/verify-build.sh

# 4. Start development server
npm run dev

# 5. Test routes in browser
# Visit http://localhost:3000
```

---

## Available Tools

### 1. BUILD_VERIFICATION.md
**Comprehensive build checklist with 200+ verification points**

**Location**: `/BUILD_VERIFICATION.md`

**Contains**:
- Pre-build environment checks
- TypeScript compilation verification
- Page compilation checks (40+ pages)
- Design consistency verification
- Performance & bundle analysis
- API & database connectivity checks
- Browser console verification
- Special items (unified documents, auth, forms)
- Troubleshooting guide
- CI/CD integration examples

**Use this for**:
- Manual verification before deployment
- Step-by-step checklist for QA
- Reference during build issues
- Understanding all verification points

---

### 2. verify-build.js (Node.js Script)
**Automated build verification (Cross-platform)**

**Location**: `/scripts/verify-build.js`

**Features**:
- Runs on Windows, macOS, Linux
- Automated environment validation
- TypeScript compilation check
- ESLint verification
- Build artifact validation
- Page existence checks
- Configuration validation
- Colored output for easy reading
- Detailed pass/fail reporting

**Usage**:
```bash
# Run verification
node scripts/verify-build.js

# On Windows
node scripts\verify-build.js

# In package.json (add this script):
"verify-build": "node scripts/verify-build.js"
```

**Output**:
```
========================================================================
║ IPOReady Build Verification Script
║ Started at: 6/7/2026, 10:30:45 AM
========================================================================

SECTION 1: PRE-BUILD ENVIRONMENT CHECK
============================================================
✅ PASS | Node.js version (18+)
✅ PASS | npm installed
✅ PASS | Dependencies installed
... (more checks)

========================================================================
SECTION 8: VERIFICATION SUMMARY
============================================================
Total Checks: 45
Passed: 45
Failed: 0
Pass Rate: 100%

✅ ALL CHECKS PASSED - BUILD IS READY
========================================================================
```

**Exit Codes**:
- `0` = All checks passed, ready for deployment
- `1` = Some checks failed, review output

---

### 3. verify-build.sh (Bash Script)
**Automated build verification (macOS/Linux)**

**Location**: `/scripts/verify-build.sh`

**Features**:
- Advanced bash features
- Detailed logging
- Performance timing
- Artifact size reporting
- Error aggregation

**Usage**:
```bash
# Make executable (first time only)
chmod +x scripts/verify-build.sh

# Run verification
./scripts/verify-build.sh

# In package.json:
"verify-build:bash": "bash scripts/verify-build.sh"
```

---

### 4. route-test-urls.txt
**Complete list of all testable routes**

**Location**: `/scripts/route-test-urls.txt`

**Contains**:
- 80+ route URLs organized by category
- Public routes (no auth required)
- Protected routes (login required)
- Demo/pilot routes
- Testing checklist
- Common issues reference
- Browser DevTools checks
- Performance testing guidance

**Use this for**:
- Manual route testing
- Creating test cases
- Documentation reference
- Browser testing procedures

---

## Complete Build & Verification Workflow

### Step 1: Pre-Build Setup

```bash
# Ensure Node.js 18+
node --version  # Should show v18.x or higher

# Ensure all dependencies installed
npm install

# Configure environment
if [ ! -f .env.local ]; then
  cp .env.example .env.local
  # Edit with your values:
  # - DATABASE_URL=postgresql://...
  # - NEXTAUTH_SECRET=...
  # - Other required variables
fi
```

### Step 2: Run Automated Verification

```bash
# Run build verification script
node scripts/verify-build.js

# Expected output:
# ✅ ALL CHECKS PASSED - BUILD IS READY

# If failures occur, review the failed checks and fix issues
```

### Step 3: Manual Verification

If automated verification passes, run manual checks:

```bash
# Start dev server
npm run dev

# In another terminal or browser:
# 1. Visit http://localhost:3000
# 2. Check browser console (F12)
# 3. Test login/register
# 4. Navigate dashboard pages
# 5. Verify data loads
```

### Step 4: Route Testing

Using the URLs in `scripts/route-test-urls.txt`:

```
For each public route:
- [ ] Page loads
- [ ] No console errors
- [ ] Styling correct
- [ ] Navigation works

For each protected route:
- [ ] Login required (if not authenticated)
- [ ] Loads correctly (if authenticated)
- [ ] Data displays
- [ ] No auth errors
```

### Step 5: Browser Validation

Open DevTools (F12 or Cmd+Option+I):

**Console Tab**:
```
Should see:
- No red error messages
- No warnings about hydration
- No CORS errors
- No missing resource 404s
```

**Network Tab**:
```
Should see:
- API calls return 200/201 (or expected status)
- No failed requests
- Response times < 500ms
- Proper request methods
```

**Application Tab**:
```
Should see:
- Cookies: NextAuth session token
- localStorage: User preferences (if applicable)
- No sensitive data exposed
```

---

## Build Scripts in package.json

These scripts are available:

```bash
npm run dev              # Start development server
npm run build            # Create production build
npm run start            # Start production server (after build)
npm run lint             # Run ESLint
npm run test             # Run Jest tests
npm run test:watch       # Watch mode for tests
npm run db:migrate       # Run database migrations
npm run verify-build     # Run verification script (if added)
```

---

## TypeScript & Linting

### Type Safety Check

```bash
# Full TypeScript check (same as build)
npx tsc --noEmit

# Check specific file
npx tsc --noEmit src/app/page.tsx

# With verbose output
npx tsc --noEmit --listFiles
```

### Code Quality Check

```bash
# Run linter
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix

# Specific rules
npm run lint -- --ext .ts,.tsx src/
```

---

## Build Output Structure

After `npm run build`, you'll have:

```
.next/
├── static/                 # CSS, JS bundles (hashed filenames)
│   ├── chunks/            # JavaScript chunks
│   ├── css/               # CSS modules
│   └── [hash].js          # Static files
├── server/                # Server-side code
│   ├── pages/             # Page components
│   ├── middleware.js      # Middleware
│   └── lib/               # Utilities
├── public/                # Public assets
├── standalone/            # Standalone server files (production)
├── build-manifest.json    # Build metadata
└── prerender-manifest.json # Static generation info
```

**Key stats to monitor**:
- Main bundle: < 250 KB (gzipped)
- Total build: < 500 MB on disk
- Build time: < 120 seconds

---

## Troubleshooting

### Build Fails with TypeScript Errors

```bash
# See full error details
npx tsc --noEmit 2>&1 | head -50

# Fix specific file
# Edit the file indicated in error
# Try build again
npm run build
```

### Port 3000 Already in Use

```bash
# Windows: Find and kill process
lsof -i :3000
kill -9 <PID>

# Or use different port
npm run dev -- -p 3001
```

### Database Connection Error

```bash
# Check environment
cat .env.local | grep DATABASE_URL

# Verify Neon connection
# 1. Copy connection string from Neon dashboard
# 2. Update .env.local
# 3. Restart dev server: npm run dev
```

### Hydration Errors

These appear as: "Text content did not match"

**Causes**:
- Client/server date/time differences
- Random content differences
- Conditional rendering based on browser APIs

**Solutions**:
```typescript
// Wrap browser-specific code
if (typeof window !== 'undefined') {
  // Client-only code
}

// Or use useEffect
useEffect(() => {
  // Code that needs hydration safety
}, [])
```

### Memory Issues During Build

```bash
# Increase Node memory limit
NODE_OPTIONS=--max-old-space-size=4096 npm run build

# Or add to .env
export NODE_OPTIONS=--max-old-space-size=4096
```

---

## Performance Optimization

### Check Bundle Size

```bash
# Manual check
du -sh .next/static/

# Per chunk
ls -lh .next/static/chunks/ | sort -k5 -h
```

### Identify Large Imports

```bash
# Check for large packages in node_modules
npm ls | grep -i "large-package"

# Update dependencies
npm update

# Audit dependencies
npm audit
```

### Tree-Shaking Verification

In `next.config.js`, we optimize:
- `lucide-react` (saves ~400KB)
- `date-fns` (saves ~200KB)

Monitor these in build output.

---

## Continuous Integration Setup

### GitHub Actions Example

```yaml
name: Build Verification

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  verify-build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run build verification
        run: node scripts/verify-build.js
      
      - name: TypeScript check
        run: npx tsc --noEmit
      
      - name: ESLint check
        run: npm run lint
      
      - name: Build
        run: npm run build
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: build-logs
          path: |
            /tmp/build.log
            /tmp/tsc.log
            /tmp/lint.log
```

---

## Verification Checklist Summary

Quick reference - for full details see BUILD_VERIFICATION.md:

**Before Build**:
- [ ] Node 18+
- [ ] Dependencies installed
- [ ] .env.local configured
- [ ] Database connection working

**During Build**:
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Build completes in < 2 minutes
- [ ] .next directory created

**After Build**:
- [ ] All critical pages present
- [ ] No console errors
- [ ] No API 404 errors
- [ ] Database queries work
- [ ] Authentication functional

**Before Deployment**:
- [ ] All routes tested
- [ ] Performance acceptable
- [ ] Security checks passed
- [ ] No sensitive data exposed

---

## Key Metrics to Track

Track these metrics after each build:

```
Build Metrics:
- Build duration: Target < 120s
- Main bundle: Target < 250KB gzipped
- Total artifacts: Target < 500MB
- TypeScript errors: Target = 0
- ESLint errors: Target = 0

Runtime Metrics:
- Page load time: Target < 2s
- API response time: Target < 500ms
- Lighthouse score: Target > 75

Availability:
- Public routes: 100% uptime
- API routes: 100% availability
- Database: 99.9% uptime
```

---

## Additional Resources

- **Tech Stack**: `/tech_stack.md` (from project memory)
- **Project Overview**: `/project_overview.md` (from project memory)
- **Phase 1 Implementation**: `/phase1_implementation_complete.md` (from project memory)
- **API Routes Audit**: `/API_ROUTES_AUDIT.md`
- **Database Schema**: Check Neon dashboard for current schema

---

## Support & Questions

For issues or questions:

1. Check troubleshooting section above
2. Review BUILD_VERIFICATION.md for detailed steps
3. Check /tmp/*.log files for detailed errors
4. Review git history: `git log --oneline -20`
5. Check environment configuration

---

## Version History

| Version | Date       | Changes |
|---------|------------|---------|
| 1.0     | 2026-06-07 | Initial creation with 3 verification tools |

---

## Maintained By

Created: 2026-06-07  
For: IPOReady MVP (Phase 1)  
By: Claude Code Build System

Last Updated: 2026-06-07
