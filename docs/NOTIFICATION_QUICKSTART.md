# Notification Preferences System - Quick Start Guide

## 5-Minute Setup

### Step 1: Create Database Tables (2 minutes)

Run these SQL commands in your Neon console:

```sql
-- Create notification_preferences table
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  notification_type VARCHAR(50) NOT NULL,
  email_enabled BOOLEAN DEFAULT TRUE,
  sms_enabled BOOLEAN DEFAULT FALSE,
  push_enabled BOOLEAN DEFAULT TRUE,
  whatsapp_enabled BOOLEAN DEFAULT FALSE,
  frequency VARCHAR(20) DEFAULT 'real_time',
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  quiet_hours_timezone VARCHAR(50),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, notification_type)
);

CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);

-- Create notification_settings table
CREATE TABLE notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  digest_time VARCHAR(5) DEFAULT '09:00',
  digest_timezone VARCHAR(50) DEFAULT 'America/Toronto',
  do_not_disturb_start VARCHAR(5) DEFAULT '22:00',
  do_not_disturb_end VARCHAR(5) DEFAULT '08:00',
  do_not_disturb_timezone VARCHAR(50) DEFAULT 'America/Toronto',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notification_settings_user_id ON notification_settings(user_id);
```

### Step 2: Update Account Page (2 minutes)

Edit `src/app/account/page.tsx`:

Find the Notifications tab section and add this modal:

```typescript
import { PreferencesModal } from '@/components/NotificationPreferences'

// Inside the component:
const [preferencesOpen, setPreferencesOpen] = useState(false)

// In the JSX, add this button in the Notifications tab:
{activeTab === 'Notifications' && (
  <button 
    onClick={() => setPreferencesOpen(true)}
    className="px-6 py-3 rounded-lg font-medium text-white"
    style={{ background: '#1A1A1A' }}
  >
    Advanced Notification Settings
  </button>
)}

// Add the modal component at the end:
<PreferencesModal
  isOpen={preferencesOpen}
  onClose={() => setPreferencesOpen(false)}
  userId={session?.user?.id}
/>
```

### Step 3: Test It! (1 minute)

1. Start dev server: `npm run dev`
2. Navigate to `/account`
3. Click "Notifications" tab
4. Click "Advanced Notification Settings"
5. Try toggling channels and changing settings
6. Verify changes save

## Using in Your Services

### Email Service Example

```typescript
import { shouldSendNotification } from '@/lib/preferences'
import { NotificationType, NotificationChannel } from '@/lib/notification-types'

async function sendNotification(userId: string, taskId: string) {
  // Check if user wants this notification
  const result = await shouldSendNotification(
    userId,
    NotificationType.TASK_DUE,
    NotificationChannel.EMAIL
  )

  if (!result.allowed) {
    console.log('Notification blocked:', result.reason)
    if (result.shouldDigest) {
      // Queue for digest email instead
      await queueForDigest(userId, notification)
    }
    return
  }

  // Send email
  await sendEmail(userId, notification)
}
```

### WhatsApp Service Example

```typescript
import { shouldSendNotification } from '@/lib/preferences'
import { NotificationType, NotificationChannel } from '@/lib/notification-types'

async function sendWhatsAppAlert(userId: string) {
  const result = await shouldSendNotification(
    userId,
    NotificationType.TASK_OVERDUE,
    NotificationChannel.WHATSAPP
  )

  if (!result.allowed) {
    return
  }

  // Send WhatsApp message
  await twilio.messages.create({
    to: user.phone,
    from: 'whatsapp:+...',
    body: 'Your task is overdue!'
  })
}
```

## What's Available?

### 20 Notification Types

**Tasks**
- `task_due` - Task due soon
- `task_overdue` - Task is overdue
- `task_completed` - Task completed by teammate

**Documents**
- `document_shared` - Document shared
- `document_version_ready` - New version
- `document_verified` - Passed review
- `document_rejected` - Needs changes

**Progress**
- `milestone_achieved` - Milestone reached
- `phase_progressed` - Phase advanced
- `pace_score_changes` - PACE score drops

**Team**
- `team_member_joined` - New member
- `comment_mention` - Mentioned

**Business**
- `cap_table_updated` - Cap table changed
- `board_report_ready` - Report ready
- `regulatory_deadline` - Filing deadline
- `sedi_filing_due` - SEDI filing due

**System**
- `system_alert` - System update
- `account_warning` - Account issue
- `subscription_renewal_warning` - Subscription renews
- `new_expert_inquiry_response` - Expert response

### 4 Channels

- **Email** - Via Resend
- **SMS** - Via Twilio
- **Push** - Browser notifications
- **WhatsApp** - Via Twilio

### 4 Frequencies

- **Real-time** - Send immediately (unless in quiet hours)
- **Daily Digest** - Send with morning digest
- **Weekly** - Send weekly digest
- **Never** - Disable this notification type

## API Endpoints

All endpoints require authentication.

### Get All Preferences
```
GET /api/notifications/preferences
```

### Get Single Notification Type
```
GET /api/notifications/preferences/task_due
```

### Update Single Notification Type
```
PUT /api/notifications/preferences/task_due
Body: {
  "emailEnabled": false,
  "frequency": "daily_digest"
}
```

### Update Multiple at Once
```
POST /api/notifications/preferences
Body: {
  "preferences": [
    {
      "notificationType": "task_due",
      "emailEnabled": true,
      "smsEnabled": false,
      "pushEnabled": true,
      "whatsappEnabled": false,
      "frequency": "real_time"
    }
  ],
  "settings": {
    "digestTime": "09:00",
    "digestTimezone": "America/Toronto"
  }
}
```

### Set Digest Time
```
POST /api/notifications/digest-time
Body: {
  "digestTime": "08:00",
  "digestTimezone": "America/New_York"
}
```

## Default Settings

Every user starts with:

**Channels Enabled:**
- Email: Yes (for most types)
- Push: Yes (for most types)
- SMS: No (only for critical)
- WhatsApp: No (only for critical)

**Frequency:** Real-time (except board_report, cap_table, pace_score = daily digest)

**Quiet Hours:** 22:00 - 08:00 America/Toronto

**Digest Time:** 09:00 America/Toronto

## Customization

### Add New Notification Type

1. Add to `NotificationType` enum in `src/lib/notification-types.ts`:
```typescript
export enum NotificationType {
  // ... existing
  NEW_TYPE = 'new_type',
}
```

2. Add default config in `DEFAULT_PREFERENCES`:
```typescript
[NotificationType.NEW_TYPE]: {
  emailEnabled: true,
  smsEnabled: false,
  pushEnabled: true,
  whatsappEnabled: false,
  frequency: NotificationFrequency.REAL_TIME,
}
```

3. Use in your service:
```typescript
const result = await shouldSendNotification(
  userId,
  NotificationType.NEW_TYPE,
  NotificationChannel.EMAIL
)
```

### Change Default Settings

Edit `DEFAULT_NOTIFICATION_SETTINGS` in `src/lib/notification-types.ts`:

```typescript
export const DEFAULT_NOTIFICATION_SETTINGS = {
  digestTime: '08:00',  // Change from '09:00'
  digestTimezone: 'America/New_York',  // Change from 'America/Toronto'
  doNotDisturbStart: '23:00',  // Change from '22:00'
  doNotDisturbEnd: '07:00',  // Change from '08:00'
  doNotDisturbTimezone: 'America/New_York',
}
```

## File Locations

Core files:
- `src/lib/notification-types.ts` - Type definitions
- `src/lib/preferences.ts` - Database logic
- `src/lib/time-utils.ts` - Timezone utilities
- `src/lib/notification-guard.ts` - Guard function

API routes:
- `src/app/api/notifications/preferences/route.ts`
- `src/app/api/notifications/preferences/[type]/route.ts`
- `src/app/api/notifications/digest-time/route.ts`

Components:
- `src/components/NotificationPreferences/PreferencesModal.tsx`
- `src/components/NotificationPreferences/PreferenceRow.tsx`
- `src/components/NotificationPreferences/QuietHoursSettings.tsx`
- `src/components/NotificationPreferences/DigestTimeSelector.tsx`

## Troubleshooting

### Modal doesn't show
- Check userId is passed correctly
- Verify session is active
- Check browser console for errors

### Preferences not saving
- Check network tab for API errors
- Verify user is authenticated
- Check database tables exist

### Quiet hours not working
- Verify timezone is valid (e.g., 'America/Toronto')
- Check time format is HH:mm (24-hour)
- Ensure start time < end time (or spans midnight)

### Times are wrong
- Check user's timezone setting
- Verify your system timezone
- Test with UTC first

## Next Steps

1. ✅ Create database tables
2. ✅ Add PreferencesModal to account page
3. ✅ Test the UI
4. 📋 Integrate with email service
5. 📋 Integrate with SMS/WhatsApp services
6. 📋 Set up digest email job (background worker)
7. 📋 Add notification logs/analytics

## Full Documentation

- [Complete API Reference](./NOTIFICATION_API.md)
- [Database Schema](./NOTIFICATION_SCHEMA.md)
- [Implementation Details](./NOTIFICATION_IMPLEMENTATION.md)
- [Full System README](./NOTIFICATION_SYSTEM_README.md)

## Questions?

Refer to the implementation guide for more details on:
- Timezone handling
- Quiet hours logic
- Digest scheduling
- Performance optimization
- Testing procedures
