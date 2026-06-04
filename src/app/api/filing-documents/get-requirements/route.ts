import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface DocumentRequirement {
  id: string
  documentName: string
  category: string
  isRequired: boolean
  currentStatus: string
  uploadedAt: string | null
  estimatedPrepDays: number
  regulatoryReference: string
  templateUrl: string | null
  exampleDocumentUrl: string | null
}

interface GetRequirementsResponse {
  documents: DocumentRequirement[]
  progressPercent: number
  completedCount: number
  totalCount: number
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

    // Get all document requirements for the exchange
    const documentsWithStatus = await sql`
      SELECT
        fdt.id,
        fdt.document_name,
        fdt.category,
        fdt.is_required,
        fdt.estimated_prep_days,
        fdt.regulatory_reference,
        fdt.template_url,
        fdt.example_document_url,
        COALESCE(ufd.status, 'not_started') as current_status,
        ufd.uploaded_at
      FROM filing_document_types fdt
      LEFT JOIN user_filing_documents ufd
        ON fdt.id = ufd.document_type_id
        AND ufd.company_id = ${companyId}
      WHERE fdt.exchange_id = ${exchangeId}
      ORDER BY fdt.category, fdt.document_name
    `

    const documents: DocumentRequirement[] = documentsWithStatus.map(doc => ({
      id: doc.id,
      documentName: doc.document_name,
      category: doc.category,
      isRequired: doc.is_required,
      currentStatus: doc.current_status,
      uploadedAt: doc.uploaded_at,
      estimatedPrepDays: doc.estimated_prep_days,
      regulatoryReference: doc.regulatory_reference,
      templateUrl: doc.template_url,
      exampleDocumentUrl: doc.example_document_url,
    }))

    // Calculate progress
    const completedCount = documents.filter(
      d => d.currentStatus === 'verified' || d.currentStatus === 'uploaded'
    ).length

    const totalCount = documents.length
    const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

    return NextResponse.json({
      documents,
      progressPercent,
      completedCount,
      totalCount,
    } as GetRequirementsResponse)
  } catch (error) {
    console.error('Get requirements error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch document requirements' },
      { status: 500 }
    )
  }
}
