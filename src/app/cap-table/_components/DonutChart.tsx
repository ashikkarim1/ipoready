/**
 * DonutChart — lazy-loaded recharts wrapper for the cap table.
 * Imported via next/dynamic so recharts (~8.5 MB) is only fetched
 * when this component mounts, not on initial page load.
 */
'use client'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

interface ChartEntry {
  name: string
  value: number
  color: string
}

interface DonutChartProps {
  data: ChartEntry[]
}

export default function DonutChart({ data }: DonutChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={65}
          outerRadius={105}
          dataKey="value"
          strokeWidth={2}
          stroke="white"
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ borderRadius: '8px', border: '1px solid #E5E4E0', fontSize: '12px' }}
          formatter={(v) => [`${Number(v ?? 0).toFixed(1)}%`, 'Diluted %']}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
