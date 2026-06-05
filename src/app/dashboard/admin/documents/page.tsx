'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, Clock, FileText, Search } from 'lucide-react'

interface DocumentFile {
  id: string
  documentType: string
  fileName: string
  uploadedAt: string
  uploadedBy: string
  status: 'uploaded' | 'verifying' | 'verified' | 'rejected'
  verificationNotes?: string
}

interface VerificationAction {
  fileId: string
  status: 'verified' | 'rejected'
  notes: string
}

export default function DocumentVerificationAdminPage() {
  const [files, setFiles] = useState<DocumentFile[]>([
    {
      id: 'file-1',
      documentType: 'Prospectus',
      fileName: 'Prospectus_Final_20240601.pdf',
      uploadedAt: new Date(Date.now() - 86400000).toISOString(),
      uploadedBy: 'alice@company.com',
      status: 'uploaded',
    },
    {
      id: 'file-2',
      documentType: 'Financial Statements',
      fileName: 'FY2023_Audited_Financials.pdf',
      uploadedAt: new Date(Date.now() - 172800000).toISOString(),
      uploadedBy: 'bob@company.com',
      status: 'verifying',
    },
    {
      id: 'file-3',
      documentType: 'Board Resolutions',
      fileName: 'Board_Minutes_IPO_Authorization.pdf',
      uploadedAt: new Date(Date.now() - 259200000).toISOString(),
      uploadedBy: 'charlie@company.com',
      status: 'verified',
    },
  ])

  const [selectedFile, setSelectedFile] = useState<DocumentFile | null>(null)
  const [verificationNotes, setVerificationNotes] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'uploaded' | 'verifying' | 'verified' | 'rejected'>('all')

  const handleVerify = async (fileId: string, status: 'verified' | 'rejected') => {
    try {
      const response = await fetch('/api/documents/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId,
          documentId: 'doc-1',
          status,
          notes: verificationNotes,
        }),
      })

      if (response.ok) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? {
                  ...f,
                  status,
                  verificationNotes,
                }
              : f
          )
        )
        setSelectedFile(null)
        setVerificationNotes('')
      }
    } catch (error) {
      console.error('Verification error:', error)
      alert('Failed to verify document')
    }
  }

  const filteredFiles = files.filter((f) => {
    const matchesSearch =
      f.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.documentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filter === 'all' || f.status === filter

    return matchesSearch && matchesFilter
  })

  const stats = {
    total: files.length,
    uploaded: files.filter((f) => f.status === 'uploaded').length,
    verifying: files.filter((f) => f.status === 'verifying').length,
    verified: files.filter((f) => f.status === 'verified').length,
    rejected: files.filter((f) => f.status === 'rejected').length,
  }

  const getStatusIcon = (status: DocumentFile['status']) => {
    switch (status) {
      case 'verified':
        return <CheckCircle2 size={20} className="text-green-600" />
      case 'rejected':
        return <XCircle size={20} className="text-red-600" />
      case 'verifying':
        return <Clock size={20} className="text-amber-600" />
      case 'uploaded':
        return <FileText size={20} className="text-blue-600" />
    }
  }

  const getStatusBadge = (status: DocumentFile['status']) => {
    const badges = {
      verified: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      verifying: 'bg-amber-100 text-amber-700',
      uploaded: 'bg-blue-100 text-blue-700',
    }
    return badges[status]
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-black text-gray-900">
          📋 Document Verification
        </h1>
        <p className="text-lg text-gray-600">
          Review and verify submitted documents from companies.
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-5 gap-4"
      >
        <div className="bg-white border-2 border-gray-200 rounded-lg p-4 text-center">
          <p className="text-3xl font-black text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-600 font-semibold">Total</p>
        </div>
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-center">
          <p className="text-3xl font-black text-blue-600">{stats.uploaded}</p>
          <p className="text-xs text-blue-700 font-semibold">Awaiting Review</p>
        </div>
        <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 text-center">
          <p className="text-3xl font-black text-amber-600">{stats.verifying}</p>
          <p className="text-xs text-amber-700 font-semibold">In Progress</p>
        </div>
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center">
          <p className="text-3xl font-black text-green-600">{stats.verified}</p>
          <p className="text-xs text-green-700 font-semibold">Verified</p>
        </div>
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-center">
          <p className="text-3xl font-black text-red-600">{stats.rejected}</p>
          <p className="text-xs text-red-700 font-semibold">Rejected</p>
        </div>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-4 flex-col md:flex-row"
      >
        <div className="flex-1 relative">
          <Search size={20} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by filename, document type, or uploader..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-500"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'uploaded', 'verifying', 'verified', 'rejected'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === f
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </motion.div>

      {/* File List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        {filteredFiles.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No documents found matching your filters.</p>
          </div>
        ) : (
          filteredFiles.map((file) => (
            <div
              key={file.id}
              className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors cursor-pointer"
              onClick={() => setSelectedFile(file)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {getStatusIcon(file.status)}
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{file.fileName}</p>
                    <p className="text-sm text-gray-600">
                      {file.documentType} • Uploaded by {file.uploadedBy}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(file.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(file.status)}`}>
                  {file.status.charAt(0).toUpperCase() + file.status.slice(1)}
                </span>
              </div>
            </div>
          ))
        )}
      </motion.div>

      {/* Detail Panel */}
      {selectedFile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-2 border-gray-200 rounded-xl p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">{selectedFile.fileName}</h2>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-200">
            <div>
              <p className="text-xs text-gray-600 font-semibold">DOCUMENT TYPE</p>
              <p className="text-lg font-bold text-gray-900">{selectedFile.documentType}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-semibold">UPLOADED BY</p>
              <p className="text-lg font-bold text-gray-900">{selectedFile.uploadedBy}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-semibold">UPLOADED AT</p>
              <p className="text-lg font-bold text-gray-900">
                {new Date(selectedFile.uploadedAt).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-semibold">CURRENT STATUS</p>
              <p className={`text-lg font-bold ${selectedFile.status === 'verified' ? 'text-green-600' : selectedFile.status === 'rejected' ? 'text-red-600' : 'text-gray-900'}`}>
                {selectedFile.status.charAt(0).toUpperCase() + selectedFile.status.slice(1)}
              </p>
            </div>
          </div>

          {/* Verification Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Verification Notes
            </label>
            <textarea
              value={verificationNotes}
              onChange={(e) => setVerificationNotes(e.target.value)}
              placeholder="Add notes about your verification (e.g., minor corrections needed, approved as-is, etc.)"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-500 resize-none"
              rows={4}
            />
          </div>

          {/* Action Buttons */}
          {selectedFile.status !== 'verified' && selectedFile.status !== 'rejected' && (
            <div className="flex gap-4 pt-4">
              <button
                onClick={() => handleVerify(selectedFile.id, 'verified')}
                className="flex-1 px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={20} />
                Approve Document
              </button>
              <button
                onClick={() => handleVerify(selectedFile.id, 'rejected')}
                className="flex-1 px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <XCircle size={20} />
                Reject Document
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
