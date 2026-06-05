'use client'

import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { AppShell } from '@/components/layout/AppShell'
import {
  ArrowLeft, TrendingUp, DollarSign, Users, Globe, Calendar, BarChart3,
  Zap, Target, CheckCircle2, AlertCircle
} from 'lucide-react'

interface CompanyData {
  id: string
  name: string
  sector: string
  founded: number
  ipo_year: number
  valuation: string
  valuation_method: string
  valuation_logic: string
  revenue_ttm: string
  revenue_growth: string
  ipo_raised: string
  current_price_vs_ipo: number
  employees: number
  countries: number
  net_retention: string
  arr_growth: string
  customers: string
  avg_customer_value: string
  highlights: string[]
  risks: string[]
  comparable_multiples: { name: string; multiple: number; type: string }[]
  investment_thesis: string
}

const COMPANY_DATA: Record<string, CompanyData> = {
  '1': {
    id: '1',
    name: 'Datadog Inc.',
    sector: 'Cloud Monitoring',
    founded: 2010,
    ipo_year: 2019,
    valuation: '$38B',
    valuation_method: 'EV/Revenue Multiple',
    valuation_logic: '38B valuation = $1.5B revenue × 25.3x multiple. Datadog trades at 25x revenue due to: (1) 30%+ YoY growth, (2) 130%+ net retention rate, (3) AI-driven observability platform in high-demand market, (4) Strong enterprise customer base with average ACV $500K+',
    revenue_ttm: '$1.5B',
    revenue_growth: '32% YoY',
    ipo_raised: '$648M',
    current_price_vs_ipo: 280,
    employees: 3500,
    countries: 30,
    net_retention: '130%',
    arr_growth: '32%',
    customers: '2,400+ customers',
    avg_customer_value: '$500K ACV',
    highlights: [
      'Market leader in observability with largest install base',
      'Consistent 30%+ growth with strong net retention',
      'Expanding into AI/ML monitoring and security analytics',
      'Enterprise customer concentration with large ACV',
      'Global presence across 30 countries'
    ],
    risks: [
      'High valuation multiples (25x) relative to growth rate',
      'Increased competition from cloud providers (AWS, Google)',
      'Customer concentration risk in tech/financial sectors',
      'Integration complexity for end users',
      'Potential macro headwinds impacting IT spend'
    ],
    comparable_multiples: [
      { name: 'Datadog', multiple: 25.3, type: 'EV/Revenue' },
      { name: 'Elastic', multiple: 15.0, type: 'EV/Revenue' },
      { name: 'MongoDB', multiple: 18.8, type: 'EV/Revenue' },
      { name: 'HashiCorp', multiple: 7.6, type: 'EV/Revenue' }
    ],
    investment_thesis: 'Datadog represents the gold standard of observability platforms with industry-leading margins, growth, and customer retention. The 25x revenue multiple reflects its market position, but is only sustainable with continued 30%+ growth and AI innovation.'
  },
  '2': {
    id: '2',
    name: 'Twilio Inc.',
    sector: 'Communications API',
    founded: 2008,
    ipo_year: 2016,
    valuation: '$12B',
    valuation_method: 'EV/Revenue Multiple',
    valuation_logic: '12B valuation = $2.9B revenue × 4.1x multiple. Lower multiple (4x vs 25x Datadog) reflects: (1) Slower growth after market saturation, (2) Increased competition from AWS/Google, (3) Customer churn in certain verticals, (4) Mature SaaS platform without AI differentiation',
    revenue_ttm: '$2.9B',
    revenue_growth: '15% YoY',
    ipo_raised: '$200M',
    current_price_vs_ipo: 120,
    employees: 4900,
    countries: 40,
    net_retention: '105%',
    arr_growth: '14%',
    customers: '200K+ customers',
    avg_customer_value: '$50K ACV',
    highlights: [
      'First-mover advantage in communications APIs',
      'Largest global customer base across 200K accounts',
      'Strong presence in emerging markets',
      'Diversified product portfolio (SMS, Voice, Video)',
      'Proven business model with long customer relationships'
    ],
    risks: [
      'Slowing growth from 30%+ to 15% YoY',
      'Low valuation multiple (4x) signals market saturation',
      'AWS and Google building competitive messaging services',
      'Customer concentration in lower-value SMB segment',
      'Regulatory risks in telecom/SMS space'
    ],
    comparable_multiples: [
      { name: 'Twilio', multiple: 4.1, type: 'EV/Revenue' },
      { name: 'Datadog', multiple: 25.3, type: 'EV/Revenue' },
      { name: 'Elastic', multiple: 15.0, type: 'EV/Revenue' }
    ],
    investment_thesis: 'Twilio is a mature, stable business with excellent reach but challenged by slower growth and competitive pressure. The low 4x multiple reflects realistic expectations for a platform moving into maintenance phase.'
  },
  '5': {
    id: '5',
    name: 'MongoDB Inc.',
    sector: 'Database Platform',
    founded: 2007,
    ipo_year: 2017,
    valuation: '$32B',
    valuation_method: 'EV/Revenue Multiple + Growth',
    valuation_logic: '32B valuation = $1.7B revenue × 18.8x multiple. High multiple reflects: (1) 32% ARR growth, (2) Highest net retention among peers (140%+), (3) Developer-first moat with largest NoSQL install base, (4) Essential infrastructure reducing churn risk, (5) AI integration roadmap creating upsell opportunities',
    revenue_ttm: '$1.7B',
    revenue_growth: '32% YoY',
    ipo_raised: '$192M',
    current_price_vs_ipo: 420,
    employees: 2200,
    countries: 45,
    net_retention: '140%+',
    arr_growth: '32%',
    customers: '30K+ customers',
    avg_customer_value: '$100K ACV',
    highlights: [
      'Highest net retention rate (140%+) among database vendors',
      'Consistent 32% growth with improving margins',
      'Developer-first moat with largest NoSQL community',
      'Essential infrastructure role reducing churn',
      'Atlas cloud platform driving expansion revenue'
    ],
    risks: [
      'Premium valuation (18.8x) requires sustained growth',
      'Competition from AWS DocumentDB and other NoSQL',
      'SQL databases still dominant in enterprise',
      'Migration path from open-source to commercial unclear',
      'Execution risk on AI and advanced features'
    ],
    comparable_multiples: [
      { name: 'MongoDB', multiple: 18.8, type: 'EV/Revenue' },
      { name: 'Datadog', multiple: 25.3, type: 'EV/Revenue' },
      { name: 'Elastic', multiple: 15.0, type: 'EV/Revenue' },
      { name: 'HashiCorp', multiple: 7.6, type: 'EV/Revenue' }
    ],
    investment_thesis: 'MongoDB is the highest-quality infrastructure investment with best-in-class retention and growth. The 18.8x multiple is justified by developer moat, but requires maintaining 30%+ growth trajectory.'
  }
}

export default function CompanyProfilePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const company = COMPANY_DATA[id]

  if (!company) {
    return (
      <AppShell>
        <div style={{ minHeight: '100vh', background: '#F7F6F4', padding: '3rem' }}>
          <div style={{ textAlign: 'center' }}>
            <AlertCircle className="w-12 h-12 mx-auto mb-3" style={{ color: '#E8312A' }} />
            <p style={{ fontSize: '1.125rem', color: '#717171' }}>Company not found</p>
            <button
              onClick={() => router.back()}
              style={{
                marginTop: '2rem',
                padding: '0.75rem 1.5rem',
                background: '#E8312A',
                color: '#FFFFFF',
                fontWeight: 700,
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer'
              }}
            >
              Go Back
            </button>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div style={{ minHeight: '100vh', background: '#F7F6F4' }}>
        {/* Header */}
        <section style={{ borderBottom: '1px solid #E5E4E0', padding: '2rem', background: '#FFFFFF' }}>
          <div className="max-w-6xl mx-auto">
            <button
              onClick={() => router.back()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#E8312A',
                fontWeight: 600,
                fontSize: '0.875rem',
                marginBottom: '1.5rem'
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Peer Analysis
            </button>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 style={{ fontSize: '2.75rem', fontWeight: 700, color: '#1A1A1A', margin: '0 0 0.5rem 0' }}>
                {company.name}
              </h1>
              <p style={{ fontSize: '1.125rem', color: '#717171', margin: 0 }}>
                {company.sector} • Founded {company.founded} • IPO {company.ipo_year}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Key Metrics */}
        <section style={{ padding: '3rem 2rem', background: '#FFFFFF', borderBottom: '1px solid #E5E4E0' }}>
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              {[
                { label: 'Valuation', value: company.valuation, icon: DollarSign },
                { label: 'Revenue (TTM)', value: company.revenue_ttm, icon: BarChart3 },
                { label: 'Growth Rate', value: company.revenue_growth, icon: TrendingUp },
                { label: 'Employees', value: company.employees.toLocaleString(), icon: Users }
              ].map((metric, idx) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  style={{
                    padding: '1.5rem',
                    background: '#F7F6F4',
                    border: '1px solid #E5E4E0',
                    borderRadius: '0.5rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <metric.icon className="w-4 h-4" style={{ color: '#E8312A' }} />
                    <p style={{ fontSize: '0.875rem', color: '#717171', fontWeight: 600, margin: 0 }}>
                      {metric.label}
                    </p>
                  </div>
                  <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
                    {metric.value}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Valuation Explanation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{
                padding: '2rem',
                background: '#F0F4FF',
                border: '1px solid #1D4ED8',
                borderRadius: '0.5rem'
              }}
            >
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '0.75rem' }}>
                Valuation Analysis: {company.valuation_method}
              </h3>
              <p style={{ fontSize: '1rem', color: '#1A1A1A', lineHeight: 1.6, margin: 0 }}>
                {company.valuation_logic}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Comparable Multiples */}
        <section style={{ padding: '3rem 2rem', background: '#F7F6F4', borderBottom: '1px solid #E5E4E0' }}>
          <div className="max-w-6xl mx-auto">
            <h2 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '2rem' }}>
              Comparable EV/Revenue Multiples
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {company.comparable_multiples.map((comp, idx) => (
                <motion.div
                  key={comp.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  style={{
                    padding: '1.5rem',
                    background: '#FFFFFF',
                    border: '1px solid #E5E4E0',
                    borderRadius: '0.5rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: '0.875rem', color: '#717171', fontWeight: 600, margin: 0, marginBottom: '0.25rem' }}>
                        {comp.name}
                      </p>
                      <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
                        {comp.multiple.toFixed(1)}x
                      </p>
                    </div>
                    <div
                      style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: '#F7F6F4',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#E8312A', margin: 0 }}>
                        {comp.multiple.toFixed(1)}x
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Highlights & Risks */}
        <section style={{ padding: '3rem 2rem', background: '#FFFFFF' }}>
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Highlights */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#2D7A5F', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <CheckCircle2 className="w-6 h-6" />
                  Investment Highlights
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, space: '1rem' }}>
                  {company.highlights.map((highlight, idx) => (
                    <li key={idx} style={{ marginBottom: '1rem', paddingLeft: '2rem', position: 'relative', lineHeight: 1.6, color: '#1A1A1A' }}>
                      <span style={{ position: 'absolute', left: 0, color: '#2D7A5F', fontWeight: 700 }}>✓</span>
                      {highlight}
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Risks */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#E8312A', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <AlertCircle className="w-6 h-6" />
                  Key Risks
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {company.risks.map((risk, idx) => (
                    <li key={idx} style={{ marginBottom: '1rem', paddingLeft: '2rem', position: 'relative', lineHeight: 1.6, color: '#1A1A1A' }}>
                      <span style={{ position: 'absolute', left: 0, color: '#E8312A', fontWeight: 700 }}>⚠</span>
                      {risk}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Investment Thesis */}
        <section style={{ padding: '3rem 2rem', background: '#F0F4FF', borderTop: '1px solid #E5E4E0' }}>
          <div className="max-w-6xl mx-auto">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1D4ED8', marginBottom: '1rem' }}>
              Investment Thesis
            </h2>
            <p style={{ fontSize: '1rem', color: '#1A1A1A', lineHeight: 1.7, margin: 0 }}>
              {company.investment_thesis}
            </p>
          </div>
        </section>
      </div>
    </AppShell>
  )
}
