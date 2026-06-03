/**
 * Exchange Configuration - Usage Examples & Tests
 * ================================================
 * This file demonstrates how to use the exchange-config module.
 */

import {
  getExchangeConfig,
  getAllExchangeCodes,
  getCanadianExchanges,
  getUSExchanges,
  requiresCUSIP,
  getMinDaysToListing,
  getRequiredResolutions,
  getRequiredConsents,
  requiresAuditCommittee,
  allowsBestEfforts,
  compareExchanges,
  getExchangeSummary,
} from './exchange-config'

/**
 * Example 1: Get configuration for a specific exchange
 */
export function example1_getExchangeConfig() {
  const tsxConfig = getExchangeConfig('tsx')

  console.log('TSX Configuration:')
  console.log(`  Name: ${tsxConfig.name}`)
  console.log(`  Country: ${tsxConfig.country}`)
  console.log(`  Min Public Float: ${tsxConfig.minPublicFloat}%`)
  console.log(`  Min Shares Required: ${tsxConfig.minShares.toLocaleString()}`)
  console.log(`  Min Share Price: $${tsxConfig.minSharePrice}`)
  console.log(`  Days to Listing: ~${tsxConfig.daysToListing}`)
}

/**
 * Example 2: Get all supported exchanges
 */
export function example2_getAllExchanges() {
  const allCodes = getAllExchangeCodes()
  console.log('All Supported Exchanges:', allCodes)

  const canadianExchanges = getCanadianExchanges()
  console.log('Canadian Exchanges:', canadianExchanges)

  const usExchanges = getUSExchanges()
  console.log('US Exchanges:', usExchanges)
}

/**
 * Example 3: Check specific requirements
 */
export function example3_checkRequirements() {
  const exchange = 'nasdaq'

  console.log(`Requirements for ${exchange.toUpperCase()}:`)
  console.log(`  Requires CUSIP: ${requiresCUSIP(exchange)}`)
  console.log(`  Requires Audit Committee: ${requiresAuditCommittee(exchange)}`)
  console.log(`  Allows Best Efforts: ${allowsBestEfforts(exchange)}`)
  console.log(`  Min Days to Listing: ${getMinDaysToListing(exchange)}`)

  const resolutions = getRequiredResolutions(exchange)
  console.log(`  Required Resolutions: ${resolutions.join(', ')}`)

  const consents = getRequiredConsents(exchange)
  console.log(`  Required Consents: ${consents.join(', ')}`)
}

/**
 * Example 4: Compare two exchanges
 */
export function example4_compareExchanges() {
  const comparison = compareExchanges('tsxv', 'cse')

  console.log('TSXV vs CSE Comparison:')
  console.log(JSON.stringify(comparison, null, 2))
}

/**
 * Example 5: Get human-readable summary
 */
export function example5_getExchangeSummary() {
  const summary = getExchangeSummary('tsx')
  console.log(summary)
}

/**
 * Example 6: Use in a React component (type-safe)
 */
export function example6_reactComponent(exchangeCode: string) {
  try {
    const config = getExchangeConfig(exchangeCode as any)

    // Type-safe access to all properties
    const listingRequirements = {
      publicFloat: config.minPublicFloat,
      shares: config.minShares,
      price: config.minSharePrice,
      daysToListing: config.daysToListing,
      requiresAudit: config.requiresAuditCommittee,
      currency: config.currency,
    }

    return listingRequirements
  } catch (error) {
    console.error(`Invalid exchange code: ${exchangeCode}`)
    return null
  }
}

/**
 * Example 7: Build exchange selection dropdown
 */
export function example7_exchangeDropdownOptions() {
  const options = getAllExchangeCodes().map((code) => {
    const config = getExchangeConfig(code)
    return {
      value: code,
      label: config.name,
      country: config.country,
    }
  })

  return options
}

/**
 * Example 8: Determine best exchange for a company
 */
export function example8_determineBestExchange(
  publicFloatCAD: number,
  target: 'ease_of_listing' | 'prestige' | 'lowest_cost'
) {
  const canadianExchanges = getCanadianExchanges()
  const configs = canadianExchanges.map((code) => ({
    code,
    config: getExchangeConfig(code),
  }))

  // Filter by public float requirement
  const suitable = configs.filter((e) => {
    const requirement = e.config.minPublicFloatCAD || 0
    return publicFloatCAD >= requirement
  })

  if (suitable.length === 0) {
    return null // Company doesn't meet any Canadian exchange requirements
  }

  // Select based on target
  switch (target) {
    case 'ease_of_listing':
      // CSE has easiest requirements
      return suitable.find((e) => e.code === 'cse') || suitable[0]

    case 'prestige':
      // TSX is most prestigious
      return suitable.find((e) => e.code === 'tsx') || suitable[0]

    case 'lowest_cost':
      // CSE has lowest listing fees
      return suitable.reduce((best, current) =>
        current.config.listingFeeMax < best.config.listingFeeMax ? current : best
      )

    default:
      return suitable[0]
  }
}

/**
 * Example 9: Type-safe configuration usage
 */
export function example9_typeCheckingExample() {
  const config = getExchangeConfig('tsx')

  // All of these are type-safe
  const requirements = {
    minPublicFloat: config.minPublicFloat,
    minShares: config.minShares,
    minSharePrice: config.minSharePrice || 0,
    greenShoe: config.greenShoe,
    minOfferingSize: config.minOfferingSize,
    minOfferingCAD: config.minOfferingCAD,

    // Optional fields must be checked
    minPublicFloatCAD: config.minPublicFloatCAD || 0,
    minPublicFloatUSD: config.minPublicFloatUSD || 0,

    // Complex types
    prospectusFormat: config.prospectusFormat[0],
    requiredResolutions: config.requiredResolutions,
    requiredConsents: config.requiredConsents,

    // Nested objects
    minUnderwriters: config.underwriterRequirements.minUnderwriters,
    requiresFirmCommitment: config.underwriterRequirements.firmCommitment,

    // Continuous disclosure
    requiresAIC: config.continuousDisclosure.requiresAIC,
    requiresMDA: config.continuousDisclosure.requiresMD_A,

    // Listings fees
    listingFeeRange: `${config.listingFeeMin}-${config.listingFeeMax}k ${config.currency}`,
  }

  return requirements
}

/**
 * Example 10: Build exchange comparison table
 */
export function example10_comparisonTable() {
  const exchanges = getAllExchangeCodes()
  const table = exchanges.map((code) => {
    const config = getExchangeConfig(code)
    return {
      Exchange: config.name,
      Country: config.country,
      'Min Public Float': `${config.minPublicFloat}%`,
      'Min Shares': config.minShares.toLocaleString(),
      'Min Price': `$${config.minSharePrice || 'N/A'}`,
      'Days to List': config.daysToListing,
      'Audit Required': config.requiresAuditCommittee ? 'Yes' : 'No',
      'CUSIP Support': config.cusipSupported ? 'Yes' : 'No',
      'Listing Fee': `${config.listingFeeMin}-${config.listingFeeMax}k ${config.currency}`,
    }
  })

  return table
}

// ============================================================================
// Unit Tests
// ============================================================================

/**
 * Run all validation tests
 */
export async function runAllTests() {
  console.log('Running Exchange Configuration Tests...\n')

  try {
    // Test 1: All exchanges are accessible
    console.log('✓ Test 1: All exchanges accessible')
    getAllExchangeCodes().forEach((code) => {
      getExchangeConfig(code)
    })

    // Test 2: Required fields are present
    console.log('✓ Test 2: Required fields present')
    const testConfig = getExchangeConfig('tsx')
    if (
      !testConfig.code ||
      !testConfig.name ||
      !testConfig.minPublicFloat ||
      !testConfig.minShares
    ) {
      throw new Error('Missing required fields')
    }

    // Test 3: Consistency checks
    console.log('✓ Test 3: Data consistency')
    getAllExchangeCodes().forEach((code) => {
      const config = getExchangeConfig(code)
      if (config.minShares <= 0) {
        throw new Error(`${code}: Invalid minShares`)
      }
      if (config.minPublicFloat < 0 || config.minPublicFloat > 100) {
        throw new Error(`${code}: Invalid minPublicFloat`)
      }
      if (config.listingFeeMin > config.listingFeeMax) {
        throw new Error(`${code}: Listing fee range invalid`)
      }
    })

    // Test 4: Utility functions work
    console.log('✓ Test 4: Utility functions')
    requiresCUSIP('nyse')
    getMinDaysToListing('nasdaq')
    requiresAuditCommittee('tsx')
    allowsBestEfforts('cse')
    getExchangeSummary('tsxv')

    console.log('\n✅ All tests passed!')
    return true
  } catch (error) {
    console.error('\n❌ Test failed:', error)
    return false
  }
}

// Tests can be run via a test runner like Jest, Vitest, or Node.js
// Example: npx jest src/lib/exchange-config.test.ts
// Or in a Node.js environment: node -r ts-node/register src/lib/exchange-config.test.ts
