/**
 * Filing Documents API Types
 * Shared types for filing document management across exchanges
 */

export type DocumentStatus = 'not_started' | 'in_progress' | 'ready' | 'uploaded' | 'verified'

export type DocumentCategory = 'Financial' | 'Legal' | 'Governance' | 'Corporate' | 'Compliance'

export type ExchangeId = 'nasdaq' | 'nyse' | 'tsx' | 'tsxv' | 'cse' | 'sec-edgar' | 'sedar2'

/**
 * Filing Document Type - master definition of required documents
 */
export interface FilingDocumentType {
  id: string
  exchangeId: ExchangeId
  category: DocumentCategory
  documentName: string
  description?: string
  isRequired: boolean
  templateUrl?: string
  estimatedPrepDays: number
  regulatoryReference?: string
  exampleDocumentUrl?: string
  createdAt: Date
  updatedAt: Date
}

/**
 * User Filing Document - tracks document status and uploads per company
 */
export interface UserFilingDocument {
  id: string
  companyId: string
  documentTypeId: string
  status: DocumentStatus
  filePath?: string
  s3Url?: string
  uploadedAt?: Date
  uploadedBy?: string
  verifiedAt?: Date
  verifiedBy?: string
  notes?: string
  versionNumber: number
  createdAt: Date
  updatedAt: Date
}

/**
 * Document Requirement - API response format combining type and status
 */
export interface DocumentRequirement {
  id: string
  documentName: string
  category: DocumentCategory
  isRequired: boolean
  currentStatus: DocumentStatus
  uploadedAt?: Date | null
  estimatedPrepDays: number
  regulatoryReference?: string
  templateUrl?: string
  exampleDocumentUrl?: string
}

/**
 * Checklist Item for document template
 */
export interface ChecklistItem {
  item: string
  completed: boolean
}

/**
 * Filing Document Template - contains preparation guidance
 */
export interface FilingDocumentTemplate {
  id: string
  documentTypeId: string
  documentName: string
  category: DocumentCategory
  templateContent: string // Markdown format
  checklist: ChecklistItem[]
  exampleFileUrl?: string
  regulatoryReference?: string
}

/**
 * API Request/Response Types
 */

// POST /upload-doc/{documentTypeId}
export interface UploadDocumentResponse {
  success: boolean
  fileUrl?: string
  documentId?: string
  status?: DocumentStatus
  error?: string
}

// GET /get-requirements?exchange_id=
export interface GetRequirementsResponse {
  documents: DocumentRequirement[]
  progressPercent: number
  completedCount: number
  totalCount: number
}

// POST /update-status
export interface UpdateStatusRequest {
  documentId: string
  status: DocumentStatus
  notes?: string
}

export interface UpdateStatusResponse {
  success: boolean
  documentId?: string
  status?: DocumentStatus
  updatedAt?: Date
  error?: string
}

// GET /get-document?document_id=
export interface GetDocumentResponse {
  success: boolean
  documentUrl?: string
  fileName?: string
  contentType?: string
  uploadedAt?: string
  status?: DocumentStatus
  error?: string
}

// DELETE /delete?document_id=
export interface DeleteDocumentResponse {
  success: boolean
  error?: string
}

// GET /progress?exchange_id=
export interface ProgressResponse {
  overall: number // 0-100 percentage
  byCategory: Record<DocumentCategory, number>
  completedCount: number
  totalCount: number
}

// GET /templates?exchange_id=
export interface TemplatesResponse {
  templates: FilingDocumentTemplate[]
  total: number
}

/**
 * Status Summary View
 */
export interface FilingStatusSummary {
  companyId: string
  totalDocuments: number
  verifiedCount: number
  uploadedCount: number
  readyCount: number
  inProgressCount: number
  notStartedCount: number
  completionPercentage: number
}

/**
 * Dashboard Widget Data
 */
export interface FilingProgressWidget {
  exchangeId: ExchangeId
  overall: number
  byCategory: Record<DocumentCategory, number>
  nextDocument?: {
    name: string
    category: DocumentCategory
    estimatedDays: number
  }
  daysRemaining?: number
  isOnTrack: boolean
}

/**
 * Bulk Operations
 */
export interface BulkUploadResult {
  documentTypeId: string
  documentName: string
  success: boolean
  documentId?: string
  error?: string
}

/**
 * Audit Log Entry
 */
export interface FilingDocumentAuditLog {
  id: string
  documentId: string
  action: 'uploaded' | 'status_updated' | 'verified' | 'deleted'
  userId: string
  timestamp: Date
  metadata: {
    oldStatus?: DocumentStatus
    newStatus?: DocumentStatus
    notes?: string
    fileName?: string
  }
}

/**
 * Filing Readiness Summary
 */
export interface FilingReadinessSummary {
  companyId: string
  exchangeId: ExchangeId
  overallProgress: number
  categoryProgress: Record<DocumentCategory, {
    completed: number
    total: number
    percentage: number
    missingDocuments: string[]
  }>
  readyForFiling: boolean
  estimatedCompletionDate: Date | null
  criticalMissingDocuments: string[]
  riskFactors: string[]
}

/**
 * Configuration & Constants
 */
export const DOCUMENT_CATEGORIES: DocumentCategory[] = [
  'Financial',
  'Legal',
  'Governance',
  'Corporate',
  'Compliance'
]

export const DOCUMENT_STATUSES: DocumentStatus[] = [
  'not_started',
  'in_progress',
  'ready',
  'uploaded',
  'verified'
]

export const EXCHANGES: Record<ExchangeId, { name: string; country: string }> = {
  nasdaq: { name: 'NASDAQ', country: 'US' },
  nyse: { name: 'NYSE', country: 'US' },
  tsx: { name: 'TSX', country: 'Canada' },
  tsxv: { name: 'TSXV', country: 'Canada' },
  cse: { name: 'CSE', country: 'Canada' },
  'sec-edgar': { name: 'SEC EDGAR', country: 'US' },
  sedar2: { name: 'SEDAR2', country: 'Canada' },
}

export const STATUS_COLORS: Record<DocumentStatus, string> = {
  not_started: '#9CA3AF', // gray
  in_progress: '#3B82F6', // blue
  ready: '#F59E0B', // amber
  uploaded: '#10B981', // emerald
  verified: '#059669', // green-600
}

export const CATEGORY_ICONS: Record<DocumentCategory, string> = {
  Financial: 'DollarSign',
  Legal: 'Scale',
  Governance: 'Users',
  Corporate: 'Building2',
  Compliance: 'CheckCircle',
}

/**
 * Utility Functions
 */

export function getStatusLabel(status: DocumentStatus): string {
  const labels: Record<DocumentStatus, string> = {
    not_started: 'Not Started',
    in_progress: 'In Progress',
    ready: 'Ready for Review',
    uploaded: 'Uploaded',
    verified: 'Verified',
  }
  return labels[status]
}

export function getExchangeLabel(exchangeId: ExchangeId): string {
  return EXCHANGES[exchangeId]?.name || exchangeId.toUpperCase()
}

export function getCategoryIcon(category: DocumentCategory): string {
  return CATEGORY_ICONS[category]
}

export function getStatusColor(status: DocumentStatus): string {
  return STATUS_COLORS[status]
}

export function isDocumentComplete(status: DocumentStatus): boolean {
  return status === 'verified' || status === 'uploaded'
}

export function calculateProgress(completed: number, total: number): number {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}
