/**
 * Document Completeness Scoring & Phase Scoring
 * 
 * Tracks document quality and completeness by phase.
 * Incorporates into overall PACE score calculation with:
 * - Task completion (60% weight)
 * - Document completeness (40% weight)
 * - Staleness penalty (5% reduction if > 30 days old)
 * - Status quality progression
 */

'use strict'

import { sql } from '@/lib/db'

/**
 * Document score interface tracking completion, status, and freshness
 */
export interface DocumentScore {
  documentName: string
  completionPct: number
  status: 'not_started' | 'in_progress' | 'draft' | 'reviewed' | 'final'
  lastUpdated: Date
  daysOld: number
  freshness: 'fresh' | 'stale' | 'very_stale'
  metadata?: {
    wordCount?: number
    pageCount?: number
    signatureCount?: number
  }
}

/**
 * Phase score interface combining task and document completeness
 */
export interface PhaseScore {
  phaseId: number
  taskCompletionScore: number
  documentCompletenessScore: number
  combinedPhaseScore: number
}

/**
 * Document library grouped by phase with health metrics
 */
export interface DocumentLibrary {
  byPhase: Map<number, DocumentScore[]>
  overallDocumentHealth: number
  staleDocuments: DocumentScore[]
  completionByStatus: Record<string, number>
}

/**
 * Phase names for reference
 */
const PHASE_NAMES: Record<number, string> = {
  1: 'Pre-Planning',
  2: 'Corporate Restructuring',
  3: 'Financial Audit',
  4: 'Legal Documentation',
  5: 'Regulatory Filing',
  6: 'Marketing & Roadshow',
  7: 'Listing Application',
  8: 'Post-Listing',
}

/**
 * Required documents per phase
 */
const PHASE_DOCUMENTS: Record<number, Record<string, { minPages: number; aiRequired: boolean }>> = {
  1: {
    'Business Plan': { minPages: 20, aiRequired: false },
    'Market Analysis': { minPages: 15, aiRequired: false },
  },
  2: {
    'Cap Table': { minPages: 5, aiRequired: false },
    'Articles of Incorporation': { minPages: 10, aiRequired: false },
    'Shareholder Agreements': { minPages: 20, aiRequired: false },
    'Corporate Structure Diagram': { minPages: 1, aiRequired: false },
  },
  3: {
    '2-Year Audited Financials': { minPages: 30, aiRequired: false },
    'Accounting Policies': { minPages: 15, aiRequired: false },
    'Management Discussion & Analysis': { minPages: 20, aiRequired: false },
  },
  4: {
    'Articles & Bylaws': { minPages: 10, aiRequired: false },
    'Board Resolutions': { minPages: 5, aiRequired: false },
    'Legal Opinions': { minPages: 15, aiRequired: true },
    'Material Contracts': { minPages: 50, aiRequired: false },
    'Litigation History': { minPages: 5, aiRequired: false },
  },
  5: {
    'Prospectus/Registration Statement': { minPages: 100, aiRequired: true },
    'Risk Factors': { minPages: 20, aiRequired: true },
    'Regulatory Approvals': { minPages: 10, aiRequired: false },
    'Compliance Certifications': { minPages: 5, aiRequired: false },
  },
  6: {
    'Pitch Deck': { minPages: 20, aiRequired: false },
    'Investor Presentation': { minPages: 30, aiRequired: false },
    'Management Bios': { minPages: 10, aiRequired: false },
    'Company Overview': { minPages: 15, aiRequired: false },
  },
  7: {
    'Listing Application': { minPages: 50, aiRequired: true },
    'Exchange Approval Letter': { minPages: 5, aiRequired: false },
    'Trading Symbol Assignment': { minPages: 2, aiRequired: false },
    'IPO Certificate': { minPages: 1, aiRequired: false },
  },
  8: {
    'Post-IPO Disclosures': { minPages: 20, aiRequired: false },
    'Financial Reports': { minPages: 25, aiRequired: false },
    'Quarterly Filings': { minPages: 30, aiRequired: false },
  },
}

/**
 * Calculate freshness category based on days since update
 */
export function calculateFreshness(lastUpdatedDate: Date): 'fresh' | 'stale' | 'very_stale' {
  const now = new Date()
  const daysOld = Math.floor((now.getTime() - lastUpdatedDate.getTime()) / (1000 * 60 * 60 * 24))

  if (daysOld < 7) {
    return 'fresh'
  } else if (daysOld < 30) {
    return 'stale'
  } else {
    return 'very_stale'
  }
}

/**
 * Convert status to quality score (0-100)
 */
function getStatusScore(status: string): number {
  const statusScores: Record<string, number> = {
    not_started: 0,
    in_progress: 25,
    draft: 50,
    reviewed: 75,
    final: 100,
    approved: 100,
  }
  return statusScores[status] ?? 0
}

/**
 * Score phase completeness combining task and document completion
 * 
 * Algorithm:
 * 1. Fetch all tasks for phase and calculate completion %
 * 2. Fetch all documents for phase from document_scorecards
 * 3. For each document:
 *    - Start with completion_pct
 *    - Apply status quality adjustment
 *    - Apply staleness penalty (5% reduction if > 30 days)
 * 4. Average document adjustments
 * 5. Return combined: (taskCompletion * 0.60) + (documentAvg * 0.40)
 */
export async function scorePhaseCompleteness(companyId: string, phaseId: number): Promise<PhaseScore> {
  // Fetch all tasks for this phase
  const tasksResult = await sql`
    SELECT
      COUNT(*) as total_tasks,
      COUNT(*) FILTER (WHERE status = 'completed') as completed_tasks
    FROM tasks
    WHERE company_id = ${companyId} AND phase_id = ${phaseId}
  `

  let taskCompletionScore = 0
  if (tasksResult && tasksResult.length > 0) {
    const row = tasksResult[0] as any
    const totalTasks = row.total_tasks ?? 0
    const completedTasks = row.completed_tasks ?? 0
    taskCompletionScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  }

  // Fetch all documents for this phase
  const docsResult = await sql`
    SELECT
      document_name,
      completion_pct,
      status,
      last_updated
    FROM document_scorecards
    WHERE company_id = ${companyId} AND phase_id = ${phaseId}
    ORDER BY document_name
  `

  let documentCompletenessScore = 100 // Default to 100 if no documents

  if (docsResult && docsResult.length > 0) {
    const documentScores: number[] = []

    for (const doc of docsResult as any[]) {
      const baseCompletion = doc.completion_pct ?? 0
      const statusScore = getStatusScore(doc.status)

      // Blend completion_pct with status quality
      const qualityAdjustedScore = Math.round(baseCompletion * 0.6 + statusScore * 0.4)

      // Apply staleness penalty
      const lastUpdated = new Date(doc.last_updated)
      const freshness = calculateFreshness(lastUpdated)
      let finalScore = qualityAdjustedScore

      if (freshness === 'very_stale') {
        // 5% reduction for very stale documents (> 30 days)
        finalScore = Math.round(finalScore * 0.95)
      }

      documentScores.push(finalScore)
    }

    // Average all document scores
    documentCompletenessScore = Math.round(
      documentScores.reduce((sum, score) => sum + score, 0) / documentScores.length
    )
  }

  // Combined score: 60% tasks, 40% documents
  const combinedPhaseScore = Math.round(taskCompletionScore * 0.6 + documentCompletenessScore * 0.4)

  return {
    phaseId,
    taskCompletionScore,
    documentCompletenessScore,
    combinedPhaseScore,
  }
}

/**
 * Update document status and completion percentage
 * Recalculates phase score and triggers PACE recalculation if significant change
 */
export async function updateDocumentStatus(
  companyId: string,
  documentName: string,
  completionPct: number,
  status: 'not_started' | 'in_progress' | 'draft' | 'reviewed' | 'final',
  reviewerNotes?: string
): Promise<void> {
  if (completionPct < 0 || completionPct > 100) {
    throw new Error('Completion percentage must be between 0 and 100')
  }

  // Get current document state for comparison
  const currentResult = await sql`
    SELECT phase_id, completion_pct, status
    FROM document_scorecards
    WHERE company_id = ${companyId} AND document_name = ${documentName}
  `

  if (!currentResult || currentResult.length === 0) {
    throw new Error(`Document not found: ${documentName}`)
  }

  const current = currentResult[0] as any
  const phaseId = current.phase_id

  // Update document
  await sql`
    UPDATE document_scorecards
    SET
      completion_pct = ${completionPct},
      status = ${status},
      last_updated = NOW(),
      reviewer_notes = ${reviewerNotes ?? null}
    WHERE company_id = ${companyId} AND document_name = ${documentName}
  `

  // Check if change is significant (status or completion changed by >20%)
  const completionDelta = Math.abs(completionPct - (current.completion_pct ?? 0))
  const statusChanged = current.status !== status
  const isSignificant = statusChanged || completionDelta > 20

  // Recalculate phase score
  if (isSignificant) {
    const phaseScore = await scorePhaseCompleteness(companyId, phaseId)

    // Update phase score if exists
    await sql`
      UPDATE phase_scorecards
      SET
        document_completeness_score = ${phaseScore.documentCompletenessScore},
        combined_phase_score = ${phaseScore.combinedPhaseScore},
        updated_at = NOW()
      WHERE company_id = ${companyId} AND phase_id = ${phaseId}
    `
  }
}

/**
 * Get complete document library organized by phase
 * Returns documents grouped by phase with health metrics and stale document list
 */
export async function getDocumentLibrary(companyId: string): Promise<DocumentLibrary> {
  const docsResult = await sql`
    SELECT
      document_name,
      phase_id,
      completion_pct,
      status,
      last_updated,
      word_count,
      page_count,
      signature_count
    FROM document_scorecards
    WHERE company_id = ${companyId}
    ORDER BY phase_id, document_name
  `

  const byPhase = new Map<number, DocumentScore[]>()
  const staleDocuments: DocumentScore[] = []
  const completionByStatus: Record<string, number> = {
    not_started: 0,
    in_progress: 0,
    draft: 0,
    reviewed: 0,
    final: 0,
  }

  const allScores: number[] = []

  if (docsResult && docsResult.length > 0) {
    for (const doc of docsResult as any[]) {
      const lastUpdated = new Date(doc.last_updated)
      const daysOld = Math.floor((new Date().getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24))
      const freshness = calculateFreshness(lastUpdated)

      const docScore: DocumentScore = {
        documentName: doc.document_name,
        completionPct: doc.completion_pct ?? 0,
        status: doc.status,
        lastUpdated,
        daysOld,
        freshness,
        metadata: {
          wordCount: doc.word_count,
          pageCount: doc.page_count,
          signatureCount: doc.signature_count,
        },
      }

      // Add to phase map
      if (!byPhase.has(doc.phase_id)) {
        byPhase.set(doc.phase_id, [])
      }
      byPhase.get(doc.phase_id)!.push(docScore)

      // Track stale documents
      if (freshness === 'very_stale') {
        staleDocuments.push(docScore)
      }

      // Track completion by status
      if (completionByStatus[doc.status] !== undefined) {
        completionByStatus[doc.status]++
      }

      // Accumulate score for overall health
      allScores.push(doc.completion_pct ?? 0)
    }
  }

  // Calculate overall document health
  const overallDocumentHealth = allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0

  return {
    byPhase,
    overallDocumentHealth,
    staleDocuments,
    completionByStatus,
  }
}

/**
 * Initialize document scorecards for a new company
 * Creates entries for all required documents across all phases
 */
export async function initializeDocumentScorecardsForCompany(companyId: string): Promise<void> {
  const documents: Array<{ documentName: string; phaseId: number }> = []

  for (const [phaseIdStr, docs] of Object.entries(PHASE_DOCUMENTS)) {
    const phaseId = parseInt(phaseIdStr, 10)
    for (const documentName of Object.keys(docs)) {
      documents.push({
        documentName,
        phaseId,
      })
    }
  }

  for (const doc of documents) {
    try {
      await sql`
        INSERT INTO document_scorecards (
          company_id,
          document_name,
          phase_id,
          completion_pct,
          status,
          last_updated
        )
        VALUES (${companyId}, ${doc.documentName}, ${doc.phaseId}, 0, 'not_started', NOW())
        ON CONFLICT (company_id, document_name) DO NOTHING
      `
    } catch (error) {
      console.error(`Error initializing document scorecard for ${doc.documentName}:`, error)
      throw error
    }
  }
}

/**
 * Get document requirements and current status for a phase
 */
export async function getPhaseDocumentRequirements(
  phaseId: number,
  companyId?: string
): Promise<
  Array<{
    name: string
    minPages: number
    aiRequired: boolean
    current?: {
      completionPct: number
      status: string
      pageCount: number | null
    }
  }>
> {
  const requirements = PHASE_DOCUMENTS[phaseId] ?? {}
  const requiredDocs = Object.entries(requirements).map(([name, info]) => ({
    name,
    minPages: info.minPages,
    aiRequired: info.aiRequired,
  }))

  if (!companyId) {
    return requiredDocs
  }

  // Get current status
  const statusResult = await sql`
    SELECT document_name, completion_pct, status, page_count
    FROM document_scorecards
    WHERE company_id = ${companyId} AND phase_id = ${phaseId}
  `

  const statusMap: Record<string, any> = {}
  if (statusResult && statusResult.length > 0) {
    for (const doc of statusResult as any[]) {
      statusMap[doc.document_name] = {
        completionPct: doc.completion_pct,
        status: doc.status,
        pageCount: doc.page_count,
      }
    }
  }

  return requiredDocs.map((req) => ({
    ...req,
    current: statusMap[req.name] || {
      completionPct: 0,
      status: 'not_started',
      pageCount: null,
    },
  }))
}

/**
 * Mark document for legal review
 * Updates status to 'reviewed' and sets legal review date
 */
export async function markDocumentForLegalReview(companyId: string, documentName: string): Promise<void> {
  const result = await sql`
    SELECT phase_id FROM document_scorecards
    WHERE company_id = ${companyId} AND document_name = ${documentName}
  `

  if (!result || result.length === 0) {
    throw new Error(`Document not found: ${documentName}`)
  }

  const phaseId = (result[0] as any).phase_id

  await sql`
    UPDATE document_scorecards
    SET status = 'reviewed', legal_review_date = NOW(), last_updated = NOW()
    WHERE company_id = ${companyId} AND document_name = ${documentName}
  `

  // Recalculate phase score
  const phaseScore = await scorePhaseCompleteness(companyId, phaseId)
  await sql`
    UPDATE phase_scorecards
    SET
      document_completeness_score = ${phaseScore.documentCompletenessScore},
      combined_phase_score = ${phaseScore.combinedPhaseScore},
      updated_at = NOW()
    WHERE company_id = ${companyId} AND phase_id = ${phaseId}
  `
}

/**
 * Get document management summary for dashboard
 * Returns progress metrics per phase
 */
export async function getDocumentManagementSummary(
  companyId: string
): Promise<
  Array<{
    phaseId: number
    phaseName: string
    total: number
    approved: number
    finalized: number
    reviewed: number
    progressPercentage: number
    averageCompletionPct: number
    staleCount: number
  }>
> {
  const summaryResult = await sql`
    SELECT
      phase_id,
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'final' OR status = 'approved') as finalized,
      COUNT(*) FILTER (WHERE status = 'reviewed') as reviewed,
      COUNT(*) FILTER (WHERE status NOT IN ('not_started', 'in_progress')) as in_progress_or_better,
      COUNT(*) FILTER (WHERE (NOW() - INTERVAL '30 days') > last_updated) as stale_count,
      AVG(completion_pct)::INT as avg_completion
    FROM document_scorecards
    WHERE company_id = ${companyId}
    GROUP BY phase_id
    ORDER BY phase_id
  `

  if (!summaryResult || summaryResult.length === 0) {
    return []
  }

  return (summaryResult as any[]).map((row) => ({
    phaseId: row.phase_id,
    phaseName: PHASE_NAMES[row.phase_id] ?? `Phase ${row.phase_id}`,
    total: row.total,
    approved: row.finalized,
    finalized: row.finalized,
    reviewed: row.reviewed,
    progressPercentage: Math.round(((row.in_progress_or_better / row.total) * 100) || 0),
    averageCompletionPct: row.avg_completion ?? 0,
    staleCount: row.stale_count ?? 0,
  }))
}

/**
 * Get all documents needing attention
 * Returns documents that are stale (>30 days) or incomplete (not final)
 */
export async function getDocumentsNeedingAttention(companyId: string): Promise<DocumentScore[]> {
  const docsResult = await sql`
    SELECT
      document_name,
      phase_id,
      completion_pct,
      status,
      last_updated,
      word_count,
      page_count,
      signature_count
    FROM document_scorecards
    WHERE company_id = ${companyId}
    AND (
      (NOW() - INTERVAL '30 days') > last_updated
      OR status NOT IN ('final', 'approved')
    )
    ORDER BY last_updated ASC
  `

  const attention: DocumentScore[] = []

  if (docsResult && docsResult.length > 0) {
    for (const doc of docsResult as any[]) {
      const lastUpdated = new Date(doc.last_updated)
      const daysOld = Math.floor((new Date().getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24))
      const freshness = calculateFreshness(lastUpdated)

      attention.push({
        documentName: doc.document_name,
        completionPct: doc.completion_pct ?? 0,
        status: doc.status,
        lastUpdated,
        daysOld,
        freshness,
        metadata: {
          wordCount: doc.word_count,
          pageCount: doc.page_count,
          signatureCount: doc.signature_count,
        },
      })
    }
  }

  return attention
}

/**
 * Calculate overall document readiness score across all phases
 * Weighted: 70% completion, 30% status quality
 */
export async function calculateDocumentReadinessScore(companyId: string): Promise<number> {
  const docsResult = await sql`
    SELECT completion_pct, status
    FROM document_scorecards
    WHERE company_id = ${companyId}
  `

  if (!docsResult || docsResult.length === 0) {
    return 0
  }

  const completionScores = (docsResult as any[]).map((d) => d.completion_pct ?? 0)
  const statusScores = (docsResult as any[]).map((d) => getStatusScore(d.status))

  const avgCompletion = Math.round(completionScores.reduce((a, b) => a + b, 0) / completionScores.length)
  const avgStatus = Math.round(statusScores.reduce((a, b) => a + b, 0) / statusScores.length)

  // Weighted average: 70% completion, 30% status quality
  return Math.round(avgCompletion * 0.7 + avgStatus * 0.3)
}
