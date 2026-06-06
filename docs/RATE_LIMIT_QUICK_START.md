# Rate Limiting Quick Start

Get rate limiting working in 5 minutes.

## Step 1: No Configuration Needed

The middleware works out of the box for local development:

```bash
npm run dev
# Rate limiting is active - no configuration required
```

The in-memory store handles single-instance development perfectly.

## Step 2: Wrap Your First Route

Pick any API route and wrap it:

```typescript
// src/app/api/documents/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { withAuthenticatedRateLimit } from '@/lib/middleware/apply-rate-limit'

async function GET(req: NextRequest): Promise<NextResponse> {
  // Your handler logic
  return NextResponse.json({ documents: [] })
}

export const handler = withAuthenticatedRateLimit(GET)
export { handler as GET }
```

That's it! Your route is now rate limited to 1000 requests/minute per authenticated user.

## Step 3: Test It

```bash
# Make many requests quickly
for i in {1..1001}; do
  curl http://localhost:3000/api/documents
  sleep 0.05
done

# The 1001st request should return 429:
# {
#   "error": "Too Many Requests",
#   "message": "Rate limit exceeded. Please try again in 57 seconds.",
#   "retryAfter": 57,
#   "resetTime": "2024-06-06T12:00:57.000Z"
# }
```

## Step 4: Choose Your Middleware

Pick the right wrapper for your route type:

| Wrapper | Limit | Use Case |
|---------|-------|----------|
| `withPublicRateLimit` | 100/min per IP | Public API endpoints |
| `withAuthenticatedRateLimit` | 1000/min per user | Protected API endpoints |
| `withAuthEndpointRateLimit` | 10/min per IP | Other auth endpoints |
| `withLoginRateLimit` | 5/15min per IP | Login endpoint |
| `withRegisterRateLimit` | 3/hour per IP | Registration endpoint |
| `withPasswordResetRateLimit` | 5/hour per IP | Password reset |
| `withDocumentUploadRateLimit` | 20/hour per user | File uploads |
| `withDataExportRateLimit` | 5/hour per user | Data exports |

## Step 5 (Optional): Use Redis

For production or testing distributed rate limiting:

### Local Redis

```bash
# Start Redis with Docker
docker run -d -p 6379:6379 redis:7-alpine

# Add to .env.local
echo "REDIS_URL=redis://localhost:6379" >> .env.local

# Restart your app
npm run dev
```

Check logs for:
```
Redis client connected for rate limiting
```

### Production Redis

Get a connection string from:

- **AWS ElastiCache**: Managed Redis clusters
- **UpStash**: Serverless Redis (works great with Vercel)
- **Self-hosted**: Your own Redis server

Add to environment:
```bash
REDIS_URL=redis://your-redis-connection-string
```

## Common Patterns

### Auth Routes

```typescript
// src/app/api/auth/login/route.ts
import { withLoginRateLimit } from '@/lib/middleware/apply-rate-limit'

async function POST(req: NextRequest): Promise<NextResponse> {
  const { email, password } = await req.json()
  // Login logic
  return NextResponse.json({ token: '...' })
}

export const handler = withLoginRateLimit(POST)
export { handler as POST }
```

### Document Upload

```typescript
// src/app/api/documents/upload/route.ts
import { withDocumentUploadRateLimit } from '@/lib/middleware/apply-rate-limit'

async function POST(req: NextRequest): Promise<NextResponse> {
  const formData = await req.formData()
  const file = formData.get('file') as File
  // Upload logic
  return NextResponse.json({ documentId: '...' }, { status: 201 })
}

export const handler = withDocumentUploadRateLimit(POST)
export { handler as POST }
```

### Data Export

```typescript
// src/app/api/data/export/route.ts
import { withDataExportRateLimit } from '@/lib/middleware/apply-rate-limit'

async function GET(req: NextRequest): Promise<NextResponse> {
  // Export logic
  return NextResponse.json({ url: 'download-link' })
}

export const handler = withDataExportRateLimit(GET)
export { handler as GET }
```

## Checking Status

### Get Rate Limit Statistics

```bash
# Admin only (requires system_admin role)
curl -H "Authorization: Bearer <admin-token>" \
  http://localhost:3000/api/admin/rate-limit/stats

# Response:
# {
#   "status": "success",
#   "data": {
#     "backend": "in-memory",  // or "redis"
#     "activeEntries": 42,
#     "timestamp": "2024-06-06T12:00:00.000Z"
#   }
# }
```

### Reset a User's Rate Limit

```bash
curl -X POST \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "reset",
    "key": "192.168.1.1",
    "prefix": "rl:pub"
  }' \
  http://localhost:3000/api/admin/rate-limit
```

## Response Headers

Every request includes rate limit information:

```
X-RateLimit-Limit: 1000           # Maximum requests in window
X-RateLimit-Remaining: 999        # Requests left before limit
X-RateLimit-Reset: 1717677600     # Unix timestamp when limit resets
```

When rate limited (429):

```
Retry-After: 45                    # Seconds to wait before retrying
```

## Monitoring

### Check Rate Limit Activity

```typescript
// In your application code
import { getRateLimitStats } from '@/lib/middleware/rate-limit'

const stats = await getRateLimitStats()
console.log(stats)
// { backend: 'in-memory', activeEntries: 42, timestamp: '...' }
```

### Enable Logging

Add to your route handler:

```typescript
async function GET(req: NextRequest): Promise<NextResponse> {
  const userId = await extractUserId(req)
  const ip = getClientIp(req)

  console.log(`Request from ${userId || ip} to ${req.nextUrl.pathname}`)

  // Your handler logic
}
```

## Troubleshooting

### "Rate limit not working"

Check that the wrapper is used:

```typescript
// ✓ Correct
export const GET = withAuthenticatedRateLimit(handler)

// ✗ Wrong
export const GET = handler
```

### "Requests are slow"

Use Redis instead of in-memory:

```bash
# Add to .env.local
REDIS_URL=redis://localhost:6379

# Restart app
npm run dev
```

### "Need to reset a user"

Use admin API:

```bash
curl -X POST \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"action":"reset","key":"userid123","prefix":"rl:auth"}' \
  http://localhost:3000/api/admin/rate-limit
```

## Next Steps

- Read [RATE_LIMITING.md](./RATE_LIMITING.md) for full documentation
- Read [RATE_LIMIT_SETUP.md](./RATE_LIMIT_SETUP.md) for deployment guide
- Check [examples](../src/app/api/*/rate-limit-example.ts) for more patterns
- Run tests: `npm test -- rate-limit.test.ts`

## Key Files

- **Middleware**: `src/lib/middleware/rate-limit.ts`
- **Wrappers**: `src/lib/middleware/apply-rate-limit.ts`
- **Admin API**: `src/app/api/admin/rate-limit/route.ts`
- **Tests**: `src/__tests__/middleware/rate-limit.test.ts`
- **Examples**: `src/app/api/*/rate-limit-example.ts`
- **Documentation**: `docs/RATE_LIMITING.md`
- **Setup Guide**: `docs/RATE_LIMIT_SETUP.md`
