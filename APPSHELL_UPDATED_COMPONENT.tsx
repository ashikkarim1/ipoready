// ============================================================================
// UPDATED: src/components/layout/AppShell.tsx
// Dashboard Menu Integration - Financial Management & Compliance Sections
// ============================================================================

// CHANGES MADE:
// 1. Added icon imports: Calculator, BarChart3, Percent, Scale, FileCheck, 
//    Signature, Share2
// 2. Updated NAV_GROUPS with new FINANCIAL MANAGEMENT section (3 items)
// 3. Updated NAV_GROUPS with expanded COMPLIANCE section (4 items)
// 4. All routing paths use clean root-level URLs

// ============================================================================
// KEY SECTION: Icon Imports (Lines 7-15)
// ============================================================================

import {
  Rocket, LayoutDashboard, CheckSquare, FileText, Users, ShoppingBag,
  DollarSign, Settings, Bell, ChevronDown, LogOut, Menu, X, Building2,
  Award, ChevronRight, Zap, PieChart, Banknote, Gift, BookOpen,
  CreditCard, Shield, Flame, HelpCircle, ExternalLink, TrendingUp,
  AlertTriangle, RefreshCcw, Activity, Plug, BellRing, Store, FileSearch,
  CheckCheck, Clock, Calculator, Target, CheckCircle, Percent, Briefcase,
  FileCheck, Scale, Signature, Share2, BarChart3  // NEW ICONS
} from 'lucide-react'

// ============================================================================
// KEY SECTION: NAV_GROUPS Configuration (Lines 20-70)
// ============================================================================

const NAV_GROUPS = [
  {
    section: 'MISSION',
    collapsible: false,
    items: [
      { href: '/dashboard',       icon: LayoutDashboard, label: 'Dashboard',          badge: null,   key: 'dashboard'   },
      { href: '/checklist',       icon: CheckSquare,     label: 'IPO Checklist',      badge: null,   key: 'checklist'   },
    ],
  },
  {
    section: 'WORK',
    collapsible: false,
    items: [
      { href: '/cap-table',       icon: PieChart,        label: 'Cap Table',          badge: 'AI',   key: 'cap-table'   },
      { href: '/documents',       icon: FileText,        label: 'Documents',          badge: null,   key: 'documents'   },
      { href: '/prospectus',      icon: FileText,        label: 'Prospectus Builder', badge: '✨',   key: 'prospectus'  },
      { href: '/templates',       icon: Award,           label: 'Templates & Forms',  badge: null,   key: 'templates'   },
    ],
  },
  // NEW SECTION: FINANCIAL MANAGEMENT
  {
    section: 'FINANCIAL MANAGEMENT',
    collapsible: true,
    items: [
      { href: '/cost-calculator',           icon: Calculator,  label: 'Cost Calculator',      badge: null,   key: 'cost-calc'      },
      { href: '/financial-dashboard',       icon: BarChart3,   label: 'Financial Dashboard',  badge: null,   key: 'financial-dash' },
      { href: '/dilution-scenarios',        icon: Percent,     label: 'Dilution Scenarios',   badge: null,   key: 'dilution'       },
    ],
  },
  // UPDATED SECTION: COMPLIANCE (expanded from 3 to 4 items)
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
  {
    section: 'LEARNING & COMPLIANCE',
    collapsible: true,
    items: [
      { href: '/resources',       icon: BookOpen,        label: 'Resource Centre',    badge: null,   key: 'resources'   },
      { href: '/checklist-guide', icon: FileSearch,      label: 'Compliance Guide',   badge: null,   key: 'guide'       },
      { href: '/marketplace',     icon: ShoppingBag,     label: 'Expert Network',     badge: null,   key: 'marketplace' },
    ],
  },
  {
    section: 'ACCOUNT & SETTINGS',
    collapsible: true,
    items: [
      { href: '/team',            icon: Users,           label: 'Team & Roles',       badge: null,   key: 'team'        },
      { href: '/integrations',    icon: Plug,            label: 'Integrations',       badge: '3',    key: 'integrations'},
      { href: '/account',         icon: Settings,        label: 'Account',            badge: null,   key: 'account'     },
      { href: '/notifications',   icon: BellRing,        label: 'Notifications',      badge: null,   key: 'notifs'      },
    ],
  },
]

// ============================================================================
// EXISTING STATE HANDLING (No Changes Required - Already Works)
// ============================================================================

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { 
    company, currency, language, setCurrency, setLanguage, 
    sidebarOpen, toggleSidebar, setCompany, setUserPlan 
  } = useAppStore()

  // Collapsible sections state with localStorage persistence
  // Already includes FINANCIAL MANAGEMENT and COMPLIANCE in default state
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

  // ... rest of component unchanged
}

// ============================================================================
// MENU ITEM STRUCTURE REFERENCE
// ============================================================================

/*
Each menu item has this structure:
{
  href: string              // Route path (e.g., '/cost-calculator')
  icon: React.ComponentType  // Lucide icon component
  label: string             // Display text
  badge: string | null      // Optional badge ('AI', 'New', number, or null)
  key: string               // Unique identifier for React.map()
}

Icon Mapping:
- Calculator:   Arithmetic symbol (≡) - Used for Cost Calculator
- BarChart3:    Three bars chart - Used for Financial Dashboard
- Percent:      % symbol - Used for Dilution Scenarios
- Scale:        Balance scale - Used for Listing Rules (legal/compliance)
- FileCheck:    Document with checkmark - Used for Corporate Resolutions
- Signature:    Pen signature - Used for Consent Workflow
- Share2:       Two connected nodes - Used for Syndication Templates

All icons use default Lucide size (24px) and are resized via CSS in container.
*/

// ============================================================================
// ROUTING CONVENTION
// ============================================================================

/*
Routes are at ROOT LEVEL for cleaner URLs:
✓ /cost-calculator           (instead of /dashboard/financial/cost-calculator)
✓ /financial-dashboard
✓ /dilution-scenarios
✓ /listing-rules
✓ /resolutions
✓ /consent-workflow
✓ /syndication

This matches existing routes like:
✓ /documents
✓ /templates
✓ /resources
✓ /marketplace
*/

// ============================================================================
// FEATURES & CAPABILITIES
// ============================================================================

/*
1. COLLAPSIBLE SECTIONS
   - Both FINANCIAL MANAGEMENT and COMPLIANCE are collapsible: true
   - Click section header to collapse/expand
   - State persists in localStorage
   - Default: Both expanded

2. ACTIVE STATE
   - Uses usePathname() to detect current route
   - Applies active styling automatically
   - Highlights current menu item

3. BADGE SUPPORT
   - All items support optional badges (badge: string | null)
   - Currently null for all new items
   - Can add badges like 'AI', 'New', '3', etc.

4. RESPONSIVE
   - Works on mobile (hamburger menu)
   - Works on tablet
   - Full sidebar on desktop
   - All existing responsive logic applies

5. DARK MODE
   - All colors use CSS variables
   - var(--color-text-primary)
   - var(--color-text-tertiary)
   - var(--color-stroke-dark)
   - Automatically adapts to theme
*/

// ============================================================================
// IMPLEMENTATION CHECKLIST
// ============================================================================

/*
COMPLETED:
✅ Icon imports added
✅ NAV_GROUPS configuration updated
✅ FINANCIAL MANAGEMENT section added
✅ COMPLIANCE section expanded
✅ Routing paths defined
✅ Default expand state configured

TODO:
⏳ Create /src/app/cost-calculator/page.tsx
⏳ Create /src/app/financial-dashboard/page.tsx
⏳ Create /src/app/dilution-scenarios/page.tsx
⏳ Create /src/app/listing-rules/page.tsx
⏳ Create /src/app/resolutions/page.tsx
⏳ Create /src/app/consent-workflow/page.tsx
⏳ Create /src/app/syndication/page.tsx
⏳ Test navigation
⏳ Test collapse/expand functionality
⏳ Verify active state highlighting
⏳ Mobile responsiveness test
*/

// ============================================================================
// FILE LOCATION
// ============================================================================
// 
// /Users/test/Documents/Claude/Projects/IPOReady/src/components/layout/AppShell.tsx
//
// ============================================================================
