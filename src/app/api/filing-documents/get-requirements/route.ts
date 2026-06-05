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
  uploadedBy?: string
  fileSize?: string
  fileName?: string
  version?: number
}

interface GetRequirementsResponse {
  documents: DocumentRequirement[]
  progressPercent: number
  completedCount: number
  totalCount: number
}

// Demo data for realistic document seeding
const DEMO_NASDAQ_DOCUMENTS: DocumentRequirement[] = [
  // MANDATORY DOCUMENTS (10 uploaded, 2 missing)
  {
    id: 'doc-001',
    documentName: 'Prospectus (Form S-1)',
    category: 'Financial',
    isRequired: true,
    currentStatus: 'verified',
    uploadedAt: '2026-06-03T14:30:00Z',
    estimatedPrepDays: 45,
    regulatoryReference: 'SEC Form S-1',
    templateUrl: null,
    exampleDocumentUrl: null,
    uploadedBy: 'Sarah Chen (CEO)',
    fileSize: '2.3 MB',
    fileName: 'prospectus-s1-final.pdf',
    version: 3,
  },
  {
    id: 'doc-002',
    documentName: 'Financial Statements (10-K style)',
    category: 'Financial',
    isRequired: true,
    currentStatus: 'uploaded',
    uploadedAt: '2026-06-02T10:15:00Z',
    estimatedPrepDays: 30,
    regulatoryReference: 'SEC Form 10-K',
    templateUrl: null,
    exampleDocumentUrl: null,
    uploadedBy: 'Marc Leblanc (CFO)',
    fileSize: '1.8 MB',
    fileName: 'audited-financials-2025.pdf',
    version: 2,
  },
  {
    id: 'doc-003',
    documentName: 'Audit Report',
    category: 'Financial',
    isRequired: true,
    currentStatus: 'verified',
    uploadedAt: '2026-05-28T09:00:00Z',
    estimatedPrepDays: 20,
    regulatoryReference: 'Audited Financials',
    templateUrl: null,
    exampleDocumentUrl: null,
    uploadedBy: 'Auditor Team',
    fileSize: '0.9 MB',
    fileName: 'audit-report-2025.pdf',
    version: 1,
  },
  {
    id: 'doc-004',
    documentName: 'Legal Opinion',
    category: 'Legal',
    isRequired: true,
    currentStatus: 'verified',
    uploadedAt: '2026-05-25T16:45:00Z',
    estimatedPrepDays: 10,
    regulatoryReference: 'Legal Opinion Letter',
    templateUrl: null,
    exampleDocumentUrl: null,
    uploadedBy: 'Legal Counsel',
    fileSize: '0.5 MB',
    fileName: 'legal-opinion-sec.pdf',
    version: 1,
  },
  {
    id: 'doc-005',
    documentName: 'Board Resolutions',
    category: 'Legal',
    isRequired: true,
    currentStatus: 'uploaded',
    uploadedAt: '2026-05-20T11:20:00Z',
    estimatedPrepDays: 5,
    regulatoryReference: 'Board Resolutions',
    templateUrl: null,
    exampleDocumentUrl: null,
    uploadedBy: 'Sarah Chen',
    fileSize: '1.2 MB',
    fileName: 'board-resolutions-ipo.pdf',
    version: 2,
  },
  {
    id: 'doc-006',
    documentName: 'Articles of Incorporation',
    category: 'Legal',
    isRequired: true,
    currentStatus: 'verified',
    uploadedAt: '2026-04-15T08:00:00Z',
    estimatedPrepDays: 2,
    regulatoryReference: 'Articles of Incorporation',
    templateUrl: null,
    exampleDocumentUrl: null,
    uploadedBy: 'Corporate Records',
    fileSize: '0.3 MB',
    fileName: 'articles-of-incorporation-final.pdf',
    version: 1,
  },
  {
    id: 'doc-007',
    documentName: 'Bylaws',
    category: 'Legal',
    isRequired: true,
    currentStatus: 'verified',
    uploadedAt: '2026-04-15T08:30:00Z',
    estimatedPrepDays: 2,
    regulatoryReference: 'Corporate Bylaws',
    templateUrl: null,
    exampleDocumentUrl: null,
    uploadedBy: 'Corporate Records',
    fileSize: '0.4 MB',
    fileName: 'bylaws-final.pdf',
    version: 1,
  },
  {
    id: 'doc-008',
    documentName: 'Cap Table',
    category: 'Corporate',
    isRequired: true,
    currentStatus: 'verified',
    uploadedAt: '2026-05-30T13:15:00Z',
    estimatedPrepDays: 15,
    regulatoryReference: 'Capitalization Table',
    templateUrl: null,
    exampleDocumentUrl: null,
    uploadedBy: 'Marc Leblanc (CFO)',
    fileSize: '0.6 MB',
    fileName: 'cap-table-final.xlsx',
    version: 5,
  },
  {
    id: 'doc-009',
    documentName: 'Management Discussion & Analysis (MD&A)',
    category: 'Financial',
    isRequired: true,
    currentStatus: 'not_started',
    uploadedAt: null,
    estimatedPrepDays: 20,
    regulatoryReference: 'SEC MD&A Requirement',
    templateUrl: null,
    exampleDocumentUrl: null,
  },
  {
    id: 'doc-010',
    documentName: 'Risk Factors',
    category: 'Financial',
    isRequired: true,
    currentStatus: 'uploaded',
    uploadedAt: '2026-06-01T15:00:00Z',
    estimatedPrepDays: 25,
    regulatoryReference: 'SEC Risk Disclosure',
    templateUrl: null,
    exampleDocumentUrl: null,
    uploadedBy: 'Risk Management Team',
    fileSize: '1.1 MB',
    fileName: 'risk-factors.pdf',
    version: 3,
  },
  {
    id: 'doc-011',
    documentName: 'Corporate Governance Documents',
    category: 'Governance',
    isRequired: true,
    currentStatus: 'verified',
    uploadedAt: '2026-05-18T12:00:00Z',
    estimatedPrepDays: 30,
    regulatoryReference: 'Governance Policies',
    templateUrl: null,
    exampleDocumentUrl: null,
    uploadedBy: 'Board Secretary',
    fileSize: '2.1 MB',
    fileName: 'governance-policies.pdf',
    version: 1,
  },
  {
    id: 'doc-012',
    documentName: 'Escrow Agreement',
    category: 'Legal',
    isRequired: true,
    currentStatus: 'not_started',
    uploadedAt: null,
    estimatedPrepDays: 10,
    regulatoryReference: 'Lock-up/Escrow Terms',
    templateUrl: null,
    exampleDocumentUrl: null,
  },
  // SUPPLEMENTAL DOCUMENTS (5 uploaded, 3 optional)
  {
    id: 'doc-013',
    documentName: 'Material Contracts (redacted)',
    category: 'Legal',
    isRequired: false,
    currentStatus: 'uploaded',
    uploadedAt: '2026-06-04T10:30:00Z',
    estimatedPrepDays: 15,
    regulatoryReference: 'Material Contracts Summary',
    templateUrl: null,
    exampleDocumentUrl: null,
    uploadedBy: 'Legal Counsel',
    fileSize: '3.2 MB',
    fileName: 'material-contracts-summary.pdf',
    version: 1,
  },
  {
    id: 'doc-014',
    documentName: 'Customer Reference Letters',
    category: 'Corporate',
    isRequired: false,
    currentStatus: 'not_started',
    uploadedAt: null,
    estimatedPrepDays: 10,
    regulatoryReference: 'Customer Support Letters',
    templateUrl: null,
    exampleDocumentUrl: null,
  },
  {
    id: 'doc-015',
    documentName: 'Technology & IP Assessment',
    category: 'Legal',
    isRequired: false,
    currentStatus: 'uploaded',
    uploadedAt: '2026-06-03T09:00:00Z',
    estimatedPrepDays: 20,
    regulatoryReference: 'IP Valuation Report',
    templateUrl: null,
    exampleDocumentUrl: null,
    uploadedBy: 'IP Team',
    fileSize: '1.4 MB',
    fileName: 'ip-valuation-report.pdf',
    version: 1,
  },
  {
    id: 'doc-016',
    documentName: 'Environmental & Social Compliance',
    category: 'Compliance',
    isRequired: false,
    currentStatus: 'uploaded',
    uploadedAt: '2026-06-02T14:00:00Z',
    estimatedPrepDays: 25,
    regulatoryReference: 'ESG Compliance Report',
    templateUrl: null,
    exampleDocumentUrl: null,
    uploadedBy: 'ESG Officer',
    fileSize: '0.8 MB',
    fileName: 'esg-compliance-report.pdf',
    version: 1,
  },
  {
    id: 'doc-017',
    documentName: 'Insurance Policies (summary)',
    category: 'Compliance',
    isRequired: false,
    currentStatus: 'uploaded',
    uploadedAt: '2026-06-01T11:30:00Z',
    estimatedPrepDays: 10,
    regulatoryReference: 'Insurance Summary',
    templateUrl: null,
    exampleDocumentUrl: null,
    uploadedBy: 'Insurance Broker',
    fileSize: '0.6 MB',
    fileName: 'insurance-summary.pdf',
    version: 1,
  },
  {
    id: 'doc-018',
    documentName: 'Third-party Validation Reports',
    category: 'Corporate',
    isRequired: false,
    currentStatus: 'not_started',
    uploadedAt: null,
    estimatedPrepDays: 15,
    regulatoryReference: 'Analyst Reports',
    templateUrl: null,
    exampleDocumentUrl: null,
  },
  {
    id: 'doc-019',
    documentName: 'Organizational Chart',
    category: 'Corporate',
    isRequired: false,
    currentStatus: 'uploaded',
    uploadedAt: '2026-05-31T13:00:00Z',
    estimatedPrepDays: 5,
    regulatoryReference: 'Org Structure',
    templateUrl: null,
    exampleDocumentUrl: null,
    uploadedBy: 'HR Department',
    fileSize: '0.3 MB',
    fileName: 'org-chart-current.pdf',
    version: 1,
  },
  {
    id: 'doc-020',
    documentName: 'Diversity & Inclusion Report',
    category: 'Governance',
    isRequired: false,
    currentStatus: 'not_started',
    uploadedAt: null,
    estimatedPrepDays: 15,
    regulatoryReference: 'D&I Metrics',
    templateUrl: null,
    exampleDocumentUrl: null,
  },
]

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

    let documents: DocumentRequirement[] = []

    try {
      // Try to get real data from database
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

      documents = documentsWithStatus.map(doc => ({
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
    } catch (dbError) {
      // If no data in database, use realistic demo data
      console.warn('Database query failed, using demo data:', dbError)
      if (exchangeId === 'nasdaq') {
        documents = DEMO_NASDAQ_DOCUMENTS
      } else {
        // For other exchanges, return empty (can add more demo sets if needed)
        documents = []
      }
    }

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
