/**
 * Document Completeness Scoring
 * Tracks document quality and completeness by phase
 * Incorporates into overall PACE score calculation
 */

import { sql } from '@/lib/db'

interface DocumentScorecard {
  id: string
  companyId: string
  documentName: string
  phaseId: number
  completionPct: number
  status: 'not_started' | 'in_progress' | 'draft' | 'reviewed' | 'final' | 'approved'
  wordCount?: number
  pageCount?: number
  signatureCount?: number
  legalReviewDate?: string
  lastUpdated: string
  reviewerNotes?: string
}

interface PhaseDocumentSummary {
  phaseId: number
  phaseName: string
  totalDocuments: number
  completedDocuments: number
  averageCompletionPct: number
  documentStatus: {
    name: string
    completion: number
    status: string
    lastUpdated: string
  }[]
}

// Define required documents per phase
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
 * Initialize document scorecards for a new company
 */
export async function initializeDocumentScorecardsForCompany(companyId: string) {
  const documents: { documentName: string; phaseId: number }[] = []

  for (const [phaseId, docs] of Object.entries(PHASE_DOCUMENTS)) {
    for (const documentName of Object.keys(docs)) {
      documents.push({
        documentName,
        phaseId: parseInt(phaseId, 10),
      })
    }
  }

  for (const doc of documents) {
    try {
      await sql`
        INSERT INTO document_scorecards (company_id, document_name, phase_id, completion_pct, status)
        VALUES (${companyId}, ${doc.documentName}, ${doc.phaseId}, 0, 'not_started')
        ON CONFLICT DO NOTHING
      `
    } catch (error) {
      console.error(`Error initializing document scorecard for ${doc.documentName}:`, error)
    }
  }
}

/**
 * Update document scorecard
 */
export async function updateDocumentScorecard(
  companyId: string,
  documentName: string,
  updates: {
    completionPct?: number
    status?: 'not_started' | 'in_progress' | 'draft' | 'reviewed' | 'final' | 'approved'
    wordCount?: number
    pageCount?: number
    signatureCount?: number
    legalReviewDate?: string
    reviewerNotes?: string
    documentUrl?: string
  }
) {
  // Build update query based on provided updates
  if (updates.completionPct !== undefined) {
    await sql`
      UPDATE document_scorecards
      SET completion_pct = ${updates.completionPct}, last_updated = NOW()
      WHERE company_id = ${companyId} AND document_name = ${documentName}
    `
  }
  if (updates.status !== undefined) {
    await sql`
      UPDATE document_scorecards
      SET status = ${updates.status}, last_updated = NOW()
      WHERE company_id = ${companyId} AND document_name = ${documentName}
    `
  }
  if (updates.wordCount !== undefined) {
    await sql`
      UPDATE document_scorecards
      SET word_count = ${updates.wordCount}, last_updated = NOW()
      WHERE company_id = ${companyId} AND document_name = ${documentName}
    `
  }
  if (updates.pageCount !== undefined) {
    await sql`
      UPDATE document_scorecards
      SET page_count = ${updates.pageCount}, last_updated = NOW()
      WHERE company_id = ${companyId} AND document_name = ${documentName}
    `
  }
  if (updates.signatureCount !== undefined) {
    await sql`
      UPDATE document_scorecards
      SET signature_count = ${updates.signatureCount}, last_updated = NOW()
      WHERE company_id = ${companyId} AND document_name = ${documentName}
    `
  }
  if (updates.legalReviewDate !== undefined) {
    await sql`
      UPDATE document_scorecards
      SET legal_review_date = ${updates.legalReviewDate}, last_updated = NOW()
      WHERE company_id = ${companyId} AND document_name = ${documentName}
    `
  }
  if (updates.reviewerNotes !== undefined) {
    await sql`
      UPDATE document_scorecards
      SET reviewer_notes = ${updates.reviewerNotes}, last_updated = NOW()
      WHERE company_id = ${companyId} AND document_name = ${documentName}
    `
  }
  if (updates.documentUrl !== undefined) {
    await sql`
      UPDATE document_scorecards
      SET document_url = ${updates.documentUrl}, last_updated = NOW()
      WHERE company_id = ${companyId} AND document_name = ${documentName}
    `
  }
}

/**
 * Get document scorecard for a phase
 */
export async function getPhaseDocumentSummary(companyId: string, phaseId: number): Promise<PhaseDocumentSummary | null> {
  const docs = await sql`
    SELECT
      document_name,
      completion_pct,
      status,
      last_updated
    FROM document_scorecards
    WHERE company_id = ${companyId} AND phase_id = ${phaseId}
    ORDER BY document_name
  `

  if (!docs || docs.length === 0) return null

  const completed = docs.filter((d: any) => d.status === 'final' || d.status === 'approved').length
  const avgCompletion = Math.round(docs.reduce((sum: number, d: any) => sum + (d.completion_pct ?? 0), 0) / docs.length)

  const phaseName = [
    'pre_planning',
    'corporate_restructuring',
    'financial_audit',
    'legal_documentation',
    'regulatory_filing',
    'marketing_roadshow',
    'listing_application',
    'post_listing',
  ][phaseId - 1]

  return {
    phaseId,
    phaseName,
    totalDocuments: docs.length,
    completedDocuments: completed,
    averageCompletionPct: avgCompletion,
    documentStatus: (docs as any[]).map((d) => ({
      name: d.document_name,
      completion: d.completion_pct ?? 0,
      status: d.status,
      lastUpdated: d.last_updated,
    })),
  }
}

/**
 * Calculate document completeness contribution to PACE score
 * Returns weighted score: 60% task completion + 40% document completeness
 */
export async function calculatePhaseScoreWithDocuments(
  companyId: string,
  phaseId: number,
  taskCompletionPct: number
) {
  const docSummary = await getPhaseDocumentSummary(companyId, phaseId)

  // If no documents tracked for this phase, use 100% default (don't penalize)
  const docCompletionPct = docSummary ? docSummary.averageCompletionPct : 100

  // Weighted score: 60% tasks, 40% documents
  const phaseScore = taskCompletionPct * 0.6 + docCompletionPct * 0.4

  return Math.round(phaseScore)
}

/**
 * Get all documents needing refresh (> 30 days old)
 */
export async function getDocumentsNeedingRefresh(companyId: string) {
  const needsRefresh = await sql`
    SELECT
      id, document_name, phase_id, status, last_updated,
      EXTRACT(DAY FROM NOW() - last_updated) as days_since_update
    FROM document_scorecards
    WHERE company_id = ${companyId}
      AND status IN ('final', 'approved')
      AND (NOW() - INTERVAL '30 days') > last_updated
    ORDER BY last_updated ASC
  `

  return needsRefresh as any[]
}

/**
 * Calculate overall document readiness score (0-100)
 */
export async function calculateDocumentReadinessScore(companyId: string): Promise<number> {
  const docs = await sql`
    SELECT completion_pct, status
    FROM document_scorecards
    WHERE company_id = ${companyId}
  `

  if (!docs || docs.length === 0) return 0

  const avgCompletion = Math.round(docs.reduce((sum: number, d: any) => sum + (d.completion_pct ?? 0), 0) / docs.length)

  // Factor in status quality (final/approved > reviewed > draft > in_progress > not_started)
  const statusScores: Record<string, number> = {
    approved: 100,
    final: 95,
    reviewed: 80,
    draft: 50,
    in_progress: 30,
    not_started: 0,
  }

  const statusScore = Math.round(docs.reduce((sum: number, d: any) => sum + (statusScores[d.status] ?? 0), 0) / docs.length)

  // Weighted average: 70% completion, 30% quality
  return Math.round(avgCompletion * 0.7 + statusScore * 0.3)
}

/**
 * Get document requirements and current status for a phase
 */
export async function getPhaseDocumentRequirements(phaseId: number, companyId?: string) {
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
  const status = await sql`
    SELECT document_name, completion_pct, status, page_count
    FROM document_scorecards
    WHERE company_id = ${companyId} AND phase_id = ${phaseId}
  `

  const statusMap: Record<string, any> = {}
  for (const doc of status as any[]) {
    statusMap[doc.document_name] = {
      completionPct: doc.completion_pct,
      status: doc.status,
      pageCount: doc.page_count,
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
 * Flag documents as ready for legal review
 */
export async function markDocumentForLegalReview(companyId: string, documentName: string) {
  await sql`
    UPDATE document_scorecards
    SET status = 'reviewed', legal_review_date = NOW()
    WHERE company_id = ${companyId} AND document_name = ${documentName}
  `
}

/**
 * Get document upload/management summary for dashboard
 */
export async function getDocumentManagementSummary(companyId: string) {
  const allDocs = await sql`
    SELECT
      phase_id,
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'approved') as approved,
      COUNT(*) FILTER (WHERE status = 'final') as finalized,
      COUNT(*) FILTER (WHERE status = 'reviewed') as reviewed,
      COUNT(*) FILTER (WHERE status NOT IN ('not_started', 'in_progress')) as in_progress_or_better
    FROM document_scorecards
    WHERE company_id = ${companyId}
    GROUP BY phase_id
    ORDER BY phase_id
  `

  return (allDocs as any[]).map((row) => ({
    phaseId: row.phase_id,
    total: row.total,
    approved: row.approved,
    finalized: row.finalized,
    reviewed: row.reviewed,
    progressPercentage: Math.round(((row.in_progress_or_better / row.total) * 100) || 0),
  }))
}
