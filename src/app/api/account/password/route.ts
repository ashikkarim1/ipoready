import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id
  if (!userId) return NextResponse.json({ error: 'No user ID in session' }, { status: 400 })

  // Demo accounts — no password in DB, block change
  if (userId.startsWith('demo-')) {
    return NextResponse.json({ error: 'Password change is not available for demo accounts' }, { status: 403 })
  }

  const { currentPassword, newPassword } = await req.json() as { currentPassword: string; newPassword: string }

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Both fields are required' }, { status: 400 })
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 })
  }

  // Verify current password
  const rows = await sql`SELECT password_hash FROM users WHERE id = ${userId} LIMIT 1`
  if (rows.length === 0) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const valid = await bcrypt.compare(currentPassword, (rows[0] as any).password_hash)
  if (!valid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })

  const hash = await bcrypt.hash(newPassword, 12)
  await sql`UPDATE users SET password_hash = ${hash}, updated_at = NOW() WHERE id = ${userId}`

  return NextResponse.json({ ok: true })
}
