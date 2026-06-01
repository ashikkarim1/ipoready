'use client'

import { useState, useCallback } from 'react'
import { X, Send, AlertCircle, CheckCircle } from 'lucide-react'

interface FeedbackWidgetProps {
  page: string
  task?: string
  onClose: () => void
}

type FeedbackCategory = 'Feature Request' | 'Bug Report' | 'UX/UI Feedback' | 'Performance' | 'Documentation' | 'Other'

const FEEDBACK_CATEGORIES: FeedbackCategory[] = [
  'Feature Request',
  'Bug Report',
  'UX/UI Feedback',
  'Performance',
  'Documentation',
  'Other',
]

export function FeedbackWidget({ page, task, onClose }: FeedbackWidgetProps) {
  const [step, setStep] = useState<'rating' | 'form' | 'success'>('rating')
  const [rating, setRating] = useState<number | null>(null)
  const [category, setCategory] = useState<FeedbackCategory>('Other')
  const [subject, setSubject] = useState('')
  const [feedbackText, setFeedbackText] = useState('')
  const [confusionPoints, setConfusionPoints] = useState<string[]>([])
  const [confusionInput, setConfusionInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRatingSelect = (value: number) => {
    setRating(value)
    setStep('form')
  }

  const handleAddConfusionPoint = () => {
    if (confusionInput.trim()) {
      setConfusionPoints([...confusionPoints, confusionInput.trim()])
      setConfusionInput('')
    }
  }

  const handleRemoveConfusionPoint = (index: number) => {
    setConfusionPoints(confusionPoints.filter((_, i) => i !== index))
  }

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!rating || !feedbackText.trim()) {
        setError('Please provide a rating and feedback text')
        return
      }

      setIsSubmitting(true)
      setError(null)

      try {
        const response = await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            page,
            task,
            rating,
            category,
            subject,
            feedbackText,
            confusionPoints: confusionPoints.length > 0 ? confusionPoints : undefined,
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to submit feedback')
        }

        setStep('success')
        setTimeout(onClose, 2000)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsSubmitting(false)
      }
    },
    [rating, feedbackText, page, task, category, subject, confusionPoints, onClose]
  )

  return (
    <div className="fixed bottom-4 right-4 w-full max-w-md bg-white rounded-lg shadow-2xl border border-gray-200 z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Share Your Feedback</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Close feedback widget"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {step === 'rating' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">How satisfied are you with IPOReady?</p>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => handleRatingSelect(value)}
                  className={`w-10 h-10 rounded-lg font-semibold transition-colors ${
                    rating === value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 text-center">1 = Not Satisfied, 5 = Very Satisfied</p>
          </div>
        )}

        {step === 'form' && rating !== null && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {FEEDBACK_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject (Optional)</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief subject..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Feedback Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Feedback *</label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Tell us what you think..."
                maxLength={1000}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">{feedbackText.length}/1000</p>
            </div>

            {/* Confusion Points */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confusing Points (Optional)</label>
              <div className="flex gap-1 mb-2">
                <input
                  type="text"
                  value={confusionInput}
                  onChange={(e) => setConfusionInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddConfusionPoint())}
                  placeholder="What was confusing?"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={handleAddConfusionPoint}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  +
                </button>
              </div>
              {confusionPoints.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {confusionPoints.map((point, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs"
                    >
                      {point}
                      <button
                        type="button"
                        onClick={() => handleRemoveConfusionPoint(idx)}
                        className="ml-1 hover:text-blue-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !feedbackText.trim()}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Sending...' : 'Send Feedback'}
            </button>
          </form>
        )}

        {step === 'success' && (
          <div className="flex flex-col items-center justify-center py-6">
            <CheckCircle className="w-12 h-12 text-green-600 mb-3" />
            <p className="text-center text-gray-900 font-medium">Thank you!</p>
            <p className="text-center text-sm text-gray-600 mt-1">Your feedback helps us improve</p>
          </div>
        )}
      </div>
    </div>
  )
}
