'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { ArrowUp, ArrowDown, TrendingUp, Users, MessageSquare, AlertCircle, CheckCircle } from 'lucide-react'

interface PilotCompany {
  id: string
  name: string
  sector: string
  targetExchange: string
  stage: string
  pilotCode: string
  createdAt: string
  feedbackCount: number
  averageRating: number
  sentiment: {
    positive: number
    neutral: number
    negative: number
    frustrated: number
  }
  topFrictionPoints: Array<{
    point: string
    count: number
  }>
  lastFeedbackAt?: string
  tasksCompleted: number
  totalTasks: number
}

interface DashboardStats {
  totalCompanies: number
  totalFeedback: number
  averageRating: number
  positiveRatio: number
  engagementRate: number
  frictionHotspots: Array<{
    point: string
    count: number
    severity: 'high' | 'medium' | 'low'
  }>
}

const sentimentColors = {
  positive: '#10b981',
  neutral: '#6b7280',
  negative: '#ef4444',
  frustrated: '#f97316',
}

export default function PilotDashboard() {
  const [companies, setCompanies] = useState<PilotCompany[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCompany, setSelectedCompany] = useState<PilotCompany | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch pilot companies
        const companiesRes = await fetch('/api/pilot/companies')
        if (!companiesRes.ok) throw new Error('Failed to fetch companies')
        const companiesData = await companiesRes.json()
        setCompanies(companiesData.companies || [])

        // Fetch dashboard stats
        const statsRes = await fetch('/api/pilot/dashboard-stats')
        if (!statsRes.ok) throw new Error('Failed to fetch stats')
        const statsData = await statsRes.json()
        setStats(statsData.stats)

        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard')
        setLoading(false)
      }
    }

    fetchData()
    // Refresh every 5 minutes
    const interval = setInterval(fetchData, 300000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-slate-200 border-t-slate-800 rounded-full"
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center gap-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <h2 className="font-semibold text-red-900">Error Loading Dashboard</h2>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Prepare chart data
  const companyRatingsData = companies.map((c) => ({
    name: c.name.substring(0, 12),
    rating: parseFloat(c.averageRating.toFixed(1)),
    feedback: c.feedbackCount,
  }))

  const sentimentData = companies.map((c) => {
    const total = c.sentiment.positive + c.sentiment.neutral + c.sentiment.negative + c.sentiment.frustrated
    return {
      name: c.name.substring(0, 12),
      positive: total > 0 ? Math.round((c.sentiment.positive / total) * 100) : 0,
      neutral: total > 0 ? Math.round((c.sentiment.neutral / total) * 100) : 0,
      negative: total > 0 ? Math.round((c.sentiment.negative / total) * 100) : 0,
      frustrated: total > 0 ? Math.round((c.sentiment.frustrated / total) * 100) : 0,
    }
  })

  const topFrictionData = (stats?.frictionHotspots || []).slice(0, 5).map((item) => ({
    name: item.point.substring(0, 20),
    count: item.count,
    severity: item.severity,
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">IPOReady Pilot Dashboard</h1>
          <p className="text-slate-600">Real-time monitoring of 10 pilot IPO/RTO companies</p>
        </motion.div>

        {/* Key Metrics */}
        {stats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10"
          >
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Active Companies</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalCompanies}</p>
                </div>
                <Users className="w-10 h-10 text-blue-500 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Average Rating</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{stats.averageRating.toFixed(1)}/5</p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-500 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Total Feedback</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalFeedback}</p>
                </div>
                <MessageSquare className="w-10 h-10 text-purple-500 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-emerald-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Positive Sentiment</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{Math.round(stats.positiveRatio * 100)}%</p>
                </div>
                <CheckCircle className="w-10 h-10 text-emerald-500 opacity-20" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {/* Average Rating by Company */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Rating by Company</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={companyRatingsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis domain={[0, 5]} stroke="#6b7280" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                />
                <Bar dataKey="rating" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Sentiment Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Sentiment Breakdown</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sentimentData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#6b7280" />
                <YAxis type="category" dataKey="name" width={100} stroke="#6b7280" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                />
                <Bar dataKey="positive" fill={sentimentColors.positive} />
                <Bar dataKey="neutral" fill={sentimentColors.neutral} />
                <Bar dataKey="negative" fill={sentimentColors.negative} />
                <Bar dataKey="frustrated" fill={sentimentColors.frustrated} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Top Friction Points */}
        {topFrictionData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow p-6 mb-10"
          >
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Top Friction Points</h2>
            <div className="space-y-3">
              {topFrictionData.map((item, i) => {
                const severityColor =
                  item.severity === 'high'
                    ? 'bg-red-50 border-red-200'
                    : item.severity === 'medium'
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-blue-50 border-blue-200'
                return (
                  <div key={i} className={`border rounded-lg p-4 ${severityColor}`}>
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-slate-900">{item.name}</p>
                      <span className="text-sm font-semibold text-slate-600">{item.count} mentions</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Companies Grid */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Pilot Companies</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <motion.div
                key={company.id}
                whileHover={{ translateY: -4 }}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 cursor-pointer"
                onClick={() => setSelectedCompany(company)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-900 text-lg">{company.name}</h3>
                    <p className="text-sm text-slate-600">{company.sector}</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                    {company.pilotCode}
                  </span>
                </div>

                <div className="space-y-3 mb-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Exchange</span>
                    <span className="font-medium text-slate-900">{company.targetExchange}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Tasks</span>
                    <span className="font-medium text-slate-900">
                      {company.tasksCompleted}/{company.totalTasks}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Rating</span>
                    <span className="text-lg font-bold text-slate-900">{company.averageRating.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Feedback</span>
                    <span className="text-lg font-bold text-slate-900">{company.feedbackCount}</span>
                  </div>
                </div>

                {company.lastFeedbackAt && (
                  <p className="text-xs text-slate-500 mt-4">
                    Last feedback:{' '}
                    {new Date(company.lastFeedbackAt).toLocaleDateString()}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Detail Modal for Selected Company */}
        {selectedCompany && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setSelectedCompany(null)}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">{selectedCompany.name}</h3>
                  <p className="text-slate-300">{selectedCompany.pilotCode}</p>
                </div>
                <button
                  onClick={() => setSelectedCompany(null)}
                  className="text-2xl font-light text-slate-400 hover:text-white"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Sector</p>
                    <p className="text-lg font-semibold text-slate-900">{selectedCompany.sector}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Target Exchange</p>
                    <p className="text-lg font-semibold text-slate-900">{selectedCompany.targetExchange}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Stage</p>
                    <p className="text-lg font-semibold text-slate-900">{selectedCompany.stage}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Tasks Completed</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {selectedCompany.tasksCompleted}/{selectedCompany.totalTasks}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-900">Sentiment Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Positive</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500"
                            style={{
                              width: `${
                                selectedCompany.sentiment.positive +
                                  selectedCompany.sentiment.neutral +
                                  selectedCompany.sentiment.negative +
                                  selectedCompany.sentiment.frustrated >
                                0
                                  ? (selectedCompany.sentiment.positive /
                                      (selectedCompany.sentiment.positive +
                                        selectedCompany.sentiment.neutral +
                                        selectedCompany.sentiment.negative +
                                        selectedCompany.sentiment.frustrated)) *
                                    100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-slate-900">
                          {selectedCompany.sentiment.positive}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Neutral</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-slate-500"
                            style={{
                              width: `${
                                selectedCompany.sentiment.positive +
                                  selectedCompany.sentiment.neutral +
                                  selectedCompany.sentiment.negative +
                                  selectedCompany.sentiment.frustrated >
                                0
                                  ? (selectedCompany.sentiment.neutral /
                                      (selectedCompany.sentiment.positive +
                                        selectedCompany.sentiment.neutral +
                                        selectedCompany.sentiment.negative +
                                        selectedCompany.sentiment.frustrated)) *
                                    100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-slate-900">
                          {selectedCompany.sentiment.neutral}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Negative</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-500"
                            style={{
                              width: `${
                                selectedCompany.sentiment.positive +
                                  selectedCompany.sentiment.neutral +
                                  selectedCompany.sentiment.negative +
                                  selectedCompany.sentiment.frustrated >
                                0
                                  ? (selectedCompany.sentiment.negative /
                                      (selectedCompany.sentiment.positive +
                                        selectedCompany.sentiment.neutral +
                                        selectedCompany.sentiment.negative +
                                        selectedCompany.sentiment.frustrated)) *
                                    100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-slate-900">
                          {selectedCompany.sentiment.negative}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Frustrated</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-orange-500"
                            style={{
                              width: `${
                                selectedCompany.sentiment.positive +
                                  selectedCompany.sentiment.neutral +
                                  selectedCompany.sentiment.negative +
                                  selectedCompany.sentiment.frustrated >
                                0
                                  ? (selectedCompany.sentiment.frustrated /
                                      (selectedCompany.sentiment.positive +
                                        selectedCompany.sentiment.neutral +
                                        selectedCompany.sentiment.negative +
                                        selectedCompany.sentiment.frustrated)) *
                                    100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-slate-900">
                          {selectedCompany.sentiment.frustrated}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedCompany.topFrictionPoints.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-slate-900">Friction Points</h4>
                    <div className="space-y-2">
                      {selectedCompany.topFrictionPoints.map((point, i) => (
                        <div key={i} className="bg-slate-50 rounded p-3 flex items-center justify-between">
                          <span className="text-sm text-slate-700">{point.point}</span>
                          <span className="text-xs font-semibold text-slate-600">{point.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
