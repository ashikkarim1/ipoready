'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Loader2,
  AlertCircle,
  Plus,
  Download,
  Eye,
  Edit3,
  Copy,
  History,
  Check,
  X,
  FileText,
  Users,
  DollarSign,
  Calendar,
  ChevronDown,
} from 'lucide-react'

const TemplateSchema = z.object({
  agreement_type: z.enum(['firm_commitment', 'best_efforts', 'standby', 'all_or_none']),
  agreement_name: z.string().min(1, 'Template name is required'),
  description: z.string(),
  lead_underwriter: z.string().min(1, 'Lead underwriter required'),
  member_count: z.number().min(1),
  gross_spread_bps: z.number().min(0).max(1000),
  lockup_period_days: z.number().min(0),
  allocation_structure: z.string(),
})

type TemplateFormData = z.infer<typeof TemplateSchema>

interface SyndicationTemplate {
  id: string
  agreement_type: string
  agreement_name: string
  description: string
  lead_underwriter: string
  member_count: number
  gross_spread_bps: number
  lockup_period_days: number
  allocation_structure: Record<string, number>
  status: 'draft' | 'active' | 'archived'
  created_at: string
  updated_at: string
  version: number
}

interface TemplateVersion {
  id: string
  template_id: string
  version: number
  changes: string
  created_at: string
  created_by: string
}

interface AgreementPreview {
  template_id: string
  template: SyndicationTemplate
  generated_at: string
}

const AGREEMENT_TYPES = {
  firm_commitment: { label: 'Firm Commitment', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100' },
  best_efforts: { label: 'Best Efforts', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100' },
  standby: { label: 'Standby', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100' },
  all_or_none: { label: 'All or None', color: 'bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-100' },
}

const STATUS_COLORS = {
  draft: 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white',
  active: 'bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100',
  archived: 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100',
}

export function SyndicationTemplates() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [templates, setTemplates] = useState<SyndicationTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<SyndicationTemplate | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<SyndicationTemplate | null>(null)
  const [versions, setVersions] = useState<TemplateVersion[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<TemplateFormData>({
    resolver: zodResolver(TemplateSchema) as any,
  })

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/syndication/templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates || SAMPLE_TEMPLATES)
      } else {
        setTemplates(SAMPLE_TEMPLATES)
      }
    } catch (err) {
      console.error('Error fetching templates:', err)
      setTemplates(SAMPLE_TEMPLATES)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchVersionHistory = async (templateId: string) => {
    try {
      const response = await fetch(`/api/syndication/templates/${templateId}/versions`)
      if (response.ok) {
        const data = await response.json()
        setVersions(data.versions || [])
      }
    } catch (err) {
      console.error('Error fetching versions:', err)
    }
  }

  const onSubmit = async (data: TemplateFormData) => {
    setIsSubmitting(true)
    try {
      const payload = {
        ...data,
        allocation_structure: JSON.parse(data.allocation_structure),
      }

      const method = editingTemplate ? 'PUT' : 'POST'
      const url = editingTemplate ? `/api/syndication/templates/${editingTemplate.id}` : '/api/syndication/templates'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error('Failed to save template')

      await fetchTemplates()
      reset()
      setShowForm(false)
      setEditingTemplate(null)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditTemplate = (template: SyndicationTemplate) => {
    setEditingTemplate(template)
    setValue('agreement_type', template.agreement_type as any)
    setValue('agreement_name', template.agreement_name)
    setValue('description', template.description)
    setValue('lead_underwriter', template.lead_underwriter)
    setValue('member_count', template.member_count)
    setValue('gross_spread_bps', template.gross_spread_bps)
    setValue('lockup_period_days', template.lockup_period_days)
    setValue('allocation_structure', JSON.stringify(template.allocation_structure, null, 2))
    setShowForm(true)
  }

  const handleDuplicateTemplate = async (template: SyndicationTemplate) => {
    const newTemplate = {
      ...template,
      id: '',
      agreement_name: `${template.agreement_name} (Copy)`,
      status: 'draft' as const,
    }

    try {
      const response = await fetch('/api/syndication/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTemplate),
      })

      if (!response.ok) throw new Error('Failed to duplicate template')

      await fetchTemplates()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to duplicate')
    }
  }

  const generateAgreementDocument = (template: SyndicationTemplate): string => {
    const spreadPercent = (template.gross_spread_bps / 10000) * 100

    return `
═══════════════════════════════════════════════════════════════════
                    SYNDICATION AGREEMENT
═══════════════════════════════════════════════════════════════════

AGREEMENT TYPE: ${AGREEMENT_TYPES[template.agreement_type as keyof typeof AGREEMENT_TYPES]?.label || template.agreement_type}
DATE PREPARED: ${new Date().toLocaleDateString()}
VERSION: 1.0

───────────────────────────────────────────────────────────────────
1. PARTIES & STRUCTURE
───────────────────────────────────────────────────────────────────

Lead Underwriter: ${template.lead_underwriter}
Syndicate Members: ${template.member_count}
Agreement Template: ${template.agreement_name}

Description:
${template.description}

───────────────────────────────────────────────────────────────────
2. ECONOMIC TERMS
───────────────────────────────────────────────────────────────────

Gross Spread (basis points): ${template.gross_spread_bps} bps
Gross Spread (percentage): ${spreadPercent.toFixed(2)}%
Lockup Period: ${template.lockup_period_days} days

───────────────────────────────────────────────────────────────────
3. MEMBER ALLOCATION STRUCTURE
───────────────────────────────────────────────────────────────────

${Object.entries(template.allocation_structure)
  .map(([member, alloc]) => `${member}: ${alloc} bps (${((alloc / 10000) * 100).toFixed(2)}%)`)
  .join('\n')}

───────────────────────────────────────────────────────────────────
4. UNDERWRITER OBLIGATIONS
───────────────────────────────────────────────────────────────────

✓ Each underwriter commits to purchase and distribute securities
✓ Lead underwriter manages overall offering and coordination
✓ Co-underwriters support distribution to their client base
✓ All parties subject to due diligence and compliance requirements
✓ Commissions distributed per allocation structure

───────────────────────────────────────────────────────────────────
5. KEY DATES & MILESTONES
───────────────────────────────────────────────────────────────────

Execution Date: [To be determined]
Closing Date: [To be determined]
Lockup End Date: [Execution Date + ${template.lockup_period_days} days]

───────────────────────────────────────────────────────────────────
6. REPRESENTATIONS & WARRANTIES
───────────────────────────────────────────────────────────────────

Each underwriter represents and warrants:
• Authority to enter into this agreement
• Financial capability to perform obligations
• Compliance with applicable laws and regulations
• No material adverse changes in circumstances

───────────────────────────────────────────────────────────────────
7. TERMINATION & AMENDMENTS
───────────────────────────────────────────────────────────────────

This agreement may be terminated:
• By mutual written consent of all parties
• If material conditions precedent are not satisfied
• Upon material breach by a party (with 10-day cure period)

Any amendments require written consent of all parties.

───────────────────────────────────────────────────────────────────
8. SIGNATURE BLOCK
───────────────────────────────────────────────────────────────────

Lead Underwriter: ________________________  Date: __________
                 ${template.lead_underwriter}

Company Representative: ________________________  Date: __________

[Additional Underwriter Signatures]

═══════════════════════════════════════════════════════════════════
This agreement is provided as a template and should be reviewed
by legal counsel before execution. Terms are negotiable based on
specific transaction requirements.
═══════════════════════════════════════════════════════════════════
    `.trim()
  }

  const handleDownloadAgreement = (template: SyndicationTemplate) => {
    const documentContent = generateAgreementDocument(template)
    const blob = new Blob([documentContent], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${template.agreement_name.replace(/\s+/g, '_')}_agreement.txt`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Syndication Agreement Templates
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage underwriting syndication agreement templates with version control
          </p>
        </div>
        <button
          onClick={() => {
            setEditingTemplate(null)
            reset()
            setShowForm(!showForm)
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Template
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
          <p className="text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Template Form */}
      {showForm && (
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            {editingTemplate ? 'Edit Template' : 'Create New Template'}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Agreement Type */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Agreement Type
                </label>
                <select
                  {...register('agreement_type')}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  {Object.entries(AGREEMENT_TYPES).map(([key, { label }]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
                {errors.agreement_type && (
                  <p className="text-red-600 text-sm mt-1">{errors.agreement_type.message}</p>
                )}
              </div>

              {/* Agreement Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Template Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Standard Firm Commitment Agreement"
                  {...register('agreement_name')}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
                {errors.agreement_name && (
                  <p className="text-red-600 text-sm mt-1">{errors.agreement_name.message}</p>
                )}
              </div>

              {/* Lead Underwriter */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Lead Underwriter
                </label>
                <input
                  type="text"
                  placeholder="e.g., Goldman Sachs"
                  {...register('lead_underwriter')}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
                {errors.lead_underwriter && (
                  <p className="text-red-600 text-sm mt-1">{errors.lead_underwriter.message}</p>
                )}
              </div>

              {/* Member Count */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Syndicate Size (# Members)
                </label>
                <input
                  type="number"
                  min="1"
                  {...register('member_count', { valueAsNumber: true })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              {/* Gross Spread */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Gross Spread (basis points)
                </label>
                <input
                  type="number"
                  min="0"
                  max="1000"
                  {...register('gross_spread_bps', { valueAsNumber: true })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              {/* Lockup Period */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Lockup Period (days)
                </label>
                <input
                  type="number"
                  min="0"
                  {...register('lockup_period_days', { valueAsNumber: true })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                placeholder="Describe the key features and use cases of this template..."
              />
            </div>

            {/* Allocation Structure */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Member Allocation Structure (JSON)
              </label>
              <textarea
                {...register('allocation_structure')}
                rows={5}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-mono text-sm"
                placeholder={'{\n  "Goldman Sachs": 4000,\n  "Morgan Stanley": 3000,\n  "JP Morgan": 2500\n}'}
              />
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                Format: Member names as keys, basis points as values (e.g., 4000 = 40%)
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 rounded-lg transition flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {editingTemplate ? 'Update Template' : 'Create Template'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingTemplate(null)
                  reset()
                }}
                className="flex-1 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 text-slate-900 dark:text-white font-medium py-2 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Templates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {templates.map(template => (
          <div
            key={template.id}
            className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{template.agreement_name}</h3>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${
                      AGREEMENT_TYPES[template.agreement_type as keyof typeof AGREEMENT_TYPES]?.color
                    }`}
                  >
                    {AGREEMENT_TYPES[template.agreement_type as keyof typeof AGREEMENT_TYPES]?.label}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">{template.description}</p>
              </div>
              <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${STATUS_COLORS[template.status]}`}>
                {template.status}
              </span>
            </div>

            {/* Key Details */}
            <div className="grid grid-cols-2 gap-3 mb-6 py-4 border-y border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Lead Underwriter</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{template.lead_underwriter}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Syndicate Size</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{template.member_count}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Gross Spread</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {template.gross_spread_bps} bps
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Lockup Period</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{template.lockup_period_days}d</p>
                </div>
              </div>
            </div>

            {/* Allocation Preview */}
            <div className="mb-6">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">TOP MEMBERS:</p>
              <div className="space-y-1">
                {Object.entries(template.allocation_structure)
                  .slice(0, 3)
                  .map(([member, alloc]) => (
                    <div key={member} className="flex justify-between text-sm">
                      <span className="text-slate-700 dark:text-slate-300">{member}</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{alloc} bps</span>
                    </div>
                  ))}
                {Object.entries(template.allocation_structure).length > 3 && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                    +{Object.entries(template.allocation_structure).length - 3} more members
                  </p>
                )}
              </div>
            </div>

            {/* Version Info */}
            <div className="text-xs text-slate-600 dark:text-slate-400 mb-6">
              <p>Version {template.version} • Updated {new Date(template.updated_at).toLocaleDateString()}</p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setSelectedTemplate(template)
                    setShowPreview(true)
                  }}
                  className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-medium py-2 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </button>
                <button
                  onClick={() => {
                    fetchVersionHistory(template.id)
                    setSelectedTemplate(template)
                    setShowVersionHistory(true)
                  }}
                  className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-medium py-2 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <History className="h-4 w-4" />
                  History
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleEditTemplate(template)}
                  className="bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-900 dark:text-blue-100 font-medium py-2 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDuplicateTemplate(template)}
                  className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-medium py-2 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Duplicate
                </button>
              </div>
              <button
                onClick={() => handleDownloadAgreement(template)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download Agreement
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {showPreview && selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowPreview(false)}>
          <div
            className="bg-white dark:bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Agreement Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 font-mono text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap overflow-auto max-h-[60vh]">
              {generateAgreementDocument(selectedTemplate)}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => handleDownloadAgreement(selectedTemplate)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </button>
              <button
                onClick={() => setShowPreview(false)}
                className="flex-1 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 text-slate-900 dark:text-white font-medium py-2 rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Version History Modal */}
      {showVersionHistory && selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowVersionHistory(false)}>
          <div
            className="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Version History</h2>
              <button
                onClick={() => setShowVersionHistory(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {versions.length > 0 ? (
                versions.map(version => (
                  <div key={version.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white">Version {version.version}</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {new Date(version.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300">By {version.created_by}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{version.changes}</p>
                  </div>
                ))
              ) : (
                <p className="text-slate-600 dark:text-slate-400">No version history available</p>
              )}
            </div>

            <button
              onClick={() => setShowVersionHistory(false)}
              className="w-full mt-6 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 text-slate-900 dark:text-white font-medium py-2 rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Sample templates for demo purposes
const SAMPLE_TEMPLATES: SyndicationTemplate[] = [
  {
    id: '1',
    agreement_type: 'firm_commitment',
    agreement_name: 'Standard Firm Commitment Agreement',
    description:
      'Classic firm commitment agreement where underwriters purchase all securities from issuer and bear the risk of distribution.',
    lead_underwriter: 'Goldman Sachs',
    member_count: 8,
    gross_spread_bps: 350,
    lockup_period_days: 180,
    allocation_structure: {
      'Goldman Sachs': 4000,
      'Morgan Stanley': 3000,
      'JP Morgan': 2500,
      'Bank of America': 2000,
      'Citigroup': 1500,
      'Deutsche Bank': 1200,
      'Barclays': 900,
      'BMO Capital Markets': 900,
    },
    status: 'active',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-05-20T14:45:00Z',
    version: 2,
  },
  {
    id: '2',
    agreement_type: 'best_efforts',
    agreement_name: 'Best Efforts Underwriting Agreement',
    description:
      'Underwriters agree to use best efforts to sell securities but are not obligated to purchase unsold shares.',
    lead_underwriter: 'RBC Capital Markets',
    member_count: 5,
    gross_spread_bps: 400,
    lockup_period_days: 180,
    allocation_structure: {
      'RBC Capital Markets': 4500,
      'TD Securities': 2500,
      'BMO Capital Markets': 2000,
      'Scotiabank': 1500,
      'CIBC': 1500,
    },
    status: 'active',
    created_at: '2024-02-10T09:15:00Z',
    updated_at: '2024-05-15T16:20:00Z',
    version: 1,
  },
  {
    id: '3',
    agreement_type: 'standby',
    agreement_name: 'Standby Underwriting Agreement',
    description:
      'Underwriters standby to purchase any unsubscribed portion of a rights offering at a specified price.',
    lead_underwriter: 'Canaccord Genuity',
    member_count: 3,
    gross_spread_bps: 250,
    lockup_period_days: 90,
    allocation_structure: {
      'Canaccord Genuity': 5000,
      'Beacon Securities': 3000,
      'Eight Capital': 2000,
    },
    status: 'draft',
    created_at: '2024-03-05T11:45:00Z',
    updated_at: '2024-05-18T13:10:00Z',
    version: 1,
  },
]
