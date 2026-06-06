# IPOReady API Documentation

## Overview

The IPOReady API provides comprehensive endpoints for managing capital markets data, documents, and administrative functions for companies preparing for IPOs. This is a production-grade API built with Next.js and PostgreSQL.

**API Version:** 1.0.0  
**Base URL:** `https://api.ipoready.com` (or `http://localhost:3000` for development)

## Quick Start

### 1. Access Interactive Documentation

The Swagger UI provides an interactive API explorer:

```
GET /api-docs
```

Visit `http://localhost:3000/api-docs` to explore all endpoints with:
- Live request/response examples
- Parameter validation
- Authentication testing
- Response schema visualization

### 2. Authentication

All endpoints (except public endpoints) require JWT authentication via NextAuth:

```http
Authorization: Bearer <session-token>
```

**Token Details:**
- Issued upon successful login/registration
- Expires after 30 days
- Included in NextAuth session
- Passed via Authorization header

**Example:**
```bash
curl -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  https://api.ipoready.com/api/dashboard
```

### 3. Rate Limiting

API requests are rate-limited to prevent abuse:

| Endpoint Group | Limit | Window |
|---|---|---|
| Standard | 100 requests | per minute |
| Bulk Operations | 10 requests | per minute |
| Admin | 50 requests | per minute |

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1623001234
```

When rate limited, the API returns:
```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Retry-After: 45
```

---

## API Endpoints

### Capital Markets Endpoints

#### 1. List Companies

**Endpoint:** `GET /api/capital-markets/companies`

Retrieve a paginated list of public companies from the capital markets database.

**Parameters:**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `sector` | string | No | Filter by sector (e.g., "Technology", "Healthcare") |
| `q` | string | No | Search query for company name or ticker |
| `limit` | integer | No | Results per page (default: 50, max: 500) |
| `offset` | integer | No | Pagination offset (default: 0) |

**Response:** `200 OK`
```json
{
  "companies": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "TechCorp Inc",
      "ticker": "TECH",
      "sector": "Technology",
      "industry": "Software",
      "market_cap": 1500000000
    }
  ],
  "pagination": {
    "total": 250,
    "limit": 50,
    "offset": 0,
    "pages": 5
  }
}
```

**Caching:**
- Cache-Control: `public, s-maxage=600, stale-while-revalidate=1800`
- 10-minute cache with 30-minute stale-while-revalidate

**Example:**
```bash
# Get technology companies
curl "https://api.ipoready.com/api/capital-markets/companies?sector=Technology&limit=20"

# Search for specific company
curl "https://api.ipoready.com/api/capital-markets/companies?q=Apple"
```

---

#### 2. Get IPO Listings

**Endpoint:** `GET /api/capital-markets/ipos`

Retrieve IPO listings with performance metrics. Supports filtering by status, sector, and time range.

**Parameters:**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `status` | string | No | Status filter: `pending`, `listed`, `withdrawn`, `delayed` |
| `sector` | string | No | Filter by sector |
| `days` | integer | No | Recent IPOs from last N days (default: 90) |

**Response:** `200 OK`
```json
{
  "ipos": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "company_id": "550e8400-e29b-41d4-a716-446655440000",
      "company_name": "TechCorp Inc",
      "ticker": "TECH",
      "sector": "Technology",
      "status": "listed",
      "listing_date": "2024-06-15",
      "offer_price": 25.00,
      "first_day_return": 12.5,
      "return_30d": 18.3,
      "return_90d": 22.1,
      "performance": {
        "first_day_return": 12.5,
        "return_30d": 18.3,
        "return_90d": 22.1,
        "return_365d": 35.2,
        "vs_market_30d": 8.2,
        "vs_market_90d": 5.1
      }
    }
  ],
  "count": 42,
  "filters": {
    "status": "listed",
    "sector": "Technology",
    "days": 90
  }
}
```

**Caching:**
- Cache-Control: `public, s-maxage=300, stale-while-revalidate=600`
- 5-minute cache with 10-minute stale-while-revalidate

**Example:**
```bash
# Recent IPOs
curl "https://api.ipoready.com/api/capital-markets/ipos?days=30"

# Listed tech IPOs
curl "https://api.ipoready.com/api/capital-markets/ipos?status=listed&sector=Technology"
```

---

#### 3. Get Company Dashboard

**Endpoint:** `GET /api/capital-markets/dashboard`

Retrieve comprehensive capital markets dashboard for a specific company.

**Parameters:**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `companyId` | uuid | Yes | Company ID |

**Response:** `200 OK`
```json
{
  "company": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "TechCorp Inc",
    "ticker": "TECH",
    "sector": "Technology",
    "market_cap": 1500000000
  },
  "financials": {
    "latest": {
      "fiscal_year": 2024,
      "fiscal_quarter": 0,
      "revenue": 500000000,
      "net_income": 50000000,
      "operating_cash_flow": 75000000,
      "net_margin": 0.10,
      "roe": 0.15,
      "current_ratio": 1.8
    },
    "revenueGrowth": 25.5
  },
  "ipo": {
    "listing_date": "2024-06-15",
    "first_day_return": 12.5,
    "return_365d": 35.2
  },
  "benchmarks": {
    "percentile_vs_peers": 75,
    "percentile_vs_sector": 82
  },
  "valuation": {
    "pe_ratio": 28.5,
    "ev_revenue": 3.0,
    "ev_ebitda": 18.5
  }
}
```

**Error Responses:**
- `400 Bad Request` - Missing required `companyId` parameter
- `404 Not Found` - Company not found
- `500 Internal Server Error` - Database or processing error

**Example:**
```bash
curl "https://api.ipoready.com/api/capital-markets/dashboard?companyId=550e8400-e29b-41d4-a716-446655440000"
```

---

### Document Management Endpoints

#### 1. List Documents

**Endpoint:** `GET /api/documents/list`

Retrieve documents for a specific company.

**Parameters:**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `companyId` | uuid | Yes | Company ID |
| `category` | string | No | Filter by category: `legal`, `financial`, `governance`, `regulatory`, `compliance` |

**Response:** `200 OK`
```json
{
  "documents": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "company_id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "prospectus-2024.pdf",
      "display_name": "2024 Prospectus",
      "description": "Final prospectus for 2024 IPO",
      "category": "legal",
      "status": "approved",
      "mime_type": "application/pdf",
      "file_size": 2048000,
      "storage_provider": "local",
      "current_version": 3,
      "total_versions": 5,
      "uploaded_by": "user-123",
      "uploaded_at": "2024-06-01T10:30:00Z",
      "last_modified_by": "user-456",
      "last_modified_at": "2024-06-05T14:20:00Z",
      "completeness": 95,
      "comment_count": 3,
      "created_at": "2024-05-20T08:00:00Z",
      "updated_at": "2024-06-05T14:20:00Z"
    }
  ],
  "count": 12
}
```

**Authentication:** Required

**Example:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://api.ipoready.com/api/documents/list?companyId=550e8400-e29b-41d4-a716-446655440000&category=legal"
```

---

#### 2. Upload Documents

**Endpoint:** `POST /api/documents/upload`

Upload one or more documents for a company.

**Request Format:** `multipart/form-data`

**Fields:**
| Field | Type | Required | Description |
|---|---|---|---|
| `documentId` | string | Yes | Document ID (created first via documents API) |
| `files` | file[] | Yes | One or more files to upload |

**Response:** `200 OK`
```json
{
  "success": true,
  "documentId": "770e8400-e29b-41d4-a716-446655440002",
  "files": [
    {
      "id": "880e8400-e29b-41d4-a716-446655440003",
      "name": "prospectus-2024.pdf",
      "size": 2048000,
      "uploadedAt": "2024-06-01T10:30:00Z",
      "status": "uploaded",
      "publicPath": "/uploads/770e8400-e29b-41d4-a716-446655440002/880e8400-e29b-41d4-a716-446655440003.pdf"
    }
  ]
}
```

**Error Responses:**
- `400 Bad Request` - Missing `documentId` or `files`
- `401 Unauthorized` - Authentication required
- `500 Internal Server Error` - Upload failed

**Authentication:** Required

**Example:**
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "documentId=770e8400-e29b-41d4-a716-446655440002" \
  -F "files=@prospectus.pdf" \
  -F "files=@financial-statements.xlsx" \
  https://api.ipoready.com/api/documents/upload
```

---

#### 3. Delete Document File

**Endpoint:** `DELETE /api/documents/delete`

Delete a specific file from a document.

**Request Body:**
```json
{
  "documentId": "770e8400-e29b-41d4-a716-446655440002",
  "fileId": "880e8400-e29b-41d4-a716-446655440003"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

**Error Responses:**
- `400 Bad Request` - Missing required fields
- `401 Unauthorized` - Authentication required
- `500 Internal Server Error` - Deletion failed

**Authentication:** Required

**Example:**
```bash
curl -X DELETE \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": "770e8400-e29b-41d4-a716-446655440002",
    "fileId": "880e8400-e29b-41d4-a716-446655440003"
  }' \
  https://api.ipoready.com/api/documents/delete
```

---

### Admin Endpoints

#### 1. Trigger SEC Filing Ingestion

**Endpoint:** `POST /api/admin/ingest-sec-filings`

Start batch ingestion of SEC filings for specified companies.

**Parameters:**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `companyIds` | string | No | Comma-separated company IDs (defaults to all) |
| `limit` | integer | No | Max companies to ingest (default: 50) |

**Response:** `200 OK`
```json
{
  "message": "SEC filing ingestion completed",
  "statistics": {
    "total": 25,
    "successful": 24,
    "failed": 1,
    "duration_ms": 45000,
    "avg_per_company_ms": 1800
  },
  "errors": [
    "Company ID 123: Invalid CIK format"
  ]
}
```

**Behavior:**
- Long-running operation (may take several minutes)
- Batch processes up to 50 companies by default
- Returns statistics upon completion
- Includes error summary for failed ingestions

**Authentication:** Required (Admin role)

**Example:**
```bash
# Ingest all companies
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.ipoready.com/api/admin/ingest-sec-filings

# Ingest specific companies
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  "https://api.ipoready.com/api/admin/ingest-sec-filings?companyIds=123,456,789&limit=100"
```

---

#### 2. Get SEC Ingestion Status

**Endpoint:** `GET /api/admin/ingest-sec-filings`

Check the status of SEC filing ingestion operations.

**Response:** `200 OK`
```json
{
  "status": "ok",
  "companies_coverage": {
    "total": 5000,
    "with_10k": 4950,
    "with_10q": 4800
  },
  "recent_syncs": [
    {
      "source": "SEC_EDGAR",
      "status": "success",
      "created_at": "2024-06-07T15:30:00Z"
    }
  ]
}
```

**Authentication:** Required (Admin role)

**Example:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.ipoready.com/api/admin/ingest-sec-filings
```

---

#### 3. Deploy Unified Document System

**Endpoint:** `POST /api/admin/deploy-documents`

Deploy the unified document system and migrate legacy data. Handles database migrations, duplicate resolution, and cloud storage initialization.

**Response:** `200 OK`
```json
{
  "success": true,
  "steps": [
    {
      "step": "Verify unified_documents exists",
      "status": "success",
      "message": "unified_documents table exists and ready"
    },
    {
      "step": "Migrate prospectus_documents",
      "status": "success",
      "message": "Migrated 342 documents",
      "recordsAffected": 342
    },
    {
      "step": "Check for duplicates",
      "status": "success",
      "message": "✓ ZERO duplicates found - system is clean"
    },
    {
      "step": "Initialize cloud storage providers",
      "status": "success",
      "message": "Cloud storage providers configured for all companies"
    },
    {
      "step": "Final verification",
      "status": "success",
      "message": "Total documents: 342, Duplicates: 0 - ✓ SYSTEM READY"
    }
  ],
  "summary": {
    "totalDocumentsMigrated": 342,
    "duplicatesFound": 0,
    "duplicatesResolved": 0,
    "systemReady": true
  },
  "timestamp": "2024-06-07T15:30:00Z"
}
```

**Error Responses:**
- `403 Forbidden` - Admin access required
- `500 Internal Server Error` - Deployment failed

**Deployment Steps:**
1. Verify unified_documents table exists
2. Migrate documents from prospectus_documents
3. Detect and resolve duplicates
4. Initialize cloud storage providers
5. Final verification and readiness check

**Authentication:** Required (Admin role)

**Example:**
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.ipoready.com/api/admin/deploy-documents
```

---

### Dashboard Endpoints

#### 1. Get Company Dashboard

**Endpoint:** `GET /api/dashboard`

Retrieve comprehensive company dashboard data including tasks summary, phase progress, upcoming tasks, and recent activity.

**Response:** `200 OK`
```json
{
  "company": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "TechCorp Inc",
    "listingType": "IPO",
    "targetExchange": "NASDAQ",
    "currentPhase": "Phase 2",
    "paceScore": 78,
    "estimatedDaysToIpo": 180,
    "progressPercentage": 65,
    "currency": "USD",
    "language": "en",
    "createdAt": "2024-01-15T08:00:00Z",
    "trial_status": "active",
    "trial_end_date": "2024-07-15"
  },
  "tasksSummary": {
    "total": 156,
    "completed": 101,
    "inProgress": 32,
    "blocked": 5,
    "notStarted": 18
  },
  "phaseData": [
    {
      "phase": "Phase 1",
      "total": 42,
      "completed": 42,
      "percentage": 100
    },
    {
      "phase": "Phase 2",
      "total": 78,
      "completed": 59,
      "percentage": 76
    }
  ],
  "upcomingTasks": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "phase": "Phase 2",
      "category": "Compliance",
      "title": "Complete SEC filing",
      "priority": "critical",
      "estimatedDays": 5
    }
  ],
  "recentActivity": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "title": "Finalize prospectus",
      "phase": "Phase 2",
      "completedAt": "2024-06-06T14:30:00Z"
    }
  ]
}
```

**Error Responses:**
- `401 Unauthorized` - Authentication required
- `404 Not Found` - Company not found
- `500 Internal Server Error` - Database or processing error

**Authentication:** Required

**Example:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.ipoready.com/api/dashboard
```

---

## Error Handling

### Standard Error Response

All error responses follow this format:

```json
{
  "error": "Error message",
  "details": "Additional context (optional)"
}
```

### Common HTTP Status Codes

| Code | Meaning | Use Case |
|---|---|---|
| `200` | OK | Request succeeded |
| `201` | Created | Resource created successfully |
| `400` | Bad Request | Invalid parameters or body |
| `401` | Unauthorized | Missing or invalid authentication |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource doesn't exist |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Server-side error |

---

## Best Practices

### 1. Authentication

Always include the Authorization header with your session token:

```bash
curl -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  https://api.ipoready.com/api/endpoint
```

### 2. Pagination

Use limit and offset for large result sets:

```bash
# Get first 50 companies
curl "https://api.ipoready.com/api/capital-markets/companies?limit=50&offset=0"

# Get next page
curl "https://api.ipoready.com/api/capital-markets/companies?limit=50&offset=50"
```

### 3. Caching

Respect cache headers for better performance:

```
Cache-Control: public, s-maxage=600, stale-while-revalidate=1800
```

Use ETags and If-Modified-Since headers when available.

### 4. Error Handling

Always check HTTP status codes and error responses:

```javascript
try {
  const response = await fetch('/api/endpoint', {
    headers: { 'Authorization': `Bearer ${token}` }
  })

  if (!response.ok) {
    const error = await response.json()
    console.error(`Error: ${error.error}`, error.details)
    return
  }

  const data = await response.json()
  // Process data
} catch (err) {
  console.error('Request failed:', err)
}
```

### 5. Rate Limiting

Monitor rate limit headers and implement backoff:

```javascript
const remaining = parseInt(response.headers.get('X-RateLimit-Remaining'))
const reset = parseInt(response.headers.get('X-RateLimit-Reset'))

if (remaining === 0) {
  const delay = reset * 1000 - Date.now()
  console.log(`Rate limited. Retry after ${delay}ms`)
}
```

---

## SDKs and Client Libraries

### JavaScript/TypeScript

```typescript
// Using fetch API
const response = await fetch('/api/capital-markets/companies', {
  headers: {
    'Authorization': `Bearer ${sessionToken}`,
  }
})
const data = await response.json()

// Using axios
import axios from 'axios'

const client = axios.create({
  baseURL: 'https://api.ipoready.com',
  headers: {
    'Authorization': `Bearer ${sessionToken}`
  }
})

const { data } = await client.get('/api/capital-markets/companies')
```

### Python

```python
import requests

headers = {
    'Authorization': f'Bearer {session_token}'
}

response = requests.get(
    'https://api.ipoready.com/api/capital-markets/companies',
    headers=headers
)
data = response.json()
```

### cURL

```bash
# List companies
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://api.ipoready.com/api/capital-markets/companies?sector=Technology"

# Upload documents
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "documentId=123" \
  -F "files=@file.pdf" \
  https://api.ipoready.com/api/documents/upload
```

---

## Support

For questions or issues:

- **Documentation:** https://ipoready.com/docs
- **Email:** support@ipoready.com
- **Status Page:** https://ipoready.com/status
- **Interactive API Docs:** https://api.ipoready.com/api-docs

---

## Changelog

### Version 1.0.0 (Current)

**Released:** June 7, 2024

**Features:**
- Capital Markets endpoints (companies, IPOs, dashboards)
- Document management (list, upload, delete)
- Admin operations (SEC ingestion, deployment)
- Complete OpenAPI/Swagger documentation
- Swagger UI at `/api-docs`

**Known Limitations:**
- Rate limiting per IP address
- Maximum file upload size: 100MB
- Request timeout: 30 seconds (5 minutes for batch operations)

---

## OpenAPI Specification

The complete OpenAPI 3.0 specification is available at:

```
GET /openapi.yaml
```

Use this with Swagger UI, Postman, or other OpenAPI-compatible tools.

```bash
# View the spec
curl https://api.ipoready.com/openapi.yaml

# Import into Postman
# Menu > File > Import > Link > https://api.ipoready.com/openapi.yaml
```
