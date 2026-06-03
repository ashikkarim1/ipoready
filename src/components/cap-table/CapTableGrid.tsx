'use client'

import React, { useMemo } from 'react'

interface Holding {
  shareholderName: string
  shareClassName: string
  quantity: number
  percentage: number
  vested: boolean
}

interface CapTableGridProps {
  holdings: Holding[]
}

export function CapTableGrid({ holdings }: CapTableGridProps) {
  const totalShares = useMemo(
    () => holdings.reduce((sum, h) => sum + h.quantity, 0),
    [holdings]
  )

  if (!holdings || holdings.length === 0) {
    return (
      <div className="border border-gray-200 rounded-lg p-6 bg-white">
        <h3 className="h4 font-semibold mb-4">Holdings</h3>
        <p className="text-gray-500">No holdings to display</p>
      </div>
    )
  }

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white">
      <h3 className="h4 font-semibold mb-4">Holdings</h3>
      <div className="overflow-x-auto">
        <table className="w-full body-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-2 font-semibold">Shareholder</th>
              <th className="text-left py-2 px-2 font-semibold">Share Class</th>
              <th className="text-right py-2 px-2 font-semibold">Quantity</th>
              <th className="text-right py-2 px-2 font-semibold">Percentage</th>
              <th className="text-center py-2 px-2 font-semibold">Vested</th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((holding, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                <td className="py-2 px-2">{holding.shareholderName}</td>
                <td className="py-2 px-2">{holding.shareClassName}</td>
                <td className="py-2 px-2 text-right">
                  {holding.quantity.toLocaleString()}
                </td>
                <td className="py-2 px-2 text-right">
                  {((holding.quantity / totalShares) * 100).toFixed(2)}%
                </td>
                <td className="py-2 px-2 text-center">
                  <span
                    className={`inline-block w-3 h-3 rounded-full ${
                      holding.vested ? 'bg-green-500' : 'bg-yellow-500'
                    }`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
