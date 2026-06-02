import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'

interface DemoSubmission {
  company: string
  email: string
  contactName: string
  role: string
}

export async function POST(request: NextRequest) {
  try {
    // Lazy-load Resend client to avoid instantiation during build
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    const body: DemoSubmission = await request.json()

    // Validate required fields
    const { company, email, contactName, role } = body
    if (!company || !email || !contactName || !role) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Build email content
    const emailContent = `
New Demo Request from IPOReady Website

Company: ${company}
Contact Name: ${contactName}
Email: ${email}
Role: ${role}

Please follow up with this prospect within 24 hours.
    `.trim()

    // Send email to CEO
    const response = await resend.emails.send({
      from: process.env.RESEND_FROM_ADDRESS || 'noreply@ipoready.ai',
      to: 'ceo@theupcapital.com',
      cc: 'hello@ipoready.ai', // Optional: also notify support team
      subject: `Demo Request: ${company}`,
      text: emailContent,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a1a1a; margin-bottom: 24px;">New Demo Request from IPOReady</h2>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
            <p style="margin: 0 0 12px 0;"><strong style="color: #666;">Company:</strong> ${company}</p>
            <p style="margin: 0 0 12px 0;"><strong style="color: #666;">Contact Name:</strong> ${contactName}</p>
            <p style="margin: 0 0 12px 0;"><strong style="color: #666;">Email:</strong> <a href="mailto:${email}" style="color: #E8312A; text-decoration: none;">${email}</a></p>
            <p style="margin: 0;"><strong style="color: #666;">Role:</strong> ${role}</p>
          </div>
          
          <p style="color: #666; font-size: 14px; margin: 0;">Please follow up with this prospect within 24 hours.</p>
        </div>
      `,
    })

    if (response.error) {
      console.error('Resend error:', response.error)
      return NextResponse.json(
        { message: 'Failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Demo request submitted successfully', id: response.data?.id },
      { status: 200 }
    )
  } catch (error) {
    console.error('Demo submission error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
