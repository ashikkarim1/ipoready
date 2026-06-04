# SEDAR 2 & SEC EDGAR Real Implementation Guide

## Overview

This document describes the production-ready implementation of SEDAR 2 and SEC EDGAR filing integrations with real API calls, request/response mapping, MIME type handling, and error code parsing.

## Files

### Core Adapters
- **SEDARAdapter.real.ts** (~350 lines) - SEDAR 2 API integration
- **SECEdgarAdapter.real.ts** (~380 lines) - SEC EDGAR MIME format integration

### Service Layer
- **filing-service.ts** (~180 lines) - Unified service layer for both systems

### API Routes
- **/api/filings/submit** - Submit filing (POST)
- **/api/filings/status** - Get filing status (GET/POST)
- **/api/webhooks/filing-status** - Webhook handler for status updates

## Architecture

### Request Flow

```
User Request
    ↓
API Route (/api/filings/submit)
    ↓
FilingService.submitFiling()
    ↓
SEDARAdapter / SECEdgarAdapter
    ↓
Real API Call (SEDAR 2 / SEC EDGAR)
    ↓
Parse Response
    ↓
Persist to Database
    ↓
Return Result
```

### Response Flow

```
SEDAR/SEC Webhook
    ↓
API Route (/api/webhooks/filing-status)
    ↓
Validate Signature (HMAC-SHA256)
    ↓
Parse Payload
    ↓
Update Database
    ↓
Send Notification
    ↓
Return 202 Accepted
```

## SEDAR 2 Implementation

### Authentication
- **Method**: OAuth 2.0 (Client Credentials)
- **Token URL**: `{API_ENDPOINT}/oauth/token`
- **Scopes**: `filing.submit filing.status`
- **Token Caching**: Automatic with TTL and refresh

### API Endpoints

#### Submit Filing
```
POST /v1/filings/submit
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "filingType": "prospectus",
  "companyInfo": {
    "legalName": "Company Name",
    "businessNumber": "123456789",
    "jurisdiction": "CA"
  },
  "documents": [
    {
      "name": "prospectus",
      "fileName": "prospectus.pdf",
      "type": "Prospectus",
      "mimeType": "application/pdf",
      "content": "base64_encoded_content",
      "sequence": 1,
      "language": "en"
    }
  ],
  "metadata": {
    "submittedBy": "john@example.com",
    "submittedEmail": "john@example.com",
    "submittedDate": "2024-01-01T00:00:00Z",
    "estimatedReviewDays": 10
  }
}

Response: 200 OK
{
  "success": true,
  "data": {
    "filingId": "FIL-2024-001",
    "trackingNumber": "2024001001",
    "status": "submitted",
    "submittedAt": "2024-01-01T00:00:00Z",
    "estimatedReviewDays": 10,
    "documentAcceptances": [...],
    "messages": []
  },
  "meta": {
    "requestId": "req-123",
    "processingTime": 1234
  }
}
```

#### Get Status
```
GET /v1/filings/{filingId}/status
Authorization: Bearer {access_token}

Response: 200 OK
{
  "success": true,
  "data": {
    "filingId": "FIL-2024-001",
    "trackingNumber": "2024001001",
    "status": "reviewing",
    "submittedAt": "2024-01-01T00:00:00Z",
    "lastUpdatedAt": "2024-01-02T00:00:00Z",
    "reviewComments": ["Item 1 approved"],
    "rejectionReasons": [],
    "nextSteps": ["Awaiting director signatures"],
    "documentStatuses": [...]
  }
}
```

#### Register Webhook
```
POST /v1/webhooks
Authorization: Bearer {access_token}

{
  "url": "https://ipoready.com/api/webhooks/filing-status",
  "events": ["filing.submitted", "filing.updated", "filing.approved"],
  "active": true,
  "retryPolicy": {
    "maxRetries": 3,
    "initialDelayMs": 1000,
    "maxDelayMs": 30000
  }
}

Response: 200 OK
{
  "success": true,
  "data": {
    "webhookId": "whk-2024-001"
  }
}
```

### Error Codes & Handling

| Code | HTTP | Retryable | Action |
|------|------|-----------|--------|
| INVALID_REQUEST | 400 | No | Fix payload and resubmit |
| INVALID_SIGNATURE | 400 | No | Fix document signatures |
| AUTHENTICATION_FAILED | 401 | No | Check credentials |
| FORBIDDEN_ACCESS | 403 | No | Check permissions |
| FILING_NOT_FOUND | 404 | No | Verify filing ID |
| CONFLICT | 409 | No | Filing already exists |
| SERVER_ERROR | 500 | Yes | Retry with backoff |
| SERVICE_UNAVAILABLE | 503 | Yes | Retry with backoff |
| RATE_LIMIT_EXCEEDED | 429 | Yes | Wait and retry |
| GATEWAY_TIMEOUT | 504 | Yes | Retry with backoff |

### Retry Logic
- **Max Retries**: 3 attempts
- **Initial Delay**: 1000ms
- **Backoff**: Exponential (1s, 2s, 4s)
- **Only retryable errors are retried**

### Webhook Signature Validation
```typescript
// HMAC-SHA256 validation
const signature = req.headers['x-signature']
const timestamp = payload.timestamp
const payload_string = `${timestamp}.${JSON.stringify(payload)}`

const hmac = crypto.createHmac('sha256', SEDAR2_WEBHOOK_SECRET)
hmac.update(payload_string)
const expectedSignature = hmac.digest('hex')

if (signature !== expectedSignature) {
  // Invalid webhook
}
```

## SEC EDGAR Implementation

### Authentication
- **Method**: None (public system)
- **CIK**: 10-digit Central Index Key
- **User-Agent**: Required

### API Endpoints

#### Browse Edgar (Status Query)
```
GET https://www.sec.gov/cgi-bin/browse-edgar?
  action=getcompany
  &CIK={cik}
  &type={form_type}
  &dateb=
  &owner=exclude
  &count=100
  &format=json

Response: 200 OK
{
  "cik_str": 123456,
  "cik": "0000123456",
  "entityType": "operating",
  "name": "Company Name",
  "filings": {
    "recent": [
      {
        "accessionNumber": "0001234567-24-000001",
        "filingDate": "2024-01-01",
        "reportDate": "2023-12-31",
        "acceptanceDateTime": "2024-01-01 10:00:00",
        "form": "F-1",
        "fileNumber": "333-123456",
        "size": 1234567,
        "isXBRL": 1
      }
    ]
  }
}
```

#### Submit Filing (MIME Format)
```
POST https://www.sec.gov/cgi-bin/submit-cgi
Content-Type: multipart/form-data

--BOUNDARY
Content-Disposition: form-data; name="cik"

0000123456
--BOUNDARY
Content-Disposition: form-data; name="form_type"

F-1
--BOUNDARY
Content-Disposition: form-data; name="document"; filename="prospectus.pdf"
Content-Type: application/pdf
Content-Transfer-Encoding: binary

[binary content]
--BOUNDARY--

Response: 200 OK
[XML or text response with accession number]
```

### MIME Format Specification

SEC EDGAR requires submissions in MIME format:

1. **Boundary Marker**: `----SEC_EDGAR_[timestamp]_[random]`
2. **Part Headers**:
   - `Content-Disposition: form-data; name="{field}"`
   - `Content-Type: {mime_type}`
   - `Content-Transfer-Encoding: binary` (for binary content)
3. **Field Order**:
   - CIK
   - Form Type
   - Submission Type
   - Documents (in sequence order)
4. **File Size Limit**: 150MB per document

### Error Codes & Handling

| Code | HTTP | Retryable | Action |
|------|------|-----------|--------|
| INVALID_FORMAT | 400 | No | Fix MIME format |
| INVALID_CIK | 400 | No | Verify CIK |
| INVALID_SIGNATURE | 400 | No | Fix signatures |
| UNAUTHORIZED | 401 | No | Check filer ID |
| FORBIDDEN | 403 | No | Check permissions |
| NOT_FOUND | 404 | No | Verify company exists |
| CONFLICT | 409 | No | Filing already exists |
| SERVER_ERROR | 500 | Yes | Retry with backoff |
| SERVICE_UNAVAILABLE | 503 | Yes | Retry with backoff |
| RATE_LIMIT | 429 | Yes | Wait and retry |
| GATEWAY_TIMEOUT | 504 | Yes | Retry with backoff |

### XBRL Validation

Financial statements must be in XBRL format:
```xml
<xbrl xmlns:xbrldi="http://xbrl.sec.gov/xbrldi"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <!-- Instance document content -->
</xbrl>
```

Validation checks:
- Must include required namespaces
- Must have valid XML structure
- Must reference valid GL taxonomies
- Must include required contexts and units

## Environment Variables

### SEDAR 2
```
SEDAR2_CLIENT_ID=your-client-id
SEDAR2_CLIENT_SECRET=your-client-secret
SEDAR2_SANDBOX=true|false
SEDAR2_WEBHOOK_SECRET=webhook-secret-for-signature-validation
```

### SEC EDGAR
```
SEC_CIK=0000123456
SEC_WEBHOOK_SECRET=webhook-secret-for-signature-validation
```

### Common
```
PREFERRED_LANGUAGE=en|fr
```

## Usage Examples

### 1. Submit to SEDAR

```typescript
import { getFilingService } from '@/lib/services/filing-service'
import { DocumentType, DocumentMetadata, FilingMetadata } from '@/lib/filing-adapters/BaseFilingAdapter'

const filingService = getFilingService()

const documents: DocumentMetadata[] = [
  {
    id: 'doc-001',
    type: DocumentType.PROSPECTUS,
    format: 'pdf',
    fileName: 'prospectus.pdf',
    mimeType: 'application/pdf',
    size: 1234567,
    checksum: 'sha256hash',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    content: pdfBuffer, // Binary content
    language: 'en',
  },
]

const metadata: FilingMetadata = {
  companyId: 'company-123',
  companyName: 'TechStartup Corp',
  filingType: 'prospectus',
  currencyCode: 'CAD',
  country: 'CA',
  auditFirmName: 'Big Four Audit Firm',
  submittedBy: 'cfo@company.com',
  submittedAt: new Date(),
  customMetadata: {
    businessNumber: '123456789',
    signatures: [
      {
        signerName: 'John Doe',
        signerTitle: 'CEO',
        signatureDate: '2024-01-01T00:00:00Z',
      },
    ],
  },
}

const result = await filingService.submitFiling({
  filingSystem: 'sedar',
  documents,
  metadata,
  options: {
    webhookUrl: 'https://ipoready.com/api/webhooks/filing-status',
    registerWebhook: true,
  },
})

console.log('Filing submitted:', {
  filingId: result.filingId,
  referenceNumber: result.referenceNumber,
  status: result.status,
  webhookRegistered: result.webhookRegistered,
})
```

### 2. Get Filing Status

```typescript
const status = await filingService.getFilingStatus(
  'FIL-2024-001',
  'sedar'
)

console.log('Filing status:', {
  status: status.status,
  phase: status.phase,
  lastUpdatedAt: status.lastUpdatedAt,
  reviewComments: status.reviewComments,
  rejectionReasons: status.rejectionReasons,
})
```

### 3. Validate Documents

```typescript
const validation = await filingService.validateDocuments(
  documents,
  'sedar'
)

if (!validation.isValid) {
  console.error('Validation errors:')
  validation.errors.forEach(error => console.error(`  - ${error}`))
}

console.warn('Validation warnings:')
validation.warnings.forEach(warning => console.warn(`  - ${warning}`))
```

### 4. Handle Webhook

```typescript
// POST request to /api/webhooks/filing-status
const payload = {
  filingId: 'FIL-2024-001',
  trackingNumber: '2024001001',
  status: 'approved',
  previousStatus: 'reviewing',
  timestamp: '2024-01-02T00:00:00Z',
  documentStatuses: [
    { fileName: 'prospectus.pdf', status: 'accepted' }
  ],
  signature: 'hmac_sha256_signature'
}

// Webhook is automatically processed:
// 1. Signature validated
// 2. Status update persisted to database
// 3. User notification sent
// 4. Returns 202 Accepted
```

## Testing

### Unit Tests
```bash
npm test -- SEDARAdapter.real.test.ts
npm test -- SECEdgarAdapter.real.test.ts
```

### Integration Tests
```bash
npm test:integration -- filing-service.test.ts
```

### Load Testing
```bash
# Test with 100 concurrent submissions
npm test:load -- --users=100 --duration=60
```

### Sandbox Testing
Use sandbox endpoints for testing:
- SEDAR: `https://sandbox-api.sedar.ca/v1`
- SEC: Use test CIK `0000000000` (not real)

## Production Checklist

- [ ] API credentials configured in environment
- [ ] Webhook secret configured
- [ ] Webhook URL is publicly accessible
- [ ] Database migrations applied
- [ ] Error logging configured
- [ ] Monitoring and alerting set up
- [ ] Rate limiting configured
- [ ] SSL/TLS enabled for webhooks
- [ ] Backup and recovery tested
- [ ] Load testing passed
- [ ] Security audit completed

## Monitoring

### Key Metrics
- Filing submission success rate
- Average response time
- Webhook delivery latency
- Error rate by code
- Retry rate

### Logging
All API calls are logged with:
- Request ID
- Method and endpoint
- HTTP status
- Response time
- Error details (if any)

### Alerts
Set up alerts for:
- Service unavailable (5xx errors)
- Rate limiting (429)
- Authentication failures (401)
- Invalid filings (400)
- Webhook failures
- Database errors

## Support

For issues or questions:
1. Check error logs and error codes
2. Review SEC/SEDAR documentation
3. Contact filing system support
4. Escalate to development team

## References

- SEDAR 2 API: https://sedar.ca/api/v1
- SEC EDGAR: https://www.sec.gov/edgar/
- XBRL: https://www.sec.gov/xbrl/
- OAuth 2.0: https://tools.ietf.org/html/rfc6749
