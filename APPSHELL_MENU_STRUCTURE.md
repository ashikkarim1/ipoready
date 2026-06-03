# AppShell Menu Structure - Visual Reference

## Navigation Hierarchy

```
IPOReady Sidebar Navigation
├── MISSION (Not Collapsible)
│   ├── 📊 Dashboard → /dashboard
│   └── ✓ IPO Checklist → /checklist
│
├── WORK (Not Collapsible)
│   ├── 📈 Cap Table [AI] → /cap-table
│   ├── 📄 Documents → /documents
│   ├── 📄 Prospectus Builder [✨] → /prospectus
│   └── 🏆 Templates & Forms → /templates
│
├── FINANCIAL MANAGEMENT (Collapsible) ✨ NEW
│   ├── 🧮 Cost Calculator → /cost-calculator
│   ├── 📊 Financial Dashboard → /financial-dashboard
│   └── % Dilution Scenarios → /dilution-scenarios
│
├── COMPLIANCE (Collapsible) ⭐ UPDATED
│   ├── ⚖️ Listing Rules → /listing-rules
│   ├── ✓ Corporate Resolutions → /resolutions
│   ├── ✍️ Consent Workflow → /consent-workflow
│   └── 🔄 Syndication Templates → /syndication
│
├── LEARNING & COMPLIANCE (Collapsible)
│   ├── 📖 Resource Centre → /resources
│   ├── 🔍 Compliance Guide → /checklist-guide
│   └── 🛍️ Expert Network → /marketplace
│
└── ACCOUNT & SETTINGS (Collapsible)
    ├── 👥 Team & Roles → /team
    ├── 🔌 Integrations [3] → /integrations
    ├── ⚙️ Account → /account
    └── 🔔 Notifications → /notifications
```

## Icon Legend

| Icon | Name | Usage | Lucide Name |
|------|------|-------|-------------|
| 🧮 | Calculator | Cost Calculator | Calculator |
| 📊 | Bar Chart (3 bars) | Financial Dashboard | BarChart3 |
| % | Percent | Dilution Scenarios | Percent |
| ⚖️ | Scale | Listing Rules | Scale |
| ✓ | File Check | Corporate Resolutions | FileCheck |
| ✍️ | Signature | Consent Workflow | Signature |
| 🔄 | Share (2 arrows) | Syndication Templates | Share2 |

## State Management

### Collapsible Section State
```javascript
expandedSections = [
  'MISSION',              // Locked open (not collapsible)
  'WORK',                 // Locked open (not collapsible)
  'FINANCIAL MANAGEMENT', // Toggleable ✨ NEW
  'COMPLIANCE',           // Toggleable ⭐ UPDATED
  'LEARNING & COMPLIANCE',// Toggleable
  'ACCOUNT & SETTINGS',   // Toggleable
]
```

### localStorage Key
```
ipoready_expanded_nav_sections = JSON.stringify(expandedSections)
```

**Behavior**:
- Saves to localStorage when section toggled
- Loads from localStorage on page mount
- Persists across page reloads
- Defaults included for new sections

## Route Paths

### Financial Management Routes
| Menu Item | Route | Status |
|-----------|-------|--------|
| Cost Calculator | `/cost-calculator` | ⏳ Needs page.tsx |
| Financial Dashboard | `/financial-dashboard` | ⏳ Needs page.tsx |
| Dilution Scenarios | `/dilution-scenarios` | ⏳ Needs page.tsx |

### Compliance Routes
| Menu Item | Route | Status |
|-----------|-------|--------|
| Listing Rules | `/listing-rules` | ⏳ Needs page.tsx |
| Corporate Resolutions | `/resolutions` | ⏳ Needs page.tsx |
| Consent Workflow | `/consent-workflow` | ⏳ Needs page.tsx |
| Syndication Templates | `/syndication` | ⏳ Needs page.tsx |

## Design System Integration

### Colors (CSS Variables)
```css
--color-text-primary        /* Main text */
--color-text-secondary      /* Secondary text */
--color-text-tertiary       /* Tertiary text / icons */
--color-text-muted          /* Muted text */
--color-stroke-dark         /* Border/divider */
--color-surface-light       /* Hover background */
--color-accent              /* Active/highlight color */
```

### Spacing
```
Icon Container:    32px × 32px
Icon Size:         16px × 16px
Label Font Size:   13px
Label Weight:      500
Padding:          10px 10px
Border Radius:     8px (icon), 10px (item)
Gap between items: 2px margin-bottom
```

### Typography
- **Section Header**: 11px, weight 700, uppercase, letter-spacing 0.08em
- **Menu Item Label**: 13px, weight 500
- **Badge**: 10px, weight 700, borderRadius 20px

## Mobile Behavior

### On Mobile/Tablet
- Sidebar opens as overlay/slide-out
- Hamburger menu button (3 lines icon)
- Close button (X) visible
- Full-width menu overlay
- Touch-friendly padding

### Responsive Breakpoints
- Desktop: Full sidebar visible
- Tablet: Collapsible sidebar
- Mobile: Hidden by default, hamburger menu

## Active State Detection

Uses `usePathname()` hook from Next.js:
```javascript
const pathname = usePathname()

// Example matching logic:
pathname === '/cost-calculator' → Highlight Cost Calculator
pathname === '/financial-dashboard' → Highlight Financial Dashboard
// etc.
```

## Badge System

Currently all badges are `null`, but system supports:

| Badge | Style | Usage |
|-------|-------|-------|
| `'AI'` | Yellow background | AI-powered features |
| `'New'` | Red background | New features |
| `'Soon'` | Gray background | Coming soon |
| Number `'3'` | Blue background | Notification count |
| `null` | None | Standard items |

### Adding Badges
```typescript
{ 
  href: '/cost-calculator',
  icon: Calculator,
  label: 'Cost Calculator',
  badge: 'New',  // ← Add badge value here
  key: 'cost-calc'
}
```

## Animation & Transitions

### Framer Motion Integration
- Sidebar slide-in/out animation
- Section expand/collapse animation
- Hover state transitions (color fade)
- Stagger effect for menu items

### Timing
- Duration: 0.25s - 0.3s
- Easing: EaseInOut
- Opacity fade: Yes
- Scale transform: Slight (0.98-1.0)

## Accessibility Features

- Semantic HTML (`<Link>`, `<button>`)
- Icon labels (alt text from label prop)
- Keyboard navigation support (next/link)
- ARIA labels for sections
- Color contrast meets WCAG AA
- Focus states visible

## Data Flow

```
AppShell Component
├── NAV_GROUPS (Static Config)
├── usePathname() → Active route detection
├── expandedSections (State)
├── localStorage (Persistence)
└── NAV_ITEMS (Flat for badges)
    ↓
Sidebar Rendering
├── Group Header (with collapse toggle)
├── Conditional Item Rendering (if expanded)
├── Link Component (navigation)
└── Icon + Label + Badge
```

## File References

- **Component**: `/src/components/layout/AppShell.tsx`
- **Icons**: From `lucide-react` package
- **State Management**: Zustand store (`/src/store/app-store`)
- **Navigation**: Next.js Link & usePathname
- **Animations**: Framer Motion

## Browser DevTools Check

To inspect active section state:
```javascript
// In browser console:
localStorage.getItem('ipoready_expanded_nav_sections')

// Returns:
'["MISSION","WORK","FINANCIAL MANAGEMENT","COMPLIANCE","LEARNING & COMPLIANCE","ACCOUNT & SETTINGS"]'
```
