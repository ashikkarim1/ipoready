/**
 * Billing Helper Utilities
 * Date formatting, trial calculations, subscription status helpers
 */

export function formatBillingDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

export function getDaysUntilBilling(nextBillingDate: Date | string): number {
  const billingDate = typeof nextBillingDate === 'string' 
    ? new Date(nextBillingDate) 
    : nextBillingDate
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  billingDate.setHours(0, 0, 0, 0)
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.ceil((billingDate.getTime() - today.getTime()) / msPerDay)
}

export type TrialStatusType = 'not_started' | 'active' | 'expiring_soon' | 'expired'

export function getTrialStatus(trialEndDate: Date | string): TrialStatusType {
  if (!trialEndDate) {
    return 'not_started'
  }
  
  const endDate = typeof trialEndDate === 'string' ? new Date(trialEndDate) : trialEndDate
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  endDate.setHours(0, 0, 0, 0)
  
  const msPerDay = 24 * 60 * 60 * 1000
  const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / msPerDay)
  
  if (daysRemaining < 0) {
    return 'expired'
  } else if (daysRemaining <= 2) {
    return 'expiring_soon'
  } else {
    return 'active'
  }
}

export interface TrialProgress {
  daysElapsed: number
  daysTotal: number
  percentComplete: number
}

export function calculateTrialProgress(
  trialStartDate: Date | string,
  trialEndDate: Date | string
): TrialProgress {
  const startDate = typeof trialStartDate === 'string' ? new Date(trialStartDate) : trialStartDate
  const endDate = typeof trialEndDate === 'string' ? new Date(trialEndDate) : trialEndDate
  
  const msPerDay = 24 * 60 * 60 * 1000
  const daysTotal = Math.ceil((endDate.getTime() - startDate.getTime()) / msPerDay)
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  startDate.setHours(0, 0, 0, 0)
  
  const daysElapsed = Math.max(0, Math.ceil((today.getTime() - startDate.getTime()) / msPerDay))
  const percentComplete = Math.min(100, Math.round((daysElapsed / daysTotal) * 100))
  
  return {
    daysElapsed,
    daysTotal: Math.max(daysTotal, 1),
    percentComplete,
  }
}

export function isPastDue(status: string): boolean {
  return status === 'past_due'
}

export function getReadableTrialCountdown(daysRemaining: number): string {
  if (daysRemaining < 0) {
    return 'Trial expired'
  } else if (daysRemaining === 0) {
    return 'Expires today'
  } else if (daysRemaining === 1) {
    return 'Expires tomorrow'
  } else if (daysRemaining <= 7) {
    return `Expires in ${daysRemaining} days`
  } else {
    const weeks = Math.floor(daysRemaining / 7)
    const days = daysRemaining % 7
    if (days === 0) {
      return `Expires in ${weeks} week${weeks > 1 ? 's' : ''}`
    } else {
      return `Expires in ${weeks} week${weeks > 1 ? 's' : ''} ${days} day${days > 1 ? 's' : ''}`
    }
  }
}
