# Financial Management & Compliance Menu - Quick Reference

## Menu Hierarchy at a Glance

```
DASHBOARD NAVIGATION
├─ MISSION (core)
│  ├─ Dashboard 📊
│  └─ IPO Checklist ✓
│
├─ WORK (core)
│  ├─ Cap Table 📈
│  ├─ Documents 📄
│  ├─ Prospectus Builder ✨
│  └─ Templates & Forms 🏆
│
├─ FINANCIAL MANAGEMENT [▼ collapsible]
│  ├─ Cost Calculator 🧮
│  ├─ Budget Tracking 📊
│  ├─ Financial KPIs 📈
│  ├─ Dilution Scenarios 📈
│  ├─ Syndication 👥
│  └─ Pricing Strategy 💵
│
├─ COMPLIANCE [▼ collapsible]
│  ├─ Listing Rules 🛡️
│  ├─ Corporate Resolutions ✓
│  ├─ Consent Letters ✔️
│  ├─ Syndication Templates 📄
│  ├─ Regulatory Filings 🏢
│  ├─ Exchange Config 🔀
│  └─ Audit Trail 👁️
│
├─ LEARNING & SUPPORT [▼ collapsible]
│  ├─ Resource Centre 📚
│  ├─ Compliance Guide 🔍
│  └─ Expert Network 🛍️
│
└─ ACCOUNT & SETTINGS [▼ collapsible]
   ├─ Team & Roles 👥
   ├─ Integrations 🔌 (badge: 3)
   ├─ Account ⚙️
   └─ Notifications 🔔
```

---

## Icon Map (Lucide React)

### Financial Management
| Item | Icon | Lucide Name |
|------|------|------------|
| Cost Calculator | 🧮 | `Calculator` |
| Budget Tracking | 📊 | `BarChart3` |
| Financial KPIs | 📈 | `TrendingUp` |
| Dilution Scenarios | 📈 | `BarChart3` |
| Syndication | 👥 | `Users` |
| Pricing Strategy | 💵 | `DollarSign` |

### Compliance
| Item | Icon | Lucide Name |
|------|------|------------|
| Listing Rules | 🛡️ | `Shield` |
| Corporate Resolutions | ✓ | `FileCheck` |
| Consent Letters | ✔️ | `CheckCircle` |
| Syndication Templates | 📄 | `FileText` |
| Regulatory Filings | 🏢 | `Building2` |
| Exchange Config | 🔀 | `GitBranch` |
| Audit Trail | 👁️ | `Eye` |

---

## Routes Mapping

### Financial Management Routes
```
/dashboard/financial-mgmt/
├── cost-calculator        → Calculate IPO costs
├── tracking              → Budget vs. Actuals
├── financial-kpis        → Key metrics
├── dilution-scenarios    → Ownership modeling
├── syndication           → Investor setup
└── pricing               → Valuation & pricing
```

### Compliance Routes
```
/dashboard/compliance/
├── listing-rules         → Exchange requirements ✅ EXISTS
├── resolutions          → Board approvals ✅ EXISTS
├── consent-letters      → Shareholder consents ✅ EXISTS
├── syndication-templates → Investor letters ✅ EXISTS
├── regulatory-filings   → SEC filings 🔨 NEW
├── exchange-config      → Exchange setup 🔨 NEW
└── audit-trail          → Action history 🔨 NEW
```

---

## TypeScript Types

### NavItem
```typescript
interface NavItem {
  href: string              // Route path
  icon: LucideIcon          // Icon component
  label: string             // Display label
  badge?: string | null     // Optional badge
  key: string               // Unique identifier
  description?: string      // Tooltip/help text
}
```

### NavGroup
```typescript
interface NavGroup {
  section: string           // Section name
  collapsible: boolean      // Can collapse?
  items: NavItem[]          // Menu items
  description?: string      // Section description
}
```

---

## Integration Checklist

- [ ] Copy `src/config/navigation.ts` to project
- [ ] Update AppShell.tsx imports
  - [ ] Remove hardcoded `NAV_GROUPS`
  - [ ] Add `import { NAV_GROUPS, ... } from '@/config/navigation'`
  - [ ] Add new icon imports: Calculator, BarChart3, FileCheck, Building2, GitBranch, Eye
- [ ] Create missing route files (see REQUIRED_ROUTES_TEMPLATE.md)
  - [ ] /dashboard/financial-mgmt/financial-kpis/page.tsx
  - [ ] /dashboard/financial-mgmt/dilution-scenarios/page.tsx
  - [ ] /dashboard/financial-mgmt/pricing/page.tsx
  - [ ] /dashboard/financial-mgmt/syndication/page.tsx
  - [ ] /dashboard/compliance/regulatory-filings/page.tsx
  - [ ] /dashboard/compliance/exchange-config/page.tsx
  - [ ] /dashboard/compliance/audit-trail/page.tsx
- [ ] Test navigation in app
  - [ ] All items clickable
  - [ ] Active state highlighting works
  - [ ] Sections expand/collapse
  - [ ] State persists in localStorage
- [ ] Add API endpoints for data fetching
- [ ] Implement page content for each route
- [ ] Test on mobile (sidebar collapse)

---

## Key Features

### Smart Features Included
✅ **Collapsible sections** with localStorage persistence  
✅ **Active route detection** with visual feedback  
✅ **Badge system** (AI, New, Soon, etc.)  
✅ **Icons for every item** using lucide-react  
✅ **Description tooltips** on hover  
✅ **Semantic grouping** by functionality  
✅ **TypeScript fully typed**  
✅ **Mobile responsive** (sidebar collapses)  
✅ **Bilingual ready** (labels can be i18n'd)  

---

## File Locations

```
src/
├── config/
│   └── navigation.ts                    # Configuration (NEW)
├── components/
│   └── layout/
│       ├── AppShell.tsx                 # UPDATE with new imports
│       └── AppShell-Updated.tsx         # Reference implementation
└── app/
    └── dashboard/
        ├── financial-mgmt/
        │   ├── cost-calculator/         # ✅ EXISTS
        │   ├── tracking/                # ✅ EXISTS
        │   ├── financial-kpis/          # 🔨 CREATE
        │   ├── dilution-scenarios/      # 🔨 CREATE
        │   ├── pricing/                 # 🔨 CREATE
        │   ├── syndication/             # 🔨 CREATE
        │   └── layout.tsx
        └── compliance/
            ├── listing-rules/           # ✅ EXISTS
            ├── resolutions/             # ✅ EXISTS
            ├── consent-letters/         # ✅ EXISTS
            ├── syndication-templates/   # ✅ EXISTS
            ├── regulatory-filings/      # 🔨 CREATE
            ├── exchange-config/         # 🔨 CREATE
            ├── audit-trail/             # 🔨 CREATE
            └── layout.tsx
```

---

## Customization Examples

### Add New Menu Item

1. **Update `src/config/navigation.ts`:**
```typescript
{
  href: '/dashboard/financial-mgmt/new-item',
  icon: SomeIcon,
  label: 'New Item',
  badge: null,
  key: 'new-item',
  description: 'Description here',
}
```

2. **Create route file:**
```bash
mkdir -p src/app/dashboard/financial-mgmt/new-item
touch src/app/dashboard/financial-mgmt/new-item/page.tsx
```

### Expand New Section

Add to `NAV_GROUPS` array with a new `section` name and set `collapsible: true`.

### Change Icon

Update the `icon` property in the NavItem configuration.

---

## Testing Checklist

```
Navigation
- [ ] Menu renders without errors
- [ ] All 6 sections display correctly
- [ ] Non-collapsible sections (MISSION, WORK) always expanded
- [ ] Collapsible sections can toggle
- [ ] Expansion state persists in localStorage

Routing
- [ ] All links navigate correctly
- [ ] Active route is highlighted
- [ ] Sidebar closes on mobile (click item)

Icons & Styling
- [ ] All icons display correctly
- [ ] Badges render properly
- [ ] Colors use CSS variables correctly
- [ ] Hover states work on menu items

Responsive
- [ ] Desktop: full sidebar visible
- [ ] Mobile: sidebar collapses/expands
- [ ] Menu items fit properly on all sizes
- [ ] No horizontal scroll needed
```

---

## Performance Notes

- Navigation configuration is static (no re-renders)
- Active route detection uses `pathname` from Next.js
- Section state stored in localStorage (not DB)
- No external API calls for navigation
- Optimized for tree-shaking (imports individual icons)

---

## Future Enhancements

- [ ] Add breadcrumb navigation
- [ ] Implement search within menu items
- [ ] Add keyboard shortcuts (e.g., Cmd+K to search)
- [ ] Analytics tracking for menu usage
- [ ] Personalized menu (reorder items by user preference)
- [ ] Add notifications badge to individual items
- [ ] Implement role-based menu visibility
- [ ] Add menu favorites/pinning

---

## Support & Documentation

- **Config File:** `src/config/navigation.ts`
- **Integration Guide:** `MENU_INTEGRATION_GUIDE.md`
- **Route Templates:** `REQUIRED_ROUTES_TEMPLATE.md`
- **Reference Component:** `src/components/layout/AppShell-Updated.tsx`

---

## Quick Copy-Paste Commands

Create missing directories:
```bash
mkdir -p src/app/dashboard/financial-mgmt/{financial-kpis,dilution-scenarios,pricing,syndication}
mkdir -p src/app/dashboard/compliance/{regulatory-filings,exchange-config,audit-trail}
```

---

## Questions?

Refer to:
1. **MENU_INTEGRATION_GUIDE.md** - Detailed integration steps
2. **REQUIRED_ROUTES_TEMPLATE.md** - Page implementation templates
3. **src/config/navigation.ts** - Configuration reference
4. **AppShell-Updated.tsx** - Example implementation

---
