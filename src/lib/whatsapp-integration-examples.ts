/**
 * WhatsApp Integration Examples
 * Copy these patterns into your application code to send WhatsApp notifications
 * at the right moments (document approvals, milestone completions, etc.)
 */

// ============================================================================
// Example 1: Send task reminder after task is created
// ============================================================================

import { sql } from '@/lib/db'
import { enqueueMessage } from '@/lib/whatsapp-queue'
import { sendDocumentReadyAlert, sendAccountAlert } from '@/lib/whatsapp-scheduler'

export async function handleTaskCreated(task: {
  id: string
  title: string
  dueDate: Date
  priority: string
  companyId: string
  assignedToUserId: string
}) {
  // Task reminders are automatically sent by the cron job
  // But you can also send immediately if it's critical

  if (task.priority === 'critical') {
    await enqueueMessage({
      phoneNumber: task.assignedToUserId, // In real code, look up phone from DB
      templateId: 'task-reminder',
      variables: {
        taskName: task.title,
        dueDate: formatDate(task.dueDate),
        priority: task.priority,
      },
      priority: 'urgent',
      userId: task.assignedToUserId,
      companyId: task.companyId,
      idempotencyKey: `task-created-${task.id}`,
    })
  }
}

// ============================================================================
// Example 2: Send document approval notification
// ============================================================================

export async function handleDocumentApproved(document: {
  id: string
  name: string
  type: string
  approvedByUserId: string
  approvedByName: string
  ownerId: string
  companyId: string
}) {
  const approverName = document.approvedByName || 'Reviewer'

  await sendDocumentReadyAlert(
    document.id,
    document.name,
    document.type,
    approverName,
    document.ownerId
  )
}

// ============================================================================
// Example 3: Send milestone completion alert
// ============================================================================

export async function handleMilestoneCompleted(milestone: {
  id: string
  title: string
  companyId: string
}) {
  // Get all opted-in users in company
  const userRows = await sql`
    SELECT u.id, u.phone_number
    FROM users u
    LEFT JOIN companies c ON c.id = u.company_id
    WHERE u.company_id = ${milestone.companyId}
      AND u.whatsapp_opted_in = TRUE
      AND u.phone_number IS NOT NULL
      AND c.subscription_plan IN ('growth', 'enterprise')
  `

  for (const user of userRows as any[]) {
    await enqueueMessage({
      phoneNumber: user.phone_number,
      templateId: 'milestone-alert',
      variables: {
        milestoneName: milestone.title,
        status: 'completed',
        progressPercent: 100,
        nextStep: 'Congratulations! Move to next phase.',
      },
      priority: 'regular',
      userId: user.id,
      companyId: milestone.companyId,
      idempotencyKey: `milestone-completed-${milestone.id}`,
    })
  }
}

// ============================================================================
// Example 4: Send billing alert
// ============================================================================

export async function handleBillingIssue(user: {
  id: string
  companyId: string
}) {
  await sendAccountAlert(
    user.id,
    'Billing Issue',
    'Your payment method failed. Your service may be interrupted.',
    'Update your payment method in account settings'
  )
}

// ============================================================================
// Example 5: Send compliance deadline alert
// ============================================================================

export async function handleComplianceDeadline(user: {
  id: string
  companyId: string
  deadline: Date
}) {
  const daysUntil = Math.ceil(
    (user.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )

  await sendAccountAlert(
    user.id,
    'Compliance Deadline',
    `You have ${daysUntil} days to submit required documentation.`,
    `Complete submission in your IPOReady dashboard`
  )
}

// ============================================================================
// Example 6: Opt-in flow
// ============================================================================

export async function handleUserOptInWhatsApp(userId: string, phoneNumber: string) {
  // Phone number already validated by API

  // Queue a welcome message
  await enqueueMessage({
    phoneNumber,
    templateId: 'daily-pulse',
    variables: {
      date: new Date().toLocaleDateString(),
      tasksDueToday: '3',
      milestonesOnTrack: '5',
      overallProgress: '42',
      briefInsight: 'You\'re on track! Keep up the momentum 📈',
    },
    priority: 'regular',
    userId,
  })
}

// ============================================================================
// Example 7: Monitor failed messages (admin dashboard)
// ============================================================================

export async function getFailedMessages(companyId: string) {
  const rows = await sql`
    SELECT
      id,
      phone_number,
      template_id,
      error,
      sent_at,
      created_at
    FROM whatsapp_logs
    WHERE company_id = ${companyId}
      AND status = 'failed'
    ORDER BY created_at DESC
    LIMIT 20
  `

  return rows
}

// ============================================================================
// Example 8: Resend failed message
// ============================================================================

export async function resendFailedMessage(messageId: string) {
  // Get original message details
  const rows = await sql`
    SELECT
      phone_number,
      template_id,
      user_id,
      company_id
    FROM whatsapp_logs
    WHERE id = ${messageId}
    LIMIT 1
  `

  if (!rows.length) {
    throw new Error('Message not found')
  }

  const original = rows[0] as any

  // Re-queue (will be processed by queue)
  await enqueueMessage({
    phoneNumber: original.phone_number,
    templateId: original.template_id,
    variables: {}, // You'd need to store variables or reconstruct them
    priority: 'regular',
    userId: original.user_id,
    companyId: original.company_id,
    idempotencyKey: `resend-${messageId}-${Date.now()}`,
  })
}

// ============================================================================
// Example 9: Get user message history
// ============================================================================

export async function getUserMessageHistory(userId: string, limit = 20) {
  const rows = await sql`
    SELECT
      id,
      phone_number,
      template_id,
      message_body,
      status,
      sent_at,
      delivered_at,
      error
    FROM whatsapp_logs
    WHERE user_id = ${userId}
    ORDER BY sent_at DESC
    LIMIT ${limit}
  `

  return rows.map(r => ({
    id: (r as any).id,
    phoneNumber: (r as any).phone_number,
    templateId: (r as any).template_id,
    body: (r as any).message_body,
    status: (r as any).status,
    sentAt: (r as any).sent_at,
    deliveredAt: (r as any).delivered_at,
    error: (r as any).error,
  }))
}

// ============================================================================
// Helper: Format date for messages
// ============================================================================

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ============================================================================
// Helper: Get user's phone from database
// ============================================================================

async function getUserPhone(userId: string): Promise<string | null> {
  const rows = await sql`
    SELECT phone_number FROM users WHERE id = ${userId}
  `
  return rows.length ? ((rows[0] as any).phone_number ?? null) : null
}

// ============================================================================
// Integration Points - Where to use these functions
// ============================================================================

/*
RECOMMENDED INTEGRATION POINTS:

1. Task Creation/Updates:
   - src/app/api/tasks/route.ts → handleTaskCreated()
   - Set immediate urgent reminders for critical tasks

2. Document Approvals:
   - src/app/api/documents/[id]/approve/route.ts → handleDocumentApproved()
   - Notify document owner when approved

3. Milestone Updates:
   - src/app/api/pace/milestones/[id]/update/route.ts → handleMilestoneCompleted()
   - Celebrate completions and progress

4. Billing Events:
   - src/app/api/billing/webhook/route.ts → handleBillingIssue()
   - Alert users to payment failures

5. Compliance Deadlines:
   - Batch job in src/app/api/whatsapp/cron/compliance-alerts/route.ts
   - Daily check for approaching deadlines

6. User Settings:
   - src/app/api/account/whatsapp/route.ts (PATCH) → handleUserOptInWhatsApp()
   - Welcome message when opting in

7. Admin Dashboard:
   - src/app/api/whatsapp/admin/stats/route.ts → getFailedMessages()
   - Show message performance metrics
   - Allow manual resends with resendFailedMessage()

8. Activity Timeline:
   - User profile → getUserMessageHistory()
   - Show user their WhatsApp notifications
*/

export {}
