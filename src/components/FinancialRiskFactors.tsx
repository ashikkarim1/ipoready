'use client'

import { AlertTriangle, TrendingDown, Clock, DollarSign } from 'lucide-react'

interface RiskFactor {
  label: string
  value: number
  impact: 'critical' | 'warning' | 'low'
  description: string
  icon: 'alert' | 'trending' | 'clock' | 'dollar'
}

interface FinancialRiskFactorsProps {
  risks: RiskFactor[]
  delayRiskPerDay: number
  estimatedDaysDelay: number
  totalRiskExposure: number
}

export function FinancialRiskFactors({
  risks,
  delayRiskPerDay,
  estimatedDaysDelay,
  totalRiskExposure,
}: FinancialRiskFactorsProps) {
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical':
        return 'border-l-4 border-red-500 bg-red-50'
      case 'warning':
        return 'border-l-4 border-yellow-500 bg-yellow-50'
      case 'low':
        return 'border-l-4 border-blue-500 bg-blue-50'
      default:
        return 'border-l-4 border-gray-500 bg-gray-50'
    }
  }

  const getImpactBadgeColor = (impact: string) => {
    switch (impact) {
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getIconComponent = (icon: string) => {
    switch (icon) {
      case 'alert':
        return <AlertTriangle className="w-5 h-5" />
      case 'trending':
        return <TrendingDown className="w-5 h-5" />
      case 'clock':
        return <Clock className="w-5 h-5" />
      case 'dollar':
        return <DollarSign className="w-5 h-5" />
      default:
        return <AlertTriangle className="w-5 h-5" />
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const criticalCount = risks.filter(r => r.impact === 'critical').length
  const warningCount = risks.filter(r => r.impact === 'warning').length

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          Risk Factor Analysis
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Financial risks that could impact IPO timeline and budget
        </p>
      </div>

      {/* Risk Summary Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-red-700">Critical Risks</span>
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold">
              {criticalCount}
            </span>
          </div>
          <p className="text-xs text-red-600">Requires immediate action</p>
        </div>

        <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-yellow-700">Warnings</span>
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-600 text-white text-xs font-bold">
              {warningCount}
            </span>
          </div>
          <p className="text-xs text-yellow-600">Monitor and prepare mitigation</p>
        </div>

        <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-700">Total Exposure</span>
            <span className="text-xs font-bold text-blue-900">{formatCurrency(totalRiskExposure)}</span>
          </div>
          <p className="text-xs text-blue-600">Financial risk at current pace</p>
        </div>
      </div>

      {/* Delay Cost Calculation */}
      <div className="mb-6 p-4 rounded-lg bg-orange-50 border border-orange-200">
        <h4 className="text-sm font-semibold text-orange-900 mb-3">Delay Cost Impact</h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-orange-700 font-semibold">{formatCurrency(delayRiskPerDay)}</p>
            <p className="text-xs text-orange-600">Cost per day of delay</p>
          </div>
          <div>
            <p className="text-orange-700 font-semibold">{estimatedDaysDelay} days</p>
            <p className="text-xs text-orange-600">Estimated schedule delay</p>
          </div>
          <div>
            <p className="text-orange-700 font-semibold">{formatCurrency(totalRiskExposure)}</p>
            <p className="text-xs text-orange-600">Total exposure</p>
          </div>
        </div>
      </div>

      {/* Individual Risk Factors */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-900 mb-4">Key Risk Factors</h4>
        {risks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-slate-500">No risk factors identified at this time</p>
            <p className="text-xs text-slate-400 mt-1">Continue monitoring financial metrics</p>
          </div>
        ) : (
          risks.map((risk, index) => (
            <div key={index} className={`rounded-lg p-4 ${getImpactColor(risk.impact)}`}>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5 text-gray-700">
                  {getIconComponent(risk.icon)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900">{risk.label}</p>
                    <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${getImpactBadgeColor(risk.impact)}`}>
                      {risk.impact.charAt(0).toUpperCase() + risk.impact.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{risk.description}</p>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(risk.value)} at risk
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Mitigation Recommendations */}
      <div className="mt-6 p-4 rounded-lg bg-slate-50 border border-slate-200">
        <h4 className="text-sm font-semibold text-slate-900 mb-2">Mitigation Steps</h4>
        <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside">
          <li>Review budget allocations monthly and adjust forecasts</li>
          <li>Identify cost overruns early and implement corrective actions</li>
          <li>Maintain contingency reserve of 10-15% of total IPO budget</li>
          <li>Accelerate milestone completion to reduce delay exposure</li>
          <li>Coordinate with advisors on phase sequencing optimization</li>
        </ul>
      </div>
    </div>
  )
}
