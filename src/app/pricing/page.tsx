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
    q: 'What is IPOReady investor access?',
    a: 'IPOReady provides institutional investors real-time visibility into verified companies executing IPO and RTO journeys across North America. Get deal flow alerts, PACE™ readiness scores, and direct access to verified companies.',
  },
  {
    q: 'How is the deal flow verified?',
    a: 'All companies on IPOReady complete profile verification and board approval confirmation. We work directly with CFOs, legal counsel, and board members — not speculators. This ensures you\'re seeing genuine IPO/RTO activity.',
  },
  {
    q: 'Can I cancel my trial anytime?',
    a: 'Yes. Cancel your trial anytime before the first month ends. No questions asked, no credit card charges. After your trial, you can cancel month-to-month subscriptions anytime.',
  },
  {
    q: 'What\'s the difference between Canada and USA plans?',
    a: 'The Canada plan gives you access to TSX, TSXV, and CSE deal flow. The USA plan includes everything in Canada plus NASDAQ, NYSE, and OTC deal flow — the most deal flow available on any platform.',
  },
  {
    q: 'Can I add team members to my investor account?',
    a: 'Yes. Additional seats are $99/month (Canada) or $149/month (USA). Each seat gets full access to deal alerts, analytics, and company profiles.',
  },
  {
    q: 'Do you offer enterprise contracts?',
    a: 'Yes. Contact us for custom pricing on enterprise agreements with multiple seats, dedicated support, and API access for firms managing large portfolios.',
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
          <h1 className="h1 mb-4">
            {language === 'en'
              ? <>Deal Flow<br /><span style={{ color: '#E8312A' }}>Built for Investors</span></>
              : <>Flux de transactions<br /><span style={{ color: '#E8312A' }}>Conçu pour les investisseurs</span></>
            }
          </h1>
          <p className="body max-w-2xl mx-auto mb-3">
            {language === 'en'
              ? 'Get real-time visibility into verified companies executing IPO and RTO journeys across North America.'
              : "Obtenez une visibilité en temps réel sur les entreprises vérifiées qui exécutent des processus d'IPO et d'RTO en Amérique du Nord."}
          </p>
        </motion.div>


        {/* ─── INVESTOR PLANS SECTION ─────────────────────────────────── */}
        <div className="py-32 md:py-48" style={{ borderTop: '2px solid #E5E4E0', marginTop: '4rem', marginBottom: '4rem' }}>
          <div className="max-w-6xl mx-auto" style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 label-sm font-semibold uppercase tracking-widest"
                style={{ background: '#EAF5F0', color: '#2D7A5F', border: '1px solid rgba(45,122,95,0.2)' }}>
                <TrendingUp className="w-3 h-3" />
                {language === 'en' ? 'For Institutional Investors' : 'Pour les investisseurs institutionnels'}
              </div>
              <h2 className="h2 mb-4">
                {language === 'en'
                  ? <>Deal Flow <span style={{ color: '#E8312A' }}>You Can't Get</span> Anywhere Else</>
                  : <>Flux de transactions <span style={{ color: '#E8312A' }}>que vous ne pouvez pas</span> obtenir ailleurs</>
                }
              </h2>
              <p className="body max-w-3xl mx-auto">
                {language === 'en'
                  ? 'Real-time visibility into companies actually executing IPO/RTO journeys. First look at institutional-grade deal flow in North America.'
                  : 'Visibilité en temps réel des entreprises exécutant réellement les processus d\'IPO/RTO. Premier regard sur les flux de transactions de niveau institutionnel.'}
              </p>
            </motion.div>

            {/* Investor Plans Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-10">
              {/* Canada Plan */}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }} viewport={{ once: true }}
                style={{ background: 'white', border: '2px solid #E5E4E0', borderRadius: '1rem', padding: '2rem' }}>
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="w-5 h-5" style={{ color: '#2D7A5F' }} />
                    <h3 className="h3">🇨🇦 Canada</h3>
                  </div>
                  <p className="body-sm mb-4">
                    {language === 'en' ? 'TSX, TSXV, CSE deal flow' : 'Flux TSX, TSXV, CSE'}
                  </p>
                </div>

                {/* Trial */}
                <div className="mb-8 p-4 rounded-lg" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                  <p className="label-xs text-success mb-1">
                    {language === 'en' ? 'Try Risk-Free' : 'Essai sans risque'}
                  </p>
                  <p className="h2 mb-1">$99 <span className="body text-text-muted">/mo</span></p>
                  <p className="caption text-text-muted">1 month trial</p>
                </div>

                {/* Monthly Plan */}
                <div className="mb-8">
                  <p className="label-xs mb-2">After trial:</p>
                  <p className="h2 mb-2">$499 <span className="body text-text-muted">/mo</span></p>
                  <p className="body-sm text-text-muted">1 included seat</p>
                </div>

                {/* Additional Seats */}
                <div className="mb-8 p-4 rounded-lg" style={{ background: '#F7F6F4', border: '1px solid #E5E4E0' }}>
                  <p className="label-xs mb-2">Additional seats:</p>
                  <p className="h3">$99 <span className="body-sm text-text-muted">/seat</span></p>
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
                      <span className="body-sm">{feature}</span>
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
                    <h3 className="h3">🇺🇸 USA</h3>
                  </div>
                  <p className="body-sm mb-4">
                    {language === 'en' ? 'NASDAQ, NYSE, OTC deal flow' : 'Flux NASDAQ, NYSE, OTC'}
                  </p>
                </div>

                {/* Trial */}
                <div className="mb-8 p-4 rounded-lg" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                  <p className="label-xs text-blue-700 mb-1">
                    {language === 'en' ? 'Try Risk-Free' : 'Essai sans risque'}
                  </p>
                  <p className="h2 mb-1">$99 <span className="body text-text-muted">/mo</span></p>
                  <p className="caption text-text-muted">1 month trial</p>
                </div>

                {/* Monthly Plan */}
                <div className="mb-8">
                  <p className="label-xs mb-2">After trial:</p>
                  <p className="h2 mb-2">$999 <span className="body text-text-muted">/mo</span></p>
                  <p className="body-sm text-text-muted">1 included seat</p>
                </div>

                {/* Additional Seats */}
                <div className="mb-8 p-4 rounded-lg" style={{ background: '#F7F6F4', border: '1px solid #E5E4E0' }}>
                  <p className="label-xs mb-2">Additional seats:</p>
                  <p className="h3">$149 <span className="body-sm text-text-muted">/seat</span></p>
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
                      <span className="body-sm">{feature}</span>
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

              {/* Listed Services Plan */}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} viewport={{ once: true }}
                style={{ background: 'white', border: '1px solid #E5E4E0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', borderRadius: '1rem', padding: '2rem', position: 'relative' }}>
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-5 h-5" style={{ color: '#E8312A' }} />
                    <h3 className="h3">🚀 Listed Services</h3>
                  </div>
                  <p className="body-sm mb-4">
                    {language === 'en' ? 'AI-powered OS for public companies' : 'Système d\'exploitation IA pour sociétés publiques'}
                  </p>
                </div>

                {/* Coming Soon */}
                <div className="mb-8 p-4 rounded-lg" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                  <p className="label-xs text-success mb-1">
                    {language === 'en' ? 'Unlocks at IPO' : 'Déverrouillé à l\'IPO'}
                  </p>
                  <p className="h2 mb-1">{language === 'en' ? 'Custom' : 'Personnalisé'}</p>
                  <p className="caption">{language === 'en' ? 'Included with Growth plan post-listing' : 'Inclus avec le plan Growth après l\'IPO'}</p>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  {[
                    language === 'en' ? 'Disclosure & Filings AI' : 'IA Divulgation et dépôts',
                    language === 'en' ? 'Predictive Analytics' : 'Analyse prédictive',
                    language === 'en' ? 'Analyst Coverage Intelligence' : 'Intelligence de couverture',
                    language === 'en' ? 'M&A Intelligence Engine' : 'Moteur d\'intelligence F&A',
                    language === 'en' ? 'CFO/CEO Coaching AI' : 'IA Coaching CFO/CEO',
                  ].map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                      <span className="body-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <button disabled
                  className="w-full font-semibold text-white px-4 py-3 rounded-full transition-all opacity-50"
                  style={{ background: '#9A9A9A' }}>
                  {language === 'en' ? 'Coming Soon' : 'Bientôt disponible'}
                </button>
              </motion.div>
            </div>

            {/* Pricing Note */}
            <div className="text-center p-6 rounded-xl" style={{ background: '#F7F6F4', border: '1px solid #E5E4E0' }}>
              <p className="body-sm text-text-light">
                {language === 'en'
                  ? '💰 All pricing shown in USD. CAD display available at checkout. Cancel anytime during trial.'
                  : '💰 Tous les prix affichés en USD. Affichage CAD disponible à la caisse. Annulez à tout moment pendant l\'essai.'}
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mb-10">
          <h2 className="h2 mb-6 text-center">
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
                  <p className="body pr-4">{faq.q}</p>
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
                        <p className="body leading-relaxed text-text-muted">{faq.a}</p>
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
          <h2 className="h2 text-white mb-3">
            {language === 'en' ? 'Access Deal Flow You Can\'t Get Anywhere Else' : 'Accédez à des flux de transactions que vous ne pouvez trouver nulle part ailleurs'}
          </h2>
          <p className="mb-6 max-w-xl mx-auto body text-text-light" style={{ opacity: 0.55 }}>
            {language === 'en'
              ? 'Real-time visibility into verified companies executing IPO and RTO journeys. Start your free trial today.'
              : "Visibilité en temps réel sur les entreprises vérifiées exécutant les journées d'IPO et d'RTO. Commencez votre essai gratuit dès aujourd'hui."}
          </p>
          <p className="caption-sm text-text-light" style={{ opacity: 0.4 }}>
            {language === 'en' ? '💳 No credit card required for trial · Cancel anytime' : '💳 Aucune carte de crédit requise · Annulez à tout moment'}
          </p>
        </div>

        {/* Legal Disclaimer */}
        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl px-5 py-4" style={{ background: '#FEF3C7', border: '1px solid #FDE68A' }}>
            <p className="label-xs mb-2" style={{ color: '#B45309' }}>Important Disclosure</p>
            <p className="caption leading-relaxed" style={{ color: '#92400E', opacity: 0.8 }}>
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
                  <span className="h3">
                    IPO<span style={{ color: '#E8312A' }}>Ready</span>
                  </span>
                </Link>
                <p className="body leading-relaxed text-text-muted" style={{ marginBottom: '1.25rem', maxWidth: '260px' }}>
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
                  className="inline-flex items-center gap-1.5 label-xs transition-colors"
                  style={{ color: '#717171' }}>
                  <Zap className="w-3 h-3" />
                  Powered by auditus.ai
                  <ExternalLink className="w-3 h-3 opacity-50" />
                </a>
              </div>

              {/* Product */}
              <div>
                <p className="label-xs uppercase tracking-widest" style={{ marginBottom: '1rem' }}>Product</p>
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
                <p className="label-xs uppercase tracking-widest" style={{ marginBottom: '1rem' }}>Company</p>
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
                <p className="label-xs uppercase tracking-widest" style={{ marginBottom: '1rem' }}>Exchanges</p>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {[
                    'TSX', 'TSXV', 'CSE', 'NASDAQ', 'NYSE', 'OTC Markets', 'Cboe Canada',
                  ].map(ex => (
                    <li key={ex}>
                      <span className="body-sm text-text-light">{ex}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Listing Types */}
              <div>
                <p className="label-xs uppercase tracking-widest" style={{ marginBottom: '1rem' }}>Listing Types</p>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {['IPO', 'Direct Listing', 'RTO', 'SPAC', 'Regulation A+'].map(t => (
                    <li key={t}><span className="body-sm text-text-light">{t}</span></li>
                  ))}
                </ul>
              </div>

              {/* Legal & Support */}
              <div>
                <p className="label-xs uppercase tracking-widest" style={{ marginBottom: '1rem' }}>Legal</p>
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
                  <p className="label-xs uppercase tracking-widest" style={{ marginBottom: '1rem' }}>Support</p>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                    {[
                      { label: 'Contact Us',    href: 'mailto:hello@ipoready.com' },
                      { label: 'Help Centre',   href: '/help' },
                      { label: 'System Status', href: '/status' },
                    ].map(({ label, href }) => (
                      <li key={label}>
                        <a href={href}
                          className="body-sm transition-colors hover:text-nav text-text-muted">
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
                <p className="caption leading-relaxed text-text-light" style={{ maxWidth: '680px' }}>
                  <span className="font-semibold">Important:</span>{' '}
                  IPOReady is a workflow management and project tracking platform only. It does not provide legal, compliance, accounting, securities, or investment banking services, and does not act on your behalf in any regulatory or professional capacity.
                  All regulatory filings, legal opinions, and compliance determinations must be executed by licensed professionals. Nothing on this platform constitutes legal advice, financial advice, or an offer to buy or sell securities.
                </p>
                <div className="flex items-center gap-4 flex-shrink-0 self-end md:self-auto">
                  <p className="caption text-text-light">© {new Date().getFullYear()} IPOReady. All rights reserved.</p>
                  <div className="flex items-center gap-1 p-0.5 rounded-lg" style={{ background: '#EFEFED', border: '1px solid #E5E4E0' }}>
                    {(['EN', 'FR'] as const).map(l => (
                      <span key={l} className="label-xs px-2 py-0.5 rounded font-mono cursor-default text-text-light">{l}</span>
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
