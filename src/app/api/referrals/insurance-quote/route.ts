import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { provider_name, insurance_types, status } = await req.json()

    if (!provider_name || !insurance_types || !Array.isArray(insurance_types)) {
      return NextResponse.json(
        { error: 'provider_name and insurance_types array are required' },
        { status: 400 }
      )
    }

    // Insert insurance quote referral into database
    const inserted = await sql`
      INSERT INTO referrals (
        referrer_id,
        referral_type,
        insurance_provider,
        insurance_types,
        status,
        created_at,
        updated_at
      )
      VALUES (
        ${userId},
        'insurance_quote',
        ${provider_name},
        ${JSON.stringify(insurance_types)},
        ${status || 'quote_requested'},
        NOW(),
        NOW()
      )
      RETURNING *
    `

    // Log the referral for analytics
    console.log(`[Insurance Referral] User ${userId} requested quote from ${provider_name} for ${insurance_types.join(', ')}`)

    return NextResponse.json({
      success: true,
      referral: inserted[0],
      message: `Insurance quote request tracked. We'll notify you when ${provider_name} responds.`,
    })
  } catch (error) {
    console.error('[Insurance Referral API Error]', error)
    return NextResponse.json(
      { error: 'Failed to track insurance quote request' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve user's insurance quote requests
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all insurance-related referrals for this user
    const referrals = await sql`
      SELECT *
      FROM referrals
      WHERE referrer_id = ${userId}
        AND referral_type = 'insurance_quote'
      ORDER BY created_at DESC
    `

    // Calculate referral fee estimates
    const referralStats = {
      totalQuotesRequested: referrals.length,
      averageReferralFeePerQuote: 6.5, // Average percentage
      estimatedMonthlyRevenue: (referrals.length * 150 * 6.5) / 100, // Rough estimate based on avg policy cost
    }

    return NextResponse.json({
      success: true,
      referrals,
      stats: referralStats,
    })
  } catch (error) {
    console.error('[Insurance Referral GET Error]', error)
    return NextResponse.json(
      { error: 'Failed to fetch insurance referrals' },
      { status: 500 }
    )
  }
}
