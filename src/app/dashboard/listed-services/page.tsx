'use client'

import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import {
  CheckCircle2, AlertCircle, TrendingUp, Users, BarChart3, DollarSign,
  Clock, FileText, Zap, Target, Shield, Scale, Award, Activity,
  ChevronRight, Eye, Lock, Briefcase
} from 'lucide-react'

export default function ListedServicesPage() {
  const { data: session } = useSession()
  const companyName = 'TechCorp Inc.'

  // Mock data - replace with real API calls
  const commandCenterWidgets = [
    { label: 'Compliance Health', value: '87%', icon: Shield, color: '#22C55E', change: '+3%' },
    { label: 'Governance Score', value: '92%', icon: CheckCircle2, color: '#3B82F6', change: '+2%' },
    { label: 'Filing Readiness', value: '78%', icon: FileText, color: '#F59E0B', change: '-5%' },
    { label: 'Investor Sentiment', value: '7.2/10', icon: TrendingUp, color: '#8B5CF6', change: '+0.3' },
  ]

  const upcomingDeadlines = [
    { title: '10-Q Filing', dueDate: '45 days', priority: 'critical', icon: FileText },
    { title: 'Audit Committee Meeting', dueDate: '7 days', priority: 'critical', icon: Users },
    { title: 'Board Meeting', dueDate: '14 days', priority: 'high', icon: CheckCircle2 },
    { title: 'Investor Call', dueDate: '3 days', priority: 'high', icon: Activity },
  ]

  const materialEvents = [
    { event: 'Customer acquisition $50M+', status: 'requires_disclosure', action: 'Draft 8-K' },
    { event: 'Insider selling (CEO)', status: 'flagged', action: 'Review Form 4' },
    { event: 'Debt covenant waiver', status: 'board_approval', action: 'Schedule board vote' },
  ]

  return (
    <div style={{ background: '#F7F6F4', minHeight: '100vh', colorScheme: 'light' }}>
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 px-4 sm:px-6 lg:px-0 py-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="serif text-2xl sm:text-3xl text-nav mb-2">Listed Services OS</h1>
          <p className="text-text-muted text-sm">The operating system for {companyName}</p>
        </motion.div>

        {/* Command Center Widgets Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {commandCenterWidgets.map((widget, i) => {
            const Icon = widget.icon
            return (
              <div
                key={i}
                style={{
                  background: 'white',
                  border: '1px solid #E5E4E0',
                  borderRadius: '16px',
                  padding: '20px',
                }}
                className="hover:border-gray-300 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <Icon className="w-5 h-5" style={{ color: widget.color }} />
                  <span className="text-xs font-semibold" style={{ color: widget.color }}>
                    {widget.change}
                  </span>
                </div>
                <p className="text-text-muted text-xs mb-2">{widget.label}</p>
                <p className="serif text-2xl font-bold text-nav">{widget.value}</p>
              </div>
            )
          })}
        </motion.div>

        {/* Main Content Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Main Content */}
          <div className="flex-1 space-y-6">

            {/* Upcoming Deadlines */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{
                background: 'white',
                border: '1px solid #E5E4E0',
                borderRadius: '16px',
                overflow: 'hidden',
              }}
            >
              <div style={{ padding: '24px', borderBottom: '1px solid #F0EFED' }}>
                <h2 className="font-bold text-nav flex items-center gap-2 text-base">
                  <Clock className="w-5 h-5" style={{ color: '#E8312A' }} />
                  Upcoming Deadlines
                </h2>
              </div>
              <div style={{ padding: '20px' }} className="space-y-3">
                {upcomingDeadlines.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                    className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:border-gray-300 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 text-text-muted" />
                      <div>
                        <p className="font-medium text-sm text-nav">{item.title}</p>
                        <p className="text-xs text-text-muted">{item.dueDate}</p>
                      </div>
                    </div>
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
                      style={{
                        background: item.priority === 'critical' ? '#FEE2E2' : '#FEF3C7',
                        color: item.priority === 'critical' ? '#991B1B' : '#92400E'
                      }}
                    >
                      {item.priority}
                    </span>
                  </motion.div>
                ))}
              </div>
              <div style={{ padding: '16px 24px', borderTop: '1px solid #F0EFED', background: '#FAFAFA' }}>
                <a href="#" className="text-sm font-semibold text-nav flex items-center gap-1 hover:gap-2 transition-all">
                  View Full Calendar <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </motion.div>

            {/* Material Events & Alerts */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              style={{
                background: 'white',
                border: '1px solid #E5E4E0',
                borderRadius: '16px',
                overflow: 'hidden',
              }}
            >
              <div style={{ padding: '24px', borderBottom: '1px solid #F0EFED' }}>
                <h2 className="font-bold text-nav flex items-center gap-2 text-base">
                  <AlertCircle className="w-5 h-5" style={{ color: '#E8312A' }} />
                  Material Events & Alerts
                </h2>
              </div>
              <div style={{ padding: '20px' }} className="space-y-3">
                {materialEvents.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className="p-3 border rounded-lg"
                    style={{
                      borderColor: item.status === 'requires_disclosure' ? '#FCA5A5' : item.status === 'flagged' ? '#FCD34D' : '#93C5FD',
                      background: item.status === 'requires_disclosure' ? '#FEF2F2' : item.status === 'flagged' ? '#FFFBEB' : '#EFF6FF',
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm text-nav">{item.event}</p>
                        <p className="text-xs text-text-muted mt-1">{item.action}</p>
                      </div>
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
                        style={{
                          background: item.status === 'requires_disclosure' ? '#FCA5A5' : item.status === 'flagged' ? '#FCD34D' : '#93C5FD',
                          color: 'white'
                        }}
                      >
                        {item.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:w-80 space-y-6">

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{
                background: 'white',
                border: '1px solid #E5E4E0',
                borderRadius: '16px',
                overflow: 'hidden',
              }}
            >
              <div style={{ padding: '20px', borderBottom: '1px solid #F0EFED' }}>
                <h3 className="font-bold text-nav text-sm">Quick Access</h3>
              </div>
              <div style={{ padding: '16px' }} className="space-y-2">
                {[
                  { label: 'Board Resolutions', icon: FileText },
                  { label: 'Filing Calendar', icon: Clock },
                  { label: 'MD&A Studio', icon: BarChart3 },
                  { label: 'Investor CRM', icon: Users },
                  { label: 'Risk Register', icon: AlertCircle },
                  { label: 'Financing Center', icon: DollarSign },
                ].map((item, i) => (
                  <a
                    key={i}
                    href="#"
                    className="flex items-center justify-between p-2 rounded-lg text-sm font-medium text-nav hover:bg-gray-50 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <item.icon className="w-4 h-4 text-text-muted" />
                      {item.label}
                    </span>
                    <ChevronRight className="w-4 h-4 text-text-muted" />
                  </a>
                ))}
              </div>
            </motion.div>

            {/* AI Agents */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              style={{
                background: 'white',
                border: '1px solid #E5E4E0',
                borderRadius: '16px',
                overflow: 'hidden',
              }}
            >
              <div style={{ padding: '20px', borderBottom: '1px solid #F0EFED' }}>
                <h3 className="font-bold text-nav text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4" style={{ color: '#E8312A' }} />
                  AI Advisors
                </h3>
              </div>
              <div style={{ padding: '16px' }} className="space-y-2">
                {[
                  { name: 'AI CFO', role: 'Financial strategy' },
                  { name: 'AI General Counsel', role: 'Legal & compliance' },
                  { name: 'AI Governance Officer', role: 'Board & corporate' },
                  { name: 'AI IR Advisor', role: 'Investor relations' },
                ].map((agent, i) => (
                  <div key={i} className="p-2.5 border border-gray-100 rounded-lg hover:border-gray-300 transition-colors cursor-pointer">
                    <p className="font-medium text-xs text-nav">{agent.name}</p>
                    <p className="text-xs text-text-muted">{agent.role}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Coming Soon - Module Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="serif text-xl text-nav mb-4">Platform Modules</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Corporate Secretary', icon: FileText, items: ['Entity Management', 'Board Management', 'Governance Library'] },
              { name: 'Disclosure & Filings', icon: CheckCircle2, items: ['Filing Calendar', 'MD&A Studio', 'Continuous Disclosure'] },
              { name: 'Investor Relations', icon: Users, items: ['IR Calendar', 'Press Engine', 'Market Awareness', 'Investor CRM'] },
              { name: 'CFO Command', icon: DollarSign, items: ['Financial Reporting', 'Financing Center', 'Treasury', 'Dilution Simulator'] },
              { name: 'CEO Command', icon: Zap, items: ['Strategic Planning', 'Risk Center', 'Opportunity Center'] },
              { name: 'M&A OS', icon: Target, items: ['Deal Pipeline', 'Due Diligence', 'Integration'] },
              { name: 'Insider Compliance', icon: Eye, items: ['Trading Management', 'Blackout Control', 'Form 4 Tracking'] },
              { name: 'Audit & Controls', icon: Shield, items: ['SOX/ICFR', 'Internal Controls', 'Audit Management'] },
            ].map((module, i) => {
              const Icon = module.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  style={{
                    background: 'white',
                    border: '1px solid #E5E4E0',
                    borderRadius: '16px',
                    padding: '20px',
                  }}
                  className="hover:border-gray-300 transition-all cursor-pointer"
                >
                  <Icon className="w-6 h-6 text-nav mb-3" />
                  <h3 className="font-bold text-sm text-nav mb-2">{module.name}</h3>
                  <div className="space-y-1">
                    {module.items.map((item, j) => (
                      <p key={j} className="text-xs text-text-muted">{item}</p>
                    ))}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
