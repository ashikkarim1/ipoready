import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

// ============================================================================
// GET /api/compliance/resolutions - Fetch resolutions
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = 'SELECT * FROM board_resolutions WHERE 1=1'
    const params: (string | number)[] = []

    if (companyId) {
      query += ` AND company_id = $${params.length + 1}`
      params.push(companyId)
    }

    if (status) {
      query += ` AND status = $${params.length + 1}`
      params.push(status)
    }

    if (type) {
      query += ` AND resolution_type = $${params.length + 1}`
      params.push(type)
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, offset)

    const result = await sql(query, params as any[])

    // Get total count
    let countQuery = 'SELECT COUNT(*) as count FROM board_resolutions WHERE 1=1'
    const countParams: (string | number)[] = []

    if (companyId) {
      countQuery += ` AND company_id = $${countParams.length + 1}`
      countParams.push(companyId)
    }

    if (status) {
      countQuery += ` AND status = $${countParams.length + 1}`
      countParams.push(status)
    }

    if (type) {
      countQuery += ` AND resolution_type = $${countParams.length + 1}`
      countParams.push(type)
    }

    const countResult = await sql(countQuery, countParams as any[])
    const total = countResult.rows[0]?.count || 0

    return NextResponse.json({
      success: true,
      resolutions: result.rows,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  } catch (error) {
    console.error('Error fetching resolutions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch resolutions' },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST /api/compliance/resolutions - Create new resolution
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      companyId,
      userId,
      resolutionType,
      companyName,
      approvalDate,
      boardMembers,
      title,
      description,
      effectiveDate,
      htmlContent,
    } = body

    // Validation
    if (
      !companyId ||
      !userId ||
      !resolutionType ||
      !companyName ||
      !approvalDate ||
      !Array.isArray(boardMembers) ||
      boardMembers.length === 0
    ) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate resolution type
    const validTypes = [
      'stock_split',
      'board_appointment',
      'option_pool',
      'warrant_cancellation',
      'prospectus_approval',
      'listing_approval',
      'underwriting_authorization',
      'material_contracts',
      'series_issuance',
      'preferred_conversion',
    ]

    if (!validTypes.includes(resolutionType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid resolution type' },
        { status: 400 }
      )
    }

    // Create resolution
    const result = await sql`
      INSERT INTO board_resolutions (
        company_id,
        user_id,
        resolution_type,
        company_name,
        approval_date,
        board_members,
        html_content,
        document_title,
        status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, 'draft'
      )
      RETURNING id, created_at, status
    `(
      companyId,
      userId,
      resolutionType,
      companyName,
      approvalDate,
      boardMembers,
      htmlContent || `<h2>${title}</h2><p>${description}</p>`,
      title
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Failed to create resolution' },
        { status: 500 }
      )
    }

    const resolutionId = result.rows[0].id

    // Create approval tracking records
    for (const boardMember of boardMembers) {
      await sql`
        INSERT INTO resolution_approvals (resolution_id, board_member_name, approval_status)
        VALUES ($1, $2, 'pending')
      `(resolutionId, boardMember)
    }

    return NextResponse.json(
      {
        success: true,
        resolution: {
          id: resolutionId,
          resolutionType,
          title,
          status: 'draft',
          createdAt: result.rows[0].created_at,
          approvalCount: 0,
          totalBoardMembers: boardMembers.length,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating resolution:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create resolution' },
      { status: 500 }
    )
  }
}
