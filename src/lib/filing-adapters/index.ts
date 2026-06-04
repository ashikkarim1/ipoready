/**
 * Filing Adapters Module
 * ======================
 * Exports base classes, types, and utilities for filing system integrations
 *
 * Includes:
 * - BaseFilingAdapter: Abstract base class for all filing adapters
 * - SEDARAdapter: Canadian SEDAR 2 filing system implementation
 * - SEDARFieldMapper: Maps IPOReady fields to SEDAR field names
 * - SEDARValidator: Validates SEDAR-specific requirements
 */

import BaseFilingAdapter, { FilingError, DocumentType } from './BaseFilingAdapter'
import { SEDARAdapter } from './SEDARAdapter'

export {
  BaseFilingAdapter,
  FilingError,
  DocumentType,
  type DocumentFormat,
  type AuthMethod,
  type FilingPhase,
  type DocumentMetadata,
  type ValidationResult,
  type ValidationError,
  type DocumentValidationStatus,
  type FilingMetadata,
  type SubmissionResult,
  type FilingStatus,
  type StatusUpdate,
  type AuthCredentials,
  type RetryConfig,
} from './BaseFilingAdapter'

export {
  SEDARAdapter,
  type SEDARFormType,
} from './SEDARAdapter'

export {
  SEDARFieldMapper,
  createSEDARFieldMapper,
  SEDAR_FIELD_MAPPINGS,
  type FieldMapConfig,
} from './utils/sedar-field-mapper'

export {
  SEDARValidator,
  createSEDARValidator,
  SEDAR_PROSPECTUS_SECTIONS,
  SEDAR_FINANCIAL_STATEMENT_RULES,
  EXECUTIVE_COMPENSATION_REQUIREMENTS,
  SEDAR_DOCUMENT_FORMAT_RULES,
  type ProspectusSection,
  type FinancialStatementRules,
} from './utils/sedar-validator'

export default BaseFilingAdapter
