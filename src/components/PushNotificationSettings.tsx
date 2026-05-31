'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { usePushNotifications } from '@/hooks/usePushNotifications'

/**
 * Push Notification Settings Component
 * Allows users to enable/disable push notifications from account settings
 */
export function PushNotificationSettings() {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
  } = usePushNotifications()

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  if (!isSupported) {
    return (
      <div className="rounded-lg border border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-900/20 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900 dark:text-yellow-200">
              Push Notifications Not Supported
            </h3>
            <p className="mt-1 text-sm text-yellow-800 dark:text-yellow-300">
              Your browser doesn't support web push notifications. Please use a modern browser like Chrome, Firefox, or Safari.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const handleToggle = async () => {
    try {
      if (isSubscribed) {
        await unsubscribe()
      } else {
        await subscribe()
      }
    } catch (err) {
      console.error('Error toggling notifications:', err)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-slate-200 dark:border-slate-700 p-6 bg-white dark:bg-slate-900"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex-shrink-0">
            <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Push Notifications
            </h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {permission === 'denied'
                ? 'Notifications are blocked for this site. Please enable them in your browser settings.'
                : isSubscribed
                  ? 'You will receive notifications for important updates and milestones.'
                  : 'Get notified about task reminders, milestones, and important updates.'}
            </p>

            {error && (
              <div className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {permission === 'denied' && (
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                <button
                  onClick={() => {
                    if ('requestPermission' in Notification) {
                      window.open('chrome://settings/content/notifications', '_blank')
                    }
                  }}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Open browser settings
                </button>
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {isSubscribed && (
            <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>Enabled</span>
            </div>
          )}

          <button
            onClick={handleToggle}
            disabled={isLoading || permission === 'denied'}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              isSubscribed
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50'
                : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
            } disabled:cursor-not-allowed flex items-center gap-2`}
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubscribed ? 'Disable' : 'Enable'}
          </button>
        </div>
      </div>

      {permission === 'default' && !isSubscribed && (
        <div className="mt-4 p-3 rounded bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-900 dark:text-blue-200">
            We respect your privacy. Notifications require your permission and can be disabled anytime.
          </p>
        </div>
      )}
    </motion.div>
  )
}
