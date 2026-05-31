# IPOReady Email Notification System

## Overview

The IPOReady email notification system provides a comprehensive infrastructure for sending transactional and operational emails to users. It includes:

- **Email Templates**: Pre-built, responsive HTML templates for various notification types
- **Email Service**: Core service for sending emails via Resend API
- **Email Queue**: In-memory queue for batching and processing emails efficiently
- **Email Logging**: Database logging of all email sends for tracking and debugging
- **Helper Functions**: High-level functions for common notification patterns
- **API Endpoints**: REST endpoints for triggering notifications

## Architecture

### Components

```
┌─────────────────────────────────────────┐
│  API Endpoints (app/api/email/*)        │
├─────────────────────────────────────────┤
│  High-level Helpers (email-notifications)│
├─────────────────────────────────────────┤
│  Email Service (email-service.ts)       │
│  - sendEmail()                          │
│  - sendEmailWithRetry()                 │
│  - logEmailToDB()                       │
├─────────────────────────────────────────┤
│  Email Queue (email-queue.ts)           │
│  - enqueue()                            │
│  - process()                            │
├─────────────────────────────────────────┤
│  Email Templates (email-templates.ts)   │
│  - renderEmailTemplate()                │
├─────────────────────────────────────────┤
│  Resend API (lib/resend.ts)             │
└─────────────────────────────────────────┘
```

## Email Templates

### Available Templates

1. **welcome** - Welcome email for new users
2. **password-reset** - Password reset instructions
3. **task-reminder** - Task due/overdue reminders
4. **notification-alert** - General alert notifications
5. **board-report** - Board-level reports
6. **weekly-summary** - Weekly progress summaries
7. **plan-upgrade** - Plan upgrade offers

### Template Usage

```typescript
import { renderEmailTemplate } from '@/lib/email-templates'

const { subject, html } = renderEmailTemplate('welcome', {
  name: 'John Doe',
  companyName: 'Acme Corp',
  exchange: 'NASDAQ',
  loginUrl: 'https://ipoready.com/login'
})
```

## Email Service

### Core Functions

#### `sendEmail(options)`
Send a single email immediately (no retry logic).

```typescript
import { sendEmail } from '@/lib/email-service'

const result = await sendEmail({
  to: 'user@example.com',
  templateId: 'welcome',
  variables: {
    name: 'John',
    companyName: 'Acme',
    exchange: 'NASDAQ',
    loginUrl: 'https://...'
  },
  userId: 'user-uuid', // optional
  companyId: 'company-uuid', // optional
  tags: ['welcome', 'onboarding'] // optional
})

if (result.success) {
  console.log('Email sent:', result.messageId)
} else {
  console.error('Failed:', result.error)
}
```

#### `sendEmailWithRetry(options, retryCount)`
Send email with exponential backoff retry (max 3 attempts).

```typescript
const result = await sendEmailWithRetry({
  to: 'user@example.com',
  templateId: 'task-reminder',
  variables: { ... }
})
```

### Helper Functions

Pre-configured helpers for common scenarios:

```typescript
// Welcome email
await sendWelcomeEmail(userId, {
  name: 'John Doe',
  email: 'john@example.com',
  companyName: 'Acme Corp',
  exchange: 'NASDAQ',
  loginUrl: 'https://...'
})

// Password reset
await sendPasswordResetEmail(userId, {
  name: 'John Doe',
  email: 'john@example.com',
  resetUrl: 'https://ipoready.com/reset?token=...',
  expiresInMinutes: 60
})

// Task reminder
await sendTaskReminderEmail(userId, {
  name: 'John Doe',
  email: 'john@example.com',
  companyName: 'Acme Corp',
  taskTitle: 'Complete audit',
  taskDescription: 'Finalize audit documentation',
  dueDate: 'May 30, 2026',
  dashboardUrl: 'https://...'
})

// Generic alert
await sendNotificationAlertEmail(userId, {
  name: 'John Doe',
  email: 'john@example.com',
  companyName: 'Acme Corp',
  notificationTitle: 'Document rejected',
  notificationMessage: 'Your audit report requires updates.',
  actionUrl: 'https://...',
  actionText: 'View document'
})

// Weekly summary
await sendWeeklySummaryEmail(userId, {
  name: 'John Doe',
  email: 'john@example.com',
  companyName: 'Acme Corp',
  tasksCompleted: 5,
  tasksOverdue: 2,
  paceScore: 72,
  dashboardUrl: 'https://...'
})

// Board report
await sendBoardReportEmail(userId, {
  name: 'Jane Smith',
  email: 'jane@example.com',
  companyName: 'Acme Corp',
  reportTitle: 'Q2 IPO Readiness Report',
  reportHighlights: [
    'Completed 45 tasks this week',
    'PACE™ score improved to 72',
    'All critical milestones on track'
  ],
  dashboardUrl: 'https://...'
})
```

### Email Logging

All emails are automatically logged to the database.

```typescript
import { getEmailLogs, wasEmailRecentlySent } from '@/lib/email-service'

// Get recent logs for an email
const logs = await getEmailLogs('user@example.com', 50)
logs.forEach(log => {
  console.log(`${log.template_id}: ${log.status} at ${log.sent_at}`)
})

// Check if recently sent (prevent duplicates)
const wasRecent = await wasEmailRecentlySent('user@example.com', 'welcome', 5)
if (wasRecent) {
  console.log('Email sent in last 5 minutes')
}
```

## Email Queue

The email queue batches and processes emails asynchronously every 10 seconds.

### Features

- Automatic batching (10 emails per batch)
- Duplicate prevention within 5-minute windows
- Exponential backoff for failures
- In-memory queue (clears on restart)
- Database persistence via logging

### Using the Queue

```typescript
import { enqueueEmail, getQueueSize, processQueue } from '@/lib/email-queue'

// Add email to queue
const queueId = enqueueEmail({
  to: 'user@example.com',
  templateId: 'task-reminder',
  variables: { ... }
})

// Check queue size
const size = getQueueSize()
console.log(`${size} emails waiting`)

// Force immediate processing
await processQueue()

// Get pending emails (for debugging)
import { getPendingEmails } from '@/lib/email-queue'
const pending = getPendingEmails()
pending.forEach(email => {
  console.log(`${email.templateId} to ${email.to}`)
})
```

## High-Level Notification Helpers

### Task Notifications

```typescript
import { notifyUserOfTask } from '@/lib/email-notifications'

// Notify user of a task
await notifyUserOfTask(userId, taskId, 'due_soon')
```

### Alert Notifications

```typescript
import { notifyUserOfAlert, notifyTeamOfAlert } from '@/lib/email-notifications'

// Single user
await notifyUserOfAlert(userId, 'Payment Due', 'Your invoice is due tomorrow')

// Entire team
await notifyTeamOfAlert(companyId, 'Important Update', 'Team meeting scheduled for Friday')
```

### Summary & Reports

```typescript
import { sendWeeklySummary, sendBoardReport } from '@/lib/email-notifications'

// Send weekly summary
await sendWeeklySummary(userId)

// Send board report
await sendBoardReport(userId, 'Q2 Readiness Report', [
  'Completed 45 tasks',
  'PACE™ score at 72'
])
```

### Batch Reminders

```typescript
import { sendTaskReminders } from '@/lib/email-notifications'

// Send task reminders to all users with due/overdue tasks
const { sent, failed } = await sendTaskReminders()
console.log(`Sent: ${sent}, Failed: ${failed}`)
```

## API Endpoints

### `/api/email/send`

Send an email immediately or queue it.

**POST**
```bash
curl -X POST http://localhost:3000/api/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "templateId": "welcome",
    "variables": {
      "name": "John",
      "companyName": "Acme"
    },
    "useQueue": false
  }'
```

**GET** - Health check
```bash
curl http://localhost:3000/api/email/send
# Returns: { status: "ok", queueSize: 5, pendingCount: 2 }
```

### `/api/email/task-notification`

Notify user of a task.

**POST**
```bash
curl -X POST http://localhost:3000/api/email/task-notification \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid",
    "taskId": "task-uuid",
    "notificationType": "due_soon"
  }'
```

**GET** - Trigger task reminders
```bash
curl "http://localhost:3000/api/email/task-notification?action=send-reminders"
# Returns: { success: true, sent: 15, failed: 0 }
```

### `/api/email/weekly-summary`

Send weekly summaries to users.

**POST**
```bash
curl -X POST http://localhost:3000/api/email/weekly-summary \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid"
  }'
```

**GET** - Send to all weekly subscribers
```bash
curl "http://localhost:3000/api/email/weekly-summary?action=send-all"
# Returns: { success: true, sent: 24, failed: 1 }
```

### `/api/email/board-report`

Send board reports.

**POST**
```bash
curl -X POST http://localhost:3000/api/email/board-report \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid",
    "reportTitle": "Q2 IPO Readiness",
    "reportHighlights": ["45 tasks completed", "PACE™ score: 72"]
  }'
```

### `/api/email/status`

Get email service status and logs.

**GET** - Overall status
```bash
curl http://localhost:3000/api/email/status
# Returns: { status: "ok", queue: { size: 5, pending: 2 } }
```

**GET** - Logs for specific email
```bash
curl "http://localhost:3000/api/email/status?email=user@example.com"
# Returns: { status: "ok", email: "user@example.com", logs: [...] }
```

## Integration Points

### User Registration

When a user registers, a welcome email is automatically sent:

```typescript
// src/app/api/auth/register/route.ts
await sendWelcomeEmail(userId, {
  name: userInput.name,
  email: userInput.email,
  companyName: userInput.companyName,
  exchange: userInput.targetExchange,
  loginUrl: `${APP_URL}/login`
})
```

### Password Reset

When user requests password reset:

```typescript
// src/app/api/auth/forgot-password/route.ts
await sendPasswordResetEmail(userId, {
  name: user.name,
  email: user.email,
  resetUrl: `${APP_URL}/reset-password?token=${token}`,
  expiresInMinutes: 60
})
```

### Task Management

When assigning or updating tasks, consider sending notifications:

```typescript
// In your task update endpoint
await notifyUserOfTask(assignedUserId, taskId, 'assigned')
```

### Scheduled Jobs

For periodic emails (weekly summaries, task reminders), use cron services to call:

- `/api/email/task-notification?action=send-reminders`
- `/api/email/weekly-summary?action=send-all`

## Database Schema

### `email_logs` Table

```sql
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email TEXT NOT NULL,
  template_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  resend_id TEXT,
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  retry_count INT DEFAULT 0,
  next_retry_at TIMESTAMPTZ
);

CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_to_email ON email_logs(to_email);
```

### `password_reset_tokens` Table

```sql
CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_password_reset_tokens_user ON password_reset_tokens(user_id);
```

## Configuration

### Environment Variables

```bash
# Required
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Optional
NEXTAUTH_URL=https://ipoready.com (used for email links)
```

### Email Service Config

Default configuration in `src/lib/email-types.ts`:

```typescript
{
  maxRetries: 3,
  retryDelays: [5000, 30000, 300000], // 5s, 30s, 5m
  batchSize: 10,
  processInterval: 10000 // 10 seconds
}
```

## Error Handling

### No RESEND_API_KEY

If `RESEND_API_KEY` is not set, emails are logged to console and database without sending:

```
[email-service] RESEND_API_KEY not configured. Email would be sent:
  To: user@example.com
  Subject: Welcome to IPOReady
  Template: welcome
```

### Failed Sends

Failed emails are logged with error messages and automatically retry:

```
[email-service] Failed to send email: welcome to user@example.com: Invalid API key
```

### Graceful Degradation

The system is designed to be resilient:
- Failed email sends don't block the main request
- Queued emails retry automatically
- All sends are logged for audit trail
- Missing RESEND_API_KEY doesn't crash the app

## Testing

### Local Testing

1. Ensure `RESEND_API_KEY` is NOT set or invalid
2. Trigger an email (register, password reset, etc.)
3. Check console for "[email-service]" logs
4. Query database: `SELECT * FROM email_logs;`

### Sending Test Email

```bash
curl -X POST http://localhost:3000/api/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "templateId": "welcome",
    "variables": {
      "name": "Test User",
      "companyName": "Test Corp",
      "exchange": "NASDAQ",
      "loginUrl": "http://localhost:3000/login"
    }
  }'
```

### Checking Queue

```bash
curl http://localhost:3000/api/email/status
```

### Checking Email Logs

```bash
curl "http://localhost:3000/api/email/status?email=test@example.com"
```

## Monitoring & Maintenance

### Key Metrics

- Queue size (should stay near 0)
- Failed email count (should be rare)
- Average send time (should be < 1s)
- Email delivery rate

### Common Issues

**Emails not sending:**
- Check `RESEND_API_KEY` in `.env.local`
- Check email_logs table for errors
- Verify recipient email is valid

**High queue size:**
- Check server logs for errors
- Verify Resend API is responsive
- Restart service to clear in-memory queue

**Duplicate emails:**
- Check if email was recently sent
- Verify queue deduplication is working
- Check email_logs for multiple sends

## Security Considerations

1. **API Key**: Keep `RESEND_API_KEY` in `.env.local`, never commit
2. **Sensitive Data**: Don't include passwords or API keys in emails
3. **Rate Limiting**: Consider adding rate limits to email endpoints in production
4. **Validation**: All email addresses are validated before sending
5. **Logging**: Email logs are stored in database for audit trail

## Performance

- **Batch Processing**: Queue processes 10 emails every 10 seconds
- **Parallel Sends**: Multiple emails sent in parallel within batch
- **Database Queries**: Indexed on status, email for fast lookups
- **Memory**: In-memory queue cleared on each batch process
- **Retry Logic**: Exponential backoff reduces server load

## Future Enhancements

- [ ] Email template versioning
- [ ] Advanced bounce/complaint handling
- [ ] A/B testing support
- [ ] Delivery status webhooks from Resend
- [ ] Multi-language template variants
- [ ] User preference for email frequency
- [ ] Email preview/debug endpoint
- [ ] Email analytics dashboard
