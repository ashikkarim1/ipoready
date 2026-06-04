/**
 * Resume Management Types and Interfaces
 */

// ============================================================
// Extracted Resume Data Types
// ============================================================

export interface EducationEntry {
  school: string
  degree: string
  fieldOfStudy: string
  startDate?: string
  endDate?: string
  description?: string
}

export interface ExperienceEntry {
  title: string
  company: string
  location?: string
  startDate?: string
  endDate?: string
  description?: string
  isCurrentRole?: boolean
}

export interface CertificationEntry {
  name: string
  issuer: string
  issuedDate?: string
  expirationDate?: string
  credentialId?: string
}

export interface BoardPositionEntry {
  organization: string
  position: string
  startDate?: string
  endDate?: string
  description?: string
}

export interface ExtractedResumeData {
  education: EducationEntry[]
  experience: ExperienceEntry[]
  certifications: CertificationEntry[]
  boardPositions: BoardPositionEntry[]
  rawText: string
}

// ============================================================
// Database Record Types
// ============================================================

export interface DirectorResumeRecord {
  id: string
  professional_id: string
  file_path: string | null
  file_url: string | null
  file_name: string
  file_size: number
  file_mime_type: string | null
  file_hash: string | null
  version: number
  is_current: boolean
  uploaded_at: Date
  uploaded_by_user_id: string | null
  verified_at: Date | null
  verified_by_user_id: string | null
  verification_status: 'pending' | 'verified' | 'rejected' | 'needs_review'
  verification_notes: string | null
  is_readable: boolean | null
  text_extract: string | null
  page_count: number | null
  created_at: Date
  updated_at: Date
}

// ============================================================
// API Request/Response Types
// ============================================================

export interface UploadResumeResponse {
  success: boolean
  resumeId: string
  fileUrl: string
  fileName: string
  fileSize: number
  version: number
  uploadedAt: string
  extraction: {
    success: boolean
    textLength: number
    pageCount: number | null
    data: ExtractedResumeData | null
  }
}

export interface GetResumeResponse {
  // Returns raw file data with appropriate headers
  contentType: string
  contentDisposition: string
  data: Blob
}

export interface DeleteResumeResponse {
  success: boolean
  message: string
  resumeId: string
}

export interface ExtractResumeTextRequest {
  resumeId: string
  useAI?: boolean
}

export interface ExtractResumeTextResponse {
  success: boolean
  extractedData: ExtractedResumeData
  validation: {
    isValid: boolean
    confidence: number
    issues: string[]
  }
  textLength: number
  extractionMethod: 'pattern-matching' | 'claude-ai'
}

export interface FileValidationResult {
  valid: boolean
  error?: string
}

export interface ResumeValidationResult {
  isValid: boolean
  confidence: number
  issues: string[]
}

// ============================================================
// Filter and Query Types
// ============================================================

export interface ResumesQueryParams {
  directorId: string
  current?: boolean
  version?: number
  resumeId?: string
}

export interface ResumesListParams {
  directorId: string
  limit?: number
  offset?: number
  orderBy?: 'uploaded_at' | 'version'
  orderDirection?: 'asc' | 'desc'
}

// ============================================================
// Extraction Configuration
// ============================================================

export interface ExtractionConfig {
  enableAI: boolean
  enableOCR: boolean
  validateStructure: boolean
  confidenceThreshold: number
}

export const DEFAULT_EXTRACTION_CONFIG: ExtractionConfig = {
  enableAI: false,
  enableOCR: false,
  validateStructure: true,
  confidenceThreshold: 0.6,
}

// ============================================================
// File Configuration
// ============================================================

export const RESUME_FILE_CONFIG = {
  MAX_SIZE_MB: 10,
  MAX_SIZE_BYTES: 10 * 1024 * 1024,
  ALLOWED_EXTENSIONS: ['.pdf', '.doc', '.docx'],
  ALLOWED_MIME_TYPES: {
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
      '.docx',
    ],
  },
  STORAGE_DIR: 'public/resumes',
  NAMING_PATTERN: '[directorId]-[timestamp].[ext]',
}

// ============================================================
// Verification Status Types
// ============================================================

export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'needs_review'

export const VERIFICATION_STATUS_LABELS: Record<VerificationStatus, string> = {
  pending: 'Pending Review',
  verified: 'Verified',
  rejected: 'Rejected',
  needs_review: 'Needs Review',
}

export const VERIFICATION_STATUS_COLORS: Record<VerificationStatus, string> = {
  pending: 'yellow',
  verified: 'green',
  rejected: 'red',
  needs_review: 'orange',
}

// ============================================================
// Extraction Method Types
// ============================================================

export type ExtractionMethod = 'pattern-matching' | 'claude-ai' | 'ocr'

export const EXTRACTION_METHOD_LABELS: Record<ExtractionMethod, string> = {
  'pattern-matching': 'Pattern Matching',
  'claude-ai': 'Claude AI',
  ocr: 'Optical Character Recognition',
}

// ============================================================
// Bulk Operations
// ============================================================

export interface BulkExtractionRequest {
  directorIds: string[]
  useAI?: boolean
  overwrite?: boolean
}

export interface BulkExtractionResponse {
  success: boolean
  processed: number
  failed: number
  results: Array<{
    directorId: string
    success: boolean
    resumeId?: string
    error?: string
  }>
}

// ============================================================
// Analytics and Metrics
// ============================================================

export interface ResumeExtractionMetrics {
  totalUploads: number
  successfulExtractions: number
  failedExtractions: number
  averageConfidence: number
  commonIssues: Array<{
    issue: string
    count: number
  }>
}

export interface DirectorResumeSummary {
  directorId: string
  currentResumeId: string | null
  currentResumeVersion: number
  totalVersions: number
  lastUpdated: Date
  verificationStatus: VerificationStatus
  extractionStatus: {
    success: boolean
    confidence: number
    extractedAt: Date | null
  }
}
