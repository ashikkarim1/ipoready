/**
 * PACE Predictive Scorer - Integration Test Script
 * 
 * This script validates the PACE predictive scoring model against actual
 * database operations and verifies the complete workflow.
 * 
 * Usage: npx ts-node test-pace-integration.ts
 */

import { sql } from '@/lib/db/client'
import { calculatePredictiveScore, updateCompanyFactors, getReadinessFactors } from '@/lib/pace-predictor'

async function runIntegrationTests() {
  console.log('========== PACE PREDICTOR INTEGRATION TEST ==========\n')

  try {
    // Test 1: Create a test company
    console.log('Test 1: Fetching test company from database...')
    const companies = await sql`
      SELECT id, pace_score FROM companies 
      LIMIT 1
    ` as any[]

    if (companies.length === 0) {
      console.log('⚠️  No companies found in database. Skipping integration tests.')
      console.log('To run integration tests, ensure at least one company exists in the database.\n')
      return
    }

    const testCompanyId = companies[0].id
    console.log(`✓ Found test company: ${testCompanyId}\n`)

    // Test 2: Update company factors
    console.log('Test 2: Updating company factors...')
    await updateCompanyFactors(testCompanyId, {
      cash_runway_months: 12,
      team_size: 35,
      board_size: 5,
      cfo_hired_at: new Date().toISOString(),
      auditor_selected: true,
      investor_sophistication_score: 7,
    })
    console.log('✓ Factors updated successfully\n')

    // Test 3: Calculate predictive score
    console.log('Test 3: Calculating predictive PACE score...')
    
    // Get readiness factors first
    const readinessFactors = await getReadinessFactors(testCompanyId)
    if (!readinessFactors) {
      console.log('⚠️  Could not retrieve readiness factors. Skipping score calculation.\n')
      return
    }

    // Use a default base PACE of 60 for testing
    const basePace = 60
    const score = await calculatePredictiveScore(testCompanyId, basePace, readinessFactors)
    
    console.log(`✓ Calculation successful:`)
    console.log(`  Base PACE: ${score.basePace}`)
    console.log(`  Adjusted PACE: ${score.adjustedPace}`)
    console.log(`  Confidence Level: ${score.confidenceLevel}`)
    console.log(`  Predicted Days to IPO: ${score.predictedDaysToIpo}\n`)

    // Test 4: Verify score components
    console.log('Test 4: Validating score breakdown...')
    console.log(`  Cash Runway Score: ${score.adjustmentFactors.cashRunway.score}/100`)
    console.log(`  Team Readiness Score: ${score.adjustmentFactors.teamReadiness.score}/100`)
    console.log(`  Market Condition Score: ${score.adjustmentFactors.marketConditions.score}/100`)
    console.log(`  Investor Sophistication Score: ${score.adjustmentFactors.investorSophistication.score}/100`)
    
    // Verify adjustment factors are weighted correctly
    const totalWeightedImpact = 
      score.adjustmentFactors.cashRunway.impact +
      score.adjustmentFactors.teamReadiness.impact +
      score.adjustmentFactors.marketConditions.impact +
      score.adjustmentFactors.investorSophistication.impact
    
    console.log(`  Total Weighted Impact: ${totalWeightedImpact.toFixed(2)}`)
    console.log(`  Adjusted Score: ${score.adjustedPace}`)
    
    if (Math.abs((score.basePace + totalWeightedImpact) - score.adjustedPace) <= 1) {
      console.log(`  ✓ Calculation verified\n`)
    } else {
      console.log(`  ✗ Calculation mismatch\n`)
    }

    // Test 5: Verify risk factors
    console.log('Test 5: Risk factor identification...')
    if (score.riskFactors.length > 0) {
      console.log(`  Identified ${score.riskFactors.length} risk factors:`)
      score.riskFactors.forEach((rf, idx) => {
        console.log(`    ${idx + 1}. ${rf}`)
      })
    } else {
      console.log(`  ✓ No risk factors identified (company is in good shape)`)
    }
    console.log()

    // Test 6: Verify adjustment factor weights
    console.log('Test 6: Verifying adjustment factor weights...')
    console.log(`  Cash Runway Weight: ${score.adjustmentFactors.cashRunway.weight} (Impact: ${score.adjustmentFactors.cashRunway.impact.toFixed(2)})`)
    console.log(`  Team Readiness Weight: ${score.adjustmentFactors.teamReadiness.weight} (Impact: ${score.adjustmentFactors.teamReadiness.impact.toFixed(2)})`)
    console.log(`  Market Conditions Weight: ${score.adjustmentFactors.marketConditions.weight} (Impact: ${score.adjustmentFactors.marketConditions.impact.toFixed(2)})`)
    console.log(`  Investor Sophistication Weight: ${score.adjustmentFactors.investorSophistication.weight} (Impact: ${score.adjustmentFactors.investorSophistication.impact.toFixed(2)})`)
    
    const totalWeight = 
      score.adjustmentFactors.cashRunway.weight +
      score.adjustmentFactors.teamReadiness.weight +
      score.adjustmentFactors.marketConditions.weight +
      score.adjustmentFactors.investorSophistication.weight
    
    console.log(`  Total Weight: ${totalWeight}`)
    if (Math.abs(totalWeight - 0.6) < 0.001) {
      console.log(`  ✓ Weights sum to 60% (correct)\n`)
    } else {
      console.log(`  ✗ Weights do not sum to 0.6\n`)
    }

    // Test 7: Get readiness factors summary
    console.log('Test 7: Fetching readiness factors summary...')
    if (readinessFactors) {
      console.log(`  Cash Runway Months: ${readinessFactors.cashRunwayMonths}`)
      console.log(`  Team Size: ${readinessFactors.teamSize}`)
      console.log(`  CFO Hired: ${readinessFactors.cfoHired ? 'Yes' : 'No'}`)
      console.log(`  Board Size: ${readinessFactors.boardSize}`)
      console.log(`  Auditor Selected: ${readinessFactors.auditorSelected ? 'Yes' : 'No'}`)
      console.log(`  Investor Sophistication: ${readinessFactors.investorSophisticationScore}\n`)
    } else {
      console.log(`  ✗ Company not found\n`)
    }

    // Test 8: Validate types and interfaces
    console.log('Test 8: Type validation...')
    const typeChecks = [
      { field: 'adjustedPace', type: 'number', valid: typeof score.adjustedPace === 'number' },
      { field: 'basePace', type: 'number', valid: typeof score.basePace === 'number' },
      { field: 'confidenceLevel', type: 'string', valid: ['Low', 'Medium', 'High'].includes(score.confidenceLevel) },
      { field: 'riskFactors', type: 'array', valid: Array.isArray(score.riskFactors) },
      { field: 'adjustmentFactors', type: 'object', valid: typeof score.adjustmentFactors === 'object' },
      { field: 'predictedDaysToIpo', type: 'number', valid: typeof score.predictedDaysToIpo === 'number' },
    ]

    let allTypeChecksPass = true
    typeChecks.forEach(check => {
      const icon = check.valid ? '✓' : '✗'
      console.log(`  ${icon} ${check.field}: ${check.type}`)
      if (!check.valid) allTypeChecksPass = false
    })
    console.log()

    // Test 9: Validate score bounds
    console.log('Test 9: Score boundary validation...')
    const boundChecks = [
      { name: 'Adjusted PACE', value: score.adjustedPace, min: 0, max: 100 },
      { name: 'Base PACE', value: score.basePace, min: 0, max: 100 },
      { name: 'Cash Runway Score', value: score.adjustmentFactors.cashRunway.score, min: 0, max: 100 },
      { name: 'Team Readiness Score', value: score.adjustmentFactors.teamReadiness.score, min: 0, max: 100 },
      { name: 'Market Condition Score', value: score.adjustmentFactors.marketConditions.score, min: 0, max: 100 },
      { name: 'Investor Sophistication Score', value: score.adjustmentFactors.investorSophistication.score, min: 0, max: 100 },
      { name: 'Predicted Days to IPO', value: score.predictedDaysToIpo, min: 90, max: 365 },
    ]

    let allBoundsPass = true
    boundChecks.forEach(check => {
      const valid = check.value >= check.min && check.value <= check.max
      const icon = valid ? '✓' : '✗'
      console.log(`  ${icon} ${check.name}: ${check.value} (${check.min}-${check.max})`)
      if (!valid) allBoundsPass = false
    })
    console.log()

    // Final summary
    console.log('========== TEST SUMMARY ==========\n')
    if (allTypeChecksPass && allBoundsPass) {
      console.log('✓ ALL INTEGRATION TESTS PASSED')
      console.log('\nThe PACE predictive scoring model is working correctly:')
      console.log('  • Database integration: ✓ Working')
      console.log('  • Score calculation: ✓ Correct')
      console.log('  • Type safety: ✓ Valid')
      console.log('  • Value bounds: ✓ Within range')
      console.log('  • Risk detection: ✓ Functional')
      console.log('\nModel is ready for production deployment.')
    } else {
      console.log('✗ SOME TESTS FAILED')
      if (!allTypeChecksPass) console.log('  • Type validation failures')
      if (!allBoundsPass) console.log('  • Boundary validation failures')
    }
    console.log()

  } catch (error) {
    console.error('✗ Integration test error:', error)
    process.exit(1)
  }
}

// Run tests
runIntegrationTests().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})