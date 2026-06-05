'use client'

import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Briefcase,
  ShieldCheck,
  Scale,
  Building2,
  Plus,
  X,
  Check,
  AlertCircle,
  ChevronDown,
  Trash2,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Palette                                                            */
/* ------------------------------------------------------------------ */
const RED = '#E8312A'
const RED_BG = '#FDECEB'
const GREEN = '#2D7A5F'
const GREEN_BG = '#EAF5F0'
const GRAY = '#9CA3AF'
const BORDER = '#E5E4E0'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface Person {
  id: string
  name: string
  position: string // the slot/role this person fills
  company?: string
  email?: string
  linkedIn?: string
}

interface Slot {
  // A specific required position (used by officer / committee / advisor groups)
  position: string
  filledBy?: string // person id
}

type GroupKind = 'count' | 'slots'

interface Group {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  kind: GroupKind
  // For "count" groups (e.g. Board Members) — a minimum headcount.
  requiredCount?: number
  // For "slots" groups — explicit named positions.
  slots?: Slot[]
  // People currently assigned to this group.
  members: Person[]
  // Position options surfaced in the quick-add dropdown.
  positionOptions: string[]
}

/* ------------------------------------------------------------------ */
/*  Seed data                                                          */
/* ------------------------------------------------------------------ */
function seedGroups(): Group[] {
  return [
    {
      id: 'board',
      name: 'Board Members',
      icon: <Users className="w-5 h-5" />,
      description: 'Required fields: Name, Title (Independent / Non-Independent), Occupation, Education',
      kind: 'count',
      requiredCount: 5,
      members: [
        { id: 'b1', name: 'Jennifer Wong', position: 'Chair (Non-Independent)', company: 'CEO, Acme Corp' },
        { id: 'b2', name: 'Sarah Chen', position: 'Independent Director', company: 'Former CFO, Beta Inc' },
        { id: 'b3', name: 'David Okafor', position: 'Independent Director', company: 'Partner, Vista Capital' },
      ],
      positionOptions: [
        'Chair (Non-Independent)',
        'Chair (Independent)',
        'Independent Director',
        'Non-Independent Director',
      ],
    },
    {
      id: 'officers',
      name: 'Key Officers',
      icon: <Briefcase className="w-5 h-5" />,
      description: 'Executive leadership required for listing readiness',
      kind: 'slots',
      slots: [
        { position: 'Chief Executive Officer (CEO)' },
        { position: 'Chief Financial Officer (CFO)' },
        { position: 'Chief Operating Officer (COO)' },
        { position: 'General Counsel' },
      ],
      members: [
        { id: 'o1', name: 'Jennifer Wong', position: 'Chief Executive Officer (CEO)' },
        { id: 'o2', name: 'Marcus Lee', position: 'Chief Operating Officer (COO)' },
      ],
      positionOptions: [
        'Chief Executive Officer (CEO)',
        'Chief Financial Officer (CFO)',
        'Chief Operating Officer (COO)',
        'General Counsel',
      ],
    },
    {
      id: 'audit',
      name: 'Audit Committee',
      icon: <ShieldCheck className="w-5 h-5" />,
      description: 'Required under NI 52-110',
      kind: 'slots',
      slots: [
        { position: 'Audit Committee Chair' },
        { position: 'Audit Committee Member' },
        { position: 'Audit Committee Member' },
      ],
      members: [
        { id: 'a1', name: 'Sarah Chen', position: 'Audit Committee Chair' },
      ],
      positionOptions: ['Audit Committee Chair', 'Audit Committee Member'],
    },
    {
      id: 'comp',
      name: 'Compensation Committee',
      icon: <Scale className="w-5 h-5" />,
      description: 'Governance best practice for listed issuers',
      kind: 'slots',
      slots: [
        { position: 'Compensation Committee Chair' },
        { position: 'Compensation Committee Member' },
        { position: 'Compensation Committee Member' },
      ],
      members: [
        { id: 'c1', name: 'David Okafor', position: 'Compensation Committee Chair' },
        { id: 'c2', name: 'Sarah Chen', position: 'Compensation Committee Member' },
      ],
      positionOptions: ['Compensation Committee Chair', 'Compensation Committee Member'],
    },
    {
      id: 'advisors',
      name: 'External Advisors',
      icon: <Building2 className="w-5 h-5" />,
      description: 'Firm + partner name required for each engagement',
      kind: 'slots',
      slots: [
        { position: 'Lead Auditor (Big 4)' },
        { position: 'Legal Counsel' },
      ],
      members: [],
      positionOptions: ['Lead Auditor (Big 4)', 'Legal Counsel'],
    },
  ]
}

/* ------------------------------------------------------------------ */
/*  Gap math                                                           */
/* ------------------------------------------------------------------ */
function groupStats(group: Group) {
  if (group.kind === 'count') {
    const required = group.requiredCount ?? 0
    const current = group.members.length
    const gaps = Math.max(0, required - current)
    return { required, current, gaps }
  }
  // slots
  const slots = group.slots ?? []
  const required = slots.length
  // A slot is filled if a member exists for that position. Match positions
  // to slots sequentially so duplicate positions (e.g. two members) each count.
  const remaining = [...group.members]
  let current = 0
  for (const slot of slots) {
    const idx = remaining.findIndex((m) => m.position === slot.position)
    if (idx !== -1) {
      current += 1
      remaining.splice(idx, 1)
    }
  }
  const gaps = Math.max(0, required - current)
  return { required, current, gaps }
}

// Returns the rendered rows for a slots group: every slot, filled or missing.
function slotRows(group: Group) {
  const remaining = [...group.members]
  return (group.slots ?? []).map((slot, i) => {
    const idx = remaining.findIndex((m) => m.position === slot.position)
    let person: Person | undefined
    if (idx !== -1) {
      person = remaining[idx]
      remaining.splice(idx, 1)
    }
    return { key: `${slot.position}-${i}`, position: slot.position, person }
  })
}

/* ------------------------------------------------------------------ */
/*  Quick-add inline form                                             */
/* ------------------------------------------------------------------ */
function QuickAddForm({
  group,
  presetPosition,
  onSave,
  onCancel,
}: {
  group: Group
  presetPosition?: string
  onSave: (p: Omit<Person, 'id'>) => void
  onCancel: () => void
}) {
  const [position, setPosition] = useState(presetPosition ?? group.positionOptions[0] ?? '')
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [linkedIn, setLinkedIn] = useState('')

  const canSave = name.trim().length > 0 && position.trim().length > 0

  const inputStyle: React.CSSProperties = {
    borderColor: BORDER,
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.22 }}
      className="overflow-hidden"
    >
      <div
        className="rounded-xl p-4 mt-3"
        style={{ background: '#F7F6F4', border: `1px solid ${BORDER}` }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#717171' }}>
            Add to {group.name}
          </span>
          <button onClick={onCancel} className="p-1 rounded hover:bg-black/5 transition-colors" aria-label="Close form">
            <X className="w-4 h-4" style={{ color: '#717171' }} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold mb-1.5 text-nav">Position</label>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none text-nav bg-white"
              style={inputStyle}
            >
              {group.positionOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-nav">Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full legal name"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none bg-white"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-nav">
              {group.id === 'advisors' ? 'Firm' : 'Company / Occupation'}
            </label>
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder={group.id === 'advisors' ? 'e.g., Deloitte LLP' : 'e.g., CFO, Beta Inc'}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none bg-white"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-nav">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none bg-white"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-nav">
              LinkedIn <span className="font-normal" style={{ color: '#9CA3AF' }}>(optional)</span>
            </label>
            <input
              type="url"
              value={linkedIn}
              onChange={(e) => setLinkedIn(e.target.value)}
              placeholder="linkedin.com/in/…"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none bg-white"
              style={inputStyle}
            />
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => canSave && onSave({ name: name.trim(), position, company, email, linkedIn })}
            disabled={!canSave}
            className="btn btn-accent font-semibold px-5 py-2 rounded-full flex items-center gap-2 text-sm"
            style={{ opacity: canSave ? 1 : 0.5, cursor: canSave ? 'pointer' : 'not-allowed' }}
          >
            <Check className="w-4 h-4" />
            Save
          </button>
          <button
            onClick={onCancel}
            className="btn btn-secondary px-5 py-2 rounded-full text-sm"
            style={{ borderColor: BORDER, color: '#717171' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Group card                                                        */
/* ------------------------------------------------------------------ */
function GroupCard({
  group,
  onAdd,
  onRemove,
}: {
  group: Group
  onAdd: (groupId: string, person: Omit<Person, 'id'>) => void
  onRemove: (groupId: string, personId: string) => void
}) {
  const stats = useMemo(() => groupStats(group), [group])
  const [expanded, setExpanded] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [presetPosition, setPresetPosition] = useState<string | undefined>(undefined)

  const openForm = (position?: string) => {
    setPresetPosition(position)
    setFormOpen(true)
    setExpanded(true)
  }

  const handleSave = (p: Omit<Person, 'id'>) => {
    onAdd(group.id, p)
    setFormOpen(false)
    setPresetPosition(undefined)
  }

  return (
    <div className="card card-hover" style={{ border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
        style={{ borderBottom: `1px solid ${BORDER}` }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: stats.gaps > 0 ? RED_BG : GREEN_BG, color: stats.gaps > 0 ? RED : GREEN }}
          >
            {group.icon}
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-nav truncate">{group.name}</h3>
            <p className="text-xs text-text-muted truncate">{group.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation()
              openForm()
            }}
            className="btn btn-accent font-semibold px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-5 h-5" style={{ color: '#717171' }} />
          </motion.div>
        </div>
      </div>

      {/* Stat strip */}
      <div
        className="grid grid-cols-3 divide-x text-center"
        style={{ borderBottom: `1px solid ${BORDER}`, ['--tw-divide-opacity' as any]: 1 }}
      >
        <div className="py-3" style={{ borderRight: `1px solid ${BORDER}` }}>
          <div className="text-lg font-bold text-nav leading-none">{stats.required}</div>
          <div className="text-[11px] uppercase tracking-wider mt-1" style={{ color: '#717171' }}>
            Required
          </div>
        </div>
        <div className="py-3" style={{ borderRight: `1px solid ${BORDER}` }}>
          <div className="text-lg font-bold leading-none" style={{ color: GREEN }}>
            {stats.current}
          </div>
          <div className="text-[11px] uppercase tracking-wider mt-1" style={{ color: '#717171' }}>
            Current
          </div>
        </div>
        <div className="py-3">
          <div
            className="text-lg font-bold leading-none flex items-center justify-center gap-1.5"
            style={{ color: stats.gaps > 0 ? RED : GREEN }}
          >
            {stats.gaps > 0 && <span style={{ fontSize: 10 }}>🔴</span>}
            {stats.gaps}
          </div>
          <div className="text-[11px] uppercase tracking-wider mt-1" style={{ color: '#717171' }}>
            Gaps
          </div>
        </div>
      </div>

      {/* Body */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-5 py-4">
              {group.kind === 'slots' ? (
                <SlotsBody group={group} onAddSlot={openForm} onRemove={onRemove} />
              ) : (
                <CountBody group={group} stats={stats} onAddSlot={openForm} onRemove={onRemove} />
              )}

              <AnimatePresence>
                {formOpen && (
                  <QuickAddForm
                    group={group}
                    presetPosition={presetPosition}
                    onSave={handleSave}
                    onCancel={() => {
                      setFormOpen(false)
                      setPresetPosition(undefined)
                    }}
                  />
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---- body for slot-based groups (officers, committees, advisors) -- */
function SlotsBody({
  group,
  onAddSlot,
  onRemove,
}: {
  group: Group
  onAddSlot: (position?: string) => void
  onRemove: (groupId: string, personId: string) => void
}) {
  const rows = useMemo(() => slotRows(group), [group])
  return (
    <div className="space-y-2">
      {rows.map((row) =>
        row.person ? (
          <FilledRow key={row.key} person={row.person} onRemove={() => onRemove(group.id, row.person!.id)} />
        ) : (
          <MissingRow
            key={row.key}
            label={`${row.position} — MISSING`}
            onClick={() => onAddSlot(row.position)}
          />
        )
      )}
    </div>
  )
}

/* ---- body for count-based groups (board) -------------------------- */
function CountBody({
  group,
  stats,
  onAddSlot,
  onRemove,
}: {
  group: Group
  stats: { required: number; current: number; gaps: number }
  onAddSlot: (position?: string) => void
  onRemove: (groupId: string, personId: string) => void
}) {
  return (
    <div className="space-y-2">
      {group.members.map((m) => (
        <FilledRow key={m.id} person={m} onRemove={() => onRemove(group.id, m.id)} />
      ))}
      {Array.from({ length: stats.gaps }).map((_, i) => (
        <MissingRow key={`gap-${i}`} label="Open board seat — MISSING" onClick={() => onAddSlot()} />
      ))}
    </div>
  )
}

/* ---- shared rows -------------------------------------------------- */
function FilledRow({ person, onRemove }: { person: Person; onRemove: () => void }) {
  return (
    <div
      className="group flex items-center gap-3 px-3 py-2.5 rounded-lg"
      style={{ background: GREEN_BG }}
    >
      <Check className="w-4 h-4 flex-shrink-0" style={{ color: GREEN }} />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-nav truncate">
          {person.name}
          <span className="font-normal text-text-muted"> — {person.position}</span>
        </div>
        {person.company && (
          <div className="text-xs text-text-muted truncate">{person.company}</div>
        )}
      </div>
      <button
        onClick={onRemove}
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded transition-all hover:bg-white"
        aria-label={`Remove ${person.name}`}
      >
        <Trash2 className="w-4 h-4" style={{ color: RED }} />
      </button>
    </div>
  )
}

function MissingRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all hover:brightness-95"
      style={{ background: RED_BG, border: `1px dashed ${RED}` }}
    >
      <span style={{ fontSize: 11 }}>🔴</span>
      <span className="text-sm font-semibold flex-1" style={{ color: RED }}>
        {label}
      </span>
      <span className="text-xs font-semibold flex items-center gap-1" style={{ color: RED }}>
        <Plus className="w-3.5 h-3.5" />
        Fill gap
      </span>
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function DirectorsOfficersGapAnalysisPage() {
  const [groups, setGroups] = useState<Group[]>(seedGroups)

  const totals = useMemo(() => {
    let required = 0
    let current = 0
    let gaps = 0
    for (const g of groups) {
      const s = groupStats(g)
      required += s.required
      current += s.current
      gaps += s.gaps
    }
    return { required, current, gaps, filled: current }
  }, [groups])

  const pct = totals.required > 0 ? Math.round((Math.min(totals.filled, totals.required) / totals.required) * 100) : 100

  const handleAdd = (groupId: string, person: Omit<Person, 'id'>) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, members: [...g.members, { ...person, id: `${groupId}-${Date.now()}` }] }
          : g
      )
    )
  }

  const handleRemove = (groupId: string, personId: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId ? { ...g, members: g.members.filter((m) => m.id !== personId) } : g
      )
    )
  }

  return (
    <div style={{ background: '#F7F6F4', minHeight: '100vh' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 lg:py-14 space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="space-y-2">
              <div className="pill px-3.5 py-1.5 text-xs font-semibold inline-flex items-center" style={{ background: RED_BG, color: RED }}>
                <Users className="w-3.5 h-3.5 inline mr-1.5" />
                Board &amp; Leadership
              </div>
              <h1 className="serif text-4xl md:text-5xl text-nav">Board &amp; Leadership Gap Analysis</h1>
              <p className="text-sm text-text-muted">
                View required positions, current coverage, and gaps
              </p>
            </div>

            {/* Gap badge */}
            <div
              className="self-start rounded-2xl px-5 py-4 text-center flex-shrink-0"
              style={{
                background: totals.gaps > 0 ? RED_BG : GREEN_BG,
                border: `1px solid ${totals.gaps > 0 ? '#F5C9C5' : '#CDE7DD'}`,
              }}
            >
              <div className="text-3xl font-bold leading-none" style={{ color: totals.gaps > 0 ? RED : GREEN }}>
                {totals.gaps}
              </div>
              <div className="text-xs font-semibold mt-1.5" style={{ color: totals.gaps > 0 ? RED : GREEN }}>
                {totals.gaps === 1 ? 'Gap Remaining' : 'Gaps Remaining'}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="card p-5" style={{ border: `1px solid ${BORDER}` }}>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-sm font-semibold text-nav">
                {Math.min(totals.filled, totals.required)} of {totals.required} positions filled
              </span>
              <span className="text-sm font-bold" style={{ color: pct === 100 ? GREEN : RED }}>
                {pct}%
              </span>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ background: '#EEEDEA' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: pct === 100 ? GREEN : RED }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
            {totals.gaps > 0 ? (
              <p className="text-xs text-text-muted mt-2.5 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" style={{ color: RED }} />
                Click any red row below to fill the gap instantly.
              </p>
            ) : (
              <p className="text-xs mt-2.5 flex items-center gap-1.5" style={{ color: GREEN }}>
                <Check className="w-3.5 h-3.5" />
                All required positions are filled.
              </p>
            )}
          </div>
        </motion.div>

        {/* Group grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
          {groups.map((g, i) => (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <GroupCard group={g} onAdd={handleAdd} onRemove={handleRemove} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
