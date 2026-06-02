'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  FileText, CheckCircle2, Zap, Shield, Users, BarChart3, Clock,
  ArrowRight, BookOpen, Sparkles, Lock, RefreshCcw, Upload, Eye
} from 'lucide-react'

const CAPABILITIES = [
  {
    icon: Upload,
    title: 'Multi-Format Import',
    description: 'Upload existing prospectuses, financial documents, or business plans in PDF, DOCX, or TXT format. Our AI extracts and organizes all relevant content automatically.',
    color: '#1D4ED8',
    bg: '#EFF6FF',
  },
  {
    icon: Sparkles,
    title: 'AI-Assisted Generation',
    description: 'Prospectus Builder automatically structures your documents into proper sections, fills gaps with intelligent recommendations, and maintains regulatory compliance for your target exchange.',
    color: '#7C3AED',
    bg: '#F5F3FF',
  },
  {
    icon: Eye,
    title: 'Multi-Tier Review Workflow',
    description: 'Route prospectuses through internal review, legal counsel review, and underwriter feedback — all tracked, versioned, and commented in-platform. No more email chains.',
    color: '#2D7A5F',
    bg: '#EAF5F0',
  },
  {
    icon: Lock,
    title: 'Compliance-First Design',
    description: 'Every generated prospectus follows TSX, TSXV, CSE, NASDAQ, and NYSE formatting and disclosure requirements. Reduces legal review cycles and accelerates filing timelines.',
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
    description: 'Generate final prospectuses as PDF, DOCX, or ZIP packages. Compatible with all filing systems and ready for underwriter and regulatory review.',
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
    metric: '24h',
    label: 'Ready for Filing',
    sub: 'From source documents to final draft',
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
    <div className="min-h-screen" style={{ background: '#F7F6F4' }}>
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-24 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <BookOpen className="w-6 h-6" style={{ color: '#7C3AED' }} />
            <span className="pill text-xs font-bold uppercase tracking-wider" style={{ background: '#F5F3FF', color: '#7C3AED' }}>
              IPOReady Prospectus Builder
            </span>
          </div>

          <h1 className="serif text-nav mb-6" style={{ fontSize: '2.8rem', lineHeight: '1.15' }}>
            From Documents to<br />
            <span style={{ color: '#7C3AED' }}>Filing-Ready Prospectus</span>
          </h1>

          <p className="text-text-muted text-lg max-w-3xl mx-auto mb-8 leading-relaxed">
            Stop manually drafting prospectuses. Upload your documents, let AI organize and complete them with regulatory compliance built-in, then route through multi-tier review — all in one platform. Ready for filing in 24 hours.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            <Link href="/register" className="btn btn-primary gap-2 font-semibold px-7 py-3 rounded-full">
              Start Building Now <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/resources" className="btn btn-secondary px-7 py-3 rounded-full">
              Learn More
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {BENEFITS.map((benefit, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="card p-6"
              >
                <p className="font-black text-3xl text-nav mb-1">{benefit.metric}</p>
                <p className="font-semibold text-sm text-nav mb-1">{benefit.label}</p>
                <p className="text-xs text-text-muted">{benefit.sub}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="serif text-nav mb-4" style={{ fontSize: '2.2rem' }}>How It Works</h2>
          <p className="text-text-muted text-lg max-w-2xl mx-auto">4 simple steps from source documents to filing-ready prospectus</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {WORKFLOW_STEPS.map((item, idx) => {
            const Icon = item.icon
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="card p-8"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ background: '#F5F3FF' }}>
                  <span className="font-black text-lg text-nav">{item.step}</span>
                </div>
                <Icon className="w-8 h-8 mb-4" style={{ color: '#7C3AED' }} />
                <h3 className="font-semibold text-nav mb-2">{item.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{item.description}</p>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Capabilities Grid */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="serif text-nav mb-4" style={{ fontSize: '2.2rem' }}>Powerful Capabilities</h2>
          <p className="text-text-muted text-lg max-w-2xl mx-auto">Everything you need to build compliance-ready prospectuses</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CAPABILITIES.map((cap, idx) => {
            const Icon = cap.icon
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="card p-8"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ background: cap.bg }}>
                  <Icon className="w-6 h-6" style={{ color: cap.color }} />
                </div>
                <h3 className="font-semibold text-nav text-lg mb-2">{cap.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{cap.description}</p>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Supported Exchanges */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-gray-200">
        <div className="text-center">
          <h3 className="font-semibold text-nav mb-8">Compliant with All Major Exchanges</h3>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {['TSX', 'TSXV', 'CSE', 'NASDAQ', 'NYSE', 'OTC Markets', 'Cboe Canada'].map((exchange) => (
              <div key={exchange} className="pill px-4 py-2 text-sm font-semibold" style={{ background: '#F0EFED', color: '#1A1A1A' }}>
                {exchange}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card p-12" style={{ background: '#F5F3FF', border: '2px solid #E9D5FF' }}
        >
          <h2 className="serif text-nav mb-4" style={{ fontSize: '2rem' }}>Ready to Build Your Prospectus?</h2>
          <p className="text-text-muted text-lg mb-8 max-w-2xl mx-auto">
            Join companies across North America who are building filing-ready prospectuses 70% faster with IPOReady.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/register" className="btn btn-primary gap-2 font-semibold px-7 py-3 rounded-full">
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="mailto:hello@ipoready.ai" className="btn btn-secondary px-7 py-3 rounded-full">
              Schedule Demo
            </a>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
