'use client'

import React, { useState } from 'react'

interface ScenarioSelectorProps {
  currentScenario: string
  onScenarioChange: (scenario: string) => void
  availableScenarios?: string[]
}

export function ScenarioSelector({
  currentScenario,
  onScenarioChange,
  availableScenarios = ['current', 'fully_diluted', 'post_ipo', 'bridge'],
}: ScenarioSelectorProps) {
  const scenarioLabels: Record<string, string> = {
    current: 'Current Cap Table',
    fully_diluted: 'Fully Diluted',
    post_ipo: 'Post-IPO (Pro Forma)',
    bridge: 'Bridge Financing',
  }

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white">
      <h3 className="text-lg font-semibold mb-4">Scenario Analysis</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
        {availableScenarios.map(scenario => (
          <button
            key={scenario}
            onClick={() => onScenarioChange(scenario)}
            className={`p-3 rounded-lg border-2 transition-colors ${
              currentScenario === scenario
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <p className="font-medium text-sm">
              {scenarioLabels[scenario] || scenario}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}
