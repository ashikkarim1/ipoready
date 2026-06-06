/**
 * Delete Resume API Endpoint
 * DELETE /api/directors-officers/[directorId]/delete-resume
 *
 * Delete resume file and metadata
 * Query params:
 *   - resumeId: specific resume ID to delete (required)
 *
 * Returns: { success: true }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import { unlinkSync, existsSync } from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'
const RESUMES_DIR = path.join(process.cwd(), 'public', 'resumes')

export async function DELETE(
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

    if (!directorId || !resumeId) {
      return NextResponse.json(
        { error: 'Missing director ID or resume ID' },
        { status: 400 }
      )
    }

    // Fetch resume metadata
    const result = await sql`
      SELECT id, file_path, professional_id
      FROM director_resumes
      WHERE id = $1 AND professional_id = $2
    `

    const [resume] = result as any[]

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
    }

    // Delete file from disk
    if (resume.file_path) {
      let filePath = resume.file_path

      // If file_path is relative, construct full path
      if (!filePath.startsWith('/')) {
        filePath = path.join(RESUMES_DIR, filePath)
      }

      try {
        if (existsSync(filePath)) {
          unlinkSync(filePath)
        }
      } catch (fileError) {
        console.error('Error deleting resume file:', fileError)
        // Continue with database deletion even if file delete fails
      }
    }

    // Delete resume record from database
    const deleteResult = await sql`
      DELETE FROM director_resumes
      WHERE id = $1 AND professional_id = $2
      RETURNING id
    `

    if (deleteResult.length === 0) {
      return NextResponse.json(
        { error: 'Failed to delete resume from database' },
        { status: 500 }
      )
    }

    // If this was the current resume, set another as current if available
    if (resume.is_current) {
      const nextResumeResult = await sql`
        SELECT id FROM director_resumes
        WHERE professional_id = $1
        ORDER BY version DESC
        LIMIT 1
      `

      if (nextResumeResult.length > 0) {
        const [nextResume] = nextResumeResult as any[]
        await sql`
          UPDATE director_resumes
          SET is_current = true
          WHERE id = $1
        `
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Resume deleted successfully',
      resumeId,
    })
  } catch (error) {
    console.error('Delete resume error:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete resume',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
