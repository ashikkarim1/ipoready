'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Mail, Bell, X, Trash2, Pencil, Check, Shield, ChevronDown, Users, Loader2, AlertCircle } from 'lucide-react'
import { ROLE_LABELS } from '@/lib/utils'
import { UserRole, NotificationFrequency } from '@/types'

// ─── Access Level System ──────────────────────────────────────────────────────

type AccessLevel = 'admin' | 'manager' | 'reviewer' | 'viewer'

const ACCESS_COLORS: Record<AccessLevel, { color: string; bg: string; border: string; label: string }> = {
  admin:    { color: '#DC2626', bg: '#FEE2E2', border: '#FECACA', label: 'Admin' },
  manager:  { color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE', label: 'Manager' },
  reviewer: { color: '#1D4ED8', bg: '#DBEAFE', border: '#BFDBFE', label: 'Reviewer' },
  viewer:   { color: '#717171', bg: '#F7F6F4', border: '#E5E4E0', label: 'Viewer' },
}

const ACCESS_DESCRIPTIONS: Record<AccessLevel, string> = {
  admin:    'Full access + team management. Can add/remove members and change roles.',
  manager:  'Document & task management. Cannot change team settings.',
  reviewer: 'Review & approve documents. Read access to financials.',
  viewer:   'Read-only access across the entire workspace.',
}

const ACCESS_PERMISSION_CHIPS: Record<AccessLevel, string[]> = {
  admin:    ['View all', 'Edit tasks', 'Upload docs', 'Approve docs', 'Submit filings', 'View financials', 'Manage team'],
  manager:  ['View all', 'Edit tasks', 'Upload docs', 'Approve docs', 'Submit filings', 'View financials'],
  reviewer: ['View all', 'Approve docs', 'View financials'],
  viewer:   ['View all'],
}

// Permission matrix rows
type PermRow = { label: string; admin: boolean; manager: boolean; reviewer: boolean; viewer: boolean }
const PERM_MATRIX: PermRow[] = [
  { label: 'View all content',           admin: true,  manager: true,  reviewer: true,  viewer: true  },
  { label: 'Edit tasks & checklist',     admin: true,  manager: true,  reviewer: false, viewer: false },
  { label: 'Upload documents',           admin: true,  manager: true,  reviewer: false, viewer: false },
  { label: 'Review & approve documents', admin: true,  manager: true,  reviewer: true,  viewer: false },
  { label: 'Submit regulatory filings',  admin: true,  manager: true,  reviewer: false, viewer: false },
  { label: 'View financial data',        admin: true,  manager: true,  reviewer: true,  viewer: false },
  { label: 'Add / remove team members',  admin: true,  manager: false, reviewer: false, viewer: false },
  { label: 'Change member roles',        admin: true,  manager: false, reviewer: false, viewer: false },
]

// ─── Team Data ────────────────────────────────────────────────────────────────

interface TeamMemberUI {
  id: string
  name: string
  email: string
  accessLevel: AccessLevel
  jobTitle: UserRole
  notificationFrequency: NotificationFrequency
  status: 'active' | 'pending'
  initials: string
  joinedAt?: string
}

const NOTIFICATION_OPTIONS: { value: NotificationFrequency; label: string }[] = [
  { value: 'daily',          label: 'Daily' },
  { value: 'weekly',         label: 'Weekly' },
  { value: 'milestone_only', label: 'Milestones only' },
  { value: 'none',           label: 'None' },
]

const NOTIFICATION_LABELS: Record<NotificationFrequency, string> = {
  daily:          'Daily digest',
  weekly:         'Weekly summary',
  milestone_only: 'Milestones only',
  none:           'None',
}

// Short job title (strip parenthetical)
function shortTitle(role: UserRole): string {
  return ROLE_LABELS[role].replace(/ \(.*\)/, '')
}

// ─── Access Level Dropdown (inline) ──────────────────────────────────────────

function AccessDropdown({
  value,
  onChange,
  onClose,
}: {
  value: AccessLevel
  onChange: (v: AccessLevel) => void
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        right: 0,
        top: '110%',
        zIndex: 50,
        background: 'white',
        border: '1px solid #E5E4E0',
        borderRadius: '0.75rem',
        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
        minWidth: '170px',
        overflow: 'hidden',
      }}
    >
      {(Object.keys(ACCESS_COLORS) as AccessLevel[]).map((level) => {
        const c = ACCESS_COLORS[level]
        const active = value === level
        return (
          <button
            key={level}
            onClick={() => { onChange(level); onClose() }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              width: '100%',
              padding: '0.5rem 0.75rem',
              background: active ? c.bg : 'white',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background 0.1s',
            }}
          >
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: c.color, flexShrink: 0,
            }} />
            <span style={{ fontSize: '0.8125rem', fontWeight: active ? 600 : 400, color: active ? c.color : '#1A1A1A', flex: 1 }}>
              {c.label}
            </span>
            {active && <Check style={{ width: 14, height: 14, color: c.color }} />}
          </button>
        )
      })}
    </div>
  )
}

// ─── Permission Matrix ────────────────────────────────────────────────────────

function PermissionMatrix() {
  const cols: AccessLevel[] = ['admin', 'manager', 'reviewer', 'viewer']

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.05 }}
      style={{
        background: 'white',
        border: '1px solid #E5E4E0',
        borderRadius: '1rem',
        overflow: 'hidden',
      }}
    >
      {/* Card header */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E5E4E0', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
        <Shield style={{ width: 16, height: 16, color: '#E8312A', flexShrink: 0 }} />
        <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#1A1A1A' }}>Access Level Permissions</span>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F7F6F4' }}>
              <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 600, fontSize: '0.8125rem', color: '#717171', borderBottom: '1px solid #E5E4E0', width: '40%' }}>
                Permission
              </th>
              {cols.map((level) => {
                const c = ACCESS_COLORS[level]
                return (
                  <th key={level} style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, fontSize: '0.8125rem', borderBottom: '1px solid #E5E4E0', minWidth: 100 }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '999px',
                      background: c.bg,
                      color: c.color,
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      border: `1px solid ${c.border}`,
                    }}>
                      {c.label}
                    </span>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {PERM_MATRIX.map((row, i) => (
              <tr
                key={row.label}
                style={{ background: i % 2 === 0 ? 'white' : '#FAFAFA' }}
              >
                <td style={{ padding: '0.75rem 1.5rem', fontSize: '0.8125rem', color: '#1A1A1A', borderBottom: i < PERM_MATRIX.length - 1 ? '1px solid #F0EFED' : 'none', fontWeight: 500 }}>
                  {row.label}
                </td>
                {cols.map((level) => {
                  const has = row[level]
                  return (
                    <td key={level} style={{ padding: '0.75rem 1rem', textAlign: 'center', borderBottom: i < PERM_MATRIX.length - 1 ? '1px solid #F0EFED' : 'none' }}>
                      {has
                        ? <Check style={{ width: 16, height: 16, color: '#16A34A', margin: '0 auto', strokeWidth: 2.5 }} />
                        : <span style={{ color: '#D1D0CC', fontSize: '0.875rem', fontWeight: 500 }}>–</span>
                      }
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}

// ─── Invite Modal ─────────────────────────────────────────────────────────────

function InviteModal({
  onClose,
  onInvited,
}: {
  onClose: () => void
  onInvited: (member: TeamMemberUI) => void
}) {
  const [email, setEmail]             = useState('')
  const [accessLevel, setAccessLevel] = useState<AccessLevel | null>(null)
  const [jobTitle, setJobTitle]       = useState<UserRole>('read_only')
  const [freq, setFreq]               = useState<NotificationFrequency>('weekly')
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState<string | null>(null)

  const jobTitleOptions = (Object.keys(ROLE_LABELS) as UserRole[]).filter(r => r !== 'system_admin')

  async function handleSend() {
    if (!email || !accessLevel) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          accessLevel,
          jobTitle,
          notificationFrequency: freq,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Failed to send invite')
        return
      }
      onInvited(data.member as TeamMemberUI)
      onClose()
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        background: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(2px)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 12 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        style={{
          background: 'white',
          border: '1px solid #E5E4E0',
          borderRadius: '1.25rem',
          width: '100%',
          maxWidth: '30rem',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
        }}
      >
        {/* Modal header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #E5E4E0',
          position: 'sticky', top: 0, background: 'white', zIndex: 1,
          borderRadius: '1.25rem 1.25rem 0 0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users style={{ width: 18, height: 18, color: '#1A1A1A' }} />
            <span style={{ fontWeight: 700, fontSize: '1rem', color: '#1A1A1A' }}>Invite Team Member</span>
          </div>
          <button
            onClick={onClose}
            style={{ background: '#F7F6F4', border: 'none', borderRadius: '0.5rem', padding: '0.375rem', cursor: 'pointer', display: 'flex', color: '#717171' }}
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Modal body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Error banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.625rem 0.875rem',
                borderRadius: '0.625rem',
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#DC2626',
                fontSize: '0.8125rem',
                fontWeight: 500,
              }}
            >
              <AlertCircle style={{ width: 15, height: 15, flexShrink: 0 }} />
              {error}
            </motion.div>
          )}

          {/* Email */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#1A1A1A', marginBottom: '0.375rem' }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="colleague@company.com"
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '0.625rem 0.875rem',
                border: '1px solid #E5E4E0',
                borderRadius: '0.625rem',
                fontSize: '0.875rem',
                color: '#1A1A1A',
                background: '#FAFAFA',
                outline: 'none',
              }}
            />
          </div>

          {/* Access Level cards */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#1A1A1A', marginBottom: '0.5rem' }}>
              Access Level <span style={{ color: '#E8312A' }}>*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
              {(Object.keys(ACCESS_COLORS) as AccessLevel[]).map((level) => {
                const c = ACCESS_COLORS[level]
                const selected = accessLevel === level
                const chipCount = ACCESS_PERMISSION_CHIPS[level].length
                return (
                  <button
                    key={level}
                    onClick={() => setAccessLevel(level)}
                    style={{
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: '0.25rem',
                      padding: '0.75rem 0.875rem',
                      border: selected ? `2px solid ${c.color}` : `1.5px solid ${c.border}`,
                      borderLeft: selected ? `4px solid ${c.color}` : `4px solid ${c.color}`,
                      borderRadius: '0.75rem',
                      background: selected ? c.bg : 'white',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                      boxShadow: selected ? `0 0 0 2px ${c.border}` : 'none',
                    }}
                  >
                    {selected && (
                      <span style={{
                        position: 'absolute', top: '0.5rem', right: '0.5rem',
                        width: 18, height: 18, borderRadius: '50%',
                        background: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Check style={{ width: 10, height: 10, color: 'white', strokeWidth: 3 }} />
                      </span>
                    )}
                    <span style={{ fontWeight: 700, fontSize: '0.8125rem', color: c.color }}>{c.label}</span>
                    <span style={{ fontSize: '0.6875rem', color: '#717171', lineHeight: 1.4 }}>{ACCESS_DESCRIPTIONS[level]}</span>
                    <span style={{ fontSize: '0.625rem', color: c.color, fontWeight: 600, marginTop: '0.125rem' }}>
                      {chipCount} permission{chipCount !== 1 ? 's' : ''}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Job Title */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#1A1A1A', marginBottom: '0.375rem' }}>
              Job Title <span style={{ fontSize: '0.75rem', color: '#9A9A9A', fontWeight: 400 }}>optional context</span>
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={jobTitle}
                onChange={e => setJobTitle(e.target.value as UserRole)}
                style={{
                  width: '100%', appearance: 'none',
                  padding: '0.625rem 2.25rem 0.625rem 0.875rem',
                  border: '1px solid #E5E4E0',
                  borderRadius: '0.625rem',
                  fontSize: '0.875rem',
                  color: '#1A1A1A',
                  background: 'white',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                {jobTitleOptions.map(role => (
                  <option key={role} value={role}>{ROLE_LABELS[role]}</option>
                ))}
              </select>
              <ChevronDown style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#9A9A9A', pointerEvents: 'none' }} />
            </div>
          </div>

          {/* Notification frequency */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#1A1A1A', marginBottom: '0.5rem' }}>
              Notification Frequency
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {NOTIFICATION_OPTIONS.map(({ value, label }) => {
                const active = freq === value
                return (
                  <button
                    key={value}
                    onClick={() => setFreq(value)}
                    style={{
                      padding: '0.375rem 0.75rem',
                      borderRadius: '999px',
                      fontSize: '0.8125rem',
                      fontWeight: active ? 600 : 400,
                      border: active ? '1.5px solid #1A1A1A' : '1.5px solid #E5E4E0',
                      background: active ? '#1A1A1A' : 'white',
                      color: active ? 'white' : '#717171',
                      cursor: 'pointer',
                      transition: 'all 0.12s ease',
                    }}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Permission chips preview */}
          {accessLevel && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '0.75rem',
                background: ACCESS_COLORS[accessLevel].bg,
                border: `1px solid ${ACCESS_COLORS[accessLevel].border}`,
              }}
            >
              <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: ACCESS_COLORS[accessLevel].color, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Included permissions
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                {ACCESS_PERMISSION_CHIPS[accessLevel].map(chip => (
                  <span key={chip} style={{
                    padding: '0.25rem 0.625rem',
                    borderRadius: '999px',
                    fontSize: '0.6875rem',
                    fontWeight: 500,
                    background: 'white',
                    border: `1px solid ${ACCESS_COLORS[accessLevel].border}`,
                    color: ACCESS_COLORS[accessLevel].color,
                  }}>
                    {chip}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.25rem' }}>
            <button
              onClick={onClose}
              disabled={loading}
              style={{
                flex: 1, padding: '0.625rem',
                borderRadius: '0.75rem',
                fontSize: '0.875rem', fontWeight: 600,
                background: '#F7F6F4', border: '1px solid #E5E4E0',
                color: '#1A1A1A', cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={!email || !accessLevel || loading}
              style={{
                flex: 1, padding: '0.625rem',
                borderRadius: '0.75rem',
                fontSize: '0.875rem', fontWeight: 600,
                background: (!email || !accessLevel || loading) ? '#D1D0CC' : '#1A1A1A',
                border: 'none',
                color: 'white',
                cursor: (!email || !accessLevel || loading) ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                transition: 'background 0.15s',
              }}
            >
              {loading
                ? <Loader2 style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} />
                : <Mail style={{ width: 15, height: 15 }} />
              }
              {loading ? 'Sending…' : 'Send Invite →'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Member Row ───────────────────────────────────────────────────────────────

function MemberRow({
  member,
  index,
  onRemove,
  onChangeAccess,
  removing,
}: {
  member: TeamMemberUI
  index: number
  onRemove: (id: string) => void
  onChangeAccess: (id: string, level: AccessLevel) => void
  removing: boolean
}) {
  const [editingAccess, setEditingAccess] = useState(false)
  const accessC = ACCESS_COLORS[member.accessLevel]
  const isPending = member.status === 'pending'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: removing ? 0 : 1, x: removing ? -20 : 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25, delay: removing ? 0 : index * 0.045 }}
      className="group"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '0.875rem 1.125rem',
        background: isPending ? '#FAFAFA' : 'white',
        border: isPending ? '1px dashed #D1D0CC' : '1px solid #E5E4E0',
        borderRadius: '1rem',
        position: 'relative',
        transition: 'box-shadow 0.15s ease',
        opacity: removing ? 0.5 : 1,
      }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
    >
      {/* Avatar */}
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize: '0.8125rem', flexShrink: 0,
        background: isPending ? '#F0EFED' : '#1A1A1A',
        color: isPending ? '#9A9A9A' : 'white',
      }}>
        {isPending ? <Mail style={{ width: 16, height: 16 }} /> : member.initials}
      </div>

      {/* Name + email */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.125rem' }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {isPending ? member.email : member.name}
          </p>
          {isPending && (
            <span style={{
              fontSize: '0.6875rem', padding: '0.125rem 0.5rem', borderRadius: '999px',
              fontWeight: 600, background: '#FFEDD5', color: '#C2410C', flexShrink: 0,
            }}>
              Pending
            </span>
          )}
        </div>
        {!isPending && (
          <p style={{ fontSize: '0.75rem', color: '#9A9A9A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {member.email}
          </p>
        )}
      </div>

      {/* Access Level chip + edit dropdown */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
          padding: '0.3rem 0.75rem',
          borderRadius: '999px',
          fontSize: '0.75rem', fontWeight: 700,
          background: accessC.bg, color: accessC.color,
          border: `1px solid ${accessC.border}`,
        }}>
          {accessC.label}
        </span>
        {editingAccess && (
          <AccessDropdown
            value={member.accessLevel}
            onChange={(level) => onChangeAccess(member.id, level)}
            onClose={() => setEditingAccess(false)}
          />
        )}
      </div>

      {/* Job title chip */}
      <span style={{
        display: 'inline-block',
        padding: '0.25rem 0.625rem',
        borderRadius: '999px',
        fontSize: '0.6875rem', fontWeight: 500,
        background: '#F7F6F4', color: '#717171',
        border: '1px solid #E5E4E0',
        flexShrink: 0,
        maxWidth: 130,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {shortTitle(member.jobTitle)}
      </span>

      {/* Notification */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
        <Bell style={{ width: 13, height: 13, color: '#C4C3BF' }} />
        <span style={{ fontSize: '0.6875rem', color: '#B3B3B3', whiteSpace: 'nowrap' }}>
          {NOTIFICATION_LABELS[member.notificationFrequency]}
        </span>
      </div>

      {/* Edit + Delete (appear on hover) */}
      <div
        className="action-buttons"
        style={{
          display: 'flex', alignItems: 'center', gap: '0.25rem',
          opacity: 0,
          transition: 'opacity 0.15s ease',
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => setEditingAccess(v => !v)}
          title="Change access level"
          style={{
            width: 30, height: 30, borderRadius: '0.5rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#F7F6F4', border: '1px solid #E5E4E0',
            cursor: 'pointer', color: '#717171',
            transition: 'background 0.12s',
          }}
        >
          <Pencil style={{ width: 13, height: 13 }} />
        </button>
        <button
          onClick={() => onRemove(member.id)}
          disabled={removing}
          title="Remove member"
          style={{
            width: 30, height: 30, borderRadius: '0.5rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#FEF2F2', border: '1px solid #FECACA',
            cursor: removing ? 'not-allowed' : 'pointer', color: '#DC2626',
            transition: 'background 0.12s',
          }}
        >
          <Trash2 style={{ width: 13, height: 13 }} />
        </button>
      </div>

      {/* CSS-powered hover */}
      <style>{`
        .group:hover .action-buttons { opacity: 1 !important; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TeamPage() {
  const [team, setTeam]             = useState<TeamMemberUI[]>([])
  const [loading, setLoading]       = useState(true)
  const [loadError, setLoadError]   = useState<string | null>(null)
  const [showInvite, setShowInvite] = useState(false)
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set())
  const [actionError, setActionError] = useState<string | null>(null)

  // ── Load members on mount ──────────────────────────────────────────────────
  const loadMembers = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const res = await fetch('/api/team/members')
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setLoadError(d.error ?? 'Failed to load team members')
        return
      }
      const data = await res.json()
      setTeam(data.members ?? [])
    } catch {
      setLoadError('Network error — could not load team members')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadMembers() }, [loadMembers])

  // ── Remove member ──────────────────────────────────────────────────────────
  async function removeMember(id: string) {
    setActionError(null)
    setRemovingIds(prev => new Set(prev).add(id))
    try {
      const res = await fetch(`/api/team/members/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) {
        setActionError(data.error ?? 'Failed to remove member')
        setRemovingIds(prev => { const s = new Set(prev); s.delete(id); return s })
        return
      }
      setTeam(prev => prev.filter(m => m.id !== id))
    } catch {
      setActionError('Network error — could not remove member')
      setRemovingIds(prev => { const s = new Set(prev); s.delete(id); return s })
    }
  }

  // ── Change access level ────────────────────────────────────────────────────
  async function changeAccess(id: string, level: AccessLevel) {
    setActionError(null)
    // Optimistic update
    setTeam(prev => prev.map(m => m.id === id ? { ...m, accessLevel: level } : m))
    try {
      const res = await fetch(`/api/team/members/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessLevel: level }),
      })
      if (!res.ok) {
        const data = await res.json()
        setActionError(data.error ?? 'Failed to update role')
        // Revert on failure
        await loadMembers()
      }
    } catch {
      setActionError('Network error — could not update role')
      await loadMembers()
    }
  }

  // ── Invite success ─────────────────────────────────────────────────────────
  function handleInvited(member: TeamMemberUI) {
    setTeam(prev => [...prev, member])
  }

  const activeCount = team.filter(m => m.status === 'active').length
  const totalCount  = team.length

  return (
    <div style={{ maxWidth: '56rem', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}
      >
        <div>
          <h1 style={{ fontWeight: 900, fontSize: '1.875rem', color: '#1A1A1A', lineHeight: 1.1, marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>
            Team &amp; Roles
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#9A9A9A' }}>
            {loading
              ? 'Loading…'
              : `${activeCount} active member${activeCount !== 1 ? 's' : ''}${totalCount > activeCount ? ` · ${totalCount - activeCount} pending` : ''}`
            }
          </p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.375rem',
            padding: '0.5rem 1rem',
            borderRadius: '0.75rem',
            fontSize: '0.875rem', fontWeight: 600,
            background: '#1A1A1A', color: 'white',
            border: 'none', cursor: 'pointer',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          <Plus style={{ width: 15, height: 15 }} />
          Invite Member
        </button>
      </motion.div>

      {/* ── Permission Matrix ── */}
      <PermissionMatrix />

      {/* ── Action error banner ── */}
      <AnimatePresence>
        {actionError && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              borderRadius: '0.75rem',
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#DC2626',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
              {actionError}
            </div>
            <button
              onClick={() => setActionError(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', padding: '0.125rem' }}
            >
              <X style={{ width: 14, height: 14 }} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Team List ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#1A1A1A' }}>
            Team Members
          </p>
          <span style={{ fontSize: '0.75rem', color: '#9A9A9A' }}>{loading ? '…' : `${totalCount} total`}</span>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                height: 64,
                borderRadius: '1rem',
                background: 'linear-gradient(90deg, #F0EFED 25%, #E8E7E4 50%, #F0EFED 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.4s ease-in-out infinite',
                border: '1px solid #E5E4E0',
              }} />
            ))}
            <style>{`
              @keyframes shimmer {
                0%   { background-position: 200% 0; }
                100% { background-position: -200% 0; }
              }
            `}</style>
          </div>
        )}

        {/* Load error */}
        {!loading && loadError && (
          <div style={{
            padding: '1.5rem',
            border: '1px solid #FECACA',
            borderRadius: '1rem',
            background: '#FEF2F2',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            color: '#DC2626', fontSize: '0.875rem',
          }}>
            <AlertCircle style={{ width: 18, height: 18, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>{loadError}</div>
            <button
              onClick={loadMembers}
              style={{
                padding: '0.375rem 0.875rem',
                borderRadius: '0.5rem',
                fontSize: '0.8125rem', fontWeight: 600,
                background: '#DC2626', color: 'white',
                border: 'none', cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Member list */}
        {!loading && !loadError && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <AnimatePresence>
              {team.map((member, i) => (
                <MemberRow
                  key={member.id}
                  member={member}
                  index={i}
                  onRemove={removeMember}
                  onChangeAccess={changeAccess}
                  removing={removingIds.has(member.id)}
                />
              ))}
            </AnimatePresence>

            {team.length === 0 && (
              <div style={{
                padding: '3rem', textAlign: 'center',
                border: '1px dashed #D1D0CC', borderRadius: '1rem',
                color: '#9A9A9A', fontSize: '0.875rem',
              }}>
                No team members yet. Invite your first colleague.
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* ── Invite Modal ── */}
      <AnimatePresence>
        {showInvite && (
          <InviteModal
            onClose={() => setShowInvite(false)}
            onInvited={handleInvited}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
