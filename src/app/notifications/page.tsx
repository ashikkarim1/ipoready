'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, Mail, Smartphone, MessageSquare, Wifi,
  Lock, Clock, ChevronRight, CheckCircle2, AlertTriangle,
  Zap, Calendar, Save, Loader2
} from 'lucide-react'
import { useAppStore } from '@/store/app-store'

// ── Toggle switch component ───────────────────────────────────────────────────

function Toggle({
  value,
  onChange,
  disabled = false,
  size = 'md',
}: {
  value: boolean
  onChange?: (v: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md'
}) {
  const w = size === 'sm' ? 32 : 40
  const h = size === 'sm' ? 18 : 22
  const dot = size === 'sm' ? 12 : 16
  const offset = size === 'sm' ? 3 : 3
  const travel = size === 'sm' ? 14 : 18

  return (
    <button
      type="button"
      onClick={() => !disabled && onChange && onChange(!value)}
      style={{
        width: `${w}px`, height: `${h}px`, borderRadius: `${h}px`,
        background: disabled ? '#E5E4E0' : value ? '#2D7A5F' : '#D1D5DB',
        border: 'none', padding: 0, cursor: disabled ? 'default' : 'pointer',
        position: 'relative', flexShrink: 0,
        transition: 'background 0.2s',
      }}
    >
      <span style={{
        position: 'absolute', top: `${offset}px`,
        left: value ? `${travel}px` : `${offset}px`,
        width: `${dot}px`, height: `${dot}px`, borderRadius: '50%',
        background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        transition: 'left 0.2s',
        display: 'block',
      }} />
    </button>
  )
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface ChannelState {
  inApp: boolean
  whatsapp: boolean
  push: boolean
  sms: boolean
}

interface EventRow {
  label: string
  eventKey: string
  email: boolean
  whatsapp: boolean
  push: boolean
}

interface TeamMember {
  id: string
  name: string
  email: string
  accessLevel: string
  jobTitle: string
  notificationFrequency: string
  status: string
  initials: string
}

// ── Event key map — maps API event_key to display label ──────────────────────

const EVENT_DEFINITIONS: Array<{ label: string; eventKey: string; defaultEmail: boolean; defaultWhatsapp: boolean; defaultPush: boolean }> = [
  { label: 'PACE™ score changes',              eventKey: 'pace_score_changes',          defaultEmail: true,  defaultWhatsapp: false, defaultPush: true  },
  { label: 'Task overdue (>7 days)',            eventKey: 'task_overdue_7d',             defaultEmail: true,  defaultWhatsapp: true,  defaultPush: true  },
  { label: 'New team message',                 eventKey: 'new_team_message',            defaultEmail: true,  defaultWhatsapp: false, defaultPush: true  },
  { label: 'Subscription renewal (14d)',        eventKey: 'subscription_renewal_14d',    defaultEmail: true,  defaultWhatsapp: false, defaultPush: false },
  { label: 'Subscription renewal (7d)',         eventKey: 'subscription_renewal_7d',     defaultEmail: true,  defaultWhatsapp: true,  defaultPush: true  },
  { label: 'Regulatory deadline approaching',  eventKey: 'regulatory_deadline',         defaultEmail: true,  defaultWhatsapp: true,  defaultPush: true  },
  { label: 'New expert inquiry response',      eventKey: 'new_expert_inquiry_response', defaultEmail: true,  defaultWhatsapp: false, defaultPush: true  },
  { label: 'Board report ready',               eventKey: 'board_report_ready',          defaultEmail: true,  defaultWhatsapp: false, defaultPush: true  },
  { label: 'SEDI filing due (5d / 3d / 1d)',   eventKey: 'sedi_filing_due',             defaultEmail: true,  defaultWhatsapp: true,  defaultPush: true  },
]

const DEFAULT_EVENTS: EventRow[] = EVENT_DEFINITIONS.map(e => ({
  label:    e.label,
  eventKey: e.eventKey,
  email:    e.defaultEmail,
  whatsapp: e.defaultWhatsapp,
  push:     e.defaultPush,
}))

const INITIAL_CHANNELS: ChannelState = {
  inApp: true,
  whatsapp: false,
  push: true,
  sms: false,
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const { company } = useAppStore()
  const companyName = company?.name ?? 'Your Company'

  const [channels, setChannels] = useState<ChannelState>(INITIAL_CHANNELS)
  const [events, setEvents] = useState<EventRow[]>(DEFAULT_EVENTS)
  const [pulseEnabled, setPulseEnabled] = useState(true)
  const [pulseTime, setPulseTime] = useState('07:00')
  const [whatsappConnecting, setWhatsappConnecting] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('+1 (416) 555-0123')
  const [smsNumber, setSmsNumber] = useState('')

  // Loading / save states
  const [loadingPrefs, setLoadingPrefs] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveToast, setSaveToast] = useState(false)
  const [saveError, setSaveError] = useState(false)

  // Team members
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loadingTeam, setLoadingTeam] = useState(true)

  // ── Fetch preferences on mount ───────────────────────────────────────────
  useEffect(() => {
    async function loadPrefs() {
      try {
        const res = await fetch('/api/notifications/preferences')
        if (!res.ok) return
        const data = await res.json() as {
          preferences: Array<{
            eventKey: string
            emailEnabled: boolean
            whatsappEnabled: boolean
            pushEnabled: boolean
            smsEnabled: boolean
          }>
        }

        // Map API response back to EventRow using EVENT_DEFINITIONS as ordering reference
        const mapped: EventRow[] = EVENT_DEFINITIONS.map(def => {
          const found = data.preferences.find(p => p.eventKey === def.eventKey)
          return {
            label:    def.label,
            eventKey: def.eventKey,
            email:    found ? found.emailEnabled    : def.defaultEmail,
            whatsapp: found ? found.whatsappEnabled : def.defaultWhatsapp,
            push:     found ? found.pushEnabled     : def.defaultPush,
          }
        })
        setEvents(mapped)
      } catch {
        // Keep defaults on error
      } finally {
        setLoadingPrefs(false)
      }
    }
    loadPrefs()
  }, [])

  // ── Fetch team members on mount ──────────────────────────────────────────
  useEffect(() => {
    async function loadTeam() {
      try {
        const res = await fetch('/api/team/members')
        if (!res.ok) return
        const data = await res.json() as { members: TeamMember[] }
        setTeamMembers(data.members)
      } catch {
        // keep empty
      } finally {
        setLoadingTeam(false)
      }
    }
    loadTeam()
  }, [])

  // ── Save preferences ─────────────────────────────────────────────────────
  async function savePreferences() {
    setSaving(true)
    setSaveError(false)
    try {
      const preferences = events.map(e => ({
        eventKey:        e.eventKey,
        emailEnabled:    e.email,
        whatsappEnabled: e.whatsapp,
        pushEnabled:     e.push,
        smsEnabled:      false,
      }))
      const res = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences }),
      })
      if (!res.ok) throw new Error('Save failed')
      setSaveToast(true)
      setTimeout(() => setSaveToast(false), 3000)
    } catch {
      setSaveError(true)
      setTimeout(() => setSaveError(false), 4000)
    } finally {
      setSaving(false)
    }
  }

  function toggleChannel(key: keyof ChannelState) {
    if (key === 'whatsapp' && !channels.whatsapp) {
      setWhatsappConnecting(true)
      setTimeout(() => setWhatsappConnecting(false), 2000)
    }
    setChannels(prev => ({ ...prev, [key]: !prev[key] }))
  }

  function toggleEvent(idx: number, col: 'email' | 'whatsapp' | 'push') {
    setEvents(prev => prev.map((row, i) =>
      i === idx ? { ...row, [col]: !row[col] } : row
    ))
  }

  // Summarise a team member's notification channels based on their frequency
  function channelSummary(member: TeamMember): string {
    const freq = member.notificationFrequency
    if (freq === 'none') return 'No notifications'
    if (freq === 'milestone_only') return 'Milestones only'
    if (freq === 'daily') return 'All channels'
    return 'Email only'
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>

      {/* ── Save toast ── */}
      <AnimatePresence>
        {(saveToast || saveError) && (
          <motion.div
            key={saveToast ? 'ok' : 'err'}
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
            style={{
              position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
              zIndex: 100, display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 18px', borderRadius: '12px', fontSize: '13px', fontWeight: 600,
              background: saveToast ? '#2D7A5F' : '#E8312A',
              color: 'white',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            }}
          >
            {saveToast
              ? <><CheckCircle2 style={{ width: '15px', height: '15px' }} /> Preferences saved</>
              : <><AlertTriangle style={{ width: '15px', height: '15px' }} /> Failed to save — please try again</>
            }
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Page header ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{ marginBottom: '32px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px', background: '#1A1A1A',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Bell style={{ width: '18px', height: '18px', color: 'white' }} />
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#1A1A1A', margin: 0 }}>
              Notification Preferences
            </h1>
          </div>
          <p style={{ fontSize: '14px', color: '#717171', margin: 0 }}>
            Manage how and when IPOReady reaches you and your team.
          </p>
        </div>

        {/* Save button */}
        <button
          onClick={savePreferences}
          disabled={saving || loadingPrefs}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 20px', borderRadius: '12px',
            background: saving || loadingPrefs ? '#E5E4E0' : '#1A1A1A',
            color: saving || loadingPrefs ? '#9A9A9A' : 'white',
            border: 'none', cursor: saving || loadingPrefs ? 'default' : 'pointer',
            fontSize: '13px', fontWeight: 700,
            transition: 'background 0.2s',
            flexShrink: 0,
          }}
          onMouseEnter={e => { if (!saving && !loadingPrefs) e.currentTarget.style.background = '#333' }}
          onMouseLeave={e => { if (!saving && !loadingPrefs) e.currentTarget.style.background = '#1A1A1A' }}
        >
          {saving
            ? <><Loader2 style={{ width: '14px', height: '14px' }} className="animate-spin" /> Saving...</>
            : <><Save style={{ width: '14px', height: '14px' }} /> Save Preferences</>
          }
        </button>
      </motion.div>

      {/* ── Section 1: Channels ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.06 }}
        style={{ marginBottom: '28px' }}
      >
        <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A1A', margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          Channels
        </h2>
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E5E4E0', overflow: 'hidden' }}>

          {/* Email — always on */}
          <ChannelRow
            icon={<Mail style={{ width: '16px', height: '16px', color: '#1A1A1A' }} />}
            name="Email"
            description="Daily digest + critical alerts"
            right={
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock style={{ width: '13px', height: '13px', color: '#9A9A9A' }} />
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#9A9A9A' }}>Required</span>
              </div>
            }
            borderBottom
          />

          {/* In-App */}
          <ChannelRow
            icon={<Bell style={{ width: '16px', height: '16px', color: '#1A1A1A' }} />}
            name="In-App"
            description="Banners, modals, and sidebar badges"
            right={
              <Toggle value={channels.inApp} onChange={() => toggleChannel('inApp')} />
            }
            borderBottom
          />

          {/* WhatsApp */}
          <ChannelRow
            icon={<MessageSquare style={{ width: '16px', height: '16px', color: '#25D366' }} />}
            name="WhatsApp Business"
            description="Critical task reminders and PACE™ daily pulse via WhatsApp"
            right={
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                <Toggle value={channels.whatsapp} onChange={() => toggleChannel('whatsapp')} />
                {channels.whatsapp && whatsappConnecting && (
                  <span style={{ fontSize: '11px', color: '#9A9A9A', fontStyle: 'italic' }}>
                    WhatsApp Business API connecting...
                  </span>
                )}
              </div>
            }
            extra={
              <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', color: '#9A9A9A' }}>Your number:</span>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  style={{
                    fontSize: '12px', fontWeight: 600, color: '#1A1A1A',
                    border: '1px solid #E5E4E0', borderRadius: '8px',
                    padding: '4px 10px', background: 'white', outline: 'none',
                    width: '180px',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#1A1A1A')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#E5E4E0')}
                />
                <button style={{
                  fontSize: '11px', fontWeight: 700, color: '#25D366',
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                }}>
                  verify →
                </button>
              </div>
            }
            borderBottom
          />

          {/* Push */}
          <ChannelRow
            icon={<Smartphone style={{ width: '16px', height: '16px', color: '#1A1A1A' }} />}
            name="Push Notifications"
            description="Browser push via Firebase"
            right={
              <Toggle value={channels.push} onChange={() => toggleChannel('push')} />
            }
            extra={
              channels.push ? (
                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E', flexShrink: 0 }} />
                  <span style={{ fontSize: '12px', color: '#9A9A9A' }}>Browser: Chrome on macOS (active)</span>
                </div>
              ) : null
            }
            borderBottom
          />

          {/* SMS */}
          <ChannelRow
            icon={<Wifi style={{ width: '16px', height: '16px', color: '#1A1A1A' }} />}
            name="SMS"
            description="Critical renewal and compliance alerts only"
            right={
              <Toggle value={channels.sms} onChange={() => toggleChannel('sms')} />
            }
            extra={
              channels.sms ? (
                <div style={{ marginTop: '10px' }}>
                  <input
                    type="text"
                    value={smsNumber}
                    onChange={e => setSmsNumber(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    style={{
                      fontSize: '12px', color: '#1A1A1A', border: '1px solid #E5E4E0',
                      borderRadius: '8px', padding: '6px 12px', background: 'white', outline: 'none', width: '200px',
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#1A1A1A')}
                    onBlur={e => (e.currentTarget.style.borderColor = '#E5E4E0')}
                  />
                </div>
              ) : null
            }
          />
        </div>
      </motion.div>

      {/* ── Section 2: Notification event types ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.12 }}
        style={{ marginBottom: '28px' }}
      >
        <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A1A', margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          Notification Types
        </h2>
        <div style={{
          background: 'white', borderRadius: '16px', border: '1px solid #E5E4E0',
          overflow: 'hidden',
        }}>
          {/* Table header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 72px 80px 60px',
            padding: '10px 20px', borderBottom: '1px solid #E5E4E0',
            background: '#F7F6F4',
          }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#9A9A9A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Event
            </span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#9A9A9A', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center' }}>
              Email
            </span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#9A9A9A', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center' }}>
              WhatsApp
            </span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#9A9A9A', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center' }}>
              Push
            </span>
          </div>

          {/* Loading skeleton */}
          {loadingPrefs ? (
            Array.from({ length: 9 }).map((_, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '1fr 72px 80px 60px',
                padding: '13px 20px', alignItems: 'center',
                borderBottom: i < 8 ? '1px solid #F0EFED' : 'none',
              }}>
                <div style={{ height: '13px', width: '60%', borderRadius: '6px', background: '#F0EFED' }} />
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <div style={{ height: '18px', width: '32px', borderRadius: '9px', background: '#F0EFED' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <div style={{ height: '18px', width: '32px', borderRadius: '9px', background: '#F0EFED' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <div style={{ height: '18px', width: '32px', borderRadius: '9px', background: '#F0EFED' }} />
                </div>
              </div>
            ))
          ) : (
            events.map((row, i) => (
              <div key={row.eventKey} style={{
                display: 'grid', gridTemplateColumns: '1fr 72px 80px 60px',
                padding: '13px 20px', alignItems: 'center',
                borderBottom: i < events.length - 1 ? '1px solid #F0EFED' : 'none',
              }}>
                <span style={{ fontSize: '13px', color: '#1A1A1A', fontWeight: 500 }}>{row.label}</span>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <Toggle value={row.email} onChange={() => toggleEvent(i, 'email')} size="sm" />
                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <Toggle value={row.whatsapp} onChange={() => toggleEvent(i, 'whatsapp')} size="sm" />
                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <Toggle value={row.push} onChange={() => toggleEvent(i, 'push')} size="sm" />
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* ── Section 3: PACE™ Daily Pulse ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.18 }}
        style={{ marginBottom: '28px' }}
      >
        <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A1A', margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          PACE™ Daily Pulse Preview
        </h2>
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E5E4E0', overflow: 'hidden' }}>

          {/* Pulse toggle */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px', borderBottom: '1px solid #E5E4E0',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Zap style={{ width: '16px', height: '16px', color: '#E8312A' }} />
              <div>
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
                  Enable PACE™ Daily Pulse
                </p>
                <p style={{ fontSize: '12px', color: '#9A9A9A', margin: '2px 0 0' }}>
                  Morning delivery — keeps your team aligned every day
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock style={{ width: '13px', height: '13px', color: '#9A9A9A' }} />
                <input
                  type="time"
                  value={pulseTime}
                  onChange={e => setPulseTime(e.target.value)}
                  style={{
                    fontSize: '12px', fontWeight: 600, color: '#1A1A1A',
                    border: '1px solid #E5E4E0', borderRadius: '8px',
                    padding: '4px 8px', background: 'white', outline: 'none',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#1A1A1A')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#E5E4E0')}
                />
                <span style={{ fontSize: '11px', color: '#9A9A9A' }}>EST</span>
              </div>
              <Toggle value={pulseEnabled} onChange={setPulseEnabled} />
            </div>
          </div>

          {/* Email preview */}
          <div style={{ padding: '24px' }}>
            {/* Email meta */}
            <div style={{
              padding: '12px 16px', borderRadius: '10px 10px 0 0',
              background: '#F7F6F4', border: '1px solid #E5E4E0', borderBottom: 'none',
            }}>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', color: '#9A9A9A', width: '44px', flexShrink: 0 }}>From:</span>
                <span style={{ fontSize: '12px', color: '#1A1A1A', fontWeight: 600 }}>IPOReady AI Engine &lt;pulse@ipoready.com&gt;</span>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ fontSize: '12px', color: '#9A9A9A', width: '44px', flexShrink: 0 }}>Subject:</span>
                <span style={{ fontSize: '12px', color: '#1A1A1A', fontWeight: 600 }}>
                  Your PACE™ is 62 — here&apos;s what to do today · {companyName}
                </span>
              </div>
            </div>

            {/* Email body */}
            <div style={{
              border: '1px solid #E5E4E0', borderRadius: '0 0 12px 12px',
              padding: '24px', background: 'white',
            }}>
              {/* PACE score ring + label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                <div style={{ position: 'relative', width: '76px', height: '76px', flexShrink: 0 }}>
                  <svg width="76" height="76" viewBox="0 0 76 76" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="38" cy="38" r="32" fill="none" stroke="#F0EFED" strokeWidth="6" />
                    <circle
                      cx="38" cy="38" r="32" fill="none"
                      stroke="url(#pulseGrad)" strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 32}`}
                      strokeDashoffset={`${2 * Math.PI * 32 * (1 - 62 / 100)}`}
                    />
                    <defs>
                      <linearGradient id="pulseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#E8312A" />
                        <stop offset="100%" stopColor="#FF6B35" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div style={{
                    position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '22px', fontWeight: 800, color: '#1A1A1A',
                  }}>62</div>
                </div>
                <div>
                  <p style={{ fontSize: '18px', fontWeight: 800, color: '#1A1A1A', margin: '0 0 4px' }}>
                    Accelerating ↑
                  </p>
                  <p style={{ fontSize: '13px', color: '#2D7A5F', fontWeight: 600, margin: '0 0 4px' }}>
                    +7 points since yesterday
                  </p>
                  <p style={{ fontSize: '12px', color: '#9A9A9A', margin: 0 }}>
                    {companyName}
                  </p>
                </div>
              </div>

              {/* Top blocker */}
              <div style={{
                padding: '12px 14px', borderRadius: '10px', marginBottom: '16px',
                background: '#FFF8F1', border: '1px solid #FDE68A',
                display: 'flex', alignItems: 'center', gap: '10px',
              }}>
                <AlertTriangle style={{ width: '15px', height: '15px', color: '#D97706', flexShrink: 0 }} />
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Top Blocker
                  </span>
                  <p style={{ fontSize: '13px', color: '#92400E', fontWeight: 600, margin: '2px 0 0' }}>
                    Auditor engagement letter — 9 days open
                  </p>
                </div>
              </div>

              {/* Today's 3 tasks */}
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, color: '#9A9A9A', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '10px' }}>
                  Today&apos;s Top 3 Actions
                </p>
                {[
                  'Sign and return auditor engagement letter',
                  'Complete PIF forms for 2 remaining directors',
                  'Review draft Audit Committee Charter',
                ].map((task, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '9px 12px', borderRadius: '8px',
                    marginBottom: '6px', background: '#F7F6F4',
                    border: '1px solid #E5E4E0',
                  }}>
                    <div style={{
                      width: '16px', height: '16px', borderRadius: '4px',
                      border: '1.5px solid #C4C2BE', flexShrink: 0,
                    }} />
                    <span style={{ fontSize: '13px', color: '#1A1A1A' }}>{task}</span>
                  </div>
                ))}
              </div>

              {/* CTA button */}
              <a href="#" style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '11px 20px', borderRadius: '10px',
                background: '#1A1A1A', color: 'white', fontSize: '13px', fontWeight: 700,
                textDecoration: 'none',
              }}>
                View Full Velocity Breakdown →
              </a>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Section 4: Team Notification Preferences ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.24 }}
        style={{ marginBottom: '12px' }}
      >
        <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A1A', margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          Team Notification Preferences
        </h2>
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E5E4E0', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 180px 100px',
            padding: '10px 20px', borderBottom: '1px solid #E5E4E0',
            background: '#F7F6F4',
          }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#9A9A9A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Member
            </span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#9A9A9A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Channels
            </span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#9A9A9A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Actions
            </span>
          </div>

          {loadingTeam ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '1fr 180px 100px',
                padding: '14px 20px', alignItems: 'center',
                borderBottom: i < 2 ? '1px solid #F0EFED' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F0EFED', flexShrink: 0 }} />
                  <div>
                    <div style={{ height: '13px', width: '120px', borderRadius: '6px', background: '#F0EFED', marginBottom: '4px' }} />
                    <div style={{ height: '11px', width: '80px', borderRadius: '6px', background: '#F0EFED' }} />
                  </div>
                </div>
                <div style={{ height: '12px', width: '100px', borderRadius: '6px', background: '#F0EFED' }} />
                <div style={{ height: '28px', width: '80px', borderRadius: '8px', background: '#F0EFED' }} />
              </div>
            ))
          ) : teamMembers.length === 0 ? (
            <div style={{ padding: '24px 20px', textAlign: 'center' }}>
              <p style={{ fontSize: '13px', color: '#9A9A9A', margin: 0 }}>No team members found</p>
            </div>
          ) : (
            teamMembers.map((member, i) => {
              const summary = channelSummary(member)
              return (
                <div key={member.id} style={{
                  display: 'grid', gridTemplateColumns: '1fr 180px 100px',
                  padding: '14px 20px', alignItems: 'center',
                  borderBottom: i < teamMembers.length - 1 ? '1px solid #F0EFED' : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: '#1A1A1A', color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '12px', fontWeight: 700, flexShrink: 0,
                    }}>
                      {member.initials}
                    </div>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A', margin: 0 }}>{member.name}</p>
                      <p style={{ fontSize: '11px', color: '#9A9A9A', margin: '1px 0 0' }}>{member.jobTitle}</p>
                    </div>
                  </div>
                  <span style={{
                    fontSize: '12px', fontWeight: 500,
                    color: summary === 'All channels' ? '#2D7A5F' : '#717171',
                  }}>
                    {summary}
                  </span>
                  <button style={{
                    fontSize: '12px', fontWeight: 600, color: '#1A1A1A',
                    background: 'none', border: '1px solid #E5E4E0', borderRadius: '8px',
                    padding: '5px 12px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '4px',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#F7F6F4')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  >
                    Manage <ChevronRight style={{ width: '12px', height: '12px' }} />
                  </button>
                </div>
              )
            })
          )}
        </div>
      </motion.div>

    </div>
  )
}

// ── Helper component ──────────────────────────────────────────────────────────

function ChannelRow({
  icon, name, description, right, extra, borderBottom = false,
}: {
  icon: React.ReactNode
  name: string
  description: string
  right: React.ReactNode
  extra?: React.ReactNode
  borderBottom?: boolean
}) {
  return (
    <div style={{
      padding: '16px 20px',
      borderBottom: borderBottom ? '1px solid #E5E4E0' : 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: '#F7F6F4', border: '1px solid #E5E4E0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A1A', margin: 0 }}>{name}</p>
          <p style={{ fontSize: '12px', color: '#9A9A9A', margin: '2px 0 0' }}>{description}</p>
        </div>
        {right}
      </div>
      {extra}
    </div>
  )
}
