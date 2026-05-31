'use client'
import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2, Circle, Clock, AlertTriangle, ChevronDown, ChevronUp,
  ExternalLink, Info, Search, BookOpen, Zap, FileText, Sparkles, TrendingUp, X, Loader2
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { IPO_CHECKLIST, ChecklistTask } from '@/lib/checklist-data'
import { PHASE_LABELS, PHASE_ORDER } from '@/lib/utils'
import { Phase } from '@/types'

type LocalTaskStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked'

const PHASE_ICONS: Record<Phase, string> = {
  pre_planning: '🎯',
  corporate_restructuring: '🏛️',
  financial_audit: '📊',
  legal_documentation: '📋',
  regulatory_filing: '🗃️',
  marketing_roadshow: '🗺️',
  listing_application: '🚀',
  post_listing: '✅',
}

const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 }

const STATUS_STYLE: Record<LocalTaskStatus, { bg: string; border: string; color: string; label: string }> = {
  not_started: { bg: '#F7F6F4', border: '#E5E4E0',    color: '#9A9A9A', label: 'Not Started' },
  in_progress:  { bg: '#EFF6FF', border: '#1D4ED820', color: '#1D4ED8', label: 'In Progress'  },
  completed:    { bg: '#EAF5F0', border: '#2D7A5F20', color: '#2D7A5F', label: 'Completed'    },
  blocked:      { bg: '#FDECEB', border: '#E8312A20', color: '#E8312A', label: 'Blocked'      },
}

const INITIAL_STATUSES: Record<string, LocalTaskStatus> = {
  'pre_planning-1': 'completed', 'pre_planning-2': 'completed',
  'pre_planning-3': 'completed', 'pre_planning-4': 'completed',
  'pre_planning-5': 'completed', 'pre_planning-6': 'completed',
  'corporate_restructuring-1': 'completed', 'corporate_restructuring-2': 'completed',
  'corporate_restructuring-3': 'in_progress', 'corporate_restructuring-4': 'in_progress',
  'corporate_restructuring-5': 'not_started', 'corporate_restructuring-6': 'not_started',
  'corporate_restructuring-7': 'not_started',
}

export default function ChecklistPage() {
  const { data: session, status: sessionStatus } = useSession()
  const [taskStatuses, setTaskStatuses] = useState<Record<string, LocalTaskStatus>>(INITIAL_STATUSES)
  const [expandedTask, setExpandedTask] = useState<string | null>(null)
  const [expandedPhase, setExpandedPhase] = useState<Phase | null>('corporate_restructuring')
  const [searchQuery, setSearchQuery] = useState('')
  const [aiAdvisorDismissed, setAiAdvisorDismissed] = useState(false)
  const [filterPriority, setFilterPriority] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [activeTab, setActiveTab] = useState<'all' | Phase>('all')
  const [dbTaskIds, setDbTaskIds] = useState<Record<string, string>>({})  // taskKey → DB uuid
  const [tasksLoading, setTasksLoading] = useState(true)

  const taskKey = (task: ChecklistTask) => `${task.phase}-${task.order}`
  const getStatus = (task: ChecklistTask): LocalTaskStatus => taskStatuses[taskKey(task)] || 'not_started'
  const setStatus = (task: ChecklistTask, status: LocalTaskStatus) => {
    const key = taskKey(task)
    setTaskStatuses(prev => ({ ...prev, [key]: status }))
    const dbId = dbTaskIds[key]
    if (dbId) {
      fetch(`/api/tasks/${dbId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      }).catch(console.error)
    }
  }

  useEffect(() => {
    if (sessionStatus !== 'authenticated') return
    fetch('/api/tasks')
      .then(r => r.json())
      .then(({ tasks }) => {
        if (!tasks) return
        const ids: Record<string, string> = {}
        const statuses: Record<string, LocalTaskStatus> = {}
        tasks.forEach((t: { id: string; phase: string; orderIndex: number; status: string }) => {
          const key = `${t.phase}-${t.orderIndex}`
          ids[key] = t.id
          statuses[key] = t.status as LocalTaskStatus
        })
        setDbTaskIds(ids)
        setTaskStatuses(prev => ({ ...prev, ...statuses }))  // DB statuses override local defaults
      })
      .catch(console.error)
      .finally(() => setTasksLoading(false))
  }, [sessionStatus])

  const filteredTasks = useMemo(() => {
    return IPO_CHECKLIST.filter(task => {
      if (activeTab !== 'all' && task.phase !== activeTab) return false
      if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !task.category.toLowerCase().includes(searchQuery.toLowerCase())) return false
      if (filterPriority !== 'all' && task.priority !== filterPriority) return false
      if (filterStatus !== 'all' && getStatus(task) !== filterStatus) return false
      return true
    })
  }, [IPO_CHECKLIST, activeTab, searchQuery, filterPriority, filterStatus, taskStatuses])

  const groupedByPhase = useMemo(() => {
    return PHASE_ORDER.map(phase => ({
      phase,
      tasks: filteredTasks.filter(t => t.phase === phase).sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]),
      total: IPO_CHECKLIST.filter(t => t.phase === phase).length,
      completed: IPO_CHECKLIST.filter(t => t.phase === phase && taskStatuses[taskKey(t)] === 'completed').length,
    })).filter(g => g.tasks.length > 0 || activeTab === 'all')
  }, [filteredTasks, taskStatuses])

  const overallCompletion = useMemo(() => {
    const total = IPO_CHECKLIST.length
    const completed = IPO_CHECKLIST.filter(t => taskStatuses[taskKey(t)] === 'completed').length
    return { total, completed, percentage: Math.round((completed / total) * 100) }
  }, [IPO_CHECKLIST, taskStatuses])

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="serif text-3xl text-nav mb-2">IPO Checklist</h1>
          <div className="flex items-center gap-3">
            <p className="text-text-muted text-sm">
              {overallCompletion.completed}/{overallCompletion.total} tasks · {overallCompletion.percentage}% complete
            </p>
            {tasksLoading && (
              <span style={{ fontSize: '11px', color: '#9A9A9A' }} className="flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Syncing…
              </span>
            )}
          </div>
        </div>
        <span className="pill text-xs font-semibold" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>
          TSXV · IPO · TSX Company Manual
        </span>
      </div>

      {/* Overall progress */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-6">
            {[
              { label: 'Completed',   count: Object.values(taskStatuses).filter(s => s === 'completed').length,   color: '#2D7A5F' },
              { label: 'In Progress', count: Object.values(taskStatuses).filter(s => s === 'in_progress').length, color: '#1D4ED8' },
              { label: 'Blocked',     count: Object.values(taskStatuses).filter(s => s === 'blocked').length,     color: '#E8312A' },
            ].map(({ label, count, color }) => (
              <div key={label} className="text-center">
                <p className="text-lg font-bold" style={{ color }}>{count}</p>
                <p className="text-text-muted text-xs">{label}</p>
              </div>
            ))}
          </div>
          <div className="text-right">
            <p className="text-nav font-bold text-2xl">{overallCompletion.percentage}%</p>
            <p className="text-text-muted text-xs">Overall progress</p>
          </div>
        </div>
        <div className="progress-bar h-2">
          <motion.div className="h-full rounded-full"
            style={{ background: '#1A1A1A' }}
            initial={{ width: 0 }}
            animate={{ width: `${overallCompletion.percentage}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }} />
        </div>
      </div>

      {/* AI Task Advisor */}
      <AnimatePresence>
        {!aiAdvisorDismissed && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl p-5 relative"
            style={{ background: 'linear-gradient(135deg, #1A1A1A 0%, #1e1145 100%)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <button onClick={() => setAiAdvisorDismissed(true)}
              className="absolute top-4 right-4 opacity-40 hover:opacity-80 transition-opacity"
              style={{ color: 'white' }}>
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(232,49,42,0.25)', border: '1px solid rgba(232,49,42,0.35)' }}>
                <Sparkles className="w-4 h-4" style={{ color: '#FCA5A5' }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-sm text-white">AI Task Advisor</p>
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-bold tracking-wide"
                    style={{ background: 'rgba(232,49,42,0.3)', color: '#FCA5A5', border: '1px solid rgba(232,49,42,0.25)' }}>LIVE</span>
                </div>
                <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Critical path analysis · TSXV timeline · updated now</p>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              {[
                {
                  icon: AlertTriangle,
                  color: '#FCA5A5', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.22)',
                  label: 'Critical Path Alert',
                  text: '1 blocked task is holding back 4 downstream tasks. Resolving "Corporate Structure Review" unlocks your entire Legal Documentation phase — estimated 3–4 week delay if unresolved.',
                },
                {
                  icon: Zap,
                  color: '#FDE68A', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.22)',
                  label: 'Quickest Win Today',
                  text: '"Director Independence Confirmation" needs only a board resolution — completable today in ~2 hours. Finishing it advances 2 governance milestones and improves your PACE score by ~4 points.',
                },
                {
                  icon: TrendingUp,
                  color: '#6EE7B7', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.22)',
                  label: 'Phase 3 Unlock Path',
                  text: 'Complete 3 more Corporate Restructuring tasks to unlock Financial Audit phase. At current pace you\'re 12 days ahead of TSXV average — stay consistent to keep that buffer.',
                },
              ].map(({ icon: Icon, color, bg, border, label, text }) => (
                <div key={label} className="rounded-xl p-3.5" style={{ background: bg, border: `1px solid ${border}` }}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} />
                    <p className="text-xs font-semibold" style={{ color }}>{label}</p>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>{text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="input-dark pl-9" placeholder="Search tasks..." />
        </div>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
          className="input-dark sm:w-40">
          <option value="all">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="input-dark sm:w-40">
          <option value="all">All Statuses</option>
          <option value="not_started">Not Started</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      {/* Phase tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {(['all', ...PHASE_ORDER] as const).map(tab => {
          const isAll = tab === 'all'
          const data = !isAll ? groupedByPhase.find(g => g.phase === tab) : null
          const isActive = activeTab === tab
          return (
            <button key={tab} onClick={() => setActiveTab(tab as any)}
              className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all border"
              style={isActive
                ? { background: '#1A1A1A', borderColor: '#1A1A1A', color: '#FFFFFF' }
                : { background: '#FFFFFF', borderColor: '#E5E4E0', color: '#717171' }}>
              {!isAll && <span>{PHASE_ICONS[tab as Phase]}</span>}
              <span>{isAll ? 'All Phases' : PHASE_LABELS[tab as Phase].split(' ')[0]}</span>
              {data && <span className="opacity-60">({data.completed}/{data.total})</span>}
            </button>
          )
        })}
      </div>

      {/* Task groups */}
      <div className="space-y-5">
        {groupedByPhase.filter(g => g.tasks.length > 0).map(({ phase, tasks, total, completed }) => (
          <div key={phase} className="card overflow-hidden">

            {/* Phase header */}
            <button onClick={() => setExpandedPhase(expandedPhase === phase ? null : phase)}
              className="w-full flex items-center gap-3 p-5 hover:bg-bg transition-colors">
              <span className="text-xl">{PHASE_ICONS[phase]}</span>
              <div className="flex-1 text-left">
                <p className="text-nav font-semibold text-sm">{PHASE_LABELS[phase]}</p>
                <p className="text-text-muted text-xs">{completed}/{total} completed</p>
              </div>
              <div className="w-24 progress-bar mr-3">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${total > 0 ? (completed / total) * 100 : 0}%`,
                    background: completed === total && total > 0 ? '#2D7A5F' : '#1A1A1A',
                  }} />
              </div>
              <span className="text-text-muted text-xs w-8 text-right">
                {total > 0 ? Math.round((completed / total) * 100) : 0}%
              </span>
              {expandedPhase === phase
                ? <ChevronUp className="w-4 h-4 text-text-light flex-shrink-0" />
                : <ChevronDown className="w-4 h-4 text-text-light flex-shrink-0" />}
            </button>

            <AnimatePresence>
              {(expandedPhase === phase || activeTab === phase) && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
                  className="overflow-hidden" style={{ borderTop: '1px solid #E5E4E0' }}>
                  <div className="p-4 space-y-3">
                    {tasks.map((task, i) => {
                      const status = getStatus(task)
                      const key = taskKey(task)
                      const isExpanded = expandedTask === key
                      const ss = STATUS_STYLE[status]

                      return (
                        <motion.div key={key}
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="rounded-xl border transition-all"
                          style={{ background: ss.bg, borderColor: ss.border }}>

                          {/* Task row */}
                          <div className="flex items-start gap-3 p-4">
                            <button onClick={() => setStatus(task, status === 'completed' ? 'not_started' : 'completed')}
                              className="mt-0.5 flex-shrink-0 transition-transform hover:scale-110">
                              {status === 'completed'
                                ? <CheckCircle2 className="w-5 h-5 text-green" />
                                : <Circle className="w-5 h-5 text-text-light hover:text-text-muted" />}
                            </button>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className={`text-sm font-medium leading-snug ${status === 'completed' ? 'text-text-muted line-through' : 'text-nav'}`}>
                                  {task.title}
                                </p>
                                <span className="badge flex-shrink-0 text-[10px]"
                                  style={
                                    task.priority === 'critical' ? { background: '#FDECEB', color: '#E8312A', borderColor: '#E8312A20' } :
                                    task.priority === 'high'     ? { background: '#FEF3C7', color: '#B45309', borderColor: '#D4A96A20' } :
                                    { background: '#F7F6F4', color: '#9A9A9A', borderColor: '#E5E4E0' }
                                  }>
                                  {task.priority}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                <span className="text-text-muted text-xs">{task.category}</span>
                                {task.sedarCitation && (
                                  <span className="text-blue text-xs font-mono opacity-60">{task.sedarCitation.split(' — ')[0]}</span>
                                )}
                                {task.secCitation && !task.sedarCitation && (
                                  <span className="text-blue text-xs font-mono opacity-60">{task.secCitation.split(' — ')[0]}</span>
                                )}
                                <span className="text-text-light text-xs flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> ~{task.estimatedDays}d
                                </span>
                              </div>
                            </div>

                            {/* Controls */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <select value={status} onChange={e => setStatus(task, e.target.value as LocalTaskStatus)}
                                className="text-xs px-2 py-1 rounded-lg border outline-none cursor-pointer"
                                style={{ background: '#FFFFFF', borderColor: ss.border, color: ss.color, fontFamily: 'inherit' }}>
                                <option value="not_started">Not Started</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="blocked">Blocked</option>
                              </select>
                              <button onClick={() => setExpandedTask(isExpanded ? null : key)}
                                className="p-1 rounded-lg transition-colors text-text-light hover:text-text-muted hover:bg-border">
                                <Info className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Expanded detail */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }} className="overflow-hidden"
                                style={{ borderTop: '1px solid #E5E4E0' }}>
                                <div className="p-4 space-y-4">
                                  <p className="text-text-muted text-sm leading-relaxed">{task.description}</p>

                                  <div className="grid md:grid-cols-3 gap-4">
                                    {task.commonPitfalls.length > 0 && (
                                      <div className="p-3 rounded-xl" style={{ background: '#FDECEB', border: '1px solid #E8312A20' }}>
                                        <p className="text-accent text-xs font-semibold mb-2 flex items-center gap-1">
                                          <AlertTriangle className="w-3.5 h-3.5" /> Common Pitfalls
                                        </p>
                                        <ul className="space-y-1.5">
                                          {task.commonPitfalls.map((pitfall, j) => (
                                            <li key={j} className="text-text-muted text-xs leading-snug flex gap-2">
                                              <span className="text-accent flex-shrink-0">⚠</span>{pitfall}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                    {task.examples.length > 0 && (
                                      <div className="p-3 rounded-xl" style={{ background: '#EFF6FF', border: '1px solid #1D4ED820' }}>
                                        <p className="text-blue text-xs font-semibold mb-2 flex items-center gap-1">
                                          <BookOpen className="w-3.5 h-3.5" /> Examples
                                        </p>
                                        <ul className="space-y-1.5">
                                          {task.examples.map((ex, j) => (
                                            <li key={j} className="text-text-muted text-xs leading-snug flex gap-2">
                                              <span className="text-blue flex-shrink-0">→</span>{ex}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                    <div className="p-3 rounded-xl" style={{ background: '#F7F6F4', border: '1px solid #E5E4E0' }}>
                                      <p className="text-text-muted text-xs font-semibold mb-2 flex items-center gap-1">
                                        <FileText className="w-3.5 h-3.5" /> Regulatory Citations
                                      </p>
                                      <div className="space-y-2">
                                        {task.sedarCitation && <p className="text-text-muted text-xs font-mono leading-snug">{task.sedarCitation}</p>}
                                        {task.secCitation && <p className="text-text-muted text-xs font-mono leading-snug">{task.secCitation}</p>}
                                        <a href={task.learnMoreUrl} target="_blank"
                                          className="flex items-center gap-1 text-accent text-xs hover:text-accent-deep transition-colors font-medium">
                                          Learn more <ExternalLink className="w-3 h-3" />
                                        </a>
                                      </div>
                                    </div>
                                  </div>

                                  {task.title.toLowerCase().includes('audit') && (
                                    <div className="flex items-center gap-2 p-3 rounded-xl"
                                      style={{ background: '#FDECEB', border: '1px solid #E8312A20' }}>
                                      <Zap className="w-4 h-4 text-accent flex-shrink-0" />
                                      <p className="text-text-muted text-xs">
                                        <strong className="text-nav">Pro tip:</strong> Use{' '}
                                        <a href="https://auditus.ai" target="_blank" className="text-accent font-semibold hover:underline">auditus.ai</a>
                                        {' '}to prepare your financials before engaging auditors. Saves 20–40% on audit fees.
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        {filteredTasks.length === 0 && (
          <div className="text-center py-12 text-text-light">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No tasks match your filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
