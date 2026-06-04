'use client'

import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import { TrendingUp } from 'lucide-react'

interface RevenueData {
  period: string
  revenue: number
  previousYearRevenue: number
  growth: number
}

interface RevenueYoYChartProps {
  data: RevenueData[]
}

export function RevenueYoYChart({ data }: RevenueYoYChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[350px] bg-slate-50 rounded-lg border border-slate-200">
        <p className="text-slate-500 text-sm">No revenue data available</p>
      </div>
    )
  }

  const chartData = data.map(item => ({
    period: item.period,
    'Current Year': Math.round(item.revenue),
    'Previous Year': Math.round(item.previousYearRevenue),
    growth: item.growth,
  }))

  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
    return `$${value}`
  }

  const avgGrowth = data.reduce((sum, item) => sum + item.growth, 0) / data.length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-white rounded-lg border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Revenue Year-over-Year
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Monthly comparison with previous year performance
          </p>
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
          className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full"
        >
          <span className="text-xs font-semibold text-green-700">
            +{avgGrowth.toFixed(1)}% avg growth
          </span>
        </motion.div>
      </div>

      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.2} />
              </linearGradient>
              <linearGradient id="colorPrevYear" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9CA3AF" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#9CA3AF" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="period"
              tick={{ fontSize: 12, fill: '#6B7280' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              tickFormatter={formatYAxis}
              tick={{ fontSize: 12, fill: '#6B7280' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                padding: '12px',
              }}
              formatter={(value: any) => formatYAxis(value as number)}
              labelStyle={{ color: '#1F2937' }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="rect"
              height={20}
            />
            <Bar
              dataKey="Current Year"
              fill="url(#colorRevenue)"
              radius={[8, 8, 0, 0]}
              animationDuration={1000}
              animationEasing="ease-out"
            />
            <Bar
              dataKey="Previous Year"
              fill="url(#colorPrevYear)"
              radius={[8, 8, 0, 0]}
              animationDuration={1200}
              animationEasing="ease-out"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Growth Indicators */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
      >
        <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Data Insights</p>
        <ul className="mt-3 space-y-2 text-sm text-gray-700">
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
            Year-over-year growth averaged {avgGrowth.toFixed(1)}% across all periods
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
            Highest growth in {data.reduce((max, item) => (item.growth > max.growth ? item : max)).period}
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
            Total revenue increased by{' '}
            {((
              (data.reduce((sum, item) => sum + item.revenue, 0) /
                data.reduce((sum, item) => sum + item.previousYearRevenue, 0)) -
              1
            ) * 100).toFixed(1)}
            % year-over-year
          </li>
        </ul>
      </motion.div>
    </motion.div>
  )
}
