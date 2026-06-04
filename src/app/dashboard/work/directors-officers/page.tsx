'use client'

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, Check, Users, DollarSign, Briefcase, TrendingUp, Search, Award } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// Import components
import { ComplianceGapDashboard } from './components/ComplianceGapDashboard'
import { MarketCompensationDashboard } from './components/MarketCompensationDashboard'
import { TalentMarketplace } from './components/TalentMarketplace'
import { ProfessionalRegistry } from './components/ProfessionalRegistry'
import { CurrentBoardRoster } from './components/CurrentBoardRoster'
import { ComplianceRequirementMapping } from './components/ComplianceRequirementMapping'
import { ReferralCommissionDashboard } from './components/ReferralCommissionDashboard'

interface Director {
  id: string
  name: string
  role: string
  email: string
  independence: 'independent' | 'management'
  committees: string[]
  yearsExperience: number
  annualComp?: number
  equity?: number
  status: 'active' | 'pending' | 'hired-via-ipoready'
  linkedInUrl?: string
  hiredViaIPOReady?: boolean
  findersFeeAmount?: number
}

interface Gap {
  id: string
  type: 'critical' | 'warning'
  role: string
  requirement: string
  description: string
  marketCompMin: number
  marketCompMax: number
  equityMin: number
  equityMax: number
}

interface ComplianceGap {
  role: string
  status: 'met' | 'missing'
  requirement: string
}

export default function DirectorsOfficersMarketplacePage() {
  const { data: session } = useSession()

  // State
  const [directors, setDirectors] = useState<Director[]>([])
  const [gaps, setGaps] = useState<Gap[]>([])
  const [selectedExchange, setSelectedExchange] = useState<string>('tsxv')
  const [complianceGaps, setComplianceGaps] = useState<ComplianceGap[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('gaps')
  const [showMarketplaceSearch, setShowMarketplaceSearch] = useState(false)

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)

        // In a real app, fetch from API
        // For now, use mock data
        const mockDirectors = getMockDirectors()
        const mockGaps = getMockGaps()
        const mockComplianceGaps = getMockComplianceGaps(mockDirectors)

        setDirectors(mockDirectors)
        setGaps(mockGaps)
        setComplianceGaps(mockComplianceGaps)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [selectedExchange])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
          <p className="mt-4 text-slate-600">Loading Board & Talent Marketplace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50" style={{ background: '#F7F6F4', colorScheme: 'light' }}>
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Board & Talent Marketplace</h1>
              <p className="text-slate-600 mt-2">
                Find and hire qualified directors, officers, and board members to meet compliance requirements
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">15% Finders Fee Model</span>
            </div>
          </div>
        </motion.div>

        {/* Exchange Selector */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <label className="font-medium text-slate-700">Target Exchange:</label>
          <select
            value={selectedExchange}
            onChange={(e) => setSelectedExchange(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-500 bg-white"
          >
            <option value="tsxv">TSXV (TSX Venture)</option>
            <option value="tsx">TSX (Toronto Stock Exchange)</option>
            <option value="nasdaq">NASDAQ</option>
            <option value="nyse">NYSE (New York Stock Exchange)</option>
          </select>
        </motion.div>

        {/* Main Content - Tabbed Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="gaps" className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Gaps</span>
            </TabsTrigger>
            <TabsTrigger value="compensation" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Compensation</span>
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Marketplace</span>
            </TabsTrigger>
            <TabsTrigger value="roster" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              <span className="hidden sm:inline">Roster</span>
            </TabsTrigger>
            <TabsTrigger value="referrals" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span className="hidden sm:inline">Referrals</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Compliance Gap Analysis Dashboard */}
          <TabsContent value="gaps" className="space-y-6">
            <ComplianceGapDashboard
              gaps={gaps}
              directors={directors}
              selectedExchange={selectedExchange}
              onFindTalent={() => setActiveTab('marketplace')}
            />
          </TabsContent>

          {/* Tab 2: Market Compensation Dashboard */}
          <TabsContent value="compensation" className="space-y-6">
            <MarketCompensationDashboard
              gaps={gaps}
              selectedExchange={selectedExchange}
            />
          </TabsContent>

          {/* Tab 3: Talent Marketplace */}
          <TabsContent value="marketplace" className="space-y-6">
            <TalentMarketplace
              gaps={gaps}
              selectedExchange={selectedExchange}
              onProfessionalSelected={(professional) => {
                console.log('Selected professional:', professional)
              }}
            />
          </TabsContent>

          {/* Tab 4: Current Board Roster */}
          <TabsContent value="roster" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Roster */}
              <div className="lg:col-span-2">
                <CurrentBoardRoster
                  directors={directors}
                  onEdit={(director) => console.log('Edit:', director)}
                  onDelete={(directorId) => setDirectors(directors.filter(d => d.id !== directorId))}
                />
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                <Card className="border-slate-200 bg-white">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-slate-700">Board Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-xs text-slate-600">Total Members</p>
                      <p className="text-2xl font-bold text-slate-900">{directors.length}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Independent Directors</p>
                      <p className="text-2xl font-bold text-emerald-600">
                        {directors.filter(d => d.independence === 'independent').length}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Hired via IPOReady</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {directors.filter(d => d.hiredViaIPOReady).length}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 bg-white">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-slate-700">Finders Fees Generated</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-600">Total Paid</p>
                      <p className="text-2xl font-bold text-slate-900">
                        ${directors
                          .filter(d => d.hiredViaIPOReady)
                          .reduce((sum, d) => sum + (d.findersFeeAmount || 0), 0)
                          .toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Compliance Requirements Mapping */}
            <ComplianceRequirementMapping
              directors={directors}
              selectedExchange={selectedExchange}
            />
          </TabsContent>

          {/* Tab 5: Referral & Commission Dashboard */}
          <TabsContent value="referrals" className="space-y-6">
            <ReferralCommissionDashboard />
          </TabsContent>
        </Tabs>

        {/* Professional Registry Section - Always Visible */}
        <ProfessionalRegistry />
      </div>
    </div>
  )
}

// Mock data generators
function getMockDirectors(): Director[] {
  return [
    {
      id: 'dir-1',
      name: 'Sarah Chen',
      role: 'Lead Independent Director',
      email: 'sarah@example.com',
      independence: 'independent',
      committees: ['audit', 'governance'],
      yearsExperience: 20,
      annualComp: 85000,
      equity: 0.35,
      status: 'active',
      linkedInUrl: 'https://linkedin.com/in/sarahchen',
      hiredViaIPOReady: false,
    },
    {
      id: 'dir-2',
      name: 'Michael Rodriguez',
      role: 'Audit Committee Chair',
      email: 'michael@example.com',
      independence: 'independent',
      committees: ['audit', 'compensation'],
      yearsExperience: 18,
      annualComp: 95000,
      equity: 0.40,
      status: 'active',
      linkedInUrl: 'https://linkedin.com/in/mrodriguez',
      hiredViaIPOReady: true,
      findersFeeAmount: 14250,
    },
    {
      id: 'dir-3',
      name: 'Jennifer Wong',
      role: 'CEO',
      email: 'jennifer@example.com',
      independence: 'management',
      committees: [],
      yearsExperience: 15,
      annualComp: 350000,
      equity: 8.5,
      status: 'active',
      linkedInUrl: 'https://linkedin.com/in/jwong',
      hiredViaIPOReady: false,
    },
  ]
}

function getMockGaps(): Gap[] {
  return [
    {
      id: 'gap-1',
      type: 'critical',
      role: 'Independent Director',
      requirement: 'MISSING: 1 Independent Director (Required for TSXV)',
      description: 'You currently have 2 independent directors but need 3 minimum for TSXV compliance',
      marketCompMin: 50000,
      marketCompMax: 100000,
      equityMin: 0.25,
      equityMax: 0.5,
    },
    {
      id: 'gap-2',
      type: 'critical',
      role: 'Audit Committee Financial Expert',
      requirement: 'MISSING: Audit Committee Financial Expert (Mandated by NI 52-110)',
      description: 'Audit committee must have at least one member with financial expertise',
      marketCompMin: 60000,
      marketCompMax: 120000,
      equityMin: 0.3,
      equityMax: 0.6,
    },
    {
      id: 'gap-3',
      type: 'warning',
      role: 'CFO',
      requirement: 'CFO Replacement',
      description: 'Current CFO may be retiring; consider proactive recruitment',
      marketCompMin: 300000,
      marketCompMax: 500000,
      equityMin: 1.0,
      equityMax: 3.0,
    },
  ]
}

function getMockComplianceGaps(directors: Director[]): ComplianceGap[] {
  const independentCount = directors.filter(d => d.independence === 'independent').length
  const hasCEO = directors.some(d => d.role.toLowerCase().includes('ceo'))
  const hasCFO = directors.some(d => d.role.toLowerCase().includes('cfo'))
  const hasAuditChair = directors.some(d => d.committees.includes('audit'))

  return [
    {
      role: 'Independent Directors',
      status: independentCount >= 2 ? 'met' : 'missing',
      requirement: `${independentCount}/2 Independent Directors`,
    },
    {
      role: 'CEO',
      status: hasCEO ? 'met' : 'missing',
      requirement: 'Chief Executive Officer',
    },
    {
      role: 'CFO',
      status: hasCFO ? 'met' : 'missing',
      requirement: 'Chief Financial Officer',
    },
    {
      role: 'Audit Chair',
      status: hasAuditChair ? 'met' : 'missing',
      requirement: 'Audit Committee Chair',
    },
  ]
}
