# AppShell Code Reference - Dashboard Menu Integration

## File: src/components/layout/AppShell.tsx

### 1. Icon Imports (Lines 7-15)

**Updated Icons Added**:
```typescript
import {
  Rocket, LayoutDashboard, CheckSquare, FileText, Users, ShoppingBag,
  DollarSign, Settings, Bell, ChevronDown, LogOut, Menu, X, Building2,
  Award, ChevronRight, Zap, PieChart, Banknote, Gift, BookOpen,
  CreditCard, Shield, Flame, HelpCircle, ExternalLink, TrendingUp,
  AlertTriangle, RefreshCcw, Activity, Plug, BellRing, Store, FileSearch,
  CheckCheck, Clock, Calculator, Target, CheckCircle, Percent, Briefcase,
  FileCheck, Scale, Signature, Share2, BarChart3
} from 'lucide-react'
```

**New Icons**:
- `Calculator` - for Cost Calculator
- `BarChart3` - for Financial Dashboard
- `Percent` - for Dilution Scenarios
- `Scale` - for Listing Rules
- `FileCheck` - for Corporate Resolutions
- `Signature` - for Consent Workflow
- `Share2` - for Syndication Templates

---

### 2. NAV_GROUPS Configuration (Lines 18-70)

#### FINANCIAL MANAGEMENT Section (Lines 38-46)

```typescript
{
  section: 'FINANCIAL MANAGEMENT',
  collapsible: true,
  items: [
    { href: '/cost-calculator',           icon: Calculator,  label: 'Cost Calculator',      badge: null,   key: 'cost-calc'      },
    { href: '/financial-dashboard',       icon: BarChart3,   label: 'Financial Dashboard',  badge: null,   key: 'financial-dash' },
    { href: '/dilution-scenarios',        icon: Percent,     label: 'Dilution Scenarios',   badge: null,   key: 'dilution'       },
  ],
},
```

**Properties**:
- `section`: 'FINANCIAL MANAGEMENT' - Display name in sidebar
- `collapsible`: true - Section can expand/collapse
- `items`: Array of navigation items
  - `href`: Route path (clean URLs at root level)
  - `icon`: Lucide icon component
  - `label`: Display text
  - `badge`: Optional badge value (null for standard items)
  - `key`: Unique identifier for tracking

#### COMPLIANCE Section (Lines 47-55)

```typescript
{
  section: 'COMPLIANCE',
  collapsible: true,
  items: [
    { href: '/listing-rules',             icon: Scale,       label: 'Listing Rules',         badge: null,   key: 'listing-rules'  },
    { href: '/resolutions',               icon: FileCheck,   label: 'Corporate Resolutions', badge: null,   key: 'resolutions'    },
    { href: '/consent-workflow',          icon: Signature,   label: 'Consent Workflow',      badge: null,   key: 'consent'        },
    { href: '/syndication',               icon: Share2,      label: 'Syndication Templates', badge: null,   key: 'syndication'    },
  ],
},
```

**Properties** (same as FINANCIAL MANAGEMENT):
- 4 items instead of 3
- Added Syndication Templates as new item
- All routes are direct (/listing-rules) not nested

---

### 3. Existing State & Logic (Lines 146-160)

The component already handles:

```typescript
// Collapsible sections state with localStorage persistence
const [expandedSections, setExpandedSections] = useState<string[]>(
  ['MISSION', 'WORK', 'FINANCIAL MANAGEMENT', 'COMPLIANCE']
)

useEffect(() => {
  // Load from localStorage on mount
  const saved = localStorage.getItem('ipoready_expanded_nav_sections')
  if (saved) {
    try {
      setExpandedSections(JSON.parse(saved))
    } catch {
      // If parsing fails, keep defaults
    }
  }
}, [])

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

**Already Integrated**:
- Default expand state includes both new sections
- localStorage persistence works automatically
- toggleSection function handles collapse/expand
- No changes needed - works out of the box

---

### 4. Navigation Rendering (Already Implemented)

The component renders NAV_GROUPS automatically around line 500+:

```typescript
{NAV_GROUPS.map((group) => (
  <div key={group.section} style={...}>
    {/* Group header with optional collapse toggle */}
    {/* Conditional rendering of items based on expandedSections */}
    {expandedSections.includes(group.section) && (
      <div>
        {group.items.map((item) => (
          <Link key={item.key} href={item.href} ...>
            {/* Icon + Label + Badge rendering */}
          </Link>
        ))}
      </div>
    )}
  </div>
))}
```

---

## Routing Implementation Guide

### Required New Route Files

Create these Next.js page components:

#### 1. Cost Calculator
**File**: `src/app/cost-calculator/page.tsx`
```typescript
export const metadata = { title: 'Cost Calculator | IPOReady' }
export default function CostCalculatorPage() {
  return <div>{/* Cost Calculator content */}</div>
}
```

#### 2. Financial Dashboard
**File**: `src/app/financial-dashboard/page.tsx`
```typescript
export const metadata = { title: 'Financial Dashboard | IPOReady' }
export default function FinancialDashboardPage() {
  return <div>{/* Financial Dashboard content */}</div>
}
```

#### 3. Dilution Scenarios
**File**: `src/app/dilution-scenarios/page.tsx`
```typescript
export const metadata = { title: 'Dilution Scenarios | IPOReady' }
export default function DilutionScenariosPage() {
  return <div>{/* Dilution Scenarios content */}</div>
}
```

#### 4. Listing Rules
**File**: `src/app/listing-rules/page.tsx`
```typescript
export const metadata = { title: 'Listing Rules | IPOReady' }
export default function ListingRulesPage() {
  return <div>{/* Listing Rules content */}</div>
}
```

#### 5. Corporate Resolutions
**File**: `src/app/resolutions/page.tsx`
```typescript
export const metadata = { title: 'Corporate Resolutions | IPOReady' }
export default function ResolutionsPage() {
  return <div>{/* Resolutions content */}</div>
}
```

#### 6. Consent Workflow
**File**: `src/app/consent-workflow/page.tsx`
```typescript
export const metadata = { title: 'Consent Workflow | IPOReady' }
export default function ConsentWorkflowPage() {
  return <div>{/* Consent Workflow content */}</div>
}
```

#### 7. Syndication Templates
**File**: `src/app/syndication/page.tsx`
```typescript
export const metadata = { title: 'Syndication Templates | IPOReady' }
export default function SyndicationPage() {
  return <div>{/* Syndication content */}</div>
}
```

---

## Summary of Changes

| Aspect | Status | Details |
|--------|--------|---------|
| Icon Imports | ✅ Complete | 7 new icons imported |
| NAV_GROUPS Config | ✅ Complete | 2 sections + 7 items added |
| Routing Paths | ✅ Complete | Clean URLs defined |
| Collapse Logic | ✅ Automatic | No changes needed |
| localStorage | ✅ Automatic | Already persists new sections |
| Styling | ✅ Consistent | Uses existing CSS patterns |
| Route Files | ⏳ To Do | 7 page.tsx files needed |

---

## Testing Commands

```bash
# Verify file syntax
npm run build

# Test navigation in browser
npm run dev

# Check component renders without errors
npm test src/components/layout/AppShell.tsx
```
