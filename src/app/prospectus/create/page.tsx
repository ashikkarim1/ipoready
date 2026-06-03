'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { ArrowRight, FileText, BarChart3, Building2 } from 'lucide-react'
import { initializeProspectus } from '@/lib/prospectus-engine'

interface ExchangeTemplate {
  id: string
  name: string
  formType: string
  description: string
  icon: React.ReactNode
  sections: number
  estimatedDays: number
}

const EXCHANGE_TEMPLATES: ExchangeTemplate[] = [
  {
    id: 'sec',
    name: 'SEC (US)',
    formType: 'S-1',
    description: 'Registration statement for initial public offering on NYSE/NASDAQ',
    icon: <Building2 className="w-6 h-6" />,
    sections: 28,
    estimatedDays: 60,
  },
  {
    id: 'tsxv',
    name: 'TSX-V (Canada)',
    formType: 'Form 2A',
    description: 'Capital pool company prospectus for TSX Venture Exchange',
    icon: <BarChart3 className="w-6 h-6" />,
    sections: 22,
    estimatedDays: 45,
  },
  {
    id: 'tsx',
    name: 'TSX (Canada)',
    formType: 'Long Form Prospectus',
    description: 'Full prospectus for listing on Toronto Stock Exchange',
    icon: <FileText className="w-6 h-6" />,
    sections: 25,
    estimatedDays: 55,
  },
]

export default function CreateProspectuPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [selectedExchange, setSelectedExchange] = useState<string | null>(null)
  const [prospectusName, setProspectusName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCreate = async () => {
    if (!selectedExchange || !prospectusName.trim()) {
      setError('Please select an exchange and enter a prospectus name')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const companyId = session?.user?.companyId || 'demo-company-1'
      const result = await initializeProspectus(companyId, selectedExchange)
      router.push(`/prospectus/${result.prospectusId}/editor`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create prospectus')
      setIsLoading(false)
    }
  }

  const selectedTemplate = EXCHANGE_TEMPLATES.find(t => t.id === selectedExchange)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6" suppressHydrationWarning>
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Create New Prospectus</h1>
            <p className="text-lg text-gray-600">
              Select your exchange and configure your IPO document
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {EXCHANGE_TEMPLATES.map((template) => (
            <motion.button
              key={template.id}
              onClick={() => {
                setSelectedExchange(template.id)
                setError('')
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`p-6 rounded-lg border-2 transition-all text-left h-full ${
                selectedExchange === template.id
                  ? 'border-blue-600 bg-blue-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
              }`}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                selectedExchange === template.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {template.icon}
              </div>

              <h3 className="font-bold text-gray-900 text-lg mb-1">{template.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{template.formType}</p>
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">{template.description}</p>

              <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-200">
                <span>{template.sections} sections</span>
                <span>~{template.estimatedDays} days</span>
              </div>
            </motion.button>
          ))}
        </div>

        {selectedExchange && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg border border-gray-200 p-8 mb-8"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">Prospectus Details</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Prospectus Name
                </label>
                <input
                  type="text"
                  value={prospectusName}
                  onChange={(e) => {
                    setProspectusName(e.target.value)
                    setError('')
                  }}
                  placeholder={`e.g., TechCorp ${selectedTemplate?.formType}`}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  This will be the document name for your {selectedTemplate?.name} prospectus
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-4 pb-4 border-t border-b border-gray-200">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Exchange</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedTemplate?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Form Type</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedTemplate?.formType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Sections</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedTemplate?.sections}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Est. Completion Time</p>
                  <p className="text-lg font-semibold text-gray-900">~{selectedTemplate?.estimatedDays} days</p>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-50 border border-red-200 rounded-lg"
                >
                  <p className="text-sm text-red-700">{error}</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex gap-4 justify-center"
        >
          <button
            onClick={() => router.back()}
            className="px-6 py-3 rounded-lg border border-gray-300 text-gray-900 font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleCreate}
            disabled={!selectedExchange || !prospectusName.trim() || isLoading}
            className={`px-8 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all ${
              selectedExchange && prospectusName.trim() && !isLoading
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? 'Creating...' : 'Create Prospectus'}
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <p className="text-sm text-blue-900 leading-relaxed">
            💡 <strong>Tip:</strong> Your prospectus will be initialized with all sections based on the selected exchange template. 
            You can then map your source documents, generate AI drafts, and refine each section before submission.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
