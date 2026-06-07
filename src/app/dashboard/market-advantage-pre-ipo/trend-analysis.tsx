'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface TrendDataPoint {
  date: string // YYYY-MM-DD
  ipoReadinessScore: number
  expectedValuation90day: number
  percentileRankOverall: number
  marketWindow90dayProbability: number
  fedRate: number
  marketSentiment: string
}

interface TrendAnalysisProps {
  companyId: string
  trendData: TrendDataPoint[]
}

/**
 * TREND ANALYSIS COMPONENT
 *
 * Shows historical trends in key metrics over 7/30/90 days
 * Includes line charts, change indicators, and insights
 */
export function TrendAnalysis({ companyId, trendData }: TrendAnalysisProps) {
  const [timeRange, setTimeRange] = useState<7 | 30 | 90>(30)
  const [selectedMetric, setSelectedMetric] = useState<'readiness' | 'valuation' | 'percentile'>('readiness')

  if (!trendData || trendData.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-500">No trend data available yet. Check back tomorrow.</p>
      </div>
    )
  }

  // Filter data based on time range
  const filteredData = trendData.slice(-timeRange)
  const dataPoints = filteredData.map(d => ({
    date: formatDate(d.date),
    readiness: d.ipoReadinessScore,
    valuation: Math.round(d.expectedValuation90day),
    percentile: d.percentileRankOverall,
    window: d.marketWindow90dayProbability,
    sentiment: d.marketSentiment,
  }))

  // Calculate metrics
  const currentValue = filteredData[filteredData.length - 1]
  const previousValue = filteredData[0]
  const currentReadiness = currentValue.ipoReadinessScore
  const previousReadiness = previousValue.ipoReadinessScore
  const readinessDelta = currentReadiness - previousReadiness

  const currentValuation = currentValue.expectedValuation90day
  const previousValuation = previousValue.expectedValuation90day
  const valuationDelta = currentValuation - previousValuation
  const valuationPercentChange = ((valuationDelta / previousValuation) * 100).toFixed(1)

  const currentPercentile = currentValue.percentileRankOverall
  const previousPercentile = previousValue.percentileRankOverall
  const percentileDelta = currentPercentile - previousPercentile

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="space-y-6 rounded-lg border border-gray-200 bg-white p-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Trend Analysis</h2>
          <p className="text-sm text-gray-500">How your metrics are changing over time</p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2">
          {[7, 30, 90].map(days => (
            <button
              key={days}
              onClick={() => setTimeRange(days as 7 | 30 | 90)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === days
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {days}d
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-3 gap-4">
        {/* Readiness Score */}
        <motion.div
          className={`rounded-lg border p-4 ${
            selectedMetric === 'readiness'
              ? 'border-red-300 bg-red-50'
              : 'border-gray-200 bg-white cursor-pointer hover:bg-gray-50'
          }`}
          onClick={() => setSelectedMetric('readiness')}
          whileHover={{ scale: 1.02 }}
        >
          <p className="text-xs font-medium text-gray-600 uppercase">IPO Readiness</p>
          <div className="mt-3 flex items-end gap-3">
            <span className="text-2xl font-bold text-gray-900">{currentReadiness}/100</span>
            <div className="flex items-center gap-1">
              {readinessDelta > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : readinessDelta < 0 ? (
                <TrendingDown className="h-4 w-4 text-red-600" />
              ) : (
                <Minus className="h-4 w-4 text-gray-400" />
              )}
              <span
                className={`text-sm font-semibold ${
                  readinessDelta > 0
                    ? 'text-green-600'
                    : readinessDelta < 0
                      ? 'text-red-600'
                      : 'text-gray-500'
                }`}
              >
                {readinessDelta > 0 ? '+' : ''}{readinessDelta}
              </span>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">Last {timeRange} days</p>
        </motion.div>

        {/* Valuation */}
        <motion.div
          className={`rounded-lg border p-4 ${
            selectedMetric === 'valuation'
              ? 'border-red-300 bg-red-50'
              : 'border-gray-200 bg-white cursor-pointer hover:bg-gray-50'
          }`}
          onClick={() => setSelectedMetric('valuation')}
          whileHover={{ scale: 1.02 }}
        >
          <p className="text-xs font-medium text-gray-600 uppercase">90-Day Valuation</p>
          <div className="mt-3 flex items-end gap-3">
            <span className="text-2xl font-bold text-gray-900">${currentValuation.toFixed(1)}B</span>
            <div className="flex items-center gap-1">
              {valuationDelta > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : valuationDelta < 0 ? (
                <TrendingDown className="h-4 w-4 text-red-600" />
              ) : (
                <Minus className="h-4 w-4 text-gray-400" />
              )}
              <span
                className={`text-sm font-semibold ${
                  valuationDelta > 0
                    ? 'text-green-600'
                    : valuationDelta < 0
                      ? 'text-red-600'
                      : 'text-gray-500'
                }`}
              >
                {valuationDelta > 0 ? '+' : ''}{valuationPercentChange}%
              </span>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">${valuationDelta > 0 ? '+' : ''}${Math.abs(valuationDelta).toFixed(2)}B</p>
        </motion.div>

        {/* Percentile */}
        <motion.div
          className={`rounded-lg border p-4 ${
            selectedMetric === 'percentile'
              ? 'border-red-300 bg-red-50'
              : 'border-gray-200 bg-white cursor-pointer hover:bg-gray-50'
          }`}
          onClick={() => setSelectedMetric('percentile')}
          whileHover={{ scale: 1.02 }}
        >
          <p className="text-xs font-medium text-gray-600 uppercase">Peer Rank</p>
          <div className="mt-3 flex items-end gap-3">
            <span className="text-2xl font-bold text-gray-900">{currentPercentile}th</span>
            <div className="flex items-center gap-1">
              {percentileDelta > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : percentileDelta < 0 ? (
                <TrendingDown className="h-4 w-4 text-red-600" />
              ) : (
                <Minus className="h-4 w-4 text-gray-400" />
              )}
              <span
                className={`text-sm font-semibold ${
                  percentileDelta > 0
                    ? 'text-green-600'
                    : percentileDelta < 0
                      ? 'text-red-600'
                      : 'text-gray-500'
                }`}
              >
                {percentileDelta > 0 ? '+' : ''}{percentileDelta}
              </span>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">vs 200 SaaS peers</p>
        </motion.div>
      </div>

      {/* Chart */}
      <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
        <p className="mb-4 text-sm font-medium text-gray-600">
          {selectedMetric === 'readiness'
            ? 'IPO Readiness Score Trend'
            : selectedMetric === 'valuation'
              ? '90-Day Expected Valuation Trend'
              : 'Peer Percentile Rank Trend'}
        </p>

        {selectedMetric === 'readiness' && (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dataPoints}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis domain={[0, 100]} stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="readiness"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: '#ef4444', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {selectedMetric === 'valuation' && (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dataPoints}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Area
                type="monotone"
                dataKey="valuation"
                fill="#fecaca"
                stroke="#ef4444"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {selectedMetric === 'percentile' && (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dataPoints}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis domain={[0, 100]} stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="percentile"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ fill: '#f59e0b', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Insight */}
      <div className="rounded-lg border-l-4 border-l-blue-500 bg-blue-50 p-4">
        <p className="text-sm font-medium text-blue-900">💡 Insight</p>
        <p className="mt-2 text-sm text-blue-800">
          {selectedMetric === 'readiness' && readinessDelta > 0 && (
            <>
              Great progress! Your readiness increased {readinessDelta} points in the last {timeRange} days.{' '}
              {readinessDelta >= 5 ? 'Keep up this momentum!' : 'Continue improving to reach 80/100.'}
            </>
          )}
          {selectedMetric === 'valuation' && valuationDelta > 0 && (
            <>
              Your expected valuation grew ${valuationDelta.toFixed(2)}B ({valuationPercentChange}%) in the last{' '}
              {timeRange} days. This is driven by market sentiment and Fed rate changes.
            </>
          )}
          {selectedMetric === 'percentile' && percentileDelta > 0 && (
            <>
              You're improving relative to peers. You moved from {previousPercentile}th to {currentPercentile}th percentile.
              Focus on maintaining your competitive advantages.
            </>
          )}
          {readinessDelta <= 0 && selectedMetric === 'readiness' && (
            <>
              Your readiness hasn't changed in the last {timeRange} days. Consider accelerating on the metrics you're
              weakest on.
            </>
          )}
        </p>
      </div>
    </motion.div>
  )
}

/**
 * Format date from YYYY-MM-DD to friendly format
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00Z')
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default TrendAnalysis
