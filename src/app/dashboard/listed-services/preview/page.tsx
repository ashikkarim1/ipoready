'use client'

import { LockedCard } from '@/components/ListedServices/LockedCard'
import { motion } from 'framer-motion'
import {
  AlertCircle, Clock, MessageSquare, Eye, Users, BarChart3, DollarSign,
  PieChart, Zap, Target, GitBranch, CheckSquare, Briefcase, Shield, Scale, Award
} from 'lucide-react'

export default function ListedServicesPreviewPage() {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="serif text-5xl text-nav mb-4 leading-tight">
            Listed Services OS
          </h1>
          <p className="text-lg text-text-muted max-w-3xl">
            Your complete operating system for managing a public company. When your company lists, these tools unlock automatically with AI agents that understand your business completely.
          </p>
        </motion.div>
      </div>

      {/* Disclosure & Filings */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-nav mb-6">📄 Disclosure & Filings</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <LockedCard
            title="Filing Calendar"
            description="Track all regulatory deadlines across your primary and secondary exchanges."
            icon={<Clock className="w-6 h-6" />}
            features={[
              '10-K, 10-Q, 8-K deadlines',
              'Jurisdiction-specific requirements',
              'Readiness scoring per filing',
              'AI deadline predictions'
            ]}
            dataPreview={[
              'Q1 10-Q due in 35 days (85% ready)',
              'Annual proxy circular due in 120 days',
              'Material change reports auto-tracked'
            ]}
          />

          <LockedCard
            title="MD&A Studio"
            description="AI generates draft MD&A by pulling from your financials, board minutes, and historical data."
            icon={<BarChart3 className="w-6 h-6" />}
            features={[
              'Auto-pull from ERP systems',
              'Multi-format output (SEC, SEDAR)',
              'Variance explanations',
              'Risk disclosure recommendations'
            ]}
            dataPreview={[
              'Q1 revenue variance: +12% YoY explained',
              'Liquidity risk flagged from cash flow',
              'Compliance gap: missing footnote 7'
            ]}
          />

          <LockedCard
            title="Disclosure Center"
            description="Materiality analyzer that recommends what needs public disclosure and when."
            icon={<AlertCircle className="w-6 h-6" />}
            features={[
              'Materiality assessment engine',
              'Litigation tracker',
              'Management change alerts',
              'Press release recommendations'
            ]}
            dataPreview={[
              'CEO resignation requires 8-K filing',
              'New financing round is material',
              'Warranty claim: immaterial (0.1% revenue)'
            ]}
          />
        </div>
      </div>

      {/* Investor Relations */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-nav mb-6">💬 Investor Relations</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <LockedCard
            title="IR Calendar"
            description="12-month plan that recommends earnings calls, conferences, and roadshows."
            icon={<Clock className="w-6 h-6" />}
            features={[
              'Earnings calendar',
              'Conference recommendations',
              'Roadshow planning',
              'Analyst call scheduling'
            ]}
          />

          <LockedCard
            title="Press Release Engine"
            description="AI drafts earnings and corporate announcements with compliance review built-in."
            icon={<MessageSquare className="w-6 h-6" />}
            features={[
              'Earnings release generation',
              'Exchange compliance check',
              'Materiality review',
              'Multi-language support'
            ]}
          />

          <LockedCard
            title="Market Awareness"
            description="Track news, analysts, and social sentiment. AI alerts you to reputation risks."
            icon={<Eye className="w-6 h-6" />}
            features={[
              'News tracking',
              'Analyst coverage monitoring',
              'Sentiment analysis',
              'Reputation risk alerts'
            ]}
          />

          <LockedCard
            title="Investor CRM"
            description="Track institutions, analysts, and retail investor engagement across time."
            icon={<Users className="w-6 h-6" />}
            features={[
              'Investor database',
              'Engagement tracking',
              'Outreach recommendations',
              'Follow-up automation'
            ]}
          />
        </div>
      </div>

      {/* CFO Command Center */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-nav mb-6">💰 CFO Command Center</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <LockedCard
            title="Financial Reporting"
            description="Draft footnotes, disclosures, and variance explanations for quarterly and annual filings."
            icon={<BarChart3 className="w-6 h-6" />}
            features={[
              'Footnote drafting',
              'Disclosure generation',
              'Variance analysis',
              'Audit readiness scoring'
            ]}
          />

          <LockedCard
            title="Financing Center"
            description="Model capital structure, equity raises, debt offerings, and ATM programs."
            icon={<DollarSign className="w-6 h-6" />}
            features={[
              'Capital structure modeling',
              'Dilution analysis',
              'Financing scenario planning',
              'Cost of capital estimation'
            ]}
          />

          <LockedCard
            title="Dilution Simulator"
            description="Model future dilution scenarios for warrants, options, RSUs, and convertibles."
            icon={<PieChart className="w-6 h-6" />}
            features={[
              'Warrant dilution modeling',
              'Option exercise scenarios',
              'RSU vesting impact',
              'Fully diluted ownership projections'
            ]}
          />

          <LockedCard
            title="Treasury Management"
            description="Track cash, burn rate, and debt. AI forecasts runway and alerts to financing needs."
            icon={<DollarSign className="w-6 h-6" />}
            features={[
              'Cash position tracking',
              'Burn rate forecasting',
              'Debt obligation calendar',
              'Runway alerts'
            ]}
          />
        </div>
      </div>

      {/* Executive Leadership */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-nav mb-6">🎯 Executive Leadership</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <LockedCard
            title="CEO Command Center"
            description="Dashboard with strategic recommendations, growth opportunities, and board alerts."
            icon={<Zap className="w-6 h-6" />}
            features={[
              'Strategic recommendations',
              'KPI tracking',
              'Growth opportunity identification',
              'Board communication summaries'
            ]}
          />

          <LockedCard
            title="Risk Center"
            description="Enterprise risk register with scoring and proactive mitigation recommendations."
            icon={<AlertCircle className="w-6 h-6" />}
            features={[
              'Risk register management',
              'Risk scoring (legal, regulatory, financial)',
              'Mitigation planning',
              'Compliance gap analysis'
            ]}
          />

          <LockedCard
            title="Opportunity Center"
            description="Track M&A targets, partnerships, and financing opportunities with AI scoring."
            icon={<Target className="w-6 h-6" />}
            features={[
              'Acquisition opportunity tracking',
              'Synergy analysis',
              'Strategic fit scoring',
              'Financing opportunity alerts'
            ]}
          />
        </div>
      </div>

      {/* M&A OS */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-nav mb-6">🤝 M&A Operating System</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <LockedCard
            title="Deal Pipeline"
            description="Track acquisition targets, acquirers, and strategic partnerships with synergy analysis."
            icon={<GitBranch className="w-6 h-6" />}
            features={[
              'Target tracking',
              'Deal stage management',
              'Synergy modeling',
              'Valuation analysis'
            ]}
          />

          <LockedCard
            title="Due Diligence Room"
            description="Organize and track legal, financial, tax, and operational diligence items."
            icon={<CheckSquare className="w-6 h-6" />}
            features={[
              'Document tracking',
              'Gap detection',
              'Risk summaries',
              'Missing document alerts'
            ]}
          />

          <LockedCard
            title="Integration Center"
            description="Post-acquisition integration planning and progress monitoring."
            icon={<Briefcase className="w-6 h-6" />}
            features={[
              'Integration plans',
              'Milestone tracking',
              'Synergy capture monitoring',
              'Progress dashboards'
            ]}
          />
        </div>
      </div>

      {/* Compliance & Governance */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-nav mb-6">✅ Compliance & Governance</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <LockedCard
            title="Insider Compliance"
            description="Track trading windows, blackout periods, and insider transaction filings."
            icon={<Eye className="w-6 h-6" />}
            features={[
              'Blackout period management',
              'Form 4 filing reminders',
              'Trading alert system',
              'Insider transaction tracking'
            ]}
          />

          <LockedCard
            title="Audit & Controls"
            description="SOX and NI 52-109 compliance. Track internal control framework and test results."
            icon={<Shield className="w-6 h-6" />}
            features={[
              'ICFR testing',
              'Control gap identification',
              'Deficiency tracking',
              'Audit readiness scoring'
            ]}
          />

          <LockedCard
            title="Legal Center"
            description="Contract management, litigation tracking, and employment matters in one place."
            icon={<Scale className="w-6 h-6" />}
            features={[
              'Contract summaries',
              'Litigation tracking',
              'Regulatory matter management',
              'Risk detection'
            ]}
          />

          <LockedCard
            title="ESG & Sustainability"
            description="Track ESG initiatives, carbon reporting, and governance disclosures."
            icon={<Award className="w-6 h-6" />}
            features={[
              'ESG readiness scoring',
              'Carbon reporting',
              'Governance reporting',
              'Sustainability tracking'
            ]}
          />
        </div>
      </div>

      {/* Corporate Secretary */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-nav mb-6">🏢 Corporate Secretary</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <LockedCard
            title="Entity Management"
            description="Track subsidiaries, directors, officers, and jurisdictional registrations."
            icon={<Users className="w-6 h-6" />}
            features={[
              'Subsidiary tracking',
              'Director/officer database',
              'Jurisdiction management',
              'Annual return management'
            ]}
          />

          <LockedCard
            title="Board Management"
            description="Board meetings, agendas, packages, resolutions, voting, and approvals."
            icon={<CheckSquare className="w-6 h-6" />}
            features={[
              'Meeting scheduling',
              'Agenda generation',
              'Board package preparation',
              'Resolution drafting'
            ]}
          />

          <LockedCard
            title="Governance Library"
            description="Central repository for charters, policies, governance manuals, and delegation matrices."
            icon={<Award className="w-6 h-6" />}
            features={[
              'Document repository',
              'Governance gap analysis',
              'Policy review',
              'Compliance checking'
            ]}
          />
        </div>
      </div>

      {/* AI Agents */}
      <div className="mb-16 p-8 rounded-xl" style={{ background: '#EFF6FF', border: '2px solid #1D4ED8' }}>
        <h2 className="text-2xl font-bold text-nav mb-6">🤖 AI Agent Team</h2>
        <p className="text-text-muted mb-6">
          When you unlock Listed Services, you get a team of AI agents that understand your company deeply.
        </p>
        <div className="grid md:grid-cols-5 gap-4">
          {[
            { role: 'AI CEO', description: 'Strategic recommendations' },
            { role: 'AI CFO', description: 'Financial optimization' },
            { role: 'AI Secretary', description: 'Governance & compliance' },
            { role: 'AI Counsel', description: 'Legal & risk analysis' },
            { role: 'AI IR Officer', description: 'Investor engagement' },
          ].map((agent, i) => (
            <div key={i} className="p-4 bg-white rounded-lg border border-blue-200">
              <p className="font-bold text-nav text-sm">{agent.role}</p>
              <p className="text-xs text-text-muted mt-1">{agent.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center py-12">
        <p className="text-lg text-text-muted mb-4">
          When your company lists on TSX, NASDAQ, NYSE, or CSE...
        </p>
        <h2 className="text-4xl font-bold text-nav mb-8">
          All of this unlocks automatically.
        </h2>
        <p className="text-text-muted max-w-2xl mx-auto">
          Your IPO readiness journey continues as your public company operations engine. Same platform. Same data. One source of truth for your entire lifecycle.
        </p>
      </div>
    </div>
  )
}
