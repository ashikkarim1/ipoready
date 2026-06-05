'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Download,
  Plus,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Loader,
} from 'lucide-react'

interface DocumentFile {
  id: string
  name: string
  size: number
  uploadedAt: string
  status: 'uploaded' | 'processing' | 'verified'
}

interface DocumentUploadCardProps {
  id: string
  name: string
  description: string
  status: 'empty' | 'partial' | 'submitted' | 'verified'
  isMandatory: boolean
  files?: DocumentFile[]
  onDownloadTemplate?: (documentId: string) => void
  onUploadFile?: (documentId: string, files: File[]) => void
  onRemoveFile?: (documentId: string, fileId: string) => void
}

export function DocumentUploadCard({
  id,
  name,
  description,
  status,
  isMandatory,
  files = [],
  onDownloadTemplate,
  onUploadFile,
  onRemoveFile,
}: DocumentUploadCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)

  const getStatusColor = () => {
    switch (status) {
      case 'empty':
        return 'border-orange-200 bg-orange-50/50'
      case 'partial':
        return 'border-blue-200 bg-blue-50/50'
      case 'submitted':
        return 'border-green-200 bg-green-50/50'
      case 'verified':
        return 'border-green-300 bg-green-100/30'
      default:
        return 'border-gray-200 bg-gray-50/50'
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'verified':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case 'submitted':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case 'partial':
        return <AlertCircle className="w-5 h-5 text-blue-500" />
      case 'empty':
        return <FileText className="w-5 h-5 text-orange-500" />
      default:
        return <FileText className="w-5 h-5 text-gray-500" />
    }
  }

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
    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }

  const handleFiles = (selectedFiles: File[]) => {
    if (selectedFiles.length > 0) {
      setUploading(true)
      onUploadFile?.(id, selectedFiles)
      // Simulate upload completion
      setTimeout(() => setUploading(false), 2000)
    }
  }

  const isComplete = status === 'verified' || status === 'submitted'
  const isEmpty = status === 'empty'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border-2 rounded-xl p-6 transition-all ${getStatusColor()}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          {getStatusIcon()}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900">{name}</h3>
              {isMandatory && (
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">
                  MANDATORY
                </span>
              )}
              {isComplete && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">
                  READY
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mb-4 space-y-2">
          {files.map((file) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>

              {file.status === 'verified' && (
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 ml-2" />
              )}

              {file.status === 'processing' && (
                <Loader className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0 ml-2" />
              )}

              {!isComplete && (
                <button
                  onClick={() => onRemoveFile?.(id, file.id)}
                  className="text-gray-400 hover:text-red-600 flex-shrink-0 ml-2"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {!isComplete && (
        <motion.div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
            isDragging
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.xlsx"
            onChange={(e) =>
              handleFiles(Array.from(e.currentTarget.files || []))
            }
            className="hidden"
            id={`file-input-${id}`}
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader className="w-6 h-6 text-blue-600 animate-spin" />
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          ) : (
            <>
              <label
                htmlFor={`file-input-${id}`}
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Plus className="w-6 h-6 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {isEmpty
                      ? 'Add file or download template'
                      : 'Add another file'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Drag files here or click to browse
                  </p>
                </div>
              </label>

              {isEmpty && (
                <button
                  onClick={() => onDownloadTemplate?.(id)}
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Template
                </button>
              )}
            </>
          )}
        </motion.div>
      )}

      {/* Status Message */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-lg p-4 border border-green-200"
        >
          <p className="text-sm font-medium text-green-800">
            ✅ {files.length} file{files.length !== 1 ? 's' : ''} uploaded and
            verified
          </p>
          <p className="text-xs text-green-700 mt-1">
            This document is ready for submission
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}
