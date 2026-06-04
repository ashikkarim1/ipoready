# Filing Adapters Templates Library

## Overview

This directory contains **5 production-ready adapter templates** that enable IPOReady to integrate with regulatory authorities globally. Each template is a copy-paste starting point for implementing new country/jurisdiction adapters in approximately **4 hours**.

All templates follow IPOReady's filing adapter patterns established in `BaseFilingAdapter.ts` and include:
- Complete type definitions
- Detailed implementation comments
- Real-world examples
- Error handling patterns
- Retry logic with exponential backoff
- Comprehensive logging
- Production-ready validation

## Quick Start

1. **Identify your regulatory authority's submission method** (REST API, SFTP/XML, Web Form, SOAP, or Custom Portal)
2. **Copy the corresponding template** to a new file in the parent directory
3. **Follow the `TODO: CUSTOMIZE` markers** throughout the template
4. **Complete all items in the customization checklist**
5. **Test with regulatory authority's sandbox/test environment**
6. **Write unit tests** following the pattern in `BaseFilingAdapter.test.ts`

## Template Selection Guide

### 1. RestfulAdapterTemplate.ts (~400 lines)

**Use when:** Regulatory authority provides HTTP/HTTPS REST APIs with JSON

**Characteristics:**
- Standard REST patterns (GET, POST, PUT, DELETE)
- JSON request/response format
- HTTP status codes for error handling
- API key, OAuth2, or certificate authentication
- Status polling via GET requests

**Real-world Examples:**
- Japan TSE (Tokyo Stock Exchange)
- Singapore SGX (Singapore Exchange)
- Australia ASX (Australian Securities Exchange)
- Hong Kong HKEX
- Malaysia Bursa
- India NSE/BSE

**Includes:**
- HTTP request building
- JSON serialization
- OAuth2 token refresh handling
- Webhook signature verification (HMAC-SHA256)
- Status polling mechanisms
- Exponential backoff retry logic

**Time Estimate:** 4 hours
**Implementation Effort:** Low-Medium
**Common Issues:** API rate limiting, timeout handling, webhook signature verification

---

### 2. XmlFileUploadTemplate.ts (~350 lines)

**Use when:** Regulatory authority requires file uploads via SFTP/FTP with XML/XBRL format

**Characteristics:**
- SFTP/FTP-based file transfer (not HTTP)
- XML or XBRL document format
- Batch file submissions with manifest
- File-based status tracking (polling outbound directory)
- No webhook support (uses polling)

**Real-world Examples:**
- EU ESMA (European Securities and Markets Authority)
- Various European national financial regulators
- Some Asian exchanges requiring XBRL
- Legacy government agency systems
- EDI-style document transmission

**Includes:**
- SFTP/FTP client initialization
- XML generation from document data
- XSD schema validation
- Manifest file generation
- File staging and cleanup
- Remote directory polling for acknowledgments

**Time Estimate:** 4 hours
**Implementation Effort:** Medium
**Common Issues:** SFTP authentication, XSD validation, file permissions, polling timing

---

### 3. WebFormTemplate.ts (~300 lines)

**Use when:** Regulatory authority only offers web portal with form-based submission

**Characteristics:**
- Browser automation (Playwright/Selenium)
- Multi-page HTML forms
- File uploads through browser
- Session/cookie management
- May require CAPTCHA handling
- Real-time form validation

**Real-world Examples:**
- India NSE/BSE listing portals
- Some national regulatory bodies
- Legacy government agency web portals
- Emerging market regulators

**Includes:**
- Playwright/Selenium integration hooks
- Form field mapping and filling
- File upload handling
- Session management
- CAPTCHA detection (with manual fallback)
- Screenshot capture on errors
- Login flow automation

**Time Estimate:** 4 hours
**Implementation Effort:** Medium-High
**Common Issues:** Browser timing issues, CAPTCHA, form validation, page navigation

---

### 4. SoapWebServiceTemplate.ts (~280 lines)

**Use when:** Regulatory authority provides SOAP web services (legacy systems)

**Characteristics:**
- SOAP protocol with XML messaging
- WSDL (Web Services Description Language) files
- XML namespace handling
- SOAP fault error responses
- WS-Security authentication (optional)
- Request/response envelope wrapping

**Real-world Examples:**
- Older Asian exchanges
- Legacy banking/financial regulatory systems
- Government agencies predating REST APIs
- Legacy fintech platforms

**Includes:**
- WSDL parsing and operation mapping
- SOAP envelope generation
- XML serialization with proper escaping
- SOAP fault detection and parsing
- WS-Security token handling
- WSDL service discovery
- Fault recovery patterns

**Time Estimate:** 4 hours
**Implementation Effort:** Medium
**Common Issues:** WSDL complexity, XML namespace handling, SOAP fault parsing, legacy authentication

---

### 5. CustomPortalTemplate.ts (~320 lines)

**Use when:** Regulatory authority has proprietary system with custom workflows

**Characteristics:**
- Custom OAuth or JWT authentication
- Multi-step submission workflows
- Progress callbacks for real-time tracking
- Tiered access levels
- Custom error handling
- Session management
- Webhook support

**Real-world Examples:**
- Modern fintech-focused regulators
- Startup/emerging market regulatory systems
- Regional/local regulatory bodies
- Custom-built regulatory platforms

**Includes:**
- Custom OAuth flow implementation
- Workflow step definitions
- Progress tracking callbacks
- Session state management
- Multi-step form handling
- Custom error response parsing
- Webhook integration patterns

**Time Estimate:** 4 hours
**Implementation Effort:** Medium
**Common Issues:** Custom authentication flows, workflow state tracking, progress callbacks timing

---

## Implementation Workflow

### Phase 1: Setup (30 minutes)

1. **Copy Template**
   ```bash
   cp src/lib/filing-adapters/templates/RestfulAdapterTemplate.ts \
      src/lib/filing-adapters/CountryNameAdapter.ts
   ```

2. **Update Class Names**
   - Replace `RestfulAdapterTemplate` with `CountryNameAdapter`
   - Update `adapterName` property to something like `'country-exchange'`

3. **Environment Variables**
   ```bash
   # .env.example
   COUNTRY_API_BASE_URL=https://api.example.com
   COUNTRY_API_KEY=your_key_here
   COUNTRY_WEBHOOK_SECRET=your_webhook_secret
   COUNTRY_AUTH_METHOD=api_key  # or oauth2, certificate, basic_auth
   ```

### Phase 2: Customize Type Definitions (30 minutes)

Follow the `TODO: CUSTOMIZE` markers in the template's type section:

```typescript
// Define country-specific filing forms
export type CountryFilingForm = 
  | 'PROSPECTUS'
  | 'FINANCIAL_STMT'
  // ... add country-specific forms

// Define status values
export type CountryFilingStage =
  | 'submitted'
  | 'reviewing'
  | 'approved'
  // ... map to your country's status

// Define country-specific errors
export enum CountryRejectionCode {
  TRANSLATION_REQUIRED = 'TRANSLATION_REQUIRED',
  // ... add country-specific error codes
}
```

### Phase 3: Configure API Details (30 minutes)

Update API endpoints and configurations:

```typescript
private apiBaseUrl = process.env.COUNTRY_API_BASE_URL ||
  'https://api.example-regulator.com/v2';

private apiEndpoints = {
  submit: '/filings/submit',
  getStatus: '/filings/{filingId}/status',
  // ... other endpoints
};
```

### Phase 4: Implement Core Methods (1.5-2 hours)

The three critical methods to implement:

1. **validate()** - Local document validation
2. **submit()** - Upload/send to regulatory authority
3. **getStatus()** - Retrieve current filing status

Each template provides stubs showing the pattern.

### Phase 5: Testing (1 hour)

1. **Write unit tests** (copy structure from `BaseFilingAdapter.test.ts`)
2. **Test with sandbox environment** (most regulators provide test APIs)
3. **Manual testing** with actual documents
4. **Error scenario testing** (test error handling)

### Phase 6: Production Deployment (30 minutes)

1. **Register adapter** in `index.ts`
2. **Create webhook endpoint** (if supported)
3. **Configure monitoring** and alerting
4. **Document implementation** for your team

## Common Customization Points

### Authentication Setup

```typescript
// API Key authentication
adapter.setCredentials({
  method: 'api_key',
  apiKey: process.env.COUNTRY_API_KEY,
});

// OAuth2 authentication
adapter.setCredentials({
  method: 'oauth2',
  clientId: process.env.COUNTRY_CLIENT_ID,
  clientSecret: process.env.COUNTRY_CLIENT_SECRET,
});

// Certificate authentication (mTLS)
adapter.setCredentials({
  method: 'certificate',
  certificatePath: '/path/to/cert.pem',
  certificatePassword: 'password',
});

// Basic authentication
adapter.setCredentials({
  method: 'basic_auth',
  username: process.env.COUNTRY_USERNAME,
  password: process.env.COUNTRY_PASSWORD,
});
```

### Document Type Mapping

Map documents to regulatory requirements:

```typescript
private async validateProspectusContent(doc: DocumentMetadata): Promise<void> {
  // Country-specific prospectus validation
  // Example: Check for required sections, language, length, etc.
  
  if (!content.includes('REQUIRED_SECTION')) {
    throw new FilingError(
      'MISSING_SECTION',
      'Prospectus missing required section',
      false,
      400
    );
  }
}
```

### Error Handling

Create country-specific error mapping:

```typescript
// Map API error codes to FilingError
private mapApiErrorToFilingError(apiError: any): FilingError {
  switch (apiError.code) {
    case 'INVALID_FORMAT':
      return new FilingError(
        'INVALID_DOCUMENT_FORMAT',
        'Document format not accepted',
        false,
        400
      );
    case 'PROCESSING_TIMEOUT':
      return new FilingError(
        'PROCESSING_ERROR',
        'Regulatory authority timeout',
        true,  // Retryable
        503
      );
    // ... more mappings
  }
}
```

### Status Tracking

Implement status polling:

```typescript
// Poll for status every 5 minutes
setInterval(async () => {
  const status = await adapter.getStatus(filingId);
  await updateDatabase(filingId, status);
}, 5 * 60 * 1000);
```

## Testing Checklist

Before going to production:

- [ ] **Unit tests** written and passing
- [ ] **Integration tests** with sandbox API
- [ ] **Document validation** working correctly
- [ ] **Error scenarios** handled properly
- [ ] **Timeout handling** implemented
- [ ] **Retry logic** functioning
- [ ] **Webhook signature verification** working (if applicable)
- [ ] **Status polling** accurate
- [ ] **Logging** comprehensive and useful
- [ ] **Documentation** complete for team

## File Size Limits

Each template includes reasonable default limits, but verify with your regulatory authority:

```typescript
// Customize in your adapter
private fileTransferConfig = {
  maxUploadSizeBytes: 100 * 1024 * 1024, // 100MB
  uploadTimeoutMs: 120000, // 2 minutes
  connectionTimeoutMs: 30000, // 30 seconds
};
```

## Monitoring & Debugging

### Logging Configuration

```typescript
import logger from '@/services/Logger';

adapter.setLogger(logger);

// Logs automatically include:
// - Adapter name
// - Context information
// - Request/response details
// - Error stack traces
```

### Debug Mode

Enable detailed logging:

```bash
DEBUG=*:filing-adapters npm run dev
```

### Screenshot Capture (Web Form Templates)

Automatically capture screenshots on failures for debugging:

```typescript
formConfig.screenshotOnError = true;
// Screenshots saved to: /tmp/filing-submissions/
```

## Deployment Checklist

- [ ] Environment variables configured in CI/CD
- [ ] API keys and credentials stored securely
- [ ] Webhook endpoints registered with regulatory authority
- [ ] SSL/TLS certificates configured (if applicable)
- [ ] Error alerting set up
- [ ] Status page/dashboard created
- [ ] Team documentation written
- [ ] Backup/disaster recovery plan in place
- [ ] Rate limiting handled
- [ ] Audit logging enabled

## Support & Troubleshooting

### Common Issues by Template Type

**RestfulAdapterTemplate:**
- API rate limits → Implement exponential backoff
- Authentication failures → Verify credentials and headers
- Webhook signature validation → Check secret is correct

**XmlFileUploadTemplate:**
- SFTP connection timeouts → Verify firewall rules
- XSD validation failures → Download latest schema
- File permissions issues → Check SFTP account permissions

**WebFormTemplate:**
- Form filling timeouts → Increase wait timeouts
- CAPTCHA blocking submissions → Implement manual fallback
- Page navigation failures → Update selectors for form changes

**SoapWebServiceTemplate:**
- SOAP faults → Parse fault details for root cause
- XML namespace issues → Verify namespace matches WSDL
- Legacy authentication → Implement WS-Security tokens

**CustomPortalTemplate:**
- Workflow state issues → Verify session management
- Step failures → Check step prerequisites
- Progress callback errors → Implement error handling in callbacks

## Additional Resources

- **BaseFilingAdapter.ts** - Base class documentation
- **IMPLEMENTATION_GUIDE.md** - General adapter patterns
- **SECEdgarAdapter.ts** - Real production example (US)
- **SEDARAdapter.ts** - Real production example (Canada)
- **examples/** directory - Usage examples

## Template Maintenance

Templates are updated quarterly to:
- Add support for new OAuth2/authentication patterns
- Update deprecated API patterns
- Fix known issues and edge cases
- Add new test patterns
- Improve documentation

Check the git history for latest changes:

```bash
git log --oneline src/lib/filing-adapters/templates/
```

## Contributing New Templates

To add a new submission pattern:

1. Create `NewPatternTemplate.ts` in this directory
2. Follow existing template structure
3. Add comprehensive comments and examples
4. Create `NewPatternTemplate.example.md` with usage guide
5. Update this README with pattern description
6. Add test patterns

---

**Total Implementation Time for New Adapter: 4 hours**
**Templates Ready: 5 of 5 (100%)**
**Last Updated: 2024-06-04**
