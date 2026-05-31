import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id
  if (!userId) return NextResponse.json({ error: 'No user ID in session' }, { status: 400 })

  const body = await req.json()
  const { name, jobTitle, linkedin } = body as { name?: string; jobTitle?: string; linkedin?: string }

  if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

  await sql`
    UPDATE users
    SET
      name       = ${name.trim()},
      job_title  = ${jobTitle?.trim() ?? null},
      linkedin   = ${linkedin?.trim() ?? null},
      updated_at = NOW()
    WHERE id = ${userId}
  `

  return NextResponse.json({ ok: true })
}
