import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import { z } from 'zod';

const extractDocumentsSchema = z.object({
  documentIds: z.array(z.string().min(1)).min(1, 'At least one document required'),
  format: z.enum(['pdf', 'docx', 'markdown']).default('pdf'),
  includeMetadata: z.boolean().default(true),
});

type ExtractDocumentsInput = z.infer<typeof extractDocumentsSchema>;

/**
 * POST /api/prospectus/[id]/extract-documents
 * Extract and compile prospectus documents for export
 * Handles document extraction and routes to appropriate sections
 * @requires Authentication
 * @body { documentIds, format?, includeMetadata? }
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{  id: string  }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const params = await context.params;
    const prospectusId = params.id;
    if (!prospectusId) {
      return NextResponse.json(
        { error: 'Missing prospectus ID' },
        { status: 400 }
      );
    }

    // Parse and validate request
    const body = await request.json();
    const validation = extractDocumentsSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { documentIds, format, includeMetadata } = validation.data;

    // Verify prospectus belongs to user's company
    const prospectusResult = (await sql`
      SELECT id, company_id, form_type, status FROM prospectuses WHERE id = ${prospectusId}
    `) as any[];

    if (!prospectusResult || prospectusResult.length === 0) {
      return NextResponse.json(
        { error: 'Prospectus not found' },
        { status: 404 }
      );
    }

    const prospectus = prospectusResult[0];
    if (prospectus.company_id !== (session.user as any).companyId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Only allow extraction of approved sections
    const sectionsResult = (await sql`
      SELECT 
        id, section_key, content, status, completion_pct, word_count,
        created_at, updated_at, approved_at
      FROM prospectus_sections
      WHERE prospectus_id = ${prospectusId} AND status = 'approved'
      ORDER BY priority ASC
    `) as any[];
    
    // Filter to requested documents
    const allSections = sectionsResult || [];
    const approvedDocumentIds = new Set(documentIds);
    const sectionsToExtract = allSections.filter((s: any) => approvedDocumentIds.has(s.id));
    const approvedSections = sectionsToExtract.length > 0 ? sectionsToExtract : allSections;

    if (approvedSections.length === 0) {
      return NextResponse.json(
        { error: 'No approved sections found for extraction' },
        { status: 400 }
      );
    }

    // Build document compilation
    const compiledDocument = {
      prospectusId,
      formType: prospectus.form_type,
      extractedAt: new Date().toISOString(),
      format,
      metadata: includeMetadata ? {
        companyId: prospectus.company_id,
        totalSections: approvedSections.length,
        totalWordCount: approvedSections.reduce((sum, s) => sum + (s.word_count || 0), 0),
        status: prospectus.status,
      } : undefined,
      sections: approvedSections.map((s) => ({
        id: s.id,
        sectionKey: s.section_key,
        content: s.content,
        wordCount: s.word_count,
        status: s.status,
        completionPct: s.completion_pct,
        approvedAt: s.approved_at,
      })),
    };

    // Log extraction event
    await sql`
      INSERT INTO prospectus_events (
        prospectus_id, event_type, user_id, details, created_at
      )
      VALUES ($1, 'documents_extracted', $2, $3, NOW())
    `, [
      prospectusId,
      (session.user as any).id,
      JSON.stringify({ 
        documentCount: approvedSections.length,
        format,
        documentIds,
      }),
    ];

    // Generate download URL or token
    // In production, this would generate a signed URL or temporary token
    const extractionToken = Buffer.from(
      JSON.stringify({
        prospectusId,
        timestamp: Date.now(),
        format,
      })
    ).toString('base64');

    return NextResponse.json({
      success: true,
      extraction: {
        extractionId: extractionToken,
        prospectusId,
        format,
        sectionsExtracted: approvedSections.length,
        totalWordCount: approvedSections.reduce((sum, s) => sum + (s.word_count || 0), 0),
        downloadUrl: `/api/prospectus/${prospectusId}/export?token=${extractionToken}`,
      },
      document: compiledDocument,
    });
  } catch (error) {
    console.error('Error extracting documents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
