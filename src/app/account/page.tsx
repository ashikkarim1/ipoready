'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import {
  Lock, Bell, CreditCard, Shield, Globe, Eye, EyeOff,
  Save, Zap, Building2, Smartphone,
  CheckCircle2, User, Settings, ChevronRight, Sparkles,
  AlertTriangle, LogOut, Fingerprint, MessageCircle, Loader2, Camera
} from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import { ROLE_LABELS, EXCHANGE_LABELS } from '@/lib/utils'
import { signOut } from 'next-auth/react'

const TABS = [
  { id: 'Profile',       icon: User,       label: 'Profile' },
  { id: 'Notifications', icon: Bell,        label: 'Notifications' },
  { id: 'Security',      icon: Shield,      label: 'Security' },
  { id: 'Billing',       icon: CreditCard,  label: 'Billing' },
  { id: 'Company',       icon: Building2,   label: 'Company' },
]

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle}
      className="w-11 h-6 rounded-full transition-all relative flex-shrink-0"
      style={{ background: on ? '#1A1A1A' : '#D1D5DB' }}>
      <div className="w-4 h-4 rounded-full bg-white absolute top-1 transition-all shadow-sm"
        style={{ [on ? 'right' : 'left']: '4px' }} />
    </button>
  )
}

function SectionCard({ title, subtitle, children, action }: { title?: string; subtitle?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid #E5E4E0' }}>
      {title && (
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #F0EFED' }}>
          <div>
            <p className="font-bold body-sm" style={{ color: '#1A1A1A' }}>{title}</p>
            {subtitle && <p className="caption-sm mt-0.5" style={{ color: '#9A9A9A' }}>{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  )
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid sm:grid-cols-3 gap-2 items-start py-4" style={{ borderBottom: '1px solid #F7F6F4' }}>
      <label className="label font-medium pt-2.5" style={{ color: '#717171' }}>{label}</label>
      <div className="sm:col-span-2">{children}</div>
    </div>
  )
}

const inputCls = "w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
const inputStyle = { border: '1px solid #E5E4E0', background: '#FAFAFA', color: '#1A1A1A' }

export default function AccountPage() {
  const { data: session } = useSession()
  const { company, currency, language, setCurrency, setLanguage } = useAppStore()
  const [activeTab, setActiveTab] = useState('Profile')
  // Profile form
  const [profileName, setProfileName]   = useState('')
  const [profileJob, setProfileJob]     = useState('')
  const [profileLi, setProfileLi]       = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSaved, setProfileSaved]   = useState(false)
  const [profileError, setProfileError]   = useState('')
  // Password form
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw]         = useState(false)
  const [currentPw, setCurrentPw]         = useState('')
  const [newPw, setNewPw]                 = useState('')
  const [pwSaving, setPwSaving]           = useState(false)
  const [pwSaved, setPwSaved]             = useState(false)
  const [pwError, setPwError]             = useState('')
  // Notifications (client-side prefs, persisted to DB in future sprint)
  const [notifFreq, setNotifFreq]         = useState('daily')
  const [notifToggles, setNotifToggles]   = useState({ task_due: true, milestone: true, team_activity: true, document: false, pace: true })
  const [pushSupported, setPushSupported] = useState(false)
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default')
  const [pushSubscribed, setPushSubscribed] = useState(false)
  const [pushLoading, setPushLoading]     = useState(false)

  // Journey stats (from /api/dashboard/stats)
  const [acctStats, setAcctStats] = useState<{
    totalTasks: number; completedTasks: number; teamMembersCount: number
  } | null>(null)

  // WhatsApp AI Companion
  const [waPhone, setWaPhone]       = useState('')
  const [waOptedIn, setWaOptedIn]   = useState(false)
  const [waEligible, setWaEligible] = useState(false)
  const [waLoading, setWaLoading]   = useState(false)
  const [waSaved, setWaSaved]       = useState(false)
  const [waError, setWaError]       = useState('')
  const [portalLoading, setPortalLoading] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  const initials = (session?.user?.name || 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  const userRole = (session?.user as any)?.role ?? 'ceo'

  // Seed profile form from session once loaded
  useEffect(() => {
    if (session?.user?.name && !profileName) setProfileName(session.user.name)
  }, [session?.user?.name]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setPushSupported('serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window)
    if ('Notification' in window) setPushPermission(Notification.permission)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(reg => {
        reg.pushManager.getSubscription().then(sub => setPushSubscribed(!!sub))
      }).catch(() => {})
    }
    // Load WhatsApp settings + plan eligibility
    fetch('/api/account/whatsapp')
      .then(r => r.json())
      .then(d => {
        if (d.phoneNumber !== undefined) {
          setWaPhone(d.phoneNumber)
          setWaOptedIn(d.optedIn)
          setWaEligible(d.eligible ?? false)
        }
      })
      .catch(() => {})

    // Load live journey stats
    fetch('/api/dashboard/stats')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d) setAcctStats({
          totalTasks: d.totalTasks ?? 0,
          completedTasks: d.completedTasks ?? 0,
          teamMembersCount: d.teamMembersCount ?? 0,
        })
      })
      .catch(() => {})
  }, [])

  async function openBillingPortal() {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert('Could not open billing portal. Please contact support.')
    } catch {
      alert('Could not open billing portal. Please contact support.')
    } finally {
      setPortalLoading(false)
    }
  }

  async function handleUpgrade(planId: string) {
    setCheckoutLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, billing: 'monthly', currency: 'USD' }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert(data.error ?? 'Checkout failed.')
    } catch {
      alert('Checkout failed.')
    } finally {
      setCheckoutLoading(false)
    }
  }

  async function handleEnablePush() {
    setPushLoading(true)
    try {
      const permission = await Notification.requestPermission()
      setPushPermission(permission)
      if (permission !== 'granted') { setPushLoading(false); return }
      if (!('serviceWorker' in navigator)) { setPushLoading(false); return }
      const reg = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U',
      })
      await fetch('/api/push/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sub) })
      setPushSubscribed(true)
    } catch {}
    setPushLoading(false)
  }

  async function handleDisablePush() {
    setPushLoading(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) await sub.unsubscribe()
      await fetch('/api/push/subscribe', { method: 'DELETE' })
      setPushSubscribed(false)
    } catch {}
    setPushLoading(false)
  }

  async function handleProfileSave() {
    setProfileError('')
    setProfileSaving(true)
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profileName, jobTitle: profileJob, linkedin: profileLi }),
      })
      const data = await res.json()
      if (!res.ok) { setProfileError(data.error || 'Save failed'); return }
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 2500)
    } catch { setProfileError('Network error') }
    finally { setProfileSaving(false) }
  }

  async function handlePasswordSave() {
    setPwError('')
    if (!currentPw || !newPw) { setPwError('Both fields are required'); return }
    if (newPw.length < 8) { setPwError('New password must be at least 8 characters'); return }
    setPwSaving(true)
    try {
      const res = await fetch('/api/account/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      })
      const data = await res.json()
      if (!res.ok) { setPwError(data.error || 'Update failed'); return }
      setPwSaved(true)
      setCurrentPw('')
      setNewPw('')
      setTimeout(() => setPwSaved(false), 2500)
    } catch { setPwError('Network error') }
    finally { setPwSaving(false) }
  }

  async function handleWaSave() {
    setWaError('')
    setWaLoading(true)
    try {
      const res = await fetch('/api/account/whatsapp', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: waPhone, optedIn: waOptedIn }),
      })
      const data = await res.json()
      if (!res.ok) { setWaError(data.error || 'Save failed'); return }
      setWaSaved(true)
      setTimeout(() => setWaSaved(false), 2500)
    } catch {
      setWaError('Network error — please try again')
    } finally {
      setWaLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '0' }} suppressHydrationWarning>

      {/* Profile hero card */}
      <div className="rounded-2xl overflow-hidden mb-6" style={{ background: '#1A1A1A' }}>
        <div className="px-8 pt-8 pb-6">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center font-black text-2xl text-white select-none"
                style={{ background: 'linear-gradient(135deg, #E8312A 0%, #B91C1C 100%)' }}>
                {initials}
              </div>
              <button className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                style={{ background: '#333', border: '2px solid #1A1A1A' }}
                title="Change photo">
                <Camera className="w-3 h-3 text-white" />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h1 className="font-bold text-xl text-white truncate">{session?.user?.name || 'User'}</h1>
                <span className="label-sm px-2.5 py-0.5 rounded-full font-semibold flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {ROLE_LABELS[userRole as keyof typeof ROLE_LABELS] ?? userRole}
                </span>
              </div>
              <p className="body-sm mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>{session?.user?.email}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 caption-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#22C55E' }} />
                  Active session
                </div>
                <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
                <div className="caption-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>JWT · 30-day expiry</div>
                {company && (
                  <>
                    <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
                    <div className="flex items-center gap-1.5 caption-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      <Building2 className="w-3 h-3" />
                      {company.name}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Sign out */}
            <button onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl label font-medium flex-shrink-0 transition-all"
              style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'white' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}>
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>

        {/* Tab nav inside hero */}
        <div className="flex overflow-x-auto" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          {TABS.map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className="flex items-center gap-2 px-5 py-3.5 label font-medium transition-all flex-shrink-0 relative"
              style={{ color: activeTab === id ? 'white' : 'rgba(255,255,255,0.4)' }}>
              <Icon className="w-4 h-4" />
              {label}
              {activeTab === id && (
                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ background: '#E8312A' }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">

        {/* ── Profile ─────────────────────────────────────────────── */}
        {activeTab === 'Profile' && (
          <motion.div key="profile" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Journey Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
              {[
                {
                  label: 'PACE™ Score',
                  value: company?.paceScore != null ? String(company.paceScore) : '—',
                  sub: company?.paceScore != null ? (company.paceScore >= 70 ? 'Above target' : company.paceScore >= 50 ? 'On track' : 'Needs attention') : 'Loading…',
                  icon: Zap, color: '#E8312A', bg: '#FEF2F2',
                },
                {
                  label: 'Days to Listing',
                  value: company?.estimatedDaysToIPO != null ? `~${company.estimatedDaysToIPO}` : '—',
                  sub: 'Estimated timeline',
                  icon: Sparkles, color: '#1D4ED8', bg: '#EFF6FF',
                },
                {
                  label: 'Tasks Complete',
                  value: acctStats ? `${acctStats.completedTasks} / ${acctStats.totalTasks}` : '—',
                  sub: 'Overall checklist',
                  icon: CheckCircle2, color: '#15803D', bg: '#F0FDF4',
                },
                {
                  label: 'Team Members',
                  value: acctStats ? String(acctStats.teamMembersCount) : '—',
                  sub: 'Active users',
                  icon: Settings, color: '#7C3AED', bg: '#F5F3FF',
                },
              ].map(({ label, value, sub, icon: Icon, color, bg }) => (
                <div key={label} className="rounded-2xl p-4" style={{ background: 'white', border: '1px solid #E5E4E0' }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ background: bg }}>
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <p className="font-black text-xl" style={{ color: '#1A1A1A' }}>{value}</p>
                  <p className="label-sm font-medium mt-0.5" style={{ color: '#9A9A9A' }}>{label}</p>
                  <p className="text-[10px] mt-0.5" style={{ color }}>{sub}</p>
                </div>
              ))}
            </div>

            {/* Profile Completeness */}
            {(() => {
              const completenessItems = [
                { label: 'Basic info',         done: !!profileName },
                { label: 'Company linked',     done: !!company },
                { label: 'Team set up',        done: (acctStats?.teamMembersCount ?? 0) > 0 },
                { label: 'Job title added',    done: !!profileJob },
                { label: '2FA enabled',        done: false },
                { label: 'Exchange confirmed', done: !!company?.targetExchange },
              ]
              const completedCount = completenessItems.filter(i => i.done).length
              const completePct = Math.round((completedCount / completenessItems.length) * 100)
              return (
            <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid #E5E4E0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div>
                  <p className="font-bold body-sm" style={{ color: '#1A1A1A' }}>Profile Completeness</p>
                  <p className="caption-sm mt-0.5" style={{ color: '#9A9A9A' }}>Complete your profile to unlock all features</p>
                </div>
                <span className="font-black text-2xl" style={{ color: '#1A1A1A' }}>{completePct}%</span>
              </div>
              <div style={{ height: '6px', background: '#F0EFED', borderRadius: '999px', overflow: 'hidden', marginBottom: '0.75rem' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${completePct}%` }} transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                  style={{ height: '100%', background: 'linear-gradient(90deg, #1A1A1A 0%, #E8312A 100%)', borderRadius: '999px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {completenessItems.map(({ label, done }) => (
                  <div key={label} className="flex items-center gap-2 caption-sm"
                    style={{ color: done ? '#15803D' : '#9A9A9A' }}>
                    <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: done ? '#DCFCE7' : '#F0EFED', border: `1px solid ${done ? '#86EFAC' : '#E5E4E0'}` }}>
                      {done && <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#16A34A' }} />}
                    </div>
                    {label}
                  </div>
                ))}
              </div>
            </div>
              )
            })()}

            {/* Personal Information */}
            <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid #E5E4E0' }}>
              <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #F0EFED' }}>
                <div>
                  <p className="font-bold body-sm" style={{ color: '#1A1A1A' }}>Personal Information</p>
                  <p className="caption-sm mt-0.5" style={{ color: '#9A9A9A' }}>Your name, email, and role on this account</p>
                </div>
                <div className="flex items-center gap-1.5 caption-sm px-2.5 py-1 rounded-full"
                  style={{ background: '#F0FDF4', color: '#15803D', border: '1px solid #86EFAC' }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#22C55E' }} />
                  Verified
                </div>
              </div>
              <div className="px-6 py-2">
                <FieldRow label="Full Name">
                  <input className={inputCls} style={inputStyle} value={profileName}
                    onChange={e => setProfileName(e.target.value)}
                    onFocus={e => { e.target.style.borderColor = '#1A1A1A'; e.target.style.boxShadow = '0 0 0 3px rgba(26,26,26,0.07)' }}
                    onBlur={e => { e.target.style.borderColor = '#E5E4E0'; e.target.style.boxShadow = 'none' }} />
                </FieldRow>
                <FieldRow label="Email Address">
                  <input type="email" className={inputCls}
                    style={{ ...inputStyle, background: '#F7F6F4', color: '#9A9A9A' }}
                    value={session?.user?.email || ''} readOnly
                    title="Email cannot be changed here — contact support" />
                </FieldRow>
                <FieldRow label="Job Title">
                  <input className={inputCls} style={inputStyle} value={profileJob}
                    onChange={e => setProfileJob(e.target.value)}
                    placeholder="Chief Executive Officer"
                    onFocus={e => { e.target.style.borderColor = '#1A1A1A'; e.target.style.boxShadow = '0 0 0 3px rgba(26,26,26,0.07)' }}
                    onBlur={e => { e.target.style.borderColor = '#E5E4E0'; e.target.style.boxShadow = 'none' }} />
                </FieldRow>
                <FieldRow label="LinkedIn Profile">
                  <input className={inputCls} style={inputStyle} value={profileLi}
                    onChange={e => setProfileLi(e.target.value)}
                    placeholder="https://linkedin.com/in/yourname"
                    onFocus={e => { e.target.style.borderColor = '#1A1A1A'; e.target.style.boxShadow = '0 0 0 3px rgba(26,26,26,0.07)' }}
                    onBlur={e => { e.target.style.borderColor = '#E5E4E0'; e.target.style.boxShadow = 'none' }} />
                </FieldRow>
              </div>
              {profileError && (
                <div className="mx-6 mb-3 px-4 py-2.5 rounded-xl body-sm" style={{ background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA' }}>
                  {profileError}
                </div>
              )}
              <div className="px-6 pb-5 pt-2" style={{ borderTop: '1px solid #F7F6F4' }}>
                <button onClick={handleProfileSave} disabled={profileSaving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl label font-semibold transition-all disabled:opacity-60"
                  style={{ background: profileSaved ? '#15803D' : '#1A1A1A', color: 'white' }}>
                  {profileSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                    : profileSaved ? <><CheckCircle2 className="w-4 h-4" /> Saved!</>
                    : <><Save className="w-4 h-4" /> Save Changes</>}
                </button>
              </div>
            </div>

            {/* Preferences */}
            <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid #E5E4E0' }}>
              <div className="px-6 py-4" style={{ borderBottom: '1px solid #F0EFED' }}>
                <p className="font-bold body-sm" style={{ color: '#1A1A1A' }}>Display Preferences</p>
                <p className="caption-sm mt-0.5" style={{ color: '#9A9A9A' }}>Currency and interface language settings</p>
              </div>
              <div className="p-6" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <p className="label-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#9A9A9A' }}>Default Currency</p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {(['CAD', 'USD'] as const).map(c => (
                      <button key={c} onClick={() => setCurrency(c)}
                        className="flex-1 py-3 rounded-xl label font-semibold transition-all"
                        style={currency === c
                          ? { background: '#1A1A1A', border: '1px solid #1A1A1A', color: 'white' }
                          : { background: '#F7F6F4', border: '1px solid #E5E4E0', color: '#717171' }}>
                        {currency === c && <span style={{ color: '#E8312A' }}>✓ </span>}
                        {c === 'CAD' ? '$ CAD' : '$ USD'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="label-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#9A9A9A' }}>
                    {language === 'en' ? 'Interface Language' : 'Langue d\'interface'}
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {([['en', 'English'] as const, ['fr', 'Français'] as const]).map(([k, l]) => (
                      <button key={k} onClick={() => setLanguage(k)}
                        className="flex-1 py-3 rounded-xl label font-semibold transition-all"
                        style={language === k
                          ? { background: '#1A1A1A', border: '1px solid #1A1A1A', color: 'white' }
                          : { background: '#F7F6F4', border: '1px solid #E5E4E0', color: '#717171' }}>
                        {language === k && <span style={{ color: '#E8312A' }}>✓ </span>}{l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Integrations */}
            <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid #E5E4E0' }}>
              <div className="px-6 py-4" style={{ borderBottom: '1px solid #F0EFED' }}>
                <p className="font-bold body-sm" style={{ color: '#1A1A1A' }}>Connected Integrations</p>
                <p className="caption-sm mt-0.5" style={{ color: '#9A9A9A' }}>Sync documents and data from external services</p>
              </div>
              <div className="p-4" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  { name: 'Google Drive', desc: 'Sync documents automatically', connected: false, icon: '📁' },
                  { name: 'DocuSign', desc: 'E-signature for executed agreements', connected: false, icon: '✍️' },
                  { name: 'QuickBooks / Xero', desc: 'Financial data for prospectus drafting', connected: false, icon: '📊' },
                  { name: 'Slack', desc: 'Team milestone & alert notifications', connected: false, icon: '💬' },
                ].map(({ name, desc, connected, icon }) => (
                  <div key={name} className="flex items-center gap-4 p-4 rounded-xl"
                    style={{ background: '#FAFAFA', border: '1px solid #F0EFED' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background: 'white', border: '1px solid #E5E4E0' }}>
                      {icon}
                    </div>
                    <div className="flex-1">
                      <p className="label font-semibold" style={{ color: '#1A1A1A' }}>{name}</p>
                      <p className="caption-sm mt-0.5" style={{ color: '#9A9A9A' }}>{desc}</p>
                    </div>
                    <button className="label-sm px-3 py-1.5 rounded-lg font-semibold transition-all"
                      style={connected
                        ? { background: '#F0FDF4', color: '#15803D', border: '1px solid #86EFAC' }
                        : { background: '#F7F6F4', color: '#9A9A9A', border: '1px solid #E5E4E0' }}>
                      {connected ? '✓ Connected' : 'Connect'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        )}

        {/* ── Notifications ──────────────────────────────────────── */}
        {activeTab === 'Notifications' && (
          <motion.div key="notifications" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <SectionCard title="Email Digest" subtitle="How often would you like summary emails?">
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { value: 'daily',          en: 'Daily Digest',    desc: 'Every morning at 7am' },
                  { value: 'weekly',         en: 'Weekly Summary',  desc: 'Every Monday morning' },
                  { value: 'milestone_only', en: 'Milestones Only', desc: 'Major achievements only' },
                  { value: 'none',           en: 'None',            desc: 'No automated emails' },
                ].map(({ value, en, desc }) => (
                  <button key={value} onClick={() => setNotifFreq(value)}
                    className="p-4 rounded-xl text-left border transition-all"
                    style={notifFreq === value
                      ? { background: '#F7F6F4', border: '1px solid #1A1A1A' }
                      : { background: '#FAFAFA', border: '1px solid #E5E4E0' }}>
                    <div className="flex items-center gap-2 mb-1">
                      {notifFreq === value && <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#E8312A' }} />}
                      <p className="label font-semibold" style={{ color: notifFreq === value ? '#1A1A1A' : '#717171' }}>{en}</p>
                    </div>
                    <p className="caption-sm" style={{ color: '#9A9A9A' }}>{desc}</p>
                  </button>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Notification Types" subtitle="Choose which events send you an email">
              <div className="space-y-1">
                {[
                  { key: 'task_due',      en: 'Task due reminders',      desc: '48h before a task deadline' },
                  { key: 'milestone',     en: 'Milestone achievements',  desc: 'When you unlock a new phase or XP' },
                  { key: 'team_activity', en: 'Team activity updates',   desc: 'When teammates complete tasks' },
                  { key: 'document',      en: 'Document status changes', desc: 'Verified, rejected, or pending review' },
                  { key: 'pace',          en: 'PACE™ score alerts',      desc: 'When your score drops below target' },
                ].map(({ key, en, desc }) => (
                  <div key={key} className="flex items-center justify-between py-3 px-4 rounded-xl transition-colors"
                    style={{ background: '#FAFAFA', border: '1px solid #F0EFED', marginBottom: '0.5rem' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#F7F6F4')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#FAFAFA')}>
                    <div>
                      <p className="label font-medium" style={{ color: '#1A1A1A' }}>{en}</p>
                      <p className="caption-sm mt-0.5" style={{ color: '#9A9A9A' }}>{desc}</p>
                    </div>
                    <Toggle on={notifToggles[key as keyof typeof notifToggles]}
                      onToggle={() => setNotifToggles(v => ({ ...v, [key]: !v[key as keyof typeof notifToggles] }))} />
                  </div>
                ))}
              </div>
            </SectionCard>

            {pushSupported && (
              <SectionCard title="Push Notifications" subtitle="Badge alerts on iOS & Android">
                <div className="flex items-center justify-between p-4 rounded-xl"
                  style={{ background: '#FAFAFA', border: '1px solid #E5E4E0' }}>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Smartphone className="w-5 h-5" style={{ color: '#9A9A9A' }} />
                      {pushSubscribed && (
                        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
                          style={{ background: '#16A34A', border: '2px solid white' }} />
                      )}
                    </div>
                    <div>
                      <p className="label font-medium" style={{ color: '#1A1A1A' }}>
                        {pushSubscribed ? 'Push notifications active' : 'Enable push notifications'}
                      </p>
                      <p className="caption-sm mt-0.5" style={{ color: '#9A9A9A' }}>
                        {pushPermission === 'denied' ? 'Blocked — allow in browser site settings'
                          : pushSubscribed ? 'This device will receive badge alerts'
                          : 'Works on iOS 16.4+ Safari and Android Chrome'}
                      </p>
                    </div>
                  </div>
                  {pushPermission !== 'denied' && (
                    <Toggle on={pushSubscribed}
                      onToggle={pushSubscribed ? handleDisablePush : handleEnablePush} />
                  )}
                </div>
              </SectionCard>
            )}

            {/* WhatsApp AI Companion */}
            <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid #E5E4E0' }}>
              {/* Header */}
              <div className="flex items-center gap-4 px-6 py-4" style={{ borderBottom: '1px solid #F0EFED' }}>
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)' }}>
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold body-sm" style={{ color: '#1A1A1A' }}>WhatsApp AI Companion</p>
                    {!waEligible && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
                        style={{ background: 'linear-gradient(90deg, #1A1A1A 0%, #E8312A 100%)', color: 'white' }}>
                        Growth+
                      </span>
                    )}
                  </div>
                  <p className="caption-sm mt-0.5" style={{ color: '#9A9A9A' }}>
                    Receive your PACE™ daily briefing and update tasks by text or voice message
                  </p>
                </div>
                {waEligible && <Toggle on={waOptedIn} onToggle={() => setWaOptedIn(v => !v)} />}
              </div>

              {/* ── Starter upgrade wall ── */}
              {!waEligible ? (
                <div className="p-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Feature preview — greyed */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', opacity: 0.4 }}>
                    {[
                      { emoji: '🌅', text: 'Morning briefing at 7am ET' },
                      { emoji: '✅', text: 'Complete tasks by text' },
                      { emoji: '🎙️', text: 'Voice note transcription' },
                      { emoji: '🚨', text: 'Flag blockers instantly' },
                      { emoji: '📊', text: 'Check PACE™ score anytime' },
                      { emoji: '💬', text: 'Conversational task updates' },
                    ].map(({ emoji, text }) => (
                      <div key={text} className="flex items-center gap-2 caption-sm" style={{ color: '#717171' }}>
                        <span>{emoji}</span>
                        <span>{text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Upgrade prompt */}
                  <div className="rounded-2xl p-5" style={{ background: '#1A1A1A' }}>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(232,49,42,0.15)', border: '1px solid rgba(232,49,42,0.3)' }}>
                        <Zap className="w-5 h-5" style={{ color: '#E8312A' }} />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold body-sm text-white mb-1">Available on Growth & Enterprise</p>
                        <p className="caption-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
                          Your Starter plan doesn't include the WhatsApp AI Companion. Upgrade to Growth to get daily briefings, voice updates, and conversational task management — all from WhatsApp.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <a href="/pricing"
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl label font-semibold transition-all"
                        style={{ background: '#E8312A', color: 'white' }}>
                        <Zap className="w-3.5 h-3.5" /> Upgrade to Growth →
                      </a>
                      <a href="/pricing"
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl label font-medium"
                        style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        Compare plans
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                /* ── Full form for Growth/Enterprise ── */
                <div className="p-6" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Phone input */}
                  <div>
                    <label className="label-sm font-semibold uppercase tracking-wider block mb-2" style={{ color: '#9A9A9A' }}>
                      WhatsApp Phone Number
                    </label>
                    <input
                      type="tel"
                      className={inputCls}
                      style={inputStyle}
                      value={waPhone}
                      onChange={e => setWaPhone(e.target.value)}
                      placeholder="+16135551234"
                      onFocus={e => { e.target.style.borderColor = '#25D366'; e.target.style.boxShadow = '0 0 0 3px rgba(37,211,102,0.1)' }}
                      onBlur={e => { e.target.style.borderColor = '#E5E4E0'; e.target.style.boxShadow = 'none' }}
                    />
                    <p className="caption-sm mt-1.5" style={{ color: '#9A9A9A' }}>
                      International format with country code — must match your WhatsApp account.
                    </p>
                  </div>

                  {/* Feature bullets */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    {[
                      { emoji: '🌅', text: 'Morning briefing at 7am ET' },
                      { emoji: '✅', text: 'Complete tasks by text' },
                      { emoji: '🎙️', text: 'Voice note transcription' },
                      { emoji: '🚨', text: 'Flag blockers instantly' },
                      { emoji: '📊', text: 'Check PACE™ score anytime' },
                      { emoji: '💬', text: 'Conversational task updates' },
                    ].map(({ emoji, text }) => (
                      <div key={text} className="flex items-center gap-2 caption-sm" style={{ color: '#717171' }}>
                        <span>{emoji}</span>
                        <span>{text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Setup instructions when not opted in */}
                  {!waOptedIn && (
                    <div className="p-4 rounded-xl" style={{ background: '#F7F6F4', border: '1px solid #E5E4E0' }}>
                      <p className="label-sm font-semibold mb-2" style={{ color: '#1A1A1A' }}>How to connect:</p>
                      <ol style={{ paddingLeft: '1rem', margin: 0 }}>
                        {[
                          'Enter your number above and enable the toggle',
                          'Save — your number is linked to your account',
                          'Your AI companion goes live at next 7am ET briefing',
                          'Reply to any message to interact immediately',
                        ].map((step, i) => (
                          <li key={i} className="caption-sm mb-1" style={{ color: '#717171' }}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Active confirmation */}
                  {waOptedIn && waPhone && (
                    <div className="flex items-center gap-3 p-3.5 rounded-xl"
                      style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: '#DCFCE7', border: '1px solid #86EFAC' }}>
                        <MessageCircle className="w-4 h-4" style={{ color: '#16A34A' }} />
                      </div>
                      <div>
                        <p className="label font-semibold" style={{ color: '#15803D' }}>Companion active</p>
                        <p className="caption-sm mt-0.5" style={{ color: '#9A9A9A' }}>Daily briefings → {waPhone}</p>
                      </div>
                    </div>
                  )}

                  {/* Error */}
                  {waError && (
                    <div className="flex items-center gap-2 p-3 rounded-xl"
                      style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: '#E8312A' }} />
                      <p className="caption-sm" style={{ color: '#B91C1C' }}>{waError}</p>
                    </div>
                  )}

                  {/* Save button */}
                  <button onClick={handleWaSave} disabled={waLoading}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl label font-semibold transition-all self-start"
                    style={{ background: waSaved ? '#15803D' : '#1A1A1A', color: 'white', opacity: waLoading ? 0.7 : 1 }}>
                    {waLoading
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                      : waSaved
                        ? <><CheckCircle2 className="w-4 h-4" /> Saved!</>
                        : <><Save className="w-4 h-4" /> Save WhatsApp Settings</>
                    }
                  </button>
                </div>
              )}
            </div>

            <button onClick={() => {/* notification prefs stored client-side for now */}}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl label font-semibold"
              style={{ background: '#1A1A1A', color: 'white' }}>
              <Save className="w-4 h-4" /> Save Preferences
            </button>
          </motion.div>
        )}

        {/* ── Security ──────────────────────────────────────────── */}
        {activeTab === 'Security' && (
          <motion.div key="security" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <SectionCard title="Change Password" subtitle="Use a strong, unique password for your account">
              <div className="space-y-4 max-w-sm">
                <div>
                  <label className="label-sm font-semibold uppercase tracking-wider block mb-2" style={{ color: '#9A9A9A' }}>Current Password</label>
                  <div className="relative">
                    <input type={showCurrentPw ? 'text' : 'password'} value={currentPw}
                      onChange={e => setCurrentPw(e.target.value)}
                      className={inputCls + ' pr-10'} style={inputStyle} placeholder="Enter current password"
                      onFocus={e => { e.target.style.borderColor = '#1A1A1A'; e.target.style.boxShadow = '0 0 0 3px rgba(26,26,26,0.07)' }}
                      onBlur={e => { e.target.style.borderColor = '#E5E4E0'; e.target.style.boxShadow = 'none' }} />
                    <button onClick={() => setShowCurrentPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#9A9A9A' }}>
                      {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="label-sm font-semibold uppercase tracking-wider block mb-2" style={{ color: '#9A9A9A' }}>New Password</label>
                  <div className="relative">
                    <input type={showNewPw ? 'text' : 'password'} value={newPw}
                      onChange={e => setNewPw(e.target.value)}
                      className={inputCls + ' pr-10'} style={inputStyle} placeholder="Min. 8 characters"
                      onFocus={e => { e.target.style.borderColor = '#1A1A1A'; e.target.style.boxShadow = '0 0 0 3px rgba(26,26,26,0.07)' }}
                      onBlur={e => { e.target.style.borderColor = '#E5E4E0'; e.target.style.boxShadow = 'none' }} />
                    <button onClick={() => setShowNewPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#9A9A9A' }}>
                      {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {newPw.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {[8, 12, 16].map(len => (
                        <div key={len} className="h-1 flex-1 rounded-full transition-all"
                          style={{ background: newPw.length >= len ? '#1A1A1A' : '#E5E4E0' }} />
                      ))}
                    </div>
                  )}
                </div>
                {pwError && (
                  <div className="px-4 py-2.5 rounded-xl body-sm" style={{ background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA' }}>
                    {pwError}
                  </div>
                )}
                <button onClick={handlePasswordSave} disabled={pwSaving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl label font-semibold disabled:opacity-60"
                  style={{ background: pwSaved ? '#15803D' : '#1A1A1A', color: 'white' }}>
                  {pwSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                    : pwSaved ? <><CheckCircle2 className="w-4 h-4" /> Password Updated!</>
                    : <><Lock className="w-4 h-4" /> Update Password</>}
                </button>
              </div>
            </SectionCard>

            <SectionCard title="Session & Security Status">
              <div className="space-y-3">
                <div className="flex items-center gap-4 p-4 rounded-xl"
                  style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: '#DCFCE7', border: '1px solid #86EFAC' }}>
                    <Shield className="w-4 h-4" style={{ color: '#16A34A' }} />
                  </div>
                  <div className="flex-1">
                    <p className="label font-semibold" style={{ color: '#15803D' }}>Account Secured</p>
                    <p className="caption-sm mt-0.5" style={{ color: '#9A9A9A' }}>JWT session · 30-day expiry · HTTPS encrypted</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: '#16A34A' }} />
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl"
                  style={{ background: '#FAFAFA', border: '1px solid #E5E4E0' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: '#F7F6F4', border: '1px solid #E5E4E0' }}>
                    <Fingerprint className="w-4 h-4" style={{ color: '#9A9A9A' }} />
                  </div>
                  <div className="flex-1">
                    <p className="label font-medium" style={{ color: '#1A1A1A' }}>Two-Factor Authentication</p>
                    <p className="caption-sm mt-0.5" style={{ color: '#9A9A9A' }}>Add an extra layer of security — coming soon</p>
                  </div>
                  <span className="label-sm font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: '#F7F6F4', color: '#9A9A9A', border: '1px solid #E5E4E0' }}>Soon</span>
                </div>
              </div>
            </SectionCard>
          </motion.div>
        )}

        {/* ── Billing ───────────────────────────────────────────── */}
        {activeTab === 'Billing' && (
          <motion.div key="billing" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            {(() => {
              const plan = (session?.user as any)?.subscriptionPlan ?? 'starter'
              const planMeta: Record<string, { name: string; desc: string; features: string[] }> = {
                starter:    { name: 'Starter',    desc: 'CSE, OTC · Up to 5 members',               features: ['Full IPO checklist', 'PACE™ tracking', '5 team seats', 'Document vault (5 GB)'] },
                growth:     { name: 'Growth',     desc: 'TSX, TSXV, CSE, OTC · Up to 15 members',   features: ['180+ milestones', 'WhatsApp AI Companion', 'Cap table', '15 team seats'] },
                enterprise: { name: 'Enterprise', desc: 'All 7 exchanges · Unlimited members',       features: ['All Growth features', 'NASDAQ/NYSE support', 'Dedicated coordinator', 'Unlimited team'] },
              }
              const meta = planMeta[plan] ?? planMeta.starter
              return (
                <>
                  <div className="rounded-2xl overflow-hidden" style={{ background: '#1A1A1A' }}>
                    <div className="px-6 pt-6 pb-5">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="label-sm font-semibold uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Current Plan</p>
                          <h2 className="text-2xl font-black text-white">{meta.name}</h2>
                          <p className="body-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{meta.desc}</p>
                        </div>
                        <span className="label-sm px-3 py-1.5 rounded-full font-semibold flex items-center gap-1.5"
                          style={{ background: 'rgba(34,197,94,0.15)', color: '#4ADE80', border: '1px solid rgba(34,197,94,0.25)' }}>
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#22C55E' }} />
                          Active
                        </span>
                      </div>
                    </div>
                    <div className="px-6 pb-5 flex gap-2 flex-wrap" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.25rem' }}>
                      {meta.features.map(f => (
                        <span key={f} className="caption-sm px-2.5 py-1 rounded-full"
                          style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  <SectionCard title="Payment & Invoices">
                    <div className="space-y-3">
                      <p className="body-sm" style={{ color: '#717171' }}>
                        Manage your payment method, download invoices, and update your billing address through the Stripe billing portal.
                        Taxes (GST/HST for Canada, applicable US state sales tax) are calculated automatically at checkout.
                      </p>
                      <button
                        onClick={openBillingPortal}
                        disabled={portalLoading}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl label font-semibold transition-colors disabled:opacity-50"
                        style={{ background: '#1A1A1A', color: '#fff' }}
                        onMouseEnter={e => { if (!portalLoading) (e.currentTarget as HTMLButtonElement).style.background = '#333' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#1A1A1A' }}>
                        {portalLoading
                          ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" /> Opening…</>
                          : <><CreditCard className="w-4 h-4" /> Manage billing &amp; invoices</>}
                      </button>
                    </div>
                  </SectionCard>

                  {plan === 'starter' && (
                    <div className="rounded-2xl p-5" style={{ background: '#F7F6F4', border: '1px solid #E5E4E0' }}>
                      <p className="label font-semibold" style={{ color: '#1A1A1A', marginBottom: '0.25rem' }}>Unlock more with Growth</p>
                      <p className="caption-sm" style={{ color: '#9A9A9A', marginBottom: '1rem' }}>
                        WhatsApp AI Companion, TSX/TSXV support, 15 team seats, and priority support.
                      </p>
                      <button
                        onClick={() => handleUpgrade('growth')}
                        disabled={checkoutLoading}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl label font-semibold transition-colors disabled:opacity-50"
                        style={{ background: '#E8312A', color: '#fff' }}
                        onMouseEnter={e => { if (!checkoutLoading) (e.currentTarget as HTMLButtonElement).style.background = '#C4261F' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#E8312A' }}>
                        {checkoutLoading
                          ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" /> Loading…</>
                          : <>Upgrade to Growth →</>}
                      </button>
                    </div>
                  )}
                </>
              )
            })()}
          </motion.div>
        )}

        {/* ── Company ───────────────────────────────────────────── */}
        {activeTab === 'Company' && (
          <motion.div key="company" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <SectionCard title="Company Details" subtitle="Your listing configuration — contact support to change exchange or listing type">
              {company ? (
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { label: 'Company Name',    value: company.name,                                  icon: Building2 },
                    { label: 'Target Exchange', value: EXCHANGE_LABELS[company.targetExchange],       icon: Globe },
                    { label: 'Listing Type',    value: company.listingType.toUpperCase(),             icon: Sparkles },
                    { label: 'Current Phase',   value: company.currentPhase.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()), icon: ChevronRight },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="flex items-start gap-3 p-4 rounded-xl"
                      style={{ background: '#F7F6F4', border: '1px solid #E5E4E0' }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: 'white', border: '1px solid #E5E4E0' }}>
                        <Icon className="w-4 h-4" style={{ color: '#9A9A9A' }} />
                      </div>
                      <div>
                        <p className="caption-sm mb-0.5" style={{ color: '#9A9A9A' }}>{label}</p>
                        <p className="font-semibold body-sm" style={{ color: '#1A1A1A' }}>{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 rounded-xl"
                  style={{ background: '#F7F6F4', border: '1px solid #E5E4E0' }}>
                  <AlertTriangle className="w-4 h-4" style={{ color: '#9A9A9A' }} />
                  <p className="body-sm" style={{ color: '#717171' }}>No company linked to this account.</p>
                </div>
              )}
              <div className="mt-4 flex items-start gap-2.5 p-3.5 rounded-xl"
                style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
                <Zap className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#B45309' }} />
                <p className="caption-sm leading-relaxed" style={{ color: '#B45309' }}>
                  Changing your target exchange or listing type resets your entire checklist and PACE calculations.
                  Contact <strong>support@ipoready.com</strong> to request a change.
                </p>
              </div>
            </SectionCard>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
