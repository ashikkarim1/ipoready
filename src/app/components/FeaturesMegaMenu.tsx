'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { ChevronDown, CheckSquare, PieChart, FileText, ShoppingBag, BookOpen, Calendar, LogOut, Settings } from 'lucide-react'
import { ScheduleDemoModal } from './ScheduleDemoModal'

export function FeaturesMegaMenu() {
  const [featuresOpen, setFeaturesOpen] = useState(false)
  const [demoModalOpen, setDemoModalOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const { data: session } = useSession()

  return (
    <nav className="flex items-center flex-1" style={{ marginLeft: '2rem' }}>
      {/* Left side menu */}
      <div className="flex items-center gap-1" style={{ flex: 1 }}>
        {/* Features Dropdown */}
        <div className="relative">
          <button
            onClick={() => setFeaturesOpen(!featuresOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-nav hover:bg-gray-100 transition-colors"
          >
            Features
            <ChevronDown className="w-4 h-4" style={{ transform: featuresOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
          </button>

          {featuresOpen && (
            <div
              className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-3 z-50"
              onMouseLeave={() => setFeaturesOpen(false)}
            >
              <div className="px-4 py-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">Core Features</p>
                <Link href="/#features" className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg text-sm text-nav font-medium transition-colors">
                  <CheckSquare className="w-4 h-4 text-blue-600" />
                  All Features
                </Link>
                <Link href="/cap-table" className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg text-sm text-nav transition-colors">
                  <PieChart className="w-4 h-4 text-amber-600" />
                  Cap Table
                </Link>
                <Link href="/checklist" className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg text-sm text-nav transition-colors">
                  <CheckSquare className="w-4 h-4 text-green-600" />
                  IPO Checklist
                </Link>
                <Link href="/documents" className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg text-sm text-nav transition-colors">
                  <FileText className="w-4 h-4 text-gray-600" />
                  Document Workspace
                </Link>
                <Link href="/marketplace" className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg text-sm text-nav transition-colors">
                  <ShoppingBag className="w-4 h-4 text-purple-600" />
                  Expert Network
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Prospectus Builder - Direct Link */}
        <Link href="/prospectus-builder" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-nav hover:bg-gray-100 transition-colors">
          <BookOpen className="w-4 h-4" />
          Prospectus Builder
        </Link>

        {/* Resources Link */}
        <Link href="/resources" className="px-3 py-1.5 rounded-lg text-sm font-medium text-nav hover:bg-gray-100 transition-colors">
          Resources
        </Link>

        {/* Pricing Link */}
        <Link href="/pricing" className="px-3 py-1.5 rounded-lg text-sm font-medium text-nav hover:bg-gray-100 transition-colors">
          Pricing
        </Link>
      </div>

      {/* Middle - Schedule A Demo Button */}
      <button
        onClick={() => setDemoModalOpen(true)}
        className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold text-white transition-colors hover:opacity-90"
        style={{ background: '#E8312A' }}
      >
        <Calendar className="w-4 h-4" />
        Schedule Demo
      </button>

      {/* Right side - Auth CTAs (completely separated) */}
      <div className="flex items-center gap-3" style={{ marginLeft: 'auto', marginRight: '1.5rem' }}>
        {/* Auth Section */}
        {session?.user ? (
          // Account Menu - Logged In
          <div className="relative">
            <button
              onClick={() => setAccountOpen(!accountOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-nav hover:bg-gray-100 transition-colors"
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: '#1A1A1A' }}
              >
                {session.user.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <ChevronDown className="w-4 h-4" style={{ transform: accountOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
            </button>

            {accountOpen && (
              <div
                className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                onMouseLeave={() => setAccountOpen(false)}
              >
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-nav">{session.user.name}</p>
                  <p className="text-xs text-text-muted truncate">{session.user.email}</p>
                </div>
                <Link
                  href="/account"
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-nav hover:bg-gray-50 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Account Settings
                </Link>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-nav hover:bg-gray-50 transition-colors"
                >
                  <CheckSquare className="w-4 h-4" />
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut()}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-200 mt-1"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          // Auth Buttons - Not Logged In
          <>
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-nav hover:bg-gray-100 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white transition-colors hover:opacity-90"
              style={{ background: '#1A1A1A' }}
            >
              Sign Up
            </Link>
          </>
        )}
      </div>

      {/* Demo Modal */}
      <ScheduleDemoModal isOpen={demoModalOpen} onClose={() => setDemoModalOpen(false)} />
    </nav>
  )
}
