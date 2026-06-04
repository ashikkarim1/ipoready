import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface CategoryProgress {
  [category: string]: number
}

interface ProgressResponse {
  overall: number
  byCategory: CategoryProgress
  completedCount: number
  totalCount: number
  error?: string
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as { id?: string; companyId?: string } | undefined

    if (!session || !user?.companyId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const companyId = user.companyId
    const exchangeId = request.nextUrl.searchParams.get('exchange_id')

    if (!exchangeId) {
      return NextResponse.json(
        { error: 'exchange_id query parameter required' },
        { status: 400 }
      )
    }

    // Get progress by category
    const progressData = await sql`
      SELECT
        fdt.category,
        COUNT(*) as total_documents,
        COUNT(CASE WHEN ufd.status IN ('verified', 'uploaded') THEN 1 END) as completed_documents
      FROM filing_document_types fdt
      LEFT JOIN user_filing_documents ufd
        ON fdt.id = ufd.document_type_id
        AND ufd.company_id = ${companyId}
      WHERE fdt.exchange_id = ${exchangeId}
      GROUP BY fdt.category
    `

    // Get overall progress
    const overallData = await sql`
      SELECT
        COUNT(*) as total_documents,
        COUNT(CASE WHEN ufd.status IN ('verified', 'uploaded') THEN 1 END) as completed_documents
      FROM filing_document_types fdt
      LEFT JOIN user_filing_documents ufd
        ON fdt.id = ufd.document_type_id
        AND ufd.company_id = ${companyId}
      WHERE fdt.exchange_id = ${exchangeId}
    `

    const byCategory: CategoryProgress = {}
    let totalCompleted = 0
    let totalDocuments = 0

    for (const row of progressData) {
      const percentage = row.total_documents > 0
        ? Math.round((row.completed_documents / row.total_documents) * 100)
        : 0
      byCategory[row.category] = percentage
    }

    if (overallData && overallData.length > 0) {
      const overall = overallData[0]
      totalCompleted = overall.completed_documents
      totalDocuments = overall.total_documents
    }

    const overallPercent = totalDocuments > 0
      ? Math.round((totalCompleted / totalDocuments) * 100)
      : 0

    return NextResponse.json({
      overall: overallPercent,
      byCategory,
      completedCount: totalCompleted,
      totalCount: totalDocuments,
    } as ProgressResponse)
  } catch (error) {
    console.error('Get progress error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch progress', overall: 0, byCategory: {}, completedCount: 0, totalCount: 0 },
      { status: 500 }
    )
  }
}
