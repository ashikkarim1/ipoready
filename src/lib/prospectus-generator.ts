/**
 * Prospectus Auto-Builder Engine
 * Generates IPO prospectus documents from PACE workflow data
 * Supports DOCX and PDF output formats
 */

import { sql } from './db'
import { Readable } from 'stream'
import { Document as DocxDocument, Packer, Paragraph, TextRun, HeadingLevel, BorderStyle } from 'docx'
import PDFDocument from 'pdfkit'

export interface CompanyData {
  id: string
  name: string
  incorporation_date?: string
  incorporation_jurisdiction?: string
  business_structure?: string
  headquarters_address?: string
  description?: string
  business_focus_areas?: string
  products_services?: string
  industry_sector?: string
  market_size?: string
  market_growth?: string
  team_size?: number
  founders?: Array<{ name: string; age?: number; role: string; bio?: string }>
  executives?: Array<{ name: string; title: string; age?: number; start_date?: string; bio?: string }>
  financial_data?: {
    revenue_current?: string
    revenue_prior_1?: string
    revenue_prior_2?: string
    total_assets?: string
    total_liabilities?: string
    equity?: string
    cash_position?: string
  }
  risks?: string[]
  use_of_proceeds?: string[]
  funding_goals?: string
}

export interface ProspectusGeneratorOptions {
  companyId: string
  exchange: 'tsx' | 'tsxv' | 'cse' | 'nasdaq' | 'nyse' | 'otc' | 'cboe'
  format: 'docx' | 'pdf'
  sections?: string[]
}

interface GenerationResult {
  success: boolean
  documentId?: string
  documentUrl?: string
  documentSize?: number
  completeness?: number
  warnings?: string[]
  errors?: string[]
  metadata?: {
    wordCount?: number
    pageCount?: number
    sectionsIncluded?: string[]
  }
}

/**
 * Main prospectus generator function
 * Orchestrates data gathering, template filling, and document generation
 */
export async function generateProspectus(
  options: ProspectusGeneratorOptions
): Promise<GenerationResult> {
  try {
    // 1. Fetch company data from PACE
    const companyData = await fetchCompanyData(options.companyId, options.exchange)

    // 2. Validate data completeness
    const validationResult = await validateDataCompleteness(
      options.companyId,
      options.exchange,
      companyData
    )

    if (!validationResult.isValid && validationResult.criticalMissing.length > 0) {
      return {
        success: false,
        errors: [
          `Missing critical fields: ${validationResult.criticalMissing.join(', ')}`,
          ...validationResult.warnings,
        ],
      }
    }

    // 3. Get templates for exchange
    const templates = await getTemplatesForExchange(options.exchange, options.sections)

    // 4. Fill templates with company data
    const filledSections = fillTemplates(templates, companyData)

    // 5. Generate document in requested format
    let documentBuffer: Buffer
    let pageCount = 0
    let wordCount = 0

    if (options.format === 'docx') {
      const result = await generateDocxDocument(filledSections, companyData)
      documentBuffer = result.buffer
      wordCount = result.wordCount
      pageCount = result.pageCount
    } else {
      const result = await generatePdfDocument(filledSections, companyData)
      documentBuffer = result.buffer
      pageCount = result.pageCount
      wordCount = result.wordCount
    }

    // 6. Store document in database
    const storageUrl = await storeDocument(
      options.companyId,
      options.exchange,
      options.format,
      documentBuffer
    )

    // 7. Create document record in prospectus_documents table
    const docId = await createProspectusRecord(
      options.companyId,
      options.exchange,
      options.format,
      storageUrl,
      documentBuffer.length,
      validationResult.completeness,
      wordCount,
      pageCount
    )

    return {
      success: true,
      documentId: docId,
      documentUrl: storageUrl,
      documentSize: documentBuffer.length,
      completeness: validationResult.completeness,
      warnings: validationResult.warnings,
      metadata: {
        wordCount,
        pageCount,
        sectionsIncluded: Object.keys(filledSections),
      },
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return {
      success: false,
      errors: [`Prospectus generation failed: ${errorMessage}`],
    }
  }
}

/**
 * Fetch all relevant company data from PACE workflow
 */
async function fetchCompanyData(
  companyId: string,
  exchange: string
): Promise<CompanyData> {
  // Fetch company basic info
  const company = await sql`
    SELECT
      id, name, created_at, trial_end_date, language, currency
    FROM companies
    WHERE id = ${companyId}
  `

  if (company.length === 0) {
    throw new Error(`Company not found: ${companyId}`)
  }

  const companyInfo = company[0]

  // Fetch team members (for management section)
  const executives = await sql`
    SELECT
      u.name, u.role, u.created_at
    FROM team_members tm
    JOIN users u ON tm.user_id = u.id
    WHERE tm.company_id = ${companyId}
    ORDER BY tm.created_at
    LIMIT 20
  `

  // Fetch document scorecards (for completeness check)
  const documents = await sql`
    SELECT
      document_name, status, word_count, page_count
    FROM document_scorecards
    WHERE company_id = ${companyId}
  `

  return {
    id: companyId,
    name: companyInfo.name as string,
    incorporation_date: new Date(companyInfo.created_at as string).toLocaleDateString(),
    incorporation_jurisdiction: 'Canada',
    business_structure: 'Corporation',
    headquarters_address: '[To be filled]',
    description: '[Company business description from PACE]',
    team_size: executives.length || 0,
    executives: (executives as any[]).map(exec => ({
      name: exec.name,
      title: exec.role,
      bio: '[Executive bio]',
    })),
    financial_data: {
      revenue_current: '$0',
      revenue_prior_1: '$0',
      revenue_prior_2: '$0',
      total_assets: '$0',
      total_liabilities: '$0',
      equity: '$0',
      cash_position: '$0',
    },
    risks: ['[Risk factor 1]', '[Risk factor 2]', '[Risk factor 3]'],
    use_of_proceeds: ['Product Development', 'Sales & Marketing', 'Operations'],
  }
}

/**
 * Validate data completeness and identify missing required fields
 */
async function validateDataCompleteness(
  companyId: string,
  exchange: string,
  companyData: CompanyData
): Promise<{
  isValid: boolean
  completeness: number
  criticalMissing: string[]
  warnings: string[]
}> {
  const requiredFields = [
    { field: 'name', critical: true },
    { field: 'incorporation_date', critical: false },
    { field: 'headquarters_address', critical: false },
    { field: 'description', critical: true },
    { field: 'financial_data', critical: true },
    { field: 'executives', critical: true },
  ]

  const criticalMissing: string[] = []
  const warnings: string[] = []
  let completedCount = 0

  for (const req of requiredFields) {
    let fieldValue = (companyData as any)[req.field]
    const isPresent = fieldValue && String(fieldValue).trim() !== '[To be filled]'

    if (isPresent) {
      completedCount++
    } else if (req.critical) {
      criticalMissing.push(req.field)
    } else {
      warnings.push(`Optional field missing: ${req.field}`)
    }
  }

  const completeness = Math.round((completedCount / requiredFields.length) * 100)

  // Store validation results
  for (const req of requiredFields) {
    const fieldStatus = (companyData as any)[req.field] ? 'present' : 'missing'
    await sql`
      INSERT INTO prospectus_data_validations
      (company_id, exchange, required_field, field_status)
      VALUES (${companyId}, ${exchange}, ${req.field}, ${fieldStatus})
      ON CONFLICT (company_id, exchange, required_field)
      DO UPDATE SET field_status = EXCLUDED.field_status
    `
  }

  return {
    isValid: criticalMissing.length === 0,
    completeness,
    criticalMissing,
    warnings,
  }
}

/**
 * Get prospectus templates for specified exchange
 */
async function getTemplatesForExchange(
  exchange: string,
  sections?: string[]
): Promise<Record<string, any>> {
  const query = sections
    ? sql`
        SELECT section_name, template_text, placeholder_fields, section_order
        FROM prospectus_templates
        WHERE exchange = ${exchange} AND section_name = ANY(${JSON.stringify(sections)})
        ORDER BY section_order
      `
    : sql`
        SELECT section_name, template_text, placeholder_fields, section_order
        FROM prospectus_templates
        WHERE exchange = ${exchange} AND required = TRUE
        ORDER BY section_order
      `

  const templates = await query
  const result: Record<string, any> = {}

  for (const tmpl of templates) {
    result[tmpl.section_name] = {
      template: tmpl.template_text,
      placeholders: tmpl.placeholder_fields,
    }
  }

  return result
}

/**
 * Fill template placeholders with company data
 */
function fillTemplates(
  templates: Record<string, any>,
  companyData: CompanyData
): Record<string, string> {
  const filledSections: Record<string, string> = {}
  const dataMap = flattenCompanyData(companyData)

  for (const [sectionName, sectionData] of Object.entries(templates)) {
    let filledTemplate = sectionData.template

    // Replace all placeholders
    for (const [placeholder, value] of Object.entries(dataMap)) {
      const regex = new RegExp(`\\{${placeholder}\\}`, 'g')
      filledTemplate = filledTemplate.replace(regex, String(value || '[Data not available]'))
    }

    // Mark any remaining unfilled placeholders
    filledTemplate = filledTemplate.replace(/\{[^}]+\}/g, '[To be filled]')

    filledSections[sectionName] = filledTemplate
  }

  return filledSections
}

/**
 * Flatten nested company data structure for template replacement
 */
function flattenCompanyData(data: CompanyData): Record<string, any> {
  const flat: Record<string, any> = {
    company_name: data.name,
    incorporation_date: data.incorporation_date,
    incorporation_jurisdiction: data.incorporation_jurisdiction,
    business_structure: data.business_structure,
    headquarters_address: data.headquarters_address,
    primary_business_description: data.description,
    business_focus_areas: data.business_focus_areas,
    products_and_services_list: data.products_services,
    industry_sector: data.industry_sector,
    market_size_estimate: data.market_size,
    market_growth_rate: data.market_growth,
  }

  // Add executive info
  if (data.executives && data.executives.length > 0) {
    const ceo = data.executives.find(e => e.title.toLowerCase().includes('ceo'))
    const cfo = data.executives.find(e => e.title.toLowerCase().includes('cfo'))
    const coo = data.executives.find(e => e.title.toLowerCase().includes('coo'))

    if (ceo) {
      flat.ceo_name = ceo.name
      flat.ceo_age = ceo.age || 'N/A'
      flat.ceo_start_date = ceo.start_date || 'N/A'
      flat.ceo_biography = ceo.bio || '[To be filled]'
    }

    if (cfo) {
      flat.cfo_name = cfo.name
      flat.cfo_age = cfo.age || 'N/A'
      flat.cfo_start_date = cfo.start_date || 'N/A'
      flat.cfo_biography = cfo.bio || '[To be filled]'
    }

    if (coo) {
      flat.coo_name = coo.name
      flat.coo_age = coo.age || 'N/A'
      flat.coo_start_date = coo.start_date || 'N/A'
      flat.coo_biography = coo.bio || '[To be filled]'
    }

    flat.independent_directors_list = data.executives.slice(0, 3).map(e => e.name).join(', ')
    flat.management_directors_list = data.executives.slice(3, 6).map(e => e.name).join(', ')
  }

  // Add financial data
  if (data.financial_data) {
    Object.entries(data.financial_data).forEach(([key, value]) => {
      flat[key] = value
    })
  }

  // Add risks
  if (data.risks && data.risks.length > 0) {
    flat.market_competition_risks = data.risks[0] || '[Risk data pending]'
    flat.technology_risks = data.risks[1] || '[Risk data pending]'
    flat.key_personnel_risks = data.risks[2] || '[Risk data pending]'
  }

  // Add use of proceeds
  if (data.use_of_proceeds && data.use_of_proceeds.length > 0) {
    flat.use_category_1 = data.use_of_proceeds[0] || 'Product Development'
    flat.use_category_2 = data.use_of_proceeds[1] || 'Sales & Marketing'
    flat.use_category_3 = data.use_of_proceeds[2] || 'Operations'
    flat.use_category_4 = data.use_of_proceeds[3] || 'Working Capital'
  }

  return flat
}

/**
 * Generate DOCX document
 */
async function generateDocxDocument(
  sections: Record<string, string>,
  companyData: CompanyData
): Promise<{ buffer: Buffer; wordCount: number; pageCount: number }> {
  const paragraphs: Paragraph[] = []

  // Title page
  paragraphs.push(
    new Paragraph({
      text: `PROSPECTUS\n${companyData.name}`,
      heading: HeadingLevel.HEADING_1,
      spacing: { line: 240, lineRule: 'auto' },
    }),
    new Paragraph({
      text: `\n\nDate: ${new Date().toLocaleDateString()}`,
      spacing: { line: 240, lineRule: 'auto' },
    })
  )

  // Add sections
  for (const [sectionName, content] of Object.entries(sections)) {
    const lines = content.split('\n')
    for (const line of lines) {
      if (line.trim()) {
        const heading = line.match(/^#+/)
        if (heading) {
          const level = Math.min(heading[0].length, 6)
          paragraphs.push(
            new Paragraph({
              text: line.replace(/^#+\s*/, ''),
              heading: ['HEADING_1', 'HEADING_2', 'HEADING_3'][level - 1] as any,
              spacing: { line: 240, lineRule: 'auto' },
            })
          )
        } else {
          paragraphs.push(
            new Paragraph({
              text: line,
              spacing: { line: 240, lineRule: 'auto' },
            })
          )
        }
      }
    }
    paragraphs.push(new Paragraph({ text: '' }))
  }

  const doc = new DocxDocument({
    sections: [
      {
        children: paragraphs,
      },
    ],
  })

  const buffer = await Packer.toBuffer(doc)
  const wordCount = Object.values(sections)
    .reduce((total: number, section: string) => total + section.split(/\s+/).length, 0)
  const pageCount = Math.ceil(wordCount / 250)

  return { buffer, wordCount, pageCount }
}

/**
 * Generate PDF document
 */
async function generatePdfDocument(
  sections: Record<string, string>,
  companyData: CompanyData
): Promise<{ buffer: Buffer; pageCount: number; wordCount: number }> {
  return new Promise((resolve, reject) => {
    try {
      const chunks: Buffer[] = []
      const doc = new PDFDocument({
        size: 'LETTER',
        margin: 72,
      })

      doc.on('data', (chunk: Buffer) => chunks.push(chunk))
      doc.on('end', () => {
        const buffer = Buffer.concat(chunks)
        const wordCount = Object.values(sections)
          .reduce((total: number, section: string) => total + section.split(/\s+/).length, 0)
        const pageCount = doc.bufferedPageRange().count

        resolve({
          buffer,
          pageCount,
          wordCount,
        })
      })

      // Add title
      doc.fontSize(24).font('Helvetica-Bold').text('PROSPECTUS')
      doc.fontSize(18).text(companyData.name)
      doc.fontSize(10).text(`Date: ${new Date().toLocaleDateString()}`)
      doc.moveDown(1)

      // Add sections
      for (const [sectionName, content] of Object.entries(sections)) {
        const lines = content.split('\n')
        for (const line of lines) {
          if (line.trim()) {
            const heading = line.match(/^#+/)
            if (heading) {
              const level = heading[0].length
              const size = Math.max(10, 16 - level * 2)
              doc.fontSize(size).font('Helvetica-Bold').text(line.replace(/^#+\s*/, ''))
            } else if (line.startsWith('###')) {
              doc.fontSize(11).font('Helvetica-Bold').text(line.replace(/^###\s*/, ''))
            } else if (line.startsWith('##')) {
              doc.fontSize(12).font('Helvetica-Bold').text(line.replace(/^##\s*/, ''))
            } else if (line.startsWith('#')) {
              doc.fontSize(14).font('Helvetica-Bold').text(line.replace(/^#\s*/, ''))
            } else {
              doc.fontSize(10).font('Helvetica').text(line)
            }
          }
        }
        doc.moveDown(0.5)
      }

      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Store document in blob storage (e.g., Vercel Blob)
 */
async function storeDocument(
  companyId: string,
  exchange: string,
  format: string,
  buffer: Buffer
): Promise<string> {
  // In production, upload to S3, Vercel Blob, or similar
  // For now, return a mock URL
  const timestamp = new Date().toISOString().slice(0, 10)
  const mockUrl = `/documents/prospectus/${companyId}_${exchange}_${format}_${timestamp}`
  return mockUrl
}

/**
 * Create prospectus_documents record
 */
async function createProspectusRecord(
  companyId: string,
  exchange: string,
  format: string,
  documentUrl: string,
  fileSize: number,
  completeness: number,
  wordCount: number,
  pageCount: number
): Promise<string> {
  const result = await sql`
    INSERT INTO prospectus_documents
    (company_id, exchange, document_format, status, document_url, document_size_bytes, data_completeness_pct, generated_at, metadata)
    VALUES (
      ${companyId},
      ${exchange},
      ${format},
      'generated',
      ${documentUrl},
      ${fileSize},
      ${completeness},
      NOW(),
      ${JSON.stringify({ wordCount, pageCount })}
    )
    RETURNING id
  `

  return result[0].id
}

/**
 * Export function: Generate PDF from prospectus sections
 * Accepts pre-formatted sections array and metadata
 */
export async function generatePDF(
  sections: Array<{ title: string; content: string; number: number; status: string }>,
  metadata: {
    companyName: string
    exchange: string
    formType: string
    createdAt: string
    completionPercentage: number
  }
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const chunks: Buffer[] = []
      const doc = new PDFDocument({
        size: 'LETTER',
        margin: 72,
      })

      doc.on('data', (chunk: Buffer) => chunks.push(chunk))
      doc.on('end', () => {
        resolve(Buffer.concat(chunks))
      })
      doc.on('error', reject)

      // Title page
      doc.fontSize(24).font('Helvetica-Bold').text('PROSPECTUS')
      doc.fontSize(18).text(metadata.companyName)
      doc.fontSize(12).text(`Exchange: ${metadata.exchange.toUpperCase()}`)
      doc.fontSize(10).text(`Form Type: ${metadata.formType}`)
      doc.fontSize(10).text(`Generated: ${new Date(metadata.createdAt).toLocaleDateString()}`)
      doc.fontSize(10).text(`Completeness: ${metadata.completionPercentage}%`)
      doc.addPage()

      // Table of Contents
      doc.fontSize(14).font('Helvetica-Bold').text('Table of Contents')
      sections.forEach(section => {
        doc
          .fontSize(10)
          .font('Helvetica')
          .text(`${section.number}. ${section.title}`, { link: null })
      })
      doc.addPage()

      // Sections
      sections.forEach((section, index) => {
        doc.fontSize(14).font('Helvetica-Bold').text(`${section.number}. ${section.title}`)
        doc.moveDown(0.5)

        const lines = section.content.split('\n')
        for (const line of lines) {
          if (line.trim()) {
            const heading = line.match(/^#+/)
            if (heading) {
              const level = heading[0].length
              const size = Math.max(10, 16 - level * 2)
              doc.fontSize(size).font('Helvetica-Bold').text(line.replace(/^#+\s*/, ''))
            } else {
              doc.fontSize(10).font('Helvetica').text(line, { align: 'left' })
            }
          } else {
            doc.moveDown(0.25)
          }
        }
        doc.moveDown(1)

        if (index < sections.length - 1) {
          doc.addPage()
        }
      })

      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Export function: Generate DOCX from prospectus sections
 * Accepts pre-formatted sections array and metadata
 */
export async function generateDOCX(
  sections: Array<{ title: string; content: string; number: number; status: string }>,
  metadata: {
    companyName: string
    exchange: string
    formType: string
    createdAt: string
    completionPercentage: number
  }
): Promise<Buffer> {
  const paragraphs: Paragraph[] = []

  // Title page
  paragraphs.push(
    new Paragraph({
      text: 'PROSPECTUS',
      heading: HeadingLevel.HEADING_1,
      spacing: { line: 240, lineRule: 'auto' },
    }),
    new Paragraph({
      text: metadata.companyName,
      heading: HeadingLevel.HEADING_2,
      spacing: { line: 240, lineRule: 'auto' },
    }),
    new Paragraph({
      text: `Exchange: ${metadata.exchange.toUpperCase()}`,
      spacing: { line: 240, lineRule: 'auto' },
    }),
    new Paragraph({
      text: `Form Type: ${metadata.formType}`,
      spacing: { line: 240, lineRule: 'auto' },
    }),
    new Paragraph({
      text: `Generated: ${new Date(metadata.createdAt).toLocaleDateString()}`,
      spacing: { line: 240, lineRule: 'auto' },
    }),
    new Paragraph({
      text: `Completeness: ${metadata.completionPercentage}%`,
      spacing: { line: 240, lineRule: 'auto' },
    }),
    new Paragraph({ text: '' })
  )

  // Table of Contents
  paragraphs.push(
    new Paragraph({
      text: 'Table of Contents',
      heading: HeadingLevel.HEADING_2,
      spacing: { line: 240, lineRule: 'auto' },
    })
  )

  sections.forEach(section => {
    paragraphs.push(
      new Paragraph({
        text: `${section.number}. ${section.title}`,
        spacing: { line: 240, lineRule: 'auto' },
      })
    )
  })

  paragraphs.push(new Paragraph({ text: '' }))

  // Sections
  sections.forEach(section => {
    paragraphs.push(
      new Paragraph({
        text: `${section.number}. ${section.title}`,
        heading: HeadingLevel.HEADING_2,
        spacing: { line: 240, lineRule: 'auto' },
      })
    )

    const lines = section.content.split('\n')
    for (const line of lines) {
      if (line.trim()) {
        const heading = line.match(/^#+/)
        if (heading) {
          const level = Math.min(heading[0].length, 3)
          const headingLevels = [HeadingLevel.HEADING_2, HeadingLevel.HEADING_3, HeadingLevel.HEADING_4]
          paragraphs.push(
            new Paragraph({
              text: line.replace(/^#+\s*/, ''),
              heading: headingLevels[level - 1],
              spacing: { line: 240, lineRule: 'auto' },
            })
          )
        } else {
          paragraphs.push(
            new Paragraph({
              text: line,
              spacing: { line: 240, lineRule: 'auto' },
            })
          )
        }
      }
    }
    paragraphs.push(new Paragraph({ text: '' }))
  })

  const doc = new DocxDocument({
    sections: [
      {
        children: paragraphs,
      },
    ],
  })

  return await Packer.toBuffer(doc)
}

/**
 * Export function: Generate ZIP archive containing PDF, DOCX, and metadata
 * Accepts pre-formatted sections array and metadata
 */
export async function generateZIPFile(
  sections: Array<{ title: string; content: string; number: number; status: string }>,
  metadata: {
    companyName: string
    exchange: string
    formType: string
    createdAt: string
    completionPercentage: number
  }
): Promise<Buffer> {
  try {
    // Dynamic import JSZip
    const JSZip = require('jszip')
    const zip = new JSZip()
    const safeCompanyName = metadata.companyName.replace(/[^a-z0-9]/gi, '_').toLowerCase()

    // Generate PDF
    const pdfBuffer = await generatePDF(sections, metadata)
    zip.file(`${safeCompanyName}_prospectus.pdf`, pdfBuffer)

    // Generate DOCX
    const docxBuffer = await generateDOCX(sections, metadata)
    zip.file(`${safeCompanyName}_prospectus.docx`, docxBuffer)

    // Add metadata JSON
    const metadataJson = {
      ...metadata,
      sections: sections.map(s => ({
        number: s.number,
        title: s.title,
        status: s.status,
        wordCount: s.content.split(/\s+/).length,
      })),
      exportedAt: new Date().toISOString(),
      totalWordCount: sections.reduce((sum, s) => sum + s.content.split(/\s+/).length, 0),
    }
    zip.file('metadata.json', JSON.stringify(metadataJson, null, 2))

    // Generate and return ZIP buffer
    const buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' })
    return buffer
  } catch (error) {
    throw new Error(`Failed to generate ZIP archive: ${error instanceof Error ? error.message : String(error)}`)
  }
}



