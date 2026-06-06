'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Zap, Loader2 } from 'lucide-react'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  featureKey: string
  featureName: string
}

/**
 * Upgrade Modal
 * World-class premium upgrade flow
 */
export default function UpgradeModal({
  isOpen,
  onClose,
  featureKey,
  featureName,
}: UpgradeModalProps) {
  const [step, setStep] = useState<'select' | 'trial' | 'payment'>('select')
  const [selectedTier, setSelectedTier] = useState<'professional' | 'enterprise'>('professional')
  const [loading, setLoading] = useState(false)
  const [trialStarted, setTrialStarted] = useState(false)

  const handleStartTrial = async () => {
    setLoading(true)
    try {
      // In production: create trial subscription with Stripe
      // For now: simulate trial activation
      const companyId = localStorage.getItem('activeCompanyId') || '1'
      const response = await fetch('/api/premium/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          featureKey,
          paymentId: 'trial_' + Date.now(),
        }),
      })

      if (response.ok) {
        setTrialStarted(true)
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      }
    } catch (error) {
      console.error('Trial activation failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const tiers = {
    professional: {
      name: 'Professional',
      price: '$99/month',
      savings: 'Save 17% annually',
      features: [
        '✓ CEO Command Center',
        '✓ Board Intelligence Portal',
        '✓ IPO Timeline Prediction',
        '✓ Priority support',
        '✓ 7-day free trial',
      ],
    },
    enterprise: {
      name: 'Enterprise',
      price: '$250/month',
      savings: 'Custom pricing available',
      features: [
        '✓ All Professional features',
        '✓ Advisor Orchestration Network',
        '✓ CFO Financial Dashboard',
        '✓ GC Legal Dashboard',
        '✓ Post-IPO Compliance',
        '✓ Multi-Country Filing',
        '✓ Dedicated support',
      ],
    },
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-6 flex items-center justify-between border-b border-slate-700">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Unlock {featureName}</h2>
                <p className="text-sm text-slate-300">Choose the plan that fits your needs</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8">
              {!trialStarted ? (
                <div className="space-y-8">
                  {/* Tier Selection */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-nav">Select Your Plan</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {Object.entries(tiers).map(([tierKey, tier]) => (
                        <motion.button
                          key={tierKey}
                          onClick={() => setSelectedTier(tierKey as 'professional' | 'enterprise')}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`p-6 rounded-xl border-2 transition-all text-left ${
                            selectedTier === tierKey
                              ? 'border-accent bg-red-50'
                              : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                          }`}
                        >
                          <div className="font-bold text-nav mb-1">{tier.name}</div>
                          <div className="text-2xl font-bold text-nav mb-1">{tier.price}</div>
                          <div className="text-xs text-text-muted mb-4">{tier.savings}</div>
                          <div className="space-y-2">
                            {tier.features.map((feature) => (
                              <div key={feature} className="text-sm text-text-muted flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                                <span>{feature}</span>
                              </div>
                            ))}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Trial CTA */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                    <div className="flex items-start gap-3">
                      <Zap className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-nav mb-1">Try Free for 7 Days</h4>
                        <p className="text-sm text-text-muted mb-4">
                          Get full access to {selectedTier === 'professional' ? 'Professional' : 'Enterprise'} features. No credit card required. Cancel anytime.
                        </p>
                        <button
                          onClick={handleStartTrial}
                          disabled={loading}
                          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-accent text-white font-semibold hover:bg-opacity-90 disabled:opacity-50 transition-all"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Starting trial...
                            </>
                          ) : (
                            <>
                              <Zap className="w-4 h-4" />
                              Start 7-Day Free Trial
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Or pay now */}
                  <div className="text-center">
                    <button
                      onClick={() => setStep('payment')}
                      className="text-sm font-semibold text-accent hover:underline"
                    >
                      Or pay now with credit card
                    </button>
                  </div>

                  {/* FAQ */}
                  <div className="space-y-3 pt-6 border-t border-slate-200">
                    <h4 className="font-semibold text-nav">Questions?</h4>
                    <div className="space-y-2 text-sm text-text-muted">
                      <p>
                        <strong>Trial terms:</strong> Your free trial includes 7 days of full access. After the trial ends, we'll charge your payment method unless you cancel.
                      </p>
                      <p>
                        <strong>Cancel anytime:</strong> You can cancel your subscription at any time. You'll have access through the end of your billing period.
                      </p>
                      <p>
                        <strong>Enterprise pricing:</strong> Need a custom plan? <a href="/contact" className="text-accent font-semibold hover:underline">Contact our team</a>.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Success State */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4"
                  >
                    <Check className="w-8 h-8 text-green-600" />
                  </motion.div>
                  <h3 className="h4 mb-2">Trial Activated!</h3>
                  <p className="text-text-muted mb-6">
                    Welcome to {selectedTier === 'professional' ? 'Professional' : 'Enterprise'}. Redirecting to your dashboard...
                  </p>
                  <div className="animate-spin inline-block">
                    <Loader2 className="w-5 h-5 text-accent" />
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
