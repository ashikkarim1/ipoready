'use client'

import { Archive, FileText, CheckSquare, Users, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function IPOArchivePage() {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Archive className="w-8 h-8" style={{ color: '#E8312A' }} />
            <h1 className="serif text-5xl text-nav leading-tight">Your IPO Journey</h1>
          </div>
          <p className="text-lg text-text-muted max-w-3xl">
            Reference your IPO documentation, checklists, and historical data from your listing preparation.
          </p>
        </motion.div>
      </div>

      {/* Archive Sections */}
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        {/* Prospectus */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="p-8 rounded-xl border"
          style={{ background: '#FFFFFF', borderColor: '#E5E4E0' }}
        >
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#FDECEB' }}>
              <FileText className="w-6 h-6" style={{ color: '#E8312A' }} />
            </div>
            <div>
              <h3 className="font-bold text-nav text-lg">Prospectus & Filing Documents</h3>
              <p className="text-text-muted text-sm mt-1">Final prospectus, S-1, AIF, and all regulatory filings submitted during your IPO.</p>
            </div>
          </div>
          <button className="text-accent font-semibold text-sm hover:underline">
            View Documents →
          </button>
        </motion.div>

        {/* IPO Checklist */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="p-8 rounded-xl border"
          style={{ background: '#FFFFFF', borderColor: '#E5E4E0' }}
        >
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#EAF5F0' }}>
              <CheckSquare className="w-6 h-6" style={{ color: '#2D7A5F' }} />
            </div>
            <div>
              <h3 className="font-bold text-nav text-lg">IPO Journey Completion</h3>
              <p className="text-text-muted text-sm mt-1">Your completed IPO checklist with all 180+ milestones marked and final PACE™ score.</p>
            </div>
          </div>
          <button className="text-accent font-semibold text-sm hover:underline">
            View Checklist →
          </button>
        </motion.div>

        {/* Cap Table at IPO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="p-8 rounded-xl border"
          style={{ background: '#FFFFFF', borderColor: '#E5E4E0' }}
        >
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#F5F3FF' }}>
              <BarChart3 className="w-6 h-6" style={{ color: '#7C3AED' }} />
            </div>
            <div>
              <h3 className="font-bold text-nav text-lg">Cap Table at IPO</h3>
              <p className="text-text-muted text-sm mt-1">Final cap table snapshot showing ownership structure at the time of listing.</p>
            </div>
          </div>
          <button className="text-accent font-semibold text-sm hover:underline">
            View Cap Table →
          </button>
        </motion.div>

        {/* Team Records */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="p-8 rounded-xl border"
          style={{ background: '#FFFFFF', borderColor: '#E5E4E0' }}
        >
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#EFF6FF' }}>
              <Users className="w-6 h-6" style={{ color: '#1D4ED8' }} />
            </div>
            <div>
              <h3 className="font-bold text-nav text-lg">IPO Team & Advisors</h3>
              <p className="text-text-muted text-sm mt-1">Contact information and engagement records for all advisors used during the IPO process.</p>
            </div>
          </div>
          <button className="text-accent font-semibold text-sm hover:underline">
            View Advisor Network →
          </button>
        </motion.div>
      </div>

      {/* Next Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="p-12 rounded-xl border-2"
        style={{ background: '#EFF6FF', borderColor: '#1D4ED8' }}
      >
        <h2 className="text-2xl font-bold text-nav mb-4">Welcome to the Public Company OS</h2>
        <p className="text-text-muted mb-8">
          Your IPO is complete. Now it's time to manage your public company with the same precision that got you listed.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          <Link href="/dashboard/scores" className="p-6 bg-white rounded-lg border border-blue-200 hover:shadow-lg transition-all">
            <p className="font-bold text-nav mb-2">📊 Compliance Scores</p>
            <p className="text-sm text-text-muted">See your real-time compliance health across all areas</p>
          </Link>
          <Link href="/listed-services/filing-calendar" className="p-6 bg-white rounded-lg border border-blue-200 hover:shadow-lg transition-all">
            <p className="font-bold text-nav mb-2">📅 Filing Calendar</p>
            <p className="text-sm text-text-muted">Track all upcoming regulatory deadlines</p>
          </Link>
          <Link href="/listed-services/disclosure-center" className="p-6 bg-white rounded-lg border border-blue-200 hover:shadow-lg transition-all">
            <p className="font-bold text-nav mb-2">📝 Disclosure Center</p>
            <p className="text-sm text-text-muted">Manage continuous disclosure obligations</p>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
