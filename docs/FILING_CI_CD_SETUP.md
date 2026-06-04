# Filing System CI/CD Configuration Guide

Complete guide for setting up CI/CD pipeline for the IPOReady filing system.

## Table of Contents

1. [Overview](#overview)
2. [Local Pre-Commit Hooks](#local-pre-commit-hooks)
3. [GitHub Actions Setup](#github-actions-setup)
4. [Test Scripts](#test-scripts)
5. [Deployment Pipeline](#deployment-pipeline)
6. [Environment Configuration](#environment-configuration)
7. [Monitoring & Alerts](#monitoring--alerts)

---

## Overview

The filing system CI/CD pipeline ensures code quality and reliability through:

- **Pre-commit hooks**: Validate code before commits
- **Automated tests**: Unit, integration, and smoke tests
- **Type checking**: TypeScript compilation
- **Linting**: Code style and quality checks
- **Smoke tests**: Pre-deployment verification
- **Performance testing**: Load and stress testing

### Test Execution Flow

```
Push Code
    ↓
GitHub Actions Triggered
    ├─→ Unit Tests (filing-adapters.test.ts)
    ├─→ Type Checking (TypeScript compilation)
    ├─→ Linting (ESLint)
    └─→ Build Application
         ↓
    Start Server
         ↓
    Run Smoke Tests
    (all endpoints)
         ↓
    Results Summary
         ↓
    Merge Allowed (if all pass)
```

---

## Local Pre-Commit Hooks

### Installation

Pre-commit hooks are configured using Husky and validate code before commits.

```bash
# Install Husky
npm install husky --save-dev
npx husky install

# Make hook executable
chmod +x .husky/pre-commit
```

### What Gets Checked

The pre-commit hook (``.husky/pre-commit``) verifies:

1. **TypeScript Syntax**: Compiles filing adapters for syntax errors
2. **Unit Tests**: Runs all filing-related tests
3. **Linting**: Checks code style and quality

### Running Pre-Commit Checks Manually

```bash
# Run all checks
npm run test:filing:check

# Run just TypeScript check
npx tsc --noEmit src/lib/filing-adapters/**/*.ts

# Run just tests
npm run test:filing

# Run just linting
npm run lint -- src/lib/filing-adapters
```

### Bypassing Hooks (Not Recommended)

```bash
# Skip pre-commit hook (use with caution)
git commit --no-verify

# Only for emergency fixes - always review what you're skipping
```

---

## GitHub Actions Setup

### Workflow File

The main workflow is defined in: `.github/workflows/filing-system-tests.yml`

### Jobs

#### 1. Unit Tests (unit-tests)

```yaml
- Runs: npm run test:filing
- Coverage: Uploads to Codecov
- Timeout: 15 minutes
- Artifacts: Coverage reports
```

**Key Points**:
- Runs on Node 18
- Uses npm cache for speed
- Generates coverage report
- Uploads to Codecov automatically

#### 2. Type Checking (type-check)

```yaml
- Runs: npx tsc --noEmit
- Timeout: 10 minutes
- Verifies: All TypeScript compiles correctly
```

**Key Points**:
- Strict type checking
- Catches type errors early
- Required before merge

#### 3. Linting (lint)

```yaml
- Runs: npm run lint
- Timeout: 10 minutes
- Verifies: Code style compliance
```

**Key Points**:
- ESLint configuration
- Checks filing adapters
- Checks API routes

#### 4. Smoke Tests (smoke-tests)

```yaml
- Builds: npm run build
- Starts: npm start
- Tests: ./scripts/test-filing-endpoints.sh
- Timeout: 20 minutes
```

**Key Points**:
- Tests all filing endpoints
- Verifies webhook handler
- Checks adapter syntax
- Tests against running server

### Triggering Workflows

Workflows trigger on:

1. **Push to main branches**
   - `main`, `develop`, `staging`

2. **Pull requests**
   - To main branches

3. **Changes to filing code**
   - `src/lib/filing-adapters/**`
   - `src/app/api/filing/**`
   - `src/app/api/filings/**`

4. **Manual trigger**
   - Use "Run workflow" button

### Viewing Results

1. **In GitHub UI**
   ```
   Repository → Actions → Filing System Tests
   ```

2. **In Pull Request**
   - Check runs appear at bottom of PR
   - Click "Details" to see full logs

3. **View specific job**
   ```
   Workflow Run → Job Name → Step Output
   ```

---

## Test Scripts

### Package.json Scripts

```json
{
  "test:filing": "jest -- filing-adapters.test.ts",
  "test:filing:watch": "jest -- filing-adapters.test.ts --watch",
  "test:filing:coverage": "jest -- filing-adapters.test.ts --coverage",
  "test:filing:check": "tsc --noEmit --checkJs src/lib/filing-adapters/**/*.ts && npm run test:filing"
}
```

### Script Usage

```bash
# Run filing tests once
npm run test:filing

# Watch mode (re-run on file changes)
npm run test:filing:watch

# Coverage report
npm run test:filing:coverage

# Full check (TypeScript + tests)
npm run test:filing:check
```

### Smoke Test Script

```bash
# Run smoke tests against development server
./scripts/test-filing-endpoints.sh http://localhost:3000

# Run against staging
./scripts/test-filing-endpoints.sh https://staging.ipoready.com

# Run with custom timeout
./scripts/test-filing-endpoints.sh http://localhost:3000 60
```

### Jest Configuration

Filing system uses dedicated Jest config: `jest.filing.config.js`

```bash
# Run with custom config
jest --config jest.filing.config.js

# Run with coverage
jest --config jest.filing.config.js --coverage

# Watch mode
jest --config jest.filing.config.js --watch
```

---

## Deployment Pipeline

### Pre-Deployment Checklist

Before deploying to production:

```bash
# 1. Run all tests
npm run test:filing

# 2. Run type checks
npm run build

# 3. Run smoke tests against staging
./scripts/test-filing-endpoints.sh https://staging.ipoready.com

# 4. Check code coverage
npm run test:filing:coverage

# 5. Review any warnings or errors
npm run lint -- src/lib/filing-adapters
```

### Deployment Steps

#### 1. Create Release Branch

```bash
git checkout -b release/filing-system-vX.Y.Z

# Make any last-minute changes
git commit -m "Release: Filing system vX.Y.Z"
git push origin release/filing-system-vX.Y.Z
```

#### 2. Create Pull Request

- Title: "Release: Filing System vX.Y.Z"
- Description: Include changelog
- Link related issues
- Request reviewers

#### 3. Automated Checks Run

- All tests must pass
- All checks must be green
- Code review required
- No merge conflicts

#### 4. Merge to Main

- Squash and merge
- Delete branch after merge
- Create GitHub release

#### 5. Deploy to Production

```bash
# Manual deployment
git checkout main
git pull
npm install
npm run build
npm start

# Or use your deployment service
# (Vercel, Netlify, Railway, etc.)
```

### Rollback Procedure

If issues occur:

```bash
# Identify last good commit
git log --oneline | head -20

# Revert to previous version
git revert <commit-hash>
git push origin main

# Or reset (if not yet deployed)
git reset --hard <commit-hash>
git push origin main --force
```

---

## Environment Configuration

### Setting Up Secrets in GitHub

1. Go to: Settings → Secrets and variables → Actions
2. Create repository secrets:

```
SEDAR_API_KEY=<your-sandbox-key>
SEDAR_API_SECRET=<your-sandbox-secret>
SEC_API_KEY=<your-sandbox-key>
SEC_CIK=<your-cik>
FILING_WEBHOOK_SECRET=<webhook-secret>
DATABASE_URL=<test-db-url>
```

### Using Secrets in Workflows

```yaml
env:
  SEDAR_API_KEY: ${{ secrets.SEDAR_API_KEY }}
  SEDAR_API_SECRET: ${{ secrets.SEDAR_API_SECRET }}
  SEC_API_KEY: ${{ secrets.SEC_API_KEY }}
  FILING_WEBHOOK_SECRET: ${{ secrets.FILING_WEBHOOK_SECRET }}
```

### Environment-Specific Configuration

Create separate `.env` files:

```
.env.development   # Local development
.env.staging       # Staging environment
.env.production    # Production (use secrets)
```

Load based on deployment:

```bash
# Development
NODE_ENV=development npm run dev

# Staging
NODE_ENV=staging npm start

# Production
NODE_ENV=production npm start
```

---

## Monitoring & Alerts

### GitHub Actions Notifications

1. **Failed Workflow**
   - GitHub sends email notification
   - Shows in Actions tab with red X
   - Can configure branch protection rules

2. **Set up Branch Protection**

   Settings → Branches → Add rule for `main`:
   - Require status checks to pass
   - Require code reviews
   - Require branches to be up to date

### Codecov Integration

Coverage reports are uploaded to Codecov:

```
https://codecov.io/gh/YOUR_ORG/ipoready
```

Monitor:
- Coverage percentage over time
- Coverage changes in PRs
- Coverage by file

### Slack Notifications

Add GitHub to Slack:

1. In Slack: `/github subscribe ipoready`
2. Configure notifications:
   ```
   /github subscribe ipoready commits:all
   /github subscribe ipoready workflows:filing-system-tests
   ```

### Email Notifications

GitHub sends emails for:
- Failed workflow runs
- Pull request reviews
- Branch protection violations

Configure in Settings → Notifications

### Custom Monitoring

Create a monitoring dashboard:

```bash
# Export test results
npm run test:filing -- --json > test-results.json

# Track metrics
curl -X POST monitoring-api.com/metrics \
  -d '{"test_results": "test-results.json"}'
```

---

## Troubleshooting

### Workflow Fails on Push

**Problem**: Tests pass locally but fail in CI

**Solution**:
```bash
# Check Node version matches CI
node --version  # Should be 18.x

# Install dependencies exactly as CI does
rm -rf node_modules
npm ci

# Run tests with same config as CI
npm run test:filing

# Check for environment variables
env | grep SEDAR
env | grep SEC
```

### Timeout During Tests

**Problem**: Tests timeout in GitHub Actions

**Solution**:
1. Increase timeout in workflow:
   ```yaml
   timeout-minutes: 30  # was 15
   ```

2. Run tests with longer timeout:
   ```bash
   npm test -- --testTimeout=30000
   ```

3. Check for blocking I/O
   - Mock external APIs
   - Use fixtures instead of real calls

### Cache Not Working

**Problem**: Dependencies not cached

**Solution**:
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '18'
    cache: 'npm'  # Enable npm cache
```

### Secret Not Available

**Problem**: GitHub secret not accessible in workflow

**Solution**:
1. Verify secret exists: Settings → Secrets
2. Use correct secret name (case-sensitive)
3. Reference as: `${{ secrets.SECRET_NAME }}`

---

## Best Practices

1. **Keep Tests Fast**
   - Mock external services
   - Use fixtures for test data
   - Run tests in parallel

2. **Use Coverage Gates**
   - Require minimum coverage
   - Block merge if coverage drops
   - Review uncovered code

3. **Fail Fast**
   - Run quick checks first (lint, types)
   - Run tests next
   - Run slow checks last (integration)

4. **Cache Dependencies**
   - Use npm cache in workflows
   - Cache Docker images
   - Cache build artifacts

5. **Clear Logging**
   - Log test names
   - Log failures clearly
   - Include stack traces

6. **Secure Secrets**
   - Never log secrets
   - Rotate secrets regularly
   - Limit secret exposure

7. **Test Environments**
   - Use sandbox APIs
   - Isolate test database
   - Clean up after tests

---

## Resources

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Jest Documentation](https://jestjs.io/)
- [Husky Pre-commit Hooks](https://typicode.github.io/husky/)
- [Codecov Integration](https://docs.codecov.io/)
- [Filing System Guide](./FILING_TESTING_GUIDE.md)

---

**Last Updated**: June 4, 2026  
**Maintained By**: IPOReady Engineering Team
