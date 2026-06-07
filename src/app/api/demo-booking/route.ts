import { NextRequest, NextResponse } from 'next/server'

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

    // Log demo booking request (production would send email via SendGrid or similar)
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

    // In production, integrate with SendGrid, Resend, or similar service
    // For now, just acknowledge the submission was successful
    // The demo booking data is logged to server for manual processing
    // or can be integrated with a webhook to send to email service

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
