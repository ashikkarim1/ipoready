/**
 * Syndication Templates Library
 * Client-side utilities for managing syndication agreement templates
 */

export interface SyndicationTemplate {
  id: string
  title: string
  type: 'lead-underwriter' | 'co-underwriter' | 'standstill'
  description: string
  keyTerms: string[]
  exchanges: string[]
  lastUpdated: string
  fileFormat: 'docx'
}

export interface TemplatesResponse {
  success: boolean
  data: SyndicationTemplate[]
  total: number
}

/**
 * Fetch all syndication templates with optional filters
 */
export async function fetchSyndicationTemplates(
  filters?: {
    type?: 'lead-underwriter' | 'co-underwriter' | 'standstill'
    exchange?: string
  }
): Promise<SyndicationTemplate[]> {
  const params = new URLSearchParams()

  if (filters?.type) {
    params.append('type', filters.type)
  }

  if (filters?.exchange) {
    params.append('exchange', filters.exchange)
  }

  const query = params.toString()
  const url = `/api/compliance/templates${query ? `?${query}` : ''}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch templates: ${response.statusText}`)
  }

  const data: TemplatesResponse = await response.json()
  return data.data
}

/**
 * Get a specific template by ID
 */
export async function getTemplateById(id: string): Promise<SyndicationTemplate | null> {
  try {
    const templates = await fetchSyndicationTemplates()
    return templates.find((t) => t.id === id) || null
  } catch (error) {
    console.error('Error fetching template:', error)
    return null
  }
}

/**
 * Group templates by type
 */
export function groupTemplatesByType(
  templates: SyndicationTemplate[]
): Record<string, SyndicationTemplate[]> {
  return templates.reduce(
    (acc, template) => {
      const type = template.type
      if (!acc[type]) {
        acc[type] = []
      }
      acc[type].push(template)
      return acc
    },
    {} as Record<string, SyndicationTemplate[]>
  )
}

/**
 * Filter templates by exchange
 */
export function filterTemplatesByExchange(
  templates: SyndicationTemplate[],
  exchange: string
): SyndicationTemplate[] {
  return templates.filter((t) => t.exchanges.includes(exchange))
}

/**
 * Search templates by keyword
 */
export function searchTemplates(
  templates: SyndicationTemplate[],
  keyword: string
): SyndicationTemplate[] {
  const lower = keyword.toLowerCase()
  return templates.filter(
    (t) =>
      t.title.toLowerCase().includes(lower) ||
      t.description.toLowerCase().includes(lower) ||
      t.keyTerms.some((term) => term.toLowerCase().includes(lower))
  )
}

/**
 * Generate a DOCX file from template data (MVP: placeholder)
 * In production, would use libraries like docx or libreoffice
 */
export async function generateTemplateDocx(template: SyndicationTemplate): Promise<Blob> {
  // Placeholder implementation
  // In production, would:
  // 1. Use docx library to create document
  // 2. Populate with template content
  // 3. Return as downloadable Blob
  
  const content = `
${template.title}

${template.description}

KEY TERMS:
${template.keyTerms.map((term, i) => `${i + 1}. ${term}`).join('\n')}

EXCHANGES ACCEPTING THIS TEMPLATE:
${template.exchanges.join(', ')}

Last Updated: ${template.lastUpdated}

DISCLAIMER:
This template is provided for informational purposes only. Consult with legal counsel before use.
`

  return new Blob([content], { type: 'text/plain' })
}

/**
 * Download template as a file
 */
export async function downloadTemplate(template: SyndicationTemplate): Promise<void> {
  try {
    const blob = await generateTemplateDocx(template)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${template.id}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error downloading template:', error)
    throw error
  }
}

/**
 * Format template for export
 */
export function formatTemplateForExport(template: SyndicationTemplate): string {
  return `
# ${template.title}

## Overview
${template.description}

## Type
${template.type}

## Key Terms
${template.keyTerms.map((term) => `- ${term}`).join('\n')}

## Applicable Exchanges
${template.exchanges.map((ex) => `- ${ex}`).join('\n')}

## Last Updated
${template.lastUpdated}
`
}
