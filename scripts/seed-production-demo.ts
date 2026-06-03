/**
 * Production Demo Data Seeding Script
 * Seeds comprehensive test data for test@ipoready.com showcasing:
 * - Material Contracts Network visualization
 * - Share Dilution & Cap Table module
 * - Complete financial KPI tracking
 * - IPO readiness dashboard
 */

import * as dotenv from 'dotenv'
dotenv.config()

import { sql } from '@/lib/db'
import { nanoid } from 'nanoid'

// Color coding for contract status
const CONTRACT_STATUSES = {
  EXECUTED: 'executed',
  PENDING: 'pending',
  MISSING: 'missing',
  REVISED: 'revised',
}

const RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
}

// Material contracts data structure
const MATERIAL_CONTRACTS = [
  {
    name: 'Lead Bank Agreement',
    category: 'Banking',
    status: CONTRACT_STATUSES.EXECUTED,
    riskLevel: RISK_LEVELS.LOW,
    description: 'Primary banking relationship and credit facility',
    relatedDocuments: ['Credit Agreement', 'Pledge Agreement'],
  },
  {
    name: 'Lead Underwriter Agreement',
    category: 'Underwriting',
    status: CONTRACT_STATUSES.EXECUTED,
    riskLevel: RISK_LEVELS.LOW,
    description: 'Lead underwriter commitment and terms',
    relatedDocuments: ['Engagement Letter', 'Fee Schedule'],
  },
  {
    name: 'Credit Agreement',
    category: 'Banking',
    status: CONTRACT_STATUSES.EXECUTED,
    riskLevel: RISK_LEVELS.LOW,
    description: 'Revolving credit facility terms',
    relatedDocuments: ['Lead Bank Agreement'],
  },
  {
    name: 'Master Lease Agreement',
    category: 'Facilities',
    status: CONTRACT_STATUSES.EXECUTED,
    riskLevel: RISK_LEVELS.MEDIUM,
    description: 'Office and operational space lease',
    relatedDocuments: ['Lease Addendums', 'Landlord Consent'],
  },
  {
    name: 'Key Employee Non-Compete',
    category: 'HR & Legal',
    status: CONTRACT_STATUSES.PENDING,
    riskLevel: RISK_LEVELS.MEDIUM,
    description: 'Restrictions on employment during IPO period',
    relatedDocuments: ['Employment Agreements'],
  },
  {
    name: 'Major Customer Contract',
    category: 'Commercial',
    status: CONTRACT_STATUSES.EXECUTED,
    riskLevel: RISK_LEVELS.HIGH,
    description: 'Top 3 customer representing 25% of revenue',
    relatedDocuments: ['Pricing Schedules', 'SLA Addendums'],
  },
  {
    name: 'Technology License Agreement',
    category: 'IP & Technology',
    status: CONTRACT_STATUSES.REVISED,
    riskLevel: RISK_LEVELS.MEDIUM,
    description: 'Critical SaaS platform licensing',
    relatedDocuments: ['License Schedule', 'IP Indemnity'],
  },
  {
    name: 'Pledge Agreement',
    category: 'Collateral',
    status: CONTRACT_STATUSES.EXECUTED,
    riskLevel: RISK_LEVELS.LOW,
    description: 'Collateral pledge for credit facility',
    relatedDocuments: ['Lead Bank Agreement', 'UCC-1 Filing'],
  },
  {
    name: 'Supplier Agreement',
    category: 'Commercial',
    status: CONTRACT_STATUSES.MISSING,
    riskLevel: RISK_LEVELS.MEDIUM,
    description: 'Primary component supplier agreement',
    relatedDocuments: [],
  },
  {
    name: 'Insurance Policies',
    category: 'Risk Management',
    status: CONTRACT_STATUSES.EXECUTED,
    riskLevel: RISK_LEVELS.LOW,
    description: 'D&O and general liability coverage',
    relatedDocuments: ['Policy Documents', 'Broker Letters'],
  },
]

// Cap table data
const EQUITY_ROUNDS = [
  {
    round: 'Seed',
    date: '2021-03-15',
    investorName: 'Founders',
    shares: 10000000,
    pricePerShare: 0.01,
    totalRaised: 100000,
  },
  {
    round: 'Series A',
    date: '2022-06-20',
    investorName: 'Sequoia Capital',
    shares: 5000000,
    pricePerShare: 0.25,
    totalRaised: 1250000,
  },
  {
    round: 'Series B',
    date: '2023-11-10',
    investorName: 'Andreessen Horowitz',
    shares: 3333333,
    pricePerShare: 0.75,
    totalRaised: 2500000,
  },
  {
    round: 'Series C',
    date: '2024-09-01',
    investorName: 'Tiger Global',
    shares: 2000000,
    pricePerShare: 2.00,
    totalRaised: 4000000,
  },
]

// Financial tracking data (12 months)
const FINANCIAL_TRACKING_DATA = [
  { month: '2024-01', budgeted: 250000, actual: 245000 },
  { month: '2024-02', budgeted: 250000, actual: 260000 },
  { month: '2024-03', budgeted: 275000, actual: 268000 },
  { month: '2024-04', budgeted: 275000, actual: 285000 },
  { month: '2024-05', budgeted: 300000, actual: 310000 },
  { month: '2024-06', budgeted: 300000, actual: 295000 },
  { month: '2024-07', budgeted: 325000, actual: 340000 },
  { month: '2024-08', budgeted: 325000, actual: 335000 },
  { month: '2024-09', budgeted: 350000, actual: 355000 },
  { month: '2024-10', budgeted: 350000, actual: 365000 },
  { month: '2024-11', budgeted: 375000, actual: 380000 },
  { month: '2024-12', budgeted: 375000, actual: 390000 },
]

async function seedProductionDemo() {
  console.log('🚀 Starting IPOReady Production Demo Data Seed...\n')

  try {
    // Step 1: Get existing test user (assumes user already exists from production)
    console.log('📝 Fetching test user...')
    const userResult = await sql`SELECT id, email FROM users WHERE email = 'test@ipoready.com' LIMIT 1` as any[]
    
    if (!userResult || userResult.length === 0) {
      console.error('❌ Test user not found. Please create test@ipoready.com first.')
      process.exit(1)
    }
    
    const userId = userResult[0].id
    const companyId = nanoid()
    console.log(`✅ Test user found: ${userResult[0].email} (ID: ${userId})`)

    // Step 2: Create company profile
    console.log('\n🏢 Setting up company profile...')
    const ipoDate = new Date()
    ipoDate.setFullYear(ipoDate.getFullYear() + 1) // 1 year from now

    await sql`
      INSERT INTO companies (
        id, user_id, name, exchange, status, ipo_timeline_date, created_at, updated_at
      ) VALUES (
        ${companyId},
        ${userId},
        'TechVenture AI',
        'nasdaq',
        'preparing',
        ${ipoDate.toISOString()},
        NOW(),
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        exchange = 'nasdaq',
        ipo_timeline_date = ${ipoDate.toISOString()},
        updated_at = NOW()
    `
    console.log('✅ Company profile: TechVenture AI (NASDAQ target)')

    // Step 3: Seed material contracts
    console.log('\n📄 Seeding material contracts network...')
    const contractIds: Record<string, string> = {}

    for (const contract of MATERIAL_CONTRACTS) {
      const contractId = nanoid()
      contractIds[contract.name] = contractId

      await sql`
        INSERT INTO documents (
          id, company_id, title, document_type, status, risk_level, category, description, created_at, updated_at
        ) VALUES (
          ${contractId},
          ${companyId},
          ${contract.name},
          'contract',
          ${contract.status},
          ${contract.riskLevel},
          ${contract.category},
          ${contract.description},
          NOW(),
          NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          status = ${contract.status},
          risk_level = ${contract.riskLevel},
          updated_at = NOW()
      `
    }
    console.log(`✅ Seeded ${MATERIAL_CONTRACTS.length} material contracts`)

    // Step 4: Create contract relationships
    console.log('\n🔗 Creating contract relationships...')
    const relationships = [
      ['Lead Bank Agreement', 'Credit Agreement'],
      ['Lead Bank Agreement', 'Pledge Agreement'],
      ['Credit Agreement', 'Pledge Agreement'],
      ['Lead Underwriter Agreement', 'Engagement Letter'],
      ['Master Lease Agreement', 'Landlord Consent'],
      ['Major Customer Contract', 'Pricing Schedules'],
    ]

    let relationshipCount = 0
    for (const [source, target] of relationships) {
      if (contractIds[source] && contractIds[target]) {
        await sql`
          INSERT INTO contract_relationships (
            source_id, target_id, relationship_type, created_at
          ) VALUES (
            ${contractIds[source]},
            ${contractIds[target]},
            'references',
            NOW()
          )
          ON CONFLICT (source_id, target_id) DO NOTHING
        `
        relationshipCount++
      }
    }
    console.log(`✅ Created ${relationshipCount} contract relationships`)

    // Step 5: Seed cap table / equity rounds
    console.log('\n📊 Seeding cap table and equity rounds...')
    let totalShares = 0
    let totalFunding = 0

    for (const round of EQUITY_ROUNDS) {
      const roundId = nanoid()
      totalShares += round.shares
      totalFunding += round.totalRaised

      await sql`
        INSERT INTO equity_rounds (
          id, company_id, round_name, date, investor_name, shares_issued, price_per_share, total_raised, created_at
        ) VALUES (
          ${roundId},
          ${companyId},
          ${round.round},
          ${round.date},
          ${round.investorName},
          ${round.shares},
          ${round.pricePerShare},
          ${round.totalRaised},
          NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          shares_issued = ${round.shares},
          price_per_share = ${round.pricePerShare},
          total_raised = ${round.totalRaised}
      `
    }
    console.log(`✅ Seeded ${EQUITY_ROUNDS.length} equity rounds`)
    console.log(`   Total shares issued: ${totalShares.toLocaleString()}`)
    console.log(`   Total funding raised: $${totalFunding.toLocaleString()}`)

    // Step 6: Create IPO costs record
    console.log('\n💰 Setting up IPO financial tracking...')
    const ipoCostId = nanoid()
    const estimatedTotal = 5500000 // $5.5M estimated IPO costs

    await sql`
      INSERT INTO ipo_costs (
        id, company_id, total_estimated, currency, created_at, updated_at
      ) VALUES (
        ${ipoCostId},
        ${companyId},
        ${estimatedTotal},
        'USD',
        NOW(),
        NOW()
      )
      ON CONFLICT (company_id) DO UPDATE SET
        total_estimated = ${estimatedTotal},
        updated_at = NOW()
    `
    console.log(`✅ IPO costs record created: $${estimatedTotal.toLocaleString()}`)

    // Step 7: Seed financial tracking data
    console.log('\n📈 Seeding 12 months of financial tracking...')
    let totalActualSpent = 0

    for (const monthData of FINANCIAL_TRACKING_DATA) {
      const trackingId = nanoid()
      totalActualSpent += monthData.actual

      await sql`
        INSERT INTO financial_tracking (
          id, ipo_cost_id, month, budgeted_amount, actual_spent, status, created_at
        ) VALUES (
          ${trackingId},
          ${ipoCostId},
          ${monthData.month},
          ${monthData.budgeted},
          ${monthData.actual},
          'tracked',
          NOW()
        )
        ON CONFLICT (ipo_cost_id, month) DO UPDATE SET
          budgeted_amount = ${monthData.budgeted},
          actual_spent = ${monthData.actual}
      `
    }
    console.log(`✅ Seeded 12 months of financial data`)
    console.log(`   Total spent to date: $${totalActualSpent.toLocaleString()}`)
    console.log(`   Runway remaining: $${(estimatedTotal - totalActualSpent).toLocaleString()}`)

    // Step 8: Create compliance checklist
    console.log('\n✓ Setting up onboarding checklist...')
    const checklistItems = [
      {
        category: 'Corporate Governance',
        items: [
          'Board Independence Audit',
          'Sarbanes-Oxley Compliance (SOX 302/404)',
          'Audit Committee Establishment',
          'Code of Conduct Adoption',
        ],
      },
      {
        category: 'Financial Reporting',
        items: [
          'Audited Financial Statements (3 years)',
          'Internal Controls Assessment',
          'MD&A Documentation',
          'Risk Factor Analysis',
        ],
      },
      {
        category: 'Legal & Regulatory',
        items: [
          'Material Contracts Review',
          'IP Rights Clearance',
          'Regulatory Compliance Audit',
          'Litigation Review',
        ],
      },
      {
        category: 'Documentation',
        items: [
          'Prospectus Drafting',
          'Cap Table Verification',
          'Shareholder Approval Minutes',
          'Registration Statement Completion',
        ],
      },
    ]

    let totalItems = 0
    let completedItems = 0

    for (const categoryData of checklistItems) {
      for (const itemName of categoryData.items) {
        const itemId = nanoid()
        const isCompleted = Math.random() > 0.4 // 60% completion rate
        totalItems++
        if (isCompleted) completedItems++

        await sql`
          INSERT INTO onboarding_items (
            id, company_id, item_name, category, required, status, completed_at, estimated_days, created_at
          ) VALUES (
            ${itemId},
            ${companyId},
            ${itemName},
            ${categoryData.category},
            true,
            ${isCompleted ? 'completed' : 'pending'},
            ${isCompleted ? new Date().toISOString() : null},
            ${Math.floor(Math.random() * 30) + 5},
            NOW()
          )
          ON CONFLICT (id) DO UPDATE SET
            status = ${isCompleted ? 'completed' : 'pending'}
        `
      }
    }
    console.log(`✅ Seeded ${totalItems} checklist items`)
    console.log(`   Completion progress: ${Math.round((completedItems / totalItems) * 100)}%`)

    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('✨ PRODUCTION DEMO DATA SEEDING COMPLETE')
    console.log('='.repeat(60))
    console.log('\n📋 Dataset Summary:')
    console.log(`  Company: TechVenture AI`)
    console.log(`  Target Exchange: NASDAQ`)
    console.log(`  IPO Target Date: ${ipoDate.toLocaleDateString()}`)
    console.log(`  Material Contracts: ${MATERIAL_CONTRACTS.length}`)
    console.log(`  Equity Rounds: ${EQUITY_ROUNDS.length}`)
    console.log(`  Total Funding: $${totalFunding.toLocaleString()}`)
    console.log(`  Total Shares: ${totalShares.toLocaleString()}`)
    console.log(`  Financial Months: 12`)
    console.log(`  IPO Cost Budget: $${estimatedTotal.toLocaleString()}`)
    console.log(`  Actual Spent: $${totalActualSpent.toLocaleString()}`)
    console.log(`  Runway: $${(estimatedTotal - totalActualSpent).toLocaleString()}`)
    console.log(`  Onboarding Items: ${totalItems}`)
    console.log(`  Completion: ${Math.round((completedItems / totalItems) * 100)}%`)
    console.log('\n🔓 Login Credentials:')
    console.log('  Email: test@ipoready.com')
    console.log('  Password: TestPassword123!')
    console.log('\n📍 Featured Dashboards:')
    console.log('  → Material Contracts Network: /dashboard/documents/contracts-map')
    console.log('  → Share Dilution / Cap Table: /dashboard/compliance/dilution')
    console.log('  → Financial KPI Tracking: /dashboard/financial-mgmt/tracking')
    console.log('  → IPO Readiness: /dashboard')
    console.log('\n')

    process.exit(0)
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }
}

seedProductionDemo()
