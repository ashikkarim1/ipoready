'use client'

import { motion } from 'framer-motion'

interface SequenceAlert {
  id: string
  rule: string
  severity: 'error' | 'warning'
  description: string
  remediation: string
  tasksInvolved: string[]
}

interface PaceSequenceAlertsSectionProps {
  alerts?: SequenceAlert[]
  exchange?: string
}

const DEFAULT_ALERTS: SequenceAlert[] = [
  {
    id: '1',
    rule: 'Auditor selection before Financial Audit phase',
    severity: 'error',
    description: 'Your Financial Audit phase is in progress, but auditor has not been selected.',
    remediation: 'Select and engage a Big 4 auditor before proceeding with audit phase',
    tasksInvolved: ['Auditor Selection', 'Financial Audit'],
  },
  {
    id: '2',
    rule: 'Cap table cleanup before Financial Audit',
    severity: 'error',
    description: 'Financial Audit phase requires a clean, verified cap table.',
    remediation: 'Complete cap table reconciliation and legal review in Equity Management phase',
    tasksInvolved: ['Equity Management', 'Financial Audit'],
  },
  {
    id: '3',
    rule: 'Board formation before Roadshow phase',
    severity: 'warning',
    description: 'Your Roadshow phase is upcoming, but board is not fully formed.',
    remediation: 'Form board with 5-7 members including independent directors before roadshow',
    tasksInvolved: ['Governance Setup', 'Investor Roadshow'],
  },
  {
    id: '4',
    rule: 'Legal documentation before Regulatory Filing',
    severity: 'warning',
    description: 'Regulatory Filing phase requires complete legal documentation package.',
    remediation: 'Draft and review all legal documents (incorporation docs, charter, policies) in Document Prep',
    tasksInvolved: ['Document Preparation', 'Regulatory Filing'],
  },
]

export function PaceSequenceAlertsSection({
  alerts = DEFAULT_ALERTS,
  exchange = 'TSX',
}: PaceSequenceAlertsSectionProps) {
  const errors = alerts.filter((a) => a.severity === 'error')
  const warnings = alerts.filter((a) => a.severity === 'warning')
  const hasAlerts = alerts.length > 0

  const getSeverityIcon = (severity: string) => {
    return severity === 'error' ? '⚠️' : '⚡'
  }

  const getSeverityColor = (severity: string) => {
    return severity === 'error'
      ? 'bg-red-50 border-red-200'
      : 'bg-amber-50 border-amber-200'
  }

  const getSeverityBadgeColor = (severity: string) => {
    return severity === 'error'
      ? 'bg-red-100 text-red-700'
      : 'bg-amber-100 text-amber-700'
  }

  const getSeverityLabel = (severity: string) => {
    return severity === 'error' ? 'Critical' : 'Warning'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className="rounded-lg border border-gray-200 p-6 bg-white"
    >
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Milestone Sequence Alerts</h3>
          {hasAlerts && (
            <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium">
              {errors.length} Critical, {warnings.length} Warning
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600">
          Ensure tasks follow optimal IPO sequence for {exchange}. Out-of-order milestones may delay your timeline.
        </p>
      </div>

      {!hasAlerts ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">✓</div>
          <p className="text-gray-600 font-medium">All milestones in optimal sequence</p>
          <p className="text-sm text-gray-500 mt-1">Your tasks are properly sequenced for IPO readiness</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Critical Errors */}
          {errors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.9 }}
            >
              <h4 className="text-sm font-semibold text-red-700 mb-3 flex items-center gap-2">
                <span>🚨</span> Critical Issues ({errors.length})
              </h4>
              <div className="space-y-3">
                {errors.map((alert, idx) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.95 + idx * 0.05 }}
                    className={`rounded-lg border p-4 ${getSeverityColor(alert.severity)}`}
                  >
                    <div className="flex gap-3">
                      <div className="text-xl mt-1">{getSeverityIcon(alert.severity)}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h5 className="font-medium text-gray-900">{alert.rule}</h5>
                          <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getSeverityBadgeColor(alert.severity)}`}>
                            {getSeverityLabel(alert.severity)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{alert.description}</p>
                        <div className="mb-3">
                          <p className="text-xs font-semibold text-gray-600 mb-1">Remediation:</p>
                          <p className="text-sm text-gray-700 italic">{alert.remediation}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {alert.tasksInvolved.map((task) => (
                            <span key={task} className="px-2 py-1 rounded-full bg-white/50 text-xs text-gray-700 border border-red-200">
                              {task}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Warnings */}
          {warnings.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 1 }}
            >
              <h4 className="text-sm font-semibold text-amber-700 mb-3 flex items-center gap-2">
                <span>⚡</span> Recommendations ({warnings.length})
              </h4>
              <div className="space-y-3">
                {warnings.map((alert, idx) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 1.05 + idx * 0.05 }}
                    className={`rounded-lg border p-4 ${getSeverityColor(alert.severity)}`}
                  >
                    <div className="flex gap-3">
                      <div className="text-xl mt-1">{getSeverityIcon(alert.severity)}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h5 className="font-medium text-gray-900">{alert.rule}</h5>
                          <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getSeverityBadgeColor(alert.severity)}`}>
                            {getSeverityLabel(alert.severity)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{alert.description}</p>
                        <div className="mb-3">
                          <p className="text-xs font-semibold text-gray-600 mb-1">Recommended Action:</p>
                          <p className="text-sm text-gray-700 italic">{alert.remediation}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {alert.tasksInvolved.map((task) => (
                            <span key={task} className="px-2 py-1 rounded-full bg-white/50 text-xs text-gray-700 border border-amber-200">
                              {task}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}

      <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
        <p className="text-sm text-blue-900">
          <span className="font-semibold">Info:</span> IPO sequencing rules are exchange-specific. These are optimized for {exchange}. Contact your advisor for custom guidance.
        </p>
      </div>
    </motion.div>
  )
}
