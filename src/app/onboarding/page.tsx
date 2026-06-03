'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ONBOARDING_GUIDANCE } from '@/lib/onboarding-guidance'

interface ChecklistItem {
  id: string
  item_name: string
  category: string
  required: boolean
  status: string
  completed_at: string | null
  estimated_days: number
  completion_percentage: number
  order_index: number
}

interface OnboardingProgress {
  status: string
  completionPercentage: number
  totalItems: number
  completedItems: number
}

type Stage = 'welcome' | 'checklist' | 'completed'

const EXCHANGES = [
  { id: 'tsx', label: 'TSX', fullName: 'Toronto Venture Exchange' },
  { id: 'nasdaq', label: 'NASDAQ', fullName: 'NASDAQ Stock Market' },
  { id: 'cse', label: 'CSE', fullName: 'Canadian Securities Exchange' },
  { id: 'tsxv', label: 'TSXV', fullName: 'TSX Venture Exchange' },
  { id: 'otc', label: 'OTC', fullName: 'Over-The-Counter Markets' },
]

export default function OnboardingPage() {
  const [stage, setStage] = useState<Stage>('welcome')
  const [selectedExchange, setSelectedExchange] = useState<string | null>(null)
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([])
  const [progress, setProgress] = useState<OnboardingProgress>({
    status: 'not_started',
    completionPercentage: 0,
    totalItems: 0,
    completedItems: 0,
  })
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProgress()
  }, [])

  const fetchProgress = async () => {
    try {
      const res = await fetch('/api/onboarding/progress')
      const data = await res.json()
      setProgress(data)
      if (data.status === 'not_started') {
        setStage('welcome')
      } else if (data.status === 'completed') {
        setStage('completed')
        fetchItems()
      } else {
        setStage('checklist')
        fetchItems()
      }
    } catch (err) {
      console.error('Failed to fetch progress:', err)
    }
  }

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/onboarding/items')
      if (!res.ok) throw new Error('Failed to fetch items')
      const data = await res.json()
      setChecklistItems(data.items)
    } catch (err) {
      console.error('Failed to fetch items:', err)
    }
  }

  const handleStartOnboarding = async (exchange: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/onboarding/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exchange }),
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to start onboarding')
      }
      setSelectedExchange(exchange)
      await fetchProgress()
      await fetchItems()
      setStage('checklist')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleItem = async (itemId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed'
    try {
      const res = await fetch(`/api/onboarding/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('Failed to update item')
      const data = await res.json()
      setProgress(prev => ({
        ...prev,
        completionPercentage: data.checklistCompletion,
      }))
      if (data.checklistStatus === 'completed') {
        setStage('completed')
      }
      await fetchItems()
    } catch (err) {
      console.error('Failed to update item:', err)
    }
  }

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  const groupedItems = checklistItems.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push(item)
      return acc
    },
    {} as Record<string, ChecklistItem[]>
  )

  const categories = Object.keys(groupedItems).sort()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-12" suppressHydrationWarning>
      <div className="max-w-2xl mx-auto">
        {/* Welcome Stage */}
        <AnimatePresence mode="wait">
          {stage === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold text-white">Welcome to IPOReady</h1>
                <p className="text-xl text-slate-300">
                  Let's prepare your company for a successful IPO. First, select your target exchange.
                </p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-200">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {EXCHANGES.map(exchange => (
                  <motion.button
                    key={exchange.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleStartOnboarding(exchange.id)}
                    disabled={loading}
                    className="relative group p-6 rounded-lg border-2 border-slate-700 hover:border-blue-500 bg-slate-800/50 hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-white">{exchange.label}</div>
                      <div className="text-sm text-slate-400">{exchange.fullName}</div>
                    </div>
                    {loading && selectedExchange === exchange.id && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.7)' }}>
                        <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Checklist Stage */}
          {stage === 'checklist' && (
            <motion.div
              key="checklist"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <h1 className="text-4xl font-bold text-white">Your IPO Readiness Checklist</h1>
                <p className="text-slate-300">
                  Complete these items to prepare your company for the IPO process. Items marked with
                  <span className="text-red-400 font-semibold"> * </span>
                  are required.
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Progress</span>
                  <span className="font-semibold text-blue-400">{progress.completionPercentage}%</span>
                </div>
                <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress.completionPercentage}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                  />
                </div>
                <div className="text-sm text-slate-400">
                  {progress.completedItems} of {progress.totalItems} items completed
                </div>
              </div>

              {/* Categories and Items */}
              <div className="space-y-3">
                {categories.map(category => (
                  <div key={category} className="border border-slate-700 rounded-lg overflow-hidden bg-slate-800/50">
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-800 transition-colors"
                    >
                      <span className="font-semibold text-white text-lg">{category}</span>
                      <motion.div
                        animate={{ rotate: expandedCategories.has(category) ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {expandedCategories.has(category) && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          className="border-t border-slate-700 divide-y divide-slate-700 overflow-hidden"
                        >
                          {groupedItems[category].map(item => (
                            <div
                              key={item.id}
                              className="px-6 py-4 hover:bg-slate-750 transition-colors space-y-3"
                            >
                              <div className="flex items-start gap-4">
                                <input
                                  type="checkbox"
                                  checked={item.status === 'completed'}
                                  onChange={() => handleToggleItem(item.id, item.status)}
                                  className="mt-1 w-5 h-5 rounded border-slate-500 text-blue-500 cursor-pointer"
                                />
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center gap-2">
                                    <label className="font-medium text-white cursor-pointer">
                                      {item.item_name}
                                    </label>
                                    {item.required && <span className="text-red-400 font-bold">*</span>}
                                  </div>
                                  <div className="flex items-center gap-3 text-sm text-slate-400">
                                    <span>{item.estimated_days} days</span>
                                    <span className="text-slate-600">•</span>
                                    <span className="capitalize">{item.status}</span>
                                  </div>
                                </div>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() =>
                                    setExpandedItem(expandedItem === item.id ? null : item.id)
                                  }
                                  className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                                >
                                  Learn More
                                </motion.button>
                              </div>

                              {/* Guidance Modal */}
                              <AnimatePresence>
                                {expandedItem === item.id && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="ml-9 pt-3 border-l-2 border-blue-500/30 space-y-3"
                                  >
                                    {ONBOARDING_GUIDANCE[item.item_name] && (
                                      <div className="space-y-3 text-sm text-slate-300">
                                        <div>
                                          <h4 className="font-semibold text-blue-400 mb-2">How IPOReady Helps</h4>
                                          <p>
                                            {ONBOARDING_GUIDANCE[item.item_name].ipoReadyGuidance}
                                          </p>
                                        </div>
                                        <div>
                                          <h4 className="font-semibold text-blue-400 mb-2">Resources</h4>
                                          <ul className="space-y-1">
                                            {ONBOARDING_GUIDANCE[item.item_name].externalResources.map(
                                              (resource, idx) => (
                                                <li key={idx}>
                                                  <a
                                                    href={resource.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-400 hover:text-blue-300 underline"
                                                  >
                                                    {resource.title}
                                                  </a>
                                                  <span className="text-slate-500 text-xs ml-2">
                                                    ({resource.type})
                                                  </span>
                                                </li>
                                              )
                                            )}
                                          </ul>
                                        </div>
                                      </div>
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Completed Stage */}
          {stage === 'completed' && (
            <motion.div
              key="completed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 100 }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 border-2 border-green-500 rounded-full">
                  <svg className="w-8 h-8 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </motion.div>

              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-white">Onboarding Complete!</h1>
                <p className="text-xl text-slate-300">
                  Your company is ready to begin the IPO process. Let's start your PACE workflow.
                </p>
              </div>

              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="/dashboard"
                className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Start PACE Workflow
              </motion.a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
