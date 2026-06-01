'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react'
import { useState } from 'react'

interface PaceReadinessFactorsCardProps {
  cashRunwayMonths: number
  teamSize: number
  cfoHired: boolean
  boardSize: number
  auditorSelected: boolean
  marketConditions?: string
}

export function PaceReadinessFactorsCard({
  cashRunwayMonths,
  teamSize,
  cfoHired,
  boardSize,
  auditorSelected,
  marketConditions = 'Stable',
}: PaceReadinessFactorsCardProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  // Cash runway color coding
  const getCashRunwayColor = () => {
    if (cashRunwayMonths >= 12) return { bg: '#F0FDF4', border: '#BBF7D0', text: '#15803D', label: 'Healthy' }
    if (cashRunwayMonths >= 6) return { bg: '#FFFBEB', border: '#FCD34D', text: '#D97706', label: 'Caution' }
    return { bg: '#FEF2F2', border: '#FECACA', text: '#DC2626', label: 'Critical' }
  }

  const cashColor = getCashRunwayColor()

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-gray-200 bg-white p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Readiness Factors</h3>

      {/* Cash Runway Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">💰 Cash Runway</label>
          <span className="text-xs font-semibold px-2 py-1 rounded" style={{ background: cashColor.bg, color: cashColor.text }}>
            {cashColor.label}
          </span>
        </div>
        <div
          className="p-4 rounded-lg border-2"
          style={{ background: cashColor.bg, borderColor: cashColor.border }}
        >
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold" style={{ color: cashColor.text }}>
              {cashRunwayMonths}
            </span>
            <span style={{ color: cashColor.text }} className="text-sm font-medium">
              months remaining
            </span>
          </div>
          <p className="text-xs mt-2 opacity-75" style={{ color: cashColor.text }}>
            {cashRunwayMonths >= 12 && 'Comfortable timeline for IPO execution'}
            {cashRunwayMonths >= 6 && cashRunwayMonths < 12 && 'Monitor closely; consider accelerating milestones'}
            {cashRunwayMonths < 6 && 'Urgent: accelerated execution required'}
          </p>
        </div>
      </div>

      {/* Team Hiring Progress Section */}
      <div className="mb-6">
        <button
          onClick={() => setExpandedSection(expandedSection === 'team' ? null : 'team')}
          className="w-full text-left flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <h4 className="text-sm font-medium text-gray-700">👥 Team Hiring Progress</h4>
          <span className="text-gray-400">{expandedSection === 'team' ? '−' : '+'}</span>
        </button>

        {expandedSection === 'team' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 px-3 py-2"
          >
            {/* CFO Hired */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div className="flex items-center gap-3">
                {cfoHired ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                )}
                <span className="text-sm font-medium text-gray-700">CFO Hired</span>
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded ${
                cfoHired
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {cfoHired ? '✓ Complete' : 'Pending'}
              </span>
            </div>

            {/* Board Size */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div className="flex items-center gap-3">
                {boardSize >= 5 ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                )}
                <div>
                  <span className="text-sm font-medium text-gray-700">Board Size</span>
                  <p className="text-xs text-gray-500">Target: ≥ 5 directors</p>
                </div>
              </div>
              <span className="text-sm font-bold text-gray-900">{boardSize}</span>
            </div>

            {/* Auditor Selected */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div className="flex items-center gap-3">
                {auditorSelected ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                )}
                <span className="text-sm font-medium text-gray-700">Auditor Selected</span>
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded ${
                auditorSelected
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {auditorSelected ? '✓ Selected' : 'Not selected'}
              </span>
            </div>

            {/* Team Size */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <div>
                  <span className="text-sm font-medium text-gray-700">Team Size</span>
                  <p className="text-xs text-gray-500">Current headcount</p>
                </div>
              </div>
              <span className="text-sm font-bold text-gray-900">{teamSize} people</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Market Conditions */}
      <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-900">Market Conditions</p>
            <p className="text-xs text-blue-700 mt-1">Capital markets environment</p>
          </div>
          <span className="text-sm font-bold text-blue-900">{marketConditions}</span>
        </div>
      </div>
    </motion.div>
  )
}
