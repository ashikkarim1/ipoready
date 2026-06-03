/**
 * Corporate Resolution Generator
 * Generates board resolutions for IPO compliance
 * Supports: prospectus_approval, listing_approval, underwriting_authorization, material_contracts
 */

import { sql } from './db'
import { Document as DocxDocument, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx'
import PDFDocument from 'pdfkit'
import { Readable } from 'stream'

export type ResolutionType = 'prospectus_approval' | 'listing_approval' | 'underwriting_authorization' | 'material_contracts'

export interface ResolutionFormData {
  resolutionType: ResolutionType
  companyName: string
  approvalDate: string // YYYY-MM-DD
  boardMembers: string[] // Array of names
  exchange?: string // For listing_approval
  prospectusDetails?: {
    prospectusTitle?: string
    filingJurisdictions?: string[]
    reviewedDate?: string
  }
  listingDetails?: {
    targetExchange?: string
    expectedListingDate?: string
    listedSecurities?: string
  }
  underwritingDetails?: {
    underwriterName?: string
    offeringSize?: string
    offeringType?: string
    underwritingCommission?: string
  }
  contractDetails?: {
    contractDescription?: string
    counterpartyName?: string
    contractValue?: string
    contractTerm?: string
  }
}

export interface ResolutionGeneratorResult {
  success: boolean
  resolutionId?: string
  documentTitle?: string
  htmlContent?: string
  errors?: string[]
  warnings?: string[]
}

interface DocxParagraph {
  text?: string
  heading?: typeof HeadingLevel
  alignment?: typeof AlignmentType
  children?: DocxParagraph[]
  spacing?: { before?: number; after?: number }
}

/**
 * Generate a corporate board resolution
 */
export async function generateBoardResolution(
  companyId: string,
  userId: string,
  formData: ResolutionFormData
): Promise<ResolutionGeneratorResult> {
  try {
    // 1. Validate input
    const validation = validateResolutionData(formData)
    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors,
      }
    }

    // 2. Generate resolution text
    const resolutionText = generateResolutionText(formData)
    if (!resolutionText.success || !resolutionText.content) {
      return {
        success: false,
        errors: resolutionText.errors,
      }
    }

    // 3. Create HTML version
    const htmlContent = convertToHtml(resolutionText.content)

    // 4. Store in database
    const result = await sql`
      INSERT INTO board_resolutions (
        company_id,
        user_id,
        resolution_type,
        company_name,
        approval_date,
        board_members,
        html_content,
        document_title
      ) VALUES (
        ${companyId},
        ${userId},
        ${formData.resolutionType},
        ${formData.companyName},
        ${formData.approvalDate},
        ${JSON.stringify(formData.boardMembers)},
        ${htmlContent},
        ${generateDocumentTitle(formData)}
      )
      RETURNING id, created_at
    `

    if (result.length === 0) {
      return {
        success: false,
        errors: ['Failed to store resolution in database'],
      }
    }

    const resolutionId = result[0].id

    // 5. Create approval tracking records
    await createApprovalRecords(resolutionId, formData.boardMembers)

    return {
      success: true,
      resolutionId,
      documentTitle: generateDocumentTitle(formData),
      htmlContent,
    }
  } catch (error) {
    console.error('Resolution generation error:', error)
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown error during resolution generation'],
    }
  }
}

/**
 * Validate resolution form data
 */
function validateResolutionData(formData: ResolutionFormData): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!formData.companyName?.trim()) {
    errors.push('Company name is required')
  }

  if (!formData.approvalDate) {
    errors.push('Approval date is required')
  }

  if (!Array.isArray(formData.boardMembers) || formData.boardMembers.length === 0) {
    errors.push('At least one board member is required')
  }

  if (formData.boardMembers.some(member => !member.trim())) {
    errors.push('All board member names must be non-empty')
  }

  if (['prospectus_approval', 'listing_approval', 'underwriting_authorization', 'material_contracts'].indexOf(formData.resolutionType) === -1) {
    errors.push('Invalid resolution type')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Generate resolution text based on type and form data
 */
function generateResolutionText(formData: ResolutionFormData): { success: boolean; content?: string; errors?: string[] } {
  const boardList = formData.boardMembers.join(', ')
  
  const templates: Record<ResolutionType, (data: ResolutionFormData) => string> = {
    prospectus_approval: (data) => `BOARD RESOLUTION - PROSPECTUS APPROVAL

Date: ${formatDate(data.approvalDate)}

WHEREAS, ${data.companyName} (the "Company") has determined to proceed with a prospectus filing with applicable securities regulators in the provinces of Canada or applicable jurisdictions;

WHEREAS, the Board of Directors has reviewed the prospectus prepared by management and legal counsel, including all financial statements, disclosure documents, and regulatory compliance materials;

WHEREAS, the Board of Directors believes the prospectus contains full, true and plain disclosure of all material facts relating to the Company as required under applicable securities laws;

NOW BE IT RESOLVED THAT:

1. The prospectus in the form presented to this Board is hereby approved and authorized for filing with all applicable securities regulatory authorities.

2. The officers of the Company, including the Chief Executive Officer and Chief Financial Officer, are hereby authorized and directed to file the prospectus with all applicable securities commissions and stock exchange authorities.

3. The officers of the Company are hereby authorized to execute, on behalf of the Company, all documents, certificates, and acknowledgments necessary or desirable in connection with the filing of the prospectus.

4. The officers of the Company are authorized to negotiate, finalize, and execute all necessary agreements with underwriters, counsel, auditors, and other advisors in connection with the prospectus filing.

5. Any officer of the Company is authorized to determine and certify the final form of the prospectus prior to filing, subject to such changes as may be approved by counsel.

Board Members Present: ${boardList}

This resolution was passed on this ${formatDate(data.approvalDate)} by the Board of Directors of ${data.companyName}.

LEGAL CERTIFICATION:
The Board of Directors, having reviewed the prospectus and the business of the Company, certifies that the prospectus contains accurate, complete, and not misleading information regarding all material aspects of the Company's business, financial condition, and prospects. The Board confirms that management has disclosed all material risks and uncertainties known to the Company as of the date hereof.`,

    listing_approval: (data) => `BOARD RESOLUTION - LISTING APPROVAL

Date: ${formatDate(data.approvalDate)}

WHEREAS, ${data.companyName} (the "Company") has determined to apply for listing of its shares on ${data.listingDetails?.targetExchange || '[EXCHANGE TO BE SPECIFIED]'};

WHEREAS, the Board of Directors believes that listing on ${data.listingDetails?.targetExchange || 'such exchange'} will provide the Company with enhanced visibility, liquidity, and access to capital markets;

WHEREAS, the Board of Directors has reviewed the listing requirements, fees, and ongoing compliance obligations of ${data.listingDetails?.targetExchange || 'such exchange'} and determined that compliance is feasible and in the best interests of the Company;

NOW BE IT RESOLVED THAT:

1. The listing of the Company's shares on ${data.listingDetails?.targetExchange || '[EXCHANGE]'} is hereby approved in principle.

2. Management is authorized to prepare and submit all necessary listing applications, documentation, and disclosure materials to ${data.listingDetails?.targetExchange || '[EXCHANGE]'}.

3. The officers of the Company are authorized to negotiate with the exchange, underwriters, and legal advisors regarding all listing terms and conditions.

4. The Company commits to comply with all continuing listing standards and requirements of ${data.listingDetails?.targetExchange || '[EXCHANGE]'}, including governance, disclosure, and financial reporting requirements.

5. The officers of the Company are authorized to take all necessary actions to effect the listing, including executing all required agreements and certifications.

6. The Company will establish and maintain appropriate compliance and disclosure procedures to ensure ongoing adherence to listing requirements.

Board Members Present: ${boardList}

This resolution was passed on this ${formatDate(data.approvalDate)} by the Board of Directors of ${data.companyName}.

LEGAL CERTIFICATION:
The Board of Directors certifies that the Company has the organizational authority and financial capability to meet all listing requirements of ${data.listingDetails?.targetExchange || '[EXCHANGE]'} and commits to implementing governance practices consistent with exchange standards.`,

    underwriting_authorization: (data) => `BOARD RESOLUTION - UNDERWRITING AUTHORIZATION

Date: ${formatDate(data.approvalDate)}

WHEREAS, ${data.companyName} (the "Company") is undertaking a public offering of its securities;

WHEREAS, the Company proposes to engage ${data.underwritingDetails?.underwriterName || '[UNDERWRITER NAME]'} and such other underwriters as management may determine (collectively, the "Underwriters") to manage and underwrite the public offering;

WHEREAS, the Board of Directors has reviewed the proposed offering structure, underwriting terms, and compensation arrangements;

WHEREAS, the Board believes that engagement of qualified underwriters is necessary and appropriate for the successful execution of the public offering;

NOW BE IT RESOLVED THAT:

1. The engagement of ${data.underwritingDetails?.underwriterName || '[UNDERWRITER(S)]'} as the lead underwriter and such additional underwriters as management determines is hereby approved.

2. The officers of the Company are authorized to negotiate and finalize the underwriting agreement with the Underwriters, including terms relating to:
   a) The amount and type of securities to be offered (${data.underwritingDetails?.offeringSize || '[OFFERING SIZE]'});
   b) The offering price per security;
   c) The underwriting compensation (${data.underwritingDetails?.underwritingCommission || '[COMMISSION RATE]'});
   d) The closing date and settlement terms;
   e) Any lock-up provisions or other conditions.

3. The Chief Executive Officer and Chief Financial Officer are authorized to execute the underwriting agreement on behalf of the Company.

4. The Company agrees to provide the Underwriters with all information and assistance necessary to prepare and file the prospectus and other offering documents.

5. The officers are authorized to take all necessary actions to effect the offering, including executing comfort letters, legal opinions, and other required documentation.

6. The officers are authorized to determine and approve the final terms of the offering subject to Board ratification if material changes are required.

Board Members Present: ${boardList}

This resolution was passed on this ${formatDate(data.approvalDate)} by the Board of Directors of ${data.companyName}.

LEGAL CERTIFICATION:
The Board of Directors certifies that it has reviewed the proposed underwriting arrangements and determined that the terms are fair and reasonable to the Company and its shareholders. The Board acknowledges its understanding of the underwriters' role and obligations under securities laws.`,

    material_contracts: (data) => `BOARD RESOLUTION - MATERIAL CONTRACT APPROVAL

Date: ${formatDate(data.approvalDate)}

WHEREAS, ${data.companyName} (the "Company") has negotiated a material contract described as: "${data.contractDetails?.contractDescription || '[CONTRACT DESCRIPTION]'}";

WHEREAS, the counterparty to the contract is ${data.contractDetails?.counterpartyName || '[COUNTERPARTY NAME]'};

WHEREAS, the estimated value or significance of the contract is ${data.contractDetails?.contractValue || '[CONTRACT VALUE]'};

WHEREAS, the contract term is ${data.contractDetails?.contractTerm || '[CONTRACT TERM]'};

WHEREAS, the Board of Directors has reviewed the contract terms, conditions, and all material provisions;

WHEREAS, the Board of Directors has determined that the contract is in the best interests of the Company and its shareholders;

NOW BE IT RESOLVED THAT:

1. The material contract with ${data.contractDetails?.counterpartyName || '[COUNTERPARTY NAME]'} is hereby approved and ratified.

2. The Chief Executive Officer is authorized to execute the contract on behalf of the Company.

3. The officers of the Company are authorized to negotiate and finalize any remaining terms and conditions, provided that no material changes are made without Board approval.

4. The contract terms as presented are acceptable to the Board of Directors.

5. The officers are authorized to take all necessary actions to perform the Company's obligations under the contract.

6. The contract shall be filed with the Company's corporate records and disclosed as required under applicable securities laws.

Board Members Present: ${boardList}

This resolution was passed on this ${formatDate(data.approvalDate)} by the Board of Directors of ${data.companyName}.

LEGAL CERTIFICATION:
The Board of Directors, having reviewed all material terms and conditions of the contract, certifies that the contract is fair and reasonable and in the best interests of the Company and its shareholders. The Board acknowledges understanding all material implications and contingencies of the contract.`,
  }

  const generator = templates[formData.resolutionType]
  if (!generator) {
    return {
      success: false,
      errors: ['Unknown resolution type'],
    }
  }

  return {
    success: true,
    content: generator(formData),
  }
}

/**
 * Convert resolution text to HTML for storage and editing
 */
function convertToHtml(text: string): string {
  return `<div class="resolution-document">
${text
  .split('\n')
  .map((line, idx) => {
    if (line.match(/^[A-Z\s\-]+$/) && line.length > 5) {
      return `<h2 class="resolution-heading">${escapeHtml(line)}</h2>`
    }
    if (line.match(/^WHEREAS|^NOW BE IT RESOLVED|^Board Members|^This resolution|^LEGAL CERTIFICATION/)) {
      return `<p class="resolution-paragraph"><strong>${escapeHtml(line)}</strong></p>`
    }
    if (line.match(/^\d+\./)) {
      return `<p class="resolution-item">${escapeHtml(line)}</p>`
    }
    if (line.trim() === '') {
      return '<p></p>'
    }
    return `<p class="resolution-text">${escapeHtml(line)}</p>`
  })
  .join('\n')}
</div>`
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, char => map[char])
}

/**
 * Generate document title
 */
function generateDocumentTitle(formData: ResolutionFormData): string {
  const typeMap: Record<ResolutionType, string> = {
    prospectus_approval: 'Prospectus Approval Resolution',
    listing_approval: 'Listing Approval Resolution',
    underwriting_authorization: 'Underwriting Authorization Resolution',
    material_contracts: 'Material Contract Approval Resolution',
  }

  return `${formData.companyName} - ${typeMap[formData.resolutionType]} - ${formData.approvalDate}`
}

/**
 * Format date for display
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
  return date.toLocaleDateString('en-CA', options)
}

/**
 * Create approval tracking records for board members
 */
async function createApprovalRecords(resolutionId: string, boardMembers: string[]): Promise<void> {
  for (const memberName of boardMembers) {
    await sql`
      INSERT INTO resolution_approvals (resolution_id, board_member_name, approval_status)
      VALUES (${resolutionId}, ${memberName}, 'pending')
    `
  }
}

/**
 * Generate DOCX document from resolution
 */
export async function generateResolutionDocx(
  htmlContent: string,
  documentTitle: string,
  resolutionText: string
): Promise<Buffer> {
  const doc = new DocxDocument({
    sections: [
      {
        children: [
          new Paragraph({
            text: documentTitle,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          ...resolutionText.split('\n').map(line => {
            if (line.match(/^[A-Z\s\-]+$/) && line.length > 5) {
              return new Paragraph({
                text: line,
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 200 },
              })
            }
            if (line.match(/^WHEREAS|^NOW BE IT RESOLVED|^LEGAL CERTIFICATION/)) {
              return new Paragraph({
                children: [
                  new TextRun({
                    text: line,
                    bold: true,
                  }),
                ],
                spacing: { before: 100, after: 100 },
              })
            }
            if (line.trim() === '') {
              return new Paragraph({ text: '' })
            }
            return new Paragraph({
              text: line,
              spacing: { after: 100 },
            })
          }),
        ],
      },
    ],
  })

  return new Promise((resolve, reject) => {
    Packer.toBuffer(doc)
      .then(buffer => {
        resolve(buffer)
      })
      .catch(reject)
  })
}

/**
 * Generate PDF document from resolution
 */
export async function generateResolutionPdf(
  documentTitle: string,
  resolutionText: string
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const buffers: Buffer[] = []
    const doc = new PDFDocument({
      size: 'LETTER',
      margin: 72,
    })

    doc.on('data', chunk => buffers.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(buffers)))
    doc.on('error', reject)

    // Title
    doc.fontSize(16).font('Helvetica-Bold').text(documentTitle, { align: 'center' })
    doc.moveDown()

    // Content
    doc.fontSize(11).font('Helvetica')
    const lines = resolutionText.split('\n')
    for (const line of lines) {
      if (line.match(/^[A-Z\s\-]+$/) && line.length > 5) {
        doc.fontSize(13).font('Helvetica-Bold').text(line)
        doc.moveDown(0.3)
      } else if (line.match(/^WHEREAS|^NOW BE IT RESOLVED|^LEGAL CERTIFICATION/)) {
        doc.fontSize(11).font('Helvetica-Bold').text(line)
        doc.moveDown(0.2)
      } else if (line.trim() === '') {
        doc.moveDown(0.2)
      } else {
        doc.fontSize(11).font('Helvetica').text(line, { align: 'left' })
        doc.moveDown(0.15)
      }
    }

    doc.end()
  })
}

/**
 * Get required resolutions for an exchange
 */
export async function getRequiredResolutions(exchange: string): Promise<ResolutionType[]> {
  const result = await sql`
    SELECT resolution_type
    FROM exchange_resolution_requirements
    WHERE exchange = ${exchange} AND is_required = true
  `

  return result.map(row => row.resolution_type as ResolutionType)
}
