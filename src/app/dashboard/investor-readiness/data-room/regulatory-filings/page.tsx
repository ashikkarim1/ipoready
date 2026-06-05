'use client'

import { Shield, Download, Share2, CheckCircle, Clock, AlertCircle } from 'lucide-react'

export default function RegulatoryFilingsPage() {
  const filings = [
    { name: 'SEC Form S-1', status: 'Submitted', date: 'June 1, 2026', statusIcon: '📝', color: 'blue' },
    { name: 'DLOA (Tax Opinion)', status: 'Approved', date: 'May 28, 2026', statusIcon: '✅', color: 'green' },
    { name: 'Exchange Listing Application', status: 'Pending', date: 'May 25, 2026', statusIcon: '⏳', color: 'amber' },
    { name: 'State Blue Sky Compliance', status: 'Approved', date: 'April 15, 2026', statusIcon: '✅', color: 'green' },
    { name: 'SOX 404 Attestation', status: 'Submitted', date: 'June 3, 2026', statusIcon: '📝', color: 'blue' },
    { name: 'Executive Compensation Disclosure', status: 'Draft', date: 'June 5, 2026', statusIcon: '✏️', color: 'gray' },
    { name: 'Risk Factors Disclosure', status: 'Draft', date: 'June 4, 2026', statusIcon: '✏️', color: 'gray' },
    { name: 'MD&A Section', status: 'Under Review', date: 'June 2, 2026', statusIcon: '👀', color: 'amber' },
  ]

  const getStatusColor = (status: string) => {
    if (status === 'Approved') return 'bg-green-50 border-green-200'
    if (status === 'Submitted') return 'bg-blue-50 border-blue-200'
    if (status === 'Pending' || status === 'Under Review') return 'bg-amber-50 border-amber-200'
    return 'bg-gray-50 border-gray-200'
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="h2 mb-2">Regulatory Filings</h1>
              <p className="body text-muted-foreground">SEC filings, compliance certifications, and regulatory approvals</p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-secondary transition flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                <span className="body-sm">Share</span>
              </button>
              <button className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition flex items-center gap-2">
                <Download className="w-4 h-4" />
                <span className="body-sm">Download</span>
              </button>
            </div>
          </div>

          {/* Status Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg bg-secondary">
              <p className="label text-muted-foreground mb-1">Total Filings</p>
              <p className="h3">8</p>
            </div>
            <div className="p-4 border border-green-200 rounded-lg bg-green-50">
              <p className="label text-green-700 mb-1">Approved</p>
              <p className="h3 text-green-700">2</p>
            </div>
            <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
              <p className="label text-blue-700 mb-1">Submitted</p>
              <p className="h3 text-blue-700">2</p>
            </div>
            <div className="p-4 border border-amber-200 rounded-lg bg-amber-50">
              <p className="label text-amber-700 mb-1">In Progress</p>
              <p className="h3 text-amber-700">2</p>
            </div>
          </div>
        </div>

        {/* Filings List */}
        <div className="space-y-4 mb-12">
          {filings.map((filing) => (
            <div key={filing.name} className={`p-6 border-2 rounded-lg ${getStatusColor(filing.status)}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{filing.statusIcon}</span>
                    <h3 className="h4">{filing.name}</h3>
                    <span className={`label-sm px-2 py-1 rounded font-medium ${
                      filing.status === 'Approved' ? 'bg-green-200 text-green-800' :
                      filing.status === 'Submitted' ? 'bg-blue-200 text-blue-800' :
                      filing.status === 'Pending' || filing.status === 'Under Review' ? 'bg-amber-200 text-amber-800' :
                      'bg-gray-200 text-gray-800'
                    }`}>
                      {filing.status}
                    </span>
                  </div>
                  <p className="caption text-muted-foreground">Filed: {filing.date}</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 border border-gray-300 rounded hover:bg-white transition">
                    👁️
                  </button>
                  <button className="p-2 border border-gray-300 rounded hover:bg-white transition">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <section className="border-t border-gray-200 pt-12">
          <h2 className="h3 mb-8">IPO Filing Timeline</h2>
          <div className="space-y-6">
            {[
              { date: 'April 15, 2026', event: 'State Blue Sky filings submitted', completed: true },
              { date: 'May 25, 2026', event: 'Exchange listing application filed', completed: true },
              { date: 'May 28, 2026', event: 'DLOA (tax opinion) approved by IRS', completed: true },
              { date: 'June 1, 2026', event: 'SEC Form S-1 registration statement filed', completed: true },
              { date: 'June 15 (Est.)', event: 'SEC comment period begins', completed: false },
              { date: 'July 15 (Est.)', event: 'SEC comments received and addressed', completed: false },
              { date: 'August 1 (Est.)', event: 'Amendment filed addressing comments', completed: false },
              { date: 'September 1 (Est.)', event: 'IPO pricing and launch', completed: false },
            ].map((milestone, idx) => (
              <div key={milestone.event} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-4 h-4 rounded-full ${
                    milestone.completed ? 'bg-primary' : 'bg-gray-300'
                  }`}></div>
                  {idx < 7 && <div className="w-0.5 h-12 bg-gray-200 mt-2"></div>}
                </div>
                <div className="pb-6">
                  <p className="label font-medium">{milestone.date}</p>
                  <p className="body-sm text-muted-foreground">{milestone.event}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
