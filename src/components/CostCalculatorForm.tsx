'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import { Download, Loader2, AlertCircle, Save, CheckCircle } from 'lucide-react'

const FormSchema = z.object({
  companyRevenue: z.coerce.number().positive('Revenue must be greater than 0'),
  selectedExchange: z.enum(['NYSE', 'NASDAQ', 'TSX', 'CSE', 'OTHER']),
  complexityLevel: z.enum(['simple', 'medium', 'complex']),
  timelineMonths: z.coerce.number().int().min(3).max(12),
})

type FormData = z.infer<typeof FormSchema>

interface CostBreakdown {
  legal: number
  accounting: number
  underwriting: number
  printing: number
  filing: number
  contingency: number
}

interface CalculationResult {
  breakdown: CostBreakdown
  subtotal: number
  total: number
  ipoSizeEstimate: number
  costAsPercentageOfIPO: string
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']

export function CostCalculatorForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [result, setResult] = useState<CalculationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      companyRevenue: 50000000,
      selectedExchange: 'NASDAQ',
      complexityLevel: 'medium',
      timelineMonths: 6,
    },
  })

  const timelineMonths = watch('timelineMonths')

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    setError(null)
    setSaveSuccess(false)

    try {
      const response = await fetch('/api/financial/cost-calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Calculation failed')
      
      const result = await response.json()
      setResult(result.analysis)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!result) return
    setIsSaving(true)
    try {
      // Save handled by POST request
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleExport = () => {
    if (!result) return
    const csv = `Cost Category,Amount\n${Object.entries(result.breakdown).map(([k, v]) => `${k.toUpperCase()},${v}`).join('\n')}\nTOTAL,${result.total}`
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ipo-cost-estimate.csv'
    a.click()
  }

  const chartData = result ? [
    { name: 'Legal', value: result.breakdown.legal, fill: COLORS[0] },
    { name: 'Accounting', value: result.breakdown.accounting, fill: COLORS[1] },
    { name: 'Underwriting', value: result.breakdown.underwriting, fill: COLORS[2] },
    { name: 'Printing', value: result.breakdown.printing, fill: COLORS[3] },
    { name: 'Filing', value: result.breakdown.filing, fill: COLORS[4] },
    { name: 'Contingency', value: result.breakdown.contingency, fill: COLORS[5] },
  ] : []

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-lg">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">IPO Cost Calculator</h1>
        <p className="text-slate-600 dark:text-slate-400">Calculate estimated IPO costs across all categories</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-sm border border-slate-200 dark:border-slate-700 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Company Revenue
            </label>
            <input
              type="number"
              {...register('companyRevenue')}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              placeholder="50000000"
            />
            {errors.companyRevenue && <p className="text-red-500 text-sm mt-1">{errors.companyRevenue.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Exchange
            </label>
            <select
              {...register('selectedExchange')}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
            >
              <option value="NASDAQ">NASDAQ</option>
              <option value="NYSE">NYSE</option>
              <option value="TSX">TSX</option>
              <option value="CSE">CSE</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Complexity Level
            </label>
            <select
              {...register('complexityLevel')}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
            >
              <option value="simple">Simple</option>
              <option value="medium">Medium</option>
              <option value="complex">Complex</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Timeline: {timelineMonths} months
            </label>
            <input
              type="range"
              min="3"
              max="12"
              {...register('timelineMonths')}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-600"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="inline mr-2 h-4 w-4 animate-spin" /> : null}
          Calculate Costs
        </button>
      </form>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
          <p className="text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-8">
          {/* Cost Breakdown Table */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Cost Breakdown</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-700 dark:text-slate-300 font-semibold">Category</th>
                    <th className="text-right py-3 px-4 text-slate-700 dark:text-slate-300 font-semibold">Amount</th>
                    <th className="text-right py-3 px-4 text-slate-700 dark:text-slate-300 font-semibold">% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(result.breakdown).map(([key, value]) => (
                    <tr key={key} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <td className="py-3 px-4 text-slate-900 dark:text-white font-medium capitalize">{key}</td>
                      <td className="text-right py-3 px-4 text-slate-900 dark:text-white">${value.toLocaleString()}</td>
                      <td className="text-right py-3 px-4 text-slate-600 dark:text-slate-400">{((value / result.total) * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                  <tr className="bg-blue-50 dark:bg-blue-900/20 border-t-2 border-blue-200 dark:border-blue-800">
                    <td className="py-3 px-4 text-blue-900 dark:text-blue-100 font-bold">TOTAL ESTIMATE</td>
                    <td className="text-right py-3 px-4 text-blue-900 dark:text-blue-100 font-bold text-xl">${result.total.toLocaleString()}</td>
                    <td className="text-right py-3 px-4 text-blue-900 dark:text-blue-100 font-bold">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-4">
              Cost as % of IPO: <span className="font-semibold">{result.costAsPercentageOfIPO}%</span>
            </p>
          </div>

          {/* Chart */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Cost Distribution</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip formatter={(value: any) => `$${value.toLocaleString()}`} />
                <Bar dataKey="value" fill="#3b82f6">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Estimate
            </button>
            <button
              onClick={handleExport}
              className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-medium py-3 rounded-lg transition flex items-center justify-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>

          {saveSuccess && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <p className="text-green-800 dark:text-green-300">Estimate saved successfully</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
