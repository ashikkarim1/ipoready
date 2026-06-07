import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

interface DemoBookingRequest {
  name: string
  email: string
  company: string
  role: string
  country: string
  comments: string
}

export async function POST(request: NextRequest) {
  try {
    const body: DemoBookingRequest = await request.json()

    // Validate required fields
    if (!body.name || !body.email || !body.company || !body.role || !body.country) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    })

    // Email content
    const emailContent = `
<html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background-color: #E8312A; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
      .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #e0e0e0; }
      .field { margin: 15px 0; }
      .label { font-weight: bold; color: #1A1A1A; }
      .value { color: #666; margin-top: 5px; }
      .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #999; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h2 style="margin: 0;">New Demo Booking Request</h2>
      </div>
      <div class="content">
        <div class="field">
          <div class="label">Name</div>
          <div class="value">${escapeHtml(body.name)}</div>
        </div>
        <div class="field">
          <div class="label">Email</div>
          <div class="value"><a href="mailto:${escapeHtml(body.email)}">${escapeHtml(body.email)}</a></div>
        </div>
        <div class="field">
          <div class="label">Company</div>
          <div class="value">${escapeHtml(body.company)}</div>
        </div>
        <div class="field">
          <div class="label">Role</div>
          <div class="value">${escapeHtml(body.role)}</div>
        </div>
        <div class="field">
          <div class="label">Country</div>
          <div class="value">${escapeHtml(body.country)}</div>
        </div>
        ${body.comments ? `
        <div class="field">
          <div class="label">Comments</div>
          <div class="value">${escapeHtml(body.comments).replace(/\n/g, '<br>')}</div>
        </div>
        ` : ''}
        <div class="footer">
          <p>This is an automated message from IPOReady demo booking system.</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
        </div>
      </div>
    </div>
  </body>
</html>
    `

    // Send email
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@ipoready.ai',
      to: 'ceo@theupcapital.com',
      subject: `New Demo Request: ${body.company} - ${body.name}`,
      html: emailContent,
      replyTo: body.email
    })

    // Send confirmation email to user
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@ipoready.ai',
      to: body.email,
      subject: 'Demo Request Received - IPOReady',
      html: `
<html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background-color: #E8312A; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
      .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #e0e0e0; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h2 style="margin: 0;">Thank You!</h2>
      </div>
      <div class="content">
        <p>Hi ${escapeHtml(body.name)},</p>
        <p>We've received your demo request for <strong>${escapeHtml(body.company)}</strong>.</p>
        <p>Our team will review your information and reach out within 24 hours to schedule your personalized demo.</p>
        <p>In the meantime, feel free to explore IPOReady at <a href="https://ipoready.ai">ipoready.ai</a>.</p>
        <p>Best regards,<br>The IPOReady Team</p>
      </div>
    </div>
  </body>
</html>
      `
    })

    return NextResponse.json(
      { success: true, message: 'Demo request submitted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Demo booking error:', error)
    return NextResponse.json(
      { error: 'Failed to process demo request' },
      { status: 500 }
    )
  }
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return text.replace(/[&<>"']/g, m => map[m])
}
