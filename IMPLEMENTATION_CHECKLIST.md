# SEDAR 2 & SEC EDGAR Implementation Checklist

## Phase 1: Setup (2 hours)

### Environment Configuration
- [ ] Obtain SEDAR 2 API credentials from https://sedar.ca
  - Client ID: `SEDAR2_CLIENT_ID`
  - Client Secret: `SEDAR2_CLIENT_SECRET`
- [ ] Verify SEDAR sandbox access (`SEDAR2_SANDBOX=true`)
- [ ] Obtain SEC CIK from https://www.sec.gov/cgi-bin/browse-edgar
  - Format to 10 digits: `SEC_CIK=0000123456`
- [ ] Generate webhook secrets for signature validation
  - `SEDAR2_WEBHOOK_SECRET=webhook-secret`
  - `SEC_WEBHOOK_SECRET=webhook-secret`
- [ ] Configure all environment variables in `.env.local`

### Database Preparation
- [ ] Create Filing table schema
  ```sql
  CREATE TABLE filings (
    id UUID PRIMARY KEY,
    external_id VARCHAR(255) UNIQUE,
    system VARCHAR(20),  -- 'sedar' or 'sec'
    status VARCHAR(50),  -- submitted|processing|accepted|rejected
    submitted_at TIMESTAMP,
    last_status_update TIMESTAMP,
    status_history JSONB,
    created_at TIMESTAMP DEFAULT NOW()
  );
  ```
- [ ] Create FilingStatusUpdate table for webhooks
- [ ] Create FilingDocument table for document tracking
- [ ] Run database migrations
- [ ] Verify tables exist with `SELECT * FROM filings LIMIT 1;`

### Directory Structure Verification
- [ ] Verify file locations:
  - ✓ `src/lib/filing-adapters/SEDARAdapter.real.ts` (661 lines)
  - ✓ `src/lib/filing-adapters/SECEdgarAdapter.real.ts` (717 lines)
  - ✓ `src/lib/services/filing-service.ts` (284 lines)
  - ✓ `src/app/api/filings/submit/route.ts` (233 lines)
  - ✓ `src/app/api/filings/status/route.ts` (243 lines)
  - ✓ `src/app/api/webhooks/filing-status/route.ts` (405 lines)

## Phase 2: Testing (3 hours)

### Unit Tests
- [ ] Test SEDAR adapter initialization
  ```bash
  npm test -- SEDARAdapter.real.test.ts
  ```
- [ ] Test SEC EDGAR adapter initialization
  ```bash
  npm test -- SECEdgarAdapter.real.test.ts
  ```
- [ ] Test filing service methods
- [ ] Test API route validation

### Integration Tests
- [ ] Test SEDAR sandbox submission
  ```bash
  SEDAR2_SANDBOX=true npm run test:integration
  ```
- [ ] Test SEC EDGAR submission (test CIK)
- [ ] Test status polling
- [ ] Test webhook signature validation
- [ ] Test error handling and retries

### Sandbox Testing
- [ ] Create test prospectus document
- [ ] Submit to SEDAR sandbox
- [ ] Verify filing ID returned
- [ ] Poll status endpoint
- [ ] Verify status changes (submitted → processing)
- [ ] Test error scenarios:
  - [ ] Empty document
  - [ ] Invalid CIK
  - [ ] Exceeded document size

### Webhook Testing
- [ ] Verify webhook URL is publicly accessible
  ```bash
  curl https://your-domain.com/api/webhooks/filing-status
  ```
- [ ] Test webhook payload validation
- [ ] Test HMAC-SHA256 signature validation
- [ ] Test webhook signature mismatch rejection
- [ ] Verify database update on webhook
- [ ] Verify notification sending

### Load Testing
- [ ] Test with 10 concurrent submissions
- [ ] Test with 50 concurrent submissions
- [ ] Test with 100 concurrent submissions
- [ ] Monitor response times
- [ ] Check for connection pool issues
- [ ] Verify retry logic under load

## Phase 3: API Deployment (1 hour)

### API Route Testing
- [ ] Test `/api/filings/submit` endpoint
  ```bash
  curl -X POST http://localhost:3000/api/filings/submit \
    -H "Content-Type: application/json" \
    -d '{...}'
  ```
- [ ] Test `/api/filings/status` GET
  ```bash
  curl "http://localhost:3000/api/filings/status?filingId=...&system=sedar"
  ```
- [ ] Test `/api/filings/status` POST
- [ ] Test `/api/webhooks/filing-status` endpoint
- [ ] Verify error responses (400, 404, 500, etc.)

### Response Format Validation
- [ ] Submission response includes:
  - [ ] `success` boolean
  - [ ] `filing.id` (filingId)
  - [ ] `filing.referenceNumber` (tracking number)
  - [ ] `filing.status` (submitted/processing/accepted)
  - [ ] `filing.submittedAt` (ISO 8601 datetime)
  - [ ] `message` string
  - [ ] `warnings` array
- [ ] Status response includes:
  - [ ] `filing.status` 
  - [ ] `filing.phase`
  - [ ] `filing.lastUpdatedAt`
  - [ ] `filing.reviewComments` (if any)
  - [ ] `filing.rejectionReasons` (if any)

## Phase 4: Production Deployment (1 hour)

### Pre-Production Checklist
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] Load testing completed (100+ concurrent)
- [ ] Security audit completed:
  - [ ] No credentials in logs
  - [ ] Signature validation working
  - [ ] Timestamp validation working
  - [ ] SSL/TLS enabled
- [ ] Documentation reviewed with team
- [ ] Error monitoring configured
- [ ] Database backups configured
- [ ] Rollback plan documented

### Credentials & Configuration
- [ ] Production SEDAR credentials obtained and verified
- [ ] Production SEC CIK verified
- [ ] Webhook secret rotated and secure
- [ ] All environment variables set (no defaults)
  ```bash
  SEDAR2_CLIENT_ID=prod-id
  SEDAR2_CLIENT_SECRET=prod-secret
  SEDAR2_SANDBOX=false
  SEC_CIK=0000123456
  ```

### Webhook Registration
- [ ] Register webhook URL with SEDAR
  ```bash
  POST /v1/webhooks
  {
    "url": "https://ipoready.com/api/webhooks/filing-status",
    "events": ["filing.submitted", "filing.updated", "filing.approved", "filing.rejected"],
    "active": true
  }
  ```
- [ ] Verify webhook is active
- [ ] Test webhook delivery
- [ ] Configure retry policy

### Monitoring & Alerting
- [ ] Set up Datadog/Sentry for error tracking
- [ ] Configure alerts for:
  - [ ] 5xx errors (immediate alert)
  - [ ] Rate limiting (429) (warning)
  - [ ] Authentication failures (401) (immediate)
  - [ ] Filing not found (404) (log only)
  - [ ] High error rate (>5%) (immediate)
  - [ ] Webhook failures (immediate)
- [ ] Set up metrics dashboards:
  - [ ] Submission success rate
  - [ ] Average response time
  - [ ] Error rate by code
  - [ ] Webhook latency

### Logging Configuration
- [ ] Enable structured logging
  ```typescript
  logger.info('Filing submitted', {
    filingId: 'FIL-2024-001',
    system: 'sedar',
    timestamp: new Date().toISOString(),
  })
  ```
- [ ] Log all API requests and responses
- [ ] Log webhook callbacks
- [ ] Exclude sensitive data (credentials, signatures)
- [ ] Configure log retention (30+ days)

### Backup & Recovery
- [ ] Database backups configured (hourly)
- [ ] Test database restore process
- [ ] Document recovery procedure
- [ ] Test API service recovery

## Phase 5: Go-Live (30 minutes)

### Deployment Steps
1. [ ] Merge code to main branch
2. [ ] Run full test suite
3. [ ] Deploy to staging
4. [ ] Smoke test on staging
5. [ ] Deploy to production
6. [ ] Verify production deployment
7. [ ] Announce go-live to team

### Post-Deployment Verification
- [ ] Monitor error logs for 1 hour
- [ ] Check filing success rate
- [ ] Test submission with real document
- [ ] Verify status polling works
- [ ] Verify webhook callbacks working
- [ ] Check monitoring/alerting is active

### Documentation Update
- [ ] Update team wiki with SEDAR/SEC credentials location
- [ ] Document production endpoints
- [ ] Document support escalation process
- [ ] Create runbook for common issues
- [ ] Document metrics and SLOs

## Phase 6: Maintenance (Ongoing)

### Daily Monitoring
- [ ] Check error dashboard
- [ ] Review failed submissions
- [ ] Monitor webhook delivery
- [ ] Check response times

### Weekly Tasks
- [ ] Review metrics trends
- [ ] Check for rate limit issues
- [ ] Review SEDAR/SEC announcements
- [ ] Check OAuth token refresh working

### Monthly Tasks
- [ ] Rotate webhook secret
- [ ] Review and update documentation
- [ ] Performance analysis and optimization
- [ ] Security audit for credentials rotation
- [ ] Backup integrity verification

### Quarterly Tasks
- [ ] Update SEDAR/SEC API to latest version
- [ ] Load test with current volume
- [ ] Review and update error handling
- [ ] Plan feature improvements

## Support & Troubleshooting

### Common Issues

#### Issue: SEDAR authentication fails
- [ ] Verify SEDAR2_CLIENT_ID is set
- [ ] Verify SEDAR2_CLIENT_SECRET is set
- [ ] Check token URL is correct
- [ ] Verify credentials have correct scopes
- [ ] Check sandbox vs production mode

#### Issue: SEC filing not found
- [ ] Verify CIK is in correct 10-digit format
- [ ] Check CIK exists in SEC system
- [ ] Verify accession number format
- [ ] Use browse-edgar endpoint to search

#### Issue: Webhook not being called
- [ ] Verify webhook URL is publicly accessible
- [ ] Check webhook registration in SEDAR
- [ ] Verify webhook secret is correct
- [ ] Check firewall allows inbound connections
- [ ] Review SEDAR webhook logs

#### Issue: Document size exceeded
- [ ] SEDAR limit: 50MB per document
- [ ] SEC limit: 150MB per document
- [ ] Compress PDF documents
- [ ] Split large documents
- [ ] Remove unnecessary attachments

#### Issue: Rate limit exceeded (429)
- [ ] Wait 60+ seconds
- [ ] Retry with exponential backoff
- [ ] Contact SEDAR/SEC for rate limit increase
- [ ] Implement client-side rate limiting

## Sign-Off

- [ ] Development lead sign-off
- [ ] QA lead sign-off
- [ ] Security review complete
- [ ] Operations sign-off
- [ ] Product owner approval

**Deployed Date**: _______________
**Deployed By**: _______________
**Notes**: _______________

---

Total Implementation Time: ~7-8 hours
Status: Ready for production deployment
