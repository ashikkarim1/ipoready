'use client'

import { motion } from 'framer-motion'

interface ReadinessFactorsProps {
  cashRunwayMonths?: number
  teamSize?: number
  cfoHired?: boolean
  boardSize?: number
  auditorSelected?: boolean
  investorSophisticationScore?: number
}

export function PaceReadinessFactorsCard({
  cashRunwayMonths = 12,
  teamSize = 0,
  cfoHired = false,
  boardSize = 0,
  auditorSelected = false,
  investorSophisticationScore = 0,
}: ReadinessFactorsProps) {
  const getCashRunwayStatus = (months?: number) => {
    if (!months) return { status: 'unknown', color: 'bg-gray-100', textColor: 'text-gray-700', label: 'Not specified' }
    if (months >= 12) return { status: 'healthy', color: 'bg-green-100', textColor: 'text-green-700', label: 'Strong runway' }
    if (months >= 6) return { status: 'adequate', color: 'bg-blue-100', textColor: 'text-blue-700', label: 'Adequate runway' }
    return { status: 'critical', color: 'bg-red-100', textColor: 'text-red-700', label: 'Critical runway' }
  }

  const cashStatus = getCashRunwayStatus(cashRunwayMonths)

  const factors = [
    {
      icon: '💰',
      label: 'Cash Runway',
      value: cashRunwayMonths ? `${Math.round(cashRunwayMonths)} months` : 'Not set',
      status: cashRunwayMonths ? (cashRunwayMonths >= 12 ? 'ready' : cashRunwayMonths >= 6 ? 'partial' : 'blocked') : 'unknown',
      hint: 'Estimated cash runway for IPO operations',
    },
    {
      icon: '👥',
      label: 'Team Size',
      value: teamSize > 0 ? `${teamSize} people` : 'Not set',
      status: teamSize >= 30 ? 'ready' : teamSize >= 15 ? 'partial' : 'blocked',
      hint: 'Total headcount for IPO readiness',
    },
    {
      icon: '💼',
      label: 'CFO',
      value: cfoHired ? 'Hired' : 'Not hired',
      status: cfoHired ? 'ready' : 'blocked',
      hint: 'Chief Financial Officer appointed',
    },
    {
      icon: '🏛️',
      label: 'Board Members',
      value: boardSize > 0 ? `${boardSize} seats` : 'Not set',
      status: boardSize >= 5 ? 'ready' : boardSize > 0 ? 'partial' : 'blocked',
      hint: 'Board seats filled (optimal: 5-7)',
    },
    {
      icon: '✓',
      label: 'Auditor',
      value: auditorSelected ? 'Selected' : 'Not selected',
      status: auditorSelected ? 'ready' : 'blocked',
      hint: 'Big 4 or equivalent auditor engaged',
    },
    {
      icon: '🤝',
      label: 'Investor Quality',
      value: investorSophisticationScore > 0 ? `${investorSophisticationScore}/10` : 'Not set',
      status: investorSophisticationScore >= 7 ? 'ready' : investorSophisticationScore >= 4 ? 'partial' : 'blocked',
      hint: 'Institutional investor sophistication',
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-green-50 border-green-200'
      case 'partial':
        return 'bg-amber-50 border-amber-200'
      case 'blocked':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return '✓'
      case 'partial':
        return '◐'
      case 'blocked':
        return '✕'
      default:
        return '○'
    }
  }

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'text-green-700'
      case 'partial':
        return 'text-amber-700'
      case 'blocked':
        return 'text-red-700'
      default:
        return 'text-gray-700'
    }
  }

  const readyCount = factors.filter((f) => f.status === 'ready').length
  const partialCount = factors.filter((f) => f.status === 'partial').length
  const readinessPercent = Math.round((readyCount / factors.length) * 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="rounded-lg border border-gray-200 p-6 bg-white"
    >
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="h4 font-semibold text-gray-900">Readiness Factors</h3>
          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 label font-medium">{readinessPercent}% Ready</span>
        </div>
        <p className="body-sm text-gray-600">Track team, financial, and governance readiness for IPO</p>
        <div className="mt-3 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
            initial={{ width: 0 }}
            animate={{ width: `${readinessPercent}%` }}
            transition={{ duration: 1, delay: 0.8 }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {factors.map((factor, idx) => (
          <motion.div
            key={factor.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.7 + idx * 0.05 }}
            className={`rounded-lg border p-4 transition-all hover:shadow-md cursor-default ${getStatusColor(factor.status)}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="h4">{factor.icon}</span>
                  <h4 className="font-medium text-gray-900">{factor.label}</h4>
                </div>
                <p className="body-sm text-gray-600 mb-2">{factor.hint}</p>
                <p className="label font-semibold text-gray-900">{factor.value}</p>
              </div>
              <div className={`text-lg font-bold ${getStatusTextColor(factor.status)}`}>
                {getStatusIcon(factor.status)}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
        <p className="body-sm text-blue-900">
          <span className="font-semibold">Tip:</span> Complete all readiness factors to maximize PACE score accuracy. Update team size, cash runway, and governance details in Company Settings.
        </p>
      </div>
    </motion.div>
  )
}
