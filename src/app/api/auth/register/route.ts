import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { sql } from '@/lib/db'
import { APP_URL } from '@/lib/resend'
import { sendWelcomeEmail } from '@/lib/email-service'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      name,
      email,
      password,
      role,
      companyName,
      listingType,
      targetExchange,
      currency,
      language,
      referralCode,
    } = body

    if (!name || !email || !password || !role || !companyName || !listingType || !targetExchange) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    // Check for existing account
    const existing = await sql`SELECT id FROM users WHERE email = ${email.toLowerCase().trim()}`
    if (existing.length > 0) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    // Create company first — owner_id will be updated after user insert
    const companyRows = await sql`
      INSERT INTO companies
        (name, listing_type, target_exchange, current_phase, currency, language, owner_id)
      VALUES
        (${companyName.trim()}, ${listingType}, ${targetExchange}, 'pre_planning',
         ${currency ?? 'CAD'}, ${language ?? 'en'},
         '00000000-0000-0000-0000-000000000000')
      RETURNING id
    `
    const companyId = (companyRows[0] as any).id as string

    // Create user
    const userRows = await sql`
      INSERT INTO users
        (email, name, password_hash, role, company_id, language, currency, is_approved)
      VALUES
        (${email.toLowerCase().trim()}, ${name.trim()}, ${passwordHash},
         ${role}, ${companyId}, ${language ?? 'en'}, ${currency ?? 'CAD'}, FALSE)
      RETURNING id
    `
    const userId = (userRows[0] as any).id as string

    // Set company owner to real user id
    await sql`UPDATE companies SET owner_id = ${userId} WHERE id = ${companyId}`

    // Add to team_members as owner
    await sql`
      INSERT INTO team_members (company_id, user_id, role, accepted_at)
      VALUES (${companyId}, ${userId}, ${role}, NOW())
    `

    // Capture referral if code was passed
    if (referralCode) {
      try {
        const referrerRows = await sql`SELECT id FROM users WHERE referral_code = ${referralCode} LIMIT 1`
        if (referrerRows.length > 0) {
          const referrerId = (referrerRows[0] as any).id as string
          // Update existing pending referral or insert new one
          const existingRef = await sql`
            SELECT id FROM referrals
            WHERE referrer_id = ${referrerId} AND referral_code = ${referralCode}
              AND (referred_email = ${email.toLowerCase().trim()} OR referred_email IS NULL)
            LIMIT 1
          `
          if (existingRef.length > 0) {
            await sql`
              UPDATE referrals
              SET referred_user_id = ${userId}, status = 'signed_up', updated_at = NOW()
              WHERE id = ${(existingRef[0] as any).id}
            `
          } else {
            await sql`
              INSERT INTO referrals (referrer_id, referral_code, referred_email, referred_user_id, company_name, status)
              VALUES (${referrerId}, ${referralCode}, ${email.toLowerCase().trim()}, ${userId}, ${companyName.trim()}, 'signed_up')
            `
          }
        }
      } catch (refErr) {
        console.error('[register] referral capture failed:', refErr)
      }
    }

    // Send welcome email — fire-and-forget (don't block registration on email failure)
    sendWelcomeEmail(userId, {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      companyName: companyName.trim(),
      exchange: targetExchange.toUpperCase(),
      loginUrl: `${APP_URL}/login`,
    }).catch(err => console.error('[register] welcome email failed:', err))

    return NextResponse.json({ success: true, userId, companyId }, { status: 201 })
  } catch (err) {
    console.error('[auth/register]', err)
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 })
  }
}
