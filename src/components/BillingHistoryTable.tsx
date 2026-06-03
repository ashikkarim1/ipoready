'use client'

import { formatBillingDate } from '@/lib/billing-helpers'

export interface BillingTransaction {
  id: string
  date: Date
  description: string
  amount: number
  currency: 'USD' | 'CAD'
  status: 'completed' | 'pending' | 'failed'
}

interface BillingHistoryTableProps {
  transactions: BillingTransaction[]
  maxRows?: number
}

export function BillingHistoryTable({
  transactions,
  maxRows = 5,
}: BillingHistoryTableProps) {
  const displayedTransactions = transactions.slice(0, maxRows)

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  const getAmountColor = (status: string) => {
    return status === 'failed' ? 'text-red-600' : 'text-green-600'
  }

  if (displayedTransactions.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 p-6 bg-gray-50">
        <p className="text-center text-gray-600">No billing history</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      {/* Desktop table view */}
      <div className="hidden md:block">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left label font-semibold text-gray-900">Date</th>
              <th className="px-6 py-3 text-left label font-semibold text-gray-900">Description</th>
              <th className="px-6 py-3 text-right label font-semibold text-gray-900">Amount</th>
              <th className="px-6 py-3 text-center label font-semibold text-gray-900">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {displayedTransactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 body-sm text-gray-900">
                  {formatBillingDate(transaction.date)}
                </td>
                <td className="px-6 py-4 body-sm text-gray-700">{transaction.description}</td>
                <td className={`px-6 py-4 text-right text-sm font-medium ${getAmountColor(
                  transaction.status
                )}`}>
                  +${transaction.amount.toFixed(2)} {transaction.currency}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(
                    transaction.status
                  )}`}>
                    {getStatusLabel(transaction.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile stacked view */}
      <div className="md:hidden divide-y divide-gray-200">
        {displayedTransactions.map((transaction) => (
          <div key={transaction.id} className="p-4 hover:bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <p className="label font-semibold text-gray-900">{transaction.description}</p>
              <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(
                transaction.status
              )}`}>
                {getStatusLabel(transaction.status)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <p className="body-sm text-gray-600">{formatBillingDate(transaction.date)}</p>
              <p className={`text-sm font-medium ${getAmountColor(transaction.status)}`}>
                +${transaction.amount.toFixed(2)} {transaction.currency}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
