'use client'

import { useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { PROSPECTUS_SECTIONS } from '@/lib/prospectus-extractor'

interface Section {
  id: string
  sectionName: string
  sectionOrder: number
  required: boolean
  content: string
  isAutoFilled: boolean
  status: 'empty' | 'draft' | 'reviewed' | 'complete'
  autoFillConfidence?: number
}

interface ExtractedMapping {
  prospectusSection: string
  confidence: number
  extractedContent: string
  automationSuggestion: 'auto_fill' | 'review' | 'manual_entry'
  source?: string
}

const STATUS_COLORS = {
  empty: 'bg-gray-100 text-gray-700 border-gray-300',
  draft: 'bg-amber-100 text-amber-700 border-amber-300',
  reviewed: 'bg-blue-100 text-blue-700 border-blue-300',
  complete: 'bg-green-100 text-green-700 border-green-300',
}

const STATUS_ICONS = {
  empty: '○',
  draft: '✎',
  reviewed: '→',
  complete: '✓',
}

export default function ProspectusEditor() {
  const router = useRouter()
  const params = useParams()
  const { data: session } = useSession()
  const prospectusId = params.id as string

  // Initialize sections from PROSPECTUS_SECTIONS
  const [sections, setSections] = useState<Section[]>(
    PROSPECTUS_SECTIONS.map((section, index) => ({
      id: `section-${index}`,
      sectionName: section.name,
      sectionOrder: index + 1,
      required: true,
      content: '',
      isAutoFilled: false,
      status: 'empty' as const,
      autoFillConfidence: 0,
    }))
  )

  const [selectedSectionId, setSelectedSectionId] = useState<string>('section-0')
  const [autoFillSuggestions, setAutoFillSuggestions] = useState<ExtractedMapping[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)

  const selectedSection = sections.find((s) => s.id === selectedSectionId)

  const handleSectionChange = useCallback(
    (sectionId: string, content: string) => {
      setSections((prev) =>
        prev.map((section) => {
          if (section.id === sectionId) {
            const newStatus =
              content.length === 0
                ? 'empty'
                : content.length < 100
                  ? 'draft'
                  : content.length > 500
                    ? 'complete'
                    : 'reviewed'
            return {
              ...section,
              content,
              status: newStatus as any,
              isAutoFilled: false,
            }
          }
          return section
        })
      )
    },
    []
  )

  const handleAutoFill = useCallback(
    (suggestion: ExtractedMapping) => {
      if (selectedSection) {
        handleSectionChange(selectedSectionId, suggestion.extractedContent)
        setSections((prev) =>
          prev.map((section) => {
            if (section.id === selectedSectionId) {
              return {
                ...section,
                isAutoFilled: true,
                autoFillConfidence: suggestion.confidence,
                status: 'reviewed' as const,
              }
            }
            return section
          })
        )
      }
    },
    [selectedSectionId, selectedSection, handleSectionChange]
  )

  const handleFileUpload = useCallback(
    async (files: File[]) => {
      if (!files.length) return

      setIsUploading(true)
      setUploadProgress(0)

      try {
        const file = files[0]
        const formData = new FormData()
        formData.append('file', file)

        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + 15, 90))
        }, 200)

        const response = await fetch(`/api/prospectus/${prospectusId}/extract`, {
          method: 'POST',
          body: formData,
        })

        clearInterval(progressInterval)

        if (response.ok) {
          const data = await response.json()
          setUploadProgress(100)

          // Extract mappings from response
          if (data.mapping?.mappings) {
            const mappings = data.mapping.mappings
              .filter((m: any) => m.confidence > 0.3)
              .map((m: any) => ({
                prospectusSection: m.prospectusSection,
                confidence: m.confidence,
                extractedContent: m.content || '',
                automationSuggestion: m.automationSuggestion,
                source: data.extraction.documentName,
              }))

            setAutoFillSuggestions(mappings)
          }

          // Auto-fill high-confidence mappings
          if (data.mapping?.mappings) {
            setSections((prev) =>
              prev.map((section) => {
                const mapping = data.mapping.mappings.find(
                  (m: any) => m.prospectusSection === section.sectionName && m.automationSuggestion === 'auto_fill'
                )
                if (mapping) {
                  return {
                    ...section,
                    content: mapping.content || section.content,
                    isAutoFilled: true,
                    autoFillConfidence: mapping.confidence,
                    status: 'reviewed' as const,
                  }
                }
                return section
              })
            )
          }
        }

        setTimeout(() => setIsUploading(false), 1000)
      } catch (error) {
        console.error('Upload failed:', error)
        setIsUploading(false)
      }
    },
    [prospectusId]
  )

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(Array.from(e.dataTransfer.files))
    }
  }

  const completedCount = sections.filter((s) => s.status === 'complete').length
  const completionPercent = Math.round((completedCount / sections.length) * 100)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Prospectus Editor</h1>
            <p className="text-sm text-gray-600 mt-1">Complete {completionPercent}% of your prospectus</p>
          </div>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            Back
          </button>
        </div>
      </div>

      {/* Main Editor Grid */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
          {/* Left Panel: Section Outline */}
          <motion.div
            className="col-span-3 border border-gray-200 rounded-lg bg-white overflow-hidden flex flex-col"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="border-b border-gray-200 px-4 py-3 bg-gray-50">
              <h2 className="font-semibold text-gray-900">Sections</h2>
              <p className="text-xs text-gray-600 mt-1">{completedCount} of {sections.length} complete</p>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
            </div>

            {/* Upload Area */}
            <div
              className={`p-3 border-b border-gray-200 transition-colors ${
                dragActive ? 'bg-blue-50 border-blue-300' : 'bg-white'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <label className="block">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center cursor-pointer hover:border-blue-400 transition-colors">
                  <div className="text-2xl mb-1">📄</div>
                  <p className="text-xs font-medium text-gray-700">Drop PDF, DOCX, or text</p>
                  <p className="text-xs text-gray-500 mt-1">or click to browse</p>
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt,.csv"
                    onChange={(e) => handleFileUpload(Array.from(e.target.files || []))}
                    className="hidden"
                    disabled={isUploading}
                  />
                </div>
              </label>
              {isUploading && (
                <div className="mt-2 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    className="h-full bg-green-500"
                    initial={{ width: '0%' }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}
            </div>

            {/* Section List */}
            <div className="overflow-y-auto flex-1 px-2 py-2">
              {sections.map((section) => (
                <motion.button
                  key={section.id}
                  onClick={() => setSelectedSectionId(section.id)}
                  className={`w-full text-left px-3 py-2 rounded-md mb-1 transition-all border ${
                    selectedSectionId === section.id
                      ? 'bg-blue-50 border-blue-300 shadow-sm'
                      : `border-gray-200 hover:bg-gray-50 ${STATUS_COLORS[section.status]}`
                  }`}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-medium text-gray-600 min-w-5">{STATUS_ICONS[section.status]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{section.sectionName}</p>
                      <p className="text-xs text-gray-500">
                        {section.content.length > 0 ? `${section.content.length} chars` : 'Empty'}
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Center Panel: Editor */}
          <motion.div
            className="col-span-6 border border-gray-200 rounded-lg bg-white overflow-hidden flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {selectedSection && (
              <>
                <div className="border-b border-gray-200 px-4 py-3 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedSection.sectionName}</h3>
                      <p className="text-xs text-gray-600 mt-1">Section {selectedSection.sectionOrder} of 12</p>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${STATUS_COLORS[selectedSection.status]}`}>
                        {selectedSection.status === 'empty'
                          ? 'Empty'
                          : selectedSection.status === 'draft'
                            ? 'Draft'
                            : selectedSection.status === 'reviewed'
                              ? 'Reviewed'
                              : 'Complete'}
                      </span>
                      {selectedSection.isAutoFilled && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700 border border-green-300">
                          Auto-filled ({Math.round(selectedSection.autoFillConfidence! * 100)}%)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <textarea
                  value={selectedSection.content}
                  onChange={(e) => handleSectionChange(selectedSectionId, e.target.value)}
                  placeholder={`Enter ${selectedSection.sectionName.toLowerCase()} content here...`}
                  className="flex-1 p-4 resize-none focus:outline-none border-0 text-sm leading-relaxed"
                />

                <div className="border-t border-gray-200 px-4 py-3 bg-gray-50 text-xs text-gray-600">
                  {selectedSection.content.length} characters • {Math.ceil(selectedSection.content.length / 5)} words
                </div>
              </>
            )}
          </motion.div>

          {/* Right Panel: Auto-fill Suggestions */}
          <motion.div
            className="col-span-3 border border-gray-200 rounded-lg bg-white overflow-hidden flex flex-col"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="border-b border-gray-200 px-4 py-3 bg-gray-50">
              <h2 className="font-semibold text-gray-900">Auto-fill Suggestions</h2>
              <p className="text-xs text-gray-600 mt-1">{autoFillSuggestions.length} available</p>
            </div>

            <div className="overflow-y-auto flex-1 px-2 py-2">
              {autoFillSuggestions.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <p className="text-sm">Upload a document to see suggestions</p>
                </div>
              ) : (
                autoFillSuggestions.map((suggestion, index) => (
                  <motion.div
                    key={index}
                    className="p-3 border border-gray-200 rounded-md mb-2 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAutoFill(suggestion)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                          {suggestion.prospectusSection}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">{suggestion.source || 'Extracted content'}</p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div className="text-sm font-semibold text-blue-600">
                          {Math.round(suggestion.confidence * 100)}%
                        </div>
                        <div className="text-xs text-gray-500">
                          {suggestion.automationSuggestion === 'auto_fill'
                            ? 'High'
                            : suggestion.automationSuggestion === 'review'
                              ? 'Medium'
                              : 'Low'}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-700 line-clamp-2">{suggestion.extractedContent.substring(0, 100)}...</p>
                    <p className="text-xs text-blue-600 mt-2 font-medium group-hover:underline">Click to import →</p>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
