# Dashboard Menu Structure Integration Guide

## Overview

This guide explains the new Financial Management and Compliance menu structure, how it's organized, and how to integrate it into the existing AppShell component.

---

## Menu Architecture

### Semantic Navigation Groups

The menu is organized into **6 collapsible sections** with hierarchical navigation:

```
1. MISSION (non-collapsible)
   └── Dashboard
   └── IPO Checklist

2. WORK (non-collapsible)
   └── Cap Table
   └── Documents
   └── Prospectus Builder
   └── Templates & Forms

3. FINANCIAL MANAGEMENT (collapsible)
   ├── Cost & Planning
   │   ├── Cost Calculator (Calculator icon)
   │   └── Financial KPIs (TrendingUp icon)
   ├── Budgeting & Tracking
   │   ├── Budget Tracking (BarChart3 icon)
   │   └── Dilution Scenarios (Banknote icon)
   └── Strategy & Valuation
       ├── Pricing Strategy (DollarSign icon)
       └── Syndication (Users icon)

4. COMPLIANCE (collapsible)
   ├── Requirements & Rules
   │   ├── Listing Rules (Shield icon)
   │   └── Exchange Config (GitBranch icon)
   ├── Approvals & Consents
   │   ├── Corporate Resolutions (FileCheck icon)
   │   └── Consent Letters (CheckCircle icon)
   ├── Documentation
   │   ├── Syndication Templates (FileText icon)
   │   └── Regulatory Filings (Building2 icon)
   └── Monitoring
       └── Audit Trail (Eye icon)

5. LEARNING & SUPPORT (collapsible)
   └── Resource Centre
   └── Compliance Guide
   └── Expert Network

6. ACCOUNT & SETTINGS (collapsible)
   └── Team & Roles
   └── Integrations
   └── Account
   └── Notifications
```

---

## Financial Management Section Details

### Menu Items with Icons & Paths

| Label | Icon | Route | Description |
|-------|------|-------|-------------|
| Cost Calculator | `Calculator` | `/dashboard/financial-mgmt/cost-calculator` | Estimate IPO-related costs and fees |
| Budget Tracking | `BarChart3` | `/dashboard/financial-mgmt/tracking` | Track actual vs. budgeted expenses |
| Financial KPIs | `TrendingUp` | `/dashboard/financial-mgmt/financial-kpis` | Monitor key financial performance indicators |
| Dilution Scenarios | `BarChart3` | `/dashboard/financial-mgmt/dilution-scenarios` | Model ownership dilution scenarios |
| Syndication | `Users` | `/dashboard/financial-mgmt/syndication` | Manage investor syndication details |
| Pricing Strategy | `DollarSign` | `/dashboard/financial-mgmt/pricing` | IPO price range and valuation analysis |

### Hierarchy Structure

```typescript
FINANCIAL_MGMT_MENU = {
  root: '/dashboard/financial-mgmt',
  sections: [
    {
      id: 'estimation',
      label: 'Cost & Planning',
      icon: Calculator,
      items: [...]
    },
    {
      id: 'execution',
      label: 'Budgeting & Tracking',
      icon: BarChart3,
      items: [...]
    },
    {
      id: 'strategy',
      label: 'Strategy & Valuation',
      icon: TrendingUp,
      items: [...]
    }
  ]
}
```

---

## Compliance Section Details

### Menu Items with Icons & Paths

| Label | Icon | Route | Description |
|-------|------|-------|-------------|
| Listing Rules | `Shield` | `/dashboard/compliance/listing-rules` | Exchange-specific listing requirements |
| Corporate Resolutions | `FileCheck` | `/dashboard/compliance/resolutions` | Board resolutions and approvals |
| Consent Letters | `CheckCircle` | `/dashboard/compliance/consent-letters` | Shareholder and director consents |
| Syndication Templates | `FileText` | `/dashboard/compliance/syndication-templates` | Investor syndication letter templates |
| Regulatory Filings | `Building2` | `/dashboard/compliance/regulatory-filings` | SEC and regulatory submission tracking |
| Exchange Config | `GitBranch` | `/dashboard/compliance/exchange-config` | Exchange selection and configuration |
| Audit Trail | `Eye` | `/dashboard/compliance/audit-trail` | Track all compliance actions and approvals |

### Hierarchy Structure

```typescript
COMPLIANCE_MENU = {
  root: '/dashboard/compliance',
  sections: [
    {
      id: 'requirements',
      label: 'Requirements & Rules',
      icon: Shield,
      items: [...]
    },
    {
      id: 'approvals',
      label: 'Approvals & Consents',
      icon: CheckCircle,
      items: [...]
    },
    {
      id: 'documentation',
      label: 'Documentation',
      icon: FileText,
      items: [...]
    },
    {
      id: 'monitoring',
      label: 'Monitoring',
      icon: Eye,
      items: [...]
    }
  ]
}
```

---

## Icon Assignments

### Lucide-React Icons Used

#### Financial Management Icons
- `Calculator` - Cost Calculator
- `BarChart3` - Budget Tracking, Dilution Scenarios
- `TrendingUp` - Financial KPIs, Pricing Strategy
- `DollarSign` - Pricing Strategy
- `Users` - Syndication, Team Management
- `Banknote` - Dilution Scenarios, Financial items

#### Compliance Icons
- `Shield` - Listing Rules, Security/Protection
- `FileCheck` - Corporate Resolutions
- `CheckCircle` - Consent Letters, Approvals
- `FileText` - Syndication Templates, Documents
- `Building2` - Regulatory Filings, Corporate
- `GitBranch` - Exchange Config, Branching/Options
- `Eye` - Audit Trail, Monitoring

#### Other Icons (Already in Use)
- `LayoutDashboard` - Dashboard
- `CheckSquare` - IPO Checklist
- `PieChart` - Cap Table
- `Award` - Templates & Forms
- `BookOpen` - Resource Centre
- `FileSearch` - Compliance Guide
- `ShoppingBag` - Expert Network
- `Plug` - Integrations
- `Settings` - Account
- `BellRing` - Notifications

---

## Configuration File Structure

### File Location
```
src/config/navigation.ts
```

### Exported Types & Constants

```typescript
// Types
interface NavItem {
  href: string
  icon: LucideIcon
  label: string
  badge?: string | null
  key: string
  description?: string
}

interface NavGroup {
  section: string
  collapsible: boolean
  items: NavItem[]
  description?: string
}

// Constants
export const NAV_GROUPS: NavGroup[]
export const NAV_ITEMS: NavItem[]
export const FINANCIAL_MGMT_MENU: MenuHierarchy
export const COMPLIANCE_MENU: MenuHierarchy
export const DEFAULT_EXPANDED_SECTIONS: string[]

// Utility Functions
export function getNavItemByKey(key: string): NavItem | undefined
export function getNavItemsBySection(section: string): NavItem[]
export function isNavItemActive(pathname: string, navItem: NavItem): boolean
```

---

## Integration Steps

### Step 1: Update AppShell Imports

**Current (AppShell.tsx):**
```typescript
const NAV_GROUPS = [
  // ... hardcoded navigation
]
```

**Updated:**
```typescript
import {
  NAV_GROUPS,
  NAV_ITEMS,
  DEFAULT_EXPANDED_SECTIONS,
  getNavItemByKey,
  getNavItemsBySection,
  isNavItemActive,
  type NavItem,
  type NavGroup,
} from '@/config/navigation'
```

### Step 2: Update Lucide-React Imports

Add new icons to the import statement:

```typescript
import {
  // ... existing icons
  Calculator,
  BarChart3,
  FileCheck,
  Building2,
  GitBranch,
  Eye,
  // ... rest of icons
} from 'lucide-react'
```

### Step 3: Replace hardcoded NAV_GROUPS

Remove the hardcoded `NAV_GROUPS` constant and import from `@/config/navigation`.

### Step 4: Update Default Expanded Sections

Use the new constant:

```typescript
// OLD
const [expandedSections, setExpandedSections] = useState<string[]>([
  'MISSION', 'WORK', 'FINANCIAL MANAGEMENT', 'COMPLIANCE'
])

// NEW
const [expandedSections, setExpandedSections] = useState<string[]>(
  DEFAULT_EXPANDED_SECTIONS
)
```

### Step 5: Refactor Navigation Rendering

The rendering logic should work with minimal changes. If building submenu components, use the hierarchy structures:

```typescript
import { FINANCIAL_MGMT_MENU, COMPLIANCE_MENU } from '@/config/navigation'

// For Financial Management submenu
FINANCIAL_MGMT_MENU.sections.forEach(section => {
  // Render section header
  // Render section items
})

// For Compliance submenu
COMPLIANCE_MENU.sections.forEach(section => {
  // Render section header
  // Render section items
})
```

---

## Required Route Structure

### Financial Management Routes

Ensure these directories exist in `src/app/dashboard/financial-mgmt/`:

```
/dashboard/financial-mgmt/
├── /cost-calculator
│   └── page.tsx
├── /tracking
│   └── page.tsx
├── /financial-kpis
│   └── page.tsx
├── /dilution-scenarios
│   └── page.tsx
├── /syndication
│   └── page.tsx
├── /pricing
│   └── page.tsx
└── layout.tsx
```

**Status:** ✅ Cost Calculator and Tracking exist. Add remaining routes.

### Compliance Routes

Ensure these directories exist in `src/app/dashboard/compliance/`:

```
/dashboard/compliance/
├── /listing-rules
│   └── page.tsx (exists)
├── /resolutions
│   └── page.tsx (exists)
├── /consent-letters
│   └── page.tsx (exists)
├── /syndication-templates
│   └── page.tsx (exists)
├── /regulatory-filings
│   └── page.tsx (NEW)
├── /exchange-config
│   └── page.tsx (NEW)
├── /audit-trail
│   └── page.tsx (NEW)
└── layout.tsx
```

**Status:** ✅ Listing Rules, Resolutions, Consent, Syndication exist. Add remaining routes.

---

## State Management

### Section Expansion State

```typescript
const [expandedSections, setExpandedSections] = useState<string[]>(
  DEFAULT_EXPANDED_SECTIONS
)

// Load from localStorage on mount
useEffect(() => {
  const saved = localStorage.getItem('ipoready_expanded_nav_sections')
  if (saved) {
    try {
      setExpandedSections(JSON.parse(saved))
    } catch {
      // Keep defaults if parsing fails
    }
  }
}, [])

// Toggle section expansion
const toggleSection = (section: string) => {
  setExpandedSections(prev => {
    const updated = prev.includes(section)
      ? prev.filter(s => s !== section)
      : [...prev, section]
    localStorage.setItem('ipoready_expanded_nav_sections', JSON.stringify(updated))
    return updated
  })
}
```

### Active Route Detection

```typescript
const isActive = isNavItemActive(pathname, navItem)

// Visual feedback
const itemStyle = {
  background: isActive ? 'var(--color-bg-secondary)' : 'transparent',
  color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
}
```

---

## Badge System

### Supported Badges

| Badge | Purpose | Example |
|-------|---------|---------|
| `'AI'` | AI-powered feature | Cap Table |
| `'New'` | Newly released | N/A |
| `'Soon'` | Coming soon | N/A |
| `'IP'` | IP-protected feature | N/A |
| `'3'` | Count indicator | Integrations |

### Badge Styling

```typescript
function BadgeChip({ badge }: { badge: string }) {
  if (badge === 'AI')
    return (
      <span
        className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
        style={{
          background: 'var(--color-warning-soft)',
          color: 'var(--color-warning)'
        }}
      >
        {badge}
      </span>
    )
  // ... other badge types
}
```

---

## Customization Guide

### Adding a New Menu Item

1. Add to `NAV_GROUPS` in `src/config/navigation.ts`:

```typescript
{
  href: '/dashboard/financial-mgmt/new-feature',
  icon: SomeIcon,
  label: 'New Feature',
  badge: null,
  key: 'new-feature',
  description: 'Feature description',
}
```

2. Create the route file:

```bash
mkdir -p src/app/dashboard/financial-mgmt/new-feature
touch src/app/dashboard/financial-mgmt/new-feature/page.tsx
```

3. Import the icon in AppShell.tsx if it's a new icon type.

### Adding a New Section

1. Add to `NAV_GROUPS` array with new `section` name
2. Set `collapsible: true` or `false`
3. Add to `DEFAULT_EXPANDED_SECTIONS` if should be expanded by default

---

## Testing Checklist

- [ ] Menu renders without errors
- [ ] All icons display correctly
- [ ] Collapsible sections expand/collapse
- [ ] Expanded state persists in localStorage
- [ ] Active route highlighting works
- [ ] Badges render properly
- [ ] Mobile responsiveness (sidebar collapse)
- [ ] All routes in NAV_GROUPS exist and are accessible
- [ ] No console warnings or errors
- [ ] Click navigation works for all items

---

## Files Reference

### Configuration
- `src/config/navigation.ts` - Navigation configuration and types

### Component Updates
- `src/components/layout/AppShell.tsx` - Main component (update with imports)
- `src/components/layout/AppShell-Updated.tsx` - Reference implementation

### Required Routes (Create if missing)
- `src/app/dashboard/financial-mgmt/financial-kpis/page.tsx`
- `src/app/dashboard/financial-mgmt/dilution-scenarios/page.tsx`
- `src/app/dashboard/financial-mgmt/pricing/page.tsx`
- `src/app/dashboard/financial-mgmt/syndication/page.tsx`
- `src/app/dashboard/compliance/regulatory-filings/page.tsx`
- `src/app/dashboard/compliance/exchange-config/page.tsx`
- `src/app/dashboard/compliance/audit-trail/page.tsx`

---

## Notes

- **Bilingual Support**: Menu labels are ready for i18n integration
- **Icon Library**: All icons from `lucide-react`
- **TypeScript**: Fully typed with strict mode
- **Performance**: Navigation state cached in localStorage
- **Accessibility**: Semantic HTML with proper ARIA labels (can be enhanced)
- **Responsive**: Sidebar collapses on mobile, menu remains accessible

---

## Next Steps

1. Copy `src/config/navigation.ts` to your project
2. Update AppShell.tsx imports (see Step 1-2 above)
3. Create missing route files for new sections
4. Test menu navigation and state persistence
5. Optional: Integrate i18n for bilingual support
6. Optional: Add breadcrumb navigation using active path detection
