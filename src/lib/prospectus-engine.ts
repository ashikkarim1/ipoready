import { sql } from './db'
import { PROSPECTUS_TEMPLATES } from './prospectus-templates'

export interface SectionInitData {
  sectionId: string
  sectionName: string
  sectionOrder: number
  completionPct: number
  status: string
  wordCount: number
  typicalWordCount: number
}

export interface ProspectusProgress {
  prospectusId: string
  exchangeId: string
  completionPct: number
  status: string
  sectionsInitialized: number
  sectionsComplete: number
  documentsLinked: number
  readySections: SectionInitData[]
  nextActions: string[]
  estimatedDaysToCompletion: number
}

export interface SectionCompleteness {
  sectionId: string
  completionPct: number
  breakdown: {
    contentLength: number      // 0-100 (40% weight)
    dataDensity: number        // 0-100 (30% weight)
    requiredFields: number     // 0-100 (20% weight)
    complianceScore: number    // 0-100 (10% weight)
  }
  feedback: string[]
  isComplete: boolean
}

export interface PrioritySection {
  sectionId: string
  sectionName: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  completionPct: number
  dataAvailable: number
  feedback: string
  estimatedHoursToComplete: number
}

/**
 * Initialize a new prospectus for a company
 * Creates the main prospectus record, loads exchange template, maps documents, assigns AI co-pilots
 */
export async function initializeProspectus(
  companyId: string,
  exchangeId: string
): Promise<ProspectusProgress> {
  try {
    // Fetch company details
    const companyResult = await sql`
      SELECT id, name, target_exchange, estimated_days_to_ipo, sector
      FROM companies
      WHERE id = ${companyId}
    `

    if (!companyResult || companyResult.length === 0) {
      throw new Error(`Company not found: ${companyId}`)
    }

    const company = companyResult[0]
    const template = PROSPECTUS_TEMPLATES[exchangeId]

    if (!template) {
      throw new Error(`No template found for exchange: ${exchangeId}`)
    }

    // Create prospectus record
    const prospectusResult = await sql`
      INSERT INTO prospectuses (
        company_id,
        exchange,
        form_type,
        status,
        sections_total,
        estimated_completion_date,
        target_ipo_date,
        metadata
      ) VALUES (
        ${companyId},
        ${exchangeId},
        ${template.formType},
        'draft',
        ${template.sections.length},
        CURRENT_DATE + INTERVAL '60 days',
        CURRENT_DATE + INTERVAL '90 days',
        ${JSON.stringify({
          templateVersion: template.version,
          companyName: company.name,
          sector: company.sector,
          initiatedAt: new Date().toISOString(),
        })}
      )
      RETURNING id, created_at, status
    `

    const prospectusId = prospectusResult[0].id

    // Create sections based on template
    const sectionsData: any[] = []
    for (const templateSection of template.sections) {
      const sectionResult = await sql`
        INSERT INTO prospectus_sections (
          prospectus_id,
          section_number,
          section_name,
          section_description,
          section_order,
          section_category,
          required_by_exchange,
          typical_word_count,
          assigned_to_copilot,
          priority,
          status
        ) VALUES (
          ${prospectusId},
          ${templateSection.sectionNumber},
          ${templateSection.sectionName},
          ${templateSection.sectionDescription || ''},
          ${parseInt(templateSection.sectionNumber) || 0},
          ${templateSection.complianceCategory || 'General'},
          ${templateSection.required},
          ${templateSection.typicalWordCount || 500},
          ${'prospectus_co_pilot_' + ((parseInt(templateSection.sectionNumber) % 3) + 1)},
          ${templateSection.priority || 'medium'},
          'not_started'
        )
        RETURNING id, section_name, section_order, completion_pct, status, word_count
      `

      sectionsData.push(sectionResult[0])
    }

    // Map documents to sections
    const mappingResult = await mapDocumentsToSections(companyId)

    // Get documents linked count
    const docsLinked = await sql`
      SELECT COUNT(DISTINCT source_document_id) as count
      FROM prospectus_source_mapping
      WHERE section_id IN (
        SELECT id FROM prospectus_sections WHERE prospectus_id = ${prospectusId}
      )
    `

    return {
      prospectusId,
      exchangeId,
      completionPct: 0,
      status: 'draft',
      sectionsInitialized: sectionsData.length,
      sectionsComplete: 0,
      documentsLinked: docsLinked[0]?.count || 0,
      readySections: sectionsData as SectionInitData[],
      nextActions: [
        'Map source documents to sections',
        'Generate AI drafts for priority sections',
        'Submit sections for human review',
        'Obtain professional approvals',
        'Export to Word document',
      ],
      estimatedDaysToCompletion: 14,
    }
  } catch (error) {
    console.error('Error initializing prospectus:', error)
    throw error
  }
}

/**
 * Map uploaded documents to prospectus sections based on document type and content
 */
export async function mapDocumentsToSections(companyId: string): Promise<{
  sectionToSourceMapping: Record<string, string[]>
  mappingConfidence: number
}> {
  try {
    // Get all documents for the company
    const documents = await sql`
      SELECT id, document_name, document_type, extracted_data, upload_date
      FROM documents
      WHERE company_id = ${companyId}
      ORDER BY upload_date DESC
    `

    if (!documents || documents.length === 0) {
      return {
        sectionToSourceMapping: {},
        mappingConfidence: 0,
      }
    }

    // Get all sections for the company's prospectuses
    const sections = await sql`
      SELECT ps.id, ps.section_name, p.prospectus_id
      FROM prospectus_sections ps
      JOIN prospectuses p ON ps.prospectus_id = p.id
      WHERE p.company_id = ${companyId}
    `

    const sectionToSourceMapping: Record<string, string[]> = {}
    let totalMappings = 0
    let confidenceMappings = 0

    // Document type to section mapping rules
    const documentSectionMappings: Record<string, string[]> = {
      ARTICLES_OF_INCORPORATION: ['Company Overview', 'Capitalization', 'Articles of Incorporation'],
      CAP_TABLE: ['Capitalization', 'Principal Stockholders', 'Diluted Capitalization'],
      FINANCIAL_STATEMENTS: [
        'Selected Financial Data',
        'Financial Statements',
        'Management Discussion & Analysis',
        'Financial Condition',
      ],
      BOARD_MINUTES: ['Corporate Governance', 'Executive Officers', 'Board of Directors'],
      LEGAL_OPINIONS: ['Risk Factors', 'Litigation', 'Legal Proceedings'],
      MATERIAL_CONTRACTS: ['Material Contracts', 'Business', 'Risk Factors'],
      EMPLOYEE_OPTIONS: ['Capitalization', 'Employee Benefit Plans', 'Executive Compensation'],
      D_O_QUESTIONNAIRES: [
        'Executive Officers',
        'Executive Compensation',
        'Board of Directors',
        'Corporate Governance',
      ],
    }

    for (const doc of documents) {
      const docType = doc.document_type || 'UNKNOWN'
      const relatedSectionNames = documentSectionMappings[docType] || []

      for (const section of sections) {
        const isMapped = relatedSectionNames.some((sectionName) =>
          section.section_name.includes(sectionName) || sectionName.includes(section.section_name)
        )

        if (isMapped) {
          // Create mapping in database
          await sql`
            INSERT INTO prospectus_source_mapping (
              section_id,
              source_document_id,
              document_type,
              extraction_confidence_pct,
              extraction_method
            ) VALUES (
              ${section.id},
              ${doc.id},
              ${docType},
              85,
              'template_match'
            )
            ON CONFLICT DO NOTHING
          `

          if (!sectionToSourceMapping[section.section_name]) {
            sectionToSourceMapping[section.section_name] = []
          }
          sectionToSourceMapping[section.section_name].push(doc.id)
          confidenceMappings++
          totalMappings++
        }
      }
    }

    const mappingConfidence = totalMappings > 0 ? Math.round((confidenceMappings / totalMappings) * 100) : 0

    return {
      sectionToSourceMapping,
      mappingConfidence,
    }
  } catch (error) {
    console.error('Error mapping documents to sections:', error)
    throw error
  }
}

/**
 * Calculate section completeness score (0-100%)
 * Factors: content length (40%), data density (30%), required fields (20%), compliance (10%)
 */
export async function calculateSectionCompleteness(sectionId: string): Promise<SectionCompleteness> {
  try {
    const sectionResult = await sql`
      SELECT
        ps.id,
        ps.section_name,
        ps.typical_word_count,
        ps.completion_pct,
        psc.word_count,
        psc.data_density_score,
        psc.compliance_score,
        psc.draft_content,
        psc.final_content
      FROM prospectus_sections ps
      LEFT JOIN prospectus_section_content psc ON ps.id = psc.section_id
      WHERE ps.id = ${sectionId}
      ORDER BY psc.content_version DESC
      LIMIT 1
    `

    if (!sectionResult || sectionResult.length === 0) {
      throw new Error(`Section not found: ${sectionId}`)
    }

    const section = sectionResult[0]
    const content = section.final_content || section.draft_content || ''

    // Calculate content length score (40% weight)
    const wordCount = section.word_count || content.split(/\s+/).length
    const expectedWordCount = section.typical_word_count || 500
    const contentLengthScore = Math.min(100, (wordCount / expectedWordCount) * 100)

    // Data density score (30% weight) - from content analysis
    const dataDensityScore = section.data_density_score || 0

    // Required fields score (20% weight)
    const requiredFields = ['Introduction', 'Key Points', 'Conclusion'].filter((field) =>
      content.toLowerCase().includes(field.toLowerCase())
    )
    const requiredFieldsScore = (requiredFields.length / 3) * 100

    // Compliance score (10% weight)
    const complianceScore = section.compliance_score || 0

    // Calculate weighted total
    const completionPct = Math.round(
      contentLengthScore * 0.4 + dataDensityScore * 0.3 + requiredFieldsScore * 0.2 + complianceScore * 0.1
    )

    const feedback: string[] = []
    if (wordCount === 0) {
      feedback.push('No content yet. Generate an AI draft to get started.')
    } else if (wordCount < expectedWordCount * 0.5) {
      feedback.push(`Content is short (${wordCount} words vs. typical ${expectedWordCount}). Consider expanding.`)
    }
    if (dataDensityScore < 50) {
      feedback.push('Low data density. Add more specific information and facts.')
    }
    if (complianceScore < 70) {
      feedback.push('Compliance score is below 70%. Review for regulatory alignment.')
    }

    return {
      sectionId,
      completionPct,
      breakdown: {
        contentLength: Math.round(contentLengthScore),
        dataDensity: Math.round(dataDensityScore),
        requiredFields: Math.round(requiredFieldsScore),
        complianceScore: Math.round(complianceScore),
      },
      feedback,
      isComplete: completionPct >= 80,
    }
  } catch (error) {
    console.error('Error calculating section completeness:', error)
    throw error
  }
}

/**
 * Get next priority sections for AI agent to work on
 */
export async function getNextPrioritySections(prospectusId: string): Promise<PrioritySection[]> {
  try {
    const sections = await sql`
      SELECT
        ps.id,
        ps.section_name,
        ps.status,
        ps.completion_pct,
        ps.priority,
        ps.assigned_to_copilot,
        COUNT(DISTINCT psm.source_document_id) as source_docs_count
      FROM prospectus_sections ps
      LEFT JOIN prospectus_source_mapping psm ON ps.id = psm.section_id
      WHERE ps.prospectus_id = ${prospectusId}
        AND ps.status IN ('not_started', 'in_progress', 'draft')
      GROUP BY ps.id
      ORDER BY
        CASE ps.priority
          WHEN 'critical' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          ELSE 4
        END,
        ps.completion_pct ASC
      LIMIT 5
    `

    const prioritySections: PrioritySection[] = sections.map((section: any) => ({
      sectionId: section.id,
      sectionName: section.section_name,
      priority: section.priority || 'medium',
      completionPct: section.completion_pct || 0,
      dataAvailable: Math.min(100, (section.source_docs_count || 0) * 20),
      feedback:
        section.status === 'not_started'
          ? 'Ready for AI draft generation'
          : 'Awaiting review or refinement',
      estimatedHoursToComplete: section.completion_pct === 0 ? 2 : 1,
    }))

    return prioritySections
  } catch (error) {
    console.error('Error getting priority sections:', error)
    throw error
  }
}

/**
 * Update section status and completion percentage
 */
export async function updateSectionStatus(
  sectionId: string,
  status: string,
  completionPct: number
): Promise<void> {
  try {
    await sql`
      UPDATE prospectus_sections
      SET status = ${status},
          completion_pct = ${completionPct},
          updated_at = NOW()
      WHERE id = ${sectionId}
    `

    // Update prospectus overall completion
    const prospectusResult = await sql`
      SELECT prospectus_id FROM prospectus_sections WHERE id = ${sectionId}
    `

    if (prospectusResult.length > 0) {
      const prospectusId = prospectusResult[0].prospectus_id

      const completionResult = await sql`
        SELECT
          SUM(completion_pct) / COUNT(*) as avg_completion,
          COUNT(*) as total_sections,
          SUM(CASE WHEN status = 'approved' OR status = 'final' THEN 1 ELSE 0 END) as approved_sections
        FROM prospectus_sections
        WHERE prospectus_id = ${prospectusId}
      `

      if (completionResult.length > 0) {
        const comp = completionResult[0]
        const newStatus =
          comp.approved_sections === comp.total_sections ? 'ready_for_export' : 'in_progress'

        await sql`
          UPDATE prospectuses
          SET completion_pct = ${Math.round(comp.avg_completion || 0)},
              sections_approved = ${comp.approved_sections},
              status = ${newStatus},
              updated_at = NOW()
          WHERE id = ${prospectusId}
        `
      }
    }
  } catch (error) {
    console.error('Error updating section status:', error)
    throw error
  }
}
