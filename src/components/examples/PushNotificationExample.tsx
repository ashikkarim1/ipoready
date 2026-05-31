'use client'

/**
 * Example: How to use the Push Notification System
 * This file demonstrates various ways to interact with push notifications
 */

import { useState } from 'react'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import { subscribeToPush, unsubscribeFromPushNotifications } from '@/lib/push-subscription'
import { Bell, CheckCircle2, AlertCircle } from 'lucide-react'

export function PushNotificationExample() {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
  } = usePushNotifications()

  const [customError, setCustomError] = useState<string | null>(null)
  const [customSuccess, setCustomSuccess] = useState<string | null>(null)

  // Example 1: Simple toggle subscription
  const handleToggleNotifications = async () => {
    try {
      setCustomError(null)
      setCustomSuccess(null)

      if (isSubscribed) {
        await unsubscribe()
        setCustomSuccess('Notifications disabled')
      } else {
        await subscribe()
        setCustomSuccess('Notifications enabled')
      }
    } catch (err) {
      setCustomError(err instanceof Error ? err.message : 'Error toggling notifications')
    }
  }

  // Example 2: Send a test notification (admin only)
  const sendTestNotification = async () => {
    try {
      setCustomError(null)

      const response = await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'current-user-id', // Replace with actual user ID
          title: 'Test Notification',
          body: 'This is a test push notification from IPOReady',
          url: '/dashboard',
          action: 'test_notification',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send notification')
      }

      const data = await response.json()
      setCustomSuccess(`Sent to ${data.sentCount} device(s)`)
    } catch (err) {
      setCustomError(err instanceof Error ? err.message : 'Error sending notification')
    }
  }

  // Example 3: Manual subscription/unsubscription
  const handleManualSubscribe = async () => {
    try {
      setCustomError(null)
      await subscribeToPush()
      setCustomSuccess('Manually subscribed to push notifications')
    } catch (err) {
      setCustomError(err instanceof Error ? err.message : 'Error subscribing')
    }
  }

  const handleManualUnsubscribe = async () => {
    try {
      setCustomError(null)
      await unsubscribeFromPushNotifications()
      setCustomSuccess('Manually unsubscribed from push notifications')
    } catch (err) {
      setCustomError(err instanceof Error ? err.message : 'Error unsubscribing')
    }
  }

  if (!isSupported) {
    return (
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
              Push Notifications Not Supported
            </h3>
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Your browser doesn't support web push notifications.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Push Notification Examples
        </h3>

        {/* Status Info */}
        <div className="space-y-2 mb-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600 dark:text-slate-400">Browser Support:</span>
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              {isSupported ? 'Supported' : 'Not Supported'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600 dark:text-slate-400">Permission Status:</span>
            <span className={`text-sm font-medium ${
              permission === 'granted'
                ? 'text-green-600 dark:text-green-400'
                : permission === 'denied'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-yellow-600 dark:text-yellow-400'
            }`}>
              {permission.charAt(0).toUpperCase() + permission.slice(1)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600 dark:text-slate-400">Subscription Status:</span>
            <span className={`text-sm font-medium flex items-center gap-1 ${
              isSubscribed ? 'text-green-600 dark:text-green-400' : 'text-slate-600 dark:text-slate-400'
            }`}>
              {isSubscribed && <CheckCircle2 className="h-4 w-4" />}
              {isSubscribed ? 'Subscribed' : 'Not Subscribed'}
            </span>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-200 mb-4">
            {error}
          </div>
        )}
        {customError && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-200 mb-4">
            {customError}
          </div>
        )}
        {customSuccess && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-sm text-green-700 dark:text-green-200 mb-4">
            {customSuccess}
          </div>
        )}

        {/* Example 1: Hook-based toggle */}
        <div className="space-y-3">
          <h4 className="font-medium text-slate-900 dark:text-white">Example 1: Using Hook</h4>
          <button
            onClick={handleToggleNotifications}
            disabled={isLoading || permission === 'denied'}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {isLoading ? 'Loading...' : isSubscribed ? 'Disable Notifications' : 'Enable Notifications'}
          </button>
        </div>

        {/* Example 2: Manual subscription */}
        <div className="space-y-3 mt-4">
          <h4 className="font-medium text-slate-900 dark:text-white">Example 2: Manual Subscribe/Unsubscribe</h4>
          <div className="flex gap-2">
            <button
              onClick={handleManualSubscribe}
              disabled={isSubscribed}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              Subscribe Manually
            </button>
            <button
              onClick={handleManualUnsubscribe}
              disabled={!isSubscribed}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              Unsubscribe Manually
            </button>
          </div>
        </div>

        {/* Example 3: Send test notification */}
        <div className="space-y-3 mt-4">
          <h4 className="font-medium text-slate-900 dark:text-white">Example 3: Send Test Notification</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            (Requires admin permissions and active subscription)
          </p>
          <button
            onClick={sendTestNotification}
            disabled={!isSubscribed || permission !== 'granted'}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            Send Test Notification
          </button>
        </div>

        {/* Code Examples */}
        <div className="mt-6 space-y-4">
          <h4 className="font-medium text-slate-900 dark:text-white">Code Examples</h4>

          <div className="bg-slate-800 text-slate-100 p-4 rounded-lg text-xs overflow-x-auto">
            <pre>{`// Example 1: Check notification support
import { isPushSupported, getPushPermissionStatus } from '@/lib/push-service'

const isSupported = isPushSupported()
const status = getPushPermissionStatus()`}</pre>
          </div>

          <div className="bg-slate-800 text-slate-100 p-4 rounded-lg text-xs overflow-x-auto">
            <pre>{`// Example 2: Subscribe to push
import { subscribeToPush } from '@/lib/push-subscription'

await subscribeToPush()`}</pre>
          </div>

          <div className="bg-slate-800 text-slate-100 p-4 rounded-lg text-xs overflow-x-auto">
            <pre>{`// Example 3: Use the hook
import { usePushNotifications } from '@/hooks/usePushNotifications'

const { isSubscribed, subscribe, unsubscribe } = usePushNotifications()`}</pre>
          </div>

          <div className="bg-slate-800 text-slate-100 p-4 rounded-lg text-xs overflow-x-auto">
            <pre>{`// Example 4: Send push (server-side)
import { sendPushToUser } from '@/lib/push-sender'

await sendPushToUser(userId, {
  title: 'New Task',
  body: 'You have a new task',
  url: '/dashboard/tasks',
})`}</pre>
          </div>
        </div>
      </div>
    </div>
  )
}
