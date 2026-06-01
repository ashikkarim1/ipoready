/**
 * Seed Prospectus Templates into the Database
 * Run with: npx ts-node scripts/seed-prospectus-templates.ts
 */

import { sql } from '../src/lib/db'

// Import all templates
import { businessOverviewTemplate } from '../src/lib/prospectus-templates/business-overview'
import { riskFactorsTemplate } from '../src/lib/prospectus-templates/risk-factors'
import { financialSummaryTemplate } from '../src/lib/prospectus-templates/financial-summary'
import { managementTemplate } from '../src/lib/prospectus-templates/management'
import { useOfProceedsTemplate } from '../src/lib/prospectus-templates/use-of-proceeds'

const exchanges = ['tsx', 'tsxv', 'cse', 'nasdaq', 'nyse', 'otc']
const templates = [
  businessOverviewTemplate,
  riskFactorsTemplate,
  financialSummaryTemplate,
  managementTemplate,
  useOfProceedsTemplate,
]

async function seedTemplates() {
  console.log('Starting template seeding...')

  try {
    // For each exchange, insert all templates
    for (const exchange of exchanges) {
      console.log(`  Seeding templates for ${exchange.toUpperCase()}...`)

      for (const template of templates) {
        await sql`
          INSERT INTO prospectus_templates
          (exchange, section_name, section_order, template_text, placeholder_fields, description, required)
          VALUES
          (
            ${exchange},
            ${template.sectionName},
            ${template.sectionOrder},
            ${template.template},
            ${JSON.stringify(template.placeholders)},
            ${template.description || template.title},
            true
          )
          ON CONFLICT (exchange, section_name)
          DO UPDATE SET
            template_text = EXCLUDED.template_text,
            placeholder_fields = EXCLUDED.placeholder_fields,
            description = EXCLUDED.description,
            updated_at = NOW()
        `
      }
    }

    console.log('✓ Template seeding completed successfully!')
    console.log(`  Seeded ${exchanges.length} exchanges × ${templates.length} templates = ${exchanges.length * templates.length} total rows`)
    process.exit(0)
  } catch (error) {
    console.error('Error seeding templates:', error)
    process.exit(1)
  }
}

seedTemplates()
