'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Header } from '@/app/components/Header'
import dynamic from 'next/dynamic'
import { CheckCircle2 } from 'lucide-react'

const SimpleRocket = dynamic(
  () => import('@/components/SimpleRocket').then(mod => mod.SimpleRocket),
  { ssr: false }
)

export default function LandingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      router.replace('/dashboard')
    }
  }, [status, session, router])

  return (
    <div className="min-h-screen" style={{ colorScheme: 'light' }}>
      <SimpleRocket />
      <Header />

      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: Copy */}
          <div className="order-2 md:order-1">
            <div className="flex items-center gap-2 mb-6">
              <span className="inline-block px-3 py-1 bg-red-100 text-red-600 text-xs sm:text-sm font-bold uppercase rounded-full">
                The IPO Operating System
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight mb-4 sm:mb-6" style={{ color: '#1A1A1A' }}>
              Manage your entire IPO journey
              <span style={{ color: '#E8312A' }}> from first resolution to the bell—and beyond.</span>
            </h1>

            <p className="text-base sm:text-lg mb-6 sm:mb-8" style={{ color: '#717171' }}>
              Tell us your exchange and listing type — IPOReady instantly builds your personalized 180+ task roadmap, assigns workstreams to your team, and tracks your velocity toward listing day.
            </p>

            <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-10">
              {['180+ pre-built tasks across all exchanges', 'PACE™ Score predicts your listing date in real-time', 'Coordinate your entire team and expert network'].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#E8312A' }} />
                  <p className="text-sm sm:text-base" style={{ color: '#717171' }}>{item}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link href="/register" className="px-6 py-3 bg-red-500 text-white font-bold rounded-lg text-center hover:bg-red-600 transition-colors text-sm sm:text-base">
                Get Started Free
              </Link>
              <Link href="/pricing" className="px-6 py-3 border-2 border-red-500 text-red-600 font-bold rounded-lg text-center hover:bg-red-50 transition-colors text-sm sm:text-base">
                View Pricing
              </Link>
            </div>
          </div>

          {/* Right: Dashboard Showcase */}
          <div
            className="w-full overflow-hidden order-1 md:order-2"
            style={{
              borderRadius: '16px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              minHeight: '400px'
            }}
          >
            <img
              src="/images/mainmenu.png"
              alt="IPOReady Mission Control Dashboard"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '16px'
              }}
            />
          </div>
        </div>
      </section>

      {/* End-to-End IPO Journey Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-center mb-2" style={{ color: '#1A1A1A' }}>
            Your Complete IPO Workflow
          </h2>
          <p className="text-center text-sm sm:text-base mb-8 sm:mb-12" style={{ color: '#717171' }}>
            From first board resolution through exchange approval and beyond—manage every phase in one platform
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {[
              { phase: 'Board & Planning', features: ['Pre-IPO readiness assessment', 'Corporate governance framework', 'Financial audit preparation', 'Regulatory roadmap by exchange'] },
              { phase: 'Capital Structure', features: ['Cap table modeling & analysis', 'Float & ownership requirements', 'Share class & vesting optimization', 'Exchange-specific minimums'] },
              { phase: 'Due Diligence', features: ['Document workspace & versioning', 'Legal & compliance checklists', 'Risk factor assessments', 'Audit trail & signatures'] },
              { phase: 'Marketing & Roadshow', features: ['Investor roadshow planning', 'Analyst coverage maps', 'Investor presentation builder', 'Feedback & sentiment tracking'] },
              { phase: 'Filing & Approval', features: ['SEC/Exchange filing workflows', 'Prospectus auto-builder', 'Comment response management', 'Multi-jurisdiction coordination'] },
              { phase: 'Listing & Beyond', features: ['Launch day coordination', 'Price discovery management', 'Post-IPO compliance tracking', 'Continuous reporting calendar'] },
            ].map((section) => (
              <div key={section.phase} className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 border border-red-100">
                <h3 className="font-bold text-lg mb-4" style={{ color: '#E8312A' }}>
                  {section.phase}
                </h3>
                <ul className="space-y-2">
                  {section.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm" style={{ color: '#717171' }}>
                      <span className="text-red-500 font-bold mt-0.5">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features Grid */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-center mb-2" style={{ color: '#1A1A1A' }}>
            Core Capabilities
          </h2>
          <p className="text-center text-sm sm:text-base mb-8 sm:mb-12" style={{ color: '#717171' }}>
            Purpose-built for the entire IPO journey across all major exchanges
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '📊', title: 'PACE™ Velocity Engine', description: 'AI-powered listing date prediction with real-time progress tracking toward your IPO' },
              { icon: '📋', title: '180+ IPO Milestones', description: 'Pre-built task templates customized for your exchange (TSX, NASDAQ, NYSE, CSE, TSXV, etc.)' },
              { icon: '💰', title: 'Cap Table Intelligence', description: 'Automated cap table modeling, float analysis, and ownership structure optimization' },
              { icon: '📈', title: 'Capital Raise Tracker', description: 'Track every funding round, valuation, and investor commitment from Series A through IPO' },
              { icon: '🗂️', title: 'Document Workspace', description: 'Centralized, version-controlled hub for prospectuses, legal docs, and regulatory filings' },
              { icon: '🤝', title: 'Expert Network', description: 'Direct access to vetted IPO lawyers, accountants, underwriters, and compliance experts' },
              { icon: '🎯', title: 'Analyst Coverage Maps', description: 'Research analyst tracking, engagement planning, and coverage prediction models' },
              { icon: '👥', title: 'Team Management', description: 'Workstream coordination, role assignments, and accountability across your IPO team' },
              { icon: '🔄', title: 'Multi-Jurisdiction Filings', description: 'Seamless support for dual listings, cross-border IPOs, and regulatory coordination' },
            ].map((feature) => (
              <div key={feature.title} className="bg-white rounded-xl p-6 border border-gray-200 hover:border-red-300 hover:shadow-lg transition-all">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="font-bold text-base sm:text-lg mb-2" style={{ color: '#1A1A1A' }}>
                  {feature.title}
                </h3>
                <p className="text-sm" style={{ color: '#717171' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements & Specifications */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-center mb-2" style={{ color: '#1A1A1A' }}>
            Exchange-Specific Requirements
          </h2>
          <p className="text-center text-sm sm:text-base mb-8 sm:mb-12" style={{ color: '#717171' }}>
            IPOReady automatically calculates your exact requirements based on your target exchange
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[
              {
                exchange: 'TSX (Canada)',
                requirements: [
                  'Minimum $5M public float (or $25M market cap)',
                  'Minimum 300 shareholders',
                  'Level 2 disclosure requirements',
                  'Canada Business Corporations Act compliance',
                  'SEDAR filing system',
                ]
              },
              {
                exchange: 'NASDAQ (US)',
                requirements: [
                  'Minimum $110M market cap or $550M revenue',
                  'Minimum $100M public float',
                  'Minimum 400+ beneficial owners',
                  'Sarbanes-Oxley compliance (SOX)',
                  'SEC Edgar filing system',
                ]
              },
              {
                exchange: 'CSE (Canada)',
                requirements: [
                  'Minimum $100K cash or equiv.',
                  'Minimum 300,000 freely tradeable shares',
                  'Lower regulatory burden than TSX',
                  'Expedited 30-day timeline possible',
                  'SEDAR filing system',
                ]
              },
              {
                exchange: 'Your Target Exchange',
                requirements: [
                  'Detailed cap table requirements',
                  'Minimum float & ownership percentages',
                  'Corporate governance standards',
                  'Ongoing compliance obligations',
                  'Analyst coverage minimums',
                ]
              },
            ].map((item) => (
              <div key={item.exchange} className="bg-white rounded-xl p-6 border-2 border-gray-200">
                <h3 className="font-bold text-lg mb-4" style={{ color: '#E8312A' }}>
                  {item.exchange}
                </h3>
                <ul className="space-y-3">
                  {item.requirements.map((req) => (
                    <li key={req} className="flex items-start gap-3 text-sm" style={{ color: '#717171' }}>
                      <span className="font-bold flex-shrink-0 mt-1">▸</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Required Team Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-center mb-2" style={{ color: '#1A1A1A' }}>
            Your IPO Team
          </h2>
          <p className="text-center text-sm sm:text-base mb-8 sm:mb-12" style={{ color: '#717171' }}>
            Coordinate across all specialists needed for a successful IPO process
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { role: 'CFO/Finance Lead', responsibilities: 'Financial statements, audits, cap table, valuation' },
              { role: 'IPO Legal Counsel', responsibilities: 'Corporate governance, filings, regulatory compliance' },
              { role: 'External Auditor', responsibilities: 'Financial audit, SOX controls (if applicable)' },
              { role: 'Underwriter', responsibilities: 'Pricing, marketing, investor relations' },
              { role: 'IR Manager', responsibilities: 'Roadshow, analyst relations, messaging' },
              { role: 'Compliance Officer', responsibilities: 'Ongoing SOX, exchange, and SEC compliance' },
              { role: 'Corporate Secretary', responsibilities: 'Board resolutions, shareholder approvals' },
              { role: 'Accounting Manager', responsibilities: 'Financial close, regulatory reporting' },
              { role: 'HR Lead', responsibilities: 'Employee communications, equity plan compliance' },
            ].map((member) => (
              <div key={member.role} className="bg-white rounded-xl p-6 border border-blue-200">
                <h3 className="font-bold text-base mb-2" style={{ color: '#E8312A' }}>
                  {member.role}
                </h3>
                <p className="text-sm" style={{ color: '#717171' }}>
                  {member.responsibilities}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            { value: '180+', label: 'IPO Milestones' },
            { value: '7', label: 'Exchanges' },
            { value: '60%', label: 'Less Overhead' },
            { value: '24h', label: 'Profile Review' },
          ].map((stat) => (
            <div key={stat.label} className="bg-red-50 rounded-lg p-4 sm:p-6 text-center">
              <p className="text-2xl sm:text-3xl font-black mb-2" style={{ color: '#E8312A' }}>
                {stat.value}
              </p>
              <p className="text-xs sm:text-sm font-semibold" style={{ color: '#717171' }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 max-w-4xl mx-auto text-center">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-black mb-4 sm:mb-6" style={{ color: '#1A1A1A' }}>
          Ready to Start Your IPO?
        </h2>
        <p className="text-base sm:text-lg mb-8 sm:mb-10" style={{ color: '#717171' }}>
          Join founders and CFOs managing their entire IPO on IPOReady.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Link href="/register" className="px-6 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors text-sm sm:text-base">
            Get Started Free
          </Link>
          <Link href="/demo" className="px-6 py-3 border-2 border-red-500 text-red-600 font-bold rounded-lg hover:bg-red-50 transition-colors text-sm sm:text-base">
            Book a Demo
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-12 sm:mt-16 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', marginBottom: '2rem' }}>
            {[
              {
                title: 'Exchanges',
                links: ['TSX', 'TSXV', 'CSE', 'NASDAQ', 'NYSE', 'OTC Markets', 'Cboe Canada']
              },
              {
                title: 'Listing Types',
                links: ['IPO', 'Direct Listing', 'RTO', 'SPAC', 'Regulation A+']
              },
              {
                title: 'Legal',
                links: ['Privacy Policy', 'Terms of Service', 'Disclaimer', 'Cookie Policy']
              },
              {
                title: 'Support',
                links: ['Contact Us', 'Help Centre', 'System Status']
              },
            ].map((column) => (
              <div key={column.title}>
                <p className="font-bold text-xs sm:text-sm mb-3 uppercase tracking-wider" style={{ color: '#1A1A1A' }}>
                  {column.title}
                </p>
                <ul className="space-y-2">
                  {column.links.map((link) => (
                    <li key={link}>
                      <Link href="#" className="text-xs sm:text-sm" style={{ color: '#717171' }}>
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs sm:text-sm" style={{ color: '#717171' }}>
              © 2026 IPOReady. All rights reserved.
            </p>
            <p className="text-xs sm:text-sm" style={{ color: '#717171' }}>
              The IPO Operating System for Canada & US Listings
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
// Mobile responsive landing page
