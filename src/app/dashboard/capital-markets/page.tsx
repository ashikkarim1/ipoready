'use client'

import { useEffect, useState } from 'react'
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Capital Markets Intelligence</h1>
        <p className="mt-2 text-lg text-gray-600">
          Real-time IPO tracking, peer benchmarking, and financial intelligence for public companies
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Companies Tracked</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{companies.length}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Recent IPOs</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{ipos.length}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Data Quality</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">95%</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Update Frequency</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">Daily</p>
            </div>
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Featured Companies */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Featured Companies</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {companies.map((company) => (
            <div key={company.company.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{company.company.name}</h3>
                  <p className="text-sm text-gray-600">{company.company.ticker} • {company.company.sector}</p>
                </div>
                <Eye className="w-5 h-5 text-gray-400" />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                {company.financials.latest && (
                  <>
                    <div>
                      <p className="text-xs text-gray-600 uppercase tracking-wide">Revenue</p>
                      <p className="text-lg font-semibold text-gray-900">
                        ${(company.financials.latest.revenue / 1e9).toFixed(1)}B
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 uppercase tracking-wide">Net Margin</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {company.financials.latest.net_margin?.toFixed(1)}%
                      </p>
                    </div>
                    {company.financials.revenueGrowth !== null && (
                      <div>
                        <p className="text-xs text-gray-600 uppercase tracking-wide">YoY Growth</p>
                        <div className="flex items-center gap-2">
                          {company.financials.revenueGrowth >= 0 ? (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-600" />
                          )}
                          <p className={`text-lg font-semibold ${
                            company.financials.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {company.financials.revenueGrowth?.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-gray-600 uppercase tracking-wide">ROE</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {company.financials.latest.roe?.toFixed(1)}%
                      </p>
                    </div>
                  </>
                )}
              </div>

              <button className="w-full mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition flex items-center justify-center gap-2">
                View Details
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recent IPOs */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent IPO Performance</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Company</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Listing Date</th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-700">1-Day Return</th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-700">1-Year Return</th>
                </tr>
              </thead>
              <tbody>
                {ipos.map((ipo, idx) => (
                  <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{ipo.company_name}</p>
                        <p className="text-xs text-gray-600">{ipo.ticker}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(ipo.listing_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className={`font-semibold ${
                        ipo.first_day_return >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {ipo.first_day_return >= 0 ? '+' : ''}{ipo.first_day_return?.toFixed(2)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className={`font-semibold ${
                        ipo.return_365d >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {ipo.return_365d >= 0 ? '+' : ''}{ipo.return_365d?.toFixed(2)}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Features Coming Soon */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-3">Phase 2 Features (Coming Soon)</h3>
        <ul className="space-y-2">
          <li className="flex items-center gap-2 text-gray-700">
            <Zap className="w-4 h-4 text-blue-600" />
            Market Sentiment Analysis
          </li>
          <li className="flex items-center gap-2 text-gray-700">
            <Zap className="w-4 h-4 text-blue-600" />
            Competitive Intelligence Dashboard
          </li>
          <li className="flex items-center gap-2 text-gray-700">
            <Zap className="w-4 h-4 text-blue-600" />
            Strategic Planning Intelligence
          </li>
          <li className="flex items-center gap-2 text-gray-700">
            <Zap className="w-4 h-4 text-blue-600" />
            M&A Intelligence Engine
          </li>
        </ul>
      </div>

      {error && (
        <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800">{error}</p>
        </div>
      )}
    </div>
  )
}
