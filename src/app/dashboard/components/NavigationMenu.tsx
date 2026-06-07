'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  CheckSquare,
  FileText,
  Zap,
  BarChart3,
  Users,
  Shield,
  Crown,
  Lock,
  Settings,
  LogOut,
  MoreHorizontal,
} from 'lucide-react'

const MAIN_SECTIONS = [
  { href: '/dashboard', label: 'Mission Control', icon: LayoutDashboard },
  { href: '/dashboard/documents', label: 'Plan & Execute', icon: CheckSquare },
  { href: '/dashboard/documents', label: 'Documents', icon: FileText },
]

const PREMIUM_SECTIONS = [
  {
    href: '/dashboard/ceo-command-center',
    label: 'CEO Command Center',
    icon: Crown,
    tier: 'professional',
    badge: 'gold',
  },
  {
    href: '/dashboard/board-portal',
    label: 'Board Intelligence',
    icon: Users,
    tier: 'professional',
    badge: 'gold',
  },
  {
    href: '/dashboard/advisor-network',
    label: 'Advisor Network',
    icon: Users,
    tier: 'enterprise',
    badge: 'red',
  },
  {
    href: '/dashboard/cfo-dashboard',
    label: 'CFO Dashboard',
    icon: BarChart3,
    tier: 'enterprise',
    badge: 'gold',
  },
  {
    href: '/dashboard/gc-dashboard',
    label: 'GC Legal Dashboard',
    icon: Shield,
    tier: 'enterprise',
    badge: 'gold',
  },
]

const ANALYTICS_SECTIONS = [
  { href: '/dashboard/market-intelligence', label: 'Market Intelligence', icon: BarChart3 },
  { href: '/dashboard/compliance', label: 'Compliance', icon: Shield },
]

const MORE_SECTIONS = [
  { href: '/dashboard/post-ipo-compliance', label: 'Post-IPO Compliance', icon: CheckSquare, tier: 'enterprise' },
  { href: '/dashboard/multi-country-filing', label: 'Multi-Country Filing', icon: Zap, tier: 'enterprise' },
  { href: '/dashboard/prospectus-builder', label: 'Prospectus Builder', icon: FileText },
  { href: '/dashboard/cap-table', label: 'Cap Table', icon: BarChart3 },
]

const BADGE_COLORS: Record<string, string> = {
  gold: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
  blue: 'bg-blue-100 text-blue-800 border border-blue-300',
  red: 'bg-red-100 text-red-800 border border-red-300',
}

interface NavItemProps {
  href: string
  label: string
  icon: React.ComponentType<{ className: string }>
  isActive: boolean
  isPremium?: boolean
  tier?: string
  badge?: string
}

function NavItem({
  href,
  label,
  icon: Icon,
  isActive,
  isPremium = false,
  tier = '',
  badge = '',
}: NavItemProps) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ x: 4 }}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group relative ${
          isActive
            ? 'bg-accent/10 text-accent'
            : 'text-text-muted hover:bg-slate-100 hover:text-nav'
        }`}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span className="text-sm font-medium flex-1">{label}</span>

        {isPremium && (
          <div className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-text-light" />
            {badge && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${BADGE_COLORS[badge]}`}>
                {tier === 'enterprise' ? 'ENT' : 'PRO'}
              </span>
            )}
          </div>
        )}
      </motion.div>
    </Link>
  )
}

interface NavigationMenuProps {
  userSubscriptionTier?: 'starter' | 'professional' | 'enterprise'
}

export default function NavigationMenu({
  userSubscriptionTier = 'starter',
}: NavigationMenuProps) {
  const pathname = usePathname()
  const [showMore, setShowMore] = React.useState(false)

  return (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <Link href="/" className="px-6 py-6 border-b border-slate-200 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-nav flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-nav">IPOReady</span>
      </Link>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {/* Main sections */}
        <div className="space-y-1 pb-6">
          {MAIN_SECTIONS.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              isActive={pathname === item.href}
            />
          ))}
        </div>

        {/* Premium sections */}
        <div className="pb-6">
          <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-text-light mb-3">
            Premium Features
          </div>
          <div className="space-y-1">
            {PREMIUM_SECTIONS.map((item) => {
              const hasAccess =
                userSubscriptionTier === 'enterprise' ||
                (userSubscriptionTier === 'professional' && item.tier === 'professional')

              return (
                <NavItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  isActive={pathname === item.href}
                  isPremium={!hasAccess}
                  tier={item.tier}
                  badge={item.badge}
                />
              )
            })}
          </div>
        </div>

        {/* Analytics sections */}
        <div className="pb-6 border-t border-slate-200 pt-4">
          <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-text-light mb-3">
            Analytics & Compliance
          </div>
          <div className="space-y-1">
            {ANALYTICS_SECTIONS.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={pathname === item.href}
              />
            ))}
          </div>
        </div>

        {/* More menu */}
        <div className="border-t border-slate-200 pt-4">
          <button
            onClick={() => setShowMore(!showMore)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-text-muted hover:bg-slate-100 hover:text-nav transition-all group text-sm font-medium"
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="flex-1 text-left">More</span>
            <motion.div animate={{ rotate: showMore ? 180 : 0 }}>
              <span>›</span>
            </motion.div>
          </button>

          {showMore && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 space-y-1"
            >
              {MORE_SECTIONS.map((item) => {
                const isPremium = item.tier === 'enterprise'
                const hasAccess = userSubscriptionTier === 'enterprise'

                return (
                  <NavItem
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    isActive={pathname === item.href}
                    isPremium={isPremium && !hasAccess}
                    tier={item.tier}
                  />
                )
              })}
            </motion.div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 p-4 space-y-2">
        <Link href="/dashboard/premium">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-accent/10 text-accent font-semibold text-sm hover:bg-accent/20 transition-all"
          >
            <Crown className="w-4 h-4" />
            Upgrade Plan
          </motion.button>
        </Link>

        <Link href="/dashboard/settings">
          <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-text-muted hover:bg-slate-100 text-sm font-medium transition-all">
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </Link>
      </div>
    </div>
  )
}
