# Global Compliance Deployment Guide

**Target:** Launch IPOReady for US, Canada, and EU markets  
**Timeline:** 1-2 weeks to full global compliance  
**Status:** Components ready, integration in progress

---

## Phase 1: Database Migration (TODAY - 1 HOUR)

### Step 1.1: Run Migration Script

```bash
cd /Users/test/Documents/Claude/Projects/IPOReady

# Execute migration (automated, with minimal user interaction needed)
./migrate-to-montreal.sh
```

**What it does:**
- ✅ Backs up us-east-1 database
- ✅ Prompts you to create Montreal database in Neon console (2 minutes)
- ✅ Restores data to Montreal
- ✅ Updates .env.local automatically
- ✅ Verifies data integrity

**Outcome:** Database is now PIPEDA-compliant ✅

---

## Phase 2: Cookie Consent Banner (NEXT 2 HOURS)

### Step 2.1: Add Cookie Consent Component to App

Edit `/src/app/layout.tsx` to import and use the cookie consent component:

```tsx
import { CookieConsent } from '@/components/CookieConsent'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>
          {children}
          <CookieConsent />  // Add this line
          <ChatWidget />
          <ServiceWorkerRegister />
        </Providers>
      </body>
    </html>
  )
}
```

### Step 2.2: Deploy and Test

```bash
# Restart development server
npm run dev

# In browser:
# 1. Go to http://localhost:3000
# 2. Clear localStorage (DevTools → Application → Local Storage → Clear All)
# 3. Refresh page
# 4. Cookie consent banner should appear
# 5. Click "Customize" to see detailed options
# 6. Click "Accept All" to test consent logging
```

### Step 2.3: Verify Consent Logging

```bash
# Check that consent is being logged to database
psql "$NEON_MONTREAL_URL" -c "SELECT * FROM consent_records ORDER BY recorded_at DESC LIMIT 5;"

# Should show consent records with timestamps
```

**Outcome:** GDPR consent requirement met ✅

---

## Phase 3: CSRF Protection (NEXT 2 HOURS)

### Step 3.1: Add CSRF Middleware to All State-Changing Endpoints

Edit `/src/app/api/[endpoint]/route.ts` files (POST, PUT, DELETE, PATCH):

```typescript
import { validateCsrfMiddleware } from '@/lib/middleware/csrf'

export async function POST(req: NextRequest) {
  // Validate CSRF token
  const csrfError = await validateCsrfMiddleware(req)
  if (csrfError) return csrfError

  // Continue with normal processing
  // ...
}
```

### Step 3.2: Add CSRF Token to Forms/Requests

For forms in components:

```typescript
// Get token from response header or generate new one
const token = await fetch('/api/form-init').then(r => r.headers.get('x-csrf-token'))

// Include in form submission
fetch('/api/submit', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': token,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(formData),
})
```

### Step 3.3: Apply to Critical Endpoints

**High Priority (apply immediately):**
- POST /api/user/data-export
- POST /api/user/account-deletion
- PATCH /api/user/account-deletion
- POST /api/checkout
- POST /api/auth/callback

### Step 3.4: Test CSRF Protection

```bash
# Test that CSRF token is required
curl -X POST http://localhost:3000/api/user/data-export \
  -H "Content-Type: application/json" \
  -d '{"password":"test"}'

# Should return 403 (CSRF token missing)
# Expected: {"error":"CSRF token missing"}
```

**Outcome:** CSRF vulnerability eliminated ✅

---

## Phase 4: Rate Limiting (NEXT 2 HOURS)

### Step 4.1: Apply Rate Limiting to API Endpoints

Edit vulnerable endpoints with rate limiting middleware:

```typescript
import { rateLimitMiddleware, RATE_LIMITS } from '@/lib/middleware/ratelimit'

export async function POST(req: NextRequest) {
  // Apply rate limiting
  const rateLimitError = await rateLimitMiddleware(req, RATE_LIMITS.DATA_EXPORT)
  if (rateLimitError) return rateLimitError

  // Continue with normal processing
  // ...
}
```

### Step 4.2: Configure Limits by Endpoint

```typescript
// Auth endpoints - strict limits
POST /api/auth/login → RATE_LIMITS.AUTH_LOGIN (5 per 15 min)
POST /api/auth/signup → RATE_LIMITS.AUTH_SIGNUP (3 per hour)

// User data endpoints - moderate limits
POST /api/user/data-export → RATE_LIMITS.DATA_EXPORT (5 per hour)
POST /api/user/account-deletion → RATE_LIMITS.ACCOUNT_DELETE (1 per day)

// General API - lenient limits
GET /api/* → RATE_LIMITS.API_DEFAULT (100 per minute)
POST /api/* → RATE_LIMITS.API_STRICT (30 per minute)
```

### Step 4.3: Test Rate Limiting

```bash
# Test rate limit on login endpoint
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"test"}'
done

# First 5 requests should succeed
# 6th request should return 429 (Too Many Requests)
```

**Outcome:** API abuse prevented ✅

---

## Phase 5: DPA Execution (NEXT 2-3 DAYS)

### Step 5.1: DPA Checklist

Contact each vendor to execute/update Data Processing Agreements:

**Vendors requiring DPA:**
- [ ] **Stripe** (Payment processing)
  - Contact: legal@stripe.com
  - What they need: Your company info, data categories, retention periods
  - Template available: Stripe has standard DPA

- [ ] **Resend** (Email delivery)
  - Contact: support@resend.com
  - What they need: DPA terms agreement

- [ ] **Twilio** (SMS/WhatsApp)
  - Contact: legal@twilio.com
  - What they need: Business Associate Agreement (BAA)

- [ ] **Slack** (Optional integration)
  - Contact: legal@slack.com
  - What they need: Data Processing Terms

- [ ] **Google** (OAuth/Analytics)
  - Contact: Google Cloud console
  - What they need: Data Controller agreement

- [ ] **LinkedIn** (OAuth)
  - Contact: legal@linkedin.com
  - What they need: Data Processing Terms

### Step 5.2: DPA Template

Email template to vendors:

```
Subject: Data Processing Agreement Required

Dear [Vendor],

We are integrating your service ([Vendor Name]) into our platform, IPOReady.
As we process personal data through your service, we need a Data Processing 
Agreement (DPA) or Business Associate Agreement (BAA) in place.

Our requirements:
- Agreement must comply with GDPR, PIPEDA, and CCPA
- Must clearly state your data processing obligations
- Must allow data transfers to Canada (Montreal)
- Must include standard clauses for international transfers
- Data retention period: [specify]

Could you please provide your standard DPA or confirm you have one available?

Company: IPOReady Inc.
Data Categories: [email, financial data, company info, etc.]
Jurisdiction: US (California), Canada (Ontario), EU (GDPR)

Best regards,
[Your Name]
Privacy Officer
```

### Step 5.3: Track DPA Status

Update `/src/lib/compliance-schema.sql` with actual signed dates:

```sql
UPDATE data_processing_agreements
SET status = 'signed', signed_date = NOW()
WHERE vendor_name = 'Stripe';
```

**Outcome:** Vendor accountability established ✅

---

## Phase 6: Final Verification (FINAL CHECKLIST)

### Step 6.1: Functionality Testing

```bash
# 1. Database migration successful
psql "$NEON_MONTREAL_URL" -c "SELECT COUNT(*) FROM companies;"
# Should return row count

# 2. Cookie consent banner shows
# Clear localStorage and refresh browser

# 3. CSRF protection working
curl -X POST http://localhost:3000/api/user/data-export \
  -d '{"password":"test"}' \
# Should return 403 Forbidden (CSRF token missing)

# 4. Rate limiting working
for i in {1..101}; do
  curl -s http://localhost:3000/api/health
done | grep -c "429"
# Should return >0 (some requests rate-limited)

# 5. Privacy API endpoints working
curl -X POST http://localhost:3000/api/user/data-export \
  -H "Content-Type: application/json" \
  -d '{"password":"YOUR_REAL_PASSWORD"}'
# Should download JSON data file

curl -X GET http://localhost:3000/api/user/account-deletion
# Should return deletion status
```

### Step 6.2: Compliance Audit

```bash
# Verify all compliance components
echo "=== COMPLIANCE VERIFICATION ==="

# 1. Legal pages accessible
curl -s http://localhost:3000/privacy | head -100
curl -s http://localhost:3000/terms | head -100
curl -s http://localhost:3000/disclaimer | head -100

# 2. Privacy settings page accessible
curl -s http://localhost:3000/account/privacy-settings | head -100

# 3. Database tables exist
psql "$NEON_MONTREAL_URL" -c "\dt" | grep -E "(audit_logs|consent|deletion|dpa)"

# 4. Audit logs recording
psql "$NEON_MONTREAL_URL" -c "SELECT COUNT(*) FROM audit_logs;"

# All checks should return positive results ✅
```

### Step 6.3: Production Readiness

Verify before launching to customers:

- [ ] Database in Montreal (ca-east-1)
- [ ] Cookie consent banner deployed
- [ ] Privacy pages published and accessible
- [ ] Data export API working
- [ ] Account deletion API working
- [ ] CSRF protection active
- [ ] Rate limiting active
- [ ] Audit logging operational
- [ ] DPAs executed with vendors
- [ ] Privacy policy matches actual processing
- [ ] Disclaimer clearly visible
- [ ] User can access privacy settings

---

## Timeline & Dependencies

```
Day 1: Database migration (1 hour)
       ↓
Day 2: Cookie consent + DPIA (4 hours)
       ↓
Day 3: CSRF + Rate limiting (4 hours)
       ↓
Day 4-5: DPA execution (async, parallel)
       ↓
Day 6: Final verification + testing (2 hours)
       ↓
READY FOR LAUNCH 🚀
```

---

## Rollback Plan

If issues occur at any phase:

### Rollback Phase 1 (Database)
```bash
# Restore connection string to us-east-1
sed -i 's/ca-east-1/us-east-1/g' .env.local
npm run dev
# Application reverts to old database immediately
```

### Rollback Phase 2-4 (Components)
Each component can be disabled independently:
- Cookie consent: Comment out `<CookieConsent />` in layout
- CSRF: Remove middleware from endpoints
- Rate limiting: Remove middleware from endpoints

---

## Support & Resources

### Documentation
- COMPLIANCE_CHECKLIST.md — Ongoing tracking
- COMPLIANCE_IMPLEMENTATION_SUMMARY.md — Quick reference
- DPIA_DATA_PROTECTION_IMPACT_ASSESSMENT.md — Legal document
- MIGRATION_QUICKSTART.md — Database migration guide

### Vendor Support
- Stripe: https://stripe.com/dpa
- Resend: support@resend.com
- Twilio: https://www.twilio.com/legal/privacy
- Google: myaccount.google.com/dpa

### Regulatory Resources
- GDPR (EU): https://gdpr-info.eu
- PIPEDA (Canada): https://www.priv.gc.ca/
- CCPA (California): https://oag.ca.gov/privacy/ccpa

---

## Next Actions (NOW)

1. ✅ Run migration script: `./migrate-to-montreal.sh`
2. ✅ Add CookieConsent component to layout
3. ✅ Deploy and test all phases
4. ✅ Execute DPAs with vendors
5. ✅ Final verification checklist
6. ✅ **LAUNCH FOR US + CANADA + EU** 🌍

---

**Status:** Ready for global launch after phases 1-6 complete  
**Expected Timeline:** 1-2 weeks  
**First Customers:** US + Canada ✅
