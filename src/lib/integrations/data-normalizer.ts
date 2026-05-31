// ====================================================================
// DATA NORMALIZER FOR CAP TABLE INTEGRATIONS
// Normalizes data from different sources (Carta, Pulley) to IPOReady schema
// ====================================================================

import {
  CartaCapTable,
  CartaShareholder,
  CartaSecurityClass,
  CartaHolding,
  NormalizedCapTableEntry as CartaNormalized,
} from './carta-client'

import {
  PulleyCapTable,
  PulleyPerson,
  PulleySecurityType,
  PulleyGrant,
  NormalizedCapTableEntry as PulleyNormalized,
} from './pulley-client'

// ====================================================================
// CARTA NORMALIZATION
// ====================================================================

export function normalizeCartaData(cartaCapTable: CartaCapTable): CartaNormalized[] {
  const results: CartaNormalized[] = []

  // Build lookup maps
  const shareholderMap = new Map<string, CartaShareholder>()
  for (const shareholder of cartaCapTable.shareholders) {
    shareholderMap.set(shareholder.id, shareholder)
  }

  const securityMap = new Map<string, CartaSecurityClass>()
  for (const security of cartaCapTable.securityClasses) {
    securityMap.set(security.id, security)
  }

  // Process each holding
  for (const holding of cartaCapTable.holdings) {
    try {
      const shareholder = shareholderMap.get(holding.shareholderId)
      const security = securityMap.get(holding.securityClassId)

      if (!shareholder || !security) {
        console.warn(`Skipping holding ${holding.id}: missing shareholder or security`)
        continue
      }

      // Normalize shareholder name
      const shareholderName = sanitizeShareholderName(shareholder.name)

      // Normalize share class name (map Carta names to standard classes)
      const shareClassName = normalizeShareClassName(security.name)

      // Calculate vested quantity (simplified: assume cliff+period vesting)
      const vestedQuantity = calculateVestedQuantity(
        holding.quantity,
        holding.vestingSchedule
      )

      const entry: CartaNormalized = {
        shareholder_name: shareholderName,
        share_class_name: shareClassName,
        quantity: holding.quantity,
        vesting_start_date: holding.vestingSchedule?.vestingStartDate,
        vesting_cliff_months: holding.vestingSchedule?.cliffMonths,
        vesting_period_months: holding.vestingSchedule?.vestingPeriodMonths,
        vested_quantity: vestedQuantity,
        strike_price: holding.exercisePrice,
        grant_date: holding.grantDate,
        grant_type: normalizeGrantType(holding.type),
        notes: `Imported from Carta (ID: ${holding.id})`,
      }

      results.push(entry)
    } catch (error) {
      console.error(`Error normalizing Carta holding ${holding.id}:`, error)
    }
  }

  return results
}

// ====================================================================
// PULLEY NORMALIZATION
// ====================================================================

export function normalizePulleyData(pulleyCapTable: PulleyCapTable): PulleyNormalized[] {
  const results: PulleyNormalized[] = []

  // Build lookup maps
  const personMap = new Map<string, PulleyPerson>()
  for (const person of pulleyCapTable.people) {
    personMap.set(person.id, person)
  }

  const securityMap = new Map<string, PulleySecurityType>()
  for (const security of pulleyCapTable.securityTypes) {
    securityMap.set(security.id, security)
  }

  // Process each grant
  for (const grant of pulleyCapTable.grants) {
    try {
      const person = personMap.get(grant.personId)
      const security = securityMap.get(grant.securityTypeId)

      if (!person || !security) {
        console.warn(`Skipping grant ${grant.id}: missing person or security type`)
        continue
      }

      // Normalize person name
      const shareholderName = sanitizeShareholderName(person.name)

      // Normalize security name
      const shareClassName = normalizePulleySecurityName(security.name)

      // Use vested quantity from Pulley or calculate
      const vestedQuantity = grant.vestedQuantity ?? calculateVestedQuantity(grant.quantity,
        grant.vestingStart ? {
          vestingStartDate: grant.vestingStart,
          cliffMonths: grant.cliffMonths,
          vestingPeriodMonths: grant.vestingMonths,
        } : undefined
      )

      const entry: PulleyNormalized = {
        shareholder_name: shareholderName,
        share_class_name: shareClassName,
        quantity: grant.quantity,
        vesting_start_date: grant.vestingStart,
        vesting_cliff_months: grant.cliffMonths,
        vesting_period_months: grant.vestingMonths,
        vested_quantity: vestedQuantity,
        strike_price: grant.strike,
        grant_date: grant.grantDate,
        grant_type: normalizePulleyGrantType(grant.grantType),
        notes: `Imported from Pulley (ID: ${grant.id})`,
      }

      results.push(entry)
    } catch (error) {
      console.error(`Error normalizing Pulley grant ${grant.id}:`, error)
    }
  }

  return results
}

// ====================================================================
// HELPER FUNCTIONS
// ====================================================================

/**
 * Sanitize shareholder name:
 * - Remove extra whitespace
 * - Trim to 255 chars
 * - Handle special characters
 */
export function sanitizeShareholderName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .substring(0, 255)
}

/**
 * Normalize share class name: map various Carta naming conventions to standard classes
 * Carta examples: "Common Stock", "Series A Preferred Stock", "Series A", etc.
 */
function normalizeShareClassName(cartaName: string): string {
  const lower = cartaName.toLowerCase().trim()

  // Common stock variations
  if (lower.includes('common')) {
    return 'Common'
  }

  // Series letter variations
  const seriesMatch = lower.match(/series\s*([a-z])/i)
  if (seriesMatch) {
    return `Series ${seriesMatch[1].toUpperCase()}`
  }

  // Warrant
  if (lower.includes('warrant')) {
    return 'Warrant'
  }

  // Option
  if (lower.includes('option')) {
    return 'Option'
  }

  // If all else fails, return the original (cleaned up)
  return cartaName.replace(/\s*stock\s*$/i, '').trim()
}

/**
 * Normalize Pulley security name
 * Pulley examples: "common_stock", "preferred_stock", etc.
 */
function normalizePulleySecurityName(pulleyName: string): string {
  const lower = pulleyName.toLowerCase().trim()

  if (lower.includes('common')) {
    return 'Common'
  }

  if (lower.includes('preferred')) {
    return 'Preferred'
  }

  if (lower.includes('warrant')) {
    return 'Warrant'
  }

  if (lower.includes('option')) {
    return 'Option'
  }

  // Return titleized version
  return pulleyName
    .replace(/_/g, ' ')
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

/**
 * Normalize grant type from Carta
 */
function normalizeGrantType(cartaType: string): 'stock' | 'option' | 'warrant' | 'convertible' {
  const lower = cartaType.toLowerCase()
  if (lower.includes('option')) return 'option'
  if (lower.includes('warrant')) return 'warrant'
  if (lower.includes('convertible')) return 'convertible'
  return 'stock'
}

/**
 * Normalize grant type from Pulley
 */
function normalizePulleyGrantType(pulleyType: string): 'stock' | 'option' | 'warrant' | 'convertible' {
  const lower = pulleyType.toLowerCase()
  if (lower.includes('option')) return 'option'
  if (lower.includes('warrant')) return 'warrant'
  if (lower.includes('convertible')) return 'convertible'
  return 'stock'
}

/**
 * Calculate vested quantity based on vesting schedule
 * Simplified: assumes we only know start date, cliff, and period (no detailed vesting curve)
 * In production, would use current date to calculate fractional vesting
 */
function calculateVestedQuantity(
  totalQuantity: number,
  vestingSchedule?: {
    vestingStartDate?: string
    cliffMonths?: number
    vestingPeriodMonths?: number
  }
): number {
  if (!vestingSchedule || !vestingSchedule.vestingStartDate) {
    // No vesting schedule = fully vested
    return totalQuantity
  }

  const cliffMonths = vestingSchedule.cliffMonths ?? 0
  const vestingPeriodMonths = vestingSchedule.vestingPeriodMonths ?? 12

  const startDate = new Date(vestingSchedule.vestingStartDate)
  const now = new Date()

  // If we haven't reached the cliff yet, nothing is vested
  const cliffDate = new Date(startDate)
  cliffDate.setMonth(cliffDate.getMonth() + cliffMonths)

  if (now < cliffDate) {
    return 0
  }

  // If fully vested, return total
  const endDate = new Date(startDate)
  endDate.setMonth(endDate.getMonth() + vestingPeriodMonths)

  if (now >= endDate) {
    return totalQuantity
  }

  // Linear vesting between cliff and end date
  const monthsVested = (now.getTime() - cliffDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
  const remainingMonths = vestingPeriodMonths - cliffMonths
  const cliffQuantity = totalQuantity * (cliffMonths / vestingPeriodMonths)
  const vestedAfterCliff = (totalQuantity - cliffQuantity) * (monthsVested / remainingMonths)

  return cliffQuantity + vestedAfterCliff
}
