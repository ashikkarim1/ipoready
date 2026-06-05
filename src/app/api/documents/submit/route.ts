import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { companyId, documentIds, notes } = await request.json()

    if (!companyId || !documentIds || documentIds.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // TODO: Validate all documents are submitted
    // TODO: Calculate completion percentage
    // TODO: Save submission to document_submissions table
    // TODO: Send notification to team

    return NextResponse.json({
      success: true,
      submissionId: `sub-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      submittedBy: session.user.id,
      documentCount: documentIds.length,
      status: 'submitted',
    })
  } catch (error) {
    console.error('Submission error:', error)
    return NextResponse.json(
      { error: 'Submission failed' },
      { status: 500 }
    )
  }
}

// GET endpoint for submission history
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const companyId = request.nextUrl.searchParams.get('companyId')
    if (!companyId) {
      return NextResponse.json(
        { error: 'companyId required' },
        { status: 400 }
      )
    }

    // TODO: Fetch from document_submissions table
    // ORDER BY submitted_at DESC

    return NextResponse.json({
      submissions: [
        {
          id: 'sub-001',
          submittedAt: new Date().toISOString(),
          completionPercentage: 95,
          status: 'submitted',
          documentCount: 9,
        },
      ],
    })
  } catch (error) {
    console.error('Fetch submissions error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    )
  }
}
