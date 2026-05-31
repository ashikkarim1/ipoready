# WhatsApp System - Quick Start Guide

**⚡ Get up and running in 5 minutes**

## 1. Database Setup (1 min)

```bash
# Run migration
npm run db:migrate migrations/001_add_whatsapp_tables.sql

# Verify (in Neon console)
SELECT COUNT(*) FROM whatsapp_logs;
SELECT COUNT(*) FROM whatsapp_queue;
```

## 2. Environment Variables (2 min)

```bash
# Add to .env.local
TWILIO_ACCOUNT_SID=your_sid_from_twilio_console
TWILIO_AUTH_TOKEN=your_token_from_twilio_console
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# Generate random secret
CRON_SECRET=$(openssl rand -base64 32)
```

## 3. Twilio Webhook (1 min)

1. Go to https://console.twilio.com/messaging/whatsapp/learn
2. Click "Sandbox Settings"
3. Set webhook URL: `https://your-domain.com/api/whatsapp/webhook`
4. Save

## 4. Cron Jobs (1 min)

Configure in your cron service (Vercel, AWS EventBridge, etc.):

```
GET /api/whatsapp/process-queue
  Header: Authorization: Bearer <CRON_SECRET>
  Schedule: Every 5 seconds

GET /api/whatsapp/cron/task-reminders
  Header: Authorization: Bearer <CRON_SECRET>
  Schedule: 0 9 * * * (daily 9am)

GET /api/whatsapp/cron/milestone-alerts
  Header: Authorization: Bearer <CRON_SECRET>
  Schedule: 0 * * * * (hourly)
```

## 5. Test It (5 min)

```bash
# 1. Opt-in user to WhatsApp
curl -X POST https://your-domain.com/api/whatsapp/preferences \
  -H "Content-Type: application/json" \
  -H "Cookie: <your-session>" \
  -d '{"phoneNumber": "+16135551234"}'

# 2. Send test message
curl -X POST https://your-domain.com/api/whatsapp/send \
  -H "Content-Type: application/json" \
  -H "Cookie: <your-session>" \
  -d '{
    "phoneNumber": "+16135551234",
    "templateId": "task-reminder",
    "variables": {
      "taskName": "Test Task",
      "dueDate": "Tomorrow",
      "priority": "high"
    }
  }'

# 3. Check message status
curl https://your-domain.com/api/whatsapp/status/<message-id> \
  -H "Cookie: <your-session>"

# 4. View stats
curl https://your-domain.com/api/whatsapp/admin/stats \
  -H "Cookie: <admin-session>"
```

---

## Core Functions

### Send a Message

```typescript
import { sendWhatsAppMessage } from '@/lib/whatsapp-service'

await sendWhatsAppMessage({
  phoneNumber: '+16135551234',
  templateId: 'task-reminder',
  variables: {
    taskName: 'Complete DD Review',
    dueDate: 'Dec 15, 2:30 PM',
    priority: 'critical'
  },
  userId: 'user-123',
  companyId: 'company-456'
})
```

### Queue a Message (with retry logic)

```typescript
import { enqueueMessage } from '@/lib/whatsapp-queue'

await enqueueMessage({
  phoneNumber: '+16135551234',
  templateId: 'task-reminder',
  variables: { taskName: 'Test', dueDate: 'Today', priority: 'high' },
  priority: 'urgent', // or 'regular'
  userId: 'user-123',
  companyId: 'company-456'
})
```

### Send Task Reminders

```typescript
import { sendTaskReminders } from '@/lib/whatsapp-scheduler'

const { sent, failed } = await sendTaskReminders()
console.log(`Sent: ${sent}, Failed: ${failed}`)
```

### Send Document Alert

```typescript
import { sendDocumentReadyAlert } from '@/lib/whatsapp-scheduler'

await sendDocumentReadyAlert(
  'doc-123',
  'Financial Statements',
  'Financial',
  'CFO Name',
  'user-123'
)
```

### Check Message Status

```typescript
import { getMessageStatus } from '@/lib/whatsapp-service'

const status = await getMessageStatus('msg-123')
console.log(status.status) // 'delivered', 'sent', 'failed', etc.
```

---

## Message Templates

```
task-reminder        → Task due date reminders
milestone-alert      → Milestone progress updates
daily-pulse          → Morning briefing (9am)
document-ready       → Document approvals
board-report-ready   → Board reports ready
account-alert        → Billing/compliance issues
```

Each template < 1024 chars, variable interpolation, action buttons.

---

## API Endpoints

### User Endpoints (require session)
```
POST   /api/whatsapp/send                    → Send message
GET    /api/whatsapp/preferences             → Get settings
POST   /api/whatsapp/preferences             → Opt in
DELETE /api/whatsapp/preferences             → Opt out
GET    /api/whatsapp/status/:messageId       → Check status
```

### Cron Endpoints (require CRON_SECRET)
```
GET /api/whatsapp/process-queue              → Process queue
GET /api/whatsapp/cron/task-reminders        → Send reminders
GET /api/whatsapp/cron/milestone-alerts      → Send alerts
```

### Admin Endpoints (admin only)
```
GET /api/whatsapp/admin/stats                → View statistics
```

### Webhook (Twilio)
```
POST /api/whatsapp/webhook                   → Inbound/receipts
```

---

## Database Tables

```sql
whatsapp_logs      → All sent messages (with status)
whatsapp_queue     → Pending/retry messages
user_phone_numbers → Phone number tracking
```

View messages:
```sql
SELECT * FROM whatsapp_logs WHERE status = 'delivered' ORDER BY sent_at DESC;
SELECT * FROM whatsapp_queue WHERE status = 'pending';
```

---

## Rate Limits

- **Per minute:** 20 messages max (Twilio limit)
- **Per number:** 1 message per 5 minutes (deduplication)
- **Retry:** Max 5 attempts with exponential backoff
- **Message size:** 1024 characters max
- **Queue retention:** 30 days

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Messages not sending | Check TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN |
| Messages queued, not sent | Check queue size, verify cron jobs running |
| Invalid phone format | Use E.164: +16135551234 (+ followed by 7-15 digits) |
| 401 Unauthorized | Check CRON_SECRET in header, verify session cookie |
| Messages not delivered | Check user opted in, plan is growth/enterprise |
| Webhook not firing | Verify URL in Twilio console, check signature |

---

## Integration Checklist

- [ ] User opts in via `/api/whatsapp/preferences`
- [ ] Task created → `enqueueMessage()` with task details
- [ ] Document approved → `sendDocumentReadyAlert()`
- [ ] Milestone updated → `enqueueMessage()` with progress
- [ ] Billing issue → `sendAccountAlert()`
- [ ] Admin views stats → `/api/whatsapp/admin/stats`
- [ ] Cron jobs running every 5s, hourly, daily
- [ ] Messages showing in user's WhatsApp

---

## File Structure

```
src/lib/
  ├── whatsapp-templates.ts      (6 templates, validation)
  ├── whatsapp-service.ts         (Twilio integration, DB)
  ├── whatsapp-queue.ts           (Priority queue, retry)
  ├── whatsapp-scheduler.ts       (Scheduled notifications)
  └── whatsapp-integration-examples.ts (Copy-paste patterns)

src/app/api/whatsapp/
  ├── send/route.ts              (POST send message)
  ├── preferences/route.ts        (GET/POST/DELETE settings)
  ├── status/[messageId]/route.ts (GET message status)
  ├── webhook/route.ts            (POST inbound/receipts)
  ├── process-queue/route.ts      (GET process queue)
  ├── cron/
  │   ├── task-reminders/route.ts (GET send reminders)
  │   └── milestone-alerts/route.ts (GET send alerts)
  └── admin/stats/route.ts        (GET statistics)

migrations/
  └── 001_add_whatsapp_tables.sql (Database schema)

docs/
  └── WHATSAPP_SYSTEM.md          (Full documentation)
```

---

## Next: Integration

Once setup is complete, integrate into your application:

1. **Account Settings Page**
   - Add WhatsApp opt-in form
   - Call `POST /api/whatsapp/preferences` to opt in

2. **Task/Document Handlers**
   - Import `enqueueMessage` or `sendDocumentReadyAlert`
   - Call when events occur
   - See `whatsapp-integration-examples.ts` for patterns

3. **Admin Dashboard**
   - Add WhatsApp stats widget
   - Call `GET /api/whatsapp/admin/stats`
   - Show delivery rates, recent failures

4. **Activity Timeline**
   - Show user their WhatsApp messages
   - Display delivery status
   - Allow manual resends (admin only)

---

## Support Resources

- **Full docs:** `docs/WHATSAPP_SYSTEM.md`
- **Setup steps:** `WHATSAPP_SETUP_CHECKLIST.md`
- **Examples:** `src/lib/whatsapp-integration-examples.ts`
- **Build summary:** `WHATSAPP_BUILD_SUMMARY.md`

---

**Questions?** Check the full documentation or setup guide.  
**Ready to deploy?** Follow the setup checklist.  
**Need examples?** See whatsapp-integration-examples.ts.
