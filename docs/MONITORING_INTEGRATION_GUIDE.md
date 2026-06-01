# Monitoring Integration Guide

## Overview

This document describes how metrics recording has been integrated into the core IPOReady systems: Stripe webhooks, trial auto-upgrade, and cap table processing. All systems now send real-time metrics to the centralized metrics collection system.

## Integration Architecture

The monitoring system uses a layered approach:

```
Application Code (webhooks, trial-auto-upgrade, cap-table)
         ↓
Metrics Recording Functions (webhook-metrics, trial-metrics, cap-table-metrics)
         ↓
Centralized Metrics Collector (metrics.ts)
         ↓
External Monitoring Systems (DataDog, New Relic, OpenTelemetry)
```

## Stripe Webhook Integration

**File**: `/src/app/api/webhooks/stripe/route.ts`

### Changes Made

1. **Import**: Added `recordWebhookMetrics` from monitoring library
2. **Signature Verification**: Records failure metrics if signature verification fails
3. **Event Processing**: Records success/failure metrics after processing each webhook event

### Metrics Recorded

- **Signature Failures**: `webhook_signature_failures` counter when HMAC verification fails
- **Processing Success**: `webhook_events_processed` counter with event type label
- **Processing Latency**: `webhook_processing_latency_ms` histogram for all events
- **Processing Failures**: `webhook_events_processed` counter with status='failed'

### Code Example

```typescript
// Signature verification recording
const signatureCheckStart = Date.now()
const signatureCheck = verifyWebhookSignatureSecure(body, signature, secret)
if (!signatureCheck.valid) {
  await recordWebhookMetrics({
    eventType: 'signature_failure',
    processingLatencyMs: Date.now() - signatureCheckStart,
    status: 'failed',
    signatureVerified: false,
  })
}

// Successful event processing recording
const processingStart = Date.now()
// ... event processing code ...
const processingLatencyMs = Date.now() - processingStart
await recordWebhookMetrics({
  eventType,
  processingLatencyMs,
  status: 'succeeded',
  signatureVerified: true,
})
```

## Trial Auto-Upgrade Integration

**File**: `/src/lib/trial-auto-upgrade.ts`

### Changes Made

1. **Import**: Added `recordTrialUpgradeMetrics` from monitoring library
2. **Success Tracking**: Records successful subscription creation
3. **Failure Tracking**: Records failed upgrade attempts
4. **Retry Tracking**: Records retry queue entries and escalations

### Metrics Recorded

- **Upgrade Attempts**: `trial_auto_upgrade_attempts` counter with status label
- **Processing Latency**: `trial_auto_upgrade_latency_ms` histogram for each attempt
- **Retries**: `trial_auto_upgrade_retries` counter with retry_number label
- **Escalations**: `trial_auto_upgrade_escalations` counter when max retries exceeded

### Code Example

```typescript
// Track upgrade attempt
const startTime = Date.now()
try {
  // Create subscription...
  const latencyMs = Date.now() - startTime
  await recordTrialUpgradeMetrics({
    status: 'succeeded',
    attempt: 1,
    latencyMs,
  })
} catch (error) {
  const latencyMs = Date.now() - startTime
  await recordTrialUpgradeMetrics({
    status: 'failed',
    attempt: 1,
    latencyMs,
  })
}

// Track retries
await recordTrialUpgradeMetrics({
  status: 'retrying',
  attempt: retryCount,
  retryNumber: retryCount,
})

// Track escalations
await recordTrialUpgradeMetrics({
  status: 'escalated',
  attempt: retryCount,
  retryNumber: retryCount,
})
```

## Cap Table Integration

**File**: `/src/app/api/cap-table/upload/route.ts`

### Changes Made

1. **Import**: Added `recordCapTableMetrics` from monitoring library
2. **Upload Tracking**: Records upload attempts
3. **Parse Tracking**: Records parse success/failure with latency
4. **Validation Tracking**: Records validation errors by rule type

### Metrics Recorded

- **Uploads**: `cap_table_uploads` counter when upload initiated
- **Parse Success**: `cap_table_parse_success` counter with latency histogram
- **Parse Failures**: `cap_table_parse_error` counter with error count
- **Validation Errors**: `cap_table_validation_errors` counter by rule_type label
- **Parse Latency**: `cap_table_parse_latency_ms` histogram with percentiles

### Code Example

```typescript
// Track upload
const uploadStart = Date.now()
await recordCapTableMetrics({
  action: 'upload',
  companyId,
})

// Track parse with latency
const parseStart = Date.now()
const parseResult = await parser.parse()
const parseLatencyMs = Date.now() - parseStart

if (parseResult.errors.length === 0) {
  await recordCapTableMetrics({
    action: 'parse',
    success: true,
    companyId,
    parseLatencyMs,
  })
} else {
  await recordCapTableMetrics({
    action: 'parse',
    success: false,
    companyId,
    parseLatencyMs,
    errorCount: parseResult.errors.length,
  })
}

// Track validation by rule
const errorsByRule = validationReport.errors.reduce((acc, err) => {
  const rule = err.rule || 'unknown'
  acc[rule] = (acc[rule] || 0) + 1
  return acc
}, {})

for (const [rule, count] of Object.entries(errorsByRule)) {
  await recordCapTableMetrics({
    action: 'validate',
    success: false,
    companyId,
    ruleType: rule,
    errorCount: count,
  })
}
```

## Health Check Endpoints

All three systems have health check endpoints that aggregate metrics:

- **Webhooks**: `GET /api/health/webhooks`
- **Trial Auto-Upgrade**: `GET /api/health/trial-auto-upgrade`
- **Cap Table**: `GET /api/health/cap-table`

These endpoints:
- Poll metrics every 60 seconds (for external monitoring)
- Return JSON status: `healthy`, `degraded`, `warning`, `unhealthy`
- Provide success rates, latency percentiles, and queue depths
- Trigger alerts based on configurable thresholds

## Monitoring System Configuration

To connect to external monitoring systems, set environment variables:

```bash
# DataDog Integration
DATADOG_API_KEY=<key>
DATADOG_SITE=datadoghq.com
DATADOG_ENABLED=true

# New Relic Integration
NEW_RELIC_LICENSE_KEY=<key>
NEW_RELIC_ENABLED=true

# OpenTelemetry Integration
OTEL_EXPORTER_OTLP_ENDPOINT=<endpoint>
OTEL_ENABLED=true
```

## Metric Collection Flow

1. **Metrics Generated**: Application code calls recording functions
2. **In-Memory Storage**: Metrics stored in memory with labels
3. **Auto-Flush**: Every 60 seconds, metrics are:
   - Aggregated by metric name and labels
   - Percentiles calculated (p50, p95, p99)
   - Sent to external monitoring system
   - Persisted to metrics_log table
4. **Health Checks**: External systems poll `/api/health/*` endpoints
5. **Alerts**: Threshold violations trigger incidents

## Testing the Integration

### Test Webhook Metrics

```bash
curl -X POST http://localhost:3000/api/webhooks/stripe \
  -H "stripe-signature: t=<timestamp>,v1=<signature>" \
  -d '{"id":"evt_test","type":"customer.subscription.created",...}'

# Check metrics
curl http://localhost:3000/api/health/webhooks
```

### Test Trial Auto-Upgrade Metrics

```bash
# Manually trigger a trial expiry for testing
# This will record metrics for success/failure

# Check metrics
curl http://localhost:3000/api/health/trial-auto-upgrade
```

### Test Cap Table Metrics

```bash
# Upload a cap table file
curl -X POST http://localhost:3000/api/cap-table/upload \
  -F "file=@cap-table.xlsx" \
  -F "companyId=<id>"

# Check metrics
curl http://localhost:3000/api/health/cap-table
```

## Production Deployment Checklist

- [ ] Environment variables configured for monitoring system
- [ ] Database schema created and migrations applied
- [ ] Health check endpoints are returning metrics
- [ ] Alert thresholds configured in monitoring system
- [ ] Incident response runbook reviewed with team
- [ ] On-call rotation configured with escalation paths
- [ ] Monitoring dashboards created and shared
- [ ] Log aggregation system tested
- [ ] Alert routing verified to correct channels
- [ ] 24-hour monitoring verification complete

## Next Steps

1. Configure monitoring system with environment variables
2. Create dashboards in DataDog/New Relic
3. Set up alert rules based on health check thresholds
4. Test incident response procedures
5. Deploy to production and verify metrics flow
