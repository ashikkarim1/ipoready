# IPOReady Load Testing & Performance Audit Guide

## Overview
This document covers comprehensive load testing and performance auditing for IPOReady's production launch. All tests are designed to validate the system can handle production traffic with <2% error rate and p95 latencies under 500ms.

## Test Scripts

### 1. User Load Tests (`user-load.k6.js`)
Simulates realistic user behavior with concurrent operations.

**Scenarios:**
- 100 concurrent users accessing dashboard
- 50 concurrent PACE score calculations
- 25 concurrent document uploads
- 100 concurrent feedback submissions

**Targets:**
- All operations complete within 2 seconds (p95)
- Error rate < 2%

**Running:**
```bash
k6 run load-tests/user-load.k6.js \
  --vus 100 \
  --duration 5m \
  -e BASE_URL=http://localhost:3000 \
  -e TEST_COMPANY_ID=test-company-1 \
  -e TEST_AUTH_TOKEN=your_token_here
```

### 2. API Load Tests (`api-load.k6.js`)
Tests individual API endpoints at scale.

**Endpoints:**
- `/api/pace/scores` - 1000 requests/sec
- `/api/feedback/submit` - 500 requests/sec
- `/api/prospectus/generate` - 10 concurrent
- `/api/onboarding/progress` - 500 requests/sec

**Targets:**
- p95 latency < 500ms
- Success rate ≥99.5%
- Error rate < 0.5%

**Running:**
```bash
k6 run load-tests/api-load.k6.js \
  -e BASE_URL=http://localhost:3000 \
  -e TEST_AUTH_TOKEN=your_token_here
```

### 3. Database Load Tests (`db-load.k6.js`)
Tests database performance under concurrent load.

**Tests:**
- PACE query performance (100 concurrent companies)
- PACE update performance
- Company full data load (detects N+1 queries)
- Concurrent updates to same company

**Targets:**
- All queries < 200ms (p95)
- No slow queries (>200ms) acceptable at scale
- Update latency < 300ms (p95)

**Running:**
```bash
k6 run load-tests/db-load.k6.js \
  -e BASE_URL=http://localhost:3000 \
  -e TEST_AUTH_TOKEN=your_token_here
```

### 4. Real-World Workflow Tests (`workflow-load.k6.js`)
Simulates complete IPO readiness workflows.

**Workflow Steps (30% reads, 50% writes, 20% heavy):**
1. Register company (20% of traffic)
2. Complete company profile (50% of traffic)
3. Run PACE assessment (30% of traffic)
4. Generate prospectus (10% of traffic)
5. Browse dashboard (35% of traffic)
6. Submit feedback (15% of traffic)

**Targets:**
- 50 concurrent companies completing workflows
- Workflow latency p95 < 2s
- Prospectus generation p95 < 5s
- Error rate < 2%

**Running:**
```bash
k6 run load-tests/workflow-load.k6.js \
  -e BASE_URL=http://localhost:3000 \
  -e TEST_AUTH_TOKEN=your_token_here
```

## Setup Requirements

### Install k6
```bash
# macOS
brew install k6

# Linux
sudo apt-get install k6

# Windows
choco install k6
```

### Environment Variables
Create `.env.load-test`:
```
BASE_URL=http://localhost:3000
TEST_AUTH_TOKEN=your_jwt_token
TEST_COMPANY_ID=test-company-1
```

### Database Preparation
For realistic load testing, seed test data:
```bash
node scripts/seed-load-test-data.js
```

## Running Full Test Suite

Execute all tests in sequence:

```bash
# 1. User load tests (5 minutes)
k6 run load-tests/user-load.k6.js

# 2. API load tests (2 minutes)
k6 run load-tests/api-load.k6.js

# 3. Database load tests (3 minutes)
k6 run load-tests/db-load.k6.js

# 4. Real-world workflow tests (3 minutes)
k6 run load-tests/workflow-load.k6.js
```

Or run all with a wrapper script:
```bash
bash load-tests/run-all-tests.sh
```

## Performance Audit Checklist

### Code Profiling
- [ ] Profile React components for unnecessary re-renders
  - Use React DevTools Profiler
  - Check for components re-rendering > 2x per interaction
  
- [ ] Check Next.js build output size
  - Run: `npm run build`
  - Verify bundle size < 500KB (gzipped)
  
- [ ] Verify code splitting is working
  - Check `.next/static` for proper chunking
  - Verify dynamic imports are used for large features
  
- [ ] Identify dead code and unused imports
  - Use: `npm run lint`
  - Check for unused variables/imports

### Database Optimization
- [ ] Review all database queries for N+1 problems
  - Use database query logs
  - Check for queries running in loops
  
- [ ] Verify indexes are present
  - Check pg_stat_user_indexes
  - Key columns: companyId, userId, createdAt
  
- [ ] Check connection pooling configuration
  - Verify pooler settings in Neon
  - Target: 10-20 connections per pool
  
- [ ] Measure query execution times
  - Run EXPLAIN ANALYZE on slow queries
  - Target: < 200ms at p95

### Frontend Performance
- [ ] Measure page load times
  - LCP (Largest Contentful Paint) < 2.5s
  - FCP (First Contentful Paint) < 1.8s
  
- [ ] Check Core Web Vitals
  - CLS (Cumulative Layout Shift) < 0.1
  - FID (First Input Delay) < 100ms
  
- [ ] Verify images are optimized
  - Use Next.js Image component
  - Check WebP format for supported browsers
  
- [ ] Check caching headers
  - Static assets: 1 year
  - Dynamic content: no-cache

### API Response Times
- [ ] Measure latencies for all endpoints
  - p50, p95, p99 percentiles
  - Target: < 500ms p95
  
- [ ] Identify slow endpoints
  - Log all responses > 1s
  - Investigate causes
  
- [ ] Check error rates under load
  - Target: < 0.5% error rate
  
- [ ] Monitor memory usage
  - Heap size should be stable
  - No memory leaks detected

## Expected Performance Baselines

### Before Optimization
- Dashboard load: 1-3 seconds
- PACE calculation: 1-2 seconds
- Document upload: 3-5 seconds
- API latency: 200-800ms (p95)
- Database queries: 50-300ms
- Error rate: 0-2%

### After Optimization Targets
- Dashboard load: < 1 second
- PACE calculation: < 500ms
- Document upload: < 1.5 seconds
- API latency: < 300ms (p95)
- Database queries: < 100ms
- Error rate: < 0.5%

## Common Performance Issues & Fixes

### Issue 1: High Database Query Times
**Symptoms:** p95 database latency > 200ms

**Root Causes:**
- Missing indexes on frequently queried columns
- N+1 query problems (querying in loops)
- Large result sets without pagination
- Complex joins without optimization

**Solutions:**
```sql
-- Add indexes
CREATE INDEX idx_companies_user_id ON companies(user_id);
CREATE INDEX idx_pace_scores_company_id ON pace_scores(company_id);
CREATE INDEX idx_documents_created_at ON documents(created_at DESC);

-- Use EXPLAIN ANALYZE to find slow queries
EXPLAIN ANALYZE SELECT * FROM pace_scores WHERE company_id = $1;
```

### Issue 2: React Component Re-renders
**Symptoms:** High CPU usage, slow interactions

**Root Causes:**
- Missing React.memo on child components
- Inline function definitions in parent
- Unnecessary state updates
- Missing key prop in lists

**Solutions:**
```typescript
// Before: Component re-renders when parent re-renders
const DashboardCard = ({ data }) => <div>{data.value}</div>;

// After: Memoized to prevent unnecessary re-renders
const DashboardCard = React.memo(({ data }) => <div>{data.value}</div>);

// Use useMemo for expensive computations
const memoizedValue = useMemo(() => expensiveFunction(data), [data]);
```

### Issue 3: Large Bundle Size
**Symptoms:** Long initial page load

**Root Causes:**
- All dependencies bundled upfront
- Missing code splitting
- Duplicate dependencies
- Large dependencies without tree-shaking

**Solutions:**
```typescript
// Use dynamic imports for heavy features
const ProspectusGenerator = dynamic(() => import('./ProspectusGenerator'), {
  loading: () => <div>Loading...</div>,
});

// Check bundle with: npm install -g webpack-bundle-analyzer
```

### Issue 4: API Response Time Variance
**Symptoms:** Some requests fast, some slow (p95 high)

**Root Causes:**
- No response caching
- Synchronous database operations
- Blocking I/O operations
- Resource contention under load

**Solutions:**
```typescript
// Add response caching
export async function GET(request: Request) {
  // Cache for 5 minutes
  return new Response(data, {
    headers: {
      'Cache-Control': 'public, max-age=300',
      'CDN-Cache-Control': 'max-age=3600',
    },
  });
}

// Use Promise.all for parallel operations
const [user, company, pace] = await Promise.all([
  getUser(userId),
  getCompany(companyId),
  getPACEScores(companyId),
]);
```

## Monitoring & Alerting Setup

### Key Metrics to Monitor (Production)
```
- API latency (p50, p95, p99)
- Error rate (4xx, 5xx)
- Database connection count
- Query execution time
- Memory usage
- CPU usage
- Cache hit rate
```

### Alerting Thresholds
```
- API p95 latency > 1s → Alert
- Error rate > 1% → Alert
- Database connections > 15 → Alert
- Memory usage > 80% → Alert
- CPU usage > 70% sustained → Alert
```

### Recommended Tools
- **APM:** DataDog, New Relic, or Vercel Analytics
- **Database:** Neon Query History or pg_stat_statements
- **Real User Monitoring:** Vercel Web Vitals

## Pre-Launch Checklist

- [ ] All load tests pass with < 2% error rate
- [ ] p95 latency < 500ms across all endpoints
- [ ] LCP < 2.5s, FCP < 1.8s
- [ ] Database queries all < 200ms (p95)
- [ ] No N+1 query problems detected
- [ ] No memory leaks under sustained load (3+ hours)
- [ ] Bundle size < 500KB (gzipped)
- [ ] Core Web Vitals > 75 (Lighthouse)
- [ ] Error handling works correctly under stress
- [ ] Monitoring/alerting configured for production

## Troubleshooting

### k6 Install Issues
```bash
# If brew fails:
# Try: https://k6.io/docs/getting-started/installation/

# Verify installation:
k6 version
```

### Authentication Errors
```bash
# Generate test JWT token:
node scripts/generate-test-token.js

# Add to environment:
export TEST_AUTH_TOKEN=your_generated_token
```

### Database Connection Errors
```bash
# Check connection string:
echo $DATABASE_URL

# Test connection:
psql $DATABASE_URL -c "SELECT 1"

# If using connection pool:
# Ensure pool is running: Neon console → Branch → Pooler
```

### Timeout Errors
```bash
# Increase timeout in tests:
timeout: '30s'  // Default is 10s

# Check if API is responding:
curl -i http://localhost:3000/api/health
```

## Next Steps

1. Run baseline tests against current code
2. Analyze results for bottlenecks
3. Implement fixes (see Common Issues)
4. Retest to confirm improvements
5. Set up production monitoring
6. Launch with confidence
