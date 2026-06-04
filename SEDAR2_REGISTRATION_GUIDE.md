# SEDAR 2 Integration: Complete Registration & Setup Guide

## Overview

**SEDAR 2** (System for Electronic Document Analysis and Retrieval Plus) is the Canadian regulatory filing platform operated by the Canadian Securities Administrators (CSA). It is the central repository for all prospectuses, annual reports, material change reports, insider trading filings, and continuous disclosure documents filed by Canadian issuers on TSX, TSXV, CSE, and other Canadian exchanges.

**IPOReady Use Case:** Read-only access to check a company's filing status, retrieve prospectus documents, and verify regulatory compliance during the IPO journey.

---

## Phase 1: Account Registration (5–10 minutes)

### Step 1: Create a SEDAR 2 Account

1. Navigate to **https://www.sedarplus.ca**
2. Click **"Register"** or **"Create Account"** in the top-right corner
3. You will be taken to the registration page: `https://www.sedarplus.ca/register`

### Step 2: Select Your Account Type

SEDAR 2 offers multiple account types:

| Account Type | Best For | Features |
|---|---|---|
| **Public Search User** | Viewing public filings, no upload | Free, no login required (but registration is free + has saved searches) |
| **Registered User** | Companies, advisors, filing agents | Can access historical filing activity, saved searches, watch lists |
| **Filing Agent** | Law firms, accountants filing on behalf of issuers | Can upload documents, file prospectuses, material change reports |

**For IPOReady:** Register as a **Registered User** (not Filing Agent yet—that requires additional CSA authorization).

### Step 3: Complete Registration Form

Fill in the following fields:

| Field | Value | Notes |
|---|---|---|
| **First Name** | (Your first name or company representative) | |
| **Last Name** | (Your last name) | |
| **Email Address** | hello@ipoready.ai | Must be valid and monitored |
| **Password** | (Strong: 12+ chars, mixed case, symbols) | Save securely in password manager |
| **Account Type** | Registered User | Selected in Step 2 |
| **Company Name** | IPOReady Inc. | Official legal name |
| **Company Type** | Technology / Software as a Service | Or select "Other" |
| **Address** | (Your office address) | Must be complete |
| **Jurisdiction** | Canada (select province) | For Canadian-registered businesses |
| **Phone Number** | +1-XXX-XXX-XXXX | For verification if needed |

### Step 4: Verify Your Email

After submitting the registration:

1. **Email Verification**: Check your inbox at `hello@ipoready.ai` for a verification email from SEDAR 2
2. **Subject Line**: "SEDAR+ Email Verification" or similar
3. **Action**: Click the verification link (expires in 24 hours)
4. **Confirmation**: Once verified, you can log in to SEDAR 2

**Timeline:** Verification is usually instant, but can take up to 2 hours during high traffic periods.

### Step 5: Set Up Two-Factor Authentication (Recommended)

1. Log in to your SEDAR 2 account
2. Go to **Settings → Account Security** (or similar path)
3. Enable **Two-Factor Authentication (2FA)**
4. Choose your preferred method:
   - **Authenticator app** (Google Authenticator, Microsoft Authenticator, Authy)
   - **SMS text message** (if available)
5. Follow the setup prompts and save your backup recovery codes in a safe location

---

## Phase 2: API Access (Filing Agent Registration) — 1–2 weeks

### Why API Access?

For IPOReady to automatically check a company's filing status without manual login, you need **API credentials**. This requires registering as a **Filing Agent** with the CSA.

### Step 1: Apply for Filing Agent Status

**Note:** Only law firms, accountancy firms, and registered tax advisors can register as Filing Agents. If IPOReady is a pure SaaS platform (not a filing firm), you have two options:

#### Option A: Partner with a Registered Filing Agent (Recommended for Phase 1)

1. Partner with a Canadian law firm or accounting firm that already has SEDAR 2 Filing Agent status
2. Request their **API credentials** for read-only access
3. Sign a data sharing agreement
4. Use their API keys in your `.env.local` file under `SEDAR2_API_KEY` and `SEDAR2_API_SECRET`

**Example Partners:** Osler, Cassels & Brinsmead LLP (Toronto); Miller Thomson (multi-city); Davies (Toronto)

#### Option B: Apply Directly as a Technology Service Provider (Phase 2)

1. Contact the **CSA directly** at:
   - **Email:** consultation@securities-administrators.ca
   - **Phone:** 1-855-NCA-HELP (1-855-622-4357)
   
2. Submit a proposal explaining:
   - IPOReady's role as a filing workflow platform
   - How read-only SEDAR 2 access enhances the user experience
   - Data security and handling practices
   - Whether you will support filing agent operations

3. CSA will review and either:
   - Grant API access as a technology service provider, or
   - Require partnership with a registered filing agent

**Timeline:** 2–4 weeks for review. Expect follow-up questions.

### Step 2: Obtain SEDAR 2 API Credentials

Once approved as a Filing Agent (or partnered with one), you will receive:

| Credential | Format | Storage |
|---|---|---|
| **API Key** | alphanumeric string (e.g., `SEDAR2_ABC123XYZ`) | `.env.local`: `SEDAR2_API_KEY` |
| **API Secret** | longer alphanumeric string (secure token) | `.env.local`: `SEDAR2_API_SECRET` |
| **API Base URL** | `https://www.sedarplus.ca/api/v1` (production) | `.env.local`: `SEDAR2_BASE_URL` |
| **API Documentation URL** | https://www.sedarplus.ca/api-documentation | For reference |

**Security:** Store credentials in `.env.local` (never committed to git). Use environment variables in production (Vercel dashboard).

### Step 3: Request Sandbox Access

Before going live, test against SEDAR 2's sandbox environment:

1. Contact your CSA liaison or SEDAR 2 support at **sedar.support@nca-afc.ca**
2. Request **sandbox API credentials** (separate from production)
3. Sandbox base URL: `https://www.sedarplus.ca/sandbox/api/v1`
4. Store sandbox credentials separately:
   - `SEDAR2_SANDBOX_API_KEY`
   - `SEDAR2_SANDBOX_API_SECRET`

**Sandbox Features:**
- No real company data (test data only)
- No rate limiting (unlimited requests for testing)
- Documents are not archived—data resets periodically
- Perfect for integration testing and QA

---

## Phase 3: Integration Configuration

### Add SEDAR 2 Credentials to .env.local

Copy the template values into your `.env.local` file:

```bash
# SEDAR 2 Production
SEDAR2_API_KEY=your_sedar2_api_key_here
SEDAR2_API_SECRET=your_sedar2_api_secret_here
SEDAR2_BASE_URL=https://www.sedarplus.ca/api/v1
SEDAR2_ENVIRONMENT=production

# SEDAR 2 Sandbox (for testing)
SEDAR2_SANDBOX_API_KEY=your_sedar2_sandbox_api_key_here
SEDAR2_SANDBOX_API_SECRET=your_sedar2_sandbox_api_secret_here

# SEDAR 2 Configuration
SEDAR2_REQUEST_TIMEOUT=15000
SEDAR2_CACHE_TTL=3600
SEDAR2_SEARCH_MODE=exact_match
SEDAR2_AUTO_RETRY_ENABLED=true
SEDAR2_MAX_RETRIES=3
```

### Recommended Node.js Integration Library

For Node.js/TypeScript integration, consider using:

```typescript
// Example: @sedar/api-client (hypothetical library)
import { SEDARClient } from '@sedar/api-client';

const sedarClient = new SEDARClient({
  apiKey: process.env.SEDAR2_API_KEY,
  apiSecret: process.env.SEDAR2_API_SECRET,
  baseURL: process.env.SEDAR2_BASE_URL,
  timeout: parseInt(process.env.SEDAR2_REQUEST_TIMEOUT || '15000'),
});

// Check if a company has a prospectus on file
const prospectusStatus = await sedarClient.searchFilings({
  companyName: 'TechCorp Technologies Inc.',
  documentType: 'prospectus',
  startDate: '2024-01-01',
});
```

Or use a standard HTTP client (axios, node-fetch):

```typescript
import axios from 'axios';

const response = await axios.get(
  `${process.env.SEDAR2_BASE_URL}/filings/search`,
  {
    params: {
      query: 'TechCorp Technologies Inc.',
      documentType: 'prospectus',
    },
    headers: {
      Authorization: `Bearer ${process.env.SEDAR2_API_KEY}`,
      'X-API-Secret': process.env.SEDAR2_API_SECRET,
    },
    timeout: 15000,
  }
);
```

---

## API Reference: Key Endpoints

Once you have API access, you can use these endpoints to power IPOReady's filing status checks:

### 1. Company Search

**Endpoint:** `GET /api/v1/companies/search`

**Purpose:** Look up a company by name (with fuzzy matching) to get their SEDAR 2 profile.

**Query Parameters:**
- `query` (string): Company name (e.g., "TechCorp Technologies")
- `jurisdiction` (string, optional): Province code (e.g., "ON", "BC") to narrow results

**Response Example:**
```json
{
  "companies": [
    {
      "cik": "0001234567",
      "name": "TechCorp Technologies Inc.",
      "jurisdiction": "Ontario",
      "status": "active",
      "listingStatus": "listed",
      "exchanges": ["TSXV"],
      "sic": "7372",
      "sic_description": "Services-Prepackaged Software",
      "ceoName": "John Smith",
      "cfoName": "Jane Doe"
    }
  ]
}
```

### 2. Filing Status

**Endpoint:** `GET /api/v1/companies/{cik}/filings`

**Purpose:** Get all filings for a specific company (identified by their SEDAR 2 CIK number).

**Query Parameters:**
- `documentType` (string, optional): Filter by type (e.g., "prospectus", "annual_report", "material_change_report", "insider_trading")
- `startDate` (date, optional): Only filings after this date (YYYY-MM-DD format)
- `endDate` (date, optional): Only filings before this date
- `limit` (integer, default 100): Max results to return

**Response Example:**
```json
{
  "cik": "0001234567",
  "company": "TechCorp Technologies Inc.",
  "filings": [
    {
      "filingId": "F-20240315-001",
      "documentType": "prospectus",
      "title": "Prospectus - Qualifying Transaction",
      "filedDate": "2024-03-15",
      "status": "accepted",
      "url": "https://www.sedarplus.ca/filings/F-20240315-001",
      "pages": 142,
      "size_mb": 3.2
    },
    {
      "filingId": "M-20240301-045",
      "documentType": "material_change_report",
      "title": "Material Change Report - Board Appointment",
      "filedDate": "2024-03-01",
      "status": "accepted",
      "url": "https://www.sedarplus.ca/filings/M-20240301-045",
      "pages": 8,
      "size_mb": 0.5
    }
  ]
}
```

### 3. Document Retrieval

**Endpoint:** `GET /api/v1/filings/{filingId}/documents`

**Purpose:** Download the actual prospectus, annual report, or other document.

**Query Parameters:**
- `format` (string, default "pdf"): Return format ("pdf", "html", "xml")

**Response:** Binary PDF file or structured document

### 4. Insider Trading Filings

**Endpoint:** `GET /api/v1/companies/{cik}/insider-filings`

**Purpose:** Get all insider trading disclosures (typically filed 10 days after transaction).

**Query Parameters:**
- `insiderName` (string, optional): Filter by officer/director name
- `startDate` (date, optional): Lookback window
- `transactionType` (string, optional): "purchase", "sale", "exercise"

**Response Example:**
```json
{
  "cik": "0001234567",
  "company": "TechCorp Technologies Inc.",
  "insiderFilings": [
    {
      "filingId": "IN-20240320-012",
      "insiderName": "John Smith",
      "insiderTitle": "Chief Executive Officer",
      "transactionDate": "2024-03-15",
      "transactionType": "purchase",
      "shares": 50000,
      "price": 0.45,
      "totalValue": 22500,
      "filedDate": "2024-03-20",
      "url": "https://www.sedarplus.ca/filings/IN-20240320-012"
    }
  ]
}
```

---

## Best Practices & Rate Limiting

### Rate Limits

- **Production API:** 100 requests per minute (1.67 per second)
- **Sandbox API:** No rate limiting (for testing)
- **Cache Strategy:** Cache results for `SEDAR2_CACHE_TTL` (default: 3600 seconds = 1 hour)

### Caching Strategy

For efficient API usage:

1. **Company lookups:** Cache for 24 hours (rarely change)
2. **Filing status:** Cache for 1 hour (check once per hour for active IPO companies)
3. **Document metadata:** Cache for 1 hour
4. **Insider filings:** Cache for 6 hours (lower priority)

### Retry Logic

Implement exponential backoff for rate limit (429) responses:

```typescript
const retryWithBackoff = async (fn, maxRetries = 3, delayMs = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.response?.status === 429 && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, i)));
        continue;
      }
      throw error;
    }
  }
};
```

---

## Troubleshooting

| Issue | Solution |
|---|---|
| **401 Unauthorized** | Check that `SEDAR2_API_KEY` and `SEDAR2_API_SECRET` are correct and not expired. Regenerate if needed. |
| **404 Company Not Found** | Company name may be slightly different than in SEDAR 2. Try fuzzy search with partial name (e.g., "TechCorp" instead of "TechCorp Technologies Inc."). |
| **429 Rate Limited** | Implement retry logic with exponential backoff. Space requests at least 600ms apart. |
| **Timeout Errors** | Increase `SEDAR2_REQUEST_TIMEOUT` from 15000ms to 30000ms if SEDAR 2 servers are slow. |
| **Sandbox vs Production Confusion** | Ensure `SEDAR2_BASE_URL` matches your intended environment (sandbox or production). Test against sandbox first. |

---

## Next Steps

1. **Register your SEDAR 2 account** using Steps 1–5 above (5 minutes)
2. **Request API access** by working with CSA or a registered filing agent (1–2 weeks)
3. **Add credentials to `.env.local`** once you receive them
4. **Test against sandbox** before going live
5. **Build the IPOReady integration** to check filing status on the dashboard

---

## Reference Links

- **SEDAR 2 Main Portal:** https://www.sedarplus.ca
- **SEDAR 2 API Documentation:** https://www.sedarplus.ca/api-documentation
- **CSA Contact:** consultation@securities-administrators.ca
- **SEDAR Support:** sedar.support@nca-afc.ca
- **Quick Company Search (no login required):** https://www.sedarplus.ca/filings

---

**Document Version:** 1.0  
**Last Updated:** June 2026  
**Created for:** IPOReady Phase 1 Integration Checklist
