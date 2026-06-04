'use client'

import { useEffect, useState } from 'react'
import { Loader2, AlertCircle } from 'lucide-react'
import { FilingCheckerDashboard } from './FilingCheckerDashboard'
import type { FilingCheckerDashboardProps } from './types'

interface FilingCheckerIntegrationProps {
  filingId: string
  onError?: (error: Error) => void
  onSuccess?: () => void
}

/**
 * FilingCheckerIntegration Component
 *
 * Server-integrated version of FilingCheckerDashboard that:
 * - Fetches filing data from the API
 * - Handles error states and loading
 * - Manages callbacks for updates
 * - Provides real-time synchronization
 *
 * Usage:
 * <FilingCheckerIntegration
 *   filingId="IPO-2024-001"
 *   onSuccess={() => router.push('/filing/submit')}
 * />
 */
export function FilingCheckerIntegration({
  filingId,
  onError,
  onSuccess,
}: FilingCheckerIntegrationProps) {
  const [filingData, setFilingData] = useState<FilingCheckerDashboardProps | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Fetch filing data from API
  useEffect(() => {
    const fetchFilingData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/filings/${filingId}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch filing data: ${response.statusText}`)
        }

        const data = await response.json()
        setFilingData(data)
        setError(null)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error')
        setError(error)
        onError?.(error)
      } finally {
        setIsLoading(false)
      }
    }

    if (filingId) {
      fetchFilingData()
    }
  }, [filingId, onError])

  // Handle issue resolution with API call
  const handleResolveIssue = async (issueId: string) => {
    try {
      setIsSaving(true)

      const response = await fetch(`/api/filings/${filingId}/issues/${issueId}/resolve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resolved: true,
          resolvedAt: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to resolve issue')
      }

      // Refetch filing data to get updated scores
      const refreshResponse = await fetch(`/api/filings/${filingId}`)
      if (refreshResponse.ok) {
        const updatedData = await refreshResponse.json()
        setFilingData(updatedData)
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      onError?.(error)
    } finally {
      setIsSaving(false)
    }
  }

  // Handle PDF export
  const handleExportPDF = async () => {
    try {
      setIsSaving(true)

      const response = await fetch(`/api/filings/${filingId}/export-pdf`, {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error('Failed to export PDF')
      }

      // Download the PDF
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${filingId}-filing-status.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      onError?.(error)
    } finally {
      setIsSaving(false)
    }
  }

  // Handle status sharing
  const handleShareStatus = async () => {
    try {
      setIsSaving(true)

      const response = await fetch(`/api/filings/${filingId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sharedAt: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to share filing status')
      }

      // Show success message
      alert('Filing status shared successfully!')
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      onError?.(error)
    } finally {
      setIsSaving(false)
    }
  }

  // Handle ready to file
  const handleReadyToFile = async () => {
    try {
      setIsSaving(true)

      const response = await fetch(`/api/filings/${filingId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'submitted',
          submittedAt: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit filing')
      }

      onSuccess?.()
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      onError?.(error)
    } finally {
      setIsSaving(false)
    }
  }

  // Handle view full report
  const handleViewFullReport = () => {
    // Navigate to full report page
    window.location.href = `/filing/${filingId}/full-report`
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F7F6F4] dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            Loading filing status...
          </p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !filingData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F7F6F4] dark:bg-gray-900 p-6">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800 p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-900 dark:text-red-100 mb-2">
                Error Loading Filing
              </h3>
              <p className="text-sm text-red-800 dark:text-red-200 mb-4">
                {error?.message || 'Unable to load filing data'}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render dashboard
  return (
    <div className="relative">
      {/* Saving indicator */}
      {isSaving && (
        <div className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <Loader2 className="h-4 w-4 animate-spin" />
          Saving changes...
        </div>
      )}

      <FilingCheckerDashboard
        {...filingData}
        onResolveIssue={handleResolveIssue}
        onExportPDF={handleExportPDF}
        onShareStatus={handleShareStatus}
        onReadyToFile={handleReadyToFile}
        onViewFullReport={handleViewFullReport}
      />
    </div>
  )
}

/**
 * Expected API Endpoints
 *
 * GET /api/filings/[filingId]
 * Returns: FilingCheckerDashboardProps
 *
 * PATCH /api/filings/[filingId]/issues/[issueId]/resolve
 * Body: { resolved: boolean; resolvedAt: string }
 * Returns: { success: boolean }
 *
 * GET /api/filings/[filingId]/export-pdf
 * Returns: PDF blob
 *
 * POST /api/filings/[filingId]/share
 * Body: { sharedAt: string }
 * Returns: { success: boolean }
 *
 * POST /api/filings/[filingId]/submit
 * Body: { status: string; submittedAt: string }
 * Returns: { success: boolean; submissionId: string }
 */
