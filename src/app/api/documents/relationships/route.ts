import { getServerSession } from 'next-auth'
import { query } from '@/lib/db'
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

    // Fetch document relationships with enhanced data including descriptions
    let relationshipQuery = `
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
      WHERE dr.company_id = $1
      AND (dr.exchange IS NULL OR dr.exchange = $2 OR $2 IS NULL)
      ORDER BY 
        CASE WHEN dr.is_required THEN 0 ELSE 1 END,
        CASE WHEN dr.status = 'submitted' THEN 0 ELSE 1 END,
        dt.display_name ASC
    `

    const relResult = await query(relationshipQuery, [companyId, exchange || null])

    // Fetch graph nodes if they exist
    const nodesResult = await query(
      `
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
      WHERE dgn.company_id = $1
      ORDER BY dt.display_name ASC
      `,
      [companyId]
    )

    // Fetch graph edges if they exist
    const edgesResult = await query(
      `
      SELECT 
        dge.id,
        dge.source_node_id,
        dge.target_node_id,
        dge.relationship_label,
        dge.edge_type,
        dge.weight
      FROM document_graph_edges dge
      WHERE dge.company_id = $1
      `,
      [companyId]
    )

    return NextResponse.json({
      relationships: relResult.rows,
      nodes: nodesResult.rows,
      edges: edgesResult.rows,
      company_id: companyId,
      exchange: exchange || null,
      summary: {
        total: relResult.rows.length,
        required: relResult.rows.filter(r => r.is_required).length,
        submitted: relResult.rows.filter(r => r.status === 'submitted').length,
        missing: relResult.rows.filter(r => r.is_required && r.status !== 'submitted').length,
        recommended: relResult.rows.filter(r => !r.is_required).length,
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

    // Check if relationship already exists
    const existingQuery = `
      SELECT id FROM document_relationships 
      WHERE company_id = $1 
      AND target_document_type_id = $2
      AND COALESCE(exchange, '') = COALESCE($3, '')
    `
    const existing = await query(existingQuery, [
      companyId,
      targetDocumentTypeId,
      exchange || null,
    ])

    if (existing.rows.length > 0) {
      // Update existing relationship
      const updateResult = await query(
        `
        UPDATE document_relationships
        SET relationship_type = $1, is_required = $2, filing_category = $3, 
            status = $4, notes = $5, updated_at = NOW()
        WHERE id = $6
        RETURNING *
        `,
        [relationshipType, isRequired, filingCategory, status, notes, existing.rows[0].id]
      )

      return NextResponse.json(updateResult.rows[0])
    } else {
      // Create new relationship
      const insertResult = await query(
        `
        INSERT INTO document_relationships 
        (company_id, target_document_type_id, relationship_type, is_required, 
         exchange, filing_category, status, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
        `,
        [
          companyId,
          targetDocumentTypeId,
          relationshipType,
          isRequired,
          exchange || null,
          filingCategory || null,
          status,
          notes || null,
        ]
      )

      return NextResponse.json(insertResult.rows[0], { status: 201 })
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
    const checkQuery = `
      SELECT dr.id FROM document_relationships dr
      JOIN companies c ON dr.company_id = c.id
      WHERE dr.id = $1 AND c.user_id = (SELECT id FROM users WHERE email = $2)
    `
    const check = await query(checkQuery, [relationshipId, session.user.email])

    if (check.rows.length === 0) {
      return NextResponse.json(
        { error: 'Relationship not found or access denied' },
        { status: 403 }
      )
    }

    const updateResult = await query(
      `
      UPDATE document_relationships
      SET status = COALESCE($1, status),
          uploaded_at = COALESCE($2, uploaded_at),
          submitted_at = COALESCE($3, submitted_at),
          approved_at = COALESCE($4, approved_at),
          rejection_reason = $5,
          updated_at = NOW()
      WHERE id = $6
      RETURNING *
      `,
      [status || null, uploadedAt || null, submittedAt || null, approvedAt || null, rejectionReason || null, relationshipId]
    )

    return NextResponse.json(updateResult.rows[0])
  } catch (error) {
    console.error('Error updating document relationship:', error)
    return NextResponse.json(
      { error: 'Failed to update relationship' },
      { status: 500 }
    )
  }
}