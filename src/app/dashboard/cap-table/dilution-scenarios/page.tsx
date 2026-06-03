'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowDownRight,
  ArrowUpRight,
  Download,
  Filter,
  Plus,
  TrendingDown,
  Zap,
  Shield,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import {
  DilutionScenarioEngine,
  DilutionScenarioInput,
  DilutionScenarioResult,
  CapTableSnapshot,
} from '@/lib/cap-table/dilution-scenarios'

interface PresetScenarios {
  base: DilutionScenarioResult
  optimistic: DilutionScenarioResult
  conservative: DilutionScenarioResult
}

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.1,
      duration: 0.5,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function DilutionScenariosPage() {
  const [presetScenarios, setPresetScenarios] = useState<PresetScenarios | null>(null)
  const [selectedScenario, setSelectedScenario] = useState<DilutionScenarioResult | null>(null)
  const [customScenario, setCustomScenario] = useState<DilutionScenarioInput | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exportLoading, setExportLoading] = useState(false)
  const [showCustomForm, setShowCustomForm] = useState(false)

  // Fetch preset scenarios on mount
  useEffect(() => {
    const fetchPresets = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/cap-table/dilution/presets')
        if (!response.ok) throw new Error('Failed to fetch scenarios')
        const data: PresetScenarios = await response.json()
        setPresetScenarios(data)
        setSelectedScenario(data.base)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load scenarios')
      } finally {
        setLoading(false)
      }
    }

    fetchPresets()
  }, [])

  // Handle custom scenario submission
  const handleCustomScenarioSubmit = useCallback(
    async (input: DilutionScenarioInput) => {
      try {
        setLoading(true)
        const response = await fetch('/api/cap-table/dilution', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input }),
        })
        if (!response.ok) throw new Error('Failed to calculate scenario')
        const result: DilutionScenarioResult = await response.json()
        setSelectedScenario(result)
        setShowCustomForm(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to calculate scenario')
      } finally {
        setLoading(false)
      }
    },
    []
  )

  // Export to CSV
  const handleExport = useCallback(async () => {
    if (!selectedScenario) return
    try {
      setExportLoading(true)
      const response = await fetch('/api/cap-table/dilution/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: selectedScenario,
          comparisonScenarios: presetScenarios ? Object.values(presetScenarios) : [],
        }),
      })
      if (!response.ok) throw new Error('Failed to export CSV')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `dilution-scenario-${Date.now()}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export CSV')
    } finally {
      setExportLoading(false)
    }
  }, [selectedScenario, presetScenarios])

  if (loading && !presetScenarios) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading cap table scenarios...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 p-6"
      suppressHydrationWarning
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dilution Scenarios</h1>
          <p className="mt-2 text-gray-600">
            Analyze share ownership changes from warrant exercises, financing, and vesting
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCustomForm(!showCustomForm)}
            className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 label font-medium text-gray-900 transition-colors hover:bg-gray-200"
          >
            <Plus className="h-4 w-4" />
            Custom Scenario
          </button>
          <button
            onClick={handleExport}
            disabled={!selectedScenario || exportLoading}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 label font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {exportLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Export CSV
          </button>
        </div>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          variants={itemVariants}
          className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-900"
        >
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>{error}</p>
        </motion.div>
      )}

      {/* Preset Scenarios */}
      {presetScenarios && (
        <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-3">
          <ScenarioCard
            title="Base Case"
            description="Typical IPO scenario"
            icon={<Shield className="h-5 w-5" />}
            isSelected={selectedScenario?.scenarioType === 'base'}
            onClick={() => setSelectedScenario(presetScenarios.base)}
            scenario={presetScenarios.base}
          />
          <ScenarioCard
            title="Optimistic Case"
            description="High warrant exercise, strong growth"
            icon={<TrendingDown className="h-5 w-5" />}
            isSelected={selectedScenario?.scenarioType === 'optimistic'}
            onClick={() => setSelectedScenario(presetScenarios.optimistic)}
            scenario={presetScenarios.optimistic}
          />
          <ScenarioCard
            title="Conservative Case"
            description="Low warrant exercise, moderate growth"
            icon={<AlertCircle className="h-5 w-5" />}
            isSelected={selectedScenario?.scenarioType === 'conservative'}
            onClick={() => setSelectedScenario(presetScenarios.conservative)}
            scenario={presetScenarios.conservative}
          />
        </motion.div>
      )}

      {/* Custom Scenario Form */}
      <AnimatePresence>
        {showCustomForm && (
          <motion.div variants={itemVariants} className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 h4 font-semibold text-gray-900">Create Custom Scenario</h3>
            <CustomScenarioForm onSubmit={handleCustomScenarioSubmit} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scenario Details */}
      {selectedScenario && (
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 h4 font-bold text-gray-900">{selectedScenario.scenarioName}</h2>

            {/* Summary Metrics */}
            <div className="mb-6 grid gap-4 md:grid-cols-4">
              <MetricCard
                label="Current Shares"
                value={formatNumber(Number(selectedScenario.currentSnapshot.totalShares))}
              />
              <MetricCard
                label="Post-Dilution Shares"
                value={formatNumber(Number(selectedScenario.postDilutionSnapshot.totalShares))}
              />
              <MetricCard
                label="New Shares Issued"
                value={formatNumber(Number(selectedScenario.postDilutionSnapshot.newSharesIssued))}
              />
              <MetricCard
                label="Dilution Impact"
                value={`${((Number(selectedScenario.postDilutionSnapshot.newSharesIssued) / Number(selectedScenario.postDilutionSnapshot.totalShares)) * 100).toFixed(1)}%`}
                highlight
              />
            </div>

            {/* Assumptions */}
            <div className="mb-6 rounded-lg bg-gray-50 p-4">
              <h3 className="mb-3 label font-semibold text-gray-900">Scenario Assumptions</h3>
              <div className="grid gap-3 md:grid-cols-2">
                {selectedScenario.assumptions.warrantsExercisedPercent && (
                  <div className="body-sm">
                    <span className="text-gray-600">Warrants Exercised:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {selectedScenario.assumptions.warrantsExercisedPercent}%
                    </span>
                  </div>
                )}
                {selectedScenario.assumptions.employeeOptionVestingShares && (
                  <div className="body-sm">
                    <span className="text-gray-600">Employee Options Vesting:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {formatNumber(selectedScenario.assumptions.employeeOptionVestingShares)}
                    </span>
                  </div>
                )}
                {selectedScenario.assumptions.newFinancingAmount && (
                  <div className="body-sm">
                    <span className="text-gray-600">New Financing:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      ${formatNumber(selectedScenario.assumptions.newFinancingAmount / 1000000)}M
                    </span>
                  </div>
                )}
                {selectedScenario.assumptions.projectedValuation && (
                  <div className="body-sm">
                    <span className="text-gray-600">Projected Valuation:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      ${formatNumber(selectedScenario.assumptions.projectedValuation / 1000000)}M
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Shareholder Impact Table */}
            <div>
              <h3 className="mb-3 label font-semibold text-gray-900">Shareholder Impact</h3>
              <div className="overflow-x-auto">
                <table className="w-full body-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-2 text-left font-medium text-gray-900">Shareholder</th>
                      <th className="px-4 py-2 text-right font-medium text-gray-900">Current Ownership %</th>
                      <th className="px-4 py-2 text-right font-medium text-gray-900">Post-Dilution %</th>
                      <th className="px-4 py-2 text-right font-medium text-gray-900">Dilution Impact %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedScenario.shareholderImpact.map((position) => {
                      const dilution = Number(position.dilutionPercentage)
                      return (
                        <tr key={position.shareholderId} className="border-b border-gray-100">
                          <td className="px-4 py-3 text-gray-900">
                            <div className="font-medium">{position.shareholderName}</div>
                            <div className="caption-sm text-gray-600">{position.shareClass}</div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {Number(position.currentOwnership).toFixed(2)}%
                          </td>
                          <td className="px-4 py-3 text-right">
                            {Number(position.postDilutionOwnership).toFixed(2)}%
                          </td>
                          <td className="flex items-center justify-end gap-1 px-4 py-3">
                            {dilution > 0 ? (
                              <>
                                <ArrowDownRight className="h-4 w-4 text-red-600" />
                                <span className="text-red-600">{dilution.toFixed(2)}%</span>
                              </>
                            ) : (
                              <span className="text-gray-600">-</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

// Scenario Card Component
interface ScenarioCardProps {
  title: string
  description: string
  icon: React.ReactNode
  isSelected: boolean
  onClick: () => void
  scenario: DilutionScenarioResult
}

function ScenarioCard({
  title,
  description,
  icon,
  isSelected,
  onClick,
  scenario,
}: ScenarioCardProps) {
  const dilutionPercent =
    (Number(scenario.postDilutionSnapshot.newSharesIssued) /
      Number(scenario.postDilutionSnapshot.totalShares)) *
    100

  return (
    <motion.button
      onClick={onClick}
      className={`rounded-lg border-2 p-4 text-left transition-all ${
        isSelected
          ? 'border-blue-600 bg-blue-50'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start gap-3">
        <div className={isSelected ? 'text-blue-600' : 'text-gray-600'}>{icon}</div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="mt-1 caption-sm text-gray-600">{description}</p>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="h4 font-bold text-gray-900">{dilutionPercent.toFixed(1)}%</span>
            <span className="caption-sm text-gray-600">dilution</span>
          </div>
        </div>
      </div>
    </motion.button>
  )
}

// Metric Card Component
interface MetricCardProps {
  label: string
  value: string
  highlight?: boolean
}

function MetricCard({ label, value, highlight }: MetricCardProps) {
  return (
    <div className={`rounded-lg p-4 ${highlight ? 'bg-blue-50' : 'bg-gray-50'}`}>
      <p className="caption-sm text-gray-600">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${highlight ? 'text-blue-600' : 'text-gray-900'}`}>
        {value}
      </p>
    </div>
  )
}

// Custom Scenario Form Component
interface CustomScenarioFormProps {
  onSubmit: (input: DilutionScenarioInput) => void
}

function CustomScenarioForm({ onSubmit }: CustomScenarioFormProps) {
  const [formData, setFormData] = useState<DilutionScenarioInput>({
    scenarioName: 'Custom Scenario',
    scenarioType: 'custom',
    warrantsExercisedPercent: 50,
    employeeOptionVestingShares: 1000000,
    newFinancingAmount: 50000000,
    projectedValuation: 500000000,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <FormInput
          label="Scenario Name"
          value={formData.scenarioName}
          onChange={(value) => setFormData({ ...formData, scenarioName: value })}
        />
        <FormInput
          label="Warrants Exercised (%)"
          type="number"
          value={formData.warrantsExercisedPercent?.toString() || ''}
          onChange={(value) =>
            setFormData({ ...formData, warrantsExercisedPercent: Number(value) })
          }
        />
        <FormInput
          label="Employee Options Vesting"
          type="number"
          value={formData.employeeOptionVestingShares?.toString() || ''}
          onChange={(value) =>
            setFormData({ ...formData, employeeOptionVestingShares: Number(value) })
          }
        />
        <FormInput
          label="New Financing Amount ($)"
          type="number"
          value={formData.newFinancingAmount?.toString() || ''}
          onChange={(value) => setFormData({ ...formData, newFinancingAmount: Number(value) })}
        />
        <FormInput
          label="Projected Valuation ($)"
          type="number"
          value={formData.projectedValuation?.toString() || ''}
          onChange={(value) => setFormData({ ...formData, projectedValuation: Number(value) })}
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-lg bg-blue-600 px-4 py-2 label font-medium text-white transition-colors hover:bg-blue-700"
      >
        Calculate Scenario
      </button>
    </form>
  )
}

// Form Input Component
interface FormInputProps {
  label: string
  type?: string
  value: string
  onChange: (value: string) => void
}

function FormInput({ label, type = 'text', value, onChange }: FormInputProps) {
  return (
    <div>
      <label className="label font-medium text-gray-900">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 body-sm transition-colors focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
      />
    </div>
  )
}

// Utility function to format large numbers
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return Math.round(num).toString()
}
