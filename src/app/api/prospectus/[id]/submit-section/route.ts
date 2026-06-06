import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import { z } from 'zod';

export const dynamic = 'force-dynamic'
const submitSectionSchema = z.object({
  sectionId: z.string().min(1, 'Section ID required'),
  content: z.string().min(1, 'Content required'),
  wordCount: z.number().int().positive().optional(),
});

type SubmitSectionInput = z.infer<typeof submitSectionSchema>;

/**
 * POST /api/prospectus/[id]/submit-section
 * Submit prospectus section for review
 * @requires Authentication
 * @body { sectionId, content, wordCount? }
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

    // Parse and validate request body
    const body = await request.json();
    const validation = submitSectionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { sectionId, content, wordCount } = validation.data;

    // Verify prospectus belongs to user's company
    const prospectusResult = (await sql`
      SELECT id, company_id FROM prospectuses WHERE id = ${prospectusId}
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

    // Verify section exists and belongs to this prospectus
    const sectionResult = (await sql`
      SELECT id, status FROM prospectus_sections WHERE id = ${sectionId} AND prospectus_id = ${prospectusId}
    `) as any[];

    if (!sectionResult || sectionResult.length === 0) {
      return NextResponse.json(
        { error: 'Section not found' },
        { status: 404 }
      );
    }

    // Update section with new content and mark for review
    const updateResult = (await sql`
      UPDATE prospectus_sections
      SET 
        content = ${content},
        word_count = ${wordCount || 0},
        status = 'in_review',
        completion_pct = 100,
        updated_at = NOW(),
        submitted_at = NOW()
      WHERE id = ${sectionId}
      RETURNING id, section_key, status, word_count, completion_pct, updated_at
    `) as any[];

    if (!updateResult || updateResult.length === 0) {
      return NextResponse.json(
        { error: 'Failed to submit section' },
        { status: 500 }
      );
    }

    const updatedSection = updateResult[0];

    // Log submission event
    await sql`
      INSERT INTO prospectus_events (
        prospectus_id, event_type, section_id, user_id, details, created_at
      )
      VALUES (${prospectusId}, 'section_submitted', ${sectionId}, ${(session.user as any).id}, ${JSON.stringify({ wordCount: wordCount || 0 })}, NOW())
    `;

    return NextResponse.json({
      success: true,
      section: {
        id: updatedSection.id,
        sectionKey: updatedSection.section_key,
        status: updatedSection.status,
        completionPct: updatedSection.completion_pct,
        wordCount: updatedSection.word_count,
        submittedAt: updatedSection.updated_at,
      },
    });
  } catch (error) {
    console.error('Error submitting section:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
