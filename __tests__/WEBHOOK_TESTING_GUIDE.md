# Webhook Security Testing Guide

This guide provides manual and automated testing procedures for the Stripe webhook security implementation.

## Prerequisites

1. Stripe CLI installed: brew install stripe/stripe-cli/stripe
2. Stripe webhook endpoint exposed locally: stripe listen --forward-to localhost:3000/api/webhooks/stripe
3. Environment variables configured:
   - STRIPE_WEBHOOK_SECRET - From stripe listen command
   - CRON_SECRET - For cron endpoint authentication

## Unit Tests

Run the webhook security test suite:

```bash
npm test -- __tests__/webhook-security.test.ts
```

Expected results:
- Valid signature verification
- Invalid signature rejection
- Expired timestamp rejection (> 5 minutes)
- Valid timestamp acceptance (< 5 minutes)
- Constant-time comparison (timing attack prevention)

## Integration Tests: Manual Webhook Triggering

### Test 1: Valid Webhook Processing

```bash
# Terminal 1: Start webhook listening
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Terminal 2: Trigger a valid customer subscription created event
stripe trigger customer.subscription.created

# Expected result in logs:
# - Signature verification: PASSED
# - Idempotency check: PASSED
# - Rate limit check: PASSED
# - Event processing: SUCCEEDED
# - 200 OK response
```

### Test 2: Invalid Signature Detection

Attempt to bypass signature verification using curl.

Expected result: 400 Bad Request, signature verification fails immediately.

### Test 3: Replay Attack Prevention

Use timestamp outside 5-minute window.

Expected result: 400 Bad Request, timestamp validation fails.

### Test 4: Duplicate Event Detection

Trigger same event twice. Expected result: First succeeds, second rejected as duplicate.

### Test 5: Rate Limit Detection

Send > 100 webhooks for same customer in 1 minute.

Expected result: Events 1-100 processed, events 101+ rate limited with 429 status.

## Database Verification

### Check Webhook Logs

SELECT event_id, signature_verified, rate_limited, response_status
FROM webhook_logs
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

**Expected**: All recent webhooks have signature_verified = true.

### Check State Transitions

SELECT from_state, to_state, trigger, created_at
FROM subscription_state_transitions
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

**Expected**: All transitions follow valid rules defined in state machine.

### Check Trial Auto-Upgrade Queue

SELECT status, retry_count, next_retry_at
FROM trial_auto_upgrade_queue
WHERE status IN ('pending', 'escalated')
ORDER BY next_retry_at ASC;

**Expected**: Pending retries, escalations after 3 failures, proper retry scheduling.

## Production Smoke Tests

Monitor webhook success rate (should be >= 99.9%).
Verify no replay attacks (duplicate event IDs = 0).
Check trial upgrade queue health (escalations < 1% of succeeded).
