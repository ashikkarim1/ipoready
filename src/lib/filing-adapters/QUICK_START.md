# Quick Start: Building a Filing Adapter

## 5-Minute Overview

The `BaseFilingAdapter` is an abstract class that ALL filing adapters must extend. It handles:
- **Authentication** (API key, OAuth2, basic auth, certificates)
- **Error handling** (with retryable errors and exponential backoff)
- **Document management** (versioning, checksums, format validation)
- **Logging** (structured with context)
- **Retry logic** (automatic with jitter)

## Creating a New Adapter

### Step 1: Create Your Adapter Class

```typescript
// src/lib/filing-adapters/my-country/MyCountryAdapter.ts

import {
  BaseFilingAdapter,
  DocumentType,
  type DocumentMetadata,
  type FilingMetadata,
  type ValidationResult,
  type FilingStatus,
  type SubmissionResult,
  type StatusUpdate,
  FilingError,
} from '../BaseFilingAdapter';

export class MyCountryAdapter extends BaseFilingAdapter {
  protected adapterName = 'MyCountryAdapter';
  private apiBaseUrl = 'https://api.regulator.country';

  // Required: List mandatory documents
  getRequiredDocuments(): DocumentType[] {
    return [
      DocumentType.PROSPECTUS,
      DocumentType.FINANCIAL_STATEMENTS,
      DocumentType.AUDITOR_REPORT,
      DocumentType.LEGAL_OPINION,
    ];
  }

  // Required: Return adapter configuration
  getAdapterConfig(): Record<string, any> {
    return {
      apiBaseUrl: this.apiBaseUrl,
      supportedFormTypes: ['FORM-A', 'FORM-B'],
      maxDocumentSize: 100 * 1024 * 1024, // 100MB
      submissionTimeout: 30000,
    };
  }

  // Required: Validate documents
  async validate(
    documents: DocumentMetadata[],
  ): Promise<ValidationResult> {
    const startTime = Date.now();
    const errors = [];
    const warnings = [];
    const documentStatuses = new Map();

    try {
      // Validate all required documents present
      this.validateDocumentsPresent(documents);

      // Validate each document
      for (const doc of documents) {
        // Your validation logic here
        this.validateDocumentFormat(doc);
        const checksumValid = await this.validateDocumentChecksum(doc);
        
        documentStatuses.set(doc.id, {
          documentId: doc.id,
          documentType: doc.type,
          isValid: checksumValid,
          errors: [],
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
      this.logError('Validation failed', { error });
      throw error;
    }
  }

  // Required: Submit documents
  async submit(
    documents: DocumentMetadata[],
    metadata: FilingMetadata,
  ): Promise<SubmissionResult> {
    return this.withRetry(async () => {
      // Validate credentials are set
      this.validateCredentials();

      // Build auth headers automatically
      const headers = this.buildAuthHeaders();

      // Prepare documents for API
      const payload = documents.map((doc) => ({
        filename: doc.fileName,
        content: this.prepareDocumentForTransmission(doc),
        checksum: doc.checksum,
      }));

      // Make API call
      const response = await fetch(`${this.apiBaseUrl}/filings`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          company: metadata.companyName,
          country: metadata.country,
          documents: payload,
        }),
      });

      if (!response.ok) {
        throw new FilingError(
          'SUBMISSION_FAILED',
          `API returned ${response.status}: ${response.statusText}`,
          this.isRetryableStatusCode(response.status),
          response.status,
        );
      }

      const data = await response.json();
      return {
        success: true,
        filingId: data.filingId,
        referenceNumber: data.referenceNumber,
        status: 'submitted',
        submittedAt: new Date(),
        documentReceiptIds: new Map(
          Object.entries(data.receiptIds) as [string, string][],
        ),
        warnings: data.warnings || [],
      };
    }, 'submit_filing');
  }

  // Required: Get filing status
  async getStatus(filingId: string): Promise<FilingStatus> {
    return this.withRetry(async () => {
      const headers = this.buildAuthHeaders();
      const response = await fetch(`${this.apiBaseUrl}/filings/${filingId}`, {
        headers,
      });

      if (!response.ok) {
        throw new FilingError(
          'STATUS_CHECK_FAILED',
          `Failed to get status: ${response.statusText}`,
          this.isRetryableStatusCode(response.status),
          response.status,
        );
      }

      const data = await response.json();
      return {
        filingId,
        referenceNumber: data.referenceNumber,
        status: data.status as any,
        phase: data.phase as any,
        lastUpdatedAt: new Date(data.lastUpdated),
        estimatedCompletionDate: data.estimatedCompletion
          ? new Date(data.estimatedCompletion)
          : undefined,
      };
    }, 'get_filing_status');
  }

  // Required: Handle webhooks
  async handleWebhook(payload: any): Promise<StatusUpdate> {
    try {
      // Verify signature for security
      const signature = payload.signature;
      const secret = this.credentials?.apiSecret || '';
      
      if (!this.verifyWebhookSignature(payload, signature, secret)) {
        throw new FilingError(
          'INVALID_WEBHOOK_SIGNATURE',
          'Webhook signature verification failed',
          false,
        );
      }

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
}
```

### Step 2: Configure and Use

```typescript
import { MyCountryAdapter } from './my-country/MyCountryAdapter';
import winston from 'winston';

// Create adapter instance
const adapter = new MyCountryAdapter();

// Set credentials (choose one auth method)
adapter.setCredentials({
  method: 'api_key',
  apiKey: process.env.REGULATOR_API_KEY,
  apiSecret: process.env.REGULATOR_API_SECRET, // for webhooks
});

// Optional: Set logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'filing.log' }),
  ],
});
adapter.setLogger(logger);

// Optional: Configure retries
adapter.setRetryConfig({
  maxRetries: 5,
  initialDelayMs: 500,
  maxDelayMs: 60000,
});

// Use the adapter
const documents: DocumentMetadata[] = [
  {
    id: 'doc-1',
    type: DocumentType.PROSPECTUS,
    format: 'pdf',
    fileName: 'prospectus.pdf',
    mimeType: 'application/pdf',
    size: 1024000,
    checksum: 'abc123...',
    version: '1.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    content: Buffer.from(...),
  },
  // ... more documents
];

const metadata: FilingMetadata = {
  companyId: 'comp-123',
  companyName: 'ACME Corp',
  filingType: 'FORM-A',
  currencyCode: 'USD',
  country: 'XX',
  submittedBy: 'user@company.com',
};

// Validate
const validation = await adapter.validate(documents);
console.log(validation.isValid ? 'Valid!' : 'Invalid!');

// Submit
if (validation.isValid) {
  const submission = await adapter.submit(documents, metadata);
  console.log(`Filing ID: ${submission.filingId}`);

  // Track status
  const status = await adapter.getStatus(submission.filingId);
  console.log(`Status: ${status.status}`);
}
```

### Step 3: Handle Webhooks

```typescript
// In your webhook endpoint
app.post('/webhooks/filings', async (req, res) => {
  try {
    const update = await adapter.handleWebhook(req.body);
    console.log(`Filing ${update.filingId} is now ${update.newStatus}`);
    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});
```

## Available Helper Methods

### Authentication
- `setCredentials(AuthCredentials)` - Configure auth
- `buildAuthHeaders()` - Get auth headers

### Documents
- `validateDocumentFormat(doc)` - Check format
- `validateDocumentChecksum(doc)` - Verify integrity
- `generateChecksum(content)` - Create SHA-256
- `parseDocument(content, format)` - Parse JSON/XML
- `prepareDocumentForTransmission(doc)` - Format for API

### Operations
- `withRetry(fn, name)` - Retry with backoff
- `isRetryableStatusCode(code)` - Check if retryable
- `sleep(ms)` - Async delay

### Logging
- `logDebug(msg, context)` - Debug level
- `logInfo(msg, context)` - Info level
- `logWarn(msg, context)` - Warn level
- `logError(msg, context)` - Error level

### Configuration
- `setLogger(winston.Logger)` - Set logger
- `setRetryConfig(config)` - Configure retries
- `getAdapterVersion()` - Get version
- `healthCheck()` - Test connectivity

## Error Handling

Always throw `FilingError`:

```typescript
throw new FilingError(
  'ERROR_CODE',           // Unique code
  'User-friendly message',
  true,                   // Retryable (optional, default: false)
  400,                    // HTTP status (optional)
  { details: 'here' },    // Context (optional)
);
```

## Tips

1. **Use `withRetry()`** for all API calls - handles retries automatically
2. **Call `validateCredentials()`** before API calls
3. **Use `buildAuthHeaders()`** - handles all auth methods
4. **Log with context** - helps with debugging
5. **Check `isRetryableStatusCode()`** when throwing errors
6. **Verify webhook signatures** - security critical
7. **Generate checksums** - integrity verification
8. **Keep it under 500 lines** - focus on jurisdiction-specific logic

## Testing

```bash
npm test -- MyCountryAdapter.test.ts
```

## File Size Target

- Total adapter code: **< 500 lines**
- Tests: **< 400 lines**
- Configuration: **< 100 lines**

## Documentation Files

- **ADAPTER_IMPLEMENTATION_GUIDE.md** - Detailed guide (13KB)
- **IMPLEMENTATION_SUMMARY.md** - Architecture overview (11KB)
- **This file** - Quick start guide (this page)
- **BaseFilingAdapter.test.ts** - Example usage (14KB)

## Common Error Codes

| Code | Meaning | Retryable |
|------|---------|-----------|
| `AUTH_MISSING` | No credentials | No |
| `AUTH_INVALID` | Bad credentials | No |
| `DOCUMENTS_EMPTY` | No docs provided | No |
| `DOCUMENT_MISSING` | Required doc missing | No |
| `INVALID_FORMAT` | Bad file format | No |
| `CHECKSUM_MISMATCH` | Document integrity failed | No |
| `SUBMISSION_FAILED` | API call failed | Yes (on 5xx) |
| `STATUS_CHECK_FAILED` | Can't get status | Yes (on 5xx) |
| `INVALID_WEBHOOK_SIGNATURE` | Webhook tampered | No |

## Next Steps

1. Create your adapter following the template above
2. Implement the 6 required abstract methods
3. Add jurisdiction-specific validation
4. Write tests (baseclass provides test utilities)
5. Test with sandbox environment
6. Deploy to production

---

**Need help?** See ADAPTER_IMPLEMENTATION_GUIDE.md for detailed documentation.
