'use client'

import { useState, useEffect } from 'react'
import { Star, Trash2, AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react'

interface Feedback {
  id: string
  company_id: string
  user_id: string
  page: string
  task?: string
  subject?: string
  feedback_text: string
  rating: number
  confusion_points?: string[]
  sentiment: string
  status: string
  priority?: string
  created_at: string
  user_email?: string
  user_name?: string
  category_name?: string
}

interface FeedbackStats {
  totalFeedback: number
  averageRating: number
  sentimentBreakdown: {
    positive: number
    neutral: number
    negative: number
    frustrated: number
  }
  topConfusionPoints: Record<string, number>
}

export function FeedbackDashboard() {
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [stats, setStats] = useState<FeedbackStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    status: 'new',
    sentiment: '',
    page: '',
    limit: '50',
  })
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    fetchFeedback()
  }, [filters])

  const fetchFeedback = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (filters.status) params.append('status', filters.status)
      if (filters.sentiment) params.append('sentiment', filters.sentiment)
      if (filters.page) params.append('page', filters.page)
      params.append('limit', filters.limit)

      const response = await fetch(`/api/feedback?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch feedback')

      const data = await response.json()
      setFeedback(data.data || [])
      setStats(data.stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (feedbackId: string) => {
    try {
      const response = await fetch(`/api/feedback/${feedbackId}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete feedback')
      setFeedback(feedback.filter((f) => f.id !== feedbackId))
      setDeleteConfirm(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  const handleStatusUpdate = async (feedbackId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/feedback/${feedbackId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!response.ok) throw new Error('Failed to update feedback')
      fetchFeedback()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update')
    }
  }

  const sentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'neutral':
        return 'bg-gray-50 text-gray-700 border-gray-200'
      case 'negative':
        return 'bg-red-50 text-red-700 border-red-200'
      case 'frustrated':
        return 'bg-orange-50 text-orange-700 border-orange-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />
      case 'in_progress':
        return <TrendingUp className="w-4 h-4" />
      case 'acknowledged':
        return <Clock className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="body-sm text-gray-600">Total Feedback</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalFeedback}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="body-sm text-gray-600">Average Rating</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-3xl font-bold text-gray-900">{stats.averageRating}</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className="w-4 h-4"
                    fill={i <= Math.round(stats.averageRating) ? 'currentColor' : 'none'}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="body-sm text-gray-600">Sentiment</p>
            <div className="space-y-1 mt-2">
              <p className="caption-sm">Positive: {stats.sentimentBreakdown.positive}</p>
              <p className="caption-sm">Neutral: {stats.sentimentBreakdown.neutral}</p>
              <p className="caption-sm">Negative: {stats.sentimentBreakdown.negative}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="body-sm text-gray-600">Top Confusion Points</p>
            <div className="space-y-1 mt-2">
              {Object.entries(stats.topConfusionPoints)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3)
                .map(([point, count]) => (
                  <p key={point} className="caption-sm">
                    {point}: {count}
                  </p>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
        <h3 className="font-semibold text-gray-900">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg body-sm"
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="wontfix">Won't Fix</option>
          </select>

          <select
            value={filters.sentiment}
            onChange={(e) => setFilters({ ...filters, sentiment: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg body-sm"
          >
            <option value="">All Sentiments</option>
            <option value="positive">Positive</option>
            <option value="neutral">Neutral</option>
            <option value="negative">Negative</option>
            <option value="frustrated">Frustrated</option>
          </select>

          <select
            value={filters.page}
            onChange={(e) => setFilters({ ...filters, page: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg body-sm"
          >
            <option value="">All Pages</option>
            <option value="/dashboard">Dashboard</option>
            <option value="/pace">PACE</option>
            <option value="/tasks">Tasks</option>
          </select>

          <select
            value={filters.limit}
            onChange={(e) => setFilters({ ...filters, limit: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg body-sm"
          >
            <option value="25">25 per page</option>
            <option value="50">50 per page</option>
            <option value="100">100 per page</option>
          </select>
        </div>
      </div>

      {/* Feedback List */}
      <div className="space-y-3">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 body-sm">{error}</div>
        )}

        {loading ? (
          <div className="text-center py-8 text-gray-600">Loading feedback...</div>
        ) : feedback.length === 0 ? (
          <div className="text-center py-8 text-gray-600">No feedback found</div>
        ) : (
          feedback.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">{item.subject || 'Untitled'}</h4>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${sentimentColor(item.sentiment)}`}>
                      {item.sentiment}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full caption-sm">
                      {item.rating}/{5}⭐
                    </span>
                  </div>
                  <p className="body-sm text-gray-600 mt-1">
                    From {item.user_name || item.user_email || 'Unknown'} • {item.page}{item.task && ` • ${item.task}`}
                  </p>
                </div>
                <button
                  onClick={() => setDeleteConfirm(deleteConfirm === item.id ? null : item.id)}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>

              {/* Content */}
              <p className="text-gray-700 body-sm">{item.feedback_text}</p>

              {/* Confusion Points */}
              {item.confusion_points && item.confusion_points.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {item.confusion_points.map((point, idx) => (
                    <span key={idx} className="px-2 py-1 bg-orange-50 text-orange-700 rounded caption-sm border border-orange-200">
                      {point}
                    </span>
                  ))}
                </div>
              )}

              {/* Status & Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <select
                  value={item.status}
                  onChange={(e) => handleStatusUpdate(item.id, e.target.value)}
                  className="flex items-center gap-2 px-3 py-1 border border-gray-300 rounded-lg body-sm"
                >
                  <option value="new">New</option>
                  <option value="acknowledged">Acknowledged</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="wontfix">Won't Fix</option>
                </select>

                <p className="caption-sm text-gray-500">{new Date(item.created_at).toLocaleDateString()}</p>

                {deleteConfirm === item.id && (
                  <div className="flex items-center gap-2">
                    <p className="body-sm text-red-700">Delete this feedback?</p>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded body-sm hover:bg-red-700"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="px-3 py-1 bg-gray-300 text-gray-700 rounded body-sm hover:bg-gray-400"
                    >
                      No
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
