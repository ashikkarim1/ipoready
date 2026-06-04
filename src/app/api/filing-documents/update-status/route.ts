import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface UpdateStatusRequest {
  documentId: string
  status: 'not_started' | 'in_progress' | 'ready' | 'uploaded' | 'verified'
  notes?: string
}

interface UpdateStatusResponse {
  success: boolean
  documentId?: string
  status?: string
  updatedAt?: string
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as { id?: string; companyId?: string } | undefined

    if (!session || !user?.companyId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: UpdateStatusRequest = await request.json()
    const { documentId, status, notes } = body
    const userId = user.id
    const companyId = user.companyId

    // Validate status
    const validStatuses = ['not_started', 'in_progress', 'ready', 'uploaded', 'verified']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Verify document belongs to this company
    const docCheck = await sql`
      SELECT id FROM user_filing_documents
      WHERE id = ${documentId} AND company_id = ${companyId}
    `

    if (!docCheck || docCheck.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Document not found' },
        { status: 404 }
      )
    }

    // Update document status
    const updateQuery = notes
      ? `UPDATE user_filing_documents
         SET status = $1, notes = $2, ${status === 'verified' ? 'verified_at = NOW(), verified_by = $3,' : ''} updated_at = NOW()
         WHERE id = $4
         RETURNING id, status, updated_at`
      : `UPDATE user_filing_documents
         SET status = $1, ${status === 'verified' ? 'verified_at = NOW(), verified_by = $2,' : ''} updated_at = NOW()
         WHERE id = ${status === 'verified' ? '$3' : '$2'}
         RETURNING id, status, updated_at`

    let result
    if (status === 'verified') {
      if (notes) {
        result = await sql`
          UPDATE user_filing_documents
          SET status = ${status}, notes = ${notes}, verified_at = NOW(), verified_by = ${userId}, updated_at = NOW()
          WHERE id = ${documentId}
          RETURNING id, status, updated_at
        `
      } else {
        result = await sql`
          UPDATE user_filing_documents
          SET status = ${status}, verified_at = NOW(), verified_by = ${userId}, updated_at = NOW()
          WHERE id = ${documentId}
          RETURNING id, status, updated_at
        `
      }
    } else {
      if (notes) {
        result = await sql`
          UPDATE user_filing_documents
          SET status = ${status}, notes = ${notes}, updated_at = NOW()
          WHERE id = ${documentId}
          RETURNING id, status, updated_at
        `
      } else {
        result = await sql`
          UPDATE user_filing_documents
          SET status = ${status}, updated_at = NOW()
          WHERE id = ${documentId}
          RETURNING id, status, updated_at
        `
      }
    }

    if (!result || result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Failed to update status' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      documentId: result[0].id,
      status: result[0].status,
      updatedAt: result[0].updated_at,
    } as UpdateStatusResponse)
  } catch (error) {
    console.error('Update status error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update document status' },
      { status: 500 }
    )
  }
}
