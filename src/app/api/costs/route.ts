/**
 * IPOReady Cost Calculator 2A.1 - API Routes
 * 
 * Endpoints for managing IPO costs
 * Base URL: /api/costs
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { calculateCostMetrics, generateCSVExport, CostItem } from '@/lib/cost-calculator'

interface SaveCostsRequest {
  costs: CostItem[]
  projectId?: string
}

// ═══════════════════════════════════════════════════════════════════════
// GET /api/costs
// Retrieve all costs for current user/project
// ═══════════════════════════════════════════════════════════════════════
export async function GET(req: NextRequest) {
  try {
    // Get authenticated session
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')

    // TODO: Query database for costs
    // const costs = await db.costs.findMany({
    //   where: {
    //     userId: session.user.id,
    //     ...(projectId && { projectId }),
    //   },
    //   orderBy: { createdAt: 'desc' },
    // })

    // Placeholder response
    const costs: CostItem[] = [
      {
        id: '1',
        name: 'Trading Systems Infrastructure',
        category: 'capex',
        subcategory: 'Equipment',
        amount: 2500000,
        timeline: 'pre-ipo',
        notes: 'Servers, networking, failover systems',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    return NextResponse.json({
      success: true,
      data: costs,
      count: costs.length,
      summary: {
        capexTotal: costs
          .filter((c) => c.category === 'capex')
          .reduce((sum, c) => sum + c.amount, 0),
        opexTotal: costs
          .filter((c) => c.category === 'opex')
          .reduce((sum, c) => sum + c.amount, 0),
        grandTotal: costs.reduce((sum, c) => sum + c.amount, 0),
      },
    })
  } catch (error) {
    console.error('GET /api/costs error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch costs' },
      { status: 500 }
    )
  }
}

// ═══════════════════════════════════════════════════════════════════════
// POST /api/costs
// Save/create new costs
// ═══════════════════════════════════════════════════════════════════════
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: SaveCostsRequest = await req.json()

    // Validate request
    if (!body.costs || !Array.isArray(body.costs)) {
      return NextResponse.json(
        { error: 'Invalid request: costs array required' },
        { status: 400 }
      )
    }

    // Validate each cost item
    const validationErrors: string[] = []
    body.costs.forEach((cost, index) => {
      if (!cost.name) validationErrors.push(`Item ${index + 1}: name required`)
      if (!cost.category) validationErrors.push(`Item ${index + 1}: category required`)
      if (cost.amount <= 0) validationErrors.push(`Item ${index + 1}: amount must be positive`)
      if (!['capex', 'opex'].includes(cost.category)) {
        validationErrors.push(`Item ${index + 1}: invalid category`)
      }
    })

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      )
    }

    // TODO: Save to database
    // await db.costs.createMany({
    //   data: body.costs.map(cost => ({
    //     ...cost,
    //     userId: session.user.id,
    //     projectId: body.projectId,
    //   })),
    // })

    // Calculate totals
    const capexTotal = body.costs
      .filter((c) => c.category === 'capex')
      .reduce((sum, c) => sum + c.amount, 0)
    const opexTotal = body.costs
      .filter((c) => c.category === 'opex')
      .reduce((sum, c) => sum + c.amount, 0)
    const grandTotal = capexTotal + opexTotal

    return NextResponse.json(
      {
        success: true,
        message: `Saved ${body.costs.length} cost items`,
        summary: {
          capexTotal,
          opexTotal,
          grandTotal,
          capexPercentage: ((capexTotal / grandTotal) * 100).toFixed(1),
          opexPercentage: ((opexTotal / grandTotal) * 100).toFixed(1),
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/costs error:', error)
    return NextResponse.json(
      { error: 'Failed to save costs' },
      { status: 500 }
    )
  }
}

// ═══════════════════════════════════════════════════════════════════════
// PUT /api/costs
// Update existing costs (batch update)
// ═══════════════════════════════════════════════════════════════════════
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()

    if (!body.costs || !Array.isArray(body.costs)) {
      return NextResponse.json(
        { error: 'Invalid request: costs array required' },
        { status: 400 }
      )
    }

    // TODO: Update database
    // await Promise.all(
    //   body.costs.map(cost =>
    //     db.costs.update({
    //       where: { id: cost.id },
    //       data: cost,
    //     })
    //   )
    // )

    return NextResponse.json({
      success: true,
      message: `Updated ${body.costs.length} cost items`,
    })
  } catch (error) {
    console.error('PUT /api/costs error:', error)
    return NextResponse.json(
      { error: 'Failed to update costs' },
      { status: 500 }
    )
  }
}

// ═══════════════════════════════════════════════════════════════════════
// DELETE /api/costs/[id]
// Delete a specific cost item
// ═══════════════════════════════════════════════════════════════════════
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Cost ID required' },
        { status: 400 }
      )
    }

    // TODO: Delete from database
    // await db.costs.delete({
    //   where: { id },
    // })

    return NextResponse.json({
      success: true,
      message: 'Cost item deleted',
    })
  } catch (error) {
    console.error('DELETE /api/costs error:', error)
    return NextResponse.json(
      { error: 'Failed to delete cost' },
      { status: 500 }
    )
  }
}
