# IPOReady Incident Response Runbook

This document contains step-by-step procedures for handling critical incidents in the webhook, trial auto-upgrade, and cap table systems.

## Quick Links

- **Webhook Dashboard**: `/api/health/webhooks`
- **Trial Auto-Upgrade Dashboard**: `/api/health/trial-auto-upgrade`
- **Cap Table Dashboard**: `/api/health/cap-table`
- **Webhook Logs Table**: `webhook_logs`
- **Trial Queue Table**: `trial_auto_upgrade_queue`
- **Cap Table Uploads Table**: `cap_table_uploads`

---

## Incident Type 1: Webhook Success Rate Drops Below 99%

**Severity**: CRITICAL  
**Alert**: `webhook_success_rate_24h < 99%`  
**Response**: Page on-call engineer

### Root Cause Analysis (5 minutes)

1. **Check webhook logs for error patterns**
   ```sql
   SELECT event_type, status, COUNT(*) as count
   FROM webhook_logs
   WHERE created_at > NOW() - INTERVAL '1 hour'
   GROUP BY event_type, status
   ORDER BY count DESC;
   ```

2. **Identify most common error messages**
   ```sql
   SELECT error_message, COUNT(*) as count
   FROM webhook_logs
   WHERE status = 'failed'
     AND created_at > NOW() - INTERVAL '1 hour'
   GROUP BY error_message
   ORDER BY count DESC
   LIMIT 5;
   ```

3. **Check for specific event type failures**
   ```sql
   SELECT DISTINCT event_type
   FROM webhook_logs
   WHERE status = 'failed'
     AND created_at > NOW() - INTERVAL '1 hour';
   ```

### Investigation Steps

**If error is "Database connection failed":**
1. Check database connection pool status: `SELECT count(*) FROM webhook_logs;`
2. Check if `webhook_logs` table is accepting writes
3. Verify no long-running queries are locking the table
4. If locked: KILL the blocking query or restart connection pool

**If error is "Signature verification failed":**
1. Check if Stripe webhook secret was recently rotated
2. Compare `STRIPE_WEBHOOK_SECRET` in env with Stripe dashboard
3. If mismatch: Update env var and restart app
4. Query failed signature events:
   ```sql
   SELECT COUNT(*) FROM webhook_logs
   WHERE payload ->> 'signature_verified' = 'false'
     AND created_at > NOW() - INTERVAL '1 hour';
   ```

**If error is "Stripe API rate limited":**
1. Check current Stripe rate limit status in Stripe Dashboard
2. Reduce webhook processing concurrency (if configurable)
3. Monitor for eventual recovery (usually 5-10 minutes)
4. If persistent: Contact Stripe Support

**If error is "Company not found":**
1. This is usually harmless (webhooks for deleted companies)
2. Check if it's widespread: `SELECT COUNT(*) FROM webhook_logs WHERE error_message LIKE '%not found%' AND created_at > NOW() - INTERVAL '1 hour';`
3. If <5% of events: Safe to ignore

### Resolution Steps

1. **Identify the failure root cause** from investigation above
2. **Fix the root cause**:
   - Database issue: Restart connection pool or database
   - Signature issue: Rotate webhook secret
   - Stripe issue: Wait for Stripe to recover or contact support
3. **Monitor recovery**:
   ```sql
   SELECT status, COUNT(*) FROM webhook_logs
   WHERE created_at > NOW() - INTERVAL '10 minutes'
   GROUP BY status;
   ```
4. **Once resolved**: Verify success rate returns above 99%

### Rollback Plan

If critical production issue:
1. Disable webhook processing temporarily: Set feature flag or stop server
2. Once fixed, re-enable and verify recovery

---

## Incident Type 2: Webhook Signature Failures Spike Above 10/Hour

**Severity**: CRITICAL (Security Event)  
**Alert**: `webhook_signature_failures_1h > 10`  
**Response**: Page security team immediately

### Immediate Response (2 minutes)

1. **Verify this is not a false alarm**:
   ```sql
   SELECT COUNT(*), event_type FROM webhook_logs
   WHERE created_at > NOW() - INTERVAL '1 hour'
     AND payload ->> 'signature_verified' = 'false'
   GROUP BY event_type;
   ```

2. **Check if legitimate events are being rejected**:
   - Navigate to Stripe Webhook Dashboard
   - Verify webhook endpoints are still sending events
   - If many failures, likely signature rotation issue

3. **Assess the risk**:
   - Is this blocking real Stripe events? (check queue depth)
   - Are any customers being double-charged or missing charges?

### Root Cause Investigation

1. **Check if signature secret was recently rotated**:
   - Review recent env var changes in deployment logs
   - Compare `STRIPE_WEBHOOK_SECRET` with Stripe Dashboard "Signing secret"
   - If they don't match: **This is the issue**

2. **Check if Stripe rotated their signing secret**:
   - Log into Stripe Dashboard → Webhooks → Your endpoint
   - Click "Signing secret" → check if it was recently rotated
   - Update local `STRIPE_WEBHOOK_SECRET` if so

3. **Check for webhook tampering**:
   - Review CloudWatch/logs for suspicious IP addresses
   - Check if any unauthorized systems are sending webhooks

### Resolution Steps

1. **Update webhook secret immediately**:
   ```bash
   # Get correct secret from Stripe Dashboard
   # Update in your .env.local or production env
   STRIPE_WEBHOOK_SECRET=<new_secret>
   
   # Restart app to pick up new secret
   ```

2. **Verify signature verification resumes working**:
   ```sql
   SELECT COUNT(*) FROM webhook_logs
   WHERE created_at > NOW() - INTERVAL '5 minutes'
     AND payload ->> 'signature_verified' = 'true';
   ```

3. **Monitor for any missed events**:
   - Check Stripe webhook logs for failed deliveries
   - Manually reprocess any critical events (payment_succeeded, etc.)

4. **Document what happened**:
   - Record the incident in your incident tracking system
   - Note the timestamp and root cause

### Escalation

If signature failures continue after fixing secret:
1. Contact Stripe Support: support@stripe.com
2. Provide timestamps of failed webhooks
3. Ask if their signing secrets were compromised

---

## Incident Type 3: Trial Auto-Upgrade Escalations Spike Above 2/Day

**Severity**: WARNING  
**Alert**: `trial_auto_upgrade_escalations_24h > 2`  
**Response**: Slack notification + escalation email to support

### Investigation Steps (5 minutes)

1. **Get escalation details**:
   ```sql
   SELECT company_id, last_error, retry_count, updated_at
   FROM trial_auto_upgrade_queue
   WHERE status = 'failed'
     AND retry_count > 3
     AND updated_at > NOW() - INTERVAL '24 hours'
   ORDER BY updated_at DESC;
   ```

2. **Get company information**:
   ```sql
   SELECT c.id, c.name, c.email, t.last_error
   FROM trial_auto_upgrade_queue t
   JOIN companies c ON c.id = t.company_id
   WHERE t.status = 'failed'
     AND t.retry_count > 3
     AND t.updated_at > NOW() - INTERVAL '24 hours';
   ```

3. **Identify top failure reasons**:
   ```sql
   SELECT last_error, COUNT(*) as count
   FROM trial_auto_upgrade_queue
   WHERE status = 'failed'
     AND retry_count > 3
     AND updated_at > NOW() - INTERVAL '24 hours'
   GROUP BY last_error
   ORDER BY count DESC;
   ```

### Root Cause Analysis

**If error is "Invalid payment method":**
- Stripe customer likely deleted their payment method
- Action: Send support email asking customer to update payment method

**If error is "Stripe API rate limited":**
- We're hitting Stripe rate limits during trial upgrades
- Action: Slow down upgrade processing or contact Stripe

**If error is "Subscription already exists":**
- Customer was already upgraded (duplicate event)
- Action: Manually verify in Stripe; update database if needed

**If error is "Insufficient funds":**
- Customer's card has insufficient funds
- Action: Send email asking customer to update payment method

### Resolution Steps

1. **For each escalated company**:
   - Send support email: "Your trial is expiring, please update payment method"
   - Include link to billing settings page
   - Offer manual upgrade option if they have questions

2. **If Stripe-related**:
   - Check if rate limiting: Wait 15 minutes then retry
   - Check if API outage: Monitor Stripe Status page

3. **Update database status**:
   - Once resolved, set trial_auto_upgrade_queue.status = 'succeeded'
   - Or set status = 'resolved_manually' with notes

4. **Monitor recovery**:
   ```sql
   SELECT COUNT(*) FROM trial_auto_upgrade_queue
   WHERE status = 'failed' AND retry_count > 3;
   ```

### Prevention

- Consider increasing retry wait times to avoid hammering Stripe API
- Add customer notification 7 days before trial expires
- Implement payment method validation check before auto-upgrade attempt

---

## Incident Type 4: Cap Table Uploads Failing Repeatedly

**Severity**: WARNING  
**Alert**: `cap_table_parse_success < 98%`  
**Response**: Slack notification

### Investigation Steps (5 minutes)

1. **Get recent failed uploads**:
   ```sql
   SELECT id, company_id, file_name, parse_status, parse_error
   FROM cap_table_uploads
   WHERE parse_status = 'error'
     AND created_at > NOW() - INTERVAL '24 hours'
   ORDER BY created_at DESC
   LIMIT 10;
   ```

2. **Identify error patterns**:
   ```sql
   SELECT parse_error, COUNT(*) as count
   FROM cap_table_uploads
   WHERE parse_status = 'error'
     AND created_at > NOW() - INTERVAL '24 hours'
   GROUP BY parse_error
   ORDER BY count DESC;
   ```

3. **Check validation errors**:
   ```sql
   SELECT validation_rule, COUNT(*) as count
   FROM cap_table_validation_errors
   WHERE created_at > NOW() - INTERVAL '1 hour'
   GROUP BY validation_rule
   ORDER BY count DESC;
   ```

### Root Cause Analysis

**If error is "Invalid file format":**
- User uploaded wrong file format (not XLSX/CSV)
- Solution: Ask user to use template and re-upload

**If error is "Missing required columns":**
- File doesn't match expected schema
- Solution: Validate against template, notify user of correct columns

**If error is "File corrupted":**
- File is truncated or corrupted
- Solution: Ask user to verify file and re-upload

**If error is "Database insert failed":**
- Database might be having issues
- Solution: Check database health, retry upload

### Resolution Steps

1. **For each failed upload**:
   - Review the actual error message
   - Contact user with specific guidance on how to fix

2. **If it's a new file format**:
   - Update cap table parser to support new format
   - Add unit tests for new format
   - Notify user their file can now be uploaded

3. **Monitor recovery**:
   ```sql
   SELECT parse_status, COUNT(*) FROM cap_table_uploads
   WHERE created_at > NOW() - INTERVAL '1 hour'
   GROUP BY parse_status;
   ```

### Customer Communication

Template email for file format issues:

```
Hi [Company],

We noticed your cap table file couldn't be processed. Here's why:

Error: [SPECIFIC_ERROR]

To fix this, please:
1. Download our cap table template: [LINK]
2. Use that template as a starting point
3. Fill in your cap table data
4. Re-upload to IPOReady

Common issues:
- Make sure all required columns are present
- Use XLSX or CSV format only
- Don't include extra sheets

Let us know if you need help!
```

---

## Incident Type 5: Webhook Latency p99 > 2000ms

**Severity**: WARNING  
**Alert**: `webhook_processing_latency_ms p99 > 2000ms`  
**Response**: Slack notification

### Investigation Steps

1. **Check current latency distribution**:
   ```sql
   SELECT event_type, COUNT(*) as count, AVG(latency_ms) as avg, MAX(latency_ms) as max
   FROM (
     SELECT event_type, (payload ->> 'latency_ms')::numeric as latency_ms
     FROM webhook_logs
     WHERE created_at > NOW() - INTERVAL '1 hour'
   ) t
   GROUP BY event_type
   ORDER BY max DESC;
   ```

2. **Check for specific slow events**:
   ```sql
   SELECT event_type, event_id, (payload ->> 'latency_ms')::numeric as latency_ms
   FROM webhook_logs
   WHERE created_at > NOW() - INTERVAL '1 hour'
   ORDER BY (payload ->> 'latency_ms')::numeric DESC
   LIMIT 10;
   ```

### Root Cause Analysis

- High latency usually means slow database writes or Stripe API calls
- Check database query performance
- Check Stripe API response times
- Check application CPU/memory usage

### Resolution Steps

1. **If database slow**:
   - Check for long-running queries
   - Add indexes if needed
   - Consider connection pool tuning

2. **If Stripe API slow**:
   - Monitor Stripe status page
   - This usually self-resolves
   - Consider retry logic with exponential backoff

3. **If application slow**:
   - Check CPU usage
   - Check memory usage
   - Consider scaling up or adding workers

---

## Database Schema for Monitoring

### Required Tables

If not already created, run these SQL migrations:

```sql
-- Metrics log table
CREATE TABLE IF NOT EXISTS metrics_log (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  value NUMERIC,
  unit VARCHAR(50),
  labels JSONB,
  timestamp TIMESTAMP DEFAULT NOW(),
  INDEX (name, timestamp)
);

-- Query performance log (for tracking database latency)
CREATE TABLE IF NOT EXISTS query_performance_log (
  id SERIAL PRIMARY KEY,
  query_type VARCHAR(255),
  query TEXT,
  query_duration_ms NUMERIC,
  timestamp TIMESTAMP DEFAULT NOW(),
  INDEX (query_type, timestamp)
);

-- Cap table uploads tracking (if not exists)
CREATE TABLE IF NOT EXISTS cap_table_uploads (
  id UUID PRIMARY KEY,
  company_id UUID,
  file_name VARCHAR(255),
  file_size_bytes INT,
  parse_status VARCHAR(50),
  parse_duration_ms NUMERIC,
  parse_error TEXT,
  validation_error_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX (company_id, created_at)
);

-- Cap table validation errors
CREATE TABLE IF NOT EXISTS cap_table_validation_errors (
  id SERIAL PRIMARY KEY,
  upload_id UUID,
  validation_rule VARCHAR(255),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX (upload_id, created_at)
);
```

---

## Monitoring Dashboard Configuration

### For DataDog

```yaml
monitors:
  - name: "Webhook Success Rate < 99%"
    metric: "webhook_events_processed"
    threshold: 0.99
    
  - name: "Signature Failures > 10/hour"
    metric: "webhook_signature_failures"
    threshold: 10
    
  - name: "Trial Escalations > 2/day"
    metric: "trial_auto_upgrade_escalations"
    threshold: 2
    
  - name: "Cap Table Parse Success < 98%"
    metric: "cap_table_parse_success"
    threshold: 0.98
```

### For New Relic

```json
{
  "alerts": [
    {
      "name": "Webhook Success Rate Alert",
      "query": "SELECT percentage(count(*), WHERE status = 'processed') FROM webhook_logs SINCE 24 hours ago",
      "threshold": 99
    }
  ]
}
```

---

## Escalation Procedure

### Level 1: Slack Notification
- Alert goes to #ops-alerts channel
- On-call engineer acknowledges within 5 minutes

### Level 2: Page On-Call Engineer
- Alert sent via PagerDuty/SMS
- On-call engineer responds within 10 minutes

### Level 3: Escalate to Team Lead
- If Level 2 doesn't respond in 10 minutes
- Or if incident severity increases
- Notify engineering manager

### Level 4: Executive Escalation
- If business impact is critical (>1 hour downtime)
- Notify VP Engineering and CEO

---

## Contact Information

- **On-Call Engineer**: PagerDuty
- **Engineering Manager**: [TBD]
- **Stripe Support**: support@stripe.com
- **Neon (Database)**: support@neon.tech
- **CloudFlare**: support@cloudflare.com

---

## Post-Incident Review

After resolving any incident:

1. **Create incident report** with:
   - Timeline of events
   - Root cause
   - Resolution steps taken
   - Time to resolution

2. **Update this runbook** if procedures need adjustment

3. **Schedule postmortem** within 48 hours to discuss prevention

4. **Implement preventive measures** (monitoring, alerts, code changes)

---

Last updated: 2026-06-01
