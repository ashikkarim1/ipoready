import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import { resend, FROM_ADDRESS } from '@/lib/resend'

export const dynamic = 'force-dynamic'

interface FeedbackRequest {
  page: string // e.g., '/dashboard', '/pace', '/tasks'
  task?: string // Optional: specific task ID or name
  rating: number // 1-5 scale
  confusionPoints?: string[] // What was confusing
  comment?: string // Additional context
}

interface CountRow {
  count: string
}

interface FeedbackRow {
  id: string
  company_id: string
  user_id: string
  page: string
  task: string | null
  rating: number
  confusion_points: string[] | null
  comment: string | null
  sentiment: string
  created_at: string
}

/**
 * Analyze sentiment from feedback comment
 */
function analyzeSentiment(rating: number, comment?: string): string {
  if (rating >= 4) {
    return 'positive'
  }
  if (rating === 3) {
    return 'neutral'
  }
  if (rating <= 2) {
    if (comment && (comment.toLowerCase().includes('confusing') || comment.toLowerCase().includes('difficult'))) {
      return 'frustrated'
    }
    return 'negative'
  }
  return 'neutral'
}

/**
 * POST /api/feedback
 * Collect feedback from pilot users
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as { id?: string; companyId?: string } | undefined

    if (!session || !user?.id || !user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await request.json()) as FeedbackRequest

    // Validate required fields
    const { page, rating, confusionPoints, comment, task } = body

    if (!page || !rating) {
      return NextResponse.json(
        { error: 'Page and rating are required' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    const sentiment = analyzeSentiment(rating, comment)

    // Store feedback in database
    const result = await sql`
      INSERT INTO feedback (
        company_id,
        user_id,
        page,
        task,
        rating,
        confusion_points,
        comment,
        sentiment,
        ip_address,
        user_agent,
        created_at
      ) VALUES (
        ${user.companyId},
        ${user.id},
        ${page},
        ${task || null},
        ${rating},
        ${confusionPoints ? JSON.stringify(confusionPoints) : null},
        ${comment || null},
        ${sentiment},
        ${request.headers.get('x-forwarded-for') || request.headers.get('cf-connecting-ip') || 'unknown'},
        ${request.headers.get('user-agent') || 'unknown'},
        NOW()
      )
      RETURNING id, created_at
    ` as Array<{ id: string; created_at: string }>

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Failed to store feedback' },
        { status: 500 }
      )
    }

    // Send email notification to CEO
    try {
      const sentimentEmoji = sentiment === 'positive' ? '😊' : sentiment === 'frustrated' ? '😤' : sentiment === 'negative' ? '😞' : '😐'
      const userEmail = user?.email || 'Unknown'
      
      await resend.emails.send({
        from: FROM_ADDRESS,
        to: 'ceo@theupcapital.com',
        subject: `IPOReady Feedback: ${sentimentEmoji} ${page} (${rating}/5)`,
        html: `
          <h2>New Feedback Received</h2>
          <p><strong>Rating:</strong> ${rating}/5</p>
          <p><strong>Page:</strong> ${page}</p>
          ${task ? `<p><strong>Task:</strong> ${task}</p>` : ''}
          <p><strong>Sentiment:</strong> ${sentiment}</p>
          ${confusionPoints && confusionPoints.length > 0 ? `
            <p><strong>Confusion Points:</strong></p>
            <ul>
              ${confusionPoints.map(p => `<li>${p}</li>`).join('')}
            </ul>
          ` : ''}
          ${comment ? `
            <p><strong>Comment:</strong></p>
            <p>${comment}</p>
          ` : ''}
          <p><strong>From:</strong> ${userEmail}</p>
          <p><strong>Feedback ID:</strong> ${result[0].id}</p>
          <p><small>View all feedback: <a href="${process.env.NEXTAUTH_URL}/admin/feedback">Admin Dashboard</a></small></p>
        `,
      })
    } catch (emailError) {
      console.error('[feedback] Failed to send email notification:', emailError)
      // Don't fail the request if email sending fails
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you for your feedback!',
        feedbackId: result[0].id,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[feedback] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to process feedback',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

interface QueryParams {
  companyId?: string
  page?: string
  rating?: string
  sentiment?: string
  startDate?: string
  endDate?: string
  limit?: string
  offset?: string
}

/**
 * GET /api/feedback
 * Retrieve feedback with filters (admin/pilot dashboard)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as { id?: string; companyId?: string; role?: string } | undefined

    // Verify user is admin or in the company
    if (!session || !user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const params: QueryParams = {
      companyId: searchParams.get('companyId') || undefined,
      page: searchParams.get('page') || undefined,
      rating: searchParams.get('rating') || undefined,
      sentiment: searchParams.get('sentiment') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      limit: searchParams.get('limit') || '50',
      offset: searchParams.get('offset') || '0',
    }

    // Default to company's feedback if not admin
    let companyId = params.companyId || user.companyId
    if (user.role !== 'system_admin' && params.companyId && params.companyId !== user.companyId) {
      return NextResponse.json(
        { error: 'Access denied: Cannot view other companies\' feedback' },
        { status: 403 }
      )
    }

    // Get paginated results - build WHERE conditions
    const whereConditions: string[] = [`company_id = '${companyId}'`]

    if (params.page) {
      whereConditions.push(`page = '${params.page.replace(/'/g, "''")}'`)
    }

    if (params.rating) {
      const rating = parseInt(params.rating, 10)
      if (!isNaN(rating) && rating >= 1 && rating <= 5) {
        whereConditions.push(`rating = ${rating}`)
      }
    }

    if (params.sentiment) {
      whereConditions.push(`sentiment = '${params.sentiment.replace(/'/g, "''")}'`)
    }

    if (params.startDate) {
      whereConditions.push(`created_at >= '${new Date(params.startDate).toISOString()}'`)
    }

    if (params.endDate) {
      whereConditions.push(`created_at <= '${new Date(params.endDate).toISOString()}'`)
    }

    const whereClause = whereConditions.join(' AND ')

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as count FROM feedback WHERE ${whereClause}
    `
    const countResult = (await sql.unsafe(countQuery)) as any
    const total = parseInt(countResult[0]?.count ?? '0', 10)

    // Get paginated results
    const limit = Math.min(parseInt(params.limit || '50', 10), 200)
    const offset = Math.max(parseInt(params.offset || '0', 10), 0)

    const query = `
      SELECT
        id,
        company_id,
        user_id,
        page,
        task,
        rating,
        confusion_points,
        comment,
        sentiment,
        created_at
      FROM feedback
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `

    const feedbackResult = (await sql.unsafe(query)) as any

    // Calculate aggregate stats
    const stats = {
      totalFeedback: total,
      averageRating:
        feedbackResult.length > 0
          ? (feedbackResult.reduce((sum: number, f: any) => sum + f.rating, 0) / feedbackResult.length).toFixed(2)
          : 0,
      sentimentBreakdown: {
        positive: feedbackResult.filter((f: any) => f.sentiment === 'positive').length,
        neutral: feedbackResult.filter((f: any) => f.sentiment === 'neutral').length,
        negative: feedbackResult.filter((f: any) => f.sentiment === 'negative').length,
        frustrated: feedbackResult.filter((f: any) => f.sentiment === 'frustrated').length,
      },
      topConfusionPoints: {} as Record<string, number>,
    }

    // Analyze confusion points
    feedbackResult.forEach((f: any) => {
      if (f.confusion_points) {
        f.confusion_points.forEach((point: string) => {
          stats.topConfusionPoints[point] = (stats.topConfusionPoints[point] || 0) + 1
        })
      }
    })

    return NextResponse.json(
      {
        success: true,
        data: feedbackResult,
        stats,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[feedback-get] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to retrieve feedback',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
