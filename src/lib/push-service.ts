/**
 * Client-side Push Service
 * Handles registration, permissions, and subscription management for web push notifications
 */

import { getVapidPublicKey } from './vapid'

export type NotificationPermission = 'granted' | 'denied' | 'default'

/**
 * Check if the browser supports web push notifications
 */
export function isPushSupported(): boolean {
  if (typeof window === 'undefined') return false
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

/**
 * Get the current notification permission status
 */
export function getPushPermissionStatus(): NotificationPermission {
  if (!isPushSupported()) return 'denied'
  return Notification.permission as NotificationPermission
}

/**
 * Request permission from the user to send notifications
 */
export async function requestPushPermission(): Promise<NotificationPermission> {
  if (!isPushSupported()) {
    console.warn('Push notifications are not supported in this browser')
    return 'denied'
  }

  try {
    const permission = await Notification.requestPermission()
    return permission as NotificationPermission
  } catch (error) {
    console.error('Error requesting push permission:', error)
    return 'denied'
  }
}

/**
 * Get the current push subscription
 */
export async function getPushSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null

  try {
    const registration = await navigator.serviceWorker.ready
    return await registration.pushManager.getSubscription()
  } catch (error) {
    console.error('Error getting push subscription:', error)
    return null
  }
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!isPushSupported()) {
    console.warn('Push notifications are not supported in this browser')
    return null
  }

  try {
    const permission = Notification.permission
    if (permission !== 'granted') {
      const result = await requestPushPermission()
      if (result !== 'granted') {
        console.warn('User denied push notification permission')
        return null
      }
    }

    const registration = await navigator.serviceWorker.ready
    const vapidPublicKey = getVapidPublicKey()

    if (!vapidPublicKey) {
      console.error('VAPID public key is not configured')
      return null
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
    })

    return subscription
  } catch (error) {
    console.error('Error subscribing to push notifications:', error)
    return null
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  if (!isPushSupported()) return false

  try {
    const subscription = await getPushSubscription()
    if (subscription) {
      return await subscription.unsubscribe()
    }
    return false
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error)
    return false
  }
}

/**
 * Convert VAPID public key from base64 to Uint8Array
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}
