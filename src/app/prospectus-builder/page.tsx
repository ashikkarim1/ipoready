'use client'

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, BookOpen, Sparkles, Lock, RefreshCcw, Upload, Eye, BarChart3, FileText, Users, Mail, Zap, ExternalLink, Rocket } from 'lucide-react'
import { Header } from '@/app/components/Header'
import { ScheduleDemoModal } from '@/app/components/ScheduleDemoModal'

const CAPABILITIES = [
  {
    icon: Upload,
    title: 'Multi-Format Import',
    description: 'Upload prospectuses, financial documents, or business plans in PDF, DOCX, or TXT. AI extracts and organizes content automatically.',
    color: '#1D4ED8',
    bg: '#EFF6FF',
  },
  {
    icon: Sparkles,
    title: 'AI-Assisted Generation',
    description: 'Structures documents into proper sections, fills gaps with intelligent recommendations, and maintains regulatory compliance for your target exchange.',
    color: '#E8312A',
    bg: '#FDECEB',
  },
  {
    icon: Eye,
    title: 'Multi-Tier Review Workflow',
    description: 'Route through internal, legal, and underwriter review — tracked, versioned, and commented in-platform with no email chains.',
    color: '#2D7A5F',
    bg: '#EAF5F0',
  },
  {
    icon: Lock,
    title: 'Compliance-First Design',
    description: 'Generated prospectuses follow TSX, TSXV, CSE, NASDAQ, and NYSE formatting and disclosure requirements.',
    color: '#B45309',
    bg: '#FEF3C7',
  },
  {
    icon: RefreshCcw,
    title: 'Version Control & Collaboration',
    description: 'Track every edit, see who made changes, revert to prior versions instantly, and maintain a complete audit trail for regulatory submissions.',
    color: '#E8312A',
    bg: '#FDECEB',
  },
  {
    icon: BarChart3,
    title: 'Export to Any Format',
    description: 'Generate final prospectuses as PDF, DOCX, or ZIP packages ready for underwriter and regulatory review.',
    color: '#059669',
    bg: '#ECFDF5',
  },
]

const BENEFITS = [
  {
    metric: '70%',
    label: 'Faster Drafting',
    sub: 'vs. manual prospectus preparation',
  },
  {
    metric: '50%',
    label: 'Fewer Review Rounds',
    sub: 'Pre-compliance checks catch issues early',
  },
  {
    metric: '100%',
    label: 'Audit Trail',
    sub: 'Complete version history for compliance',
  },
  {
    metric: '7',
    label: 'Exchanges Supported',
    sub: 'TSX, TSXV, CSE, NASDAQ, NYSE, OTC & more',
  },
]

const WORKFLOW_STEPS = [
  {
    step: 1,
    title: 'Upload Source Documents',
    description: 'Import your existing prospectuses, business plans, or financial documents in any format.',
    icon: Upload,
  },
  {
    step: 2,
    title: 'AI Extracts & Organizes',
    description: 'Our system automatically parses content and structures it into proper regulatory sections.',
    icon: Sparkles,
  },
  {
    step: 3,
    title: 'Multi-Tier Review',
    description: 'Send for internal review, legal counsel feedback, and underwriter comments — all tracked in-platform.',
    icon: Users,
  },
  {
    step: 4,
    title: 'Export & File',
    description: 'Generate final PDF/DOCX prospectus ready for regulatory submission.',
    icon: FileText,
  },
]

export default function ProspectusBuilderPage() {
  const [demoModalOpen, setDemoModalOpen] = useState(false)

  return (
    <div suppressHydrationWarning>
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <Header />

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <section style={{ paddingTop: '2rem', paddingBottom: '1rem', background: '#F7F6F4' }}>
        <div className="max-w-7xl mx-auto" style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
          <h1 className="serif text-2xl sm:text-3xl text-nav mb-2">Prospectus Builder</h1>
          <p className="text-text-muted text-sm">Upload documents. AI organizes and structures them with compliance built-in. Route through multi-tier review — all in one platform.</p>
        </div>
      </section>

      {/* ── CTA Bar ─────────────────────────────────────────────────────────── */}
      <section style={{ paddingTop: '1rem', paddingBottom: '1rem', background: '#FFFFFF', borderBottom: '1px solid #E5E4E0' }}>
        <div className="max-w-7xl mx-auto flex flex-wrap gap-3" style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
          <Link href="/register"
            className="btn btn-primary gap-2 font-semibold px-6 py-2.5 rounded-full">
            Start Building <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/resources" className="btn btn-secondary px-6 py-2.5 rounded-full">
            Learn More
          </Link>
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────────────────────────────── */}
      <section style={{ paddingTop: '1rem', paddingBottom: '1.5rem', background: '#FFFFFF' }}>
        <div className="max-w-7xl mx-auto" style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {BENEFITS.map((s, i) => (
              <motion.div key={s.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="card p-4">
                <p className="serif text-2xl text-nav mb-1">{s.metric}</p>
                <p className="font-semibold text-xs text-nav mb-0.5">{s.label}</p>
                <p className="text-text-muted text-xs leading-relaxed">{s.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto" style={{ paddingTop: '1.5rem', paddingBottom: '1.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        <h2 className="serif text-2xl sm:text-3xl text-nav mb-2">4 steps to completion</h2>
        <p className="text-text-muted text-sm mb-6">Here's how to take your documents from source material to filing-ready prospectus.</p>

        <div className="grid md:grid-cols-4 gap-4">
          {WORKFLOW_STEPS.map((item, idx) => {
            const Icon = item.icon
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.06 }}
                className="card p-6 card-hover">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5" style={{ background: '#FDECEB' }}>
                  <span className="font-black text-lg text-nav">{item.step}</span>
                </div>
                <Icon className="w-5 h-5 mb-4" style={{ color: '#E8312A' }} />
                <h3 className="font-semibold text-nav mb-2">{item.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{item.description}</p>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* ── Capabilities ────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto" style={{ paddingTop: '1.5rem', paddingBottom: '1.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        <h2 className="serif text-2xl sm:text-3xl text-nav mb-2">Everything you need for compliance-ready prospectuses.</h2>
        <p className="text-text-muted text-sm mb-8">Purpose-built capabilities for drafting, review, and filing across all major exchanges.</p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {CAPABILITIES.map((cap, idx) => {
            const Icon = cap.icon
            return (
              <motion.div
                key={cap.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.06 }}
                className="card p-6 card-hover">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5" style={{ background: cap.bg }}>
                  <Icon className="w-5 h-5" style={{ color: cap.color }} />
                </div>
                <h3 className="font-semibold text-nav mb-3">{cap.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{cap.description}</p>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* ── Exchanges ───────────────────────────────────────────────────────── */}
      <section style={{ background: '#FFFFFF', borderTop: '1px solid #E5E4E0' }}>
        <div className="max-w-7xl mx-auto" style={{ paddingTop: '2.5rem', paddingBottom: '2.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
          <div className="text-xs uppercase tracking-widest text-text-muted font-semibold text-center" style={{ marginBottom: '1.5rem' }}>
            Supported Exchanges
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {['TSX', 'TSXV', 'CSE', 'NASDAQ', 'NYSE', 'OTC Markets', 'Cboe Canada'].map((exchange) => (
              <span key={exchange} className="pill px-4 py-2 text-sm font-semibold" style={{ background: '#F7F6F4', color: '#1A1A1A' }}>
                {exchange}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto" style={{ paddingTop: '2.5rem', paddingBottom: '2.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="card p-8 lg:p-12 text-center"
          style={{ background: '#FDECEB', border: '1px solid #F5E5E1' }}
        >
          <h2 className="serif text-2xl sm:text-3xl text-nav mb-4 leading-tight">
            Build prospectuses faster.
          </h2>
          <p className="text-text-muted text-sm mb-8 max-w-2xl mx-auto" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
            Streamline drafting, review, and compliance with AI-powered prospectus builder.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/register" className="btn btn-primary gap-2 font-semibold px-6 py-2.5 rounded-full">
              Start Building <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => setDemoModalOpen(true)}
              className="btn btn-secondary px-6 py-2.5 rounded-full"
            >
              Schedule Demo
            </button>
          </div>
        </motion.div>
      </section>

      {/* Demo Modal */}
      <ScheduleDemoModal isOpen={demoModalOpen} onClose={() => setDemoModalOpen(false)} />

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer style={{ background: '#FFFFFF', borderTop: '1px solid #E5E4E0' }}>

        {/* Main grid */}
        <div className="max-w-7xl mx-auto" style={{ paddingTop: '2.5rem', paddingBottom: '2rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
          <div className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-8">

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
              <p className="text-text-muted text-sm leading-relaxed" style={{ marginBottom: '1.25rem', maxWidth: '260px' }}>
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
                className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
                style={{ color: '#717171' }}>
                <Zap className="w-3 h-3" />
                Powered by auditus.ai
                <ExternalLink className="w-3 h-3 opacity-50" />
              </a>
            </div>

            {/* Product */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-nav" style={{ marginBottom: '1rem' }}>Product</p>
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
                      className="text-sm text-text-muted transition-colors hover:text-nav">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-nav" style={{ marginBottom: '1rem' }}>Company</p>
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
                      className="text-sm text-text-muted transition-colors hover:text-nav">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Exchanges */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-nav" style={{ marginBottom: '1rem' }}>Exchanges</p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {[
                  'TSX', 'TSXV', 'CSE', 'NASDAQ', 'NYSE', 'OTC Markets', 'Cboe Canada',
                ].map(ex => (
                  <li key={ex}>
                    <span className="text-sm text-text-muted">{ex}</span>
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: '1.5rem' }}>
                <p className="text-xs font-bold uppercase tracking-widest text-nav" style={{ marginBottom: '1rem' }}>Listing Types</p>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {['IPO', 'Direct Listing', 'RTO', 'SPAC', 'Regulation A+'].map(t => (
                    <li key={t}><span className="text-sm text-text-muted">{t}</span></li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Legal & Support */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-nav" style={{ marginBottom: '1rem' }}>Legal</p>
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
              <div style={{ marginTop: '1.5rem' }}>
                <p className="text-xs font-bold uppercase tracking-widest text-nav" style={{ marginBottom: '1rem' }}>Support</p>
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
        <div style={{ borderTop: '1px solid #E5E4E0', background: '#F7F6F4' }}>
          <div className="max-w-7xl mx-auto" style={{ paddingTop: '1.25rem', paddingBottom: '1.25rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <p className="text-xs leading-relaxed flex-1 min-w-0" style={{ color: '#555555' }}>
                <span className="font-semibold" style={{ color: '#333333' }}>Important:</span>{' '}
                IPOReady is a workflow management and project tracking platform only. It does not provide legal, compliance, accounting, securities, or investment banking services, and does not act on your behalf in any regulatory or professional capacity.
                All regulatory filings, legal opinions, and compliance determinations must be executed by licensed professionals. Nothing on this platform constitutes legal advice, financial advice, or an offer to buy or sell securities.
              </p>
              <div className="flex items-center gap-4 flex-shrink-0 self-end md:self-auto">
                <p className="text-xs" style={{ color: '#555555' }}>© {new Date().getFullYear()} IPOReady. All rights reserved.</p>
                <div className="flex items-center gap-1 p-0.5 rounded-lg" style={{ background: '#EFEFED', border: '1px solid #E5E4E0' }}>
                  {(['EN', 'FR'] as const).map(l => (
                    <span key={l} className="text-xs px-2 py-0.5 rounded font-mono font-medium cursor-default"
                      style={{ color: '#9A9A9A' }}>{l}</span>
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
