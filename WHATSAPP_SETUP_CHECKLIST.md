# WhatsApp Notification System - Setup Checklist

Complete this checklist to deploy the WhatsApp messaging system to production.

## Phase 1: Database Setup

- [ ] Run migration: `migrations/001_add_whatsapp_tables.sql`
  ```bash
  npm run db:migrate
  ```
  - Creates `whatsapp_logs` table
  - Creates `whatsapp_queue` table
  - Creates `user_phone_numbers` table
  - Adds columns to `users` table (`phone_number`, `whatsapp_opted_in`)

- [ ] Verify tables created:
  ```sql
  SELECT * FROM information_schema.tables 
  WHERE table_name LIKE 'whatsapp%'
  ```

## Phase 2: Environment Configuration

- [ ] Add to `.env.local`:
  ```
  TWILIO_ACCOUNT_SID=your_account_sid_here
  TWILIO_AUTH_TOKEN=your_auth_token_here
  TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
  CRON_SECRET=generate_random_secret_here
  ```

- [ ] Generate a random `CRON_SECRET`:
  ```bash
  openssl rand -base64 32
  ```

- [ ] Get Twilio credentials:
  1. Go to https://console.twilio.com
  2. Find Account SID (Account section)
  3. Find Auth Token (Account section)
  4. Note your WhatsApp Sandbox phone number (should be +14155238886)

- [ ] Verify environment variables loaded:
  ```bash
  npm run dev
  # Check console for "[whatsapp-service]" logs
  ```

## Phase 3: Twilio Webhook Configuration

- [ ] Configure Twilio WhatsApp Webhook:
  1. Go to https://console.twilio.com/messaging/whatsapp/learn
  2. Click "Sandbox Settings"
  3. Update "When a message comes in" webhook:
     - **URL:** `https://your-domain.com/api/whatsapp/webhook`
     - **Method:** POST
  4. Save changes

- [ ] Test webhook locally (ngrok):
  ```bash
  ngrok http 3000
  # Update Twilio webhook URL to https://your-ngrok-url.com/api/whatsapp/webhook
  ```

- [ ] Verify webhook works:
  1. Go to Twilio sandbox
  2. Send test message from your WhatsApp
  3. Check server logs for webhook receipt
  4. Message should be processed by AI Companion

## Phase 4: API Endpoints Verification

- [ ] Test POST /api/whatsapp/send
  ```bash
  curl -X POST https://your-domain.com/api/whatsapp/send \
    -H "Content-Type: application/json" \
    -H "Cookie: <your_auth_session>" \
    -d '{
      "phoneNumber": "+16135551234",
      "templateId": "task-reminder",
      "variables": {
        "taskName": "Test Task",
        "dueDate": "Tomorrow 9am",
        "priority": "high"
      }
    }'
  ```

- [ ] Test GET /api/whatsapp/preferences
  ```bash
  curl https://your-domain.com/api/whatsapp/preferences \
    -H "Cookie: <your_auth_session>"
  ```

- [ ] Test POST /api/whatsapp/preferences (opt-in)
  ```bash
  curl -X POST https://your-domain.com/api/whatsapp/preferences \
    -H "Content-Type: application/json" \
    -H "Cookie: <your_auth_session>" \
    -d '{"phoneNumber": "+16135551234"}'
  ```

- [ ] Test DELETE /api/whatsapp/preferences (opt-out)
  ```bash
  curl -X DELETE https://your-domain.com/api/whatsapp/preferences \
    -H "Cookie: <your_auth_session>"
  ```

- [ ] Test GET /api/whatsapp/status/:messageId
  ```bash
  curl https://your-domain.com/api/whatsapp/status/msg-123 \
    -H "Cookie: <your_auth_session>"
  ```

## Phase 5: Cron Job Setup

Choose your cron service (Vercel, AWS EventBridge, external service, etc.)

### Option A: Vercel Cron (Recommended for Vercel deployments)

- [ ] Create `src/app/api/whatsapp/cron/handler/route.ts`:
  ```typescript
  export const runtime = 'nodejs'
  export async function GET() {
    // Cron endpoints are called automatically by Vercel
    // This is just a placeholder
    return new Response('OK')
  }
  ```

- [ ] Configure `vercel.json`:
  ```json
  {
    "crons": [
      {
        "path": "/api/whatsapp/process-queue",
        "schedule": "*/5 * * * *",
        "cron": "0 */5 * * * *"
      },
      {
        "path": "/api/whatsapp/cron/task-reminders",
        "schedule": "0 9 * * *",
        "cron": "0 9 * * *"
      },
      {
        "path": "/api/whatsapp/cron/milestone-alerts",
        "schedule": "0 * * * *",
        "cron": "0 * * * *"
      }
    ]
  }
  ```

### Option B: External Cron Service (e.g., EasyCron, AWS EventBridge)

- [ ] Queue Processing (every 5 seconds):
  ```bash
  GET https://your-domain.com/api/whatsapp/process-queue
  Header: Authorization: Bearer <CRON_SECRET>
  Schedule: Every 5 seconds
  ```

- [ ] Task Reminders (daily at 9am):
  ```bash
  GET https://your-domain.com/api/whatsapp/cron/task-reminders
  Header: Authorization: Bearer <CRON_SECRET>
  Schedule: 0 9 * * *
  ```

- [ ] Milestone Alerts (hourly):
  ```bash
  GET https://your-domain.com/api/whatsapp/cron/milestone-alerts
  Header: Authorization: Bearer <CRON_SECRET>
  Schedule: 0 * * * *
  ```

- [ ] Test cron endpoints manually:
  ```bash
  curl "https://your-domain.com/api/whatsapp/process-queue" \
    -H "Authorization: Bearer your_cron_secret_here"
  ```

## Phase 6: Template Testing

- [ ] Test all message templates:
  ```typescript
  import { renderWhatsAppMessage } from '@/lib/whatsapp-templates'
  
  // Test each template
  const msg1 = renderWhatsAppMessage('task-reminder', {
    taskName: 'Test Task',
    dueDate: 'Tomorrow 9am',
    priority: 'high'
  })
  console.log(msg1) // Should be < 1024 chars
  
  // ... test all other templates
  ```

- [ ] Verify character counts:
  - All templates should be under 1024 characters
  - Check in browser console or logs

## Phase 7: Queue System Testing

- [ ] Test message enqueuing:
  ```typescript
  import { enqueueMessage, getQueueStats } from '@/lib/whatsapp-queue'
  
  const id = await enqueueMessage({
    phoneNumber: '+16135551234',
    templateId: 'task-reminder',
    variables: { taskName: 'Test', dueDate: 'Today', priority: 'high' },
    priority: 'regular'
  })
  
  const stats = await getQueueStats()
  console.log(stats) // Should show pending message
  ```

- [ ] Trigger queue processing:
  ```bash
  curl "https://your-domain.com/api/whatsapp/process-queue" \
    -H "Authorization: Bearer your_cron_secret_here"
  ```

- [ ] Verify message was sent:
  1. Check `whatsapp_logs` table for new entries
  2. Confirm status is 'sent' or 'queued'
  3. Verify delivery receipt appears (status → 'delivered')

## Phase 8: Monitoring & Alerts Setup

- [ ] Setup admin stats endpoint access:
  ```bash
  curl "https://your-domain.com/api/whatsapp/admin/stats" \
    -H "Cookie: <admin_auth_session>"
  ```

- [ ] Create admin dashboard panel to show:
  - Messages sent today
  - Failed messages
  - Queue status
  - Delivery rates by template

- [ ] Setup alerts for:
  - Queue backlog > 100 messages
  - Message failure rate > 5%
  - Failed cron job executions
  - Twilio API errors

## Phase 9: Documentation & Training

- [ ] Review `docs/WHATSAPP_SYSTEM.md`
  - Full architecture documentation
  - All API endpoints
  - Database schema
  - Troubleshooting guide

- [ ] Review integration examples:
  - `src/lib/whatsapp-integration-examples.ts`
  - Shows when/how to send notifications
  - Copy patterns into your code

- [ ] Train team on:
  - How to opt users in/out
  - Message status tracking
  - Troubleshooting failed messages
  - Rate limits and constraints

## Phase 10: Integration Into Application

- [ ] Import integration functions into relevant handlers:
  ```typescript
  // In document approval handler
  import { sendDocumentReadyAlert } from '@/lib/whatsapp-scheduler'
  
  // In task creation handler
  import { enqueueMessage } from '@/lib/whatsapp-queue'
  
  // In milestone completion handler
  import { enqueueMessage } from '@/lib/whatsapp-queue'
  ```

- [ ] Add WhatsApp opt-in UI to account settings:
  - Phone number input (E.164 format)
  - Opt-in/opt-out toggle
  - Call `GET /api/whatsapp/preferences`
  - Call `POST /api/whatsapp/preferences` to opt in
  - Call `DELETE /api/whatsapp/preferences` to opt out

- [ ] Add WhatsApp message history to activity feed:
  - Show recent messages user received
  - Show delivery status
  - Allow manual resends (admin only)

## Phase 11: Production Deployment

- [ ] Deploy to production:
  ```bash
  npm run build
  npm run start
  ```

- [ ] Verify all environment variables set in production:
  - Check each required var is present
  - Use `console.log` to verify (remove before committing)

- [ ] Test all cron jobs fire correctly:
  - Monitor logs for the next hour
  - Verify /api/whatsapp/process-queue runs every 5 seconds
  - Verify task reminders sent at 9am
  - Verify milestone alerts run hourly

- [ ] Monitor first 24 hours:
  - Check message delivery rates
  - Monitor error logs
  - Verify Twilio quota not exceeded
  - Confirm receipts updating correctly

## Phase 12: Post-Launch Monitoring

- [ ] Daily checks:
  - [ ] Queue backlog is < 50 messages
  - [ ] Failed messages < 2%
  - [ ] Cron jobs running on schedule
  - [ ] No Twilio API errors

- [ ] Weekly reviews:
  - [ ] Message statistics (total sent, delivered)
  - [ ] Most used templates
  - [ ] User opt-in rates
  - [ ] Failure trend analysis

- [ ] Monthly optimization:
  - [ ] Review failed messages for patterns
  - [ ] Adjust message content if needed
  - [ ] Check rate limiting isn't hitting limits
  - [ ] Update documentation with learnings

## Troubleshooting Checklist

If something isn't working:

- [ ] Check all environment variables are set correctly
- [ ] Verify Twilio credentials are valid
- [ ] Check `whatsapp_logs` table for errors
- [ ] Review cron job logs for failures
- [ ] Verify users are opted in (`whatsapp_opted_in = TRUE`)
- [ ] Confirm users have correct plan (growth/enterprise)
- [ ] Check phone numbers are valid E.164 format
- [ ] Verify CRON_SECRET is correct in requests
- [ ] Look for rate limiting (20 messages/minute)
- [ ] Check Twilio console for API errors

## Rollback Plan

If critical issues arise:

1. **Disable cron jobs:**
   - Pause queue processing
   - Pause task reminders
   - Pause milestone alerts

2. **Stop sending messages:**
   - Set environment variable: `TWILIO_ACCOUNT_SID=` (empty)
   - Messages will be queued but not sent

3. **Scale back gradually:**
   - Send to small user group first
   - Monitor success rate
   - Expand to all users

4. **Debug:**
   - Check logs for errors
   - Review recent changes
   - Test with sandbox number first

---

## Final Sign-Off

- [ ] All tests pass
- [ ] All endpoints working
- [ ] Cron jobs firing
- [ ] Messages delivering
- [ ] Admin can view stats
- [ ] Users can opt in/out
- [ ] Documentation complete
- [ ] Team trained
- [ ] Ready for production

**Deployed by:** ________________  
**Date:** ________________  
**Verified by:** ________________  
