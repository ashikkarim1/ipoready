'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Save, Zap, BookOpen } from 'lucide-react'
import type { MetricAlignment } from './ReconciliationDashboard'

interface MismatchDetailViewProps {
  metric: MetricAlignment
  onClose: () => void
  onUpdate?: () => void
}

export function MismatchDetailView({
  metric,
  onClose,
  onUpdate,
}: MismatchDetailViewProps) {
  const [explanation, setExplanation] = useState(metric.explanation || '')
  const [isMarkedResolved, setIsMarkedResolved] = useState(metric.isExplained)
  const [isSaving, setIsSaving] = useState(false)

  const handleMarkResolved = async () => {
    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setIsMarkedResolved(true)
      if (onUpdate) {
        onUpdate()
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveExplanation = async () => {
    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      if (onUpdate) {
        onUpdate()
      }
    } finally {
      setIsSaving(false)
    }
  }

  // Calculate impact assessment
  const impactAmount = Math.abs(metric.variance_percent) > 5 ? 'High' : 'Moderate'
  const estimatedImpact =
    metric.metric === 'Growth%'
      ? '~$5M valuation impact per 1% variance'
      : metric.metric === 'Burn Rate'
      ? '~$3M runway impact per 10% variance'
      : metric.metric === 'Revenue'
      ? '~$2M per 1% variance'
      : 'Detailed impact analysis required'

  const sources = [
    { name: 'PACE', value: metric.pace_value },
    { name: 'Financials', value: metric.financial_value },
    { name: 'Prospectus', value: metric.prospectus_value },
    { name: 'Cap Table', value: metric.cap_table_value },
  ]

  const getStatusBadgeColor = (status: string): string => {
    switch (status) {
      case 'aligned':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700'
      case 'needs_review':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700'
      case 'critical':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700'
      default:
        return 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {metric.metric} Mismatch
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Detailed reconciliation view and resolution actions
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-slate-500 dark:text-slate-400" />
          </motion.button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-semibold text-sm ${getStatusBadgeColor(
            metric.status
          )}`}>
            {metric.status === 'aligned' && '✓'}
            {metric.status === 'needs_review' && '⚠'}
            {metric.status === 'critical' && '🔴'}
            {metric.status === 'aligned'
              ? 'Aligned'
              : metric.status === 'needs_review'
              ? 'Needs Review'
              : 'Critical Conflict'}
            {metric.variance_percent > 0 && (
              <span className="ml-2 text-xs font-mono">
                Variance: {metric.variance_percent.toFixed(2)}%
              </span>
            )}
          </div>

          {/* Source Values */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
              Source Values Comparison
            </h3>
            <div className="grid gap-3">
              {sources.map(source => (
                <div
                  key={source.name}
                  className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {source.name}
                      </p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white mt-2">
                        {source.value === 'N/A' ? (
                          <span className="text-slate-400 dark:text-slate-500">Not Available</span>
                        ) : (
                          source.value
                        )}
                      </p>
                    </div>
                    {source.value !== 'N/A' && (
                      <div className="text-right">
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                          Data Quality
                        </p>
                        <div className="w-16 h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Impact Assessment */}
          <div className="p-4 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Impact Assessment
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                  {estimatedImpact}
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Severity: <span className="font-semibold">{impactAmount}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Explanation Text Area */}
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <BookOpen className="h-5 w-5 text-slate-600 dark:text-slate-400 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Add Explanation for Intentional Difference
                </label>
                <textarea
                  value={explanation}
                  onChange={e => setExplanation(e.target.value)}
                  placeholder="If this difference is intentional, document the reason here. This helps other stakeholders understand the variance."
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                  Examples: "Growth rate reflects conservative Q1 actuals", "Runway includes new funding round"
                </p>
              </div>
            </div>
          </div>

          {/* Suggested Fixes */}
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
              Suggested Fixes
            </h4>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 text-left text-sm rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors text-slate-700 dark:text-slate-300">
                Update Prospectus with Latest Figures
              </button>
              <button className="w-full px-4 py-2 text-left text-sm rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors text-slate-700 dark:text-slate-300">
                Update PACE Assumptions
              </button>
              <button className="w-full px-4 py-2 text-left text-sm rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors text-slate-700 dark:text-slate-300">
                Update Financial Projections
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Close
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSaveExplanation}
            disabled={isSaving}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Explanation'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleMarkResolved}
            disabled={isSaving || isMarkedResolved}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              isMarkedResolved
                ? 'bg-green-600 text-white cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isMarkedResolved ? '✓ Resolved' : 'Mark Resolved'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
