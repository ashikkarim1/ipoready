# Troubleshooting Guide

Common errors, fixes, debugging techniques, and how to interpret regulator error messages.

---

## Table of Contents

1. [Common Errors & Quick Fixes](#common-errors--quick-fixes)
2. [Authentication Issues](#authentication-issues)
3. [Document Validation Errors](#document-validation-errors)
4. [Submission Failures](#submission-failures)
5. [Webhook Issues](#webhook-issues)
6. [How to Debug Adapter Issues](#how-to-debug-adapter-issues)
7. [Testing Without Real APIs](#testing-without-real-apis)
8. [Reading Regulator Error Messages](#reading-regulator-error-messages)
9. [Performance & Timeout Issues](#performance--timeout-issues)
10. [Getting Help](#getting-help)

---

## Common Errors & Quick Fixes

### Error: `AUTH_MISSING`

**Message**: "Credentials not configured"

**Causes**:
- `setCredentials()` never called
- Credentials cleared accidentally
- Different adapter instance used

**Fix**:
```typescript
// WRONG: Creating new instance without credentials
const adapter1 = new TSEAdapter();
const result = await adapter1.submit(docs, meta);  // ❌ AUTH_MISSING

// RIGHT: Set credentials before use
const adapter = new TSEAdapter();
adapter.setCredentials({
  method: 'api_key',
  apiKey: process.env.TSE_API_KEY,
});
const result = await adapter.submit(docs, meta);  // ✓ Works
```

**Debug**:
```typescript
// Add logging to see state
console.log('Credentials set?', !!adapter.credentials);
console.log('Auth method:', adapter.credentials?.method);
```

---

### Error: `AUTH_INVALID`

**Message**: "API key not configured" or "OAuth2 access token not available"

**Causes**:
- Wrong credential field for method
- Credential value is empty string
- Expired OAuth2 token

**Fix**:
```typescript
// Check you're using the right credential field
adapter.setCredentials({
  method: 'api_key',
  apiKey: 'sk-...',  // ✓ Correct field
  // NOT: api_secret: '...'  ❌ Wrong field for api_key method
});

// For OAuth2, ensure token is not expired
if (new Date() > credentials.expiresAt) {
  // Token expired - refresh it
  credentials = await refreshOAuth2Token(credentials.refreshToken);
  adapter.setCredentials(credentials);
}
```

**Debug**:
```typescript
adapter.setLogger(console);  // Enable debug logging
// Look for logs like "Credentials set" or "Building auth headers"
```

---

### Error: `DOCUMENTS_EMPTY`

**Message**: "No documents provided for validation"

**Causes**:
- Forgot to load documents before calling `validate()`
- Documents array is empty
- Documents loaded but cleared somehow

**Fix**:
```typescript
// WRONG
const documents: DocumentMetadata[] = [];  // Empty!
const result = await adapter.validate(documents);  // ❌ DOCUMENTS_EMPTY

// RIGHT
const documents: DocumentMetadata[] = [
  {
    id: 'doc1',
    type: DocumentType.PROSPECTUS,
    // ... rest of metadata
    content: Buffer.from(fileContent),
  },
  // ... more documents
];
const result = await adapter.validate(documents);  // ✓ Works
```

**Debug**:
```typescript
console.log('Documents count:', documents.length);
documents.forEach(doc => {
  console.log(`- ${doc.fileName}: ${doc.size} bytes`);
});
```

---

### Error: `DOCUMENT_MISSING`

**Message**: "Required document missing: prospectus"

**Causes**:
- Forgot to include required document type
- Wrong document type assigned
- Document filtered out by mistake

**Fix**:
```typescript
// Check what documents are required for your adapter
const requiredDocs = adapter.getRequiredDocuments();
console.log('Required:', requiredDocs);

// Ensure all required documents are present
const documentsByType = new Map(
  documents.map(doc => [doc.type, doc])
);

for (const required of requiredDocs) {
  if (!documentsByType.has(required)) {
    console.error(`Missing required: ${required}`);
  }
}
```

**Fix**:
```typescript
// Make sure document type matches
const prospectusDoc: DocumentMetadata = {
  type: DocumentType.PROSPECTUS,  // ✓ Correct
  // NOT: type: 'prospectus' as string ❌ Wrong
};
```

---

### Error: `INVALID_FORMAT`

**Message**: "Unsupported document format: docx"

**Causes**:
- Document format not supported by adapter
- Format string misspelled
- Different regulators accept different formats

**Fix**:
```typescript
// Check what formats your adapter supports
const config = adapter.getAdapterConfig();
console.log('Supported formats:', config.supportedFormats);
// Output: ['pdf', 'json']

// Convert document to supported format
if (doc.format !== 'pdf' && doc.format !== 'json') {
  // Convert DOCX to PDF
  const convertedPDF = await convertDocxToPDF(doc.content);
  doc.format = 'pdf';
  doc.content = convertedPDF;
}
```

**Quick reference by regulator**:
```
SEC EDGAR:     ['pdf', 'txt', 'htm', 'xml']
SEDAR+:        ['pdf']
TSE:           ['pdf', 'json']
ASX:           ['pdf', 'xlsx']
SGX:           ['pdf', 'docx']
```

---

## Authentication Issues

### OAuth2 Token Expiration

**Error**: Submissions work once, then fail with `AUTH_INVALID`

**Cause**: OAuth2 access token expired

**Fix**:
```typescript
class OAuthTokenManager {
  async getValidToken(credentials: AuthCredentials): Promise<string> {
    // Check if token is expiring soon (within 5 minutes)
    const expirationThreshold = 5 * 60 * 1000;
    const timeUntilExpiration =
      credentials.expiresAt!.getTime() - Date.now();

    if (timeUntilExpiration < expirationThreshold) {
      // Refresh token before it expires
      const newCredentials = await this.refreshOAuth2Token(
        credentials.refreshToken!
      );

      // Update adapter
      adapter.setCredentials(newCredentials);
      return newCredentials.accessToken!;
    }

    return credentials.accessToken!;
  }

  private async refreshOAuth2Token(refreshToken: string): Promise<AuthCredentials> {
    const response = await fetch('https://regulator.gov/oauth/token', {
      method: 'POST',
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: process.env.REGULATOR_CLIENT_ID,
        client_secret: process.env.REGULATOR_CLIENT_SECRET,
      }),
    });

    const data = await response.json();
    return {
      method: 'oauth2',
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    };
  }
}
```

---

### Certificate Authentication Issues

**Error**: "certificate not found" or "certificate password incorrect"

**Causes**:
- Certificate file path wrong
- Certificate format not supported
- Password incorrect

**Fix**:
```typescript
// Verify certificate file exists and is readable
import fs from 'fs';

const certPath = process.env.CERT_PATH!;
if (!fs.existsSync(certPath)) {
  throw new Error(`Certificate not found: ${certPath}`);
}

// Check file permissions
const stat = fs.statSync(certPath);
if (!(stat.mode & fs.constants.R_OK)) {
  throw new Error(`Cannot read certificate: ${certPath}`);
}

// Load and verify certificate
const cert = fs.readFileSync(certPath);

// Test certificate password
try {
  require('crypto').createSecureContext({
    pfx: cert,
    passphrase: process.env.CERT_PASSWORD,
  });
  console.log('Certificate loaded successfully');
} catch (error) {
  console.error('Certificate password incorrect or invalid certificate');
}
```

---

## Document Validation Errors

### Error: `PROSPECTUS_TOO_SHORT`

**Message**: "Prospectus must be at least X characters"

**Causes**:
- Document actually too short
- Validation rule threshold too high
- Empty document uploaded by mistake

**Fix**:
```typescript
// Check document size
console.log('Prospectus size:', doc.size, 'bytes');

// If legitimately small, adjust threshold
adapter.setValidationConfig({
  minProspectusSize: 10000,  // Instead of default 50000
});

// Or investigate why document is small
if (doc.size < 50000) {
  console.log('Document seems small. Check:');
  console.log('- Is it the complete document?');
  console.log('- Is it compressed (ZIP)?');
  console.log('- Is it encrypted?');
}
```

---

### Error: `MISSING_REQUIRED_SECTIONS`

**Message**: "Prospectus missing required sections: business, risk, financials"

**Causes**:
- Document genuinely missing sections
- Section headings worded differently than expected
- Document is wrong file

**Fix**:
```typescript
// Debug: Extract text and search for section keywords
const text = extractTextFromPDF(doc.content as Buffer);

const sections = {
  business: ['business', 'company overview', 'operations'],
  risk: ['risk', 'risk factors', 'risks'],
  financials: ['financial', 'financials', 'results'],
};

for (const [sectionName, keywords] of Object.entries(sections)) {
  const found = keywords.some(keyword =>
    text.toLowerCase().includes(keyword)
  );
  console.log(`${sectionName}: ${found ? '✓' : '❌'}`);
}
```

---

### Error: `INVALID_ENCODING`

**Message**: "Document must be UTF-8 encoded"

**Causes**:
- Document is latin-1 or another encoding
- Scanned PDF (image format)
- File corrupted

**Fix**:
```typescript
import iconv from 'iconv-lite';

// Detect and convert encoding
function ensureUTF8(content: Buffer): Buffer {
  // Try to decode as UTF-8
  try {
    content.toString('utf-8');
    return content;  // Already UTF-8
  } catch {
    // Try common alternatives
    const encodings = ['latin1', 'win1252', 'iso-8859-1'];

    for (const encoding of encodings) {
      try {
        const converted = iconv.encode(
          iconv.decode(content, encoding),
          'utf-8'
        );
        console.log(`Converted from ${encoding} to UTF-8`);
        return converted;
      } catch {
        continue;
      }
    }

    throw new Error('Could not determine document encoding');
  }
}

// Use it
doc.content = ensureUTF8(doc.content as Buffer);
```

---

## Submission Failures

### Error: `SUBMISSION_FAILED` with HTTP 400

**Typical causes**: Missing required fields, malformed payload

**Debug steps**:
```typescript
async function debugSubmissionError(
  error: FilingError
): Promise<void> {
  console.log('Submission failed with 400:');
  console.log('Response:', error.details?.responseBody);

  // Common 400 errors
  const body = error.details?.responseBody as string;

  if (body.includes('companyCode')) {
    console.log('→ Company code missing or invalid');
  }
  if (body.includes('document')) {
    console.log('→ Document upload failed');
  }
  if (body.includes('fiscal')) {
    console.log('→ Fiscal year end missing or invalid');
  }

  // Extract error details from response
  try {
    const json = JSON.parse(body);
    console.log('Full error details:', json);
  } catch {
    console.log('Response is not JSON:', body.substring(0, 200));
  }
}
```

---

### Error: `SUBMISSION_FAILED` with HTTP 500

**Causes**: Server-side error, usually transient

**Fix**: Retry with backoff (already handled by `withRetry`)

```typescript
// If retry doesn't work after max attempts
async function submitWithManualRetry(
  adapter: BaseFilingAdapter,
  docs: DocumentMetadata[],
  meta: FilingMetadata,
  maxAttempts: number = 5
): Promise<SubmissionResult> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await adapter.submit(docs, meta);
    } catch (error) {
      if (!(error instanceof FilingError)) throw error;

      if (error.statusCode === 500 && attempt < maxAttempts) {
        const delay = 1000 * Math.pow(2, attempt - 1);
        console.log(
          `Attempt ${attempt} failed, retrying in ${delay}ms...`
        );
        await new Promise(r => setTimeout(r, delay));
      } else {
        throw error;
      }
    }
  }

  throw new Error('Max submission attempts exceeded');
}
```

---

### Error: `SUBMISSION_FAILED` with HTTP 429 (Rate Limited)

**Cause**: Too many requests in short time

**Fix**:
```typescript
// Configure aggressive retry for rate limiting
adapter.setRetryConfig({
  maxRetries: 10,
  initialDelayMs: 5000,
  maxDelayMs: 300000,        // 5 minutes
  backoffMultiplier: 2,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
});

// Or implement queue to space out submissions
class SubmissionQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;

  async add(operation: () => Promise<any>): Promise<any> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await operation();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.process();
    });
  }

  private async process(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;
    while (this.queue.length > 0) {
      const operation = this.queue.shift();
      if (operation) {
        await operation();
        // Wait 2 seconds between submissions
        await new Promise(r => setTimeout(r, 2000));
      }
    }
    this.processing = false;
  }
}
```

---

## Webhook Issues

### Error: `WEBHOOK_SIGNATURE_INVALID`

**Cause**: Signature verification failed

**Debug**:
```typescript
function debugWebhookSignature(
  payload: any,
  signature: string,
  secret: string
): void {
  const crypto = require('crypto');

  // Try different signing methods
  const methods = [
    { name: 'HMAC-SHA256', fn: (s: string) => crypto.createHmac('sha256', secret).update(s).digest('hex') },
    { name: 'HMAC-SHA1', fn: (s: string) => crypto.createHmac('sha1', secret).update(s).digest('hex') },
    { name: 'HMAC-SHA512', fn: (s: string) => crypto.createHmac('sha512', secret).update(s).digest('hex') },
  ];

  const inputs = [
    { name: 'Stringified JSON', str: JSON.stringify(payload) },
    { name: 'Canonical form', str: canonicalizePayload(payload) },
    { name: 'Query string', str: toQueryString(payload) },
  ];

  for (const method of methods) {
    for (const input of inputs) {
      const computed = method.fn(input.str);
      if (computed === signature) {
        console.log(`✓ Signature valid using ${method.name} on ${input.name}`);
        return;
      }
    }
  }

  console.log('❌ No matching signature method found');
  console.log('Expected signature:', signature);
  console.log('Payload:', payload);
}
```

---

### Webhooks Not Being Delivered

**Causes**:
- Webhook URL not registered with regulator
- Firewall blocking webhook endpoint
- Endpoint returns error (5xx)

**Debug**:
```typescript
// 1. Check webhook is registered
const webhooks = await adapter.listRegisteredWebhooks();
console.log('Registered webhooks:', webhooks);

// 2. Test webhook endpoint manually
const testPayload = {
  filingId: 'test-123',
  status: 'accepted',
};

const response = await fetch(webhookUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(testPayload),
});

console.log('Webhook endpoint status:', response.status);

// 3. Check logs for incoming webhook attempts
const logs = await getWebhookLogs({
  url: webhookUrl,
  limit: 10,
});
logs.forEach(log => {
  console.log(`${log.timestamp}: ${log.statusCode} - ${log.error || 'OK'}`);
});
```

---

## How to Debug Adapter Issues

### Enable Verbose Logging

```typescript
// Create a logger
import winston from 'winston';

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
    new winston.transports.File({ filename: 'filing-adapter.log' }),
  ],
});

// Set on adapter
adapter.setLogger(logger);

// Now all operations are logged
// Look for logs with: adapter: 'TSEAdapter'
```

### Add Custom Instrumentation

```typescript
class InstrumentedAdapter extends TSEAdapter {
  async submit(
    documents: DocumentMetadata[],
    metadata: FilingMetadata
  ): Promise<SubmissionResult> {
    const startTime = Date.now();

    try {
      this.logDebug('Starting submission', {
        docCount: documents.length,
        company: metadata.companyName,
      });

      const result = await super.submit(documents, metadata);

      this.logDebug('Submission succeeded', {
        duration: Date.now() - startTime,
        filingId: result.filingId,
      });

      return result;
    } catch (error) {
      this.logError('Submission failed', {
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}
```

### Write to File for Later Analysis

```typescript
async function debugSubmissionFailure(
  adapter: BaseFilingAdapter,
  documents: DocumentMetadata[],
  metadata: FilingMetadata
): Promise<void> {
  const debugLog: Record<string, any> = {
    timestamp: new Date().toISOString(),
    adapter: adapter.constructor.name,
    metadata,
    documents: documents.map(d => ({
      id: d.id,
      type: d.type,
      format: d.format,
      size: d.size,
      hasContent: !!d.content,
    })),
  };

  try {
    const result = await adapter.submit(documents, metadata);
    debugLog.result = result;
  } catch (error) {
    debugLog.error = {
      code: error instanceof FilingError ? error.code : 'UNKNOWN',
      message: error instanceof Error ? error.message : String(error),
      details: error instanceof FilingError ? error.details : undefined,
    };
  }

  // Write to file for analysis
  fs.writeFileSync(
    `debug-${Date.now()}.json`,
    JSON.stringify(debugLog, null, 2)
  );
  console.log('Debug log written to debug-' + Date.now() + '.json');
}
```

---

## Testing Without Real APIs

### Mock Adapter for Testing

```typescript
class MockTSEAdapter extends TSEAdapter {
  private mockDelay = 100;

  async submit(
    documents: DocumentMetadata[],
    metadata: FilingMetadata
  ): Promise<SubmissionResult> {
    // Simulate API delay
    await new Promise(r => setTimeout(r, this.mockDelay));

    // Return mock response
    return {
      success: true,
      filingId: 'mock-' + Date.now(),
      referenceNumber: 'TSE-MOCK-' + Math.random().toString(36).substr(2, 9),
      status: 'submitted',
      submittedAt: new Date(),
      documentReceiptIds: new Map([
        [DocumentType.PROSPECTUS, 'receipt-1'],
      ]),
      warnings: [],
    };
  }

  setMockDelay(delayMs: number): void {
    this.mockDelay = delayMs;
  }
}

// Use in tests
describe('Filing workflow', () => {
  it('should handle successful submission', async () => {
    const adapter = new MockTSEAdapter();
    const result = await adapter.submit(documents, metadata);
    expect(result.success).toBe(true);
  });
});
```

---

## Reading Regulator Error Messages

### SEC EDGAR Errors

**Common error format**:
```
CIK is already assigned to a company.
Duplicate CIK.
File size exceeds maximum length of 5242880 bytes.
```

**How to interpret**:
```typescript
const secErrorMap: Record<string, string> = {
  'CIK is already assigned': 'Company already in SEC system, use existing CIK',
  'Duplicate CIK': 'This CIK is already registered',
  'File size exceeds': 'Document too large, compress or split',
  'XBRL validation': 'Financial data does not match SEC taxonomy',
  'MD&A missing': 'Management Discussion & Analysis incomplete',
  'PCAOB': 'Auditor not PCAOB-registered',
};

function interpretSecError(errorMessage: string): string {
  for (const [pattern, explanation] of Object.entries(secErrorMap)) {
    if (errorMessage.includes(pattern)) {
      return explanation;
    }
  }
  return 'Unknown SEC error - contact support';
}
```

### SEDAR+ Errors

**Common error format**:
```
[ERROR] Document validation failed: Missing required field 'prospectusType'
[WARNING] Document language not detected
```

**How to interpret**:
```typescript
const sedarErrorMap: Record<string, string> = {
  'Missing required field': 'Check required fields documentation',
  'language not detected': 'Document might be image or corrupted',
  'Document validation': 'Does not meet SEDAR+ schema',
  'Bilingual requirement': 'Must include both EN and FR',
};
```

### TSE Errors

**Common error format**:
```json
{
  "errorCode": "E001",
  "errorMessage": "会社コードが無効です",
  "errorDescription": "Invalid company code"
}
```

**How to interpret**:
```typescript
const tseErrorMap: Record<string, string> = {
  'E001': 'Invalid company code - verify TSE listing code',
  'E002': 'Missing required documents',
  'E003': 'Document format not supported',
  'E999': 'System error - try again later',
};
```

---

## Performance & Timeout Issues

### Error: `TIMEOUT` (408)

**Cause**: Request took too long

**Fix**:
```typescript
// Increase timeout for large documents
adapter.setRetryConfig({
  // ... other config
  // timeout not directly configurable in withRetry
  // Instead, increase initialDelayMs to allow more time between retries
});

// Or implement custom timeout
async function submitWithLargerTimeout(
  adapter: TSEAdapter,
  documents: DocumentMetadata[],
  metadata: FilingMetadata
): Promise<SubmissionResult> {
  const timeoutMs = 120000;  // 2 minutes
  const promise = adapter.submit(documents, metadata);

  return Promise.race([
    promise,
    new Promise<SubmissionResult>((_, reject) =>
      setTimeout(
        () => reject(new Error('Submission timeout after 2 minutes')),
        timeoutMs
      )
    ),
  ]);
}
```

---

### Slow Validation

**Symptom**: Validation takes > 10 seconds for normal documents

**Causes**: 
- Parsing large PDF files
- Running expensive content analysis
- Network calls during validation

**Fix**:
```typescript
// Profile validation
async function validateWithProfiling(
  adapter: TSEAdapter,
  documents: DocumentMetadata[]
): Promise<ValidationResult> {
  const start = Date.now();
  const result = await adapter.validate(documents);

  const duration = Date.now() - start;
  console.log(`Validation took ${duration}ms`);

  if (duration > 5000) {
    console.warn('⚠️ Validation is slow');
    console.log('Tips:');
    console.log('- Cache parsed content');
    console.log('- Run content analysis async');
    console.log('- Use smaller test documents');
  }

  return result;
}
```

---

## Getting Help

### Debugging Checklist

- [ ] Is the adapter instantiated?
- [ ] Are credentials set?
- [ ] Are documents properly formatted?
- [ ] Do documents pass validation?
- [ ] Is the API endpoint correct?
- [ ] Are error logs being captured?
- [ ] Have you tested with sandbox API?
- [ ] Does the regulator's API docs mention this error?

### How to Report Issues

Include when reporting bugs:

```typescript
const bugReport = {
  timestamp: new Date().toISOString(),
  adapterVersion: adapter.getAdapterVersion(),
  adapterName: adapter.constructor.name,
  errorCode: error.code,
  errorMessage: error.message,
  statusCode: error.statusCode,
  retryable: error.retryable,
  environment: process.env.NODE_ENV,
  documentCount: documents.length,
  documentTypes: documents.map(d => d.type),
  stackTrace: error.stack,
};

console.log('Bug report:', JSON.stringify(bugReport, null, 2));
```

### Regulator Contact Info

- **SEC EDGAR**: support@sec.gov
- **SEDAR+**: support@sedar.com
- **TSE**: help@tse.co.jp
- **ASX**: filer-support@asx.com.au
- **SGX**: listing-support@sgx.com

---

## Summary

Debugging filing adapters takes patience, but follow this process:

1. **Read the exact error message** - It usually tells you what's wrong
2. **Check logs** - Enable debug logging and review output
3. **Test in isolation** - Use mocks to narrow down where issue is
4. **Verify inputs** - Ensure documents, metadata, and credentials are correct
5. **Check regulator docs** - Specific requirements vary widely
6. **Look up the error code** - Most regulators publish error references
7. **Try sandbox API first** - Never debug against production
8. **Ask for help** - Contact regulator support if stuck

With these tools, you can solve most issues quickly.
