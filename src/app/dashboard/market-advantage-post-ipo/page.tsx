'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Clock, Target,
  BarChart3, Users, Zap, Globe, Lightbulb, Lock, Unlock,
  ChevronDown, ChevronUp, ArrowUpRight, ArrowDownRight, FileText
} from 'lucide-react'
import PremiumPageLayout from '../components/PremiumPageLayout'
import UpgradeModal from '../components/UpgradeModal'

interface StockMetric {
  label: string
  value: string
  change: string
  status: 'green' | 'yellow' | 'red'
  insight: string
}

export default function PostIPOMarketAdvantage() {
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>('stock-performance')
  const [isLoading, setIsLoading] = useState(false)

  // Stock Performance Metrics
  const stockMetrics: StockMetric[] = [
    {
      label: 'Current Share Price',
      value: '$47.32',
      change: '+18.2% from IPO ($40)',
      status: 'green',
      insight: 'Strong post-IPO performance. Above lockup period expectations.',
    },
    {
      label: 'Market Cap',
      value: '$4.73B',
      change: '+18.2% from IPO ($4.0B)',
      status: 'green',
      insight: 'Valuation expanded to 9.5x ARR (from 8x at IPO).',
    },
    {
      label: 'Trading Volume',
      value: '2.3M shares/day',
      change: 'Avg: 1.8M (healthy)',
      status: 'green',
      insight: 'Strong institutional interest. Liquidity improving.',
    },
    {
      label: 'Analyst Rating',
      value: '18 Buy / 4 Hold',
      change: '+3 upgrades this month',
      status: 'green',
      insight: 'Positive analyst sentiment post-earnings. No sells.',
    },
  ]

  // SEC Filings & Compliance
  const recentFilings = [
    {
      form: '10-Q',
      filed: 'May 15, 2026',
      dueDate: 'N/A',
      status: 'filed',
      highlights: ['Q1 Revenue: $51.2M (+32% YoY)', 'Gross Margin: 73%', 'Net Income: $2.1M'],
    },
    {
      form: '8-K',
      filed: 'May 8, 2026',
      dueDate: 'N/A',
      status: 'filed',
      highlights: ['CEO Interview on CNBC', 'Strategic Partnership Announced', 'No material events'],
    },
    {
      form: '10-K',
      filed: 'Mar 28, 2026',
      dueDate: 'N/A',
      status: 'filed',
      highlights: ['FY2025 Revenue: $162.4M (+28% YoY)', 'Operating Margin: 18%', 'SOX 404 Compliant'],
    },
    {
      form: 'Proxy (Schedule 14A)',
      filed: 'Apr 10, 2026',
      dueDate: 'Shareholder vote: Jun 15, 2026',
      status: 'pending_vote',
      highlights: ['Board election', 'Executive compensation', 'Stock plan approval'],
    },
  ]

  // Competitive Stock Performance
  const stockComparison = [
    { company: 'Your Company (IPOReady)', price: '$47.32', change: '+18.2%', multiple: '9.5x ARR', status: 'outperforming' },
    { company: 'Figma (Design SaaS)', price: '$198.50', change: '+15.3%', multiple: '12.2x ARR', status: 'similar' },
    { company: 'Stripe (Payments)', price: '$385.00', change: '+22.5%', multiple: '8.8x ARR', status: 'similar' },
    { company: 'Industry Average', price: 'N/A', change: '+12.0%', multiple: '9.2x ARR', status: 'baseline' },
  ]

  // Institutional & Insider Ownership
  const ownershipData = [
    { category: 'Institutional Investors', percentage: 68, change: '+5%', insight: 'Strong institutional support' },
    { category: 'Insider Holdings', percentage: 12, change: '-2%', insight: 'Normal post-IPO lockup expiration' },
    { category: 'Public Float', percentage: 20, change: '+7%', insight: 'Healthy free-float for trading' },
  ]

  // Earnings Drivers & Catalysts
  const catalysts = [
    {
      date: 'Jun 15, 2026',
      event: 'Q2 Earnings Call',
      potential: 'high',
      catalyst: 'Guidance update, growth acceleration signals',
    },
    {
      date: 'Jul 20, 2026',
      event: 'Analyst Conference',
      potential: 'medium',
      catalyst: 'Raise analyst price targets',
    },
    {
      date: 'Aug 5, 2026',
      event: 'Product Launch',
      potential: 'high',
      catalyst: 'New market expansion story',
    },
    {
      date: 'Sep 1, 2026',
      event: 'Strategic Partnership',
      potential: 'medium',
      catalyst: 'Market validation, TAM expansion',
    },
  ]

  // Post-Listing Execution Tracker
  const executionMetrics = [
    { metric: 'Quarters Since IPO', value: 2, status: 'green', insight: 'Still in growth narrative window' },
    { metric: 'Earnings Beats', value: '2/2', status: 'green', insight: 'Beat expectations every quarter' },
    { metric: 'Guidance Accuracy', value: '98%', status: 'green', insight: 'Investor confidence high' },
    { metric: 'Employee Stock Price', value: '+18%', status: 'green', insight: 'Strong retention catalyst' },
  ]

  // Key Investor Messages
  const investorMessages = [
    {
      title: 'Growth Acceleration Story',
      message: '32% YoY growth maintains SaaS premium multiple (9.5x vs. 7-8x for slower peers)',
      priority: 'critical',
    },
    {
      title: 'Path to Profitability',
      message: 'Operating margin expanding (18% now, target 25% by 2027)',
      priority: 'critical',
    },
    {
      title: 'Market Expansion',
      message: '3 new verticals entering this quarter — TAM expansion narrative',
      priority: 'high',
    },
    {
      title: 'Capital Allocation',
      message: 'Strong FCF allows 25-30% dividend yield + M&A optionality',
      priority: 'high',
    },
  ]

  return (
    <>
      <PremiumPageLayout
        title="Post-IPO Market Intelligence"
        subtitle="Real-time public market performance, SEC filings, investor sentiment, and execution tracking"
        icon={<TrendingUp className="w-8 h-8 text-green-600" />}
      >
        <div className="space-y-8">

          {/* STOCK PERFORMANCE DASHBOARD */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedSection(expandedSection === 'stock-performance' ? null : 'stock-performance')}>
              <h2 className="text-text-muted text-xs uppercase tracking-wider font-semibold mb-0">📈 Stock Performance (Real-Time)</h2>
              {expandedSection === 'stock-performance' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
            <AnimatePresence>
              {expandedSection === 'stock-performance' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3">
                  {stockMetrics.map((metric, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="rounded-lg border border-gray-200 bg-white p-4">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-semibold text-nav text-sm">{metric.label}</p>
                        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                          metric.status === 'green' ? 'bg-green-100 text-green-700' :
                          metric.status === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {metric.change.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {metric.change}
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-nav mb-2">{metric.value}</p>
                      <p className="text-xs text-text-muted">{metric.insight}</p>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* COMPETITIVE STOCK ANALYSIS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedSection(expandedSection === 'stock-comparison' ? null : 'stock-comparison')}>
              <h2 className="text-text-muted text-xs uppercase tracking-wider font-semibold mb-0">📊 Stock Performance vs. Comps</h2>
              {expandedSection === 'stock-comparison' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
            <AnimatePresence>
              {expandedSection === 'stock-comparison' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3">
                  {stockComparison.map((comp, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className={`rounded-lg border-2 p-4 ${
                      comp.status === 'outperforming' ? 'border-green-200 bg-green-50' :
                      comp.status === 'similar' ? 'border-blue-200 bg-blue-50' :
                      'border-gray-200 bg-white'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-nav">{comp.company}</p>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          comp.change.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>{comp.change}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-text-muted">Price</p>
                          <p className="font-bold text-nav">{comp.price}</p>
                        </div>
                        <div>
                          <p className="text-xs text-text-muted">Multiple</p>
                          <p className="font-bold text-nav">{comp.multiple}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* SEC FILINGS & COMPLIANCE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedSection(expandedSection === 'filings' ? null : 'filings')}>
              <h2 className="text-text-muted text-xs uppercase tracking-wider font-semibold mb-0">📄 SEC Filings & Compliance</h2>
              {expandedSection === 'filings' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
            <AnimatePresence>
              {expandedSection === 'filings' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3">
                  {recentFilings.map((filing, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="rounded-lg border border-gray-200 bg-white p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <p className="font-bold text-nav">{filing.form}</p>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          filing.status === 'filed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>{filing.status === 'filed' ? '✓ Filed' : '⏳ Pending'}</span>
                      </div>
                      <p className="text-xs text-text-muted mb-3">
                        <span className="font-semibold">Filed:</span> {filing.filed}
                        {filing.dueDate !== 'N/A' && <span className="ml-4"><span className="font-semibold">Next:</span> {filing.dueDate}</span>}
                      </p>
                      <div className="space-y-1">
                        {filing.highlights.map((highlight, j) => (
                          <p key={j} className="text-xs text-text-muted">✓ {highlight}</p>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* OWNERSHIP STRUCTURE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedSection(expandedSection === 'ownership' ? null : 'ownership')}>
              <h2 className="text-text-muted text-xs uppercase tracking-wider font-semibold mb-0">👥 Institutional & Insider Ownership</h2>
              {expandedSection === 'ownership' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
            <AnimatePresence>
              {expandedSection === 'ownership' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3">
                  {ownershipData.map((data, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="rounded-lg border border-gray-200 bg-white p-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-semibold text-nav text-sm">{data.category}</p>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-nav">{data.percentage}%</p>
                          <p className={`text-xs font-bold ${data.change.startsWith('+') ? 'text-green-700' : 'text-red-700'}`}>{data.change}</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${data.percentage}%` }} />
                      </div>
                      <p className="text-xs text-text-muted">{data.insight}</p>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* UPCOMING CATALYSTS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedSection(expandedSection === 'catalysts' ? null : 'catalysts')}>
              <h2 className="text-text-muted text-xs uppercase tracking-wider font-semibold mb-0">⚡ Upcoming Catalysts (Next 90 Days)</h2>
              {expandedSection === 'catalysts' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
            <AnimatePresence>
              {expandedSection === 'catalysts' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3">
                  {catalysts.map((catalyst, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className={`rounded-lg border-2 p-4 ${
                      catalyst.potential === 'high' ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-nav text-sm">{catalyst.event}</p>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          catalyst.potential === 'high' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>{catalyst.potential.toUpperCase()} IMPACT</span>
                      </div>
                      <p className="text-xs text-text-muted mb-2">{catalyst.date}</p>
                      <p className="text-xs text-text-muted">📌 {catalyst.catalyst}</p>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* POST-LISTING EXECUTION METRICS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            <h2 className="text-text-muted text-xs uppercase tracking-wider font-semibold mb-4">✅ Post-Listing Execution Tracker</h2>
            <div className="grid grid-cols-2 gap-3">
              {executionMetrics.map((exec, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="rounded-lg border-2 border-green-200 bg-green-50 p-4">
                  <p className="text-xs text-text-muted mb-2">{exec.metric}</p>
                  <p className="text-2xl font-bold text-nav mb-2">{exec.value}</p>
                  <p className="text-xs text-green-700">{exec.insight}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* KEY INVESTOR MESSAGES */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            <h2 className="text-text-muted text-xs uppercase tracking-wider font-semibold mb-4">💬 Key Investor Messages</h2>
            <div className="space-y-3">
              {investorMessages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className={`rounded-lg border-l-4 p-4 ${
                  msg.priority === 'critical' ? 'border-red-600 bg-red-50' : 'border-yellow-600 bg-yellow-50'
                }`}>
                  <div className="flex items-start gap-3">
                    <AlertCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${msg.priority === 'critical' ? 'text-red-600' : 'text-yellow-600'}`} />
                    <div>
                      <p className="font-semibold text-nav text-sm mb-1">{msg.title}</p>
                      <p className="text-sm text-text-muted">{msg.message}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* RECOMMENDATION */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="rounded-lg border-2 border-green-200 bg-gradient-to-br from-green-50 to-white p-6"
          >
            <h3 className="text-text-muted text-xs uppercase tracking-wider font-semibold mb-4">🎯 IPOReady Post-IPO Strategy</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-nav text-sm mb-1">Maintain Growth Narrative</p>
                  <p className="text-sm text-text-muted">Your 32% YoY growth justifies 9.5x multiple. Sustain this for 3+ years to hold premium valuation.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-nav text-sm mb-1">Capitalize on Analyst Upgrades</p>
                  <p className="text-sm text-text-muted">18 buy ratings create momentum. Quarterly beats will trigger price target increases ($55-$60 likely by Q4).</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-nav text-sm mb-1">Execute Catalysts Strategically</p>
                  <p className="text-sm text-text-muted">3 high-impact catalysts in next 90 days. Time announcements for maximum market impact (avoid earnings blackout).</p>
                </div>
              </div>
            </div>
          </motion.div>

          <button onClick={() => setShowUpgrade(true)} className="block mx-auto px-6 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-all">
            Access Full Investor Relations Suite
          </button>
        </div>
      </PremiumPageLayout>
      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} featureKey="post_ipo_intelligence" featureName="Post-IPO Market Intelligence" />
    </>
  )
}
