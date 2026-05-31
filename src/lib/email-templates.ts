import WelcomeEmail from '@/emails/WelcomeEmail'
import PasswordResetEmail from '@/emails/PasswordResetEmail'
import PlanUpgradeEmail from '@/emails/PlanUpgradeEmail'
import { ReactElement } from 'react'
import { createElement } from 'react'

export type EmailTemplateId =
  | 'welcome'
  | 'password-reset'
  | 'task-reminder'
  | 'notification-alert'
  | 'board-report'
  | 'weekly-summary'
  | 'plan-upgrade'

export interface EmailTemplate {
  id: EmailTemplateId
  subject: (vars: Record<string, any>) => string
  // render can be either a React component or HTML string
  render: (vars: Record<string, any>) => ReactElement | string
}

/**
 * Task reminder email template (HTML)
 */
function taskReminderTemplate(vars: Record<string, any>): string {
  const { name, taskTitle, taskDescription, dueDate, companyName, dashboardUrl } = vars

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 40px 0; background-color: #F7F6F4; }
      .container { max-width: 560px; margin: 0 auto; }
      .header { text-align: center; margin-bottom: 32px; }
      .logo-box { background-color: #1A1A1A; border-radius: 10px; width: 36px; height: 36px; margin: 0 auto; display: flex; align-items: center; justify-content: center; font-size: 18px; }
      .logo-text { font-size: 20px; font-weight: 800; color: #1A1A1A; letter-spacing: -0.5px; margin-left: 10px; }
      .card { background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E5E4E0; padding: 40px; box-shadow: 0 2px 16px rgba(0,0,0,0.06); margin-bottom: 20px; }
      h1 { font-size: 24px; font-weight: 700; color: #1A1A1A; margin: 0 0 8px 0; line-height: 1.3; }
      p { font-size: 15px; color: #717171; margin: 0 0 16px 0; line-height: 1.6; }
      .task-box { background-color: #F7F6F4; border-radius: 12px; padding: 20px; margin-bottom: 28px; border: 1px solid #E5E4E0; }
      .task-title { font-size: 14px; font-weight: 600; color: #1A1A1A; margin: 0 0 8px 0; }
      .task-desc { font-size: 13px; color: #717171; margin: 0 0 8px 0; }
      .task-due { font-size: 12px; color: #9A9A9A; margin: 0; }
      .button { background-color: #1A1A1A; color: #FFFFFF; border-radius: 100px; font-size: 14px; font-weight: 600; padding: 12px 28px; display: inline-block; text-decoration: none; margin: 20px 0; }
      .footer { text-align: center; margin-top: 24px; }
      .footer-text { font-size: 12px; color: #B8B7B3; margin: 0; line-height: 1.6; }
      hr { border: none; border-top: 1px solid #E5E4E0; margin: 28px 0; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <table style="margin: 0 auto;">
          <tr>
            <td>
              <div class="logo-box">🚀</div>
            </td>
            <td>
              <span class="logo-text">IPO<span style="color: #E8312A;">Ready</span></span>
            </td>
          </tr>
        </table>
      </div>

      <div class="card">
        <h1>Task reminder: ${taskTitle}</h1>
        <p>Hi ${name},</p>
        <p>You have a task coming up in your <strong>${companyName}</strong> IPO checklist.</p>

        <div class="task-box">
          <div class="task-title">${taskTitle}</div>
          <div class="task-desc">${taskDescription}</div>
          <div class="task-due">Due: <strong>${dueDate}</strong></div>
        </div>

        <p>Stay on track with your IPO timeline. Every task completed brings you closer to your PACE™ score milestone.</p>

        <a href="${dashboardUrl}" class="button">View task in dashboard →</a>

        <hr>

        <p style="font-size: 12px; color: #717171; margin-top: 20px;">
          You're receiving this reminder because you're assigned to this task. You can update your notification preferences in your account settings.
        </p>
      </div>

      <div class="footer">
        <p class="footer-text">
          IPOReady · hello@ipoready.com<br>
          You're receiving this because you have a task assigned in IPOReady.<br>
          IPOReady is a workflow platform only and does not provide legal, securities or financial advice.
        </p>
      </div>
    </div>
  </body>
</html>`
}

/**
 * Notification alert email template (HTML)
 */
function notificationAlertTemplate(vars: Record<string, any>): string {
  const { name, notificationTitle, notificationMessage, companyName, actionUrl, actionText } = vars

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 40px 0; background-color: #F7F6F4; }
      .container { max-width: 560px; margin: 0 auto; }
      .header { text-align: center; margin-bottom: 32px; }
      .logo-box { background-color: #1A1A1A; border-radius: 10px; width: 36px; height: 36px; margin: 0 auto; display: flex; align-items: center; justify-content: center; font-size: 18px; }
      .logo-text { font-size: 20px; font-weight: 800; color: #1A1A1A; letter-spacing: -0.5px; margin-left: 10px; }
      .card { background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E5E4E0; padding: 40px; box-shadow: 0 2px 16px rgba(0,0,0,0.06); margin-bottom: 20px; }
      h1 { font-size: 24px; font-weight: 700; color: #1A1A1A; margin: 0 0 8px 0; line-height: 1.3; }
      p { font-size: 15px; color: #717171; margin: 0 0 16px 0; line-height: 1.6; }
      .alert-box { background-color: #FDECEB; border-left: 4px solid #E8312A; padding: 20px; margin-bottom: 28px; border-radius: 8px; }
      .alert-message { font-size: 14px; color: #1A1A1A; margin: 0; }
      .button { background-color: #E8312A; color: #FFFFFF; border-radius: 100px; font-size: 14px; font-weight: 600; padding: 12px 28px; display: inline-block; text-decoration: none; margin: 20px 0; }
      .footer { text-align: center; margin-top: 24px; }
      .footer-text { font-size: 12px; color: #B8B7B3; margin: 0; line-height: 1.6; }
      hr { border: none; border-top: 1px solid #E5E4E0; margin: 28px 0; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <table style="margin: 0 auto;">
          <tr>
            <td>
              <div class="logo-box">🚀</div>
            </td>
            <td>
              <span class="logo-text">IPO<span style="color: #E8312A;">Ready</span></span>
            </td>
          </tr>
        </table>
      </div>

      <div class="card">
        <h1>${notificationTitle}</h1>
        <p>Hi ${name},</p>

        <div class="alert-box">
          <p class="alert-message">${notificationMessage}</p>
        </div>

        <p>This notification was triggered in your <strong>${companyName}</strong> workspace.</p>

        ${actionUrl && actionText ? `<a href="${actionUrl}" class="button">${actionText} →</a>` : ''}

        <hr>

        <p style="font-size: 12px; color: #717171; margin-top: 20px;">
          You can manage your notification preferences in your account settings at any time.
        </p>
      </div>

      <div class="footer">
        <p class="footer-text">
          IPOReady · hello@ipoready.com<br>
          You're receiving this notification from IPOReady.<br>
          IPOReady is a workflow platform only and does not provide legal, securities or financial advice.
        </p>
      </div>
    </div>
  </body>
</html>`
}

/**
 * Weekly summary email template (HTML)
 */
function weeklySummaryTemplate(vars: Record<string, any>): string {
  const { name, companyName, tasksCompleted, tasksOverdue, paceScore, dashboardUrl } = vars

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 40px 0; background-color: #F7F6F4; }
      .container { max-width: 560px; margin: 0 auto; }
      .header { text-align: center; margin-bottom: 32px; }
      .logo-box { background-color: #1A1A1A; border-radius: 10px; width: 36px; height: 36px; margin: 0 auto; display: flex; align-items: center; justify-content: center; font-size: 18px; }
      .logo-text { font-size: 20px; font-weight: 800; color: #1A1A1A; letter-spacing: -0.5px; margin-left: 10px; }
      .card { background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E5E4E0; padding: 40px; box-shadow: 0 2px 16px rgba(0,0,0,0.06); margin-bottom: 20px; }
      h1 { font-size: 24px; font-weight: 700; color: #1A1A1A; margin: 0 0 8px 0; line-height: 1.3; }
      p { font-size: 15px; color: #717171; margin: 0 0 16px 0; line-height: 1.6; }
      .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 28px; }
      .stat-box { background-color: #F7F6F4; border-radius: 12px; padding: 20px; border: 1px solid #E5E4E0; text-align: center; }
      .stat-number { font-size: 32px; font-weight: 800; color: #1A1A1A; line-height: 1; margin-bottom: 8px; }
      .stat-label { font-size: 12px; font-weight: 600; color: #9A9A9A; text-transform: uppercase; letter-spacing: 0.05em; }
      .pace-box { background: linear-gradient(135deg, #1A1A1A 0%, #E8312A 100%); border-radius: 12px; padding: 20px; margin-bottom: 28px; color: #FFFFFF; }
      .pace-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,0.8); margin-bottom: 8px; }
      .pace-score { font-size: 48px; font-weight: 800; line-height: 1; }
      .button { background-color: #1A1A1A; color: #FFFFFF; border-radius: 100px; font-size: 14px; font-weight: 600; padding: 12px 28px; display: inline-block; text-decoration: none; margin: 20px 0; }
      .footer { text-align: center; margin-top: 24px; }
      .footer-text { font-size: 12px; color: #B8B7B3; margin: 0; line-height: 1.6; }
      hr { border: none; border-top: 1px solid #E5E4E0; margin: 28px 0; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <table style="margin: 0 auto;">
          <tr>
            <td>
              <div class="logo-box">🚀</div>
            </td>
            <td>
              <span class="logo-text">IPO<span style="color: #E8312A;">Ready</span></span>
            </td>
          </tr>
        </table>
      </div>

      <div class="card">
        <h1>Your IPO progress this week</h1>
        <p>Hi ${name},</p>
        <p>Here's a snapshot of your <strong>${companyName}</strong> IPO readiness this week.</p>

        <div class="stats-grid">
          <div class="stat-box">
            <div class="stat-number">${tasksCompleted || 0}</div>
            <div class="stat-label">Tasks completed</div>
          </div>
          <div class="stat-box">
            <div class="stat-number">${tasksOverdue || 0}</div>
            <div class="stat-label">Overdue tasks</div>
          </div>
        </div>

        <div class="pace-box">
          <div class="pace-label">Your PACE™ Score</div>
          <div class="pace-score">${paceScore || '—'}</div>
        </div>

        <p>Keep moving forward with your IPO timeline. Review any overdue tasks and prioritize the next critical milestones.</p>

        <a href="${dashboardUrl}" class="button">View full dashboard →</a>

        <hr>

        <p style="font-size: 12px; color: #717171; margin-top: 20px;">
          This is your weekly summary. You can change your notification frequency in your account settings.
        </p>
      </div>

      <div class="footer">
        <p class="footer-text">
          IPOReady · hello@ipoready.com<br>
          You're receiving this weekly summary from IPOReady.<br>
          IPOReady is a workflow platform only and does not provide legal, securities or financial advice.
        </p>
      </div>
    </div>
  </body>
</html>`
}

/**
 * Board report email template (HTML)
 */
function boardReportTemplate(vars: Record<string, any>): string {
  const { name, companyName, reportTitle, reportHighlights, dashboardUrl } = vars

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 40px 0; background-color: #F7F6F4; }
      .container { max-width: 560px; margin: 0 auto; }
      .header { text-align: center; margin-bottom: 32px; }
      .logo-box { background-color: #1A1A1A; border-radius: 10px; width: 36px; height: 36px; margin: 0 auto; display: flex; align-items: center; justify-content: center; font-size: 18px; }
      .logo-text { font-size: 20px; font-weight: 800; color: #1A1A1A; letter-spacing: -0.5px; margin-left: 10px; }
      .card { background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E5E4E0; padding: 40px; box-shadow: 0 2px 16px rgba(0,0,0,0.06); margin-bottom: 20px; }
      h1 { font-size: 24px; font-weight: 700; color: #1A1A1A; margin: 0 0 8px 0; line-height: 1.3; }
      p { font-size: 15px; color: #717171; margin: 0 0 16px 0; line-height: 1.6; }
      .highlights { background-color: #F7F6F4; border-radius: 12px; padding: 20px; margin-bottom: 28px; border: 1px solid #E5E4E0; }
      .highlight-item { padding: 12px 0; border-bottom: 1px solid #E5E4E0; }
      .highlight-item:last-child { border-bottom: none; padding-bottom: 0; }
      .highlight-text { font-size: 14px; color: #1A1A1A; margin: 0; }
      .button { background-color: #1A1A1A; color: #FFFFFF; border-radius: 100px; font-size: 14px; font-weight: 600; padding: 12px 28px; display: inline-block; text-decoration: none; margin: 20px 0; }
      .footer { text-align: center; margin-top: 24px; }
      .footer-text { font-size: 12px; color: #B8B7B3; margin: 0; line-height: 1.6; }
      hr { border: none; border-top: 1px solid #E5E4E0; margin: 28px 0; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <table style="margin: 0 auto;">
          <tr>
            <td>
              <div class="logo-box">🚀</div>
            </td>
            <td>
              <span class="logo-text">IPO<span style="color: #E8312A;">Ready</span></span>
            </td>
          </tr>
        </table>
      </div>

      <div class="card">
        <h1>${reportTitle}</h1>
        <p>Hi ${name},</p>
        <p>Board report for <strong>${companyName}</strong>.</p>

        <div class="highlights">
          ${reportHighlights?.map((h: string) => `<div class="highlight-item"><p class="highlight-text">• ${h}</p></div>`).join('')}
        </div>

        <a href="${dashboardUrl}" class="button">Review board report →</a>

        <hr>

        <p style="font-size: 12px; color: #717171; margin-top: 20px;">
          This is a board-level report. Please ensure it's shared only with authorized board members.
        </p>
      </div>

      <div class="footer">
        <p class="footer-text">
          IPOReady · hello@ipoready.com<br>
          Confidential board report from IPOReady.<br>
          IPOReady is a workflow platform only and does not provide legal, securities or financial advice.
        </p>
      </div>
    </div>
  </body>
</html>`
}

export const emailTemplates: Record<EmailTemplateId, EmailTemplate> = {
  'welcome': {
    id: 'welcome',
    subject: (vars) => `Welcome to IPOReady — your IPO command centre is ready`,
    render: (vars) => {
      return createElement(WelcomeEmail, {
        name: vars.name,
        companyName: vars.companyName,
        exchange: vars.exchange,
        loginUrl: vars.loginUrl,
      })
    },
  },
  'password-reset': {
    id: 'password-reset',
    subject: (vars) => `Reset your IPOReady password`,
    render: (vars) => {
      return createElement(PasswordResetEmail, {
        name: vars.name,
        resetUrl: vars.resetUrl,
        expiresInMinutes: vars.expiresInMinutes,
      })
    },
  },
  'task-reminder': {
    id: 'task-reminder',
    subject: (vars) => `Reminder: ${vars.taskTitle} is due ${vars.dueDate}`,
    render: taskReminderTemplate,
  },
  'notification-alert': {
    id: 'notification-alert',
    subject: (vars) => vars.notificationTitle || 'Important notification from IPOReady',
    render: notificationAlertTemplate,
  },
  'weekly-summary': {
    id: 'weekly-summary',
    subject: (vars) => `Your IPO progress this week - ${vars.companyName}`,
    render: weeklySummaryTemplate,
  },
  'board-report': {
    id: 'board-report',
    subject: (vars) => `${vars.reportTitle || 'Board Report'} - ${vars.companyName}`,
    render: boardReportTemplate,
  },
  'plan-upgrade': {
    id: 'plan-upgrade',
    subject: (vars) => `Your ${vars.newPlan} plan is ready`,
    render: (vars) => {
      return createElement(PlanUpgradeEmail, {
        name: vars.name || 'User',
        companyName: vars.companyName || 'Your Company',
        oldPlan: vars.oldPlan || 'Free',
        newPlan: vars.newPlan || 'Growth',
        billingCycle: vars.billingCycle || 'monthly',
        amount: vars.amount || '$99',
        nextBillingDate: vars.nextBillingDate || new Date().toISOString(),
        manageUrl: vars.manageUrl || '/account/billing',
      })
    },
  },
}

/**
 * Get a template by ID
 */
export function getEmailTemplate(templateId: EmailTemplateId): EmailTemplate {
  const template = emailTemplates[templateId]
  if (!template) {
    throw new Error(`Email template not found: ${templateId}`)
  }
  return template
}

/**
 * Render an email template to HTML or React element
 * For React components, return as-is (Resend will handle rendering)
 * For HTML strings, return the HTML
 */
export function renderEmailTemplate(templateId: EmailTemplateId, variables: Record<string, any>): { subject: string; html?: string; react?: ReactElement } {
  const template = getEmailTemplate(templateId)
  const subject = template.subject(variables)
  const rendered = template.render(variables)

  // If it's a React element, return it as react property
  if (typeof rendered === 'object' && rendered !== null && 'type' in rendered) {
    return { subject, react: rendered as ReactElement }
  }

  // Otherwise, it's an HTML string
  return { subject, html: rendered as string }
}
