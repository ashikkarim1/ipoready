# IPOReady E2E Test Suite

Comprehensive end-to-end testing suite for IPOReady using Playwright. Tests critical user flows including authentication, document management, capital markets dashboards, and navigation.

## Test Files

- **login.spec.ts** - Authentication and login flows
  - Email/password login
  - OAuth flows (when available)
  - Password validation
  - Session persistence
  - Logout
  - Error handling

- **capital-markets.spec.ts** - IPO dashboard and market data flows
  - Dashboard display
  - IPO pipeline data
  - Company status
  - Filtering and sorting
  - Benchmarks and metrics
  - Data export

- **documents.spec.ts** - Document management flows
  - Upload/download documents
  - Document listing and filtering
  - Preview and metadata
  - Delete operations
  - Search functionality
  - Sharing and permissions

- **navigation.spec.ts** - Navigation and routing flows
  - Menu navigation
  - Direct URL access
  - Breadcrumb navigation
  - Back/forward button handling
  - Mobile navigation
  - 404 error handling

## Setup

### 1. Install Dependencies

```bash
npm install --save-dev @playwright/test
```

### 2. Configure Environment

Create `.env.test` with:

```
BASE_URL=http://localhost:3000
DATABASE_URL=your_test_database_url
NEXTAUTH_SECRET=test_secret
```

### 3. Start Application

```bash
npm run dev
```

The tests expect the app to run on `http://localhost:3000`

## Running Tests

### Run All Tests

```bash
npx playwright test
```

### Run Specific Test File

```bash
npx playwright test tests/e2e/login.spec.ts
```

### Run Tests in UI Mode (Interactive)

```bash
npx playwright test --ui
```

### Run Tests in Debug Mode

```bash
npx playwright test --debug
```

### Run Tests with Specific Browser

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Run Mobile Tests Only

```bash
npx playwright test --project="mobile-chrome" --project="mobile-safari"
```

### Run with Verbose Output

```bash
npx playwright test --reporter=verbose
```

## Test Utilities

### Database Helpers (`tests/utils/test-fixtures.ts`)

Helper functions for test setup and teardown:

```typescript
// Create test user
await dbHelpers.createUser(email, password, role, companyId)

// Create test company
await dbHelpers.createCompany(name, symbol, industry, founderEmail)

// Create test document
await dbHelpers.createDocument(companyId, fileName, documentType, userId)

// Delete test user/company
await dbHelpers.deleteUser(email)
await dbHelpers.deleteCompany(companyId)

// Clear all test data
await dbHelpers.clearTestData()
```

### Navigation Helpers

```typescript
// Navigate to key pages
await navigationHelpers.goToDashboard(page)
await navigationHelpers.goToDocuments(page)
await navigationHelpers.goToCapitalMarkets(page)
await navigationHelpers.goToCompliance(page)
await navigationHelpers.goToLogin(page)
```

### Authentication Helpers

```typescript
// Login with credentials
await authHelpers.loginWithCredentials(page, email, password)

// Logout
await authHelpers.logout(page)

// Check authentication status
const isAuth = await authHelpers.isAuthenticated(page)
```

### Document Helpers

```typescript
// Upload document
await documentHelpers.uploadDocument(page, filePath, documentType)

// Download document
await documentHelpers.downloadDocument(page, documentName)

// View document
await documentHelpers.viewDocument(page, documentName)

// Delete document
await documentHelpers.deleteDocument(page, documentName)
```

## Test Data

### Test Users

- **Admin**: `e2e-admin@ipoready.test` / `TestPassword123!@#`
- **CEO**: `e2e-ceo@ipoready.test` / `TestPassword123!@#`
- **Investor**: `e2e-investor@ipoready.test` / `TestPassword123!@#`
- **Director**: `e2e-director@ipoready.test` / `TestPassword123!@#`

### Test Company

- **ID**: `test-company-e2e-001`
- **Name**: TechCorp E2E Test Inc.
- **Symbol**: TECH
- **Industry**: Technology

### Test Documents

- **prospectus-test.pdf** - Sample prospectus
- **financials-2024.xlsx** - Sample financial statements
- **articles-of-incorporation.docx** - Sample charter

## Debugging

### Take Screenshots

Automatic on failure. View at:
```
test-results/
```

### View Test Video

Videos captured on failure:
```
test-results/**/*.webm
```

### Run Single Test in Debug Mode

```bash
npx playwright test tests/e2e/login.spec.ts --debug
```

### View HTML Report

```bash
npx playwright show-report
```

## Reports

Test results are generated in multiple formats:

- **HTML Report**: `test-results/html/index.html`
- **JSON Report**: `test-results/results.json`
- **JUnit Report**: `test-results/junit.xml`

View HTML report:
```bash
npx playwright show-report
```

## Best Practices

### Test Organization

- Each test should be independent
- Use `beforeEach` for setup, `afterEach` for cleanup
- Use descriptive test names
- Group related tests with `test.describe()`

### Assertions

- Use explicit assertions
- Check for visibility before interaction
- Handle optional features gracefully

### Waits

- Use `waitForLoadState('networkidle')` for page loads
- Use `waitForURL()` for navigation
- Use `waitForTimeout()` sparingly

### Error Handling

- Tests catch missing elements gracefully
- Optional UI elements don't fail tests
- Network errors are handled

### Screenshots

- Automatic on failure
- Manual for documentation
- Named descriptively

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run dev &
      - run: npx playwright test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: test-results/
```

## Troubleshooting

### Tests Timeout

- Increase `timeout` in `playwright.config.ts`
- Check if app is running on correct port
- Verify database connectivity

### Navigation Fails

- Ensure app is running: `npm run dev`
- Check URL in `playwright.config.ts`
- Verify authentication state

### Database Errors

- Check database connection string in `.env`
- Ensure migrations are run: `npm run db:migrate`
- Verify test user doesn't already exist

### Flaky Tests

- Increase wait times for slow systems
- Add retry logic in `playwright.config.ts`
- Use `.catch()` for optional elements

## Performance

- Tests run in parallel (set workers in config)
- Use `fullyParallel: true` for fastest execution
- Disable slow-motion in CI

## Security

- Test passwords are strong but random
- Database cleaned up after tests
- No production data used
- Test credentials not committed

## Future Enhancements

- [ ] Visual regression testing
- [ ] Performance testing
- [ ] Accessibility testing
- [ ] OAuth mocking
- [ ] API testing
- [ ] Load testing
- [ ] Cross-browser testing
- [ ] Mobile device testing

## Support

For issues or questions, check:
1. `playwright.config.ts` - Configuration
2. `tests/utils/test-fixtures.ts` - Test utilities
3. Playwright docs: https://playwright.dev
4. IPOReady docs: /docs
