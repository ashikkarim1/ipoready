import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
/**
 * GET /api/prospectus/[id]/shareholders
 * Fetch all 10%+ shareholders for a prospectus
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const prospectusId = params.id

    // TODO: Implement database query to fetch shareholders
    // const shareholders = await db.shareholder.findMany({
    //   where: { prospectusId, ownershipPercentage: { gte: 10 } },
    //   include: { documents: true }
    // })

    return NextResponse.json({
      success: true,
      shareholders: [],
    })
  } catch (error) {
    console.error('Error fetching shareholders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shareholders' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/prospectus/[id]/shareholders
 * Create a new shareholder
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const prospectusId = params.id
    const body = await request.json()

    // TODO: Implement database mutation to create shareholder
    // const shareholder = await db.shareholder.create({
    //   data: {
    //     prospectusId,
    //     name: body.name,
    //     email: body.email,
    //     ownershipPercentage: parseFloat(body.ownershipPercentage),
    //     shareCount: parseInt(body.shareCount),
    //     pifRequired: true,
    //     pifStatus: 'required'
    //   }
    // })

    return NextResponse.json(
      {
        success: true,
        shareholder: {
          id: `sh-${Date.now()}`,
          prospectusId,
          name: body.name,
          email: body.email,
          ownershipPercentage: parseFloat(body.ownershipPercentage || 0),
          shareCount: parseInt(body.shareCount || 0),
          pifRequired: true,
          pifStatus: 'required',
          documents: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating shareholder:', error)
    return NextResponse.json(
      { error: 'Failed to create shareholder' },
      { status: 500 }
    )
  }
}
