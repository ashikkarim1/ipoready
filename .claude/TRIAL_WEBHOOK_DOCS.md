# Trial Expiry Batch Webhook Endpoint

## Overview

The Trial Expiry Webhook (`POST /api/webhooks/trial`) processes trial expiry in batch via cron job services like cron-job.org, GitHub Actions, or any external scheduler. This endpoint runs nightly to manage trial expirations and send notifications.

## Environment Variables

Add to `.env.local`:

```env
# Trial Cron Webhook Secret
TRIAL_CRON_SECRET=your-random-secret-key-here

# Fallback if TRIAL_CRON_SECRET not set:
CRON_SECRET=your-random-secret-key-here
```

The endpoint checks `TRIAL_CRON_SECRET` first, then falls back to `CRON_SECRET` for backwards compatibility.

## Endpoint

**URL:** `POST /api/webhooks/trial`

**Authentication:** Bearer token in Authorization header

## Request

### Headers

```
Authorization: Bearer YOUR_TRIAL_CRON_SECRET
Content-Type: application/json
```

### Body (optional)

```json
{
  "action": "check_expiry" | "handle_expiry" | "both"
}
```

- `action` (optional, default: `"both"`)
  - `"check_expiry"`: Check trials expiring in exactly 2 days, send warning emails
  - `"handle_expiry"`: Handle trials that expired yesterday or today (auto-upgrade or send upgrade email)
  - `"both"`: Run both operations sequentially

## Response

```json
{
  "timestamp": "2026-06-01T12:00:00.000Z",
  "duration_ms": 1234,
  "checked_count": 5,
  "email_sent_count": 5,
  "processed_count": 3,
  "upgraded_count": 2,
  "emailed_count": 1,
  "failed_count": 0,
  "failed_trials": [],
  "errors": [],
  "success": true
}
```

### Response Fields

- `timestamp`: ISO timestamp when batch started
- `duration_ms`: Execution time in milliseconds
- `checked_count`: Number of trials found expiring in 2 days
- `email_sent_count`: Successfully sent warning emails
- `processed_count`: Expired trials found (yesterday or today)
- `upgraded_count`: Trials auto-upgraded to paid subscription
- `emailed_count`: Trials marked expired (no payment method)
- `failed_count`: Trials that failed processing
- `failed_trials`: Array of `{company_id, error}` for failed trials
- `errors`: Array of operation-level errors
- `success`: Overall success flag

## cURL Examples

### Check expiring trials (2 days)

```bash
curl -X POST http://localhost:3000/api/webhooks/trial \
  -H "Authorization: Bearer your-trial-cron-secret" \
  -H "Content-Type: application/json" \
  -d '{"action":"check_expiry"}'
```

### Handle expired trials

```bash
curl -X POST http://localhost:3000/api/webhooks/trial \
  -H "Authorization: Bearer your-trial-cron-secret" \
  -H "Content-Type: application/json" \
  -d '{"action":"handle_expiry"}'
```

### Run both operations (default)

```bash
curl -X POST http://localhost:3000/api/webhooks/trial \
  -H "Authorization: Bearer your-trial-cron-secret" \
  -H "Content-Type: application/json"
```

## Monitoring/Testing

**URL:** `GET /api/webhooks/trial`

**Authentication:** Same Bearer token

Returns all active trials with days remaining:

```json
{
  "timestamp": "2026-06-01T12:00:00.000Z",
  "total_trials": 5,
  "trials": [
    {
      "id": "company-123",
      "company_name": "TechCorp Inc",
      "trial_start_date": "2026-05-18",
      "trial_end_date": "2026-06-01",
      "trial_status": "active",
      "days_remaining": 0,
      "urgency": "EXPIRED",
      "has_stripe_customer": true
    }
  ]
}
```

## Setup with Cron Job Services

### cron-job.org

1. Create account at https://cron-job.org
2. Create a new cron job:
   - **URL:** `https://your-domain.com/api/webhooks/trial`
   - **Method:** POST
   - **Schedule:** Daily at 2 AM UTC (0 2 * * *)
   - **Headers:**
     ```
     Authorization: Bearer YOUR_TRIAL_CRON_SECRET
     Content-Type: application/json
     ```
   - **Body:**
     ```json
     {"action":"both"}
     ```

### GitHub Actions

Create `.github/workflows/trial-expiry.yml`:

```yaml
name: Trial Expiry Batch

on:
  schedule:
    - cron: '0 2 * * *'  # 2 AM UTC daily

jobs:
  trial-webhook:
    runs-on: ubuntu-latest
    steps:
      - name: Check trial expiry
        run: |
          curl -X POST ${{ secrets.API_URL }}/api/webhooks/trial \
            -H "Authorization: Bearer ${{ secrets.TRIAL_CRON_SECRET }}" \
            -H "Content-Type: application/json" \
            -d '{"action":"both"}' \
            -w "\nStatus: %{http_code}\n"
```

### AWS CloudWatch Events / EventBridge

1. Create a CloudWatch rule scheduled for daily execution
2. Set target to HTTP endpoint with:
   - **URL:** `https://your-domain.com/api/webhooks/trial`
   - **Method:** POST
   - **Headers:** Add Authorization header
   - **Body:** `{"action":"both"}`

## Logging

All operations are logged with `[trial-cron]` prefix for easy filtering:

```
[trial-cron] Found 5 trials expiring in 2 days
[trial-cron] Sent expiry warning email to user@company.com (company-123)
[trial-cron] Found 3 expired trials to process
[trial-cron] Trial auto-upgraded: company-123 -> sub_123abc
[trial-cron] Trial expired (no payment method): company-456
[trial-cron] Batch completed in 1234ms
```

## Function Details

### checkTrialExpiryBatch()

**Purpose:** Find all active trials expiring in exactly 2 days and send warning emails

**Query:**
```sql
SELECT * FROM companies
WHERE trial_status = 'active'
  AND trial_end_date = TODAY + 2
```

**Actions:**
- For each trial: Call `sendTrialExpiringEmail(email, name, formattedDate)`
- Log all operations with [trial-cron] prefix
- Return counts: `checked_count`, `email_sent_count`

**Error Handling:**
- Individual email failures don't stop batch processing
- Failed emails are logged but not returned in response

### handleExpiredTrialsBatch()

**Purpose:** Find all trials that expired yesterday or today and auto-upgrade or send upgrade email

**Query:**
```sql
SELECT * FROM companies
WHERE trial_status = 'active'
  AND trial_end_date <= TODAY
```

**Actions:** For each expired trial, call `handleTrialExpiry(companyId)` which:
1. If Stripe customer with payment method: Create subscription, update to `trial_status='upgraded'`
2. If no payment method: Set `trial_status='expired'`, send upgrade email
3. If Stripe error: Queue for retry, set trial_status='expired'

**Return Counts:**
- `processed_count`: Total expired trials found
- `upgraded_count`: Successfully auto-upgraded
- `emailed_count`: Marked expired (no payment method)
- `failed_count`: Error during processing
- `failed_trials`: Array of failed company IDs with error messages

## Database Operations

### Tables Modified

- **companies**
  - `trial_status`: Updated to `'upgraded'` or `'expired'`
  - `trial_converted_at`: Set to NOW() on successful upgrade
  - `subscription_id`: Set on successful upgrade
  - `subscription_status`: Set on successful upgrade

### Transactions

- Individual trial operations are not wrapped in transactions
- All operations are logged for audit trail
- Failed trials don't prevent processing of subsequent trials

## Error Handling

### Status Codes

- **200:** Success (even with some individual trial failures)
- **401:** Unauthorized (invalid TRIAL_CRON_SECRET)
- **500:** Fatal error (database/system issue)

### Response Format

Always returns 200 for successful authorization, even if individual trials fail:

```json
{
  "success": false,
  "errors": ["handle_expiry failed: Database connection error"],
  "checked_count": 5,
  "email_sent_count": 3,
  "processed_count": 0,
  "upgraded_count": 0,
  "failed_count": 0
}
```

## Security

- Authorization via Bearer token (TRIAL_CRON_SECRET)
- No authenticated user required (service-to-service)
- All operations logged with [trial-cron] prefix
- Failed auth returns 401 Unauthorized
- No sensitive data in response (company IDs only)

## Performance

- Batch processes up to all active trials per run
- Individual email failures don't block batch
- Stripe API calls may take 1-2 seconds per trial
- Total runtime typically 1-5 seconds for 10-50 trials
- Recommendations: Run during low-traffic window (2-4 AM UTC)
