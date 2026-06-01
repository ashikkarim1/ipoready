/**
 * Seed Prospectus Templates into the Database
 * Run with: node scripts/seed-prospectus-templates.js
 */

const { neon } = require('@neondatabase/serverless')
const fs = require('fs')
const path = require('path')

// Load environment variables from .env.local if running outside of Next.js
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
  throw new Error('DATABASE_URL is not set. Check .env.local file.')
}

const sql = neon(process.env.DATABASE_URL)

// Template data (simplified inline to avoid TypeScript compilation)
const exchanges = ['tsx', 'tsxv', 'cse', 'nasdaq', 'nyse', 'otc']

const templates = [
  {
    sectionName: 'business_overview',
    sectionOrder: 1,
    title: 'Business Overview',
    description: 'Company background, business model, and market context',
    placeholders: [
      'company_name', 'incorporation_date', 'incorporation_jurisdiction', 'business_structure',
      'headquarters_address', 'primary_business_description', 'business_focus_areas',
      'products_and_services_list', 'industry_sector', 'market_size_estimate',
      'market_growth_rate', 'forecast_period_years', 'competitive_landscape',
      'competitive_advantages', 'revenue_model', 'revenue_streams_detail',
      'growth_initiatives', 'expansion_plans', 'key_achievements'
    ]
  },
  {
    sectionName: 'risk_factors',
    sectionOrder: 2,
    title: 'Risk Factors',
    description: 'Material risks to the company and its business',
    placeholders: [
      'market_competition_risks', 'competitive_threats', 'competitive_advantages',
      'technology_risks', 'key_personnel_risks', 'customer_concentration_risks',
      'liquidity_risks', 'profitability_risks', 'operating_factors',
      'regulatory_risks', 'ip_risks', 'market_volatility_factors',
      'securities_liquidity_risks'
    ]
  },
  {
    sectionName: 'financial_summary',
    sectionOrder: 3,
    title: 'Selected Financial Information',
    description: 'Financial metrics and MD&A',
    placeholders: [
      'revenue_2024', 'revenue_2023', 'revenue_2022', 'revenue_growth_percent',
      'gross_profit_2024', 'gross_profit_2023', 'gross_profit_2022',
      'operating_income_2024', 'operating_income_2023', 'operating_income_2022',
      'net_income_2024', 'net_income_2023', 'net_income_2022',
      'ebitda_2024', 'ebitda_2023', 'ebitda_2022', 'cash_flow_operations_2024',
      'cash_flow_operations_2023', 'cash_flow_operations_2022', 'capex_2024',
      'capex_2023', 'capex_2022', 'total_assets_2024', 'total_assets_2023',
      'total_liabilities_2024', 'total_liabilities_2023', 'shareholders_equity_2024',
      'shareholders_equity_2023', 'current_assets_2024', 'current_assets_2023',
      'current_liabilities_2024', 'current_liabilities_2023', 'cash_position_2024',
      'cash_position_2023', 'debt_2024', 'debt_2023', 'working_capital_2024',
      'working_capital_2023', 'employees_count', 'revenue_per_employee',
      'customer_count', 'customer_acquisition_cost', 'customer_lifetime_value',
      'churn_rate', 'retention_rate', 'market_share', 'gross_margin_percent',
      'operating_margin_percent', 'net_margin_percent', 'roe_percent', 'roa_percent',
      'debt_to_equity', 'current_ratio', 'quick_ratio', 'inventory_turnover',
      'receivables_turnover'
    ]
  },
  {
    sectionName: 'management',
    sectionOrder: 4,
    title: 'Management, Directors and Officers',
    description: 'Board composition, executive biographies, and compensation',
    placeholders: [
      'ceo_name', 'ceo_biography', 'ceo_experience', 'coo_name', 'coo_biography',
      'cfo_name', 'cfo_biography', 'cto_name', 'cto_biography', 'board_chair_name',
      'board_chair_biography', 'director_1_name', 'director_1_biography',
      'director_2_name', 'director_2_biography', 'director_3_name',
      'director_3_biography', 'director_4_name', 'director_4_biography',
      'audit_committee_members', 'audit_committee_chair', 'compensation_committee_members',
      'compensation_committee_chair', 'governance_committee_members',
      'governance_committee_chair', 'total_directors', 'independent_directors_count',
      'female_directors_count', 'executive_compensation_total', 'ceo_compensation',
      'top_5_executive_compensation', 'stock_options_outstanding',
      'restricted_stock_units', 'pension_obligations', 'post_employment_benefits'
    ]
  },
  {
    sectionName: 'use_of_proceeds',
    sectionOrder: 5,
    title: 'Use of Proceeds',
    description: 'Allocation of IPO proceeds',
    placeholders: [
      'total_proceeds', 'working_capital_allocation', 'working_capital_percent',
      'debt_repayment_allocation', 'debt_repayment_percent', 'capex_allocation',
      'capex_percent', 'acquisitions_allocation', 'acquisitions_percent',
      'rd_allocation', 'rd_percent', 'marketing_allocation', 'marketing_percent',
      'operations_allocation', 'operations_percent', 'general_admin_allocation',
      'general_admin_percent', 'debt_details', 'capex_details', 'rd_initiatives',
      'marketing_strategy', 'acquisition_targets', 'working_capital_details',
      'timeline_to_deployment', 'expected_returns', 'risk_factors_allocation',
      'sustainability_initiatives', 'technology_investment', 'team_expansion',
      'international_expansion', 'facility_expansion'
    ]
  }
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
            ${'[template text placeholder]'},
            ${JSON.stringify(template.placeholders)},
            ${template.description},
            true
          )
          ON CONFLICT (exchange, section_name)
          DO UPDATE SET
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
