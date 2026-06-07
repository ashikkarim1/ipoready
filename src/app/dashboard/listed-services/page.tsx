'use client'

/**
 * Listed Services OS - Comprehensive Intelligence Platform
 * The operating system for public company decision-making
 *
 * Refactored with mission control design system:
 * - Consistent card styling with hover/animation effects
 * - Mission control color gradients and theming
 * - Typography hierarchy matching light theme
 * - Icon and spacing patterns aligned with dashboard
 * - Status badges with consistent styling
 * - Data visualization with motion animations
 * - Button/CTA styling aligned to brand
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp, TrendingDown, BarChart3, Eye, Zap, Target,
  Briefcase, Users, Lightbulb, GitBranch, Shield, Building2,
  ArrowRight, Clock, CheckCircle2, AlertCircle, Brain, Sparkles
} from 'lucide-react'

interface Module {
  id: string
  title: string
  description: string
  status: 'available' | 'coming-soon' | 'beta'
  color: {
    gradient: string
    icon: string
    badge: string
  }
  metrics: Array<{ label: string; value: string; trend?: 'up' | 'down' }>
  keyInsights: string[]
  actionItems: string[]
  dataFreshness: string
  icon: React.ReactNode
}

// Mission Control color system - aligned with dashboard theme
const COLOR_SCHEMES = {
  blue: {
    gradient: 'from-blue-500 to-blue-600',
    icon: 'text-blue-600',
    badge: 'bg-blue-50 border-blue-200 text-blue-700',
    hover: 'hover:bg-blue-50',
    accentBg: 'bg-blue-500/10',
    accentBorder: 'border-blue-500/20',
  },
  purple: {
    gradient: 'from-purple-500 to-purple-600',
    icon: 'text-purple-600',
    badge: 'bg-purple-50 border-purple-200 text-purple-700',
    hover: 'hover:bg-purple-50',
    accentBg: 'bg-purple-500/10',
    accentBorder: 'border-purple-500/20',
  },
  orange: {
    gradient: 'from-orange-500 to-orange-600',
    icon: 'text-orange-600',
    badge: 'bg-orange-50 border-orange-200 text-orange-700',
    hover: 'hover:bg-orange-50',
    accentBg: 'bg-orange-500/10',
    accentBorder: 'border-orange-500/20',
  },
  green: {
    gradient: 'from-green-500 to-green-600',
    icon: 'text-green-600',
    badge: 'bg-green-50 border-green-200 text-green-700',
    hover: 'hover:bg-green-50',
    accentBg: 'bg-green-500/10',
    accentBorder: 'border-green-500/20',
  },
  red: {
    gradient: 'from-red-500 to-red-600',
    icon: 'text-red-600',
    badge: 'bg-red-50 border-red-200 text-red-700',
    hover: 'hover:bg-red-50',
    accentBg: 'bg-red-500/10',
    accentBorder: 'border-red-500/20',
  },
  indigo: {
    gradient: 'from-indigo-500 to-indigo-600',
    icon: 'text-indigo-600',
    badge: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    hover: 'hover:bg-indigo-50',
    accentBg: 'bg-indigo-500/10',
    accentBorder: 'border-indigo-500/20',
  },
  cyan: {
    gradient: 'from-cyan-500 to-cyan-600',
    icon: 'text-cyan-600',
    badge: 'bg-cyan-50 border-cyan-200 text-cyan-700',
    hover: 'hover:bg-cyan-50',
    accentBg: 'bg-cyan-500/10',
    accentBorder: 'border-cyan-500/20',
  },
  emerald: {
    gradient: 'from-emerald-500 to-emerald-600',
    icon: 'text-emerald-600',
    badge: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    hover: 'hover:bg-emerald-50',
    accentBg: 'bg-emerald-500/10',
    accentBorder: 'border-emerald-500/20',
  },
  pink: {
    gradient: 'from-pink-500 to-pink-600',
    icon: 'text-pink-600',
    badge: 'bg-pink-50 border-pink-200 text-pink-700',
    hover: 'hover:bg-pink-50',
    accentBg: 'bg-pink-500/10',
    accentBorder: 'border-pink-500/20',
  },
  yellow: {
    gradient: 'from-yellow-500 to-yellow-600',
    icon: 'text-yellow-600',
    badge: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    hover: 'hover:bg-yellow-50',
    accentBg: 'bg-yellow-500/10',
    accentBorder: 'border-yellow-500/20',
  },
}

const modules: Module[] = [
  {
    id: 'capital-markets',
    title: 'Capital Markets Intelligence',
    description: 'Real-time visibility into sector capital activity',
    status: 'available',
    color: COLOR_SCHEMES.blue,
    icon: <TrendingUp className="w-6 h-6" />,
    metrics: [
      { label: 'Sector IPOs YTD', value: '47', trend: 'up' },
      { label: 'Capital Raised', value: '$127B', trend: 'up' },
      { label: 'Avg Valuation Multiple', value: '5.2x', trend: 'down' },
      { label: 'Peer Group', value: '23 companies' }
    ],
    keyInsights: [
      'Peer group trading at 4.8x revenue vs your 2.1x',
      'IPO success rate in your sector: 78% vs 52% overall',
      'Valuation multiples up 23% YoY',
      '3 peer lockup expirations this quarter'
    ],
    actionItems: [
      'Market window optimal for capital raise',
      'Consider secondary offering timing',
      'Monitor peer financing terms'
    ],
    dataFreshness: 'Updated daily'
  },
  {
    id: 'market-sentiment',
    title: 'Market Sentiment OS',
    description: 'Know what the market actually thinks',
    status: 'beta',
    color: COLOR_SCHEMES.purple,
    icon: <Zap className="w-6 h-6" />,
    metrics: [
      { label: 'Company Sentiment', value: '72/100', trend: 'up' },
      { label: 'Peer Average', value: '58/100' },
      { label: 'Sector Sentiment', value: '64/100', trend: 'down' },
      { label: 'Narrative Shift', value: 'Growth → Profitability' }
    ],
    keyInsights: [
      'Institutional investors emphasizing AI capabilities',
      'CEO mentioned cost structure 15x more than peers',
      'Earnings tone more cautious vs last quarter',
      'Activist signals increasing'
    ],
    actionItems: [
      'Emphasize AI/ML roadmap in investor meetings',
      'Prepare defensive narrative',
      'Highlight profitability progress'
    ],
    dataFreshness: 'Real-time (hourly)'
  },
  {
    id: 'competitive-intel',
    title: 'Competitive Intelligence',
    description: 'Know what competitors are doing',
    status: 'available',
    color: COLOR_SCHEMES.orange,
    icon: <Eye className="w-6 h-6" />,
    metrics: [
      { label: 'Active Competitors', value: '12', trend: 'up' },
      { label: 'Recent Moves', value: '8 this month', trend: 'up' },
      { label: 'Threat Level', value: 'Medium-High' },
      { label: 'Coverage Quality', value: '94%' }
    ],
    keyInsights: [
      'Competitor A hired EVP Sales → expansion phase',
      'Competitor B raised $200M → aggressive on marketing',
      'Competitor C acquired SmallStartup → entering your TAM',
      'Competitor D filed AI patent → matching roadmap'
    ],
    actionItems: [
      'Accelerate enterprise sales hiring',
      'Increase marketing targeting Competitor C customers',
      'Audit patent strategy'
    ],
    dataFreshness: 'Real-time'
  },
  {
    id: 'strategic-planning',
    title: 'Strategic Planning OS',
    description: 'Turn board directives into measurable initiatives',
    status: 'available',
    color: COLOR_SCHEMES.green,
    icon: <Target className="w-6 h-6" />,
    metrics: [
      { label: 'Active Initiatives', value: '7' },
      { label: 'On Track', value: '5 (71%)' },
      { label: 'At Risk', value: '2 (29%)' },
      { label: 'Q3 OKR Confidence', value: '78%' }
    ],
    keyInsights: [
      'Revenue growth tracking 78% of target (on pace)',
      'Product launch slipping 2 weeks (mitigation active)',
      'Cost reduction 115% of target (ahead)',
      'APAC expansion at 85% (moderate risk)'
    ],
    actionItems: [
      'Address product launch timeline with engineering',
      'Capitalize on cost reduction wins',
      'Increase APAC hiring'
    ],
    dataFreshness: 'Updated daily'
  },
  {
    id: 'm-and-a',
    title: 'M&A Intelligence Engine',
    description: 'Structured acquisition strategy',
    status: 'coming-soon',
    color: COLOR_SCHEMES.red,
    icon: <Briefcase className="w-6 h-6" />,
    metrics: [
      { label: 'Acquisition Targets', value: '47', trend: 'up' },
      { label: 'Top Candidates', value: '5 shortlisted' },
      { label: 'Avg Synergy', value: '$240M', trend: 'up' },
      { label: 'Risk Assessment', value: 'Medium' }
    ],
    keyInsights: [
      'Company X: 7.8/10 fit, $240M value creation',
      'Company Y: 23% customer overlap, integration risk',
      'Company Z: Adjacent market, 6.1/10 synergy',
      'Market favorable for 2-3 acquisitions this year'
    ],
    actionItems: [
      'Begin due diligence on Company X',
      'Meet top 3 candidate management teams',
      'Brief board on acquisition strategy'
    ],
    dataFreshness: 'Updated weekly'
  },
  {
    id: 'institutional-capital',
    title: 'Institutional Capital Engine',
    description: 'Identify investor whitespace',
    status: 'coming-soon',
    color: COLOR_SCHEMES.indigo,
    icon: <Users className="w-6 h-6" />,
    metrics: [
      { label: 'Investor Whitespace', value: '127 funds', trend: 'up' },
      { label: 'Assets Under Mgmt', value: '$12.4B', trend: 'up' },
      { label: 'Ownership Gap', value: '$4.2B opportunity' },
      { label: 'Engagement Rate', value: '32%' }
    ],
    keyInsights: [
      'Blackrock emerging tech owns 4 competitors',
      'ARK Innovation Fund matches your profile',
      'Institutions adding SaaS post-rate-peak',
      'AI infrastructure investors expanding 15%'
    ],
    actionItems: [
      'Target top 20 whitespace funds',
      'Tailor messaging to AI/profitability',
      'Schedule Q3 investor conference presence'
    ],
    dataFreshness: 'Updated quarterly'
  },
  {
    id: 'board-member',
    title: 'AI Board Member',
    description: 'Automated board-level insights',
    status: 'coming-soon',
    color: COLOR_SCHEMES.cyan,
    icon: <Lightbulb className="w-6 h-6" />,
    metrics: [
      { label: 'Board Packages/Year', value: '12' },
      { label: 'Risks Escalated', value: '23 this year' },
      { label: 'Opportunities', value: '18 identified' },
      { label: 'Board Satisfaction', value: '4.7/5' }
    ],
    keyInsights: [
      'Customer churn increased to 3.2% (investigation needed)',
      'Board independence below 50% benchmark',
      'Financing need likely within 12 months (76% probability)',
      'Key person succession gap identified'
    ],
    actionItems: [
      'Discuss churn drivers at board meeting',
      'Address governance composition',
      'Begin financing strategy discussions'
    ],
    dataFreshness: 'Updated monthly'
  },
  {
    id: 'corporate-dev',
    title: 'Corporate Development OS',
    description: 'Partnerships and distribution strategy',
    status: 'coming-soon',
    color: COLOR_SCHEMES.emerald,
    icon: <GitBranch className="w-6 h-6" />,
    metrics: [
      { label: 'Potential Partners', value: '34', trend: 'up' },
      { label: 'Distribution Channels', value: '12 identified' },
      { label: 'Revenue Opportunity', value: '$240M+' },
      { label: 'JVs in Pipeline', value: '2' }
    ],
    keyInsights: [
      'Strategic software company: 34% customer overlap',
      'Systems integrator reaches 2,400 enterprises',
      'Distribution partner could add $120M revenue',
      'Licensing opportunity worth $80-120M'
    ],
    actionItems: [
      'Schedule partnership discussions',
      'Model systems integrator economics',
      'Begin licensing negotiations'
    ],
    dataFreshness: 'Updated weekly'
  },
  {
    id: 'ceo-twin',
    title: 'CEO Digital Twin',
    description: 'AI trained on your decisions',
    status: 'coming-soon',
    color: COLOR_SCHEMES.pink,
    icon: <Shield className="w-6 h-6" />,
    metrics: [
      { label: 'Decision Accuracy', value: '84%', trend: 'up' },
      { label: 'Decisions Analyzed', value: '127' },
      { label: 'Strategic Consistency', value: '91%' },
      { label: 'Risk Pattern Match', value: 'Strong' }
    ],
    keyInsights: [
      'You prefer bolt-on acquisitions (avoid large integrations)',
      'Typically pay 15% premium for founder retention',
      'Emphasize culture fit in deals',
      'Conservative guidance, surprise upside pattern'
    ],
    actionItems: [
      'Get AI perspective on M&A opportunities',
      'Use twin for board decision consistency',
      'Leverage for emerging frameworks'
    ],
    dataFreshness: 'Real-time'
  },
  {
    id: 'predictive-engine',
    title: 'Predictive Engine',
    description: 'Know what\'s going to happen',
    status: 'coming-soon',
    color: COLOR_SCHEMES.yellow,
    icon: <AlertCircle className="w-6 h-6" />,
    metrics: [
      { label: 'Predictions Made', value: '847' },
      { label: 'Accuracy Rate', value: '87%', trend: 'up' },
      { label: 'False Positives', value: '8%' },
      { label: 'Lead Time Avg', value: '12 weeks' }
    ],
    keyInsights: [
      'Financing need: 76% probability (8-week lead)',
      'Governance risk: 42% probability dysfunction',
      'Activist risk: 15% probability involvement',
      'M&A target: 28% probability acquisition',
      'Stock risk: 31% probability 20%+ decline'
    ],
    actionItems: [
      'Begin capital raise conversations with board',
      'Improve ROE metrics (governance risk)',
      'Enhance board composition (activist defense)'
    ],
    dataFreshness: 'Updated weekly'
  }
]

export default function ListedServicesPage() {
  const [selectedModule, setSelectedModule] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'beta' | 'coming-soon'>('all')

  const filteredModules = modules.filter(m => {
    if (filterStatus === 'all') return true
    return m.status === filterStatus
  })

  const availableCount = modules.filter(m => m.status === 'available').length
  const betaCount = modules.filter(m => m.status === 'beta').length
  const comingSoonCount = modules.filter(m => m.status === 'coming-soon').length

  const selectedModuleData = modules.find(m => m.id === selectedModule)

  return (
    <div style={{ background: '#F7F6F4', minHeight: '100vh' }} suppressHydrationWarning>
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-primary)', backdropFilter: 'blur(4px)' }} className="sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-0 space-y-3">
          <div>
            <h1 style={{ color: 'var(--color-text-primary)' }} className="text-2xl sm:text-3xl font-bold mb-1">Listed Services OS</h1>
            <p style={{ color: 'var(--color-text-secondary)' }} className="text-sm sm:text-base">
              The intelligence layer for public company leaders
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-6 pt-2">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
              style={{ background: 'var(--color-info-soft)', borderColor: 'var(--color-info-medium)' }}
              className="rounded-xl border p-4">
              <p style={{ color: 'var(--color-info)' }} className="text-xs font-semibold uppercase tracking-wider">Total Modules</p>
              <p style={{ color: 'var(--color-info)' }} className="text-xl sm:text-2xl font-bold mt-1">10</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              style={{ background: 'var(--color-success-soft)', borderColor: 'var(--color-success)' }}
              className="rounded-xl border p-4">
              <p style={{ color: 'var(--color-success)' }} className="text-xs font-semibold uppercase tracking-wider">Available</p>
              <p style={{ color: 'var(--color-success)' }} className="text-xl sm:text-2xl font-bold mt-1">{availableCount}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{ background: 'rgba(168, 85, 247, 0.05)', borderColor: 'rgba(168, 85, 247, 0.2)' }}
              className="rounded-xl border p-4">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#A855F7' }}>In Beta</p>
              <p className="text-xl sm:text-2xl font-bold mt-1" style={{ color: '#A855F7' }}>{betaCount}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              style={{ background: 'var(--color-warning-soft)', borderColor: 'var(--color-warning)' }}
              className="rounded-xl border p-4">
              <p style={{ color: 'var(--color-warning)' }} className="text-xs font-semibold uppercase tracking-wider">Coming Soon</p>
              <p style={{ color: 'var(--color-warning)' }} className="text-xl sm:text-2xl font-bold mt-1">{comingSoonCount}</p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-3 mb-16 mt-4" style={{ rowGap: '12px' }}>
          {(['all', 'available', 'beta', 'coming-soon'] as const).map((status, index) => (
            <motion.button
              key={status}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setFilterStatus(status)}
              style={
                filterStatus === status
                  ? { background: 'var(--color-accent)', color: 'var(--color-text-inverse)', borderColor: 'var(--color-accent)' }
                  : { background: 'var(--color-surface-primary)', color: 'var(--color-text-secondary)', borderColor: 'var(--color-border)' }
              }
              className="px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl font-medium border transition-all hover:border-gray-400"
            >
              <span className="text-xs sm:text-sm">
                {status === 'all' && 'All'}
                {status === 'available' && `Available (${availableCount})`}
                {status === 'beta' && `Beta (${betaCount})`}
                {status === 'coming-soon' && `Coming (${comingSoonCount})`}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {filteredModules.map((module, index) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                console.log('Card clicked:', module.id, 'Currently selected:', selectedModule)
                setSelectedModule(selectedModule === module.id ? null : module.id)
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  console.log('Card keyboard pressed:', module.id)
                  setSelectedModule(selectedModule === module.id ? null : module.id)
                }
              }}
              style={
                selectedModule === module.id
                  ? { background: 'var(--color-surface-primary)', borderColor: 'var(--color-accent)', boxShadow: '0 4px 12px rgba(232, 49, 42, 0.1)' }
                  : { background: 'var(--color-surface-primary)', borderColor: 'var(--color-border)' }
              }
              className="text-left p-6 rounded-xl border transition-all group cursor-pointer hover:border-gray-400 hover:shadow-sm"
              onMouseEnter={(e) => {
                if (selectedModule !== module.id) {
                  e.currentTarget.style.borderColor = 'var(--color-border-dark)'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'
                }
              }}
              onMouseLeave={(e) => {
                if (selectedModule !== module.id) {
                  e.currentTarget.style.borderColor = 'var(--color-border)'
                  e.currentTarget.style.boxShadow = 'none'
                }
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${module.color.gradient} text-white`}>
                  {module.icon}
                </div>
                <div>
                  {module.status === 'available' && (
                    <motion.span
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.05 + 0.2 }}
                      style={{ background: 'var(--color-success-soft)', color: 'var(--color-success)' }}
                      className="px-2 py-1 text-xs rounded-full font-semibold inline-block border border-green-200"
                    >
                      Available
                    </motion.span>
                  )}
                  {module.status === 'beta' && (
                    <motion.span
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.05 + 0.2 }}
                      style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#A855F7' }}
                      className="px-2 py-1 text-xs rounded-full font-semibold inline-block border border-purple-200"
                    >
                      Beta
                    </motion.span>
                  )}
                  {module.status === 'coming-soon' && (
                    <motion.span
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.05 + 0.2 }}
                      style={{ background: 'var(--color-warning-soft)', color: 'var(--color-warning)' }}
                      className="px-2 py-1 text-xs rounded-full font-semibold inline-block border border-yellow-200"
                    >
                      Coming Soon
                    </motion.span>
                  )}
                </div>
              </div>

              <h3 style={{ color: 'var(--color-text-primary)' }} className="text-base sm:text-lg font-bold mb-1">{module.title}</h3>
              <p style={{ color: 'var(--color-text-secondary)' }} className="text-xs sm:text-sm mb-4">{module.description}</p>

              <div className="grid grid-cols-2 gap-2 mb-4">
                {module.metrics.slice(0, 2).map((metric, idx) => (
                  <div key={idx} style={{ background: 'var(--color-surface-secondary)', borderColor: 'var(--color-border)' }} className="rounded border p-2">
                    <p style={{ color: 'var(--color-text-secondary)' }} className="text-xs">{metric.label}</p>
                    <p style={{ color: 'var(--color-text-primary)' }} className="text-sm font-bold mt-1">{metric.value}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2" style={{ color: 'var(--color-accent)' }}>
                <span className="text-xs sm:text-sm font-semibold">
                  {selectedModule === module.id ? 'Hide' : 'View Details'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Detailed View */}
        <AnimatePresence>
          {selectedModuleData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              style={{ background: 'var(--color-surface-primary)', borderColor: 'var(--color-border)' }}
              className="border rounded-xl p-6 sm:p-8 mb-12 shadow-card"
            >
              <div className="flex items-center gap-4 mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 100 }}
                  className={`p-4 rounded-lg bg-gradient-to-br ${selectedModuleData.color.gradient} text-white`}
                >
                  {selectedModuleData.icon}
                </motion.div>
                <div>
                  <h2 style={{ color: 'var(--color-text-primary)' }} className="text-xl sm:text-2xl font-bold">{selectedModuleData.title}</h2>
                  <p style={{ color: 'var(--color-text-secondary)' }} className="mt-1 text-sm">{selectedModuleData.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 style={{ color: 'var(--color-text-primary)' }} className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
                    Key Metrics
                  </h3>
                  <div className="space-y-3 mb-8">
                    {selectedModuleData.metrics.map((metric, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        style={{ background: 'var(--color-surface-secondary)', borderColor: 'var(--color-border)' }}
                        className="rounded-lg border p-4"
                      >
                        <div className="flex items-center justify-between">
                          <p style={{ color: 'var(--color-text-secondary)' }} className="text-sm">{metric.label}</p>
                          {metric.trend && (
                            <div style={{ color: metric.trend === 'up' ? 'var(--color-success)' : 'var(--color-error)' }}>
                              {metric.trend === 'up' ? (
                                <TrendingUp className="w-4 h-4" />
                              ) : (
                                <TrendingDown className="w-4 h-4" />
                              )}
                            </div>
                          )}
                        </div>
                        <p style={{ color: 'var(--color-text-primary)' }} className="text-xl sm:text-2xl font-bold mt-2">{metric.value}</p>
                      </motion.div>
                    ))}
                  </div>

                  <h3 style={{ color: 'var(--color-text-primary)' }} className="text-base sm:text-lg font-bold mb-4">Key Insights</h3>
                  <div className="space-y-2">
                    {selectedModuleData.keyInsights.map((insight, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 + 0.2 }}
                        className="flex gap-3 text-sm"
                      >
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-success)' }} />
                        <p style={{ color: 'var(--color-text-secondary)' }}>{insight}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 style={{ color: 'var(--color-text-primary)' }} className="text-base sm:text-lg font-bold mb-4">Recommended Actions</h3>
                  <div className="space-y-2 mb-8">
                    {selectedModuleData.actionItems.map((action, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        style={{ background: 'var(--color-info-soft)', borderColor: 'var(--color-info-medium)' }}
                        className="flex gap-3 rounded-lg border p-3"
                      >
                        <ArrowRight className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-info)' }} />
                        <p style={{ color: 'var(--color-text-secondary)' }} className="text-sm">{action}</p>
                      </motion.div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div style={{ background: 'var(--color-surface-secondary)', borderColor: 'var(--color-border)' }} className="rounded-lg border p-4">
                      <p style={{ color: 'var(--color-text-secondary)' }} className="text-xs uppercase font-semibold tracking-wider">Data Freshness</p>
                      <p style={{ color: 'var(--color-text-primary)' }} className="text-sm font-bold mt-2">{selectedModuleData.dataFreshness}</p>
                    </div>

                    {selectedModuleData.status === 'available' || selectedModuleData.status === 'beta' ? (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          // Navigate to module dashboard based on module ID
                          const moduleRoutes: Record<string, string> = {
                            'board-intelligence': '/dashboard/board-portal',
                            'shareholder-comms': '/dashboard/shareholder-communications',
                            'compliance-tracker': '/dashboard/compliance-tracker',
                            'market-intelligence': '/dashboard/intelligence-hub',
                            'filing-coordinator': '/documents',
                            'insider-trading': '/dashboard/insider-trading',
                            'proxy-manager': '/dashboard/proxy-manager',
                            'sec-reporter': '/dashboard/sec-reporter',
                            'institutional-relations': '/dashboard/institutional-relations',
                            'mna-intelligence': '/dashboard/listed-services/preview/mna-intelligence'
                          }
                          const route = moduleRoutes[selectedModuleData.id] || '/dashboard'
                          window.location.href = route
                        }}
                        style={{ background: 'var(--color-accent)', color: 'var(--color-text-inverse)' }}
                        className="w-full font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 hover:opacity-90"
                      >
                        <Eye className="w-4 h-4" />
                        View Dashboard
                      </motion.button>
                    ) : (
                      <button
                        style={{ background: 'var(--color-surface-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-tertiary)' }}
                        className="w-full font-semibold py-3 rounded-lg border flex items-center justify-center gap-2 cursor-not-allowed opacity-60"
                        disabled
                      >
                        <Clock className="w-4 h-4" />
                        Coming Soon
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Value Prop */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ background: 'var(--color-info-soft)', borderColor: 'var(--color-info-medium)' }}
          className="rounded-xl border p-6 sm:p-8"
        >
          <h2 style={{ color: 'var(--color-text-primary)' }} className="text-xl sm:text-2xl font-bold mb-6">Intelligence vs. Compliance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <h3 style={{ color: 'var(--color-text-primary)' }} className="font-bold text-base sm:text-lg mb-3">Traditional Software</h3>
              <ul style={{ color: 'var(--color-text-secondary)' }} className="space-y-2 text-xs sm:text-sm">
                <li className="flex gap-2"><span>•</span> <span>Helps you DO work</span></li>
                <li className="flex gap-2"><span>•</span> <span>Compliance + Workflows</span></li>
                <li className="flex gap-2"><span>•</span> <span>Monthly updates</span></li>
                <li className="flex gap-2"><span>•</span> <span>Historical reporting</span></li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 style={{ color: 'var(--color-text-primary)' }} className="font-bold text-base sm:text-lg mb-3">Listed Services OS</h3>
              <ul style={{ color: 'var(--color-text-secondary)' }} className="space-y-2 text-xs sm:text-sm">
                <li className="flex gap-2"><span>•</span> <span>Helps you DECIDE what to do</span></li>
                <li className="flex gap-2"><span>•</span> <span>Intelligence + Recommendation</span></li>
                <li className="flex gap-2"><span>•</span> <span>Automated insights</span></li>
                <li className="flex gap-2"><span>•</span> <span>Predictive analytics</span></li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              style={{ background: 'var(--color-success-soft)', borderColor: 'var(--color-success)' }}
              className="rounded-lg border p-4 flex flex-col justify-center"
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5" style={{ color: 'var(--color-success)' }} />
                <p style={{ color: 'var(--color-success)' }} className="font-bold">The Outcome</p>
              </div>
              <p style={{ color: 'var(--color-text-secondary)' }} className="text-xs sm:text-sm">
                Better decisions. Fewer surprises. More value created.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-light)' }}
        className="border-t mt-16 py-12"
      >
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 style={{ color: 'var(--color-text-primary)' }} className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
            The Operating System for Public Company Leaders
          </h2>
          <p style={{ color: 'var(--color-text-secondary)' }} className="text-base sm:text-lg mb-8">
            Bloomberg for strategy. Salesforce for execution.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ background: 'var(--color-accent)', color: 'var(--color-text-inverse)' }}
            className="px-6 sm:px-8 py-2.5 sm:py-3 font-bold rounded-lg transition-all hover:opacity-90"
          >
            Request Early Access
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
