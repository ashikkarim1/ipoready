'use client'

import { motion } from 'framer-motion'
import { info } from 'lucide-react'
import { useState } from 'react'

interface PaceConfidenceBadgeProps {
  confidenceLevel?: 'low' | 'medium' | 'high'
  dataCompleteness?: number // 0-100 percentage
  explanation?: string
}

export function PaceConfidenceBadge({
  confidenceLevel = 'medium',
  dataCompleteness = 65,
  explanation = 'PACE calculation confidence is based on the completeness and accuracy of company readiness data.',
}: PaceConfidenceBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  const confidenceLevels = {
    low: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      badge: 'bg-red-100 text-red-800',
      icon: '⚠️',
      label: 'Low Confidence',
      description: 'Incomplete data — PACE score may not be predictive',
    },
    medium: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      badge: 'bg-amber-100 text-amber-800',
      icon: '◐',
      label: 'Medium Confidence',
      description: 'Partial data collected — PACE score reasonably predictive',
    },
    high: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      badge: 'bg-green-100 text-green-800',
      icon: '✓',
      label: 'High Confidence',
      description: 'Complete data — PACE score is predictive and reliable',
    },
  }

  const current = confidenceLevels[confidenceLevel]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.5 }}
      className={`rounded-lg border ${current.bg} ${current.border} p-4 relative`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{current.icon}</span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${current.badge}`}>
              {current.label}
            </span>
          </div>

          <p className="text-sm text-gray-700 mb-3">{current.description}</p>

          {/* Data Completeness Progress */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-600">Data Completeness</label>
              <span className="text-xs font-semibold text-gray-900">{dataCompleteness}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${dataCompleteness}%` }}
                transition={{ delay: 1.4, duration: 0.8, ease: 'easeOut' }}
                className={`h-full ${
                  confidenceLevel === 'high'
                    ? 'bg-green-500'
                    : confidenceLevel === 'medium'
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                }`}
              />
            </div>
          </div>

          {/* Contributing Factors */}
          <div className="text-xs text-gray-600 space-y-1">
            <div className="flex items-center gap-2">
              <span>✓</span>
              <span>Team readiness factors populated</span>
            </div>
            <div className="flex items-center gap-2">
              <span>{dataCompleteness >= 75 ? '✓' : '◐'}</span>
              <span>Financial metrics provided</span>
            </div>
            <div className="flex items-center gap-2">
              <span>{dataCompleteness >= 50 ? '✓' : '◯'}</span>
              <span>Document status tracked</span>
            </div>
          </div>
        </div>

        {/* Info Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.5 }}
          className="relative"
        >
          <button
            onClick={() => setShowTooltip(!showTooltip)}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0"
            aria-label="Confidence explanation"
          >
            <info className="w-5 h-5 text-gray-600" />
          </button>

          {/* Tooltip */}
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-12 top-0 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg z-10 pointer-events-none"
            >
              {explanation}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full w-0 h-0 border-4 border-transparent border-l-gray-900" />
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Action Hint */}
      <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
        {confidenceLevel === 'low' && (
          <span>💡 Complete team size, cash runway, and auditor selection to improve confidence</span>
        )}
        {confidenceLevel === 'medium' && (
          <span>💡 Add financial metrics and complete board formation to reach high confidence</span>
        )}
        {confidenceLevel === 'high' && (
          <span>✓ Your PACE score is highly predictive. Monitor for changes in key factors.</span>
        )}
      </div>
    </motion.div>
  )
}
