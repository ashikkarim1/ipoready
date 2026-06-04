'use client'

import { useMemo } from 'react'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'
import type { MetricAlignment } from './ReconciliationDashboard'

interface ReconciliationRadarProps {
  metrics: MetricAlignment[]
}

export function ReconciliationRadar({ metrics }: ReconciliationRadarProps) {
  // Transform metrics into radar chart data
  const radarData = useMemo(() => {
    return metrics.map(metric => {
      // Calculate completeness score (0-100)
      // Aligned = 100, needs review = 50, critical = 0
      let completenessScore = 0
      if (metric.status === 'aligned') {
        completenessScore = 100
      } else if (metric.status === 'needs_review') {
        completenessScore = 50
      } else {
        completenessScore = 0
      }

      // Count how many sources have data (not N/A)
      const sourcesWithData = [
        metric.pace_value !== 'N/A',
        metric.financial_value !== 'N/A',
        metric.prospectus_value !== 'N/A',
        metric.cap_table_value !== 'N/A',
      ].filter(Boolean).length

      // Data presence score: (sources with data / 4) * 100
      const dataPresenceScore = (sourcesWithData / 4) * 100

      // Final score combines completeness and presence
      const finalScore = (completenessScore * 0.7 + dataPresenceScore * 0.3)

      return {
        metric: metric.metric,
        completeness: completenessScore,
        presence: dataPresenceScore,
        value: Math.round(finalScore),
      }
    })
  }, [metrics])

  const renderRadarLabel = (props: any) => {
    const { viewBox, value } = props
    if (!viewBox) return null
    const { x, y } = viewBox
    return (
      <text
        x={x}
        y={y}
        fill="#64748b"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-medium dark:fill-slate-400"
      >
        {value}
      </text>
    )
  }

  const renderCustomTooltip = (props: any) => {
    const { active, payload } = props
    if (active && payload && payload[0]) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-lg">
          <p className="font-semibold text-slate-900 dark:text-white text-sm">
            {data.metric}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Alignment Score: {data.value}%
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Completeness: {data.completeness}%
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Data Present: {data.presence}%
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={radarData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <defs>
            <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <PolarGrid
            stroke="#cbd5e1"
            style={{ opacity: 0.5 }}
            className="dark:stroke-slate-700"
          />
          <PolarAngleAxis
            dataKey="metric"
            tick={renderRadarLabel}
            angle={90}
            type="number"
          />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 12 }} />
          <Radar
            name="Alignment Score"
            dataKey="value"
            stroke="#3b82f6"
            fill="url(#radarGradient)"
            strokeWidth={2}
            isAnimationActive={true}
          />
          <Tooltip content={renderCustomTooltip} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            verticalAlign="bottom"
            height={36}
          />
        </RadarChart>
      </ResponsiveContainer>

      {/* Score Legend */}
      <div className="mt-6 w-full grid grid-cols-3 gap-3 text-center text-xs">
        <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <div className="h-2 w-2 rounded-full bg-green-500 mx-auto mb-2"></div>
          <p className="font-semibold text-green-700 dark:text-green-300">Perfect</p>
          <p className="text-green-600 dark:text-green-400 text-xs">90-100%</p>
        </div>
        <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
          <div className="h-2 w-2 rounded-full bg-yellow-500 mx-auto mb-2"></div>
          <p className="font-semibold text-yellow-700 dark:text-yellow-300">Review</p>
          <p className="text-yellow-600 dark:text-yellow-400 text-xs">50-89%</p>
        </div>
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div className="h-2 w-2 rounded-full bg-red-500 mx-auto mb-2"></div>
          <p className="font-semibold text-red-700 dark:text-red-300">Critical</p>
          <p className="text-red-600 dark:text-red-400 text-xs">&lt;50%</p>
        </div>
      </div>
    </div>
  )
}
