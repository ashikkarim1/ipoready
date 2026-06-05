'use client'

import { useState } from 'react'
import { ChevronDown, AlertCircle, Clock, MessageSquare, Users, BarChart3, DollarSign, Target, GitBranch, Shield, Scale, Award } from 'lucide-react'

interface AppNavProps {
  activeSection?: string
  onSectionChange?: (section: string) => void
}

/**
 * App-style navigation for Listed Services
 * Mobile-first with collapsible sections and swipeable tabs
 */
export function AppNav({ activeSection = 'disclosure', onSectionChange }: AppNavProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(activeSection)

  const sections = [
    {
      id: 'disclosure',
      name: 'Disclosure & Filings',
      icon: AlertCircle,
      modules: ['Filing Calendar', 'MD&A Studio', 'Disclosure Center']
    },
    {
      id: 'ir',
      name: 'Investor Relations',
      icon: MessageSquare,
      modules: ['IR Calendar', 'Press Releases', 'Market Awareness', 'Investor CRM']
    },
    {
      id: 'cfo',
      name: 'CFO Command',
      icon: DollarSign,
      modules: ['Financial Reporting', 'Financing', 'Dilution', 'Treasury']
    },
    {
      id: 'executive',
      name: 'Executive',
      icon: Target,
      modules: ['CEO Dashboard', 'Risk Center', 'Opportunities']
    },
    {
      id: 'mna',
      name: 'M&A',
      icon: GitBranch,
      modules: ['Deal Pipeline', 'Due Diligence', 'Integration']
    },
    {
      id: 'compliance',
      name: 'Compliance',
      icon: Shield,
      modules: ['Insider', 'Audit', 'Legal', 'ESG']
    },
  ]

  return (
    <nav className="w-full bg-white border-t border-gray-200">
      {/* Horizontal scroll on mobile */}
      <div className="overflow-x-auto -mx-4 px-4">
        <div className="flex gap-2 pb-4 min-w-min">
          {sections.map(section => {
            const Icon = section.icon
            const isActive = expandedSection === section.id
            return (
              <button
                key={section.id}
                onClick={() => {
                  setExpandedSection(isActive ? null : section.id)
                  onSectionChange?.(section.id)
                }}
                className="flex items-center gap-2 px-4 py-3 rounded-full font-medium text-sm whitespace-nowrap transition-all flex-shrink-0"
                style={{
                  background: isActive ? '#E8312A' : '#F7F6F4',
                  color: isActive ? 'white' : '#1A1A1A',
                  border: isActive ? 'none' : '1px solid #E5E4E0'
                }}
              >
                <Icon className="w-4 h-4" />
                <span>{section.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Expanded section - collapsible modules */}
      {expandedSection && (
        <div className="border-t border-gray-100 px-4 py-4">
          <div className="space-y-2">
            {sections
              .find(s => s.id === expandedSection)
              ?.modules.map((module, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg transition-all opacity-60"
                  style={{ background: '#F7F6F4' }}
                >
                  <p className="text-sm font-medium text-nav truncate">
                    🔒 {module}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}
    </nav>
  )
}
