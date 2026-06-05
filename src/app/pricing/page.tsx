'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Header } from '@/app/components/Header'
import {
  CheckCircle2, ArrowRight, Zap, Globe, Mail, ExternalLink, Rocket,
  Users, ChevronDown, ChevronUp, Clock, Sparkles, X, BadgeCheck, TrendingUp
} from 'lucide-react'

type Currency = 'USD' | 'CAD'
type Language = 'en' | 'fr'
type Billing = 'monthly' | 'sixmonth' | 'annual'

// Prices already reflect 50% launch promo — originals shown crossed out
// 6-month: 20% off monthly | Annual: 33% off monthly
// Starter: 1-month minimum | Growth: 3-month minimum | Enterprise: annual commitment
const PLANS = [
  {
    id: 'starter',
    nameEn: 'Starter',
    nameFr: 'Débutant',
    descriptionEn: 'For companies in early exploration of going public',
    descriptionFr: "Pour les entreprises en exploration du processus d'inscription",
    monthlyUSD: 349,
    monthlyCAD: 465,
    sixmonthUSD: 279,
    sixmonthCAD: 372,
    annualUSD: 233,
    annualCAD: 310,
    originalMonthlyUSD: 699,
    originalMonthlyCAD: 930,
    originalSixmonthUSD: 559,
    originalSixmonthCAD: 744,
    originalAnnualUSD: 465,
    originalAnnualCAD: 620,
    minCommitmentMonths: 1,
    features: [
      'Full IPO checklist (all 8 phases)',
      'PACE™ tracking engine',
      'AI-powered prospectus builder (S-1 drafting)',
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
    monthlyUSD: 499,
    monthlyCAD: 667,
    sixmonthUSD: 499,
    sixmonthCAD: 667,
    annualUSD: 499,
    annualCAD: 667,
    originalMonthlyUSD: 999,
    originalMonthlyCAD: 1335,
    originalSixmonthUSD: 999,
    originalSixmonthCAD: 1335,
    originalAnnualUSD: 999,
    originalAnnualCAD: 1335,
    minCommitmentMonths: 3,
    features: [
      'Everything in Starter',
      'AI-powered prospectus builder (full S-1/F-1)',
      'Compliance checker & section validator',
      'Team collaboration & version control',
      'TSX, TSXV, CSE, OTC support',
      'Up to 15 team members',
      'Document management (25 GB)',
      'Auto-fill template credits (10/mo)',
      'Daily notifications & digest',
      'PIF form auto-fill',
      'WhatsApp AI Companion',
      'Expert network access',
      'Raising Capital education hub',
      'Priority email support',
      'Additional seats: $129/mo (Canada), $199/mo (US)',
    ],
    isPopular: true,
    maxMembers: 15,
    exchanges: ['TSX', 'TSXV', 'CSE', 'OTC', 'NASDAQ', 'NYSE'],
    badge: '⭐ Most Popular',
  },
  {
    id: 'listed-services',
    nameEn: 'Listed Services OS',
    nameFr: 'OS Services Cotés',
    descriptionEn: 'AI-powered operating system for public companies',
    descriptionFr: "Système d'exploitation alimenté par IA pour les sociétés publiques",
    monthlyUSD: 0,
    monthlyCAD: 0,
    sixmonthUSD: 0,
    sixmonthCAD: 0,
    annualUSD: 0,
    annualCAD: 0,
    originalMonthlyUSD: 0,
    originalMonthlyCAD: 0,
    originalSixmonthUSD: 0,
    originalSixmonthCAD: 0,
    originalAnnualUSD: 0,
    originalAnnualCAD: 0,
    minCommitmentMonths: 3,
    features: [
      'Disclosure & Filings AI — Auto-generate 10-K/10-Q with MD&A',
      'Predictive Analytics — Cash burn forecasting, revenue modeling',
      'Analyst Coverage Intelligence — Track sentiment, guidance impact',
      'Competitive Intelligence — Real-time competitor tracking & multiple analysis',
      'M&A Intelligence Engine — Target scoring, synergy modeling',
      'Uplisting Strategy — When to move exchanges, multiple uplift',
      'CFO/CEO/CRO Coaching AI — Real-time strategic decision support',
      'Market Cap Growth Advisor — Sustainable growth levers',
      'Regulatory Compliance Dashboard — All 6 Listed Services modules',
      'Pricing unlocks when you list — Included with Growth tier post-IPO',
    ],
    isPopular: false,
    maxMembers: 999,
    exchanges: ['All'],
    badge: '🚀 Coming Soon',
  },
  {
    id: 'enterprise',
    nameEn: 'Enterprise',
    nameFr: 'Entreprise',
    descriptionEn: 'For NASDAQ/NYSE listings and complex transactions',
    descriptionFr: 'Pour les inscriptions NASDAQ/NYSE et les transactions complexes',
    monthlyUSD: 2499,
    monthlyCAD: 3335,
    sixmonthUSD: 1999,
    sixmonthCAD: 2668,
    annualUSD: 1665,
    annualCAD: 2225,
    originalMonthlyUSD: 4999,
    originalMonthlyCAD: 6670,
    originalSixmonthUSD: 3999,
    originalSixmonthCAD: 5336,
    originalAnnualUSD: 3330,
    originalAnnualCAD: 4450,
    minCommitmentMonths: 3,
    features: [
      'Everything in Starter + Growth',
      'Advanced prospectus builder (multi-segment S-1/F-1)',
      'Save $20K–60K on document preparation',
      'All 7 exchanges (incl. NASDAQ & NYSE)',
      'Unlimited team members',
      'Document management (100 GB)',
      'Unlimited auto-fill templates & AI sections',
      'Dedicated IPO coordinator',
      'White-glove onboarding',
      'Custom notification workflows',
      'Multi-entity support (RTOs)',
      'Priority API access',
      '24/7 expert support',
      'Auto-renews month-to-month after 3 months · cancel anytime',
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
    q: 'What are the commitment periods?',
    a: 'Starter plans require a 1-month minimum, Growth plans require 3 months, and Enterprise plans require a 3-month minimum. After your initial commitment, all plans auto-renew on a month-to-month basis — you must cancel manually to stop. These minimums ensure you have enough runway to experience the full value of the platform — IPO readiness is a multi-month journey, not a one-time checklist.',
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
const PLAN_TIER: Record<string, number> = { starter: 0, growth: 1, 'listed-services': 2, enterprise: 3 }

export default function PricingPage() {
  const { data: session } = useSession()
  const [currency, setCurrency] = useState<Currency>('USD')
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
    const months = plan.minCommitmentMonths
    const monthText = months === 1 ? 'month' : 'months'
    
    if (billing === 'annual') {
      const yr = currency === 'CAD' ? plan.annualCAD * 12 : plan.annualUSD * 12
      return language === 'en' ? `${formatPrice(yr)}/yr · ${months}-${monthText} minimum, then month-to-month` : `${formatPrice(yr)}/an · ${months} ${monthText} minimum, puis mensuellement`
    }
    if (billing === 'sixmonth') {
      const total = currency === 'CAD' ? plan.sixmonthCAD * 6 : plan.sixmonthUSD * 6
      return language === 'en' ? `${formatPrice(total)} every 6 months · ${months}-${monthText} minimum` : `${formatPrice(total)} tous les 6 mois · ${months} ${monthText} minimum`
    }
    return language === 'en' ? `${months}-${monthText} minimum · then month-to-month · cancel anytime` : `${months} ${monthText} minimum · puis mensuellement · annulez à tout moment`
  }

  const BILLING_OPTIONS: { key: Billing; labelEn: string; labelFr: string; badge: string | null; badgeColor: string }[] = [
    { key: 'monthly',  labelEn: 'Monthly',  labelFr: 'Mensuel',  badge: null,       badgeColor: '' },
    { key: 'sixmonth', labelEn: '6-Month',  labelFr: '6 Mois',   badge: 'Save 20%', badgeColor: 'bg-blue-500/15 text-blue-600 border-blue-200' },
    { key: 'annual',   labelEn: 'Annual',   labelFr: 'Annuel',   badge: 'Save 33%', badgeColor: 'bg-green-500/10 text-green-700 border-green-200' },
  ]

  return (
    <>
      {/* Header with menu */}
      <Header />

      <div className="relative" style={{ overflowX: 'clip' }} suppressHydrationWarning>

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
                  <p className="font-bold body-sm" style={{ color: '#92400E' }}>
                    {language === 'en' ? 'Launch Special — 50% Off for 90 Days' : 'Offre de lancement — 50% de réduction pendant 90 jours'}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg"
                  style={{ background: 'rgba(180,83,9,0.1)', border: '1px solid rgba(180,83,9,0.2)' }}>
                  <Clock className="w-3.5 h-3.5" style={{ color: '#B45309' }} />
                  <span className="font-semibold caption-sm" style={{ color: '#B45309' }}>
                    {daysLeft} {language === 'en' ? 'days remaining' : 'jours restants'}
                  </span>
                </div>
              </div>
              <p className="hidden md:block caption-sm max-w-xs text-center" style={{ color: '#92400E', opacity: 0.7 }}>
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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 label-sm font-semibold uppercase tracking-widest"
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
          <p className="label font-semibold" style={{ color: '#B45309' }}>
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
                  className="relative rounded-xl label font-semibold transition-all flex items-center gap-2"
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
                  className="text-text-light caption-sm">
                  {language === 'en' ? 'All auto-renew month-to-month after initial commitment · cancel anytime' : 'Tous se renouvellent automatiquement mensuellement · annulez à tout moment'}
                </motion.p>
              )}
              {billing === 'sixmonth' && (
                <motion.p key="sixmonth-note" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="label-sm font-medium text-text-muted">
                  {language === 'en' ? 'Save 20% vs monthly · billed every 6 months' : "20% d'économies vs mensuel · facturé tous les 6 mois"}
                </motion.p>
              )}
              {billing === 'annual' && (
                <motion.p key="annual-note" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="label-sm font-medium text-text-muted">
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
              {(['USD', 'CAD'] as Currency[]).map(c => (
                <button key={c} onClick={() => setCurrency(c)}
                  className="px-3 py-1 rounded label-sm font-mono font-semibold transition-all"
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
                  <span className="label-xs font-bold"
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
                <p className="text-text-muted body-sm">
                  {language === 'en' ? plan.descriptionEn : plan.descriptionFr}
                </p>
              </div>

              {plan.id === 'listed-services' ? (
                <div className="mb-5 pb-5" style={{ borderBottom: '1px solid #E5E4E0' }}>
                  <div className="mb-3 p-4 rounded-lg" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                    <p className="label font-bold text-green-700 mb-2">
                      {language === 'en' ? 'Pricing Coming Soon' : 'Tarification à venir'}
                    </p>
                    <p className="body-sm text-green-600">
                      {language === 'en'
                        ? 'Unlocks automatically when your company lists. Included with Growth tier.'
                        : 'Déverrouillé automatiquement lorsque votre entreprise est cotée. Inclus dans le forfait Growth.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mb-5 pb-5" style={{ borderBottom: '1px solid #E5E4E0' }}>
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="font-medium line-through text-text-light body-sm">
                      {formatPrice(getOriginalPrice(plan))}
                    </span>
                    <span className="label-xs px-2 py-0.5 rounded-full font-bold"
                      style={{ background: '#FDECEB', color: '#E8312A', border: '1px solid rgba(232,49,42,0.15)' }}>
                      50% OFF
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-4xl font-black text-nav">{formatPrice(getPrice(plan))}</span>
                    <span className="text-text-muted body-sm">/mo</span>
                  </div>
                  <p className="label-sm mt-1.5 text-text-muted font-medium">{getBilledNote(plan)}</p>
                </div>
              )}

              <div className="mb-5">
                <div className="flex flex-wrap gap-1 mb-2.5">
                  {plan.exchanges.map(ex => (
                    <span key={ex} className="label-sm px-2 py-0.5 rounded-full font-medium"
                      style={{ background: '#F7F6F4', color: '#717171', border: '1px solid #E5E4E0' }}>
                      {ex}
                    </span>
                  ))}
                </div>
                <p className="text-text-muted caption-sm flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {plan.maxMembers === 999 ? 'Unlimited members' : `Up to ${plan.maxMembers} members`}
                </p>
              </div>

              <ul className="space-y-2 mb-8 flex-1">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-2 body-sm">
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
                      className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold body-sm mt-auto"
                      style={{ background: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0' }}>
                      {cta.label}
                    </div>
                  )
                }
                return (
                  <button
                    onClick={() => handleCheckout(plan.id)}
                    disabled={isLoading || !!checkoutLoading}
                    className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold body-sm transition-all mt-auto disabled:opacity-60"
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

        {/* Feature comparison table */}
        <div className="card rounded-2xl p-8 mb-10">
          <h2 className="serif text-2xl text-nav mb-6 text-center">
            {language === 'en' ? 'Feature Comparison' : "Comparaison des fonctionnalités"}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr style={{ borderBottom: '2px solid #E5E4E0' }}>
                  <th className="pb-3 pr-4"><p className="label-sm font-bold text-nav">{language === 'en' ? 'Feature' : 'Fonction'}</p></th>
                  <th className="pb-3 px-2"><p className="label-sm font-bold text-nav">Starter</p></th>
                  <th className="pb-3 px-2"><p className="label-sm font-bold text-nav">Growth</p></th>
                  <th className="pb-3 px-2"><p className="label-sm font-bold text-nav">Listed Services</p></th>
                  <th className="pb-3 pl-2"><p className="label-sm font-bold text-nav">Enterprise</p></th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: language === 'en' ? 'Filing Automation' : 'Automatisation des dépôts', starter: 'No', growth: 'SEDAR 2', listedServices: 'Coming Soon', enterprise: '50+ countries' },
                  { feature: language === 'en' ? 'AI Disclosure & Filing' : 'IA Divulgation & Dépôt', starter: 'No', growth: 'Basic', listedServices: 'Advanced', enterprise: 'Advanced' },
                  { feature: language === 'en' ? 'M&A Intelligence' : 'Intelligence F&A', starter: 'No', growth: 'No', listedServices: 'Coming Soon', enterprise: 'Yes' },
                  { feature: language === 'en' ? 'CFO/CEO Coaching AI' : 'IA Coaching CFO/CEO', starter: 'No', growth: 'No', listedServices: 'Coming Soon', enterprise: 'Yes' },
                ].map(({ feature, starter, growth, listedServices, enterprise }, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #E5E4E0' }}>
                    <td className="py-4 pr-4"><p className="body-sm text-nav font-medium">{feature}</p></td>
                    <td className="py-4 px-2"><p className="body-sm text-text-muted">{starter}</p></td>
                    <td className="py-4 px-2"><p className="body-sm text-text-muted">{growth}</p></td>
                    <td className="py-4 px-2"><p className="body-sm font-semibold" style={{ color: '#2D7A5F' }}>{listedServices}</p></td>
                    <td className="py-4 pl-2"><p className="body-sm font-semibold" style={{ color: '#2D7A5F' }}>{enterprise}</p></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Value comparison */}
        <div className="card rounded-2xl p-8 mb-10">
          <h2 className="serif text-2xl text-nav mb-2 text-center">
            {language === 'en' ? 'The Real Cost of Going Public' : "Le vrai coût d'une introduction en bourse"}
          </h2>
          <p className="text-text-muted body-sm text-center mb-8">
            {language === 'en'
              ? 'IPOReady does not replace professionals — it organizes your workflow so you use their time more efficiently.'
              : 'IPOReady ne remplace pas les professionnels — il organise votre flux de travail.'}
          </p>
          <div className="grid md:grid-cols-3 gap-5 text-center">
            {[
              { label: 'Securities Lawyer',       typical: '$200K–$800K', ipoReady: 'Included guidance', savings: 'up to $400K' },
              { label: 'Workflow Management',     typical: '$50K–$150K',  ipoReady: 'from $349/mo',      savings: 'up to $148K' },
              { label: 'Prospectus & S-1 Prep',   typical: '$20K–$60K',   ipoReady: 'AI-powered builder', savings: 'up to $60K' },
            ].map(({ label, typical, ipoReady, savings }) => (
              <div key={label} className="p-5 rounded-xl" style={{ background: '#F7F6F4', border: '1px solid #E5E4E0' }}>
                <p className="font-semibold text-nav body-sm mb-3">{label}</p>
                <p className="caption-sm text-text-muted mb-1">Traditional: <span className="text-accent font-semibold">{typical}</span></p>
                <p className="caption-sm text-text-muted mb-2">IPOReady: <span className="font-semibold text-nav">{ipoReady}</span></p>
                <p className="body-sm font-bold text-nav">Save {savings}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── INVESTOR PLANS SECTION ─────────────────────────────────── */}
        <div className="py-32 md:py-48" style={{ borderTop: '2px solid #E5E4E0', marginTop: '4rem', marginBottom: '4rem' }}>
          <div className="max-w-6xl mx-auto" style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 label-sm font-semibold uppercase tracking-widest"
                style={{ background: '#EAF5F0', color: '#2D7A5F', border: '1px solid rgba(45,122,95,0.2)' }}>
                <TrendingUp className="w-3 h-3" />
                {language === 'en' ? 'For Institutional Investors' : 'Pour les investisseurs institutionnels'}
              </div>
              <h2 className="serif text-5xl text-nav mb-4 leading-tight">
                {language === 'en'
                  ? <>Deal Flow <span style={{ color: '#E8312A' }}>You Can't Get</span> Anywhere Else</>
                  : <>Flux de transactions <span style={{ color: '#E8312A' }}>que vous ne pouvez pas</span> obtenir ailleurs</>
                }
              </h2>
              <p className="text-text-muted text-lg max-w-3xl mx-auto">
                {language === 'en'
                  ? 'Real-time visibility into companies actually executing IPO/RTO journeys. First look at institutional-grade deal flow in North America.'
                  : 'Visibilité en temps réel des entreprises exécutant réellement les processus d\'IPO/RTO. Premier regard sur les flux de transactions de niveau institutionnel.'}
              </p>
            </motion.div>

            {/* Investor Plans Grid */}
            <div className="grid md:grid-cols-2 gap-8 mb-10">
              {/* Canada Plan */}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }} viewport={{ once: true }}
                style={{ background: 'white', border: '2px solid #E5E4E0', borderRadius: '1rem', padding: '2rem' }}>
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="w-5 h-5" style={{ color: '#2D7A5F' }} />
                    <h3 className="font-display text-2xl font-bold text-nav">🇨🇦 Canada</h3>
                  </div>
                  <p className="text-text-muted text-sm mb-4">
                    {language === 'en' ? 'TSX, TSXV, CSE deal flow' : 'Flux TSX, TSXV, CSE'}
                  </p>
                </div>

                {/* Trial */}
                <div className="mb-8 p-4 rounded-lg" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                  <p className="text-xs font-semibold text-success mb-1 uppercase tracking-wider">
                    {language === 'en' ? 'Try Risk-Free' : 'Essai sans risque'}
                  </p>
                  <p className="text-3xl font-bold text-nav mb-1">$99 <span className="text-lg text-text-muted">/mo</span></p>
                  <p className="text-xs text-text-muted">1 month trial</p>
                </div>

                {/* Monthly Plan */}
                <div className="mb-8">
                  <p className="text-xs font-semibold text-nav uppercase tracking-wider mb-2">After trial:</p>
                  <p className="text-4xl font-bold text-nav mb-2">$499 <span className="text-lg text-text-muted">/mo</span></p>
                  <p className="text-sm text-text-muted">1 included seat</p>
                </div>

                {/* Additional Seats */}
                <div className="mb-8 p-4 rounded-lg" style={{ background: '#F7F6F4', border: '1px solid #E5E4E0' }}>
                  <p className="text-xs font-semibold text-nav uppercase tracking-wider mb-2">Additional seats:</p>
                  <p className="text-2xl font-bold text-nav">$99 <span className="text-base text-text-muted">/seat</span></p>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  {[
                    language === 'en' ? 'Real-time deal alerts' : 'Alertes transactionnelles en temps réel',
                    language === 'en' ? 'Company pipeline tracking' : 'Suivi du pipeline d\'entreprises',
                    language === 'en' ? 'PACE™ readiness scores' : 'Scores de préparation PACE™',
                    language === 'en' ? 'Investor directory access' : 'Accès au répertoire des investisseurs',
                    language === 'en' ? 'Email & SMS notifications' : 'Notifications par e-mail et SMS',
                  ].map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-nav">{feature}</span>
                    </div>
                  ))}
                </div>

                <button onClick={() => handleCheckout('investor-cad')} disabled={checkoutLoading === 'investor-cad'}
                  className="w-full font-semibold text-white px-4 py-3 rounded-full transition-all"
                  style={{ background: '#E8312A', opacity: checkoutLoading === 'investor-cad' ? 0.7 : 1 }}>
                  {checkoutLoading === 'investor-cad'
                    ? (language === 'en' ? 'Processing...' : 'Traitement...')
                    : (language === 'en' ? 'Start Free Trial →' : 'Commencer l\'essai gratuit →')}
                </button>
              </motion.div>

              {/* USA Plan */}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} viewport={{ once: true }}
                style={{ background: 'white', border: '2px solid #1A1A1A', boxShadow: '0 8px 32px rgba(26,26,26,0.12)', borderRadius: '1rem', padding: '2rem', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)' }}>
                  <span className="label-xs font-bold" style={{ background: '#1A1A1A', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '9999px', display: 'inline-block' }}>
                    {language === 'en' ? '⭐ Most Deal Flow' : '⭐ Plus de transactions'}
                  </span>
                </div>

                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="w-5 h-5" style={{ color: '#1D4ED8' }} />
                    <h3 className="font-display text-2xl font-bold text-nav">🇺🇸 USA</h3>
                  </div>
                  <p className="text-text-muted text-sm mb-4">
                    {language === 'en' ? 'NASDAQ, NYSE, OTC deal flow' : 'Flux NASDAQ, NYSE, OTC'}
                  </p>
                </div>

                {/* Trial */}
                <div className="mb-8 p-4 rounded-lg" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                  <p className="text-xs font-semibold text-blue-700 mb-1 uppercase tracking-wider">
                    {language === 'en' ? 'Try Risk-Free' : 'Essai sans risque'}
                  </p>
                  <p className="text-3xl font-bold text-nav mb-1">$99 <span className="text-lg text-text-muted">/mo</span></p>
                  <p className="text-xs text-text-muted">1 month trial</p>
                </div>

                {/* Monthly Plan */}
                <div className="mb-8">
                  <p className="text-xs font-semibold text-nav uppercase tracking-wider mb-2">After trial:</p>
                  <p className="text-4xl font-bold text-nav mb-2">$999 <span className="text-lg text-text-muted">/mo</span></p>
                  <p className="text-sm text-text-muted">1 included seat</p>
                </div>

                {/* Additional Seats */}
                <div className="mb-8 p-4 rounded-lg" style={{ background: '#F7F6F4', border: '1px solid #E5E4E0' }}>
                  <p className="text-xs font-semibold text-nav uppercase tracking-wider mb-2">Additional seats:</p>
                  <p className="text-2xl font-bold text-nav">$149 <span className="text-base text-text-muted">/seat</span></p>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  {[
                    language === 'en' ? 'Everything in Canada +' : 'Tout du plan Canada +',
                    language === 'en' ? 'NASDAQ & NYSE pipeline' : 'Pipeline NASDAQ & NYSE',
                    language === 'en' ? 'US institutional network' : 'Réseau institutionnel américain',
                    language === 'en' ? 'SEC filing integration' : 'Intégration des dépôts SEC',
                    language === 'en' ? '24/7 priority support' : 'Support prioritaire 24/7',
                  ].map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-nav">{feature}</span>
                    </div>
                  ))}
                </div>

                <button onClick={() => handleCheckout('investor-usa')} disabled={checkoutLoading === 'investor-usa'}
                  className="w-full font-semibold text-white px-4 py-3 rounded-full transition-all"
                  style={{ background: '#E8312A', opacity: checkoutLoading === 'investor-usa' ? 0.7 : 1 }}>
                  {checkoutLoading === 'investor-usa'
                    ? (language === 'en' ? 'Processing...' : 'Traitement...')
                    : (language === 'en' ? 'Start Free Trial →' : 'Commencer l\'essai gratuit →')}
                </button>
              </motion.div>
            </div>

            {/* Pricing Note */}
            <div className="text-center p-6 rounded-xl" style={{ background: '#F7F6F4', border: '1px solid #E5E4E0' }}>
              <p className="text-sm text-text-muted">
                {language === 'en'
                  ? '💰 All pricing shown in USD. CAD display available at checkout. Cancel anytime during trial.'
                  : '💰 Tous les prix affichés en USD. Affichage CAD disponible à la caisse. Annulez à tout moment pendant l\'essai.'}
              </p>
            </div>
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
                  <p className="text-nav font-medium body-sm pr-4">{faq.q}</p>
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
                        <p className="text-text-muted body-sm leading-relaxed">{faq.a}</p>
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
              <p className="mb-6 max-w-xl mx-auto body-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                {language === 'en'
                  ? 'Your subscription is active and your PACE™ engine is running. Head to your dashboard to track your IPO velocity.'
                  : "Votre abonnement est actif et votre moteur PACE™ fonctionne. Rendez-vous sur votre tableau de bord."}
              </p>
              <Link href="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold body-sm text-nav transition-all"
                style={{ background: '#FFFFFF' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#F7F6F4')}
                onMouseLeave={e => (e.currentTarget.style.background = '#FFFFFF')}>
                {language === 'en' ? 'Go to Dashboard' : 'Aller au tableau de bord'}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="caption-sm mt-3" style={{ color: 'rgba(255,255,255,0.25)' }}>
                {language === 'en' ? 'Need to upgrade or change your plan? Use the cards above.' : 'Besoin de changer de plan? Utilisez les cartes ci-dessus.'}
              </p>
            </>
          ) : (
            <>
              <h2 className="serif text-3xl text-white mb-3">
                {language === 'en' ? 'Ready to start your IPO journey?' : 'Prêt à commencer votre parcours IPO?'}
              </h2>
              <p className="mb-6 max-w-xl mx-auto body-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                {language === 'en'
                  ? 'Join hundreds of companies using IPOReady to track, manage, and accelerate their path to public markets.'
                  : "Rejoignez des centaines d'entreprises qui utilisent IPOReady pour accélérer leur chemin vers les marchés publics."}
              </p>
              <Link href="/register"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold body-sm text-nav transition-all"
                style={{ background: '#FFFFFF' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#F7F6F4')}
                onMouseLeave={e => (e.currentTarget.style.background = '#FFFFFF')}>
                {language === 'en' ? 'Get Started Free' : 'Commencer gratuitement'}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="caption-sm mt-3" style={{ color: 'rgba(255,255,255,0.25)' }}>
                {language === 'en' ? 'No credit card required for trial · Cancel anytime after 3 months' : "Aucune carte de crédit requise pour l'essai"}
              </p>
            </>
          )}
        </div>

        {/* Legal Disclaimer */}
        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl px-5 py-4" style={{ background: '#FEF3C7', border: '1px solid #FDE68A' }}>
            <p className="label-sm font-semibold uppercase tracking-wider mb-2" style={{ color: '#B45309' }}>Important Disclosure</p>
            <p className="caption-sm leading-relaxed" style={{ color: '#92400E', opacity: 0.8 }}>
              IPOReady is a technology platform designed to help companies track and manage their IPO readiness workflow. It is not a replacement for — and does not constitute — legal counsel, audit or assurance services, securities advice, exchange advisory services, SEC, OSC, SEDAR/EDGAR filing services, or any other regulated professional or regulatory services required to complete a public listing. All users must engage qualified legal counsel, auditors, underwriters, and applicable regulatory advisors independently. Nothing on this platform constitutes a solicitation, recommendation, or offer to buy or sell securities. Subscription fees cover access to the technology platform only.
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer style={{ background: '#FFFFFF', borderTop: '1px solid #E5E4E0', marginTop: '3rem' }}>

          {/* Main grid */}
          <div className="max-w-7xl mx-auto" style={{ paddingTop: '2.5rem', paddingBottom: '2rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
            <div className="grid grid-cols-2 md:grid-cols-[1.5fr_0.9fr_0.9fr_0.9fr_0.9fr_0.9fr] gap-8">

              {/* Brand column */}
              <div className="col-span-2 md:col-span-1">
                <Link href="/" className="flex items-center gap-2.5" style={{ marginBottom: '1rem' }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#1A1A1A' }}>
                    <Rocket className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-display font-bold text-lg text-nav">
                    IPO<span style={{ color: '#E8312A' }}>Ready</span>
                  </span>
                </Link>
                <p className="text-text-muted body-sm leading-relaxed" style={{ marginBottom: '1.25rem', maxWidth: '260px' }}>
                  The world's first central hub for IPO readiness workflow management — from first board resolution to exchange approval.
                </p>
                {/* Social */}
                <div className="flex items-center gap-2" style={{ marginBottom: '1.25rem' }}>
                  {/* LinkedIn */}
                  <a href="https://linkedin.com/company/ipoready" target="_blank" rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                    style={{ background: '#F7F6F4', border: '1px solid #E5E4E0', color: '#9A9A9A' }}>
                    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
                  </a>
                  {/* X / Twitter */}
                  <a href="https://twitter.com/ipoready" target="_blank" rel="noopener noreferrer"
                    aria-label="Twitter / X"
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                    style={{ background: '#F7F6F4', border: '1px solid #E5E4E0', color: '#9A9A9A' }}>
                    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.733-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg>
                  </a>
                  {/* Email */}
                  <a href="mailto:hello@ipoready.com"
                    aria-label="Email"
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                    style={{ background: '#F7F6F4', border: '1px solid #E5E4E0', color: '#9A9A9A' }}>
                    <Mail className="w-3.5 h-3.5" />
                  </a>
                </div>
                {/* auditus.ai */}
                <a href="https://auditus.ai" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 label-sm font-medium transition-colors"
                  style={{ color: '#717171' }}>
                  <Zap className="w-3 h-3" />
                  Powered by auditus.ai
                  <ExternalLink className="w-3 h-3 opacity-50" />
                </a>
              </div>

              {/* Product */}
              <div>
                <p className="label-xs font-bold uppercase tracking-widest text-nav" style={{ marginBottom: '1rem' }}>Product</p>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {[
                    { label: 'IPO Checklist',     href: '/checklist' },
                    { label: 'Cap Table',          href: '/cap-table' },
                    { label: 'Raising Capital',    href: '/raising-capital' },
                    { label: 'Document Workspace', href: '/documents' },
                    { label: 'Expert Network',     href: '/marketplace' },
                    { label: 'Templates & Forms',  href: '/templates' },
                    { label: 'PACE™ Score',        href: '/dashboard' },
                  ].map(({ label, href }) => (
                    <li key={label}>
                      <Link href={href}
                        className="body-sm text-text-muted transition-colors hover:text-nav">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company */}
              <div>
                <p className="label-xs font-bold uppercase tracking-widest text-nav" style={{ marginBottom: '1rem' }}>Company</p>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {[
                    { label: 'Pricing',          href: '/pricing' },
                    { label: 'Referral Program', href: '/referrals' },
                    { label: 'Mission Control',  href: '/dashboard' },
                    { label: 'Team & Roles',     href: '/team' },
                    { label: 'Account',          href: '/account' },
                    { label: 'Get Started',      href: '/register' },
                    { label: 'Sign In',          href: '/login' },
                  ].map(({ label, href }) => (
                    <li key={label}>
                      <Link href={href}
                        className="body-sm text-text-muted transition-colors hover:text-nav">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Exchanges */}
              <div>
                <p className="label-xs font-bold uppercase tracking-widest text-nav" style={{ marginBottom: '1rem' }}>Exchanges</p>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {[
                    'TSX', 'TSXV', 'CSE', 'NASDAQ', 'NYSE', 'OTC Markets', 'Cboe Canada',
                  ].map(ex => (
                    <li key={ex}>
                      <span className="body-sm text-text-muted">{ex}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Listing Types */}
              <div>
                <p className="label-xs font-bold uppercase tracking-widest text-nav" style={{ marginBottom: '1rem' }}>Listing Types</p>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {['IPO', 'Direct Listing', 'RTO', 'SPAC', 'Regulation A+'].map(t => (
                    <li key={t}><span className="body-sm text-text-muted">{t}</span></li>
                  ))}
                </ul>
              </div>

              {/* Legal & Support */}
              <div>
                <p className="label-xs font-bold uppercase tracking-widest text-nav" style={{ marginBottom: '1rem' }}>Legal</p>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {[
                    { label: 'Privacy Policy',   href: '/privacy' },
                    { label: 'Terms of Service', href: '/terms' },
                    { label: 'Disclaimer',       href: '/disclaimer' },
                    { label: 'Cookie Policy',    href: '/cookies' },
                  ].map(({ label, href }) => (
                    <li key={label}>
                      <Link href={href}
                        className="body-sm text-text-muted transition-colors hover:text-nav">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <div style={{ marginTop: '1.5rem' }}>
                  <p className="label-xs font-bold uppercase tracking-widest text-nav" style={{ marginBottom: '1rem' }}>Support</p>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                    {[
                      { label: 'Contact Us',    href: 'mailto:hello@ipoready.com' },
                      { label: 'Help Centre',   href: '/help' },
                      { label: 'System Status', href: '/status' },
                    ].map(({ label, href }) => (
                      <li key={label}>
                        <a href={href}
                          className="body-sm text-text-muted transition-colors hover:text-nav">
                          {label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Compliance bar */}
          <div style={{ borderTop: '1px solid #E5E4E0', background: '#F7F6F4' }}>
            <div className="max-w-7xl mx-auto" style={{ paddingTop: '1.25rem', paddingBottom: '1.25rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <p className="caption-sm leading-relaxed text-text-light" style={{ maxWidth: '680px' }}>
                  <span className="font-semibold text-text-muted">Important:</span>{' '}
                  IPOReady is a workflow management and project tracking platform only. It does not provide legal, compliance, accounting, securities, or investment banking services, and does not act on your behalf in any regulatory or professional capacity.
                  All regulatory filings, legal opinions, and compliance determinations must be executed by licensed professionals. Nothing on this platform constitutes legal advice, financial advice, or an offer to buy or sell securities.
                </p>
                <div className="flex items-center gap-4 flex-shrink-0 self-end md:self-auto">
                  <p className="caption-sm text-text-light">© {new Date().getFullYear()} IPOReady. All rights reserved.</p>
                  <div className="flex items-center gap-1 p-0.5 rounded-lg" style={{ background: '#EFEFED', border: '1px solid #E5E4E0' }}>
                    {(['EN', 'FR'] as const).map(l => (
                      <span key={l} className="label-sm px-2 py-0.5 rounded font-mono font-medium cursor-default"
                        style={{ color: '#9A9A9A' }}>{l}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
    </>
  )
}
