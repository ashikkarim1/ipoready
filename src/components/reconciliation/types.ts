/**
 * Comprehensive type definitions for the Reconciliation Engine
 */

// Core data types
export interface MetricAlignment {
  metricId: string
  metric: string
  pace_value: string | number
  financial_value: string | number
  prospectus_value: string | number
  cap_table_value: string | number
  status: 'aligned' | 'needs_review' | 'critical'
  variance_percent: number
  isExplained: boolean
  explanation?: string
  lastUpdated?: Date
}

export interface ReconciliationIssue {
  id: string
  severity: 'critical' | 'warning' | 'info'
  metric: string
  source1: string
  source2: string
  value1: string | number
  value2: string | number
  variance: number
  impact: string
  suggestedFix: string
}

export interface AlertRule {
  metric: string
  max_variance_percent: number
  enabled: boolean
}

// Extended types for advanced features
export interface ReconciliationSession {
  id: string
  companyId: string
  createdAt: Date
  updatedAt: Date
  metrics: MetricAlignment[]
  issues: ReconciliationIssue[]
  rules: AlertRule[]
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  lastCheckedBy?: string
  notes?: string
}

export interface ReconciliationChangeLog {
  id: string
  sessionId: string
  timestamp: Date
  userId: string
  userName: string
  userRole: string
  action: 'updated' | 'explained' | 'resolved' | 'reopened'
  metric: string
  previousValue?: string | number
  newValue?: string | number
  explanation?: string
}

export interface ReconciliationReport {
  id: string
  sessionId: string
  generatedAt: Date
  generatedBy: string
  title: string
  summary: {
    totalMetrics: number
    alignedCount: number
    needsReviewCount: number
    criticalCount: number
    overallHealth: number
  }
  metrics: MetricAlignment[]
  issues: ReconciliationIssue[]
  recommendations: string[]
  exportFormats: ExportFormat[]
}

export type ExportFormat = 'pdf' | 'xlsx' | 'csv' | 'json'

export interface ReconciliationNotification {
  id: string
  sessionId: string
  type: 'critical_issue' | 'new_variance' | 'resolved_issue' | 'review_request'
  title: string
  message: string
  metric?: string
  severity: 'critical' | 'warning' | 'info'
  read: boolean
  createdAt: Date
  actionUrl?: string
}

export interface ReconciliationConfig {
  enableAutoRefresh: boolean
  autoRefreshInterval: number // milliseconds
  enableNotifications: boolean
  notificationChannels: ('email' | 'dashboard' | 'slack')[]
  strictMode: boolean // Treat warnings as critical
  customRules: AlertRule[]
  comparisonSources: string[] // Which sources to compare
}

// Calculated/derived types
export interface ReconciliationStats {
  aligned: number
  needsReview: number
  critical: number
  totalMetrics: number
  overallHealth: number // percentage
  trending: 'improving' | 'stable' | 'declining'
}

export interface MetricComparisonResult {
  metric: string
  pairwise: Array<{
    source1: string
    source2: string
    variance: number
    aligned: boolean
  }>
  allAligned: boolean
  recommendedValue?: string | number
}

export interface ImpactAssessment {
  metric: string
  variance: number
  category: 'revenue' | 'cost' | 'headcount' | 'runway' | 'growth' | 'other'
  estimatedFinancialImpact?: {
    amount: number
    currency: string
    direction: 'positive' | 'negative'
  }
  investorVisibility: 'high' | 'medium' | 'low'
  regulatoryImplications: string[]
  actionRequired: boolean
}

// API Response types
export interface ReconciliationCheckResponse {
  success: boolean
  session: ReconciliationSession
  metrics: MetricAlignment[]
  issues: ReconciliationIssue[]
  stats: ReconciliationStats
  checkedAt: Date
  nextCheckScheduled: Date
}

export interface ReconciliationExplainResponse {
  success: boolean
  metric: string
  explanation: string
  status: 'aligned' | 'needs_review' | 'critical'
  updatedAt: Date
}

export interface ReconciliationResolveResponse {
  success: boolean
  metric: string
  status: 'resolved' | 'pending'
  updatedAt: Date
  changeLog: ReconciliationChangeLog
}

export interface ReconciliationExportResponse {
  success: boolean
  url: string
  format: ExportFormat
  filename: string
  expiresAt: Date
}

// Hook return types
export interface UseReconciliationResult {
  metrics: MetricAlignment[]
  issues: ReconciliationIssue[]
  stats: ReconciliationStats
  isLoading: boolean
  error?: string
  refresh: () => Promise<void>
  explain: (metric: string, explanation: string) => Promise<void>
  resolve: (metric: string) => Promise<void>
  export: (format: ExportFormat) => Promise<string>
}

// Component prop types
export interface ReconciliationDashboardProps {
  metrics?: MetricAlignment[]
  issues?: ReconciliationIssue[]
  rules?: AlertRule[]
  onRefresh?: () => Promise<void> | void
  onExportPDF?: () => Promise<void> | void
  autoRefreshInterval?: number
  companyName?: string
  readonly?: boolean
}

export interface ReconciliationHeatmapProps {
  metrics: MetricAlignment[]
  onCellClick: (metric: string) => void
  highlightMetric?: string
}

export interface ReconciliationRadarProps {
  metrics: MetricAlignment[]
  compact?: boolean
}

export interface MismatchDetailViewProps {
  metric: MetricAlignment
  onClose: () => void
  onUpdate?: () => Promise<void> | void
  onExplain?: (explanation: string) => Promise<void>
}

export interface ReconciliationStatsProps {
  stats: ReconciliationStats
  compact?: boolean
}

export interface ReconciliationTrendViewProps {
  lastRefreshTime: Date
  historicalData?: Array<{
    date: string
    aligned: number
    needs_review: number
    critical: number
  }>
}

// Utility types
export type SeverityLevel = 'critical' | 'warning' | 'info'
export type MetricStatus = 'aligned' | 'needs_review' | 'critical'
export type DataSource = 'PACE' | 'Financials' | 'Prospectus' | 'Cap Table'

export interface VarianceRange {
  min: number
  max: number
  severity: MetricStatus
}

// Constants
export const DEFAULT_VARIANCE_RULES: Record<string, number> = {
  Revenue: 5,
  'Growth %': 2,
  Headcount: 0,
  'Burn Rate': 10,
  Runway: 5,
  'Unit Economics': 8,
  Margins: 3,
  'Customer Count': 2,
}

export const SEVERITY_LEVELS: VarianceRange[] = [
  { min: 0, max: 5, severity: 'aligned' },
  { min: 5, max: 10, severity: 'needs_review' },
  { min: 10, max: 100, severity: 'critical' },
]

export const DATA_SOURCES: DataSource[] = ['PACE', 'Financials', 'Prospectus', 'Cap Table']

export const METRICS_LIST: string[] = [
  'Revenue',
  'Growth%',
  'Margins',
  'Headcount',
  'Runway',
  'Burn Rate',
  'Unit Economics',
  'Customer Count',
]
