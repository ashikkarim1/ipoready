'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Rocket, ArrowRight, CheckCircle2, DollarSign, Users, TrendingUp,
  ChevronDown, Calculator, Star, Shield, Globe, Zap,
  Briefcase, Scale, BarChart3, Building2, AlertCircle,
  Copy, Check, ToggleLeft, ToggleRight
} from 'lucide-react'

type ProfType = 'lawyer' | 'auditor' | 'accountant' | 'advisor' | 'other'
interface CalcState {
  plan: 'starter' | 'growth' | 'enterprise'
  referralsPerYear: number
  billingCycle: 'monthly' | 'annual'
}

const PLAN_PRICES = {
  starter:    { monthly: 399,  annual: 265  },
  growth:     { monthly: 1049, annual: 699  },
  enterprise: { monthly: 2599, annual: 1739 },
}

const PROF_LABELS: Record<ProfType, string> = {
  lawyer:     'Securities / Corporate Lawyer',
  auditor:    'Auditor / Assurance Partner',
  accountant: 'CPA / Accounting Firm',
  advisor:    'Investment Advisor / Banker',
  other:      'Other Professional',
}

const WHO_QUALIFIES = [
  { icon: Scale,      label: 'Securities Lawyers',        body: 'Corporate counsel advising companies on regulatory compliance, exchange requirements, and listing readiness.' },
  { icon: BarChart3,  label: 'Auditors & Assurance',      body: 'Public accounting firms conducting IPO audits, review engagements, or advisory work for listing candidates.' },
  { icon: Briefcase,  label: 'CPAs & Advisory Firms',     body: 'Accounting professionals providing financial statement preparation, internal control, or transaction advisory services.' },
  { icon: Building2,  label: 'Investment Bankers',        body: 'Agents, dealers, and M&A advisors working on bought deals, private placements, or RTO/backdoor listing transactions.' },
  { icon: TrendingUp, label: 'Management Consultants',    body: 'Business advisors engaged by pre-IPO companies for governance, operational readiness, or board advisory.' },
  { icon: Users,      label: 'IR & Communications Firms', body: 'Investor relations professionals and communications agencies working with companies preparing for a public market debut.' },
]

const FAQS = [
  { q: 'Can lawyers ethically accept referral fees?', a: 'This depends on your jurisdiction and bar association rules. In many Canadian provinces and US states, lawyers cannot receive referral fees from non-lawyer entities for client referrals. However, many lawyers receive referral fees through their professional corporation, and the fee may be characterized as a "business introduction fee" rather than a legal referral fee. Always consult your bar association guidelines and your firm\'s conflict of interest policies before participating. IPOReady\'s program is designed for technology platform referrals only — not legal service referrals.' },
  { q: 'When do commissions start, and how long do they last?', a: 'Commissions begin when your referred client\'s first payment is confirmed. You earn 20% of their monthly subscription amount for every month they remain a paying subscriber, for up to 12 months from their first payment date.' },
  { q: 'How are commissions paid?', a: 'Commissions are paid automatically via Stripe Connect on the 1st of each month for all confirmed payments received during the prior month. A minimum payout threshold of CA$50 applies — amounts below this roll over to the following month. You will need to connect a Stripe-enabled bank account to receive payouts.' },
  { q: 'What happens if a referred client downgrades or cancels?', a: 'Commissions are calculated based on the actual plan the client is on each month. If they downgrade, your commission decreases proportionally. If they cancel, commissions stop from that month forward. Commissions already paid are not clawed back.' },
  { q: 'Is this program available outside Canada?', a: 'Yes. The Professional Partner Program is open globally. Commissions are paid in CAD. Tax slip requirements vary by your jurisdiction — see the Tax section in your partner dashboard for details.' },
  { q: 'Can my firm participate as an entity rather than individually?', a: 'Yes. Law firms, accounting firms, and advisory firms can enroll as a single partner entity. One referral link is issued per firm. Commission payments and tax slips are issued to the firm name and business number.' },
  { q: 'What if my client is already aware of IPOReady?', a: 'For a referral to qualify, your client must not have previously engaged with IPOReady directly (no account, no sales contact). If they sign up through your referral link, the commission is attributed to you regardless of prior awareness.' },
]

const CONVERSATION_SCRIPTS = [
  { label: 'Cold Outreach', script: '"Hi [Name], I\'ve been advising several companies preparing for a TSX/TSXV listing, and I wanted to share a platform I\'ve been recommending — IPOReady centralizes everything from compliance to filing deadlines. Would a 15-minute overview call be worthwhile?"' },
  { label: 'Warm Introduction', script: '"You mentioned last quarter that you\'re exploring a public listing — there\'s a platform called IPOReady that I\'ve found incredibly useful for managing the readiness process. Happy to send you a trial link personally."' },
  { label: 'Follow-Up', script: '"Following up on my earlier note — I\'ve now had two clients use IPOReady through their TSXV listing process and the feedback has been excellent. Let me know if you\'d like the referral link."' },
]

export default function PartnersPage() {
  const [calc, setCalc] = useState<CalcState>({ plan: 'growth', referralsPerYear: 3, billingCycle: 'monthly' })
  const [profType, setProfType] = useState<ProfType>('lawyer')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', firm: '', email: '', phone: '', jurisdiction: '', clients: '', notes: '' })
  const [emailUpdateEnabled, setEmailUpdateEnabled] = useState(true)
  const [copied, setCopied] = useState(false)

  function handleCopyReview() {
    navigator.clipboard.writeText(`IPOReady has been an essential part of our IPO readiness workflow. The platform centralizes every compliance task, filing deadline, and governance requirement in one place — saving our team dozens of hours each month. I'd recommend it to any company preparing for a public listing on TSX, TSXV, or any Canadian or US exchange.`).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  const monthlyRate = PLAN_PRICES[calc.plan][calc.billingCycle]
  const commissionPerClient = monthlyRate * 0.20
  const commissionAnnualPerClient = commissionPerClient * 12
  const totalAnnual = commissionAnnualPerClient * calc.referralsPerYear

  const inputStyle = {
    width: '100%', padding: '0.75rem 1rem', borderRadius: '12px',
    border: '1px solid #E5E4E0', background: '#FFFFFF',
    color: '#1A1A1A', fontSize: '14px', outline: 'none',
    fontFamily: 'inherit',
  }

  return (
    <div style={{ background: '#F7F6F4', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #E5E4E0', height: '56px',
        display: 'flex', alignItems: 'center', padding: '0 1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginRight: 'auto', textDecoration: 'none' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Rocket className="w-4 h-4 text-white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '18px', color: '#1A1A1A', letterSpacing: '-0.3px' }}>
            IPO<span style={{ color: '#E8312A' }}>Ready</span>
          </span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link href="/login"
            style={{ fontSize: '13px', fontWeight: 500, color: '#717171', padding: '6px 14px', borderRadius: '100px', textDecoration: 'none', border: '1px solid #E5E4E0', background: '#fff' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#1A1A1A')}
            onMouseLeave={e => (e.currentTarget.style.color = '#717171')}>
            Sign In
          </Link>
          <a href="#apply"
            style={{ fontSize: '13px', fontWeight: 600, color: '#fff', padding: '6px 16px', borderRadius: '100px', textDecoration: 'none', background: '#E8312A', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#C4261F' }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#E8312A' }}>
            Apply to Partner
          </a>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section style={{ background: '#FFFFFF', padding: '5rem 1.5rem 4rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#FDECEB', color: '#E8312A', border: '1px solid #FBCFCF', borderRadius: '100px', padding: '4px 14px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
              <Star className="w-3 h-3" /> Professional Partner Program
            </div>
            <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.75rem)', fontWeight: 900, color: '#1A1A1A', lineHeight: 1.1, marginBottom: '1.25rem', letterSpacing: '-1px' }}>
              Earn <span style={{ color: '#E8312A' }}>20% recurring</span><br />for every IPO client you refer
            </h1>
            <p style={{ fontSize: '18px', color: '#717171', maxWidth: '580px', margin: '0 auto 1rem', lineHeight: 1.65 }}>
              You're already in the room when companies decide to go public. Introduce them to IPOReady and earn 20% of their monthly subscription for 12 months — automatically.
            </p>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#B45309', marginBottom: '2rem' }}>
              ⚡ The average partner referring 3 companies earns CA$7,600+ per year in passive income.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <a href="#apply"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#1A1A1A', color: '#fff', padding: '12px 24px', borderRadius: '100px', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#333' }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#1A1A1A' }}>
                Apply Now — Takes 3 Minutes <ArrowRight className="w-4 h-4" />
              </a>
              <a href="#calculator"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#fff', color: '#1A1A1A', padding: '12px 24px', borderRadius: '100px', fontWeight: 600, fontSize: '14px', textDecoration: 'none', border: '1px solid #E5E4E0' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#F7F6F4' }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#fff' }}>
                <Calculator className="w-4 h-4" /> Calculate Your Earnings
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats strip ──────────────────────────────────────────────────── */}
      <section style={{ background: '#1A1A1A', padding: '2.5rem 1.5rem', borderTop: '1px solid #E5E4E0' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }} className="md:grid-cols-4">
          {[
            { value: '20%',   label: 'Commission rate',    sub: 'of monthly subscription' },
            { value: '12 mo', label: 'Commission period',  sub: 'per referred client' },
            { value: 'Auto',  label: 'Payout method',      sub: 'via Stripe Connect' },
            { value: 'CA$0',  label: 'To participate',     sub: 'no fees, no minimums' },
          ].map(({ value, label, sub }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <p style={{ fontWeight: 900, fontSize: '2rem', color: '#E8312A', marginBottom: '2px', lineHeight: 1 }}>{value}</p>
              <p style={{ fontWeight: 600, fontSize: '13px', color: '#FFFFFF', marginBottom: '2px' }}>{label}</p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Who qualifies ─────────────────────────────────────────────────── */}
      <section style={{ background: '#FFFFFF', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#1A1A1A', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>Who Can Partner With Us</h2>
            <p style={{ fontSize: '15px', color: '#717171', maxWidth: '480px', margin: '0 auto' }}>Any professional who regularly works with companies exploring or preparing for a public market listing.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }} className="grid-cols-1 md:grid-cols-3">
            {WHO_QUALIFIES.map(({ icon: Icon, label, body }) => (
              <div key={label} style={{ background: '#FFFFFF', border: '1px solid #E5E4E0', borderRadius: '16px', padding: '1.5rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#F7F6F4', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Icon className="w-4 h-4" style={{ color: '#1A1A1A' }} />
                </div>
                <p style={{ fontWeight: 600, fontSize: '13px', color: '#1A1A1A', marginBottom: '6px' }}>{label}</p>
                <p style={{ fontSize: '12px', color: '#9A9A9A', lineHeight: 1.6 }}>{body}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '1.5rem', padding: '1rem 1.25rem', borderRadius: '12px', background: '#FFFBEB', border: '1px solid #FDE68A', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#B45309' }} />
            <p style={{ fontSize: '13px', color: '#B45309', lineHeight: 1.6, margin: 0 }}>
              <strong>For lawyers:</strong> Rules on referral fees vary by province and state. This program involves referring clients to a technology platform, not a legal service. Consult your bar association and firm policy before participating.
            </p>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section style={{ background: '#F7F6F4', padding: '5rem 1.5rem', borderTop: '1px solid #E5E4E0' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#1A1A1A', letterSpacing: '-0.5px' }}>How It Works</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }} className="grid-cols-2 md:grid-cols-4">
            {[
              { step: '01', title: 'Apply & Verify',    body: 'Complete the 3-minute application. We verify your professional credentials within 1 business day.' },
              { step: '02', title: 'Get Your Link',     body: 'Receive a unique referral link and promo code tied to your professional profile.' },
              { step: '03', title: 'Refer Clients',     body: 'Share your link with any company that mentions going public. Works in person, by email, or through LinkedIn.' },
              { step: '04', title: 'Earn Automatically', body: 'Commissions are calculated and deposited on the 1st of every month for active subscribers.' },
            ].map(({ step, title, body }) => (
              <div key={step} style={{ textAlign: 'center' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: '#1A1A1A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontWeight: 900, fontSize: '15px', letterSpacing: '-0.5px' }}>
                  {step}
                </div>
                <p style={{ fontWeight: 700, fontSize: '13px', color: '#1A1A1A', marginBottom: '6px' }}>{title}</p>
                <p style={{ fontSize: '12px', color: '#9A9A9A', lineHeight: 1.6 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Earnings calculator ───────────────────────────────────────────── */}
      <section id="calculator" style={{ background: '#FFFFFF', padding: '5rem 1.5rem', borderTop: '1px solid #E5E4E0' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#1A1A1A', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>Earnings Calculator</h2>
            <p style={{ fontSize: '15px', color: '#717171' }}>See what your referrals could earn you.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }} className="grid-cols-1 md:grid-cols-2">

            {/* Controls */}
            <div style={{ background: '#F7F6F4', border: '1px solid #E5E4E0', borderRadius: '20px', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A', display: 'block', marginBottom: '8px' }}>Average Client Plan</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                  {(['starter', 'growth', 'enterprise'] as const).map(p => (
                    <button key={p} onClick={() => setCalc(c => ({ ...c, plan: p }))}
                      style={{ padding: '8px', borderRadius: '10px', fontSize: '12px', fontWeight: 600, textTransform: 'capitalize', cursor: 'pointer', border: '1.5px solid', transition: 'all 0.15s',
                        ...(calc.plan === p
                          ? { background: '#1A1A1A', color: '#fff', borderColor: '#1A1A1A' }
                          : { background: '#fff', color: '#717171', borderColor: '#E5E4E0' }) }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A', display: 'block', marginBottom: '8px' }}>Client Billing Cycle</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  {(['monthly', 'annual'] as const).map(b => (
                    <button key={b} onClick={() => setCalc(c => ({ ...c, billingCycle: b }))}
                      style={{ padding: '8px', borderRadius: '10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: '1.5px solid', transition: 'all 0.15s',
                        ...(calc.billingCycle === b
                          ? { background: '#1A1A1A', color: '#fff', borderColor: '#1A1A1A' }
                          : { background: '#fff', color: '#717171', borderColor: '#E5E4E0' }) }}>
                      {b === 'monthly' ? 'Monthly' : 'Annual'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A', display: 'block', marginBottom: '8px' }}>
                  Referrals per year: <span style={{ color: '#E8312A' }}>{calc.referralsPerYear}</span>
                </label>
                <input type="range" min={1} max={20} value={calc.referralsPerYear}
                  onChange={e => setCalc(c => ({ ...c, referralsPerYear: +e.target.value }))}
                  style={{ width: '100%', accentColor: '#E8312A' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                  {['1','5','10','15','20'].map(n => <span key={n} style={{ fontSize: '11px', color: '#C0BEB9' }}>{n}</span>)}
                </div>
              </div>
            </div>

            {/* Results */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: '#1A1A1A', borderRadius: '20px', padding: '1.75rem' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)', marginBottom: '6px' }}>Annual Commission</p>
                <p style={{ fontWeight: 900, fontSize: '3rem', color: '#E8312A', lineHeight: 1, marginBottom: '6px' }}>
                  CA${totalAnnual.toLocaleString()}
                </p>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
                  {calc.referralsPerYear} × CA${commissionAnnualPerClient.toLocaleString()}/yr per client
                </p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ background: '#F7F6F4', border: '1px solid #E5E4E0', borderRadius: '14px', padding: '1rem', textAlign: 'center' }}>
                  <p style={{ fontSize: '12px', color: '#9A9A9A', marginBottom: '4px' }}>Per month</p>
                  <p style={{ fontWeight: 900, fontSize: '1.25rem', color: '#1A1A1A' }}>CA${Math.round(totalAnnual / 12).toLocaleString()}</p>
                </div>
                <div style={{ background: '#F7F6F4', border: '1px solid #E5E4E0', borderRadius: '14px', padding: '1rem', textAlign: 'center' }}>
                  <p style={{ fontSize: '12px', color: '#9A9A9A', marginBottom: '4px' }}>Per referral/yr</p>
                  <p style={{ fontWeight: 900, fontSize: '1.25rem', color: '#1A1A1A' }}>CA${commissionAnnualPerClient.toLocaleString()}</p>
                </div>
              </div>
              <div style={{ padding: '0.875rem 1rem', borderRadius: '12px', background: '#FFFBEB', border: '1px solid #FDE68A' }}>
                <p style={{ fontSize: '11.5px', color: '#B45309', lineHeight: 1.6, margin: 0 }}>Assumes all referred clients remain subscribed for 12 months. Actual earnings depend on conversion and retention. Calculator uses CAD pricing.</p>
              </div>
            </div>
          </div>

          {/* Plan table */}
          <div style={{ marginTop: '2.5rem', background: '#F7F6F4', borderRadius: '16px', border: '1px solid #E5E4E0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E5E4E0' }}>
                  {['Plan', 'Client Monthly', 'Your Monthly', 'Your Annual (per client)'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1.25rem', textAlign: 'left', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9A9A9A' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { plan: 'Starter',    monthly: 399,  comm: 80,  annual: 958,  highlight: false },
                  { plan: 'Growth',     monthly: 1049, comm: 210, annual: 2517, highlight: true  },
                  { plan: 'Enterprise', monthly: 2599, comm: 520, annual: 6238, highlight: false },
                ].map(({ plan, monthly, comm, annual, highlight }, i, arr) => (
                  <tr key={plan} style={{ borderBottom: i < arr.length - 1 ? '1px solid #EEEDEB' : 'none', background: highlight ? '#FFFFFF' : 'transparent' }}>
                    <td style={{ padding: '0.875rem 1.25rem', fontWeight: 700, fontSize: '13px', color: '#1A1A1A' }}>{plan}</td>
                    <td style={{ padding: '0.875rem 1.25rem', fontFamily: 'monospace', fontSize: '13px', color: '#717171' }}>CA${monthly.toLocaleString()}/mo</td>
                    <td style={{ padding: '0.875rem 1.25rem', fontFamily: 'monospace', fontSize: '13px', fontWeight: 700, color: '#E8312A' }}>CA${comm}/mo</td>
                    <td style={{ padding: '0.875rem 1.25rem', fontFamily: 'monospace', fontSize: '13px', fontWeight: 900, color: '#1A1A1A' }}>CA${annual.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Why 20% ──────────────────────────────────────────────────────── */}
      <section style={{ background: '#F7F6F4', padding: '5rem 1.5rem', borderTop: '1px solid #E5E4E0' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#1A1A1A', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>Why We Pay 20%</h2>
            <p style={{ fontSize: '15px', color: '#717171', maxWidth: '480px', margin: '0 auto' }}>We deliberately set our partner rate above industry standard because our partners are trusted advisors — not cold leads.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }} className="grid-cols-1 md:grid-cols-3">
            {[
              { icon: Shield,     title: 'You Pre-Qualify Clients',  body: 'When a professional refers a client, they are already engaged in a real listing process. That conversion rate is far higher than marketing-sourced leads — we pay for quality.' },
              { icon: TrendingUp, title: 'Recurring, Not One-Time',  body: '20% recurring for 12 months compounds. A single referral to an Enterprise client returns CA$6,238 over the year — far more motivating than a flat finder\'s fee.' },
              { icon: Globe,      title: 'Below-Market Alternative', body: 'Traditional workflow consulting costs companies CA$50K–150K. At CA$699–2,599/mo, IPOReady is an easy sell to any client worried about budget.' },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} style={{ background: '#FFFFFF', border: '1px solid #E5E4E0', borderRadius: '16px', padding: '1.5rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#F7F6F4', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Icon className="w-4 h-4" style={{ color: '#1A1A1A' }} />
                </div>
                <p style={{ fontWeight: 700, fontSize: '13px', color: '#1A1A1A', marginBottom: '6px' }}>{title}</p>
                <p style={{ fontSize: '12px', color: '#9A9A9A', lineHeight: 1.6 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Application form ─────────────────────────────────────────────── */}
      <section id="apply" style={{ background: '#FFFFFF', padding: '5rem 1.5rem', borderTop: '1px solid #E5E4E0' }}>
        <div style={{ maxWidth: '580px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#1A1A1A', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>Apply to Partner</h2>
            <p style={{ fontSize: '15px', color: '#717171' }}>Takes 3 minutes. Approved within 1 business day.</p>
          </div>

          {submitted ? (
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
              style={{ textAlign: 'center', padding: '3rem', borderRadius: '20px', background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#D1FAE5', border: '1px solid #6EE7B7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <CheckCircle2 className="w-7 h-7" style={{ color: '#16A34A' }} />
              </div>
              <h3 style={{ fontWeight: 900, fontSize: '1.5rem', color: '#1A1A1A', marginBottom: '0.75rem' }}>Application Received</h3>
              <p style={{ fontSize: '14px', color: '#717171', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                Thank you, <strong>{form.name}</strong>. We'll review your application and send your unique referral link to <strong>{form.email}</strong> within 1 business day.
              </p>
              <Link href="/"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#1A1A1A', color: '#fff', padding: '10px 22px', borderRadius: '100px', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
                Back to IPOReady
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={e => { e.preventDefault(); setSubmitted(true) }}
              style={{ background: '#F7F6F4', border: '1px solid #E5E4E0', borderRadius: '20px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* Professional type */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A', display: 'block', marginBottom: '8px' }}>I am a…</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {(Object.keys(PROF_LABELS) as ProfType[]).map(k => (
                    <button key={k} type="button" onClick={() => setProfType(k)}
                      style={{ padding: '6px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: '1.5px solid', transition: 'all 0.15s',
                        ...(profType === k
                          ? { background: '#1A1A1A', color: '#fff', borderColor: '#1A1A1A' }
                          : { background: '#fff', color: '#717171', borderColor: '#E5E4E0' }) }}>
                      {PROF_LABELS[k]}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: '#1A1A1A', display: 'block', marginBottom: '6px' }}>Full Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = '#1A1A1A'; e.target.style.boxShadow = '0 0 0 3px rgba(26,26,26,0.07)' }}
                    onBlur={e => { e.target.style.borderColor = '#E5E4E0'; e.target.style.boxShadow = 'none' }}
                    placeholder="Jane Smith" required />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: '#1A1A1A', display: 'block', marginBottom: '6px' }}>Firm / Organization *</label>
                  <input value={form.firm} onChange={e => setForm(f => ({ ...f, firm: e.target.value }))} style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = '#1A1A1A'; e.target.style.boxShadow = '0 0 0 3px rgba(26,26,26,0.07)' }}
                    onBlur={e => { e.target.style.borderColor = '#E5E4E0'; e.target.style.boxShadow = 'none' }}
                    placeholder="Smith & Associates LLP" required />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: '#1A1A1A', display: 'block', marginBottom: '6px' }}>Work Email *</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = '#1A1A1A'; e.target.style.boxShadow = '0 0 0 3px rgba(26,26,26,0.07)' }}
                    onBlur={e => { e.target.style.borderColor = '#E5E4E0'; e.target.style.boxShadow = 'none' }}
                    placeholder="jane@smithlaw.ca" required />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: '#1A1A1A', display: 'block', marginBottom: '6px' }}>Phone</label>
                  <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = '#1A1A1A'; e.target.style.boxShadow = '0 0 0 3px rgba(26,26,26,0.07)' }}
                    onBlur={e => { e.target.style.borderColor = '#E5E4E0'; e.target.style.boxShadow = 'none' }}
                    placeholder="+1 (416) 000-0000" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: '#1A1A1A', display: 'block', marginBottom: '6px' }}>Province / State *</label>
                  <input value={form.jurisdiction} onChange={e => setForm(f => ({ ...f, jurisdiction: e.target.value }))} style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = '#1A1A1A'; e.target.style.boxShadow = '0 0 0 3px rgba(26,26,26,0.07)' }}
                    onBlur={e => { e.target.style.borderColor = '#E5E4E0'; e.target.style.boxShadow = 'none' }}
                    placeholder="Ontario, BC, New York…" required />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: '#1A1A1A', display: 'block', marginBottom: '6px' }}>Approx. IPO clients / year</label>
                  <select value={form.clients} onChange={e => setForm(f => ({ ...f, clients: e.target.value }))} style={{ ...inputStyle, appearance: 'auto' }}
                    onFocus={e => { e.target.style.borderColor = '#1A1A1A'; e.target.style.boxShadow = '0 0 0 3px rgba(26,26,26,0.07)' }}
                    onBlur={e => { e.target.style.borderColor = '#E5E4E0'; e.target.style.boxShadow = 'none' }}>
                    <option value="">Select…</option>
                    <option>1–2</option><option>3–5</option><option>6–10</option><option>10+</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, color: '#1A1A1A', display: 'block', marginBottom: '6px' }}>Anything else we should know?</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3}
                  style={{ ...inputStyle, resize: 'none' }}
                  onFocus={e => { e.target.style.borderColor = '#1A1A1A'; e.target.style.boxShadow = '0 0 0 3px rgba(26,26,26,0.07)' }}
                  onBlur={e => { e.target.style.borderColor = '#E5E4E0'; e.target.style.boxShadow = 'none' }}
                  placeholder="Current clients in the pipeline, specific exchange focus, firm considerations…" />
              </div>
              <p style={{ fontSize: '11.5px', color: '#9A9A9A', lineHeight: 1.6, margin: 0 }}>
                By submitting you confirm you have read the Professional Partner Program Terms & Conditions and, if a lawyer, that participation is consistent with your bar association rules and firm policies.
              </p>
              <button type="submit"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#E8312A', color: '#fff', padding: '14px', borderRadius: '12px', fontWeight: 700, fontSize: '15px', cursor: 'pointer', border: 'none', width: '100%' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#C4261F' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#E8312A' }}>
                Submit Application <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section style={{ background: '#F7F6F4', padding: '5rem 1.5rem', borderTop: '1px solid #E5E4E0' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <h2 style={{ fontWeight: 900, fontSize: '2.25rem', color: '#1A1A1A', marginBottom: '2rem', textAlign: 'center', letterSpacing: '-0.5px' }}>FAQ</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ background: '#FFFFFF', border: '1px solid #E5E4E0', borderRadius: '14px', overflow: 'hidden' }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.125rem 1.25rem', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A', margin: 0, paddingRight: '1rem', lineHeight: 1.4 }}>{faq.q}</p>
                  <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.18 }}>
                    <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: '#9A9A9A' }} />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: 'hidden' }}>
                      <div style={{ padding: '0 1.25rem 1.125rem', borderTop: '1px solid #F7F6F4' }}>
                        <p style={{ fontSize: '13px', color: '#717171', lineHeight: 1.65, margin: '0.75rem 0 0' }}>{faq.a}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA strip ────────────────────────────────────────────────────── */}
      <section style={{ background: '#1A1A1A', padding: '4rem 1.5rem', borderTop: '1px solid #333' }}>
        <div style={{ maxWidth: '580px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontWeight: 900, fontSize: '2rem', color: '#fff', marginBottom: '0.75rem', letterSpacing: '-0.5px' }}>Ready to earn with every referral?</h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.4)', marginBottom: '1.75rem', lineHeight: 1.6 }}>
            Apply in 3 minutes. Approved within 1 business day. Start earning with your first referral.
          </p>
          <a href="#apply"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#E8312A', color: '#fff', padding: '14px 28px', borderRadius: '100px', fontWeight: 700, fontSize: '15px', textDecoration: 'none' }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#C4261F' }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#E8312A' }}>
            Apply Now <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* ── Monthly Partner Update preview ───────────────────────────────── */}
      <section style={{ background: '#FFFFFF', padding: '5rem 1.5rem', borderTop: '1px solid #E5E4E0' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontWeight: 900, fontSize: '2.25rem', color: '#1A1A1A', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>Your Monthly Partner Update</h2>
            <p style={{ fontSize: '15px', color: '#717171', maxWidth: '480px', margin: '0 auto' }}>A preview of your automated monthly email — keeping you informed and your referral pipeline active.</p>
          </div>

          <div style={{ border: '1px solid #E5E4E0', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.06)' }}>
            {/* Email chrome */}
            <div style={{ background: '#F7F6F4', borderBottom: '1px solid #E5E4E0', padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '5px' }}>
                {['#FC5F57','#FDBC2C','#29C940'].map(c => <div key={c} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c }} />)}
              </div>
              <div style={{ flex: 1, background: '#fff', borderRadius: '6px', border: '1px solid #E5E4E0', padding: '4px 12px', fontSize: '11px', color: '#9A9A9A', fontFamily: 'monospace' }}>
                Your IPOReady Referral Update — May 2026 · Sarah Chen
              </div>
            </div>

            <div style={{ background: '#fff', padding: '2rem' }}>
              <div style={{ marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid #F7F6F4', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <p style={{ fontSize: '12px', color: '#9A9A9A', margin: 0 }}><strong style={{ color: '#1A1A1A' }}>From:</strong> IPOReady Partner Team &lt;partners@ipoready.com&gt;</p>
                <p style={{ fontSize: '12px', color: '#9A9A9A', margin: 0 }}><strong style={{ color: '#1A1A1A' }}>To:</strong> Sarah Chen &lt;sarah@chenlaw.ca&gt;</p>
                <p style={{ fontSize: '12px', color: '#9A9A9A', margin: 0 }}><strong style={{ color: '#1A1A1A' }}>Subject:</strong> Your IPOReady Referral Update — May 2026</p>
              </div>

              <p style={{ fontSize: '14px', color: '#1A1A1A', fontWeight: 600, marginBottom: '4px' }}>Hi Sarah,</p>
              <p style={{ fontSize: '13px', color: '#717171', marginBottom: '1.5rem', lineHeight: 1.65 }}>
                Here's your partner update for May 2026. Your focus in <strong style={{ color: '#1A1A1A' }}>Mining + Tech</strong> is well-aligned with the active listing pipeline right now.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '1.5rem' }}>
                {[
                  { label: 'New companies in your network', value: '8',        sub: 'This month' },
                  { label: 'Likely IPO candidates',         value: '3',        sub: 'Estimated' },
                  { label: 'Your earnings this year',       value: 'CA$8,400', sub: '2 converted referrals' },
                ].map(stat => (
                  <div key={stat.label} style={{ background: '#F7F6F4', borderRadius: '12px', padding: '1rem', border: '1px solid #E5E4E0', textAlign: 'center' }}>
                    <p style={{ fontSize: '1.4rem', fontWeight: 900, color: '#E8312A', marginBottom: '2px', lineHeight: 1 }}>{stat.value}</p>
                    <p style={{ fontSize: '11px', fontWeight: 600, color: '#1A1A1A', marginBottom: '2px' }}>{stat.label}</p>
                    <p style={{ fontSize: '10px', color: '#9A9A9A' }}>{stat.sub}</p>
                  </div>
                ))}
              </div>

              <div style={{ background: '#F7F6F4', border: '1px solid #E5E4E0', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '12px', fontWeight: 700, color: '#1A1A1A', marginBottom: '4px' }}>Your Untapped Potential</p>
                <p style={{ fontSize: '12px', color: '#717171', lineHeight: 1.65, margin: 0 }}>
                  You have an estimated <strong>47 professional contacts</strong>. If 8% are IPO candidates, at a CA$4,200 average commission, that's a potential <strong style={{ color: '#E8312A' }}>CA$15,700</strong> in referral income — waiting for a single conversation.
                </p>
              </div>

              <p style={{ fontSize: '12px', fontWeight: 700, color: '#1A1A1A', marginBottom: '10px' }}>How to start the conversation</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.5rem' }}>
                {CONVERSATION_SCRIPTS.map(item => (
                  <div key={item.label} style={{ background: '#F7F6F4', borderRadius: '10px', padding: '0.875rem 1rem', border: '1px solid #E5E4E0' }}>
                    <p style={{ fontSize: '10px', fontWeight: 700, color: '#E8312A', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.label}</p>
                    <p style={{ fontSize: '12px', color: '#717171', lineHeight: 1.6, fontStyle: 'italic', margin: 0 }}>{item.script}</p>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: 'center', paddingTop: '1rem', borderTop: '1px solid #F7F6F4' }}>
                <a href="#apply" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#1A1A1A', color: '#fff', padding: '10px 20px', borderRadius: '100px', fontWeight: 600, fontSize: '13px', textDecoration: 'none' }}>
                  Book a warm referral briefing call <ArrowRight style={{ width: '14px', height: '14px' }} />
                </a>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '1.25rem' }}>
            <span style={{ fontSize: '13px', color: '#717171', fontWeight: 500 }}>Enable Monthly Partner Update Email</span>
            <button onClick={() => setEmailUpdateEnabled(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}>
              {emailUpdateEnabled
                ? <ToggleRight style={{ width: '30px', height: '30px', color: '#1A1A1A' }} />
                : <ToggleLeft style={{ width: '30px', height: '30px', color: '#C0BEB9' }} />}
            </button>
            <span style={{ fontSize: '12px', fontWeight: 600, color: emailUpdateEnabled ? '#2D7A5F' : '#9A9A9A' }}>{emailUpdateEnabled ? 'ON' : 'OFF'}</span>
          </div>
        </div>
      </section>

      {/* ── Reviews ──────────────────────────────────────────────────────── */}
      <section style={{ background: '#F7F6F4', padding: '5rem 1.5rem', borderTop: '1px solid #E5E4E0' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontWeight: 900, fontSize: '2.25rem', color: '#1A1A1A', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>Boost Your Reviews — One Click</h2>
            <p style={{ fontSize: '15px', color: '#717171', maxWidth: '480px', margin: '0 auto' }}>Every review increases your referral credibility and SEO ranking.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '2rem' }}>
            {[
              { letter: 'G',  color: '#4285F4', bg: '#EBF3FD', label: 'Google',    cta: 'Leave a Google Review',    href: '#' },
              { letter: 'G2', color: '#FF4F00', bg: '#FFF0EB', label: 'G2',        cta: 'Review on G2',             href: '#' },
              { letter: 'C',  color: '#3399FF', bg: '#EAF4FF', label: 'Capterra',  cta: 'Review on Capterra',       href: '#' },
              { letter: 'in', color: '#0A66C2', bg: '#E8F3FB', label: 'LinkedIn',  cta: 'Recommend on LinkedIn',    href: '#' },
              { letter: 'tp', color: '#00B67A', bg: '#E6F9F2', label: 'Trustpilot', cta: 'Review on Trustpilot',   href: '#' },
            ].map(p => (
              <a key={p.label} href={p.href} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', borderRadius: '14px', border: '1px solid #E5E4E0', padding: '1rem 1.25rem', textDecoration: 'none', transition: 'box-shadow 0.18s, transform 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: p.bg, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: p.letter.length > 1 ? '10px' : '15px', color: p.color }}>
                  {p.letter}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: '13px', color: '#1A1A1A', margin: '0 0 2px 0' }}>{p.label}</p>
                  <p style={{ fontSize: '12px', color: '#9A9A9A', margin: 0 }}>{p.cta}</p>
                </div>
                <span style={{ fontSize: '12px', color: '#9A9A9A', fontWeight: 600, whiteSpace: 'nowrap' }}>Leave Review →</span>
              </a>
            ))}
          </div>

          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E5E4E0', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <p style={{ fontWeight: 700, fontSize: '13px', color: '#1A1A1A', margin: 0 }}>Pre-written review template you can copy:</p>
              <button onClick={handleCopyReview}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 14px', borderRadius: '100px', background: copied ? '#F0FDF4' : '#F7F6F4', border: `1px solid ${copied ? '#BBF7D0' : '#E5E4E0'}`, color: copied ? '#16A34A' : '#717171', fontWeight: 600, fontSize: '12px', cursor: 'pointer', transition: 'all 0.18s' }}>
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div style={{ background: '#F7F6F4', borderRadius: '10px', padding: '1rem', border: '1px solid #E5E4E0' }}>
              <p style={{ fontSize: '13px', color: '#717171', lineHeight: 1.7, fontStyle: 'italic', margin: 0 }}>
                "IPOReady has been an essential part of our IPO readiness workflow. The platform centralizes every compliance task, filing deadline, and governance requirement in one place — saving our team dozens of hours each month. I'd recommend it to any company preparing for a public listing on TSX, TSXV, or any Canadian or US exchange."
              </p>
            </div>
            <p style={{ fontSize: '11px', color: '#C0BEB9', marginTop: '8px', marginBottom: 0 }}>Feel free to personalize before posting. Authentic reviews perform best.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#1A1A1A', padding: '2rem 1.5rem', textAlign: 'center', borderTop: '1px solid #2A2A2A' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', marginBottom: '0.75rem' }}>
          <span style={{ fontWeight: 800, fontSize: '16px', color: '#fff' }}>IPO<span style={{ color: '#E8312A' }}>Ready</span></span>
        </Link>
        <p style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.25)', lineHeight: 1.7, maxWidth: '680px', margin: '0 auto' }}>
          IPOReady is a technology platform. Participation in the Professional Partner Program does not constitute endorsement of legal, accounting, or securities services.
          All professionals must independently verify that participation complies with their applicable professional conduct rules, bar association regulations, and firm policies.
          Commissions are subject to Program Terms & Conditions.
        </p>
      </footer>

    </div>
  )
}
