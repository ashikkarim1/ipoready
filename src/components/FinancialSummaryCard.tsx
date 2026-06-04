'use client'

import { Download, BarChart3, Calendar } from 'lucide-react'

interface SummaryData {
  estimated_cost: number
  actual_spent: number
  monthly_burn_rate: number
  runway_months: number
  variance_pct: number
}

interface FinancialSummaryCardProps {
  data: SummaryData
  onExportPDF?: () => void
  isExporting?: boolean
  companyName?: string
  reportDate?: Date
}

export function FinancialSummaryCard({
  data,
  onExportPDF,
  isExporting = false,
  companyName = 'Your Company',
  reportDate = new Date(),
}: FinancialSummaryCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const remaining = data.estimated_cost - data.actual_spent
  const isOverBudget = data.variance_pct > 0
  const varianceColor = isOverBudget ? 'text-red-600' : 'text-green-600'
  const budgetStatus = isOverBudget ? 'Over Budget' : 'On Track'
  const budgetStatusColor = isOverBudget ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      {/* Header with export button */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="h4 font-semibold text-slate-900">Executive Summary</h3>
          <p className="body-sm text-slate-500 mt-1">Board-ready financial snapshot</p>
        </div>
        <button
          onClick={onExportPDF}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors label font-medium"
        >
          <Download className="w-4 h-4" />
          {isExporting ? 'Exporting...' : 'Export PDF'}
        </button>
      </div>

      {/* Company info and date */}
      <div className="mb-6 p-4 rounded-lg bg-slate-50 border border-slate-200">
        <div className="grid grid-cols-2 gap-4 body-sm">
          <div>
            <p className="text-slate-600 font-medium">Company</p>
            <p className="text-slate-900 font-semibold">{companyName}</p>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Calendar className="w-4 h-4" />
            <div>
              <p className="text-slate-600 font-medium">Report Date</p>
              <p className="text-slate-900 font-semibold">
                {reportDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Status Indicator */}
      <div className={`mb-6 p-4 rounded-lg border ${budgetStatusColor}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-semibold ${isOverBudget ? 'text-red-700' : 'text-green-700'}`}>
              Budget Status
            </p>
            <p className={`text-2xl font-bold mt-1 ${isOverBudget ? 'text-red-900' : 'text-green-900'}`}>
              {budgetStatus}
            </p>
          </div>
          <div className="text-right">
            <p className={`text-sm font-semibold ${isOverBudget ? 'text-red-700' : 'text-green-700'}`}>
              Variance
            </p>
            <p className={`text-2xl font-bold mt-1 ${varianceColor}`}>
              {isOverBudget ? '+' : ''}{Math.round(data.variance_pct)}%
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
          <p className="label-sm text-blue-700 font-semibold mb-1">Budget Estimate</p>
          <p className="h4 font-bold text-blue-900">{formatCurrency(data.estimated_cost)}</p>
          <p className="caption-sm text-blue-600 mt-1">Total IPO cost</p>
        </div>

        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <p className="label-sm text-red-700 font-semibold mb-1">Actual Spent</p>
          <p className="h4 font-bold text-red-900">{formatCurrency(data.actual_spent)}</p>
          <p className="caption-sm text-red-600 mt-1">To date</p>
        </div>

        <div className="p-4 rounded-lg bg-green-50 border border-green-200">
          <p className="label-sm text-green-700 font-semibold mb-1">Remaining</p>
          <p className="h4 font-bold text-green-900">{formatCurrency(remaining)}</p>
          <p className="caption-sm text-green-600 mt-1">Available</p>
        </div>

        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
          <p className="label-sm text-amber-700 font-semibold mb-1">Monthly Burn</p>
          <p className="h4 font-bold text-amber-900">{formatCurrency(data.monthly_burn_rate)}</p>
          <p className="caption-sm text-amber-600 mt-1">Average spend</p>
        </div>
      </div>

      {/* Runway Analysis */}
      <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-5 h-5 text-slate-700" />
          <h4 className="font-semibold text-slate-900">IPO Runway</h4>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="label text-slate-600 font-medium">Months Remaining</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">
              {Math.max(0, data.runway_months)}
            </p>
            <p className="caption-sm text-slate-500 mt-1">At current burn rate</p>
          </div>
          <div>
            <p className="label text-slate-600 font-medium">Burn Rate</p>
            <p className="h4 font-bold text-slate-900 mt-1">
              {formatCurrency(data.monthly_burn_rate)}
            </p>
            <p className="caption-sm text-slate-500 mt-1">Per month</p>
          </div>
        </div>

        {/* Runway visual indicator */}
        <div className="mt-4 flex items-center gap-2">
          <div className="flex-1 h-3 rounded-full bg-slate-200 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                data.runway_months > 12
                  ? 'bg-green-500'
                  : data.runway_months > 6
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{
                width: `${Math.min(100, (data.runway_months / 24) * 100)}%`,
              }}
            />
          </div>
          <span className="label-sm font-semibold text-slate-600 w-8">
            {Math.round((data.runway_months / 24) * 100)}%
          </span>
        </div>
      </div>

      {/* Footer Notes */}
      <div className="mt-6 p-4 rounded-lg bg-slate-50 border border-slate-200">
        <p className="caption-sm text-slate-600">
          <span className="font-semibold text-slate-900">Note:</span> This summary is based on actual ipo_costs entries marked as 'incurred' or 'paid'. Financial forecasts assume linear burn rate. For detailed analysis and mitigation strategies, review the complete financial dashboard.
        </p>
      </div>
    </div>
  )
}
