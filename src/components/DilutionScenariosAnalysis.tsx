'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, AlertCircle, Download } from 'lucide-react'

const FormSchema = z.object({
  warrant_exercise_shares: z.coerce.number().nonnegative(),
  new_financing_shares: z.coerce.number().nonnegative(),
  employee_vesting_shares: z.coerce.number().nonnegative(),
  scenario_type: z.enum(['base-case', 'conservative', 'aggressive']),
})

type FormData = z.infer<typeof FormSchema>

interface OwnershipImpact {
  shareholder_name: string
  pre_ipo_pct: number
  post_ipo_pct: number
  change_pct: number
  pre_ipo_shares: number
  post_ipo_shares: number
}

interface ScenarioResult {
  currentTotalShares: number
  newShares: {
    warrant_exercise: number
    new_financing: number
    employee_vesting: number
    total: number
  }
  postIPOTotalShares: number
  dilutionPercentage: number
  ownershipImpact: Record<string, OwnershipImpact>
}

const PRESET_SCENARIOS = {
  'base-case': {
    warrant_exercise_shares: 5000000,
    new_financing_shares: 8000000,
    employee_vesting_shares: 2000000,
    label: 'Base Case',
  },
  conservative: {
    warrant_exercise_shares: 3000000,
    new_financing_shares: 5000000,
    employee_vesting_shares: 1000000,
    label: 'Conservative',
  },
  aggressive: {
    warrant_exercise_shares: 8000000,
    new_financing_shares: 12000000,
    employee_vesting_shares: 4000000,
    label: 'Aggressive',
  },
}

export function DilutionScenariosAnalysis() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ScenarioResult | null>(null)
  const [selectedPreset, setSelectedPreset] = useState<string>('base-case')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(FormSchema) as any,
    defaultValues: {
      warrant_exercise_shares: 5000000,
      new_financing_shares: 8000000,
      employee_vesting_shares: 2000000,
      scenario_type: 'base-case',
    },
  })

  const handlePresetClick = (presetKey: string) => {
    setSelectedPreset(presetKey)
    const preset = PRESET_SCENARIOS[presetKey as keyof typeof PRESET_SCENARIOS]
    setValue('warrant_exercise_shares', preset.warrant_exercise_shares)
    setValue('new_financing_shares', preset.new_financing_shares)
    setValue('employee_vesting_shares', preset.employee_vesting_shares)
    setValue('scenario_type', presetKey as any)
  }

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/cap-table/dilution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Analysis failed')

      const res = await response.json()
      setResult(res.scenario)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = () => {
    if (!result) return

    const ownershipData = Object.entries(result.ownershipImpact).map(([_, impact]) => ({
      Shareholder: impact.shareholder_name,
      'Pre-IPO %': impact.pre_ipo_pct,
      'Post-IPO %': impact.post_ipo_pct,
      'Change %': impact.change_pct,
    }))

    const csv = [
      ['Dilution Scenarios Analysis'],
      [],
      ['Current Total Shares', result.currentTotalShares],
      ['Post-IPO Total Shares', result.postIPOTotalShares],
      ['Dilution %', result.dilutionPercentage],
      [],
      ['Ownership Impact'],
      ...ownershipData.map(row => [row.Shareholder, row['Pre-IPO %'], row['Post-IPO %'], row['Change %']]),
    ]
      .map(row => row.join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'dilution-scenarios.csv'
    a.click()
  }

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-lg">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Cap Table Dilution Scenarios</h1>
        <p className="text-slate-600 dark:text-slate-400">Model ownership impact under various IPO scenarios</p>
      </div>

      {/* Preset Scenarios */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <h2 className="h4 font-bold text-slate-900 dark:text-white mb-4">Quick Scenarios</h2>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(PRESET_SCENARIOS).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => handlePresetClick(key)}
              className={`p-4 rounded-lg border-2 transition ${
                selectedPreset === key
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 hover:border-blue-300'
              }`}
            >
              <p className="font-semibold text-slate-900 dark:text-white">{preset.label}</p>
              <p className="caption-sm text-slate-600 dark:text-slate-400 mt-2">
                {(
                  (preset.warrant_exercise_shares +
                    preset.new_financing_shares +
                    preset.employee_vesting_shares) /
                  1000000
                ).toFixed(1)}
                M new shares
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Manual Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-sm border border-slate-200 dark:border-slate-700 space-y-6">
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block label font-medium text-slate-700 dark:text-slate-300 mb-2">
              Warrant Exercise Shares
            </label>
            <input
              type="number"
              {...register('warrant_exercise_shares')}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              placeholder="5000000"
            />
            {errors.warrant_exercise_shares && <p className="text-red-500 body-sm mt-1">{errors.warrant_exercise_shares.message}</p>}
          </div>

          <div>
            <label className="block label font-medium text-slate-700 dark:text-slate-300 mb-2">
              New Financing Shares
            </label>
            <input
              type="number"
              {...register('new_financing_shares')}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              placeholder="8000000"
            />
            {errors.new_financing_shares && <p className="text-red-500 body-sm mt-1">{errors.new_financing_shares.message}</p>}
          </div>

          <div>
            <label className="block label font-medium text-slate-700 dark:text-slate-300 mb-2">
              Employee Vesting Shares
            </label>
            <input
              type="number"
              {...register('employee_vesting_shares')}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              placeholder="2000000"
            />
            {errors.employee_vesting_shares && <p className="text-red-500 body-sm mt-1">{errors.employee_vesting_shares.message}</p>}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="inline mr-2 h-4 w-4 animate-spin" /> : null}
          Analyze Scenario
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
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <p className="body-sm text-slate-600 dark:text-slate-400 mb-1">Current Total Shares</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{(result.currentTotalShares / 1000000).toFixed(1)}M</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <p className="body-sm text-slate-600 dark:text-slate-400 mb-1">New Shares</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{(result.newShares.total / 1000000).toFixed(1)}M</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <p className="body-sm text-slate-600 dark:text-slate-400 mb-1">Post-IPO Total</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{(result.postIPOTotalShares / 1000000).toFixed(1)}M</p>
            </div>
          </div>

          {/* Dilution Percentage */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-8 text-white">
            <p className="h4 opacity-90 mb-2">Total Dilution</p>
            <p className="text-5xl font-bold">{result.dilutionPercentage.toFixed(2)}%</p>
          </div>

          {/* Ownership Impact Table */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Ownership Impact</h2>
            <div className="overflow-x-auto">
              <table className="w-full body-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Shareholder</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Pre-IPO %</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Post-IPO %</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Change %</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(result.ownershipImpact).map((impact, idx) => (
                    <tr key={idx} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <td className="py-3 px-4 text-slate-900 dark:text-white font-medium">{impact.shareholder_name}</td>
                      <td className="text-right py-3 px-4 text-slate-900 dark:text-white">{impact.pre_ipo_pct.toFixed(2)}%</td>
                      <td className="text-right py-3 px-4 text-slate-900 dark:text-white">{impact.post_ipo_pct.toFixed(2)}%</td>
                      <td className={`text-right py-3 px-4 font-semibold ${impact.change_pct < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {impact.change_pct.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="w-full bg-slate-600 hover:bg-slate-700 text-white font-medium py-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export to CSV
          </button>
        </div>
      )}
    </div>
  )
}
