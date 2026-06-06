'use client'

import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowDownRight,
  ArrowUpRight,
  Download,
  Plus,
  Shield,
  AlertCircle,
  Loader2,
  TrendingUp,
  HelpCircle,
  FileText,
  Mail,
  BarChart3,
  RotateCcw,
  ChevronDown,
  Zap,
  ArrowRight,
  Activity,
} from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import {
  DilutionScenarioEngine,
  DilutionScenarioInput,
  DilutionScenarioResult,
  CapTableSnapshot,
} from '@/lib/cap-table/dilution-scenarios'
import Link from 'next/link'

interface PresetScenarios {
  base: DilutionScenarioResult
  optimistic: DilutionScenarioResult
  conservative: DilutionScenarioResult
}

interface SavedScenario {
  id: string
  name: string
  result: DilutionScenarioResult
  timestamp: number
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

// Mission Control Color Palette
const COLORS = [
  '#E8312A', // accent (red)
  '#1D4ED8', // info (blue)
  '#2D7A5F', // success (green)
  '#B45309', // warning (amber)
  '#7C3AED', // accent-purple
  '#D97706', // warning-dark
  '#06B6D4', // cyan
  '#8B5CF6', // purple
]

export default function DilutionScenariosPage() {
  const [presetScenarios, setPresetScenarios] = useState<PresetScenarios | null>(null)
  const [selectedScenario, setSelectedScenario] = useState<DilutionScenarioResult | null>(null)
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exportLoading, setExportLoading] = useState(false)
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [showSensitivityAnalysis, setShowSensitivityAnalysis] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'impact' | 'comparison' | 'sensitivity'>('overview')

  // Sensitivity analysis state
  const [exerciseProbability, setExerciseProbability] = useState(50)
  const [valuationChange, setValuationChange] = useState(0)
  const [additionalRaise, setAdditionalRaise] = useState(0)

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

  // Save scenario
  const handleSaveScenario = useCallback(() => {
    if (!selectedScenario) return
    const newSavedScenario: SavedScenario = {
      id: `saved-${Date.now()}`,
      name: selectedScenario.scenarioName,
      result: selectedScenario,
      timestamp: Date.now(),
    }
    setSavedScenarios([...savedScenarios, newSavedScenario])
  }, [selectedScenario, savedScenarios])

  // Export to Excel
  const handleExportExcel = useCallback(async () => {
    if (!selectedScenario) return
    try {
      setExportLoading(true)
      const response = await fetch('/api/cap-table/dilution/export/excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: selectedScenario,
          comparisonScenarios: presetScenarios ? Object.values(presetScenarios) : [],
        }),
      })
      if (!response.ok) throw new Error('Failed to export Excel')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `dilution-scenario-${selectedScenario.scenarioName}-${Date.now()}.xlsx`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export Excel')
    } finally {
      setExportLoading(false)
    }
  }, [selectedScenario, presetScenarios])

  // Export to CSV
  const handleExportCSV = useCallback(async () => {
    if (!selectedScenario) return
    try {
      setExportLoading(true)
      const response = await fetch('/api/cap-table/dilution/export/csv', {
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
      a.download = `dilution-scenario-${selectedScenario.scenarioName}-${Date.now()}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export CSV')
    } finally {
      setExportLoading(false)
    }
  }, [selectedScenario, presetScenarios])

  // Prepare pie chart data
  const currentOwnershipData = useMemo(() => {
    if (!selectedScenario) return []
    return selectedScenario.shareholderImpact.map((sh) => ({
      name: sh.shareholderName,
      value: Number(sh.currentOwnership),
    }))
  }, [selectedScenario])

  const postDilutionData = useMemo(() => {
    if (!selectedScenario) return []
    return selectedScenario.shareholderImpact.map((sh) => ({
      name: sh.shareholderName,
      value: Number(sh.postDilutionOwnership),
    }))
  }, [selectedScenario])

  // Prepare dilution impact bar chart
  const dilutionImpactData = useMemo(() => {
    if (!selectedScenario) return []
    return selectedScenario.shareholderImpact.map((sh) => ({
      name: sh.shareholderName.split(' ')[0],
      current: Number(sh.currentOwnership),
      postDilution: Number(sh.postDilutionOwnership),
      dilution: Number(sh.dilutionPercentage),
    }))
  }, [selectedScenario])

  if (loading && !presetScenarios) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: 'var(--color-bg-primary)' }}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--color-accent)' }} />
          <p style={{ color: 'var(--color-text-muted)' }}>Loading cap table scenarios...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      style={{ background: 'var(--color-bg-primary)', minHeight: '100vh' }}
      suppressHydrationWarning
    >
      {/* Header Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-0 py-8 sm:py-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-2 mb-4"
              >
                <span
                  className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg"
                  style={{ background: 'var(--color-error-soft)', color: 'var(--color-accent)' }}
                >
                  <BarChart3 className="w-3.5 h-3.5 inline mr-1.5" />
                  Cap Table Modeling
                </span>
              </motion.div>

              {/* Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.06 }}
                className="serif text-3xl sm:text-4xl mb-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Model Ownership Changes
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.12 }}
                className="text-base leading-relaxed max-w-2xl"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Understand dilution impact from warrant exercises, financing rounds, employee options, and debt conversions. Build multiple scenarios and compare outcomes.
              </motion.p>
            </div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.18 }}
              className="flex flex-col gap-2 sm:gap-3 flex-shrink-0"
            >
              <button
                onClick={() => setShowCustomForm(!showCustomForm)}
                className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap"
                style={{
                  background: 'var(--color-surface-primary)',
                  color: 'var(--color-accent)',
                  border: '1px solid var(--color-border)',
                  transform: 'translateY(0)',
                  transitionProperty: 'all',
                  transitionDuration: '0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'var(--shadow-card)'
                }}
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Custom</span>
              </button>

              {selectedScenario && (
                <button
                  onClick={handleExportExcel}
                  disabled={exportLoading}
                  className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap text-white"
                  style={{
                    background: 'var(--color-info)',
                    opacity: exportLoading ? 0.5 : 1,
                    transform: 'translateY(0)',
                    transitionProperty: 'all',
                    transitionDuration: '0.2s',
                    cursor: exportLoading ? 'not-allowed' : 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    if (!exportLoading) {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 8px 16px rgba(29, 78, 216, 0.2)'
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
                  <span className="hidden sm:inline">Export</span>
                </button>
              )}
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Main Content Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-0 pb-12">
        {/* Error Message */}
        {error && (
          <motion.div
            variants={itemVariants}
            className="flex gap-3 rounded-xl border p-4 mb-6"
            style={{ borderColor: '#E8312A30', background: 'var(--color-error-soft)', color: 'var(--color-accent)' }}
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </motion.div>
        )}

        {/* Preset Scenarios Cards */}
        {presetScenarios && (
          <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-3 mb-8">
            <ScenarioCard
              title="Base Case"
              description="Typical IPO scenario"
              icon={<Shield className="h-5 w-5" />}
              isSelected={selectedScenario?.scenarioType === 'base'}
              onClick={() => setSelectedScenario(presetScenarios.base)}
              scenario={presetScenarios.base}
              color="var(--color-info)"
              bg="var(--color-info-soft)"
            />
            <ScenarioCard
              title="Optimistic Case"
              description="High warrant exercise, strong growth"
              icon={<TrendingUp className="h-5 w-5" />}
              isSelected={selectedScenario?.scenarioType === 'optimistic'}
              onClick={() => setSelectedScenario(presetScenarios.optimistic)}
              scenario={presetScenarios.optimistic}
              color="var(--color-success)"
              bg="var(--color-success-soft)"
            />
            <ScenarioCard
              title="Conservative Case"
              description="Low warrant exercise, moderate growth"
              icon={<AlertCircle className="h-5 w-5" />}
              isSelected={selectedScenario?.scenarioType === 'conservative'}
              onClick={() => setSelectedScenario(presetScenarios.conservative)}
              scenario={presetScenarios.conservative}
              color="var(--color-warning)"
              bg="var(--color-warning-soft)"
            />
          </motion.div>
        )}

        {/* Custom Scenario Form */}
        <AnimatePresence>
          {showCustomForm && (
            <motion.div variants={itemVariants} className="card p-7 mb-8 rounded-xl" style={{ background: 'var(--color-surface-primary)', border: '1px solid var(--color-border)' }}>
              <h3 className="mb-6 font-bold text-base" style={{ color: 'var(--color-text-primary)' }}>Create Custom Scenario</h3>
              <CustomScenarioForm onSubmit={handleCustomScenarioSubmit} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Saved Scenarios */}
        {savedScenarios.length > 0 && (
          <motion.div variants={itemVariants} className="card p-7 mb-8 rounded-xl" style={{ background: 'var(--color-surface-primary)', border: '1px solid var(--color-border)' }}>
            <h3 className="mb-4 font-bold text-base" style={{ color: 'var(--color-text-primary)' }}>Saved Scenarios</h3>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {savedScenarios.map((saved) => (
                <button
                  key={saved.id}
                  onClick={() => setSelectedScenario(saved.result)}
                  className="p-4 rounded-lg border transition-all text-left"
                  style={{
                    borderColor: selectedScenario?.scenarioId === saved.result.scenarioId ? 'var(--color-accent)' : 'var(--color-border)',
                    background: selectedScenario?.scenarioId === saved.result.scenarioId ? 'var(--color-error-soft)' : 'var(--color-surface-primary)',
                    color: selectedScenario?.scenarioId === saved.result.scenarioId ? 'var(--color-text-primary)' : 'var(--color-text-primary)',
                  }}
                >
                  <p className="font-medium text-sm">{saved.name}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                    {new Date(saved.timestamp).toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Scenario Details & Visualizations */}
        {selectedScenario && (
          <motion.div variants={itemVariants} className="space-y-6">
            {/* Tabs */}
            <div className="card p-4 flex gap-2 overflow-x-auto rounded-xl" style={{ background: 'var(--color-surface-primary)', border: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
              {(['overview', 'impact', 'comparison', 'sensitivity'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="px-4 py-2.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap capitalize"
                  style={{
                    color: activeTab === tab ? 'var(--color-accent)' : 'var(--color-text-muted)',
                    background: activeTab === tab ? 'var(--color-error-soft)' : 'transparent',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div variants={itemVariants} className="space-y-6">
                {/* Summary Metrics */}
                <div className="grid gap-4 md:grid-cols-4">
                  <MetricCard
                    label="Current Shares"
                    value={formatNumber(Number(selectedScenario.currentSnapshot.totalShares))}
                    highlight={false}
                  />
                  <MetricCard
                    label="Post-Dilution Shares"
                    value={formatNumber(Number(selectedScenario.postDilutionSnapshot.totalShares))}
                    highlight={false}
                  />
                  <MetricCard
                    label="New Shares Issued"
                    value={formatNumber(Number(selectedScenario.postDilutionSnapshot.newSharesIssued))}
                    highlight={false}
                  />
                  <MetricCard
                    label="Dilution Impact"
                    value={`${((Number(selectedScenario.postDilutionSnapshot.newSharesIssued) / Number(selectedScenario.postDilutionSnapshot.totalShares)) * 100).toFixed(1)}%`}
                    highlight={true}
                  />
                </div>

                {/* Before/After Visualizations */}
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Before Pie Chart */}
                  <div className="card p-6 rounded-xl" style={{ background: 'var(--color-surface-primary)', border: '1px solid var(--color-border)' }}>
                    <h3 className="mb-4 text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>Current Ownership</h3>
                    {currentOwnershipData.length > 0 && (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={currentOwnershipData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }: any) => {
                              const namePart = typeof name === 'string' ? name.split(' ')[0] : 'N/A'
                              const valuePart = typeof value === 'number' ? value.toFixed(1) : '0'
                              return `${namePart} ${valuePart}%`
                            }}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {currentOwnershipData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  {/* After Pie Chart */}
                  <div className="card p-6 rounded-xl" style={{ background: 'var(--color-surface-primary)', border: '1px solid var(--color-border)' }}>
                    <h3 className="mb-4 text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>Post-Dilution Ownership</h3>
                    {postDilutionData.length > 0 && (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={postDilutionData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }: any) => {
                              const namePart = typeof name === 'string' ? name.split(' ')[0] : 'N/A'
                              const valuePart = typeof value === 'number' ? value.toFixed(1) : '0'
                              return `${namePart} ${valuePart}%`
                            }}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {postDilutionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Assumptions */}
                <div className="card p-6 rounded-xl" style={{ background: 'var(--color-surface-light)', border: '1px solid var(--color-border)' }}>
                  <h3 className="mb-4 text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>Scenario Assumptions</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {selectedScenario.assumptions.warrantsExercisedPercent !== undefined && (
                      <div>
                        <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Warrants Exercised</p>
                        <p className="text-lg font-bold mt-1" style={{ color: 'var(--color-text-primary)' }}>
                          {selectedScenario.assumptions.warrantsExercisedPercent}%
                        </p>
                      </div>
                    )}
                    {selectedScenario.assumptions.employeeOptionVestingShares && (
                      <div>
                        <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Employee Options Vesting</p>
                        <p className="text-lg font-bold mt-1" style={{ color: 'var(--color-text-primary)' }}>
                          {formatNumber(selectedScenario.assumptions.employeeOptionVestingShares)}
                        </p>
                      </div>
                    )}
                    {selectedScenario.assumptions.newFinancingAmount && (
                      <div>
                        <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>New Financing Amount</p>
                        <p className="text-lg font-bold mt-1" style={{ color: 'var(--color-text-primary)' }}>
                          ${formatNumber(selectedScenario.assumptions.newFinancingAmount / 1000000)}M
                        </p>
                      </div>
                    )}
                    {selectedScenario.assumptions.projectedValuation && (
                      <div>
                        <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Projected Valuation</p>
                        <p className="text-lg font-bold mt-1" style={{ color: 'var(--color-text-primary)' }}>
                          ${formatNumber(selectedScenario.assumptions.projectedValuation / 1000000)}M
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Impact Tab */}
            {activeTab === 'impact' && (
              <motion.div variants={itemVariants} className="space-y-6">
                {/* Dilution Bar Chart */}
                <div className="card p-6 rounded-xl" style={{ background: 'var(--color-surface-primary)', border: '1px solid var(--color-border)' }}>
                  <h3 className="mb-4 text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>Ownership Changes by Shareholder</h3>
                  {dilutionImpactData.length > 0 && (
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={dilutionImpactData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
                        <Legend />
                        <Bar dataKey="current" fill="#0066CC" name="Current %" />
                        <Bar dataKey="postDilution" fill="#E8312A" name="Post-Dilution %" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Shareholder Impact Table */}
                <div className="card p-6 rounded-xl" style={{ background: 'var(--color-surface-primary)', border: '1px solid var(--color-border)' }}>
                  <h3 className="mb-4 text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>Detailed Shareholder Impact</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ borderBottomColor: 'var(--color-border)', borderBottomWidth: '1px' }}>
                          <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--color-text-primary)' }}>Shareholder</th>
                          <th className="px-4 py-3 text-right font-medium" style={{ color: 'var(--color-text-primary)' }}>Type</th>
                          <th className="px-4 py-3 text-right font-medium" style={{ color: 'var(--color-text-primary)' }}>Current %</th>
                          <th className="px-4 py-3 text-right font-medium" style={{ color: 'var(--color-text-primary)' }}>Post-Dilution %</th>
                          <th className="px-4 py-3 text-right font-medium" style={{ color: 'var(--color-text-primary)' }}>Dilution %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedScenario.shareholderImpact.map((position, idx) => {
                          const dilution = Number(position.dilutionPercentage)
                          return (
                            <tr key={position.shareholderId} style={{ borderBottomColor: 'var(--color-border)', borderBottomWidth: '1px' }}>
                              <td className="px-4 py-3" style={{ color: 'var(--color-text-primary)' }}>
                                <div className="font-medium">{position.shareholderName}</div>
                                <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{position.shareClass}</div>
                              </td>
                              <td className="px-4 py-3 text-right text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                <span className="capitalize">{position.shareholderType}</span>
                              </td>
                              <td className="px-4 py-3 text-right font-medium" style={{ color: 'var(--color-text-primary)' }}>
                                {Number(position.currentOwnership).toFixed(2)}%
                              </td>
                              <td className="px-4 py-3 text-right font-medium" style={{ color: 'var(--color-text-primary)' }}>
                                {Number(position.postDilutionOwnership).toFixed(2)}%
                              </td>
                              <td className="px-4 py-3 text-right">
                                {dilution > 0 ? (
                                  <div className="flex items-center justify-end gap-1" style={{ color: 'var(--color-accent)' }}>
                                    <ArrowDownRight className="h-4 w-4" />
                                    <span>{dilution.toFixed(2)}%</span>
                                  </div>
                                ) : (
                                  <span style={{ color: 'var(--color-text-tertiary)' }}>-</span>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Comparison Tab */}
            {activeTab === 'comparison' && (
              <motion.div variants={itemVariants} className="space-y-6">
                {presetScenarios ? (
                  <ScenarioComparison
                    baseScenario={presetScenarios.base}
                    optimisticScenario={presetScenarios.optimistic}
                    conservativeScenario={presetScenarios.conservative}
                    selectedScenario={selectedScenario}
                  />
                ) : (
                  <div className="card p-6 rounded-xl text-center" style={{ background: 'var(--color-surface-primary)', border: '1px solid var(--color-border)' }}>
                    <p style={{ color: 'var(--color-text-muted)' }}>No scenarios available for comparison</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Sensitivity Analysis Tab */}
            {activeTab === 'sensitivity' && (
              <motion.div variants={itemVariants} className="space-y-6">
                <SensitivityAnalysisPanel
                  baseScenario={selectedScenario}
                  exerciseProbability={exerciseProbability}
                  onExerciseProbabilityChange={setExerciseProbability}
                  valuationChange={valuationChange}
                  onValuationChangeChange={setValuationChange}
                  additionalRaise={additionalRaise}
                  onAdditionalRaiseChange={setAdditionalRaise}
                />
              </motion.div>
            )}
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
      className="card p-6 rounded-xl text-left transition-all"
      style={{
        borderWidth: isSelected ? '2px' : '1px',
        borderColor: isSelected ? color : 'var(--color-border)',
        background: isSelected ? bg : 'var(--color-surface-primary)',
        transform: 'scale(1)',
        transitionProperty: 'all',
        transitionDuration: '0.2s',
        boxShadow: isSelected ? `0 0 0 1px ${color}20` : 'var(--shadow-card)',
      }}
      onMouseEnter={(e) => {
        const target = e.currentTarget as HTMLElement
        target.style.transform = 'scale(1.02)'
        target.style.boxShadow = 'var(--shadow-card-hover)'
      }}
      onMouseLeave={(e) => {
        const target = e.currentTarget as HTMLElement
        target.style.transform = 'scale(1)'
        target.style.boxShadow = isSelected ? `0 0 0 1px ${color}20` : 'var(--shadow-card)'
      }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
          <div style={{ color }}>{icon}</div>
        </div>
        <div className="flex-1">
          <h3 className="text-base font-bold" style={{ color: isSelected ? color : 'var(--color-text-primary)' }}>{title}</h3>
          <p className="mt-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>{description}</p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-black" style={{ color }}>{dilutionPercent.toFixed(1)}%</span>
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>dilution</span>
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
    <div className="card p-6 rounded-xl" style={{ background: highlight ? 'var(--color-error-soft)' : 'var(--color-surface-light)', border: '1px solid var(--color-border)' }}>
      <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
      <p className="mt-2 text-2xl font-black" style={{ color: highlight ? 'var(--color-accent)' : 'var(--color-text-primary)' }}>
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6">
        {/* Equity Raise Section */}
        <div className="border-t pt-6" style={{ borderTopColor: 'var(--color-border)' }}>
          <h4 className="text-sm font-bold text-sm mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
            <Zap className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
            Equity Raise Parameters
          </h4>
          <div className="grid gap-4 md:grid-cols-2">
            <FormInput
              label="New Financing Amount ($)"
              type="number"
              value={formData.newFinancingAmount?.toString() || ''}
              onChange={(value) => setFormData({ ...formData, newFinancingAmount: Number(value) })}
              tooltip="Amount of new capital being raised in the financing round"
            />
            <FormInput
              label="Projected Post-Money Valuation ($)"
              type="number"
              value={formData.projectedValuation?.toString() || ''}
              onChange={(value) => setFormData({ ...formData, projectedValuation: Number(value) })}
              tooltip="Valuation of the company after the financing round"
            />
          </div>
        </div>

        {/* Warrants & Options Section */}
        <div className="border-t pt-6" style={{ borderTopColor: 'var(--color-border)' }}>
          <h4 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
            <TrendingUp className="w-4 h-4" style={{ color: 'var(--color-success)' }} />
            Warrants & Options
          </h4>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-2 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                Warrants Exercised (%)
                <HelpCircle className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} aria-label="Percentage of outstanding warrants expected to be exercised" />
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.warrantsExercisedPercent || 50}
                onChange={(e) => setFormData({ ...formData, warrantsExercisedPercent: Number(e.target.value) })}
                className="w-full"
              />
              <p className="text-sm font-medium mt-2" style={{ color: 'var(--color-text-primary)' }}>{formData.warrantsExercisedPercent}%</p>
            </div>
            <FormInput
              label="Employee Options Vesting (shares)"
              type="number"
              value={formData.employeeOptionVestingShares?.toString() || ''}
              onChange={(value) => setFormData({ ...formData, employeeOptionVestingShares: Number(value) })}
              tooltip="Number of employee stock options expected to vest"
            />
          </div>
        </div>

        {/* Scenario Details */}
        <div className="border-t pt-6" style={{ borderTopColor: 'var(--color-border)' }}>
          <h4 className="text-sm font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Scenario Details</h4>
          <FormInput
            label="Scenario Name"
            value={formData.scenarioName}
            onChange={(value) => setFormData({ ...formData, scenarioName: value })}
            tooltip="Give this scenario a descriptive name for easy reference"
          />
        </div>
      </div>

      <div className="flex gap-3 border-t pt-6" style={{ borderTopColor: 'var(--color-border)' }}>
        <button
          type="submit"
          className="flex-1 rounded-xl px-4 py-3 text-sm font-bold text-white transition-all active:scale-95"
          style={{
            background: 'var(--color-accent)',
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
      </div>
    </form>
  )
}

// Form Input Component
interface FormInputProps {
  label: string
  type?: string
  value: string
  onChange: (value: string) => void
  tooltip?: string
}

function FormInput({ label, type = 'text', value, onChange, tooltip }: FormInputProps) {
  return (
    <div>
      <label className="text-sm font-medium flex items-center gap-2 mb-2" style={{ color: 'var(--color-text-primary)' }}>
        {label}
        {tooltip && <HelpCircle className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} aria-label={tooltip} />}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border px-3 py-2.5 text-sm transition-all"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-primary)', color: 'var(--color-text-primary)' }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-accent)'
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(232, 49, 42, 0.1)'
          e.currentTarget.style.outline = 'none'
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-border)'
          e.currentTarget.style.boxShadow = 'none'
        }}
      />
    </div>
  )
}

// Scenario Comparison Component
interface ScenarioComparisonProps {
  baseScenario: DilutionScenarioResult
  optimisticScenario: DilutionScenarioResult
  conservativeScenario: DilutionScenarioResult
  selectedScenario: DilutionScenarioResult
}

function ScenarioComparison({
  baseScenario,
  optimisticScenario,
  conservativeScenario,
  selectedScenario,
}: ScenarioComparisonProps) {
  const comparisonData = [
    {
      metric: 'Total Shares (Post)',
      base: formatNumber(Number(baseScenario.postDilutionSnapshot.totalShares)),
      optimistic: formatNumber(Number(optimisticScenario.postDilutionSnapshot.totalShares)),
      conservative: formatNumber(Number(conservativeScenario.postDilutionSnapshot.totalShares)),
    },
    {
      metric: 'New Shares Issued',
      base: formatNumber(Number(baseScenario.postDilutionSnapshot.newSharesIssued)),
      optimistic: formatNumber(Number(optimisticScenario.postDilutionSnapshot.newSharesIssued)),
      conservative: formatNumber(Number(conservativeScenario.postDilutionSnapshot.newSharesIssued)),
    },
  ]

  return (
    <div className="card p-6 rounded-xl" style={{ background: 'var(--color-surface-primary)', border: '1px solid var(--color-border)' }}>
      <h3 className="mb-4 text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>Side-by-Side Comparison</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottomColor: 'var(--color-border)', borderBottomWidth: '1px' }}>
              <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--color-text-primary)' }}>Metric</th>
              <th className="px-4 py-3 text-right font-medium" style={{ color: 'var(--color-text-primary)' }}>Base Case</th>
              <th className="px-4 py-3 text-right font-medium" style={{ color: 'var(--color-text-primary)' }}>Optimistic</th>
              <th className="px-4 py-3 text-right font-medium" style={{ color: 'var(--color-text-primary)' }}>Conservative</th>
            </tr>
          </thead>
          <tbody>
            {comparisonData.map((row, idx) => (
              <tr key={idx} style={{ borderBottomColor: 'var(--color-border)', borderBottomWidth: '1px' }}>
                <td className="px-4 py-3 font-medium" style={{ color: 'var(--color-text-primary)' }}>{row.metric}</td>
                <td className="px-4 py-3 text-right" style={{ color: 'var(--color-text-secondary)' }}>{row.base}</td>
                <td className="px-4 py-3 text-right" style={{ color: 'var(--color-text-secondary)' }}>{row.optimistic}</td>
                <td className="px-4 py-3 text-right" style={{ color: 'var(--color-text-secondary)' }}>{row.conservative}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Shareholder Comparison Grid */}
      <h3 className="mt-6 mb-4 text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>Shareholder Ownership % Across Scenarios</h3>
      <div className="grid gap-4">
        {baseScenario.shareholderImpact.slice(0, 5).map((position) => {
          const optPosition = optimisticScenario.shareholderImpact.find((p) => p.shareholderId === position.shareholderId)
          const conPosition = conservativeScenario.shareholderImpact.find((p) => p.shareholderId === position.shareholderId)

          return (
            <div key={position.shareholderId} className="p-4 rounded-lg" style={{ background: 'var(--color-surface-light)' }}>
              <p className="font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>{position.shareholderName}</p>
              <div className="grid gap-2 md:grid-cols-3">
                <div>
                  <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Base</p>
                  <p className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>{Number(position.postDilutionOwnership).toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Optimistic</p>
                  <p className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>{optPosition ? Number(optPosition.postDilutionOwnership).toFixed(2) : 'N/A'}%</p>
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Conservative</p>
                  <p className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>{conPosition ? Number(conPosition.postDilutionOwnership).toFixed(2) : 'N/A'}%</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Sensitivity Analysis Panel
interface SensitivityAnalysisPanelProps {
  baseScenario: DilutionScenarioResult
  exerciseProbability: number
  onExerciseProbabilityChange: (value: number) => void
  valuationChange: number
  onValuationChangeChange: (value: number) => void
  additionalRaise: number
  onAdditionalRaiseChange: (value: number) => void
}

function SensitivityAnalysisPanel({
  baseScenario,
  exerciseProbability,
  onExerciseProbabilityChange,
  valuationChange,
  onValuationChangeChange,
  additionalRaise,
  onAdditionalRaiseChange,
}: SensitivityAnalysisPanelProps) {
  const heatmapData = [
    { name: 'Conservative', value: exerciseProbability * 0.8 + (100 - valuationChange) * 0.2 },
    { name: 'Base Case', value: exerciseProbability * 1 + (100 - valuationChange) * 1 },
    { name: 'Optimistic', value: exerciseProbability * 1.2 + (100 - valuationChange) * 1.8 },
  ]

  return (
    <div className="space-y-6">
      {/* Sensitivity Controls */}
      <div className="card p-6 rounded-xl" style={{ background: 'var(--color-surface-primary)', border: '1px solid var(--color-border)' }}>
        <h3 className="mb-6 text-sm font-bold flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
          <Zap className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
          What-If Analysis
        </h3>

        <div className="space-y-6">
          {/* Exercise Probability Slider */}
          <div>
            <label className="text-sm font-medium flex items-center gap-2 mb-3" style={{ color: 'var(--color-text-primary)' }}>
              Exercise Probability
              <HelpCircle className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} aria-label="What percentage of warrants/options will be exercised?" />
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                value={exerciseProbability}
                onChange={(e) => onExerciseProbabilityChange(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-lg font-bold w-16" style={{ color: 'var(--color-text-primary)' }}>{exerciseProbability}%</span>
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
              {exerciseProbability < 33 && 'Conservative'}
              {exerciseProbability >= 33 && exerciseProbability < 67 && 'Base Case'}
              {exerciseProbability >= 67 && 'Optimistic'}
            </p>
          </div>

          {/* Valuation Change Slider */}
          <div>
            <label className="text-sm font-medium flex items-center gap-2 mb-3" style={{ color: 'var(--color-text-primary)' }}>
              Valuation Change
              <HelpCircle className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} aria-label="Expected change in company valuation percentage" />
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="-50"
                max="50"
                value={valuationChange}
                onChange={(e) => onValuationChangeChange(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-lg font-bold w-16 text-right" style={{ color: valuationChange > 0 ? 'var(--color-success)' : valuationChange < 0 ? 'var(--color-accent)' : 'var(--color-text-muted)' }}>
                {valuationChange > 0 ? '+' : ''}{valuationChange}%
              </span>
            </div>
          </div>

          {/* Additional Raise Slider */}
          <div>
            <label className="text-sm font-medium flex items-center gap-2 mb-3" style={{ color: 'var(--color-text-primary)' }}>
              Additional Capital Raise
              <HelpCircle className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} aria-label="Projected additional capital raises" />
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                value={additionalRaise}
                onChange={(e) => onAdditionalRaiseChange(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-lg font-bold w-16" style={{ color: 'var(--color-text-primary)' }}>${additionalRaise}M</span>
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap Visualization */}
      <div className="card p-6 rounded-xl" style={{ background: 'var(--color-surface-primary)', border: '1px solid var(--color-border)' }}>
        <h3 className="mb-4 text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>Scenario Sensitivity Heatmap</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={heatmapData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#E8312A" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Impact Summary */}
      <div className="card p-6 rounded-xl" style={{ background: 'var(--color-surface-primary)', border: '1px solid var(--color-border)' }}>
        <h3 className="mb-4 text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>Key Impacts Summary</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 rounded-lg" style={{ background: 'var(--color-surface-light)' }}>
            <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Exercise Probability Impact</p>
            <p className="text-lg font-bold mt-1" style={{ color: 'var(--color-text-primary)' }}>{(exerciseProbability * 0.5).toFixed(1)}%</p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Est. dilution change</p>
          </div>
          <div className="p-4 rounded-lg" style={{ background: 'var(--color-surface-light)' }}>
            <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Valuation Change Impact</p>
            <p className="text-lg font-bold mt-1" style={{ color: 'var(--color-text-primary)' }}>{(Math.abs(valuationChange) * 0.3).toFixed(1)}%</p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>On ownership %</p>
          </div>
          <div className="p-4 rounded-lg" style={{ background: 'var(--color-surface-light)' }}>
            <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Additional Raise</p>
            <p className="text-lg font-bold mt-1" style={{ color: 'var(--color-text-primary)' }}>${additionalRaise}M</p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Extra dilution potential</p>
          </div>
        </div>
      </div>
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
