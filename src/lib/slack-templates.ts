/**
 * Slack Message Templates using Block Kit
 * All templates use Slack Block Kit format for rich formatting
 */

export type SlackTemplateId =
  | 'task-assigned'
  | 'task-due'
  | 'task-completed'
  | 'milestone-achieved'
  | 'document-shared'
  | 'board-report-ready'
  | 'account-alert'
  | 'team-joined'
  | 'payment-received'

export interface SlackTemplate {
  id: SlackTemplateId
  name: string
  description: string
  color: string // hex color for sidebar
  blocks: (vars: Record<string, any>) => any[]
}

/**
 * Task Assigned Template
 */
const taskAssignedTemplate: SlackTemplate = {
  id: 'task-assigned',
  name: 'Task Assigned',
  description: 'Notify user when a task is assigned to them',
  color: '#0099FF',
  blocks: (vars) => [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '📋 New Task Assigned',
        emoji: true,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${vars.taskTitle || 'Task'}*\n${vars.taskDescription || 'No description provided'}`,
      },
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Assigned by*\n${vars.assignedByName || 'Team'}`,
        },
        {
          type: 'mrkdwn',
          text: `*Due Date*\n${vars.dueDate || 'No due date'}`,
        },
      ],
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Company*\n${vars.companyName || 'Unknown'}`,
      },
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'View Task',
            emoji: true,
          },
          value: 'view_task',
          url: vars.taskUrl || '',
          style: 'primary',
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Update Status',
            emoji: true,
          },
          value: 'update_status',
          url: vars.dashboardUrl || '',
        },
      ],
    },
  ],
}

/**
 * Task Due Soon Template
 */
const taskDueTemplate: SlackTemplate = {
  id: 'task-due',
  name: 'Task Due Soon',
  description: 'Remind user about upcoming task deadline',
  color: '#FF9900',
  blocks: (vars) => [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '⏰ Task Due Soon',
        emoji: true,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${vars.taskTitle || 'Task'}*\n${vars.taskDescription || 'No description'}`,
      },
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Due Date*\n${vars.dueDate || 'Soon'}`,
        },
        {
          type: 'mrkdwn',
          text: `*Time Remaining*\n${vars.timeRemaining || 'Less than 24 hours'}`,
        },
      ],
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Company*\n${vars.companyName || 'Unknown'}`,
      },
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'View Task',
            emoji: true,
          },
          value: 'view_task',
          url: vars.taskUrl || '',
          style: 'primary',
        },
      ],
    },
  ],
}

/**
 * Task Completed Template
 */
const taskCompletedTemplate: SlackTemplate = {
  id: 'task-completed',
  name: 'Task Completed',
  description: 'Celebrate task completion',
  color: '#36A64F',
  blocks: (vars) => [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '✅ Task Completed',
        emoji: true,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${vars.taskTitle || 'Task'}*\n_Completed by ${vars.completedByName || 'User'}_`,
      },
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Completed*\n${vars.completedAt || 'Just now'}`,
        },
        {
          type: 'mrkdwn',
          text: `*Company*\n${vars.companyName || 'Unknown'}`,
        },
      ],
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `Great progress on your IPO readiness! :tada:`,
        },
      ],
    },
  ],
}

/**
 * Milestone Achieved Template
 */
const milestoneAchievedTemplate: SlackTemplate = {
  id: 'milestone-achieved',
  name: 'Milestone Achieved',
  description: 'Celebrate achieving a major milestone',
  color: '#36A64F',
  blocks: (vars) => [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '🎯 Milestone Achieved!',
        emoji: true,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${vars.milestoneName || 'Milestone'}*\n${vars.milestoneDescription || 'You\'ve reached an important checkpoint'}`,
      },
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Phase*\n${vars.phase || 'IPO Readiness'}`,
        },
        {
          type: 'mrkdwn',
          text: `*Achieved on*\n${vars.achievedDate || 'Today'}`,
        },
      ],
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Company*\n${vars.companyName || 'Unknown'}`,
      },
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'View Progress',
            emoji: true,
          },
          value: 'view_progress',
          url: vars.dashboardUrl || '',
          style: 'primary',
        },
      ],
    },
  ],
}

/**
 * Document Shared Template
 */
const documentSharedTemplate: SlackTemplate = {
  id: 'document-shared',
  name: 'Document Shared',
  description: 'Notify when a document is shared with the team',
  color: '#0099FF',
  blocks: (vars) => [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '📄 Document Shared',
        emoji: true,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${vars.documentName || 'Document'}*\n${vars.documentDescription || 'A new document has been shared'}`,
      },
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Shared by*\n${vars.sharedByName || 'Team'}`,
        },
        {
          type: 'mrkdwn',
          text: `*Type*\n${vars.documentType || 'Document'}`,
        },
      ],
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Company*\n${vars.companyName || 'Unknown'}`,
      },
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'View Document',
            emoji: true,
          },
          value: 'view_document',
          url: vars.documentUrl || '',
          style: 'primary',
        },
      ],
    },
  ],
}

/**
 * Board Report Ready Template
 */
const boardReportReadyTemplate: SlackTemplate = {
  id: 'board-report-ready',
  name: 'Board Report Ready',
  description: 'Notify when board report is ready for review',
  color: '#FF6B35',
  blocks: (vars) => [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '📊 Board Report Ready',
        emoji: true,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `Your board report for ${vars.month || 'this month'} is ready for review`,
      },
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Period*\n${vars.period || 'Monthly'}`,
        },
        {
          type: 'mrkdwn',
          text: `*Company*\n${vars.companyName || 'Unknown'}`,
        },
      ],
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Review Report',
            emoji: true,
          },
          value: 'review_report',
          url: vars.reportUrl || '',
          style: 'primary',
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Approve',
            emoji: true,
          },
          value: 'approve',
          url: vars.approveUrl || '',
        },
      ],
    },
  ],
}

/**
 * Account Alert Template
 */
const accountAlertTemplate: SlackTemplate = {
  id: 'account-alert',
  name: 'Account Alert',
  description: 'Alert about account or billing issues',
  color: '#FF0000',
  blocks: (vars) => [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '⚠️ Account Alert',
        emoji: true,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${vars.alertTitle || 'Alert'}*\n${vars.alertMessage || 'There\'s an issue with your account'}`,
      },
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Severity*\n${vars.severity || 'Medium'}`,
        },
        {
          type: 'mrkdwn',
          text: `*Company*\n${vars.companyName || 'Unknown'}`,
        },
      ],
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Take Action',
            emoji: true,
          },
          value: 'take_action',
          url: vars.actionUrl || '',
          style: 'danger',
        },
      ],
    },
  ],
}

/**
 * Team Member Joined Template
 */
const teamJoinedTemplate: SlackTemplate = {
  id: 'team-joined',
  name: 'Team Member Joined',
  description: 'Welcome new team member',
  color: '#36A64F',
  blocks: (vars) => [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '👋 Welcome to the Team!',
        emoji: true,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${vars.memberName || 'New Member'}* has joined the team`,
      },
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Role*\n${vars.memberRole || 'Team Member'}`,
        },
        {
          type: 'mrkdwn',
          text: `*Company*\n${vars.companyName || 'Unknown'}`,
        },
      ],
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `Joined on ${vars.joinedDate || 'today'}`,
        },
      ],
    },
  ],
}

/**
 * Payment Received Template
 */
const paymentReceivedTemplate: SlackTemplate = {
  id: 'payment-received',
  name: 'Payment Received',
  description: 'Notify when payment is received',
  color: '#36A64F',
  blocks: (vars) => [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '💰 Payment Received',
        emoji: true,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `Payment of *${vars.amount || '$0.00'}* has been received`,
      },
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Invoice ID*\n${vars.invoiceId || 'N/A'}`,
        },
        {
          type: 'mrkdwn',
          text: `*Company*\n${vars.companyName || 'Unknown'}`,
        },
      ],
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Received on*\n${vars.receivedDate || 'Today'}`,
        },
        {
          type: 'mrkdwn',
          text: `*Plan*\n${vars.plan || 'Standard'}`,
        },
      ],
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `Thank you for your business! :tada:`,
        },
      ],
    },
  ],
}

/**
 * Registry of all templates
 */
const templates: Record<SlackTemplateId, SlackTemplate> = {
  'task-assigned': taskAssignedTemplate,
  'task-due': taskDueTemplate,
  'task-completed': taskCompletedTemplate,
  'milestone-achieved': milestoneAchievedTemplate,
  'document-shared': documentSharedTemplate,
  'board-report-ready': boardReportReadyTemplate,
  'account-alert': accountAlertTemplate,
  'team-joined': teamJoinedTemplate,
  'payment-received': paymentReceivedTemplate,
}

/**
 * Get a template by ID
 */
export function getSlackTemplate(templateId: SlackTemplateId): SlackTemplate | null {
  return templates[templateId] || null
}

/**
 * Get all available template IDs
 */
export function getAvailableSlackTemplates(): SlackTemplateId[] {
  return Object.keys(templates) as SlackTemplateId[]
}

/**
 * Build Slack message from template
 */
export function buildSlackMessage(
  templateId: SlackTemplateId,
  variables: Record<string, any>
): {
  blocks: any[]
  color: string
  name: string
} | null {
  const template = getSlackTemplate(templateId)
  if (!template) {
    return null
  }

  return {
    blocks: template.blocks(variables),
    color: template.color,
    name: template.name,
  }
}

/**
 * Get message size in characters (for monitoring)
 */
export function getSlackMessageSize(templateId: SlackTemplateId, variables: Record<string, any>): number {
  const message = buildSlackMessage(templateId, variables)
  if (!message) {
    return 0
  }

  return JSON.stringify(message.blocks).length
}
