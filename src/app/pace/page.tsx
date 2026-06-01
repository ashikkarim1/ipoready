'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  TrendingUp, TrendingDown, Flame, Target, Zap, Activity,
  Clock, CheckCircle2, AlertTriangle, ArrowRight, ChevronRight,
  BarChart2, Calendar, Award, Users, X, Info
} from 'lucide-react'
import { ReadinessFactorsCard } from '@/components/ReadinessFactorsCard'
import { SequencingAlertsCard } from '@/components/SequencingAlertsCard'
import { PaceReadinessFactorsCard } from '@/components/PaceReadinessFactorsCard'
import { PaceConfidenceBadge } from '@/components/PaceConfidenceBadge'
import { PaceSequenceAlertsSection } from '@/components/PaceSequenceAlertsSection'
import { PaceDocumentReadinessCard } from '@/components/PaceDocumentReadinessCard'

// ── Types ──────────────────────────────────────────────────────────────────

interface PhaseData {
  id: string
  label: string
  total: number
  completed: number
  inProgress: number
  weight: number
  maxWeightFraction: number
  contribution: number
  status: 'complete' | 'in_progress' | 'not_started'
}

interface TrendPoint {
  week: string
  score: number
}

interface PaceScores {
  paceScore: number
  paceDelta: number
  daysToIpo: number
  progressPercentage: number
  currentPhase: string
  peerPercentile: number
  trend: TrendPoint[]
  phases: PhaseData[]
  cashRunwayMonths?: number
  teamSize?: number
  cfoHired?: boolean
  boardSize?: number
  auditorSelected?: boolean
  documentReadinessScore?: number
  sequencingAlerts?: any[]
  predictiveScore?: {
    confidenceLevel: 'low' | 'medium' | 'high'
    breakdown?: Record<string, number>
  }
}

// ── Static data (not from DB) ──────────────────────────────────────────────

const DRAGGING_TASKS = [
  { task: 'Independent Director — Second Appointment', phase: 'Corporate Restructuring', daysOpen: 18, impact: 'high', reason: 'Board composition requirement for TSXV listing — gating 2 downstream tasks' },
  { task: 'Audit Committee Financial Expert Designation', phase: 'Corporate Restructuring', daysOpen: 14, impact: 'high', reason: 'NI 52-110 compliance — cannot complete audit committee charter without this' },
  { task: 'Auditor Engagement Letter (CPAB-registered)', phase: 'Financial Audit', daysOpen: 9, impact: 'critical', reason: 'Gates the entire Financial Audit phase — highest-weight phase on PACE™' },
  { task: 'ESOP Board Resolution', phase: 'Corporate Restructuring', daysOpen: 22, impact: 'medium', reason: 'Option pool sizing affects pro forma cap table and prospectus disclosure' },
]

const ACCELERATING_TASKS = [
  { task: 'Legal Counsel Engagement', phase: 'Legal Documentation', completedDays: 3, speedup: 12 },
  { task: 'Auditor Shortlist (3 CPAB-registered)', phase: 'Financial Audit', completedDays: 5, speedup: 8 },
  { task: 'Director Search — Mandate Issued to Search Firm', phase: 'Corporate Restructuring', completedDays: 7, speedup: 6 },
]

// Peer benchmark bands
const PEER_BANDS = [
  { range: '0–30%', label: 'Bottom Tier',  companies: 22, color: '#E5E4E0' },
  { range: '31–50%', label: 'Average',      companies: 31, color: '#BFDBFE' },
  { range: '51–70%', label: 'Above Avg',    companies: 27, color: '#BBF7D0' },
  { range: '71–100%', label: 'Top Tier',    companies: 20, color: '#FDE68A' },
]

// Forecast scenarios — offsets relative to daysToIpo
const FORECAST_OFFSETS = {
  current:     { offsetDays: 0,   label: 'At current PACE™',            color: '#717171' },
  optimistic:  { offsetDays: -35, label: '+2 tasks/week added',          color: '#2D7A5F' },
  accelerated: { offsetDays: -60, label: 'All blockers resolved now',    color: '#1D4ED8' },
  delayed:     { offsetDays: +53, label: 'No action on blockers',        color: '#DC2626' },
}

// ── Helpers ────────────────────────────────────────────────────────────────

function addDaysToToday(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' })
}

// ── Component ──────────────────────────────────────────────────────────────

export default function PacePage() {
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null)
  const [forecastMode, setForecastMode] = useState<keyof typeof FORECAST_OFFSETS>('current')
  const [scores, setScores] = useState<PaceScores | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/pace/scores')
      .then(r => r.json())
      .then((data: PaceScores) => {
        setScores(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Derived values — fall back to 0 while loading
  const paceScore       = scores?.paceScore       ?? 0
  const paceDelta       = scores?.paceDelta        ?? 0
  const daysToIpo       = scores?.daysToIpo        ?? 0
  const peerPercentile  = scores?.peerPercentile   ?? 0
  const trend           = scores?.trend            ?? []
  const phases          = scores?.phases           ?? []

  const maxTrend = trend.length > 0 ? Math.max(...trend.map(d => d.score)) : 1

  // Build forecast scenarios with real daysToIpo
  const FORECAST = (Object.entries(FORECAST_OFFSETS) as [keyof typeof FORECAST_OFFSETS, typeof FORECAST_OFFSETS[keyof typeof FORECAST_OFFSETS]][]).reduce(
    (acc, [key, val]) => {
      const days = Math.max(1, daysToIpo + val.offsetDays)
      acc[key] = { days, date: addDaysToToday(days), label: val.label, color: val.color }
      return acc
    },
    {} as Record<keyof typeof FORECAST_OFFSETS, { days: number; date: string; label: string; color: string }>
  )

  const topPercent   = 100 - peerPercentile
  const isAccel      = paceDelta > 0
  const selectedPhaseData = selectedPhase ? phases.find(p => p.id === selectedPhase) : null

  function getStatusStyle(status: string) {
    if (status === 'complete')    return { color: '#2D7A5F', bg: '#F0FDF4', border: '#BBF7D0', label: 'Complete' }
    if (status === 'in_progress') return { color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE', label: 'In Progress' }
    return { color: '#9A9A9A', bg: '#F7F6F4', border: '#E5E4E0', label: 'Not Started' }
  }

  function getImpactStyle(impact: string) {
    if (impact === 'critical') return { color: '#DC2626', bg: '#FEF2F2', label: 'Critical' }
    if (impact === 'high')     return { color: '#D97706', bg: '#FFFBEB', label: 'High' }
    return { color: '#717171', bg: '#F7F6F4', label: 'Medium' }
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1rem' }} className="sm:px-6 lg:px-0">

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: '99px', background: '#FDECEB', border: '1px solid rgba(232,49,42,0.15)', marginBottom: '10px' }}>
              <Activity style={{ width: '10px', height: '10px', color: '#E8312A' }} />
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#E8312A', textTransform: 'uppercase', letterSpacing: '0.1em' }}>PACE™ Velocity Engine · Protected IP</span>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#1A1A1A', marginBottom: '4px', lineHeight: 1.2 }}>
              PACE™ Velocity Breakdown
            </h1>
            <p style={{ fontSize: '14px', color: '#717171' }}>
              Real-time IPO velocity analysis · TSXV Track
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            <Link href="/checklist"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '10px', background: '#F7F6F4', border: '1px solid #E5E4E0', color: '#1A1A1A', fontWeight: 600, fontSize: '13px', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#EFEFED')}
              onMouseLeave={e => (e.currentTarget.style.background = '#F7F6F4')}>
              <CheckCircle2 style={{ width: '14px', height: '14px' }} />
              View Checklist
            </Link>
            <Link href="/dashboard"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '10px', background: '#1A1A1A', color: 'white', fontWeight: 600, fontSize: '13px', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#333')}
              onMouseLeave={e => (e.currentTarget.style.background = '#1A1A1A')}>
              <BarChart2 style={{ width: '14px', height: '14px' }} />
              Mission Control
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ── NEW PACE UI Components ────────────────────────────────────── */}
      {!loading && scores && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {/* Readiness Factors Card */}
            <PaceReadinessFactorsCard
              cashRunwayMonths={scores.cashRunwayMonths || 12}
              teamSize={scores.teamSize || 45}
              cfoHired={scores.cfoHired || false}
              boardSize={scores.boardSize || 4}
              auditorSelected={scores.auditorSelected || false}
              marketConditions="Stable"
            />

            {/* Confidence Badge */}
            <PaceConfidenceBadge
              confidenceLevel={scores.predictiveScore?.confidenceLevel || 'low'}
              dataCompleteness={Math.round((scores.predictiveScore?.breakdown ? 
                (Object.values(scores.predictiveScore.breakdown).filter((v: any) => v > 0).length / 6) * 100 
                : 0))}
              explanation="Your PACE score is based on task completion, team readiness, and financial factors."
            />
          </div>

          {/* Sequencing Alerts Section */}
          {scores.sequencingAlerts && scores.sequencingAlerts.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <PaceSequenceAlertsSection
                alerts={scores.sequencingAlerts.map((alert: any, idx: number) => ({
                  id: `alert-${idx}`,
                  ruleText: alert.title || 'Unknown Alert',
                  currentPhase: 1,
                  blockedUntilPhase: 5,
                  severity: alert.severity === 'critical' ? 'error' : 'warning',
                }))}
              />
            </div>
          )}

          {/* Document Readiness Card */}
          <div style={{ marginBottom: '24px' }}>
            <PaceDocumentReadinessCard
              overallScore={scores.documentReadinessScore || 0}
              phases={(scores.phases || []).map((phase: any, idx: number) => ({
                phase: idx + 1,
                phaseName: phase.phaseName || `Phase ${idx + 1}`,
                requiredDocCount: Math.max(2, 12 - (idx * 1)),
                completionPercentage: phase.completion || 0,
                hasStaleDocuments: idx === 1, // Demo: show stale docs flag for phase 2
              }))}
            />
          </div>
        </>
      )}

      {/* ── Top KPI row ─────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>

        {/* PACE Score big */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          style={{ background: '#1A1A1A', borderRadius: '16px', padding: '20px', gridColumn: 'span 1' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>PACE™ Score</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ position: 'relative', width: '56px', height: '56px', flexShrink: 0 }}>
              {loading ? (
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
              ) : (
                <svg width="56" height="56" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="23" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                  <circle cx="28" cy="28" r="23" fill="none" stroke="white" strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 23}`}
                    strokeDashoffset={`${2 * Math.PI * 23 * (1 - paceScore / 100)}`} />
                </svg>
              )}
              {!loading && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '14px', fontWeight: 900, color: 'white' }}>{paceScore}</span>
                </div>
              )}
            </div>
            <div>
              {loading ? (
                <div style={{ width: '80px', height: '28px', borderRadius: '6px', background: 'rgba(255,255,255,0.1)' }} />
              ) : (
                <>
                  <p style={{ fontSize: '28px', fontWeight: 900, color: 'white', lineHeight: 1, marginBottom: '4px' }}>
                    {paceScore}<span style={{ fontSize: '16px', fontWeight: 400, color: 'rgba(255,255,255,0.4)' }}>/100</span>
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {isAccel
                      ? <TrendingUp style={{ width: '12px', height: '12px', color: '#4ADE80' }} />
                      : <TrendingDown style={{ width: '12px', height: '12px', color: '#FCA5A5' }} />
                    }
                    <span style={{ fontSize: '12px', fontWeight: 600, color: isAccel ? '#4ADE80' : '#FCA5A5' }}>
                      {paceDelta >= 0 ? `+${paceDelta}` : paceDelta} this week
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Days to listing */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ background: 'white', border: '1px solid #E5E4E0', borderRadius: '16px', padding: '20px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#9A9A9A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Est. Days to Listing</p>
          {loading ? (
            <div style={{ width: '80px', height: '28px', borderRadius: '6px', background: '#F0EFED' }} />
          ) : (
            <>
              <p style={{ fontSize: '28px', fontWeight: 900, color: '#1A1A1A', lineHeight: 1, marginBottom: '4px' }}>{daysToIpo}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Flame style={{ width: '12px', height: '12px', color: '#E8312A' }} />
                <span style={{ fontSize: '12px', color: '#717171' }}>{addDaysToToday(daysToIpo)} target</span>
              </div>
            </>
          )}
        </motion.div>

        {/* Peer rank */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          style={{ background: 'white', border: '1px solid #E5E4E0', borderRadius: '16px', padding: '20px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#9A9A9A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Peer Benchmark</p>
          {loading ? (
            <div style={{ width: '80px', height: '28px', borderRadius: '6px', background: '#F0EFED' }} />
          ) : (
            <>
              <p style={{ fontSize: '28px', fontWeight: 900, color: '#1A1A1A', lineHeight: 1, marginBottom: '4px' }}>
                Top <span style={{ color: '#2D7A5F' }}>{topPercent}%</span>
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Award style={{ width: '12px', height: '12px', color: '#D4A96A' }} />
                <span style={{ fontSize: '12px', color: '#717171' }}>of TSXV issuers at this stage</span>
              </div>
            </>
          )}
        </motion.div>

        {/* Velocity trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ background: 'white', border: '1px solid #E5E4E0', borderRadius: '16px', padding: '20px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#9A9A9A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Velocity Trend</p>
          {loading ? (
            <div style={{ width: '80px', height: '28px', borderRadius: '6px', background: '#F0EFED' }} />
          ) : (
            <>
              <p style={{ fontSize: '28px', fontWeight: 900, color: isAccel ? '#2D7A5F' : '#E8312A', lineHeight: 1, marginBottom: '4px' }}>
                {isAccel ? '↑' : '↓'} {paceDelta >= 0 ? `+${paceDelta}` : paceDelta}
              </p>
              <span style={{ fontSize: '12px', color: '#717171' }}>
                {isAccel ? 'Accelerating' : 'Decelerating'} · Week over week
              </span>
            </>
          )}
        </motion.div>
      </div>

      {/* ── Trend Chart + Peer Benchmark ───────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' }}>

        {/* Trend chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          style={{ background: 'white', border: '1px solid #E5E4E0', borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A', marginBottom: '2px' }}>PACE™ Score — 8 Week Trend</p>
              <p style={{ fontSize: '12px', color: '#9A9A9A' }}>Week 1 = first login · Week 8 = today</p>
            </div>
          </div>

          {loading ? (
            <div style={{ height: '120px', background: '#F7F6F4', borderRadius: '8px' }} />
          ) : trend.length < 2 ? (
            <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F6F4', borderRadius: '10px', padding: '20px', textAlign: 'center' }}>
              <div>
                <BarChart2 style={{ width: '24px', height: '24px', color: '#C4C2BE', margin: '0 auto 8px' }} />
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#717171', marginBottom: '4px' }}>Building your trend data</p>
                <p style={{ fontSize: '12px', color: '#9A9A9A' }}>Check back after completing more tasks — we need at least 2 weekly snapshots to draw the chart.</p>
              </div>
            </div>
          ) : (
            <>
              {/* Bar chart */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '100px' }}>
                {trend.map((d, i) => (
                  <div key={d.week} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(d.score / maxTrend) * 90}px` }}
                      transition={{ delay: i * 0.05, duration: 0.5, ease: 'easeOut' }}
                      style={{
                        width: '100%', minHeight: d.score > 0 ? '4px' : '0',
                        borderRadius: '4px 4px 0 0',
                        background: i === trend.length - 1
                          ? 'linear-gradient(180deg, #1A1A1A, #444)'
                          : 'linear-gradient(180deg, #E5E4E0, #CFCDC8)',
                      }}
                    />
                    <span style={{ fontSize: '9px', color: '#9A9A9A', fontWeight: 600 }}>{d.week}</span>
                  </div>
                ))}
              </div>
              {/* Score labels */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginTop: '4px' }}>
                {trend.map(d => (
                  <div key={d.week + 'label'} style={{ flex: 1, textAlign: 'center' }}>
                    <span style={{ fontSize: '9px', color: d.score > 0 ? '#717171' : '#E5E4E0', fontWeight: 700 }}>{d.score > 0 ? d.score : ''}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>

        {/* Peer benchmark */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ background: 'white', border: '1px solid #E5E4E0', borderRadius: '16px', padding: '24px' }}>
          <p style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A', marginBottom: '4px' }}>Peer Benchmark</p>
          <p style={{ fontSize: '12px', color: '#9A9A9A', marginBottom: '16px' }}>vs. 100 anonymized TSXV issuers at same stage</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {PEER_BANDS.map((band, i) => (
              <div key={band.range} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: band.color, border: '1px solid rgba(0,0,0,0.1)', flexShrink: 0 }} />
                <span style={{ fontSize: '12px', color: '#717171', width: '64px' }}>{band.range}</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#1A1A1A', width: '80px' }}>{band.label}</span>
                <div style={{ flex: 1, height: '6px', background: '#F7F6F4', borderRadius: '99px', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${band.companies}%` }}
                    transition={{ delay: 0.4 + i * 0.08, duration: 0.5 }}
                    style={{ height: '100%', background: band.color, borderRadius: '99px' }}
                  />
                </div>
                <span style={{ fontSize: '11px', color: '#9A9A9A', width: '28px', textAlign: 'right' }}>{band.companies}%</span>
              </div>
            ))}
          </div>
          {/* You are here */}
          <div style={{ background: '#F7F6F4', border: '1px solid #E5E4E0', borderRadius: '10px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: loading ? '#C4C2BE' : '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '10px', fontWeight: 900, color: 'white' }}>{loading ? '…' : paceScore}</span>
            </div>
            <div>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#1A1A1A' }}>
                {loading ? '—' : `Top ${topPercent}%`}
              </p>
              <p style={{ fontSize: '11px', color: '#717171' }}>
                {loading ? 'Loading...' : 'Above-average velocity for TSXV at this stage'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Phase-by-phase breakdown ──────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        style={{ background: 'white', border: '1px solid #E5E4E0', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A', marginBottom: '2px' }}>Phase-by-Phase Velocity Impact</p>
            <p style={{ fontSize: '12px', color: '#9A9A9A' }}>Click any phase to see the detail view · Weight = PACE™ contribution</p>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{ height: '60px', borderRadius: '10px', background: '#F7F6F4' }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {phases.map((phase, i) => {
              const st = getStatusStyle(phase.status)
              const pct = phase.total > 0 ? Math.round((phase.completed / phase.total) * 100) : 0
              const isSelected = selectedPhase === phase.id
              // Bar width normalised against max weight fraction (0.20 = corporate_restructuring)
              const maxWeightFraction = phase.maxWeightFraction ?? 0.20
              return (
                <motion.div
                  key={phase.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.04 }}
                >
                  <button
                    onClick={() => setSelectedPhase(isSelected ? null : phase.id)}
                    style={{
                      width: '100%', background: isSelected ? '#F7F6F4' : 'transparent',
                      border: `1px solid ${isSelected ? '#E5E4E0' : 'transparent'}`,
                      borderRadius: '10px', padding: '12px 14px',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px',
                      textAlign: 'left', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#FAFAF9' }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
                  >
                    {/* Phase progress ring */}
                    <div style={{ position: 'relative', width: '36px', height: '36px', flexShrink: 0 }}>
                      <svg width="36" height="36" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#E5E4E0" strokeWidth="4" />
                        <circle cx="18" cy="18" r="14" fill="none"
                          stroke={pct === 100 ? '#2D7A5F' : pct > 0 ? '#1D4ED8' : '#E5E4E0'}
                          strokeWidth="4" strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 14}`}
                          strokeDashoffset={`${2 * Math.PI * 14 * (1 - pct / 100)}`} />
                      </svg>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '9px', fontWeight: 800, color: '#1A1A1A' }}>{pct}%</span>
                      </div>
                    </div>

                    {/* Label */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A' }}>{phase.label}</span>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: st.color, background: st.bg, border: `1px solid ${st.border}`, padding: '1px 6px', borderRadius: '99px' }}>{st.label}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '11px', color: '#9A9A9A' }}>{phase.completed}/{phase.total} tasks</span>
                        <span style={{ fontSize: '11px', color: '#9A9A9A' }}>Weight: {Math.round(phase.weight * 100)}%</span>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: phase.contribution > 0 ? '#2D7A5F' : '#9A9A9A' }}>
                          +{phase.contribution} pts contributed
                        </span>
                      </div>
                    </div>

                    {/* Weight bar */}
                    <div style={{ width: '100px', display: 'flex', flexDirection: 'column', gap: '3px', flexShrink: 0 }}>
                      <div style={{ height: '6px', background: '#F0EFED', borderRadius: '99px', overflow: 'hidden' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(phase.weight / maxWeightFraction) * 100}%` }}
                          transition={{ delay: 0.4 + i * 0.04, duration: 0.5 }}
                          style={{ height: '100%', background: phase.contribution > 0 ? '#1A1A1A' : '#D1D5DB', borderRadius: '99px' }}
                        />
                      </div>
                      <span style={{ fontSize: '9px', color: '#9A9A9A', textAlign: 'right' }}>{Math.round(phase.weight * 100)}% weight</span>
                    </div>

                    <ChevronRight style={{ width: '14px', height: '14px', color: '#C4C2BE', flexShrink: 0, transform: isSelected ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }} />
                  </button>

                  {/* Expanded detail */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{ padding: '10px 14px 14px 62px', display: 'flex', gap: '12px' }}>
                          <div style={{ flex: 1, background: '#F7F6F4', borderRadius: '10px', padding: '12px 14px' }}>
                            <p style={{ fontSize: '11px', fontWeight: 700, color: '#9A9A9A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                              <Info style={{ width: '10px', height: '10px', display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
                              Phase Stats
                            </p>
                            <p style={{ fontSize: '13px', color: '#1A1A1A', lineHeight: 1.6 }}>
                              {phase.completed} of {phase.total} tasks completed
                              {phase.inProgress > 0 ? `, ${phase.inProgress} in progress` : ''}.
                              {' '}This phase contributes {Math.round(phase.weight * 100)}% weight to your PACE™ score
                              {phase.contribution > 0 ? ` and has earned ${phase.contribution} pts` : ''}.
                            </p>
                          </div>
                          <Link href="/checklist"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', alignSelf: 'center', fontSize: '12px', fontWeight: 600, color: '#E8312A', textDecoration: 'none', flexShrink: 0 }}
                            onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
                            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                            View Tasks <ArrowRight style={{ width: '12px', height: '12px' }} />
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* ── Two-column: Dragging + Accelerating ────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>

        {/* Tasks dragging velocity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          style={{ background: 'white', border: '1px solid #E5E4E0', borderRadius: '16px', padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <TrendingDown style={{ width: '16px', height: '16px', color: '#DC2626' }} />
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A' }}>Dragging Velocity</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {DRAGGING_TASKS.map(task => {
              const imp = getImpactStyle(task.impact)
              return (
                <div key={task.task} style={{ padding: '12px', borderRadius: '10px', background: '#FEF9F9', border: '1px solid #FECACA' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A', flex: 1, lineHeight: 1.4 }}>{task.task}</p>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: imp.color, background: imp.bg, padding: '2px 6px', borderRadius: '99px', flexShrink: 0 }}>{imp.label}</span>
                  </div>
                  <p style={{ fontSize: '11px', color: '#9A9A9A', marginBottom: '4px' }}>{task.phase} · Open {task.daysOpen} days</p>
                  <p style={{ fontSize: '11px', color: '#717171', lineHeight: 1.5 }}>{task.reason}</p>
                </div>
              )
            })}
          </div>
          <Link href="/checklist"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '14px', fontSize: '13px', fontWeight: 600, color: '#E8312A', textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
            Resolve these blockers <ArrowRight style={{ width: '12px', height: '12px' }} />
          </Link>
        </motion.div>

        {/* Tasks accelerating velocity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          style={{ background: 'white', border: '1px solid #E5E4E0', borderRadius: '16px', padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <TrendingUp style={{ width: '16px', height: '16px', color: '#2D7A5F' }} />
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A' }}>Accelerating PACE™</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {ACCELERATING_TASKS.map(task => (
              <div key={task.task} style={{ padding: '12px', borderRadius: '10px', background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A', flex: 1, lineHeight: 1.4 }}>{task.task}</p>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#2D7A5F', background: '#DCFCE7', padding: '2px 6px', borderRadius: '99px', flexShrink: 0 }}>+{task.speedup} days saved</span>
                </div>
                <p style={{ fontSize: '11px', color: '#6B7280' }}>{task.phase} · Completed {task.completedDays} days ago</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '14px', padding: '12px', borderRadius: '10px', background: '#F7F6F4', border: '1px solid #E5E4E0' }}>
            <p style={{ fontSize: '12px', fontWeight: 600, color: '#1A1A1A', marginBottom: '3px' }}>Total time saved this week</p>
            <p style={{ fontSize: '20px', fontWeight: 900, color: '#2D7A5F' }}>
              26 days <span style={{ fontSize: '12px', fontWeight: 400, color: '#9A9A9A' }}>ahead of benchmark</span>
            </p>
          </div>
        </motion.div>
      </div>

      {/* ── Readiness Factors + Sequencing Alerts ────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48 }}>
          <ReadinessFactorsCard
            cashRunway={8.5}
            hiringProgress={67}
            auditorEngaged={true}
            boardSize={3}
            boardIndependentCount={1}
            secondIndependent={false}
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.52 }}>
          <SequencingAlertsCard
            alerts={[
              {
                severity: 'error',
                taskId: 'seq-1',
                title: 'Auditor Engagement Letter Required',
                description: 'CPAB-registered auditor must be engaged before financial audit phase can begin. This is the highest-weight phase on PACE™.',
                daysBlocking: 9,
                remediationSteps: [
                  'Contact shortlisted CPAB auditors (3 firms identified)',
                  'Issue engagement letter with fee estimates',
                  'Obtain board approval of auditor selection',
                  'Complete engagement by end of week',
                ],
              },
              {
                severity: 'warning',
                taskId: 'seq-2',
                title: 'Second Independent Director Needed',
                description: 'TSXV requires minimum 2 independent directors. Currently have 1. This blocks downstream corporate governance filings.',
                daysBlocking: 18,
                remediationSteps: [
                  'Engage executive director search firm',
                  'Develop candidate profile aligned with audit committee needs',
                  'Review candidates and conduct interviews',
                  'Board approval and public announcement',
                ],
              },
            ]}
          />
        </motion.div>
      </div>

      {/* ── Forecast scenarios ─────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        style={{ background: 'white', border: '1px solid #E5E4E0', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A', marginBottom: '2px' }}>Listing Date Forecast</p>
            <p style={{ fontSize: '12px', color: '#9A9A9A' }}>Select a scenario to see how your actions affect the timeline</p>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {(Object.keys(FORECAST_OFFSETS) as (keyof typeof FORECAST_OFFSETS)[]).map(key => (
              <button
                key={key}
                onClick={() => setForecastMode(key)}
                style={{
                  fontSize: '11px', fontWeight: 600, padding: '5px 10px', borderRadius: '8px', cursor: 'pointer', border: 'none',
                  background: forecastMode === key ? '#1A1A1A' : '#F7F6F4',
                  color: forecastMode === key ? 'white' : '#717171',
                  transition: 'all 0.15s',
                }}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ height: '80px', borderRadius: '12px', background: '#F7F6F4' }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {(Object.entries(FORECAST) as [keyof typeof FORECAST_OFFSETS, typeof FORECAST[keyof typeof FORECAST_OFFSETS]][]).map(([key, fc]) => (
              <button
                key={key}
                onClick={() => setForecastMode(key)}
                style={{
                  padding: '16px', borderRadius: '12px', textAlign: 'left', cursor: 'pointer', border: 'none',
                  background: forecastMode === key ? '#F7F6F4' : 'transparent',
                  outline: forecastMode === key ? `2px solid ${fc.color}` : '2px solid transparent',
                  transition: 'all 0.2s',
                }}
              >
                <p style={{ fontSize: '10px', fontWeight: 700, color: fc.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>{fc.label}</p>
                <p style={{ fontSize: '24px', fontWeight: 900, color: '#1A1A1A', lineHeight: 1, marginBottom: '4px' }}>{fc.days}</p>
                <p style={{ fontSize: '11px', color: '#9A9A9A' }}>days · {fc.date}</p>
              </button>
            ))}
          </div>
        )}

        {/* Selected scenario description */}
        <AnimatePresence mode="wait">
          <motion.div
            key={forecastMode}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            style={{ marginTop: '16px', padding: '14px 16px', borderRadius: '10px', background: '#F7F6F4', border: '1px solid #E5E4E0' }}
          >
            {forecastMode === 'current' && (
              <p style={{ fontSize: '13px', color: '#1A1A1A', lineHeight: 1.6 }}>
                <strong>At your current PACE™ of {paceScore}/100</strong>, you are on track to list in approximately {daysToIpo} days. This assumes the current task completion rate continues and no new blockers emerge.
              </p>
            )}
            {forecastMode === 'optimistic' && (
              <p style={{ fontSize: '13px', color: '#1A1A1A', lineHeight: 1.6 }}>
                <strong>Adding 2 additional tasks per week</strong> — specifically resolving the independent director appointment and starting audit engagement — would save approximately 35 days and bring listing to {FORECAST.optimistic.date}.
              </p>
            )}
            {forecastMode === 'accelerated' && (
              <p style={{ fontSize: '13px', color: '#1A1A1A', lineHeight: 1.6 }}>
                <strong>Resolving all current blockers this week</strong> would elevate PACE™ significantly, unlock downstream phases, and compress listing to ~{FORECAST.accelerated.days} days. Requires board resolution on directors and immediate auditor engagement.
              </p>
            )}
            {forecastMode === 'delayed' && (
              <p style={{ fontSize: '13px', color: '#DC2626', lineHeight: 1.6 }}>
                <strong>⚠ Warning:</strong> If current blockers remain unresolved for another 30 days, the financial audit phase will not begin in time. Listing would slip to {FORECAST.delayed.date} — a <strong>53-day delay</strong> with potential market window risk.
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* ── CTA row ─────────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '2rem' }}>
        {[
          { icon: CheckCircle2, title: 'Resolve Blockers',   desc: 'View and action the tasks dragging your PACE™ score',       href: '/checklist',  color: '#E8312A' },
          { icon: Users,        title: 'Expert Network',    desc: 'Find a CPAB-registered auditor to unlock the audit phase',   href: '/marketplace', color: '#1D4ED8' },
          { icon: Target,       title: 'Board Report',      desc: 'Generate a PACE™ report for your board meeting',             href: '/dashboard',  color: '#2D7A5F' },
          { icon: Flame,        title: 'PACE™ Daily Pulse', desc: 'Configure your 7 AM velocity email to CEO & CFO',            href: '/pace/pulse', color: '#D97706' },
        ].map(({ icon: Icon, title, desc, href, color }) => (
          <Link key={href} href={href}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '12px', background: 'white', border: '1px solid #E5E4E0', textDecoration: 'none', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#FAFAF9'; e.currentTarget.style.borderColor = '#D1D0CC' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#E5E4E0' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon style={{ width: '16px', height: '16px', color }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A1A', marginBottom: '1px' }}>{title}</p>
              <p style={{ fontSize: '11px', color: '#9A9A9A', lineHeight: 1.4 }}>{desc}</p>
            </div>
            <ArrowRight style={{ width: '12px', height: '12px', color: '#C4C2BE', flexShrink: 0 }} />
          </Link>
        ))}
      </motion.div>

    </div>
  )
}
