# IPOReady Load Testing & Performance Audit Suite

Complete load testing and performance audit for IPOReady's production launch.

## Quick Start

### 1. Install k6

```bash
# macOS
brew install k6

# Linux
sudo apt-get install k6

# Verify installation
k6 version
```

### 2. Set Environment Variables

Create `.env.load-test`:
```bash
BASE_URL=http://localhost:3000
TEST_AUTH_TOKEN=your_jwt_token_here
TEST_COMPANY_ID=test-company-1
```

### 3. Run All Tests

```bash
bash load-tests/run-all-tests.sh
```

Or run individual tests:

```bash
# User load test (ramps to 100 concurrent users)
k6 run load-tests/user-load.k6.js

# API load test (1000+ req/sec)
k6 run load-tests/api-load.k6.js

# Database performance test
k6 run load-tests/db-load.k6.js

# Real-world workflow simulation
k6 run load-tests/workflow-load.k6.js
```

## Test Scripts

| Script | Purpose | Load Profile | Duration |
|--------|---------|--------------|----------|
| `user-load.k6.js` | User concurrency | Ramp 0→100 VUs | 5 min |
| `api-load.k6.js` | API endpoints | 1000+ req/sec | 2 min |
| `db-load.k6.js` | Database queries | 100 concurrent | 3 min |
| `workflow-load.k6.js` | End-to-end workflows | 50 concurrent | 3 min |

## Performance Analysis

After running tests, analyze results:

```bash
# Analyze load test results
node load-tests/analyze-performance.js

# Check database performance
node load-tests/check-database-performance.js

# Frontend performance audit
node load-tests/check-frontend-performance.js
```

## Performance Targets

### API Endpoints
- **p95 Latency:** < 500ms
- **p99 Latency:** < 1000ms
- **Error Rate:** < 0.5%
- **Success Rate:** ≥ 99.5%

### Database
- **Query Latency:** < 200ms (p95)
- **Update Latency:** < 300ms (p95)
- **Slow Queries:** < 100 over full test

### Frontend
- **LCP:** < 2.5s
- **FCP:** < 1.8s
- **CLS:** < 0.1
- **Bundle Size:** < 500KB (JS)

### User Experience
- **Dashboard Load:** < 2s
- **PACE Calculation:** < 2s
- **Document Upload:** < 5s
- **Feedback Submit:** < 1s

## Test Scenarios

### Scenario 1: Dashboard Load (100 concurrent users)
- Users accessing dashboard simultaneously
- Fetching company metrics and PACE scores
- **Target:** Complete within 2 seconds at p95

### Scenario 2: PACE Score Calculation (50 concurrent)
- Running IPO readiness assessments
- Complex calculations with company metrics
- **Target:** Complete within 2 seconds at p95

### Scenario 3: Document Upload (25 concurrent)
- Uploading compliance and financial documents
- File processing and storage
- **Target:** Complete within 5 seconds at p95

### Scenario 4: Feedback Submission (100 concurrent)
- Users submitting feedback and feature requests
- Lightweight write operations
- **Target:** Complete within 1 second at p95

### Scenario 5: Real-World Workflow (50 companies)
- Complete onboarding and assessment process
- Mixed workload: 30% reads, 50% writes, 20% heavy
- **Target:** Sustain for 3+ minutes without degradation

## Results Interpretation

### Passed Test
```
✅ All thresholds met
✅ p95 latency < 500ms
✅ Error rate < 0.5%
✅ Memory stable
→ Ready for launch
```

### Failed Test
```
❌ p95 latency > 1s
❌ Error rate > 2%
❌ Memory leak detected
→ Requires optimization
```

## Common Issues & Solutions

### High Latency
1. Check database query performance
2. Add/verify indexes on frequently queried columns
3. Implement response caching
4. Review slow query logs

### High Error Rate
1. Check server logs for errors
2. Verify database connectivity
3. Review error handling code
4. Check resource limits

### Memory Issues
1. Check for memory leaks
2. Review connection pooling
3. Monitor heap usage
4. Check for inefficient algorithms

## Monitoring in Production

After launch, monitor key metrics:

```
Dashboard → Real User Monitoring:
- Page Load Time
- Core Web Vitals
- API Latency Distribution
- Error Rate Trends

Database:
- Query Latency
- Connection Pool Usage
- Slow Query Count

Application:
- Memory Usage
- CPU Usage
- Request Rate
- Error Rate
```

### Alerting Rules
- API p95 latency > 1s
- Error rate > 1%
- Memory usage > 80%
- CPU usage > 70% sustained

## Files

```
load-tests/
├── README.md                           # This file
├── LOAD_TEST_GUIDE.md                  # Detailed guide
├── user-load.k6.js                     # User concurrency tests
├── api-load.k6.js                      # API endpoint tests
├── db-load.k6.js                       # Database performance tests
├── workflow-load.k6.js                 # End-to-end workflow tests
├── run-all-tests.sh                    # Run all tests script
├── analyze-performance.js              # Performance analysis
├── check-database-performance.js       # Database audit
├── check-frontend-performance.js       # Frontend audit
└── results/                            # Test results (generated)
    ├── user-load-results.json
    ├── api-load-results.json
    ├── db-load-results.json
    ├── workflow-load-results.json
    └── performance-report.json         # Analysis summary
```

## Pre-Launch Checklist

- [ ] All load tests executed
- [ ] p95 latencies all < 500ms
- [ ] Error rates all < 0.5%
- [ ] Database queries < 200ms (p95)
- [ ] No N+1 query problems
- [ ] No memory leaks (3+ hour test)
- [ ] Frontend bundle < 500KB
- [ ] Core Web Vitals > 75
- [ ] Monitoring configured
- [ ] Alerts set up

## Performance Baselines

These are typical values before optimization:

| Metric | Before | Target | After |
|--------|--------|--------|-------|
| Dashboard Load | 1-3s | <2s | <1s |
| PACE Calc | 1-2s | <2s | <500ms |
| Document Upload | 3-5s | <5s | <2s |
| Feedback Submit | 0.5-1.5s | <1s | <500ms |
| API Latency (p95) | 200-800ms | <500ms | <300ms |
| DB Query (p95) | 50-300ms | <200ms | <100ms |
| Error Rate | 0-2% | <0.5% | <0.1% |

## Tips for Success

1. **Establish Baseline:** Run tests before making changes
2. **Measure One Thing:** Change one thing at a time
3. **Retest:** Always retest after optimizations
4. **Monitor:** Watch production metrics closely after launch
5. **Iterate:** Performance optimization is ongoing

## Support

For issues:
1. Check `LOAD_TEST_GUIDE.md` for detailed instructions
2. Review error logs in test output
3. Verify database connectivity
4. Check API health: `curl http://localhost:3000/api/health`

## Next Steps

1. ✅ Review load test scripts
2. ✅ Set up test environment
3. ✅ Run baseline tests
4. ✅ Identify bottlenecks
5. ✅ Implement optimizations
6. ✅ Retest to confirm improvements
7. ✅ Set up production monitoring
8. ✅ Launch with confidence

---

**Last Updated:** June 1, 2026  
**Version:** 1.0.0
