'use client'

import React, { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts'
import { motion } from 'framer-motion'

export interface FundingRound {
  roundName: string
  valuation: number
  amountRaised: number
}

export interface RoundSnapshot {
  shareholderName: string
  shares: number
  ownership: number
}

interface WaterfallChartProps {
  currentCapTable: Array<{ name: string; shares: number }>
  fundingHistory?: FundingRound[]
  showHistoricalRounds?: boolean
}

export function CapTableWaterfallChart({
  currentCapTable,
  fundingHistory = [],
  showHistoricalRounds = false,
}: WaterfallChartProps) {
  // Generate chart data
  const chartData = useMemo(() => {
    if (!showHistoricalRounds || fundingHistory.length === 0) {
      // Show only current cap table as single point
      const totalShares = currentCapTable.reduce((sum, s) => sum + s.shares, 0)

      return [
        {
          round: 'Current',
          ...Object.fromEntries(
            currentCapTable.map((sh) => [
              sh.name.replace(/\s+/g, '_'),
              sh.shares > 0 ? (sh.shares / totalShares) * 100 : 0,
            ])
          ),
        },
      ]
    }

    // Simulate historical dilution across rounds
    // This is a simplified model; real data would come from API
    const rounds = ['Seed', 'Series A', 'Series B', ...fundingHistory.map((r) => r.roundName)]

    return rounds.map((round, idx) => {
      const dilutionFactor = 1 + idx * 0.15 // 15% dilution per round (simplified)
      const totalShares = currentCapTable.reduce((sum, s) => sum + s.shares, 0)

      return {
        round,
        ...Object.fromEntries(
          currentCapTable.map((sh) => [
            sh.name.replace(/\s+/g, '_'),
            (sh.shares / (totalShares * dilutionFactor)) * 100,
          ])
        ),
      }
    })
  }, [currentCapTable, fundingHistory, showHistoricalRounds])

  // Custom tooltip
  const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (!active || !payload) return null

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-900"
      >
        <p className="font-semibold text-gray-900 dark:text-white">{label}</p>
        {(payload as any[]).map((entry, idx) => (
          <p key={idx} style={{ color: entry.color }} className="body-sm">
            {entry.name.replace(/_/g, ' ')}: {entry.value?.toFixed(2)}%
          </p>
        ))}
      </motion.div>
    )
  }

  const COLORS = [
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#06B6D4', // cyan
    '#F97316', // orange
  ]

  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-4">
        <h3 className="h4 font-semibold text-gray-900 dark:text-white">
          {showHistoricalRounds ? 'Cap Table Dilution Across Rounds' : 'Current Cap Table Ownership'}
        </h3>
        <p className="body-sm text-gray-600 dark:text-gray-400">
          {showHistoricalRounds
            ? 'Historical breakdown showing dilution impact at each funding round'
            : 'Current ownership distribution across shareholders'}
        </p>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            {currentCapTable.map((sh, idx) => (
              <linearGradient
                key={sh.name}
                id={`color_${sh.name.replace(/\s+/g, '_')}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={COLORS[idx % COLORS.length]} stopOpacity={0.8} />
                <stop offset="95%" stopColor={COLORS[idx % COLORS.length]} stopOpacity={0.1} />
              </linearGradient>
            ))}
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="round"
            stroke="#6B7280"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#6B7280' }}
          />
          <YAxis
            stroke="#6B7280"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#6B7280' }}
            label={{ value: 'Ownership %', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => value.replace(/_/g, ' ')}
          />

          {currentCapTable.map((shareholder, idx) => (
            <Area
              key={shareholder.name}
              type="monotone"
              dataKey={shareholder.name.replace(/\s+/g, '_')}
              stackId="1"
              stroke={COLORS[idx % COLORS.length]}
              fill={`url(#color_${shareholder.name.replace(/\s+/g, '_')})`}
              name={shareholder.name}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>

      {!showHistoricalRounds && (
        <p className="mt-4 text-center body-sm text-gray-600 dark:text-gray-400">
          Upgrade to Starter plan to view historical dilution across funding rounds
        </p>
      )}
    </div>
  )
}
