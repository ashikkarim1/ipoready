import { getServerSession } from 'next-auth'
import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/documents/relationships
 * Fetch document relationships and graph data for a company
 * Query params: companyId, exchange (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')
    const exchange = searchParams.get('exchange')

    if (!companyId) {
      return NextResponse.json(
        { error: 'companyId is required' },
        { status: 400 }
      )
    }

    // Verify user has access to this company
    const accessCheck = await sql`
      SELECT id FROM companies WHERE id = ${companyId} AND user_id = (SELECT id FROM users WHERE email = ${session.user.email})
    ` as any[]

    if (accessCheck.length === 0) {
      return NextResponse.json(
        { error: 'Company not found or access denied' },
        { status: 403 }
      )
    }

    // Fetch document relationships with enhanced data including descriptions
    const relResult = await sql`
      SELECT 
        dr.id,
        dr.source_document_id,
        dr.target_document_type_id,
        dt.code as document_type_code,
        dt.display_name as document_type_name,
        dt.description as document_type_description,
        dt.icon_name,
        dt.category,
        dr.relationship_type,
        dr.is_required,
        dr.exchange,
        dr.filing_category,
        dr.status,
        dr.uploaded_at,
        dr.submitted_at,
        dr.approved_at,
        dr.notes,
        dr.metadata,
        dr.sort_order
      FROM document_relationships dr
      JOIN document_types dt ON dr.target_document_type_id = dt.id
      WHERE dr.company_id = ${companyId}
      AND (dr.exchange IS NULL OR dr.exchange = ${exchange} OR ${exchange} IS NULL)
      ORDER BY 
        CASE WHEN dr.is_required THEN 0 ELSE 1 END,
        CASE WHEN dr.status = 'submitted' THEN 0 ELSE 1 END,
        dt.display_name ASC
    ` as any[]

    // Fetch graph nodes if they exist
    const nodesResult = await sql`
      SELECT 
        dgn.id,
        dgn.document_type_id,
        dt.code as document_type_code,
        dt.display_name,
        dt.icon_name,
        dgn.label,
        dgn.description,
        dgn.color_code,
        dgn.position_x,
        dgn.position_y
      FROM document_graph_nodes dgn
      JOIN document_types dt ON dgn.document_type_id = dt.id
      WHERE dgn.company_id = ${companyId}
      ORDER BY dt.display_name ASC
    ` as any[]

    // Fetch graph edges if they exist
    const edgesResult = await sql`
      SELECT 
        dge.id,
        dge.source_node_id,
        dge.target_node_id,
        dge.relationship_label,
        dge.edge_type,
        dge.weight
      FROM document_graph_edges dge
      WHERE dge.company_id = ${companyId}
    ` as any[]

    return NextResponse.json({
      relationships: relResult,
      nodes: nodesResult,
      edges: edgesResult,
      company_id: companyId,
      exchange: exchange || null,
      summary: {
        total: relResult.length,
        required: relResult.filter(r => r.is_required).length,
        submitted: relResult.filter(r => r.status === 'submitted').length,
        missing: relResult.filter(r => r.is_required && r.status !== 'submitted').length,
        recommended: relResult.filter(r => !r.is_required).length,
      }
    })
  } catch (error) {
    console.error('Error fetching document relationships:', error)
    return NextResponse.json(
      { error: 'Failed to fetch document relationships' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/documents/relationships
 * Create or update a document relationship
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      companyId,
      targetDocumentTypeId,
      relationshipType = 'supports',
      isRequired = false,
      exchange,
      filingCategory,
      status = 'missing',
      notes,
    } = body

    // Verify user has access to this company
    const accessCheck = await sql`
      SELECT id FROM companies WHERE id = ${companyId} AND user_id = (SELECT id FROM users WHERE email = ${session.user.email})
    ` as any[]

    if (accessCheck.length === 0) {
      return NextResponse.json(
        { error: 'Company not found or access denied' },
        { status: 403 }
      )
    }

    // Check if relationship already exists
    const existing = await sql`
      SELECT id FROM document_relationships 
      WHERE company_id = ${companyId}
      AND target_document_type_id = ${targetDocumentTypeId}
      AND COALESCE(exchange, '') = COALESCE(${exchange}, '')
    ` as any[]

    if (existing.length > 0) {
      // Update existing relationship
      const updateResult = await sql`
        UPDATE document_relationships
        SET relationship_type = ${relationshipType}, is_required = ${isRequired}, filing_category = ${filingCategory}, 
            status = ${status}, notes = ${notes}, updated_at = NOW()
        WHERE id = ${existing[0].id}
        RETURNING *
      ` as any[]

      return NextResponse.json(updateResult[0])
    } else {
      // Create new relationship
      const insertResult = await sql`
        INSERT INTO document_relationships 
        (company_id, target_document_type_id, relationship_type, is_required, 
         exchange, filing_category, status, notes)
        VALUES (${companyId}, ${targetDocumentTypeId}, ${relationshipType}, ${isRequired},
                ${exchange || null}, ${filingCategory || null}, ${status}, ${notes || null})
        RETURNING *
      ` as any[]

      return NextResponse.json(insertResult[0], { status: 201 })
    }
  } catch (error) {
    console.error('Error creating/updating document relationship:', error)
    return NextResponse.json(
      { error: 'Failed to create/update relationship' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/documents/relationships/:id
 * Update a document relationship status (e.g., mark as submitted)
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { relationshipId, status, uploadedAt, submittedAt, approvedAt, rejectionReason } = body

    // Verify relationship exists and user has access
    const check = await sql`
      SELECT dr.id FROM document_relationships dr
      JOIN companies c ON dr.company_id = c.id
      WHERE dr.id = ${relationshipId} AND c.user_id = (SELECT id FROM users WHERE email = ${session.user.email})
    ` as any[]

    if (check.length === 0) {
      return NextResponse.json(
        { error: 'Relationship not found or access denied' },
        { status: 403 }
      )
    }

    const updateResult = await sql`
      UPDATE document_relationships
      SET status = COALESCE(${status || null}, status),
          uploaded_at = COALESCE(${uploadedAt || null}, uploaded_at),
          submitted_at = COALESCE(${submittedAt || null}, submitted_at),
          approved_at = COALESCE(${approvedAt || null}, approved_at),
          rejection_reason = ${rejectionReason || null},
          updated_at = NOW()
      WHERE id = ${relationshipId}
      RETURNING *
    ` as any[]

    return NextResponse.json(updateResult[0])
  } catch (error) {
    console.error('Error updating document relationship:', error)
    return NextResponse.json(
      { error: 'Failed to update relationship' },
      { status: 500 }
    )
  }
}