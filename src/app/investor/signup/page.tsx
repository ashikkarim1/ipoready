'use client'

import Link from 'next/link'
import { Header } from '@/app/components/Header'
import { ArrowLeft, CheckCircle2, Mail, Lock, Building2 } from 'lucide-react'

export default function InvestorSignupPage() {
  return (
    <>
      <Header />

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <section style={{ paddingTop: '2rem', paddingBottom: '1rem', background: '#F7F6F4' }}>
        <div className="max-w-6xl mx-auto" style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
          <h1 className="serif text-5xl text-nav mb-4 leading-tight">Join Our Investor Network</h1>
          <p className="text-text-muted text-lg">Get early access to deal flow from 500+ IPO-ready companies.</p>
        </div>
      </section>

      {/* ── Main Content ──────────────────────────────────────────────────────── */}
      <section style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
        <div className="max-w-6xl mx-auto" style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
          <div className="grid md:grid-cols-2 gap-12">
            {/* Left: Form */}
            <div>
              <h2 className="serif text-4xl text-nav mb-6 leading-tight">Get Early Access</h2>

              <form className="space-y-6">
                <div>
                  <label className="block label font-semibold text-nav mb-2">Full Name</label>
                  <input
                    type="text"
                    placeholder="John Smith"
                    className="w-full px-4 py-3 rounded-lg border"
                    style={{ borderColor: '#E5E4E0', background: '#FFFFFF' }}
                  />
                </div>

                <div>
                  <label className="block label font-semibold text-nav mb-2">Email Address</label>
                  <input
                    type="email"
                    placeholder="john@investmentfirm.com"
                    className="w-full px-4 py-3 rounded-lg border"
                    style={{ borderColor: '#E5E4E0', background: '#FFFFFF' }}
                  />
                </div>

                <div>
                  <label className="block label font-semibold text-nav mb-2">Firm Name</label>
                  <input
                    type="text"
                    placeholder="Your Investment Firm"
                    className="w-full px-4 py-3 rounded-lg border"
                    style={{ borderColor: '#E5E4E0', background: '#FFFFFF' }}
                  />
                </div>

                <div>
                  <label className="block label font-semibold text-nav mb-2">Investment Stage Focus</label>
                  <select
                    className="w-full px-4 py-3 rounded-lg border"
                    style={{ borderColor: '#E5E4E0', background: '#FFFFFF' }}
                  >
                    <option>Select your stage</option>
                    <option>Pre-IPO / Growth Stage</option>
                    <option>Pre-Public / Late Stage</option>
                    <option>Public Equities</option>
                    <option>Mixed Portfolio</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 font-bold rounded-lg text-white transition-opacity hover:opacity-90"
                  style={{ background: '#E8312A' }}
                >
                  Get Early Access
                </button>

                <p className="caption-sm text-text-muted">
                  We respect your privacy. By signing up, you agree to our <Link href="#" className="underline">Terms of Service</Link> and <Link href="#" className="underline">Privacy Policy</Link>.
                </p>
              </form>
            </div>

            {/* Right: Benefits */}
            <div>
              <h2 className="serif text-4xl text-nav mb-6 leading-tight">What You'll Get</h2>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#FDECEB' }}>
                    <CheckCircle2 className="w-6 h-6" style={{ color: '#E8312A' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-nav mb-1">Real-Time Deal Flow</h3>
                    <p className="text-text-muted text-sm">Get notified instantly when IPO-ready companies match your criteria.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#EFF6FF' }}>
                    <Mail className="w-6 h-6" style={{ color: '#1D4ED8' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-nav mb-1">Proprietary Intelligence</h3>
                    <p className="text-text-muted text-sm">Access PACE™ scores and estimated listing dates for each company.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#EAF5F0' }}>
                    <Building2 className="w-6 h-6" style={{ color: '#2D7A5F' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-nav mb-1">Founder Network</h3>
                    <p className="text-text-muted text-sm">Message founders directly and set up meetings without gatekeepers.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#F5F3FF' }}>
                    <Lock className="w-6 h-6" style={{ color: '#7C3AED' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-nav mb-1">Founding Member Benefits</h3>
                    <p className="text-text-muted text-sm">Lock in founder pricing and get lifetime early adopter perks.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── Back Link ──────────────────────────────────────────────────────── */}
      <section style={{ borderTop: '1px solid #E5E4E0' }}>
        <div className="max-w-6xl mx-auto" style={{ paddingTop: '2rem', paddingBottom: '2rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
          <Link href="/for-investors" className="flex items-center gap-2 text-nav hover:text-text-muted transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="font-semibold">Back to Investors</span>
          </Link>
        </div>
      </section>
    </>
  )
}
