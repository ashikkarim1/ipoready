/**
 * Navigation Configuration for IPOReady Dashboard
 * 
 * Menu structure with:
 * - Semantic grouping (MISSION, WORK, FINANCIAL MANAGEMENT, COMPLIANCE, etc.)
 * - Icon assignments from lucide-react
 * - Routing paths
 * - Badge indicators
 * - Collapsible sections with state persistence
 */

import {
  LayoutDashboard,
  CheckSquare,
  PieChart,
  FileText,
  Award,
  TrendingUp,
  DollarSign,
  Shield,
  CheckCircle,
  BookOpen,
  FileSearch,
  ShoppingBag,
  Users,
  Plug,
  Settings,
  BellRing,
  Banknote,
  Calculator,
  BarChart3,
  AlertCircle,
  FileCheck,
  Building2,
  Lock,
  GitBranch,
  Eye,
  RefreshCw,
  Zap,
  LucideIcon,
} from 'lucide-react'

export interface NavItem {
  href: string
  icon: LucideIcon
  label: string
  badge?: string | null
  key: string
  description?: string
}

export interface NavGroup {
  section: string
  collapsible: boolean
  items: NavItem[]
  description?: string
}

export const NAV_GROUPS: NavGroup[] = [
  // ═══════════════════════════════════════════════════════════════
  // MISSION: Core IPO Readiness Workflow
  // ═══════════════════════════════════════════════════════════════
  {
    section: 'MISSION',
    collapsible: false,
    description: 'Core IPO readiness workflow and progress tracking',
    items: [
      {
        href: '/dashboard',
        icon: LayoutDashboard,
        label: 'Dashboard',
        badge: null,
        key: 'dashboard',
        description: 'Overview of IPO readiness status and metrics',
      },
      {
        href: '/checklist',
        icon: CheckSquare,
        label: 'IPO Checklist',
        badge: null,
        key: 'checklist',
        description: 'Master checklist for IPO preparation',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // WORK: Document & Capital Management
  // ═══════════════════════════════════════════════════════════════
  {
    section: 'WORK',
    collapsible: false,
    description: 'Document management and capital structure',
    items: [
      {
        href: '/cap-table',
        icon: PieChart,
        label: 'Cap Table',
        badge: 'AI',
        key: 'cap-table',
        description: 'AI-powered capitalization table analysis',
      },
      {
        href: '/documents',
        icon: FileText,
        label: 'Documents',
        badge: null,
        key: 'documents',
        description: 'Document repository and management',
      },
      {
        href: '/prospectus',
        icon: FileText,
        label: 'Prospectus Builder',
        badge: '✨',
        key: 'prospectus',
        description: 'Auto-generate prospectus documents',
      },
      {
        href: '/templates',
        icon: Award,
        label: 'Templates & Forms',
        badge: null,
        key: 'templates',
        description: 'Pre-built templates and form generators',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // FINANCIAL MANAGEMENT: Cost, Budget & Financial Analysis
  // ═══════════════════════════════════════════════════════════════
  {
    section: 'FINANCIAL MANAGEMENT',
    collapsible: true,
    description: 'IPO cost estimation, budget tracking, and financial planning',
    items: [
      {
        href: '/financial/cost-calculator',
        icon: Calculator,
        label: 'Cost Calculator',
        badge: null,
        key: 'cost-calculator',
        description: 'Estimate IPO-related costs and fees',
      },
      {
        href: '/financial/budget-tracking',
        icon: BarChart3,
        label: 'Budget Tracking',
        badge: null,
        key: 'budget-tracking',
        description: 'Track actual vs. budgeted expenses',
      },
      {
        href: '/dashboard/financial-mgmt/financial-kpis',
        icon: TrendingUp,
        label: 'Financial KPIs',
        badge: null,
        key: 'financial-kpis',
        description: 'Monitor key financial performance indicators',
      },
      {
        href: '/dilution-demo',
        icon: BarChart3,
        label: 'Dilution Scenarios',
        badge: null,
        key: 'dilution-scenarios',
        description: 'Model ownership dilution scenarios',
      },
      {
        href: '/dashboard/compliance/syndication-templates',
        icon: Users,
        label: 'Syndication Templates',
        badge: null,
        key: 'syndication-templates',
        description: 'Investor syndication templates and agreements',
      },
      {
        href: '/dashboard/financial-mgmt/pricing',
        icon: DollarSign,
        label: 'Pricing Strategy',
        badge: null,
        key: 'pricing-strategy',
        description: 'IPO price range and valuation analysis',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // COMPLIANCE: Regulatory Requirements & Documentation
  // ═══════════════════════════════════════════════════════════════
  {
    section: 'COMPLIANCE',
    collapsible: true,
    description: 'Regulatory compliance, listing rules, and approvals',
    items: [
      {
        href: '/dashboard/compliance/listing-rules',
        icon: Shield,
        label: 'Listing Rules',
        badge: null,
        key: 'listing-rules',
        description: 'Exchange-specific listing requirements',
      },
      {
        href: '/dashboard/compliance/resolutions',
        icon: FileCheck,
        label: 'Corporate Resolutions',
        badge: null,
        key: 'resolutions',
        description: 'Board resolutions and approvals',
      },
      {
        href: '/dashboard/compliance/consent-letters',
        icon: CheckCircle,
        label: 'Consent Letters',
        badge: null,
        key: 'consent-letters',
        description: 'Shareholder and director consents',
      },
      {
        href: '/dashboard/compliance/syndication-templates',
        icon: FileText,
        label: 'Syndication Templates',
        badge: null,
        key: 'syndication-templates',
        description: 'Investor syndication letter templates',
      },
      {
        href: '/dashboard/compliance/regulatory-filings',
        icon: Building2,
        label: 'Regulatory Filings',
        badge: null,
        key: 'regulatory-filings',
        description: 'SEC and regulatory submission tracking',
      },
      {
        href: '/dashboard/compliance/exchange-config',
        icon: GitBranch,
        label: 'Exchange Config',
        badge: null,
        key: 'exchange-config',
        description: 'Exchange selection and configuration',
      },
      {
        href: '/dashboard/compliance/audit-trail',
        icon: Eye,
        label: 'Audit Trail',
        badge: null,
        key: 'audit-trail',
        description: 'Track all compliance actions and approvals',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // INVESTOR READINESS: Data Room & Intelligence
  // ═══════════════════════════════════════════════════════════════
  {
    section: 'INVESTOR READINESS',
    collapsible: false,
    description: 'Investor-facing data room and intelligence hub',
    items: [
      {
        href: '/dashboard/investor-readiness/data-room',
        icon: Zap,
        label: 'Data Room',
        badge: 'AI',
        key: 'data-room',
        description: 'Secure document management and NDA automation',
      },
      {
        href: '/dashboard/investor-readiness/intelligence-hub',
        icon: TrendingUp,
        label: 'Intelligence Hub',
        badge: null,
        key: 'intelligence-hub',
        description: 'Command center with KPIs and market intelligence',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // LEARNING & SUPPORT: Resources and Guidance
  // ═══════════════════════════════════════════════════════════════
  {
    section: 'LEARNING & SUPPORT',
    collapsible: true,
    description: 'Educational resources and expert support',
    items: [
      {
        href: '/resources',
        icon: BookOpen,
        label: 'Resource Centre',
        badge: null,
        key: 'resources',
        description: 'IPO guides, articles, and best practices',
      },
      {
        href: '/checklist-guide',
        icon: FileSearch,
        label: 'Compliance Guide',
        badge: null,
        key: 'compliance-guide',
        description: 'Step-by-step compliance checklist',
      },
      {
        href: '/marketplace',
        icon: ShoppingBag,
        label: 'Expert Network',
        badge: null,
        key: 'expert-network',
        description: 'Connect with IPO advisors and service providers',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // ACCOUNT & SETTINGS: User Management and Configuration
  // ═══════════════════════════════════════════════════════════════
  {
    section: 'ACCOUNT & SETTINGS',
    collapsible: true,
    description: 'Team, integrations, and account management',
    items: [
      {
        href: '/team',
        icon: Users,
        label: 'Team & Roles',
        badge: null,
        key: 'team',
        description: 'Manage team members and permissions',
      },
      {
        href: '/integrations',
        icon: Plug,
        label: 'Integrations',
        badge: '3',
        key: 'integrations',
        description: 'Connect external tools and services',
      },
      {
        href: '/account',
        icon: Settings,
        label: 'Account',
        badge: null,
        key: 'account',
        description: 'Account settings and preferences',
      },
      {
        href: '/notifications',
        icon: BellRing,
        label: 'Notifications',
        badge: null,
        key: 'notifications',
        description: 'Notification preferences and history',
      },
    ],
  },
]

// Flatten for backwards compatibility in badge/routing logic
export const NAV_ITEMS = NAV_GROUPS.flatMap(g => g.items)

/**
 * Menu hierarchy structure for Financial Management section
 * Used for building submenu navigation trees
 */
export const FINANCIAL_MGMT_MENU = {
  root: '/financial',
  sections: [
    {
      id: 'estimation',
      label: 'Cost & Planning',
      icon: Calculator,
      items: [
        {
          label: 'Cost Calculator',
          href: '/financial/cost-calculator',
          icon: Calculator,
          description: 'Estimate IPO costs and timeline',
        },
        {
          label: 'Financial KPIs',
          href: '/dashboard/financial-mgmt/financial-kpis',
          icon: TrendingUp,
          description: 'Track key financial metrics',
        },
      ],
    },
    {
      id: 'execution',
      label: 'Budgeting & Tracking',
      icon: BarChart3,
      items: [
        {
          label: 'Budget Tracking',
          href: '/financial/budget-tracking',
          icon: BarChart3,
          description: 'Monitor budget vs. actuals',
        },
        {
          label: 'Dilution Scenarios',
          href: '/dilution-demo',
          icon: Banknote,
          description: 'Model ownership changes',
        },
      ],
    },
    {
      id: 'strategy',
      label: 'Strategy & Valuation',
      icon: TrendingUp,
      items: [
        {
          label: 'Pricing Strategy',
          href: '/dashboard/financial-mgmt/pricing',
          icon: DollarSign,
          description: 'IPO pricing analysis',
        },
        {
          label: 'Syndication Templates',
          href: '/dashboard/compliance/syndication-templates',
          icon: Users,
          description: 'Investor syndication setup',
        },
      ],
    },
  ],
}

/**
 * Menu hierarchy structure for Investor Readiness section
 * Used for building submenu navigation trees
 */
export const INVESTOR_READINESS_MENU = {
  root: '/dashboard/investor-readiness',
  sections: [
    {
      id: 'data-room',
      label: 'Data Room',
      icon: Zap,
      items: [
        {
          label: 'Main Data Room',
          href: '/dashboard/investor-readiness/data-room',
          icon: Zap,
          description: 'Secure document management with 6 smart folders',
        },
        {
          label: 'AI Document Viewer',
          href: '/dashboard/investor-readiness/data-room-viewer',
          icon: Eye,
          description: 'AI-powered summaries with confidence metrics',
        },
        {
          label: 'Health Dashboard',
          href: '/dashboard/investor-readiness/data-room-health',
          icon: TrendingUp,
          description: 'Investor confidence scoring and recommendations',
        },
        {
          label: 'Investor Analytics',
          href: '/dashboard/investor-readiness/data-room-analytics',
          icon: BarChart3,
          description: 'Real-time investor activity and intent signals',
        },
      ],
    },
    {
      id: 'intelligence',
      label: 'Intelligence',
      icon: TrendingUp,
      items: [
        {
          label: 'Intelligence Hub',
          href: '/dashboard/investor-readiness/intelligence-hub',
          icon: TrendingUp,
          description: 'Command center with KPIs and market intelligence',
        },
      ],
    },
  ],
}

/**
 * Menu hierarchy structure for Compliance section
 * Used for building submenu navigation trees
 */
export const COMPLIANCE_MENU = {
  root: '/dashboard/compliance',
  sections: [
    {
      id: 'requirements',
      label: 'Requirements & Rules',
      icon: Shield,
      items: [
        {
          label: 'Listing Rules',
          href: '/dashboard/compliance/listing-rules',
          icon: Shield,
          description: 'Exchange requirements',
        },
        {
          label: 'Exchange Config',
          href: '/dashboard/compliance/exchange-config',
          icon: GitBranch,
          description: 'Configure listing exchange',
        },
      ],
    },
    {
      id: 'approvals',
      label: 'Approvals & Consents',
      icon: CheckCircle,
      items: [
        {
          label: 'Corporate Resolutions',
          href: '/dashboard/compliance/resolutions',
          icon: FileCheck,
          description: 'Board resolutions',
        },
        {
          label: 'Consent Letters',
          href: '/dashboard/compliance/consent-letters',
          icon: CheckCircle,
          description: 'Shareholder consents',
        },
      ],
    },
    {
      id: 'documentation',
      label: 'Documentation',
      icon: FileText,
      items: [
        {
          label: 'Syndication Templates',
          href: '/dashboard/compliance/syndication-templates',
          icon: FileText,
          description: 'Investor communication',
        },
        {
          label: 'Regulatory Filings',
          href: '/dashboard/compliance/regulatory-filings',
          icon: Building2,
          description: 'SEC and regulatory docs',
        },
      ],
    },
    {
      id: 'monitoring',
      label: 'Monitoring',
      icon: Eye,
      items: [
        {
          label: 'Audit Trail',
          href: '/dashboard/compliance/audit-trail',
          icon: Eye,
          description: 'Track all actions',
        },
      ],
    },
  ],
}

/**
 * Default expanded sections on initial load
 */
export const DEFAULT_EXPANDED_SECTIONS = [
  'MISSION',
  'WORK',
  'INVESTOR READINESS',
  'FINANCIAL MANAGEMENT',
  'COMPLIANCE',
]

/**
 * Get a nav item by its key
 */
export function getNavItemByKey(key: string): NavItem | undefined {
  return NAV_ITEMS.find(item => item.key === key)
}

/**
 * Get all items in a section
 */
export function getNavItemsBySection(section: string): NavItem[] {
  const group = NAV_GROUPS.find(g => g.section === section)
  return group?.items ?? []
}

/**
 * Check if a path matches a nav item
 */
export function isNavItemActive(pathname: string, navItem: NavItem): boolean {
  // Exact match or prefix match for sections with subsections
  return pathname === navItem.href || pathname.startsWith(navItem.href + '/')
}
