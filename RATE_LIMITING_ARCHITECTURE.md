# Rate Limiting Architecture

Complete technical architecture for IPOReady rate limiting system.

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Requests                           │
├─────────────────────────────────────────────────────────────┤
│                           ↓                                   │
├─────────────────────────────────────────────────────────────┐
│              Rate Limit Middleware (Next.js)                 │
├─────────────────────────────────────────────────────────────┤
│  1. Extract rate limit key (user ID or IP)                   │
│  2. Check Redis/in-memory store                              │
│  3. Return 429 if limit exceeded                             │
│  4. Add headers (X-RateLimit-*, Retry-After)                 │
└─────────────────────────────────────────────────────────────┘
                           ↓
            ┌──────────────┴──────────────┐
            ↓                             ↓
      ┌─────────────┐          ┌──────────────────┐
      │   Redis     │          │  In-Memory Store │
      │  (Prod)     │          │  (Dev)           │
      └─────────────┘          └──────────────────┘
            ↓                             ↓
      ┌─────────────┐          ┌──────────────────┐
      │  Distributed│          │ Single Instance  │
      │  Tracking   │          │ Tracking         │
      └─────────────┘          └──────────────────┘
            ↓
      ┌─────────────┐
      │  Route      │
      │  Handler    │
      └─────────────┘
```

## Data Flow

### Request with Rate Limit

```
1. Client sends request
   │
   ├─ GET /api/documents
   ├─ Headers: Authorization: Bearer <token>
   │
2. Middleware extracts key
   │
   ├─ Get user ID from token → "user_123"
   │ (or IP from headers → "192.168.1.1")
   │
3. Check rate limit
   │
   ├─ Redis: INCR rl:auth:user_123
   ├─ Response: count=1000
   ├─ Check: 1000 <= 1000 ✓
   │
4. Add rate limit headers
   │
   ├─ X-RateLimit-Limit: 1000
   ├─ X-RateLimit-Remaining: 0
   ├─ X-RateLimit-Reset: 1717680060
   │
5. Call route handler
   │
   ├─ Handler processes request normally
   │
6. Return response (200)
```

### Rate Limited Request

```
1. Client sends request (1001st)
   │
2. Middleware extracts key
   │
   ├─ Get user ID from token → "user_123"
   │
3. Check rate limit
   │
   ├─ Redis: INCR rl:auth:user_123
   ├─ Response: count=1001
   ├─ Check: 1001 > 1000 ✗
   │
4. Return 429 (Too Many Requests)
   │
   ├─ Headers:
   │  ├─ X-RateLimit-Limit: 1000
   │  ├─ X-RateLimit-Remaining: 0
   │  ├─ X-RateLimit-Reset: 1717680060
   │  └─ Retry-After: 45
   │
   ├─ Body:
   │  {
   │    "error": "Too Many Requests",
   │    "message": "Rate limit exceeded...",
   │    "retryAfter": 45,
   │    "resetTime": "2024-06-06T12:01:00.000Z"
   │  }
```

## Component Architecture

### 1. Core Middleware (`rate-limit.ts`)

```typescript
┌─────────────────────────────────────────┐
│  rate-limit.ts (Core Middleware)        │
├─────────────────────────────────────────┤
│                                         │
│  ┌─ getRedisClient()                    │
│  │  └─ Lazy singleton Redis connection  │
│  │                                      │
│  ├─ RATE_LIMIT_CONFIG                  │
│  │  └─ 8 configuration presets          │
│  │                                      │
│  ├─ checkRateLimit(key, config)         │
│  │  ├─ Redis INCR + expire              │
│  │  └─ In-memory Map fallback           │
│  │                                      │
│  ├─ rateLimitMiddleware(req, config)    │
│  │  └─ Returns 429 or null              │
│  │                                      │
│  ├─ Admin Functions:                    │
│  │  ├─ getRateLimitStats()              │
│  │  ├─ resetRateLimit(key, prefix)      │
│  │  ├─ clearAllRateLimits()             │
│  │  └─ shutdownRateLimit()              │
│  │                                      │
│  └─ Helper Functions:                   │
│     ├─ getClientIp(req)                 │
│     ├─ extractUserId(req)               │
│     └─ isHealthCheck(req)               │
└─────────────────────────────────────────┘
```

### 2. Wrapper Functions (`apply-rate-limit.ts`)

```typescript
┌─────────────────────────────────────────┐
│  apply-rate-limit.ts (Wrappers)         │
├─────────────────────────────────────────┤
│                                         │
│  withRateLimit(handler, config)         │
│  └─ Generic wrapper (base)              │
│                                         │
│  Specialized Wrappers:                  │
│  ├─ withPublicRateLimit(handler)        │
│  ├─ withAuthenticatedRateLimit(handler) │
│  ├─ withAuthEndpointRateLimit(handler)  │
│  ├─ withLoginRateLimit(handler)         │
│  ├─ withRegisterRateLimit(handler)      │
│  ├─ withPasswordResetRateLimit(handler) │
│  ├─ withDocumentUploadRateLimit(handler)│
│  └─ withDataExportRateLimit(handler)    │
│                                         │
│  Utilities:                             │
│  ├─ checkApiRateLimit(req, config)      │
│  └─ getRateLimitHeaders(result)         │
└─────────────────────────────────────────┘
```

### 3. Admin API (`admin/rate-limit/route.ts`)

```typescript
┌─────────────────────────────────────────┐
│  Admin Rate Limit API                   │
├─────────────────────────────────────────┤
│                                         │
│  GET  /api/admin/rate-limit/stats       │
│  └─ Return statistics                   │
│                                         │
│  POST /api/admin/rate-limit             │
│  ├─ action: "reset"                     │
│  │  └─ Reset single key                 │
│  └─ action: "clear-all"                 │
│     └─ Clear all (requires confirmation)│
│                                         │
│  Authentication:                        │
│  └─ Requires system_admin role          │
└─────────────────────────────────────────┘
```

## Storage Layer

### Redis Backend (Production)

```
Redis Data Structure:

Key Format:  rl:<prefix>:<identifier>
Value:       integer (request count)
TTL:         60 seconds (configurable)

Examples:
  rl:pub:192.168.1.1        → 45
  rl:auth:user_123          → 987
  rl:login:192.168.1.1      → 3
  rl:docs:upload:user_123   → 18

Operations:
  INCR  rl:auth:user_123    → 1 (new count)
  EXPIRE rl:auth:user_123 60 → Set TTL
  TTL rl:auth:user_123       → Check remaining time
  DEL rl:login:192.168.1.1   → Reset counter
  KEYS rl:*                  → List all entries
```

### In-Memory Backend (Development)

```typescript
Map Structure:

Key:   "rl:<prefix>:<identifier>:<windowStart>"
Value: {
  count: number,
  resetTime: number (milliseconds)
}

Example:
  "rl:pub:192.168.1.1:1717676400000" → {
    count: 45,
    resetTime: 1717676460000
  }

Operations:
  map.set(key, entry)      // Increment/create
  map.get(key)             // Check status
  map.delete(key)          // Reset
  map.size                 // Count entries
```

## Key Generation Strategy

### Public Endpoints (IP-based)

```
Key = IP Address
Source: x-forwarded-for header (first IP after trim)
        or cf-connecting-ip (Cloudflare)
        or request.ip

Example: 192.168.1.1
```

### Authenticated Endpoints (User-based)

```
Key = Hash(SessionToken)
Source: NextAuth session cookie
        or Authorization header token

Process:
  1. Extract token from cookie/header
  2. Hash with SHA-256
  3. Use hash as rate limit key

Example: a1b2c3d4e5f6... (64-char hex)
```

## Rate Limit Window Logic

### Sliding Window (In-Memory)

```
Current Time: 12:00:45

Window 1 (12:00:00 - 12:00:59):
  Requests: [12:00:05, 12:00:12, 12:00:33, ...]
  Count: 45 / 100

At 12:01:00:
  Window 2 (12:01:00 - 12:01:59) starts
  Window 1 data deleted automatically
  Count reset to 0
```

### Fixed Window (Redis)

```
Current Time: 12:00:45

Key: rl:pub:192.168.1.1
Value: 45
TTL: 15 seconds remaining

At 12:01:00:
  Redis expires key automatically
  INCR creates new entry
  New window begins
```

## Compliance & Security

### GDPR Compliance

```
Personal Data: None retained longer than window
  ├─ IP addresses: Only used as temporary key
  ├─ User IDs: Hashed, not stored
  ├─ Requests: No logging of content
  └─ Cleanup: Automatic after window expires
```

### Data Retention

```
In-Memory Store:
  ├─ Expires: Automatically on window end
  ├─ Cleanup: cleanupExpiredRecords() called periodically
  └─ Memory: ~100 bytes per active entry

Redis Store:
  ├─ Expires: EXPIRE command sets TTL
  ├─ Cleanup: Redis handles automatically
  ├─ Memory: ~1KB per 1000 entries
  └─ Persistence: Configurable via Redis settings
```

## Performance Characteristics

### Time Complexity

```
Operation              Redis    In-Memory
─────────────────────────────────────────
Check rate limit      O(1)     O(1)
Increment counter     O(1)     O(1)
Reset entry           O(1)     O(1)
List all entries      O(N)     O(N)
Get statistics        O(1)     O(1)
```

### Space Complexity

```
Backend      Per User    For 10K Users
──────────────────────────────────────
Redis        ~10 bytes   ~100 KB
In-Memory    ~100 bytes  ~1 MB
```

### Latency (P99)

```
Backend      Local        Cloud
──────────────────────────────
Redis        <1ms         10-50ms
In-Memory    <0.1ms       N/A
```

## Error Handling

### Rate Limit Check Failures

```
1. Redis unavailable
   └─ Fallback to in-memory store
   └─ Log error for monitoring
   └─ Continue processing

2. In-memory store full
   └─ Trigger cleanup
   └─ Continue processing
   └─ Never block requests

3. Health check
   └─ Bypass rate limiting
   └─ Return 200 OK
```

## Monitoring & Observability

### Rate Limit Events

```
Logged Events:
  ├─ Redis connection established
  ├─ Redis connection failed (with error)
  ├─ Rate limit exceeded
  ├─ High memory usage (in-memory)
  └─ Admin action (reset/clear)

Available Metrics:
  ├─ Active rate limit entries
  ├─ Backend type (redis/in-memory)
  ├─ Timestamp
  └─ Per-endpoint statistics (if enhanced)
```

### Admin API Responses

```
GET /api/admin/rate-limit/stats
├─ backend: "redis" | "in-memory"
├─ activeEntries: number
└─ timestamp: ISO8601 string

POST /api/admin/rate-limit
├─ status: "success" | "error"
├─ message: string
└─ (action-specific data)
```

## Extensibility Points

### Custom Rate Limit Config

```typescript
const customConfig = {
  windowMs: 30 * 1000,      // 30 seconds
  maxRequests: 50,
  keyPrefix: 'rl:custom',
}

export const GET = withRateLimit(handler, customConfig)
```

### Custom Key Generation

```typescript
function customKeyGenerator(req: NextRequest): string {
  const userId = extractUserId(req)
  const endpoint = req.nextUrl.pathname
  return `${userId}:${endpoint}`
}

const config = { ...RATE_LIMIT_CONFIG.AUTHENTICATED_ENDPOINTS }
export const GET = withRateLimit(handler, config)
```

### Custom Response Format

Extend in `apply-rate-limit.ts`:

```typescript
if (result.retryAfter) {
  return NextResponse.json(
    {
      error: 'Custom error message',
      retryAfter: result.retryAfter,
      // Add custom fields
    },
    { status: 429, headers: responseHeaders }
  )
}
```

## Deployment Scenarios

### Single Instance (Development)

```
┌────────────┐
│  Next.js   │
│ (dev mode) │
├────────────┤
│In-Memory   │
│Store (Map) │
└────────────┘

Limitation: Rate limits not shared between instances
Use for: Local development only
```

### Multiple Instances with Redis (Production)

```
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  Next.js #1  │   │  Next.js #2  │   │  Next.js #3  │
└──────────────┘   └──────────────┘   └──────────────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                    ┌──────────────┐
                    │  Redis       │
                    │  Cluster     │
                    └──────────────┘

Advantage: Shared rate limits across all instances
Use for: Production deployments
```

### Kubernetes with Redis StatefulSet

```
┌─────────────────────────────────┐
│        Kubernetes Cluster       │
├─────────────────────────────────┤
│                                 │
│  ┌──────────┐  ┌──────────┐    │
│  │ Pod #1   │  │ Pod #2   │    │
│  │(Next.js) │  │(Next.js) │    │
│  └──────────┘  └──────────┘    │
│       │              │          │
│       └──────────────┘          │
│              │                  │
│      ┌───────────────┐          │
│      │ StatefulSet   │          │
│      │ (Redis)       │          │
│      └───────────────┘          │
│                                 │
└─────────────────────────────────┘

Scalability: Auto-scales with pod count
Reliability: Persistent storage
```

## Configuration Matrix

```
Scenario           Backend       Scale        Recommendation
──────────────────────────────────────────────────────────────
Local Dev          In-Memory     1-2 users    ✓ Default
Testing            Redis         10-100 users ✓ Recommended
Production         Redis         1000+ users  ✓ Required
Multi-Region       Redis Cluster Global       ✓ Enterprise
```

---

**Architecture Version**: 1.0
**Last Updated**: June 6, 2024
**Status**: Production Ready
