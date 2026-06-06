import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import { z } from 'zod';

export const dynamic = 'force-dynamic'
/**
 * GET /api/prospectus/[id]/progress
 * Fetch prospectus progress and approval state
 * @requires Authentication
 */
export async function GET(
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

    // Fetch prospectus
    const prospectusResult = (await sql`
      SELECT id, company_id, exchange_id, form_type, status, completion_pct
      FROM prospectuses
      WHERE id = ${prospectusId}
    `) as any[];

    if (!prospectusResult || prospectusResult.length === 0) {
      return NextResponse.json(
        { error: 'Prospectus not found' },
        { status: 404 }
      );
    }

    const prospectus = prospectusResult[0];

    // Verify access (user's company must match)
    if (prospectus.company_id !== (session.user as any).companyId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Fetch sections with status and completion
    const sectionsResult = (await sql`
      SELECT 
        id, section_key, status, completion_pct, word_count,
        estimated_hours, priority, created_at, updated_at
      FROM prospectus_sections
      WHERE prospectus_id = ${prospectusId}
      ORDER BY priority ASC, section_key ASC
    `) as any[];

    const sections = sectionsResult || [];

    // Compute approval state (count pending/approved/inReview)
    const approvalCounts = sections.reduce(
      (acc, sec) => {
        if (sec.status === 'pending') acc.pending++;
        else if (sec.status === 'approved') acc.approved++;
        else if (sec.status === 'in_review') acc.inReview++;
        return acc;
      },
      { pending: 0, approved: 0, inReview: 0 }
    );

    // Get next 5 sections to work on (not approved)
    const nextSections = sections
      .filter((s) => s.status !== 'approved')
      .slice(0, 5)
      .map((s) => ({
        id: s.id,
        sectionKey: s.section_key,
        status: s.status,
        completionPct: s.completion_pct,
        priority: s.priority,
        estimatedHours: s.estimated_hours,
      }));

    // Calculate timeline (days until estimated completion)
    const totalEstimatedHours = sections.reduce((sum, s) => sum + (s.estimated_hours || 0), 0);
    const estimatedDaysRemaining = Math.ceil(totalEstimatedHours / 8);
    const estimatedCompletionDate = new Date();
    estimatedCompletionDate.setDate(estimatedCompletionDate.getDate() + estimatedDaysRemaining);

    const response = {
      prospectusId: prospectus.id,
      companyId: prospectus.company_id,
      exchangeId: prospectus.exchange_id,
      formType: prospectus.form_type,
      status: prospectus.status,
      progress: {
        overallCompletionPct: prospectus.completion_pct,
        sectionCount: sections.length,
        approvalState: {
          pending: approvalCounts.pending,
          approved: approvalCounts.approved,
          inReview: approvalCounts.inReview,
        },
      },
      sections: sections.map((s) => ({
        id: s.id,
        sectionKey: s.section_key,
        status: s.status,
        completionPct: s.completion_pct,
        wordCount: s.word_count,
        estimatedHours: s.estimated_hours,
        priority: s.priority,
      })),
      nextSections,
      timeline: {
        estimatedDaysRemaining,
        estimatedCompletionDate: estimatedCompletionDate.toISOString().split('T')[0],
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching prospectus progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
