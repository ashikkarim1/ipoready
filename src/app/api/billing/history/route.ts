import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const QuerySchema = z.object({
  companyId: z.string().uuid().optional(),
  limit: z.string().transform(x => parseInt(x, 10)).default(10).optional(),
})

/**
 * GET /api/billing/history
 * Retrieve billing transaction history for a company
 * Query params: companyId, limit (default 10)
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = req.nextUrl.searchParams
  const companyId = searchParams.get('companyId') || user?.companyId
  const limitStr = searchParams.get('limit') || '10'

  // Validate query params
  let limit = 10
  try {
    const parsed = QuerySchema.parse({ companyId, limit: limitStr })
    limit = parsed.limit || 10
  } catch (err) {
    return NextResponse.json(
      { error: 'Invalid query parameters' },
      { status: 400 }
    )
  }

  if (!companyId) {
    return NextResponse.json({ error: 'Missing companyId' }, { status: 400 })
  }

  try {
    // Verify company exists
    const companyRows = await sql`
      SELECT id FROM companies WHERE id = ${companyId} LIMIT 1
    ` as any[]

    if (companyRows.length === 0) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Fetch billing transactions from webhook logs
    const transactions = await sql`
      SELECT 
        id,
        event_type,
        data,
        created_at
      FROM webhook_logs
      WHERE company_id = ${companyId}
        AND event_type IN ('charge.succeeded', 'charge.failed', 'invoice.payment_succeeded', 
                          'invoice.payment_failed', 'customer.subscription.created',
                          'customer.subscription.updated', 'customer.subscription.deleted')
      ORDER BY created_at DESC
      LIMIT ${limit}
    ` as any[]

    const formattedTransactions = transactions.map((tx: any) => ({
      id: tx.id,
      type: mapEventType(tx.event_type),
      eventType: tx.event_type,
      timestamp: tx.created_at,
      details: parseTransactionDetails(tx.event_type, tx.data),
    }))

    return NextResponse.json({
      companyId,
      transactions: formattedTransactions,
      count: formattedTransactions.length,
      limit,
    })
  } catch (error) {
    console.error('[GET /api/billing/history] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Map webhook event types to user-friendly labels
 */
function mapEventType(eventType: string): string {
  const map: Record<string, string> = {
    'charge.succeeded': 'Payment Successful',
    'charge.failed': 'Payment Failed',
    'invoice.payment_succeeded': 'Invoice Paid',
    'invoice.payment_failed': 'Invoice Payment Failed',
    'customer.subscription.created': 'Subscription Started',
    'customer.subscription.updated': 'Subscription Updated',
    'customer.subscription.deleted': 'Subscription Cancelled',
  }
  return map[eventType] || eventType
}

/**
 * Extract relevant transaction details from webhook data
 */
function parseTransactionDetails(eventType: string, data: any): any {
  if (!data) return {}

  try {
    const parsed = typeof data === 'string' ? JSON.parse(data) : data

    switch (eventType) {
      case 'charge.succeeded':
      case 'charge.failed':
        return {
          amount: parsed.amount ? parsed.amount / 100 : null,
          currency: parsed.currency,
          status: parsed.status,
          description: parsed.description,
        }
      case 'invoice.payment_succeeded':
      case 'invoice.payment_failed':
        return {
          amount: parsed.total ? parsed.total / 100 : null,
          currency: parsed.currency,
          status: parsed.status,
          invoiceNumber: parsed.number,
        }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        return {
          status: parsed.status,
          plan: parsed.plan?.nickname || parsed.plan?.id,
          amount: parsed.plan?.amount ? parsed.plan.amount / 100 : null,
          currency: parsed.plan?.currency,
          interval: parsed.plan?.interval,
        }
      case 'customer.subscription.deleted':
        return {
          status: 'cancelled',
          cancelledAt: parsed.canceled_at,
        }
      default:
        return parsed
    }
  } catch {
    return { raw: data }
  }
}
