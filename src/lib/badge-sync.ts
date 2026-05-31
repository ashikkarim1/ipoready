// ── Badge Synchronization Utilities ─────────────────────────────────────────
// This module handles real-time synchronization of badge counts across the app

import { useAppStore, getAppStoreHook } from '@/store/app-store'

// ── Debounce Configuration ──────────────────────────────────────────────────
const BADGE_SYNC_DEBOUNCE_MS = 100
const BADGE_SYNC_INTERVAL_MS = 60000 // Sync every 60 seconds

let syncTimeout: NodeJS.Timeout | null = null
let syncIntervalId: NodeJS.Timeout | null = null
let lastSyncTime = 0
let pendingSync = false

// ── Broadcast Channel for Cross-Tab Sync ────────────────────────────────────
let broadcastChannel: BroadcastChannel | null = null

function initBroadcastChannel() {
  if (typeof window === 'undefined') return

  try {
    broadcastChannel = new BroadcastChannel('ipoready-badge-sync')
    broadcastChannel.onmessage = (event) => {
      const { type, counts } = event.data
      if (type === 'badge-update' && counts) {
        const store = useAppStore()
        store.updateBadgeCounts(counts)
      }
    }
  } catch (e) {
    // BroadcastChannel not supported in all environments
    console.debug('BroadcastChannel not available for badge sync')
  }
}

// ── Badge Count Sync Function ───────────────────────────────────────────────
export async function syncBadgeCounts() {
  try {
    const store = useAppStore()
    await store.syncBadgeCounts()

    // Broadcast update to other tabs
    if (broadcastChannel) {
      broadcastChannel.postMessage({
        type: 'badge-update',
        counts: {
          unreadNotificationCount: store.unreadNotificationCount,
          overdueTaskCount: store.overdueTaskCount,
          dueSoonTaskCount: store.dueSoonTaskCount,
          newDocumentCount: store.newDocumentCount,
          pendingInviteCount: store.pendingInviteCount,
        },
      })
    }

    lastSyncTime = Date.now()
    pendingSync = false
  } catch (error) {
    console.error('Error syncing badge counts:', error)
    pendingSync = false
  }
}

// ── Debounced Sync Trigger ──────────────────────────────────────────────────
export function triggerBadgeSync() {
  if (typeof window === 'undefined') return

  // Clear existing timeout
  if (syncTimeout) {
    clearTimeout(syncTimeout)
  }

  // Set new debounced sync
  syncTimeout = setTimeout(() => {
    syncBadgeCounts()
  }, BADGE_SYNC_DEBOUNCE_MS)

  pendingSync = true
}

// ── Immediate Badge Update ──────────────────────────────────────────────────
export function updateBadgeImmediate(
  type: 'notification' | 'task' | 'document' | 'invite' | 'achievement',
  delta: number = 1
) {
  if (typeof window === 'undefined') return

  const store = useAppStore()

  switch (type) {
    case 'notification':
      store.updateBadgeCounts({
        unreadNotificationCount: Math.max(0, store.unreadNotificationCount + delta),
      })
      break
    case 'task':
      // For tasks, we should sync to get accurate overdue/due-soon split
      triggerBadgeSync()
      break
    case 'document':
      store.updateBadgeCounts({
        newDocumentCount: Math.max(0, store.newDocumentCount + delta),
      })
      break
    case 'invite':
      store.updateBadgeCounts({
        pendingInviteCount: Math.max(0, store.pendingInviteCount + delta),
      })
      break
    case 'achievement':
      store.updateBadgeCounts({
        unlockedAchievementCount: Math.max(0, store.unlockedAchievementCount + delta),
      })
      break
  }

  // Broadcast to other tabs
  if (broadcastChannel) {
    broadcastChannel.postMessage({
      type: 'badge-update',
      counts: {
        unreadNotificationCount: store.unreadNotificationCount,
        overdueTaskCount: store.overdueTaskCount,
        dueSoonTaskCount: store.dueSoonTaskCount,
        newDocumentCount: store.newDocumentCount,
        pendingInviteCount: store.pendingInviteCount,
      },
    })
  }
}

// ── Initialize Badge Sync on Client Load ────────────────────────────────────
export function initBadgeSync() {
  if (typeof window === 'undefined') return

  // Initialize broadcast channel
  initBroadcastChannel()

  // Initial sync
  syncBadgeCounts()

  // Set up periodic sync
  if (syncIntervalId) {
    clearInterval(syncIntervalId)
  }

  syncIntervalId = setInterval(() => {
    syncBadgeCounts()
  }, BADGE_SYNC_INTERVAL_MS)
}

// ── Cleanup Badge Sync ──────────────────────────────────────────────────────
export function cleanupBadgeSync() {
  if (syncTimeout) {
    clearTimeout(syncTimeout)
    syncTimeout = null
  }

  if (syncIntervalId) {
    clearInterval(syncIntervalId)
    syncIntervalId = null
  }

  if (broadcastChannel) {
    broadcastChannel.close()
    broadcastChannel = null
  }
}

// ── Listen to Notification Store Changes ────────────────────────────────────
export function subscribeToBadgeUpdates(callback: () => void) {
  if (typeof window === 'undefined') return () => {}

  // Get the underlying Zustand hook to access subscribe method
  const storeHook = getAppStoreHook()

  // Subscribe to store changes
  const unsubscribe = storeHook.subscribe((state: any) => {
    callback()
  })

  return unsubscribe || (() => {})
}
