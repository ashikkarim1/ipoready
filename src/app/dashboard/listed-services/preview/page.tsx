'use client'

import { useState } from 'react'
import { LockedCard } from '@/components/ListedServices/LockedCard'
import { AppNav } from '@/components/ListedServices/AppNav'
import { motion } from 'framer-motion'
import {
  AlertCircle, Clock, MessageSquare, Eye, Users, BarChart3, DollarSign,
  PieChart, Zap, Target, GitBranch, CheckSquare, Briefcase, Shield, Scale, Award
} from 'lucide-react'

export default function ListedServicesPreviewPage() {
  const [activeSection, setActiveSection] = useState('disclosure')

  // App-optimized module organization
  const modules = {
    disclosure: {
      name: 'Disclosure & Filings',
      cards: [
        {
          title: 'Filing Calendar',
          description: 'Track regulatory deadlines',
          icon: <Clock className="w-5 h-5" />,
          features: ['10-K/10-Q/8-K deadlines', 'Jurisdiction requirements', 'Readiness scoring', 'AI predictions'],
          dataPreview: ['Q1 10-Q: 35 days (85% ready)', 'Proxy circular: 120 days', 'Material changes tracked']
        },
        {
          title: 'MD&A Studio',
          description: 'AI generates draft MD&A',
          icon: <BarChart3 className="w-5 h-5" />,
          features: ['ERP data auto-pull', 'SEC/SEDAR output', 'Variance explanations', 'Risk disclosure'],
          dataPreview: ['Q1 revenue: +12% YoY', 'Liquidity risk flagged', 'Missing footnote 7']
        },
        {
          title: 'Disclosure Center',
          description: 'Materiality analyzer',
          icon: <AlertCircle className="w-5 h-5" />,
          features: ['Materiality engine', 'Litigation tracker', 'Management alerts', 'Press release recs'],
          dataPreview: ['CEO resignation: 8-K', 'New financing: material', 'Warranty: immaterial']
        }
      ]
    },
    ir: {
      name: 'Investor Relations',
      cards: [
        {
          title: 'IR Calendar',
          description: '12-month IR plan',
          icon: <Clock className="w-5 h-5" />,
          features: ['Earnings calendar', 'Conference recs', 'Roadshow planning', 'Analyst calls'],
          dataPreview: ['Q1 earnings: March 15', 'Investor conference: April 8-10', 'Roadshow: 12 cities']
        },
        {
          title: 'Press Releases',
          description: 'AI drafts announcements',
          icon: <MessageSquare className="w-5 h-5" />,
          features: ['Earnings drafts', 'Exchange check', 'Materiality review', 'Multi-language'],
          dataPreview: ['Q1 earnings draft: Ready for review', 'New customer win: 2 releases pending', 'Product launch: Materiality check']
        },
        {
          title: 'Market Awareness',
          description: 'News & sentiment tracking',
          icon: <Eye className="w-5 h-5" />,
          features: ['News monitoring', 'Analyst tracking', 'Sentiment analysis', 'Risk alerts'],
          dataPreview: ['Last 7 days: 28 mentions', 'Analyst coverage: 12 firms', 'Sentiment: 72% positive']
        },
        {
          title: 'Investor CRM',
          description: 'Engagement tracking',
          icon: <Users className="w-5 h-5" />,
          features: ['Institution database', 'Engagement logs', 'Outreach recs', 'Automation'],
          dataPreview: ['Top 20 shareholders tracked', 'Last quarter: 42 meetings', 'Action items: 5 pending']
        }
      ]
    },
    cfo: {
      name: 'CFO Command',
      cards: [
        {
          title: 'Financial Reporting',
          description: 'Draft disclosures',
          icon: <BarChart3 className="w-5 h-5" />,
          features: ['Footnote drafting', 'Disclosure gen', 'Variance analysis', 'Audit readiness'],
          dataPreview: ['Q1 10-Q: All footnotes drafted', 'Revenue variance: -3% explained', 'Audit readiness: 94%']
        },
        {
          title: 'Financing Center',
          description: 'Capital structure modeling',
          icon: <DollarSign className="w-5 h-5" />,
          features: ['Cap structure', 'Dilution analysis', 'Scenario planning', 'Cost of capital'],
          dataPreview: ['Current debt: $50M at 4.5%', 'Series B scenario: 25% dilution', 'WACC: 8.2%']
        },
        {
          title: 'Dilution Simulator',
          description: 'Future dilution scenarios',
          icon: <PieChart className="w-5 h-5" />,
          features: ['Warrant modeling', 'Option scenarios', 'RSU impact', 'Ownership projections'],
          dataPreview: ['Current shares: 10M outstanding', 'Fully diluted: 12.5M (25% dilution)', 'CEO ownership: 15% → 12%']
        },
        {
          title: 'Treasury',
          description: 'Cash & runway tracking',
          icon: <DollarSign className="w-5 h-5" />,
          features: ['Cash position', 'Burn forecasting', 'Debt calendar', 'Runway alerts'],
          dataPreview: ['Cash on hand: $25.5M', 'Monthly burn: $2.1M', 'Runway: 12+ months']
        }
      ]
    },
    executive: {
      name: 'Executive',
      cards: [
        {
          title: 'CEO Dashboard',
          description: 'Strategic intelligence',
          icon: <Zap className="w-5 h-5" />,
          features: ['Recommendations', 'KPI tracking', 'Growth opportunities', 'Board summaries'],
          dataPreview: ['Revenue target: 98% complete', 'Margin improvement: +2.3%', 'Headcount: 85 of 90']
        },
        {
          title: 'Risk Center',
          description: 'Enterprise risk register',
          icon: <AlertCircle className="w-5 h-5" />,
          features: ['Risk register', 'Risk scoring', 'Mitigation plans', 'Gap analysis'],
          dataPreview: ['Regulatory change: High', 'Supply chain: Medium', 'Talent retention: Low']
        },
        {
          title: 'Opportunity Center',
          description: 'M&A & financing opportunities',
          icon: <Target className="w-5 h-5" />,
          features: ['Target tracking', 'Synergy analysis', 'Strategic fit', 'Opportunity alerts'],
          dataPreview: ['3 acquisition targets tracked', 'Debt refinancing opportunity', 'Cross-sell potential: +$2M']
        }
      ]
    },
    mna: {
      name: 'M&A',
      cards: [
        {
          title: 'Deal Pipeline',
          description: 'Track targets & synergies',
          icon: <GitBranch className="w-5 h-5" />,
          features: ['Target tracking', 'Deal stages', 'Synergy modeling', 'Valuation'],
          dataPreview: ['Target A: 18% synergies', 'Target B: LOI signed', 'Target C: Discovery phase']
        },
        {
          title: 'Due Diligence',
          description: 'Organize diligence items',
          icon: <CheckSquare className="w-5 h-5" />,
          features: ['Document tracking', 'Gap detection', 'Risk summaries', 'Alerts'],
          dataPreview: ['Legal: 8/10 items received', 'Tax returns: missing 2025', 'IT audit: risk flagged']
        },
        {
          title: 'Integration',
          description: 'Post-acquisition tracking',
          icon: <Briefcase className="w-5 h-5" />,
          features: ['Integration plans', 'Milestones', 'Synergy capture', 'Dashboards'],
          dataPreview: ['System migration: 60% done', 'Synergies realized: 45%', 'Timeline: on schedule']
        }
      ]
    },
    compliance: {
      name: 'Compliance',
      cards: [
        {
          title: 'Insider Compliance',
          description: 'Trading & blackout windows',
          icon: <Eye className="w-5 h-5" />,
          features: ['Blackout management', 'Form 4 reminders', 'Trade alerts', 'Tracking'],
          dataPreview: ['Blackout: 3 days remaining', 'Form 4s: 2 due this week', '10% owners: 8 tracked']
        },
        {
          title: 'Audit & Controls',
          description: 'SOX/ICFR compliance',
          icon: <Shield className="w-5 h-5" />,
          features: ['ICFR testing', 'Gap detection', 'Deficiency tracking', 'Audit readiness'],
          dataPreview: ['Control tests: 92% complete', 'Material weaknesses: 1', 'Readiness: 89%']
        },
        {
          title: 'Legal Center',
          description: 'Contracts & litigation',
          icon: <Scale className="w-5 h-5" />,
          features: ['Contract summaries', 'Litigation tracking', 'Regulatory matters', 'Risk detection'],
          dataPreview: ['Active litigation: 2', 'Regulatory inquiries: 0', 'Contracts renewing: 4']
        },
        {
          title: 'ESG',
          description: 'ESG & sustainability',
          icon: <Award className="w-5 h-5" />,
          features: ['ESG scoring', 'Carbon reporting', 'Governance reports', 'Sustainability'],
          dataPreview: ['ESG score: 72/100', 'Carbon reduction: -15%', 'Women in leadership: 38%']
        }
      ]
    }
  }

  const activeCards = modules[activeSection as keyof typeof modules]?.cards || []

  return (
    <div className="w-full h-screen bg-white flex flex-col overflow-hidden md:overflow-auto">
      {/* Mobile Header */}
      <div className="flex-shrink-0 sticky top-0 z-10 bg-white border-b border-gray-200 md:border-0">
        <div className="p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl md:text-4xl font-bold text-nav leading-tight">
              Listed Services OS
            </h1>
            <p className="text-xs md:text-sm text-text-muted mt-2">
              Unlocks automatically when your company lists
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        {/* Card Grid - Mobile optimized */}
        <div className="px-4 md:px-8 py-4 md:py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {activeCards.map((card, i) => (
              <LockedCard
                key={i}
                title={card.title}
                description={card.description}
                icon={card.icon}
                features={card.features}
                dataPreview={card.dataPreview}
                isApp={true}
              />
            ))}
          </div>

          {/* AI Agents Preview */}
          <div className="mt-8 md:mt-12 p-4 md:p-6 rounded-xl" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
            <p className="text-xs md:text-sm font-semibold text-blue-900 uppercase tracking-wider mb-3">
              AI Agent Team
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {['AI CEO', 'AI CFO', 'AI Secretary', 'AI Counsel', 'AI IR'].map((agent, i) => (
                <div key={i} className="p-3 bg-white rounded-lg border border-blue-200">
                  <p className="text-xs md:text-sm font-bold text-nav">{agent}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-8 md:mt-12 text-center pb-8">
            <h2 className="text-xl md:text-3xl font-bold text-nav mb-3">
              All unlocks when you list
            </h2>
            <p className="text-xs md:text-sm text-text-muted">
              Same platform. Same AI. One source of truth.
            </p>
          </div>
        </div>
      </div>

      {/* App-style Bottom Navigation */}
      <AppNav activeSection={activeSection} onSectionChange={setActiveSection} />
    </div>
  )
}
