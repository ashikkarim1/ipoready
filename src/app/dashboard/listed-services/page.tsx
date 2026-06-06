'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock, MessageSquare, Eye, Users, BarChart3, DollarSign,
  PieChart, Zap, Target, GitBranch, CheckSquare, Briefcase,
  Shield, Scale, Award, AlertCircle, ChevronRight
} from 'lucide-react'

interface Card {
  title: string
  description: string
  icon: React.ReactNode
  features: string[]
}

interface ModuleSection {
  name: string
  cards: Card[]
  shortName: string
}

export default function ListedServicesPage() {
  const [activeSection, setActiveSection] = useState('disclosure')

  const modules: Record<string, ModuleSection> = {
    disclosure: {
      name: 'Disclosure & Filings',
      shortName: 'Disclosure',
      cards: [
        {
          title: 'Filing Calendar',
          description: 'Track regulatory deadlines',
          icon: <Clock className="w-5 h-5" />,
          features: ['10-K/10-Q/8-K deadlines', 'Jurisdiction requirements', 'Readiness scoring']
        },
        {
          title: 'MD&A Studio',
          description: 'AI-generated MD&A analysis',
          icon: <BarChart3 className="w-5 h-5" />,
          features: ['ERP data auto-pull', 'SEC/SEDAR output', 'Variance explanations']
        },
        {
          title: 'Disclosure Center',
          description: 'Materiality analyzer',
          icon: <AlertCircle className="w-5 h-5" />,
          features: ['Materiality engine', 'Litigation tracker', 'Management alerts']
        },
        {
          title: 'Audit Tracker',
          description: 'Manage audit process',
          icon: <CheckSquare className="w-5 h-5" />,
          features: ['Audit readiness', 'Request tracking', 'Timeline management']
        }
      ]
    },
    ir: {
      name: 'Investor Relations',
      shortName: 'IR',
      cards: [
        {
          title: 'IR Calendar',
          description: '12-month investor plan',
          icon: <Clock className="w-5 h-5" />,
          features: ['Earnings calendar', 'Conference scheduling', 'Roadshow planning']
        },
        {
          title: 'Press Releases',
          description: 'AI-generated announcements',
          icon: <MessageSquare className="w-5 h-5" />,
          features: ['Earnings drafts', 'Exchange check', 'Materiality review']
        },
        {
          title: 'Market Awareness',
          description: 'News & sentiment tracking',
          icon: <Eye className="w-5 h-5" />,
          features: ['News monitoring', 'Analyst tracking', 'Sentiment analysis']
        },
        {
          title: 'Investor CRM',
          description: 'Shareholder engagement',
          icon: <Users className="w-5 h-5" />,
          features: ['Investor database', 'Engagement logs', 'Outreach automation']
        }
      ]
    },
    cfo: {
      name: 'CFO Command',
      shortName: 'CFO',
      cards: [
        {
          title: 'Financial Reporting',
          description: 'Draft disclosures',
          icon: <BarChart3 className="w-5 h-5" />,
          features: ['Footnote drafting', 'Disclosure gen', 'Variance analysis']
        },
        {
          title: 'Financing Center',
          description: 'Capital structure modeling',
          icon: <DollarSign className="w-5 h-5" />,
          features: ['Cap structure', 'Dilution analysis', 'Scenario planning']
        },
        {
          title: 'Dilution Simulator',
          description: 'Ownership projection',
          icon: <PieChart className="w-5 h-5" />,
          features: ['Warrant modeling', 'Option scenarios', 'RSU impact']
        },
        {
          title: 'Treasury',
          description: 'Cash & runway tracking',
          icon: <DollarSign className="w-5 h-5" />,
          features: ['Cash position', 'Burn forecasting', 'Runway alerts']
        }
      ]
    },
    executive: {
      name: 'Executive Leadership',
      shortName: 'Executive',
      cards: [
        {
          title: 'CEO Dashboard',
          description: 'Strategic intelligence hub',
          icon: <Zap className="w-5 h-5" />,
          features: ['KPI tracking', 'Growth opportunities', 'Board summaries']
        },
        {
          title: 'Risk Center',
          description: 'Enterprise risk register',
          icon: <AlertCircle className="w-5 h-5" />,
          features: ['Risk register', 'Risk scoring', 'Mitigation plans']
        },
        {
          title: 'Opportunity Center',
          description: 'M&A & financing tracker',
          icon: <Target className="w-5 h-5" />,
          features: ['Target tracking', 'Synergy analysis', 'Strategic fit']
        },
        {
          title: 'Board Portal',
          description: 'Governance & materials',
          icon: <Briefcase className="w-5 h-5" />,
          features: ['Meeting materials', 'Voting portal', 'Document library']
        }
      ]
    },
    mna: {
      name: 'M&A & Corporate Development',
      shortName: 'M&A',
      cards: [
        {
          title: 'Deal Pipeline',
          description: 'Target & synergy tracking',
          icon: <GitBranch className="w-5 h-5" />,
          features: ['Target tracking', 'Deal stages', 'Synergy modeling']
        },
        {
          title: 'Due Diligence',
          description: 'Organize diligence items',
          icon: <CheckSquare className="w-5 h-5" />,
          features: ['Document tracking', 'Gap detection', 'Risk summaries']
        },
        {
          title: 'Integration',
          description: 'Post-acquisition tracking',
          icon: <Briefcase className="w-5 h-5" />,
          features: ['Integration plans', 'Milestones', 'Synergy capture']
        },
        {
          title: 'Carve-Out',
          description: 'Spin-off & divestiture',
          icon: <Scale className="w-5 h-5" />,
          features: ['Separation timeline', 'Tax planning', 'Legal structure']
        }
      ]
    },
    compliance: {
      name: 'Compliance & Governance',
      shortName: 'Compliance',
      cards: [
        {
          title: 'Insider Compliance',
          description: 'Trading & blackout windows',
          icon: <Eye className="w-5 h-5" />,
          features: ['Blackout management', 'Form 4 reminders', 'Trade alerts']
        },
        {
          title: 'Audit & Controls',
          description: 'SOX/ICFR compliance',
          icon: <Shield className="w-5 h-5" />,
          features: ['ICFR testing', 'Gap detection', 'Audit readiness']
        },
        {
          title: 'Legal Center',
          description: 'Contracts & litigation',
          icon: <Scale className="w-5 h-5" />,
          features: ['Contract summaries', 'Litigation tracking', 'Risk detection']
        },
        {
          title: 'ESG',
          description: 'ESG & sustainability reporting',
          icon: <Award className="w-5 h-5" />,
          features: ['ESG scoring', 'Carbon reporting', 'Governance reports']
        }
      ]
    }
  }

  const activeModule = modules[activeSection as keyof typeof modules]
  const sectionNames = Object.entries(modules).map(([key, mod]) => ({ key, label: mod.shortName }))

  return (
    <div style={{ background: '#F7F6F4', minHeight: '100vh', colorScheme: 'light' }}>
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 px-4 sm:px-6 lg:px-0 py-8">

        {/* Header */}
        <div>
          <h1 className="serif text-2xl sm:text-3xl text-nav mb-2">Listed Services OS</h1>
          <p className="text-text-muted text-sm">Complete toolkit for post-IPO operations and compliance</p>
        </div>

        {/* Section Navigation */}
        <div className="flex flex-wrap gap-2">
          {sectionNames.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              className={`px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeSection === key
                  ? 'text-white'
                  : 'text-text-primary'
              }`}
              style={{
                background: activeSection === key ? 'var(--color-text-primary)' : 'white',
                border: '1px solid #E5E4E0'
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <AnimatePresence mode="wait">
            {activeModule.cards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
              >
                <div
                  className="h-full rounded-2xl p-5 sm:p-6 border flex flex-col transition-all hover:border-gray-300"
                  style={{
                    background: 'white',
                    border: '1px solid #E5E4E0'
                  }}
                >
                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 flex-shrink-0"
                    style={{
                      background: 'var(--color-bg-primary)',
                      color: 'var(--color-text-primary)'
                    }}
                  >
                    {card.icon}
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-semibold text-nav text-sm sm:text-base mb-1">
                    {card.title}
                  </h3>
                  <p className="text-text-muted text-xs sm:text-sm mb-4 flex-grow">
                    {card.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-2 mb-4 pt-3 border-t border-gray-100">
                    {card.features.map((feature, j) => (
                      <div key={j} className="flex items-start gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-text-muted flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-text-muted">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <button
                    className="w-full py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all text-white flex items-center justify-center gap-2"
                    style={{
                      background: 'var(--color-text-primary)'
                    }}
                  >
                    Open
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
