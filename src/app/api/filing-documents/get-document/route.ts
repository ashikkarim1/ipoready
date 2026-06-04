import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import { readFile } from 'fs/promises'

export const dynamic = 'force-dynamic'

interface GetDocumentResponse {
  success: boolean
  documentUrl?: string
  fileName?: string
  contentType?: string
  uploadedAt?: string
  status?: string
  error?: string
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as { id?: string; companyId?: string } | undefined

    if (!session || !user?.companyId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const documentId = request.nextUrl.searchParams.get('document_id')
    const companyId = user.companyId

    if (!documentId) {
      return NextResponse.json(
        { success: false, error: 'document_id query parameter required' },
        { status: 400 }
      )
    }

    // Get document details
    const docResult = await sql`
      SELECT
        id,
        file_path,
        s3_url,
        status,
        uploaded_at
      FROM user_filing_documents
      WHERE id = ${documentId} AND company_id = ${companyId}
    `

    if (!docResult || docResult.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Document not found' },
        { status: 404 }
      )
    }

    const doc = docResult[0]

    // If S3 URL is stored, return that (pre-signed or public)
    if (doc.s3_url) {
      return NextResponse.json({
        success: true,
        documentUrl: doc.s3_url,
        status: doc.status,
        uploadedAt: doc.uploaded_at,
      } as GetDocumentResponse)
    }

    // If local file path is stored, read and return the file
    if (doc.file_path) {
      try {
        const fileBuffer = await readFile(doc.file_path)
        return new NextResponse(fileBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'inline',
          },
        })
      } catch (error) {
        console.error('File read error:', error)
        return NextResponse.json(
          { success: false, error: 'Failed to read document file' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      { success: false, error: 'No document file available' },
      { status: 404 }
    )
  } catch (error) {
    console.error('Get document error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch document' },
      { status: 500 }
    )
  }
}
