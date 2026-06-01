'use client'

import { formatBillingDate, getDaysUntilBilling } from '@/lib/billing-helpers'
import { SubscriptionPlan } from '@/hooks/useSubscription'

interface SubscriptionStatusWidgetProps {
  plan: SubscriptionPlan
  status: string
  nextBillingDate?: Date | null
  onManageClick?: () => void
}

export function SubscriptionStatusWidget({
  plan,
  status,
  nextBillingDate,
  onManageClick,
}: SubscriptionStatusWidgetProps) {
  const getPlanColor = () => {
    switch (plan) {
      case 'growth':
        return 'bg-blue-50 border-blue-200'
      case 'enterprise':
        return 'bg-amber-50 border-amber-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getPlanBadgeColor = () => {
    switch (plan) {
      case 'growth':
        return 'bg-blue-100 text-blue-800'
      case 'enterprise':
        return 'bg-amber-100 text-amber-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const isTrialing = status === 'trialing'
  const isPastDue = status === 'past_due'
  const daysUntilBilling = nextBillingDate ? getDaysUntilBilling(nextBillingDate) : null

  return (
    <div className={`border rounded-lg p-4 ${getPlanColor()}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPlanBadgeColor()}`}>
              {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan
            </span>
            {isTrialing && (
              <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded">
                Trial
              </span>
            )}
            {isPastDue && (
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                Past Due
              </span>
            )}
          </div>

          {nextBillingDate && daysUntilBilling !== null && (
            <p className="text-sm text-gray-600 mb-3">
              {isTrialing
                ? `Trial ends ${formatBillingDate(nextBillingDate)}`
                : `Next billing: ${formatBillingDate(nextBillingDate)} (${daysUntilBilling} days)`}
            </p>
          )}

          {isPastDue && (
            <p className="text-sm text-red-700 font-medium mb-3">
              Your payment failed. Please update your payment method.
            </p>
          )}
        </div>

        <button
          onClick={onManageClick}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
        >
          Manage
        </button>
      </div>
    </div>
  )
}
