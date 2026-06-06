import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import { generatePDF, generateDOCX, generateZIPFile } from '@/lib/prospectus-generator'
import { userCanAccessFeature } from '@/lib/feature-gates'

export const dynamic = 'force-dynamic'
type ExportFormat = 'pdf' | 'docx' | 'zip'

interface ExportRequest {
  format: ExportFormat
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: prospectusId } = await params
    const body = (await request.json()) as ExportRequest
    const { format = 'pdf' } = body

    // Validate format
    if (!['pdf', 'docx', 'zip'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid export format. Use: pdf, docx, or zip' },
        { status: 400 }
      )
    }

    // Fetch prospectus with all sections
    const prospectusRows = await sql`
      SELECT p.id, p.company_id, p.exchange, p.form_type, p.status, 
             p.completion_percentage, p.created_at, p.metadata,
             c.id as company_id, c.user_id
      FROM prospectuses p
      JOIN companies c ON p.company_id = c.id
      WHERE p.id = ${prospectusId}
    ` as any[]

    if (prospectusRows.length === 0) {
      return NextResponse.json(
        { error: 'Prospectus not found' },
        { status: 404 }
      )
    }

    const prospectus = prospectusRows[0]

    // Verify authorization
    if (prospectus.user_id !== session.user?.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Check feature access
    const hasAccess = await userCanAccessFeature(
      session.user.id,
      'prospectus_builder'
    )
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Feature not available in your plan. Upgrade to access Prospectus Builder.' },
        { status: 403 }
      )
    }

    // Fetch prospectus sections
    const sectionsRows = await sql`
      SELECT id, section_name, section_number, content, status
      FROM prospectus_sections
      WHERE prospectus_id = ${prospectusId}
      ORDER BY section_number ASC
    ` as any[]

    // Prepare section data for export
    const sectionsData = sectionsRows.map((section) => ({
      title: section.section_name,
      content: section.content || '',
      number: section.section_number,
      status: section.status,
    }))

    const metadata = {
      companyName: (prospectus.metadata?.companyName) || 'Prospectus',
      exchange: prospectus.exchange || 'NASDAQ',
      formType: prospectus.form_type || 'S-1',
      createdAt: prospectus.created_at?.toISOString?.() || new Date().toISOString(),
      completionPercentage: prospectus.completion_percentage || 0,
    }

    let fileBuffer: Buffer
    let filename: string
    let mimeType: string

    // Generate file based on format
    switch (format) {
      case 'pdf':
        fileBuffer = await generatePDF(sectionsData, metadata)
        filename = `${metadata.companyName}_Prospectus.pdf`
        mimeType = 'application/pdf'
        break

      case 'docx':
        fileBuffer = await generateDOCX(sectionsData, metadata)
        filename = `${metadata.companyName}_Prospectus.docx`
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        break

      case 'zip':
        fileBuffer = await generateZIPFile(sectionsData, metadata)
        filename = `${metadata.companyName}_Prospectus.zip`
        mimeType = 'application/zip'
        break

      default:
        return NextResponse.json(
          { error: 'Unsupported format' },
          { status: 400 }
        )
    }

    // Return file as response
    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      {
        error: 'Failed to export prospectus',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
