'use client'

import { useState, useRef } from 'react'
import { Upload, AlertCircle, CheckCircle, Loader } from 'lucide-react'

interface ExtractedSection {
  prospectusSection: string
  sourceContent: string
  confidence: number
  startIndex: number
  endIndex: number
}

interface DocumentUploadProps {
  prospectusId: string
  onExtractionsApplied: (sections: ExtractedSection[]) => void
}

export function ProspectusDocumentUpload({
  prospectusId,
  onExtractionsApplied,
}: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [extractedSections, setExtractedSections] = useState<ExtractedSection[]>([])
  const [documentName, setDocumentName] = useState('')
  const [documentType, setDocumentType] = useState<'pdf' | 'docx' | 'csv' | 'text'>('pdf')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      await handleFileUpload(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleFileUpload = async (file: File) => {
    setIsUploading(true)
    setUploadError(null)
    setExtractedSections([])

    try {
      // Auto-detect document type from file extension
      const fileName = file.name.toLowerCase()
      let detectedType: 'pdf' | 'docx' | 'csv' | 'text' = documentType

      if (fileName.endsWith('.pdf')) detectedType = 'pdf'
      else if (fileName.endsWith('.docx')) detectedType = 'docx'
      else if (fileName.endsWith('.csv')) detectedType = 'csv'
      else if (fileName.endsWith('.txt')) detectedType = 'text'

      setDocumentType(detectedType)

      const formData = new FormData()
      formData.append('file', file)
      formData.append(
        'documentName',
        documentName || file.name.replace(/\.[^.]+$/, '')
      )
      formData.append('documentType', detectedType)

      const response = await fetch(
        `/api/prospectus/${prospectusId}/upload-and-extract`,
        {
          method: 'POST',
          body: formData,
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      setExtractedSections(result.extractedSections)
      setDocumentName(file.name)
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : 'Failed to upload document'
      )
    } finally {
      setIsUploading(false)
    }
  }

  const handleApplyExtractions = () => {
    onExtractionsApplied(extractedSections)
    setExtractedSections([])
    setDocumentName('')
  }

  return (
    <div className="space-y-6 p-6">
      {/* Upload Area */}
      <div
        className={`relative rounded-lg border-2 border-dashed transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50'
        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.csv,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full p-12 flex flex-col items-center justify-center space-y-3 cursor-pointer"
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <Loader className="w-8 h-8 text-blue-500 animate-spin" />
              <div className="text-center">
                <p className="font-medium text-gray-900">Extracting content...</p>
                <p className="body-sm text-gray-600">
                  This may take a moment
                </p>
              </div>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-400" />
              <div className="text-center">
                <p className="font-medium text-gray-900">
                  Drag documents here or click to browse
                </p>
                <p className="body-sm text-gray-600">
                  Supports PDF, DOCX, CSV, and TXT files
                </p>
              </div>
            </>
          )}
        </button>
      </div>

      {/* Error Display */}
      {uploadError && (
        <div className="rounded-lg bg-red-50 p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-900">Extraction failed</p>
            <p className="body-sm text-red-700">{uploadError}</p>
          </div>
        </div>
      )}

      {/* Extracted Sections Preview */}
      {extractedSections.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
              Extracted Sections ({extractedSections.length})
            </h3>
            <button
              onClick={handleApplyExtractions}
              className="px-4 py-2 bg-blue-600 text-white rounded-md label font-medium hover:bg-blue-700"
            >
              Apply Extractions
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {extractedSections.map((section, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-gray-200 p-4 bg-white"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900">
                    {section.prospectusSection}
                  </h4>
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-100 rounded-full px-3 py-1">
                      <span className="label font-medium text-blue-700">
                        {Math.round(section.confidence * 100)}%
                      </span>
                    </div>
                    {section.confidence > 0.7 && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                </div>

                <p className="body-sm text-gray-600 line-clamp-2">
                  {section.sourceContent}
                </p>

                <div className="mt-2 flex items-center gap-2 caption-sm text-gray-500">
                  <span>
                    {section.endIndex - section.startIndex} characters
                  </span>
                  <span>•</span>
                  <span>
                    Confidence:{' '}
                    {section.confidence < 0.5
                      ? 'Low'
                      : section.confidence < 0.8
                        ? 'Medium'
                        : 'High'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
            <p className="body-sm text-blue-900">
              ℹ️ Review each extracted section. You can edit content directly in the
              editor after applying. High confidence matches (70%+) are more likely
              to be accurate.
            </p>
          </div>
        </div>
      )}

      {/* Document History */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900">Document Library</h3>
        <div className="rounded-lg border border-gray-200 p-4 text-center text-gray-500">
          <p className="body-sm">
            Previously uploaded documents will appear here
          </p>
        </div>
      </div>
    </div>
  )
}
