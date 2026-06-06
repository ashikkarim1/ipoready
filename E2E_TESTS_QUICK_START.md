# E2E Tests Quick Start Guide

Complete end-to-end test suite for IPOReady using Playwright. Get started in 5 minutes.

## 1. Setup (One-time)

```bash
# Run setup script
./scripts/setup-e2e-tests.sh

# Or manually:
npm install --save-dev @playwright/test
npx playwright install
cp .env.test.example .env.test
```

## 2. Start Application

```bash
npm run dev
# App runs on http://localhost:3000
```

## 3. Run Tests (in another terminal)

```bash
# All tests
npm run test:e2e

# Specific suite
npm run test:e2e:login
npm run test:e2e:documents
npm run test:e2e:capital-markets
npm run test:e2e:navigation

# Interactive UI mode
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug

# View results
npm run test:e2e:report
```

## Test Suites

| Test File | Coverage | Tests |
|-----------|----------|-------|
| `login.spec.ts` | Authentication flows | 10 |
| `documents.spec.ts` | Document management | 15 |
| `capital-markets.spec.ts` | IPO dashboard | 14 |
| `navigation.spec.ts` | Navigation & routing | 19 |
| **Total** | **Complete user journeys** | **58+** |

## Key Features

✅ **Production-Ready**
- Comprehensive error handling
- Graceful degradation for optional features
- Automatic screenshots on failure
- Video capture for failed tests

✅ **Best Practices**
- Database helpers for setup/teardown
- Test fixtures for reusable code
- Custom authentication helpers
- Document management utilities

✅ **Multi-Browser Testing**
- Chromium (Chrome)
- Firefox
- WebKit (Safari)
- Mobile Chrome
- Mobile Safari

✅ **CI/CD Ready**
- GitHub Actions workflow included
- Automatic retry logic
- Test reports (HTML, JSON, JUnit)
- Parallel execution

✅ **Developer-Friendly**
- UI mode for interactive testing
- Debug mode with step-through
- Detailed test reports
- Helpful error messages

## Test Data

**Users:**
- Admin: `e2e-admin@ipoready.test` / `TestPassword123!@#`
- CEO: `e2e-ceo@ipoready.test` / `TestPassword123!@#`
- Investor: `e2e-investor@ipoready.test` / `TestPassword123!@#`
- Director: `e2e-director@ipoready.test` / `TestPassword123!@#`

**Auto-cleanup:** All test data is cleaned up after tests run.

## File Structure

```
tests/
├── e2e/
│   ├── login.spec.ts              # Login & authentication
│   ├── documents.spec.ts          # Document operations
│   ├── capital-markets.spec.ts    # IPO dashboard
│   ├── navigation.spec.ts         # Navigation flows
│   └── README.md                  # Detailed documentation
├── utils/
│   └── test-fixtures.ts           # Helpers & utilities
└── E2E_TESTING_GUIDE.md           # Comprehensive guide

playwright.config.ts               # Playwright configuration
.env.test.example                  # Test environment template
.github/workflows/e2e-tests.yml    # CI/CD workflow
scripts/setup-e2e-tests.sh         # Setup script
E2E_TESTS_QUICK_START.md           # This file
```

## Common Commands

```bash
# Run all tests
npm run test:e2e

# Run specific test
npx playwright test -g "should successfully login"

# Run specific file
npm run test:e2e:login

# Run specific browser
npm run test:e2e:chromium

# UI mode (recommended for development)
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug

# View reports
npm run test:e2e:report

# Watch mode
npx playwright test --watch

# Parallel execution
npx playwright test --workers=4
```

## Test Examples

### Login Test
```typescript
test('should successfully login', async ({ page }) => {
  // Navigate to login
  await page.goto('/login')
  
  // Fill credentials
  await page.locator('input[type="email"]').fill('user@test.com')
  await page.locator('input[type="password"]').fill('password')
  
  // Submit and verify
  await page.locator('button[type="submit"]').click()
  await page.waitForURL('/dashboard')
  expect(page.url()).toContain('/dashboard')
})
```

### Document Upload Test
```typescript
test('should upload document', async ({ page }) => {
  // Navigate to documents
  await page.goto('/dashboard/documents')
  
  // Upload file
  const fileInput = page.locator('input[type="file"]')
  await fileInput.setInputFiles('test-file.pdf')
  await page.locator('button:has-text("Upload")').click()
  
  // Verify
  await page.waitForLoadState('networkidle')
  expect(page.locator('text=uploaded')).toBeVisible()
})
```

## Debugging

### Interactive UI Mode
Best for development and debugging:
```bash
npm run test:e2e:ui
```

Features:
- Step through tests
- Inspect elements
- View network requests
- Screenshots

### Debug Mode
Step-through execution:
```bash
npm run test:e2e:debug
```

Controls:
- F10: Step over
- F11: Step into
- F8: Continue

### Screenshots & Videos
Auto-captured on failure in `test-results/`

### View Reports
```bash
npm run test:e2e:report
```

## Troubleshooting

### Tests timeout
- Increase timeout in `playwright.config.ts`
- Check if app is running: `npm run dev`
- Verify database connection

### Database errors
```bash
npm run db:migrate        # Run migrations
```

### Browser issues
```bash
npx playwright install    # Reinstall browsers
```

### Port in use
```bash
lsof -i :3000             # Find process
kill -9 <PID>             # Kill process
npm run dev               # Restart app
```

## CI/CD

Tests run automatically on:
- Push to main/develop/staging
- Pull requests
- Manual trigger

Workflow: `.github/workflows/e2e-tests.yml`

Results:
- HTML report
- Test artifacts
- Failure screenshots
- Video recordings

## Best Practices

✅ **Do:**
- Use test fixtures and helpers
- Test complete user flows
- Handle optional elements gracefully
- Clean up test data in afterEach
- Use meaningful test names

❌ **Don't:**
- Use hardcoded waits (setTimeout)
- Test internal implementation details
- Create tests that depend on order
- Commit test credentials
- Skip cleanup

## Performance

- **Parallel execution:** 4 workers
- **Retries:** 2 in CI, 1 locally
- **Average suite time:** 5-10 minutes
- **Per-test time:** 30-60 seconds

## Next Steps

1. **Start:** `npm run dev` (then in another terminal) → `npm run test:e2e:ui`
2. **Explore:** Check out `tests/e2e/` files to understand structure
3. **Learn:** Read comprehensive guide: `tests/E2E_TESTING_GUIDE.md`
4. **Add:** Create new tests for your features
5. **Integrate:** Set up CI/CD workflow for your repo

## Documentation

- **Quick Start:** This file (you are here)
- **Comprehensive Guide:** `tests/E2E_TESTING_GUIDE.md`
- **E2E Tests README:** `tests/e2e/README.md`
- **Playwright Docs:** https://playwright.dev
- **Configuration:** `playwright.config.ts`

## Support

For issues:
1. Check test reports: `test-results/html/index.html`
2. Run in UI mode: `npm run test:e2e:ui`
3. Enable debug: `npm run test:e2e:debug`
4. Review logs in `test-results/`

---

**Happy Testing! 🎭**
