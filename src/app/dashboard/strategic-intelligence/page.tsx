'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, Zap, Target, Globe, Users, BarChart3, Lightbulb, ExternalLink, Loader } from 'lucide-react'
import { useAppStore } from '@/store/app-store'

interface StrategicInsight {
  title: string
  insight: string
  impact: 'high' | 'medium' | 'low'
  recommendation: string
  source: string
  timeframe: string
}

interface CompetitorBench {
  company: string
  metric: string
  value: string
  comparison: string
  advantage: string
}

interface StrategicOption {
  title: string
  description: string
  pros: string[]
  cons: string[]
  timeframe: string
  complexity: 'simple' | 'moderate' | 'complex'
  potentialValue: string
  riskLevel: 'low' | 'medium' | 'high'
}

export default function StrategicIntelligencePage() {
  const { company } = useAppStore()
  const [isLoading, setIsLoading] = useState(true)
  const [insights, setInsights] = useState<StrategicInsight[]>([])
  const [competitors, setCompetitors] = useState<CompetitorBench[]>([])
  const [options, setOptions] = useState<StrategicOption[]>([])
  const [selectedTab, setSelectedTab] = useState<'insights' | 'competitors' | 'options'>('insights')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    const loadIntelligence = async () => {
      setIsLoading(true)
      try {
        const res = await fetch('/api/intelligence/strategic', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ company: company?.name }),
        })
        const data = await res.json()
        setInsights(data.insights || [])
        setCompetitors(data.competitors || [])
        setOptions(data.options || [])
        setLastUpdated(new Date())
      } catch (error) {
        console.error('Failed to load strategic intelligence:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadIntelligence()
  }, [company?.name])

  const impactColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-red-50 border-red-200'
      case 'medium':
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  const complexityBadge = (level: string) => {
    switch (level) {
      case 'simple':
        return 'bg-green-100 text-green-800'
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-red-100 text-red-800'
    }
  }

  return (
    <div className="min-h-screen" style={{ background: '#F7F6F4' }}>
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#1A1A1A15' }}>
              <Globe className="w-5 h-5 text-nav" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-nav">Strategic Intelligence</h1>
              <p className="text-text-muted text-sm">Market context, competitor insights, strategic options</p>
            </div>
          </div>
          {lastUpdated && (
            <p className="text-xs text-text-muted mt-2">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
              <p className="text-nav font-semibold">Analyzing market data, competitors, and opportunities...</p>
              <p className="text-text-muted text-sm mt-2">This may take 30-60 seconds</p>
            </div>
          </div>
        ) : (
          <>
            {/* Tab Navigation */}
            <div className="flex gap-4 mb-8 border-b border-gray-200">
              {['insights', 'competitors', 'options'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab as typeof selectedTab)}
                  className={`px-4 py-3 font-semibold text-sm transition-all ${
                    selectedTab === tab
                      ? 'text-nav border-b-2 border-blue-600'
                      : 'text-text-muted hover:text-nav'
                  }`}
                >
                  {tab === 'insights' && '📊 Market Insights'}
                  {tab === 'competitors' && '🏢 Competitor Analysis'}
                  {tab === 'options' && '💡 Strategic Options'}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {/* Market Insights Tab */}
              {selectedTab === 'insights' && (
                <motion.div
                  key="insights"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid grid-cols-1 gap-6"
                >
                  {insights.length === 0 ? (
                    <div className="card p-8 text-center">
                      <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-nav font-semibold">Market data loading...</p>
                    </div>
                  ) : (
                    insights.map((insight, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`card p-6 border-2 ${impactColor(insight.impact)}`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <h3 className="font-bold text-nav mb-2">{insight.title}</h3>
                            <p className="text-sm text-text-muted mb-3">{insight.insight}</p>
                            <div className="space-y-2 mb-4">
                              <p className="text-sm">
                                <span className="font-semibold text-nav">What this means:</span>
                                <span className="text-text-muted ml-2">{insight.recommendation}</span>
                              </p>
                              <p className="text-xs text-text-muted">
                                <span className="font-semibold">Timeframe:</span> {insight.timeframe}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-blue-600">
                              <span>Source: {insight.source}</span>
                              <ExternalLink className="w-3 h-3" />
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                            insight.impact === 'high' ? 'bg-red-100 text-red-700' :
                            insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {insight.impact.toUpperCase()} IMPACT
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              )}

              {/* Competitor Analysis Tab */}
              {selectedTab === 'competitors' && (
                <motion.div
                  key="competitors"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {competitors.length === 0 ? (
                    <div className="card p-8 text-center">
                      <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-nav font-semibold">Analyzing competitor data...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {competitors.map((comp, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="card p-6 border-l-4 border-blue-600"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold text-nav">{comp.company}</h3>
                            <span className="text-lg font-bold text-blue-600">{comp.value}</span>
                          </div>
                          <p className="text-sm text-text-muted mb-2">{comp.metric}</p>
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <p className="text-xs text-text-muted">{comp.comparison}</p>
                            </div>
                            <div className="bg-green-50 px-3 py-2 rounded-lg">
                              <p className="text-xs font-semibold text-green-700">{comp.advantage}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Strategic Options Tab */}
              {selectedTab === 'options' && (
                <motion.div
                  key="options"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid grid-cols-1 gap-6"
                >
                  {options.length === 0 ? (
                    <div className="card p-8 text-center">
                      <Lightbulb className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-nav font-semibold">Generating strategic recommendations...</p>
                    </div>
                  ) : (
                    options.map((option, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="card p-6 space-y-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-bold text-nav text-lg mb-2">{option.title}</h3>
                            <p className="text-sm text-text-muted mb-4">{option.description}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${complexityBadge(option.complexity)}`}>
                            {option.complexity.toUpperCase()}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-bold text-green-700 mb-2">PROS</p>
                            <ul className="space-y-1">
                              {option.pros.map((pro, i) => (
                                <li key={i} className="text-xs text-text-muted">✓ {pro}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-red-700 mb-2">CONS</p>
                            <ul className="space-y-1">
                              {option.cons.map((con, i) => (
                                <li key={i} className="text-xs text-text-muted">✗ {con}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <div>
                            <p className="text-xs text-text-muted">
                              <span className="font-semibold">Potential Value:</span> {option.potentialValue}
                            </p>
                            <p className="text-xs text-text-muted">
                              <span className="font-semibold">Timeframe:</span> {option.timeframe}
                            </p>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            option.riskLevel === 'low' ? 'bg-green-100 text-green-700' :
                            option.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {option.riskLevel.toUpperCase()} RISK
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  )
}
