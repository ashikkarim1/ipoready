import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface StartOnboardingRequest {
  exchange: string
  skipReason?: string
  skip?: boolean
}

interface OnboardingChecklistRow {
  id: string
}

interface TemplateRow {
  items: any
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const companyId = user.companyId

  try {
    const body = (await request.json()) as StartOnboardingRequest
    const { exchange, skip = false, skipReason } = body

    if (!exchange && !skip) {
      return NextResponse.json(
        { error: 'Exchange is required' },
        { status: 400 }
      )
    }

    // Check if checklist already exists
    const existing = await sql`
      SELECT id FROM onboarding_checklists WHERE company_id = ${companyId}
    ` as OnboardingChecklistRow[]

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Onboarding already started for this company' },
        { status: 409 }
      )
    }

    if (skip) {
      // Mark as skipped
      await sql`
        INSERT INTO onboarding_checklists (
          company_id,
          exchange,
          status,
          skip_reason,
          created_at,
          updated_at
        ) VALUES (
          ${companyId},
          ${exchange || 'unknown'},
          'skipped',
          ${skipReason || null},
          NOW(),
          NOW()
        )
      `

      await sql`
        UPDATE companies
        SET onboarding_status = 'skipped'
        WHERE id = ${companyId}
      `

      return NextResponse.json({
        success: true,
        status: 'skipped',
      })
    }

    // Fetch template for exchange
    const templates = await sql`
      SELECT items FROM onboarding_templates WHERE exchange = ${exchange}
    ` as TemplateRow[]

    if (templates.length === 0) {
      return NextResponse.json(
        { error: `No template found for exchange: ${exchange}` },
        { status: 400 }
      )
    }

    const templateItems = templates[0].items

    // Create checklist
    const checklistResult = await sql`
      INSERT INTO onboarding_checklists (
        company_id,
        exchange,
        status,
        started_at,
        created_at,
        updated_at
      ) VALUES (
        ${companyId},
        ${exchange},
        'in_progress',
        NOW(),
        NOW(),
        NOW()
      )
      RETURNING id
    ` as OnboardingChecklistRow[]

    if (checklistResult.length === 0) {
      throw new Error('Failed to create checklist')
    }

    const checklistId = checklistResult[0].id

    // Create checklist items from template
    if (Array.isArray(templateItems)) {
      for (const item of templateItems) {
        await sql`
          INSERT INTO checklist_items (
            checklist_id,
            company_id,
            item_name,
            category,
            required,
            order_index,
            status,
            estimated_days,
            created_at,
            updated_at
          ) VALUES (
            ${checklistId},
            ${companyId},
            ${item.name},
            ${item.category},
            ${item.required || true},
            ${item.order},
            'not_started',
            ${item.estimatedDays || 5},
            NOW(),
            NOW()
          )
        `
      }
    }

    // Update company onboarding status
    await sql`
      UPDATE companies
      SET onboarding_status = 'in_progress',
          onboarding_selected_exchange = ${exchange}
      WHERE id = ${companyId}
    `

    // Log event
    await sql`
      INSERT INTO onboarding_progress_logs (
        company_id,
        checklist_id,
        event_type,
        event_data,
        created_at
      ) VALUES (
        ${companyId},
        ${checklistId},
        'started',
        ${JSON.stringify({ exchange })},
        NOW()
      )
    `

    return NextResponse.json({
      success: true,
      checklistId,
      status: 'in_progress',
      totalItems: templateItems.length,
    })
  } catch (error) {
    console.error('[onboarding-start] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to start onboarding',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
