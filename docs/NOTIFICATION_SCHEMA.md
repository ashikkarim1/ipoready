# Notification Preferences Database Schema

This document defines the database schema for the notification preferences system.

## Tables

### `notification_preferences`

Stores user preferences for each notification type across all channels.

```sql
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
  
  UNIQUE(user_id, notification_type),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);
```

**Columns:**

- `id`: Unique identifier (UUID)
- `user_id`: Reference to authenticated user
- `notification_type`: Type of notification (e.g., 'task_due', 'document_shared')
- `email_enabled`: Whether email notifications are enabled for this type
- `sms_enabled`: Whether SMS notifications are enabled for this type
- `push_enabled`: Whether push notifications are enabled for this type
- `whatsapp_enabled`: Whether WhatsApp notifications are enabled for this type
- `frequency`: How often to send ('real_time', 'daily_digest', 'weekly', 'never')
- `quiet_hours_start`: Optional time to start quiet hours (HH:mm format)
- `quiet_hours_end`: Optional time to end quiet hours (HH:mm format)
- `quiet_hours_timezone`: IANA timezone for quiet hours (e.g., 'America/New_York')
- `updated_at`: Timestamp of last update

### `notification_settings`

Stores global notification settings for each user.

```sql
CREATE TABLE notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  digest_time VARCHAR(5) DEFAULT '09:00',
  digest_timezone VARCHAR(50) DEFAULT 'America/Toronto',
  do_not_disturb_start VARCHAR(5) DEFAULT '22:00',
  do_not_disturb_end VARCHAR(5) DEFAULT '08:00',
  do_not_disturb_timezone VARCHAR(50) DEFAULT 'America/Toronto',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX idx_notification_settings_user_id ON notification_settings(user_id);
```

**Columns:**

- `id`: Unique identifier (UUID)
- `user_id`: Reference to authenticated user (unique per user)
- `digest_time`: Preferred time for digest emails (HH:mm format)
- `digest_timezone`: Timezone for digest time (IANA string)
- `do_not_disturb_start`: Start of global quiet hours (HH:mm format)
- `do_not_disturb_end`: End of global quiet hours (HH:mm format)
- `do_not_disturb_timezone`: Timezone for quiet hours (IANA string)
- `created_at`: Timestamp of creation
- `updated_at`: Timestamp of last update

## Notification Types

The following notification types are supported:

### Tasks
- `task_due`: Task is due soon (default: real_time, all channels enabled)
- `task_overdue`: Task is overdue (default: real_time, all channels enabled)
- `task_completed`: Task completed by teammate (default: real_time, email + push)

### Documents
- `document_shared`: Document shared with user (default: real_time, email + push)
- `document_version_ready`: New version available (default: real_time, email + push)
- `document_verified`: Document passed verification (default: real_time, email + push)
- `document_rejected`: Document needs changes (default: real_time, all channels)

### Progress
- `milestone_achieved`: Team milestone reached (default: real_time, email + push)
- `phase_progressed`: Company advances phase (default: real_time, email + push)
- `pace_score_changes`: PACE score drops (default: daily_digest, email only)

### Team & Communication
- `team_member_joined`: New team member (default: real_time, email + push)
- `comment_mention`: Mentioned in comment (default: real_time, email + push)

### Business Critical
- `cap_table_updated`: Cap table modified (default: daily_digest, email only)
- `board_report_ready`: Board report ready (default: daily_digest, email + push)
- `regulatory_deadline`: Filing deadline approaching (default: real_time, all channels)
- `sedi_filing_due`: SEDI filing due (default: real_time, all channels)

### Account & System
- `subscription_renewal_warning`: Subscription renewing (default: real_time, email)
- `system_alert`: System update (default: real_time, all channels)
- `account_warning`: Account issue (default: real_time, all channels)
- `new_expert_inquiry_response`: Expert response received (default: real_time, email + push)

## Defaults

### Channel Defaults
- **Email**: Enabled for most notification types (except task_completed)
- **SMS**: Only enabled for critical notifications (overdue, system alerts, account warnings)
- **Push**: Enabled for most types
- **WhatsApp**: Only enabled for critical notifications

### Frequency Defaults
- **Real-time**: Default for most notifications
- **Daily Digest**: For cap_table_updated, board_report_ready, pace_score_changes
- **Weekly**: Available as option but not default for any type
- **Never**: Can be set by user to disable a notification type

### Global Settings Defaults
- **Digest Time**: 09:00 (9:00 AM)
- **Digest Timezone**: America/Toronto (EST/EDT)
- **DND Start**: 22:00 (10:00 PM)
- **DND End**: 08:00 (8:00 AM)
- **DND Timezone**: America/Toronto

## Timezone Handling

All times use IANA timezone strings (e.g., 'America/New_York', 'Europe/London').

Supported timezones include:
- North American: America/Los_Angeles, America/Denver, America/Chicago, America/New_York, America/Toronto, America/Vancouver
- European: Europe/London, Europe/Paris, Europe/Berlin
- Asian: Asia/Dubai, Asia/Hong_Kong, Asia/Singapore, Asia/Tokyo, Asia/Shanghai, Asia/Kolkata
- Australian: Australia/Sydney, Australia/Melbourne, Australia/Brisbane, Australia/Perth
- UTC

## Quiet Hours Logic

When a notification is triggered:

1. **Real-time notifications**: Not sent if current time is within user's quiet hours
2. **Digest notifications**: Always queued for digest; delivered at next scheduled digest time even if during quiet hours
3. **Critical notifications** (system alerts, account warnings): Bypass quiet hours and always sent real-time

## Migration Scripts

### Create Tables (Initial Setup)

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

### Seed Default Preferences (After Creating Tables)

```sql
-- This would be done via application code in preferences.ts
-- Each user gets default preferences on their first notification event
-- or when they first visit notification settings
```

## Usage Examples

### Get All Preferences for User

```sql
SELECT * FROM notification_preferences WHERE user_id = 'user_123';
```

### Update Email for Task Due

```sql
UPDATE notification_preferences
SET email_enabled = FALSE, updated_at = NOW()
WHERE user_id = 'user_123' AND notification_type = 'task_due';
```

### Get User's Global Settings

```sql
SELECT * FROM notification_settings WHERE user_id = 'user_123';
```

### Find All Users in Quiet Hours

```sql
-- This is handled in application code using time-utils.ts
-- The database stores times but doesn't enforce quiet hours
```

## Performance Considerations

1. **Indexes**: User ID is indexed on both tables for fast lookups
2. **Unique Constraint**: (user_id, notification_type) ensures no duplicates in preferences
3. **Query Pattern**: Preferences are typically loaded for one user at a time
4. **Caching**: Application layer should cache user preferences (5-minute TTL recommended)

## Related Documentation

- [Preferences API](./NOTIFICATION_API.md)
- [Implementation Guide](./NOTIFICATION_IMPLEMENTATION.md)
