'use client'

import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Bar,
} from 'recharts'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface ProfitabilityData {
  period: string
  netIncome: number
  profitMargin: number
  grossProfit: number
}

interface ProfitabilityTrendChartProps {
  data: ProfitabilityData[]
}

export function ProfitabilityTrendChart({ data }: ProfitabilityTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[350px] bg-slate-50 rounded-lg border border-slate-200">
        <p className="text-slate-500 text-sm">No profitability data available</p>
      </div>
    )
  }

  const chartData = data.map(item => ({
    period: item.period,
    'Net Income': Math.round(item.netIncome),
    'Profit Margin %': parseFloat(item.profitMargin.toFixed(2)),
    'Gross Profit': Math.round(item.grossProfit),
  }))

  const avgMargin = data.reduce((sum, item) => sum + item.profitMargin, 0) / data.length
  const marginTrend =
    data[data.length - 1].profitMargin - data[0].profitMargin >= 0 ? 'up' : 'down'

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
    return `$${value}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="w-full bg-white rounded-lg border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            {marginTrend === 'up' ? (
              <TrendingUp className="w-5 h-5 text-green-600" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-600" />
            )}
            Profitability Trend
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Net income, gross profit, and profit margin over time
          </p>
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${
            marginTrend === 'up'
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}
        >
          <span
            className={`text-xs font-semibold ${
              marginTrend === 'up' ? 'text-green-700' : 'text-red-700'
            }`}
          >
            {avgMargin.toFixed(1)}% avg margin
          </span>
        </motion.div>
      </div>

      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
          >
            <defs>
              <linearGradient id="colorNetIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.2} />
              </linearGradient>
              <linearGradient id="colorMargin" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.2} />
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
              yAxisId="left"
              tickFormatter={formatCurrency}
              tick={{ fontSize: 12, fill: '#6B7280' }}
              label={{ value: 'Amount', angle: -90, position: 'insideLeft' }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12, fill: '#6B7280' }}
              label={{ value: 'Margin %', angle: 90, position: 'insideRight' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                padding: '12px',
              }}
              formatter={(value: any, name: any) => {
                if (name === 'Profit Margin %') {
                  return [`${value?.toFixed?.(2)}%`, name]
                }
                return [formatCurrency(value), name]
              }}
              labelStyle={{ color: '#1F2937' }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="rect"
              height={20}
            />
            <Bar
              yAxisId="left"
              dataKey="Net Income"
              fill="url(#colorNetIncome)"
              radius={[8, 8, 0, 0]}
              animationDuration={1000}
              animationEasing="ease-out"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="Profit Margin %"
              stroke="#F59E0B"
              strokeWidth={3}
              dot={{ fill: '#F59E0B', r: 6 }}
              activeDot={{ r: 8 }}
              animationDuration={1200}
              animationEasing="ease-out"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Performance Metrics */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-xs font-medium text-green-700 uppercase tracking-wide">
            Avg Profit Margin
          </p>
          <p className="text-2xl font-bold text-green-900 mt-2">{avgMargin.toFixed(1)}%</p>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">
            Total Net Income
          </p>
          <p className="text-2xl font-bold text-blue-900 mt-2">
            {formatCurrency(data.reduce((sum, item) => sum + item.netIncome, 0))}
          </p>
        </div>

        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-xs font-medium text-purple-700 uppercase tracking-wide">
            Margin Trend
          </p>
          <div className="flex items-center gap-2 mt-2">
            {marginTrend === 'up' ? (
              <>
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="text-lg font-bold text-green-700">Improving</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-5 h-5 text-red-600" />
                <span className="text-lg font-bold text-red-700">Declining</span>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
