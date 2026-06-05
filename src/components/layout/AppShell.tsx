'use client'
import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { signOut, useSession } from 'next-auth/react'
import {
  Rocket, LayoutDashboard, CheckSquare, FileText, Users, ShoppingBag,
  DollarSign, Settings, Bell, ChevronDown, LogOut, Menu, X, Building2,
  Award, ChevronRight, Zap, PieChart, Banknote, Gift, BookOpen,
  CreditCard, Shield, Flame, HelpCircle, ExternalLink, TrendingUp,
  AlertTriangle, RefreshCcw, Activity, Plug, BellRing, Store, FileSearch,
  CheckCheck, Clock, Calculator, Target, CheckCircle, Percent, Briefcase,
  FileCheck, Scale, Signature, Share2, BarChart3, Map
} from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import type { Notification } from '@/types'

// Navigation organized into semantic groups
const NAV_GROUPS = [
  {
    section: 'MISSION',
    collapsible: true,
    items: [
      { href: '/new-to-this',          icon: HelpCircle,      label: 'New To This?',      badge: '✨',   key: 'new-to-this'     },
      { href: '/dashboard',            icon: LayoutDashboard, label: 'Dashboard',         badge: null,   key: 'dashboard'       },
      { href: '/dashboard/ipo-journey', icon: Map,            label: 'IPO Journey™',      badge: '✨',   key: 'ipo-journey'     },
    ],
  },
  {
    section: 'WORK',
    collapsible: true,
    items: [
      { href: '/cap-table',                              icon: PieChart,        label: 'Cap Table',          badge: 'AI',   key: 'cap-table'        },
      { href: '/documents',                              icon: FileText,        label: 'Documents',          badge: null,   key: 'documents'        },
      { href: '/dashboard/documents/contracts-map',      icon: FileText,        label: 'Prospectus Map',     badge: null,   key: 'prospectus-map'   },
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
    section: 'INVESTOR READINESS',
    collapsible: true,
    items: [
      { href: '/dashboard/investor-match', icon: Target, label: 'Investor Match™', badge: '✨', key: 'investor-match' },
    ],
  },
  {
    section: 'MARKET ANALYSIS',
    collapsible: true,
    items: [
      { href: '/market-analysis/peer-analysis',        icon: BarChart3,   label: 'Peer Analysis',        badge: '✨',   key: 'peer-analysis'     },
      { href: '/market-analysis/coverage-predictor',   icon: TrendingUp,  label: 'Coverage Predictor™', badge: '✨',   key: 'coverage-pred'     },
      { href: '/market-analysis/market-ir',            icon: DollarSign,  label: 'Market IR',           badge: '✨',   key: 'market-ir'         },
    ],
  },
  {
    section: 'FINANCIAL MANAGEMENT',
    collapsible: true,
    items: [
      { href: '/dashboard/financial-mgmt/cost-calculator',    icon: Calculator,  label: 'Cost Calculator',      badge: null,   key: 'cost-calc'      },
      { href: '/dashboard/financial-mgmt/true-cost',          icon: DollarSign,  label: 'Public Costs', badge: '💎', key: 'true-cost' },
      { href: '/dashboard/cap-table/dilution-scenarios',      icon: Percent,     label: 'Dilution Scenarios',   badge: null,   key: 'dilution'       },
      { href: '/financial/budget-tracking',                   icon: BarChart3,   label: 'Budget Tracking',      badge: null,   key: 'budget-tracking'},
    ],
  },
  {
    section: 'COMPLIANCE',
    collapsible: true,
    items: [
      { href: '/compliance/listing-rules',  icon: Scale,       label: 'Listing Rules',         badge: null,   key: 'listing-rules'  },
      { href: '/compliance/resolutions',    icon: FileCheck,   label: 'Corporate Resolutions', badge: null,   key: 'resolutions'    },
      { href: '/demo/consent-workflow',     icon: Signature,   label: 'Consent Workflow',      badge: null,   key: 'consent'        },
      { href: '/marketplace',               icon: Share2,      label: 'Expert Network',        badge: null,   key: 'syndication'    },
    ],
  },
  {
    section: 'FILINGS',
    collapsible: true,
    items: [
      { href: '/dashboard/filings',                icon: FileCheck,   label: 'View Filings',        badge: null,   key: 'filings-list'     },
      { href: '/dashboard/filings/new',            icon: FileText,    label: 'New Filing',          badge: '✨',   key: 'filings-new'      },
      { href: '/dashboard/filings/status',         icon: Activity,    label: 'Filing Status',       badge: null,   key: 'filings-status'   },
    ],
  },
  {
    section: 'RESOURCES',
    collapsible: true,
    items: [
      { href: '/templates',                              icon: Award,           label: 'Templates & Forms',  badge: null,   key: 'templates'        },
      { href: '/learning-compliance/insurances', icon: Shield,      label: 'Insurances',         badge: null,   key: 'insurances'  },
      { href: '/resources',       icon: BookOpen,        label: 'Resource Centre',    badge: null,   key: 'resources'   },
      { href: '/checklist-guide', icon: FileSearch,      label: 'Compliance Guide',   badge: null,   key: 'guide'       },
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

// Legacy flat list for backwards compatibility in badge logic
const NAV_ITEMS = NAV_GROUPS.flatMap(g => g.items)

function formatRole(role?: string): string {
  if (!role) return 'Member'
  const map: Record<string, string> = {
    system_admin: 'System Admin',
    ceo: 'CEO',
    cfo: 'CFO',
    coo: 'COO',
    legal_counsel: 'Legal Counsel',
    ir_officer: 'IR Officer',
    compliance: 'Compliance Officer',
    board_member: 'Board Member',
    auditor: 'Auditor',
    founder: 'Founder',
  }
  return map[role] ?? role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function getInitials(name?: string | null): string {
  if (!name) return 'U'
  const parts = name.trim().split(' ')
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase()
}

function BadgeChip({ badge }: { badge: string }) {
  if (badge === 'IP')  return (
    <span className="text-[9px] px-1.5 py-0.5 rounded font-bold"
      style={{ background: 'var(--color-text-primary)', color: 'white', letterSpacing: '0.04em' }}>{badge}</span>
  )
  if (badge === 'AI')  return (
    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
      style={{ background: 'var(--color-warning-soft)', color: 'var(--color-warning)' }}>{badge}</span>
  )
  if (badge === 'New') return (
    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
      style={{ background: 'var(--color-error-soft)', color: 'var(--color-accent)' }}>{badge}</span>
  )
  if (badge === 'Soon') return (
    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
      style={{ background: 'var(--color-surface-light)', color: 'var(--color-accent-purple)' }}>{badge}</span>
  )
  return (
    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
      style={{ background: 'var(--color-bg-primary)', color: 'var(--color-text-tertiary)' }}>{badge}</span>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { company, currency, language, setCurrency, setLanguage, sidebarOpen, toggleSidebar, setCompany, setUserPlan } = useAppStore()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showAccountPanel, setShowAccountPanel] = useState(false)

  // Collapsible sections state with localStorage persistence
  const [expandedSections, setExpandedSections] = useState<string[]>(['MISSION', 'WORK', 'INVESTOR READINESS', 'MARKET ANALYSIS', 'FINANCIAL MANAGEMENT', 'COMPLIANCE', 'FILINGS'])

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

  // Dynamic nav stats (checklist badge)
  const [navStats, setNavStats] = useState<{ totalTasks: number; completedTasks: number; documentsCount: number } | null>(null)

  // Real notifications from DB
  const [dbNotifications, setDbNotifications] = useState<Notification[]>([])
  const [showBellDropdown, setShowBellDropdown] = useState(false)
  const bellRef = useRef<HTMLDivElement>(null)

  const unreadCount = useMemo(
    () => dbNotifications.filter(n => !n.read).length,
    [dbNotifications]
  )

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications')
      if (!res.ok) return
      const data = await res.json() as { notifications: Notification[]; unreadCount: number }
      setDbNotifications(data.notifications)
    } catch {
      // keep current state on error
    }
  }, [])

  // Fetch on mount when session is authenticated
  useEffect(() => {
    if (session?.user) {
      fetchNotifications()
    }
  }, [session?.user, fetchNotifications])

  // Fetch dashboard stats for dynamic nav badges
  useEffect(() => {
    if (!session?.user) return
    fetch('/api/dashboard/stats')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setNavStats({
            totalTasks: data.totalTasks ?? 0,
            completedTasks: data.completedTasks ?? 0,
            documentsCount: data.documentsCount ?? 0,
          })
        }
      })
      .catch(() => {/* keep null on error */})
  }, [session?.user])

  // Close bell dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setShowBellDropdown(false)
      }
    }
    if (showBellDropdown) {
      document.addEventListener('mousedown', handleClick)
    }
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showBellDropdown])

  async function markNotificationRead(id: string) {
    setDbNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    try {
      await fetch(`/api/notifications/${id}`, { method: 'PATCH' })
    } catch {
      // optimistic update — ignore error
    }
  }

  async function markAllRead() {
    setDbNotifications(prev => prev.map(n => ({ ...n, read: true })))
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      })
    } catch {
      // optimistic update — ignore error
    }
  }

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  // Hydrate store with real company data on auth
  useEffect(() => {
    if (session?.user) {
      fetch('/api/company')
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data?.company) {
            setCompany({
              id: data.company.id,
              name: data.company.name,
              listingType: data.company.listingType,
              targetExchange: data.company.targetExchange,
              currentPhase: data.company.currentPhase,
              paceScore: data.company.paceScore,
              estimatedDaysToIPO: data.company.estimatedDaysToIpo,
              progressPercentage: data.company.progressPercentage,
              currency: data.company.currency,
              language: data.company.language,
              createdAt: data.company.createdAt,
              ownerId: (session.user as any)?.id ?? '',
            })
          }
          const plan = (session.user as any)?.subscriptionPlan
          if (plan) setUserPlan(plan)
        })
        .catch(() => {/* keep demo data on failure */})
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user])

  // Billing — derive from store (populated from session on mount above)
  const { userPlan: storePlan } = useAppStore()
  const PLAN_LABELS: Record<string, string> = { starter: 'Starter Plan', growth: 'Growth Plan', enterprise: 'Enterprise Plan', free: 'Free Plan' }
  const PLAN_PRICES: Record<string, string> = { starter: 'CA$399 / month', growth: 'CA$499 / month', enterprise: 'CA$999 / month', free: 'Free' }
  const planName = PLAN_LABELS[storePlan] ?? 'Growth Plan'
  const planPrice = PLAN_PRICES[storePlan] ?? 'CA$499 / month'
  const renewalDate = 'July 22, 2026'
  const daysRemaining = 61

  // Renewal notice state — banner dismissible for 14-day, not dismissible for 7-day/1-day
  const [showRenewalBanner, setShowRenewalBanner] = useState(true)
  const [showRenewalModal, setShowRenewalModal] = useState(daysRemaining <= 1)
  const paceScore = company?.paceScore ?? 62
  const estimatedDays = company?.estimatedDaysToIPO ?? 187

  // Derive breadcrumb label from current pathname
  const getBreadcrumbLabel = (path: string): string => {
    // Map full paths and patterns to breadcrumb labels
    const pathMappings: Record<string, string> = {
      '/dashboard': 'Dashboard',
      '/new-to-this': 'New To This?',
      '/dashboard/ipo-journey': 'IPO Journey™',
      '/checklist': 'IPO Checklist',
      '/cap-table': 'Cap Table',
      '/documents': 'Documents',
      '/prospectus': 'Prospectus Builder',
      '/templates': 'Templates & Forms',
      '/dashboard/investor-match': 'Investor Match™',
      '/market-analysis/peer-analysis': 'Peer Analysis',
      '/market-analysis/coverage-predictor': 'Coverage Predictor™',
      '/market-analysis/market-ir': 'Market IR',
      '/compliance/listing-rules': 'Listing Rules',
      '/compliance/resolutions': 'Corporate Resolutions',
      '/demo/consent-workflow': 'Consent Workflow',
      '/resources': 'Resource Centre',
      '/checklist-guide': 'Compliance Guide',
      '/marketplace': 'Expert Network',
      '/team': 'Team & Roles',
      '/integrations': 'Integrations',
      '/account': 'Account',
      '/notifications': 'Notifications',
      '/dashboard/financial-mgmt/cost-calculator': 'Cost Calculator',
      '/financial/cost-calculator': 'Cost Calculator',
      '/financial/budget-tracking': 'Budget Tracking',
      '/dilution-demo': 'Dilution Scenarios',
      '/dashboard/documents/contracts-map': 'Prospectus Map',
      '/pace/pulse': 'PACE™ Daily Pulse',
    }

    // Check for exact match first
    if (pathMappings[path]) return pathMappings[path]

    // Check for pattern matches (for dynamic routes)
    if (path.includes('investor-match')) return 'Investor Match™'
    if (path.includes('peer-analysis')) return 'Peer Analysis'
    if (path.includes('coverage-predictor')) return 'Coverage Predictor™'
    if (path.includes('market-ir')) return 'Market IR'
    if (path.includes('cost-calculator')) return 'Cost Calculator'
    if (path.includes('budget-tracking')) return 'Budget Tracking'
    if (path.includes('dilution')) return 'Dilution Scenarios'
    if (path.includes('consent')) return 'Consent Workflow'
    if (path.includes('listing-rules')) return 'Listing Rules'
    if (path.includes('resolutions')) return 'Corporate Resolutions'
    if (path.includes('prospectus')) return 'Prospectus Builder'
    if (path.includes('contracts-map')) return 'Prospectus Map'

    // Fallback to first path segment capitalized
    const segment = path.split('/')[1] || 'Dashboard'
    return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
  }

  const breadcrumb = getBreadcrumbLabel(pathname)

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--color-bg-primary)' }}>

      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -264 }}
            animate={{ x: 0 }}
            exit={{ x: -264 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed left-0 top-0 bottom-0 w-64 z-40 flex flex-col"
            style={{ background: 'var(--color-surface-primary)', borderRight: '1px solid var(--color-border)' }}
            role="complementary"
          >
            {/* Logo */}
            <div className="px-6 py-5" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'var(--color-text-primary)' }}>
                  <Rocket className="w-4 h-4 text-white" />
                </div>
                <span className="font-display font-bold h4 text-nav tracking-tight">
                  IPO<span style={{ color: 'var(--color-accent)' }}>Ready</span>
                </span>
              </Link>
            </div>

            {/* Company summary */}
            {company && (
              <div className="px-4 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
                <div className="flex items-start gap-2.5 p-3 rounded-xl"
                  style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)' }}>
                  <Building2 className="w-3.5 h-3.5 text-text-muted mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-nav label-sm font-semibold truncate">{company.name}</p>
                    <p className="text-text-muted caption-sm">{company.targetExchange?.toUpperCase() || 'N/A'} · {company.listingType?.toUpperCase() || 'N/A'}</p>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-text-light caption-sm">Progress</span>
                        <span className="label-sm font-semibold text-accent">{company.progressPercentage}%</span>
                      </div>
                      <div className="progress-bar" style={{ height: '4px' }}>
                        <div className="progress-fill" style={{ width: `${company.progressPercentage}%`, background: 'var(--color-accent)' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation - Grouped with Collapsible Sections */}
            <nav className="flex-1 px-0 py-4 overflow-y-auto">
              {NAV_GROUPS.map((group) => {
                const isCollapsible = group.collapsible
                const isExpanded = expandedSections.includes(group.section)

                return (
                  <div key={group.section} className="mb-6 last:mb-0">
                    {/* Section Header - Clickable if collapsible */}
                    <div
                      className={`px-6 mb-3 flex items-center justify-between ${
                        isCollapsible ? 'cursor-pointer hover:opacity-70 transition-opacity' : ''
                      }`}
                      onClick={() => isCollapsible && toggleSection(group.section)}
                    >
                      <h3 className="label-xs font-bold tracking-wider text-text-muted uppercase">
                        {group.section}
                      </h3>
                      {isCollapsible && (
                        <motion.div
                          animate={{ rotate: isExpanded ? 0 : -90 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center"
                        >
                          <ChevronDown className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
                        </motion.div>
                      )}
                    </div>

                    {/* Section Items - Animated collapse/expand */}
                    <AnimatePresence>
                      {(!isCollapsible || isExpanded) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-3 space-y-1">
                            {group.items.map(({ href, icon: Icon, label, badge, key }) => {
                              // Check if this route is active
                              // Prefer exact match; only use startsWith if no other route is more specific
                              const isExactMatch = pathname === href
                              // Only consider as child if href doesn't have /new or /status (sibling routes)
                              const isChildMatch = pathname.startsWith(href + '/') && href !== '/dashboard' && !href.includes('/new') && !href.includes('/status')
                              const isActive = isExactMatch || isChildMatch

                              // Derive dynamic badge overrides
                              let resolvedBadge: string | null = badge
                              if (key === 'checklist' && navStats) {
                                const incomplete = navStats.totalTasks - navStats.completedTasks
                                resolvedBadge = incomplete > 0 ? String(incomplete) : null
                              }

                              return (
                                <Link key={href} href={href} className={`nav-item ${isActive ? 'active' : ''}`}>
                                  <Icon className="w-[15px] h-[15px] flex-shrink-0" />
                                  <span className="flex-1 text-[13.5px]">{label}</span>
                                  {resolvedBadge && <BadgeChip badge={resolvedBadge} />}
                                </Link>
                              )
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </nav>

            {/* PACE Score */}
            {company && (
              <div className="px-4 py-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                <div className="p-3 rounded-xl" style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-accent" />
                      <span className="label-sm font-semibold text-text-muted">PACE™ Score</span>
                      <div style={{ position: 'relative' }}>
                        <HelpCircle
                          className="w-3 h-3"
                          style={{ color: 'var(--color-text-muted)', cursor: 'pointer' }}
                          id="pace-help-trigger"
                          onMouseEnter={() => {
                            const tt = document.getElementById('pace-sidebar-tooltip')
                            if (tt) tt.style.display = 'block'
                          }}
                          onMouseLeave={() => {
                            const tt = document.getElementById('pace-sidebar-tooltip')
                            if (tt) tt.style.display = 'none'
                          }}
                        />
                        <div id="pace-sidebar-tooltip" style={{
                          display: 'none', position: 'absolute', bottom: '18px', left: '-8px',
                          width: '220px', background: 'var(--color-text-primary)', color: 'white', borderRadius: '10px',
                          padding: '10px 12px', fontSize: '11px', lineHeight: 1.5, zIndex: 100,
                          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                        }}>
                          <p style={{ fontWeight: 700, marginBottom: '4px', color: 'white' }}>What is PACE™?</p>
                          <p style={{ color: 'rgba(255,255,255,0.65)', marginBottom: '8px' }}>
                            IPOReady&apos;s proprietary velocity engine measuring execution speed × phase weighting × quality.
                          </p>
                          <Link href="/dashboard" style={{ color: 'var(--color-accent-secondary)', fontWeight: 600, textDecoration: 'none', fontSize: '11px' }}>
                            See full breakdown →
                          </Link>
                          {/* Tooltip arrow */}
                          <div style={{ position: 'absolute', bottom: '-5px', left: '12px', width: '10px', height: '10px', background: 'var(--color-text-primary)', transform: 'rotate(45deg)', borderRadius: '1px' }} />
                        </div>
                      </div>
                    </div>
                    <span className="font-bold h4 text-nav">{company.paceScore}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${company.paceScore}%`, background: 'var(--color-text-primary)' }} />
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-text-light caption-sm">~{company.estimatedDaysToIPO} days to listing</p>
                    <span className="text-[9px] font-bold rounded-sm" style={{ background: 'var(--color-text-primary)', color: 'white', padding: '1px 4px', letterSpacing: '0.04em' }}>IP</span>
                  </div>
                </div>
              </div>
            )}

            {/* User */}
            <div className="px-4 py-4" style={{ borderTop: '1px solid var(--color-border)' }}>
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(v => !v)}
                  className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-bg transition-colors"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white label-xs font-bold flex-shrink-0"
                    style={{ background: 'var(--color-text-primary)' }}>
                    {session?.user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-nav label-sm font-semibold truncate">{session?.user?.name || 'User'}</p>
                    <p className="text-text-muted caption-sm truncate">{session?.user?.email}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-text-light flex-shrink-0" />
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute bottom-full left-0 right-0 mb-2 z-50 overflow-hidden rounded-2xl"
                      style={{ background: 'white', border: '1px solid var(--color-border)', boxShadow: '0 -12px 48px rgba(0,0,0,0.12), 0 -2px 8px rgba(0,0,0,0.06)' }}
                    >
                      {/* User info */}
                      <div className="px-4 py-3.5" style={{ background: 'var(--color-bg-primary)', borderBottom: '1px solid var(--color-border-medium)' }}>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white body-sm font-bold flex-shrink-0"
                            style={{ background: 'var(--color-text-primary)' }}>
                            {getInitials(session?.user?.name)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="body-sm font-bold truncate" style={{ color: 'var(--color-text-primary)' }}>{session?.user?.name || 'User'}</p>
                            <p className="caption-sm truncate" style={{ color: 'var(--color-text-tertiary)' }}>{session?.user?.email}</p>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--color-success-bright)' }} />
                          <span className="label-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                            {formatRole((session?.user as any)?.role)}
                          </span>
                        </div>
                      </div>

                      {/* Settings link */}
                      <div className="p-1.5" style={{ borderBottom: '1px solid #F0EFED' }}>
                        <Link href="/account"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl label font-medium transition-colors"
                          style={{ color: 'var(--color-text-primary)' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-bg-primary)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                          <Settings className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-text-secondary)' }} />
                          Account Settings
                        </Link>
                      </div>

                      {/* Preferences */}
                      <div className="px-4 py-3" style={{ borderBottom: '1px solid #F0EFED' }}>
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-muted)' }}>
                          Preferences
                        </p>
                        <div className="flex items-center justify-between mb-2.5">
                          <span className="label-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Currency</span>
                          <div className="flex items-center p-0.5 rounded-lg gap-0.5" style={{ background: 'var(--color-surface-secondary)' }}>
                            {(['CAD', 'USD'] as const).map(c => (
                              <button key={c} onClick={() => setCurrency(c)}
                                className="label-sm px-2.5 py-1 rounded-md font-semibold transition-all"
                                style={currency === c
                                  ? { background: 'white', color: 'var(--color-text-primary)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
                                  : { color: 'var(--color-text-tertiary)' }}>
                                ${c}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="label-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Language</span>
                          <div className="flex items-center p-0.5 rounded-lg gap-0.5" style={{ background: 'var(--color-surface-secondary)' }}>
                            {(['en', 'fr'] as const).map(l => (
                              <button key={l} onClick={() => setLanguage(l)}
                                className="label-sm px-2.5 py-1 rounded-md font-semibold transition-all"
                                style={language === l
                                  ? { background: 'white', color: 'var(--color-text-primary)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
                                  : { color: 'var(--color-text-tertiary)' }}>
                                {l.toUpperCase()}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Sign out */}
                      <div className="p-1.5">
                        <button
                          onClick={() => signOut({ callbackUrl: '/login' })}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl label font-medium transition-colors"
                          style={{ color: 'var(--color-accent)' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-error-soft)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                          <LogOut className="w-4 h-4 flex-shrink-0" /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer that mirrors sidebar width */}
      <div className="flex-shrink-0 transition-all duration-300"
        style={{ width: sidebarOpen ? '256px' : '0px' }} />

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0" style={{ height: '100vh', overflow: 'hidden' }}>

        {/* Top bar — always visible, content scrolls below */}
        <header className="flex-shrink-0 z-30 h-16 flex items-center gap-4"
          style={{ background: 'rgba(247,246,244,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--color-border)', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
          <button onClick={toggleSidebar}
            className="text-text-muted hover:text-nav transition-colors flex-shrink-0">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Breadcrumb */}
          <div className="flex-1 flex items-center gap-2 body-sm min-w-0">
            <span className="text-text-light flex-shrink-0">IPOReady</span>
            <ChevronRight className="w-3 h-3 text-text-light flex-shrink-0" />
            <span className="font-medium text-text-muted truncate">
              {breadcrumb}
            </span>
          </div>

          {/* auditus.ai */}
          <a href="https://auditus.ai" target="_blank"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full label-sm font-medium transition-colors flex-shrink-0"
            style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-error-soft)', e.currentTarget.style.color = 'var(--color-accent)', e.currentTarget.style.borderColor = 'var(--color-accent)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-bg-primary)', e.currentTarget.style.color = 'var(--color-text-secondary)', e.currentTarget.style.borderColor = 'var(--color-border)')}>
            <Zap className="w-3 h-3" /> Preparing for audit?
          </a>

          {/* Notifications bell */}
          <div ref={bellRef} style={{ position: 'relative', flexShrink: 0 }}>
            <button
              onClick={() => setShowBellDropdown(v => !v)}
              className="relative p-2 rounded-full hover:bg-bg transition-colors"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              <Bell className="w-5 h-5 text-text-muted" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full text-white flex items-center justify-center font-bold"
                  style={{ background: 'var(--color-accent)', fontSize: '9px' }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Bell dropdown */}
            <AnimatePresence>
              {showBellDropdown && (
                <motion.div
                  key="bell-dropdown"
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    width: '360px', maxHeight: '480px',
                    background: 'white', borderRadius: '16px',
                    border: '1px solid var(--color-border)',
                    boxShadow: '0 12px 48px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
                    zIndex: 50, overflow: 'hidden', display: 'flex', flexDirection: 'column',
                  }}
                >
                  {/* Header */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 16px', borderBottom: '1px solid var(--color-border)',
                    background: 'var(--color-bg-primary)', flexShrink: 0,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Bell style={{ width: '14px', height: '14px', color: 'var(--color-text-primary)' }} />
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>Notifications</span>
                      {unreadCount > 0 && (
                        <span style={{
                          fontSize: '10px', fontWeight: 700, background: 'var(--color-accent)', color: 'white',
                          borderRadius: '20px', padding: '1px 6px',
                        }}>
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '4px',
                          fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)',
                          background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px',
                          borderRadius: '6px',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface-secondary)', e.currentTarget.style.color = 'var(--color-text-primary)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'none', e.currentTarget.style.color = 'var(--color-text-secondary)')}
                      >
                        <CheckCheck style={{ width: '12px', height: '12px' }} /> Mark all read
                      </button>
                    )}
                  </div>

                  {/* Notification list */}
                  <div style={{ overflowY: 'auto', flex: 1 }}>
                    {dbNotifications.length === 0 ? (
                      <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                        <Bell style={{ width: '24px', height: '24px', color: 'var(--color-disabled)', margin: '0 auto 8px' }} />
                        <p style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', margin: 0 }}>No notifications yet</p>
                      </div>
                    ) : (
                      dbNotifications.map((n, i) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            if (!n.read) markNotificationRead(n.id)
                            if (n.link) {
                              setShowBellDropdown(false)
                              window.location.href = n.link
                            }
                          }}
                          style={{
                            display: 'flex', alignItems: 'flex-start', gap: '10px',
                            padding: '12px 16px',
                            borderBottom: i < dbNotifications.length - 1 ? '1px solid #F0EFED' : 'none',
                            background: n.read ? 'transparent' : 'var(--color-surface-light)',
                            cursor: n.link ? 'pointer' : 'default',
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={e => { if (n.link) (e.currentTarget as HTMLDivElement).style.background = 'var(--color-bg-primary)' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = n.read ? 'transparent' : 'var(--color-surface-light)' }}
                        >
                          {/* Unread dot */}
                          <div style={{
                            width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0, marginTop: '5px',
                            background: n.read ? 'transparent' : 'var(--color-accent)',
                          }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: '13px', fontWeight: n.read ? 500 : 700, color: 'var(--color-text-primary)', margin: '0 0 2px', lineHeight: 1.4 }}>
                              {n.title}
                            </p>
                            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0 0 4px', lineHeight: 1.4 }}>
                              {n.message}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Clock style={{ width: '10px', height: '10px', color: 'var(--color-text-tertiary)' }} />
                              <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>{timeAgo(n.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer link */}
                  <div style={{ flexShrink: 0, padding: '10px 16px', borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-primary)' }}>
                    <Link
                      href="/notifications"
                      onClick={() => setShowBellDropdown(false)}
                      style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', textDecoration: 'none', display: 'block', textAlign: 'center' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-primary)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
                    >
                      Manage notification preferences →
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User chip — name + role (clickable) */}
          <button
            onClick={() => setShowAccountPanel(true)}
            className="hidden md:flex items-center gap-2.5 pl-3 flex-shrink-0 rounded-xl transition-colors"
            style={{ borderLeft: '1px solid var(--color-border)', paddingRight: '8px', paddingTop: '6px', paddingBottom: '6px', cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface-secondary)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white label-xs font-bold flex-shrink-0"
              style={{ background: 'var(--color-text-primary)' }}>
              {getInitials(session?.user?.name)}
            </div>
            <div className="text-left">
              <p className="text-nav label font-semibold leading-tight">
                {session?.user?.name || 'User'}
              </p>
              <p className="caption-sm leading-tight" style={{ color: 'var(--color-text-tertiary)' }}>
                {formatRole((session?.user as any)?.role)}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--color-text-muted)', marginLeft: '2px' }} />
          </button>
        </header>

        {/* ── Renewal notice banners ─────────────────────────────────────── */}
        <AnimatePresence>
          {/* 14-day amber warning — dismissible */}
          {daysRemaining > 7 && daysRemaining <= 14 && showRenewalBanner && (
            <motion.div
              key="renewal-amber"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ flexShrink: 0, overflow: 'hidden' }}
            >
              <div style={{ background: 'var(--color-warning-pale)', borderBottom: '1px solid #FDE68A', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-warning-dark)' }} />
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-warning-dark)', flex: 1 }}>
                  Your subscription renews in <strong>{daysRemaining} days</strong> on {renewalDate}. Billing processes automatically — no action needed.
                </p>
                <Link href="/account"
                  style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-warning)', textDecoration: 'none', whiteSpace: 'nowrap', padding: '4px 10px', borderRadius: '6px', border: '1px solid #FDE68A', background: 'rgba(253,230,138,0.3)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(253,230,138,0.6)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(253,230,138,0.3)')}>
                  Manage Billing
                </Link>
                <button onClick={() => setShowRenewalBanner(false)} style={{ color: 'var(--color-warning)', opacity: 0.5, background: 'none', border: 'none', cursor: 'pointer', padding: '2px', flexShrink: 0 }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '0.5')}>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* 7-day red urgent — not dismissible */}
          {daysRemaining > 1 && daysRemaining <= 7 && (
            <motion.div
              key="renewal-red"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ flexShrink: 0, overflow: 'hidden' }}
            >
              <div style={{ background: 'var(--color-error-light)', borderBottom: '1px solid #FECACA', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-error)' }} />
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-error-dark)', flex: 1 }}>
                  ⚠ Action required — subscription expires in <strong>{daysRemaining} day{daysRemaining > 1 ? 's' : ''}</strong>. Renew now to avoid service interruption and data freeze.
                </p>
                <Link href="/account"
                  style={{ fontSize: '12px', fontWeight: 700, color: 'white', textDecoration: 'none', whiteSpace: 'nowrap', padding: '5px 12px', borderRadius: '6px', background: 'var(--color-error)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-error-dark)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-error)')}>
                  Renew Now →
                </Link>
              </div>
            </motion.div>
          )}

          {/* Overdue / frozen state */}
          {daysRemaining <= 0 && (
            <motion.div
              key="renewal-frozen"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ flexShrink: 0, overflow: 'hidden' }}
            >
              <div style={{ background: 'var(--color-text-primary)', borderBottom: '1px solid #333', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <RefreshCcw className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-disabled)', flex: 1 }}>
                  Your subscription has lapsed. <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>Your data is safe — renew to restore full access.</span>
                </p>
                <Link href="/account"
                  style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-primary)', textDecoration: 'none', whiteSpace: 'nowrap', padding: '5px 12px', borderRadius: '6px', background: 'white' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-bg-primary)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
                  Restore Access →
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page content — only this area scrolls */}
        <main className="flex-1 overflow-y-auto p-8" style={{ position: 'relative' }}>
          {children}
          {/* Frozen state overlay — read-only mode */}
          {daysRemaining <= 0 && (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 10,
              background: 'rgba(247,246,244,0.7)', backdropFilter: 'blur(1px)',
              pointerEvents: 'all',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: '16px', padding: '32px',
            }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <RefreshCcw style={{ width: '22px', height: '22px', color: 'white' }} />
              </div>
              <div style={{ textAlign: 'center', maxWidth: '380px' }}>
                <p style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '6px' }}>Account Frozen — Read Only</p>
                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
                  Your subscription has lapsed. All editing is disabled. <strong style={{ color: 'var(--color-text-primary)' }}>Your data is safe</strong> — nothing has been deleted.
                </p>
                <Link href="/account"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', background: 'var(--color-text-primary)', color: 'white', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#333')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-text-primary)')}>
                  Restore Access — Renew Now →
                </Link>
                <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '10px' }}>Data preserved for 90 days after expiry</p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── Account Panel ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showAccountPanel && (
          <>
            {/* Backdrop */}
            <motion.div
              key="account-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowAccountPanel(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.3)' }}
            />

            {/* Panel */}
            <motion.div
              key="account-panel"
              initial={{ x: 380 }}
              animate={{ x: 0 }}
              exit={{ x: 380 }}
              transition={{ type: 'spring', stiffness: 340, damping: 34 }}
              style={{
                position: 'fixed', top: 0, right: 0, bottom: 0,
                width: '380px', zIndex: 50,
                display: 'flex', flexDirection: 'column',
                background: 'var(--color-primary)',
                boxShadow: '-8px 0 48px rgba(0,0,0,0.4)',
              }}
            >
              {/* Panel Header (fixed) */}
              <div style={{ flexShrink: 0, background: 'var(--color-text-primary)', padding: '20px 20px 16px', borderBottom: '1px solid #2A2A2A' }}>
                {/* Close button */}
                <button
                  onClick={() => setShowAccountPanel(false)}
                  style={{
                    position: 'absolute', top: '16px', right: '16px',
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: 'var(--color-stroke-dark)', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--color-text-tertiary)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#333')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-stroke-dark)')}
                >
                  <X style={{ width: '14px', height: '14px' }} />
                </button>

                {/* Avatar */}
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #E8312A 0%, #FF6B35 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '18px', fontWeight: 700, color: 'white', marginBottom: '12px',
                }}>
                  {getInitials(session?.user?.name)}
                </div>

                <p style={{ fontSize: '16px', fontWeight: 700, color: 'white', marginBottom: '3px' }}>
                  {session?.user?.name || 'User'}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '10px' }}>
                  {formatRole((session?.user as any)?.role)}
                </p>

                {/* Active status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--color-success-bright)', flexShrink: 0 }} />
                  <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>{planName} · Active</span>
                </div>
              </div>

              {/* Scrollable Body */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '0' }}>

                {/* Section 1 — PACE™ Velocity */}
                <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #1E1E1E' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      PACE™ Velocity Score
                    </span>
                    <span style={{ fontSize: '8px', fontWeight: 700, background: 'var(--color-text-primary)', color: 'var(--color-text-tertiary)', border: '1px solid #2A2A2A', borderRadius: '3px', padding: '1px 4px', letterSpacing: '0.05em' }}>
                      IP
                    </span>
                  </div>

                  {/* Score display with ring */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                    {/* Circular ring progress */}
                    <div style={{ position: 'relative', width: '72px', height: '72px', flexShrink: 0 }}>
                      <svg width="72" height="72" viewBox="0 0 72 72" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="36" cy="36" r="30" fill="none" stroke="#2A2A2A" strokeWidth="5" />
                        <circle
                          cx="36" cy="36" r="30" fill="none"
                          stroke="url(#paceGrad)" strokeWidth="5"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 30}`}
                          strokeDashoffset={`${2 * Math.PI * 30 * (1 - paceScore / 100)}`}
                        />
                        <defs>
                          <linearGradient id="paceGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#E8312A" />
                            <stop offset="100%" stopColor="#FF6B35" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '20px', fontWeight: 800, color: 'white',
                      }}>
                        {paceScore}
                      </div>
                    </div>

                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-success-bright)', marginBottom: '4px' }}>
                        Accelerating ↑
                      </p>
                      <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '10px' }}>
                        Top 30% of issuers
                      </p>
                      {/* Progress bar */}
                      <div style={{ height: '4px', background: 'var(--color-stroke-dark)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${paceScore}%`, background: 'linear-gradient(90deg, #E8312A, #FF6B35)', borderRadius: '2px' }} />
                      </div>
                      <p style={{ fontSize: '10px', color: 'var(--color-text-secondary)', marginTop: '6px' }}>
                        {paceScore} / 100
                      </p>
                    </div>
                  </div>

                  {/* Days to listing */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-text-primary)', border: '1px solid #2A2A2A', borderRadius: '10px', padding: '8px 12px' }}>
                    <Flame style={{ width: '14px', height: '14px', color: 'var(--color-accent-secondary)', flexShrink: 0 }} />
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                      ~{estimatedDays} days to TSXV listing
                    </span>
                  </div>
                </div>

                {/* Section 2 — Plan & Billing */}
                <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #1E1E1E' }}>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
                    Your Plan &amp; Billing
                  </p>

                  <div style={{ background: 'var(--color-text-primary)', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '14px' }}>
                    {/* Plan name + badge */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>{planName}</span>
                      <span style={{ fontSize: '10px', fontWeight: 700, background: 'var(--color-accent-purple)', color: 'var(--color-surface-light)', borderRadius: '20px', padding: '2px 8px' }}>
                        GROWTH
                      </span>
                    </div>

                    {/* Price */}
                    <p style={{ fontSize: '20px', fontWeight: 800, color: 'white', marginBottom: '10px' }}>
                      {planPrice}
                    </p>

                    {/* Status row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--color-success-bright)', flexShrink: 0 }} />
                      <span style={{ fontSize: '12px', color: 'var(--color-success-bright)', fontWeight: 600 }}>Active</span>
                    </div>

                    {/* Renewal */}
                    <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
                      Renews: {renewalDate} · {daysRemaining} days remaining
                    </p>

                    {/* Renewal warning */}
                    {daysRemaining <= 14 && (
                      <div style={{ background: 'var(--color-error-dark)', border: '1px solid #7F1D1D', borderRadius: '8px', padding: '8px 10px', marginBottom: '10px' }}>
                        <p style={{ fontSize: '11px', color: 'var(--color-error-soft)', fontWeight: 500 }}>
                          ⚠ Renewal due in {daysRemaining} days — renew now to avoid service interruption
                        </p>
                      </div>
                    )}

                    {/* Manage billing link */}
                    <Link href="/account" onClick={() => setShowAccountPanel(false)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--color-text-secondary)', textDecoration: 'none' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-tertiary)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
                    >
                      <CreditCard style={{ width: '12px', height: '12px' }} />
                      Manage Billing →
                    </Link>
                  </div>
                </div>

                {/* Section 3 — Quick Access */}
                <div style={{ padding: '20px 20px 8px', borderBottom: '1px solid #1E1E1E' }}>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                    Quick Access
                  </p>

                  {[
                    { label: 'Account Settings',   href: '/account',        icon: Settings,  badge: null },
                    { label: 'Team & Roles',        href: '/team',           icon: Shield,    badge: null },
                    { label: 'Notifications',       href: '/notifications',  icon: BellRing,  badge: unreadCount > 0 ? unreadCount : null },
                    { label: 'Integrations',        href: '/integrations',   icon: Plug,      badge: null },
                    { label: 'PACE™ Daily Pulse',   href: '/pace/pulse',     icon: Flame,     badge: null },
                    { label: 'Help & Resources',    href: '/resources',      icon: HelpCircle, badge: null },
                    { label: 'Referral Program',    href: '/referrals',      icon: Gift,      badge: null },
                  ].map(({ label, href, icon: Icon, badge }) => (
                    <Link key={href + label} href={href} onClick={() => setShowAccountPanel(false)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 10px', borderRadius: '10px',
                        textDecoration: 'none', marginBottom: '2px', cursor: 'pointer',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-text-primary)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '8px',
                        background: 'var(--color-text-primary)', border: '1px solid #2A2A2A',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <Icon style={{ width: '14px', height: '14px', color: 'var(--color-text-tertiary)' }} />
                      </div>
                      <span style={{ flex: 1, fontSize: '13px', fontWeight: 500, color: 'var(--color-border)' }}>{label}</span>
                      {badge !== null && (
                        <span style={{
                          fontSize: '10px', fontWeight: 700, background: 'var(--color-accent)', color: 'white',
                          borderRadius: '20px', padding: '1px 6px', flexShrink: 0,
                        }}>
                          {badge}
                        </span>
                      )}
                      <ChevronRight style={{ width: '14px', height: '14px', color: '#444', flexShrink: 0 }} />
                    </Link>
                  ))}
                </div>

                {/* Section 4 — Preferences */}
                <div style={{ padding: '20px 20px 20px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
                    Preferences
                  </p>

                  {/* Currency */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', fontWeight: 500 }}>Currency</span>
                    <div style={{ display: 'flex', alignItems: 'center', padding: '3px', borderRadius: '8px', gap: '2px', background: 'var(--color-text-primary)', border: '1px solid #2A2A2A' }}>
                      {(['CAD', 'USD'] as const).map(c => (
                        <button key={c} onClick={() => setCurrency(c)}
                          style={currency === c
                            ? { background: 'var(--color-stroke-dark)', color: 'white', fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer' }
                            : { background: 'transparent', color: 'var(--color-text-secondary)', fontSize: '12px', fontWeight: 600, padding: '4px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                        >
                          ${c}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Language */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', fontWeight: 500 }}>Language</span>
                    <div style={{ display: 'flex', alignItems: 'center', padding: '3px', borderRadius: '8px', gap: '2px', background: 'var(--color-text-primary)', border: '1px solid #2A2A2A' }}>
                      {(['en', 'fr'] as const).map(l => (
                        <button key={l} onClick={() => setLanguage(l)}
                          style={language === l
                            ? { background: 'var(--color-stroke-dark)', color: 'white', fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer' }
                            : { background: 'transparent', color: 'var(--color-text-secondary)', fontSize: '12px', fontWeight: 600, padding: '4px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                        >
                          {l.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* Panel Footer (fixed) */}
              <div style={{ flexShrink: 0, padding: '16px 20px', borderTop: '1px solid #1E1E1E', background: 'var(--color-primary)' }}>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '8px', padding: '12px', borderRadius: '12px',
                    background: 'var(--color-error-dark)', border: '1px solid #7F1D1D',
                    color: 'var(--color-error-soft)', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-error-dark)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-error-dark)')}
                >
                  <LogOut style={{ width: '15px', height: '15px' }} />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── 1-Day Renewal Blocking Modal ──────────────────────────────────── */}
      <AnimatePresence>
        {daysRemaining <= 1 && daysRemaining > 0 && showRenewalModal && (
          <>
            <motion.div
              key="renewal-modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
            />
            <motion.div
              key="renewal-modal"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{
                position: 'fixed', zIndex: 71,
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'white', borderRadius: '20px',
                padding: '36px', maxWidth: '460px',
                width: 'calc(100% - 48px)',
                boxShadow: '0 32px 80px rgba(0,0,0,0.25)',
                textAlign: 'center',
              }}
            >
              {/* Icon */}
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--color-error-light)', border: '2px solid #FECACA', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <AlertTriangle style={{ width: '24px', height: '24px', color: 'var(--color-error)' }} />
              </div>

              <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                Subscription Expires Tomorrow
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '6px' }}>
                Your <strong style={{ color: 'var(--color-text-primary)' }}>{planName}</strong> subscription expires on <strong style={{ color: 'var(--color-text-primary)' }}>{renewalDate}</strong>.
              </p>
              <p style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', lineHeight: 1.6, marginBottom: '28px' }}>
                Renew now to maintain uninterrupted access. If billing is not resolved by expiry, your account will be frozen in read-only mode. <strong style={{ color: 'var(--color-text-primary)' }}>Your data is always safe.</strong>
              </p>

              {/* What happens if frozen */}
              <div style={{ background: 'var(--color-surface-light)', border: '1px solid #FDE68A', borderRadius: '10px', padding: '14px 16px', marginBottom: '24px', textAlign: 'left' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-warning)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>If not renewed by tomorrow</p>
                {[
                  'Site enters read-only mode — no edits or uploads',
                  'Team members cannot update tasks or checklist items',
                  'Expert network inquiries are disabled',
                  'All data preserved — nothing is deleted',
                  'Full access restored immediately upon renewal',
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: i < 4 ? '6px' : '0' }}>
                    <span style={{ fontSize: '11px', color: i < 2 ? 'var(--color-error)' : 'var(--color-success)', fontWeight: 700, flexShrink: 0, marginTop: '1px' }}>{i < 2 ? '✗' : '✓'}</span>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>{item}</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link href="/account"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '13px 24px', borderRadius: '12px', background: 'var(--color-error)', color: 'white', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-error-dark)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-error)')}>
                  Renew Subscription Now →
                </Link>
                <button
                  onClick={() => setShowRenewalModal(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: 'var(--color-text-tertiary)', padding: '6px' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-tertiary)')}>
                  Remind me later
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  )
}
