# IPOReady API Documentation - Setup & Deployment Guide

## Overview

Complete OpenAPI/Swagger documentation has been generated for all IPOReady APIs. The documentation is production-ready with interactive exploration, type definitions, and client libraries.

## What's Been Generated

### 1. OpenAPI Specification (35 KB)
- **File:** `public/openapi.yaml`
- **Format:** OpenAPI 3.0.0
- **Endpoints Documented:**
  - Capital Markets (3 endpoints)
  - Documents (3 endpoints)
  - Admin (3 endpoints)
  - Dashboard (1 endpoint)
- **Features:**
  - Complete parameter documentation
  - Request/response examples
  - Status code definitions
  - Rate limiting specifications
  - Authentication details
  - Schema definitions for all data types

### 2. Interactive Swagger UI
- **Route:** `GET /api-docs`
- **Files:**
  - `src/app/api-docs/page.tsx` - Swagger UI component
  - `src/app/api-docs/layout.tsx` - Layout wrapper
- **Features:**
  - Live request testing
  - Parameter validation
  - Response schema visualization
  - Authentication token management
  - Beautiful, modern UI
  - Mobile-responsive

### 3. TypeScript Type Definitions (8.4 KB)
- **File:** `src/types/api-types.ts`
- **Contents:**
  - Request/response interfaces
  - Query parameter types
  - Error types
  - All domain models (Company, IPO, Document, etc.)
- **Usage:**
  ```typescript
  import type { CompaniesResponse, IPO, Document } from '@/types/api-types'
  ```

### 4. API Client Library (8.8 KB)
- **File:** `src/lib/api-client.ts`
- **Features:**
  - Lightweight HTTP client
  - Built-in error handling
  - Token management
  - Timeout support
  - FormData support for uploads
  - Typed methods for all endpoints
- **Usage:**
  ```typescript
  import { apiClient } from '@/lib/api-client'
  
  const companies = await apiClient.getCompanies({ sector: 'Technology' })
  const documents = await apiClient.getDocuments({ companyId: 'uuid' })
  await apiClient.uploadDocuments(docId, files)
  ```

### 5. Postman Collection (11 KB)
- **File:** `public/ipoready-api.postman_collection.json`
- **Contents:**
  - All 10 endpoints pre-configured
  - Example requests for each endpoint
  - Variable placeholders (base_url, token)
  - Documentation for each request
  - Easy setup instructions

### 6. Documentation (19 KB)
- **API_DOCUMENTATION.md** - Comprehensive guide with:
  - Authentication details
  - Rate limiting info
  - Complete endpoint documentation
  - Error handling guide
  - Best practices
  - SDK examples
  - cURL examples
  - Changelog

- **API_QUICK_REFERENCE.md** - Quick lookup with:
  - All endpoints in tabular format
  - Query parameters
  - Example requests
  - Common patterns
  - cURL examples
  - Postman setup

## Deployment Steps

### Step 1: Verify Package Dependencies

The Swagger UI requires `swagger-ui-react`. Ensure it's installed:

```bash
npm list swagger-ui-react
```

If not installed:
```bash
npm install swagger-ui-react
```

### Step 2: Start the Development Server

```bash
npm run dev
```

The API documentation will be available at:
- Interactive Docs: `http://localhost:3000/api-docs`
- OpenAPI Spec: `http://localhost:3000/openapi.yaml`

### Step 3: Test an Endpoint

Open your browser and navigate to: `http://localhost:3000/api-docs`

You should see:
- List of all API endpoints grouped by category
- Parameter descriptions and examples
- Live request/response interface
- Authentication setup

### Step 4: Production Deployment

For production, no additional setup is required. The files are already in place:

1. **OpenAPI Spec:** Served from `public/openapi.yaml`
2. **Swagger UI:** Served from route `/api-docs`
3. **API Client:** Available for npm package distribution

Update your environment:
```bash
# Production
BASE_URL=https://api.ipoready.com

# Development
BASE_URL=http://localhost:3000
```

## Using the API Documentation

### Method 1: Interactive Swagger UI

Best for exploring endpoints and testing

```
GET http://localhost:3000/api-docs
```

Features:
- Try-it-out buttons for each endpoint
- Real-time parameter validation
- Live response viewers
- Authentication management

### Method 2: Import into Postman

Best for team collaboration and automation

1. Open Postman
2. Click "Import"
3. Select "Link" tab
4. Paste: `http://localhost:3000/public/ipoready-api.postman_collection.json`
5. Set variables: `base_url` and `token`
6. Run requests

### Method 3: Read Documentation

Best for understanding details

- `API_DOCUMENTATION.md` - Full reference
- `API_QUICK_REFERENCE.md` - Quick lookup
- `src/types/api-types.ts` - Type definitions

### Method 4: Use TypeScript Client

Best for frontend integration

```typescript
import { apiClient } from '@/lib/api-client'

// Authenticate
apiClient.setToken(sessionToken)

// Make requests
const companies = await apiClient.getCompanies()
```

## API Endpoint Overview

### Capital Markets (Public)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/capital-markets/companies` | GET | List companies |
| `/api/capital-markets/ipos` | GET | Get IPO listings |
| `/api/capital-markets/dashboard` | GET | Company dashboard |

### Documents (Authenticated)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/documents/list` | GET | List documents |
| `/api/documents/upload` | POST | Upload documents |
| `/api/documents/delete` | DELETE | Delete document |

### Admin (Authenticated + Admin)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/ingest-sec-filings` | POST/GET | SEC ingestion |
| `/api/admin/deploy-documents` | POST | Deploy system |

### Dashboard (Authenticated)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/dashboard` | GET | Company dashboard |

## Testing the APIs

### Quick Test Commands

```bash
# List companies (public)
curl http://localhost:3000/api/capital-markets/companies

# Get IPOs (public)
curl http://localhost:3000/api/capital-markets/ipos

# List documents (authenticated)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/documents/list?companyId=UUID"

# Get dashboard (authenticated)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/dashboard
```

### JavaScript Test

```typescript
import { apiClient } from '@/lib/api-client'

async function testApi() {
  // Set token
  apiClient.setToken('YOUR_SESSION_TOKEN')
  
  // Test public endpoint
  const companies = await apiClient.getCompanies({ limit: 10 })
  console.log('Companies:', companies)
  
  // Test authenticated endpoint
  const dashboard = await apiClient.getDashboard()
  console.log('Dashboard:', dashboard)
}

testApi().catch(console.error)
```

## Integration Examples

### React Component

```typescript
'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api-client'
import type { CompaniesResponse } from '@/types/api-types'

export function CompanyList() {
  const [companies, setCompanies] = useState<CompaniesResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    apiClient
      .getCompanies({ sector: 'Technology', limit: 20 })
      .then(setCompanies)
      .catch((err) => setError(err.error))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!companies) return <div>No data</div>

  return (
    <ul>
      {companies.companies.map((company) => (
        <li key={company.id}>{company.name} ({company.ticker})</li>
      ))}
    </ul>
  )
}
```

### Next.js Server Action

```typescript
'use server'

import { apiClient } from '@/lib/api-client'
import { getServerSession } from 'next-auth'

export async function loadDashboard() {
  const session = await getServerSession()
  
  if (!session?.user?.token) {
    throw new Error('Not authenticated')
  }

  apiClient.setToken(session.user.token)
  return apiClient.getDashboard()
}
```

## Documentation File Structure

```
IPOReady/
├── public/
│   ├── openapi.yaml                              # OpenAPI spec
│   └── ipoready-api.postman_collection.json      # Postman collection
├── src/
│   ├── app/
│   │   └── api-docs/
│   │       ├── page.tsx                          # Swagger UI page
│   │       └── layout.tsx                        # Layout wrapper
│   ├── lib/
│   │   └── api-client.ts                         # TypeScript client
│   └── types/
│       └── api-types.ts                          # Type definitions
├── API_DOCUMENTATION.md                          # Full documentation
├── API_QUICK_REFERENCE.md                        # Quick reference
└── API_SETUP_GUIDE.md                            # This file
```

## Troubleshooting

### Swagger UI Not Loading

**Issue:** `/api-docs` returns blank page

**Solution:**
1. Ensure `swagger-ui-react` is installed: `npm install swagger-ui-react`
2. Check that `public/openapi.yaml` exists
3. Clear browser cache and reload
4. Check browser console for errors

### OpenAPI Spec Not Found

**Issue:** Cannot access `openapi.yaml`

**Solution:**
1. Verify file exists: `ls public/openapi.yaml`
2. Restart dev server: `npm run dev`
3. Check file permissions

### Type Errors with API Client

**Issue:** TypeScript compilation errors

**Solution:**
1. Rebuild types: `npm run build`
2. Clear `.next` cache: `rm -rf .next`
3. Ensure `tsconfig.json` includes `src` directory

### CORS Issues with Postman

**Issue:** Postman requests fail with CORS error

**Solution:**
1. In Postman settings, disable SSL certificate verification
2. Set correct `base_url` variable
3. Include `Authorization: Bearer TOKEN` header

## Next Steps

### 1. Publish API Documentation

To make documentation publicly available:

```bash
# Build and deploy
npm run build
npm run start

# Documentation will be live at:
# https://api.ipoready.com/api-docs
# https://api.ipoready.com/openapi.yaml
```

### 2. Share with Team

- **Swagger UI:** `https://api.ipoready.com/api-docs`
- **Postman:** Import collection link
- **Documentation:** Share `API_DOCUMENTATION.md` and `API_QUICK_REFERENCE.md`

### 3. Add to Developer Portal

Integrate documentation into your developer portal:

```html
<iframe src="https://api.ipoready.com/api-docs" 
        style="width: 100%; height: 100vh; border: none;"></iframe>
```

### 4. Generate SDK from OpenAPI

Use OpenAPI Generator to create SDKs:

```bash
# Generate Python SDK
openapi-generator-cli generate \
  -i https://api.ipoready.com/openapi.yaml \
  -g python \
  -o sdk/python

# Generate Node.js SDK
openapi-generator-cli generate \
  -i https://api.ipoready.com/openapi.yaml \
  -g typescript-axios \
  -o sdk/node
```

## Performance & Caching

API endpoints have optimized caching:

| Endpoint | Cache | Stale |
|----------|-------|-------|
| Companies | 10 min | 30 min |
| IPOs | 5 min | 10 min |
| Dashboard | 5 min | 10 min |
| Documents | None | - |

## Security

### Authentication

All endpoints except public ones require:

```
Authorization: Bearer <JWT_TOKEN>
```

### Rate Limiting

- Standard: 100 req/min
- Bulk: 10 req/min
- Admin: 50 req/min

### HTTPS

All production APIs use HTTPS (TLS 1.2+)

## Support & Feedback

- **Questions:** support@ipoready.com
- **Issues:** GitHub Issues
- **Feedback:** feedback@ipoready.com
- **Status:** https://ipoready.com/status

## Version History

### v1.0.0 (June 7, 2024)

**Initial Release**
- Capital Markets endpoints (3)
- Document Management (3)
- Admin Operations (3)
- Dashboard (1)
- OpenAPI spec
- Swagger UI
- TypeScript client
- Postman collection
- Complete documentation

**Future Roadmap:**
- GraphQL endpoint
- WebSocket support for real-time updates
- Additional SDKs (Python, Ruby, Go)
- Rate limit webhooks
- API analytics dashboard

---

## Quick Start Checklist

- [ ] Read `API_QUICK_REFERENCE.md`
- [ ] Visit `http://localhost:3000/api-docs`
- [ ] Test 2-3 endpoints
- [ ] Import Postman collection
- [ ] Try TypeScript client
- [ ] Read full `API_DOCUMENTATION.md`
- [ ] Share with team
- [ ] Deploy to production

**Need help?** See `API_DOCUMENTATION.md` for detailed information.
