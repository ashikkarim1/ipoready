'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap,
  TrendingUp,
  Users,
  Award,
  BarChart3,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { SimulationResults as SimulationResultsType } from '@/types/ipo-simulator'

interface SimulationResultsProps {
  results: SimulationResultsType
}

export default function SimulationResults({ results }: SimulationResultsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'trajectory' | 'peers'>(
    'overview'
  )

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Zap },
    { id: 'details', label: 'Analysis', icon: BarChart3 },
    { id: 'trajectory', label: 'Stock Price', icon: TrendingUp },
    { id: 'peers', label: 'Peer Ranking', icon: Users },
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-slate-200">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'border-b-2 border-accent text-accent'
                  : 'text-text-muted hover:text-nav'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              {/* Liquidity */}
              <div className="rounded-lg border border-slate-200 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <h3 className="text-sm font-semibold text-nav">Liquidity</h3>
                  <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                    {results.liquidity.percentile}th %ile
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Bid-Ask Spread</span>
                    <span className="font-semibold text-nav">{results.liquidity.bidAskSpread}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Daily Volume</span>
                    <span className="font-semibold text-nav">
                      {Math.round(results.liquidity.dailyVolume / 1_000_000)}M shares
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Turnover</span>
                    <span className="font-semibold text-nav">{results.liquidity.turnoverRatio}%</span>
                  </div>
                </div>
              </div>

              {/* Analyst Coverage */}
              <div className="rounded-lg border border-slate-200 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <h3 className="text-sm font-semibold text-nav">Analyst Coverage</h3>
                  <span className="ml-auto rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                    {results.analystCoverage.percentile}th %ile
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Predicted Count</span>
                    <span className="font-semibold text-nav">{results.analystCoverage.predictedCount}</span>
                  </div>
                  <div className="flex gap-1">
                    <div className="flex-1 rounded text-center text-xs font-semibold py-1 bg-green-100 text-green-700">
                      {results.analystCoverage.buyRatings} Buy
                    </div>
                    <div className="flex-1 rounded text-center text-xs font-semibold py-1 bg-gray-100 text-gray-700">
                      {results.analystCoverage.holdRatings} Hold
                    </div>
                    <div className="flex-1 rounded text-center text-xs font-semibold py-1 bg-red-100 text-red-700">
                      {results.analystCoverage.sellRatings} Sell
                    </div>
                  </div>
                </div>
              </div>

              {/* Institutional Demand */}
              <div className="rounded-lg border border-slate-200 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-500" />
                  <h3 className="text-sm font-semibold text-nav">Institutional Demand</h3>
                  <span className="ml-auto rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                    {results.institutionalDemand.demandLevel.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Float Allocation</span>
                    <span className="font-semibold text-nav">{results.institutionalDemand.floatAllocation}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Oversubscription</span>
                    <span className="font-semibold text-nav">{results.institutionalDemand.oversubscriptionRatio}x</span>
                  </div>
                </div>
              </div>

              {/* Governance */}
              <div className="rounded-lg border border-slate-200 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Award className="h-4 w-4 text-indigo-500" />
                  <h3 className="text-sm font-semibold text-nav">Governance Score</h3>
                  <span className="ml-auto rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                    {results.governanceScore.score}/100
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Board Independence</span>
                    <span className="font-semibold text-nav">{results.governanceScore.boardIndependence}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-indigo-500"
                      style={{ width: `${results.governanceScore.score}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'trajectory' && (
          <motion.div
            key="trajectory"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="rounded-lg border border-slate-200 p-6">
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-nav mb-2">IPO Price: ${results.stockTrajectory.ipoPrice}</h3>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {['conservative', 'baseCase', 'bullCase'].map((scenario) => {
                  const label = scenario === 'baseCase' ? 'Base Case' : scenario.charAt(0).toUpperCase() + scenario.slice(1)
                  const proj = results.stockTrajectory.scenarios[scenario as keyof typeof results.stockTrajectory.scenarios]

                  return (
                    <div key={scenario} className="rounded-lg bg-slate-50 p-4">
                      <h4 className="text-sm font-semibold text-nav mb-3">{label}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-text-muted">Day 1</span>
                          <span className="font-semibold text-nav">${proj.day1} ({proj.day1Pop:+.1f}%)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-muted">Day 30</span>
                          <span className="font-semibold text-nav">${proj.day30} ({proj.day30Change:+.1f}%)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-muted">Day 365</span>
                          <span className="font-semibold text-nav">${proj.day365} ({proj.day365Change:+.1f}%)</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
