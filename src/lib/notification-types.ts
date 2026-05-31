/**
 * Comprehensive notification type definitions for IPOReady
 * Used throughout the notification system for type safety and consistency
 */

export enum NotificationType {
  // Task notifications
  TASK_DUE = 'task_due',
  TASK_OVERDUE = 'task_overdue',
  TASK_COMPLETED = 'task_completed',

  // Document notifications
  DOCUMENT_SHARED = 'document_shared',
  DOCUMENT_VERSION_READY = 'document_version_ready',
  DOCUMENT_VERIFIED = 'document_verified',
  DOCUMENT_REJECTED = 'document_rejected',

  // Phase and milestone notifications
  MILESTONE_ACHIEVED = 'milestone_achieved',
  PHASE_PROGRESSED = 'phase_progressed',

  // Team notifications
  TEAM_MEMBER_JOINED = 'team_member_joined',
  COMMENT_MENTION = 'comment_mention',

  // Business notifications
  CAP_TABLE_UPDATED = 'cap_table_updated',
  BOARD_REPORT_READY = 'board_report_ready',

  // System notifications
  SYSTEM_ALERT = 'system_alert',
  ACCOUNT_WARNING = 'account_warning',

  // Additional business notifications
  PACE_SCORE_CHANGES = 'pace_score_changes',
  SUBSCRIPTION_RENEWAL_WARNING = 'subscription_renewal_warning',
  REGULATORY_DEADLINE = 'regulatory_deadline',
  NEW_EXPERT_INQUIRY_RESPONSE = 'new_expert_inquiry_response',
  SEDI_FILING_DUE = 'sedi_filing_due',
}

export type NotificationTypeString = keyof typeof NotificationType

/**
 * Notification channels that can be used to deliver notifications
 */
export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  WHATSAPP = 'whatsapp',
  SLACK = 'slack',
}

export type NotificationChannelString = keyof typeof NotificationChannel

/**
 * Frequency options for how often notifications are sent
 */
export enum NotificationFrequency {
  REAL_TIME = 'real_time',
  DAILY_DIGEST = 'daily_digest',
  WEEKLY = 'weekly',
  NEVER = 'never',
}

export type NotificationFrequencyString = keyof typeof NotificationFrequency

/**
 * Configuration for a single notification preference
 */
export interface PreferenceConfig {
  notificationType: NotificationType
  emailEnabled: boolean
  smsEnabled: boolean
  pushEnabled: boolean
  whatsappEnabled: boolean
  frequency: NotificationFrequency
  quietHoursStart?: string // HH:mm format
  quietHoursEnd?: string // HH:mm format
  quietHoursTimezone?: string // IANA timezone string
  updatedAt: string
}

/**
 * User's global notification settings
 */
export interface NotificationSettings {
  id: string
  userId: string
  digestTime: string // HH:mm format, e.g., "09:00"
  digestTimezone: string // IANA timezone string, e.g., "America/New_York"
  doNotDisturbStart: string // HH:mm format
  doNotDisturbEnd: string // HH:mm format
  doNotDisturbTimezone: string // IANA timezone string
  createdAt: string
  updatedAt: string
}

/**
 * User's preferences for all notification types
 */
export interface UserPreferences {
  preferences: Map<NotificationType, PreferenceConfig>
  settings: NotificationSettings
}

/**
 * Guard function input
 */
export interface NotificationCheckInput {
  userId: string
  type: NotificationType
  channel: NotificationChannel
  currentTime?: Date
}

/**
 * Result of notification eligibility check
 */
export interface NotificationCheckResult {
  allowed: boolean
  reason?: string // Explanation why notification was blocked
  shouldDigest?: boolean // Whether this should go to digest instead of real-time
}

/**
 * Default preference configuration for all notification types
 */
export const DEFAULT_PREFERENCES: Record<NotificationType, Omit<PreferenceConfig, 'notificationType' | 'updatedAt'>> = {
  [NotificationType.TASK_DUE]: {
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    whatsappEnabled: false,
    frequency: NotificationFrequency.REAL_TIME,
  },
  [NotificationType.TASK_OVERDUE]: {
    emailEnabled: true,
    smsEnabled: true,
    pushEnabled: true,
    whatsappEnabled: true,
    frequency: NotificationFrequency.REAL_TIME,
  },
  [NotificationType.TASK_COMPLETED]: {
    emailEnabled: false,
    smsEnabled: false,
    pushEnabled: true,
    whatsappEnabled: false,
    frequency: NotificationFrequency.REAL_TIME,
  },
  [NotificationType.DOCUMENT_SHARED]: {
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    whatsappEnabled: false,
    frequency: NotificationFrequency.REAL_TIME,
  },
  [NotificationType.DOCUMENT_VERSION_READY]: {
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    whatsappEnabled: false,
    frequency: NotificationFrequency.REAL_TIME,
  },
  [NotificationType.DOCUMENT_VERIFIED]: {
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    whatsappEnabled: false,
    frequency: NotificationFrequency.REAL_TIME,
  },
  [NotificationType.DOCUMENT_REJECTED]: {
    emailEnabled: true,
    smsEnabled: true,
    pushEnabled: true,
    whatsappEnabled: false,
    frequency: NotificationFrequency.REAL_TIME,
  },
  [NotificationType.MILESTONE_ACHIEVED]: {
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    whatsappEnabled: false,
    frequency: NotificationFrequency.REAL_TIME,
  },
  [NotificationType.PHASE_PROGRESSED]: {
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    whatsappEnabled: false,
    frequency: NotificationFrequency.REAL_TIME,
  },
  [NotificationType.TEAM_MEMBER_JOINED]: {
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    whatsappEnabled: false,
    frequency: NotificationFrequency.REAL_TIME,
  },
  [NotificationType.COMMENT_MENTION]: {
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    whatsappEnabled: false,
    frequency: NotificationFrequency.REAL_TIME,
  },
  [NotificationType.CAP_TABLE_UPDATED]: {
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: false,
    whatsappEnabled: false,
    frequency: NotificationFrequency.DAILY_DIGEST,
  },
  [NotificationType.BOARD_REPORT_READY]: {
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    whatsappEnabled: false,
    frequency: NotificationFrequency.DAILY_DIGEST,
  },
  [NotificationType.SYSTEM_ALERT]: {
    emailEnabled: true,
    smsEnabled: true,
    pushEnabled: true,
    whatsappEnabled: true,
    frequency: NotificationFrequency.REAL_TIME,
  },
  [NotificationType.ACCOUNT_WARNING]: {
    emailEnabled: true,
    smsEnabled: true,
    pushEnabled: true,
    whatsappEnabled: true,
    frequency: NotificationFrequency.REAL_TIME,
  },
  [NotificationType.PACE_SCORE_CHANGES]: {
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    whatsappEnabled: false,
    frequency: NotificationFrequency.DAILY_DIGEST,
  },
  [NotificationType.SUBSCRIPTION_RENEWAL_WARNING]: {
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: false,
    whatsappEnabled: false,
    frequency: NotificationFrequency.REAL_TIME,
  },
  [NotificationType.REGULATORY_DEADLINE]: {
    emailEnabled: true,
    smsEnabled: true,
    pushEnabled: true,
    whatsappEnabled: true,
    frequency: NotificationFrequency.REAL_TIME,
  },
  [NotificationType.NEW_EXPERT_INQUIRY_RESPONSE]: {
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    whatsappEnabled: false,
    frequency: NotificationFrequency.REAL_TIME,
  },
  [NotificationType.SEDI_FILING_DUE]: {
    emailEnabled: true,
    smsEnabled: true,
    pushEnabled: true,
    whatsappEnabled: true,
    frequency: NotificationFrequency.REAL_TIME,
  },
}

/**
 * Default global notification settings
 */
export const DEFAULT_NOTIFICATION_SETTINGS: Omit<NotificationSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
  digestTime: '09:00',
  digestTimezone: 'America/Toronto', // Default to Toronto (EST/EDT)
  doNotDisturbStart: '22:00',
  doNotDisturbEnd: '08:00',
  doNotDisturbTimezone: 'America/Toronto',
}
