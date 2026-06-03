'use client'

import { FileText, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react'

interface BoardReadySummaryProps {
  companyName: string
  estimatedCost: number
  actualSpent: number
  budget: number
  budgetRemaining: number
  costPerDay: number
  runwayDays: number
  daysUntilIPO: number
  riskExposure: number
  currencyCode: string
}

export function BoardReadySummary({
  companyName,
  estimatedCost,
  actualSpent,
  budget,
  budgetRemaining,
  costPerDay,
  runwayDays,
  daysUntilIPO,
  riskExposure,
  currencyCode,
}: BoardReadySummaryProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const budgetUtilization = budget > 0 ? (actualSpent / budget) * 100 : 0
  const costVariancePercent = estimatedCost > 0 ? ((actualSpent - estimatedCost) / estimatedCost) * 100 : 0
  const runwayBuffer = Math.max(0, runwayDays - daysUntilIPO)
  const isRunwayAdequate = runwayBuffer >= 30

  const getHealthStatus = () => {
    if (costVariancePercent > 15 || !isRunwayAdequate || riskExposure > estimatedCost * 0.25) {
      return { status: 'At Risk', color: 'text-red-700', bgColor: 'bg-red-50', borderColor: 'border-red-200' }
    }
    if (costVariancePercent > 5 || runwayBuffer < 60) {
      return { status: 'Watch', color: 'text-yellow-700', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' }
    }
    return { status: 'On Track', color: 'text-green-700', bgColor: 'bg-green-50', borderColor: 'border-green-200' }
  }

  const health = getHealthStatus()

  return (
    <div className={`rounded-lg border-2 p-8 ${health.bgColor} ${health.borderColor} transition-all`}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-slate-900">Board-Ready Financial Summary</h2>
          </div>
          <p className="body-sm text-slate-600">Executive summary for board review</p>
        </div>
        <div className="flex items-center gap-2">
          {health.status === 'On Track' && <CheckCircle2 className={`w-8 h-8 ${health.color}`} />}
          {health.status === 'Watch' && <AlertCircle className={`w-8 h-8 ${health.color}`} />}
          {health.status === 'At Risk' && <AlertCircle className={`w-8 h-8 ${health.color}`} />}
          <div className="text-right">
            <div className={`text-lg font-bold ${health.color}`}>{health.status}</div>
            <div className="caption-sm text-slate-600">Financial Health</div>
          </div>
        </div>
      </div>

      {/* Company and Timeline */}
      <div className="mb-6 pb-6 border-b border-slate-300">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="label-sm font-semibold text-slate-600 uppercase tracking-wide mb-1">Company</p>
            <p className="h4 font-bold text-slate-900">{companyName}</p>
          </div>
          <div>
            <p className="label-sm font-semibold text-slate-600 uppercase tracking-wide mb-1">Days Until IPO</p>
            <p className="h4 font-bold text-slate-900">{daysUntilIPO}</p>
            <p className="caption-sm text-slate-600">({Math.ceil(daysUntilIPO / 30)} months)</p>
          </div>
          <div>
            <p className="label-sm font-semibold text-slate-600 uppercase tracking-wide mb-1">Financial Health</p>
            <p className={`text-xl font-bold ${health.color}`}>{health.status}</p>
          </div>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="mb-6 pb-6 border-b border-slate-300">
        <h3 className="font-semibold text-slate-900 mb-4 body-sm uppercase tracking-wide">Financial Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white bg-opacity-50 rounded-lg p-4">
            <p className="caption-sm text-slate-600 mb-1">Estimated Cost</p>
            <p className="h4 font-bold text-slate-900">{formatCurrency(estimatedCost)}</p>
          </div>
          <div className="bg-white bg-opacity-50 rounded-lg p-4">
            <p className="caption-sm text-slate-600 mb-1">Actual Spent</p>
            <p className="h4 font-bold text-slate-900">{formatCurrency(actualSpent)}</p>
          </div>
          <div className="bg-white bg-opacity-50 rounded-lg p-4">
            <p className="caption-sm text-slate-600 mb-1">Total Budget</p>
            <p className="h4 font-bold text-slate-900">{formatCurrency(budget)}</p>
          </div>
          <div className="bg-white bg-opacity-50 rounded-lg p-4">
            <p className="caption-sm text-slate-600 mb-1">Variance</p>
            <p className={`text-lg font-bold ${costVariancePercent > 0 ? 'text-red-700' : 'text-green-700'}`}>
              {costVariancePercent > 0 ? '+' : ''}{costVariancePercent.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Budget Utilization Progress */}
      <div className="mb-6 pb-6 border-b border-slate-300">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-slate-900 body-sm uppercase tracking-wide">Budget Utilization</h3>
          <span className="body-sm font-bold text-slate-900">{budgetUtilization.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-white bg-opacity-50 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              budgetUtilization > 90
                ? 'bg-red-600'
                : budgetUtilization > 75
                  ? 'bg-yellow-500'
                  : 'bg-green-600'
            }`}
            style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 caption-sm text-slate-600">
          <span>Spent: {formatCurrency(actualSpent)}</span>
          <span>Remaining: {formatCurrency(budgetRemaining)}</span>
        </div>
      </div>

      {/* Runway Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-6 border-b border-slate-300">
        <div className="bg-white bg-opacity-50 rounded-lg p-4">
          <p className="label-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">Runway Analysis</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="body-sm text-slate-700">Runway Remaining</span>
              <span className="font-bold text-slate-900">{runwayDays.toFixed(0)} days</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="body-sm text-slate-700">Days Until IPO</span>
              <span className="font-bold text-slate-900">{daysUntilIPO} days</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="body-sm text-slate-700">Buffer</span>
              <span className={`font-bold ${isRunwayAdequate ? 'text-green-700' : 'text-red-700'}`}>
                {runwayBuffer.toFixed(0)} days
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white bg-opacity-50 rounded-lg p-4">
          <p className="label-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">Burn Rate</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="body-sm text-slate-700">Daily Cost</span>
              <span className="font-bold text-slate-900">{formatCurrency(costPerDay)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="body-sm text-slate-700">Monthly Cost</span>
              <span className="font-bold text-slate-900">{formatCurrency(costPerDay * 30)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="body-sm text-slate-700">Risk Exposure</span>
              <span className="font-bold text-red-700">{formatCurrency(riskExposure)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Takeaways */}
      <div>
        <h3 className="font-semibold text-slate-900 mb-3 body-sm uppercase tracking-wide">Key Takeaways</h3>
        <ul className="space-y-2">
          <li className="flex items-start gap-2 body-sm text-slate-700">
            <TrendingUp className="w-4 h-4 mt-0.5 text-slate-600 flex-shrink-0" />
            <span>
              <strong>Budget Status:</strong> {budgetUtilization > 90 ? 'Critical - ' : ''}{budgetUtilization.toFixed(1)}% utilized with {formatCurrency(budgetRemaining)} remaining
            </span>
          </li>
          <li className="flex items-start gap-2 body-sm text-slate-700">
            <TrendingUp className="w-4 h-4 mt-0.5 text-slate-600 flex-shrink-0" />
            <span>
              <strong>Cost Variance:</strong> {costVariancePercent > 0 ? `${Math.abs(costVariancePercent).toFixed(1)}% over` : `${Math.abs(costVariancePercent).toFixed(1)}% under`} estimated cost
            </span>
          </li>
          <li className="flex items-start gap-2 body-sm text-slate-700">
            <TrendingUp className="w-4 h-4 mt-0.5 text-slate-600 flex-shrink-0" />
            <span>
              <strong>Runway:</strong> {isRunwayAdequate ? 'Adequate' : 'Tight'} with {runwayBuffer.toFixed(0)} days buffer at current burn rate
            </span>
          </li>
          <li className="flex items-start gap-2 body-sm text-slate-700">
            <TrendingUp className="w-4 h-4 mt-0.5 text-slate-600 flex-shrink-0" />
            <span>
              <strong>Risk Profile:</strong> {formatCurrency(riskExposure)} in identified financial risks requiring mitigation
            </span>
          </li>
        </ul>
      </div>
    </div>
  )
}
