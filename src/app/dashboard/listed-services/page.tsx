'use client'

/**
 * Listed Services OS - Comprehensive Intelligence Platform
 * The operating system for public company decision-making
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp, TrendingDown, BarChart3, Eye, Zap, Target,
  Briefcase, Users, Lightbulb, GitBranch, Shield, Building2,
  ArrowRight, Clock, CheckCircle2, AlertCircle, Brain
} from 'lucide-react'

interface Module {
  id: string
  title: string
  description: string
  status: 'available' | 'coming-soon' | 'beta'
  color: string
  metrics: Array<{ label: string; value: string; trend?: 'up' | 'down' }>
  keyInsights: string[]
  actionItems: string[]
  dataFreshness: string
  icon: React.ReactNode
}

const modules: Module[] = [
  {
    id: 'capital-markets',
    title: 'Capital Markets Intelligence',
    description: 'Real-time visibility into sector capital activity',
    status: 'available',
    color: 'from-blue-500 to-blue-600',
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
    color: 'from-purple-500 to-purple-600',
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
    color: 'from-orange-500 to-orange-600',
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
    color: 'from-green-500 to-green-600',
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
    color: 'from-red-500 to-red-600',
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
    color: 'from-indigo-500 to-indigo-600',
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
    color: 'from-cyan-500 to-cyan-600',
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
    color: 'from-emerald-500 to-emerald-600',
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
    color: 'from-pink-500 to-pink-600',
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
    color: 'from-yellow-500 to-yellow-600',
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Listed Services OS</h1>
            <p className="text-xl text-slate-300">
              The intelligence layer for public company leaders
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <p className="text-sm text-blue-300">Total Modules</p>
              <p className="text-3xl font-bold text-blue-400 mt-1">10</p>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <p className="text-sm text-green-300">Available</p>
              <p className="text-3xl font-bold text-green-400 mt-1">{availableCount}</p>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
              <p className="text-sm text-purple-300">In Beta</p>
              <p className="text-3xl font-bold text-purple-400 mt-1">{betaCount}</p>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
              <p className="text-sm text-amber-300">Coming Soon</p>
              <p className="text-3xl font-bold text-amber-400 mt-1">{comingSoonCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Filter Tabs */}
        <div className="flex gap-4 mb-12">
          {(['all', 'available', 'beta', 'coming-soon'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {status === 'all' && 'All'}
              {status === 'available' && `Available (${availableCount})`}
              {status === 'beta' && `Beta (${betaCount})`}
              {status === 'coming-soon' && `Coming (${comingSoonCount})`}
            </button>
          ))}
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {filteredModules.map((module, index) => (
            <motion.button
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedModule(selectedModule === module.id ? null : module.id)}
              className={`text-left p-6 rounded-lg border transition-all group cursor-pointer ${
                selectedModule === module.id
                  ? 'bg-slate-700 border-blue-500'
                  : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${module.color} text-white`}>
                  {module.icon}
                </div>
                <div>
                  {module.status === 'available' && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded font-medium">
                      Available
                    </span>
                  )}
                  {module.status === 'beta' && (
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded font-medium">
                      Beta
                    </span>
                  )}
                  {module.status === 'coming-soon' && (
                    <span className="px-2 py-1 bg-amber-500/20 text-amber-300 text-xs rounded font-medium">
                      Coming Soon
                    </span>
                  )}
                </div>
              </div>

              <h3 className="text-lg font-bold mb-1">{module.title}</h3>
              <p className="text-sm text-slate-400 mb-4">{module.description}</p>

              <div className="grid grid-cols-2 gap-2 mb-4">
                {module.metrics.slice(0, 2).map((metric, idx) => (
                  <div key={idx} className="bg-slate-700/50 rounded p-2">
                    <p className="text-xs text-slate-400">{metric.label}</p>
                    <p className="text-sm font-bold">{metric.value}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 text-blue-400 text-sm font-medium">
                {selectedModule === module.id ? 'Hide' : 'View Details'}
                <ArrowRight className="w-4 h-4" />
              </div>
            </motion.button>
          ))}
        </div>

        {/* Detailed View */}
        <AnimatePresence>
          {selectedModuleData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-slate-800 border border-slate-700 rounded-lg p-8 mb-12"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className={`p-4 rounded-lg bg-gradient-to-br ${selectedModuleData.color} text-white`}>
                  {selectedModuleData.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{selectedModuleData.title}</h2>
                  <p className="text-slate-400 mt-1">{selectedModuleData.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Key Metrics
                  </h3>
                  <div className="space-y-3 mb-8">
                    {selectedModuleData.metrics.map((metric, idx) => (
                      <div key={idx} className="bg-slate-700/50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-slate-400">{metric.label}</p>
                          {metric.trend && (
                            <div className={metric.trend === 'up' ? 'text-green-400' : 'text-red-400'}>
                              {metric.trend === 'up' ? (
                                <TrendingUp className="w-4 h-4" />
                              ) : (
                                <TrendingDown className="w-4 h-4" />
                              )}
                            </div>
                          )}
                        </div>
                        <p className="text-2xl font-bold mt-2">{metric.value}</p>
                      </div>
                    ))}
                  </div>

                  <h3 className="text-lg font-bold mb-4">Key Insights</h3>
                  <div className="space-y-2">
                    {selectedModuleData.keyInsights.map((insight, idx) => (
                      <div key={idx} className="flex gap-3 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        <p className="text-slate-300">{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold mb-4">Recommended Actions</h3>
                  <div className="space-y-2 mb-8">
                    {selectedModuleData.actionItems.map((action, idx) => (
                      <div key={idx} className="flex gap-3 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                        <ArrowRight className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-slate-300">{action}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <p className="text-xs text-slate-400">Data Freshness</p>
                      <p className="text-sm font-bold mt-1">{selectedModuleData.dataFreshness}</p>
                    </div>

                    {selectedModuleData.status === 'available' || selectedModuleData.status === 'beta' ? (
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                        <Eye className="w-4 h-4" />
                        View Dashboard
                      </button>
                    ) : (
                      <button className="w-full bg-slate-700 text-slate-300 font-medium py-3 rounded-lg cursor-not-allowed flex items-center justify-center gap-2">
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
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Intelligence vs. Compliance</h2>
          <div className="grid grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-2">Traditional Software</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>Helps you DO work</li>
                <li>Compliance + Workflows</li>
                <li>Monthly updates</li>
                <li>Historical reporting</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">Listed Services OS</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>Helps you DECIDE what to do</li>
                <li>Intelligence + Recommendation</li>
                <li>Automated insights</li>
                <li>Predictive analytics</li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-lg p-4 border border-green-500/30">
              <p className="font-bold text-green-300">The Outcome</p>
              <p className="text-sm text-slate-300 mt-2">
                Better decisions. Fewer surprises. More value created.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-700 bg-slate-800/50 mt-16 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">
            The Operating System for Public Company Leaders
          </h2>
          <p className="text-xl text-slate-400 mb-8">
            Bloomberg for strategy. Salesforce for execution.
          </p>
          <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg">
            Request Early Access
          </button>
        </div>
      </div>
    </div>
  )
}
