# Financial Integration Quick Start Guide

## 5-Minute Setup

### 1. Apply Database Schema
```bash
psql $DATABASE_URL < src/db/schema-financial-sync.sql
```

### 2. Configure Environment Variables
```bash
# Copy the template
cp .env.financial-integrations.example .env.local

# Add your credentials
# - QUICKBOOKS_CLIENT_ID / SECRET
# - XERO_CLIENT_ID / SECRET
# - CRON_SECRET (random token)
```

### 3. Verify Integration
```bash
# Test QB auth URL generation
curl -X POST http://localhost:3000/api/integrations/quickbooks \
  -H "Content-Type: application/json" \
  -d '{"action":"get-auth-url","companyId":"YOUR_COMPANY_UUID"}'

# Should return: {"authUrl": "...", "state": "..."}
```

## Common Tasks

### Initiate Financial Sync
```typescript
// POST /api/integrations/quickbooks
{
  "action": "start-sync",
  "companyId": "company-uuid",
  "syncType": "incremental"  // or "full", "balance_sheet_only"
}

// Response:
{
  "syncId": "sync-uuid",
  "status": "in_progress"
}
```

### Check Sync Status
```typescript
// GET /api/integrations/quickbooks?action=sync-status&syncId=sync-uuid

// Response:
{
  "sync": {
    "id": "sync-uuid",
    "status": "completed",
    "transactions_processed": 150,
    "validation_errors": 2,
    "duration_seconds": 45
  }
}
```

### Get Integration Status
```typescript
// GET /api/integrations/quickbooks?action=status&companyId=company-uuid

// Response:
{
  "connected": true,
  "integration": {
    "id": "integration-uuid",
    "platform": "quickbooks",
    "organization_name": "Acme Corp",
    "is_active": true,
    "last_successful_sync": "2026-06-04T14:30:00Z"
  }
}
```

### Get Financial Summary
```typescript
// GET /api/integrations/quickbooks?action=financial-summary&companyId=company-uuid

// Response:
{
  "summary": [
    {
      "data_category": "revenue",
      "total_amount": "500000.00",
      "record_count": 45,
      "latest_period": "2026-06-03"
    },
    {
      "data_category": "expense",
      "total_amount": "250000.00",
      "record_count": 120,
      "latest_period": "2026-06-03"
    }
  ]
}
```

## Database Queries

### View Recent Syncs
```sql
SELECT id, status, transactions_processed, validation_errors, created_at
FROM accounting_syncs
WHERE integration_id = 'integration-uuid'
ORDER BY created_at DESC
LIMIT 10;
```

### Check Validation Errors
```sql
SELECT error_type, severity, error_message, created_at
FROM sync_validation_errors
WHERE resolved = false
AND sync_id IN (
  SELECT id FROM accounting_syncs WHERE integration_id = 'integration-uuid'
)
ORDER BY severity DESC, created_at DESC;
```

### View PACE Metrics Generated
```sql
SELECT category, metric, value, unit, confidence, assessment
FROM pace_score_inputs
WHERE company_id = 'company-uuid'
AND period_end = CURRENT_DATE
ORDER BY category, metric;
```

### Financial Data Summary
```sql
SELECT
  data_category,
  COUNT(*) as record_count,
  SUM(amount) as total_amount,
  AVG(confidence_score) as avg_confidence,
  MIN(period_start) as earliest_period,
  MAX(period_end) as latest_period
FROM accounting_data_mapped
WHERE company_id = 'company-uuid'
GROUP BY data_category;
```

## Troubleshooting

### Sync Stuck in "in_progress"
```sql
-- Check if sync is genuinely stuck
SELECT id, status, started_at, completed_at
FROM accounting_syncs
WHERE status = 'in_progress'
AND started_at < NOW() - INTERVAL '1 hour';

-- Force completion if hung
UPDATE accounting_syncs
SET status = 'failed', error_message = 'Manually marked as failed'
WHERE id = 'sync-uuid';
```

### No PACE Metrics Generated
```sql
-- Check if financial data was mapped
SELECT COUNT(*) FROM accounting_data_mapped
WHERE company_id = 'company-uuid'
AND created_at > NOW() - INTERVAL '1 day';

-- Check if PACE mapping is enabled
-- Verify FINANCIAL_PACE_MAPPING_ENABLED=true in env vars
```

### Integration Disabled After Failures
```sql
-- Check consecutive failures
SELECT id, consecutive_failures, last_failed_sync
FROM accounting_integrations
WHERE company_id = 'company-uuid';

-- Re-enable if user has fixed the issue
UPDATE accounting_integrations
SET consecutive_failures = 0, is_active = true
WHERE id = 'integration-uuid';
```

### Token Expiry Issues
```sql
-- Check token expiry
SELECT token_expires_at, last_successful_sync
FROM accounting_integrations
WHERE id = 'integration-uuid';

-- If expired, user must re-authorize
-- POST /api/integrations/quickbooks with action=get-auth-url
```

## Performance Tips

1. **Use Incremental Syncs**
   - Default `syncType: "incremental"` for daily syncs
   - Only use `"full"` for reconciliation

2. **Cache Financial Data**
   - PACE metrics cached for 7 days
   - Reduces re-computation on every access

3. **Batch Validations**
   - Large syncs automatically batched
   - No timeout on sync operations

4. **Index Optimization**
   - Queries indexed on company_id, period, category
   - Fast lookups even with millions of records

## External Cron Configuration

### EasyCron Example
```
URL: https://api.ipoready.com/api/cron/sync-financials
Method: POST
Headers:
  Authorization: Bearer YOUR_CRON_SECRET
  Content-Type: application/json
Schedule: 0 14 * * * (Daily at 2 PM UTC)
```

### GitHub Actions Example
```yaml
name: Financial Sync
on:
  schedule:
    - cron: '0 14 * * *'

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger financial sync
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://api.ipoready.com/api/cron/sync-financials
```

### AWS EventBridge Example
```json
{
  "Name": "financial-sync-daily",
  "ScheduleExpression": "cron(0 14 * * ? *)",
  "State": "ENABLED",
  "Targets": [
    {
      "Arn": "arn:aws:lambda:us-east-1:123456789:function:triggerSync",
      "RoleArn": "arn:aws:iam::123456789:role/service-role"
    }
  ]
}
```

## API Reference

### QuickBooks
- `POST /api/integrations/quickbooks` - Get auth URL or start sync
- `GET /api/integrations/quickbooks` - Check status or summary
- `GET /api/integrations/quickbooks/callback` - OAuth callback

### Xero
- `POST /api/integrations/xero` - Get auth URL or start sync
- `GET /api/integrations/xero` - Check status or summary
- `GET /api/integrations/xero/callback` - OAuth callback

### Cron Job
- `POST /api/cron/sync-financials` - Trigger scheduled syncs (Bearer token required)
- `GET /api/cron/sync-financials` - Health check

## File Locations

**Core Services:**
- `/src/lib/integrations/quickbooks.ts` - QB service
- `/src/lib/integrations/xero.ts` - Xero service
- `/src/lib/integrations/pace-financial-mapper.ts` - PACE mapping

**API Endpoints:**
- `/src/app/api/integrations/quickbooks/` - QB routes
- `/src/app/api/integrations/xero/` - Xero routes
- `/src/app/api/cron/sync-financials/` - Cron job

**Database:**
- `/src/db/schema-accounting-integration.sql` - Core schema
- `/src/db/schema-financial-sync.sql` - Extension schema

**Documentation:**
- `FINANCIAL_INTEGRATION_GUIDE.md` - Full documentation
- `FINANCIAL_INTEGRATION_SUMMARY.txt` - Implementation summary
- `.env.financial-integrations.example` - Environment variables

## Key Code Examples

### Start QB Sync
```typescript
import { QuickBooksIntegrationService } from '@/lib/integrations/quickbooks';

const config = {
  clientId: process.env.QUICKBOOKS_CLIENT_ID,
  clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET,
  redirectUri: process.env.QUICKBOOKS_REDIRECT_URI,
};

const service = new QuickBooksIntegrationService(config);
const sync = await service.startSync(integrationId, 'incremental');
```

### Generate PACE Inputs
```typescript
import { PaceFinancialMapper } from '@/lib/integrations/pace-financial-mapper';

const inputs = PaceFinancialMapper.mapToPaceInputs(
  companyId,
  'quickbooks',
  { start: new Date('2026-01-01'), end: new Date('2026-06-04') },
  financialData
);

await PaceFinancialMapper.savePaceInputs(companyId, inputs);
```

### Query Financial Data
```typescript
import { sql } from '@/lib/db';

const summary = await sql`
  SELECT
    data_category,
    SUM(amount) as total,
    COUNT(*) as count
  FROM accounting_data_mapped
  WHERE company_id = ${companyId}
  GROUP BY data_category
`;
```

## Next Steps

1. ✅ Apply database schema
2. ✅ Configure environment variables
3. ✅ Test OAuth endpoints
4. ✅ Set up external cron job
5. ✅ Configure account mappings (optional)
6. ✅ Monitor first few syncs
7. ✅ Review PACE metrics generated

## Support Resources

- **Full Guide**: See `FINANCIAL_INTEGRATION_GUIDE.md`
- **Implementation Details**: See `FINANCIAL_INTEGRATION_SUMMARY.txt`
- **Types**: Check `/src/types/accounting-integration.ts`
- **Database Schema**: Review `/src/db/schema-*.sql`
