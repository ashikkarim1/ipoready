import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
/**
 * GET /api/prospectus/[id]/officers
 * Fetch all officers for a prospectus
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const prospectusId = params.id

    // TODO: Implement database query to fetch officers
    // const officers = await db.officer.findMany({
    //   where: { prospectusId },
    //   include: { documents: true }
    // })

    return NextResponse.json({
      success: true,
      officers: [],
    })
  } catch (error) {
    console.error('Error fetching officers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch officers' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/prospectus/[id]/officers
 * Create a new officer
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const prospectusId = params.id
    const body = await request.json()

    // TODO: Implement database mutation to create officer
    // const officer = await db.officer.create({
    //   data: {
    //     prospectusId,
    //     name: body.name,
    //     email: body.email,
    //     title: body.role,
    //     department: body.department,
    //     sediStatus: 'not-registered',
    //     pifStatus: 'required'
    //   }
    // })

    return NextResponse.json(
      {
        success: true,
        officer: {
          id: `off-${Date.now()}`,
          prospectusId,
          ...body,
          sediStatus: 'not-registered',
          holdings: { commonShares: 0, options: 0, warrants: 0 },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating officer:', error)
    return NextResponse.json(
      { error: 'Failed to create officer' },
      { status: 500 }
    )
  }
}
