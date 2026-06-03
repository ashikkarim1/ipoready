'use client'

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { DilutionScenarioResult } from '@/lib/cap-table/dilution-scenarios'

interface ScenarioComparisonProps {
  scenarios: DilutionScenarioResult[]
  onSelectScenario?: (scenario: DilutionScenarioResult) => void
}

export function ScenarioComparison({ scenarios, onSelectScenario }: ScenarioComparisonProps) {
  // Get all unique shareholders
  const allShareholders = useMemo(() => {
    const shareholderMap = new Map()
    for (const scenario of scenarios) {
      for (const position of scenario.shareholderImpact) {
        if (!shareholderMap.has(position.shareholderId)) {
          shareholderMap.set(position.shareholderId, {
            id: position.shareholderId,
            name: position.shareholderName,
            type: position.shareholderType,
          })
        }
      }
    }
    return Array.from(shareholderMap.values())
  }, [scenarios])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 rounded-lg border border-gray-200 bg-white p-6"
    >
      <div>
        <h2 className="text-xl font-bold text-gray-900">Scenario Comparison</h2>
        <p className="mt-2 text-sm text-gray-600">Compare ownership percentages across scenarios</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Shareholder</th>
              {scenarios.map((scenario) => (
                <th key={scenario.scenarioId} className="px-4 py-3 text-center font-semibold text-gray-900">
                  <button
                    onClick={() => onSelectScenario?.(scenario)}
                    className="flex flex-col items-center gap-1 transition-colors hover:text-blue-600"
                  >
                    <span>{scenario.scenarioName}</span>
                    <span className="text-xs text-gray-600">Ownership %</span>
                  </button>
                </th>
              ))}
              {scenarios.length > 1 && (
                <th className="px-4 py-3 text-right font-semibold text-gray-900">Variance</th>
              )}
            </tr>
          </thead>
          <tbody>
            {allShareholders.map((shareholder) => {
              const ownerships = scenarios.map((scenario) => {
                const position = scenario.shareholderImpact.find(
                  (p) => p.shareholderId === shareholder.id
                )
                return position ? Number(position.postDilutionOwnership) : 0
              })

              const variance =
                scenarios.length > 1
                  ? Math.max(...ownerships) - Math.min(...ownerships)
                  : 0

              return (
                <tr key={shareholder.id} className="border-b border-gray-100 transition-colors hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{shareholder.name}</div>
                    <div className="text-xs text-gray-600">{shareholder.type}</div>
                  </td>
                  {ownerships.map((ownership, idx) => (
                    <td key={idx} className="px-4 py-3 text-center">
                      <span className="font-medium text-gray-900">{ownership.toFixed(2)}%</span>
                    </td>
                  ))}
                  {scenarios.length > 1 && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {variance > 0.1 && <TrendIcon variance={variance} />}
                        <span className="font-medium text-gray-900">{variance.toFixed(2)}%</span>
                      </div>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Summary Statistics */}
      <div className="grid gap-4 md:grid-cols-2">
        {scenarios.map((scenario) => {
          const avgDilution =
            scenario.shareholderImpact.length > 0
              ? scenario.shareholderImpact.reduce(
                  (sum, pos) => sum + Number(pos.dilutionPercentage),
                  0
                ) / scenario.shareholderImpact.length
              : 0

          return (
            <div key={scenario.scenarioId} className="rounded-lg bg-gray-50 p-4">
              <h3 className="font-semibold text-gray-900">{scenario.scenarioName}</h3>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg. Dilution:</span>
                  <span className="font-medium text-gray-900">{avgDilution.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total New Shares:</span>
                  <span className="font-medium text-gray-900">
                    {formatNumber(Number(scenario.postDilutionSnapshot.newSharesIssued))}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

// Trend Icon Component
function TrendIcon({ variance }: { variance: number }) {
  return variance > 2 ? (
    <div className="flex items-center gap-1">
      <ArrowUpRight className="h-4 w-4 text-orange-600" />
      <span className="text-xs text-orange-600">High variance</span>
    </div>
  ) : (
    <ArrowDownRight className="h-4 w-4 text-green-600" />
  )
}

// Utility function
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return Math.round(num).toString()
}
