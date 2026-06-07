import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

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

    // Log demo booking request
    console.log('📋 NEW DEMO BOOKING REQUEST')
    console.log('═'.repeat(50))
    console.log(`Name: ${body.name}`)
    console.log(`Email: ${body.email}`)
    console.log(`Company: ${body.company}`)
    console.log(`Role: ${body.role}`)
    console.log(`Country: ${body.country}`)
    if (body.comments) {
      console.log(`Comments: ${body.comments}`)
    }
    console.log(`Timestamp: ${new Date().toISOString()}`)
    console.log('═'.repeat(50))

    // Send confirmation email to user
    const userEmailResult = await resend.emails.send({
      from: 'demo@ipoready.ai',
      to: body.email,
      subject: 'Demo Request Received - IPOReady',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1A1A1A;">Thank you for your interest in IPOReady!</h2>
          <p style="color: #666;">Hi ${body.name},</p>
          <p style="color: #666;">We've received your demo request and will be in touch shortly. Our team will schedule a personalized walkthrough of IPOReady tailored to your IPO timeline.</p>

          <div style="background: #F7F6F4; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <h3 style="color: #1A1A1A; margin-top: 0;">Your Information:</h3>
            <p style="margin: 8px 0; color: #666;"><strong>Name:</strong> ${body.name}</p>
            <p style="margin: 8px 0; color: #666;"><strong>Company:</strong> ${body.company}</p>
            <p style="margin: 8px 0; color: #666;"><strong>Role:</strong> ${body.role}</p>
            <p style="margin: 8px 0; color: #666;"><strong>Country:</strong> ${body.country}</p>
            ${body.comments ? `<p style="margin: 8px 0; color: #666;"><strong>Comments:</strong> ${body.comments}</p>` : ''}
          </div>

          <p style="color: #666;">If you have any questions in the meantime, feel free to reach out to <a href="mailto:ceo@theupcapital.com" style="color: #E8312A; text-decoration: none;">ceo@theupcapital.com</a>.</p>

          <p style="color: #999; font-size: 12px; margin-top: 20px; border-top: 1px solid #E5E4E0; padding-top: 20px;">
            © 2026 IPOReady. The IPO Operating System for Canada & US Listings.
          </p>
        </div>
      `
    })

    // Send notification email to sales team
    const salesEmailResult = await resend.emails.send({
      from: 'demo@ipoready.ai',
      to: 'ceo@theupcapital.com',
      subject: `New Demo Request: ${body.name} from ${body.company}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1A1A1A;">🎯 New Demo Request</h2>
          <p style="color: #666;">A new demo request has been submitted:</p>

          <div style="background: #F7F6F4; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 8px 0; color: #666;"><strong>Name:</strong> ${body.name}</p>
            <p style="margin: 8px 0; color: #666;"><strong>Email:</strong> <a href="mailto:${body.email}" style="color: #E8312A; text-decoration: none;">${body.email}</a></p>
            <p style="margin: 8px 0; color: #666;"><strong>Company:</strong> ${body.company}</p>
            <p style="margin: 8px 0; color: #666;"><strong>Role:</strong> ${body.role}</p>
            <p style="margin: 8px 0; color: #666;"><strong>Country:</strong> ${body.country}</p>
            ${body.comments ? `<p style="margin: 8px 0; color: #666;"><strong>Comments:</strong> ${body.comments}</p>` : ''}
            <p style="margin: 8px 0; color: #999; font-size: 12px;"><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
          </div>

          <p style="color: #666;"><a href="mailto:${body.email}" style="display: inline-block; padding: 10px 20px; background: #E8312A; color: white; text-decoration: none; border-radius: 6px;">Reply to ${body.name}</a></p>
        </div>
      `
    })

    // Check if both emails were sent successfully
    if (userEmailResult.error || salesEmailResult.error) {
      console.error('Email sending errors:', { userEmailResult, salesEmailResult })
      // Still return success to user since request was recorded
      return NextResponse.json(
        { success: true, message: 'Demo request submitted successfully', warning: 'Email delivery may be delayed' },
        { status: 200 }
      )
    }

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
