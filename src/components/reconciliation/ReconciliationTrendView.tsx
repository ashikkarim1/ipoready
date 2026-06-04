'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { User, Calendar, AlertCircle } from 'lucide-react'

interface ReconciliationTrendViewProps {
  lastRefreshTime: Date
}

export function ReconciliationTrendView({
  lastRefreshTime,
}: ReconciliationTrendViewProps) {
  // Generate mock historical data
  const trendData = useMemo(() => {
    return [
      { date: '6 days ago', aligned: 6, needs_review: 1, critical: 1 },
      { date: '5 days ago', aligned: 6, needs_review: 2, critical: 0 },
      { date: '4 days ago', aligned: 5, needs_review: 2, critical: 1 },
      { date: '3 days ago', aligned: 6, needs_review: 1, critical: 1 },
      { date: '2 days ago', aligned: 6, needs_review: 2, critical: 0 },
      { date: 'Yesterday', aligned: 5, needs_review: 2, critical: 1 },
      { date: 'Today', aligned: 5, needs_review: 2, critical: 1 },
    ]
  }, [])

  const changeLog = [
    {
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      user: 'Sarah Chen (CFO)',
      action: 'Updated Burn Rate in Financials',
      metric: 'Burn Rate',
      from: '$280K/month',
      to: '$250K/month',
    },
    {
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      user: 'James Wilson (Controller)',
      action: 'Marked Revenue as Aligned',
      metric: 'Revenue',
      from: 'Needs Review',
      to: 'Aligned',
    },
    {
      timestamp: new Date(Date.now() - 86400000), // 1 day ago
      user: 'Emma Rodriguez (Finance)',
      action: 'Added explanation for Growth% variance',
      metric: 'Growth%',
      from: 'No explanation',
      to: 'Explained',
    },
    {
      timestamp: new Date(Date.now() - 172800000), // 2 days ago
      user: 'System Auto-Reconciliation',
      action: 'Detected new variance',
      metric: 'Runway',
      from: 'Aligned',
      to: 'Critical',
    },
  ]

  const renderCustomTooltip = (props: any) => {
    const { active, payload } = props
    if (active && payload && payload[0]) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-lg">
          <p className="font-semibold text-slate-900 dark:text-white text-sm">
            {data.date}
          </p>
          {payload.map((entry: any, idx: number) => (
            <p key={idx} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const formatTimestamp = (date: Date): string => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    return `${diffDays} days ago`
  }

  return (
    <div className="space-y-6">
      {/* Trend Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700"
      >
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          Reconciliation Trend (7 Days)
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAligned" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorReview" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#cbd5e1"
              style={{ opacity: 0.5 }}
            />
            <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <Tooltip content={renderCustomTooltip} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Area
              type="monotone"
              dataKey="aligned"
              stackId="1"
              stroke="#10b981"
              fill="url(#colorAligned)"
              name="Aligned"
            />
            <Area
              type="monotone"
              dataKey="needs_review"
              stackId="1"
              stroke="#f59e0b"
              fill="url(#colorReview)"
              name="Needs Review"
            />
            <Area
              type="monotone"
              dataKey="critical"
              stackId="1"
              stroke="#ef4444"
              fill="url(#colorCritical)"
              name="Critical"
            />
          </AreaChart>
        </ResponsiveContainer>

        <div className="mt-6 grid grid-cols-3 gap-4 text-center text-sm">
          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <p className="text-green-700 dark:text-green-300 font-semibold">Improving</p>
            <p className="text-green-600 dark:text-green-400 text-xs">+1 aligned since yesterday</p>
          </div>
          <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
            <p className="text-yellow-700 dark:text-yellow-300 font-semibold">Stable</p>
            <p className="text-yellow-600 dark:text-yellow-400 text-xs">2 metrics under review</p>
          </div>
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-red-700 dark:text-red-300 font-semibold">Attention Needed</p>
            <p className="text-red-600 dark:text-red-400 text-xs">1 critical issue</p>
          </div>
        </div>
      </motion.div>

      {/* Change Log */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700"
      >
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <Calendar className="h-6 w-6" />
          Recent Changes
        </h2>

        <div className="space-y-4">
          {changeLog.map((entry, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {entry.user}
                    </p>
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      {formatTimestamp(entry.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                    {entry.action}
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {entry.metric}
                    </span>
                    <span className="text-slate-600 dark:text-slate-400">
                      {entry.from} → {entry.to}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <button className="w-full mt-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
          View Full History
        </button>
      </motion.div>
    </div>
  )
}
