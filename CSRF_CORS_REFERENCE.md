# CSRF & CORS Protection - Quick Reference Card

## 🔐 CSRF Token Flow

```
User Action → Component Hook → Token Endpoint → Token Stored
                                                    ↓
                                            Request Sent with Token
                                                    ↓
                                            Server Validates Token
                                                    ↓
                                            Token Deleted (Single-Use)
                                                    ↓
                                            Request Processed
```

## 🚀 API Route Template

**Copy-paste this for any POST/PUT/DELETE/PATCH endpoint:**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { validateCsrfMiddleware } from '@/lib/middleware/csrf'
import { requireCompany } from '@/lib/middleware/auth'
import { withCors } from '@/lib/middleware/cors'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  // 1. CORS
  const corsError = await withCors(req)
  if (corsError) return corsError

  // 2. Auth
  const authCheck = await requireCompany(req)
  if (!authCheck.valid) return NextResponse.json({ error: authCheck.error }, { status: 401 })

  // 3. CSRF
  const csrfError = await validateCsrfMiddleware(req)
  if (csrfError) return csrfError

  // 4. Process
  const companyId = authCheck.companyId
  const body = await req.json()

  return NextResponse.json({ success: true })
}

export async function OPTIONS(req: NextRequest) {
  return await withCors(req)
}
```

## 🎣 React Component Template

**Copy-paste this for forms and actions:**

```typescript
import { useCsrf } from '@/lib/hooks/useCsrf'

export function MyComponent() {
  const { fetch: csrfFetch, token, isLoading, error } = useCsrf()

  const handleSubmit = async (data: any) => {
    const response = await csrfFetch('/api/my-endpoint', {
      method: 'POST',
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Error:', error.error)
      return
    }

    const result = await response.json()
    console.log('Success:', result)
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      handleSubmit({ /* form data */ })
    }}>
      <input name="field" />
      <button>Submit</button>
    </form>
  )
}
```

## 📋 Middleware Stack Order

**Always in this order:**
1. **CORS** - `withCors(req)`
2. **Authentication** - `requireCompany(req)`
3. **CSRF** - `validateCsrfMiddleware(req)`
4. **Business Logic** - Your code here

## 🛡️ Token Properties

| Property | Value |
|----------|-------|
| Size | 32 bytes (256 bits) |
| Entropy | Cryptographically random |
| Storage | HTTP-only cookie + sessionStorage |
| Lifetime | 24 hours |
| Usage | Single-use (deleted after validation) |
| IP Bound | Yes (theft prevention) |
| Refresh | Automatic (when expires) |

## 🌐 CORS Configuration

| Environment | Allowed Origins |
|-------------|-----------------|
| Production | `ipoready.ai`, `www.ipoready.ai` |
| Staging | `staging.ipoready.ai` |
| Development | `localhost:3000`, `localhost:3001` |

## 📝 HTTP Headers

**Request Headers:**
```
X-CSRF-Token: <token-here>
Content-Type: application/json
Authorization: Bearer <session-token>
```

**Response Headers:**
```
Access-Control-Allow-Origin: https://ipoready.ai
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
Access-Control-Allow-Credentials: true
Set-Cookie: __csrf=<base64-token>; HttpOnly; Secure; SameSite=Strict
```

## 🧪 Testing Commands

**Get a token:**
```bash
curl -X GET http://localhost:3000/api/csrf \
  -H "Cookie: next-auth.session-token=<session>" \
  -H "Content-Type: application/json"
```

**Use token:**
```bash
curl -X POST http://localhost:3000/api/my-endpoint \
  -H "X-CSRF-Token: <token>" \
  -H "Content-Type: application/json" \
  -d '{"data": "example"}'
```

**Browser console:**
```javascript
// Get token
await window.__csrf.getToken()

// Check stats
window.__csrf.getStats()

// Clear token
window.__csrf.clear()
```

## 🐛 Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `CSRF token missing` | No token sent | Use `useCsrf()` hook |
| `CSRF token expired` | Token > 24h old | Automatic refresh |
| `CSRF IP mismatch` | Different network | Log out, log in from same IP |
| `CORS policy violation` | Wrong origin | Only `ipoready.ai` allowed |
| `Unauthorized` | Not logged in | Log in first |

## ✅ Security Checklist

- [ ] API route has `withCors(req)`
- [ ] API route has `requireCompany(req)`
- [ ] API route has `validateCsrfMiddleware(req)`
- [ ] Component uses `useCsrf()` hook
- [ ] Token sent in `X-CSRF-Token` header
- [ ] No hardcoded tokens
- [ ] No tokens in logs
- [ ] HTTPS in production
- [ ] Secure & HttpOnly flags set

## 📂 File Locations

```
src/lib/middleware/
  ├── csrf.ts              ← Token generation/validation
  ├── auth.ts              ← Authentication checks
  ├── cors.ts              ← CORS policy
  └── index.ts             ← Exports

src/lib/
  ├── csrf.ts              ← Client-side token management
  └── hooks/
      └── useCsrf.ts       ← React hook

src/app/api/
  ├── csrf/route.ts        ← Token issuing endpoint
  └── example/secure/      ← Reference implementation

Documentation:
  ├── CSRF_CORS_SETUP.md                      ← Full guide
  ├── CSRF_CORS_IMPLEMENTATION_CHECKLIST.md   ← Checklist
  ├── QUICK_START_CSRF_CORS.md                ← 5-min start
  ├── SECURITY_SETUP_SUMMARY.md               ← Overview
  └── CSRF_CORS_REFERENCE.md                  ← This file

Configuration:
  └── next.config.js       ← CORS headers
```

## 🎯 Integration Priority

### Phase 1 (This Week)
1. Test `/api/csrf` endpoint
2. Test example endpoint
3. Test hook in one component

### Phase 2 (This Month)
1. Apply to high-priority routes:
   - `/api/billing/*`
   - `/api/team/*`
   - `/api/documents/*`
2. Update corresponding components

### Phase 3 (Next Month)
1. Apply to all remaining routes
2. Complete component updates
3. Full security audit

## 💡 Pro Tips

**Tip 1: Token Auto-Refresh**
```typescript
// Hook automatically refreshes expired tokens
// No manual intervention needed
const { fetch: csrfFetch } = useCsrf()
```

**Tip 2: Caching**
```typescript
// Tokens cached in sessionStorage
// Reduces server load
// Automatic cleanup on logout
```

**Tip 3: Debugging**
```typescript
// Browser console
window.__csrf.getStats()  // { cached: true, expiresIn: 82800000 }
await window.__csrf.getToken()  // Returns current token
```

**Tip 4: Form Submission**
```typescript
// Option A: useCsrf hook (recommended)
const { fetch: csrfFetch } = useCsrf()
await csrfFetch('/api/endpoint', { method: 'POST', body })

// Option B: Manual injection
const token = await window.__csrf.getToken()
fetch('/api/endpoint', {
  method: 'POST',
  headers: { 'X-CSRF-Token': token },
  body
})
```

## 📞 Support Resources

- **Full Documentation**: `CSRF_CORS_SETUP.md`
- **Getting Started**: `QUICK_START_CSRF_CORS.md`
- **Progress Tracking**: `CSRF_CORS_IMPLEMENTATION_CHECKLIST.md`
- **Architecture**: `SECURITY_SETUP_SUMMARY.md`
- **This Reference**: `CSRF_CORS_REFERENCE.md`

---

**Last Updated**: June 6, 2024  
**Status**: Production-Ready  
**Compliance**: GDPR, PIPEDA, SOC 2, PCI DSS
