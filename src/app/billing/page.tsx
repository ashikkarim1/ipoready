'use client'

import { useRouter } from 'next/navigation'
import { useSubscription } from '@/hooks/useSubscription'
import { SubscriptionStatusWidget } from '@/components/SubscriptionStatusWidget'
import { BillingHistoryTable, BillingTransaction } from '@/components/BillingHistoryTable'

// Mock billing history - in production, fetch from /api/billing/history
const MOCK_BILLING_HISTORY: BillingTransaction[] = [
  {
    id: '1',
    date: new Date('2026-06-01'),
    description: 'Growth Plan - Monthly Subscription',
    amount: 799,
    currency: 'USD',
    status: 'completed',
  },
  {
    id: '2',
    date: new Date('2026-05-01'),
    description: 'Growth Plan - Monthly Subscription',
    amount: 799,
    currency: 'USD',
    status: 'completed',
  },
  {
    id: '3',
    date: new Date('2026-04-01'),
    description: 'Growth Plan - Monthly Subscription',
    amount: 799,
    currency: 'USD',
    status: 'completed',
  },
]

const PLANS = [
  {
    name: 'Starter',
    price: 299,
    currency: 'USD',
    description: 'Perfect for getting started',
    features: [
      '1 company',
      '3 team members',
      '5 GB storage',
      'Email support',
      'Basic PACE tracking',
    ],
  },
  {
    name: 'Growth',
    price: 799,
    currency: 'USD',
    description: 'For scaling companies',
    features: [
      'Unlimited companies',
      '10 team members',
      '50 GB storage',
      'Priority support',
      'Advanced PACE & prospectus',
      'Document integrations',
      'Custom workflows',
    ],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 1999,
    currency: 'USD',
    description: 'For enterprises',
    features: [
      'Everything in Growth',
      'Unlimited team members',
      'Unlimited storage',
      'Dedicated support',
      'API access',
      'SSO/SAML',
      'Custom features',
    ],
  },
]

export default function BillingPage() {
  const router = useRouter()
  const subscription = useSubscription()

  const handleManageClick = () => {
    // In production, open Stripe billing portal
    router.push('/api/billing/portal')
  }

  const handleUpgradeClick = (plan: string, isFromTrial: boolean = false) => {
    const params = new URLSearchParams({
      plan: plan.toLowerCase(),
    })
    if (isFromTrial) {
      params.append('is_trial_upgrade', 'true')
    }
    router.push(`/checkout?${params.toString()}`)
  }

  const handleCancelClick = () => {
    if (confirm('Are you sure you want to cancel your subscription? All data will be preserved but your access will end at the end of your current billing period.')) {
      // Call cancel endpoint
      fetch('/api/billing/cancel-subscription', {
        method: 'POST',
      }).then((res) => {
        if (res.ok) {
          alert('Subscription cancelled. Your access will end on your next billing date.')
          router.refresh()
        }
      })
    }
  }

  if (subscription.isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-48" />
          <div className="h-24 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Billing & Subscription</h1>
        <p className="text-gray-600">Manage your subscription, payment method, and billing history</p>
      </div>

      {/* Current Subscription */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Subscription</h2>
        <SubscriptionStatusWidget
          plan={subscription.plan}
          status={subscription.status}
          nextBillingDate={subscription.nextBillingDate}
          onManageClick={handleManageClick}
        />
      </div>

      {/* Payment Method */}
      <div className="rounded-lg border border-gray-200 p-6 bg-white">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Credit Card</p>
            <p className="font-semibold text-gray-900">•••• •••• •••• 4242</p>
            <p className="text-sm text-gray-600 mt-1">Expires 12/2028</p>
          </div>
          <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Update
          </button>
        </div>
      </div>

      {/* Plan Comparison */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Plans & Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-lg border p-6 ${
                plan.highlighted
                  ? 'border-blue-300 bg-blue-50 ring-2 ring-blue-300'
                  : 'border-gray-200 bg-white'
              }`}
            >
              {plan.highlighted && (
                <div className="mb-3">
                  <span className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                    Popular
                  </span>
                </div>
              )}

              <h3 className="text-lg font-bold text-gray-900 mb-2">{plan.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{plan.description}</p>

              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                <span className="text-gray-600 ml-2">/{plan.currency} per month</span>
              </div>

              <button
                onClick={() => handleUpgradeClick(plan.name)}
                disabled={subscription.plan === plan.name.toLowerCase()}
                className="w-full py-2 rounded-md font-medium mb-6 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: plan.highlighted ? '#2563eb' : 'transparent',
                  color: plan.highlighted ? 'white' : '#2563eb',
                  border: plan.highlighted ? 'none' : '1px solid #2563eb',
                }}
              >
                {subscription.plan === plan.name.toLowerCase() ? 'Current Plan' : 'Upgrade'}
              </button>

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="text-green-600 font-bold">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Billing History */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Billing History</h2>
        <BillingHistoryTable transactions={MOCK_BILLING_HISTORY} maxRows={10} />
      </div>

      {/* Danger Zone */}
      {subscription.plan !== 'starter' && (
        <div className="rounded-lg border-2 border-red-300 bg-red-50 p-6">
          <h3 className="text-lg font-semibold text-red-900 mb-2">Danger Zone</h3>
          <p className="text-sm text-red-800 mb-4">
            Cancelling your subscription will end your access at the end of your current billing period. All your data will be preserved.
          </p>
          <button
            onClick={handleCancelClick}
            className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Cancel Subscription
          </button>
        </div>
      )}
    </div>
  )
}
