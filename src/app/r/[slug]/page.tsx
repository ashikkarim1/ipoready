import { redirect } from 'next/navigation'
import { sql } from '@/lib/db'

// Track the click server-side then redirect to register with ?ref=slug
export default async function ReferralLandingPage({ params }: { params: { slug: string } }) {
  const { slug } = params

  // Validate code exists
  const rows = await sql`
    SELECT id, name FROM users WHERE referral_code = ${slug} LIMIT 1
  `

  if (rows.length === 0) {
    // Invalid code — redirect to register without ref
    redirect('/register')
  }

  // Record click in DB (best-effort)
  try {
    await sql`
      INSERT INTO referral_clicks (referral_code, created_at)
      VALUES (${slug}, NOW())
    `
  } catch {
    // Don't block redirect if tracking fails
  }

  // Redirect to register with ref param so registration flow can capture it
  redirect(`/register?ref=${encodeURIComponent(slug)}`)
}
