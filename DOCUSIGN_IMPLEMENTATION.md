# DocuSign Integration Implementation Guide

## Implementation Summary

A complete DocuSign e-signature integration has been implemented for IPOReady, providing secure document signing workflows throughout the IPO preparation process.

## Files Created

### Backend Libraries
1. `/src/lib/integrations/docusign.ts` (900+ lines)
   - OAuth2 authentication flow
   - Envelope creation and management
   - Recipient routing (sequential/parallel)
   - Webhook event processing
   - Database operations

### API Routes
1. `/src/app/api/integrations/docusign/oauth/route.ts` - OAuth flow
2. `/src/app/api/integrations/docusign/oauth/callback/route.ts` - OAuth callback
3. `/src/app/api/integrations/docusign/envelopes/route.ts` - List and create envelopes
4. `/src/app/api/integrations/docusign/envelopes/[id]/route.ts` - Get envelope status
5. `/src/app/api/integrations/docusign/envelopes/[id]/signing-url/route.ts` - Embedded signing
6. `/src/app/api/integrations/docusign/envelopes/[id]/reminder/route.ts` - Send reminders
7. `/src/app/api/integrations/docusign/status/route.ts` - Account connection status
8. `/src/app/api/integrations/docusign/webhooks/route.ts` - Webhook receiver

### Testing
1. `/src/__tests__/docusign-integration.test.ts` (500+ lines)
   - OAuth2 flow tests
   - Envelope management tests
   - Recipient routing tests
   - Webhook processing tests
   - Error handling tests
   - Integration scenarios

### Documentation
1. `/DOCUSIGN_INTEGRATION.md` - Complete user guide
2. `/DOCUSIGN_IMPLEMENTATION.md` - This implementation guide

## Database Schema

The following tables are created by `/migrations/docusign_integration_schema.sql`:

### Account Management
- `docusign_accounts` - OAuth credentials and account settings
- Indexes on: company_id, oauth_status, is_active

### Template Library
- `docusign_templates` - Reusable signing templates
- Fields: docusign_template_id, template_name, document_type, category
- Indexes on: company_id, document_type, is_active

### Envelope & Signing
- `docusign_envelopes` - Signing workflows
- `docusign_recipients` - Individual signers
- `docusign_form_fields` - Signature field metadata
- `docusign_signing_workflows` - Reusable routing rules

### Events & Audit
- `docusign_webhook_events` - Real-time event log
- `docusign_audit_log` - Complete audit trail

### Views
- `v_docusign_envelope_status` - Dashboard metrics
- `v_pending_signatures` - Envelopes awaiting signature
- `v_signing_completion_timeline` - Analytics

## Feature Breakdown

### 1. OAuth2 Authentication
```
Flow: User connects DocuSign account
├── GET /api/integrations/docusign/oauth
│   └── Returns authorization URL
├── User grants consent in DocuSign
└── GET /api/integrations/docusign/oauth/callback
    └── Exchange code for tokens
    └── Save account to database
```

**Key Functions:**
- `generateAuthorizationUrl()` - Creates OAuth consent URL
- `exchangeOAuthCode()` - Token exchange
- `getDocuSignUserInfo()` - Fetch user metadata
- `refreshOAuthToken()` - Automatic token refresh
- `revokeOAuthToken()` - Disconnect account

### 2. Envelope Management
```
Flow: Create and manage signing workflows
├── POST /api/integrations/docusign/envelopes
│   └── Create envelope from template
│   └── Define recipients and routing
│   └── Set expiration and custom fields
├── GET /api/integrations/docusign/envelopes
│   └── List with filtering and pagination
└── GET /api/integrations/docusign/envelopes/{id}
    └── Real-time status with recipient tracking
```

**Key Functions:**
- `createEnvelope()` - Create signing workflow
- `getEnvelopeStatus()` - Get real-time status
- `listEnvelopes()` - List with filters
- `syncEnvelopeStatus()` - Sync with DocuSign

### 3. Recipient Routing
```
Flow: Route documents to signers
├── Sequential routing (1 → 2 → 3)
│   └── Each signer gets turn after previous completes
└── Parallel routing (1 ∥ 1 ∥ 1)
    └── Multiple signers sign simultaneously
```

**Routing Configuration:**
```typescript
// Sequential (default)
recipients: [
  { email: 'ceo@company.com', routingOrder: 1 },
  { email: 'cfo@company.com', routingOrder: 2 },
]

// Parallel
recipients: [
  { email: 'signer1@company.com', routingOrder: 1 },
  { email: 'signer2@company.com', routingOrder: 1 },
]
```

### 4. Embedded Signing
```
Flow: Sign documents without leaving IPOReady
├── POST /api/integrations/docusign/envelopes/{id}/signing-url
│   └── Get one-time signing URL
├── Client embeds URL in iframe
└── Signer completes signing
    └── Redirects to returnUrl on completion
```

**Key Functions:**
- `getSigningUrl()` - Generate signing URL
- One-time use, auto-expires
- Returns to specified URL after signing

### 5. Webhook System
```
Flow: Real-time event synchronization
├── DocuSign sends event to:
│   /api/integrations/docusign/webhooks
├── System processes event:
│   ├── Store in audit log
│   ├── Sync envelope status
│   ├── Update recipients
│   └── Trigger workflows
└── Return 200 OK (required)
```

**Webhook Events:**
- Sent - Envelope dispatched
- Delivered - Email received
- Completed - All signed
- Declined - Signer declined
- Voided - Envelope voided

**Key Functions:**
- `processWebhookEvent()` - Main webhook handler
- `handleEnvelopeCompleted()` - Mark as complete
- `handleEnvelopeDeclined()` - Handle rejection

### 6. Reminder System
```
Flow: Manage signing reminders
├── POST /api/integrations/docusign/envelopes/{id}/reminder
│   └── Send reminder to specific signer
├── Tracks reminder_count in database
└── Supports configurable frequency
```

**Key Functions:**
- `sendReminderToRecipient()` - Send reminder
- Increments reminder counter
- Logs in audit trail

## Integration Points

### 1. With Prospectus
When creating envelope for prospectus:
```typescript
const envelope = await createEnvelope({
  prospectusId: 'prospectus-123',
  // ...
})
```

On completion:
- Prospectus status updated to 'review'
- Signed document linked in prospectus

### 2. With Notifications
Webhook triggers notification on:
- Envelope completed
- Envelope declined
- Recipient signed

### 3. With Audit Log
All operations logged:
- Envelope creation
- Recipient updates
- Reminder sent
- Status changes

## Testing Strategy

### Unit Tests
- OAuth flow validation
- URL generation
- Recipient routing
- Webhook parsing

### Integration Tests
- Complete signing workflow
- Token refresh on expiration
- Database operations
- Error handling

### Manual Testing
1. Create DocuSign Sandbox account
2. Set `DOCUSIGN_ENVIRONMENT=demo`
3. Create test template
4. Test complete workflow
5. Verify webhook events

## API Examples

### Example 1: Create Board Resolution
```bash
curl -X POST http://localhost:3000/api/integrations/docusign/envelopes \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "board-resolution-template",
    "envelopeName": "Q4 2024 Board Resolution",
    "recipients": [
      {
        "email": "ceo@company.com",
        "name": "John CEO",
        "roleName": "Signer",
        "routingOrder": 1
      },
      {
        "email": "gc@company.com",
        "name": "Jane GC",
        "roleName": "Signer",
        "routingOrder": 2
      }
    ],
    "expirationDays": 30
  }'
```

### Example 2: Get Signing URL
```bash
curl -X POST http://localhost:3000/api/integrations/docusign/envelopes/envelope-123/signing-url \
  -H "Content-Type: application/json" \
  -d '{
    "recipientEmail": "signer@company.com",
    "recipientName": "John Signer",
    "returnUrl": "http://localhost:3000/dashboard/signatures/complete"
  }'
```

### Example 3: Send Reminder
```bash
curl -X POST http://localhost:3000/api/integrations/docusign/envelopes/envelope-123/reminder \
  -H "Content-Type: application/json" \
  -d '{
    "recipientEmail": "signer@company.com"
  }'
```

## Environment Configuration

### Development (Demo/Sandbox)
```env
DOCUSIGN_CLIENT_ID=test_client_id
DOCUSIGN_CLIENT_SECRET=test_secret
DOCUSIGN_ENVIRONMENT=demo
DOCUSIGN_REDIRECT_URI=http://localhost:3000/api/integrations/docusign/oauth/callback
```

### Production
```env
DOCUSIGN_CLIENT_ID=prod_client_id
DOCUSIGN_CLIENT_SECRET=prod_secret
DOCUSIGN_ENVIRONMENT=production
DOCUSIGN_REDIRECT_URI=https://yourdomain.com/api/integrations/docusign/oauth/callback
DOCUSIGN_WEBHOOK_SECRET=webhook_secret_from_docusign
```

## Error Handling

### Common Errors

**"OAuth token exchange failed"**
- Verify CLIENT_ID and CLIENT_SECRET
- Check REDIRECT_URI matches DocuSign app settings

**"No active DocuSign account found"**
- User must connect DocuSign account first
- Check docusign_accounts table

**"Envelope not found"**
- Verify envelope ID exists
- Check company isolation

**"Token expired"**
- Automatically refreshed by ensureValidToken()
- If still failing, reconnect account

## Security Considerations

1. **OAuth Tokens**
   - Stored encrypted in database
   - Never logged or exposed
   - Refresh with 5-minute buffer

2. **API Authentication**
   - All endpoints require NextAuth session
   - Company-level access control
   - Session validation on every request

3. **Webhook Security**
   - Can validate HMAC-SHA256 signature
   - Always return 200 status
   - Process asynchronously if needed

4. **Audit Trail**
   - All operations logged in docusign_audit_log
   - Includes actor, action, and changes
   - Available for compliance audits

## Performance Optimization

1. **Token Refresh**
   - Done automatically before expiration
   - 5-minute buffer prevents failures
   - Cached in local variable

2. **Envelope Status**
   - Synced from DocuSign on demand
   - Cached in database
   - Webhook updates in real-time

3. **Pagination**
   - List endpoints support limit/offset
   - Default 20 per page
   - Total count provided

4. **Indexing**
   - Indexes on company_id, status, dates
   - Efficient filtering and sorting

## Compliance

The integration supports:
- ESIGN Act (U.S.)
- eIDAS (EU)
- GDPR data handling
- SOC 2 audit requirements
- FDA 21 CFR Part 11 (healthcare)

## Next Steps

1. **Frontend Integration**
   - Create DocuSign settings page
   - Add envelope creation UI
   - Implement signing interface

2. **Template Management**
   - UI to sync templates from DocuSign
   - Template categorization
   - Custom field mapping

3. **Advanced Workflows**
   - Reminder automation
   - Conditional routing
   - Multi-envelope sequences

4. **Analytics**
   - Signing completion metrics
   - Average time to signature
   - Failure rate tracking

5. **Notifications**
   - Email on envelope events
   - In-app notifications
   - Admin alerts

## Support

For issues:
1. Check webhook logs: `SELECT * FROM docusign_webhook_events`
2. Review audit trail: `SELECT * FROM docusign_audit_log`
3. Verify DocuSign account status: `GET /api/integrations/docusign/status`
4. Enable debug logging: `DEBUG=docusign:*`

## References

- [DocuSign Developer Center](https://developers.docusign.com/)
- [REST API Docs](https://developers.docusign.com/docs/esign-rest-api/)
- [OAuth2 Guide](https://developers.docusign.com/docs/esign-rest-api/oauth2/)
- [Connect Webhooks](https://developers.docusign.com/docs/esign-rest-api/connect/)
