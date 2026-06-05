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
          <div className="order-1 md:order-1">
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

          {/* Right: Visual */}
          <div className="flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-4 sm:p-6 md:p-8 order-2 md:order-2" style={{ aspectRatio: '1 / 1', minHeight: '300px' }}>
            <div className="text-5xl sm:text-6xl md:text-7xl">📊</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-center mb-8 sm:mb-12" style={{ color: '#1A1A1A' }}>
            Everything You Need for IPO Success
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'PACE™ Velocity Engine', description: 'Always know where you stand toward listing day' },
              { title: '180+ IPO Milestones', description: 'Pre-built tasks for your exact exchange and type' },
              { title: 'AI-Assisted Cap Table', description: 'Model your equity structure automatically' },
              { title: 'Capital Raise Tracker', description: 'Track every tranche and investor commitment' },
              { title: 'Document Workspace', description: 'Version-controlled hub for all IPO documents' },
              { title: 'Expert Network', description: 'Vetted legal, accounting, and finance professionals' },
            ].map((feature) => (
              <div key={feature.title} className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-red-200 transition-colors">
                <h3 className="font-bold text-base sm:text-lg mb-3" style={{ color: '#1A1A1A' }}>
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base" style={{ color: '#717171' }}>
                  {feature.description}
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
