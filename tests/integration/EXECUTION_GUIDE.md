# Integration Test Execution Guide

Complete guide for running, debugging, and maintaining the IPOReady integration test suite.

## Quick Start

### 1. One-Time Setup

```bash
# Install dependencies
npm install

# Create test environment file
cp tests/integration/.env.example .env.test

# Edit .env.test with your credentials
nano .env.test

# Create test database
createdb ipoready_test

# Run migrations on test database
DATABASE_URL="postgresql://user:password@localhost:5432/ipoready_test" npm run db:migrate
```

### 2. Run All Tests

```bash
jest --config tests/integration/jest.config.js
```

### 3. Run Tests in Watch Mode

```bash
jest --config tests/integration/jest.config.js --watch
```

## Test Execution Commands

### All Tests

```bash
# Run all integration tests
jest --config tests/integration/jest.config.js

# Run with coverage report
jest --config tests/integration/jest.config.js --coverage

# Run with verbose output
jest --config tests/integration/jest.config.js --verbose

# Run with detailed error output
jest --config tests/integration/jest.config.js --no-coverage --verbose
```

### By Category

```bash
# Database migration tests only
jest --config tests/integration/jest.config.js database/

# API endpoint tests only
jest --config tests/integration/jest.config.js api/

# Authentication tests only
jest --config tests/integration/jest.config.js auth/

# Data integrity tests only
jest --config tests/integration/jest.config.js data-integrity/

# Cloud storage tests only
jest --config tests/integration/jest.config.js cloud-storage/
```

### Specific Test Suites

```bash
# Documents API
jest --config tests/integration/jest.config.js api/documents.test.ts

# Company API
jest --config tests/integration/jest.config.js api/company.test.ts

# Payment processing
jest --config tests/integration/jest.config.js api/stripe-payment.test.ts

# OAuth authentication
jest --config tests/integration/jest.config.js auth/oauth.test.ts

# Session management
jest --config tests/integration/jest.config.js auth/session.test.ts

# Document deduplication
jest --config tests/integration/jest.config.js data-integrity/deduplication.test.ts

# Google Drive sync
jest --config tests/integration/jest.config.js cloud-storage/google-drive.test.ts

# Error handling
jest --config tests/integration/jest.config.js api/error-handling.test.ts
```

### Specific Test Cases

```bash
# Run single test by name
jest --config tests/integration/jest.config.js -t "should return documents for authenticated user"

# Run tests matching pattern
jest --config tests/integration/jest.config.js -t "Database"

# Run tests in file matching pattern
jest --config tests/integration/jest.config.js documents
```

### Development Workflow

```bash
# Watch mode - re-run tests on file change
jest --config tests/integration/jest.config.js --watch

# Watch mode for specific file
jest --config tests/integration/jest.config.js --watch api/documents.test.ts

# Watch + coverage
jest --config tests/integration/jest.config.js --watch --coverage

# Run once, then exit (for CI)
jest --config tests/integration/jest.config.js --ci --no-coverage
```

## Coverage Reports

### Generate Coverage Report

```bash
# HTML coverage report
jest --config tests/integration/jest.config.js --coverage

# Coverage with detailed breakdown
jest --config tests/integration/jest.config.js --coverage --verbose

# Coverage for specific file
jest --config tests/integration/jest.config.js --coverage api/documents.test.ts
```

### View Coverage Report

```bash
# Open HTML report in browser
open coverage/lcov-report/index.html

# View coverage summary in console
jest --config tests/integration/jest.config.js --coverage --silent
```

### Coverage Thresholds

Current targets:
- **Database**: 100% (all migrations)
- **API**: 90%+
- **Auth**: 95%+
- **Data Integrity**: 100%
- **Cloud Storage**: 85%+ (mocked services)

## Debugging Tests

### Enable Detailed Logging

```bash
# Show all console.log output
jest --config tests/integration/jest.config.js --verbose

# Show test names as they run
jest --config tests/integration/jest.config.js --listTests

# Show test timings
jest --config tests/integration/jest.config.js --verbose --detectLeaks
```

### Debug Single Test

```bash
# Run one test with full output
jest --config tests/integration/jest.config.js -t "test name" --verbose

# Run test with Node debugger
node --inspect-brk ./node_modules/.bin/jest --config tests/integration/jest.config.js --runInBand
```

### Memory Leak Detection

```bash
# Detect memory leaks
jest --config tests/integration/jest.config.js --detectLeaks

# Detect open handles
jest --config tests/integration/jest.config.js --detectOpenHandles

# Run single test at a time (no parallelization)
jest --config tests/integration/jest.config.js --runInBand
```

### Environment-Specific Testing

```bash
# Run tests with different NODE_ENV
NODE_ENV=test jest --config tests/integration/jest.config.js

# Run with specific database
DATABASE_URL="postgresql://..." jest --config tests/integration/jest.config.js

# Run with test Stripe keys
STRIPE_SECRET_KEY=sk_test_... jest --config tests/integration/jest.config.js
```

## Continuous Integration

### GitHub Actions Setup

Create `.github/workflows/integration-tests.yml`:

```yaml
name: Integration Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  integration-tests:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: ipoready_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      
      - name: Setup test database
        run: |
          psql -h localhost -U test -d ipoready_test -c "SELECT version();"
        env:
          PGPASSWORD: test
      
      - name: Run migrations
        run: npm run db:migrate
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/ipoready_test
      
      - name: Run integration tests
        run: jest --config tests/integration/jest.config.js --coverage --ci
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/ipoready_test
          NODE_ENV: test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: integration
```

### Run in CI Mode

```bash
# CI mode: deterministic, no cache, exit code on failure
jest --config tests/integration/jest.config.js --ci --coverage --detectLeaks

# CI with specific database
DATABASE_URL="postgresql://..." jest --config tests/integration/jest.config.js --ci
```

## Test Maintenance

### Update Snapshots

```bash
# Update all snapshots
jest --config tests/integration/jest.config.js --updateSnapshot

# Update snapshots for specific file
jest --config tests/integration/jest.config.js -u api/documents.test.ts
```

### Clear Cache

```bash
# Clear Jest cache
jest --config tests/integration/jest.config.js --clearCache

# Also clear node_modules cache
npm ci
```

### Fix All Tests

```bash
# Identify broken tests
jest --config tests/integration/jest.config.js --listTests

# Run with bail (stop on first failure)
jest --config tests/integration/jest.config.js --bail

# Run serially to identify hard-to-find issues
jest --config tests/integration/jest.config.js --runInBand
```

## Performance Optimization

### Parallel Execution

```bash
# Default parallel execution (recommended)
jest --config tests/integration/jest.config.js

# Control number of workers
jest --config tests/integration/jest.config.js --maxWorkers=4

# Single worker (for debugging)
jest --config tests/integration/jest.config.js --runInBand
```

### Time Profiling

```bash
# Show slowest tests
jest --config tests/integration/jest.config.js --verbose

# Profile with native performance tools
node --prof --inspect ./node_modules/.bin/jest --config tests/integration/jest.config.js
```

### Database Optimization

```bash
# Ensure indexes exist
CREATE INDEX ON unified_documents(company_id);
CREATE INDEX ON unified_documents(source_system);

# Vacuum test database
VACUUM FULL ipoready_test;
```

## Troubleshooting Test Failures

### Common Issues and Solutions

#### Database Connection Refused

```bash
# Check PostgreSQL is running
pg_isready -h localhost

# Create database if missing
createdb ipoready_test

# Check credentials in .env.test
echo $DATABASE_URL
```

#### Timeout Errors

```bash
# Increase timeout for slow tests
jest --config tests/integration/jest.config.js --testTimeout=60000

# Run serially to avoid resource contention
jest --config tests/integration/jest.config.js --runInBand
```

#### Mock Not Being Called

```bash
# Check jest.mock paths
jest --config tests/integration/jest.config.js --verbose

# Clear cache and retry
jest --config tests/integration/jest.config.js --clearCache
```

#### Tests Passing Locally but Failing in CI

```bash
# Run in CI mode locally
jest --config tests/integration/jest.config.js --ci

# Match CI database settings
DATABASE_URL="postgresql://test:test@localhost:5432/ipoready_test" jest --config tests/integration/jest.config.js
```

### Get Detailed Error Information

```bash
# Run failing test with full output
jest --config tests/integration/jest.config.js -t "test name" --verbose --no-coverage

# Log all API calls
DEBUG=* jest --config tests/integration/jest.config.js

# Profile memory usage
node --prof ./node_modules/.bin/jest --config tests/integration/jest.config.js
```

## Pre-Commit Hooks

### Setup Husky for Automatic Testing

```bash
# Install Husky
npm install husky --save-dev

# Setup pre-commit hook
npx husky install
npx husky add .husky/pre-commit "npm run test:integration"

# Make hook executable
chmod +x .husky/pre-commit
```

### Pre-commit Hook Script

Add to `package.json`:

```json
{
  "scripts": {
    "test:integration": "jest --config tests/integration/jest.config.js --bail",
    "test:integration:fast": "jest --config tests/integration/jest.config.js --testPathIgnorePatterns=google-drive",
    "precommit": "npm run test:integration:fast"
  }
}
```

## Monitoring and Alerts

### Test Failure Notifications

```bash
# Send Slack notification on failure
jest --config tests/integration/jest.config.js && echo "Tests passed" || echo "Tests failed"

# Send email notification
# (Integrate with your CI/CD notification system)
```

## Cleanup and Maintenance

### Reset Test Database

```bash
# Drop and recreate test database
dropdb ipoready_test
createdb ipoready_test

# Re-run migrations
npm run db:migrate
```

### Clean Cache and Artifacts

```bash
# Clear all test artifacts
rm -rf coverage/
rm -rf __coverage__/
jest --config tests/integration/jest.config.js --clearCache
```

## Best Practices for Test Execution

1. **Always run migrations first**
   ```bash
   npm run db:migrate
   ```

2. **Use clean test database**
   ```bash
   dropdb ipoready_test
   createdb ipoready_test
   ```

3. **Run full suite before committing**
   ```bash
   jest --config tests/integration/jest.config.js --coverage
   ```

4. **Check coverage targets**
   ```bash
   jest --config tests/integration/jest.config.js --coverage | grep -E "(Database|API|Auth|Data Integrity)"
   ```

5. **Monitor for flaky tests**
   - Run tests multiple times
   - Check for time-dependent issues
   - Verify database state between runs

## Summary of Key Commands

| Task | Command |
|------|---------|
| Run all tests | `jest --config tests/integration/jest.config.js` |
| Watch mode | `jest --config tests/integration/jest.config.js --watch` |
| Coverage report | `jest --config tests/integration/jest.config.js --coverage` |
| Specific suite | `jest --config tests/integration/jest.config.js api/` |
| Single test | `jest --config tests/integration/jest.config.js -t "test name"` |
| CI mode | `jest --config tests/integration/jest.config.js --ci` |
| Debug | `node --inspect-brk ./node_modules/.bin/jest --config tests/integration/jest.config.js --runInBand` |
| Clear cache | `jest --config tests/integration/jest.config.js --clearCache` |
| Memory leaks | `jest --config tests/integration/jest.config.js --detectLeaks` |
