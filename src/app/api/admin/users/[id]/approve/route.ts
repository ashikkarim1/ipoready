import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== 'system_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { approved } = await req.json() as { approved: boolean }
  const userId = params.id

  await sql`UPDATE users SET is_approved = ${approved} WHERE id = ${userId}`

  return NextResponse.json({ ok: true, userId, approved })
}
