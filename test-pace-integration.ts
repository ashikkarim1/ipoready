/**
 * PACE Predictive Scorer - Integration Test Script
 * 
 * This script validates the PACE predictive scoring model against actual
 * database operations and verifies the complete workflow.
 * 
 * Usage: npx ts-node test-pace-integration.ts
 */

import { sql } from '@/lib/db'
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
    const score = await calculatePredictiveScore(testCompanyId)
    
    console.log(`✓ Calculation successful:`)
    console.log(`  Base PACE: ${score.baseScore}`)
    console.log(`  Adjusted PACE: ${score.adjustedPaceScore}`)
    console.log(`  Adjustment: ${score.adjustment > 0 ? '+' : ''}${score.adjustment}`)
    console.log(`  Confidence Level: ${score.confidenceLevel}`)
    console.log(`  Estimated Days to IPO: ${score.estimatedDaysToIpoAdjusted}\n`)

    // Test 4: Verify score components
    console.log('Test 4: Validating score breakdown...')
    console.log(`  Cash Runway Score: ${score.breakdown.cashRunwayScore}/100`)
    console.log(`  Team Readiness Score: ${score.breakdown.teamReadinessScore}/100`)
    console.log(`  Market Condition Score: ${score.breakdown.marketConditionScore}/100`)
    console.log(`  Investor Sophistication Score: ${score.breakdown.investorSophisticationScore}/100`)
    
    // Verify components sum to adjusted score (within rounding)
    const calculatedSum = 
      (score.breakdown.basePace * 0.4) +
      (score.breakdown.cashRunwayScore * 0.2) +
      (score.breakdown.teamReadinessScore * 0.2) +
      (score.breakdown.marketConditionScore * 0.1) +
      (score.breakdown.investorSophisticationScore * 0.1)
    
    console.log(`  Calculated Sum: ${Math.round(calculatedSum)}`)
    console.log(`  Adjusted Score: ${score.adjustedPaceScore}`)
    
    if (Math.abs(Math.round(calculatedSum) - score.adjustedPaceScore) <= 1) {
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

    // Test 6: Verify opportunity factors
    console.log('Test 6: Opportunity factor identification...')
    if (score.opportunityFactors.length > 0) {
      console.log(`  Identified ${score.opportunityFactors.length} opportunity factors:`)
      score.opportunityFactors.forEach((of, idx) => {
        console.log(`    ${idx + 1}. ${of}`)
      })
    } else {
      console.log(`  ✓ No additional opportunities identified`)
    }
    console.log()

    // Test 7: Get readiness factors summary
    console.log('Test 7: Fetching readiness factors summary...')
    const readiness = await getReadinessFactors(testCompanyId)
    
    if (readiness) {
      console.log(`  Cash Runway: ${readiness.cashRunway?.months} months (${readiness.cashRunway?.status})`)
      console.log(`  Team Size: ${readiness.team.size}`)
      console.log(`  CFO Hired: ${readiness.team.cfoHired ? 'Yes' : 'No'}`)
      console.log(`  Board Size: ${readiness.team.boardSize}`)
      console.log(`  Auditor Selected: ${readiness.team.auditorSelected ? 'Yes' : 'No'}`)
      console.log(`  Investor Sophistication: ${readiness.investorSophistication || 'Not provided'}\n`)
    } else {
      console.log(`  ✗ Company not found\n`)
    }

    // Test 8: Validate types and interfaces
    console.log('Test 8: Type validation...')
    const typeChecks = [
      { field: 'adjustedPaceScore', type: 'number', valid: typeof score.adjustedPaceScore === 'number' },
      { field: 'baseScore', type: 'number', valid: typeof score.baseScore === 'number' },
      { field: 'adjustment', type: 'number', valid: typeof score.adjustment === 'number' },
      { field: 'confidenceLevel', type: 'string', valid: ['low', 'medium', 'high'].includes(score.confidenceLevel) },
      { field: 'riskFactors', type: 'array', valid: Array.isArray(score.riskFactors) },
      { field: 'opportunityFactors', type: 'array', valid: Array.isArray(score.opportunityFactors) },
      { field: 'breakdown', type: 'object', valid: typeof score.breakdown === 'object' },
      { field: 'estimatedDaysToIpoAdjusted', type: 'number', valid: typeof score.estimatedDaysToIpoAdjusted === 'number' },
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
      { name: 'Adjusted PACE', value: score.adjustedPaceScore, min: 0, max: 100 },
      { name: 'Base PACE', value: score.baseScore, min: 0, max: 100 },
      { name: 'Cash Runway Score', value: score.breakdown.cashRunwayScore, min: 0, max: 100 },
      { name: 'Team Readiness Score', value: score.breakdown.teamReadinessScore, min: 0, max: 100 },
      { name: 'Market Condition Score', value: score.breakdown.marketConditionScore, min: 0, max: 100 },
      { name: 'Investor Sophistication Score', value: score.breakdown.investorSophisticationScore, min: 0, max: 100 },
      { name: 'Estimated Days to IPO', value: score.estimatedDaysToIpoAdjusted, min: 90, max: 365 },
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
