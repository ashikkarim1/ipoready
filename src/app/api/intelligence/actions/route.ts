import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * POST /api/intelligence/actions
 *
 * Create an action item from a news article in the briefing
 */
export async function POST(request: NextRequest) {
  try {
    const {
      userId,
      companyId,
      articleId,
      briefingSendId,
      title,
      description,
      dueDate,
      priority,
    } = await request.json()

    if (!userId || !companyId || !title) {
      return NextResponse.json(
        { error: 'userId, companyId, and title are required' },
        { status: 400 }
      )
    }

    const result = await db.query(`
      INSERT INTO briefing_action_items (
        user_id,
        company_id,
        article_id,
        briefing_send_id,
        title,
        description,
        due_date,
        priority,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'open')
      RETURNING *
    `, [
      userId,
      companyId,
      articleId || null,
      briefingSendId || null,
      title,
      description || null,
      dueDate || null,
      priority || 'medium',
    ])

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Failed to create action item' },
        { status: 500 }
      )
    }

    const item = result.rows[0]

    // If briefing send ID provided, increment action counter
    if (briefingSendId) {
      await db.query(`
        UPDATE briefing_sends
        SET actions_created_from_briefing = actions_created_from_briefing + 1
        WHERE id = $1
      `, [briefingSendId])
    }

    return NextResponse.json({
      success: true,
      actionItem: {
        id: item.id,
        title: item.title,
        description: item.description,
        dueDate: item.due_date,
        priority: item.priority,
        status: item.status,
        createdAt: item.created_at,
      },
    })
  } catch (error) {
    console.error('Create action error:', error)
    return NextResponse.json(
      { error: 'Failed to create action item' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/intelligence/actions?userId=<id>&companyId=<id>&status=<status>
 *
 * Get action items from news briefings
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const companyId = searchParams.get('companyId')
    const status = searchParams.get('status') || 'open'

    if (!userId || !companyId) {
      return NextResponse.json(
        { error: 'userId and companyId are required' },
        { status: 400 }
      )
    }

    const result = await db.query(`
      SELECT
        id,
        title,
        description,
        due_date,
        priority,
        status,
        created_at,
        completed_at,
        article_id,
        (SELECT headline FROM news_articles WHERE id = article_id) as article_headline
      FROM briefing_action_items
      WHERE user_id = $1 AND company_id = $2 AND status = $3
      ORDER BY priority DESC, due_date ASC
    `, [userId, companyId, status])

    return NextResponse.json({
      items: result.rows.map(row => ({
        id: row.id,
        title: row.title,
        description: row.description,
        dueDate: row.due_date,
        priority: row.priority,
        status: row.status,
        createdAt: row.created_at,
        completedAt: row.completed_at,
        relatedArticle: row.article_headline,
      })),
      count: result.rowCount,
    })
  } catch (error) {
    console.error('Get actions error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch action items' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/intelligence/actions/:id
 *
 * Update action item status
 */
export async function PATCH(request: NextRequest) {
  try {
    const { id, status } = await request.json()

    if (!id || !status) {
      return NextResponse.json(
        { error: 'id and status are required' },
        { status: 400 }
      )
    }

    const validStatuses = ['open', 'in_progress', 'completed']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `status must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    const completedAt = status === 'completed' ? 'NOW()' : 'NULL'
    const result = await db.query(`
      UPDATE briefing_action_items
      SET status = $1, completed_at = ${completedAt}
      WHERE id = $2
      RETURNING *
    `, [status, id])

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Action item not found' },
        { status: 404 }
      )
    }

    const item = result.rows[0]

    return NextResponse.json({
      success: true,
      actionItem: {
        id: item.id,
        status: item.status,
        completedAt: item.completed_at,
      },
    })
  } catch (error) {
    console.error('Update action error:', error)
    return NextResponse.json(
      { error: 'Failed to update action item' },
      { status: 500 }
    )
  }
}
