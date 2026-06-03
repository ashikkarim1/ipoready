'use client'

import { useState } from 'react'

export interface SequencingAlert {
  severity: 'error' | 'warning'
  taskId: string
  title: string
  description: string
  daysBlocking: number
  remediationSteps: string[]
}

interface SequencingAlertsCardProps {
  alerts: SequencingAlert[]
}

export function SequencingAlertsCard({ alerts }: SequencingAlertsCardProps) {
  const [expandedAlerts, setExpandedAlerts] = useState<Set<string>>(new Set())

  const toggleExpanded = (taskId: string) => {
    const newExpanded = new Set(expandedAlerts)
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId)
    } else {
      newExpanded.add(taskId)
    }
    setExpandedAlerts(newExpanded)
  }

  if (alerts.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 p-6 bg-green-50 border-green-200">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✓</span>
          <div>
            <h3 className="font-semibold text-green-900">No Sequencing Issues</h3>
            <p className="body-sm text-green-700">Your IPO workflow is on track</p>
          </div>
        </div>
      </div>
    )
  }

  const errorCount = alerts.filter((a) => a.severity === 'error').length
  const warningCount = alerts.filter((a) => a.severity === 'warning').length

  return (
    <div className="rounded-lg border border-gray-200 p-6 bg-white">
      <div className="mb-4">
        <h3 className="h4 font-semibold text-gray-900 mb-2">Sequencing Alerts</h3>
        <div className="flex gap-4 body-sm">
          {errorCount > 0 && (
            <span className="text-red-700 font-medium">
              🔴 {errorCount} Critical {errorCount === 1 ? 'Issue' : 'Issues'}
            </span>
          )}
          {warningCount > 0 && (
            <span className="text-yellow-700 font-medium">
              🟡 {warningCount} Warning{warningCount === 1 ? '' : 's'}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.taskId}
            className={`rounded-lg border p-4 ${
              alert.severity === 'error'
                ? 'bg-red-50 border-red-200'
                : 'bg-yellow-50 border-yellow-200'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={alert.severity === 'error' ? '🔴' : '🟡'} />
                  <h4 className={`font-semibold ${
                    alert.severity === 'error' ? 'text-red-900' : 'text-yellow-900'
                  }`}>
                    {alert.title}
                  </h4>
                </div>
                <p className={`text-sm ${
                  alert.severity === 'error' ? 'text-red-800' : 'text-yellow-800'
                }`}>
                  {alert.description}
                </p>
                <p className={`text-xs mt-1 ${
                  alert.severity === 'error' ? 'text-red-700 font-medium' : 'text-yellow-700 font-medium'
                }`}>
                  Blocking {alert.daysBlocking} downstream {alert.daysBlocking === 1 ? 'task' : 'tasks'}
                </p>
              </div>

              <button
                onClick={() => toggleExpanded(alert.taskId)}
                className="text-blue-600 hover:text-blue-700 font-medium body-sm whitespace-nowrap"
              >
                {expandedAlerts.has(alert.taskId) ? 'Hide' : 'View Task'}
              </button>
            </div>

            {expandedAlerts.has(alert.taskId) && alert.remediationSteps.length > 0 && (
              <div className={`mt-3 pt-3 border-t ${
                alert.severity === 'error' ? 'border-red-200' : 'border-yellow-200'
              }`}>
                <p className={`text-xs font-semibold mb-2 ${
                  alert.severity === 'error' ? 'text-red-900' : 'text-yellow-900'
                }`}>
                  Remediation Steps:
                </p>
                <ol className="space-y-1">
                  {alert.remediationSteps.map((step, idx) => (
                    <li
                      key={idx}
                      className={`text-sm ${
                        alert.severity === 'error' ? 'text-red-800' : 'text-yellow-800'
                      }`}
                    >
                      <span className="font-medium">{idx + 1}.</span> {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
