/**
 * GET /api/compliance/resolutions/[id]/download?format=docx|pdf
 * Download a resolution in DOCX or PDF format
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import { generateResolutionDocx, generateResolutionPdf, generateResolutionText } from '@/lib/resolution-generator'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as { id?: string; companyId?: string } | undefined

    if (!session || !user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const format = request.nextUrl.searchParams.get('format') || 'docx'
    if (!['docx', 'pdf'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Use "docx" or "pdf"' },
        { status: 400 }
      )
    }

    // Fetch resolution
    const result = await sql`
      SELECT * FROM board_resolutions 
      WHERE id = $1 AND company_id = $2
    `(params.id, user.companyId)

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Resolution not found' },
        { status: 404 }
      )
    }

    const resolution = result.rows[0]
    const resolutionText = getResolutionTextFromHtml(resolution.html_content)

    let buffer: Buffer
    let mimeType: string
    let filename: string

    if (format === 'docx') {
      buffer = await generateResolutionDocx(
        resolution.html_content,
        resolution.document_title,
        resolutionText
      )
      mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      filename = `${sanitizeFilename(resolution.document_title)}.docx`
    } else {
      buffer = await generateResolutionPdf(
        resolution.document_title,
        resolutionText
      )
      mimeType = 'application/pdf'
      filename = `${sanitizeFilename(resolution.document_title)}.pdf`
    }

    // Update file size in database
    await sql`
      UPDATE board_resolutions 
      SET ${format}_file_size = $1, ${format}_filename = $2
      WHERE id = $3
    `(buffer.length, filename, params.id)

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Error downloading resolution:', error)
    return NextResponse.json(
      { error: 'Failed to generate document' },
      { status: 500 }
    )
  }
}

/**
 * Extract plain text from HTML content
 */
function getResolutionTextFromHtml(htmlContent: string): string {
  // Simple HTML to text conversion
  return htmlContent
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .trim()
}

/**
 * Sanitize filename for safe file downloads
 */
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9]/gi, '_')
    .replace(/_+/g, '_')
    .toLowerCase()
    .substring(0, 100)
}
