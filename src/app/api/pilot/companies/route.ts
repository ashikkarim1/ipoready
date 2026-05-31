import { getServerSession } from 'next-auth/next'
import { sql } from '@/lib/db'
import { authOptions } from '@/lib/auth'
import type { NextRequest } from 'next/server'

interface FeedbackAggregation {
  company_id: string
  company_name: string
  sector: string
  target_exchange: string
  pilot_code: string
  feedback_count: number
  average_rating: number
  positive_count: number
  neutral_count: number
  negative_count: number
  frustrated_count: number
  last_feedback_at: string | null
  task_completion_pct: number
  created_at: string
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only system_admin can view all pilot companies
    if (!session || session.user.role !== 'system_admin') {
      return Response.json(
        { error: 'Unauthorized access to pilot companies' },
        { status: 403 }
      )
    }

    // Parse pagination params
    const url = new URL(request.url)
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100)
    const offset = parseInt(url.searchParams.get('offset') || '0')

    // Fetch all pilot companies with aggregated feedback metrics
    const companiesQuery = sql`
      SELECT 
        c.id as company_id,
        c.company_name,
        c.sector,
        c.target_exchange,
        c.pilot_code,
        COUNT(f.id) as feedback_count,
        COALESCE(AVG(f.rating), 0) as average_rating,
        SUM(CASE WHEN f.sentiment = 'positive' THEN 1 ELSE 0 END) as positive_count,
        SUM(CASE WHEN f.sentiment = 'neutral' THEN 1 ELSE 0 END) as neutral_count,
        SUM(CASE WHEN f.sentiment = 'negative' THEN 1 ELSE 0 END) as negative_count,
        SUM(CASE WHEN f.sentiment = 'frustrated' THEN 1 ELSE 0 END) as frustrated_count,
        MAX(f.created_at) as last_feedback_at,
        COALESCE(
          ROUND(
            100 * COUNT(DISTINCT CASE WHEN pt.status = 'completed' THEN pt.id END)::FLOAT / 
            NULLIF(COUNT(DISTINCT pt.id), 0),
            2
          ),
          0
        ) as task_completion_pct,
        c.created_at
      FROM companies c
      LEFT JOIN feedback f ON c.id = f.company_id
      LEFT JOIN phase_tasks pt ON c.id = pt.company_id
      WHERE c.pilot_badge = true
      GROUP BY c.id, c.company_name, c.sector, c.target_exchange, c.pilot_code, c.created_at
      ORDER BY c.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    const result = await companiesQuery

    // Get total count for pagination
    const countResult = await sql`
      SELECT COUNT(*) as total FROM companies WHERE pilot_badge = true
    `

    const companies = result as FeedbackAggregation[]
    const total = parseInt((countResult[0] as any).total)

    // Transform feedback counts to objects for easier consumption
    const transformedCompanies = companies.map(company => ({
      ...company,
      sentiment_breakdown: {
        positive: parseInt(company.positive_count.toString()),
        neutral: parseInt(company.neutral_count.toString()),
        negative: parseInt(company.negative_count.toString()),
        frustrated: parseInt(company.frustrated_count.toString()),
      },
      average_rating: parseFloat(company.average_rating.toString()),
      feedback_count: parseInt(company.feedback_count.toString()),
      task_completion_pct: parseFloat(company.task_completion_pct.toString()),
    }))

    return Response.json(
      {
        data: transformedCompanies,
        pagination: {
          limit,
          offset,
          total,
          has_more: offset + limit < total,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching pilot companies:', error)
    return Response.json(
      { error: 'Failed to fetch pilot companies' },
      { status: 500 }
    )
  }
}
