# Integration Test Suite - Quick Start

Get the integration test suite running in 5 minutes.

## 1. Install Dependencies (already done)

```bash
npm install
```

## 2. Create Test Environment

```bash
# Copy environment template
cp tests/integration/.env.example .env.test

# Edit with your credentials (or use defaults for local testing)
nano .env.test
```

**Minimum required in .env.test:**
```
DATABASE_URL=postgresql://user:password@localhost:5432/ipoready_test
NODE_ENV=test
```

## 3. Setup Test Database

```bash
# Create test database
createdb ipoready_test

# Run migrations
npm run db:migrate
```

**Verify database created:**
```bash
psql -l | grep ipoready_test
```

## 4. Run All Tests

```bash
jest --config tests/integration/jest.config.js
```

## 5. View Coverage

```bash
jest --config tests/integration/jest.config.js --coverage
```

---

## Common Commands

| Task | Command |
|------|---------|
| Run all tests | `jest --config tests/integration/jest.config.js` |
| Watch mode | `jest --config tests/integration/jest.config.js --watch` |
| Run specific suite | `jest --config tests/integration/jest.config.js api/` |
| Run single test | `jest --config tests/integration/jest.config.js -t "test name"` |
| With coverage | `jest --config tests/integration/jest.config.js --coverage` |
| Verbose output | `jest --config tests/integration/jest.config.js --verbose` |

---

## Test Suites Included

✅ **Database** - 15+ tests for all migrations  
✅ **API** - 52+ tests for documents, company, payments  
✅ **Auth** - 45+ tests for OAuth and sessions  
✅ **Data Integrity** - 40+ tests for deduplication  
✅ **Cloud Storage** - 45+ tests for Google Drive sync  

---

## Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| "Database does not exist" | Run `createdb ipoready_test` |
| "connect ECONNREFUSED" | Start PostgreSQL: `pg_ctl start` |
| "module not found" | Run `npm install` |
| Tests timeout | Increase: `jest --testTimeout=60000` |
| See all output | Add `--verbose` flag |

---

## Next Steps

1. **Read Full Docs** → See [README.md](./README.md)
2. **Detailed Execution** → See [EXECUTION_GUIDE.md](./EXECUTION_GUIDE.md)
3. **Test Metrics** → See [TEST_SUITE_SUMMARY.md](./TEST_SUITE_SUMMARY.md)
4. **Add to CI/CD** → Follow GitHub Actions setup in EXECUTION_GUIDE.md

---

## File Structure

```
tests/integration/
├── QUICK_START.md              # This file
├── README.md                   # Full documentation
├── EXECUTION_GUIDE.md          # Detailed commands
├── TEST_SUITE_SUMMARY.md       # Test metrics
├── jest.config.js              # Jest config
├── jest.setup.ts               # Test setup
├── test-utils.ts               # Shared utilities
├── .env.example                # Environment template
│
├── database/
│   └── migrations.test.ts
├── api/
│   ├── documents.test.ts
│   ├── company.test.ts
│   ├── stripe-payment.test.ts
│   └── error-handling.test.ts
├── auth/
│   ├── oauth.test.ts
│   └── session.test.ts
├── data-integrity/
│   └── deduplication.test.ts
└── cloud-storage/
    └── google-drive.test.ts
```

---

## Tips

💡 **Watch Mode for Development**
```bash
jest --config tests/integration/jest.config.js --watch
```
Re-runs tests automatically when files change.

💡 **Fast Feedback Loop**
```bash
jest --config tests/integration/jest.config.js api/documents.test.ts --watch
```
Focus on one test file while developing.

💡 **Debug Specific Test**
```bash
jest --config tests/integration/jest.config.js -t "should return documents" --verbose
```
Run one test with full output.

---

**Status:** ✅ Ready to run  
**Test Cases:** 197+  
**Database:** Required (PostgreSQL)  
**Setup Time:** ~5 minutes
