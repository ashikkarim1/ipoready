/**
 * WhatsApp Scheduled Messages
 * Integration helpers for sending reminders and scheduled notifications
 * Works with cron jobs to trigger at specific times
 */

import { sql } from '@/lib/db'
import { enqueueMessage } from '@/lib/whatsapp-queue'
import { TemplateId } from '@/lib/whatsapp-templates'

/**
 * Send task reminders to users for tasks due within 24 hours
 * Called by cron job (recommended: daily at 9am)
 */
export async function sendTaskReminders(): Promise<{ sent: number; failed: number }> {
  const result = { sent: 0, failed: 0 }

  try {
    // Find tasks due within next 24 hours
    const tasks = await sql`
      SELECT
        t.id,
        t.title,
        t.company_id,
        t.due_date,
        u.id as user_id,
        u.phone_number,
        u.whatsapp_opted_in
      FROM tasks t
      JOIN companies c ON c.id = t.company_id
      JOIN users u ON u.company_id = t.company_id
      WHERE
        t.due_date >= NOW()
        AND t.due_date <= NOW() + INTERVAL '24 hours'
        AND t.status NOT IN ('completed', 'cancelled')
        AND u.whatsapp_opted_in = TRUE
        AND u.phone_number IS NOT NULL
        AND c.subscription_plan IN ('growth', 'enterprise')
      ORDER BY t.due_date ASC
    `

    for (const task of tasks as any[]) {
      try {
        const dueDate = new Date(task.due_date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })

        await enqueueMessage({
          phoneNumber: task.phone_number,
          templateId: 'task-reminder',
          variables: {
            taskName: task.title,
            dueDate,
            priority: task.priority || 'medium',
          },
          priority: task.priority === 'critical' ? 'urgent' : 'regular',
          userId: task.user_id,
          companyId: task.company_id,
          idempotencyKey: `task-reminder-${task.id}`,
        })

        result.sent++
      } catch (err) {
        console.error(`[task-reminder] Failed for task ${task.id}:`, err)
        result.failed++
      }
    }

    return result
  } catch (err) {
    console.error('[task-reminders]', err)
    throw err
  }
}

/**
 * Send milestone alerts to users for milestones progressing
 * Called by cron job (recommended: when milestone status changes)
 */
export async function sendMilestoneAlerts(): Promise<{ sent: number; failed: number }> {
  const result = { sent: 0, failed: 0 }

  try {
    // Find recently updated milestones
    const milestones = await sql`
      SELECT
        m.id,
        m.title,
        m.status,
        m.progress_percent,
        m.company_id,
        u.id as user_id,
        u.phone_number,
        u.whatsapp_opted_in
      FROM milestones m
      JOIN companies c ON c.id = m.company_id
      JOIN users u ON u.company_id = m.company_id
      WHERE
        u.whatsapp_opted_in = TRUE
        AND u.phone_number IS NOT NULL
        AND c.subscription_plan IN ('growth', 'enterprise')
        AND m.updated_at > NOW() - INTERVAL '1 hour'
      ORDER BY m.progress_percent DESC
    `

    for (const milestone of milestones as any[]) {
      try {
        // Determine next step based on progress
        let nextStep = 'Keep making progress'
        if (milestone.progress_percent >= 80) {
          nextStep = 'Final push towards completion'
        } else if (milestone.progress_percent >= 50) {
          nextStep = 'You\'re halfway there!'
        }

        await enqueueMessage({
          phoneNumber: milestone.phone_number,
          templateId: 'milestone-alert',
          variables: {
            milestoneName: milestone.title,
            status: milestone.status,
            progressPercent: milestone.progress_percent,
            nextStep,
          },
          priority: milestone.progress_percent >= 90 ? 'urgent' : 'regular',
          userId: milestone.user_id,
          companyId: milestone.company_id,
          idempotencyKey: `milestone-alert-${milestone.id}-${Math.floor(Date.now() / 3600000)}`,
        })

        result.sent++
      } catch (err) {
        console.error(`[milestone-alert] Failed for milestone ${milestone.id}:`, err)
        result.failed++
      }
    }

    return result
  } catch (err) {
    console.error('[milestone-alerts]', err)
    throw err
  }
}

/**
 * Send document ready alerts
 * Called when a document is approved and ready for user action
 */
export async function sendDocumentReadyAlert(
  documentId: string,
  documentName: string,
  documentType: string,
  requestedBy: string,
  userId: string,
): Promise<void> {
  const userRows = await sql`
    SELECT
      u.id,
      u.phone_number,
      u.company_id,
      u.whatsapp_opted_in,
      c.subscription_plan
    FROM users u
    LEFT JOIN companies c ON c.id = u.company_id
    WHERE u.id = ${userId}
  `

  if (!userRows.length) {
    throw new Error(`User not found: ${userId}`)
  }

  const user = userRows[0] as any
  if (!user.whatsapp_opted_in || !user.phone_number) {
    console.log(`[document-ready] User ${userId} not opted in or missing phone`)
    return
  }

  if (!['growth', 'enterprise'].includes(user.subscription_plan)) {
    return
  }

  await enqueueMessage({
    phoneNumber: user.phone_number,
    templateId: 'document-ready',
    variables: {
      documentName,
      documentType,
      requestedBy,
    },
    priority: 'regular',
    userId,
    companyId: user.company_id,
    idempotencyKey: `doc-ready-${documentId}`,
  })
}

/**
 * Send board report ready alert
 */
export async function sendBoardReportAlert(
  reportId: string,
  reportName: string,
  reportPeriod: string,
  companyId: string,
): Promise<{ sent: number; failed: number }> {
  const result = { sent: 0, failed: 0 }

  try {
    // Send to all opted-in users in company with appropriate plan
    const users = await sql`
      SELECT
        u.id,
        u.phone_number,
        u.whatsapp_opted_in
      FROM users u
      LEFT JOIN companies c ON c.id = u.company_id
      WHERE
        u.company_id = ${companyId}
        AND u.whatsapp_opted_in = TRUE
        AND u.phone_number IS NOT NULL
        AND c.subscription_plan IN ('growth', 'enterprise')
    `

    for (const user of users as any[]) {
      try {
        await enqueueMessage({
          phoneNumber: user.phone_number,
          templateId: 'board-report-ready',
          variables: {
            reportName,
            reportPeriod,
          },
          priority: 'urgent',
          userId: user.id,
          companyId,
          idempotencyKey: `board-report-${reportId}`,
        })

        result.sent++
      } catch (err) {
        console.error(`[board-report] Failed for user ${user.id}:`, err)
        result.failed++
      }
    }

    return result
  } catch (err) {
    console.error('[board-report-alerts]', err)
    throw err
  }
}

/**
 * Send account alerts (billing, compliance, etc.)
 */
export async function sendAccountAlert(
  userId: string,
  alertType: string,
  alertDetails: string,
  actionRequired: string,
): Promise<void> {
  const userRows = await sql`
    SELECT
      u.id,
      u.phone_number,
      u.company_id,
      u.whatsapp_opted_in,
      c.subscription_plan
    FROM users u
    LEFT JOIN companies c ON c.id = u.company_id
    WHERE u.id = ${userId}
  `

  if (!userRows.length) {
    throw new Error(`User not found: ${userId}`)
  }

  const user = userRows[0] as any
  if (!user.whatsapp_opted_in || !user.phone_number) {
    return
  }

  if (!['growth', 'enterprise'].includes(user.subscription_plan)) {
    return
  }

  await enqueueMessage({
    phoneNumber: user.phone_number,
    templateId: 'account-alert',
    variables: {
      alertType,
      alertDetails,
      actionRequired,
    },
    priority: 'urgent',
    userId,
    companyId: user.company_id,
    idempotencyKey: `alert-${userId}-${alertType}-${Date.now()}`,
  })
}
