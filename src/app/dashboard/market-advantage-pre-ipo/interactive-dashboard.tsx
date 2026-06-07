'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp, AlertCircle, CheckCircle2, Lock, Unlock,
  ChevronDown, ChevronUp, ArrowUpRight, ArrowDownRight,
  Sliders, RefreshCw, Download, Share2
} from 'lucide-react'
import type {
  IntelligenceSnapshot,
  CompanyMetrics,
  MarketData
} from '@/lib/market-data/market-advantage-engine'

interface InteractiveDashboardProps {
  initialSnapshot: IntelligenceSnapshot
  companyMetrics: CompanyMetrics
  marketData: MarketData
}

export default function InteractiveDashboard({
  initialSnapshot,
  companyMetrics: initialCompanyMetrics,
  marketData: initialMarketData
}: InteractiveDashboardProps) {
  const [snapshot, setSnapshot] = useState<IntelligenceSnapshot>(initialSnapshot)
  const [companyMetrics, setCompanyMetrics] = useState<CompanyMetrics>(initialCompanyMetrics)
  const [marketData, setMarketData] = useState<MarketData>(initialMarketData)
  const [expandedSection, setExpandedSection] = useState<string | null>('readiness')
  const [showWhatIf, setShowWhatIf] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [scenarioMode, setScenarioMode] = useState<'view' | 'edit'>('view')

  // What-if scenario adjustments
  const [adjustments, setAdjustments] = useState({
    growthRate: 0, // percentage point change
    margins: 0,
    teamSize: 0,
    fedRate: 0,
    sentiment: 0 // -3 to +3
  })

  const handleGrowthChange = (delta: number) => {
    setAdjustments(prev => ({
      ...prev,
      growthRate: Math.max(-50, Math.min(100, prev.growthRate + delta))
    }))
  }

  const handleMarginsChange = (delta: number) => {
    setAdjustments(prev => ({
      ...prev,
      margins: Math.max(-20, Math.min(20, prev.margins + delta))
    }))
  }

  const handleFedRateChange = (delta: number) => {
    setAdjustments(prev => ({
      ...prev,
      fedRate: Math.max(-2, Math.min(2, prev.fedRate + delta))
    }))
  }

  const handleSentimentChange = (delta: number) => {
    setAdjustments(prev => ({
      ...prev,
      sentiment: Math.max(-3, Math.min(3, prev.sentiment + delta))
    }))
  }

  const getAdjustedMetrics = () => {
    const adjustedCompany: CompanyMetrics = {
      ...companyMetrics,
      revenueGrowthYoY: Math.max(0, companyMetrics.revenueGrowthYoY + adjustments.growthRate),
      operatingMargin: companyMetrics.operatingMargin + adjustments.margins,
      teamHeadcount: Math.max(10, companyMetrics.teamHeadcount + adjustments.teamSize)
    }

    const sentimentLevels = ['very-bearish', 'bearish', 'neutral', 'bullish', 'very-bullish'] as const
    const currentIdx = sentimentLevels.indexOf(marketData.investorSentiment)
    const adjustedSentimentIdx = Math.max(0, Math.min(4, currentIdx + adjustments.sentiment))

    const adjustedMarket: MarketData = {
      ...marketData,
      fedRate: Math.max(0, marketData.fedRate + adjustments.fedRate),
      investorSentiment: sentimentLevels[adjustedSentimentIdx]
    }

    return { company: adjustedCompany, market: adjustedMarket }
  }

  const refreshData = async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch('/api/dashboard/market-advantage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyMetrics)
      })
      const newSnapshot = await response.json()
      setSnapshot(newSnapshot)
    } catch (error) {
      console.error('Error refreshing data:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const exportReport = () => {
    const hasAdjustments =
      adjustments.growthRate !== 0 ||
      adjustments.margins !== 0 ||
      adjustments.teamSize !== 0 ||
      adjustments.fedRate !== 0 ||
      adjustments.sentiment !== 0

    const report = {
      timestamp: new Date().toISOString(),
      company: companyMetrics,
      marketData,
      intelligence: snapshot,
      adjustments: hasAdjustments
        ? { adjustments, adjusted: getAdjustedMetrics() }
        : null
    }

    const dataStr = JSON.stringify(report, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `market-advantage-${Date.now()}.json`
    link.click()
  }

  return (
    <div className="space-y-8">
      {/* CONTROLS */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={refreshData}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>

          <button
            onClick={() => setShowWhatIf(!showWhatIf)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition"
          >
            <Sliders className="w-4 h-4" />
            What-If Scenarios
          </button>

          <button
            onClick={exportReport}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>

        <div className="text-sm text-gray-500">
          Last updated: {new Date(snapshot.timestamp).toLocaleTimeString()}
        </div>
      </div>

      {/* WHAT-IF SCENARIOS */}
      <AnimatePresence>
        {showWhatIf && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl border-2 border-purple-200 bg-purple-50 p-6 space-y-6"
          >
            <h3 className="font-semibold text-lg text-purple-900">Interactive What-If Scenarios</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Growth Rate Adjustment */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Growth Rate YoY: {(initialCompanyMetrics.revenueGrowthYoY + adjustments.growthRate).toFixed(1)}%
                  <span className={adjustments.growthRate > 0 ? 'text-green-600' : adjustments.growthRate < 0 ? 'text-red-600' : ''}>
                    {adjustments.growthRate > 0 ? ` +${adjustments.growthRate}%` : adjustments.growthRate < 0 ? ` ${adjustments.growthRate}%` : ''}
                  </span>
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleGrowthChange(-5)}
                    className="px-3 py-2 bg-white border rounded hover:bg-gray-50"
                  >
                    -5%
                  </button>
                  <input
                    type="range"
                    min="-50"
                    max="100"
                    value={adjustments.growthRate}
                    onChange={(e) => setAdjustments(prev => ({ ...prev, growthRate: parseFloat(e.target.value) }))}
                    className="flex-1"
                  />
                  <button
                    onClick={() => handleGrowthChange(5)}
                    className="px-3 py-2 bg-white border rounded hover:bg-gray-50"
                  >
                    +5%
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Impact: {((initialCompanyMetrics.revenueGrowthYoY + adjustments.growthRate) / 50) > 0.5 ? '🟢 Strong' : '🟡 Moderate'}
                </p>
              </div>

              {/* Operating Margin Adjustment */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Operating Margin: {(initialCompanyMetrics.operatingMargin + adjustments.margins).toFixed(1)}%
                  <span className={adjustments.margins > 0 ? 'text-green-600' : adjustments.margins < 0 ? 'text-red-600' : ''}>
                    {adjustments.margins > 0 ? ` +${adjustments.margins}%` : adjustments.margins < 0 ? ` ${adjustments.margins}%` : ''}
                  </span>
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleMarginsChange(-2)}
                    className="px-3 py-2 bg-white border rounded hover:bg-gray-50"
                  >
                    -2%
                  </button>
                  <input
                    type="range"
                    min="-20"
                    max="20"
                    value={adjustments.margins}
                    onChange={(e) => setAdjustments(prev => ({ ...prev, margins: parseFloat(e.target.value) }))}
                    className="flex-1"
                  />
                  <button
                    onClick={() => handleMarginsChange(2)}
                    className="px-3 py-2 bg-white border rounded hover:bg-gray-50"
                  >
                    +2%
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Impact: {(initialCompanyMetrics.operatingMargin + adjustments.margins) > -5 ? '🟢 Strong' : '🟡 Moderate'}
                </p>
              </div>

              {/* Fed Rate Adjustment */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fed Rate: {(marketData.fedRate + adjustments.fedRate).toFixed(2)}%
                  <span className={adjustments.fedRate > 0 ? 'text-red-600' : adjustments.fedRate < 0 ? 'text-green-600' : ''}>
                    {adjustments.fedRate > 0 ? ` +${adjustments.fedRate}%` : adjustments.fedRate < 0 ? ` ${adjustments.fedRate}%` : ''}
                  </span>
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleFedRateChange(-0.5)}
                    className="px-3 py-2 bg-white border rounded hover:bg-gray-50"
                  >
                    -0.5%
                  </button>
                  <input
                    type="range"
                    min="-2"
                    max="2"
                    step="0.1"
                    value={adjustments.fedRate}
                    onChange={(e) => setAdjustments(prev => ({ ...prev, fedRate: parseFloat(e.target.value) }))}
                    className="flex-1"
                  />
                  <button
                    onClick={() => handleFedRateChange(0.5)}
                    className="px-3 py-2 bg-white border rounded hover:bg-gray-50"
                  >
                    +0.5%
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Impact: {(marketData.fedRate + adjustments.fedRate) < 3.5 ? '🟢 Favorable' : '🔴 Headwind'}
                </p>
              </div>

              {/* Sentiment Adjustment */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Market Sentiment Shift
                  <span className={adjustments.sentiment > 0 ? 'text-green-600' : adjustments.sentiment < 0 ? 'text-red-600' : ''}>
                    {adjustments.sentiment > 0 ? ` +${adjustments.sentiment} tiers` : adjustments.sentiment < 0 ? ` ${adjustments.sentiment} tiers` : ' (neutral)'}
                  </span>
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSentimentChange(-1)}
                    className="px-3 py-2 bg-white border rounded hover:bg-gray-50"
                  >
                    -1
                  </button>
                  <input
                    type="range"
                    min="-3"
                    max="3"
                    value={adjustments.sentiment}
                    onChange={(e) => setAdjustments(prev => ({ ...prev, sentiment: parseFloat(e.target.value) }))}
                    className="flex-1"
                  />
                  <button
                    onClick={() => handleSentimentChange(1)}
                    className="px-3 py-2 bg-white border rounded hover:bg-gray-50"
                  >
                    +1
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Scenarios: {adjustments.sentiment > 0 ? '📈 Bullish case' : adjustments.sentiment < 0 ? '📉 Bearish case' : '🔄 Base case'}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-purple-200">
              <button
                onClick={() => setAdjustments({ growthRate: 0, margins: 0, teamSize: 0, fedRate: 0, sentiment: 0 })}
                className="text-sm text-purple-700 hover:text-purple-900 font-medium"
              >
                Reset to Base Case
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* IPO READINESS SCORE */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-gray-200 bg-white p-6"
      >
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpandedSection(expandedSection === 'readiness' ? null : 'readiness')}
        >
          <div>
            <h2 className="text-lg font-bold text-gray-900">IPO Readiness Score</h2>
            <p className="text-sm text-gray-500">Comprehensive assessment across 6 key dimensions</p>
          </div>
          {expandedSection === 'readiness' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>

        <AnimatePresence>
          {expandedSection === 'readiness' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-6 space-y-4">
              {/* Score Gauge */}
              <div className="space-y-2">
                <div className="flex items-end justify-between">
                  <span className="text-4xl font-bold text-gray-900">{snapshot.readinessScore.score}/100</span>
                  <span className="text-sm text-gray-500">
                    {snapshot.readinessScore.score >= 80 ? '🟢 Ready to IPO' :
                     snapshot.readinessScore.score >= 70 ? '🟡 Near-ready' :
                     snapshot.readinessScore.score >= 60 ? '🟡 Build for 6-12 months' : '🔴 Build for 18-24 months'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${snapshot.readinessScore.score}%` }}
                    className={`h-full ${
                      snapshot.readinessScore.score >= 80 ? 'bg-green-500' :
                      snapshot.readinessScore.score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                  />
                </div>
              </div>

              {/* Breakdown by Dimension */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-4">
                {Object.entries(snapshot.readinessScore.breakdown).map(([key, value]) => (
                  <div key={key} className="rounded-lg bg-gray-50 p-3">
                    <div className="text-xs font-semibold text-gray-600 uppercase">{key}</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">{Math.round(value)}</div>
                  </div>
                ))}
              </div>

              {/* Gaps to Address */}
              {snapshot.readinessScore.gaps.length > 0 && (
                <div className="mt-4 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                  <h4 className="font-semibold text-yellow-900 mb-2">Key Gaps to Address</h4>
                  <ul className="space-y-1">
                    {snapshot.readinessScore.gaps.map((gap, i) => (
                      <li key={i} className="text-sm text-yellow-800 flex gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        {gap}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* MARKET WINDOW TIMING */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-gray-200 bg-white p-6"
      >
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpandedSection(expandedSection === 'timing' ? null : 'timing')}
        >
          <h2 className="text-lg font-bold text-gray-900">Market Window Analysis</h2>
          {expandedSection === 'timing' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>

        <AnimatePresence>
          {expandedSection === 'timing' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: '60-Day Timeline', key: '_60days' as const },
                  { label: '90-Day Timeline', key: '_90days' as const },
                  { label: '180-Day Timeline', key: '_180days' as const }
                ].map(({ label, key }) => {
                  const timing = snapshot.marketWindow[key]
                  return (
                    <div key={key} className="rounded-lg border border-gray-200 p-4">
                      <h3 className="font-semibold text-gray-900">{label}</h3>
                      <div className="mt-3 space-y-2">
                        <div>
                          <span className="text-sm text-gray-600">Success Probability</span>
                          <div className="text-2xl font-bold text-gray-900">{Math.round(timing.successProbability)}%</div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Expected Valuation</span>
                          <div className="text-lg font-bold text-gray-900">${(timing.expectedValuation / 1000).toFixed(1)}B</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* STRATEGIC OPTIONS RECOMMENDATION */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border-2 border-green-200 bg-green-50 p-6"
      >
        <h2 className="text-lg font-bold text-green-900 mb-3">Strategic Recommendation</h2>
        <p className="text-green-800 font-semibold text-lg">{snapshot.strategicOptions.recommendation}</p>
      </motion.div>

      {/* Export hint */}
      <div className="text-sm text-gray-500">
        💡 Use "Export Report" to download detailed analysis including what-if scenarios and supporting data.
      </div>
    </div>
  )
}
