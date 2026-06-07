'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, AlertCircle, TrendingUp, Users, Target, Clock, ChevronDown, Zap } from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import { useSession } from 'next-auth/react'

interface Message {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
}

interface ValidationGap {
  category: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  title: string
  description: string
  impact: string
  costToFix?: string
  timeToFix?: string
  recommendation: string
}

interface AssessmentData {
  pacScore: number
  daysToIPO: number
  progressPercentage: number
  currentPhase: string
  overdueTasks: number
  blockerCount: number
  teamEngagement: number
  userRole: string
  readinessGaps: ValidationGap[]
  timelineRisks: ValidationGap[]
  advisorConcerns: ValidationGap[]
  documentGaps: ValidationGap[]
  regulatoryRedFlags: ValidationGap[]
}

export default function EmergencyAssessmentPage() {
  const { company } = useAppStore()
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [assessment, setAssessment] = useState<AssessmentData | null>(null)
  const [showAssessment, setShowAssessment] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load initial assessment data
  useEffect(() => {
    const loadAssessment = async () => {
      try {
        const res = await fetch('/api/dashboard/assessment')
        const data = await res.json()
        setAssessment(data)
      } catch (error) {
        console.error('Failed to load assessment:', error)
      }
    }
    loadAssessment()
  }, [])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/ai/emergency-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          context: {
            company: company?.name,
            pacScore: assessment?.pacScore,
            phase: assessment?.currentPhase,
            overdueTasks: assessment?.overdueTasks,
            blockers: assessment?.blockerCount,
          },
        }),
      })

      const data = await res.json()
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.response || 'I understand. Let\'s take a step back and focus on what matters most right now.',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Failed to send message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'I\'m here to help. What\'s the most pressing concern on your mind right now?',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: '#F7F6F4' }}>
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#E8312A15' }}>
              <AlertCircle className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-nav">Emergency Assessment</h1>
              <p className="text-text-muted text-sm">Pause • Recalibrate • Refocus</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel: Assessment */}
          <div className="lg:col-span-1 space-y-6">
            <AnimatePresence>
              {showAssessment && assessment && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {/* Status Overview */}
                  <div className="card p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="font-bold text-nav">Status Overview</h2>
                      <button
                        onClick={() => setShowAssessment(false)}
                        className="text-text-muted hover:text-nav transition-colors"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>

                    {/* PACE Score */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-text-muted">PACE™ Score</span>
                        <span className="text-xl font-bold text-nav">{assessment.pacScore}/100</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${assessment.pacScore}%` }}
                        />
                      </div>
                      <p className="text-xs text-text-muted">
                        {assessment.pacScore >= 75 ? 'On Track' : assessment.pacScore >= 50 ? 'At Risk' : 'Critical'}
                      </p>
                    </div>

                    {/* Time to IPO */}
                    <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--color-bg-primary)' }}>
                      <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs text-text-muted">Time to IPO</p>
                        <p className="font-bold text-nav">{assessment.daysToIPO} days</p>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--color-bg-primary)' }}>
                      <TrendingUp className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs text-text-muted">Overall Progress</p>
                        <p className="font-bold text-nav">{assessment.progressPercentage}% Complete</p>
                      </div>
                    </div>
                  </div>

                  {/* Key Blockers */}
                  <div className="card p-6 space-y-3">
                    <h3 className="font-bold text-nav text-sm">Key Blockers</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-red-50">
                        <div>
                          <p className="text-xs font-semibold text-red-900">Overdue Tasks</p>
                          <p className="text-xs text-red-700">{assessment.overdueTasks} items</p>
                        </div>
                        <span className="text-lg font-bold text-red-600">{assessment.overdueTasks}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50">
                        <div>
                          <p className="text-xs font-semibold text-amber-900">Active Blockers</p>
                          <p className="text-xs text-amber-700">Flagged issues</p>
                        </div>
                        <span className="text-lg font-bold text-amber-600">{assessment.blockerCount}</span>
                      </div>
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="card p-6 space-y-3">
                    <h3 className="font-bold text-nav text-sm">Your Role</h3>
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-semibold text-nav">{session?.user?.name || 'User'}</p>
                        <p className="text-xs text-text-muted">{assessment.userRole || 'Executive Lead'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Key Focus Areas */}
                  <div className="card p-6 space-y-3">
                    <h3 className="font-bold text-nav text-sm">Priority Actions</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-xs font-bold text-blue-600 mt-1">1</span>
                        <span className="text-text-muted">Complete overdue governance filings</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-xs font-bold text-blue-600 mt-1">2</span>
                        <span className="text-text-muted">Engage audit firm in next 7 days</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-xs font-bold text-blue-600 mt-1">3</span>
                        <span className="text-text-muted">Resolve critical board dependencies</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-xs font-bold text-blue-600 mt-1">4</span>
                        <span className="text-text-muted">Get team aligned on timeline</span>
                      </li>
                    </ul>
                  </div>

                  {/* Validation Gaps Summary */}
                  {assessment?.readinessGaps && assessment.readinessGaps.length > 0 && (
                    <div className="card p-6 space-y-3">
                      <h3 className="font-bold text-nav text-sm">Readiness Gaps</h3>
                      <div className="space-y-2">
                        {assessment.readinessGaps.slice(0, 3).map((gap, idx) => (
                          <div key={idx} className={`p-2 rounded-lg text-xs ${
                            gap.severity === 'critical' ? 'bg-red-50' :
                            gap.severity === 'high' ? 'bg-amber-50' :
                            gap.severity === 'medium' ? 'bg-yellow-50' :
                            'bg-blue-50'
                          }`}>
                            <p className="font-semibold text-nav">{gap.title}</p>
                            <p className="text-text-muted mt-1">{gap.recommendation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Panel: AI Chat */}
          <div className="lg:col-span-2 card flex flex-col h-[600px]">
            {/* Chat Header */}
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#1A1A1A15' }}>
                  <Zap className="w-4 h-4 text-nav" />
                </div>
                <div>
                  <p className="font-semibold text-nav text-sm">Emergency Guidance AI</p>
                  <p className="text-xs text-text-muted">Context-aware coaching for your specific situation</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && (
                <div className="h-full flex items-center justify-center text-center">
                  <div>
                    <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-nav font-semibold mb-2">Let's pause and recalibrate</p>
                    <p className="text-sm text-text-muted max-w-xs">
                      Tell me what's on your mind. What's the biggest challenge you're facing right now?
                    </p>
                  </div>
                </div>
              )}

              <AnimatePresence>
                {messages.map((msg, idx) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                        msg.type === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-gray-100 text-nav rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <p className={`text-xs mt-1 ${msg.type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2 p-4"
                >
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-100" />
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-200" />
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 p-6">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                  placeholder="What's the biggest challenge right now?"
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-nav placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading}
                  className="px-4 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
