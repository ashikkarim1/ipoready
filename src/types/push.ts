/**
 * Type definitions for Push Notification System
 */

export type NotificationPermission = 'granted' | 'denied' | 'default'

export interface PushSubscriptionJSON {
  endpoint: string
  keys: {
    auth: string
    p256dh: string
  }
}

export interface PushNotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  url?: string
  action?: string
}

export interface PushResult {
  sentCount: number
  failedCount: number
  errors?: Array<{ endpoint: string; error: string }>
}

export interface BroadcastNotification {
  id: string
  title: string
  body: string
  icon?: string
  url?: string
  timestamp: number
}

export interface BroadcastMessage {
  type: 'notification' | 'badge-update' | 'sync-request' | 'sync-response'
  data: any
  timestamp: number
}

export interface PushSubscriptionRecord {
  id: string
  userId: string
  endpoint: string
  authKey: string | null
  p256dhKey: string | null
  createdAt: string
  lastUsedAt: string
}

export interface SendPushRequest {
  userId: string
  title: string
  body: string
  url?: string
  action?: string
}

export interface SendPushResponse {
  success: boolean
  message?: string
  sentCount?: number
  failedCount?: number
  errors?: Array<{ endpoint: string; error: string }>
}
