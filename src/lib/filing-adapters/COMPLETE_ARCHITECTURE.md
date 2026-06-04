# Filing Adapters: Complete Architecture

Comprehensive technical guide to the filing adapters system, data flows, and extensibility patterns.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Data Flow Diagrams](#data-flow-diagrams)
4. [Component Details](#component-details)
5. [Class Hierarchy](#class-hierarchy)
6. [Extensibility Points](#extensibility-points)
7. [Module Organization](#module-organization)
8. [Type System](#type-system)
9. [Error Handling Architecture](#error-handling-architecture)
10. [Webhook Integration Flow](#webhook-integration-flow)

---

## System Overview

The Filing Adapters System provides a unified interface for interacting with regulatory filing systems across different jurisdictions. The system is built on the **Adapter Pattern** combined with **Template Method Pattern** for extensibility.

### Key Principles

1. **Single Responsibility**: Each adapter handles one regulatory system
2. **Open/Closed Principle**: Open for extension (new adapters), closed for modification (base class stable)
3. **Liskov Substitution**: Any adapter can be used wherever BaseFilingAdapter is expected
4. **Dependency Inversion**: Depend on abstract BaseFilingAdapter, not concrete implementations
5. **Plugin Architecture**: New adapters can be added without modifying existing code

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        IPOReady Application                             │
│  (Dashboard, API Routes, Services, Database)                           │
└────────────────────┬────────────────────────────────────────────────────┘
                     │
                     │ Uses
                     ▼
        ┌────────────────────────────┐
        │   FilingAdapter Factory    │
        │   (getAdapter(system))     │
        └────────┬───────────────────┘
                 │
     ┌───────────┴───────────┬────────────────┬─────────────┐
     │                       │                │             │
     ▼                       ▼                ▼             ▼
┌────────────┐  ┌─────────────────┐  ┌──────────────┐  ┌─────────┐
│SECEdgarAd. │  │SEDARAdapter     │  │TSEAdapter    │  │ ...More │
│(US)        │  │(Canada)         │  │(Japan)       │  │         │
└──────┬─────┘  └────────┬────────┘  └──────┬───────┘  └─────────┘
       │                 │                   │
       └─────────────────┼───────────────────┘
                         │
                         │ All extend
                         ▼
          ┌──────────────────────────────┐
          │   BaseFilingAdapter          │
          │  (Abstract Base Class)       │
          │                              │
          │  - Authentication            │
          │  - Retry Logic               │
          │  - Document Management       │
          │  - Error Handling            │
          │  - Logging                   │
          │  - Credential Management     │
          │  - Utility Methods           │
          └──────────────────────────────┘
                         │
                         │ Provides
                         ▼
         ┌───────────────────────────────┐
         │   Regulator APIs              │
         │  (SEC, SEDAR, TSE, etc.)     │
         └───────────────────────────────┘
```

### Adapter Lifecycle

```
┌─────────────────┐
│  Create Adapter │ new TSEAdapter()
└────────┬────────┘
         │
         ▼
┌──────────────────────┐
│ Set Credentials      │ setCredentials(apiKey, secret)
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ Set Config           │ setTSEConfig({companyCode, ...})
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ Validate Documents   │ validate(documents)
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ Submit Filing        │ submit(documents, metadata)
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ Track Status         │ getStatus(filingId)
└────────┬─────────────┘
         │
         ▼ or listen for
┌──────────────────────┐
│ Webhook Updates      │ handleWebhook(payload)
└──────────────────────┘
```

---

## Data Flow Diagrams

### Complete Filing Submission Flow

```
User uploads documents
        │
        ▼
┌─────────────────┐
│ Parse Document  │  Extract: type, format, size, content
│ Metadata        │  Generate: checksum, version
└────────┬────────┘
         │
         ▼
┌──────────────────┐
│ Create Adapter   │  new TSEAdapter()
│ & Set Config     │  setCredentials() + setTSEConfig()
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ VALIDATE PHASE   │
│ (Synchronous)    │
└────────┬─────────┘
         │
         ├─► Check credentials present
         │
         ├─► Verify all required documents present
         │
         ├─► For each document:
         │   ├─► Validate format (pdf, json, etc.)
         │   ├─► Check file size
         │   ├─► Parse content
         │   ├─► Check encoding
         │   └─► Run document-specific validation
         │
         ├─► Run cross-document validation
         │   ├─► Dates align across docs
         │   └─► Financial amounts consistent
         │
         ▼
┌──────────────────┐
│ Return Validation│ {isValid, errors, warnings, phase}
│ Result           │ phase = 'validation'
└────────┬─────────┘
         │
         ├──► If isValid = false
         │    ├─► Log validation errors
         │    ├─► Return errors to user
         │    └─► User must fix and retry
         │
         └──► If isValid = true
              │
              ▼
         ┌──────────────────┐
         │ SUBMISSION PHASE │
         │ (Async)          │
         └────────┬─────────┘
                  │
                  ├─► Build submission payload
                  │   ├─► Add document content (base64 if binary)
                  │   ├─► Add metadata
                  │   └─► Add regulatory config
                  │
                  ├─► Call Regulator API (with retry)
                  │   ├─► Build auth headers
                  │   ├─► POST to /filings/submit
                  │   ├─► Handle errors with backoff
                  │   └─► Return submission ID & reference
                  │
                  ▼
         ┌──────────────────┐
         │ Submission       │ {success, filingId, refNo,
         │ Result           │  submittedAt, documentReceipts}
         └────────┬─────────┘
                  │
                  ├─► Save filing to database
                  ├─► Create audit log entry
                  ├─► Notify user via email/dashboard
                  └─► Set up status polling/webhook listener
```

### Status Tracking Flow

```
                    Polling Option          Webhook Option
                         │                        │
                         ▼                        ▼
                  ┌──────────────┐        ┌──────────────┐
                  │ Poll API     │        │ Receive      │
                  │ every N min  │        │ webhook POST │
                  └──────┬───────┘        └──────┬───────┘
                         │                       │
                         │                       ├─► Verify signature
                         │                       │
                         │                       ▼
                         │                ┌──────────────┐
                         │                │ Parse status │
                         │                │ from payload │
                         │                └──────┬───────┘
                         │                       │
                         ▼                       ▼
                  ┌──────────────┐        ┌──────────────┐
                  │ Fetch        │        │ Extract:     │
                  │ GET /filing/ │        │ - refNo      │
                  │ {id}/status  │        │ - newStatus  │
                  └──────┬───────┘        │ - updatedAt  │
                         │                └──────┬───────┘
                         ▼                       │
                  ┌──────────────┐               │
                  │ Parse        │               │
                  │ response     │               │
                  └──────┬───────┘               │
                         │                       │
                         └───────────┬───────────┘
                                     │
                                     ▼
                          ┌──────────────────┐
                          │ Status Update    │
                          │ Event            │
                          │                  │
                          │ {filingId,       │
                          │  refNo,          │
                          │  previousStatus, │
                          │  newStatus,      │
                          │  updatedAt}      │
                          └────────┬─────────┘
                                   │
                        ┌──────────┴──────────┐
                        │                     │
                        ▼                     ▼
                  ┌──────────┐          ┌──────────┐
                  │ Update   │          │ Send     │
                  │ Database │          │ Notifi.  │
                  └──────┬───┘          │ to User  │
                         │             └──────┬───┘
                         │                    │
                         └────────┬───────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │ Dashboard        │
                         │ reflects new     │
                         │ status           │
                         └──────────────────┘
```

---

## Component Details

### 1. BaseFilingAdapter (Abstract)

**Location**: `/src/lib/filing-adapters/BaseFilingAdapter.ts`

**Responsibilities**:
- Define the contract (interface) that all adapters must implement
- Provide common utilities (logging, retry, auth, document handling)
- Manage credentials lifecycle
- Handle error standardization

**Key Methods**:

```typescript
// Abstract methods (must implement in subclass)
abstract validate(documents: DocumentMetadata[]): Promise<ValidationResult>
abstract submit(documents: DocumentMetadata[], metadata: FilingMetadata): Promise<SubmissionResult>
abstract getStatus(filingId: string): Promise<FilingStatus>
abstract handleWebhook(payload: any): Promise<StatusUpdate>
abstract getRequiredDocuments(): DocumentType[]
abstract getAdapterConfig(): Record<string, any>

// Provided utilities
protected withRetry<T>(operation: () => Promise<T>, name: string): Promise<T>
protected buildAuthHeaders(): Record<string, string>
protected validateDocumentsPresent(documents: DocumentMetadata[]): void
protected validateDocumentFormat(doc: DocumentMetadata): void
protected parseDocument(content: Buffer | string, format: DocumentFormat): Record<string, any> | null
protected async generateChecksum(content: Buffer | string | Record<string, any>): Promise<string>
protected isRetryableStatusCode(statusCode: number): boolean
protected logDebug(message: string, context?: Record<string, any>): void
protected logError(message: string, context?: Record<string, any>): void
```

**Retry Implementation**:
```
withRetry(operation, name)
  │
  ├─► Attempt 0
  │   ├─► Success? Return result
  │   └─► Retryable error? Continue
  │
  ├─► Wait: calculateBackoffDelay(0)
  │
  ├─► Attempt 1
  │   ├─► Success? Return result
  │   └─► Retryable error? Continue
  │
  ├─► Wait: calculateBackoffDelay(1)
  │
  └─► ...Repeat until maxRetries or success
```

**Backoff Calculation**:
```typescript
delay = min(
  initialDelayMs * (backoffMultiplier ^ attempt),
  maxDelayMs
) + jitter
```

Default config:
- Initial: 1000ms
- Max: 30000ms (30 sec)
- Multiplier: 2
- Jitter: ±10% of delay

### 2. Adapter Implementations (e.g., TSEAdapter)

**Location**: `/src/lib/filing-adapters/{System}Adapter.ts`

**Responsibilities**:
- Implement the 4 abstract methods
- Define system-specific config interface
- Handle system-specific validation rules
- Build correct API payloads for the regulator

**Structure**:

```typescript
export class TSEAdapter extends BaseFilingAdapter {
  // 1. System-specific config
  private config?: TSEFilingConfig;

  setTSEConfig(config: TSEFilingConfig): void { /* ... */ }

  // 2. Implement abstract methods
  override getRequiredDocuments(): DocumentType[] { /* ... */ }
  override getAdapterConfig(): Record<string, any> { /* ... */ }
  
  override async validate(documents: DocumentMetadata[]): Promise<ValidationResult> {
    // System-specific validation logic
  }
  
  override async submit(
    documents: DocumentMetadata[],
    metadata: FilingMetadata
  ): Promise<SubmissionResult> {
    // Submission workflow
  }
  
  override async getStatus(filingId: string): Promise<FilingStatus> {
    // Status lookup
  }
  
  override async handleWebhook(payload: any): Promise<StatusUpdate> {
    // Webhook handling
  }

  // 3. Helper methods (private)
  private async validateProspectus(doc: DocumentMetadata, errors: ValidationError[]): Promise<void> { /* ... */ }
  private buildSubmissionPayload(docs, meta, config): Record<string, any> { /* ... */ }
  private async submitToTSEAPI(payload): Promise<{...}> { /* ... */ }
  private mapTSEStatusToInternal(status: string): string { /* ... */ }
}
```

### 3. Document Validators

**Location**: `/src/lib/filing-adapters/utils/`

**Files**:
- `document-validator.ts` - Generic document format validation
- `sedar-validator.ts` - SEDAR-specific rules
- `error-handler.ts` - Error standardization

**Example**:
```typescript
// document-validator.ts
export function validateDocumentFormat(doc: DocumentMetadata): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check format
  if (!['pdf', 'json', 'xlsx'].includes(doc.format)) {
    errors.push({
      documentId: doc.id,
      documentType: doc.type,
      code: 'INVALID_FORMAT',
      message: `Format not supported: ${doc.format}`,
      severity: 'error',
    });
  }

  // Check size
  if (doc.size > 100 * 1024 * 1024) {
    errors.push({
      documentId: doc.id,
      documentType: doc.type,
      code: 'FILE_TOO_LARGE',
      message: 'File exceeds 100 MB limit',
      severity: 'error',
    });
  }

  return errors;
}
```

### 4. Type Definitions

**Location**: `/src/types/filing.ts`

**Key types**:

```typescript
// Filing System Registration
interface FilingSystem {
  id: string
  name: string
  country: string
  exchange: string
  adapterClass: string
  apiEndpoint?: string
  authMethod: FilingAuthMethod
  config: FilingSystemConfig
  status: FilingSystemStatus
}

// Document metadata
interface DocumentMetadata {
  id: string
  type: DocumentType
  format: DocumentFormat
  fileName: string
  mimeType: string
  size: number
  checksum: string
  version: string
  createdAt: Date
  updatedAt: Date
  content?: Buffer | string | Record<string, any>
}

// Filing submission result
interface SubmissionResult {
  success: boolean
  filingId: string
  referenceNumber: string
  status: string
  submittedAt: Date
  documentReceiptIds: Map<DocumentType, string>
}

// Filing status
interface FilingStatus {
  filingId: string
  referenceNumber: string
  status: 'submitted' | 'processing' | 'accepted' | 'rejected' | 'withdrawn'
  lastUpdatedAt: Date
  reviewComments?: string[]
  rejectionReasons?: string[]
}
```

---

## Class Hierarchy

```
                    ┌────────────────────┐
                    │   Object           │
                    │ (JS Built-in)      │
                    └────────────┬───────┘
                                 │
                                 │
                    ┌────────────┴────────────┐
                    │                        │
                    ▼                        ▼
          ┌────────────────┐      ┌──────────────────┐
          │ FilingError    │      │ BaseFilingAdapter│
          │                │      │ (abstract)       │
          │ - code         │      │                  │
          │ - message      │      │ - credentials    │
          │ - retryable    │      │ - logger         │
          │ - statusCode   │      │ - retryConfig    │
          │ - details      │      │                  │
          └────────────────┘      └────────┬─────────┘
                                           │
                        ┌──────────────────┼──────────────────┐
                        │                  │                  │
                        ▼                  ▼                  ▼
                ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
                │SECEdgarAdapter│  │SEDARAdapter  │  │TSEAdapter    │
                │              │  │              │  │              │
                │+ config:     │  │+ config:     │  │+ config:     │
                │  SECConfig   │  │  SEDARConfig │  │  TSEConfig   │
                │              │  │              │  │              │
                │- validate()  │  │- validate()  │  │- validate()  │
                │- submit()    │  │- submit()    │  │- submit()    │
                │- getStatus()│  │- getStatus()│  │- getStatus()│
                │              │  │              │  │              │
                └──────────────┘  └──────────────┘  └──────────────┘
```

---

## Extensibility Points

### 1. Adding a New Adapter

**Steps**:

```typescript
// 1. Create new file
class MyNewAdapter extends BaseFilingAdapter {
  protected adapterName = 'MyNewAdapter'
  
  // 2. Define config
  private config?: MyNewAdapterConfig
  setMyNewConfig(config: MyNewAdapterConfig): void { this.config = config }

  // 3. Implement abstract methods
  override getRequiredDocuments(): DocumentType[] {
    return [DocumentType.PROSPECTUS, DocumentType.FINANCIAL_STATEMENTS]
  }

  override async validate(documents: DocumentMetadata[]): Promise<ValidationResult> {
    // Implement validation
  }

  override async submit(
    documents: DocumentMetadata[],
    metadata: FilingMetadata
  ): Promise<SubmissionResult> {
    // Implement submission
  }

  override async getStatus(filingId: string): Promise<FilingStatus> {
    // Implement status lookup
  }

  override async handleWebhook(payload: any): Promise<StatusUpdate> {
    // Implement webhook handling
  }

  override getAdapterConfig(): Record<string, any> {
    // Return configuration
  }
}

// 4. Register in database
INSERT INTO filing_systems (...)
  VALUES ('my-adapter', 'MyNewAdapter', ...)
```

### 2. Custom Validation Rules

**Override validation for specific documents**:

```typescript
class MyNewAdapter extends BaseFilingAdapter {
  override async validate(documents: DocumentMetadata[]): Promise<ValidationResult> {
    const errors: ValidationError[] = []
    const documentStatuses = new Map<string, DocumentValidationStatus>()

    // Run base validations first
    this.validateDocumentsPresent(documents)

    // Add custom validation
    for (const doc of documents) {
      if (doc.type === DocumentType.PROSPECTUS) {
        await this.validateProspectus(doc, errors)
      }
    }

    return {
      isValid: errors.length === 0,
      phase: 'validation',
      errors,
      warnings: [],
      documentStatuses,
      completedAt: new Date(),
      processingTimeMs: Date.now() - startTime,
    }
  }

  private async validateProspectus(
    doc: DocumentMetadata,
    errors: ValidationError[]
  ): Promise<void> {
    // Custom prospectus validation
  }
}
```

### 3. Custom API Integration

**Different API patterns**:

```typescript
// Pattern A: REST API
private async submitToAPI(payload: Record<string, any>): Promise<any> {
  const headers = this.buildAuthHeaders()
  const response = await this.withRetry(
    () => fetch('https://api.example.com/submit', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    }),
    'REST API submit'
  )
  return response.json()
}

// Pattern B: SOAP API
private async submitToSoapAPI(payload: Record<string, any>): Promise<any> {
  const soapEnvelope = this.buildSOAPEnvelope(payload)
  const response = await this.withRetry(
    () => fetch('https://api.example.com/soap', {
      method: 'POST',
      headers: this.buildSoapHeaders(),
      body: soapEnvelope,
    }),
    'SOAP API submit'
  )
  return this.parseSOAPResponse(await response.text())
}

// Pattern C: SFTP Upload
private async submitViaSFTP(documents: DocumentMetadata[]): Promise<any> {
  const sftp = new SFTPClient({
    host: process.env.SFTP_HOST,
    username: process.env.SFTP_USER,
    password: process.env.SFTP_PASSWORD,
  })
  
  for (const doc of documents) {
    await sftp.upload(
      doc.content as Buffer,
      `/incoming/${doc.fileName}`
    )
  }
  
  return { success: true }
}
```

### 4. Custom Error Handling

**Map regulator errors to standard format**:

```typescript
private mapRegulatorError(response: Response, errorBody: any): FilingError {
  const code = errorBody?.errorCode || `HTTP_${response.status}`
  const message = errorBody?.errorMessage || response.statusText
  
  // Determine if retryable
  const isRetryable = [408, 429, 500, 502, 503, 504].includes(response.status)
  
  return new FilingError(
    code,
    message,
    isRetryable,
    response.status,
    { original: errorBody }
  )
}
```

---

## Module Organization

```
src/lib/filing-adapters/
├── BaseFilingAdapter.ts          (Abstract base - 700 lines)
├── SECEdgarAdapter.ts            (US SEC implementation)
├── SEDARAdapter.ts               (Canadian implementation)
├── TSEAdapter.ts                 (Japan implementation)
├── index.ts                      (Exports)
│
├── utils/
│   ├── document-validator.ts     (Generic document validation)
│   ├── sedar-validator.ts        (SEDAR-specific rules)
│   ├── sedar-field-mapper.ts     (Field mapping logic)
│   ├── error-handler.ts          (Error utilities)
│   └── retry-logic.ts            (Retry configuration)
│
├── examples/
│   ├── SEDAR_USAGE_EXAMPLE.ts    (Sample code)
│   └── SEC_USAGE_EXAMPLE.ts      (Sample code)
│
├── README.md                      (User guide)
├── QUICK_START.md                (Getting started)
├── IMPLEMENTATION_GUIDE.md        (For developers)
└── COMPLETE_ARCHITECTURE.md      (This file)
```

---

## Type System

### Document Types Enum

```typescript
enum DocumentType {
  PROSPECTUS = 'prospectus',
  FINANCIAL_STATEMENTS = 'financial_statements',
  AUDITOR_REPORT = 'auditor_report',
  LEGAL_OPINION = 'legal_opinion',
  RISK_DISCLOSURE = 'risk_disclosure',
  MANAGEMENT_BIOGRAPHY = 'management_biography',
  CORPORATE_GOVERNANCE = 'corporate_governance',
  EXECUTIVE_COMPENSATION = 'executive_compensation',
  UNDERWRITING_AGREEMENT = 'underwriting_agreement',
  PRICING_MEMO = 'pricing_memo',
}
```

### Format Types

```typescript
type DocumentFormat = 'xml' | 'json' | 'pdf' | 'text' | 'binary';
```

### Authentication Methods

```typescript
type AuthMethod = 'api_key' | 'oauth2' | 'certificate' | 'basic_auth';

interface AuthCredentials {
  method: AuthMethod
  apiKey?: string              // For api_key method
  apiSecret?: string           // For api_key method
  accessToken?: string         // For oauth2
  refreshToken?: string        // For oauth2
  certificatePath?: string     // For certificate
  certificatePassword?: string // For certificate
  username?: string            // For basic_auth
  password?: string            // For basic_auth
  expiresAt?: Date            // For oauth2 expiration
  customHeaders?: Record<string, string>
}
```

---

## Error Handling Architecture

### Error Hierarchy

```
Error (JS Built-in)
  │
  └─► FilingError
      ├─ code: string           (e.g., 'AUTH_MISSING')
      ├─ message: string        (User-friendly message)
      ├─ retryable: boolean     (Should retry?)
      ├─ statusCode?: number    (HTTP status if applicable)
      └─ details?: object       (Additional context)
```

### Common Error Codes

```typescript
// Authentication
'AUTH_MISSING'      // Credentials not set
'AUTH_INVALID'      // Invalid credential values
'AUTH_METHOD_UNSUPPORTED'

// Documents
'DOCUMENTS_EMPTY'   // No documents provided
'DOCUMENT_MISSING'  // Required document missing
'INVALID_FORMAT'    // Document format not supported
'EMPTY_DOCUMENT'    // Document has no content
'DOCUMENT_TOO_LARGE'
'DOCUMENT_TOO_SMALL'

// Validation
'INVALID_ENCODING'
'VALIDATION_FAILED'
'INSUFFICIENT_CONTENT'

// Submission
'SUBMISSION_FAILED'
'HTTP_400'  // Bad request
'HTTP_401'  // Unauthorized
'HTTP_429'  // Rate limited (retryable)
'HTTP_500'  // Server error (retryable)

// Webhooks
'WEBHOOK_SIGNATURE_INVALID'
'WEBHOOKS_NOT_SUPPORTED'

// Timeout
'TIMEOUT'
```

### Error Response from Adapter

```typescript
// When calling an adapter method that fails
try {
  const result = await adapter.submit(documents, metadata)
} catch (error) {
  if (error instanceof FilingError) {
    console.log(error.code)           // 'HTTP_500'
    console.log(error.message)        // 'Server error'
    console.log(error.retryable)      // true
    console.log(error.statusCode)     // 500
    console.log(error.details)        // { error: '...', timestamp: '...' }
  }
}
```

---

## Webhook Integration Flow

### Setup Phase

```
1. User configures filing system
2. System calls: registerWebhook(url)
3. Regulator stores webhook configuration
4. Regulator sends test webhook to verify
5. System acknowledges test
6. Webhook ready for real events
```

### Event Phase

```
Regulator system
  │
  ├─► Filing status changes
  │
  └─► POST /api/webhooks/[system]
      │ Content: {filingId, status, ...}
      │ Header: X-Signature: HMAC-SHA256 hash
      │
      ▼
API Route Handler
  │
  ├─► Extract raw body
  ├─► Extract signature from header
  ├─► Call adapter.handleWebhook(payload)
  │   │
  │   ├─► Verify signature
  │   │   ├─► Compute HMAC-SHA256(body, secret)
  │   │   └─► Compare with provided signature
  │   │
  │   └─► Parse status update
  │       ├─► filingId
  │       ├─► previousStatus
  │       ├─► newStatus
  │       └─► updatedAt
  │
  ├─► Update database
  ├─► Send notification to user
  └─► Return 200 OK
```

### Webhook Signature Verification

```typescript
protected verifyWebhookSignature(
  rawBody: string,      // Important: raw, not parsed
  signature: string,    // From X-Signature header
  secret: string        // Webhook secret from config
): boolean {
  // Step 1: Compute expected signature
  const crypto = require('crypto')
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(rawBody)
  const expected = hmac.digest('hex')
  
  // Step 2: Compare with provided (timing-safe)
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  )
}
```

---

## Deployment Architecture

### Environment Configuration

```bash
# Production environment
NODE_ENV=production

# SEC EDGAR
SEC_API_KEY=sk-...
SEC_SANDBOX=false

# SEDAR+
SEDAR_API_KEY=...
SEDAR_SANDBOX=false

# TSE
TSE_API_KEY=...
TSE_API_SECRET=...
TSE_SANDBOX=false

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/ipoready/filing-adapter.log
```

### Monitoring Points

```
├─► Adapter Health Checks
│   └─► adapter.healthCheck() every 5 minutes
│
├─► Submission Success Rate
│   └─► Track: submissions submitted vs accepted
│
├─► Validation Performance
│   └─► Track: validation time by document type
│
├─► Error Rates
│   └─► Track: error frequency by code
│
├─► Webhook Delivery
│   └─► Track: webhooks received vs processed
│
└─► Rate Limiting
    └─► Monitor: requests/hour vs limit
```

### Scaling Considerations

1. **Stateless adapters** - Each adapter instance is independent
2. **Connection pooling** - Pool HTTP connections to regulators
3. **Rate limiting** - Implement queue for submissions
4. **Retry optimization** - Use exponential backoff to reduce load
5. **Caching** - Cache filing status lookups (with short TTL)

---

## Summary

The Filing Adapters system is built on proven design patterns:

- **Adapter Pattern**: Different interfaces unified through common base
- **Template Method**: Subclasses implement specific steps, base handles common logic
- **Factory Pattern**: Get adapters by system name
- **Strategy Pattern**: Different auth strategies (API key, OAuth2, cert)
- **Observer Pattern**: Webhooks notify system of status changes

This architecture makes it easy to:
1. Add new jurisdictions (new adapters)
2. Change validation rules (override methods)
3. Modify API calls (private methods)
4. Handle errors consistently (FilingError)
5. Test in isolation (mock adapters)
6. Monitor and debug (logging, retry tracking)

The system is production-ready and scales to support dozens of filing systems with minimal duplication.
