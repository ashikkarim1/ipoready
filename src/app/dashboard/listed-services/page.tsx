'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Clock, MessageSquare, Eye, Users, BarChart3, DollarSign,
  PieChart, Zap, Target, GitBranch, CheckSquare, Briefcase,
  Shield, Scale, Award, AlertCircle, ChevronRight, Lock, Unlock
} from 'lucide-react'

interface Card {
  title: string
  description: string
  icon: React.ReactNode
  features: string[]
  dataPreview: string[]
  isLocked?: boolean
}

interface ModuleSection {
  name: string
  cards: Card[]
  color: string
  lightBg: string
}

export default function ListedServicesPage() {
  const [activeSection, setActiveSection] = useState('disclosure')
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  const modules: Record<string, ModuleSection> = {
    disclosure: {
      name: 'Disclosure & Filings',
      color: '#2563EB',
      lightBg: '#EFF6FF',
      cards: [
        {
          title: 'Filing Calendar',
          description: 'Track regulatory deadlines',
          icon: <Clock className="w-6 h-6" />,
          features: ['10-K/10-Q/8-K deadlines', 'Jurisdiction requirements', 'Readiness scoring', 'AI predictions'],
          dataPreview: ['Q1 10-Q: 35 days (85% ready)', 'Proxy circular: 120 days', 'Material changes tracked']
        },
        {
          title: 'MD&A Studio',
          description: 'AI generates draft MD&A',
          icon: <BarChart3 className="w-6 h-6" />,
          features: ['ERP data auto-pull', 'SEC/SEDAR output', 'Variance explanations', 'Risk disclosure'],
          dataPreview: ['Q1 revenue: +12% YoY', 'Liquidity risk flagged', 'Missing footnote 7']
        },
        {
          title: 'Disclosure Center',
          description: 'Materiality analyzer',
          icon: <AlertCircle className="w-6 h-6" />,
          features: ['Materiality engine', 'Litigation tracker', 'Management alerts', 'Press release recs'],
          dataPreview: ['CEO resignation: 8-K', 'New financing: material', 'Warranty: immaterial']
        },
        {
          title: 'Audit Tracker',
          description: 'Manage audit process',
          icon: <CheckSquare className="w-6 h-6" />,
          features: ['Audit readiness', 'Request tracking', 'Timeline mgmt', 'Issue resolution'],
          dataPreview: ['Q1 audit: 92% complete', 'Outstanding items: 3', 'Next checkpoint: June 15']
        }
      ]
    },
    ir: {
      name: 'Investor Relations',
      color: '#7C3AED',
      lightBg: '#F3E8FF',
      cards: [
        {
          title: 'IR Calendar',
          description: '12-month IR plan',
          icon: <Clock className="w-6 h-6" />,
          features: ['Earnings calendar', 'Conference recs', 'Roadshow planning', 'Analyst calls'],
          dataPreview: ['Q1 earnings: March 15', 'Investor conference: April 8-10', 'Roadshow: 12 cities']
        },
        {
          title: 'Press Releases',
          description: 'AI drafts announcements',
          icon: <MessageSquare className="w-6 h-6" />,
          features: ['Earnings drafts', 'Exchange check', 'Materiality review', 'Multi-language'],
          dataPreview: ['Q1 earnings draft: Ready for review', 'New customer win: 2 releases pending', 'Product launch: Materiality check']
        },
        {
          title: 'Market Awareness',
          description: 'News & sentiment tracking',
          icon: <Eye className="w-6 h-6" />,
          features: ['News monitoring', 'Analyst tracking', 'Sentiment analysis', 'Risk alerts'],
          dataPreview: ['Last 7 days: 28 mentions', 'Analyst coverage: 12 firms', 'Sentiment: 72% positive']
        },
        {
          title: 'Investor CRM',
          description: 'Engagement tracking',
          icon: <Users className="w-6 h-6" />,
          features: ['Institution database', 'Engagement logs', 'Outreach recs', 'Automation'],
          dataPreview: ['Top 20 shareholders tracked', 'Last quarter: 42 meetings', 'Action items: 5 pending']
        }
      ]
    },
    cfo: {
      name: 'CFO Command',
      color: '#059669',
      lightBg: '#ECFDF5',
      cards: [
        {
          title: 'Financial Reporting',
          description: 'Draft disclosures',
          icon: <BarChart3 className="w-6 h-6" />,
          features: ['Footnote drafting', 'Disclosure gen', 'Variance analysis', 'Audit readiness'],
          dataPreview: ['Q1 10-Q: All footnotes drafted', 'Revenue variance: -3% explained', 'Audit readiness: 94%']
        },
        {
          title: 'Financing Center',
          description: 'Capital structure modeling',
          icon: <DollarSign className="w-6 h-6" />,
          features: ['Cap structure', 'Dilution analysis', 'Scenario planning', 'Cost of capital'],
          dataPreview: ['Current debt: $50M at 4.5%', 'Series B scenario: 25% dilution', 'WACC: 8.2%']
        },
        {
          title: 'Dilution Simulator',
          description: 'Future dilution scenarios',
          icon: <PieChart className="w-6 h-6" />,
          features: ['Warrant modeling', 'Option scenarios', 'RSU impact', 'Ownership projections'],
          dataPreview: ['Current shares: 10M outstanding', 'Fully diluted: 12.5M (25% dilution)', 'CEO ownership: 15% → 12%']
        },
        {
          title: 'Treasury',
          description: 'Cash & runway tracking',
          icon: <DollarSign className="w-6 h-6" />,
          features: ['Cash position', 'Burn forecasting', 'Debt calendar', 'Runway alerts'],
          dataPreview: ['Cash on hand: $25.5M', 'Monthly burn: $2.1M', 'Runway: 12+ months']
        }
      ]
    },
    executive: {
      name: 'Executive',
      color: '#DC2626',
      lightBg: '#FEF2F2',
      cards: [
        {
          title: 'CEO Dashboard',
          description: 'Strategic intelligence',
          icon: <Zap className="w-6 h-6" />,
          features: ['Recommendations', 'KPI tracking', 'Growth opportunities', 'Board summaries'],
          dataPreview: ['Revenue target: 98% complete', 'Margin improvement: +2.3%', 'Headcount: 85 of 90']
        },
        {
          title: 'Risk Center',
          description: 'Enterprise risk register',
          icon: <AlertCircle className="w-6 h-6" />,
          features: ['Risk register', 'Risk scoring', 'Mitigation plans', 'Gap analysis'],
          dataPreview: ['Regulatory change: High', 'Supply chain: Medium', 'Talent retention: Low']
        },
        {
          title: 'Opportunity Center',
          description: 'M&A & financing opportunities',
          icon: <Target className="w-6 h-6" />,
          features: ['Target tracking', 'Synergy analysis', 'Strategic fit', 'Opportunity alerts'],
          dataPreview: ['3 acquisition targets tracked', 'Debt refinancing opportunity', 'Cross-sell potential: +$2M']
        },
        {
          title: 'Board Portal',
          description: 'Board materials & governance',
          icon: <Briefcase className="w-6 h-6" />,
          features: ['Meeting materials', 'Voting', 'Document library', 'Minutes'],
          dataPreview: ['Next meeting: June 28', 'Materials uploaded: 12 docs', 'Board size: 7 members']
        }
      ]
    },
    mna: {
      name: 'M&A',
      color: '#EA580C',
      lightBg: '#FEF3C7',
      cards: [
        {
          title: 'Deal Pipeline',
          description: 'Track targets & synergies',
          icon: <GitBranch className="w-6 h-6" />,
          features: ['Target tracking', 'Deal stages', 'Synergy modeling', 'Valuation'],
          dataPreview: ['Target A: 18% synergies', 'Target B: LOI signed', 'Target C: Discovery phase']
        },
        {
          title: 'Due Diligence',
          description: 'Organize diligence items',
          icon: <CheckSquare className="w-6 h-6" />,
          features: ['Document tracking', 'Gap detection', 'Risk summaries', 'Alerts'],
          dataPreview: ['Legal: 8/10 items received', 'Tax returns: missing 2025', 'IT audit: risk flagged']
        },
        {
          title: 'Integration',
          description: 'Post-acquisition tracking',
          icon: <Briefcase className="w-6 h-6" />,
          features: ['Integration plans', 'Milestones', 'Synergy capture', 'Dashboards'],
          dataPreview: ['System migration: 60% done', 'Synergies realized: 45%', 'Timeline: on schedule']
        },
        {
          title: 'Carve-Out',
          description: 'Track spin-off or divestiture',
          icon: <Scale className="w-6 h-6" />,
          features: ['Separation timeline', 'Legal structure', 'Tax planning', 'Transition support'],
          dataPreview: ['Separation date: Q4 2026', 'New entity: Corp structure drafted', 'Tax ruling: applied']
        }
      ]
    },
    compliance: {
      name: 'Compliance',
      color: '#0891B2',
      lightBg: '#ECFDFD',
      cards: [
        {
          title: 'Insider Compliance',
          description: 'Trading & blackout windows',
          icon: <Eye className="w-6 h-6" />,
          features: ['Blackout management', 'Form 4 reminders', 'Trade alerts', 'Tracking'],
          dataPreview: ['Blackout: 3 days remaining', 'Form 4s: 2 due this week', '10% owners: 8 tracked']
        },
        {
          title: 'Audit & Controls',
          description: 'SOX/ICFR compliance',
          icon: <Shield className="w-6 h-6" />,
          features: ['ICFR testing', 'Gap detection', 'Deficiency tracking', 'Audit readiness'],
          dataPreview: ['Control tests: 92% complete', 'Material weaknesses: 1', 'Readiness: 89%']
        },
        {
          title: 'Legal Center',
          description: 'Contracts & litigation',
          icon: <Scale className="w-6 h-6" />,
          features: ['Contract summaries', 'Litigation tracking', 'Regulatory matters', 'Risk detection'],
          dataPreview: ['Active litigation: 2', 'Regulatory inquiries: 0', 'Contracts renewing: 4']
        },
        {
          title: 'ESG',
          description: 'ESG & sustainability',
          icon: <Award className="w-6 h-6" />,
          features: ['ESG scoring', 'Carbon reporting', 'Governance reports', 'Sustainability'],
          dataPreview: ['ESG score: 72/100', 'Carbon reduction: -15%', 'Women in leadership: 38%']
        }
      ]
    }
  }

  const activeModule = modules[activeSection as keyof typeof modules]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Unlock className="w-8 h-8 text-green-600" />
              <span className="inline-block px-3 py-1 bg-green-50 border border-green-200 rounded-full text-xs font-semibold text-green-700">
                UNLOCKED - Your company is listed
              </span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900">
              Listed Services OS
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              Complete toolkit for post-IPO operations, compliance, and investor relations
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {/* Section Navigation */}
        <div className="mb-12">
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">
            Service Categories
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {Object.entries(modules).map(([key, module]) => (
              <button
                key={key}
                onClick={() => setActiveSection(key)}
                className={`p-3 rounded-lg font-medium text-sm transition-all ${
                  activeSection === key
                    ? 'text-white shadow-lg'
                    : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                }`}
                style={{
                  backgroundColor: activeSection === key ? module.color : undefined
                }}
              >
                {module.name}
              </button>
            ))}
          </div>
        </div>

        {/* Active Section Header */}
        <div className="mb-8 pb-8 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {activeModule.name}
          </h2>
          <p className="text-gray-600">
            Explore all available tools in this category
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {activeModule.cards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              onMouseEnter={() => setHoveredCard(`${activeSection}-${i}`)}
              onMouseLeave={() => setHoveredCard(null)}
              className="h-full"
            >
              <div
                className="p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer h-full flex flex-col group"
                style={{
                  backgroundColor: activeModule.lightBg,
                  borderColor: hoveredCard === `${activeSection}-${i}` ? activeModule.color : '#E5E7EB',
                  boxShadow: hoveredCard === `${activeSection}-${i}` ? `0 8px 24px ${activeModule.color}20` : 'none'
                }}
              >
                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: activeModule.color, color: 'white' }}
                >
                  {card.icon}
                </div>

                {/* Title & Description */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {card.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4 flex-grow">
                  {card.description}
                </p>

                {/* Features */}
                <div className="mb-4 py-4 border-t border-gray-200">
                  <p className="text-xs font-semibold text-gray-700 mb-3">Key Features:</p>
                  <ul className="space-y-2">
                    {card.features.slice(0, 3).map((feature, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Data Preview */}
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs font-semibold text-gray-700 mb-3">Current Activity:</p>
                  <ul className="space-y-1">
                    {card.dataPreview.slice(0, 2).map((preview, j) => (
                      <li key={j} className="text-xs text-gray-600 flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full" style={{ backgroundColor: activeModule.color }}></span>
                        {preview}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <button
                  className="mt-6 w-full py-3 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 text-white group-hover:gap-3"
                  style={{ backgroundColor: activeModule.color }}
                >
                  Open {card.title}
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* AI Agents Section */}
        <div className="mb-12 p-8 rounded-2xl border-2 border-blue-200" style={{ backgroundColor: '#EFF6FF' }}>
          <h3 className="text-lg font-bold text-blue-900 mb-4">🤖 AI Agent Team</h3>
          <p className="text-sm text-blue-700 mb-6">
            Each service category has dedicated AI agents to assist you with research, analysis, and recommendations.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {['AI Analyst', 'AI Counsel', 'AI CFO', 'AI Secretary', 'AI IR', 'AI Compliance'].map((agent, i) => (
              <div
                key={i}
                className="p-4 bg-white rounded-lg border-2 border-blue-200 text-center hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
              >
                <p className="text-sm font-bold text-blue-900">{agent}</p>
                <p className="text-xs text-blue-600 mt-1">Always available</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center py-12 border-t border-gray-200">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything you need to succeed as a public company
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Integrated tools, AI assistance, and strategic intelligence all in one platform
          </p>
          <button className="bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-black transition-colors">
            Explore All Features
          </button>
        </div>
      </div>
    </div>
  )
}
