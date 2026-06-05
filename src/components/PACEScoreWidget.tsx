'use client'

import { motion } from 'framer-motion'
import { HelpCircle, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'

interface PACEScoreWidgetProps {
  score: number // 0-100
  daysToListing?: number
  showDetails?: boolean
}

export function PACEScoreWidget({ score, daysToListing, showDetails = true }: PACEScoreWidgetProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  // Determine status based on score
  const getStatus = (score: number) => {
    if (score >= 80) return { status: 'EXCELLENT', color: '#2D7A5F', bgColor: '#EAF5F0', textColor: '#15803D' }
    if (score >= 60) return { status: 'GOOD', color: '#B45309', bgColor: '#FEF3C7', textColor: '#92400E' }
    if (score >= 40) return { status: 'FAIR', color: '#1D4ED8', bgColor: '#EFF6FF', textColor: '#1E40AF' }
    return { status: 'NEEDS WORK', color: '#DC2626', bgColor: '#FEE2E2', textColor: '#991B1B' }
  }

  // Get interpretation
  const getInterpretation = (score: number) => {
    if (score >= 80) return {
      meaning: 'You\'re IPO-ready or very close',
      timeline: '12-18 months to IPO',
      focus: 'Final preparations and regulatory filings',
      nextMilestone: 'Begin SEC pre-filing review'
    }
    if (score >= 60) return {
      meaning: 'You\'re on track for IPO',
      timeline: '18-36 months to IPO',
      focus: 'Strengthen governance, audit readiness, and compliance',
      nextMilestone: 'Establish audit committee and select auditor'
    }
    if (score >= 40) return {
      meaning: 'You have solid foundation, need improvements',
      timeline: '3-5 years to IPO',
      focus: 'Build out governance structure, compliance, and financial controls',
      nextMilestone: 'Implement SOC 2 certification'
    }
    return {
      meaning: 'Early stage, significant work needed',
      timeline: '5-10+ years to IPO',
      focus: 'Build financial controls, compliance infrastructure, and governance',
      nextMilestone: 'Establish board of directors'
    }
  }

  const statusInfo = getStatus(score)
  const interpretation = getInterpretation(score)

  return (
    <div className="w-full">
      {/* SIMPLE VIEW (Main Score) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-lg border-2"
        style={{
          background: statusInfo.bgColor,
          borderColor: statusInfo.color + '40'
        }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5" style={{ color: statusInfo.color }} />
            <h3 className="font-bold text-nav">PACE™ Score</h3>
            <button
              onClick={() => setShowTooltip(!showTooltip)}
              className="p-1 hover:bg-white/50 rounded-full transition"
            >
              <HelpCircle className="w-4 h-4 text-text-muted" />
            </button>
          </div>
          <span
            className="px-3 py-1 rounded-full font-bold text-sm"
            style={{ background: statusInfo.color, color: '#FFFFFF' }}
          >
            {statusInfo.status}
          </span>
        </div>

        {/* SCORE DISPLAY */}
        <div className="flex items-start gap-6 mb-6">
          <div>
            <div className="text-5xl font-bold text-nav mb-2">{score}</div>
            <p className="text-sm text-text-muted">out of 100</p>
          </div>

          {/* PROGRESS BAR */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="w-full bg-white/50 rounded-full h-3 overflow-hidden mb-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: statusInfo.color }}
              />
            </div>
            <div className="flex justify-between text-xs text-text-muted">
              <span>0</span>
              <span>50</span>
              <span>100</span>
            </div>
          </div>
        </div>

        {/* STATUS BENCHMARK */}
        <div className="grid grid-cols-3 gap-3 mb-4 pt-4 border-t" style={{ borderColor: statusInfo.color + '20' }}>
          <div className="text-center">
            <p className="text-xs text-text-muted font-semibold">YOUR SCORE</p>
            <p className="text-lg font-bold text-nav">{score}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-text-muted font-semibold">PEER MEDIAN</p>
            <p className="text-lg font-bold text-nav">65</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-text-muted font-semibold">IPO-READY</p>
            <p className="text-lg font-bold text-success">80+</p>
          </div>
        </div>

        {/* QUICK STATUS */}
        <div
          className="p-4 rounded-lg"
          style={{ background: 'rgba(255, 255, 255, 0.7)' }}
        >
          <p className="font-bold text-nav mb-1">{interpretation.meaning}</p>
          <p className="text-sm text-text-muted">{interpretation.timeline}</p>
        </div>
      </motion.div>

      {/* DETAILED VIEW (Expandable) */}
      {showDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: showTooltip ? 1 : 0, height: showTooltip ? 'auto' : 0 }}
          transition={{ duration: 0.3 }}
          className="mt-4 overflow-hidden"
        >
          <div className="card p-6 space-y-6">
            {/* INTERPRETATION */}
            <div>
              <h4 className="font-bold text-nav mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent" />
                What This Score Means
              </h4>
              <p className="text-nav text-sm leading-relaxed mb-4">
                {interpretation.meaning}. Your company will likely be IPO-ready in <strong>{interpretation.timeline}</strong>.
              </p>
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-sm text-nav">
                  <strong>Current Focus:</strong> {interpretation.focus}
                </p>
              </div>
            </div>

            {/* NEXT MILESTONE */}
            <div>
              <h4 className="font-bold text-nav mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                Next Major Milestone
              </h4>
              <div className="p-4 rounded-lg" style={{ background: '#EAF5F0', borderLeft: '4px solid #2D7A5F' }}>
                <p className="font-semibold text-nav">{interpretation.nextMilestone}</p>
                <p className="text-sm text-text-muted mt-1">This will improve your PACE score by ~5-10 points</p>
              </div>
            </div>

            {/* DIMENSION BREAKDOWN (Coming Soon) */}
            <div>
              <h4 className="font-bold text-nav mb-3">Score Breakdown by Dimension</h4>
              <div className="space-y-3">
                {[
                  { name: 'Governance', score: 65, target: 90 },
                  { name: 'Compliance', score: 58, target: 95 },
                  { name: 'Financial', score: 70, target: 85 },
                  { name: 'Market', score: 62, target: 80 },
                  { name: 'Growth', score: 60, target: 85 }
                ].map((dim) => (
                  <div key={dim.name}>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-semibold text-nav">{dim.name}</p>
                      <p className="text-xs text-text-muted">{dim.score} → {dim.target}</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(dim.score / dim.target) * 100}%` }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="h-full"
                        style={{
                          background: dim.score >= dim.target * 0.8 ? '#2D7A5F' : dim.score >= dim.target * 0.6 ? '#B45309' : '#DC2626'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RISK ALERT */}
            {score < 70 && (
              <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-warning mb-1">Area of Focus</p>
                  <p className="text-sm text-nav">Your PACE score is below our benchmark. Focus on completing governance requirements and financial audit preparation to increase readiness.</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}

// Re-export Zap from lucide-react since we use it
import { Zap } from 'lucide-react'
