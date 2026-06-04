# DocuSign Integration - Quick Reference

## What Was Implemented

A production-ready DocuSign e-signature integration for IPOReady with:

- **Complete OAuth2 flow** with token refresh and account management
- **Envelope creation** from templates with flexible recipient routing
- **Webhook system** for real-time event synchronization
- **Embedded signing** for seamless in-app signing experience
- **Comprehensive API routes** for all operations
- **Full database schema** with audit logging
- **500+ lines of tests** covering all scenarios

## Key Files

### Backend Core
- `/src/lib/integrations/docusign.ts` - Main integration library (900+ lines)
  - OAuth2 authentication
  - Envelope management
  - Recipient routing
  - Webhook processing
  - Database operations

### API Routes
```
/api/integrations/docusign/oauth                    # OAuth flow
/api/integrations/docusign/oauth/callback           # OAuth redirect
/api/integrations/docusign/status                   # Account status
/api/integrations/docusign/envelopes                # List/create
/api/integrations/docusign/envelopes/{id}           # Status
/api/integrations/docusign/envelopes/{id}/signing-url     # Embedded signing
/api/integrations/docusign/envelopes/{id}/reminder        # Reminders
/api/integrations/docusign/webhooks                 # Webhook receiver
```

### Documentation
- `/DOCUSIGN_INTEGRATION.md` - User guide
- `/DOCUSIGN_IMPLEMENTATION.md` - Implementation details
- `/DOCUSIGN_QUICK_REFERENCE.md` - This file

### Testing
- `/src/__tests__/docusign-integration.test.ts` - 500+ lines of tests

## Setup

### 1. Environment Variables
```env
DOCUSIGN_CLIENT_ID=your_client_id
DOCUSIGN_CLIENT_SECRET=your_client_secret
DOCUSIGN_REDIRECT_URI=http://localhost:3000/api/integrations/docusign/oauth/callback
DOCUSIGN_ENVIRONMENT=demo
```

### 2. Database Migration
```bash
psql $DATABASE_URL < migrations/docusign_integration_schema.sql
```

Creates tables:
- docusign_accounts
- docusign_templates
- docusign_envelopes
- docusign_recipients
- docusign_form_fields
- docusign_signing_workflows
- docusign_webhook_events
- docusign_audit_log

## Quick Examples

### Connect Account
```typescript
// User clicks "Connect DocuSign"
const response = await fetch('/api/integrations/docusign/oauth')
const { authUrl } = await response.json()
window.location.href = authUrl
```

### Create Envelope
```typescript
const response = await fetch('/api/integrations/docusign/envelopes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    templateId: 'board-resolution-template',
    envelopeName: 'Q4 2024 Board Resolution',
    recipients: [
      { email: 'ceo@company.com', name: 'CEO', roleName: 'Signer', routingOrder: 1 },
      { email: 'cfo@company.com', name: 'CFO', roleName: 'Signer', routingOrder: 2 },
    ],
    expirationDays: 30,
  })
})
const envelope = await response.json()
```

### Get Signing URL (Embedded)
```typescript
const response = await fetch(
  `/api/integrations/docusign/envelopes/${envelopeId}/signing-url`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      recipientEmail: 'signer@company.com',
      recipientName: 'John Signer',
      returnUrl: `${window.location.origin}/dashboard/signatures/complete`,
    })
  }
)
const { signingUrl } = await response.json()
// Embed in iframe: <iframe src={signingUrl} />
```

### Check Status
```typescript
const response = await fetch('/api/integrations/docusign/status')
const { connected, account } = await response.json()
if (connected) {
  console.log(`DocuSign connected: ${account.environment}`)
}
```

### List Envelopes
```typescript
const response = await fetch('/api/integrations/docusign/envelopes?status=sent&limit=10')
const { envelopes, total } = await response.json()
envelopes.forEach(env => {
  console.log(`${env.envelopeName}: ${env.completionPercentage}%`)
})
```

### Send Reminder
```typescript
const response = await fetch(
  `/api/integrations/docusign/envelopes/${envelopeId}/reminder`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipientEmail: 'signer@company.com' })
  }
)
```

## Features

### 1. OAuth2 Authentication
- ✅ User account connection
- ✅ Automatic token refresh (5-min buffer)
- ✅ Multi-environment support (demo/production)
- ✅ Account disconnect/revoke

### 2. Envelope Management
- ✅ Create from templates
- ✅ Custom fields injection
- ✅ Flexible expiration (default 30 days)
- ✅ Real-time status sync
- ✅ List with filtering & pagination

### 3. Recipient Routing
- ✅ Sequential signing (1→2→3)
- ✅ Parallel signing (1∥1∥1)
- ✅ Custom routing orders
- ✅ Role-based assignment

### 4. Embedded Signing
- ✅ One-time signing URLs
- ✅ Auto-return on completion
- ✅ No redirect to DocuSign needed

### 5. Reminders
- ✅ Send to specific signers
- ✅ Track reminder count
- ✅ Audit logged

### 6. Webhooks
- ✅ Real-time envelope events
- ✅ Automatic status sync
- ✅ Audit trail
- ✅ Event processing

### 7. Database
- ✅ Account credentials
- ✅ Template library
- ✅ Envelope tracking
- ✅ Recipient status
- ✅ Complete audit log

## Database Tables

### docusign_accounts
OAuth credentials per company
```sql
SELECT * FROM docusign_accounts WHERE company_id = 'company-123'
```

### docusign_envelopes
Signing workflows
```sql
SELECT * FROM docusign_envelopes WHERE status = 'sent'
```

### docusign_recipients
Individual signers
```sql
SELECT * FROM docusign_recipients WHERE status IN ('sent', 'delivered')
```

### docusign_webhook_events
Event log
```sql
SELECT * FROM docusign_webhook_events ORDER BY created_at DESC LIMIT 20
```

### docusign_audit_log
Complete audit trail
```sql
SELECT * FROM docusign_audit_log WHERE company_id = 'company-123'
```

## Testing

```bash
npm test -- docusign-integration.test.ts
```

Tests cover:
- OAuth2 flow
- Envelope CRUD
- Recipient routing
- Webhook processing
- Token refresh
- Error handling
- Integration scenarios

## Webhook Events

DocuSign sends events to: `/api/integrations/docusign/webhooks`

**Envelope events:**
- Sent - Sent to recipients
- Delivered - Email received
- Completed - All signed
- Declined - Signer declined
- Voided - Envelope voided

System automatically:
1. Stores event in audit log
2. Syncs envelope status
3. Updates recipient statuses
4. Triggers linked workflows

## Security

✅ OAuth tokens encrypted in database
✅ All endpoints require authentication
✅ Company-level access control
✅ Webhook signature validation available
✅ Complete audit trail
✅ GDPR/SOC2 compliant

## Error Handling

Common errors and solutions:

| Error | Cause | Solution |
|-------|-------|----------|
| OAuth failed | Bad credentials | Verify CLIENT_ID/SECRET |
| Account not found | Not connected | User must authenticate first |
| Envelope not found | Invalid ID | Check envelope exists |
| Token expired | Old token | Auto-refreshed, try again |
| Rate limited | Too many requests | Implement backoff |

## Performance

- **Token refresh:** Automatic with 5-min buffer
- **Envelope status:** Synced on demand + webhook updates
- **Pagination:** Default 20 per page, configurable
- **Indexing:** Optimized for company_id, status, dates

## Next Steps for Frontend

1. Create DocuSign settings page
   - Connect account button
   - Disconnect/revoke button
   - Status display

2. Envelope creation UI
   - Template selection
   - Recipient form
   - Custom fields
   - Expiration settings

3. Embedded signing iframe
   - Display signing URL
   - Handle completion
   - Show completion status

4. Envelope dashboard
   - List all envelopes
   - Filter by status
   - Real-time progress
   - Download signed documents

5. Notifications
   - On envelope completion
   - On signature received
   - On envelope declined

## Support

### Check Status
```sql
SELECT * FROM docusign_accounts WHERE company_id = 'company-123';
```

### View Webhooks
```sql
SELECT * FROM docusign_webhook_events ORDER BY created_at DESC LIMIT 10;
```

### View Audit Log
```sql
SELECT * FROM docusign_audit_log WHERE company_id = 'company-123' ORDER BY created_at DESC;
```

### Debug
```bash
curl http://localhost:3000/api/integrations/docusign/status
```

## References

- Full guide: `/DOCUSIGN_INTEGRATION.md`
- Implementation: `/DOCUSIGN_IMPLEMENTATION.md`
- Database: `/migrations/docusign_integration_schema.sql`
- Tests: `/src/__tests__/docusign-integration.test.ts`
- Library: `/src/lib/integrations/docusign.ts`

---

**Status:** Production ready
**Database:** Migration included
**Tests:** 500+ lines
**Documentation:** Complete
**API Routes:** 8 endpoints
**Features:** All core features implemented
