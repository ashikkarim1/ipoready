import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

/**
 * GET /api/lead-capture/check-email?email=X
 * Real-time email validation for the lead capture form
 * Returns { exists: boolean }
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = new URL(req.url).searchParams
    const email = searchParams.get('email')

    if (!email || !email.trim()) {
      return NextResponse.json({ error: 'Email parameter required' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check both lead_captures and users tables
    const leadExists = await sql`
      SELECT id FROM lead_captures WHERE email = ${normalizedEmail} LIMIT 1
    `

    const userExists = await sql`
      SELECT id FROM users WHERE email = ${normalizedEmail} LIMIT 1
    `

    const exists = leadExists.length > 0 || userExists.length > 0

    return NextResponse.json({ exists })
  } catch (err) {
    console.error('[lead-capture GET]', err)
    return NextResponse.json({ error: 'Failed to check email' }, { status: 500 })
  }
}

/**
 * POST /api/lead-capture
 * Capture mandatory lead information before trial access
 * Required fields: full_name, email, company_name, listing_exchange_target
 * Optional: job_title
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      full_name,
      email,
      company_name,
      listing_exchange_target,
      job_title,
    } = body

    // Validation
    const errors: Record<string, string> = {}

    if (!full_name || full_name.trim().length < 2 || full_name.trim().length > 100) {
      errors.full_name = 'Full name must be 2-100 characters'
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Valid email required'
    }

    if (!company_name || company_name.trim().length < 2 || company_name.trim().length > 100) {
      errors.company_name = 'Company name must be 2-100 characters'
    }

    if (!listing_exchange_target || !['TSX', 'NASDAQ', 'NYSE', 'TSXV', 'CSE', 'OTC', 'JSE', 'Other'].includes(listing_exchange_target)) {
      errors.listing_exchange_target = 'Valid exchange required'
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check for duplicate email
    const existing = await sql`
      SELECT id, status FROM lead_captures WHERE email = ${normalizedEmail} LIMIT 1
    `

    if (existing.length > 0) {
      // Email already captured or converted
      const existingLead = existing[0] as any
      if (existingLead.status === 'converted_to_user') {
        return NextResponse.json({
          success: false,
          message: 'An account with this email already exists. Please log in.',
          redirect: '/login',
        }, { status: 409 })
      }
      // Re-capture with updated info
    }

    // Get IP and user agent for tracking
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || ''
    const userAgent = req.headers.get('user-agent') || ''

    // Insert or update lead capture
    const result = await sql`
      INSERT INTO lead_captures
        (email, full_name, company_name, listing_exchange_target, job_title, ip_address, user_agent, status)
      VALUES
        (${normalizedEmail}, ${full_name.trim()}, ${company_name.trim()}, ${listing_exchange_target}, ${job_title?.trim() || null}, ${ip}, ${userAgent}, 'captured')
      ON CONFLICT (email) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        company_name = EXCLUDED.company_name,
        listing_exchange_target = EXCLUDED.listing_exchange_target,
        job_title = EXCLUDED.job_title,
        ip_address = EXCLUDED.ip_address,
        user_agent = EXCLUDED.user_agent,
        updated_at = NOW()
      RETURNING id
    `

    const leadId = (result[0] as any).id as string

    return NextResponse.json({
      success: true,
      message: `Welcome, ${full_name.split(' ')[0]}!`,
      leadId,
      redirect: '/trial/cap-table-setup',
    }, { status: 201 })
  } catch (err) {
    console.error('[lead-capture POST]', err)
    return NextResponse.json({ error: 'Failed to capture lead' }, { status: 500 })
  }
}
