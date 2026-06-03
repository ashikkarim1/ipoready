import { getServerSession } from 'next-auth'
import { query } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { getExchangeConfig, ExchangeCode } from '@/lib/exchange-config'

/**
 * POST /api/documents/relationships/initialize
 * Initialize document relationships for a company based on exchange requirements
 * Body: { companyId, exchange }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { companyId, exchange } = body

    if (!companyId || !exchange) {
      return NextResponse.json(
        { error: 'companyId and exchange are required' },
        { status: 400 }
      )
    }

    // Verify user has access to this company
    const accessCheck = await query(
      `SELECT id FROM companies WHERE id = $1 AND user_id = (SELECT id FROM users WHERE email = $2)`,
      [companyId, session.user.email]
    )

    if (accessCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Company not found or access denied' },
        { status: 403 }
      )
    }

    const exchangeConfig = getExchangeConfig(exchange as ExchangeCode)

    // Define document requirements by exchange
    const documentRequirements = [
      {
        code: 'prospectus',
        required: true,
        allExchanges: true,
      },
      {
        code: 'financing_agreement',
        required: true,
        allExchanges: true,
      },
      {
        code: 'employment_contract',
        required: true,
        allExchanges: true,
      },
      {
        code: 'ip_assignment',
        required: true,
        allExchanges: true,
      },
      {
        code: 'board_minutes',
        required: true,
        allExchanges: true,
      },
      {
        code: 'auditor_report',
        required: exchangeConfig?.minFinancialHistory ? true : false,
        allExchanges: false,
      },
      {
        code: 'service_contract',
        required: true,
        allExchanges: true,
      },
      {
        code: 'license_agreement',
        required: false,
        allExchanges: true,
      },
      {
        code: 'shareholder_resolution',
        required: false,
        allExchanges: true,
      },
      {
        code: 'tax_compliance',
        required: true,
        allExchanges: true,
      },
      {
        code: 'insurance_policy',
        required: false,
        allExchanges: true,
      },
      {
        code: 'lease_agreement',
        required: false,
        allExchanges: true,
      },
      {
        code: 'regulatory_approval',
        required: false,
        allExchanges: true,
      },
      {
        code: 'exchange_approval',
        required: false,
        allExchanges: true,
      },
    ]

    // Get document types
    const docTypesResult = await query(
      `SELECT id, code FROM document_types WHERE code = ANY($1)`,
      [documentRequirements.map(d => d.code)]
    )

    const docTypeMap: Record<string, string> = {}
    docTypesResult.rows.forEach((row: any) => {
      docTypeMap[row.code] = row.id
    })

    // Insert relationships for each document type
    const relationships = []
    for (const docReq of documentRequirements) {
      const docTypeId = docTypeMap[docReq.code]
      if (!docTypeId) continue

      // Check if relationship already exists
      const existing = await query(
        `SELECT id FROM document_relationships 
         WHERE company_id = $1 AND target_document_type_id = $2 AND exchange = $3`,
        [companyId, docTypeId, exchange]
      )

      if (existing.rows.length === 0) {
        // Insert new relationship
        const result = await query(
          `INSERT INTO document_relationships 
           (company_id, target_document_type_id, relationship_type, is_required, exchange, status)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING *`,
          [
            companyId,
            docTypeId,
            'supports',
            docReq.required,
            exchange,
            'missing',
          ]
        )
        relationships.push(result.rows[0])
      }
    }

    return NextResponse.json({
      success: true,
      exchange,
      company_id: companyId,
      relationships_created: relationships.length,
      relationships: relationships.slice(0, 5), // Return first 5 for brevity
    })
  } catch (error) {
    console.error('Error initializing document relationships:', error)
    return NextResponse.json(
      { error: 'Failed to initialize relationships' },
      { status: 500 }
    )
  }
}