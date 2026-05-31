# IPOReady Badge System Documentation

## Overview

The badge system provides real-time visual indicators across IPOReady for notifications, tasks, achievements, and activity status. Badges are designed to be performant, accessible, and seamlessly integrated with the app's design language.

## Architecture

### Components

All badge components are located in `src/components/Badges/`:

1. **NotificationBadge** - Red dot/count badge for unread notifications
   - Shows unread notification count in header
   - Animated pulse when count > 0
   - Clicking navigates to `/notifications`

2. **TaskBadge** - Shows overdue and due-soon task counts
   - Two variants: `overdue`, `due-soon`, `combined`
   - Color-coded (red for overdue, orange for due-soon)
   - Used on dashboard and tasks page

3. **AchievementBadge** - Shows newly unlocked milestones
   - Gold background badge
   - Animated entrance with Framer Motion
   - Compact variant available

4. **ActivityBadge** - Shows user presence status
   - States: `online` (green), `idle` (yellow), `offline` (gray)
   - Pulsing animation for online status
   - Optional label display

5. **CountBadge** - Generic count badge component
   - Variants: `dot`, `badge`, `pill`, `minimal`
   - Customizable colors and icons
   - Used for documents, invites, etc.

### Store Integration

The app store (`src/store/app-store.ts`) manages badge state:

```typescript
interface AppState {
  // Badge counts
  unreadNotificationCount: number
  overdueTaskCount: number
  dueSoonTaskCount: number
  unlockedAchievementCount: number
  newDocumentCount: number
  pendingInviteCount: number
  lastBadgeSyncTime: number

  // Badge methods
  updateBadgeCounts: (counts: Partial<BadgeCounts>) => void
  syncBadgeCounts: () => Promise<void>
  resetBadgeCount: (type: keyof BadgeCounts) => void
}
```

### Real-Time Synchronization

The badge system uses multiple synchronization layers:

#### 1. **API Polling** (`src/lib/badge-sync.ts`)
- Automatic sync every 60 seconds
- Debounced manual sync (100ms debounce)
- Graceful fallback if database unavailable

#### 2. **Cross-Tab Sync** (BroadcastChannel)
- Badge count updates broadcast to other open tabs
- Keeps badge state synchronized across browser instances
- Automatic cleanup when tab closes

#### 3. **Event-Driven Updates**
- Immediate badge updates when:
  - New notification arrives
  - Notification marked as read
  - Task status changes
  - Task due date passes

### API Endpoints

#### `GET /api/badges/counts`
Returns all badge counts for the current user.

**Response:**
```json
{
  "unreadNotifications": 2,
  "overdueTasks": 1,
  "dueSoonTasks": 3,
  "newDocuments": 0,
  "pendingInvites": 0,
  "timestamp": "2026-05-23T10:30:00Z"
}
```

#### `POST /api/badges/dismiss`
Marks a notification as read or dismisses an achievement.

**Request:**
```json
{
  "notificationId": "n123"
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Notification marked as read"
}
```

#### `GET /api/tasks/overdue-count`
Returns count of overdue tasks for the current user.

**Response:**
```json
{
  "overdueTasks": 1,
  "timestamp": "2026-05-23T10:30:00Z"
}
```

## Usage

### 1. Initialize Badge Sync

Add `BadgeSyncProvider` to your root layout (`src/app/layout.tsx`):

```tsx
import { BadgeSyncProvider } from '@/app/BadgeSyncProvider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <BadgeSyncProvider>
          {children}
        </BadgeSyncProvider>
      </body>
    </html>
  )
}
```

### 2. Use NotificationBadge in Header

```tsx
import { NotificationBadge } from '@/components/Badges'

export function Header() {
  return (
    <div className="flex items-center gap-4">
      <NotificationBadge className="ml-auto" />
    </div>
  )
}
```

### 3. Display Task Badges on Dashboard

```tsx
import { TaskBadge } from '@/components/Badges'

export function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <TaskBadge variant="combined" />
    </div>
  )
}
```

### 4. Show Achievement Badge When Unlocked

```tsx
import { AchievementBadge } from '@/components/Badges'

export function AchievementNotification() {
  return (
    <AchievementBadge
      onClick={() => console.log('Achievement clicked')}
    />
  )
}
```

### 5. Display User Activity Status

```tsx
import { ActivityBadge } from '@/components/Badges'

export function UserStatus() {
  return (
    <ActivityBadge
      status="online"
      showLabel
      size="md"
    />
  )
}
```

### 6. Use Generic Count Badge

```tsx
import { CountBadge } from '@/components/Badges'
import { FileText } from 'lucide-react'

export function DocumentList() {
  return (
    <div>
      <CountBadge
        count={5}
        variant="pill"
        bgColor="#3B82F6"
        icon={FileText}
        label="New Documents"
      />
    </div>
  )
}
```

## Hooks

### `useBadgeSync()`

Initialize badge sync on component mount:

```tsx
import { useBadgeSync } from '@/lib/use-badge-sync'

export function MyComponent() {
  useBadgeSync()
  
  return <div>Component with badge sync</div>
}
```

### `useBadgeSyncManual()`

Manually trigger badge sync:

```tsx
import { useBadgeSyncManual } from '@/lib/use-badge-sync'

export function MyComponent() {
  const syncBadges = useBadgeSyncManual()
  
  const handleRefresh = async () => {
    await syncBadges()
  }
  
  return (
    <button onClick={handleRefresh}>
      Refresh Badges
    </button>
  )
}
```

### `useBadgeCountWatch()`

Watch for badge count changes:

```tsx
import { useBadgeCountWatch } from '@/lib/use-badge-sync'

export function MyComponent() {
  useBadgeCountWatch((counts) => {
    console.log('Badge counts updated:', counts)
  })
  
  return <div>Watching badge counts</div>
}
```

## Styling & Design

### IPOReady Badge Colors

```typescript
const BADGE_COLORS = {
  alert: '#E8312A',      // Red - notifications, critical alerts
  warning: '#F97316',    // Orange - warnings, due-soon tasks
  success: '#10B981',    // Green - online status, completed items
  info: '#3B82F6',       // Blue - general info
  achievement: '#F59E0B', // Gold - achievements, milestones
  neutral: '#6B7280',    // Gray - offline, disabled states
}
```

### Responsive Design

All badge components are responsive and work on:
- Mobile (375px)
- Tablet (768px)
- Desktop (1280px+)

Components use relative sizing and adapt automatically.

### Accessibility

All badges include:
- `aria-label` attributes for screen readers
- Proper color contrast (WCAG AA+)
- Semantic HTML
- Keyboard accessible
- Focus indicators

## Performance

### Optimization Strategies

1. **Memoization** - All badge components use `React.memo()` to prevent unnecessary re-renders
2. **Debouncing** - Badge sync updates debounced at 100ms intervals
3. **Lazy Loading** - Badge data fetched on-demand via API
4. **Caching** - Last sync time tracked to avoid redundant requests
5. **Cross-Tab Sync** - BroadcastChannel prevents duplicate API calls

### Query Efficiency

Database queries use efficient counting:
```sql
-- Get unread notification count
SELECT COUNT(*) FROM notifications 
WHERE user_id = $1 AND read = false

-- Get overdue tasks
SELECT COUNT(*) FROM tasks 
WHERE user_id = $1 AND status != 'completed' AND due_date < NOW()

-- Get due-soon tasks (7 days)
SELECT COUNT(*) FROM tasks 
WHERE user_id = $1 AND status != 'completed' 
  AND due_date >= NOW() AND due_date < NOW() + INTERVAL '7 days'
```

## Testing

### Unit Tests

Test badge count calculations:

```tsx
import { calculateOverdueTasks, calculateDueSoonTasks } from '@/lib/badge-utils'

describe('Badge Utils', () => {
  it('calculates overdue tasks correctly', () => {
    const tasks = [
      { id: '1', dueDate: new Date(Date.now() - 1000).toISOString(), status: 'not_started' },
      { id: '2', dueDate: new Date(Date.now() + 1000).toISOString(), status: 'not_started' },
    ]
    expect(calculateOverdueTasks(tasks)).toBe(1)
  })
})
```

### Integration Tests

Test API endpoints:

```tsx
describe('Badge API', () => {
  it('GET /api/badges/counts returns correct counts', async () => {
    const response = await fetch('/api/badges/counts')
    const data = await response.json()
    
    expect(data).toHaveProperty('unreadNotifications')
    expect(data).toHaveProperty('overdueTasks')
    expect(data).toHaveProperty('dueSoonTasks')
  })
})
```

## Migration Guide

### From Old Badge System

If migrating from an existing badge system:

1. **Update imports:**
   ```tsx
   // Old
   import Badge from '@/components/Badge'
   
   // New
   import { NotificationBadge, TaskBadge } from '@/components/Badges'
   ```

2. **Update store usage:**
   ```tsx
   // Old
   const { badgeCount } = store
   
   // New
   const { unreadNotificationCount, overdueTaskCount } = store
   ```

3. **Add BadgeSyncProvider to layout**

4. **Update component props:**
   ```tsx
   // Old
   <Badge count={5} type="notification" />
   
   // New
   <NotificationBadge /> // Uses store automatically
   ```

## Troubleshooting

### Badge counts not updating

1. Check `BadgeSyncProvider` is in root layout
2. Verify database connection in `/api/badges/counts`
3. Check browser console for errors
4. Try manual sync with `useBadgeSyncManual()`

### Cross-tab sync not working

1. BroadcastChannel requires HTTPS or localhost
2. Check browser support (not available in private browsing)
3. Fallback to polling if unavailable

### Performance issues

1. Reduce sync frequency (adjust `BADGE_SYNC_INTERVAL_MS`)
2. Check for unnecessary re-renders with React DevTools
3. Verify database query performance

### Accessibility issues

1. Verify `aria-label` attributes are present
2. Test with screen readers (NVDA, JAWS)
3. Check color contrast with accessibility tools

## Future Enhancements

Planned features for badge system v2:

- [ ] Push notifications for badge updates
- [ ] Badge animations customization
- [ ] WebSocket support for real-time sync
- [ ] Badge grouping and collapse
- [ ] Custom badge creation API
- [ ] Advanced filtering/sorting
- [ ] A/B testing variants
- [ ] Analytics integration

## Support

For issues or questions about the badge system:

1. Check this documentation
2. Review component stories in Storybook
3. Check existing GitHub issues
4. Contact the dev team
