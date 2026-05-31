/**
 * Push Subscription Management
 * Handles subscription registration and removal with the backend
 */

import { subscribeToPush as getSubscription, unsubscribeFromPush, getPushSubscription } from './push-service'

/**
 * Subscribe to push notifications and register with backend
 */
export async function subscribeToPush(): Promise<void> {
  try {
    // Get the subscription from the browser
    const subscription = await getSubscription()

    if (!subscription) {
      console.warn('Failed to get push subscription from browser')
      return
    }

    // Send subscription to backend
    const response = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to register subscription: ${response.statusText}`)
    }

    console.log('Successfully subscribed to push notifications')
  } catch (error) {
    console.error('Error subscribing to push notifications:', error)
    throw error
  }
}

/**
 * Unsubscribe from push notifications and remove from backend
 */
export async function unsubscribeFromPushNotifications(): Promise<void> {
  try {
    // Get current subscription
    const subscription = await getPushSubscription()

    if (!subscription) {
      console.warn('No active push subscription to unsubscribe from')
      return
    }

    // Unsubscribe from browser
    const success = await unsubscribeFromPush()

    if (!success) {
      throw new Error('Failed to unsubscribe from push manager')
    }

    // Remove subscription from backend
    const response = await fetch('/api/push/unsubscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to unregister subscription: ${response.statusText}`)
    }

    console.log('Successfully unsubscribed from push notifications')
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error)
    throw error
  }
}

/**
 * Check if user is subscribed to push notifications
 */
export async function isUserSubscribed(): Promise<boolean> {
  try {
    const subscription = await getPushSubscription()
    return subscription !== null
  } catch (error) {
    console.error('Error checking push subscription status:', error)
    return false
  }
}

/**
 * Get current push subscription
 */
export async function getCurrentSubscription(): Promise<PushSubscription | null> {
  try {
    return await getPushSubscription()
  } catch (error) {
    console.error('Error getting current subscription:', error)
    return null
  }
}
