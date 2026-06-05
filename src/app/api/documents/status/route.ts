import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const companyId = request.nextUrl.searchParams.get('companyId')
    if (!companyId) {
      return NextResponse.json(
        { error: 'companyId required' },
        { status: 400 }
      )
    }

    // TODO: Fetch from documents table with counts
    // SELECT document_type, status, COUNT(*) as count FROM document_files
    // WHERE document_id IN (SELECT id FROM documents WHERE company_id = $1)
    // GROUP BY document_type, status

    return NextResponse.json({
      companyId,
      totalDocuments: 10,
      completedDocuments: {
        verified: 2,
        submitted: 3,
        partial: 1,
        empty: 4,
      },
      completionPercentage: 60,
      mandatoryDocuments: {
        total: 6,
        completed: 4,
        completionPercentage: 67,
      },
      recommendedDocuments: {
        total: 4,
        completed: 1,
        completionPercentage: 25,
      },
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Status fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch status' },
      { status: 500 }
    )
  }
}
