'use client'

import { useState, useRef } from 'react'
import {
  Download,
  Trash2,
  Eye,
  Upload,
  FileText,
  ChevronDown,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
} from 'lucide-react'

export type DocumentStatus =
  | 'not_started'
  | 'in_progress'
  | 'ready'
  | 'uploaded'
  | 'verified'

interface DocumentCardProps {
  id: string
  name: string
  description: string
  category: string
  status: DocumentStatus
  isRequired: boolean
  estimatedDays?: number
  uploadedDate?: string
  uploadedBy?: string
  templateUrl?: string
  guideUrl?: string
  onUpload: (file: File) => void
  onView?: () => void
  onDownload?: () => void
  onDelete?: () => void
  checklistItems?: string[]
}

export function DocumentCard({
  id,
  name,
  description,
  category,
  status,
  isRequired,
  estimatedDays,
  uploadedDate,
  uploadedBy,
  templateUrl,
  guideUrl,
  onUpload,
  onView,
  onDownload,
  onDelete,
  checklistItems = [],
}: DocumentCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      onUpload(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      onUpload(files[0])
    }
  }

  const getStatusBadgeColor = () => {
    switch (status) {
      case 'not_started':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'in_progress':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200'
      case 'ready':
        return 'bg-blue-50 text-blue-800 border-blue-200'
      case 'uploaded':
        return 'bg-green-50 text-green-800 border-green-200'
      case 'verified':
        return 'bg-green-100 text-green-900 border-green-300'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'not_started':
        return <AlertCircle className="w-4 h-4" />
      case 'in_progress':
        return <Clock className="w-4 h-4" />
      case 'ready':
        return <FileText className="w-4 h-4" />
      case 'uploaded':
        return <FileText className="w-4 h-4" />
      case 'verified':
        return <CheckCircle2 className="w-4 h-4" />
      default:
        return null
    }
  }

  const getStatusLabel = () => {
    switch (status) {
      case 'not_started':
        return 'Not Started'
      case 'in_progress':
        return 'In Progress'
      case 'ready':
        return 'Ready for Review'
      case 'uploaded':
        return 'Uploaded'
      case 'verified':
        return 'Verified'
      default:
        return 'Unknown'
    }
  }

  const isUploadable = status === 'not_started' || status === 'in_progress'

  return (
    <div className="card p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="h4 font-semibold text-gray-900">{name}</h3>
            {isRequired && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Required
              </span>
            )}
          </div>
          <p className="body-sm text-gray-600">{description}</p>
        </div>

        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border label font-medium ${getStatusBadgeColor()}`}>
          {getStatusIcon()}
          <span>{getStatusLabel()}</span>
          {estimatedDays && status !== 'verified' && (
            <span className="text-xs ml-1">({estimatedDays}d)</span>
          )}
        </div>
      </div>

      {/* Upload Zone or Actions */}
      {isUploadable ? (
        <div
          className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
            isDragging
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 bg-gray-50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex flex-col items-center justify-center cursor-pointer"
          >
            <Upload className="w-6 h-6 text-gray-400 mb-2" />
            <p className="label font-medium text-gray-900 mb-1">
              Drag and drop or click to upload
            </p>
            <p className="caption-sm text-gray-600">
              Supports PDF, DOCX, and image files
            </p>
          </button>
        </div>
      ) : (
        // File info section for uploaded documents
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="label font-medium text-blue-900 mb-1">
                File uploaded successfully
              </p>
              {uploadedDate && (
                <p className="caption-sm text-blue-800">
                  {uploadedDate}
                  {uploadedBy && ` by ${uploadedBy}`}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Resources */}
      {(templateUrl || guideUrl) && (
        <div className="flex items-center gap-3 pt-2">
          {templateUrl && (
            <a
              href={templateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              <Download className="w-4 h-4" />
              Download Template
            </a>
          )}
          {guideUrl && (
            <a
              href={guideUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-700"
            >
              <HelpCircle className="w-4 h-4" />
              View Guide
            </a>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2">
        {onView && status !== 'not_started' && (
          <button
            onClick={onView}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 label font-medium transition-colors"
          >
            <Eye className="w-4 h-4" />
            View
          </button>
        )}
        {onDownload && status !== 'not_started' && (
          <button
            onClick={onDownload}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 label font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        )}
        {onDelete && status !== 'not_started' && (
          <button
            onClick={onDelete}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 label font-medium transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        )}
      </div>

      {/* Checklist Preview */}
      {checklistItems.length > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between text-left mb-3"
          >
            <p className="label-sm font-semibold text-gray-700">
              Checklist Items ({checklistItems.length})
            </p>
            <ChevronDown
              className={`w-4 h-4 text-gray-600 transition-transform ${
                isExpanded ? 'transform rotate-180' : ''
              }`}
            />
          </button>

          {isExpanded && (
            <div className="space-y-2">
              {checklistItems.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="caption text-gray-700">{item}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
