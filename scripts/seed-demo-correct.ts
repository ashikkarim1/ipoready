/**
 * Production Demo Data Seeding Script - Corrected Schema
 * Populates demo data for:
 * - Cap Table with shareholders and holdings
 * - Material Contracts Network (stored in documents)
 * - Share classes and vesting schedules
 */

import * as dotenv from 'dotenv'
dotenv.config()
import { sql } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

// Helper function to generate UUID
const newId = () => uuidv4()

async function seedDemoData() {
  try {
    console.log('🚀 Starting IPOReady Production Demo Data Seed...\n')

    // Get existing test user
    console.log('📝 Fetching test user...')
    const userResult = await sql`SELECT id, company_id FROM users WHERE email = 'test@ipoready.com' LIMIT 1` as any[]
    
    if (!userResult || userResult.length === 0) {
      console.error('❌ Test user not found. Please create test@ipoready.com first.')
      process.exit(1)
    }
    
    const userId = userResult[0].id
    let companyId = userResult[0].company_id
    
    console.log(`✅ Test user found: ${userId}`)

    // If no company, create one
    if (!companyId) {
      console.log('\n🏢 Creating company profile...')
      companyId = newId()
      const ipoDate = new Date()
      ipoDate.setFullYear(ipoDate.getFullYear() + 1)
      
      await sql`
        INSERT INTO companies (
          id, owner_id, name, target_exchange, current_phase, 
          listing_type, currency, language, created_at
        ) VALUES (
          ${companyId},
          ${userId},
          'TechVenture AI',
          'nasdaq',
          'phase_2',
          'direct_listing',
          'USD',
          'en',
          NOW()
        )
      `
      console.log('✅ Company created: TechVenture AI')
    } else {
      console.log(`✅ Company found: ${companyId}`)
    }

    // Create Cap Table Document
    console.log('\n📊 Setting up Cap Table Document...')
    const capTableDocId = newId()
    
    await sql`
      INSERT INTO cap_table_documents (
        id, company_id, document_name, document_version, 
        validation_status, is_fully_diluted, uploaded_by, created_at
      ) VALUES (
        ${capTableDocId},
        ${companyId},
        'Series C Cap Table',
        1,
        'valid',
        true,
        ${userId},
        NOW()
      )
      ON CONFLICT DO NOTHING
    `
    console.log('✅ Cap Table document created')

    // Create Share Classes
    console.log('\n📋 Creating share classes...')
    const shareClasses = [
      { name: 'Common', code: 'A', preference: 4, voting: 1.0 },
      { name: 'Series A Preferred', code: 'A-1', preference: 3, voting: 1.0 },
      { name: 'Series B Preferred', code: 'B-1', preference: 2, voting: 1.0 },
      { name: 'Series C Preferred', code: 'C-1', preference: 1, voting: 1.0 },
    ]

    const shareClassIds: Record<string, string> = {}
    for (const sc of shareClasses) {
      const scId = newId()
      shareClassIds[sc.code] = scId
      
      await sql`
        INSERT INTO share_classes_v2 (
          id, cap_table_document_id, company_id, class_name, class_code,
          preference_order, voting_rights, created_at
        ) VALUES (
          ${scId}, ${capTableDocId}, ${companyId}, ${sc.name}, ${sc.code},
          ${sc.preference}, ${sc.voting}, NOW()
        )
        ON CONFLICT DO NOTHING
      `
    }
    console.log(`✅ Created ${shareClasses.length} share classes`)

    // Create Shareholders
    console.log('\n👥 Creating shareholders...')
    const shareholders = [
      { name: 'Founders', type: 'individual', country: 'US' },
      { name: 'Seed Round Investors', type: 'fund', country: 'US' },
      { name: 'Series A Investors', type: 'fund', country: 'US' },
      { name: 'Series B Investors', type: 'fund', country: 'US' },
      { name: 'Series C Investors', type: 'fund', country: 'US' },
      { name: 'Employee Stock Option Pool', type: 'esop', country: 'US' },
    ]

    const shareholderIds: string[] = []
    for (const sh of shareholders) {
      const shId = newId()
      shareholderIds.push(shId)
      
      await sql`
        INSERT INTO shareholders (
          id, cap_table_document_id, company_id, shareholder_name,
          shareholder_type, country_incorporation, created_at
        ) VALUES (
          ${shId}, ${capTableDocId}, ${companyId}, ${sh.name},
          ${sh.type}, ${sh.country}, NOW()
        )
        ON CONFLICT DO NOTHING
      `
    }
    console.log(`✅ Created ${shareholders.length} shareholders`)

    // Create Holdings
    console.log('\n💼 Creating holdings and vesting schedules...')
    const holdingsData = [
      { sh: 0, shares: 5000000, class: 'A', vesting_months: 48, cliff: 12 }, // Founders
      { sh: 1, shares: 1000000, class: 'A-1', vesting_months: 48, cliff: 12 }, // Seed
      { sh: 2, shares: 1500000, class: 'B-1', vesting_months: 48, cliff: 12 }, // Series A
      { sh: 3, shares: 2000000, class: 'B-1', vesting_months: 48, cliff: 12 }, // Series B
      { sh: 4, shares: 2500000, class: 'C-1', vesting_months: 48, cliff: 12 }, // Series C
      { sh: 5, shares: 500000, class: 'A', vesting_months: 48, cliff: 12 }, // ESOP
    ]

    for (const holding of holdingsData) {
      const holdingId = newId()
      const vestingId = newId()
      const grantDate = new Date()
      grantDate.setFullYear(grantDate.getFullYear() - 2)
      
      await sql`
        INSERT INTO holdings (
          id, cap_table_document_id, company_id, shareholder_id, share_class_id,
          quantity, quantity_issued, holding_type, grant_date, currency, created_at
        ) VALUES (
          ${holdingId}, ${capTableDocId}, ${companyId},
          ${shareholderIds[holding.sh]}, ${shareClassIds[holding.class]},
          ${holding.shares}, ${holding.shares}, 'equity', ${grantDate}, 'USD', NOW()
        )
        ON CONFLICT DO NOTHING
      `

      // Create vesting schedule
      const vestingStart = new Date(grantDate)
      const vestingEnd = new Date(vestingStart)
      vestingEnd.setMonth(vestingEnd.getMonth() + holding.vesting_months)
      const cliffDate = new Date(vestingStart)
      cliffDate.setMonth(cliffDate.getMonth() + holding.cliff)

      await sql`
        INSERT INTO vesting_schedules (
          id, holding_id, company_id, vesting_start_date, vesting_end_date,
          cliff_months, cliff_date, total_vesting_months, vesting_frequency, created_at
        ) VALUES (
          ${vestingId}, ${holdingId}, ${companyId}, ${vestingStart}, ${vestingEnd},
          ${holding.cliff}, ${cliffDate}, ${holding.vesting_months}, 'monthly', NOW()
        )
        ON CONFLICT DO NOTHING
      `
    }
    console.log(`✅ Created ${holdingsData.length} holdings with vesting schedules`)

    // Create Material Contracts as Documents
    console.log('\n📄 Creating Material Contracts Network...')
    const contracts = [
      { name: 'Series C Investment Agreement', type: 'contract', phase: 'phase_3' },
      { name: 'Lead Investor Rights Agreement', type: 'contract', phase: 'phase_3' },
      { name: 'Investor Proxy Agreement', type: 'contract', phase: 'phase_3' },
      { name: 'Co-Sale & Drag-Along Rights', type: 'contract', phase: 'phase_3' },
      { name: 'Anti-Dilution Provisions', type: 'contract', phase: 'phase_2' },
      { name: 'Board Representation Agreement', type: 'contract', phase: 'phase_3' },
      { name: 'Voting Agreement', type: 'contract', phase: 'phase_2' },
      { name: 'Information & Inspection Rights', type: 'contract', phase: 'phase_3' },
      { name: 'Redemption Preferences', type: 'contract', phase: 'phase_3' },
      { name: 'Registration Rights Agreement', type: 'contract', phase: 'phase_3' },
    ]

    for (const contract of contracts) {
      const contractId = newId()
      
      await sql`
        INSERT INTO documents (
          id, company_id, name, type, status, phase, required,
          for_filing, uploaded_by, created_at, updated_at
        ) VALUES (
          ${contractId}, ${companyId}, ${contract.name}, ${contract.type},
          'executed', ${contract.phase}, true, true, ${userId},
          NOW(), NOW()
        )
        ON CONFLICT DO NOTHING
      `
    }
    console.log(`✅ Created ${contracts.length} material contracts`)

    console.log('\n✨ Demo data seeded successfully!')
    console.log(`\nCompany ID: ${companyId}`)
    console.log(`Test URL: https://ipoready.ai/login`)
    console.log(`Email: test@ipoready.com`)
    console.log(`Password: TestIPO2026!`)

  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }
}

seedDemoData()
