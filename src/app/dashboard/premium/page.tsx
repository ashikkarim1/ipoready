'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Check, Lock, Zap, Crown, Users, TrendingUp, Shield, Globe } from 'lucide-react'
import Link from 'next/link'

const ICON_MAP: Record<string, any> = {
  crown: Crown,
  users: Users,
  zap: Zap,
  trello: TrendingUp,
  'bar-chart-3': TrendingUp,
  shield: Shield,
  'check-circle': Check,
  globe: Globe,
}

export default function PremiumPage() {
  const [features, setFeatures] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTier, setSelectedTier] = useState<'professional' | 'enterprise'>('professional')

  useEffect(() => {
    async function loadFeatures() {
      try {
        const url = new URL('/api/premium/features', window.location.origin)
        // Get company ID from URL or localStorage
        const companyId = new URLSearchParams(window.location.search).get('companyId') ||
                         localStorage.getItem('activeCompanyId') || '1'
        url.searchParams.set('companyId', companyId)

        const res = await fetch(url)
        if (res.ok) {
          const data = await res.json()
          setFeatures(data)
        }
      } catch (error) {
        console.error('Failed to load features:', error)
      } finally {
        setLoading(false)
      }
    }
    loadFeatures()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <Zap className="w-8 h-8 text-accent mx-auto" />
          </div>
          <p className="text-text-muted">Loading premium features...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="h1 mb-2">Premium Features</h1>
            <p className="text-text-muted">
              Unlock advanced dashboards, coordination tools, and global capabilities
            </p>
          </motion.div>
        </div>
      </div>

      {/* Pricing Tiers */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Starter (Free) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
            className="rounded-xl border border-slate-200 bg-white p-8"
          >
            <h3 className="h4 mb-2">Starter</h3>
            <p className="text-text-muted text-sm mb-4">Core IPO planning</p>
            <div className="mb-6">
              <div className="text-3xl font-bold text-nav">$0</div>
              <p className="text-xs text-text-muted mt-1">Forever free</p>
            </div>
            <button disabled className="w-full py-2.5 px-4 rounded-lg bg-slate-100 text-text-muted font-medium text-sm cursor-not-allowed">
              Current Plan
            </button>
          </motion.div>

          {/* Professional */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border-2 border-accent bg-white p-8 relative"
          >
            <div className="absolute -top-4 left-6">
              <span className="bg-accent text-white text-xs font-bold px-3 py-1 rounded-full">RECOMMENDED</span>
            </div>
            <h3 className="h4 mb-2">Professional</h3>
            <p className="text-text-muted text-sm mb-4">Executive dashboards & insights</p>
            <div className="mb-6">
              <div className="text-3xl font-bold text-nav">$99<span className="text-lg text-text-muted">/mo</span></div>
              <p className="text-xs text-text-muted mt-1">or $990/year (save 17%)</p>
            </div>
            <button
              onClick={() => setSelectedTier('professional')}
              className="w-full py-2.5 px-4 rounded-lg bg-accent text-white font-medium text-sm hover:bg-opacity-90 transition-all">
              Upgrade Now
            </button>
          </motion.div>

          {/* Enterprise */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-slate-200 bg-white p-8"
          >
            <h3 className="h4 mb-2">Enterprise</h3>
            <p className="text-text-muted text-sm mb-4">Complete orchestration</p>
            <div className="mb-6">
              <div className="text-3xl font-bold text-nav">$250<span className="text-lg text-text-muted">/mo</span></div>
              <p className="text-xs text-text-muted mt-1">or $2,500/year (save 17%)</p>
            </div>
            <button
              onClick={() => setSelectedTier('enterprise')}
              className="w-full py-2.5 px-4 rounded-lg border-2 border-nav text-nav font-medium text-sm hover:bg-slate-50 transition-all">
              Upgrade Now
            </button>
          </motion.div>
        </div>

        {/* Feature Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl border border-slate-200 overflow-hidden"
        >
          <div className="p-8 border-b border-slate-200">
            <h2 className="h3 mb-2">What's Included in Each Tier</h2>
            <p className="text-text-muted">All Professional features are included in Enterprise, plus advanced collaboration tools</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left p-6 font-semibold text-nav">Feature</th>
                  <th className="text-center p-6 font-semibold text-nav">Starter</th>
                  <th className="text-center p-6 font-semibold text-nav">Professional</th>
                  <th className="text-center p-6 font-semibold text-nav">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {features?.features?.professional?.map((feature: any, idx: number) => {
                  const Icon = ICON_MAP[feature.icon] || Crown
                  return (
                    <tr key={feature.key} className={idx % 2 === 0 ? 'bg-slate-50' : ''}>
                      <td className="p-6">
                        <div className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Icon className="w-3 h-3 text-nav" />
                          </div>
                          <div>
                            <div className="font-medium text-nav">{feature.name}</div>
                            <div className="text-xs text-text-muted mt-1">{feature.valueProp}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-6 text-center">
                        <div className="w-5 h-5 mx-auto rounded-full bg-slate-200 flex items-center justify-center">
                          <Lock className="w-3 h-3 text-text-muted" />
                        </div>
                      </td>
                      <td className="p-6 text-center">
                        <div className="w-5 h-5 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                          <Check className="w-3 h-3 text-green-700" />
                        </div>
                      </td>
                      <td className="p-6 text-center">
                        <div className="w-5 h-5 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                          <Check className="w-3 h-3 text-green-700" />
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {features?.features?.enterprise?.filter((f: any) => !features?.features?.professional?.find((pf: any) => pf.key === f.key))?.map((feature: any, idx: number) => {
                  const Icon = ICON_MAP[feature.icon] || Crown
                  return (
                    <tr key={feature.key} className={idx % 2 === 0 ? 'bg-slate-50' : ''}>
                      <td className="p-6">
                        <div className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Icon className="w-3 h-3 text-red-700" />
                          </div>
                          <div>
                            <div className="font-medium text-nav">{feature.name}</div>
                            <div className="text-xs text-text-muted mt-1">{feature.valueProp}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-6 text-center">
                        <div className="w-5 h-5 mx-auto rounded-full bg-slate-200 flex items-center justify-center">
                          <Lock className="w-3 h-3 text-text-muted" />
                        </div>
                      </td>
                      <td className="p-6 text-center">
                        <div className="w-5 h-5 mx-auto rounded-full bg-slate-200 flex items-center justify-center">
                          <Lock className="w-3 h-3 text-text-muted" />
                        </div>
                      </td>
                      <td className="p-6 text-center">
                        <div className="w-5 h-5 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                          <Check className="w-3 h-3 text-green-700" />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 grid md:grid-cols-2 gap-6"
        >
          <div className="bg-white rounded-xl p-8 border border-slate-200">
            <h4 className="font-semibold text-nav mb-2">Can I try before paying?</h4>
            <p className="text-sm text-text-muted">
              Yes! New Premium subscribers get a 7-day free trial. No credit card required to start.
            </p>
          </div>
          <div className="bg-white rounded-xl p-8 border border-slate-200">
            <h4 className="font-semibold text-nav mb-2">Can I cancel anytime?</h4>
            <p className="text-sm text-text-muted">
              Absolutely. Cancel your subscription anytime. You'll keep access through the end of your billing period.
            </p>
          </div>
          <div className="bg-white rounded-xl p-8 border border-slate-200">
            <h4 className="font-semibold text-nav mb-2">What about custom plans?</h4>
            <p className="text-sm text-text-muted">
              Need a custom configuration? <Link href="/contact" className="text-accent font-medium hover:underline">Contact our enterprise team</Link>.
            </p>
          </div>
          <div className="bg-white rounded-xl p-8 border border-slate-200">
            <h4 className="font-semibold text-nav mb-2">Is there a discount for annual?</h4>
            <p className="text-sm text-text-muted">
              Yes, save 17% when you pay annually. Plus you get early access to new features.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
