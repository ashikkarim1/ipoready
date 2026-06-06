import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForToken } from '@/lib/cloud-storage/google-drive-adapter'
import { sql } from '@/lib/db'

export const runtime = 'nodejs'

/**
 * GET /api/auth/google-drive/callback
 * Google OAuth2 callback - handles authorization code
 */
export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get('code')
    const state = request.nextUrl.searchParams.get('state')
    const error = request.nextUrl.searchParams.get('error')

    // Check for OAuth errors
    if (error) {
      return NextResponse.redirect(
        `/settings/integrations?error=google_drive_auth_denied`
      )
    }

    if (!code) {
      return NextResponse.redirect(
        `/settings/integrations?error=missing_auth_code`
      )
    }

    // Exchange authorization code for tokens
    const tokens = await exchangeCodeForToken(code)

    // Get current user/company from session
    // TODO: Implement session-based company ID retrieval
    const userId = request.cookies.get('userId')?.value
    const companyId = request.cookies.get('companyId')?.value

    if (!companyId) {
      return NextResponse.redirect(
        `/settings/integrations?error=no_company_selected`
      )
    }

    // Store OAuth tokens in cloud_storage_providers table
    const existing = await sql(
      `SELECT id FROM cloud_storage_providers WHERE company_id = $1`,
      [companyId]
    )

    if (existing.length > 0) {
      // Update existing record
      await sql(
        `UPDATE cloud_storage_providers
         SET provider_settings = jsonb_set(
           COALESCE(provider_settings, '{}'::jsonb),
           '{google_drive}',
           $1::jsonb
         ),
         enabled_providers = array_append(
           COALESCE(enabled_providers, '{}'),
           'google_drive'
         ),
         updated_at = CURRENT_TIMESTAMP
         WHERE company_id = $2`,
        [
          JSON.stringify({
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expiry_date: tokens.expiry_date,
            enabled: true,
          }),
          companyId,
        ]
      )
    } else {
      // Create new record
      await sql(
        `INSERT INTO cloud_storage_providers
         (company_id, enabled_providers, provider_settings, created_at, updated_at)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [
          companyId,
          ['google_drive'],
          JSON.stringify({
            google_drive: {
              access_token: tokens.access_token,
              refresh_token: tokens.refresh_token,
              expiry_date: tokens.expiry_date,
              enabled: true,
            },
          }),
        ]
      )
    }

    // Redirect to settings with success message
    return NextResponse.redirect(
      `/settings/integrations?success=google_drive_connected`
    )
  } catch (error) {
    console.error('Google Drive callback error:', error)
    return NextResponse.redirect(
      `/settings/integrations?error=google_drive_callback_failed`
    )
  }
}
