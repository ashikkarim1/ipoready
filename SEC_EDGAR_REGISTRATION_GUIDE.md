# SEC EDGAR Integration: Complete Registration & Setup Guide

## Overview

**SEC EDGAR** (Electronic Data Gathering, Online Retrieval) is the United States Securities and Exchange Commission's free, public database of all financial disclosures filed by companies listed on US exchanges (NASDAQ, NYSE, OTC, etc.). It is the central repository for prospectuses (S-1, S-4), annual reports (10-K), quarterly reports (10-Q), insider trading (Form 4), and continuous disclosure documents.

**IPOReady Use Case:** Read-only access to check a company's prospectus filing status, retrieve SEC documents, and verify SEC compliance during the IPO journey for US-listed companies.

---

## Key Difference from SEDAR 2

**EDGAR is 100% public and free.** There is no registration, API key, or paid subscription required. You only need:

1. A valid **User-Agent header** in your HTTP requests (to identify IPOReady)
2. To comply with SEC rate limiting (10 requests per second max)

This makes SEC EDGAR integration much simpler than SEDAR 2.

---

## Phase 1: Public Access (No Registration Required)

### Understanding CIK Numbers

All US-listed companies have a **Central Index Key (CIK)** number, which is their unique identifier in the SEC system.

| Information | Format | Example |
|---|---|---|
| **CIK Number** | 10-digit zero-padded integer | 0001652044 (Tesla Inc.) |
| **Company Name** | Official legal name | Tesla, Inc. |
| **Stock Ticker** | Unique to exchange | TSLA (NASDAQ) |

### Step 1: Search for a Company CIK

#### Option A: Use the SEC's Direct CIK Search

1. Navigate to: **https://www.sec.gov/cgi-bin/browse-edgar**
2. In the **"Company name"** field, enter the company's legal name (e.g., "Tesla, Inc.")
3. Click **"Search"**
4. You will see a list of matching companies with their CIK numbers

**Example URL:**
```
https://www.sec.gov/cgi-bin/browse-edgar?company=tesla&owner=exclude&action=getcompany
```

**Result:**
```
Tesla, Inc.
CIK: 0001652044
SIC: 3711 - Motor Vehicles
State: DE (Delaware)
Phone: 512-516-8177
```

#### Option B: Use SEC's Bulk CIK Download

For rapid lookups or bulk operations, download the SEC's complete company ticker index:

1. Navigate to: **https://www.sec.gov/files/company_tickers.json**
2. This is a JSON file listing all ~10,000+ companies with CIK numbers and tickers
3. Cache this locally in your database and update it weekly

**File Structure:**
```json
{
  "0": {
    "cik_str": 1018724,
    "ticker": "FLWS",
    "title": "1-800 FLOWERS COM INC"
  },
  "1": {
    "cik_str": 1018838,
    "ticker": "FAST",
    "title": "FASTENAL CO"
  },
  ...
}
```

### Step 2: Find Filing Status

Once you have the **CIK**, you can view all filings:

1. Navigate to: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK={CIK}&type=S-1&dateb=&owner=exclude&count=100`
   
2. Replace `{CIK}` with the company's CIK (e.g., `0001652044` for Tesla)

3. Replace `S-1` with other document types:
   - `S-1` — Prospectus (IPO)
   - `S-4` — Merger prospectus
   - `10-K` — Annual report
   - `10-Q` — Quarterly report
   - `4` — Form 4 (insider trading)
   - `DEF 14A` — Proxy statement (AGM)

**Example: Tesla's prospectuses**
```
https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001652044&type=S-1&dateb=&owner=exclude&count=100
```

### Step 3: View Filing Details

For each filing, you will see:

| Column | Content |
|---|---|
| **Accession Number** | Unique filing ID (e.g., `0001193125-20-099629`) |
| **Filing Date** | Date filed with SEC |
| **Report Date** | Date of the document (e.g., balance sheet as of this date) |
| **Accepted** | SEC received and accepted the filing |
| **Form Type** | S-1, 10-K, etc. |

Click on the **filing link** to view the actual prospectus or document.

---

## Phase 2: API Integration (REST — No Key Required)

### SEC EDGAR Data APIs

EDGAR offers several REST APIs for programmatic access. All are free and require no API key:

### API 1: Company Facts

**Endpoint:** `https://data.sec.gov/api/xbrl/companyfacts/CIK{cik}.json`

**Purpose:** Get standardized financial data (balance sheet, income statement, cash flow) in JSON format.

**Parameters:**
- `{cik}` — Company CIK with leading zeros (e.g., `CIK0001652044`)

**Example:**
```
https://data.sec.gov/api/xbrl/companyfacts/CIK0001652044.json
```

**Response Structure:**
```json
{
  "cik": 1652044,
  "entityName": "Tesla Inc",
  "facts": {
    "us-gaap": {
      "AccountsPayable": [
        {
          "end": "2023-12-31",
          "val": 13427000000,
          "accn": "0001193125-24-008605",
          "fy": 2023,
          "fp": "FY",
          "form": "10-K",
          "filed": "2024-01-29"
        }
      ]
    }
  }
}
```

### API 2: Company Tickers

**Endpoint:** `https://www.sec.gov/files/company_tickers.json`

**Purpose:** Get mapping of all US public company tickers to CIK numbers.

**Example:**
```bash
curl -s https://www.sec.gov/files/company_tickers.json | jq '.[] | select(.ticker == "TSLA")'
```

**Response:**
```json
{
  "cik_str": 1652044,
  "ticker": "TSLA",
  "title": "Tesla, Inc."
}
```

### API 3: Filings Submissions

**Endpoint:** `https://data.sec.gov/submissions/CIK{cik}.json`

**Purpose:** Get recent filings for a company (last 100 filings by default).

**Example:**
```
https://data.sec.gov/submissions/CIK0001652044.json
```

**Response Structure:**
```json
{
  "cik": "1652044",
  "entityName": "Tesla Inc",
  "filings": {
    "recent": [
      {
        "accessionNumber": "0001193125-24-008605",
        "filingDate": "2024-01-29",
        "reportDate": "2023-12-31",
        "acceptanceDateTime": "2024-01-29T17:02:44.000Z",
        "act": "34",
        "form": "10-K",
        "fileNumber": "001-34787",
        "filmNumber": "24505256",
        "items": "1,1A,1B,1C,2,3,4,5,6,7,7A,8,9,9A,9B,10,11,12,13,14,15",
        "size": 5324584,
        "isXBRL": 1,
        "isInlineXBRL": 1,
        "primaryDocument": "tsla-20231231.htm",
        "primaryDocDescription": "10-K"
      }
    ]
  }
}
```

### API 4: Full Text Search

**Endpoint:** `https://www.sec.gov/cgi-bin/browse-edgar`

**Purpose:** Search all filings by document type, CIK, date range, or full-text keywords.

**Query Parameters:**
- `action=getcompany` — Get company overview
- `CIK={cik}` — Filter by company CIK
- `type={form_type}` — Filter by form type (S-1, 10-K, etc.)
- `dateb={date}` — Up to this date (YYYYMMDD)
- `owner=exclude` — Exclude insider filings (set to `include` to show them)
- `count={num}` — Number of results (max 100)

**Example:**
```
https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001652044&type=S-1&dateb=&owner=exclude&count=100
```

---

## Phase 3: Programmatic Integration

### Setup: User-Agent Header (Required)

The SEC requires all automated requests to include a **User-Agent header** identifying your application. This is their only rate limiting mechanism.

```typescript
const EDGAR_USER_AGENT = 'IPOReady/1.0 (+https://www.ipoready.ai; hello@ipoready.ai)';
```

### Node.js Implementation: Fetch Company CIK

```typescript
import axios from 'axios';

const EDGAR_USER_AGENT = 'IPOReady/1.0 (+https://www.ipoready.ai; hello@ipoready.ai)';

async function getCompanyCIK(companyName: string): Promise<string | null> {
  try {
    const response = await axios.get(
      'https://www.sec.gov/files/company_tickers.json',
      {
        headers: { 'User-Agent': EDGAR_USER_AGENT },
        timeout: 10000,
      }
    );

    const companies = Object.values(response.data) as Array<{
      cik_str: number;
      ticker: string;
      title: string;
    }>;

    // Fuzzy match on company name
    const match = companies.find((c) =>
      c.title.toLowerCase().includes(companyName.toLowerCase())
    );

    if (match) {
      return `${match.cik_str}`.padStart(10, '0');
    }

    return null;
  } catch (error) {
    console.error('Failed to fetch company CIK:', error);
    return null;
  }
}

// Usage
const cik = await getCompanyCIK('Tesla');
// Returns: '0001652044'
```

### Node.js Implementation: Fetch Recent Filings

```typescript
async function getRecentFilings(
  cik: string,
  formType: string = 'S-1'
): Promise<Array<{ accessionNumber: string; filingDate: string; form: string }>> {
  try {
    const response = await axios.get(
      `https://data.sec.gov/submissions/CIK${cik}.json`,
      {
        headers: { 'User-Agent': EDGAR_USER_AGENT },
        timeout: 10000,
      }
    );

    const filings = response.data.filings.recent || [];

    // Filter by form type and return relevant fields
    return filings
      .filter((f: any) => f.form === formType)
      .slice(0, 10)
      .map((f: any) => ({
        accessionNumber: f.accessionNumber,
        filingDate: f.filingDate,
        form: f.form,
        primaryDocument: f.primaryDocument,
        size: f.size,
      }));
  } catch (error) {
    console.error('Failed to fetch filings:', error);
    return [];
  }
}

// Usage
const filings = await getRecentFilings('0001652044', 'S-1');
```

### Node.js Implementation: Fetch Company Facts (Financial Data)

```typescript
async function getCompanyFacts(cik: string): Promise<any> {
  try {
    const response = await axios.get(
      `https://data.sec.gov/api/xbrl/companyfacts/CIK${cik}.json`,
      {
        headers: { 'User-Agent': EDGAR_USER_AGENT },
        timeout: 10000,
      }
    );

    return response.data;
  } catch (error) {
    console.error('Failed to fetch company facts:', error);
    return null;
  }
}

// Usage
const facts = await getCompanyFacts('0001652044');
// Extract financial metrics from facts.us-gaap
const revenues = facts.us-gaap.Revenues[0];
```

---

## Configuration: Add EDGAR Credentials to .env.local

```bash
# SEC EDGAR (Production)
EDGAR_API_BASE_URL=https://www.sec.gov/cgi-bin/browse-edgar
EDGAR_SUBMISSIONS_URL=https://data.sec.gov/submissions
EDGAR_USER_AGENT=IPOReady/1.0 (+https://www.ipoready.ai; hello@ipoready.ai)
EDGAR_CIK_LOOKUP_URL=https://www.sec.gov/files/company_tickers.json
EDGAR_XBRL_BASE_URL=https://data.sec.gov/api/xbrl/companyfacts
EDGAR_CACHE_TTL=86400
EDGAR_REQUEST_TIMEOUT=10000
EDGAR_RATE_LIMIT_PER_SECOND=5
EDGAR_AUTO_RETRY_ENABLED=true
EDGAR_MAX_RETRIES=2
EDGAR_FORM4_LOOKBACK_DAYS=30
```

---

## Rate Limiting & Best Practices

### Rate Limits

- **SEC EDGAR:** 10 requests per second maximum
- **Recommended IPOReady pace:** 5 requests per second (conservative buffer)
- **No API key required** — rate limiting is based on User-Agent + IP address

### Caching Strategy

For efficient operations:

1. **Company CIK lookups:** Cache for 7 days (CIK never changes)
2. **Filing submissions:** Cache for 6 hours (SEC updates nightly, so check once daily)
3. **Company facts (financials):** Cache for 24 hours
4. **Form 4 (insider trades):** Cache for 1 hour (look back 30 days)

### Retry Logic

Implement basic retry for network errors (not for 404/403 which are permanent):

```typescript
async function fetchWithRetry(
  url: string,
  maxRetries: number = 2
): Promise<Response> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await axios.get(url, {
        headers: { 'User-Agent': EDGAR_USER_AGENT },
        timeout: 10000,
      });
      return response;
    } catch (error: any) {
      if (error.response?.status >= 400 && error.response?.status < 500) {
        // 4xx errors are permanent (404 Not Found, 403 Forbidden)
        throw error;
      }
      if (i < maxRetries - 1) {
        // Network error, retry with backoff
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * Math.pow(2, i))
        );
        continue;
      }
      throw error;
    }
  }
}
```

---

## API Reference: Common Form Types

| Form Type | Full Name | Purpose |
|---|---|---|
| **S-1** | Registration Statement | IPO prospectus |
| **S-4** | Merger/Acquisition Prospectus | SPAC merger or acquisition |
| **S-3** | Simplified Registration | Secondary offering (existing public companies) |
| **10-K** | Annual Report | Year-end financial report |
| **10-Q** | Quarterly Report | Quarterly financial report |
| **10-Q/A** | Amended Quarterly Report | Correction to 10-Q |
| **8-K** | Current Report | Material event disclosure |
| **DEF 14A** | Proxy Statement | Annual shareholder meeting materials |
| **4** | Form 4 | Insider trading disclosure (officers/directors) |
| **3** | Form 3 | Initial insider filing (new officer/director) |
| **5** | Form 5 | Annual summary insider filing |
| **Schedule 13D** | Beneficial Ownership (5% threshold) | Activist investor notice |

---

## Common Queries

### Query 1: Has This Company Filed an IPO Prospectus?

```typescript
async function hasIPOProspectus(companyName: string): Promise<boolean> {
  const cik = await getCompanyCIK(companyName);
  if (!cik) return false;

  const filings = await getRecentFilings(cik, 'S-1');
  return filings.length > 0;
}
```

### Query 2: When Was the Most Recent 10-K Filed?

```typescript
async function getLatest10KDate(cik: string): Promise<string | null> {
  const response = await axios.get(
    `https://data.sec.gov/submissions/CIK${cik}.json`,
    { headers: { 'User-Agent': EDGAR_USER_AGENT } }
  );

  const filing = response.data.filings.recent.find(
    (f: any) => f.form === '10-K'
  );
  return filing?.filingDate || null;
}
```

### Query 3: What Are the Latest Insider Trades (Form 4)?

```typescript
async function getLatestInsiderTrades(
  cik: string,
  days: number = 30
): Promise<Array<any>> {
  const response = await axios.get(
    `https://data.sec.gov/submissions/CIK${cik}.json`,
    { headers: { 'User-Agent': EDGAR_USER_AGENT } }
  );

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return response.data.filings.recent
    .filter((f: any) => f.form === '4')
    .filter((f: any) => new Date(f.filingDate) > cutoffDate)
    .slice(0, 10);
}
```

---

## Sandbox & Testing

**Good news:** EDGAR is live only—there is no separate sandbox environment. 

For testing, you have two options:

### Option 1: Test with Public Real Data

Use companies you know well:
- **Apple:** CIK 0000320193
- **Microsoft:** CIK 0000789019
- **Tesla:** CIK 0001652044
- **Coca-Cola:** CIK 0000021344

### Option 2: Test with Recent IPO Data

Recent IPOs are great for testing:
- Search: https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&type=S-1&dateb=&owner=exclude&count=100&search_text=
- Pick a company, note its CIK, and test your queries against real data

---

## Troubleshooting

| Issue | Solution |
|---|---|
| **404 Company Not Found** | Company may be private or delisted. Try searching manually at https://www.sec.gov/cgi-bin/browse-edgar to verify it exists. |
| **Empty filings list** | Company may not have filed the form type you're searching for. Try searching for `10-K` or `8-K` (most companies have these). |
| **Rate limited (429)** | You are sending > 10 requests/second. Space requests 100ms apart or implement exponential backoff. |
| **Slow responses** | SEC servers can be slow during market hours. Increase timeout to 30000ms and implement caching. |
| **No User-Agent header error** | Always include `'User-Agent': EDGAR_USER_AGENT` in request headers. SEC rejects requests without it. |

---

## Next Steps

1. **Test manual searches** at https://www.sec.gov/cgi-bin/browse-edgar (5 minutes)
2. **Download company ticker index** and cache it locally
3. **Build the CIK lookup function** in IPOReady (simple REST call, ~30 lines of code)
4. **Build the filing status checker** to show when prospectus is received
5. **Add EDGAR to the Integrations page** (`/integrations`) with live "Status: Connected" badge

---

## Reference Links

- **EDGAR Main Portal:** https://www.sec.gov/edgar.shtml
- **Company Search (Manual):** https://www.sec.gov/cgi-bin/browse-edgar
- **Company Tickers JSON:** https://www.sec.gov/files/company_tickers.json
- **EDGAR API Documentation:** https://www.sec.gov/edgar/sec-api-documentation.html
- **XBRL Data API:** https://data.sec.gov/
- **SEC Contact:** https://www.sec.gov/info/contact.shtml

---

**Document Version:** 1.0  
**Last Updated:** June 2026  
**Created for:** IPOReady Phase 1 Integration Checklist  
**Complexity Level:** Beginner (No API key required, public data only)
