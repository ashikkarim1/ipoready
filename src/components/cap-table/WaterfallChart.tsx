'use client'

import React from 'react'

interface Tranche {
  name: string
  amount: number
  percentage: number
}

interface WaterfallChartProps {
  tranches: Tranche[]
  proceedsAmount: number
}

export function WaterfallChart({
  tranches,
  proceedsAmount,
}: WaterfallChartProps) {
  if (!tranches || tranches.length === 0) {
    return (
      <div className="border border-gray-200 rounded-lg p-6 bg-white">
        <h3 className="text-lg font-semibold mb-4">Liquidation Waterfall</h3>
        <p className="text-gray-500">No waterfall data available</p>
      </div>
    )
  }

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white">
      <h3 className="text-lg font-semibold mb-4">Liquidation Waterfall Analysis</h3>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">
            Hypothetical Proceeds: ${proceedsAmount.toLocaleString()}
          </p>
        </div>

        <div className="space-y-3">
          {tranches.map((tranche, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm">{tranche.name}</span>
                <span className="text-sm text-gray-600">
                  ${tranche.amount.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${tranche.percentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">
                {tranche.percentage.toFixed(1)}% of proceeds
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
