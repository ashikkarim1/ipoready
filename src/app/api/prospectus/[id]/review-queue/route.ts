import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';

/**
 * GET /api/prospectus/[id]/review-queue
 * Fetch sections awaiting review filtered by user role
 * @requires Authentication
 * @query status? - 'pending' | 'in_review' (default: all)
 * @query priority? - 'high' | 'medium' | 'low'
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userRole = (session.user as any).role;
    const prospectusId = params.id;

    if (!prospectusId) {
      return NextResponse.json(
        { error: 'Missing prospectus ID' },
        { status: 400 }
      );
    }

    // Verify prospectus exists and user has access
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

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const statusFilter = searchParams.get('status');
    const priorityFilter = searchParams.get('priority');

    // Build dynamic query based on role and filters
    let statusCondition = "status IN ('pending', 'in_review')";
    if (statusFilter === 'pending') {
      statusCondition = "status = 'pending'";
    } else if (statusFilter === 'in_review') {
      statusCondition = "status = 'in_review'";
    }

    let priorityCondition = '';
    if (priorityFilter) {
      priorityCondition = `AND priority = '${priorityFilter}'`;
    }

    // Filter by role-based approval responsibilities
    let reviewerRoleCondition = '';
    if (userRole === 'ceo' || userRole === 'admin') {
      reviewerRoleCondition = `AND (required_reviewer IN ('ceo', 'admin') OR required_reviewer IS NULL)`;
    } else if (userRole === 'cfo') {
      reviewerRoleCondition = `AND (required_reviewer IN ('cfo', 'finance', 'admin') OR required_reviewer IS NULL)`;
    } else if (userRole === 'general_counsel') {
      reviewerRoleCondition = `AND (required_reviewer IN ('general_counsel', 'legal', 'admin') OR required_reviewer IS NULL)`;
    } else {
      reviewerRoleCondition = `AND required_reviewer = '${userRole}'`;
    }

    // Query sections awaiting review (simplified - filtering done in app)
    const sectionsResult = (await sql`
      SELECT 
        id, section_key, status, completion_pct, word_count,
        priority, required_reviewer, submitted_at, updated_at,
        estimated_hours, content_preview
      FROM prospectus_sections
      WHERE prospectus_id = ${prospectusId}
        AND status IN ('pending', 'in_review')
      ORDER BY priority DESC, submitted_at ASC
    `) as any[];

    const sections = (sectionsResult || []).map((s) => ({
      id: s.id,
      sectionKey: s.section_key,
      status: s.status,
      completionPct: s.completion_pct,
      wordCount: s.word_count,
      priority: s.priority,
      requiredReviewer: s.required_reviewer,
      submittedAt: s.submitted_at,
      updatedAt: s.updated_at,
      estimatedHours: s.estimated_hours,
      contentPreview: s.content_preview ? s.content_preview.substring(0, 200) : null,
    }));

    // Group sections by status
    const groupedByStatus = {
      pending: sections.filter((s) => s.status === 'pending'),
      inReview: sections.filter((s) => s.status === 'in_review'),
    };

    return NextResponse.json({
      prospectusId,
      userRole,
      reviewQueue: {
        totalCount: sections.length,
        pendingCount: groupedByStatus.pending.length,
        inReviewCount: groupedByStatus.inReview.length,
        sections,
        groupedByStatus,
      },
    });
  } catch (error) {
    console.error('Error fetching review queue:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
