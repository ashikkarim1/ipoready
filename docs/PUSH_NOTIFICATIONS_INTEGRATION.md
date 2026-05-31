# Push Notifications Integration Guide

Complete walkthrough for integrating web push notifications into your workflow.

## Quick Start (5 minutes)

### 1. Generate VAPID Keys

```bash
cd /Users/test/Documents/Claude/Projects/IPOReady
npx web-push generate-vapid-keys
```

You'll get output like:
```
Public Key: BEl62iUYgU...
Private Key: ztP_Io...
```

### 2. Set Environment Variables

Edit `.env.local`:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BEl62iUYgU...
VAPID_PRIVATE_KEY=ztP_Io...
VAPID_SUBJECT=mailto:hello@ipoready.com
```

### 3. Set Up Database

```bash
psql $DATABASE_URL < scripts/migration-push-subscriptions.sql
```

Or if psql is not available, run this in your Neon dashboard:

```sql
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  auth TEXT,
  p256dh TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_endpoint UNIQUE(user_id, endpoint)
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_last_used ON push_subscriptions(last_used_at);
```

### 4. Install Dependencies

```bash
npm install web-push
```

### 5. Start Using

The system is now ready! On your next login:
- A permission prompt appears after 5 seconds
- Users can enable notifications
- Notifications auto-sync across tabs
- Service worker handles push delivery

## File Structure

```
IPOReady/
├── public/
│   └── service-worker.js                    # Service Worker
├── src/
│   ├── app/
│   │   ├── api/push/
│   │   │   ├── subscribe/route.ts          # POST /api/push/subscribe
│   │   │   ├── unsubscribe/route.ts        # POST /api/push/unsubscribe
│   │   │   ├── send/route.ts               # POST /api/push/send (admin)
│   │   │   └── cron/
│   │   │       └── cleanup-subscriptions/  # Daily cleanup job
│   │   ├── layout.tsx                      # Added ServiceWorkerRegister
│   │   └── providers.tsx                   # Added PushPermissionPrompt & NotificationConsumer
│   ├── components/
│   │   ├── ServiceWorkerRegister.tsx       # Register service worker
│   │   ├── PushPermissionPrompt.tsx        # User permission prompt
│   │   ├── PushNotificationSettings.tsx    # Account settings component
│   │   ├── NotificationConsumer.tsx        # Notification listener
│   │   └── examples/
│   │       └── PushNotificationExample.tsx # Examples & testing
│   ├── hooks/
│   │   └── usePushNotifications.ts         # Main hook
│   ├── lib/
│   │   ├── push-service.ts                 # Client-side push service
│   │   ├── push-subscription.ts            # Subscription management
│   │   ├── push-sender.ts                  # Server-side push sender
│   │   ├── vapid.ts                        # VAPID key management
│   │   └── broadcast-channel.ts            # Cross-tab sync
│   └── types/
│       └── push.ts                         # TypeScript types
└── scripts/
    └── migration-push-subscriptions.sql    # Database migration
```

## Usage Examples

### For Users

**Enable Notifications:**
1. Open the app (dashboard)
2. Permission prompt appears
3. Click "Enable"
4. Confirm in browser permission dialog

**Disable Notifications:**
1. Go to Account Settings
2. Find "Push Notifications" section
3. Click "Disable"

### For Developers

**Send Push to a User:**

```typescript
import { sendPushToUser } from '@/lib/push-sender'

// In any server-side function or API route
const result = await sendPushToUser(userId, {
  title: 'Task Reminder',
  body: 'Your IPO filing task is due tomorrow',
  url: '/dashboard/tasks/123',
})

console.log(`Sent to ${result.sentCount} devices`)
```

**Send Push from API:**

```bash
curl -X POST http://localhost:3800/api/push/send \
  -H "Authorization: Bearer <session-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "title": "New Milestone",
    "body": "You reached 50% IPO readiness!",
    "url": "/dashboard"
  }'
```

**Use the Hook:**

```tsx
import { usePushNotifications } from '@/hooks/usePushNotifications'

export function MyComponent() {
  const { isSubscribed, subscribe, unsubscribe } = usePushNotifications()

  return (
    <button onClick={isSubscribed ? unsubscribe : subscribe}>
      {isSubscribed ? 'Disable' : 'Enable'} Notifications
    </button>
  )
}
```

**Auto-Send When Creating Notifications:**

```tsx
// In your notification creation code
import { useAppStore } from '@/store/app-store'

const addNotification = useAppStore(state => state.addNotification)

// Add to store (will auto-send push via NotificationConsumer)
addNotification({
  id: 'notif-123',
  userId: currentUserId,
  title: 'Important Update',
  message: 'Your documentation is ready for review',
  link: '/documents',
  // ... other fields
})
```

## API Reference

### POST /api/push/subscribe

Subscribe a user to push notifications.

**Request:**
```json
{
  "subscription": {
    "endpoint": "https://...",
    "keys": {
      "auth": "...",
      "p256dh": "..."
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Push subscription saved"
}
```

### POST /api/push/unsubscribe

Remove user from push notifications.

**Request:**
```json
{
  "endpoint": "https://..."  // optional - if empty, removes all
}
```

**Response:**
```json
{
  "success": true,
  "message": "Push subscription removed"
}
```

### POST /api/push/send

Send a push notification (admin only).

**Request:**
```json
{
  "userId": "user-uuid",
  "title": "Notification Title",
  "body": "Notification body text",
  "url": "/dashboard/page",
  "action": "custom_action"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Push notification sent to 2 subscription(s)",
  "sentCount": 2,
  "failedCount": 0
}
```

### GET /api/push/cron/cleanup-subscriptions

Clean up expired subscriptions (30+ days inactive).

**Headers:**
```
Authorization: Bearer <CRON_SECRET>
```

**Response:**
```json
{
  "ok": true,
  "cleaned": 15,
  "timestamp": "2026-05-23T10:30:00Z"
}
```

## Client-Side Functions

### Push Service (`push-service.ts`)

```typescript
// Check if browser supports push
isPushSupported(): boolean

// Get current permission status
getPushPermissionStatus(): 'granted' | 'denied' | 'default'

// Request permission from user
requestPushPermission(): Promise<NotificationPermission>

// Get current push subscription
getPushSubscription(): Promise<PushSubscription | null>

// Subscribe to push notifications
subscribeToPush(): Promise<PushSubscription | null>

// Unsubscribe from push notifications
unsubscribeFromPush(): Promise<boolean>
```

### Push Subscription (`push-subscription.ts`)

```typescript
// Subscribe and register with backend
subscribeToPush(): Promise<void>

// Unsubscribe and remove from backend
unsubscribeFromPushNotifications(): Promise<void>

// Check if subscribed
isUserSubscribed(): Promise<boolean>

// Get current subscription
getCurrentSubscription(): Promise<PushSubscription | null>
```

### usePushNotifications Hook

```typescript
interface UsePushNotificationsReturn {
  isSupported: boolean
  permission: NotificationPermission
  isSubscribed: boolean
  isLoading: boolean
  error: string | null
  requestPermission(): Promise<NotificationPermission>
  subscribe(): Promise<void>
  unsubscribe(): Promise<void>
}
```

## Server-Side Functions

### Push Sender (`push-sender.ts`)

```typescript
// Configure web-push (internal use)
configureWebPush(): void

// Send push to single user
sendPushToUser(userId: string, payload: PushNotificationPayload): Promise<PushResult>

// Send push to multiple users
sendPushToUsers(userIds: string[], payload): Promise<PushResult>

// Send push to all users in a company
sendPushToCompany(companyId: string, payload): Promise<PushResult>

// Clean up subscriptions unused for 30+ days
cleanupExpiredSubscriptions(): Promise<number>
```

## Components

### PushPermissionPrompt

Shows a friendly prompt to enable notifications.

**Props:**
```typescript
interface PushPermissionPromptProps {
  showDelay?: number        // Delay before showing (ms, default: 5000)
  minDismissals?: number    // Max dismissals before hiding (default: 2)
}
```

**Usage:**
```tsx
<PushPermissionPrompt showDelay={3000} minDismissals={3} />
```

### PushNotificationSettings

Account settings for push notifications.

**Usage:**
```tsx
<PushNotificationSettings />
```

Add to settings page:
```tsx
export default function SettingsPage() {
  return (
    <div>
      {/* Other settings... */}
      <PushNotificationSettings />
    </div>
  )
}
```

### NotificationConsumer

Automatically sends push for new in-app notifications.

**Props:** None (included in Providers automatically)

**Usage:**
```tsx
// Already in Providers - no manual setup needed
```

### ServiceWorkerRegister

Registers the service worker.

**Props:** None (included in layout automatically)

## Testing

### Manual Testing

1. **Enable Notifications:**
   ```
   Open app → Permission prompt appears → Click Enable → Confirm browser dialog
   ```

2. **Send Test Push:**
   ```bash
   curl -X POST http://localhost:3800/api/push/send \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{
       "userId": "demo-ceo",
       "title": "Test",
       "body": "Test notification"
     }'
   ```

3. **Check Service Worker:**
   - Open DevTools (F12)
   - Go to Application → Service Workers
   - Verify `/service-worker.js` is listed and active

4. **Check Subscriptions:**
   ```bash
   psql $DATABASE_URL -c "SELECT * FROM push_subscriptions LIMIT 5;"
   ```

### Browser DevTools

**Check Notifications Permission:**
```javascript
// In browser console
Notification.permission
// → 'granted', 'denied', or 'default'
```

**Check Service Worker Registration:**
```javascript
navigator.serviceWorker.getRegistrations().then(regs => console.log(regs))
```

**Check Current Subscription:**
```javascript
navigator.serviceWorker.ready.then(reg => {
  reg.pushManager.getSubscription().then(sub => console.log(sub))
})
```

## Debugging

### Common Issues

**Issue: Permission prompt not showing**
- Check browser supports push (Chrome, Firefox, Safari, Edge)
- Open DevTools console for errors
- Check localStorage for dismissal count

**Issue: Service Worker not registering**
- Verify `/public/service-worker.js` exists
- Check DevTools Application → Service Workers
- Clear browser cache and reload

**Issue: Push not being sent**
- Verify VAPID keys are set in .env.local
- Check /api/push/send returns success
- Verify subscription exists: `SELECT * FROM push_subscriptions WHERE user_id = '...'`

**Issue: Notifications showing wrong title/body**
- Check payload in /api/push/send request
- Verify service worker received the push event
- Check browser notification settings

### Logging

Enable detailed logging:

```typescript
// In push-service.ts
console.log('Push supported:', isPushSupported())
console.log('Permission:', getPushPermissionStatus())

// In service worker
self.addEventListener('push', (event) => {
  console.log('Push event:', event.data?.text())
})
```

## Performance

- Service Worker adds ~15KB gzipped
- Push subscriptions: ~200 bytes per subscription
- Badge updates: <1ms per tab
- Push delivery: ~100-500ms typical

## Security

- VAPID keys prove your identity to push services
- Private key stays on server, never exposed to client
- Public key available to browser (in NEXT_PUBLIC_* env)
- Push subscriptions tied to specific users
- Database has UNIQUE constraint on (user_id, endpoint)
- Automatic cleanup of invalid subscriptions (410 Gone)

## Browser Compatibility

| Browser | Support | Min Version |
|---------|---------|-------------|
| Chrome  | ✅      | 50+ |
| Firefox | ✅      | 48+ |
| Safari  | ✅      | 16.4+ |
| Edge    | ✅      | 17+ |
| Opera   | ✅      | 37+ |
| IE      | ❌      | N/A |

## Production Checklist

- [ ] Generate new VAPID keys for production
- [ ] Set environment variables in production
- [ ] Run database migration
- [ ] Test with real devices/browsers
- [ ] Verify service worker is cached correctly
- [ ] Monitor API logs for errors
- [ ] Set up cron job for subscription cleanup
- [ ] Add monitoring/alerting for push failures
- [ ] Test cross-browser compatibility
- [ ] Document any custom notification handling

## Next Steps

1. **Notification Templates** - Create reusable notification templates for different event types
2. **User Preferences** - Let users choose which notification types to receive
3. **Analytics** - Track notification delivery, open rates, etc.
4. **Rich Notifications** - Add images, buttons, and rich content
5. **Scheduling** - Queue notifications for specific times
6. **Batch Sending** - Optimize sending to many users

## Support

For issues or questions:
1. Check DevTools Application → Service Workers
2. Review browser console for errors
3. Check `/scripts/migration-push-subscriptions.sql` was applied
4. Verify environment variables are set
5. Review `/docs/PUSH_NOTIFICATIONS.md` for more details
