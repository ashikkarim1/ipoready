/**
 * Notification preferences API
 * Handles all preference operations for notifications
 */

import { sql } from '@/lib/db'
import {
  NotificationType,
  NotificationChannel,
  NotificationFrequency,
  PreferenceConfig,
  NotificationSettings,
  DEFAULT_PREFERENCES,
  DEFAULT_NOTIFICATION_SETTINGS,
  NotificationCheckResult,
  NotificationCheckInput,
} from '@/lib/notification-types'
import { isWithinQuietHours, isDigestTime } from '@/lib/time-utils'

/**
 * Get all notification preferences for a user
 */
export async function getUserPreferences(
  userId: string
): Promise<Map<NotificationType, PreferenceConfig>> {
  const rows = await sql`
    SELECT
      notification_type,
      email_enabled,
      sms_enabled,
      push_enabled,
      whatsapp_enabled,
      frequency,
      quiet_hours_start,
      quiet_hours_end,
      quiet_hours_timezone,
      updated_at
    FROM notification_preferences
    WHERE user_id = ${userId}
  ` as Array<{
    notification_type: string
    email_enabled: boolean
    sms_enabled: boolean
    push_enabled: boolean
    whatsapp_enabled: boolean
    frequency: string
    quiet_hours_start: string | null
    quiet_hours_end: string | null
    quiet_hours_timezone: string | null
    updated_at: string
  }>

  const preferences = new Map<NotificationType, PreferenceConfig>()

  // Add all default preferences
  for (const [notificationType, config] of Object.entries(DEFAULT_PREFERENCES)) {
    preferences.set(notificationType as NotificationType, {
      notificationType: notificationType as NotificationType,
      ...config,
      updatedAt: new Date().toISOString(),
    })
  }

  // Override with user's saved preferences
  for (const row of rows) {
    const type = row.notification_type as NotificationType
    if (Object.values(NotificationType).includes(type)) {
      preferences.set(type, {
        notificationType: type,
        emailEnabled: row.email_enabled,
        smsEnabled: row.sms_enabled,
        pushEnabled: row.push_enabled,
        whatsappEnabled: row.whatsapp_enabled,
        frequency: row.frequency as NotificationFrequency,
        quietHoursStart: row.quiet_hours_start || undefined,
        quietHoursEnd: row.quiet_hours_end || undefined,
        quietHoursTimezone: row.quiet_hours_timezone || undefined,
        updatedAt: row.updated_at,
      })
    }
  }

  return preferences
}

/**
 * Get user's global notification settings
 */
export async function getUserNotificationSettings(
  userId: string
): Promise<NotificationSettings> {
  const rows = await sql`
    SELECT
      id,
      user_id,
      digest_time,
      digest_timezone,
      do_not_disturb_start,
      do_not_disturb_end,
      do_not_disturb_timezone,
      created_at,
      updated_at
    FROM notification_settings
    WHERE user_id = ${userId}
  ` as Array<{
    id: string
    user_id: string
    digest_time: string
    digest_timezone: string
    do_not_disturb_start: string
    do_not_disturb_end: string
    do_not_disturb_timezone: string
    created_at: string
    updated_at: string
  }>

  if (rows.length === 0) {
    // Return defaults if no settings exist yet
    // This will be created on first update
    return {
      id: '',
      userId,
      ...DEFAULT_NOTIFICATION_SETTINGS,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  const row = rows[0]
  return {
    id: row.id,
    userId: row.user_id,
    digestTime: row.digest_time,
    digestTimezone: row.digest_timezone,
    doNotDisturbStart: row.do_not_disturb_start,
    doNotDisturbEnd: row.do_not_disturb_end,
    doNotDisturbTimezone: row.do_not_disturb_timezone,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/**
 * Update a single notification preference
 */
export async function updatePreference(
  userId: string,
  type: NotificationType,
  config: Omit<PreferenceConfig, 'notificationType' | 'updatedAt'>
): Promise<void> {
  await sql`
    INSERT INTO notification_preferences
      (user_id, notification_type, email_enabled, sms_enabled, push_enabled,
       whatsapp_enabled, frequency, quiet_hours_start, quiet_hours_end,
       quiet_hours_timezone, updated_at)
    VALUES
      (${userId}, ${type}, ${config.emailEnabled}, ${config.smsEnabled},
       ${config.pushEnabled}, ${config.whatsappEnabled}, ${config.frequency},
       ${config.quietHoursStart || null}, ${config.quietHoursEnd || null},
       ${config.quietHoursTimezone || null}, NOW())
    ON CONFLICT (user_id, notification_type) DO UPDATE
    SET
      email_enabled = EXCLUDED.email_enabled,
      sms_enabled = EXCLUDED.sms_enabled,
      push_enabled = EXCLUDED.push_enabled,
      whatsapp_enabled = EXCLUDED.whatsapp_enabled,
      frequency = EXCLUDED.frequency,
      quiet_hours_start = EXCLUDED.quiet_hours_start,
      quiet_hours_end = EXCLUDED.quiet_hours_end,
      quiet_hours_timezone = EXCLUDED.quiet_hours_timezone,
      updated_at = NOW()
  `
}

/**
 * Bulk update multiple preferences
 */
export async function updatePreferences(
  userId: string,
  configs: Array<[NotificationType, Omit<PreferenceConfig, 'notificationType' | 'updatedAt'>]>
): Promise<void> {
  for (const [type, config] of configs) {
    await updatePreference(userId, type, config)
  }
}

/**
 * Update user's global notification settings
 */
export async function updateNotificationSettings(
  userId: string,
  settings: Partial<Omit<NotificationSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<NotificationSettings> {
  // Get current settings
  const current = await getUserNotificationSettings(userId)

  // Merge with updates
  const updated = {
    digestTime: settings.digestTime ?? current.digestTime,
    digestTimezone: settings.digestTimezone ?? current.digestTimezone,
    doNotDisturbStart: settings.doNotDisturbStart ?? current.doNotDisturbStart,
    doNotDisturbEnd: settings.doNotDisturbEnd ?? current.doNotDisturbEnd,
    doNotDisturbTimezone: settings.doNotDisturbTimezone ?? current.doNotDisturbTimezone,
  }

  if (current.id) {
    // Update existing
    await sql`
      UPDATE notification_settings
      SET
        digest_time = ${updated.digestTime},
        digest_timezone = ${updated.digestTimezone},
        do_not_disturb_start = ${updated.doNotDisturbStart},
        do_not_disturb_end = ${updated.doNotDisturbEnd},
        do_not_disturb_timezone = ${updated.doNotDisturbTimezone},
        updated_at = NOW()
      WHERE user_id = ${userId}
    `
  } else {
    // Create new
    await sql`
      INSERT INTO notification_settings
        (user_id, digest_time, digest_timezone, do_not_disturb_start,
         do_not_disturb_end, do_not_disturb_timezone, created_at, updated_at)
      VALUES
        (${userId}, ${updated.digestTime}, ${updated.digestTimezone},
         ${updated.doNotDisturbStart}, ${updated.doNotDisturbEnd},
         ${updated.doNotDisturbTimezone}, NOW(), NOW())
    `
  }

  return {
    id: current.id || '',
    userId,
    ...updated,
    createdAt: current.createdAt,
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Check if a notification should be sent to a user via a specific channel
 * Takes into account all rules: channel enabled, frequency, quiet hours, etc.
 */
export async function shouldSendNotification(
  userId: string,
  type: NotificationType,
  channel: NotificationChannel,
  currentTime: Date = new Date()
): Promise<NotificationCheckResult> {
  const preferences = await getUserPreferences(userId)
  const settings = await getUserNotificationSettings(userId)

  const pref = preferences.get(type)
  if (!pref) {
    return {
      allowed: false,
      reason: 'Notification type not found',
    }
  }

  // Check if channel is enabled for this notification type
  const channelEnabled = getChannelEnabled(pref, channel)
  if (!channelEnabled) {
    return {
      allowed: false,
      reason: `${channel} notifications disabled for this type`,
    }
  }

  // Check if in quiet hours
  const timezone = pref.quietHoursTimezone || settings.doNotDisturbTimezone
  const quietHoursStart = pref.quietHoursStart || settings.doNotDisturbStart
  const quietHoursEnd = pref.quietHoursEnd || settings.doNotDisturbEnd

  if (isWithinQuietHours(currentTime, quietHoursStart, quietHoursEnd, timezone)) {
    // Check if frequency is REAL_TIME - if so, block it; otherwise allow for digest
    if (pref.frequency === NotificationFrequency.REAL_TIME) {
      return {
        allowed: false,
        reason: 'Within quiet hours',
      }
    }
    // For digest/weekly, we can still send (will be queued for digest)
  }

  // Check if notification should be digested
  const shouldDigest = pref.frequency !== NotificationFrequency.REAL_TIME &&
                       pref.frequency !== NotificationFrequency.NEVER

  if (pref.frequency === NotificationFrequency.NEVER) {
    return {
      allowed: false,
      reason: 'Notification type set to never',
    }
  }

  return {
    allowed: true,
    shouldDigest,
  }
}

/**
 * Check if a specific channel is enabled for a notification type
 */
function getChannelEnabled(pref: PreferenceConfig, channel: NotificationChannel): boolean {
  switch (channel) {
    case NotificationChannel.EMAIL:
      return pref.emailEnabled
    case NotificationChannel.SMS:
      return pref.smsEnabled
    case NotificationChannel.PUSH:
      return pref.pushEnabled
    case NotificationChannel.WHATSAPP:
      return pref.whatsappEnabled
    default:
      return false
  }
}

/**
 * Check if a notification type is set to digest mode
 */
export async function shouldDigest(
  userId: string,
  type: NotificationType
): Promise<boolean> {
  const preferences = await getUserPreferences(userId)
  const pref = preferences.get(type)

  if (!pref) {
    return false
  }

  return pref.frequency !== NotificationFrequency.REAL_TIME &&
         pref.frequency !== NotificationFrequency.NEVER
}

/**
 * Get user's quiet hours configuration
 */
export async function getUserQuietHours(userId: string): Promise<{
  start: string
  end: string
  timezone: string
}> {
  const settings = await getUserNotificationSettings(userId)

  return {
    start: settings.doNotDisturbStart,
    end: settings.doNotDisturbEnd,
    timezone: settings.doNotDisturbTimezone,
  }
}

/**
 * Get the next scheduled digest time for a user
 */
export async function getNextDigestTime(userId: string): Promise<Date> {
  const settings = await getUserNotificationSettings(userId)
  return getNextDigestTimeFromSettings(settings)
}

/**
 * Calculate next digest time from settings
 */
export function getNextDigestTimeFromSettings(settings: NotificationSettings): Date {
  // This is a helper function used by digest queue
  // Implementation depends on how digests are scheduled
  // For now, return a placeholder - will be implemented with actual digest system
  return new Date()
}

/**
 * Get all notification types that are set to digest for a user
 */
export async function getDigestNotificationTypes(userId: string): Promise<NotificationType[]> {
  const preferences = await getUserPreferences(userId)
  const digestTypes: NotificationType[] = []

  for (const [type, pref] of preferences.entries()) {
    if (pref.frequency !== NotificationFrequency.REAL_TIME &&
        pref.frequency !== NotificationFrequency.NEVER) {
      digestTypes.push(type)
    }
  }

  return digestTypes
}

/**
 * Check if it's time to send a digest to a user
 */
export async function shouldSendDigest(userId: string, currentTime: Date = new Date()): Promise<boolean> {
  const settings = await getUserNotificationSettings(userId)
  return isDigestTime(currentTime, settings.digestTime, settings.digestTimezone)
}
