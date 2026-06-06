'use client'

import { useState } from 'react'
import { FileText, Download, Share2, TrendingUp, Users, Target, DollarSign, Clock } from 'lucide-react'

export default function ExecutiveSummaryPage() {
  const [isDownloading, setIsDownloading] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="serif text-4xl font-bold text-nav mb-2">Executive Summary</h1>
              <p className="body text-text-secondary">Company overview and investment highlights for investor review</p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-secondary transition flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                <span className="body-sm">Share</span>
              </button>
              <button
                onClick={() => setIsDownloading(true)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span className="body-sm">Download</span>
              </button>
            </div>
          </div>

          {/* Document Info */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg bg-secondary">
              <p className="label text-muted-foreground mb-1">Last Updated</p>
              <p className="h4">June 5, 2026</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg bg-secondary">
              <p className="label text-muted-foreground mb-1">File Format</p>
              <p className="h4">PDF (8.3 MB)</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg bg-secondary">
              <p className="label text-muted-foreground mb-1">Access Level</p>
              <p className="h4">Full Document</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg bg-secondary">
              <p className="label text-muted-foreground mb-1">Views</p>
              <p className="h4">24 investor views</p>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-12">
          {/* Business Overview */}
          <section className="border-b border-gray-200 pb-12">
            <h2 className="h4 text-nav mb-4">Business Overview</h2>
            <div className="space-y-4">
              <p className="body text-muted-foreground">
                We are a leading SaaS platform that provides IPO readiness solutions to pre-IPO companies. Our comprehensive suite helps companies prepare for their public market debut with intelligent automation, expert guidance, and real-time insights.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="p-6 bg-secondary rounded-lg border border-gray-200">
                  <h3 className="h4 mb-3">Market Opportunity</h3>
                  <p className="body-sm text-muted-foreground mb-4">
                    The global IPO market represents a $50B+ annual opportunity with 500+ companies planning IPOs in the next 3 years.
                  </p>
                  <p className="label text-primary font-medium">TAM: $500M+</p>
                </div>
                <div className="p-6 bg-secondary rounded-lg border border-gray-200">
                  <h3 className="h4 mb-3">Competitive Advantage</h3>
                  <p className="body-sm text-muted-foreground mb-4">
                    Our proprietary PACE™ framework and AI-powered intelligence provide unmatched accuracy in IPO readiness prediction.
                  </p>
                  <p className="label text-primary font-medium">87% Prediction Accuracy</p>
                </div>
              </div>
            </div>
          </section>

          {/* Key Metrics */}
          <section className="border-b border-gray-200 pb-12">
            <h2 className="h4 text-nav mb-4">Investment Highlights</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Current ARR', value: '$45.2M', icon: DollarSign, change: '+44.8% YoY' },
                { label: 'Customer Base', value: '1,250+', icon: Users, change: 'Enterprise focus' },
                { label: 'Growth Rate', value: '45% YoY', icon: TrendingUp, change: 'Accelerating' },
                { label: 'Runway', value: '36 months', icon: Clock, change: 'Post-IPO' },
              ].map((metric) => (
                <div key={metric.label} className="p-6 border border-gray-200 rounded-lg hover:shadow-sm transition">
                  <div className="flex items-start justify-between mb-4">
                    <p className="label text-muted-foreground">{metric.label}</p>
                    <metric.icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="h3 mb-2">{metric.value}</p>
                  <p className="caption text-muted-foreground">{metric.change}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Use of Proceeds */}
          <section className="border-b border-gray-200 pb-12">
            <h2 className="h3 mb-6">Use of Proceeds</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { category: 'Product & Engineering', percent: '45%', amount: '$180M', description: 'AI platform enhancement, global expansion' },
                { category: 'Sales & Marketing', percent: '35%', amount: '$140M', description: 'Enterprise sales team, brand building' },
                { category: 'Corporate', percent: '20%', amount: '$80M', description: 'Operations, working capital' },
              ].map((item) => (
                <div key={item.category} className="p-6 bg-secondary rounded-lg border border-gray-200">
                  <h4 className="h4 mb-2">{item.category}</h4>
                  <p className="h3 text-primary mb-1">{item.percent}</p>
                  <p className="label-sm text-muted-foreground mb-3">{item.amount}</p>
                  <p className="body-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Timeline */}
          <section>
            <h2 className="h3 mb-6">Roadmap to IPO</h2>
            <div className="space-y-4">
              {[
                { milestone: 'Board Approval', date: 'June 2026', status: 'complete' },
                { milestone: 'SEC Filing (S-1)', date: 'July 2026', status: 'current' },
                { milestone: 'Roadshow', date: 'August 2026', status: 'upcoming' },
                { milestone: 'IPO Launch', date: 'September 2026', status: 'upcoming' },
              ].map((item, idx) => (
                <div key={item.milestone} className="flex items-center gap-4">
                  <div className={`w-4 h-4 rounded-full ${
                    item.status === 'complete' ? 'bg-accent' :
                    item.status === 'current' ? 'bg-primary' : 'bg-gray-300'
                  }`}></div>
                  <div className="flex-1">
                    <p className="label font-medium">{item.milestone}</p>
                    <p className="caption text-muted-foreground">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
