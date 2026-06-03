'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, Eye, Filter, X } from 'lucide-react'
import TemplatePreview from './TemplatePreview'

interface SyndicationTemplate {
  id: string
  title: string
  type: 'lead-underwriter' | 'co-underwriter' | 'standstill'
  description: string
  keyTerms: string[]
  exchanges: string[]
  lastUpdated: string
  fileFormat: 'docx'
}

const TEMPLATE_TYPES = [
  { value: 'lead-underwriter', label: 'Lead Underwriter' },
  { value: 'co-underwriter', label: 'Co-Underwriter' },
  { value: 'standstill', label: 'Standstill' },
]

const EXCHANGES = ['NYSE', 'NASDAQ', 'TSX', 'TSXV', 'London Stock Exchange', 'Euronext']

const typeColors: Record<string, { bg: string; text: string; badge: string }> = {
  'lead-underwriter': { bg: 'bg-blue-50', text: 'text-blue-900', badge: 'bg-blue-100 text-blue-800' },
  'co-underwriter': { bg: 'bg-purple-50', text: 'text-purple-900', badge: 'bg-purple-100 text-purple-800' },
  standstill: { bg: 'bg-amber-50', text: 'text-amber-900', badge: 'bg-amber-100 text-amber-800' },
}

export default function SyndicationTemplatesPage() {
  const [templates, setTemplates] = useState<SyndicationTemplate[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<SyndicationTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<SyndicationTemplate | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  // Filters
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedExchange, setSelectedExchange] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch templates on mount
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch('/api/compliance/templates')
        if (response.ok) {
          const data = await response.json()
          setTemplates(data.data)
        }
      } catch (error) {
        console.error('Error fetching templates:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTemplates()
  }, [])

  // Apply filters
  useEffect(() => {
    let filtered = templates

    // Filter by type
    if (selectedType) {
      filtered = filtered.filter((t) => t.type === selectedType)
    }

    // Filter by exchange
    if (selectedExchange) {
      filtered = filtered.filter((t) => t.exchanges.includes(selectedExchange))
    }

    // Filter by search term
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(lowerSearch) ||
          t.description.toLowerCase().includes(lowerSearch)
      )
    }

    setFilteredTemplates(filtered)
  }, [templates, selectedType, selectedExchange, searchTerm])

  const handlePreview = (template: SyndicationTemplate) => {
    setSelectedTemplate(template)
    setShowPreview(true)
  }

  const handleDownload = async (template: SyndicationTemplate) => {
    try {
      const response = await fetch(`/api/compliance/templates/download?id=${template.id}`)
      if (!response.ok) {
        throw new Error('Download failed')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${template.title.replace(/\s+/g, '-')}.docx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download error:', error)
      alert(`Failed to download ${template.title}. Please try again.`)
    }
  }

  return (
    <div className="min-h-screen p-6" style={{ background: '#F7F6F4', colorScheme: 'light' }} suppressHydrationWarning>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#1A1A1A' }}>Syndication Agreement Templates</h1>
          <p className="text-lg" style={{ color: '#717171' }}>
            Pre-drafted templates for lead underwriter, co-underwriter, and standstill agreements.
            Download and customize for your IPO process.
          </p>
        </motion.div>

        {/* Filters & Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl shadow-lg p-6 mb-8"
          style={{ background: '#FFFFFF', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
        >
          {/* Search Bar */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search templates by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all"
              style={{
                borderColor: '#E5E4E0',
                border: '1px solid',
                background: '#F0EFED',
                color: '#1A1A1A',
              }}
            />
          </div>

          {/* Filter Buttons */}
          <div className="space-y-4">
            {/* Template Type Filter */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Filter size={18} style={{ color: '#717171' }} />
                <h3 className="font-semibold" style={{ color: '#1A1A1A' }}>Template Type</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedType(null)}
                  className="px-4 py-2 rounded-lg font-medium transition-all"
                  style={{
                    background: selectedType === null ? '#E8312A' : '#F0EFED',
                    color: selectedType === null ? 'white' : '#1A1A1A'
                  }}
                >
                  All Types
                </button>
                {TEMPLATE_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value)}
                    className="px-4 py-2 rounded-lg font-medium transition-all"
                    style={{
                      background: selectedType === type.value ? '#E8312A' : '#F0EFED',
                      color: selectedType === type.value ? 'white' : '#1A1A1A'
                    }}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Exchange Filter */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Filter size={18} style={{ color: '#717171' }} />
                <h3 className="font-semibold" style={{ color: '#1A1A1A' }}>Exchanges</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedExchange(null)}
                  className="px-4 py-2 rounded-lg font-medium transition-all"
                  style={{
                    background: selectedExchange === null ? '#E8312A' : '#F0EFED',
                    color: selectedExchange === null ? 'white' : '#1A1A1A'
                  }}
                >
                  All Exchanges
                </button>
                {EXCHANGES.map((exchange) => (
                  <button
                    key={exchange}
                    onClick={() => setSelectedExchange(exchange)}
                    className="px-4 py-2 rounded-lg font-medium transition-all"
                    style={{
                      background: selectedExchange === exchange ? '#E8312A' : '#F0EFED',
                      color: selectedExchange === exchange ? 'white' : '#1A1A1A'
                    }}
                  >
                    {exchange}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {(selectedType || selectedExchange || searchTerm) && (
            <div className="mt-6 pt-6" style={{ borderTop: '1px solid #E5E4E0' }}>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium" style={{ color: '#717171' }}>Active filters:</span>
                {selectedType && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm" style={{ background: '#DFF2F0', color: '#0F766E' }}>
                    Type: {TEMPLATE_TYPES.find((t) => t.value === selectedType)?.label}
                    <button
                      onClick={() => setSelectedType(null)}
                      className="ml-1 hover:opacity-75 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
                {selectedExchange && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm" style={{ background: '#DFF2F0', color: '#0F766E' }}>
                    Exchange: {selectedExchange}
                    <button
                      onClick={() => setSelectedExchange(null)}
                      className="ml-1 hover:opacity-75 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
                {searchTerm && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm" style={{ background: '#DFF2F0', color: '#0F766E' }}>
                    Search: {searchTerm}
                    <button
                      onClick={() => setSearchTerm('')}
                      className="ml-1 hover:opacity-75 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Template Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-lg h-96 animate-pulse" style={{ background: '#F0EFED' }} />
            ))}
          </div>
        ) : filteredTemplates.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl shadow-lg p-12 text-center"
            style={{ background: '#FFFFFF' }}
          >
            <FileText size={48} className="mx-auto mb-4" style={{ color: '#9A9A9A' }} />
            <h3 className="text-xl font-semibold mb-2" style={{ color: '#1A1A1A' }}>No templates found</h3>
            <p style={{ color: '#717171' }}>
              Try adjusting your filters or search term to find syndication agreement templates.
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredTemplates.map((template, idx) => {
              const colors = typeColors[template.type]
              return (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="rounded-xl overflow-hidden transition-shadow hover:shadow-xl"
                  style={{ background: '#FFFFFF', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                >
                  <div className="p-6">
                    {/* Template Type Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold" style={{ background: '#DFF2F0', color: '#0F766E' }}>
                        {TEMPLATE_TYPES.find((t) => t.value === template.type)?.label}
                      </span>
                      <span className="text-xs" style={{ color: '#9A9A9A' }}>v{template.lastUpdated.split('-')[0]}</span>
                    </div>

                    {/* Template Title */}
                    <h3 className="text-lg font-bold mb-3" style={{ color: '#1A1A1A' }}>{template.title}</h3>

                    {/* Template Description */}
                    <p className="text-sm mb-4 line-clamp-3" style={{ color: '#717171' }}>{template.description}</p>

                    {/* Key Terms */}
                    <div className="mb-4">
                      <h4 className="text-xs font-semibold uppercase mb-2" style={{ color: '#9A9A9A' }}>Key Terms</h4>
                      <div className="flex flex-wrap gap-1">
                        {template.keyTerms.slice(0, 5).map((term, i) => (
                          <span
                            key={i}
                            className="inline-block text-xs px-2 py-1 rounded"
                            style={{ background: '#F0EFED', color: '#717171' }}
                          >
                            {term.split(':')[0]}
                          </span>
                        ))}
                        {template.keyTerms.length > 5 && (
                          <span className="inline-block text-xs px-2 py-1 rounded" style={{ background: '#F0EFED', color: '#717171' }}>
                            +{template.keyTerms.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Exchanges */}
                    <div className="mb-6">
                      <h4 className="text-xs font-semibold uppercase mb-2" style={{ color: '#9A9A9A' }}>Used by Exchanges</h4>
                      <div className="flex flex-wrap gap-1">
                        {template.exchanges.slice(0, 3).map((exchange, i) => (
                          <span key={i} className="inline-block text-xs px-2 py-1 rounded" style={{ background: '#F0EFED', color: '#717171' }}>
                            {exchange}
                          </span>
                        ))}
                        {template.exchanges.length > 3 && (
                          <span className="inline-block text-xs px-2 py-1 rounded" style={{ background: '#F0EFED', color: '#717171' }}>
                            +{template.exchanges.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => handlePreview(template)}
                        className="flex-1 flex items-center justify-center gap-2 font-semibold py-2 rounded-lg transition-colors"
                        style={{ background: '#F0EFED', color: '#1A1A1A' }}
                      >
                        <Eye size={16} />
                        Preview
                      </button>
                      <button
                        onClick={() => handleDownload(template)}
                        className="flex-1 flex items-center justify-center gap-2 text-white font-semibold py-2 rounded-lg transition-colors"
                        style={{ background: '#E8312A' }}
                      >
                        <Download size={16} />
                        Download
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}

        {/* Template Results Count */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 text-center"
          >
            <p className="text-sm" style={{ color: '#717171' }}>
              Showing {filteredTemplates.length} of {templates.length} templates
            </p>
          </motion.div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && selectedTemplate && (
        <TemplatePreview
          template={selectedTemplate}
          onClose={() => {
            setShowPreview(false)
            setSelectedTemplate(null)
          }}
          onDownload={handleDownload}
        />
      )}
    </div>
  )
}
