import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface ChecklistItem {
  item: string
  completed: boolean
}

interface Template {
  id: string
  documentTypeId: string
  documentName: string
  category: string
  templateContent: string
  checklist: ChecklistItem[]
  exampleFileUrl: string | null
  regulatoryReference: string | null
}

interface TemplatesResponse {
  templates: Template[]
  total: number
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const exchangeId = request.nextUrl.searchParams.get('exchange_id')

    // Get all templates
    const query = exchangeId
      ? `
        SELECT
          fdt.id as document_type_id,
          fdt.document_name,
          fdt.category,
          fdt.regulatory_reference,
          fdt.example_document_url,
          fdt.template_url,
          fdt.description,
          fdt.estimated_prep_days,
          fdt.is_required,
          fdt.exchange_id,
          fdt.created_at,
          COALESCE(fdt.regulatory_reference, '') as regulatory_ref,
          fdt.id as template_id
        FROM filing_document_types fdt
        WHERE fdt.exchange_id = $1
        ORDER BY fdt.category, fdt.document_name
      `
      : `
        SELECT
          fdt.id as document_type_id,
          fdt.document_name,
          fdt.category,
          fdt.regulatory_reference,
          fdt.example_document_url,
          fdt.template_url,
          fdt.description,
          fdt.estimated_prep_days,
          fdt.is_required,
          fdt.exchange_id,
          fdt.created_at,
          COALESCE(fdt.regulatory_reference, '') as regulatory_ref,
          fdt.id as template_id
        FROM filing_document_types fdt
        ORDER BY fdt.category, fdt.document_name
      `

    const docResults = exchangeId
      ? await sql`
          SELECT
            fdt.id as document_type_id,
            fdt.document_name,
            fdt.category,
            fdt.regulatory_reference,
            fdt.example_document_url,
            fdt.template_url,
            fdt.description,
            fdt.estimated_prep_days,
            fdt.is_required,
            fdt.exchange_id,
            fdt.created_at
          FROM filing_document_types fdt
          WHERE fdt.exchange_id = ${exchangeId}
          ORDER BY fdt.category, fdt.document_name
        `
      : await sql`
          SELECT
            fdt.id as document_type_id,
            fdt.document_name,
            fdt.category,
            fdt.regulatory_reference,
            fdt.example_document_url,
            fdt.template_url,
            fdt.description,
            fdt.estimated_prep_days,
            fdt.is_required,
            fdt.exchange_id,
            fdt.created_at
          FROM filing_document_types fdt
          ORDER BY fdt.category, fdt.document_name
        `

    const templates: Template[] = docResults.map(doc => {
      const templateContent = `
# ${doc.document_name}

**Category:** ${doc.category}
**Required:** ${doc.is_required ? 'Yes' : 'Optional'}
**Estimated Preparation:** ${doc.estimated_prep_days} days

## Description
${doc.description || 'See regulatory reference for details'}

## Regulatory Reference
${doc.regulatory_reference || 'N/A'}

## Preparation Checklist
- [ ] Obtain source documents
- [ ] Review for completeness and accuracy
- [ ] Have legal team review
- [ ] Address any comments or revisions
- [ ] Prepare final version
- [ ] Upload to filing system

## Key Requirements
- Ensure all required sections are included
- Verify accuracy of all data
- Obtain necessary approvals
- Format according to regulatory guidelines

## Resources
${doc.template_url ? `- Template Guide: ${doc.template_url}` : ''}
${doc.example_document_url ? `- Example Document: ${doc.example_document_url}` : ''}
`

      return {
        id: doc.document_type_id,
        documentTypeId: doc.document_type_id,
        documentName: doc.document_name,
        category: doc.category,
        templateContent,
        checklist: [
          { item: 'Obtain source documents', completed: false },
          { item: 'Review for completeness and accuracy', completed: false },
          { item: 'Have legal team review', completed: false },
          { item: 'Address any comments or revisions', completed: false },
          { item: 'Prepare final version', completed: false },
          { item: 'Upload to filing system', completed: false },
        ],
        exampleFileUrl: doc.example_document_url,
        regulatoryReference: doc.regulatory_reference,
      }
    })

    return NextResponse.json({
      templates,
      total: templates.length,
    } as TemplatesResponse)
  } catch (error) {
    console.error('Get templates error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates', templates: [], total: 0 },
      { status: 500 }
    )
  }
}
