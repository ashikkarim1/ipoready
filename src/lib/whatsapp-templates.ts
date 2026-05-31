/**
 * WhatsApp Message Templates
 * All templates kept under 1024 chars (WhatsApp limit)
 * Support variable interpolation and action buttons
 */

export type TemplateId =
  | 'task-reminder'
  | 'milestone-alert'
  | 'daily-pulse'
  | 'document-ready'
  | 'board-report-ready'
  | 'account-alert'

export interface MessageTemplate {
  id: TemplateId
  body: string
  buttons?: { emoji: string; text: string; action?: string }[]
}

/**
 * Interpolate variables into template body
 * Variables are marked as {{variableName}}
 */
export function interpolateTemplate(body: string, variables: Record<string, any>): string {
  return body.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = variables[key]
    return value !== undefined && value !== null ? String(value) : match
  })
}

const TEMPLATES: Record<TemplateId, MessageTemplate> = {
  'task-reminder': {
    id: 'task-reminder',
    body: `📋 *Task Reminder* — {{taskName}}

Due: {{dueDate}}
Priority: {{priority}}

Your IPO readiness depends on staying on track. Complete this task to keep momentum 🚀`,
    buttons: [
      { emoji: '✓', text: 'Mark Complete', action: 'complete_task' },
      { emoji: '📱', text: 'View Details', action: 'view_task' },
    ],
  },

  'milestone-alert': {
    id: 'milestone-alert',
    body: `🎯 *Milestone Alert* — {{milestoneName}}

Status: {{status}}
Progress: {{progressPercent}}%
Next Step: {{nextStep}}

You're making great progress on your IPO journey! 💪`,
    buttons: [
      { emoji: '👁️', text: 'Review Progress', action: 'view_milestone' },
    ],
  },

  'daily-pulse': {
    id: 'daily-pulse',
    body: `📊 *Daily IPO Pulse* — {{date}}

Tasks Due Today: {{tasksDueToday}}
Milestones on Track: {{milestonesOnTrack}}
Overall Progress: {{overallProgress}}%

{{briefInsight}}

Stay focused. Your IPO readiness matters! 🚀`,
    buttons: [
      { emoji: '📈', text: 'View Dashboard', action: 'view_dashboard' },
    ],
  },

  'document-ready': {
    id: 'document-ready',
    body: `📄 *Document Ready for Review*

Document: {{documentName}}
Type: {{documentType}}
Requested By: {{requestedBy}}

Review and approve to keep your IPO process moving 📋`,
    buttons: [
      { emoji: '✓', text: 'Review Now', action: 'review_document' },
      { emoji: '📤', text: 'Upload Alternative', action: 'upload_document' },
    ],
  },

  'board-report-ready': {
    id: 'board-report-ready',
    body: `📊 *Board Report Ready*

Report: {{reportName}}
Period: {{reportPeriod}}
Status: Ready for review

Your board needs this report for approval. Review and share ASAP 📋`,
    buttons: [
      { emoji: '👁️', text: 'View Report', action: 'view_report' },
      { emoji: '📤', text: 'Share with Board', action: 'share_report' },
    ],
  },

  'account-alert': {
    id: 'account-alert',
    body: `⚠️ *Account Alert*

Alert: {{alertType}}
Details: {{alertDetails}}
Action Required: {{actionRequired}}

Please address this immediately to avoid delays in your IPO process 🔔`,
    buttons: [
      { emoji: '✓', text: 'Resolve', action: 'resolve_alert' },
      { emoji: '❓', text: 'Get Help', action: 'contact_support' },
    ],
  },
}

/**
 * Get a template by ID
 */
export function getTemplate(templateId: TemplateId): MessageTemplate {
  const template = TEMPLATES[templateId]
  if (!template) {
    throw new Error(`Unknown template: ${templateId}`)
  }
  return template
}

/**
 * Render a complete WhatsApp message from template and variables
 */
export function renderWhatsAppMessage(
  templateId: TemplateId,
  variables: Record<string, any>,
): string {
  const template = getTemplate(templateId)
  const body = interpolateTemplate(template.body, variables)

  // Validate length
  if (body.length > 1024) {
    throw new Error(`Message exceeds 1024 char limit: ${body.length} chars`)
  }

  return body
}

/**
 * Get all available template IDs
 */
export function getTemplateIds(): TemplateId[] {
  return Object.keys(TEMPLATES) as TemplateId[]
}

/**
 * Validate template variables
 */
export function validateTemplateVariables(
  templateId: TemplateId,
  variables: Record<string, any>,
): { valid: boolean; missing: string[] } {
  const template = getTemplate(templateId)
  const placeholders = template.body.match(/\{\{(\w+)\}\}/g) || []
  const placeholderNames = placeholders.map(p => p.slice(2, -2))

  const missing = placeholderNames.filter(name => {
    const value = variables[name]
    return value === undefined || value === null || value === ''
  })

  return {
    valid: missing.length === 0,
    missing,
  }
}
