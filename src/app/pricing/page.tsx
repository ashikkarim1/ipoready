'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import {
  CheckCircle2, ArrowRight, Zap, Globe,
  Users, ChevronDown, ChevronUp, Clock, Sparkles, X, BadgeCheck, TrendingUp
} from 'lucide-react'

type Currency = 'USD' | 'CAD'
type Language = 'en' | 'fr'
type Billing = 'monthly' | 'sixmonth' | 'annual'

// Prices already reflect 50% launch promo — originals shown crossed out
// 6-month: 20% off monthly | Annual: 33% off monthly
const PLANS = [
  {
    id: 'starter',
    nameEn: 'Starter',
    nameFr: 'Débutant',
    descriptionEn: 'For companies in early exploration of going public',
    descriptionFr: "Pour les entreprises en exploration du processus d'inscription",
    monthlyUSD: 299,
    monthlyCAD: 399,
    sixmonthUSD: 239,
    sixmonthCAD: 319,
    annualUSD: 199,
    annualCAD: 265,
    originalMonthlyUSD: 599,
    originalMonthlyCAD: 799,
    originalSixmonthUSD: 479,
    originalSixmonthCAD: 639,
    originalAnnualUSD: 399,
    originalAnnualCAD: 529,
    features: [
      'Full IPO checklist (all 8 phases)',
      'PACE™ tracking engine',
      'Up to 5 team members',
      'Document management (5 GB)',
      'CSE & OTC exchange support',
      'Email notifications',
      '2 free governance templates',
      'auditus.ai integration link',
    ],
    isPopular: false,
    maxMembers: 5,
    exchanges: ['CSE', 'OTC'],
    badge: null,
  },
  {
    id: 'growth',
    nameEn: 'Growth',
    nameFr: 'Croissance',
    descriptionEn: 'For companies actively pursuing a listing',
    descriptionFr: "Pour les entreprises activement en processus d'inscription",
    monthlyUSD: 799,
    monthlyCAD: 1049,
    sixmonthUSD: 639,
    sixmonthCAD: 839,
    annualUSD: 535,
    annualCAD: 699,
    originalMonthlyUSD: 1599,
    originalMonthlyCAD: 2099,
    originalSixmonthUSD: 1279,
    originalSixmonthCAD: 1679,
    originalAnnualUSD: 1069,
    originalAnnualCAD: 1399,
    features: [
      'Everything in Starter',
      'TSX, TSXV, CSE, OTC support',
      'Up to 15 team members',
      'Document management (25 GB)',
      'Auto-fill template credits (5/mo)',
      'Daily notifications & digest',
      'PIF form auto-fill',
      'WhatsApp AI Companion',
      'Expert network access',
      'Raising Capital education hub',
      'Priority email support',
    ],
    isPopular: true,
    maxMembers: 15,
    exchanges: ['TSX', 'TSXV', 'CSE', 'OTC'],
    badge: '⭐ Most Popular',
  },
  {
    id: 'enterprise',
    nameEn: 'Enterprise',
    nameFr: 'Entreprise',
    descriptionEn: 'For NASDAQ/NYSE listings and complex transactions',
    descriptionFr: 'Pour les inscriptions NASDAQ/NYSE et les transactions complexes',
    monthlyUSD: 1999,
    monthlyCAD: 2599,
    sixmonthUSD: 1599,
    sixmonthCAD: 2079,
    annualUSD: 1339,
    annualCAD: 1739,
    originalMonthlyUSD: 3999,
    originalMonthlyCAD: 5199,
    originalSixmonthUSD: 3199,
    originalSixmonthCAD: 4159,
    originalAnnualUSD: 2679,
    originalAnnualCAD: 3479,
    features: [
      'Everything in Growth',
      'All 7 exchanges (incl. NASDAQ & NYSE)',
      'Unlimited team members',
      'Document management (100 GB)',
      'Unlimited auto-fill templates',
      'Full prospectus template (S-1/F-1)',
      'Dedicated IPO coordinator',
      'White-glove onboarding',
      'Custom notification workflows',
      'Multi-entity support (RTOs)',
    ],
    isPopular: false,
    maxMembers: 999,
    exchanges: ['All'],
    badge: '👑 Full Access',
  },
]

const FAQS = [
  {
    q: 'Is IPOReady a securities dealer or underwriter?',
    a: 'No. IPOReady is a workflow management platform only. We do not provide investment banking, underwriting, legal, or accounting services. All regulatory filings must be executed by licensed professionals.',
  },
  {
    q: 'Why do I need profile approval before accessing?',
    a: 'IPOReady is built for credibility. We verify that all users are genuinely involved in a listing process — this ensures the Expert Network remains high-quality and all parties can trust the platform.',
  },
  {
    q: 'Are templates legally reviewed?',
    a: 'Our templates are drafted with input from securities lawyers and updated quarterly to reflect current exchange policies. They are starting points — your legal counsel must review and customize them for your specific situation.',
  },
  {
    q: 'What is the 3-month minimum commitment?',
    a: 'Monthly plans require a 3-month minimum commitment. This ensures you have enough runway to experience the full value of the platform — IPO readiness is a multi-month journey, not a one-time checklist. After 3 months, cancel anytime with 30 days notice.',
  },
  {
    q: 'Can I switch plans mid-listing?',
    a: 'Yes. You can upgrade or downgrade at any time. When you upgrade, the new plan takes effect immediately and we prorate the billing difference.',
  },
  {
    q: 'Is pricing available in both USD and CAD?',
    a: 'Yes. Use the toggle at the top of this page to switch between USD and CAD pricing. Both are valid and accepted at checkout.',
  },
  {
    q: 'What happens after we list?',
    a: 'Your subscription converts to a post-listing compliance plan for continuous disclosure tracking, AGM preparation, and ongoing regulatory calendar management.',
  },
]

// Plan tier order — used to determine upgrade vs downgrade
const PLAN_TIER: Record<string, number> = { starter: 0, growth: 1, enterprise: 2 }

export default function PricingPage() {
  const { data: session } = useSession()
  const [currency, setCurrency] = useState<Currency>('CAD')
  const [language, setLanguage] = useState<Language>('en')
  const [billing, setBilling] = useState<Billing>('annual')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [showPromo, setShowPromo] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)

  // 90-day launch promotion ends 2026-08-20
  const promoEndDate = new Date('2026-08-20')
  const daysLeft = Math.max(0, Math.ceil((promoEndDate.getTime() - Date.now()) / 86_400_000))

  const isLoggedIn = !!session
  const userPlanId: string | null = isLoggedIn
    ? ((session.user as any).subscriptionPlan ?? 'starter')
    : null

  async function handleCheckout(planId: string, isFromTrial: boolean = false) {
    if (!isLoggedIn) {
      window.location.href = '/register'
      return
    }
    setCheckoutLoading(planId)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, billing, currency, isTrialUpgrade: isFromTrial }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error ?? 'Checkout failed. Please try again.')
      }
    } catch {
      alert('Checkout failed. Please try again.')
    } finally {
      setCheckoutLoading(null)
    }
  }

  function getPlanCta(plan: typeof PLANS[0]): { label: string; isActive: boolean; isUpgrade: boolean } {
    if (!isLoggedIn) return { label: language === 'en' ? 'Get started →' : 'Commencer →', isActive: false, isUpgrade: false }
    if (plan.id === userPlanId) return { label: language === 'en' ? '✓ Your Current Plan' : '✓ Votre plan actuel', isActive: true, isUpgrade: false }
    const currentTier = PLAN_TIER[userPlanId ?? 'starter'] ?? 0
    const thisTier = PLAN_TIER[plan.id] ?? 0
    if (thisTier > currentTier) return { label: language === 'en' ? `Upgrade to ${plan.nameEn} →` : `Passer à ${plan.nameFr} →`, isActive: false, isUpgrade: true }
    return { label: language === 'en' ? 'Downgrade' : 'Rétrograder', isActive: false, isUpgrade: false }
  }

  function getPrice(plan: typeof PLANS[0]) {
    if (billing === 'annual') return currency === 'CAD' ? plan.annualCAD : plan.annualUSD
    if (billing === 'sixmonth') return currency === 'CAD' ? plan.sixmonthCAD : plan.sixmonthUSD
    return currency === 'CAD' ? plan.monthlyCAD : plan.monthlyUSD
  }

  function getOriginalPrice(plan: typeof PLANS[0]) {
    if (billing === 'annual') return currency === 'CAD' ? plan.originalAnnualCAD : plan.originalAnnualUSD
    if (billing === 'sixmonth') return currency === 'CAD' ? plan.originalSixmonthCAD : plan.originalSixmonthUSD
    return currency === 'CAD' ? plan.originalMonthlyCAD : plan.originalMonthlyUSD
  }

  function formatPrice(amount: number) {
    return `${currency === 'CAD' ? 'CA$' : 'US$'}${amount.toLocaleString()}`
  }

  function getBilledNote(plan: typeof PLANS[0]) {
    if (billing === 'annual') {
      const yr = currency === 'CAD' ? plan.annualCAD * 12 : plan.annualUSD * 12
      return `${formatPrice(yr)}/yr · billed annually`
    }
    if (billing === 'sixmonth') {
      const total = currency === 'CAD' ? plan.sixmonthCAD * 6 : plan.sixmonthUSD * 6
      return `${formatPrice(total)} billed every 6 months`
    }
    return language === 'en' ? '3-month minimum · cancel after' : '3 mois minimum · annulez après'
  }

  const BILLING_OPTIONS: { key: Billing; labelEn: string; labelFr: string; badge: string | null; badgeColor: string }[] = [
    { key: 'monthly',  labelEn: 'Monthly',  labelFr: 'Mensuel',  badge: null,       badgeColor: '' },
    { key: 'sixmonth', labelEn: '6-Month',  labelFr: '6 Mois',   badge: 'Save 20%', badgeColor: 'bg-blue-500/15 text-blue-600 border-blue-200' },
    { key: 'annual',   labelEn: 'Annual',   labelFr: 'Annuel',   badge: 'Save 33%', badgeColor: 'bg-green-500/10 text-green-700 border-green-200' },
  ]

  return (
    <div className="relative" style={{ overflowX: 'clip' }}>

      <div className="max-w-6xl mx-auto relative z-10" style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem', paddingTop: '0.5rem', paddingBottom: '4rem' }}>

        {/* 90-day promo banner */}
        <AnimatePresence>
          {daysLeft > 0 && showPromo && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-8 p-4 rounded-2xl relative overflow-hidden flex items-center gap-4"
              style={{ background: '#FEF3C7', border: '1px solid #FDE68A' }}
            >
              <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" style={{ color: '#B45309' }} />
                  <p className="font-bold text-sm" style={{ color: '#92400E' }}>
                    {language === 'en' ? 'Launch Special — 50% Off for 90 Days' : 'Offre de lancement — 50% de réduction pendant 90 jours'}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg"
                  style={{ background: 'rgba(180,83,9,0.1)', border: '1px solid rgba(180,83,9,0.2)' }}>
                  <Clock className="w-3.5 h-3.5" style={{ color: '#B45309' }} />
                  <span className="font-semibold text-xs" style={{ color: '#B45309' }}>
                    {daysLeft} {language === 'en' ? 'days remaining' : 'jours restants'}
                  </span>
                </div>
              </div>
              <p className="hidden md:block text-xs max-w-xs text-center" style={{ color: '#92400E', opacity: 0.7 }}>
                {language === 'en' ? 'Lock in founding-member pricing. Prices shown are 50% off regular.' : 'Bloquez le tarif membre fondateur.'}
              </p>
              <button onClick={() => setShowPromo(false)}
                className="ml-auto p-1 rounded-lg transition-colors flex-shrink-0"
                style={{ color: '#B45309', opacity: 0.5 }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '0.5')}>
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-xs font-semibold uppercase tracking-widest"
            style={{ background: '#FDECEB', color: '#E8312A', border: '1px solid rgba(232,49,42,0.15)' }}>
            <Zap className="w-3 h-3" />
            {language === 'en' ? 'Pricing' : 'Tarification'}
          </div>
          <h1 className="serif text-5xl text-nav mb-4 leading-tight">
            {language === 'en'
              ? <>Your Complete<br /><span style={{ color: '#E8312A' }}>IPO Readiness Platform</span></>
              : <>Votre plateforme complète<br /><span style={{ color: '#E8312A' }}>de préparation IPO</span></>
            }
          </h1>
          <p className="text-text-muted text-lg max-w-2xl mx-auto mb-3">
            {language === 'en'
              ? 'A typical IPO costs $500K–$2M in professional fees. IPOReady helps you get organized, stay on track, and connect with experts — at a fraction of the cost.'
              : "Un PAPE typique coûte 500K$–2M$ en honoraires. IPOReady vous aide à vous organiser et rester sur la bonne voie."}
          </p>
          <p className="text-sm font-semibold" style={{ color: '#B45309' }}>
            {language === 'en'
              ? '⚡ Our AI and analytics expand weekly — lock in founder pricing now.'
              : "⚡ Notre IA s'améliore chaque semaine — bloquez le tarif fondateur maintenant."}
          </p>

          {/* Billing toggle */}
          <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.625rem' }}>
            <div className="inline-flex items-center gap-1 p-1 rounded-2xl"
              style={{ background: '#EFEFED', border: '1px solid #E5E4E0' }}>
              {BILLING_OPTIONS.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setBilling(opt.key)}
                  className="relative rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
                  style={{
                    padding: '0.625rem 1.25rem',
                    ...(billing === opt.key
                      ? { background: 'white', color: '#1A1A1A', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
                      : { color: '#9A9A9A' })
                  }}
                >
                  {language === 'en' ? opt.labelEn : opt.labelFr}
                  {opt.badge && (
                    <span style={{
                      fontSize: '10px', padding: '0.125rem 0.375rem', borderRadius: '9999px', fontWeight: 700,
                      ...(opt.key === 'annual'
                        ? { background: '#FDECEB', color: '#E8312A', border: '1px solid rgba(232,49,42,0.2)' }
                        : { background: '#F7F6F4', color: '#717171', border: '1px solid #E5E4E0' })
                    }}>
                      {opt.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {billing === 'monthly' && (
                <motion.p key="monthly-note" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-text-light text-xs">
                  {language === 'en' ? '3-month minimum commitment · cancel anytime after' : 'Engagement minimum de 3 mois · annulez après'}
                </motion.p>
              )}
              {billing === 'sixmonth' && (
                <motion.p key="sixmonth-note" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-xs font-medium text-text-muted">
                  {language === 'en' ? 'Save 20% vs monthly · billed every 6 months' : "20% d'économies vs mensuel · facturé tous les 6 mois"}
                </motion.p>
              )}
              {billing === 'annual' && (
                <motion.p key="annual-note" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-xs font-medium text-text-muted">
                  {language === 'en' ? 'Best value — save 33% vs monthly · billed annually' : "Meilleure valeur — 33% d'économies vs mensuel · facturé annuellement"}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Currency toggle */}
          <div className="flex items-center justify-center gap-2" style={{ marginTop: '1rem' }}>
            <Globe className="w-3.5 h-3.5 text-text-light" />
            <div className="inline-flex items-center gap-0.5 p-0.5 rounded-lg"
              style={{ background: '#EFEFED', border: '1px solid #E5E4E0' }}>
              {(['CAD', 'USD'] as Currency[]).map(c => (
                <button key={c} onClick={() => setCurrency(c)}
                  className="px-3 py-1 rounded text-xs font-mono font-semibold transition-all"
                  style={currency === c ? { background: '#1A1A1A', color: 'white' } : { color: '#9A9A9A' }}>
                  ${c}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Logged-in "you're all set" status banner */}
        <AnimatePresence>
          {isLoggedIn && !!(PLANS.find(p => p.id === userPlanId)?.nameEn) && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              style={{ marginBottom: '1.5rem', padding: '16px 20px', borderRadius: '14px', background: '#F0FDF4', border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', gap: '12px' }}
            >
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#DCFCE7', border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <BadgeCheck style={{ width: '18px', height: '18px', color: '#16A34A' }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#15803D', marginBottom: '2px' }}>
                  {language === 'en' ? `You're on the ${PLANS.find(p => p.id === userPlanId)?.nameEn} Plan` : `Vous êtes sur le plan ${PLANS.find(p => p.id === userPlanId)?.nameFr ?? PLANS.find(p => p.id === userPlanId)?.nameEn}`}
                </p>
                <p style={{ fontSize: '12px', color: '#4ADE80', opacity: 0.8 }}>
                  {language === 'en'
                    ? 'Your subscription is active. Upgrade anytime — changes take effect immediately with prorated billing.'
                    : 'Votre abonnement est actif. Mettez à niveau à tout moment avec facturation au prorata.'}
                </p>
              </div>
              <Link href="/account"
                style={{ fontSize: '12px', fontWeight: 600, color: '#15803D', textDecoration: 'none', padding: '6px 12px', borderRadius: '8px', border: '1px solid #BBF7D0', background: 'white', whiteSpace: 'nowrap' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#F0FDF4')}
                onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
                <TrendingUp style={{ width: '12px', height: '12px', display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
                {language === 'en' ? 'Manage Plan' : 'Gérer le plan'}
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Plans */}
        <div className="grid md:grid-cols-3" style={{ gap: '1.5rem', marginBottom: '3rem', marginTop: '1rem', paddingTop: '1.5rem' }}>
          {PLANS.map((plan, i) => (
            <motion.div key={plan.id}
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              style={plan.isPopular
                ? { background: 'white', border: '2px solid #1A1A1A', boxShadow: '0 8px 32px rgba(26,26,26,0.12)', borderRadius: '1rem', padding: '1.75rem', display: 'flex', flexDirection: 'column', position: 'relative' }
                : { background: 'white', border: '1px solid #E5E4E0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', borderRadius: '1rem', padding: '1.75rem', display: 'flex', flexDirection: 'column', position: 'relative' }
              }>
              {plan.badge && (
                <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}>
                  <span className="text-xs font-bold"
                    style={plan.isPopular
                      ? { background: '#1A1A1A', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '9999px', display: 'inline-block' }
                      : { background: '#FEF3C7', color: '#B45309', border: '1px solid #FDE68A', padding: '0.25rem 0.75rem', borderRadius: '9999px', display: 'inline-block' }}>
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-5">
                <h3 className="font-display text-xl font-bold text-nav mb-1">
                  {language === 'en' ? plan.nameEn : plan.nameFr}
                </h3>
                <p className="text-text-muted text-sm">
                  {language === 'en' ? plan.descriptionEn : plan.descriptionFr}
                </p>
              </div>

              <div className="mb-5 pb-5" style={{ borderBottom: '1px solid #E5E4E0' }}>
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <span className="font-medium line-through text-text-light text-sm">
                    {formatPrice(getOriginalPrice(plan))}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                    style={{ background: '#FDECEB', color: '#E8312A', border: '1px solid rgba(232,49,42,0.15)' }}>
                    50% OFF
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-4xl font-black text-nav">{formatPrice(getPrice(plan))}</span>
                  <span className="text-text-muted text-sm">/mo</span>
                </div>
                <p className="text-xs mt-1.5 text-text-muted font-medium">{getBilledNote(plan)}</p>
              </div>

              <div className="mb-5">
                <div className="flex flex-wrap gap-1 mb-2.5">
                  {plan.exchanges.map(ex => (
                    <span key={ex} className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: '#F7F6F4', color: '#717171', border: '1px solid #E5E4E0' }}>
                      {ex}
                    </span>
                  ))}
                </div>
                <p className="text-text-muted text-xs flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {plan.maxMembers === 999 ? 'Unlimited members' : `Up to ${plan.maxMembers} members`}
                </p>
              </div>

              <ul className="space-y-2 mb-8 flex-1">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#2D7A5F' }} />
                    <span className="text-text-muted">{feature}</span>
                  </li>
                ))}
              </ul>

              {(() => {
                const cta = getPlanCta(plan)
                const isLoading = checkoutLoading === plan.id
                if (cta.isActive) {
                  return (
                    <div
                      className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm mt-auto"
                      style={{ background: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0' }}>
                      {cta.label}
                    </div>
                  )
                }
                return (
                  <button
                    onClick={() => handleCheckout(plan.id)}
                    disabled={isLoading || !!checkoutLoading}
                    className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm transition-all mt-auto disabled:opacity-60"
                    style={
                      cta.isUpgrade
                        ? { background: '#1A1A1A', color: 'white' }
                        : plan.isPopular && !isLoggedIn
                          ? { background: '#1A1A1A', color: 'white' }
                          : { background: '#F7F6F4', color: '#1A1A1A', border: '1px solid #E5E4E0' }
                    }
                    onMouseEnter={e => {
                      if (isLoading) return
                      if (cta.isUpgrade || (plan.isPopular && !isLoggedIn)) (e.currentTarget as HTMLButtonElement).style.background = '#333'
                      else (e.currentTarget as HTMLButtonElement).style.background = '#EFEFED'
                    }}
                    onMouseLeave={e => {
                      if (cta.isUpgrade || (plan.isPopular && !isLoggedIn)) (e.currentTarget as HTMLButtonElement).style.background = '#1A1A1A'
                      else (e.currentTarget as HTMLButtonElement).style.background = '#F7F6F4'
                    }}>
                    {isLoading
                      ? <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin inline-block" /> Redirecting…</>
                      : <>{cta.label} {!cta.isActive && <ArrowRight className="w-4 h-4" />}</>}
                  </button>
                )
              })()}
            </motion.div>
          ))}
        </div>

        {/* Value comparison */}
        <div className="card rounded-2xl p-8 mb-10">
          <h2 className="serif text-2xl text-nav mb-2 text-center">
            {language === 'en' ? 'The Real Cost of Going Public' : "Le vrai coût d'une introduction en bourse"}
          </h2>
          <p className="text-text-muted text-sm text-center mb-8">
            {language === 'en'
              ? 'IPOReady does not replace professionals — it organizes your workflow so you use their time more efficiently.'
              : 'IPOReady ne remplace pas les professionnels — il organise votre flux de travail.'}
          </p>
          <div className="grid md:grid-cols-3 gap-5 text-center">
            {[
              { label: 'Securities Lawyer',    typical: '$200K–$800K', ipoReady: 'Included guidance', savings: 'up to $400K' },
              { label: 'Workflow Management',  typical: '$50K–$150K',  ipoReady: 'from $299/mo',      savings: 'up to $148K' },
              { label: 'Form Preparation',     typical: '$20K–$60K',   ipoReady: 'from $149/template', savings: 'up to $58K' },
            ].map(({ label, typical, ipoReady, savings }) => (
              <div key={label} className="p-5 rounded-xl" style={{ background: '#F7F6F4', border: '1px solid #E5E4E0' }}>
                <p className="font-semibold text-nav text-sm mb-3">{label}</p>
                <p className="text-xs text-text-muted mb-1">Traditional: <span className="text-accent font-semibold">{typical}</span></p>
                <p className="text-xs text-text-muted mb-2">IPOReady: <span className="font-semibold text-nav">{ipoReady}</span></p>
                <p className="text-sm font-bold text-nav">Save {savings}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mb-10">
          <h2 className="serif text-2xl text-nav mb-6 text-center">
            {language === 'en' ? 'Frequently Asked Questions' : 'Questions Fréquentes'}
          </h2>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div key={i} className="card rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left transition-colors"
                  style={{ background: openFaq === i ? '#F7F6F4' : 'white' }}
                  onMouseEnter={e => { if (openFaq !== i) (e.currentTarget as HTMLButtonElement).style.background = '#FAFAF9' }}
                  onMouseLeave={e => { if (openFaq !== i) (e.currentTarget as HTMLButtonElement).style.background = 'white' }}>
                  <p className="text-nav font-medium text-sm pr-4">{faq.q}</p>
                  {openFaq === i
                    ? <ChevronUp className="w-4 h-4 text-text-muted flex-shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-text-muted flex-shrink-0" />}
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }} className="overflow-hidden">
                      <div className="px-5 pb-5 pt-1" style={{ borderTop: '1px solid #E5E4E0' }}>
                        <p className="text-text-muted text-sm leading-relaxed">{faq.a}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* CTA strip */}
        <div className="card rounded-2xl p-10 text-center mb-8" style={{ background: '#1A1A1A', borderColor: '#1A1A1A' }}>
          {isLoggedIn && !!(PLANS.find(p => p.id === userPlanId)?.nameEn) ? (
            <>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <BadgeCheck style={{ width: '22px', height: '22px', color: '#22C55E' }} />
              </div>
              <h2 className="serif text-3xl text-white mb-3">
                {language === 'en' ? `You're all set on ${PLANS.find(p => p.id === userPlanId)?.nameEn} ✓` : `Vous êtes prêt sur ${PLANS.find(p => p.id === userPlanId)?.nameFr ?? PLANS.find(p => p.id === userPlanId)?.nameEn} ✓`}
              </h2>
              <p className="mb-6 max-w-xl mx-auto text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                {language === 'en'
                  ? 'Your subscription is active and your PACE™ engine is running. Head to your dashboard to track your IPO velocity.'
                  : "Votre abonnement est actif et votre moteur PACE™ fonctionne. Rendez-vous sur votre tableau de bord."}
              </p>
              <Link href="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-sm text-nav transition-all"
                style={{ background: '#FFFFFF' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#F7F6F4')}
                onMouseLeave={e => (e.currentTarget.style.background = '#FFFFFF')}>
                {language === 'en' ? 'Go to Dashboard' : 'Aller au tableau de bord'}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-xs mt-3" style={{ color: 'rgba(255,255,255,0.25)' }}>
                {language === 'en' ? 'Need to upgrade or change your plan? Use the cards above.' : 'Besoin de changer de plan? Utilisez les cartes ci-dessus.'}
              </p>
            </>
          ) : (
            <>
              <h2 className="serif text-3xl text-white mb-3">
                {language === 'en' ? 'Ready to start your IPO journey?' : 'Prêt à commencer votre parcours IPO?'}
              </h2>
              <p className="mb-6 max-w-xl mx-auto text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                {language === 'en'
                  ? 'Join hundreds of companies using IPOReady to track, manage, and accelerate their path to public markets.'
                  : "Rejoignez des centaines d'entreprises qui utilisent IPOReady pour accélérer leur chemin vers les marchés publics."}
              </p>
              <Link href="/register"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-sm text-nav transition-all"
                style={{ background: '#FFFFFF' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#F7F6F4')}
                onMouseLeave={e => (e.currentTarget.style.background = '#FFFFFF')}>
                {language === 'en' ? 'Get Started Free' : 'Commencer gratuitement'}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-xs mt-3" style={{ color: 'rgba(255,255,255,0.25)' }}>
                {language === 'en' ? 'No credit card required for trial · Cancel anytime after 3 months' : "Aucune carte de crédit requise pour l'essai"}
              </p>
            </>
          )}
        </div>

        {/* Legal Disclaimer */}
        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl px-5 py-4" style={{ background: '#FEF3C7', border: '1px solid #FDE68A' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#B45309' }}>Important Disclosure</p>
            <p className="text-xs leading-relaxed" style={{ color: '#92400E', opacity: 0.8 }}>
              IPOReady is a technology platform designed to help companies track and manage their IPO readiness workflow. It is not a replacement for — and does not constitute — legal counsel, audit or assurance services, securities advice, exchange advisory services, SEC, OSC, SEDAR/EDGAR filing services, or any other regulated professional or regulatory services required to complete a public listing. All users must engage qualified legal counsel, auditors, underwriters, and applicable regulatory advisors independently. Nothing on this platform constitutes a solicitation, recommendation, or offer to buy or sell securities. Subscription fees cover access to the technology platform only.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
