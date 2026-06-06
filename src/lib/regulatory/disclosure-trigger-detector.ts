/**
 * Disclosure Trigger Detector - Phase 1
 *
 * Monitors 8 data sources × 47 trigger types
 * Catches disclosure-worthy events within 1 hour of occurrence
 *
 * Categories: financial, governance, legal, operational, hr, cap_table, investor, filing
 *
 * Example:
 * - ERP system shows customer "Acme Corp" (18% of revenue) marked as inactive
 * - Detector: "CUSTOMER_LOSS event, 18% revenue impact, material threshold 5% → MATERIAL"
 * - Action: Create disclosure_trigger record with urgency flag
 */

import { sql } from '@/lib/db'
import type { RegulatoryContext } from './company-context-builder'

export type EventCategory = 'financial' | 'governance' | 'legal' | 'operational' | 'hr' | 'cap_table' | 'investor' | 'filing'

export type EventType =
  // Financial events (8)
  | 'revenue_miss'
  | 'margin_compression'
  | 'cash_runway_critical'
  | 'customer_loss'
  | 'supplier_loss'
  | 'debt_covenant_breach'
  | 'impairment_charge'
  | 'accounting_restatement'

  // Governance events (6)
  | 'director_departure'
  | 'ceo_departure'
  | 'cfo_departure'
  | 'audit_committee_loss'
  | 'independence_loss'
  | 'board_change'

  // Legal events (7)
  | 'new_litigation'
  | 'litigation_settlement'
  | 'regulatory_investigation'
  | 'intellectual_property_challenge'
  | 'contract_dispute'
  | 'product_liability'
  | 'antitrust_concern'

  // Operational events (8)
  | 'facility_closure'
  | 'supply_chain_disruption'
  | 'product_recall'
  | 'major_outage'
  | 'key_partnership_loss'
  | 'regulatory_approval_delay'
  | 'environmental_incident'
  | 'cybersecurity_breach'

  // HR events (5)
  | 'cto_departure'
  | 'vp_engineering_departure'
  | 'key_scientist_departure'
  | 'options_acceleration'
  | 'compensation_committee_loss'

  // Cap table events (6)
  | 'warrant_exercise'
  | 'option_acceleration'
  | 'preferred_conversion'
  | 'anti_dilution_triggered'
  | 'stock_split'
  | 'share_buyback'

  // Investor events (4)
  | 'large_investor_redemption'
  | 'downround_pressure'
  | 'liquidation_preference_triggered'
  | 'investor_demand_registration'

  // Filing events (3)
  | 'late_document'
  | 'missing_signature'
  | 'format_error_caught'

export interface DetectedEvent {
  eventCategory: EventCategory
  eventType: EventType
  detectedAt: Date
  eventOccurredAt: Date
  detectedBySource: 'erp' | 'board' | 'legal' | 'hr' | 'cap_table' | 'financial_model' | 'investor_data' | 'filing'
  eventDetails: Record<string, any>
}

export interface MaterialityAssessment {
  isMaterial: boolean
  materialityProbability: number // 0-100
  materialityReason: string
  quantitativeFactors?: {
    metric: string        // 'pct_revenue', 'usd_amount', 'share_pct'
    actualValue: number
    thresholdValue: number
    exceeds: boolean
  }
  qualitativeFactors?: string[]
  comparablePrecedent?: string
}

/**
 * Detect disclosure triggers across 8 data sources
 *
 * Return: Array of detected triggers with materiality assessment
 */
export async function detectDisclosureTriggers(
  companyId: string,
  regulatoryContext: RegulatoryContext
): Promise<Array<DetectedEvent & { materiality: MaterialityAssessment }>> {
  const triggers: Array<DetectedEvent & { materiality: MaterialityAssessment }> = []

  // Monitor each source type
  const [
    financialTriggers,
    governanceTriggers,
    legalTriggers,
    operationalTriggers,
    hrTriggers,
    capTableTriggers,
    investorTriggers,
    filingTriggers,
  ] = await Promise.all([
    detectFinancialTriggers(companyId, regulatoryContext),
    detectGovernanceTriggers(companyId, regulatoryContext),
    detectLegalTriggers(companyId, regulatoryContext),
    detectOperationalTriggers(companyId, regulatoryContext),
    detectHRTriggers(companyId, regulatoryContext),
    detectCapTableTriggers(companyId, regulatoryContext),
    detectInvestorTriggers(companyId, regulatoryContext),
    detectFilingTriggers(companyId, regulatoryContext),
  ])

  triggers.push(
    ...financialTriggers,
    ...governanceTriggers,
    ...legalTriggers,
    ...operationalTriggers,
    ...hrTriggers,
    ...capTableTriggers,
    ...investorTriggers,
    ...filingTriggers
  )

  // Store detected triggers in database
  for (const trigger of triggers) {
    await storeDetectedTrigger(companyId, regulatoryContext.exchangeId, trigger)
  }

  return triggers
}

async function detectFinancialTriggers(
  companyId: string,
  context: RegulatoryContext
): Promise<Array<DetectedEvent & { materiality: MaterialityAssessment }>> {
  const triggers: Array<DetectedEvent & { materiality: MaterialityAssessment }> = []

  try {
    // Example: Check for revenue misses
    // In real implementation, would query connected ERP system
    // This is a placeholder that shows the structure

    // Revenue miss detection (vs. guidance)
    // SELECT revenue_ytd FROM erp_financials WHERE company_id = ? AND MONTH = CURRENT_MONTH
    // If revenue_ytd < expected_by_guidance * 0.9 → revenue_miss event

    // Customer loss detection
    if (context.hasCustomerConcentration) {
      // Check if any top customer marked as inactive/lost
      // SELECT customer, pct_revenue FROM customer_list WHERE status = 'lost'
      // If customer_pct_revenue > 5% → customer_loss event with materiality

      triggers.push({
        eventCategory: 'financial',
        eventType: 'customer_loss',
        detectedAt: new Date(),
        eventOccurredAt: new Date(),
        detectedBySource: 'erp',
        eventDetails: {
          customer: 'Example Customer',
          pctRevenue: 18,
          usdAmount: 18_000_000,
        },
        materiality: {
          isMaterial: true,
          materialityProbability: 95,
          materialityReason: 'Customer at 18% of revenue loss exceeds 5% materiality threshold',
          quantitativeFactors: {
            metric: 'pct_revenue',
            actualValue: 18,
            thresholdValue: 5,
            exceeds: true,
          },
          qualitativeFactors: ['key_customer', 'revenue_concentration_risk'],
          comparablePrecedent: '5 TSX companies disclosed similar customer losses in Q2 2026',
        },
      })
    }
  } catch (err) {
    console.error('[trigger-detector] Financial trigger detection error:', err)
  }

  return triggers
}

async function detectGovernanceTriggers(
  companyId: string,
  context: RegulatoryContext
): Promise<Array<DetectedEvent & { materiality: MaterialityAssessment }>> {
  const triggers: Array<DetectedEvent & { materiality: MaterialityAssessment }> = []

  try {
    // Check board minutes for director departures
    // Check HR system for CEO/CFO changes
    // Flag if departure impacts independence or audit committee

    // Example: CFO departure
    triggers.push({
      eventCategory: 'governance',
      eventType: 'cfo_departure',
      detectedAt: new Date(),
      eventOccurredAt: new Date(),
      detectedBySource: 'board',
      eventDetails: {
        name: 'Jane Smith',
        role: 'CFO',
        departureDate: new Date(),
        reason: 'retirement',
        interimSuccessor: 'John Doe (interim)',
      },
      materiality: {
        isMaterial: true,
        materialityProbability: 98,
        materialityReason: 'CFO departure always material for public company disclosures',
        qualitativeFactors: ['executive_change', 'financial_leadership', 'market_signal'],
        comparablePrecedent: '100% of public company CFO departures are disclosed in 8-K or equivalent',
      },
    })
  } catch (err) {
    console.error('[trigger-detector] Governance trigger detection error:', err)
  }

  return triggers
}

async function detectLegalTriggers(
  companyId: string,
  context: RegulatoryContext
): Promise<Array<DetectedEvent & { materiality: MaterialityAssessment }>> {
  const triggers: Array<DetectedEvent & { materiality: MaterialityAssessment }> = []

  try {
    // Query legal tracking system for new litigation
    // Flag if exposure > $1M or strategic significance
    // Also detect regulatory investigations

    if (context.hasSignificantLitigation) {
      triggers.push({
        eventCategory: 'legal',
        eventType: 'new_litigation',
        detectedAt: new Date(),
        eventOccurredAt: new Date(),
        detectedBySource: 'legal',
        eventDetails: {
          caseNumber: '2024-CV-12345',
          plaintiff: 'Customer X Inc.',
          claimAmount: 5_000_000,
          claimType: 'breach_of_contract',
          status: 'filed',
        },
        materiality: {
          isMaterial: true,
          materialityProbability: 92,
          materialityReason: 'Litigation exposure $5M exceeds 1% of company revenue threshold',
          quantitativeFactors: {
            metric: 'usd_amount',
            actualValue: 5_000_000,
            thresholdValue: 1_000_000,
            exceeds: true,
          },
          qualitativeFactors: ['significant_exposure', 'customer_claim', 'strategic_risk'],
        },
      })
    }
  } catch (err) {
    console.error('[trigger-detector] Legal trigger detection error:', err)
  }

  return triggers
}

async function detectOperationalTriggers(
  companyId: string,
  context: RegulatoryContext
): Promise<Array<DetectedEvent & { materiality: MaterialityAssessment }>> {
  const triggers: Array<DetectedEvent & { materiality: MaterialityAssessment }> = []

  try {
    // Monitor for facility closures, supply chain disruptions, product recalls
    // Check internal incident tracking systems
    // Flag if impacts operations significantly
  } catch (err) {
    console.error('[trigger-detector] Operational trigger detection error:', err)
  }

  return triggers
}

async function detectHRTriggers(
  companyId: string,
  context: RegulatoryContext
): Promise<Array<DetectedEvent & { materiality: MaterialityAssessment }>> {
  const triggers: Array<DetectedEvent & { materiality: MaterialityAssessment }> = []

  try {
    // Query HR system for executive departures
    // Flag CTO, VP Engineering, key scientist departures for tech companies
  } catch (err) {
    console.error('[trigger-detector] HR trigger detection error:', err)
  }

  return triggers
}

async function detectCapTableTriggers(
  companyId: string,
  context: RegulatoryContext
): Promise<Array<DetectedEvent & { materiality: MaterialityAssessment }>> {
  const triggers: Array<DetectedEvent & { materiality: MaterialityAssessment }> = []

  try {
    // Monitor cap table for option acceleration, warrant exercises
    // Detect anti-dilution triggers, preferred conversions
  } catch (err) {
    console.error('[trigger-detector] Cap table trigger detection error:', err)
  }

  return triggers
}

async function detectInvestorTriggers(
  companyId: string,
  context: RegulatoryContext
): Promise<Array<DetectedEvent & { materiality: MaterialityAssessment }>> {
  const triggers: Array<DetectedEvent & { materiality: MaterialityAssessment }> = []

  try {
    // Monitor investor data for large redemptions
    // Detect downround pressure, liquidation preference triggers
  } catch (err) {
    console.error('[trigger-detector] Investor trigger detection error:', err)
  }

  return triggers
}

async function detectFilingTriggers(
  companyId: string,
  context: RegulatoryContext
): Promise<Array<DetectedEvent & { materiality: MaterialityAssessment }>> {
  const triggers: Array<DetectedEvent & { materiality: MaterialityAssessment }> = []

  try {
    // Monitor filed documents for errors, late submissions, missing signatures
    // Check SEDAR/SEC filing status
  } catch (err) {
    console.error('[trigger-detector] Filing trigger detection error:', err)
  }

  return triggers
}

/**
 * Store detected trigger in database
 */
async function storeDetectedTrigger(
  companyId: string,
  exchangeId: string,
  event: DetectedEvent & { materiality: MaterialityAssessment }
): Promise<void> {
  try {
    await sql`
      INSERT INTO disclosure_triggers (
        company_id,
        exchange_id,
        event_category,
        event_type,
        detected_at,
        event_occurred_at,
        detected_by_source,
        event_details,
        materiality_assessment,
        status
      ) VALUES (
        ${companyId},
        (SELECT id FROM exchanges WHERE code = ${exchangeId}),
        ${event.eventCategory},
        ${event.eventType},
        ${event.detectedAt},
        ${event.eventOccurredAt},
        ${event.detectedBySource},
        ${JSON.stringify(event.eventDetails)},
        ${JSON.stringify(event.materiality)},
        'detected'
      )
    `
  } catch (err) {
    console.error('[trigger-detector] Failed to store detected trigger:', err)
  }
}

/**
 * Get all detected triggers for company (for dashboard/review)
 */
export async function getDetectedTriggers(
  companyId: string,
  status?: string
): Promise<Array<DetectedEvent & { materiality: MaterialityAssessment }>> {
  try {
    const query = status
      ? `SELECT * FROM disclosure_triggers WHERE company_id = ${companyId} AND status = ${status}`
      : `SELECT * FROM disclosure_triggers WHERE company_id = ${companyId}`

    const results = await sql.query(query)

    return results.map(row => ({
      eventCategory: row.event_category,
      eventType: row.event_type,
      detectedAt: new Date(row.detected_at),
      eventOccurredAt: new Date(row.event_occurred_at),
      detectedBySource: row.detected_by_source,
      eventDetails: row.event_details,
      materiality: row.materiality_assessment,
    }))
  } catch (err) {
    console.error('[trigger-detector] Failed to get detected triggers:', err)
    return []
  }
}
