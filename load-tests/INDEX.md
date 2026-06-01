# Load Testing Suite - File Index

## Quick Navigation

### Getting Started
1. **README.md** - Start here! Quick start guide and overview
2. **setup-test-env.js** - Validate your environment before testing
3. **run-all-tests.sh** - Execute all tests automatically

### Detailed Documentation
- **LOAD_TEST_GUIDE.md** - Comprehensive testing guide with all details
- **INDEX.md** - This file

### Test Scripts (k6)
- **user-load.k6.js** - User concurrency tests (100 concurrent users)
- **api-load.k6.js** - API endpoint tests (1000+ req/sec)
- **db-load.k6.js** - Database performance tests
- **workflow-load.k6.js** - Real-world workflow simulation

### Analysis Tools
- **analyze-performance.js** - Analyze load test results
- **check-database-performance.js** - Database performance audit
- **check-frontend-performance.js** - Frontend performance check

## File Descriptions

### Test Scripts (Total: 906 lines of k6 code)

#### user-load.k6.js (194 lines)
```
Purpose: Simulates realistic user behavior
Load: Ramps from 0 to 100 concurrent users
Duration: 5 minutes
Metrics:
  - Dashboard load time
  - PACE calculation time
  - Document upload time
  - Feedback submission time
```

#### api-load.k6.js (241 lines)
```
Purpose: Tests API endpoints at scale
Load: 1000+ requests/sec across multiple endpoints
Duration: 2 minutes
Endpoints:
  - /api/pace/scores (1000 req/sec)
  - /api/feedback (500 req/sec)
  - /api/prospectus/generate (10 concurrent)
  - /api/onboarding/progress (500 req/sec)
```

#### db-load.k6.js (193 lines)
```
Purpose: Tests database performance
Load: 100 concurrent companies
Duration: 3 minutes
Tests:
  - PACE query performance
  - PACE update performance
  - Company full data load
  - Concurrent updates stress test
```

#### workflow-load.k6.js (278 lines)
```
Purpose: Simulates end-to-end workflows
Load: 50 concurrent companies
Duration: 3 minutes
Workflow Steps:
  1. Register company (20% of traffic)
  2. Complete company profile (50%)
  3. Run PACE assessment (30%)
  4. Generate prospectus (10%)
  5. Browse dashboard (35%)
  6. Submit feedback (15%)
```

### Analysis & Setup Tools

#### run-all-tests.sh (bash)
```
Orchestrates all load tests
- Validates k6 installation
- Loads environment variables
- Runs all 4 tests sequentially
- Generates results directory
- Analyzes results automatically
- Provides final summary
Total Time: ~15 minutes
```

#### setup-test-env.js (Node.js)
```
Validates test environment
Checks:
  - Environment variables
  - App running status
  - Database connectivity
  - Load test scripts
  - k6 installation
  - Node dependencies
  - Disk space
Generates: test-config.json
```

#### analyze-performance.js (Node.js)
```
Analyzes load test results
Processes:
  - All metrics from k6 results
  - Threshold checking
  - Issue identification
  - Recommendations
Output: performance-report.json
```

#### check-database-performance.js (Node.js)
```
Audits database performance
Checks:
  - Slow queries (> 100ms)
  - Indexes on critical tables
  - Table sizes & row counts
  - Connection pool status
  - Foreign key coverage
Output: database-performance-report.json
```

#### check-frontend-performance.js (Node.js)
```
Audits frontend performance
Checks:
  - Bundle size
  - React optimizations
  - Code splitting
  - Image optimization
  - Linting issues
Output: frontend-performance-report.json
```

## Execution Workflow

### Step 1: Setup
```bash
node load-tests/setup-test-env.js
```
Validates everything is ready.

### Step 2: Run Tests
```bash
bash load-tests/run-all-tests.sh
```
Automatically runs all 4 tests and generates results.

Or manually:
```bash
k6 run load-tests/user-load.k6.js
k6 run load-tests/api-load.k6.js
k6 run load-tests/db-load.k6.js
k6 run load-tests/workflow-load.k6.js
```

### Step 3: Analyze
```bash
node load-tests/analyze-performance.js
node load-tests/check-database-performance.js
node load-tests/check-frontend-performance.js
```

### Step 4: Review
```bash
# Open and review these reports:
# - load-tests/performance-report.json
# - load-tests/database-performance-report.json
# - load-tests/frontend-performance-report.json
```

## Results Directory Structure

```
load-tests/
├── results/
│   ├── user-load-results.json          # Raw k6 results
│   ├── api-load-results.json           # Raw k6 results
│   ├── db-load-results.json            # Raw k6 results
│   ├── workflow-load-results.json      # Raw k6 results
│   ├── performance-report.json         # Analysis summary
│   ├── database-performance-report.json# DB audit
│   └── frontend-performance-report.json# Frontend audit
```

## Performance Targets Quick Reference

| Metric | Target |
|--------|--------|
| Dashboard Load (p95) | < 2s |
| API Latency (p95) | < 500ms |
| DB Query (p95) | < 200ms |
| Error Rate | < 0.5% |
| Success Rate | ≥ 99.5% |
| Bundle Size (JS) | < 500KB |
| LCP | < 2.5s |

## Environment Variables Required

```
BASE_URL=http://localhost:3000
TEST_AUTH_TOKEN=your_jwt_token
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your_secret
```

## Dependencies

### Required
- k6 (v0.47.0+)
- Node.js (v16+)
- npm

### Optional
- Vercel CLI (for deployment)
- PostgreSQL client tools

## Troubleshooting

| Problem | Solution |
|---------|----------|
| k6 not found | Install: `brew install k6` |
| Database error | Check DATABASE_URL in .env.local |
| App not running | Start with: `npm run dev` |
| Auth errors | Generate test token with setup script |

## Common Commands

```bash
# Validate environment
node load-tests/setup-test-env.js

# Run all tests (recommended)
bash load-tests/run-all-tests.sh

# Run specific test
k6 run load-tests/user-load.k6.js

# Analyze results
node load-tests/analyze-performance.js

# Check database
node load-tests/check-database-performance.js

# Check frontend
node load-tests/check-frontend-performance.js

# View results
cat load-tests/results/performance-report.json
```

## Success Indicators

✅ Tests complete without errors  
✅ All p95 latencies < 500ms  
✅ Error rate < 0.5%  
✅ Memory usage stable  
✅ No crashes under load  

## Next Steps

1. Read README.md
2. Run setup-test-env.js
3. Execute run-all-tests.sh
4. Review results in JSON files
5. Implement recommended optimizations
6. Retest to validate improvements

---

**Version:** 1.0.0  
**Last Updated:** June 1, 2026  
**Total Code:** 2,100+ lines
