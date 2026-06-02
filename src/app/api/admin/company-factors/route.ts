import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db/client';
import { calculatePredictiveScore } from '@/lib/pace-predictor';

export const dynamic = 'force-dynamic';

/**
 * Admin API: Update Company PACE Input Factors
 *
 * PATCH /api/admin/company-factors
 *
 * Updates company factors that feed into the PACE predictive scoring model:
 * - Cash runway (months)
 * - Team size
 * - CFO hiring date
 * - Board size
 * - Auditor selected
 * - Investor sophistication score (1-10)
 *
 * Request body:
 * {
 *   "companyId": "uuid",
 *   "cash_runway_months": 12,
 *   "team_size": 45,
 *   "cfo_hired_at": "2024-01-15",
 *   "board_size": 5,
 *   "auditor_selected": true,
 *   "investor_sophistication_score": 8
 * }
 *
 * Response:
 * {
 *   "id": "uuid",
 *   "name": "Company Name",
 *   "pace_score": 72,
 *   "cash_runway_months": 12,
 *   "team_size": 45,
 *   "cfo_hired_at": "2024-01-15",
 *   "board_size": 5,
 *   "auditor_selected": true,
 *   "investor_sophistication_score": 8,
 *   "updated_at": "2024-06-01T10:30:00Z"
 * }
 */

export async function PATCH(request: NextRequest) {
  try {
    // Verify user is authenticated
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized: Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate companyId is provided
    if (!body.companyId) {
      return NextResponse.json(
        { error: 'Bad request: companyId is required' },
        { status: 400 }
      );
    }

    // Verify user is admin for this company
    // Check if user is system admin OR if user is admin for the specific company
    const userRole = (session.user as any).role;
    const userCompanyId = (session.user as any).companyId;

    if (userRole !== 'system_admin') {
      // Non-system admins must own the company
      if (userCompanyId !== body.companyId) {
        return NextResponse.json(
          { error: 'Forbidden: Not admin for this company' },
          { status: 403 }
        );
      }
    }

    // Validate input fields
    const validationError = validateFactors(body);
    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      );
    }

    // Check if company exists
    const existingCompany = await sql`
      SELECT id, name, pace_score FROM companies WHERE id = ${body.companyId}
    `;

    if (existingCompany.length === 0) {
      return NextResponse.json(
        { error: 'Not found: Company does not exist' },
        { status: 404 }
      );
    }

    // Update company with new factors
    const updatedCompanyResult = await sql`
      UPDATE companies
      SET
        cash_runway_months = COALESCE(${body.cash_runway_months ?? null}::float, cash_runway_months),
        team_size = COALESCE(${body.team_size ?? null}::integer, team_size),
        cfo_hired_at = COALESCE(${body.cfo_hired_at ? new Date(body.cfo_hired_at).toISOString().split('T')[0] : null}::date, cfo_hired_at),
        board_size = COALESCE(${body.board_size ?? null}::integer, board_size),
        auditor_selected = COALESCE(${body.auditor_selected ?? null}::boolean, auditor_selected),
        investor_sophistication_score = COALESCE(${body.investor_sophistication_score ?? null}::integer, investor_sophistication_score),
        updated_at = NOW()
      WHERE id = ${body.companyId}
      RETURNING
        id,
        name,
        pace_score,
        cash_runway_months,
        team_size,
        cfo_hired_at,
        board_size,
        auditor_selected,
        investor_sophistication_score,
        updated_at
    `;

    if (updatedCompanyResult.length === 0) {
      return NextResponse.json(
        { error: 'Internal error: Update failed' },
        { status: 500 }
      );
    }

    const updatedCompany = updatedCompanyResult[0];

    // Recalculate PACE score using predictive model
    let newPaceScore = updatedCompany.pace_score;
    try {
      const factors = {
        cashRunwayMonths: updatedCompany.cash_runway_months,
        teamSize: updatedCompany.team_size,
        cfoHired: updatedCompany.cfo_hired_at !== null,
        boardSize: updatedCompany.board_size,
        auditorSelected: updatedCompany.auditor_selected,
        investorSophisticationScore: updatedCompany.investor_sophistication_score,
        preIpoFunding: null,
      };
      const prediction = await calculatePredictiveScore(
        body.companyId,
        updatedCompany.pace_score,
        factors
      );
      newPaceScore = prediction.adjustedPace;

      // Update company with new PACE score
      await sql`
        UPDATE companies
        SET pace_score = ${newPaceScore}, updated_at = NOW()
        WHERE id = ${body.companyId}
      `;
    } catch (scoreError) {
      console.error('Warning: Failed to recalculate PACE score:', scoreError);
      // Continue with old score rather than failing the entire request
    }

    console.log(`✅ Updated company factors for ${updatedCompany.name}`);
    console.log(`   Cash runway: ${updatedCompany.cash_runway_months} months`);
    console.log(`   Team size: ${updatedCompany.team_size}`);
    console.log(`   CFO hired at: ${updatedCompany.cfo_hired_at || 'Not set'}`);
    console.log(`   Board size: ${updatedCompany.board_size}`);
    console.log(`   Auditor selected: ${updatedCompany.auditor_selected ? 'Yes' : 'No'}`);
    console.log(`   Investor sophistication: ${updatedCompany.investor_sophistication_score || 'Not set'}/10`);
    console.log(`   New PACE score: ${newPaceScore}`);

    return NextResponse.json(
      {
        id: updatedCompany.id,
        name: updatedCompany.name,
        pace_score: newPaceScore,
        cash_runway_months: updatedCompany.cash_runway_months,
        team_size: updatedCompany.team_size,
        cfo_hired_at: updatedCompany.cfo_hired_at,
        board_size: updatedCompany.board_size,
        auditor_selected: updatedCompany.auditor_selected,
        investor_sophistication_score: updatedCompany.investor_sophistication_score,
        updated_at: updatedCompany.updated_at,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error updating company factors:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Validate input factors
 */
function validateFactors(body: any): string | null {
  // Validate cash_runway_months
  if (body.cash_runway_months !== undefined) {
    if (typeof body.cash_runway_months !== 'number' || body.cash_runway_months < 0) {
      return 'Bad request: cash_runway_months must be a number >= 0';
    }
  }

  // Validate team_size
  if (body.team_size !== undefined) {
    if (!Number.isInteger(body.team_size) || body.team_size < 1) {
      return 'Bad request: team_size must be an integer >= 1';
    }
  }

  // Validate cfo_hired_at
  if (body.cfo_hired_at !== undefined && body.cfo_hired_at !== null) {
    if (typeof body.cfo_hired_at !== 'string') {
      return 'Bad request: cfo_hired_at must be an ISO 8601 date string';
    }
    // Check if it's a valid date
    const date = new Date(body.cfo_hired_at);
    if (isNaN(date.getTime())) {
      return 'Bad request: cfo_hired_at must be a valid ISO 8601 date';
    }
  }

  // Validate board_size
  if (body.board_size !== undefined) {
    if (!Number.isInteger(body.board_size) || body.board_size < 0) {
      return 'Bad request: board_size must be an integer >= 0';
    }
  }

  // Validate auditor_selected
  if (body.auditor_selected !== undefined) {
    if (typeof body.auditor_selected !== 'boolean') {
      return 'Bad request: auditor_selected must be a boolean';
    }
  }

  // Validate investor_sophistication_score
  if (body.investor_sophistication_score !== undefined) {
    if (!Number.isInteger(body.investor_sophistication_score) || 
        body.investor_sophistication_score < 1 || 
        body.investor_sophistication_score > 10) {
      return 'Bad request: investor_sophistication_score must be an integer between 1 and 10';
    }
  }

  return null;
}

/**
 * GET handler to retrieve current company factors
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized: Not authenticated' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json(
        { error: 'Bad request: companyId query parameter is required' },
        { status: 400 }
      );
    }

    // Verify user has access to this company
    const userRole = (session.user as any).role;
    const userCompanyId = (session.user as any).companyId;

    if (userRole !== 'system_admin' && userCompanyId !== companyId) {
      return NextResponse.json(
        { error: 'Forbidden: Not authorized to view this company' },
        { status: 403 }
      );
    }

    const result = await sql`
      SELECT
        id,
        name,
        pace_score,
        cash_runway_months,
        team_size,
        cfo_hired_at,
        board_size,
        auditor_selected,
        investor_sophistication_score,
        updated_at
      FROM companies
      WHERE id = ${companyId}
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Not found: Company does not exist' },
        { status: 404 }
      );
    }

    const company = result[0];

    return NextResponse.json(
      {
        id: company.id,
        name: company.name,
        pace_score: company.pace_score,
        cash_runway_months: company.cash_runway_months,
        team_size: company.team_size,
        cfo_hired_at: company.cfo_hired_at,
        board_size: company.board_size,
        auditor_selected: company.auditor_selected,
        investor_sophistication_score: company.investor_sophistication_score,
        updated_at: company.updated_at,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error retrieving company factors:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
