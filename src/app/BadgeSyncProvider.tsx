'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/store/app-store'
import { initBadgeSync, cleanupBadgeSync } from '@/lib/badge-sync'

/**
 * BadgeSyncProvider - Initializes badge synchronization on app load
 * Wrap your entire app or root layout with this component to enable badge sync
 */
export function BadgeSyncProvider({ children }: { children: React.ReactNode }) {
  const store = useAppStore()

  useEffect(() => {
    // Initialize badge sync when component mounts
    initBadgeSync()

    // Perform initial sync to get badge counts from server
    store.syncBadgeCounts().catch((error) => {
      console.error('Failed to sync badge counts on mount:', error)
    })

    // Cleanup when component unmounts
    return () => {
      cleanupBadgeSync()
    }
  }, [store])

  return <>{children}</>
}
