import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { NewsPreferences } from '@/types/briefing'

/**
 * POST /api/intelligence/briefing/subscribe
 *
 * Subscribe user to morning briefing with custom preferences
 */
export async function POST(request: NextRequest) {
  try {
    const {
      userId,
      companyId,
      categories,
      emailTime,
      emailFrequency,
      competitors,
      excludeCategories,
      minUrgencyThreshold,
    } = await request.json()

    if (!userId || !companyId) {
      return NextResponse.json(
        { error: 'userId and companyId are required' },
        { status: 400 }
      )
    }

    // Validate email time format (HH:MM)
    if (emailTime && !/^\d{2}:\d{2}$/.test(emailTime)) {
      return NextResponse.json(
        { error: 'emailTime must be in HH:MM format' },
        { status: 400 }
      )
    }

    // Insert or update preferences
    const result = await db.query(`
      INSERT INTO news_preferences (
        user_id,
        company_id,
        categories,
        email_time,
        email_frequency,
        competitors_to_track,
        exclude_categories,
        min_urgency_threshold
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (user_id, company_id)
      DO UPDATE SET
        categories = $3,
        email_time = $4,
        email_frequency = $5,
        competitors_to_track = $6,
        exclude_categories = $7,
        min_urgency_threshold = $8,
        updated_at = NOW()
      RETURNING *
    `, [
      userId,
      companyId,
      categories || ['regulatory', 'competitor', 'market'],
      emailTime || '06:00',
      emailFrequency || 'daily',
      competitors || [],
      excludeCategories || [],
      minUrgencyThreshold || 'this-month',
    ])

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Failed to create subscription' },
        { status: 500 }
      )
    }

    const preferences = result.rows[0]

    // Create scheduled briefing if daily frequency
    if (emailFrequency === 'daily' || !emailFrequency) {
      const cronExpression = emailTimeToChron(emailTime || '06:00')
      await db.query(`
        INSERT INTO scheduled_briefings (company_id, schedule_cron, timezone, is_active)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (company_id) DO NOTHING
      `, [companyId, cronExpression, 'America/Toronto', true])
    }

    return NextResponse.json({
      success: true,
      preferences: {
        id: preferences.id,
        userId: preferences.user_id,
        companyId: preferences.company_id,
        categories: preferences.categories,
        emailTime: preferences.email_time,
        emailFrequency: preferences.email_frequency,
        competitorsToTrack: preferences.competitors_to_track,
        minUrgencyThreshold: preferences.min_urgency_threshold,
      },
      message: 'Subscribed to morning briefing',
    })
  } catch (error) {
    console.error('Subscribe error:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/intelligence/briefing/subscribe
 *
 * Update existing subscription
 */
export async function PUT(request: NextRequest) {
  // Re-use POST logic since we handle upsert via INSERT ... ON CONFLICT
  return POST(request)
}

/**
 * DELETE /api/intelligence/briefing/subscribe?userId=<id>&companyId=<id>
 *
 * Unsubscribe from briefing
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const companyId = searchParams.get('companyId')

    if (!userId || !companyId) {
      return NextResponse.json(
        { error: 'userId and companyId are required' },
        { status: 400 }
      )
    }

    const result = await db.query(`
      UPDATE news_preferences
      SET email_enabled = false, updated_at = NOW()
      WHERE user_id = $1 AND company_id = $2
    `, [userId, companyId])

    return NextResponse.json({
      success: true,
      message: 'Unsubscribed from morning briefing',
    })
  } catch (error) {
    console.error('Unsubscribe error:', error)
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    )
  }
}

/**
 * Convert time (HH:MM) to cron expression
 * Example: "06:00" -> "0 6 * * *"
 */
function emailTimeToChron(emailTime: string): string {
  const [hours, minutes] = emailTime.split(':')
  return `${minutes} ${hours} * * *`
}
