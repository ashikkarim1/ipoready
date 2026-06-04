import { NextResponse, NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * POST /api/hiring/[id]/calculate-fees
 * Calculate finders fee and referral commissions when both parties confirm
 * Anti-circumvention: Only calculates if compensation packages match
 *
 * Finders fee: 2% of total compensation (cash + bonus)
 * Referral commission: 10% of finders fee (if referrer exists)
 *
 * Requires:
 * - Authentication
 * - Admin role for fee initiation
 * - Both parties must have confirmed
 * - Compensation packages must match
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions)
    const user = session?.user as { id?: string; role?: string } | undefined

    if (!session || !user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - admin role required' },
        { status: 403 }
      )
    }

    const hiringConfirmationId = params.id

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(hiringConfirmationId)) {
      return NextResponse.json({ error: 'Invalid hiring confirmation ID format' }, { status: 400 })
    }

    // Get hiring confirmation
    const confirmRows = await sql`
      SELECT
        id, professional_id, company_id,
        confirmed_by_company, confirmed_by_professional,
        company_compensation_package,
        professional_compensation_package,
        compensation_package,
        finders_fee_amount, is_disputed, payment_status
      FROM hiring_confirmations
      WHERE id = ${hiringConfirmationId}
      LIMIT 1
    ` as {
      id: string
      professional_id: string
      company_id: string
      confirmed_by_company: boolean
      confirmed_by_professional: boolean
      company_compensation_package: any
      professional_compensation_package: any
      compensation_package: any
      finders_fee_amount: number | null
      is_disputed: boolean
      payment_status: string
    }[]

    if (confirmRows.length === 0) {
      return NextResponse.json({ error: 'Hiring confirmation not found' }, { status: 404 })
    }

    const confirmation = confirmRows[0]

    // Check if already disputed
    if (confirmation.is_disputed) {
      return NextResponse.json(
        { error: 'Cannot calculate fees for disputed hiring confirmation' },
        { status: 400 }
      )
    }

    // Check if both have confirmed
    if (!confirmation.confirmed_by_company || !confirmation.confirmed_by_professional) {
      return NextResponse.json(
        { error: 'Both company and professional must confirm before calculating fees' },
        { status: 400 }
      )
    }

    // Compare compensation packages
    const companyComp = confirmation.company_compensation_package || {}
    const profComp = confirmation.professional_compensation_package || {}

    const packagesMatch =
      companyComp.cash === profComp.cash &&
      (companyComp.bonus || 0) === (profComp.bonus || 0) &&
      JSON.stringify(companyComp.equity) === JSON.stringify(profComp.equity)

    if (!packagesMatch) {
      // Mark as disputed - compensation packages don't match
      await sql`
        UPDATE hiring_confirmations
        SET
          is_disputed = TRUE,
          dispute_reason = 'Company and professional compensation packages do not match',
          payment_status = 'disputed'
        WHERE id = ${hiringConfirmationId}
      `

      return NextResponse.json(
        {
          error: 'Compensation packages do not match',
          details: {
            companyPackage: companyComp,
            professionalPackage: profComp,
          },
          action: 'Marked as disputed - requires manual resolution',
        },
        { status: 409 }
      )
    }

    // Calculate finders fee (2% of base compensation)
    const totalComp = (companyComp.cash || 0) + (companyComp.bonus || 0)
    const findersFee = Math.round(totalComp * 0.02 * 100) / 100  // Round to 2 decimals

    // Calculate referral commission (10% of finders fee)
    const referralCommission = Math.round(findersFee * 0.10 * 100) / 100

    // Update hiring confirmation with calculated fees
    const updatedRows = await sql`
      UPDATE hiring_confirmations
      SET
        finders_fee_amount = ${findersFee},
        referral_commission_amount = ${referralCommission},
        payment_status = 'invoice_sent'
      WHERE id = ${hiringConfirmationId}
      RETURNING
        id, professional_id, company_id,
        finders_fee_amount, referral_commission_amount,
        payment_status
    ` as {
      id: string
      professional_id: string
      company_id: string
      finders_fee_amount: number
      referral_commission_amount: number
      payment_status: string
    }[]

    if (updatedRows.length === 0) {
      return NextResponse.json({ error: 'Failed to calculate fees' }, { status: 500 })
    }

    const updated = updatedRows[0]

    // TODO: In production, create invoice in billing system
    // TODO: Send email notification to company about finders fee due in 30 days

    return NextResponse.json({
      message: 'Fees calculated successfully',
      feeCalculation: {
        hiringConfirmationId: updated.id,
        totalCompensation: totalComp,
        findersFeeAmount: updated.finders_fee_amount,
        findersFeePercentage: '2%',
        referralCommissionAmount: updated.referral_commission_amount,
        referralCommissionPercentage: '10% of finders fee',
        paymentStatus: updated.payment_status,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
      nextSteps: [
        'Invoice will be generated and sent to company',
        `Payment of $${updated.finders_fee_amount} is due within 30 days`,
        `Referral commission of $${updated.referral_commission_amount} tracked separately`,
      ],
    })
  } catch (error) {
    console.error('Error calculating fees:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
