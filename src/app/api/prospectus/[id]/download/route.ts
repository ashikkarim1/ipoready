import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: prospectusId } = await params
    const searchParams = request.nextUrl.searchParams
    const format = searchParams.get('format') || 'pdf'

    // Verify prospectus exists and user has access
    const prospectusRows = await sql`
      SELECT p.id, p.completion_percentage, c.user_id
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

    if (prospectus.user_id !== session.user?.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Redirect to export endpoint to generate file
    const exportUrl = new URL(
      `/api/prospectus/${prospectusId}/export`,
      request.nextUrl.origin
    )

    const response = await fetch(exportUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: request.headers.get('cookie') || '',
      },
      body: JSON.stringify({ format }),
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to generate download' },
        { status: response.status }
      )
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream'
    const contentDisposition = response.headers.get('content-disposition') || ''
    const buffer = await response.arrayBuffer()

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': contentDisposition,
        'Content-Length': buffer.byteLength.toString(),
      },
    })
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      {
        error: 'Failed to download prospectus',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
