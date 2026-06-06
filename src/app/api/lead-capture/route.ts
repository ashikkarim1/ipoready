import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { resend, FROM_ADDRESS } from '@/lib/resend'
import { sendLeadConfirmationEmail } from '@/lib/email-service'

export const dynamic = 'force-dynamic'
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

    // Send notification email to CEO
    try {
      await resend.emails.send({
        from: FROM_ADDRESS,
        to: 'ceo@theupcapital.com',
        subject: `🎯 New Lead Captured: ${company_name}`,
        html: `
          <h2>New Lead Captured</h2>
          <p><strong>Name:</strong> ${full_name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Company:</strong> ${company_name}</p>
          <p><strong>Target Exchange:</strong> ${listing_exchange_target}</p>
          ${job_title ? `<p><strong>Job Title:</strong> ${job_title}</p>` : ''}
          <p><strong>Lead ID:</strong> ${leadId}</p>
          <p><small>View all leads: <a href="${process.env.NEXTAUTH_URL}/admin/leads">Admin Dashboard</a></small></p>
        `,
      })
    } catch (emailError) {
      console.error('[lead-capture] Failed to send CEO notification:', emailError)
      // Don't fail the request if email sending fails
    }

    // Send confirmation email to user (fire and forget)
    sendLeadConfirmationEmail({
      name: full_name,
      email: normalizedEmail,
      companyName: company_name,
      trialDays: 14,
    }).catch(err => console.error('[lead-capture] Failed to send user confirmation:', err))

    return NextResponse.json({
      success: true,
      message: `Welcome, ${full_name.split(' ')[0]}!`,
      leadId,
      redirect: '/trial/cap-table-setup',
    }, { status: 201 })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error('[lead-capture POST]', errorMessage, err)
    return NextResponse.json({
      error: 'Failed to capture lead',
      details: errorMessage
    }, { status: 500 })
  }
}
