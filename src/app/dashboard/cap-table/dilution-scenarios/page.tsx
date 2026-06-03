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
  TrendingUp,
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
      staggerChildren: 0.06,
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
      <div className="flex h-screen items-center justify-center" style={{ background: '#F7F6F4' }}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#E8312A' }} />
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
      style={{ background: '#F7F6F4', minHeight: '100vh' }}
      suppressHydrationWarning
    >
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto" style={{ paddingTop: '4.5rem', paddingBottom: '3rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-center gap-2"
            style={{ marginBottom: '1.5rem' }}
          >
            <span
              className="pill text-xs font-bold uppercase tracking-wider"
              style={{ background: '#FDECEB', color: '#E8312A' }}
            >
              <TrendingUp className="w-3.5 h-3.5 inline mr-1.5" />
              Cap Table Scenarios
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.06 }}
            className="serif"
            style={{ fontSize: '2.5rem', lineHeight: '1.2', marginBottom: '1.5rem' }}
          >
            Analyze Share Dilution<br />
            <span style={{ color: '#E8312A' }}>from Multiple Sources</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12 }}
            className="text-lg leading-relaxed"
            style={{ marginBottom: '1.5rem', maxWidth: '620px', margin: '0 auto 2.5rem', color: '#666666' }}
          >
            Understand ownership changes from warrant exercises, financing rounds, and employee option vesting.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.18 }}
            className="flex gap-3 justify-center"
          >
            <button
              onClick={() => setShowCustomForm(!showCustomForm)}
              className="flex items-center gap-2 rounded-full px-6 py-2.5 font-semibold transition-all text-sm"
              style={{
                background: '#FFFFFF',
                color: '#E8312A',
                border: '2px solid #E8312A',
                transform: 'translateY(0)',
                transitionProperty: 'all',
                transitionDuration: '0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(232, 49, 42, 0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <Plus className="w-4 h-4" />
              Custom Scenario
            </button>
            <button
              onClick={handleExport}
              disabled={!selectedScenario || exportLoading}
              className="flex items-center gap-2 rounded-full px-6 py-2.5 font-semibold transition-all text-sm text-white active:scale-95"
              style={{
                background: '#E8312A',
                opacity: !selectedScenario || exportLoading ? 0.5 : 1,
                transform: 'translateY(0)',
                transitionProperty: 'all',
                transitionDuration: '0.2s',
              }}
              onMouseEnter={(e) => {
                if (!(!selectedScenario || exportLoading)) {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(232, 49, 42, 0.2)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {exportLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Export CSV
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Main Content Section */}
      <section className="max-w-7xl mx-auto" style={{ paddingBottom: '2.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        {/* Error Message */}
        {error && (
          <motion.div
            variants={itemVariants}
            className="flex gap-3 rounded-lg border p-4 mb-6"
            style={{ borderColor: '#FFD4CE', background: '#FDECEB', color: '#E8312A' }}
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p>{error}</p>
          </motion.div>
        )}

        {/* Preset Scenarios */}
        {presetScenarios && (
          <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-3">
            <ScenarioCard
              title="Base Case"
              description="Typical IPO scenario"
              icon={<Shield className="h-5 w-5" />}
              isSelected={selectedScenario?.scenarioType === 'base'}
              onClick={() => setSelectedScenario(presetScenarios.base)}
              scenario={presetScenarios.base}
              color="#0066CC"
              bg="#E6F0FF"
            />
            <ScenarioCard
              title="Optimistic Case"
              description="High warrant exercise, strong growth"
              icon={<TrendingUp className="h-5 w-5" />}
              isSelected={selectedScenario?.scenarioType === 'optimistic'}
              onClick={() => setSelectedScenario(presetScenarios.optimistic)}
              scenario={presetScenarios.optimistic}
              color="#10B981"
              bg="#D1F4E9"
            />
            <ScenarioCard
              title="Conservative Case"
              description="Low warrant exercise, moderate growth"
              icon={<AlertCircle className="h-5 w-5" />}
              isSelected={selectedScenario?.scenarioType === 'conservative'}
              onClick={() => setSelectedScenario(presetScenarios.conservative)}
              scenario={presetScenarios.conservative}
              color="#F59E0B"
              bg="#FEF3C7"
            />
          </motion.div>
        )}

        {/* Custom Scenario Form */}
        <AnimatePresence>
          {showCustomForm && (
            <motion.div variants={itemVariants} className="card p-6 mt-6">
              <h3 className="mb-4 h4 font-semibold text-gray-900">Create Custom Scenario</h3>
              <CustomScenarioForm onSubmit={handleCustomScenarioSubmit} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scenario Details */}
        {selectedScenario && (
          <motion.div variants={itemVariants} className="space-y-6 mt-8">
            <div className="card p-6">
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
      </section>
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
  color: string
  bg: string
}

function ScenarioCard({
  title,
  description,
  icon,
  isSelected,
  onClick,
  scenario,
  color,
  bg,
}: ScenarioCardProps) {
  const dilutionPercent =
    (Number(scenario.postDilutionSnapshot.newSharesIssued) /
      Number(scenario.postDilutionSnapshot.totalShares)) *
    100

  return (
    <motion.button
      onClick={onClick}
      className="card p-6 text-left transition-all hover:shadow-lg"
      style={{
        borderWidth: isSelected ? '2px' : '1px',
        borderColor: isSelected ? color : '#E5E7EB',
        background: isSelected ? bg : '#FFFFFF',
        transform: 'scale(1)',
        transitionProperty: 'all',
        transitionDuration: '0.2s',
      }}
      onMouseEnter={(e) => {
        const target = e.currentTarget as HTMLElement
        target.style.transform = 'scale(1.02)'
      }}
      onMouseLeave={(e) => {
        const target = e.currentTarget as HTMLElement
        target.style.transform = 'scale(1)'
      }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
          <div style={{ color }}>{icon}</div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold" style={{ color: isSelected ? color : '#111827' }}>{title}</h3>
          <p className="mt-1 caption-sm text-gray-600">{description}</p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold" style={{ color }}>{dilutionPercent.toFixed(1)}%</span>
            <span className="caption-sm text-gray-600">estimated dilution</span>
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
    <div className="rounded-lg p-4" style={{ background: highlight ? '#FDECEB' : '#F3F4F6' }}>
      <p className="caption-sm text-gray-600">{label}</p>
      <p className="mt-1 text-2xl font-bold" style={{ color: highlight ? '#E8312A' : '#111827' }}>
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
        className="w-full rounded-full px-4 py-2.5 label font-semibold text-white transition-all active:scale-95"
        style={{
          background: '#E8312A',
          transform: 'translateY(0)',
          transitionProperty: 'all',
          transitionDuration: '0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 8px 16px rgba(232, 49, 42, 0.2)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = 'none'
        }}
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
        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 body-sm transition-all"
        onFocus={(e) => {
          e.currentTarget.style.borderColor = '#E8312A'
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(232, 49, 42, 0.1)'
          e.currentTarget.style.outline = 'none'
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = '#D1D5DB'
          e.currentTarget.style.boxShadow = 'none'
        }}
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
