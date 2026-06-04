'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Download,
  Copy,
  Mail,
  CheckCircle,
  AlertCircle,
  Eye,
  Settings,
  FileText,
  Database,
  FileJson,
  Zap,
  Clock,
} from 'lucide-react'

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
  email?: string
  phone?: string
  linkedIn?: string
  resume?: string
  principalOccupation?: string
  education?: string
  certifications?: string
  boardExperience?: string
  stockOwnership?: number
  relatedPartyTransactions?: boolean
}

interface DirectorExportProps {
  directors: BoardMember[]
  companyName: string
  targetExchange: 'tsx' | 'tsxv' | 'nasdaq' | 'nyse'
}

type FormatType = 'sedar2' | 'sec-edgar' | 'pdf'

interface ExportOptions {
  format: FormatType
  selectedDirectors: Set<string>
  bioLength: 'short' | 'medium' | 'long'
  includeCompensation: boolean
  includeRelatedParty: boolean
  customHeader: string
  customFooter: string
}

export default function DirectorExport({
  directors,
  companyName,
  targetExchange,
}: DirectorExportProps) {
  const [activeFormat, setActiveFormat] = useState<FormatType>('sedar2')
  const [selectedDirectors, setSelectedDirectors] = useState<Set<string>>(
    new Set(directors.map((d) => d.id))
  )
  const [bioLength, setBioLength] = useState<'short' | 'medium' | 'long'>('medium')
  const [includeCompensation, setIncludeCompensation] = useState(true)
  const [includeRelatedParty, setIncludeRelatedParty] = useState(true)
  const [customHeader, setCustomHeader] = useState('')
  const [customFooter, setCustomFooter] = useState('')
  const [showCustomization, setShowCustomization] = useState(false)
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const formatLabels: Record<FormatType, string> = {
    sedar2: 'SEDAR 2 (TSX/TSXV)',
    'sec-edgar': 'SEC Edgar (NASDAQ/NYSE)',
    pdf: 'PDF Export',
  }

  const selectedCount = selectedDirectors.size
  const isAllSelected = selectedCount === directors.length

  // Generate preview content based on format and options
  const previewContent = useMemo(() => {
    const selected = Array.from(directors).filter((d) =>
      selectedDirectors.has(d.id)
    )

    if (selected.length === 0) {
      return 'No directors selected for export.'
    }

    let content = ''

    // Add header
    if (customHeader) {
      content += customHeader + '\n\n'
    } else if (activeFormat === 'sedar2') {
      content += `DIRECTORS AND OFFICERS - ${companyName}\n`
      content += `Prepared for: SEDAR 2 Filing\n`
      content += `Date: ${new Date().toLocaleDateString()}\n\n`
    } else if (activeFormat === 'sec-edgar') {
      content += `DIRECTORS, EXECUTIVE OFFICERS, AND SIGNIFICANT SHAREHOLDERS\n`
      content += `${companyName}\n`
      content += `Filed: ${new Date().toLocaleDateString()}\n\n`
    }

    // Add director information
    selected.forEach((director, index) => {
      content += `${index + 1}. ${director.name}\n`
      content += `   Title: ${director.role}\n`
      content += `   Status: ${director.independence.toUpperCase()}\n`

      if (director.principalOccupation) {
        content += `   Principal Occupation: ${director.principalOccupation}\n`
      }

      if (director.education && bioLength !== 'short') {
        content += `   Education: ${director.education}\n`
      }

      if (director.certifications && bioLength !== 'short') {
        content += `   Certifications: ${director.certifications}\n`
      }

      // Biography based on length
      if (bioLength === 'long' && director.boardExperience) {
        content += `   Board Experience: ${director.boardExperience}\n`
      }

      if (director.experience) {
        content += `   Years of Experience: ${director.experience}\n`
      }

      if (includeCompensation && director.compensation) {
        content += `   Annual Compensation: $${director.compensation.toLocaleString()}\n`
      }

      if (includeRelatedParty && director.relatedPartyTransactions) {
        content += `   Related Party Transactions: Yes\n`
      }

      if (bioLength === 'long' && director.stockOwnership !== undefined) {
        content += `   Stock Ownership: ${director.stockOwnership}%\n`
      }

      content += '\n'
    })

    // Add footer
    if (customFooter) {
      content += customFooter
    } else {
      content += `---\nExport generated on ${new Date().toLocaleString()}`
    }

    return content
  }, [
    selectedDirectors,
    activeFormat,
    bioLength,
    includeCompensation,
    includeRelatedParty,
    customHeader,
    customFooter,
    companyName,
    directors,
  ])

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedDirectors(new Set())
    } else {
      setSelectedDirectors(new Set(directors.map((d) => d.id)))
    }
  }

  const handleToggleDirector = (directorId: string) => {
    const newSet = new Set(selectedDirectors)
    if (newSet.has(directorId)) {
      newSet.delete(directorId)
    } else {
      newSet.add(directorId)
    }
    setSelectedDirectors(newSet)
  }

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(previewContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const filename = `directors-${activeFormat}-${new Date().toISOString().split('T')[0]}`
      const fileExtension = activeFormat === 'pdf' ? 'pdf' : 'txt'

      // In a real app, this would call an API to generate PDF
      const blob = new Blob([previewContent], {
        type: activeFormat === 'pdf' ? 'application/pdf' : 'text/plain',
      })

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${filename}.${fileExtension}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
    } finally {
      setDownloading(false)
    }
  }

  const handleEmailExport = () => {
    const selected = Array.from(directors).filter((d) =>
      selectedDirectors.has(d.id)
    )
    const subject = encodeURIComponent(
      `Director Export - ${companyName} (${formatLabels[activeFormat]})`
    )
    const body = encodeURIComponent(
      `Please find attached the director information export for ${companyName}.\n\nFormat: ${formatLabels[activeFormat]}\nDirectors: ${selectedCount}\n\n${previewContent}`
    )

    const mailtoLink = `mailto:?subject=${subject}&body=${body}`
    window.location.href = mailtoLink
  }

  const getExchangeInfo = () => {
    const info: Record<string, { exchange: FormatType; note: string }> = {
      tsx: { exchange: 'sedar2', note: 'Use SEDAR 2 format for TSX' },
      tsxv: { exchange: 'sedar2', note: 'Use SEDAR 2 format for TSX Venture' },
      nasdaq: { exchange: 'sec-edgar', note: 'Use SEC Edgar format for NASDAQ' },
      nyse: { exchange: 'sec-edgar', note: 'Use SEC Edgar format for NYSE' },
    }
    return info[targetExchange]
  }

  const exchangeInfo = getExchangeInfo()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-6xl mx-auto rounded-xl border border-slate-200 bg-white p-6"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Director Export</h2>
            <p className="text-sm text-slate-600 mt-1">
              Export director information in your required filing format
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200">
            <Zap className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">
              {exchangeInfo.note}
            </span>
          </div>
        </div>
      </div>

      {/* Format Selection Tabs */}
      <div className="mb-8 border-b border-slate-200">
        <div className="flex gap-2">
          {((['sedar2', 'sec-edgar', 'pdf'] as const).map((format) => (
            <motion.button
              key={format}
              onClick={() => setActiveFormat(format)}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeFormat === format
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
              whileHover={{ y: -2 }}
            >
              {format === 'sedar2' && <FileText className="w-4 h-4 mr-2 inline" />}
              {format === 'sec-edgar' && (
                <Database className="w-4 h-4 mr-2 inline" />
              )}
              {format === 'pdf' && <FileJson className="w-4 h-4 mr-2 inline" />}
              {formatLabels[format]}
            </motion.button>
          )))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Selection Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 space-y-4"
        >
          <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">
                Directors ({selectedCount}/{directors.length})
              </h3>
              <button
                onClick={handleSelectAll}
                className="text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                {isAllSelected ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {directors.map((director) => (
                <motion.label
                  key={director.id}
                  className="flex items-center gap-3 p-2 rounded hover:bg-slate-100 cursor-pointer"
                  whileHover={{ x: 2 }}
                >
                  <input
                    type="checkbox"
                    checked={selectedDirectors.has(director.id)}
                    onChange={() => handleToggleDirector(director.id)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate">
                      {director.name}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {director.role}
                    </div>
                  </div>
                  {director.status === 'complete' && (
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  )}
                </motion.label>
              ))}
            </div>
          </div>

          {/* Customization Toggle */}
          <motion.button
            onClick={() => setShowCustomization(!showCustomization)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-slate-600" />
              <span className="font-medium text-slate-900">Customization</span>
            </div>
            <motion.div
              animate={{ rotate: showCustomization ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <svg
                className="w-4 h-4 text-slate-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </motion.div>
          </motion.button>

          {/* Customization Options */}
          <AnimatePresence>
            {showCustomization && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 pt-4 border-t border-slate-200"
              >
                {/* Bio Length */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Biography Length
                  </label>
                  <div className="space-y-2">
                    {(
                      ['short', 'medium', 'long'] as const
                    ).map((length) => (
                      <label
                        key={length}
                        className="flex items-center gap-3 p-2 rounded hover:bg-slate-100 cursor-pointer"
                      >
                        <input
                          type="radio"
                          checked={bioLength === length}
                          onChange={() => setBioLength(length)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-slate-700 capitalize">
                          {length}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Include Compensation */}
                <label className="flex items-center gap-3 p-2 rounded hover:bg-slate-100 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeCompensation}
                    onChange={(e) => setIncludeCompensation(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span className="text-sm text-slate-700">
                    Include Compensation
                  </span>
                </label>

                {/* Include Related Party */}
                <label className="flex items-center gap-3 p-2 rounded hover:bg-slate-100 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeRelatedParty}
                    onChange={(e) => setIncludeRelatedParty(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span className="text-sm text-slate-700">
                    Include Related Party Transactions
                  </span>
                </label>

                {/* Custom Header */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Custom Header (Optional)
                  </label>
                  <textarea
                    value={customHeader}
                    onChange={(e) => setCustomHeader(e.target.value)}
                    placeholder="Add custom header text..."
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>

                {/* Custom Footer */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Custom Footer (Optional)
                  </label>
                  <textarea
                    value={customFooter}
                    onChange={(e) => setCustomFooter(e.target.value)}
                    placeholder="Add custom footer text..."
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Preview Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          <div className="rounded-lg border border-slate-200 bg-slate-50 overflow-hidden flex flex-col h-full">
            {/* Preview Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-slate-600" />
                <span className="font-medium text-slate-900">Preview</span>
              </div>
              <span className="text-xs text-slate-500">
                {formatLabels[activeFormat]}
              </span>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {selectedCount === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-500">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <span>Select directors to preview</span>
                </div>
              ) : (
                <pre className="text-xs text-slate-700 whitespace-pre-wrap break-words font-mono">
                  {previewContent}
                </pre>
              )}
            </div>

            {/* Preview Actions */}
            {selectedCount > 0 && (
              <div className="flex gap-2 px-4 py-3 bg-white border-t border-slate-200">
                <motion.button
                  onClick={handleCopyToClipboard}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                    copied
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Copy className="w-4 h-4" />
                  {copied ? 'Copied!' : 'Copy'}
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Action Buttons */}
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3 pt-6 border-t border-slate-200"
        >
          <motion.button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {downloading ? (
              <>
                <Clock className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Download File
              </>
            )}
          </motion.button>

          <motion.button
            onClick={handleEmailExport}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-900 font-medium rounded-lg hover:bg-slate-200 transition-colors border border-slate-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Mail className="w-5 h-5" />
            Email Export
          </motion.button>
        </motion.div>
      )}

      {/* Info Messages */}
      {selectedCount === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 p-4 rounded-lg bg-amber-50 border border-amber-200 flex gap-3"
        >
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-amber-900">No directors selected</h4>
            <p className="text-sm text-amber-800 mt-1">
              Select at least one director to preview and export their information.
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
