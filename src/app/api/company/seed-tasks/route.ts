import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import { IPO_CHECKLIST } from '@/lib/checklist-data'

export const dynamic = 'force-dynamic'

interface CompanyRow {
  id: string
  target_exchange: string
  listing_type: string
}

interface CountRow {
  count: string
}

export async function POST() {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const companyId = user.companyId

  // Get company details
  const companyRows = await sql`
    SELECT id, target_exchange, listing_type
    FROM companies
    WHERE id = ${companyId}
    LIMIT 1
  ` as CompanyRow[]

  if (companyRows.length === 0) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 })
  }

  const company = companyRows[0]

  // Check if tasks already exist
  const countRows = await sql`
    SELECT COUNT(*) AS count FROM tasks WHERE company_id = ${companyId}
  ` as CountRow[]

  const existingCount = parseInt(countRows[0]?.count ?? '0', 10)
  if (existingCount > 0) {
    return NextResponse.json({ alreadySeeded: true, count: existingCount })
  }

  // Filter tasks applicable to this company's exchange and listing type
  let filteredTasks = IPO_CHECKLIST.filter(
    task =>
      task.applicableExchanges.includes(company.target_exchange as Parameters<typeof task.applicableExchanges.includes>[0]) &&
      task.applicableListingTypes.includes(company.listing_type as Parameters<typeof task.applicableListingTypes.includes>[0])
  )

  // Fallback: use all tasks if none match
  if (filteredTasks.length === 0) {
    filteredTasks = IPO_CHECKLIST
  }

  // Insert each task individually
  for (const task of filteredTasks) {
    await sql`
      INSERT INTO tasks (
        company_id,
        phase,
        category,
        title,
        description,
        status,
        priority,
        estimated_days,
        order_index
      ) VALUES (
        ${companyId},
        ${task.phase},
        ${task.category},
        ${task.title},
        ${task.description},
        'not_started',
        ${task.priority},
        ${task.estimatedDays},
        ${task.order}
      )
    `
  }

  return NextResponse.json({ seeded: filteredTasks.length })
}
