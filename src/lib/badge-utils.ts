// ── Badge Utility Functions ─────────────────────────────────────────────────
// Helper functions for badge calculations and formatting

import { Task } from '@/types'

/**
 * Calculate overdue tasks from a task list
 */
export function calculateOverdueTasks(tasks: Task[]): number {
  const now = new Date()
  return tasks.filter((task) => {
    if (task.status === 'completed') return false
    if (!task.dueDate) return false
    return new Date(task.dueDate) < now
  }).length
}

/**
 * Calculate due-soon tasks (within 7 days) from a task list
 */
export function calculateDueSoonTasks(tasks: Task[]): number {
  const now = new Date()
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  return tasks.filter((task) => {
    if (task.status === 'completed') return false
    if (!task.dueDate) return false
    const dueDate = new Date(task.dueDate)
    return dueDate >= now && dueDate < sevenDaysFromNow
  }).length
}

/**
 * Format a count with "99+" display for large numbers
 */
export function formatBadgeDisplay(count: number, maxDisplay: number = 99): string {
  if (count === 0) return '0'
  if (count > maxDisplay) return `${maxDisplay}+`
  return count.toString()
}

/**
 * Determine if a badge should be visible
 */
export function shouldShowBadge(
  count: number,
  hideZero: boolean = true
): boolean {
  if (hideZero && count === 0) return false
  return true
}

/**
 * Get badge color based on count severity
 */
export function getBadgeColorBySeverity(
  count: number,
  type: 'notification' | 'task' | 'warning'
): string {
  switch (type) {
    case 'notification':
      return '#E8312A' // Red alert
    case 'task':
      if (count >= 5) return '#DC2626' // Dark red
      if (count >= 3) return '#F97316' // Orange
      return '#FCD34D' // Yellow
    case 'warning':
      return '#DC2626' // Red
    default:
      return '#6B7280' // Gray
  }
}

/**
 * Generate accessible aria-label for badges
 */
export function generateBadgeAriaLabel(
  count: number,
  type: 'notification' | 'task' | 'achievement' | 'document'
): string {
  const labels: Record<string, string> = {
    notification: `${count} unread notification${count !== 1 ? 's' : ''}`,
    task: `${count} overdue task${count !== 1 ? 's' : ''}`,
    achievement: `${count} new achievement${count !== 1 ? 's' : ''}`,
    document: `${count} new document${count !== 1 ? 's' : ''}`,
  }
  return labels[type] || `${count} item${count !== 1 ? 's' : ''}`
}

/**
 * Check if badge should pulse (for urgent notifications)
 */
export function shouldPulseBadge(count: number, type: 'notification' | 'task'): boolean {
  if (type === 'notification') {
    return count > 0
  }
  if (type === 'task') {
    return count > 0
  }
  return false
}

/**
 * Get badge text content for display
 */
export function getBadgeText(
  count: number,
  type: 'notification' | 'task' | 'achievement',
  maxDisplay: number = 99
): string {
  const display = formatBadgeDisplay(count, maxDisplay)

  const labels: Record<string, string> = {
    notification: `${display} new`,
    task: `${display} overdue`,
    achievement: `${display} unlocked`,
  }

  return labels[type] || display
}

/**
 * Debounce badge count updates to reduce API calls
 */
export function debounceBadgeUpdate(
  callback: () => void,
  delayMs: number = 100
): (...args: any[]) => void {
  let timeoutId: NodeJS.Timeout | null = null

  return function debounced(...args: any[]) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      callback()
      timeoutId = null
    }, delayMs)
  }
}

/**
 * Batch badge count updates
 */
export interface BatchBadgeUpdate {
  notifications?: number
  tasks?: number
  documents?: number
  achievements?: number
  invites?: number
}

export function batchUpdateBadges(updates: BatchBadgeUpdate) {
  // This would be called by the store's updateBadgeCounts
  return updates
}

/**
 * Check if badges are in a critical state (urgent)
 */
export function isCriticalBadgeState(
  overdueCount: number,
  dueSoonCount: number,
  notificationCount: number
): boolean {
  return overdueCount > 0 || (notificationCount > 5 && dueSoonCount > 0)
}
