'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Lock, Save, Zap, AlertCircle } from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import { isFeatureLocked, getUpgradeMessage } from '@/lib/cap-table-feature-gates'

interface ShareholderSnapshot {
  name: string
  currentShares: number
  currentOwnership: number
  simulatedShares: number
  simulatedOwnership: number
  dilutionImpact: number
}

interface SimulatorProps {
  currentCapTable: Array<{ name: string; shares: number }>
  totalCurrentShares: number
}

export function ScenarioSimulator({ currentCapTable, totalCurrentShares }: SimulatorProps) {
  const userPlan = useAppStore((s) => s.userPlan)
  const [futureValuation, setFutureValuation] = useState<number>(50000000)
  const [amountRaised, setAmountRaised] = useState<number>(10000000)
  const [showResults, setShowResults] = useState(false)
  const [savedScenarios, setSavedScenarios] = useState<Array<{ name: string; date: string }>>([])

  const isLocked = isFeatureLocked('scenario', userPlan)
  const upgradeMessage = getUpgradeMessage('scenario', userPlan)

  // Calculate dilution impact
  const simulationResults = useMemo(() => {
    if (futureValuation <= 0 || amountRaised <= 0) return null

    // New shares from this round
    const pricePerShare = futureValuation / totalCurrentShares
    const newShares = Math.round(amountRaised / pricePerShare)
    const newTotalShares = totalCurrentShares + newShares

    // Calculate dilution for each shareholder
    const results: ShareholderSnapshot[] = currentCapTable.map((holder) => {
      const currentOwnership = (holder.shares / totalCurrentShares) * 100
      const simulatedOwnership = (holder.shares / newTotalShares) * 100
      const dilutionImpact = currentOwnership - simulatedOwnership

      return {
        name: holder.name,
        currentShares: holder.shares,
        currentOwnership,
        simulatedShares: holder.shares,
        simulatedOwnership,
        dilutionImpact,
      }
    })

    // Add new investor
    results.push({
      name: 'New Investor',
      currentShares: 0,
      currentOwnership: 0,
      simulatedShares: newShares,
      simulatedOwnership: (newShares / newTotalShares) * 100,
      dilutionImpact: 0,
    })

    return {
      results,
      newShares,
      newTotalShares,
      averageDilution: results.reduce((sum, r) => sum + r.dilutionImpact, 0) / (results.length - 1),
    }
  }, [futureValuation, amountRaised, currentCapTable, totalCurrentShares])

  const handleSimulate = () => {
    if (futureValuation <= 0 || amountRaised <= 0) {
      alert('Please enter valid values for both valuation and amount raised')
      return
    }
    setShowResults(true)
  }

  const handleSaveScenario = () => {
    const scenarioName = `${(futureValuation / 1000000).toFixed(0)}M @ $${(amountRaised / 1000000).toFixed(1)}M raised`
    setSavedScenarios([...savedScenarios, { name: scenarioName, date: new Date().toLocaleDateString() }])
  }

  if (isLocked) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-dashed border-slate-300 rounded-lg p-8 text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Lock className="w-12 h-12 text-slate-400" />
            <div>
              <h3 className="h4 font-bold text-slate-900 mb-2">Scenario Modeling Locked</h3>
              <p className="body-sm text-slate-600 mb-4">{upgradeMessage}</p>
              <a
                href="/pricing"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                View Plans
              </a>
            </div>
          </div>
        </div>

        {/* Disabled inputs shown behind overlay */}
        <div className="opacity-50 pointer-events-none space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block label font-medium text-slate-700 mb-2">
                Future Valuation (USD)
              </label>
              <input
                type="number"
                disabled
                value={futureValuation}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-100"
              />
            </div>
            <div>
              <label className="block label font-medium text-slate-700 mb-2">
                Amount Raised (USD)
              </label>
              <input
                type="number"
                disabled
                value={amountRaised}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-100"
              />
            </div>
          </div>
          <button
            disabled
            className="w-full bg-slate-300 text-slate-500 py-2 rounded-lg font-semibold cursor-not-allowed"
          >
            Simulate
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg border border-slate-200 p-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <Zap className="w-6 h-6 text-amber-500" />
        <h2 className="text-2xl font-bold text-slate-900">Scenario Simulator</h2>
      </div>

      <p className="text-slate-600 mb-6">
        Model how a future funding round would impact ownership percentages and dilution
      </p>

      {/* Input Section */}
      <div className="space-y-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block label font-medium text-slate-700 mb-2">
              Future Valuation (USD) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={futureValuation}
              onChange={(e) => setFutureValuation(parseFloat(e.target.value) || 0)}
              min="0"
              step="1000000"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="50000000"
            />
            <p className="caption-sm text-slate-500 mt-1">
              ${(futureValuation / 1000000).toFixed(1)}M valuation
            </p>
          </div>

          <div>
            <label className="block label font-medium text-slate-700 mb-2">
              Amount Raised (USD) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={amountRaised}
              onChange={(e) => setAmountRaised(parseFloat(e.target.value) || 0)}
              min="0"
              step="1000000"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="10000000"
            />
            <p className="caption-sm text-slate-500 mt-1">
              ${(amountRaised / 1000000).toFixed(1)}M raised
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSimulate}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Zap className="w-5 h-5" />
          Simulate
        </motion.button>
      </div>

      {/* Results Section */}
      {showResults && simulationResults && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-6"
        >
          <div>
            <h3 className="font-bold text-slate-900 mb-4">Current vs. Simulated Ownership</h3>

            <div className="overflow-x-auto">
              <table className="w-full body-sm">
                <thead>
                  <tr className="border-b-2 border-blue-300">
                    <th className="text-left py-2 px-3 font-semibold text-slate-900">Shareholder</th>
                    <th className="text-right py-2 px-3 font-semibold text-slate-900">Current %</th>
                    <th className="text-right py-2 px-3 font-semibold text-slate-900">Simulated %</th>
                    <th className="text-right py-2 px-3 font-semibold text-slate-900">Impact</th>
                  </tr>
                </thead>
                <tbody>
                  {simulationResults.results.map((holder, idx) => (
                    <tr
                      key={`${holder.name}-${idx}`}
                      className={`border-b border-blue-100 ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-blue-100/30'
                      }`}
                    >
                      <td className="py-2 px-3 text-slate-900 font-medium">{holder.name}</td>
                      <td className="py-2 px-3 text-right text-slate-700">
                        {holder.currentOwnership.toFixed(2)}%
                      </td>
                      <td className="py-2 px-3 text-right text-slate-700">
                        {holder.simulatedOwnership.toFixed(2)}%
                      </td>
                      <td
                        className={`py-2 px-3 text-right font-semibold ${
                          holder.dilutionImpact < 0
                            ? 'text-red-600'
                            : holder.dilutionImpact > 0
                            ? 'text-green-600'
                            : 'text-slate-600'
                        }`}
                      >
                        {holder.dilutionImpact >= 0 ? '+' : ''}
                        {holder.dilutionImpact.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-white rounded-lg border border-blue-200">
            <div>
              <p className="caption-sm text-slate-600 uppercase mb-1">New Shares Issued</p>
              <p className="h4 font-bold text-slate-900">
                {(simulationResults.newShares / 1000000).toFixed(2)}M
              </p>
            </div>
            <div>
              <p className="caption-sm text-slate-600 uppercase mb-1">New Total</p>
              <p className="h4 font-bold text-slate-900">
                {(simulationResults.newTotalShares / 1000000).toFixed(2)}M
              </p>
            </div>
            <div>
              <p className="caption-sm text-slate-600 uppercase mb-1">Avg Dilution</p>
              <p className="h4 font-bold text-slate-900">
                {simulationResults.averageDilution.toFixed(2)}%
              </p>
            </div>
          </div>

          {/* Save Scenario Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSaveScenario}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            Save Scenario
          </motion.button>

          {savedScenarios.length > 0 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="label font-semibold text-green-900 mb-2">Saved Scenarios ({savedScenarios.length})</p>
              <div className="space-y-1">
                {savedScenarios.map((scenario, idx) => (
                  <p key={idx} className="caption-sm text-green-800">
                    {scenario.name} - {scenario.date}
                  </p>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
