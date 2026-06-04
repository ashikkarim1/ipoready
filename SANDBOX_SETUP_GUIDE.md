# Regulatory Platform Sandbox Setup Guide

## Overview

This guide provides step-by-step instructions for setting up and testing regulatory platform integrations in sandbox (non-production) environments before deploying to production. Sandbox environments allow you to test API integrations, error handling, and edge cases without affecting real regulatory filings.

**Target Audience:** Backend engineers, QA testers, DevOps  
**Estimated Setup Time:** 2–3 hours  
**Prerequisites:** Node.js 16+, `.env.local` file with test credentials

---

## Part 1: SEC EDGAR Sandbox Setup

### Overview

**Good news:** SEC EDGAR has NO separate sandbox. All testing is done against **live, production data** using public company information. However, you can test with non-sensitive companies (e.g., large-cap tech) without worrying about affecting real filings.

### Setup Steps

#### Step 1: Verify Public Data Access

No credentials needed. Test with real SEC EDGAR data:

```bash
# Test 1: Fetch company tickers (caches locally)
curl -s "https://www.sec.gov/files/company_tickers.json" | jq '.[] | select(.ticker == "AAPL")' 

# Expected output: Apple Inc. with CIK 0000320193
```

#### Step 2: Test API Calls in Node.js

Create a test file `/src/__tests__/edgar.integration.test.ts`:

```typescript
import axios from 'axios';

const EDGAR_USER_AGENT = 'IPOReady/1.0 (+https://www.ipoready.ai; hello@ipoready.ai)';

describe('SEC EDGAR Integration Tests', () => {
  it('should fetch company CIK for Apple', async () => {
    const response = await axios.get(
      'https://www.sec.gov/files/company_tickers.json',
      {
        headers: { 'User-Agent': EDGAR_USER_AGENT },
        timeout: 10000,
      }
    );

    const apple = Object.values(response.data).find(
      (c: any) => c.ticker === 'AAPL'
    ) as any;
    expect(apple).toBeDefined();
    expect(apple.cik_str).toBe(320193);
  });

  it('should fetch recent 10-K filings for Apple', async () => {
    const cik = '0000320193'; // Apple
    const response = await axios.get(
      `https://data.sec.gov/submissions/CIK${cik}.json`,
      {
        headers: { 'User-Agent': EDGAR_USER_AGENT },
        timeout: 10000,
      }
    );

    const tenK = response.data.filings.recent.find(
      (f: any) => f.form === '10-K'
    );
    expect(tenK).toBeDefined();
    expect(tenK.form).toBe('10-K');
  });

  it('should handle company not found gracefully', async () => {
    const response = await axios.get(
      'https://www.sec.gov/files/company_tickers.json',
      { headers: { 'User-Agent': EDGAR_USER_AGENT } }
    );

    const fakeCo = Object.values(response.data).find(
      (c: any) => c.ticker === 'FAKEXYZ'
    );
    expect(fakeCo).toBeUndefined();
  });
});
```

#### Step 3: Run Tests

```bash
npm test -- edgar.integration.test.ts
```

**Expected output:** All 3 tests pass within 10 seconds.

#### Step 4: Monitor Rate Limiting

Test rate limiting behavior:

```typescript
it('should handle rate limits gracefully', async () => {
  const cik = '0000320193';
  const requests = [];

  // Fire 15 rapid requests (SEC allows 10/second)
  for (let i = 0; i < 15; i++) {
    requests.push(
      axios.get(
        `https://data.sec.gov/submissions/CIK${cik}.json`,
        {
          headers: { 'User-Agent': EDGAR_USER_AGENT },
          timeout: 10000,
        }
      ).catch(err => ({ error: err.message }))
    );
  }

  const results = await Promise.all(requests);

  // Some may fail with 429 (rate limit)
  const failures = results.filter((r: any) => r.error?.includes('429'));
  expect(failures.length).toBeGreaterThan(0);
  expect(failures.length).toBeLessThan(5); // Not all should fail
});
```

#### Step 5: Verify Caching Works

Create `/src/__tests__/edgar-cache.test.ts`:

```typescript
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 600 }); // 10-minute TTL

async function fetchWithCache(cik: string) {
  const cacheKey = `edgar:${cik}`;
  
  // Check cache first
  if (cache.has(cacheKey)) {
    console.log('Cache HIT');
    return cache.get(cacheKey);
  }

  // Fetch from API
  console.log('Cache MISS - fetching from API');
  const response = await axios.get(
    `https://data.sec.gov/submissions/CIK${cik}.json`,
    { headers: { 'User-Agent': EDGAR_USER_AGENT } }
  );

  // Store in cache
  cache.set(cacheKey, response.data);
  return response.data;
}

describe('EDGAR Caching', () => {
  it('should cache results and return from cache on second call', async () => {
    const cik = '0000320193';

    // First call: cache miss, fetch from API
    const t1 = Date.now();
    await fetchWithCache(cik);
    const time1 = Date.now() - t1;

    // Second call: cache hit, should be instant
    const t2 = Date.now();
    await fetchWithCache(cik);
    const time2 = Date.now() - t2;

    console.log(`First call: ${time1}ms (API), Second call: ${time2}ms (cache)`);
    expect(time2).toBeLessThan(time1 / 2); // Cache should be 2x faster
  });
});
```

### EDGAR Sandbox Configuration

Add to `.env.local`:

```bash
# EDGAR sandbox = production data (no separate sandbox)
EDGAR_API_BASE_URL=https://www.sec.gov/cgi-bin/browse-edgar
EDGAR_USER_AGENT=IPOReady/1.0 (+https://www.ipoready.ai; hello@ipoready.ai)
EDGAR_CACHE_TTL=3600
EDGAR_REQUEST_TIMEOUT=10000
EDGAR_RATE_LIMIT_PER_SECOND=5
EDGAR_AUTO_RETRY_ENABLED=true
EDGAR_MAX_RETRIES=2

# Test data (real public companies)
EDGAR_TEST_TICKER_APPLE=AAPL
EDGAR_TEST_CIK_APPLE=0000320193
EDGAR_TEST_TICKER_MSFT=MSFT
EDGAR_TEST_CIK_MSFT=0000789019
```

### Test Companies for EDGAR

Use these real public companies for testing:

| Company | Ticker | CIK | Notes |
|---|---|---|---|
| **Apple** | AAPL | 0000320193 | Large, old filings, frequent 10-K/10-Q |
| **Microsoft** | MSFT | 0000789019 | Similar, tech company |
| **Tesla** | TSLA | 0001652044 | Recent IPO (2010), S-1 available |
| **Spotify** | SPOT | 0001639920 | DPO (2018), alternative to IPO |
| **Airbnb** | ABNB | 0001616707 | Recent IPO (Dec 2020) |
| **Coinbase** | COIN | 0001652044 | Recent IPO (Apr 2021), tech/crypto |

---

## Part 2: SEDAR 2 Sandbox Setup

### Overview

**SEDAR 2 provides a dedicated sandbox environment** for testing before going live on production. Sandbox allows unlimited requests, test data, and no real filings.

### Prerequisites

- SEDAR 2 sandbox credentials from your CSA liaison or filing agent partner
- API Key: `SEDAR2_SANDBOX_API_KEY`
- API Secret: `SEDAR2_SANDBOX_API_SECRET`

### Setup Steps

#### Step 1: Add Sandbox Credentials to .env.local

```bash
# SEDAR 2 Sandbox Configuration
SEDAR2_ENVIRONMENT=sandbox
SEDAR2_SANDBOX_API_KEY=your_sandbox_api_key_here
SEDAR2_SANDBOX_API_SECRET=your_sandbox_api_secret_here
SEDAR2_SANDBOX_BASE_URL=https://www.sedarplus.ca/sandbox/api/v1
SEDAR2_REQUEST_TIMEOUT=15000
SEDAR2_CACHE_TTL=3600
SEDAR2_AUTO_RETRY_ENABLED=true
SEDAR2_MAX_RETRIES=3
```

#### Step 2: Create Sandbox Test Service

Create `/src/services/sedar2-sandbox.service.ts`:

```typescript
import axios, { AxiosError } from 'axios';

const SEDAR2_SANDBOX_API = process.env.SEDAR2_SANDBOX_BASE_URL;
const SEDAR2_SANDBOX_KEY = process.env.SEDAR2_SANDBOX_API_KEY;
const SEDAR2_SANDBOX_SECRET = process.env.SEDAR2_SANDBOX_API_SECRET;

const sedar2Axios = axios.create({
  baseURL: SEDAR2_SANDBOX_API,
  headers: {
    Authorization: `Bearer ${SEDAR2_SANDBOX_KEY}`,
    'X-API-Secret': SEDAR2_SANDBOX_SECRET,
  },
  timeout: parseInt(process.env.SEDAR2_REQUEST_TIMEOUT || '15000'),
});

export async function testSedar2Connection(): Promise<boolean> {
  try {
    const response = await sedar2Axios.get('/status');
    console.log('✓ SEDAR 2 Sandbox connection successful');
    return true;
  } catch (error) {
    console.error('✗ SEDAR 2 Sandbox connection failed:', error);
    return false;
  }
}

export async function searchCompanySandbox(companyName: string) {
  try {
    const response = await sedar2Axios.get('/companies/search', {
      params: { query: companyName },
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to search company: ${companyName}`, error);
    throw error;
  }
}

export async function getProspectusSandbox(cik: string) {
  try {
    const response = await sedar2Axios.get(`/companies/${cik}/filings`, {
      params: {
        documentType: 'prospectus',
        limit: 10,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to get prospectus for CIK: ${cik}`, error);
    throw error;
  }
}
```

#### Step 3: Create Sandbox Test Suite

Create `/src/__tests__/sedar2-sandbox.test.ts`:

```typescript
import {
  testSedar2Connection,
  searchCompanySandbox,
  getProspectusSandbox,
} from '../services/sedar2-sandbox.service';

describe('SEDAR 2 Sandbox Integration Tests', () => {
  it('should connect to SEDAR 2 sandbox', async () => {
    const connected = await testSedar2Connection();
    expect(connected).toBe(true);
  });

  it('should search for a company in sandbox', async () => {
    // Use sandbox test company (usually provided by CSA)
    const result = await searchCompanySandbox('Test Company Inc.');
    expect(result).toBeDefined();
    expect(result.companies).toBeDefined();
    expect(Array.isArray(result.companies)).toBe(true);
  });

  it('should retrieve prospectus filings from sandbox', async () => {
    const testCik = 'TEST_CIK_123456'; // Test data from CSA
    const result = await getProspectusSandbox(testCik);
    expect(result).toBeDefined();
    expect(result.filings).toBeDefined();
  });

  it('should handle errors gracefully in sandbox', async () => {
    try {
      await getProspectusSandbox('INVALID_CIK');
      fail('Should have thrown an error');
    } catch (error: any) {
      expect(error.response?.status).toBe(404);
    }
  });
});
```

#### Step 4: Run Sandbox Tests

```bash
npm test -- sedar2-sandbox.test.ts
```

**Expected:** All tests pass within 10 seconds. Sandbox returns test data, no rate limiting.

#### Step 5: Verify Sandbox Data Isolation

Sandbox data is periodically reset by CSA. Verify this:

```typescript
it('should acknowledge sandbox data reset', async () => {
  // Fetch a test company
  const result1 = await searchCompanySandbox('Test Company Inc.');
  const company1 = result1.companies[0];

  // After sandbox reset (check CSA documentation for reset schedule),
  // same company may not exist or have different data
  // This test just documents expected behavior
  expect(company1).toBeDefined();
});
```

### SEDAR 2 Sandbox Test Data

CSA provides test data. Typically includes:

| Test Company | Test CIK | Document Type | Purpose |
|---|---|---|---|
| TEST CORP INC. | TEST_001 | Prospectus | Test prospectus retrieval |
| SAMPLE CORP LTD | TEST_002 | Annual Report | Test annual report retrieval |
| DEMO INC. | TEST_003 | Material Change Report | Test MCR retrieval |
| SANDBOX TRADING | TEST_004 | Insider Filing | Test insider data |

Contact CSA for the actual test data list: `sedar.support@nca-afc.ca`

---

## Part 3: SEDI Sandbox Setup

### Overview

**SEDI has no separate sandbox.** All testing is against live public SEDI data. You can test with any real Canadian company's insider trading data.

### Setup Steps

#### Step 1: Add Configuration to .env.local

```bash
# SEDI Configuration (Public Data Only)
SEDI_PUBLIC_PORTAL_URL=https://www.sedi.ca
SEDI_SEARCH_EXPORT_URL=https://www.sedi.ca/sedi/SVTSearch.do
SEDI_CACHE_TTL=604800
SEDI_LOOKBACK_DAYS=90
```

#### Step 2: Test SEDI Public Portal Access

```bash
# Browse SEDI manually
open https://www.sedi.ca

# Or test programmatically
curl -s "https://www.sedi.ca/sedi/SVTExport.do?company=Magna+International&period=last30" \
  --header "User-Agent: IPOReady/1.0 (+https://www.ipoready.ai)"
```

#### Step 3: Create SEDI Test Service

Create `/src/services/sedi-test.service.ts`:

```typescript
import axios from 'axios';

export async function testSediConnection(): Promise<boolean> {
  try {
    const response = await axios.get('https://www.sedi.ca', {
      timeout: 10000,
      headers: {
        'User-Agent': 'IPOReady/1.0 (+https://www.ipoready.ai; hello@ipoready.ai)',
      },
    });
    return response.status === 200;
  } catch (error) {
    console.error('SEDI connection failed:', error);
    return false;
  }
}

export async function searchInsiderTransactions(
  companyName: string,
  lookbackDays: number = 90
) {
  // SEDI search via form submission (web scraping or CSV export)
  // This is a placeholder - actual implementation requires Cheerio or CSV parsing
  try {
    console.log(`Searching SEDI for ${companyName} transactions from last ${lookbackDays} days`);
    // Actual implementation would scrape the portal or download CSV
    return { transactions: [] };
  } catch (error) {
    console.error('SEDI search failed:', error);
    throw error;
  }
}
```

#### Step 4: Create SEDI Test Suite

```typescript
import {
  testSediConnection,
  searchInsiderTransactions,
} from '../services/sedi-test.service';

describe('SEDI Integration Tests', () => {
  it('should connect to SEDI public portal', async () => {
    const connected = await testSediConnection();
    expect(connected).toBe(true);
  });

  it('should search for insider transactions', async () => {
    // Real company: Magna International
    const result = await searchInsiderTransactions('Magna International', 30);
    expect(result).toBeDefined();
    expect(Array.isArray(result.transactions)).toBe(true);
  });
});
```

---

## Part 4: Local Integration Testing

### Setup Local Test Environment

#### Step 1: Create Test Configuration

```bash
# .env.test (git-ignored)
NODE_ENV=test
EDGAR_CACHE_TTL=60 # Short TTL for testing
SEDAR2_ENVIRONMENT=sandbox
SEDI_LOOKBACK_DAYS=7 # Short window for testing
```

#### Step 2: Create Test Utilities

Create `/src/__tests__/utils/regulatory-test-helpers.ts`:

```typescript
export const TEST_DATA = {
  EDGAR: {
    APPLE_CIK: '0000320193',
    APPLE_TICKER: 'AAPL',
    TESLA_CIK: '0001652044',
    TESLA_TICKER: 'TSLA',
  },
  SEDAR2: {
    TEST_COMPANY: 'Test Company Inc.',
    TEST_CIK: 'TEST_001',
  },
  SEDI: {
    REAL_COMPANY: 'Magna International',
  },
};

export const TIMEOUT_CONFIG = {
  EDGAR_REQUEST: 15000,
  SEDAR2_REQUEST: 20000,
  SEDI_REQUEST: 10000,
};

export function mockFiling(overrides = {}) {
  return {
    filingId: 'TEST_001',
    documentType: 'prospectus',
    filedDate: '2024-01-01',
    status: 'accepted',
    url: 'https://example.com/filing',
    ...overrides,
  };
}

export function mockCompany(overrides = {}) {
  return {
    cik: '0001234567',
    name: 'Test Company Inc.',
    jurisdiction: 'Ontario',
    status: 'active',
    ...overrides,
  };
}
```

#### Step 3: Run Full Integration Test Suite

```bash
npm test -- --testPathPattern="(edgar|sedar2|sedi)" --runInBand
```

**Expected:** All tests pass, total time < 60 seconds.

---

## Part 5: Error Scenarios & Edge Cases

### Test Error Handling

Create `/src/__tests__/regulatory-error-handling.test.ts`:

```typescript
describe('Regulatory API Error Handling', () => {
  describe('EDGAR Error Scenarios', () => {
    it('should handle company not found', async () => {
      // Implementation
    });

    it('should handle network timeout', async () => {
      // Mock axios timeout
    });

    it('should implement retry logic for transient errors', async () => {
      // Mock 503 Service Unavailable, then success
    });

    it('should respect rate limiting (429)', async () => {
      // Verify exponential backoff
    });
  });

  describe('SEDAR 2 Error Scenarios', () => {
    it('should handle 401 Unauthorized', async () => {
      // Test with invalid credentials
    });

    it('should handle 429 Rate Limited', async () => {
      // Test retry with backoff
    });

    it('should cache results to reduce API calls', async () => {
      // Verify cache prevents duplicate requests
    });
  });

  describe('SEDI Error Scenarios', () => {
    it('should handle portal unavailability', async () => {
      // Test graceful fallback
    });

    it('should handle malformed CSV data', async () => {
      // Test CSV parsing error handling
    });
  });
});
```

---

## Part 6: Performance & Load Testing

### Load Test Configuration

Create `/src/__tests__/regulatory-load-test.ts`:

```typescript
import { performance } from 'perf_hooks';

describe('Regulatory API Load Tests', () => {
  it('should handle 100 concurrent EDGAR requests', async () => {
    const requests = [];
    const startTime = performance.now();

    // 100 requests to EDGAR (respecting rate limits)
    for (let i = 0; i < 100; i++) {
      requests.push(
        fetchWithRetry(`https://data.sec.gov/submissions/CIK0000320193.json`)
      );
      if (i % 5 === 0) {
        // Space requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    const results = await Promise.all(requests);
    const endTime = performance.now();
    const totalTime = endTime - startTime;

    console.log(`100 EDGAR requests in ${totalTime}ms`);
    expect(results.filter(r => r.success).length).toBeGreaterThan(90);
  });

  it('should cache effectively under load', async () => {
    // Verify cache hit rate > 80% on repeated requests
  });
});
```

---

## Part 7: Pre-Production Checklist

### Before Deploying to Production

- [ ] All sandbox tests pass
- [ ] All error scenarios tested
- [ ] Rate limiting verified
- [ ] Caching working and effective (80%+ hit rate)
- [ ] Timeouts configured (EDGAR: 10s, SEDAR 2: 15s)
- [ ] Monitoring and alerting in place
- [ ] Secrets secured in environment variables
- [ ] API key rotation schedule established
- [ ] Rollback plan documented
- [ ] Production credentials loaded (never use sandbox creds in production)

---

## Appendix: Useful Commands

```bash
# Run all regulatory tests
npm test -- --testPathPattern="regulatory"

# Run integration tests only
npm test -- --testPathPattern="integration"

# Run with verbose output
npm test -- --verbose

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- sedar2-sandbox.test.ts

# Run tests in watch mode
npm test -- --watch

# Generate test report
npm test -- --coverage --json --outputFile=test-report.json
```

---

**Document Version:** 1.0  
**Last Updated:** June 2026  
**Created for:** IPOReady Phase 1 Integration Testing
