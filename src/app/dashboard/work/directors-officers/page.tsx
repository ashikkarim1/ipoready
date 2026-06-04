'use client'

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  AlertCircle,
  Check,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  RefreshCcw,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface BoardMember {
  id: string
  name: string
  role: string
  independence: 'independent' | 'management'
  experience: number
  status: 'complete' | 'pending'
  source?: 'ipoready' | 'manual'
  compensation?: number
  findersFee?: number
}

interface Gap {
  id: string
  type: 'critical' | 'warning' | 'info'
  title: string
  description: string
}

interface Change {
  type: 'added' | 'removed' | 'updated'
  member?: BoardMember
}

const EXCHANGE_REQUIREMENTS = {
  tsxv: {
    name: 'TSXV (TSX Venture)',
    requirements: [
      { id: 'req-1', title: 'Total Directors', count: 3, description: 'Minimum board size', source: 'TSXV Policy 3.1' },
      { id: 'req-2', title: 'Independent Directors', count: 2, description: 'Majority independence', source: 'TSXV Policy 3.2' },
      { id: 'req-3', title: 'Audit Committee', count: 1, description: 'Required (NI 52-110)', source: 'NI 52-110' },
      { id: 'req-4', title: 'Audit Financial Expert', count: 1, description: 'Mandated expertise', source: 'NI 52-110' },
    ],
  },
  tsx: {
    name: 'TSX (Toronto Stock Exchange)',
    requirements: [
      { id: 'req-1', title: 'Total Directors', count: 3, description: 'Minimum board size', source: 'TSX Policy 401' },
      { id: 'req-2', title: 'Independent Directors', count: 2, description: 'Majority independence', source: 'TSX CG' },
      { id: 'req-3', title: 'Audit Committee', count: 1, description: 'Required (NI 52-110)', source: 'NI 52-110' },
      { id: 'req-4', title: 'Audit Financial Expert', count: 1, description: 'Mandated expertise', source: 'NI 52-110' },
    ],
  },
}

const MOCK_BOARD_MEMBERS: BoardMember[] = [
  { id: 'dir-1', name: 'Jennifer Wong', role: 'CEO', independence: 'management', experience: 15, status: 'complete' },
  { id: 'dir-2', name: 'Sarah Chen', role: 'Independent Director', independence: 'independent', experience: 20, status: 'complete' },
]

const STEP_VARIANTS = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 } }

export default function DirectorsOfficersWorkflowPage() {
  const { data: session } = useSession()
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedExchange, setSelectedExchange] = useState('tsxv')
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>(MOCK_BOARD_MEMBERS)
  const [gaps, setGaps] = useState<Gap[]>([])
  const [changes, setChanges] = useState<Change[]>([])
  const [newMemberForm, setNewMemberForm] = useState({ name: '', role: '', independence: 'independent' as 'independent' | 'management', experience: 0 })
  const [loading, setLoading] = useState(false)
  const [prospectusVersion, setProspectusVersion] = useState('v1.2.4')

  useEffect(() => {
    const requirements = EXCHANGE_REQUIREMENTS[selectedExchange as keyof typeof EXCHANGE_REQUIREMENTS]
    if (!requirements) return

    const calculatedGaps: Gap[] = []
    const independentCount = boardMembers.filter(m => m.independence === 'independent').length
    const totalCount = boardMembers.length

    if (totalCount < requirements.requirements[0].count) {
      calculatedGaps.push({
        id: 'gap-1',
        type: 'critical',
        title: `Missing: ${requirements.requirements[0].count - totalCount} Director(s)`,
        description: `You have ${totalCount} directors but need ${requirements.requirements[0].count} minimum`,
      })
    }

    if (independentCount < requirements.requirements[1].count) {
      calculatedGaps.push({
        id: 'gap-2',
        type: 'critical',
        title: `Missing: ${requirements.requirements[1].count - independentCount} Independent Director(s)`,
        description: 'Required for regulatory compliance and governance',
      })
    }

    const hasAuditExpert = boardMembers.some(m => m.independence === 'independent' && m.experience >= 10)
    if (!hasAuditExpert) {
      calculatedGaps.push({
        id: 'gap-3',
        type: 'critical',
        title: 'Missing: Audit Committee Financial Expert',
        description: 'Mandated by NI 52-110 for all public companies',
      })
    }

    setGaps(calculatedGaps)
  }, [boardMembers, selectedExchange])

  const handleAddMember = () => {
    if (!newMemberForm.name || !newMemberForm.role) {
      alert('Please fill in name and role')
      return
    }

    const newMember: BoardMember = {
      id: `dir-${Date.now()}`,
      ...newMemberForm,
      status: 'complete',
      source: 'ipoready',
      compensation: Math.random() * 50000 + 50000,
      findersFee: (Math.random() * 50000 + 50000) * 0.15,
    }

    setBoardMembers([...boardMembers, newMember])
    setChanges([...changes, { type: 'added', member: newMember }])
    setNewMemberForm({ name: '', role: '', independence: 'independent', experience: 0 })
  }

  const handleRemoveMember = (memberId: string) => {
    const member = boardMembers.find(m => m.id === memberId)
    setBoardMembers(boardMembers.filter(m => m.id !== memberId))
    setChanges([...changes, { type: 'removed', member }])
  }

  const handleConfirmSync = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      const newVersion = `v${parseInt(prospectusVersion.split('.').pop() || '0') + 1}`
      setProspectusVersion(newVersion)
      setChanges([])
      setCurrentStep(1)
      alert('Board composition synced to prospectus successfully!')
    } catch (error) {
      console.error('Error syncing:', error)
      alert('Failed to sync changes')
    } finally {
      setLoading(false)
    }
  }

  const handleRevert = () => {
    setBoardMembers(MOCK_BOARD_MEMBERS)
    setChanges([])
  }

  const renderStep1 = () => {
    const requirements = EXCHANGE_REQUIREMENTS[selectedExchange as keyof typeof EXCHANGE_REQUIREMENTS]
    if (!requirements) return null

    return (
      <motion.div
        key="step-1"
        variants={STEP_VARIANTS}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 className="serif text-4xl md:text-4xl text-nav" style={{ marginBottom: '1.5rem' }}>
            Board Composition Requirements
          </h2>
          <p className="text-sm text-text-muted">
            Based on your target exchange: <strong>{requirements.name}</strong>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {requirements.requirements.map((req, idx) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.06 }}
            >
              <div className="card p-6 card-hover" style={{ border: '1px solid #E5E4E0' }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-nav mb-1">{req.title}</h3>
                    <p className="text-xs text-text-muted">{req.description}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#FDECEB' }}>
                    <span className="text-lg font-bold text-accent">
                      {req.count}
                    </span>
                  </div>
                </div>
                <div className="pt-4 mt-4 border-t border-border">
                  <div className="text-xs font-mono text-text-muted">
                    {req.source}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="card p-6" style={{ background: '#FDECEB', border: '1px solid #F5E5E1' }}>
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-accent" />
            <div className="text-sm text-nav">
              <strong>Why these requirements?</strong>
              <p className="text-text-muted" style={{ marginTop: '0.5rem' }}>
                Regulatory bodies require diverse, experienced boards to protect shareholders and ensure proper governance.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  const renderStep2 = () => {
    const criticalGaps = gaps.filter(g => g.type === 'critical').length
    const allMet = gaps.length === 0

    return (
      <motion.div
        key="step-2"
        variants={STEP_VARIANTS}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 className="serif text-4xl md:text-4xl text-nav" style={{ marginBottom: '1.5rem' }}>
            Current Board vs. Requirements
          </h2>
          <p className="text-sm text-text-muted">
            Identify what's missing and what you have
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <div className="card p-6 card-hover" style={{ border: '1px solid #E5E4E0' }}>
              <h3 className="text-base font-semibold text-nav mb-4">Current Board Roster</h3>
              <div className="space-y-3">
                {boardMembers.length === 0 ? (
                  <div className="text-center py-6 text-sm text-text-muted">
                    No board members yet
                  </div>
                ) : (
                  <div className="space-y-2">
                    {boardMembers.map(member => (
                      <motion.div
                        key={member.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-3 rounded-lg flex items-center justify-between group"
                        style={{ background: '#F7F6F4' }}
                      >
                        <div className="flex-1">
                          <div className="font-semibold text-sm text-nav">
                            {member.name}
                          </div>
                          <div className="text-xs flex items-center gap-2 mt-1 text-text-muted">
                            <span>{member.role}</span>
                            {member.independence === 'independent' && (
                              <span className="pill px-2 py-0.5" style={{ background: '#EAF5F0', color: '#2D7A5F' }}>
                                Independent
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-success" />
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition-all"
                          >
                            <Trash2 className="w-4 h-4 text-accent" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
            <div className="space-y-4">
              {criticalGaps > 0 ? (
                <div className="card p-6" style={{ background: '#FDECEB', borderColor: '#F5E5E1', border: '1px solid #F5E5E1' }}>
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-accent" />
                    <div>
                      <div className="font-semibold text-sm mb-2 text-accent">
                        {criticalGaps} Critical Gap{criticalGaps > 1 ? 's' : ''}
                      </div>
                      <div className="space-y-1">
                        {gaps.map(gap => (
                          <div key={gap.id} className="text-xs text-nav">
                            <strong>• {gap.title}</strong>
                            <div className="text-text-muted">{gap.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="card p-6" style={{ background: '#EAF5F0', border: '1px solid #D5EDE8' }}>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5 text-success" />
                    <div>
                      <div className="font-semibold text-sm text-success">
                        All Requirements Met
                      </div>
                      <div className="text-xs mt-1 text-text-muted">
                        Your board meets all regulatory requirements
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="card p-6 card-hover" style={{ border: '1px solid #E5E4E0' }}>
                <h3 className="text-sm font-semibold text-nav mb-4">Timeline</h3>
                <div className="text-xs space-y-2 text-text-muted">
                  <div className="flex items-center justify-between">
                    <span>Time to fill gaps:</span>
                    <strong className="text-nav">60-90 days</strong>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    )
  }

  const renderStep3 = () => {
    return (
      <motion.div
        key="step-3"
        variants={STEP_VARIANTS}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 className="serif text-4xl md:text-4xl text-nav" style={{ marginBottom: '1.5rem' }}>
            Close the Gaps
          </h2>
          <p className="text-sm text-text-muted">
            Add board members to meet requirements
          </p>
        </div>

        {gaps.length > 0 && (
          <div className="card p-6" style={{ background: '#FEF3C7', border: '1px solid #FCD34D' }}>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#B45309' }} />
              <div className="text-xs text-nav">
                <strong>Remaining gaps: </strong>
                {gaps.map(g => g.title).join(' • ')}
              </div>
            </div>
          </div>
        )}

        <div className="card p-6 card-hover" style={{ border: '1px solid #E5E4E0' }}>
          <h3 className="text-base font-semibold text-nav mb-6">Add Board Member</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-2 text-nav">
                  Name
                </label>
                <input
                  type="text"
                  value={newMemberForm.name}
                  onChange={e => setNewMemberForm({ ...newMemberForm, name: e.target.value })}
                  placeholder="Full name"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none"
                  style={{ borderColor: '#E5E4E0' }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2 text-nav">
                  Role
                </label>
                <input
                  type="text"
                  value={newMemberForm.role}
                  onChange={e => setNewMemberForm({ ...newMemberForm, role: e.target.value })}
                  placeholder="e.g., Independent Director"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none"
                  style={{ borderColor: '#E5E4E0' }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2 text-nav">
                  Independence
                </label>
                <select
                  value={newMemberForm.independence || ''}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, independence: e.target.value as 'independent' | 'management' })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none text-nav"
                  style={{ borderColor: '#E5E4E0' }}
                >
                  <option value="independent">Independent</option>
                  <option value="management">Management</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2 text-nav">
                  Years Experience
                </label>
                <input
                  type="number"
                  value={newMemberForm.experience}
                  onChange={e => setNewMemberForm({ ...newMemberForm, experience: parseInt(e.target.value) || 0 })}
                  placeholder="e.g., 15"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none"
                  style={{ borderColor: '#E5E4E0' }}
                />
              </div>
            </div>

            <Button
              onClick={handleAddMember}
              className="btn btn-accent gap-2 font-semibold px-6 py-2.5 rounded-full w-full"
            >
              <Plus className="w-4 h-4" />
              Add Member
            </Button>
          </div>
        </div>
      </motion.div>
    )
  }

  const renderStep4 = () => {
    const totalFeesDue = boardMembers
      .filter((m) => m.source === 'ipoready')
      .reduce((sum, m) => sum + (m.findersFee || 0), 0)

    return (
      <motion.div
        key="step-4"
        variants={STEP_VARIANTS}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 className="serif text-4xl md:text-4xl text-nav" style={{ marginBottom: '1.5rem' }}>
            Review & Confirm
          </h2>
          <p className="text-sm text-text-muted">
            Version control — you can revert changes anytime
          </p>
        </div>

        <div className="card p-6 card-hover" style={{ border: '1px solid #E5E4E0' }}>
          <h3 className="text-base font-semibold text-nav mb-4">Changes Summary</h3>
          <div className="space-y-4">
            {changes.length === 0 ? (
              <p className="text-sm text-center py-6 text-text-muted">
                No changes yet
              </p>
            ) : (
              <div className="space-y-3">
                {changes.map((change, idx) => (
                  <motion.div key={idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-lg text-xs" style={{ background: '#F7F6F4' }}>
                    {change.type === 'added' ? (
                      <div className="flex items-start gap-2">
                        <Plus className="w-4 h-4 mt-0.5 text-success" />
                        <div>
                          <strong className="text-nav">Added:</strong>
                          <div className="text-text-muted">
                            {change.member?.name} as {change.member?.role}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2">
                        <Trash2 className="w-4 h-4 mt-0.5 text-accent" />
                        <div>
                          <strong className="text-nav">Removed:</strong>
                          <div className="text-text-muted">{change.member?.name}</div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card p-6 card-hover" style={{ border: '1px solid #E5E4E0' }}>
          <h3 className="text-base font-semibold text-nav mb-4">Version Control</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-semibold mb-1 text-text-muted">
                  Current Version
                </div>
                <div className="text-lg font-bold text-nav">
                  {prospectusVersion}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold mb-1 text-text-muted">
                  New Version
                </div>
                <div className="text-lg font-bold text-accent">
                  v{parseInt(prospectusVersion.split('.').pop() || '0') + 1}
                </div>
              </div>
            </div>

            <Button
              onClick={handleRevert}
              className="btn btn-secondary w-full text-xs"
              style={{ borderColor: '#E5E4E0', color: '#717171' }}
            >
              <RefreshCcw className="w-3 h-3" />
              Revert to {prospectusVersion}
            </Button>
          </div>
        </div>

        {totalFeesDue > 0 && (
          <div className="card p-6" style={{ background: '#FDECEB', border: '1px solid #F5E5E1' }}>
            <div className="space-y-2">
              <div className="text-sm font-semibold text-nav">
                IPOReady Service Fees
              </div>
              <div className="text-xs space-y-1 text-text-muted">
                <div className="flex items-center justify-between">
                  <span>Professionals hired:</span>
                  <strong className="text-accent">
                    {boardMembers.filter(m => m.source === 'ipoready').length}
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total finders fees (15%):</span>
                  <strong className="text-accent">
                    ${totalFeesDue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            onClick={() => setCurrentStep(3)}
            className="btn btn-secondary flex-1"
            style={{ borderColor: '#E5E4E0', color: '#1A1A1A' }}
          >
            Back to Edit
          </Button>
          <Button
            onClick={handleConfirmSync}
            disabled={loading}
            className="btn btn-accent flex-1 font-semibold px-6 py-2.5 rounded-full"
          >
            {loading ? 'Syncing...' : 'Confirm & Sync'}
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <div style={{ background: '#F7F6F4', minHeight: '100vh' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 lg:py-16 space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="pill px-4 py-2 text-sm font-semibold" style={{ background: '#FDECEB', color: '#E8312A' }}>
              <Users className="w-3 h-3 inline mr-1.5" />
              Board Requirements Analyzer
            </div>
          </div>
          <h1 className="serif text-4xl md:text-5xl text-nav" style={{ marginBottom: '1.5rem' }}>
            Build Your Board
          </h1>
          <p className="text-sm text-text-muted">
            Follow the workflow to identify gaps, fill them, and sync to your prospectus
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex items-center justify-between max-w-2xl">
          {[1, 2, 3, 4].map((step, idx) => (
            <React.Fragment key={step}>
              <motion.button
                onClick={() => setCurrentStep(step)}
                whileHover={{ scale: 1.05 }}
                className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm cursor-pointer transition-all"
                style={{
                  background: currentStep === step ? '#E8312A' : currentStep > step ? '#2D7A5F' : '#E5E4E0',
                  color: currentStep === step || currentStep > step ? 'white' : '#717171',
                }}
              >
                {currentStep > step ? <Check className="w-5 h-5" /> : step}
              </motion.button>
              {idx < 3 && (
                <div
                  className="flex-1 h-1 mx-2 rounded-full"
                  style={{
                    background: currentStep > step + 1 ? '#2D7A5F' : '#E5E4E0',
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center gap-4">
            <label className="text-sm font-semibold text-nav">
              Target Exchange:
            </label>
            <select
              value={selectedExchange}
              onChange={e => setSelectedExchange(e.target.value)}
              className="px-4 py-2 border rounded-lg text-sm focus:outline-none font-medium text-nav"
              style={{ borderColor: '#E5E4E0' }}
            >
              <option value="tsxv">TSXV (TSX Venture)</option>
              <option value="tsx">TSX (Toronto Stock Exchange)</option>
            </select>
          </div>
        </motion.div>

        <div className="min-h-96">
          <AnimatePresence mode="wait">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </AnimatePresence>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex items-center justify-between pt-6 border-t" style={{ borderColor: '#E5E4E0' }}>
          <Button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="btn btn-secondary"
            style={{
              borderColor: '#E5E4E0',
              color: currentStep === 1 ? '#C9C7C4' : '#1A1A1A',
            }}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          <div className="text-xs font-semibold text-center text-text-muted">
            Step {currentStep} of 4
          </div>

          <Button
            onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
            disabled={currentStep === 4}
            className="btn btn-accent font-semibold px-6 py-2.5 rounded-full"
            style={{ opacity: currentStep === 4 ? '0.5' : '1' }}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
