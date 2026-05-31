'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/store/app-store'
import { initBadgeSync, cleanupBadgeSync, syncBadgeCounts } from './badge-sync'

/**
 * Hook to initialize badge synchronization on page load
 * Should be called once in the root layout or a provider
 */
export function useBadgeSync() {
  const store = useAppStore()

  useEffect(() => {
    // Initialize badge sync on mount
    initBadgeSync()

    // Perform initial sync
    store.syncBadgeCounts()

    // Cleanup on unmount
    return () => {
      cleanupBadgeSync()
    }
  }, [store])
}

/**
 * Hook to manually trigger badge sync
 * Returns a function to sync badge counts on demand
 */
export function useBadgeSyncManual() {
  const store = useAppStore()

  return async () => {
    await store.syncBadgeCounts()
  }
}

/**
 * Hook to watch for badge count changes
 * Useful for triggering actions when badge counts update
 */
export function useBadgeCountWatch(
  callback: (counts: {
    unreadNotifications: number
    overdueTasks: number
    dueSoonTasks: number
    newDocuments: number
    pendingInvites: number
  }) => void
) {
  const store = useAppStore()

  useEffect(() => {
    // Call immediately with current counts
    callback({
      unreadNotifications: store.unreadNotificationCount,
      overdueTasks: store.overdueTaskCount,
      dueSoonTasks: store.dueSoonTaskCount,
      newDocuments: store.newDocumentCount,
      pendingInvites: store.pendingInviteCount,
    })

    // Note: Zustand doesn't have direct subscription in the way react hooks work
    // For reactive updates, components should re-render when these values change
  }, [
    store.unreadNotificationCount,
    store.overdueTaskCount,
    store.dueSoonTaskCount,
    store.newDocumentCount,
    store.pendingInviteCount,
    callback,
  ])
}
