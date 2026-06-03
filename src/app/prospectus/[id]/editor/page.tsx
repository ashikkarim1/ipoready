'use client'

import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ProspectusSection {
  id: string
  name: string
  order: number
  required: boolean
  content: string
  formatted: any
  sourceDocumentId: string | null
  isAutoFilled: boolean
  confidence: number | null
  lastUpdated: Date | null
}

interface UploadResponse {
  success: boolean
  documentId: string
  documentName: string
  totalSectionsExtracted: number
  mappingResults: Array<{
    sectionName: string
    confidence: number
    mapped: boolean
  }>
  extractionMethod: string
}

export default function ProspectusEditor() {
  const router = useRouter()
  const params = useParams()
  const { data: session } = useSession()
  const prospectusId = params.id as string

  const [sections, setSections] = useState<ProspectusSection[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState('')
  const [activeTab, setActiveTab] = useState('upload')
  const [extractionStats, setExtractionStats] = useState<UploadResponse | null>(null)
  const [dragActive, setDragActive] = useState(false)

  // Fetch prospectus sections on mount
  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await fetch(
          `/api/prospectus/sections?prospectusId=${prospectusId}`
        )
        if (!response.ok) throw new Error('Failed to fetch sections')
        const data = await response.json()
        setSections(data.sections)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching sections:', error)
        setLoading(false)
      }
    }

    if (prospectusId) {
      fetchSections()
    }
  }, [prospectusId])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('prospectusId', prospectusId)
      
      // Auto-detect document type from extension
      const ext = file.name.split('.').pop()?.toLowerCase()
      let docType: 'pdf' | 'docx' | 'csv' | 'text' = 'pdf'
      if (ext === 'docx') docType = 'docx'
      else if (ext === 'csv') docType = 'csv'
      else if (ext === 'txt') docType = 'text'
      
      formData.append('documentType', docType)

      const response = await fetch('/api/prospectus/extract', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const result = await response.json() as UploadResponse
      setExtractionStats(result)

      // Refresh sections to show extracted content
      const sectionsResponse = await fetch(
        `/api/prospectus/sections?prospectusId=${prospectusId}`
      )
      if (sectionsResponse.ok) {
        const data = await sectionsResponse.json()
        setSections(data.sections)
      }

      // Reset file input
      e.target.value = ''
    } catch (error) {
      console.error('Upload error:', error)
      alert(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (!files || !files[0]) return

    const file = files[0]
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('prospectusId', prospectusId)

      // Auto-detect document type from extension
      const ext = file.name.split('.').pop()?.toLowerCase()
      let docType: 'pdf' | 'docx' | 'csv' | 'text' = 'pdf'
      if (ext === 'docx') docType = 'docx'
      else if (ext === 'csv') docType = 'csv'
      else if (ext === 'txt') docType = 'text'

      formData.append('documentType', docType)

      const response = await fetch('/api/prospectus/extract', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const result = await response.json() as UploadResponse
      setExtractionStats(result)

      // Refresh sections to show extracted content
      const sectionsResponse = await fetch(
        `/api/prospectus/sections?prospectusId=${prospectusId}`
      )
      if (sectionsResponse.ok) {
        const data = await sectionsResponse.json()
        setSections(data.sections)
      }
    } catch (error) {
      console.error('Drop upload error:', error)
      alert(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleEditSection = (section: ProspectusSection) => {
    setEditingSectionId(section.id)
    setEditingContent(section.content)
  }

  const handleSaveSection = async () => {
    if (!editingSectionId) return

    try {
      const response = await fetch('/api/prospectus/sections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prospectusId,
          sectionId: editingSectionId,
          content: editingContent,
        }),
      })

      if (!response.ok) throw new Error('Failed to save section')

      const data = await response.json()

      // Update local state
      setSections(
        sections.map(s =>
          s.id === editingSectionId
            ? { ...s, content: editingContent, isAutoFilled: false }
            : s
        )
      )

      setEditingSectionId(null)
      setEditingContent('')
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save section')
    }
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  const completedSections = sections.filter(s => s.content && s.content.trim().length > 0)
  const completionPercent = Math.round((completedSections.length / sections.length) * 100)

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6" suppressHydrationWarning>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Prospectus Editor</h1>
          <p className="text-gray-600 mt-1">Complete all 12 sections for your IPO prospectus</p>
        </div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Back
        </button>
      </div>

      {/* Progress Bar */}
      <div className="rounded-lg border border-gray-200 p-4 bg-white">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-900">Overall Progress</span>
          <span className="text-sm font-semibold text-gray-900">{completionPercent}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
        <div className="mt-2 text-xs text-gray-600">
          {completedSections.length} of {sections.length} sections completed
        </div>
      </div>

      {/* Main Tabs */}
      <div className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="upload">Upload Document</TabsTrigger>
          <TabsTrigger value="sections">Edit Sections</TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-4">
          <div
            onDrop={handleDrop}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            className={`rounded-lg border border-dashed p-8 transition-all ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 bg-gray-50'
            }`}
          >
            <div className="text-center space-y-4">
              <div className="text-5xl">📄</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Upload Document</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Drag & drop or click to upload PDF, DOCX, or CSV
                </p>
              </div>
              <input
                type="file"
                onChange={handleFileUpload}
                disabled={uploading}
                accept=".pdf,.docx,.csv,.txt"
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className={`inline-block px-6 py-2 rounded-md font-medium transition-colors cursor-pointer ${
                  uploading
                    ? 'bg-gray-300 text-gray-600'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {uploading ? 'Uploading...' : 'Choose File'}
              </label>
            </div>
          </div>

          {/* Extraction Results */}
          {extractionStats && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <h3 className="font-semibold text-green-900 mb-3">
                ✓ Document extracted successfully
              </h3>
              <div className="space-y-2 text-sm text-green-800">
                <p>
                  <strong>File:</strong> {extractionStats.documentName}
                </p>
                <p>
                  <strong>Sections found:</strong> {extractionStats.totalSectionsExtracted}
                </p>
                <p>
                  <strong>Method:</strong> {extractionStats.extractionMethod}
                </p>
                <div className="mt-3">
                  <p className="font-medium mb-2">Mapping Results:</p>
                  <ul className="space-y-1 text-xs">
                    {extractionStats.mappingResults.map((result, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span>{result.mapped ? '✓' : '○'}</span>
                        <span>{result.sectionName}</span>
                        <span className="text-green-700">
                          ({Math.round(result.confidence * 100)}%)
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Sections Tab */}
        <TabsContent value="sections" className="space-y-4">
          {sections.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center bg-gray-50">
              <p className="text-gray-600">No sections available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sections.map(section => (
                <div
                  key={section.id}
                  className="rounded-lg border border-gray-200 p-4 bg-white hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {section.order}. {section.name}
                        </h3>
                        {section.isAutoFilled && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Auto-filled ({Math.round((section.confidence || 0) * 100)}%)
                          </span>
                        )}
                        {section.required && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                            Required
                          </span>
                        )}
                      </div>
                      {section.content && (
                        <p className="text-xs text-gray-600 mt-1">
                          {section.content.substring(0, 100)}...
                        </p>
                      )}
                    </div>
                  </div>

                  {editingSectionId === section.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={editingContent}
                        onChange={e => setEditingContent(e.target.value)}
                        className="w-full h-40 p-3 border border-gray-300 rounded-md text-sm font-mono resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter section content..."
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveSection}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingSectionId(null)}
                          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEditSection(section)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {section.content ? 'Edit' : 'Add Content'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
