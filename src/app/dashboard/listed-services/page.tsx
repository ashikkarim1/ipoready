'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock, MessageSquare, Eye, Users, BarChart3, DollarSign,
  PieChart, Zap, Target, GitBranch, CheckSquare, Briefcase,
  Shield, Scale, Award, AlertCircle, ChevronRight, TrendingUp,
  Activity, Flame, Brain, Layers
} from 'lucide-react'

export default function ListedServicesPage() {
  const [activeCategory, setActiveCategory] = useState('disclosure')

  const categories = {
    disclosure: {
      name: 'Disclosure & Filings',
      icon: FileIcon,
      color: '#2563EB',
      lightColor: '#EFF6FF',
      features: [
        { title: 'Filing Calendar', desc: 'Track all regulatory deadlines', icon: Clock },
        { title: 'MD&A Studio', desc: 'AI-generated disclosures', icon: Brain },
        { title: 'Disclosure Center', desc: 'Materiality analysis engine', icon: Eye },
        { title: 'Audit Tracker', desc: 'Real-time audit readiness', icon: CheckSquare }
      ]
    },
    ir: {
      name: 'Investor Relations',
      icon: Users,
      color: '#7C3AED',
      lightColor: '#F3E8FF',
      features: [
        { title: 'IR Calendar', desc: '12-month investor planning', icon: Clock },
        { title: 'Press Engine', desc: 'AI earnings announcements', icon: MessageSquare },
        { title: 'Market Watch', desc: 'Real-time sentiment tracking', icon: TrendingUp },
        { title: 'Investor CRM', desc: 'Shareholder intelligence', icon: Users }
      ]
    },
    cfo: {
      name: 'CFO Command',
      icon: DollarSign,
      color: '#059669',
      lightColor: '#ECFDF5',
      features: [
        { title: 'Financial Reporting', desc: 'Draft all disclosures', icon: BarChart3 },
        { title: 'Financing Center', desc: 'Capital structure modeling', icon: PieChart },
        { title: 'Dilution Simulator', desc: 'Ownership projections', icon: Target },
        { title: 'Treasury Suite', desc: 'Cash & runway forecasts', icon: DollarSign }
      ]
    },
    exec: {
      name: 'Executive',
      icon: Zap,
      color: '#DC2626',
      lightColor: '#FEF2F2',
      features: [
        { title: 'CEO Dashboard', desc: 'Strategic intelligence hub', icon: Zap },
        { title: 'Risk Center', desc: 'Enterprise risk register', icon: AlertCircle },
        { title: 'Opportunity Tracker', desc: 'M&A & financing pipeline', icon: Target },
        { title: 'Board Portal', desc: 'Governance & materials', icon: Briefcase }
      ]
    },
    mna: {
      name: 'M&A Suite',
      icon: GitBranch,
      color: '#EA580C',
      lightColor: '#FEF3C7',
      features: [
        { title: 'Deal Pipeline', desc: 'Target tracking & synergies', icon: GitBranch },
        { title: 'Due Diligence', desc: 'Organized document flow', icon: Layers },
        { title: 'Integration Hub', desc: 'Post-deal milestones', icon: CheckSquare },
        { title: 'Carve-Out', desc: 'Spin-off & divestiture', icon: Scale }
      ]
    },
    compliance: {
      name: 'Compliance',
      icon: Shield,
      color: '#0891B2',
      lightColor: '#ECFDFD',
      features: [
        { title: 'Insider Compliance', desc: 'Trading window management', icon: Eye },
        { title: 'SOX/ICFR', desc: 'Control testing & evidence', icon: Shield },
        { title: 'Legal Center', desc: 'Contracts & litigation', icon: Scale },
        { title: 'ESG Tracker', desc: 'Sustainability reporting', icon: Award }
      ]
    }
  }

  const activeData = categories[activeCategory as keyof typeof categories]

  return (
    <div style={{ background: '#F7F6F4', minHeight: '100vh', colorScheme: 'light' }}>
      {/* Hero Section */}
      <div style={{ background: '#1A1A1A', color: 'white', padding: '48px 24px' }}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-start gap-3 mb-4">
              <Zap className="w-6 h-6 flex-shrink-0" style={{ color: '#E8312A' }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#E8312A' }}>
                Premium Product
              </span>
            </div>
            <h1 className="serif text-4xl sm:text-5xl font-bold mb-3 leading-tight">
              Listed Services
            </h1>
            <p className="text-lg text-gray-400 mb-8 max-w-2xl">
              Enterprise-grade operations platform for public companies. Real-time compliance, investor relations, financial reporting, and strategic intelligence — all integrated.
            </p>
            <div className="flex flex-wrap gap-3">
              <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px 16px', border: '1px solid rgba(255,255,255,0.2)' }}>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>Live Deployments</p>
                <p style={{ fontSize: '20px', fontWeight: '700', color: 'white' }}>12+</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px 16px', border: '1px solid rgba(255,255,255,0.2)' }}>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>Users Supported</p>
                <p style={{ fontSize: '20px', fontWeight: '700', color: 'white' }}>500K+</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px 16px', border: '1px solid rgba(255,255,255,0.2)' }}>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>Uptime SLA</p>
                <p style={{ fontSize: '20px', fontWeight: '700', color: 'white' }}>99.9%</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-0 py-12 space-y-12">

        {/* Value Props */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {[
            { icon: TrendingUp, label: 'Real-time Analytics', desc: 'Live dashboards & insights' },
            { icon: Brain, label: 'AI-Powered', desc: 'Automated analysis & forecasting' },
            { icon: Shield, label: 'Enterprise Security', desc: 'SOC 2 Type II certified' },
            { icon: Activity, label: '24/7 Support', desc: 'Dedicated success team' }
          ].map((prop, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              style={{
                background: 'white',
                border: '1px solid #E5E4E0',
                borderRadius: '16px',
                padding: '24px'
              }}
              className="hover:border-gray-300 transition-all"
            >
              <prop.icon className="w-6 h-6 mb-3" style={{ color: '#E8312A' }} />
              <h3 className="font-semibold text-nav mb-1" style={{ fontSize: '14px' }}>{prop.label}</h3>
              <p style={{ color: '#9A9A9A', fontSize: '13px' }}>{prop.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Feature Categories */}
        <div>
          <h2 className="serif text-2xl font-bold text-nav mb-6">Service Categories</h2>

          {/* Category Buttons */}
          <div className="flex flex-wrap gap-2 mb-8">
            {Object.entries(categories).map(([key, data]) => (
              <motion.button
                key={key}
                onClick={() => setActiveCategory(key)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  background: activeCategory === key ? data.color : 'white',
                  color: activeCategory === key ? 'white' : '#1A1A1A',
                  border: `2px solid ${activeCategory === key ? data.color : '#E5E4E0'}`,
                  padding: '10px 16px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                {data.name}
              </motion.button>
            ))}
          </div>

          {/* Active Category Cards */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              style={{
                background: activeData.lightColor,
                borderRadius: '20px',
                padding: '32px',
                marginBottom: '12px'
              }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div style={{ background: activeData.color, color: 'white', padding: '8px', borderRadius: '8px' }}>
                  <activeData.icon className="w-5 h-5" />
                </div>
                <h3 className="serif text-2xl font-bold text-nav">{activeData.name}</h3>
              </div>

              {/* Feature Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeData.features.map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    style={{
                      background: 'white',
                      borderRadius: '12px',
                      padding: '16px',
                      border: `1px solid rgba(0,0,0,0.05)`
                    }}
                    className="hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div style={{ background: activeData.color, color: 'white', padding: '6px', borderRadius: '6px', flexShrink: 0 }}>
                        <feature.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-nav text-sm mb-1">{feature.title}</h4>
                        <p style={{ color: '#9A9A9A', fontSize: '12px' }}>{feature.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* AI Agents */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{
            background: 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)',
            color: 'white',
            borderRadius: '20px',
            padding: '32px'
          }}
        >
          <h3 className="serif text-2xl font-bold mb-4">Powered by AI Agents</h3>
          <p className="mb-6 text-gray-300">Each service module has dedicated AI agents for research, analysis, and strategic recommendations.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {['AI Analyst', 'AI Counsel', 'AI CFO', 'AI Secretary', 'AI IR', 'AI Compliance'].map((agent, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  padding: '12px',
                  textAlign: 'center',
                  border: '1px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer'
                }}
                whileHover={{ background: 'rgba(255,255,255,0.12)' }}
              >
                <Zap className="w-4 h-4 mx-auto mb-2" style={{ color: '#E8312A' }} />
                <p style={{ fontSize: '12px', fontWeight: '600' }}>{agent}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h3 className="serif text-2xl font-bold text-nav mb-6">Impact Metrics</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { number: '87%', label: 'Time savings in compliance', icon: TrendingUp },
              { number: '45 days', label: 'Faster to market', icon: Flame },
              { number: '3.2x', label: 'Better investor meetings', icon: Users },
              { number: '$2.1M', label: 'Average savings per listing', icon: DollarSign }
            ].map((metric, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                style={{
                  background: 'white',
                  border: '1px solid #E5E4E0',
                  borderRadius: '16px',
                  padding: '24px',
                  textAlign: 'center'
                }}
                className="hover:border-gray-300 transition-all"
              >
                <metric.icon className="w-8 h-8 mx-auto mb-3" style={{ color: '#E8312A' }} />
                <p style={{ fontSize: '28px', fontWeight: '700', color: '#1A1A1A', marginBottom: '4px' }}>
                  {metric.number}
                </p>
                <p style={{ fontSize: '13px', color: '#9A9A9A' }}>{metric.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          style={{
            background: 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)',
            color: 'white',
            borderRadius: '20px',
            padding: '48px 32px',
            textAlign: 'center'
          }}
        >
          <h2 className="serif text-3xl font-bold mb-3">Ready for Listed Services?</h2>
          <p className="mb-8 text-gray-300 max-w-2xl mx-auto">
            Get comprehensive operations, compliance, and strategic intelligence tools from day one of your listing.
          </p>
          <button
            style={{
              background: '#E8312A',
              color: 'white',
              padding: '14px 32px',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer'
            }}
            className="hover:opacity-90 transition-opacity flex items-center gap-2 mx-auto"
          >
            Schedule Demo <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </div>
  )
}

// Placeholder icon component
function FileIcon(props: any) {
  return <AlertCircle {...props} />
}
