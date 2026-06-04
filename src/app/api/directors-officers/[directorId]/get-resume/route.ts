/**
 * Get Resume API Endpoint
 * GET /api/directors-officers/[directorId]/get-resume
 *
 * Retrieve resume file for director
 * Optional query params:
 *   - resumeId: specific resume ID to retrieve
 *   - current: boolean, get current resume (default: true)
 *   - version: specific version to retrieve
 *
 * Returns: File stream with proper headers
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import { readFileSync } from 'fs'
import path from 'path'

const RESUMES_DIR = path.join(process.cwd(), 'public', 'resumes')

export async function GET(
  request: NextRequest,
  { params }: { params: { directorId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { directorId } = params
    const { searchParams } = new URL(request.url)
    const resumeId = searchParams.get('resumeId')
    const isCurrent = searchParams.get('current') !== 'false'
    const version = searchParams.get('version')

    if (!directorId) {
      return NextResponse.json({ error: 'Missing director ID' }, { status: 400 })
    }

    // Build query to fetch resume
    let query = `
      SELECT id, file_path, file_url, file_name, file_mime_type
      FROM director_resumes
      WHERE professional_id = $1
    `
    const queryParams: any[] = [directorId]

    if (resumeId) {
      query += ` AND id = $2`
      queryParams.push(resumeId)
    } else if (version) {
      query += ` AND version = $2`
      queryParams.push(parseInt(version))
    } else if (isCurrent) {
      query += ` AND is_current = true`
    }

    query += ` ORDER BY uploaded_at DESC LIMIT 1`

    const result = await sql(query as any, ...queryParams)
    const [resume] = result as any[]

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
    }

    // Read file from disk
    let filePath = resume.file_path

    // If file_path is relative, construct full path
    if (!filePath.startsWith('/')) {
      filePath = path.join(RESUMES_DIR, filePath)
    }

    try {
      const fileData = readFileSync(filePath)

      // Determine MIME type
      const mimeType = resume.file_mime_type || 'application/octet-stream'

      // Set response headers
      const response = new NextResponse(fileData, {
        headers: {
          'Content-Type': mimeType,
          'Content-Disposition': `inline; filename="${resume.file_name}"`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      })

      return response
    } catch (fileError) {
      console.error('Error reading resume file:', fileError)
      return NextResponse.json(
        { error: 'Failed to read resume file' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Get resume error:', error)
    return NextResponse.json(
      {
        error: 'Failed to retrieve resume',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
