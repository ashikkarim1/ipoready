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
  CheckCheck, Clock
} from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import type { Notification } from '@/types'

const NAV_ITEMS = [
  { href: '/dashboard',       icon: LayoutDashboard, label: 'Mission Control',    badge: null,   key: 'dashboard'   },
  { href: '/pace',            icon: Activity,        label: 'PACE™ Velocity',     badge: 'IP',   key: 'pace'        },
  { href: '/checklist',       icon: CheckSquare,     label: 'IPO Checklist',      badge: null,   key: 'checklist'   },
  { href: '/cap-table',       icon: PieChart,        label: 'Cap Table',          badge: 'AI',   key: 'cap-table'   },
  { href: '/raising-capital', icon: Banknote,        label: 'Raising Capital',    badge: 'New',  key: 'raising'     },
  { href: '/documents',       icon: FileText,        label: 'Documents',          badge: null,   key: 'documents'   },
  { href: '/prospectus',      icon: FileText,        label: 'Prospectus Builder', badge: '✨',   key: 'prospectus'  },
  { href: '/team',            icon: Users,           label: 'Team & Roles',       badge: null,   key: 'team'        },
  { href: '/templates',       icon: Award,           label: 'Templates & Forms',  badge: null,   key: 'templates'   },
  { href: '/resources',       icon: BookOpen,        label: 'Resource Centre',    badge: 'New',  key: 'resources'   },
  { href: '/checklist-guide', icon: FileSearch,      label: 'Compliance Guide',   badge: 'New',  key: 'guide'       },
  { href: '/marketplace',     icon: ShoppingBag,     label: 'Expert Network',     badge: null,   key: 'marketplace' },
  { href: '/vendor',          icon: Store,           label: 'Vendor Portal',      badge: 'New',  key: 'vendor'      },
  { href: '/integrations',    icon: Plug,            label: 'Integrations',       badge: '3',    key: 'integrations'},
  { href: '/notifications',   icon: BellRing,        label: 'Notifications',      badge: null,   key: 'notifs'      },
  { href: '/referrals',       icon: Gift,            label: 'Referral Program',   badge: '$',    key: 'referrals'   },
  { href: '/partners',        icon: Rocket,          label: 'Partner Programme',  badge: null,   key: 'partners'    },
  { href: '/post-listing',    icon: TrendingUp,      label: 'Post-Listing',       badge: 'Soon', key: 'post'        },
  { href: '/pricing',         icon: DollarSign,      label: 'Pricing',            badge: null,   key: 'pricing'     },
  { href: '/account',         icon: Settings,        label: 'Account',            badge: null,   key: 'account'     },
]

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
      style={{ background: '#1A1A1A', color: 'white', letterSpacing: '0.04em' }}>{badge}</span>
  )
  if (badge === 'AI')  return (
    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
      style={{ background: '#FEF3C7', color: '#B45309' }}>{badge}</span>
  )
  if (badge === 'New') return (
    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
      style={{ background: '#FDECEB', color: '#E8312A' }}>{badge}</span>
  )
  if (badge === 'Soon') return (
    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
      style={{ background: '#F5F3FF', color: '#7C3AED' }}>{badge}</span>
  )
  return (
    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
      style={{ background: '#F7F6F4', color: '#9A9A9A' }}>{badge}</span>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { company, currency, language, setCurrency, setLanguage, sidebarOpen, toggleSidebar, setCompany, setUserPlan } = useAppStore()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showAccountPanel, setShowAccountPanel] = useState(false)

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

  const breadcrumb = pathname.split('/')[1] || 'Dashboard'

  return (
    <div className="min-h-screen flex" style={{ background: '#F7F6F4' }}>

      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -264 }}
            animate={{ x: 0 }}
            exit={{ x: -264 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed left-0 top-0 bottom-0 w-64 z-40 flex flex-col"
            style={{ background: '#FFFFFF', borderRight: '1px solid #E5E4E0' }}
          >
            {/* Logo */}
            <div className="px-6 py-5" style={{ borderBottom: '1px solid #E5E4E0' }}>
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: '#1A1A1A' }}>
                  <Rocket className="w-4 h-4 text-white" />
                </div>
                <span className="font-display font-bold text-lg text-nav tracking-tight">
                  IPO<span style={{ color: '#E8312A' }}>Ready</span>
                </span>
              </Link>
            </div>

            {/* Company summary */}
            {company && (
              <div className="px-4 py-4" style={{ borderBottom: '1px solid #E5E4E0' }}>
                <div className="flex items-start gap-2.5 p-3 rounded-xl"
                  style={{ background: '#F7F6F4', border: '1px solid #E5E4E0' }}>
                  <Building2 className="w-3.5 h-3.5 text-text-muted mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-nav text-xs font-semibold truncate">{company.name}</p>
                    <p className="text-text-muted text-xs">{company.targetExchange.toUpperCase()} · {company.listingType.toUpperCase()}</p>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-text-light text-xs">Progress</span>
                        <span className="text-xs font-semibold text-accent">{company.progressPercentage}%</span>
                      </div>
                      <div className="progress-bar" style={{ height: '4px' }}>
                        <div className="progress-fill" style={{ width: `${company.progressPercentage}%`, background: '#E8312A' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
              {NAV_ITEMS.map(({ href, icon: Icon, label, badge, key }) => {
                const isActive = pathname === href || pathname.startsWith(href + '/')

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
            </nav>

            {/* PACE Score */}
            {company && (
              <div className="px-4 py-4" style={{ borderTop: '1px solid #E5E4E0' }}>
                <div className="p-3 rounded-xl" style={{ background: '#F7F6F4', border: '1px solid #E5E4E0' }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-accent" />
                      <span className="text-xs font-semibold text-text-muted">PACE™ Score</span>
                      <div style={{ position: 'relative' }}>
                        <HelpCircle
                          className="w-3 h-3"
                          style={{ color: '#C4C2BE', cursor: 'pointer' }}
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
                          width: '220px', background: '#1A1A1A', color: 'white', borderRadius: '10px',
                          padding: '10px 12px', fontSize: '11px', lineHeight: 1.5, zIndex: 100,
                          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                        }}>
                          <p style={{ fontWeight: 700, marginBottom: '4px', color: 'white' }}>What is PACE™?</p>
                          <p style={{ color: 'rgba(255,255,255,0.65)', marginBottom: '8px' }}>
                            IPOReady&apos;s proprietary velocity engine measuring execution speed × phase weighting × quality.
                          </p>
                          <Link href="/dashboard" style={{ color: '#FF6B35', fontWeight: 600, textDecoration: 'none', fontSize: '11px' }}>
                            See full breakdown →
                          </Link>
                          {/* Tooltip arrow */}
                          <div style={{ position: 'absolute', bottom: '-5px', left: '12px', width: '10px', height: '10px', background: '#1A1A1A', transform: 'rotate(45deg)', borderRadius: '1px' }} />
                        </div>
                      </div>
                    </div>
                    <span className="font-bold text-xl text-nav">{company.paceScore}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${company.paceScore}%`, background: '#1A1A1A' }} />
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-text-light text-xs">~{company.estimatedDaysToIPO} days to listing</p>
                    <span className="text-[9px] font-bold rounded-sm" style={{ background: '#1A1A1A', color: 'white', padding: '1px 4px', letterSpacing: '0.04em' }}>IP</span>
                  </div>
                </div>
              </div>
            )}

            {/* User */}
            <div className="px-4 py-4" style={{ borderTop: '1px solid #E5E4E0' }}>
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(v => !v)}
                  className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-bg transition-colors"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: '#1A1A1A' }}>
                    {session?.user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-nav text-xs font-semibold truncate">{session?.user?.name || 'User'}</p>
                    <p className="text-text-muted text-xs truncate">{session?.user?.email}</p>
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
                      style={{ background: 'white', border: '1px solid #E5E4E0', boxShadow: '0 -12px 48px rgba(0,0,0,0.12), 0 -2px 8px rgba(0,0,0,0.06)' }}
                    >
                      {/* User info */}
                      <div className="px-4 py-3.5" style={{ background: '#F7F6F4', borderBottom: '1px solid #EEECE8' }}>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                            style={{ background: '#1A1A1A' }}>
                            {getInitials(session?.user?.name)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold truncate" style={{ color: '#1A1A1A' }}>{session?.user?.name || 'User'}</p>
                            <p className="text-xs truncate" style={{ color: '#9A9A9A' }}>{session?.user?.email}</p>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#22C55E' }} />
                          <span className="text-xs font-medium" style={{ color: '#717171' }}>
                            {formatRole((session?.user as any)?.role)}
                          </span>
                        </div>
                      </div>

                      {/* Settings link */}
                      <div className="p-1.5" style={{ borderBottom: '1px solid #F0EFED' }}>
                        <Link href="/account"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors"
                          style={{ color: '#1A1A1A' }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#F7F6F4')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                          <Settings className="w-4 h-4 flex-shrink-0" style={{ color: '#717171' }} />
                          Account Settings
                        </Link>
                      </div>

                      {/* Preferences */}
                      <div className="px-4 py-3" style={{ borderBottom: '1px solid #F0EFED' }}>
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#C4C2BE' }}>
                          Preferences
                        </p>
                        <div className="flex items-center justify-between mb-2.5">
                          <span className="text-xs font-medium" style={{ color: '#717171' }}>Currency</span>
                          <div className="flex items-center p-0.5 rounded-lg gap-0.5" style={{ background: '#F0EFED' }}>
                            {(['CAD', 'USD'] as const).map(c => (
                              <button key={c} onClick={() => setCurrency(c)}
                                className="text-xs px-2.5 py-1 rounded-md font-semibold transition-all"
                                style={currency === c
                                  ? { background: 'white', color: '#1A1A1A', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
                                  : { color: '#9A9A9A' }}>
                                ${c}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium" style={{ color: '#717171' }}>Language</span>
                          <div className="flex items-center p-0.5 rounded-lg gap-0.5" style={{ background: '#F0EFED' }}>
                            {(['en', 'fr'] as const).map(l => (
                              <button key={l} onClick={() => setLanguage(l)}
                                className="text-xs px-2.5 py-1 rounded-md font-semibold transition-all"
                                style={language === l
                                  ? { background: 'white', color: '#1A1A1A', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
                                  : { color: '#9A9A9A' }}>
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
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors"
                          style={{ color: '#E8312A' }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#FDECEB')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                          <LogOut className="w-4 h-4 flex-shrink-0" /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Spacer that mirrors sidebar width */}
      <div className="flex-shrink-0 transition-all duration-300"
        style={{ width: sidebarOpen ? '256px' : '0px' }} />

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0" style={{ height: '100vh', overflow: 'hidden' }}>

        {/* Top bar — always visible, content scrolls below */}
        <header className="flex-shrink-0 z-30 h-16 flex items-center gap-4"
          style={{ background: 'rgba(247,246,244,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #E5E4E0', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
          <button onClick={toggleSidebar}
            className="text-text-muted hover:text-nav transition-colors flex-shrink-0">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Breadcrumb */}
          <div className="flex-1 flex items-center gap-2 text-sm min-w-0">
            <span className="text-text-light flex-shrink-0">IPOReady</span>
            <ChevronRight className="w-3 h-3 text-text-light flex-shrink-0" />
            <span className="capitalize font-medium text-text-muted truncate">
              {breadcrumb.replace(/-/g, ' ')}
            </span>
          </div>

          {/* auditus.ai */}
          <a href="https://auditus.ai" target="_blank"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex-shrink-0"
            style={{ background: '#F7F6F4', border: '1px solid #E5E4E0', color: '#717171' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#FDECEB', e.currentTarget.style.color = '#E8312A', e.currentTarget.style.borderColor = '#E8312A')}
            onMouseLeave={e => (e.currentTarget.style.background = '#F7F6F4', e.currentTarget.style.color = '#717171', e.currentTarget.style.borderColor = '#E5E4E0')}>
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
                  style={{ background: '#E8312A', fontSize: '9px' }}>
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
                    border: '1px solid #E5E4E0',
                    boxShadow: '0 12px 48px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
                    zIndex: 50, overflow: 'hidden', display: 'flex', flexDirection: 'column',
                  }}
                >
                  {/* Header */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 16px', borderBottom: '1px solid #E5E4E0',
                    background: '#F7F6F4', flexShrink: 0,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Bell style={{ width: '14px', height: '14px', color: '#1A1A1A' }} />
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A1A' }}>Notifications</span>
                      {unreadCount > 0 && (
                        <span style={{
                          fontSize: '10px', fontWeight: 700, background: '#E8312A', color: 'white',
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
                          fontSize: '11px', fontWeight: 600, color: '#717171',
                          background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px',
                          borderRadius: '6px',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#F0EFED', e.currentTarget.style.color = '#1A1A1A')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'none', e.currentTarget.style.color = '#717171')}
                      >
                        <CheckCheck style={{ width: '12px', height: '12px' }} /> Mark all read
                      </button>
                    )}
                  </div>

                  {/* Notification list */}
                  <div style={{ overflowY: 'auto', flex: 1 }}>
                    {dbNotifications.length === 0 ? (
                      <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                        <Bell style={{ width: '24px', height: '24px', color: '#D1D5DB', margin: '0 auto 8px' }} />
                        <p style={{ fontSize: '13px', color: '#9A9A9A', margin: 0 }}>No notifications yet</p>
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
                            background: n.read ? 'transparent' : '#FDFCFB',
                            cursor: n.link ? 'pointer' : 'default',
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={e => { if (n.link) (e.currentTarget as HTMLDivElement).style.background = '#F7F6F4' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = n.read ? 'transparent' : '#FDFCFB' }}
                        >
                          {/* Unread dot */}
                          <div style={{
                            width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0, marginTop: '5px',
                            background: n.read ? 'transparent' : '#E8312A',
                          }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: '13px', fontWeight: n.read ? 500 : 700, color: '#1A1A1A', margin: '0 0 2px', lineHeight: 1.4 }}>
                              {n.title}
                            </p>
                            <p style={{ fontSize: '12px', color: '#717171', margin: '0 0 4px', lineHeight: 1.4 }}>
                              {n.message}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Clock style={{ width: '10px', height: '10px', color: '#9A9A9A' }} />
                              <span style={{ fontSize: '11px', color: '#9A9A9A' }}>{timeAgo(n.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer link */}
                  <div style={{ flexShrink: 0, padding: '10px 16px', borderTop: '1px solid #E5E4E0', background: '#F7F6F4' }}>
                    <Link
                      href="/notifications"
                      onClick={() => setShowBellDropdown(false)}
                      style={{ fontSize: '12px', fontWeight: 600, color: '#717171', textDecoration: 'none', display: 'block', textAlign: 'center' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#1A1A1A')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#717171')}
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
            style={{ borderLeft: '1px solid #E5E4E0', paddingRight: '8px', paddingTop: '6px', paddingBottom: '6px', cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#F0EFED')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: '#1A1A1A' }}>
              {getInitials(session?.user?.name)}
            </div>
            <div className="text-left">
              <p className="text-nav text-sm font-semibold leading-tight">
                {session?.user?.name || 'User'}
              </p>
              <p className="text-xs leading-tight" style={{ color: '#9A9A9A' }}>
                {formatRole((session?.user as any)?.role)}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#C4C2BE', marginLeft: '2px' }} />
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
              <div style={{ background: '#FFFBEB', borderBottom: '1px solid #FDE68A', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: '#D97706' }} />
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#92400E', flex: 1 }}>
                  Your subscription renews in <strong>{daysRemaining} days</strong> on {renewalDate}. Billing processes automatically — no action needed.
                </p>
                <Link href="/account"
                  style={{ fontSize: '12px', fontWeight: 600, color: '#B45309', textDecoration: 'none', whiteSpace: 'nowrap', padding: '4px 10px', borderRadius: '6px', border: '1px solid #FDE68A', background: 'rgba(253,230,138,0.3)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(253,230,138,0.6)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(253,230,138,0.3)')}>
                  Manage Billing
                </Link>
                <button onClick={() => setShowRenewalBanner(false)} style={{ color: '#B45309', opacity: 0.5, background: 'none', border: 'none', cursor: 'pointer', padding: '2px', flexShrink: 0 }}
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
              <div style={{ background: '#FEF2F2', borderBottom: '1px solid #FECACA', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: '#DC2626' }} />
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#991B1B', flex: 1 }}>
                  ⚠ Action required — subscription expires in <strong>{daysRemaining} day{daysRemaining > 1 ? 's' : ''}</strong>. Renew now to avoid service interruption and data freeze.
                </p>
                <Link href="/account"
                  style={{ fontSize: '12px', fontWeight: 700, color: 'white', textDecoration: 'none', whiteSpace: 'nowrap', padding: '5px 12px', borderRadius: '6px', background: '#DC2626' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#B91C1C')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#DC2626')}>
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
              <div style={{ background: '#1A1A1A', borderBottom: '1px solid #333', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <RefreshCcw className="w-4 h-4 flex-shrink-0" style={{ color: '#9CA3AF' }} />
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#D1D5DB', flex: 1 }}>
                  Your subscription has lapsed. <span style={{ color: '#9CA3AF', fontWeight: 400 }}>Your data is safe — renew to restore full access.</span>
                </p>
                <Link href="/account"
                  style={{ fontSize: '12px', fontWeight: 700, color: '#1A1A1A', textDecoration: 'none', whiteSpace: 'nowrap', padding: '5px 12px', borderRadius: '6px', background: 'white' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#F7F6F4')}
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
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <RefreshCcw style={{ width: '22px', height: '22px', color: 'white' }} />
              </div>
              <div style={{ textAlign: 'center', maxWidth: '380px' }}>
                <p style={{ fontSize: '18px', fontWeight: 800, color: '#1A1A1A', marginBottom: '6px' }}>Account Frozen — Read Only</p>
                <p style={{ fontSize: '14px', color: '#717171', lineHeight: 1.6, marginBottom: '20px' }}>
                  Your subscription has lapsed. All editing is disabled. <strong style={{ color: '#1A1A1A' }}>Your data is safe</strong> — nothing has been deleted.
                </p>
                <Link href="/account"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', background: '#1A1A1A', color: 'white', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#333')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#1A1A1A')}>
                  Restore Access — Renew Now →
                </Link>
                <p style={{ fontSize: '11px', color: '#9A9A9A', marginTop: '10px' }}>Data preserved for 90 days after expiry</p>
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
                background: '#111111',
                boxShadow: '-8px 0 48px rgba(0,0,0,0.4)',
              }}
            >
              {/* Panel Header (fixed) */}
              <div style={{ flexShrink: 0, background: '#1A1A1A', padding: '20px 20px 16px', borderBottom: '1px solid #2A2A2A' }}>
                {/* Close button */}
                <button
                  onClick={() => setShowAccountPanel(false)}
                  style={{
                    position: 'absolute', top: '16px', right: '16px',
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: '#2A2A2A', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#9A9A9A',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#333')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#2A2A2A')}
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
                <p style={{ fontSize: '12px', color: '#9A9A9A', marginBottom: '10px' }}>
                  {formatRole((session?.user as any)?.role)}
                </p>

                {/* Active status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22C55E', flexShrink: 0 }} />
                  <span style={{ fontSize: '12px', color: '#9A9A9A' }}>{planName} · Active</span>
                </div>
              </div>

              {/* Scrollable Body */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '0' }}>

                {/* Section 1 — PACE™ Velocity */}
                <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #1E1E1E' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#9A9A9A', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      PACE™ Velocity Score
                    </span>
                    <span style={{ fontSize: '8px', fontWeight: 700, background: '#1A1A1A', color: '#9A9A9A', border: '1px solid #2A2A2A', borderRadius: '3px', padding: '1px 4px', letterSpacing: '0.05em' }}>
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
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#22C55E', marginBottom: '4px' }}>
                        Accelerating ↑
                      </p>
                      <p style={{ fontSize: '11px', color: '#717171', marginBottom: '10px' }}>
                        Top 30% of issuers
                      </p>
                      {/* Progress bar */}
                      <div style={{ height: '4px', background: '#2A2A2A', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${paceScore}%`, background: 'linear-gradient(90deg, #E8312A, #FF6B35)', borderRadius: '2px' }} />
                      </div>
                      <p style={{ fontSize: '10px', color: '#717171', marginTop: '6px' }}>
                        {paceScore} / 100
                      </p>
                    </div>
                  </div>

                  {/* Days to listing */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '10px', padding: '8px 12px' }}>
                    <Flame style={{ width: '14px', height: '14px', color: '#FF6B35', flexShrink: 0 }} />
                    <span style={{ fontSize: '12px', color: '#C4C2BE', fontWeight: 500 }}>
                      ~{estimatedDays} days to TSXV listing
                    </span>
                  </div>
                </div>

                {/* Section 2 — Plan & Billing */}
                <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #1E1E1E' }}>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: '#9A9A9A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
                    Your Plan &amp; Billing
                  </p>

                  <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '14px' }}>
                    {/* Plan name + badge */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>{planName}</span>
                      <span style={{ fontSize: '10px', fontWeight: 700, background: '#3B0764', color: '#D8B4FE', borderRadius: '20px', padding: '2px 8px' }}>
                        GROWTH
                      </span>
                    </div>

                    {/* Price */}
                    <p style={{ fontSize: '20px', fontWeight: 800, color: 'white', marginBottom: '10px' }}>
                      {planPrice}
                    </p>

                    {/* Status row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22C55E', flexShrink: 0 }} />
                      <span style={{ fontSize: '12px', color: '#22C55E', fontWeight: 600 }}>Active</span>
                    </div>

                    {/* Renewal */}
                    <p style={{ fontSize: '11px', color: '#717171', marginBottom: '12px' }}>
                      Renews: {renewalDate} · {daysRemaining} days remaining
                    </p>

                    {/* Renewal warning */}
                    {daysRemaining <= 14 && (
                      <div style={{ background: '#2D0A0A', border: '1px solid #7F1D1D', borderRadius: '8px', padding: '8px 10px', marginBottom: '10px' }}>
                        <p style={{ fontSize: '11px', color: '#FCA5A5', fontWeight: 500 }}>
                          ⚠ Renewal due in {daysRemaining} days — renew now to avoid service interruption
                        </p>
                      </div>
                    )}

                    {/* Manage billing link */}
                    <Link href="/account" onClick={() => setShowAccountPanel(false)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#717171', textDecoration: 'none' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#9A9A9A')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#717171')}
                    >
                      <CreditCard style={{ width: '12px', height: '12px' }} />
                      Manage Billing →
                    </Link>
                  </div>
                </div>

                {/* Section 3 — Quick Access */}
                <div style={{ padding: '20px 20px 8px', borderBottom: '1px solid #1E1E1E' }}>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: '#9A9A9A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
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
                      onMouseEnter={e => (e.currentTarget.style.background = '#1A1A1A')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '8px',
                        background: '#1A1A1A', border: '1px solid #2A2A2A',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <Icon style={{ width: '14px', height: '14px', color: '#9A9A9A' }} />
                      </div>
                      <span style={{ flex: 1, fontSize: '13px', fontWeight: 500, color: '#E5E4E0' }}>{label}</span>
                      {badge !== null && (
                        <span style={{
                          fontSize: '10px', fontWeight: 700, background: '#E8312A', color: 'white',
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
                  <p style={{ fontSize: '11px', fontWeight: 700, color: '#9A9A9A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
                    Preferences
                  </p>

                  {/* Currency */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '13px', color: '#9A9A9A', fontWeight: 500 }}>Currency</span>
                    <div style={{ display: 'flex', alignItems: 'center', padding: '3px', borderRadius: '8px', gap: '2px', background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
                      {(['CAD', 'USD'] as const).map(c => (
                        <button key={c} onClick={() => setCurrency(c)}
                          style={currency === c
                            ? { background: '#2A2A2A', color: 'white', fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer' }
                            : { background: 'transparent', color: '#717171', fontSize: '12px', fontWeight: 600, padding: '4px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                        >
                          ${c}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Language */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', color: '#9A9A9A', fontWeight: 500 }}>Language</span>
                    <div style={{ display: 'flex', alignItems: 'center', padding: '3px', borderRadius: '8px', gap: '2px', background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
                      {(['en', 'fr'] as const).map(l => (
                        <button key={l} onClick={() => setLanguage(l)}
                          style={language === l
                            ? { background: '#2A2A2A', color: 'white', fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer' }
                            : { background: 'transparent', color: '#717171', fontSize: '12px', fontWeight: 600, padding: '4px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                        >
                          {l.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* Panel Footer (fixed) */}
              <div style={{ flexShrink: 0, padding: '16px 20px', borderTop: '1px solid #1E1E1E', background: '#111111' }}>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '8px', padding: '12px', borderRadius: '12px',
                    background: '#2D0A0A', border: '1px solid #7F1D1D',
                    color: '#FCA5A5', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#450A0A')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#2D0A0A')}
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
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#FEF2F2', border: '2px solid #FECACA', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <AlertTriangle style={{ width: '24px', height: '24px', color: '#DC2626' }} />
              </div>

              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1A1A1A', marginBottom: '8px' }}>
                Subscription Expires Tomorrow
              </h2>
              <p style={{ fontSize: '14px', color: '#717171', lineHeight: 1.6, marginBottom: '6px' }}>
                Your <strong style={{ color: '#1A1A1A' }}>{planName}</strong> subscription expires on <strong style={{ color: '#1A1A1A' }}>{renewalDate}</strong>.
              </p>
              <p style={{ fontSize: '13px', color: '#9A9A9A', lineHeight: 1.6, marginBottom: '28px' }}>
                Renew now to maintain uninterrupted access. If billing is not resolved by expiry, your account will be frozen in read-only mode. <strong style={{ color: '#1A1A1A' }}>Your data is always safe.</strong>
              </p>

              {/* What happens if frozen */}
              <div style={{ background: '#FFF8F1', border: '1px solid #FDE68A', borderRadius: '10px', padding: '14px 16px', marginBottom: '24px', textAlign: 'left' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>If not renewed by tomorrow</p>
                {[
                  'Site enters read-only mode — no edits or uploads',
                  'Team members cannot update tasks or checklist items',
                  'Expert network inquiries are disabled',
                  'All data preserved — nothing is deleted',
                  'Full access restored immediately upon renewal',
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: i < 4 ? '6px' : '0' }}>
                    <span style={{ fontSize: '11px', color: i < 2 ? '#DC2626' : '#2D7A5F', fontWeight: 700, flexShrink: 0, marginTop: '1px' }}>{i < 2 ? '✗' : '✓'}</span>
                    <span style={{ fontSize: '12px', color: '#717171', lineHeight: 1.4 }}>{item}</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link href="/account"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '13px 24px', borderRadius: '12px', background: '#DC2626', color: 'white', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#B91C1C')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#DC2626')}>
                  Renew Subscription Now →
                </Link>
                <button
                  onClick={() => setShowRenewalModal(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#9A9A9A', padding: '6px' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#717171')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#9A9A9A')}>
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
