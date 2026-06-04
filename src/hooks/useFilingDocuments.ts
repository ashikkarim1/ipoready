/**
 * React Hook: useFilingDocuments
 * Comprehensive hook for managing filing documents
 */

'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  uploadDocument,
  getRequirements,
  updateDocumentStatus,
  getDocument,
  deleteDocument,
  getProgress,
  getTemplates,
} from '@/lib/filing-documents-client'
import {
  DocumentRequirement,
  DocumentStatus,
  ExchangeId,
  FilingDocumentTemplate,
  ProgressResponse,
  GetRequirementsResponse,
} from '@/types/filing-documents'

interface UseFilingDocumentsOptions {
  exchangeId?: ExchangeId
  autoLoad?: boolean
}

interface FilingDocumentsState {
  documents: DocumentRequirement[]
  templates: FilingDocumentTemplate[]
  progress: ProgressResponse | null
  loading: boolean
  error: string | null
}

interface FilingDocumentsActions {
  // Document operations
  uploadDocument: (documentTypeId: string, file: File) => Promise<void>
  updateStatus: (documentId: string, status: DocumentStatus, notes?: string) => Promise<void>
  deleteDocument: (documentId: string) => Promise<void>
  getDocument: (documentId: string) => Promise<void>

  // Data fetching
  loadRequirements: (exchangeId: ExchangeId) => Promise<void>
  loadProgress: (exchangeId: ExchangeId) => Promise<void>
  loadTemplates: (exchangeId?: ExchangeId) => Promise<void>

  // State management
  setError: (error: string | null) => void
  reset: () => void
}

interface UseFilingDocumentsReturn {
  state: FilingDocumentsState
  actions: FilingDocumentsActions
}

export function useFilingDocuments(
  options: UseFilingDocumentsOptions = {}
): UseFilingDocumentsReturn {
  const { exchangeId, autoLoad = true } = options

  const [state, setState] = useState<FilingDocumentsState>({
    documents: [],
    templates: [],
    progress: null,
    loading: false,
    error: null,
  })

  // Load requirements
  const loadRequirements = useCallback(async (exId: ExchangeId) => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const data: GetRequirementsResponse = await getRequirements(exId)
      setState((s) => ({
        ...s,
        documents: data.documents,
        loading: false,
      }))
    } catch (error) {
      setState((s) => ({
        ...s,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load requirements',
      }))
    }
  }, [])

  // Load progress
  const loadProgress = useCallback(async (exId: ExchangeId) => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const data: ProgressResponse = await getProgress(exId)
      setState((s) => ({
        ...s,
        progress: data,
        loading: false,
      }))
    } catch (error) {
      setState((s) => ({
        ...s,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load progress',
      }))
    }
  }, [])

  // Load templates
  const loadTemplates = useCallback(async (exId?: ExchangeId) => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const data = await getTemplates(exId)
      setState((s) => ({
        ...s,
        templates: data.templates,
        loading: false,
      }))
    } catch (error) {
      setState((s) => ({
        ...s,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load templates',
      }))
    }
  }, [])

  // Upload document
  const handleUploadDocument = useCallback(
    async (documentTypeId: string, file: File) => {
      setState((s) => ({ ...s, loading: true, error: null }))
      try {
        await uploadDocument(documentTypeId, file)
        // Reload requirements and progress to show updates
        if (exchangeId) {
          await loadRequirements(exchangeId)
          await loadProgress(exchangeId)
        }
        setState((s) => ({ ...s, loading: false }))
      } catch (error) {
        setState((s) => ({
          ...s,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to upload document',
        }))
        throw error
      }
    },
    [exchangeId, loadRequirements, loadProgress]
  )

  // Update document status
  const handleUpdateStatus = useCallback(
    async (documentId: string, status: DocumentStatus, notes?: string) => {
      setState((s) => ({ ...s, loading: true, error: null }))
      try {
        await updateDocumentStatus({ documentId, status, notes })
        // Reload requirements and progress
        if (exchangeId) {
          await loadRequirements(exchangeId)
          await loadProgress(exchangeId)
        }
        setState((s) => ({ ...s, loading: false }))
      } catch (error) {
        setState((s) => ({
          ...s,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to update status',
        }))
        throw error
      }
    },
    [exchangeId, loadRequirements, loadProgress]
  )

  // Delete document
  const handleDeleteDocument = useCallback(
    async (documentId: string) => {
      setState((s) => ({ ...s, loading: true, error: null }))
      try {
        await deleteDocument(documentId)
        // Reload requirements and progress
        if (exchangeId) {
          await loadRequirements(exchangeId)
          await loadProgress(exchangeId)
        }
        setState((s) => ({ ...s, loading: false }))
      } catch (error) {
        setState((s) => ({
          ...s,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to delete document',
        }))
        throw error
      }
    },
    [exchangeId, loadRequirements, loadProgress]
  )

  // Get document (download/view)
  const handleGetDocument = useCallback(async (documentId: string) => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      await getDocument(documentId)
      setState((s) => ({ ...s, loading: false }))
    } catch (error) {
      setState((s) => ({
        ...s,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to get document',
      }))
      throw error
    }
  }, [])

  // Reset state
  const reset = useCallback(() => {
    setState({
      documents: [],
      templates: [],
      progress: null,
      loading: false,
      error: null,
    })
  }, [])

  // Set error
  const setError = useCallback((error: string | null) => {
    setState((s) => ({ ...s, error }))
  }, [])

  // Auto-load on mount or when exchangeId changes
  useEffect(() => {
    if (autoLoad && exchangeId) {
      Promise.all([
        loadRequirements(exchangeId),
        loadProgress(exchangeId),
        loadTemplates(exchangeId),
      ])
    }
  }, [autoLoad, exchangeId, loadRequirements, loadProgress, loadTemplates])

  return {
    state,
    actions: {
      uploadDocument: handleUploadDocument,
      updateStatus: handleUpdateStatus,
      deleteDocument: handleDeleteDocument,
      getDocument: handleGetDocument,
      loadRequirements,
      loadProgress,
      loadTemplates,
      setError,
      reset,
    },
  }
}

/**
 * Hook for single document operations
 */
export function useFilingDocument(documentId: string) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateStatus = useCallback(
    async (status: DocumentStatus, notes?: string) => {
      setLoading(true)
      setError(null)
      try {
        await updateDocumentStatus({ documentId, status, notes })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update status')
        throw err
      } finally {
        setLoading(false)
      }
    },
    [documentId]
  )

  const remove = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      await deleteDocument(documentId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete document')
      throw err
    } finally {
      setLoading(false)
    }
  }, [documentId])

  const download = useCallback(
    (fileName: string) => {
      const link = document.createElement('a')
      link.href = `/api/filing-documents/get-document?document_id=${documentId}`
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    [documentId]
  )

  const view = useCallback(() => {
    window.open(
      `/api/filing-documents/get-document?document_id=${documentId}`,
      '_blank'
    )
  }, [documentId])

  return {
    loading,
    error,
    updateStatus,
    remove,
    download,
    view,
  }
}

/**
 * Hook for document upload with validation
 */
export function useFileUpload(onSuccess?: () => void) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const upload = useCallback(
    async (documentTypeId: string, file: File) => {
      setLoading(true)
      setError(null)
      setProgress(0)

      try {
        // Validate file
        if (file.size > 50 * 1024 * 1024) {
          throw new Error('File size exceeds 50MB limit')
        }

        if (!file.type.includes('pdf')) {
          throw new Error('Only PDF files are allowed')
        }

        setProgress(50)

        // Upload
        const result = await uploadDocument(documentTypeId, file)

        setProgress(100)
        onSuccess?.()

        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [onSuccess]
  )

  return {
    loading,
    error,
    progress,
    upload,
    reset: () => {
      setError(null)
      setProgress(0)
    },
  }
}
