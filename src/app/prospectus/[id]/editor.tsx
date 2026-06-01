'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface ProspectusSection {
  id: string
  sectionNumber: string
  sectionName: string
  status: 'not_started' | 'draft' | 'in_review' | 'final'
  completionPct: number
  approvalTier: 'ai' | 'admin' | 'professional'
  wordCount: number
  typicalWordCount: number
  content: string
  lastUpdated: Date
  contentLength?: number
  dataDensity?: number
  requiredFields?: number
  complianceScore?: number
}

interface ProspectusMetadata {
  id: string
  companyName: string
  exchange: string
  formType: string
  createdAt: Date
  targetIpoDate: Date
  estimatedCompletionDate: Date
}

interface ContentBreakdown {
  contentLength: number
  dataDensity: number
  requiredFields: number
  complianceScore: number
}

interface LinkedDocument {
  id: string
  name: string
  type: string
  uploadedAt: Date
}

interface Comment {
  id: string
  author: string
  content: string
  timestamp: Date
  mentions: string[]
}

export default function ProspectusEditorPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session } = useSession()
  const prospectusId = params.id as string

  const [metadata, setMetadata] = useState<ProspectusMetadata | null>(null)
  const [sections, setSections] = useState<ProspectusSection[]>([])
  const [selectedSection, setSelectedSection] = useState<ProspectusSection | null>(null)
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [breakdown, setBreakdown] = useState<ContentBreakdown>({
    contentLength: 0,
    dataDensity: 0,
    requiredFields: 0,
    complianceScore: 0,
  })
  const [linkedDocs, setLinkedDocs] = useState<LinkedDocument[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [completionScore, setCompletionScore] = useState(0)
  const [estimatedHours, setEstimatedHours] = useState(2)
  const autosaveTimer = useRef<NodeJS.Timeout | null>(null)

  // Fetch prospectus data
  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) return

      try {
        setIsLoading(true)

        // Fetch prospectus metadata and sections
        const response = await fetch(
          `/api/prospectus/${prospectusId}/progress`
        )
        if (!response.ok) throw new Error('Failed to fetch prospectus')

        const data = await response.json()
        setMetadata(data.metadata)
        setSections(data.sections)

        // Set first section as selected
        if (data.sections.length > 0) {
          setSelectedSection(data.sections[0])
          setContent(data.sections[0].content || '')
          setBreakdown({
            contentLength: data.sections[0].contentLength || 0,
            dataDensity: data.sections[0].dataDensity || 0,
            requiredFields: data.sections[0].requiredFields || 0,
            complianceScore: data.sections[0].complianceScore || 0,
          })
        }

        // Fetch linked documents
        const docsResponse = await fetch(
          `/api/prospectus/${prospectusId}/extract-documents`
        )
        if (docsResponse.ok) {
          const docsData = await docsResponse.json()
          setLinkedDocs(docsData.documents || [])
        }
      } catch (error) {
        console.error('Error fetching prospectus:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [prospectusId, session])

  // Autosave handler
  const autosave = useCallback(async () => {
    if (!selectedSection || !session?.user?.id) return

    try {
      setIsSaving(true)

      const response = await fetch(
        `/api/prospectus/${prospectusId}/submit-section`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sectionId: selectedSection.id,
            content,
            status: 'draft',
          }),
        }
      )

      if (response.ok) {
        setLastSaved(new Date())

        // Calculate new breakdown scores
        const wordCount = content.split(/\s+/).length
        const contentScore = Math.min(100, (wordCount / selectedSection.typicalWordCount) * 100)
        const newBreakdown = {
          ...breakdown,
          contentLength: Math.round(contentScore),
        }
        setBreakdown(newBreakdown)

        const totalScore = Math.round(
          contentScore * 0.4 +
          (breakdown.dataDensity || 0) * 0.3 +
          (breakdown.requiredFields || 0) * 0.2 +
          (breakdown.complianceScore || 0) * 0.1
        )
        setCompletionScore(totalScore)
      }
    } catch (error) {
      console.error('Error autosaving:', error)
    } finally {
      setIsSaving(false)
    }
  }, [selectedSection, content, prospectusId, session, breakdown])

  // Setup autosave interval
  useEffect(() => {
    if (!selectedSection || content === selectedSection.content) return

    if (autosaveTimer.current) {
      clearTimeout(autosaveTimer.current)
    }

    autosaveTimer.current = setTimeout(autosave, 2000)

    return () => {
      if (autosaveTimer.current) {
        clearTimeout(autosaveTimer.current)
      }
    }
  }, [content, selectedSection, autosave])

  // Handle section selection
  const handleSectionClick = (section: ProspectusSection) => {
    setSelectedSection(section)
    setContent(section.content || '')
    setBreakdown({
      contentLength: section.contentLength || 0,
      dataDensity: section.dataDensity || 0,
      requiredFields: section.requiredFields || 0,
      complianceScore: section.complianceScore || 0,
    })
    setShowComments(false)
  }

  // Handle submit for review
  const handleSubmitReview = async () => {
    if (!selectedSection) return

    try {
      const response = await fetch(
        `/api/prospectus/${prospectusId}/submit-section`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sectionId: selectedSection.id,
            status: 'in_review',
          }),
        }
      )

      if (response.ok) {
        setSelectedSection({ ...selectedSection, status: 'in_review' })
      }
    } catch (error) {
      console.error('Error submitting section:', error)
    }
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'not_started':
        return '○'
      case 'draft':
        return '◐'
      case 'in_review':
        return '⟳'
      case 'final':
        return '✓'
      default:
        return '○'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not_started':
        return 'text-gray-400'
      case 'draft':
        return 'text-blue-500'
      case 'in_review':
        return 'text-amber-500'
      case 'final':
        return 'text-green-500'
      default:
        return 'text-gray-400'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading prospectus editor...</p>
        </div>
      </div>
    )
  }

  if (!metadata || !selectedSection) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Prospectus not found</p>
          <Link href="/prospectus" className="text-blue-600 hover:underline">
            Back to prospectuses
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* LEFT SIDEBAR - Sections List */}
      <aside className="w-full sm:w-80 bg-slate-50 border-r border-slate-200 overflow-y-auto">
        <div className="p-4 border-b border-slate-200 sticky top-0 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900 mb-1">
            {metadata.companyName}
          </h2>
          <p className="text-sm text-slate-600">{metadata.exchange} · {metadata.formType}</p>
          <p className="text-xs text-slate-500 mt-2">
            Created {new Date(metadata.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="p-4">
          <div className="space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => handleSectionClick(section)}
                className={`w-full text-left p-3 rounded-md transition-colors ${
                  selectedSection.id === section.id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-slate-100'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className={`text-lg mt-0.5 ${getStatusColor(section.status)}`}>
                    {getStatusIcon(section.status)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {section.sectionName}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-slate-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${section.completionPct}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 whitespace-nowrap">
                        {section.completionPct}%
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* CENTER PANEL - Editor */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Editor Header */}
        <header className="border-b border-slate-200 bg-white p-4 sm:p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {selectedSection.sectionName}
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                {selectedSection.wordCount} / {selectedSection.typicalWordCount} words
              </p>
            </div>
            <div className="flex items-center gap-3">
              {lastSaved && (
                <p className="text-xs text-slate-500">
                  Saved {lastSaved.toLocaleTimeString()}
                </p>
              )}
              {isSaving && (
                <p className="text-xs text-blue-600 flex items-center gap-1">
                  <span className="animate-spin">⟳</span> Saving...
                </p>
              )}
            </div>
          </div>

          {/* Approval tier and status */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                selectedSection.approvalTier === 'ai'
                  ? 'bg-blue-100 text-blue-800'
                  : selectedSection.approvalTier === 'admin'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-green-100 text-green-800'
              }`}
            >
              {selectedSection.approvalTier === 'ai'
                ? 'AI Draft'
                : selectedSection.approvalTier === 'admin'
                ? 'Admin Approved'
                : 'Professional Review'}
            </span>

            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                selectedSection.status === 'final'
                  ? 'bg-green-100 text-green-800'
                  : selectedSection.status === 'in_review'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {selectedSection.status.replace('_', ' ').charAt(0).toUpperCase() +
                selectedSection.status.replace('_', ' ').slice(1)}
            </span>

            {selectedSection.status === 'draft' && (
              <button
                onClick={handleSubmitReview}
                className="px-4 py-1 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                Submit for Review
              </button>
            )}
          </div>
        </header>

        {/* Editor Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing or paste content here..."
            className="w-full h-full p-4 border border-slate-200 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </main>

      {/* RIGHT SIDEBAR - Metadata & AI Suggestions */}
      <aside className="hidden lg:flex lg:w-96 border-l border-slate-200 overflow-y-auto flex-col">
        {/* Completion Breakdown */}
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Completion Score</h3>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-700">Content Length</span>
                <span className="text-xs font-bold text-slate-900">{breakdown.contentLength}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${breakdown.contentLength}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">40% weight</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-700">Data Density</span>
                <span className="text-xs font-bold text-slate-900">{breakdown.dataDensity}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-amber-500 h-2 rounded-full"
                  style={{ width: `${breakdown.dataDensity}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">30% weight</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-700">Required Fields</span>
                <span className="text-xs font-bold text-slate-900">{breakdown.requiredFields}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${breakdown.requiredFields}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">20% weight</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-700">Compliance Score</span>
                <span className="text-xs font-bold text-slate-900">{breakdown.complianceScore}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full"
                  style={{ width: `${breakdown.complianceScore}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">10% weight</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-3">
              <p className="text-sm font-bold text-blue-900">{completionScore}%</p>
              <p className="text-xs text-blue-700">Overall Completion</p>
            </div>

            <p className="text-xs text-slate-600">
              Est. {estimatedHours} hour{estimatedHours !== 1 ? 's' : ''} to complete
            </p>
          </div>
        </div>

        {/* Linked Documents */}
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Source Documents</h3>
          {linkedDocs.length > 0 ? (
            <div className="space-y-2">
              {linkedDocs.map((doc) => (
                <a
                  key={doc.id}
                  href={`/documents/${doc.id}`}
                  className="block p-2 rounded-md bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <p className="text-xs font-medium text-slate-900 truncate">{doc.name}</p>
                  <p className="text-xs text-slate-500">{doc.type}</p>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No documents linked yet</p>
          )}
        </div>

        {/* Comments Section */}
        <div className="flex-1 flex flex-col p-4">
          <button
            onClick={() => setShowComments(!showComments)}
            className="text-sm font-bold text-slate-900 mb-3 hover:text-blue-600 transition-colors"
          >
            Comments ({comments.length})
          </button>

          {showComments && (
            <div className="space-y-3 flex-1 overflow-y-auto mb-3">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-slate-50 rounded-md p-3">
                  <p className="text-xs font-medium text-slate-900">{comment.author}</p>
                  <p className="text-xs text-slate-700 mt-1">{comment.content}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(comment.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          )}

          {showComments && (
            <div className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700">
                Post
              </button>
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}
