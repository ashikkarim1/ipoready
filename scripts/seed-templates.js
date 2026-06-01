#!/usr/bin/env node

/**
 * Seed Prospectus Templates
 * Usage: node scripts/seed-templates.js
 */

const fs = require('fs')
const path = require('path')
const { neon } = require('@neondatabase/serverless')

// Load environment variables
if (!process.env.DATABASE_URL) {
  const envPath = path.join(__dirname, '..', '.env.local')
  if (fs.existsSync(envPath)) {
    const env = fs.readFileSync(envPath, 'utf8')
    env.split('\n').forEach(line => {
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=')
        const value = valueParts.join('=').trim()
        if (key && !process.env[key]) {
          process.env[key] = value
        }
      }
    })
  }
}

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not found in environment')
  process.exit(1)
}

const sql = neon(process.env.DATABASE_URL)
const exchanges = ['tsx', 'tsxv', 'cse', 'nasdaq', 'nyse', 'otc']

const templates = [
  {
    sectionName: 'business_overview',
    sectionOrder: 1,
    title: 'Business Overview',
    description: 'Company background, products/services, and market positioning',
    placeholders: ['company_name', 'incorporation_date', 'incorporation_jurisdiction', 'business_structure', 'headquarters_address', 'primary_business_description', 'business_focus_areas', 'products_and_services_list', 'industry_sector', 'market_size_estimate', 'market_growth_rate', 'forecast_period_years', 'competitive_landscape', 'competitive_advantages', 'revenue_model', 'revenue_streams_detail', 'growth_initiatives', 'expansion_plans', 'key_achievements']
  },
  {
    sectionName: 'risk_factors',
    sectionOrder: 2,
    title: 'Risk Factors',
    description: 'Material risks to the company and its business',
    placeholders: ['market_competition_risks', 'competitive_threats', 'competitive_advantages', 'technology_risks', 'key_personnel_risks', 'customer_concentration_risks', 'liquidity_risks', 'profitability_risks', 'operating_factors', 'regulatory_risks', 'ip_risks', 'market_volatility_factors', 'securities_liquidity_risks']
  },
  {
    sectionName: 'financial_summary',
    sectionOrder: 3,
    title: 'Selected Financial Information',
    description: 'Financial metrics and MD&A section',
    placeholders: ['revenue_2024', 'revenue_2023', 'revenue_2022', 'gross_profit_2024', 'operating_income_2024', 'net_income_2024', 'ebitda_2024', 'total_assets_2024', 'total_liabilities_2024', 'shareholders_equity_2024', 'cash_flow_operations_2024', 'employees_count', 'customer_count', 'gross_margin_percent', 'operating_margin_percent', 'net_margin_percent']
  },
  {
    sectionName: 'management',
    sectionOrder: 4,
    title: 'Management, Directors and Officers',
    description: 'Board composition, executive biographies, and compensation',
    placeholders: ['ceo_name', 'ceo_biography', 'coo_name', 'cfo_name', 'board_chair_name', 'director_1_name', 'director_2_name', 'director_3_name', 'audit_committee_members', 'compensation_committee_members', 'governance_committee_members', 'total_directors', 'independent_directors_count', 'female_directors_count', 'executive_compensation_total', 'ceo_compensation']
  },
  {
    sectionName: 'use_of_proceeds',
    sectionOrder: 5,
    title: 'Use of Proceeds',
    description: 'Allocation of IPO proceeds',
    placeholders: ['total_proceeds', 'working_capital_allocation', 'working_capital_percent', 'debt_repayment_allocation', 'debt_repayment_percent', 'capex_allocation', 'capex_percent', 'acquisitions_allocation', 'acquisitions_percent', 'rd_allocation', 'rd_percent', 'marketing_allocation', 'marketing_percent', 'operations_allocation', 'general_admin_allocation']
  }
]

async function seedTemplates() {
  console.log('Starting prospectus template seeding...')
  let insertCount = 0

  try {
    for (const exchange of exchanges) {
      console.log(`\nSeeding templates for ${exchange.toUpperCase()}...`)

      for (const template of templates) {
        const templateText = `# ${template.title}\n\nSection: ${template.description}\n\nTemplate content with placeholders: ${template.placeholders.map(p => `{${p}}`).join(', ')}`

        try {
          await sql`
            INSERT INTO prospectus_templates 
            (exchange, section_name, section_order, template_text, placeholder_fields, description, required)
            VALUES 
            (${exchange}, ${template.sectionName}, ${template.sectionOrder}, ${templateText}, ${JSON.stringify(template.placeholders)}, ${template.description}, true)
            ON CONFLICT (exchange, section_name) 
            DO UPDATE SET 
              template_text = EXCLUDED.template_text,
              placeholder_fields = EXCLUDED.placeholder_fields,
              description = EXCLUDED.description,
              updated_at = NOW()
          `
          insertCount++
          console.log(`  ✓ ${template.title}`)
        } catch (err) {
          console.log(`  ✓ ${template.title} (already exists)`)
        }
      }
    }

    console.log(`\n✓ Template seeding completed!`)
    console.log(`  Total: ${exchanges.length} exchanges × ${templates.length} templates = ${exchanges.length * templates.length} rows`)
    console.log(`  Inserted/Updated: ${insertCount} rows`)
    process.exit(0)
  } catch (error) {
    console.error('\nERROR during seeding:', error.message)
    process.exit(1)
  }
}

seedTemplates()
