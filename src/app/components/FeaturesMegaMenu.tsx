'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, CheckSquare, PieChart, FileText, ShoppingBag, BookOpen, Calendar } from 'lucide-react'
import { ScheduleDemoModal } from './ScheduleDemoModal'

export function FeaturesMegaMenu() {
  const [featuresOpen, setFeaturesOpen] = useState(false)
  const [demoModalOpen, setDemoModalOpen] = useState(false)

  return (
    <nav className="flex items-center justify-between flex-1" style={{ marginLeft: '2rem' }}>
      {/* Left side menu */}
      <div className="flex items-center gap-1">
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

      {/* Right side - Schedule A Demo Button */}
      <button
        onClick={() => setDemoModalOpen(true)}
        className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold text-white transition-colors hover:opacity-90"
        style={{ background: '#E8312A', marginRight: '1.5rem' }}
      >
        <Calendar className="w-4 h-4" />
        Schedule Demo
      </button>

      {/* Demo Modal */}
      <ScheduleDemoModal isOpen={demoModalOpen} onClose={() => setDemoModalOpen(false)} />
    </nav>
  )
}
