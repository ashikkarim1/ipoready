'use client'
import { PieChart, TrendingUp, AlertTriangle } from 'lucide-react'

const budgetItems = [
  { category: 'Legal & Compliance', budgeted: 5000000, spent: 3200000, status: 'on-track' },
  { category: 'Accounting & Audit', budgeted: 2500000, spent: 1800000, status: 'on-track' },
  { category: 'Underwriting', budgeted: 5000000, spent: 4500000, status: 'at-risk' },
  { category: 'Marketing & IR', budgeted: 1500000, spent: 900000, status: 'on-track' },
  { category: 'Technology & Systems', budgeted: 1000000, spent: 600000, status: 'on-track' },
  { category: 'Exchange Fees', budgeted: 2500000, spent: 2500000, status: 'complete' },
]

export default function BudgetTrackingPage() {
  const totalBudgeted = budgetItems.reduce((sum, item) => sum + item.budgeted, 0)
  const totalSpent = budgetItems.reduce((sum, item) => sum + item.spent, 0)
  const totalRemaining = totalBudgeted - totalSpent
  const percentageSpent = ((totalSpent / totalBudgeted) * 100).toFixed(1)

  return (
    <div className="space-y-6 p-6 min-h-screen" style={{ background: '#F7F6F4', colorScheme: 'light' }}>
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <PieChart className="w-5 h-5" style={{ color: '#E8312A' }} />
          <h1 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>Budget Tracking</h1>
        </div>
        <p style={{ color: '#717171' }}>Monitor IPO-related expenses and track budget allocation</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 rounded-lg" style={{ background: '#FFFFFF', border: '1px solid #E5E4E0' }}>
          <p className="text-xs font-semibold mb-2" style={{ color: '#9A9A9A' }}>TOTAL BUDGETED</p>
          <p className="text-xl font-bold" style={{ color: '#1A1A1A' }}>${(totalBudgeted / 1000000).toFixed(1)}M</p>
        </div>
        <div className="p-4 rounded-lg" style={{ background: '#FFFFFF', border: '1px solid #E5E4E0' }}>
          <p className="text-xs font-semibold mb-2" style={{ color: '#9A9A9A' }}>TOTAL SPENT</p>
          <p className="text-xl font-bold" style={{ color: '#1A1A1A' }}>${(totalSpent / 1000000).toFixed(1)}M</p>
        </div>
        <div className="p-4 rounded-lg" style={{ background: '#FFFFFF', border: '1px solid #E5E4E0' }}>
          <p className="text-xs font-semibold mb-2" style={{ color: '#9A9A9A' }}>REMAINING</p>
          <p className="text-xl font-bold" style={{ color: '#1A1A1A' }}>${(totalRemaining / 1000000).toFixed(1)}M</p>
        </div>
        <div className="p-4 rounded-lg" style={{ background: '#FFFFFF', border: '1px solid #E5E4E0' }}>
          <p className="text-xs font-semibold mb-2" style={{ color: '#9A9A9A' }}>SPENT %</p>
          <p className="text-xl font-bold" style={{ color: '#1A1A1A' }}>{percentageSpent}%</p>
        </div>
      </div>

      {/* Budget Items Table */}
      <div className="rounded-lg overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid #E5E4E0' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid #E5E4E0' }}>
                <th className="text-left p-4 text-xs font-semibold" style={{ color: '#717171' }}>CATEGORY</th>
                <th className="text-right p-4 text-xs font-semibold" style={{ color: '#717171' }}>BUDGETED</th>
                <th className="text-right p-4 text-xs font-semibold" style={{ color: '#717171' }}>SPENT</th>
                <th className="text-right p-4 text-xs font-semibold" style={{ color: '#717171' }}>REMAINING</th>
                <th className="text-right p-4 text-xs font-semibold" style={{ color: '#717171' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {budgetItems.map((item, idx) => {
                const remaining = item.budgeted - item.spent
                const percentage = ((item.spent / item.budgeted) * 100).toFixed(0)
                const statusColor = item.status === 'on-track' ? '#2D7A5F' : item.status === 'complete' ? '#717171' : '#B45309'
                const statusLabel = item.status === 'on-track' ? 'On Track' : item.status === 'complete' ? 'Complete' : 'At Risk'

                return (
                  <tr key={idx} style={{ borderBottom: idx < budgetItems.length - 1 ? '1px solid #E5E4E0' : 'none' }}>
                    <td className="p-4 font-medium" style={{ color: '#1A1A1A' }}>{item.category}</td>
                    <td className="text-right p-4" style={{ color: '#1A1A1A' }}>${(item.budgeted / 1000000).toFixed(1)}M</td>
                    <td className="text-right p-4" style={{ color: '#1A1A1A' }}>${(item.spent / 1000000).toFixed(1)}M</td>
                    <td className="text-right p-4" style={{ color: '#1A1A1A' }}>${(remaining / 1000000).toFixed(1)}M</td>
                    <td className="text-right p-4">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-24 h-2 rounded-full" style={{ background: '#F0EFED' }}>
                          <div className="h-2 rounded-full" style={{ width: `${percentage}%`, background: statusColor }} />
                        </div>
                        <span className="text-xs font-semibold whitespace-nowrap" style={{ color: statusColor }}>{statusLabel}</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alert */}
      <div className="p-4 rounded-lg flex gap-3" style={{ background: '#FEF3C7', border: '1px solid #B45309' }}>
        <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: '#B45309' }} />
        <div>
          <p className="font-semibold text-sm" style={{ color: '#7C2D12' }}>Underwriting costs at 90% of budget</p>
          <p className="text-xs mt-1" style={{ color: '#7C2D12' }}>Review underwriting arrangements or increase budget allocation.</p>
        </div>
      </div>
    </div>
  )
}
