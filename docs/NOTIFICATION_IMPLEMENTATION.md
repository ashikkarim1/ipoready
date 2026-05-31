# Notification System Implementation Guide

## Overview

This guide covers the complete notification preferences system for IPOReady, including:
- Database schema setup
- API endpoints
- UI components
- Integration with notification services
- Time and timezone handling

## Architecture

```
┌─────────────────────────────────────────────────┐
│         React Components (UI Layer)              │
│   PreferencesModal, PreferenceRow, etc.          │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────┴──────────────────────────────┐
│     API Routes (/api/notifications/*)            │
│   GET/POST preferences, digest-time, etc.        │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────┴──────────────────────────────┐
│      Preference Logic (src/lib/preferences.ts)   │
│   Get/Update preferences, check rules             │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────┴──────────────────────────────┐
│     Time Utilities (src/lib/time-utils.ts)       │
│   Timezone handling, quiet hours, digest time     │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────┴──────────────────────────────┐
│     Database (Neon PostgreSQL)                   │
│   notification_preferences, notification_settings │
└─────────────────────────────────────────────────┘
```

## Step-by-Step Setup

### 1. Database Schema

Run these SQL migrations to create the notification tables:

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

See [NOTIFICATION_SCHEMA.md](./NOTIFICATION_SCHEMA.md) for complete details.

### 2. File Structure

```
src/
├── lib/
│   ├── notification-types.ts      # Type definitions and enums
│   ├── preferences.ts              # Preference logic (GET/UPDATE)
│   ├── time-utils.ts               # Timezone utilities
│   └── notification-guard.ts        # Guard function for services
├── app/
│   └── api/
│       └── notifications/
│           ├── preferences/
│           │   ├── route.ts         # GET/POST all preferences
│           │   └── [type]/
│           │       └── route.ts     # GET/PUT single preference
│           └── digest-time/
│               └── route.ts         # POST digest time
└── components/
    └── NotificationPreferences/
        ├── PreferencesModal.tsx     # Main modal component
        ├── PreferenceRow.tsx        # Single notification type row
        ├── QuietHoursSettings.tsx   # DND hours settings
        ├── DigestTimeSelector.tsx   # Digest time picker
        └── index.ts                 # Exports

docs/
├── NOTIFICATION_SCHEMA.md           # Database schema
├── NOTIFICATION_API.md              # API documentation
└── NOTIFICATION_IMPLEMENTATION.md   # This file
```

### 3. Database Connection

The system uses the existing Neon connection in `src/lib/db.ts`:

```typescript
import { sql } from '@/lib/db'

// Usage in preferences.ts
const rows = await sql`
  SELECT * FROM notification_preferences WHERE user_id = ${userId}
`
```

### 4. Integration Points

#### In Email Service

```typescript
import { shouldSendNotification, NotificationChannel } from '@/lib/notification-guard'
import { NotificationType } from '@/lib/notification-types'

async function sendTaskDueEmail(userId: string, taskId: string) {
  // Check if user wants email for task_due
  const result = await shouldSendNotification(
    userId,
    NotificationType.TASK_DUE,
    NotificationChannel.EMAIL
  )

  if (!result.allowed) {
    if (result.shouldDigest) {
      // Queue for digest
      await queueNotificationForDigest({
        userId,
        type: NotificationType.TASK_DUE,
        taskId,
      })
    }
    return
  }

  // Send email immediately
  await sendEmail({
    to: user.email,
    subject: `Task "${task.title}" is due soon`,
    html: renderTaskDueTemplate(task)
  })
}
```

#### In WhatsApp Service

```typescript
import { shouldSendNotification, NotificationChannel } from '@/lib/notification-guard'
import { NotificationType } from '@/lib/notification-types'

async function sendTaskOverdueWhatsApp(userId: string, taskId: string) {
  const result = await shouldSendNotification(
    userId,
    NotificationType.TASK_OVERDUE,
    NotificationChannel.WHATSAPP
  )

  if (!result.allowed) {
    // Don't queue critical notifications, just skip
    return
  }

  // Send via WhatsApp
  const message = `⚠️ Task "${task.title}" is now overdue. Please take action.`
  await sendWhatsAppMessage(user.phone, message)
}
```

#### In Account Page

```typescript
// src/app/account/page.tsx

import { PreferencesModal } from '@/components/NotificationPreferences'

export default function AccountPage() {
  const [preferencesOpen, setPreferencesOpen] = useState(false)

  return (
    <>
      {/* Existing tabs */}
      {activeTab === 'Notifications' && (
        <button onClick={() => setPreferencesOpen(true)}>
          Edit Notification Preferences
        </button>
      )}

      {/* Modal */}
      <PreferencesModal
        isOpen={preferencesOpen}
        onClose={() => setPreferencesOpen(false)}
        userId={session?.user?.id}
      />
    </>
  )
}
```

## Key Components

### 1. Notification Types (`notification-types.ts`)

Defines all notification types and enums:

```typescript
export enum NotificationType {
  TASK_DUE = 'task_due',
  TASK_OVERDUE = 'task_overdue',
  // ... 18 more types
}

export enum NotificationFrequency {
  REAL_TIME = 'real_time',
  DAILY_DIGEST = 'daily_digest',
  WEEKLY = 'weekly',
  NEVER = 'never',
}

export const DEFAULT_PREFERENCES = {
  [NotificationType.TASK_DUE]: {
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    whatsappEnabled: false,
    frequency: NotificationFrequency.REAL_TIME,
  },
  // ... defaults for all types
}
```

### 2. Preferences Logic (`preferences.ts`)

Core functions for managing preferences:

```typescript
// Get all user preferences
const preferences = await getUserPreferences(userId)

// Get single preference
const pref = preferences.get(NotificationType.TASK_DUE)

// Update preference
await updatePreference(userId, NotificationType.TASK_DUE, {
  emailEnabled: false,
  frequency: NotificationFrequency.DAILY_DIGEST
})

// Check if notification should be sent
const result = await shouldSendNotification(
  userId,
  NotificationType.TASK_DUE,
  NotificationChannel.EMAIL
)
if (result.allowed) {
  // Send notification
}

// Get quiet hours
const quietHours = await getUserQuietHours(userId)
```

### 3. Time Utilities (`time-utils.ts`)

Timezone-aware helpers:

```typescript
// Check if within quiet hours
const inQuietHours = isWithinQuietHours(
  new Date(),
  '22:00',
  '08:00',
  'America/Toronto'
)

// Check if it's time for digest
const digestTime = isDigestTime(
  new Date(),
  '09:00',
  'America/Toronto'
)

// Get next occurrence of a time
const nextDigest = getNextOccurrenceOfTime(
  '09:00',
  'America/Toronto'
)

// Format time in timezone
const formatted = formatTimeInTimezone(
  new Date(),
  'America/Toronto',
  'HH:mm'
)
```

### 4. PreferencesModal Component

Main UI component with tabs for preferences and settings:

```typescript
<PreferencesModal
  isOpen={true}
  onClose={() => {}}
  userId="user_123"
/>
```

Features:
- Two tabs: "Notification Types" and "Settings"
- Saves changes to `/api/notifications/preferences`
- Shows success/error messages
- Optimistic UI updates

## Default Configuration

### For Each Notification Type

- **Email**: Enabled for most types (disabled for task_completed)
- **SMS**: Only critical types (overdue, system alerts, warnings)
- **Push**: Enabled for most types
- **WhatsApp**: Only critical types

### Global Settings

- **Digest Time**: 9:00 AM
- **Digest Timezone**: America/Toronto (EST/EDT)
- **Do Not Disturb Start**: 10:00 PM
- **Do Not Disturb End**: 8:00 AM
- **DND Timezone**: America/Toronto

## Quiet Hours Logic

**Real-time notifications**: Blocked during quiet hours
**Digest notifications**: Always queued; delivered at digest time even if during quiet hours
**Critical notifications**: (system_alert, account_warning) Bypass quiet hours

## Digest Workflow

```
Event occurs
    ↓
Check notification preference
    ↓
Frequency = real_time?
    ├─ Yes → Check quiet hours
    │         ├─ In quiet hours? → Queue for digest
    │         └─ Not in quiet hours? → Send immediately
    └─ No (digest/weekly) → Queue for digest
                             ↓
                         At digest time
                             ↓
                         Check quiet hours
                         ├─ In quiet hours? → Wait for DND end
                         └─ Not in quiet hours? → Send digest email
```

## Testing

### Manual Testing Checklist

- [ ] Open notification preferences modal
- [ ] Toggle channels (email, SMS, push, WhatsApp)
- [ ] Change frequency for one notification type
- [ ] Set quiet hours
- [ ] Change digest time
- [ ] Verify changes persist after page reload
- [ ] Test in different timezones
- [ ] Verify API responses in Network tab

### API Testing

```bash
# Get all preferences
curl -X GET http://localhost:3000/api/notifications/preferences \
  -H "Cookie: [session_cookie]"

# Update single preference
curl -X PUT http://localhost:3000/api/notifications/preferences/task_due \
  -H "Content-Type: application/json" \
  -H "Cookie: [session_cookie]" \
  -d '{"emailEnabled": false, "frequency": "daily_digest"}'

# Set digest time
curl -X POST http://localhost:3000/api/notifications/digest-time \
  -H "Content-Type: application/json" \
  -H "Cookie: [session_cookie]" \
  -d '{"digestTime": "08:00", "digestTimezone": "America/New_York"}'
```

## Performance Considerations

1. **Caching**: Preferences loaded on every notification check
   - Cache user preferences in memory with 5-10 minute TTL
   - Use Redis for distributed cache
   - Invalidate cache on preference update

2. **Database Queries**:
   - Indexed on user_id for fast lookups
   - Batch updates when possible
   - Use connection pooling (Neon handles this)

3. **Client-side**:
   - Use React Query or SWR to cache preferences
   - Debounce preference updates
   - Optimistic UI updates

## Future Enhancements

1. **Notification History**: Track sent/delivered notifications
2. **Batch Digest**: Queue multiple notifications for single digest email
3. **Per-Preference Quiet Hours**: Override global quiet hours per type
4. **Workflow-based Preferences**: Different settings per workflow/project
5. **Do Not Disturb Scheduling**: Recurring DND patterns (weekends, business hours)
6. **Preference Templates**: Quick presets (urgent-only, daily digest, disabled)
7. **Email Frequency**: More granular options (twice daily, 3x weekly)
8. **Notification Logs**: Admin view of all sent notifications

## Troubleshooting

### Preferences Not Saving

1. Check browser console for errors
2. Verify user session is valid
3. Check database connection in logs
4. Ensure tables are created and indexes exist

### Quiet Hours Not Working

1. Verify timezone is valid IANA string
2. Check time format is HH:mm (24-hour)
3. Ensure start < end (or start > end for midnight-spanning)
4. Verify system timezone configuration

### Digest Not Sending

1. Check digest time is configured correctly
2. Verify digest_timezone is valid
3. Ensure notification frequency is daily_digest or weekly
4. Check email service is configured (Resend, SendGrid, etc.)

## Related Files

- [Database Schema](./NOTIFICATION_SCHEMA.md) - Complete schema documentation
- [API Reference](./NOTIFICATION_API.md) - Endpoint specifications
- [Notification Types](../src/lib/notification-types.ts) - Type definitions
- [Preference Logic](../src/lib/preferences.ts) - Core functions
- [Time Utilities](../src/lib/time-utils.ts) - Timezone helpers
- [Notification Guard](../src/lib/notification-guard.ts) - Service integration

## Support

For issues or questions:
1. Check this implementation guide
2. Review API documentation
3. Check database schema for structure questions
4. See code comments in source files
5. Check browser console and server logs
