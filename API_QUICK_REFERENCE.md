# IPOReady API Quick Reference

## Accessing API Documentation

| Resource | URL |
|----------|-----|
| Interactive Swagger UI | `GET /api-docs` |
| OpenAPI Specification | `GET /openapi.yaml` |
| Full Documentation | `API_DOCUMENTATION.md` |
| Type Definitions | `src/types/api-types.ts` |
| API Client Library | `src/lib/api-client.ts` |
| Postman Collection | `public/ipoready-api.postman_collection.json` |

---

## Authentication

```bash
# Include token in Authorization header
Authorization: Bearer YOUR_SESSION_TOKEN
```

---

## Capital Markets APIs

### List Companies

```bash
GET /api/capital-markets/companies?sector=Technology&limit=50&offset=0
```

**Query Parameters:**
- `sector` - Filter by sector
- `q` - Search by name or ticker
- `limit` - Results per page (default: 50, max: 500)
- `offset` - Pagination offset (default: 0)

**Response:**
```json
{
  "companies": [...],
  "pagination": {
    "total": 250,
    "limit": 50,
    "offset": 0,
    "pages": 5
  }
}
```

---

### Get IPO Listings

```bash
GET /api/capital-markets/ipos?status=listed&sector=Technology&days=90
```

**Query Parameters:**
- `status` - `pending`, `listed`, `withdrawn`, `delayed`
- `sector` - Filter by sector
- `days` - Recent IPOs (default: 90)

**Response:**
```json
{
  "ipos": [...],
  "count": 42,
  "filters": {...}
}
```

---

### Get Capital Markets Dashboard

```bash
GET /api/capital-markets/dashboard?companyId=UUID
```

**Query Parameters:**
- `companyId` - **Required** Company ID

**Response:**
```json
{
  "company": {...},
  "financials": {...},
  "ipo": {...},
  "benchmarks": {...},
  "valuation": {...}
}
```

---

## Document APIs

### List Documents

```bash
GET /api/documents/list?companyId=UUID&category=legal
Authorization: Bearer TOKEN
```

**Query Parameters:**
- `companyId` - **Required** Company ID
- `category` - `legal`, `financial`, `governance`, `regulatory`, `compliance`

**Response:**
```json
{
  "documents": [...],
  "count": 12
}
```

---

### Upload Documents

```bash
POST /api/documents/upload
Authorization: Bearer TOKEN
Content-Type: multipart/form-data

documentId=UUID&files=@file1.pdf&files=@file2.xlsx
```

**Form Fields:**
- `documentId` - **Required** Document ID
- `files` - **Required** One or more files

**Response:**
```json
{
  "success": true,
  "documentId": "UUID",
  "files": [...]
}
```

---

### Delete Document

```bash
DELETE /api/documents/delete
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "documentId": "UUID",
  "fileId": "UUID"
}
```

**Response:**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

---

## Admin APIs

### Trigger SEC Ingestion

```bash
POST /api/admin/ingest-sec-filings?limit=50
Authorization: Bearer TOKEN
```

**Query Parameters:**
- `companyIds` - Comma-separated IDs (optional)
- `limit` - Max companies (default: 50)

**Response:**
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
  "errors": [...]
}
```

---

### Get SEC Status

```bash
GET /api/admin/ingest-sec-filings
Authorization: Bearer TOKEN
```

**Response:**
```json
{
  "status": "ok",
  "companies_coverage": {
    "total": 5000,
    "with_10k": 4950,
    "with_10q": 4800
  },
  "recent_syncs": [...]
}
```

---

### Deploy Documents

```bash
POST /api/admin/deploy-documents
Authorization: Bearer TOKEN
```

**Response:**
```json
{
  "success": true,
  "steps": [...],
  "summary": {
    "totalDocumentsMigrated": 342,
    "duplicatesFound": 0,
    "duplicatesResolved": 0,
    "systemReady": true
  },
  "timestamp": "2024-06-07T15:30:00Z"
}
```

---

## Dashboard API

### Get Dashboard

```bash
GET /api/dashboard
Authorization: Bearer TOKEN
```

**Response:**
```json
{
  "company": {...},
  "tasksSummary": {...},
  "phaseData": [...],
  "upcomingTasks": [...],
  "recentActivity": [...]
}
```

---

## Common Query Patterns

### Pagination Example

```bash
# First page
GET /api/capital-markets/companies?limit=20&offset=0

# Next page
GET /api/capital-markets/companies?limit=20&offset=20

# Last page
GET /api/capital-markets/companies?limit=20&offset=200
```

### Filtering Examples

```bash
# Filter by sector
GET /api/capital-markets/companies?sector=Technology

# Search by company name
GET /api/capital-markets/companies?q=Apple

# Combined filters
GET /api/capital-markets/companies?sector=Technology&q=Apple&limit=10
```

### Time Range Examples

```bash
# Recent IPOs (last 30 days)
GET /api/capital-markets/ipos?days=30

# Recent IPOs by sector (last 90 days)
GET /api/capital-markets/ipos?sector=Technology&days=90

# All IPOs with specific status
GET /api/capital-markets/ipos?status=listed
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "details": "Additional context"
}
```

### Common Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Request succeeded |
| 400 | Bad Request | Missing required parameter |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Internal error |

---

## Using the TypeScript Client

```typescript
import { apiClient } from '@/lib/api-client'

// Set token
apiClient.setToken(sessionToken)

// Get companies
const { companies, pagination } = await apiClient.getCompanies({
  sector: 'Technology',
  limit: 50
})

// Get IPOs
const { ipos } = await apiClient.getIPOs({
  status: 'listed',
  days: 90
})

// Get documents
const { documents } = await apiClient.getDocuments({
  companyId: 'company-id',
  category: 'legal'
})

// Upload documents
const result = await apiClient.uploadDocuments('doc-id', files)

// Get dashboard
const dashboard = await apiClient.getDashboard()

// Admin: Ingest SEC filings
const ingestion = await apiClient.ingestSecFilings({ limit: 50 })

// Admin: Deploy documents
const deployment = await apiClient.deployDocuments()
```

---

## Using Postman

1. **Import Collection:**
   - Open Postman
   - File > Import > Link
   - Paste: `https://api.ipoready.com/public/ipoready-api.postman_collection.json`

2. **Set Variables:**
   - `base_url`: `http://localhost:3000` (or your API URL)
   - `token`: Your JWT session token

3. **Test Endpoints:**
   - Click on any request
   - Click "Send"
   - View response

---

## cURL Examples

### Get Companies
```bash
curl "http://localhost:3000/api/capital-markets/companies?sector=Technology&limit=20"
```

### Get IPOs
```bash
curl "http://localhost:3000/api/capital-markets/ipos?status=listed&days=90"
```

### List Documents (Authenticated)
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/documents/list?companyId=UUID"
```

### Upload Documents (Authenticated)
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "documentId=UUID" \
  -F "files=@document.pdf" \
  http://localhost:3000/api/documents/upload
```

### Delete Document (Authenticated)
```bash
curl -X DELETE \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"documentId":"UUID","fileId":"UUID"}' \
  http://localhost:3000/api/documents/delete
```

### Admin: Deploy Documents (Authenticated)
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/admin/deploy-documents
```

---

## Rate Limits

- **Standard endpoints**: 100 requests/minute
- **Bulk operations**: 10 requests/minute
- **Admin endpoints**: 50 requests/minute

**Retry after rate limit:**
```
X-RateLimit-Reset: 1623001234 (Unix timestamp)
```

---

## Caching

Some endpoints return cache headers:

```
Cache-Control: public, s-maxage=600, stale-while-revalidate=1800
```

Meaning:
- Cache for 10 minutes
- Serve stale content for up to 30 minutes if origin is down

---

## Support

- **Documentation:** `/api-docs` or `API_DOCUMENTATION.md`
- **Email:** support@ipoready.com
- **Status:** https://ipoready.com/status

---

## Version Info

- **API Version:** 1.0.0
- **OpenAPI Version:** 3.0.0
- **Last Updated:** June 7, 2024
