/**
 * Resume Upload API Endpoint
 * POST /api/directors-officers/[directorId]/upload-resume
 *
 * Accepts multipart file upload (PDF, DOCX, DOC)
 * Max 10MB file size
 * Stores in /public/resumes/[directorId]-[timestamp].[ext]
 * Saves metadata to director_resumes table
 * Returns: { success: true, fileUrl, resumeId, extractedData? }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import {
  validateResumeFile,
  generateFileHash,
  generateResumePath,
  extractResumeText,
  parseResumeText,
  validateResumeData,
} from '@/lib/resume-utils'
import { writeFileSync, mkdirSync } from 'fs'
import path from 'path'

const RESUMES_DIR = path.join(process.cwd(), 'public', 'resumes')

/**
 * Ensure resumes directory exists
 */
function ensureResumesDir() {
  try {
    mkdirSync(RESUMES_DIR, { recursive: true })
  } catch (error) {
    console.error('Error creating resumes directory:', error)
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { directorId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { directorId } = params

    if (!directorId) {
      return NextResponse.json({ error: 'Missing director ID' }, { status: 400 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file
    const validation = validateResumeFile(file)
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid file', details: validation.error },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    const fileHash = generateFileHash(buffer)
    const fileExtension = path.extname(file.name).toLowerCase()
    const timestamp = Date.now()

    // Ensure directory exists
    ensureResumesDir()

    // Generate file path
    const fileName = `${directorId}-${timestamp}${fileExtension}`
    const filePath = path.join(RESUMES_DIR, fileName)
    const fileUrl = `/resumes/${fileName}`

    // Write file to disk
    writeFileSync(filePath, buffer)

    // Extract text from resume
    let extractedText = ''
    let extractedData = null
    let extractionSuccess = false
    let pageCount = null

    try {
      extractedText = await extractResumeText(buffer, fileExtension)
      extractedData = parseResumeText(extractedText)
      const validation = validateResumeData(extractedData)
      extractionSuccess = validation.isValid

      // Try to get page count for PDFs
      if (fileExtension === '.pdf') {
        try {
          const pdfParse = require('pdf-parse')
          const pdfData = await pdfParse(buffer)
          pageCount = pdfData.numpages || pdfData.numPages || 1
        } catch {
          pageCount = 1
        }
      }
    } catch (error) {
      console.error('Error extracting resume text:', error)
      extractionSuccess = false
    }

    // Insert resume metadata into database
    const result = await sql`
      INSERT INTO director_resumes (
        professional_id,
        file_path,
        file_url,
        file_name,
        file_size,
        file_mime_type,
        file_hash,
        version,
        is_current,
        uploaded_by_user_id,
        verification_status,
        is_readable,
        text_extract,
        page_count
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        1,
        true,
        $8,
        $9,
        $10,
        $11,
        $12
      )
      RETURNING id, version, uploaded_at
    `

    const [resumeRecord] = result as any[]

    if (!resumeRecord) {
      return NextResponse.json(
        { error: 'Failed to save resume metadata' },
        { status: 500 }
      )
    }

    // Return success response
    return NextResponse.json({
      success: true,
      resumeId: resumeRecord.id,
      fileUrl,
      fileName: file.name,
      fileSize: file.size,
      version: resumeRecord.version,
      uploadedAt: resumeRecord.uploaded_at,
      extraction: {
        success: extractionSuccess,
        textLength: extractedText.length,
        pageCount: pageCount,
        data: extractedData,
      },
    })
  } catch (error) {
    console.error('Resume upload error:', error)
    return NextResponse.json(
      {
        error: 'Failed to upload resume',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
