'use client'

import { motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'

interface PhaseDocReadiness {
  phase: number
  phaseName: string
  requiredDocCount: number
  completionPercentage: number
  hasStaleDocuments: boolean
}

interface PaceDocumentReadinessCardProps {
  overallScore: number // 0-100
  phases: PhaseDocReadiness[]
}

export function PaceDocumentReadinessCard({
  overallScore,
  phases,
}: PaceDocumentReadinessCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-gray-200 bg-white p-6"
    >
      {/* Overall Score Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Document Readiness Score</h3>
        <div className="flex flex-col items-center justify-center p-8 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
          <p className="text-sm font-medium text-blue-700 mb-2">Overall Readiness</p>
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-bold text-blue-900">{overallScore}</span>
            <span className="text-2xl font-semibold text-blue-700">/100</span>
          </div>
          <div className="w-full mt-6 bg-blue-200 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${overallScore}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-blue-600 rounded-full"
            />
          </div>
          <p className="text-xs text-blue-700 mt-3 text-center">
            {overallScore >= 80 && 'Excellent - Ready for next phase'}
            {overallScore >= 60 && overallScore < 80 && 'Good - On track for IPO readiness'}
            {overallScore >= 40 && overallScore < 60 && 'Moderate - Requires attention on critical docs'}
            {overallScore < 40 && 'Needs improvement - Prioritize core documents'}
          </p>
        </div>
      </div>

      {/* Phase Breakdown Table */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-4">Phase-by-Phase Breakdown</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Phase</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Required Docs</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Completion</th>
              </tr>
            </thead>
            <tbody>
              {phases.map((phase, idx) => (
                <tr
                  key={phase.phase}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  {/* Phase Column */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">Phase {phase.phase}</span>
                      <span className="text-xs text-gray-500">({phase.phaseName})</span>
                    </div>
                  </td>

                  {/* Required Docs Column */}
                  <td className="py-3 px-4">
                    <span className="text-gray-700 font-medium">
                      {phase.requiredDocCount} docs
                    </span>
                  </td>

                  {/* Completion Column with Progress Bar */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {/* Progress Bar */}
                      <div className="flex-1 max-w-xs">
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${phase.completionPercentage}%` }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className={`h-full rounded-full ${
                              phase.completionPercentage === 100
                                ? 'bg-green-500'
                                : phase.completionPercentage >= 75
                                ? 'bg-blue-500'
                                : phase.completionPercentage >= 50
                                ? 'bg-yellow-500'
                                : 'bg-orange-500'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Percentage Text */}
                      <span className="text-sm font-semibold text-gray-900 min-w-fit">
                        {phase.completionPercentage}%
                      </span>

                      {/* Stale Docs Badge */}
                      {phase.hasStaleDocuments && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded bg-orange-100 border border-orange-200">
                          <AlertCircle className="w-3 h-3 text-orange-600" />
                          <span className="text-xs font-semibold text-orange-700">Refresh needed</span>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-xs text-gray-600">Complete (100%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-xs text-gray-600">On track (75-99%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-xs text-gray-600">In progress (50-74%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-xs text-gray-600">At risk (&lt;50%)</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
