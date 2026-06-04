# SEDAR 2 & SEC EDGAR Integration Setup Guide

## Phase 1: Sandbox Account Setup (Days 1-3)

This guide walks you through registering with SEDAR 2 and SEC EDGAR sandbox environments for testing the IPOReady filing system integration.

---

## Part 1: SEDAR 2 Sandbox Registration (Canada)

### Step 1.1: Create SEDAR Developer Account

1. **Go to:** https://www.sedar.com/developers
2. **Click:** "Register for Developer Access"
3. **Fill in:**
   - Company Name: [Your Company]
   - Business Registration Number (BRN): [Your BRN]
   - Contact Email: [Your Email]
   - Contact Phone: [Your Phone]
   - Intended Use: "IPO Filing Integration Platform"
4. **Agree to Terms:** Check "I agree to SEDAR Developer Terms"
5. **Submit Application**

**Expected Timeline:** 2-3 business days for approval

### Step 1.2: Get Sandbox Credentials

Once approved:

1. **Log In:** https://sandbox-api.sedar.ca/console
2. **Navigate:** Settings → API Keys
3. **Create New Key:**
   - Name: "IPOReady Sandbox"
   - Scopes:
     - `filing.submit`
     - `filing.status`
     - `filing.document.upload`
   - Webhook URL: `https://yourdomain.com/api/filing-webhook/sedar2`
4. **Copy:**
   - Client ID (starts with `sedar_client_`)
   - Client Secret (store securely in `.env`)

### Step 1.3: Create Test Company in SEDAR

1. **Log In:** https://sandbox-api.sedar.ca/console
2. **Go To:** Test Company Management
3. **Create Test Company:**
   - Legal Name: "Test IPO Corp"
   - Province of Incorporation: "ON" (Ontario)
   - Business Number: Any valid 9-digit number for testing
   - Type: "Public Company"
4. **Confirm:** Note the CIK number (e.g., `0000123456`)

**Store in `.env`:**
```
SEDAR2_CLIENT_ID=sedar_client_xxxxx
SEDAR2_CLIENT_SECRET=sedar_secret_xxxxx
SEDAR2_API_BASE_URL=https://sandbox-api.sedar.ca
SEDAR2_TEST_COMPANY_CIK=0000123456
```

---

## Part 2: SEC EDGAR Sandbox Setup (United States)

### Step 2.1: SEC CIK Registration

SEC EDGAR is a **public API** — no credentials needed, but you need a test CIK number.

**Option A: Use Existing Test CIK**
- If you have a CIK from previous SEC filings, use that for testing
- Format: 10 digits (e.g., `0000000001`)

**Option B: Get New Test CIK**
1. **Go To:** https://www.sec.gov/edgar/browse/?CIK=0
2. **Click:** "Create CIK"
3. **Fill in:**
   - Entity Type: "Domestic Business Corporation"
   - Company Name: "Test IPO Corp"
   - State: "DE" (Delaware)
4. **Submit**
5. **Note the CIK** (10 digits, often starts with many zeros)

### Step 2.2: Prepare Test Credentials

SEC EDGAR doesn't require OAuth2, but requires a User-Agent header.

**Store in `.env`:**
```
SEC_EDGAR_API_BASE_URL=https://www.sec.gov/cgi-bin
SEC_EDGAR_TEST_CIK=0000000001
SEC_EDGAR_USER_AGENT=IPOReady (hello@ipoready.com)
```

### Step 2.3: Test SEC EDGAR Connectivity (Optional)

To verify your CIK works:

```bash
curl -H "User-Agent: IPOReady (hello@ipoready.com)" \
  "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000000001&type=10-K&dateb=&owner=exclude&count=100&format=json"
```

You should get a JSON response with company info.

---

## Part 3: Environment Configuration

### Step 3.1: Copy Template

```bash
cp .env.example.sedar-edgar .env.local
```

### Step 3.2: Fill In Credentials

Edit `.env.local`:

```
# SEDAR 2
SEDAR2_CLIENT_ID=sedar_client_xxxxx
SEDAR2_CLIENT_SECRET=sedar_secret_xxxxx
SEDAR2_API_BASE_URL=https://sandbox-api.sedar.ca
SEDAR2_TEST_COMPANY_CIK=0000123456

# SEC EDGAR
SEC_EDGAR_API_BASE_URL=https://www.sec.gov/cgi-bin
SEC_EDGAR_TEST_CIK=0000000001
SEC_EDGAR_USER_AGENT=IPOReady (hello@ipoready.com)

# Logging (for debugging)
FILING_LOG_LEVEL=debug
FILING_LOG_API_CALLS=true
```

### Step 3.3: Restart Application

```bash
npm run dev
```

---

## Part 4: Validation Checklist

- [ ] SEDAR 2 developer account created
- [ ] SEDAR 2 sandbox API credentials obtained
- [ ] SEDAR 2 test company created and CIK noted
- [ ] SEC EDGAR test CIK obtained
- [ ] `.env.local` file populated with all credentials
- [ ] Application started and environment variables loaded
- [ ] Next: Run `/api/filing/test-submit` endpoint to test integration

---

## Timeline Summary

| Task | Effort | Duration |
|------|--------|----------|
| SEDAR 2 registration | 1 hour | 2-3 business days (approval) |
| SEDAR 2 credentials setup | 30 min | Immediate |
| SEC EDGAR test CIK | 30 min | Immediate |
| Environment configuration | 15 min | Immediate |
| **Total** | **2 hours** | **2-3 business days** |

---

## Troubleshooting

### SEDAR 2 Registration Stuck

- Verify business registration number is correct
- Check email for approval notifications
- Contact SEDAR2 support: support@sedar.ca

### SEC EDGAR CIK Not Working

- Verify 10-digit format (include leading zeros)
- Check SEC EDGAR database: https://www.sec.gov/cgi-bin/browse-edgar
- SEC only accepts requests with User-Agent header

### API Credentials Not Recognized

- Verify copied exactly (no extra spaces)
- Check `.env.local` is being loaded (restart app)
- Verify sandbox URLs (not production URLs)

---

## Next Steps

Once Phase 1 is complete, proceed to **Phase 2: API Integration**:

1. Run test endpoint: `POST /api/filing/test-submit`
2. Verify OAuth2 token acquisition
3. Test real submission with sample prospectus
4. Validate status tracking works
5. Test webhook callbacks

See `SEDAR_EDGAR_INTEGRATION_PHASE2.md` for Phase 2 implementation details.
