/**
 * Feedback System Type Definitions
 * Complete type safety for feedback collection, management, and analytics
 */

// ============================================================
// FEEDBACK CATEGORIES
// ============================================================

export const FEEDBACK_CATEGORIES = [
  'Feature Request',
  'Bug Report',
  'UX/UI Feedback',
  'Performance',
  'Documentation',
  'Other',
] as const

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number]

// ============================================================
// FEEDBACK STATUS
// ============================================================

export const FEEDBACK_STATUSES = [
  'new',
  'acknowledged',
  'in_progress',
  'resolved',
  'wontfix',
] as const

export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number]

// ============================================================
// SENTIMENT TYPES
// ============================================================

export const SENTIMENT_TYPES = [
  'positive',
  'neutral',
  'negative',
  'frustrated',
] as const

export type SentimentType = (typeof SENTIMENT_TYPES)[number]

// ============================================================
// PRIORITY LEVELS
// ============================================================

export const PRIORITY_LEVELS = [
  'low',
  'medium',
  'high',
  'critical',
] as const

export type PriorityLevel = (typeof PRIORITY_LEVELS)[number]

// ============================================================
// MAIN FEEDBACK TYPES
// ============================================================

export interface FeedbackSubmissionRequest {
  page: string                                  // e.g., '/dashboard', '/pace'
  task?: string                                 // Optional: specific task reference
  category?: FeedbackCategory                   // Feedback category
  rating: number                                // 1-5 scale
  subject?: string                              // Short subject/title
  feedbackText: string                          // Main feedback content
  confusionPoints?: string[]                    // What was confusing
}

export interface FeedbackSubmissionResponse {
  success: boolean
  message: string
  feedbackId: string
}

export interface FeedbackItem {
  id: string
  company_id: string
  user_id: string
  category_id?: string
  page: string
  task?: string
  subject?: string
  feedback_text: string
  rating: number
  confusion_points?: string[]
  sentiment: SentimentType
  status: FeedbackStatus
  priority?: PriorityLevel
  assigned_to?: string
  internal_notes?: string
  ip_address?: string
  user_agent?: string
  created_at: string
  updated_at: string
  resolved_at?: string
  // Enriched fields
  user_email?: string
  user_name?: string
  category_name?: string
  assigned_to_email?: string
}

export interface FeedbackUpdateRequest {
  status?: FeedbackStatus
  priority?: PriorityLevel
  assignedTo?: string | null
  internalNotes?: string | null
}

// ============================================================
// ANALYTICS TYPES
// ============================================================

export interface SentimentBreakdown {
  positive: number
  neutral: number
  negative: number
  frustrated: number
}

export interface FeedbackStats {
  totalFeedback: number
  averageRating: number
  sentimentBreakdown: SentimentBreakdown
  topConfusionPoints: Record<string, number>
}

export interface FeedbackPagination {
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

export interface FeedbackListResponse {
  success: boolean
  data: FeedbackItem[]
  stats: FeedbackStats
  pagination: FeedbackPagination
}

export interface FeedbackAnalytics {
  id: string
  company_id: string
  metric_date: string
  total_feedback: number
  new_feedback: number
  resolved_feedback: number
  avg_rating: number
  positive_count: number
  neutral_count: number
  negative_count: number
  frustrated_count: number
  top_pages: Record<string, number>
  created_at: string
  updated_at: string
}

// ============================================================
// FEEDBACK CATEGORY TYPES
// ============================================================

export interface FeedbackCategoryItem {
  id: string
  name: FeedbackCategory
  description?: string
  color?: string
  sort_order: number
  created_at: string
}

// ============================================================
// ACCESS CONTROL TYPES
// ============================================================

export interface FeedbackAccessRule {
  id: string
  role_name: string
  can_view_all: boolean
  can_edit_status: boolean
  can_assign: boolean
  can_delete: boolean
}

export type FeedbackAccessLevel = 'view_own' | 'view_company' | 'view_all' | 'none'

// ============================================================
// FILTER TYPES
// ============================================================

export interface FeedbackFilters {
  companyId?: string
  page?: string
  category?: FeedbackCategory
  rating?: number
  sentiment?: SentimentType
  status?: FeedbackStatus
  priority?: PriorityLevel
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
}

export interface FeedbackDashboardFilters extends FeedbackFilters {
  search?: string
  assignedTo?: string
  createdBy?: string
}

// ============================================================
// ERROR TYPES
// ============================================================

export interface FeedbackErrorResponse {
  error: string
  details?: string
}

export interface FeedbackValidationError {
  field: string
  message: string
}

// ============================================================
// SENTIMENT ANALYSIS CONTEXT
// ============================================================

export interface SentimentAnalysisContext {
  rating: number
  feedbackText: string
  confusionPoints?: string[]
}

// ============================================================
// ANALYTICS REPORTING
// ============================================================

export interface FeedbackTrendData {
  date: string
  totalCount: number
  averageRating: number
  positivePercent: number
  negativePercent: number
}

export interface FeedbackCategoryMetrics {
  category: FeedbackCategory
  count: number
  averageRating: number
  sentimentDistribution: SentimentBreakdown
}

export interface FeedbackPageMetrics {
  page: string
  count: number
  averageRating: number
  topConfusionPoints: string[]
}

// ============================================================
// EXPORT/IMPORT TYPES
// ============================================================

export interface FeedbackExportData {
  timestamp: string
  version: string
  totalRecords: number
  records: FeedbackItem[]
  analytics: FeedbackAnalytics[]
}

// ============================================================
// UTILITY TYPES
// ============================================================

export type FeedbackAction =
  | 'submit'
  | 'view'
  | 'update'
  | 'delete'
  | 'assign'
  | 'resolve'

export interface FeedbackAuditLog {
  id: string
  feedback_id: string
  user_id: string
  action: FeedbackAction
  changes?: Record<string, unknown>
  created_at: string
}

// ============================================================
// VALIDATION HELPER FUNCTIONS
// ============================================================

export function isValidFeedbackCategory(value: unknown): value is FeedbackCategory {
  return typeof value === 'string' && FEEDBACK_CATEGORIES.includes(value as FeedbackCategory)
}

export function isValidFeedbackStatus(value: unknown): value is FeedbackStatus {
  return typeof value === 'string' && FEEDBACK_STATUSES.includes(value as FeedbackStatus)
}

export function isValidSentiment(value: unknown): value is SentimentType {
  return typeof value === 'string' && SENTIMENT_TYPES.includes(value as SentimentType)
}

export function isValidRating(value: unknown): value is number {
  return typeof value === 'number' && value >= 1 && value <= 5
}

export function isValidPriority(value: unknown): value is PriorityLevel {
  return typeof value === 'string' && PRIORITY_LEVELS.includes(value as PriorityLevel)
}
