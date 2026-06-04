/**
 * Prospectus Validator Dashboard - Main entry point
 * Exports all public components, types, and hooks
 */

// Components
export { ProspectusValidatorDashboard } from './ProspectusValidatorDashboard'
export { ProspectusValidatorExample } from './ProspectusValidatorExample'

// Types
export type { ProspectusSection, Issue, Gap, FixOption, IssueSeverity, StrengthStatus, StrengthRating } from './types'
export type { ProspectusValidatorDashboardProps, ProspectusStats, ValidatorFilter, ValidatorConfig } from './types'
export { STANDARD_SECTIONS, getStrengthStatus, calculateCompletenessIncrease, calculateProspectusStats } from './types'

// Hooks
export { useProspectusValidator, useProspectusValidatorSync, useValidatorAnalytics } from './useProspectusValidator'
