'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Save, Loader2 } from 'lucide-react'
import { CompanyParameters } from '@/types/ipo-simulator'

interface ScenarioBuilderProps {
  onSimulate: (params: CompanyParameters) => Promise<void>
  onSave: (scenario: any) => Promise<void>
  isLoading: boolean
}

const defaultParams: CompanyParameters = {
  // Capital Structure
  float: 20,
  raiseAmount: 200,
  valuation: 8,

  // Board
  boardSize: 7,
  boardIndependence: 60,
  boardDiversity: 40,

  // Ownership
  insiderOwnership: 45,
  vcOwnership: 35,
  employeeOwnership: 10,
  lockupPeriod: 12,

  // Execution
  marketMakerTier: 1,
  exchange: 'NASDAQ',

  // Context
  sector: 'Technology',
  revenue: 150,
  growthRate: 25,
  country: 'US',
}

export default function ScenarioBuilder({
  onSimulate,
  onSave,
  isLoading,
}: ScenarioBuilderProps) {
  const [params, setParams] = useState<CompanyParameters>(defaultParams)

  const handleParamChange = (key: keyof CompanyParameters, value: any) => {
    setParams((prev) => ({ ...prev, [key]: value }))
  }

  const handleSimulate = () => {
    onSimulate(params)
  }

  return (
    <motion.div className="space-y-4">
      {/* Capital Structure */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Capital Structure
        </h3>

        <div>
          <label className="label mb-1 block">Float: {params.float}%</label>
          <input
            type="range"
            min="15"
            max="40"
            value={params.float}
            onChange={(e) => handleParamChange('float', Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="label mb-1 block">Raise Amount: ${params.raiseAmount}M</label>
          <input
            type="range"
            min="50"
            max="500"
            step="10"
            value={params.raiseAmount}
            onChange={(e) => handleParamChange('raiseAmount', Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="label mb-1 block">Valuation: ${params.valuation}B</label>
          <input
            type="range"
            min="2"
            max="15"
            step="0.5"
            value={params.valuation}
            onChange={(e) => handleParamChange('valuation', Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      {/* Board */}
      <div className="space-y-3 border-t border-slate-200 pt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Board Composition
        </h3>

        <div>
          <label className="label mb-1 block">Independence: {params.boardIndependence}%</label>
          <input
            type="range"
            min="30"
            max="100"
            value={params.boardIndependence}
            onChange={(e) => handleParamChange('boardIndependence', Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="label mb-1 block">Diversity: {params.boardDiversity}%</label>
          <input
            type="range"
            min="0"
            max="100"
            value={params.boardDiversity}
            onChange={(e) => handleParamChange('boardDiversity', Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      {/* Ownership */}
      <div className="space-y-3 border-t border-slate-200 pt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Ownership Structure
        </h3>

        <div>
          <label className="label mb-1 block">Insiders: {params.insiderOwnership}%</label>
          <input
            type="range"
            min="20"
            max="70"
            value={params.insiderOwnership}
            onChange={(e) => handleParamChange('insiderOwnership', Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="label mb-1 block">Lock-up: {params.lockupPeriod}m</label>
          <select
            value={params.lockupPeriod}
            onChange={(e) => handleParamChange('lockupPeriod', Number(e.target.value))}
            className="w-full rounded-lg border border-slate-200 p-2 text-sm"
          >
            <option value="6">6 months</option>
            <option value="9">9 months</option>
            <option value="12">12 months</option>
            <option value="18">18 months</option>
            <option value="24">24 months</option>
          </select>
        </div>
      </div>

      {/* Execution */}
      <div className="space-y-3 border-t border-slate-200 pt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Execution
        </h3>

        <div>
          <label className="label mb-1 block">Exchange</label>
          <select
            value={params.exchange}
            onChange={(e) => handleParamChange('exchange', e.target.value)}
            className="w-full rounded-lg border border-slate-200 p-2 text-sm"
          >
            <option>NASDAQ</option>
            <option>NYSE</option>
            <option>TSX</option>
            <option>TSXV</option>
          </select>
        </div>

        <div>
          <label className="label mb-1 block">Market Maker Tier</label>
          <select
            value={params.marketMakerTier}
            onChange={(e) => handleParamChange('marketMakerTier', Number(e.target.value))}
            className="w-full rounded-lg border border-slate-200 p-2 text-sm"
          >
            <option value="1">Tier 1 (Goldman, Morgan Stanley)</option>
            <option value="2">Tier 2 (Regional)</option>
            <option value="3">Tier 3 (Small)</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 border-t border-slate-200 pt-4">
        <button
          onClick={handleSimulate}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 font-medium text-white transition-all hover:bg-accent-dark disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          {isLoading ? 'Simulating...' : 'Simulate'}
        </button>

        <button
          className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-3 font-medium text-nav transition-all hover:bg-slate-50"
        >
          <Save className="h-4 w-4" />
          Save Scenario
        </button>
      </div>
    </motion.div>
  )
}
