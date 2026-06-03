'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, AlertCircle, Plus, FileText, Check, Clock, X } from 'lucide-react'

const ConsentSchema = z.object({
  from_entity: z.string().min(1),
  entity_type: z.enum(['auditor', 'lawyer', 'valuation-expert', 'environmental-expert', 'other-expert']),
  consent_type: z.string().min(1),
  expiry_date: z.string().optional(),
})

type ConsentFormData = z.infer<typeof ConsentSchema>

interface Consent {
  id: string
  from_entity: string
  entity_type: string
  consent_type: string
  status: 'pending' | 'received' | 'rejected' | 'expired' | 'withdrawn'
  document_url?: string
  expiry_date?: string
  created_at: string
}

const STATUS_COLORS = {
  pending: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800', text: 'text-yellow-900 dark:text-yellow-100', icon: Clock },
  received: { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800', text: 'text-green-900 dark:text-green-100', icon: Check },
  rejected: { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', text: 'text-red-900 dark:text-red-100', icon: X },
  expired: { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', text: 'text-red-900 dark:text-red-100', icon: AlertCircle },
  withdrawn: { bg: 'bg-slate-50 dark:bg-slate-900/20', border: 'border-slate-200 dark:border-slate-800', text: 'text-slate-900 dark:text-slate-100', icon: X },
}

export function ConsentLettersTracker() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [consents, setConsents] = useState<Consent[]>([])
  const [showForm, setShowForm] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ConsentFormData>({
    resolver: zodResolver(ConsentSchema) as any,
  })

  useEffect(() => {
    fetchConsents()
  }, [])

  const fetchConsents = async () => {
    try {
      const response = await fetch('/api/compliance/consents')
      if (!response.ok) throw new Error('Failed to fetch consents')
      const data = await response.json()
      setConsents(data.consents || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: ConsentFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/compliance/consents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to create consent')

      await fetchConsents()
      reset()
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Consent Letters</h1>
          <p className="text-slate-600 dark:text-slate-400">Track regulatory and expert consents for IPO</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Consent
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block label font-medium text-slate-700 dark:text-slate-300 mb-2">Entity Name</label>
              <input
                {...register('from_entity')}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                placeholder="e.g., Deloitte LLP"
              />
              {errors.from_entity && <p className="text-red-500 body-sm mt-1">{errors.from_entity.message}</p>}
            </div>

            <div>
              <label className="block label font-medium text-slate-700 dark:text-slate-300 mb-2">Entity Type</label>
              <select
                {...register('entity_type')}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              >
                <option value="auditor">Auditor</option>
                <option value="lawyer">Lawyer</option>
                <option value="valuation-expert">Valuation Expert</option>
                <option value="environmental-expert">Environmental Expert</option>
                <option value="other-expert">Other Expert</option>
              </select>
            </div>

            <div>
              <label className="block label font-medium text-slate-700 dark:text-slate-300 mb-2">Consent Type</label>
              <input
                {...register('consent_type')}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                placeholder="e.g., Audit Consent"
              />
            </div>

            <div>
              <label className="block label font-medium text-slate-700 dark:text-slate-300 mb-2">Expiry Date</label>
              <input
                type="date"
                {...register('expiry_date')}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="inline mr-2 h-4 w-4 animate-spin" /> : null}
              Create Consent
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 text-slate-900 dark:text-white font-medium py-2 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
          <p className="text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Consents Table */}
      {consents.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg p-8 text-center border border-slate-200 dark:border-slate-700">
          <FileText className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-600 dark:text-slate-400">No consents yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Entity</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Consent Type</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Expiry Date</th>
              </tr>
            </thead>
            <tbody>
              {consents.map(consent => {
                const statusConfig = STATUS_COLORS[consent.status]
                const StatusIcon = statusConfig.icon
                return (
                  <tr key={consent.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="py-3 px-4 text-slate-900 dark:text-white font-medium">{consent.from_entity}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 body-sm">{consent.entity_type}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 body-sm">{consent.consent_type}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.border} border`}>
                        <StatusIcon className="h-4 w-4" />
                        {consent.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 body-sm">
                      {consent.expiry_date ? new Date(consent.expiry_date).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
