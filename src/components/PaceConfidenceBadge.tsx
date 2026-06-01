'use client'

import { motion } from 'framer-motion'
import { Info } from 'lucide-react'
import { useState } from 'react'

interface PaceConfidenceBadgeProps {
  confidenceLevel: 'low' | 'medium' | 'high'
  confidenceScore: number // 0-100, represents % of input factors populated
  factorsComplete: number // number of factors with data
  totalFactors: number // total possible factors (5)
}

export function PaceConfidenceBadge({
  confidenceLevel,
  confidenceScore,
  factorsComplete,
  totalFactors,
}: PaceConfidenceBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  const getColorScheme = () => {
    if (confidenceLevel === 'high')
      return { bg: '#F0FDF4', border: '#BBF7D0', text: '#15803D', label: 'High Confidence' }
    if (confidenceLevel === 'medium')
      return { bg: '#FFFBEB', border: '#FCD34D', text: '#D97706', label: 'Medium Confidence' }
    return { bg: '#FEF2F2', border: '#FECACA', text: '#DC2626', label: 'Low Confidence' }
  }

  const colors = getColorScheme()

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <div
        className="rounded-lg border-2 p-6 flex items-center justify-between"
        style={{ background: colors.bg, borderColor: colors.border }}
      >
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-700 mb-2">Prediction Confidence</p>
          <div className="flex items-baseline gap-2">
            <span
              className="text-3xl font-bold"
              style={{ color: colors.text }}
            >
              {confidenceScore}%
            </span>
            <span style={{ color: colors.text }} className="text-sm font-semibold">
              {colors.label}
            </span>
          </div>
          <p className="text-xs mt-2 opacity-75" style={{ color: colors.text }}>
            {factorsComplete} of {totalFactors} key factors populated ({Math.round((factorsComplete / totalFactors) * 100)}%)
          </p>
        </div>

        {/* Info Icon */}
        <div className="relative">
          <button
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="p-2 rounded-full hover:bg-white/50 transition-colors"
          >
            <Info className="w-5 h-5" style={{ color: colors.text }} />
          </button>

          {/* Tooltip */}
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute right-0 top-12 w-80 p-4 rounded-lg bg-white border border-gray-200 shadow-lg z-10"
            >
              <p className="text-sm font-semibold text-gray-900 mb-2">How Confidence is Calculated</p>
              <p className="text-xs text-gray-600 mb-3">
                Confidence = percentage of PACE input factors populated. Each factor represents 20% of total confidence.
              </p>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-xs font-bold text-gray-400 min-w-fit">20%</span>
                  <span className="text-xs text-gray-600">Cash runway (months)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xs font-bold text-gray-400 min-w-fit">20%</span>
                  <span className="text-xs text-gray-600">Team size</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xs font-bold text-gray-400 min-w-fit">20%</span>
                  <span className="text-xs text-gray-600">CFO hired</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xs font-bold text-gray-400 min-w-fit">20%</span>
                  <span className="text-xs text-gray-600">Board size</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xs font-bold text-gray-400 min-w-fit">20%</span>
                  <span className="text-xs text-gray-600">Auditor selected</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
