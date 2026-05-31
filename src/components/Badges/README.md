# Badge Components

Complete badge system for IPOReady with real-time synchronization, animations, and accessibility features.

## Components

### NotificationBadge
Shows unread notification count with pulse animation.
```tsx
import { NotificationBadge } from '@/components/Badges'

<NotificationBadge
  onClick={() => navigate('/notifications')}
  showLabel={true}
/>
```

**Props:**
- `onClick?: () => void` - Click handler
- `className?: string` - Additional CSS classes
- `showLabel?: boolean` - Show "X new" text label (default: false)

---

### TaskBadge
Displays overdue and/or due-soon task counts.
```tsx
import { TaskBadge } from '@/components/Badges'

<TaskBadge variant="combined" />
<TaskBadge variant="overdue" compact={false} />
<TaskBadge variant="due-soon" />
```

**Props:**
- `variant?: 'overdue' | 'due-soon' | 'combined'` - Badge variant (default: 'combined')
- `compact?: boolean` - Compact display (default: false)
- `showIcon?: boolean` - Show alert icon (default: true)
- `className?: string` - Additional CSS classes

---

### AchievementBadge
Shows newly unlocked milestones/achievements.
```tsx
import { AchievementBadge } from '@/components/Badges'

<AchievementBadge
  compact={false}
  onClick={handleAchievementClick}
/>
```

**Props:**
- `compact?: boolean` - Compact display (default: false)
- `showIcon?: boolean` - Show trophy icon (default: true)
- `className?: string` - Additional CSS classes
- `onClick?: () => void` - Click handler

---

### ActivityBadge
Displays user activity status (online/idle/offline).
```tsx
import { ActivityBadge } from '@/components/Badges'

<ActivityBadge
  status="online"
  showLabel={true}
  size="md"
/>
```

**Props:**
- `status: 'online' | 'idle' | 'offline'` - User status
- `showLabel?: boolean` - Show status text (default: false)
- `className?: string` - Additional CSS classes
- `size?: 'sm' | 'md' | 'lg'` - Badge size (default: 'md')

---

### CountBadge
Generic count badge with multiple variants.
```tsx
import { CountBadge } from '@/components/Badges'
import { FileText } from 'lucide-react'

<CountBadge
  count={5}
  variant="pill"
  bgColor="#3B82F6"
  icon={FileText}
  label="Documents"
  size="md"
/>
```

**Props:**
- `count: number` - Count to display
- `variant?: 'dot' | 'badge' | 'pill' | 'minimal'` - Display variant (default: 'badge')
- `bgColor?: string` - Background color hex (default: '#E8312A')
- `textColor?: string` - Text color hex (default: '#FFFFFF')
- `icon?: LucideIcon` - Optional icon component
- `label?: string` - Label text
- `maxCount?: number` - Max count before showing "+X" (default: 99)
- `animated?: boolean` - Animate entrance (default: true)
- `className?: string` - Additional CSS classes
- `onClick?: () => void` - Click handler
- `size?: 'sm' | 'md' | 'lg'` - Badge size (default: 'md')

---

## Design Tokens

### Colors
```
Alert:       #E8312A (Red)
Warning:     #F97316 (Orange)
Success:     #10B981 (Green)
Info:        #3B82F6 (Blue)
Achievement: #F59E0B (Gold)
Neutral:     #6B7280 (Gray)
```

### Animations
- **Entrance**: Spring animation (stiffness: 400, damping: 15)
- **Pulse**: 2s infinite loop for active badges
- **Hover**: 1.1x scale on hover
- **Tap**: 0.95x scale on click

---

## Accessibility

All components include:
- ✅ ARIA labels
- ✅ Proper color contrast (WCAG AA+)
- ✅ Semantic HTML
- ✅ Keyboard navigation
- ✅ Focus indicators

---

## Performance

- Memoized components (`React.memo`)
- Optimized re-renders
- Efficient animations
- No unnecessary DOM updates

---

## Integration Example

```tsx
import { NotificationBadge, TaskBadge } from '@/components/Badges'

export function Header() {
  return (
    <header className="flex items-center justify-between p-4">
      <h1>IPOReady</h1>
      <div className="flex items-center gap-4">
        <NotificationBadge />
        <TaskBadge variant="overdue" compact={true} />
      </div>
    </header>
  )
}
```

---

## Variants

### NotificationBadge
- Count display: 0-99, shows "99+" for 100+
- Animated pulse when count > 0
- Link to `/notifications` on click

### TaskBadge
- **overdue**: Red badge (critical)
- **due-soon**: Orange badge (warning)
- **combined**: Both badges if applicable

### AchievementBadge
- Gold background
- Trophy icon
- Animated entrance

### ActivityBadge
- **online**: Green with pulse
- **idle**: Yellow
- **offline**: Gray

### CountBadge
- **dot**: Colored circle
- **badge**: Rounded badge with number
- **pill**: Larger button-like badge
- **minimal**: Just the number

---

See `examples.tsx` for comprehensive usage examples across different pages and contexts.
