'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp, AlertCircle, CheckCircle2, Clock, Target,
  BarChart3, Users, Zap, Globe, Lightbulb, Lock, Unlock,
  ChevronDown, ChevronUp, ArrowUpRight, ArrowDownRight
} from 'lucide-react'
import PremiumPageLayout from '../components/PremiumPageLayout'
import UpgradeModal from '../components/UpgradeModal'

interface TrafficLight {
  status: 'green' | 'yellow' | 'red'
  label: string
  value: string
  insight: string
}

export default function MarketAdvantageIntelligence() {
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>('market-conditions')
  const [isLoading, setIsLoading] = useState(false)

  // Market Conditions Traffic Lights
  const marketConditions: TrafficLight[] = [
    {
      status: 'green',
      label: 'SaaS IPO Market',
      value: 'HOT',
      insight: 'Recent SaaS IPOs showing strong post-IPO performance. Window is open.',
    },
    {
      status: 'green',
      label: 'Capital Markets Appetite',
      value: 'STRONG',
      insight: 'Institutional investors actively seeking growth companies (25%+ YoY).',
    },
    {
      status: 'yellow',
      label: 'Auditor Availability',
      value: 'MODERATE',
      insight: 'Big 4 capacity improving but still selective. Secure within 2 weeks.',
    },
    {
      status: 'yellow',
      label: 'Underwriter Competition',
      value: 'MODERATE',
      insight: 'Quality underwriters are selective. Early engagement recommended.',
    },
  ]

  // Your Company Assessment
  const companyAssessment = [
    { category: 'Growth Rate', value: '28% YoY', target: '30%+', status: 'yellow' as const },
    { category: 'Profitability Path', value: 'Month 24', target: 'Month 18', status: 'yellow' as const },
    { category: 'Team Depth', value: '85/100', target: '85/100', status: 'green' as const },
    { category: 'Financial Governance', value: '78/100', target: '85/100', status: 'yellow' as const },
    { category: 'Investor Appeal', value: '82/100', target: '85/100', status: 'green' as const },
  ]

  // Valuation Benchmarking
  const valuationComps = [
    { company: 'Figma (Design SaaS)', multiple: '12.5x ARR', status: 'green', context: 'Elite growth (45%+ YoY)' },
    { company: 'Stripe (Payments)', multiple: '8.5x Revenue', status: 'green', context: 'Market leader' },
    { company: 'Industry Average', multiple: '9x ARR', status: 'green', context: 'Your comp range' },
    { company: 'Your Projected Range', multiple: '8-11x ARR', status: 'yellow', context: 'Based on growth & profitability' },
  ]

  // Competitive Positioning
  const competitivePosition = [
    { metric: 'Growth Rate', you: 28, competitor1: 35, competitor2: 22, competitor3: 31, optimal: 30 },
    { metric: 'Gross Margin', you: 72, competitor1: 68, competitor2: 75, competitor3: 70, optimal: 75 },
    { metric: 'Magic Number', you: 0.82, competitor1: 0.95, competitor2: 0.68, competitor3: 0.89, optimal: 0.9 },
    { metric: 'CAC Payback', you: 14, competitor1: 12, competitor2: 16, competitor3: 13, optimal: 12 },
  ]

  // Strategic Options Matrix
  const strategicOptions = [
    {
      title: 'Accelerate Timeline',
      timeline: '60-90 days',
      valuation: '$1.5B-$2.0B',
      risk: 'medium',
      score: 8.5,
      pros: ['Hit optimal market window', 'Highest valuation multiples available', 'First-mover in category'],
      cons: ['Execution risk', 'Limited time for prospectus refinement'],
    },
    {
      title: 'Growth Acceleration',
      timeline: '12-18 months',
      valuation: '$2.0B-$2.8B',
      risk: 'low',
      score: 8.0,
      pros: ['Higher valuation multiple', 'Stronger narrative', 'Lower execution risk'],
      cons: ['Delayed liquidity', 'Market conditions may change'],
    },
    {
      title: 'Direct IPO',
      timeline: '45-60 days',
      valuation: '$1.65B-$2.15B',
      risk: 'high',
      score: 7.5,
      pros: ['5-10% fee savings', '10-15% pricing advantage potential', 'No lock-up period'],
      cons: ['Higher regulatory complexity', 'Less underwriter support'],
    },
  ]

  // Market Timing Window
  const marketWindow = {
    open: true,
    daysRemaining: 45,
    closes: 'Aug 31, 2026',
    conditions: [
      { metric: 'Investor appetite', level: 'strong' },
      { metric: 'Valuation environment', level: 'favorable' },
      { metric: 'Underwriter capacity', level: 'available' },
    ],
  }

  return (
    <>
      <PremiumPageLayout
        title="Market Advantage Intelligence"
        subtitle="Real-time market conditions, competitive positioning, and strategic timing for maximum value"
        icon={<Globe className="w-8 h-8 text-teal-600" />}
      >
        <div className="space-y-8">

          {/* MARKET CONDITIONS DASHBOARD */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedSection(expandedSection === 'market-conditions' ? null : 'market-conditions')}>
              <h2 className="text-text-muted text-xs uppercase tracking-wider font-semibold mb-0">📊 Market Conditions (Real-Time)</h2>
              {expandedSection === 'market-conditions' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
            <AnimatePresence>
              {expandedSection === 'market-conditions' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3">
                  {marketConditions.map((light, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="rounded-lg border border-gray-200 bg-white p-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-4 h-4 rounded-full flex-shrink-0 ${
                          light.status === 'green' ? 'bg-green-500' :
                          light.status === 'yellow' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-nav text-sm">{light.label}</p>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                              light.status === 'green' ? 'bg-green-100 text-green-700' :
                              light.status === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>{light.value}</span>
                          </div>
                          <p className="text-xs text-text-muted">{light.insight}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* MARKET TIMING WINDOW */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`rounded-lg border-2 p-6 ${marketWindow.open ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-nav text-lg mb-1">IPO Market Window Status</h3>
                <p className={`text-sm font-semibold ${marketWindow.open ? 'text-green-700' : 'text-red-700'}`}>
                  {marketWindow.open ? '✓ WINDOW OPEN' : '✗ WINDOW CLOSED'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-nav">{marketWindow.daysRemaining}</p>
                <p className="text-xs text-text-muted">days remaining</p>
              </div>
            </div>
            <p className="text-sm text-text-muted mb-4">Closes: {marketWindow.closes}</p>
            <div className="grid grid-cols-3 gap-3">
              {marketWindow.conditions.map((cond, i) => (
                <div key={i} className="bg-white rounded-lg p-3">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mb-2" />
                  <p className="text-xs font-semibold text-nav capitalize">{cond.metric}</p>
                  <p className="text-xs text-green-700 font-bold capitalize mt-1">{cond.level}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* YOUR COMPANY ASSESSMENT */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedSection(expandedSection === 'company-assessment' ? null : 'company-assessment')}>
              <h2 className="text-lg font-bold text-nav">📊 Your Company Assessment</h2>
              {expandedSection === 'company-assessment' ? <ChevronUp /> : <ChevronDown />}
            </div>
            <AnimatePresence>
              {expandedSection === 'company-assessment' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="grid grid-cols-1 gap-3">
                  {companyAssessment.map((item, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="rounded-lg border border-gray-200 bg-white p-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-semibold text-nav text-sm">{item.category}</p>
                        <div className={`w-3 h-3 rounded-full ${item.status === 'green' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-nav">{item.value}</p>
                          <p className="text-xs text-text-muted">Target: {item.target}</p>
                        </div>
                        <div className="w-16 h-8 bg-gray-200 rounded-full flex items-center">
                          <div className={`h-7 w-7 rounded-full ${item.status === 'green' ? 'bg-green-500 ml-auto mr-0.5' : 'bg-yellow-500 ml-auto mr-0.5'}`} />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* VALUATION BENCHMARKING */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedSection(expandedSection === 'valuation' ? null : 'valuation')}>
              <h2 className="text-text-muted text-xs uppercase tracking-wider font-semibold mb-0">💰 Valuation Benchmarking</h2>
              {expandedSection === 'valuation' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
            <AnimatePresence>
              {expandedSection === 'valuation' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3">
                  {valuationComps.map((comp, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className={`rounded-lg border-2 p-4 ${comp.status === 'green' ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-nav">{comp.company}</p>
                        <p className="text-lg font-bold text-teal-600">{comp.multiple}</p>
                      </div>
                      <p className="text-xs text-text-muted">{comp.context}</p>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* COMPETITIVE POSITIONING */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedSection(expandedSection === 'competitive' ? null : 'competitive')}>
              <h2 className="text-text-muted text-xs uppercase tracking-wider font-semibold mb-0">🎯 Competitive Positioning</h2>
              {expandedSection === 'competitive' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
            <AnimatePresence>
              {expandedSection === 'competitive' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4">
                  {competitivePosition.map((comp, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="rounded-lg border border-gray-200 bg-white p-4">
                      <p className="text-sm font-bold text-nav mb-3">{comp.metric}</p>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-blue-600">You: {comp.you}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600">Comp1: {comp.competitor1}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600">Comp2: {comp.competitor2}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600">Optimal: {comp.optimal}</span>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(comp.you / Math.max(comp.you, comp.competitor1, comp.competitor2, comp.optimal)) * 100}%` }} />
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* STRATEGIC OPTIONS COMPARISON */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedSection(expandedSection === 'options' ? null : 'options')}>
              <h2 className="text-text-muted text-xs uppercase tracking-wider font-semibold mb-0">⚡ Strategic Options Comparison</h2>
              {expandedSection === 'options' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
            <AnimatePresence>
              {expandedSection === 'options' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4">
                  {strategicOptions.map((opt, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="rounded-lg border border-gray-200 bg-white p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-bold text-nav text-base">{opt.title}</p>
                          <p className="text-sm text-text-muted mt-1">{opt.timeline} timeline • {opt.valuation} valuation</p>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="text-2xl font-bold text-teal-600">{opt.score}/10</div>
                          <div className={`text-xs font-bold px-2 py-1 rounded mt-1 ${
                            opt.risk === 'low' ? 'bg-green-100 text-green-700' :
                            opt.risk === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>{opt.risk.toUpperCase()} RISK</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="font-bold text-green-700 mb-2">✓ Pros</p>
                          <ul className="space-y-1">
                            {opt.pros.map((pro, j) => <li key={j} className="text-text-muted">• {pro}</li>)}
                          </ul>
                        </div>
                        <div>
                          <p className="font-bold text-red-700 mb-2">✗ Cons</p>
                          <ul className="space-y-1">
                            {opt.cons.map((con, j) => <li key={j} className="text-text-muted">• {con}</li>)}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* RECOMMENDATION ENGINE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-lg border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-white p-6"
          >
            <h3 className="text-text-muted text-xs uppercase tracking-wider font-semibold mb-4">🎯 IPOReady Recommendation</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-nav text-sm mb-1">Your Optimal Path: Accelerated Timeline (60-90 Days)</p>
                  <p className="text-sm text-text-muted">Market window is open for next 45 days. Hit it = $300M-$500M valuation uplift.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-nav text-sm mb-1">Next 48 Hours: Secure Big 4 Auditor</p>
                  <p className="text-sm text-text-muted">Availability window is closing. Early engagement saves 4 weeks on critical path.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-nav text-sm mb-1">Growth Gap: Hit 30% YoY (Currently 28%)</p>
                  <p className="text-sm text-text-muted">2% growth increase moves you from 9x to 10x valuation multiple. Worth $200M-$300M uplift.</p>
                </div>
              </div>
            </div>
          </motion.div>

          <button onClick={() => setShowUpgrade(true)} className="block mx-auto px-6 py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-all">
            Start Strategic Planning Session
          </button>
        </div>
      </PremiumPageLayout>
      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} featureKey="market_advantage" featureName="Market Advantage Intelligence" />
    </>
  )
}
