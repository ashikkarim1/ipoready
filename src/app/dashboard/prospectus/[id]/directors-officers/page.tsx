'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BoardCompositionOverview } from './components/BoardCompositionOverview'
import { DirectorsTable } from './components/DirectorsTable'
import { OfficersTable } from './components/OfficersTable'
import { SignificantShareholdersTable } from './components/SignificantShareholdersTable'
import { RegulatoryChecklist } from './components/RegulatoryChecklist'
import { AddPersonModal } from './components/AddPersonModal'
import {
  Director,
  Officer,
  SignificantShareholder,
  RegulatoryChecklistItem,
} from './types'

export default function DirectorsOfficersPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session } = useSession()
  const prospectusId = params.id as string

  // State
  const [directors, setDirectors] = useState<Director[]>([])
  const [officers, setOfficers] = useState<Officer[]>([])
  const [shareholders, setShareholders] = useState<SignificantShareholder[]>([])
  const [regulatoryItems, setRegulatoryItems] = useState<RegulatoryChecklistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedExchange, setSelectedExchange] = useState<string>('tsxv')

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [addModalMode, setAddModalMode] = useState<'director' | 'officer' | 'shareholder'>(
    'director'
  )

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        // Fetch directors, officers, shareholders from API
        const [directorsRes, officersRes, shareholdersRes, regulatoryRes] =
          await Promise.all([
            fetch(`/api/prospectus/${prospectusId}/directors`),
            fetch(`/api/prospectus/${prospectusId}/officers`),
            fetch(`/api/prospectus/${prospectusId}/shareholders`),
            fetch(`/api/prospectus/${prospectusId}/regulatory-checklist`),
          ]).catch(() => [null, null, null, null])

        // Handle successful responses
        if (directorsRes?.ok) {
          const data = await directorsRes.json()
          setDirectors(data.directors || [])
        }
        if (officersRes?.ok) {
          const data = await officersRes.json()
          setOfficers(data.officers || [])
        }
        if (shareholdersRes?.ok) {
          const data = await shareholdersRes.json()
          setShareholders(data.shareholders || [])
        }
        if (regulatoryRes?.ok) {
          const data = await regulatoryRes.json()
          setRegulatoryItems(data.items || [])
        }

        // Set default mock data if API not available (for development)
        if (!directorsRes?.ok) {
          setDirectors(getMockDirectors(prospectusId))
        }
        if (!officersRes?.ok) {
          setOfficers(getMockOfficers(prospectusId))
        }
        if (!shareholdersRes?.ok) {
          setShareholders(getMockShareholders(prospectusId))
        }
        if (!regulatoryRes?.ok) {
          setRegulatoryItems(getMockRegulatoryItems(selectedExchange))
        }
      } catch (error) {
        console.error('Error loading data:', error)
        // Set mock data
        setDirectors(getMockDirectors(prospectusId))
        setOfficers(getMockOfficers(prospectusId))
        setShareholders(getMockShareholders(prospectusId))
        setRegulatoryItems(getMockRegulatoryItems(selectedExchange))
      } finally {
        setLoading(false)
      }
    }

    if (prospectusId) {
      loadData()
    }
  }, [prospectusId, selectedExchange])

  const handleAddPerson = async (data: any) => {
    const endpoint = addModalMode === 'director'
      ? `/api/prospectus/${prospectusId}/directors`
      : addModalMode === 'officer'
        ? `/api/prospectus/${prospectusId}/officers`
        : `/api/prospectus/${prospectusId}/shareholders`

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to add person')

      const result = await response.json()

      // Add to local state
      if (addModalMode === 'director') {
        setDirectors([...directors, result.director])
      } else if (addModalMode === 'officer') {
        setOfficers([...officers, result.officer])
      } else {
        setShareholders([...shareholders, result.shareholder])
      }
    } catch (error) {
      console.error('Error adding person:', error)
      // Add mock data for demo
      const newId = `${addModalMode}-${Date.now()}`
      if (addModalMode === 'director') {
        setDirectors([
          ...directors,
          {
            id: newId,
            prospectusId,
            name: data.name,
            role: data.role,
            email: data.email,
            independence: data.independence,
            committees: data.committees || [],
            residency: {
              country: data.residencyCountry,
              province: data.residencyProvince,
              canadianResident: data.residencyCountry === 'Canada',
            },
            bio: data.bio,
            pifStatus: 'required',
            documents: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ])
      }
    }
  }

  const handleDeleteDirector = async (directorId: string) => {
    try {
      await fetch(`/api/prospectus/${prospectusId}/directors/${directorId}`, {
        method: 'DELETE',
      })
      setDirectors(directors.filter((d) => d.id !== directorId))
    } catch (error) {
      console.error('Error deleting director:', error)
    }
  }

  const handleDeleteOfficer = async (officerId: string) => {
    try {
      await fetch(`/api/prospectus/${prospectusId}/officers/${officerId}`, {
        method: 'DELETE',
      })
      setOfficers(officers.filter((o) => o.id !== officerId))
    } catch (error) {
      console.error('Error deleting officer:', error)
    }
  }

  const handleDeleteShareholder = async (shareholderId: string) => {
    try {
      await fetch(`/api/prospectus/${prospectusId}/shareholders/${shareholderId}`, {
        method: 'DELETE',
      })
      setShareholders(shareholders.filter((s) => s.id !== shareholderId))
    } catch (error) {
      console.error('Error deleting shareholder:', error)
    }
  }

  const openAddModal = (mode: 'director' | 'officer' | 'shareholder') => {
    setAddModalMode(mode)
    setShowAddModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
          <p className="mt-4 text-slate-600">Loading directors and officers...</p>
        </div>
      </div>
    )
  }

  const allItemsMet = regulatoryItems.every((item) => item.isMet)

  return (
    <div className="min-h-screen bg-slate-50" style={{ background: '#F7F6F4', colorScheme: 'light' }}>
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-4xl font-bold text-slate-900">Directors & Officers</h1>
          <p className="text-slate-600">
            Manage board members, executive team, and significant shareholders
          </p>
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

        {/* Board Composition Overview */}
        <BoardCompositionOverview
          directors={directors}
          officers={officers}
          selectedExchange={selectedExchange}
          onAddDirector={() => openAddModal('director')}
        />

        {/* Tabs for Tables and Checklist */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content - 3 columns */}
          <div className="lg:col-span-3 space-y-6">
            <Tabs defaultValue="directors" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="directors">
                  Directors ({directors.length})
                </TabsTrigger>
                <TabsTrigger value="officers">
                  Officers ({officers.length})
                </TabsTrigger>
                <TabsTrigger value="shareholders">
                  Shareholders ({shareholders.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="directors" className="space-y-4">
                <DirectorsTable
                  directors={directors}
                  onEdit={(director) => {
                    // TODO: Implement edit functionality
                    console.log('Edit director:', director)
                  }}
                  onDelete={handleDeleteDirector}
                  onSendPIFInvite={(director) => {
                    // TODO: Implement PIF invite
                    console.log('Send PIF invite:', director)
                  }}
                  onUploadDocument={(director, docType) => {
                    // TODO: Implement document upload
                    console.log('Upload document:', director, docType)
                  }}
                />
              </TabsContent>

              <TabsContent value="officers" className="space-y-4">
                <OfficersTable
                  officers={officers}
                  onEdit={(officer) => {
                    // TODO: Implement edit functionality
                    console.log('Edit officer:', officer)
                  }}
                  onDelete={handleDeleteOfficer}
                  onRegisterSEDI={(officer) => {
                    // TODO: Implement SEDI registration
                    console.log('Register SEDI:', officer)
                  }}
                  onUpdateHoldings={(officer) => {
                    // TODO: Implement holdings update
                    console.log('Update holdings:', officer)
                  }}
                />
              </TabsContent>

              <TabsContent value="shareholders" className="space-y-4">
                <SignificantShareholdersTable
                  shareholders={shareholders}
                  onEdit={(shareholder) => {
                    // TODO: Implement edit functionality
                    console.log('Edit shareholder:', shareholder)
                  }}
                  onDelete={handleDeleteShareholder}
                  onSendPIFInvite={(shareholder) => {
                    // TODO: Implement PIF invite
                    console.log('Send PIF invite:', shareholder)
                  }}
                />
              </TabsContent>
            </Tabs>

            {/* Add buttons for each type */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 pt-4"
            >
              <button
                onClick={() => openAddModal('director')}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all hover:opacity-90"
                style={{ background: '#E8312A' }}
              >
                + Add Director
              </button>
              <button
                onClick={() => openAddModal('officer')}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all hover:opacity-90"
                style={{ background: '#E8312A' }}
              >
                + Add Officer
              </button>
              <button
                onClick={() => openAddModal('shareholder')}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all hover:opacity-90"
                style={{ background: '#E8312A' }}
              >
                + Add Shareholder
              </button>
            </motion.div>
          </div>

          {/* Regulatory Checklist - Sticky Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-6">
              <RegulatoryChecklist
                exchange={selectedExchange}
                items={regulatoryItems}
                allItemsMet={allItemsMet}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Add Person Modal */}
      <AddPersonModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddPerson}
        mode={addModalMode}
        prospectusId={prospectusId}
      />
    </div>
  )
}

// Mock data generators for development
function getMockDirectors(prospectusId: string): Director[] {
  return [
    {
      id: 'dir-1',
      prospectusId,
      name: 'Sarah Johnson',
      role: 'lead-director',
      email: 'sarah.johnson@example.com',
      phone: '+1 (555) 123-4567',
      independence: 'independent',
      committees: ['audit', 'governance'],
      residency: {
        country: 'Canada',
        province: 'ON',
        city: 'Toronto',
        canadianResident: true,
      },
      bio: 'Former CFO of TechCorp with 20+ years in technology and finance',
      pifStatus: 'submitted',
      pifSubmittedDate: new Date('2024-05-15'),
      documents: [{ id: 'd1', name: 'PIF Form', type: 'pif', url: '#', uploadedDate: new Date(), status: 'approved' }],
      yearsExperience: 20,
      expertise: ['Finance', 'Technology', 'Governance'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'dir-2',
      prospectusId,
      name: 'Michael Chen',
      role: 'audit-chair',
      email: 'michael.chen@example.com',
      independence: 'independent',
      committees: ['audit', 'compensation'],
      residency: {
        country: 'Canada',
        province: 'BC',
        city: 'Vancouver',
        canadianResident: true,
      },
      bio: 'Chartered Professional Accountant with audit committee experience',
      pifStatus: 'submitted',
      documents: [{ id: 'd2', name: 'PIF Form', type: 'pif', url: '#', uploadedDate: new Date(), status: 'approved' }],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]
}

function getMockOfficers(prospectusId: string): Officer[] {
  return [
    {
      id: 'off-1',
      prospectusId,
      name: 'Emma Rodriguez',
      title: 'ceo',
      email: 'emma.rodriguez@example.com',
      department: 'Executive',
      sediStatus: 'registered',
      sediRegistrationDate: new Date('2024-04-01'),
      pifStatus: 'submitted',
      holdings: {
        commonShares: 500000,
        options: 100000,
        warrants: 50000,
      },
      documents: [],
      reportableInsider: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'off-2',
      prospectusId,
      name: 'David Thompson',
      title: 'cfo',
      email: 'david.thompson@example.com',
      department: 'Finance',
      sediStatus: 'registered',
      pifStatus: 'submitted',
      holdings: {
        commonShares: 250000,
        options: 75000,
        warrants: 25000,
      },
      documents: [],
      reportableInsider: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]
}

function getMockShareholders(prospectusId: string): SignificantShareholder[] {
  return [
    {
      id: 'sh-1',
      prospectusId,
      name: 'Venture Capital Fund LP',
      ownershipPercentage: 25.5,
      shareCount: 2550000,
      email: 'investors@vcfund.com',
      pifRequired: true,
      pifStatus: 'submitted',
      documents: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]
}

function getMockRegulatoryItems(exchange: string): RegulatoryChecklistItem[] {
  const baseItems = [
    {
      id: '1',
      exchange,
      category: 'board-composition' as const,
      requirement: 'Minimum 2 independent directors',
      isMet: true,
      critical: true,
    },
    {
      id: '2',
      exchange,
      category: 'board-composition' as const,
      requirement: 'Minimum 3 directors total',
      isMet: true,
      critical: true,
    },
    {
      id: '3',
      exchange,
      category: 'committees' as const,
      requirement: 'Audit committee established',
      isMet: true,
      critical: true,
    },
    {
      id: '4',
      exchange,
      category: 'expertise' as const,
      requirement: 'Audit committee financial expert',
      isMet: true,
      critical: true,
    },
    {
      id: '5',
      exchange,
      category: 'committees' as const,
      requirement: 'Compensation committee recommended',
      isMet: true,
      critical: false,
    },
    {
      id: '6',
      exchange,
      category: 'documentation' as const,
      requirement: 'All directors/officers PIFs submitted',
      isMet: true,
      critical: true,
    },
  ]

  return baseItems
}
