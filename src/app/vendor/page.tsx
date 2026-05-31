'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, User, TrendingUp, MessageSquare, Zap,
  ArrowRight, Star, Download, Send, X, CheckCircle2,
  FileText, ToggleLeft, ToggleRight, ExternalLink, Award,
  ChevronDown, ChevronUp, Paperclip,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'dashboard' | 'profile' | 'funnel' | 'messages' | 'motivator'

interface DealRow {
  id: string
  company: string
  date: string
  category: string
  status: 'New Inquiry' | 'Responded' | 'Meeting Booked' | 'Engaged' | 'Closed Won' | 'Closed Lost'
  brief: string
  inquiry: string
  response: string
  timeline: string[]
}

interface Conversation {
  id: string
  company: string
  unread: number
  lastTime: string
  messages: { from: 'vendor' | 'client'; text: string; time: string }[]
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const DEALS: DealRow[] = [
  {
    id: 'd1',
    company: 'Mining Co. A',
    date: 'May 18, 2026',
    category: 'Audit Engagement',
    status: 'Engaged',
    brief: 'Pre-IPO Mining Company, TSXV Track, Phase 2. Targeting Tier 2 listing. ~CA$8M raise. Fiscal year end December 31.',
    inquiry: 'We are a junior mining company targeting a TSXV listing in approximately 12 months. We need a CPAB-registered auditor for our FY2025 and FY2024 audit cycle. Can you take on a new mandate?',
    response: 'Thank you for reaching out. We specialize in junior mining CPAB audits and have capacity for your timeline. I\'d be happy to schedule an introductory call to discuss scope and fees.',
    timeline: ['May 18 — Inquiry received', 'May 19 — Response sent (same day)', 'May 21 — Discovery call booked', 'May 22 — Engagement letter sent'],
  },
  {
    id: 'd2',
    company: 'Tech Issuer B',
    date: 'May 15, 2026',
    category: 'Tax Advisory',
    status: 'Meeting Booked',
    brief: 'Pre-IPO SaaS company, TSXV / NASDAQ dual-track, Series B. Needs IFRS conversion + SR&ED optimization.',
    inquiry: 'We are a SaaS company exploring a dual listing. We need tax and accounting advisory for our IFRS conversion and SR&ED filing. Do you have dual-listed tech experience?',
    response: 'Yes — we have successfully supported 4 dual-listed tech issuers in the past 18 months. Happy to connect. Sending calendar availability now.',
    timeline: ['May 15 — Inquiry received', 'May 15 — Responded within 2 hours', 'May 17 — Meeting booked for May 28'],
  },
  {
    id: 'd3',
    company: 'Biotech C',
    date: 'May 10, 2026',
    category: 'Financial Advisory',
    status: 'Responded',
    brief: 'Clinical stage biotech, CSE listing track, Phase 1 trial complete. Needs financial statement preparation and MD&A drafting.',
    inquiry: 'We are a clinical stage biotech seeking assistance with our prospectus financial statements and MD&A. Can you provide a scope and fee estimate?',
    response: 'We have reviewed your profile. We have strong biotech experience on CSE and would be glad to provide a detailed proposal. What is your anticipated filing date?',
    timeline: ['May 10 — Inquiry received', 'May 12 — Response sent'],
  },
  {
    id: 'd4',
    company: 'Resources Co. D',
    date: 'May 8, 2026',
    category: 'Audit Engagement',
    status: 'Closed Won',
    brief: 'Copper exploration company, TSXV Tier 1 track. Completed 3-year audit cycle.',
    inquiry: 'Seeking CPAB auditor for a 3-year audit cycle for a copper exploration company targeting TSXV.',
    response: 'We would be happy to take on this mandate. Sending engagement letter shortly.',
    timeline: ['May 8 — Inquiry received', 'May 8 — Responded same day', 'May 9 — Engagement confirmed', 'May 14 — Audit commenced'],
  },
  {
    id: 'd5',
    company: 'Cannabis Co. E',
    date: 'May 3, 2026',
    category: 'Tax Advisory',
    status: 'Closed Lost',
    brief: 'Cannabis company, CSE listing. Decided to go with a larger Big 4 firm.',
    inquiry: 'Looking for tax advisory support for a cannabis IPO on the CSE.',
    response: 'We have cannabis sector experience and can support your CSE listing. Here are our credentials.',
    timeline: ['May 3 — Inquiry received', 'May 4 — Response sent', 'May 10 — No response. Follow-up sent', 'May 15 — Prospect chose another firm'],
  },
  {
    id: 'd6',
    company: 'Fintech Co. F',
    date: 'May 1, 2026',
    category: 'Audit Engagement',
    status: 'New Inquiry',
    brief: 'Fintech startup, NASDAQ listing track, Series C. Needs PCAOB audit for US listing.',
    inquiry: 'We are a Canadian fintech company pursuing a NASDAQ listing. We need a PCAOB-registered auditor. Are you registered with PCAOB?',
    response: '',
    timeline: ['May 1 — Inquiry received'],
  },
  {
    id: 'd7',
    company: 'CleanTech Co. G',
    date: 'Apr 28, 2026',
    category: 'Financial Advisory',
    status: 'Responded',
    brief: 'Renewable energy company, TSX listing track, targeting $40M raise.',
    inquiry: 'Looking for a senior advisory partner to support our TSX listing. We need help with financial statement preparation and exchange requirements.',
    response: 'We have completed 6 TSX listings in the energy sector. We are well-positioned to assist. Sending our credentials deck.',
    timeline: ['Apr 28 — Inquiry received', 'Apr 29 — Response sent'],
  },
  {
    id: 'd8',
    company: 'AgriTech Co. H',
    date: 'Apr 22, 2026',
    category: 'Tax Advisory',
    status: 'Engaged',
    brief: 'AgriTech company, CSE listing track, targeting $6M raise. Active engagement underway.',
    inquiry: 'We need tax advisory and SR&ED filing support for our pre-IPO period. Can you assist?',
    response: 'Yes, we specialize in agri-tech and have strong SR&ED experience. Happy to engage.',
    timeline: ['Apr 22 — Inquiry received', 'Apr 22 — Responded', 'Apr 24 — Meeting held', 'Apr 26 — Engagement confirmed'],
  },
]

const CONVERSATIONS: Conversation[] = [
  {
    id: 'c1',
    company: 'Mining Co. A',
    unread: 3,
    lastTime: '2h ago',
    messages: [
      { from: 'client', text: 'Hi Sarah, thank you for the quick response. We are very interested in moving forward with your firm.', time: 'May 20 · 10:14 AM' },
      { from: 'vendor', text: 'Great to hear! I\'ve attached our engagement letter template for your review. Please let me know if you have any questions.', time: 'May 20 · 10:32 AM' },
      { from: 'client', text: 'We reviewed the engagement letter — looks good overall. One question: can you accommodate a December 31 fiscal year-end for FY2024?', time: 'May 21 · 9:05 AM' },
      { from: 'vendor', text: 'Absolutely — December 31 is our most common fiscal year-end for junior mining clients. We will have full capacity for your FY2024 audit. I\'d suggest we kick off the fieldwork in January 2027. Does that timeline work?', time: 'May 21 · 9:22 AM' },
      { from: 'client', text: 'Perfect. We\'ll review internally and confirm by end of week. Also — can you share your CPAB registration number?', time: 'May 22 · 8:47 AM' },
    ],
  },
  {
    id: 'c2',
    company: 'Tech Issuer B',
    unread: 0,
    lastTime: '1 day ago',
    messages: [
      { from: 'client', text: 'We received your calendar invite for May 28. Looking forward to the call.', time: 'May 17 · 2:30 PM' },
      { from: 'vendor', text: 'Excellent! I\'ll send over a brief agenda beforehand so we can make the most of the time. Talk soon.', time: 'May 17 · 3:15 PM' },
    ],
  },
  {
    id: 'c3',
    company: 'Biotech C',
    unread: 0,
    lastTime: '3 days ago',
    messages: [
      { from: 'vendor', text: 'Following up on our earlier message — happy to provide a detailed scope and fee estimate. What is your anticipated CSE filing date?', time: 'May 12 · 11:00 AM' },
      { from: 'client', text: 'We are targeting Q1 2027. We\'ll circle back once our board approves the budget.', time: 'May 13 · 4:45 PM' },
    ],
  },
]

// ─── Status badge colours ──────────────────────────────────────────────────────

function StatusBadge({ status }: { status: DealRow['status'] }) {
  const map: Record<DealRow['status'], { bg: string; color: string }> = {
    'New Inquiry':   { bg: '#EFF6FF', color: '#1D4ED8' },
    'Responded':     { bg: '#F5F3FF', color: '#6D28D9' },
    'Meeting Booked':{ bg: '#FFFBEB', color: '#B45309' },
    'Engaged':       { bg: '#F0FDF4', color: '#15803D' },
    'Closed Won':    { bg: '#DCFCE7', color: '#166534' },
    'Closed Lost':   { bg: '#F3F4F6', color: '#6B7280' },
  }
  const s = map[status]
  return (
    <span style={{ fontSize: '11px', fontWeight: 700, background: s.bg, color: s.color, padding: '3px 10px', borderRadius: '20px', whiteSpace: 'nowrap' }}>
      {status}
    </span>
  )
}

// ─── Tab nav ──────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'profile',   label: 'My Profile', icon: User },
  { id: 'funnel',    label: 'Deal Funnel', icon: TrendingUp },
  { id: 'messages',  label: 'Messages',   icon: MessageSquare },
  { id: 'motivator', label: 'Motivator',  icon: Zap },
]

// ─── DASHBOARD TAB ─────────────────────────────────────────────────────────────

function DashboardTab() {
  const funnel = [
    { label: 'Inquiries',        value: 12, color: '#1D4ED8' },
    { label: 'Responses Sent',   value: 9,  color: '#6D28D9' },
    { label: 'Meetings Booked',  value: 5,  color: '#B45309' },
    { label: 'Engagements Closed', value: 2, color: '#15803D' },
  ]
  const clients = [
    { company: 'Mining Co. A',  stage: 'Due Diligence',  date: 'May 28, 2026' },
    { company: 'Tech Issuer B', stage: 'Audit Planning', date: 'May 28, 2026' },
    { company: 'Biotech C',     stage: 'Legal Review',   date: 'Jun 3, 2026'  },
  ]
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
    >

      {/* Deal Funnel Flow */}
      <div style={{ background: 'white', border: '1px solid #E5E4E0', borderRadius: '16px', padding: '24px' }}>
        <p style={{ fontSize: '15px', fontWeight: 700, color: '#1A1A1A', marginBottom: '20px' }}>Your Deal Funnel This Month</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto' }}>
          {funnel.map((stage, i) => (
            <div key={stage.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <div style={{ textAlign: 'center', minWidth: '100px' }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '16px', margin: '0 auto 10px',
                  background: stage.color + '15',
                  border: `2px solid ${stage.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: '26px', fontWeight: 800, color: stage.color }}>{stage.value}</span>
                </div>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#1A1A1A' }}>{stage.label}</p>
              </div>
              {i < funnel.length - 1 && (
                <ArrowRight style={{ width: '18px', height: '18px', color: '#C4C2BE', flexShrink: 0 }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Row: Profile Performance + Earnings */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        {/* Profile Performance */}
        <div style={{ background: 'white', border: '1px solid #E5E4E0', borderRadius: '16px', padding: '24px' }}>
          <p style={{ fontSize: '15px', fontWeight: 700, color: '#1A1A1A', marginBottom: '16px' }}>Profile Performance</p>
          {[
            { label: 'Profile views',       value: '847' },
            { label: 'Search appearances',  value: '2,341' },
            { label: 'Response rate',        value: '91%' },
            { label: 'Avg response time',    value: '4h' },
          ].map(row => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', color: '#717171' }}>{row.label}</span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A' }}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* Earnings */}
        <div style={{ background: 'white', border: '1px solid #E5E4E0', borderRadius: '16px', padding: '24px' }}>
          <p style={{ fontSize: '15px', fontWeight: 700, color: '#1A1A1A', marginBottom: '8px' }}>This Month&apos;s Earnings</p>
          <p style={{ fontSize: '28px', fontWeight: 800, color: '#2D7A5F', marginBottom: '4px' }}>CA$8,200</p>
          <p style={{ fontSize: '13px', color: '#717171', marginBottom: '16px' }}>from 2 engagements</p>
          <div style={{ height: '1px', background: '#E5E4E0', marginBottom: '16px' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '13px', color: '#717171' }}>YTD Total</span>
            <span style={{ fontSize: '16px', fontWeight: 800, color: '#1A1A1A' }}>CA$28,400</span>
          </div>
          {/* Top Performer badge */}
          <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award style={{ width: '16px', height: '16px', color: '#B45309', flexShrink: 0 }} />
            <p style={{ fontSize: '12px', fontWeight: 600, color: '#B45309' }}>IPOReady Top Performer — Top 15% of vendors this month</p>
          </div>
        </div>
      </div>

      {/* Upcoming Client Activity */}
      <div style={{ background: 'white', border: '1px solid #E5E4E0', borderRadius: '16px', padding: '24px' }}>
        <p style={{ fontSize: '15px', fontWeight: 700, color: '#1A1A1A', marginBottom: '16px' }}>Upcoming Client Activity</p>
        {clients.map((c, i) => (
          <div key={c.company} style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: i < clients.length - 1 ? '14px' : '0', marginBottom: i < clients.length - 1 ? '14px' : '0', borderBottom: i < clients.length - 1 ? '1px solid #F0EFED' : 'none' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#F7F6F4', border: '1px solid #E5E4E0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FileText style={{ width: '18px', height: '18px', color: '#9A9A9A' }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A1A' }}>{c.company}</p>
              <p style={{ fontSize: '12px', color: '#717171' }}>{c.stage}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, color: '#1A1A1A' }}>{c.date}</p>
              <p style={{ fontSize: '11px', color: '#9A9A9A' }}>Next milestone</p>
            </div>
          </div>
        ))}
      </div>

    </motion.div>
  )
}

// ─── MY PROFILE TAB ───────────────────────────────────────────────────────────

function ProfileTab() {
  const [editing, setEditing] = useState(false)
  const [featured, setFeatured] = useState(true)
  const [bio, setBio] = useState('Sarah Chen is a Senior Partner at Collins & Chen Advisory with over 14 years of experience in public company audit, financial reporting, and IPO readiness. She specializes in junior resource and technology issuers targeting the TSXV and CSE. Sarah has led audit engagements for over 40 public company listings and is a CPAB-registered practitioner and Chartered Business Valuator.')
  const specialtyOptions = ['TSXV', 'TSX', 'CSE', 'NASDAQ', 'Mining', 'Tech', 'Biotech', 'Cannabis']
  const [specialties, setSpecialties] = useState(['TSXV', 'CSE', 'Mining', 'Tech'])

  function toggleSpecialty(s: string) {
    setSpecialties(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '24px', alignItems: 'start' }}
    >

      {/* Left: Preview card */}
      <div style={{ background: 'white', border: '1px solid #E5E4E0', borderRadius: '16px', padding: '28px' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, color: '#9A9A9A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '20px' }}>How Clients See You</p>

        {/* Avatar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 800, color: 'white', marginBottom: '12px' }}>
            SC
          </div>
          <p style={{ fontSize: '16px', fontWeight: 800, color: '#1A1A1A', marginBottom: '2px' }}>Sarah Chen</p>
          <p style={{ fontSize: '13px', color: '#717171', marginBottom: '12px' }}>Senior Partner · Collins & Chen Advisory</p>

          {/* Credentials badges */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {['CPA', 'CA', 'CBCA'].map(c => (
              <span key={c} style={{ fontSize: '11px', fontWeight: 700, background: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0', padding: '3px 8px', borderRadius: '6px' }}>{c}</span>
            ))}
          </div>

          {/* IPOReady Verified badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '20px', padding: '5px 12px', marginBottom: '14px' }}>
            <Award style={{ width: '14px', height: '14px', color: '#B45309' }} />
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#B45309' }}>IPOReady Verified Expert</span>
          </div>
        </div>

        {/* Specialties */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
          {specialties.map(s => (
            <span key={s} style={{ fontSize: '11px', fontWeight: 600, background: '#F7F6F4', border: '1px solid #E5E4E0', color: '#717171', padding: '3px 10px', borderRadius: '20px' }}>{s}</span>
          ))}
        </div>

        {/* Bio excerpt */}
        <p style={{ fontSize: '12px', color: '#717171', lineHeight: 1.6, marginBottom: '16px' }}>
          {bio.slice(0, 160)}...
        </p>

        {/* Rating */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {[1,2,3,4,5].map(i => (
            <Star key={i} style={{ width: '14px', height: '14px', color: '#F59E0B', fill: '#F59E0B' }} />
          ))}
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A1A' }}>4.9</span>
          <span style={{ fontSize: '12px', color: '#9A9A9A' }}>(23 reviews)</span>
        </div>
      </div>

      {/* Right: Edit section */}
      <div style={{ background: 'white', border: '1px solid #E5E4E0', borderRadius: '16px', padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <p style={{ fontSize: '15px', fontWeight: 700, color: '#1A1A1A' }}>Profile Settings</p>
            <p style={{ fontSize: '13px', color: '#9A9A9A' }}>Keep your profile up to date to attract the best mandates.</p>
          </div>
          <button
            onClick={() => setEditing(v => !v)}
            style={{ padding: '8px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', background: editing ? '#1A1A1A' : '#F7F6F4', color: editing ? 'white' : '#1A1A1A', border: '1px solid #E5E4E0', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {editing ? <><CheckCircle2 style={{ width: '14px', height: '14px' }} /> Save Profile</> : <><User style={{ width: '14px', height: '14px' }} /> Edit Profile</>}
          </button>
        </div>

        {/* Bio */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A' }}>Bio</label>
            <span style={{ fontSize: '11px', color: bio.split(' ').length > 240 ? '#E8312A' : '#9A9A9A' }}>
              {bio.split(' ').length} / 250 words
            </span>
          </div>
          {editing ? (
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #1A1A1A', fontSize: '13px', color: '#1A1A1A', lineHeight: 1.6, minHeight: '120px', resize: 'vertical', outline: 'none', background: '#FAFAFA', boxSizing: 'border-box' }}
            />
          ) : (
            <div style={{ padding: '12px', borderRadius: '10px', border: '1px solid #E5E4E0', background: '#F7F6F4', fontSize: '13px', color: '#717171', lineHeight: 1.6 }}>
              {bio}
            </div>
          )}
        </div>

        {/* Specialties */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A', display: 'block', marginBottom: '10px' }}>Specialties</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {specialtyOptions.map(s => {
              const selected = specialties.includes(s)
              return (
                <button
                  key={s}
                  onClick={() => editing && toggleSpecialty(s)}
                  style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, cursor: editing ? 'pointer' : 'default', border: selected ? '2px solid #1A1A1A' : '1px solid #E5E4E0', background: selected ? '#1A1A1A' : '#F7F6F4', color: selected ? 'white' : '#717171' }}
                >
                  {s}
                </button>
              )
            })}
          </div>
        </div>

        {/* Credentials */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A', display: 'block', marginBottom: '10px' }}>Credentials & Documents</label>
          {['Engagement_Letter_Template.pdf', 'Fee_Schedule_2026.pdf'].map(file => (
            <div key={file} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E5E4E0', background: '#F7F6F4', marginBottom: '8px' }}>
              <FileText style={{ width: '16px', height: '16px', color: '#2D7A5F', flexShrink: 0 }} />
              <span style={{ fontSize: '13px', color: '#1A1A1A', flex: 1 }}>{file}</span>
              <CheckCircle2 style={{ width: '14px', height: '14px', color: '#2D7A5F', flexShrink: 0 }} />
            </div>
          ))}
        </div>

        {/* Featured placement toggle */}
        <div style={{ marginBottom: '24px', padding: '16px', borderRadius: '12px', border: '1px solid #E5E4E0', background: '#F7F6F4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A1A' }}>Featured Banner Placement</p>
            <p style={{ fontSize: '12px', color: '#717171' }}>CA$800/month — your profile appears at the top of search results</p>
          </div>
          <button onClick={() => editing && setFeatured(v => !v)} style={{ background: 'none', border: 'none', cursor: editing ? 'pointer' : 'default', padding: 0 }}>
            {featured
              ? <ToggleRight style={{ width: '36px', height: '36px', color: '#2D7A5F' }} />
              : <ToggleLeft style={{ width: '36px', height: '36px', color: '#C4C2BE' }} />}
          </button>
        </div>

        {/* Badge download */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '12px', border: '1px solid #FDE68A', background: '#FFFBEB' }}>
          <Award style={{ width: '20px', height: '20px', color: '#B45309', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#B45309' }}>IPOReady Verified Expert Badge</p>
            <p style={{ fontSize: '12px', color: '#92400E' }}>Download for your website, LinkedIn, and marketing materials.</p>
          </div>
          <button style={{ padding: '7px 14px', borderRadius: '8px', background: '#B45309', color: 'white', fontSize: '12px', fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Download style={{ width: '13px', height: '13px' }} /> Download
          </button>
        </div>
      </div>

    </motion.div>
  )
}

// ─── DEAL FUNNEL TAB ──────────────────────────────────────────────────────────

function FunnelTab() {
  const [selected, setSelected] = useState<DealRow | null>(null)
  const [response, setResponse] = useState('')

  function openDeal(deal: DealRow) {
    setSelected(deal)
    setResponse(deal.response)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{ position: 'relative' }}
    >
      <div style={{ background: 'white', border: '1px solid #E5E4E0', borderRadius: '16px', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E4E0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '15px', fontWeight: 700, color: '#1A1A1A' }}>All Inquiries</p>
            <p style={{ fontSize: '13px', color: '#9A9A9A' }}>{DEALS.length} total inquiries · FY 2026</p>
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '10px', background: '#1A1A1A', color: 'white', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
            <Download style={{ width: '14px', height: '14px' }} /> Download Deal Report
          </button>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F7F6F4' }}>
                {['Company', 'Date', 'Category', 'Status', 'Action'].map(h => (
                  <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#9A9A9A', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DEALS.map((deal, i) => (
                <tr
                  key={deal.id}
                  onClick={() => openDeal(deal)}
                  style={{ borderBottom: i < DEALS.length - 1 ? '1px solid #F0EFED' : 'none', cursor: 'pointer', transition: 'background 0.12s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#FAFAF9')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '14px 20px', fontSize: '14px', fontWeight: 600, color: '#1A1A1A' }}>{deal.company}</td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: '#717171', whiteSpace: 'nowrap' }}>{deal.date}</td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: '#717171' }}>{deal.category}</td>
                  <td style={{ padding: '14px 20px' }}><StatusBadge status={deal.status} /></td>
                  <td style={{ padding: '14px 20px' }}>
                    <button style={{ fontSize: '12px', fontWeight: 600, color: '#1A1A1A', background: '#F7F6F4', border: '1px solid #E5E4E0', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer' }}>
                      Open
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side panel */}
      <AnimatePresence>
        {selected && (
          <>
            {/* Backdrop */}
            <motion.div
              key="funnel-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.3)' }}
            />
            {/* Panel */}
            <motion.div
              key="funnel-panel"
              initial={{ x: 380 }}
              animate={{ x: 0 }}
              exit={{ x: 380 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              style={{
                position: 'fixed', top: 0, right: 0, bottom: 0, width: '360px',
                background: 'white', boxShadow: '-4px 0 32px rgba(0,0,0,0.12)',
                zIndex: 50, display: 'flex', flexDirection: 'column', overflowY: 'auto',
              }}
            >
              {/* Panel header */}
              <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #E5E4E0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <div>
                  <p style={{ fontSize: '16px', fontWeight: 700, color: '#1A1A1A' }}>{selected.company}</p>
                  <StatusBadge status={selected.status} />
                </div>
                <button onClick={() => setSelected(null)} style={{ background: '#F7F6F4', border: '1px solid #E5E4E0', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#717171', flexShrink: 0 }}>
                  <X style={{ width: '14px', height: '14px' }} />
                </button>
              </div>

              <div style={{ padding: '20px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>

                {/* Company brief */}
                <div style={{ padding: '14px', borderRadius: '12px', background: '#F7F6F4', border: '1px solid #E5E4E0' }}>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: '#9A9A9A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Company Brief</p>
                  <p style={{ fontSize: '13px', color: '#717171', lineHeight: 1.6 }}>{selected.brief}</p>
                </div>

                {/* Their inquiry */}
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: '#9A9A9A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Their Inquiry</p>
                  <div style={{ padding: '12px', borderRadius: '10px', background: '#EFF6FF', border: '1px solid #BFDBFE', fontSize: '13px', color: '#1E40AF', lineHeight: 1.6 }}>
                    {selected.inquiry}
                  </div>
                </div>

                {/* Your response */}
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: '#9A9A9A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Your Response</p>
                  <textarea
                    value={response}
                    onChange={e => setResponse(e.target.value)}
                    placeholder="Write your response..."
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #E5E4E0', fontSize: '13px', color: '#1A1A1A', lineHeight: 1.6, minHeight: '100px', resize: 'vertical', outline: 'none', background: 'white', boxSizing: 'border-box' }}
                  />
                </div>

                {/* Timeline */}
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: '#9A9A9A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Contact Timeline</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selected.timeline.map((event, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: i === 0 ? '#2D7A5F' : '#C4C2BE', marginTop: '5px', flexShrink: 0 }} />
                        <p style={{ fontSize: '12px', color: '#717171', lineHeight: 1.5 }}>{event}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button style={{ padding: '10px', borderRadius: '10px', background: '#2D7A5F', color: 'white', fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                    Mark as Engaged
                  </button>
                  <button style={{ padding: '10px', borderRadius: '10px', background: '#166534', color: 'white', fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                    Close Won
                  </button>
                  <button style={{ padding: '10px', borderRadius: '10px', background: '#F7F6F4', color: '#717171', fontSize: '13px', fontWeight: 600, border: '1px solid #E5E4E0', cursor: 'pointer' }}>
                    Archive
                  </button>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── MESSAGES TAB ─────────────────────────────────────────────────────────────

function MessagesTab() {
  const [activeConv, setActiveConv] = useState<string>('c1')
  const [compose, setCompose] = useState('')
  const conv = CONVERSATIONS.find(c => c.id === activeConv)!

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{ display: 'flex', gap: '0', background: 'white', border: '1px solid #E5E4E0', borderRadius: '16px', overflow: 'hidden', height: '600px' }}
    >

      {/* Left panel — conversation list */}
      <div style={{ width: '260px', flexShrink: 0, borderRight: '1px solid #E5E4E0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E4E0' }}>
          <p style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A' }}>Messages</p>
          <p style={{ fontSize: '11px', color: '#9A9A9A', marginTop: '2px' }}>All messages archived per securities best practices</p>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {CONVERSATIONS.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveConv(c.id)}
              style={{ width: '100%', padding: '14px 20px', textAlign: 'left', background: activeConv === c.id ? '#F7F6F4' : 'transparent', borderBottom: '1px solid #F0EFED', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer', display: 'block' }}
              onMouseEnter={e => activeConv !== c.id && (e.currentTarget.style.background = '#FAFAF9')}
              onMouseLeave={e => activeConv !== c.id && (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A1A' }}>{c.company}</span>
                <span style={{ fontSize: '11px', color: '#9A9A9A' }}>{c.lastTime}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: '#9A9A9A' }}>{c.messages[c.messages.length - 1]?.text.slice(0, 35)}...</span>
                {c.unread > 0 && (
                  <span style={{ fontSize: '10px', fontWeight: 700, background: '#E8312A', color: 'white', borderRadius: '20px', padding: '2px 7px', flexShrink: 0 }}>{c.unread}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right panel — thread */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Thread header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E4E0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: 'white', flexShrink: 0 }}>
            {conv.company.slice(0, 1)}
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A' }}>{conv.company}</p>
            <p style={{ fontSize: '11px', color: '#9A9A9A' }}>All messages are logged and archived per securities industry best practices</p>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {conv.messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: msg.from === 'vendor' ? 'flex-end' : 'flex-start' }}>
              <div style={{ maxWidth: '75%' }}>
                <div style={{ padding: '10px 14px', borderRadius: msg.from === 'vendor' ? '12px 12px 2px 12px' : '12px 12px 12px 2px', background: msg.from === 'vendor' ? '#1A1A1A' : '#F7F6F4', border: msg.from === 'vendor' ? 'none' : '1px solid #E5E4E0' }}>
                  <p style={{ fontSize: '13px', color: msg.from === 'vendor' ? 'white' : '#1A1A1A', lineHeight: 1.5 }}>{msg.text}</p>
                </div>
                <p style={{ fontSize: '10px', color: '#C4C2BE', marginTop: '4px', textAlign: msg.from === 'vendor' ? 'right' : 'left' }}>{msg.time}</p>
              </div>
            </div>
          ))}
        </div>

        {/* File attachment chip */}
        {activeConv === 'c1' && (
          <div style={{ padding: '0 20px 8px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '8px', background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
              <Paperclip style={{ width: '13px', height: '13px', color: '#2D7A5F' }} />
              <span style={{ fontSize: '12px', color: '#15803D', fontWeight: 500 }}>Due_Diligence_Checklist_v2.pdf · 284 KB</span>
            </div>
          </div>
        )}

        {/* Compose */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #E5E4E0', display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
          <textarea
            value={compose}
            onChange={e => setCompose(e.target.value)}
            placeholder="Type a message..."
            style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1px solid #E5E4E0', fontSize: '13px', color: '#1A1A1A', resize: 'none', outline: 'none', lineHeight: 1.5, minHeight: '44px', maxHeight: '120px', background: '#F7F6F4' }}
            rows={1}
          />
          <button style={{ padding: '10px 16px', borderRadius: '10px', background: '#1A1A1A', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, flexShrink: 0 }}>
            <Send style={{ width: '14px', height: '14px' }} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ─── MOTIVATOR TAB ───────────────────────────────────────────────────────────

function MotivatorTab() {
  const [emailExpanded, setEmailExpanded] = useState(false)
  const [flagInput, setFlagInput] = useState('')
  const [flagged, setFlagged] = useState(false)

  const reviewLinks = [
    { platform: 'Google', icon: '🔍', href: '#' },
    { platform: 'G2',     icon: '⭐', href: '#' },
    { platform: 'Capterra', icon: '📋', href: '#' },
    { platform: 'LinkedIn', icon: '💼', href: '#' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
    >

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)', borderRadius: '16px', padding: '28px', color: 'white' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, color: '#9A9A9A', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Your Monthly Performance Report</p>
        <p style={{ fontSize: '22px', fontWeight: 800, marginBottom: '6px' }}>Here&apos;s why you should update your profile and stay active this month</p>
        <p style={{ fontSize: '13px', color: '#9A9A9A' }}>May 2026 · Sarah Chen, CPA, CA</p>
      </div>

      {/* Platform stats */}
      <div style={{ background: 'white', border: '1px solid #E5E4E0', borderRadius: '16px', padding: '24px' }}>
        <p style={{ fontSize: '15px', fontWeight: 700, color: '#1A1A1A', marginBottom: '16px' }}>Platform Activity This Month</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[
            { label: 'New TSXV companies joined', value: '8' },
            { label: 'In your specialty (Mining + Tech)', value: '5' },
            { label: 'Average deal value for your tier', value: 'CA$42,000' },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: 'center', padding: '16px', borderRadius: '12px', background: '#F7F6F4', border: '1px solid #E5E4E0' }}>
              <p style={{ fontSize: '24px', fontWeight: 800, color: '#2D7A5F', marginBottom: '4px' }}>{stat.value}</p>
              <p style={{ fontSize: '12px', color: '#717171', lineHeight: 1.4 }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Earnings potential calculator */}
      <div style={{ background: 'white', border: '1px solid #E5E4E0', borderRadius: '16px', padding: '24px' }}>
        <p style={{ fontSize: '15px', fontWeight: 700, color: '#1A1A1A', marginBottom: '16px' }}>Earnings Potential Calculator</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {[
            { icon: '📊', text: 'You closed 2 mandates via IPOReady in the last 6 months' },
            { icon: '💡', text: 'At your current conversion rate (2/9 inquiries → mandate), closing 1 additional mandate = CA$42,000 in fees' },
            { icon: '📈', text: 'Boosting your response rate from 91% → 98% could add 2 more meetings/month' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px', borderRadius: '12px', background: '#F7F6F4', border: '1px solid #E5E4E0' }}>
              <span style={{ fontSize: '20px', flexShrink: 0 }}>{item.icon}</span>
              <p style={{ fontSize: '13px', color: '#717171', lineHeight: 1.6 }}>{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Boost Your Rating */}
      <div style={{ background: 'white', border: '1px solid #E5E4E0', borderRadius: '16px', padding: '24px' }}>
        <p style={{ fontSize: '15px', fontWeight: 700, color: '#1A1A1A', marginBottom: '6px' }}>Boost Your Rating</p>
        <p style={{ fontSize: '13px', color: '#9A9A9A', marginBottom: '16px' }}>Ask happy clients to leave a review. Every review builds trust with new prospects.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {reviewLinks.map(r => (
            <a
              key={r.platform}
              href={r.href}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E5E4E0', background: '#F7F6F4', textDecoration: 'none', transition: 'border-color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#1A1A1A')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#E5E4E0')}
            >
              <span style={{ fontSize: '20px' }}>{r.icon}</span>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A' }}>{r.platform}</p>
                <p style={{ fontSize: '11px', color: '#9A9A9A' }}>Leave a Review →</p>
              </div>
              <ExternalLink style={{ width: '13px', height: '13px', color: '#C4C2BE', marginLeft: 'auto' }} />
            </a>
          ))}
        </div>
      </div>

      {/* Warm Intro Program */}
      <div style={{ background: 'white', border: '1px solid #E5E4E0', borderRadius: '16px', padding: '24px' }}>
        <p style={{ fontSize: '15px', fontWeight: 700, color: '#1A1A1A', marginBottom: '6px' }}>Warm Intro Program</p>
        <p style={{ fontSize: '13px', color: '#717171', lineHeight: 1.6, marginBottom: '16px' }}>
          Flag companies in your network that may be listing-ready. IPOReady sends a co-branded introduction email on your behalf.
        </p>
        {flagged ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '10px', background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
            <CheckCircle2 style={{ width: '16px', height: '16px', color: '#2D7A5F' }} />
            <p style={{ fontSize: '13px', color: '#15803D', fontWeight: 600 }}>Company flagged! IPOReady will send a co-branded intro within 24 hours.</p>
          </motion.div>
        ) : (
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              value={flagInput}
              onChange={e => setFlagInput(e.target.value)}
              placeholder="Company name or website..."
              style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1px solid #E5E4E0', fontSize: '13px', color: '#1A1A1A', outline: 'none', background: '#F7F6F4' }}
            />
            <button
              onClick={() => flagInput.trim() && setFlagged(true)}
              style={{ padding: '10px 18px', borderRadius: '10px', background: '#1A1A1A', color: 'white', fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Flag a Company
            </button>
          </div>
        )}
      </div>

      {/* Monthly email preview */}
      <div style={{ background: 'white', border: '1px solid #E5E4E0', borderRadius: '16px', overflow: 'hidden' }}>
        <button
          onClick={() => setEmailExpanded(v => !v)}
          style={{ width: '100%', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MessageSquare style={{ width: '18px', height: '18px', color: '#717171' }} />
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A' }}>Monthly Motivator Email Preview</p>
              <p style={{ fontSize: '12px', color: '#9A9A9A' }}>What IPOReady sends you each month — click to preview</p>
            </div>
          </div>
          {emailExpanded
            ? <ChevronUp style={{ width: '18px', height: '18px', color: '#9A9A9A' }} />
            : <ChevronDown style={{ width: '18px', height: '18px', color: '#9A9A9A' }} />}
        </button>

        <AnimatePresence>
          {emailExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden' }}
            >
              {/* Simulated email card */}
              <div style={{ margin: '0 24px 24px', borderRadius: '12px', border: '1px solid #E5E4E0', overflow: 'hidden', fontFamily: 'Georgia, serif' }}>
                {/* Email header bar */}
                <div style={{ background: '#1A1A1A', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, color: '#1A1A1A' }}>IP</div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: 'white' }}>IPOReady · Monthly Vendor Motivator</p>
                    <p style={{ fontSize: '11px', color: '#9A9A9A' }}>vendors@ipoready.co → sarah.chen@collinschen.ca</p>
                  </div>
                </div>
                {/* Email body */}
                <div style={{ padding: '24px 24px 20px', background: '#FAFAF9' }}>
                  <p style={{ fontSize: '16px', fontWeight: 700, color: '#1A1A1A', marginBottom: '10px' }}>Hi Sarah,</p>
                  <p style={{ fontSize: '13px', color: '#717171', lineHeight: 1.7, marginBottom: '14px' }}>
                    Here&apos;s your IPOReady performance snapshot for May 2026. Your profile received <strong style={{ color: '#1A1A1A' }}>847 views</strong> this month — up 12% from April.
                  </p>
                  <p style={{ fontSize: '13px', color: '#717171', lineHeight: 1.7, marginBottom: '14px' }}>
                    <strong style={{ color: '#1A1A1A' }}>5 new TSXV companies</strong> in your specialty (Mining + Tech) joined the platform this month. Based on your conversion rate, responding to all 12 inquiries could generate <strong style={{ color: '#2D7A5F' }}>CA$84,000+ in potential fees</strong>.
                  </p>
                  <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px' }}>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: '#15803D', marginBottom: '4px' }}>Top Performer — Top 15% this month</p>
                    <p style={{ fontSize: '12px', color: '#717171' }}>You&apos;re in the top tier of IPOReady vendor partners. Keep your profile fresh to stay there.</p>
                  </div>
                  <p style={{ fontSize: '12px', color: '#9A9A9A', borderTop: '1px solid #E5E4E0', paddingTop: '12px', lineHeight: 1.5 }}>
                    © 2026 IPOReady · Collins & Chen Advisory · <a href="#" style={{ color: '#E8312A', textDecoration: 'none' }}>Unsubscribe</a>
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </motion.div>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function VendorPage() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

      {/* Header banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ background: '#1A1A1A', borderRadius: '20px', padding: '28px 32px', marginBottom: '24px', color: 'white' }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'white', margin: 0 }}>Vendor Partner Portal</h1>
              <span style={{ fontSize: '11px', fontWeight: 700, background: '#2D7A5F', color: 'white', padding: '3px 10px', borderRadius: '20px', letterSpacing: '0.05em' }}>
                Verified Expert
              </span>
            </div>
            <p style={{ fontSize: '16px', fontWeight: 600, color: '#E5E4E0', marginBottom: '2px' }}>Sarah Chen, CPA, CA</p>
            <p style={{ fontSize: '13px', color: '#9A9A9A' }}>Senior Partner · Collins & Chen Advisory</p>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {[
              { label: 'Inquiries This Month', value: '12' },
              { label: 'Profile Views',        value: '847' },
              { label: 'Active Engagements',   value: '3' },
              { label: 'Revenue via IPOReady', value: 'CA$28,400' },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '22px', fontWeight: 800, color: 'white', lineHeight: 1 }}>{stat.value}</p>
                <p style={{ fontSize: '11px', color: '#9A9A9A', marginTop: '4px' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Tab nav */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: 'white', border: '1px solid #E5E4E0', borderRadius: '14px', padding: '4px' }}>
        {TABS.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '9px 12px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: isActive ? 700 : 500, background: isActive ? '#1A1A1A' : 'transparent', color: isActive ? 'white' : '#717171', transition: 'all 0.15s' }}
              onMouseEnter={e => !isActive && (e.currentTarget.style.background = '#F7F6F4', e.currentTarget.style.color = '#1A1A1A')}
              onMouseLeave={e => !isActive && (e.currentTarget.style.background = 'transparent', e.currentTarget.style.color = '#717171')}
            >
              <Icon style={{ width: '15px', height: '15px', flexShrink: 0 }} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' && <DashboardTab key="dashboard" />}
        {activeTab === 'profile'   && <ProfileTab   key="profile"   />}
        {activeTab === 'funnel'    && <FunnelTab     key="funnel"    />}
        {activeTab === 'messages'  && <MessagesTab   key="messages"  />}
        {activeTab === 'motivator' && <MotivatorTab  key="motivator" />}
      </AnimatePresence>

    </div>
  )
}
