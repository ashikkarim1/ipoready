'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ExchangeCode, getExchangeConfig, getAllExchangeCodes } from '@/lib/exchange-config'
import { useListingRulesForm, useListingRules } from '@/lib/hooks/useListingRules'
import { InputForm } from './components/InputForm'
import { ComplianceIndicator, ComplianceBadge, ComplianceProgressBar } from './components/ComplianceIndicator'
import { SideBySideComparison } from './components/SideBySideComparison'
import { ListingReadinessReport } from '@/lib/listing-rules'

const EXCHANGES: ExchangeCode[] = ['tsx', 'tsxv', 'nasdaq', 'nyse', 'cse']

export default function ListingRulesPageEnhanced() {
  const [selectedExchange, setSelectedExchange] = useState<ExchangeCode>('tsx')
  const [compareExchanges, setCompareExchanges] = useState<ExchangeCode[]>(['nasdaq'])
  const [viewMode, setViewMode] = useState<'single' | 'comparison'>('single')

  const { formData, updateField, updateFields, reset: resetForm } = useListingRulesForm()
  const { report, comparisonReports, loading, error, validate, reset } = useListingRules()

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const allExchanges =
      viewMode === 'comparison' ? [selectedExchange, ...compareExchanges] : [selectedExchange]
    await validate(formData, selectedExchange, compareExchanges.length > 0 ? compareExchanges : undefined)
  }

  const toggleCompareExchange = (code: ExchangeCode) => {
    setCompareExchanges((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Listing Agreement Rules Engine
          </h1>
          <p className="text-gray-600 text-lg">
            Validate your cap table against exchange-specific listing requirements
          </p>
        </motion.div>

        {/* Input Form */}
        <div className="mb-8">
          <InputForm
            formData={formData}
            onFieldChange={updateField}
            onSubmit={handleFormSubmit}
            isLoading={loading}
          />
        </div>

        {/* View Mode Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Mode</h3>
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setViewMode('single')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                viewMode === 'single'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Single Exchange
            </button>
            <button
              onClick={() => setViewMode('comparison')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                viewMode === 'comparison'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Compare Exchanges
            </button>
          </div>

          {/* Exchange Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Primary Exchange
            </label>
            <select
              value={selectedExchange}
              onChange={(e) => setSelectedExchange(e.target.value as ExchangeCode)}
              className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              {EXCHANGES.map((code) => {
                const config = getExchangeConfig(code)
                return (
                  <option key={code} value={code}>
                    {config.name}
                  </option>
                )
              })}
            </select>
          </div>

          {/* Comparison Exchanges */}
          {viewMode === 'comparison' && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Compare Against
              </label>
              <div className="flex flex-wrap gap-2">
                {EXCHANGES.filter((code) => code !== selectedExchange).map((code) => {
                  const config = getExchangeConfig(code)
                  const isSelected = compareExchanges.includes(code)
                  return (
                    <button
                      key={code}
                      onClick={() => toggleCompareExchange(code)}
                      className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {config.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </motion.div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-300 rounded-lg p-4 mb-8"
          >
            <p className="text-red-800 font-semibold">Error: {error}</p>
          </motion.div>
        )}

        {/* Results */}
        {report && (
          <div className="space-y-8">
            {/* Single Exchange View */}
            {viewMode === 'single' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <div className={`p-8 border-l-4 ${
                  report.overallStatus === 'ready'
                    ? 'border-green-500 bg-green-50'
                    : report.overallStatus === 'at-risk'
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-red-500 bg-red-50'
                }`}>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900">
                        {report.exchangeName}
                      </h2>
                      <div className="mt-2">
                        <ComplianceBadge status={report.overallStatus} />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-5xl font-bold text-gray-900">
                        {report.complianceScore}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">Compliance Score</p>
                    </div>
                  </div>

                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white bg-opacity-60 rounded p-4">
                      <p className="text-xs text-gray-600 uppercase font-semibold">Total Issues</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {report.summary.totalViolations}
                      </p>
                    </div>
                    <div className="bg-white bg-opacity-60 rounded p-4">
                      <p className="text-xs text-red-600 uppercase font-semibold">Critical</p>
                      <p className="text-2xl font-bold text-red-600">
                        {report.summary.criticalViolations}
                      </p>
                    </div>
                    <div className="bg-white bg-opacity-60 rounded p-4">
                      <p className="text-xs text-orange-600 uppercase font-semibold">Errors</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {report.summary.errorViolations}
                      </p>
                    </div>
                    <div className="bg-white bg-opacity-60 rounded p-4">
                      <p className="text-xs text-yellow-600 uppercase font-semibold">Warnings</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {report.summary.warningViolations}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Gap Analysis */}
                <div className="p-8 border-t border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Gap Analysis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {report.gaps.map((gap) => (
                      <ComplianceProgressBar
                        key={gap.metric}
                        current={gap.current}
                        required={gap.required}
                        label={gap.metric}
                      />
                    ))}
                  </div>
                </div>

                {/* Violations */}
                {report.violations.length > 0 && (
                  <div className="p-8 border-t border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Violations & Issues
                    </h3>
                    <div className="space-y-4">
                      {report.violations
                        .filter((v) => v.severity !== 'info')
                        .map((violation) => (
                          <motion.div
                            key={violation.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`p-4 rounded-lg border-l-4 ${
                              violation.severity === 'critical'
                                ? 'border-red-500 bg-red-50'
                                : violation.severity === 'error'
                                ? 'border-orange-500 bg-orange-50'
                                : 'border-yellow-500 bg-yellow-50'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <ComplianceBadge
                                status={
                                  violation.severity === 'critical' ? 'critical' : 'warning'
                                }
                              />
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">
                                  {violation.rule}
                                </h4>
                                <p className="text-sm text-gray-700 mt-1">
                                  {violation.message}
                                </p>
                                {violation.suggestion && (
                                  <p className="text-xs text-gray-600 mt-2 italic">
                                    Suggestion: {violation.suggestion}
                                  </p>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Comparison View */}
            {viewMode === 'comparison' &&
              comparisonReports &&
              compareExchanges.map((compExchange) => {
                const compReport = comparisonReports.find(
                  (r) => r.exchange === compExchange
                )
                return (
                  compReport && (
                    <SideBySideComparison
                      key={`${selectedExchange}-vs-${compExchange}`}
                      exchange1={selectedExchange}
                      report1={report}
                      exchange2={compExchange}
                      report2={compReport}
                    />
                  )
                )
              })}
          </div>
        )}

        {/* Empty State */}
        {!report && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-lg p-12 text-center"
          >
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-gray-600 text-lg">
              Fill out the form above and click "Validate Against Exchanges" to begin
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
