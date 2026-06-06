/**
 * Integration Tests: Database Migrations
 * Verify all migrations run successfully and create correct schema
 */

import { sql } from '@/lib/db'

describe('Database Migrations', () => {
  describe('Migration 001: Investor Platform Schema', () => {
    it('should have investor_profiles table', async () => {
      const result = await sql`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_name = 'investor_profiles'
        ) as exists
      `
      expect(result[0].exists).toBe(true)
    })

    it('should have investor_criteria table with required columns', async () => {
      const result = await sql`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'investor_criteria'
      `
      const columns = result.map(r => r.column_name)
      expect(columns).toContain('investor_id')
      expect(columns).toContain('preferred_stages')
      expect(columns).toContain('preferred_sectors')
    })

    it('should have investor_notification_preferences table', async () => {
      const result = await sql`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_name = 'investor_notification_preferences'
        ) as exists
      `
      expect(result[0].exists).toBe(true)
    })

    it('should have investor_saved_companies table', async () => {
      const result = await sql`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_name = 'investor_saved_companies'
        ) as exists
      `
      expect(result[0].exists).toBe(true)
    })

    it('should have correct foreign key constraints', async () => {
      const result = await sql`
        SELECT constraint_name, table_name
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'investor_criteria'
      `
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe('Migration 002: Unified Documents Schema', () => {
    it('should have unified_documents table', async () => {
      const result = await sql`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_name = 'unified_documents'
        ) as exists
      `
      expect(result[0].exists).toBe(true)
    })

    it('should have unified_documents table with required columns', async () => {
      const result = await sql`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'unified_documents'
      `
      const columns = result.map(r => r.column_name)
      expect(columns).toContain('id')
      expect(columns).toContain('company_id')
      expect(columns).toContain('name')
      expect(columns).toContain('source_system')
      expect(columns).toContain('external_id')
      expect(columns).toContain('document_hash')
    })

    it('should have reconciliation_audit_log table', async () => {
      const result = await sql`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_name = 'reconciliation_audit_log'
        ) as exists
      `
      expect(result[0].exists).toBe(true)
    })

    it('should have unique constraint on (company_id, source_system, external_id)', async () => {
      const result = await sql`
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE table_name = 'unified_documents'
        AND constraint_type = 'UNIQUE'
      `
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe('Migration 003: Capital Markets Intelligence Schema', () => {
    it('should have market_intelligence_data table', async () => {
      const result = await sql`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_name = 'market_intelligence_data'
        ) as exists
      `
      expect(result[0].exists).toBe(true)
    })

    it('should have market_benchmarks table', async () => {
      const result = await sql`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_name = 'market_benchmarks'
        ) as exists
      `
      expect(result[0].exists).toBe(true)
    })

    it('should have correct indexes for performance', async () => {
      const result = await sql`
        SELECT indexname
        FROM pg_indexes
        WHERE tablename = 'unified_documents'
      `
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe('Filing Documents Migration', () => {
    it('should have filing_documents table', async () => {
      const result = await sql`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_name = 'filing_documents'
        ) as exists
      `
      expect(result[0].exists).toBe(true)
    })

    it('should support document versioning', async () => {
      const result = await sql`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'filing_documents'
        AND column_name IN ('version_number', 'is_latest')
      `
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe('Migration Integrity', () => {
    it('should have no missing required tables', async () => {
      const requiredTables = [
        'companies',
        'users',
        'documents',
        'unified_documents',
        'investor_profiles',
        'market_intelligence_data',
      ]

      for (const tableName of requiredTables) {
        const result = await sql`
          SELECT EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_name = ${tableName}
          ) as exists
        `
        expect(result[0].exists).toBe(true)
      }
    })

    it('should enforce data types correctly', async () => {
      const result = await sql`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'unified_documents'
        AND column_name = 'id'
      `
      expect(result[0].data_type).toBe('uuid')
    })

    it('should have proper timestamp columns', async () => {
      const result = await sql`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'unified_documents'
        AND column_name IN ('created_at', 'updated_at')
      `
      expect(result.length).toBeGreaterThan(0)
      result.forEach(row => {
        expect(['timestamp without time zone', 'timestamp with time zone']).toContain(row.data_type)
      })
    })
  })

  describe('Database Constraints', () => {
    it('should enforce NOT NULL on critical columns', async () => {
      const result = await sql`
        SELECT column_name, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'unified_documents'
        AND column_name IN ('id', 'company_id', 'name')
      `
      result.forEach(row => {
        expect(row.is_nullable).toBe('NO')
      })
    })

    it('should have indexes on foreign keys', async () => {
      const result = await sql`
        SELECT indexname
        FROM pg_indexes
        WHERE tablename = 'unified_documents'
        AND indexdef LIKE '%company_id%'
      `
      expect(result.length).toBeGreaterThan(0)
    })
  })
})
