'use client'

import React from 'react'

interface CapTableSummaryProps {
  totalShareholders: number
  shareClasses: number
  totalSharesIssued: number
  totalSharesAuthorized: number
  validationStatus: 'valid' | 'invalid' | 'pending' | 'warning'
  lastUpdated: string | null
}

export function CapTableSummary({
  totalShareholders,
  shareClasses,
  totalSharesIssued,
  totalSharesAuthorized,
  validationStatus,
  lastUpdated,
}: CapTableSummaryProps) {
  const statusColors = {
    valid: 'text-green-600',
    invalid: 'text-red-600',
    pending: 'text-yellow-600',
    warning: 'text-orange-600',
  }

  const statusLabels = {
    valid: 'Valid',
    invalid: 'Invalid',
    pending: 'Pending',
    warning: 'Warning',
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="border border-gray-200 rounded-lg p-6 bg-white">
        <h3 className="text-sm font-medium text-gray-600 mb-4">Shareholders</h3>
        <p className="text-3xl font-bold">{totalShareholders}</p>
        <p className="text-xs text-gray-500 mt-1">Individual parties</p>
      </div>

      <div className="border border-gray-200 rounded-lg p-6 bg-white">
        <h3 className="text-sm font-medium text-gray-600 mb-4">Share Classes</h3>
        <p className="text-3xl font-bold">{shareClasses}</p>
        <p className="text-xs text-gray-500 mt-1">Class types</p>
      </div>

      <div className="border border-gray-200 rounded-lg p-6 bg-white">
        <h3 className="text-sm font-medium text-gray-600 mb-4">Shares Issued</h3>
        <p className="text-3xl font-bold">
          {(totalSharesIssued / 1000000).toFixed(1)}M
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {((totalSharesIssued / totalSharesAuthorized) * 100).toFixed(1)}% of authorized
        </p>
      </div>

      <div className="border border-gray-200 rounded-lg p-6 bg-white">
        <h3 className="text-sm font-medium text-gray-600 mb-4">Validation Status</h3>
        <p className={`text-2xl font-bold ${statusColors[validationStatus]}`}>
          {statusLabels[validationStatus]}
        </p>
        {lastUpdated && (
          <p className="text-xs text-gray-500 mt-1">
            {new Date(lastUpdated).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  )
}
