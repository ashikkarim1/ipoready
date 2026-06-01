'use client'

import { useEffect, useState } from 'react'

export type SubscriptionPlan = 'starter' | 'growth' | 'enterprise'
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'cancelled' | 'expired'

export interface SubscriptionData {
  plan: SubscriptionPlan
  status: SubscriptionStatus
  trialDaysRemaining: number | null
  trialEndDate: Date | null
  currentBillingDate: Date | null
  nextBillingDate: Date | null
}

interface UseSubscriptionReturn extends SubscriptionData {
  isLoading: boolean
  isError: boolean
  error?: string
}

export function useSubscription(): UseSubscriptionReturn {
  const [data, setData] = useState<SubscriptionData>({
    plan: 'starter',
    status: 'active',
    trialDaysRemaining: null,
    trialEndDate: null,
    currentBillingDate: null,
    nextBillingDate: null,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [error, setError] = useState<string>()

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setIsLoading(true)
        setIsError(false)
        setError(undefined)

        const response = await fetch('/api/company')
        if (!response.ok) {
          throw new Error(`Failed to fetch subscription: ${response.statusText}`)
        }

        const company = await response.json()
        
        // Calculate trial days remaining
        let trialDaysRemaining: number | null = null
        let trialEndDate: Date | null = null
        
        if (company.trial_status === 'active' && company.trial_end_date) {
          trialEndDate = new Date(company.trial_end_date)
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          trialEndDate.setHours(0, 0, 0, 0)
          const msPerDay = 24 * 60 * 60 * 1000
          trialDaysRemaining = Math.max(0, Math.ceil((trialEndDate.getTime() - today.getTime()) / msPerDay))
        }

        // Parse billing dates
        let currentBillingDate: Date | null = null
        let nextBillingDate: Date | null = null
        
        if (company.current_period_start) {
          currentBillingDate = new Date(company.current_period_start)
        }
        if (company.current_period_end) {
          nextBillingDate = new Date(company.current_period_end)
        }

        setData({
          plan: (company.subscription_plan || 'starter') as SubscriptionPlan,
          status: (company.subscription_status || 'active') as SubscriptionStatus,
          trialDaysRemaining,
          trialEndDate,
          currentBillingDate,
          nextBillingDate,
        })
      } catch (err) {
        setIsError(true)
        setError(err instanceof Error ? err.message : 'Unknown error')
        console.error('[useSubscription]', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSubscription()

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSubscription, 30000)
    return () => clearInterval(interval)
  }, [])

  return {
    ...data,
    isLoading,
    isError,
    error,
  }
}
