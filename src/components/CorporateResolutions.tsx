'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, AlertCircle, Plus, FileText, Download } from 'lucide-react'

const ResolutionSchema = z.object({
  resolution_type: z.enum([
    'board-authorization',
    'shareholder-approval',
    'share-split',
    'warrant-cancellation',
    'option-acceleration',
    'articles-amendment',
    'director-appointment',
    'audit-committee-approval',
    'compensation-approval',
    'underwriter-selection',
    'other',
  ]),
  title: z.string().min(1),
  content: z.string().min(1),
})

type ResolutionFormData = z.infer<typeof ResolutionSchema>

interface Resolution {
  id: string
  resolution_type: string
  title: string
  status: 'draft' | 'approved' | 'executed' | 'rejected' | 'withdrawn'
  created_at: string
}

const STATUS_COLORS = {
  draft: 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white',
  approved: 'bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100',
  executed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100',
  rejected: 'bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-100',
  withdrawn: 'bg-orange-100 dark:bg-orange-900/30 text-orange-900 dark:text-orange-100',
}

export function CorporateResolutions() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resolutions, setResolutions] = useState<Resolution[]>([])
  const [showForm, setShowForm] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ResolutionFormData>({
    resolver: zodResolver(ResolutionSchema),
  })

  useEffect(() => {
    fetchResolutions()
  }, [])

  const fetchResolutions = async () => {
    try {
      const response = await fetch('/api/compliance/resolutions')
      if (!response.ok) throw new Error('Failed to fetch resolutions')
      const data = await response.json()
      setResolutions(data.resolutions || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: ResolutionFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/compliance/resolutions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to create resolution')

      await fetchResolutions()
      reset()
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleExport = () => {
    const csv = [
      ['Type', 'Title', 'Status', 'Created'],
      ...resolutions.map(r => [
        r.resolution_type,
        r.title,
        r.status,
        new Date(r.created_at).toLocaleDateString(),
      ]),
    ]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'corporate-resolutions.csv'
    a.click()
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
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Corporate Resolutions</h1>
          <p className="text-slate-600 dark:text-slate-400">Generate and track board and shareholder resolutions</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Resolution
          </button>
          {resolutions.length > 0 && (
            <button
              onClick={handleExport}
              className="bg-slate-600 hover:bg-slate-700 text-white font-medium py-2 px-4 rounded-lg transition flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          )}
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Resolution Type</label>
              <select
                {...register('resolution_type')}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              >
                <option value="board-authorization">Board Authorization</option>
                <option value="shareholder-approval">Shareholder Approval</option>
                <option value="share-split">Share Split</option>
                <option value="warrant-cancellation">Warrant Cancellation</option>
                <option value="option-acceleration">Option Acceleration</option>
                <option value="articles-amendment">Articles Amendment</option>
                <option value="director-appointment">Director Appointment</option>
                <option value="audit-committee-approval">Audit Committee Approval</option>
                <option value="compensation-approval">Compensation Approval</option>
                <option value="underwriter-selection">Underwriter Selection</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Title</label>
              <input
                {...register('title')}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                placeholder="e.g., Authorization for IPO Prospectus"
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Content</label>
              <textarea
                {...register('content')}
                rows={6}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                placeholder="Enter resolution text..."
              />
              {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="inline mr-2 h-4 w-4 animate-spin" /> : null}
              Create Resolution
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

      {/* Resolutions Table */}
      {resolutions.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg p-8 text-center border border-slate-200 dark:border-slate-700">
          <FileText className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-600 dark:text-slate-400">No resolutions yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Title</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Created</th>
              </tr>
            </thead>
            <tbody>
              {resolutions.map(res => (
                <tr key={res.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">{res.resolution_type}</td>
                  <td className="py-3 px-4 text-slate-900 dark:text-white font-medium">{res.title}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[res.status]}`}>
                      {res.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                    {new Date(res.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
