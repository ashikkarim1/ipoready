# Integration Test Suite - Complete Index

## Documentation

### Quick References
- **[QUICK_START.md](./QUICK_START.md)** - 5-minute setup guide
- **[TEST_SUITE_SUMMARY.md](./TEST_SUITE_SUMMARY.md)** - Metrics and overview
- **[README.md](./README.md)** - Full comprehensive documentation
- **[EXECUTION_GUIDE.md](./EXECUTION_GUIDE.md)** - Detailed execution commands

---

## Test Files by Category

### 📁 Database Tests

#### **[database/migrations.test.ts](./database/migrations.test.ts)**
- **Lines:** 280+
- **Test Cases:** 15+
- **Assertions:** 88
- **Description:** Validates all database migrations and schema integrity

**Coverage:**
- Migration 001: Investor Platform Schema
  - investor_profiles table
  - investor_criteria with array types
  - investor_notification_preferences
  - investor_saved_companies
  - Foreign key constraints
- Migration 002: Unified Documents Schema
  - unified_documents table
  - reconciliation_audit_log
  - Unique constraint enforcement
- Migration 003: Capital Markets Intelligence
  - market_intelligence_data
  - market_benchmarks
- Filing Documents migration
- Migration integrity checks
- Data type validation
- Constraint validation
- Index validation

**Key Tests:**
- `should have investor_profiles table`
- `should have unique constraint on (company_id, source_system, external_id)`
- `should enforce NOT NULL on critical columns`
- `should have indexes on foreign keys`

---

### 📡 API Tests

#### **[api/documents.test.ts](./api/documents.test.ts)**
- **Lines:** 180+
- **Test Cases:** 12
- **HTTP Method:** GET /api/documents
- **Description:** Tests document retrieval API endpoint

**Coverage:**
- Authentication validation
  - Returns 401 without session
  - Returns 401 without companyId
- Data retrieval
  - Returns documents for authenticated user
  - Only returns user's company documents
- Ordering and sorting
  - Documents ordered by phase and creation date
- Response structure
  - Includes version information
  - Contains required fields (id, name, type, status)
- Error handling
  - Database connection errors
  - Invalid company ID format
- Empty data scenarios

**Key Tests:**
- `should return 401 when not authenticated`
- `should only return documents for user company`
- `should order documents by phase and creation date`
- `should include document version information`

---

#### **[api/company.test.ts](./api/company.test.ts)**
- **Lines:** 140+
- **Test Cases:** 10
- **HTTP Method:** GET /api/company
- **Description:** Tests company data retrieval endpoint

**Coverage:**
- Authentication
  - Returns 401 without session
- Company data retrieval
  - Returns company for authenticated user
  - Only returns user's own company
- Data validation
  - Validates company field types and presence
- Error scenarios
  - Missing company handling
  - Invalid session data
  - Database errors

**Key Tests:**
- `should return 401 when not authenticated`
- `should only return user own company data`
- `should validate company fields`
- `should handle missing company gracefully`

---

#### **[api/stripe-payment.test.ts](./api/stripe-payment.test.ts)**
- **Lines:** 400+
- **Test Cases:** 35+
- **Endpoints:** Payment processing, subscriptions, webhooks
- **Description:** Comprehensive payment processing tests using mocked Stripe API

**Coverage:**
- Customer Management (5 tests)
  - Create Stripe customer
  - Retrieve customer by ID
  - Handle missing customer
  - Customer company mapping
- Subscription Management (6 tests)
  - Create subscription
  - Retrieve subscription
  - Update subscription
  - Subscription cancellation
  - Track subscription periods
  - Trial period handling
- Payment Intent (5 tests)
  - Create payment intent
  - Retrieve payment intent
  - Handle payment failure
  - Declined card handling
  - Payment status tracking
- Webhook Events (6 tests)
  - payment_intent.succeeded
  - customer.subscription.updated
  - customer.subscription.deleted
  - Webhook signature verification
  - Invalid signature rejection
  - Event routing
- Error Handling (5 tests)
  - API authentication errors
  - Invalid request errors
  - Rate limiting
  - Network errors
- Pricing and Plans (2 tests)
  - Multiple pricing tiers
  - Cost calculation
- Billing Portal (2 tests)
  - Create billing portal session
  - Handle missing customer

**Key Tests:**
- `should create Stripe customer`
- `should handle payment_intent.succeeded event`
- `should verify webhook signature`
- `should handle declined card`

---

#### **[api/error-handling.test.ts](./api/error-handling.test.ts)**
- **Lines:** 350+
- **Test Cases:** 25+
- **Description:** Comprehensive error handling and request validation tests

**Coverage:**
- Authentication Errors (4 tests)
  - Missing authentication
  - Invalid session
  - Missing companyId
  - Error message inclusion
- Request Validation (4 tests)
  - Query parameter validation
  - Request body validation
  - Content type validation
  - Input data type validation
- Rate Limiting (3 tests)
  - Request count tracking
  - Rate limit exceeded (429)
  - Rate limit reset
- CORS Headers (2 tests)
  - CORS header inclusion
  - Unauthorized origin rejection
- Response Formatting (4 tests)
  - JSON response format
  - Proper status codes
  - Error details in response
  - No sensitive data exposure
- NULL and Empty Values (3 tests)
  - NULL query parameters
  - Empty request body
  - NULL values in response
- XSS and Injection (3 tests)
  - String input sanitization
  - HTML escaping
  - SQL injection prevention
- Concurrent Requests (2 tests)
  - Multiple simultaneous requests
  - Race condition prevention
- Method Validation (2 tests)
  - Unsupported method handling
  - Correct HTTP method support
- Timeout Handling (2 tests)
  - Timeout behavior
  - 504 response on timeout
- Logging (2 tests)
  - Error logging
  - Request ID for tracing

**Key Tests:**
- `should return 401 for missing authentication`
- `should sanitize string inputs`
- `should prevent SQL injection`
- `should not expose sensitive information in errors`

---

### 🔐 Authentication Tests

#### **[auth/oauth.test.ts](./auth/oauth.test.ts)**
- **Lines:** 220+
- **Test Cases:** 20+
- **Description:** OAuth2 authentication flow testing

**Coverage:**
- Google OAuth Provider (3 tests)
  - Provider configuration
  - Environment variables
  - OAuth callback handling
- LinkedIn OAuth Provider (2 tests)
  - Provider configuration
  - Environment variables
- Credentials Provider (2 tests)
  - Credentials-based auth
  - Authorization validation
- Session Management (3 tests)
  - Session object creation
  - Custom field extension
  - Session expiration
- JWT Token Management (3 tests)
  - Required JWT claims
  - Token encoding
  - Token format
- Error Handling (2 tests)
  - Missing provider config
  - Invalid OAuth tokens
- Provider Account Linkage (2 tests)
  - OAuth account linking
  - Multiple provider accounts

**Key Tests:**
- `should configure Google provider with correct settings`
- `should create session for authenticated user`
- `should include user role in session`
- `should handle multiple provider accounts per user`

---

#### **[auth/session.test.ts](./auth/session.test.ts)**
- **Lines:** 280+
- **Test Cases:** 25+
- **Description:** Session management and lifecycle testing

**Coverage:**
- Session Creation (4 tests)
  - Session creation
  - User profile data
  - User role inclusion
  - Subscription information
- Session Expiration (3 tests)
  - Expiration time setting
  - Duration validation
  - Session refresh
- Session Validation (4 tests)
  - Missing session handling
  - Required field validation
  - Email format validation
  - companyId validation
- Multi-Session Handling (2 tests)
  - Multiple simultaneous sessions
  - Separate session states
- Session Security (3 tests)
  - No sensitive data exposure
  - Token format validation
  - Corrupted data handling
- Callback Customization (2 tests)
  - Custom session callback
  - Session data modification
- Database Persistence (2 tests)
  - Session database storage
  - Session retrieval

**Key Tests:**
- `should create session for authenticated user`
- `should include user profile data in session`
- `should not expose sensitive data in session`
- `should maintain separate session states`

---

### 🔍 Data Integrity Tests

#### **[data-integrity/deduplication.test.ts](./data-integrity/deduplication.test.ts)**
- **Lines:** 450+
- **Test Cases:** 40+
- **Assertions:** 85
- **Description:** Critical zero-duplication guarantee testing

**Coverage:**
- Unified Documents Table (5 tests)
  - Unique constraint existence
  - Duplicate prevention
  - Same external_id for different companies
  - Same source_system for different IDs
  - Multiple source systems support
- Document Hash Validation (2 tests)
  - Hash calculation
  - Modified document detection
- Reconciliation Audit Log (3 tests)
  - Log table existence
  - Operation logging
  - Timestamp tracking
- Document Sync Deduplication (4 tests)
  - Google Drive sync
  - Dropbox sync
  - OneDrive sync
  - Idempotent operations
- Data Integrity Queries (3 tests)
  - No duplicates verification
  - Duplicate detection
  - Unique count validation
- Error Scenarios (4 tests)
  - Concurrent inserts
  - Rollback on violation
  - Transaction integrity
  - Constraint enforcement

**Key Tests:**
- `should have unique constraint on (company_id, source_system, external_id)`
- `should prevent inserting duplicate`
- `should verify no duplicates via query`
- `should rollback on constraint violation`

---

### ☁️ Cloud Storage Tests

#### **[cloud-storage/google-drive.test.ts](./cloud-storage/google-drive.test.ts)**
- **Lines:** 400+
- **Test Cases:** 45+
- **Description:** Google Drive API integration testing

**Coverage:**
- Authentication (3 tests)
  - Google API authentication
  - OAuth credentials
  - Authentication error handling
- File Listing (5 tests)
  - List files
  - Query filtering
  - Pagination
  - File metadata
  - Empty list handling
- File Operations (4 tests)
  - Get file details
  - Export content
  - File not found
  - Permission denied
- Document Sync (4 tests)
  - Sync from Drive
  - Map to unified documents
  - Error handling
  - Sync status tracking
- Rate Limiting (2 tests)
  - Rate limit errors
  - Exponential backoff
- File Filtering (2 tests)
  - Filter by file type
  - Filter by folder
- Error Handling (4 tests)
  - Transient error retry
  - Timeout handling
  - Connection errors
  - Graceful degradation
- Change Detection (2 tests)
  - File modification detection
  - Version tracking

**Key Tests:**
- `should authenticate with Google API`
- `should list files from Google Drive`
- `should sync documents from Google Drive`
- `should handle rate limit errors gracefully`

---

## Infrastructure Files

### Configuration

#### **[jest.config.js](./jest.config.js)**
- Jest test runner configuration
- TypeScript support (ts-jest)
- Module path mapping
- Coverage settings
- Test environment setup

#### **[jest.setup.ts](./jest.setup.ts)**
- Test environment initialization
- Console mocking
- Global test configuration
- Timeout settings
- Next.js runtime setup

### Utilities

#### **[test-utils.ts](./test-utils.ts)**
- **Lines:** 250+
- **Purpose:** Shared test utilities and helpers
- **Exports:**
  - Database helpers
    - `createTestCompany()`
    - `createTestUser()`
    - `createTestDocument()`
    - `cleanupTestData()`
    - `executeSql()`
    - `verifyNoDuplicateDocuments()`
  - Authentication helpers
    - `createMockSession()`
  - Service mocks
    - `createMockGoogleDriveService()`
    - `createMockStripeClient()`
  - Async helpers
    - `waitFor()`

### Environment

#### **[.env.example](./env.example)**
- Environment variable template
- Database configuration
- OAuth credentials
- API keys
- NextAuth configuration

---

## Quick Navigation

### By Test Type

**Happy Path Tests** (Positive Scenarios)
- Documents retrieval ✓
- Company data ✓
- Payment processing ✓
- OAuth flows ✓
- File sync ✓

**Error Tests** (Negative Scenarios)
- 401 authentication errors ✓
- Invalid input validation ✓
- Rate limiting ✓
- Database errors ✓
- Permission denied ✓

**Edge Cases**
- NULL and empty values ✓
- Concurrent operations ✓
- Timeout scenarios ✓
- Rollback on errors ✓
- XSS/injection attempts ✓

### By Feature

**Database**
- [database/migrations.test.ts](./database/migrations.test.ts)

**API**
- [api/documents.test.ts](./api/documents.test.ts)
- [api/company.test.ts](./api/company.test.ts)
- [api/stripe-payment.test.ts](./api/stripe-payment.test.ts)
- [api/error-handling.test.ts](./api/error-handling.test.ts)

**Authentication**
- [auth/oauth.test.ts](./auth/oauth.test.ts)
- [auth/session.test.ts](./auth/session.test.ts)

**Data Integrity**
- [data-integrity/deduplication.test.ts](./data-integrity/deduplication.test.ts)

**Cloud Storage**
- [cloud-storage/google-drive.test.ts](./cloud-storage/google-drive.test.ts)

---

## Statistics

| Category | Files | Tests | Assertions |
|----------|-------|-------|-----------|
| Database | 1 | 15+ | 88 |
| API | 4 | 52+ | 150+ |
| Auth | 2 | 45+ | 120+ |
| Data Integrity | 1 | 40+ | 85 |
| Cloud Storage | 1 | 45+ | 100+ |
| **TOTAL** | **9** | **197+** | **543+** |

---

## Getting Started

1. **New to tests?** → Start with [QUICK_START.md](./QUICK_START.md)
2. **Need details?** → Read [README.md](./README.md)
3. **Running tests?** → See [EXECUTION_GUIDE.md](./EXECUTION_GUIDE.md)
4. **Want metrics?** → Check [TEST_SUITE_SUMMARY.md](./TEST_SUITE_SUMMARY.md)

---

## Support

- Check specific test file comments for test purpose
- Review QUICK_START.md for setup issues
- See EXECUTION_GUIDE.md for troubleshooting
- Refer to README.md for comprehensive documentation

---

**Last Updated:** June 7, 2026  
**Status:** ✅ Complete and Ready to Use
