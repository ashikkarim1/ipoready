'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExchangeCode, getExchangeConfig } from '@/lib/exchange-config'
import { generateListingReport, CapTableData, RuleViolation, GapAnalysis } from '@/lib/listing-rules'
import { InputForm } from './components/InputForm'
import { ComplianceIndicator } from './components/ComplianceIndicator'
import { SideBySideComparison } from './components/SideBySideComparison'

// ============================================================================
// Component: Validator Panel
// ============================================================================

interface ValidatorPanelProps {
  exchange: ExchangeCode
  metrics: {
    minFloatPct: number
    boardLotSize: number
    minShares: number
  }
  status: {
    floatOk: boolean
    boardLotOk: boolean
    sharesOk: boolean
  }
}

function ValidatorPanel({ exchange, metrics, status }: ValidatorPanelProps) {
  const config = getExchangeConfig(exchange)

  // Guard clause for undefined config
  if (!config) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-red-600 font-semibold">Unable to load exchange configuration</p>
      </div>
    )
  }

  const requirements = [
    {
      metric: 'Minimum Public Float',
      current: metrics.minFloatPct,
      required: config.minPublicFloat,
      unit: '%',
      status: status.floatOk,
      gap: metrics.minFloatPct - config.minPublicFloat,
    },
    {
      metric: 'Board Lot Size',
      current: metrics.boardLotSize,
      required: config.boardLot,
      unit: 'shares',
      status: status.boardLotOk,
      gap: metrics.boardLotSize - config.boardLot,
    },
    {
      metric: 'Minimum Shares',
      current: metrics.minShares,
      required: config.minShares,
      unit: 'shares',
      status: status.sharesOk,
      gap: metrics.minShares - config.minShares,
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
    >
      <h3 className="text-xl font-bold text-gray-900 mb-6">
        {config.name} - Current vs Required Metrics
      </h3>

      <div className="space-y-4">
        {requirements.map((req, idx) => {
          const percentage = Math.min(100, (req.current / req.required) * 100)
          const isCompliant = req.current >= req.required

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">{req.metric}</h4>
                  <div className="flex gap-4 text-sm text-gray-600 mt-1">
                    <span>Current: <span className="font-semibold">{req.current.toLocaleString()} {req.unit}</span></span>
                    <span>Required: <span className="font-semibold">{req.required.toLocaleString()} {req.unit}</span></span>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  isCompliant ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {isCompliant ? '✓ Met' : '✗ Gap'}
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className={`h-full ${isCompliant ? 'bg-green-500' : 'bg-orange-500'}`}
                />
              </div>

              {!isCompliant && (
                <p className="text-xs text-red-600 mt-2">
                  Gap: {Math.abs(req.gap).toLocaleString()} {req.unit} needed to meet requirement
                </p>
              )}
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

// ============================================================================
// Component: Gap Analysis Table
// ============================================================================

interface GapAnalysisTableProps {
  gaps: GapAnalysis[]
  violations: RuleViolation[]
}

function GapAnalysisTable({ gaps, violations }: GapAnalysisTableProps) {
  const allCritical = violations.filter(v => v.severity === 'critical')
  const allErrors = violations.filter(v => v.severity === 'error')
  const allWarnings = violations.filter(v => v.severity === 'warning')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
    >
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-900">Gap Analysis & Action Items</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Metric</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Current</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Required</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Gap</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Suggestion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {gaps.map((gap, idx) => {
              const isCompliant = gap.status === 'compliant'
              const statusColor = isCompliant ? 'bg-green-50' : gap.status === 'warning' ? 'bg-yellow-50' : 'bg-red-50'
              const badgeColor = isCompliant ? 'bg-green-100 text-green-800' : gap.status === 'warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'

              return (
                <motion.tr
                  key={idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`hover:shadow-sm transition-all ${statusColor}`}
                >
                  <td className="px-6 py-4 font-semibold text-gray-900">{gap.metric}</td>
                  <td className="px-6 py-4 text-center text-gray-700">{gap.current.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center text-gray-700">{gap.required.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-semibold text-gray-900">
                      {gap.gap > 0 ? '+' : ''}{gap.gap.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeColor}`}>
                      {gap.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{gap.suggestion || 'On track'}</td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Summary Stats */}
      <div className="bg-gray-50 p-6 border-t border-gray-200 grid grid-cols-3 gap-6">
        <div>
          <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Critical Issues</p>
          <p className="text-3xl font-bold text-red-600">{allCritical.length}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Errors</p>
          <p className="text-3xl font-bold text-orange-600">{allErrors.length}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Warnings</p>
          <p className="text-3xl font-bold text-yellow-600">{allWarnings.length}</p>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================================================
// Component: Exchange Selector
// ============================================================================

interface ExchangeSelectorProps {
  selectedExchanges: ExchangeCode[]
  onExchangeSelect: (exchange: ExchangeCode) => void
  onExchangeRemove: (exchange: ExchangeCode) => void
}

function ExchangeSelector({ selectedExchanges, onExchangeSelect, onExchangeRemove }: ExchangeSelectorProps) {
  const allExchanges: ExchangeCode[] = ['tsx', 'tsxv', 'nasdaq', 'nyse', 'cse']

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
    >
      <h3 className="text-xl font-bold text-gray-900 mb-4">Select Exchanges to Compare</h3>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {allExchanges.map(exchange => {
          const config = getExchangeConfig(exchange)
          if (!config) return null
          const isSelected = selectedExchanges.includes(exchange)

          return (
            <motion.button
              key={exchange}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => isSelected ? onExchangeRemove(exchange) : onExchangeSelect(exchange)}
              className={`p-4 rounded-lg font-semibold transition-all border-2 ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-700'
                  : 'bg-gray-50 text-gray-900 border-gray-200 hover:border-blue-400'
              }`}
            >
              <div className="text-sm">{exchange.toUpperCase()}</div>
              <div className="text-xs opacity-75 mt-1">{config.country}</div>
            </motion.button>
          )
        })}
      </div>

      {selectedExchanges.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">{selectedExchanges.length}</span> exchange(es) selected
            {selectedExchanges.length === 2 && ' - Ready for comparison'}
          </p>
        </div>
      )}
    </motion.div>
  )
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function ListingRulesPage() {
  const [selectedExchanges, setSelectedExchanges] = useState<ExchangeCode[]>(['tsx', 'nasdaq'])
  const [formData, setFormData] = useState<CapTableData>({
    companyName: 'TechCorp Inc.',
    totalAuthorizedShares: 50000000,
    totalIssuedShares: 28000000,
    publicShares: 7000000,
    publicSharePercentage: 25,
    minSharePrice: 3.5,
    proposedOfferingSize: 75,
    proposedSharesOffering: 5000000,
    proposedSharePrice: 15.0,
    estimatedPublicFloatCAD: 105,
    estimatedPublicFloatUSD: 78,
    hasAuditCommittee: true,
    hasNominationCommittee: true,
    hasCompensationCommittee: true,
    hasAuditedFinancials: true,
    yearsOfFinancialHistory: 2,
    completedResolutions: ['approval_ipo', 'authority_directors', 'approval_prospectus'],
    completedConsents: ['board_approval', 'independent_audit'],
  })

  const [activeExchange, setActiveExchange] = useState<ExchangeCode>('tsx')
  const [isLoading, setIsLoading] = useState(false)
  const [reports, setReports] = useState<Record<ExchangeCode, ReturnType<typeof generateListingReport> | null>>({
    tsx: null,
    tsxv: null,
    nasdaq: null,
    nyse: null,
    cse: null,
    cboe: null,
    otc: null,
  })

  // Generate reports for all selected exchanges
  useEffect(() => {
    const generateReports = () => {
      setIsLoading(true)
      const newReports = { ...reports }
      selectedExchanges.forEach(exchange => {
        newReports[exchange] = generateListingReport(exchange, formData)
      })
      setReports(newReports)
      setIsLoading(false)
    }

    generateReports()
  }, [formData])

  const handleFieldChange = (field: keyof CapTableData, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Reports are auto-generated via useEffect
  }

  const currentReport = reports[activeExchange]

  return (
    <div className="space-y-8 pb-12" suppressHydrationWarning>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-8"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Listing Rules Compliance</h1>
        <p className="text-lg text-gray-600">
          Validate your company's readiness across multiple exchanges. Compare requirements and identify gaps.
        </p>
      </motion.div>

      {/* Input Form Section */}
      <div>
        <InputForm
          formData={formData}
          onFieldChange={handleFieldChange}
          onSubmit={handleFormSubmit}
          isLoading={isLoading}
        />
      </div>

      {/* Exchange Selector */}
      <ExchangeSelector
        selectedExchanges={selectedExchanges}
        onExchangeSelect={(exchange) => setSelectedExchanges(prev => [...new Set([...prev, exchange])])}
        onExchangeRemove={(exchange) => setSelectedExchanges(prev => prev.filter(e => e !== exchange))}
      />

      {/* Tabs for Active Exchange */}
      {selectedExchanges.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
        >
          <div className="flex overflow-x-auto gap-2 mb-6 -mx-6 px-6">
            {selectedExchanges.map(exchange => {
              const config = getExchangeConfig(exchange)
              const isActive = exchange === activeExchange

              return (
                <motion.button
                  key={exchange}
                  onClick={() => setActiveExchange(exchange)}
                  className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                  whileHover={{ scale: 1.05 }}
                >
                  {exchange.toUpperCase()}
                </motion.button>
              )
            })}
          </div>

          {/* Content for active exchange */}
          <AnimatePresence mode="wait">
            {currentReport && (
              <motion.div
                key={activeExchange}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Compliance Indicator */}
                {getExchangeConfig(activeExchange) && (
                  <ComplianceIndicator
                    score={currentReport.complianceScore}
                    status={currentReport.overallStatus}
                    config={getExchangeConfig(activeExchange)!}
                  />
                )}

                {/* Validator Panel */}
                {(() => {
                  const config = getExchangeConfig(activeExchange)
                  if (!config) return null
                  return (
                    <ValidatorPanel
                      exchange={activeExchange}
                      metrics={{
                        minFloatPct: formData.publicSharePercentage,
                        boardLotSize: 100,
                        minShares: formData.publicShares,
                      }}
                      status={{
                        floatOk: formData.publicSharePercentage >= config.minPublicFloat,
                        boardLotOk: true,
                        sharesOk: formData.publicShares >= config.minShares,
                      }}
                    />
                  )
                })()}

                {/* Gap Analysis Table */}
                <GapAnalysisTable
                  gaps={currentReport.gaps}
                  violations={currentReport.violations}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Side-by-Side Comparison */}
      {selectedExchanges.length >= 2 && reports[selectedExchanges[0]] && reports[selectedExchanges[1]] && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <SideBySideComparison
            exchange1={selectedExchanges[0]}
            report1={reports[selectedExchanges[0]]!}
            exchange2={selectedExchanges[1]}
            report2={reports[selectedExchanges[1]]!}
          />
        </motion.div>
      )}
    </div>
  )
}
