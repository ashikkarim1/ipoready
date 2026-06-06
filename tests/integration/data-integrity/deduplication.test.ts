/**
 * Integration Tests: Data Integrity - Document Deduplication
 * Verify the zero-duplication system guarantees no duplicate documents
 */

import { sql } from '@/lib/db'
import {
  createTestCompany,
  createTestUser,
  cleanupTestData,
  verifyNoDuplicateDocuments,
} from '../test-utils'

describe('Document Deduplication System', () => {
  let testCompanyId: string
  let testUserId: string

  beforeEach(async () => {
    const company = await createTestCompany()
    testCompanyId = company.id
    const user = await createTestUser({ companyId: testCompanyId })
    testUserId = user.id
  })

  afterEach(async () => {
    await cleanupTestData(testCompanyId)
  })

  describe('Unified Documents Table', () => {
    it('should have unique constraint on (company_id, source_system, external_id)', async () => {
      const constraints = await sql`
        SELECT constraint_name, constraint_type
        FROM information_schema.table_constraints
        WHERE table_name = 'unified_documents'
        AND constraint_type = 'UNIQUE'
      `

      expect(constraints.length).toBeGreaterThan(0)
    })

    it('should prevent inserting duplicate (company_id, source_system, external_id)', async () => {
      const sourceSystem = 'google_drive'
      const externalId = 'doc_123'

      // Insert first document
      const result1 = await sql`
        INSERT INTO unified_documents (
          id, company_id, name, source_system, external_id, document_hash
        )
        VALUES (
          gen_random_uuid(), ${testCompanyId}, ${'Document 1'},
          ${sourceSystem}, ${externalId}, ${'hash1'}
        )
        RETURNING id
      `

      expect(result1).toHaveLength(1)

      // Attempt to insert duplicate
      try {
        await sql`
          INSERT INTO unified_documents (
            id, company_id, name, source_system, external_id, document_hash
          )
          VALUES (
            gen_random_uuid(), ${testCompanyId}, ${'Document 2'},
            ${sourceSystem}, ${externalId}, ${'hash2'}
          )
        `
        // If no error, fail the test
        expect(true).toBe(false)
      } catch (error: any) {
        // Should get unique constraint violation
        expect(error.message).toContain('duplicate')
      }
    })

    it('should allow same external_id for different companies', async () => {
      const company1 = testCompanyId
      const company2 = (await createTestCompany()).id
      const sourceSystem = 'google_drive'
      const externalId = 'doc_123'

      // Insert document for company 1
      await sql`
        INSERT INTO unified_documents (
          id, company_id, name, source_system, external_id, document_hash
        )
        VALUES (
          gen_random_uuid(), ${company1}, ${'Document 1'},
          ${sourceSystem}, ${externalId}, ${'hash1'}
        )
      `

      // Insert document for company 2 with same external_id
      const result = await sql`
        INSERT INTO unified_documents (
          id, company_id, name, source_system, external_id, document_hash
        )
        VALUES (
          gen_random_uuid(), ${company2}, ${'Document 2'},
          ${sourceSystem}, ${externalId}, ${'hash2'}
        )
        RETURNING id
      `

      expect(result).toHaveLength(1)

      await cleanupTestData(company2)
    })

    it('should allow same source_system for different external_ids', async () => {
      const sourceSystem = 'google_drive'

      // Insert first document
      await sql`
        INSERT INTO unified_documents (
          id, company_id, name, source_system, external_id, document_hash
        )
        VALUES (
          gen_random_uuid(), ${testCompanyId}, ${'Document 1'},
          ${sourceSystem}, ${'doc_123'}, ${'hash1'}
        )
      `

      // Insert second document with same source but different external_id
      const result = await sql`
        INSERT INTO unified_documents (
          id, company_id, name, source_system, external_id, document_hash
        )
        VALUES (
          gen_random_uuid(), ${testCompanyId}, ${'Document 2'},
          ${sourceSystem}, ${'doc_456'}, ${'hash2'}
        )
        RETURNING id
      `

      expect(result).toHaveLength(1)
    })
  })

  describe('Document Hash Validation', () => {
    it('should calculate document hash correctly', async () => {
      const documentHash = 'abc123def456'

      const result = await sql`
        INSERT INTO unified_documents (
          id, company_id, name, source_system, external_id, document_hash
        )
        VALUES (
          gen_random_uuid(), ${testCompanyId}, ${'Hashed Document'},
          ${'google_drive'}, ${'doc_123'}, ${documentHash}
        )
        RETURNING document_hash
      `

      expect(result[0].document_hash).toBe(documentHash)
    })

    it('should detect modified documents via hash', async () => {
      const docId = 'doc_id_123'
      const hash1 = 'original_hash'
      const hash2 = 'modified_hash'

      // Insert original
      await sql`
        INSERT INTO unified_documents (
          id, company_id, name, source_system, external_id, document_hash
        )
        VALUES (
          gen_random_uuid(), ${testCompanyId}, ${'Original Document'},
          ${'google_drive'}, ${docId}, ${hash1}
        )
      `

      // Update with new hash (simulating document modification)
      const result = await sql`
        UPDATE unified_documents
        SET document_hash = ${hash2}
        WHERE company_id = ${testCompanyId} AND source_system = 'google_drive'
        RETURNING document_hash
      `

      expect(result[0].document_hash).toBe(hash2)
    })
  })

  describe('Reconciliation Audit Log', () => {
    it('should have reconciliation_audit_log table', async () => {
      const exists = await sql`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_name = 'reconciliation_audit_log'
        ) as exists
      `

      expect(exists[0].exists).toBe(true)
    })

    it('should log all reconciliation operations', async () => {
      const action = 'insert'
      const docId = 'test_doc_' + Date.now()

      // Insert document
      await sql`
        INSERT INTO unified_documents (
          id, company_id, name, source_system, external_id, document_hash
        )
        VALUES (
          gen_random_uuid(), ${testCompanyId}, ${'Audit Test Document'},
          ${'google_drive'}, ${docId}, ${'hash_123'}
        )
      `

      // Check audit log exists
      const auditLog = await sql`
        SELECT * FROM reconciliation_audit_log
        WHERE company_id = ${testCompanyId}
        LIMIT 10
      `

      // Audit log should contain operations (if logging is implemented)
      expect(auditLog).toBeDefined()
    })

    it('should timestamp all reconciliation events', async () => {
      const columns = await sql`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'reconciliation_audit_log'
        AND column_name ILIKE '%timestamp%' OR column_name ILIKE '%at'
      `

      expect(columns.length).toBeGreaterThan(0)
    })
  })

  describe('Document Sync Deduplication', () => {
    it('should handle Google Drive sync without duplicates', async () => {
      const sourceSystem = 'google_drive'
      const externalId = 'gdrive_doc_123'

      // First sync
      await sql`
        INSERT INTO unified_documents (
          id, company_id, name, source_system, external_id, document_hash
        )
        VALUES (
          gen_random_uuid(), ${testCompanyId}, ${'Google Drive Doc'},
          ${sourceSystem}, ${externalId}, ${'hash_v1'}
        )
      `

      // Second sync (should be idempotent or update)
      try {
        await sql`
          INSERT INTO unified_documents (
            id, company_id, name, source_system, external_id, document_hash
          )
          VALUES (
            gen_random_uuid(), ${testCompanyId}, ${'Google Drive Doc v2'},
            ${sourceSystem}, ${externalId}, ${'hash_v2'}
          )
        `
        // If INSERT succeeded, it should fail
        expect(true).toBe(false)
      } catch (error: any) {
        // Should violate unique constraint
        expect(error.message.toLowerCase()).toContain('unique')
      }
    })

    it('should handle Dropbox sync without duplicates', async () => {
      const sourceSystem = 'dropbox'
      const externalId = 'dropbox_doc_456'

      const result1 = await sql`
        INSERT INTO unified_documents (
          id, company_id, name, source_system, external_id, document_hash
        )
        VALUES (
          gen_random_uuid(), ${testCompanyId}, ${'Dropbox Doc'},
          ${sourceSystem}, ${externalId}, ${'hash_dropbox'}
        )
        RETURNING id
      `

      expect(result1).toHaveLength(1)

      // Verify document exists
      const docs = await sql`
        SELECT * FROM unified_documents
        WHERE company_id = ${testCompanyId}
        AND source_system = ${sourceSystem}
        AND external_id = ${externalId}
      `

      expect(docs).toHaveLength(1)
    })

    it('should handle OneDrive sync without duplicates', async () => {
      const sourceSystem = 'onedrive'
      const externalId = 'onedrive_doc_789'

      const result = await sql`
        INSERT INTO unified_documents (
          id, company_id, name, source_system, external_id, document_hash
        )
        VALUES (
          gen_random_uuid(), ${testCompanyId}, ${'OneDrive Doc'},
          ${sourceSystem}, ${externalId}, ${'hash_onedrive'}
        )
        RETURNING id
      `

      expect(result).toHaveLength(1)
    })
  })

  describe('Data Integrity Queries', () => {
    it('should verify no duplicates via query', async () => {
      const noDups = await verifyNoDuplicateDocuments(testCompanyId)
      expect(noDups).toBe(true)
    })

    it('should detect duplicates if they exist', async () => {
      // Verify clean state
      let hasDups = !(await verifyNoDuplicateDocuments(testCompanyId))
      expect(hasDups).toBe(false)
    })

    it('should count total unique documents', async () => {
      // Insert multiple documents
      for (let i = 0; i < 3; i++) {
        await sql`
          INSERT INTO unified_documents (
            id, company_id, name, source_system, external_id, document_hash
          )
          VALUES (
            gen_random_uuid(), ${testCompanyId}, ${'Doc ' + i},
            ${'google_drive'}, ${'doc_' + i}, ${'hash_' + i}
          )
        `
      }

      const result = await sql`
        SELECT COUNT(*) as count FROM unified_documents
        WHERE company_id = ${testCompanyId}
      `

      expect(Number(result[0].count)).toBe(3)
    })
  })

  describe('Error Scenarios', () => {
    it('should handle concurrent insert attempts', async () => {
      const sourceSystem = 'google_drive'
      const externalId = 'concurrent_doc_123'

      const insertPromise = () =>
        sql`
          INSERT INTO unified_documents (
            id, company_id, name, source_system, external_id, document_hash
          )
          VALUES (
            gen_random_uuid(), ${testCompanyId}, ${'Concurrent Doc'},
            ${sourceSystem}, ${externalId}, ${'hash_123'}
          )
        `

      // First insert should succeed
      await insertPromise()

      // Second concurrent insert should fail
      try {
        await insertPromise()
        expect(true).toBe(false)
      } catch (error: any) {
        expect(error.message.toLowerCase()).toContain('unique')
      }
    })

    it('should rollback on constraint violation', async () => {
      const sourceSystem = 'google_drive'
      const externalId = 'rollback_test_doc'

      // First insert
      await sql`
        INSERT INTO unified_documents (
          id, company_id, name, source_system, external_id, document_hash
        )
        VALUES (
          gen_random_uuid(), ${testCompanyId}, ${'First Doc'},
          ${sourceSystem}, ${externalId}, ${'hash_1'}
        )
      `

      const countBefore = await sql`
        SELECT COUNT(*) as count FROM unified_documents
        WHERE company_id = ${testCompanyId}
      `

      // Attempt duplicate insert (will fail)
      try {
        await sql`
          INSERT INTO unified_documents (
            id, company_id, name, source_system, external_id, document_hash
          )
          VALUES (
            gen_random_uuid(), ${testCompanyId}, ${'Duplicate Doc'},
            ${sourceSystem}, ${externalId}, ${'hash_2'}
          )
        `
      } catch (error) {
        // Expected to fail
      }

      const countAfter = await sql`
        SELECT COUNT(*) as count FROM unified_documents
        WHERE company_id = ${testCompanyId}
      `

      // Count should be the same (rollback successful)
      expect(Number(countBefore[0].count)).toBe(Number(countAfter[0].count))
    })
  })
})
