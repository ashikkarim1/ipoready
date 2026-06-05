'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  ChevronDown,
  AlertCircle,
  Loader2,
  FileText,
} from 'lucide-react'
import {
  DocumentCard,
  CategoryFilter,
  ProgressTracker,
  DocumentPreview,
  type DocumentStatus,
} from '@/components/filing-documents'
import {
  getRequirements,
  getProgress,
  getDocument,
  uploadDocument,
  updateDocumentStatus,
  deleteDocument,
  viewDocument,
  downloadDocument,
  validateFile,
  formatDate,
} from '@/lib/filing-documents-client'
import {
  type ExchangeId,
  type DocumentCategory,
  type DocumentRequirement,
  type ProgressResponse,
  DOCUMENT_CATEGORIES,
  EXCHANGES,
  getExchangeLabel,
} from '@/types/filing-documents'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Exchanges selectable in the hub. Order matters for the dropdown. */
const SELECTABLE_EXCHANGES: ExchangeId[] = ['nasdaq', 'nyse', 'tsx', 'tsxv', 'cse']

const DEFAULT_EXCHANGE: ExchangeId = 'nasdaq'

const CATEGORY_DESCRIPTIONS: Record<DocumentCategory, string> = {
  Financial: 'Audited statements, projections, and tax filings',
  Legal: 'Articles, contracts, IP, and regulatory approvals',
  Governance: 'Board resolutions, director bios, and policies',
  Corporate: 'Cap tables, equity plans, and shareholder agreements',
  Compliance: 'Internal controls, insurance, and risk frameworks',
}

/** Statuses that count as "complete" for progress calculations. */
const COMPLETE_STATUSES: DocumentStatus[] = ['uploaded', 'verified']

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PreviewState {
  isOpen: boolean
  documentId: string
  documentName: string
  fileUrl: string
  uploadedDate?: string
  uploadedBy?: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isComplete(status: DocumentStatus): boolean {
  return COMPLETE_STATUSES.includes(status)
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DocumentsPage() {
  // Core state
  const [selectedExchange, setSelectedExchange] = useState<ExchangeId>(DEFAULT_EXCHANGE)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [documents, setDocuments] = useState<DocumentRequirement[]>([])
  const [progress, setProgress] = useState<ProgressResponse | null>(null)

  // Async / UX state
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  // Preview modal state
  const [preview, setPreview] = useState<PreviewState | null>(null)

  // -------------------------------------------------------------------------
  // Data loading
  // -------------------------------------------------------------------------

  const loadData = useCallback(async (exchange: ExchangeId) => {
    setIsLoading(true)
    setError(null)
    try {
      // Requirements are essential; progress is best-effort.
      try {
        const requirementsRes = await getRequirements(exchange)
        setDocuments(requirementsRes.documents)
      } catch (err) {
        // Fallback: Use empty requirements with message
        console.warn('Failed to fetch requirements from API, using empty state:', err)
        setDocuments([])
      }

      try {
        const progressRes = await getProgress(exchange)
        setProgress(progressRes)
      } catch {
        // Fall back to deriving progress from the requirements payload.
        setProgress(null)
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load filing documents. Please try again.'
      )
      setDocuments([])
      setProgress(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData(selectedExchange)
  }, [selectedExchange, loadData])

  // -------------------------------------------------------------------------
  // Derived data
  // -------------------------------------------------------------------------

  // Per-category counts (complete / total) computed from current documents.
  const categoryStats = useMemo(() => {
    const stats: Record<string, { completed: number; total: number }> = {}
    for (const cat of DOCUMENT_CATEGORIES) {
      stats[cat] = { completed: 0, total: 0 }
    }
    for (const doc of documents) {
      const bucket = stats[doc.category]
      if (!bucket) continue
      bucket.total += 1
      if (isComplete(doc.currentStatus)) bucket.completed += 1
    }
    return stats
  }, [documents])

  // Only show category tabs that actually have documents for this exchange.
  const categoryFilters = useMemo(
    () =>
      DOCUMENT_CATEGORIES.filter((cat) => categoryStats[cat]?.total > 0).map(
        (cat) => ({
          id: cat,
          label: cat,
          count: categoryStats[cat].completed,
          total: categoryStats[cat].total,
        })
      ),
    [categoryStats]
  )

  const categoryProgressForTracker = useMemo(
    () =>
      categoryFilters.map((c) => ({
        name: c.label,
        completed: c.count,
        total: c.total,
      })),
    [categoryFilters]
  )

  // Totals — prefer API progress, fall back to local computation.
  const totalDocuments = documents.length
  const totalCompleted = useMemo(
    () => documents.filter((d) => isComplete(d.currentStatus)).length,
    [documents]
  )

  const overallPercent =
    progress?.overall ??
    (totalDocuments > 0
      ? Math.round((totalCompleted / totalDocuments) * 100)
      : 0)

  // Rough time-to-completion estimate from remaining required prep days.
  const estimatedDaysRemaining = useMemo(() => {
    const remaining = documents
      .filter((d) => !isComplete(d.currentStatus))
      .reduce((sum, d) => sum + (d.estimatedPrepDays || 0), 0)
    return remaining > 0 ? remaining : undefined
  }, [documents])

  // Search + category filtering.
  const filteredDocuments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return documents.filter((doc) => {
      const matchesSearch =
        !query || doc.documentName.toLowerCase().includes(query)
      const matchesCategory =
        !selectedCategory || doc.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [documents, searchQuery, selectedCategory])

  // -------------------------------------------------------------------------
  // Local state mutation helpers
  // -------------------------------------------------------------------------

  const patchDocument = useCallback(
    (documentId: string, changes: Partial<DocumentRequirement>) => {
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === documentId ? { ...doc, ...changes } : doc
        )
      )
    },
    []
  )

  const refreshProgress = useCallback(() => {
    getProgress(selectedExchange)
      .then(setProgress)
      .catch(() => {
        /* keep deriving progress locally on failure */
      })
  }, [selectedExchange])

  // -------------------------------------------------------------------------
  // Action handlers
  // -------------------------------------------------------------------------

  const handleUpload = useCallback(
    async (documentId: string, file: File) => {
      setActionError(null)

      const validation = validateFile(file)
      if (!validation.valid) {
        setActionError(validation.error || 'Invalid file')
        return
      }

      setUploadingDocId(documentId)
      try {
        const res = await uploadDocument(documentId, file)
        if (!res.success) {
          throw new Error(res.error || 'Upload failed')
        }
        patchDocument(documentId, {
          currentStatus: (res.status as DocumentStatus) || 'uploaded',
          uploadedAt: new Date(),
        })
        refreshProgress()
      } catch (err) {
        setActionError(
          err instanceof Error ? err.message : 'Failed to upload document'
        )
      } finally {
        setUploadingDocId(null)
      }
    },
    [patchDocument, refreshProgress]
  )

  const handleView = useCallback(async (doc: DocumentRequirement) => {
    setActionError(null)
    try {
      const res = await getDocument(doc.id)
      if (res.success && res.documentUrl) {
        setPreview({
          isOpen: true,
          documentId: doc.id,
          documentName: doc.documentName,
          fileUrl: res.documentUrl,
          uploadedDate: doc.uploadedAt ? formatDate(doc.uploadedAt) : undefined,
        })
      } else {
        // No previewable URL (e.g. streamed file) — open directly.
        viewDocument(doc.id)
      }
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Failed to open document'
      )
    }
  }, [])

  const handleDownload = useCallback((doc: DocumentRequirement) => {
    downloadDocument(doc.id, `${doc.documentName}.pdf`)
  }, [])

  const handleDelete = useCallback(
    async (documentId: string) => {
      setActionError(null)
      try {
        const res = await deleteDocument(documentId)
        if (!res.success) throw new Error(res.error || 'Delete failed')
        // Reset workflow status back to the start.
        await updateDocumentStatus({
          documentId,
          status: 'not_started',
        }).catch(() => {})
        patchDocument(documentId, {
          currentStatus: 'not_started',
          uploadedAt: null,
        })
        setPreview((prev) => (prev?.documentId === documentId ? null : prev))
        refreshProgress()
      } catch (err) {
        setActionError(
          err instanceof Error ? err.message : 'Failed to delete document'
        )
      }
    },
    [patchDocument, refreshProgress]
  )

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="min-h-screen" style={{ background: '#F7F6F4' }} suppressHydrationWarning>
      {/* ===================== Header ===================== */}
      <header
        className="border-b"
        style={{ borderColor: '#E5E4E0', background: '#FFFFFF' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-xs uppercase tracking-widest font-semibold text-text-muted mb-3">
              IPO Roadmap
            </div>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="serif text-3xl sm:text-4xl text-nav mb-2">
                  Filing Documents Hub
                </h1>
                <p className="text-text-muted max-w-2xl">
                  Track, prepare, and upload every document required for your
                  listing. Requirements update automatically based on your
                  selected exchange.
                </p>
              </div>

              {/* Exchange selector */}
              <div className="w-full lg:w-auto">
                <label
                  htmlFor="exchange-select"
                  className="block text-xs uppercase tracking-widest font-semibold text-text-muted mb-2"
                >
                  Target Exchange
                </label>
                <div className="relative">
                  <select
                    id="exchange-select"
                    value={selectedExchange}
                    onChange={(e) => {
                      setSelectedExchange(e.target.value as ExchangeId)
                      setSelectedCategory(null)
                      setSearchQuery('')
                    }}
                    disabled={isLoading}
                    className="w-full lg:w-64 appearance-none rounded-lg border bg-white px-4 py-3 pr-10 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-60"
                    style={{ borderColor: '#E5E4E0' }}
                  >
                    {SELECTABLE_EXCHANGES.map((id) => (
                      <option key={id} value={id}>
                        {EXCHANGES[id]?.name || id.toUpperCase()}
                        {EXCHANGES[id]?.country ? ` — ${EXCHANGES[id].country}` : ''}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                </div>
                {!isLoading && !error && (
                  <p className="mt-2 text-xs text-text-muted">
                    {totalDocuments} document
                    {totalDocuments === 1 ? '' : 's'} required for{' '}
                    {getExchangeLabel(selectedExchange)}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* ===================== Content ===================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Action-level error banner */}
        {actionError && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">{actionError}</p>
            </div>
            <button
              onClick={() => setActionError(null)}
              className="text-sm font-medium text-red-700 hover:text-red-900"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Loading state */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-8 h-8 text-red-600 animate-spin mb-4" />
            <p className="text-text-muted">
              Loading {getExchangeLabel(selectedExchange)} requirements…
            </p>
          </div>
        ) : error ? (
          /* Fatal error state */
          <div className="card p-12 text-center">
            <AlertCircle className="w-10 h-10 text-red-600 mx-auto mb-4" />
            <h2 className="h3 font-semibold text-gray-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-text-muted mb-6">{error}</p>
            <button
              onClick={() => loadData(selectedExchange)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-medium transition-colors"
              style={{ background: '#E8312A' }}
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Progress dashboard */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <ProgressTracker
                totalCompleted={totalCompleted}
                totalDocuments={totalDocuments || 1}
                estimatedDaysRemaining={estimatedDaysRemaining}
                categoryProgress={categoryProgressForTracker}
              />
            </motion.div>

            {/* Search bar */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documents by name…"
                className="w-full rounded-lg border bg-white py-3.5 pl-12 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                style={{ borderColor: '#E5E4E0' }}
              />
            </div>

            {/* Category filter tabs */}
            <CategoryFilter
              categories={categoryFilters}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />

            {/* Results meta */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-text-muted">
                Showing {filteredDocuments.length} of {totalDocuments} documents
                {selectedCategory ? ` in ${selectedCategory}` : ''}
                {overallPercent > 0 ? ` · ${overallPercent}% complete` : ''}
              </p>
            </div>

            {/* Document grid */}
            {filteredDocuments.length === 0 ? (
              <div className="card p-12 text-center">
                <FileText className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                <h3 className="h4 font-semibold text-gray-900 mb-1">
                  No documents found
                </h3>
                <p className="text-text-muted">
                  {searchQuery
                    ? 'Try adjusting your search or category filter.'
                    : 'No documents are configured for this selection.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredDocuments.map((doc) => {
                  const baseDescription =
                    CATEGORY_DESCRIPTIONS[doc.category as DocumentCategory] || ''
                  const description = doc.regulatoryReference
                    ? `${baseDescription}${baseDescription ? ' · ' : ''}Ref: ${doc.regulatoryReference}`
                    : baseDescription
                  const isUploading = uploadingDocId === doc.id
                  const complete = isComplete(doc.currentStatus)
                  return (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className="relative"
                    >
                      {isUploading && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/70 backdrop-blur-sm">
                          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <Loader2 className="w-5 h-5 animate-spin text-red-600" />
                            Uploading…
                          </div>
                        </div>
                      )}
                      <DocumentCard
                        id={doc.id}
                        name={doc.documentName}
                        description={description}
                        category={doc.category}
                        status={doc.currentStatus}
                        isRequired={doc.isRequired}
                        estimatedDays={doc.estimatedPrepDays}
                        uploadedDate={
                          doc.uploadedAt ? formatDate(doc.uploadedAt) : undefined
                        }
                        templateUrl={doc.templateUrl || undefined}
                        guideUrl={doc.exampleDocumentUrl || undefined}
                        onUpload={(file) => handleUpload(doc.id, file)}
                        onView={
                          complete || doc.currentStatus === 'ready'
                            ? () => handleView(doc)
                            : undefined
                        }
                        onDownload={complete ? () => handleDownload(doc) : undefined}
                        onDelete={complete ? () => handleDelete(doc.id) : undefined}
                      />
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ===================== Preview Modal ===================== */}
      {preview && (
        <DocumentPreview
          isOpen={preview.isOpen}
          documentName={preview.documentName}
          fileUrl={preview.fileUrl}
          uploadedDate={preview.uploadedDate}
          uploadedBy={preview.uploadedBy}
          onClose={() => setPreview(null)}
          onDownload={() =>
            downloadDocument(preview.documentId, `${preview.documentName}.pdf`)
          }
          onDelete={() => handleDelete(preview.documentId)}
        />
      )}
    </div>
  )
}
