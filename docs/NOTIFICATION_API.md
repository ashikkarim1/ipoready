# Notification Preferences API Documentation

## Overview

The Notification Preferences API allows users to control how and when they receive notifications across multiple channels (email, SMS, push, WhatsApp).

**Base URL**: `/api/notifications`

**Authentication**: All endpoints require a valid session (NextAuth)

## Endpoints

### 1. Get All Preferences

Fetch all notification preferences and settings for the authenticated user.

**Endpoint**: `GET /api/notifications/preferences`

**Response** (200 OK):
```json
{
  "preferences": {
    "task_due": {
      "notificationType": "task_due",
      "emailEnabled": true,
      "smsEnabled": false,
      "pushEnabled": true,
      "whatsappEnabled": false,
      "frequency": "real_time",
      "quietHoursStart": "22:00",
      "quietHoursEnd": "08:00",
      "quietHoursTimezone": "America/Toronto",
      "updatedAt": "2026-05-23T10:30:00Z"
    },
    "document_shared": {
      "notificationType": "document_shared",
      "emailEnabled": true,
      "smsEnabled": false,
      "pushEnabled": true,
      "whatsappEnabled": false,
      "frequency": "real_time",
      "updatedAt": "2026-05-23T10:30:00Z"
    }
    // ... more notification types
  },
  "settings": {
    "id": "uuid",
    "userId": "user_123",
    "digestTime": "09:00",
    "digestTimezone": "America/Toronto",
    "doNotDisturbStart": "22:00",
    "doNotDisturbEnd": "08:00",
    "doNotDisturbTimezone": "America/Toronto",
    "createdAt": "2026-05-22T10:00:00Z",
    "updatedAt": "2026-05-23T10:30:00Z"
  }
}
```

**Error Responses**:
- `401 Unauthorized`: No valid session
- `500 Internal Server Error`: Failed to load preferences

---

### 2. Bulk Update Preferences

Update multiple preferences and/or global settings at once.

**Endpoint**: `POST /api/notifications/preferences`

**Request Body**:
```json
{
  "preferences": [
    {
      "notificationType": "task_due",
      "emailEnabled": true,
      "smsEnabled": false,
      "pushEnabled": true,
      "whatsappEnabled": false,
      "frequency": "real_time",
      "quietHoursStart": "22:00",
      "quietHoursEnd": "08:00",
      "quietHoursTimezone": "America/Toronto"
    },
    {
      "notificationType": "board_report_ready",
      "emailEnabled": true,
      "smsEnabled": false,
      "pushEnabled": true,
      "whatsappEnabled": false,
      "frequency": "daily_digest"
    }
  ],
  "settings": {
    "digestTime": "09:00",
    "digestTimezone": "America/Toronto",
    "doNotDisturbStart": "22:00",
    "doNotDisturbEnd": "08:00",
    "doNotDisturbTimezone": "America/Toronto"
  }
}
```

**Response** (200 OK):
```json
{
  "ok": true,
  "settings": {
    "id": "uuid",
    "userId": "user_123",
    "digestTime": "09:00",
    "digestTimezone": "America/Toronto",
    "doNotDisturbStart": "22:00",
    "doNotDisturbEnd": "08:00",
    "doNotDisturbTimezone": "America/Toronto",
    "createdAt": "2026-05-22T10:00:00Z",
    "updatedAt": "2026-05-23T10:35:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid JSON or missing required fields
- `401 Unauthorized`: No valid session
- `500 Internal Server Error`: Failed to save preferences

---

### 3. Get Single Preference

Fetch preference configuration for a specific notification type.

**Endpoint**: `GET /api/notifications/preferences/:type`

**Parameters**:
- `type` (path): Notification type (e.g., 'task_due', 'document_shared')

**Response** (200 OK):
```json
{
  "notificationType": "task_due",
  "emailEnabled": true,
  "smsEnabled": false,
  "pushEnabled": true,
  "whatsappEnabled": false,
  "frequency": "real_time",
  "quietHoursStart": "22:00",
  "quietHoursEnd": "08:00",
  "quietHoursTimezone": "America/Toronto",
  "updatedAt": "2026-05-23T10:30:00Z"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid notification type
- `401 Unauthorized`: No valid session
- `404 Not Found`: Preference not found
- `500 Internal Server Error`: Failed to fetch preference

---

### 4. Update Single Preference

Update configuration for a specific notification type.

**Endpoint**: `PUT /api/notifications/preferences/:type`

**Parameters**:
- `type` (path): Notification type

**Request Body** (partial update):
```json
{
  "emailEnabled": false,
  "frequency": "daily_digest",
  "quietHoursStart": "21:00",
  "quietHoursEnd": "09:00"
}
```

**Response** (200 OK):
```json
{
  "notificationType": "task_due",
  "emailEnabled": false,
  "smsEnabled": false,
  "pushEnabled": true,
  "whatsappEnabled": false,
  "frequency": "daily_digest",
  "quietHoursStart": "21:00",
  "quietHoursEnd": "09:00",
  "quietHoursTimezone": "America/Toronto",
  "updatedAt": "2026-05-23T10:35:00Z"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid notification type
- `401 Unauthorized`: No valid session
- `404 Not Found`: Preference not found
- `500 Internal Server Error`: Failed to update preference

---

### 5. Set Digest Time

Update the user's digest email time and timezone.

**Endpoint**: `POST /api/notifications/digest-time`

**Request Body**:
```json
{
  "digestTime": "08:00",
  "digestTimezone": "America/New_York"
}
```

**Parameters**:
- `digestTime` (required): Time in HH:mm format (24-hour)
- `digestTimezone` (required): Valid IANA timezone string

**Response** (200 OK):
```json
{
  "ok": true,
  "settings": {
    "id": "uuid",
    "userId": "user_123",
    "digestTime": "08:00",
    "digestTimezone": "America/New_York",
    "doNotDisturbStart": "22:00",
    "doNotDisturbEnd": "08:00",
    "doNotDisturbTimezone": "America/Toronto",
    "createdAt": "2026-05-22T10:00:00Z",
    "updatedAt": "2026-05-23T10:40:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid time format or timezone
- `401 Unauthorized`: No valid session
- `500 Internal Server Error`: Failed to update digest time

---

## Notification Types

### Available Types

All notification types with their default configurations:

| Type | Default Channels | Default Frequency | Use Case |
|------|-----|-----------|----------|
| `task_due` | Email, Push | Real-time | Task due reminder |
| `task_overdue` | All | Real-time | Task is past due |
| `task_completed` | Email, Push | Real-time | Teammate completed task |
| `document_shared` | Email, Push | Real-time | Document shared with you |
| `document_version_ready` | Email, Push | Real-time | New document version |
| `document_verified` | Email, Push | Real-time | Document passed verification |
| `document_rejected` | All | Real-time | Document needs revision |
| `milestone_achieved` | Email, Push | Real-time | Team milestone reached |
| `phase_progressed` | Email, Push | Real-time | Company advances phase |
| `team_member_joined` | Email, Push | Real-time | New team member joins |
| `comment_mention` | Email, Push | Real-time | Mentioned in comment |
| `cap_table_updated` | Email | Daily Digest | Cap table modified |
| `board_report_ready` | Email, Push | Daily Digest | Board report ready |
| `regulatory_deadline` | All | Real-time | Filing deadline upcoming |
| `sedi_filing_due` | All | Real-time | SEDI filing due |
| `system_alert` | All | Real-time | System update |
| `account_warning` | All | Real-time | Account issue |
| `subscription_renewal_warning` | Email | Real-time | Subscription renewing |
| `pace_score_changes` | Email | Daily Digest | PACE™ score drops |
| `new_expert_inquiry_response` | Email, Push | Real-time | Expert response |

---

## Frequency Options

- **`real_time`**: Notification sent immediately when event occurs (unless in quiet hours)
- **`daily_digest`**: Queued and sent with daily digest email at configured time
- **`weekly`**: Queued and sent with weekly digest email (Mondays)
- **`never`**: Notification type disabled

---

## Channels

- **`email`**: Email notification
- **`sms`**: SMS text message (requires SMS provider)
- **`push`**: Browser/mobile push notification
- **`whatsapp`**: WhatsApp message

---

## Time Formats

### Digest Time & Quiet Hours

Times use 24-hour format: `HH:mm` (e.g., `09:00`, `22:30`)

### Timezones

Timezones use IANA timezone identifiers:
- `America/New_York` (EST/EDT)
- `America/Toronto` (EST/EDT)
- `America/Denver` (MST/MDT)
- `America/Los_Angeles` (PST/PDT)
- `Europe/London` (GMT/BST)
- `Europe/Paris` (CET/CEST)
- `Asia/Tokyo` (JST)
- `Australia/Sydney` (AEDT/AEST)
- `UTC`

---

## Usage Examples

### JavaScript/Fetch

```javascript
// Get all preferences
const response = await fetch('/api/notifications/preferences');
const data = await response.json();
console.log(data.preferences);

// Update single preference
await fetch('/api/notifications/preferences/task_due', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    emailEnabled: false,
    frequency: 'daily_digest'
  })
});

// Set digest time
await fetch('/api/notifications/digest-time', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    digestTime: '08:00',
    digestTimezone: 'America/New_York'
  })
});
```

### React Hook

```typescript
const useNotificationPreferences = () => {
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/notifications/preferences')
      .then(r => r.json())
      .then(data => {
        setPreferences(data.preferences);
        setLoading(false);
      });
  }, []);

  return { preferences, loading };
};
```

---

## Error Handling

All error responses follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

### Common Errors

- **400 Bad Request**: Invalid input (malformed JSON, invalid timezone, etc.)
- **401 Unauthorized**: Missing or invalid session
- **404 Not Found**: Requested resource doesn't exist
- **500 Internal Server Error**: Server-side error (check logs)

---

## Rate Limiting

No specific rate limits are imposed on these endpoints, but best practices:
- Batch updates when possible
- Avoid polling more than once per minute
- Cache preferences client-side with reasonable TTL (5 minutes)

---

## Related Documentation

- [Database Schema](./NOTIFICATION_SCHEMA.md)
- [Implementation Guide](./NOTIFICATION_IMPLEMENTATION.md)
- [Notification Guard Usage](../src/lib/notification-guard.ts)
