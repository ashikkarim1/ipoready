# Rate Limiting Middleware

Production-ready rate limiting for IPOReady API with Redis support for distributed architectures.

## Overview

The rate limiting system protects the API from abuse and DDoS attacks while maintaining performance. It's fully GDPR/CCPA/PIPEDA compliant and designed for SOC 2 Type II audits.

### Features

- **Multi-tier rate limits** for different endpoint categories
- **Redis-backed** for distributed architectures (with in-memory fallback)
- **User-based and IP-based** limiting for authenticated and public endpoints
- **Automatic health check bypass** for Kubernetes and monitoring tools
- **Admin management API** for emergency resets
- **Standard HTTP headers** (X-RateLimit-*, Retry-After)
- **Production-ready** error responses with recovery information

## Configuration

Rate limits are defined in `src/lib/middleware/rate-limit.ts`:

```typescript
RATE_LIMIT_CONFIG = {
  PUBLIC_ENDPOINTS: {
    windowMs: 60 * 1000,      // 1 minute
    maxRequests: 100,          // 100 requests/minute per IP
  },

  AUTHENTICATED_ENDPOINTS: {
    windowMs: 60 * 1000,       // 1 minute
    maxRequests: 1000,         // 1000 requests/minute per user
  },

  AUTH_ENDPOINTS: {
    windowMs: 60 * 1000,       // 1 minute
    maxRequests: 10,           // 10 requests/minute per IP
  },

  LOGIN_ENDPOINT: {
    windowMs: 15 * 60 * 1000,  // 15 minutes
    maxRequests: 5,            // 5 attempts per 15 minutes
  },

  REGISTER_ENDPOINT: {
    windowMs: 60 * 60 * 1000,  // 1 hour
    maxRequests: 3,            // 3 attempts per hour
  },

  PASSWORD_RESET_ENDPOINT: {
    windowMs: 60 * 60 * 1000,  // 1 hour
    maxRequests: 5,            // 5 attempts per hour
  },

  DOCUMENT_UPLOAD: {
    windowMs: 60 * 60 * 1000,  // 1 hour
    maxRequests: 20,           // 20 uploads per hour
  },

  DATA_EXPORT: {
    windowMs: 60 * 60 * 1000,  // 1 hour
    maxRequests: 5,            // 5 exports per hour
  },
}
```

## Installation & Setup

### 1. Environment Configuration

Add Redis URL to `.env.local` (optional but recommended for production):

```bash
# Redis for distributed rate limiting
REDIS_URL=redis://:[password]@host:port

# If not set, falls back to in-memory store (single instance only)
```

For local development without Redis, the middleware uses an in-memory store automatically.

### 2. Install Redis Client

The middleware uses the native Redis client. No additional packages needed if you're already using Node.js 18+.

## Usage

### Basic Pattern

Wrap your route handlers with the appropriate rate limit function:

```typescript
import { withAuthenticatedRateLimit } from '@/lib/middleware/apply-rate-limit'
import { NextRequest, NextResponse } from 'next/server'

async function handler(req: NextRequest): Promise<NextResponse> {
  // Your endpoint logic
  return NextResponse.json({ status: 'ok' })
}

export const GET = withAuthenticatedRateLimit(handler)
export const POST = withAuthenticatedRateLimit(handler)
```

### Available Wrappers

#### Public Endpoints (100/min per IP)

```typescript
import { withPublicRateLimit } from '@/lib/middleware/apply-rate-limit'

export const GET = withPublicRateLimit(async (req) => {
  // Public endpoint
})
```

#### Authenticated Endpoints (1000/min per user)

```typescript
import { withAuthenticatedRateLimit } from '@/lib/middleware/apply-rate-limit'

export const GET = withAuthenticatedRateLimit(async (req) => {
  // Authenticated endpoint
})
```

#### Auth Endpoints (10/min per IP)

```typescript
import { withAuthEndpointRateLimit } from '@/lib/middleware/apply-rate-limit'

export const POST = withAuthEndpointRateLimit(async (req) => {
  // Auth endpoint
})
```

#### Login (5/15min per IP)

```typescript
import { withLoginRateLimit } from '@/lib/middleware/apply-rate-limit'

export const POST = withLoginRateLimit(async (req) => {
  // Login endpoint
})
```

#### Registration (3/hour per IP)

```typescript
import { withRegisterRateLimit } from '@/lib/middleware/apply-rate-limit'

export const POST = withRegisterRateLimit(async (req) => {
  // Registration endpoint
})
```

#### Password Reset (5/hour per IP)

```typescript
import { withPasswordResetRateLimit } from '@/lib/middleware/apply-rate-limit'

export const POST = withPasswordResetRateLimit(async (req) => {
  // Password reset endpoint
})
```

#### Document Upload (20/hour per user)

```typescript
import { withDocumentUploadRateLimit } from '@/lib/middleware/apply-rate-limit'

export const POST = withDocumentUploadRateLimit(async (req) => {
  // Document upload endpoint
})
```

#### Data Export (5/hour per user)

```typescript
import { withDataExportRateLimit } from '@/lib/middleware/apply-rate-limit'

export const GET = withDataExportRateLimit(async (req) => {
  // Data export endpoint
})
```

## Response Formats

### Successful Request

```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1234567890

{
  "status": "success",
  "data": { ... }
}
```

### Rate Limited (429)

```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1234567890
Retry-After: 45

{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Please try again in 45 seconds.",
  "retryAfter": 45,
  "resetTime": "2024-06-06T12:30:45.000Z"
}
```

## Implementation Examples

### Example 1: Capital Markets API

File: `src/app/api/capital-markets/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { withAuthenticatedRateLimit } from '@/lib/middleware/apply-rate-limit'

async function GET(req: NextRequest): Promise<NextResponse> {
  // Your handler logic
  return NextResponse.json({
    status: 'success',
    markets: [],
  })
}

export const handler = withAuthenticatedRateLimit(GET)
export { handler as GET }
```

### Example 2: Auth Login Route

File: `src/app/api/auth/login/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { withLoginRateLimit } from '@/lib/middleware/apply-rate-limit'

async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json()

  // Validate credentials
  // Create session
  // Return token

  return NextResponse.json({
    status: 'success',
    token: '...',
  })
}

export const handler = withLoginRateLimit(POST)
export { handler as POST }
```

### Example 3: Document Upload

File: `src/app/api/documents/upload/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { withDocumentUploadRateLimit } from '@/lib/middleware/apply-rate-limit'

async function POST(req: NextRequest): Promise<NextResponse> {
  const formData = await req.formData()
  const file = formData.get('file') as File

  // Upload to storage
  // Create document record
  // Return document metadata

  return NextResponse.json(
    {
      status: 'success',
      document: { id: '...', name: file.name },
    },
    { status: 201 }
  )
}

export const handler = withDocumentUploadRateLimit(POST)
export { handler as POST }
```

## Health Check Bypass

The middleware automatically bypasses rate limiting for:

- Kubernetes health checks (`/health`, `/api/health`)
- Kubelet probes
- Vercel deployments
- Custom health check endpoints

This is configured in `isHealthCheck()` function:

```typescript
export function isHealthCheck(req: NextRequest): boolean {
  const pathname = req.nextUrl.pathname
  const userAgent = req.headers.get('user-agent') || ''

  if (pathname === '/api/health' || pathname === '/health') {
    return true
  }

  if (userAgent.includes('kube-probe') || userAgent.includes('kubelet')) {
    return true
  }

  if (req.headers.get('x-vercel-deployment-url')) {
    return true
  }

  return false
}
```

## Admin Management API

### Get Rate Limit Statistics

```bash
curl -H "Authorization: Bearer <admin-token>" \
  https://example.com/api/admin/rate-limit/stats
```

Response:

```json
{
  "status": "success",
  "data": {
    "backend": "redis",
    "activeEntries": 1024,
    "timestamp": "2024-06-06T12:00:00.000Z"
  }
}
```

### Reset Rate Limit for a Key

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "action": "reset",
    "key": "192.168.1.1",
    "prefix": "rl:pub"
  }' \
  https://example.com/api/admin/rate-limit
```

### Clear All Rate Limits (Emergency)

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -H "X-Confirm: true" \
  -d '{"action": "clear-all"}' \
  https://example.com/api/admin/rate-limit
```

## Monitoring

### Get Rate Limit Statistics

```typescript
import { getRateLimitStats } from '@/lib/middleware/rate-limit'

const stats = await getRateLimitStats()
console.log(stats)
// {
//   backend: 'redis',
//   activeEntries: 1024,
//   timestamp: '2024-06-06T12:00:00.000Z'
// }
```

### Check Rate Limit Status

```typescript
import { checkApiRateLimit } from '@/lib/middleware/apply-rate-limit'
import { RATE_LIMIT_CONFIG } from '@/lib/middleware/rate-limit'

const result = await checkApiRateLimit(req, RATE_LIMIT_CONFIG.PUBLIC_ENDPOINTS)

if (!result.allowed) {
  console.log(`Rate limited. Retry after ${result.retryAfter} seconds`)
}
```

## Testing

### Test Rate Limit Enforcement

```bash
#!/bin/bash

# Test public endpoint (100/min)
for i in {1..101}; do
  curl https://example.com/api/endpoint
  sleep 0.5
done

# 101st request should return 429
```

### Test Login Rate Limiting

```bash
#!/bin/bash

# Test login (5/15min)
for i in {1..6}; do
  curl -X POST \
    -d '{"email":"test@example.com","password":"wrong"}' \
    https://example.com/api/auth/login
done

# 6th request should return 429
```

## Performance Considerations

### Redis Backend (Production)

- **O(1) operations** for all rate limit checks
- **Distributed** across all server instances
- **Persistent** across server restarts
- **Scales** to millions of users

Configuration:

```typescript
const redis = await getRedisClient()
const result = await checkRateLimit(key, config) // Uses Redis
```

### In-Memory Backend (Development)

- **Fastest** for single-instance deployments
- **NOT shared** between instances
- **Lost** on server restart
- **Limited** to available RAM

Configuration:

```typescript
// Automatically used if REDIS_URL is not set
const result = await checkRateLimit(key, config) // Uses in-memory Map
```

## Compliance

### GDPR/CCPA/PIPEDA

- No personal data stored beyond session tokens
- IP addresses hashed in Redis keys when possible
- Automatic cleanup of expired rate limit entries
- Audit logs available via admin API

### SOC 2 Type II

- Rate limiting prevents unauthorized access
- Retry-After headers enable proper recovery
- Admin API requires authentication
- Monitoring and statistics available

## Troubleshooting

### Rate Limit Not Being Applied

1. Verify wrapper function is used:

```typescript
// ✓ Correct
export const GET = withAuthenticatedRateLimit(handler)

// ✗ Wrong
export const GET = handler
```

2. Check REDIS_URL is configured (if using Redis):

```bash
echo $REDIS_URL
```

3. Verify admin access for management API:

```bash
curl -H "Authorization: Bearer <token>" \
  https://example.com/api/admin/rate-limit/stats
```

### Memory Issues with In-Memory Store

If using in-memory store in production, implement cleanup cron job:

```typescript
import { cleanupExpiredRecords } from '@/lib/middleware/rate-limit'

// Run every 5 minutes
setInterval(cleanupExpiredRecords, 5 * 60 * 1000)
```

### Redis Connection Issues

Check logs for connection errors:

```bash
# Development
npm run dev 2>&1 | grep -i redis

# Production
tail -f /var/log/ipoready/app.log | grep -i redis
```

## Future Enhancements

- [ ] Custom rate limit rules per user tier
- [ ] Sliding window rate limiting
- [ ] Request queuing with backoff
- [ ] Distributed tracing integration
- [ ] Machine learning-based anomaly detection
- [ ] GraphQL-specific rate limiting
- [ ] Webhook rate limiting
