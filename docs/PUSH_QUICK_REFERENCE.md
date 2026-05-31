# Push Notifications Quick Reference

## 🚀 5-Minute Setup

```bash
# 1. Generate VAPID keys
npx web-push generate-vapid-keys

# 2. Add to .env.local
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<public-key>
VAPID_PRIVATE_KEY=<private-key>
VAPID_SUBJECT=mailto:hello@ipoready.com

# 3. Run database migration
psql $DATABASE_URL < scripts/migration-push-subscriptions.sql

# 4. Install dependencies
npm install web-push

# 5. Start app
npm run dev
```

Done! Permission prompt shows after 5 seconds on login.

## 📁 File Reference

| File | Purpose |
|------|---------|
| `public/service-worker.js` | Handles push events |
| `src/lib/push-service.ts` | Client-side push API |
| `src/lib/push-subscription.ts` | Subscribe/unsubscribe |
| `src/lib/push-sender.ts` | Server-side sending |
| `src/lib/vapid.ts` | VAPID configuration |
| `src/lib/broadcast-channel.ts` | Cross-tab sync |
| `src/lib/push-health.ts` | Health checks |
| `src/hooks/usePushNotifications.ts` | Main hook |
| `src/components/PushPermissionPrompt.tsx` | Permission UI |
| `src/components/PushNotificationSettings.tsx` | Settings component |
| `src/components/NotificationConsumer.tsx` | Auto-push on notifications |
| `src/components/ServiceWorkerRegister.tsx` | Register service worker |
| `src/app/api/push/subscribe/route.ts` | Save subscription |
| `src/app/api/push/unsubscribe/route.ts` | Remove subscription |
| `src/app/api/push/send/route.ts` | Send push (admin) |
| `src/app/api/push/cron/cleanup-subscriptions/route.ts` | Cleanup job |

## 💻 Client Usage

### Check Support
```typescript
import { isPushSupported, getPushPermissionStatus } from '@/lib/push-service'

const supported = isPushSupported() // true/false
const status = getPushPermissionStatus() // 'granted' | 'denied' | 'default'
```

### Subscribe
```typescript
import { subscribeToPush } from '@/lib/push-subscription'

await subscribeToPush()
```

### Use Hook
```typescript
import { usePushNotifications } from '@/hooks/usePushNotifications'

const { isSubscribed, subscribe, unsubscribe, isLoading } = usePushNotifications()

return (
  <button onClick={subscribe} disabled={isLoading}>
    Enable Notifications
  </button>
)
```

### Add Settings
```tsx
import { PushNotificationSettings } from '@/components/PushNotificationSettings'

export default function SettingsPage() {
  return <PushNotificationSettings />
}
```

## 🖥️ Server Usage

### Send to User
```typescript
import { sendPushToUser } from '@/lib/push-sender'

await sendPushToUser(userId, {
  title: 'New Task',
  body: 'You have a new task assigned',
  url: '/dashboard/tasks',
})
```

### Send to Company
```typescript
import { sendPushToCompany } from '@/lib/push-sender'

await sendPushToCompany(companyId, {
  title: 'Milestone Reached',
  body: '50% IPO readiness completed!',
})
```

### Send via API
```bash
curl -X POST http://localhost:3800/api/push/send \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "title": "Task Due",
    "body": "Your filing task is due today",
    "url": "/dashboard"
  }'
```

## 🔌 API Endpoints

### POST /api/push/subscribe
Save push subscription
```json
{
  "subscription": {
    "endpoint": "https://...",
    "keys": { "auth": "...", "p256dh": "..." }
  }
}
```

### POST /api/push/unsubscribe
Remove subscription
```json
{
  "endpoint": "https://..."
}
```

### POST /api/push/send
Send push (admin only)
```json
{
  "userId": "uuid",
  "title": "...",
  "body": "...",
  "url": "/path",
  "action": "optional"
}
```

### GET /api/push/cron/cleanup-subscriptions
Cleanup unused subscriptions (30+ days)

## 🐛 Debug Commands

### Check Support
```javascript
// Browser console
Notification.permission // 'granted' | 'denied' | 'default'
navigator.serviceWorker.getRegistrations()
```

### Health Check
```bash
curl -X GET "http://localhost:3800/api/push/cron/cleanup-subscriptions" \
  -H "Authorization: Bearer $CRON_SECRET"
```

### Database
```bash
psql $DATABASE_URL -c "SELECT COUNT(*) FROM push_subscriptions;"
psql $DATABASE_URL -c "SELECT * FROM push_subscriptions LIMIT 5;"
```

## 📊 Monitoring

### Check Health Programmatically
```typescript
import { checkPushHealth } from '@/lib/push-health'

const health = await checkPushHealth()
if (health.isHealthy) {
  console.log('✅ Push system healthy')
} else {
  console.error(health.errors)
}
```

### Log Full Status
```typescript
import { logPushHealth } from '@/lib/push-health'

await logPushHealth()
```

### System Status for Dashboards
```typescript
import { getPushSystemStatus } from '@/lib/push-health'

const { status, message, details } = await getPushSystemStatus()
// status: 'healthy' | 'degraded' | 'unhealthy'
```

## 🔐 Security Checklist

- [ ] VAPID keys generated (never commit private key)
- [ ] Environment variables set
- [ ] Database migration applied
- [ ] Service worker at `/public/service-worker.js`
- [ ] HTTPS enabled (production)
- [ ] CRON_SECRET set for cleanup job
- [ ] Subscriptions encrypted in database
- [ ] Admin-only access on /api/push/send

## 🌍 Browser Support

| Chrome | Firefox | Safari | Edge | Opera | IE |
|--------|---------|--------|------|-------|-----|
| ✅ 50+ | ✅ 48+ | ✅ 16.4+ | ✅ 17+ | ✅ 37+ | ❌ |

## 🚀 Production Deployment

```bash
# 1. Generate new VAPID keys
npx web-push generate-vapid-keys

# 2. Set env vars in production
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<prod-public-key>
VAPID_PRIVATE_KEY=<prod-private-key>
VAPID_SUBJECT=mailto:hello@ipoready.com
CRON_SECRET=<random-secret>

# 3. Run migration on production DB
psql <PROD_DATABASE_URL> < scripts/migration-push-subscriptions.sql

# 4. Deploy (npm run build && npm start)

# 5. Set up cron job for cleanup
0 2 * * * curl -X GET "https://ipoready.com/api/push/cron/cleanup-subscriptions" \
  -H "Authorization: Bearer $CRON_SECRET"
```

## 📚 Full Documentation

- **Complete Guide:** `/docs/PUSH_NOTIFICATIONS.md`
- **Integration Guide:** `/docs/PUSH_NOTIFICATIONS_INTEGRATION.md`
- **Implementation Details:** `/docs/PUSH_NOTIFICATIONS_IMPLEMENTATION.md`

## 🆘 Common Issues

| Issue | Solution |
|-------|----------|
| Prompt not showing | Check browser console, verify support |
| Service Worker not registering | Check file at `/public/service-worker.js` |
| Push not being sent | Verify VAPID keys, check API response |
| Wrong title/body | Check payload in API request |
| Database error | Run migration, verify table exists |

## 💡 Pro Tips

1. **Test Notifications:** Use PushNotificationExample component
2. **Monitor Health:** Call `logPushHealth()` in startup
3. **Auto-Cleanup:** Set CRON_SECRET for automatic cleanup
4. **Debug Service Worker:** DevTools → Application → Service Workers
5. **Check Subscriptions:** `SELECT COUNT(*) FROM push_subscriptions`

## 🔗 Integration Examples

### Notify on Task Complete
```typescript
const completeTask = async (taskId) => {
  // ... complete task logic ...
  
  await sendPushToUser(userId, {
    title: '✅ Task Completed',
    body: `${task.title} is now complete`,
    url: `/dashboard/tasks/${taskId}`,
  })
}
```

### Milestone Notifications
```typescript
if (paceScore >= 50) {
  await sendPushToCompany(companyId, {
    title: '🎉 Milestone: 50% Complete',
    body: 'Your company is halfway to IPO readiness!',
    url: '/dashboard/progress',
  })
}
```

### Daily Reminders (via cron)
```typescript
// In a cron job handler
const overdueUsers = await getUsersWithOverdueTasks()
for (const user of overdueUsers) {
  await sendPushToUser(user.id, {
    title: '📋 Overdue Tasks',
    body: `You have ${user.overdueTasks.length} overdue tasks`,
    url: '/dashboard/tasks?filter=overdue',
  })
}
```

## 📞 Support

For detailed help, see the full documentation in `/docs/`
