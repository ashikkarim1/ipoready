'use client'

import { useState } from 'react'
import { FileText, Download, Share2, Edit2, Eye } from 'lucide-react'

export default function ExecutiveSummaryPage() {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="h2 flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" />
            Executive Summary
          </h1>
          <p className="body-sm text-muted-foreground mt-1">
            Company overview and investment highlights
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border rounded-lg hover:bg-secondary transition flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            Share
          </button>
          <button className="px-4 py-2 border rounded-lg hover:bg-secondary transition flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>

      {/* Document Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg">
          <p className="label text-muted-foreground">Last Updated</p>
          <p className="body font-medium">June 5, 2026</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="label text-muted-foreground">Pages</p>
          <p className="body font-medium">12 pages</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="label text-muted-foreground">Status</p>
          <p className="body font-medium text-accent">Ready for Investors</p>
        </div>
      </div>

      {/* Document Preview */}
      <div className="border rounded-lg p-8 bg-secondary">
        <div className="space-y-6 max-w-3xl">
          <section>
            <h2 className="h3 mb-3">Company Overview</h2>
            <p className="body text-muted-foreground">
              [Executive Summary Document Preview]
            </p>
            <p className="body text-muted-foreground mt-3">
              This is where the executive summary document would be displayed. In production, this would show:
            </p>
            <ul className="list-disc list-inside space-y-2 body-sm text-muted-foreground mt-2">
              <li>Company mission and vision</li>
              <li>Market opportunity and size</li>
              <li>Competitive advantages</li>
              <li>Business model and revenue streams</li>
              <li>Key metrics and milestones</li>
              <li>Use of proceeds</li>
              <li>Timeline to profitability</li>
            </ul>
          </section>

          <section className="pt-6 border-t">
            <h3 className="h4 mb-3">Investment Highlights</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Market Size', value: '$12.5B TAM' },
                { label: 'Growth Rate', value: '45% YoY' },
                { label: 'Current ARR', value: '$45.2M' },
                { label: 'Customers', value: '1,250+' },
              ].map((metric) => (
                <div key={metric.label} className="p-3 bg-background rounded border">
                  <p className="label-sm text-muted-foreground">{metric.label}</p>
                  <p className="h4">{metric.value}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Document Actions */}
      <div className="flex gap-2">
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition flex items-center gap-2">
          <Eye className="w-4 h-4" />
          View Full Document
        </button>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 border rounded-lg hover:bg-secondary transition flex items-center gap-2"
        >
          <Edit2 className="w-4 h-4" />
          {isEditing ? 'Done Editing' : 'Edit Document'}
        </button>
      </div>
    </div>
  )
}
