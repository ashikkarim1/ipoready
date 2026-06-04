# Filing Adapter Implementation Guide

This guide explains how to build country-specific filing adapters that extend the `BaseFilingAdapter` abstract class.

## Overview

The `BaseFilingAdapter` provides:
- **Authentication abstraction** (API key, OAuth2, certificate, basic auth)
- **Error handling** with retryable errors and exponential backoff
- **Document management** with versioning and checksum validation
- **Logging infrastructure** for debugging and monitoring
- **Retry logic** with configurable backoff strategies

Each adapter should be < 500 lines and focused on a single regulatory system (SEC, CSA, FCA, etc.).

## Required Methods to Implement

### 1. `validate(documents: DocumentMetadata[]): Promise<ValidationResult>`

Validates documents against regulatory requirements.

```typescript
async validate(documents: DocumentMetadata[]): Promise<ValidationResult> {
  const startTime = Date.now();
  const errors: ValidationError[] = [];
  const warnings: string[] = [];
  const documentStatuses = new Map<string, DocumentValidationStatus>();

  try {
    // Validate all documents are present
    this.validateDocumentsPresent(documents);

    // Validate each document
    for (const doc of documents) {
      const docErrors = await this.validateDocument(doc);
      if (docErrors.length > 0) {
        errors.push(...docErrors);
      }
      documentStatuses.set(doc.id, {
        documentId: doc.id,
        documentType: doc.type,
        isValid: docErrors.length === 0,
        errors: docErrors,
        checksum: doc.checksum,
      });
    }

    return {
      isValid: errors.length === 0,
      phase: 'validation',
      errors,
      warnings,
      documentStatuses,
      completedAt: new Date(),
      processingTimeMs: Date.now() - startTime,
    };
  } catch (error) {
    throw this.handleError(error);
  }
}
```

### 2. `submit(documents: DocumentMetadata[], metadata: FilingMetadata): Promise<SubmissionResult>`

Submits documents to the regulatory authority.

```typescript
async submit(
  documents: DocumentMetadata[],
  metadata: FilingMetadata,
): Promise<SubmissionResult> {
  return this.withRetry(async () => {
    this.validateCredentials();
    
    // Prepare documents for transmission
    const preparedDocs = documents.map((doc) =>
      this.prepareDocumentForTransmission(doc),
    );

    // Build request payload
    const payload = this.buildSubmissionPayload(preparedDocs, metadata);

    // Make API call with auth headers
    const headers = this.buildAuthHeaders();
    const response = await this.submitToRegulator(payload, headers);

    // Parse response
    return {
      success: true,
      filingId: response.filingId,
      referenceNumber: response.referenceNumber,
      status: 'submitted',
      submittedAt: new Date(),
      documentReceiptIds: new Map(response.documentReceipts),
      warnings: response.warnings || [],
    };
  }, 'submit_filing');
}
```

### 3. `getStatus(filingId: string): Promise<FilingStatus>`

Retrieves current filing status from the regulatory system.

```typescript
async getStatus(filingId: string): Promise<FilingStatus> {
  return this.withRetry(async () => {
    this.validateCredentials();

    const headers = this.buildAuthHeaders();
    const response = await fetch(`${this.apiBaseUrl}/filings/${filingId}`, {
      headers,
    });

    if (!response.ok) {
      throw new FilingError(
        'STATUS_CHECK_FAILED',
        `Failed to retrieve filing status: ${response.statusText}`,
        this.isRetryableStatusCode(response.status),
        response.status,
      );
    }

    const data = await response.json();
    return this.parseStatusResponse(data);
  }, 'get_filing_status');
}
```

### 4. `handleWebhook(payload: any): Promise<StatusUpdate>`

Processes webhook notifications from the regulatory system.

```typescript
async handleWebhook(payload: any): Promise<StatusUpdate> {
  try {
    // Verify webhook signature for security
    const signature = payload.signature || '';
    if (!this.verifyWebhookSignature(
      payload,
      signature,
      this.credentials?.apiSecret || '',
    )) {
      throw new FilingError(
        'INVALID_WEBHOOK_SIGNATURE',
        'Webhook signature verification failed',
        false,
      );
    }

    // Extract status update
    return {
      filingId: payload.filingId,
      referenceNumber: payload.referenceNumber,
      previousStatus: payload.previousStatus,
      newStatus: payload.newStatus,
      updatedAt: new Date(payload.timestamp),
      details: payload.details,
    };
  } catch (error) {
    this.logError('Webhook processing failed', { error });
    throw error;
  }
}
```

### 5. `getRequiredDocuments(): DocumentType[]`

Specifies which documents are mandatory for this jurisdiction.

```typescript
getRequiredDocuments(): DocumentType[] {
  return [
    DocumentType.PROSPECTUS,
    DocumentType.FINANCIAL_STATEMENTS,
    DocumentType.AUDITOR_REPORT,
    DocumentType.LEGAL_OPINION,
  ];
}
```

### 6. `getAdapterConfig(): Record<string, any>`

Returns adapter configuration (API endpoints, timeouts, etc.).

```typescript
getAdapterConfig(): Record<string, any> {
  return {
    apiBaseUrl: 'https://www.sec.gov/cgi-bin/browse-edgar',
    apiVersion: 'v1',
    supportedFormTypes: ['S-1', 'S-3', 'S-4'],
    maxDocumentSize: 100 * 1024 * 1024, // 100MB
    submissionTimeout: 30000, // 30 seconds
    requiredDocuments: this.getRequiredDocuments(),
  };
}
```

## Helper Methods Available

All adapters inherit these protected methods from `BaseFilingAdapter`:

- **`withRetry<T>(operation, name)`** - Wrap operations with exponential backoff
- **`buildAuthHeaders()`** - Get auth headers for the configured credentials
- **`generateChecksum(content)`** - Generate SHA-256 hash of document
- **`validateDocumentFormat(doc)`** - Validate document format is supported
- **`validateDocumentChecksum(doc)`** - Verify document integrity
- **`parseDocument(content, format)`** - Parse JSON/XML/text documents
- **`prepareDocumentForTransmission(doc)`** - Format document for API submission
- **`logDebug/Info/Warn/Error(message, context)`** - Structured logging

## Authentication Setup

```typescript
// In your adapter initialization
const adapter = new MyCountryAdapter();

// Configure API key auth
adapter.setCredentials({
  method: 'api_key',
  apiKey: process.env.REGULATOR_API_KEY,
});

// Or OAuth2
adapter.setCredentials({
  method: 'oauth2',
  accessToken: token,
  refreshToken: refreshToken,
  expiresAt: new Date(Date.now() + 3600000),
});

// Or basic auth
adapter.setCredentials({
  method: 'basic_auth',
  username: 'user',
  password: 'pass',
});

// Or client certificate
adapter.setCredentials({
  method: 'certificate',
  certificatePath: '/path/to/cert.pem',
  certificatePassword: 'password',
});
```

## Error Handling

All errors should be thrown as `FilingError` with appropriate metadata:

```typescript
throw new FilingError(
  'VALIDATION_FAILED',          // Error code (unique per adapter)
  'Document missing required field',  // User-friendly message
  true,                          // Retryable flag
  400,                          // HTTP status code
  {                             // Additional context
    documentId: doc.id,
    missingField: 'prospectusTitle',
  },
);
```

### Retryable Errors

The framework automatically retries with exponential backoff:
- Network timeouts (408)
- Rate limits (429)
- Server errors (500, 502, 503, 504)

Configure retry behavior:

```typescript
adapter.setRetryConfig({
  maxRetries: 5,
  initialDelayMs: 1000,
  maxDelayMs: 60000,
  backoffMultiplier: 2,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
});
```

## Logging

Use the inherited logging methods:

```typescript
// In your adapter methods
this.logDebug('Processing document', { documentId: doc.id });
this.logInfo('Filing submitted successfully', { filingId });
this.logWarn('Missing optional field', { field: 'companyWebsite' });
this.logError('API request failed', { statusCode: 500, endpoint });
```

Set up a Winston logger instance:

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'filing-adapter.log' }),
  ],
});

adapter.setLogger(logger);
```

## Example: SEC EDGAR Adapter (< 500 lines)

```typescript
import {
  BaseFilingAdapter,
  DocumentType,
  DocumentMetadata,
  FilingMetadata,
  ValidationResult,
  ValidationError,
  FilingStatus,
  StatusUpdate,
  FilingError,
} from './BaseFilingAdapter';

export class SECEdgarAdapter extends BaseFilingAdapter {
  protected adapterName = 'SECEdgarAdapter';
  private apiBaseUrl = 'https://www.sec.gov/cgi-bin/browse-edgar';

  getRequiredDocuments(): DocumentType[] {
    return [
      DocumentType.PROSPECTUS,
      DocumentType.FINANCIAL_STATEMENTS,
      DocumentType.AUDITOR_REPORT,
    ];
  }

  async validate(documents: DocumentMetadata[]): Promise<ValidationResult> {
    // SEC-specific validation logic
    // Check for XBRL compliance, financial statement format, etc.
  }

  async submit(
    documents: DocumentMetadata[],
    metadata: FilingMetadata,
  ): Promise<SubmissionResult> {
    // EDGAR submission logic
    // Handle EDGAR's specific file format requirements
  }

  async getStatus(filingId: string): Promise<FilingStatus> {
    // Query EDGAR filing status API
  }

  async handleWebhook(payload: any): Promise<StatusUpdate> {
    // Process SEC webhook notifications
  }

  getAdapterConfig(): Record<string, any> {
    return {
      apiBaseUrl: this.apiBaseUrl,
      supportedFormTypes: ['S-1', 'S-3', 'S-4', 'F-1', 'F-3'],
      maxDocumentSize: 100 * 1024 * 1024,
    };
  }
}
```

## Testing Your Adapter

```typescript
import { SECEdgarAdapter } from './SECEdgarAdapter';

describe('SECEdgarAdapter', () => {
  let adapter: SECEdgarAdapter;

  beforeEach(() => {
    adapter = new SECEdgarAdapter();
    adapter.setCredentials({
      method: 'api_key',
      apiKey: 'test-key',
    });
  });

  it('should validate required documents', async () => {
    const result = await adapter.validate(testDocuments);
    expect(result.isValid).toBe(true);
  });

  it('should submit filing successfully', async () => {
    const result = await adapter.submit(testDocuments, testMetadata);
    expect(result.success).toBe(true);
    expect(result.filingId).toBeDefined();
  });

  it('should handle retryable errors', async () => {
    // Mock API to return 503 (Service Unavailable)
    // Verify adapter retries with backoff
  });
});
```

## Deployment Checklist

- [ ] All abstract methods implemented
- [ ] Error handling with appropriate error codes
- [ ] Logging integrated with Winston/Pino
- [ ] Credential validation before API calls
- [ ] Webhook signature verification
- [ ] Unit tests with 80%+ coverage
- [ ] Integration tests with sandbox environment
- [ ] Retry logic tested for network failures
- [ ] Document checksums validated
- [ ] TypeScript compilation passes
- [ ] No console.log() statements (use logger)
- [ ] Environment variables for secrets
- [ ] API endpoints configurable

## File Structure

```
src/lib/filing-adapters/
├── BaseFilingAdapter.ts           # Abstract base class
├── index.ts                       # Exports
├── ADAPTER_IMPLEMENTATION_GUIDE.md # This file
├── sec-edgar/
│   ├── SECEdgarAdapter.ts
│   ├── xbrl-parser.ts
│   └── sec-forms.ts
├── csa-sedar/
│   ├── CSASedarAdapter.ts
│   └── sedar-parser.ts
└── fca-london/
    └── FCAAdapter.ts
```

## Support & Resources

- Winston Logger: https://github.com/winstonjs/winston
- Document Validation: https://github.com/ajv-validator/ajv
- XML Parsing: https://github.com/Leonidas-from-XIV/node-xml2js
- TypeScript Docs: https://www.typescriptlang.org
