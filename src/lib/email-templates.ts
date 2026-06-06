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
  | 'demo-confirmation'
  | 'lead-confirmation'

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

/**
 * Demo confirmation email template (HTML)
 * World-class enterprise template for demo request confirmations
 */
function demoConfirmationTemplate(vars: Record<string, any>): string {
  const { name, companyName, supportEmail = 'hello@ipoready.ai' } = vars

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 40px 0; background-color: #F7F6F4; }
      .container { max-width: 600px; margin: 0 auto; padding: 0 20px; }
      .preheader { display: none; font-size: 1px; color: #F7F6F4; line-height: 1px; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; }
      .header { text-align: center; margin-bottom: 40px; padding-top: 20px; }
      .logo { font-size: 28px; margin-bottom: 8px; }
      .logo-text { font-size: 22px; font-weight: 800; color: #1A1A1A; letter-spacing: -0.5px; margin: 0; }
      .logo-text .accent { color: #E8312A; }
      .card { background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E5E4E0; padding: 48px 40px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); margin-bottom: 24px; }
      h1 { font-size: 28px; font-weight: 700; color: #1A1A1A; margin: 0 0 12px 0; line-height: 1.3; letter-spacing: -0.5px; }
      h2 { font-size: 18px; font-weight: 700; color: #1A1A1A; margin: 32px 0 16px 0; line-height: 1.3; }
      p { font-size: 16px; color: #4F4F4F; margin: 0 0 20px 0; line-height: 1.6; }
      .success-box { background: linear-gradient(135deg, #F0FDF4 0%, #FAFAF8 100%); border-left: 4px solid #22C55E; border-radius: 12px; padding: 24px; margin-bottom: 32px; }
      .success-icon { font-size: 32px; margin-bottom: 12px; }
      .success-title { font-size: 16px; font-weight: 700; color: #1A1A1A; margin-bottom: 8px; }
      .success-text { font-size: 14px; color: #4F4F4F; margin: 0; }
      .feature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 32px; }
      .feature-item { background-color: #F7F6F4; border-radius: 12px; padding: 20px; border: 1px solid #E5E4E0; }
      .feature-icon { font-size: 24px; margin-bottom: 12px; }
      .feature-title { font-size: 14px; font-weight: 700; color: #1A1A1A; margin-bottom: 8px; }
      .feature-text { font-size: 13px; color: #717171; margin: 0; line-height: 1.5; }
      .timeline { margin-bottom: 32px; }
      .timeline-item { display: flex; gap: 16px; margin-bottom: 20px; }
      .timeline-dot { width: 24px; height: 24px; background-color: #E8312A; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: 700; margin-top: 2px; }
      .timeline-content h4 { font-size: 14px; font-weight: 700; color: #1A1A1A; margin: 0 0 4px 0; }
      .timeline-content p { font-size: 13px; color: #717171; margin: 0; line-height: 1.5; }
      .cta-primary { background-color: #E8312A; color: #FFFFFF; border-radius: 100px; font-size: 15px; font-weight: 700; padding: 14px 32px; display: inline-block; text-decoration: none; margin: 24px 0; transition: all 0.2s; }
      .cta-primary:hover { background-color: #D02420; }
      .divider { border: none; border-top: 1px solid #E5E4E0; margin: 32px 0; }
      .footer { background-color: #FAFAF8; border-radius: 12px; padding: 24px; text-align: center; margin-top: 32px; border: 1px solid #E5E4E0; }
      .footer-title { font-size: 12px; font-weight: 700; color: #1A1A1A; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
      .footer-text { font-size: 13px; color: #717171; margin: 0 0 8px 0; line-height: 1.6; }
      .footer-link { color: #E8312A; text-decoration: none; font-weight: 600; }
      .footer-link:hover { text-decoration: underline; }
      .legal { font-size: 11px; color: #999; margin-top: 16px; padding-top: 16px; border-top: 1px solid #E5E4E0; line-height: 1.6; }
      @media (max-width: 600px) {
        .card { padding: 32px 24px; }
        h1 { font-size: 24px; }
        .feature-grid { grid-template-columns: 1fr; gap: 16px; }
      }
    </style>
  </head>
  <body>
    <div class="preheader">Your demo is confirmed. One step closer to IPO readiness.</div>

    <div class="container">
      <div class="header">
        <div class="logo">🚀</div>
        <p class="logo-text">IPO<span class="accent">Ready</span></p>
      </div>

      <div class="card">
        <h1>Demo confirmed ✓</h1>
        <p>Hi ${name},</p>
        <p>Thank you for requesting a demo of IPOReady. We're excited to show you how companies like <strong>${companyName}</strong> manage their IPO journey with our platform.</p>

        <div class="success-box">
          <div class="success-icon">✨</div>
          <div class="success-title">You're all set</div>
          <div class="success-text">Our team will reach out within 24 hours to schedule your personalized demo.</div>
        </div>

        <h2>What to expect</h2>

        <div class="timeline">
          <div class="timeline-item">
            <div class="timeline-dot">1</div>
            <div class="timeline-content">
              <h4>Within 24 hours</h4>
              <p>You'll receive a calendar invite with your demo meeting time.</p>
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-dot">2</div>
            <div class="timeline-content">
              <h4>During the demo</h4>
              <p>We'll walk through your company's IPO readiness (PACE™ score), filing requirements, and timeline.</p>
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-dot">3</div>
            <div class="timeline-content">
              <h4>Next steps</h4>
              <p>Discuss pricing, implementation, and how we can support your IPO journey.</p>
            </div>
          </div>
        </div>

        <h2>Why IPOReady</h2>

        <div class="feature-grid">
          <div class="feature-item">
            <div class="feature-icon">📊</div>
            <div class="feature-title">PACE™ Score</div>
            <div class="feature-text">Know your IPO readiness at a glance with our proprietary framework.</div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">✅</div>
            <div class="feature-title">Task Management</div>
            <div class="feature-text">Organize and track every step of your IPO preparation.</div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">📁</div>
            <div class="feature-title">Document Hub</div>
            <div class="feature-text">Centralize all IPO-related docs, filings, and compliance items.</div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">👥</div>
            <div class="feature-title">Team Collaboration</div>
            <div class="feature-text">Keep your board, advisors, and stakeholders aligned.</div>
          </div>
        </div>

        <div class="divider"></div>

        <p style="text-align: center; font-size: 14px; color: #717171;">Have questions before your demo?<br>
        Reach out to us at <a href="mailto:${supportEmail}" style="color: #E8312A; text-decoration: none; font-weight: 600;">${supportEmail}</a></p>
      </div>

      <div class="footer">
        <div class="footer-title">Questions?</div>
        <p class="footer-text">Our team is ready to help. <a href="mailto:${supportEmail}" class="footer-link">Contact support</a></p>
        <p class="footer-text">Follow us on <a href="https://linkedin.com/company/ipoready" class="footer-link">LinkedIn</a> for IPO insights and updates.</p>
        <div class="legal">
          IPOReady · <a href="https://ipoready.ai" class="footer-link">ipoready.ai</a><br>
          This is a transactional email confirming your demo request. <a href="https://ipoready.ai/unsubscribe" class="footer-link">Manage preferences</a><br>
          IPOReady is a workflow platform and does not provide legal, securities, or financial advice.
        </div>
      </div>
    </div>
  </body>
</html>`
}

/**
 * Lead confirmation email template (HTML)
 * World-class enterprise template for lead capture confirmations
 */
function leadConfirmationTemplate(vars: Record<string, any>): string {
  const { name, companyName, trialDays = 14, dashboardUrl = 'https://app.ipoready.ai', supportEmail = 'hello@ipoready.ai' } = vars

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 40px 0; background-color: #F7F6F4; }
      .container { max-width: 600px; margin: 0 auto; padding: 0 20px; }
      .preheader { display: none; font-size: 1px; color: #F7F6F4; line-height: 1px; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; }
      .header { text-align: center; margin-bottom: 40px; padding-top: 20px; }
      .logo { font-size: 28px; margin-bottom: 8px; }
      .logo-text { font-size: 22px; font-weight: 800; color: #1A1A1A; letter-spacing: -0.5px; margin: 0; }
      .logo-text .accent { color: #E8312A; }
      .card { background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E5E4E0; padding: 48px 40px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); margin-bottom: 24px; }
      h1 { font-size: 28px; font-weight: 700; color: #1A1A1A; margin: 0 0 12px 0; line-height: 1.3; letter-spacing: -0.5px; }
      h2 { font-size: 18px; font-weight: 700; color: #1A1A1A; margin: 32px 0 16px 0; line-height: 1.3; }
      p { font-size: 16px; color: #4F4F4F; margin: 0 0 20px 0; line-height: 1.6; }
      .welcome-box { background: linear-gradient(135deg, #F0FDFF 0%, #F5F9FF 100%); border-left: 4px solid #06B6D4; border-radius: 12px; padding: 24px; margin-bottom: 32px; }
      .welcome-icon { font-size: 32px; margin-bottom: 12px; }
      .welcome-title { font-size: 16px; font-weight: 700; color: #1A1A1A; margin-bottom: 8px; }
      .welcome-text { font-size: 14px; color: #4F4F4F; margin: 0; line-height: 1.6; }
      .cta-box { background-color: #F7F6F4; border-radius: 12px; padding: 28px; margin-bottom: 32px; border: 1px solid #E5E4E0; }
      .cta-label { font-size: 12px; font-weight: 700; color: #717171; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
      .cta-primary { background-color: #E8312A; color: #FFFFFF; border-radius: 100px; font-size: 15px; font-weight: 700; padding: 14px 32px; display: block; text-decoration: none; text-align: center; margin: 16px 0 0 0; transition: all 0.2s; }
      .cta-primary:hover { background-color: #D02420; }
      .benefits { margin-bottom: 32px; }
      .benefit-item { display: flex; gap: 16px; margin-bottom: 18px; }
      .benefit-icon { font-size: 20px; flex-shrink: 0; }
      .benefit-content h4 { font-size: 14px; font-weight: 700; color: #1A1A1A; margin: 0 0 4px 0; }
      .benefit-content p { font-size: 13px; color: #717171; margin: 0; line-height: 1.5; }
      .trial-badge { display: inline-block; background-color: #FEF3F2; border: 1px solid #FED7D3; border-radius: 100px; padding: 8px 16px; font-size: 12px; font-weight: 700; color: #E8312A; margin-bottom: 16px; }
      .divider { border: none; border-top: 1px solid #E5E4E0; margin: 32px 0; }
      .footer { background-color: #FAFAF8; border-radius: 12px; padding: 24px; text-align: center; margin-top: 32px; border: 1px solid #E5E4E0; }
      .footer-title { font-size: 12px; font-weight: 700; color: #1A1A1A; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
      .footer-text { font-size: 13px; color: #717171; margin: 0 0 8px 0; line-height: 1.6; }
      .footer-link { color: #E8312A; text-decoration: none; font-weight: 600; }
      .footer-link:hover { text-decoration: underline; }
      .legal { font-size: 11px; color: #999; margin-top: 16px; padding-top: 16px; border-top: 1px solid #E5E4E0; line-height: 1.6; }
      @media (max-width: 600px) {
        .card { padding: 32px 24px; }
        h1 { font-size: 24px; }
        .cta-box { padding: 20px; }
      }
    </style>
  </head>
  <body>
    <div class="preheader">Welcome to IPOReady. Your ${trialDays}-day free trial is ready.</div>

    <div class="container">
      <div class="header">
        <div class="logo">🚀</div>
        <p class="logo-text">IPO<span class="accent">Ready</span></p>
      </div>

      <div class="card">
        <h1>Welcome to IPOReady 🎉</h1>
        <p>Hi ${name},</p>
        <p>Thank you for signing up! Your free ${trialDays}-day trial of IPOReady is now active. You're joining companies across North America who use IPOReady to manage their IPO preparation with clarity and confidence.</p>

        <div class="welcome-box">
          <div class="welcome-icon">✅</div>
          <div class="welcome-title">You're all set</div>
          <div class="welcome-text">Your trial account for <strong>${companyName}</strong> is ready to go. No credit card required. Full feature access included.</div>
        </div>

        <div class="cta-box">
          <div class="cta-label">Get Started Now</div>
          <p style="font-size: 14px; color: #717171; margin: 0 0 16px 0;">Log in to your dashboard and begin setting up your IPO timeline.</p>
          <a href="${dashboardUrl}" class="cta-primary">Access Your Dashboard →</a>
        </div>

        <h2>What you can do now</h2>

        <div class="benefits">
          <div class="benefit-item">
            <div class="benefit-icon">📊</div>
            <div class="benefit-content">
              <h4>Calculate Your PACE™ Score</h4>
              <p>Get your IPO readiness score based on company financials, governance, and preparation stage.</p>
            </div>
          </div>
          <div class="benefit-item">
            <div class="benefit-icon">✅</div>
            <div class="benefit-content">
              <h4>Create Your IPO Checklist</h4>
              <p>Set up your roadmap with pre-built checklists for US, Canada, and other exchanges.</p>
            </div>
          </div>
          <div class="benefit-item">
            <div class="benefit-icon">📁</div>
            <div class="benefit-content">
              <h4>Build Your Data Room</h4>
              <p>Organize prospectuses, financial statements, legal docs, and regulatory filings in one hub.</p>
            </div>
          </div>
          <div class="benefit-item">
            <div class="benefit-icon">👥</div>
            <div class="benefit-content">
              <h4>Invite Your Team</h4>
              <p>Add board members, advisors, lawyers, and accountants to collaborate in real time.</p>
            </div>
          </div>
        </div>

        <div class="trial-badge">Free trial · ${trialDays} days remaining</div>

        <h2>Next steps</h2>
        <p>We recommend completing these in order:</p>
        <ol style="color: #4F4F4F; line-height: 1.8; margin: 0 0 20px 0;">
          <li><strong>Set your company details</strong> (location, industry, stage)</li>
          <li><strong>Run your PACE™ score</strong> to understand readiness gaps</li>
          <li><strong>Create your exchange checklist</strong> (TSX, NASDAQ, NYSE, TSXV, etc.)</li>
          <li><strong>Invite team members</strong> and assign roles</li>
          <li><strong>Schedule a walkthrough call</strong> with our team</li>
        </ol>

        <div class="divider"></div>

        <p>Have questions about your trial or how to get started? <strong>Our team is here to help.</strong></p>
        <p style="font-size: 14px; color: #717171;">Email us at <a href="mailto:${supportEmail}" style="color: #E8312A; text-decoration: none; font-weight: 600;">${supportEmail}</a> or schedule a guided walkthrough from your dashboard.</p>
      </div>

      <div class="footer">
        <div class="footer-title">Need help?</div>
        <p class="footer-text">Check out our <a href="https://help.ipoready.ai" class="footer-link">help center</a> or <a href="mailto:${supportEmail}" class="footer-link">contact support</a></p>
        <p class="footer-text">Follow <a href="https://linkedin.com/company/ipoready" class="footer-link">IPOReady on LinkedIn</a> for IPO insights, market updates, and regulatory changes.</p>
        <div class="legal">
          IPOReady · <a href="https://ipoready.ai" class="footer-link">ipoready.ai</a><br>
          Congratulations on taking this step toward your IPO. We look forward to supporting your journey.<br>
          <a href="https://ipoready.ai/unsubscribe" class="footer-link">Manage preferences</a><br>
          IPOReady is a workflow platform and does not provide legal, securities, or financial advice.
        </div>
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
  'demo-confirmation': {
    id: 'demo-confirmation',
    subject: (vars) => `Your IPOReady demo is confirmed`,
    render: demoConfirmationTemplate,
  },
  'lead-confirmation': {
    id: 'lead-confirmation',
    subject: (vars) => `Welcome to IPOReady — Your ${vars.trialDays || 14}-day free trial is ready`,
    render: leadConfirmationTemplate,
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
