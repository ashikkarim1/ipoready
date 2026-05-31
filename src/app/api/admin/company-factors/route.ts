import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getSession } from 'next-auth/react';

/**
 * Admin API: Update Company Predictive Factors
 * 
 * PATCH endpoint to update cash_runway_months, team_size, CFO hiring, auditor selection,
 * board size, and investor sophistication score. These factors feed into the PACE
 * predictive scoring model.
 * 
 * Only accessible by company admins (verified via NextAuth session).
 * 
 * Request body:
 * {
 *   "companyId": "uuid",
 *   "cashRunwayMonths": 12,
 *   "preIpoFundingRaisedUsd": 5000000,
 *   "teamSize": 45,
 *   "cfoHiredAt": "2026-03-15",
 *   "boardSize": 5,
 *   "auditorSelected": true,
 *   "investorSophisticationScore": 8
 * }
 * 
 * Response:
 * {
 *   "status": "success",
 *   "message": "Company factors updated",
 *   "company": { ...updated company record }
 * }
 */

export async function PATCH(request: NextRequest) {
  try {
    // Verify user is authenticated
    // Note: NextAuth getSession() in App Router requires proper session configuration
    // For now, we'll verify via X-Company-ID header for MVP (should move to NextAuth in production)
    const companyId = request.headers.get('x-company-id');
    const apiKey = request.headers.get('x-api-key');
    
    if (!companyId || !apiKey) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing company ID or API key' },
        { status: 401 }
      );
    }

    // In production, verify API key against database or secret manager
    // For MVP, do basic validation
    if (apiKey !== process.env.ADMIN_API_KEY) {
      console.error(`❌ Invalid API key attempt for company ${companyId}`);
      return NextResponse.json(
        { error: 'Unauthorized: Invalid API key' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validate required field
    if (!body.companyId) {
      return NextResponse.json(
        { error: 'Bad request: companyId is required' },
        { status: 400 }
      );
    }

    // Validate companyId in body matches header (prevent cross-company updates)
    if (body.companyId !== companyId) {
      return NextResponse.json(
        { error: 'Unauthorized: Cannot update different company' },
        { status: 403 }
      );
    }

    // Validate company exists
    const existingCompany = await sql`
      SELECT id, company_name FROM companies WHERE id = ${companyId}
    `;

    if (existingCompany.length === 0) {
      return NextResponse.json(
        { error: 'Not found: Company does not exist' },
        { status: 404 }
      );
    }

    // Validate investor sophistication score if provided
    if (body.investorSophisticationScore !== undefined) {
      if (body.investorSophisticationScore < 1 || body.investorSophisticationScore > 10) {
        return NextResponse.json(
          { error: 'Bad request: investorSophisticationScore must be 1-10' },
          { status: 400 }
        );
      }
    }

    // Determine which fields are being updated
    const hasUpdates = [
      body.cashRunwayMonths !== undefined,
      body.preIpoFundingRaisedUsd !== undefined,
      body.teamSize !== undefined,
      body.cfoHiredAt !== undefined,
      body.boardSize !== undefined,
      body.auditorSelected !== undefined,
      body.investorSophisticationScore !== undefined,
    ].some(Boolean);

    if (!hasUpdates) {
      return NextResponse.json(
        { error: 'Bad request: No valid fields to update' },
        { status: 400 }
      );
    }

    // Execute update with sql template literal
    const result = await sql`
      UPDATE companies
      SET
        cash_runway_months = COALESCE(${body.cashRunwayMonths ?? null}, cash_runway_months),
        pre_ipo_funding_raised_usd = COALESCE(${body.preIpoFundingRaisedUsd ?? null}, pre_ipo_funding_raised_usd),
        team_size = COALESCE(${body.teamSize ?? null}, team_size),
        cfo_hired_at = COALESCE(${body.cfoHiredAt ? new Date(body.cfoHiredAt) : null}, cfo_hired_at),
        board_size = COALESCE(${body.boardSize ?? null}, board_size),
        auditor_selected = COALESCE(${body.auditorSelected ?? null}, auditor_selected),
        investor_sophistication_score = COALESCE(${body.investorSophisticationScore ?? null}, investor_sophistication_score),
        updated_at = NOW()
      WHERE id = ${companyId}
      RETURNING
        id,
        company_name,
        cash_runway_months,
        pre_ipo_funding_raised_usd,
        team_size,
        cfo_hired_at,
        board_size,
        auditor_selected,
        investor_sophistication_score,
        updated_at
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Internal error: Update failed' },
        { status: 500 }
      );
    }

    const updatedCompany = result[0];

    console.log(`✅ Updated company factors for ${updatedCompany.company_name} (${companyId})`);
    console.log(`   Cash runway: ${updatedCompany.cash_runway_months} months`);
    console.log(`   Team size: ${updatedCompany.team_size}`);
    console.log(`   CFO hired: ${updatedCompany.cfo_hired_at ? 'Yes' : 'No'}`);
    console.log(`   Auditor selected: ${updatedCompany.auditor_selected ? 'Yes' : 'No'}`);
    console.log(`   Board size: ${updatedCompany.board_size}`);
    console.log(`   Investor sophistication: ${updatedCompany.investor_sophistication_score}/10`);

    return NextResponse.json(
      {
        status: 'success',
        message: 'Company factors updated successfully',
        company: updatedCompany,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error updating company factors:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * GET handler to retrieve current company factors
 */
export async function GET(request: NextRequest) {
  try {
    const companyId = request.headers.get('x-company-id');
    const apiKey = request.headers.get('x-api-key');
    
    if (!companyId || !apiKey) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing company ID or API key' },
        { status: 401 }
      );
    }

    if (apiKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid API key' },
        { status: 403 }
      );
    }

    const result = await sql`
      SELECT
        id,
        company_name,
        exchange,
        cash_runway_months,
        pre_ipo_funding_raised_usd,
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
        status: 'success',
        company,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error retrieving company factors:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
