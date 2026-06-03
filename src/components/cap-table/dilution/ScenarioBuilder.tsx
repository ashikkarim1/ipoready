'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'

interface ScenarioBuilderProps {
  onCreate: (input: {
    scenarioName: string
    scenarioType: string
    warrantsExercisedPercent?: number
    warrantsExercisedShares?: number
    newFinancingAmount?: number
    newFinancingShares?: number
    employeeOptionVestingShares?: number
    projectedValuation?: number
  }) => void
  onCancel: () => void
}

type InputMode = 'percent' | 'shares'
type FinancingMode = 'amount' | 'shares'

export default function ScenarioBuilder({
  onCreate,
  onCancel,
}: ScenarioBuilderProps) {
  const [scenarioName, setScenarioName] = useState('')
  const [scenarioType, setScenarioType] = useState<
    'base' | 'optimistic' | 'conservative' | 'custom'
  >('custom')

  const [warrantMode, setWarrantMode] = useState<InputMode>('percent')
  const [warrantsPercent, setWarrantsPercent] = useState(50)
  const [warrantsShares, setWarrantsShares] = useState(0)

  const [financingMode, setFinancingMode] = useState<FinancingMode>('amount')
  const [newFinancingAmount, setNewFinancingAmount] = useState(50000000)
  const [newFinancingShares, setNewFinancingShares] = useState(0)

  const [employeeOptionVesting, setEmployeeOptionVesting] = useState(100000)
  const [projectedValuation, setProjectedValuation] = useState(500000000)

  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!scenarioName.trim()) {
      alert('Please enter a scenario name')
      return
    }

    setLoading(true)

    const input = {
      scenarioName,
      scenarioType,
      ...(warrantMode === 'percent' && { warrantsExercisedPercent: warrantsPercent }),
      ...(warrantMode === 'shares' && { warrantsExercisedShares: warrantsShares }),
      ...(financingMode === 'amount' && { newFinancingAmount }),
      ...(financingMode === 'shares' && { newFinancingShares }),
      employeeOptionVestingShares: employeeOptionVesting,
      projectedValuation,
    }

    try {
      await onCreate(input)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-slate-200 p-8"
    >
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Create Scenario</h2>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-slate-100 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block label font-medium text-slate-900 mb-2">
              Scenario Name
            </label>
            <input
              type="text"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              placeholder="e.g., Q2 2025 Financing"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block label font-medium text-slate-900 mb-2">
              Scenario Type
            </label>
            <select
              value={scenarioType}
              onChange={(e) =>
                setScenarioType(
                  e.target.value as 'base' | 'optimistic' | 'conservative' | 'custom'
                )
              }
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="custom">Custom</option>
              <option value="base">Base Case</option>
              <option value="optimistic">Optimistic</option>
              <option value="conservative">Conservative</option>
            </select>
          </div>
        </div>

        {/* Warrant Exercises */}
        <div className="border-t pt-6">
          <h3 className="font-semibold text-slate-900 mb-4">Warrant Exercises</h3>
          <div className="flex gap-4 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={warrantMode === 'percent'}
                onChange={() => setWarrantMode('percent')}
                className="w-4 h-4"
              />
              <span className="body-sm text-slate-700">By Percentage</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={warrantMode === 'shares'}
                onChange={() => setWarrantMode('shares')}
                className="w-4 h-4"
              />
              <span className="body-sm text-slate-700">By Share Count</span>
            </label>
          </div>
          {warrantMode === 'percent' && (
            <div>
              <label className="block label font-medium text-slate-900 mb-2">
                Warrants Exercised: {warrantsPercent}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={warrantsPercent}
                onChange={(e) => setWarrantsPercent(Number(e.target.value))}
                className="w-full"
              />
            </div>
          )}
          {warrantMode === 'shares' && (
            <div>
              <label className="block label font-medium text-slate-900 mb-2">
                Warrants Exercised (Shares)
              </label>
              <input
                type="number"
                value={warrantsShares}
                onChange={(e) => setWarrantsShares(Number(e.target.value))}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        {/* New Financing */}
        <div className="border-t pt-6">
          <h3 className="font-semibold text-slate-900 mb-4">New Financing</h3>
          <div className="flex gap-4 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={financingMode === 'amount'}
                onChange={() => setFinancingMode('amount')}
                className="w-4 h-4"
              />
              <span className="body-sm text-slate-700">By Amount</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={financingMode === 'shares'}
                onChange={() => setFinancingMode('shares')}
                className="w-4 h-4"
              />
              <span className="body-sm text-slate-700">By Share Count</span>
            </label>
          </div>
          {financingMode === 'amount' && (
            <div>
              <label className="block label font-medium text-slate-900 mb-2">
                Financing Amount (USD)
              </label>
              <input
                type="number"
                value={newFinancingAmount}
                onChange={(e) => setNewFinancingAmount(Number(e.target.value))}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          {financingMode === 'shares' && (
            <div>
              <label className="block label font-medium text-slate-900 mb-2">
                New Shares Issued
              </label>
              <input
                type="number"
                value={newFinancingShares}
                onChange={(e) => setNewFinancingShares(Number(e.target.value))}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        {/* Employee Options & Valuation */}
        <div className="border-t pt-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block label font-medium text-slate-900 mb-2">
                Employee Option Vesting (Shares)
              </label>
              <input
                type="number"
                value={employeeOptionVesting}
                onChange={(e) => setEmployeeOptionVesting(Number(e.target.value))}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block label font-medium text-slate-900 mb-2">
                Projected Valuation (USD)
              </label>
              <input
                type="number"
                value={projectedValuation}
                onChange={(e) => setProjectedValuation(Number(e.target.value))}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-end pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-slate-300 rounded-lg text-slate-900 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Scenario'}
          </button>
        </div>
      </form>
    </motion.div>
  )
}
