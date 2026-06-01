import { sql } from '@/lib/db'
import {
  sendTaskReminderEmail,
  sendNotificationAlertEmail,
  sendWeeklySummaryEmail,
  sendBoardReportEmail,
} from '@/lib/email-service'
import { APP_URL } from '@/lib/resend'

/**
 * Notify user of a task assignment or update
 */
export async function notifyUserOfTask(
  userId: string,
  taskId: string,
  notificationType: 'assigned' | 'due_soon' | 'overdue' = 'due_soon'
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get user details
    const userRows = await sql`
      SELECT u.id, u.email, u.name, u.company_id FROM users u
      WHERE u.id = ${userId} LIMIT 1
    `
    if (userRows.length === 0) {
      throw new Error('User not found')
    }

    const user = userRows[0] as any
    const companyId = user.company_id

    // Get task details
    const taskRows = await sql`
      SELECT t.id, t.title, t.description, t.due_date FROM tasks t
      WHERE t.id = ${taskId} LIMIT 1
    `
    if (taskRows.length === 0) {
      throw new Error('Task not found')
    }

    const task = taskRows[0] as any

    // Get company name
    const companyRows = await sql`
      SELECT c.name FROM companies c WHERE c.id = ${companyId} LIMIT 1
    `
    const companyName = companyRows.length > 0 ? (companyRows[0] as any).name : 'IPOReady'

    // Format due date
    const dueDateObj = new Date(task.due_date)
    const dueDate = dueDateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

    // Send email
    return sendTaskReminderEmail(userId, {
      name: user.name,
      email: user.email,
      companyName,
      taskTitle: task.title,
      taskDescription: task.description || 'No description provided',
      dueDate,
      dashboardUrl: `${APP_URL}/dashboard?task=${taskId}`,
    })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error('[email-notifications] notifyUserOfTask failed:', errorMessage)
    return { success: false, error: errorMessage }
  }
}

/**
 * Send notification alert to user
 */
export async function notifyUserOfAlert(
  userId: string,
  alertTitle: string,
  alertMessage: string,
  actionUrl?: string,
  actionText?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get user details
    const userRows = await sql`
      SELECT u.id, u.email, u.name, u.company_id FROM users u
      WHERE u.id = ${userId} LIMIT 1
    `
    if (userRows.length === 0) {
      throw new Error('User not found')
    }

    const user = userRows[0] as any
    const companyId = user.company_id

    // Get company name
    const companyRows = await sql`
      SELECT c.name FROM companies c WHERE c.id = ${companyId} LIMIT 1
    `
    const companyName = companyRows.length > 0 ? (companyRows[0] as any).name : 'IPOReady'

    // Send email
    return sendNotificationAlertEmail(userId, {
      name: user.name,
      email: user.email,
      companyName,
      notificationTitle: alertTitle,
      notificationMessage: alertMessage,
      actionUrl: actionUrl || undefined,
      actionText: actionText || undefined,
    })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error('[email-notifications] notifyUserOfAlert failed:', errorMessage)
    return { success: false, error: errorMessage }
  }
}

/**
 * Send team members a notification alert
 */
export async function notifyTeamOfAlert(
  companyId: string,
  alertTitle: string,
  alertMessage: string,
  actionUrl?: string,
  actionText?: string,
  excludeUserIds: string[] = []
): Promise<{ success: number; failed: number; errors: string[] }> {
  try {
    // Get all team members for the company
    const teamRows = await sql`
      SELECT DISTINCT tm.user_id FROM team_members tm
      WHERE tm.company_id = ${companyId}
        AND tm.user_id NOT IN (${excludeUserIds.join(',')})
      LIMIT 100
    `

    let successCount = 0
    let failureCount = 0
    const errors: string[] = []

    for (const row of teamRows) {
      const result = await notifyUserOfAlert(
        (row as any).user_id,
        alertTitle,
        alertMessage,
        actionUrl,
        actionText
      )

      if (result.success) {
        successCount++
      } else {
        failureCount++
        if (result.error) {
          errors.push(result.error)
        }
      }
    }

    console.log(`[email-notifications] Notified team: ${successCount} success, ${failureCount} failed`)

    return { success: successCount, failed: failureCount, errors }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error('[email-notifications] notifyTeamOfAlert failed:', errorMessage)
    return { success: 0, failed: 0, errors: [errorMessage] }
  }
}

/**
 * Send weekly summary to user
 */
export async function sendWeeklySummary(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Get user details
    const userRows = await sql`
      SELECT u.id, u.email, u.name, u.company_id FROM users u
      WHERE u.id = ${userId} LIMIT 1
    `
    if (userRows.length === 0) {
      throw new Error('User not found')
    }

    const user = userRows[0] as any
    const companyId = user.company_id

    // Get company name
    const companyRows = await sql`
      SELECT c.name, c.pace_score FROM companies c WHERE c.id = ${companyId} LIMIT 1
    `
    if (companyRows.length === 0) {
      throw new Error('Company not found')
    }

    const company = companyRows[0] as any

    // Get weekly stats
    const tasksCompletedRows = await sql`
      SELECT COUNT(*) as count FROM tasks
      WHERE company_id = ${companyId}
        AND completed_at >= NOW() - INTERVAL '7 days'
    `
    const tasksCompleted = (tasksCompletedRows[0] as any).count || 0

    const tasksOverdueRows = await sql`
      SELECT COUNT(*) as count FROM tasks
      WHERE company_id = ${companyId}
        AND status != 'completed'
        AND due_date < NOW()
    `
    const tasksOverdue = (tasksOverdueRows[0] as any).count || 0

    // Send email
    return sendWeeklySummaryEmail(userId, {
      name: user.name,
      email: user.email,
      companyName: company.name,
      tasksCompleted,
      tasksOverdue,
      paceScore: company.pace_score || 0,
      dashboardUrl: `${APP_URL}/dashboard`,
    })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error('[email-notifications] sendWeeklySummary failed:', errorMessage)
    return { success: false, error: errorMessage }
  }
}

/**
 * Send board report to user
 */
export async function sendBoardReport(
  userId: string,
  reportTitle: string,
  reportHighlights: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get user details
    const userRows = await sql`
      SELECT u.id, u.email, u.name, u.company_id FROM users u
      WHERE u.id = ${userId} LIMIT 1
    `
    if (userRows.length === 0) {
      throw new Error('User not found')
    }

    const user = userRows[0] as any
    const companyId = user.company_id

    // Get company name
    const companyRows = await sql`
      SELECT c.name FROM companies c WHERE c.id = ${companyId} LIMIT 1
    `
    if (companyRows.length === 0) {
      throw new Error('Company not found')
    }

    const company = companyRows[0] as any

    // Send email
    return sendBoardReportEmail(userId, {
      name: user.name,
      email: user.email,
      companyName: company.name,
      reportTitle,
      reportHighlights,
      dashboardUrl: `${APP_URL}/dashboard`,
    })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error('[email-notifications] sendBoardReport failed:', errorMessage)
    return { success: false, error: errorMessage }
  }
}

/**
 * Send task reminders to users with overdue or due-today tasks
 */
export async function sendTaskReminders(): Promise<{ sent: number; failed: number }> {
  try {
    // Find all tasks due today or overdue
    const tasksRows = await sql`
      SELECT t.id, t.assigned_to, t.title, t.description, t.due_date, c.name as company_name
      FROM tasks t
      JOIN companies c ON c.id = t.company_id
      WHERE t.assigned_to IS NOT NULL
        AND t.status != 'completed'
        AND DATE(t.due_date) <= DATE(NOW())
        AND DATE(t.due_date) > DATE(NOW() - INTERVAL '1 day')
      LIMIT 100
    `

    let sent = 0
    let failed = 0

    for (const task of tasksRows) {
      const result = await notifyUserOfTask((task as any).assigned_to, (task as any).id, 'due_soon')
      if (result.success) {
        sent++
      } else {
        failed++
      }
    }

    console.log(`[email-notifications] Sent task reminders: ${sent} sent, ${failed} failed`)

    return { sent, failed }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error('[email-notifications] sendTaskReminders failed:', errorMessage)
    return { sent: 0, failed: 1 }
  }
}

/**
 * Send billing notification emails (bridges Stripe webhooks to new billing-notifications module)
 */
export async function sendBillingNotificationEmail(
  companyEmail: string,
  companyName: string,
  eventType: 'subscription_renewed' | 'subscription_cancelled' | 'payment_failed' | 'payment_succeeded',
  variables: Record<string, any>
): Promise<void> {
  try {
    // Get company ID from email
    const companies = await sql`
      SELECT id FROM companies WHERE email = ${companyEmail} LIMIT 1
    `

    if (companies.length === 0) {
      console.warn(`[email-notifications] Company not found for email: ${companyEmail}`)
      return
    }

    const companyId = (companies[0] as any).id

    // Import and call appropriate billing notification function
    const {
      sendSubscriptionRenewedEmail,
      sendSubscriptionCancelledEmail,
      sendPaymentFailedEmail,
      sendPaymentSucceededEmail,
    } = await import('@/lib/billing-notifications')

    switch (eventType) {
      case 'subscription_renewed':
        await sendSubscriptionRenewedEmail(companyId, variables.plan || 'growth')
        break
      case 'subscription_cancelled':
        await sendSubscriptionCancelledEmail(companyId)
        break
      case 'payment_failed':
        // Amount is in cents, convert to dollars for display
        const amount = variables.amount || 0
        await sendPaymentFailedEmail(companyId, amount)
        break
      case 'payment_succeeded':
        await sendPaymentSucceededEmail(companyId, variables)
        break
      default:
        console.warn(`[email-notifications] Unknown billing event type: ${eventType}`)
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error(
      `[email-notifications] sendBillingNotificationEmail failed for ${companyEmail}:`,
      errorMessage
    )
    throw err
  }
}
