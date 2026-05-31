'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/store/app-store'
import { isPushSupported, getPushPermissionStatus } from '@/lib/push-service'
import { notificationBroadcaster } from '@/lib/broadcast-channel'

/**
 * NotificationConsumer
 * Listens to the app store for new notifications and sends web push notifications
 * Also synchronizes notification badges across tabs using BroadcastChannel API
 */
export function NotificationConsumer() {
  const notifications = useAppStore((state) => state.notifications)

  useEffect(() => {
    // Track which notifications we've already sent as push
    const sentNotifications = new Set<string>()

    return () => {
      // Track sent notifications
      const unreadCount = notifications.filter((n) => !n.read).length

      // Update badge count across tabs
      if (notificationBroadcaster.isReady()) {
        notificationBroadcaster.updateBadgeCount(unreadCount)
      } else if (typeof window !== 'undefined' && 'setAppBadge' in navigator) {
        const nav = navigator as any
        if (unreadCount > 0) {
          nav.setAppBadge(unreadCount)
        } else {
          nav.clearAppBadge?.()
        }
      }
    }
  }, [notifications])

  useEffect(() => {
    // Send push notifications for new unread notifications
    if (!isPushSupported()) return
    if (getPushPermissionStatus() !== 'granted') return

    const sendPushForNewNotifications = async () => {
      const sentNotifications = new Set<string>(
        JSON.parse(sessionStorage.getItem('sent-push-notifications') || '[]')
      )

      for (const notification of notifications) {
        if (!notification.read && !sentNotifications.has(notification.id)) {
          try {
            // Send as web push
            const registration = await navigator.serviceWorker.ready
            if (registration.active) {
              // Use postMessage to notify service worker
              registration.active.postMessage({
                type: 'SEND_NOTIFICATION',
                data: {
                  title: notification.title,
                  body: notification.message,
                  icon: '/favicon.svg',
                  badge: '/favicon.svg',
                  url: notification.link || '/dashboard',
                  tag: `notification-${notification.id}`,
                },
              })
            }

            // Broadcast to other tabs
            notificationBroadcaster.broadcastNotification({
              id: notification.id,
              title: notification.title,
              body: notification.message,
              url: notification.link || '/dashboard',
              timestamp: new Date(notification.createdAt).getTime(),
            })

            sentNotifications.add(notification.id)
          } catch (error) {
            console.error('Error sending push notification:', error)
          }
        }
      }

      // Store sent notifications in session storage
      sessionStorage.setItem('sent-push-notifications', JSON.stringify(Array.from(sentNotifications)))
    }

    sendPushForNewNotifications()
  }, [notifications])

  // Handle broadcast messages from other tabs
  useEffect(() => {
    const unsubscribe = notificationBroadcaster.onMessage((message) => {
      if (message.type === 'notification') {
        // Another tab received a notification - update our badge count
        console.log('Received notification sync from another tab:', message.data)
      }
    })

    return unsubscribe
  }, [])

  // Request sync on mount
  useEffect(() => {
    if (notificationBroadcaster.isReady()) {
      notificationBroadcaster.requestSync()
    }
  }, [])

  return null // This component doesn't render anything
}
