import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import { IPO_CHECKLIST } from '@/lib/checklist-data'
import { Exchange, ListingType } from '@/types'

export const dynamic = 'force-dynamic'

interface WizardPayload {
  listingType: ListingType
  targetExchange: Exchange
  companyName: string
  sector: string
  selectedPlan: string
}

interface CountRow {
  count: string
}

// Estimate the base IPO timeline (days from today) based on exchange
function estimatedDaysToIpo(exchange: Exchange): number {
  const timelines: Record<Exchange, number> = {
    otc:   90,
    cse:   180,
    tsxv:  270,
    tsx:   365,
    cboe:  300,
    nasdaq: 450,
    nyse:  540,
  }
  return timelines[exchange] ?? 365
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: WizardPayload
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { listingType, targetExchange, companyName, sector, selectedPlan } = body

  if (!listingType || !targetExchange) {
    return NextResponse.json({ error: 'listingType and targetExchange are required' }, { status: 400 })
  }

  const userId = user.id

  // ─── 1. Resolve or create the company ─────────────────────────────────────
  let companyId = user.companyId ?? null

  if (!companyId) {
    // No company yet — create one tied to this user
    const insertedCompany = await sql`
      INSERT INTO companies (
        name,
        listing_type,
        target_exchange,
        current_phase,
        pace_score,
        progress_percentage,
        estimated_days_to_ipo,
        subscription_plan,
        owner_id,
        created_at
      ) VALUES (
        ${companyName?.trim() || 'My Company'},
        ${listingType},
        ${targetExchange},
        'pre_planning',
        50,
        0,
        ${estimatedDaysToIpo(targetExchange)},
        ${selectedPlan ?? 'starter'},
        ${userId},
        NOW()
      )
      RETURNING id
    `
    companyId = (insertedCompany[0] as any).id

    // Link user to this company
    await sql`
      UPDATE users
      SET company_id = ${companyId},
          updated_at = NOW()
      WHERE id = ${userId}
    `
  } else {
    // Update existing company with wizard selections
    await sql`
      UPDATE companies
      SET listing_type            = ${listingType},
          target_exchange         = ${targetExchange},
          current_phase           = 'pre_planning',
          estimated_days_to_ipo   = ${estimatedDaysToIpo(targetExchange)},
          subscription_plan       = ${selectedPlan ?? 'starter'},
          name                    = CASE
                                      WHEN ${companyName?.trim() || ''} <> ''
                                      THEN ${companyName.trim()}
                                      ELSE name
                                    END
      WHERE id = ${companyId}
    `
  }

  // ─── 2. Seed tasks if not already seeded ──────────────────────────────────
  const countRows = await sql`
    SELECT COUNT(*) AS count FROM tasks WHERE company_id = ${companyId}
  ` as CountRow[]

  const existingCount = parseInt(countRows[0]?.count ?? '0', 10)
  let seededCount = 0

  if (existingCount === 0) {
    // Filter tasks to those applicable for this listing type + exchange
    let filteredTasks = IPO_CHECKLIST.filter(
      task =>
        task.applicableExchanges.includes(targetExchange) &&
        task.applicableListingTypes.includes(listingType)
    )

    // Fallback: use all tasks if the combination has no specific tasks
    if (filteredTasks.length === 0) {
      filteredTasks = IPO_CHECKLIST
    }

    // Calculate due dates relative to today
    const today = new Date()

    for (const task of filteredTasks) {
      const dueDate = new Date(today)
      dueDate.setDate(today.getDate() + task.estimatedDays)
      const dueDateStr = dueDate.toISOString().split('T')[0]

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
          order_index,
          due_date
        ) VALUES (
          ${companyId},
          ${task.phase},
          ${task.category},
          ${task.title},
          ${task.description},
          'not_started',
          ${task.priority},
          ${task.estimatedDays},
          ${task.order},
          ${dueDateStr}
        )
      `
    }

    seededCount = filteredTasks.length
  }

  // ─── 3. Mark user as no longer new ────────────────────────────────────────
  await sql`
    UPDATE users
    SET is_new_user  = FALSE,
        updated_at   = NOW()
    WHERE id = ${userId}
  `

  return NextResponse.json({
    success: true,
    companyId,
    tasksSeeded: seededCount,
    alreadyHadTasks: existingCount > 0,
  })
}
