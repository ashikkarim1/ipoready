'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react'
import type { MetricAlignment } from './ReconciliationDashboard'

interface ReconciliationHeatmapProps {
  metrics: MetricAlignment[]
  onCellClick: (metric: string) => void
}

export function ReconciliationHeatmap({
  metrics,
  onCellClick,
}: ReconciliationHeatmapProps) {
  const sources = ['PACE', 'Financials', 'Prospectus', 'Cap Table']

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'aligned':
        return 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900/30'
      case 'needs_review':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
      case 'critical':
        return 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-900/30'
      default:
        return 'bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aligned':
        return <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
      case 'needs_review':
        return <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
      case 'critical':
        return <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
      default:
        return null
    }
  }

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'aligned':
        return '✓ Aligned'
      case 'needs_review':
        return '⚠ Review'
      case 'critical':
        return '🔴 Critical'
      default:
        return 'Unknown'
    }
  }

  const getStatusTextColor = (status: string): string => {
    switch (status) {
      case 'aligned':
        return 'text-green-700 dark:text-green-300'
      case 'needs_review':
        return 'text-yellow-700 dark:text-yellow-300'
      case 'critical':
        return 'text-red-700 dark:text-red-300'
      default:
        return 'text-slate-700 dark:text-slate-300'
    }
  }

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        {/* Header Row */}
        <div className="grid gap-0" style={{ gridTemplateColumns: '180px repeat(4, 1fr)' }}>
          {/* Top-left corner */}
          <div className="p-3 font-semibold text-slate-700 dark:text-slate-300 text-sm border-b border-r border-slate-200 dark:border-slate-700">
            Metric
          </div>

          {/* Source headers */}
          {sources.map(source => (
            <div
              key={source}
              className="p-3 font-semibold text-slate-700 dark:text-slate-300 text-sm text-center border-b border-r border-slate-200 dark:border-slate-700 last:border-r-0 bg-slate-100 dark:bg-slate-700"
            >
              {source}
            </div>
          ))}

          {/* Data rows */}
          {metrics.map((metric, idx) => (
            <motion.div
              key={metric.metricId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="contents"
            >
              {/* Metric name cell */}
              <div className="p-3 font-semibold text-slate-900 dark:text-white text-sm border-b border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                {metric.metric}
              </div>

              {/* Status cells */}
              {[
                metric.pace_value,
                metric.financial_value,
                metric.prospectus_value,
                metric.cap_table_value,
              ].map((value, cellIdx) => (
                <motion.button
                  key={`${metric.metricId}-${cellIdx}`}
                  onClick={() => onCellClick(metric.metric)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-3 border-b border-r border-slate-200 dark:border-slate-700 last:border-r-0 cursor-pointer transition-all duration-200 ${getStatusColor(
                    metric.status
                  )}`}
                >
                  <div className="flex flex-col items-center gap-2">
                    {getStatusIcon(metric.status)}
                    <div className="text-xs font-medium text-slate-700 dark:text-slate-300 text-center">
                      {value === 'N/A' ? (
                        <span className="text-slate-400 dark:text-slate-500">—</span>
                      ) : (
                        <span className="line-clamp-2">{String(value)}</span>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}

              {/* Variance indicator (appears after all source cells on detail row) */}
              <motion.div
                className="contents"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.05 + 0.2 }}
              >
                <div className="col-span-full p-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-3">
                  <span className={`text-xs font-medium ${getStatusTextColor(metric.status)}`}>
                    {getStatusLabel(metric.status)}
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    Variance: {metric.variance_percent.toFixed(2)}%
                  </span>
                  {metric.isExplained && (
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                      Explained
                    </span>
                  )}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3">Legend:</p>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-xs text-slate-700 dark:text-slate-300">
              {'<5% variance'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <span className="text-xs text-slate-700 dark:text-slate-300">
              5-10% variance
            </span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <span className="text-xs text-slate-700 dark:text-slate-300">
              {'>10% variance'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
