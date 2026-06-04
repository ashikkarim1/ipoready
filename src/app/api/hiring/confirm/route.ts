import { NextResponse, NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface CompensationPackage {
  cash: number
  bonus?: number
  equity?: {
    shares: number
    vesting_years: number
  }
}

interface ConfirmRequest {
  introductionId: string
  hireDate: string
  position: string
  compensationPackage: CompensationPackage
  confirmedByRole: 'company' | 'professional'
}

/**
 * POST /api/hiring/confirm
 * Confirm hiring details - Both company and professional must confirm
 * Anti-circumvention: Both parties must agree on compensation before fee is due
 *
 * Requires:
 * - Authentication
 * - Introduction ID
 * - Hire date, position, compensation package
 * - Role (company or professional)
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    const user = session?.user as { id?: string; companyId?: string; email?: string } | undefined

    if (!session || !user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: ConfirmRequest = await req.json()

    // Validate required fields
    if (!body.introductionId || !body.hireDate || !body.position || !body.compensationPackage || !body.confirmedByRole) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate role
    if (!['company', 'professional'].includes(body.confirmedByRole)) {
      return NextResponse.json(
        { error: 'confirmedByRole must be either "company" or "professional"' },
        { status: 400 }
      )
    }

    // Validate compensation package
    if (!body.compensationPackage.cash || body.compensationPackage.cash < 0) {
      return NextResponse.json(
        { error: 'Compensation package must include cash amount (>= 0)' },
        { status: 400 }
      )
    }

    // Get introduction details
    const introRows = await sql`
      SELECT
        id, professional_id, company_id, status
      FROM professional_introductions
      WHERE id = ${body.introductionId}
      LIMIT 1
    ` as {
      id: string
      professional_id: string
      company_id: string
      status: string
    }[]

    if (introRows.length === 0) {
      return NextResponse.json({ error: 'Introduction not found' }, { status: 404 })
    }

    const intro = introRows[0]

    if (intro.status !== 'accepted') {
      return NextResponse.json(
        { error: 'Introduction must be accepted before confirming hire' },
        { status: 400 }
      )
    }

    // Verify user authorization based on role
    if (body.confirmedByRole === 'company') {
      if (user.companyId !== intro.company_id) {
        return NextResponse.json(
          { error: 'Forbidden - only company users can confirm on behalf of company' },
          { status: 403 }
        )
      }
    } else {
      // Professional confirmation
      const profRows = await sql`
        SELECT id FROM professionals WHERE email = ${user.email || ''}
      ` as { id: string }[]

      if (profRows.length === 0 || profRows[0].id !== intro.professional_id) {
        return NextResponse.json(
          { error: 'Forbidden - only the professional can confirm on their behalf' },
          { status: 403 }
        )
      }
    }

    // Check if hiring confirmation already exists
    const existingRows = await sql`
      SELECT id FROM hiring_confirmations WHERE introduction_id = ${body.introductionId}
    ` as { id: string }[]

    let hiringConfirmationId: string

    if (existingRows.length > 0) {
      // Update existing record
      hiringConfirmationId = existingRows[0].id

      const updateQuery = body.confirmedByRole === 'company'
        ? sql`
            UPDATE hiring_confirmations
            SET
              confirmed_by_company = TRUE,
              confirmed_by_company_at = NOW(),
              confirmed_by_company_user_id = ${user.id},
              company_compensation_package = ${JSON.stringify(body.compensationPackage)},
              hire_date = ${body.hireDate},
              position = ${body.position}
            WHERE id = ${hiringConfirmationId}
            RETURNING id
          `
        : sql`
            UPDATE hiring_confirmations
            SET
              confirmed_by_professional = TRUE,
              confirmed_by_professional_at = NOW(),
              professional_compensation_package = ${JSON.stringify(body.compensationPackage)},
              hire_date = ${body.hireDate},
              position = ${body.position}
            WHERE id = ${hiringConfirmationId}
            RETURNING id
          `

      await updateQuery as { id: string }[]
    } else {
      // Create new hiring confirmation
      const insertQuery = body.confirmedByRole === 'company'
        ? sql`
            INSERT INTO hiring_confirmations (
              introduction_id,
              professional_id,
              company_id,
              hire_date,
              position,
              compensation_package,
              company_compensation_package,
              confirmed_by_company,
              confirmed_by_company_at,
              confirmed_by_company_user_id,
              payment_status
            )
            VALUES (
              ${body.introductionId},
              ${intro.professional_id},
              ${intro.company_id},
              ${body.hireDate},
              ${body.position},
              ${JSON.stringify(body.compensationPackage)},
              ${JSON.stringify(body.compensationPackage)},
              TRUE,
              NOW(),
              ${user.id},
              'pending'
            )
            RETURNING id
          `
        : sql`
            INSERT INTO hiring_confirmations (
              introduction_id,
              professional_id,
              company_id,
              hire_date,
              position,
              compensation_package,
              professional_compensation_package,
              confirmed_by_professional,
              confirmed_by_professional_at,
              payment_status
            )
            VALUES (
              ${body.introductionId},
              ${intro.professional_id},
              ${intro.company_id},
              ${body.hireDate},
              ${body.position},
              ${JSON.stringify(body.compensationPackage)},
              ${JSON.stringify(body.compensationPackage)},
              TRUE,
              NOW(),
              'pending'
            )
            RETURNING id
          `

      const insertedRows = (await insertQuery) as { id: string }[]
      if (insertedRows.length === 0) {
        return NextResponse.json({ error: 'Failed to create hiring confirmation' }, { status: 500 })
      }
      hiringConfirmationId = insertedRows[0].id
    }

    // Get updated hiring confirmation
    const updatedRows = await sql`
      SELECT
        id, professional_id, company_id, hire_date, position,
        compensation_package, confirmed_by_company, confirmed_by_professional,
        payment_status, is_disputed
      FROM hiring_confirmations
      WHERE id = ${hiringConfirmationId}
      LIMIT 1
    ` as {
      id: string
      professional_id: string
      company_id: string
      hire_date: string
      position: string
      compensation_package: any
      confirmed_by_company: boolean
      confirmed_by_professional: boolean
      payment_status: string
      is_disputed: boolean
    }[]

    if (updatedRows.length === 0) {
      return NextResponse.json({ error: 'Failed to retrieve confirmation' }, { status: 500 })
    }

    const confirmation = updatedRows[0]

    // Check if both parties have confirmed
    let messageAdded = `Confirmation recorded for ${body.confirmedByRole}`
    if (confirmation.confirmed_by_company && confirmation.confirmed_by_professional) {
      messageAdded += ' - Both parties confirmed. Fees will be calculated.'
    }

    return NextResponse.json({
      message: messageAdded,
      hiringConfirmation: {
        id: confirmation.id,
        professionalId: confirmation.professional_id,
        companyId: confirmation.company_id,
        hireDate: confirmation.hire_date,
        position: confirmation.position,
        compensationPackage: confirmation.compensation_package,
        confirmedByCompany: confirmation.confirmed_by_company,
        confirmedByProfessional: confirmation.confirmed_by_professional,
        bothConfirmed: confirmation.confirmed_by_company && confirmation.confirmed_by_professional,
        paymentStatus: confirmation.payment_status,
        isDisputed: confirmation.is_disputed,
      },
    })
  } catch (error) {
    console.error('Error confirming hire:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
