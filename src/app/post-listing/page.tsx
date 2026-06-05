'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FileText, Edit3, Users, Shield, Zap, Award,
  CheckCircle, XCircle, Clock, ArrowRight, Bell
} from 'lucide-react'

const FEATURE_CARDS = [
  {
    icon: FileText,
    color: '#1D4ED8',
    bgColor: '#EFF6FF',
    title: 'Continuous Disclosure Engine',
    description: 'Automated tracking of material change reporting obligations. AI flags events that trigger disclosure requirements under NI 51-102 — before your lawyers do.',
  },
  {
    icon: Edit3,
    color: '#7C3AED',
    bgColor: '#F5F3FF',
    title: 'MD&A Drafting Assistant',
    description: "AI-powered Management's Discussion & Analysis drafting engine. Input your quarterly financials and get a compliant first draft in minutes. Never start from a blank page again.",
  },
  {
    icon: Users,
    color: '#2D7A5F',
    bgColor: '#F0FDF4',
    title: 'AGM Management Suite',
    description: 'Full Annual General Meeting workflow: agenda builder, proxy circular templates, resolution tracker, voting results log, and shareholder communication tools.',
  },
  {
    icon: Shield,
    color: '#B45309',
    bgColor: '#FFFBEB',
    title: 'Insider Reporting Automation',
    description: 'Automated SEDI filing reminders, blackout period calendar, insider trade window management, and Form 55-102F2 pre-population. Zero insider reporting violations.',
  },
  {
    icon: Zap,
    color: '#E8312A',
    bgColor: '#FDECEB',
    title: 'Press Release Engine',
    description: 'AI-drafted press releases for earnings, material events, acquisitions, and executive changes. Compliant with TSXV/TSX/CSE disclosure standards. Review, edit, publish.',
  },
  {
    icon: Award,
    color: '#D97706',
    bgColor: '#FFF7ED',
    title: 'Board Intelligence Hub',
    description: 'Automated board package assembly, director briefing notes, risk dashboards, material update logs since listing, and historical MD&A comparison engine.',
  },
]

const PLAN_BULLETS = [
  'Continuous disclosure obligation tracking (NI 51-102)',
  'AI-powered MD&A drafting and review engine',
  'AGM planning, proxy circulars, and resolution management',
  'Automated SEDI insider reporting reminders',
  'Blackout period calendar and insider trade window',
  'AI press release drafting (earnings, material events)',
  'Board package assembly and director briefing notes',
  'Annual report workflow and filing tracker',
  'Shareholder communications hub',
  'Regulatory calendar with automated deadline alerts',
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94]

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
}

export default function PostListingPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleNotify(e: React.FormEvent) {
    e.preventDefault()
    if (email.trim()) setSubmitted(true)
  }

  return (
    <div style={{ background: '#F7F6F4', minHeight: '100vh', color: '#1A1A1A' }}>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <section style={{ paddingTop: '1.5rem', paddingBottom: '1rem', background: '#F7F6F4' }}>
        <div className="max-w-7xl mx-auto" style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
          <h1 className="serif text-2xl sm:text-3xl text-nav mb-2">Post-Listing Support</h1>
          <p className="text-text-muted text-sm">Comprehensive tools for managing continuous disclosure, regulatory compliance, and shareholder communications after your listing.</p>
        </div>
      </section>


      {/* ── Value Proposition ─────────────────────────────────────────────── */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        style={{
          background: 'white', borderRadius: '20px',
          border: '1px solid #E5E4E0',
          padding: '56px 48px', marginBottom: '32px',
          textAlign: 'center',
        }}
      >
        <h2 className="serif text-2xl sm:text-3xl text-nav mb-4" style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 1.25rem' }}>
          Your IPO is the beginning,<br />not the finish line.
        </h2>
        <p className="text-text-muted text-sm" style={{
          maxWidth: '680px',
          margin: '0 auto',
        }}>
          After listing, public companies face continuous disclosure obligations, regulatory filings, insider reporting, AGM management, and shareholder communications. IPOReady Post-Listing is the only AI-powered platform purpose-built to handle all of it.
        </p>
      </motion.section>

      {/* ── Feature Cards Grid ────────────────────────────────────────────── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px',
          marginBottom: '40px',
        }}
      >
        {FEATURE_CARDS.map(({ icon: Icon, color, bgColor, title, description }) => (
          <motion.div
            key={title}
            variants={cardVariants}
            style={{
              background: 'white', borderRadius: '16px',
              border: '1px solid #E5E4E0',
              padding: '28px',
              display: 'flex', flexDirection: 'column', gap: '14px',
            }}
          >
            {/* Icon */}
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Icon style={{ width: '20px', height: '20px', color }} />
            </div>

            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1A1A1A', lineHeight: 1.3, flex: 1 }}>
                {title}
              </h3>
              <span style={{
                flexShrink: 0, fontSize: '10px', fontWeight: 700,
                background: '#F5F3FF', color: '#7C3AED',
                padding: '3px 9px', borderRadius: '20px', marginTop: '2px',
              }}>
                Coming Soon
              </span>
            </div>

            <p style={{ fontSize: '13.5px', color: '#717171', lineHeight: 1.65, margin: 0 }}>
              {description}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* ── The "Only Platform" Section ───────────────────────────────────── */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        style={{
          background: '#1A1A1A', borderRadius: '20px',
          padding: '56px 48px', marginBottom: '32px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{
            fontSize: '36px', fontWeight: 800, color: 'white',
            lineHeight: 1.15, marginBottom: '16px',
            fontFamily: 'Georgia, "Times New Roman", serif',
          }}>
            From First Milestone to Your 10th Annual Report
          </h2>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.55)', maxWidth: '560px', margin: '0 auto', lineHeight: 1.65 }}>
            IPOReady is being built as the only solution that takes you from pre-IPO planning through decades of post-listing compliance. No other platform comes close.
          </p>
        </div>

        {/* Three pillars */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>

          {/* Traditional Approach */}
          <div style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px', padding: '28px',
          }}>
            <div style={{ marginBottom: '20px' }}>
              <span style={{
                fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                background: 'rgba(239,68,68,0.15)', color: '#F87171',
                padding: '4px 10px', borderRadius: '20px',
              }}>
                Traditional Approach
              </span>
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'white', marginBottom: '18px' }}>
              Multiple Disconnected Tools
            </h3>
            {[
              'Spreadsheets for compliance tracking',
              'Multiple law firms, high costs',
              'Missed disclosure deadlines',
              'Reactive compliance management',
              'No audit trail or accountability',
              'Manual AGM preparation',
            ].map((item) => (
              <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                <XCircle style={{ width: '15px', height: '15px', color: '#F87171', flexShrink: 0, marginTop: '1px' }} />
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>

          {/* IPOReady Pre-IPO */}
          <div style={{
            background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: '16px', padding: '28px',
          }}>
            <div style={{ marginBottom: '20px' }}>
              <span style={{
                fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                background: 'rgba(34,197,94,0.15)', color: '#4ADE80',
                padding: '4px 10px', borderRadius: '20px',
              }}>
                Available Now
              </span>
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'white', marginBottom: '18px' }}>
              IPOReady Pre-IPO
            </h3>
            {[
              'Full pre-IPO workflow management',
              'PACE™ Score velocity tracking',
              'Expert network & advisor matching',
              'Cap table modelling & dilution tools',
              'Document centre & templates',
              '180+ milestone checklist',
            ].map((item) => (
              <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                <CheckCircle style={{ width: '15px', height: '15px', color: '#4ADE80', flexShrink: 0, marginTop: '1px' }} />
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>

          {/* IPOReady Post-Listing */}
          <div style={{
            background: 'rgba(217,119,6,0.06)', border: '1px solid rgba(217,119,6,0.25)',
            borderRadius: '16px', padding: '28px',
          }}>
            <div style={{ marginBottom: '20px' }}>
              <span style={{
                fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                background: 'rgba(217,119,6,0.18)', color: '#FBBF24',
                padding: '4px 10px', borderRadius: '20px',
              }}>
                Coming Q4 2026
              </span>
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'white', marginBottom: '18px' }}>
              IPOReady Post-Listing
            </h3>
            {[
              'Continuous disclosure automation',
              'AI-powered MD&A drafting',
              'AGM management suite',
              'Insider reporting (SEDI) automation',
              'Press release drafting engine',
              'Board intelligence hub',
            ].map((item) => (
              <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                <Clock style={{ width: '15px', height: '15px', color: '#FBBF24', flexShrink: 0, marginTop: '1px' }} />
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>

        </div>
      </motion.section>

      {/* ── Pricing Placeholder ───────────────────────────────────────────── */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        style={{ marginBottom: '32px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '32px', fontWeight: 800, color: '#1A1A1A',
            marginBottom: '10px',
            fontFamily: 'Georgia, "Times New Roman", serif',
          }}>
            Post-Listing Pricing
          </h2>
          <p style={{ fontSize: '16px', color: '#717171' }}>
            Priced differently from pre-IPO. Contact us for early access pricing.
          </p>
        </div>

        {/* Single plan card */}
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          <div style={{
            background: 'white', borderRadius: '20px',
            border: '2px solid #1A1A1A',
            padding: '40px',
          }}>
            {/* Plan label */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#1A1A1A' }}>
                Post-Listing Support
              </h3>
              <span style={{
                fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em',
                background: '#F5F3FF', color: '#7C3AED',
                padding: '4px 12px', borderRadius: '20px', textTransform: 'uppercase',
              }}>
                Coming Q4 2026
              </span>
            </div>

            {/* Pricing placeholder */}
            <div style={{
              background: '#F7F6F4', border: '1px solid #E5E4E0',
              borderRadius: '12px', padding: '16px 20px', marginBottom: '28px',
            }}>
              <p style={{ fontSize: '13px', color: '#9A9A9A', fontWeight: 500 }}>
                Pricing announced at launch — contact us for early access rates
              </p>
            </div>

            {/* Feature bullets */}
            <div style={{ marginBottom: '32px' }}>
              {PLAN_BULLETS.map((bullet) => (
                <div key={bullet} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '12px' }}>
                  <CheckCircle style={{ width: '16px', height: '16px', color: '#2D7A5F', flexShrink: 0, marginTop: '1px' }} />
                  <span style={{ fontSize: '14px', color: '#3A3A3A', lineHeight: 1.5 }}>{bullet}</span>
                </div>
              ))}
            </div>

            {/* CTA button */}
            <button
              onClick={() => {}}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '8px', padding: '14px 24px', borderRadius: '12px',
                background: '#E8312A', border: 'none', color: 'white',
                fontSize: '15px', fontWeight: 700, cursor: 'pointer',
                transition: 'opacity 0.15s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Join the Waitlist
              <ArrowRight style={{ width: '16px', height: '16px' }} />
            </button>

            <p style={{ fontSize: '12px', color: '#9A9A9A', textAlign: 'center', marginTop: '14px' }}>
              Early access customers receive founding-member pricing for life.
            </p>
          </div>
        </div>
      </motion.section>

      {/* ── Notify Me Section ─────────────────────────────────────────────── */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        style={{
          background: 'white', borderRadius: '20px',
          border: '1px solid #E5E4E0',
          padding: '48px', marginBottom: '32px',
          textAlign: 'center',
        }}
      >
        <div style={{
          width: '52px', height: '52px', borderRadius: '14px',
          background: '#FDECEB', display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <Bell style={{ width: '24px', height: '24px', color: '#E8312A' }} />
        </div>

        <h2 style={{
          fontSize: '28px', fontWeight: 800, color: '#1A1A1A',
          marginBottom: '10px',
          fontFamily: 'Georgia, "Times New Roman", serif',
        }}>
          Be First to Know
        </h2>
        <p style={{ fontSize: '15px', color: '#717171', marginBottom: '28px' }}>
          Join 200+ companies on our post-listing waitlist.
        </p>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              background: '#F0FDF4', border: '1px solid #BBF7D0',
              borderRadius: '12px', padding: '14px 24px',
              fontSize: '15px', fontWeight: 600, color: '#16A34A',
            }}
          >
            <CheckCircle style={{ width: '18px', height: '18px' }} />
            You&apos;re on the list! We&apos;ll notify you when Post-Listing goes live.
          </motion.div>
        ) : (
          <form
            onSubmit={handleNotify}
            style={{ display: 'flex', gap: '12px', maxWidth: '440px', margin: '0 auto' }}
          >
            <input
              type="email"
              placeholder="your@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                flex: 1, padding: '12px 16px', borderRadius: '10px',
                border: '1.5px solid #E5E4E0', fontSize: '14px',
                color: '#1A1A1A', background: '#F7F6F4', outline: 'none',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = '#1A1A1A')}
              onBlur={e => (e.currentTarget.style.borderColor = '#E5E4E0')}
            />
            <button
              type="submit"
              style={{
                padding: '12px 20px', borderRadius: '10px',
                background: '#E8312A', border: 'none', color: 'white',
                fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Notify Me When Live
            </button>
          </form>
        )}
      </motion.section>

      {/* ── Bottom Note ───────────────────────────────────────────────────── */}
      <div style={{ padding: '0 4px 40px' }}>
        <p style={{ fontSize: '12px', color: '#9A9A9A', lineHeight: 1.7 }}>
          <sup>†</sup> Post-Listing module is in active development. Current IPOReady customers will receive priority access and exclusive founding-member pricing.
        </p>
      </div>

    </div>
  )
}
