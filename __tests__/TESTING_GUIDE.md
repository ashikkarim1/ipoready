# Filing System Testing Infrastructure

Comprehensive testing infrastructure for IPOReady's filing submission system, covering SEDAR 2 (Canada) and SEC EDGAR (US) integrations.

## Overview

This testing infrastructure provides:

1. **Test Fixtures** - Sample prospectus files and test company data
2. **Mock API Responses** - Complete mock responses for both SEDAR 2 and SEC EDGAR
3. **End-to-End Tests** - Full test suite for `/api/filings/submit` and `/api/filings/status` endpoints
4. **Error Scenario Testing** - Comprehensive error handling and edge case coverage
5. **Webhook Testing Utilities** - Event delivery, retries, and signature verification
6. **Monitoring & Alerting** - Metrics collection, health checks, and alert management
7. **Test Helpers** - Builders, assertions, and utility functions

## File Structure

```
__tests__/
├── fixtures/
│   └── prospectus-fixtures.ts          # Test data: companies, documents, bundles
├── mocks/
│   └── api-response-mocks.ts            # Mock responses for SEDAR & SEC APIs
├── api/
│   ├── filing-e2e.test.ts               # E2E tests for submit & status endpoints
│   └── filing-errors.test.ts             # Error scenario and edge case tests
├── webhooks/
│   └── filing-webhooks.test.ts          # Webhook handling, delivery, & retries
├── monitoring/
│   └── filing-monitoring.test.ts        # Metrics, alerts, & health checks
├── utils/
│   └── filing-test-helpers.ts           # Test builders, assertions, helpers
└── TESTING_GUIDE.md                     # This file
```

## Quick Start

### Running All Tests

```bash
npm test -- __tests__/api/filing-e2e.test.ts
npm test -- __tests__/api/filing-errors.test.ts
npm test -- __tests__/webhooks/filing-webhooks.test.ts
npm test -- __tests__/monitoring/filing-monitoring.test.ts
```

### Running Specific Test Suite

```bash
# Filing submission tests
npm test -- __tests__/api/filing-e2e.test.ts --testNamePattern="POST /api/filings/submit"

# Filing status tests
npm test -- __tests__/api/filing-e2e.test.ts --testNamePattern="GET /api/filings/status"

# Error tests
npm test -- __tests__/api/filing-errors.test.ts

# Webhook tests
npm test -- __tests__/webhooks/filing-webhooks.test.ts
```

### Running with Coverage

```bash
npm test -- --coverage __tests__/
```

## Test Fixtures

### Sample Companies

#### TechVenture Inc (Canadian, SEDAR 2)
- Currency: CAD
- Exchange: TSX
- Industry: Technology
- Audit Firm: Deloitte LLP

```typescript
import { TECH_VENTURE_COMPANY, CANADIAN_FILING_BUNDLE } from '__tests__/fixtures/prospectus-fixtures'
```

#### BioInnovate Corp (US, SEC EDGAR)
- Currency: USD
- Exchange: NASDAQ
- Industry: Biotechnology
- Audit Firm: EY

```typescript
import { BIO_INNOVATE_COMPANY, US_FILING_BUNDLE } from '__tests__/fixtures/prospectus-fixtures'
```

### Available Documents

- `CANADIAN_PROSPECTUS` - Standard prospectus (English)
- `BILINGUAL_PROSPECTUS` - French language prospectus
- `US_PROSPECTUS` - SEC S-1 format
- `FINANCIAL_STATEMENTS` - Audited financial statements
- `MD_A_DOCUMENT` - Management discussion & analysis
- `CERTIFICATE_OF_COMPLIANCE` - Certificate of compliance
- `AUDITOR_CONSENT` - Auditor consent document

### Document Bundles

```typescript
// Complete Canadian filing
import { CANADIAN_FILING_BUNDLE } from '__tests__/fixtures/prospectus-fixtures'

// Complete US filing
import { US_FILING_BUNDLE } from '__tests__/fixtures/prospectus-fixtures'

// Bilingual Canadian filing
import { BILINGUAL_FILING_BUNDLE } from '__tests__/fixtures/prospectus-fixtures'
```

## Test Categories

### 1. Successful Submissions (E2E Tests)

**File:** `__tests__/api/filing-e2e.test.ts`

Tests:
- SEDAR 2 submission
- SEC EDGAR submission
- Bilingual filing
- Dry run validation
- Webhook registration

```typescript
test('should successfully submit filing to SEDAR 2', async () => {
  const request = { /* ... */ }
  const response = await POST(request)
  
  expect(response.status).toBe(200)
  expect(responseData.filing.system).toBe('sedar')
})
```

### 2. Request Validation

**File:** `__tests__/api/filing-e2e.test.ts`

Tests:
- Missing parameters
- Invalid values
- Empty arrays
- Missing metadata
- Invalid content types
- Malformed JSON

### 3. Error Scenarios

**File:** `__tests__/api/filing-errors.test.ts`

Tests:
- Validation errors
- Authentication failures
- Security (SQL injection, XSS)
- Oversized documents
- Invalid checksums
- Network errors
- Timeouts
- Concurrent requests

### 4. Webhook Handling

**File:** `__tests__/webhooks/filing-webhooks.test.ts`

Tests:
- Event sending
- Webhook validation
- Retry logic
- Signature verification
- Event state transitions

**Webhook Events:**
- `filing.submitted` - Filing accepted
- `filing.processing` - Filing under review
- `filing.accepted` - Filing approved
- `filing.rejected` - Filing rejected
- `filing.comment_letter_issued` - SEC comment letter
- `filing.effective` - Registration effective

### 5. Monitoring & Alerts

**File:** `__tests__/monitoring/filing-monitoring.test.ts`

Features:
- Metrics collection (latency, success rates, etc.)
- Alert creation and management
- Health status monitoring
- Critical threshold detection

```typescript
const metrics = new FilingMetricsCollector()
metrics.recordSubmissionAttempt('sedar', true)
metrics.recordProcessingTime('filing-001', 5000)

const alertManager = new FilingAlertManager()
alertManager.createAlert({
  severity: 'critical',
  title: 'High failure rate',
  condition: 'submission_failure_rate > 0.5',
})
```

## Test Helpers & Utilities

### Builders

Create test data with fluent API:

```typescript
import { TestCompanyBuilder, TestDocumentBuilder } from '__tests__/utils/filing-test-helpers'

// Build company metadata
const company = new TestCompanyBuilder()
  .withCompanyName('Acme Corp')
  .withCurrency('USD')
  .withCountry('US')
  .withAuditFirm('Deloitte', 'DEL-001')
  .build()

// Build document
const doc = new TestDocumentBuilder()
  .withType(DocumentType.PROSPECTUS)
  .withFileName('prospectus.pdf')
  .withSize(2500000)
  .withLanguage('en')
  .build()
```

### Assertions

Helper functions for common assertions:

```typescript
import {
  assertDocumentValid,
  assertMetadataValid,
  assertSuccessResponse,
  assertErrorResponse,
  assertFilingStatus,
} from '__tests__/utils/filing-test-helpers'

assertDocumentValid(document)
assertMetadataValid(metadata)
assertSuccessResponse(response)
assertErrorResponse(response, 'VALIDATION_ERROR')
assertFilingStatus(status, 'accepted')
```

### Mock Adapter

Simulate filing adapter behavior:

```typescript
import { MockFilingAdapter } from '__tests__/utils/filing-test-helpers'

const adapter = new MockFilingAdapter()

// Simulate failure
adapter.setFailureMode(true)

// Submit filing
const result = await adapter.submit(documents, metadata)

// Get submission
const submission = adapter.getSubmission(result.filingId)
```

### Test Data Generation

Generate parameterized test cases:

```typescript
import {
  generateFilingSystemTestCases,
  generateDocumentTypeTestCases,
  createTestDocuments,
  createTestCompanies,
} from '__tests__/utils/filing-test-helpers'

// Generate test cases
const systems = generateFilingSystemTestCases()
// [{ system: 'sedar', name: 'SEDAR 2 (Canada)' }, ...]

// Create batches
const docs = createTestDocuments(10)
const companies = createTestCompanies(5)
```

## Mock API Responses

### SEDAR 2 Mocks

```typescript
import {
  mockSedarSubmissionSuccess,
  mockSedarFilingProcessing,
  mockSedarFilingAccepted,
  mockSedarFilingRejected,
  mockSedarApiSubmitResponse,
  mockSedarApiStatusResponse,
} from '__tests__/mocks/api-response-mocks'
```

### SEC EDGAR Mocks

```typescript
import {
  mockSecSubmissionSuccess,
  mockSecFilingReview,
  mockSecFilingEffective,
  mockSecFilingRefused,
  mockSecApiSubmitResponse,
  mockSecApiStatusResponse,
} from '__tests__/mocks/api-response-mocks'
```

### Webhook Event Mocks

```typescript
import {
  mockSedarWebhookSubmitted,
  mockSedarWebhookProcessing,
  mockSedarWebhookAccepted,
  mockSedarWebhookRejected,
  mockSecWebhookCommentLetterIssued,
  mockSecWebhookEffective,
} from '__tests__/mocks/api-response-mocks'
```

## Writing New Tests

### Template: Submission Test

```typescript
import { POST } from '@/app/api/filings/submit/route'
import { CANADIAN_FILING_BUNDLE } from '__tests__/fixtures/prospectus-fixtures'

test('should handle custom scenario', async () => {
  const body = {
    filingSystem: 'sedar',
    documents: CANADIAN_FILING_BUNDLE.documents,
    metadata: CANADIAN_FILING_BUNDLE.metadata,
    options: {
      registerWebhook: true,
      dryRun: false,
    },
  }

  const request = {
    method: 'POST',
    headers: new Map([['content-type', 'application/json']]),
    json: async () => body,
    nextUrl: { searchParams: new URLSearchParams() },
  } as unknown as NextRequest

  const response = await POST(request)
  const responseData = await response.json()

  // Assert
  expect(response.status).toBe(200)
  expect(responseData.success).toBe(true)
})
```

### Template: Webhook Test

```typescript
import {
  WebhookEventHandler,
  WebhookValidator,
} from '__tests__/webhooks/filing-webhooks.test'

test('should handle webhook event', async () => {
  const handler = new WebhookEventHandler('https://example.com/webhooks')
  
  const payload = {
    eventType: 'filing.submitted',
    timestamp: new Date().toISOString(),
    filingId: 'filing-001',
    system: 'sedar',
    data: { /* ... */ },
  }

  const validation = WebhookValidator.validatePayload(payload)
  expect(validation.valid).toBe(true)

  const result = await handler.sendWebhook(payload)
  expect(result.success).toBe(true)
})
```

## Coverage Goals

Current test coverage targets:

- **Endpoint Coverage:** 100%
  - `POST /api/filings/submit` ✓
  - `GET /api/filings/status` ✓
  - `POST /api/filings/status` ✓
  - `OPTIONS /api/filings/*` ✓

- **Error Scenarios:** 95%+
  - Validation errors ✓
  - Security errors ✓
  - Network errors ✓
  - Timeout errors ✓

- **Webhook Handling:** 100%
  - Event delivery ✓
  - Retry logic ✓
  - Signature verification ✓
  - State transitions ✓

- **Monitoring:** 100%
  - Metrics collection ✓
  - Alert management ✓
  - Health checks ✓

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Filing System Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - run: npm install
      - run: npm test -- __tests__/ --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

## Performance Benchmarks

Expected test execution times:

| Suite | Tests | Duration |
|-------|-------|----------|
| E2E Tests | 25 | ~2-3s |
| Error Tests | 30 | ~2-3s |
| Webhook Tests | 20 | ~1-2s |
| Monitoring Tests | 15 | ~1-2s |
| **Total** | **90** | **~6-10s** |

## Troubleshooting

### Tests Fail with "Filing not found"

Mock the filing service to return test data:

```typescript
jest.mock('@/lib/services/filing-service', () => ({
  getFilingService: jest.fn(() => ({
    getFilingStatus: jest.fn().mockResolvedValue({
      filingId: 'test-filing',
      status: 'accepted',
      // ...
    }),
  })),
}))
```

### Webhook Tests Timeout

Increase timeout for long-running tests:

```typescript
test('webhook delivery with retries', async () => {
  // test code
}, 10000) // 10 second timeout
```

### Module Resolution Errors

Ensure jest.config.js has correct moduleNameMapper:

```javascript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/src/$1',
}
```

## Best Practices

1. **Use Fixtures** - Reuse test data from fixtures to maintain consistency
2. **Test Edge Cases** - Include boundary conditions and invalid inputs
3. **Mock External APIs** - Don't make real API calls in tests
4. **Verify Side Effects** - Check webhooks, metrics, and alerts
5. **Clean Up** - Reset mocks and data between tests
6. **Descriptive Names** - Use clear test names that describe the scenario
7. **Isolated Tests** - Each test should be independent and repeatable
8. **Performance** - Keep tests fast; mock slow operations
9. **Documentation** - Add comments for complex test logic
10. **Review Coverage** - Run coverage reports regularly

## Advanced Topics

### Custom Fixtures

Create reusable fixture patterns:

```typescript
export const EDGE_CASE_DOCUMENTS = {
  emptyProspectus: new TestDocumentBuilder().withSize(0).build(),
  maxSizeProspectus: new TestDocumentBuilder().withSize(500000000).build(),
  invalidChecksum: new TestDocumentBuilder().withChecksum('invalid').build(),
}
```

### Parameterized Tests

Test multiple scenarios:

```typescript
describe.each(generateFilingSystemTestCases())(
  'Filing submission for $name',
  ({ system }) => {
    test('should submit successfully', () => {
      // Test with system parameter
    })
  }
)
```

### Performance Testing

Measure and assert execution times:

```typescript
import {
  measureExecutionTime,
  assertExecutionTimeWithin,
} from '__tests__/utils/filing-test-helpers'

test('submission should complete within 5 seconds', async () => {
  const { result, durationMs } = await measureExecutionTime(
    () => filingService.submitFiling(request)
  )
  
  assertExecutionTimeWithin(durationMs, 5000)
})
```

## Resources

- [Jest Testing Framework](https://jestjs.io/docs/getting-started)
- [Next.js Testing](https://nextjs.org/docs/testing)
- [SEDAR 2 API Documentation](https://www.sedarplus.ca/)
- [SEC EDGAR API Documentation](https://www.sec.gov/Archives/edgar/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Support

For issues or questions about the testing infrastructure:

1. Check existing test examples in the test files
2. Review the helper functions in `filing-test-helpers.ts`
3. Consult the mock responses in `api-response-mocks.ts`
4. Open an issue with test failure details
