'use client'

import { PieChart as RechartsPie, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts'

interface PieChartProps {
  data: Array<{ name: string; value: number }>
}

const COLORS = [
  '#3b82f6',
  '#ef4444',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#6366f1',
  '#84cc16',
  '#f97316',
]

export function PieChart({ data }: PieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsPie data={data}>
        <Pie
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value }: any) => `${name}: ${value.toFixed(1)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          data={data}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </RechartsPie>
    </ResponsiveContainer>
  )
}
