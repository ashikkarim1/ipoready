'use client'
import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Rocket, CheckSquare, FileText, Users, ShoppingBag, DollarSign,
  PieChart, Banknote, ChevronRight, ChevronDown, Zap, Shield, ArrowRight,
  Building2, BarChart3, CheckCircle2, Globe, Star, TrendingUp,
  RefreshCcw, Layers, LayoutGrid, Mail, ExternalLink, Clock,
  MessageCircle, UserCheck, Calendar, PlayCircle, BookOpen
} from 'lucide-react'

// ─── Data ─────────────────────────────────────────────────────────────────────

const EXCHANGES = ['TSX', 'TSXV', 'CSE', 'NASDAQ', 'NYSE', 'OTC Markets', 'Cboe Canada']

const PURPOSES = [
  { icon: TrendingUp, label: 'IPO / Direct Listing',  sub: 'TSX, TSXV, CSE, NASDAQ, NYSE',      color: '#E8312A', bg: '#FDECEB' },
  { icon: RefreshCcw, label: 'Reverse Takeover',       sub: 'Shell acquisition & re-listing',     color: '#1D4ED8', bg: '#EFF6FF' },
  { icon: Layers,     label: 'SPAC',                   sub: 'Special purpose acquisition',        color: '#2D7A5F', bg: '#EAF5F0' },
  { icon: LayoutGrid, label: 'Regulation A+',          sub: 'US mini-IPO for smaller issuers',   color: '#B45309', bg: '#FEF3C7' },
]

const FEATURES = [
  {
    icon: Zap,
    title: 'PACE™ Velocity Engine',
    description: 'Always know exactly where you stand. Our proprietary score turns task completion into a live listing-date forecast — so you walk into every board meeting and exchange review with complete confidence.',
    accentColor: '#E8312A',
    accentBg: '#FDECEB',
  },
  {
    icon: CheckSquare,
    title: '180+ IPO Milestones, Pre-Built',
    description: 'We\'ve already figured out every step. The most comprehensive IPO task library ever assembled — filtered automatically to your exchange and listing type. You execute; we handled the research.',
    accentColor: '#2D7A5F',
    accentBg: '#EAF5F0',
  },
  {
    icon: PieChart,
    title: 'AI-Assisted Cap Table',
    description: 'Stop modelling your share structure in Excel. Fully-diluted scenarios with warrant, option, and convertible note waterfalls — ready before your first underwriter conversation.',
    accentColor: '#1D4ED8',
    accentBg: '#EFF6FF',
  },
  {
    icon: Banknote,
    title: 'Capital Raise Tracker',
    description: 'One place for every tranche, investor commitment, and financing condition — from seed round through IPO close. Your CFO always knows where the money stands.',
    accentColor: '#B45309',
    accentBg: '#FEF3C7',
  },
  {
    icon: FileText,
    title: 'Document Workspace',
    description: 'Every draft prospectus, legal opinion, and governance policy — version-controlled and accessible to the right people. No more emailing PDFs back and forth with your legal team.',
    accentColor: '#717171',
    accentBg: '#F7F6F4',
  },
  {
    icon: ShoppingBag,
    title: 'Verified Expert Network',
    description: 'Need a CPAB auditor or securities counsel? Skip the cold calls. Our vetted network of IPO-credentialed professionals is on-platform and ready to engage — filtered by exchange and listing type.',
    accentColor: '#2D7A5F',
    accentBg: '#EAF5F0',
  },
  {
    icon: BookOpen,
    title: 'Prospectus Builder',
    description: 'Automatically generate professional IPO prospectuses from source documents with AI assistance and multi-tier professional review workflow — no more manual drafting, faster path to filing.',
    accentColor: '#7C3AED',
    accentBg: '#F5F3FF',
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

function PurposePill({ icon: Icon, label, sub, color, bg }: {
  icon: React.ElementType; label: string; sub: string; color: string; bg: string
}) {
  return (
    <div className="card card-hover flex items-center gap-3.5"
      style={{ padding: '1rem 1.25rem' }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: bg }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div>
        <p className="font-semibold text-nav text-sm leading-snug">{label}</p>
        <p className="text-xs leading-snug" style={{ color: '#9A9A9A', marginTop: '2px' }}>{sub}</p>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [featuresOpen, setFeaturesOpen] = useState(false)
  const [exchangesOpen, setExchangesOpen] = useState(false)

  return (
    <div className="min-h-screen" style={{ background: '#F7F6F4', color: '#1A1A1A', paddingTop: '4rem' }}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50"
        style={{ background: 'rgba(247,246,244,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #E5E4E0' }}>
        <div className="max-w-7xl mx-auto h-16 flex items-center justify-between" style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
          {/* Logo + Nav — left group */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Link href="/" className="flex items-center gap-2.5" style={{ marginRight: '0.5rem' }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: '#1A1A1A' }}>
              <Rocket className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-nav">
              IPO<span style={{ color: '#E8312A' }}>Ready</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>

            {/* ── Features mega-menu ── */}
            <div className="relative"
              onMouseEnter={() => setFeaturesOpen(true)}
              onMouseLeave={() => setFeaturesOpen(false)}>

              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
                style={{ color: featuresOpen ? '#1A1A1A' : '#717171', background: featuresOpen ? '#EFEFED' : 'transparent' }}>
                Features
                <motion.span animate={{ rotate: featuresOpen ? 180 : 0 }} transition={{ duration: 0.18 }}>
                  <ChevronDown className="w-3.5 h-3.5" />
                </motion.span>
              </button>

              <AnimatePresence>
                {featuresOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                    className="hidden md:block"
                    style={{
                      position: 'absolute', top: 'calc(100% + 8px)', left: '0',
                      width: 'min(720px, calc(100vw - 2rem))',
                      background: '#FFFFFF', borderRadius: '18px',
                      border: '1px solid #E5E4E0',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.04)',
                      zIndex: 200, overflow: 'hidden',
                    }}>

                    {/* Notch */}
                    <div style={{
                      position: 'absolute', top: '-5px', left: '24px',
                      width: '10px', height: '10px', background: '#FFFFFF',
                      border: '1px solid #E5E4E0', borderBottom: 'none', borderRight: 'none',
                      transform: 'rotate(45deg)', zIndex: 1,
                    }} />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px' }}>

                      {/* Left: feature list */}
                      <div style={{ padding: '1.25rem 1rem 1.25rem 1.25rem' }}>
                        {([
                          {
                            heading: 'Readiness Engine',
                            items: [
                              { icon: Zap,         label: 'PACE™ Velocity Engine',    desc: 'Live IPO velocity score with real-time listing-date forecast', color: '#E8312A', bg: '#FDECEB', href: '/pace' },
                              { icon: CheckSquare, label: '180+ IPO Milestones',       desc: 'Every task across all 8 phases, filtered to your exchange',   color: '#2D7A5F', bg: '#EAF5F0', href: '/checklist' },
                              { icon: BarChart3,   label: 'PACE™ Benchmark',           desc: 'Compare your velocity against peer issuers on the same exchange', color: '#1D4ED8', bg: '#EFF6FF', href: '/pace' },
                            ],
                          },
                          {
                            heading: 'Financial & Legal',
                            items: [
                              { icon: PieChart,  label: 'AI-Assisted Cap Table',    desc: 'Fully-diluted share structure with warrant & option waterfall', color: '#1D4ED8', bg: '#EFF6FF', href: '/cap-table' },
                              { icon: Banknote,  label: 'Capital Raise Tracker',    desc: 'Track tranches, commitments & conditions through IPO close',   color: '#B45309', bg: '#FEF3C7', href: '/raising-capital' },
                              { icon: FileText,  label: 'Document Workspace',       desc: 'Version-controlled vault for every prospectus & legal opinion', color: '#717171', bg: '#F3F3F1', href: '/documents' },
                            ],
                          },
                          {
                            heading: 'Team & Network',
                            items: [
                              { icon: Users,       label: 'Team Management',         desc: 'Assign workstreams, set owners, track across your whole team',   color: '#2D7A5F', bg: '#EAF5F0', href: '/team' },
                              { icon: ShoppingBag, label: 'Verified Expert Network', desc: 'CPAB auditors, securities lawyers & IR advisors — on-platform', color: '#E8312A', bg: '#FDECEB', href: '/marketplace' },
                            ],
                          },
                        ] as { heading: string; items: { icon: React.ElementType; label: string; desc: string; color: string; bg: string; href: string }[] }[]).map((section, si) => (
                          <div key={section.heading} style={{ marginBottom: si < 2 ? '1rem' : 0 }}>
                            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C0BEB9', marginBottom: '3px', paddingLeft: '0.625rem' }}>
                              {section.heading}
                            </p>
                            {section.items.map(item => (
                              <Link key={item.label} href={item.href}
                                className="flex items-center gap-3 rounded-xl transition-colors hover:bg-opacity-50"
                                style={{ padding: '0.5rem 0.625rem', color: 'inherit', textDecoration: 'none' }}>
                                <div className="flex-shrink-0 rounded-lg flex items-center justify-center"
                                  style={{ width: '30px', height: '30px', background: item.bg }}>
                                  <item.icon className="w-3.5 h-3.5" style={{ color: item.color }} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A', margin: '0 0 1px 0', lineHeight: '1.2' }}>{item.label}</p>
                                  <p style={{ fontSize: '11.5px', color: '#9A9A9A', margin: 0, lineHeight: '1.35' }}>{item.desc}</p>
                                </div>
                                <ChevronRight className="w-3 h-3 flex-shrink-0 opacity-0 transition-opacity" style={{ color: '#C0BEB9' }} />
                              </Link>
                            ))}
                          </div>
                        ))}
                      </div>

                      {/* Right: PACE™ spotlight */}
                      <div style={{ background: '#1A1A1A', display: 'flex', flexDirection: 'column', padding: '1.25rem', gap: '1rem' }}>
                        <div>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(232,49,42,0.18)', borderRadius: '5px', padding: '2px 7px', marginBottom: '0.625rem' }}>
                            <Zap className="w-2.5 h-2.5" style={{ color: '#E8312A' }} />
                            <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#E8312A' }}>PACE™</span>
                          </div>
                          <p style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', lineHeight: '1.35', marginBottom: '0.4rem' }}>
                            Know your listing velocity before you talk to underwriters.
                          </p>
                          <p style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.4)', lineHeight: '1.5', margin: 0 }}>
                            The only engine that turns task completion into a real-time listing forecast.
                          </p>
                        </div>

                        {/* Score widget */}
                        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '0.875rem', border: '1px solid rgba(255,255,255,0.07)' }}>
                          <p style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '0.5rem' }}>Live PACE™ Score</p>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px', marginBottom: '0.4rem' }}>
                            <span style={{ fontSize: '2rem', fontWeight: 800, color: '#E8312A', lineHeight: 1 }}>72</span>
                            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', fontWeight: 500 }}>/100</span>
                          </div>
                          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '100px', height: '3px', marginBottom: '0.4rem' }}>
                            <div style={{ width: '72%', height: '100%', background: 'linear-gradient(90deg, #E8312A, #FF6B64)', borderRadius: '100px' }} />
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)' }}>Corporate Restructuring</span>
                            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)' }}>187 days</span>
                          </div>
                        </div>

                        <Link href="/register"
                          className="flex items-center justify-center gap-1.5 rounded-xl text-sm font-semibold transition-colors hover:opacity-90"
                          style={{ background: '#E8312A', color: '#FFFFFF', padding: '0.5rem 0.875rem', textDecoration: 'none' }}>
                          See your score free <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.22)', textAlign: 'center', margin: 0 }}>No credit card · 5 min setup</p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div style={{ borderTop: '1px solid #EEEDEB', background: '#F9F8F6', padding: '0.625rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        {([
                          { label: 'All features', href: '#features' },
                          { label: 'Pricing', href: '/pricing' },
                          { label: 'IPO guide', href: '/checklist-guide' },
                        ] as { label: string; href: string }[]).map(l => (
                          <Link key={l.label} href={l.href}
                            style={{ fontSize: '12px', fontWeight: 500, color: '#9A9A9A', textDecoration: 'none' }}>
                            {l.label}
                          </Link>
                        ))}
                      </div>
                      <Link href="/register"
                        className="flex items-center gap-1.5 rounded-full transition-colors"
                        style={{ background: '#1A1A1A', color: '#FFFFFF', padding: '0.3rem 0.8rem', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}>
                        Get started free <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Exchanges mega-menu ── */}
            <div className="relative"
              onMouseEnter={() => setExchangesOpen(true)}
              onMouseLeave={() => setExchangesOpen(false)}>

              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
                style={{ color: exchangesOpen ? '#1A1A1A' : '#717171', background: exchangesOpen ? '#EFEFED' : 'transparent' }}>
                Exchanges
                <motion.span animate={{ rotate: exchangesOpen ? 180 : 0 }} transition={{ duration: 0.18 }}>
                  <ChevronDown className="w-3.5 h-3.5" />
                </motion.span>
              </button>

              <AnimatePresence>
                {exchangesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      position: 'absolute', top: 'calc(100% + 8px)', left: '0',
                      width: '620px',
                      background: '#FFFFFF', borderRadius: '18px',
                      border: '1px solid #E5E4E0',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.04)',
                      zIndex: 200, overflow: 'hidden',
                    }}>

                    {/* Notch */}
                    <div style={{
                      position: 'absolute', top: '-5px', left: '24px',
                      width: '10px', height: '10px', background: '#FFFFFF',
                      border: '1px solid #E5E4E0', borderBottom: 'none', borderRight: 'none',
                      transform: 'rotate(45deg)', zIndex: 1,
                    }} />

                    {/* Two columns */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>

                      {/* Canadian */}
                      <div style={{ padding: '1.125rem 0.875rem 1rem 1.125rem', borderRight: '1px solid #F0EFED' }}>
                        <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C0BEB9', marginBottom: '4px', paddingLeft: '0.5rem' }}>
                          Canadian
                        </p>
                        {([
                          { icon: TrendingUp, label: 'TSX',                  full: 'Toronto Stock Exchange',      badge: 'Senior',      badgeColor: '#1D4ED8', badgeBg: '#EFF6FF', color: '#1D4ED8', bg: '#EFF6FF', desc: 'Canada\'s flagship exchange for established companies', types: ['IPO', 'RTO'],        href: '/register' },
                          { icon: BarChart3,  label: 'TSXV',                 full: 'TSX Venture Exchange',        badge: 'Venture',     badgeColor: '#2D7A5F', badgeBg: '#EAF5F0', color: '#2D7A5F', bg: '#EAF5F0', desc: 'The leading market for growth-stage Canadian issuers', types: ['IPO', 'RTO', 'SPAC'], href: '/register' },
                          { icon: Zap,        label: 'CSE',                  full: 'Canadian Securities Exchange', badge: 'Fast',        badgeColor: '#B45309', badgeBg: '#FEF3C7', color: '#B45309', bg: '#FEF3C7', desc: '30-day review, no profitability requirement',          types: ['IPO', 'RTO'],        href: '/register' },
                          { icon: Globe,      label: 'Cboe Canada',          full: 'Cboe Canada (NEO)',            badge: 'Alternative', badgeColor: '#7C3AED', badgeBg: '#F5F3FF', color: '#7C3AED', bg: '#F5F3FF', desc: 'Institutional-grade infrastructure, lower listing fees', types: ['IPO'],               href: '/register' },
                        ] as { icon: React.ElementType; label: string; full: string; badge: string; badgeColor: string; badgeBg: string; color: string; bg: string; desc: string; types: string[]; href: string }[]).map(ex => (
                          <Link key={ex.label} href={ex.href}
                            className="flex items-center gap-2.5 rounded-xl transition-colors"
                            style={{ padding: '0.5rem', textDecoration: 'none', marginBottom: '1px' }}
                            <div className="flex-shrink-0 rounded-lg flex items-center justify-center"
                              style={{ width: '30px', height: '30px', background: ex.bg }}>
                              <ex.icon className="w-3.5 h-3.5" style={{ color: ex.color }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '1px' }}>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A', lineHeight: '1.2' }}>{ex.full}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '10px', fontWeight: 600, color: ex.badgeColor, background: ex.badgeBg, padding: '0px 5px', borderRadius: '999px' }}>{ex.badge}</span>
                                {ex.types.map(t => (
                                  <span key={t} style={{ fontSize: '10px', color: '#9A9A9A', background: '#F0EFED', padding: '0px 5px', borderRadius: '999px', fontWeight: 500 }}>{t}</span>
                                ))}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>

                      {/* US */}
                      <div style={{ padding: '1.125rem 1.125rem 1rem 0.875rem' }}>
                        <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C0BEB9', marginBottom: '4px', paddingLeft: '0.5rem' }}>
                          United States
                        </p>
                        {([
                          { icon: Building2, label: 'NASDAQ',     full: 'NASDAQ',                   badge: 'Tech',      badgeColor: '#1D4ED8', badgeBg: '#EFF6FF', color: '#1D4ED8', bg: '#EFF6FF', types: ['IPO', 'SPAC', 'Direct'], href: '/register' },
                          { icon: Shield,    label: 'NYSE',       full: 'New York Stock Exchange',  badge: 'Blue Chip', badgeColor: '#1A1A1A', badgeBg: '#F0EFED', color: '#1A1A1A', bg: '#F0EFED', types: ['IPO', 'Direct'],        href: '/register' },
                          { icon: Layers,    label: 'OTC Markets',full: 'OTC Markets',              badge: 'Entry',     badgeColor: '#2D7A5F', badgeBg: '#EAF5F0', color: '#2D7A5F', bg: '#EAF5F0', types: ['Reg A+', 'IPO'],        href: '/register' },
                        ] as { icon: React.ElementType; label: string; full: string; badge: string; badgeColor: string; badgeBg: string; color: string; bg: string; types: string[]; href: string }[]).map(ex => (
                          <Link key={ex.label} href={ex.href}
                            className="flex items-center gap-2.5 rounded-xl transition-colors"
                            style={{ padding: '0.5rem', textDecoration: 'none', marginBottom: '1px' }}
                            <div className="flex-shrink-0 rounded-lg flex items-center justify-center"
                              style={{ width: '30px', height: '30px', background: ex.bg }}>
                              <ex.icon className="w-3.5 h-3.5" style={{ color: ex.color }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ marginBottom: '1px' }}>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A', lineHeight: '1.2' }}>{ex.full}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '10px', fontWeight: 600, color: ex.badgeColor, background: ex.badgeBg, padding: '0px 5px', borderRadius: '999px' }}>{ex.badge}</span>
                                {ex.types.map(t => (
                                  <span key={t} style={{ fontSize: '10px', color: '#9A9A9A', background: '#F0EFED', padding: '0px 5px', borderRadius: '999px', fontWeight: 500 }}>{t}</span>
                                ))}
                              </div>
                            </div>
                          </Link>
                        ))}

                        {/* Spacer to balance with 4-item CA column */}
                        <div style={{ height: '0.5rem' }} />
                      </div>
                    </div>

                    {/* Footer — "Which exchange?" CTA spanning full width */}
                    <div style={{ borderTop: '1px solid #EEEDEB', background: '#F9F8F6', padding: '0.75rem 1.125rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <p style={{ fontSize: '12px', fontWeight: 600, color: '#1A1A1A', margin: '0 0 1px 0' }}>Not sure which exchange fits your company?</p>
                        <p style={{ fontSize: '11px', color: '#9A9A9A', margin: 0 }}>Answer 4 questions — we'll build your personalized roadmap instantly.</p>
                      </div>
                      <Link href="/register"
                        className="flex items-center gap-1.5 rounded-full flex-shrink-0 transition-colors"
                        style={{ background: '#E8312A', color: '#FFFFFF', padding: '0.375rem 0.875rem', fontSize: '12px', fontWeight: 600, textDecoration: 'none', marginLeft: '1rem' }}
                        Find my exchange <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>

                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Link href="/pricing"
              className="px-3 py-1.5 rounded-full text-sm font-medium text-text-muted hover:text-nav hover:bg-bg transition-colors">
              Pricing
            </Link>
          </nav>
          </div>{/* end left group */}

          {/* CTA cluster */}
          <div className="flex items-center gap-2">
            <Link href="/login"
              className="px-4 py-2 rounded-full text-sm font-medium text-text-muted hover:text-nav transition-colors">
              Sign in
            </Link>
            <Link href="/register"
              className="px-4 py-2 rounded-full text-sm font-semibold text-white transition-colors"
              style={{ background: '#1A1A1A' }}
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto" style={{ paddingTop: '3.5rem', paddingBottom: '3rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        <div className="grid lg:grid-cols-[1fr_420px] gap-12 xl:gap-16 items-start">

          {/* Left: Copy */}
          <div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
              className="flex items-center gap-2" style={{ marginBottom: '1.5rem' }}>
              <span className="pill text-xs font-bold uppercase tracking-wider"
                style={{ background: '#FDECEB', color: '#E8312A' }}>The IPO Operating System</span>
              <span className="text-text-muted text-sm">Canadian & US listings</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.06 }}
              className="serif text-nav"
              style={{ fontSize: '2.1rem', lineHeight: '1.2', marginBottom: '1.25rem' }}>
              Going public is complex.<br />
              <span style={{ color: '#E8312A' }}>We make it step-by-step simple.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.12 }}
              className="text-text-muted text-lg leading-relaxed" style={{ marginBottom: '1rem' }}>
              Tell us your exchange and listing type — IPOReady instantly builds your personalized 180+ task roadmap, assigns workstreams to your team, and tracks your velocity toward listing day. No setup. No spreadsheets. No missed steps.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.16 }}
              className="text-text-muted text-sm leading-relaxed" style={{ marginBottom: '2rem' }}>
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
                  <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">IPO Dashboard</p>
                  <p className="font-bold text-nav mt-0.5">Meridian Resources Inc.</p>
                </div>
                <span className="pill text-xs font-bold" style={{ background: '#FDECEB', color: '#E8312A' }}>TSX</span>
              </div>

              {/* PACE Score */}
              <div className="rounded-xl p-4" style={{ background: '#F7F6F4', border: '1px solid #E5E4E0', marginBottom: '1rem' }}>
                <div className="flex items-center justify-between" style={{ marginBottom: '0.625rem' }}>
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" style={{ color: '#E8312A' }} />
                    <span className="text-xs font-semibold text-text-muted">PACE™ Score</span>
                  </div>
                  <span className="font-black text-2xl text-nav">72</span>
                </div>
                <div className="rounded-full overflow-hidden" style={{ height: '6px', background: '#E5E4E0' }}>
                  <div className="h-full rounded-full" style={{ width: '72%', background: '#E8312A' }} />
                </div>
                <p className="text-xs text-text-muted" style={{ marginTop: '0.5rem' }}>~118 days to listing</p>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 gap-3" style={{ marginBottom: '1.25rem' }}>
                <div className="rounded-xl p-3 text-center" style={{ background: '#F7F6F4', border: '1px solid #E5E4E0' }}>
                  <p className="serif text-2xl font-bold text-nav">38</p>
                  <p className="text-xs text-text-muted">of 180 tasks done</p>
                </div>
                <div className="rounded-xl p-3 text-center" style={{ background: '#F7F6F4', border: '1px solid #E5E4E0' }}>
                  <p className="serif text-2xl font-bold text-nav">Pre</p>
                  <p className="text-xs text-text-muted">Filing phase</p>
                </div>
              </div>

              {/* Upcoming tasks */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-text-muted" style={{ marginBottom: '0.75rem' }}>
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
                        {task.done && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                      <p className="text-sm" style={{ color: task.done ? '#9A9A9A' : '#1A1A1A',
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
      <section style={{ background: '#FFFFFF', borderTop: '1px solid #E5E4E0', borderBottom: '1px solid #E5E4E0' }}>
        <div className="max-w-7xl mx-auto flex items-center gap-3 flex-wrap" style={{ paddingTop: '1.25rem', paddingBottom: '1.25rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
          <span className="text-text-light text-xs font-semibold uppercase tracking-wider mr-2">Supported exchanges</span>
          {EXCHANGES.map(ex => (
            <span key={ex} className="pill text-xs font-semibold"
              style={{ background: '#F7F6F4', color: '#717171', border: '1px solid #E5E4E0' }}>
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
              color: '#E8312A',
              bg: '#FDECEB',
              title: 'Tell us your listing',
              body: 'Enter your company name, target exchange, listing type, and estimated target date. Four questions. That\'s it.',
              detail: 'Takes 2 minutes',
              detailIcon: Clock,
            },
            {
              step: '02',
              icon: CheckSquare,
              color: '#2D7A5F',
              bg: '#EAF5F0',
              title: 'Get your personalized roadmap',
              body: 'We instantly generate your full checklist — 180+ tasks filtered to your exact exchange and listing path. Every step explained, every deadline flagged.',
              detail: 'Personalized to your exchange',
              detailIcon: Globe,
            },
            {
              step: '03',
              icon: Users,
              color: '#1D4ED8',
              bg: '#EFF6FF',
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
                color: '#F0EFED', userSelect: 'none', fontFamily: 'Georgia, serif',
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
          <div className="inline-flex flex-wrap items-center justify-center gap-4 px-6 py-4 rounded-2xl"
            style={{ background: '#FFFFFF', border: '1px solid #E5E4E0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            {[
              { icon: UserCheck, text: 'No credit card to start' },
              { icon: Clock,     text: 'Ready in under 5 minutes' },
              { icon: MessageCircle, text: 'WhatsApp AI Companion included on Growth+' },
              { icon: Shield,    text: 'SOC 2-ready infrastructure' },
            ].map(({ icon: I, text }) => (
              <div key={text} className="flex items-center gap-2 text-sm" style={{ color: '#717171' }}>
                <I className="w-4 h-4 flex-shrink-0" style={{ color: '#1A1A1A' }} />
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
              <p className="serif text-3xl md:text-4xl text-nav mb-1">{s.value}</p>
              <p className="font-semibold text-sm text-nav mb-0.5">{s.label}</p>
              <p className="text-text-muted text-xs leading-relaxed">{s.sub}</p>
            </motion.div>
          ))}
        </div>
          <p className="text-xs" style={{ color: '#9A9A9A', marginTop: '1.5rem' }}>
            † Based on typical IPO coordination overhead reduction for companies using structured workflow management vs. manual email/spreadsheet coordination. Individual results vary.
          </p>
      </section>

      {/* ── Before / After ───────────────────────────────────────────────────── */}
      <section style={{ background: '#FFFFFF', borderTop: '1px solid #E5E4E0', borderBottom: '1px solid #E5E4E0' }}>
        <div className="max-w-7xl mx-auto" style={{ paddingTop: '2.5rem', paddingBottom: '2.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
          <div className="text-xs uppercase tracking-widest text-text-muted font-semibold text-center" style={{ marginBottom: '2.5rem' }}>
            The difference IPOReady makes
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Without */}
            <div className="rounded-2xl p-7" style={{ background: '#F7F6F4', border: '1px solid #E5E4E0' }}>
              <div className="flex items-center gap-2" style={{ marginBottom: '1.5rem' }}>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#E5E4E0' }} />
                <p className="text-sm font-bold uppercase tracking-wider" style={{ color: '#9A9A9A' }}>Without IPOReady</p>
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
                      style={{ background: '#FEE2E2', border: '1px solid #FECACA' }}>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#E8312A' }} />
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: '#717171' }}>{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* With */}
            <div className="rounded-2xl p-7" style={{ background: '#1A1A1A', border: '1px solid #1A1A1A' }}>
              <div className="flex items-center gap-2" style={{ marginBottom: '1.5rem' }}>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#E8312A' }} />
                <p className="text-sm font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>With IPOReady</p>
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
                      <CheckCircle2 className="w-3 h-3" style={{ color: '#4ADE80' }} />
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="text-xs" style={{ color: '#9A9A9A', marginTop: '1.25rem' }}>
            † Source: KPMG IPO Study, 2022. Every one of those weaknesses was fixable pre-fieldwork.
          </p>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────────── */}
      <section id="features" className="max-w-7xl mx-auto" style={{ paddingTop: '2.5rem', paddingBottom: '2.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <div className="text-xs uppercase tracking-widest text-text-muted font-semibold" style={{ marginBottom: '1rem' }}>Platform</div>
          <h2 className="serif text-3xl md:text-4xl text-nav leading-tight max-w-xl" style={{ marginBottom: '0.875rem' }}>
            We built the hard parts so you don&rsquo;t have to.
          </h2>
          <p className="text-text-muted" style={{ maxWidth: '540px', lineHeight: '1.65' }}>
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
                <h3 className="font-semibold text-nav mb-3">{f.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{f.description}</p>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* ── Customer Ratings ────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto" style={{ paddingTop: '2.5rem', paddingBottom: '2rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        {/* Header */}
        <div className="text-center" style={{ marginBottom: '3rem' }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest"
            style={{ background: '#FEF3C7', color: '#B45309', border: '1px solid #FDE68A', marginBottom: '1rem' }}>
            <Star className="w-3 h-3" style={{ fill: '#B45309' }} />
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
                    style={{ fill: i < t.rating ? '#F59E0B' : '#E5E4E0', color: i < t.rating ? '#F59E0B' : '#E5E4E0' }} />
                ))}
                <span className="text-xs font-semibold" style={{ color: '#B45309', marginLeft: '6px' }}>
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
                  <p className="text-xs" style={{ color: '#9A9A9A', marginTop: '2px' }}>{t.role}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: t.exchange === 'CSE' ? '#EFF6FF' : '#EAF5F0',
                      color: t.exchange === 'CSE' ? '#1D4ED8' : '#2D7A5F',
                    }}>
                    {t.exchange}
                  </span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{
                      background: t.status === 'Listed' ? '#EAF5F0' : '#FEF3C7',
                      color: t.status === 'Listed' ? '#2D7A5F' : '#B45309',
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
            style={{ background: '#FFFFFF', border: '1px solid #E5E4E0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', gap: '2px' }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-5 h-5" style={{ fill: '#F59E0B', color: '#F59E0B' }} />
              ))}
            </div>
            <span className="font-bold text-nav text-lg">5.0</span>
            <span className="text-text-muted text-sm">from our first customers</span>
          </div>
        </div>
      </section>

      {/* ── CTA banner ──────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto" style={{ paddingTop: '2rem', paddingBottom: '2rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        <div className="card p-10 md:p-14 text-center" style={{ background: '#1A1A1A', borderColor: '#1A1A1A' }}>
          <div className="text-xs uppercase tracking-widest font-semibold" style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '1.25rem' }}>
            Get started today
          </div>
          <h2 className="serif text-3xl md:text-4xl text-white leading-tight" style={{ marginBottom: '1.25rem' }}>
            Your personalized IPO roadmap,<br />ready in 5 minutes.
          </h2>
          <p className="text-sm leading-relaxed max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.55)', marginBottom: '1.25rem' }}>
            Tell us your exchange and listing type. We hand you a 180+ task roadmap, pre-filtered to your path, with every workstream ready to assign to your team.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)', marginBottom: '2.5rem' }}>
            No credit card. No onboarding call. No spreadsheet to build.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/register"
              className="px-7 py-3 rounded-full font-semibold text-sm text-nav bg-white hover:bg-bg transition-colors inline-flex items-center gap-2">
              Create free account <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/pricing"
              className="px-7 py-3 rounded-full font-semibold text-sm transition-colors inline-flex items-center gap-2"
              style={{ color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.15)' }}
              View pricing
            </Link>
          </div>
        </div>
      </section>

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
                  style={{ background: '#F7F6F4', border: '1px solid #E5E4E0', color: '#9A9A9A' }}
                  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
                </a>
                {/* X / Twitter */}
                <a href="https://twitter.com/ipoready" target="_blank" rel="noopener noreferrer"
                  aria-label="Twitter / X"
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                  style={{ background: '#F7F6F4', border: '1px solid #E5E4E0', color: '#9A9A9A' }}
                  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.733-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg>
                </a>
                {/* Email */}
                <a href="mailto:hello@ipoready.com"
                  aria-label="Email"
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                  style={{ background: '#F7F6F4', border: '1px solid #E5E4E0', color: '#9A9A9A' }}
                  <Mail className="w-3.5 h-3.5" />
                </a>
              </div>
              {/* auditus.ai */}
              <a href="https://auditus.ai" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
                style={{ color: '#717171' }}
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
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <p className="text-xs leading-relaxed text-text-light" style={{ maxWidth: '680px' }}>
                <span className="font-semibold text-text-muted">Important:</span>{' '}
                IPOReady is a workflow management and project tracking platform only. It does not provide legal, compliance, accounting, securities, or investment banking services, and does not act on your behalf in any regulatory or professional capacity.
                All regulatory filings, legal opinions, and compliance determinations must be executed by licensed professionals. Nothing on this platform constitutes legal advice, financial advice, or an offer to buy or sell securities.
              </p>
              <div className="flex items-center gap-4 flex-shrink-0 self-end md:self-auto">
                <p className="text-xs text-text-light">© {new Date().getFullYear()} IPOReady. All rights reserved.</p>
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
