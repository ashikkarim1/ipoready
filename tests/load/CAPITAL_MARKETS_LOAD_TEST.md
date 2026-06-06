# Capital Markets APIs Load Test Guide

## Overview

This load testing suite simulates realistic traffic patterns against the capital markets APIs to validate performance under sustained high-concurrency load.

### Test Scope

**Endpoints Under Test:**
- `GET /api/capital-markets/companies` - Paginated search with filters
- `GET /api/capital-markets/dashboard` - Company detail dashboard
- `GET /api/capital-markets/ipos` - IPO list with filtering

**Test Profile:**
- **Duration:** 10 minutes total
  - Ramp-up: 60 seconds (0 → 1000 VUs)
  - Sustained: 9 minutes (constant 1000 VUs)
  - Cool-down: 1 minute (1000 → 0 VUs)
- **Concurrency:** 1000 virtual users
- **Traffic Distribution:**
  - 50% Companies Search requests
  - 25% Dashboard requests
  - 25% IPOs List requests

### Target Metrics

| Metric | Target | Impact |
|--------|--------|--------|
| P95 Latency | < 200ms | 95% of requests complete within 200ms |
| P99 Latency | < 250ms | 99% of requests complete within 250ms |
| Error Rate | < 0.1% | Less than 1 error per 1000 requests |
| Average Latency | < 150ms | Good baseline performance |

---

## Quick Start

### Prerequisites

```bash
# Install k6 (if not already installed)
# macOS
brew install k6

# Linux
sudo apt-get install k6

# Verify installation
k6 version
```

### Running the Load Test

#### 1. Against Local Development Server

```bash
# Ensure your Next.js dev server is running on port 3000
npm run dev

# In another terminal, run the load test
k6 run tests/load/capital-markets-load.k6.js
```

#### 2. Against Staging/Production

```bash
# Set the BASE_URL environment variable
BASE_URL=https://staging.ipoready.com k6 run tests/load/capital-markets-load.k6.js

# Or with authentication if needed
BASE_URL=https://api.ipoready.com \
AUTH_TOKEN=your_token \
k6 run tests/load/capital-markets-load.k6.js
```

#### 3. Custom Configuration

```bash
# Run with custom duration (example: 5 minutes)
k6 run \
  --stage "30s:100" \
  --stage "4m:100" \
  --stage "30s:0" \
  tests/load/capital-markets-load.k6.js

# Output results to file
k6 run tests/load/capital-markets-load.k6.js \
  -o json=tests/load/results/custom-results.json
```

---

## Result Analysis

### Understanding the Output

The test produces several output metrics:

```
📊 TEST CONFIGURATION
─────────────────────────────────────────────────────────────────
  Duration: 10 minutes (60s ramp-up + 9m sustained + 1m cool-down)
  Target VUs: 1000 concurrent users
  Ramp-up Time: 60 seconds
  Target Metrics:
    • P95 Latency: < 200ms
    • P99 Latency: < 250ms
    • Error Rate: < 0.1%

🎯 ENDPOINT PERFORMANCE
─────────────────────────────────────────────────────────────────
  📍 Companies Search
     Requests: 45,234
     P95 Latency: 185.23ms ✓
     P99 Latency: 218.45ms ✓
     Avg Latency: 125.67ms
     Max Latency: 1,234.56ms
     Error Rate: 0.08% ✓

✅ PASS/FAIL STATUS
─────────────────────────────────────────────────────────────────
  ✓ capital_markets_companies_latency
  ✓ capital_markets_dashboard_latency
  ✓ capital_markets_ipos_latency
```

### Key Metrics Explained

| Metric | What it measures | Target | Why it matters |
|--------|-----------------|--------|----------------|
| **P95 Latency** | 95th percentile response time | < 200ms | Most users experience acceptable performance |
| **P99 Latency** | 99th percentile response time | < 250ms | Even edge case users see good performance |
| **Error Rate** | Percentage of failed requests | < 0.1% | System reliability under load |
| **Avg Latency** | Mean response time | < 150ms | Overall system efficiency |
| **Max Latency** | Longest response time | < 1000ms | No catastrophic slowdowns |

---

## Baseline Results

### Typical Production Performance

These are expected baseline results for a well-configured system:

```
Companies Search:
  P95: 165-185ms
  P99: 210-240ms
  Error Rate: 0.05-0.08%

Dashboard:
  P95: 180-200ms
  P99: 220-250ms
  Error Rate: 0.05-0.08%

IPOs List:
  P95: 160-180ms
  P99: 205-230ms
  Error Rate: 0.04-0.07%
```

### Factors Affecting Performance

1. **Database Performance**
   - Connection pool size
   - Query optimization
   - Index effectiveness

2. **Network Latency**
   - Server location
   - Client distance
   - Connection bandwidth

3. **Application Performance**
   - Node.js runtime efficiency
   - Memory usage
   - CPU utilization

4. **External Factors**
   - Time of day
   - Other concurrent workloads
   - System resource availability

---

## Optimization Recommendations

### If P95/P99 Latency Exceeds Targets

#### 1. Database Optimization

```sql
-- Check slow query log
SELECT * FROM slow_log ORDER BY start_time DESC LIMIT 10;

-- Add missing indexes
CREATE INDEX idx_capital_companies_sector ON capital_companies(sector);
CREATE INDEX idx_capital_companies_name_ticker ON capital_companies(name, ticker);
CREATE INDEX idx_ipos_listing_date ON ipos(listing_date DESC);
CREATE INDEX idx_ipos_status ON ipos(status);

-- Analyze query plans
EXPLAIN ANALYZE
SELECT * FROM capital_companies
WHERE sector = 'Technology'
AND (name ILIKE '%tech%' OR ticker ILIKE '%tech%')
ORDER BY market_cap DESC LIMIT 50 OFFSET 0;
```

#### 2. Connection Pool Tuning

```javascript
// src/lib/db.ts
const pool = new Pool({
  max: 50, // Increase from default 20
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})
```

#### 3. Query Optimization

```typescript
// ❌ Avoid: N+1 Queries
companies.forEach(async (company) => {
  const financials = await sql`SELECT * FROM company_financials WHERE company_id = ${company.id}`
})

// ✓ Do: Batch Queries
const financials = await sql`
  SELECT * FROM company_financials
  WHERE company_id = ANY(${companies.map(c => c.id)})
`
```

#### 4. Caching Strategy

```typescript
// Add Redis caching for frequently accessed data
import { redis } from '@/lib/redis'

export async function getDashboard(companyId: string) {
  const cacheKey = `dashboard:${companyId}`
  
  // Check cache first
  const cached = await redis.get(cacheKey)
  if (cached) return JSON.parse(cached)
  
  // Fetch and cache
  const data = await fetchDashboardData(companyId)
  await redis.setex(cacheKey, 300, JSON.stringify(data)) // 5 min TTL
  
  return data
}
```

#### 5. Response Compression

```typescript
// next.config.js
module.exports = {
  compress: true,
  httpCompression: {
    level: 6, // Balance between compression and CPU
  },
}

// API routes
export async function GET(request: NextRequest) {
  return NextResponse.json(data, {
    headers: {
      'Content-Encoding': 'gzip',
    },
  })
}
```

### If Error Rate Exceeds 0.1%

#### 1. Error Logging

```bash
# Check application logs
tail -f .next/logs/api-errors.log | grep capital-markets

# Monitor database connection errors
psql -d $DATABASE_URL -c "SELECT * FROM pg_stat_activity WHERE state != 'idle';"
```

#### 2. Rate Limiting Check

```typescript
// Verify rate limiting is not too aggressive
// src/app/api/capital-markets/rate-limit-example.ts
const rateLimiter = new RateLimit({
  interval: 60 * 1000, // 1 minute window
  maxRequests: 1000, // Allow 1000 requests per minute
})
```

#### 3. Timeout Configuration

```typescript
// Ensure timeouts are reasonable
export async function GET(request: NextRequest) {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout
    
    const response = await sql`...`
    clearTimeout(timeoutId)
    return NextResponse.json(response)
  } catch (error) {
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timeout' },
        { status: 504 }
      )
    }
    throw error
  }
}
```

### If Memory Usage Spikes

#### 1. Monitor Memory

```bash
# Real-time memory monitoring
node --inspect=0.0.0.0:9229 node_modules/.bin/next start

# Or use pm2 with memory watch
pm2 start npm --name "app" -- run start --watch-memory 100
```

#### 2. Optimize Serialization

```typescript
// ❌ Avoid: Large response payloads
const result = await sql`SELECT * FROM capital_companies`
return NextResponse.json(result) // Could be huge

// ✓ Do: Select only needed fields
const result = await sql`
  SELECT id, name, ticker, sector, market_cap
  FROM capital_companies
`
return NextResponse.json({ companies: result })
```

#### 3. Stream Large Responses

```typescript
// For large result sets, stream the response
export async function GET(request: NextRequest) {
  const stream = new ReadableStream({
    async start(controller) {
      const companies = await sql`SELECT * FROM capital_companies`
      
      companies.forEach((company) => {
        controller.enqueue(JSON.stringify(company) + '\n')
      })
      
      controller.close()
    },
  })
  
  return new Response(stream, {
    headers: { 'Content-Type': 'application/x-ndjson' },
  })
}
```

---

## Advanced Testing Scenarios

### 1. Spike Test (Sudden Surge)

```bash
# Simulate a sudden spike in traffic
k6 run \
  --stage "2m:100" \
  --stage "30s:1000" \
  --stage "2m:100" \
  tests/load/capital-markets-load.k6.js
```

### 2. Soak Test (Long Duration)

```bash
# Run for 1 hour with moderate load
k6 run \
  --stage "5m:500" \
  --stage "55m:500" \
  --stage "5m:0" \
  tests/load/capital-markets-load.k6.js
```

### 3. Stress Test (Breaking Point)

```bash
# Gradually increase load until system breaks
k6 run \
  --stage "5m:100" \
  --stage "5m:500" \
  --stage "5m:1000" \
  --stage "5m:2000" \
  --stage "5m:0" \
  tests/load/capital-markets-load.k6.js
```

### 4. Isolated Endpoint Test

```javascript
// tests/load/capital-markets-companies-only.k6.js
export const options = {
  stages: [
    { duration: '60s', target: 1000 },
    { duration: '9m', target: 1000 },
    { duration: '1m', target: 0 },
  ],
}

export default function () {
  testCompaniesSearch() // Only test companies endpoint
  sleep(0.5)
}
```

---

## Continuous Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/load-test.yml
name: Capital Markets Load Test

on:
  schedule:
    # Run load test daily at 2 AM
    - cron: '0 2 * * *'
  workflow_dispatch:

jobs:
  load-test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run migrations
        run: npm run migrate
      
      - name: Start dev server
        run: npm run dev &
        env:
          DATABASE_URL: postgres://postgres:postgres@localhost/ipoready_test
      
      - name: Wait for server
        run: npx wait-on http://localhost:3000/health
      
      - name: Install k6
        run: sudo apt-get install -y k6
      
      - name: Run load test
        run: k6 run tests/load/capital-markets-load.k6.js \
          -o json=tests/load/results/ci-results.json
      
      - name: Upload results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: load-test-results
          path: tests/load/results/
      
      - name: Comment on PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const results = JSON.parse(fs.readFileSync('tests/load/results/ci-results.json'));
            // Parse and comment with results
```

---

## Performance Baselines by Environment

### Development (localhost:3000)

Expected results with local database:
- P95: 100-150ms
- P99: 150-200ms
- Error Rate: 0.01-0.05%

### Staging (AWS t3.medium)

Expected results:
- P95: 150-200ms
- P99: 200-250ms
- Error Rate: 0.05-0.1%

### Production (AWS c5.2xlarge + RDS)

Expected results:
- P95: 100-180ms
- P99: 150-220ms
- Error Rate: 0.01-0.05%

---

## Troubleshooting

### Common Issues

#### High Error Rate

**Symptom:** Error rate > 0.1%, seeing HTTP 500 errors

**Solutions:**
1. Check database connection availability
2. Verify API route handlers are returning correct status codes
3. Check for timeout issues in queries
4. Review application error logs

#### Timeout Errors

**Symptom:** Many requests timeout, P99 > 10 seconds

**Solutions:**
1. Increase database query timeout
2. Add database indexes for slow queries
3. Reduce query complexity
4. Implement request caching

#### Memory Leaks

**Symptom:** Memory usage continuously increases during test

**Solutions:**
1. Check for unclosed database connections
2. Verify response streams are properly closed
3. Review for memory leaks in middleware
4. Use Node.js memory profiler

### Debug Mode

```bash
# Run with verbose logging
k6 run -v tests/load/capital-markets-load.k6.js

# Run with specific VU count
k6 run --vus 10 --duration 30s tests/load/capital-markets-load.k6.js

# Run single request with verbose headers
k6 run -e VERBOSE=true tests/load/capital-markets-load.k6.js
```

---

## Maintenance

### Regular Test Updates

Update test scenarios whenever:
- New API endpoints are added
- Existing endpoints are modified
- Traffic patterns change
- Performance targets are adjusted

### Reviewing Results

1. **Weekly:** Check baseline performance
2. **After deployments:** Verify no regressions
3. **Monthly:** Analyze trends and optimization opportunities
4. **Quarterly:** Reassess capacity planning needs

---

## References

- [k6 Documentation](https://k6.io/docs/)
- [k6 API Reference](https://k6.io/docs/javascript-api/)
- [Performance Optimization](./OPTIMIZATION_GUIDE.md)
- [Database Performance Tuning](./DB_TUNING.md)

---

## Contact & Support

For issues or questions about load testing:
1. Check existing test results in `tests/load/results/`
2. Review this guide's troubleshooting section
3. Run stress test to identify breaking points
4. Contact DevOps team for infrastructure optimization
