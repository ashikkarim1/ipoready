'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Upload, Search, Filter, Download, Share2, Trash2, Calendar, User, Eye } from 'lucide-react'

const MOCK_DOCUMENTS = [
  {
    id: 'doc-001',
    name: 'Financial Statements 2025',
    type: 'Financial',
    size: '2.4 MB',
    uploadedBy: 'John Smith',
    uploadedDate: '2026-05-20',
    status: 'verified',
  },
  {
    id: 'doc-002',
    name: 'Board Resolution - IPO Authorization',
    type: 'Legal',
    size: '1.2 MB',
    uploadedBy: 'Sarah Chen',
    uploadedDate: '2026-05-18',
    status: 'verified',
  },
  {
    id: 'doc-003',
    name: 'Cap Table - Current',
    type: 'Corporate',
    size: '845 KB',
    uploadedBy: 'Michael Zhang',
    uploadedDate: '2026-05-15',
    status: 'verified',
  },
  {
    id: 'doc-004',
    name: 'Risk Assessment Report',
    type: 'Compliance',
    size: '3.1 MB',
    uploadedBy: 'John Smith',
    uploadedDate: '2026-05-10',
    status: 'pending',
  },
  {
    id: 'doc-005',
    name: 'Market Research Analysis',
    type: 'Research',
    size: '5.6 MB',
    uploadedBy: 'Sarah Chen',
    uploadedDate: '2026-05-08',
    status: 'verified',
  },
]

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string | null>(null)

  const filteredDocs = MOCK_DOCUMENTS.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = !selectedType || doc.type === selectedType
    return matchesSearch && matchesType
  })

  const documentTypes = Array.from(new Set(MOCK_DOCUMENTS.map(d => d.type)))
  const statusColor = (status: string) => status === 'verified' ? '#2D7A5F' : '#B45309'
  const statusLabel = (status: string) => status === 'verified' ? 'Verified' : 'Pending'

  return (
    <div className="min-h-screen" style={{ background: '#F7F6F4' }}>
      {/* Header */}
      <header className="border-b" style={{ borderColor: '#E5E4E0', background: '#FFFFFF' }}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-xs uppercase tracking-widest font-semibold text-text-muted mb-3">
              Workspace
            </div>
            <h1 className="serif text-4xl text-nav mb-2">
              Documents
            </h1>
            <p className="text-text-muted max-w-2xl">
              Manage all IPO-related documents in one place. Upload, organize, and share files with your team.
            </p>
          </motion.div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="card p-8 mb-8 text-center"
          style={{ background: '#FDECEB', border: '1px solid #F5E5E1' }}
        >
          <Upload className="w-12 h-12 mx-auto mb-4" style={{ color: '#E8312A' }} />
          <h2 className="text-xl font-semibold text-nav mb-2">Upload Documents</h2>
          <p className="text-text-muted mb-6">Drag and drop files here or click to browse</p>
          <button className="btn btn-primary px-8 py-2.5 rounded-full">
            Choose Files
          </button>
        </motion.div>

        {/* Search & Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-8 flex gap-4 items-center"
        >
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border"
              style={{ borderColor: '#E5E4E0', background: '#FFFFFF' }}
            />
          </div>
          <div className="flex gap-2">
            {documentTypes.map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(selectedType === type ? null : type)}
                className="pill px-4 py-2 text-sm font-semibold"
                style={{
                  background: selectedType === type ? '#E8312A' : '#F7F6F4',
                  color: selectedType === type ? '#FFFFFF' : '#1A1A1A',
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Documents List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="space-y-4"
        >
          {filteredDocs.map((doc, idx) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="card p-6 flex items-center justify-between hover:shadow-md transition-shadow"
              style={{ background: '#FFFFFF', border: '1px solid #E5E4E0' }}
            >
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: '#F7F6F4' }}>
                  <FileText className="w-6 h-6" style={{ color: '#E8312A' }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-nav mb-1">{doc.name}</h3>
                  <div className="flex gap-4 text-xs text-text-muted">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" /> {doc.type}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {doc.uploadedDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" /> {doc.uploadedBy}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="pill px-3 py-1 text-xs font-semibold" style={{ background: `${statusColor(doc.status)}20`, color: statusColor(doc.status) }}>
                  {statusLabel(doc.status)}
                </span>
                <span className="text-sm text-text-muted">{doc.size}</span>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Eye className="w-4 h-4 text-text-muted" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Download className="w-4 h-4 text-text-muted" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Share2 className="w-4 h-4 text-text-muted" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4 text-text-muted" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filteredDocs.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <FileText className="w-12 h-12 mx-auto mb-4 text-text-muted opacity-50" />
            <p className="text-text-muted">No documents found</p>
          </motion.div>
        )}
      </main>
    </div>
  )
}
