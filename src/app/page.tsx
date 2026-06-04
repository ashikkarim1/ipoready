'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Header } from '@/app/components/Header'
import {
  Rocket, CheckSquare, FileText, Users, ShoppingBag, DollarSign,
  PieChart, Banknote, ChevronRight, ChevronDown, Zap, Shield, ArrowRight,
  Building2, BarChart3, CheckCircle2, Globe, Star, TrendingUp,
  RefreshCcw, Layers, LayoutGrid, Mail, ExternalLink, Clock,
  MessageCircle, UserCheck, Calendar, PlayCircle, BookOpen, AlertCircle
} from 'lucide-react'

// ─── Data ─────────────────────────────────────────────────────────────────────

const EXCHANGES = ['TSX', 'TSXV', 'CSE', 'NASDAQ', 'NYSE', 'OTC Markets', 'Cboe Canada']

const PURPOSES = [
  { icon: TrendingUp, label: 'IPO / Direct Listing',  sub: 'TSX, TSXV, CSE, NASDAQ, NYSE',      color: 'var(--color-accent)', bg: 'var(--color-error-soft)' },
  { icon: RefreshCcw, label: 'Reverse Takeover',       sub: 'Shell acquisition & re-listing',     color: 'var(--color-info)', bg: 'var(--color-info-soft)' },
  { icon: Layers,     label: 'SPAC',                   sub: 'Special purpose acquisition',        color: 'var(--color-success)', bg: 'var(--color-success-soft)' },
  { icon: LayoutGrid, label: 'Regulation A+',          sub: 'US mini-IPO for smaller issuers',   color: 'var(--color-warning)', bg: 'var(--color-warning-soft)' },
]

const FEATURES = [
  {
    icon: Zap,
    title: 'PACE™ Velocity Engine',
    description: 'Always know exactly where you stand. Our proprietary score turns task completion into a live listing-date forecast — so you walk into every board meeting and exchange review with complete confidence.',
    accentColor: 'var(--color-accent)',
    accentBg: 'var(--color-error-soft)',
  },
  {
    icon: CheckSquare,
    title: '180+ IPO Milestones, Pre-Built',
    description: 'We\'ve already figured out every step. The most comprehensive IPO task library ever assembled — filtered automatically to your exchange and listing type. You execute; we handled the research.',
    accentColor: 'var(--color-success)',
    accentBg: 'var(--color-success-soft)',
  },
  {
    icon: PieChart,
    title: 'AI-Assisted Cap Table',
    description: 'Stop modelling your share structure in Excel. Fully-diluted scenarios with warrant, option, and convertible note waterfalls — ready before your first underwriter conversation.',
    accentColor: 'var(--color-info)',
    accentBg: 'var(--color-info-soft)',
  },
  {
    icon: Banknote,
    title: 'Capital Raise Tracker',
    description: 'One place for every tranche, investor commitment, and financing condition — from seed round through IPO close. Your CFO always knows where the money stands.',
    accentColor: 'var(--color-warning)',
    accentBg: 'var(--color-warning-soft)',
  },
  {
    icon: FileText,
    title: 'Document Workspace',
    description: 'Every draft prospectus, legal opinion, and governance policy — version-controlled and accessible to the right people. No more emailing PDFs back and forth with your legal team.',
    accentColor: 'var(--color-text-secondary)',
    accentBg: 'var(--color-bg-primary)',
  },
  {
    icon: ShoppingBag,
    title: 'Verified Expert Network',
    description: 'Need a CPAB auditor or securities counsel? Skip the cold calls. Our vetted network of IPO-credentialed professionals is on-platform and ready to engage — filtered by exchange and listing type.',
    accentColor: 'var(--color-success)',
    accentBg: 'var(--color-success-soft)',
  },
  {
    icon: BookOpen,
    title: 'Prospectus Builder',
    description: 'Automatically generate professional IPO prospectuses from source documents with AI assistance and multi-tier professional review workflow — no more manual drafting, faster path to filing.',
    accentColor: 'var(--color-accent-purple)',
    accentBg: 'var(--color-surface-light)',
  },
]

const STATS = [
  { value: '180+', label: 'IPO Milestones',      sub: 'Across all 7 major exchanges' },
  { value: '7',    label: 'Exchanges',           sub: 'TSX · TSXV · CSE · NASDAQ · NYSE · OTC · Cboe' },
  { value: '60%',  label: 'Less Coordination Overhead',  sub: 'vs. unstructured manual processes†' },
  { value: '24h',  label: 'Profile Review',      sub: 'Verified access within one business day' },
]

const TESTIMONIALS = [
  {
    quote: "IPOReady gave us a single place to co-ordinate legal, finance, and IR across the entire CSE listing process. The PACE score kept every workstream accountable — we always knew exactly where we stood.",
    name: 'Ron Shenton',
    role: 'Capital Markets — Sparc AI',
    exchange: 'CSE',
    rating: 5,
    status: 'Listed',
  },
  {
    quote: "As a founder navigating a TSXV listing for the first time, having every milestone, document, and expert in one place has been invaluable. IPOReady keeps the whole team aligned and moving forward.",
    name: 'Doug Lawson',
    role: 'CEO — ThinkIQ',
    exchange: 'TSXV',
    rating: 5,
    status: 'Listing in Progress',
  },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

interface PurposePillProps {
  icon: React.ElementType
  label: string
  sub: string
  color: string
  bg: string
}

function PurposePill({ icon: Icon, label, sub, color, bg }: PurposePillProps) {
  return (
    <div className="card card-hover flex items-center gap-3.5"
      style={{ padding: '1rem 1.25rem' }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: bg }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div>
        <p className="font-semibold text-sm leading-snug" style={{ color: '#1A1A1A' }}>{label}</p>
        <p className="text-xs leading-snug" style={{ color: '#717171', marginTop: '2px' }}>{sub}</p>
      </div>
    </div>
  )
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [currentYear, setCurrentYear] = useState<number | null>(null)

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      router.replace('/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    setCurrentYear(new Date().getFullYear())
  }, [])

  return (
    <div className="min-h-screen" style={{ colorScheme: 'light' }}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <Header />

      <section className="max-w-7xl mx-auto" style={{ paddingTop: '5rem', paddingBottom: '3rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        <div className="grid lg:grid-cols-[1fr_420px] gap-12 xl:gap-16 items-start">

          {/* Left: Copy */}
          <div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
              className="flex items-center gap-2" style={{ marginBottom: '1.5rem' }}>
              <span className="pill text-xs font-bold uppercase tracking-wider"
                style={{ background: 'var(--color-error-soft)', color: 'var(--color-accent)' }}>The IPO Operating System</span>
              <span className="text-text-muted text-sm">Canadian & US listings</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.06 }}
              className="serif"
              style={{ fontSize: '2.1rem', lineHeight: '1.2', marginBottom: '1.25rem', color: '#1A1A1A' }}>
              Manage your entire IPO journey<br />
              <span style={{ color: 'var(--color-accent)' }}>from first resolution to the bell—and beyond.</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.12 }}
              className="space-y-3" style={{ marginBottom: '2rem' }}>
              <p className="text-lg leading-relaxed" style={{ color: '#717171' }}>
                Tell us your exchange and listing type — IPOReady instantly builds your personalized 180+ task roadmap, assigns workstreams to your team, and tracks your velocity toward listing day. No setup. No spreadsheets. No missed steps.
              </p>
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 mt-0.5" style={{ color: 'var(--color-accent)' }} />
                  <p className="text-sm leading-relaxed" style={{ color: '#717171' }}>180+ pre-built tasks across all exchanges</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 mt-0.5" style={{ color: 'var(--color-accent)' }} />
                  <p className="text-sm leading-relaxed" style={{ color: '#717171' }}>PACE™ Score predicts your listing date in real-time</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 mt-0.5" style={{ color: 'var(--color-accent)' }} />
                  <p className="text-sm leading-relaxed" style={{ color: '#717171' }}>Coordinate your entire team and expert network</p>
                </div>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.16 }}
              className="text-sm leading-relaxed" style={{ marginBottom: '2rem', color: '#717171' }}>
              Works for IPO, RTO, SPAC, and Reg A+ across every major exchange.{' '}
              <Link href="/register" className="text-accent font-semibold hover:underline">
                Get your personalized checklist in 5 minutes →
              </Link>
            </motion.p>

            {/* Purpose pills */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.2 }}
              className="grid grid-cols-2 gap-3" style={{ marginBottom: '2rem' }}>
              {PURPOSES.map(p => <PurposePill key={p.label} icon={p.icon} label={p.label} sub={p.sub} color={p.color} bg={p.bg} />)}
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }}
              className="flex flex-wrap items-center gap-3">
              <Link href="/register"
                className="btn btn-primary gap-2 font-semibold px-6 py-2.5 rounded-full">
                Start your IPO journey <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/pricing" className="btn btn-secondary px-6 py-2.5 rounded-full">
                View pricing
              </Link>
              <a href="https://auditus.ai" target="_blank"
                className="btn btn-ghost px-4 py-2.5 text-sm">
                Pre-audit readiness →
              </a>
            </motion.div>
          </div>

          {/* Right: Dashboard preview */}
          <motion.div
            initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.18 }}
            className="hidden lg:block">
            <div className="card" style={{ padding: '1.5rem', boxShadow: '0 24px 64px rgba(0,0,0,0.09)', overflow: 'hidden' }}>
              {/* Card header */}
              <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#717171' }}>IPO Dashboard</p>
                  <p className="font-bold" style={{ color: '#1A1A1A', marginTop: '0.125rem' }}>Meridian Resources Inc.</p>
                </div>
                <span className="pill text-xs font-bold" style={{ background: '#FDECEB', color: '#E8312A' }}>TSX</span>
              </div>

              {/* PACE Score */}
              <div className="rounded-xl p-4" style={{ background: 'var(--color-bg-primary)', border: '1px solid #E5E4E0', marginBottom: '1rem' }}>
                <div className="flex items-center justify-between" style={{ marginBottom: '0.625rem' }}>
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" style={{ color: 'var(--color-accent)' }} />
                    <span className="text-xs font-semibold" style={{ color: '#666666' }}>PACE™ Score</span>
                  </div>
                  <span className="font-black text-2xl" style={{ color: '#FFFFFF' }}>72</span>
                </div>
                <div className="rounded-full overflow-hidden" style={{ height: '6px', background: 'var(--color-border)' }}>
                  <div className="h-full rounded-full" style={{ width: '72%', background: 'var(--color-accent)' }} />
                </div>
                <p className="text-xs" style={{ marginTop: '0.5rem', color: '#666666' }}>~118 days to listing</p>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 gap-3" style={{ marginBottom: '1.25rem' }}>
                <div className="rounded-xl p-3 text-center" style={{ background: 'var(--color-bg-primary)', border: '1px solid #E5E4E0' }}>
                  <p className="serif text-2xl font-bold" style={{ color: '#FFFFFF' }}>38</p>
                  <p className="text-xs" style={{ color: '#666666' }}>of 180 tasks done</p>
                </div>
                <div className="rounded-xl p-3 text-center" style={{ background: 'var(--color-bg-primary)', border: '1px solid #E5E4E0' }}>
                  <p className="serif text-2xl font-bold" style={{ color: '#FFFFFF' }}>Pre</p>
                  <p className="text-xs" style={{ color: '#666666' }}>Filing phase</p>
                </div>
              </div>

              {/* Upcoming tasks */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ marginBottom: '0.75rem', color: '#717171' }}>
                  Upcoming Tasks
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    { done: true,  label: 'Board resolution drafted' },
                    { done: false, label: 'Auditor selection complete' },
                    { done: false, label: 'Legal opinion requested' },
                    { done: false, label: 'Transfer agent appointed' },
                  ].map(task => (
                    <div key={task.label} className="flex items-center gap-2.5">
                      <div className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
                        style={task.done
                          ? { background: '#2D7A5F' }
                          : { border: '2px solid #E5E4E0' }}>
                        {task.done && <CheckCircle2 className="w-3 h-3" style={{ color: '#FFFFFF' }} />}
                      </div>
                      <p className="text-sm" style={{ color: task.done ? '#666666' : '#1A1A1A',
                        textDecoration: task.done ? 'line-through' : 'none' }}>
                        {task.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Exchanges strip ──────────────────────────────────────────────────── */}
      <section style={{ background: 'var(--color-surface-primary)', borderTop: '1px solid #E5E4E0', borderBottom: '1px solid #E5E4E0' }}>
        <div className="max-w-7xl mx-auto flex items-center gap-3 flex-wrap" style={{ paddingTop: '1.25rem', paddingBottom: '1.25rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
          <span className="text-xs font-semibold uppercase tracking-wider mr-2" style={{ color: '#555555' }}>Supported exchanges</span>
          {EXCHANGES.map(ex => (
            <span key={ex} className="pill text-xs font-semibold"
              style={{ background: 'var(--color-bg-primary)', color: 'var(--color-text-secondary)', border: '1px solid #E5E4E0' }}>
              {ex}
            </span>
          ))}
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto" style={{ paddingTop: '2.5rem', paddingBottom: '2rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        {/* Header */}
        <div className="text-center" style={{ marginBottom: '2rem' }}>
          <div className="text-xs uppercase tracking-widest text-text-muted font-semibold" style={{ marginBottom: '0.75rem' }}>How it works</div>
          <h2 className="serif text-3xl md:text-4xl text-nav leading-tight" style={{ marginBottom: '0.75rem' }}>
            Up and running in under 5 minutes
          </h2>
          <p className="text-text-muted" style={{ maxWidth: '500px', margin: '0 auto', lineHeight: '1.65' }}>
            No implementation project. No consultant to onboard. No spreadsheet to build.<br />
            Just answer four questions — and your entire IPO roadmap is ready.
          </p>
        </div>

        {/* Steps */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', position: 'relative' }}>
          {[
            {
              step: '01',
              icon: PlayCircle,
              color: 'var(--color-accent)',
              bg: 'var(--color-error-soft)',
              title: 'Tell us your listing',
              body: 'Enter your company name, target exchange, listing type, and estimated target date. Four questions. That\'s it.',
              detail: 'Takes 2 minutes',
              detailIcon: Clock,
            },
            {
              step: '02',
              icon: CheckSquare,
              color: 'var(--color-success)',
              bg: 'var(--color-success-soft)',
              title: 'Get your personalized roadmap',
              body: 'We instantly generate your full checklist — 180+ tasks filtered to your exact exchange and listing path. Every step explained, every deadline flagged.',
              detail: 'Personalized to your exchange',
              detailIcon: Globe,
            },
            {
              step: '03',
              icon: Users,
              color: 'var(--color-info)',
              bg: 'var(--color-info-soft)',
              title: 'Execute as one team',
              body: 'Assign workstreams to your legal, finance, and governance advisors. Your PACE™ score tracks velocity in real time — so everyone knows exactly where you stand.',
              detail: 'PACE™ score updates live',
              detailIcon: Zap,
            },
          ].map(({ step, icon: Icon, color, bg, title, body, detail, detailIcon: DetailIcon }, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.45 }}
              className="card"
              style={{ padding: '2rem', position: 'relative', overflow: 'hidden' }}>

              {/* Step number watermark */}
              <div style={{
                position: 'absolute', top: '-8px', right: '16px',
                fontSize: '5rem', fontWeight: 900, lineHeight: 1,
                color: 'var(--color-surface-secondary)', userSelect: 'none', fontFamily: 'Georgia, serif',
              }}>{step}</div>

              {/* Icon */}
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: bg, marginBottom: '1.25rem', position: 'relative' }}>
                <Icon className="w-6 h-6" style={{ color }} />
              </div>

              <h3 className="font-bold text-nav" style={{ fontSize: '1.05rem', marginBottom: '0.75rem', lineHeight: '1.3' }}>
                {title}
              </h3>
              <p className="text-text-muted text-sm leading-relaxed" style={{ marginBottom: '1.25rem' }}>
                {body}
              </p>

              {/* Detail badge */}
              <div className="flex items-center gap-1.5 text-xs font-semibold"
                style={{ color }}>
                <DetailIcon className="w-3.5 h-3.5" />
                {detail}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom connector */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ delay: 0.35 }}
          className="text-center"
          style={{ marginTop: '1.75rem' }}>
          <div className="flex flex-wrap items-center justify-center gap-4 px-6 py-4 rounded-2xl w-full"
            style={{ background: 'var(--color-surface-primary)', border: '1px solid #E5E4E0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            {[
              { icon: UserCheck, text: 'No credit card to start' },
              { icon: Clock,     text: 'Ready in under 5 minutes' },
              { icon: MessageCircle, text: 'WhatsApp AI Companion included on Growth+' },
              { icon: Shield,    text: 'SOC 2-ready infrastructure' },
            ].map(({ icon: I, text }) => (
              <div key={text} className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                <I className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-text-primary)' }} />
                {text}
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Stats ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto" style={{ paddingTop: '1.75rem', paddingBottom: '2rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.06 }}
              className="card p-6">
              <p className="serif text-3xl md:text-4xl mb-1" style={{ color: '#1A1A1A' }}>{s.value}</p>
              <p className="font-semibold text-sm mb-0.5" style={{ color: '#1A1A1A' }}>{s.label}</p>
              <p className="text-xs leading-relaxed" style={{ color: '#717171' }}>{s.sub}</p>
            </motion.div>
          ))}
        </div>
          <p className="text-xs" style={{ color: 'var(--color-text-tertiary)', marginTop: '1.5rem' }}>
            † Based on typical IPO coordination overhead reduction for companies using structured workflow management vs. manual email/spreadsheet coordination. Individual results vary.
          </p>
      </section>

      {/* ── Before / After ───────────────────────────────────────────────────── */}
      <section style={{ background: 'var(--color-surface-primary)', borderTop: '1px solid #E5E4E0', borderBottom: '1px solid #E5E4E0' }}>
        <div className="max-w-7xl mx-auto" style={{ paddingTop: '2.5rem', paddingBottom: '2.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
          <div className="text-xs uppercase tracking-widest text-text-muted font-semibold text-center" style={{ marginBottom: '2.5rem' }}>
            The difference IPOReady makes
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Without */}
            <div className="rounded-2xl p-7" style={{ background: 'var(--color-bg-primary)', border: '1px solid #E5E4E0' }}>
              <div className="flex items-center gap-2" style={{ marginBottom: '1.5rem' }}>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'var(--color-border)' }} />
                <p className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>Without IPOReady</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {[
                  'Hundreds of tasks tracked across disconnected spreadsheets',
                  'Advisors asking "what\'s the status?" instead of executing',
                  'Missed deadlines nobody owned because nobody tracked them',
                  'Board meetings with no clear picture of where you actually stand',
                  'Scramble at exchange review to prove readiness',
                  '58% of 2022 IPOs disclosed a material weakness in their initial filing†',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: 'var(--color-error-pale)', border: '1px solid #FECACA' }}>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-accent)' }} />
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* With */}
            <div className="rounded-2xl p-7" style={{ background: '#FFFFFF', border: '1px solid #E5E4E0' }}>
              <div className="flex items-center gap-2" style={{ marginBottom: '1.5rem' }}>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'var(--color-accent)' }} />
                <p className="text-sm font-bold uppercase tracking-wider" style={{ color: '#1A1A1A' }}>With IPOReady</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {[
                  'Your full 180+ task roadmap built and filtered in 5 minutes',
                  'Every workstream assigned, every owner accountable, one dashboard',
                  'PACE™ score shows your exact velocity toward your listing window',
                  'Board updates generated from live task data — not guesswork',
                  'Walk into exchange review with documented, timestamped readiness',
                  'Your advisors spend time executing — not coordinating',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: 'rgba(45,122,95,0.3)', border: '1px solid rgba(45,122,95,0.5)' }}>
                      <CheckCircle2 className="w-3 h-3" style={{ color: 'var(--color-success-bright)' }} />
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: '#333333' }}>{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="text-xs" style={{ color: 'var(--color-text-tertiary)', marginTop: '1.25rem' }}>
            † Source: KPMG IPO Study, 2022. Every one of those weaknesses was fixable pre-fieldwork.
          </p>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────────── */}
      <section id="features" className="max-w-7xl mx-auto" style={{ paddingTop: '2.5rem', paddingBottom: '2.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <div className="text-xs uppercase tracking-widest" style={{ marginBottom: '1rem', color: '#717171' }}>Platform</div>
          <h2 className="serif text-3xl md:text-4xl leading-tight" style={{ marginBottom: '0.875rem', color: '#1A1A1A', maxWidth: 'none' }}>
            We built the hard parts so you don&rsquo;t have to.
          </h2>
          <p style={{ maxWidth: '540px', lineHeight: '1.65', color: '#717171' }}>
            Every tool your deal team needs — purpose-built for listings, connected together, ready to use on day one.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => {
            const Icon = f.icon
            return (
              <motion.div key={f.title}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="card p-6 card-hover">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: f.accentBg }}>
                  <Icon className="w-5 h-5" style={{ color: f.accentColor }} />
                </div>
                <h3 className="font-semibold mb-3" style={{ color: '#1A1A1A' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#717171' }}>{f.description}</p>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* ── Integrated Filing (Downplayed) ────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto" style={{ paddingTop: '2rem', paddingBottom: '2rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        <div className="card p-6 md:p-8" style={{ background: '#FAFAF8', borderColor: '#E5E4E0', border: '1px solid #E5E4E0' }}>
          <div className="max-w-3xl">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-error-soft)' }}>
                <FileText className="w-6 h-6" style={{ color: 'var(--color-accent)' }} />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2" style={{ color: '#1A1A1A' }}>Regulatory Filing, Built In</h3>
                <p style={{ color: '#717171', lineHeight: '1.6' }}>
                  Once your company is ready, submit documents directly to SEDAR 2, SEC Edgar, and other regulators from within IPOReady — with integrated validation and real-time status tracking. No switching between platforms, no manual data entry.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Customer Ratings ────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto" style={{ paddingTop: '2.5rem', paddingBottom: '2rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        {/* Header */}
        <div className="text-center" style={{ marginBottom: '3rem' }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest"
            style={{ background: 'var(--color-warning-soft)', color: 'var(--color-warning)', border: '1px solid #FDE68A', marginBottom: '1rem' }}>
            <Star className="w-3 h-3" style={{ fill: 'var(--color-warning)' }} />
            Verified Customer Reviews
          </div>
          <h2 className="serif text-3xl md:text-4xl text-nav leading-tight" style={{ marginBottom: '0.75rem' }}>
            Trusted by founders on their way to listing
          </h2>
          <p className="text-text-muted text-sm" style={{ maxWidth: '460px', margin: '0 auto' }}>
            From first milestone to exchange approval — real feedback from real issuers.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6" style={{ maxWidth: '860px', margin: '0 auto' }}>
          {TESTIMONIALS.map((t) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="card"
              style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              {/* Stars */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4"
                    style={{ fill: i < t.rating ? 'var(--color-warning-dark)' : 'var(--color-border)', color: i < t.rating ? 'var(--color-warning-dark)' : 'var(--color-border)' }} />
                ))}
                <span className="text-xs font-semibold" style={{ color: 'var(--color-warning)', marginLeft: '6px' }}>
                  {t.rating}.0 / 5.0
                </span>
              </div>

              {/* Quote */}
              <blockquote className="text-nav text-sm leading-relaxed" style={{ fontStyle: 'italic', flex: 1 }}>
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              {/* Attribution */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #E5E4E0', paddingTop: '1rem' }}>
                <div>
                  <p className="font-semibold text-nav text-sm">{t.name}</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-tertiary)', marginTop: '2px' }}>{t.role}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: t.exchange === 'CSE' ? 'var(--color-info-soft)' : 'var(--color-success-soft)',
                      color: t.exchange === 'CSE' ? 'var(--color-info)' : 'var(--color-success)',
                    }}>
                    {t.exchange}
                  </span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{
                      background: t.status === 'Listed' ? 'var(--color-success-soft)' : 'var(--color-warning-soft)',
                      color: t.status === 'Listed' ? 'var(--color-success)' : 'var(--color-warning)',
                    }}>
                    {t.status === 'Listed' ? '✓ Listed' : '⟳ Listing in Progress'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Overall rating bar */}
        <div className="text-center" style={{ marginTop: '2.5rem' }}>
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl"
            style={{ background: 'var(--color-surface-primary)', border: '1px solid #E5E4E0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', gap: '2px' }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-5 h-5" style={{ fill: 'var(--color-warning-dark)', color: 'var(--color-warning-dark)' }} />
              ))}
            </div>
            <span className="font-bold text-nav text-lg">5.0</span>
            <span className="text-text-muted text-sm">from our first customers</span>
          </div>
        </div>
      </section>

      {/* ── FAQ Section ────────────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto" style={{ paddingTop: '2.5rem', paddingBottom: '2.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        <div className="text-center" style={{ marginBottom: '2.5rem' }}>
          <div className="text-xs uppercase tracking-widest text-text-muted font-semibold" style={{ marginBottom: '0.75rem' }}>Frequently Asked</div>
          <h2 className="serif text-3xl md:text-4xl text-nav leading-tight" style={{ marginBottom: '0.75rem' }}>
            Filing Questions
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            {
              q: 'What countries do you support?',
              a: 'We currently support 50+ countries with live adapters for SEDAR 2 (Canada) and SEC Edgar (US). Additional regulators are added based on demand — contact our team to request new jurisdictions.',
            },
            {
              q: 'Can I file on multiple exchanges at once?',
              a: 'Yes. Upload your documents once, and our system automatically adapts them to each regulator\'s requirements — handling format differences, disclosure variations, and language requirements automatically.',
            },
            {
              q: 'What if a filing gets rejected?',
              a: 'Our pre-submission validation catches 95% of common rejection causes before submission. If a regulator rejects your filing, our team analyzes the comments and guides you through corrections — your entire revision history is maintained for compliance.',
            },
            {
              q: 'How do you handle regulatory changes?',
              a: 'We monitor regulatory updates quarterly and push changes automatically to all active users. Your compliance framework is always current, and we notify you of any filing requirement changes that affect your submission.',
            },
          ].map(({ q, a }, i) => (
            <motion.div key={q}
              initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.06 }}
              className="card p-6"
              style={{ background: '#FFFFFF', borderColor: '#E5E4E0' }}>
              <h3 className="font-semibold mb-2" style={{ color: '#1A1A1A', fontSize: '1rem' }}>{q}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#717171' }}>{a}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA banner ──────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto" style={{ paddingTop: '2rem', paddingBottom: '2rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        <div className="card p-10 md:p-14 text-center" style={{ background: '#FFFFFF', borderColor: '#E5E4E0', border: '1px solid #E5E4E0' }}>
          <div className="text-xs uppercase tracking-widest font-semibold" style={{ color: '#717171', marginBottom: '1.25rem' }}>
            Get started today
          </div>
          <h2 className="serif text-3xl md:text-4xl leading-tight" style={{ marginBottom: '1.25rem', color: '#1A1A1A' }}>
            Your personalized IPO roadmap,<br /><span style={{ color: '#E8312A' }}>ready in 5 minutes.</span>
          </h2>
          <p className="text-sm leading-relaxed max-w-xl mx-auto" style={{ color: '#555555', marginBottom: '1.25rem' }}>
            Tell us your exchange and listing type. We hand you a 180+ task roadmap, pre-filtered to your path, with every workstream ready to assign to your team.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: '#717171', marginBottom: '2.5rem' }}>
            No credit card. No onboarding call. No spreadsheet to build.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/register"
              className="px-7 py-3 rounded-full font-semibold text-sm text-nav bg-white hover:bg-bg transition-colors inline-flex items-center gap-2">
              Create free account <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/pricing"
              className="px-7 py-3 rounded-full font-semibold text-sm transition-colors inline-flex items-center gap-2"
              style={{ color: 'white', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              View pricing
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer style={{ background: 'var(--color-surface-primary)', borderTop: '1px solid #E5E4E0' }}>

        {/* Main grid */}
        <div className="max-w-7xl mx-auto" style={{ paddingTop: '2.5rem', paddingBottom: '2rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-4" style={{ minWidth: 0 }}>

            {/* Brand column */}
            <div>
              <Link href="/" className="flex items-center gap-2.5" style={{ marginBottom: '1rem' }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-text-primary)' }}>
                  <Rocket className="w-4 h-4 text-white" />
                </div>
                <span className="font-display font-bold text-lg text-nav">
                  IPO<span style={{ color: 'var(--color-accent)' }}>Ready</span>
                </span>
              </Link>
              <p className="text-text-muted text-sm leading-relaxed" style={{ marginBottom: '0.875rem', maxWidth: '260px' }}>
                The world's first central hub for IPO readiness workflow management — from first board resolution to exchange approval.
              </p>
              {/* Social */}
              <div className="flex items-center gap-2" style={{ marginBottom: '0.875rem' }}>
                {/* LinkedIn */}
                <a href="https://linkedin.com/company/ipoready" target="_blank" rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                  style={{ background: 'var(--color-bg-primary)', border: '1px solid #E5E4E0', color: 'var(--color-text-tertiary)' }}>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
                </a>
                {/* X / Twitter */}
                <a href="https://twitter.com/ipoready" target="_blank" rel="noopener noreferrer"
                  aria-label="Twitter / X"
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                  style={{ background: 'var(--color-bg-primary)', border: '1px solid #E5E4E0', color: 'var(--color-text-tertiary)' }}>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.733-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg>
                </a>
                {/* Email */}
                <a href="mailto:hello@ipoready.com"
                  aria-label="Email"
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                  style={{ background: 'var(--color-bg-primary)', border: '1px solid #E5E4E0', color: 'var(--color-text-tertiary)' }}>
                  <Mail className="w-3.5 h-3.5" />
                </a>
              </div>
              {/* auditus.ai */}
              <a href="https://auditus.ai" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
                style={{ color: 'var(--color-text-secondary)' }}>
                <Zap className="w-3 h-3" />
                Powered by auditus.ai
                <ExternalLink className="w-3 h-3 opacity-50" />
              </a>
            </div>

            {/* Product */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-nav" style={{ marginBottom: '0.75rem' }}>Product</p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {[
                  { label: 'IPO Checklist',     href: '/checklist' },
                  { label: 'Cap Table',          href: '/cap-table' },
                  { label: 'Raising Capital',    href: '/raising-capital' },
                  { label: 'Document Workspace', href: '/documents' },
                  { label: 'Expert Network',     href: '/marketplace' },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href}
                      className="text-sm text-text-muted transition-colors hover:text-nav">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: '1rem' }}>
                <p className="text-xs font-bold uppercase tracking-widest text-nav" style={{ marginBottom: '0.75rem' }}>Company</p>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {[
                    { label: 'Pricing',      href: '/pricing' },
                    { label: 'Referral Program', href: '/referrals' },
                    { label: 'Account',      href: '/account' },
                    { label: 'Get Started',  href: '/register' },
                  ].map(({ label, href }) => (
                    <li key={label}>
                      <Link href={href}
                        className="text-sm text-text-muted transition-colors hover:text-nav">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Exchanges & Listing Types */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-nav" style={{ marginBottom: '0.75rem' }}>Exchanges</p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {['TSX', 'TSXV', 'CSE', 'NASDAQ', 'NYSE', 'OTC Markets'].map(ex => (
                  <li key={ex}>
                    <span className="text-sm text-text-muted">{ex}</span>
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: '1rem' }}>
                <p className="text-xs font-bold uppercase tracking-widest text-nav" style={{ marginBottom: '0.75rem' }}>Listing Types</p>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {['IPO', 'Direct Listing', 'RTO', 'SPAC'].map(t => (
                    <li key={t}><span className="text-sm text-text-muted">{t}</span></li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Legal & Support */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-nav" style={{ marginBottom: '0.75rem' }}>Legal</p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {[
                  { label: 'Privacy Policy',   href: '/privacy' },
                  { label: 'Terms of Service', href: '/terms' },
                  { label: 'Disclaimer',       href: '/disclaimer' },
                  { label: 'Cookie Policy',    href: '/cookies' },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href}
                      className="text-sm text-text-muted transition-colors hover:text-nav">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: '1rem' }}>
                <p className="text-xs font-bold uppercase tracking-widest text-nav" style={{ marginBottom: '0.75rem' }}>Support</p>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {[
                    { label: 'Contact Us',    href: 'mailto:hello@ipoready.com' },
                    { label: 'Help Centre',   href: '/help' },
                    { label: 'System Status', href: '/status' },
                  ].map(({ label, href }) => (
                    <li key={label}>
                      <a href={href}
                        className="text-sm text-text-muted transition-colors hover:text-nav">
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
        <div style={{ borderTop: '1px solid #E5E4E0', background: 'var(--color-bg-primary)' }}>
          <div className="max-w-7xl mx-auto" style={{ paddingTop: '1.25rem', paddingBottom: '1.25rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <p className="text-xs leading-relaxed flex-1 min-w-0" style={{ color: '#555555' }}>
                <span className="font-semibold" style={{ color: '#333333' }}>Important:</span>{' '}
                IPOReady is a workflow management and project tracking platform only. It does not provide legal, compliance, accounting, securities, or investment banking services, and does not act on your behalf in any regulatory or professional capacity.
                All regulatory filings, legal opinions, and compliance determinations must be executed by licensed professionals. Nothing on this platform constitutes legal advice, financial advice, or an offer to buy or sell securities.
              </p>
              <div className="flex items-center gap-4 flex-shrink-0 self-end md:self-auto">
                <p className="text-xs" style={{ color: '#555555' }}>© {currentYear || 2026} IPOReady. All rights reserved.</p>
                <div className="flex items-center gap-1 p-0.5 rounded-lg" style={{ background: 'var(--color-border-medium)', border: '1px solid #E5E4E0' }}>
                  {(['EN', 'FR'] as const).map(l => (
                    <span key={l} className="text-xs px-2 py-0.5 rounded font-mono font-medium cursor-default"
                      style={{ color: 'var(--color-text-tertiary)' }}>{l}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
