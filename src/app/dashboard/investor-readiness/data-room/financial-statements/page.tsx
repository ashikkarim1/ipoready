'use client'

import { useState } from 'react'
import { BarChart3, Download, Share2, TrendingUp, DollarSign } from 'lucide-react'

export default function FinancialStatementsPage() {
  const [selectedYear, setSelectedYear] = useState('2025')

  const financialData = {
    2025: {
      revenue: '$45.2M',
      netIncome: '$8.3M',
      bookValue: '$142.5M',
      debtToEquity: '0.28',
    },
    2024: {
      revenue: '$31.2M',
      netIncome: '$4.1M',
      bookValue: '$134.2M',
      debtToEquity: '0.35',
    },
    2023: {
      revenue: '$21.5M',
      netIncome: '$2.1M',
      bookValue: '$130.1M',
      debtToEquity: '0.42',
    },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="h2 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary" />
            Financial Statements
          </h1>
          <p className="body-sm text-muted-foreground mt-1">
            Audited financials and performance metrics
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border rounded-lg hover:bg-secondary transition flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            Share
          </button>
          <button className="px-4 py-2 border rounded-lg hover:bg-secondary transition flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>

      {/* Year Selector */}
      <div className="flex gap-2">
        {Object.keys(financialData).map((year) => (
          <button
            key={year}
            onClick={() => setSelectedYear(year)}
            className={`px-4 py-2 rounded-lg transition ${
              selectedYear === year
                ? 'bg-primary text-primary-foreground'
                : 'border hover:bg-secondary'
            }`}
          >
            FY {year}
          </button>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Revenue',
            value: financialData[selectedYear as '2025' | '2024' | '2023'].revenue,
            icon: DollarSign,
            change: '+44.8%',
          },
          {
            label: 'Net Income',
            value: financialData[selectedYear as '2025' | '2024' | '2023'].netIncome,
            icon: TrendingUp,
            change: '+102.4%',
          },
          {
            label: 'Book Value',
            value: financialData[selectedYear as '2025' | '2024' | '2023'].bookValue,
            icon: BarChart3,
            change: '+6.2%',
          },
          {
            label: 'Debt-to-Equity',
            value: financialData[selectedYear as '2025' | '2024' | '2023'].debtToEquity,
            icon: TrendingUp,
            change: '-20%',
          },
        ].map((metric) => (
          <div key={metric.label} className="p-4 border rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <p className="label text-muted-foreground">{metric.label}</p>
              <metric.icon className="w-4 h-4 text-primary" />
            </div>
            <p className="h4">{metric.value}</p>
            <p className="caption text-accent mt-1">{metric.change} YoY</p>
          </div>
        ))}
      </div>

      {/* Financial Statements Content */}
      <div className="border rounded-lg p-8 bg-secondary space-y-8">
        <section>
          <h2 className="h3 mb-4">Income Statement (FY {selectedYear})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 label font-medium">Item</th>
                  <th className="text-right py-2 label font-medium">Amount</th>
                  <th className="text-right py-2 label font-medium">% of Revenue</th>
                </tr>
              </thead>
              <tbody className="space-y-1">
                {[
                  { item: 'Total Revenue', amount: '$45.2M', percent: '100%' },
                  { item: 'Cost of Revenue', amount: '$(13.6M)', percent: '-30%' },
                  { item: 'Gross Profit', amount: '$31.6M', percent: '70%' },
                  { item: 'Operating Expenses', amount: '$(23.3M)', percent: '-51%' },
                  { item: 'Operating Income', amount: '$8.3M', percent: '18%' },
                  { item: 'Net Income', amount: '$8.3M', percent: '18%' },
                ].map((row) => (
                  <tr key={row.item} className="border-b hover:bg-background/50">
                    <td className="py-3 body-sm">{row.item}</td>
                    <td className="text-right py-3 body-sm font-medium">{row.amount}</td>
                    <td className="text-right py-3 body-sm">{row.percent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="pt-6 border-t">
          <h2 className="h3 mb-4">Balance Sheet Summary</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="h4 mb-3">Assets</h3>
              <ul className="space-y-2 body-sm">
                <li className="flex justify-between">
                  <span>Current Assets</span>
                  <span className="font-medium">$56.2M</span>
                </li>
                <li className="flex justify-between">
                  <span>Fixed Assets</span>
                  <span className="font-medium">$18.5M</span>
                </li>
                <li className="flex justify-between border-t pt-2">
                  <span>Total Assets</span>
                  <span className="font-medium">$142.5M</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="h4 mb-3">Liabilities & Equity</h3>
              <ul className="space-y-2 body-sm">
                <li className="flex justify-between">
                  <span>Current Liabilities</span>
                  <span className="font-medium">$28.3M</span>
                </li>
                <li className="flex justify-between">
                  <span>Long-term Debt</span>
                  <span className="font-medium">$12.8M</span>
                </li>
                <li className="flex justify-between border-t pt-2">
                  <span>Total Equity</span>
                  <span className="font-medium">$101.4M</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>

      {/* Download Section */}
      <div className="p-4 bg-secondary border rounded-lg flex items-center justify-between">
        <div>
          <p className="label font-medium">Full Financial Statements</p>
          <p className="caption text-muted-foreground">Audited by Big 4 Accounting Firm</p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition">
          Download PDF
        </button>
      </div>
    </div>
  )
}
