'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X } from 'lucide-react'
import {
  requestPushPermission,
  getPushPermissionStatus,
  isPushSupported,
} from '@/lib/push-service'
import { subscribeToPush } from '@/lib/push-subscription'

interface PushPermissionPromptProps {
  showDelay?: number
  minDismissals?: number
}

export function PushPermissionPrompt({
  showDelay = 5000,
  minDismissals = 2,
}: PushPermissionPromptProps) {
  const [showPrompt, setShowPrompt] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [dismissCount, setDismissCount] = useState(0)

  useEffect(() => {
    const checkAndShowPrompt = async () => {
      // Only show if browser supports push
      if (!isPushSupported()) {
        return
      }

      // Check if permission was already granted or denied
      const permission = getPushPermissionStatus()
      if (permission !== 'default') {
        return
      }

      // Check local storage to see if user has dismissed this multiple times
      const storedDismissals = localStorage.getItem('push-permission-dismissals')
      const dismissals = storedDismissals ? parseInt(storedDismissals) : 0

      // Only show if user hasn't dismissed too many times
      if (dismissals < minDismissals) {
        // Show after delay
        const timer = setTimeout(() => {
          setShowPrompt(true)
          setDismissCount(dismissals)
        }, showDelay)

        return () => clearTimeout(timer)
      }
    }

    checkAndShowPrompt()
  }, [showDelay, minDismissals])

  const handleEnable = async () => {
    setIsLoading(true)
    try {
      const permission = await requestPushPermission()
      if (permission === 'granted') {
        // Subscribe to push notifications
        await subscribeToPush()
        setShowPrompt(false)
        // Clear dismissal count on successful enable
        localStorage.removeItem('push-permission-dismissals')
      }
    } catch (error) {
      console.error('Error enabling push notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDismiss = () => {
    const newDismissCount = dismissCount + 1
    setDismissCount(newDismissCount)
    localStorage.setItem('push-permission-dismissals', newDismissCount.toString())
    setShowPrompt(false)
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 right-6 z-50 w-full max-w-md"
        >
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900">
                  <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Enable Notifications
                </h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Stay updated with task reminders, milestones, and important IPO progress updates.
                </p>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={handleEnable}
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? 'Enabling...' : 'Enable'}
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Ask Later
                  </button>
                </div>
              </div>

              <button
                onClick={handleDismiss}
                className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
