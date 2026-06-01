import { getServerSession } from 'next-auth/next'
import { sql } from '@/lib/db'
import { authOptions } from '@/lib/auth'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

interface FrictionPoint {
  point: string
  mentions: number
  severity: 'critical' | 'high' | 'medium' | 'low'
}

interface DashboardStats {
  total_companies: number
  total_feedback: number
  average_rating: number
  positive_ratio: number
  engagement_rate: number
  sentiment_breakdown: {
    positive: number
    neutral: number
    negative: number
    frustrated: number
  }
  friction_hotspots: FrictionPoint[]
  top_pages: Array<{
    page: string
    feedback_count: number
    average_rating: number
  }>
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only system_admin can view dashboard stats
    if (!session || session.user.role !== 'system_admin') {
      return Response.json(
        { error: 'Unauthorized access to dashboard stats' },
        { status: 403 }
      )
    }

    // Get aggregate feedback metrics across all pilot companies
    const statsQuery = sql`
      SELECT 
        COUNT(DISTINCT c.id) as total_companies,
        COUNT(f.id) as total_feedback,
        COALESCE(AVG(f.rating), 0) as average_rating,
        SUM(CASE WHEN f.sentiment = 'positive' THEN 1 ELSE 0 END)::FLOAT / 
        NULLIF(COUNT(f.id), 0) as positive_ratio,
        COUNT(DISTINCT CASE WHEN f.id IS NOT NULL THEN c.id END)::FLOAT / 
        NULLIF(COUNT(DISTINCT c.id), 0) as engagement_rate,
        SUM(CASE WHEN f.sentiment = 'positive' THEN 1 ELSE 0 END) as positive_count,
        SUM(CASE WHEN f.sentiment = 'neutral' THEN 1 ELSE 0 END) as neutral_count,
        SUM(CASE WHEN f.sentiment = 'negative' THEN 1 ELSE 0 END) as negative_count,
        SUM(CASE WHEN f.sentiment = 'frustrated' THEN 1 ELSE 0 END) as frustrated_count
      FROM companies c
      LEFT JOIN feedback f ON c.id = f.company_id
      WHERE c.pilot_badge = true
    `

    const statsResult = await statsQuery
    const stats = statsResult[0] as any

    // Get top friction points from confusion_points JSON arrays
    const frictionQuery = sql`
      SELECT 
        jsonb_array_elements(confusion_points)::TEXT as point,
        COUNT(*) as mention_count
      FROM feedback
      WHERE company_id IN (SELECT id FROM companies WHERE pilot_badge = true)
        AND confusion_points IS NOT NULL
        AND jsonb_array_length(confusion_points) > 0
      GROUP BY point
      ORDER BY mention_count DESC
      LIMIT 10
    `

    let frictionPoints: FrictionPoint[] = []
    try {
      const frictionResult = await frictionQuery
      frictionPoints = frictionResult.map((row: any) => {
        const mentions = parseInt(row.mention_count)
        const severity: 'critical' | 'high' | 'medium' | 'low' = 
          mentions >= 5 ? 'critical' : mentions >= 3 ? 'high' : mentions >= 2 ? 'medium' : 'low'
        return {
          point: row.point.replace(/"/g, ''),
          mentions,
          severity,
        }
      })
    } catch (e) {
      // If JSON parsing fails, return empty array
      console.warn('Error parsing friction points:', e)
    }

    // Get feedback by page
    const pageQuery = sql`
      SELECT 
        page,
        COUNT(*) as feedback_count,
        AVG(rating) as average_rating
      FROM feedback
      WHERE company_id IN (SELECT id FROM companies WHERE pilot_badge = true)
      GROUP BY page
      ORDER BY feedback_count DESC
      LIMIT 5
    `

    const pageResult = await pageQuery
    const topPages = pageResult.map((row: any) => ({
      page: row.page,
      feedback_count: parseInt(row.feedback_count),
      average_rating: parseFloat(row.average_rating),
    }))

    const dashboardStats: DashboardStats = {
      total_companies: parseInt(stats.total_companies),
      total_feedback: parseInt(stats.total_feedback),
      average_rating: parseFloat(stats.average_rating),
      positive_ratio: parseFloat(stats.positive_ratio || 0),
      engagement_rate: parseFloat(stats.engagement_rate || 0),
      sentiment_breakdown: {
        positive: parseInt(stats.positive_count || 0),
        neutral: parseInt(stats.neutral_count || 0),
        negative: parseInt(stats.negative_count || 0),
        frustrated: parseInt(stats.frustrated_count || 0),
      },
      friction_hotspots: frictionPoints,
      top_pages: topPages,
    }

    return Response.json(dashboardStats, { status: 200 })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return Response.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    )
  }
}
