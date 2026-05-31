import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { sendEmail } from '@/lib/email-service'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

/**
 * Generate a unique pilot code (e.g., PILOT-XXXX-XXXX)
 */
function generatePilotCode(): string {
  const part1 = crypto.randomBytes(2).toString('hex').toUpperCase().slice(0, 4)
  const part2 = crypto.randomBytes(2).toString('hex').toUpperCase().slice(0, 4)
  return `PILOT-${part1}-${part2}`
}

/**
 * Generate a temporary password for pilot account
 */
function generateTemporaryPassword(): string {
  return crypto.randomBytes(12).toString('hex')
}

interface PilotOnboardRequest {
  companyName: string
  sector: string
  stage: string
  targetExchange: string
  foundingYear: number
  teamSize: number
  ceoName: string
  ceoEmail: string
  ceoPhone: string
}

interface CountRow {
  count: string
}

interface CompanyRow {
  id: string
}

interface UserRow {
  id: string
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PilotOnboardRequest

    // Validate required fields
    const {
      companyName,
      sector,
      stage,
      targetExchange,
      foundingYear,
      teamSize,
      ceoName,
      ceoEmail,
      ceoPhone,
    } = body

    if (
      !companyName ||
      !sector ||
      !stage ||
      !targetExchange ||
      !foundingYear ||
      !teamSize ||
      !ceoName ||
      !ceoEmail ||
      !ceoPhone
    ) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(ceoEmail)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await sql`
      SELECT COUNT(*) AS count FROM users WHERE email = ${ceoEmail.toLowerCase()}
    ` as CountRow[]

    if (parseInt(existingUser[0]?.count ?? '0', 10) > 0) {
      return NextResponse.json(
        { error: 'Email already registered. Please use a different email or sign in.' },
        { status: 409 }
      )
    }

    const pilotCode = generatePilotCode()
    const tempPassword = generateTemporaryPassword()
    const hashedPassword = bcrypt.hashSync(tempPassword, 10)

    // Create company record with "Pilot" designation
    const companyResult = await sql`
      INSERT INTO companies (
        name,
        sector,
        listing_type,
        target_exchange,
        founded_year,
        team_size,
        pilot_code,
        pilot_badge,
        subscription_plan,
        created_at,
        updated_at
      ) VALUES (
        ${companyName},
        ${sector},
        ${stage},
        ${targetExchange},
        ${foundingYear},
        ${teamSize},
        ${pilotCode},
        true,
        'pilot',
        NOW(),
        NOW()
      )
      RETURNING id
    ` as CompanyRow[]

    if (companyResult.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create company record' },
        { status: 500 }
      )
    }

    const companyId = companyResult[0].id

    // Create user account for CEO
    const userResult = await sql`
      INSERT INTO users (
        email,
        name,
        password,
        phone,
        role,
        company_id,
        is_approved,
        is_active,
        created_at,
        updated_at
      ) VALUES (
        ${ceoEmail.toLowerCase()},
        ${ceoName},
        ${hashedPassword},
        ${ceoPhone},
        'ceo',
        ${companyId},
        true,
        true,
        NOW(),
        NOW()
      )
      RETURNING id
    ` as UserRow[]

    if (userResult.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      )
    }

    const userId = userResult[0].id

    // Log to audit_logs for compliance tracking
    await sql`
      INSERT INTO audit_logs (
        user_id,
        company_id,
        action,
        resource_type,
        details,
        ip_address,
        user_agent,
        created_at
      ) VALUES (
        ${userId},
        ${companyId},
        'pilot_signup',
        'company',
        ${JSON.stringify({
          companyName,
          sector,
          stage,
          targetExchange,
          pilotCode,
        })},
        ${request.headers.get('x-forwarded-for') || request.headers.get('cf-connecting-ip') || 'unknown'},
        ${request.headers.get('user-agent') || 'unknown'},
        NOW()
      )
    `

    // Send onboarding email
    try {
      await sendEmail({
        to: ceoEmail,
        templateId: 'welcome',
        variables: {
          name: ceoName,
          companyName,
          email: ceoEmail,
          temporaryPassword: tempPassword,
          pilotCode,
          loginUrl: `${process.env.NEXTAUTH_URL}/auth/signin`,
          dashboardUrl: `${process.env.NEXTAUTH_URL}/dashboard`,
        },
      })
    } catch (emailError) {
      console.error('[pilot-onboard] Failed to send welcome email:', emailError)
      // Non-blocking: email failure doesn't prevent account creation
    }

    // Return success response with pilot code
    return NextResponse.json(
      {
        success: true,
        pilotCode,
        message: `Welcome to IPOReady! A welcome email has been sent to ${ceoEmail} with your login credentials.`,
        companyId,
        userId,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[pilot-onboard] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to process pilot onboarding',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
