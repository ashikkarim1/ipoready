'use client'

import { FileCheck, Download, Share2, Lock, Eye } from 'lucide-react'

export default function LegalDocumentsPage() {
  const documents = [
    { name: 'Articles of Incorporation', date: 'June 1, 2026', status: 'Current', icon: '📄' },
    { name: 'Bylaws & Governance', date: 'May 15, 2026', status: 'Current', icon: '📋' },
    { name: 'Cap Table & Equity Plans', date: 'June 3, 2026', status: 'Current', icon: '📊' },
    { name: 'Material Contracts', date: 'May 20, 2026', status: 'Current', icon: '🤝' },
    { name: 'IP Ownership & Patents', date: 'April 10, 2026', status: 'Current', icon: '🔒' },
    { name: 'Board Resolutions', date: 'June 4, 2026', status: 'Current', icon: '✅' },
    { name: 'Shareholder Agreements', date: 'March 20, 2025', status: 'Current', icon: '👥' },
    { name: 'Tax Clearance Certificates', date: 'May 15, 2026', status: 'Current', icon: '🏛️' },
  ]

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="serif text-4xl font-bold text-nav mb-2">Legal Documents</h1>
              <p className="body text-text-secondary">Corporate governance, contracts, and IP documentation</p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-secondary transition flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                <span className="body-sm">Share</span>
              </button>
              <button className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition flex items-center gap-2">
                <Download className="w-4 h-4" />
                <span className="body-sm">Download All</span>
              </button>
            </div>
          </div>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {documents.map((doc) => (
            <div key={doc.name} className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition group">
              <div className="flex items-start justify-between mb-4">
                <span className="text-2xl">{doc.icon}</span>
                <FileCheck className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition" />
              </div>
              <h3 className="h4 mb-2 line-clamp-2">{doc.name}</h3>
              <div className="space-y-2">
                <p className="caption text-muted-foreground">Updated: {doc.date}</p>
                <div className="flex items-center gap-2">
                  <Lock className="w-3 h-3 text-primary" />
                  <span className="label-sm text-primary">{doc.status}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                <button className="flex-1 py-2 border border-gray-300 rounded hover:bg-secondary transition flex items-center justify-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span className="body-sm">View</span>
                </button>
                <button className="flex-1 py-2 bg-primary text-white rounded hover:opacity-90 transition flex items-center justify-center gap-1">
                  <Download className="w-4 h-4" />
                  <span className="body-sm">Get</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Documentation Summary */}
        <section className="border-t border-gray-200 pt-12">
          <h2 className="h4 text-nav mb-4">Legal Documentation Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 border border-gray-200 rounded-lg bg-secondary">
              <h3 className="h4 mb-4">Corporate Structure</h3>
              <ul className="space-y-3">
                {[
                  'Delaware C-Corporation (best for IPO)',
                  'Board of Directors: 7 members',
                  'Audit Committee: 3 independent members',
                  'Compensation Committee: Fully independent',
                  'SOX 404 compliance ready',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 body-sm">
                    <span className="text-primary mt-1">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 border border-gray-200 rounded-lg bg-secondary">
              <h3 className="h4 mb-4">IP & Intellectual Property</h3>
              <ul className="space-y-3">
                {[
                  '12 issued patents (core technology)',
                  '18 pending patent applications',
                  'Proprietary algorithms (PACE™)',
                  'All IP properly assigned to company',
                  'No third-party IP disputes',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 body-sm">
                    <span className="text-primary mt-1">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
