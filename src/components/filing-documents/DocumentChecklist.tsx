'use client'

import { useState, useMemo } from 'react'
import { AlertCircle, FileText } from 'lucide-react'
import { DocumentCard, DocumentStatus } from './DocumentCard'
import { CategoryFilter } from './CategoryFilter'
import { ProgressTracker } from './ProgressTracker'
import { DocumentPreview } from './DocumentPreview'

export interface DocumentItem {
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
  fileUrl?: string
  fileSize?: string
  checklistItems?: string[]
}

interface DocumentChecklistProps {
  exchange: string
  companyId: string
  documents: DocumentItem[]
  onUpload: (documentId: string, file: File) => void
  onDelete?: (documentId: string) => void
  onViewDocument?: (documentId: string) => void
  title?: string
  subtitle?: string
}

export function DocumentChecklist({
  exchange,
  companyId,
  documents,
  onUpload,
  onDelete,
  onViewDocument,
  title = 'Filing Documents Checklist',
  subtitle = 'Complete all required documents for your IPO filing',
}: DocumentChecklistProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null)

  // Calculate category stats
  const categories = useMemo(() => {
    const categoryMap: Record<string, { count: number; total: number }> = {}

    documents.forEach((doc) => {
      if (!categoryMap[doc.category]) {
        categoryMap[doc.category] = { count: 0, total: 0 }
      }
      categoryMap[doc.category].total++
      if (doc.status !== 'not_started') {
        categoryMap[doc.category].count++
      }
    })

    return Object.entries(categoryMap).map(([name, stats]) => ({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      label: name,
      ...stats,
    }))
  }, [documents])

  // Filter documents
  const filteredDocuments = useMemo(() => {
    if (!selectedCategory) return documents

    return documents.filter((doc) =>
      doc.category.toLowerCase() === selectedCategory.toLowerCase()
    )
  }, [documents, selectedCategory])

  // Calculate progress stats
  const progressStats = useMemo(() => {
    const completedDocs = documents.filter((doc) => doc.status !== 'not_started')
    const verifiedDocs = documents.filter((doc) => doc.status === 'verified')

    const categoryProgress = categories.map((cat) => {
      const catDocs = documents.filter((doc) => doc.category === cat.label)
      const completedCatDocs = catDocs.filter((doc) => doc.status !== 'not_started')
      return {
        name: cat.label,
        completed: completedCatDocs.length,
        total: catDocs.length,
      }
    })

    const totalEstimatedDays = documents
      .filter((doc) => doc.status !== 'verified' && doc.estimatedDays)
      .reduce((sum, doc) => sum + (doc.estimatedDays || 0), 0)

    return {
      totalCompleted: completedDocs.length,
      totalDocuments: documents.length,
      verifiedDocuments: verifiedDocs.length,
      categoryProgress,
      estimatedDaysRemaining: totalEstimatedDays,
    }
  }, [documents, categories])

  const handleViewDocument = (doc: DocumentItem) => {
    setPreviewDoc(doc)
    if (onViewDocument) {
      onViewDocument(doc.id)
    }
  }

  const handleDownloadDocument = (doc: DocumentItem) => {
    if (doc.fileUrl) {
      const a = document.createElement('a')
      a.href = doc.fileUrl
      a.download = doc.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  const handleDeleteDocument = async (doc: DocumentItem) => {
    if (onDelete) {
      await Promise.resolve(onDelete(doc.id))
      setPreviewDoc(null)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="h2 font-bold text-gray-900 mb-2">{title}</h1>
        <p className="body text-gray-600">{subtitle}</p>
        <div className="mt-4 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200">
          <FileText className="w-5 h-5 text-blue-600" />
          <p className="body-sm text-blue-900">
            Exchange: <span className="font-semibold">{exchange}</span>
          </p>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Overview */}
          <ProgressTracker
            totalCompleted={progressStats.totalCompleted}
            totalDocuments={progressStats.totalDocuments}
            estimatedDaysRemaining={progressStats.estimatedDaysRemaining}
            categoryProgress={progressStats.categoryProgress}
          />

          {/* Documents List */}
          <div className="space-y-4">
            {filteredDocuments.length === 0 ? (
              <div className="card p-12 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="body text-gray-700 mb-2">
                  No documents found
                </p>
                <p className="caption text-gray-600">
                  {selectedCategory
                    ? 'Try selecting a different category'
                    : 'No documents have been added yet'}
                </p>
              </div>
            ) : (
              filteredDocuments.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  {...doc}
                  onUpload={(file) => onUpload(doc.id, file)}
                  onView={() => handleViewDocument(doc)}
                  onDownload={() => handleDownloadDocument(doc)}
                  onDelete={() => handleDeleteDocument(doc)}
                />
              ))
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Category Filter */}
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          {/* Summary Stats */}
          <div className="card p-6 space-y-4">
            <p className="label-sm font-semibold text-gray-700">
              Summary
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="body-sm text-gray-600">Total Documents</p>
                <p className="h4 font-bold text-gray-900">
                  {progressStats.totalDocuments}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <p className="body-sm text-gray-600">Completed</p>
                <p className="h4 font-bold text-green-600">
                  {progressStats.totalCompleted}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <p className="body-sm text-gray-600">Verified</p>
                <p className="h4 font-bold text-green-700">
                  {progressStats.verifiedDocuments}
                </p>
              </div>

              <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
                <p className="body-sm text-gray-600">Remaining</p>
                <p className="h4 font-bold text-red-600">
                  {progressStats.totalDocuments - progressStats.totalCompleted}
                </p>
              </div>
            </div>

            <div className="pt-2 rounded-lg bg-yellow-50 border border-yellow-200 p-3">
              <p className="label-sm font-semibold text-yellow-900 mb-1">
                Next Steps
              </p>
              <p className="caption-sm text-yellow-800">
                {progressStats.totalCompleted === 0
                  ? 'Start by selecting a category and uploading your first document.'
                  : progressStats.totalCompleted === progressStats.totalDocuments
                    ? 'All documents are complete! Review before final submission.'
                    : `Continue uploading ${progressStats.totalDocuments - progressStats.totalCompleted} more documents.`}
              </p>
            </div>
          </div>

          {/* Help Card */}
          <div className="card p-6 space-y-3">
            <p className="label-sm font-semibold text-gray-700">Need Help?</p>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 block truncate"
                >
                  Document Requirements Guide
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 block truncate"
                >
                  Contact Compliance Team
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 block truncate"
                >
                  View Templates
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Document Preview Modal */}
      {previewDoc && (
        <DocumentPreview
          isOpen={!!previewDoc}
          documentName={previewDoc.name}
          fileUrl={previewDoc.fileUrl || '#'}
          fileSize={previewDoc.fileSize}
          uploadedDate={previewDoc.uploadedDate}
          uploadedBy={previewDoc.uploadedBy}
          onClose={() => setPreviewDoc(null)}
          onDownload={() => handleDownloadDocument(previewDoc)}
          onDelete={onDelete ? () => handleDeleteDocument(previewDoc) : undefined}
        />
      )}
    </div>
  )
}
