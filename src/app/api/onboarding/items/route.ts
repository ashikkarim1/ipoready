import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface ChecklistItemData {
  id: string
  item_name: string
  category: string
  description: string
  required: boolean
  status: string
  estimated_days: number
  completion_percentage: number
  order_index: number
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const companyId = user.companyId
  const { searchParams } = new URL(request.url)
  const categoryFilter = searchParams.get('category')
  const statusFilter = searchParams.get('status')

  try {
    let rows: ChecklistItemData[]

    if (categoryFilter && statusFilter) {
      rows = await sql`
        SELECT id, item_name, category, description, required, status,
               estimated_days, completion_percentage, order_index
        FROM checklist_items
        WHERE company_id = ${companyId}
          AND category = ${categoryFilter}
          AND status = ${statusFilter}
        ORDER BY order_index ASC
      ` as ChecklistItemData[]
    } else if (categoryFilter) {
      rows = await sql`
        SELECT id, item_name, category, description, required, status,
               estimated_days, completion_percentage, order_index
        FROM checklist_items
        WHERE company_id = ${companyId}
          AND category = ${categoryFilter}
        ORDER BY order_index ASC
      ` as ChecklistItemData[]
    } else if (statusFilter) {
      rows = await sql`
        SELECT id, item_name, category, description, required, status,
               estimated_days, completion_percentage, order_index
        FROM checklist_items
        WHERE company_id = ${companyId}
          AND status = ${statusFilter}
        ORDER BY order_index ASC
      ` as ChecklistItemData[]
    } else {
      rows = await sql`
        SELECT id, item_name, category, description, required, status,
               estimated_days, completion_percentage, order_index
        FROM checklist_items
        WHERE company_id = ${companyId}
        ORDER BY order_index ASC
      ` as ChecklistItemData[]
    }

    const items = rows.map((row) => ({
      id: row.id,
      name: row.item_name,
      category: row.category,
      description: row.description,
      required: row.required,
      status: row.status,
      estimatedDays: row.estimated_days,
      completionPercentage: row.completion_percentage,
      orderIndex: row.order_index,
    }))

    return NextResponse.json({ items })
  } catch (error) {
    console.error('[onboarding-items-list] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to get items',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
