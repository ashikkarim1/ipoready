'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Loader2,
  AlertCircle,
  Plus,
  FileText,
  Download,
  Check,
  Clock,
  Archive,
  ChevronRight,
  Users,
  Calendar,
  Badge,
  Filter,
  Search,
  Edit2,
  Copy,
  Eye,
  Trash2,
  CheckCircle2,
  XCircle,
} from 'lucide-react'

// ============================================================================
// TYPES & SCHEMAS
// ============================================================================

type ResolutionStatus = 'draft' | 'approved' | 'executed' | 'archived' | 'rejected'
type ResolutionType = 'stock_split' | 'board_appointment' | 'option_pool' | 'warrant_cancellation' | 'prospectus_approval' | 'listing_approval' | 'underwriting_authorization' | 'material_contracts' | 'series_issuance' | 'preferred_conversion'

interface BoardMember {
  name: string
  title: string
  approved?: boolean
  approvalDate?: string
}

interface Resolution {
  id: string
  type: ResolutionType
  title: string
  description: string
  status: ResolutionStatus
  createdDate: string
  effectiveDate?: string
  approvalCount: number
  totalBoardMembers: number
  boardMembers: BoardMember[]
  content: string
  tags: string[]
}

interface ResolutionTemplate {
  id: string
  type: ResolutionType
  name: string
  description: string
  category: 'capital' | 'governance' | 'listing' | 'compliance'
  requiredForExchange?: string[]
  placeholders: string[]
}

const ResolutionSchema = z.object({
  type: z.enum([
    'stock_split',
    'board_appointment',
    'option_pool',
    'warrant_cancellation',
    'prospectus_approval',
    'listing_approval',
    'underwriting_authorization',
    'material_contracts',
    'series_issuance',
    'preferred_conversion',
  ]),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  effectiveDate: z.string().optional(),
  boardMembers: z.array(z.string()).min(1, 'At least one board member is required'),
})

type ResolutionFormData = z.infer<typeof ResolutionSchema>

// ============================================================================
// RESOLUTION TEMPLATES
// ============================================================================

const RESOLUTION_TEMPLATES: ResolutionTemplate[] = [
  {
    id: 'tpl-stock-split',
    type: 'stock_split',
    name: 'Stock Split',
    description: 'Adjust share structure for capital raise or IPO readiness',
    category: 'capital',
    placeholders: ['split_ratio', 'effective_date', 'new_shares_outstanding'],
    requiredForExchange: [],
  },
  {
    id: 'tpl-board-appt',
    type: 'board_appointment',
    name: 'Board Appointment',
    description: 'Appoint new director to Board of Directors',
    category: 'governance',
    placeholders: ['director_name', 'director_title', 'effective_date'],
    requiredForExchange: [],
  },
  {
    id: 'tpl-option-pool',
    type: 'option_pool',
    name: 'Option Pool Increase',
    description: 'Increase or establish equity incentive pool for employees',
    category: 'capital',
    placeholders: ['new_pool_size', 'vesting_schedule', 'strike_price'],
    requiredForExchange: [],
  },
  {
    id: 'tpl-warrant-cancel',
    type: 'warrant_cancellation',
    name: 'Warrant Cancellation',
    description: 'Cancel outstanding warrants for clean capitalization table',
    category: 'capital',
    placeholders: ['warrant_count', 'cancellation_date', 'holder_names'],
    requiredForExchange: [],
  },
  {
    id: 'tpl-prospectus',
    type: 'prospectus_approval',
    name: 'Prospectus Approval',
    description: 'Approve prospectus filing with securities regulators',
    category: 'listing',
    placeholders: ['prospectus_title', 'filing_jurisdictions', 'underwriter_names'],
    requiredForExchange: ['TSX', 'NASDAQ', 'NYSE', 'CSE'],
  },
  {
    id: 'tpl-listing',
    type: 'listing_approval',
    name: 'Listing Approval',
    description: 'Authorize listing application to exchange',
    category: 'listing',
    placeholders: ['target_exchange', 'listing_date', 'symbol'],
    requiredForExchange: ['TSX', 'NASDAQ', 'NYSE', 'CSE', 'TSXV'],
  },
  {
    id: 'tpl-underwriting',
    type: 'underwriting_authorization',
    name: 'Underwriting Authorization',
    description: 'Authorize engagement of underwriters for public offering',
    category: 'listing',
    placeholders: ['underwriter_names', 'offering_size', 'commission_rate'],
    requiredForExchange: ['TSX', 'NASDAQ', 'NYSE'],
  },
  {
    id: 'tpl-material-contract',
    type: 'material_contracts',
    name: 'Material Contract Approval',
    description: 'Approve material contract requiring board authorization',
    category: 'compliance',
    placeholders: ['contract_description', 'counterparty', 'contract_value', 'term'],
    requiredForExchange: [],
  },
  {
    id: 'tpl-series-issuance',
    type: 'series_issuance',
    name: 'Series Issuance Authorization',
    description: 'Authorize issuance of new series of preferred shares',
    category: 'capital',
    placeholders: ['series_letter', 'share_count', 'price_per_share', 'terms'],
    requiredForExchange: [],
  },
  {
    id: 'tpl-preferred-conversion',
    type: 'preferred_conversion',
    name: 'Preferred Conversion to Common',
    description: 'Authorize conversion of preferred shares to common shares',
    category: 'capital',
    placeholders: ['series_letters', 'conversion_ratio', 'conversion_date'],
    requiredForExchange: [],
  },
]

// ============================================================================
// SAMPLE RESOLUTIONS (Demo Data)
// ============================================================================

const SAMPLE_RESOLUTIONS: Resolution[] = [
  {
    id: 'res-001',
    type: 'preferred_conversion',
    title: 'Resolution to Convert Series A-1 Preferred Shares to Common',
    description: 'Authorization for conversion of all outstanding Series A-1 preferred shares into common shares at conversion ratio of 1:1',
    status: 'executed',
    createdDate: '2026-03-15',
    effectiveDate: '2026-03-20',
    approvalCount: 5,
    totalBoardMembers: 5,
    boardMembers: [
      { name: 'Sarah Chen, CEO', title: 'Director', approved: true, approvalDate: '2026-03-15' },
      { name: 'Michael Rodriguez, VC Partner', title: 'Director', approved: true, approvalDate: '2026-03-15' },
      { name: 'Jennifer Park, CFO', title: 'Director', approved: true, approvalDate: '2026-03-16' },
      { name: 'David Thompson, Independent', title: 'Director', approved: true, approvalDate: '2026-03-17' },
      { name: 'Lisa Anderson, Lead Investor', title: 'Director', approved: true, approvalDate: '2026-03-17' },
    ],
    content: 'WHEREAS, the Board of Directors has determined that conversion of Series A-1 Preferred Shares to Common Shares is in the best interest of the Company and its shareholders for IPO readiness; NOW BE IT RESOLVED that all outstanding Series A-1 Preferred Shares shall be converted to Common Shares at a ratio of 1:1 effective March 20, 2026.',
    tags: ['IPO-Ready', 'Capitalization', 'Pre-IPO'],
  },
  {
    id: 'res-002',
    type: 'option_pool',
    title: 'Resolution to Increase Employee Stock Option Pool to 8%',
    description: 'Authorization to establish and increase equity incentive option pool to 8% of post-IPO capitalization for employee retention',
    status: 'approved',
    createdDate: '2026-03-18',
    effectiveDate: '2026-03-25',
    approvalCount: 5,
    totalBoardMembers: 5,
    boardMembers: [
      { name: 'Sarah Chen, CEO', title: 'Director', approved: true, approvalDate: '2026-03-18' },
      { name: 'Michael Rodriguez, VC Partner', title: 'Director', approved: true, approvalDate: '2026-03-18' },
      { name: 'Jennifer Park, CFO', title: 'Director', approved: true, approvalDate: '2026-03-19' },
      { name: 'David Thompson, Independent', title: 'Director', approved: true, approvalDate: '2026-03-20' },
      { name: 'Lisa Anderson, Lead Investor', title: 'Director', approved: true, approvalDate: '2026-03-20' },
    ],
    content: 'WHEREAS, the Board recognizes the importance of competitive equity compensation for recruitment and retention of key talent; NOW BE IT RESOLVED that the 2024 Equity Incentive Plan is amended to increase the option pool reserve from 5% to 8% of fully-diluted shares outstanding on an as-converted basis.',
    tags: ['Compensation', 'Employee-Retention', 'Equity'],
  },
  {
    id: 'res-003',
    type: 'board_appointment',
    title: 'Resolution to Appoint Independent Director - Audit Committee',
    description: 'Election of Dr. Michael Foster as Independent Director and Chair of Audit Committee',
    status: 'approved',
    createdDate: '2026-02-28',
    effectiveDate: '2026-03-01',
    approvalCount: 5,
    totalBoardMembers: 5,
    boardMembers: [
      { name: 'Sarah Chen, CEO', title: 'Director', approved: true, approvalDate: '2026-02-28' },
      { name: 'Michael Rodriguez, VC Partner', title: 'Director', approved: true, approvalDate: '2026-02-28' },
      { name: 'Jennifer Park, CFO', title: 'Director', approved: true, approvalDate: '2026-02-28' },
      { name: 'David Thompson, Independent', title: 'Director', approved: true, approvalDate: '2026-02-28' },
      { name: 'Lisa Anderson, Lead Investor', title: 'Director', approved: true, approvalDate: '2026-02-28' },
    ],
    content: 'WHEREAS, the Board of Directors has identified Dr. Michael Foster as a candidate qualified to serve as an Independent Director; NOW BE IT RESOLVED that Dr. Michael Foster is elected to the Board of Directors, effective immediately, and appointed as Chair of the Audit Committee.',
    tags: ['Governance', 'Board-Composition', 'Compliance'],
  },
  {
    id: 'res-004',
    type: 'stock_split',
    title: 'Resolution for 3:1 Share Split',
    description: 'Authorization for three-for-one share split to increase tradeable share count and enhance market liquidity',
    status: 'draft',
    createdDate: '2026-04-01',
    approvalCount: 2,
    totalBoardMembers: 5,
    boardMembers: [
      { name: 'Sarah Chen, CEO', title: 'Director', approved: true, approvalDate: '2026-04-01' },
      { name: 'Michael Rodriguez, VC Partner', title: 'Director', approved: true, approvalDate: '2026-04-01' },
      { name: 'Jennifer Park, CFO', title: 'Director', approved: false },
      { name: 'David Thompson, Independent', title: 'Director', approved: false },
      { name: 'Lisa Anderson, Lead Investor', title: 'Director', approved: false },
    ],
    content: 'WHEREAS, the Board believes a three-for-one share split would enhance share tradability and reduce trading price; NOW BE IT RESOLVED that each outstanding share shall be split into three shares, effective on the record date to be determined by management.',
    tags: ['Capitalization', 'Pending-Approval'],
  },
  {
    id: 'res-005',
    type: 'warrant_cancellation',
    title: 'Resolution to Cancel Outstanding Investor Warrants',
    description: 'Cancellation of Series A and B investor warrants to clean capitalization table pre-IPO',
    status: 'draft',
    createdDate: '2026-04-05',
    approvalCount: 1,
    totalBoardMembers: 5,
    boardMembers: [
      { name: 'Sarah Chen, CEO', title: 'Director', approved: true, approvalDate: '2026-04-05' },
      { name: 'Michael Rodriguez, VC Partner', title: 'Director', approved: false },
      { name: 'Jennifer Park, CFO', title: 'Director', approved: false },
      { name: 'David Thompson, Independent', title: 'Director', approved: false },
      { name: 'Lisa Anderson, Lead Investor', title: 'Director', approved: false },
    ],
    content: 'WHEREAS, the Company has outstanding investor warrants that complicate the capitalization table; NOW BE IT RESOLVED that all Series A and Series B investor warrants shall be cancelled effective immediately, with such cancellation being approved by affected warrant holders.',
    tags: ['Capitalization', 'Pending-Approval', 'Warrant-Cleanup'],
  },
]

// ============================================================================
// STATUS STYLING
// ============================================================================

const STATUS_CONFIG: Record<ResolutionStatus, { color: string; icon: React.ReactNode; label: string }> = {
  draft: {
    color: 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100',
    icon: <Clock className="w-4 h-4" />,
    label: 'Draft',
  },
  approved: {
    color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100',
    icon: <Check className="w-4 h-4" />,
    label: 'Approved',
  },
  executed: {
    color: 'bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100',
    icon: <CheckCircle2 className="w-4 h-4" />,
    label: 'Executed',
  },
  archived: {
    color: 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300',
    icon: <Archive className="w-4 h-4" />,
    label: 'Archived',
  },
  rejected: {
    color: 'bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-100',
    icon: <XCircle className="w-4 h-4" />,
    label: 'Rejected',
  },
}

// ============================================================================
// COMPONENTS
// ============================================================================

interface ResolutionWizardProps {
  onClose: () => void
  onSubmit: (data: ResolutionFormData) => void
  isSubmitting: boolean
}

function ResolutionWizard({ onClose, onSubmit, isSubmitting }: ResolutionWizardProps) {
  const [step, setStep] = useState(1)
  const [selectedTemplate, setSelectedTemplate] = useState<ResolutionTemplate | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ResolutionFormData>({
    resolver: zodResolver(ResolutionSchema) as any,
    defaultValues: {
      boardMembers: [],
    },
  })

  const boardMembersInput = watch('boardMembers')

  const handleSelectTemplate = (template: ResolutionTemplate) => {
    setSelectedTemplate(template)
    setValue('type', template.type)
    setStep(2)
  }

  const addBoardMember = (name: string) => {
    if (name.trim() && !boardMembersInput.includes(name)) {
      setValue('boardMembers', [...boardMembersInput, name])
    }
  }

  const removeBoardMember = (index: number) => {
    setValue(
      'boardMembers',
      boardMembersInput.filter((_, i) => i !== index)
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-start justify-between">
          <div>
            <h2 className="h4 font-bold text-nav">Create New Resolution</h2>
            <p className="body-sm text-text-secondary mt-1">Step {step} of 3: {step === 1 ? 'Select Template' : step === 2 ? 'Configure Details' : 'Review & Approve'}</p>
          </div>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary transition"
            title="Close"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="h4 font-semibold text-nav mb-4">Choose a Resolution Template</h3>
              <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                {RESOLUTION_TEMPLATES.map(template => (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-gray-50 text-left transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-nav">{template.name}</h4>
                        <p className="body-sm text-text-secondary mt-1">{template.description}</p>
                        {template.requiredForExchange && template.requiredForExchange.length > 0 && (
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {template.requiredForExchange.map(exchange => (
                              <span key={exchange} className="caption-sm bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                Required for {exchange}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && selectedTemplate && (
            <form
              onSubmit={() => {
                setStep(3)
              }}
              className="space-y-6"
            >
              <div>
                <label className="block label font-semibold text-nav mb-2">Template</label>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="label font-medium text-nav">{selectedTemplate.name}</p>
                  <p className="caption-sm text-text-secondary mt-1">{selectedTemplate.description}</p>
                </div>
              </div>

              <div>
                <label className="block label font-semibold text-nav mb-2">Resolution Title</label>
                <input
                  {...register('title')}
                  type="text"
                  placeholder="e.g., Authorization for 3:1 Share Split"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-nav placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                {errors.title && <p className="text-red-500 body-sm mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label className="block label font-semibold text-nav mb-2">Description</label>
                <textarea
                  {...register('description')}
                  rows={4}
                  placeholder="Describe the purpose and rationale for this resolution..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-nav placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                {errors.description && <p className="text-red-500 body-sm mt-1">{errors.description.message}</p>}
              </div>

              <div>
                <label className="block label font-semibold text-nav mb-2">Effective Date (Optional)</label>
                <input
                  {...register('effectiveDate')}
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-nav focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block label font-semibold text-nav mb-3">Board Members for Approval</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Enter board member name..."
                    onKeyPress={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addBoardMember((e.target as HTMLInputElement).value)
                        ;(e.target as HTMLInputElement).value = ''
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-nav placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                {boardMembersInput.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {boardMembersInput.map((member, idx) => (
                      <div key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full flex items-center gap-2">
                        <span className="body-sm">{member}</span>
                        <button
                          type="button"
                          onClick={() => removeBoardMember(idx)}
                          className="hover:text-gray-900"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {errors.boardMembers && <p className="text-red-500 body-sm mt-1">{errors.boardMembers.message}</p>}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-nav hover:bg-gray-50 transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary hover:opacity-90 text-white rounded-lg transition"
                >
                  Continue to Review
                </button>
              </div>
            </form>
          )}

          {step === 3 && selectedTemplate && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <h3 className="font-semibold text-nav mb-4">Review Resolution Details</h3>
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="label-sm font-semibold text-text-secondary uppercase">Template</p>
                    <p className="text-nav font-medium">{selectedTemplate.name}</p>
                  </div>
                  <div>
                    <p className="label-sm font-semibold text-text-secondary uppercase">Title</p>
                    <p className="text-nav">{watch('title')}</p>
                  </div>
                  <div>
                    <p className="label-sm font-semibold text-text-secondary uppercase">Description</p>
                    <p className="text-nav body-sm">{watch('description')}</p>
                  </div>
                  <div>
                    <p className="label-sm font-semibold text-text-secondary uppercase">Board Members</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {boardMembersInput.map((member, idx) => (
                        <span key={idx} className="body-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                          {member}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-nav hover:bg-gray-50 transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-primary hover:opacity-90 disabled:opacity-50 text-white rounded-lg transition flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Resolution
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

interface ResolutionDetailProps {
  resolution: Resolution
  onClose: () => void
}

function ResolutionDetail({ resolution, onClose }: ResolutionDetailProps) {
  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="h4 font-bold text-nav">{resolution.title}</h2>
            <p className="body-sm text-text-secondary mt-1">Created {resolution.createdDate}</p>
          </div>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary transition"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status & Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="label-sm font-semibold text-text-secondary uppercase">Status</p>
              <div className="flex items-center gap-2 mt-2">
                {STATUS_CONFIG[resolution.status].icon}
                <span className="font-medium text-nav">{STATUS_CONFIG[resolution.status].label}</span>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="label-sm font-semibold text-text-secondary uppercase">Approvals</p>
              <p className="text-2xl font-bold text-nav mt-2">
                {resolution.approvalCount}/{resolution.totalBoardMembers}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="label-sm font-semibold text-text-secondary uppercase">Effective Date</p>
              <p className="text-nav font-medium mt-2">
                {resolution.effectiveDate ? new Date(resolution.effectiveDate).toLocaleDateString() : 'Pending'}
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-nav mb-2">Description</h3>
            <p className="text-text-primary">{resolution.description}</p>
          </div>

          {/* Resolution Content */}
          <div>
            <h3 className="font-semibold text-nav mb-2">Resolution Text</h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-64 overflow-y-auto">
              <p className="body-sm text-text-primary font-mono whitespace-pre-wrap">{resolution.content}</p>
            </div>
          </div>

          {/* Board Members & Approvals */}
          <div>
            <h3 className="font-semibold text-nav mb-3">Board Member Approvals</h3>
            <div className="space-y-2">
              {resolution.boardMembers.map((member, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <p className="font-medium text-nav">{member.name}</p>
                    <p className="caption-sm text-text-secondary">{member.title}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {member.approved ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <span className="caption-sm text-green-600">{member.approvalDate}</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-5 h-5 text-gray-400" />
                        <span className="caption-sm text-gray-500">Pending</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-nav hover:bg-gray-50 transition flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              Export as PDF
            </button>
            <button className="flex-1 px-4 py-2 bg-primary hover:opacity-90 text-white rounded-lg transition flex items-center justify-center gap-2">
              <Copy className="w-4 h-4" />
              Duplicate
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ResolutionsManager2C1() {
  const [resolutions, setResolutions] = useState<Resolution[]>(SAMPLE_RESOLUTIONS)
  const [showWizard, setShowWizard] = useState(false)
  const [selectedResolution, setSelectedResolution] = useState<Resolution | null>(null)
  const [filterStatus, setFilterStatus] = useState<ResolutionStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ResolutionFormData>({
    resolver: zodResolver(ResolutionSchema) as any,
  })

  const handleCreateResolution = async (data: ResolutionFormData) => {
    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      const newResolution: Resolution = {
        id: `res-${Date.now()}`,
        type: data.type,
        title: data.title,
        description: data.description,
        status: 'draft',
        createdDate: new Date().toISOString().split('T')[0],
        effectiveDate: data.effectiveDate,
        approvalCount: 0,
        totalBoardMembers: data.boardMembers.length,
        boardMembers: data.boardMembers.map(name => ({
          name,
          title: 'Director',
          approved: false,
        })),
        content: `Board Resolution - ${data.title}\n\n${data.description}`,
        tags: ['New'],
      }

      setResolutions([newResolution, ...resolutions])
      setShowWizard(false)
      reset()
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredResolutions = resolutions.filter(res => {
    const statusMatch = filterStatus === 'all' || res.status === filterStatus
    const searchMatch =
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.type.toLowerCase().includes(searchQuery.toLowerCase())
    return statusMatch && searchMatch
  })

  const stats = {
    total: resolutions.length,
    draft: resolutions.filter(r => r.status === 'draft').length,
    approved: resolutions.filter(r => r.status === 'approved').length,
    executed: resolutions.filter(r => r.status === 'executed').length,
  }

  return (
    <div className="min-h-screen p-6" style={{ background: '#F7F6F4', colorScheme: 'light' }}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Board Resolutions</h1>
            <p className="text-slate-600">Create, track, and manage board resolutions for IPO readiness</p>
          </div>
          <button
            onClick={() => setShowWizard(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            New Resolution
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <p className="label font-semibold text-slate-600">Total Resolutions</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <p className="label font-semibold text-slate-600">Draft</p>
            <p className="text-3xl font-bold text-slate-500 mt-2">{stats.draft}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <p className="label font-semibold text-slate-600">Approved</p>
            <p className="text-3xl font-bold text-amber-600 mt-2">{stats.approved}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <p className="label font-semibold text-slate-600">Executed</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.executed}</p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search resolutions..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <Filter className="w-5 h-5 text-slate-400" />
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as ResolutionStatus | 'all')}
                className="px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="approved">Approved</option>
                <option value="executed">Executed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>

        {/* Resolutions List */}
        {filteredResolutions.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center border border-slate-200">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 h4">
              {searchQuery || filterStatus !== 'all' ? 'No resolutions match your filters' : 'No resolutions yet. Create one to get started.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredResolutions.map(resolution => (
              <button
                key={resolution.id}
                onClick={() => setSelectedResolution(resolution)}
                className="w-full bg-white rounded-lg p-4 border border-slate-200 hover:border-blue-500 hover:shadow-md transition text-left"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-slate-900 h4">{resolution.title}</h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[resolution.status].color}`}>
                        {STATUS_CONFIG[resolution.status].icon}
                        {STATUS_CONFIG[resolution.status].label}
                      </span>
                    </div>
                    <p className="text-slate-600 body-sm mb-2">{resolution.description}</p>
                    <div className="flex items-center gap-4 caption-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Created {resolution.createdDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {resolution.approvalCount}/{resolution.totalBoardMembers} approvals
                      </span>
                      <div className="flex gap-1">
                        {resolution.tags.map(tag => (
                          <span key={tag} className="bg-slate-100 px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Wizard Modal */}
      {showWizard && (
        <ResolutionWizard
          onClose={() => setShowWizard(false)}
          onSubmit={(data) => handleCreateResolution(data)}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Detail Modal */}
      {selectedResolution && (
        <ResolutionDetail
          resolution={selectedResolution}
          onClose={() => setSelectedResolution(null)}
        />
      )}
    </div>
  )
}

export default ResolutionsManager2C1
