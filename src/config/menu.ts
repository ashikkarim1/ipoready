/**
 * Smart menu configuration based on company status
 */

import {
  LayoutDashboard, FileText, Building2, AlertCircle, DollarSign,
  Users, TrendingUp, BarChart3, Scale, Briefcase, ShoppingBag,
  CheckSquare, BookOpen, Settings, Clock, Target, Eye, MessageSquare,
  TrendingDown, GitBranch, Shield, Award, Zap, PieChart, Lock,
  LayoutGrid, Archive, Brain
} from 'lucide-react'

/**
 * PRE-IPO COMPANY MENU
 * Shows IPO readiness tools + locked preview of Listed Services
 */
export const PRE_IPO_NAV_GROUPS = [
  {
    section: 'MISSION',
    collapsible: true,
    items: [
      { href: '/dashboard',            icon: LayoutDashboard, label: 'Dashboard',         badge: null,   key: 'dashboard'       },
      { href: '/dashboard/ipo-journey', icon: BookOpen,       label: 'IPO Journey™',      badge: '✨',   key: 'ipo-journey'     },
    ],
  },
  {
    section: 'WORK',
    collapsible: true,
    items: [
      { href: '/cap-table',                              icon: PieChart,        label: 'Cap Table',          badge: 'AI',   key: 'cap-table'        },
      { href: '/documents',                              icon: FileText,        label: 'Documents',          badge: null,   key: 'documents'        },
      { href: '/prospectus',                             icon: FileText,        label: 'Prospectus Builder', badge: '✨',   key: 'prospectus'       },
      { href: '/dashboard/work/prospectus-validator',    icon: CheckSquare,     label: 'Prospectus Validator', badge: null,  key: 'validator'        },
    ],
  },
  {
    section: 'PEOPLE',
    collapsible: true,
    items: [
      { href: '/dashboard/work/directors-officers',      icon: Users,           label: 'Board & Talent',     badge: '💎',   key: 'directors'        },
      { href: '/marketplace',                             icon: ShoppingBag,     label: 'Expert Network',     badge: null,   key: 'marketplace'      },
    ],
  },
  {
    section: 'COMPLIANCE & FILINGS',
    collapsible: true,
    items: [
      { href: '/compliance/listing-rules',  icon: Scale,       label: 'Listing Rules',         badge: null,   key: 'listing-rules'  },
      { href: '/compliance/resolutions',    icon: CheckSquare, label: 'Corporate Resolutions', badge: null,   key: 'resolutions'    },
      { href: '/dashboard/filings',         icon: FileText,    label: 'View Filings',         badge: null,   key: 'filings-list'     },
    ],
  },
  {
    section: 'INVESTOR READINESS',
    collapsible: true,
    items: [
      { href: '/dashboard/investor-readiness/intelligence-hub',     icon: Zap,       label: 'Intelligence Hub',    badge: '🚀',   key: 'intelligence-hub'     },
      { href: '/dashboard/investor-readiness/data-room-viewer',     icon: Brain,     label: 'AI Document Viewer',  badge: '✨',   key: 'data-room-viewer'     },
      { href: '/dashboard/investor-readiness/data-room-health',     icon: BarChart3, label: 'Data Room Health',    badge: 'AI',   key: 'data-room-health'     },
      { href: '/dashboard/investor-readiness/data-room-analytics',  icon: Eye,       label: 'Investor Activity',   badge: '📊',   key: 'data-room-analytics'  },
      { href: '/dashboard/investor-readiness/data-room',            icon: Lock,      label: 'Data Room',          badge: '🔒',   key: 'data-room'            },
      { href: '/dashboard/pace',                                    icon: Target,    label: 'PACE™ Scorecard',    badge: null,   key: 'pace'                 },
      { href: '/dashboard/cap-table',                               icon: PieChart,  label: 'Cap Table',          badge: null,   key: 'cap-table'            },
    ],
  },
  {
    section: 'LISTED SERVICES (Coming)',
    collapsible: true,
    isLocked: true,
    items: [
      { href: '/dashboard/listed-services/preview', icon: Lock, label: '🔒 Disclosure & Filings', badge: 'Coming', key: 'locked-disclosure' },
      { href: '/dashboard/listed-services/preview', icon: Lock, label: '🔒 Investor Relations',    badge: 'Coming', key: 'locked-ir' },
      { href: '/dashboard/listed-services/preview', icon: Lock, label: '🔒 Corporate Governance',  badge: 'Coming', key: 'locked-governance' },
      { href: '/dashboard/listed-services/preview', icon: Lock, label: '🔒 CFO Command Center',    badge: 'Coming', key: 'locked-cfo' },
      { href: '/dashboard/listed-services/preview', icon: Lock, label: '🔒 Risk & Compliance',     badge: 'Coming', key: 'locked-risk' },
    ],
  },
  {
    section: 'RESOURCES',
    collapsible: true,
    items: [
      { href: '/resources',              icon: BookOpen,   label: 'Resource Centre',    badge: null,   key: 'resources'  },
      { href: '/settings',               icon: Settings,   label: 'Settings',           badge: null,   key: 'settings'  },
    ],
  },
]

/**
 * PUBLIC COMPANY MENU
 * Shows Listed Services unlocked + IPO Archive
 */
export const PUBLIC_COMPANY_NAV_GROUPS = [
  {
    section: 'COMMAND CENTER',
    collapsible: true,
    items: [
      { href: '/dashboard',           icon: LayoutDashboard, label: 'Dashboard',              badge: 'AI',   key: 'dashboard'       },
      { href: '/dashboard/scores',    icon: BarChart3,       label: 'Compliance Scores',      badge: 'AI',   key: 'scores'          },
    ],
  },
  {
    section: 'CORPORATE SECRETARY',
    collapsible: true,
    items: [
      { href: '/listed-services/entity-management',   icon: Building2,   label: 'Entity Management',      badge: null,   key: 'entity-mgmt'      },
      { href: '/listed-services/board-management',    icon: Users,       label: 'Board Management',       badge: 'AI',   key: 'board-mgmt'      },
      { href: '/listed-services/governance-library',  icon: Award,       label: 'Governance Library',     badge: null,   key: 'governance-lib'   },
    ],
  },
  {
    section: 'DISCLOSURE & FILINGS',
    collapsible: true,
    items: [
      { href: '/listed-services/filing-calendar',     icon: Clock,       label: 'Filing Calendar',        badge: 'AI',   key: 'filing-cal'      },
      { href: '/listed-services/mda-studio',          icon: FileText,    label: 'MD&A Studio',           badge: 'AI',   key: 'mda-studio'      },
      { href: '/listed-services/disclosure-center',   icon: AlertCircle, label: 'Disclosure Center',     badge: 'AI',   key: 'disclosure'      },
    ],
  },
  {
    section: 'INVESTOR RELATIONS',
    collapsible: true,
    items: [
      { href: '/listed-services/ir-calendar',         icon: Clock,       label: 'IR Calendar',            badge: null,   key: 'ir-cal'          },
      { href: '/listed-services/press-releases',      icon: MessageSquare, label: 'Press Release Engine', badge: 'AI',   key: 'press-releases'  },
      { href: '/listed-services/market-awareness',    icon: Eye,         label: 'Market Awareness',       badge: 'AI',   key: 'market-aware'    },
      { href: '/listed-services/investor-crm',        icon: Users,       label: 'Investor CRM',          badge: null,   key: 'investor-crm'    },
    ],
  },
  {
    section: 'CFO COMMAND CENTER',
    collapsible: true,
    items: [
      { href: '/listed-services/financial-reporting', icon: BarChart3,   label: 'Financial Reporting',    badge: 'AI',   key: 'fin-reporting'   },
      { href: '/listed-services/financing',           icon: DollarSign,  label: 'Financing Center',       badge: 'AI',   key: 'financing'       },
      { href: '/listed-services/dilution-simulator',  icon: PieChart,    label: 'Dilution Simulator',     badge: 'AI',   key: 'dilution-sim'    },
      { href: '/listed-services/treasury',            icon: Lock,        label: 'Treasury Management',    badge: null,   key: 'treasury'        },
    ],
  },
  {
    section: 'EXECUTIVE LEADERSHIP',
    collapsible: true,
    items: [
      { href: '/listed-services/ceo-dashboard',       icon: Zap,         label: 'CEO Command Center',     badge: 'AI',   key: 'ceo-dashboard'   },
      { href: '/listed-services/risk-center',         icon: AlertCircle, label: 'Risk Center',           badge: 'AI',   key: 'risk-center'     },
      { href: '/listed-services/opportunities',       icon: Target,      label: 'Opportunity Center',     badge: 'AI',   key: 'opportunities'   },
    ],
  },
  {
    section: 'M&A & CORPORATE DEVELOPMENT',
    collapsible: true,
    items: [
      { href: '/listed-services/deal-pipeline',       icon: GitBranch,   label: 'Deal Pipeline',          badge: 'AI',   key: 'deal-pipeline'   },
      { href: '/listed-services/due-diligence',       icon: CheckSquare, label: 'Due Diligence Room',     badge: null,   key: 'diligence'       },
      { href: '/listed-services/integration',         icon: Briefcase,   label: 'Integration Center',     badge: null,   key: 'integration'     },
    ],
  },
  {
    section: 'COMPLIANCE & GOVERNANCE',
    collapsible: true,
    items: [
      { href: '/listed-services/insider-compliance',  icon: Eye,         label: 'Insider Compliance',     badge: 'AI',   key: 'insider'         },
      { href: '/listed-services/audit-controls',      icon: Shield,      label: 'Audit & Controls',       badge: 'AI',   key: 'audit-controls'  },
      { href: '/listed-services/legal-center',        icon: Scale,       label: 'Legal Center',          badge: null,   key: 'legal'           },
      { href: '/listed-services/esg',                 icon: Award,       label: 'ESG & Sustainability',   badge: null,   key: 'esg'             },
    ],
  },
  {
    section: 'IPO HISTORY',
    collapsible: true,
    items: [
      { href: '/dashboard/ipo-archive',               icon: Archive,     label: 'Your IPO Journey',       badge: null,   key: 'ipo-archive'     },
    ],
  },
  {
    section: 'SETTINGS',
    collapsible: true,
    items: [
      { href: '/settings',                            icon: Settings,    label: 'Settings',              badge: null,   key: 'settings'        },
    ],
  },
]

/**
 * Get the appropriate nav groups based on company status
 */
export function getNavGroups(status: string = 'pre-ipo') {
  if (status === 'public' || status === 'ipo-complete') {
    return PUBLIC_COMPANY_NAV_GROUPS
  }
  return PRE_IPO_NAV_GROUPS
}
