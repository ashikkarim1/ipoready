# API Integration Guide

How to call filing APIs from adapters, handle authentication, manage errors, and set up webhooks.

---

## Table of Contents

1. [Making API Calls](#making-api-calls)
2. [Authentication Patterns](#authentication-patterns)
3. [Error Handling & Retry Logic](#error-handling--retry-logic)
4. [Webhook Integration](#webhook-integration)
5. [Testing Without Real APIs](#testing-without-real-apis)
6. [Rate Limiting](#rate-limiting)
7. [Security Best Practices](#security-best-practices)

---

## Making API Calls

### Basic HTTP Request Pattern

All API calls from adapters should use the retry wrapper provided by `BaseFilingAdapter`:

```typescript
// DON'T do this
const response = await fetch(url, { headers });
const result = await response.json();

// DO this
const result = await this.withRetry(
  () => fetch(url, { headers }).then(r => {
    if (!r.ok) throw new Error(`${r.status}: ${r.statusText}`);
    return r.json();
  }),
  'descriptive operation name'
);
```

The `withRetry` wrapper automatically:
- Retries on transient failures (5xx, 408, 429)
- Implements exponential backoff with jitter
- Logs each attempt
- Converts errors to standardized `FilingError` format

### Example: REST API Call

```typescript
private async fetchFromAPI(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' = 'GET',
  payload?: Record<string, any>
): Promise<Record<string, any>> {
  const headers = this.buildAuthHeaders();
  headers['Content-Type'] = 'application/json';
  headers['User-Agent'] = 'IPOReady-FilingAdapter/1.0';

  const options: RequestInit = {
    method,
    headers,
  };

  if (payload) {
    options.body = JSON.stringify(payload);
  }

  return this.withRetry(
    async () => {
      const response = await fetch(endpoint, options);

      if (!response.ok) {
        // Extract error details from response
        let errorBody: any = {};
        try {
          errorBody = await response.clone().json();
        } catch {
          errorBody = await response.text();
        }

        // Determine if this is retryable
        const isRetryable = this.isRetryableStatusCode(response.status);

        throw new FilingError(
          `HTTP_${response.status}`,
          `API returned ${response.status}`,
          isRetryable,
          response.status,
          { 
            endpoint,
            method,
            response: errorBody,
          }
        );
      }

      return response.json();
    },
    `${method} ${endpoint}`
  );
}
```

### Example: Form Data Upload

For multipart file uploads:

```typescript
private async uploadDocument(
  filingId: string,
  document: DocumentMetadata
): Promise<{ receiptId: string }> {
  const formData = new FormData();
  formData.append('filingId', filingId);
  formData.append('documentType', document.type);
  formData.append('fileName', document.fileName);
  
  // Append file content
  const blob = Buffer.isBuffer(document.content)
    ? new Blob([document.content], { type: document.mimeType })
    : new Blob([document.content as string], { type: document.mimeType });
  formData.append('file', blob, document.fileName);

  const headers = this.buildAuthHeaders();
  // NOTE: Don't set Content-Type for FormData - browser/fetch will set it
  delete headers['Content-Type'];

  return this.withRetry(
    async () => {
      const response = await fetch(
        `${this.getApiEndpoint()}/filings/${filingId}/documents`,
        {
          method: 'POST',
          headers,
          body: formData,
        }
      );

      if (!response.ok) {
        throw new FilingError(
          'DOCUMENT_UPLOAD_FAILED',
          `Failed to upload ${document.fileName}`,
          response.status >= 500,
          response.status
        );
      }

      return response.json();
    },
    `Upload document ${document.fileName}`
  );
}
```

### Example: XML/SOAP API Call

For SOAP-based regulators:

```typescript
private async submitSOAPRequest(
  soapBody: string
): Promise<Record<string, any>> {
  const soapEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    ${soapBody}
  </soap:Body>
</soap:Envelope>`;

  const headers = this.buildAuthHeaders();
  headers['Content-Type'] = 'application/soap+xml';
  headers['SOAPAction'] = 'SubmitFiling';

  return this.withRetry(
    async () => {
      const response = await fetch(
        `${this.getApiEndpoint()}/soap`,
        {
          method: 'POST',
          headers,
          body: soapEnvelope,
        }
      );

      if (!response.ok) {
        throw new FilingError(
          'SOAP_REQUEST_FAILED',
          `SOAP API returned ${response.status}`,
          response.status >= 500,
          response.status
        );
      }

      // Parse XML response
      const xmlText = await response.text();
      return this.parseSOAPResponse(xmlText);
    },
    'SOAP submit filing'
  );
}

private parseSOAPResponse(xmlText: string): Record<string, any> {
  // Use xml2js or DOMParser
  // For Node.js:
  const xml2js = require('xml2js');
  const parser = new xml2js.Parser();
  
  return parser.parseStringPromise(xmlText);
}
```

---

## Authentication Patterns

The `buildAuthHeaders()` method in `BaseFilingAdapter` handles most standard patterns. Here's how to use each:

### Pattern 1: API Key (Simplest)

```typescript
// Configuration
adapter.setCredentials({
  method: 'api_key',
  apiKey: 'sk-1234567890abcdef',
});

// Usage (automatic in buildAuthHeaders)
// Authorization: Bearer sk-1234567890abcdef
```

**Best for**: Singapore SGX, Australia ASX, many modern regulators

**Key advantages**:
- Simple to implement
- No expiration management
- Easy to rotate

**Credentials storage**:
```typescript
// Store securely in environment
process.env.TSE_API_KEY  // Never commit this!

// Or in secure credential store
const credentials = await secretsManager.getSecret('tse/api-key');
```

### Pattern 2: OAuth2 (Standard)

```typescript
// Initial setup - user authenticates with regulator
const authUrl = 'https://regulator.gov/oauth/authorize';
const response = await fetch(authUrl, {
  client_id: process.env.REGULATOR_CLIENT_ID,
  redirect_uri: 'https://ipoready.com/callback',
  scope: 'filings:write filings:read',
});

// After user grants permission, you get tokens
adapter.setCredentials({
  method: 'oauth2',
  accessToken: 'eyJhbGciOiJIUzI1NiIs...',
  refreshToken: 'refresh_token_123...',
  expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
});

// Usage (automatic in buildAuthHeaders)
// Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Best for**: SEC EDGAR (soon), major exchanges

**Key features**:
- Expiration management needed
- Scope-based permissions
- User-initiated authorization

**Token refresh**:
```typescript
if (this.credentials?.expiresAt && this.credentials.expiresAt < new Date()) {
  // Token expired, refresh it
  const newTokens = await this.refreshOAuth2Token();
  this.credentials.accessToken = newTokens.accessToken;
  this.credentials.expiresAt = newTokens.expiresAt;
}
```

### Pattern 3: Basic Auth (Legacy)

```typescript
adapter.setCredentials({
  method: 'basic_auth',
  username: 'company_user_123',
  password: 'secure_password',
});

// Usage (automatic)
// Authorization: Basic Y29tcGFueV91c2VyXzEyMzpzZWN1cmVfcGFzc3dvcmQ=
```

**Best for**: Older SFTP-based systems, legacy HTTP APIs

**Key concerns**:
- Passwords must be transmitted securely (HTTPS only)
- Store in secure vault, never in code
- Consider switching to API key if possible

### Pattern 4: Certificate-Based (High Security)

```typescript
adapter.setCredentials({
  method: 'certificate',
  certificatePath: '/secure/path/to/client-cert.p12',
  certificatePassword: 'cert_password_123',
});
```

**Best for**: Government regulators, high-security environments

**Implementation** (requires special handling):
```typescript
import https from 'https';
import fs from 'fs';

private createHTTPSAgent(): https.Agent {
  const certs = fs.readFileSync(this.credentials!.certificatePath!);
  
  return new https.Agent({
    pfx: certs,
    passphrase: this.credentials!.certificatePassword,
    rejectUnauthorized: true,  // Verify server cert
  });
}

// Then use in fetch
const agent = this.createHTTPSAgent();
fetch(url, {
  agent,
  method: 'POST',
  body: JSON.stringify(payload),
});
```

### Pattern 5: Custom Headers

```typescript
adapter.setCredentials({
  method: 'api_key',
  apiKey: 'main_key',
  customHeaders: {
    'X-API-Client-ID': 'ipoready-prod',
    'X-Request-ID': generateUUID(),
    'X-Signature': signRequest(payload, secret),
  },
});
```

**Best for**: APIs with custom authentication schemes

---

## Error Handling & Retry Logic

### Standard Error Response

All adapter errors should be `FilingError` instances with this structure:

```typescript
export class FilingError extends Error {
  constructor(
    public code: string,           // Machine-readable code
    message: string,               // Human-readable message
    public retryable: boolean,     // Should this be retried?
    public statusCode?: number,    // HTTP status if applicable
    public details?: Record<string, any>, // Additional context
  ) {
    super(message);
    this.name = 'FilingError';
  }
}
```

### Handling API Errors

```typescript
private async submitWithErrorHandling(
  payload: Record<string, any>
): Promise<SubmissionResult> {
  try {
    const result = await this.withRetry(
      () => this.submitToAPI(payload),
      'Filing submission'
    );
    return result;
  } catch (error) {
    // All errors from withRetry are already FilingError
    if (error instanceof FilingError) {
      this.logError('Submission failed', {
        code: error.code,
        message: error.message,
        retryable: error.retryable,
        statusCode: error.statusCode,
      });

      // Handle specific errors
      if (error.code === 'DOCUMENT_MISSING') {
        throw new FilingError(
          'VALIDATION_FAILED',
          'Please upload all required documents',
          false,
          400,
          error.details
        );
      }

      if (error.code === 'RATE_LIMITED') {
        // Exponential backoff already handled by withRetry
        throw error;
      }

      // Unknown error - propagate
      throw error;
    }

    // Unexpected error type
    throw new FilingError(
      'INTERNAL_ERROR',
      error instanceof Error ? error.message : 'Unknown error',
      false,
      500
    );
  }
}
```

### Retry Configuration

Configure retry behavior per regulator:

```typescript
// Regulator with strict rate limits
adapter.setRetryConfig({
  maxRetries: 5,
  initialDelayMs: 5000,     // Start with 5 seconds
  maxDelayMs: 300000,       // Cap at 5 minutes
  backoffMultiplier: 2,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
});

// Regulator with relaxed rate limits
adapter.setRetryConfig({
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
});
```

### Timeout Handling

```typescript
private async fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number = 30000
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new FilingError(
        'TIMEOUT',
        `Request exceeded ${timeoutMs}ms timeout`,
        true,  // Retryable
        408    // Request Timeout
      );
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
```

### User-Friendly Error Messages

```typescript
private getErrorMessage(error: FilingError): string {
  switch (error.code) {
    case 'AUTH_MISSING':
      return 'Authentication not configured. Please check your credentials.';
    
    case 'DOCUMENT_MISSING':
      return `Missing required document: ${error.details?.missingType}`;
    
    case 'INVALID_FORMAT':
      return `Document format not supported: ${error.details?.format}. Try ${error.details?.supportedFormats?.join(' or ')}.`;
    
    case 'RATE_LIMITED':
      return 'Too many requests. Please wait a moment and try again.';
    
    case 'TIMEOUT':
      return 'Server is not responding. Check your connection and try again.';
    
    case 'SERVER_ERROR':
      return 'The regulatory system is temporarily unavailable. Please try again later.';
    
    default:
      return error.message || 'An unexpected error occurred.';
  }
}
```

---

## Webhook Integration

Webhooks allow the regulator's system to push status updates to IPOReady instead of polling.

### Webhook Endpoint Setup

Create a dedicated endpoint in your API route:

```typescript
// api/webhooks/[system].ts
import { NextRequest, NextResponse } from 'next/server';
import { getAdapter } from '@/lib/filing-adapters';

export async function POST(
  request: NextRequest,
  { params }: { params: { system: string } }
) {
  const system = params.system; // e.g., 'tse', 'sec', 'sedar'

  try {
    // Get the appropriate adapter
    const adapter = getAdapter(system);
    if (!adapter) {
      return NextResponse.json(
        { error: 'Unknown filing system' },
        { status: 400 }
      );
    }

    // Parse request
    const payload = await request.json();

    // Process webhook
    const statusUpdate = await adapter.handleWebhook(payload);

    // Update database
    await updateFilingStatus(statusUpdate);

    // Send notification to user
    await notifyUser(statusUpdate);

    return NextResponse.json(
      { success: true, filingId: statusUpdate.filingId },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Webhook processing failed for ${system}:`, error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
```

### Webhook Signature Verification

Every regulator has a different signing method. Implement in your adapter:

```typescript
// Example: HMAC-SHA256 verification (most common)
protected verifyWebhookSignature(
  rawBody: string,    // Important: raw request body, not parsed JSON
  signature: string,
  secret: string
): boolean {
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');
  
  // Use timing-safe comparison
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

override async handleWebhook(payload: any): Promise<StatusUpdate> {
  // Extract signature from request header
  const signature = payload.__signature;
  const secret = this.credentials?.apiSecret || '';

  // Verify signature
  if (!this.verifyWebhookSignature(
    JSON.stringify(payload),
    signature,
    secret
  )) {
    throw new FilingError(
      'WEBHOOK_SIGNATURE_INVALID',
      'Webhook signature verification failed',
      false,
      401
    );
  }

  // Process webhook data
  return {
    filingId: payload.filingId,
    referenceNumber: payload.filingReference,
    previousStatus: payload.previousStatus,
    newStatus: payload.status,
    updatedAt: new Date(payload.timestamp),
    details: payload.details,
  };
}
```

### Webhook Retry & Idempotency

Regulators may send webhooks multiple times. Handle gracefully:

```typescript
// Use idempotency key to prevent duplicate processing
const idempotencyKey = payload.filingId + ':' + payload.timestamp;
const cacheKey = `webhook:${idempotencyKey}`;

// Check if we've already processed this
const cached = await cache.get(cacheKey);
if (cached) {
  this.logInfo('Webhook already processed', { idempotencyKey });
  return cached;  // Return cached result
}

// Process webhook
const statusUpdate = await this.processWebhook(payload);

// Cache result for 24 hours
await cache.set(cacheKey, statusUpdate, { ttl: 86400 });

return statusUpdate;
```

### Registering Webhooks with Regulator

When user configures the filing system, register the webhook:

```typescript
async function registerWebhook(
  adapter: BaseFilingAdapter,
  webhookUrl: string
): Promise<void> {
  // Each regulator has different webhook registration
  // Some need API call, some need manual setup
  
  const config = adapter.getAdapterConfig();
  
  if (config.supportsWebhooks) {
    // Register via API
    await adapter.registerWebhook({
      url: webhookUrl,
      events: ['filing.accepted', 'filing.rejected', 'status.updated'],
      secret: generateSecureSecret(),
    });
    
    this.logInfo('Webhook registered', {
      system: config.name,
      url: webhookUrl,
    });
  } else {
    // Notify user to set up manually
    await sendEmailToUser(`Please configure webhook manually at: ${config.webhookConfigUrl}`);
  }
}
```

---

## Testing Without Real APIs

### Mock Adapter Pattern

```typescript
// Create a mock adapter for testing
class MockTSEAdapter extends TSEAdapter {
  async submitToTSEAPI(
    payload: Record<string, any>
  ): Promise<any> {
    // Return mock response instead of calling real API
    return {
      submissionId: 'mock-' + Date.now(),
      filingReference: 'TSE-MOCK-' + Math.random().toString(36).substr(2, 9),
      prospectusReceiptId: 'receipt-1',
      financialsReceiptId: 'receipt-2',
      auditorReceiptId: 'receipt-3',
      estimatedProcessingMs: 3600000,
      warnings: [],
    };
  }

  async getStatus(filingId: string): Promise<FilingStatus> {
    // Return mock status
    return {
      filingId,
      referenceNumber: 'TSE-MOCK-123',
      status: 'processing',
      phase: 'submission',
      lastUpdatedAt: new Date(),
      nextRequiredAction: 'Waiting for review',
    };
  }
}

// Use in tests
describe('TSEAdapter', () => {
  it('should submit documents', async () => {
    const adapter = new MockTSEAdapter();
    adapter.setCredentials({ method: 'api_key', apiKey: 'mock' });
    
    const result = await adapter.submit(documents, metadata);
    expect(result.success).toBe(true);
    expect(result.referenceNumber).toMatch(/^TSE-MOCK-/);
  });
});
```

### Environment Variables

```bash
# .env.test
TSE_API_ENDPOINT=https://sandbox.tse.co.jp
TSE_API_KEY=test_key_only_for_testing
USE_MOCK_ADAPTERS=true
```

### Snapshot Testing

```typescript
it('should validate documents consistently', async () => {
  const result = await adapter.validate(documents);
  
  // Store expected validation result
  expect(result).toMatchSnapshot();
});
```

### Integration Test Harness

```typescript
// Test against real sandbox API (with proper credentials)
describe('TSEAdapter - Sandbox Integration', () => {
  let adapter: TSEAdapter;

  beforeEach(() => {
    adapter = new TSEAdapter();
    adapter.setCredentials({
      method: 'api_key',
      apiKey: process.env.TSE_SANDBOX_API_KEY!,
    });
  });

  it('should submit to sandbox API', async () => {
    const result = await adapter.submit(documents, metadata);
    expect(result.success).toBe(true);
    
    // Verify we can fetch status back
    const status = await adapter.getStatus(result.filingId);
    expect(status.status).toBeTruthy();
  });
});
```

Run only integration tests:
```bash
npm test -- --testNamePattern="Sandbox Integration"
```

---

## Rate Limiting

### Understanding Rate Limits

Most regulators publish rate limits:

```
SEC EDGAR:
- 10 requests per second per IP
- 100 concurrent submissions

TSE:
- 60 requests per hour
- 5 concurrent submissions

CSA SEDAR+:
- 30 requests per minute
- 10 concurrent submissions
```

### Implementing Rate Limiter

```typescript
class RateLimiter {
  private queue: Array<() => Promise<any>> = [];
  private inProgress = 0;

  constructor(
    private maxConcurrent: number,
    private requestsPerSecond: number
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await operation();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.inProgress--;
          this.processQueue();
        }
      });
      this.processQueue();
    });
  }

  private processQueue(): void {
    while (this.inProgress < this.maxConcurrent && this.queue.length > 0) {
      this.inProgress++;
      const operation = this.queue.shift();
      if (operation) {
        operation();
      }
    }
  }
}

// Use in adapter
private rateLimiter = new RateLimiter(5, 60); // 5 concurrent, 60/sec

private async submitWithRateLimit(
  payload: Record<string, any>
): Promise<SubmissionResult> {
  return this.rateLimiter.execute(
    () => this.submitToTSEAPI(payload)
  );
}
```

### Handling 429 (Too Many Requests)

```typescript
// withRetry already handles 429 with backoff
// Configure for your regulator's rate limits

adapter.setRetryConfig({
  maxRetries: 10,              // More retries for rate limiting
  initialDelayMs: 10000,       // Start with 10 seconds
  maxDelayMs: 600000,          // Cap at 10 minutes
  backoffMultiplier: 1.5,      // Slower backoff
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
});
```

---

## Security Best Practices

### Credential Storage

```typescript
// WRONG: Never hardcode credentials
const apiKey = 'sk-123456789';

// WRONG: Never commit to git
process.env.API_KEY = 'sk-123456789';  // .env file

// RIGHT: Use secure environment variables
const apiKey = process.env.TSE_API_KEY;  // Loaded from secure vault

// RIGHT: Use secrets management
import { SecretsManager } from '@aws-sdk/client-secrets-manager';
const secret = await new SecretsManager().getSecretValue({
  SecretId: 'tse/api-key',
});
```

### HTTPS Only

```typescript
// Validate HTTPS in production
if (process.env.NODE_ENV === 'production') {
  if (!apiEndpoint.startsWith('https://')) {
    throw new Error('API endpoint must use HTTPS');
  }
}

// Verify SSL certificates
const agent = new https.Agent({
  rejectUnauthorized: true,  // Always verify server cert
});

fetch(url, { agent });
```

### Audit Logging

```typescript
// Log all API interactions (but not credentials)
private async submitWithAudit(
  payload: Record<string, any>
): Promise<SubmissionResult> {
  const auditId = generateAuditId();
  
  this.logInfo('API call initiated', {
    auditId,
    method: 'POST',
    endpoint: '/filings/submit',
    documentCount: payload.documents?.length,
  });

  try {
    const result = await this.submitToAPI(payload);
    
    this.logInfo('API call succeeded', {
      auditId,
      filingId: result.submissionId,
      duration: Date.now() - startTime,
    });
    
    return result;
  } catch (error) {
    this.logError('API call failed', {
      auditId,
      error: error instanceof Error ? error.message : 'Unknown',
      statusCode: error instanceof FilingError ? error.statusCode : undefined,
    });
    throw error;
  }
}
```

### Request Signing (if required)

```typescript
// Some regulators require request signatures
private buildSignedRequest(
  method: string,
  path: string,
  body: string
): { headers: Record<string, string> } {
  const timestamp = Date.now().toString();
  const nonce = generateNonce();
  
  const canonicalRequest = `${method}\n${path}\n${timestamp}\n${nonce}\n${body}`;
  const signature = crypto
    .createHmac('sha256', this.credentials!.apiSecret!)
    .update(canonicalRequest)
    .digest('hex');

  return {
    headers: {
      'X-Signature': signature,
      'X-Timestamp': timestamp,
      'X-Nonce': nonce,
    },
  };
}
```

### Data Minimization

```typescript
// Only send required fields to regulator
private stripSensitiveData(
  payload: Record<string, any>
): Record<string, any> {
  const { 
    companyId,      // Don't send internal ID
    internalNotes,  // Don't send internal notes
    ...clean 
  } = payload;
  
  return clean;
}
```

### PII Handling

```typescript
// Be careful with personally identifiable information
// Log only hashes, not full names/emails
private hashPII(value: string): string {
  return crypto
    .createHash('sha256')
    .update(value)
    .digest('hex')
    .slice(0, 8);
}

this.logInfo('Document from', {
  submittedBy: this.hashPII(metadata.submittedBy),
});
```

---

## Summary

Implementing filing API integration correctly is critical. Key points:

1. **Use withRetry wrapper** - Never make naked API calls
2. **Validate credentials first** - Always call `validateCredentials()`
3. **Handle all error codes** - Map to `FilingError` with retryable flag
4. **Implement webhooks** - Better UX than polling
5. **Sign requests correctly** - Follow regulator's exact specifications
6. **Test thoroughly** - Use mocks, then sandbox, then production
7. **Secure credentials** - Never hardcode, use secure storage
8. **Log thoughtfully** - Helpful for debugging, protective for security

With these patterns, you'll have robust, production-ready filing integrations.
