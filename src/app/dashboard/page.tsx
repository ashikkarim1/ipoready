'use client'
import { motion, AnimatePresence } from 'framer-motion'
import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import {
  TrendingUp, CheckCircle2, Clock, Zap,
  Trophy, Star, Target, Bell, FileText, Users,
  ArrowRight, Award, Flame, Globe, ExternalLink, Mail, X,
  AlertOctagon, Send, BarChart2, ChevronRight, Edit3, Sparkles,
  HelpCircle, Info, Activity
} from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import { PHASE_LABELS, PHASE_ORDER } from '@/lib/utils'
import { Phase } from '@/types'
import Link from 'next/link'
import { ReadinessFactorsCard } from '@/components/ReadinessFactorsCard'
import { SequencingAlertsCard } from '@/components/SequencingAlertsCard'
import { TrialCountdownBanner } from '@/components/TrialCountdownBanner'

const DEMO_TASKS_SUMMARY = {
  total: 48, completed: 11, inProgress: 5, blocked: 1, notStarted: 31,
}

const DEMO_PHASE_DATA = [
  { phase: 'pre_planning' as Phase,             total: 6,  completed: 6, percentage: 100 },
  { phase: 'corporate_restructuring' as Phase,  total: 7,  completed: 3, percentage: 43  },
  { phase: 'financial_audit' as Phase,          total: 5,  completed: 0, percentage: 0   },
  { phase: 'legal_documentation' as Phase,      total: 5,  completed: 0, percentage: 0   },
  { phase: 'regulatory_filing' as Phase,        total: 5,  completed: 0, percentage: 0   },
  { phase: 'marketing_roadshow' as Phase,       total: 3,  completed: 0, percentage: 0   },
  { phase: 'listing_application' as Phase,      total: 3,  completed: 0, percentage: 0   },
  { phase: 'post_listing' as Phase,             total: 3,  completed: 0, percentage: 0   },
]

const MILESTONES = [
  { title: 'Pre-Planning Complete',       icon: '🎯',  xp: 500,  earned: true,  date: '2025-04-10' },
  { title: 'Advisors Assembled',          icon: '🤝',  xp: 250,  earned: true,  date: '2025-04-18' },
  { title: 'Auditors Engaged',            icon: '📊',  xp: 300,  earned: true,  date: '2025-05-01' },
  { title: 'PIFs Submitted',              icon: '📋',  xp: 400,  earned: false, date: null },
  { title: 'Governance Policies Adopted', icon: '🏛️',  xp: 350,  earned: false, date: null },
  { title: 'Phase 2 Complete',            icon: '⚡',  xp: 750,  earned: false, date: null },
  { title: 'Prospectus Drafted',          icon: '📄',  xp: 1000, earned: false, date: null },
  { title: 'Final Receipt Obtained',      icon: '🎫',  xp: 2000, earned: false, date: null },
  { title: '🚀 LISTED!',                  icon: '🚀',  xp: 5000, earned: false, date: null },
]

const UPCOMING_TASKS = [
  { title: 'Complete PIF forms — 3 directors',  priority: 'critical', dueIn: 7,  phase: 'Corporate Restructuring' },
  { title: 'Adopt Audit Committee Charter',      priority: 'critical', dueIn: 14, phase: 'Corporate Restructuring' },
  { title: 'Establish ESOP / Stock Option Plan', priority: 'high',     dueIn: 21, phase: 'Corporate Restructuring' },
  { title: 'Begin pre-audit with auditus.ai',    priority: 'high',     dueIn: 30, phase: 'Financial Audit'         },
  { title: 'Finalize governance policies',       priority: 'high',     dueIn: 21, phase: 'Corporate Restructuring' },
]

// ─── Aging Report Data ────────────────────────────────────────────────────────

interface AgingItem {
  id: string
  title: string
  owner: string
  ownerEmail: string
  ownerRole: string
  phase: string
  priority: 'critical' | 'high'
  daysOpen: number
  dueDate: string
  daysOverdue: number   // positive = overdue by N days, negative = N days remaining
  status: 'overdue' | 'at_risk' | 'in_progress'
  category: string
  whatToDo: string
  blockers?: string
  reference?: string
}

const AGING_ITEMS: AgingItem[] = [
  {
    id: 'a1',
    title: 'Complete PIF Forms — 3 Directors',
    owner: 'Marc Leblanc',
    ownerEmail: 'marc@techcorp.com',
    ownerRole: 'Co-Founder / COO',
    phase: 'Corporate Restructuring',
    priority: 'critical',
    daysOpen: 18,
    dueDate: '2026-05-29',
    daysOverdue: -7,
    status: 'at_risk',
    category: 'Governance',
    whatToDo: `1. Download TSXV Form 2A (Personal Information Form) from tsx.com for each of the 3 directors.\n2. For each director: collect full residential history for the past 10 years (addresses, dates).\n3. Obtain written consent for criminal background check from each director.\n4. List all current and former directorships / officer positions held in the past 5 years.\n5. Have securities counsel review all completed forms before submission.\n6. Submit to TSXV Exchange Services at least 10 business days before the listing application.\n\nForms are required under TSXV Policy 3.3 and failure to file on time is a common cause of listing delays.`,
    blockers: 'Residential history outstanding from Director #2 (David Park)',
    reference: 'TSXV Policy 3.3 — Form 2A',
  },
  {
    id: 'a2',
    title: 'Adopt Audit Committee Charter',
    owner: 'Sarah Chen',
    ownerEmail: 'sarah@techcorp.com',
    ownerRole: 'CEO & Co-Founder',
    phase: 'Corporate Restructuring',
    priority: 'critical',
    daysOpen: 31,
    dueDate: '2026-06-05',
    daysOverdue: -14,
    status: 'at_risk',
    category: 'Governance',
    whatToDo: `1. Obtain a draft Audit Committee Charter from securities counsel — must comply with NI 52-110.\n2. Customize the charter: confirm committee composition (minimum 3 directors), mandate, meeting frequency (at least quarterly), financial literacy requirements.\n3. Confirm at least 1 member qualifies as an Audit Committee Financial Expert (ACFE) — CPA designation or equivalent financial management experience.\n4. Table the charter at the next board meeting with a formal resolution adopting it.\n5. Retain signed minutes and the charter in the corporate record book.\n6. Disclose the charter as an exhibit in your next Annual Information Form and on SEDAR+.\n\nThis is mandatory for TSXV listing under NI 52-110. Without it, your listing application will be incomplete.`,
    blockers: 'Pending appointment of third independent director',
    reference: 'NI 52-110 — Audit Committees',
  },
  {
    id: 'a3',
    title: 'File SEDI Insider Registration — 4 Officers',
    owner: 'Elena Vasquez',
    ownerEmail: 'elena@techcorp.com',
    ownerRole: 'CFO',
    phase: 'Corporate Restructuring',
    priority: 'critical',
    daysOpen: 47,
    dueDate: '2026-05-20',
    daysOverdue: 2,
    status: 'overdue',
    category: 'Regulatory',
    whatToDo: `OVERDUE — Immediate action required. Failure to register may constitute a securities violation.\n\n1. Go to sedi.ca and register your company as a SEDI issuer (issuer registration must happen first).\n2. Create individual SEDI accounts for each of the 4 officers: CEO, CFO, COO, General Counsel.\n3. Each insider must file an "Initial Insider Report" within 10 days of becoming an insider, disclosing ALL securities held: common shares, options, warrants, convertible notes, RSUs.\n4. For each security: report quantity, date acquired, and transaction price.\n5. Set calendar reminders — any change in holdings (buy, sell, grant, exercise) must be reported within 5 calendar days of the transaction.\n6. Brief all insiders on blackout period obligations and the Insider Trading Policy once adopted.\n\nReference the company's insider list from the cap table module to ensure no officer is missed.`,
    blockers: 'Company SEDI issuer registration still pending — blocking all officer registrations',
    reference: 'NI 55-104 — Insider Reporting Requirements',
  },
  {
    id: 'a4',
    title: 'Establish ESOP / Stock Option Plan',
    owner: 'Sarah Chen',
    ownerEmail: 'sarah@techcorp.com',
    ownerRole: 'CEO & Co-Founder',
    phase: 'Corporate Restructuring',
    priority: 'critical',
    daysOpen: 12,
    dueDate: '2026-06-12',
    daysOverdue: -21,
    status: 'in_progress',
    category: 'Compensation',
    whatToDo: `1. Engage legal counsel to draft the ESOP — must comply with TSXV Policy 4.4.\n2. Define the plan reserve: TSXV typically limits the plan to 10% of issued and outstanding shares at grant date.\n3. Set exercise price rules: options must be priced at no less than the market price on the date of grant.\n4. Define vesting: standard is 25% cliff at 12 months, then monthly or quarterly over the next 36 months.\n5. Include acceleration provisions for change-of-control events (double-trigger is preferred).\n6. Pass a formal board resolution adopting the plan.\n7. If the plan exceeds 10% of issued shares, it requires shareholder approval at the next general meeting.\n8. Register the plan with TSXV before issuing any grants — grants without a registered plan are void.\n9. Establish a grant tracking log: all grants must be reported to TSXV within 10 days of issuance.`,
    blockers: undefined,
    reference: 'TSXV Policy 4.4 — Incentive Stock Options',
  },
  {
    id: 'a5',
    title: 'Engage CPAB-Registered Auditor',
    owner: 'Elena Vasquez',
    ownerEmail: 'elena@techcorp.com',
    ownerRole: 'CFO',
    phase: 'Financial Audit',
    priority: 'critical',
    daysOpen: 55,
    dueDate: '2026-05-20',
    daysOverdue: 2,
    status: 'overdue',
    category: 'Financial',
    whatToDo: `OVERDUE — Without a CPAB-registered auditor formally engaged, you cannot file a final prospectus. This is blocking your IPO timeline.\n\n1. Shortlist 2–3 CPAB-registered audit firms with TSXV IPO experience: MNP LLP, DMCL, BDO Canada, Grant Thornton, or MNP are common for junior issuers.\n2. Issue a formal RFP (Request for Proposal) including: company overview, fiscal year-end (Dec 31), 2-year audit scope (IFRS required), expected timeline, and prospectus-level opinion requirement.\n3. Evaluate proposals on: TSXV IPO experience, CPAB inspection history, timeline availability, and fee structure.\n4. Execute engagement letter — confirms scope, fees, timeline, and independence declarations.\n5. Brief auditors on your pre-audit preparation (use auditus.ai to get ahead).\n6. Confirm auditors can deliver a signed auditor's report within 10–12 weeks to meet prospectus filing date.\n7. Disclose auditor appointment via press release and on SEDAR+ after engagement.`,
    blockers: 'Board budget approval pending for audit fees (~$75K–$120K estimated)',
    reference: 'NI 52-108 — Auditor Oversight',
  },
]

interface DashData {
  company: { id: string; name: string; listingType: string; targetExchange: string; currentPhase: string; paceScore: number; estimatedDaysToIpo: number; progressPercentage: number; currency: string; language: string }
  tasksSummary: { total: number; completed: number; inProgress: number; blocked: number; notStarted: number }
  phaseData: { phase: string; total: number; completed: number; percentage: number }[]
  upcomingTasks: { id: string; phase: string; category: string; title: string; priority: string; estimatedDays: number }[]
  recentActivity: { id: string; title: string; phase: string; completedAt: string }[]
}

interface DashStats {
  totalTasks: number
  completedTasks: number
  overdueTasks: number
  teamMembersCount: number
  documentsCount: number
  prospectusStatus?: string | null
  prospectusCompletion?: number
  prospectusSectionsComplete?: number
  prospectusSectionsTotal?: number
  upcomingDeadlines: { id: string; title: string; phase: string; priority: string; dueDate: string | null }[]
  currentPhase: string | null
  phaseProgress: Record<string, { total: number; completed: number; percentage: number }>
  cashRunway?: number
  hiringProgress?: number
  auditorEngaged?: boolean
  boardSize?: number
  boardIndependentCount?: number
  secondIndependent?: boolean
}

function getAgingStatusStyle(status: AgingItem['status']) {
  if (status === 'overdue')     return { color: 'var(--color-error)', bg: 'var(--color-error-pale)', border: 'var(--color-error-light)', label: 'Overdue' }
  if (status === 'at_risk')     return { color: 'var(--color-warning)', bg: 'var(--color-warning-soft)', border: 'var(--color-warning-medium)', label: 'At Risk' }
  return                               { color: 'var(--color-info)', bg: 'var(--color-info-soft)', border: 'var(--color-info-medium)', label: 'In Progress' }
}

function buildReminderMessage(item: AgingItem, senderCompany = 'IPOReady'): string {
  const statusLabel = item.daysOverdue > 0
    ? `⚠️ OVERDUE by ${item.daysOverdue} day${item.daysOverdue !== 1 ? 's' : ''}`
    : `Due in ${Math.abs(item.daysOverdue)} day${Math.abs(item.daysOverdue) !== 1 ? 's' : ''} (${item.dueDate})`

  const steps = item.whatToDo
  return `Hi ${item.owner.split(' ')[0]},

This is a time-sensitive reminder for a critical IPO readiness task assigned to you.

────────────────────────────────────
TASK:     ${item.title}
PHASE:    ${item.phase}
STATUS:   ${statusLabel}
CATEGORY: ${item.category}
REF:      ${item.reference || 'IPOReady Checklist'}
────────────────────────────────────

WHAT YOU NEED TO DO:
${steps}
${item.blockers ? `\nCURRENT BLOCKER FLAGGED:\n${item.blockers}\n` : ''}
────────────────────────────────────
Please log in to IPOReady to update the status of this task and flag any new blockers. Your IPO advisors and the executive team are tracking this item.

If you have questions or need support, reply to this message or reach out through the IPOReady platform.

Best regards,
IPOReady Mission Control
${senderCompany}`
}

// ─────────────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { company, notifications, markNotificationRead } = useAppStore()
  const { data: session, status: sessionStatus } = useSession()
  const [dashData, setDashData] = useState<DashData | null>(null)
  const [dashLoading, setDashLoading] = useState(true)
  const [dashStats, setDashStats] = useState<DashStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [paceAnimated, setPaceAnimated] = useState(0)
  const [emailModal, setEmailModal] = useState(false)
  const [emailAddress, setEmailAddress] = useState('')
  const [emailFormat, setEmailFormat] = useState<'html'|'pdf'>('html')
  const [emailSent, setEmailSent] = useState(false)
  const [boardModal, setBoardModal] = useState(false)
  const [boardPeriod, setBoardPeriod] = useState<'7d'|'30d'|'90d'|'inception'>('30d')
  const [boardEmail, setBoardEmail] = useState('')
  const [boardSent, setBoardSent] = useState(false)
  const [sendingReport, setSendingReport] = useState(false)
  const [boardError, setBoardError] = useState<string | null>(null)
  const [agingModal, setAgingModal] = useState<string | null>(null)
  const [agingMessageEdit, setAgingMessageEdit] = useState('')
  const [agingEditing, setAgingEditing] = useState(false)
  const [agingReminderSent, setAgingReminderSent] = useState<Set<string>>(new Set())
  const [showPaceModal, setShowPaceModal] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Hydration safety: prevent hydration mismatches
  useEffect(() => {
    setIsMounted(true)
  }, [])

  async function handleSendBoardReport() {
    setSendingReport(true)
    setBoardError(null)
    const res = await fetch('/api/ai/board-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipients: boardEmail, period: boardPeriod }),
    })
    const data = await res.json()
    if (res.ok) setBoardSent(true)
    else setBoardError(data.error ?? 'Send failed')
    setSendingReport(false)
  }

  useEffect(() => {
    if (sessionStatus !== 'authenticated') return
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(data => { if (data.company) setDashData(data) })
      .catch(console.error)
      .finally(() => setDashLoading(false))
  }, [sessionStatus])

  useEffect(() => {
    if (sessionStatus !== 'authenticated') return
    fetch('/api/dashboard/stats')
      .then(r => r.json())
      .then(data => { if (!data.error) setDashStats(data) })
      .catch(console.error)
      .finally(() => setStatsLoading(false))
  }, [sessionStatus])

  const effectivePaceScore = dashData?.company.paceScore ?? company?.paceScore ?? 62
  const effectiveDaysToIpo = dashData?.company.estimatedDaysToIpo ?? company?.estimatedDaysToIPO ?? 187
  const effectiveProgress = dashData?.company.progressPercentage ?? company?.progressPercentage ?? 23
  const effectiveName = dashData?.company.name ?? company?.name ?? 'Your Company'

  // Current phase — prefer stats API (freshest), fall back to main dashboard API, then store
  const effectiveCurrentPhase = (dashStats?.currentPhase ?? dashData?.company.currentPhase ?? company?.currentPhase ?? 'corporate_restructuring') as Phase
  const currentPhaseProgress = dashStats?.phaseProgress[effectiveCurrentPhase] ?? dashData?.phaseData.find(p => p.phase === effectiveCurrentPhase) ?? null
  const currentPhasePercentage = currentPhaseProgress?.percentage ?? 0

  useEffect(() => {
    const timeout = setTimeout(() => {
      let v = 0
      const anim = setInterval(() => {
        v += 1.5
        if (v >= effectivePaceScore) { clearInterval(anim); v = effectivePaceScore }
        setPaceAnimated(Math.round(v))
      }, 16)
    }, 300)
    return () => clearTimeout(timeout)
  }, [effectivePaceScore])

  const earnedXP = MILESTONES.filter(m => m.earned).reduce((s, m) => s + m.xp, 0)
  const level = Math.floor(earnedXP / 500) + 1

  // ─── Skeleton loading state ───────────────────────────────────────────────────
  // Show skeleton for: auth loading, unauthenticated, or data loading
  const pageLoading = sessionStatus === 'loading' || sessionStatus === 'unauthenticated' || dashLoading || statsLoading
  if (pageLoading) {
    const shimmerStyle: React.CSSProperties = {
      background: 'linear-gradient(90deg, #E5E4E0 25%, #EDECE8 50%, #E5E4E0 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
      borderRadius: '10px',
    }
    return (
      <>
        <style>{`
          @keyframes shimmer {
            0%   { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          {/* 4 stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{ background: 'var(--color-surface-primary)', borderRadius: '16px', border: '1px solid #E5E4E0', padding: '24px', height: '120px' }}>
                <div style={{ ...shimmerStyle, height: '10px', width: '60%', marginBottom: '16px' }} />
                <div style={{ ...shimmerStyle, height: '28px', width: '80%', marginBottom: '10px' }} />
                <div style={{ ...shimmerStyle, height: '10px', width: '45%' }} />
              </div>
            ))}
          </div>
          {/* Main content + sidebar */}
          <div style={{ display: 'flex', gap: '24px' }}>
            <div style={{ flex: 1, background: 'var(--color-surface-primary)', borderRadius: '16px', border: '1px solid #E5E4E0', padding: '28px', height: '420px' }}>
              <div style={{ ...shimmerStyle, height: '14px', width: '40%', marginBottom: '24px' }} />
              {[0, 1, 2, 3, 4, 5].map(i => (
                <div key={i} style={{ ...shimmerStyle, height: '36px', marginBottom: '12px', borderRadius: '10px' }} />
              ))}
            </div>
            <div style={{ width: '280px', background: 'var(--color-surface-primary)', borderRadius: '16px', border: '1px solid #E5E4E0', padding: '28px', height: '420px', flexShrink: 0 }}>
              <div style={{ ...shimmerStyle, height: '14px', width: '55%', marginBottom: '24px' }} />
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{ ...shimmerStyle, height: '52px', marginBottom: '12px', borderRadius: '10px' }} />
              ))}
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <div style={{ background: '#F7F6F4', minHeight: '100vh', colorScheme: 'light' }} suppressHydrationWarning>
      {company?.trial_status === 'active' && company.trial_end_date && (
        <TrialCountdownBanner
          trialEndDate={new Date(company.trial_end_date)}
          companyName={company.name}
        />
      )}
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 px-4 sm:px-6 lg:px-0">

        {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="serif text-2xl sm:text-3xl text-nav mb-2">Mission Control</h1>
          <p className="text-text-muted text-sm">Your IPO readiness command centre</p>
        </div>
        <div className="flex flex-row gap-2 sm:gap-3 flex-shrink-0">
          <button onClick={() => setBoardModal(true)}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap"
            style={{ background: 'white', border: '1px solid #E5E4E0', color: 'var(--color-text-primary)' }}>
            <Award className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">Board Report</span>
            <span className="sm:hidden">Board</span>
          </button>
          <button onClick={() => setEmailModal(true)}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap"
            style={{ background: 'white', border: '1px solid #E5E4E0', color: 'var(--color-text-primary)' }}>
            <Mail className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">Email Dashboard</span>
            <span className="sm:hidden">Email</span>
          </button>
          <Link href="/checklist" className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap"
            style={{ background: 'var(--color-accent)', color: 'var(--color-text-inverse)', textDecoration: 'none' }}>
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">Open Checklist</span>
            <span className="sm:hidden">Checklist</span>
          </Link>
        </div>
      </div>


      {/* Only render Framer Motion-animated content after hydration to prevent mismatches */}
      {isMounted && (
        <>
      {/* Notifications */}
      {notifications.filter(n => !n.read).length > 0 && (
        <div className="space-y-2">
          {notifications.filter(n => !n.read).map(notif => (
            <motion.div key={notif.id}
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 p-4 rounded-xl card">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: notif.type === 'milestone' ? 'var(--color-warning-soft)' : 'var(--color-info-soft)' }}>
                {notif.type === 'milestone'
                  ? <Trophy className="w-4 h-4 text-amber" />
                  : <Bell className="w-4 h-4 text-blue" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-nav text-sm font-semibold">{notif.title}</p>
                <p className="text-text-muted text-xs mt-0.5">{notif.message}</p>
              </div>
              <button onClick={() => markNotificationRead(notif.id)}
                className="text-text-light hover:text-text-muted transition-colors text-xs">
                Dismiss
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Top metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">

        {/* PACE Score - DOMINANT */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="card p-6 col-span-2 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5">
              <p className="text-text-muted text-xs uppercase tracking-wider font-semibold">PACE™ Score</p>
              <button
                onClick={() => setShowPaceModal(true)}
                title="What is PACE™?"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center', color: 'var(--color-text-muted)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-1 text-green text-xs font-medium">
              <TrendingUp className="w-3 h-3" /> +7 this week
            </div>
          </div>
          <div className="flex items-end gap-6 mb-2">
            <div className="relative w-20 h-20 flex-shrink-0">
              <svg className="w-20 h-20 pace-ring" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="26" fill="none" stroke="#E5E4E0" strokeWidth="6" />
                <circle cx="32" cy="32" r="26" fill="none" stroke="#1A1A1A" strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 26}`}
                  strokeDashoffset={`${2 * Math.PI * 26 * (1 - paceAnimated / 100)}`}
                  style={{ transition: 'stroke-dashoffset 0.3s ease' }} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-nav font-black text-lg">{paceAnimated}</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-nav font-black text-4xl leading-tight mb-0.5">{effectiveDaysToIpo}</p>
              <p className="text-text-muted text-sm font-medium mb-2">days to TSXV listing</p>
              <p className="text-green text-xs flex items-center gap-1 font-medium">
                <Flame className="w-3 h-3" /> Accelerating
              </p>
            </div>
          </div>
          <Link href="/dashboard#pace-details" className="flex items-center gap-1 mt-3"
            style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-accent)', textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
            <Activity className="w-3 h-3" /> Full velocity breakdown →
          </Link>
        </motion.div>

        {/* Tasks overview */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="card p-6">
          <p className="text-text-muted text-xs uppercase tracking-wider font-semibold mb-4">Tasks</p>
          {dashLoading ? (
            <div className="space-y-2.5 animate-pulse">
              {[1,2,3,4].map(i => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'var(--color-border)' }} />
                  <div className="h-3 rounded flex-1" style={{ background: 'var(--color-border)' }} />
                  <div className="h-3 w-4 rounded" style={{ background: 'var(--color-border)' }} />
                </div>
              ))}
              <div className="mt-3 h-2 rounded-full w-full" style={{ background: 'var(--color-border)' }} />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {[
                  { label: 'Completed',   value: (dashData?.tasksSummary ?? DEMO_TASKS_SUMMARY).completed,   color: 'var(--color-success)' },
                  { label: 'In Progress', value: (dashData?.tasksSummary ?? DEMO_TASKS_SUMMARY).inProgress,  color: 'var(--color-info)' },
                  { label: 'Blocked',     value: (dashData?.tasksSummary ?? DEMO_TASKS_SUMMARY).blocked,     color: 'var(--color-accent)' },
                  { label: 'Not Started', value: (dashData?.tasksSummary ?? DEMO_TASKS_SUMMARY).notStarted,  color: 'var(--color-border)' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                    <span className="text-text-muted text-xs flex-1">{label}</span>
                    <span className="text-nav text-xs font-semibold">{value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 progress-bar">
                <div className="progress-fill" style={{ width: `${((dashData?.tasksSummary ?? DEMO_TASKS_SUMMARY).completed / Math.max((dashData?.tasksSummary ?? DEMO_TASKS_SUMMARY).total, 1)) * 100}%` }} />
              </div>
              <p className="text-text-light text-xs mt-1">{(dashData?.tasksSummary ?? DEMO_TASKS_SUMMARY).completed}/{(dashData?.tasksSummary ?? DEMO_TASKS_SUMMARY).total} tasks</p>
            </>
          )}
        </motion.div>

        {/* Current Phase */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="card p-6">
          <p className="text-text-muted text-xs uppercase tracking-wider font-semibold mb-3">Current Phase</p>
          {statsLoading ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-4 rounded-lg w-3/4" style={{ background: 'var(--color-border)' }} />
              <div className="h-3 rounded-lg w-1/2" style={{ background: 'var(--color-border)' }} />
              <div className="h-2 rounded-full w-full mt-3" style={{ background: 'var(--color-border)' }} />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <p className="text-nav font-semibold text-sm">{PHASE_LABELS[effectiveCurrentPhase] ?? effectiveCurrentPhase}</p>
              </div>
              <p className="text-text-muted text-xs mb-3">{currentPhasePercentage}% complete</p>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${currentPhasePercentage}%` }} />
              </div>
              <Link href="/checklist" className="mt-3 text-accent text-xs flex items-center gap-1 hover:text-accent-deep transition-colors font-medium">
                View tasks <ArrowRight className="w-3 h-3" />
              </Link>
            </>
          )}
        </motion.div>
      </div>

      {/* Phase roadmap + Milestones */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Phase Roadmap */}
        <div className="lg:col-span-2 card p-7">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-nav font-bold text-base">IPO Phase Roadmap</h2>
            <Link href="/checklist" className="text-accent text-xs hover:text-accent-deep flex items-center gap-1 font-medium">
              Full checklist <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2.5">
            {(dashData?.phaseData ?? DEMO_PHASE_DATA).map(({ phase: phaseRaw, total, completed, percentage }, i) => {
              const phase = phaseRaw as Phase
              const isActive = phase === effectiveCurrentPhase
              const isDone = percentage === 100
              return (
                <motion.div key={phase}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-4 p-3 rounded-xl border transition-all"
                  style={
                    isDone  ? { background: 'var(--color-success-soft)', borderColor: '#2D7A5F30' } :
                    isActive ? { background: 'var(--color-error-soft)', borderColor: '#E8312A30' } :
                    { background: 'var(--color-bg-primary)', borderColor: 'var(--color-border)' }
                  }>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm"
                    style={
                      isDone   ? { background: 'var(--color-success-soft)' } :
                      isActive ? { background: 'var(--color-error-soft)' } :
                      { background: 'var(--color-surface-primary)' }
                    }>
                    {isDone ? '✅' : isActive ? '⚡' :
                      i < PHASE_ORDER.indexOf(effectiveCurrentPhase) ? '⏳' : '🔒'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-sm font-medium"
                        style={{ color: isDone ? 'var(--color-success)' : isActive ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)' }}>
                        {PHASE_LABELS[phase]}
                      </p>
                      <span className="text-xs font-medium"
                        style={{ color: isDone ? 'var(--color-success)' : isActive ? 'var(--color-accent)' : 'var(--color-border-dark)' }}>
                        {completed}/{total}
                      </span>
                    </div>
                    <div className="progress-bar" style={{ height: '4px' }}>
                      <div className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${percentage}%`,
                          background: isDone ? 'var(--color-success)' : isActive ? 'var(--color-accent)' : 'var(--color-border)',
                        }} />
                    </div>
                  </div>
                  <span className="text-xs font-bold flex-shrink-0"
                    style={{ color: isDone ? 'var(--color-success)' : isActive ? 'var(--color-accent)' : 'var(--color-border-dark)' }}>
                    {percentage}%
                  </span>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Milestones */}
        <div className="card p-7">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-nav font-bold text-base">Mission Milestones</h2>
            <Star className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {MILESTONES.map((milestone, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-xl border transition-all"
                style={milestone.earned
                  ? { background: 'var(--color-error-soft)', borderColor: 'rgba(232, 49, 42, 0.2)' }
                  : { background: 'var(--color-bg-primary)', borderColor: 'var(--color-border)' }}>
                <span className={`text-base ${!milestone.earned ? 'opacity-30 grayscale' : ''}`}>
                  {milestone.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold"
                    style={{ color: milestone.earned ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)' }}>
                    {milestone.title}
                  </p>
                  <p className="text-xs mt-0.5"
                    style={{ color: milestone.earned ? 'var(--color-accent)' : 'var(--color-border-dark)' }}>
                    +{milestone.xp.toLocaleString()} XP
                    {milestone.date && <span className="text-text-light ml-1">· {milestone.date}</span>}
                  </p>
                </div>
                {milestone.earned && <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-accent)' }} />}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming tasks + Quick links */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-7">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-nav font-bold text-base">Upcoming Critical Tasks</h2>
            <Link href="/checklist" className="text-accent text-xs hover:text-accent-deep flex items-center gap-1 font-medium">
              All tasks <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {(dashData?.upcomingTasks ?? UPCOMING_TASKS).map((task, i) => (
              <motion.div key={'id' in task ? task.id : i}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="flex items-start gap-3 p-3 rounded-xl border border-border hover:border-border-dark card-hover cursor-pointer">
                <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                  style={{ background: task.priority === 'critical' ? 'var(--color-accent)' : 'var(--color-warning-dark)' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-nav text-sm font-medium">{task.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-text-muted text-xs">{task.phase}</span>
                    <span className="text-border-dark">·</span>
                    <Clock className="w-3 h-3 text-text-light" />
                    <span className="text-text-muted text-xs">
                      {'dueIn' in task ? `Due in ${task.dueIn} days` : `~${task.estimatedDays}d`}
                    </span>
                  </div>
                </div>
                <span className="badge flex-shrink-0 text-[10px]"
                  style={task.priority === 'critical'
                    ? { background: 'var(--color-error-soft)', color: 'var(--color-accent)', borderColor: '#E8312A30' }
                    : { background: 'var(--color-warning-soft)', color: 'var(--color-warning)', borderColor: '#D4A96A30' }}>
                  {task.priority}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          {/* auditus.ai */}
          <div className="card p-6" style={{ background: 'var(--color-error-soft)', borderColor: '#E8312A30' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#E8312A15' }}>
                <Zap className="w-4 h-4 text-accent" />
              </div>
              <div>
                <p className="text-nav font-semibold text-sm">Need to prepare for an audit?</p>
                <p className="text-accent text-xs font-medium">auditus.ai</p>
              </div>
            </div>
            <p className="text-text-muted text-xs mb-4 leading-relaxed">
              Get your financials audit-ready before your auditors engage. Companies that prepare in advance reduce audit fees by 20–40% and avoid last-minute surprises.
            </p>
            <a href="https://auditus.ai" target="_blank"
              className="flex items-center gap-2 text-accent text-xs font-semibold hover:text-accent-deep transition-colors">
              Start preparing at auditus.ai <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Live stats: team, docs, overdue */}
          <div className="card p-5">
            <p className="text-text-muted text-xs uppercase tracking-wider font-semibold mb-3">At a Glance</p>
            {statsLoading ? (
              <div className="grid grid-cols-3 gap-3 animate-pulse">
                {[1,2,3].map(i => (
                  <div key={i} className="rounded-xl p-3" style={{ background: 'var(--color-bg-primary)' }}>
                    <div className="h-5 w-6 rounded mb-1.5 mx-auto" style={{ background: 'var(--color-border)' }} />
                    <div className="h-3 rounded w-full" style={{ background: 'var(--color-border)' }} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    value: dashStats?.teamMembersCount ?? '—',
                    label: 'Team',
                    icon: Users,
                    color: 'var(--color-text-primary)',
                    bg: 'var(--color-bg-primary)',
                    href: '/team',
                  },
                  {
                    value: dashStats?.documentsCount ?? '—',
                    label: 'Docs',
                    icon: FileText,
                    color: 'var(--color-info)',
                    bg: 'var(--color-info-soft)',
                    href: '/documents',
                  },
                  {
                    value: dashStats?.prospectusSectionsComplete && dashStats?.prospectusSectionsTotal
                      ? `${dashStats.prospectusSectionsComplete}/${dashStats.prospectusSectionsTotal}`
                      : '—',
                    label: 'Prospectus',
                    icon: FileText,
                    color: 'var(--color-accent)',
                    bg: 'var(--color-error-soft)',
                    href: '/prospectus',
                  },
                  {
                    value: dashStats?.overdueTasks ?? '—',
                    label: 'Overdue',
                    icon: AlertOctagon,
                    color: dashStats && dashStats.overdueTasks > 0 ? 'var(--color-accent)' : 'var(--color-success)',
                    bg: dashStats && dashStats.overdueTasks > 0 ? 'var(--color-error-soft)' : 'var(--color-success-soft)',
                    href: '/checklist',
                  },
                ].map(({ value, label, icon: Icon, color, bg, href }) => (
                  <Link key={label} href={href}
                    className="rounded-xl p-3 text-center transition-opacity hover:opacity-80"
                    style={{ background: bg, textDecoration: 'none' }}>
                    <p className="font-bold text-lg leading-tight" style={{ color }}>{value}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{label}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick nav */}
          <div className="card p-6">
            <p className="text-text-muted text-xs uppercase tracking-wider font-semibold mb-4">Quick Access</p>
            <div className="space-y-1">
              {[
                { href: '/prospectus', icon: FileText, label: 'Build Prospectus',   badge: dashStats?.prospectusCompletion ? `${dashStats.prospectusCompletion}%` : null },
                { href: '/documents',  icon: FileText, label: 'Upload Documents',   badge: dashStats ? `${dashStats.documentsCount} uploaded` : null },
                { href: '/templates',  icon: Award,    label: 'Download PIF Form',  badge: 'Template'  },
                { href: '/team',       icon: Users,    label: 'Invite Team Member', badge: dashStats ? `${dashStats.teamMembersCount} members` : null },
                { href: '/marketplace',icon: Globe,    label: 'Find an Auditor',    badge: null        },
              ].map(({ href, icon: Icon, label, badge }) => (
                <Link key={href} href={href}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-bg transition-colors group">
                  <Icon className="w-3.5 h-3.5 text-text-light group-hover:text-accent transition-colors" />
                  <span className="text-text-muted text-xs flex-1 group-hover:text-nav transition-colors">{label}</span>
                  {badge && <span className="text-text-light text-[10px]">{badge}</span>}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* READINESS FACTORS & SEQUENCING ALERTS                              */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <ReadinessFactorsCard
            cashRunway={dashStats?.cashRunway ?? 8.5}
            hiringProgress={dashStats?.hiringProgress ?? 67}
            auditorEngaged={dashStats?.auditorEngaged ?? true}
            boardSize={dashStats?.boardSize ?? 3}
            boardIndependentCount={dashStats?.boardIndependentCount ?? 1}
            secondIndependent={dashStats?.secondIndependent ?? false}
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <SequencingAlertsCard
            alerts={[
              {
                severity: 'warning' as const,
                taskId: 'seq-1',
                title: 'Second Independent Director Needed',
                description: 'TSXV requires 2 independent directors before filing. Currently have 1 of 2.',
                daysBlocking: 2,
                remediationSteps: [
                  'Engage director search firm with expedited timeline',
                  'Screen candidates against TSXV independence rules',
                  'Obtain board approval for appointment',
                  'File Form 2A with TSXV Exchange',
                ],
              },
            ]}
          />
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* CRITICAL ITEM AGING REPORT                                         */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: 'white', borderColor: 'var(--color-border)' }}>

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E5E4E0', background: 'var(--color-bg-primary)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--color-error-soft)', border: '1px solid rgba(232,49,42,0.2)' }}>
              <BarChart2 className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
            </div>
            <div>
              <h2 className="text-nav font-bold text-base">Critical Item Aging Report</h2>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Track how long critical tasks have been open — click any row to send a detailed reminder</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {[
              { label: 'Overdue',     count: AGING_ITEMS.filter(i => i.status === 'overdue').length,     color: 'var(--color-error)', bg: 'var(--color-error-pale)' },
              { label: 'At Risk',     count: AGING_ITEMS.filter(i => i.status === 'at_risk').length,     color: 'var(--color-warning)', bg: 'var(--color-warning-soft)' },
              { label: 'In Progress', count: AGING_ITEMS.filter(i => i.status === 'in_progress').length, color: 'var(--color-info)', bg: 'var(--color-info-soft)' },
            ].map(({ label, count, color, bg }) => (
              <div key={label} className="flex items-center gap-1.5 rounded-full"
                style={{ background: bg, border: `1px solid ${color}30`, padding: '0.2rem 0.65rem' }}>
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                <span className="text-xs font-semibold" style={{ color }}>{count} {label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Aging Timeline Graph */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E5E4E0', background: 'var(--color-surface-light)' }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)', marginBottom: '0.875rem' }}>Days Open — Aging Visualization</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {(() => {
              const maxDays = Math.max(...AGING_ITEMS.map(i => i.daysOpen))
              return AGING_ITEMS.map(item => {
                const style = getAgingStatusStyle(item.status)
                const widthPct = (item.daysOpen / maxDays) * 100
                return (
                  <button key={item.id}
                    onClick={() => { setAgingModal(item.id); setAgingMessageEdit(buildReminderMessage(item, effectiveName)); setAgingEditing(false) }}
                    className="w-full text-left group"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {/* Name */}
                    <div style={{ width: '200px', flexShrink: 0 }}>
                      <p className="text-xs font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>{item.title}</p>
                      <p className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>{item.owner}</p>
                    </div>
                    {/* Bar */}
                    <div className="flex-1" style={{ position: 'relative', height: '28px', background: 'var(--color-surface-secondary)', borderRadius: '6px', overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${widthPct}%` }}
                        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
                        style={{
                          position: 'absolute', top: 0, left: 0, height: '100%',
                          background: item.status === 'overdue' ? 'linear-gradient(90deg, #DC2626, #EF4444)' :
                                      item.status === 'at_risk' ? 'linear-gradient(90deg, #B45309, #D97706)' :
                                      'linear-gradient(90deg, #1D4ED8, #3B82F6)',
                          borderRadius: '6px',
                          opacity: 0.85,
                        }} />
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', padding: '0 0.625rem' }}>
                        <span className="text-xs font-bold" style={{ color: 'var(--color-text-primary)', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                          {item.daysOpen}d open
                        </span>
                      </div>
                    </div>
                    {/* Status badge */}
                    <div style={{ width: '90px', flexShrink: 0 }}>
                      <span className="text-xs font-semibold rounded-full"
                        style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}`, padding: '0.15rem 0.5rem' }}>
                        {style.label}
                      </span>
                    </div>
                    {/* Days overdue / remaining */}
                    <div style={{ width: '100px', flexShrink: 0, textAlign: 'right' }}>
                      {item.daysOverdue > 0 ? (
                        <span className="text-xs font-bold" style={{ color: 'var(--color-error)' }}>
                          {item.daysOverdue}d overdue
                        </span>
                      ) : (
                        <span className="text-xs" style={{ color: Math.abs(item.daysOverdue) <= 7 ? 'var(--color-warning)' : 'var(--color-text-tertiary)' }}>
                          {Math.abs(item.daysOverdue)}d left
                        </span>
                      )}
                    </div>
                    {/* Click hint */}
                    <ChevronRight className="w-4 h-4 flex-shrink-0 transition-transform group-hover:translate-x-0.5"
                      style={{ color: 'var(--color-border-dark)' }} />
                  </button>
                )
              })
            })()}
          </div>
        </div>

        {/* Item Rows Table */}
        <div>
          {/* Column headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 0.8fr 1fr 0.5fr', gap: '0', padding: '0.5rem 1.5rem', borderBottom: '1px solid #E5E4E0', background: 'var(--color-bg-primary)' }}>
            {['Task', 'Owner', 'Phase', 'Status / Due', ''].map((h, i) => (
              <span key={i} className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>{h}</span>
            ))}
          </div>
          {AGING_ITEMS.map((item, idx) => {
            const style = getAgingStatusStyle(item.status)
            const sent = agingReminderSent.has(item.id)
            return (
              <motion.button key={item.id}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                onClick={() => { setAgingModal(item.id); setAgingMessageEdit(buildReminderMessage(item, effectiveName)); setAgingEditing(false) }}
                className="w-full text-left transition-colors"
                style={{
                  display: 'grid', gridTemplateColumns: '2fr 1.2fr 0.8fr 1fr 0.5fr', gap: '0',
                  padding: '0.875rem 1.5rem',
                  borderBottom: idx < AGING_ITEMS.length - 1 ? '1px solid #F0EFED' : 'none',
                  background: item.status === 'overdue' ? 'rgba(254,226,226,0.35)' : 'transparent',
                  alignItems: 'center',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = item.status === 'overdue' ? 'rgba(254,226,226,0.6)' : 'var(--color-surface-light)')}
                onMouseLeave={e => (e.currentTarget.style.background = item.status === 'overdue' ? 'rgba(254,226,226,0.35)' : 'transparent')}>

                {/* Task */}
                <div style={{ paddingRight: '0.75rem' }}>
                  <div className="flex items-center gap-2">
                    {item.status === 'overdue' && <AlertOctagon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--color-error)' }} />}
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{item.title}</p>
                  </div>
                  <div className="flex items-center gap-2" style={{ marginTop: '0.2rem' }}>
                    <span className="text-xs rounded-full" style={{ background: 'var(--color-bg-primary)', color: 'var(--color-text-secondary)', border: '1px solid #E5E4E0', padding: '0.1rem 0.45rem' }}>
                      {item.category}
                    </span>
                    <span className="text-xs font-mono" style={{ color: 'var(--color-text-secondary)' }}>{item.reference}</span>
                  </div>
                </div>

                {/* Owner */}
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                    style={{ background: item.ownerEmail.includes('sarah') ? 'var(--color-text-primary)' : item.ownerEmail.includes('marc') ? 'var(--color-success)' : 'var(--color-accent-purple)' }}>
                    {item.owner.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-nav truncate">{item.owner}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>{item.ownerRole}</p>
                  </div>
                </div>

                {/* Phase */}
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{item.phase.split(' ')[0]} {item.phase.split(' ')[1] || ''}</p>

                {/* Status / Due */}
                <div>
                  <span className="text-xs font-semibold rounded-full"
                    style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}`, padding: '0.2rem 0.55rem' }}>
                    {style.label}
                  </span>
                  <p className="text-xs" style={{ color: item.daysOverdue > 0 ? 'var(--color-error)' : 'var(--color-text-tertiary)', marginTop: '0.2rem' }}>
                    {item.daysOverdue > 0 ? `${item.daysOverdue}d overdue` : `Due ${item.dueDate}`}
                  </p>
                </div>

                {/* Send action */}
                <div className="flex justify-end">
                  {sent ? (
                    <span className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--color-success-bright)' }}>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Sent
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-semibold rounded-lg transition-colors"
                      style={{ background: 'var(--color-accent)', color: 'var(--color-text-inverse)', padding: '0.3rem 0.625rem' }}>
                      <Send className="w-3 h-3" /> Remind
                    </span>
                  )}
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* Footer note */}
        <div className="flex items-center gap-2" style={{ padding: '0.75rem 1.5rem', borderTop: '1px solid #E5E4E0', background: 'var(--color-bg-primary)' }}>
          <AlertOctagon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--color-text-secondary)' }} />
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Click any row to preview and send a detailed step-by-step reminder directly to the task owner. All reminders are logged.
          </p>
        </div>
      </div>

      <AnimatePresence>
        {emailModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={() => { setEmailModal(false); setEmailSent(false) }}>
            <motion.div initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }}
              className="p-7 rounded-2xl max-w-md w-full"
              style={{ background: 'white', border: '1px solid #E5E4E0' }}
              onClick={e => e.stopPropagation()}>

              {emailSent ? (
                <div className="text-center py-4">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ background: 'var(--color-success-light)', border: '1px solid #86EFAC' }}>
                    <CheckCircle2 className="w-7 h-7" style={{ color: 'var(--color-success-bright)' }} />
                  </div>
                  <h2 className="font-bold text-lg mb-2" style={{ color: 'var(--color-text-primary)' }}>Dashboard Sent</h2>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    A live snapshot of your IPO progress has been sent to {emailAddress || 'your email'}.
                  </p>
                  <button onClick={() => { setEmailModal(false); setEmailSent(false) }}
                    className="mt-5 px-5 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ background: 'var(--color-accent)', color: 'var(--color-text-inverse)' }}>Done</button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: 'var(--color-bg-primary)', border: '1px solid #E5E4E0' }}>
                        <Mail className="w-4 h-4" style={{ color: 'var(--color-text-primary)' }} />
                      </div>
                      <div>
                        <h2 className="font-bold text-base" style={{ color: 'var(--color-text-primary)' }}>Send Dashboard</h2>
                        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Send your live IPO progress snapshot</p>
                      </div>
                    </div>
                    <button onClick={() => setEmailModal(false)} style={{ color: 'var(--color-text-secondary)' }}>
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                        Send To
                      </label>
                      <input type="email" value={emailAddress}
                        onChange={e => setEmailAddress(e.target.value)}
                        placeholder="you@company.com or colleague@firm.com"
                        className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                        style={{ border: '1px solid #E5E4E0', background: 'var(--color-surface-light)', color: 'var(--color-text-primary)' }}
                        onFocus={e => { e.target.style.borderColor = 'var(--color-text-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(26,26,26,0.07)' }}
                        onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none' }} />
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                        Format
                      </label>
                      <div className="flex gap-2">
                        {(['html', 'pdf'] as const).map(fmt => (
                          <button key={fmt} onClick={() => setEmailFormat(fmt)}
                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all"
                            style={emailFormat === fmt
                              ? { background: 'var(--color-accent)', border: '1px solid var(--color-accent)', color: 'var(--color-text-inverse)' }
                              : { background: 'var(--color-bg-primary)', border: '1px solid #E5E4E0', color: 'var(--color-text-secondary)' }}>
                            {fmt === 'html' ? '📧 Email (HTML)' : '📄 PDF Attachment'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="px-3.5 py-3 rounded-xl" style={{ background: 'var(--color-bg-primary)', border: '1px solid #E5E4E0' }}>
                      <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>What&apos;s included</p>
                      <ul className="space-y-0.5">
                        {['PACE™ score & velocity trend', 'Phase-by-phase progress overview', 'Blocked & in-progress tasks', 'Recent milestone completions', 'Days to estimated listing'].map(item => (
                          <li key={item} className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                            <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: 'var(--color-border-medium)' }} />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex gap-3">
                      <button onClick={() => setEmailModal(false)}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                        style={{ background: 'var(--color-bg-primary)', border: '1px solid #E5E4E0', color: 'var(--color-text-primary)' }}>
                        Cancel
                      </button>
                      <button onClick={() => setEmailSent(true)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
                        style={{ background: 'var(--color-accent)', color: 'var(--color-text-inverse)' }}>
                        <Mail className="w-4 h-4" /> Send Now
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Aging Reminder Modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {agingModal && (() => {
          const item = AGING_ITEMS.find(a => a.id === agingModal)!
          if (!item) return null
          const style = getAgingStatusStyle(item.status)
          const alreadySent = agingReminderSent.has(item.id)

          function sendReminder() {
            setAgingReminderSent(prev => new Set([...prev, item.id]))
            setAgingModal(null)
          }

          return (
            <motion.div key="aging-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background: 'rgba(0,0,0,0.6)' }}
              onClick={() => setAgingModal(null)}>
              <motion.div initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }}
                className="rounded-2xl w-full overflow-hidden"
                style={{ background: 'white', border: '1px solid #E5E4E0', maxWidth: '680px', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
                onClick={e => e.stopPropagation()}>

                {/* Modal header */}
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E5E4E0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', background: 'var(--color-bg-primary)', flexShrink: 0 }}>
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: style.bg, border: `1px solid ${style.border}` }}>
                      <AlertOctagon className="w-5 h-5" style={{ color: style.color }} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>{item.title}</p>
                      <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: '0.25rem' }}>
                        <span className="text-xs font-semibold rounded-full"
                          style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}`, padding: '0.15rem 0.5rem' }}>
                          {style.label}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{item.daysOpen} days open</span>
                        <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>·</span>
                        <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{item.phase}</span>
                        <span className="text-xs font-mono" style={{ color: 'var(--color-text-secondary)' }}>{item.reference}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setAgingModal(null)} className="text-text-light hover:text-nav transition-colors flex-shrink-0">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Scrollable body */}
                <div className="overflow-y-auto" style={{ flex: 1 }}>

                  {/* Owner info */}
                  <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #F0EFED', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold"
                      style={{ background: item.ownerEmail.includes('sarah') ? 'var(--color-text-primary)' : item.ownerEmail.includes('marc') ? 'var(--color-success)' : 'var(--color-accent-purple)' }}>
                      {item.owner.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>{item.owner}</p>
                      <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{item.ownerRole} · {item.ownerEmail}</p>
                    </div>
                    <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                      {item.daysOverdue > 0 ? (
                        <p className="text-sm font-bold" style={{ color: 'var(--color-error)' }}>{item.daysOverdue} day{item.daysOverdue !== 1 ? 's' : ''} overdue</p>
                      ) : (
                        <p className="text-sm font-bold" style={{ color: Math.abs(item.daysOverdue) <= 7 ? 'var(--color-warning)' : 'var(--color-text-primary)' }}>
                          {Math.abs(item.daysOverdue)} days remaining
                        </p>
                      )}
                      <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Due: {item.dueDate}</p>
                    </div>
                  </div>

                  {/* What to do — always visible */}
                  <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #F0EFED' }}>
                    <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)', marginBottom: '0.625rem' }}>
                      Exactly What Needs to Be Done
                    </p>
                    <div className="rounded-xl" style={{ background: 'var(--color-bg-primary)', border: '1px solid #E5E4E0', padding: '1rem' }}>
                      {item.whatToDo.split('\n').map((line, i) => (
                        <p key={i} className="text-sm leading-relaxed" style={{ marginBottom: line === '' ? '0.5rem' : '0.25rem', fontWeight: line.startsWith('OVERDUE') ? 700 : 400, color: line.startsWith('OVERDUE') ? 'var(--color-error)' : 'var(--color-text-primary)' }}>
                          {line}
                        </p>
                      ))}
                    </div>
                    {item.blockers && (
                      <div className="flex items-start gap-2 rounded-xl mt-2" style={{ background: 'var(--color-warning-soft)', border: '1px solid #FDE68A', padding: '0.75rem' }}>
                        <AlertOctagon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-warning)' }} />
                        <div>
                          <p className="text-xs font-bold" style={{ color: 'var(--color-warning-dark)' }}>Current Blocker</p>
                          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-warning-dark)' }}>{item.blockers}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Reminder message — editable */}
                  <div style={{ padding: '1rem 1.5rem' }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: '0.625rem' }}>
                      <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Reminder Message to {item.owner.split(' ')[0]}</p>
                      <button onClick={() => setAgingEditing(e => !e)}
                        className="flex items-center gap-1 text-xs font-semibold rounded-lg transition-colors"
                        style={{ background: agingEditing ? 'var(--color-text-primary)' : 'var(--color-bg-primary)', color: agingEditing ? 'white' : 'var(--color-text-secondary)', border: `1px solid ${agingEditing ? 'var(--color-text-primary)' : 'var(--color-border)'}`, padding: '0.25rem 0.6rem' }}>
                        <Edit3 className="w-3 h-3" />
                        {agingEditing ? 'Lock' : 'Edit'}
                      </button>
                    </div>
                    {agingEditing ? (
                      <textarea
                        value={agingMessageEdit}
                        onChange={e => setAgingMessageEdit(e.target.value)}
                        rows={12}
                        className="w-full rounded-xl text-xs outline-none resize-none font-mono leading-relaxed"
                        style={{ background: 'var(--color-bg-primary)', border: '1px solid #1A1A1A', padding: '0.875rem', color: 'var(--color-text-primary)', boxShadow: '0 0 0 3px rgba(26,26,26,0.07)' }}
                      />
                    ) : (
                      <div className="rounded-xl" style={{ background: 'var(--color-bg-primary)', border: '1px solid #E5E4E0', padding: '0.875rem' }}>
                        <p className="text-xs font-mono leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--color-text-primary)' }}>{agingMessageEdit}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Fixed footer */}
                <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #E5E4E0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', background: 'var(--color-bg-primary)', flexShrink: 0 }}>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    Sends to <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{item.ownerEmail}</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setAgingModal(null)}
                      className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                      style={{ background: 'var(--color-bg-primary)', border: '1px solid #E5E4E0', color: 'var(--color-text-secondary)' }}>
                      Cancel
                    </button>
                    <button onClick={sendReminder}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                      style={{ background: 'var(--color-accent)', color: 'var(--color-text-inverse)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-error)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-accent)')}>
                      <Send className="w-4 h-4" />
                      Send Reminder to {item.owner.split(' ')[0]}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )
        })()}
      </AnimatePresence>

      {/* ── PACE™ "How is this calculated?" Modal ──────────────────────────── */}
      <AnimatePresence>
        {showPaceModal && (
          <motion.div
            key="pace-modal-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.6)' }}
            onClick={() => setShowPaceModal(false)}>
            <motion.div
              key="pace-modal"
              initial={{ scale: 0.93, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.93, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="rounded-2xl w-full max-w-lg overflow-hidden"
              style={{ background: 'white', border: '1px solid #E5E4E0', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
              onClick={e => e.stopPropagation()}>

              {/* Header */}
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E4E0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--color-accent)', color: 'var(--color-text-inverse)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Activity style={{ width: '18px', height: '18px', color: 'var(--color-text-primary)' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '1px' }}>What is PACE™?</p>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>IPOReady Proprietary Velocity Engine · Protected IP</p>
                </div>
                <button onClick={() => setShowPaceModal(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', padding: '4px' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-primary)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-tertiary)')}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div style={{ overflowY: 'auto', padding: '24px' }}>

                {/* What it is */}
                <p style={{ fontSize: '14px', color: 'var(--color-text-primary)', lineHeight: 1.6, marginBottom: '20px' }}>
                  <strong>PACE™</strong> (Progress and Compliance Execution) is IPOReady's proprietary velocity scoring engine. It measures how quickly and effectively your company is progressing toward a public listing — not just task completion, but <strong>execution quality</strong> and <strong>momentum</strong>.
                </p>

                {/* Formula */}
                <div style={{ background: 'var(--color-bg-primary)', border: '1px solid #E5E4E0', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>The Formula</p>
                  <div style={{ fontFamily: 'monospace', fontSize: '13px', color: 'var(--color-text-primary)', lineHeight: 1.8 }}>
                    <span style={{ color: 'var(--color-accent)', fontWeight: 700 }}>PACE™ = </span>
                    <span>(tasks_completed / total_tasks) × velocity_multiplier × phase_weighting</span>
                  </div>
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {[
                      { term: 'tasks_completed / total_tasks', def: 'Raw percentage of checklist items finished across all 8 phases' },
                      { term: 'velocity_multiplier', def: 'Boost or penalty based on speed vs. industry benchmark. Faster than average = multiplier > 1.0' },
                      { term: 'phase_weighting', def: 'Regulatory and financial phases (Audit, Legal, Filing) carry higher weight than admin phases' },
                    ].map(({ term, def }) => (
                      <div key={term} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-info)', background: 'var(--color-info-soft)', padding: '1px 6px', borderRadius: '4px', flexShrink: 0, marginTop: '1px' }}>{term}</span>
                        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{def}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Score bands */}
                <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Score Interpretation</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
                  {[
                    { range: '80–100', label: 'Accelerating', desc: 'Exceptional execution. On track or ahead of schedule.', color: 'var(--color-success)', bg: 'var(--color-success-light)', border: 'var(--color-success-light)' },
                    { range: '60–79', label: 'On Track', desc: 'Solid progress. A few areas to tighten up.', color: 'var(--color-info)', bg: 'var(--color-info-soft)', border: 'var(--color-info-medium)' },
                    { range: '40–59', label: 'At Risk', desc: 'Moderate delays detected. Take action this week.', color: 'var(--color-warning-dark)', bg: 'var(--color-warning-pale)', border: 'var(--color-warning-medium)' },
                    { range: '0–39', label: 'Critical', desc: 'Material delays. Immediate intervention required.', color: 'var(--color-error)', bg: 'var(--color-error-light)', border: 'var(--color-error-light)' },
                  ].map(({ range, label, desc, color, bg, border }) => (
                    <div key={range} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', background: bg, border: `1px solid ${border}` }}>
                      <span style={{ fontSize: '13px', fontWeight: 800, color, fontFamily: 'monospace', width: '48px', flexShrink: 0 }}>{range}</span>
                      <div>
                        <span style={{ fontSize: '13px', fontWeight: 700, color }}>{label}</span>
                        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginLeft: '6px' }}>{desc}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Current score callout */}
                <div style={{ background: 'var(--color-accent)', color: 'var(--color-text-inverse)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ position: 'relative', width: '48px', height: '48px', flexShrink: 0 }}>
                    <svg width="48" height="48" viewBox="0 0 48 48">
                      <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5" />
                      <circle cx="24" cy="24" r="20" fill="none" stroke="white" strokeWidth="5"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 20}`}
                        strokeDashoffset={`${2 * Math.PI * 20 * (1 - effectivePaceScore / 100)}`} />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: 900, color: 'var(--color-text-primary)' }}>{effectivePaceScore}</span>
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '3px' }}>Your current PACE™ is {effectivePaceScore} / 100</p>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-primary)' }}>
                      On Track · Top 30% of TSXV issuers at this stage · +7 this week
                    </p>
                  </div>
                </div>

                {/* Phase ETA context */}
                <div style={{ marginTop: '16px', padding: '14px', borderRadius: '10px', background: 'var(--color-warning-pale)', border: '1px solid #FDE68A' }}>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-warning)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                    <Info style={{ width: '10px', height: '10px', display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
                    Estimated Days to Listing
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--color-warning-dark)', lineHeight: 1.6 }}>
                    At your current PACE™ of <strong>{effectivePaceScore}</strong>, your estimated listing date is <strong>{effectiveDaysToIpo} days</strong> from today. To reduce this by 30 days, you need to complete 4–6 additional governance and audit tasks in the next 3 weeks.
                  </p>
                </div>

                <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '16px' }}>
                  PACE™ is updated in real-time as tasks are completed and milestones hit. ™ IPOReady Inc.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Board Report Modal */}
      <AnimatePresence>
        {boardModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)' }}
            onClick={() => { setBoardModal(false); setBoardSent(false) }}>
            <motion.div initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }}
              className="rounded-2xl w-full max-w-2xl overflow-hidden"
              style={{ background: 'white', border: '1px solid #E5E4E0', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
              onClick={e => e.stopPropagation()}>

              {boardSent ? (
                <div className="p-10 text-center">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: 'var(--color-success-light)', border: '1px solid #86EFAC' }}>
                    <CheckCircle2 className="w-8 h-8" style={{ color: 'var(--color-success-bright)' }} />
                  </div>
                  <h3 className="font-bold text-xl mb-2" style={{ color: 'var(--color-text-primary)' }}>Board Report Sent</h3>
                  <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                    Delivered to: <strong style={{ color: 'var(--color-text-primary)' }}>{boardEmail || 'board members'}</strong>
                  </p>
                  <p className="text-xs mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                    Full email with metrics, risk analysis, and remediation steps sent in board-ready format.
                  </p>
                  <button onClick={() => { setBoardModal(false); setBoardSent(false) }}
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ background: 'var(--color-accent)', color: 'var(--color-text-inverse)' }}>Done</button>
                </div>
              ) : (
                <>
                  {/* Fixed header */}
                  <div className="px-7 pt-6 pb-5 flex-shrink-0" style={{ borderBottom: '1px solid #F0EFED' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: 'var(--color-accent)' }}>
                          <Award className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>Board &amp; Advisory Report</h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style={{ background: 'var(--color-surface-light)', color: 'var(--color-accent-purple)', border: '1px solid #DDD6FE' }}>
                              Growth &amp; Enterprise
                            </span>
                          </div>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                            Transparent, board-ready analysis — metrics, risks, blockers, and remediation
                          </p>
                        </div>
                      </div>
                      <button onClick={() => setBoardModal(false)} style={{ color: 'var(--color-text-secondary)' }}>
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Scrollable body */}
                  <div className="overflow-y-auto flex-1 px-7 py-5" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                    {/* Period selector */}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-secondary)' }}>Reporting Period</p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                        {([
                          { id: '7d'        as const, label: 'Last 7 Days',    sub: 'This week' },
                          { id: '30d'       as const, label: 'Last 30 Days',   sub: 'This month' },
                          { id: '90d'       as const, label: 'Last 3 Months',  sub: 'This quarter' },
                          { id: 'inception' as const, label: 'Since Start',    sub: 'Full journey' },
                        ] as const).map(({ id, label, sub }) => (
                          <button key={id} onClick={() => setBoardPeriod(id)}
                            className="p-3 rounded-xl text-left transition-all"
                            style={boardPeriod === id
                              ? { background: 'var(--color-accent)', color: 'var(--color-text-inverse)', border: '1px solid #1A1A1A' }
                              : { background: 'var(--color-bg-primary)', border: '1px solid #E5E4E0' }}>
                            <p className="text-xs font-bold" style={{ color: boardPeriod === id ? 'white' : 'var(--color-text-primary)' }}>{label}</p>
                            <p className="text-[10px] mt-0.5" style={{ color: boardPeriod === id ? 'rgba(255,255,255,0.5)' : 'var(--color-text-tertiary)' }}>{sub}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* ── FULL EMAIL PREVIEW ─────────────────────────────────── */}
                    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #E5E4E0' }}>
                      <div className="px-5 py-3 flex items-center justify-between"
                        style={{ background: 'var(--color-accent)' }}>
                        <div>
                          <p className="text-xs font-bold text-white">Board &amp; Advisory Update — {effectiveName}</p>
                          <p className="text-[10px]" style={{ color: 'var(--color-text-primary)' }}>
                            {boardPeriod === '7d' ? 'May 15 – May 22, 2026' : boardPeriod === '30d' ? 'Apr 22 – May 22, 2026' : boardPeriod === '90d' ? 'Feb 22 – May 22, 2026' : 'Jan 2026 – May 22, 2026'}
                            {' · '}Prepared by IPOReady AI · Confidential
                          </p>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded font-semibold"
                          style={{ background: 'rgba(34,197,94,0.2)', color: 'var(--color-success-bright)' }}>Live Preview</span>
                      </div>

                      <div className="p-5" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--color-surface-light)' }}>

                        {/* Executive Summary */}
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Executive Summary</p>
                          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>
                            {boardPeriod === '7d'
                              ? `${effectiveName} progressed on key governance tasks this week. PACE™ score held at ${effectivePaceScore}/100. The team remains on the current phase track. One item flagged for board attention: the Audit Committee financial expert designation is pending a board resolution.`
                              : boardPeriod === '30d'
                              ? `${effectiveName} advanced overall IPO readiness meaningfully this month. PACE™ score improved to ${effectivePaceScore}. Auditors were engaged. Risk level remains medium — dependent on timing of independent director recruitment.`
                              : boardPeriod === '90d'
                              ? `${effectiveName} advanced to ${effectiveProgress}% overall IPO readiness this quarter. PACE™ score reached ${effectivePaceScore}. Key milestones achieved. Risk area: Corporate governance buildout — ensure independent directors are on track.`
                              : `${effectiveName} commenced its ${(company?.targetExchange ?? 'exchange').toUpperCase()} IPO readiness program. To date, the company has completed ${effectiveProgress}% of checklist tasks. PACE™ score of ${effectivePaceScore} reflects current progress. Primary risk: timeline — confirm all Phase 2 and 3 items are assigned and owned.`}
                          </p>
                        </div>

                        {/* Key Metrics */}
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Key Metrics</p>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            {[
                              { label: 'PACE™ Score', value: '62 / 100', delta: boardPeriod === '7d' ? '+2 this week' : boardPeriod === '30d' ? '+5 this month' : boardPeriod === '90d' ? '+12 this quarter' : '+62 from zero', ok: true },
                              { label: 'Overall Readiness', value: '23%', delta: boardPeriod === '7d' ? '+1% this week' : boardPeriod === '30d' ? '+5% this month' : boardPeriod === '90d' ? '+23% this quarter' : '23% from zero', ok: true },
                              { label: 'Days to Listing', value: '~187 days', delta: 'TSXV target · On track', ok: true },
                              { label: 'Tasks Complete', value: `${boardPeriod === '7d' ? '2' : boardPeriod === '30d' ? '8' : boardPeriod === '90d' ? '8' : '8'} / 37`, delta: boardPeriod === '7d' ? '2 this week' : boardPeriod === '30d' ? '8 this month' : '8 cumulative', ok: true },
                              { label: 'Active Phase', value: 'Phase 2 — Corporate', delta: 'Phase 1 complete · 28% done', ok: true },
                              { label: 'Blocked Tasks', value: '1 flagged', delta: 'Audit Committee resolution needed', ok: false },
                            ].map(({ label, value, delta, ok }) => (
                              <div key={label} className="p-2.5 rounded-lg" style={{ background: 'white', border: '1px solid #E5E4E0' }}>
                                <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>{label}</p>
                                <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{value}</p>
                                <p className="text-[10px]" style={{ color: ok ? 'var(--color-success-dark)' : 'var(--color-accent)' }}>{delta}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Key Updates */}
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                            Key Updates — {boardPeriod === '7d' ? 'Last 7 Days' : boardPeriod === '30d' ? 'Last 30 Days' : boardPeriod === '90d' ? 'Last 3 Months' : 'Since Inception'}
                          </p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                            {(boardPeriod === '7d' ? [
                              { text: 'Director Independence Confirmation completed and filed', type: 'done' },
                              { text: 'Initial legal counsel scoping call completed', type: 'done' },
                              { text: 'PACE™ score held steady at 62 — on target trajectory', type: 'info' },
                              { text: 'Audit Committee financial expert designation flagged for board resolution', type: 'warn' },
                            ] : boardPeriod === '30d' ? [
                              { text: 'Pre-Planning phase (Phase 1) fully completed — 6/6 tasks done', type: 'done' },
                              { text: 'Auditor engagement confirmed — CPAB-registered firm retained', type: 'done' },
                              { text: 'Corporate governance phase commenced — Audit Committee Charter in draft', type: 'done' },
                              { text: 'Disclosure Policy and Whistleblower Policy loaded to workspace', type: 'done' },
                              { text: 'PACE™ score increased from 57 to 62 (+5 this month)', type: 'info' },
                              { text: 'Independent director recruitment not yet initiated — behind timeline', type: 'warn' },
                            ] : boardPeriod === '90d' ? [
                              { text: 'TSXV Tier 2 target exchange confirmed and locked in', type: 'done' },
                              { text: 'Company profile and IPO structure finalized (IPO, not RTO)', type: 'done' },
                              { text: 'Pre-Planning phase completed in full (6 tasks)', type: 'done' },
                              { text: 'Auditor retained — first audit cycle scoped for FY2025', type: 'done' },
                              { text: 'Legal counsel identified — engagement letter pending', type: 'warn' },
                              { text: 'No independent directors appointed yet — board composition risk', type: 'warn' },
                              { text: 'Cap table structure reviewed — founder dilution scenarios modelled', type: 'info' },
                            ] : [
                              { text: 'IPO Readiness program formally commenced January 2026', type: 'done' },
                              { text: 'TSXV Tier 2 selected as target listing venue', type: 'done' },
                              { text: 'Pre-Planning phase 100% complete — all 6 foundational tasks done', type: 'done' },
                              { text: 'Auditor retained (CPAB-registered, mining/technology experience)', type: 'done' },
                              { text: 'IPOReady PACE™ tracking active — score of 62 / 100 achieved', type: 'done' },
                              { text: 'Corporate governance build-out 28% complete', type: 'info' },
                              { text: 'Legal counsel engagement letter not yet signed', type: 'warn' },
                              { text: 'No independent directors appointed — listing requirement not yet met', type: 'warn' },
                            ]).map(({ text, type }, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                                  style={{ background: type === 'done' ? 'var(--color-success-light)' : type === 'warn' ? 'var(--color-error-light)' : 'var(--color-info-soft)' }}>
                                  <div className="w-1.5 h-1.5 rounded-full"
                                    style={{ background: type === 'done' ? 'var(--color-success-bright)' : type === 'warn' ? 'var(--color-accent)' : 'var(--color-info)' }} />
                                </div>
                                <p className="text-xs leading-relaxed" style={{ color: type === 'warn' ? 'var(--color-error-dark)' : 'var(--color-text-primary)' }}>{text}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Risk Analysis */}
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Risk Analysis &amp; Remediation</p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {[
                              {
                                severity: 'High',
                                severityColor: 'var(--color-error)', severityBg: 'var(--color-error-pale)',
                                risk: 'Independent Director Recruitment — Not Initiated',
                                detail: 'TSXV listing requires a minimum of 2 independent directors on the board, with at least 1 designated as Audit Committee financial expert (NI 52-110). Recruitment has not commenced. At current pace, this will become a hard blocker in Phase 3.',
                                remediation: 'Engage an independent director search firm or use the IPOReady Expert Network immediately. Target appointment no later than 90 days before filing the preliminary prospectus. AI assistance available in the checklist for this task.',
                              },
                              {
                                severity: 'Medium',
                                severityColor: 'var(--color-warning)', severityBg: 'var(--color-warning-soft)',
                                risk: 'Legal Counsel Engagement Letter Not Signed',
                                detail: 'Securities counsel has been identified but no formal engagement letter has been executed. Without retained counsel, the prospectus drafting phase (Phase 3) cannot begin. This creates timeline risk.',
                                remediation: 'Prioritize finalizing engagement letter within the next 14 days. If counsel terms are in negotiation, request a limited scope engagement to begin NI 41-101 gap analysis immediately.',
                              },
                              {
                                severity: 'Medium',
                                severityColor: 'var(--color-warning)', severityBg: 'var(--color-warning-soft)',
                                risk: 'Audit Committee Financial Expert Not Designated',
                                detail: 'Board resolution to designate the Audit Committee financial expert is outstanding. NI 52-110 requires this designation before the preliminary prospectus is filed. This is currently flagged as a blocker in Phase 2.',
                                remediation: 'Prepare a board resolution template (available in Templates & Forms) and schedule a board meeting to formally designate the financial expert. IPOReady AI can pre-fill the resolution with current board data.',
                              },
                              {
                                severity: 'Low',
                                severityColor: 'var(--color-success-dark)', severityBg: 'var(--color-success-light)',
                                risk: 'Cap Table — Convertible Note Conversion Mechanics Not Confirmed',
                                detail: 'The CA$300K convertible note conversion terms have not been reviewed with legal counsel. Conversion at listing will impact fully-diluted share count and may be subject to escrow.',
                                remediation: 'Schedule a cap table review with securities counsel as part of the engagement scope. Use the Cap Table Scenario Workshop to model conversion scenarios before counsel review.',
                              },
                            ].map(({ severity, severityColor, severityBg, risk, detail, remediation }) => (
                              <div key={risk} className="rounded-xl p-3.5" style={{ background: 'white', border: '1px solid #E5E4E0' }}>
                                <div className="flex items-center gap-2 mb-1.5">
                                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded"
                                    style={{ background: severityBg, color: severityColor }}>{severity.toUpperCase()} RISK</span>
                                  <p className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>{risk}</p>
                                </div>
                                <p className="text-[11px] leading-relaxed mb-2" style={{ color: 'var(--color-text-secondary)' }}>{detail}</p>
                                <div className="flex items-start gap-1.5 rounded-lg px-2.5 py-2" style={{ background: 'var(--color-success-light)', border: '1px solid #BBF7D0' }}>
                                  <span className="text-[10px] font-bold flex-shrink-0" style={{ color: 'var(--color-success-dark)' }}>→ Remediation:</span>
                                  <p className="text-[10px] leading-relaxed" style={{ color: 'var(--color-success-dark)' }}>{remediation}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Gated Items & Blockers */}
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Gated Items &amp; Blockers</p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                            {[
                              { blocker: 'Phase 3 (Financial Audit & Prospectus) is gated behind Phase 2 completion', gate: 'Complete 5 remaining Phase 2 corporate governance tasks', critical: true },
                              { blocker: 'Prospectus drafting cannot begin without retained securities counsel', gate: 'Sign legal counsel engagement letter', critical: true },
                              { blocker: 'Exchange listing application requires 2 independent directors appointed', gate: 'Recruit and appoint independent directors', critical: true },
                              { blocker: 'Audit Committee Charter approval requires board resolution', gate: 'Schedule board meeting for resolution vote', critical: false },
                            ].map(({ blocker, gate, critical }) => (
                              <div key={blocker} className="flex items-start gap-2.5 p-2.5 rounded-lg"
                                style={{ background: critical ? 'var(--color-error-pale)' : 'var(--color-warning-pale)', border: `1px solid ${critical ? 'var(--color-error-light)' : 'var(--color-warning-medium)'}` }}>
                                <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                                  style={{ background: critical ? 'var(--color-error-pale)' : 'var(--color-warning-soft)' }}>
                                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: critical ? 'var(--color-error)' : 'var(--color-warning)' }} />
                                </div>
                                <div>
                                  <p className="text-[11px] font-semibold" style={{ color: critical ? 'var(--color-error-dark)' : 'var(--color-warning-dark)' }}>{blocker}</p>
                                  <p className="text-[10px] mt-0.5" style={{ color: critical ? 'var(--color-error-dark)' : 'var(--color-warning-dark)' }}>Unlock: {gate}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* AI Board Assessment */}
                        <div className="rounded-xl p-4" style={{ background: 'linear-gradient(135deg, #1A1A1A 0%, #1e1145 100%)' }}>
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--color-accent-purple)' }} />
                            <p className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>IPOReady AI Assessment</p>
                          </div>
                          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                            {boardPeriod === '7d'
                              ? 'This week\'s progress was steady but not accelerating. The outstanding board resolution for the Audit Committee financial expert is the most immediate action item for management. The board should confirm this is on the agenda for the next board meeting. No material risks changed this week.'
                              : boardPeriod === '30d'
                              ? 'Monthly progress has been solid — Phase 1 completion is a meaningful milestone. However, the independent director gap is the board\'s most important near-term governance responsibility. The company cannot list without this resolved, and lead time for finding quality independent directors is typically 60–120 days. The board should treat this as urgent.'
                              : boardPeriod === '90d'
                              ? 'The company has made strong foundational progress this quarter. However, the cadence needs to accelerate in Phase 2-3 or the 187-day target will slip. The board should consider: (1) is management capacity sufficient? (2) is outside counsel engaged? (3) is an independent director search underway? These three questions represent the most critical near-term risk.'
                              : `${effectiveName} is tracking well against a typical TSXV listing timeline for a company of its stage. The PACE™ score of ${effectivePaceScore} reflects competent early execution. The three material risks that could cause listing delays — independent directors, legal counsel, and prospectus readiness — are all addressable if actioned in the next 30–60 days. The board should request a formal status update from management at the next meeting and confirm accountability for each risk item.`}
                          </p>
                        </div>

                      </div>
                    </div>

                    {/* Recipients */}
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                        Send To Board / Advisors
                      </label>
                      <input
                        value={boardEmail} onChange={e => setBoardEmail(e.target.value)}
                        placeholder="ceo@company.com, board@firm.com, advisor@law.com"
                        className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                        style={{ border: '1px solid #E5E4E0', background: 'white', color: 'var(--color-text-primary)' }}
                        onFocus={e => { e.target.style.borderColor = 'var(--color-text-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(26,26,26,0.07)' }}
                        onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none' }}
                      />
                      <p className="text-xs mt-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                        Sent as a clean, board-formatted email with full risk analysis and remediation steps. Separate multiple recipients with commas.
                      </p>
                    </div>

                  </div>

                  {/* Fixed footer */}
                  <div className="px-7 pb-6 pt-4 flex-shrink-0" style={{ borderTop: '1px solid #F0EFED' }}>
                    <div className="flex gap-3">
                      <button onClick={() => setBoardModal(false)}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                        style={{ background: 'var(--color-bg-primary)', border: '1px solid #E5E4E0', color: 'var(--color-text-primary)' }}>
                        Cancel
                      </button>
                      <button onClick={handleSendBoardReport} disabled={sendingReport}
                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
                        style={{ background: 'var(--color-accent)', color: 'var(--color-text-inverse)', flex: 2, opacity: sendingReport ? 0.7 : 1, cursor: sendingReport ? 'not-allowed' : 'pointer' }}>
                        {sendingReport ? (
                          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--color-text-primary)' }}>
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" />
                          </svg>
                        ) : (
                          <Mail className="w-4 h-4" />
                        )}
                        {sendingReport ? 'Sending…' : (boardEmail ? `Send to ${boardEmail.split(',').length > 1 ? `${boardEmail.split(',').length} recipients` : boardEmail.split('@')[0]}` : 'Send Board Report')}
                      </button>
                    </div>
                    {boardError && (
                      <p className="text-xs mt-2 text-center" style={{ color: 'var(--color-error)' }}>{boardError}</p>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
        </>
      )}
      </div>
    </div>
  )
}
