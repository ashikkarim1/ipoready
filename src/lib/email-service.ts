import { resend, FROM_ADDRESS } from '@/lib/resend'
import { sql, query } from '@/lib/db'
import { renderEmailTemplate, EmailTemplateId } from '@/lib/email-templates'

export interface SendEmailOptions {
  to: string
  templateId: EmailTemplateId
  variables: Record<string, any>
  userId?: string
  companyId?: string
  tags?: string[]
}

interface EmailLog {
  id: string
  to_email: string
  template_id: string
  subject: string
  status: 'pending' | 'sent' | 'failed' | 'retrying'
  resend_id?: string
  error_message?: string
  sent_at?: string
  created_at: string
  retry_count: number
  next_retry_at?: string
}

const MAX_RETRIES = 3
const RETRY_DELAYS = [5000, 30000, 300000] // 5s, 30s, 5m

/**
 * Log email send attempt to database
 */
export async function logEmailToDB(options: {
  to: string
  template_id: string
  subject: string
  status: 'pending' | 'sent' | 'failed'
  resend_id?: string
  error_message?: string
}): Promise<void> {
  try {
    await sql`
      INSERT INTO email_logs (to_email, template_id, subject, status, resend_id, error_message, sent_at)
      VALUES (
        ${options.to},
        ${options.template_id},
        ${options.subject},
        ${options.status},
        ${options.resend_id ?? null},
        ${options.error_message ?? null},
        ${options.status === 'sent' ? new Date().toISOString() : null}
      )
    `
  } catch (err) {
    console.error('[email-service] Failed to log email to DB:', err)
  }
}

/**
 * Send a single email using Resend API
 */
export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const { to, templateId, variables, userId, companyId } = options

  try {
    // Validate email
    if (!to || !to.includes('@')) {
      throw new Error('Invalid email address')
    }

    // Render template
    const { subject, html, react } = renderEmailTemplate(templateId, variables)

    // Attempt to send via Resend
    const hasResendKey = process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.startsWith('re_your')

    if (!hasResendKey) {
      // Graceful fallback: log to console in development
      console.log('[email-service] RESEND_API_KEY not configured. Email would be sent:')
      console.log(`  To: ${to}`)
      console.log(`  Subject: ${subject}`)
      console.log(`  Template: ${templateId}`)

      // Still log to DB
      await logEmailToDB({
        to,
        template_id: templateId,
        subject,
        status: 'pending',
        error_message: 'RESEND_API_KEY not configured',
      })

      return {
        success: true,
        error: 'Email queued (Resend not configured)',
      }
    }

    // Send via Resend (support both React and HTML templates)
    const sendParams: any = {
      from: FROM_ADDRESS,
      to,
      subject,
      tags: options.tags || [],
    }

    if (react) {
      sendParams.react = react
    } else if (html) {
      sendParams.html = html
    }

    const response = await resend.emails.send(sendParams)

    if (response.error) {
      throw new Error(response.error.message || 'Resend API error')
    }

    const messageId = response.data?.id

    // Log success
    await logEmailToDB({
      to,
      template_id: templateId,
      subject,
      status: 'sent',
      resend_id: messageId,
    })

    console.log(`[email-service] Email sent successfully: ${templateId} to ${to} (${messageId})`)

    return {
      success: true,
      messageId,
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[email-service] Failed to send email: ${templateId} to ${to}:`, errorMessage)

    // Log failure
    await logEmailToDB({
      to,
      template_id: templateId,
      subject: variables?.subject || templateId,
      status: 'failed',
      error_message: errorMessage,
    })

    return {
      success: false,
      error: errorMessage,
    }
  }
}

/**
 * Send email with retry logic
 */
export async function sendEmailWithRetry(options: SendEmailOptions, retryCount: number = 0): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const result = await sendEmail(options)

    if (result.success) {
      return result
    }

    // Check if we should retry
    if (retryCount < MAX_RETRIES) {
      const delay = RETRY_DELAYS[retryCount]
      console.log(`[email-service] Scheduling retry ${retryCount + 1}/${MAX_RETRIES} for ${options.to} in ${delay}ms`)

      // Schedule retry
      setTimeout(() => {
        sendEmailWithRetry(options, retryCount + 1).catch(err =>
          console.error('[email-service] Retry failed:', err)
        )
      }, delay)

      return {
        success: false,
        error: `Email queued for retry (attempt ${retryCount + 1})`,
      }
    }

    return result
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error('[email-service] Send email with retry failed:', errorMessage)

    return {
      success: false,
      error: errorMessage,
    }
  }
}

/**
 * Get email logs for a specific email address
 */
export async function getEmailLogs(email: string, limit: number = 50): Promise<EmailLog[]> {
  try {
    const logs = await query<EmailLog>`
      SELECT * FROM email_logs
      WHERE to_email = ${email}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `
    return logs
  } catch (err) {
    console.error('[email-service] Failed to get email logs:', err)
    return []
  }
}

/**
 * Check if email was recently sent (prevent duplicates)
 */
export async function wasEmailRecentlySent(
  to: string,
  templateId: string,
  withinMinutes: number = 5
): Promise<boolean> {
  try {
    const logs = await query<{ count: number }>`
      SELECT COUNT(*) as count FROM email_logs
      WHERE to_email = ${to}
        AND template_id = ${templateId}
        AND status = 'sent'
        AND sent_at > NOW() - INTERVAL '${withinMinutes} minutes'
    `
    return logs.length > 0 && logs[0].count > 0
  } catch (err) {
    console.error('[email-service] Failed to check recent emails:', err)
    return false
  }
}

/**
 * Helper: Send welcome email
 */
export async function sendWelcomeEmail(userId: string, options: {
  name: string
  email: string
  companyName: string
  exchange: string
  loginUrl: string
}): Promise<{ success: boolean; error?: string }> {
  return sendEmailWithRetry({
    to: options.email,
    templateId: 'welcome',
    variables: {
      name: options.name,
      companyName: options.companyName,
      exchange: options.exchange,
      loginUrl: options.loginUrl,
    },
    userId,
    tags: ['welcome', 'onboarding'],
  })
}

/**
 * Helper: Send password reset email
 */
export async function sendPasswordResetEmail(userId: string, options: {
  name: string
  email: string
  resetUrl: string
  expiresInMinutes?: number
}): Promise<{ success: boolean; error?: string }> {
  return sendEmailWithRetry({
    to: options.email,
    templateId: 'password-reset',
    variables: {
      name: options.name,
      resetUrl: options.resetUrl,
      expiresInMinutes: options.expiresInMinutes || 60,
    },
    userId,
    tags: ['password-reset', 'security'],
  })
}

/**
 * Helper: Send task reminder email
 */
export async function sendTaskReminderEmail(userId: string, options: {
  name: string
  email: string
  companyName: string
  taskTitle: string
  taskDescription: string
  dueDate: string
  dashboardUrl: string
}): Promise<{ success: boolean; error?: string }> {
  return sendEmailWithRetry({
    to: options.email,
    templateId: 'task-reminder',
    variables: {
      name: options.name,
      companyName: options.companyName,
      taskTitle: options.taskTitle,
      taskDescription: options.taskDescription,
      dueDate: options.dueDate,
      dashboardUrl: options.dashboardUrl,
    },
    userId,
    tags: ['task', 'reminder'],
  })
}

/**
 * Helper: Send notification alert email
 */
export async function sendNotificationAlertEmail(userId: string, options: {
  name: string
  email: string
  companyName: string
  notificationTitle: string
  notificationMessage: string
  actionUrl?: string
  actionText?: string
}): Promise<{ success: boolean; error?: string }> {
  return sendEmailWithRetry({
    to: options.email,
    templateId: 'notification-alert',
    variables: {
      name: options.name,
      companyName: options.companyName,
      notificationTitle: options.notificationTitle,
      notificationMessage: options.notificationMessage,
      actionUrl: options.actionUrl,
      actionText: options.actionText,
    },
    userId,
    tags: ['notification', 'alert'],
  })
}

/**
 * Helper: Send weekly summary email
 */
export async function sendWeeklySummaryEmail(userId: string, options: {
  name: string
  email: string
  companyName: string
  tasksCompleted: number
  tasksOverdue: number
  paceScore: number
  dashboardUrl: string
}): Promise<{ success: boolean; error?: string }> {
  return sendEmailWithRetry({
    to: options.email,
    templateId: 'weekly-summary',
    variables: {
      name: options.name,
      companyName: options.companyName,
      tasksCompleted: options.tasksCompleted,
      tasksOverdue: options.tasksOverdue,
      paceScore: options.paceScore,
      dashboardUrl: options.dashboardUrl,
    },
    userId,
    tags: ['summary', 'weekly'],
  })
}

/**
 * Helper: Send board report email
 */
export async function sendBoardReportEmail(userId: string, options: {
  name: string
  email: string
  companyName: string
  reportTitle: string
  reportHighlights: string[]
  dashboardUrl: string
}): Promise<{ success: boolean; error?: string }> {
  return sendEmailWithRetry({
    to: options.email,
    templateId: 'board-report',
    variables: {
      name: options.name,
      companyName: options.companyName,
      reportTitle: options.reportTitle,
      reportHighlights: options.reportHighlights,
      dashboardUrl: options.dashboardUrl,
    },
    userId,
    tags: ['report', 'board'],
  })
}
