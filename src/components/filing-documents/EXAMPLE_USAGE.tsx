'use client'

import { useState } from 'react'
import { DocumentChecklist, DocumentItem } from './DocumentChecklist'

/**
 * Example implementation of the DocumentChecklist component
 * This demonstrates how to integrate the filing documents UI into your application
 */

const SAMPLE_DOCUMENTS: DocumentItem[] = [
  // FINANCIAL DOCUMENTS
  {
    id: 'fin-001',
    name: 'Balance Sheet',
    description: 'Audited balance sheet for the past 3 fiscal years',
    category: 'Financial',
    status: 'uploaded',
    isRequired: true,
    uploadedDate: 'June 1, 2026',
    uploadedBy: 'CFO',
    fileUrl: '/files/balance-sheet.pdf',
    fileSize: '1.2 MB',
    templateUrl: '/templates/balance-sheet-template.xlsx',
    guideUrl: '/guides/balance-sheet-guide.md',
    checklistItems: [
      'Assets section complete',
      'Liabilities section complete',
      'Equity section complete',
      'Auditor certification included',
    ],
  },
  {
    id: 'fin-002',
    name: 'Income Statement',
    description: 'Income statements for the past 3 fiscal years',
    category: 'Financial',
    status: 'uploaded',
    isRequired: true,
    uploadedDate: 'June 1, 2026',
    uploadedBy: 'CFO',
    fileUrl: '/files/income-statement.pdf',
    fileSize: '0.8 MB',
    estimatedDays: 5,
    checklistItems: [
      'Revenue recognized correctly',
      'Expenses categorized',
      'Net income calculated',
    ],
  },
  {
    id: 'fin-003',
    name: 'Cash Flow Statement',
    description: 'Cash flow statements for the past 3 fiscal years',
    category: 'Financial',
    status: 'in_progress',
    isRequired: true,
    estimatedDays: 7,
    templateUrl: '/templates/cash-flow-template.xlsx',
    checklistItems: [
      'Operating activities',
      'Investing activities',
      'Financing activities',
    ],
  },
  {
    id: 'fin-004',
    name: 'Tax Returns',
    description: 'Corporate tax returns for the past 3 years',
    category: 'Financial',
    status: 'not_started',
    isRequired: true,
    estimatedDays: 10,
    templateUrl: '/templates/tax-return-template.pdf',
  },
  {
    id: 'fin-005',
    name: 'MD&A (Management Discussion & Analysis)',
    description: 'Discussion of financial results and operational performance',
    category: 'Financial',
    status: 'in_progress',
    isRequired: true,
    estimatedDays: 12,
  },
  {
    id: 'fin-006',
    name: 'Forecast Documents',
    description: 'Financial forecasts for the next 3 years',
    category: 'Financial',
    status: 'not_started',
    isRequired: false,
    estimatedDays: 14,
  },

  // LEGAL DOCUMENTS
  {
    id: 'leg-001',
    name: 'Articles of Incorporation',
    description: 'Original articles of incorporation and any amendments',
    category: 'Legal',
    status: 'uploaded',
    isRequired: true,
    uploadedDate: 'May 28, 2026',
    uploadedBy: 'General Counsel',
    fileUrl: '/files/articles-of-incorporation.pdf',
    fileSize: '2.1 MB',
    templateUrl: '/templates/articles-template.docx',
    checklistItems: [
      'Original articles included',
      'All amendments included',
      'Corporate seal attached',
    ],
  },
  {
    id: 'leg-002',
    name: 'Bylaws',
    description: 'Current corporate bylaws',
    category: 'Legal',
    status: 'in_progress',
    isRequired: true,
    estimatedDays: 5,
    templateUrl: '/templates/bylaws-template.docx',
  },
  {
    id: 'leg-003',
    name: 'Material Contracts',
    description: 'Key commercial agreements, licenses, and employment contracts',
    category: 'Legal',
    status: 'not_started',
    isRequired: true,
    estimatedDays: 15,
  },
  {
    id: 'leg-004',
    name: 'Litigation Summary',
    description: 'Summary of any past or pending legal proceedings',
    category: 'Legal',
    status: 'uploaded',
    isRequired: true,
    uploadedDate: 'June 2, 2026',
    uploadedBy: 'General Counsel',
    fileUrl: '/files/litigation-summary.pdf',
    fileSize: '0.5 MB',
  },
  {
    id: 'leg-005',
    name: 'Regulatory Approvals',
    description: 'Licenses, permits, and regulatory compliance certifications',
    category: 'Legal',
    status: 'in_progress',
    isRequired: false,
    estimatedDays: 8,
  },

  // GOVERNANCE DOCUMENTS
  {
    id: 'gov-001',
    name: 'Board Resolutions',
    description: 'Board approval for IPO and authorization of officers',
    category: 'Governance',
    status: 'ready',
    isRequired: true,
    estimatedDays: 3,
    templateUrl: '/templates/board-resolutions-template.docx',
    checklistItems: [
      'IPO approval',
      'Officer authorization',
      'Delegation of authority',
    ],
  },
  {
    id: 'gov-002',
    name: 'Shareholder Resolutions',
    description: 'Shareholder approval for IPO and related matters',
    category: 'Governance',
    status: 'not_started',
    isRequired: true,
    estimatedDays: 7,
    templateUrl: '/templates/shareholder-resolutions-template.docx',
  },
  {
    id: 'gov-003',
    name: 'Corporate Governance Policy',
    description: 'Board independence policy and code of conduct',
    category: 'Governance',
    status: 'uploaded',
    isRequired: false,
    uploadedDate: 'June 3, 2026',
    uploadedBy: 'Corporate Secretary',
    fileUrl: '/files/governance-policy.pdf',
    fileSize: '1.8 MB',
  },

  // CORPORATE DOCUMENTS
  {
    id: 'corp-001',
    name: 'Capitalization Table',
    description: 'Complete record of share ownership and equity structure',
    category: 'Corporate',
    status: 'uploaded',
    isRequired: true,
    uploadedDate: 'June 4, 2026',
    uploadedBy: 'Corporate Finance',
    fileUrl: '/files/cap-table.xlsx',
    fileSize: '3.2 MB',
    checklistItems: [
      'Common shares listed',
      'Preferred shares listed',
      'Options and warrants',
      'All conversions calculated',
    ],
  },
  {
    id: 'corp-002',
    name: 'Equity Agreements',
    description: 'Stock option plans, warrants, convertible notes',
    category: 'Corporate',
    status: 'in_progress',
    isRequired: true,
    estimatedDays: 9,
  },
  {
    id: 'corp-003',
    name: 'Related Party Transactions',
    description: 'Disclosure of transactions with related parties',
    category: 'Corporate',
    status: 'not_started',
    isRequired: false,
    estimatedDays: 6,
  },

  // COMPLIANCE DOCUMENTS
  {
    id: 'comp-001',
    name: 'Insurance Certificates',
    description: 'Current directors and officers liability insurance',
    category: 'Compliance',
    status: 'uploaded',
    isRequired: true,
    uploadedDate: 'June 1, 2026',
    uploadedBy: 'Risk Management',
    fileUrl: '/files/insurance-cert.pdf',
    fileSize: '1.1 MB',
  },
  {
    id: 'comp-002',
    name: 'Environmental Compliance',
    description: 'Environmental permits and compliance certifications',
    category: 'Compliance',
    status: 'not_started',
    isRequired: false,
    estimatedDays: 8,
  },
  {
    id: 'comp-003',
    name: 'Labor & Employment Compliance',
    description: 'Employment agreements, benefits plans, and HR policies',
    category: 'Compliance',
    status: 'in_progress',
    isRequired: true,
    estimatedDays: 10,
  },
  {
    id: 'comp-004',
    name: 'Data Privacy & Security',
    description: 'GDPR/CCPA compliance documentation',
    category: 'Compliance',
    status: 'uploaded',
    isRequired: false,
    uploadedDate: 'May 30, 2026',
    uploadedBy: 'Privacy Officer',
    fileUrl: '/files/privacy-compliance.pdf',
    fileSize: '0.9 MB',
  },
]

export function FilingDocumentsExample() {
  const [documents, setDocuments] = useState<DocumentItem[]>(SAMPLE_DOCUMENTS)
  const [uploadingId, setUploadingId] = useState<string | null>(null)

  const handleUpload = async (documentId: string, file: File) => {
    setUploadingId(documentId)

    // Simulate file upload to backend
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Update document status
    setDocuments((prevDocs) =>
      prevDocs.map((doc) =>
        doc.id === documentId
          ? {
              ...doc,
              status: 'uploaded' as const,
              uploadedDate: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }),
              uploadedBy: 'You',
              fileUrl: `/files/${file.name}`,
              fileSize: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
            }
          : doc
      )
    )

    setUploadingId(null)
  }

  const handleDelete = async (documentId: string) => {
    // Simulate delete from backend
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setDocuments((prevDocs) =>
      prevDocs.map((doc) =>
        doc.id === documentId
          ? {
              ...doc,
              status: 'not_started' as const,
              uploadedDate: undefined,
              uploadedBy: undefined,
              fileUrl: undefined,
              fileSize: undefined,
            }
          : doc
      )
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <DocumentChecklist
          exchange="TSX"
          companyId="company-001"
          documents={documents}
          onUpload={handleUpload}
          onDelete={handleDelete}
          title="IPO Filing Documents Checklist"
          subtitle="Complete all required documents to prepare for your Toronto Stock Exchange listing"
        />
      </div>
    </div>
  )
}

export default FilingDocumentsExample
