'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CompletionMilestones } from '@/components/CompletionMilestones'
import { DocumentUploadCard } from '@/components/DocumentUploadCard'
import { DocumentProgressBar } from '@/components/DocumentProgressBar'
import { useDocumentCompletion, type Document } from '@/hooks/useDocumentCompletion'
import { Download, AlertCircle } from 'lucide-react'

// Mock document data - replace with API call
const MOCK_DOCUMENTS: Document[] = [
  {
    id: 'prospectus',
    name: 'Prospectus',
    isMandatory: true,
    status: 'verified',
    fileCount: 1,
  },
  {
    id: 'financial-statements',
    name: 'Audited Financial Statements',
    isMandatory: true,
    status: 'verified',
    fileCount: 2,
  },
  {
    id: 'board-resolutions',
    name: 'Board Resolutions & Minutes',
    isMandatory: true,
    status: 'submitted',
    fileCount: 3,
  },
  {
    id: 'ceo-cfo-certs',
    name: 'CEO/CFO Certificates',
    isMandatory: true,
    status: 'partial',
    fileCount: 1,
  },
  {
    id: 'legal-opinions',
    name: 'Legal Opinions',
    isMandatory: true,
    status: 'empty',
    fileCount: 0,
  },
  {
    id: 'tax-compliance',
    name: 'Tax Compliance & CRA Letters',
    isMandatory: true,
    status: 'submitted',
    fileCount: 1,
  },
  {
    id: 'ip-assignments',
    name: 'IP Assignments & Registrations',
    isMandatory: false,
    status: 'verified',
    fileCount: 2,
  },
  {
    id: 'insurance-policies',
    name: 'Insurance Policies & Certificates',
    isMandatory: false,
    status: 'partial',
    fileCount: 1,
  },
  {
    id: 'contracts-material',
    name: 'Material Contracts',
    isMandatory: true,
    status: 'empty',
    fileCount: 0,
  },
  {
    id: 'underwriting-agreement',
    name: 'Underwriting Agreement',
    isMandatory: false,
    status: 'empty',
    fileCount: 0,
  },
]

const DOCUMENT_DESCRIPTIONS: Record<string, string> = {
  prospectus:
    'The official offering document filed with securities regulators. Contains all material information about your company and the offering.',
  'financial-statements':
    'Audited financial statements for the past 2+ fiscal years. Essential for investor confidence and regulatory requirements.',
  'board-resolutions':
    'Board of Directors minutes and resolutions authorizing the IPO. Demonstrates proper corporate governance.',
  'ceo-cfo-certs':
    'Certificates of the CEO and CFO certifying the accuracy of financial statements and disclosure controls.',
  'legal-opinions':
    'Legal opinions on incorporation, title to assets, compliance with laws, and other material legal matters.',
  'tax-compliance':
    'Evidence of tax compliance including CRA letters of good standing, historical tax returns, and compliance certifications.',
  'ip-assignments':
    'Intellectual property assignments and registration documents confirming clean IP ownership.',
  'insurance-policies':
    'Current insurance policies and certificates of insurance covering directors & officers liability and other material risks.',
  'contracts-material':
    'Copies of all material contracts (vendor, customer, financing) required for regulatory disclosure.',
  'underwriting-agreement':
    'Template or draft underwriting agreement showing underwriter terms and conditions for the offering.',
}

export default function DocumentsUploadPage() {
  const [documents, setDocuments] = useState<Document[]>(MOCK_DOCUMENTS)
  const [uploading, setUploading] = useState<string | null>(null)

  const { completionData } = useDocumentCompletion(documents)

  const handleDownloadTemplate = async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents/templates?type=${documentId}`)
      if (!response.ok) throw new Error('Download failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${documentId}-template.txt`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Template download error:', error)
      alert('Failed to download template')
    }
  }

  const handleUploadFile = async (documentId: string, files: File[]) => {
    setUploading(documentId)
    try {
      const formData = new FormData()
      formData.append('documentId', documentId)
      files.forEach((file) => formData.append('files', file))

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Upload failed')

      const result = await response.json()

      setDocuments((prev) =>
        prev.map((doc) => {
          if (doc.id === documentId) {
            return {
              ...doc,
              fileCount: doc.fileCount + files.length,
              status: doc.status === 'empty' ? 'partial' : doc.status,
            }
          }
          return doc
        })
      )
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload files')
    } finally {
      setUploading(null)
    }
  }

  const handleRemoveFile = async (documentId: string, fileId: string) => {
    try {
      const response = await fetch('/api/documents/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId, fileId }),
      })

      if (!response.ok) throw new Error('Delete failed')

      setDocuments((prev) =>
        prev.map((doc) => {
          if (doc.id === documentId) {
            return {
              ...doc,
              fileCount: Math.max(0, doc.fileCount - 1),
            }
          }
          return doc
        })
      )
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete file')
    }
  }

  const mandatoryDocs = documents.filter((d) => d.isMandatory)
  const recommendedDocs = documents.filter((d) => !d.isMandatory)

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-black text-gray-900">
          📄 Document Upload & Submission
        </h1>
        <p className="text-lg text-gray-600">
          Track your IPO readiness one document at a time. Upload files, download
          templates, and get notified when you&apos;re ready to submit.
        </p>
      </motion.div>

      {/* Progress Bar */}
      <DocumentProgressBar data={completionData} />

      {/* Milestones Celebration */}
      <CompletionMilestones completionPercentage={completionData.completionPercentage} />

      {/* Mandatory Documents Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-gray-900">Mandatory Documents</h2>
          <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-bold rounded-full">
            {completionData.mandatoryCompleted}/{completionData.mandatoryDocuments}
          </span>
        </div>

        <p className="text-gray-600">
          These documents are required by securities regulators. Complete all
          mandatory documents to reach submission readiness.
        </p>

        <div className="grid gap-4">
          {mandatoryDocs.map((doc) => (
            <DocumentUploadCard
              key={doc.id}
              id={doc.id}
              name={doc.name}
              description={DOCUMENT_DESCRIPTIONS[doc.id] || ''}
              status={doc.status}
              isMandatory={true}
              files={doc.fileCount > 0 ? generateMockFiles(doc.id, doc.fileCount) : []}
              onDownloadTemplate={handleDownloadTemplate}
              onUploadFile={handleUploadFile}
              onRemoveFile={handleRemoveFile}
            />
          ))}
        </div>
      </div>

      {/* Submission Readiness Alert */}
      {completionData.mandatoryCompletionPercentage >= 90 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 rounded-2xl p-6"
        >
          <div className="flex gap-4">
            <div className="text-4xl">🛎️</div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-green-900 mb-2">
                ✅ You&apos;re Submission Ready!
              </h3>
              <p className="text-green-800 mb-4">
                Your mandatory documents are {completionData.mandatoryCompletionPercentage}% complete.
                Your team has been notified. Continue uploading remaining documents, then submit when ready.
              </p>
              <button className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors">
                🚀 View Submission Portal
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Recommended Documents Section */}
      {recommendedDocs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-gray-900">
              Recommended Documents
            </h2>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
              Optional
            </span>
          </div>

          <p className="text-gray-600">
            These documents are not required but are recommended for a stronger IPO
            application and to address potential investor questions.
          </p>

          <div className="grid gap-4">
            {recommendedDocs.map((doc) => (
              <DocumentUploadCard
                key={doc.id}
                id={doc.id}
                name={doc.name}
                description={DOCUMENT_DESCRIPTIONS[doc.id] || ''}
                status={doc.status}
                isMandatory={false}
                files={doc.fileCount > 0 ? generateMockFiles(doc.id, doc.fileCount) : []}
                onDownloadTemplate={handleDownloadTemplate}
                onUploadFile={handleUploadFile}
                onRemoveFile={handleRemoveFile}
              />
            ))}
          </div>
        </div>
      )}

      {/* Support Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 border border-blue-200 rounded-xl p-6 space-y-4"
      >
        <h3 className="text-lg font-bold text-blue-900">💡 Need Help?</h3>
        <ul className="space-y-2 text-blue-800">
          <li className="flex gap-2">
            <span>📥</span>
            <span>
              <strong>Download templates</strong> for empty documents to see the
              required format
            </span>
          </li>
          <li className="flex gap-2">
            <span>📎</span>
            <span>
              <strong>Add multiple files</strong> for documents with multiple parts
              (e.g., Board Minutes + Resolutions)
            </span>
          </li>
          <li className="flex gap-2">
            <span>✅</span>
            <span>
              <strong>Reach 90%</strong> completion to get your team notified
            </span>
          </li>
          <li className="flex gap-2">
            <span>🛎️</span>
            <span>
              <strong>Hit 100%</strong> and ring the bell at the exchange!
            </span>
          </li>
        </ul>
      </motion.div>
    </div>
  )
}

// Helper to generate mock file data
function generateMockFiles(
  docId: string,
  count: number
): Array<{ id: string; name: string; size: number; uploadedAt: string; status: 'uploaded' | 'verified' }> {
  return Array.from({ length: count }).map((_, i) => ({
    id: `${docId}-file-${i + 1}`,
    name: `${docId.replace(/-/g, ' ')}_${i + 1}.pdf`,
    size: Math.random() * 2000 + 500,
    uploadedAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
    status: i === 0 ? 'verified' : 'uploaded',
  }))
}
