'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Rocket, ArrowRight, BookOpen, Sparkles, Lock, RefreshCcw, Upload, Eye, BarChart3, FileText, Users } from 'lucide-react'
import { FeaturesMegaMenu } from '@/app/components/FeaturesMegaMenu'

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
  return (
    <div>
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50"
        style={{ background: 'rgba(247,246,244,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #E5E4E0' }}>
        <div className="max-w-7xl mx-auto h-16 flex items-center justify-between" style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Link href="/" className="flex items-center gap-2.5" style={{ marginRight: '0.5rem' }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#1A1A1A' }}>
                <Rocket className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-lg text-nav">
                IPO<span style={{ color: '#E8312A' }}>Ready</span>
              </span>
            </Link>
            <FeaturesMegaMenu />
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto" style={{ paddingTop: '4.5rem', paddingBottom: '3rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-center gap-2" style={{ marginBottom: '1.5rem' }}>
            <span className="pill text-xs font-bold uppercase tracking-wider"
              style={{ background: '#FDECEB', color: '#E8312A' }}>
              <BookOpen className="w-3.5 h-3.5 inline mr-1.5" />
              Prospectus Builder
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.06 }}
            className="serif text-nav"
            style={{ fontSize: '2.5rem', lineHeight: '1.2', marginBottom: '1.5rem' }}>
            From Documents to<br />
            <span style={{ color: '#E8312A' }}>Filing-Ready Prospectus</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12 }}
            className="text-text-muted text-lg leading-relaxed" style={{ marginBottom: '1.5rem', maxWidth: '620px', margin: '0 auto 1.5rem' }}>
            Upload documents. AI organizes and structures them with compliance built-in. Route through multi-tier review — all in one platform.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.18 }}
            className="flex flex-wrap items-center justify-center gap-3" style={{ marginBottom: '2.5rem' }}>
            <Link href="/register"
              className="btn btn-primary gap-2 font-semibold px-6 py-2.5 rounded-full">
              Start Building <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/resources" className="btn btn-secondary px-6 py-2.5 rounded-full">
              Learn More
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {BENEFITS.map((s, i) => (
              <motion.div key={s.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="card p-6">
                <p className="serif text-3xl md:text-4xl text-nav mb-1">{s.metric}</p>
                <p className="font-semibold text-sm text-nav mb-0.5">{s.label}</p>
                <p className="text-text-muted text-xs leading-relaxed">{s.sub}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── How It Works ────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto" style={{ paddingTop: '2.5rem', paddingBottom: '2.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <div className="text-xs uppercase tracking-widest text-text-muted font-semibold" style={{ marginBottom: '1rem' }}>Workflow</div>
          <h2 className="serif text-3xl md:text-4xl text-nav leading-tight" style={{ marginBottom: '0.875rem' }}>
            4 steps to completion
          </h2>
        </div>

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
      <section className="max-w-7xl mx-auto" style={{ paddingTop: '2.5rem', paddingBottom: '2.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <div className="text-xs uppercase tracking-widest text-text-muted font-semibold" style={{ marginBottom: '1rem' }}>Platform</div>
          <h2 className="serif text-3xl md:text-4xl text-nav leading-tight max-w-xl" style={{ marginBottom: '0.875rem' }}>
            Everything you need for compliance-ready prospectuses.
          </h2>
          <p className="text-text-muted" style={{ maxWidth: '540px', lineHeight: '1.65' }}>
            Purpose-built capabilities for drafting, review, and filing across all major exchanges.
          </p>
        </div>

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
          <h2 className="serif text-3xl md:text-4xl text-nav mb-4 leading-tight">
            Build prospectuses faster.
          </h2>
          <p className="text-text-muted text-lg mb-8 max-w-2xl mx-auto" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
            Streamline drafting, review, and compliance with AI-powered prospectus builder.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/register" className="btn btn-primary gap-2 font-semibold px-6 py-2.5 rounded-full">
              Start Building <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="mailto:hello@ipoready.ai" className="btn btn-secondary px-6 py-2.5 rounded-full">
              Schedule Demo
            </a>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
