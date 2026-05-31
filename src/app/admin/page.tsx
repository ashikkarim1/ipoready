'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Building2, CreditCard, CheckCircle2, XCircle,
  Loader2, Rocket, RefreshCcw, ChevronDown, Search,
  TrendingUp, Shield, Zap, ArrowUpRight
} from 'lucide-react'
import Link from 'next/link'

type Plan = 'starter' | 'growth' | 'enterprise'

interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  is_approved: boolean
  created_at: string
  phone_number: string | null
  whatsapp_opted_in: boolean
  company_id: string | null
  company_name: string | null
  listing_type: string | null
  target_exchange: string | null
  subscription_plan: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  plan_expires_at: string | null
}

const PLAN_META: Record<string, { label: string; color: string; bg: string }> = {
  starter:    { label: 'Starter',    color: '#717171', bg: '#F3F3F1' },
  growth:     { label: 'Growth',     color: '#2D7A5F', bg: '#EAF5F0' },
  enterprise: { label: 'Enterprise', color: '#7C3AED', bg: '#F5F3FF' },
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState<Plan | 'all'>('all')
  const [approvedFilter, setApprovedFilter] = useState<'all' | 'pending' | 'approved'>('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [openPlanMenu, setOpenPlanMenu] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  // Auth guard
  useEffect(() => {
    if (status === 'loading') return
    if (!session || (session.user as any).role !== 'system_admin') {
      router.replace('/dashboard')
    }
  }, [session, status, router])

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      setUsers(data.users ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  async function changePlan(userId: string, plan: string) {
    setActionLoading(`plan-${userId}`)
    setOpenPlanMenu(null)
    try {
      const res = await fetch(`/api/admin/users/${userId}/plan`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      if (res.ok) {
        setUsers(u => u.map(x => x.id === userId ? { ...x, subscription_plan: plan } : x))
        showToast(`Plan updated to ${PLAN_META[plan]?.label ?? plan}`)
      } else {
        showToast('Failed to update plan', false)
      }
    } finally {
      setActionLoading(null)
    }
  }

  async function toggleApproval(userId: string, currentApproved: boolean) {
    setActionLoading(`approve-${userId}`)
    try {
      const res = await fetch(`/api/admin/users/${userId}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: !currentApproved }),
      })
      if (res.ok) {
        setUsers(u => u.map(x => x.id === userId ? { ...x, is_approved: !currentApproved } : x))
        showToast(currentApproved ? 'User access revoked' : 'User approved')
      } else {
        showToast('Action failed', false)
      }
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.company_name?.toLowerCase().includes(q) ||
      u.target_exchange?.toLowerCase().includes(q)
    const matchPlan = planFilter === 'all' || (u.subscription_plan ?? 'starter') === planFilter
    const matchApproved = approvedFilter === 'all' ||
      (approvedFilter === 'approved' && u.is_approved) ||
      (approvedFilter === 'pending' && !u.is_approved)
    return matchSearch && matchPlan && matchApproved
  })

  // Stats
  const totalUsers   = users.filter(u => u.role !== 'system_admin').length
  const pendingUsers = users.filter(u => !u.is_approved && u.role !== 'system_admin').length
  const growthUsers  = users.filter(u => u.subscription_plan === 'growth').length
  const entUsers     = users.filter(u => u.subscription_plan === 'enterprise').length

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F7F6F4' }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#9A9A9A' }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#F7F6F4' }}>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            style={{
              position: 'fixed', top: '1.25rem', left: '50%', transform: 'translateX(-50%)',
              zIndex: 9999, background: toast.ok ? '#1A1A1A' : '#E8312A',
              color: '#fff', padding: '0.625rem 1.25rem', borderRadius: '100px',
              fontSize: '13px', fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
            }}>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nav */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E5E4E0', padding: '0 1.5rem', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#1A1A1A' }}>
            <Rocket className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-sm" style={{ color: '#1A1A1A' }}>
            IPO<span style={{ color: '#E8312A' }}>Ready</span>
            <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#FDECEB', color: '#E8312A' }}>Admin</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <button onClick={load}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
            style={{ background: '#F7F6F4', border: '1px solid #E5E4E0', color: '#717171' }}>
            <RefreshCcw className="w-3 h-3" /> Refresh
          </button>
          <Link href="/dashboard"
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
            style={{ background: '#1A1A1A', color: '#fff' }}>
            Dashboard <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto" style={{ padding: '2rem 1.5rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 className="font-display text-2xl font-bold" style={{ color: '#1A1A1A', marginBottom: '0.25rem' }}>
            Platform Admin
          </h1>
          <p className="text-sm" style={{ color: '#9A9A9A' }}>
            Manage users, plans, and platform access
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4" style={{ marginBottom: '2rem' }}>
          {[
            { icon: Users,     label: 'Total Users',    value: totalUsers,   color: '#1A1A1A', bg: '#F3F3F1' },
            { icon: Zap,       label: 'Pending Approval', value: pendingUsers, color: '#B45309', bg: '#FEF3C7' },
            { icon: TrendingUp, label: 'Growth Plan',   value: growthUsers,  color: '#2D7A5F', bg: '#EAF5F0' },
            { icon: Shield,    label: 'Enterprise',     value: entUsers,     color: '#7C3AED', bg: '#F5F3FF' },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="rounded-2xl" style={{ background: '#fff', border: '1px solid #E5E4E0', padding: '1.25rem' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem' }}>
                <p className="text-xs font-semibold" style={{ color: '#9A9A9A' }}>{label}</p>
                <div className="rounded-lg flex items-center justify-center" style={{ width: '28px', height: '28px', background: bg }}>
                  <Icon className="w-3.5 h-3.5" style={{ color }} />
                </div>
              </div>
              <p className="text-2xl font-black" style={{ color: '#1A1A1A' }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3" style={{ marginBottom: '1.25rem' }}>
          <div className="flex items-center gap-2 flex-1" style={{ minWidth: '200px', background: '#fff', border: '1px solid #E5E4E0', borderRadius: '10px', padding: '0 0.75rem', height: '38px' }}>
            <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#9A9A9A' }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search name, email, company, exchange…"
              className="flex-1 text-sm outline-none bg-transparent"
              style={{ color: '#1A1A1A' }} />
          </div>
          <select value={planFilter} onChange={e => setPlanFilter(e.target.value as Plan | 'all')}
            className="text-sm rounded-lg outline-none"
            style={{ background: '#fff', border: '1px solid #E5E4E0', padding: '0 0.75rem', height: '38px', color: '#1A1A1A' }}>
            <option value="all">All Plans</option>
            <option value="starter">Starter</option>
            <option value="growth">Growth</option>
            <option value="enterprise">Enterprise</option>
          </select>
          <select value={approvedFilter} onChange={e => setApprovedFilter(e.target.value as 'all' | 'pending' | 'approved')}
            className="text-sm rounded-lg outline-none"
            style={{ background: '#fff', border: '1px solid #E5E4E0', padding: '0 0.75rem', height: '38px', color: '#1A1A1A' }}>
            <option value="all">All Status</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved</option>
          </select>
        </div>

        {/* User table */}
        <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid #E5E4E0' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #F0EFED', background: '#FAFAF9' }}>
                  {['User', 'Company', 'Exchange / Type', 'Plan', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#9A9A9A', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#9A9A9A', fontSize: '14px' }}>
                      No users found
                    </td>
                  </tr>
                )}
                {filtered.map((user, i) => {
                  const plan = (user.subscription_plan ?? 'starter') as Plan
                  const planMeta = PLAN_META[plan] ?? PLAN_META.starter
                  const isSystemAdmin = user.role === 'system_admin'
                  return (
                    <tr key={user.id}
                      style={{ borderBottom: i < filtered.length - 1 ? '1px solid #F7F6F4' : 'none' }}>

                      {/* User */}
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <div className="flex items-center gap-2.5">
                          <div className="rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
                            style={{ width: '32px', height: '32px', background: isSystemAdmin ? '#E8312A' : '#1A1A1A' }}>
                            {(user.name ?? user.email)?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold" style={{ color: '#1A1A1A', lineHeight: 1.2 }}>
                              {user.name}
                              {isSystemAdmin && <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full" style={{ background: '#FDECEB', color: '#E8312A' }}>Admin</span>}
                            </p>
                            <p className="text-xs" style={{ color: '#9A9A9A', marginTop: '1px' }}>{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Company */}
                      <td style={{ padding: '0.875rem 1rem' }}>
                        {user.company_name
                          ? <p className="text-sm font-medium" style={{ color: '#1A1A1A' }}>{user.company_name}</p>
                          : <p className="text-xs" style={{ color: '#C0BEB9' }}>—</p>}
                      </td>

                      {/* Exchange */}
                      <td style={{ padding: '0.875rem 1rem' }}>
                        {user.target_exchange
                          ? (
                            <div>
                              <p className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>{user.target_exchange?.toUpperCase()}</p>
                              <p className="text-xs" style={{ color: '#9A9A9A' }}>{user.listing_type?.toUpperCase()}</p>
                            </div>
                          )
                          : <p className="text-xs" style={{ color: '#C0BEB9' }}>—</p>}
                      </td>

                      {/* Plan */}
                      <td style={{ padding: '0.875rem 1rem' }}>
                        {!isSystemAdmin ? (
                          <div className="relative">
                            <button
                              onClick={() => setOpenPlanMenu(openPlanMenu === user.id ? null : user.id)}
                              disabled={!!actionLoading}
                              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors"
                              style={{ background: planMeta.bg, color: planMeta.color, border: `1px solid ${planMeta.color}20` }}>
                              {actionLoading === `plan-${user.id}`
                                ? <Loader2 className="w-3 h-3 animate-spin" />
                                : planMeta.label}
                              <ChevronDown className="w-3 h-3" />
                            </button>
                            {openPlanMenu === user.id && (
                              <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 50, background: '#fff', border: '1px solid #E5E4E0', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.10)', padding: '0.25rem', minWidth: '120px' }}>
                                {(['starter', 'growth', 'enterprise'] as Plan[]).map(p => (
                                  <button key={p} onClick={() => changePlan(user.id, p)}
                                    className="w-full text-left text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                                    style={{ color: PLAN_META[p].color, background: plan === p ? PLAN_META[p].bg : 'transparent' }}>
                                    {PLAN_META[p].label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs" style={{ color: '#9A9A9A' }}>—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '0.875rem 1rem' }}>
                        {isSystemAdmin ? (
                          <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: '#FDECEB', color: '#E8312A' }}>System Admin</span>
                        ) : user.is_approved ? (
                          <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#2D7A5F' }}>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#B45309' }}>
                            <XCircle className="w-3.5 h-3.5" /> Pending
                          </span>
                        )}
                      </td>

                      {/* Joined */}
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <p className="text-xs" style={{ color: '#9A9A9A' }}>
                          {new Date(user.created_at).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '0.875rem 1rem' }}>
                        {!isSystemAdmin && (
                          <button
                            onClick={() => toggleApproval(user.id, user.is_approved)}
                            disabled={!!actionLoading}
                            className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
                            style={{
                              background: user.is_approved ? '#FDECEB' : '#EAF5F0',
                              color: user.is_approved ? '#E8312A' : '#2D7A5F',
                              border: `1px solid ${user.is_approved ? '#FDECEB' : '#EAF5F0'}`,
                            }}>
                            {actionLoading === `approve-${user.id}`
                              ? <Loader2 className="w-3 h-3 animate-spin inline" />
                              : user.is_approved ? 'Revoke' : 'Approve'}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {filtered.length > 0 && (
          <p className="text-xs text-center" style={{ color: '#C0BEB9', marginTop: '1rem' }}>
            {filtered.length} of {users.length} users
          </p>
        )}
      </div>

      {/* Click-outside for plan menu */}
      {openPlanMenu && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setOpenPlanMenu(null)} />
      )}
    </div>
  )
}
