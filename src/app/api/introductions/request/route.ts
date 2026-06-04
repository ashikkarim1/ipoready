import { NextResponse, NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface IntroductionRequest {
  professionalId: string
  companyId: string
  roleSeeking: string
  message?: string
}

/**
 * POST /api/introductions/request
 * Request introduction to a professional for a board/talent position
 *
 * Requires:
 * - Authentication
 * - Professional ID
 * - Company ID (must be user's company)
 * - Role seeking
 * - Optional message
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    const user = session?.user as { id?: string; companyId?: string } | undefined

    if (!session || !user?.id || !user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: IntroductionRequest = await req.json()

    // Validate required fields
    if (!body.professionalId || !body.companyId || !body.roleSeeking) {
      return NextResponse.json(
        { error: 'Missing required fields: professionalId, companyId, roleSeeking' },
        { status: 400 }
      )
    }

    // Verify user's company matches requested company
    if (body.companyId !== user.companyId) {
      return NextResponse.json(
        { error: 'Forbidden - can only request introductions for your company' },
        { status: 403 }
      )
    }

    // Verify professional exists
    const profRows = await sql`
      SELECT id FROM professionals WHERE id = ${body.professionalId}
    ` as { id: string }[]

    if (profRows.length === 0) {
      return NextResponse.json({ error: 'Professional not found' }, { status: 404 })
    }

    // Verify company exists
    const companyRows = await sql`
      SELECT id FROM companies WHERE id = ${body.companyId}
    ` as { id: string }[]

    if (companyRows.length === 0) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Check if introduction already exists (prevent duplicates)
    const existingRows = await sql`
      SELECT id FROM professional_introductions
      WHERE professional_id = ${body.professionalId}
        AND company_id = ${body.companyId}
        AND status IN ('pending', 'accepted')
    ` as { id: string }[]

    if (existingRows.length > 0) {
      return NextResponse.json(
        { error: 'An active introduction already exists for this professional-company pair' },
        { status: 409 }
      )
    }

    // Create introduction request
    const insertedRows = await sql`
      INSERT INTO professional_introductions (
        professional_id,
        company_id,
        requested_by_user_id,
        role_seeking,
        message,
        status
      )
      VALUES (
        ${body.professionalId},
        ${body.companyId},
        ${user.id},
        ${body.roleSeeking},
        ${body.message || null},
        'pending'
      )
      RETURNING
        id, professional_id, company_id, role_seeking,
        status, introduction_date
    ` as {
      id: string
      professional_id: string
      company_id: string
      role_seeking: string
      status: string
      introduction_date: string
    }[]

    if (insertedRows.length === 0) {
      return NextResponse.json({ error: 'Failed to create introduction request' }, { status: 500 })
    }

    const intro = insertedRows[0]

    return NextResponse.json(
      {
        message: 'Introduction request sent successfully',
        introduction: {
          id: intro.id,
          professionalId: intro.professional_id,
          companyId: intro.company_id,
          roleSeeking: intro.role_seeking,
          status: intro.status,
          introductionDate: intro.introduction_date,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating introduction request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
