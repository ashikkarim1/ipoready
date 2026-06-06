# IPOReady API Documentation Index

## Overview

Complete OpenAPI/Swagger documentation for all IPOReady APIs with interactive exploration, TypeScript types, client library, and Postman collection.

**Generated:** June 7, 2024  
**API Version:** 1.0.0  
**Status:** Production Ready

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Documentation Files](#documentation-files)
3. [Generated Artifacts](#generated-artifacts)
4. [API Endpoints](#api-endpoints)
5. [How to Use](#how-to-use)
6. [Support](#support)

---

## Quick Start

### Access API Documentation

**Interactive Swagger UI:**
```
GET /api-docs
```
Navigate to `http://localhost:3000/api-docs` in your browser for live API exploration and testing.

**OpenAPI Specification:**
```
GET /openapi.yaml
```
Raw OpenAPI 3.0.0 specification in YAML format.

### Use TypeScript Client

```typescript
import { apiClient } from '@/lib/api-client'

// Authenticate
apiClient.setToken(sessionToken)

// Make requests
const companies = await apiClient.getCompanies({ sector: 'Technology' })
const documents = await apiClient.getDocuments({ companyId: 'uuid' })
const dashboard = await apiClient.getDashboard()
```

### Import into Postman

File > Import > Link:
```
public/ipoready-api.postman_collection.json
```

### Read Documentation

1. **Full Reference:** `API_DOCUMENTATION.md`
2. **Quick Lookup:** `API_QUICK_REFERENCE.md`
3. **Deployment:** `API_SETUP_GUIDE.md`

---

## Documentation Files

### Core Documentation

| File | Purpose | Audience |
|------|---------|----------|
| `API_DOCUMENTATION.md` | Complete reference with examples | Developers, API users |
| `API_QUICK_REFERENCE.md` | Quick lookup tables and patterns | Developers, DevOps |
| `API_SETUP_GUIDE.md` | Deployment and configuration | DevOps, SREs |
| `API_INDEX.md` | This file - navigation guide | Everyone |

### Technical Files

| File | Purpose | Use |
|------|---------|-----|
| `public/openapi.yaml` | OpenAPI 3.0.0 specification | Import to tools, generate SDKs |
| `src/app/api-docs/page.tsx` | Swagger UI page | Serves /api-docs |
| `src/app/api-docs/layout.tsx` | Swagger UI layout | Page layout |
| `src/lib/api-client.ts` | TypeScript HTTP client | Frontend/SDK integration |
| `src/types/api-types.ts` | TypeScript type definitions | Type safety |
| `public/ipoready-api.postman_collection.json` | Postman collection | Testing & team collaboration |

---

## Generated Artifacts

### 1. OpenAPI Specification (35 KB)

**File:** `public/openapi.yaml`

Complete OpenAPI 3.0.0 specification covering:
- 10 API endpoints
- 4 endpoint groups (Capital Markets, Documents, Admin, Dashboard)
- Authentication schemes (Bearer JWT)
- Request/response schemas
- Error definitions
- Rate limiting specs
- Caching directives

**Used by:**
- Swagger UI
- API documentation tools
- SDK generators
- Client libraries

### 2. Swagger UI (Interactive Docs)

**Route:** `GET /api-docs`

Interactive API explorer with:
- Live request/response testing
- Parameter validation
- Authentication management
- Beautiful responsive UI
- Mobile optimization
- Schema visualization

**Files:**
- `src/app/api-docs/page.tsx` (UI component)
- `src/app/api-docs/layout.tsx` (layout)

### 3. TypeScript Types (8.4 KB)

**File:** `src/types/api-types.ts`

Complete type definitions:
- Request/response interfaces
- Query parameter types
- Error types
- Data model types
- Client configuration
- HTTP methods

**Import:**
```typescript
import type { CompaniesResponse, IPO, Document } from '@/types/api-types'
```

### 4. API Client Library (8.8 KB)

**File:** `src/lib/api-client.ts`

Lightweight HTTP client with:
- Typed methods for all endpoints
- Token management
- Error handling
- FormData support
- Timeout handling
- React hook support

**Export:**
```typescript
export class IpoReadyApiClient { ... }
export const apiClient = new IpoReadyApiClient()
export function createApiClient(config) { ... }
export function useApiClient(token) { ... }
```

### 5. Postman Collection (11 KB)

**File:** `public/ipoready-api.postman_collection.json`

Pre-configured Postman collection with:
- All 10 endpoints
- Example requests
- Variable placeholders
- Documentation
- Setup instructions

**Variables:**
- `base_url` - API base URL
- `token` - Authentication token

---

## API Endpoints

### Capital Markets (Public)

3 endpoints for market data and analysis:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/capital-markets/companies` | GET | List companies with filtering |
| `/api/capital-markets/ipos` | GET | Get IPO listings with performance |
| `/api/capital-markets/dashboard` | GET | Company capital markets view |

**Auth:** None required

**Caching:**
- Companies: 10 min cache
- IPOs: 5 min cache
- Dashboard: 5 min cache

### Documents (Authenticated)

3 endpoints for document management:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/documents/list` | GET | List company documents |
| `/api/documents/upload` | POST | Upload documents |
| `/api/documents/delete` | DELETE | Delete document file |

**Auth:** JWT token required

**Features:**
- Multiple file upload
- Category filtering
- Version tracking
- Duplicate prevention

### Admin (Authenticated + Admin Role)

3 endpoints for administrative operations:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/ingest-sec-filings` | POST | Trigger SEC filing ingestion |
| `/api/admin/ingest-sec-filings` | GET | Get ingestion status |
| `/api/admin/deploy-documents` | POST | Deploy document system |

**Auth:** JWT token + admin role required

**Features:**
- Batch operations
- Status tracking
- Error reporting
- System deployment

### Dashboard (Authenticated)

1 endpoint for user dashboard:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/dashboard` | GET | Get company dashboard |

**Auth:** JWT token required

**Returns:**
- Company information
- Task summary
- Phase progress
- Upcoming tasks
- Recent activity

---

## How to Use

### For Frontend Development

1. **Install dependencies:**
   ```bash
   npm install swagger-ui-react
   ```

2. **Use API client:**
   ```typescript
   import { apiClient } from '@/lib/api-client'
   
   apiClient.setToken(sessionToken)
   const data = await apiClient.getCompanies()
   ```

3. **Use types:**
   ```typescript
   import type { CompaniesResponse } from '@/types/api-types'
   ```

### For Testing

1. **Open Swagger UI:**
   ```
   http://localhost:3000/api-docs
   ```

2. **Use Postman:**
   - Import collection
   - Set `base_url` and `token`
   - Execute requests

3. **Use cURL:**
   ```bash
   curl http://localhost:3000/api/capital-markets/companies
   ```

### For Deployment

1. **Read setup guide:**
   ```
   API_SETUP_GUIDE.md
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build and deploy:**
   ```bash
   npm run build
   npm run start
   ```

4. **Verify endpoints:**
   - Check `/api-docs` accessible
   - Check `openapi.yaml` accessible
   - Test authentication

### For Documentation

1. **Quick reference:**
   ```
   API_QUICK_REFERENCE.md
   ```

2. **Full documentation:**
   ```
   API_DOCUMENTATION.md
   ```

3. **Type definitions:**
   ```
   src/types/api-types.ts
   ```

---

## Authentication

### JWT Token

All authenticated endpoints require:

```
Authorization: Bearer YOUR_SESSION_TOKEN
```

**Token Details:**
- Issued by NextAuth
- Expires after 30 days
- Included in session
- Passed via header

### Public Endpoints

No authentication needed for:
- `/api/capital-markets/companies`
- `/api/capital-markets/ipos`
- `/api/capital-markets/dashboard`

### Admin Endpoints

Requires admin role in addition to valid token:
- `/api/admin/ingest-sec-filings`
- `/api/admin/deploy-documents`

---

## Rate Limiting

| Category | Limit | Window |
|----------|-------|--------|
| Standard | 100 | per minute |
| Bulk | 10 | per minute |
| Admin | 50 | per minute |

**Headers:**
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

**On limit:** HTTP 429 with `Retry-After` header

---

## File Structure

```
IPOReady/
├── public/
│   ├── openapi.yaml                         (35 KB)
│   └── ipoready-api.postman_collection.json (11 KB)
├── src/
│   ├── app/
│   │   └── api-docs/
│   │       ├── page.tsx                     (6.5 KB)
│   │       └── layout.tsx                   (0.5 KB)
│   ├── lib/
│   │   └── api-client.ts                    (8.8 KB)
│   └── types/
│       └── api-types.ts                     (8.4 KB)
├── API_DOCUMENTATION.md                     (19 KB)
├── API_QUICK_REFERENCE.md                   (8 KB)
├── API_SETUP_GUIDE.md                       (10 KB)
└── API_INDEX.md                             (this file)
```

**Total:** ~97 KB of documentation and code

---

## Quick Links

### Documentation
- [Full API Reference](API_DOCUMENTATION.md)
- [Quick Reference](API_QUICK_REFERENCE.md)
- [Setup Guide](API_SETUP_GUIDE.md)
- [This Index](API_INDEX.md)

### Interactive
- [Swagger UI](/api-docs)
- [OpenAPI Spec](/openapi.yaml)

### Code
- [API Client](src/lib/api-client.ts)
- [Type Definitions](src/types/api-types.ts)
- [Swagger Page](src/app/api-docs/page.tsx)

### Tools
- [Postman Collection](public/ipoready-api.postman_collection.json)

---

## Support & Feedback

### Getting Help

- **Documentation:** See files above
- **Interactive Docs:** `/api-docs`
- **Email:** support@ipoready.com
- **Status:** https://ipoready.com/status

### Reporting Issues

- **Bug Reports:** GitHub Issues
- **Feedback:** feedback@ipoready.com
- **Feature Requests:** GitHub Discussions

---

## Version Information

**API Version:** 1.0.0  
**OpenAPI Version:** 3.0.0  
**Generated:** June 7, 2024  
**Status:** Production Ready  

### Included Features
- 10 fully documented endpoints
- 4 endpoint groups
- Request/response examples
- Error specifications
- Rate limiting info
- Authentication details
- TypeScript types
- API client library
- Postman collection
- Interactive Swagger UI

### Next Release (Future)
- GraphQL endpoint
- WebSocket support
- Additional SDKs (Python, Ruby, Go)
- Rate limit webhooks
- Analytics dashboard

---

## Deployment Checklist

Before deploying to production:

- [ ] Read `API_SETUP_GUIDE.md`
- [ ] Install dependencies: `npm install swagger-ui-react`
- [ ] Test all endpoints
- [ ] Verify authentication
- [ ] Check rate limiting
- [ ] Test file uploads
- [ ] Review error responses
- [ ] Test with Postman
- [ ] Build project: `npm run build`
- [ ] Start server: `npm run start`
- [ ] Verify `/api-docs` accessible
- [ ] Verify `openapi.yaml` accessible
- [ ] Configure CORS if needed
- [ ] Set up monitoring
- [ ] Share documentation with team

---

## Quick Commands

```bash
# Start development
npm run dev

# View documentation
open http://localhost:3000/api-docs

# Get OpenAPI spec
curl http://localhost:3000/openapi.yaml

# Test an endpoint
curl http://localhost:3000/api/capital-markets/companies

# Build for production
npm run build

# Start production server
npm run start
```

---

## API Usage Examples

### Get Companies
```bash
curl http://localhost:3000/api/capital-markets/companies?sector=Technology&limit=20
```

### Get IPOs
```bash
curl "http://localhost:3000/api/capital-markets/ipos?status=listed&days=90"
```

### List Documents (Auth Required)
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/api/documents/list?companyId=UUID"
```

### Upload Documents (Auth Required)
```bash
curl -X POST \
  -H "Authorization: Bearer TOKEN" \
  -F "documentId=UUID" \
  -F "files=@document.pdf" \
  http://localhost:3000/api/documents/upload
```

---

## Troubleshooting

**Swagger UI not loading?**
- Install `swagger-ui-react`: `npm install swagger-ui-react`
- Restart dev server
- Check browser console for errors

**OpenAPI spec not found?**
- Verify `public/openapi.yaml` exists
- Check file permissions
- Restart dev server

**Authentication not working?**
- Ensure token is set correctly
- Check token hasn't expired
- Verify `Authorization` header format

**Rate limiting?**
- Check `X-RateLimit-Remaining` header
- Wait until `X-RateLimit-Reset` time
- Use backoff strategy

---

## Related Documents

- **Project Overview:** `/docs/project_overview.md`
- **Tech Stack:** `/docs/tech_stack.md`
- **Database Schema:** `/docs/database_schema.md`
- **Security:** `/docs/security.md`

---

**Last Updated:** June 7, 2024  
**Status:** Production Ready  
**Maintained By:** Development Team
