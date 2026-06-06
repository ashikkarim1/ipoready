# Load Test Configuration Reference

## Environment Configurations

### Development (Local)

```bash
# Configuration
BASE_URL=http://localhost:3000
VUS=100
DURATION=5m
RAMP_UP=30s

# Run
BASE_URL=http://localhost:3000 k6 run tests/load/capital-markets-load.k6.js \
  --stage 30s:100 \
  --stage 4m30s:100 \
  --stage 30s:0
```

**Use When:**
- Testing code changes locally
- Debugging performance issues
- Quick validation before commit

**Expected Performance:**
- P95: 100-150ms
- P99: 150-200ms
- Error Rate: 0.01-0.05%

---

### Staging

```bash
# Configuration
BASE_URL=https://staging.ipoready.com
VUS=500
DURATION=10m
RAMP_UP=60s

# Run
BASE_URL=https://staging.ipoready.com k6 run tests/load/capital-markets-load.k6.js \
  --stage 60s:500 \
  --stage 9m:500 \
  --stage 1m:0
```

**Use When:**
- Pre-release validation
- Testing infrastructure changes
- Performance regression testing

**Expected Performance:**
- P95: 150-200ms
- P99: 200-250ms
- Error Rate: 0.05-0.1%

---

### Production

```bash
# Configuration (CAUTION: Run during off-peak hours)
BASE_URL=https://api.ipoready.com
VUS=100  # Start small!
DURATION=5m

# Approved for production testing:
# - Off-peak hours only (2-4 AM)
# - With team notification
# - Start with smoke test first

# Run smoke test first
k6 run tests/load/capital-markets-load.k6.js \
  --stage 30s:10 \
  --stage 4m30s:10 \
  --stage 30s:0

# If successful, run standard test
BASE_URL=https://api.ipoready.com k6 run tests/load/capital-markets-load.k6.js \
  --stage 30s:100 \
  --stage 4m30s:100 \
  --stage 30s:0
```

**Use When:**
- Monthly performance validation
- Post-deployment verification
- Capacity planning

**Restrictions:**
- Requires approval from DevOps lead
- Off-peak hours only
- Maximum 100 VUs
- Always run smoke test first

**Expected Performance:**
- P95: 100-180ms
- P99: 150-220ms
- Error Rate: 0.01-0.05%

---

## Test Scenarios

### Baseline Test (Weekly)

**Purpose:** Establish performance baseline

```bash
# Standard 10-minute test
./tests/load/run-load-test.sh --staging

# Configuration
# - VUs: Ramp from 0 to 1000 over 60s
# - Duration: 9 minutes sustained
# - Cool-down: 1 minute
# - Total: 10 minutes

# Expected Results
# - ~50,000 total requests
# - Latency stable throughout
# - No memory leaks
```

### Pre-Deployment Test

**Purpose:** Validate performance before release

```bash
# Run multiple test types
./tests/load/run-load-test.sh smoke --staging   # Sanity check
./tests/load/run-load-test.sh --staging         # Baseline
./tests/load/run-load-test.sh spike --staging   # Burst capacity

# Success Criteria
# ✓ All P95/P99 targets met
# ✓ Error rate < 0.1%
# ✓ No memory spikes
# ✓ Performance consistent with previous baseline
```

### Regression Test (Post-Deployment)

**Purpose:** Ensure new code doesn't degrade performance

```bash
# Compare with previous baseline
k6 run tests/load/capital-markets-load.k6.js \
  -o json=results/post-deploy.json

# Analysis
node analyze-results.js results/post-deploy.json

# Check against baseline
node tests/load/compare-results.js \
  results/pre-deploy.json \
  results/post-deploy.json

# Acceptable Changes
# - P95 increase: < 5%
# - P99 increase: < 5%
# - Error rate increase: < 0.05%

# Reject if
# - Any metric increased > 10%
# - Error rate > 0.1%
# - Memory usage grows unbounded
```

### Spike Test (On-Demand)

**Purpose:** Validate handling of traffic surges

```bash
./tests/load/run-load-test.sh spike --staging

# Test Configuration
# - Ramp: 2 minutes to 1000 VUs
# - Spike: 30 seconds at 2000 VUs
# - Cool-down: 2.5 minutes

# Success Criteria
# ✓ System stays responsive during spike
# ✓ No cascading failures
# ✓ Recovery is quick after spike
# ✓ Error rate < 1% during spike
```

### Soak Test (Monthly)

**Purpose:** Detect memory leaks and long-term stability issues

```bash
./tests/load/run-load-test.sh soak --staging

# Test Configuration
# - Ramp: 5 minutes to 500 VUs
# - Sustained: 55 minutes at 500 VUs
# - Cool-down: 5 minutes
# - Total: 1 hour

# Monitoring Points
# - Memory usage: Should stabilize, not grow
# - Latency: Should remain consistent
# - Error rate: Should stay < 0.1%
# - Connection count: Should stabilize

# Expected Telemetry
# - ~30,000 requests per minute
# - ~500,000 total requests
# - Baseline memory: 200-300MB
# - Peak memory: 300-400MB
# - Memory should not exceed 500MB
```

### Stress Test (Quarterly)

**Purpose:** Identify breaking point and capacity limits

```bash
./tests/load/run-load-test.sh stress --staging

# Test Configuration
# - 5 min @ 100 VUs
# - 5 min @ 500 VUs
# - 5 min @ 1000 VUs
# - 5 min @ 2000 VUs

# Metrics to Track
# - At what VU count does latency increase > 250ms?
# - At what VU count does error rate exceed 0.1%?
# - What's the maximum sustainable load?
# - Where is the breaking point?

# Use for Capacity Planning
# - Current capacity: X VUs
# - Breaking point: Y VUs
# - Safety margin: Z% above current peak
# - Scaling recommendation: Need to handle Z% growth
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
name: Load Test

on:
  schedule:
    # Daily baseline
    - cron: '0 2 * * *'
  
  # Manual trigger
  workflow_dispatch:
    inputs:
      test_type:
        description: 'Test type to run'
        required: true
        default: 'standard'
        type: choice
        options:
          - smoke
          - standard
          - spike
          - soak
          - stress

env:
  BASE_URL: https://staging.ipoready.com

jobs:
  load-test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install k6
        run: |
          sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
          echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6-stable.list
          sudo apt-get update
          sudo apt-get install k6
      
      - name: Run Load Test
        run: |
          TEST_TYPE=${{ inputs.test_type || 'standard' }}
          
          case $TEST_TYPE in
            smoke)
              k6 run tests/load/capital-markets-load.k6.js \
                --stage 30s:10 \
                --stage 30s:0
              ;;
            standard)
              k6 run tests/load/capital-markets-load.k6.js \
                --stage 60s:1000 \
                --stage 9m:1000 \
                --stage 1m:0
              ;;
            spike)
              k6 run tests/load/capital-markets-load.k6.js \
                --stage 2m:1000 \
                --stage 30s:2000 \
                --stage 2m30s:0
              ;;
          esac
        env:
          BASE_URL: ${{ env.BASE_URL }}
      
      - name: Analyze Results
        if: always()
        run: |
          node tests/load/analyze-results.js \
            tests/load/results/capital-markets-load-*.json
      
      - name: Upload Results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: load-test-results-${{ github.run_id }}
          path: tests/load/results/
          retention-days: 30
      
      - name: Comment on PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            // Parse results and comment with performance impact
            const fs = require('fs');
            const results = fs.readdirSync('tests/load/results/').filter(f => f.endsWith('.json'));
            // Generate comment with key metrics
```

---

## Performance Benchmarks

### Historical Baselines

```
Date         | P95    | P99    | Error % | Environment | Notes
-------------|--------|--------|---------|-------------|--------
2024-06-01   | 185ms  | 215ms  | 0.08%   | Staging     | Baseline
2024-06-08   | 190ms  | 220ms  | 0.09%   | Staging     | +2.7% latency
2024-06-15   | 175ms  | 205ms  | 0.07%   | Staging     | Indexes added
2024-06-22   | 160ms  | 190ms  | 0.05%   | Staging     | Caching enabled
```

### Target Benchmarks by Environment

| Environment | P95 Target | P99 Target | Error Target | Notes |
|-------------|-----------|-----------|--------------|-------|
| Development | 150ms | 200ms | 0.1% | Local machine, varies |
| Staging | 200ms | 250ms | 0.1% | Production-like |
| Production | 180ms | 220ms | 0.05% | Stricter SLA |

---

## Alerting Thresholds

### When to Investigate

| Metric | Warning | Critical |
|--------|---------|----------|
| P95 Latency | > 250ms | > 500ms |
| P99 Latency | > 300ms | > 750ms |
| Error Rate | > 0.15% | > 1% |
| Memory Growth | +100MB/hour | +300MB/hour |
| CPU Usage | > 70% | > 90% |

### Response Actions

**P95 > 250ms**
1. Check database query performance
2. Review for missing indexes
3. Check connection pool usage
4. Monitor active connections

**Error Rate > 0.15%**
1. Review error logs
2. Check database availability
3. Monitor timeout configurations
4. Check rate limiting

**Memory Growing**
1. Profile heap usage
2. Check for memory leaks
3. Monitor query result sizes
4. Review garbage collection

---

## Comparison & Regression Detection

### Compare Two Test Runs

```bash
# Run two tests
k6 run tests/load/capital-markets-load.k6.js \
  -o json=before.json

# Make changes...

k6 run tests/load/capital-markets-load.k6.js \
  -o json=after.json

# Compare results
node compare-results.js before.json after.json
```

### Automated Regression Detection

```javascript
// tests/load/compare-results.js
const fs = require('fs');

function compareResults(before, after) {
  const beforeMetrics = before.metrics;
  const afterMetrics = after.metrics;
  
  const regressions = [];
  
  // Check P95 latency
  const p95Before = beforeMetrics.http_req_duration.values['p(95)'];
  const p95After = afterMetrics.http_req_duration.values['p(95)'];
  const p95Change = ((p95After - p95Before) / p95Before) * 100;
  
  if (p95Change > 5) {
    regressions.push(`P95 latency increased by ${p95Change.toFixed(1)}%`);
  }
  
  // Check error rate
  const errorBefore = beforeMetrics.http_req_failed?.value || 0;
  const errorAfter = afterMetrics.http_req_failed?.value || 0;
  
  if (errorAfter > errorBefore) {
    regressions.push(`Error rate increased from ${errorBefore} to ${errorAfter}`);
  }
  
  return {
    passed: regressions.length === 0,
    regressions,
  };
}
```

---

## Troubleshooting Configuration

### Enable Debug Logging

```bash
# Verbose output
k6 run -v tests/load/capital-markets-load.k6.js

# Log HTTP requests
k6 run \
  -e VERBOSE=true \
  tests/load/capital-markets-load.k6.js
```

### Reduce Load for Debugging

```bash
# Single VU test
k6 run \
  --vus 1 \
  --duration 1m \
  tests/load/capital-markets-load.k6.js

# Low load debugging
k6 run \
  --stage 1m:5 \
  --stage 4m:5 \
  --stage 1m:0 \
  tests/load/capital-markets-load.k6.js
```

### Network Throttling Simulation

```bash
# Simulate 3G network (slow)
# Note: Not natively supported in k6, consider:
# 1. Test from slower machine
# 2. Add artificial delays in script
# 3. Use Cloud-based k6 service with throttling
```

---

## Security Considerations

### Authentication

```bash
# For protected APIs
export AUTH_TOKEN="your-test-token"

# In test script
const headers = {
  'Authorization': `Bearer ${__ENV.AUTH_TOKEN}`,
  'Content-Type': 'application/json',
}
```

### Rate Limiting

```bash
# Test against rate limiting
k6 run \
  --stage 1m:1000 \
  --stage 1m:2000 \
  tests/load/capital-markets-load.k6.js

# Monitor for 429 Too Many Requests responses
```

### Data Privacy

- Never run load tests on production with PII
- Use staging environment with sanitized data
- Don't log sensitive information
- Comply with data retention policies

---

## Performance Optimization Impact

### Typical Improvements from Recommendations

| Optimization | Expected Improvement |
|-------------|---------------------|
| Database indexes | 30-50% |
| Field selection | 20-30% |
| Connection pool tuning | Eliminates timeouts |
| Response caching | 70% for cached requests |
| Keyset pagination | 90% for deep pages |
| Query batching | 66% overhead reduction |

### Cumulative Impact

Starting baseline: P95 = 250ms
1. Indexes (40%) → 150ms
2. Field selection (25%) → 112ms
3. Caching (70% for 50% requests) → ~66ms average
4. Pagination (90% for 20% requests) → ~53ms average

Final P95: ~50-60ms (75-80% improvement!)

---

## Next Steps

1. Choose appropriate environment (dev, staging, prod)
2. Run baseline test to establish current performance
3. Review results against targets
4. Implement recommended optimizations
5. Re-run tests to measure improvements
6. Schedule regular testing (weekly baseline)
7. Integrate into CI/CD pipeline
8. Monitor production metrics

