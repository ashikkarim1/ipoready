# Production-Critical Fixes: Architecture Overview

## 1. Webhook Security Pipeline

```
Incoming Stripe Webhook
        |
        v
[STEP 1] Verify Signature
  - Parse header: t=timestamp, v1=signature
  - Check timestamp within 5-minute window
  - HMAC-SHA256 verification
  - Constant-time comparison
  - FAIL? Return 400 immediately
        |
        v
[STEP 2] Check Idempotency
  - Extract event_id from body
  - Check if event_id previously processed
  - DUPLICATE? Return 409 Conflict
        |
        v
[STEP 3] Check Rate Limit
  - Extract customer_id from body
  - Count events in last 60 seconds
  - Exceeded 100? Return 429 Too Many Requests
        |
        v
[STEP 4] Parse Event Body
  - Validate JSON structure
  - Extract event type and data
        |
        v
[STEP 5] Route to Handler
  - customer.subscription.created -> handleSubscriptionCreated()
  - invoice.payment_failed -> handlePaymentFailed()
  - customer.subscription.updated -> handleSubscriptionUpdated()
  - ...etc
        |
        v
[STEP 6] Log Event
  - Record to webhook_logs table
  - signature_verified = true
  - response_status = 200
        |
        v
[STEP 7] Return Response
  - 200 OK with { received: true }

SECURITY PROPERTIES:
- Signature failure returns 400 BEFORE any processing
- Duplicate detection prevents replay attacks
- Rate limiting prevents abuse
- All timestamps validated within 5-minute window
- Constant-time comparison prevents timing attacks
