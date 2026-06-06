# Rate Limiting Setup Guide

Complete setup and deployment guide for IPOReady rate limiting middleware.

## Table of Contents

1. [Local Development](#local-development)
2. [Redis Configuration](#redis-configuration)
3. [Route Implementation](#route-implementation)
4. [Testing](#testing)
5. [Monitoring](#monitoring)
6. [Deployment](#deployment)
7. [Troubleshooting](#troubleshooting)

## Local Development

### Without Redis (Default)

For local development, the middleware falls back to in-memory storage automatically:

```bash
# No configuration needed - just run
npm run dev
```

The in-memory store works perfectly for single-instance development. However, it's lost on server restart.

### With Redis (Optional)

To test distributed rate limiting locally:

#### 1. Install Docker

```bash
# macOS
brew install docker

# or download Docker Desktop from https://www.docker.com/products/docker-desktop
```

#### 2. Start Redis Container

```bash
# Start Redis on port 6379
docker run -d --name redis -p 6379:6379 redis:7-alpine

# Verify it's running
docker ps | grep redis
```

#### 3. Configure .env.local

```bash
# .env.local
REDIS_URL=redis://localhost:6379
```

#### 4. Verify Connection

```bash
# Test Redis connection
redis-cli ping
# Output: PONG
```

#### 5. Run Development Server

```bash
npm run dev
```

Check console logs for:

```
Redis client connected for rate limiting
```

### Cleanup

```bash
# Stop Redis container
docker stop redis

# Remove Redis container
docker rm redis
```

## Redis Configuration

### Production Redis Setup

#### AWS ElastiCache (Recommended)

1. **Create Redis Cluster**

```bash
aws elasticache create-cache-cluster \
  --cache-cluster-id ipoready-rate-limit \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --engine-version 7.0 \
  --num-cache-nodes 1
```

2. **Configure Security Group**

Allow inbound traffic on port 6379 from your application servers.

3. **Get Connection String**

```bash
aws elasticache describe-cache-clusters \
  --cache-cluster-id ipoready-rate-limit \
  --show-cache-node-info
```

4. **Set Environment Variable**

```bash
# .env.production
REDIS_URL=redis://:password@endpoint:6379
```

#### UpStash (Serverless Redis)

For Next.js on Vercel, UpStash is an excellent choice:

1. **Sign up at https://upstash.com**

2. **Create Redis Database**

3. **Copy Connection String**

```
redis://default:password@endpoint:port
```

4. **Set Environment Variable**

```bash
# Vercel Environment
REDIS_URL=redis://default:password@endpoint:port
```

#### Self-Hosted Redis

1. **Install Redis Server**

```bash
# Ubuntu/Debian
sudo apt-get install redis-server

# macOS
brew install redis
```

2. **Start Redis**

```bash
# Ubuntu/Debian
sudo systemctl start redis-server

# macOS
redis-server
```

3. **Configure Password (Optional)**

```bash
# Edit /etc/redis/redis.conf
requirepass your_secure_password

# Restart Redis
sudo systemctl restart redis-server
```

4. **Get Connection String**

```
redis://[:password]@host:6379
```

### Redis Configuration Options

#### Connection Timeout

```typescript
// src/lib/middleware/rate-limit.ts
const redis = redis.createClient({
  url: redisUrl,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        return new Error('Redis reconnection failed')
      }
      return retries * 50
    },
    connectTimeout: 5000,
  },
})
```

#### Connection Pooling

For high-volume APIs, configure connection pooling:

```bash
# .env.production
REDIS_URL=redis://user:password@host:6379?maxRetriesPerRequest=null
```

#### SSL/TLS (for cloud Redis)

```bash
# .env.production
REDIS_URL=rediss://user:password@host:6379?ssl=true
```

## Route Implementation

### Step 1: Identify Route Type

Classify your API routes:

| Route Type | Examples | Rate Limit |
|-----------|----------|-----------|
| Public | Documentation, health checks | 100/min per IP |
| Authenticated | List data, create records | 1000/min per user |
| Auth | Login, register | 5-10/min per IP |
| Upload | Document upload | 20/hour per user |
| Export | Data export | 5/hour per user |

### Step 2: Apply Middleware

#### Example: Capital Markets API

File: `src/app/api/capital-markets/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { withAuthenticatedRateLimit } from '@/lib/middleware/apply-rate-limit'

async function GET(req: NextRequest): Promise<NextResponse> {
  // Get user session
  const session = await getSession({ req })

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Your handler logic
  return NextResponse.json({
    status: 'success',
    markets: [],
  })
}

export const handler = withAuthenticatedRateLimit(GET)
export { handler as GET }
```

#### Example: Auth Login

File: `src/app/api/auth/login/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { withLoginRateLimit } from '@/lib/middleware/apply-rate-limit'

async function POST(req: NextRequest): Promise<NextResponse> {
  const { email, password } = await req.json()

  // Validate credentials
  // ...

  return NextResponse.json({
    status: 'success',
    token: '...',
  })
}

export const handler = withLoginRateLimit(POST)
export { handler as POST }
```

#### Example: Document Upload

File: `src/app/api/documents/upload/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { withDocumentUploadRateLimit } from '@/lib/middleware/apply-rate-limit'

async function POST(req: NextRequest): Promise<NextResponse> {
  const formData = await req.formData()
  const file = formData.get('file') as File

  // Upload logic
  // ...

  return NextResponse.json(
    { status: 'success', documentId: '...' },
    { status: 201 }
  )
}

export const handler = withDocumentUploadRateLimit(POST)
export { handler as POST }
```

### Step 3: Test Each Route

```bash
# Test public endpoint (100/min)
for i in {1..101}; do
  curl https://localhost:3000/api/endpoint
done
# 101st should return 429

# Test authenticated endpoint (1000/min)
# Make 1001 requests with auth header
# 1001st should return 429

# Test auth endpoint (5/15min)
for i in {1..6}; do
  curl -X POST https://localhost:3000/api/auth/login \
    -d '{"email":"test@example.com","password":"wrong"}'
done
# 6th should return 429
```

## Testing

### Unit Tests

```bash
# Run rate limit tests
npm test -- rate-limit.test.ts

# Run with coverage
npm test -- rate-limit.test.ts --coverage
```

### Integration Tests

Create `src/__tests__/api/rate-limit.integration.ts`:

```typescript
import { fetch } from 'node-fetch'

describe('Rate Limit Integration', () => {
  const BASE_URL = 'http://localhost:3000'

  it('should rate limit public endpoint', async () => {
    const requests = []

    // Make 101 requests
    for (let i = 0; i < 101; i++) {
      requests.push(fetch(`${BASE_URL}/api/endpoint`))
    }

    const responses = await Promise.all(requests)

    // First 100 should be 200
    const successCount = responses
      .slice(0, 100)
      .filter((r) => r.status === 200).length
    expect(successCount).toBe(100)

    // 101st should be 429
    const lastResponse = responses[100]
    expect(lastResponse.status).toBe(429)
    expect(lastResponse.headers.has('Retry-After')).toBe(true)
  }, 30000)
})
```

### Load Testing

Use Apache Bench or similar:

```bash
# Test 100 concurrent requests to public endpoint
ab -n 100 -c 10 http://localhost:3000/api/endpoint

# Expected output shows rate limit headers
# X-RateLimit-Limit: 100
# X-RateLimit-Remaining: decreasing
# X-RateLimit-Reset: timestamp
```

## Monitoring

### Enable Rate Limit Logging

Add to your application:

```typescript
// src/lib/middleware/rate-limit-logger.ts
import { NextRequest } from 'next/server'
import { checkApiRateLimit } from '@/lib/middleware/apply-rate-limit'
import { RATE_LIMIT_CONFIG } from '@/lib/middleware/rate-limit'

export async function logRateLimitStatus(req: NextRequest) {
  const config = RATE_LIMIT_CONFIG.PUBLIC_ENDPOINTS
  const result = await checkApiRateLimit(req, config)

  if (result && result.remaining < 10) {
    console.warn('Rate limit approaching:', {
      remaining: result.remaining,
      limit: result.limit,
      resetTime: new Date(result.resetTime).toISOString(),
    })
  }
}
```

### Dashboard Integration

Create an admin dashboard to monitor:

```typescript
// src/app/api/admin/rate-limit/stats/route.ts
import { getRateLimitStats } from '@/lib/middleware/rate-limit'

export async function GET() {
  const stats = await getRateLimitStats()
  return Response.json(stats)
}
```

### Alerts

Set up alerts for:

- High rate limit hit rate (>5% of requests)
- Redis connection failures
- Memory usage exceeding threshold

Example Prometheus metrics:

```typescript
// src/lib/middleware/rate-limit-metrics.ts
import { metrics } from '@/lib/metrics'

metrics.counter('rate_limit.exceeded', {
  endpoint: req.nextUrl.pathname,
  timestamp: new Date(),
})
```

## Deployment

### Vercel Deployment

#### 1. Set Environment Variables

```bash
# Vercel Dashboard → Settings → Environment Variables
REDIS_URL=rediss://default:password@endpoint:6379
```

#### 2. Deploy

```bash
git push origin main
# Vercel automatically deploys
```

#### 3. Verify

```bash
# Check logs
vercel logs

# Test rate limit
curl https://your-domain.com/api/endpoint
# Should see X-RateLimit-* headers
```

### Docker Deployment

#### 1. Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

#### 2. Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      REDIS_URL: redis://redis:6379
      DATABASE_URL: ${DATABASE_URL}
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
    depends_on:
      - redis

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    volumes:
      - redis-data:/data

volumes:
  redis-data:
```

#### 3. Deploy

```bash
docker-compose up -d
```

### Kubernetes Deployment

#### 1. Create Redis StatefulSet

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: redis
spec:
  serviceName: redis
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis
        image: redis:7-alpine
        ports:
        - containerPort: 6379
        volumeMounts:
        - name: redis-data
          mountPath: /data
  volumeClaimTemplates:
  - metadata:
      name: redis-data
    spec:
      accessModes: [ "ReadWriteOnce" ]
      resources:
        requests:
          storage: 10Gi
```

#### 2. Create App Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ipoready-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ipoready
  template:
    metadata:
      labels:
        app: ipoready
    spec:
      containers:
      - name: app
        image: your-registry/ipoready:latest
        ports:
        - containerPort: 3000
        env:
        - name: REDIS_URL
          value: redis://redis:6379
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: database-url
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

#### 3. Deploy to Kubernetes

```bash
kubectl apply -f redis-statefulset.yaml
kubectl apply -f app-deployment.yaml
kubectl apply -f service.yaml
```

## Troubleshooting

### Redis Connection Failed

**Symptom**: Logs show "Failed to initialize Redis client"

**Solution**:

```bash
# 1. Verify Redis is running
redis-cli ping
# Should output: PONG

# 2. Check connection string
echo $REDIS_URL

# 3. Test connection
redis-cli -u $REDIS_URL ping

# 4. Check firewall (if remote)
nc -zv redis-host.com 6379
```

### Rate Limit Not Applied

**Symptom**: Requests aren't being limited

**Solution**:

```typescript
// 1. Verify wrapper is used
export const GET = withAuthenticatedRateLimit(handler) // ✓ Correct

// 2. Check middleware is loaded
import { withAuthenticatedRateLimit } from '@/lib/middleware/apply-rate-limit'
// If import fails, check file exists

// 3. Enable debug logging
console.log('Rate limit config:', RATE_LIMIT_CONFIG)
```

### High Memory Usage (In-Memory Mode)

**Symptom**: Node.js memory grows over time

**Solution**:

```typescript
// Use Redis instead
REDIS_URL=redis://localhost:6379

// Or implement cleanup in in-memory mode
import { cleanupExpiredRecords } from '@/lib/middleware/rate-limit'

// Run cleanup every 5 minutes
setInterval(cleanupExpiredRecords, 5 * 60 * 1000)
```

### Rate Limits Reset Incorrectly

**Symptom**: Window resets before 1 minute

**Solution**:

Check Redis expiration settings:

```bash
redis-cli
> KEYS rl:*
> TTL rl:pub:192.168.1.1
# Should show ~60 seconds remaining
```

### Performance Issues

**Symptom**: Requests are slow

**Solution**:

```bash
# 1. Check Redis latency
redis-cli --latency

# 2. Monitor Redis memory
redis-cli INFO memory

# 3. Optimize Redis configuration
maxmemory-policy=allkeys-lru  # Evict least recently used
```

## Next Steps

1. [Deploy to production](#deployment)
2. [Set up monitoring](#monitoring)
3. [Configure alerts](./MONITORING.md)
4. [Review security](./SECURITY.md)
