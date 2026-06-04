import { NextResponse, NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * GET /api/professional-stats/referral-earnings
 * Get professional's referral earnings and commission tracking
 *
 * Requires:
 * - Authentication as a professional
 *
 * Returns:
 * - Pending commissions
 * - Earned commissions
 * - Paid commissions
 * - Total earnings
 * - Commission history
 */
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    const user = session?.user as { email?: string } | undefined

    if (!session || !user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get professional by email
    const profRows = await sql`
      SELECT id, name FROM professionals WHERE email = ${user.email}
    ` as { id: string; name: string }[]

    if (profRows.length === 0) {
      return NextResponse.json(
        { error: 'Professional profile not found' },
        { status: 404 }
      )
    }

    const professional = profRows[0]

    // Get referral statistics
    const referralRows = await sql`
      SELECT
        pr.id,
        pr.status,
        pr.referral_commission,
        pr.earned_date,
        pr.paid_date,
        hc.hire_date,
        p.name as referred_professional_name,
        c.name as company_name
      FROM professional_referrals pr
      JOIN hiring_confirmations hc ON pr.hiring_confirmation_id = hc.id
      JOIN professionals p ON pr.referred_id = p.id
      JOIN companies c ON hc.company_id = c.id
      WHERE pr.referrer_id = ${professional.id}
      ORDER BY pr.created_at DESC
    ` as {
      id: string
      status: string
      referral_commission: number
      earned_date: string | null
      paid_date: string | null
      hire_date: string
      referred_professional_name: string
      company_name: string
    }[]

    // Calculate totals by status
    const pending = referralRows
      .filter((r) => r.status === 'pending')
      .reduce((sum, r) => sum + r.referral_commission, 0)

    const earned = referralRows
      .filter((r) => r.status === 'earned')
      .reduce((sum, r) => sum + r.referral_commission, 0)

    const paid = referralRows
      .filter((r) => r.status === 'paid')
      .reduce((sum, r) => sum + r.referral_commission, 0)

    const total = pending + earned + paid

    // Get direct hiring confirmations (non-referral)
    const directHiringRows = await sql`
      SELECT
        hc.id,
        hc.finders_fee_amount,
        hc.payment_status,
        hc.hire_date,
        c.name as company_name
      FROM hiring_confirmations hc
      JOIN companies c ON hc.company_id = c.id
      WHERE hc.professional_id = ${professional.id}
      ORDER BY hc.hire_date DESC
    ` as {
      id: string
      finders_fee_amount: number | null
      payment_status: string
      hire_date: string
      company_name: string
    }[]

    const directFindersFees = directHiringRows
      .filter((h) => h.finders_fee_amount)
      .reduce((sum, h) => sum + (h.finders_fee_amount || 0), 0)

    return NextResponse.json({
      professional: {
        id: professional.id,
        name: professional.name,
      },
      referralEarnings: {
        pendingCommission: Math.round(pending * 100) / 100,
        earnedCommission: Math.round(earned * 100) / 100,
        paidCommission: Math.round(paid * 100) / 100,
        totalReferralEarnings: Math.round(total * 100) / 100,
      },
      directFindersFees: {
        totalFindersFees: Math.round(directFindersFees * 100) / 100,
        hireCount: directHiringRows.length,
      },
      combinedEarnings: {
        totalEarnings: Math.round((total + directFindersFees) * 100) / 100,
      },
      referralHistory: referralRows.map((r) => ({
        id: r.id,
        referredProfessional: r.referred_professional_name,
        company: r.company_name,
        hireDate: r.hire_date,
        commission: r.referral_commission,
        status: r.status,
        earnedDate: r.earned_date,
        paidDate: r.paid_date,
      })),
      directHiringHistory: directHiringRows.map((h) => ({
        id: h.id,
        company: h.company_name,
        hireDate: h.hire_date,
        findersFee: h.finders_fee_amount,
        status: h.payment_status,
      })),
      summary: {
        totalReferrals: referralRows.length,
        totalDirectHires: directHiringRows.length,
        commissionRate: '10% of finders fee',
        findersFeeRate: '2% of total compensation',
      },
    })
  } catch (error) {
    console.error('Error fetching referral earnings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
