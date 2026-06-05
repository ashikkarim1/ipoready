'use client'

import { useState } from 'react'
import { Shield, Download, Share2, CheckCircle, AlertCircle, Eye } from 'lucide-react'

export default function RegulatoryFilingsPage() {
  const [filterStatus, setFilterStatus] = useState('all')

  const filings = [
    {
      id: 'sec-form-s1',
      name: 'SEC Form S-1',
      description: 'Registration statement for IPO',
      filed: 'June 1, 2026',
      status: 'Submitted',
      agency: 'SEC',
      relevance: 'Critical',
    },
    {
      id: 'dloa',
      name: 'DLOA - Determination Letter Opinion Agreement',
      description: 'Tax authority approval for IPO structure',
      filed: 'May 28, 2026',
      status: 'Approved',
      agency: 'IRS',
      relevance: 'Critical',
    },
    {
      id: 'list-approval',
      name: 'Exchange Listing Application',
      description: 'Application for stock exchange listing',
      filed: 'May 25, 2026',
      status: 'Pending',
      agency: 'NYSE',
      relevance: 'Critical',
    },
    {
      id: 'state-compliance',
      name: 'State Blue Sky Compliance',
      description: 'State securities law compliance filings',
      filed: 'April 15, 2026',
      status: 'Approved',
      agency: 'State Securities Boards',
      relevance: 'High',
    },
    {
      id: 'edgar-filings',
      name: 'EDGAR Filings Repository',
      description: 'All SEC EDGAR filings and amendments',
      filed: 'Ongoing',
      status: 'Current',
      agency: 'SEC',
      relevance: 'High',
    },
    {
      id: 'compliance-cert',
      name: 'SOX Compliance Certification',
      description: 'Sarbanes-Oxley Act compliance documentation',
      filed: 'June 3, 2026',
      status: 'Submitted',
      agency: 'SEC',
      relevance: 'High',
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'text-green-600'
      case 'Submitted':
        return 'text-blue-600'
      case 'Pending':
        return 'text-amber-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    if (status === 'Approved') {
      return <CheckCircle className="w-4 h-4" />
    }
    if (status === 'Pending') {
      return <AlertCircle className="w-4 h-4" />
    }
    return <CheckCircle className="w-4 h-4" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="h2 flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            Regulatory Filings
          </h1>
          <p className="body-sm text-muted-foreground mt-1">
            SEC filings, compliance certifications, and regulatory approvals
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

      {/* Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 border rounded-lg">
          <p className="label text-muted-foreground">Total Filings</p>
          <p className="h3">6</p>
        </div>
        <div className="p-4 border rounded-lg border-green-200 bg-green-50">
          <p className="label text-muted-foreground">Approved</p>
          <p className="h3 text-green-600">2</p>
        </div>
        <div className="p-4 border rounded-lg border-blue-200 bg-blue-50">
          <p className="label text-muted-foreground">Submitted</p>
          <p className="h3 text-blue-600">2</p>
        </div>
        <div className="p-4 border rounded-lg border-amber-200 bg-amber-50">
          <p className="label text-muted-foreground">Pending</p>
          <p className="h3 text-amber-600">1</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {[
          { value: 'all', label: 'All Filings' },
          { value: 'approved', label: 'Approved' },
          { value: 'pending', label: 'Pending' },
          { value: 'critical', label: 'Critical' },
        ].map((filter) => (
          <button
            key={filter.value}
            onClick={() => setFilterStatus(filter.value)}
            className={`px-4 py-2 rounded-lg transition ${
              filterStatus === filter.value
                ? 'bg-primary text-primary-foreground'
                : 'border hover:bg-secondary'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Filings List */}
      <div className="space-y-3">
        {filings.map((filing) => (
          <div
            key={filing.id}
            className="border rounded-lg p-4 hover:bg-secondary/50 transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <h3 className="h4">{filing.name}</h3>
                  <span className={`label-xs flex items-center gap-1 ${getStatusColor(filing.status)}`}>
                    {getStatusIcon(filing.status)}
                    {filing.status}
                  </span>
                </div>
                <p className="body-sm text-muted-foreground mb-2">{filing.description}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{filing.agency}</span>
                  <span>Filed: {filing.filed}</span>
                  <span className={filing.relevance === 'Critical' ? 'text-red-600 font-medium' : ''}>
                    {filing.relevance}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  className="p-2 border rounded hover:bg-secondary transition"
                  title="View filing"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  className="p-2 border rounded hover:bg-secondary transition"
                  title="Download filing"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filing Timeline */}
      <div className="p-4 border rounded-lg bg-secondary space-y-4">
        <h3 className="h4">IPO Filing Timeline</h3>
        <div className="space-y-3">
          {[
            { date: 'April 15', event: 'State Blue Sky filings submitted', status: 'complete' },
            { date: 'May 25', event: 'Exchange listing application submitted', status: 'complete' },
            { date: 'May 28', event: 'DLOA approval received from IRS', status: 'complete' },
            { date: 'June 1', event: 'SEC S-1 registration statement filed', status: 'complete' },
            { date: 'June 15 (Est.)', event: 'SEC comment period begins', status: 'pending' },
            { date: 'July 15 (Est.)', event: 'Expected effectiveness', status: 'pending' },
          ].map((item, idx) => (
            <div key={idx} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`w-3 h-3 rounded-full ${
                    item.status === 'complete' ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                ></div>
                {idx < 5 && <div className="w-0.5 h-8 bg-gray-200 mt-1"></div>}
              </div>
              <div className="pb-4">
                <p className="label font-medium">{item.date}</p>
                <p className="body-sm text-muted-foreground">{item.event}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance Notes */}
      <div className="p-4 border rounded-lg space-y-3">
        <h3 className="h4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Regulatory Requirements
        </h3>
        <ul className="space-y-2 body-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>Maintain confidentiality of filings until public announcement</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>Respond to SEC comments within required timeframes</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>Comply with quiet period restrictions once S-1 is filed</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>Maintain SOX compliance throughout underwriting process</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
