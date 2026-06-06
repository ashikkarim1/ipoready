# IPOReady Integration Test Suite

Comprehensive integration tests for the IPOReady platform, covering database migrations, API endpoints, authentication, data integrity, and cloud storage integration.

## Overview

This test suite validates critical platform functionality across all major systems:

- **Database Migrations**: Verify all database schemas are created correctly
- **API Endpoints**: Test all REST API routes with valid and invalid inputs
- **Authentication**: Validate OAuth2 flows (Google, LinkedIn) and session management
- **Data Integrity**: Ensure zero-duplication guarantee in document management
- **Cloud Storage**: Test Google Drive, Dropbox, OneDrive, and Box integrations

## Structure

```
tests/integration/
├── database/
│   └── migrations.test.ts          # Database schema validation
├── api/
│   ├── documents.test.ts           # Document API endpoints
│   ├── company.test.ts             # Company API endpoints
│   └── stripe-payment.test.ts      # Payment processing
├── auth/
│   ├── oauth.test.ts               # OAuth provider validation
│   └── session.test.ts             # Session management
├── data-integrity/
│   └── deduplication.test.ts       # Document deduplication tests
├── cloud-storage/
│   └── google-drive.test.ts        # Google Drive sync tests
├── test-utils.ts                   # Shared test utilities
├── jest.setup.ts                   # Test environment setup
├── jest.config.js                  # Jest configuration
└── .env.example                    # Environment template
```

## Setup

### 1. Install Dependencies

All required dependencies are already in `package.json`. Just ensure you have Jest and ts-jest:

```bash
npm install
```

### 2. Configure Environment

Create a `.env.test` file in the project root:

```bash
cp tests/integration/.env.example .env.test
```

Update with your test credentials:

```
DATABASE_URL=postgresql://user:password@localhost:5432/ipoready_test
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
STRIPE_SECRET_KEY=sk_test_your_key
...
```

### 3. Database Setup

Create a separate test database:

```bash
createdb ipoready_test
```

Run migrations on test database:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/ipoready_test" npm run db:migrate
```

## Running Tests

### Run All Integration Tests

```bash
jest --config tests/integration/jest.config.js
```

### Run Specific Test Suite

```bash
# Database migrations only
jest --config tests/integration/jest.config.js database/

# API tests only
jest --config tests/integration/jest.config.js api/

# Authentication tests only
jest --config tests/integration/jest.config.js auth/

# Data integrity tests only
jest --config tests/integration/jest.config.js data-integrity/

# Cloud storage tests only
jest --config tests/integration/jest.config.js cloud-storage/
```

### Run Specific Test File

```bash
jest --config tests/integration/jest.config.js tests/integration/database/migrations.test.ts
```

### Run with Coverage

```bash
jest --config tests/integration/jest.config.js --coverage
```

### Watch Mode (Development)

```bash
jest --config tests/integration/jest.config.js --watch
```

## Test Categories

### Database Migrations (`database/migrations.test.ts`)

Validates all database schema migrations:

- ✓ Investor Platform schema (investor_profiles, investor_criteria, etc.)
- ✓ Unified Documents schema (unified_documents, reconciliation_audit_log)
- ✓ Capital Markets Intelligence schema
- ✓ Filing Documents migration
- ✓ Foreign key constraints
- ✓ Index creation
- ✓ Data types
- ✓ NOT NULL constraints

### API Endpoints

#### Documents (`api/documents.test.ts`)

- ✓ GET /api/documents - Retrieve documents for company
- ✓ Authentication validation (401 without session)
- ✓ Company isolation (only user's company docs)
- ✓ Document ordering (by phase and creation date)
- ✓ Version information inclusion
- ✓ Error handling (database errors, invalid IDs)

#### Company (`api/company.test.ts`)

- ✓ GET /api/company - Retrieve company data
- ✓ Authentication enforcement
- ✓ Company field validation
- ✓ Missing company handling
- ✓ Database error handling

#### Payments (`api/stripe-payment.test.ts`)

- ✓ Customer creation and retrieval
- ✓ Subscription management
- ✓ Payment intent processing
- ✓ Webhook event handling
- ✓ Plan pricing and tiers
- ✓ Billing portal access
- ✓ Error scenarios (declined cards, invalid API keys)

### Authentication

#### OAuth (`auth/oauth.test.ts`)

- ✓ Google OAuth provider configuration
- ✓ LinkedIn OAuth provider configuration
- ✓ Credentials provider support
- ✓ Session creation with custom fields
- ✓ JWT token management
- ✓ Provider account linkage
- ✓ Error handling

#### Sessions (`auth/session.test.ts`)

- ✓ Session creation and validation
- ✓ Session expiration handling
- ✓ Multi-session support
- ✓ Security (no sensitive data exposure)
- ✓ Custom callback implementation
- ✓ Database session storage

### Data Integrity

#### Deduplication (`data-integrity/deduplication.test.ts`)

**Critical tests ensuring zero-duplication guarantee:**

- ✓ Unique constraint on (company_id, source_system, external_id)
- ✓ Prevents duplicate document insertion
- ✓ Allows same external_id for different companies
- ✓ Allows same source_system for different external_ids
- ✓ Document hash validation and change detection
- ✓ Reconciliation audit log tracking
- ✓ Google Drive sync without duplicates
- ✓ Dropbox sync without duplicates
- ✓ OneDrive sync without duplicates
- ✓ Concurrent insert handling
- ✓ Rollback on constraint violation

### Cloud Storage

#### Google Drive (`cloud-storage/google-drive.test.ts`)

- ✓ OAuth authentication
- ✓ File listing with filtering
- ✓ Pagination support
- ✓ File metadata retrieval
- ✓ Document sync mapping
- ✓ Rate limiting handling
- ✓ File type filtering
- ✓ Folder filtering
- ✓ Change detection
- ✓ Version tracking
- ✓ Error handling and retries

## Test Utilities (`test-utils.ts`)

Reusable helpers for integration tests:

### Database Helpers

- `createTestCompany()` - Create test company with unique ID
- `createTestUser()` - Create test user with company association
- `createTestDocument()` - Create test document
- `cleanupTestData()` - Delete test data in correct order
- `executeSql()` - Execute raw SQL for test setup
- `verifyNoDuplicateDocuments()` - Query to check for duplicates
- `testDb` - Database connection object

### Authentication Helpers

- `createMockSession()` - Create NextAuth session mock with optional overrides

### Service Mocks

- `createMockGoogleDriveService()` - Mock Google Drive API client
- `createMockStripeClient()` - Mock Stripe API client

### Async Helpers

- `waitFor()` - Wait for async condition with timeout

## Environment Configuration

### .env.test File

Create `.env.test` in project root with test credentials:

```
# Database - use separate test database
DATABASE_URL=postgresql://test:password@localhost:5432/ipoready_test

# OAuth Credentials (test/sandbox keys)
GOOGLE_CLIENT_ID=...test...
GOOGLE_CLIENT_SECRET=...test...
LINKEDIN_CLIENT_ID=...test...
LINKEDIN_CLIENT_SECRET=...test...

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=test_secret_change_in_production

# Stripe (test keys)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Google Drive
GOOGLE_DRIVE_API_KEY=...
```

See `.env.example` for complete template.

## Best Practices

### 1. Test Data Cleanup

Always use `afterEach` to clean up test data:

```typescript
afterEach(async () => {
  await cleanupTestData(testCompanyId)
})
```

### 2. Unique Test Data

Use timestamps and random strings for unique IDs:

```typescript
const companyId = `test-company-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
```

### 3. Mock External Services

Use provided mock factories to avoid external API calls:

```typescript
const mockDrive = createMockGoogleDriveService()
const mockStripe = createMockStripeClient()
```

### 4. Test Isolation

Each test should be independent. Use beforeEach/afterEach for setup/teardown:

```typescript
beforeEach(async () => {
  testData = await createTestCompany()
})

afterEach(async () => {
  await cleanupTestData(testData.id)
})
```

### 5. Error Testing

Test both success and failure scenarios:

```typescript
it('should handle errors gracefully', async () => {
  // Test error case
  await expect(functionThatThrows()).rejects.toThrow()
})
```

## Troubleshooting

### Database Connection Issues

**Error:** `connect ECONNREFUSED 127.0.0.1:5432`

**Solution:**
```bash
# Ensure PostgreSQL is running
psql postgres  # Test connection

# Create test database if missing
createdb ipoready_test
```

### Environment Variables Not Loaded

**Error:** `undefined is not a string` when accessing process.env

**Solution:**
```bash
# Ensure .env.test exists in project root
ls -la .env.test

# Verify DATABASE_URL is set
echo $DATABASE_URL
```

### Migration Failures

**Error:** `relation "table_name" does not exist`

**Solution:**
```bash
# Re-run migrations on test database
DATABASE_URL="postgresql://..." npm run db:migrate

# Or reset test database
dropdb ipoready_test
createdb ipoready_test
npm run db:migrate
```

### Mock Not Working

**Error:** `mockStripe.customers.create is not a function`

**Solution:**
- Use `createMockStripeClient()` from test-utils
- Ensure mock is called with correct syntax
- Check jest.mock() paths are correct

### Timeout Errors

**Error:** `Timeout - Async callback was not invoked within the 30000ms timeout`

**Solution:**
```typescript
// Increase timeout for specific test
it('slow test', async () => {
  // test code
}, 60000) // 60 second timeout

// Or increase globally in jest.setup.ts
jest.setTimeout(60000)
```

## Continuous Integration

### GitHub Actions Example

```yaml
name: Integration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm ci
      
      - run: |
          createdb -h localhost -U postgres ipoready_test
          DATABASE_URL="postgresql://postgres:test@localhost/ipoready_test" npm run db:migrate
      
      - run: jest --config tests/integration/jest.config.js --coverage
```

## Coverage Goals

Target coverage for integration tests:

- Database: 100% (all migrations tested)
- API: 90%+ (happy path + error cases)
- Auth: 95%+ (all flows tested)
- Data Integrity: 100% (deduplication critical)
- Cloud Storage: 85%+ (mock services)

## Known Limitations

1. **External API Rate Limits**: Mock services used to avoid hitting rate limits
2. **Real File Operations**: Google Drive tests use mocks, not real file access
3. **Stripe Webhooks**: Tested with mocked events, not real webhooks
4. **Time-based Tests**: Timezone-dependent tests may require adjustment

## Adding New Tests

### Template for New Test File

```typescript
import { sql } from '@/lib/db'
import {
  createTestCompany,
  createTestUser,
  cleanupTestData,
} from '../test-utils'

describe('Feature Name', () => {
  let testCompanyId: string
  let testUserId: string

  beforeEach(async () => {
    const company = await createTestCompany()
    testCompanyId = company.id
    const user = await createTestUser({ companyId: testCompanyId })
    testUserId = user.id
  })

  afterEach(async () => {
    await cleanupTestData(testCompanyId)
  })

  describe('Happy Path', () => {
    it('should work as expected', async () => {
      // Test happy path
      expect(result).toBeDefined()
    })
  })

  describe('Error Cases', () => {
    it('should handle errors gracefully', async () => {
      // Test error case
      await expect(failing()).rejects.toThrow()
    })
  })
})
```

## Contributing

When adding new integration tests:

1. Create test file in appropriate directory
2. Use test utilities for setup/teardown
3. Mock external services
4. Test both happy path and error cases
5. Ensure test data cleanup
6. Document test purpose in describe blocks

## Resources

- [Jest Documentation](https://jestjs.io/)
- [NextAuth.js](https://next-auth.js.org/)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Google Drive API](https://developers.google.com/drive)
- [PostgreSQL Testing](https://www.postgresql.org/docs/)

## Support

For issues or questions:

1. Check troubleshooting section above
2. Review test file comments
3. Check environment configuration
4. Verify database connectivity
5. Review Jest output for specific errors
