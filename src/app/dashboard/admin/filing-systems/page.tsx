'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Globe, Plus, Loader2, Check, X, AlertCircle, Eye, EyeOff,
  Edit2, TestTube2, RefreshCcw, ArrowUpRight, Rocket
} from 'lucide-react'
import Link from 'next/link'

// ============================================================================
// Types
// ============================================================================

type AuthMethod = 'api_key' | 'oauth2' | 'certificate'

interface FilingSystem {
  id: string
  country_name: string
  exchange_name: string
  adapter_class: string
  api_endpoint: string
  auth_method: AuthMethod
  supported_doc_types_count: number
  is_enabled: boolean
  created_at: string
  last_tested_at: string | null
  last_test_status: 'success' | 'failed' | null
}

interface TestResult {
  success: boolean
  message: string
  details?: string
  timestamp: string
}

// ============================================================================
// Component: Main Page
// ============================================================================

export default function FilingSystemsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [systems, setSystems] = useState<FilingSystem[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showTestModal, setShowTestModal] = useState(false)
  const [selectedSystem, setSelectedSystem] = useState<FilingSystem | null>(null)
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const [formData, setFormData] = useState({
    country_name: '',
    exchange_name: '',
    adapter_class: '',
    api_endpoint: '',
    auth_method: 'api_key' as AuthMethod,
    is_enabled: true,
  })

  // Auth guard
  useEffect(() => {
    if (status === 'loading') return
    if (!session || (session.user as any).role !== 'system_admin') {
      router.replace('/dashboard')
    }
  }, [session, status, router])

  // Load filing systems
  const loadSystems = async () => {
    setLoading(true)
    try {
      // Mock data - replace with actual API call
      const mockSystems: FilingSystem[] = [
        {
          id: '1',
          country_name: 'Canada',
          exchange_name: 'TSX',
          adapter_class: 'TSXAdapter',
          api_endpoint: 'https://api.tsx.com/v1',
          auth_method: 'api_key',
          supported_doc_types_count: 24,
          is_enabled: true,
          created_at: '2025-01-15T10:30:00Z',
          last_tested_at: '2025-06-04T14:22:00Z',
          last_test_status: 'success',
        },
        {
          id: '2',
          country_name: 'United States',
          exchange_name: 'NYSE',
          adapter_class: 'NYSEAdapter',
          api_endpoint: 'https://api.nyse.com/v2',
          auth_method: 'oauth2',
          supported_doc_types_count: 31,
          is_enabled: true,
          created_at: '2024-12-20T08:15:00Z',
          last_tested_at: '2025-06-04T13:45:00Z',
          last_test_status: 'success',
        },
        {
          id: '3',
          country_name: 'United Kingdom',
          exchange_name: 'LSE',
          adapter_class: 'LSEAdapter',
          api_endpoint: 'https://api.lse.com/v1',
          auth_method: 'certificate',
          supported_doc_types_count: 28,
          is_enabled: true,
          created_at: '2025-02-10T16:45:00Z',
          last_tested_at: '2025-06-02T09:30:00Z',
          last_test_status: 'success',
        },
        {
          id: '4',
          country_name: 'Australia',
          exchange_name: 'ASX',
          adapter_class: 'ASXAdapter',
          api_endpoint: 'https://api.asx.com.au/v1',
          auth_method: 'api_key',
          supported_doc_types_count: 22,
          is_enabled: false,
          created_at: '2025-03-05T11:20:00Z',
          last_tested_at: '2025-06-01T15:10:00Z',
          last_test_status: 'failed',
        },
      ]
      setSystems(mockSystems)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'authenticated') {
      loadSystems()
    }
  }, [status])

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  const handleAddSystem = async () => {
    if (!formData.country_name || !formData.exchange_name || !formData.adapter_class || !formData.api_endpoint) {
      showToast('Please fill in all required fields', false)
      return
    }

    setActionLoading('add-system')
    try {
      // Mock API call - replace with actual endpoint
      await new Promise(r => setTimeout(r, 500))

      const newSystem: FilingSystem = {
        id: Date.now().toString(),
        country_name: formData.country_name,
        exchange_name: formData.exchange_name,
        adapter_class: formData.adapter_class,
        api_endpoint: formData.api_endpoint,
        auth_method: formData.auth_method,
        supported_doc_types_count: 0,
        is_enabled: formData.is_enabled,
        created_at: new Date().toISOString(),
        last_tested_at: null,
        last_test_status: null,
      }

      setSystems([...systems, newSystem])
      setShowAddModal(false)
      setFormData({
        country_name: '',
        exchange_name: '',
        adapter_class: '',
        api_endpoint: '',
        auth_method: 'api_key',
        is_enabled: true,
      })
      showToast('Filing system added successfully')
    } finally {
      setActionLoading(null)
    }
  }

  const handleTestSystem = async (system: FilingSystem) => {
    setSelectedSystem(system)
    setShowTestModal(true)
    setTestResult(null)
    setActionLoading(`test-${system.id}`)

    try {
      // Mock test - replace with actual API call
      await new Promise(r => setTimeout(r, 1200))

      const success = Math.random() > 0.2
      setTestResult({
        success,
        message: success ? 'Connection successful' : 'Connection failed',
        details: success
          ? `Successfully connected to ${system.exchange_name} adapter. Retrieved 15 document types.`
          : `Unable to authenticate with API endpoint: ${system.api_endpoint}. Check credentials.`,
        timestamp: new Date().toISOString(),
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleToggleEnabled = async (system: FilingSystem) => {
    setActionLoading(`toggle-${system.id}`)
    try {
      await new Promise(r => setTimeout(r, 300))
      setSystems(systems.map(s =>
        s.id === system.id ? { ...s, is_enabled: !s.is_enabled } : s
      ))
      showToast(`${system.exchange_name} ${!system.is_enabled ? 'enabled' : 'disabled'}`)
    } finally {
      setActionLoading(null)
    }
  }

  // Stats
  const totalCountries = systems.length
  const activeAdapters = systems.filter(s => s.is_enabled).length
  const totalFilings = systems.reduce((acc, s) => acc + s.supported_doc_types_count, 0)

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F7F6F4' }} suppressHydrationWarning>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#9A9A9A' }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#F7F6F4' }} suppressHydrationWarning>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            style={{
              position: 'fixed', top: '1.25rem', left: '50%', transform: 'translateX(-50%)',
              zIndex: 9999, background: toast.ok ? '#1A1A1A' : '#DC2626',
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
          <button onClick={loadSystems}
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
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 className="font-bold" style={{ fontSize: '24px', color: '#1A1A1A', marginBottom: '0.25rem' }}>
              Filing Systems Administration
            </h2>
            <p className="body-sm" style={{ color: '#9A9A9A' }}>
              Manage filing systems across 100+ countries
            </p>
          </div>
          <button
            onClick={() => {
              setFormData({
                country_name: '',
                exchange_name: '',
                adapter_class: '',
                api_endpoint: '',
                auth_method: 'api_key',
                is_enabled: true,
              })
              setShowAddModal(true)
            }}
            className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full transition-all"
            style={{ background: '#E8312A', color: '#fff' }}>
            <Plus className="w-3.5 h-3.5" /> Add Filing System
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ marginBottom: '2rem' }}>
          {[
            { label: 'Total Countries', value: totalCountries, icon: Globe, color: '#1D4ED8', bg: '#EFF6FF' },
            { label: 'Active Adapters', value: activeAdapters, icon: Check, color: '#2D7A5F', bg: '#EAF5F0' },
            { label: 'Total Document Types', value: totalFilings, icon: AlertCircle, color: '#7C3AED', bg: '#F5F3FF' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="rounded-xl" style={{ background: '#fff', border: '1px solid #E5E4E0', padding: '1.25rem' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem' }}>
                <p className="text-xs font-semibold" style={{ color: '#9A9A9A' }}>{label}</p>
                <div className="rounded-lg flex items-center justify-center" style={{ width: '32px', height: '32px', background: bg }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
              </div>
              <p className="h3" style={{ color: '#1A1A1A' }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-xl overflow-hidden" style={{ background: '#fff', border: '1px solid #E5E4E0' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #F0EFED', background: '#FAFAF9' }}>
                  {['Country/Exchange', 'Adapter Class', 'Doc Types', 'Created', 'Status', 'Actions'].map(h => (
                    <th key={h} className="label-sm" style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#9A9A9A', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {systems.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#9A9A9A', fontSize: '14px' }}>
                      No filing systems configured
                    </td>
                  </tr>
                )}
                {systems.map((system, i) => (
                  <tr key={system.id} style={{ borderBottom: i < systems.length - 1 ? '1px solid #F7F6F4' : 'none' }}>

                    {/* Country/Exchange */}
                    <td className="body-sm" style={{ padding: '0.875rem 1rem', color: '#1A1A1A', fontWeight: 500 }}>
                      <div className="flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5" style={{ color: '#9A9A9A' }} />
                        <div>
                          <p style={{ fontWeight: 600 }}>{system.country_name}</p>
                          <p style={{ color: '#9A9A9A', fontSize: '12px', marginTop: '2px' }}>{system.exchange_name}</p>
                        </div>
                      </div>
                    </td>

                    {/* Adapter Class */}
                    <td className="body-sm" style={{ padding: '0.875rem 1rem', color: '#1A1A1A', fontWeight: 500 }}>
                      <span className="label-sm" style={{
                        background: system.is_enabled ? '#EAF5F0' : '#F3F3F1',
                        color: system.is_enabled ? '#2D7A5F' : '#717171',
                        padding: '0.375rem 0.75rem',
                        borderRadius: '6px',
                        display: 'inline-block'
                      }}>
                        {system.adapter_class}
                      </span>
                    </td>

                    {/* Doc Types */}
                    <td className="body-sm" style={{ padding: '0.875rem 1rem', color: '#1A1A1A' }}>
                      {system.supported_doc_types_count}
                    </td>

                    {/* Created */}
                    <td className="body-sm" style={{ padding: '0.875rem 1rem', color: '#9A9A9A' }}>
                      {new Date(system.created_at).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div className="flex items-center gap-1.5">
                        {system.is_enabled ? (
                          <>
                            <Check className="w-3.5 h-3.5" style={{ color: '#2D7A5F' }} />
                            <span className="label-sm" style={{ color: '#2D7A5F', fontWeight: 600 }}>Active</span>
                          </>
                        ) : (
                          <>
                            <X className="w-3.5 h-3.5" style={{ color: '#DC2626' }} />
                            <span className="label-sm" style={{ color: '#DC2626', fontWeight: 600 }}>Inactive</span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleEnabled(system)}
                          disabled={!!actionLoading}
                          className="p-1.5 rounded-lg transition-colors"
                          style={{ background: '#F7F6F4', border: '1px solid #E5E4E0', color: '#717171' }}
                          title={system.is_enabled ? 'Disable' : 'Enable'}>
                          {actionLoading === `toggle-${system.id}` ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : system.is_enabled ? (
                            <Eye className="w-3.5 h-3.5" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleTestSystem(system)}
                          disabled={!!actionLoading}
                          className="p-1.5 rounded-lg transition-colors"
                          style={{ background: '#F7F6F4', border: '1px solid #E5E4E0', color: '#717171' }}
                          title="Test">
                          {actionLoading === `test-${system.id}` ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <TestTube2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          className="p-1.5 rounded-lg transition-colors"
                          style={{ background: '#F7F6F4', border: '1px solid #E5E4E0', color: '#717171' }}
                          title="Edit">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {systems.length > 0 && (
          <p className="text-xs text-center" style={{ color: '#C0BEB9', marginTop: '1rem' }}>
            {systems.length} filing system{systems.length !== 1 ? 's' : ''} configured
          </p>
        )}

      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }}
              onClick={() => setShowAddModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 50,
                background: '#fff',
                borderRadius: '12px',
                border: '1px solid #E5E4E0',
                maxWidth: '500px',
                width: '90%',
                maxHeight: '90vh',
                overflowY: 'auto',
              }}>
              <div style={{ padding: '2rem' }}>
                <h3 className="h3" style={{ color: '#1A1A1A', marginBottom: '1.5rem' }}>
                  Add Filing System
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Country Name */}
                  <div>
                    <label className="label-sm" style={{ color: '#1A1A1A', display: 'block', marginBottom: '0.5rem' }}>
                      Country Name
                    </label>
                    <input
                      type="text"
                      value={formData.country_name}
                      onChange={e => setFormData({ ...formData, country_name: e.target.value })}
                      placeholder="e.g., Canada"
                      className="w-full text-sm outline-none p-2"
                      style={{ background: '#F7F6F4', border: '1px solid #E5E4E0', borderRadius: '8px', color: '#1A1A1A' }}
                    />
                  </div>

                  {/* Exchange Name */}
                  <div>
                    <label className="label-sm" style={{ color: '#1A1A1A', display: 'block', marginBottom: '0.5rem' }}>
                      Exchange Name
                    </label>
                    <input
                      type="text"
                      value={formData.exchange_name}
                      onChange={e => setFormData({ ...formData, exchange_name: e.target.value })}
                      placeholder="e.g., TSX"
                      className="w-full text-sm outline-none p-2"
                      style={{ background: '#F7F6F4', border: '1px solid #E5E4E0', borderRadius: '8px', color: '#1A1A1A' }}
                    />
                  </div>

                  {/* Adapter Class */}
                  <div>
                    <label className="label-sm" style={{ color: '#1A1A1A', display: 'block', marginBottom: '0.5rem' }}>
                      Adapter Class
                    </label>
                    <select
                      value={formData.adapter_class}
                      onChange={e => setFormData({ ...formData, adapter_class: e.target.value })}
                      className="w-full text-sm outline-none p-2"
                      style={{ background: '#F7F6F4', border: '1px solid #E5E4E0', borderRadius: '8px', color: '#1A1A1A' }}>
                      <option value="">Select adapter...</option>
                      <option value="TSXAdapter">TSXAdapter</option>
                      <option value="NYSEAdapter">NYSEAdapter</option>
                      <option value="LSEAdapter">LSEAdapter</option>
                      <option value="ASXAdapter">ASXAdapter</option>
                      <option value="CustomAdapter">CustomAdapter</option>
                    </select>
                  </div>

                  {/* API Endpoint */}
                  <div>
                    <label className="label-sm" style={{ color: '#1A1A1A', display: 'block', marginBottom: '0.5rem' }}>
                      API Endpoint URL
                    </label>
                    <input
                      type="url"
                      value={formData.api_endpoint}
                      onChange={e => setFormData({ ...formData, api_endpoint: e.target.value })}
                      placeholder="https://api.example.com/v1"
                      className="w-full text-sm outline-none p-2"
                      style={{ background: '#F7F6F4', border: '1px solid #E5E4E0', borderRadius: '8px', color: '#1A1A1A' }}
                    />
                  </div>

                  {/* Auth Method */}
                  <div>
                    <label className="label-sm" style={{ color: '#1A1A1A', display: 'block', marginBottom: '0.5rem' }}>
                      Authentication Method
                    </label>
                    <select
                      value={formData.auth_method}
                      onChange={e => setFormData({ ...formData, auth_method: e.target.value as AuthMethod })}
                      className="w-full text-sm outline-none p-2"
                      style={{ background: '#F7F6F4', border: '1px solid #E5E4E0', borderRadius: '8px', color: '#1A1A1A' }}>
                      <option value="api_key">API Key</option>
                      <option value="oauth2">OAuth2</option>
                      <option value="certificate">Certificate</option>
                    </select>
                  </div>

                  {/* Enable Toggle */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <input
                      type="checkbox"
                      id="enabled-toggle"
                      checked={formData.is_enabled}
                      onChange={e => setFormData({ ...formData, is_enabled: e.target.checked })}
                      style={{ cursor: 'pointer' }}
                    />
                    <label htmlFor="enabled-toggle" className="label-sm" style={{ color: '#1A1A1A', cursor: 'pointer' }}>
                      Enable on creation
                    </label>
                  </div>
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem' }}>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 text-sm font-medium px-4 py-2 rounded-lg"
                    style={{ background: '#F7F6F4', border: '1px solid #E5E4E0', color: '#717171' }}>
                    Cancel
                  </button>
                  <button
                    onClick={handleAddSystem}
                    disabled={!!actionLoading}
                    className="flex-1 text-sm font-medium px-4 py-2 rounded-lg text-white flex items-center justify-center gap-1.5"
                    style={{ background: '#E8312A' }}>
                    {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                    Add System
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Test Modal */}
      <AnimatePresence>
        {showTestModal && selectedSystem && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }}
              onClick={() => {
                setShowTestModal(false)
                setSelectedSystem(null)
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 50,
                background: '#fff',
                borderRadius: '12px',
                border: '1px solid #E5E4E0',
                maxWidth: '500px',
                width: '90%',
              }}>
              <div style={{ padding: '2rem' }}>
                <h3 className="h3" style={{ color: '#1A1A1A', marginBottom: '1.5rem' }}>
                  Test {selectedSystem.exchange_name}
                </h3>

                {!testResult ? (
                  <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                    <Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: '#E8312A', marginBottom: '1rem' }} />
                    <p className="body-sm" style={{ color: '#9A9A9A' }}>Testing connection...</p>
                  </div>
                ) : (
                  <div>
                    <div style={{
                      padding: '1.25rem',
                      borderRadius: '8px',
                      background: testResult.success ? '#EAF5F0' : '#FEE2E2',
                      border: `1px solid ${testResult.success ? '#D1FAE5' : '#FECACA'}`,
                      marginBottom: '1.5rem'
                    }}>
                      <div className="flex items-center gap-2" style={{ marginBottom: '0.75rem' }}>
                        {testResult.success ? (
                          <Check className="w-5 h-5" style={{ color: '#2D7A5F' }} />
                        ) : (
                          <X className="w-5 h-5" style={{ color: '#DC2626' }} />
                        )}
                        <p className="label" style={{ color: testResult.success ? '#2D7A5F' : '#DC2626' }}>
                          {testResult.message}
                        </p>
                      </div>
                      {testResult.details && (
                        <p className="body-sm" style={{ color: testResult.success ? '#2D7A5F' : '#DC2626' }}>
                          {testResult.details}
                        </p>
                      )}
                    </div>

                    <p className="caption-sm" style={{ color: '#9A9A9A', textAlign: 'right' }}>
                      {new Date(testResult.timestamp).toLocaleTimeString('en-CA')}
                    </p>
                  </div>
                )}

                {testResult && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <button
                      onClick={() => {
                        setShowTestModal(false)
                        setSelectedSystem(null)
                      }}
                      className="w-full text-sm font-medium px-4 py-2 rounded-lg"
                      style={{ background: '#F7F6F4', border: '1px solid #E5E4E0', color: '#717171' }}>
                      Close
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  )
}
