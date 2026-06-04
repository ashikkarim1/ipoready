'use client'

import { useState, useRef } from 'react'
import {
  Upload,
  AlertCircle,
  CheckCircle,
  Loader,
  Trash2,
  FileText,
  Calendar,
  HardDrive,
  Zap,
  User,
  Briefcase,
  GraduationCap,
  Award,
} from 'lucide-react'

interface ResumeMetadata {
  fileName: string
  fileSize: number
  uploadDate: string
  contentType: string
}

interface ExtractedContent {
  summary?: string
  education: EducationEntry[]
  experience: ExperienceEntry[]
  skills: string[]
  certifications: string[]
}

interface EducationEntry {
  institution: string
  degree: string
  field: string
  graduationYear?: string
}

interface ExperienceEntry {
  company: string
  position: string
  duration: string
  description?: string
}

interface ResumeUploadProps {
  directorId: string
  directorName: string
  onUploadComplete: (resumeUrl: string) => void
}

export function ResumeUpload({
  directorId,
  directorName,
  onUploadComplete,
}: ResumeUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [resumeUrl, setResumeUrl] = useState<string | null>(null)
  const [metadata, setMetadata] = useState<ResumeMetadata | null>(null)
  const [extractedContent, setExtractedContent] = useState<ExtractedContent | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      await handleFileUpload(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const validateFile = (file: File): string | null => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (!validTypes.includes(file.type)) {
      return 'Only PDF and DOCX files are supported'
    }

    if (file.size > maxSize) {
      return 'File size must be less than 10MB'
    }

    return null
  }

  const handleFileUpload = async (file: File) => {
    setUploadError(null)

    const validationError = validateFile(file)
    if (validationError) {
      setUploadError(validationError)
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('directorId', directorId)
      formData.append('directorName', directorName)

      const response = await fetch('/api/directors-officers/upload-resume', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      // Set metadata
      setMetadata({
        fileName: file.name,
        fileSize: file.size,
        uploadDate: new Date().toISOString(),
        contentType: file.type,
      })

      setResumeUrl(result.url)
      onUploadComplete(result.url)
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : 'Failed to upload resume'
      )
    } finally {
      setIsUploading(false)
    }
  }

  const handleExtractText = async () => {
    if (!resumeUrl) return

    setIsExtracting(true)
    setUploadError(null)

    try {
      const response = await fetch('/api/directors-officers/extract-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          directorId,
          resumeUrl,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Extraction failed')
      }

      setExtractedContent(result.extractedContent)
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : 'Failed to extract resume content'
      )
    } finally {
      setIsExtracting(false)
    }
  }

  const handleDelete = async () => {
    if (!resumeUrl) return

    setIsUploading(true)
    setUploadError(null)

    try {
      const response = await fetch('/api/directors-officers/delete-resume', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          directorId,
          resumeUrl,
        }),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Deletion failed')
      }

      setResumeUrl(null)
      setMetadata(null)
      setExtractedContent(null)
      setShowDeleteConfirm(false)
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : 'Failed to delete resume'
      )
    } finally {
      setIsUploading(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="h4 text-gray-900 mb-2">Resume Upload</h2>
        <p className="body-sm text-gray-600">
          Upload {directorName}'s resume to extract professional background information
        </p>
      </div>

      {/* Upload Area or File Display */}
      {!resumeUrl ? (
        <div
          className={`relative rounded-lg border-2 border-dashed transition-colors ${
            isDragging
              ? 'border-[#E8312A] bg-red-50'
              : 'border-gray-300 bg-gray-50'
          } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-12 flex flex-col items-center justify-center space-y-3 cursor-pointer disabled:cursor-not-allowed"
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader className="w-8 h-8 text-[#E8312A] animate-spin" />
                <div className="text-center">
                  <p className="font-semibold text-gray-900">Uploading...</p>
                  <p className="body-sm text-gray-600">
                    Please wait while we process your file
                  </p>
                </div>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400" />
                <div className="text-center">
                  <p className="font-semibold text-gray-900">
                    Drag resume here or click to browse
                  </p>
                  <p className="body-sm text-gray-600 mt-1">
                    Supports PDF and DOCX files, up to 10MB
                  </p>
                </div>
              </>
            )}
          </button>
        </div>
      ) : (
        // File Uploaded - Show metadata and options
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <FileText className="w-6 h-6 text-gray-700" />
              </div>
              <div>
                <h3 className="label font-semibold text-gray-900 mb-1">
                  {metadata?.fileName}
                </h3>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-gray-600">
                    <HardDrive className="w-4 h-4" />
                    <span className="caption-sm">
                      {metadata && formatFileSize(metadata.fileSize)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span className="caption-sm">
                      Uploaded {metadata && formatDate(metadata.uploadDate)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Delete Button */}
            {showDeleteConfirm ? (
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  disabled={isUploading}
                  className="px-3 py-2 bg-red-100 text-red-700 rounded-lg label font-medium hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isUploading}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg label font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Delete resume"
              >
                <Trash2 className="w-5 h-5 text-gray-600 hover:text-red-600" />
              </button>
            )}
          </div>

          {/* Extract Button */}
          <button
            onClick={handleExtractText}
            disabled={isExtracting || isUploading || !!extractedContent}
            className="w-full px-4 py-3 bg-[#E8312A] text-white rounded-lg label font-semibold hover:bg-[#C4261F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isExtracting ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Extracting...
              </>
            ) : extractedContent ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Content Extracted
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Extract Professional Information
              </>
            )}
          </button>
        </div>
      )}

      {/* Error Display */}
      {uploadError && (
        <div className="rounded-lg bg-red-50 p-4 flex items-start gap-3 border border-red-200">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="label font-semibold text-red-900">Upload Error</p>
            <p className="body-sm text-red-700">{uploadError}</p>
          </div>
        </div>
      )}

      {/* Extracted Content Display */}
      {extractedContent && (
        <div className="space-y-4">
          <div className="border-t border-gray-200 pt-4">
            <h3 className="label font-semibold text-gray-900 mb-4">
              Extracted Professional Information
            </h3>

            {/* Professional Summary */}
            {extractedContent.summary && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="label font-semibold text-gray-900 mb-2">Summary</p>
                <p className="body-sm text-gray-700">{extractedContent.summary}</p>
              </div>
            )}

            {/* Education */}
            {extractedContent.education.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <GraduationCap className="w-5 h-5 text-[#E8312A]" />
                  <h4 className="label font-semibold text-gray-900">Education</h4>
                </div>
                <div className="space-y-3">
                  {extractedContent.education.map((edu, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="label font-semibold text-gray-900">{edu.degree}</p>
                      <p className="body-sm text-gray-700">{edu.field}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="caption-sm text-gray-600">{edu.institution}</p>
                        {edu.graduationYear && (
                          <span className="caption-sm font-medium text-gray-600">
                            {edu.graduationYear}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {extractedContent.experience.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Briefcase className="w-5 h-5 text-[#E8312A]" />
                  <h4 className="label font-semibold text-gray-900">Professional Experience</h4>
                </div>
                <div className="space-y-3">
                  {extractedContent.experience.map((exp, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between mb-1">
                        <p className="label font-semibold text-gray-900">{exp.position}</p>
                        <span className="caption-sm font-medium text-gray-600">
                          {exp.duration}
                        </span>
                      </div>
                      <p className="body-sm text-gray-700 mb-2">{exp.company}</p>
                      {exp.description && (
                        <p className="caption-sm text-gray-600">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {extractedContent.skills.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-5 h-5 text-[#E8312A]" />
                  <h4 className="label font-semibold text-gray-900">Skills</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {extractedContent.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full caption-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {extractedContent.certifications.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-5 h-5 text-[#E8312A]" />
                  <h4 className="label font-semibold text-gray-900">Certifications</h4>
                </div>
                <div className="space-y-2">
                  {extractedContent.certifications.map((cert, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="body-sm">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 mt-4">
              <p className="body-sm text-blue-900">
                ℹ️ Review extracted information for accuracy. You can manually edit these details in the director profile form if needed.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!resumeUrl && !uploadError && (
        <div className="text-center py-8">
          <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="body-sm text-gray-600">
            No resume uploaded yet
          </p>
        </div>
      )}
    </div>
  )
}
