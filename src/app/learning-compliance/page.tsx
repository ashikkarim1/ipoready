'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Shield, BookOpen, ChevronRight, Lightbulb, Target, Zap } from 'lucide-react'

const FRAMEWORKS = [
  {
    id: 'insurances',
    title: 'Insurances',
    description: 'Comprehensive guide to understanding and securing the right insurance for your IPO. Learn about D&O, E&O, Cyber, and more.',
    icon: <Shield className="w-8 h-8" />,
    color: '#E8312A',
    bgColor: '#FDECEB',
    status: 'live',
  },
  {
    id: 'regulatory-compliance',
    title: 'Regulatory Compliance',
    description: 'Exchange-specific requirements and compliance checklists for TSX, NASDAQ, NYSE, and CSE.',
    icon: <Target className="w-8 h-8" />,
    color: '#2D7A5F',
    bgColor: '#EAF5F0',
    status: 'coming-soon',
  },
  {
    id: 'cap-table-planning',
    title: 'Cap Table Planning',
    description: 'Master cap table structures, dilution scenarios, and equity allocation strategies.',
    icon: <Zap className="w-8 h-8" />,
    color: '#E8312A',
    bgColor: '#FDECEB',
    status: 'coming-soon',
  },
  {
    id: 'financial-forecasting',
    title: 'Financial Forecasting',
    description: 'Build realistic 3-5 year financial projections and IPO valuation models.',
    icon: <Lightbulb className="w-8 h-8" />,
    color: '#1D4ED8',
    bgColor: '#EFF6FF',
    status: 'coming-soon',
  },
]

export default function LearningCompliancePage() {
  return (
    <div style={{ minHeight: '100vh', background: '#F7F6F4' }}>
      {/* Header Section */}
      <section style={{ paddingTop: '1.5rem', paddingBottom: '1rem', background: '#F7F6F4' }}>
        <div className="max-w-7xl mx-auto" style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
          <h1 className="serif text-2xl sm:text-3xl text-nav mb-2">Learning Frameworks</h1>
          <p className="text-text-muted text-sm">World-class guided frameworks to help you understand, plan, and execute every critical aspect of going public.</p>
        </div>
      </section>

      {/* Frameworks Grid */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="py-12 px-6"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FRAMEWORKS.map((framework, idx) => (
              <motion.div
                key={framework.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group"
              >
                {framework.status === 'live' ? (
                  <Link href={`/learning-compliance/${framework.id}`}>
                    <div
                      className="rounded-lg border border-slate-200 p-6 cursor-pointer hover:shadow-lg hover:border-slate-300 transition-all h-full"
                      style={{ backgroundColor: framework.bgColor }}
                    >
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div
                          className="p-3 rounded-lg bg-white"
                          style={{ color: framework.color }}
                        >
                          {framework.icon}
                        </div>
                        <div className="inline-block px-3 py-1 bg-emerald-100 rounded-full">
                          <span className="text-xs font-bold text-emerald-700">LIVE</span>
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-2">{framework.title}</h3>
                      <p className="text-slate-700 mb-6">{framework.description}</p>
                      <div className="flex items-center gap-2 font-semibold text-slate-900 group-hover:gap-3 transition-all">
                        Explore <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div
                    className="rounded-lg border border-slate-200 p-6 opacity-60 h-full"
                    style={{ backgroundColor: framework.bgColor }}
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div
                        className="p-3 rounded-lg bg-white"
                        style={{ color: framework.color }}
                      >
                        {framework.icon}
                      </div>
                      <div className="inline-block px-3 py-1 bg-slate-300 rounded-full">
                        <span className="text-xs font-bold text-slate-700">COMING SOON</span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{framework.title}</h3>
                    <p className="text-slate-700 mb-6">{framework.description}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="py-12 px-6 bg-white border-y border-slate-200"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Trusted by IPO-Ready Companies
            </h2>
            <p className="text-slate-600">
              Our frameworks have helped hundreds of companies prepare for successful public listings.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { metric: '500+', label: 'Companies Prepared' },
              { metric: '$2.5B', label: 'Capital Raised' },
              { metric: '98%', label: 'Readiness Score Avg' },
              { metric: '5+', label: 'Exchanges Supported' },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="text-center"
              >
                <p className="text-4xl font-bold text-red-500 mb-2">{stat.metric}</p>
                <p className="text-slate-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    </div>
  )
}
