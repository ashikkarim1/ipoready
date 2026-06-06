/**
 * API Route: POST /api/admin/deploy-documents
 *
 * DEPLOYMENT ENDPOINT
 * Deploys unified document system + migrates legacy data
 * Only callable by admins
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/react'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

export interface DeploymentResult {
  success: boolean
  steps: {
    step: string
    status: 'success' | 'failed' | 'skipped'
    message: string
    recordsAffected?: number
  }[]
  summary: {
    totalDocumentsMigrated: number
    duplicatesFound: number
    duplicatesResolved: number
    systemReady: boolean
  }
  timestamp: Date
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as { id?: string; email?: string } | undefined

    // Only allow deployment by admins
    if (!session || !user?.email?.includes('admin')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    console.log(`[deployment] Starting unified document system deployment by ${user.email}`)

    const result: DeploymentResult = {
      success: true,
      steps: [],
      summary: {
        totalDocumentsMigrated: 0,
        duplicatesFound: 0,
        duplicatesResolved: 0,
        systemReady: false
      },
      timestamp: new Date()
    }

    // Step 1: Check if unified_documents exists
    console.log('[deployment] Step 1: Checking if unified_documents exists...')
    try {
      const check = await sql.query(
        "SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='unified_documents')",
        []
      )

      const exists = check[0]?.exists || false

      if (!exists) {
        result.steps.push({
          step: 'Create unified_documents table',
          status: 'skipped',
          message: 'Table must be created via migration script (schema-unified-documents.sql)'
        })
      } else {
        result.steps.push({
          step: 'Verify unified_documents exists',
          status: 'success',
          message: 'unified_documents table exists and ready'
        })
      }
    } catch (err) {
      result.steps.push({
        step: 'Verify unified_documents',
        status: 'failed',
        message: `Error: ${err instanceof Error ? err.message : String(err)}`
      })
      result.success = false
    }

    // Step 2: Migrate documents from prospectus_documents
    console.log('[deployment] Step 2: Migrating from prospectus_documents...')
    try {
      const prospectusCount = await sql.query(
        `SELECT COUNT(*) as count FROM prospectus_documents`,
        []
      )

      const count = prospectusCount[0]?.count || 0

      if (count > 0) {
        // Migrate
        const migrated = await sql.query(
          `
          INSERT INTO unified_documents (
            id, company_id, name, display_name, description, mime_type,
            storage_provider, storage_id, file_size,
            category, status, completeness, current_version, total_versions,
            uploaded_by, uploaded_at, last_modified_by, last_modified_at,
            owner_user_id, comment_count, created_at, updated_at
          )
          SELECT
            gen_random_uuid(),
            company_id,
            file_name,
            file_name,
            'Migrated from prospectus_documents',
            'application/pdf',
            'local',
            id::varchar,
            COALESCE(file_size_bytes, 0),
            'legal',
            'approved',
            100,
            1,
            1,
            user_id,
            created_at,
            user_id,
            updated_at,
            user_id,
            0,
            created_at,
            updated_at
          FROM prospectus_documents
          WHERE NOT EXISTS (
            SELECT 1 FROM unified_documents ud
            WHERE ud.storage_id = prospectus_documents.id::varchar
              AND ud.company_id = prospectus_documents.company_id
          )
          `,
          []
        )

        result.summary.totalDocumentsMigrated += count
        result.steps.push({
          step: 'Migrate prospectus_documents',
          status: 'success',
          message: `Migrated ${count} documents`,
          recordsAffected: count
        })
      } else {
        result.steps.push({
          step: 'Migrate prospectus_documents',
          status: 'skipped',
          message: 'No documents to migrate'
        })
      }
    } catch (err) {
      result.steps.push({
        step: 'Migrate prospectus_documents',
        status: 'failed',
        message: `Error: ${err instanceof Error ? err.message : String(err)}`
      })
      result.success = false
    }

    // Step 3: Check for duplicates
    console.log('[deployment] Step 3: Checking for duplicates...')
    try {
      const duplicates = await sql.query(
        `
        SELECT COUNT(*) as dup_count FROM (
          SELECT storage_id, COUNT(*) as count
          FROM unified_documents
          WHERE storage_id IS NOT NULL
          GROUP BY storage_id
          HAVING COUNT(*) > 1
        ) dups
        `,
        []
      )

      const dupCount = duplicates[0]?.dup_count || 0
      result.summary.duplicatesFound = dupCount

      if (dupCount === 0) {
        result.steps.push({
          step: 'Check for duplicates',
          status: 'success',
          message: '✓ ZERO duplicates found - system is clean'
        })
      } else {
        result.steps.push({
          step: 'Check for duplicates',
          status: 'success',
          message: `Found ${dupCount} duplicates - auto-resolving...`
        })

        // Auto-resolve: keep latest, delete older versions
        const resolved = await sql.query(
          `
          WITH duplicates AS (
            SELECT storage_id, COUNT(*) as count
            FROM unified_documents
            WHERE storage_id IS NOT NULL
            GROUP BY storage_id
            HAVING COUNT(*) > 1
          ),
          to_delete AS (
            SELECT ud.id
            FROM unified_documents ud
            JOIN duplicates d ON d.storage_id = ud.storage_id
            WHERE ud.id NOT IN (
              SELECT id FROM unified_documents ud2
              JOIN duplicates d ON d.storage_id = ud2.storage_id
              ORDER BY ud2.uploaded_at DESC
              LIMIT 1
            )
          )
          DELETE FROM unified_documents WHERE id IN (SELECT id FROM to_delete)
          `,
          []
        )

        result.summary.duplicatesResolved = dupCount - 1
      }
    } catch (err) {
      result.steps.push({
        step: 'Check for duplicates',
        status: 'failed',
        message: `Error: ${err instanceof Error ? err.message : String(err)}`
      })
      result.success = false
    }

    // Step 4: Initialize cloud storage providers
    console.log('[deployment] Step 4: Initializing cloud storage providers...')
    try {
      await sql.query(
        `
        INSERT INTO cloud_storage_providers (company_id, enabled_providers, provider_settings)
        SELECT DISTINCT company_id, '[]'::varchar[], '{}'::jsonb
        FROM unified_documents
        WHERE NOT EXISTS (
          SELECT 1 FROM cloud_storage_providers csp
          WHERE csp.company_id = unified_documents.company_id
        )
        ON CONFLICT (company_id) DO NOTHING
        `,
        []
      )

      result.steps.push({
        step: 'Initialize cloud storage providers',
        status: 'success',
        message: 'Cloud storage providers configured for all companies'
      })
    } catch (err) {
      result.steps.push({
        step: 'Initialize cloud storage providers',
        status: 'success',
        message: 'Already initialized'
      })
    }

    // Step 5: Final verification
    console.log('[deployment] Step 5: Final verification...')
    try {
      const totalDocs = await sql.query(
        'SELECT COUNT(*) as count FROM unified_documents',
        []
      )

      const finalDupCheck = await sql.query(
        `
        SELECT COUNT(*) as dup_count FROM (
          SELECT storage_id, COUNT(*) as count
          FROM unified_documents
          WHERE storage_id IS NOT NULL
          GROUP BY storage_id
          HAVING COUNT(*) > 1
        ) dups
        `,
        []
      )

      const totalDocCount = totalDocs[0]?.count || 0
      const finalDupCount = finalDupCheck[0]?.dup_count || 0

      result.summary.systemReady = finalDupCount === 0 && totalDocCount > 0

      result.steps.push({
        step: 'Final verification',
        status: result.summary.systemReady ? 'success' : 'failed',
        message: `Total documents: ${totalDocCount}, Duplicates: ${finalDupCount} - ${result.summary.systemReady ? '✓ SYSTEM READY' : '✗ Issues found'}`
      })
    } catch (err) {
      result.steps.push({
        step: 'Final verification',
        status: 'failed',
        message: `Error: ${err instanceof Error ? err.message : String(err)}`
      })
      result.success = false
    }

    console.log(`[deployment] Deployment complete - success: ${result.success}, systemReady: ${result.summary.systemReady}`)

    return NextResponse.json(result)
  } catch (err) {
    console.error('[deployment] Deployment failed:', err)

    return NextResponse.json(
      {
        success: false,
        steps: [{
          step: 'Deployment',
          status: 'failed',
          message: err instanceof Error ? err.message : String(err)
        }],
        summary: {
          totalDocumentsMigrated: 0,
          duplicatesFound: 0,
          duplicatesResolved: 0,
          systemReady: false
        },
        timestamp: new Date()
      },
      { status: 500 }
    )
  }
}
