'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  Link2, CheckCircle2, Clock, Wifi, WifiOff, RefreshCcw,
  ExternalLink, Send, Shield, AlertCircle, Zap
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

type IntegrationStatus = 'connected' | 'available' | 'coming_soon'

interface Integration {
  id: string
  name: string
  category: string
  description: string
  status: IntegrationStatus
  logoColor: string
  logoLetter: string
  connectedData?: Record<string, string>
  eta?: string
  oauthLabel?: string
}

// ── Static data (default statuses, overridden by DB on load) ─────────────────

const REGULATORY_INTEGRATIONS: Integration[] = [
  {
    id: 'sedar',
    name: 'SEDAR+',
    category: 'Regulatory Filing',
    description: 'Automatically check your company\'s filing status, prospectus receipt, and material change reports.',
    status: 'connected',
    logoColor: '#1A3A6B',
    logoLetter: 'S',
    connectedData: {
      'Last sync': '2 min ago',
      'Filings found': '2',
    },
  },
  {
    id: 'sedi',
    name: 'SEDI',
    category: 'Insider Reporting',
    description: 'Surface SEDI filing status for your insiders. Auto-alert if any insider is delinquent on a 10-day filing window.',
    status: 'connected',
    logoColor: '#1A5276',
    logoLetter: 'S',
    connectedData: {
      'Insiders tracked': '4',
      'Next deadline': 'Jun 3, 2026',
      'Delinquent filings': '0 ✓',
    },
  },
  {
    id: 'tsxv',
    name: 'TSXV Listing Status',
    category: 'Exchange',
    description: 'Check your TSXV application status, exchange correspondence, and listing date.',
    status: 'available',
    logoColor: '#C0392B',
    logoLetter: 'T',
    oauthLabel: 'Connect TSXV →',
  },
  {
    id: 'edgar',
    name: 'EDGAR',
    category: 'SEC Filing',
    description: 'SEC filing search for US cross-listed issuers.',
    status: 'coming_soon',
    logoColor: '#2C3E50',
    logoLetter: 'E',
    eta: 'Q4 2026',
  },
]

const BUSINESS_INTEGRATIONS: Integration[] = [
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    category: 'Accounting',
    description: 'Pull financial summary data to auto-populate MD&A metrics and board report KPIs.',
    status: 'available',
    logoColor: '#2CA01C',
    logoLetter: 'Q',
    oauthLabel: 'Connect with QuickBooks →',
  },
  {
    id: 'xero',
    name: 'Xero',
    category: 'Accounting',
    description: 'Alternative to QuickBooks for financial data sync.',
    status: 'available',
    logoColor: '#13B5EA',
    logoLetter: 'X',
    oauthLabel: 'Connect Xero →',
  },
  {
    id: 'googledrive',
    name: 'Google Drive',
    category: 'Document Storage',
    description: 'Sync documents to your IPOReady workspace. Already stubbed in Documents page.',
    status: 'connected',
    logoColor: '#4285F4',
    logoLetter: 'G',
    connectedData: {
      'Files synced': '47',
      'Last sync': '5 min ago',
    },
  },
  {
    id: 'docusign',
    name: 'DocuSign',
    category: 'e-Signature',
    description: 'Digital signing workflow for engagement letters, board resolutions, and prospectus sign-offs.',
    status: 'available',
    logoColor: '#FFB800',
    logoLetter: 'D',
    oauthLabel: 'Connect DocuSign →',
  },
  {
    id: 'slack',
    name: 'Slack',
    category: 'Communication',
    description: 'Push PACE™ alerts, task reminders, and critical deadline notifications to your company Slack workspace.',
    status: 'available',
    logoColor: '#4A154B',
    logoLetter: 'S',
    oauthLabel: 'Connect Slack →',
  },
]

const ALL_DEFAULTS: Integration[] = [...REGULATORY_INTEGRATIONS, ...BUSINESS_INTEGRATIONS]

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: IntegrationStatus }) {
  if (status === 'connected') {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        fontSize: '11px', fontWeight: 700, padding: '3px 10px',
        borderRadius: '20px', background: '#F0FDF4', color: '#15803D',
        border: '1px solid #86EFAC',
      }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E', flexShrink: 0 }} />
        Connected
      </span>
    )
  }
  if (status === 'available') {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        fontSize: '11px', fontWeight: 700, padding: '3px 10px',
        borderRadius: '20px', background: '#EFF6FF', color: '#1D4ED8',
        border: '1px solid #BFDBFE',
      }}>
        Available
      </span>
    )
  }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      fontSize: '11px', fontWeight: 700, padding: '3px 10px',
      borderRadius: '20px', background: '#F7F6F4', color: '#9A9A9A',
      border: '1px solid #E5E4E0',
    }}>
      Coming Soon
    </span>
  )
}

interface IntegrationCardProps {
  integration: Integration
  index: number
  status: IntegrationStatus
  saving: boolean
  onConnect: (id: string) => void
  onDisconnect: (id: string) => void
}

function IntegrationCard({
  integration,
  index,
  status,
  saving,
  onConnect,
  onDisconnect,
}: IntegrationCardProps) {
  const isComingSoon = status === 'coming_soon'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      style={{
        background: isComingSoon ? '#FAFAF9' : 'white',
        borderRadius: '16px',
        border: '1px solid #E5E4E0',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        opacity: isComingSoon ? 0.72 : 1,
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
        {/* Logo */}
        <div style={{
          width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
          background: integration.logoColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontSize: '18px', fontWeight: 800,
        }}>
          {integration.logoLetter}
        </div>

        {/* Name + category */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#1A1A1A' }}>{integration.name}</span>
            <span style={{
              fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px',
              background: '#F7F6F4', color: '#717171', border: '1px solid #E5E4E0',
            }}>
              {integration.category}
            </span>
          </div>
          <StatusBadge status={status} />
        </div>
      </div>

      {/* Description */}
      <p style={{ fontSize: '13px', color: '#717171', lineHeight: 1.55, margin: 0 }}>
        {integration.description}
      </p>

      {/* Connected data */}
      {status === 'connected' && integration.connectedData && (
        <div style={{
          background: '#F7F6F4', borderRadius: '10px', padding: '12px 14px',
          display: 'flex', flexDirection: 'column', gap: '6px',
          border: '1px solid #EEECE8',
        }}>
          {Object.entries(integration.connectedData).map(([key, value]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', color: '#9A9A9A' }}>{key}</span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#1A1A1A' }}>{value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ marginTop: 'auto' }}>
        {status === 'connected' && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => onDisconnect(integration.id)}
              disabled={saving}
              style={{
                flex: 1, padding: '8px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
                background: saving ? '#F7F6F4' : 'white',
                border: '1px solid #E5E4E0', color: saving ? '#9A9A9A' : '#1A1A1A',
                cursor: saving ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              }}
              onMouseEnter={e => { if (!saving) e.currentTarget.style.background = '#F7F6F4' }}
              onMouseLeave={e => { if (!saving) e.currentTarget.style.background = 'white' }}
            >
              {saving ? (
                <>
                  <RefreshCcw style={{ width: '13px', height: '13px', animation: 'spin 1s linear infinite' }} />
                  Saving...
                </>
              ) : (
                <>
                  <RefreshCcw style={{ width: '13px', height: '13px' }} />
                  Sync Now
                </>
              )}
            </button>
            {integration.id === 'sedar' && (
              <button style={{
                flex: 1, padding: '8px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
                background: '#1A1A1A', border: 'none', color: 'white', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = '#333')}
                onMouseLeave={e => (e.currentTarget.style.background = '#1A1A1A')}
              >
                <ExternalLink style={{ width: '13px', height: '13px' }} />
                View Filings
              </button>
            )}
          </div>
        )}

        {status === 'available' && (
          <button
            onClick={() => onConnect(integration.id)}
            disabled={saving}
            style={{
              width: '100%', padding: '9px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 700,
              background: saving ? '#F7F6F4' : '#1A1A1A',
              border: saving ? '1px solid #E5E4E0' : 'none',
              color: saving ? '#717171' : 'white',
              cursor: saving ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => { if (!saving) e.currentTarget.style.background = '#333' }}
            onMouseLeave={e => { if (!saving) e.currentTarget.style.background = '#1A1A1A' }}
          >
            {saving ? (
              <>
                <RefreshCcw style={{ width: '13px', height: '13px', animation: 'spin 1s linear infinite' }} />
                Connecting...
              </>
            ) : (
              integration.oauthLabel || 'Connect →'
            )}
          </button>
        )}

        {status === 'coming_soon' && (
          <div style={{
            padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 600,
            background: '#F7F6F4', border: '1px solid #E5E4E0', color: '#9A9A9A',
            textAlign: 'center',
          }}>
            Coming Soon — {integration.eta}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function IntegrationsPage() {
  const [requestText, setRequestText] = useState('')
  const [submitted, setSubmitted] = useState(false)

  // DB-driven status map: integrationId → status
  const [statusMap, setStatusMap] = useState<Record<string, IntegrationStatus>>(() => {
    const m: Record<string, IntegrationStatus> = {}
    for (const i of ALL_DEFAULTS) m[i.id] = i.status
    return m
  })

  // Per-integration saving spinner
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set())

  // Fetch DB state on mount and merge over defaults
  useEffect(() => {
    async function loadIntegrations() {
      try {
        const res = await fetch('/api/integrations')
        if (!res.ok) return
        const data: { integrations: { integrationId: string; status: string }[] } = await res.json()
        if (!data.integrations?.length) return
        setStatusMap(prev => {
          const next = { ...prev }
          for (const row of data.integrations) {
            const s = row.status as IntegrationStatus
            if (s === 'connected' || s === 'available' || s === 'coming_soon') {
              next[row.integrationId] = s
            }
          }
          return next
        })
      } catch {
        // Network error — fall back to local defaults silently
      }
    }
    loadIntegrations()
  }, [])

  const patchIntegration = useCallback(async (id: string, newStatus: 'connected' | 'available') => {
    setSavingIds(prev => new Set(prev).add(id))
    try {
      const res = await fetch(`/api/integrations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setStatusMap(prev => ({ ...prev, [id]: newStatus }))
      }
    } catch {
      // Silent failure — UI retains optimistic state
    } finally {
      setSavingIds(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }, [])

  const router = useRouter()

  const handleConnect = useCallback((id: string) => {
    // Special handling for Slack - redirect to dedicated integration page
    if (id === 'slack') {
      router.push('/integrations/slack')
      return
    }
    patchIntegration(id, 'connected')
  }, [patchIntegration, router])

  const handleDisconnect = useCallback((id: string) => {
    // Special handling for Slack - redirect to dedicated integration page
    if (id === 'slack') {
      router.push('/integrations/slack')
      return
    }
    patchIntegration(id, 'available')
  }, [patchIntegration, router])

  const connectedCount = ALL_DEFAULTS.filter(i => statusMap[i.id] === 'connected').length
  const availableCount = ALL_DEFAULTS.filter(i => statusMap[i.id] === 'available').length

  function handleSubmitRequest() {
    if (!requestText.trim()) return
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setRequestText('')
    }, 3000)
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }} suppressHydrationWarning>

      {/* ── Page header ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{ marginBottom: '32px' }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px', background: '#1A1A1A',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Link2 style={{ width: '18px', height: '18px', color: 'white' }} />
              </div>
              <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#1A1A1A', margin: 0 }}>
                Integrations & API Connectors
              </h1>
            </div>
            <p style={{ fontSize: '14px', color: '#717171', margin: 0 }}>
              Connect IPOReady to your existing tools and regulatory data sources
            </p>
          </div>
          {/* Status chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              fontSize: '13px', fontWeight: 700, padding: '6px 14px', borderRadius: '20px',
              background: '#F0FDF4', color: '#15803D', border: '1px solid #86EFAC',
            }}>
              <CheckCircle2 style={{ width: '14px', height: '14px' }} />
              {connectedCount} Connected
            </span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              fontSize: '13px', fontWeight: 700, padding: '6px 14px', borderRadius: '20px',
              background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE',
            }}>
              <Wifi style={{ width: '14px', height: '14px' }} />
              {availableCount} Available
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── Section 1: Regulatory Data ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.08 }}
        style={{ marginBottom: '32px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Shield style={{ width: '16px', height: '16px', color: '#E8312A' }} />
          <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Regulatory Data
          </h2>
          <span style={{
            fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px',
            background: '#FDECEB', color: '#E8312A', border: '1px solid #FECACA',
          }}>
            Priority
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {REGULATORY_INTEGRATIONS.map((integration, i) => (
            <IntegrationCard
              key={integration.id}
              integration={integration}
              index={i}
              status={statusMap[integration.id] ?? integration.status}
              saving={savingIds.has(integration.id)}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
            />
          ))}
        </div>
      </motion.div>

      {/* ── Section 2: Business Tools ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.16 }}
        style={{ marginBottom: '32px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Zap style={{ width: '16px', height: '16px', color: '#717171' }} />
          <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Business Tools
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {BUSINESS_INTEGRATIONS.map((integration, i) => (
            <IntegrationCard
              key={integration.id}
              integration={integration}
              index={i}
              status={statusMap[integration.id] ?? integration.status}
              saving={savingIds.has(integration.id)}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
            />
          ))}
        </div>
      </motion.div>

      {/* ── Request an Integration ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.24 }}
        style={{
          background: 'white', borderRadius: '16px', border: '1px solid #E5E4E0',
          padding: '24px', marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <Send style={{ width: '16px', height: '16px', color: '#717171' }} />
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
            Request an Integration
          </h3>
        </div>
        <p style={{ fontSize: '13px', color: '#9A9A9A', marginBottom: '16px' }}>
          Don&apos;t see the tool you need? Let us know and we&apos;ll prioritize it.
        </p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={requestText}
            onChange={e => setRequestText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmitRequest()}
            placeholder="e.g. Bloomberg, Refinitiv, CRA My Business Account..."
            style={{
              flex: 1, minWidth: '220px', padding: '10px 14px', borderRadius: '10px',
              border: '1px solid #E5E4E0', fontSize: '13px', color: '#1A1A1A',
              background: 'white', outline: 'none',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = '#1A1A1A')}
            onBlur={e => (e.currentTarget.style.borderColor = '#E5E4E0')}
          />
          <button
            onClick={handleSubmitRequest}
            disabled={submitted}
            style={{
              padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 700,
              background: submitted ? '#F0FDF4' : '#1A1A1A',
              border: submitted ? '1px solid #86EFAC' : 'none',
              color: submitted ? '#15803D' : 'white',
              cursor: submitted ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => { if (!submitted) e.currentTarget.style.background = '#333' }}
            onMouseLeave={e => { if (!submitted) e.currentTarget.style.background = '#1A1A1A' }}
          >
            {submitted ? (
              <>
                <CheckCircle2 style={{ width: '14px', height: '14px' }} />
                Submitted!
              </>
            ) : (
              'Submit Request'
            )}
          </button>
        </div>
      </motion.div>

      {/* ── Legal disclaimer ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.32 }}
        style={{
          display: 'flex', alignItems: 'flex-start', gap: '10px',
          padding: '14px 18px', borderRadius: '12px',
          background: '#F7F6F4', border: '1px solid #E5E4E0',
          marginBottom: '8px',
        }}
      >
        <AlertCircle style={{ width: '14px', height: '14px', color: '#9A9A9A', flexShrink: 0, marginTop: '1px' }} />
        <p style={{ fontSize: '12px', color: '#9A9A9A', margin: 0, lineHeight: 1.6 }}>
          IPOReady API connections are read-only where noted. We never write to regulatory systems on your behalf.
          All OAuth tokens are encrypted and stored securely.
        </p>
      </motion.div>

      {/* Spin animation for loading state */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
