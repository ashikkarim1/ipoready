# Monitoring System Quick Reference

## Health Check Endpoints

All endpoints return JSON with status, metrics, and issues. External monitoring systems should poll these every 60 seconds.

### Webhook Health
```
GET /api/health/webhooks
```
**Response**:
```json
{
  "status": "healthy|degraded|warning|unhealthy",
  "lastWebhookProcessed": "2026-06-01T12:34:56Z",
  "webhookSuccessRate24h": 99.5,
  "statistics": {
    "totalEvents24h": 1200,
    "succeededEvents24h": 1194,
    "failedEvents24h": 6
  },
  "queueDepth": 5,
  "signatureVerificationFailures1h": 0,
  "rateLimitEvents1h": 0,
  "issues": [],
  "timestamp": "2026-06-01T12:35:00Z"
}
```
**Status Rules**:
- `degraded`: success rate < 95% OR signature failures > 10/hour OR queue depth > 100
- `warning`: rate limit events > 5/hour
- `unhealthy`: success rate < 90% OR queue depth > 500

### Trial Auto-Upgrade Health
```
GET /api/health/trial-auto-upgrade
```
**Response**:
```json
{
  "status": "healthy|degraded|warning|unhealthy",
  "queueDepth": 3,
  "pending": 1,
  "retrying": 2,
  "failed": 0,
  "successRate24h": 95.2,
  "escalations24h": 0,
  "nextRetryAt": "2026-06-01T12:45:00Z",
  "topFailureReasons": [
    {
      "reason": "invalid_payment_method",
      "count": 2
    },
    {
      "reason": "rate_limited",
      "count": 1
    }
  ],
  "timestamp": "2026-06-01T12:35:00Z"
}
```
**Status Rules**:
- `degraded`: success rate < 90% OR failed > 10
- `warning`: escalations > 2 OR queue depth > 50
- `unhealthy`: success rate < 80% OR queue depth > 100

### Cap Table Health
```
GET /api/health/cap-table
```
**Response**:
```json
{
  "status": "healthy|degraded|warning|unhealthy",
  "uploadsLast24h": 15,
  "parseSuccessRate": 98.3,
  "statistics": {
    "failedUploads": 0,
    "validationErrors": 1
  },
  "latency": {
    "parseAvgMs": 850,
    "parseP95Ms": 2100,
    "parseMaxMs": 3500,
    "databaseAvgMs": 120
  },
  "recentUploads": [
    {
      "id": "doc-123",
      "fileName": "cap-table.xlsx",
      "status": "valid",
      "uploadedAt": "2026-06-01T12:34:00Z"
    }
  ],
  "timestamp": "2026-06-01T12:35:00Z"
}
```
**Status Rules**:
- `warning`: parse success < 98% OR validation errors > 5/hour OR parse p95 > 5000ms OR database avg > 1000ms
- `unhealthy`: parse success < 95% OR validation errors > 20/hour OR parse p95 > 10000ms

## Integration Checklist

### Webhooks (/src/app/api/webhooks/stripe/route.ts)

Metrics recorded:
- ✓ `webhook_signature_failures` - HMAC verification failures
- ✓ `webhook_events_processed` - Events processed (by type)
- ✓ `webhook_processing_latency_ms` - Processing time

Events tracked:
- ✓ customer.subscription.created
- ✓ customer.subscription.updated
- ✓ customer.subscription.deleted
- ✓ invoice.payment_succeeded
- ✓ invoice.payment_failed

### Trial Auto-Upgrade (/src/lib/trial-auto-upgrade.ts)

Metrics recorded:
- ✓ `trial_auto_upgrade_attempts` - Upgrade attempts (by status)
- ✓ `trial_auto_upgrade_retries` - Retry attempts (by number)
- ✓ `trial_auto_upgrade_escalations` - Escalations to support
- ✓ `trial_auto_upgrade_latency_ms` - Processing time

States tracked:
- ✓ succeeded - Subscription created successfully
- ✓ failed - Subscription creation failed
- ✓ retrying - Queued for retry
- ✓ escalated - Escalated to support

### Cap Table (/src/app/api/cap-table/upload/route.ts)

Metrics recorded:
- ✓ `cap_table_uploads` - Upload attempts
- ✓ `cap_table_parse_success` - Successful parses
- ✓ `cap_table_parse_error` - Parse errors
- ✓ `cap_table_validation_errors` - Validation errors (by rule)
- ✓ `cap_table_parse_latency_ms` - Parse time

Actions tracked:
- ✓ upload - File upload initiated
- ✓ parse - Excel parsing completed
- ✓ validate - Validation rules checked

## Alert Thresholds

### Critical Alerts (Page On-Call)
- Webhook success rate drops below 90% for 5 minutes
- Signature verification failures exceed 20/hour
- Trial auto-upgrade escalations exceed 5 in 1 hour
- Cap table parse success rate below 90%

### Major Alerts (Slack Notification)
- Webhook success rate drops below 95%
- Signature verification failures exceed 10/hour
- Trial auto-upgrade queue depth exceeds 100
- Cap table parse latency p95 exceeds 5000ms

### Minor Alerts (Log Notification)
- Rate limit events exceed 5/hour for webhooks
- Trial auto-upgrade queue depth exceeds 50
- Cap table validation errors exceed 5/hour

## Database Tables

### metrics_log
Stores all collected metrics with aggregation info
```sql
SELECT metric_name, metric_labels, metric_value, timestamp
FROM metrics_log
WHERE timestamp > NOW() - INTERVAL '24 hours'
ORDER BY timestamp DESC
```

### trial_auto_upgrade_queue
Tracks pending retry attempts
```sql
SELECT company_id, status, retry_count, next_retry_at, last_error
FROM trial_auto_upgrade_queue
WHERE status IN ('pending', 'retrying')
ORDER BY next_retry_at ASC
```

### cap_table_uploads (from health check)
Summary of recent uploads
```sql
SELECT id, file_name, validation_status, uploaded_at
FROM cap_table_documents
WHERE company_id = ?
ORDER BY uploaded_at DESC
```

## Common Queries

### Webhook Events in Last Hour
```sql
SELECT metric_value, metric_labels->>'eventType' as event_type, COUNT(*)
FROM metrics_log
WHERE metric_name = 'webhook_events_processed'
  AND timestamp > NOW() - INTERVAL '1 hour'
GROUP BY metric_labels->>'eventType'
ORDER BY COUNT(*) DESC
```

### Trial Upgrade Success Rate
```sql
WITH attempts AS (
  SELECT COUNT(*) as total
  FROM metrics_log
  WHERE metric_name = 'trial_auto_upgrade_attempts'
    AND timestamp > NOW() - INTERVAL '24 hours'
),
succeeded AS (
  SELECT COUNT(*) as success
  FROM metrics_log
  WHERE metric_name = 'trial_auto_upgrade_attempts'
    AND metric_labels->>'status' = 'succeeded'
    AND timestamp > NOW() - INTERVAL '24 hours'
)
SELECT (succeeded.success::float / attempts.total::float * 100) as success_rate
FROM attempts, succeeded
```

### Cap Table Parse Latency Percentiles
```sql
SELECT
  PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY metric_value) as p50,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY metric_value) as p95,
  PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY metric_value) as p99,
  MAX(metric_value) as max_latency
FROM metrics_log
WHERE metric_name = 'cap_table_parse_latency_ms'
  AND timestamp > NOW() - INTERVAL '24 hours'
```

## Incident Response

### Quick Links
- Webhook incident: See INCIDENT_RESPONSE.md, Type 1-2
- Trial upgrade incident: See INCIDENT_RESPONSE.md, Type 3
- Cap table incident: See INCIDENT_RESPONSE.md, Type 4

### Escalation Path
1. Slack notification (all severities)
2. Page on-call engineer (critical only)
3. Team lead involvement (2+ incidents in 1 hour)
4. Executive escalation (customer-facing outage)

### On-Call Response Time
- Critical: 5-minute response time
- Major: 15-minute response time
- Minor: 1-hour response time

## Environment Variables

Set these in .env.local for production:

```bash
# Monitoring System Selection
DATADOG_ENABLED=true
DATADOG_API_KEY=<key>
DATADOG_SITE=datadoghq.com

# OR

NEW_RELIC_ENABLED=true
NEW_RELIC_LICENSE_KEY=<key>

# OR

OTEL_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=<endpoint>
```

## Testing Metrics

### Test Signature Failure
```bash
curl -X POST http://localhost:3000/api/webhooks/stripe \
  -H "stripe-signature: invalid" \
  -d '{"test":"data"}'
```

### Verify Health Endpoints
```bash
curl http://localhost:3000/api/health/webhooks
curl http://localhost:3000/api/health/trial-auto-upgrade
curl http://localhost:3000/api/health/cap-table
```

### Check Metrics in Database
```bash
psql -d ipoready -c "SELECT * FROM metrics_log ORDER BY timestamp DESC LIMIT 10"
```

## Performance Targets

| System | Metric | Target | Warning | Critical |
|--------|--------|--------|---------|----------|
| Webhooks | Success Rate | 99%+ | 95% | 90% |
| Webhooks | Latency p95 | <1000ms | >2000ms | >5000ms |
| Webhooks | Signature Failures | 0/hour | >10/hour | >20/hour |
| Trial Upgrade | Success Rate | 95%+ | 90% | 80% |
| Trial Upgrade | Escalations | 0/day | >2/day | >5/day |
| Trial Upgrade | Queue Depth | <10 | >50 | >100 |
| Cap Table | Parse Success | 98%+ | 95% | 90% |
| Cap Table | Parse Latency p95 | <2000ms | >5000ms | >10000ms |
| Cap Table | Validation Errors | <5/hour | >10/hour | >20/hour |
