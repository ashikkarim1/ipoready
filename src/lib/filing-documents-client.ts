/**
 * Client-side utilities for filing documents API
 * React hooks and helper functions for consuming the filing documents API
 */

import {
  UploadDocumentResponse,
  GetRequirementsResponse,
  UpdateStatusRequest,
  UpdateStatusResponse,
  GetDocumentResponse,
  DeleteDocumentResponse,
  ProgressResponse,
  TemplatesResponse,
  ExchangeId,
  DocumentStatus,
} from '@/types/filing-documents'

/**
 * Upload a document for a specific document type
 */
export async function uploadDocument(
  documentTypeId: string,
  file: File
): Promise<UploadDocumentResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(
    `/api/filing-documents/upload-doc/${documentTypeId}`,
    {
      method: 'POST',
      body: formData,
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to upload document')
  }

  return response.json()
}

/**
 * Get all filing document requirements for an exchange
 */
export async function getRequirements(
  exchangeId: ExchangeId
): Promise<GetRequirementsResponse> {
  const response = await fetch(
    `/api/filing-documents/get-requirements?exchange_id=${exchangeId}`
  )

  if (!response.ok) {
    throw new Error('Failed to fetch requirements')
  }

  return response.json()
}

/**
 * Update document status
 */
export async function updateDocumentStatus(
  request: UpdateStatusRequest
): Promise<UpdateStatusResponse> {
  const response = await fetch(
    '/api/filing-documents/update-status',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update status')
  }

  return response.json()
}

/**
 * Get a document (returns URL or binary)
 */
export async function getDocument(
  documentId: string
): Promise<GetDocumentResponse> {
  const response = await fetch(
    `/api/filing-documents/get-document?document_id=${documentId}`
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch document')
  }

  return response.json()
}

/**
 * Delete a document
 */
export async function deleteDocument(
  documentId: string
): Promise<DeleteDocumentResponse> {
  const response = await fetch(
    `/api/filing-documents/delete?document_id=${documentId}`,
    {
      method: 'DELETE',
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete document')
  }

  return response.json()
}

/**
 * Get filing progress for company
 */
export async function getProgress(
  exchangeId: ExchangeId
): Promise<ProgressResponse> {
  const response = await fetch(
    `/api/filing-documents/progress?exchange_id=${exchangeId}`
  )

  if (!response.ok) {
    throw new Error('Failed to fetch progress')
  }

  return response.json()
}

/**
 * Get document templates
 */
export async function getTemplates(
  exchangeId?: ExchangeId
): Promise<TemplatesResponse> {
  const url = exchangeId
    ? `/api/filing-documents/templates?exchange_id=${exchangeId}`
    : '/api/filing-documents/templates'

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Failed to fetch templates')
  }

  return response.json()
}

/**
 * Download a document file
 */
export function downloadDocument(documentId: string, fileName: string): void {
  const link = document.createElement('a')
  link.href = `/api/filing-documents/get-document?document_id=${documentId}`
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Open document in new tab
 */
export function viewDocument(documentId: string): void {
  window.open(
    `/api/filing-documents/get-document?document_id=${documentId}`,
    '_blank'
  )
}

/**
 * Validate file for upload
 */
export function validateFile(
  file: File,
  maxSizeMB: number = 50
): { valid: boolean; error?: string } {
  const maxBytes = maxSizeMB * 1024 * 1024
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    }
  }

  const allowedTypes = ['application/pdf']
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Only PDF files are allowed',
    }
  }

  return { valid: true }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date | undefined): string {
  if (!date) return 'Not uploaded'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Get status badge styling
 */
export function getStatusBadgeClass(status: DocumentStatus): string {
  const baseClass = 'px-2 py-1 rounded-full text-xs font-semibold'
  const statusClasses: Record<DocumentStatus, string> = {
    not_started: `${baseClass} bg-gray-100 text-gray-800`,
    in_progress: `${baseClass} bg-blue-100 text-blue-800`,
    ready: `${baseClass} bg-amber-100 text-amber-800`,
    uploaded: `${baseClass} bg-emerald-100 text-emerald-800`,
    verified: `${baseClass} bg-green-100 text-green-800`,
  }
  return statusClasses[status] || baseClass
}

/**
 * Group documents by category
 */
export function groupDocumentsByCategory(
  documents: Array<{ category: string; [key: string]: unknown }>
): Record<string, unknown[]> {
  return documents.reduce(
    (acc, doc) => {
      const category = doc.category as string
      if (!acc[category]) acc[category] = []
      acc[category].push(doc)
      return acc
    },
    {} as Record<string, unknown[]>
  )
}

/**
 * Calculate days remaining based on estimated prep days
 */
export function calculateDaysRemaining(
  uploadedAt: string | Date | undefined,
  estimatedDays: number
): number | null {
  if (!uploadedAt) return estimatedDays
  const uploaded = typeof uploadedAt === 'string' ? new Date(uploadedAt) : uploadedAt
  const deadline = new Date(uploaded)
  deadline.setDate(deadline.getDate() + estimatedDays)
  const today = new Date()
  const remaining = Math.ceil(
    (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )
  return Math.max(0, remaining)
}

/**
 * Check if filing is on track
 */
export function isFilingOnTrack(
  progress: number,
  daysRemaining: number | null
): boolean {
  if (daysRemaining === null) return progress === 100
  if (daysRemaining < 0) return progress === 100
  const requiredDailyProgress = 100 / daysRemaining
  const actualDailyProgress = progress > 0 ? 100 / (100 - progress) : 0
  return actualDailyProgress >= requiredDailyProgress * 0.8 // 80% buffer
}

/**
 * Get critical missing documents (required but not uploaded)
 */
export function getCriticalMissingDocuments(
  documents: Array<{
    documentName: string
    isRequired: boolean
    currentStatus: DocumentStatus
  }>
): string[] {
  return documents
    .filter((doc) => doc.isRequired && !['verified', 'uploaded'].includes(doc.currentStatus))
    .map((doc) => doc.documentName)
}

/**
 * Estimate completion date
 */
export function estimateCompletionDate(
  progress: number,
  documents: Array<{ estimatedPrepDays?: number }>
): Date | null {
  if (progress === 100) return new Date()

  const totalDays = documents.reduce((sum, doc) => sum + (doc.estimatedPrepDays || 7), 0)
  const daysElapsed = (progress / 100) * totalDays
  const remainingDays = totalDays - daysElapsed

  const completion = new Date()
  completion.setDate(completion.getDate() + Math.ceil(remainingDays))
  return completion
}
