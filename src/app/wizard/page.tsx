'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Rocket, ArrowRight, ArrowLeft, CheckCircle2, Loader2, Globe, Zap, Shield, Star } from 'lucide-react'
import Link from 'next/link'
import { EXCHANGE_LABELS, LISTING_TYPE_LABELS } from '@/lib/utils'
import { Exchange, ListingType } from '@/types'

const WIZARD_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    priceUSD: 299,
    priceCAD: 399,
    period: '/mo',
    icon: Star,
    color: '#717171',
    bg: '#F3F3F1',
    features: ['Full IPO checklist (all 8 phases)', 'PACE™ tracking engine', 'Up to 5 team members', 'CSE & OTC exchanges'],
    note: null,
  },
  {
    id: 'growth',
    name: 'Growth',
    priceUSD: 799,
    priceCAD: 1049,
    period: '/mo',
    icon: Zap,
    color: '#2D7A5F',
    bg: '#EAF5F0',
    popular: true,
    features: ['Everything in Starter', 'TSX, TSXV, CSE, OTC', 'Up to 15 team members', 'WhatsApp AI Companion', 'Expert network access'],
    note: 'Most popular for active listings',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    priceUSD: 1999,
    priceCAD: 2599,
    period: '/mo',
    icon: Shield,
    color: '#7C3AED',
    bg: '#F5F3FF',
    features: ['Everything in Growth', 'All 7 exchanges (NASDAQ/NYSE)', 'Unlimited team members', 'Dedicated IPO coordinator'],
    note: 'For NASDAQ/NYSE & complex deals',
  },
]

const LISTING_TYPE_DESCRIPTIONS = {
  ipo:           { icon: '🚀', title: 'Initial Public Offering (IPO)', desc: 'Raise capital through a new share issuance and list on a public exchange for the first time.' },
  rto:           { icon: '🔄', title: 'Reverse Takeover (RTO)',        desc: 'Merge with an existing shell company to achieve a public listing faster than a traditional IPO.' },
  direct_listing: { icon: '📈', title: 'Direct Listing',               desc: 'List existing shares without raising new capital. No underwriter required.' },
  spac:          { icon: '🎯', title: 'SPAC',                          desc: 'Special Purpose Acquisition Company — raise blind pool capital to acquire a target.' },
  regulation_a:  { icon: '📋', title: 'Regulation A+',                 desc: 'Raise up to $75M from the public under Regulation A+ with fewer SEC requirements.' },
}

const EXCHANGE_DESCRIPTIONS: Partial<Record<Exchange, { typical: string; requirements: string; timeline: string }>> = {
  tsxv:   { typical: 'Junior mining, tech startups, cannabis',            requirements: '$100K–$750K working capital, 200+ shareholders', timeline: '6–12 months' },
  cse:    { typical: 'Emerging companies, cannabis, crypto-adjacent',     requirements: 'Min. $100K net assets, 150+ shareholders',        timeline: '4–8 months' },
  tsx:    { typical: 'Established companies, $10M+ market cap',           requirements: '$7.5M shareholders equity, 1M+ public float',     timeline: '12–18 months' },
  otc:    { typical: 'Small US companies, international cross-list',      requirements: 'Minimal — varies by OTC tier',                    timeline: '2–4 months' },
  nasdaq: { typical: 'Technology, biotech, growth companies',             requirements: '$5M stockholders equity, 450 round lot holders',  timeline: '12–18 months' },
  nyse:   { typical: 'Large established companies',                       requirements: '$40M global market cap, 400+ shareholders',       timeline: '18–24 months' },
  cboe:   { typical: 'Canadian companies cross-listed to US',             requirements: 'TSX listed + US investor interest',               timeline: '8–12 months' },
}

const STEPS = ['Listing Type', 'Exchange', 'Company', 'Plan', 'Launch']

export default function WizardPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [listingType, setListingType] = useState<ListingType | ''>('')
  const [exchange, setExchange] = useState<Exchange | ''>('')
  const [companyName, setCompanyName] = useState('')
  const [sector, setSector] = useState('')
  const [selectedPlan, setSelectedPlan] = useState<string>('starter')
  const [loading, setLoading] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  async function handleLaunch() {
    setLoading(true)
    try {
      await fetch('/api/wizard/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingType,
          targetExchange: exchange,
          companyName,
          sector,
          selectedPlan,
        }),
      })
    } catch {
      // fire-and-forget — navigate to dashboard even if seed fails
    }
    router.push('/dashboard')
  }

  async function handlePlanContinue() {
    if (selectedPlan === 'starter') {
      setStep(s => s + 1)
      return
    }
    // Paid plan → go to Stripe checkout
    setCheckoutLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: selectedPlan, billing: 'monthly', currency: 'USD' }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        // Stripe not yet configured — proceed to dashboard and upgrade later
        setStep(s => s + 1)
      }
    } catch {
      setStep(s => s + 1)
    } finally {
      setCheckoutLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F7F6F4', padding: '1rem' }}>
      <div className="w-full max-w-2xl">

        {/* Logo */}
        <div className="text-center" style={{ marginBottom: '2rem' }}>
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#1A1A1A' }}>
              <Rocket className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-nav">
              IPO<span style={{ color: '#E8312A' }}>Ready</span>
            </span>
          </Link>
        </div>

        {/* Progress */}
        <div className="flex gap-2" style={{ marginBottom: '2rem' }}>
          {STEPS.map((s, i) => (
            <div key={i} className="flex-1">
              <div className="rounded-full transition-all duration-500"
                style={{ height: '6px', background: i <= step ? '#1A1A1A' : '#E5E4E0' }} />
              <p className="text-xs text-center transition-colors" style={{ marginTop: '0.25rem', color: i === step ? '#1A1A1A' : '#9A9A9A', fontWeight: i === step ? 600 : 400 }}>{s}</p>
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="rounded-2xl" style={{ background: '#FFFFFF', border: '1px solid #E5E4E0', padding: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <AnimatePresence mode="wait">

            {/* Step 0: Listing Type */}
            {step === 0 && (
              <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="font-display text-2xl font-bold text-nav" style={{ marginBottom: '0.375rem' }}>How are you going public?</h2>
                <p className="text-text-muted text-sm" style={{ marginBottom: '1.5rem' }}>Choose the path that best describes your listing approach</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {(Object.entries(LISTING_TYPE_DESCRIPTIONS) as [ListingType, typeof LISTING_TYPE_DESCRIPTIONS[keyof typeof LISTING_TYPE_DESCRIPTIONS]][]).map(([key, info]) => (
                    <button key={key} onClick={() => setListingType(key)}
                      className="flex items-start gap-4 rounded-xl text-left border transition-all"
                      style={{ padding: '1rem',
                        ...(listingType === key
                          ? { background: '#F7F6F4', borderColor: '#1A1A1A' }
                          : { background: 'white', borderColor: '#E5E4E0' })
                      }}>
                      <span className="text-2xl" style={{ marginTop: '0.125rem' }}>{info.icon}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-nav">{info.title}</p>
                        <p className="text-text-muted text-xs leading-relaxed" style={{ marginTop: '0.25rem' }}>{info.desc}</p>
                      </div>
                      {listingType === key && <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" style={{ marginTop: '0.125rem' }} />}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 1: Exchange */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="font-display text-2xl font-bold text-nav" style={{ marginBottom: '0.375rem' }}>Target Exchange</h2>
                <p className="text-text-muted text-sm" style={{ marginBottom: '1.5rem' }}>Which exchange are you targeting?</p>
                <div className="grid grid-cols-2 gap-3">
                  {(Object.entries(EXCHANGE_LABELS) as [Exchange, string][]).map(([key, label]) => {
                    const details = EXCHANGE_DESCRIPTIONS[key]
                    return (
                      <button key={key} onClick={() => setExchange(key)}
                        className="rounded-xl text-left border transition-all"
                        style={{ padding: '1rem',
                          ...(exchange === key
                            ? { background: '#F7F6F4', borderColor: '#1A1A1A' }
                            : { background: 'white', borderColor: '#E5E4E0' })
                        }}>
                        <div className="flex items-center justify-between" style={{ marginBottom: '0.25rem' }}>
                          <p className="font-bold text-sm text-nav">{key.toUpperCase()}</p>
                          {exchange === key && <CheckCircle2 className="w-4 h-4 text-accent" />}
                        </div>
                        {details && (
                          <>
                            <p className="text-text-light text-xs" style={{ marginBottom: '0.25rem' }}>{details.typical}</p>
                            <div className="flex items-center gap-1">
                              <Globe className="w-3 h-3 text-text-light" />
                              <span className="text-text-light text-xs">{details.timeline}</span>
                            </div>
                          </>
                        )}
                      </button>
                    )
                  })}
                </div>
                {exchange && EXCHANGE_DESCRIPTIONS[exchange as Exchange] && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border" style={{ marginTop: '1rem', padding: '1rem', background: '#F7F6F4', borderColor: '#E5E4E0' }}>
                    <p className="text-nav text-xs font-semibold" style={{ marginBottom: '0.25rem' }}>Requirements for {exchange.toUpperCase()}</p>
                    <p className="text-text-muted text-xs">{EXCHANGE_DESCRIPTIONS[exchange as Exchange]?.requirements}</p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Step 2: Company */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="font-display text-2xl font-bold text-nav" style={{ marginBottom: '0.375rem' }}>Tell us about your company</h2>
                <p className="text-text-muted text-sm" style={{ marginBottom: '1.5rem' }}>We'll personalize your checklist and PACE calculations</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label className="text-nav text-sm font-medium block" style={{ marginBottom: '0.375rem' }}>Company Name</label>
                    <input value={companyName} onChange={e => setCompanyName(e.target.value)}
                      className="w-full rounded-xl border text-nav text-sm outline-none transition-all"
                      style={{ background: '#FFFFFF', borderColor: '#E5E4E0', padding: '0.75rem 1rem' }}
                      onFocus={e => { e.target.style.borderColor = '#1A1A1A'; e.target.style.boxShadow = '0 0 0 3px rgba(26,26,26,0.07)' }}
                      onBlur={e => { e.target.style.borderColor = '#E5E4E0'; e.target.style.boxShadow = 'none' }}
                      placeholder="Acme Technologies Inc." />
                  </div>
                  <div>
                    <label className="text-nav text-sm font-medium block" style={{ marginBottom: '0.375rem' }}>Sector / Industry</label>
                    <select value={sector} onChange={e => setSector(e.target.value)}
                      className="w-full rounded-xl border text-sm outline-none transition-all"
                      style={{ background: '#FFFFFF', borderColor: '#E5E4E0', padding: '0.75rem 1rem', color: sector ? '#1A1A1A' : '#9A9A9A' }}
                      onFocus={e => { e.target.style.borderColor = '#1A1A1A'; e.target.style.boxShadow = '0 0 0 3px rgba(26,26,26,0.07)' }}
                      onBlur={e => { e.target.style.borderColor = '#E5E4E0'; e.target.style.boxShadow = 'none' }}>
                      <option value="" disabled>Select your sector</option>
                      {['Mining & Resources', 'Technology / SaaS', 'Biotech / Life Sciences', 'Cannabis', 'CleanTech / Energy', 'Real Estate', 'Financial Services', 'Consumer / Retail', 'Industrial', 'Other'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="rounded-xl border" style={{ marginTop: '1.25rem', padding: '1rem', background: '#F7F6F4', borderColor: '#E5E4E0' }}>
                  <p className="text-text-muted text-xs font-medium" style={{ marginBottom: '0.5rem' }}>Your personalized IPO mission:</p>
                  <div className="flex flex-wrap gap-2">
                    {[listingType && listingType.toUpperCase(), exchange && exchange.toUpperCase(), companyName || 'Your Company', sector].filter(Boolean).map((item, i) => (
                      <span key={i} className="text-xs font-medium rounded-full"
                        style={{ background: '#1A1A1A', color: 'white', padding: '0.125rem 0.625rem' }}>{item}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Plan */}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="font-display text-2xl font-bold text-nav" style={{ marginBottom: '0.375rem' }}>Choose your plan</h2>
                <p className="text-text-muted text-sm" style={{ marginBottom: '1.5rem' }}>
                  All plans include a 3-month minimum. Taxes calculated at checkout based on your billing address.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {WIZARD_PLANS.map(plan => {
                    const Icon = plan.icon
                    const selected = selectedPlan === plan.id
                    return (
                      <button key={plan.id} onClick={() => setSelectedPlan(plan.id)}
                        className="flex items-start gap-4 rounded-xl text-left border transition-all"
                        style={{ padding: '1rem', background: selected ? '#F7F6F4' : 'white', borderColor: selected ? '#1A1A1A' : '#E5E4E0', position: 'relative' }}>
                        {plan.popular && (
                          <span style={{ position: 'absolute', top: '-10px', right: '16px', background: '#1A1A1A', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '2px 10px', borderRadius: '100px' }}>
                            Most Popular
                          </span>
                        )}
                        <div className="rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ width: '36px', height: '36px', background: plan.bg, marginTop: '2px' }}>
                          <Icon className="w-4 h-4" style={{ color: plan.color }} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-baseline justify-between" style={{ marginBottom: '0.25rem' }}>
                            <p className="font-bold text-sm text-nav">{plan.name}</p>
                            <p className="font-black text-sm text-nav">
                              US${plan.priceUSD.toLocaleString()}<span className="font-normal text-xs text-text-muted">{plan.period}</span>
                            </p>
                          </div>
                          <ul style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {plan.features.map(f => (
                              <li key={f} className="flex items-center gap-1.5 text-xs text-text-muted">
                                <CheckCircle2 className="w-3 h-3 flex-shrink-0" style={{ color: plan.color }} /> {f}
                              </li>
                            ))}
                          </ul>
                          {plan.note && (
                            <p className="text-xs font-medium" style={{ color: plan.color, marginTop: '0.5rem' }}>{plan.note}</p>
                          )}
                        </div>
                        {selected && <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-accent" style={{ marginTop: '0.125rem' }} />}
                      </button>
                    )
                  })}
                </div>
                <p className="text-xs text-text-light text-center" style={{ marginTop: '0.75rem' }}>
                  GST/HST (Canada) and applicable US state sales tax added at checkout · Cancel after 3 months
                </p>
              </motion.div>
            )}

            {/* Step 4: Launch */}
            {step === 4 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="text-center" style={{ padding: '1rem 0' }}>
                <div className="text-6xl" style={{ marginBottom: '1.5rem' }}>🚀</div>
                <h2 className="font-display text-3xl font-bold text-nav" style={{ marginBottom: '0.75rem' }}>Ready for Liftoff!</h2>
                <p className="text-text-muted leading-relaxed" style={{ marginBottom: '1.5rem' }}>
                  Your personalized IPO checklist is ready for a{' '}
                  <strong className="text-nav">{listingType?.toUpperCase()}</strong> on the{' '}
                  <strong className="text-nav">{exchange?.toUpperCase()}</strong>.{' '}
                  Your PACE engine is initialized and your team can be invited immediately.
                </p>
                <div className="grid grid-cols-3 gap-3" style={{ marginBottom: '2rem' }}>
                  {[
                    { value: '48', label: 'Checklist tasks', icon: '✅' },
                    { value: '8',  label: 'Mission phases',  icon: '🎯' },
                    { value: '50', label: 'Starting PACE',   icon: '⚡' },
                  ].map(({ value, label, icon }) => (
                    <div key={label} className="rounded-xl border" style={{ padding: '0.75rem', background: '#F7F6F4', borderColor: '#E5E4E0' }}>
                      <p className="text-lg" style={{ marginBottom: '0.125rem' }}>{icon}</p>
                      <p className="text-nav font-black text-xl">{value}</p>
                      <p className="text-text-light text-xs">{label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Navigation */}
          <div className="flex gap-3" style={{ marginTop: '2rem' }}>
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)}
                className="flex items-center justify-center gap-2 rounded-xl border text-sm font-medium text-text-muted hover:text-nav transition-colors"
                style={{ borderColor: '#E5E4E0', background: 'white', padding: '0.625rem 1.25rem' }}>
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            )}
            {step < 3 ? (
              <button onClick={() => setStep(s => s + 1)}
                disabled={(step === 0 && !listingType) || (step === 1 && !exchange)}
                className="btn btn-primary flex-1 justify-center disabled:opacity-40">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : step === 3 ? (
              <button onClick={handlePlanContinue} disabled={checkoutLoading}
                className="btn btn-primary flex-1 justify-center disabled:opacity-50">
                {checkoutLoading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting to checkout…</>
                  : selectedPlan === 'starter'
                    ? <>Continue <ArrowRight className="w-4 h-4" /></>
                    : <>Subscribe & continue <ArrowRight className="w-4 h-4" /></>}
              </button>
            ) : (
              <button onClick={handleLaunch} disabled={loading}
                className="btn btn-primary flex-1 justify-center disabled:opacity-50"
                style={{ paddingTop: '0.75rem', paddingBottom: '0.75rem', fontSize: '1rem' }}>
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Setting up your workspace…</>
                  : <><Rocket className="w-5 h-5" /> Launch Mission Control</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
