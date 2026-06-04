import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import { unlink } from 'fs/promises'

export const dynamic = 'force-dynamic'

interface DeleteResponse {
  success: boolean
  error?: string
}

export async function DELETE(request: NextRequest) {
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
      SELECT id, file_path FROM user_filing_documents
      WHERE id = ${documentId} AND company_id = ${companyId}
    `

    if (!docResult || docResult.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Document not found' },
        { status: 404 }
      )
    }

    const doc = docResult[0]

    // Delete local file if it exists
    if (doc.file_path) {
      try {
        await unlink(doc.file_path)
      } catch (error) {
        console.error('File deletion error:', error)
        // Continue anyway - mark as deleted in DB
      }
    }

    // Update document status to not_started and clear file references
    await sql`
      UPDATE user_filing_documents
      SET
        status = 'not_started',
        file_path = NULL,
        s3_url = NULL,
        uploaded_at = NULL,
        uploaded_by = NULL,
        version_number = 1,
        updated_at = NOW()
      WHERE id = ${documentId}
    `

    return NextResponse.json({ success: true } as DeleteResponse)
  } catch (error) {
    console.error('Delete document error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete document' },
      { status: 500 }
    )
  }
}
