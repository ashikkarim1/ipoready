'use client'

import { ArrowUpRight, ArrowDownRight, TrendingUp, DollarSign, Zap, Calendar } from 'lucide-react'

interface FinancialKPICardProps {
  title: string
  value: number | string
  format?: 'currency' | 'months' | 'percentage' | 'items'
  trend?: 'up' | 'down' | 'neutral'
  trendPercent?: number
  icon: 'dollar' | 'zap' | 'trending' | 'calendar'
  description?: string
  status?: 'good' | 'warning' | 'critical'
}

export function FinancialKPICard({
  title,
  value,
  format = 'currency',
  trend,
  trendPercent,
  icon,
  description,
  status = 'good',
}: FinancialKPICardProps) {
  const formatValue = () => {
    if (typeof value === 'string') return value
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value)
      case 'months':
        return `${Math.round(value)} mo`
      case 'percentage':
        return `${Math.round(value)}%`
      case 'items':
        return `${Math.round(value)}`
      default:
        return value
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'critical':
        return 'border-red-200 bg-red-50'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50'
      case 'good':
      default:
        return 'border-green-200 bg-green-50'
    }
  }

  const getStatusTextColor = () => {
    switch (status) {
      case 'critical':
        return 'text-red-700'
      case 'warning':
        return 'text-yellow-700'
      case 'good':
      default:
        return 'text-green-700'
    }
  }

  const getIconComponent = () => {
    switch (icon) {
      case 'dollar':
        return <DollarSign className="w-5 h-5" />
      case 'zap':
        return <Zap className="w-5 h-5" />
      case 'trending':
        return <TrendingUp className="w-5 h-5" />
      case 'calendar':
        return <Calendar className="w-5 h-5" />
      default:
        return <DollarSign className="w-5 h-5" />
    }
  }

  const getTrendIcon = () => {
    if (!trend) return null
    if (trend === 'up') return <ArrowUpRight className="w-4 h-4" />
    if (trend === 'down') return <ArrowDownRight className="w-4 h-4" />
    return null
  }

  const getTrendColor = () => {
    if (!trend) return ''
    if (trend === 'up') return 'text-green-600'
    if (trend === 'down') return 'text-red-600'
    return 'text-gray-600'
  }

  return (
    <div className={`rounded-lg border p-6 transition-all hover:shadow-md ${getStatusColor()}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2 rounded-lg ${getStatusTextColor()} bg-opacity-10`}>
          {getIconComponent()}
        </div>
        {trend && trendPercent !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-semibold ${getTrendColor()}`}>
            {getTrendIcon()}
            <span>{Math.abs(trendPercent)}%</span>
          </div>
        )}
      </div>

      <p className="text-sm text-gray-600 font-medium mb-1">{title}</p>
      <p className={`text-3xl font-bold ${getStatusTextColor()} mb-2`}>
        {formatValue()}
      </p>

      {description && (
        <p className="text-xs text-gray-600">{description}</p>
      )}
    </div>
  )
}
