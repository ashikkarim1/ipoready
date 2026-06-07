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
      <div className="card p-8 text-center">
        <p className="text-text-muted text-sm">No trend data available yet. Check back tomorrow.</p>
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
      className="card space-y-6 p-7 lg:p-8"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 border-b" style={{ borderColor: 'var(--color-border)', paddingBottom: '1.5rem' }}>
        <div>
          <h2 className="text-nav font-bold text-base sm:text-lg">Trend Analysis</h2>
          <p className="text-text-muted text-xs sm:text-sm mt-1">How your metrics are changing over time</p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2 flex-shrink-0">
          {[7, 30, 90].map(days => (
            <button
              key={days}
              onClick={() => setTimeRange(days as 7 | 30 | 90)}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                timeRange === days
                  ? 'border'
                  : 'border'
              }`}
              style={
                timeRange === days
                  ? { background: 'var(--color-accent)', color: 'var(--color-text-inverse)', borderColor: 'var(--color-accent)' }
                  : { background: 'var(--color-surface-primary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }
              }
            >
              {days}d
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Readiness Score */}
        <motion.div
          className="card p-4 sm:p-5 border cursor-pointer transition-all"
          onClick={() => setSelectedMetric('readiness')}
          whileHover={{ scale: 1.02 }}
          style={
            selectedMetric === 'readiness'
              ? { background: 'var(--color-error-soft)', borderColor: 'var(--color-accent)' }
              : { background: 'var(--color-surface-primary)', borderColor: 'var(--color-border)' }
          }
        >
          <p className="text-text-muted text-xs uppercase tracking-wider font-semibold">IPO Readiness</p>
          <div className="mt-3 flex items-end gap-3">
            <span className="text-nav font-black text-2xl">{currentReadiness}/100</span>
            <div className="flex items-center gap-1">
              {readinessDelta > 0 ? (
                <TrendingUp className="h-4 w-4" style={{ color: 'var(--color-success)' }} />
              ) : readinessDelta < 0 ? (
                <TrendingDown className="h-4 w-4" style={{ color: 'var(--color-accent)' }} />
              ) : (
                <Minus className="h-4 w-4" style={{ color: 'var(--color-border)' }} />
              )}
              <span
                className="text-sm font-semibold"
                style={{
                  color: readinessDelta > 0
                    ? 'var(--color-success)'
                    : readinessDelta < 0
                      ? 'var(--color-accent)'
                      : 'var(--color-text-muted)',
                }}
              >
                {readinessDelta > 0 ? '+' : ''}{readinessDelta}
              </span>
            </div>
          </div>
          <p className="text-text-light text-xs mt-2">Last {timeRange} days</p>
        </motion.div>

        {/* Valuation */}
        <motion.div
          className="card p-4 sm:p-5 border cursor-pointer transition-all"
          onClick={() => setSelectedMetric('valuation')}
          whileHover={{ scale: 1.02 }}
          style={
            selectedMetric === 'valuation'
              ? { background: 'var(--color-error-soft)', borderColor: 'var(--color-accent)' }
              : { background: 'var(--color-surface-primary)', borderColor: 'var(--color-border)' }
          }
        >
          <p className="text-text-muted text-xs uppercase tracking-wider font-semibold">90-Day Valuation</p>
          <div className="mt-3 flex items-end gap-3">
            <span className="text-nav font-black text-2xl">${currentValuation.toFixed(1)}B</span>
            <div className="flex items-center gap-1">
              {valuationDelta > 0 ? (
                <TrendingUp className="h-4 w-4" style={{ color: 'var(--color-success)' }} />
              ) : valuationDelta < 0 ? (
                <TrendingDown className="h-4 w-4" style={{ color: 'var(--color-accent)' }} />
              ) : (
                <Minus className="h-4 w-4" style={{ color: 'var(--color-border)' }} />
              )}
              <span
                className="text-sm font-semibold"
                style={{
                  color: valuationDelta > 0
                    ? 'var(--color-success)'
                    : valuationDelta < 0
                      ? 'var(--color-accent)'
                      : 'var(--color-text-muted)',
                }}
              >
                {valuationDelta > 0 ? '+' : ''}{valuationPercentChange}%
              </span>
            </div>
          </div>
          <p className="text-text-light text-xs mt-2">${valuationDelta > 0 ? '+' : ''}${Math.abs(valuationDelta).toFixed(2)}B</p>
        </motion.div>

        {/* Percentile */}
        <motion.div
          className="card p-4 sm:p-5 border cursor-pointer transition-all"
          onClick={() => setSelectedMetric('percentile')}
          whileHover={{ scale: 1.02 }}
          style={
            selectedMetric === 'percentile'
              ? { background: 'var(--color-error-soft)', borderColor: 'var(--color-accent)' }
              : { background: 'var(--color-surface-primary)', borderColor: 'var(--color-border)' }
          }
        >
          <p className="text-text-muted text-xs uppercase tracking-wider font-semibold">Peer Rank</p>
          <div className="mt-3 flex items-end gap-3">
            <span className="text-nav font-black text-2xl">{currentPercentile}th</span>
            <div className="flex items-center gap-1">
              {percentileDelta > 0 ? (
                <TrendingUp className="h-4 w-4" style={{ color: 'var(--color-success)' }} />
              ) : percentileDelta < 0 ? (
                <TrendingDown className="h-4 w-4" style={{ color: 'var(--color-accent)' }} />
              ) : (
                <Minus className="h-4 w-4" style={{ color: 'var(--color-border)' }} />
              )}
              <span
                className="text-sm font-semibold"
                style={{
                  color: percentileDelta > 0
                    ? 'var(--color-success)'
                    : percentileDelta < 0
                      ? 'var(--color-accent)'
                      : 'var(--color-text-muted)',
                }}
              >
                {percentileDelta > 0 ? '+' : ''}{percentileDelta}
              </span>
            </div>
          </div>
          <p className="text-text-light text-xs mt-2">vs 200 SaaS peers</p>
        </motion.div>
      </div>

      {/* Chart */}
      <div className="rounded-xl border p-4 sm:p-6" style={{ background: 'var(--color-surface-secondary)', borderColor: 'var(--color-border)' }}>
        <p className="mb-4 text-text-muted text-xs sm:text-sm uppercase tracking-wider font-semibold">
          {selectedMetric === 'readiness'
            ? 'IPO Readiness Score Trend'
            : selectedMetric === 'valuation'
              ? '90-Day Expected Valuation Trend'
              : 'Peer Percentile Rank Trend'}
        </p>

        {selectedMetric === 'readiness' && (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={dataPoints}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="date" stroke="var(--color-text-muted)" style={{ fontSize: '12px' }} />
              <YAxis domain={[0, 100]} stroke="var(--color-text-muted)" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-surface-primary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  color: 'var(--color-text-primary)',
                }}
                labelStyle={{ color: 'var(--color-text-primary)' }}
              />
              <Line
                type="monotone"
                dataKey="readiness"
                stroke="var(--color-accent)"
                strokeWidth={2}
                dot={{ fill: 'var(--color-accent)', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {selectedMetric === 'valuation' && (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={dataPoints}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="date" stroke="var(--color-text-muted)" style={{ fontSize: '12px' }} />
              <YAxis stroke="var(--color-text-muted)" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-surface-primary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  color: 'var(--color-text-primary)',
                }}
                labelStyle={{ color: 'var(--color-text-primary)' }}
              />
              <Area
                type="monotone"
                dataKey="valuation"
                fill="var(--color-accent)"
                stroke="var(--color-accent)"
                strokeWidth={2}
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {selectedMetric === 'percentile' && (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={dataPoints}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="date" stroke="var(--color-text-muted)" style={{ fontSize: '12px' }} />
              <YAxis domain={[0, 100]} stroke="var(--color-text-muted)" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-surface-primary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  color: 'var(--color-text-primary)',
                }}
                labelStyle={{ color: 'var(--color-text-primary)' }}
              />
              <Line
                type="monotone"
                dataKey="percentile"
                stroke="var(--color-warning)"
                strokeWidth={2}
                dot={{ fill: 'var(--color-warning)', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Insight */}
      <div className="rounded-lg border-l-4 p-4 sm:p-5" style={{ background: 'var(--color-info-soft)', borderLeftColor: 'var(--color-info)' }}>
        <p className="text-text-primary text-xs sm:text-sm font-semibold">💡 Insight</p>
        <p className="mt-2 text-text-primary text-xs sm:text-sm">
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
