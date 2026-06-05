'use client'

import { useState } from 'react'
import { BarChart3, Download, Share2, TrendingUp, DollarSign } from 'lucide-react'

export default function FinancialStatementsPage() {
  const [selectedYear, setSelectedYear] = useState('2025')

  const years = ['2023', '2024', '2025']
  const financials = {
    2025: { revenue: '$45.2M', netIncome: '$8.3M', gross: '70%', ebitda: '$12.1M' },
    2024: { revenue: '$31.2M', netIncome: '$4.1M', gross: '68%', ebitda: '$7.8M' },
    2023: { revenue: '$21.5M', netIncome: '$2.1M', gross: '65%', ebitda: '$4.2M' },
  }

  const current = financials[selectedYear as '2025' | '2024' | '2023']

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="h2 mb-2">Financial Statements</h1>
              <p className="body text-muted-foreground">Audited financial data and performance metrics</p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-secondary transition flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                <span className="body-sm">Share</span>
              </button>
              <button className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition flex items-center gap-2">
                <Download className="w-4 h-4" />
                <span className="body-sm">Download</span>
              </button>
            </div>
          </div>

          {/* Year Selector */}
          <div className="flex gap-2">
            {years.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-4 py-2 rounded-lg transition ${
                  selectedYear === year ? 'bg-primary text-white' : 'border border-gray-300 hover:bg-secondary'
                }`}
              >
                FY {year}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Revenue', value: current.revenue, icon: DollarSign, change: '+44.8%' },
            { label: 'Net Income', value: current.netIncome, icon: TrendingUp, change: '+102.4%' },
            { label: 'Gross Margin', value: current.gross, icon: BarChart3, change: '+2%' },
            { label: 'EBITDA', value: current.ebitda, icon: DollarSign, change: '+55%' },
          ].map((metric) => (
            <div key={metric.label} className="p-6 border border-gray-200 rounded-lg bg-secondary hover:shadow-sm transition">
              <div className="flex items-start justify-between mb-4">
                <p className="label text-muted-foreground">{metric.label}</p>
                <metric.icon className="w-5 h-5 text-primary" />
              </div>
              <p className="h3 mb-2">{metric.value}</p>
              <p className="caption text-accent">{metric.change} YoY</p>
            </div>
          ))}
        </div>

        {/* Income Statement */}
        <section className="border-b border-gray-200 pb-12 mb-12">
          <h2 className="h3 mb-6">Income Statement</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 label font-medium">Item</th>
                  <th className="text-right py-3 label font-medium">FY {selectedYear}</th>
                  <th className="text-right py-3 label font-medium">% of Revenue</th>
                  <th className="text-right py-3 label font-medium">YoY Growth</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { item: 'Total Revenue', amount: current.revenue, percent: '100%', growth: '+44.8%' },
                  { item: 'Cost of Revenue', amount: '$(13.6M)', percent: '-30%', growth: '+38%' },
                  { item: 'Gross Profit', amount: '$31.6M', percent: '70%', growth: '+48%' },
                  { item: 'R&D', amount: '$(8.2M)', percent: '-18%', growth: '+52%' },
                  { item: 'Sales & Marketing', amount: '$(12.1M)', percent: '-27%', growth: '+42%' },
                  { item: 'G&A', amount: '$(2.8M)', percent: '-6%', growth: '+28%' },
                  { item: 'Operating Income', amount: '$8.5M', percent: '19%', growth: '+185%' },
                  { item: 'Net Income', amount: current.netIncome, percent: '18%', growth: '+102.4%' },
                ].map((row) => (
                  <tr key={row.item} className="border-b border-gray-100 hover:bg-secondary transition">
                    <td className="py-3 body-sm">{row.item}</td>
                    <td className="text-right py-3 body-sm font-medium">{row.amount}</td>
                    <td className="text-right py-3 body-sm">{row.percent}</td>
                    <td className="text-right py-3 body-sm text-accent">{row.growth}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Balance Sheet */}
        <section>
          <h2 className="h3 mb-6">Balance Sheet Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 border border-gray-200 rounded-lg bg-secondary">
              <h3 className="h4 mb-6">Assets</h3>
              <div className="space-y-3">
                {[
                  { item: 'Cash & Equivalents', value: '$18.5M' },
                  { item: 'Accounts Receivable', value: '$12.3M' },
                  { item: 'Current Assets', value: '$56.2M' },
                  { item: 'Fixed Assets', value: '$18.5M' },
                  { item: 'Intangibles', value: '$8.2M' },
                ].map((asset) => (
                  <div key={asset.item} className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="body-sm">{asset.item}</span>
                    <span className="body-sm font-medium">{asset.value}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2 border-t-2 border-gray-300">
                  <span className="label font-bold">Total Assets</span>
                  <span className="h4">$142.5M</span>
                </div>
              </div>
            </div>

            <div className="p-6 border border-gray-200 rounded-lg bg-secondary">
              <h3 className="h4 mb-6">Liabilities & Equity</h3>
              <div className="space-y-3">
                {[
                  { item: 'Accounts Payable', value: '$8.2M' },
                  { item: 'Accrued Expenses', value: '$6.1M' },
                  { item: 'Current Liabilities', value: '$28.3M' },
                  { item: 'Long-term Debt', value: '$12.8M' },
                  { item: 'Shareholders Equity', value: '$101.4M' },
                ].map((liability) => (
                  <div key={liability.item} className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="body-sm">{liability.item}</span>
                    <span className="body-sm font-medium">{liability.value}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2 border-t-2 border-gray-300">
                  <span className="label font-bold">Total Liabilities & Equity</span>
                  <span className="h4">$142.5M</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
