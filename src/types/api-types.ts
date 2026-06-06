/**
 * IPOReady API Type Definitions
 * TypeScript types for all API endpoints and responses
 */

// ============================================================================
// Common Types
// ============================================================================

export interface ApiError {
  error: string
  details?: string
}

export interface Pagination {
  total: number
  limit: number
  offset: number
  pages: number
}

export type DocumentCategory =
  | 'legal'
  | 'financial'
  | 'governance'
  | 'regulatory'
  | 'compliance'

export type DocumentStatus =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'rejected'

export type StorageProvider =
  | 'local'
  | 'google_drive'
  | 'dropbox'
  | 'onedrive'
  | 'box'
  | 's3'

export type IPOStatus = 'pending' | 'listed' | 'withdrawn' | 'delayed'

export type TaskStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked'

export type TaskPriority = 'critical' | 'high' | 'medium' | 'low'

// ============================================================================
// Capital Markets Types
// ============================================================================

export interface Company {
  id: string
  name: string
  ticker: string
  sector: string
  industry: string
  market_cap: number
  logo_url?: string
  cik?: string
}

export interface CompanyFinancials {
  company_id: string
  fiscal_year: number
  fiscal_quarter: number
  revenue: number
  net_income: number
  operating_cash_flow: number
  net_margin: number
  roe: number
  current_ratio: number
}

export interface IPOPerformance {
  first_day_return: number
  return_30d: number
  return_90d: number
  return_365d: number
  vs_market_30d: number
  vs_market_90d: number
}

export interface IPO {
  id: string
  company_id: string
  company_name: string
  ticker: string
  sector: string
  status: IPOStatus
  listing_date: string
  ipo_size?: number
  shares_offered?: number
  offer_price?: number
  first_day_return?: number
  return_30d?: number
  return_90d?: number
  return_365d?: number
  return_vs_sp500_30d?: number
  return_vs_sp500_90d?: number
  performance: IPOPerformance
}

export interface CompaniesResponse {
  companies: Company[]
  pagination: Pagination
}

export interface IPOsResponse {
  ipos: IPO[]
  count: number
  filters: {
    status?: string
    sector?: string
    days?: number
  }
}

export interface Benchmark {
  percentile_vs_peers: number
  percentile_vs_sector: number
}

export interface Valuation {
  pe_ratio: number
  ev_revenue: number
  ev_ebitda: number
}

export interface CapitalMarketsDashboard {
  company: {
    id: string
    name: string
    ticker: string
    sector: string
    industry: string
    market_cap: number
  }
  financials: {
    latest: CompanyFinancials | null
    revenueGrowth: number | null
  }
  ipo: {
    listing_date: string
    first_day_return: number
    return_365d: number
  } | null
  benchmarks: Benchmark | null
  valuation: Valuation | null
}

// ============================================================================
// Document Types
// ============================================================================

export interface Document {
  id: string
  company_id: string
  name: string
  display_name: string
  description?: string
  category: DocumentCategory
  status: DocumentStatus
  mime_type: string
  file_size: number
  storage_provider: StorageProvider
  storage_id: string
  current_version: number
  total_versions: number
  uploaded_by: string
  uploaded_at: string
  last_modified_by: string
  last_modified_at: string
  completeness: number
  comment_count: number
  created_at: string
  updated_at: string
}

export interface DocumentListResponse {
  documents: Document[]
  count: number
}

export interface UploadedFile {
  id: string
  name: string
  size: number
  uploadedAt: string
  status: string
  publicPath: string
}

export interface DocumentUploadResponse {
  success: boolean
  documentId: string
  files: UploadedFile[]
}

export interface DocumentDeleteResponse {
  success: boolean
  message: string
}

// ============================================================================
// Admin Types
// ============================================================================

export interface SecIngestionStatistics {
  total: number
  successful: number
  failed: number
  duration_ms: number
  avg_per_company_ms: number
}

export interface SecIngestionResponse {
  message: string
  statistics: SecIngestionStatistics
  errors: string[]
}

export interface CompanysCoverage {
  total: number
  with_10k: number
  with_10q: number
}

export interface SyncLog {
  source: string
  status: string
  created_at: string
}

export interface SecStatusResponse {
  status: string
  companies_coverage: CompanysCoverage
  recent_syncs: SyncLog[]
}

export interface DeploymentStep {
  step: string
  status: 'success' | 'failed' | 'skipped'
  message: string
  recordsAffected?: number
}

export interface DeploymentSummary {
  totalDocumentsMigrated: number
  duplicatesFound: number
  duplicatesResolved: number
  systemReady: boolean
}

export interface DeploymentResult {
  success: boolean
  steps: DeploymentStep[]
  summary: DeploymentSummary
  timestamp: string
}

// ============================================================================
// Dashboard Types
// ============================================================================

export interface TaskSummary {
  total: number
  completed: number
  inProgress: number
  blocked: number
  notStarted: number
}

export interface PhaseData {
  phase: string
  total: number
  completed: number
  percentage: number
}

export interface UpcomingTask {
  id: string
  phase: string
  category: string
  title: string
  priority: TaskPriority
  estimatedDays: number
}

export interface RecentActivityItem {
  id: string
  title: string
  phase: string
  completedAt: string
}

export interface CompanyDashboardInfo {
  id: string
  name: string
  listingType: string
  targetExchange: string
  currentPhase: string
  paceScore: number
  estimatedDaysToIpo: number
  progressPercentage: number
  currency: string
  language: string
  createdAt: string
  trial_status?: string
  trial_end_date?: string
}

export interface DashboardResponse {
  company: CompanyDashboardInfo
  tasksSummary: TaskSummary
  phaseData: PhaseData[]
  upcomingTasks: UpcomingTask[]
  recentActivity: RecentActivityItem[]
}

// ============================================================================
// Request Query Types
// ============================================================================

export interface CompaniesQueryParams {
  sector?: string
  q?: string
  limit?: number
  offset?: number
}

export interface IPOsQueryParams {
  status?: IPOStatus
  sector?: string
  days?: number
}

export interface CapitalMarketsDashboardQueryParams {
  companyId: string
}

export interface DocumentsListQueryParams {
  companyId: string
  category?: DocumentCategory
}

export interface SecIngestQueryParams {
  companyIds?: string
  limit?: number
}

// ============================================================================
// Request Body Types
// ============================================================================

export interface DocumentDeleteRequest {
  documentId: string
  fileId: string
}

// ============================================================================
// API Client Configuration
// ============================================================================

export interface ApiClientConfig {
  baseURL?: string
  token?: string
  timeout?: number
  headers?: Record<string, string>
}

export interface ApiResponse<T> {
  data: T
  status: number
  headers: Record<string, string>
}

export interface ApiErrorResponse extends ApiError {
  status: number
}

// ============================================================================
// Utility Types
// ============================================================================

export type ApiEndpoint =
  | '/api/capital-markets/companies'
  | '/api/capital-markets/ipos'
  | '/api/capital-markets/dashboard'
  | '/api/documents/list'
  | '/api/documents/upload'
  | '/api/documents/delete'
  | '/api/admin/ingest-sec-filings'
  | '/api/admin/deploy-documents'
  | '/api/dashboard'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface ApiRequestOptions {
  method?: HttpMethod
  headers?: Record<string, string>
  body?: any
  params?: Record<string, any>
  timeout?: number
}
