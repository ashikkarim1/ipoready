# Capital Markets Load Testing Suite - Complete Index

## 📋 Table of Contents

### Quick Start
- [Getting Started in 2 Minutes](#quick-start)
- [Common Commands](#common-commands)

### Core Documentation
1. [README.md](./README.md) - Main guide and quick reference
2. [CAPITAL_MARKETS_LOAD_TEST.md](./CAPITAL_MARKETS_LOAD_TEST.md) - Comprehensive load testing guide
3. [OPTIMIZATION_GUIDE.md](./OPTIMIZATION_GUIDE.md) - Performance optimization strategies
4. [CONFIG.md](./CONFIG.md) - Environment and configuration reference

### Scripts & Tools
- [capital-markets-load.k6.js](#script-reference) - k6 load test script
- [run-load-test.sh](#shell-script-reference) - Easy test runner
- [analyze-results.js](#analyzer-reference) - Result analyzer

---

## 🚀 Quick Start

### 1. First-Time Setup

```bash
# Install k6 (if needed)
brew install k6  # macOS
# or
sudo apt-get install k6  # Linux

# Verify installation
k6 --version
```

### 2. Run Your First Test

```bash
# Navigate to project root
cd /Users/test/Documents/Claude/Projects/IPOReady

# Make sure app is running
npm run dev  # In another terminal

# Run the load test
./tests/load/run-load-test.sh
```

### 3. View Results

Results are automatically displayed and saved to `tests/load/results/`

---

## 📚 Documentation Guide

### For Everyone

Start here → [README.md](./README.md)
- Overview of testing suite
- Test types and when to use them
- How to run tests
- Understanding results
- Troubleshooting common issues

### For Performance Engineers

1. [CAPITAL_MARKETS_LOAD_TEST.md](./CAPITAL_MARKETS_LOAD_TEST.md)
   - Detailed test methodology
   - Baseline performance metrics
   - Advanced testing scenarios
   - CI/CD integration

2. [OPTIMIZATION_GUIDE.md](./OPTIMIZATION_GUIDE.md)
   - Database query optimization
   - Connection pool tuning
   - Caching strategies
   - Application-level optimizations
   - Implementation priority matrix

3. [CONFIG.md](./CONFIG.md)
   - Environment-specific configurations
   - Test scenario definitions
   - Performance benchmarks
   - Regression detection
   - Alerting thresholds

### For DevOps/SRE

- [CONFIG.md](./CONFIG.md) - Production deployment strategies
- [CAPITAL_MARKETS_LOAD_TEST.md](./CAPITAL_MARKETS_LOAD_TEST.md) - CI/CD integration guide
- [README.md](./README.md) - Troubleshooting section

---

## 🎯 Common Commands

### Standard Tests

```bash
# Full 10-minute load test (1000 VUs)
./tests/load/run-load-test.sh

# Smoke test (quick sanity check, 10 VUs, 1 min)
./tests/load/run-load-test.sh smoke

# Spike test (sudden surge to 2000 VUs)
./tests/load/run-load-test.sh spike

# Soak test (1 hour at moderate load)
./tests/load/run-load-test.sh soak

# Stress test (gradually increase until breaking point)
./tests/load/run-load-test.sh stress
```

### Against Different Environments

```bash
# Development (localhost)
./tests/load/run-load-test.sh --dev

# Staging
./tests/load/run-load-test.sh --staging

# Production (caution!)
./tests/load/run-load-test.sh --prod

# Custom URL
./tests/load/run-load-test.sh --url https://api.example.com
```

### Direct k6 Commands

```bash
# Run with default settings
k6 run tests/load/capital-markets-load.k6.js

# Custom VU and duration
k6 run tests/load/capital-markets-load.k6.js \
  --vus 500 \
  --duration 5m

# Custom load stages
k6 run tests/load/capital-markets-load.k6.js \
  --stage 2m:500 \
  --stage 3m:500 \
  --stage 1m:0

# Verbose output
k6 run -v tests/load/capital-markets-load.k6.js

# Output to JSON
k6 run tests/load/capital-markets-load.k6.js \
  -o json=tests/load/results/custom-test.json
```

### Result Analysis

```bash
# Analyze specific result file
node tests/load/analyze-results.js tests/load/results/capital-markets-load-20240607_143022.json

# Analyze most recent results
node tests/load/analyze-results.js tests/load/results/*-$(date +%Y%m%d)*.json
```

---

## 📊 File Reference

### capital-markets-load.k6.js

**Purpose:** Main k6 load test script

**What it does:**
- Simulates 1000 concurrent users with 60-second ramp-up
- Tests 3 capital markets API endpoints:
  - Companies Search (50% traffic)
  - Dashboard (25% traffic)
  - IPOs List (25% traffic)
- Measures latency, error rates, and throughput
- Enforces performance thresholds

**Key Features:**
- Custom metrics for each endpoint
- Realistic traffic distribution
- Configurable test stages
- Detailed summary reporting

**Usage:**
```bash
k6 run tests/load/capital-markets-load.k6.js

# With environment variables
BASE_URL=https://staging.ipoready.com \
  k6 run tests/load/capital-markets-load.k6.js

# With custom output
k6 run tests/load/capital-markets-load.k6.js \
  -o json=results/my-test.json
```

---

### run-load-test.sh

**Purpose:** User-friendly test runner script

**What it does:**
- Checks prerequisites (k6 installed, server reachable)
- Simplifies running different test types
- Handles environment selection
- Automatically analyzes results

**Supported Test Types:**
- `standard` - 10-minute load test (default)
- `spike` - 5-minute spike test
- `soak` - 1-hour soak test
- `stress` - 20-minute stress test
- `smoke` - 1-minute sanity check

**Usage:**
```bash
./tests/load/run-load-test.sh [TYPE] [OPTIONS]

# Examples
./tests/load/run-load-test.sh                 # Standard test
./tests/load/run-load-test.sh spike --staging # Spike test on staging
./tests/load/run-load-test.sh soak --prod     # Soak test on prod
```

---

### analyze-results.js

**Purpose:** Detailed result analysis and insights

**What it does:**
- Parses k6 JSON results
- Calculates performance grade (A+ to F)
- Identifies performance issues
- Provides optimization recommendations
- Generates formatted reports

**Output:**
- Console summary with metrics
- Performance grade
- Actionable insights
- Optimization priorities
- Comparison metrics

**Usage:**
```bash
node tests/load/analyze-results.js <results-file.json>

# Example
node tests/load/analyze-results.js tests/load/results/capital-markets-load-20240607_143022.json
```

---

## 📈 Performance Targets

### Endpoint Metrics

| Endpoint | P95 Target | P99 Target | Error Target |
|----------|-----------|-----------|--------------|
| Companies Search | < 200ms | < 250ms | < 0.1% |
| Dashboard | < 200ms | < 250ms | < 0.1% |
| IPOs List | < 200ms | < 250ms | < 0.1% |

### Success Criteria

A test passes when:
- [x] All endpoints P95 < 200ms
- [x] All endpoints P99 < 250ms
- [x] All endpoints error rate < 0.1%
- [x] No memory leaks
- [x] Stable performance over 9 minutes
- [x] Recovery after cool-down

---

## 🔧 Optimization Priorities

### Quick Wins (< 1 hour total)

1. **Add Database Indexes** (15 min)
   - Location: `OPTIMIZATION_GUIDE.md` → Section 1.1
   - Expected improvement: 30-50%
   - Effort: Low

2. **Select Only Required Fields** (20 min)
   - Location: `OPTIMIZATION_GUIDE.md` → Section 2.1
   - Expected improvement: 20-30%
   - Effort: Low

3. **Tune Connection Pool** (15 min)
   - Location: `OPTIMIZATION_GUIDE.md` → Section 1.3
   - Expected improvement: Eliminates timeouts
   - Effort: Low

### Medium Effort (1-2 hours)

4. **Response Caching** (45 min)
   - Location: `OPTIMIZATION_GUIDE.md` → Section 3
   - Expected improvement: 70% for cached requests
   - Effort: Medium

5. **Keyset Pagination** (30 min)
   - Location: `OPTIMIZATION_GUIDE.md` → Section 2.2
   - Expected improvement: 90% for deep pages
   - Effort: Medium

---

## 🐛 Troubleshooting Guide

### High Latency (P95 > 200ms)

**Check:**
1. Database query performance
2. Missing indexes
3. Server resources (CPU, memory)
4. Connection pool saturation

**See:** [README.md](./README.md) → Troubleshooting → High Latency

---

### High Error Rate (> 0.1%)

**Check:**
1. Application error logs
2. Database connection availability
3. Timeout configuration
4. Rate limiting settings

**See:** [README.md](./README.md) → Troubleshooting → High Error Rate

---

### Memory Spikes

**Check:**
1. Query result sizes
2. Unclosed connections
3. Memory leak presence
4. Garbage collection

**See:** [README.md](./README.md) → Troubleshooting → Memory Spikes

---

## 📋 Test Scenario Reference

### Development Testing

```bash
# Quick validation during development
./tests/load/run-load-test.sh smoke --dev

# 1 minute, 10 VUs, sanity check
# Use when: Testing code changes
```

### Pre-Deployment Testing

```bash
# Run all test types before release
./tests/load/run-load-test.sh smoke --staging
./tests/load/run-load-test.sh --staging
./tests/load/run-load-test.sh spike --staging

# Use when: Before major releases
```

### Production Monitoring

```bash
# Monthly baseline
./tests/load/run-load-test.sh smoke --prod

# Use when: Monthly validation (off-peak hours)
# Requires: DevOps approval
```

### Capacity Planning

```bash
# Determine breaking point
./tests/load/run-load-test.sh stress --staging

# Use when: Quarterly capacity review
```

---

## 📞 Support & Resources

### Getting Help

1. **Quick answers:** Check [README.md](./README.md)
2. **Detailed guide:** See [CAPITAL_MARKETS_LOAD_TEST.md](./CAPITAL_MARKETS_LOAD_TEST.md)
3. **Optimization:** Review [OPTIMIZATION_GUIDE.md](./OPTIMIZATION_GUIDE.md)
4. **Configuration:** Consult [CONFIG.md](./CONFIG.md)

### Key Links

- [k6 Documentation](https://k6.io/docs/)
- [PostgreSQL Performance](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)

---

## 📊 Results Location

All test results are saved to: `tests/load/results/`

**Files generated:**
- `capital-markets-load-YYYYMMDD_HHMMSS.json` - Raw k6 results
- `capital-markets-load-YYYYMMDD_HHMMSS-summary.json` - Summary statistics
- `capital-markets-load-YYYYMMDD_HHMMSS-summary.txt` - Text summary

**View results:**
```bash
# List all results
ls -lh tests/load/results/

# Analyze specific result
node tests/load/analyze-results.js tests/load/results/capital-markets-load-*.json

# View raw JSON
cat tests/load/results/capital-markets-load-*.json | jq
```

---

## ✅ Checklist: First Load Test

- [ ] Install k6: `brew install k6`
- [ ] Verify installation: `k6 --version`
- [ ] Start dev server: `npm run dev`
- [ ] Run smoke test: `./tests/load/run-load-test.sh smoke --dev`
- [ ] Review results
- [ ] Compare against targets
- [ ] If targets met, proceed to standard test
- [ ] Run standard test: `./tests/load/run-load-test.sh --dev`
- [ ] Analyze results: `node tests/load/analyze-results.js [results-file]`
- [ ] Document baseline performance
- [ ] Schedule regular testing

---

## 🎓 Learning Path

### Beginner (New to Load Testing)

1. Read: [README.md](./README.md) - Quick overview
2. Run: `./tests/load/run-load-test.sh smoke --dev`
3. Review: Understand the basic metrics
4. Read: [CAPITAL_MARKETS_LOAD_TEST.md](./CAPITAL_MARKETS_LOAD_TEST.md) - Detailed guide

### Intermediate (Optimizing Performance)

1. Run: `./tests/load/run-load-test.sh --dev`
2. Analyze: `node analyze-results.js [results-file]`
3. Read: [OPTIMIZATION_GUIDE.md](./OPTIMIZATION_GUIDE.md) - Optimization strategies
4. Implement: Quick wins (database indexes, field selection)
5. Re-test: `./tests/load/run-load-test.sh --dev`

### Advanced (Infrastructure & Scaling)

1. Read: [CONFIG.md](./CONFIG.md) - Environment configurations
2. Run: Multiple test types (spike, soak, stress)
3. Analyze: Historical trends and regression detection
4. Plan: Capacity requirements
5. Implement: Infrastructure optimizations

---

## 📅 Maintenance Schedule

### Weekly
- Run standard load test
- Compare with previous week's baseline
- Review for regressions

### Monthly
- Run soak test (1 hour)
- Check for memory leaks
- Review optimization opportunities

### Quarterly
- Run stress test
- Capacity planning review
- Infrastructure assessment

### Per Release
- Pre-deployment: smoke + standard tests
- Post-deployment: regression test
- Compare with baseline

---

## 🔐 Security Notes

### Production Testing

⚠️ **Requires Approval**
- Off-peak hours only (2-4 AM)
- Team notification required
- Maximum 100 VUs
- Always run smoke test first

### Data Privacy

- Never test with real PII
- Use sanitized staging data
- Don't log sensitive information
- Comply with data retention policies

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-06-07 | Initial release |

---

## 🎯 Next Steps

1. **Run your first test:** `./tests/load/run-load-test.sh`
2. **Review the results** and compare with targets
3. **Implement optimizations** if needed
4. **Schedule regular tests** (weekly baseline)
5. **Integrate into CI/CD** for continuous monitoring

---

**Last Updated:** 2024-06-07
**Maintainer:** Performance Engineering Team
**Status:** Production Ready ✓

