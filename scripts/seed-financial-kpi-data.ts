/**
 * Seed script for Financial KPI Dashboard
 * Generates realistic sample financial tracking data for IPO dashboard testing
 *
 * Usage: npx ts-node scripts/seed-financial-kpi-data.ts
 */

import { db } from '@/lib/db'
import { companies, ipoCosts, financialTracking } from '@/db/schema'
import { eq } from 'drizzle-orm'

interface SeedOptions {
  companyId?: string
  months?: number
  overrunPercent?: number
}

/**
 * Generate sample financial data
 */
async function seedFinancialKPIData(options: SeedOptions = {}) {
  const {
    companyId = '550e8400-e29b-41d4-a716-446655440001',
    months = 6,
    overrunPercent = 10,
  } = options

  try {
    console.log('Starting Financial KPI data seed...')

    // Check if company exists, create if not
    let company = await db.query.companies.findFirst({
      where: eq(companies.id, companyId),
    })

    if (!company) {
      console.log('Creating sample company...')
      await db.insert(companies).values({
        id: companyId,
        name: 'Sample IPO Company',
        ipo_timeline_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days from now
      })
    }

    // Check if IPO costs exist, create if not
    let ipoCost = await db.query.ipoCosts.findFirst({
      where: eq(ipoCosts.company_id, companyId),
    })

    if (!ipoCost) {
      console.log('Creating IPO costs record...')
      const costRecord = await db
        .insert(ipoCosts)
        .values({
          company_id: companyId,
          exchange: 'NASDAQ',
          estimated_legal: 500000,
          estimated_accounting: 300000,
          estimated_underwriting: 400000,
          estimated_printing: 50000,
          estimated_filing: 25000,
          estimated_contingency: 225000,
          currency: 'USD',
        })
        .returning()

      ipoCost = costRecord[0]
      console.log(
        `Created IPO costs: $${(ipoCost.total_estimated as any).toString()} total`
      )
    }

    // Generate monthly financial tracking data
    console.log(`Generating ${months} months of financial tracking data...`)

    const baseBudget = 150000 // Base monthly budget
    const baseCost = 125000 // Base actual spending

    for (let i = 0; i < months; i++) {
      const date = new Date()
      date.setMonth(date.getMonth() - (months - i - 1))
      date.setDate(1) // First day of month

      // Add variance based on month (simulate trending overspend)
      const varianceMonth = (i / months) * overrunPercent * 0.01
      const budgetedAmount = baseBudget
      const actualSpent = Math.round(baseCost * (1 + varianceMonth))

      const month = date.toISOString().split('T')[0]

      try {
        await db.insert(financialTracking).values({
          ipo_cost_id: ipoCost!.id,
          month: new Date(month),
          budgeted_amount: budgetedAmount,
          actual_spent: actualSpent,
          status:
            actualSpent > budgetedAmount * 1.1
              ? 'over-budget'
              : actualSpent < budgetedAmount * 0.95
                ? 'under-budget'
                : 'on-track',
          notes: `Month ${i + 1} of IPO preparation cycle`,
        })

        console.log(
          `  ${month}: Budget $${budgetedAmount}, Actual $${actualSpent} (${(
            ((actualSpent - budgetedAmount) / budgetedAmount) *
            100
          ).toFixed(1)}%)`
        )
      } catch (err: any) {
        // Handle duplicate key errors gracefully
        if (err.message?.includes('duplicate')) {
          console.log(`  ${month}: Record already exists, skipping...`)
        } else {
          throw err
        }
      }
    }

    console.log('\nFinancial KPI data seed completed successfully!')
    console.log('\nSummary:')
    console.log(`- Company ID: ${companyId}`)
    console.log(`- Months seeded: ${months}`)
    console.log(`- Cost overrun: ${overrunPercent}%`)
    console.log(`- Base monthly budget: $${baseBudget.toLocaleString()}`)
    console.log(`- Base monthly spend: $${baseCost.toLocaleString()}`)
    console.log('\nAccess the dashboard at: /dashboard/financial-mgmt/tracking')
  } catch (error) {
    console.error('Error seeding financial KPI data:', error)
    process.exit(1)
  }
}

/**
 * Seed comprehensive risk scenario
 */
async function seedRiskScenario(companyId: string) {
  console.log('\nSeeding risk scenario data...')

  // This would create data that triggers various risk factors:
  // 1. Significant cost overrun (>20%)
  // 2. Tight runway
  // 3. Accelerating burn rate
  // 4. Overspending trend

  await seedFinancialKPIData({
    companyId,
    months: 9,
    overrunPercent: 25, // 25% overrun to trigger critical risk
  })
}

/**
 * Seed healthy scenario
 */
async function seedHealthyScenario(companyId: string) {
  console.log('\nSeeding healthy scenario data...')

  // Create data showing good financial health:
  // 1. Under budget
  // 2. Good runway
  // 3. Stable burn rate
  // 4. On-track trend

  await seedFinancialKPIData({
    companyId,
    months: 6,
    overrunPercent: -5, // Slightly under budget
  })
}

// Main execution
const scenario = process.argv[2] || 'default'
const companyId = process.argv[3] || '550e8400-e29b-41d4-a716-446655440001'

if (scenario === 'risk') {
  seedRiskScenario(companyId)
} else if (scenario === 'healthy') {
  seedHealthyScenario(companyId)
} else {
  seedFinancialKPIData({ companyId })
}
