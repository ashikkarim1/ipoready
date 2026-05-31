# Email System - Quick Reference

## File Structure

```
src/
├── lib/
│   ├── email-templates.ts      # 429 lines - Email templates (React + HTML)
│   ├── email-service.ts        # 393 lines - Core send service with retries
│   ├── email-queue.ts          # 250 lines - Batch queue processor
│   ├── email-notifications.ts  # 317 lines - High-level helpers
│   ├── email-types.ts          # 83 lines  - TypeScript types
│   └── resend.ts               # (existing) - Resend API wrapper
│
└── app/api/email/
    ├── send/route.ts           # Generic email endpoint
    ├── task-notification/route.ts
    ├── weekly-summary/route.ts
    ├── board-report/route.ts
    └── status/route.ts
```

## Usage Examples

### Send Welcome Email
```typescript
import { sendWelcomeEmail } from '@/lib/email-service'

await sendWelcomeEmail(userId, {
  name: 'John Doe',
  email: 'john@example.com',
  companyName: 'Acme Corp',
  exchange: 'NASDAQ',
  loginUrl: 'https://...'
})
```

### Send Password Reset
```typescript
import { sendPasswordResetEmail } from '@/lib/email-service'

await sendPasswordResetEmail(userId, {
  name: 'John Doe',
  email: 'john@example.com',
  resetUrl: 'https://app.com/reset?token=...',
  expiresInMinutes: 60
})
```

### Notify User of Task
```typescript
import { notifyUserOfTask } from '@/lib/email-notifications'

await notifyUserOfTask(userId, taskId, 'due_soon')
```

### Send Generic Alert to Team
```typescript
import { notifyTeamOfAlert } from '@/lib/email-notifications'

await notifyTeamOfAlert(
  companyId,
  'Board Meeting Scheduled',
  'All team leads: Board meeting on Friday at 2 PM EST'
)
```

### Queue Email (Fire & Forget)
```typescript
import { enqueueEmail } from '@/lib/email-queue'

enqueueEmail({
  to: 'user@example.com',
  templateId: 'task-reminder',
  variables: { ... }
})
```

## API Endpoints

### POST /api/email/send
Send email immediately or queue it.

**Request:**
```json
{
  "to": "user@example.com",
  "templateId": "welcome",
  "variables": { "name": "John", ... },
  "useQueue": false
}
```

**Response (Success):**
```json
{
  "success": true,
  "messageId": "message-id-from-resend"
}
```

### GET /api/email/send
Health check.

**Response:**
```json
{
  "status": "ok",
  "queueSize": 5,
  "pendingCount": 2
}
```

### POST /api/email/task-notification
Notify user of task.

**Request:**
```json
{
  "userId": "uuid",
  "taskId": "uuid",
  "notificationType": "due_soon"
}
```

### GET /api/email/task-notification?action=send-reminders
Send reminders to all users with due tasks.

### POST /api/email/weekly-summary
Send weekly summary to user.

**Request:**
```json
{
  "userId": "uuid"
}
```

### GET /api/email/weekly-summary?action=send-all
Send to all users with weekly frequency.

### POST /api/email/board-report
Send board report.

**Request:**
```json
{
  "userId": "uuid",
  "reportTitle": "Q2 Report",
  "reportHighlights": ["45 tasks done", "PACE: 72"],
  "sendToTeam": false
}
```

### GET /api/email/status
Service status.

### GET /api/email/status?email=user@example.com
Get email logs.

## Email Templates

| Template | Type | Use Case |
|----------|------|----------|
| welcome | React | New user onboarding |
| password-reset | React | Password recovery |
| task-reminder | HTML | Task due/overdue |
| notification-alert | HTML | General alerts |
| weekly-summary | HTML | Weekly report |
| board-report | HTML | Board report |
| plan-upgrade | React | Plan upgrade offer |

## Database Tables

### email_logs
```sql
id              UUID (PK)
to_email        TEXT
template_id     TEXT
subject         TEXT
status          TEXT (pending|sent|failed|retrying)
resend_id       TEXT
error_message   TEXT
sent_at         TIMESTAMPTZ
created_at      TIMESTAMPTZ (DEFAULT NOW())
retry_count     INT (DEFAULT 0)
next_retry_at   TIMESTAMPTZ
```

### password_reset_tokens
```sql
id              UUID (PK)
user_id         UUID (FK)
token           TEXT (UNIQUE)
expires_at      TIMESTAMPTZ
used_at         TIMESTAMPTZ
created_at      TIMESTAMPTZ (DEFAULT NOW())
```

## Configuration

### Environment Variables
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
NEXTAUTH_URL=http://localhost:3800
DATABASE_URL=postgresql://...
```

### Queue Settings (in email-queue.ts)
- Process interval: 10 seconds
- Batch size: 10 emails
- Duplicate window: 5 minutes
- Max retries: 3

### Retry Delays
1. 5 seconds
2. 30 seconds
3. 5 minutes

## Integration Points (Already Done)

✅ User registration → Welcome email
✅ Forgot password → Reset email

## Integration Points (Ready to Use)

🔧 Task assignment → `notifyUserOfTask()`
🔧 Team alerts → `notifyTeamOfAlert()`
🔧 Weekly summary → `sendWeeklySummary()`
🔧 Board reports → `sendBoardReport()`

## Common Patterns

### Async with error handling
```typescript
const result = await sendWelcomeEmail(userId, {...})
if (!result.success) {
  console.error('Email failed:', result.error)
}
```

### Fire and forget (logs errors)
```typescript
sendWelcomeEmail(userId, {...})
  .catch(err => console.error('[email] failed:', err))
```

### Queue for later processing
```typescript
enqueueEmail({
  to: email,
  templateId: 'task-reminder',
  variables: {...}
})
```

### Check status
```typescript
const size = getQueueSize()
const pending = getPendingEmails()
```

## Testing

### Test without Resend API Key
1. Don't set `RESEND_API_KEY` in `.env.local`
2. Emails log to console
3. Database logs created
4. Perfect for local development

### Test with Resend
1. Set valid `RESEND_API_KEY`
2. Emails actually sent
3. All logs tracked
4. Check email inbox

### Manual API Test
```bash
curl -X POST http://localhost:3000/api/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "templateId": "welcome",
    "variables": {
      "name": "Test",
      "companyName": "Test",
      "exchange": "NASDAQ",
      "loginUrl": "http://localhost:3000/login"
    }
  }'
```

## Monitoring

### Queue size
```bash
curl http://localhost:3000/api/email/send
```

### User logs
```bash
curl "http://localhost:3000/api/email/status?email=user@example.com"
```

### Database logs
```sql
SELECT * FROM email_logs ORDER BY created_at DESC LIMIT 20;
```

## Deployment Notes

- ✅ No secrets in code
- ✅ Graceful degradation without API key
- ✅ All sends logged to database
- ✅ In-memory queue (cleared on restart)
- ⚠️ Consider Redis for queue persistence in production
- ⚠️ Add API key validation to scheduled endpoints
- ⚠️ Set up monitoring/alerting for failed emails

## Next Steps

1. **Set up cron jobs** for scheduled emails
2. **Add rate limiting** to API endpoints
3. **Monitor email logs** for failures
4. **Test templates** with production data
5. **Set up email webhooks** from Resend
6. **Create dashboard** for email analytics

## Support Files

- Full documentation: `docs/EMAIL_SYSTEM.md`
- Integration guide: `docs/EMAIL_INTEGRATION_GUIDE.md`
- Quick reference: `docs/EMAIL_QUICK_REFERENCE.md` (this file)
