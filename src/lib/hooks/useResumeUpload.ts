/**
 * useResumeUpload Hook
 * Client-side hook for managing resume uploads, downloads, and extraction
 */

import { useState, useCallback } from 'react'
import {
  UploadResumeResponse,
  ExtractResumeTextResponse,
  DirectorResumeRecord,
  ExtractedResumeData,
} from '@/lib/types/resume.types'

interface UseResumeUploadState {
  isLoading: boolean
  error: string | null
  success: boolean
  currentResume: DirectorResumeRecord | null
  uploadProgress: number
}

interface UseResumeUploadActions {
  uploadResume: (
    directorId: string,
    file: File
  ) => Promise<UploadResumeResponse | null>
  downloadResume: (directorId: string, resumeId: string) => Promise<void>
  deleteResume: (directorId: string, resumeId: string) => Promise<boolean>
  extractResumeText: (
    directorId: string,
    resumeId: string,
    useAI?: boolean
  ) => Promise<ExtractResumeTextResponse | null>
  getResume: (directorId: string) => Promise<DirectorResumeRecord | null>
  clearError: () => void
  resetState: () => void
}

export function useResumeUpload(
  directorId: string
): UseResumeUploadState & UseResumeUploadActions {
  const [state, setState] = useState<UseResumeUploadState>({
    isLoading: false,
    error: null,
    success: false,
    currentResume: null,
    uploadProgress: 0,
  })

  const resetError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }))
  }, [])

  const resetState = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      success: false,
      currentResume: null,
      uploadProgress: 0,
    })
  }, [])

  const uploadResume = useCallback(
    async (directorId: string, file: File): Promise<UploadResumeResponse | null> => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
        success: false,
      }))

      try {
        const formData = new FormData()
        formData.append('file', file)

        const xhr = new XMLHttpRequest()

        // Track upload progress
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100
            setState((prev) => ({
              ...prev,
              uploadProgress: percentComplete,
            }))
          }
        })

        // Handle upload completion
        const response = await new Promise<UploadResumeResponse>((resolve, reject) => {
          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(JSON.parse(xhr.responseText))
            } else {
              reject(new Error(xhr.responseText))
            }
          })

          xhr.addEventListener('error', () => {
            reject(new Error('Upload failed'))
          })

          xhr.open('POST', `/api/directors-officers/${directorId}/upload-resume`)
          xhr.send(formData)
        })

        setState((prev) => ({
          ...prev,
          isLoading: false,
          success: true,
          uploadProgress: 100,
        }))

        return response
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed'
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
          uploadProgress: 0,
        }))
        return null
      }
    },
    []
  )

  const downloadResume = useCallback(
    async (directorId: string, resumeId: string): Promise<void> => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }))

      try {
        const response = await fetch(
          `/api/directors-officers/${directorId}/get-resume?resumeId=${resumeId}`
        )

        if (!response.ok) {
          throw new Error('Failed to download resume')
        }

        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url

        // Extract filename from Content-Disposition header or use default
        const contentDisposition = response.headers.get('Content-Disposition')
        const filename = contentDisposition
          ? contentDisposition.split('filename="')[1]?.split('"')[0]
          : `resume-${resumeId}.pdf`

        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        setState((prev) => ({
          ...prev,
          isLoading: false,
          success: true,
        }))
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Download failed'
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }))
      }
    },
    []
  )

  const deleteResume = useCallback(
    async (directorId: string, resumeId: string): Promise<boolean> => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }))

      try {
        const response = await fetch(
          `/api/directors-officers/${directorId}/delete-resume?resumeId=${resumeId}`,
          { method: 'DELETE' }
        )

        if (!response.ok) {
          throw new Error('Failed to delete resume')
        }

        setState((prev) => ({
          ...prev,
          isLoading: false,
          success: true,
        }))

        return true
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Delete failed'
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }))
        return false
      }
    },
    []
  )

  const extractResumeText = useCallback(
    async (
      directorId: string,
      resumeId: string,
      useAI: boolean = false
    ): Promise<ExtractResumeTextResponse | null> => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }))

      try {
        const response = await fetch(
          `/api/directors-officers/${directorId}/extract-resume-text`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              resumeId,
              useAI,
            }),
          }
        )

        if (!response.ok) {
          throw new Error('Failed to extract resume text')
        }

        const data: ExtractResumeTextResponse = await response.json()

        setState((prev) => ({
          ...prev,
          isLoading: false,
          success: true,
        }))

        return data
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Extraction failed'
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }))
        return null
      }
    },
    []
  )

  const getResume = useCallback(
    async (directorId: string): Promise<DirectorResumeRecord | null> => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }))

      try {
        const response = await fetch(`/api/directors-officers/${directorId}/get-resume`)

        if (!response.ok) {
          throw new Error('Failed to fetch resume')
        }

        // Note: This returns a file, not JSON metadata
        // For getting metadata, you'd need a separate endpoint
        setState((prev) => ({
          ...prev,
          isLoading: false,
        }))

        return null // This endpoint returns file data
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Fetch failed'
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }))
        return null
      }
    },
    []
  )

  return {
    ...state,
    uploadResume,
    downloadResume,
    deleteResume,
    extractResumeText,
    getResume,
    clearError: resetError,
    resetState,
  }
}

/**
 * Hook for managing multiple resumes
 */
interface UseResumesListState {
  resumes: DirectorResumeRecord[]
  isLoading: boolean
  error: string | null
  total: number
  page: number
}

interface UseResumesListActions {
  loadResumes: (directorId: string, page?: number) => Promise<void>
  deleteResume: (directorId: string, resumeId: string) => Promise<boolean>
  setCurrentResume: (directorId: string, resumeId: string) => Promise<boolean>
  nextPage: () => void
  prevPage: () => void
  clearError: () => void
}

export function useResumesList(
  itemsPerPage: number = 10
): UseResumesListState & UseResumesListActions {
  const [state, setState] = useState<UseResumesListState>({
    resumes: [],
    isLoading: false,
    error: null,
    total: 0,
    page: 0,
  })

  const loadResumes = useCallback(
    async (directorId: string, page: number = 0): Promise<void> => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }))

      try {
        const offset = page * itemsPerPage
        const response = await fetch(
          `/api/directors-officers/${directorId}/list-resumes?limit=${itemsPerPage}&offset=${offset}`
        )

        if (!response.ok) {
          throw new Error('Failed to load resumes')
        }

        const data = await response.json()

        setState((prev) => ({
          ...prev,
          resumes: data.resumes || [],
          total: data.total || 0,
          page,
          isLoading: false,
        }))
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Load failed'
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }))
      }
    },
    [itemsPerPage]
  )

  const deleteResume = useCallback(
    async (directorId: string, resumeId: string): Promise<boolean> => {
      try {
        const response = await fetch(
          `/api/directors-officers/${directorId}/delete-resume?resumeId=${resumeId}`,
          { method: 'DELETE' }
        )

        if (!response.ok) {
          throw new Error('Failed to delete resume')
        }

        // Remove from list
        setState((prev) => ({
          ...prev,
          resumes: prev.resumes.filter((r) => r.id !== resumeId),
          total: Math.max(0, prev.total - 1),
        }))

        return true
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Delete failed'
        setState((prev) => ({
          ...prev,
          error: errorMessage,
        }))
        return false
      }
    },
    []
  )

  const setCurrentResume = useCallback(
    async (directorId: string, resumeId: string): Promise<boolean> => {
      try {
        // This would require a separate API endpoint
        const response = await fetch(
          `/api/directors-officers/${directorId}/set-current-resume`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resumeId }),
          }
        )

        if (!response.ok) {
          throw new Error('Failed to set current resume')
        }

        // Update list
        setState((prev) => ({
          ...prev,
          resumes: prev.resumes.map((r) => ({
            ...r,
            is_current: r.id === resumeId,
          })),
        }))

        return true
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Update failed'
        setState((prev) => ({
          ...prev,
          error: errorMessage,
        }))
        return false
      }
    },
    []
  )

  const nextPage = useCallback(() => {
    setState((prev) => ({
      ...prev,
      page: prev.page + 1,
    }))
  }, [])

  const prevPage = useCallback(() => {
    setState((prev) => ({
      ...prev,
      page: Math.max(0, prev.page - 1),
    }))
  }, [])

  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
    }))
  }, [])

  return {
    ...state,
    loadResumes,
    deleteResume,
    setCurrentResume,
    nextPage,
    prevPage,
    clearError,
  }
}
