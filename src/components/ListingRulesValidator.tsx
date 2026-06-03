'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react'

const ValidationSchema = z.object({
  exchange: z.enum(['TSX', 'TSXV', 'NASDAQ', 'NYSE', 'CSE']),
  current_share_count: z.coerce.number().int().positive(),
  current_public_float_pct: z.coerce.number().min(0).max(100),
  current_board_lot_size: z.coerce.number().int().positive(),
})

type ValidationFormData = z.infer<typeof ValidationSchema>

interface Gap {
  requirement: string
  current: number
  required: number
  gap: number
  status: 'met' | 'not-met'
  action: string
}

interface ValidationResult {
  exchange: string
  overall_compliant: boolean
  compliance_score: number
  gaps: Gap[]
  critical_items: Gap[]
  next_steps: string[]
}

export function ListingRulesValidator() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ValidationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ValidationFormData>({
    resolver: zodResolver(ValidationSchema) as any,
    defaultValues: {
      exchange: 'NASDAQ',
      current_share_count: 50000000,
      current_public_float_pct: 8,
      current_board_lot_size: 100,
    },
  })

  const currentExchange = watch('exchange')

  const onSubmit = async (data: ValidationFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/compliance/listing-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Validation failed')

      const res = await response.json()
      setResult(res.validation)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-lg">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Listing Requirements Validator</h1>
        <p className="text-slate-600 dark:text-slate-400">Validate compliance with exchange listing standards</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-sm border border-slate-200 dark:border-slate-700 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Exchange</label>
            <select
              {...register('exchange')}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
            >
              <option value="NASDAQ">NASDAQ</option>
              <option value="NYSE">NYSE</option>
              <option value="TSX">TSX</option>
              <option value="TSXV">TSXV</option>
              <option value="CSE">CSE</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Current Share Count</label>
            <input
              type="number"
              {...register('current_share_count')}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              placeholder="50000000"
            />
            {errors.current_share_count && <p className="text-red-500 text-sm mt-1">{errors.current_share_count.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Public Float %</label>
            <input
              type="number"
              step="0.1"
              {...register('current_public_float_pct')}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              placeholder="8.0"
            />
            {errors.current_public_float_pct && <p className="text-red-500 text-sm mt-1">{errors.current_public_float_pct.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Board Lot Size</label>
            <input
              type="number"
              {...register('current_board_lot_size')}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              placeholder="100"
            />
            {errors.current_board_lot_size && <p className="text-red-500 text-sm mt-1">{errors.current_board_lot_size.message}</p>}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="inline mr-2 h-4 w-4 animate-spin" /> : null}
          Validate {currentExchange} Requirements
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
          {/* Compliance Score */}
          <div className={`rounded-lg p-8 ${result.overall_compliant ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-semibold ${result.overall_compliant ? 'text-green-900 dark:text-green-100' : 'text-orange-900 dark:text-orange-100'} mb-2`}>
                  COMPLIANCE STATUS
                </p>
                <p className={`text-5xl font-bold ${result.overall_compliant ? 'text-green-700 dark:text-green-300' : 'text-orange-700 dark:text-orange-300'}`}>
                  {result.compliance_score}%
                </p>
              </div>
              {result.overall_compliant ? (
                <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400 opacity-20" />
              ) : (
                <AlertTriangle className="h-16 w-16 text-orange-600 dark:text-orange-400 opacity-20" />
              )}
            </div>
            <p className={`text-sm mt-4 ${result.overall_compliant ? 'text-green-900 dark:text-green-100' : 'text-orange-900 dark:text-orange-100'}`}>
              {result.overall_compliant
                ? 'Your company meets all listing requirements for this exchange.'
                : 'Your company has gaps that must be addressed before listing.'}
            </p>
          </div>

          {/* Gap Analysis */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Requirement Analysis</h2>
            <div className="space-y-4">
              {result.gaps.map((gap, idx) => (
                <div key={idx} className={`p-4 rounded-lg border-2 ${gap.status === 'met' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className={`font-semibold ${gap.status === 'met' ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'}`}>
                        {gap.requirement}
                      </p>
                      <div className="mt-2 text-sm space-y-1">
                        <p className={`${gap.status === 'met' ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                          Current: <span className="font-semibold">{gap.current.toLocaleString()}</span> | Required: <span className="font-semibold">{gap.required.toLocaleString()}</span>
                        </p>
                        <p className={`${gap.status === 'met' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                          {gap.action}
                        </p>
                      </div>
                    </div>
                    {gap.status === 'met' ? (
                      <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400 mt-1 flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next Steps */}
          {result.next_steps.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Next Steps</h2>
              <ul className="space-y-2">
                {result.next_steps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                    <span className="inline-block w-6 h-6 rounded-full bg-blue-600 dark:bg-blue-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
