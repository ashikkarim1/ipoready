/**
 * AppShell Integration Guide - Financial Management & Compliance Menu
 * 
 * This file shows how to integrate the new navigation configuration
 * into the existing AppShell component.
 * 
 * CHANGES REQUIRED:
 * 1. Replace NAV_GROUPS in AppShell.tsx with import from src/config/navigation.ts
 * 2. Update imports to include new icons (Calculator, BarChart3, FileCheck, Eye, etc.)
 * 3. Add the utility functions for menu state management
 * 4. Update the navigation rendering logic (minimal changes needed)
 */

'use client'

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { signOut, useSession } from 'next-auth/react'
import {
  ChevronDown, LogOut, Menu, X, ChevronRight, HelpCircle, ExternalLink, BellRing
} from 'lucide-react'

// NEW: Import navigation configuration
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

import { useAppStore } from '@/store/app-store'
import type { Notification } from '@/types'

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

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
  return map[role] ?? role.replace(/_/g, ' ').replace(/\\b\\w/g, c => c.toUpperCase())
}

function getInitials(name?: string | null): string {
  if (!name) return 'U'
  const parts = name.trim().split(' ')
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase()
}

function BadgeChip({ badge }: { badge: string }) {
  if (badge === 'IP')
    return (
      <span
        className="text-[9px] px-1.5 py-0.5 rounded font-bold"
        style={{ background: 'var(--color-text-primary)', color: 'white', letterSpacing: '0.04em' }}
      >
        {badge}
      </span>
    )
  if (badge === 'AI')
    return (
      <span
        className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
        style={{ background: 'var(--color-warning-soft)', color: 'var(--color-warning)' }}
      >
        {badge}
      </span>
    )
  if (badge === 'New')
    return (
      <span
        className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
        style={{ background: 'var(--color-error-soft)', color: 'var(--color-accent)' }}
      >
        {badge}
      </span>
    )
  if (badge === 'Soon')
    return (
      <span
        className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
        style={{ background: 'var(--color-surface-light)', color: 'var(--color-accent-purple)' }}
      >
        {badge}
      </span>
    )
  return (
    <span
      className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
      style={{ background: 'var(--color-bg-primary)', color: 'var(--color-text-tertiary)' }}
    >
      {badge}
    </span>
  )
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT: NavSectionHeader
// ═══════════════════════════════════════════════════════════════
interface NavSectionHeaderProps {
  section: NavGroup
  isExpanded: boolean
  onToggle: () => void
}

function NavSectionHeader({ section, isExpanded, onToggle }: NavSectionHeaderProps) {
  if (!section.collapsible) {
    return (
      <div className="px-4 py-3 flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>
          {section.section}
        </h3>
      </div>
    )
  }

  return (
    <button
      onClick={onToggle}
      className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface-light transition-colors"
      style={{ background: 'transparent' }}
    >
      <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>
        {section.section}
      </h3>
      <motion.div
        animate={{ rotate: isExpanded ? 0 : -90 }}
        transition={{ duration: 0.2 }}
      >
        <ChevronDown size={16} style={{ color: 'var(--color-text-tertiary)' }} />
      </motion.div>
    </button>
  )
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT: NavItemComponent
// ═══════════════════════════════════════════════════════════════
interface NavItemComponentProps {
  item: NavItem
  isActive: boolean
  hasDescription: boolean
}

function NavItemComponent({ item, isActive, hasDescription }: NavItemComponentProps) {
  const IconComponent = item.icon

  return (
    <Link href={item.href}>
      <div
        className="px-4 py-3 flex items-center justify-between rounded-lg transition-all"
        style={{
          background: isActive ? 'var(--color-bg-secondary)' : 'transparent',
          color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
          cursor: 'pointer',
        }}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <IconComponent size={18} />
          <span className="text-sm font-medium truncate">{item.label}</span>
          {item.badge && <BadgeChip badge={item.badge} />}
        </div>
        {hasDescription && (
          <ChevronRight size={16} className="flex-shrink-0 opacity-50" />
        )}
      </div>
    </Link>
  )
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT: Sidebar Navigation
// ═══════════════════════════════════════════════════════════════
interface SidebarNavigationProps {
  pathname: string
  onItemClick?: () => void
}

function SidebarNavigation({ pathname, onItemClick }: SidebarNavigationProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(DEFAULT_EXPANDED_SECTIONS)

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

  return (
    <nav className="flex-1 overflow-y-auto space-y-1">
      {NAV_GROUPS.map((group, idx) => {
        const isExpanded = expandedSections.includes(group.section)

        return (
          <div key={idx}>
            <NavSectionHeader
              section={group}
              isExpanded={isExpanded}
              onToggle={() => toggleSection(group.section)}
            />

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-1 overflow-hidden"
                >
                  {group.items.map(item => {
                    const active = isNavItemActive(pathname, item)
                    return (
                      <div key={item.key} onClick={onItemClick}>
                        <NavItemComponent
                          item={item}
                          isActive={active}
                          hasDescription={!!item.description}
                        />
                      </div>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </nav>
  )
}

// ═══════════════════════════════════════════════════════════════
// MAIN APPSHELL COMPONENT
// ═══════════════════════════════════════════════════════════════
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const {
    company,
    currency,
    language,
    setCurrency,
    setLanguage,
    sidebarOpen,
    toggleSidebar,
    setCompany,
    setUserPlan,
  } = useAppStore()

  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showAccountPanel, setShowAccountPanel] = useState(false)

  // Real notifications from DB
  const [dbNotifications, setDbNotifications] = useState<Notification[]>([])
  const [showBellDropdown, setShowBellDropdown] = useState(false)
  const bellRef = useRef<HTMLDivElement>(null)

  const unreadCount = useMemo(() => dbNotifications.filter(n => !n.read).length, [dbNotifications])

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

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setShowBellDropdown(false)
      }
    }
    if (showBellDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showBellDropdown])

  return (
    <div className="flex h-screen" style={{ background: 'var(--color-bg-primary)' }}>
      {/* SIDEBAR */}
      <motion.div
        animate={{ width: sidebarOpen ? 280 : 0 }}
        transition={{ duration: 0.3 }}
        className="hidden md:flex flex-col border-r"
        style={{
          borderColor: 'var(--color-border-light)',
          background: 'var(--color-surface-default)',
        }}
      >
        {sidebarOpen && (
          <>
            {/* Logo Section */}
            <div className="px-6 py-6 border-b" style={{ borderColor: 'var(--color-border-light)' }}>
              <h1 className="text-xl font-bold">IPOReady</h1>
            </div>

            {/* Navigation */}
            <SidebarNavigation pathname={pathname} onItemClick={() => {}} />

            {/* Footer */}
            <div className="p-4 border-t space-y-2" style={{ borderColor: 'var(--color-border-light)' }}>
              <button className="w-full flex items-center gap-2 px-3 py-2 rounded text-sm hover:bg-surface-light transition-colors">
                <HelpCircle size={16} />
                Help
              </button>
              <button
                onClick={() => signOut({ redirect: true, callbackUrl: '/' })}
                className="w-full flex items-center gap-2 px-3 py-2 rounded text-sm hover:bg-surface-light transition-colors text-error"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          </>
        )}
      </motion.div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TOP NAV */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{
            background: 'var(--color-surface-default)',
            borderColor: 'var(--color-border-light)',
          }}
        >
          {/* Left: Menu Toggle + Company Info */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="flex items-center justify-center w-10 h-10 rounded hover:bg-surface-light transition-colors"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            {company && <span className="text-sm font-medium hidden sm:inline">{company}</span>}
          </div>

          {/* Right: Notifications + User Menu */}
          <div className="flex items-center gap-4">
            {/* Notifications Bell */}
            <div ref={bellRef} className="relative">
              <button
                onClick={() => setShowBellDropdown(!showBellDropdown)}
                className="relative flex items-center justify-center w-10 h-10 rounded hover:bg-surface-light transition-colors"
              >
                <BellRing size={20} />
                {unreadCount > 0 && (
                  <span
                    className="absolute top-2 right-2 w-2 h-2 rounded-full"
                    style={{ background: 'var(--color-error)' }}
                  />
                )}
              </button>

              {/* Notifications Dropdown */}
              {showBellDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-80 rounded-lg shadow-lg border z-50"
                  style={{
                    background: 'var(--color-surface-default)',
                    borderColor: 'var(--color-border-light)',
                  }}
                >
                  <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
                    {dbNotifications.length === 0 ? (
                      <p className="text-sm text-center text-text-tertiary py-4">No notifications</p>
                    ) : (
                      dbNotifications.map(notif => (
                        <div
                          key={notif.id}
                          className="p-3 rounded text-sm hover:bg-bg-secondary transition-colors cursor-pointer"
                          style={{
                            background: notif.read ? 'transparent' : 'var(--color-bg-secondary)',
                          }}
                        >
                          <p className="font-medium">{notif.title}</p>
                          <p className="text-xs text-text-tertiary">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            {/* User Menu */}
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 px-3 py-2 rounded hover:bg-surface-light transition-colors"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{
                  background: 'var(--color-accent)',
                  color: 'white',
                }}
              >
                {getInitials(session?.user?.name)}
              </div>
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-sm font-medium">{session?.user?.name || 'User'}</span>
                <span className="text-xs text-text-tertiary">{formatRole(session?.user?.role)}</span>
              </div>
              <ChevronDown size={16} />
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  )
}
