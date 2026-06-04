'use client'

import { useState } from 'react'
import { X, Download, Trash2, AlertCircle } from 'lucide-react'

interface DocumentPreviewProps {
  isOpen: boolean
  documentName: string
  fileUrl: string
  fileSize?: string
  uploadedDate?: string
  uploadedBy?: string
  onClose: () => void
  onDownload: () => void
  onDelete?: () => void
}

export function DocumentPreview({
  isOpen,
  documentName,
  fileUrl,
  fileSize,
  uploadedDate,
  uploadedBy,
  onClose,
  onDownload,
  onDelete,
}: DocumentPreviewProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  if (!isOpen) return null

  const handleDelete = async () => {
    if (onDelete) {
      setIsDeleting(true)
      try {
        await Promise.resolve(onDelete())
        onClose()
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const isPDF = fileUrl.toLowerCase().endsWith('.pdf')
  const isImage =
    fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) !== null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-gray-200">
            <div className="flex-1">
              <h2 className="h3 font-semibold text-gray-900 mb-2">
                {documentName}
              </h2>
              {uploadedDate && (
                <p className="caption-sm text-gray-600">
                  Uploaded {uploadedDate}
                  {uploadedBy && ` by ${uploadedBy}`}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6 bg-gray-50">
            {isPDF ? (
              <iframe
                src={fileUrl}
                className="w-full h-full border-0 rounded-lg"
                title={documentName}
              />
            ) : isImage ? (
              <div className="flex items-center justify-center h-full">
                <img
                  src={fileUrl}
                  alt={documentName}
                  className="max-w-full max-h-full rounded-lg"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="body text-gray-700 mb-4">
                    Preview not available for this file type
                  </p>
                  <button
                    onClick={onDownload}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white label font-medium hover:bg-red-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download File
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-white">
            <div className="flex items-center gap-2">
              {fileSize && (
                <p className="caption-sm text-gray-600">
                  File size: {fileSize}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onDownload}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 label font-medium hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </button>

              {onDelete && (
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-300 bg-red-50 text-red-700 label font-medium hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              )}

              <button
                onClick={onClose}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white label font-medium hover:bg-red-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
