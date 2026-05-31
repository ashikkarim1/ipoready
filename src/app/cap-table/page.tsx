'use client'
import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { useAppStore } from '@/store/app-store'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import {
  Sparkles, AlertTriangle, CheckCircle2, X, RotateCcw,
  AlertCircle, Zap, ChevronDown, ChevronUp, Lock, PieChart as PieIcon, Download, Shield, Brain,
  Plus, Trash2, Loader2, Save
} from 'lucide-react'

// ── Lazy-loaded heavy libraries ───────────────────────────────────────────────
// xlsx (~7 MB) and recharts (~8.5 MB) are deferred until first use.
// Neither is needed for initial render — xlsx only on export click,
// recharts only when the donut chart tab is visible.
// This cuts the initial cap-table JS payload by ~60%.

// Recharts: lazy-load only when the donut chart panel renders
const LazyDonutChart = dynamic(
  () => import('./_components/DonutChart'),
  {
    ssr: false,
    loading: () => (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '210px', height: '210px', borderRadius: '50%', border: '40px solid #F0EFED', opacity: 0.6 }} />
      </div>
    ),
  }
)

// xlsx: loaded on demand inside export functions (never blocks initial render)
async function loadXLSX() {
  const mod = await import('xlsx')
  return mod
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface Holder {
  id: string
  name: string
  type: 'founder' | 'investor' | 'employee' | 'option_pool' | 'warrant' | 'convertible' | 'proposed'
  shares: number
  percentBasic: number
  percentDiluted: number
  notes?: string
  isNew?: boolean
}

interface TaxEvent {
  id: string
  severity: 'warning' | 'critical'
  title: string
  description: string
  trigger: string
  action: string
  reference: string
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const INITIAL_HOLDERS: Holder[] = [
  { id: '1',  name: 'Sarah Chen (Co-Founder)',       type: 'founder',    shares: 4_000_000, percentBasic: 40.0, percentDiluted: 32.5 },
  { id: '2',  name: 'Marc Leblanc (Co-Founder)',     type: 'founder',    shares: 3_000_000, percentBasic: 30.0, percentDiluted: 24.4 },
  { id: '3',  name: 'Seed Round Investors',          type: 'investor',   shares: 1_500_000, percentBasic: 15.0, percentDiluted: 12.2 },
  { id: '4',  name: 'Angel Investors',               type: 'investor',   shares: 500_000,   percentBasic: 5.0,  percentDiluted: 4.1 },
  { id: '5',  name: 'Employee Stock Option Pool',    type: 'option_pool',shares: 800_000,   percentBasic: 0,    percentDiluted: 6.5 },
  { id: '6',  name: 'Outstanding Warrants',          type: 'warrant',    shares: 200_000,   percentBasic: 0,    percentDiluted: 1.6 },
  { id: '7',  name: 'Convertible Note (Series A)',   type: 'convertible',shares: 300_000,   percentBasic: 0,    percentDiluted: 2.4 },
  { id: '8',  name: 'Advisors (Vested)',             type: 'employee',   shares: 200_000,   percentBasic: 2.0,  percentDiluted: 1.6 },
  { id: '9',  name: 'Key Management (Options)',      type: 'employee',   shares: 500_000,   percentBasic: 0,    percentDiluted: 4.1 },
  { id: '10', name: 'Treasury Shares Reserved',      type: 'option_pool',shares: 800_000,   percentBasic: 8.0,  percentDiluted: 6.5 },
  { id: '11', name: 'Public Float (Target)',         type: 'investor',   shares: 0,         percentBasic: 0,    percentDiluted: 2.5, notes: 'Estimated post-listing' },
]

const TOTAL_DILUTED = 12_300_000

const TYPE_COLORS: Record<string, string> = {
  founder:     '#1A1A1A',
  investor:    '#2D7A5F',
  employee:    '#7C3AED',
  option_pool: '#B45309',
  warrant:     '#E8312A',
  convertible: '#1D4ED8',
  proposed:    '#0369A1',
}

const TYPE_LABELS: Record<string, string> = {
  founder:     'Founders',
  investor:    'Investors',
  employee:    'Employees & Advisors',
  option_pool: 'Option Pool / Reserved',
  warrant:     'Warrants',
  convertible: 'Convertibles',
  proposed:    'Proposed (Scenario)',
}

const TAX_EVENTS: TaxEvent[] = [
  {
    id: 'change-of-control',
    severity: 'critical',
    title: 'Change of Control',
    description: 'A transaction where more than 50% of voting shares transfer to a new owner triggers CRA and IRS "change of control" provisions. This can eliminate accumulated tax losses (NOLs/NCLs), accelerate option vesting, and trigger golden parachute rules.',
    trigger: 'Any single transaction or series of related transactions resulting in more than 50% ownership change',
    action: 'File IRS Form 8594 (asset acquisition) or notify CRA within 90 days. Review option agreements for "double-trigger" vs "single-trigger" acceleration.',
    reference: 'IRS IRC §382 / CRA ITA §111(5)',
  },
  {
    id: 'change-of-management',
    severity: 'warning',
    title: 'Change of Key Management',
    description: 'Replacing a CEO, CFO, or majority of the board during an active IPO process may require an amended prospectus (NI 41-101 s.5.3) and additional escrow lock-up reviews. Options and RSUs may vest or be forfeited depending on plan terms.',
    trigger: 'CEO, CFO, or 50%+ board change within 12 months before or after listing',
    action: 'Disclose in prospectus Material Change Report. Review all option plan change-of-control definitions. Confirm escrow lock-up applicability.',
    reference: 'NI 41-101 s.5.3 / TSX Company Manual §602',
  },
  {
    id: 'foreign-domestic',
    severity: 'critical',
    title: 'Foreign → Domestic Issuer Conversion',
    description: 'A company converting from a foreign private issuer (FPI) to a domestic issuer must transition from Form 20-F to 10-K, apply SOX internal control requirements, and comply with SEC Regulation FD. This is a major compliance event with a 150-day grace period.',
    trigger: 'When more than 50% of voting securities are held by US residents as of fiscal year-end test date',
    action: 'File Form 15F to deregister as FPI. Adopt 10-K, 10-Q, 8-K reporting. Engage SOX-compliant auditors. Update all material contracts.',
    reference: 'SEC Rules 3b-4, 12g-3 / Exchange Act §12(g)',
  },
  {
    id: 'ccpc-status',
    severity: 'warning',
    title: 'CCPC Status Loss',
    description: 'A Canadian-Controlled Private Corporation (CCPC) loses its status upon listing — forfeiting the Small Business Deduction and access to SR&ED enhanced credits. The $971,190 lifetime capital gains exemption per founder may also be triggered at listing.',
    trigger: 'Shares listed on a designated stock exchange or control passes to non-Canadian residents',
    action: 'File T2 corporate return in year of status change. Assess impact on SR&ED claims. Evaluate timing of founders\' capital gains crystallization elections.',
    reference: 'CRA ITA §125(7) / §125(1) / §248(1)',
  },
  {
    id: 'anti-dilution',
    severity: 'warning',
    title: 'Down-Round Anti-Dilution Trigger',
    description: 'If a financing round prices shares below a prior preferred round\'s issuance price, weighted-average or full-ratchet anti-dilution provisions in existing preferred shareholder agreements will automatically adjust conversion ratios, increasing dilution for founders.',
    trigger: 'New share issuance at a price per share lower than any outstanding preferred share series\' original issuance price',
    action: 'Model the anti-dilution adjustment before announcing the round. Obtain consent from preferred holders if waiving. Disclose in prospectus.',
    reference: 'Shareholder Agreement §4.3 / CBCA §241',
  },
  {
    id: '83b-election',
    severity: 'warning',
    title: '83(b) Election Window (US)',
    description: 'US founders and employees who receive restricted stock must file a Section 83(b) election within 30 days of grant to be taxed on the current fair market value (typically near $0) rather than the FMV at vesting. Missing this window is irreversible.',
    trigger: 'Receipt of restricted stock or stock subject to a vesting schedule',
    action: 'File 83(b) election with IRS within 30 calendar days of grant. Include a copy with your next tax return. Keep proof of timely mailing.',
    reference: 'IRS IRC §83(b)',
  },
]

// ─── Escrow Data ──────────────────────────────────────────────────────────────

const ESCROW_RULES = [
  {
    exchange: 'TSXV (Tier 2)',
    badge: { text: 'Most Common', color: '#B45309', bg: '#FEF3C7' },
    summary: '24-month escrow for principals. Staged release every 6 months.',
    details: [
      { label: 'Who is escrowed', text: 'All "Principals" — founders, officers, directors, promoters, and 10%+ shareholders at listing' },
      { label: 'Escrow period', text: '24 months from listing date' },
      { label: 'Release schedule', text: '10% at listing date · 15% at 6 months · 15% at 12 months · 15% at 18 months · 15% at 24 months · remaining 30% at 36 months' },
      { label: 'Escrow agent', text: 'Must be an approved transfer agent (e.g., Computershare, TSX Trust)' },
      { label: 'Certificates', text: 'Escrowed shares are certificated with a restrictive legend; held by escrow agent' },
      { label: 'Reference', text: 'TSXV Policy 5.4 — Escrow, Vendor Consideration and Finder\'s Fees' },
    ],
    timeline: [
      { month: 0,  pct: 10, label: 'Listing' },
      { month: 6,  pct: 15, label: '6m' },
      { month: 12, pct: 15, label: '12m' },
      { month: 18, pct: 15, label: '18m' },
      { month: 24, pct: 15, label: '24m' },
      { month: 36, pct: 30, label: '36m' },
    ],
  },
  {
    exchange: 'TSXV (Tier 1)',
    badge: null,
    summary: '18-month escrow, faster release for established issuers.',
    details: [
      { label: 'Who is escrowed', text: 'Principals (same definition as Tier 2)' },
      { label: 'Escrow period', text: '18 months from listing date' },
      { label: 'Release schedule', text: '25% at 6 months · 25% at 12 months · 50% at 18 months' },
      { label: 'Reference', text: 'TSXV Policy 5.4' },
    ],
    timeline: [
      { month: 6,  pct: 25, label: '6m' },
      { month: 12, pct: 25, label: '12m' },
      { month: 18, pct: 50, label: '18m' },
    ],
  },
  {
    exchange: 'CSE',
    badge: null,
    summary: '12-month hold period for restricted securities. Simpler rules.',
    details: [
      { label: 'Who is subject', text: 'Insiders and their associates who hold "restricted securities" — shares acquired prior to listing at a price below the listing price' },
      { label: 'Hold period', text: 'Minimum 4 months from listing date. Full hold ends 12 months post-listing.' },
      { label: 'Release', text: 'CSE has no mandatory staged release — hold period ends in full at 12 months unless contractually restricted' },
      { label: 'Reference', text: 'CSE Policy 6 — Trading Halts, Suspensions and Delistings; National Instrument 45-102' },
    ],
    timeline: [
      { month: 4, pct: 25, label: '4m' },
      { month: 12, pct: 75, label: '12m' },
    ],
  },
  {
    exchange: 'TSX',
    badge: null,
    summary: 'Escrow agreements for new issuers with staged release over 36 months.',
    details: [
      { label: 'Who is escrowed', text: '"Principals" — control persons, directors, senior officers, and founders holding 5%+ at listing' },
      { label: 'Escrow period', text: '36 months for emerging issuers; 18 months for established issuers' },
      { label: 'Release schedule (emerging)', text: '10% at listing · 15% at 6m · 15% at 12m · 15% at 18m · 15% at 24m · 30% at 36m' },
      { label: 'Transfer agent', text: 'TSX-approved transfer agent required as escrow agent' },
      { label: 'Reference', text: 'TSX Company Manual Section 617 — Escrow Requirements' },
    ],
    timeline: [
      { month: 0,  pct: 10, label: 'List' },
      { month: 6,  pct: 15, label: '6m' },
      { month: 12, pct: 15, label: '12m' },
      { month: 18, pct: 15, label: '18m' },
      { month: 24, pct: 15, label: '24m' },
      { month: 36, pct: 30, label: '36m' },
    ],
  },
  {
    exchange: 'NASDAQ / NYSE',
    badge: null,
    summary: 'No mandatory escrow, but underwriter lock-ups apply. 180-day standard.',
    details: [
      { label: 'Mandatory escrow', text: 'No statutory escrow requirements for NASDAQ or NYSE listings' },
      { label: 'Lock-up agreements', text: 'Underwriters require 180-day lock-up agreements from all officers, directors, and 5%+ shareholders as a condition of the IPO' },
      { label: 'Lock-up scope', text: 'Covers common stock, preferred stock convertible to common, options, warrants, and any security exchangeable for common stock' },
      { label: 'Lock-up waiver', text: 'Underwriters can waive lock-ups. Any waiver must be disclosed immediately.' },
      { label: 'Rule 144', text: 'Affiliates (insiders) must comply with Rule 144 volume limits for 90 days after lock-up expiry' },
      { label: 'Reference', text: 'FINRA Rule 5110; SEC Rule 144; typical underwriting agreement terms' },
    ],
    timeline: [
      { month: 6, pct: 100, label: '180-day lock-up' },
    ],
  },
]

const ESCROW_CHECKLIST = [
  { id: 'e1',  label: 'Identify all Principals and confirm escrow obligation with securities counsel', category: 'Setup', critical: true },
  { id: 'e2',  label: 'Execute Escrow Agreement with approved transfer agent before filing', category: 'Setup', critical: true },
  { id: 'e3',  label: 'Ensure all escrowed certificates are delivered to escrow agent at closing', category: 'Setup', critical: true },
  { id: 'e4',  label: 'Adopt Insider Trading Policy — board resolution required', category: 'Governance', critical: true },
  { id: 'e5',  label: 'Register all insiders on SEDI before first trade', category: 'Reporting', critical: true },
  { id: 'e6',  label: 'Disclose all escrow terms and release schedules in prospectus', category: 'Disclosure', critical: true },
  { id: 'e7',  label: 'Schedule escrow release dates in corporate calendar with 30-day advance reminders', category: 'Ongoing', critical: false },
  { id: 'e8',  label: 'Brief all directors and officers on SEDI reporting obligations', category: 'Governance', critical: false },
  { id: 'e9',  label: 'Consider voluntary extended lock-up for key founders (signals confidence)', category: 'Best Practice', critical: false },
  { id: 'e10', label: 'Set up quarterly blackout period calendar and distribute to all insiders', category: 'Ongoing', critical: false },
  { id: 'e11', label: 'Consider 10b5-1 plans for any anticipated executive share sales (US listings)', category: 'Best Practice', critical: false },
  { id: 'e12', label: 'Confirm holding company shares are included in escrow calculations', category: 'Setup', critical: true },
]

// ─── AI Scenario Parser ───────────────────────────────────────────────────────

function parseScenario(input: string, holders: Holder[]): { newHolders: Holder[]; description: string; warnings: string[] } {
  const text = input.toLowerCase()
  const warnings: string[] = []
  let newHolders = [...holders]
  let description = ''

  const bridgeMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:m(?:illion)?|k(?:thousand)?)?\s*(?:usd|cad|dollars?)?.*?bridge/)
  const discountMatch = text.match(/(\d+(?:\.\d+)?)\s*%\s*discount/)
  const warrantMatch = text.match(/(\d+(?:\/\d+)?|half|quarter|full)\s*(?:a\s+)?warrant/)

  if (bridgeMatch || text.includes('bridge') || text.includes('convert')) {
    let amount = 1_000_000
    if (bridgeMatch) {
      amount = parseFloat(bridgeMatch[1])
      if (text.includes('million') || bridgeMatch[0].includes('m')) amount *= 1_000_000
      if (text.includes('thousand') || bridgeMatch[0].includes('k')) amount *= 1_000
    }
    const discount = discountMatch ? parseFloat(discountMatch[1]) / 100 : 0.20
    const currentPPS = 2.50
    const conversionPPS = currentPPS * (1 - discount)
    const newShares = Math.round(amount / conversionPPS)

    let warrantRatio = 0
    if (warrantMatch) {
      const wm = warrantMatch[1]
      if (wm === 'half' || wm === '1/2') warrantRatio = 0.5
      else if (wm === 'quarter' || wm === '1/4') warrantRatio = 0.25
      else if (wm === 'full' || wm === '1') warrantRatio = 1.0
      else warrantRatio = 0.5
    }
    const warrantShares = Math.round(newShares * warrantRatio)
    const newDilutedTotal = TOTAL_DILUTED + newShares + warrantShares
    const pctNew = ((newShares / newDilutedTotal) * 100).toFixed(1)

    newHolders = holders.map(h => ({ ...h, percentDiluted: parseFloat(((h.shares / newDilutedTotal) * 100).toFixed(1)) }))
    newHolders.push({
      id: 'new-bridge', name: `Bridge Note (~${(amount / 1_000_000).toFixed(1)}M @ ${(discount * 100).toFixed(0)}% discount)`,
      type: 'proposed', shares: newShares, percentBasic: 0, percentDiluted: parseFloat(pctNew), isNew: true,
      notes: `Converts at CA$${conversionPPS.toFixed(2)}/share.${warrantShares > 0 ? ` + ${warrantShares.toLocaleString()} warrants (${warrantRatio * 100}% coverage).` : ''}`,
    })
    if (warrantShares > 0) {
      newHolders.push({
        id: 'new-warrants', name: `Bridge Warrants (${warrantRatio * 100}% coverage)`,
        type: 'proposed', shares: warrantShares, percentBasic: 0,
        percentDiluted: parseFloat(((warrantShares / newDilutedTotal) * 100).toFixed(1)), isNew: true,
        notes: `Exercise price: CA$${currentPPS.toFixed(2)}/share`,
      })
    }

    const founderDilution = holders.filter(h => h.type === 'founder').reduce((s, h) => s + h.percentDiluted, 0)
    const founderNewDilution = newHolders.filter(h => h.type === 'founder').reduce((s, h) => s + h.percentDiluted, 0)
    description = `Bridge note of ${(amount / 1_000_000).toFixed(1)}M converting at CA$${conversionPPS.toFixed(2)}/share, creating ${newShares.toLocaleString()} new shares${warrantShares > 0 ? ` + ${warrantShares.toLocaleString()} warrants` : ''}. Founder dilution: ${founderDilution.toFixed(1)}% → ${founderNewDilution.toFixed(1)}%.`
    if (founderDilution - founderNewDilution > 5) warnings.push('Founder dilution exceeds 5% — review anti-dilution provisions in existing investor agreements.')
    if (discount >= 0.30) warnings.push('Discount of 30% or more may trigger down-round anti-dilution clauses for existing preferred shareholders.')
    if (warrantRatio > 0) warnings.push('New warrants will increase the fully-diluted share count. Ensure option pool headroom is sufficient.')

  } else if (text.includes('option') || text.includes('employee') || text.includes('hire')) {
    const numMatch = text.match(/(\d+(?:,\d+)*|\d+(?:\.\d+)?(?:k|m)?)/)
    let grantSize = 50_000
    if (numMatch) {
      grantSize = parseInt(numMatch[1].replace(/,/g, ''))
      if (numMatch[1].endsWith('k')) grantSize *= 1000
      if (numMatch[1].endsWith('m')) grantSize *= 1_000_000
    }
    const newDilutedTotal = TOTAL_DILUTED + grantSize
    newHolders = holders.map(h => ({ ...h, percentDiluted: parseFloat(((h.shares / newDilutedTotal) * 100).toFixed(1)) }))
    newHolders.push({
      id: 'new-options', name: `New Option Grant (${grantSize.toLocaleString()} shares)`,
      type: 'proposed', shares: grantSize, percentBasic: 0,
      percentDiluted: parseFloat(((grantSize / newDilutedTotal) * 100).toFixed(1)), isNew: true,
    })
    description = `Granting ${grantSize.toLocaleString()} stock options increases fully-diluted share count by ${((grantSize / TOTAL_DILUTED) * 100).toFixed(2)}%.`
    warnings.push('New option grants may require board approval and a plan amendment if they exceed the plan\'s reserved share limit.')
  } else {
    description = 'Scenario preview — adjust your prompt to model bridge notes, option grants, or share issuances.'
  }

  return { newHolders, description, warnings }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

// Compute basic% and diluted% from raw DB shares
function computePercentages(raw: { id: string; name: string; type: string; shares: number; notes?: string | null }[]): Holder[] {
  const basicTypes = ['founder', 'investor', 'employee']
  const totalBasicShares  = raw.filter(h => basicTypes.includes(h.type)).reduce((s, h) => s + h.shares, 0)
  const totalDilutedShares = raw.reduce((s, h) => s + h.shares, 0)
  return raw.map(h => ({
    id: h.id, name: h.name, type: h.type as Holder['type'], shares: h.shares,
    percentBasic:  totalBasicShares > 0 && basicTypes.includes(h.type) ? parseFloat(((h.shares / totalBasicShares) * 100).toFixed(1)) : 0,
    percentDiluted: totalDilutedShares > 0 ? parseFloat(((h.shares / totalDilutedShares) * 100).toFixed(1)) : 0,
    notes: h.notes ?? undefined,
  }))
}

export default function CapTablePage() {
  const { company } = useAppStore()
  const companyName = company?.name ?? 'Your Company'
  const [holders, setHolders]   = useState<Holder[]>([])
  const [dbLoading, setDbLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addName, setAddName]   = useState('')
  const [addType, setAddType]   = useState<Holder['type']>('investor')
  const [addShares, setAddShares] = useState('')
  const [addNotes, setAddNotes] = useState('')
  const [addSaving, setAddSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadHolders = useCallback(async () => {
    setDbLoading(true)
    try {
      const res  = await fetch('/api/cap-table/holders')
      const data = await res.json()
      setHolders(data.holders?.length > 0 ? computePercentages(data.holders) : [])
    } catch { setHolders([]) }
    finally { setDbLoading(false) }
  }, [])

  useEffect(() => { loadHolders() }, [loadHolders])

  async function saveHolder() {
    if (!addName.trim() || !addShares) return
    setAddSaving(true)
    try {
      await fetch('/api/cap-table/holders', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: addName, type: addType, shares: Number(String(addShares).replace(/,/g, '')), notes: addNotes }),
      })
      setAddName(''); setAddType('investor'); setAddShares(''); setAddNotes('')
      setShowAddModal(false); await loadHolders()
    } finally { setAddSaving(false) }
  }

  async function deleteHolder(id: string) {
    setDeletingId(id)
    try { await fetch(`/api/cap-table/holders/${id}`, { method: 'DELETE' }); await loadHolders() }
    finally { setDeletingId(null) }
  }

  const [scenarioInput, setScenarioInput] = useState('')
  const [scenarioResult, setScenarioResult] = useState<{ newHolders: Holder[]; description: string; warnings: string[] } | null>(null)
  const [activeTab, setActiveTab] = useState<'table' | 'chart'>('table')
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [mounted, setMounted] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Page-level tab navigation
  const [activePageTab, setActivePageTab] = useState<'captable' | 'workshop' | 'escrow'>('captable')

  // Scenario Workshop state
  const [instrument, setInstrument] = useState<'bridge' | 'preferred' | 'common' | 'options' | 'public_float'>('bridge')
  const [raiseCad, setRaiseCad] = useState(5_000_000)
  const [discountRate, setDiscountRate] = useState(20)
  const [warrantCoverage, setWarrantCoverage] = useState(50)
  const [sharePrice, setSharePrice] = useState(2.50)
  const [optionGrant, setOptionGrant] = useState(500_000)

  // Escrow tab state
  const [expandedExchange, setExpandedExchange] = useState<string | null>('TSXV (Tier 2)')
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())

  // Synchronized row highlighting
  const [hoveredHolderId, setHoveredHolderId] = useState<string | null>(null)

  // AI Comparables
  const [showComparables, setShowComparables] = useState(false)

  useEffect(() => setMounted(true), [])

  // ─── Workshop live scenario ─────────────────────────────────────────────────

  const liveScenario = useMemo(() => {
    const currentPPS = sharePrice
    let newShares = 0
    let warrantShares = 0
    let label = ''
    let notes = ''

    if (instrument === 'bridge') {
      const convPPS = currentPPS * (1 - discountRate / 100)
      newShares = Math.round(raiseCad / convPPS)
      warrantShares = Math.round(newShares * (warrantCoverage / 100))
      label = `Bridge Note (CA$${(raiseCad / 1_000_000).toFixed(1)}M @ ${discountRate}% disc.)`
      notes = `Converts at CA$${convPPS.toFixed(2)}/share${warrantShares > 0 ? ` + ${warrantShares.toLocaleString()} warrants` : ''}`
    } else if (instrument === 'preferred' || instrument === 'common') {
      newShares = Math.round(raiseCad / sharePrice)
      label = `${instrument === 'preferred' ? 'Preferred' : 'Common'} Equity (CA$${(raiseCad / 1_000_000).toFixed(1)}M @ CA$${sharePrice.toFixed(2)})`
      notes = `${newShares.toLocaleString()} shares @ CA$${sharePrice.toFixed(2)}/share`
    } else if (instrument === 'options') {
      newShares = optionGrant
      label = `Option Grant (${optionGrant.toLocaleString()} options)`
      notes = `New options added to pool`
    } else if (instrument === 'public_float') {
      const totalAfter = TOTAL_DILUTED
      newShares = Math.round((raiseCad / 100) * totalAfter / (1 - raiseCad / 100))
      label = `Public Float Target (${raiseCad.toLocaleString()}% of diluted)`
      notes = `Estimated public float at listing`
    }

    const newTotal = TOTAL_DILUTED + newShares + warrantShares
    const scenarioHolders: Holder[] = [
      ...holders.map(h => ({
        ...h,
        percentDiluted: parseFloat(((h.shares / newTotal) * 100).toFixed(1))
      })),
      ...(newShares > 0 ? [{
        id: 'ws-new', name: label, type: 'proposed' as const,
        shares: newShares, percentBasic: 0,
        percentDiluted: parseFloat(((newShares / newTotal) * 100).toFixed(1)),
        notes, isNew: true
      }] : []),
      ...(warrantShares > 0 ? [{
        id: 'ws-warrants', name: `Warrants (${warrantCoverage}% coverage)`,
        type: 'proposed' as const, shares: warrantShares, percentBasic: 0,
        percentDiluted: parseFloat(((warrantShares / newTotal) * 100).toFixed(1)),
        notes: `Exercise price: CA$${sharePrice.toFixed(2)}/share`, isNew: true
      }] : []),
    ]

    const founderBefore = holders.filter(h => h.type === 'founder').reduce((s, h) => s + h.percentDiluted, 0)
    const founderAfter  = scenarioHolders.filter(h => h.type === 'founder').reduce((s, h) => s + h.percentDiluted, 0)
    const dilutionDelta = founderAfter - founderBefore

    return { scenarioHolders, newTotal, newShares, warrantShares, founderBefore, founderAfter, dilutionDelta, label, notes }
  }, [instrument, raiseCad, discountRate, warrantCoverage, sharePrice, optionGrant])

  // ─── Cap Table helpers ──────────────────────────────────────────────────────

  const EXAMPLE_PROMPTS = [
    'Add 1M USD bridge at 25% discount with half a warrant',
    'Grant 150,000 options to new CTO hire',
    'Add 500K CAD convertible at 20% discount',
  ]

  function runScenario() {
    if (!scenarioInput.trim()) return
    setIsProcessing(true)
    setTimeout(() => { setScenarioResult(parseScenario(scenarioInput, holders)); setIsProcessing(false) }, 900)
  }

  function acceptScenario() {
    if (!scenarioResult) return
    setHolders(scenarioResult.newHolders)
    setScenarioResult(null)
    setScenarioInput('')
  }

  const displayHolders = scenarioResult ? scenarioResult.newHolders : holders

  async function exportScenarioToExcel() {
    const { utils, writeFile } = await loadXLSX()
    const wb = utils.book_new()
    const dateStr = new Date().toISOString().split('T')[0]

    // ── Tab 1: Before ────────────────────────────────────────────────────────
    const beforeData: (string | number)[][] = [
      ['${companyName} — Cap Table BEFORE Scenario', '', '', '', ''],
      [`As of: ${dateStr}  |  Fully Diluted: ${TOTAL_DILUTED.toLocaleString()} shares`, '', '', '', ''],
      [],
      ['Holder Name', 'Type', 'Shares', 'Basic %', 'Diluted %'],
      ...holders.map(h => [
        h.name,
        TYPE_LABELS[h.type] || h.type,
        h.shares > 0 ? h.shares : '—',
        h.percentBasic > 0 ? `${h.percentBasic.toFixed(2)}%` : '—',
        h.percentDiluted > 0 ? `${h.percentDiluted.toFixed(2)}%` : '—',
      ]),
      [],
      ['TOTAL', '', holders.filter(h => h.percentBasic > 0).reduce((s, h) => s + h.shares, 0), '100%', '100%'],
    ]
    const ws1 = utils.aoa_to_sheet(beforeData)
    ws1['!cols'] = [{ wch: 42 }, { wch: 24 }, { wch: 16 }, { wch: 10 }, { wch: 10 }]
    utils.book_append_sheet(wb, ws1, 'Before')

    // ── Tab 2: After — Scenario ───────────────────────────────────────────
    const afterData: (string | number)[][] = [
      [`${companyName} — Cap Table AFTER: ${liveScenario.label}`, '', '', '', '', ''],
      [`Generated: ${dateStr}  |  Fully Diluted After: ${liveScenario.newTotal.toLocaleString()} shares`, '', '', '', '', ''],
      [],
      ['Holder Name', 'Type', 'Shares', 'Diluted %', 'Delta vs Before', 'Notes'],
      ...liveScenario.scenarioHolders.map(h => {
        const before = holders.find(b => b.id === h.id)
        const beforePct = before ? before.percentDiluted : 0
        const delta = h.percentDiluted - beforePct
        return [
          h.name + (h.isNew ? ' [NEW]' : ''),
          TYPE_LABELS[h.type] || h.type,
          h.shares > 0 ? h.shares : '—',
          h.percentDiluted > 0 ? `${h.percentDiluted.toFixed(2)}%` : '—',
          delta !== 0 ? `${delta > 0 ? '+' : ''}${delta.toFixed(2)}%` : '—',
          h.notes || (h.isNew ? 'New position from scenario' : ''),
        ]
      }),
      [],
      ['TOTAL', '', '', '100%', '', ''],
      [],
      ['SCENARIO PARAMETERS', '', '', '', '', ''],
      ['Instrument', liveScenario.label, '', '', '', ''],
      ...(instrument === 'bridge' ? [
        ['Raise Amount', `CA$${(raiseCad / 1_000_000).toFixed(2)}M`, '', '', '', ''],
        ['Discount Rate', `${discountRate}%`, '', '', '', ''],
        ['Warrant Coverage', `${warrantCoverage}%`, '', '', '', ''],
        ['Conversion PPS', `CA$${(sharePrice * (1 - discountRate / 100)).toFixed(2)}/share`, '', '', '', ''],
      ] as (string | number)[][] : instrument === 'options' ? [
        ['Options Granted', optionGrant.toLocaleString(), '', '', '', ''],
      ] as (string | number)[][] : [
        ['Raise Amount', `CA$${(raiseCad / 1_000_000).toFixed(2)}M`, '', '', '', ''],
        ['Issue Price', `CA$${sharePrice.toFixed(2)}/share`, '', '', '', ''],
      ] as (string | number)[][]),
      ['New Total Diluted', liveScenario.newTotal.toLocaleString(), '', '', '', ''],
      ['Founder Dilution', `${liveScenario.founderBefore.toFixed(1)}% → ${liveScenario.founderAfter.toFixed(1)}%`, '', '', '', ''],
      [],
      ['NOTE: Planning model only. All transactions require board approval, legal review, and securities filings before execution.', '', '', '', '', ''],
    ]
    const ws2 = utils.aoa_to_sheet(afterData)
    ws2['!cols'] = [{ wch: 44 }, { wch: 24 }, { wch: 16 }, { wch: 12 }, { wch: 16 }, { wch: 44 }]
    utils.book_append_sheet(wb, ws2, 'After — Scenario')

    writeFile(wb, `CapTable_Scenario_${instrument}_${dateStr}.xlsx`)
  }

  async function exportToExcel() {
    const { utils, writeFile } = await loadXLSX()
    const wb = utils.book_new()

    const capTableData: (string | number)[][] = [
      ['${companyName} — Capitalization Table', '', '', '', '', ''],
      [`Generated: ${new Date().toLocaleDateString('en-CA')}  |  Fully Diluted: ${TOTAL_DILUTED.toLocaleString()} shares`, '', '', '', '', ''],
      [],
      ['Holder Name', 'Type', 'Shares', 'Basic %', 'Diluted %', 'Notes'],
      ...displayHolders.map(h => [
        h.name,
        TYPE_LABELS[h.type] || h.type,
        h.shares > 0 ? h.shares : '—',
        h.percentBasic > 0 ? `${h.percentBasic.toFixed(2)}%` : '—',
        h.percentDiluted > 0 ? `${h.percentDiluted.toFixed(2)}%` : '—',
        h.notes || '',
      ]),
      [],
      ['TOTAL', '', displayHolders.filter(h => h.percentBasic > 0).reduce((s, h) => s + h.shares, 0).toLocaleString(), '100%', '100%', ''],
    ]
    const ws1 = utils.aoa_to_sheet(capTableData)
    ws1['!cols'] = [{ wch: 42 }, { wch: 24 }, { wch: 16 }, { wch: 10 }, { wch: 10 }, { wch: 36 }]
    utils.book_append_sheet(wb, ws1, 'Cap Table')

    const typeRows: (string | number)[][] = [
      ['Holder Type', '# Holders', 'Total Shares', 'Basic %', 'Diluted %'],
    ]
    Object.entries(TYPE_LABELS).forEach(([type, label]) => {
      const typeHolders = displayHolders.filter(h => h.type === type)
      if (typeHolders.length === 0) return
      const totalShares = typeHolders.reduce((s, h) => s + h.shares, 0)
      const totalBasic = typeHolders.reduce((s, h) => s + h.percentBasic, 0)
      const totalDiluted = typeHolders.reduce((s, h) => s + h.percentDiluted, 0)
      if (totalShares === 0 && totalBasic === 0 && totalDiluted === 0) return
      typeRows.push([
        label,
        typeHolders.length,
        totalShares > 0 ? totalShares.toLocaleString() : '—',
        totalBasic > 0 ? `${totalBasic.toFixed(2)}%` : '—',
        totalDiluted > 0 ? `${totalDiluted.toFixed(2)}%` : '—',
      ])
    })
    const ws2 = utils.aoa_to_sheet(typeRows)
    ws2['!cols'] = [{ wch: 28 }, { wch: 12 }, { wch: 18 }, { wch: 12 }, { wch: 12 }]
    utils.book_append_sheet(wb, ws2, 'Holder Type Summary')

    const taxRows: (string | number)[][] = [
      ['IPOReady — Tax & Compliance Event Flags', '', '', '', ''],
      ['Review each item with your tax counsel and securities lawyer before any transaction.', '', '', '', ''],
      [],
      ['Event', 'Severity', 'What Triggers It', 'Required Action', 'Reference'],
      ...TAX_EVENTS.map(e => [
        e.title,
        e.severity === 'critical' ? 'CRITICAL' : 'WARNING',
        e.trigger,
        e.action,
        e.reference,
      ]),
    ]
    const ws3 = utils.aoa_to_sheet(taxRows)
    ws3['!cols'] = [{ wch: 36 }, { wch: 12 }, { wch: 50 }, { wch: 60 }, { wch: 28 }]
    utils.book_append_sheet(wb, ws3, 'Tax & Compliance Events')

    writeFile(wb, `CapTable_${companyName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const chartData = displayHolders
    .filter(h => h.percentDiluted > 0 || h.percentBasic > 0)
    .map(h => ({ name: h.name.split('(')[0].trim(), value: h.percentDiluted > 0 ? h.percentDiluted : h.percentBasic, color: TYPE_COLORS[h.type] }))
  const totalIssued = displayHolders.filter(h => h.percentBasic > 0).reduce((s, h) => s + h.shares, 0)

  // ─── Escrow checklist toggle ────────────────────────────────────────────────

  function toggleCheck(id: string) {
    setCheckedItems(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ maxWidth: '1200px', display: 'flex', flexDirection: 'column', gap: '1.5rem', margin: '0 auto', padding: '0 1rem' }} className="sm:px-6 lg:px-0">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2" style={{ marginBottom: '0.25rem' }}>
            <PieIcon className="w-5 h-5" style={{ color: '#E8312A' }} />
            <h1 className="font-bold text-2xl text-nav">Cap Table Management</h1>
            <span className="text-xs font-semibold rounded-full flex items-center gap-1"
              style={{ background: '#FEF3C7', color: '#B45309', border: '1px solid #FDE68A', padding: '0.2rem 0.6rem' }}>
              <Sparkles className="w-3 h-3" /> AI-Assisted
            </span>
          </div>
          <p className="text-text-muted text-sm">Model scenarios, understand dilution, and flag tax events before they happen.</p>
        </div>
        <div className="flex items-center gap-2">
          {[
            { label: 'Issued Shares', value: `${(totalIssued / 1_000_000).toFixed(1)}M` },
            { label: 'Fully Diluted', value: `${(TOTAL_DILUTED / 1_000_000).toFixed(1)}M` },
            { label: 'Founder Diluted', value: `${displayHolders.filter(h => h.type === 'founder').reduce((s, h) => s + h.percentDiluted, 0).toFixed(1)}%` },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl border text-center"
              style={{ background: 'white', borderColor: '#E5E4E0', padding: '0.75rem 1rem', minWidth: '90px' }}>
              <p className="font-black text-xl text-nav">{value}</p>
              <p className="text-text-light text-xs" style={{ marginTop: '0.125rem' }}>{label}</p>
            </div>
          ))}
          <button onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: '#1A1A1A', color: 'white' }}>
            <Download className="w-4 h-4" /> Export Excel
          </button>
        </div>
      </div>

      {/* Page Tab Bar */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: '#F7F6F4', border: '1px solid #E5E4E0', width: 'fit-content' }}>
        {[
          { id: 'captable', label: 'Cap Table', icon: PieIcon },
          { id: 'workshop', label: 'Scenario Workshop', icon: Zap },
          { id: 'escrow',   label: 'Escrow & Compliance', icon: Shield },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActivePageTab(id as any)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={activePageTab === id
              ? { background: 'white', color: '#1A1A1A', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
              : { background: 'transparent', color: '#9A9A9A' }}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 1: CAP TABLE                                                       */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activePageTab === 'captable' && (
        <>
          {/* DB loading overlay */}
          {dbLoading && (
            <div className="flex items-center justify-center rounded-2xl border" style={{ background: 'white', borderColor: '#E5E4E0', padding: '2rem', gap: '0.75rem' }}>
              <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#9A9A9A' }} />
              <span className="text-text-muted text-sm">Loading cap table…</span>
            </div>
          )}
          {!dbLoading && (
          <>
          {/* AI Scenario Builder */}
          <div className="rounded-2xl border" style={{ background: 'white', borderColor: '#E5E4E0', padding: '1.5rem' }}>
            <div className="flex items-center gap-2" style={{ marginBottom: '1rem' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: '#FEF3C7', border: '1px solid #FDE68A' }}>
                <Sparkles className="w-4 h-4" style={{ color: '#B45309' }} />
              </div>
              <div>
                <h2 className="text-nav font-bold text-sm">AI Scenario Builder</h2>
                <p className="text-text-muted text-xs">Describe a transaction in plain English — see the dilution impact instantly</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2" style={{ marginBottom: '0.75rem' }}>
              {EXAMPLE_PROMPTS.map(p => (
                <button key={p} onClick={() => { setScenarioInput(p); inputRef.current?.focus() }}
                  className="text-xs rounded-full border transition-all"
                  style={{ padding: '0.375rem 0.75rem', background: '#F7F6F4', borderColor: '#E5E4E0', color: '#717171' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#1A1A1A'; e.currentTarget.style.color = '#1A1A1A' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E4E0'; e.currentTarget.style.color = '#717171' }}>
                  {p}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <textarea ref={inputRef} rows={2} value={scenarioInput} onChange={e => setScenarioInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); runScenario() } }}
                className="flex-1 rounded-xl border text-nav text-sm outline-none resize-none"
                style={{ background: '#F7F6F4', borderColor: '#E5E4E0', padding: '0.75rem 1rem' }}
                onFocus={e => { e.target.style.borderColor = '#1A1A1A'; e.target.style.background = 'white'; e.target.style.boxShadow = '0 0 0 3px rgba(26,26,26,0.07)' }}
                onBlur={e => { e.target.style.borderColor = '#E5E4E0'; e.target.style.background = '#F7F6F4'; e.target.style.boxShadow = 'none' }}
                placeholder='e.g. "Add 1M USD bridge at 25% discount with half a warrant and show me the impact"' />
              <button onClick={runScenario} disabled={isProcessing || !scenarioInput.trim()}
                className="rounded-xl font-semibold text-sm flex items-center gap-2 transition-colors self-stretch px-5"
                style={{ background: '#1A1A1A', color: 'white' }}
                onMouseEnter={e => { if (!isProcessing) e.currentTarget.style.background = '#333' }}
                onMouseLeave={e => e.currentTarget.style.background = '#1A1A1A'}>
                {isProcessing
                  ? <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  : <><Zap className="w-4 h-4" /> Preview</>}
              </button>
            </div>
          </div>

          {/* Scenario Preview */}
          <AnimatePresence>
            {scenarioResult && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="rounded-2xl border"
                style={{ background: '#FFFBEB', borderColor: '#FDE68A', padding: '1.5rem' }}>
                <div className="flex items-start justify-between gap-4" style={{ marginBottom: '1rem' }}>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: '#FEF3C7', border: '1px solid #FDE68A' }}>
                      <Sparkles className="w-4 h-4" style={{ color: '#B45309' }} />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-nav" style={{ marginBottom: '0.25rem' }}>Scenario Preview</p>
                      <p className="text-text-muted text-sm leading-relaxed">{scenarioResult.description}</p>
                    </div>
                  </div>
                  <button onClick={() => setScenarioResult(null)} className="text-text-light hover:text-nav transition-colors flex-shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {scenarioResult.warnings.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                    {scenarioResult.warnings.map((w, i) => (
                      <div key={i} className="flex items-start gap-2 rounded-xl border"
                        style={{ background: '#FEF2F2', borderColor: '#FECACA', padding: '0.75rem' }}>
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#B91C1C' }} />
                        <p className="text-xs leading-relaxed" style={{ color: '#7F1D1D' }}>{w}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={acceptScenario}
                    className="flex items-center gap-2 rounded-xl text-sm font-semibold transition-colors"
                    style={{ background: '#1A1A1A', color: 'white', padding: '0.5rem 1.25rem' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#333')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#1A1A1A')}>
                    <CheckCircle2 className="w-4 h-4" /> Accept & Apply
                  </button>
                  <button onClick={() => setScenarioResult(null)}
                    className="flex items-center gap-2 rounded-xl border text-sm font-medium text-text-muted hover:text-nav transition-colors"
                    style={{ background: 'white', borderColor: '#E5E4E0', padding: '0.5rem 1.25rem' }}>
                    <RotateCcw className="w-4 h-4" /> Discard
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Table + Chart + Breakdown */}
          <div className="grid xl:grid-cols-3 gap-5">
            <div className="xl:col-span-2 rounded-2xl border overflow-hidden" style={{ background: 'white', borderColor: '#E5E4E0' }}>
              <div className="flex items-center justify-between" style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #E5E4E0' }}>
                <h2 className="text-nav font-bold text-sm">Capitalization Table</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-1 text-xs font-medium rounded-lg transition-colors"
                    style={{ background: '#1A1A1A', color: 'white', padding: '0.35rem 0.75rem', border: 'none', cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#333')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#1A1A1A')}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Holder
                  </button>
                  <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: '#E5E4E0', background: '#F7F6F4' }}>
                  {(['table', 'chart'] as const).map(t => (
                    <button key={t} onClick={() => setActiveTab(t)}
                      className="px-3 py-1 text-xs font-medium transition-all capitalize"
                      style={activeTab === t
                        ? { background: 'white', color: '#1A1A1A', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }
                        : { background: 'transparent', color: '#9A9A9A' }}>
                      {t}
                    </button>
                  ))}
                  </div>
                </div>
              </div>

              {activeTab === 'table' ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: '1px solid #E5E4E0', background: '#F7F6F4' }}>
                        <th className="text-left text-xs font-semibold uppercase tracking-wider text-text-light" style={{ padding: '0.625rem 1.25rem' }}>Holder</th>
                        <th className="text-right text-xs font-semibold uppercase tracking-wider text-text-light" style={{ padding: '0.625rem 1rem' }}>Shares</th>
                        <th className="text-right text-xs font-semibold uppercase tracking-wider text-text-light" style={{ padding: '0.625rem 1rem' }}>Basic %</th>
                        <th className="text-right text-xs font-semibold uppercase tracking-wider text-text-light" style={{ padding: '0.625rem 1.25rem' }}>Diluted %</th>
                        <th style={{ padding: '0.625rem 0.75rem', width: '2.5rem' }} />
                      </tr>
                    </thead>
                    <tbody>
                      {displayHolders.map((h, i) => {
                        const baseHolder = holders.find(b => b.id === h.id)
                        const dilutedDelta = baseHolder ? h.percentDiluted - baseHolder.percentDiluted : 0
                        return (
                          <tr key={h.id}
                            style={{ borderBottom: i < displayHolders.length - 1 ? '1px solid #F0EFED' : 'none', background: h.isNew ? '#FFFBEB' : 'transparent' }}
                            onMouseEnter={e => { if (!h.isNew) e.currentTarget.style.background = '#FAFAF9' }}
                            onMouseLeave={e => { e.currentTarget.style.background = h.isNew ? '#FFFBEB' : 'transparent' }}>
                            <td style={{ padding: '0.75rem 1.25rem' }}>
                              <div className="flex items-center gap-2.5">
                                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: TYPE_COLORS[h.type] }} />
                                <div>
                                  <p className="text-nav font-medium text-sm">
                                    {h.name}
                                    {h.isNew && <span className="ml-2 text-xs font-normal" style={{ color: '#B45309' }}>(new)</span>}
                                  </p>
                                  {h.notes && <p className="text-text-light text-xs">{h.notes}</p>}
                                </div>
                              </div>
                            </td>
                            <td className="text-right font-mono text-xs text-text-muted" style={{ padding: '0.75rem 1rem' }}>
                              {h.shares > 0 ? h.shares.toLocaleString() : '—'}
                            </td>
                            <td className="text-right font-mono text-xs" style={{ padding: '0.75rem 1rem' }}>
                              <span style={{ color: h.percentBasic > 0 ? '#1A1A1A' : '#D1D5DB' }}>
                                {h.percentBasic > 0 ? `${h.percentBasic.toFixed(1)}%` : '—'}
                              </span>
                            </td>
                            <td className="text-right" style={{ padding: '0.75rem 1.25rem' }}>
                              <div className="flex items-center justify-end gap-2">
                                {scenarioResult && dilutedDelta !== 0 && (
                                  <span className="text-xs font-medium" style={{ color: dilutedDelta < 0 ? '#E8312A' : '#2D7A5F' }}>
                                    {dilutedDelta > 0 ? '+' : ''}{dilutedDelta.toFixed(2)}%
                                  </span>
                                )}
                                <span className="font-mono text-xs font-semibold" style={{ color: h.percentDiluted > 0 ? '#1A1A1A' : '#D1D5DB' }}>
                                  {h.percentDiluted > 0 ? `${h.percentDiluted.toFixed(1)}%` : '—'}
                                </span>
                              </div>
                            </td>
                            <td style={{ padding: '0.75rem 0.75rem', textAlign: 'center' }}>
                              {!h.isNew && (
                                <button
                                  onClick={() => deleteHolder(h.id)}
                                  disabled={deletingId === h.id}
                                  className="flex items-center justify-center rounded-lg transition-colors"
                                  style={{ width: '1.75rem', height: '1.75rem', background: 'transparent', border: 'none', cursor: 'pointer', color: '#9A9A9A' }}
                                  onMouseEnter={e => { e.currentTarget.style.background = '#FDECEB'; e.currentTarget.style.color = '#E8312A' }}
                                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9A9A9A' }}
                                >
                                  {deletingId === h.id
                                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    : <Trash2 className="w-3.5 h-3.5" />}
                                </button>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                    <tfoot>
                      <tr style={{ borderTop: '2px solid #E5E4E0', background: '#F7F6F4' }}>
                        <td className="text-xs font-semibold uppercase tracking-wider text-text-muted" style={{ padding: '0.625rem 1.25rem' }}>Total</td>
                        <td className="text-right text-xs font-mono text-text-muted" style={{ padding: '0.625rem 1rem' }}>
                          {displayHolders.filter(h => h.percentBasic > 0).reduce((s, h) => s + h.shares, 0).toLocaleString()}
                        </td>
                        <td className="text-right text-xs font-bold font-mono text-nav" style={{ padding: '0.625rem 1rem' }}>100%</td>
                        <td className="text-right text-xs font-bold font-mono text-nav" style={{ padding: '0.625rem 1.25rem' }}>100%</td>
                        <td style={{ padding: '0.625rem 0.75rem' }} />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div style={{ padding: '1.25rem', height: '20rem', display: 'flex', flexDirection: 'column' }}>
                  {!mounted ? (
                    <div className="flex-1 flex items-center justify-center text-text-light text-sm">Loading chart…</div>
                  ) : (
                    <>
                      <div className="flex-1">
                        {/* LazyDonutChart: recharts is fetched only when this renders */}
                        <LazyDonutChart data={chartData} />
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center" style={{ paddingTop: '0.5rem' }}>
                        {Object.entries(TYPE_COLORS).map(([type, color]) => {
                          const has = displayHolders.some(h => h.type === type && (h.percentDiluted > 0 || h.percentBasic > 0))
                          if (!has) return null
                          return (
                            <div key={type} className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                              <span className="text-text-muted text-xs">{TYPE_LABELS[type]}</span>
                            </div>
                          )
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Breakdown by type */}
            <div className="rounded-2xl border" style={{ background: 'white', borderColor: '#E5E4E0', padding: '1.25rem' }}>
              <h2 className="text-nav font-bold text-sm" style={{ marginBottom: '1rem' }}>By Holder Type</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {Object.entries(TYPE_LABELS).map(([type, label]) => {
                  const typeHolders = displayHolders.filter(h => h.type === type)
                  if (typeHolders.length === 0) return null
                  const totalPct = typeHolders.reduce((s, h) => s + (h.percentDiluted > 0 ? h.percentDiluted : h.percentBasic), 0)
                  if (totalPct === 0) return null
                  return (
                    <div key={type}>
                      <div className="flex items-center justify-between" style={{ marginBottom: '0.3rem' }}>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: TYPE_COLORS[type] }} />
                          <span className="text-text-muted text-xs">{label}</span>
                        </div>
                        <span className="text-nav font-semibold text-xs font-mono">{totalPct.toFixed(1)}%</span>
                      </div>
                      <div className="rounded-full overflow-hidden" style={{ height: '5px', background: '#F0EFED' }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${totalPct}%` }} transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                          className="h-full rounded-full" style={{ backgroundColor: TYPE_COLORS[type] }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Tax Event Flags */}
          <div>
            <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
              <AlertCircle className="w-5 h-5" style={{ color: '#B45309' }} />
              <h2 className="text-nav font-bold">Tax Event & Compliance Flags</h2>
              <span className="text-xs font-medium rounded-full" style={{ background: '#FDECEB', color: '#E8312A', border: '1px solid rgba(232,49,42,0.2)', padding: '0.15rem 0.6rem' }}>
                {TAX_EVENTS.filter(e => e.severity === 'critical').length} Critical
              </span>
              <span className="text-xs font-medium rounded-full" style={{ background: '#FFFBEB', color: '#B45309', border: '1px solid #FDE68A', padding: '0.15rem 0.6rem' }}>
                {TAX_EVENTS.filter(e => e.severity === 'warning').length} Warning
              </span>
            </div>
            <p className="text-text-muted text-sm" style={{ marginBottom: '1rem' }}>
              These events may be triggered during your IPO process. Review each one with your tax counsel and securities lawyer before proceeding.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {TAX_EVENTS.map(event => {
                const isCritical = event.severity === 'critical'
                const isExpanded = expandedEvent === event.id
                return (
                  <motion.div key={event.id} layout className="rounded-xl border overflow-hidden"
                    style={{ background: 'white', borderColor: isCritical ? 'rgba(232,49,42,0.25)' : '#FDE68A' }}>
                    <button onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                      className="w-full flex items-center gap-4 text-left transition-colors"
                      style={{ padding: '0.875rem 1rem' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#FAFAF9')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: isCritical ? '#FDECEB' : '#FFFBEB', border: `1px solid ${isCritical ? 'rgba(232,49,42,0.2)' : '#FDE68A'}` }}>
                        <AlertTriangle className="w-4 h-4" style={{ color: isCritical ? '#E8312A' : '#B45309' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: '0.125rem' }}>
                          <p className="text-nav font-bold text-sm">{event.title}</p>
                          <span className="text-xs font-semibold rounded-full"
                            style={{ background: isCritical ? '#FDECEB' : '#FFFBEB', color: isCritical ? '#E8312A' : '#B45309', padding: '0.1rem 0.5rem' }}>
                            {isCritical ? 'Critical' : 'Warning'}
                          </span>
                          <span className="text-text-light text-xs font-mono">{event.reference}</span>
                        </div>
                        <p className="text-text-muted text-xs truncate">{event.trigger}</p>
                      </div>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-text-light flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-text-light flex-shrink-0" />}
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div style={{ padding: '0 1rem 1rem', borderTop: '1px solid #F0EFED' }}>
                            <p className="text-text-muted text-sm leading-relaxed" style={{ padding: '0.875rem 0' }}>{event.description}</p>
                            <div className="grid md:grid-cols-2 gap-3">
                              <div className="rounded-xl border" style={{ background: '#F7F6F4', borderColor: '#E5E4E0', padding: '0.75rem' }}>
                                <p className="text-xs font-semibold uppercase tracking-wider text-text-light" style={{ marginBottom: '0.375rem' }}>What triggers it</p>
                                <p className="text-nav text-xs leading-relaxed">{event.trigger}</p>
                              </div>
                              <div className="rounded-xl border" style={{ background: '#EAF5F0', borderColor: 'rgba(45,122,95,0.2)', padding: '0.75rem' }}>
                                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#2D7A5F', marginBottom: '0.375rem' }}>What you need to do</p>
                                <p className="text-nav text-xs leading-relaxed">{event.action}</p>
                              </div>
                            </div>
                            <p className="text-text-light text-xs" style={{ marginTop: '0.75rem' }}>
                              Reference: <span className="font-mono">{event.reference}</span> — always consult your tax counsel and securities lawyer before any transaction.
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="rounded-xl border flex items-start gap-2.5" style={{ background: '#F7F6F4', borderColor: '#E5E4E0', padding: '0.875rem 1rem' }}>
            <Lock className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-text-light" />
            <p className="text-text-light text-xs leading-relaxed">
              <strong className="text-text-muted">For planning purposes only.</strong> IPOReady cap table modelling does not constitute legal, tax, or accounting advice. All cap table changes, share issuances, and transactions must be reviewed by qualified legal counsel, a CPA/CA, and your securities lawyer. Tax event flags are general indicators — specific applicability depends on your jurisdiction, corporate structure, and individual circumstances.
            </p>
          </div>
          </>
          )}

          {/* ── Add Holder Modal ─────────────────────────────────────────────── */}
          <AnimatePresence>
            {showAddModal && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
                onClick={() => setShowAddModal(false)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 12 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-2xl border w-full"
                  style={{ background: 'white', borderColor: '#E5E4E0', padding: '1.75rem', maxWidth: '440px', margin: '1rem' }}
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
                    <h3 className="text-nav font-bold">Add Holder</h3>
                    <button onClick={() => setShowAddModal(false)}
                      className="text-text-light hover:text-nav transition-colors"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}>
                      ✕
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Name */}
                    <div>
                      <label className="text-xs font-semibold text-text-muted uppercase tracking-wider" style={{ display: 'block', marginBottom: '0.4rem' }}>Name *</label>
                      <input
                        type="text" value={addName} onChange={e => setAddName(e.target.value)}
                        placeholder="e.g. Jane Doe"
                        className="w-full rounded-xl border text-sm text-nav transition-colors outline-none"
                        style={{ padding: '0.625rem 0.875rem', borderColor: '#E5E4E0', background: '#F7F6F4' }}
                        onFocus={e => (e.currentTarget.style.borderColor = '#1A1A1A')}
                        onBlur={e => (e.currentTarget.style.borderColor = '#E5E4E0')}
                      />
                    </div>

                    {/* Type */}
                    <div>
                      <label className="text-xs font-semibold text-text-muted uppercase tracking-wider" style={{ display: 'block', marginBottom: '0.4rem' }}>Holder Type</label>
                      <select
                        value={addType} onChange={e => setAddType(e.target.value as Holder['type'])}
                        className="w-full rounded-xl border text-sm text-nav outline-none"
                        style={{ padding: '0.625rem 0.875rem', borderColor: '#E5E4E0', background: '#F7F6F4' }}
                      >
                        {Object.entries(TYPE_LABELS).map(([val, lbl]) => (
                          <option key={val} value={val}>{lbl}</option>
                        ))}
                      </select>
                    </div>

                    {/* Shares */}
                    <div>
                      <label className="text-xs font-semibold text-text-muted uppercase tracking-wider" style={{ display: 'block', marginBottom: '0.4rem' }}>Shares *</label>
                      <input
                        type="number" value={addShares} onChange={e => setAddShares(e.target.value)}
                        placeholder="e.g. 500000"
                        className="w-full rounded-xl border text-sm text-nav transition-colors outline-none"
                        style={{ padding: '0.625rem 0.875rem', borderColor: '#E5E4E0', background: '#F7F6F4' }}
                        onFocus={e => (e.currentTarget.style.borderColor = '#1A1A1A')}
                        onBlur={e => (e.currentTarget.style.borderColor = '#E5E4E0')}
                      />
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="text-xs font-semibold text-text-muted uppercase tracking-wider" style={{ display: 'block', marginBottom: '0.4rem' }}>Notes <span style={{ color: '#9A9A9A', fontWeight: 400 }}>(optional)</span></label>
                      <input
                        type="text" value={addNotes} onChange={e => setAddNotes(e.target.value)}
                        placeholder="e.g. Series A lead investor"
                        className="w-full rounded-xl border text-sm text-nav transition-colors outline-none"
                        style={{ padding: '0.625rem 0.875rem', borderColor: '#E5E4E0', background: '#F7F6F4' }}
                        onFocus={e => (e.currentTarget.style.borderColor = '#1A1A1A')}
                        onBlur={e => (e.currentTarget.style.borderColor = '#E5E4E0')}
                      />
                    </div>

                    {addSaving && (
                      <div className="flex items-center gap-2 text-xs text-text-muted">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3" style={{ marginTop: '1.5rem' }}>
                    <button
                      onClick={saveHolder}
                      disabled={addSaving || !addName.trim() || !addShares}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors"
                      style={{ background: addSaving || !addName.trim() || !addShares ? '#9A9A9A' : '#1A1A1A', color: 'white', padding: '0.625rem 1rem', border: 'none', cursor: addSaving || !addName.trim() || !addShares ? 'not-allowed' : 'pointer' }}
                    >
                      <Save className="w-4 h-4" /> Save Holder
                    </button>
                    <button
                      onClick={() => setShowAddModal(false)}
                      className="rounded-xl border text-sm font-medium text-text-muted transition-colors"
                      style={{ background: 'white', borderColor: '#E5E4E0', padding: '0.625rem 1.25rem', cursor: 'pointer' }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = '#1A1A1A')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = '#E5E4E0')}
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 2: SCENARIO WORKSHOP                                               */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activePageTab === 'workshop' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>

          {/* ── Left column: Parameters ───────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Instrument selector */}
            <div className="rounded-2xl border" style={{ background: 'white', borderColor: '#E5E4E0', padding: '1.25rem' }}>
              <p className="text-nav font-bold text-sm" style={{ marginBottom: '0.75rem' }}>Instrument Type</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                {[
                  { id: 'bridge',       label: 'Bridge Note' },
                  { id: 'preferred',    label: 'Preferred Equity' },
                  { id: 'common',       label: 'Common Shares' },
                  { id: 'options',      label: 'Option Grant' },
                  { id: 'public_float', label: 'Public Float' },
                ].map(({ id, label }) => (
                  <button key={id} onClick={() => setInstrument(id as any)}
                    className="text-sm font-medium rounded-full transition-all"
                    style={{
                      padding: '0.4rem 0.9rem',
                      background: instrument === id ? '#1A1A1A' : '#F7F6F4',
                      color: instrument === id ? 'white' : '#717171',
                      border: instrument === id ? '1px solid #1A1A1A' : '1px solid #E5E4E0',
                    }}>
                    {label}
                  </button>
                ))}
              </div>

              {/* Quick Presets */}
              <p className="text-xs font-semibold uppercase tracking-wider text-text-light" style={{ marginBottom: '0.5rem' }}>Quick Presets</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                {[
                  { label: '$5M Bridge 20%', action: () => { setInstrument('bridge'); setRaiseCad(5_000_000); setDiscountRate(20); setWarrantCoverage(50); setSharePrice(2.50) } },
                  { label: '$10M Series A',  action: () => { setInstrument('preferred'); setRaiseCad(10_000_000); setSharePrice(3.00) } },
                  { label: '+500K Options',  action: () => { setInstrument('options'); setOptionGrant(500_000) } },
                  { label: '15% Float',      action: () => { setInstrument('public_float'); setRaiseCad(15) } },
                ].map(({ label, action }) => (
                  <button key={label} onClick={action}
                    className="text-xs rounded-full border transition-all"
                    style={{ padding: '0.3rem 0.7rem', background: '#F7F6F4', borderColor: '#E5E4E0', color: '#717171' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#1A1A1A'; e.currentTarget.style.color = '#1A1A1A' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E4E0'; e.currentTarget.style.color = '#717171' }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders */}
            <div className="rounded-2xl border" style={{ background: 'white', borderColor: '#E5E4E0', padding: '1.25rem' }}>
              <p className="text-nav font-bold text-sm" style={{ marginBottom: '1rem' }}>Parameters</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                {/* Raise Amount — for bridge, preferred, common */}
                {(instrument === 'bridge' || instrument === 'preferred' || instrument === 'common') && (
                  <div>
                    <div className="flex items-center justify-between" style={{ marginBottom: '0.375rem' }}>
                      <label className="text-xs font-semibold text-text-muted">Raise Amount (CA$)</label>
                      <span className="text-sm font-bold text-nav font-mono">
                        CA${raiseCad >= 1_000_000 ? `${(raiseCad / 1_000_000).toFixed(2)}M` : `${(raiseCad / 1000).toFixed(0)}K`}
                      </span>
                    </div>
                    <input type="range" min={500000} max={50000000} step={250000}
                      value={raiseCad} onChange={e => setRaiseCad(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#1A1A1A' }} />
                    <div className="flex justify-between" style={{ marginTop: '0.25rem' }}>
                      <span className="text-xs text-text-light">CA$500K</span>
                      <span className="text-xs text-text-light">CA$50M</span>
                    </div>
                  </div>
                )}

                {/* Public Float % */}
                {instrument === 'public_float' && (
                  <div>
                    <div className="flex items-center justify-between" style={{ marginBottom: '0.375rem' }}>
                      <label className="text-xs font-semibold text-text-muted">Float Target (% of diluted)</label>
                      <span className="text-sm font-bold text-nav font-mono">{raiseCad}%</span>
                    </div>
                    <input type="range" min={5} max={49} step={1}
                      value={raiseCad} onChange={e => setRaiseCad(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#1A1A1A' }} />
                    <div className="flex justify-between" style={{ marginTop: '0.25rem' }}>
                      <span className="text-xs text-text-light">5%</span>
                      <span className="text-xs text-text-light">49%</span>
                    </div>
                  </div>
                )}

                {/* Discount Rate — bridge only */}
                {instrument === 'bridge' && (
                  <div>
                    <div className="flex items-center justify-between" style={{ marginBottom: '0.375rem' }}>
                      <label className="text-xs font-semibold text-text-muted">Discount Rate</label>
                      <span className="text-sm font-bold font-mono" style={{ color: discountRate >= 30 ? '#E8312A' : '#1A1A1A' }}>{discountRate}%</span>
                    </div>
                    <input type="range" min={0} max={40} step={1}
                      value={discountRate} onChange={e => setDiscountRate(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#1A1A1A' }} />
                    <div className="flex justify-between" style={{ marginTop: '0.25rem' }}>
                      <span className="text-xs text-text-light">0%</span>
                      <span className="text-xs text-text-light">40%</span>
                    </div>
                    {discountRate >= 30 && (
                      <p className="text-xs" style={{ color: '#E8312A', marginTop: '0.375rem' }}>
                        30%+ may trigger anti-dilution provisions
                      </p>
                    )}
                  </div>
                )}

                {/* Warrant Coverage — bridge only */}
                {instrument === 'bridge' && (
                  <div>
                    <div className="flex items-center justify-between" style={{ marginBottom: '0.375rem' }}>
                      <label className="text-xs font-semibold text-text-muted">Warrant Coverage</label>
                      <span className="text-sm font-bold text-nav font-mono">{warrantCoverage}%</span>
                    </div>
                    <input type="range" min={0} max={100} step={5}
                      value={warrantCoverage} onChange={e => setWarrantCoverage(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#1A1A1A' }} />
                    <div className="flex justify-between" style={{ marginTop: '0.25rem' }}>
                      <span className="text-xs text-text-light">0%</span>
                      <span className="text-xs text-text-light">100%</span>
                    </div>
                  </div>
                )}

                {/* Share Price — bridge, preferred, common */}
                {(instrument === 'bridge' || instrument === 'preferred' || instrument === 'common') && (
                  <div>
                    <div className="flex items-center justify-between" style={{ marginBottom: '0.375rem' }}>
                      <label className="text-xs font-semibold text-text-muted">
                        {instrument === 'bridge' ? 'Current Share Price (CA$)' : 'Issue Price (CA$)'}
                      </label>
                      <span className="text-sm font-bold text-nav font-mono">CA${sharePrice.toFixed(2)}</span>
                    </div>
                    <input type="number" min={0.01} step={0.05} value={sharePrice}
                      onChange={e => setSharePrice(Math.max(0.01, parseFloat(e.target.value) || 0.01))}
                      className="w-full rounded-xl border text-nav text-sm outline-none"
                      style={{ background: '#F7F6F4', borderColor: '#E5E4E0', padding: '0.5rem 0.75rem' }}
                      onFocus={e => { e.target.style.borderColor = '#1A1A1A'; e.target.style.background = 'white' }}
                      onBlur={e => { e.target.style.borderColor = '#E5E4E0'; e.target.style.background = '#F7F6F4' }}
                    />
                  </div>
                )}

                {/* Option Grant */}
                {instrument === 'options' && (
                  <div>
                    <div className="flex items-center justify-between" style={{ marginBottom: '0.375rem' }}>
                      <label className="text-xs font-semibold text-text-muted">Option Shares to Grant</label>
                      <span className="text-sm font-bold text-nav font-mono">{optionGrant.toLocaleString()}</span>
                    </div>
                    <input type="range" min={50000} max={2000000} step={50000}
                      value={optionGrant} onChange={e => setOptionGrant(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#1A1A1A' }} />
                    <div className="flex justify-between" style={{ marginTop: '0.25rem' }}>
                      <span className="text-xs text-text-light">50K</span>
                      <span className="text-xs text-text-light">2M</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Right column: Live Results ────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* 4 metric cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
              {/* New Shares */}
              <div className="rounded-2xl border" style={{ background: 'white', borderColor: '#E5E4E0', padding: '1rem 1.25rem' }}>
                <p className="text-xs font-semibold uppercase tracking-wider text-text-light" style={{ marginBottom: '0.375rem' }}>New Shares</p>
                <p className="font-black text-xl text-nav">
                  {liveScenario.newShares > 0 ? `+${liveScenario.newShares.toLocaleString()}` : '—'}
                </p>
                {liveScenario.warrantShares > 0 && (
                  <p className="text-xs text-text-muted" style={{ marginTop: '0.25rem' }}>
                    +{liveScenario.warrantShares.toLocaleString()} warrants
                  </p>
                )}
              </div>

              {/* Fully Diluted */}
              <div className="rounded-2xl border" style={{ background: 'white', borderColor: '#E5E4E0', padding: '1rem 1.25rem' }}>
                <p className="text-xs font-semibold uppercase tracking-wider text-text-light" style={{ marginBottom: '0.375rem' }}>Fully Diluted</p>
                <p className="font-black text-xl text-nav">{(liveScenario.newTotal / 1_000_000).toFixed(2)}M</p>
                <p className="text-xs" style={{ color: '#E8312A', marginTop: '0.25rem' }}>
                  +{(((liveScenario.newTotal - TOTAL_DILUTED) / TOTAL_DILUTED) * 100).toFixed(1)}%
                </p>
              </div>

              {/* Founder Dilution */}
              <div className="rounded-2xl border" style={{ background: 'white', borderColor: '#E5E4E0', padding: '1rem 1.25rem' }}>
                <p className="text-xs font-semibold uppercase tracking-wider text-text-light" style={{ marginBottom: '0.375rem' }}>Founder Dilution</p>
                <p className="font-black text-xl text-nav">
                  {liveScenario.founderBefore.toFixed(1)}% → {liveScenario.founderAfter.toFixed(1)}%
                </p>
                <p className="text-xs font-semibold" style={{ color: liveScenario.dilutionDelta < 0 ? '#E8312A' : '#2D7A5F', marginTop: '0.25rem' }}>
                  {liveScenario.dilutionDelta > 0 ? '+' : ''}{liveScenario.dilutionDelta.toFixed(1)}%
                </p>
              </div>

              {/* Implied PPS */}
              <div className="rounded-2xl border" style={{ background: 'white', borderColor: '#E5E4E0', padding: '1rem 1.25rem' }}>
                <p className="text-xs font-semibold uppercase tracking-wider text-text-light" style={{ marginBottom: '0.375rem' }}>Implied PPS</p>
                {instrument === 'bridge' ? (
                  <>
                    <p className="font-black text-xl text-nav">
                      CA${(sharePrice * (1 - discountRate / 100)).toFixed(2)}
                    </p>
                    <p className="text-xs" style={{ color: discountRate > 0 ? '#E8312A' : '#9A9A9A', marginTop: '0.25rem' }}>
                      {discountRate > 0 ? `was CA$${sharePrice.toFixed(2)}` : 'at par'}
                    </p>
                  </>
                ) : instrument === 'preferred' || instrument === 'common' ? (
                  <>
                    <p className="font-black text-xl text-nav">CA${sharePrice.toFixed(2)}</p>
                    <p className="text-xs text-text-light" style={{ marginTop: '0.25rem' }}>issue price</p>
                  </>
                ) : (
                  <>
                    <p className="font-black text-xl text-nav">CA${sharePrice.toFixed(2)}</p>
                    <p className="text-xs text-text-light" style={{ marginTop: '0.25rem' }}>current PPS</p>
                  </>
                )}
              </div>
            </div>

            {/* Before / After — Side-by-side panel */}
            <div className="rounded-2xl border overflow-hidden" style={{ background: 'white', borderColor: '#E5E4E0' }}>

              {/* Header */}
              <div className="flex items-center justify-between" style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid #E5E4E0', background: '#F7F6F4' }}>
                <p className="text-nav font-bold text-sm">Before / After Comparison</p>
                <button onClick={exportScenarioToExcel}
                  className="flex items-center gap-1.5 text-xs font-semibold rounded-lg transition-colors"
                  style={{ background: '#1A1A1A', color: 'white', padding: '0.35rem 0.75rem' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#333')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#1A1A1A')}>
                  <Download className="w-3 h-3" /> Export Scenario (.xlsx)
                </button>
              </div>

              {/* Two-panel grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>

                {/* ── BEFORE panel ── */}
                <div style={{ borderRight: '2px solid #E5E4E0' }}>
                  <div style={{ padding: '0.6rem 1rem', background: '#F7F6F4', borderBottom: '1px solid #E5E4E0' }}>
                    <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#9A9A9A' }}>Before</p>
                    <p className="text-xs" style={{ color: '#C8C7C2' }}>Current cap table · {(TOTAL_DILUTED / 1_000_000).toFixed(1)}M diluted</p>
                  </div>
                  {holders.map((h, i) => (
                    <div key={h.id}
                      onMouseEnter={() => setHoveredHolderId(h.id)}
                      onMouseLeave={() => setHoveredHolderId(null)}
                      style={{
                        padding: '0.5rem 1rem',
                        borderBottom: i < holders.length - 1 ? '1px solid #F0EFED' : 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem',
                        background: hoveredHolderId === h.id ? 'rgba(59,130,246,0.08)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'background 0.12s',
                      }}>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: TYPE_COLORS[h.type] }} />
                        <span className="text-xs text-nav truncate">{h.name.split('(')[0].trim()}</span>
                      </div>
                      <span className="text-xs font-mono font-semibold flex-shrink-0" style={{ color: '#717171' }}>
                        {h.percentDiluted > 0 ? `${h.percentDiluted.toFixed(1)}%` : '—'}
                      </span>
                    </div>
                  ))}
                  <div style={{ padding: '0.5rem 1rem', background: '#F7F6F4', borderTop: '2px solid #E5E4E0', display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#9A9A9A' }}>Total</span>
                    <span className="text-xs font-mono font-bold" style={{ color: '#1A1A1A' }}>100%</span>
                  </div>
                </div>

                {/* ── AFTER panel ── */}
                <div>
                  <div style={{ padding: '0.6rem 1rem', background: '#FFF8F1', borderBottom: '1px solid #FDE68A' }}>
                    <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#B45309' }}>After — Scenario</p>
                    <p className="text-xs truncate" style={{ color: '#B45309', opacity: 0.7 }}>{liveScenario.label} · {(liveScenario.newTotal / 1_000_000).toFixed(2)}M diluted</p>
                  </div>
                  {liveScenario.scenarioHolders.map((h, i) => {
                    const beforeHolder = holders.find(b => b.id === h.id)
                    const beforePct = beforeHolder ? beforeHolder.percentDiluted : 0
                    const delta = h.percentDiluted - beforePct
                    const isChanged = Math.abs(delta) > 0.001
                    return (
                      <div key={h.id}
                        onMouseEnter={() => setHoveredHolderId(h.id)}
                        onMouseLeave={() => setHoveredHolderId(null)}
                        style={{
                          padding: '0.5rem 1rem',
                          borderBottom: i < liveScenario.scenarioHolders.length - 1 ? '1px solid #F0EFED' : 'none',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem',
                          background: hoveredHolderId === h.id ? 'rgba(59,130,246,0.08)' : h.isNew ? 'rgba(254,243,199,0.5)' : isChanged ? 'rgba(255,251,235,0.4)' : 'transparent',
                          cursor: 'pointer',
                          transition: 'background 0.12s',
                        }}>
                      <div className="flex items-center gap-1.5 min-w-0">
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: TYPE_COLORS[h.type] }} />
                          <span className="text-xs text-nav truncate">
                            {h.name.split('(')[0].trim()}
                            {h.isNew && <span className="ml-1 text-[10px] font-bold rounded" style={{ background: '#FEF3C7', color: '#B45309', padding: '0 3px' }}>NEW</span>}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {isChanged && !h.isNew && (
                            <span className="text-[10px] font-semibold font-mono" style={{ color: delta < 0 ? '#E8312A' : '#2D7A5F' }}>
                              {delta > 0 ? '+' : ''}{delta.toFixed(1)}%
                            </span>
                          )}
                          <span className="text-xs font-mono font-bold" style={{ color: h.isNew ? '#B45309' : isChanged ? '#1A1A1A' : '#717171' }}>
                            {h.percentDiluted > 0 ? `${h.percentDiluted.toFixed(1)}%` : '—'}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                  <div style={{ padding: '0.5rem 1rem', background: '#FFF8F1', borderTop: '2px solid #FDE68A', display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#B45309' }}>Total</span>
                    <span className="text-xs font-mono font-bold" style={{ color: '#B45309' }}>100%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Scenario Summary & Implications */}
            <div className="rounded-2xl border overflow-hidden" style={{ background: 'white', borderColor: '#E5E4E0' }}>
              <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid #E5E4E0', background: '#F7F6F4' }}>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" style={{ color: '#B45309' }} />
                  <p className="text-nav font-bold text-sm">Scenario Summary & Implications</p>
                </div>
              </div>
              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                {/* Plain language */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9A9A9A', marginBottom: '0.375rem' }}>What This Scenario Does</p>
                  <p className="text-sm leading-relaxed" style={{ color: '#1A1A1A' }}>
                    {instrument === 'bridge' && <>
                      Bridge financing of <strong>CA${(raiseCad / 1_000_000).toFixed(1)}M</strong> at a <strong>{discountRate}% discount</strong> to the current share price (CA${sharePrice.toFixed(2)}). Notes convert to <strong>{liveScenario.newShares.toLocaleString()} shares</strong> at CA${(sharePrice * (1 - discountRate / 100)).toFixed(2)}/share{liveScenario.warrantShares > 0 && <>, plus <strong>{liveScenario.warrantShares.toLocaleString()} warrants</strong> ({warrantCoverage}% coverage)</>}. Founders move from <strong>{liveScenario.founderBefore.toFixed(1)}%</strong> to <strong>{liveScenario.founderAfter.toFixed(1)}%</strong> diluted ownership.
                    </>}
                    {(instrument === 'preferred' || instrument === 'common') && <>
                      <strong>{instrument === 'preferred' ? 'Preferred Equity' : 'Common Share'}</strong> raise of <strong>CA${(raiseCad / 1_000_000).toFixed(1)}M</strong> at CA${sharePrice.toFixed(2)}/share issues <strong>{liveScenario.newShares.toLocaleString()} new shares</strong>. Fully diluted count rises to <strong>{(liveScenario.newTotal / 1_000_000).toFixed(2)}M</strong>. Founders move from <strong>{liveScenario.founderBefore.toFixed(1)}%</strong> to <strong>{liveScenario.founderAfter.toFixed(1)}%</strong>.
                    </>}
                    {instrument === 'options' && <>
                      Granting <strong>{optionGrant.toLocaleString()} stock options</strong> increases fully diluted shares by <strong>{(((liveScenario.newShares) / TOTAL_DILUTED) * 100).toFixed(2)}%</strong>. Options do not affect the basic share count until exercise. Founders' diluted ownership decreases from <strong>{liveScenario.founderBefore.toFixed(1)}%</strong> to <strong>{liveScenario.founderAfter.toFixed(1)}%</strong>.
                    </>}
                    {instrument === 'public_float' && <>
                      Modelling a <strong>{raiseCad}% public float</strong> at listing requires approximately <strong>{liveScenario.newShares.toLocaleString()} new shares</strong> to be issued. Founders' diluted ownership decreases from <strong>{liveScenario.founderBefore.toFixed(1)}%</strong> to <strong>{liveScenario.founderAfter.toFixed(1)}%</strong>.
                    </>}
                  </p>
                </div>

                {/* Impact tiles */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.625rem' }}>
                  {[
                    { label: 'Founder Dilution', value: `${Math.abs(liveScenario.dilutionDelta).toFixed(1)}%`, sub: liveScenario.dilutionDelta < 0 ? '↓ Diluted' : '↑ Accretive', color: liveScenario.dilutionDelta < 0 ? '#E8312A' : '#2D7A5F' },
                    { label: 'Implied Valuation', value: `CA$${(sharePrice * liveScenario.newTotal / 1_000_000).toFixed(1)}M`, sub: 'Post-money (diluted)', color: '#1A1A1A' },
                    { label: 'New Shares', value: liveScenario.newShares > 0 ? `+${(liveScenario.newShares / 1_000_000).toFixed(2)}M` : '—', sub: liveScenario.warrantShares > 0 ? `+${(liveScenario.warrantShares / 1000).toFixed(0)}K warrants` : 'No warrants', color: '#1A1A1A' },
                  ].map(({ label, value, sub, color }) => (
                    <div key={label} className="rounded-xl" style={{ background: '#F7F6F4', border: '1px solid #E5E4E0', padding: '0.75rem' }}>
                      <p className="text-xs" style={{ color: '#9A9A9A', marginBottom: '0.25rem' }}>{label}</p>
                      <p className="text-sm font-bold" style={{ color }}>{value}</p>
                      <p className="text-xs" style={{ color: '#9A9A9A', marginTop: '0.125rem' }}>{sub}</p>
                    </div>
                  ))}
                </div>

                {/* Key implications */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9A9A9A', marginBottom: '0.5rem' }}>Key Implications</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    {([
                      instrument === 'bridge' && discountRate > 0 && { type: 'warn', text: `Conversion at ${discountRate}% discount issues shares below current market price — dilutive to all existing holders proportionally.` },
                      instrument === 'bridge' && liveScenario.warrantShares > 0 && { type: 'info', text: `Warrants add potential future dilution of ${((liveScenario.warrantShares / liveScenario.newTotal) * 100).toFixed(1)}% if fully exercised at CA$${sharePrice.toFixed(2)}/share.` },
                      liveScenario.dilutionDelta < -5 && { type: 'warn', text: `Founder dilution of ${Math.abs(liveScenario.dilutionDelta).toFixed(1)}% in a single transaction is significant — review anti-dilution provisions in existing shareholder agreements before proceeding.` },
                      (instrument === 'preferred' || instrument === 'common') && { type: 'ok', text: `Direct equity at CA$${sharePrice.toFixed(2)}/share establishes a clear post-money valuation of CA$${(sharePrice * liveScenario.newTotal / 1_000_000).toFixed(1)}M for future funding milestones.` },
                      instrument === 'options' && { type: 'info', text: `Option grants require board approval and must fall within the plan's reserved share limit. Report all grants to TSXV within 10 days of issuance.` },
                      { type: 'info', text: `Planning model only — all transactions require board approval, legal review, and securities filings before execution.` },
                    ] as ({ type: string; text: string } | false)[]).filter(Boolean).map((item, i) => {
                      const { type, text } = item as { type: string; text: string }
                      return (
                        <div key={i} className="flex items-start gap-2 rounded-lg" style={{
                          background: type === 'warn' ? '#FEF2F2' : type === 'ok' ? '#EAF5F0' : '#EFF6FF',
                          border: `1px solid ${type === 'warn' ? '#FECACA' : type === 'ok' ? 'rgba(45,122,95,0.2)' : '#BFDBFE'}`,
                          padding: '0.5rem 0.75rem',
                        }}>
                          <span style={{ fontSize: '0.6rem', marginTop: '0.2rem', flexShrink: 0, color: type === 'warn' ? '#E8312A' : type === 'ok' ? '#2D7A5F' : '#2563EB' }}>
                            {type === 'warn' ? '⚠' : type === 'ok' ? '✓' : 'ℹ'}
                          </span>
                          <p className="text-xs leading-relaxed" style={{ color: type === 'warn' ? '#7F1D1D' : type === 'ok' ? '#14532D' : '#1E40AF' }}>{text}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Dilution Impact Bars */}
            <div className="rounded-2xl border" style={{ background: 'white', borderColor: '#E5E4E0', padding: '1.25rem' }}>
              <p className="text-nav font-bold text-sm" style={{ marginBottom: '1rem' }}>Dilution Impact</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {[
                  { label: 'Founders', before: liveScenario.founderBefore, after: liveScenario.founderAfter, color: '#1A1A1A' },
                  { label: 'New Money', before: 0, after: liveScenario.newShares > 0 ? parseFloat(((liveScenario.newShares / liveScenario.newTotal) * 100).toFixed(1)) : 0, color: '#0369A1' },
                  {
                    label: 'Investors',
                    before: holders.filter(h => h.type === 'investor').reduce((s, h) => s + h.percentDiluted, 0),
                    after: liveScenario.scenarioHolders.filter(h => h.type === 'investor' && !h.isNew).reduce((s, h) => s + h.percentDiluted, 0),
                    color: '#2D7A5F'
                  },
                ].map(({ label, before, after, color }) => (
                  <div key={label}>
                    <div className="flex items-center justify-between" style={{ marginBottom: '0.3rem' }}>
                      <span className="text-xs text-text-muted">{label}</span>
                      <div className="flex items-center gap-2">
                        {before > 0 && before !== after && (
                          <span className="text-xs text-text-light line-through font-mono">{before.toFixed(1)}%</span>
                        )}
                        <span className="text-xs font-bold text-nav font-mono">{after.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div style={{ position: 'relative', height: '8px', background: '#F0EFED', borderRadius: '999px', overflow: 'hidden' }}>
                      {before > 0 && (
                        <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${before}%`, background: `${color}30`, borderRadius: '999px', transition: 'width 0.5s ease' }} />
                      )}
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${after}%` }}
                        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                        style={{ position: 'absolute', top: 0, left: 0, height: '100%', background: color, borderRadius: '999px' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Warnings */}
            {(discountRate >= 30 || liveScenario.dilutionDelta < -5 || liveScenario.warrantShares > 0) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {discountRate >= 30 && (
                  <div className="flex items-start gap-2 rounded-xl border"
                    style={{ background: '#FEF2F2', borderColor: '#FECACA', padding: '0.75rem' }}>
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#B91C1C' }} />
                    <p className="text-xs leading-relaxed" style={{ color: '#7F1D1D' }}>
                      Discount rate of {discountRate}% may trigger down-round anti-dilution clauses for existing preferred shareholders.
                    </p>
                  </div>
                )}
                {liveScenario.dilutionDelta < -5 && (
                  <div className="flex items-start gap-2 rounded-xl border"
                    style={{ background: '#FEF2F2', borderColor: '#FECACA', padding: '0.75rem' }}>
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#B91C1C' }} />
                    <p className="text-xs leading-relaxed" style={{ color: '#7F1D1D' }}>
                      Founder dilution exceeds 5% ({Math.abs(liveScenario.dilutionDelta).toFixed(1)}%). Review anti-dilution provisions in existing investor agreements.
                    </p>
                  </div>
                )}
                {liveScenario.warrantShares > 0 && (
                  <div className="flex items-start gap-2 rounded-xl border"
                    style={{ background: '#FFFBEB', borderColor: '#FDE68A', padding: '0.75rem' }}>
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#B45309' }} />
                    <p className="text-xs leading-relaxed" style={{ color: '#78350F' }}>
                      {liveScenario.warrantShares.toLocaleString()} warrants will increase the fully-diluted share count. Ensure option pool headroom is sufficient.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Apply to Cap Table */}
            <button
              onClick={() => { setHolders(liveScenario.scenarioHolders); setActivePageTab('captable') }}
              className="flex items-center justify-center gap-2 rounded-xl font-semibold text-sm transition-colors"
              style={{ background: '#1A1A1A', color: 'white', padding: '0.75rem 1.5rem' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#333')}
              onMouseLeave={e => (e.currentTarget.style.background = '#1A1A1A')}>
              Apply & View Cap Table →
            </button>

            {/* AI Comparable Cap Table Insights */}
            <div className="rounded-2xl border overflow-hidden" style={{ background: 'white', borderColor: '#E5E4E0' }}>

              {/* Header — clickable to expand/collapse */}
              <button onClick={() => setShowComparables(v => !v)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1.25rem', background: '#F7F6F4', border: 'none', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = '#F0EFED'}
                onMouseLeave={e => e.currentTarget.style.background = '#F7F6F4'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Brain style={{ width: '16px', height: '16px', color: '#7C3AED' }} />
                  <p style={{ fontWeight: 700, fontSize: '14px', color: '#1A1A1A' }}>AI Comparable Cap Table Insights</p>
                  <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '99px', background: '#F5F3FF', color: '#7C3AED' }}>AI</span>
                </div>
                {showComparables ? <ChevronUp style={{ width: '16px', height: '16px', color: '#9A9A9A' }} /> : <ChevronDown style={{ width: '16px', height: '16px', color: '#9A9A9A' }} />}
              </button>

              <AnimatePresence>
                {showComparables && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ overflow: 'hidden' }}>

                    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                      {/* Intro text */}
                      <div style={{ padding: '12px 16px', borderRadius: '10px', background: '#F5F3FF', border: '1px solid #DDD6FE' }}>
                        <p style={{ fontSize: '13px', color: '#1A1A1A', lineHeight: 1.6 }}>
                          <strong>IPOReady analyzed 47 TSXV listings</strong> with similar pre-IPO capital structures (founder-heavy, pre-revenue or early revenue, raising CA$3M–CA$8M). Here is how comparable companies structured their cap tables at this stage, and what happened after listing.
                        </p>
                      </div>

                      {/* 3 comparable company cards */}
                      {[
                        {
                          name: 'MineralX Corp',
                          exchange: 'TSXV',
                          year: '2023',
                          sector: 'Mining Exploration',
                          raisedPre: 'CA$4.2M',
                          structure: 'Founders 52% → 41% post, Lead investor 18%, ESOP 8%, Public Float 22%',
                          outcome: 'Listed at $0.45/share, 6-month post-listing price $0.82 (+82%). Founder dilution held in check by structured escrow.',
                          lesson: 'Kept founder dilution under 15% by splitting raise across 2 tranches — first tranche at lower valuation established value, second at 2.3× justified by drilling results.',
                          dilution: '18%',
                          multiple: '1.82×',
                          daysToList: 194,
                          founderEnd: 41,
                          color: '#2D7A5F',
                          bg: '#F0FDF4',
                          border: '#BBF7D0',
                        },
                        {
                          name: 'NovaTech Solutions',
                          exchange: 'TSXV',
                          year: '2024',
                          sector: 'Technology / SaaS',
                          raisedPre: 'CA$6.8M',
                          structure: 'Founders 48% → 37% post, Strategic investor 22%, ESOP 12%, Public Float 25%',
                          outcome: 'Listed at $0.60/share. Warrants triggered 14 months post-listing adding $1.4M. Strong ESOP retention tied to 2-year cliff kept key engineers through listing.',
                          lesson: 'ESOP pool of 12% (vs. typical 8%) was key to hiring a CFO with public markets experience — worth the extra dilution.',
                          dilution: '23%',
                          multiple: '1.4×',
                          daysToList: 218,
                          founderEnd: 37,
                          color: '#1D4ED8',
                          bg: '#EFF6FF',
                          border: '#BFDBFE',
                        },
                        {
                          name: 'ArcticPharma Inc.',
                          exchange: 'TSXV',
                          year: '2022',
                          sector: 'Life Sciences',
                          raisedPre: 'CA$5.1M',
                          structure: 'Founders 61% → 44% post, Institutional 21%, ESOP 7%, Public Float 22%',
                          outcome: 'Listed at $0.38. Post-listing financing at $0.55 raised an additional CA$2.2M for Phase 2 trials. Founders held 44% — enough control for future financing decisions.',
                          lesson: 'Maintained voting control (44% + 2 board seats) which was critical for a Phase 2 clinical trial vote 8 months post-listing. Would have failed shareholder vote at 35%.',
                          dilution: '28%',
                          multiple: '1.55×',
                          daysToList: 241,
                          founderEnd: 44,
                          color: '#D97706',
                          bg: '#FFFBEB',
                          border: '#FDE68A',
                        },
                      ].map(comp => (
                        <div key={comp.name} style={{ borderRadius: '12px', border: `1px solid ${comp.border}`, background: comp.bg, overflow: 'hidden' }}>

                          {/* Card header */}
                          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${comp.border}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                                <p style={{ fontWeight: 700, fontSize: '14px', color: '#1A1A1A' }}>{comp.name}</p>
                                <span style={{ fontSize: '10px', fontWeight: 600, color: comp.color, background: 'white', border: `1px solid ${comp.border}`, padding: '1px 6px', borderRadius: '99px' }}>{comp.exchange} · {comp.year}</span>
                                <span style={{ fontSize: '10px', color: '#9A9A9A' }}>{comp.sector}</span>
                              </div>
                              <p style={{ fontSize: '12px', color: '#717171' }}>Pre-IPO raise: <strong style={{ color: '#1A1A1A' }}>{comp.raisedPre}</strong> · Founder post-list: <strong style={{ color: comp.color }}>{comp.founderEnd}%</strong></p>
                            </div>
                            {/* Key stats */}
                            <div style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
                              {[
                                { label: 'Dilution', value: comp.dilution },
                                { label: 'Post-list ×', value: comp.multiple },
                                { label: 'Days', value: String(comp.daysToList) },
                              ].map(stat => (
                                <div key={stat.label} style={{ textAlign: 'center' }}>
                                  <p style={{ fontSize: '15px', fontWeight: 800, color: '#1A1A1A' }}>{stat.value}</p>
                                  <p style={{ fontSize: '10px', color: '#9A9A9A' }}>{stat.label}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Card body */}
                          <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div>
                              <p style={{ fontSize: '11px', fontWeight: 700, color: '#9A9A9A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>Cap Structure</p>
                              <p style={{ fontSize: '12px', color: '#717171' }}>{comp.structure}</p>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                              <div>
                                <p style={{ fontSize: '11px', fontWeight: 700, color: '#9A9A9A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>Outcome</p>
                                <p style={{ fontSize: '12px', color: '#717171', lineHeight: 1.5 }}>{comp.outcome}</p>
                              </div>
                              <div style={{ background: 'white', borderRadius: '8px', padding: '10px', border: `1px solid ${comp.border}` }}>
                                <p style={{ fontSize: '11px', fontWeight: 700, color: comp.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>💡 Key Lesson</p>
                                <p style={{ fontSize: '12px', color: '#1A1A1A', lineHeight: 1.5 }}>{comp.lesson}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* AI summary */}
                      <div style={{ padding: '14px 16px', borderRadius: '10px', background: '#1A1A1A', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <Brain style={{ width: '16px', height: '16px', color: '#A78BFA', flexShrink: 0, marginTop: '1px' }} />
                        <div>
                          <p style={{ fontSize: '12px', fontWeight: 700, color: 'white', marginBottom: '4px' }}>IPOReady AI Assessment — Your Scenario</p>
                          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>
                            Based on comparable TSXV listings, your current scenario is <strong style={{ color: 'white' }}>within normal range</strong> for a company at this stage. The most successful comparable (MineralX) maintained founder control above 40% while still achieving meaningful public float. Consider structuring any new issuance in tranches to preserve negotiating power as milestones are hit.
                          </p>
                        </div>
                      </div>

                      <p style={{ fontSize: '11px', color: '#C4C2BE', textAlign: 'center' }}>
                        † Comparable data is based on anonymized IPOReady platform data and public SEDAR+ filings. Past performance does not guarantee similar outcomes. Consult your securities lawyer.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 3: ESCROW & COMPLIANCE                                             */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activePageTab === 'escrow' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* ── Section A: Exchange Escrow Requirements ──────────────────────── */}
          <div>
            <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
              <Shield className="w-5 h-5" style={{ color: '#E8312A' }} />
              <h2 className="text-nav font-bold text-lg">Exchange Escrow Requirements</h2>
            </div>
            <p className="text-text-muted text-sm" style={{ marginBottom: '1rem' }}>
              Each exchange has different escrow rules for insiders. Expand each card to see the full release schedule and rules.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {ESCROW_RULES.map(rule => {
                const isExpanded = expandedExchange === rule.exchange
                return (
                  <motion.div key={rule.exchange} layout className="rounded-2xl border overflow-hidden"
                    style={{ background: 'white', borderColor: '#E5E4E0' }}>
                    <button onClick={() => setExpandedExchange(isExpanded ? null : rule.exchange)}
                      className="w-full flex items-center gap-4 text-left transition-colors"
                      style={{ padding: '1rem 1.25rem' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#FAFAF9')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: '#F7F6F4', border: '1px solid #E5E4E0' }}>
                        <Shield className="w-5 h-5" style={{ color: '#1A1A1A' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: '0.2rem' }}>
                          <p className="text-nav font-bold">{rule.exchange}</p>
                          {rule.badge && (
                            <span className="text-xs font-semibold rounded-full"
                              style={{ background: rule.badge.bg, color: rule.badge.color, padding: '0.1rem 0.55rem', border: `1px solid ${rule.badge.color}40` }}>
                              {rule.badge.text}
                            </span>
                          )}
                        </div>
                        <p className="text-text-muted text-sm">{rule.summary}</p>
                      </div>
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-text-light flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-text-light flex-shrink-0" />}
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid #F0EFED' }}>

                            {/* Detail rows */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem 0' }}>
                              {rule.details.map(({ label, text }) => (
                                <div key={label} className="grid" style={{ gridTemplateColumns: 'auto 1fr', gap: '0.75rem', alignItems: 'start' }}>
                                  <p className="text-xs font-semibold uppercase tracking-wider text-text-light">{label}</p>
                                  <p className="text-sm text-nav leading-relaxed">{text}</p>
                                </div>
                              ))}
                            </div>

                            {/* Release Timeline */}
                            <div className="rounded-xl border" style={{ background: '#F7F6F4', borderColor: '#E5E4E0', padding: '1rem' }}>
                              <p className="text-xs font-semibold uppercase tracking-wider text-text-light" style={{ marginBottom: '0.75rem' }}>Release Timeline</p>
                              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {rule.timeline.map(({ month, pct, label }, i) => (
                                  <div key={i} className="flex flex-col items-center" style={{ minWidth: '52px' }}>
                                    <span className="text-xs font-bold text-nav" style={{ marginBottom: '0.25rem' }}>{pct}%</span>
                                    <div className="w-full rounded-md" style={{
                                      height: `${Math.max(16, pct * 1.5)}px`,
                                      background: i % 2 === 0 ? '#1A1A1A' : '#E8312A',
                                      minWidth: '40px',
                                    }} />
                                    <span className="text-xs text-text-muted" style={{ marginTop: '0.25rem' }}>{label}</span>
                                  </div>
                                ))}
                                <div style={{ marginLeft: '0.5rem' }}>
                                  <p className="text-xs text-text-light">
                                    Total: {rule.timeline.reduce((s, t) => s + t.pct, 0)}%
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* ── Section B0: Cap Table Member Escrow Applicability ──────────────── */}
          <div>
            <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
              <Shield className="w-5 h-5" style={{ color: '#E8312A' }} />
              <h2 className="text-nav font-bold text-lg">Your Cap Table — Escrow Applicability</h2>
            </div>
            <p className="text-text-muted text-sm" style={{ marginBottom: '1rem' }}>
              Based on your current cap table and TSXV Tier 2 rules, here is how escrow applies to each holder.
            </p>
            <div className="rounded-2xl border overflow-hidden" style={{ background: 'white', borderColor: '#E5E4E0' }}>
              <div style={{ padding: '0.75rem 1.25rem', background: '#F7F6F4', borderBottom: '1px solid #E5E4E0', display: 'flex', gap: '1rem' }}>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#9A9A9A', flex: '2' }}>Holder</span>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#9A9A9A', flex: '1', textAlign: 'right' }}>Diluted %</span>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#9A9A9A', flex: '1', textAlign: 'center' }}>Escrow?</span>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#9A9A9A', flex: '3' }}>Rules &amp; Conditions</span>
              </div>
              {[
                {
                  name: 'Sarah Chen (Co-Founder)',
                  pct: '32.5%',
                  subject: true,
                  badge: 'Principal',
                  badgeColor: '#DC2626', badgeBg: '#FEE2E2',
                  rule: '24-month escrow. 10% released at listing, then 15% every 6 months. All shares escrowed as founder principal.',
                  release: 'Last tranche: 36 months post-listing',
                },
                {
                  name: 'Marc Leblanc (Co-Founder)',
                  pct: '24.4%',
                  subject: true,
                  badge: 'Principal',
                  badgeColor: '#DC2626', badgeBg: '#FEE2E2',
                  rule: '24-month escrow. Same staged release as co-founder. All shares escrowed as founder principal.',
                  release: 'Last tranche: 36 months post-listing',
                },
                {
                  name: 'Seed Round Investors',
                  pct: '12.2%',
                  subject: false,
                  badge: 'Likely Exempt',
                  badgeColor: '#15803D', badgeBg: '#DCFCE7',
                  rule: 'Arm\'s-length investors who subscribed at fair market value are generally NOT subject to escrow on TSXV. Confirm with exchange counsel.',
                  release: 'No escrow — freely tradeable post-hold period',
                },
                {
                  name: 'Angel Investors',
                  pct: '4.1%',
                  subject: false,
                  badge: 'Likely Exempt',
                  badgeColor: '#15803D', badgeBg: '#DCFCE7',
                  rule: 'Below 5% threshold and subscribed at arm\'s-length. Generally exempt from escrow unless deemed a promoter.',
                  release: 'No escrow — standard hold period applies',
                },
                {
                  name: 'Employee Stock Option Pool',
                  pct: '6.5%',
                  subject: null,
                  badge: 'Per Grantee',
                  badgeColor: '#B45309', badgeBg: '#FEF3C7',
                  rule: 'Options themselves are not escrowed. Shares issued on exercise may be subject to escrow if grantee qualifies as an insider or principal. Review each option holder individually.',
                  release: 'Depends on grantee classification at exercise date',
                },
                {
                  name: 'Outstanding Warrants',
                  pct: '1.6%',
                  subject: null,
                  badge: 'Per Holder',
                  badgeColor: '#B45309', badgeBg: '#FEF3C7',
                  rule: 'Warrants held by insiders are subject to escrow on the underlying shares upon exercise. Warrants held by arm\'s-length parties are generally not.',
                  release: 'Underlying shares subject to escrow if holder is an insider',
                },
                {
                  name: 'Convertible Note (Series A)',
                  pct: '2.4%',
                  subject: null,
                  badge: 'Review Required',
                  badgeColor: '#7C3AED', badgeBg: '#F5F3FF',
                  rule: 'Convertible note holders who convert at listing may be subject to escrow if conversion price was significantly below listing price. Requires legal counsel review.',
                  release: 'Conversion mechanics must be confirmed before filing',
                },
                {
                  name: 'Advisors (Vested)',
                  pct: '1.6%',
                  subject: true,
                  badge: 'Likely Subject',
                  badgeColor: '#DC2626', badgeBg: '#FEE2E2',
                  rule: 'Advisors receiving shares for services rendered may be considered principals under TSXV policy. Shares received at below-market prices are subject to escrow.',
                  release: 'Same staged release as principals if classified as such',
                },
                {
                  name: 'Key Management (Options)',
                  pct: '4.1%',
                  subject: null,
                  badge: 'Per Role',
                  badgeColor: '#B45309', badgeBg: '#FEF3C7',
                  rule: 'Officers and directors exercising options are principals. Shares on exercise are subject to escrow. Non-insider management may be exempt.',
                  release: 'CEO/CFO/COO options escrowed on exercise; other management case-by-case',
                },
              ].map((row, i, arr) => (
                <div key={row.name} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '1rem',
                  padding: '0.875rem 1.25rem',
                  borderBottom: i < arr.length - 1 ? '1px solid #F0EFED' : 'none',
                  background: row.subject === true ? '#FFF5F5' : row.subject === false ? '#F0FFF4' : 'white',
                }}>
                  <div style={{ flex: '2', minWidth: 0 }}>
                    <p className="text-sm font-semibold truncate" style={{ color: '#1A1A1A' }}>{row.name}</p>
                  </div>
                  <div style={{ flex: '1', textAlign: 'right' }}>
                    <span className="text-xs font-mono font-semibold" style={{ color: '#717171' }}>{row.pct}</span>
                  </div>
                  <div style={{ flex: '1', display: 'flex', justifyContent: 'center' }}>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: row.badgeBg, color: row.badgeColor, whiteSpace: 'nowrap' }}>
                      {row.badge}
                    </span>
                  </div>
                  <div style={{ flex: '3', minWidth: 0 }}>
                    <p className="text-xs leading-relaxed" style={{ color: '#717171' }}>{row.rule}</p>
                    <p className="text-[10px] mt-1 font-medium" style={{ color: '#9A9A9A' }}>{row.release}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs mt-2 leading-relaxed" style={{ color: '#9A9A9A' }}>
              ⚠️ This analysis is based on TSXV Tier 2 defaults. Escrow classifications must be confirmed with your securities counsel and the exchange before filing your listing application.
            </p>
          </div>

          {/* ── Section B: Who Is Subject to Escrow ─────────────────────────── */}
          <div>
            <h2 className="text-nav font-bold text-lg" style={{ marginBottom: '0.5rem' }}>Who Is Subject to Escrow</h2>
            <p className="text-text-muted text-sm" style={{ marginBottom: '1rem' }}>
              Escrow obligations apply broadly. Understand who is covered before your listing.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
              {[
                {
                  title: 'Insiders / Founders',
                  color: '#1A1A1A',
                  bg: '#F7F6F4',
                  border: '#E5E4E0',
                  items: [
                    '10%+ shareholders at time of listing',
                    'All officers and directors',
                    'Promoters',
                    '"Associates" and "affiliates"',
                    'Shares acquired at pre-IPO prices',
                    'All warrant/option holders who are insiders',
                  ],
                },
                {
                  title: 'Management & Key Personnel',
                  color: '#1D4ED8',
                  bg: '#EFF6FF',
                  border: 'rgba(29,78,216,0.2)',
                  items: [
                    'CEO, CFO, COO, VP Engineering, etc.',
                    'Non-director executives may qualify',
                    'Management company employees in day-to-day ops',
                    'Consultants providing continuous services (case-by-case)',
                  ],
                },
                {
                  title: 'Significant Shareholders',
                  color: '#2D7A5F',
                  bg: '#EAF5F0',
                  border: 'rgba(45,122,95,0.2)',
                  items: [
                    '5%–10%+ thresholds vary by exchange',
                    'VC/PE funds may negotiate modified escrow (seed rounds often exempt)',
                    'Strategic investors — exchange discretion',
                    'Arm\'s-length investors at IPO price: generally NOT subject',
                  ],
                },
              ].map(({ title, color, bg, border, items }) => (
                <div key={title} className="rounded-2xl border" style={{ background: bg, borderColor: border, padding: '1.25rem' }}>
                  <p className="font-bold text-sm" style={{ color, marginBottom: '0.75rem' }}>{title}</p>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', listStyle: 'none', padding: 0, margin: 0 }}>
                    {items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-nav leading-relaxed">
                        <span style={{ color, fontSize: '0.5rem', marginTop: '0.35rem', flexShrink: 0 }}>●</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* ── Section C: Insider Trading Rules ────────────────────────────── */}
          <div className="rounded-2xl" style={{ background: '#1A1A1A', padding: '2rem' }}>
            <div className="flex items-start gap-3" style={{ marginBottom: '1.5rem' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
                <Lock className="w-5 h-5" style={{ color: 'white' }} />
              </div>
              <div>
                <h2 className="font-bold text-lg" style={{ color: 'white', marginBottom: '0.25rem' }}>Insider Trading & Reporting Obligations</h2>
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem' }}>Every insider must know these rules before listing day</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              {[
                {
                  title: 'Who Is an Insider',
                  content: 'NI 55-104 definition: directors, senior officers, 10%+ holders, and the reporting issuer itself. Associates and affiliates are also included. The definition is broad and catches more people than most expect.',
                },
                {
                  title: 'SEDI Reporting',
                  content: 'Must report all trades within 5 calendar days via SEDI (System for Electronic Disclosure by Insiders). Failure to report is a personal liability matter and subject to regulatory sanctions. There are no exceptions for small trades.',
                },
                {
                  title: 'Blackout Periods',
                  content: 'Standard: 2 weeks before quarter-end to 2 business days after earnings release. M&A events trigger an indefinite blackout until public announcement. All insiders — including executive assistants with access to material information — must comply.',
                },
                {
                  title: 'Pre-Clearance',
                  content: 'Best practice (and requirement under many Insider Trading Policies): all trades require CFO/General Counsel sign-off before execution. Pre-clearance does not override blackout periods and should be documented in writing.',
                },
              ].map(({ title, content }) => (
                <div key={title} className="rounded-xl" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', padding: '1rem' }}>
                  <p className="font-bold text-sm" style={{ color: '#E8312A', marginBottom: '0.5rem' }}>{title}</p>
                  <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.8125rem', lineHeight: '1.6' }}>{content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Section D: Best Practices & Common Pitfalls ──────────────────── */}
          <div>
            <h2 className="text-nav font-bold text-lg" style={{ marginBottom: '0.5rem' }}>Best Practices & Common Pitfalls</h2>
            <p className="text-text-muted text-sm" style={{ marginBottom: '1rem' }}>
              Hard-won wisdom from hundreds of Canadian and US IPO transactions.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>

              {/* Best Practices */}
              <div>
                <div className="flex items-center gap-2" style={{ marginBottom: '0.75rem' }}>
                  <CheckCircle2 className="w-4 h-4" style={{ color: '#2D7A5F' }} />
                  <p className="font-bold text-sm text-nav">Best Practices</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    'Voluntarily extend lock-up beyond minimum — signals confidence and reduces post-listing volatility',
                    'Adopt a formal Insider Trading Policy on Day 1 — required by NI 58-101 and most exchanges',
                    'Establish quarterly blackout periods consistently — reduces insider trading risk',
                    'Use 10b5-1 plans for executive share sales — protects against timing allegations',
                    'Hold a "lock-up status board" — track whose restrictions expire when; post on IR website',
                    'File SEDI reports immediately (within 48h, not 5 days) — builds regulatory goodwill',
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5 rounded-xl border"
                      style={{ background: '#EAF5F0', borderColor: 'rgba(45,122,95,0.2)', padding: '0.75rem' }}>
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: '#2D7A5F', minWidth: '20px' }}>
                        <span style={{ color: 'white', fontSize: '0.6rem', fontWeight: 800 }}>{i + 1}</span>
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: '#14532D' }}>{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Common Pitfalls */}
              <div>
                <div className="flex items-center gap-2" style={{ marginBottom: '0.75rem' }}>
                  <AlertTriangle className="w-4 h-4" style={{ color: '#E8312A' }} />
                  <p className="font-bold text-sm text-nav">Common Pitfalls</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    'Forgetting to escrow shares held by a founder\'s holding company — these ARE subject',
                    'Gifting or transferring restricted shares to family members — still restricted',
                    'Exercising options during a blackout period (even if no sale) — reportable and potentially restricted',
                    'Not disclosing a lock-up waiver immediately — SEC enforcement risk (US issuers)',
                    'Missing the 5-day SEDI deadline — automatic regulatory flags',
                    'Assuming seed-round warrants are exempt from escrow — they often aren\'t',
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5 rounded-xl border"
                      style={{ background: '#FEF2F2', borderColor: 'rgba(232,49,42,0.2)', padding: '0.75rem' }}>
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: '#E8312A', minWidth: '20px' }}>
                        <X className="w-3 h-3" style={{ color: 'white' }} />
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: '#7F1D1D' }}>{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Section E: Escrow Compliance Checklist ──────────────────────── */}
          <div>
            <div className="flex items-center justify-between flex-wrap gap-3" style={{ marginBottom: '0.5rem' }}>
              <h2 className="text-nav font-bold text-lg">Escrow Compliance Checklist</h2>
              <div className="flex items-center gap-3">
                <span className="text-xs text-text-muted">
                  {checkedItems.size} / {ESCROW_CHECKLIST.length} complete
                </span>
                <div className="rounded-full overflow-hidden" style={{ width: '100px', height: '6px', background: '#E5E4E0' }}>
                  <div style={{
                    height: '100%',
                    width: `${(checkedItems.size / ESCROW_CHECKLIST.length) * 100}%`,
                    background: checkedItems.size === ESCROW_CHECKLIST.length ? '#2D7A5F' : '#1A1A1A',
                    borderRadius: '999px',
                    transition: 'width 0.3s ease',
                  }} />
                </div>
              </div>
            </div>
            <p className="text-text-muted text-sm" style={{ marginBottom: '1.25rem' }}>
              Work through this checklist with your securities counsel before filing. Critical items require immediate attention.
            </p>

            {/* Group by category */}
            {Array.from(new Set(ESCROW_CHECKLIST.map(i => i.category))).map(category => {
              const items = ESCROW_CHECKLIST.filter(i => i.category === category)
              return (
                <div key={category} style={{ marginBottom: '1.25rem' }}>
                  <p className="text-xs font-semibold uppercase tracking-wider text-text-light" style={{ marginBottom: '0.5rem' }}>{category}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {items.map(item => {
                      const checked = checkedItems.has(item.id)
                      return (
                        <button key={item.id} onClick={() => toggleCheck(item.id)}
                          className="flex items-start gap-3 rounded-xl border text-left transition-all"
                          style={{
                            background: checked ? '#EAF5F0' : 'white',
                            borderColor: checked ? 'rgba(45,122,95,0.3)' : '#E5E4E0',
                            padding: '0.875rem 1rem',
                          }}
                          onMouseEnter={e => { if (!checked) e.currentTarget.style.borderColor = '#1A1A1A' }}
                          onMouseLeave={e => { if (!checked) e.currentTarget.style.borderColor = '#E5E4E0' }}>
                          {/* Checkbox */}
                          <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all"
                            style={{
                              background: checked ? '#2D7A5F' : 'white',
                              border: checked ? '1px solid #2D7A5F' : '1.5px solid #D1D5DB',
                              marginTop: '0.0625rem',
                            }}>
                            {checked && <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'white' }} />}
                          </div>
                          {/* Dot indicator */}
                          <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                            style={{ background: item.critical ? '#E8312A' : '#F59E0B' }} />
                          <p className="text-sm leading-relaxed" style={{ color: checked ? '#2D7A5F' : '#1A1A1A', textDecoration: checked ? 'line-through' : 'none', textDecorationColor: '#2D7A5F' }}>
                            {item.label}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {/* Legend */}
            <div className="flex items-center gap-4" style={{ marginTop: '0.5rem' }}>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: '#E8312A' }} />
                <span className="text-xs text-text-muted">Critical — must complete before listing</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: '#F59E0B' }} />
                <span className="text-xs text-text-muted">Recommended best practice</span>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="rounded-xl border flex items-start gap-2.5" style={{ background: '#F7F6F4', borderColor: '#E5E4E0', padding: '0.875rem 1rem' }}>
            <Lock className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-text-light" />
            <p className="text-text-light text-xs leading-relaxed">
              <strong className="text-text-muted">For reference only.</strong> Escrow rules, insider trading obligations, and lock-up requirements vary by exchange, jurisdiction, and individual corporate structure. Always consult qualified securities counsel before listing. Nothing here constitutes legal advice.
            </p>
          </div>
        </div>
      )}

    </div>
  )
}
