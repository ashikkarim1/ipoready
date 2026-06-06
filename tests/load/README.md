# Capital Markets APIs Load Testing Suite

## Overview

This comprehensive load testing suite validates the performance and reliability of the capital markets APIs under sustained high-concurrency load.

### What's Included

- **k6 Load Test Script** - Production-grade load testing script
- **Performance Analyzer** - Detailed result analysis with actionable insights
- **Test Runner Script** - Easy-to-use shell script for various test scenarios
- **Optimization Guide** - Specific recommendations for improving performance
- **Documentation** - Complete guides and troubleshooting references

---

## Quick Start (2 Minutes)

### 1. Prerequisites

```bash
# Install k6 (if not already installed)
brew install k6  # macOS
# or
sudo apt-get install k6  # Linux

# Verify installation
k6 --version
```

### 2. Run Your First Test

```bash
# Make sure your app is running
npm run dev  # In another terminal

# Run the load test (from project root)
./tests/load/run-load-test.sh

# Or directly with k6
k6 run tests/load/capital-markets-load.k6.js
```

### 3. View Results

```
╔════════════════════════════════════════════════════════════════╗
║        Capital Markets Load Test - Results Summary             ║
╚════════════════════════════════════════════════════════════════╝

📊 TEST CONFIGURATION
─────────────────────────────────────────────────────────────────
  Duration: 10 minutes (60s ramp-up + 9m sustained + 1m cool-down)
  Target VUs: 1000 concurrent users
  Ramp-up Time: 60 seconds

🎯 ENDPOINT PERFORMANCE
─────────────────────────────────────────────────────────────────
  📍 Companies Search
     Requests: 45,234
     P95 Latency: 185.23ms ✓
     P99 Latency: 218.45ms ✓
     Error Rate: 0.08% ✓

✅ PASS/FAIL STATUS
─────────────────────────────────────────────────────────────────
  ✓ capital_markets_companies_latency
  ✓ capital_markets_dashboard_latency
  ✓ capital_markets_ipos_latency
```

---

## Test Types

### Standard Test (10 minutes)

Full load test with realistic traffic patterns.

```bash
./tests/load/run-load-test.sh

# Or specify environment
./tests/load/run-load-test.sh --staging
./tests/load/run-load-test.sh --prod
```

**Use When:**
- Validating baseline performance
- After deployment
- Weekly performance checks

---

### Spike Test (5 minutes)

Simulates sudden traffic surge (2000 VUs).

```bash
./tests/load/run-load-test.sh spike
```

**Use When:**
- Testing burst capacity
- Validating auto-scaling
- Checking alert thresholds

---

### Soak Test (1 hour)

Long-duration test to detect memory leaks and stability issues.

```bash
./tests/load/run-load-test.sh soak
```

**Use When:**
- Running before major releases
- Monthly system validation
- Memory leak investigation

---

### Stress Test (20 minutes)

Gradually increases load until breaking point.

```bash
./tests/load/run-load-test.sh stress
```

**Use When:**
- Capacity planning
- Identifying breaking points
- Evaluating infrastructure limits

---

### Smoke Test (1 minute)

Quick sanity check with minimal load.

```bash
./tests/load/run-load-test.sh smoke
```

**Use When:**
- Validating test setup
- Quick pre-deployment check
- CI/CD pipelines

---

## Advanced Usage

### Custom Server URL

```bash
# Test staging environment
BASE_URL=https://staging.ipoready.com ./tests/load/run-load-test.sh

# Test production (be careful!)
BASE_URL=https://api.ipoready.com ./tests/load/run-load-test.sh

# Test custom domain
./tests/load/run-load-test.sh --url https://custom.example.com
```

### Custom Load Profile

```bash
# Run with specific VU count and duration
k6 run tests/load/capital-markets-load.k6.js \
  --vus 500 \
  --duration 5m

# Ramp-up over 2 minutes, sustain for 3 minutes, cool-down over 1 minute
k6 run tests/load/capital-markets-load.k6.js \
  --stage 2m:500 \
  --stage 3m:500 \
  --stage 1m:0
```

### Verbose Output

```bash
# Enable detailed logging
k6 run -v tests/load/capital-markets-load.k6.js

# Show all HTTP requests and responses
k6 run -u 10 -d 30s tests/load/capital-markets-load.k6.js
```

---

## Analyzing Results

### Automatic Analysis

Results are automatically analyzed after each test:

```bash
./tests/load/run-load-test.sh
# Results saved and analyzed automatically
```

### Manual Analysis

```bash
# Analyze existing results
node tests/load/analyze-results.js tests/load/results/capital-markets-load-20240607_143022.json

# Output:
# 📊 TEST METADATA
# 🎯 ENDPOINT PERFORMANCE SUMMARY
# ❌ ERROR ANALYSIS
# 💻 HTTP REQUEST STATISTICS
# 💡 INSIGHTS & RECOMMENDATIONS
# 📊 PERFORMANCE GRADE (A+, A, B, C, F)
```

---

## Understanding Results

### Key Metrics

| Metric | What It Means | Target | Example |
|--------|---------------|--------|---------|
| **P95 Latency** | 95% of requests complete within this time | < 200ms | 95% of requests < 200ms |
| **P99 Latency** | 99% of requests complete within this time | < 250ms | 99% of requests < 250ms |
| **Error Rate** | Percentage of failed requests | < 0.1% | 0.08% = 8 errors per 10,000 requests |
| **Avg Latency** | Average response time | < 150ms | Most requests average 125ms |
| **Max Latency** | Longest response time | < 1000ms | Single slowest request was 1.2 seconds |

### Performance Grade

- **A+** - Excellent (100% tests passed)
- **A** - Good (90-99% passed) 
- **B** - Acceptable (80-89% passed)
- **C** - Poor (70-79% passed)
- **F** - Failing (< 70% passed)

---

## Troubleshooting

### "Connection refused" Error

**Problem:** `dial tcp: connect: connection refused`

**Solution:**
```bash
# Make sure your app is running
npm run dev

# Check the app is listening on port 3000
curl http://localhost:3000/

# Or specify a different URL
BASE_URL=http://localhost:3001 ./tests/load/run-load-test.sh
```

---

### High Latency (P95 > 200ms)

**Problem:** Response times exceed targets

**Solutions:**

1. **Check database performance:**
   ```bash
   # Monitor slow queries
   tail -f $DATABASE_URL_LOGS | grep duration
   ```

2. **Review database indexes:**
   - See `OPTIMIZATION_GUIDE.md` → Section 1.1

3. **Check server resources:**
   ```bash
   # Monitor CPU and memory
   top
   # or
   htop
   ```

---

### High Error Rate (> 0.1%)

**Problem:** Many requests are failing

**Solutions:**

1. **Check application logs:**
   ```bash
   # View error logs
   tail -f .next/logs/error.log
   ```

2. **Monitor database connections:**
   ```bash
   # Check connection count
   psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"
   ```

3. **Review timeout configuration:**
   - See `OPTIMIZATION_GUIDE.md` → Section 4.2

---

### Memory Spikes

**Problem:** Memory usage increases during test

**Solutions:**

1. **Enable memory profiling:**
   ```bash
   node --inspect=0.0.0.0:9229 node_modules/.bin/next start
   ```

2. **Review query result sizes:**
   - See `OPTIMIZATION_GUIDE.md` → Section 2.1

3. **Check for unclosed connections:**
   - See `OPTIMIZATION_GUIDE.md` → Section 5

---

## Performance Optimization

### Quick Wins (< 1 hour)

1. **Add Database Indexes** (15 min)
   - 30-50% latency improvement
   - See: `OPTIMIZATION_GUIDE.md` → Section 1.1

2. **Select Only Required Fields** (20 min)
   - 20-30% latency improvement
   - See: `OPTIMIZATION_GUIDE.md` → Section 2.1

3. **Tune Connection Pool** (15 min)
   - Eliminates connection timeouts
   - See: `OPTIMIZATION_GUIDE.md` → Section 1.3

### Medium Effort (1-2 hours)

4. **Add Response Caching** (45 min)
   - 70% improvement for cached requests
   - See: `OPTIMIZATION_GUIDE.md` → Section 3

5. **Implement Keyset Pagination** (30 min)
   - 90% improvement for deep pages
   - See: `OPTIMIZATION_GUIDE.md` → Section 2.2

---

## Continuous Integration

### GitHub Actions Example

```yaml
# .github/workflows/load-test.yml
name: Load Test

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM

jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci && npm run build
      - run: npm run dev &
      - run: npx wait-on http://localhost:3000
      - run: k6 run tests/load/capital-markets-load.k6.js
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: load-test-results
          path: tests/load/results/
```

---

## File Structure

```
tests/load/
├── capital-markets-load.k6.js      # Main load test script
├── run-load-test.sh                # Easy test runner
├── analyze-results.js              # Result analyzer
├── CAPITAL_MARKETS_LOAD_TEST.md    # Detailed guide
├── OPTIMIZATION_GUIDE.md           # Performance optimization
├── README.md                       # This file
└── results/                        # Test results directory
    ├── capital-markets-load-*.json
    └── capital-markets-load-*-summary.txt
```

---

## Key Endpoints Tested

### 1. Companies Search
```
GET /api/capital-markets/companies
?sector=Technology
&q=cloud
&limit=50
&offset=0
```

Tests paginated search with filters. 50% of traffic.

---

### 2. Dashboard
```
GET /api/capital-markets/dashboard
?companyId=123
```

Tests company detail page. 25% of traffic.

---

### 3. IPOs List
```
GET /api/capital-markets/ipos
?status=pending
&sector=Technology
&days=90
```

Tests IPO filtering and listing. 25% of traffic.

---

## Target Metrics Summary

| Endpoint | Requests | P95 Target | P99 Target | Error Target |
|----------|----------|-----------|-----------|--------------|
| Companies | ~45,000 | < 200ms | < 250ms | < 0.1% |
| Dashboard | ~22,500 | < 200ms | < 250ms | < 0.1% |
| IPOs | ~22,500 | < 200ms | < 250ms | < 0.1% |

---

## Best Practices

### Before Running Tests

1. **Close unnecessary applications** - Free up system resources
2. **Check server health** - Ensure app is responsive
3. **Stop background jobs** - Pause scheduled tasks
4. **Review recent changes** - Know what you're testing
5. **Backup current state** - Save baseline for comparison

### During Tests

1. **Monitor metrics** - Watch for anomalies
2. **Check logs** - Look for errors or warnings
3. **Don't make changes** - Let test complete uninterrupted
4. **Record observations** - Note any issues

### After Tests

1. **Review results immediately** - Don't let metrics fade
2. **Compare with baseline** - Identify regressions
3. **Investigate anomalies** - Root cause analysis
4. **Document findings** - Create action items

---

## Success Criteria

A load test is **successful** when:

- [x] P95 latency < 200ms for all endpoints
- [x] P99 latency < 250ms for all endpoints
- [x] Error rate < 0.1% for all endpoints
- [x] No memory leaks (stable memory usage)
- [x] No timeout errors
- [x] Consistent performance over 9 minutes

---

## Resources

### Documentation

- [CAPITAL_MARKETS_LOAD_TEST.md](./CAPITAL_MARKETS_LOAD_TEST.md) - Complete load testing guide
- [OPTIMIZATION_GUIDE.md](./OPTIMIZATION_GUIDE.md) - Performance optimization strategies
- [k6 Documentation](https://k6.io/docs/) - Official k6 reference

### Tools

- **k6** - Load testing tool
- **node** - Result analysis
- **psql** - Database inspection

### External Links

- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Redis Best Practices](https://redis.io/topics/optimization)

---

## Support

### Common Questions

**Q: Can I run this against production?**
A: Yes, but use caution. Start with smoke test (10 VUs) and get approval from DevOps.

**Q: How often should I run load tests?**
A: Weekly baseline, daily in CI/CD, before major releases, and after infrastructure changes.

**Q: What if tests fail?**
A: Check the Troubleshooting section above, review logs, and consult OPTIMIZATION_GUIDE.md.

**Q: Can I modify the test script?**
A: Yes! Script is well-commented. Common customizations:
- Adjust VU count
- Change ramp-up duration
- Modify traffic distribution
- Add custom scenarios

### Getting Help

1. Check troubleshooting section
2. Review log output
3. Run smoke test for diagnostics
4. Check CAPITAL_MARKETS_LOAD_TEST.md
5. Run OPTIMIZATION_GUIDE.md recommendations

---

## Version History

- **v1.0** (2024-06-07) - Initial release
  - Standard, spike, soak, and stress tests
  - Automatic result analysis
  - Comprehensive documentation
  - Optimization recommendations

---

## License

Part of IPOReady project. Proprietary and confidential.

---

## Next Steps

1. **Run your first test:** `./tests/load/run-load-test.sh`
2. **Review results** and compare with targets
3. **Implement optimizations** from OPTIMIZATION_GUIDE.md if needed
4. **Schedule regular tests** (weekly baseline)
5. **Integrate into CI/CD** for continuous validation

---

**Happy Load Testing! 🚀**
