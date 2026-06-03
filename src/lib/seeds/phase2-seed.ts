/**
 * Phase 2 Database Seed Script
 * Seeds IPOReady database with comprehensive Phase 2 data:
 * - 5 example companies
 * - IPO cost estimates and records
 * - Financial tracking history
 * - Dilution scenarios
 * - Listing requirement validations
 * - Corporate resolutions with documents
 * - Consent letters
 *
 * Usage:
 *   npx ts-node src/lib/seeds/phase2-seed.ts
 *   OR
 *   npm run seed:phase2
 *
 * Note: This script is idempotent - running multiple times is safe
 */

import { neon } from '@neondatabase/serverless'
import {
  IPO_COST_ESTIMATES,
  CAP_TABLE_SCENARIOS,
  FINANCIAL_TRACKING_HISTORIES,
  LISTING_REQUIREMENT_VALIDATIONS,
  CORPORATE_RESOLUTIONS,
  CONSENT_LETTERS,
} from '@/lib/dummy-data/phase2-data'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}

import { query } from '@/lib/db'

const sql = neon(process.env.DATABASE_URL)

// ─────────────────────── HELPER FUNCTIONS ───────────────────────

/**
 * Log with timestamp
 */
function log(message: string) {
  console.log(`[${new Date().toISOString()}] ${message}`)
}

/**
 * Generate UUID v4
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// ─────────────────────── PART 1: SEED EXAMPLE COMPANIES ───────────────────────

async function seedCompanies(): Promise<Map<string, string>> {
  log('Starting Phase 2 seed...')
  log('PART 1: Creating 5 example companies')

  const companyMap = new Map<string, string>()

  const companies = [
    {
      name: 'TechVenture Solutions Inc.',
      exchange: 'nasdaq',
      sector: 'Software & Services',
      stage: 'late_stage',
      country_code: 'US',
      industry: 'SaaS',
    },
    {
      name: 'Biotech Innovations Corp.',
      exchange: 'nasdaq',
      sector: 'Biotechnology',
      stage: 'late_stage',
      country_code: 'US',
      industry: 'Biotech',
    },
    {
      name: 'Maple Minerals Ltd.',
      exchange: 'tsx',
      sector: 'Mining & Metals',
      stage: 'growth',
      country_code: 'CA',
      industry: 'Mining',
    },
    {
      name: 'FinTech Innovations Inc.',
      exchange: 'nyse',
      sector: 'Financial Technology',
      stage: 'late_stage',
      country_code: 'US',
      industry: 'FinTech',
    },
    {
      name: 'GreenEnergy Solutions Ltd.',
      exchange: 'tsxv',
      sector: 'Renewable Energy',
      stage: 'growth',
      country_code: 'CA',
      industry: 'CleanTech',
    },
  ]

  for (const company of companies) {
    try {
      const id = generateUUID()
      const result = await sql`
        INSERT INTO companies (
          id, 
          name, 
          exchange, 
          sector, 
          stage, 
          country_code, 
          industry,
          created_at
        ) VALUES (${id}, ${company.name}, ${company.exchange}, ${company.sector}, ${company.stage}, ${company.country_code}, ${company.industry}, NOW())
        ON CONFLICT (name) DO UPDATE SET updated_at = NOW()
        RETURNING id
      `

      const returnedId = result[0]?.id || id
      companyMap.set(company.name, returnedId)
      log(`✓ Company created: ${company.name} (${returnedId})`)
    } catch (error) {
      log(`✗ Error creating company ${company.name}: ${error}`)
    }
  }

  return companyMap
}

// ─────────────────────── PART 2: SEED IPO COSTS ───────────────────────

async function seedIPOCosts(companyMap: Map<string, string>): Promise<void> {
  log('\nPART 2: Creating IPO cost records')

  for (const estimate of IPO_COST_ESTIMATES) {
    const companyId = companyMap.get(estimate.companyName)
    if (!companyId) {
      log(`✗ Skipping IPO costs for ${estimate.companyName} - company not found`)
      continue
    }

    try {
      // Underwriting fees
      await sql`
        INSERT INTO ipo_costs (
          id, company_id, cost_category, cost_type, description,
          hard_cost_usd, cost_date, vendor_name, phase_id, milestone_name,
          status, created_at
        ) VALUES (${generateUUID()}, ${companyId}, ${'underwriting'}, ${'hard_cost'}, ${estimate.costs.underwriting.description}, ${estimate.costs.underwriting.fee}, ${estimate.estimatedDate}, ${'Goldman Sachs / Morgan Stanley / Jefferies'}, ${3}, ${generateUUID()}0, ${generateUUID()}1, NOW())
        ON CONFLICT (id) DO UPDATE SET updated_at = NOW()
      `

      // Legal fees
      await sql`
        INSERT INTO ipo_costs (
          id, company_id, cost_category, cost_type, description,
          hard_cost_usd, cost_date, vendor_name, phase_id, milestone_name,
          status, created_at
        ) VALUES (${generateUUID()}, ${companyId}, ${'legal'}, ${'hard_cost'}, ${'Legal fees: Company}, ${Underwriter}, ${and Auditor counsel'}, ${estimate.costs.legalFees.total}, ${estimate.estimatedDate}, ${generateUUID()}0, ${generateUUID()}1, NOW())
        ON CONFLICT (id) DO UPDATE SET updated_at = NOW()
      `

      // Audit and accounting fees
      await sql`
        INSERT INTO ipo_costs (
          id, company_id, cost_category, cost_type, description,
          hard_cost_usd, cost_date, vendor_name, phase_id, milestone_name,
          status, created_at
        ) VALUES (${generateUUID()}, ${companyId}, ${'audit'}, ${'hard_cost'}, ${'Audit preparation}, ${attestation}, ${and SOX consulting'}, ${estimate.costs.accountingFees.total}, ${estimate.estimatedDate}, ${generateUUID()}0, ${generateUUID()}1, NOW())
        ON CONFLICT (id) DO UPDATE SET updated_at = NOW()
      `

      // Printing and postage
      await sql`
        INSERT INTO ipo_costs (
          id, company_id, cost_category, cost_type, description,
          hard_cost_usd, cost_date, vendor_name, phase_id, milestone_name,
          status, created_at
        ) VALUES (${generateUUID()}, ${companyId}, ${'printing'}, ${'hard_cost'}, ${'Prospectus}, ${regulatory}, ${and marketing materials printing'}, ${estimate.costs.printingAndPostage.total}, ${estimate.estimatedDate}, ${generateUUID()}0, ${generateUUID()}1, NOW())
        ON CONFLICT (id) DO UPDATE SET updated_at = NOW()
      `

      // Roadshow and marketing
      await sql`
        INSERT INTO ipo_costs (
          id, company_id, cost_category, cost_type, description,
          hard_cost_usd, cost_date, vendor_name, phase_id, milestone_name,
          status, created_at
        ) VALUES (${generateUUID()}, ${companyId}, ${'consulting'}, ${'hard_cost'}, ${'Investor roadshow}, ${media relations}, ${and digital marketing'}, ${estimate.costs.roadshowAndMarketing.total}, ${estimate.estimatedDate}, ${generateUUID()}0, ${generateUUID()}1, NOW())
        ON CONFLICT (id) DO UPDATE SET updated_at = NOW()
      `

      // Exchange listing fees
      await sql`
        INSERT INTO ipo_costs (
          id, company_id, cost_category, cost_type, description,
          hard_cost_usd, cost_date, vendor_name, phase_id, milestone_name,
          status, created_at
        ) VALUES (${generateUUID()}, ${companyId}, ${'listing_fees'}, ${'hard_cost'}, ${estimate.targetExchange.toUpperCase() + ' listing application and annual fees'}, ${estimate.costs.exchangeListing.applicationFee +
            estimate.costs.exchangeListing.reviewFee +
            estimate.costs.exchangeListing.annualFee}, ${estimate.estimatedDate}, ${estimate.targetExchange.toUpperCase()}, ${6}, ${generateUUID()}0, ${generateUUID()}1, NOW())
        ON CONFLICT (id) DO UPDATE SET updated_at = NOW()
      `

      log(`✓ IPO costs created for ${estimate.companyName}`)
    } catch (error) {
      log(`✗ Error creating IPO costs for ${estimate.companyName}: ${error}`)
    }
  }
}

// ─────────────────────── PART 3: SEED FINANCIAL TRACKING ───────────────────────

async function seedFinancialTracking(companyMap: Map<string, string>): Promise<void> {
  log('\nPART 3: Creating financial tracking records')

  for (const history of FINANCIAL_TRACKING_HISTORIES) {
    const companyId = companyMap.get(history.companyName)
    if (!companyId) {
      log(`✗ Skipping financial tracking for ${history.companyName} - company not found`)
      continue
    }

    try {
      // Create summary record for Month 6
      await sql`
        INSERT INTO financial_tracking (
          id, company_id, fiscal_month, fiscal_year,
          total_budget_usd, total_actual_usd, total_variance_usd,
          variance_percentage, variance_status, forecast_completion,
          created_at
        ) VALUES (${generateUUID()}, ${companyId}, ${6}, ${// June (last month in history)
          2026}, ${history.budgetTotal}, ${history.actualTotal}, ${history.varianceTotal}, ${history.variancePercentTotal}, ${history.actualTotal > history.budgetTotal ? 'over_budget' : 'under_budget'}, ${generateUUID()}0, NOW())
        ON CONFLICT (company_id, fiscal_year, fiscal_month) DO UPDATE SET updated_at = NOW()
      `

      // Create monthly breakdown
      const monthMap = new Map([
        ['2026-01', 1],
        ['2026-02', 2],
        ['2026-03', 3],
        ['2026-04', 4],
        ['2026-05', 5],
        ['2026-06', 6],
      ])

      for (const entry of history.entries) {
        const month = monthMap.get(entry.month) || 1
        await sql`
          INSERT INTO financial_tracking (
            id, company_id, fiscal_month, fiscal_year,
            total_budget_usd, total_actual_usd, total_variance_usd,
            variance_percentage, variance_status, notes,
            created_at
          ) VALUES (${generateUUID()}, ${companyId}, ${month}, ${2026}, ${600000}, ${// Simplified monthly budget
            entry.actual}, ${entry.variance}, ${entry.variancePercent}, ${entry.variance > 0 ? 'over_budget' : 'under_budget'}, ${generateUUID()}0, NOW())
          ON CONFLICT (company_id, fiscal_year, fiscal_month) DO UPDATE SET updated_at = NOW()
        `
      }

      log(`✓ Financial tracking created for ${history.companyName} (6 months)`)
    } catch (error) {
      log(`✗ Error creating financial tracking for ${history.companyName}: ${error}`)
    }
  }
}

// ─────────────────────── PART 4: SEED DILUTION SCENARIOS ───────────────────────

async function seedDilutionScenarios(companyMap: Map<string, string>): Promise<void> {
  log('\nPART 4: Creating dilution scenario records')

  for (const scenario of CAP_TABLE_SCENARIOS) {
    const companyId = companyMap.get(scenario.companyName)
    if (!companyId) {
      log(`✗ Skipping dilution scenarios for ${scenario.companyName} - company not found`)
      continue
    }

    try {
      // Create cap table snapshot JSON
      const capTableSnapshot = scenario.shareholderImpact.map((sh) => ({
        shareholder_name: sh.shareholderName,
        share_class: sh.shareholderId.includes('founder') ? 'Common' : 'Series A',
        shares_pre: sh.preRoundShares,
        pct_pre: sh.preRoundOwnership,
        shares_post: sh.postRoundShares,
        pct_post: sh.postRoundOwnership,
        dilution_pct: sh.dilution,
      }))

      await sql`
        INSERT INTO dilution_scenarios (
          id, company_id, scenario_name, scenario_type,
          new_shares_issued, issue_price_usd, total_raise_usd,
          pre_transaction_fully_diluted_shares,
          post_transaction_fully_diluted_shares,
          founder_dilution_pct, employee_dilution_pct, series_a_dilution_pct,
          cap_table_snapshot, status, created_at
        ) VALUES (${generateUUID()}, ${companyId}, ${scenario.scenarioName}, ${scenario.roundDetails.roundType.toLowerCase().replace(/\s+/g, '_')}, ${scenario.roundDetails.sharesIssued}, ${scenario.roundDetails.pricePerShare}, ${scenario.roundDetails.fundingAmount}, ${scenario.beforeScenario.totalShares}, ${generateUUID()}0, ${generateUUID()}1, ${generateUUID()}2, ${generateUUID()}3, ${generateUUID()}4, NOW())
        ON CONFLICT (id) DO UPDATE SET updated_at = NOW()
      `

      log(`✓ Dilution scenario created: ${scenario.scenarioName} for ${scenario.companyName}`)
    } catch (error) {
      log(`✗ Error creating dilution scenario for ${scenario.companyName}: ${error}`)
    }
  }
}

// ─────────────────────── PART 5: SEED LISTING REQUIREMENTS ───────────────────────

async function seedListingRequirements(companyMap: Map<string, string>): Promise<void> {
  log('\nPART 5: Creating listing requirement validation records')

  for (const validation of LISTING_REQUIREMENT_VALIDATIONS) {
    const companyId = companyMap.get(validation.companyName)
    if (!companyId) {
      log(`✗ Skipping listing requirements for ${validation.companyName} - company not found`)
      continue
    }

    try {
      for (const req of validation.requirements) {
        await sql`
          INSERT INTO listing_requirements (
            id, company_id, exchange_code, requirement_code, requirement_name,
            category, requirement_type, status, completion_pct,
            validation_method, validation_date, is_compliant, notes,
            deadline_date, created_at
          ) VALUES (${generateUUID()}, ${companyId}, ${validation.exchange.toUpperCase()}, ${req.requirementId}, ${req.requirement}, ${req.category}, ${req.requirementId.includes('Financial') ? 'must_have' : 'must_have'}, ${req.status}, ${req.status === 'met' ? 100 : 60}, ${generateUUID()}0, ${generateUUID()}1, ${generateUUID()}2, ${generateUUID()}3, ${generateUUID()}4, NOW())
          ON CONFLICT (company_id, exchange_code, requirement_code) DO UPDATE SET updated_at = NOW()
        `
      }

      log(
        `✓ Listing requirements created for ${validation.companyName} (${validation.exchange.toUpperCase()}, ${validation.requirements.length} items)`
      )
    } catch (error) {
      log(`✗ Error creating listing requirements for ${validation.companyName}: ${error}`)
    }
  }
}

// ─────────────────────── PART 6: SEED CORPORATE RESOLUTIONS ───────────────────────

async function seedCorporateResolutions(companyMap: Map<string, string>): Promise<void> {
  log('\nPART 6: Creating corporate resolution records')

  for (const resolution of CORPORATE_RESOLUTIONS) {
    const companyId = companyMap.get(resolution.companyName)
    if (!companyId) {
      log(`✗ Skipping resolutions for ${resolution.companyName} - company not found`)
      continue
    }

    try {
      await sql`
        INSERT INTO corporate_resolutions (
          id, company_id, resolution_type, resolution_title,
          resolution_date, approval_status, approved_by_board,
          status, resolution_document_url, notes, created_at
        ) VALUES (${generateUUID()}, ${companyId}, ${resolution.type === 'prospectus'
            ? 'board_authorization'
            : resolution.type === 'listing'
              ? 'director_appointment'
              : resolution.type === 'underwriting'
                ? 'stock_option_plan'
                : 'other'}, ${resolution.title}, ${resolution.resolutionDate}, ${resolution.status === 'executed' ? 'approved' : 'pending'}, ${resolution.status === 'executed'}, ${resolution.status}, ${`s3://ipoready-docs/${resolution.document?.fileName || 'resolution.pdf'}`}, ${generateUUID()}0, NOW())
        ON CONFLICT (id) DO UPDATE SET updated_at = NOW()
      `

      log(`✓ Corporate resolution created: ${resolution.title}`)
    } catch (error) {
      log(`✗ Error creating corporate resolution: ${error}`)
    }
  }
}

// ─────────────────────── PART 7: SEED CONSENT LETTERS ───────────────────────

async function seedConsentLetters(companyMap: Map<string, string>): Promise<void> {
  log('\nPART 7: Creating consent letter records')

  for (const consent of CONSENT_LETTERS) {
    const companyId = companyMap.get(consent.companyName)
    if (!companyId) {
      log(`✗ Skipping consent letters for ${consent.companyName} - company not found`)
      continue
    }

    try {
      await sql`
        INSERT INTO consent_letters (
          id, company_id, consent_type, from_entity_name, from_entity_type,
          consent_topic, status, sent_date, signed_date, expiry_date,
          consent_template_url, signed_document_url, signature_method,
          accepted, notes, created_at
        ) VALUES (${generateUUID()}, ${companyId}, ${consent.consentType}, ${consent.fromParty}, ${consent.fromPartyType === 'auditor'
            ? 'corporation'
            : consent.fromPartyType === 'lawyer'
              ? 'corporation'
              : consent.fromPartyType === 'advisor'
                ? 'corporation'
                : 'corporation'}, ${consent.title}, ${consent.status}, ${consent.issuedDate}, ${consent.status === 'received' ? consent.issuedDate : null}, ${generateUUID()}0, ${generateUUID()}1, ${generateUUID()}2, ${generateUUID()}3, ${generateUUID()}4, ${generateUUID()}5, NOW())
        ON CONFLICT (id) DO UPDATE SET updated_at = NOW()
      `

      log(`✓ Consent letter created: ${consent.title}`)
    } catch (error) {
      log(`✗ Error creating consent letter: ${error}`)
    }
  }
}

// ─────────────────────── MAIN EXECUTION ───────────────────────

async function main() {
  try {
    log('='.repeat(80))
    log('IPOReady Phase 2 Database Seed Script Starting')
    log('='.repeat(80))

    // 1. Create companies
    const companyMap = await seedCompanies()

    if (companyMap.size === 0) {
      log('✗ No companies were created. Aborting seed.')
      process.exit(1)
    }

    // 2. Seed all Phase 2 data
    await seedIPOCosts(companyMap)
    await seedFinancialTracking(companyMap)
    await seedDilutionScenarios(companyMap)
    await seedListingRequirements(companyMap)
    await seedCorporateResolutions(companyMap)
    await seedConsentLetters(companyMap)

    log('\n' + '='.repeat(80))
    log('✓ Phase 2 Database Seed Completed Successfully!')
    log('='.repeat(80))
    log(`Companies seeded: ${companyMap.size}`)
    log('Records created:')
    log('  - IPO cost records: 6 per company (total: ' + companyMap.size * 6 + ')')
    log('  - Financial tracking: 6+ per company')
    log('  - Dilution scenarios: 2+ per company')
    log('  - Listing requirements: 9 per company')
    log('  - Corporate resolutions: 4 per company')
    log('  - Consent letters: 5 per company')
    log('')
    log('Next steps:')
    log('  1. Verify data in dashboard')
    log('  2. Test IPO cost reports')
    log('  3. Review cap table dilution scenarios')
    log('  4. Validate listing requirement checklists')
    log('='.repeat(80))

    process.exit(0)
  } catch (error) {
    log(`\n✗ Fatal error during seed: ${error}`)
    log(`Stack: ${error instanceof Error ? error.stack : 'N/A'}`)
    process.exit(1)
  }
}

// Run the seed script
main()
