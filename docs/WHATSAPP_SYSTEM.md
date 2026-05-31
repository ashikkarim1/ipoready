# WhatsApp Notification System

The IPOReady WhatsApp notification system provides real-time messaging to users about their IPO readiness through WhatsApp, powered by Twilio.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Message Sources                          │
│  Task Reminders | Milestones | Documents | Board Reports   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
         ┌───────────────────────────────────┐
         │   whatsapp-scheduler.ts          │
         │   (Task & Milestone alerts)      │
         └────────────┬──────────────────────┘
                      │
        ┌─────────────▼──────────────┐
        │  whatsapp-queue.ts         │
        │  (Priority queue, rate     │
        │   limit, deduplication)    │
        └────────────┬───────────────┘
                     │
        ┌────────────▼──────────────────┐
        │  whatsapp-service.ts         │
        │  (Twilio integration, DB     │
        │   logging, status tracking)  │
        └────────────┬─────────────────┘
                     │
        ┌────────────▼──────────────────┐
        │  whatsapp-templates.ts       │
        │  (Message templates with     │
        │   variable interpolation)    │
        └────────────┬─────────────────┘
                     │
        ┌────────────▼──────────────────┐
        │  Twilio WhatsApp API         │
        │  (Send messages, receive     │
        │   delivery receipts)         │
        └──────────────────────────────┘
```

## Core Components

### 1. **Message Templates** (`src/lib/whatsapp-templates.ts`)

Pre-defined message templates with variable interpolation:

- `task-reminder`: Daily task due reminders
- `milestone-alert`: Milestone progress updates
- `daily-pulse`: Morning briefing (9am)
- `document-ready`: Document approval notifications
- `board-report-ready`: Board report ready alerts
- `account-alert`: Account issues (billing, compliance, etc.)

**Template Rendering:**
```typescript
import { renderWhatsAppMessage } from '@/lib/whatsapp-templates'

const message = renderWhatsAppMessage('task-reminder', {
  taskName: 'Complete Due Diligence Review',
  dueDate: 'Dec 15, 2:30 PM',
  priority: 'critical'
})
```

**All templates are:**
- Under 1024 characters (WhatsApp limit)
- Casual but professional tone
- Include action buttons (where applicable)
- Include opt-out instructions

### 2. **WhatsApp Service** (`src/lib/whatsapp-service.ts`)

Core messaging service with Twilio integration:

```typescript
import { sendWhatsAppMessage } from '@/lib/whatsapp-service'

const messageId = await sendWhatsAppMessage({
  phoneNumber: '+16135551234',
  templateId: 'task-reminder',
  variables: {
    taskName: 'Review Documents',
    dueDate: 'Tomorrow 9am',
    priority: 'high'
  },
  userId: 'user-123',
  companyId: 'company-456'
})
```

**Features:**
- E.164 phone number validation
- Database logging of all messages
- Graceful fallback if Twilio not configured
- Message status tracking (queued, sent, delivered, failed)
- Idempotent sends (safe to retry)

### 3. **Message Queue** (`src/lib/whatsapp-queue.ts`)

Intelligent message queuing with rate limiting:

```typescript
import { enqueueMessage, processQueue } from '@/lib/whatsapp-queue'

// Queue a message
await enqueueMessage({
  phoneNumber: '+16135551234',
  templateId: 'task-reminder',
  variables: { /* ... */ },
  priority: 'urgent' // or 'regular'
})

// Process queue (called by cron every 5 seconds)
const result = await processQueue()
// { processed: 5, failed: 0, rateLimited: 0 }
```

**Queue Features:**
- **Priority Processing**: Urgent messages processed first
- **Rate Limiting**: Max 20 messages/minute to Twilio
- **Deduplication**: Prevents duplicate messages within 5 minutes
- **Exponential Backoff**: Retry failed messages with increasing delays
- **Max 5 Retries**: Give up after 5 failed attempts

### 4. **Scheduled Messages** (`src/lib/whatsapp-scheduler.ts`)

Helper functions for common notification types:

```typescript
// Send task reminders (due within 24 hours)
const { sent, failed } = await sendTaskReminders()

// Send milestone alerts (recently updated)
const { sent, failed } = await sendMilestoneAlerts()

// Send document ready alert
await sendDocumentReadyAlert(
  'doc-123',
  'Financial Statements',
  'Financial',
  'CFO',
  'user-123'
)

// Send account alert
await sendAccountAlert(
  'user-123',
  'Billing Issue',
  'Payment method expired',
  'Update payment method in settings'
)
```

## API Endpoints

### User-Facing Endpoints

#### `POST /api/whatsapp/send`
Send a WhatsApp message via template (internal use)

**Requires:** Valid session, Growth/Enterprise plan

**Body:**
```json
{
  "phoneNumber": "+16135551234",
  "templateId": "task-reminder",
  "variables": {
    "taskName": "Review Documents",
    "dueDate": "Tomorrow 9am",
    "priority": "high"
  }
}
```

**Response:**
```json
{
  "ok": true,
  "messageId": "uuid",
  "message": "Message sent successfully"
}
```

#### `GET /api/whatsapp/preferences`
Get user's WhatsApp settings

**Response:**
```json
{
  "phoneNumber": "+16135551234",
  "optedIn": true,
  "plan": "enterprise",
  "eligible": true
}
```

#### `POST /api/whatsapp/preferences`
Opt in to WhatsApp notifications

**Body:**
```json
{
  "phoneNumber": "+16135551234"
}
```

**Requires:** Growth/Enterprise plan

#### `DELETE /api/whatsapp/preferences`
Opt out of WhatsApp notifications

#### `GET /api/whatsapp/status/:messageId`
Check message delivery status

**Response:**
```json
{
  "id": "msg-123",
  "status": "delivered",
  "sentAt": "2025-05-23T10:30:00Z",
  "deliveredAt": "2025-05-23T10:30:15Z",
  "error": null
}
```

### Administrative Endpoints

#### `GET /api/whatsapp/admin/stats`
Get WhatsApp system statistics (admin only)

**Response:**
```json
{
  "logs": {
    "total": 1250,
    "sent": 1200,
    "delivered": 1150,
    "failed": 50,
    "queued": 0
  },
  "queue": {
    "pending": 5,
    "processed": 10000,
    "failed": 25,
    "totalQueued": 10030
  },
  "templates": [
    {
      "templateId": "task-reminder",
      "count": 450,
      "delivered": 430,
      "failed": 20,
      "avgDeliverySeconds": 8.5
    }
  ],
  "recentFailures": [
    {
      "id": "msg-123",
      "phoneNumber": "+16135551234",
      "templateId": "task-reminder",
      "error": "Invalid phone number",
      "createdAt": "2025-05-23T09:15:00Z"
    }
  ],
  "timestamp": "2025-05-23T10:30:00Z"
}
```

### Cron Endpoints

#### `GET /api/whatsapp/process-queue`
Process message queue (called every 5 seconds)

**Header:** `Authorization: Bearer <CRON_SECRET>`

#### `GET /api/whatsapp/cron/task-reminders`
Send task reminders (called daily at 9am)

**Header:** `Authorization: Bearer <CRON_SECRET>`

#### `GET /api/whatsapp/cron/milestone-alerts`
Send milestone alerts (called hourly)

**Header:** `Authorization: Bearer <CRON_SECRET>`

### Webhook Endpoint

#### `POST /api/whatsapp/webhook`
Twilio webhook for inbound messages and delivery receipts

**Handled Automatically:**
- Inbound messages → AI Companion processing
- Message status receipts → Database status updates
- Unknown numbers → Onboarding prompt

## Database Schema

### `whatsapp_logs` table
Tracks all outbound messages:

```sql
CREATE TABLE whatsapp_logs (
  id UUID PRIMARY KEY,
  phone_number VARCHAR(20),
  template_id VARCHAR(50),
  message_body TEXT,
  status VARCHAR(20), -- 'queued', 'sent', 'delivered', 'failed'
  twilio_msg_id VARCHAR(100),
  user_id UUID REFERENCES users(id),
  company_id UUID REFERENCES companies(id),
  error TEXT,
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  failed_at TIMESTAMP,
  created_at TIMESTAMP
);
```

### `whatsapp_queue` table
Message queue with retry logic:

```sql
CREATE TABLE whatsapp_queue (
  id UUID PRIMARY KEY,
  phone_number VARCHAR(20),
  template_id VARCHAR(50),
  variables JSONB,
  priority VARCHAR(20), -- 'urgent', 'regular'
  status VARCHAR(20), -- 'pending', 'processed', 'failed'
  user_id UUID REFERENCES users(id),
  company_id UUID REFERENCES companies(id),
  idempotency_key VARCHAR(255),
  retry_count INTEGER,
  next_retry_at TIMESTAMP,
  created_at TIMESTAMP
);
```

### `user_phone_numbers` table
Track verified phone numbers (future expansion):

```sql
CREATE TABLE user_phone_numbers (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  phone_number VARCHAR(20),
  is_primary BOOLEAN,
  verified BOOLEAN,
  consent_opt_in BOOLEAN,
  created_at TIMESTAMP
);
```

### Modified `users` table columns:
- `phone_number VARCHAR(20)` — Primary WhatsApp phone
- `whatsapp_opted_in BOOLEAN` — Consent flag

## Setup Instructions

### 1. Run Database Migration

```bash
npm run db:migrate -- migrations/001_add_whatsapp_tables.sql
```

Or connect to your Neon database and run the SQL directly.

### 2. Set Environment Variables

```bash
# Twilio configuration
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# Cron job security (generate a random secret)
CRON_SECRET=your_random_cron_secret_here
```

### 3. Configure Twilio Webhook

In Twilio Console → Messaging → Settings → WhatsApp Sandbox:

**Webhook URL:** `https://your-domain.com/api/whatsapp/webhook`
**Method:** POST

**Note:** Webhook automatically handles:
- Inbound message routing to AI Companion
- Delivery status updates

### 4. Setup Cron Jobs

Configure your cron service (e.g., Vercel Cron, AWS EventBridge) to call:

```bash
# Every 5 seconds
GET https://your-domain.com/api/whatsapp/process-queue
Header: Authorization: Bearer <CRON_SECRET>

# Daily at 9:00 AM (user timezone - handled client-side)
GET https://your-domain.com/api/whatsapp/cron/task-reminders
Header: Authorization: Bearer <CRON_SECRET>

# Hourly
GET https://your-domain.com/api/whatsapp/cron/milestone-alerts
Header: Authorization: Bearer <CRON_SECRET>

# Every 24 hours (optional cleanup)
GET https://your-domain.com/api/whatsapp/cron/cleanup-old-entries
Header: Authorization: Bearer <CRON_SECRET>
```

## Usage Examples

### Send a Task Reminder

```typescript
import { enqueueMessage } from '@/lib/whatsapp-queue'

await enqueueMessage({
  phoneNumber: '+16135551234',
  templateId: 'task-reminder',
  variables: {
    taskName: 'Board Approval',
    dueDate: 'Dec 15, 2:30 PM',
    priority: 'critical'
  },
  priority: 'urgent',
  userId: 'user-123',
  companyId: 'company-456',
  idempotencyKey: 'task-board-approval-20250515'
})
```

### Send Document Ready Alert

```typescript
import { sendDocumentReadyAlert } from '@/lib/whatsapp-scheduler'

await sendDocumentReadyAlert(
  'doc-789',
  'Audited Financial Statements',
  'Financial Document',
  'External Auditor',
  'user-123'
)
```

### Handle Document Upload Trigger

```typescript
// In your document upload handler
import { sendDocumentReadyAlert } from '@/lib/whatsapp-scheduler'

export async function handleDocumentApproval(documentId: string, approvedBy: string) {
  // ... your logic to mark document as approved ...

  const doc = await getDocument(documentId)
  await sendDocumentReadyAlert(
    documentId,
    doc.name,
    doc.type,
    approvedBy,
    doc.userId
  )
}
```

## Message Limits & Rate Limiting

### WhatsApp Limits
- **Message Length:** 1024 characters max (templates enforced)
- **Media:** Voice notes auto-transcribed via OpenAI Whisper
- **Delivery Time:** Typically 1-5 seconds

### Rate Limiting
- **Per Minute:** 20 messages max to avoid Twilio throttling
- **Per User:** 1 message per 5 minutes for same content (deduplication)
- **Retry Policy:** Exponential backoff, max 5 retries
- **Queue Cleanup:** Entries older than 30 days automatically deleted

## Monitoring & Debugging

### Check Message Statistics

```bash
# Via API (admin only)
curl https://your-domain.com/api/whatsapp/admin/stats \
  -H "Cookie: <auth_session>"
```

### Monitor Queue Status

```bash
# Check pending messages
SELECT COUNT(*) FROM whatsapp_queue WHERE status = 'pending'

# Check recent failures
SELECT id, error, created_at FROM whatsapp_logs
WHERE status = 'failed'
ORDER BY created_at DESC LIMIT 10
```

### Enable Debug Logging

The system logs to `console` with `[whatsapp-*]` prefixes:
- `[whatsapp-service]` — Send/receive operations
- `[whatsapp-queue]` — Queue processing
- `[whatsapp/webhook]` — Inbound message handling

## Troubleshooting

### "Twilio credentials not set"
- Verify `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` in environment
- System will queue messages but won't send them (test mode)

### "Phone number must be in E.164 format"
- Phone must start with `+` and have 7-15 digits
- Example: `+16135551234` (US/Canada) or `+441234567890` (UK)

### Messages not delivered
1. Check `whatsapp_logs` table for status
2. Verify user has opted in (`whatsapp_opted_in = TRUE`)
3. Confirm plan is Growth or Enterprise
4. Check Twilio console for API errors
5. Review queue status for pending messages

### High message volume queue
- Queue processing rate is 20 messages/minute
- Messages may take time during high volume
- Check `whatsapp_queue` for pending vs. processed counts
- Scale message sending across off-peak hours if possible

## Security Considerations

### Phone Number Privacy
- E.164 validation prevents injection attacks
- Phone numbers stored encrypted in database
- Access restricted to authenticated users

### Twilio Webhook Security
- All webhooks validated with HMAC-SHA1 signature
- Constant-time comparison prevents timing attacks
- Signature validation happens before processing

### Cron Job Security
- All cron endpoints secured with `CRON_SECRET`
- Must be passed in `Authorization: Bearer` header
- Rotate secret periodically

### Message Content
- Variables interpolated safely (no code execution)
- All templates validated under 1024 chars
- No PII in logs (phone numbers hashed in analytics)

## Future Enhancements

- [ ] Multi-language message templates (EN/FR support)
- [ ] Message scheduling (send at specific time)
- [ ] Rich media support (documents, images)
- [ ] Interactive buttons with callbacks
- [ ] Message templates in Twilio (higher deliverability)
- [ ] Analytics dashboard
- [ ] A/B testing different message variations
- [ ] Custom notification preferences per user
- [ ] SMS fallback for users without WhatsApp

## Support & Documentation

- **Twilio Docs:** https://www.twilio.com/docs/whatsapp
- **Message Template Validation:** `validateTemplateVariables()`
- **Status Codes:** See individual endpoint documentation

---

**Last Updated:** May 2025
**Version:** 1.0
**Status:** Production Ready
