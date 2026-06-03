'use client'

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts'

interface MonthlyData {
  month: string
  budget: number
  actual: number
  variance_pct: number
}

interface FinancialMonthlyChartProps {
  data: MonthlyData[]
  title?: string
  height?: number
}

export function FinancialMonthlyChart({
  data,
  title = 'Monthly Budget vs Actual',
  height = 350,
}: FinancialMonthlyChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[350px] bg-slate-50 rounded-lg border border-slate-200">
        <p className="text-slate-500 text-sm">No data available</p>
      </div>
    )
  }

  const chartData = data.map(item => ({
    month: item.month.split('-')[1], // Show only MM
    budget: Math.round(item.budget),
    actual: Math.round(item.actual),
    variance_pct: Math.round(item.variance_pct * 10) / 10,
  }))

  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
    return `$${value}`
  }

  const renderCustomTooltip = (props: any) => {
    if (!props.active || !props.payload) return null

    return (
      <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-lg">
        <p className="text-sm font-semibold text-gray-900">
          Month {props.payload[0]?.payload?.month}
        </p>
        {props.payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {formatYAxis(entry.value)}
          </p>
        ))}
        {props.payload[0]?.payload?.variance_pct !== undefined && (
          <p className="text-sm text-gray-600 mt-2">
            Variance: {props.payload[0].payload.variance_pct}%
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="w-full rounded-lg border border-slate-200 bg-white p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500 mt-1">
          Budget allocation vs actual spending over time
        </p>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e2e8f0"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            stroke="#94a3b8"
            style={{ fontSize: '12px' }}
            label={{ value: 'Month', position: 'insideBottom', offset: -5 }}
          />
          <YAxis
            stroke="#94a3b8"
            style={{ fontSize: '12px' }}
            tickFormatter={formatYAxis}
            width={80}
          />
          <Tooltip content={renderCustomTooltip} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
          />
          <Bar
            dataKey="budget"
            fill="#3b82f6"
            name="Budget"
            opacity={0.8}
            radius={[8, 8, 0, 0]}
          />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#ef4444"
            strokeWidth={3}
            name="Actual Spending"
            dot={{ fill: '#ef4444', r: 5 }}
            activeDot={{ r: 7 }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="mt-6 grid grid-cols-3 gap-4 text-center text-sm">
        <div className="p-3 rounded-lg bg-blue-50">
          <p className="text-blue-700 font-semibold">Budget</p>
          <p className="text-blue-600">Planning</p>
        </div>
        <div className="p-3 rounded-lg bg-red-50">
          <p className="text-red-700 font-semibold">Actual</p>
          <p className="text-red-600">Spending</p>
        </div>
        <div className="p-3 rounded-lg bg-amber-50">
          <p className="text-amber-700 font-semibold">Variance</p>
          <p className="text-amber-600">Analysis</p>
        </div>
      </div>
    </div>
  )
}
