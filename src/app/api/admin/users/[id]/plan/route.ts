import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import { resend, FROM_ADDRESS, APP_URL } from '@/lib/resend'
import PlanUpgradeEmail from '@/emails/PlanUpgradeEmail'
import { createElement } from 'react'

export const dynamic = 'force-dynamic'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== 'system_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { plan } = await req.json() as { plan: string }
  const validPlans = ['starter', 'growth', 'enterprise']
  if (!validPlans.includes(plan)) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const userId = params.id

  // Look up user + company
  const rows = await sql`
    SELECT u.email, u.name, c.id AS company_id, c.name AS company_name, c.subscription_plan AS old_plan
    FROM users u
    LEFT JOIN companies c ON c.id = u.company_id
    WHERE u.id = ${userId}
    LIMIT 1
  `
  if (!rows.length) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { email, name, company_id, company_name, old_plan } = rows[0] as {
    email: string; name: string
    company_id: string | null; company_name: string | null; old_plan: string | null
  }

  if (company_id) {
    await sql`UPDATE companies SET subscription_plan = ${plan} WHERE id = ${company_id}`
  }

  // Send email notification
  const planLabel: Record<string, string> = { starter: 'Starter', growth: 'Growth', enterprise: 'Enterprise' }
  resend.emails.send({
    from: FROM_ADDRESS,
    to: email,
    subject: `Your IPOReady plan has been updated to ${planLabel[plan]}`,
    react: createElement(PlanUpgradeEmail, {
      name,
      companyName: company_name ?? 'your company',
      oldPlan:     planLabel[old_plan ?? 'starter'] ?? (old_plan ?? 'Starter'),
      newPlan:     planLabel[plan] ?? plan,
      billingCycle: 'Admin-assigned',
      amount:       '—',
      nextBillingDate: '—',
      manageUrl:   `${APP_URL}/account?tab=billing`,
    }),
  }).catch(err => console.error('[admin/plan] email failed:', err))

  return NextResponse.json({ ok: true, userId, plan })
}
