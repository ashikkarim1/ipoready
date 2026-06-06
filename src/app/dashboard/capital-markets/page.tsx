'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Eye,
  DollarSign,
  Users,
  Zap,
  ArrowRight,
  Clock,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Activity,
  Globe,
} from 'lucide-react'

interface CompanyData {
  company: {
    id: string
    name: string
    ticker: string
    sector: string
    market_cap: number
  }
  financials: {
    latest: any
    revenueGrowth: number | null
  }
  ipo: any
  benchmarks: any
  valuation: any
}

interface IPOData {
  ticker: string
  company_name: string
  listing_date: string
  first_day_return: number
  return_365d: number
}

export default function CapitalMarketsPage() {
  const [companies, setCompanies] = useState<CompanyData[]>([])
  const [ipos, setIpos] = useState<IPOData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch featured companies
        const companiesRes = await fetch('/api/capital-markets/companies?limit=5')
        const companiesData = await companiesRes.json()
        setCompanies(companiesData.companies || [])

        // Fetch recent IPOs
        const iposRes = await fetch('/api/capital-markets/ipos?days=90&limit=10')
        const iposData = await iposRes.json()
        setIpos(iposData.ipos || [])
      } catch (err) {
        setError('Failed to load capital markets data')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    const shimmerStyle: React.CSSProperties = {
      background: 'linear-gradient(90deg, #E5E4E0 25%, #EDECE8 50%, #E5E4E0 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
      borderRadius: '10px',
    }
    return (
      <>
        <style>{`
          @keyframes shimmer {
            0%   { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', background: '#F7F6F4', minHeight: '100vh' }}>
          {/* Header skeleton */}
          <div style={{ paddingTop: '24px', marginBottom: '32px' }}>
            <div style={{ ...shimmerStyle, height: '32px', width: '35%', marginBottom: '12px' }} />
            <div style={{ ...shimmerStyle, height: '18px', width: '55%' }} />
          </div>
          {/* 4 stat cards skeleton */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{ background: 'white', borderRadius: '12px', border: '1px solid #E5E4E0', padding: '20px', height: '120px' }}>
                <div style={{ ...shimmerStyle, height: '10px', width: '60%', marginBottom: '16px' }} />
                <div style={{ ...shimmerStyle, height: '28px', width: '80%', marginBottom: '10px' }} />
                <div style={{ ...shimmerStyle, height: '10px', width: '45%' }} />
              </div>
            ))}
          </div>
          {/* Companies skeleton */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ ...shimmerStyle, height: '24px', width: '25%', marginBottom: '16px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} style={{ background: 'white', borderRadius: '12px', border: '1px solid #E5E4E0', padding: '20px', height: '220px' }}>
                  <div style={{ ...shimmerStyle, height: '20px', width: '70%', marginBottom: '12px' }} />
                  <div style={{ ...shimmerStyle, height: '14px', width: '50%', marginBottom: '20px' }} />
                  {[0, 1, 2, 3].map(j => (
                    <div key={j} style={{ ...shimmerStyle, height: '10px', marginBottom: '8px', width: j % 2 === 0 ? '60%' : '80%' }} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <div style={{ background: '#F7F6F4', minHeight: '100vh', colorScheme: 'light' }} suppressHydrationWarning>
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 px-4 sm:px-6 lg:px-0 py-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--color-info-soft)', border: '1px solid var(--color-info-medium)' }}>
              <Globe className="w-5 h-5" style={{ color: 'var(--color-info)' }} />
            </div>
            <h1 className="serif text-2xl sm:text-3xl text-nav">Capital Markets Intelligence</h1>
          </div>
          <p className="text-text-muted text-sm sm:text-base">Real-time IPO tracking, peer benchmarking, and market insights for decision-making</p>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { label: 'Companies Tracked', value: companies.length, icon: BarChart3, color: 'var(--color-info)' },
            { label: 'Recent IPOs', value: ipos.length, icon: TrendingUp, color: 'var(--color-success)' },
            { label: 'Data Quality', value: '95%', icon: CheckCircle2, color: 'var(--color-success)' },
            { label: 'Update Frequency', value: 'Daily', icon: Clock, color: 'var(--color-accent)' },
          ].map((stat, i) => (
            <motion.div key={stat.label}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.05 }}
              className="card p-6" style={{ background: 'white', border: '1px solid var(--color-border)' }}>
              <p className="text-text-muted text-xs uppercase tracking-wider font-semibold mb-3">{stat.label}</p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-nav font-black text-3xl leading-tight">{stat.value}</p>
                </div>
                <stat.icon className="w-6 h-6 flex-shrink-0 opacity-60" style={{ color: stat.color }} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Featured Companies */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <div className="flex items-center gap-2 mb-5">
            <h2 className="text-nav font-bold text-lg">Featured Companies</h2>
            <Activity className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {companies.map((company, idx) => (
              <motion.div key={company.company.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + idx * 0.06 }}
                className="card p-6 hover:border-border-dark transition-all"
                style={{ background: 'white', border: '1px solid var(--color-border)' }}>
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h3 className="text-nav text-lg font-bold mb-0.5">{company.company.name}</h3>
                    <p className="text-text-muted text-xs flex items-center gap-1.5">
                      <span className="font-mono font-semibold">{company.company.ticker}</span>
                      <span>•</span>
                      <span>{company.company.sector}</span>
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--color-surface-secondary)' }}>
                    <Eye className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
                  </div>
                </div>

                {company.financials.latest && (
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div>
                      <p className="text-text-muted text-xs uppercase tracking-wider font-semibold mb-1">Revenue</p>
                      <p className="text-nav font-bold text-lg">
                        ${(company.financials.latest.revenue / 1e9).toFixed(1)}B
                      </p>
                    </div>
                    <div>
                      <p className="text-text-muted text-xs uppercase tracking-wider font-semibold mb-1">Net Margin</p>
                      <p className="text-nav font-bold text-lg">
                        {company.financials.latest.net_margin?.toFixed(1)}%
                      </p>
                    </div>
                    {company.financials.revenueGrowth !== null && (
                      <div>
                        <p className="text-text-muted text-xs uppercase tracking-wider font-semibold mb-1">YoY Growth</p>
                        <div className="flex items-center gap-1">
                          {company.financials.revenueGrowth >= 0 ? (
                            <>
                              <TrendingUp className="w-4 h-4" style={{ color: 'var(--color-success)' }} />
                              <span className="text-nav font-bold text-lg" style={{ color: 'var(--color-success)' }}>
                                +{company.financials.revenueGrowth?.toFixed(1)}%
                              </span>
                            </>
                          ) : (
                            <>
                              <TrendingDown className="w-4 h-4" style={{ color: 'var(--color-error)' }} />
                              <span className="text-nav font-bold text-lg" style={{ color: 'var(--color-error)' }}>
                                {company.financials.revenueGrowth?.toFixed(1)}%
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                    <div>
                      <p className="text-text-muted text-xs uppercase tracking-wider font-semibold mb-1">ROE</p>
                      <p className="text-nav font-bold text-lg">
                        {company.financials.latest.roe?.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                )}

                <button className="w-full mt-4 px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                  style={{ background: 'var(--color-accent)', color: 'var(--color-text-inverse)' }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                  View Details
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent IPO Performance */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
          <div className="flex items-center gap-2 mb-5">
            <h2 className="text-nav font-bold text-lg">Recent IPO Performance</h2>
            <TrendingUp className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
          </div>
          <div className="rounded-2xl overflow-hidden border" style={{ background: 'white', borderColor: 'var(--color-border)' }}>
            {/* Table header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '0', padding: '0.875rem 1.5rem', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-secondary)' }}>
              {['Company', 'Listing Date', '1-Day Return', '1-Year Return'].map(h => (
                <span key={h} className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>{h}</span>
              ))}
            </div>
            {/* Table rows */}
            <div>
              {ipos.length > 0 ? (
                ipos.map((ipo, idx) => (
                  <motion.button key={idx}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + idx * 0.03 }}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
                      gap: '0',
                      padding: '1rem 1.5rem',
                      width: '100%',
                      borderBottom: idx < ipos.length - 1 ? '1px solid var(--color-border)' : 'none',
                      textAlign: 'left',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-surface-light)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{ipo.company_name}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{ipo.ticker}</p>
                    </div>
                    <div className="flex items-center">
                      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {new Date(ipo.listing_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <div className="flex items-center gap-1.5">
                        {ipo.first_day_return >= 0 ? (
                          <TrendingUp className="w-3.5 h-3.5" style={{ color: 'var(--color-success)' }} />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5" style={{ color: 'var(--color-error)' }} />
                        )}
                        <span className="text-sm font-semibold" style={{ color: ipo.first_day_return >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                          {ipo.first_day_return >= 0 ? '+' : ''}{ipo.first_day_return?.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="flex items-center gap-1.5">
                        {ipo.return_365d >= 0 ? (
                          <TrendingUp className="w-3.5 h-3.5" style={{ color: 'var(--color-success)' }} />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5" style={{ color: 'var(--color-error)' }} />
                        )}
                        <span className="text-sm font-semibold" style={{ color: ipo.return_365d >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                          {ipo.return_365d >= 0 ? '+' : ''}{ipo.return_365d?.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </motion.button>
                ))
              ) : (
                <div style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
                  <p style={{ color: 'var(--color-text-secondary)' }}>No recent IPO data available</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Phase 2 Features Coming Soon */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          className="card p-6" style={{ background: 'var(--color-info-soft)', borderColor: 'var(--color-info-medium)', border: '1px solid' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(29,78,216,0.2)' }}>
              <Zap className="w-5 h-5" style={{ color: 'var(--color-info)' }} />
            </div>
            <h3 className="text-nav font-bold text-base">Phase 2 Features (Coming Soon)</h3>
          </div>
          <ul className="space-y-2">
            {[
              'Market Sentiment Analysis',
              'Competitive Intelligence Dashboard',
              'Strategic Planning Intelligence',
              'M&A Intelligence Engine',
            ].map((feature, i) => (
              <li key={i} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--color-info)' }} />
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{feature}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Error state */}
        {isMounted && error && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="card p-5 flex items-start gap-3" style={{ background: 'var(--color-error-soft)', borderColor: 'var(--color-error-light)', border: '1px solid' }}>
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-error)' }} />
            <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{error}</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
