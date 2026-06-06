# IPOReady E2E Testing Guide

## Overview

This guide covers the comprehensive end-to-end test suite for IPOReady, built with Playwright. The suite covers critical user flows across authentication, document management, capital markets, and navigation.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Test Architecture](#test-architecture)
3. [Running Tests](#running-tests)
4. [Writing Tests](#writing-tests)
5. [Debugging](#debugging)
6. [CI/CD Integration](#cicd-integration)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL (for test database)
- Running IPOReady application

### Installation

```bash
# Install dependencies
npm install --save-dev @playwright/test

# Install Playwright browsers
npx playwright install

# Copy test environment file
cp .env.test.example .env.test
```

### Run Tests

```bash
# Start application
npm run dev

# In another terminal, run all tests
npm run test:e2e

# Or run specific test suite
npm run test:e2e:login
npm run test:e2e:documents
npm run test:e2e:capital-markets
npm run test:e2e:navigation
```

## Test Architecture

### Directory Structure

```
tests/
├── e2e/
│   ├── login.spec.ts                 # Authentication tests
│   ├── documents.spec.ts             # Document management tests
│   ├── capital-markets.spec.ts       # IPO dashboard tests
│   ├── navigation.spec.ts            # Navigation and routing tests
│   └── README.md                     # E2E tests documentation
├── utils/
│   └── test-fixtures.ts              # Test utilities and helpers
└── E2E_TESTING_GUIDE.md              # This file
```

### Test Fixtures

The test suite uses custom fixtures and helpers defined in `tests/utils/test-fixtures.ts`:

**Test Users:**
- Admin: `e2e-admin@ipoready.test` / `TestPassword123!@#`
- CEO: `e2e-ceo@ipoready.test` / `TestPassword123!@#`
- Investor: `e2e-investor@ipoready.test` / `TestPassword123!@#`
- Director: `e2e-director@ipoready.test` / `TestPassword123!@#`

**Helper Functions:**

```typescript
// Database operations
dbHelpers.createUser(email, password, role, companyId)
dbHelpers.createCompany(name, symbol, industry, founderEmail)
dbHelpers.createDocument(companyId, fileName, documentType, userId)
dbHelpers.deleteUser(email)
dbHelpers.deleteCompany(companyId)
dbHelpers.clearTestData()

// Navigation
navigationHelpers.goToDashboard(page)
navigationHelpers.goToDocuments(page)
navigationHelpers.goToCapitalMarkets(page)
navigationHelpers.goToCompliance(page)

// Authentication
authHelpers.loginWithCredentials(page, email, password)
authHelpers.logout(page)
authHelpers.isAuthenticated(page)

// Documents
documentHelpers.uploadDocument(page, filePath, documentType)
documentHelpers.downloadDocument(page, documentName)
documentHelpers.viewDocument(page, documentName)
documentHelpers.deleteDocument(page, documentName)
```

## Running Tests

### All Tests

```bash
npm run test:e2e
```

### Specific Test Suite

```bash
npm run test:e2e:login
npm run test:e2e:documents
npm run test:e2e:capital-markets
npm run test:e2e:navigation
```

### Specific Browser

```bash
npm run test:e2e:chromium   # Chrome
npm run test:e2e:firefox    # Firefox
npm run test:e2e:webkit     # Safari
npm run test:e2e:mobile     # Mobile Chrome and Safari
```

### UI Mode (Interactive Testing)

```bash
npm run test:e2e:ui
```

Features:
- Step through tests
- Inspect elements
- View network requests
- Take screenshots
- Debug live

### Debug Mode

```bash
npm run test:e2e:debug
```

Features:
- Pause on breakpoints
- Step through execution
- Inspect DOM
- View console logs

### Specific Test

```bash
# Run single test file
npx playwright test tests/e2e/login.spec.ts

# Run single test by name
npx playwright test -g "should successfully login with valid email and password"

# Run tests matching pattern
npx playwright test -g "login"
```

### Watch Mode

```bash
npx playwright test --watch
```

### Test Report

```bash
npm run test:e2e:report
```

Opens HTML report with:
- Test results summary
- Failed test details
- Screenshots and videos
- Execution timeline

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect, TEST_USERS, dbHelpers, authHelpers } from '../utils/test-fixtures'

test.describe('Feature Name', () => {
  test.beforeAll(async () => {
    // Setup for all tests in suite
  })

  test.afterAll(async () => {
    // Cleanup for all tests in suite
  })

  test.beforeEach(async ({ page }) => {
    // Setup for each test
  })

  test.afterEach(async ({ page }) => {
    // Cleanup after each test
  })

  test('should do something specific', async ({ page }) => {
    // Arrange: Setup test data
    // Act: Perform action
    // Assert: Verify results
  })
})
```

### Writing an Authentication Test

```typescript
test('should login successfully', async ({ page }) => {
  // Arrange: Create test user
  await dbHelpers.createUser(
    'test@example.com',
    'Password123!',
    'ceo'
  )

  // Act: Navigate to login
  await page.goto('/login')

  // Fill form
  await page.locator('input[type="email"]').fill('test@example.com')
  await page.locator('input[type="password"]').fill('Password123!')
  await page.locator('button[type="submit"]').click()

  // Assert: Redirected to dashboard
  await page.waitForURL('/dashboard')
  expect(page.url()).toContain('/dashboard')

  // Cleanup
  await dbHelpers.deleteUser('test@example.com')
})
```

### Writing a Document Test

```typescript
test('should upload document successfully', async ({ page }) => {
  // Arrange: Login
  await authHelpers.loginWithCredentials(page, TEST_USERS.ceo.email, TEST_USERS.ceo.password)
  await navigationHelpers.goToDocuments(page)

  // Act: Upload document
  const fileInput = page.locator('input[type="file"]')
  await fileInput.setInputFiles('test-file.pdf')
  await page.locator('button:has-text("Upload")').click()

  // Assert: Success message
  await page.waitForLoadState('networkidle')
  const successMessage = page.locator('text=uploaded successfully')
  await expect(successMessage).toBeVisible()
})
```

### Best Practices for Writing Tests

#### 1. Use Meaningful Names

```typescript
// Good
test('should successfully login with valid email and password', async ({ page }) => {})

// Avoid
test('login test', async ({ page }) => {})
```

#### 2. Handle Optional Elements

```typescript
// Good - gracefully handles missing element
const element = page.locator('[data-testid="optional"]')
const isVisible = await element.isVisible().catch(() => false)

// Avoid - test fails if element missing
await expect(element).toBeVisible()
```

#### 3. Use Test Data Helpers

```typescript
// Good
await dbHelpers.createUser(email, password, role)

// Avoid
const hashedPassword = await bcrypt.hash(password, 10)
// ... direct SQL ...
```

#### 4. Proper Waits

```typescript
// Good
await page.waitForURL('/dashboard', { waitUntil: 'networkidle' })

// Avoid
await page.waitForTimeout(5000)
```

#### 5. Descriptive Assertions

```typescript
// Good
expect(page.url()).toContain('/dashboard')
await expect(userMenu).toBeVisible()

// Avoid
expect(true).toBe(true)
```

## Debugging

### Take Screenshots

```typescript
// Automatic on failure
// Manual screenshot
await page.screenshot({ path: 'debug.png' })
```

### View Videos

Videos saved in `test-results/` for failed tests.

### Debug Mode

```bash
npm run test:e2e:debug
```

Features:
- `Step over` (F10)
- `Step into` (F11)
- `Continue` (F8)
- Inspect elements in DevTools

### Console Logs

```typescript
test('debug test', async ({ page }) => {
  page.on('console', msg => console.log(msg.text()))

  // Your test code
})
```

### Page Content

```typescript
// Print entire page
const content = await page.content()
console.log(content)

// Get specific element
const text = await page.locator('[data-testid="element"]').innerText()
console.log(text)
```

### Network Requests

```typescript
// Log all network requests
page.on('response', response => {
  console.log(`${response.status()} ${response.url()}`)
})

// Wait for specific request
await page.waitForResponse(resp => resp.url().includes('/api/documents'))
```

## CI/CD Integration

### GitHub Actions

Workflow file: `.github/workflows/e2e-tests.yml`

Features:
- Runs on push and pull requests
- Tests against multiple browsers
- Runs on Ubuntu
- Publishes test reports
- Uploads artifacts

### Local CI/CD Testing

```bash
# Simulate CI environment
CI=true npm run test:e2e
```

### Environment Variables in CI

```yaml
env:
  CI: true
  DATABASE_URL: postgresql://postgres:postgres@localhost:5432/ipoready_test
  BASE_URL: http://localhost:3000
  NEXTAUTH_SECRET: test-secret
```

## Best Practices

### Test Organization

- One `test.describe()` block per feature
- Related tests grouped together
- Meaningful test names
- Clear setup and teardown

### Test Independence

```typescript
// Good - each test is independent
test('should add item to list', async ({ page }) => {
  // Full setup in test
  // Can run in any order
})

// Avoid - test depends on previous test
test('should view added item', async ({ page }) => {
  // Assumes previous test ran
})
```

### Async/Await

```typescript
// Good
await page.click('button')
await page.waitForLoadState('networkidle')

// Avoid
page.click('button')
// No wait
```

### Error Handling

```typescript
// Good - graceful degradation
const element = page.locator('[data-testid="optional"]')
const exists = await element.isVisible().catch(() => false)
if (exists) {
  // do something
}

// Avoid - test fails on optional element
await expect(element).toBeVisible()
```

### Selectors

```typescript
// Good order of preference
// 1. Test ID
await page.locator('[data-testid="submit-btn"]').click()

// 2. Accessible selectors
await page.locator('button:has-text("Submit")').click()

// 3. CSS selector
await page.locator('form button[type="submit"]').click()

// 4. XPath (last resort)
await page.locator('xpath=//button[@type="submit"]').click()
```

## Troubleshooting

### Tests Timeout

```typescript
// Increase timeout in playwright.config.ts
use: {
  navigationTimeout: 30000,
  actionTimeout: 10000,
}

// Or in specific test
test('slow test', async ({ page }) => {
  await page.waitForLoadState('networkidle', { timeout: 60000 })
})
```

### Database Connection

```bash
# Verify database
psql postgresql://user:password@localhost:5432/ipoready_test

# Run migrations
npm run db:migrate

# Clear test data
npm run db:migrate -- rollback
```

### Application Won't Start

```bash
# Check if port is in use
lsof -i :3000

# Kill process
kill -9 <PID>

# Restart
npm run dev
```

### Flaky Tests

- Increase wait times
- Check for race conditions
- Use `waitForLoadState('networkidle')`
- Add retries in config

### Browser Issues

```bash
# Reinstall browsers
npx playwright install

# Use specific browser
npx playwright test --project=chromium
```

### Tests Pass Locally, Fail in CI

- Check environment variables
- Verify database in CI
- Check for timing issues
- Review CI logs

## Performance Optimization

### Parallel Execution

```typescript
// playwright.config.ts
workers: 4,
fullyParallel: true,
```

### Reuse Browser

```typescript
reuseExistingServer: !process.env.CI,
```

### Skip Screenshots (CI)

```typescript
screenshot: process.env.CI ? 'only-on-failure' : 'off',
```

## Monitoring

### Test Metrics

- Success rate
- Average duration
- Failed tests
- Browser coverage

### Reports

- HTML: `test-results/html/index.html`
- JSON: `test-results/results.json`
- JUnit: `test-results/junit.xml`

## Security

- Use test-only credentials
- Never commit production data
- Sanitize logs
- Use test databases

## Further Reading

- [Playwright Documentation](https://playwright.dev)
- [Testing Best Practices](https://playwright.dev/docs/best-practices)
- [Locators Guide](https://playwright.dev/docs/locators)
- [Assertions](https://playwright.dev/docs/assertions)

## Support

For issues or questions:
1. Check test logs: `test-results/`
2. Review Playwright docs
3. Check GitHub issues
4. Create debug test
