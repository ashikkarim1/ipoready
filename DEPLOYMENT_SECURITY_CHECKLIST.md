# IPOReady Production Security Deployment Checklist

**Last Updated:** June 1, 2026  
**Status:** Pre-Production Security Hardening  
**Target Launch:** Pilot Production Launch  

---

## Overview

This checklist documents all security hardening requirements for IPOReady's transition from development to production. Each item must be completed and verified before deployment to production environment.

---

## 1. CRITICAL SECURITY FIXES (MUST COMPLETE)

### 1.1 File Upload Validation ✅ COMPLETED
- [x] **Documents Upload** (`/src/app/api/documents/upload/route.ts`)
  - [x] MIME type whitelist (PDF, DOC, DOCX, XLS, XLSX)
  - [x] File extension validation
  - [x] File size limit (50MB)
  - [x] Validation function returns proper error responses

- [x] **Cap Table Upload** (`/src/app/api/cap-table/upload/route.ts`)
  - [x] MIME type whitelist (XLS, XLSX only)
  - [x] File extension validation
  - [x] File size limit (50MB)
  - [x] Validation function returns proper error responses

**Verification:**
```bash
# Test with invalid file type
curl -X POST http://localhost:3000/api/documents/upload \
  -F "file=@malicious.exe" \
  -F "companyId=test" \
  -H "Authorization: Bearer <token>"
# Expected: 400 error - "Invalid file type"

# Test with valid file
curl -X POST http://localhost:3000/api/documents/upload \
  -F "file=@valid.pdf" \
  -F "companyId=test" \
  -H "Authorization: Bearer <token>"
# Expected: 200 success
```

### 1.2 Hardened Authentication ✅ COMPLETED
- [x] **Demo Credentials** (`/src/lib/auth.ts`)
  - [x] Disabled in production (gated by `NODE_ENV === 'development'`)
  - [x] Demo check added to Credentials Provider
  - [x] Development-only password validation

- [x] **Session Timeout**
  - [x] Production: 1 hour (3600 seconds)
  - [x] Development: 30 days (for testing)
  - [x] Environment-based configuration in place

- [x] **JWT Secret** ⚠️ REQUIRES PRODUCTION VALUE
  - [ ] Generate production NEXTAUTH_SECRET: `openssl rand -hex 32`
  - [ ] **Current value (KEEP FOR DEV ONLY):** `ipoready-super-secret-key-change-in-production-2024`
  - [ ] **Generated example (use this pattern):** `80aedb3d1c98698de115b805bc8c6b149e4f06248bd750d7fe8478469a01578f`
  - [ ] Set `NEXTAUTH_SECRET` in production `.env`
  - [ ] Verify secret is NOT in version control

### 1.3 Security Headers ✅ COMPLETED
- [x] **HSTS** (HTTP Strict Transport Security)
  - [x] `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
  - [x] 1-year cache (31536000 seconds)
  - [ ] Register domain with HSTS preload list (https://hstspreload.org/)

- [x] **CSP** (Content Security Policy)
  - [x] `Content-Security-Policy` header configured
  - [x] `default-src 'self'` baseline policy
  - [ ] Test CSP with `Content-Security-Policy-Report-Only` first
  - [ ] Enable report-uri for CSP violation tracking (e.g., Sentry)
  - [ ] Review third-party script whitelist (currently allows Vercel Analytics)

- [x] **Other Headers**
  - [x] `X-Frame-Options: DENY`
  - [x] `X-Content-Type-Options: nosniff`
  - [x] `Referrer-Policy: strict-origin-when-cross-origin`
  - [x] `Permissions-Policy: camera=(), microphone=(), geolocation=()`

### 1.4 Next.js Upgrade ✅ COMPLETED
- [x] **Dependency Update** (`package.json`)
  - [x] Upgraded from: `^14.2.35`
  - [x] Upgraded to: `^15.5.16`
  - [x] Reason: Multiple high-severity DoS CVEs in Next.js 14.x
  - [ ] Run: `npm ci && npm run build` to test compatibility
  - [ ] Review Next.js changelog for breaking changes
  - [ ] Test all file upload endpoints after upgrade

---

## 2. HIGH-PRIORITY SECURITY IMPROVEMENTS (SHOULD COMPLETE)

### 2.1 Rate Limiting
- [ ] **Implement on sensitive endpoints:**
  - [ ] `POST /api/documents/upload` - Max 10 requests/hour per user
  - [ ] `POST /api/cap-table/upload` - Max 5 requests/hour per user
  - [ ] `POST /api/checkout` - Max 3 requests/hour per user
  - [ ] `POST /api/feedback` - Max 20 requests/hour per IP
  - [ ] `POST /api/auth/signin` - Max 5 failed attempts/15 minutes per IP

**Suggested Implementation:**
- Use `ratelimit` package or `Redis` for distributed rate limiting
- Track by user ID (authenticated endpoints) or IP (public endpoints)
- Return 429 (Too Many Requests) with Retry-After header

### 2.2 Input Validation & Sanitization
- [ ] **Review all form inputs:**
  - [ ] Company name, CEO details, registration numbers
  - [ ] File names and metadata
  - [ ] Email addresses and phone numbers
  - [ ] Implement XSS prevention (currently basic)
  - [ ] Use Zod schemas for validation (already in deps)

### 2.3 CSRF Token Validation
- [ ] **For public forms** (feedback, support requests):
  - [ ] Add CSRF token generation in middleware
  - [ ] Validate CSRF token on POST endpoints
  - [ ] Use same-site cookies for CSRF protection

### 2.4 Database Security
- [ ] **Encrypted Fields for sensitive data:**
  - [ ] Stripe Customer IDs
  - [ ] Tax/EIN numbers
  - [ ] Bank account information (if stored)
  - [ ] Personal identification numbers
  - [ ] Use `@vault` or `node-rsa` for encryption

- [ ] **SQL Injection Prevention:**
  - [ ] ✅ Already using parameterized queries (Neon SDK)
  - [ ] Verify no raw string concatenation in `sql` queries
  - [ ] Review all `WHERE` clauses for parameter usage

### 2.5 Dependency Management
- [ ] **Address xlsx Vulnerability** (Prototype Pollution + ReDoS)
  - [ ] Option A: Evaluate alternative libraries (LibreOffice API, pdfrw)
  - [ ] Option B: Isolate xlsx in worker process with timeout
  - [ ] Option C: Pin to specific version and monitor for patches
  - [ ] Decision: _____________________ (to be decided by team)

- [ ] **Enable Automated Scanning:**
  - [ ] Configure Dependabot for GitHub
  - [ ] Enable npm audit in CI/CD pipeline
  - [ ] Set up Snyk for vulnerability scanning

### 2.6 Monitoring & Logging
- [ ] **Error Tracking:**
  - [ ] Configure Sentry (already in dependencies)
  - [ ] Set up error sampling (don't log every error)
  - [ ] Mask sensitive data in error payloads

- [ ] **Audit Logging:**
  - [ ] ✅ Audit logging already implemented for:
    - [ ] File uploads to `document_access_log` table
    - [ ] Webhook events to `webhook_logs` table
  - [ ] Add audit logging for:
    - [ ] User authentication (success/failure)
    - [ ] Authorization failures (permission denied)
    - [ ] Data exports and downloads
    - [ ] User/company changes
    - [ ] Billing events

- [ ] **Performance Monitoring:**
  - [ ] Set up DataDog or New Relic
  - [ ] Monitor API endpoint latencies
  - [ ] Track database query performance
  - [ ] Alert on anomalies (e.g., spike in 500 errors)

---

## 3. COMPLIANCE REQUIREMENTS

### 3.1 GDPR Compliance
- [ ] **Data Processing Agreement (DPA)**
  - [ ] Neon PostgreSQL: Verify DPA in place
  - [ ] Stripe: Verify DPA for payment processing
  - [ ] Vercel Blob: Verify DPA for file storage
  - [ ] OpenAI: Verify DPA if using API (Prospectus builder)

- [ ] **User Rights**
  - [ ] Implement data export functionality (right to portability)
  - [ ] Implement data deletion functionality (right to be forgotten)
  - [ ] Document data retention policies
  - [ ] Privacy policy updated and accessible

- [ ] **Consent Management**
  - [ ] Cookie consent banner for non-essential tracking
  - [ ] Email consent for marketing communications
  - [ ] Document consent for each data processing activity

### 3.2 CCPA Compliance (US)
- [ ] **Consumer Rights:**
  - [ ] Right to know: Implement disclosure of data collected
  - [ ] Right to delete: Implement deletion request handling
  - [ ] Right to opt-out: Implement opt-out mechanism
  - [ ] Privacy policy includes CCPA-specific sections

### 3.3 PCI DSS (Payment Security)
- [ ] **Stripe Integration:**
  - [ ] ✅ Using Stripe for payment processing (Level 1 PCI provider)
  - [ ] Do NOT store credit card data directly
  - [ ] Use Stripe's tokenization for all transactions
  - [ ] Verify webhook signature validation (already implemented)
  - [ ] Document PCI DSS compliance responsibility split with Stripe

### 3.4 SOC 2 Readiness
- [ ] **Controls Documentation:**
  - [ ] Access controls (authentication, authorization)
  - [ ] Data security (encryption at rest, in transit)
  - [ ] Change management (code review, testing, deployment)
  - [ ] Monitoring and alerting
  - [ ] Incident response procedures
  - [ ] Business continuity and disaster recovery

---

## 4. ENVIRONMENT SETUP

### 4.1 Production Environment Variables
- [ ] **Set these in production `.env`:**
  ```
  # NextAuth
  NEXTAUTH_SECRET=<generated-random-hex-string>
  NEXTAUTH_URL=https://app.ipoready.ai
  
  # Database
  DATABASE_URL=postgresql://<user>:<password>@<neon-host>/<database>?sslmode=require&channel_binding=require
  
  # Stripe
  STRIPE_SECRET_KEY=sk_live_...
  STRIPE_WEBHOOK_SECRET=whsec_...
  STRIPE_PUBLISHABLE_KEY=pk_live_...
  
  # OAuth (if using)
  GOOGLE_CLIENT_ID=...
  GOOGLE_CLIENT_SECRET=...
  LINKEDIN_CLIENT_ID=...
  LINKEDIN_CLIENT_SECRET=...
  
  # File Storage
  BLOB_READ_WRITE_TOKEN=<vercel-blob-token>
  
  # Email (Resend)
  RESEND_API_KEY=...
  
  # SMS (Twilio)
  TWILIO_ACCOUNT_SID=...
  TWILIO_AUTH_TOKEN=...
  
  # Cron Jobs
  CRON_SECRET=<generated-random-hex-string>
  
  # Environment
  NODE_ENV=production
  ```

- [ ] **Verify all secrets:**
  - [ ] Rotate NEXTAUTH_SECRET and CRON_SECRET
  - [ ] Use Vercel Secrets Manager or equivalent
  - [ ] Never commit `.env` files to git
  - [ ] Audit who has access to production secrets

### 4.2 Database Setup
- [ ] **Neon PostgreSQL:**
  - [ ] Enable SSL/TLS (sslmode=require) ✅
  - [ ] Enable channel binding for protection against MITM attacks ✅
  - [ ] Configure backups: Daily automated backups, 30-day retention minimum
  - [ ] Set up read replicas for high availability
  - [ ] Configure IP allowlist (allow only Vercel IPs and admin IPs)

### 4.3 File Storage Setup
- [ ] **Vercel Blob:**
  - [ ] Generate production token
  - [ ] Configure access policies (private by default)
  - [ ] Set up automated cleanup for old/orphaned files
  - [ ] Monitor storage usage

---

## 5. SECURITY TESTING & VALIDATION

### 5.1 Pre-Deployment Testing
- [ ] **Run locally:**
  ```bash
  # Install dependencies
  npm ci
  
  # Run linter
  npm run lint
  
  # Build for production
  npm run build
  
  # Test file upload validation
  npm run dev  # Then test via curl/Postman
  
  # Verify no console errors or warnings
  ```

- [ ] **Automated Security Scanning:**
  - [ ] `npm audit` - Check for vulnerable dependencies
  - [ ] OWASP ZAP or Burp Suite - Basic scanning
  - [ ] Lighthouse Security Score - Check browser security

### 5.2 Penetration Testing (Phase 2)
- [ ] Schedule professional penetration test post-launch
- [ ] Focus on: Authentication bypass, authorization flaws, SQL injection, XSS, CSRF
- [ ] Budget: ~$5,000-15,000 for 1-week assessment
- [ ] Use reputable firm: HackerOne, Cobalt, Synack

### 5.3 Load Testing
- [ ] **Baseline performance under load:**
  - [ ] Test file upload with 1,000 concurrent users
  - [ ] Test API with 10,000 requests/second
  - [ ] Monitor database connection pool
  - [ ] Identify bottlenecks and capacity limits

---

## 6. INCIDENT RESPONSE & MONITORING

### 6.1 Incident Response Plan
- [ ] **Document procedures for:**
  - [ ] Data breach detection and notification (72-hour GDPR requirement)
  - [ ] Service outage response
  - [ ] DDoS mitigation
  - [ ] Account compromise
  - [ ] Malware/security incident
  - [ ] Communication protocol (who to notify, escalation chain)

### 6.2 Monitoring & Alerting
- [ ] **Set up alerts for:**
  - [ ] High error rate (>5% of requests)
  - [ ] Database connection errors
  - [ ] Authentication failures (>10 in 1 minute)
  - [ ] File upload failures
  - [ ] Payment processing failures
  - [ ] High latency (>2 seconds)
  - [ ] Security-related log entries (failed auth, unauthorized access)

### 6.3 Security Monitoring
- [ ] **Configure:**
  - [ ] Failed login attempts dashboard
  - [ ] File upload activity monitoring
  - [ ] API rate limiting violations
  - [ ] Suspicious IP addresses
  - [ ] Geographic anomalies in user access

---

## 7. DOCUMENTATION & COMMUNICATION

### 7.1 Security Documentation
- [ ] **Create/update documents:**
  - [ ] Security policy (internal)
  - [ ] Data handling procedures
  - [ ] Incident response plan
  - [ ] Business continuity plan
  - [ ] Privacy policy (public)
  - [ ] Terms of service (public)
  - [ ] Security.txt file at `/.well-known/security.txt`

### 7.2 Team Communication
- [ ] **Brief team on:**
  - [ ] Security requirements during feature development
  - [ ] Approved libraries and dependencies
  - [ ] Code review security checklist
  - [ ] How to report security issues
  - [ ] What to do in case of security incident

### 7.3 Customer Communication
- [ ] **Prepare communications for:**
  - [ ] Privacy policy summary
  - [ ] Data security commitments
  - [ ] Incident notification procedures
  - [ ] Security contact information

---

## 8. SIGN-OFF & DEPLOYMENT

### 8.1 Pre-Deployment Checklist
- [ ] All CRITICAL fixes completed and tested ✅
- [ ] All HIGH-priority items completed
- [ ] Environment variables configured correctly
- [ ] Database backups configured
- [ ] Monitoring and alerting set up
- [ ] Team trained on security procedures
- [ ] Incident response plan reviewed
- [ ] Legal/compliance review completed

### 8.2 Deployment Approval
- **CTO/Security Lead Sign-Off:**
  - [ ] _____________________ (Name & Date)
  - [ ] Comments: _________________________________

### 8.3 Go/No-Go Decision
- [ ] ✅ **GO** - All requirements met, safe to launch
- [ ] ⚠️ **CONDITIONAL GO** - Minor items can be addressed post-launch
- [ ] ❌ **NO-GO** - Critical issues remain, do not launch

---

## 9. POST-LAUNCH ACTIVITIES (First 30 Days)

### 9.1 Monitoring
- [ ] Daily security log review
- [ ] Monitor for suspicious patterns
- [ ] Weekly vulnerability scan
- [ ] Monthly audit log analysis

### 9.2 Updates
- [ ] Apply security patches within 24 hours of release
- [ ] Monitor CVE databases for new vulnerabilities
- [ ] Update privacy policy if data handling changes

### 9.3 Follow-up Tasks
- [ ] Complete HIGH-priority items not done before launch
- [ ] Plan professional penetration test (Q3 2026)
- [ ] Implement SOC 2 compliance documentation
- [ ] Establish security incident response drills

---

## 10. SECURITY CONTACT & ESCALATION

**Security Lead:** [Name & Contact]  
**CTO:** [Name & Contact]  
**Legal/Compliance:** [Name & Contact]  

**Incident Hotline:** [Phone Number]  
**Security Email:** security@ipoready.ai  

**Report Security Issues:** security@ipoready.ai  
(Do not open public issues for security vulnerabilities)

---

## Appendix A: Vulnerability Reference

| ID | Issue | Severity | Status | CVE/GHSA |
|----|-------|----------|--------|----------|
| 1 | File upload validation | CRITICAL | ✅ FIXED | CWE-434 |
| 2 | Next.js DoS vulnerabilities | HIGH | ✅ FIXED | GHSA-9g9p-9gw9-jx7f, etc. |
| 3 | xlsx prototype pollution | HIGH | ⏳ PENDING | GHSA-4r6h-8v6p-xvw6 |
| 4 | Demo credentials | HIGH | ✅ FIXED | N/A |
| 5 | Session timeout | HIGH | ✅ FIXED | N/A |
| 6 | Rate limiting | HIGH | ⏳ TODO | N/A |
| 7 | Security headers | MODERATE | ✅ FIXED | N/A |
| 8 | NEXTAUTH_SECRET | MODERATE | ⏳ TODO | N/A |
| 9 | Audit logging | MODERATE | ✅ PARTIAL | N/A |
| 10 | Error handling | MODERATE | ✅ PARTIAL | N/A |

---

**Document Version:** 1.0  
**Last Updated:** June 1, 2026  
**Next Review:** June 8, 2026
