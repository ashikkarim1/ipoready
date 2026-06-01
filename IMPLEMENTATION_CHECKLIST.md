# Production-Critical Fixes: Implementation Checklist

## Core Implementation Files

### Security Libraries (3 files)

- [x] `/src/lib/stripe-webhook-secure.ts` (380 lines)
  - Signature verification with HMAC-SHA256
  - Constant-time comparison to prevent timing attacks
  - 5-minute timestamp window for replay prevention
  - Per-event idempotency checking
  - Per-customer rate limiting (100 events/minute)
  - Security-first processing pipeline

- [x] `/src/lib/subscription-state-machine.ts` (340 lines)
  - SubscriptionState type definition
  - VALID_TRANSITIONS map with 16 transitions
  - 8 states: trialing, active, past_due, payment_attempted, suspended, cancelled, expired, unrecoverable
  - Pessimistic locking using WHERE clause on state
  - State transition logging

- [x] `/src/lib/trial-auto-upgrade.ts` (450 lines)
  - Trial expiry handling
  - Exponential backoff retry scheduling (1min, 5min, 1hr, 24hr)
  - Queue management with status tracking
  - Escalation to support after 3 failures
  - Email notifications for success/failure/escalation
  - Queue status reporting

### API Handlers (3 files)

- [x] `/src/app/api/webhooks/stripe/route.ts` (Modified - 564 lines)
  - Signature verification on first line
  - Returns 400 immediately on signature failure
  - Uses state machine for subscription updates
  - Modified handlePaymentFailed() to enforce valid transitions
  - Added comprehensive logging

- [x] `/src/app/api/webhooks/trial/route.ts` (Modified - 178 lines)
  - Calls handleTrialExpiry() for trial expirations
  - Properly queues failures for retry
  - Handles three scenarios: success, failure (queued), no payment method

- [x] `/src/app/api/cron/trial-auto-upgrade-retry/route.ts` (New - 130 lines)
  - Processes pending retries every 5 minutes
  - Verifies CRON_SECRET header
  - Returns queue statistics
  - Logs to security_events table
  - Supports POST and GET methods

### Database Migration

- [x] `/migrations/006_webhook_security_and_trial_upgrade.sql` (4.8 KB)
  - subscription_state_transitions table
  - trial_auto_upgrade_queue table
  - security_events table
  - Enhanced webhook_logs with security fields
  - Appropriate indexes on status, created_at, next_retry_at

### Test Suites (4 files)

- [x] `/__tests__/webhook-security.test.ts` (250+ lines)
  - Valid/invalid signature verification
  - Timestamp window testing (5 minute tolerance)
  - Constant-time comparison verification
  - Idempotency checking
  - Rate limit enforcement

- [x] `/__tests__/subscription-state-machine.test.ts` (300+ lines)
  - 16 valid transition tests
  - 8+ invalid transition tests
  - getValidNextStates() testing
  - Recoverability and active paying subscription checks
  - Race condition prevention verification

- [x] `/__tests__/trial-auto-upgrade.test.ts` (280+ lines)
  - Trial expiry handling (success/failure/no payment)
  - Exponential backoff calculation (1min, 5min, 1hr, 24hr)
  - Queue and retry logic
  - Escalation after 3 failures
  - Complete lifecycle scenarios

- [x] `/__tests__/WEBHOOK_TESTING_GUIDE.md` (200+ lines)
  - Manual testing with Stripe CLI
  - Integration test scenarios
  - Database verification queries
  - Production smoke tests
  - Troubleshooting guide

### Documentation

- [x] `/__tests__/IMPLEMENTATION_SUMMARY.md` (400+ lines)
  - Complete overview of all three fixes
  - Implementation details and code patterns
  - Database schema changes
  - Testing procedures
  - Deployment checklist
  - Success metrics

## Security Verification Checklist

### Signature Verification
- [x] Verification happens on FIRST line of handler
- [x] Returns 400 Bad Request immediately on failure
- [x] Uses constant-time comparison (prevents timing attacks)
- [x] Validates timestamp within 5-minute window
- [x] Request body not logged before verification (security audit)
- [x] Failed signatures logged with severity: error

### Idempotency & Deduplication
- [x] Per-event deduplication using event ID
- [x] Duplicate events rejected with 409 Conflict
- [x] Duplicates logged to security_events
- [x] idempotency_key stored in webhook_logs

### Rate Limiting
- [x] Per-customer rate limit: 100 events/minute
- [x] Moving 1-minute time window (reset every 60 seconds)
- [x] Rate-limited requests return 429 Too Many Requests
- [x] Retry-After header included in response
- [x] Rate limit tracking in memory (no DB overhead)
- [x] Rate limit resets automatically after window expires

### State Machine Validation
- [x] 16 valid transitions defined
- [x] Invalid transitions rejected (e.g., past_due → past_due)
- [x] WHERE clause prevents race conditions from concurrent updates
- [x] All state transitions logged with trigger and timestamp
- [x] Terminal states (unrecoverable, cancelled) unrecoverable
- [x] getValidNextStates() used for UI/UX validation

### Trial Auto-Upgrade Retry
- [x] Failure queued with exponential backoff
- [x] Backoff schedule: 1min, 5min, 1hr, 24hr
- [x] Max 3 retries before escalation
- [x] Escalation after 3 failures goes to support
- [x] Email sent for each state: success, retry, escalation
- [x] Queue status tracked by: pending, in_progress, succeeded, failed, escalated

### Race Condition Prevention
- [x] Pessimistic locking using WHERE clause on subscription_status
- [x] UPDATE fails if state changed since read
- [x] No LOCK ROWS or SELECT FOR UPDATE needed
- [x] Optimistic approach using state field as version

## Testing Checklist

### Unit Tests
- [ ] Run: `npm test -- __tests__/webhook-security.test.ts`
- [ ] Coverage: >= 95% code coverage required
- [ ] All 20+ tests passing

- [ ] Run: `npm test -- __tests__/subscription-state-machine.test.ts`
- [ ] Coverage: >= 95% code coverage required
- [ ] All 24+ tests passing

- [ ] Run: `npm test -- __tests__/trial-auto-upgrade.test.ts`
- [ ] Coverage: >= 95% code coverage required
- [ ] All 15+ tests passing

### Integration Tests (Manual with Stripe CLI)
- [ ] Test 1: Valid webhook processing
  - Command: `stripe trigger customer.subscription.created`
  - Expected: 200 OK, signature verified, event processed

- [ ] Test 2: Invalid signature rejection
  - Command: `curl with invalid signature`
  - Expected: 400 Bad Request, signature failed

- [ ] Test 3: Replay attack prevention
  - Command: Send event with old timestamp
  - Expected: 400 Bad Request, timestamp expired

- [ ] Test 4: Duplicate detection
  - Command: Send same event twice
  - Expected: First 200 OK, second 409 Conflict

- [ ] Test 5: Rate limiting
  - Command: Send 101+ events in 1 minute
  - Expected: Events 1-100 OK, 101+ rate limited with 429

- [ ] Test 6: State transitions
  - Command: Trigger payment failed webhook
  - Expected: subscription_status changes active → past_due (not past_due → past_due)

- [ ] Test 7: Trial upgrade success
  - Command: Trial expires with payment method
  - Expected: Subscription created, welcome email sent

- [ ] Test 8: Trial upgrade retry
  - Command: Trial expires, mock payment failure, wait 1 min, cron runs
  - Expected: Retry queued, processed on next cron, success on retry

- [ ] Test 9: Cron authentication
  - Command: Call cron endpoint without CRON_SECRET
  - Expected: 401 Unauthorized
  - Command: Call cron endpoint with CRON_SECRET
  - Expected: 200 OK, queue stats returned

### Database Verification
- [ ] webhook_logs shows all recent events with signature_verified = true
- [ ] webhook_logs shows zero rate_limited = true for legitimate traffic
- [ ] subscription_state_transitions contains no invalid transitions
- [ ] subscription_state_transitions triggers are properly recorded
- [ ] trial_auto_upgrade_queue shows pending retries with correct next_retry_at
- [ ] security_events contains logs of all signature failures and rate limits
- [ ] No duplicate event_ids in webhook_logs (idempotency working)

## Deployment Steps

1. **Pre-Deployment**
   - [ ] All unit tests passing
   - [ ] Code review completed
   - [ ] Security review completed
   - [ ] Integration tests passed

2. **Migration**
   - [ ] Backup production database
   - [ ] Run migration: `npm run migrate -- 006_webhook_security_and_trial_upgrade`
   - [ ] Verify all tables created with correct schema
   - [ ] Verify indexes created for performance

3. **Staging Deployment**
   - [ ] Deploy code to staging environment
   - [ ] Run full test suite
   - [ ] Manual webhook testing with Stripe CLI
   - [ ] Monitor logs for 24 hours
   - [ ] Verify no errors or warnings

4. **Production Deployment**
   - [ ] Deploy code to production (blue-green preferred)
   - [ ] Monitor webhook_logs for success rate >= 99.9%
   - [ ] Monitor security_events for any signature failures
   - [ ] Monitor trial_auto_upgrade_queue for escalations
   - [ ] Alert if success rate drops below 99%

5. **Post-Deployment**
   - [ ] Webhook success rate verified >= 99.9% for 24 hours
   - [ ] Zero invalid state transitions in production
   - [ ] Trial upgrade escalation rate < 1% of succeeded
   - [ ] No security audit findings
   - [ ] Documentation updated with new field descriptions

## Monitoring & Alerts

Set up alerts in your monitoring system:

```
Alert 1: Webhook Success Rate < 99%
Query: SELECT SUM(CASE WHEN response_status < 300 THEN 1 ELSE 0 END) / COUNT(*) 
       FROM webhook_logs WHERE created_at > NOW() - INTERVAL '1 hour'

Alert 2: Signature Verification Failure
Query: SELECT COUNT(*) FROM webhook_logs 
       WHERE signature_verified = false AND created_at > NOW() - INTERVAL '1 hour'

Alert 3: Invalid State Transitions
Query: SELECT COUNT(*) FROM security_events 
       WHERE event_type = 'invalid_state_transition' AND created_at > NOW() - INTERVAL '1 hour'

Alert 4: High Rate Limiting
Query: SELECT COUNT(*) FROM webhook_logs 
       WHERE rate_limited = true AND created_at > NOW() - INTERVAL '1 hour'

Alert 5: Trial Escalations > 1%
Query: SELECT COUNT(*) FROM trial_auto_upgrade_queue 
       WHERE status = 'escalated' AND created_at > NOW() - INTERVAL '1 day'
```

## Rollback Procedure

If critical issues are discovered:

1. Revert code to previous version
2. Set environment variables to disable new functionality:
   - `WEBHOOK_SECURITY_ENABLED=false`
   - `TRIAL_AUTO_UPGRADE_ENABLED=false`
3. Keep database tables (safe to keep schema)
4. Manually process trial_auto_upgrade_queue
5. Replay missed webhook events from Stripe logs

## Success Criteria

Project complete when all are true:

- [x] All implementation files created (6 new, 2 modified)
- [x] All test files created (3 test suites + documentation)
- [x] Database migration created with all required tables
- [x] Code passes linting and type checking
- [ ] Unit tests: 100% pass rate, >= 95% coverage
- [ ] Integration tests: All manual tests pass with Stripe CLI
- [ ] Webhook success rate >= 99.9% in production
- [ ] Zero invalid state transitions in production
- [ ] Trial escalation rate < 1% of succeeded
- [ ] On-call documentation complete
- [ ] All team members trained on new system
