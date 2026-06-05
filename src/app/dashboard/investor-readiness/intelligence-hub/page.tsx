'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain, TrendingUp, AlertCircle, Zap, Target, Clock, BarChart3,
  Newspaper, Users, MapPin, Lightbulb, ArrowRight, CheckCircle2,
  ChevronDown, ChevronUp, Flame, Eye, Download, Share2, Mail,
  Bell, Settings, ArrowUpRight, ArrowDownRight
} from 'lucide-react'

interface NewsAlert {
  id: string
  headline: string
  source: string
  timestamp: string
  relevance: 'critical' | 'high' | 'medium' | 'low'
  aiSummary: string
  predictiveAnalytics: {
    impact: string
    probability: number // 0-100
    actionRecommendation: string
    urgency: 'immediate' | 'this-week' | 'this-month'
  }
  relatedDocuments: string[]
  competitor?: string // if about competitor
  market?: string // if about market
}

interface KPI {
  label: string
  value: string
  change: number // percentage
  trend: 'up' | 'down' | 'stable'
  benchmark?: string
  prediction?: string // AI prediction
  recommendation?: string // next action
}

interface IntelligenceInsight {
  id: string
  type: 'opportunity' | 'risk' | 'milestone' | 'action'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  daysToAction?: number
  confidence: number // 0-100
  relatedMetrics: string[]
  suggestedDocuments: string[]
}

// MOCK DATA - Replace with real scrapers
const newsAlerts: NewsAlert[] = [
  {
    id: 'news-1',
    headline: 'SEC Delays IPO Reviews by Average 45 Days',
    source: 'SEC Compliance Blog',
    timestamp: '2026-06-05T08:30:00Z',
    relevance: 'high',
    aiSummary: 'SEC announced longer review cycles for S-1 filings due to staffing changes. Average review time increased from 30 to 45 days. Likely to extend timeline for all Q2/Q3 IPO filers.',
    predictiveAnalytics: {
      impact: 'Your IPO timeline extends ~2 weeks beyond original plan. Update investor expectations.',
      probability: 87,
      actionRecommendation: 'Update financial projections to account for 45-day SEC review. Revise roadshow timing. Notify investors immediately.',
      urgency: 'immediate'
    },
    relatedDocuments: ['fin-model', 'prospectus'],
    market: 'SEC Regulation'
  },
  {
    id: 'news-2',
    headline: 'Competitor Series C Oversubscribed 3x, Raises at 2x Previous Valuation',
    source: 'TechCrunch',
    timestamp: '2026-06-04T14:15:00Z',
    relevance: 'critical',
    aiSummary: 'Your primary competitor (TechFlow) raised $50M Series C at $500M valuation (2x Series B). Indicates strong investor appetite for your category but also raises bar for your IPO valuation.',
    predictiveAnalytics: {
      impact: 'Expect institutional investors to use this as comp. May pressure your IPO valuation down 15-20% unless you show differentiation.',
      probability: 92,
      actionRecommendation: 'Highlight your AI differentiation (exclusive IP on confidence scoring + document intelligence). Request direct comparisons: your growth (42%) vs TechFlow (28%), margins (76% vs 62%).',
      urgency: 'immediate'
    },
    relatedDocuments: ['market-competitive', 'market-research'],
    competitor: 'TechFlow'
  },
  {
    id: 'news-3',
    headline: 'Goldman Sachs Establishes IPO Accelerator Fund - Invests $100M in Pre-IPO SaaS',
    source: 'Goldman Sachs Press Release',
    timestamp: '2026-06-03T10:00:00Z',
    relevance: 'high',
    aiSummary: 'Goldman launching dedicated fund for pre-IPO SaaS companies. Focus on companies $10-50M ARR. Clear signal of institutional appetite for IPO-stage companies in your category.',
    predictiveAnalytics: {
      impact: 'Increases likelihood of successful IPO for well-positioned companies like you. May reduce need for traditional venture bridge rounds.',
      probability: 78,
      actionRecommendation: 'Reach out to Goldman IPO team with investor relations deck. You fit their profile: $12.4M revenue, strong growth, clear path to profitability.',
      urgency: 'this-week'
    },
    relatedDocuments: ['investor-contacts', 'pitch-deck'],
    market: 'IPO Market'
  }
]

const kpis: Record<string, KPI> = {
  pace_score: {
    label: 'PACE™ Readiness',
    value: '73/100',
    change: 8,
    trend: 'up',
    benchmark: 'Avg for Series A: 62',
    prediction: 'Projected to hit 85 in 30 days if current pace continues',
    recommendation: 'Focus: Cap table cleanup & governance docs (biggest gaps)'
  },
  revenue: {
    label: 'Monthly Revenue',
    value: '$1.04M',
    change: 12,
    trend: 'up',
    benchmark: 'Target for Q2: $1.2M',
    prediction: 'Will exceed Q2 target by $180K if current trajectory holds',
    recommendation: 'Accelerate new customer onboarding (top 3 will close in next 2 weeks)'
  },
  arr: {
    label: 'Annual Revenue Run Rate',
    value: '$12.4M',
    change: 42,
    trend: 'up',
    benchmark: 'Target for IPO: $15M',
    prediction: 'Will hit $15.2M by IPO (3 months) with current growth',
    recommendation: 'You\'re on track. Focus on margin expansion instead.'
  },
  gross_margin: {
    label: 'Gross Margin',
    value: '76%',
    change: 8,
    trend: 'up',
    benchmark: 'Industry avg: 68%',
    prediction: 'Can reach 80% by adding automation (cost reduction identified)',
    recommendation: 'Implement 3 automation projects identified in tech audit (estimated +4 point lift)'
  },
  runway: {
    label: 'Cash Runway',
    value: '8.4 months',
    change: 2,
    trend: 'down',
    benchmark: 'Healthy minimum: 12 months',
    prediction: 'Will fall to 6 months in Q3 if no action taken',
    recommendation: 'Must close IPO or raise bridge by September. Consider $5M bridge to add runway cushion.'
  },
  customer_churn: {
    label: 'Monthly Customer Churn',
    value: '2.1%',
    change: -0.3,
    trend: 'down',
    benchmark: 'SaaS ideal: <2%',
    prediction: 'At current rate, will hit <1.5% by Sept (excellent for IPO)',
    recommendation: 'Continue current retention programs. Highlight to investors (differentiated strength).'
  },
  cap_table_clarity: {
    label: 'Cap Table Clarity',
    value: '95%',
    change: 0,
    trend: 'stable',
    benchmark: 'Required for IPO: 95%+',
    prediction: 'No changes needed. Ready for IPO documentation.',
    recommendation: 'Cap table is IPO-ready. Focus on other gaps.'
  },
  governance_score: {
    label: 'Corporate Governance',
    value: '78%',
    change: 12,
    trend: 'up',
    benchmark: 'Required for IPO: 90%+',
    prediction: 'Will reach 88% in 45 days based on SEC doc prep timeline',
    recommendation: 'Still need: board charter updates, related-party policies, audit committee charter'
  }
}

const insights: IntelligenceInsight[] = [
  {
    id: 'insight-1',
    type: 'risk',
    title: 'Customer Concentration Risk Flagged by Goldman',
    description: 'Top 3 customers = 32% of revenue. Goldman will ask about this in due diligence. Needs mitigation story.',
    impact: 'high',
    daysToAction: 7,
    confidence: 94,
    relatedMetrics: ['revenue', 'churn'],
    suggestedDocuments: ['fin-statements', 'customer-references']
  },
  {
    id: 'insight-2',
    type: 'opportunity',
    title: 'Margin Expansion Opportunity: $2M Run-Rate Impact',
    description: 'Tech audit identified 3 automation opportunities (+4 gross margin points). Could add $2M ARR value at scale.',
    impact: 'high',
    daysToAction: 30,
    confidence: 88,
    relatedMetrics: ['gross_margin', 'arr'],
    suggestedDocuments: ['tech-architecture', 'product-roadmap']
  },
  {
    id: 'insight-3',
    type: 'milestone',
    title: 'You\'re 12 Days Ahead of IPO Readiness Schedule',
    description: 'Current pace indicates you\'ll hit 85+ PACE score 12 days before targeted IPO date. Provides buffer for unexpected issues.',
    impact: 'medium',
    daysToAction: 0,
    confidence: 87,
    relatedMetrics: ['pace_score'],
    suggestedDocuments: ['ipo-checklist']
  },
  {
    id: 'insight-4',
    type: 'action',
    title: 'SEC Review Delay Requires Prospectus Update',
    description: 'SEC now taking 45 days (was 30). Must update financial projections and investor timeline expectations. Action needed this week.',
    impact: 'high',
    daysToAction: 3,
    confidence: 87,
    relatedMetrics: ['pace_score', 'governance_score'],
    suggestedDocuments: ['fin-model', 'prospectus']
  }
]

export default function IntelligenceHubPage() {
  const [expandedNews, setExpandedNews] = useState<string | null>(null)
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null)
  const [newsFilter, setNewsFilter] = useState<'all' | 'critical' | 'high'>('all')

  const filteredNews = newsAlerts.filter(n => {
    if (newsFilter === 'all') return true
    if (newsFilter === 'critical') return n.relevance === 'critical'
    if (newsFilter === 'high') return n.relevance === 'critical' || n.relevance === 'high'
    return true
  })

  const getRelevanceColor = (relevance: string) => {
    switch (relevance) {
      case 'critical': return { bg: '#FEE2E2', border: '#FECACA', text: '#DC2626', icon: '🔴' }
      case 'high': return { bg: '#FEF3C7', border: '#FDE68A', text: '#B45309', icon: '🟡' }
      case 'medium': return { bg: '#EFF6FF', border: '#BFDBFE', text: '#1D4ED8', icon: '🔵' }
      default: return { bg: '#F0FDF4', border: '#BBF7D0', text: '#15803D', icon: '🟢' }
    }
  }

  return (
    <div className="w-full min-h-screen" style={{ background: '#F7F6F4' }}>
      <div className="max-w-7xl mx-auto p-6 md:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="serif text-4xl font-bold text-nav mb-2">IPO Intelligence Hub</h1>
              <p className="text-text-muted">Real-time market intelligence, AI-driven insights, and smart recommendations</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm"
              style={{ background: '#E8312A', color: 'white' }}
            >
              <Bell className="w-4 h-4" />
              Subscribe to Morning Brief
            </motion.button>
          </div>
        </motion.div>

        {/* KPI Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="h3 text-nav mb-4">📊 IPO Readiness Dashboard</h2>
          <div className="grid md:grid-cols-4 gap-3 mb-6">
            {Object.entries(kpis).map(([key, kpi]) => (
              <motion.div
                key={key}
                className="p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md"
                style={{
                  background: kpi.trend === 'up' ? '#F0FDF4' : kpi.trend === 'down' ? '#FEE2E2' : '#EFF6FF',
                  borderColor: kpi.trend === 'up' ? '#BBF7D0' : kpi.trend === 'down' ? '#FECACA' : '#BFDBFE'
                }}
              >
                <p className="label-sm text-text-muted mb-2 line-clamp-2">{kpi.label}</p>
                <p className="h3 text-nav font-black">{kpi.value}</p>
                <div className="flex items-center gap-1 mt-2">
                  {kpi.trend === 'up' && <ArrowUpRight className="w-4 h-4 text-green-600" />}
                  {kpi.trend === 'down' && <ArrowDownRight className="w-4 h-4 text-red-600" />}
                  <span className="text-xs font-bold" style={{ color: kpi.trend === 'up' ? '#15803D' : kpi.trend === 'down' ? '#DC2626' : '#1D4ED8' }}>
                    {kpi.change > 0 ? '+' : ''}{kpi.change}%
                  </span>
                </div>
                <p className="caption-sm text-text-muted mt-2 line-clamp-1">{kpi.benchmark}</p>
              </motion.div>
            ))}
          </div>

          {/* KPI Details (Hover/Expand) */}
          <div className="p-6 rounded-xl bg-white border border-gray-200">
            <h3 className="font-bold text-nav mb-4">🎯 KPI Insights & Recommendations</h3>
            <div className="space-y-3">
              {Object.entries(kpis).map(([key, kpi]) => (
                <div key={key} className="p-3 rounded-lg" style={{ background: '#F7F6F4' }}>
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-bold text-nav text-sm">{kpi.label}</p>
                    <span className="label-xs px-2 py-1 rounded-full" style={{ background: kpi.trend === 'up' ? '#F0FDF4' : '#FEE2E2', color: kpi.trend === 'up' ? '#15803D' : '#DC2626' }}>
                      {kpi.prediction}
                    </span>
                  </div>
                  {kpi.recommendation && (
                    <p className="text-xs text-text-muted mb-2">
                      <strong>Next action:</strong> {kpi.recommendation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* News & Market Intelligence */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="h3 text-nav">📰 Market Intelligence</h2>
            <div className="flex gap-2">
              {(['all', 'critical', 'high'] as const).map(filter => (
                <button
                  key={filter}
                  onClick={() => setNewsFilter(filter)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    newsFilter === filter
                      ? 'bg-red-50 text-red-600 border-red-300'
                      : 'bg-gray-50 text-gray-600 border-gray-200'
                  } border`}
                >
                  {filter === 'all' && 'All'}
                  {filter === 'critical' && 'Critical'}
                  {filter === 'high' && 'Critical + High'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredNews.map((news, i) => {
              const colors = getRelevanceColor(news.relevance)
              const isExpanded = expandedNews === news.id

              return (
                <motion.div
                  key={news.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-xl border-2 transition-all cursor-pointer"
                  style={{ background: colors.bg, borderColor: colors.border }}
                  onClick={() => setExpandedNews(isExpanded ? null : news.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{colors.icon}</span>
                        <h3 className="font-bold text-nav">{news.headline}</h3>
                      </div>
                      <p className="text-xs text-text-muted mb-2">
                        {news.source} • {new Date(news.timestamp).toLocaleDateString()}
                        {news.competitor && ` • Competitor: ${news.competitor}`}
                        {news.market && ` • Market: ${news.market}`}
                      </p>
                      <p className="text-sm text-text-muted line-clamp-2">{news.aiSummary}</p>
                    </div>
                    <ChevronDown className={`w-5 h-5 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 pt-4 border-t"
                        style={{ borderColor: colors.border }}
                      >
                        <div className="space-y-4">
                          <div>
                            <p className="label-sm font-bold text-nav mb-2">💡 Impact Assessment</p>
                            <p className="text-sm text-text-muted">{news.predictiveAnalytics.impact}</p>
                            <p className="text-xs font-bold mt-2" style={{ color: colors.text }}>
                              {news.predictiveAnalytics.probability}% confidence
                            </p>
                          </div>

                          <div>
                            <p className="label-sm font-bold text-nav mb-2">🎯 Recommended Action</p>
                            <p className="text-sm text-text-muted">{news.predictiveAnalytics.actionRecommendation}</p>
                            <span
                              className="inline-block mt-2 label-xs px-2 py-1 rounded-full font-bold"
                              style={{
                                background: news.predictiveAnalytics.urgency === 'immediate' ? '#FEE2E2' : '#FEF3C7',
                                color: news.predictiveAnalytics.urgency === 'immediate' ? '#DC2626' : '#B45309'
                              }}
                            >
                              {news.predictiveAnalytics.urgency === 'immediate' && '⚡ Immediate'}
                              {news.predictiveAnalytics.urgency === 'this-week' && '📅 This Week'}
                              {news.predictiveAnalytics.urgency === 'this-month' && '📆 This Month'}
                            </span>
                          </div>

                          {news.relatedDocuments.length > 0 && (
                            <div>
                              <p className="label-sm font-bold text-nav mb-2">📄 Related Documents</p>
                              <div className="flex gap-2 flex-wrap">
                                {news.relatedDocuments.map(doc => (
                                  <button
                                    key={doc}
                                    className="text-xs px-3 py-1.5 rounded-full border transition-all"
                                    style={{ background: 'white', borderColor: colors.border, color: colors.text }}
                                  >
                                    {doc}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Smart Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="h3 text-nav mb-4">🧠 AI Recommendations</h2>
          <div className="space-y-3">
            {insights.map((insight, i) => {
              const isExpanded = expandedInsight === insight.id

              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  onClick={() => setExpandedInsight(isExpanded ? null : insight.id)}
                  className="p-4 rounded-xl border-2 cursor-pointer transition-all"
                  style={{
                    background: insight.type === 'risk' ? '#FEE2E2' : insight.type === 'opportunity' ? '#F0FDF4' : '#EFF6FF',
                    borderColor: insight.type === 'risk' ? '#FECACA' : insight.type === 'opportunity' ? '#BBF7D0' : '#BFDBFE'
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span>
                          {insight.type === 'risk' && '⚠️'}
                          {insight.type === 'opportunity' && '🚀'}
                          {insight.type === 'milestone' && '🎉'}
                          {insight.type === 'action' && '✅'}
                        </span>
                        <h3 className="font-bold text-nav">{insight.title}</h3>
                      </div>
                      <p className="text-sm text-text-muted line-clamp-2">{insight.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
                        <span>Impact: <strong>{insight.impact}</strong></span>
                        <span>Confidence: <strong>{insight.confidence}%</strong></span>
                        {insight.daysToAction && insight.daysToAction > 0 && <span>Action in: <strong>{insight.daysToAction} days</strong></span>}
                      </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>

                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-current border-opacity-20"
                    >
                      <div className="space-y-3">
                        <div>
                          <p className="label-sm font-bold text-nav mb-1">Related Metrics</p>
                          <div className="flex gap-2 flex-wrap">
                            {insight.relatedMetrics.map(metric => (
                              <span key={metric} className="text-xs px-2 py-1 rounded-full bg-white bg-opacity-60">
                                {metric}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="label-sm font-bold text-nav mb-1">Suggested Focus</p>
                          <div className="flex gap-2 flex-wrap">
                            {insight.suggestedDocuments.map(doc => (
                              <button
                                key={doc}
                                className="text-xs px-3 py-1 rounded-full bg-white hover:shadow-md transition-all"
                              >
                                {doc}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
