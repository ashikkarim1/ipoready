'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Activity, Clock, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react'

export default function FilingStatusPage() {
  const [filings, setFilings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch filings from API
    const fetchFilings = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/filings?status=all')
        // const data = await response.json()
        // setFilings(data)
        
        // Placeholder: show empty state
        setFilings([])
      } catch (error) {
        console.error('Failed to fetch filings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFilings()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Clock className="w-5 h-5 text-blue-600" />
      case 'processing':
        return <Activity className="w-5 h-5 text-orange-600" />
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'rejected':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      default:
        return <HelpCircle className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-50 border-blue-200'
      case 'processing':
        return 'bg-orange-50 border-orange-200'
      case 'approved':
        return 'bg-green-50 border-green-200'
      case 'rejected':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="h2 text-text-primary">Filing Status</h1>
        <p className="body-sm text-text-secondary mt-1">
          Track the real-time status of all your regulatory filings
        </p>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="caption text-text-secondary">Total Filings</p>
              <p className="h4 text-text-primary mt-1">0</p>
            </div>
            <Activity className="w-8 h-8 text-blue-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white border border-gray-200 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="caption text-text-secondary">Processing</p>
              <p className="h4 text-text-primary mt-1">0</p>
            </div>
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-gray-200 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="caption text-text-secondary">Approved</p>
              <p className="h4 text-text-primary mt-1">0</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white border border-gray-200 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="caption text-text-secondary">Issues</p>
              <p className="h4 text-text-primary mt-1">0</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </motion.div>
      </div>

      {/* Empty State */}
      {filings.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white border border-gray-200 rounded-lg p-12 text-center"
        >
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="h4 text-text-primary">No filings yet</h3>
          <p className="body-sm text-text-secondary mt-2">
            Start by creating your first filing
          </p>
        </motion.div>
      )}

      {/* Filings List */}
      {filings.length > 0 && (
        <div className="space-y-4">
          {filings.map((filing) => (
            <motion.div
              key={filing.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`border rounded-lg p-4 ${getStatusColor(filing.status)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {getStatusIcon(filing.status)}
                  <div>
                    <h4 className="h4 text-text-primary">{filing.companyName}</h4>
                    <p className="caption text-text-secondary mt-1">
                      Filing ID: {filing.id}
                    </p>
                    <p className="caption text-text-secondary">
                      Submitted: {new Date(filing.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white">
                  {filing.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
