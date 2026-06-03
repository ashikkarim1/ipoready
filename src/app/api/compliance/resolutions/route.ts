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

    let result
    
    // Build query based on filters
    if (companyId && status && type) {
      result = await sql`
        SELECT * FROM board_resolutions 
        WHERE company_id = ${companyId} AND status = ${status} AND resolution_type = ${type}
        ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}
      `
    } else if (companyId && status) {
      result = await sql`
        SELECT * FROM board_resolutions 
        WHERE company_id = ${companyId} AND status = ${status}
        ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}
      `
    } else if (companyId && type) {
      result = await sql`
        SELECT * FROM board_resolutions 
        WHERE company_id = ${companyId} AND resolution_type = ${type}
        ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}
      `
    } else if (status && type) {
      result = await sql`
        SELECT * FROM board_resolutions 
        WHERE status = ${status} AND resolution_type = ${type}
        ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}
      `
    } else if (companyId) {
      result = await sql`
        SELECT * FROM board_resolutions 
        WHERE company_id = ${companyId}
        ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}
      `
    } else if (status) {
      result = await sql`
        SELECT * FROM board_resolutions 
        WHERE status = ${status}
        ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}
      `
    } else if (type) {
      result = await sql`
        SELECT * FROM board_resolutions 
        WHERE resolution_type = ${type}
        ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}
      `
    } else {
      result = await sql`
        SELECT * FROM board_resolutions 
        ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}
      `
    }

    // Get total count
    let countResult
    if (companyId && status && type) {
      countResult = await sql`
        SELECT COUNT(*) as count FROM board_resolutions 
        WHERE company_id = ${companyId} AND status = ${status} AND resolution_type = ${type}
      `
    } else if (companyId && status) {
      countResult = await sql`
        SELECT COUNT(*) as count FROM board_resolutions 
        WHERE company_id = ${companyId} AND status = ${status}
      `
    } else if (companyId && type) {
      countResult = await sql`
        SELECT COUNT(*) as count FROM board_resolutions 
        WHERE company_id = ${companyId} AND resolution_type = ${type}
      `
    } else if (status && type) {
      countResult = await sql`
        SELECT COUNT(*) as count FROM board_resolutions 
        WHERE status = ${status} AND resolution_type = ${type}
      `
    } else if (companyId) {
      countResult = await sql`
        SELECT COUNT(*) as count FROM board_resolutions 
        WHERE company_id = ${companyId}
      `
    } else if (status) {
      countResult = await sql`
        SELECT COUNT(*) as count FROM board_resolutions 
        WHERE status = ${status}
      `
    } else if (type) {
      countResult = await sql`
        SELECT COUNT(*) as count FROM board_resolutions 
        WHERE resolution_type = ${type}
      `
    } else {
      countResult = await sql`
        SELECT COUNT(*) as count FROM board_resolutions
      `
    }
    
    const total = countResult[0]?.count || 0

    return NextResponse.json({
      success: true,
      resolutions: result,
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
        ${companyId},
        ${userId},
        ${resolutionType},
        ${companyName},
        ${approvalDate},
        ${JSON.stringify(boardMembers)},
        ${htmlContent || `<h2>${title}</h2><p>${description}</p>`},
        ${title},
        'draft'
      )
      RETURNING id, created_at, status
    `

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Failed to create resolution' },
        { status: 500 }
      )
    }

    const resolutionId = result[0].id

    // Create approval tracking records
    for (const boardMember of boardMembers) {
      await sql`
        INSERT INTO resolution_approvals (resolution_id, board_member_name, approval_status)
        VALUES (${resolutionId}, ${boardMember}, 'pending')
      `
    }

    return NextResponse.json(
      {
        success: true,
        resolution: {
          id: resolutionId,
          resolutionType,
          title,
          status: 'draft',
          createdAt: result[0].created_at,
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
