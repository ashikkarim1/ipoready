'use client'

import { useState } from 'react'
import { FileCheck, Download, Share2, Lock, Eye } from 'lucide-react'

export default function LegalDocumentsPage() {
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null)

  const documents = [
    {
      id: 'articles',
      name: 'Articles of Incorporation',
      description: 'Company charter and governance structure',
      lastUpdated: 'June 1, 2026',
      status: 'Current',
      pages: 8,
    },
    {
      id: 'bylaws',
      name: 'Bylaws',
      description: 'Corporate governance and operational procedures',
      lastUpdated: 'May 15, 2026',
      status: 'Current',
      pages: 12,
    },
    {
      id: 'cap-table',
      name: 'Capitalization Table',
      description: 'Share structure and equity allocations',
      lastUpdated: 'June 3, 2026',
      status: 'Current',
      pages: 5,
    },
    {
      id: 'stock-plan',
      name: 'Stock Option Plan',
      description: '2024 Equity Incentive Plan documentation',
      lastUpdated: 'January 10, 2024',
      status: 'Current',
      pages: 18,
    },
    {
      id: 'shareholders',
      name: 'Shareholders Agreement',
      description: 'Rights and obligations of shareholders',
      lastUpdated: 'March 20, 2025',
      status: 'Current',
      pages: 15,
    },
    {
      id: 'board-resolutions',
      name: 'Board Resolutions',
      description: 'Key board decisions and approvals',
      lastUpdated: 'June 4, 2026',
      status: 'Current',
      pages: 22,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="h2 flex items-center gap-3">
            <FileCheck className="w-8 h-8 text-primary" />
            Legal Documents
          </h1>
          <p className="body-sm text-muted-foreground mt-1">
            Articles, bylaws, and corporate governance documents
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border rounded-lg hover:bg-secondary transition flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            Share
          </button>
          <button className="px-4 py-2 border rounded-lg hover:bg-secondary transition flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download All
          </button>
        </div>
      </div>

      {/* Documents List */}
      <div className="space-y-3">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="border rounded-lg p-4 hover:bg-secondary/50 transition cursor-pointer"
            onClick={() => setExpandedDoc(expandedDoc === doc.id ? null : doc.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <FileCheck className="w-5 h-5 text-primary" />
                  <h3 className="h4">{doc.name}</h3>
                  <span className="label-xs bg-secondary px-2 py-1 rounded">
                    {doc.pages} pages
                  </span>
                </div>
                <p className="body-sm text-muted-foreground mb-2">{doc.description}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Last Updated: {doc.lastUpdated}</span>
                  <span className="flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Status: {doc.status}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 border rounded hover:bg-secondary transition"
                  title="View document"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 border rounded hover:bg-secondary transition"
                  title="Download document"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedDoc === doc.id && (
              <div className="mt-4 pt-4 border-t space-y-2">
                <p className="body-sm">
                  <strong>Document Type:</strong> Legal Governance Document
                </p>
                <p className="body-sm">
                  <strong>Prepared by:</strong> Company Legal Department
                </p>
                <p className="body-sm">
                  <strong>Reviewed by:</strong> External Counsel
                </p>
                <div className="flex gap-2 pt-2">
                  <button className="px-3 py-2 bg-primary text-primary-foreground rounded text-sm hover:opacity-90 transition flex items-center gap-2">
                    <Eye className="w-3 h-3" />
                    View Full Document
                  </button>
                  <button className="px-3 py-2 border rounded text-sm hover:bg-secondary transition flex items-center gap-2">
                    <Download className="w-3 h-3" />
                    Download
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Document Management Info */}
      <div className="p-4 border rounded-lg bg-secondary space-y-3">
        <h3 className="h4">Document Management</h3>
        <ul className="space-y-2 body-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
            All documents are maintained in secure storage
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
            Access is controlled and logged for compliance
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
            Documents are reviewed and updated annually
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
            Board resolutions are recorded with meeting minutes
          </li>
        </ul>
      </div>
    </div>
  )
}
