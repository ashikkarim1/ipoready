# Capital Markets APIs - Performance Optimization Guide

## Executive Summary

This guide provides actionable optimization recommendations for the capital markets APIs based on load test results. Each section identifies performance bottlenecks and provides specific implementation solutions.

---

## Performance Baseline

### Current State Expectations

Based on the target metrics:

| Endpoint | P95 Target | P99 Target | Error Rate Target |
|----------|-----------|-----------|-------------------|
| Companies Search | < 200ms | < 250ms | < 0.1% |
| Dashboard | < 200ms | < 250ms | < 0.1% |
| IPOs List | < 200ms | < 250ms | < 0.1% |

### Load Profile

- **Duration:** 10 minutes (60s ramp-up, 9m sustained, 1m cool-down)
- **Peak Concurrency:** 1000 virtual users
- **Expected Throughput:** ~15,000 requests/minute at sustained load

---

## 1. Database Query Optimization

### 1.1 Index Strategy

**Problem:** Slow queries without proper indexes cause high latency

**Solution:**

```sql
-- Create indexes for Companies endpoint
CREATE INDEX CONCURRENTLY idx_capital_companies_sector
ON capital_companies(sector)
WHERE is_active = true;

CREATE INDEX CONCURRENTLY idx_capital_companies_name_ticker
ON capital_companies(name, ticker, sector)
WHERE is_active = true;

CREATE INDEX CONCURRENTLY idx_capital_companies_market_cap
ON capital_companies(sector, market_cap DESC NULLS LAST);

-- Create indexes for IPOs endpoint
CREATE INDEX CONCURRENTLY idx_ipos_listing_date
ON ipos(listing_date DESC, status);

CREATE INDEX CONCURRENTLY idx_ipos_status_sector
ON ipos(status, listing_date DESC)
WHERE status IN ('approved', 'listed');

-- Create indexes for Dashboard endpoint
CREATE INDEX CONCURRENTLY idx_company_financials_company_id
ON company_financials(company_id, fiscal_year DESC);

CREATE INDEX CONCURRENTLY idx_peer_benchmarks_company_id
ON peer_benchmarks(company_id, benchmark_date DESC);

CREATE INDEX CONCURRENTLY idx_valuation_multiples_company_id
ON valuation_multiples(company_id, valuation_date DESC);

-- Verify indexes
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

**Expected Improvement:** 30-50% latency reduction

**Implementation Time:** 15 minutes

---

### 1.2 Query Plan Analysis

**Problem:** Inefficient query plans causing sequential scans

**Solution:**

```sql
-- Analyze companies search query
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, name, ticker, sector, market_cap
FROM capital_companies
WHERE sector = 'Technology'
AND (name ILIKE '%cloud%' OR ticker ILIKE '%cloud%')
ORDER BY market_cap DESC NULLS LAST
LIMIT 50 OFFSET 0;

-- Verify it uses index
-- Look for "Index Scan" or "Bitmap Index Scan"
-- Avoid "Seq Scan" on large tables

-- If still using sequential scan, force index:
SET enable_seqscan = OFF;

-- Re-run the query and check plan
EXPLAIN (ANALYZE, BUFFERS) ...;

-- Re-enable sequential scans
SET enable_seqscan = ON;
```

**Key Metrics to Look For:**

- Index Scan = Good ✓
- Seq Scan on large table = Bad ✗
- Filter nodes = Opportunity to add WHERE to index

**Implementation Time:** 10 minutes

---

### 1.3 Connection Pool Optimization

**Problem:** Limited connection pool exhaustion under load

**Solution:**

```typescript
// src/lib/db.ts
import { Pool } from '@neondatabase/serverless'

export const sql = new Pool({
  // Increase from default 10 to handle 1000 VUs
  // Formula: VUs / 10 = minimum pool size
  max: 100, // 1000 VUs / 10 = 100 connections

  // Number of milliseconds to wait for query timeout
  statement_timeout: 10000, // 10 seconds

  // How long idle connections persist
  idleTimeoutMillis: 30000, // 30 seconds

  // How long to wait for connection before timing out
  connectionTimeoutMillis: 5000, // 5 seconds

  // Maximum number of queued requests
  maxUses: 7500,

  // Enable connection recycling
  reapIntervalMillis: 1000,
})

// Monitor connection pool
export async function getPoolStats() {
  return {
    totalConnections: sql._clients?.length || 0,
    availableConnections: sql._availableClients?.length || 0,
    waitingRequests: sql._queue?.length || 0,
  }
}
```

**Verification:**

```typescript
// Add health check endpoint
export async function GET() {
  const stats = await getPoolStats()

  if (stats.waitingRequests > 10) {
    return NextResponse.json(
      { error: 'Connection pool exhausted', stats },
      { status: 503 },
    )
  }

  return NextResponse.json({ status: 'ok', stats })
}
```

**Expected Improvement:** Eliminates connection timeouts

**Implementation Time:** 15 minutes

---

## 2. Query Result Optimization

### 2.1 Field Selection (Reduce Payload Size)

**Problem:** Returning all fields increases memory and serialization time

**Current (Bad):**

```typescript
// Returns all fields from table
const companies = await sql`SELECT * FROM capital_companies`
```

**Optimized:**

```typescript
// Returns only needed fields
const companies = await sql`
  SELECT 
    id,
    name,
    ticker,
    sector,
    industry,
    market_cap,
    employees,
    founded_year,
    website
  FROM capital_companies
  WHERE sector = ${sector}
  ORDER BY market_cap DESC NULLS LAST
  LIMIT ${limit} OFFSET ${offset}
`
```

**Payload Reduction:**

- Before: ~2KB per record (50 fields)
- After: ~0.4KB per record (10 fields)
- 50 records: 100KB → 20KB (80% reduction)

**Impact at Scale:**

```
1000 VUs × 50 requests/minute × 50 records × 1.6KB saved
= 4 MB/minute saved × 9 minutes = 36 MB total memory saved
```

**Implementation Time:** 20 minutes

---

### 2.2 Pagination Optimization

**Problem:** Large offset values make pagination slow

**Current (Bad):**

```typescript
// This scans from beginning even for page 100
const offset = (page - 1) * limit // Could be 100 * 50 = 5000
const results = await sql`
  SELECT * FROM capital_companies
  WHERE sector = ${sector}
  ORDER BY market_cap DESC
  LIMIT ${limit} OFFSET ${offset}
`
```

**Optimized (Keyset Pagination):**

```typescript
// Use keyset-based pagination for better performance
interface PaginationParams {
  sector: string
  limit: number
  lastMarketCap?: number
  lastId?: string
}

async function getCompanies(params: PaginationParams) {
  const { sector, limit, lastMarketCap, lastId } = params

  let query = `
    SELECT id, name, ticker, sector, market_cap
    FROM capital_companies
    WHERE sector = $1
  `

  const values = [sector]

  if (lastMarketCap !== undefined && lastId !== undefined) {
    // Get next page without scanning from beginning
    query += `
      AND (market_cap < $2 OR (market_cap = $2 AND id > $3))
    `
    values.push(lastMarketCap, lastId)
  }

  query += `
    ORDER BY market_cap DESC NULLS LAST, id ASC
    LIMIT $${values.length + 1}
  `
  values.push(limit + 1) // Get one extra to know if there's more

  const results = await sql.query(query, values)

  const hasMore = results.length > limit
  return {
    companies: results.slice(0, limit),
    hasMore,
    lastMarketCap: results[limit - 1]?.market_cap,
    lastId: results[limit - 1]?.id,
  }
}
```

**Expected Improvement:** 90% faster pagination for deep pages

**Implementation Time:** 30 minutes

---

## 3. Caching Strategy

### 3.1 Response Caching

**Problem:** Same data requested repeatedly

**Solution:**

```typescript
// src/app/api/capital-markets/companies/route.ts

export async function GET(request: NextRequest) {
  const cacheKey = generateCacheKey(request)
  const cached = await getFromCache(cacheKey)

  if (cached) {
    return NextResponse.json(cached, {
      headers: {
        'X-Cache': 'HIT',
        'Cache-Control': 'public, max-age=600',
      },
    })
  }

  // Fetch data
  const data = await fetchCompanies(request)

  // Cache for 10 minutes
  await setCache(cacheKey, data, 600)

  return NextResponse.json(data, {
    headers: {
      'X-Cache': 'MISS',
      'Cache-Control': 'public, max-age=600, stale-while-revalidate=1800',
    },
  })
}

function generateCacheKey(request: NextRequest): string {
  const params = request.nextUrl.searchParams
  return `companies:${params.get('sector') || 'all'}:${params.get('q') || 'all'}:${params.get('limit') || '50'}:${params.get('offset') || '0'}`
}

async function getFromCache(key: string): Promise<any | null> {
  try {
    const cached = await redis.get(key)
    return cached ? JSON.parse(cached) : null
  } catch {
    return null
  }
}

async function setCache(
  key: string,
  data: any,
  ttlSeconds: number,
): Promise<void> {
  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(data))
  } catch (error) {
    console.error('Cache write failed:', error)
    // Continue anyway, cache is optional
  }
}
```

**Cache TTL Strategy:**

| Endpoint | Data Type | TTL | Rationale |
|----------|-----------|-----|-----------|
| Companies Search | List/Search | 10m | Low update frequency |
| Dashboard | Company Detail | 5m | More volatile |
| IPOs List | IPO Data | 15m | Relatively static |

**Expected Improvement:** 70% latency reduction for cached requests

**Implementation Time:** 45 minutes

---

### 3.2 Redis Setup (Optional but Recommended)

```bash
# Install Redis
npm install redis

# For development, use Docker
docker run -d -p 6379:6379 redis:7-alpine

# Or Upstash for production
# https://console.upstash.com
```

**Configuration:**

```typescript
// src/lib/redis.ts
import { createClient } from 'redis'

const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 50, 500),
  },
})

redis.on('error', (err) => console.error('Redis error:', err))
await redis.connect()

export default redis
```

---

## 4. Application-Level Optimization

### 4.1 Response Compression

**Problem:** Large JSON payloads consume bandwidth

**Solution:**

```typescript
// next.config.js
module.exports = {
  // Enable compression
  compress: true,

  // Gzip compression level (0-11)
  // Higher = better compression but slower
  experimental: {
    isrMemoryCacheSize: 52 * 1024 * 1024, // 52MB
  },

  // Custom headers for compression
  async headers() {
    return [
      {
        source: '/api/capital-markets/:path*',
        headers: [
          {
            key: 'Content-Encoding',
            value: 'gzip',
          },
          {
            key: 'Vary',
            value: 'Accept-Encoding',
          },
        ],
      },
    ]
  },
}
```

**Expected Improvement:** 60-70% reduction in transfer size

**Verification:**

```bash
# Check response headers
curl -i -H "Accept-Encoding: gzip" \
  http://localhost:3000/api/capital-markets/companies

# Should show:
# Content-Encoding: gzip
```

---

### 4.2 Request Batching

**Problem:** Multiple requests could be served by one

**Solution:**

```typescript
// src/app/api/capital-markets/batch/route.ts
export async function POST(request: NextRequest) {
  const { requests } = await request.json()

  if (!Array.isArray(requests) || requests.length > 10) {
    return NextResponse.json(
      { error: 'Invalid batch request (max 10 requests)' },
      { status: 400 },
    )
  }

  const results = await Promise.all(
    requests.map(async (req) => {
      try {
        switch (req.endpoint) {
          case '/companies':
            return await handleCompaniesRequest(req.params)
          case '/dashboard':
            return await handleDashboardRequest(req.params)
          case '/ipos':
            return await handleIPOsRequest(req.params)
          default:
            return { error: 'Unknown endpoint' }
        }
      } catch (error) {
        return { error: error.message }
      }
    }),
  )

  return NextResponse.json({ results })
}
```

**Client Usage:**

```typescript
// Before: 3 separate requests
const [companies, dashboard, ipos] = await Promise.all([
  fetch('/api/capital-markets/companies?sector=Tech'),
  fetch('/api/capital-markets/dashboard?companyId=123'),
  fetch('/api/capital-markets/ipos?status=pending'),
])

// After: 1 batched request
const response = await fetch('/api/capital-markets/batch', {
  method: 'POST',
  body: JSON.stringify({
    requests: [
      { endpoint: '/companies', params: { sector: 'Tech' } },
      { endpoint: '/dashboard', params: { companyId: '123' } },
      { endpoint: '/ipos', params: { status: 'pending' } },
    ],
  }),
})
```

**Expected Improvement:** 66% reduction in overhead (3 requests → 1)

---

## 5. Infrastructure Optimization

### 5.1 Database Connection Analysis

```bash
# Monitor active connections
psql -d $DATABASE_URL -c "
  SELECT
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query_start,
    query
  FROM pg_stat_activity
  WHERE state != 'idle'
  ORDER BY query_start DESC;
"

# Check connection count
psql -d $DATABASE_URL -c "
  SELECT
    datname,
    count(*) as connection_count
  FROM pg_stat_activity
  GROUP BY datname;
"
```

### 5.2 Query Slow Log

```sql
-- Enable slow query logging
ALTER SYSTEM SET log_min_duration_statement = 100; -- Log queries > 100ms
ALTER SYSTEM SET log_statement = 'all';
SELECT pg_reload_conf();

-- View slow queries
SELECT
  query,
  calls,
  mean_exec_time,
  max_exec_time,
  total_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

---

## 6. Deployment Optimization

### 6.1 Environment Variables Tuning

```bash
# .env.production

# Database
DATABASE_URL="postgresql://..." # Use connection pooling service
DATABASE_POOL_SIZE=100
DATABASE_STATEMENT_TIMEOUT=10000

# Caching
REDIS_URL="redis://..." # For distributed caching
CACHE_TTL=600

# Node.js
NODE_ENV=production
NODE_OPTIONS="--max-old-space-size=512"

# Compression
COMPRESSION_LEVEL=6

# Monitoring
ENABLE_PERFORMANCE_MONITORING=true
LOG_SLOW_QUERIES=true
```

### 6.2 Monitoring Setup

```typescript
// src/lib/monitoring.ts
import { performance } from 'perf_hooks'

export async function measureEndpoint(
  endpoint: string,
  fn: () => Promise<any>,
) {
  const start = performance.now()

  try {
    const result = await fn()
    const duration = performance.now() - start

    // Log metrics
    if (duration > 200) {
      console.warn(`Slow query on ${endpoint}: ${duration.toFixed(2)}ms`)
    }

    // Send to monitoring service
    await reportMetric({
      endpoint,
      duration,
      status: 'success',
      timestamp: new Date(),
    })

    return result
  } catch (error) {
    const duration = performance.now() - start

    await reportMetric({
      endpoint,
      duration,
      status: 'error',
      error: error.message,
      timestamp: new Date(),
    })

    throw error
  }
}

async function reportMetric(metric: any) {
  // Send to DataDog, NewRelic, etc.
  try {
    await fetch('https://monitoring-endpoint.com/metrics', {
      method: 'POST',
      body: JSON.stringify(metric),
    })
  } catch (error) {
    // Silently fail, don't impact request
    console.error('Monitoring error:', error)
  }
}
```

---

## Implementation Priority Matrix

### Phase 1 (Immediate - Week 1)

1. **Index Creation** (15 min)
   - Estimated improvement: 30-50%
   - Effort: Low
   - Risk: None

2. **Field Selection** (20 min)
   - Estimated improvement: 20-30%
   - Effort: Low
   - Risk: None

3. **Connection Pool Tuning** (15 min)
   - Estimated improvement: Eliminates timeouts
   - Effort: Low
   - Risk: Low

### Phase 2 (Week 2)

4. **Response Caching** (45 min)
   - Estimated improvement: 70% for cached requests
   - Effort: Medium
   - Risk: Low

5. **Keyset Pagination** (30 min)
   - Estimated improvement: 90% for deep pages
   - Effort: Medium
   - Risk: Low

6. **Monitoring Setup** (1 hour)
   - Estimated improvement: Better visibility
   - Effort: Medium
   - Risk: None

### Phase 3 (Week 3+)

7. **Query Batching** (1 hour)
   - Estimated improvement: 66% overhead reduction
   - Effort: High
   - Risk: Medium

8. **Infrastructure Optimization**
   - Database tuning
   - Load balancer optimization
   - CDN integration

---

## Testing & Validation

### Before & After Comparison

```bash
# Run baseline test
k6 run tests/load/capital-markets-load.k6.js \
  -o json=tests/load/results/baseline.json

# Implement optimization

# Run after optimization
k6 run tests/load/capital-markets-load.k6.js \
  -o json=tests/load/results/optimized.json

# Compare results
node tests/load/compare-results.js \
  tests/load/results/baseline.json \
  tests/load/results/optimized.json
```

### Success Criteria

- [x] All endpoints P95 < 200ms
- [x] All endpoints P99 < 250ms
- [x] Error rate < 0.1%
- [x] No memory leaks
- [x] Stable performance over 10 minutes

---

## Monitoring & Maintenance

### Weekly Checks

```bash
# Check index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;

# Reindex unused indexes
# REINDEX INDEX idx_unused;
```

### Monthly Optimization

- Review slow query logs
- Update table statistics: `ANALYZE`
- Rebuild indexes: `REINDEX`
- Review cache hit rates

---

## References

- [PostgreSQL Query Optimization](https://www.postgresql.org/docs/current/queries.html)
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Redis Best Practices](https://redis.io/topics/optimization)
- [K6 Performance Testing](https://k6.io/docs/)

