'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import {
  ArrowLeft, CheckCircle2, AlertCircle, Loader2, Zap,
  TrendingUp, Clock, Users, Shield, BarChart3, Sparkles,
} from 'lucide-react'
import { useAppStore } from '@/store/app-store'

type Currency = 'USD' | 'CAD'
type Billing = 'monthly' | 'sixmonth' | 'annual'

interface CheckoutState {
  step: 'loading' | 'billing' | 'success' | 'error'
  planId: string
  billing: Billing
  currency: Currency
  isTrialUpgrade: boolean
  error?: string
  trialEndDate?: Date
}

interface UpgradeFeature {
  icon: React.ReactNode
  title: string
  description: string
}

const TRIAL_UPGRADE_FEATURES: UpgradeFeature[] = [
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: 'Advanced PACE™ Analytics',
    description: 'Deep-dive dashboards and predictive readiness scoring',
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: 'Unlimited Team Members',
    description: 'Collaborate with your entire organization',
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: 'Enterprise Security',
    description: 'SSO, SAML, and advanced compliance controls',
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: 'Priority Support',
    description: '24/7 dedicated support from IPO experts',
  },
]

const PLAN_PRICING = {
  starter: {
    nameEn: 'Starter',
    descriptionEn: 'For companies in early exploration',
    monthlyUSD: 299,
    monthlyCAD: 399,
    sixmonthUSD: 239,
    sixmonthCAD: 319,
    annualUSD: 199,
    annualCAD: 265,
  },
  growth: {
    nameEn: 'Growth',
    descriptionEn: 'For scaling companies',
    monthlyUSD: 799,
    monthlyCAD: 1099,
    sixmonthUSD: 639,
    sixmonthCAD: 879,
    annualUSD: 533,
    annualCAD: 732,
  },
  enterprise: {
    nameEn: 'Enterprise',
    descriptionEn: 'For enterprises',
    monthlyUSD: 1999,
    monthlyCAD: 2799,
    sixmonthUSD: 1599,
    sixmonthCAD: 2239,
    annualUSD: 1333,
    annualCAD: 1866,
  },
}

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const { company, currency } = useAppStore()

  const [state, setState] = useState<CheckoutState>({
    step: 'loading',
    planId: 'growth',
    billing: 'monthly',
    currency: currency as Currency,
    isTrialUpgrade: false,
  })

  const [selectedBilling, setSelectedBilling] = useState<Billing>('monthly')
  const [processing, setProcessing] = useState(false)

  // Parse URL parameters
  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.push('/login?redirect=/pricing')
      return
    }

    const isTrialUpgrade = searchParams.get('is_trial_upgrade') === 'true'
    const plan = (searchParams.get('plan') || 'growth') as string
    const billing = (searchParams.get('billing') || 'monthly') as Billing

    // Set trial end date (mock for demo; in production, fetch from database)
    const trialEndDate = new Date()
    trialEndDate.setDate(trialEndDate.getDate() + 7) // 7 days remaining

    setState((prev) => ({
      ...prev,
      planId: plan,
      billing,
      isTrialUpgrade,
      trialEndDate,
      step: 'billing',
    }))

    setSelectedBilling(billing)
  }, [status, searchParams, router])

  const planDetails = useMemo(() => {
    const plan = PLAN_PRICING[state.planId as keyof typeof PLAN_PRICING] || PLAN_PRICING.growth
    const pricingKey = `${state.billing}${state.currency}` as keyof typeof plan
    const price = (plan as any)[pricingKey] || 0

    return {
      name: plan.nameEn,
      description: plan.descriptionEn,
      price,
      currency: state.currency,
    }
  }, [state.planId, state.billing, state.currency])

  const handleSelectBilling = (billing: Billing) => {
    setSelectedBilling(billing)
    setState((prev) => ({ ...prev, billing }))
  }

  const handleSelectPlan = (planId: string) => {
    setState((prev) => ({ ...prev, planId }))
  }

  const handleCheckout = async () => {
    if (!session?.user) {
      router.push('/login')
      return
    }

    setProcessing(true)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: state.planId,
          billing: state.billing,
          currency: state.currency,
          isTrialUpgrade: state.isTrialUpgrade,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setState((prev) => ({
          ...prev,
          step: 'error',
          error: data.error || 'Failed to create checkout session',
        }))
        setProcessing(false)
        return
      }

      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url
      } else {
        setState((prev) => ({
          ...prev,
          step: 'error',
          error: 'No checkout URL received',
        }))
        setProcessing(false)
      }
    } catch (err) {
      setState((prev) => ({
        ...prev,
        step: 'error',
        error: err instanceof Error ? err.message : 'An error occurred',
      }))
      setProcessing(false)
    }
  }

  const handleBack = () => {
    router.back()
  }

  // Loading state
  if (state.step === 'loading' || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (state.step === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
          <div className="flex justify-center mb-4">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Checkout Error
          </h2>
          <p className="text-center text-gray-600 mb-6">{state.error}</p>
          <button
            onClick={handleBack}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  // Billing selection state
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {state.isTrialUpgrade ? 'Complete Your Premium Upgrade' : 'Get Started with IPOReady'}
            </h1>
            {state.isTrialUpgrade && state.trialEndDate && (
              <p className="text-sm text-gray-600 mt-1">
                Trial ends on {state.trialEndDate.toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Billing & Plan Selection */}
          <div className="lg:col-span-2 space-y-8">
            {/* Trial Upgrade Info */}
            {state.isTrialUpgrade && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-50 border border-blue-200 rounded-2xl p-6"
              >
                <div className="flex gap-4">
                  <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-1">Ready to unlock premium?</h3>
                    <p className="text-sm text-blue-800">
                      Your trial has given you a glimpse of IPOReady's power. Upgrade now to access
                      advanced PACE analytics, unlimited team members, and dedicated support.
                    </p>
                    {company && company.paceScore && (
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <p className="text-sm text-blue-900">
                          <span className="font-semibold">Your current PACE score: {company.paceScore}%</span>
                          {' - '}
                          <span>Access detailed insights and benchmarks with premium</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Billing Cycle Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              <h2 className="text-lg font-semibold text-gray-900">Billing Cycle</h2>
              <div className="grid grid-cols-3 gap-3">
                {(['monthly', 'sixmonth', 'annual'] as Billing[]).map((billing) => (
                  <button
                    key={billing}
                    onClick={() => handleSelectBilling(billing)}
                    className={`px-4 py-3 rounded-xl font-medium transition-all ${
                      selectedBilling === billing
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-white border border-gray-200 text-gray-900 hover:border-blue-300'
                    }`}
                  >
                    {billing === 'monthly' && (
                      <div className="text-sm">
                        <div>Monthly</div>
                        {state.currency === 'USD' && <div className="text-xs opacity-75">$29/mo</div>}
                      </div>
                    )}
                    {billing === 'sixmonth' && (
                      <div className="text-sm">
                        <div>6 Months</div>
                        <div className="text-xs opacity-75">Save 20%</div>
                      </div>
                    )}
                    {billing === 'annual' && (
                      <div className="text-sm">
                        <div>Annual</div>
                        <div className="text-xs opacity-75">Save 33%</div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Plan Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <h2 className="text-lg font-semibold text-gray-900">Select Plan</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['starter', 'growth', 'enterprise'] as const).map((planId) => {
                  const plan = PLAN_PRICING[planId]
                  const pricingKey = `${selectedBilling}${state.currency}` as keyof typeof plan
                  const price = (plan as any)[pricingKey] || 0
                  const isSelected = state.planId === planId

                  return (
                    <button
                      key={planId}
                      onClick={() => handleSelectPlan(planId)}
                      className={`p-6 rounded-2xl transition-all text-left ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-400'
                          : 'bg-white border border-gray-200 text-gray-900 hover:border-blue-300'
                      }`}
                    >
                      <h3 className="font-bold text-lg mb-1">{plan.nameEn}</h3>
                      <p className={`text-sm mb-4 ${isSelected ? 'text-blue-100' : 'text-gray-600'}`}>
                        {plan.descriptionEn}
                      </p>
                      <div className="flex items-baseline gap-1 mb-4">
                        <span className="text-3xl font-bold">${price}</span>
                        <span className={isSelected ? 'text-blue-100' : 'text-gray-600'}>
                          /{selectedBilling === 'monthly' ? 'mo' : selectedBilling === 'sixmonth' ? '6mo' : 'yr'}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Selected</span>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </motion.div>

            {/* Upgrade Benefits for Trial Users */}
            {state.isTrialUpgrade && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
              >
                <h2 className="text-lg font-semibold text-gray-900">What You'll Get</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {TRIAL_UPGRADE_FEATURES.map((feature, idx) => (
                    <div key={idx} className="bg-white rounded-xl p-4 border border-gray-200">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-blue-50 text-blue-600`}>
                        {feature.icon}
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right: Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-20 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-4">Order Summary</h3>

                {/* Company Info (if trial upgrade) */}
                {state.isTrialUpgrade && company && (
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <p className="text-sm text-gray-600">Company</p>
                    <p className="font-semibold text-gray-900">{company.name}</p>
                  </div>
                )}

                {/* Plan Details */}
                <div className="space-y-2 pb-4 border-b border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Plan</span>
                    <span className="font-medium text-gray-900">{planDetails.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Billing</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {selectedBilling === 'monthly' ? 'Monthly' : selectedBilling === 'sixmonth' ? '6 Months' : 'Annual'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Currency</span>
                    <span className="font-medium text-gray-900">{state.currency}</span>
                  </div>
                </div>

                {/* Total */}
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between items-baseline">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-2xl font-bold text-gray-900">
                      ${planDetails.price}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {selectedBilling === 'monthly' ? 'Billed monthly' : selectedBilling === 'sixmonth' ? 'Billed every 6 months' : 'Billed annually'}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-2">
                    <Clock className="w-3 h-3" />
                    3-month minimum commitment
                  </p>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={processing}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Continue to Payment
                  </>
                )}
              </button>

              {/* Security Info */}
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-600 flex items-center justify-center gap-1">
                  <Shield className="w-3 h-3" />
                  Secured by Stripe
                </p>
              </div>

              {/* Trial Info */}
              {state.isTrialUpgrade && state.trialEndDate && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-xs text-amber-900 font-medium">Trial ends soon</p>
                  <p className="text-xs text-amber-800 mt-1">
                    Upgrade before {state.trialEndDate.toLocaleDateString()} to continue uninterrupted access
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
