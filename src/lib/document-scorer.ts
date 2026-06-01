/**
 * Document Completeness & Quality Scoring
 * 
 * Extends PACE scoring to include document maturity metrics.
 * Documents are scored on both completion % and quality indicators.
 * Phase score = (task_completion × 60%) + (document_completeness × 40%)
 */

export type DocumentStatus = 'not_started' | 'in_progress' | 'draft' | 'reviewed' | 'final' | 'approved'

export interface DocumentMetadata {
  wordCount: number
  pageCount: number
  signatureCount: number // For executed documents
  lastReviewDate?: Date
  reviewerName?: string
  versionNumber: number
  isExecuted: boolean
  hasDraft: boolean
}

export interface DocumentScorecard {
  id: string
  companyId: string
  documentName: string
  phase: number // IPO phase 1-8
  completionPercent: number // 0-100
  status: DocumentStatus
  metadata: DocumentMetadata
  maturityScore: number // 0-100 based on quality indicators
  refreshNeeded: boolean // True if > 30 days old
  createdAt: Date
  lastUpdated: Date
}

export interface DocumentRefreshIndicator {
  documentName: string
  daysOldSinceReview: number
  recommendedRefreshDate: Date
  refreshPriority: 'high' | 'medium' | 'low'
}

/**
 * Status progression weights
 * Earlier statuses = lower quality, later statuses = higher quality
 */
const STATUS_WEIGHTS: Record<DocumentStatus, number> = {
  not_started: 0,
  in_progress: 25,
  draft: 50,
  reviewed: 75,
  final: 90,
  approved: 100,
}

/**
 * Calculate maturity score based on document quality indicators
 * 
 * Combines:
 * - Status progression (40% weight)
 * - Document substance (word count, pages) (30% weight)
 * - Evidence of review/execution (30% weight)
 */
export function calculateDocumentMaturityScore(metadata: DocumentMetadata, status: DocumentStatus): number {
  // Status component (0-40 points)
  const statusScore = (STATUS_WEIGHTS[status] / 100) * 40

  // Document substance component (0-30 points)
  // Expected minimums: 5,000+ words = 100%, 1,000-5,000 = 50%, < 1,000 = 25%
  let substanceScore = 0
  if (metadata.wordCount >= 5000) {
    substanceScore = 30
  } else if (metadata.wordCount >= 1000) {
    substanceScore = (metadata.wordCount / 5000) * 30
  } else if (metadata.wordCount > 0) {
    substanceScore = (metadata.wordCount / 1000) * 15
  }

  // Review & execution component (0-30 points)
  let reviewScore = 0
  if (metadata.lastReviewDate) {
    reviewScore += 15 // Has been reviewed
  }
  if (metadata.isExecuted) {
    reviewScore += 15 // Has been executed/signed
  }
  if (metadata.signatureCount > 0) {
    reviewScore = Math.min(30, reviewScore + 5) // Additional points for signatures
  }

  return Math.round(statusScore + substanceScore + reviewScore)
}

/**
 * Determine if a document needs refresh
 * Documents older than 30 days should be reviewed
 * Executed documents stay current longer (90 days)
 */
export function isDocumentRefreshNeeded(
  lastReviewDate: Date | undefined,
  isExecuted: boolean
): { needsRefresh: boolean; daysOld: number } {
  if (!lastReviewDate) {
    return { needsRefresh: true, daysOld: Infinity }
  }

  const daysOld = Math.floor((new Date().getTime() - lastReviewDate.getTime()) / (1000 * 60 * 60 * 24))
  const threshold = isExecuted ? 90 : 30

  return {
    needsRefresh: daysOld > threshold,
    daysOld,
  }
}

/**
 * Calculate phase score combining task completion and document quality
 * 
 * Phase Score = (Task Completion % × 60%) + (Document Maturity Score × 40%)
 * 
 * This makes document quality a critical driver of phase progress,
 * not just task checkboxes.
 */
export function calculatePhaseScore(
  taskCompletionPercent: number,
  documentScores: number[]
): number {
  const avgDocumentScore = documentScores.length > 0 
    ? documentScores.reduce((a, b) => a + b, 0) / documentScores.length 
    : 50 // Default if no documents scored yet

  const phaseScore = (taskCompletionPercent * 0.6) + (avgDocumentScore * 0.4)
  return Math.round(phaseScore)
}

/**
 * Generate refresh indicators for all documents in a phase
 */
export function getRefreshIndicators(
  documents: DocumentScorecard[]
): DocumentRefreshIndicator[] {
  const indicators: DocumentRefreshIndicator[] = []

  for (const doc of documents) {
    const { needsRefresh, daysOld } = isDocumentRefreshNeeded(
      doc.metadata.lastReviewDate,
      doc.metadata.isExecuted
    )

    if (needsRefresh || daysOld > 30) {
      let priority: 'high' | 'medium' | 'low' = 'low'
      if (daysOld > 90) priority = 'high'
      else if (daysOld > 60) priority = 'medium'

      indicators.push({
        documentName: doc.documentName,
        daysOldSinceReview: daysOld === Infinity ? 0 : daysOld,
        recommendedRefreshDate: new Date(
          doc.metadata.lastReviewDate!.getTime() + (doc.metadata.isExecuted ? 90 : 30) * 24 * 60 * 60 * 1000
        ),
        refreshPriority: priority,
      })
    }
  }

  return indicators.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return priorityOrder[a.refreshPriority] - priorityOrder[b.refreshPriority]
  })
}

/**
 * IPO Phase Documents - Define what documents are required per phase
 * and their typical content expectations
 */
export const PHASE_REQUIRED_DOCUMENTS: Record<number, string[]> = {
  1: [
    'Organizational Chart',
    'Articles of Incorporation / Bylaws',
    'Shareholder Registry',
    'Cap Table (Spreadsheet)',
  ],
  2: [
    'Cap Table (Legal Format)',
    'Shareholder Agreements',
    'Option Pool Documentation',
    'Minute Books',
  ],
  3: [
    'Business Plan (5-Year)',
    'Market Analysis Report',
    'Financial Projections',
    'Competitive Landscape Study',
  ],
  4: [
    'Historical Financial Statements (3 Years)',
    'Auditor Engagement Letter',
    'Internal Controls Assessment',
    'Accounting Policies Documentation',
  ],
  5: [
    'Legal Opinions (Articles, IP, Litigation)',
    'Articles Amendment Documentation',
    'Regulatory Compliance Report',
    'Disclosure of Material Contracts',
  ],
  6: [
    'Draft Prospectus / Form S-1',
    'Risk Factor Analysis',
    'Use of Proceeds Statement',
    'Executive Compensation Schedule',
  ],
  7: [
    'Final Prospectus / Form S-1',
    'Underwriter Agreements',
    'Lock-up Agreements',
    'Officer & Director Certificates',
  ],
  8: [
    'Post-IPO Governance Documents',
    'Investor Relations Presentation',
    'Quarterly Earnings Announcement Template',
    'Corporate Governance Charter',
  ],
}

/**
 * Document quality assessment based on IPO phase expectations
 * Returns a quality band: "minimal", "adequate", "comprehensive"
 */
export function assessDocumentQualityBand(
  documentScores: number[]
): 'minimal' | 'adequate' | 'comprehensive' {
  if (documentScores.length === 0) return 'minimal'

  const avgScore = documentScores.reduce((a, b) => a + b, 0) / documentScores.length

  if (avgScore >= 80) return 'comprehensive'
  if (avgScore >= 60) return 'adequate'
  return 'minimal'
}

/**
 * Estimate days to IPO readiness based on document completion
 * More stringent than task completion alone
 */
export function estimateDaysToIPOReadiness(phaseScores: number[]): number {
  // Calculate average phase score across all 8 phases
  const averagePhaseScore = phaseScores.length > 0
    ? phaseScores.reduce((a, b) => a + b, 0) / phaseScores.length
    : 0

  // Base estimate: 240 days (8 months) for full readiness
  // Adjust based on current progress
  const progressFraction = Math.max(0, Math.min(1, averagePhaseScore / 100))

  // Logarithmic scaling: early progress is slow, later phases accelerate
  const daysRemaining = 240 * Math.log(1 + (1 - progressFraction) * 7)

  return Math.round(daysRemaining)
}

/**
 * Generate a document readiness summary for dashboard display
 */
export interface DocumentReadinessSummary {
  totalDocuments: number
  documentsStarted: number
  documentsFinal: number
  averageMaturityScore: number
  qualityBand: 'minimal' | 'adequate' | 'comprehensive'
  docsNeedingRefresh: number
  estimatedDaysToCompletion: number
}

export function getDocumentReadinessSummary(
  documents: DocumentScorecard[],
  phaseScores: number[]
): DocumentReadinessSummary {
  const maturityScores = documents.map((d) => d.maturityScore)
  const avgMaturity = maturityScores.length > 0
    ? maturityScores.reduce((a, b) => a + b, 0) / maturityScores.length
    : 0

  const refreshNeeded = documents.filter((d) => d.refreshNeeded).length

  return {
    totalDocuments: documents.length,
    documentsStarted: documents.filter((d) => d.completionPercent > 0).length,
    documentsFinal: documents.filter((d) => d.status === 'final' || d.status === 'approved').length,
    averageMaturityScore: Math.round(avgMaturity),
    qualityBand: assessDocumentQualityBand(maturityScores),
    docsNeedingRefresh: refreshNeeded,
    estimatedDaysToCompletion: estimateDaysToIPOReadiness(phaseScores),
  }
}
