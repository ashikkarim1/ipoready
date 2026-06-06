/**
 * Generate Consent Request Letter
 * POST /api/compliance/consents/generate
 *
 * Generates a consent request letter template based on entity type and exchange requirements
 * Returns HTML/PDF and email draft
 */

import { sql } from '@/lib/db'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getExchangeConfig } from '@/lib/exchange-config'

export const dynamic = 'force-dynamic'
// ============================================================================
// Types
// ============================================================================

export interface GenerateConsentRequest {
  company_id: string
  entity_type: 'auditor' | 'lawyer' | 'valuation-expert' | 'environmental-expert' | 'other-expert'
  from_entity: string
  exchange: string
  format: 'html' | 'json' | 'email-draft'
}

export interface ConsentTemplate {
  subject: string
  greeting: string
  introduction: string
  requirements: string[]
  timeline: string
  closing: string
  signature_line: string
  html: string
}

// ============================================================================
// Consent Letter Templates
// ============================================================================

const CONSENT_TEMPLATES: Record<string, (company: any, exchange: string) => ConsentTemplate> = {
  auditor: (company: any, exchange: string) => ({
    subject: `Consent to Include Audited Financial Statements - IPO of ${company.legal_name}`,
    greeting: 'Dear Audit Partner:',
    introduction: `We are writing to request your consent to the inclusion of the audited financial statements of ${company.legal_name} (the "Company") in our prospectus relating to our proposed initial public offering (IPO) on the ${exchange.toUpperCase()} exchange.`,
    requirements: [
      'Confirmation that the audit was conducted in accordance with Canadian Generally Accepted Auditing Standards (CGAAS) or US Generally Accepted Auditing Standards (GAAS)',
      'Confirmation that there have been no changes to the auditors or scope of audit since the last audit',
      'Written consent to the inclusion of the financial statements and your audit opinion',
      'Confirmation that you have not withdrawn your audit opinion',
      'Acknowledgment that you have reviewed the prospectus to the extent necessary for your consent',
    ],
    timeline: 'We require your consent no later than 5 business days prior to the filing of the final prospectus.',
    closing: `Please confirm your consent by signing and returning this letter. If you have any questions or concerns, please contact the undersigned immediately.`,
    signature_line: 'Yours truly,',
    html: '',
  }),

  lawyer: (company: any, exchange: string) => ({
    subject: `Consent and Legal Opinion - IPO of ${company.legal_name}`,
    greeting: 'Dear Legal Counsel:',
    introduction: `We are writing to request your consent as legal counsel to ${company.legal_name} and your legal opinion regarding certain matters in connection with our proposed initial public offering (IPO) on the ${exchange.toUpperCase()} exchange.`,
    requirements: [
      'Legal opinion confirming valid incorporation and good standing of the Company',
      'Opinion on authority to conduct the IPO and issue securities',
      'Confirmation that all material contracts are in full force and effect',
      'Opinion on capitalization and authority of the cap table',
      'Confirmation of no undisclosed litigation or compliance issues',
      'Confirmation that disclosure in the prospectus is accurate and complete regarding legal matters',
    ],
    timeline: 'We require your legal opinion and consent no later than 3 business days prior to the filing of the final prospectus.',
    closing: `We appreciate your cooperation on this important transaction. Please confirm your consent and provide your legal opinion as outlined above.`,
    signature_line: 'Yours truly,',
    html: '',
  }),

  'valuation-expert': (company: any, exchange: string) => ({
    subject: `Consent to Expert Report - IPO of ${company.legal_name}`,
    greeting: 'Dear Valuation Expert:',
    introduction: `We are writing to request your consent to the inclusion of your valuation report as an expert report in our prospectus for the proposed initial public offering (IPO) of ${company.legal_name} on the ${exchange.toUpperCase()} exchange.`,
    requirements: [
      'Confirmation that you are an independent expert with no material conflicts of interest',
      'Confirmation that your valuation was conducted in accordance with relevant professional standards',
      'Written consent to include your report and your expert opinion in the prospectus',
      'Acknowledgment that you have reviewed the prospectus disclosure relating to your report',
      'Confirmation that the prospectus accurately summarizes your findings and conclusions',
    ],
    timeline: 'We require your consent no later than 5 business days prior to the filing of the final prospectus.',
    closing: `Your expertise is critical to our IPO process. Please confirm your consent and provide any requested clarifications regarding your report.`,
    signature_line: 'Yours truly,',
    html: '',
  }),

  'environmental-expert': (company: any, exchange: string) => ({
    subject: `Consent to Environmental Report - IPO of ${company.legal_name}`,
    greeting: 'Dear Environmental Consultant:',
    introduction: `We are writing to request your consent to the inclusion of your environmental assessment report in our prospectus for the proposed initial public offering (IPO) of ${company.legal_name} on the ${exchange.toUpperCase()} exchange.`,
    requirements: [
      'Confirmation that you are an independent environmental expert with relevant credentials',
      'Confirmation that the assessment was conducted in accordance with applicable environmental standards',
      'Written consent to include your report and conclusions in the prospectus',
      'Acknowledgment that you have reviewed prospectus disclosure relating to environmental matters',
      'Confirmation that all findings and risks are accurately disclosed in the prospectus',
    ],
    timeline: 'We require your consent no later than 5 business days prior to the filing of the final prospectus.',
    closing: `Thank you for your important contribution to our IPO documentation. Please confirm your consent at your earliest convenience.`,
    signature_line: 'Yours truly,',
    html: '',
  }),

  'other-expert': (company: any, exchange: string) => ({
    subject: `Expert Consent - IPO of ${company.legal_name}`,
    greeting: 'Dear Expert:',
    introduction: `We are writing to request your consent as an expert to the inclusion of your report and opinion in our prospectus for the proposed initial public offering (IPO) of ${company.legal_name} on the ${exchange.toUpperCase()} exchange.`,
    requirements: [
      'Confirmation that you are an independent expert with appropriate qualifications',
      'Written consent to the inclusion of your report and expert opinion in the prospectus',
      'Acknowledgment that you have reviewed the prospectus disclosure relating to your area of expertise',
      'Confirmation that the prospectus accurately reflects your findings and conclusions',
      'Confirmation that you have not modified or withdrawn your opinion',
    ],
    timeline: 'We require your consent no later than 5 business days prior to the filing of the final prospectus.',
    closing: `We appreciate your contribution to our IPO process. Please confirm your consent as soon as possible.`,
    signature_line: 'Yours truly,',
    html: '',
  }),
}

// ============================================================================
// Generate HTML/Email Template
// ============================================================================

function generateLetterHTML(template: ConsentTemplate, company: any): string {
  const date = new Date().toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const requirementsList = template.requirements.map((req) => `<li>${req}</li>`).join('\n    ')

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .header { margin-bottom: 30px; }
    .date { text-align: right; margin-bottom: 20px; }
    .content { max-width: 800px; }
    .requirements { margin: 20px 0; padding-left: 20px; }
    .signature { margin-top: 40px; }
    .footer { margin-top: 50px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <div class="date">${date}</div>
    <p>Attention: ${template.greeting}</p>
  </div>

  <div class="content">
    <p>${template.introduction}</p>

    <h3>Required Confirmations and Consents</h3>
    <ul class="requirements">
      ${requirementsList}
    </ul>

    <h3>Timeline</h3>
    <p>${template.timeline}</p>

    <p>${template.closing}</p>

    <div class="signature">
      <p>${template.signature_line}</p>
      <p style="margin-top: 60px;">_____________________________</p>
      <p>On behalf of ${company.legal_name}</p>
    </div>
  </div>

  <div class="footer">
    <p>This letter is prepared for the purposes of the IPO process and should be directed to the company's legal counsel or financial advisors.</p>
  </div>
</body>
</html>
  `.trim()
}

// ============================================================================
// POST: Generate consent request letter
// ============================================================================

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { company_id, entity_type, from_entity, exchange, format } = (await req.json()) as GenerateConsentRequest

    // Validate required fields
    if (!company_id || !entity_type || !from_entity || !exchange || !format) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get company details
    const company = await sql`
      SELECT id, legal_name, industry, headquarters_country
      FROM companies
      WHERE id = ${company_id} AND created_by = ${(session.user as any).id}
      LIMIT 1
    `

    if (!company || company.length === 0) {
      return NextResponse.json(
        { error: 'Company not found or unauthorized' },
        { status: 403 }
      )
    }

    // Validate exchange
    try {
      getExchangeConfig(exchange as any)
    } catch {
      return NextResponse.json(
        { error: 'Invalid exchange' },
        { status: 400 }
      )
    }

    // Get template
    const templateGenerator = CONSENT_TEMPLATES[entity_type]
    if (!templateGenerator) {
      return NextResponse.json(
        { error: 'Invalid entity_type' },
        { status: 400 }
      )
    }

    const template = templateGenerator(company[0], exchange)

    // Generate HTML
    template.html = generateLetterHTML(template, company[0])

    // Format response based on requested format
    let responseData: any = {
      template,
      company: company[0],
      exchange,
      entity_type,
      from_entity,
      generated_at: new Date().toISOString(),
    }

    if (format === 'email-draft') {
      responseData.email_draft = {
        to: from_entity,
        subject: template.subject,
        body: `Dear Sir/Madam,\n\n${template.introduction}\n\nPlease see the attached letter for the full details.\n\nBest regards,\n${company[0].legal_name}`,
        attachment: {
          filename: `Consent_Request_${entity_type.replace('-', '_')}_${new Date().getTime()}.html`,
          content: template.html,
          mime_type: 'text/html',
        },
      }
    }

    // Log audit event
    await sql`
      INSERT INTO audit_logs (user_id, action, details, ip_address)
      VALUES (
        ${(session.user as any).id},
        'consent_letter_generated',
        ${JSON.stringify({
          company_id,
          entity_type,
          from_entity,
          exchange,
          format,
        })},
        ${req.headers.get('x-forwarded-for') || 'unknown'}
      )
    `

    return NextResponse.json(responseData, { status: 200 })
  } catch (error) {
    console.error('Error generating consent letter:', error)
    return NextResponse.json(
      { error: 'Failed to generate consent letter' },
      { status: 500 }
    )
  }
}
