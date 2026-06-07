'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Plus, Play, Save, Download } from 'lucide-react'
import { CompanyParameters, IPOScenario, SimulationResults } from '@/types/ipo-simulator'
import ScenarioBuilder from './components/ScenarioBuilder'
import SimulationResultsComponent from './components/SimulationResults'
import WhatIfSliders from './components/WhatIfSliders'

export default function IPOSimulator() {
  const [scenarios, setScenarios] = useState<IPOScenario[]>([])
  const [activeScenario, setActiveScenario] = useState<IPOScenario | null>(null)
  const [simulationResults, setSimulationResults] = useState<SimulationResults | null>(null)
  const [loading, setLoading] = useState(false)

  const handleRunSimulation = async (parameters: CompanyParameters) => {
    setLoading(true)
    try {
      const response = await fetch('/api/ipo-simulator/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parameters,
          scenarioName: 'My Scenario',
          scenarioType: 'custom',
        }),
      })

      if (!response.ok) {
        throw new Error('Simulation failed')
      }

      const results = await response.json()
      setSimulationResults(results)
    } catch (error) {
      console.error('Simulation error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveScenario = async (scenario: IPOScenario) => {
    // Save scenario to database
    // TODO: API call
    setScenarios([...scenarios, scenario])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="h1 mb-2">🎮 IPO Simulator</h1>
            <p className="text-text-muted">
              Model your IPO scenario and see how your decisions affect stock performance, analyst
              coverage, and institutional demand.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left: Input Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="h4 mb-6">Your IPO Scenario</h2>

              <ScenarioBuilder
                onSimulate={handleRunSimulation}
                onSave={handleSaveScenario}
                isLoading={loading}
              />

              {/* Saved Scenarios */}
              {scenarios.length > 0 && (
                <div className="mt-8 border-t border-slate-200 pt-6">
                  <h3 className="text-sm font-semibold text-nav mb-3">Saved Scenarios</h3>
                  <div className="space-y-2">
                    {scenarios.map((scenario) => (
                      <button
                        key={scenario.id}
                        onClick={() => setActiveScenario(scenario)}
                        className="w-full rounded-lg border border-slate-200 p-3 text-left text-sm transition-all hover:border-accent hover:bg-slate-50"
                      >
                        <div className="font-medium text-nav">{scenario.name}</div>
                        <div className="text-xs text-text-muted">{scenario.scenario_type}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Right: Results Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            {simulationResults ? (
              <SimulationResultsComponent results={simulationResults} />
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
                <Play className="mx-auto mb-4 h-12 w-12 text-text-muted opacity-50" />
                <h3 className="text-text-muted mb-2">Run a simulation</h3>
                <p className="text-sm text-text-light">
                  Adjust your parameters on the left and click "Simulate" to see how your IPO
                  decisions affect outcomes.
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* What-If Analysis */}
        {simulationResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <WhatIfSliders
              onSimulate={handleRunSimulation}
              isLoading={loading}
            />
          </motion.div>
        )}
      </div>
    </div>
  )
}
