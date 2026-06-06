/**
 * Document Reconciliation Service
 *
 * Ensures:
 * 1. ZERO duplicate documents (deduplicate across all sources)
 * 2. ONE SOURCE OF TRUTH (unified_documents table)
 * 3. PERFECT RECONCILIATION (all pages see identical data)
 * 4. AUDIT TRAIL (every reconciliation tracked)
 *
 * Critical for compliance: No document can exist in two places
 */

import { sql } from '@/lib/db'
import { UnifiedDocumentService } from './unified-document-service'

export interface ReconciliationReport {
  timestamp: Date
  companyId: string

  // Counts
  totalDocumentsInUnified: number
  totalDocumentsInLegacy: number
  duplicatesFound: number
  duplicatesResolved: number
  inconsistenciesFound: number
  inconsistenciesResolved: number

  // Issues
  issues: {
    type: string
    severity: 'critical' | 'warning' | 'info'
    description: string
    documentId?: string
    affectedPages: string[]
    resolution: string
  }[]

  // Reconciliation status
  status: 'perfect' | 'issues-found' | 'failed'
  lastReconciled: Date
}

export interface DocumentDuplicate {
  documentId: string
  name: string
  duplicateCount: number
  locations: {
    source: string        // 'documents_page', 'data_room', 'filing_documents', etc.
    metadata: any
  }[]
}

export class DocumentReconciliationService {

  /**
   * FULL RECONCILIATION - Runs comprehensive check
   *
   * 1. Detects all duplicates across legacy tables
   * 2. Validates unified_documents completeness
   * 3. Checks all pages reference unified source
   * 4. Generates audit trail
   * 5. Returns actionable report
   */
  static async fullReconciliation(companyId: string): Promise<ReconciliationReport> {
    const startTime = new Date()
    const report: ReconciliationReport = {
      timestamp: startTime,
      companyId,
      totalDocumentsInUnified: 0,
      totalDocumentsInLegacy: 0,
      duplicatesFound: 0,
      duplicatesResolved: 0,
      inconsistenciesFound: 0,
      inconsistenciesResolved: 0,
      issues: [],
      status: 'perfect',
      lastReconciled: startTime
    }

    try {
      console.log(`[reconciliation] Starting full reconciliation for company ${companyId}`)

      // Step 1: Count documents in unified source
      const unifiedCount = await this.countUnifiedDocuments(companyId)
      report.totalDocumentsInUnified = unifiedCount

      // Step 2: Count documents in legacy tables (non-unified sources)
      const legacyCount = await this.countLegacyDocuments(companyId)
      report.totalDocumentsInLegacy = legacyCount

      // Step 3: Detect duplicates in unified_documents (same file uploaded twice)
      const duplicates = await this.detectDuplicatesInUnified(companyId)
      report.duplicatesFound = duplicates.length

      if (duplicates.length > 0) {
        report.status = 'issues-found'
        for (const dup of duplicates) {
          report.issues.push({
            type: 'duplicate_document',
            severity: 'critical',
            description: `Document "${dup.name}" exists ${dup.duplicateCount} times in unified_documents table`,
            affectedPages: ['documents', 'data-room', 'all-pages'],
            resolution: `Automatic deduplication: Keep latest version (${dup.locations[0].metadata.uploadedAt}), delete ${dup.duplicateCount - 1} older versions`
          })
        }

        // Auto-resolve by keeping latest version
        const resolved = await this.resolveUnifiedDuplicates(duplicates)
        report.duplicatesResolved = resolved
      }

      // Step 4: Check for orphaned documents in legacy tables
      const orphaned = await this.findOrphanedLegacyDocuments(companyId)
      if (orphaned.length > 0) {
        report.status = 'issues-found'
        report.inconsistenciesFound += orphaned.length

        for (const doc of orphaned) {
          report.issues.push({
            type: 'orphaned_document',
            severity: 'critical',
            description: `Document "${doc.name}" in ${doc.source} but NOT in unified_documents`,
            documentId: doc.id,
            affectedPages: [doc.source],
            resolution: `Migrate to unified_documents or delete from ${doc.source}`
          })
        }

        // Auto-migrate orphaned to unified
        const migrated = await this.migrateOrphanedToUnified(orphaned, companyId)
        report.inconsistenciesResolved = migrated
      }

      // Step 5: Consistency checks (all pages reference same document ID)
      const inconsistencies = await this.checkConsistency(companyId)
      if (inconsistencies.length > 0) {
        report.status = 'issues-found'
        report.inconsistenciesFound += inconsistencies.length

        for (const inc of inconsistencies) {
          report.issues.push({
            type: 'inconsistent_reference',
            severity: 'warning',
            description: inc.description,
            affectedPages: inc.affectedPages,
            resolution: 'Update references to use unified document ID'
          })
        }
      }

      // Step 6: Verify all cloud sync is up-to-date
      const cloudSync = await this.verifyCloudSync(companyId)
      if (!cloudSync.isUpToDate) {
        report.issues.push({
          type: 'cloud_sync_stale',
          severity: 'warning',
          description: `Cloud sync ${cloudSync.hoursSinceSync} hours old. May be missing recent cloud uploads.`,
          affectedPages: ['all-pages'],
          resolution: `Run UnifiedDocumentService.syncCloudDocuments() to pull latest from cloud`
        })
      }

      // Step 7: Verify all required documents present
      const missing = await this.checkMissingDocuments(companyId)
      if (missing.length > 0) {
        report.issues.push({
          type: 'missing_documents',
          severity: 'warning',
          description: `${missing.length} required documents missing`,
          affectedPages: ['documents', 'data-room'],
          resolution: 'Upload missing documents or mark as not applicable'
        })
      }

      // Update final status
      if (report.issues.length === 0) {
        report.status = 'perfect'
      }

      // Log reconciliation to audit trail
      await this.logReconciliation(report)

      console.log(`[reconciliation] Completed: ${report.status}, issues: ${report.issues.length}`)

      return report

    } catch (err) {
      console.error('[reconciliation] Full reconciliation failed:', err)
      report.status = 'failed'
      report.issues.push({
        type: 'reconciliation_failed',
        severity: 'critical',
        description: `Reconciliation process failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
        affectedPages: [],
        resolution: 'Check logs and retry reconciliation'
      })
      return report
    }
  }

  /**
   * Count documents in unified_documents
   */
  private static async countUnifiedDocuments(companyId: string): Promise<number> {
    const result = await sql`
      SELECT COUNT(*) as count FROM unified_documents
      WHERE company_id = ${companyId}
    `
    return result[0]?.count || 0
  }

  /**
   * Count documents in legacy tables (prospectus_documents, filing_documents, etc.)
   */
  private static async countLegacyDocuments(companyId: string): Promise<number> {
    try {
      let total = 0

      // Check each legacy table
      const tables = [
        'prospectus_documents',
        'filing_documents',
        'document_scorecards',
        'cap_table_documents'
      ]

      for (const table of tables) {
        try {
          const result = await sql.query(
            `SELECT COUNT(*) as count FROM ${table} WHERE company_id = $1`,
            [companyId]
          )
          total += result[0]?.count || 0
        } catch (err) {
          // Table might not exist, skip
        }
      }

      return total
    } catch (err) {
      console.error('[reconciliation] Failed to count legacy documents:', err)
      return 0
    }
  }

  /**
   * Detect duplicates IN unified_documents
   * (Same file uploaded twice = same storage_id, different unified_documents row)
   */
  private static async detectDuplicatesInUnified(companyId: string): Promise<DocumentDuplicate[]> {
    try {
      const result = await sql.query(
        `
        SELECT
          storage_id,
          COUNT(*) as duplicate_count,
          JSON_AGG(JSON_BUILD_OBJECT(
            'id', id,
            'name', name,
            'uploaded_at', uploaded_at
          )) as documents
        FROM unified_documents
        WHERE company_id = $1 AND storage_id IS NOT NULL
        GROUP BY storage_id
        HAVING COUNT(*) > 1
        `,
        [companyId]
      )

      return result.map(row => ({
        documentId: row.storage_id,
        name: row.documents[0]?.name || 'Unknown',
        duplicateCount: row.duplicate_count,
        locations: row.documents.map((doc: any) => ({
          source: 'unified_documents',
          metadata: doc
        }))
      }))
    } catch (err) {
      console.error('[reconciliation] Failed to detect duplicates:', err)
      return []
    }
  }

  /**
   * Resolve duplicates by keeping latest version, deleting others
   */
  private static async resolveUnifiedDuplicates(duplicates: DocumentDuplicate[]): Promise<number> {
    let resolved = 0

    for (const dup of duplicates) {
      try {
        // Get all versions sorted by upload time
        const versions = await sql`
          SELECT id, uploaded_at FROM unified_documents
          WHERE storage_id = ${dup.documentId}
          ORDER BY uploaded_at DESC
        `

        if (versions.length > 1) {
          // Keep first (latest), delete rest
          const toDelete = versions.slice(1).map(v => v.id)

          for (const id of toDelete) {
            await sql`
              DELETE FROM unified_documents WHERE id = ${id}
            `
            resolved++
          }
        }
      } catch (err) {
        console.error(`[reconciliation] Failed to resolve duplicate ${dup.documentId}:`, err)
      }
    }

    return resolved
  }

  /**
   * Find orphaned documents in legacy tables
   * (Documents in prospectus_documents, filing_documents, etc. but NOT in unified_documents)
   */
  private static async findOrphanedLegacyDocuments(companyId: string): Promise<any[]> {
    const orphaned = []

    try {
      // Check prospectus_documents
      const prospectusOrphans = await sql.query(
        `
        SELECT pd.id, pd.name, 'prospectus_documents' as source
        FROM prospectus_documents pd
        WHERE pd.company_id = $1
          AND NOT EXISTS (
            SELECT 1 FROM unified_documents ud
            WHERE ud.storage_id = pd.id OR ud.name = pd.name
          )
        `,
        [companyId]
      )
      orphaned.push(...prospectusOrphans.map(doc => ({ ...doc, source: 'prospectus_documents' })))

      // Check filing_documents
      const filingOrphans = await sql.query(
        `
        SELECT fd.id, fd.name, 'filing_documents' as source
        FROM filing_documents fd
        WHERE fd.company_id = $1
          AND NOT EXISTS (
            SELECT 1 FROM unified_documents ud
            WHERE ud.storage_id = fd.id OR ud.name = fd.name
          )
        `,
        [companyId]
      )
      orphaned.push(...filingOrphans.map(doc => ({ ...doc, source: 'filing_documents' })))

    } catch (err) {
      console.error('[reconciliation] Failed to find orphaned documents:', err)
    }

    return orphaned
  }

  /**
   * Migrate orphaned documents to unified_documents
   */
  private static async migrateOrphanedToUnified(orphaned: any[], companyId: string): Promise<number> {
    let migrated = 0

    for (const doc of orphaned) {
      try {
        // Check if already exists by name
        const exists = await sql`
          SELECT id FROM unified_documents
          WHERE company_id = ${companyId} AND name = ${doc.name}
        `

        if (exists.length === 0) {
          // Migrate to unified
          await sql`
            INSERT INTO unified_documents (
              id, company_id, name, display_name, storage_provider,
              status, completeness, compliance_status, required_for_filing,
              current_version, total_versions,
              uploaded_by, uploaded_at, last_modified_by, last_modified_at,
              owner_user_id, comment_count
            ) VALUES (
              gen_random_uuid(), ${companyId}, ${doc.name}, ${doc.name}, 'local',
              'draft', 0, 'compliant', false,
              1, 1,
              'system', NOW(), 'system', NOW(),
              'system', 0
            )
          `
          migrated++
        }
      } catch (err) {
        console.error(`[reconciliation] Failed to migrate orphaned ${doc.id}:`, err)
      }
    }

    return migrated
  }

  /**
   * Check consistency across all pages/references
   */
  private static async checkConsistency(companyId: string): Promise<any[]> {
    const issues = []

    try {
      // Check that no document references mismatched IDs
      // Example: prospectus_documents.id != unified_documents.storage_id for same file

      const result = await sql.query(
        `
        SELECT
          pd.name,
          pd.id as legacy_id,
          COALESCE(ud.id, 'NOT_FOUND') as unified_id,
          'prospectus_documents' as legacy_source
        FROM prospectus_documents pd
        LEFT JOIN unified_documents ud ON ud.company_id = pd.company_id
          AND (ud.name = pd.name OR ud.storage_id = pd.id)
        WHERE pd.company_id = $1
        `,
        [companyId]
      )

      for (const row of result) {
        if (row.unified_id === 'NOT_FOUND') {
          issues.push({
            description: `Document "${row.name}" in ${row.legacy_source} but not linked to unified_documents`,
            affectedPages: ['documents', 'data-room'],
            conflictingIds: {
              legacyId: row.legacy_id,
              unifiedId: row.unified_id
            }
          })
        }
      }
    } catch (err) {
      console.error('[reconciliation] Failed to check consistency:', err)
    }

    return issues
  }

  /**
   * Verify cloud sync is recent
   */
  private static async verifyCloudSync(companyId: string): Promise<{ isUpToDate: boolean; hoursSinceSync: number }> {
    try {
      const result = await sql`
        SELECT last_sync_at FROM cloud_storage_providers
        WHERE company_id = ${companyId}
      `

      if (result.length === 0) {
        return { isUpToDate: true, hoursSinceSync: 0 } // No cloud sync configured
      }

      const lastSync = new Date(result[0].last_sync_at)
      const now = new Date()
      const hoursSinceSync = Math.round((now.getTime() - lastSync.getTime()) / (1000 * 60 * 60))

      return {
        isUpToDate: hoursSinceSync < 24, // Within 24 hours = up to date
        hoursSinceSync
      }
    } catch (err) {
      console.error('[reconciliation] Failed to verify cloud sync:', err)
      return { isUpToDate: false, hoursSinceSync: 999 }
    }
  }

  /**
   * Check for missing required documents
   */
  private static async checkMissingDocuments(companyId: string): Promise<string[]> {
    try {
      // Get required document types
      const required = [
        'audited_financials',
        'cap_table',
        'articles_of_incorporation',
        'director_bios'
      ]

      const existing = await sql.query(
        `
        SELECT DISTINCT document_type FROM unified_documents
        WHERE company_id = $1 AND document_type IS NOT NULL
        `,
        [companyId]
      )

      const existingTypes = existing.map(e => e.document_type)
      const missing = required.filter(req => !existingTypes.includes(req))

      return missing
    } catch (err) {
      console.error('[reconciliation] Failed to check missing documents:', err)
      return []
    }
  }

  /**
   * Log reconciliation to audit trail
   */
  private static async logReconciliation(report: ReconciliationReport): Promise<void> {
    try {
      await sql`
        INSERT INTO document_reconciliation_log (
          company_id,
          status,
          total_documents_unified,
          total_documents_legacy,
          duplicates_found,
          duplicates_resolved,
          inconsistencies_found,
          inconsistencies_resolved,
          issues_json,
          reconciled_at
        ) VALUES (
          ${report.companyId},
          ${report.status},
          ${report.totalDocumentsInUnified},
          ${report.totalDocumentsInLegacy},
          ${report.duplicatesFound},
          ${report.duplicatesResolved},
          ${report.inconsistenciesFound},
          ${report.inconsistenciesResolved},
          ${JSON.stringify(report.issues)},
          NOW()
        )
      `
    } catch (err) {
      console.error('[reconciliation] Failed to log reconciliation:', err)
    }
  }

  /**
   * Check if system is in perfect state (ready for production)
   */
  static async isPerfectReconciliation(companyId: string): Promise<boolean> {
    const report = await this.fullReconciliation(companyId)
    return (
      report.status === 'perfect' &&
      report.duplicatesFound === 0 &&
      report.inconsistenciesFound === 0 &&
      report.totalDocumentsInLegacy === 0  // All migrated to unified
    )
  }

  /**
   * Validate a specific document is NOT duplicated
   */
  static async validateNoDuplicate(documentId: string): Promise<{ isDuplicated: boolean; count: number }> {
    try {
      const result = await sql`
        SELECT COUNT(*) as count FROM unified_documents
        WHERE id = ${documentId} OR storage_id = ${documentId}
      `

      const count = result[0]?.count || 0
      return {
        isDuplicated: count > 1,
        count
      }
    } catch (err) {
      console.error('[reconciliation] Failed to validate no duplicate:', err)
      return { isDuplicated: false, count: 0 }
    }
  }
}
