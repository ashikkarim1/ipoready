/**
 * QuickBooks Integration Service
 * High-level service for OAuth, sync operations, and data transformation
 */

import { Decimal } from 'decimal.js';
import { QuickBooksClient, QBOAuthTokens, QBInvoice, QBBill, QBAccount, QBBalanceSheet } from './quickbooks-client';
import { sql } from '../db';
import {
  AccountingIntegration,
  AccountingSync,
  RawAccountingData,
  BalanceSheetData,
  ProfitAndLossData,
  BankAccountData,
  ValidationError,
  ValidationErrorType,
  ErrorCode,
  AccountingError,
} from '../types/accounting-integration';

export interface QuickBooksConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export class QuickBooksIntegrationService {
  private config: QuickBooksConfig;

  constructor(config: QuickBooksConfig) {
    this.config = config;
  }

  generateAuthUrl(state: string): string {
    return QuickBooksClient.getAuthorizationUrl(
      this.config.clientId,
      this.config.redirectUri,
      state
    );
  }

  async handleOAuthCallback(
    code: string,
    state: string,
    companyId: string,
    realmId: string
  ): Promise<AccountingIntegration> {
    try {
      const tokens = await QuickBooksClient.exchangeCodeForTokens(
        code,
        this.config.clientId,
        this.config.clientSecret,
        this.config.redirectUri
      );

      const tokenExpiresAt = new Date(Date.now() + tokens.expiresIn * 1000);

      const result = await sql<AccountingIntegration>`
        INSERT INTO accounting_integrations (
          company_id,
          platform,
          access_token_encrypted,
          refresh_token_encrypted,
          token_expires_at,
          realm_id,
          organization_name,
          sync_frequency,
          is_active,
          metadata
        )
        VALUES (
          ${companyId},
          'quickbooks',
          ${tokens.accessToken},
          ${tokens.refreshToken},
          ${tokenExpiresAt.toISOString()},
          ${tokens.realmId},
          ${'QB Organization'},
          'daily',
          true,
          ${{ oauth_token_type: tokens.tokenType }}
        )
        ON CONFLICT (company_id, platform)
        DO UPDATE SET
          access_token_encrypted = ${tokens.accessToken},
          refresh_token_encrypted = ${tokens.refreshToken},
          token_expires_at = ${tokenExpiresAt.toISOString()},
          is_active = true,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `;

      if (!result.length) {
        throw this.createError('AUTH_FAILED', 500, false, 'Failed to store OAuth tokens');
      }

      return result[0];
    } catch (error) {
      if (error instanceof Error && 'code' in error) {
        throw error;
      }
      throw this.createError('AUTH_FAILED', 500, false, error as Error);
    }
  }

  async startSync(
    integrationId: string,
    syncType: 'full' | 'incremental' | 'balance_sheet_only' | 'invoices_only' = 'incremental'
  ): Promise<AccountingSync> {
    try {
      const integrations = await sql<any>`
        SELECT * FROM accounting_integrations WHERE id = ${integrationId}
      `;

      if (!integrations.length) {
        throw this.createError('ACCOUNT_NOT_FOUND', 404, false, 'Integration not found');
      }

      const inProgressSyncs = await sql<any>`
        SELECT * FROM accounting_syncs
        WHERE integration_id = ${integrationId}
        AND status = 'in_progress'
      `;

      if (inProgressSyncs.length) {
        throw this.createError('SYNC_IN_PROGRESS', 409, false, 'Sync already in progress');
      }

      const syncRecords = await sql<AccountingSync>`
        INSERT INTO accounting_syncs (
          integration_id,
          status,
          sync_type,
          data_period_start,
          data_period_end
        )
        VALUES (
          ${integrationId},
          'in_progress',
          ${syncType},
          CURRENT_DATE - INTERVAL '90 days',
          CURRENT_DATE
        )
        RETURNING *
      `;

      if (!syncRecords.length) {
        throw this.createError('SYNC_FAILED', 500, false, 'Failed to create sync record');
      }

      return syncRecords[0];
    } catch (error) {
      if (error instanceof Error && 'code' in error) {
        throw error;
      }
      throw this.createError('SYNC_FAILED', 500, true, error as Error);
    }
  }

  async getSyncStatus(syncId: string): Promise<AccountingSync | null> {
    try {
      const results = await sql<AccountingSync>`
        SELECT * FROM accounting_syncs WHERE id = ${syncId}
      `;

      return results.length ? results[0] : null;
    } catch (error) {
      console.error('Failed to get sync status:', error);
      return null;
    }
  }

  async disconnect(integrationId: string): Promise<void> {
    try {
      await sql`
        UPDATE accounting_integrations
        SET
          is_active = false,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${integrationId}
      `;
    } catch (error) {
      throw this.createError('SYNC_FAILED', 500, false, error as Error);
    }
  }

  private createError(
    code: ErrorCode,
    statusCode?: number,
    retryable: boolean = false,
    originalError?: Error | string
  ): AccountingError {
    const message =
      typeof originalError === 'string'
        ? originalError
        : originalError instanceof Error
          ? originalError.message
          : 'Unknown error';

    const error = new Error(`QuickBooks error: ${code}. ${message}`) as AccountingError;

    error.code = code;
    error.statusCode = statusCode;
    error.retryable = retryable;
    error.timestamp = new Date();

    return error;
  }
}
