# Phase 1 Regulatory Integration: Credentials Checklist

## Overview

This checklist ensures all regulatory platform credentials and configurations are in place before IPOReady's pilot customer launch. The checklist is organized by platform (SEDAR 2, SEC EDGAR, SEDI) and includes setup timelines, required fields, and verification steps.

**Target Completion Date:** Before pilot launch (Day 0)  
**Responsible Team:** DevOps + Backend Engineering  
**Estimated Time:** 3–4 weeks (SEDAR 2 approval is the longest step)

---

## Phase 1A: Public & Free Integrations (Week 1–2)

These integrations require no registration or credentials—they are publicly accessible APIs.

### SEC EDGAR (US IPO Filings)

**Status Required:** ✅ Complete before MVP launch

**No API Key Required — Public Data Only**

- [ ] **Configuration Added to `.env.local`**
  - [ ] `EDGAR_API_BASE_URL=https://www.sec.gov/cgi-bin/browse-edgar`
  - [ ] `EDGAR_USER_AGENT=IPOReady/1.0 (+https://www.ipoready.ai; hello@ipoready.ai)`
  - [ ] `EDGAR_CIK_LOOKUP_URL=https://www.sec.gov/files/company_tickers.json`
  - [ ] `EDGAR_CACHE_TTL=86400` (24 hours)
  - [ ] `EDGAR_REQUEST_TIMEOUT=10000` (10 seconds)
  - [ ] `EDGAR_RATE_LIMIT_PER_SECOND=5`

- [ ] **Node.js Integration Library**
  - [ ] `npm install axios` (for HTTP requests)
  - [ ] Created `/src/lib/edgar.ts` or `/src/services/edgar-service.ts`
  - [ ] Implemented `getCompanyCIK(companyName: string)` function
  - [ ] Implemented `getRecentFilings(cik: string, formType: string)` function
  - [ ] Implemented `getCompanyFacts(cik: string)` function
  - [ ] Added error handling and retry logic

- [ ] **Testing (Sandbox = Live Data)**
  - [ ] Tested company CIK lookup with "Tesla" (expected: 0001652044)
  - [ ] Tested filing retrieval with Tesla CIK for form type "10-K"
  - [ ] Tested with a recent IPO company to verify S-1 filing data
  - [ ] Verified rate limiting (manual 11th request should fail)
  - [ ] Verified User-Agent header is present in all requests

- [ ] **Dashboard Integration**
  - [ ] Added SEC EDGAR status widget to `/integrations` page
  - [ ] Shows "Status: Connected ✓" (no auth required)
  - [ ] Added `/dashboard` filing status card (when company is US-listed)
  - [ ] Displays: "Prospectus filed [date]" or "Awaiting SEC filing"

- [ ] **Database Schema**
  - [ ] Added `edgar_filings` table to track cached filings
  - [ ] Columns: `company_id`, `form_type`, `accession_number`, `filing_date`, `status`, `cached_at`
  - [ ] Added index on `company_id` + `form_type` for fast lookup

**Timeline:** 3–5 days (no approvals required)

**Verification URL:** https://www.sec.gov/cgi-bin/browse-edgar?company=yourcompany&action=getcompany

---

### SEDI (Canadian Insider Trading)

**Status Required:** ✅ Recommended before launch (low effort, no API key)

**No API Key Required — Public Portal Only**

- [ ] **Configuration Added to `.env.local`**
  - [ ] `SEDI_PUBLIC_PORTAL_URL=https://www.sedi.ca`
  - [ ] `SEDI_SEARCH_EXPORT_URL=https://www.sedi.ca/sedi/SVTSearch.do`
  - [ ] `SEDI_CACHE_TTL=604800` (7 days)
  - [ ] `SEDI_LOOKBACK_DAYS=90` (insiders active in last 90 days)

- [ ] **Web Scraping or CSV Download Integration**
  - [ ] Decision made: Web scraping vs. CSV download
  - [ ] If scraping: `npm install cheerio puppeteer` installed
  - [ ] If CSV: created `/src/services/sedi-csv-downloader.ts`
  - [ ] Implemented error handling for portal changes
  - [ ] Created fallback to manual search URL if automated fails

- [ ] **Dashboard Integration**
  - [ ] Added SEDI status widget to `/integrations` page
  - [ ] Shows "Status: Live (Manual Import)" if not fully automated
  - [ ] Added insider trading alert modal on dashboard
  - [ ] Displays officer/director transactions in last 30 days

- [ ] **Testing (Live Data Only)**
  - [ ] Tested search for a real TSXV company (e.g., searched by company name)
  - [ ] Verified CSV download works (if applicable)
  - [ ] Tested insider name lookup
  - [ ] Verified date filtering (last 90 days)

**Timeline:** 2–3 days (lightweight integration)

**Verification URL:** https://www.sedi.ca

---

## Phase 1B: Regulatory Approval Required (Week 2–4)

### SEDAR 2 (Canadian IPO Filings)

**Status Required:** 🔄 In Progress (approval pending CSA review)

**Requires API Key from CSA or Registered Filing Agent Partnership**

### Step 1: Account Registration (Immediate)

- [ ] **SEDAR 2 Public Account Created**
  - [ ] Email: `hello@ipoready.ai` ✓ Registered
  - [ ] Password: Securely stored in password manager
  - [ ] Account type: Registered User
  - [ ] Verification email: ✓ Confirmed
  - [ ] Company name: IPOReady Inc.
  - [ ] Two-factor authentication (2FA): ✓ Enabled
  - [ ] Backup recovery codes: Stored securely

- [ ] **Can Access Public SEDAR 2 Portal**
  - [ ] Successfully logged in to https://www.sedarplus.ca
  - [ ] Can perform company searches (manual testing)
  - [ ] Can view filing status for TSX/TSXV companies

**Timeline:** Same day (5–10 minutes)

### Step 2: API Access Request (2–4 weeks)

Choose one of two paths:

#### Path A: Partner with Registered Filing Agent (Recommended for Phase 1)

- [ ] **Partner Identification**
  - [ ] Filing agent identified: `[Firm Name]` (e.g., "Osler, Cassels & Brinsmead LLP")
  - [ ] Primary contact name: `[Name]` with email/phone
  - [ ] Partnership terms: Data sharing agreement drafted
  - [ ] Execution date: `[Date]`

- [ ] **API Credentials Received**
  - [ ] API Key: `SEDAR2_API_KEY` stored in `.env.local` ✅
  - [ ] API Secret: `SEDAR2_API_SECRET` stored in `.env.local` ✅
  - [ ] Base URL: `https://www.sedarplus.ca/api/v1` confirmed
  - [ ] Support contact: Filing agent provided for support escalation
  - [ ] Rate limit: Confirmed with partner (typical: 100 req/min)

- [ ] **Sandbox Credentials Received**
  - [ ] Sandbox API Key: `SEDAR2_SANDBOX_API_KEY` stored in `.env.local` ✅
  - [ ] Sandbox API Secret: `SEDAR2_SANDBOX_API_SECRET` stored in `.env.local` ✅
  - [ ] Sandbox Base URL: `https://www.sedarplus.ca/sandbox/api/v1` confirmed
  - [ ] Data reset frequency: Confirmed with partner
  - [ ] Test data available: Confirmed with partner

**Timeline:** 3–7 days (if filing agent is responsive)

#### Path B: Direct CSA Application (Longer Path)

- [ ] **CSA Application Submitted**
  - [ ] Email submitted to: `consultation@securities-administrators.ca`
  - [ ] Submission date: `[Date]`
  - [ ] Application ID (if assigned): `[ID]`
  - [ ] Contents:
    - [ ] Executive summary of IPOReady and use case
    - [ ] Data security practices document
    - [ ] API integration architecture diagram
    - [ ] Privacy policy (how user data is handled)

- [ ] **CSA Review in Progress**
  - [ ] Status: Awaiting CSA response (2–4 weeks typical)
  - [ ] Follow-up email sent (if no response after 2 weeks): `[Date]`
  - [ ] Point of contact at CSA (if assigned): `[Name]`

- [ ] **API Credentials Issued**
  - [ ] API Key: `SEDAR2_API_KEY` stored in `.env.local` ✅
  - [ ] API Secret: `SEDAR2_API_SECRET` stored in `.env.local` ✅
  - [ ] Production URL: `https://www.sedarplus.ca/api/v1` confirmed
  - [ ] Sandbox URL: `https://www.sedarplus.ca/sandbox/api/v1` confirmed
  - [ ] Rate limit: `100 requests/minute` (standard)
  - [ ] Support contact: CSA provided (sedar.support@nca-afc.ca)

**Timeline:** 2–4 weeks

### Step 3: Configuration & Testing

- [ ] **Configuration Added to `.env.local`**
  - [ ] `SEDAR2_API_KEY=` (production)
  - [ ] `SEDAR2_API_SECRET=` (production)
  - [ ] `SEDAR2_BASE_URL=https://www.sedarplus.ca/api/v1`
  - [ ] `SEDAR2_ENVIRONMENT=production`
  - [ ] `SEDAR2_SANDBOX_API_KEY=` (for testing)
  - [ ] `SEDAR2_SANDBOX_API_SECRET=` (for testing)
  - [ ] `SEDAR2_REQUEST_TIMEOUT=15000`
  - [ ] `SEDAR2_CACHE_TTL=3600` (1 hour)
  - [ ] `SEDAR2_AUTO_RETRY_ENABLED=true`
  - [ ] `SEDAR2_MAX_RETRIES=3`

- [ ] **Node.js Integration**
  - [ ] Created `/src/lib/sedar2.ts` or `/src/services/sedar2-service.ts`
  - [ ] Implemented `searchCompany(companyName: string)` function
  - [ ] Implemented `getProspectusStatus(cik: string)` function
  - [ ] Implemented `getInsiderFilings(cik: string, days: number)` function
  - [ ] Added API key validation and error handling
  - [ ] Added request timeout and retry logic
  - [ ] Added cache layer (Redis or in-process)

- [ ] **Sandbox Testing**
  - [ ] Connected to sandbox environment successfully
  - [ ] Tested company search with sandbox test data
  - [ ] Tested prospectus status retrieval
  - [ ] Tested insider filing retrieval
  - [ ] Tested API error handling (401, 404, 429 responses)
  - [ ] Tested cache hits and misses
  - [ ] Verified no rate limiting in sandbox

- [ ] **Production Testing**
  - [ ] Connected to production environment successfully
  - [ ] Tested company search with real Canadian company (e.g., "Magna International")
  - [ ] Tested prospectus retrieval for a real TSXV IPO
  - [ ] Tested insider filing retrieval
  - [ ] Verified rate limiting behavior (implemented backoff)
  - [ ] Monitored API response times (target: < 5 seconds)
  - [ ] Verified caching reduces API calls by 80%+

- [ ] **Dashboard Integration**
  - [ ] Added SEDAR 2 status widget to `/integrations` page
  - [ ] Shows "Status: Connected ✓" (if API credentials verified)
  - [ ] Added `/dashboard` filing status card (when company is Canadian-listed)
  - [ ] Displays: "Prospectus filed [date]" or "Awaiting SEDAR 2 filing"
  - [ ] Added insider alert badge (if insiders have recent filings)

- [ ] **Database Schema**
  - [ ] Added `sedar2_filings` table to cache results
  - [ ] Columns: `company_id`, `document_type`, `filed_date`, `status`, `cached_at`
  - [ ] Added index on `company_id` for fast lookups
  - [ ] Created migration script

**Timeline:** 3–5 days (after credentials received)

---

## Phase 1C: Verification & Validation

### Cross-Platform Testing

- [ ] **Verify Dual-Exchange Company Lookup**
  - [ ] Selected test company: `[Company Name]` (lists on both TSX and NASDAQ)
  - [ ] SEDAR 2 lookup successful: ✓ (Canadian filing status)
  - [ ] SEC EDGAR lookup successful: ✓ (US filing status)
  - [ ] Dashboard shows both statuses correctly: ✓

- [ ] **Verify Rate Limiting Compliance**
  - [ ] SEDAR 2: Requests are space 600ms apart (100 req/min compliance)
  - [ ] SEC EDGAR: Requests are space 100ms apart (5 req/sec compliance)
  - [ ] User-Agent header present in all requests: ✓
  - [ ] No rejected requests due to rate limiting: ✓

- [ ] **Verify Caching Effectiveness**
  - [ ] SEDAR 2 filing status cached for 1 hour (SEDAR2_CACHE_TTL=3600)
  - [ ] SEC EDGAR data cached for 24 hours (EDGAR_CACHE_TTL=86400)
  - [ ] Repeated requests within TTL do not hit API: ✓
  - [ ] Cache invalidation works after TTL expires: ✓
  - [ ] Manual cache clear button works (admin endpoint): ✓

- [ ] **Verify Error Handling**
  - [ ] Invalid company name returns graceful "Not Found" message: ✓
  - [ ] Network timeout (no connection) handled with retry logic: ✓
  - [ ] Rate limiting (429) triggers exponential backoff: ✓
  - [ ] API errors (5xx) logged and don't break dashboard: ✓
  - [ ] All errors send alerts to backend monitoring: ✓

### Production Readiness Checklist

- [ ] **Security**
  - [ ] All API keys stored in `.env` (not hardcoded): ✓
  - [ ] API keys are different for dev/staging/production: ✓
  - [ ] Secrets are rotated annually: Scheduled
  - [ ] No API keys in git commit history: ✓ (git-secrets installed)
  - [ ] SSL/TLS verification enabled for all requests: ✓

- [ ] **Monitoring & Logging**
  - [ ] API response times logged: ✓
  - [ ] Failed requests logged with error context: ✓
  - [ ] Rate limit hits logged and alerted: ✓
  - [ ] Cache hit rate monitored (dashboard metric): ✓
  - [ ] Daily report sent to DevOps with summary: Scheduled

- [ ] **Documentation**
  - [ ] SEDAR 2 integration guide written: ✓ (SEDAR2_REGISTRATION_GUIDE.md)
  - [ ] SEC EDGAR integration guide written: ✓ (SEC_EDGAR_REGISTRATION_GUIDE.md)
  - [ ] API reference documented (endpoints, params, responses): ✓
  - [ ] Troubleshooting guide written: ✓
  - [ ] Onboarding for new team members: ✓

- [ ] **Performance**
  - [ ] Average API response time < 5 seconds: ✓
  - [ ] Dashboard loads with filing status in < 2 seconds: ✓
  - [ ] 99.5% uptime target met: ✓
  - [ ] No database query N+1 issues: ✓

---

## Phase 1D: Pre-Launch Sign-Off

### Checklist Summary Table

| Integration | Account Created | API Access | Configured | Tested | Dashboard Live | Ready for Launch |
|---|---|---|---|---|---|---|
| **SEC EDGAR** | ✓ (N/A) | ✓ (N/A) | ✅ | ✅ | ✅ | **YES** |
| **SEDI** | ✓ (N/A) | ✓ (N/A) | ✅ | ✅ | ⏳ | **READY** |
| **SEDAR 2** | ✅ | 🔄 | ⏳ | ⏳ | ⏳ | **PENDING** |
| **TSX/TSXV Status** | ✓ (N/A) | ✓ (N/A) | ⏳ | ⏳ | ⏳ | **PHASE 2** |
| **CSE Status** | ✓ (N/A) | ✓ (N/A) | ⏳ | ⏳ | ⏳ | **PHASE 2** |

**Legend:** ✅ Complete | 🔄 In Progress | ⏳ Not Started | ✓ (N/A) Not Applicable

### Sign-Off

- [ ] **Dev Lead:** `[Name]` — Integration code reviewed and approved
  - Date: `[Date]`
  - Notes: `[Comments]`

- [ ] **DevOps Lead:** `[Name]` — Credentials secured, monitoring configured
  - Date: `[Date]`
  - Notes: `[Comments]`

- [ ] **Product Lead:** `[Name]` — Feature requirements met, dashboard ready
  - Date: `[Date]`
  - Notes: `[Comments]`

- [ ] **Security Lead:** `[Name]` — API keys rotated, SSL verified, no secrets in git
  - Date: `[Date]`
  - Notes: `[Comments]`

---

## Appendix: Credentials Template

Use this template to fill in your actual credentials once received:

```bash
# ───── SEC EDGAR (US) ─────
EDGAR_API_BASE_URL=https://www.sec.gov/cgi-bin/browse-edgar
EDGAR_USER_AGENT=IPOReady/1.0 (+https://www.ipoready.ai; hello@ipoready.ai)
EDGAR_CIK_LOOKUP_URL=https://www.sec.gov/files/company_tickers.json
EDGAR_CACHE_TTL=86400
EDGAR_REQUEST_TIMEOUT=10000
EDGAR_RATE_LIMIT_PER_SECOND=5
EDGAR_AUTO_RETRY_ENABLED=true
EDGAR_MAX_RETRIES=2

# ───── SEDAR 2 (Canada) ─────
SEDAR2_API_KEY=[RECEIVED FROM CSA OR FILING AGENT]
SEDAR2_API_SECRET=[RECEIVED FROM CSA OR FILING AGENT]
SEDAR2_BASE_URL=https://www.sedarplus.ca/api/v1
SEDAR2_ENVIRONMENT=production
SEDAR2_SANDBOX_API_KEY=[SANDBOX CREDENTIALS]
SEDAR2_SANDBOX_API_SECRET=[SANDBOX CREDENTIALS]
SEDAR2_REQUEST_TIMEOUT=15000
SEDAR2_CACHE_TTL=3600
SEDAR2_AUTO_RETRY_ENABLED=true
SEDAR2_MAX_RETRIES=3

# ───── SEDI (Canada, Public) ─────
SEDI_PUBLIC_PORTAL_URL=https://www.sedi.ca
SEDI_CACHE_TTL=604800
SEDI_LOOKBACK_DAYS=90
```

---

**Document Version:** 1.0  
**Last Updated:** June 2026  
**Responsible Party:** Engineering Lead  
**Review Frequency:** Weekly (until all items complete)
