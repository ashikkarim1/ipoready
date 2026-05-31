/**
 * Notification Guard Function
 * Central decision point for whether to send a notification
 * Used by email-service.ts, whatsapp-service.ts, push-service.ts, sms-service.ts
 */

import {
  shouldSendNotification as checkShouldSendNotification,
  shouldDigest,
} from '@/lib/preferences'
import {
  NotificationType,
  NotificationChannel,
  NotificationCheckResult,
  NotificationCheckInput,
} from '@/lib/notification-types'

/**
 * Main notification guard function
 * Checks all rules before sending a notification
 *
 * Usage in email service:
 *   const canSend = await shouldSendNotification(userId, NotificationType.TASK_DUE, NotificationChannel.EMAIL)
 *   if (!canSend.allowed) {
 *     if (canSend.shouldDigest) {
 *       // Queue for digest
 *       await queueForDigest(userId, notification)
 *     }
 *     return
 *   }
 *   // Send notification immediately
 *   await sendEmail(...)
 */
export async function shouldSendNotification(
  userId: string,
  type: NotificationType,
  channel: NotificationChannel,
  currentTime: Date = new Date()
): Promise<NotificationCheckResult> {
  try {
    return await checkShouldSendNotification(userId, type, channel, currentTime)
  } catch (error) {
    console.error('Error in notification guard:', error)
    // Fail open - allow notification if there's an error
    return {
      allowed: true,
      reason: 'Error checking preferences, allowing notification',
    }
  }
}

/**
 * Check if notification should be queued for digest instead of sent immediately
 */
export async function isNotificationForDigest(
  userId: string,
  type: NotificationType
): Promise<boolean> {
  try {
    return await shouldDigest(userId, type)
  } catch (error) {
    console.error('Error checking digest status:', error)
    return false
  }
}

/**
 * Example integration for email service
 * This shows how to use the guard in an email sending function
 */
export async function sendNotificationViaEmail(
  userId: string,
  type: NotificationType,
  emailOptions: {
    to: string
    subject: string
    html: string
  }
): Promise<{ sent: boolean; queued: boolean; reason?: string }> {
  const result = await shouldSendNotification(
    userId,
    type,
    NotificationChannel.EMAIL
  )

  if (!result.allowed) {
    if (result.shouldDigest) {
      // Queue for digest instead
      // TODO: Implement digest queue
      return {
        sent: false,
        queued: true,
        reason: 'Queued for digest',
      }
    }

    // Don't send or queue
    return {
      sent: false,
      queued: false,
      reason: result.reason,
    }
  }

  // Send email immediately
  try {
    // TODO: Call actual email service
    // const response = await resend.emails.send(emailOptions)
    return {
      sent: true,
      queued: false,
    }
  } catch (error) {
    console.error('Error sending email:', error)
    return {
      sent: false,
      queued: false,
      reason: 'Failed to send email',
    }
  }
}

/**
 * Example integration for WhatsApp service
 */
export async function sendNotificationViaWhatsApp(
  userId: string,
  type: NotificationType,
  whatsappOptions: {
    to: string
    body: string
  }
): Promise<{ sent: boolean; queued: boolean; reason?: string }> {
  const result = await shouldSendNotification(
    userId,
    type,
    NotificationChannel.WHATSAPP
  )

  if (!result.allowed) {
    if (result.shouldDigest) {
      return {
        sent: false,
        queued: true,
        reason: 'Queued for digest',
      }
    }

    return {
      sent: false,
      queued: false,
      reason: result.reason,
    }
  }

  try {
    // TODO: Call actual WhatsApp service
    // const response = await twilio.messages.create(whatsappOptions)
    return {
      sent: true,
      queued: false,
    }
  } catch (error) {
    console.error('Error sending WhatsApp message:', error)
    return {
      sent: false,
      queued: false,
      reason: 'Failed to send WhatsApp message',
    }
  }
}

/**
 * Example integration for SMS service
 */
export async function sendNotificationViaSMS(
  userId: string,
  type: NotificationType,
  smsOptions: {
    to: string
    body: string
  }
): Promise<{ sent: boolean; queued: boolean; reason?: string }> {
  const result = await shouldSendNotification(
    userId,
    type,
    NotificationChannel.SMS
  )

  if (!result.allowed) {
    if (result.shouldDigest) {
      return {
        sent: false,
        queued: true,
        reason: 'Queued for digest',
      }
    }

    return {
      sent: false,
      queued: false,
      reason: result.reason,
    }
  }

  try {
    // TODO: Call actual SMS service
    // const response = await twilio.messages.create(smsOptions)
    return {
      sent: true,
      queued: false,
    }
  } catch (error) {
    console.error('Error sending SMS:', error)
    return {
      sent: false,
      queued: false,
      reason: 'Failed to send SMS',
    }
  }
}

/**
 * Example integration for push notification service
 */
export async function sendNotificationViaPush(
  userId: string,
  type: NotificationType,
  pushOptions: {
    title: string
    body: string
    badge?: number
    icon?: string
    tag?: string
  }
): Promise<{ sent: boolean; queued: boolean; reason?: string }> {
  const result = await shouldSendNotification(
    userId,
    type,
    NotificationChannel.PUSH
  )

  if (!result.allowed) {
    if (result.shouldDigest) {
      return {
        sent: false,
        queued: true,
        reason: 'Queued for digest',
      }
    }

    return {
      sent: false,
      queued: false,
      reason: result.reason,
    }
  }

  try {
    // TODO: Call actual push service
    // await sendPushNotification(userId, pushOptions)
    return {
      sent: true,
      queued: false,
    }
  } catch (error) {
    console.error('Error sending push notification:', error)
    return {
      sent: false,
      queued: false,
      reason: 'Failed to send push notification',
    }
  }
}

/**
 * Example integration for Slack notification service
 */
export async function sendNotificationViaSlack(
  userId: string,
  type: NotificationType,
  slackOptions: {
    templateId: string
    variables: Record<string, any>
  }
): Promise<{ sent: boolean; queued: boolean; reason?: string }> {
  const result = await shouldSendNotification(
    userId,
    type,
    NotificationChannel.SLACK
  )

  if (!result.allowed) {
    if (result.shouldDigest) {
      return {
        sent: false,
        queued: true,
        reason: 'Queued for digest',
      }
    }

    return {
      sent: false,
      queued: false,
      reason: result.reason,
    }
  }

  try {
    // TODO: Call actual Slack service
    // const response = await sendSlackMessage({ userId, ...slackOptions })
    return {
      sent: true,
      queued: false,
    }
  } catch (error) {
    console.error('Error sending Slack notification:', error)
    return {
      sent: false,
      queued: false,
      reason: 'Failed to send Slack notification',
    }
  }
}
