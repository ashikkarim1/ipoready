'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react'

interface ReconciliationStatsProps {
  stats: {
    aligned: number
    needsReview: number
    critical: number
  }
}

export function ReconciliationStats({ stats }: ReconciliationStatsProps) {
  const total = stats.aligned + stats.needsReview + stats.critical
  const alignmentPercentage = total > 0 ? Math.round((stats.aligned / total) * 100) : 0

  const statCards = [
    {
      icon: CheckCircle2,
      label: 'Aligned',
      value: stats.aligned,
      color: 'green',
      description: 'Metrics with <5% variance',
    },
    {
      icon: AlertTriangle,
      label: 'Needs Review',
      value: stats.needsReview,
      color: 'yellow',
      description: 'Metrics with 5-10% variance',
    },
    {
      icon: AlertCircle,
      label: 'Critical',
      value: stats.critical,
      color: 'red',
      description: 'Metrics with >10% variance',
    },
  ]

  const colorMap = {
    green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300',
    red: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300',
  }

  const iconColorMap = {
    green: 'text-green-600 dark:text-green-400',
    yellow: 'text-yellow-600 dark:text-yellow-400',
    red: 'text-red-600 dark:text-red-400',
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Overall Health Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0 }}
        className="p-6 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 border border-blue-200 dark:border-blue-800"
      >
        <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-3">
          Overall Health
        </p>
        <div className="flex items-end gap-3">
          <div className="text-4xl font-bold text-blue-700 dark:text-blue-300">
            {alignmentPercentage}%
          </div>
          <p className="text-xs text-blue-700 dark:text-blue-400 mb-1">
            {total} metrics
          </p>
        </div>
        <div className="mt-4 w-full h-2 bg-blue-200 dark:bg-blue-900/50 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${alignmentPercentage}%` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
          />
        </div>
        <p className="text-xs text-blue-700 dark:text-blue-400 mt-2">
          {stats.critical === 0 ? '✓ All critical issues resolved' : `${stats.critical} critical issues to address`}
        </p>
      </motion.div>

      {/* Individual Stats */}
      {statCards.map((card, idx) => {
        const Icon = card.icon
        const bgClass = colorMap[card.color as keyof typeof colorMap]
        const iconClass = iconColorMap[card.color as keyof typeof iconColorMap]

        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (idx + 1) * 0.1 }}
            className={`p-6 rounded-lg border ${bgClass}`}
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-sm font-semibold">
                {card.label}
              </p>
              <Icon className={`h-5 w-5 ${iconClass}`} />
            </div>
            <p className="text-3xl font-bold">
              {card.value}
            </p>
            <p className="text-xs opacity-75 mt-2">
              {card.description}
            </p>
            {card.value > 0 && (
              <div className="mt-3 text-xs font-semibold opacity-75">
                {Math.round((card.value / total) * 100)}% of total
              </div>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}
