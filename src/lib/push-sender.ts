/**
 * Server-side push notification sender
 * Uses web-push library to send push notifications to subscribed users
 */

import webpush from 'web-push'
import { sql } from './db'
import { getVapidPrivateKey, getVapidPublicKey, getVapidSubject, isVapidConfigured } from './vapid'

interface PushNotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  url?: string
  action?: string
}

interface PushResult {
  sentCount: number
  failedCount: number
  errors?: Array<{ endpoint: string; error: string }>
}

/**
 * Configure web-push with VAPID keys
 */
export function configureWebPush(): void {
  if (!isVapidConfigured()) {
    console.warn(
      'VAPID keys not configured. Push notifications will not work. ' +
      'Generate keys with: npx web-push generate-vapid-keys'
    )
    return
  }

  webpush.setVapidDetails(
    getVapidSubject(),
    getVapidPublicKey(),
    getVapidPrivateKey()
  )
}

/**
 * Send push notification to a specific user's all subscriptions
 */
export async function sendPushToUser(
  userId: string,
  payload: PushNotificationPayload
): Promise<PushResult> {
  if (!isVapidConfigured()) {
    return {
      sentCount: 0,
      failedCount: 0,
      errors: [{ endpoint: 'unknown', error: 'VAPID keys not configured' }],
    }
  }

  try {
    // Configure web-push
    configureWebPush()

    // Get all push subscriptions for the user
    const subscriptions = await sql`
      SELECT id, endpoint, auth, p256dh
      FROM push_subscriptions
      WHERE user_id = ${userId}
    `

    if (!subscriptions || subscriptions.length === 0) {
      return {
        sentCount: 0,
        failedCount: 0,
      }
    }

    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/favicon.svg',
      badge: payload.badge || '/favicon.svg',
      url: payload.url || '/dashboard',
      action: payload.action,
    })

    const errors: Array<{ endpoint: string; error: string }> = []
    let sentCount = 0
    let failedCount = 0

    // Send to each subscription
    for (const sub of subscriptions as any[]) {
      try {
        const subscription = {
          endpoint: sub.endpoint,
          keys: {
            auth: sub.auth,
            p256dh: sub.p256dh,
          },
        }

        await webpush.sendNotification(subscription, notificationPayload)

        // Update last_used_at
        await sql`
          UPDATE push_subscriptions
          SET last_used_at = NOW()
          WHERE id = ${sub.id}
        `

        sentCount++
      } catch (error: any) {
        failedCount++

        // Handle subscription errors
        if (error.statusCode === 410) {
          // Gone - subscription no longer valid
          await sql`
            DELETE FROM push_subscriptions
            WHERE endpoint = ${sub.endpoint}
          `
        }

        errors.push({
          endpoint: sub.endpoint,
          error: error.message || 'Unknown error',
        })

        console.error(`Error sending push to ${sub.endpoint}:`, error.message)
      }
    }

    return {
      sentCount,
      failedCount,
      ...(errors.length > 0 && { errors }),
    }
  } catch (error) {
    console.error('Error in sendPushToUser:', error)
    return {
      sentCount: 0,
      failedCount: 1,
      errors: [{ endpoint: 'unknown', error: String(error) }],
    }
  }
}

/**
 * Send push notification to multiple users
 */
export async function sendPushToUsers(
  userIds: string[],
  payload: PushNotificationPayload
): Promise<PushResult> {
  let totalSent = 0
  let totalFailed = 0
  const allErrors: Array<{ endpoint: string; error: string }> = []

  for (const userId of userIds) {
    const result = await sendPushToUser(userId, payload)
    totalSent += result.sentCount
    totalFailed += result.failedCount
    if (result.errors) {
      allErrors.push(...result.errors)
    }
  }

  return {
    sentCount: totalSent,
    failedCount: totalFailed,
    ...(allErrors.length > 0 && { errors: allErrors }),
  }
}

/**
 * Send push notification to all users in a company
 */
export async function sendPushToCompany(
  companyId: string,
  payload: PushNotificationPayload
): Promise<PushResult> {
  try {
    if (!isVapidConfigured()) {
      return {
        sentCount: 0,
        failedCount: 0,
        errors: [{ endpoint: 'unknown', error: 'VAPID keys not configured' }],
      }
    }

    // Get all users in the company
    const users = await sql`
      SELECT DISTINCT u.id
      FROM users u
      WHERE u.company_id = ${companyId}
    `

    if (!users || users.length === 0) {
      return {
        sentCount: 0,
        failedCount: 0,
      }
    }

    const userIds = (users as any[]).map((u) => u.id)
    return await sendPushToUsers(userIds, payload)
  } catch (error) {
    console.error('Error in sendPushToCompany:', error)
    return {
      sentCount: 0,
      failedCount: 1,
      errors: [{ endpoint: 'unknown', error: String(error) }],
    }
  }
}

/**
 * Clean up expired subscriptions (no activity for 30 days)
 */
export async function cleanupExpiredSubscriptions(): Promise<number> {
  try {
    if (!isVapidConfigured()) {
      return 0
    }

    const result = await sql`
      DELETE FROM push_subscriptions
      WHERE last_used_at < NOW() - INTERVAL '30 days'
    `

    // Handle different result formats
    const count = (result as any)?.count || (result as any)?.rowCount || (Array.isArray(result) ? result.length : 0)
    return count || 0
  } catch (error) {
    console.error('Error cleaning up expired subscriptions:', error)
    return 0
  }
}
