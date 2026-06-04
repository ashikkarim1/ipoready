# Filing Adapters Templates - Integration Guide

## Library Overview

**Complete production-ready adapter templates library with 5,799 lines of code covering all major regulatory submission patterns globally.**

This library enables IPOReady developers to add support for new countries/regulatory authorities in approximately **4 hours** of focused development work.

## What's Included

### 5 Complete Adapter Templates

| Template | Lines | Format | Examples | Time |
|----------|-------|--------|----------|------|
| **RestfulAdapterTemplate.ts** | 924 | REST API + JSON | Japan TSE, Singapore SGX, Australia ASX, Hong Kong HKEX | 4h |
| **XmlFileUploadTemplate.ts** | 1,062 | SFTP/FTP + XML | EU ESMA, Asian exchanges, Government agencies | 4h |
| **WebFormTemplate.ts** | 619 | Browser automation | India NSE/BSE, Legacy portals | 4h |
| **SoapWebServiceTemplate.ts** | 707 | SOAP + XML | Legacy Asian exchanges, Banking regulators | 4h |
| **CustomPortalTemplate.ts** | 768 | OAuth + Custom | Modern regulators, Fintech platforms | 4h |

### 2 Detailed Usage Examples

| Document | Size | Coverage |
|----------|------|----------|
| **RestfulAdapterTemplate.example.md** | 567 lines | Step-by-step Japan TSE implementation |
| **XmlFileUploadTemplate.example.md** | 640 lines | Step-by-step EU ESMA implementation |

### 1 Comprehensive README

**README.md** (512 lines)
- Template selection guide
- Implementation workflow
- Customization checklist
- Testing patterns
- Deployment guide
- Troubleshooting

## Quick Start (5 minutes)

### Step 1: Identify Regulatory Authority's API Type

Ask these questions:
- Does it offer a REST/HTTP API? → Use **RestfulAdapterTemplate**
- Does it require SFTP file upload? → Use **XmlFileUploadTemplate**
- Is it only a web portal? → Use **WebFormTemplate**
- Does it use SOAP? → Use **SoapWebServiceTemplate**
- Is it proprietary/custom? → Use **CustomPortalTemplate**

### Step 2: Copy Template

```bash
# Example: Adding Japan TSE support
cp src/lib/filing-adapters/templates/RestfulAdapterTemplate.ts \
   src/lib/filing-adapters/JapanTSEAdapter.ts
```

### Step 3: Follow TODO Markers

```typescript
// Every major section has TODO: CUSTOMIZE comments
// Find them all:
grep -n "TODO: CUSTOMIZE" src/lib/filing-adapters/JapanTSEAdapter.ts

// Complete them one by one following the checklist
```

### Step 4: Follow Example Guide

```bash
# Open the corresponding example documentation
open src/lib/filing-adapters/templates/RestfulAdapterTemplate.example.md

# Follow the 10-step implementation process with code examples
```

### Step 5: Test and Deploy

```bash
# Run tests
npm test -- JapanTSEAdapter.test.ts

# Commit to git
git add src/lib/filing-adapters/JapanTSEAdapter.ts
git commit -m "Add Japan TSE filing adapter"
```

## Template Features

Every template includes:

### 1. Type Safety (TypeScript)
```typescript
// Country-specific types are defined
export type CountryFilingForm = 'PROSPECTUS' | 'AMENDMENT' | ...
export enum CountryRejectionCode { ... }
export interface CountryFilingConfig { ... }
```

### 2. Error Handling
```typescript
// Consistent error handling with retry logic
throw new FilingError(
  'ERROR_CODE',
  'Error message',
  true,  // Retryable?
  400,   // HTTP status
  { context: 'details' }
);
```

### 3. Retry Logic with Exponential Backoff
```typescript
// Built-in retry wrapper
const result = await this.withRetry(
  () => submitDocuments(),
  'submitDocuments'
);
```

### 4. Comprehensive Logging
```typescript
// All templates log extensively at each stage
this.logDebug('Step description', { context: 'data' });
this.logInfo('Milestone reached', { progress: '50%' });
this.logWarn('Non-critical issue', { issue: 'details' });
this.logError('Critical failure', { error: 'details' });
```

### 5. Webhook Support
```typescript
// Templates include webhook handling pattern
async handleWebhook(payload: any): Promise<StatusUpdate> {
  // Verify signature, parse payload, return status update
}
```

### 6. Status Polling
```typescript
// Standard polling mechanism
const status = await adapter.getStatus(filingId);
// Returns: FilingStatus with current state
```

## File Structure

```
src/lib/filing-adapters/
├── templates/                          # ← You are here
│   ├── README.md                       # Overview & selection guide
│   ├── TEMPLATES_INTEGRATION_GUIDE.md  # This file
│   ├── RestfulAdapterTemplate.ts       # Template 1 (924 lines)
│   ├── RestfulAdapterTemplate.example.md
│   ├── XmlFileUploadTemplate.ts        # Template 2 (1,062 lines)
│   ├── XmlFileUploadTemplate.example.md
│   ├── WebFormTemplate.ts              # Template 3 (619 lines)
│   ├── SoapWebServiceTemplate.ts       # Template 4 (707 lines)
│   └── CustomPortalTemplate.ts         # Template 5 (768 lines)
├── BaseFilingAdapter.ts                # Base class (694 lines)
├── BaseFilingAdapter.test.ts           # Test patterns (388 lines)
├── SECEdgarAdapter.ts                  # Real example: US SEC
├── SEDARAdapter.ts                     # Real example: Canada SEDAR
├── examples/
│   └── SEDAR_USAGE_EXAMPLE.ts          # Real-world usage example
└── index.ts                            # Adapter registry
```

## Implementation Workflow (4 hours)

### Phase 1: Setup (30 minutes)
- [ ] Copy template file
- [ ] Rename class and properties
- [ ] Add environment variables to .env.example
- [ ] Create new adapter file in parent directory

### Phase 2: Customize Types (30 minutes)
- [ ] Define country-specific filing forms
- [ ] Define status/stage values
- [ ] Define error/rejection codes
- [ ] Create country-specific interfaces

### Phase 3: Configure API (30 minutes)
- [ ] Update API base URL
- [ ] Define endpoints
- [ ] Configure authentication method
- [ ] Set timeout and retry parameters

### Phase 4: Implement Core Methods (1.5 hours)
- [ ] `validate()` - Document validation
- [ ] `submit()` - Upload/send filing
- [ ] `getStatus()` - Retrieve status
- [ ] `handleWebhook()` - Process notifications

### Phase 5: Testing (30 minutes)
- [ ] Write unit tests
- [ ] Test with sandbox API
- [ ] Test error scenarios
- [ ] Test retry logic

## Real-World Examples Included

### USA - SEC EDGAR
**File:** `SECEdgarAdapter.ts` (600+ lines)

Demonstrates:
- Complex API with many form types
- XBRL financial statement conversion
- Multiple submission workflows
- Comment period handling
- Effective date tracking

**Use as reference for:**
- Advanced validation logic
- Handling complex regulatory requirements
- Multiple submission types

### Canada - SEDAR
**File:** `SEDARAdapter.ts` (600+ lines)

Demonstrates:
- Bilingual requirements (EN/FR)
- Multi-currency support
- Provincial compliance variations
- Corporate action handling
- Filing fee management

**Use as reference for:**
- Multi-language support
- Currency handling
- Regional compliance variations

## Authentication Patterns

All templates support 4 authentication methods:

### 1. API Key
```typescript
adapter.setCredentials({
  method: 'api_key',
  apiKey: process.env.COUNTRY_API_KEY,
});
// Header: Authorization: Bearer {apiKey}
```

### 2. OAuth2
```typescript
adapter.setCredentials({
  method: 'oauth2',
  accessToken: token,
  refreshToken: refreshToken,
});
// Header: Authorization: Bearer {accessToken}
```

### 3. Certificate (mTLS)
```typescript
adapter.setCredentials({
  method: 'certificate',
  certificatePath: '/path/to/cert.pem',
  certificatePassword: 'password',
});
// TLS client certificate authentication
```

### 4. Basic Auth
```typescript
adapter.setCredentials({
  method: 'basic_auth',
  username: process.env.USERNAME,
  password: process.env.PASSWORD,
});
// Header: Authorization: Basic {encoded}
```

## API Documentation Checklist

Before implementing, gather this information from regulatory authority:

### REST API
- [ ] Base URL (production and sandbox)
- [ ] Authentication method
- [ ] Rate limits (requests/minute)
- [ ] Supported document formats
- [ ] Maximum file sizes
- [ ] Required headers
- [ ] Request/response format (JSON/XML)
- [ ] Status values and meanings
- [ ] Error codes and meanings
- [ ] Timeout recommendations
- [ ] Webhook signature algorithm (if webhooks)

### File Upload (SFTP/XML)
- [ ] SFTP server hostname and port
- [ ] Authentication (password or SSH key)
- [ ] Inbound directory path
- [ ] Outbound directory path
- [ ] Required XML schema/namespace
- [ ] File naming convention
- [ ] Maximum file size
- [ ] Manifest requirements
- [ ] Acknowledgment file format

### Web Form Portal
- [ ] Login URL and form structure
- [ ] Form field selectors and IDs
- [ ] Required form pages/steps
- [ ] File upload endpoints
- [ ] CAPTCHA presence and handling
- [ ] Confirmation page structure
- [ ] Session/cookie requirements

### SOAP Web Service
- [ ] WSDL URL or file location
- [ ] Service name and port
- [ ] Available operations
- [ ] Input/output message types
- [ ] Namespace URIs
- [ ] Authentication (WS-Security, etc.)
- [ ] Fault response structure
- [ ] Timeout recommendations

### Custom Portal
- [ ] OAuth endpoints
- [ ] Workflow steps and order
- [ ] API endpoints per step
- [ ] Required fields per step
- [ ] Webhook format and signature
- [ ] Error response format
- [ ] Status values
- [ ] Progress tracking mechanism

## Testing Patterns

### Unit Tests Template
```typescript
import { CountryAdapter } from './CountryAdapter';

describe('CountryAdapter', () => {
  let adapter: CountryAdapter;

  beforeEach(() => {
    adapter = new CountryAdapter();
    adapter.setCredentials({ method: 'api_key', apiKey: 'test' });
  });

  describe('validate', () => {
    it('should validate documents', async () => {
      const result = await adapter.validate([mockDocument]);
      expect(result.isValid).toBe(true);
    });
  });

  describe('submit', () => {
    it('should submit filing', async () => {
      const result = await adapter.submit([mockDocument], mockMetadata);
      expect(result.success).toBe(true);
    });
  });
});
```

### Integration Tests
```bash
# Test with sandbox API
npm test -- --env=sandbox

# Test error scenarios
npm test -- --suite=error-handling

# Test retry logic
npm test -- --suite=retry-logic
```

## Environment Variables

Every adapter needs these in `.env` and `.env.example`:

```bash
# Authentication
COUNTRY_API_KEY=your_key_here
COUNTRY_API_SECRET=your_secret_here
COUNTRY_OAUTH_CLIENT_ID=...
COUNTRY_OAUTH_CLIENT_SECRET=...

# API Configuration
COUNTRY_API_BASE_URL=https://api.example.com
COUNTRY_API_ENDPOINT_SUBMIT=/filings/submit
COUNTRY_API_ENDPOINT_STATUS=/filings/{id}/status

# Webhook
COUNTRY_WEBHOOK_SECRET=your_webhook_secret
COUNTRY_WEBHOOK_ENDPOINT=https://yourdomain.com/webhooks/country

# File Transfer (SFTP)
FILE_TRANSFER_HOST=sftp.example.com
FILE_TRANSFER_PORT=22
FILE_TRANSFER_USERNAME=user
FILE_TRANSFER_PRIVATE_KEY_PATH=/path/to/key.pem

# Portal Credentials (Web Form)
PORTAL_URL=https://portal.example.com
PORTAL_USERNAME=your_username
PORTAL_PASSWORD=your_password

# Features
DEBUG=filing-adapters
LOG_LEVEL=debug
MAX_RETRIES=3
```

## Monitoring & Observability

### Metrics to Track

```typescript
// In your monitoring service
const metrics = {
  submissionsTotal: 0,
  submissionsSuccessful: 0,
  submissionsFailed: 0,
  averageSubmissionTimeMs: 0,
  avgDocumentSizeBytes: 0,
  errorsByCode: {},
  statusDistribution: {},
  webhookProcessingTimeMs: 0,
};
```

### Logging Levels

```typescript
// DEBUG: Detailed step-by-step progress
this.logDebug('Connecting to API', { url, timeout });

// INFO: Milestone achievements
this.logInfo('Submission successful', { filingId, referenceNumber });

// WARN: Non-critical issues
this.logWarn('Retry attempt #2', { operationName });

// ERROR: Critical failures
this.logError('API error', { statusCode, message });
```

### Health Checks

Every adapter supports health checks:

```typescript
const health = await adapter.healthCheck();
if (!health.isHealthy) {
  console.error('Adapter health check failed:', health.message);
  // Alert operations team
}
```

## Deployment Checklist

- [ ] All TODO: CUSTOMIZE items completed
- [ ] Unit tests written and passing
- [ ] Integration tests with sandbox API passing
- [ ] Environment variables configured
- [ ] Error handling tested
- [ ] Retry logic verified
- [ ] Logging working correctly
- [ ] Webhook endpoints registered (if applicable)
- [ ] SSL/TLS certificates valid
- [ ] Rate limiting handled
- [ ] Documentation updated
- [ ] Team trained on new adapter
- [ ] Monitoring/alerting configured
- [ ] Backup/disaster recovery plan in place

## Common Pitfalls & Solutions

### Pitfall 1: Mismatched Authentication
**Problem:** "401 Unauthorized" errors
**Solution:** Verify auth method matches regulatory authority's requirement. Test with curl first.

### Pitfall 2: Inconsistent Status Polling
**Problem:** Missing status updates
**Solution:** Ensure polling interval matches regulator's processing time. Don't poll too frequently (rate limits) or too infrequently (lag).

### Pitfall 3: Document Format Issues
**Problem:** "Invalid document format" rejections
**Solution:** Download sample documents from regulator and test with them first.

### Pitfall 4: Webhook Signature Failures
**Problem:** "Webhook signature verification failed"
**Solution:** Verify webhook secret is correct and matches the signature algorithm (HMAC-SHA256, RSA, etc.).

### Pitfall 5: Timeout During Large Uploads
**Problem:** Uploads failing for large documents
**Solution:** Increase upload timeout and implement chunked uploads if needed.

### Pitfall 6: Namespace/Encoding Issues
**Problem:** XML submission failures
**Solution:** Use online XML validators to verify format before submitting.

## Support Resources

### Internal
- **BaseFilingAdapter.ts** - Base class with shared functionality
- **SECEdgarAdapter.ts** - Real production example (US)
- **SEDARAdapter.ts** - Real production example (Canada)

### External
- Regulatory authority's technical documentation
- WSDL files (for SOAP services)
- API sandbox/test environment
- Postman collections (if available)
- SFTP test servers

## Performance Benchmarks

Expected performance for each template type:

| Template | Validation | Submission | Status Poll | Retry Attempts |
|----------|-----------|-----------|-------------|----------------|
| REST API | 1-2s | 5-15s | 1-5s | 3x |
| SFTP/XML | 2-5s | 20-60s | 2-10s | 3x |
| Web Form | 5-30s | 30-120s | N/A | 1x |
| SOAP | 2-5s | 10-30s | 2-5s | 3x |
| Custom | 1-3s | 15-45s | 2-5s | 3x |

## Version History

- **v1.0** (2024-06-04) - Initial release with 5 complete templates

## Getting Help

If stuck during implementation:

1. **Check the example documentation** for your template type
2. **Review real adapters** (SEC, SEDAR) for patterns
3. **Read the regulatory authority's API docs** carefully
4. **Test with sandbox API** before production
5. **Enable DEBUG logging** to trace issues
6. **Ask team members** who implemented similar countries

## Next Steps After Implementation

1. **Register adapter** in `index.ts`
2. **Add to dashboard UI** for user selection
3. **Create internal runbook** for handling errors
4. **Set up automated monitoring**
5. **Document for support team**
6. **Train internal users**
7. **Schedule regular maintenance** (API changes, etc.)

## Conclusion

With these 5 templates and example guides, adding a new country adapter is a straightforward 4-hour process. Each template covers real-world patterns found globally, with comprehensive error handling, retry logic, and logging built in.

**Start with the template that matches your regulatory authority's submission method, follow the TODO markers, and reference the example documentation. You'll have a production-ready adapter in 4 hours.**

Good luck! 🚀
