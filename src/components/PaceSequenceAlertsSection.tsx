'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react'
import { useState } from 'react'

interface SequencingAlert {
  id: string
  ruleText: string
  currentPhase: number
  blockedUntilPhase: number
  severity: 'error' | 'warning'
}

interface PaceSequenceAlertsSectionProps {
  alerts: SequencingAlert[]
}

export function PaceSequenceAlertsSection({ alerts }: PaceSequenceAlertsSectionProps) {
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null)

  const errors = alerts.filter(a => a.severity === 'error')
  const warnings = alerts.filter(a => a.severity === 'warning')
  const hasAlerts = errors.length > 0 || warnings.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-gray-200 bg-white p-6"
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Milestone Sequencing</h3>
        <p className="text-sm text-gray-600">Track critical path dependencies</p>
      </div>

      {!hasAlerts ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 rounded-lg bg-green-50 border border-green-200 flex items-center gap-3"
        >
          <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-900">
              ✓ All milestones in optimal sequence
            </p>
            <p className="text-xs text-green-700 mt-1">
              No blocking dependencies detected across phases
            </p>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {/* Error Alerts */}
          <AnimatePresence>
            {errors.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="rounded-lg border-2 border-red-200 bg-red-50 p-4"
              >
                <button
                  onClick={() => setExpandedAlertId(expandedAlertId === alert.id ? null : alert.id)}
                  className="w-full text-left flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-red-900">{alert.ruleText}</p>
                      <p className="text-xs text-red-700 mt-1">
                        Phase {alert.currentPhase} → Blocked until Phase {alert.blockedUntilPhase}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 rounded bg-red-100 text-red-700 flex-shrink-0">
                    ERROR
                  </span>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Warning Alerts */}
          <AnimatePresence>
            {warnings.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-4"
              >
                <button
                  onClick={() => setExpandedAlertId(expandedAlertId === alert.id ? null : alert.id)}
                  className="w-full text-left flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-yellow-900">{alert.ruleText}</p>
                      <p className="text-xs text-yellow-700 mt-1">
                        Phase {alert.currentPhase} → Recommended before Phase {alert.blockedUntilPhase}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 rounded bg-yellow-100 text-yellow-700 flex-shrink-0">
                    WARNING
                  </span>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Summary */}
      {hasAlerts && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            <span className="font-semibold text-red-600">{errors.length} Critical Issue{errors.length !== 1 ? 's' : ''}</span>
            {errors.length > 0 && warnings.length > 0 && ' • '}
            {warnings.length > 0 && (
              <span className="font-semibold text-yellow-600">{warnings.length} Warning{warnings.length !== 1 ? 's' : ''}</span>
            )}
          </p>
        </div>
      )}
    </motion.div>
  )
}
