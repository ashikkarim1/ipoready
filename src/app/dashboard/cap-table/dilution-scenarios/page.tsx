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

const COLORS = ['#E8312A', '#0066CC', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#6366F1']

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
              <BarChart3 className="w-3.5 h-3.5 inline mr-1.5" />
              Cap Table Dilution Modeling
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
            Model Ownership Changes<br />
            <span style={{ color: '#E8312A' }}>From Financing, Warrants & Options</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12 }}
            className="text-lg leading-relaxed"
            style={{ marginBottom: '2rem', maxWidth: '620px', margin: '0 auto 2.5rem', color: '#666666' }}
          >
            Understand dilution impact from warrant exercises, financing rounds, employee options, and debt conversions. Build multiple scenarios and compare outcomes.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.18 }}
            className="flex gap-3 justify-center flex-wrap"
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
              Create Custom Scenario
            </button>

            {selectedScenario && (
              <>
                <button
                  onClick={handleExportExcel}
                  disabled={exportLoading}
                  className="flex items-center gap-2 rounded-full px-6 py-2.5 font-semibold transition-all text-sm text-white active:scale-95"
                  style={{
                    background: '#0066CC',
                    opacity: exportLoading ? 0.5 : 1,
                    transform: 'translateY(0)',
                    transitionProperty: 'all',
                    transitionDuration: '0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (!exportLoading) {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 102, 204, 0.2)'
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
                  Export Excel
                </button>

                <button
                  onClick={handleExportCSV}
                  disabled={exportLoading}
                  className="flex items-center gap-2 rounded-full px-6 py-2.5 font-semibold transition-all text-sm"
                  style={{
                    background: '#F7F6F4',
                    color: '#666666',
                    border: '1px solid #E5E7EB',
                    transform: 'translateY(0)',
                    transitionProperty: 'all',
                    transitionDuration: '0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (!exportLoading) {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.05)'
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
                    <FileText className="w-4 h-4" />
                  )}
                  Export CSV
                </button>

                <button
                  onClick={handleSaveScenario}
                  className="flex items-center gap-2 rounded-full px-6 py-2.5 font-semibold transition-all text-sm"
                  style={{
                    background: '#F7F6F4',
                    color: '#666666',
                    border: '1px solid #E5E7EB',
                    transform: 'translateY(0)',
                    transitionProperty: 'all',
                    transitionDuration: '0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <Zap className="w-4 h-4" />
                  Save Scenario
                </button>
              </>
            )}
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
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
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
            <motion.div variants={itemVariants} className="card p-6 mb-8">
              <h3 className="mb-6 h4 font-semibold text-gray-900">Create Custom Scenario</h3>
              <CustomScenarioForm onSubmit={handleCustomScenarioSubmit} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Saved Scenarios */}
        {savedScenarios.length > 0 && (
          <motion.div variants={itemVariants} className="card p-6 mb-8">
            <h3 className="mb-4 h4 font-semibold text-gray-900">Saved Scenarios</h3>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {savedScenarios.map((saved) => (
                <button
                  key={saved.id}
                  onClick={() => setSelectedScenario(saved.result)}
                  className="p-4 rounded-lg border transition-all text-left"
                  style={{
                    borderColor: selectedScenario?.scenarioId === saved.result.scenarioId ? '#E8312A' : '#E5E7EB',
                    background: selectedScenario?.scenarioId === saved.result.scenarioId ? '#FDECEB' : '#FFFFFF',
                  }}
                >
                  <p className="font-medium text-sm text-gray-900">{saved.name}</p>
                  <p className="caption-sm text-gray-500 mt-1">
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
            <div className="card p-4 flex gap-2 overflow-x-auto border-b" style={{ borderBottomColor: '#E5E7EB' }}>
              {(['overview', 'impact', 'comparison', 'sensitivity'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap capitalize"
                  style={{
                    color: activeTab === tab ? '#E8312A' : '#666666',
                    background: activeTab === tab ? '#FDECEB' : 'transparent',
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

                {/* Before/After Visualizations */}
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Before Pie Chart */}
                  <div className="card p-6">
                    <h3 className="mb-4 label font-semibold text-gray-900">Current Ownership</h3>
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
                  <div className="card p-6">
                    <h3 className="mb-4 label font-semibold text-gray-900">Post-Dilution Ownership</h3>
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
                <div className="card p-6 rounded-lg" style={{ background: '#F9FAFB', borderColor: '#E5E7EB' }}>
                  <h3 className="mb-4 label font-semibold text-gray-900">Scenario Assumptions</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {selectedScenario.assumptions.warrantsExercisedPercent !== undefined && (
                      <div>
                        <p className="caption-sm text-gray-600">Warrants Exercised</p>
                        <p className="text-lg font-semibold text-gray-900 mt-1">
                          {selectedScenario.assumptions.warrantsExercisedPercent}%
                        </p>
                      </div>
                    )}
                    {selectedScenario.assumptions.employeeOptionVestingShares && (
                      <div>
                        <p className="caption-sm text-gray-600">Employee Options Vesting</p>
                        <p className="text-lg font-semibold text-gray-900 mt-1">
                          {formatNumber(selectedScenario.assumptions.employeeOptionVestingShares)}
                        </p>
                      </div>
                    )}
                    {selectedScenario.assumptions.newFinancingAmount && (
                      <div>
                        <p className="caption-sm text-gray-600">New Financing Amount</p>
                        <p className="text-lg font-semibold text-gray-900 mt-1">
                          ${formatNumber(selectedScenario.assumptions.newFinancingAmount / 1000000)}M
                        </p>
                      </div>
                    )}
                    {selectedScenario.assumptions.projectedValuation && (
                      <div>
                        <p className="caption-sm text-gray-600">Projected Valuation</p>
                        <p className="text-lg font-semibold text-gray-900 mt-1">
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
                <div className="card p-6">
                  <h3 className="mb-4 label font-semibold text-gray-900">Ownership Changes by Shareholder</h3>
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
                <div className="card p-6">
                  <h3 className="mb-4 label font-semibold text-gray-900">Detailed Shareholder Impact</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ borderBottomColor: '#E5E7EB', borderBottomWidth: '1px' }}>
                          <th className="px-4 py-3 text-left font-medium text-gray-900">Shareholder</th>
                          <th className="px-4 py-3 text-right font-medium text-gray-900">Type</th>
                          <th className="px-4 py-3 text-right font-medium text-gray-900">Current %</th>
                          <th className="px-4 py-3 text-right font-medium text-gray-900">Post-Dilution %</th>
                          <th className="px-4 py-3 text-right font-medium text-gray-900">Dilution %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedScenario.shareholderImpact.map((position, idx) => {
                          const dilution = Number(position.dilutionPercentage)
                          return (
                            <tr key={position.shareholderId} style={{ borderBottomColor: '#F3F4F6', borderBottomWidth: '1px' }}>
                              <td className="px-4 py-3 text-gray-900">
                                <div className="font-medium">{position.shareholderName}</div>
                                <div className="caption-sm text-gray-500">{position.shareClass}</div>
                              </td>
                              <td className="px-4 py-3 text-right text-gray-600 text-xs">
                                <span className="capitalize">{position.shareholderType}</span>
                              </td>
                              <td className="px-4 py-3 text-right font-medium text-gray-900">
                                {Number(position.currentOwnership).toFixed(2)}%
                              </td>
                              <td className="px-4 py-3 text-right font-medium text-gray-900">
                                {Number(position.postDilutionOwnership).toFixed(2)}%
                              </td>
                              <td className="px-4 py-3 text-right">
                                {dilution > 0 ? (
                                  <div className="flex items-center justify-end gap-1">
                                    <ArrowDownRight className="h-4 w-4" style={{ color: '#E8312A' }} />
                                    <span style={{ color: '#E8312A' }}>{dilution.toFixed(2)}%</span>
                                  </div>
                                ) : (
                                  <span className="text-gray-400">-</span>
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
                  <div className="card p-6 text-center">
                    <p className="text-gray-600">No scenarios available for comparison</p>
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
    <div className="card p-6 rounded-lg" style={{ background: highlight ? '#FDECEB' : '#F9FAFB', borderColor: '#E5E7EB' }}>
      <p className="caption-sm text-gray-600">{label}</p>
      <p className="mt-2 text-2xl font-bold" style={{ color: highlight ? '#E8312A' : '#111827' }}>
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
        <div className="border-t pt-6" style={{ borderTopColor: '#E5E7EB' }}>
          <h4 className="label font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4" style={{ color: '#E8312A' }} />
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
        <div className="border-t pt-6" style={{ borderTopColor: '#E5E7EB' }}>
          <h4 className="label font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" style={{ color: '#10B981' }} />
            Warrants & Options
          </h4>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label font-medium text-gray-900 mb-2 flex items-center gap-2">
                Warrants Exercised (%)
                <HelpCircle className="w-4 h-4 text-gray-400" aria-label="Percentage of outstanding warrants expected to be exercised" />
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.warrantsExercisedPercent || 50}
                onChange={(e) => setFormData({ ...formData, warrantsExercisedPercent: Number(e.target.value) })}
                className="w-full"
              />
              <p className="text-sm font-medium text-gray-900 mt-2">{formData.warrantsExercisedPercent}%</p>
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
        <div className="border-t pt-6" style={{ borderTopColor: '#E5E7EB' }}>
          <h4 className="label font-semibold text-gray-900 mb-4">Scenario Details</h4>
          <FormInput
            label="Scenario Name"
            value={formData.scenarioName}
            onChange={(value) => setFormData({ ...formData, scenarioName: value })}
            tooltip="Give this scenario a descriptive name for easy reference"
          />
        </div>
      </div>

      <div className="flex gap-3 border-t pt-6" style={{ borderTopColor: '#E5E7EB' }}>
        <button
          type="submit"
          className="flex-1 rounded-full px-4 py-3 label font-semibold text-white transition-all active:scale-95"
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
      <label className="label font-medium text-gray-900 flex items-center gap-2">
        {label}
        {tooltip && <HelpCircle className="w-4 h-4 text-gray-400" aria-label={tooltip} />}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-lg border px-3 py-2.5 text-sm transition-all"
        style={{ borderColor: '#E5E7EB' }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = '#E8312A'
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(232, 49, 42, 0.1)'
          e.currentTarget.style.outline = 'none'
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = '#E5E7EB'
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
    <div className="card p-6">
      <h3 className="mb-4 label font-semibold text-gray-900">Side-by-Side Comparison</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottomColor: '#E5E7EB', borderBottomWidth: '1px' }}>
              <th className="px-4 py-3 text-left font-medium text-gray-900">Metric</th>
              <th className="px-4 py-3 text-right font-medium text-gray-900">Base Case</th>
              <th className="px-4 py-3 text-right font-medium text-gray-900">Optimistic</th>
              <th className="px-4 py-3 text-right font-medium text-gray-900">Conservative</th>
            </tr>
          </thead>
          <tbody>
            {comparisonData.map((row, idx) => (
              <tr key={idx} style={{ borderBottomColor: '#F3F4F6', borderBottomWidth: '1px' }}>
                <td className="px-4 py-3 font-medium text-gray-900">{row.metric}</td>
                <td className="px-4 py-3 text-right text-gray-700">{row.base}</td>
                <td className="px-4 py-3 text-right text-gray-700">{row.optimistic}</td>
                <td className="px-4 py-3 text-right text-gray-700">{row.conservative}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Shareholder Comparison Grid */}
      <h3 className="mt-6 mb-4 label font-semibold text-gray-900">Shareholder Ownership % Across Scenarios</h3>
      <div className="grid gap-4">
        {baseScenario.shareholderImpact.slice(0, 5).map((position) => {
          const optPosition = optimisticScenario.shareholderImpact.find((p) => p.shareholderId === position.shareholderId)
          const conPosition = conservativeScenario.shareholderImpact.find((p) => p.shareholderId === position.shareholderId)

          return (
            <div key={position.shareholderId} className="p-4 rounded-lg bg-gray-50">
              <p className="font-medium text-gray-900 mb-2">{position.shareholderName}</p>
              <div className="grid gap-2 md:grid-cols-3">
                <div>
                  <p className="caption-sm text-gray-600">Base</p>
                  <p className="text-lg font-semibold text-gray-900">{Number(position.postDilutionOwnership).toFixed(2)}%</p>
                </div>
                <div>
                  <p className="caption-sm text-gray-600">Optimistic</p>
                  <p className="text-lg font-semibold text-gray-900">{optPosition ? Number(optPosition.postDilutionOwnership).toFixed(2) : 'N/A'}%</p>
                </div>
                <div>
                  <p className="caption-sm text-gray-600">Conservative</p>
                  <p className="text-lg font-semibold text-gray-900">{conPosition ? Number(conPosition.postDilutionOwnership).toFixed(2) : 'N/A'}%</p>
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
      <div className="card p-6">
        <h3 className="mb-6 label font-semibold text-gray-900 flex items-center gap-2">
          <Zap className="w-4 h-4" style={{ color: '#E8312A' }} />
          What-If Analysis
        </h3>

        <div className="space-y-6">
          {/* Exercise Probability Slider */}
          <div>
            <label className="label font-medium text-gray-900 flex items-center gap-2 mb-3">
              Exercise Probability
              <HelpCircle className="w-4 h-4 text-gray-400" aria-label="What percentage of warrants/options will be exercised?" />
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
              <span className="text-lg font-semibold text-gray-900 w-16">{exerciseProbability}%</span>
            </div>
            <p className="caption-sm text-gray-500 mt-2">
              {exerciseProbability < 33 && 'Conservative'}
              {exerciseProbability >= 33 && exerciseProbability < 67 && 'Base Case'}
              {exerciseProbability >= 67 && 'Optimistic'}
            </p>
          </div>

          {/* Valuation Change Slider */}
          <div>
            <label className="label font-medium text-gray-900 flex items-center gap-2 mb-3">
              Valuation Change
              <HelpCircle className="w-4 h-4 text-gray-400" aria-label="Expected change in company valuation percentage" />
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
              <span className="text-lg font-semibold w-16 text-right" style={{ color: valuationChange > 0 ? '#10B981' : valuationChange < 0 ? '#E8312A' : '#666666' }}>
                {valuationChange > 0 ? '+' : ''}{valuationChange}%
              </span>
            </div>
          </div>

          {/* Additional Raise Slider */}
          <div>
            <label className="label font-medium text-gray-900 flex items-center gap-2 mb-3">
              Additional Capital Raise
              <HelpCircle className="w-4 h-4 text-gray-400" aria-label="Projected additional capital raises" />
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
              <span className="text-lg font-semibold text-gray-900 w-16">${additionalRaise}M</span>
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap Visualization */}
      <div className="card p-6">
        <h3 className="mb-4 label font-semibold text-gray-900">Scenario Sensitivity Heatmap</h3>
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
      <div className="card p-6">
        <h3 className="mb-4 label font-semibold text-gray-900">Key Impacts Summary</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 rounded-lg" style={{ background: '#F9FAFB' }}>
            <p className="caption-sm text-gray-600">Exercise Probability Impact</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">{(exerciseProbability * 0.5).toFixed(1)}%</p>
            <p className="caption-sm text-gray-500 mt-1">Est. dilution change</p>
          </div>
          <div className="p-4 rounded-lg" style={{ background: '#F9FAFB' }}>
            <p className="caption-sm text-gray-600">Valuation Change Impact</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">{(Math.abs(valuationChange) * 0.3).toFixed(1)}%</p>
            <p className="caption-sm text-gray-500 mt-1">On ownership %</p>
          </div>
          <div className="p-4 rounded-lg" style={{ background: '#F9FAFB' }}>
            <p className="caption-sm text-gray-600">Additional Raise</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">${additionalRaise}M</p>
            <p className="caption-sm text-gray-500 mt-1">Extra dilution potential</p>
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
