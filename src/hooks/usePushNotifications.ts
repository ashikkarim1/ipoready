'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  isPushSupported,
  getPushPermissionStatus,
  requestPushPermission,
  getPushSubscription,
} from '@/lib/push-service'
import { subscribeToPush, unsubscribeFromPushNotifications, isUserSubscribed } from '@/lib/push-subscription'

type NotificationPermission = 'granted' | 'denied' | 'default'

interface UsePushNotificationsReturn {
  isSupported: boolean
  permission: NotificationPermission
  isSubscribed: boolean
  isLoading: boolean
  error: string | null
  requestPermission: () => Promise<NotificationPermission>
  subscribe: () => Promise<void>
  unsubscribe: () => Promise<void>
}

/**
 * Hook for managing push notifications
 * Provides permission status, subscription status, and methods to enable/disable
 */
export function usePushNotifications(): UsePushNotificationsReturn {
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check support on mount
  useEffect(() => {
    setIsSupported(isPushSupported())
  }, [])

  // Check current permission status
  useEffect(() => {
    if (!isSupported) return

    const checkStatus = () => {
      setPermission(getPushPermissionStatus())
    }

    checkStatus()

    // Listen for permission changes
    const interval = setInterval(checkStatus, 1000)
    return () => clearInterval(interval)
  }, [isSupported])

  // Check subscription status
  useEffect(() => {
    if (!isSupported || permission !== 'granted') {
      setIsSubscribed(false)
      return
    }

    const checkSubscription = async () => {
      try {
        const subscribed = await isUserSubscribed()
        setIsSubscribed(subscribed)
      } catch (err) {
        console.error('Error checking subscription:', err)
        setIsSubscribed(false)
      }
    }

    checkSubscription()
  }, [isSupported, permission])

  const handleRequestPermission = useCallback(async (): Promise<NotificationPermission> => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await requestPushPermission()
      setPermission(result)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request permission'
      setError(errorMessage)
      return 'denied'
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleSubscribe = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Request permission first if not granted
      if (permission !== 'granted') {
        const result = await handleRequestPermission()
        if (result !== 'granted') {
          throw new Error('Permission not granted')
        }
      }

      // Subscribe
      await subscribeToPush()
      setIsSubscribed(true)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to subscribe to notifications'
      setError(errorMessage)
      setIsSubscribed(false)
    } finally {
      setIsLoading(false)
    }
  }, [permission, handleRequestPermission])

  const handleUnsubscribe = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      await unsubscribeFromPushNotifications()
      setIsSubscribed(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unsubscribe from notifications'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    requestPermission: handleRequestPermission,
    subscribe: handleSubscribe,
    unsubscribe: handleUnsubscribe,
  }
}
