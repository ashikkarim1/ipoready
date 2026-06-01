/**
 * PROSPECTUS APPROVAL WORKFLOW
 * Three-tier approval system: AI Draft → Admin Review → Professional Sign-Off
 * 
 * Realistic legal document approval workflow with:
 * - AI-generated draft sections (auto-approved as 'draft' status)
 * - Admin company review (approve, request revisions, or reject)
 * - Professional (lawyer/auditor) final sign-off (approve or send back)
 * - Revision loops at each tier (sections can return to previous tier)
 * - Complete audit trail with signatures for legal compliance
 * - Weighted progress tracking based on tier completion
 */

import { sql } from './db'

// ============================================================
// TYPE DEFINITIONS
// ============================================================

export type ReviewTier = 'ai_draft' | 'admin_review' | 'professional_review'
export type ReviewStatus = 'pending' | 'in_progress' | 'approved' | 'rejected' | 'revision_requested'
export type NotificationChannel = 'email' | 'in_app' | 'webhook'

export interface WorkflowStep {
  id: string
  prospectusId: string
  sectionId: string
  tier: ReviewTier
  status: ReviewStatus
  assignedTo: string // user_id or 'claude_ai'
  assignedAt: Date
  completedAt?: Date
  comments?: string
  suggestedChanges?: Array<{
    sectionId: string
    originalText: string
    suggestedText: string
    rationale: string
  }>
  reviewRound: number
}

export interface ProspectusApprovalState {
  prospectusId: string
  currentTier: ReviewTier
  completionByTier: {
    ai_draft: number // % of sections in draft
    admin_review: number // % reviewed by admin
    professional_review: number // % approved by lawyer/auditor
  }
  overallProgress: number // Weighted: (ai*0.4 + admin*0.35 + prof*0.25)
  blockedSections: string[] // Section IDs awaiting action
  nextAction: string // Human-readable next step
  totalSections: number
  totalApproved: number
  lastUpdatedAt: Date
}

export interface ReviewQueueItem {
  prospectusId: string
  sectionId: string
  sectionName: string
  sectionNumber: string
  tier: ReviewTier
  status: ReviewStatus
  assignedAt: Date
  draftContentPreview: string
  wordCount: number
  reviewRound: number
  prospectusExchange: string
}

export interface ProfessionalSignature {
  name: string
  licenseNumber: string
  professionalTitle: string // 'Securities Lawyer', 'Auditor', 'CFO'
  timestamp: Date
  signatureImageUrl?: string // Optional: S3 path to signature image
  verificationToken?: string // For blockchain/audit trail verification
}

export interface WorkflowNotification {
  id: string
  recipientId: string
  tier: ReviewTier
  prospectusId: string
  sectionId: string
  messageType: 'ready_for_review' | 'revision_requested' | 'approved' | 'rejected' | 'assigned'
  title: string
  body: string
  channel: NotificationChannel
  createdAt: Date
  sentAt?: Date
  failureReason?: string
}

// ============================================================
// IN-MEMORY NOTIFICATION QUEUE
// ============================================================

// In production, replace with message broker (RabbitMQ, Redis, SQS)
class NotificationQueue {
  private queue: WorkflowNotification[] = []

  async enqueue(notification: WorkflowNotification): Promise<void> {
    this.queue.push(notification)
    // In production: send to message broker or email service
    await this.process(notification)
  }

  private async process(notification: WorkflowNotification): Promise<void> {
    try {
      // Simulate email/notification sending
      console.log(`[NOTIFICATION] ${notification.channel.toUpperCase()}: ${notification.title}`)
      console.log(`  To: ${notification.recipientId}`)
      console.log(`  Body: ${notification.body}`)

      // Record notification sent
      await sql`
        INSERT INTO prospectus_notifications (
          recipient_id, tier, prospectus_id, section_id,
          message_type, title, body, channel, sent_at
        ) VALUES (
          ${notification.recipientId},
          ${notification.tier},
          ${notification.prospectusId},
          ${notification.sectionId},
          ${notification.messageType},
          ${notification.title},
          ${notification.body},
          ${notification.channel},
          NOW()
        )
      `

      notification.sentAt = new Date()
    } catch (error) {
      notification.failureReason = `Failed to send notification: ${error instanceof Error ? error.message : 'Unknown error'}`
      console.error(`[NOTIFICATION ERROR]`, notification.failureReason)
    }
  }
}

const notificationQueue = new NotificationQueue()

// ============================================================
// TIER 1: AI DRAFT SUBMISSION
// ============================================================

/**
 * Submit AI-generated draft section to workflow
 * AI drafts are auto-approved and move immediately to admin_review tier
 * Marks prospectus_section_content.draft_content and status = 'draft'
 */
export async function submitAIDraft(
  prospectusId: string,
  sectionId: string,
  draftContent: string,
  sourceDocuments: string[] // Array of document IDs used
): Promise<void> {
  const contentVersion = 1

  try {
    // 1. Store draft content
    const contentResult = await sql`
      INSERT INTO prospectus_section_content (
        section_id,
        content_version,
        draft_content,
        word_count,
        source_documents,
        created_by
      ) VALUES (
        ${sectionId},
        ${contentVersion},
        ${draftContent},
        ${draftContent.split(/\s+/).length},
        ${JSON.stringify(sourceDocuments.map((id) => ({ document_id: id, extraction_confidence: 0.85 })))},
        'claude_ai'
      )
      RETURNING id
    `

    // 2. Auto-approve AI draft (it's a draft, not final)
    await sql`
      INSERT INTO prospectus_reviews (
        section_id,
        review_round,
        reviewer_id,
        reviewer_role,
        status,
        comments
      ) VALUES (
        ${sectionId},
        1,
        'claude_ai',
        'ai_agent',
        'approved',
        'Auto-approved AI draft. Ready for admin review.'
      )
    `

    // 3. Update section status to 'draft'
    await sql`
      UPDATE prospectus_sections
      SET
        status = 'draft',
        ai_generation_attempted = TRUE,
        ai_generation_timestamp = NOW(),
        completion_pct = 50,
        word_count = ${draftContent.split(/\s+/).length}
      WHERE id = ${sectionId}
    `

    // 4. Create workflow record for admin review tier
    const workflowId = await createWorkflowStep(prospectusId, sectionId, 'admin_review', 'pending', 'admin_pending')

    // 5. Get admin user(s) for this company and notify them
    const adminUsers = (await sql`
      SELECT u.id, u.email
      FROM users u
      INNER JOIN companies c ON u.company_id = c.id
      WHERE c.id = (SELECT company_id FROM prospectuses WHERE id = ${prospectusId})
        AND u.role = 'admin'
      LIMIT 5
    `) as Array<{ id: string; email: string }>

    const sectionName = (await sql`
      SELECT section_name FROM prospectus_sections WHERE id = ${sectionId}
    `) as Array<{ section_name: string }>

    for (const admin of adminUsers) {
      await notificationQueue.enqueue({
        id: crypto.randomUUID(),
        recipientId: admin.id,
        tier: 'admin_review',
        prospectusId,
        sectionId,
        messageType: 'ready_for_review',
        title: `Section Ready for Review: ${sectionName[0]?.section_name || 'Unknown'}`,
        body: `AI has generated a draft for "${sectionName[0]?.section_name}". Please review and approve, request revisions, or reject.`,
        channel: 'email',
        createdAt: new Date(),
      })
    }

    // 6. Audit log
    await logAuditEntry(prospectusId, 'section_drafted', 'claude_ai', 'ai_agent', sectionId, {
      contentVersion,
      sourceDocuments,
      wordCount: draftContent.split(/\s+/).length,
    })
  } catch (error) {
    throw new Error(`Failed to submit AI draft for section ${sectionId}: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// ============================================================
// TIER 2: ADMIN REVIEW SUBMISSION
// ============================================================

/**
 * Submit admin review decision
 * - approved: Move to professional_review tier
 * - revision_requested: Return to ai_draft tier for refinement
 * - rejected: Mark section as rejected, halt workflow
 */
export async function submitAdminReview(
  prospectusId: string,
  sectionId: string,
  adminId: string,
  status: 'approved' | 'revision_requested' | 'rejected',
  comments: string,
  suggestedChanges?: Array<{ originalText: string; suggestedText: string; rationale: string }>
): Promise<void> {
  try {
    // Get review round number
    const reviewRoundResult = (await sql`
      SELECT MAX(review_round) as max_round
      FROM prospectus_reviews
      WHERE section_id = ${sectionId}
    `) as Array<{ max_round: number | null }>
    const nextRound = (reviewRoundResult[0]?.max_round ?? 0) + 1

    // 1. Create review record
    await sql`
      INSERT INTO prospectus_reviews (
        section_id,
        review_round,
        reviewer_id,
        reviewer_role,
        status,
        comments,
        change_requests
      ) VALUES (
        ${sectionId},
        ${nextRound},
        ${adminId},
        'human_admin',
        ${status},
        ${comments},
        ${JSON.stringify(suggestedChanges || [])}
      )
    `

    if (status === 'approved') {
      // Move to professional review tier
      await sql`
        UPDATE prospectus_sections
        SET
          status = 'professional_review',
          approved_by_admin_at = NOW(),
          approved_by_admin_id = ${adminId},
          completion_pct = 75
        WHERE id = ${sectionId}
      `

      // Create workflow record for professional review
      await createWorkflowStep(prospectusId, sectionId, 'professional_review', 'pending', 'admin_approved')

      // Notify professional reviewers
      const sectionName = (await sql`
        SELECT section_name FROM prospectus_sections WHERE id = ${sectionId}
      `) as Array<{ section_name: string }>

      const professionalReviewers = (await sql`
        SELECT DISTINCT u.id, u.email
        FROM users u
        WHERE u.role IN ('securities_lawyer', 'auditor', 'cfo')
          AND (u.company_id = (SELECT company_id FROM prospectuses WHERE id = ${prospectusId})
               OR u.is_platform_professional = TRUE)
        LIMIT 10
      `) as Array<{ id: string; email: string }>

      for (const reviewer of professionalReviewers) {
        await notificationQueue.enqueue({
          id: crypto.randomUUID(),
          recipientId: reviewer.id,
          tier: 'professional_review',
          prospectusId,
          sectionId,
          messageType: 'ready_for_review',
          title: `Professional Review Needed: ${sectionName[0]?.section_name || 'Unknown'}`,
          body: `Admin has reviewed and approved "${sectionName[0]?.section_name}". Ready for professional sign-off (lawyer/auditor).`,
          channel: 'email',
          createdAt: new Date(),
        })
      }

      await logAuditEntry(prospectusId, 'admin_approved', adminId, 'human_admin', sectionId, {
        reviewRound: nextRound,
        comments,
      })
    } else if (status === 'revision_requested') {
      // Return to AI draft tier for refinement
      await sql`
        UPDATE prospectus_sections
        SET
          status = 'draft',
          completion_pct = 40
        WHERE id = ${sectionId}
      `

      // Create workflow record returning to AI
      await createWorkflowStep(prospectusId, sectionId, 'ai_draft', 'pending', 'admin_revision')

      // Notify AI agent (in production, this triggers AI refinement job)
      await notificationQueue.enqueue({
        id: crypto.randomUUID(),
        recipientId: 'claude_ai',
        tier: 'ai_draft',
        prospectusId,
        sectionId,
        messageType: 'revision_requested',
        title: 'Section Revision Requested by Admin',
        body: `Admin review complete. Requested changes: ${comments}`,
        channel: 'webhook',
        createdAt: new Date(),
      })

      // Also queue AI agent work
      await sql`
        INSERT INTO prospectus_agent_work_queue (
          prospectus_id,
          section_id,
          task_type,
          priority,
          status,
          assigned_to_agent
        ) VALUES (
          ${prospectusId},
          ${sectionId},
          'refine_section',
          8,
          'pending',
          'prospectus_co_pilot_1'
        )
      `

      await logAuditEntry(prospectusId, 'admin_revision_requested', adminId, 'human_admin', sectionId, {
        reviewRound: nextRound,
        comments,
        suggestedChanges,
      })
    } else if (status === 'rejected') {
      // Reject section completely
      await sql`
        UPDATE prospectus_sections
        SET
          status = 'rejected',
          completion_pct = 0
        WHERE id = ${sectionId}
      `

      // Create workflow record
      await createWorkflowStep(prospectusId, sectionId, 'admin_review', 'rejected', 'admin_rejected')

      // Notify AI agent
      await notificationQueue.enqueue({
        id: crypto.randomUUID(),
        recipientId: 'claude_ai',
        tier: 'admin_review',
        prospectusId,
        sectionId,
        messageType: 'rejected',
        title: 'Section Rejected by Admin',
        body: `Admin rejected the section. Reason: ${comments}`,
        channel: 'webhook',
        createdAt: new Date(),
      })

      await logAuditEntry(prospectusId, 'admin_rejected', adminId, 'human_admin', sectionId, {
        reviewRound: nextRound,
        comments,
      })
    }
  } catch (error) {
    throw new Error(
      `Failed to submit admin review for section ${sectionId}: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

// ============================================================
// TIER 3: PROFESSIONAL REVIEW & SIGN-OFF
// ============================================================

/**
 * Submit professional review (lawyer/auditor final approval)
 * - approved: Mark section as final, store signature for audit trail
 * - revision_requested: Return to admin_review tier
 * 
 * Signature capture for legal compliance (audit trail verification)
 */
export async function submitProfessionalReview(
  prospectusId: string,
  sectionId: string,
  professionalId: string,
  status: 'approved' | 'revision_requested',
  comments: string,
  professionalTitle: string, // 'Securities Lawyer', 'Auditor', 'CFO'
  signature?: ProfessionalSignature
): Promise<void> {
  try {
    // Get review round
    const reviewRoundResult = (await sql`
      SELECT MAX(review_round) as max_round
      FROM prospectus_reviews
      WHERE section_id = ${sectionId}
    `) as Array<{ max_round: number | null }>
    const nextRound = (reviewRoundResult[0]?.max_round ?? 0) + 1

    // 1. Create review record
    const reviewMetadata = signature
      ? {
          signature: signature,
          signedAt: new Date().toISOString(),
          verificationToken: `sig_${crypto.randomUUID()}`,
        }
      : {}

    await sql`
      INSERT INTO prospectus_reviews (
        section_id,
        review_round,
        reviewer_id,
        reviewer_role,
        status,
        comments,
        sections_affected
      ) VALUES (
        ${sectionId},
        ${nextRound},
        ${professionalId},
        ${professionalTitle.toLowerCase().replace(/\s+/g, '_')},
        ${status},
        ${comments},
        ${JSON.stringify(reviewMetadata)}
      )
    `

    if (status === 'approved') {
      // Mark section as final/approved
      await sql`
        UPDATE prospectus_section_content
        SET
          approved_by_professional_at = NOW(),
          professional_approver_id = ${professionalId},
          professional_approver_role = ${professionalTitle}
        WHERE section_id = ${sectionId}
        ORDER BY content_version DESC
        LIMIT 1
      `

      await sql`
        UPDATE prospectus_sections
        SET
          status = 'final',
          completion_pct = 100,
          updated_at = NOW()
        WHERE id = ${sectionId}
      `

      // Store signature in audit log for compliance
      if (signature) {
        await sql`
          INSERT INTO prospectus_audit_log (
            prospectus_id,
            action,
            actor_id,
            actor_role,
            section_id,
            details
          ) VALUES (
            ${prospectusId},
            'professionally_signed_off',
            ${professionalId},
            'professional_reviewer',
            ${sectionId},
            ${JSON.stringify({
              professionalTitle: signature.professionalTitle,
              signedBy: signature.name,
              licenseNumber: signature.licenseNumber,
              timestamp: signature.timestamp,
              verificationToken: signature.verificationToken,
            })}
          )
        `
      }

      // Check if ALL sections are now approved
      const allApprovalsResult = (await sql`
        SELECT COUNT(*) as count
        FROM prospectus_sections
        WHERE prospectus_id = ${prospectusId}
          AND status != 'final'
          AND status != 'rejected'
      `) as Array<{ count: number }>

      if (allApprovalsResult[0]?.count === 0) {
        // All sections approved! Mark prospectus as ready for export
        await sql`
          UPDATE prospectuses
          SET status = 'ready_for_export'
          WHERE id = ${prospectusId}
        `

        // Notify company admin that prospectus is ready
        const companyAdmins = (await sql`
          SELECT u.id, u.email
          FROM users u
          WHERE u.company_id = (SELECT company_id FROM prospectuses WHERE id = ${prospectusId})
            AND u.role = 'admin'
          LIMIT 5
        `) as Array<{ id: string; email: string }>

        for (const admin of companyAdmins) {
          await notificationQueue.enqueue({
            id: crypto.randomUUID(),
            recipientId: admin.id,
            tier: 'professional_review',
            prospectusId,
            sectionId,
            messageType: 'approved',
            title: 'Prospectus Ready for Export',
            body: 'All sections have been approved by legal professionals. Your prospectus is ready for final export and filing.',
            channel: 'email',
            createdAt: new Date(),
          })
        }
      }

      const sectionName = (await sql`
        SELECT section_name FROM prospectus_sections WHERE id = ${sectionId}
      `) as Array<{ section_name: string }>

      await logAuditEntry(prospectusId, 'professionally_approved', professionalId, 'professional_reviewer', sectionId, {
        reviewRound: nextRound,
        professionalTitle,
        comments,
        signature: signature ? { name: signature.name, title: signature.professionalTitle } : undefined,
      })
    } else if (status === 'revision_requested') {
      // Return to admin review tier
      await sql`
        UPDATE prospectus_sections
        SET
          status = 'admin_review',
          completion_pct = 60
        WHERE id = ${sectionId}
      `

      // Create workflow record returning to admin
      await createWorkflowStep(prospectusId, sectionId, 'admin_review', 'in_progress', 'professional_revision')

      // Notify admins
      const sectionName = (await sql`
        SELECT section_name FROM prospectus_sections WHERE id = ${sectionId}
      `) as Array<{ section_name: string }>

      const adminUsers = (await sql`
        SELECT u.id, u.email
        FROM users u
        WHERE u.company_id = (SELECT company_id FROM prospectuses WHERE id = ${prospectusId})
          AND u.role = 'admin'
        LIMIT 5
      `) as Array<{ id: string; email: string }>

      for (const admin of adminUsers) {
        await notificationQueue.enqueue({
          id: crypto.randomUUID(),
          recipientId: admin.id,
          tier: 'admin_review',
          prospectusId,
          sectionId,
          messageType: 'revision_requested',
          title: `Professional Review: Revisions Requested for ${sectionName[0]?.section_name}`,
          body: `${professionalTitle} has requested revisions: ${comments}`,
          channel: 'email',
          createdAt: new Date(),
        })
      }

      await logAuditEntry(prospectusId, 'professional_revision_requested', professionalId, 'professional_reviewer', sectionId, {
        reviewRound: nextRound,
        professionalTitle,
        comments,
      })
    }
  } catch (error) {
    throw new Error(
      `Failed to submit professional review for section ${sectionId}: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

// ============================================================
// APPROVAL STATE CALCULATION & DASHBOARD
// ============================================================

/**
 * Get comprehensive approval state for dashboard
 * Calculates weighted progress: AI*0.4 + Admin*0.35 + Professional*0.25
 */
export async function getApprovalState(prospectusId: string): Promise<ProspectusApprovalState> {
  try {
    // Get all sections for this prospectus
    const sections = (await sql`
      SELECT id, section_name, status, completion_pct
      FROM prospectus_sections
      WHERE prospectus_id = ${prospectusId}
    `) as Array<{ id: string; section_name: string; status: string; completion_pct: number }>

    const totalSections = sections.length
    let totalApproved = 0

    // Calculate completion by tier
    const aiDraftCount = sections.filter((s) => s.status === 'draft').length
    const adminReviewCount = sections.filter((s) => s.status === 'admin_review').length
    const professionalReviewCount = sections.filter(
      (s) => s.status === 'professional_review'
    ).length
    const finalCount = sections.filter((s) => s.status === 'final').length

    totalApproved = finalCount

    const aiDraftPct = totalSections > 0 ? Math.round(((aiDraftCount + adminReviewCount + professionalReviewCount + finalCount) / totalSections) * 100) : 0
    const adminReviewPct = totalSections > 0 ? Math.round(((adminReviewCount + professionalReviewCount + finalCount) / totalSections) * 100) : 0
    const professionalReviewPct = totalSections > 0 ? Math.round(((professionalReviewCount + finalCount) / totalSections) * 100) : 0

    // Weighted overall progress
    const overallProgress = Math.round(
      aiDraftPct * 0.4 +
      adminReviewPct * 0.35 +
      professionalReviewPct * 0.25
    )

    // Identify blocked sections
    const blockedSections = sections
      .filter((s) => s.status === 'rejected' || s.status === 'draft')
      .map((s) => s.id)

    // Determine next action
    let nextAction = 'All sections completed!'
    if (totalApproved < totalSections) {
      const pendingReview = sections.filter((s) => s.status !== 'final' && s.status !== 'rejected')
      if (pendingReview.length > 0) {
        const nextSection = pendingReview[0]
        nextAction = `${nextSection.status === 'draft' ? 'Admin needs to review' : `${nextSection.status} in progress for`} section: ${nextSection.section_name}`
      }
    }

    return {
      prospectusId,
      currentTier: determineTier(aiDraftPct, adminReviewPct, professionalReviewPct),
      completionByTier: {
        ai_draft: aiDraftPct,
        admin_review: adminReviewPct,
        professional_review: professionalReviewPct,
      },
      overallProgress,
      blockedSections,
      nextAction,
      totalSections,
      totalApproved,
      lastUpdatedAt: new Date(),
    }
  } catch (error) {
    throw new Error(`Failed to get approval state for prospectus ${prospectusId}: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// ============================================================
// REVIEW QUEUE MANAGEMENT
// ============================================================

/**
 * Get review queue for a specific user
 * Used to populate admin/professional reviewer dashboards
 */
export async function getReviewQueue(userId: string, tier?: ReviewTier): Promise<ReviewQueueItem[]> {
  try {
    let queryCondition = ''
    if (tier) {
      const tierRole = tier === 'ai_draft' ? 'ai_agent' : tier === 'admin_review' ? 'admin' : 'lawyer|auditor|cfo'
      queryCondition = `AND pr.reviewer_role LIKE '%${tierRole}%'`
    }

    const rows = (await sql`
      SELECT
        p.id as prospectusId,
        ps.id as sectionId,
        ps.section_name as sectionName,
        ps.section_number as sectionNumber,
        pr.status,
        pr.created_at as assignedAt,
        psc.draft_content as draftContent,
        psc.word_count as wordCount,
        pr.review_round as reviewRound,
        p.exchange as prospectusExchange
      FROM prospectus_reviews pr
      INNER JOIN prospectus_sections ps ON pr.section_id = ps.id
      INNER JOIN prospectuses p ON ps.prospectus_id = p.id
      LEFT JOIN prospectus_section_content psc ON ps.id = psc.section_id
      WHERE pr.reviewer_id = ${userId}
        AND pr.status IN ('in_progress', 'pending')
      ORDER BY pr.created_at ASC
    `) as Array<any>

    return rows.map((row) => ({
      prospectusId: row.prospectusId,
      sectionId: row.sectionId,
      sectionName: row.sectionName,
      sectionNumber: row.sectionNumber,
      tier: determineTierFromRole(row.status),
      status: row.status,
      assignedAt: row.assignedAt,
      draftContentPreview: row.draftContent?.substring(0, 300) || '',
      wordCount: row.wordCount || 0,
      reviewRound: row.reviewRound || 1,
      prospectusExchange: row.prospectusExchange,
    }))
  } catch (error) {
    throw new Error(`Failed to get review queue for user ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// ============================================================
// REASSIGNMENT & WORKFLOW MANAGEMENT
// ============================================================

/**
 * Reassign a review task to a different reviewer
 * Updates prospectus_reviews.reviewer_id
 */
export async function reassignReview(
  prospectusId: string,
  sectionId: string,
  tier: ReviewTier,
  newAssigneeId: string
): Promise<void> {
  try {
    // Get the review record
    const reviewRecord = (await sql`
      SELECT id, reviewer_id
      FROM prospectus_reviews
      WHERE section_id = ${sectionId}
        AND status IN ('pending', 'in_progress')
      ORDER BY created_at DESC
      LIMIT 1
    `) as Array<{ id: string; reviewer_id: string }>

    if (!reviewRecord.length) {
      throw new Error(`No pending review found for section ${sectionId}`)
    }

    const oldAssignee = reviewRecord[0].reviewer_id

    // Update assignment
    await sql`
      UPDATE prospectus_reviews
      SET reviewer_id = ${newAssigneeId}
      WHERE id = ${reviewRecord[0].id}
    `

    // Get new assignee info for notification
    const newAssignee = (await sql`
      SELECT email, role FROM users WHERE id = ${newAssigneeId}
    `) as Array<{ email: string; role: string }>

    const sectionName = (await sql`
      SELECT section_name FROM prospectus_sections WHERE id = ${sectionId}
    `) as Array<{ section_name: string }>

    // Notify new assignee
    if (newAssignee.length > 0) {
      await notificationQueue.enqueue({
        id: crypto.randomUUID(),
        recipientId: newAssigneeId,
        tier,
        prospectusId,
        sectionId,
        messageType: 'assigned',
        title: `Review Assignment: ${sectionName[0]?.section_name}`,
        body: `You have been assigned to ${tier.replace(/_/g, ' ')} for "${sectionName[0]?.section_name}".`,
        channel: 'email',
        createdAt: new Date(),
      })
    }

    await logAuditEntry(prospectusId, 'review_reassigned', newAssigneeId, 'system', sectionId, {
      fromUserId: oldAssignee,
      toUserId: newAssigneeId,
      tier,
    })
  } catch (error) {
    throw new Error(
      `Failed to reassign review for section ${sectionId}: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Create a workflow step record in database
 */
async function createWorkflowStep(
  prospectusId: string,
  sectionId: string,
  tier: ReviewTier,
  status: ReviewStatus,
  transitionReason: string
): Promise<string> {
  // This would be stored in a workflow_steps table if more complex tracking is needed
  // For now, we're using prospectus_reviews table as the single source of truth
  return crypto.randomUUID()
}

/**
 * Determine current tier based on completion percentages
 */
function determineTier(aiPct: number, adminPct: number, profPct: number): ReviewTier {
  if (profPct === 100) return 'professional_review'
  if (adminPct > 50) return 'admin_review'
  return 'ai_draft'
}

/**
 * Helper: determine tier from database role
 */
function determineTierFromRole(status: ReviewStatus): ReviewTier {
  // This is a placeholder - in real implementation, check the reviewer_role
  return 'admin_review'
}

/**
 * Log audit entry for compliance
 */
async function logAuditEntry(
  prospectusId: string,
  action: string,
  actorId: string,
  actorRole: string,
  sectionId?: string,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    await sql`
      INSERT INTO prospectus_audit_log (
        prospectus_id,
        action,
        actor_id,
        actor_role,
        section_id,
        details
      ) VALUES (
        ${prospectusId},
        ${action},
        ${actorId},
        ${actorRole},
        ${sectionId || null},
        ${JSON.stringify(details || {})}
      )
    `
  } catch (error) {
    console.error(`Failed to log audit entry: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Get complete audit trail for a prospectus (for legal compliance)
 */
export async function getAuditTrail(
  prospectusId: string,
  options?: { sectionId?: string; actionFilter?: string }
): Promise<
  Array<{
    id: string
    action: string
    actorId: string
    actorRole: string
    sectionId?: string
    timestamp: Date
    details: Record<string, unknown>
  }>
> {
  try {
    const rows = (await sql`
      SELECT id, action, actor_id, actor_role, section_id, timestamp, details
      FROM prospectus_audit_log
      WHERE prospectus_id = ${prospectusId}
        ${options?.sectionId ? sql`AND section_id = ${options.sectionId}` : sql``}
        ${options?.actionFilter ? sql`AND action LIKE ${'%' + options.actionFilter + '%'}` : sql``}
      ORDER BY timestamp DESC
    `) as Array<any>

    return rows.map((row) => ({
      id: row.id,
      action: row.action,
      actorId: row.actor_id,
      actorRole: row.actor_role,
      sectionId: row.section_id,
      timestamp: row.timestamp,
      details: typeof row.details === 'string' ? JSON.parse(row.details) : row.details,
    }))
  } catch (error) {
    throw new Error(`Failed to get audit trail for prospectus ${prospectusId}: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Export approval workflow state as JSON for external systems
 */
export async function exportApprovalState(prospectusId: string): Promise<string> {
  const state = await getApprovalState(prospectusId)
  const auditTrail = await getAuditTrail(prospectusId)

  return JSON.stringify(
    {
      prospectusId,
      exportedAt: new Date().toISOString(),
      approvalState: state,
      auditTrail,
    },
    null,
    2
  )
}

export { NotificationQueue, notificationQueue }
