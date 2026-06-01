import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { validateAndPersistSequencingAlerts } from '@/lib/pace-alerts-service'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const RequestSchema = z.object({
  companyId: z.string().uuid(),
  exchange: z.string().optional(),
})

/**
 * POST /api/pace/validate-sequencing
 * Validate company milestone sequencing and persist alerts
 * 
 * Request body: { companyId: string, exchange?: string }
 * Returns: { alerts: Array<{ id, rule, severity, remediation }> }
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string; role?: string } | undefined

  if (!session || !user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { companyId, exchange } = RequestSchema.parse(body)

    // Fetch company if exchange not provided
    let targetExchange: string = exchange || ''
    if (!targetExchange) {
      const { sql } = await import('@/lib/db')
      const rows = await sql`
        SELECT target_exchange FROM companies WHERE id = ${companyId}
      ` as any[]
      
      if (rows.length === 0) {
        return NextResponse.json({ error: 'Company not found' }, { status: 404 })
      }
      targetExchange = rows[0].target_exchange
    }

    // Validate and persist sequencing alerts
    const alerts = await validateAndPersistSequencingAlerts(companyId, targetExchange)

    return NextResponse.json({
      companyId,
      exchange: targetExchange,
      alertCount: alerts.length,
      alerts: alerts.map(alert => ({
        id: alert.id,
        rule: alert.rule,
        severity: alert.severity,
        remediation: alert.remediation,
        createdAt: alert.createdAt,
      })),
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request body', details: (error as any).errors },
        { status: 400 }
      )
    }

    console.error('[POST /api/pace/validate-sequencing] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
