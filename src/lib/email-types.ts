/**
 * Email notification types and interfaces
 */

export type EmailStatus = 'pending' | 'sent' | 'failed' | 'retrying' | 'bounced'

export interface EmailLog {
  id: string
  to_email: string
  template_id: string
  subject: string
  status: EmailStatus
  resend_id?: string
  error_message?: string
  sent_at?: string
  created_at: string
  retry_count: number
  next_retry_at?: string
}

export interface QueuedEmail {
  id: string
  to: string
  templateId: string
  variables: Record<string, any>
  userId?: string
  companyId?: string
  tags?: string[]
  enqueuedAt: number
  attempts: number
}

export interface SendEmailResult {
  success: boolean
  messageId?: string
  error?: string
}

export interface EmailTemplate {
  id: string
  subject: (vars: Record<string, any>) => string
  render: (vars: Record<string, any>) => string
}

export interface TaskNotificationPayload {
  userId: string
  taskId: string
  notificationType: 'assigned' | 'due_soon' | 'overdue'
}

export interface AlertNotificationPayload {
  userId: string
  alertTitle: string
  alertMessage: string
  actionUrl?: string
  actionText?: string
}

export interface WeeklySummaryPayload {
  userId: string
}

export interface BoardReportPayload {
  userId?: string
  companyId?: string
  reportTitle: string
  reportHighlights: string[]
  sendToTeam?: boolean
}

export interface EmailServiceConfig {
  maxRetries: number
  retryDelays: number[]
  batchSize: number
  processInterval: number
}

export const DEFAULT_EMAIL_CONFIG: EmailServiceConfig = {
  maxRetries: 3,
  retryDelays: [5000, 30000, 300000], // 5s, 30s, 5m
  batchSize: 10,
  processInterval: 10000, // 10 seconds
}
