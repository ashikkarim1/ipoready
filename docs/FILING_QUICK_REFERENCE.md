# Filing System - Quick Reference

Quick command reference for developers working with the filing system.

## Common Commands

### Running Tests

```bash
# All filing tests
npm run test:filing

# With watch mode
npm run test:filing:watch

# With coverage
npm run test:filing:coverage

# Full validation (types + tests)
npm run test:filing:check

# Specific test
npm test -- -t "SEDAR submission"
```

### Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

### Linting & Type Checking

```bash
# Lint all code
npm run lint

# Lint filing adapters
npm run lint -- src/lib/filing-adapters

# Type check
npx tsc --noEmit

# Fix lint issues
npm run lint -- --fix src/lib/filing-adapters
```

### Testing Endpoints

```bash
# Smoke tests (local)
./scripts/test-filing-endpoints.sh http://localhost:3000

# Smoke tests (staging)
./scripts/test-filing-endpoints.sh https://staging.ipoready.com

# With custom timeout
./scripts/test-filing-endpoints.sh http://localhost:3000 60
```

## API Endpoints

### Test Submission

```bash
curl -X POST http://localhost:3000/api/filing/test-submit \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Test Corp",
    "countryCode": "US",
    "includeErrors": false
  }'
```

### Check Status

```bash
# GET method
curl "http://localhost:3000/api/filings/status?filingId=test-123&system=sedar"

# POST method
curl -X POST http://localhost:3000/api/filings/status \
  -H "Content-Type: application/json" \
  -d '{"filingId": "test-123", "system": "sedar"}'
```

### Send Webhook

```bash
curl -X POST http://localhost:3000/api/filings/webhook \
  -H "Content-Type: application/json" \
  -H "X-Signature: $(echo -n '{payload}' | openssl dgst -sha256 -hmac 'secret' | cut -d' ' -f2)" \
  -d '{
    "filingId": "test-123",
    "status": "approved",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  }'
```

## File Locations

```
# Adapter implementations
src/lib/filing-adapters/
├── BaseFilingAdapter.ts       # Base class
├── SEDARAdapter.ts            # SEDAR 2 implementation
├── SECEdgarAdapter.ts         # SEC EDGAR implementation
└── utils/                     # Helper utilities

# API routes
src/app/api/
├── filing/                    # Test endpoints
│   └── test-submit/route.ts
└── filings/                   # Production endpoints
    ├── submit/route.ts
    ├── status/route.ts
    ├── webhook/route.ts
    └── test-submit/route.ts

# Tests
src/__tests__/
└── filing-adapters.test.ts

# Configuration
.env.filing.example           # Environment variables
.github/workflows/            # CI/CD workflows
.husky/pre-commit            # Pre-commit hook
jest.filing.config.js        # Jest config
scripts/test-filing-endpoints.sh  # Smoke tests

# Documentation
docs/
├── FILING_TESTING_GUIDE.md      # Comprehensive testing guide
├── FILING_CI_CD_SETUP.md        # CI/CD configuration
└── FILING_QUICK_REFERENCE.md    # This file
```

## Environment Setup

### Copy Example File

```bash
cp .env.filing.example .env.local
```

### Essential Variables

```bash
# SEDAR
SEDAR_API_KEY=your-key
SEDAR_API_SECRET=your-secret
SEDAR_MODE=sandbox

# SEC
SEC_CIK=0000000001
SEC_API_KEY=your-key
SEC_MODE=sandbox

# Webhooks
FILING_WEBHOOK_SECRET=your-secret-key-here

# Database
DATABASE_URL=postgresql://user:pass@localhost/ipoready
```

## Workflow Examples

### Local Development Workflow

```bash
# 1. Start server
npm run dev

# 2. In another terminal, run tests
npm run test:filing:watch

# 3. Make changes to adapters
# (tests auto-rerun on file changes)

# 4. Before committing, run full check
npm run test:filing:check

# 5. Commit changes
git add .
git commit -m "feat: improve filing adapter"
# (pre-commit hook runs automatically)
```

### Webhook Testing Workflow

```bash
# 1. Install ngrok
brew install ngrok

# 2. Start ngrok tunnel
ngrok http 3000
# Note: https://abc123.ngrok.io

# 3. Update .env.local
echo "WEBHOOK_URL=https://abc123.ngrok.io/api/filings/webhook" >> .env.local

# 4. Start server
npm run dev

# 5. Test webhook
curl -X POST https://abc123.ngrok.io/api/filings/webhook \
  -H "Content-Type: application/json" \
  -d '{...}'

# 6. Check ngrok dashboard
open http://127.0.0.1:4040
```

### Before Deployment

```bash
# 1. Run all tests
npm run test:filing

# 2. Check types
npm run build

# 3. Run smoke tests against staging
./scripts/test-filing-endpoints.sh https://staging.ipoready.com

# 4. Check coverage
npm run test:filing:coverage
open coverage/lcov-report/index.html

# 5. Review lint warnings
npm run lint -- src/lib/filing-adapters

# 6. Create pull request
git push origin your-branch
# (GitHub Actions runs automatically)
```

## Debugging

### Enable Debug Logs

```bash
# All filing logs
DEBUG=filing:* npm run dev

# Specific adapter
DEBUG=filing:sedar npm run dev

# Webhook logs
DEBUG=filing:webhook npm run dev
```

### Run Single Test

```bash
npm test -- -t "SEDAR submission"
npm test -- -t "webhook signature"
```

### View Test Output

```bash
# Verbose output
npm run test:filing -- --verbose

# Show test names as they run
npm run test:filing -- --listTests

# Print coverage for specific file
npm run test:filing:coverage -- --testPathPattern=SEDAR
```

### Check TypeScript Issues

```bash
# Find all type errors
npx tsc --noEmit

# Check specific file
npx tsc --noEmit src/lib/filing-adapters/SEDARAdapter.ts

# Generate declaration files
npx tsc --declaration src/lib/filing-adapters/*.ts
```

## Common Issues

### "Server is not responding"

```bash
# Check if port is in use
lsof -i :3000

# Kill existing process
pkill -f "npm run dev"

# Start fresh
npm run dev
```

### "TypeScript errors in adapters"

```bash
# See all errors
npx tsc --noEmit

# Fix common issues
npm run lint -- --fix src/lib/filing-adapters
```

### "Tests failing in CI but passing locally"

```bash
# Match CI environment exactly
node --version    # Should be 18.x
npm ci            # Instead of npm install
npm run test:filing -- --detectOpenHandles
```

### "Webhook not receiving events"

```bash
# Verify endpoint is accessible
curl -X OPTIONS http://localhost:3000/api/filings/webhook

# Check if using ngrok, verify tunnel
ngrok http 3000

# Check webhook secret matches
echo $FILING_WEBHOOK_SECRET

# View ngrok requests
open http://127.0.0.1:4040
```

## Performance Tuning

### Faster Tests

```bash
# Run tests in parallel
npm run test:filing -- --maxWorkers=4

# Run only changed tests
npm run test:filing -- -o

# Bail on first failure
npm run test:filing -- --bail
```

### Faster Type Checking

```bash
# Only check files that changed
git diff --name-only | xargs npx tsc --noEmit

# Skip lib type check
npx tsc --skipLibCheck --noEmit
```

## Git Workflow

### Before Commit

```bash
# Pre-commit hook runs automatically
git add src/lib/filing-adapters/*.ts

# If hook fails, fix and retry
npm run test:filing:check
git add .
git commit -m "fix: filing adapter issue"
```

### Skip Pre-commit (Emergency Only)

```bash
git commit --no-verify
# (Not recommended - always review what you're skipping)
```

### View Changes

```bash
# Show all changes
git diff src/lib/filing-adapters/

# Show staged changes
git diff --staged src/lib/filing-adapters/

# Show commits
git log --oneline src/lib/filing-adapters/
```

## Resources

- [Filing Testing Guide](./FILING_TESTING_GUIDE.md) - Comprehensive testing
- [CI/CD Setup Guide](./FILING_CI_CD_SETUP.md) - Workflow configuration
- [Adapter Implementation](../src/lib/filing-adapters/QUICK_START.md) - How adapters work
- [TypeScript Docs](https://www.typescriptlang.org/) - Type system
- [Jest Docs](https://jestjs.io/) - Testing framework

## Useful Links

```
Local Server:        http://localhost:3000
Ngrok Dashboard:     http://127.0.0.1:4040
GitHub Actions:      https://github.com/[org]/[repo]/actions
Codecov Coverage:    https://codecov.io/gh/[org]/[repo]
SEDAR Sandbox:       https://www.sedarplus.ca/
SEC EDGAR:           https://www.sec.gov/cgi-bin/browse-edgar
```

## Quick Fixes

### Update Dependencies

```bash
npm install
npm run lint -- --fix
npm run test:filing
```

### Rebuild Everything

```bash
rm -rf node_modules coverage dist
npm install
npm run build
npm run test:filing
```

### Reset to Main Branch

```bash
git fetch origin
git reset --hard origin/main
npm install
```

---

**Quick Tip**: Bookmark this file for fast reference during development!

**Last Updated**: June 4, 2026
