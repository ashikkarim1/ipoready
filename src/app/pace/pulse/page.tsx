'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Flame, CheckCircle2, Clock, Users, Globe, ToggleLeft, ToggleRight,
  ChevronUp, ChevronDown, Plus,
} from 'lucide-react'

// ── Types ────────────────────────────────────────────────────────────────────

interface PulseHistoryRow {
  date: string
  score: number
  change: string
  blocker: string
  completed: number
  status: 'Delivered'
}

interface Recipient {
  id: string
  initials: string
  name: string
  title: string
  color: string
}

interface PulseData {
  history: PulseHistoryRow[]
  recipients: Recipient[]
  currentScore: number
  paused: boolean
  hour: number
  language: 'EN' | 'FR'
  weekendPulse: boolean
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CIRCUMFERENCE = 2 * Math.PI * 38

// ── Component ─────────────────────────────────────────────────────────────────

export default function PacePulsePage() {
  const { status: authStatus } = useSession()

  // Remote data
  const [data, setData] = useState<PulseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  // Delivery settings — local state, initialised after data loads
  const [weekendPulse, setWeekendPulse] = useState(false)
  const [language, setLanguage] = useState<'EN' | 'FR'>('EN')
  const [hour, setHour] = useState(7)
  const [paused, setPaused] = useState(false)

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (authStatus !== 'authenticated') return
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const res = await fetch('/api/pace/pulse')
        if (!res.ok) throw new Error('fetch failed')
        const json: PulseData = await res.json()
        if (!cancelled) {
          setData(json)
          setPaused(json.paused)
          setHour(json.hour ?? 7)
          setLanguage(json.language ?? 'EN')
          setWeekendPulse(json.weekendPulse ?? false)
        }
      } catch {
        // leave data null — empty-state will show
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [authStatus])

  // ── Save settings ──────────────────────────────────────────────────────────
  async function handleSaveSettings() {
    setSaveStatus('saving')
    try {
      await fetch('/api/pace/pulse', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paused, hour, language, weekendPulse }),
      })
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch {
      setSaveStatus('idle')
    }
  }

  // ── Derived ────────────────────────────────────────────────────────────────
  const history = data?.history ?? []
  const recipients = data?.recipients ?? []
  const currentScore = data?.currentScore ?? 0
  const hasHistory = history.length > 0

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ maxWidth: '900px', margin: '0 auto', paddingTop: '60px', textAlign: 'center' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%',
          border: '3px solid #E5E4E0', borderTopColor: '#E8312A',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 16px',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ fontSize: '14px', color: '#9A9A9A' }}>Loading Pulse data…</p>
      </div>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Flame style={{ width: '22px', height: '22px', color: '#E8312A' }} />
              <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#1A1A1A', lineHeight: 1.2 }}>
                PACE™ Daily Pulse
              </h1>
            </div>
            <p style={{ fontSize: '14px', color: '#717171', marginBottom: '10px' }}>
              Your automated morning IPO velocity briefing — delivered at {hour.toString().padStart(2, '0')}:00 AM daily
            </p>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '4px 10px', borderRadius: '99px',
              background: paused ? '#FFF7ED' : '#F0FDF4',
              border: paused ? '1px solid #FED7AA' : '1px solid #BBF7D0',
            }}>
              <div style={{
                width: '7px', height: '7px', borderRadius: '50%',
                background: paused ? '#F97316' : '#22C55E',
              }} />
              <span style={{
                fontSize: '12px', fontWeight: 600,
                color: paused ? '#C2410C' : '#16A34A',
              }}>
                {paused
                  ? 'Paused'
                  : `Active · Sending to ${recipients.length} recipient${recipients.length !== 1 ? 's' : ''}`}
              </span>
            </div>
          </div>
          <button
            onClick={() => setPaused(p => !p)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '9px 16px', borderRadius: '10px',
              background: 'white', border: '1px solid #E5E4E0',
              color: '#1A1A1A', fontWeight: 600, fontSize: '13px',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#F7F6F4')}
            onMouseLeave={e => (e.currentTarget.style.background = 'white')}
          >
            {paused ? '▶ Resume Pulse' : '⏸ Pause Pulse'}
          </button>
        </div>
      </motion.div>

      {/* ── Section 1: Email Preview ─────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        style={{ marginBottom: '24px' }}>

        <p style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A1A', marginBottom: '12px' }}>
          Today&apos;s Pulse Preview
        </p>

        {/* Email client card */}
        <div style={{ background: 'white', border: '1px solid #E5E4E0', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>

          {/* Email metadata bar */}
          <div style={{ background: '#F7F6F4', borderBottom: '1px solid #E5E4E0', padding: '12px 20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 12px', fontSize: '12px' }}>
              <span style={{ color: '#9A9A9A', fontWeight: 600 }}>From:</span>
              <span style={{ color: '#1A1A1A' }}>IPOReady AI Engine &lt;pulse@ipoready.com&gt;</span>
              <span style={{ color: '#9A9A9A', fontWeight: 600 }}>To:</span>
              <span style={{ color: '#1A1A1A' }}>
                {recipients.length > 0 ? recipients.map(r => r.title).join(', ') : 'No recipients'}
              </span>
              <span style={{ color: '#9A9A9A', fontWeight: 600 }}>Subject:</span>
              <span style={{ color: '#1A1A1A', fontWeight: 600 }}>
                Your PACE™ is {currentScore} — here&apos;s what to do today · {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Email body */}
          <div style={{ padding: '32px 40px', maxWidth: '600px', margin: '0 auto' }}>

            {/* Logo wordmark */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Flame style={{ width: '16px', height: '16px', color: '#E8312A' }} />
              </div>
              <span style={{ fontSize: '18px', fontWeight: 900, color: '#1A1A1A' }}>IPOReady</span>
            </div>

            {/* PACE score ring */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px', padding: '20px', background: '#F7F6F4', borderRadius: '14px' }}>
              <div style={{ position: 'relative', width: '92px', height: '92px', flexShrink: 0 }}>
                <svg width="92" height="92" viewBox="0 0 92 92">
                  <circle cx="46" cy="46" r="38" fill="none" stroke="#E5E4E0" strokeWidth="7" />
                  <circle
                    cx="46" cy="46" r="38" fill="none"
                    stroke="#E8312A" strokeWidth="7"
                    strokeLinecap="round"
                    strokeDasharray={`${CIRCUMFERENCE}`}
                    strokeDashoffset={`${CIRCUMFERENCE * (1 - currentScore / 100)}`}
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                  />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '22px', fontWeight: 900, color: '#1A1A1A', lineHeight: 1 }}>{currentScore}</span>
                  <span style={{ fontSize: '10px', color: '#9A9A9A' }}>/100</span>
                </div>
              </div>
              <div>
                {history.length >= 2 && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '99px', background: '#F0FDF4', border: '1px solid #BBF7D0', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#16A34A' }}>
                      {history[0].change} since yesterday
                    </span>
                  </div>
                )}
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A1A', marginBottom: '2px' }}>PACE™ Score — Today</p>
                <p style={{ fontSize: '12px', color: '#717171' }}>Accelerating · Top 30% of TSXV issuers</p>
              </div>
            </div>

            {/* Greeting */}
            <p style={{ fontSize: '16px', fontWeight: 700, color: '#1A1A1A', marginBottom: '20px' }}>
              Good morning{recipients.length > 0 ? `, ${recipients[0].name.split(' ')[0]}` : ''}. Here&apos;s your IPO velocity briefing.
            </p>

            {/* Section 1: Yesterday's Progress */}
            <div style={{ marginBottom: '20px', padding: '16px', borderRadius: '12px', border: '1px solid #E5E4E0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '16px' }}>📊</span>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A1A' }}>Yesterday&apos;s Progress</p>
              </div>
              <p style={{ fontSize: '13px', color: '#717171', lineHeight: 1.6 }}>
                You completed{' '}
                <strong style={{ color: '#1A1A1A' }}>
                  {history.length > 0 ? `${history[0].completed} task${history[0].completed !== 1 ? 's' : ''}` : '0 tasks'}
                </strong>{' '}
                yesterday. Your PACE™ {history.length > 0 && history[0].change !== '+0' ? 'moved to' : 'held at'}{' '}
                <strong style={{ color: '#1A1A1A' }}>{currentScore}/100</strong>.
              </p>
            </div>

            {/* Section 2: Top Blocker */}
            <div style={{ marginBottom: '20px', padding: '16px', borderRadius: '12px', border: '1px solid #FECACA', background: '#FEF9F9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '16px' }}>🚨</span>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#DC2626' }}>Top Blocker</p>
              </div>
              <p style={{ fontSize: '13px', color: '#1A1A1A', lineHeight: 1.6, marginBottom: '6px' }}>
                <strong>
                  {history.length > 0 && history[0].blocker !== '—'
                    ? history[0].blocker
                    : 'Awaiting phase data'}
                </strong>
              </p>
              <p style={{ fontSize: '12px', color: '#717171', lineHeight: 1.6 }}>
                View your full PACE™ breakdown to identify and resolve your top blocker today.{' '}
                <strong style={{ color: '#DC2626' }}>Resolve this today.</strong>
              </p>
            </div>

            {/* Section 3: Today's 3 Tasks */}
            <div style={{ marginBottom: '24px', padding: '16px', borderRadius: '12px', border: '1px solid #E5E4E0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '16px' }}>✅</span>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A1A' }}>Today&apos;s 3 Most Important Tasks</p>
              </div>
              <p style={{ fontSize: '13px', color: '#9A9A9A', fontStyle: 'italic' }}>
                Log in to your full dashboard to see AI-prioritised tasks for today.
              </p>
            </div>

            {/* CTA button */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <Link href="/pace"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '12px 24px', borderRadius: '10px',
                  background: '#E8312A', color: 'white', fontWeight: 700, fontSize: '14px',
                  textDecoration: 'none',
                }}>
                View Full Velocity Breakdown →
              </Link>
            </div>

            {/* Footer */}
            <div style={{ borderTop: '1px solid #E5E4E0', paddingTop: '16px', textAlign: 'center' }}>
              <p style={{ fontSize: '11px', color: '#9A9A9A' }}>
                You&apos;re receiving this because you&apos;re a PACE™ subscriber.{' '}
                <a href="#" style={{ color: '#9A9A9A' }}>Unsubscribe</a>{' '}
                |{' '}
                <a href="#" style={{ color: '#9A9A9A' }}>Manage preferences</a>
              </p>
            </div>
          </div>
        </div>

        {/* Live preview note */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px' }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#E8312A', flexShrink: 0 }} />
          <p style={{ fontSize: '12px', color: '#9A9A9A' }}>
            This is a live preview. Your actual pulse reflects real-time data.
          </p>
        </div>
      </motion.div>

      {/* ── Section 2: Pulse Configuration ──────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
        style={{ background: 'white', border: '1px solid #E5E4E0', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>

        <p style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A', marginBottom: '20px' }}>Pulse Configuration</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

          {/* Delivery time */}
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#9A9A9A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              Delivery Time
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <button
                  onClick={() => setHour(h => Math.min(h + 1, 23))}
                  style={{ width: '28px', height: '22px', borderRadius: '6px 6px 0 0', border: '1px solid #E5E4E0', background: '#F7F6F4', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <ChevronUp style={{ width: '12px', height: '12px', color: '#717171' }} />
                </button>
                <button
                  onClick={() => setHour(h => Math.max(h - 1, 0))}
                  style={{ width: '28px', height: '22px', borderRadius: '0 0 6px 6px', border: '1px solid #E5E4E0', borderTop: 'none', background: '#F7F6F4', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <ChevronDown style={{ width: '12px', height: '12px', color: '#717171' }} />
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', border: '1px solid #E5E4E0', background: '#F7F6F4' }}>
                <Clock style={{ width: '14px', height: '14px', color: '#9A9A9A' }} />
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#1A1A1A', fontVariantNumeric: 'tabular-nums' }}>
                  {hour.toString().padStart(2, '0')}:00 {hour < 12 ? 'AM' : 'PM'}
                </span>
              </div>
            </div>
          </div>

          {/* Timezone */}
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#9A9A9A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              Timezone
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E5E4E0', background: '#F7F6F4' }}>
              <Globe style={{ width: '14px', height: '14px', color: '#9A9A9A' }} />
              <span style={{ fontSize: '13px', color: '#1A1A1A' }}>Eastern Time (EST/EDT)</span>
            </div>
          </div>

          {/* Recipients */}
          <div style={{ gridColumn: 'span 2' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#9A9A9A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              Recipients
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {recipients.length === 0 ? (
                <span style={{ fontSize: '13px', color: '#9A9A9A', fontStyle: 'italic' }}>
                  No accepted team members yet
                </span>
              ) : (
                recipients.map(r => (
                  <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '99px', border: '1px solid #E5E4E0', background: '#F7F6F4' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: r.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: '9px', fontWeight: 800, color: 'white' }}>{r.initials}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#1A1A1A' }}>{r.name}</span>
                      <span style={{ fontSize: '11px', color: '#9A9A9A', marginLeft: '4px' }}>({r.title})</span>
                    </div>
                  </div>
                ))
              )}
              <button style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '99px', border: '1px dashed #C4C2BE', background: 'transparent', cursor: 'pointer', color: '#717171', fontSize: '12px', fontWeight: 600 }}>
                <Plus style={{ width: '12px', height: '12px' }} />
                Add recipient
              </button>
            </div>
          </div>

          {/* Language */}
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#9A9A9A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              Language
            </p>
            <div style={{ display: 'flex', gap: '0' }}>
              {(['EN', 'FR'] as const).map((lang, i) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  style={{
                    padding: '7px 18px',
                    fontSize: '13px', fontWeight: 600,
                    border: '1px solid #E5E4E0',
                    borderRadius: i === 0 ? '8px 0 0 8px' : '0 8px 8px 0',
                    borderLeft: i === 1 ? 'none' : '1px solid #E5E4E0',
                    cursor: 'pointer',
                    background: language === lang ? '#1A1A1A' : '#F7F6F4',
                    color: language === lang ? 'white' : '#717171',
                    transition: 'all 0.15s',
                  }}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Weekend pulse toggle */}
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#9A9A9A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              Weekend Pulse
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={() => setWeekendPulse(p => !p)}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                {weekendPulse
                  ? <ToggleRight style={{ width: '32px', height: '32px', color: '#22C55E' }} />
                  : <ToggleLeft style={{ width: '32px', height: '32px', color: '#C4C2BE' }} />
                }
              </button>
              <span style={{ fontSize: '13px', color: weekendPulse ? '#16A34A' : '#9A9A9A', fontWeight: 600 }}>
                {weekendPulse ? 'On — Sat & Sun' : 'Off — Weekdays only'}
              </span>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #F0EFED' }}>
          <button
            onClick={handleSaveSettings}
            disabled={saveStatus === 'saving'}
            style={{
              padding: '10px 22px', borderRadius: '10px',
              background: saveStatus === 'saved' ? '#22C55E' : '#1A1A1A',
              color: 'white',
              fontWeight: 700, fontSize: '13px',
              border: 'none', cursor: saveStatus === 'saving' ? 'not-allowed' : 'pointer',
              transition: 'opacity 0.15s, background 0.2s',
              opacity: saveStatus === 'saving' ? 0.7 : 1,
            }}
            onMouseEnter={e => { if (saveStatus !== 'saving') e.currentTarget.style.opacity = '0.8' }}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? '✓ Saved' : 'Save Settings'}
          </button>
        </div>
      </motion.div>

      {/* ── Section 3: Pulse History ─────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}
        style={{ background: 'white', border: '1px solid #E5E4E0', borderRadius: '16px', padding: '24px', marginBottom: '2rem' }}>

        <p style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A', marginBottom: '16px' }}>
          Pulse History — Last {history.length > 0 ? `${history.length} Days` : '14 Days'}
        </p>

        {!hasHistory ? (
          /* ── Empty state ──────────────────────────────────────────────── */
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F7F6F4', border: '1px solid #E5E4E0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Flame style={{ width: '22px', height: '22px', color: '#C4C2BE' }} />
            </div>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A', marginBottom: '6px' }}>
              No pulse data yet
            </p>
            <p style={{ fontSize: '13px', color: '#9A9A9A', maxWidth: '320px', margin: '0 auto' }}>
              Complete tasks to generate your first PACE™ score and start tracking your IPO velocity.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #F0EFED' }}>
                  {['Date', 'PACE Score', 'Change', 'Top Blocker', 'Tasks Completed', 'Status'].map(col => (
                    <th key={col} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#9A9A9A', textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap' }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((row, i) => (
                  <tr key={`${row.date}-${i}`} style={{ borderBottom: i < history.length - 1 ? '1px solid #F7F6F4' : 'none' }}>
                    <td style={{ padding: '11px 12px', color: '#1A1A1A', fontWeight: 500 }}>{row.date}</td>
                    <td style={{ padding: '11px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ position: 'relative', width: '28px', height: '28px', flexShrink: 0 }}>
                          <svg width="28" height="28" viewBox="0 0 28 28">
                            <circle cx="14" cy="14" r="11" fill="none" stroke="#E5E4E0" strokeWidth="3" />
                            <circle cx="14" cy="14" r="11" fill="none" stroke="#E8312A" strokeWidth="3"
                              strokeLinecap="round"
                              strokeDasharray={`${2 * Math.PI * 11}`}
                              strokeDashoffset={`${2 * Math.PI * 11 * (1 - row.score / 100)}`}
                              style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                            />
                          </svg>
                          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '8px', fontWeight: 800, color: '#1A1A1A' }}>{row.score}</span>
                          </div>
                        </div>
                        <span style={{ fontWeight: 700, color: '#1A1A1A' }}>{row.score}/100</span>
                      </div>
                    </td>
                    <td style={{ padding: '11px 12px' }}>
                      <span style={{
                        fontSize: '12px', fontWeight: 700,
                        color: row.change.startsWith('+') && row.change !== '+0' ? '#16A34A' : row.change.startsWith('-') ? '#E8312A' : '#9A9A9A',
                      }}>
                        {row.change}
                      </span>
                    </td>
                    <td style={{ padding: '11px 12px', color: '#717171' }}>{row.blocker}</td>
                    <td style={{ padding: '11px 12px' }}>
                      <span style={{
                        fontSize: '12px', fontWeight: 600,
                        color: row.completed > 0 ? '#16A34A' : '#9A9A9A',
                      }}>
                        {row.completed}
                      </span>
                    </td>
                    <td style={{ padding: '11px 12px' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '99px', background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                        <CheckCircle2 style={{ width: '10px', height: '10px', color: '#16A34A' }} />
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#16A34A' }}>Delivered</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

    </div>
  )
}
