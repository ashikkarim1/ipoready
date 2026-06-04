/**
 * Resume Upload and Processing Utilities
 * Handles file upload, validation, parsing, and text extraction for PDF and DOCX files
 */

import { createHash } from 'crypto'
import path from 'path'

// Allowed file types for resume uploads
export const ALLOWED_RESUME_TYPES = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
}

export const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx']
export const MAX_RESUME_FILE_SIZE = 10 * 1024 * 1024 // 10MB

/**
 * Validate resume file before processing
 */
export function validateResumeFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_RESUME_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${MAX_RESUME_FILE_SIZE / 1024 / 1024}MB`,
    }
  }

  // Check file extension
  const fileExtension = path.extname(file.name).toLowerCase()
  if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
    return {
      valid: false,
      error: `Invalid file type. Only PDF, DOC, and DOCX files are allowed.`,
    }
  }

  // Check MIME type
  const validMimeTypes = Object.keys(ALLOWED_RESUME_TYPES)
  if (file.type && !validMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid MIME type: ${file.type}`,
    }
  }

  return { valid: true }
}

/**
 * Generate SHA256 hash for file deduplication
 */
export function generateFileHash(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex')
}

/**
 * Generate secure file path for resume storage
 */
export function generateResumePath(
  professionalId: string,
  originalFileName: string,
  timestamp: number
): string {
  const extension = path.extname(originalFileName).toLowerCase()
  const fileName = `${professionalId}-${timestamp}${extension}`
  return path.join('resumes', fileName)
}

/**
 * Extract text from PDF file using pdf-parse
 */
export async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    const pdfParse = require('pdf-parse')
    const data = await pdfParse(buffer)
    return data.text || ''
  } catch (error) {
    console.error('Error extracting PDF text:', error)
    throw new Error('Failed to extract text from PDF')
  }
}

/**
 * Extract text from DOCX file using office-text-extractor
 */
export async function extractDocxText(buffer: Buffer): Promise<string> {
  try {
    const { extract } = require('office-text-extractor')
    const text = await extract({ buffer })
    return text || ''
  } catch (error) {
    console.error('Error extracting DOCX text:', error)
    throw new Error('Failed to extract text from DOCX')
  }
}

/**
 * Extract text from DOC file
 * Note: DOC files are more complex. For production, consider using LibreOffice or Pandoc
 * For now, we'll attempt basic extraction or mark as requiring manual review
 */
export async function extractDocText(buffer: Buffer): Promise<string> {
  try {
    // DOC files are binary and harder to parse without external tools
    // For now, return a placeholder and mark for manual review
    console.warn('DOC file extraction requires external tools - marking for manual review')
    return '[DOC file - manual review required]'
  } catch (error) {
    console.error('Error extracting DOC text:', error)
    throw new Error('Failed to extract text from DOC')
  }
}

/**
 * Extract text based on file extension
 */
export async function extractResumeText(buffer: Buffer, fileExtension: string): Promise<string> {
  const extension = fileExtension.toLowerCase()

  if (extension === '.pdf') {
    return extractPdfText(buffer)
  } else if (extension === '.docx') {
    return extractDocxText(buffer)
  } else if (extension === '.doc') {
    return extractDocText(buffer)
  }

  return ''
}

/**
 * Interface for extracted resume data
 */
export interface ExtractedResumeData {
  education: EducationEntry[]
  experience: ExperienceEntry[]
  certifications: CertificationEntry[]
  boardPositions: BoardPositionEntry[]
  rawText: string
}

export interface EducationEntry {
  school: string
  degree: string
  fieldOfStudy: string
  startDate?: string
  endDate?: string
  description?: string
}

export interface ExperienceEntry {
  title: string
  company: string
  location?: string
  startDate?: string
  endDate?: string
  description?: string
  isCurrentRole?: boolean
}

export interface CertificationEntry {
  name: string
  issuer: string
  issuedDate?: string
  expirationDate?: string
  credentialId?: string
}

export interface BoardPositionEntry {
  organization: string
  position: string
  startDate?: string
  endDate?: string
  description?: string
}

/**
 * Parse extracted resume text to identify structured data
 * This is a basic implementation. For production, consider using Claude API or advanced NLP
 */
export function parseResumeText(text: string): ExtractedResumeData {
  const data: ExtractedResumeData = {
    education: [],
    experience: [],
    certifications: [],
    boardPositions: [],
    rawText: text,
  }

  // Basic keyword matching for education
  const educationKeywords = ['education', 'academic', 'degree', 'university', 'college', 'school']
  const certKeywords = ['certification', 'certified', 'license', 'licensed', 'credential']
  const boardKeywords = ['board', 'director', 'trustee', 'advisory', 'chairman', 'vice president']
  const experienceKeywords = ['experience', 'employment', 'professional', 'work history']

  // Simple section detection
  const lines = text.split('\n').filter((line) => line.trim().length > 0)

  let currentSection = ''

  for (const line of lines) {
    const lowerLine = line.toLowerCase()

    // Detect sections
    if (educationKeywords.some((kw) => lowerLine.includes(kw))) {
      currentSection = 'education'
    } else if (certKeywords.some((kw) => lowerLine.includes(kw))) {
      currentSection = 'certifications'
    } else if (boardKeywords.some((kw) => lowerLine.includes(kw))) {
      currentSection = 'boardPositions'
    } else if (experienceKeywords.some((kw) => lowerLine.includes(kw))) {
      currentSection = 'experience'
    }

    // Extract data based on current section (simplified)
    // This is a basic implementation - production systems should use ML/Claude
    if (currentSection === 'education' && line.trim().length > 5) {
      // Look for patterns like "School Name - Degree"
      if (line.includes('-') || line.includes('|')) {
        const parts = line.split(/[-|]/).map((p) => p.trim())
        if (parts.length >= 2) {
          data.education.push({
            school: parts[0],
            degree: parts[1],
            fieldOfStudy: '',
          })
        }
      }
    }
  }

  return data
}

/**
 * Validate extracted resume data quality
 */
export function validateResumeData(data: ExtractedResumeData): {
  isValid: boolean
  confidence: number
  issues: string[]
} {
  const issues: string[] = []

  // Check if we have minimum data
  if (!data.rawText || data.rawText.length < 100) {
    issues.push('Extracted text is too short or empty')
  }

  if (data.education.length === 0) {
    issues.push('No education information detected')
  }

  if (data.experience.length === 0) {
    issues.push('No work experience detected')
  }

  // Calculate confidence score based on extracted data
  let confidence = 0.5 // Start at 50% for file successfully extracted

  if (data.education.length > 0) confidence += 0.15
  if (data.experience.length > 0) confidence += 0.15
  if (data.certifications.length > 0) confidence += 0.1
  if (data.boardPositions.length > 0) confidence += 0.1

  return {
    isValid: issues.length <= 2, // Allow some missing fields
    confidence: Math.min(confidence, 1),
    issues,
  }
}
