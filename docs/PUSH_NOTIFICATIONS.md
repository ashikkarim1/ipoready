# Web Push Notification System

IPOReady includes a complete web push notification system with service workers, cross-tab sync, and full TypeScript support.

## Overview

The push notification system enables real-time notifications to users without requiring the app to be active. Features include:

- **Service Worker-based push** - Notifications are delivered even when the browser is closed
- **Cross-tab synchronization** - Badge counts and notifications sync across browser tabs
- **GDPR compliant** - Opt-in only, users have full control
- **Offline support** - Service worker caches critical assets
- **Graceful degradation** - Works without push on older browsers

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Browser                            │
├─────────────────────────────────────────────────────────────┤
│  App Store → NotificationConsumer → Push Service            │
│       ↓                                                      │
│  Service Worker → Push Events → Display Notification        │
│       ↓                                                      │
│  BroadcastChannel → Cross-Tab Sync                          │
└─────────────────────────────────────────────────────────────┘
        ↑                                                       
        │ (PushSubscription)                                    
        │                                                       
┌───────┴──────────────────────────────────────────────────────┐
│              Backend / Push Service                          │
├────────────────────────────────────────────────────────────────┤
│  API Endpoints:                                              │
│  - POST /api/push/subscribe   (Save subscription)           │
│  - POST /api/push/unsubscribe (Remove subscription)         │
│  - POST /api/push/send         (Send push to user)          │
│                                                               │
│  Database:                                                   │
│  - push_subscriptions table (stores browser endpoints)      │
└────────────────────────────────────────────────────────────────┘
```

## Setup Instructions

### 1. Generate VAPID Keys

VAPID keys identify your application server to push services. Generate them locally:

```bash
npx web-push generate-vapid-keys
```

This outputs:
```
Public Key: BEl62iUYgU...
Private Key: ztP_Io...
```

### 2. Configure Environment Variables

Add to `.env.local`:

```env
# Public key - available to browser
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BEl62iUYgU...

# Private key - server-side only
VAPID_PRIVATE_KEY=ztP_Io...

# Subject - identifies your app to push service
VAPID_SUBJECT=mailto:hello@ipoready.com
```

### 3. Setup Database

Create the `push_subscriptions` table:

```bash
# Apply the migration
psql $DATABASE_URL < scripts/migration-push-subscriptions.sql
```

Or run manually:

```sql
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  auth TEXT,
  p256dh TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_endpoint UNIQUE(user_id, endpoint)
);

CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);
CREATE INDEX idx_push_subscriptions_last_used ON push_subscriptions(last_used_at);
```

### 4. Install Dependencies

```bash
npm install web-push
```

## Client-Side Usage

### Enable Push Notifications

The system automatically shows a prompt after 5 seconds on first login. Users can also enable from account settings.

```tsx
import { usePushNotifications } from '@/hooks/usePushNotifications'

export function NotificationSettings() {
  const { isSubscribed, subscribe, unsubscribe } = usePushNotifications()

  return (
    <button onClick={isSubscribed ? unsubscribe : subscribe}>
      {isSubscribed ? 'Disable' : 'Enable'} Notifications
    </button>
  )
}
```

### Manual Subscription

```tsx
import { subscribeToPush } from '@/lib/push-subscription'

// Subscribe to push
await subscribeToPush()

// Or unsubscribe
import { unsubscribeFromPushNotifications } from '@/lib/push-subscription'
await unsubscribeFromPushNotifications()
```

### Check Permission Status

```tsx
import { getPushPermissionStatus, isPushSupported } from '@/lib/push-service'

const isSupported = isPushSupported() // true/false
const status = getPushPermissionStatus() // 'granted' | 'denied' | 'default'
```

## Server-Side Usage

### Send Push to Single User

```typescript
import { sendPushToUser } from '@/lib/push-sender'

const result = await sendPushToUser(userId, {
  title: 'Task Due',
  body: 'Your S-1 filing task is due tomorrow',
  url: '/dashboard/tasks/123',
  action: 'view_task',
})

console.log(`Sent to ${result.sentCount} devices`)
```

### Send Push to Company

```typescript
import { sendPushToCompany } from '@/lib/push-sender'

const result = await sendPushToCompany(companyId, {
  title: 'Milestone Achievement',
  body: 'Your company reached 75% IPO readiness!',
  url: '/dashboard',
})
```

### Send Push to Multiple Users

```typescript
import { sendPushToUsers } from '@/lib/push-sender'

const result = await sendPushToUsers(userIds, {
  title: 'System Maintenance',
  body: 'Scheduled maintenance in 1 hour',
})
```

### API Endpoint: Send Push

```bash
POST /api/push/send
Authorization: Bearer <session-token>
Content-Type: application/json

{
  "userId": "user-uuid",
  "title": "Task Due",
  "body": "Your filing is due today",
  "url": "/dashboard/tasks/123",
  "action": "view_task"
}

Response:
{
  "success": true,
  "sentCount": 2,
  "failedCount": 0
}
```

**Note:** Only system admins can use this endpoint.

## Components

### PushPermissionPrompt

Shows a friendly prompt to enable notifications after first login.

```tsx
import { PushPermissionPrompt } from '@/components/PushPermissionPrompt'

// Automatically shown in Providers, customize with:
<PushPermissionPrompt 
  showDelay={5000}      // Show after 5 seconds
  minDismissals={2}     // Show max 2 times if dismissed
/>
```

### PushNotificationSettings

Account settings component for managing push notification preferences.

```tsx
import { PushNotificationSettings } from '@/components/PushNotificationSettings'

<PushNotificationSettings />
```

### NotificationConsumer

Listens to app store and automatically sends push notifications for new in-app notifications.

```tsx
// Already included in Providers
import { NotificationConsumer } from '@/components/NotificationConsumer'
```

## Hooks

### usePushNotifications

Complete hook for managing push notifications:

```tsx
import { usePushNotifications } from '@/hooks/usePushNotifications'

export function MyComponent() {
  const {
    isSupported,      // Browser supports push
    permission,       // 'granted' | 'denied' | 'default'
    isSubscribed,     // User has subscribed
    isLoading,        // Request in progress
    error,            // Error message if any
    requestPermission, // Ask user for permission
    subscribe,        // Subscribe to push
    unsubscribe,      // Unsubscribe from push
  } = usePushNotifications()

  return (
    <button onClick={subscribe} disabled={isLoading}>
      Enable Notifications
    </button>
  )
}
```

## Service Worker

The service worker (`public/service-worker.js`) handles:

- Receiving push events from the push service
- Displaying notifications to the user
- Handling notification clicks (navigate to page)
- Handling notification dismissals
- Managing notification badge counts
- Background sync (future feature)

## Cross-Tab Synchronization

The system uses `BroadcastChannel` API to sync notifications across tabs:

```tsx
import { notificationBroadcaster } from '@/lib/broadcast-channel'

// Broadcast a notification to other tabs
notificationBroadcaster.broadcastNotification({
  id: 'notification-123',
  title: 'New Task',
  body: 'You have a new task',
  timestamp: Date.now(),
})

// Update badge count across tabs
notificationBroadcaster.updateBadgeCount(5)

// Listen for messages from other tabs
notificationBroadcaster.onMessage((message) => {
  console.log('Received from another tab:', message)
})
```

## Error Handling & Cleanup

### Invalid Subscriptions

The system automatically removes invalid subscriptions (410 Gone responses) from the database.

### Expired Subscriptions

Cleanup old subscriptions not used for 30 days:

```typescript
import { cleanupExpiredSubscriptions } from '@/lib/push-sender'

// Run periodically (e.g., daily cron job)
const deletedCount = await cleanupExpiredSubscriptions()
console.log(`Removed ${deletedCount} expired subscriptions`)
```

## Browser Support

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome  | ✅      | Full support |
| Firefox | ✅      | Full support |
| Safari  | ✅      | iOS 16.4+ |
| Edge    | ✅      | Full support |
| Opera   | ✅      | Full support |
| IE      | ❌      | Not supported |

## Privacy & GDPR

- **Opt-in only** - User must grant permission
- **No tracking** - We don't track who dismisses notifications
- **Data minimization** - Only store endpoint and keys needed for push
- **Easy opt-out** - Users can disable anytime
- **Browser-controlled** - Users can revoke from browser settings

## Troubleshooting

### Notifications not showing

1. Check permission status:
   ```tsx
   import { getPushPermissionStatus } from '@/lib/push-service'
   console.log(getPushPermissionStatus())
   ```

2. Verify service worker is registered:
   ```tsx
   navigator.serviceWorker.getRegistrations().then(regs => console.log(regs))
   ```

3. Check browser console for errors

### Service Worker not updating

Service workers update in the background. To force an update:
```tsx
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.update())
})
```

### Push shows but wrong content

Check the notification payload:
1. Look at `/api/push/send` request body
2. Verify title and body are set
3. Check service worker logs

## Performance Considerations

- Service worker is lazy-loaded (doesn't impact page load)
- Push subscriptions use minimal bandwidth
- Badge updates are batched across tabs
- Old subscriptions are automatically cleaned up

## Testing

### Manual Testing

```bash
# Send a test push
curl -X POST http://localhost:3800/api/push/send \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-id",
    "title": "Test Notification",
    "body": "This is a test push notification",
    "url": "/dashboard"
  }'
```

### Browser DevTools

1. Open DevTools (F12)
2. Go to Application → Service Workers
3. Verify service worker is registered
4. Check Application → Manifest for badge support

## Future Enhancements

- Push notification scheduling
- Rich notifications with images
- Notification grouping by category
- User notification preferences per type
- Analytics dashboard
- A/B testing support
- Notification templates

## Related Files

- Service Worker: `/public/service-worker.js`
- Push Service: `/src/lib/push-service.ts`
- Push Sender: `/src/lib/push-sender.ts`
- Subscription Management: `/src/lib/push-subscription.ts`
- VAPID Configuration: `/src/lib/vapid.ts`
- API Endpoints: `/src/app/api/push/*`
- Hooks: `/src/hooks/usePushNotifications.ts`
- Components: `/src/components/Push*.tsx`
- Database Migration: `/scripts/migration-push-subscriptions.sql`
