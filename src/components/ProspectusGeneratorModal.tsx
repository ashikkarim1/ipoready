'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, FileText, Loader, CheckCircle2, AlertCircle, Download,
  ChevronDown, Sparkles
} from 'lucide-react'

interface ProspectusGeneratorModalProps {
  isOpen: boolean
  onClose: () => void
  companyName: string
  onGenerateStart?: () => void
  onGenerateComplete?: (result: any) => void
}

export default function ProspectusGeneratorModal({
  isOpen,
  onClose,
  companyName,
  onGenerateStart,
  onGenerateComplete,
}: ProspectusGeneratorModalProps) {
  const [exchange, setExchange] = useState('tsx')
  const [format, setFormat] = useState('docx')
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const exchanges = [
    { id: 'tsx', label: 'TSX' },
    { id: 'tsxv', label: 'TSX Venture' },
    { id: 'cse', label: 'Canadian Securities Exchange' },
    { id: 'nasdaq', label: 'NASDAQ' },
    { id: 'nyse', label: 'NYSE' },
    { id: 'otc', label: 'OTC Markets' },
  ]

  const formats = [
    { id: 'docx', label: 'Word (.docx)' },
    { id: 'pdf', label: 'PDF (.pdf)' },
  ]

  async function handleGenerate() {
    if (!exchange || !format) return

    setIsGenerating(true)
    setError(null)
    setResult(null)
    onGenerateStart?.()

    try {
      const response = await fetch('/api/prospectus/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exchange, format }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || errorData.error || 'Generation failed')
      }

      const data = await response.json()

      if (data.success) {
        setResult(data)
        onGenerateComplete?.(data)
      } else {
        setError(data.errors?.[0] || 'Unknown error occurred')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
      console.error('Prospectus generation error:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', padding: '1rem' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-2xl rounded-2xl"
            style={{
              background: 'white',
              border: '1px solid #E5E4E0',
              padding: '2rem',
              boxShadow: '0 24px 64px rgba(0,0,0,0.15)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between" style={{ marginBottom: '1.5rem' }}>
              <div className="flex items-center gap-3">
                <div
                  className="rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: '#FFF3E0', width: '3rem', height: '3rem' }}
                >
                  <Sparkles className="w-5 h-5" style={{ color: '#B45309' }} />
                </div>
                <div>
                  <h2 className="text-nav font-bold h4">Generate Prospectus</h2>
                  <p className="text-text-muted body-sm">{companyName}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-text-light hover:text-nav transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!result && !error && (
              <>
                {/* Exchange Selection */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="text-nav label font-medium block" style={{ marginBottom: '0.75rem' }}>
                    Target Exchange
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {exchanges.map(ex => (
                      <button
                        key={ex.id}
                        type="button"
                        onClick={() => setExchange(ex.id)}
                        className="rounded-xl border label font-medium transition-all text-left"
                        style={{
                          padding: '0.875rem 1rem',
                          ...(exchange === ex.id
                            ? { background: '#F7F6F4', borderColor: '#1A1A1A', color: '#1A1A1A' }
                            : { background: 'white', borderColor: '#E5E4E0', color: '#717171' }),
                        }}
                      >
                        {ex.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Format Selection */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="text-nav label font-medium block" style={{ marginBottom: '0.75rem' }}>
                    Document Format
                  </label>
                  <div className="flex gap-3">
                    {formats.map(fmt => (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() => setFormat(fmt.id)}
                        className="flex-1 rounded-xl border label font-medium transition-all"
                        style={{
                          padding: '0.875rem',
                          ...(format === fmt.id
                            ? { background: '#F7F6F4', borderColor: '#1A1A1A', color: '#1A1A1A' }
                            : { background: 'white', borderColor: '#E5E4E0', color: '#717171' }),
                        }}
                      >
                        {fmt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Info Box */}
                <div
                  className="rounded-xl border flex items-start gap-3"
                  style={{
                    background: '#F0FDF4',
                    borderColor: '#DCFCE7',
                    padding: '1rem',
                    marginBottom: '1.5rem',
                  }}
                >
                  <FileText className="w-5 h-5 text-green-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="label font-medium text-green-900">Auto-generates from PACE data</p>
                    <p className="caption-sm text-green-700 mt-0.5">
                      IPOReady will fill the prospectus with company info, financials, and team data from your PACE workflow. Review and customize before final submission.
                    </p>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 rounded-xl border label font-medium text-text-muted hover:text-nav transition-colors"
                    style={{ background: 'white', borderColor: '#E5E4E0', padding: '0.875rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="btn btn-primary flex-1 justify-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" /> Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" /> Generate
                      </>
                    )}
                  </button>
                </div>
              </>
            )}

            {error && (
              <>
                <div
                  className="rounded-xl border flex items-start gap-3"
                  style={{
                    background: '#FDECEB',
                    borderColor: '#FCCCC3',
                    padding: '1rem',
                    marginBottom: '1.5rem',
                  }}
                >
                  <AlertCircle className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="label font-medium text-red-900">Generation failed</p>
                    <p className="caption-sm text-red-700 mt-0.5">{error}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setError(null)
                      setResult(null)
                    }}
                    className="flex-1 rounded-xl border label font-medium text-text-muted hover:text-nav transition-colors"
                    style={{ background: 'white', borderColor: '#E5E4E0', padding: '0.875rem' }}
                  >
                    Try Again
                  </button>
                  <button
                    onClick={onClose}
                    className="btn btn-primary flex-1 justify-center"
                  >
                    Close
                  </button>
                </div>
              </>
            )}

            {result && (
              <>
                <div
                  className="rounded-xl border flex items-start gap-3"
                  style={{
                    background: '#EAF5F0',
                    borderColor: '#C3E9E0',
                    padding: '1rem',
                    marginBottom: '1.5rem',
                  }}
                >
                  <CheckCircle2 className="w-5 h-5 text-green-700 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="label font-medium text-green-900">Prospectus generated successfully</p>
                    <p className="caption-sm text-green-700 mt-1">
                      {result.metadata?.wordCount || 0} words · {result.metadata?.pageCount || 0} pages ·{' '}
                      {Math.round(result.documentSize / 1024)} KB
                    </p>
                    {result.completeness !== undefined && (
                      <p className="caption-sm text-green-700 mt-1">
                        Data completeness: {result.completeness}%
                        {result.completeness < 100 && ' (some fields require manual entry)'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Warnings */}
                {result.warnings && result.warnings.length > 0 && (
                  <div
                    className="rounded-xl border flex items-start gap-3"
                    style={{
                      background: '#FEF9C3',
                      borderColor: '#FED7AA',
                      padding: '1rem',
                      marginBottom: '1.5rem',
                    }}
                  >
                    <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="label font-medium text-amber-900">Notes</p>
                      <ul className="caption-sm text-amber-700 mt-1 space-y-1">
                        {result.warnings.map((w: string, i: number) => (
                          <li key={i}>• {w}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Download Section */}
                <div
                  className="rounded-xl border"
                  style={{
                    background: '#F7F6F4',
                    borderColor: '#E5E4E0',
                    padding: '1rem',
                    marginBottom: '1.5rem',
                  }}
                >
                  <p className="label font-medium text-nav mb-3">Download or Preview</p>
                  <div className="flex gap-3">
                    {result.documentUrl && (
                      <a
                        href={result.documentUrl}
                        download
                        className="btn btn-primary flex-1 justify-center gap-2"
                      >
                        <Download className="w-4 h-4" /> Download
                      </a>
                    )}
                    <button
                      onClick={() => setShowDetails(!showDetails)}
                      className="flex-1 rounded-xl border label font-medium text-text-muted hover:text-nav transition-colors"
                      style={{ background: 'white', borderColor: '#E5E4E0', padding: '0.75rem' }}
                    >
                      <ChevronDown
                        className="w-4 h-4 inline mr-1"
                        style={{ transform: showDetails ? 'rotate(180deg)' : 'rotate(0)' }}
                      />
                      Details
                    </button>
                  </div>
                </div>

                {/* Details Panel */}
                <AnimatePresence>
                  {showDetails && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{
                        background: '#FAFAF9',
                        borderRadius: '0.75rem',
                        padding: '1rem',
                        marginBottom: '1.5rem',
                        fontSize: '0.875rem',
                        lineHeight: '1.5',
                      }}
                    >
                      <p className="label-sm text-text-muted uppercase font-semibold mb-2">
                        Generation Details
                      </p>
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="text-text-muted">Document ID:</dt>
                          <dd className="text-nav font-mono caption-sm">
                            {result.documentId?.slice(0, 8)}...
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-text-muted">Format:</dt>
                          <dd className="text-nav">{format.toUpperCase()}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-text-muted">Sections:</dt>
                          <dd className="text-nav text-right">
                            {result.metadata?.sectionsIncluded?.join(', ')}
                          </dd>
                        </div>
                        {result.generationTimeMs && (
                          <div className="flex justify-between">
                            <dt className="text-text-muted">Generation time:</dt>
                            <dd className="text-nav">{result.generationTimeMs}ms</dd>
                          </div>
                        )}
                      </dl>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="w-full rounded-xl border label font-medium text-text-muted hover:text-nav transition-colors"
                  style={{ background: 'white', borderColor: '#E5E4E0', padding: '0.875rem' }}
                >
                  Close
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
