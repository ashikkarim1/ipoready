'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { AlertCircle, TrendingDown, DollarSign, Zap, Calendar } from 'lucide-react'

interface RiskFactor {
  label: string
  value: number | string
  impact: 'critical' | 'warning' | 'info'
  description: string
  icon: 'alert' | 'clock' | 'trending'
}

interface MonthlyData {
  month: string
  budget: number
  actual: number
  variance_pct: number
}

interface FinancialKPIDashboardProps {
  data: {
    estimatedCost: number
    actualSpent: number
    budget: number
    currencyCode: string
    ipoDate: Date | string
    monthlyData: MonthlyData[]
    costPerDay: number
    runwayDays: number
    riskFactors: RiskFactor[]
    delayRiskPerDay: number
    estimatedDaysDelay: number
  }
  companyName?: string
}

export function FinancialKPIDashboard({ data, companyName = 'Company' }: FinancialKPIDashboardProps) {
  const kpis = {
    estimatedTotalCost: data.estimatedCost,
    actualSpentYTD: data.actualSpent,
    monthlyBurnRate: data.costPerDay * 30,
    runwayMonths: data.runwayDays / 30,
  }

  const tracking = data.monthlyData.map(m => ({
    month: m.month,
    budgeted: m.budget,
    actual: m.actual,
    status: m.variance_pct > 10 ? 'warning' : 'normal'
  }))

  const riskFactors = data.riskFactors.map(rf => rf.description)

  const kpiCards = [
    {
      label: 'Estimated Total Cost',
      value: `$${kpis.estimatedTotalCost.toLocaleString()}`,
      icon: DollarSign,
      color: 'blue',
      description: 'Complete IPO cost estimate'
    },
    {
      label: 'Actual Spent YTD',
      value: `$${kpis.actualSpentYTD.toLocaleString()}`,
      icon: TrendingDown,
      color: 'green',
      description: 'Year-to-date actual expenses'
    },
    {
      label: 'Monthly Burn Rate',
      value: `$${kpis.monthlyBurnRate.toLocaleString()}`,
      icon: Zap,
      color: 'orange',
      description: 'Average monthly spending'
    },
    {
      label: 'Runway Months',
      value: `${kpis.runwayMonths} months`,
      icon: Calendar,
      color: 'purple',
      description: 'Months until budget exhausted'
    }
  ]

  const colorMap = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
  }

  const colorTextMap = {
    blue: 'text-blue-900 dark:text-blue-100',
    green: 'text-green-900 dark:text-green-100',
    orange: 'text-orange-900 dark:text-orange-100',
    purple: 'text-purple-900 dark:text-purple-100',
  }

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-lg">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Financial KPI Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400">Monitor IPO budget and spending across 6 months</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card, idx) => {
          const Icon = card.icon
          const bgClass = colorMap[card.color as keyof typeof colorMap]
          const textClass = colorTextMap[card.color as keyof typeof colorTextMap]
          return (
            <div key={idx} className={`${bgClass} border rounded-lg p-6`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{card.label}</p>
                  <p className={`text-3xl font-bold ${textClass}`}>{card.value}</p>
                </div>
                <Icon className={`h-8 w-8 ${textClass} opacity-60`} />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">{card.description}</p>
            </div>
          )
        })}
      </div>

      {/* Chart */}
      {tracking.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Budget vs Actual (6 Months)</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={tracking}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip formatter={(value: any) => `$${value.toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="budgeted" stroke="#3b82f6" strokeWidth={2} name="Budgeted" />
              <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} name="Actual" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Risk Factors */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Risk Factors</h2>
        <ul className="space-y-3">
          {riskFactors.map((factor, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <span className="text-slate-700 dark:text-slate-300">{factor}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Board-Ready Summary */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 rounded-lg p-6 shadow-sm text-white">
        <h2 className="text-2xl font-bold mb-4">Board-Ready Summary</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="opacity-90 mb-1">Budget Utilization</p>
            <p className="text-2xl font-bold">{kpis.actualSpentYTD > 0 ? Math.round((kpis.actualSpentYTD / kpis.estimatedTotalCost) * 100) : 0}%</p>
          </div>
          <div>
            <p className="opacity-90 mb-1">Remaining Budget</p>
            <p className="text-2xl font-bold">${(kpis.estimatedTotalCost - kpis.actualSpentYTD).toLocaleString()}</p>
          </div>
        </div>
        <button className="mt-4 bg-white text-blue-600 px-4 py-2 rounded font-medium hover:bg-blue-50 transition">
          Export as PDF
        </button>
      </div>
    </div>
  )
}
