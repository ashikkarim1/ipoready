# IPOReady API Documentation

**Version:** 1.0.0  
**Base URL:** `https://app.ipoready.com/api`  
**Authentication:** NextAuth.js (JWT)

## Overview

IPOReady provides REST APIs for programmatic access to:
- PACE™ framework data
- Company information management
- Document management
- Capital markets intelligence
- Compliance tracking

All requests require authentication via NextAuth.js session.

---

## Authentication

### Session-Based (Web)

All API endpoints are protected by NextAuth.js middleware. Session is automatically maintained via secure cookies.

```bash
curl -H "Cookie: next-auth.session-token=..." https://app.ipoready.com/api/company
```

### Direct API Access

For service-to-service integration, use JWT tokens:

```bash
curl -H "Authorization: Bearer <JWT_TOKEN>" https://app.ipoready.com/api/company
```

---

## Core Endpoints

### Company Information

#### Get Company Profile

```
GET /api/company/{companyId}
```

**Parameters:**
- `companyId` (string, required) - Unique company identifier

**Response:**
```json
{
  "id": "company-123",
  "name": "TechCorp Inc.",
  "industry": "Software",
  "countryCode": "CA",
  "incorporationDate": "2020-01-15",
  "currentPhase": "financial_audit",
  "estimatedLaunchDate": "2026-09-15",
  "advisors": [
    {
      "name": "Goldman Sachs",
      "type": "underwriter",
      "engagementDate": "2026-01-01"
    }
  ]
}
```

#### Update Company Information

```
PUT /api/company/{companyId}
```

**Request Body:**
```json
{
  "name": "TechCorp Inc.",
  "industry": "Software",
  "countryCode": "CA",
  "estimatedLaunchDate": "2026-09-15"
}
```

**Response:** Updated company object (same as GET)

---

### PACE™ Framework

#### Get PACE Status

```
GET /api/pace/status/{companyId}
```

**Response:**
```json
{
  "companyId": "company-123",
  "overallScore": 72,
  "phases": [
    {
      "phase": "pre_planning",
      "status": "completed",
      "percentage": 100,
      "estimatedDays": 45
    },
    {
      "phase": "corporate_restructuring",
      "status": "in_progress",
      "percentage": 43,
      "estimatedDays": 90
    }
  ],
  "daysToIPO": 184,
  "confidenceLevel": 0.80
}
```

#### Get PACE Metrics

```
GET /api/pace/metrics/{companyId}
```

**Query Parameters:**
- `timeframe` (optional): `week|month|quarter|year`

**Response:**
```json
{
  "completion_velocity": "15% per month",
  "blockers": 3,
  "on_track": true,
  "riskLevel": "moderate",
  "recommendations": [
    "Accelerate legal documentation phase",
    "Schedule audit firm meetings"
  ]
}
```

---

### Documents

#### List Documents

```
GET /api/documents/list
```

**Query Parameters:**
- `companyId` (string, required)
- `category` (optional): `prospectus|financial|legal|compliance`
- `limit` (optional, default: 50)
- `offset` (optional, default: 0)

**Response:**
```json
{
  "documents": [
    {
      "id": "doc-123",
      "name": "Articles of Incorporation",
      "category": "legal",
      "status": "approved",
      "version": "5",
      "uploadedAt": "2026-06-01T10:30:00Z",
      "size": 245000,
      "url": "/api/documents/doc-123/download"
    }
  ],
  "total": 42,
  "offset": 0,
  "limit": 50
}
```

#### Upload Document

```
POST /api/documents/upload
Content-Type: multipart/form-data
```

**Form Data:**
- `file` (file, required)
- `companyId` (string, required)
- `category` (string, required)
- `version` (string, optional)

**Response:**
```json
{
  "id": "doc-123",
  "name": "Articles of Incorporation.pdf",
  "size": 245000,
  "uploadedAt": "2026-06-01T10:30:00Z",
  "status": "pending_review"
}
```

#### Validate Document

```
POST /api/documents/validate
```

**Request Body:**
```json
{
  "documentId": "doc-123"
}
```

**Response:**
```json
{
  "valid": true,
  "duplicates": [],
  "completeness": 0.95,
  "errors": [],
  "warnings": [
    "Document has 2 minor formatting issues"
  ]
}
```

---

### Capital Markets Intelligence

#### Get Capital Markets Data

```
GET /api/capital-markets/dashboard
```

**Query Parameters:**
- `companyId` (string, required)

**Response:**
```json
{
  "company": {
    "name": "TechCorp Inc.",
    "sector": "Software",
    "publicMarketData": {
      "peerAverageRevenue": 250000000,
      "peerAverageMultiple": 8.2,
      "estimatedValuation": 2000000000
    }
  },
  "financials": {
    "lastYear": {
      "revenue": 150000000,
      "ebitda": 30000000,
      "margin": 0.20
    }
  },
  "ipoData": {
    "estimatedSize": 200000000,
    "estimatedPrice": 18.50,
    "estimatedShares": 10800000
  },
  "benchmarks": {
    "revenueGrowth": 0.25,
    "profitMargin": 0.20,
    "returnOnEquity": 0.18
  }
}
```

#### Get IPO Tracking

```
GET /api/capital-markets/ipos
```

**Query Parameters:**
- `status` (optional): `planning|filed|approved|listed`
- `sector` (optional)
- `days` (optional): Number of days window

**Response:**
```json
{
  "ipos": [
    {
      "id": "ipo-123",
      "company": "TechCorp Inc.",
      "sector": "Software",
      "status": "planning",
      "estimatedDate": "2026-09-15",
      "estimatedSize": 200000000,
      "exchange": "TSXV"
    }
  ],
  "total": 5,
  "summary": {
    "planning": 2,
    "filed": 1,
    "approved": 0,
    "listed": 2
  }
}
```

---

### Compliance

#### Get Compliance Requirements

```
GET /api/compliance/requirements/{companyId}
```

**Response:**
```json
{
  "companyId": "company-123",
  "requirements": [
    {
      "id": "req-1",
      "name": "Form 2A (Director Personal Information)",
      "regulation": "TSXV Policy 3.3",
      "deadline": "2026-06-15",
      "status": "pending",
      "owner": "Legal Counsel"
    }
  ],
  "compliant": false,
  "completionPercentage": 67
}
```

#### Track Compliance Item

```
POST /api/compliance/track
```

**Request Body:**
```json
{
  "requirementId": "req-1",
  "status": "completed",
  "completedAt": "2026-06-14T15:30:00Z",
  "notes": "Submitted to TSXV Exchange Services"
}
```

---

### Filing

#### Submit Filing

```
POST /api/filings/submit
```

**Request Body:**
```json
{
  "filingSystem": "sedar|sec",
  "documents": [
    {
      "id": "doc-123",
      "type": "prospectus"
    }
  ],
  "metadata": {
    "companyName": "TechCorp Inc.",
    "submittedBy": "user-123"
  },
  "options": {
    "dryRun": false,
    "registerWebhook": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "filingId": "filing-123",
  "status": "submitted",
  "referenceNumber": "TR-2026-06-001",
  "submittedAt": "2026-06-01T10:30:00Z"
}
```

#### Get Filing Status

```
GET /api/filings/status/{filingId}
```

**Response:**
```json
{
  "filingId": "filing-123",
  "status": "submitted",
  "referenceNumber": "TR-2026-06-001",
  "submittedAt": "2026-06-01T10:30:00Z",
  "lastUpdated": "2026-06-02T08:15:00Z",
  "progress": 0.50,
  "events": [
    {
      "timestamp": "2026-06-01T10:30:00Z",
      "event": "submitted",
      "message": "Filing received by SEDAR"
    }
  ]
}
```

---

## Error Handling

All endpoints return standard error responses:

```json
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": [
    "companyId is required",
    "category must be one of: prospectus, financial, legal, compliance"
  ],
  "timestamp": "2026-06-01T10:30:00Z",
  "requestId": "req-xyz-123"
}
```

### HTTP Status Codes

- `200` - Success
- `400` - Bad request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not found
- `429` - Rate limited
- `500` - Server error

---

## Rate Limiting

API endpoints are rate-limited per user:

- **Default:** 60 requests per minute
- **Auth endpoints:** 5 requests per 15 minutes
- **File upload:** 50 requests per hour

Rate limit info included in response headers:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1622505600
```

---

## Webhooks

Register webhooks to receive real-time updates:

```
POST /api/webhooks/register
```

**Request Body:**
```json
{
  "url": "https://your-domain.com/webhooks/ipoready",
  "events": ["filing.submitted", "document.approved", "compliance.completed"]
}
```

**Webhook Events:**
- `filing.submitted` - Filing submitted to regulator
- `filing.updated` - Filing status changed
- `document.approved` - Document approved by admin
- `compliance.completed` - Compliance requirement marked complete
- `pace.updated` - PACE score updated

---

## SDKs

Official SDKs available:

- **JavaScript/TypeScript:** `npm install @ipoready/sdk`
- **Python:** `pip install ipoready-sdk`

Example:

```typescript
import { IPOReady } from '@ipoready/sdk'

const client = new IPOReady({ token: 'your-jwt-token' })
const company = await client.company.get('company-123')
const pace = await client.pace.getStatus('company-123')
```

---

## Support

- **Documentation:** https://docs.ipoready.com
- **Status Page:** https://status.ipoready.com
- **Email:** api@ipoready.com
- **Slack:** [Join our community Slack](#)

---

## Changelog

### v1.0.0 (2026-06-07)
- Initial API release
- PACE framework endpoints
- Document management
- Capital markets intelligence
- Compliance tracking
- Filing integration
